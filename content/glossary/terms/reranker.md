---
title: 重排序器
slug: reranker
---

# 重排序器

**Reranker（重排序器 / 精排模型）** 是现代搜索引擎和 RAG（检索增强生成）系统中的「第二阶段排序模型」，用于在第一阶段召回（Recall，通常是 BM25 关键词检索或 Bi-Encoder 向量相似度检索）返回的 Top-K（通常 50~~200 条）候选结果基础上，做更精细、更准确的相关性打分，选出 Top-N（通常 3~~20 条）送给下游生成或展示。

Reranker 是 RAG 系统「检索精度提升最大、成本增加最少」的性价比神器——工业界经验：**召回 + Reranker 的两阶段架构，相比纯向量检索，RAG Context Precision 提升 15~35%，Faithfulness 同步提升 10 个百分点**。

## 为什么必须要 Reranker？「召回快但不准，精排准但不快」

### 单阶段检索的问题

#### 方案 A：纯 BM25（关键词匹配）

- 优点：快、便宜、毫秒级百万文档
- 致命缺点：**词汇不匹配 = 完全搜不到**
- 例子：用户问「怎么给 iPhone 充电」，文档写「为苹果智能手机进行电池补给操作」→ 关键词零重叠 → BM25 相关性 0

#### 方案 B：纯 Bi-Encoder 向量检索（双塔相似度）

```
Query Encoder（BGE / E5）→ e_q ∈ R^1024       文档 Encoder（BGE / E5）→ e_d_i ∈ R^1024
                    ↘ similarity = cos(e_q, e_d_i) ↙
```

- 优点：语义匹配，解决了上面的词汇不匹配问题
- **致命缺点：双塔语义粗糙，只能捕捉「整体语义近似」，无法做细粒度对齐**
  - 例：Query「iPhone 15 Pro Max 电池更换官方价格是多少？」
    - Doc A：「iPhone 15 系列 Pro Max 机型电池官方维修价格 688 元，保修期内免费」→ **真正相关 ✅**
    - Doc B：「苹果公司最新发布的 iPhone 15 Pro Max 测评，续航测试成绩优异」→ **语义近似（都是 iPhone 15 Pro Max 相关）但完全不回答价格问题 ❌**
  - 向量相似度：Doc A 和 Doc B 都 ~0.82，分不出高下
- 根本原因：**文档和 Query 在编码阶段互相没见过对方**，独立编码后只能做相似度，没有交互注意力。

### 两阶段架构 = 兼顾速度 + 精度

```
海量文档库（100 万 ~ 1 亿条）
        │
        ▼
【一阶段：召回 Recall】（快但粗）
BM25 + 向量 ANN（HNSW / IVF-Flat）混合检索
→ 毫秒级返回 Top-100 候选（召回率要高，允许混一些不相关的）
        │
        ▼
【二阶段：重排 Rerank】（准但慢）
Cross-Encoder Reranker 对 (query, doc_1), (query, doc_2), ...
(query, doc_100) 逐一做深度交叉注意力打分
→ 选出 Top-10 相关性最高的文档送给下游 LLM
        │
        ▼
生成 / 展示（Context Precision 显著提升）
```

**第一阶段要的是「召回率」（宁可错杀一千不可放过一个，目标正确的文档最好都在 Top-100 里）；第二阶段要的是「精确率」（排到前面的必须个个都有用）。**

## Cross-Encoder Reranker 的原理——「让 Query 和文档做深度交互」

### 架构对比：Bi-Encoder（召回用）vs Cross-Encoder（重排用）

| 维度           | Bi-Encoder（双塔）                                                   | Cross-Encoder（交叉编码器）                                                           |
| -------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **架构**       | Query 和 Doc 各走一个 Encoder（可以共享权重）→ 两个独立向量 → cosine | **Query 和 Doc 拼接后一起输入同一个 Encoder**，中间有完整的多头自注意力 + 交叉注意力  |
| **相似度计算** | 编码结束后做点积 / cosine，**模型中没有交互**                        | 模型内部通过 <[BOS_never_used_51bce0c785ca2f68081bfa7d91973934]> token 输出做交互打分 |
| **编码时机**   | 文档可以提前离线编码好（百万文档提前算好向量存 Milvus）              | **文档不能提前编码**，必须等 Query 来了之后，(query, doc_i) 一对一对现场算分          |
| **时间复杂度** | 1 次 Query 编码 + N 次向量点积（FAISS 加速）→ 毫秒级百万级           | **100 次完整 Transformer 前向传播（每对一次）** → 比召回慢 100~1000 倍                |
| **精度上限**   | 中（语义相似度近似）                                                 | **高（细粒度词级对齐，能识别否定、数字、实体匹配）**                                  |
| **适合位置**   | 一阶段召回 Top-50~200                                                | 二阶段精排 Top-10                                                                     |

### Cross-Encoder 内部工作流

```
输入拼接（长度 L = L_query + L_doc + 3 个特殊符号）：
<[BOS_never_used_51bce0c785ca2f68081bfa7d91973934]> [CLS] Query_tokens [SEP] Document_tokens [SEP]
                          ↓
               N 层 Transformer Encoder
        （每层每一层 Q-K-V 做 Query↔文档、Query↔Query、文档↔文档
         全交互注意力 = 「每个词都看得到对方所有词」）
                          ↓
             <[BOS_never_used_51bce0c785ca2f68081bfa7d91973934]> 位置输出向量 h<[BOS_never_used_51bce0c785ca2f68081bfa7d91973934]> ∈ R^d
                          ↓
              Linear + Sigmoid 分类头（二分类）
                          ↓
              Score（0~1 之间的相关性分数）
```

**为什么 Cross-Encoder 更准？**

- 它能建模否定词：「不要退货」vs「可以退货」→ Bi-Encoder 向量距离极近（embedding 把否定词冲淡了）→ Cross-Encoder 中「不」这个 token 会强烈 Attend 到「退货」→ 打分会差很多
- 它能精确匹配实体和数字：Query 中的「iPhone 15 Pro Max」「688 元」可以分别 Attend 到文档中的对应位置 → 每对对应上的实体/数字都会贡献高分
- 它能理解多跳关系：Query「买 iPhone 15 电池更换 + 保修期内」→ Cross-Encoder 可以看到文档中「保修期内」修饰的「免费」具体对应的是不是「电池更换」

## 主流 Reranker 模型选型

| 模型                                    | 出品方                     | 架构                                  | 最大长度 | 特点                                             | 推荐场景                                 |
| --------------------------------------- | -------------------------- | ------------------------------------- | -------- | ------------------------------------------------ | ---------------------------------------- |
| **monoT5**                              | Google Research            | T5 Encoder-Decoder（生成 true/false） | 512      | 开山鼻祖，通用效果好                             | 研究 baseline                            |
| **cross-encoder/ms-marco-MiniLM-L6-v2** | Sentence-Transformers 官方 | MiniLM-L6（6 层，22M 参数）           | 512      | **小、快、英文 MS MARCO 榜单**                   | 英文场景、对延迟敏感                     |
| **BAAI/bge-reranker-v2-m3**             | 智源 BAAI 团队             | BERT-Large（330M）+ 多语言            | **8192** | **中文 RAG 首选！** 多语言支持、长上下文、多粒度 | 中文/中英混合 RAG 系统（工业界用量最大） |
| **bge-reranker-large**                  | 智源 BAAI                  | BERT-Large                            | 512      | 中文效果 SOTA 之一                               | 短文档中文 RAG                           |
| **Cohere Rerank v3**                    | Cohere（商业 API）         | 商业大模型私有                        | **4096** | 英文效果极佳，API 调用开箱即用                   | 不想自己部署的团队                       |
| **Jina Reranker v2**                    | Jina AI                    | 自研                                  | **8192** | 开源，8k 长文档，代码能力强                      | 长文档/代码库 RAG                        |
| **RankZephyr / RankLLaMA**              | LLaMA 家族                 | 用 LLM 当 Reranker（Listwise 排序）   | 4096+    | 用强 LLM 7B 当裁判重排，效果逼近 Cross-Encoder   | 对成本不敏感、追求极限精度               |

> **工业落地推荐**：中文场景无脑选 **bge-reranker-v2-m3**（又好又快又开源又长），英文场景选 Cohere Rerank v3 API，预算少就 MiniLM-L6-v2。

## Reranker 快速上手（3 行代码）

### 方式一：Sentence-Transformers CrossEncoder（最常用）

```python
from sentence_transformers import CrossEncoder

# 加载中文 Reranker 首选
reranker = CrossEncoder("BAAI/bge-reranker-v2-m3", device="cuda")

query = "iPhone 15 Pro Max 官方更换电池多少钱？"
docs = [
    "苹果官方宣布 iPhone 15 系列电池维修价格：Pro Max 机型为 688 元，普通版为 528 元，保修期内非人为损坏免费。",  # ✅ 完美答案
    "苹果 iPhone 15 Pro Max 深度评测：A17 Pro 芯片性能、续航、拍照全面评测。",                        # ❌ 不相关价格
    "iPhone 15 和 iPhone 14 电池容量对比：15 Pro Max 为 4441mAh，相比上代提升 12%。",               # ❌ 不相关更换价格
    "2024 年智能手机电池市场报告：头部品牌官方维修成本平均在 30~90 美元之间，苹果处于高端价位。",        # ⚠️ 间接相关
]

# 直接打分（CrossEncoder.predict 内部会自动做 (query, doc_i) 拼接 + 前向）
scores = reranker.predict([(query, doc) for doc in docs], apply_softmax=False)
# scores = [8.72, -3.21, -0.89, 2.44]  ← 越高越相关

# 按分数降序重排
docs_reranked = [doc for _, doc in sorted(zip(scores, docs), reverse=True)]
```

### 方式二：FlagEmbedding 原生调用（BAAI 官方，更快）

```python
from FlagEmbedding import FlagReranker
reranker = FlagReranker('BAAI/bge-reranker-v2-m3', use_fp16=True)

# 批量打分 + 截断控制
scores = reranker.compute_score(
    pairs=[(query, doc) for doc in docs],
    max_length=8192,        # 最大长度，截断文档尾部
    normalize=False,        # 要不要做 Sigmoid 归一到 [0,1]，False = 原始 logit
    batch_size=64,          # 批大小，显存够就开大点
)
```

### 方式三：vLLM + RankLLM（用 LLM 当重排器，效果最好但最贵）

```python
from rank_llm.rerank.rankllm import RankLLM
from rank_llm.rerank.rank_gpt import SafeOpenai

agent = SafeOpenai(model="gpt-4o-mini", context_size=4096)
# 让 LLM 对召回的 100 条文档重排序号，Prompt 中显式输出 [3, 1, 5, ...]
# 英文 RAG 极限精度，比 CrossEncoder 高 5~10% nDCG
```

## RAG 系统中的 Reranker 工程最佳实践

### 实践 1：「混合召回 + Reranker」三段式（效果最好）

不要只用向量召回，混合召回三路结果再 Rerank：

```
用户 Query → QueryRewrite（同义词改写/纠错）
                │
                ├─ BM25（关键词检索）→ Top-50
                ├─ 稠密向量（BGE-m3）ANN → Top-50
                └─ 稀疏向量（Splade / BM25+dense 融合）→ Top-30
                │
                ▼
            Reciprocal Rank Fusion（RRF 分数融合合并三路 → 去重）
                │
                ▼
            合并得到 Top-100 候选（三路结果取并集去重）
                │
                ▼
            bge-reranker-v2-m3 批量打分
                │
                ▼
            取 Top-5 → 拼接 Context → 喂给 LLM 生成
```

经验：**三段式（BM25+向量+Reranker）比纯向量单路 Context Precision 高 20~30%**。

### 实践 2：长文档分块后的「窗口 Rerank + 相邻段合并」

RAG 文档分块 512 token 一段，Query 召回并 Rerank 后：

```
Chunk 17：...电池保修期内，苹果公司提供免费维修服务...（score=8.9）✅
Chunk 18：...的具体适用范围：包括电池鼓包、续航骤降、不充电等故障。（score=1.2）
Chunk 19：...此外，iPhone 15 系列官方更换电池的价格如下：Pro Max 688 元...（score=9.5）✅
Chunk 20：...普通 15 为 528 元，Plus 为 588 元。（score=3.1）
```

→ Chunk 17 讲免费条件，Chunk 19 讲价格，两者在原文中相邻，但被拆成两段后 Rerank 得分都很高，Chunk 18/20 是相邻尾部。

**工程优化**：

1. Rerank 选 Top-K chunk 后
2. 看文档元数据，把相邻 chunk 的内容合并起来（chunk 17 和 chunk 18/19/20 其实原文连在一起）
3. 合并后用 Reranker 重新打分 + 去重冗余
4. 最终送到 LLM 时保留完整上下文，避免「信息被拆断在两半导致 LLM 理解错误」

→ **Faithfulness 又能再涨 5~8 个百分点**。

### 实践 3：批处理 + 异步 + GPU 部署，把 Rerank 延迟压下去

Rerank 是 RAG 延迟最大的瓶颈之一（Top-100 打分在 A10 上 ~150ms）。

优化清单：

| 优化手段                                          | 效果                                         |
| ------------------------------------------------- | -------------------------------------------- |
| **batch_size=64**（Top-100 分两批）               | 相比 batch_size=1 延迟降 60%                 |
| FP16 推理 + CUDA Graph                            | 延迟再降 20%                                 |
| ONNX + TensorRT 量化 INT8                         | 精度掉 1%，延迟再降 50%                      |
| Query 改写缓存：相同 Query 直接拿之前 Top-10 结果 | 热点 query 零延迟                            |
| 多路召回 + Rerank 异步并发跑                      | 召回 100 个 doc 的同时先 Rerank 前 50 个到的 |

最终 A10 GPU 典型值：**Top-100 文档 512 长度，Rerank 端到端 120ms**，用户基本感知不到。

### 实践 4：Rerank 阈值截断（「相关性不够就不要硬塞」）

不要永远取 Top-5，**Reranker 分数太低的文档宁可不送**，硬塞给 LLM 就是把噪声塞进去诱发幻觉。

```python
# 动态截断策略：
scores = reranker.compute_score(...)
# 方法一：阈值截断
docs_final = [(doc, s) for doc, s in zip(docs, scores) if s > 1.0]
# 方法二：相对分数截断（Top1 分数 S1，Top2 必须 ≥ S1 - 3.0 才保留）
# 方法三：结合 LLM 上下文窗口动态决定要几个
#  10k 上下文 → 取 8 个；4k 上下文 → 取 4 个
```

工程经验：**「宁可少给，不要乱给」**——塞垃圾上下文 Faithfulness 掉得比「信息不够让 LLM 追问」快得多。

### 实践 5：领域微调（用你自己的标注数据再训 2 个 Epoch）

通用 Reranker 在你的垂直领域（医疗/法律/代码）可能水土不服：

```
用 Sentence-Transformers 官方的 CrossEncoder.fit() 做微调：
- 正样本：用户真实 Query + 被用户点击/人工标注过相关的 doc
- 困难负样本：BM25/向量检索出来 Top 但人工确认不相关的 doc（hard negatives 极其重要！）
- 损失函数：CrossEntropyLoss（对比学习 [q, d+, d-] 三元组）
- Epoch：只要 1~3 轮（防止过拟合）
- 学习率：2e-5（低学习率只微调顶层）
```

典型收益：**nDCG@10 在自有业务数据集上涨 5~15%**，投入产出比极高。

## Reranker 效果评测指标

Reranker 本身的效果（不看 RAG 生成端）用 IR 经典指标：

| 指标                             | 公式                                          | 含义                                                             |
| -------------------------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| **nDCG@k**（归一化折损累计增益） | DCG@k / IDCG@k（IDCG 是理想排序下的最大 DCG） | 考虑相关性等级（5 级标注），位置越靠前权重越大，**最常用最综合** |
| **MRR@k**（平均倒数排名）        | 1 / rank（第一个正确答案的排名） 求平均       | 只关心「第一个正确结果排在哪里」，导航类搜索常用                 |
| **Recall@k**                     | Top-k 中命中的正确答案 / 全部正确答案         | 和 RAG 的 Context Recall 直接正相关                              |
| **Precision@k**                  | Top-k 中正确答案数量 / k                      | 只看前 k 个里准不准，对应 RAG Context Precision                  |

评测工具：

```python
from ranx import Qrels, Run, evaluate
# qrels = {query_id: {doc_id: 相关性评级 0~4}}
# run = {query_id: {doc_id: Reranker 打分}}
metrics = evaluate(qrels, run, ["ndcg@10", "mrr@10", "recall@20", "precision@5"])
```

Reranker 迭代的原则：**只要 nDCG@10 能稳定涨 2 个点，RAG 端 Faithfulness 几乎一定同步涨**。

## 常见陷阱与误区

### 陷阱 1：Rerank 文档顺序直接按打分拼 Prompt = 错！

Reranker 给了分数排序，不代表 Prompt 里要把最高分文档放第一个。

**正确做法**：

- 把相关文档按「主题聚类」拼在一起（同一主题的放一起）
- 总分最高的主题放最前面
- Prompt 中给文档加编号 【Doc 1】...【Doc 10】，方便 LLM 引用
- 如果有表格/流程图，把它们放对应文字描述后面

### 陷阱 2：召回只取 20 个就 Rerank = Rerank 没用

Rerank 作用是「从 100 个候选中挑 10 个最好的」，你只给 20 个 → 其中可能根本没有正确文档 → Rerank 再神也没用。

**黄金规则**：召回阶段的 Recall@100 必须 ≥ 95%（意味着 100 个候选里至少有 95% 的正确文档都在），Reranker 才能发挥作用。召回没做好就去怪 Rerank = 本末倒置。

### 陷阱 3：用 bge-reranker-v2 时不做 Query 改写

用户输入口语化 Query 是 Reranker 的难点（「哎呀我这个 iPhone 电池好像不行了你们官方换一个贵不贵啊」）。

**Query 预处理三板斧**：

1. 缩写展开（「电池」→「官方更换电池的价格和保修条款」）
2. 口语化去噪（去掉哎呀、哦、啊等语气词）
3. 歧义消解（用 LLM 重写成标准查询：「苹果官方为 iPhone 15 系列更换电池的收费标准和保修期政策是什么？」）

Reranker 看到改写后的标准 Query，打分准确率涨一大截。

### 陷阱 4：Rerank 模型 max_length 太小 = 关键信息被截断

老一代 Reranker 都是 512，现在长文档 RAG 建议直接上 **bge-reranker-v2-m3 / Jina Reranker v2**（8192 长度）：

- 技术白皮书、法律合同、医药说明书这种一篇几千字的长文
- 512 截断时最关键的「价格/保修条款」部分刚好被砍掉 = 错误排序

## 未来方向

1. **LLM-as-Reranker（Listwise 大模型排序）**：未来强 LLM 做 Listwise 排序（不是 Pairwise 打分），一次性看完 Top-100 后输出完整排序。结合多轮思考，准确率逼近人类标注员。
2. **多模态 Reranker**：图文文档库 RAG（多模态 RAG）→ 多模态 Reranker 输入 (text_query, text_doc, image_doc) → 统一打分，跨模态判断相关性
3. **端侧 Reranker**：手机/PC 本地 RAG（隐私敏感文档）→ 30M 参数量级 INT4 量化 MiniLM Reranker 跑在 CPU 上，毫秒级响应
4. **动态个性化 Rerank**：同一 query 不同用户看到的排序不同（结合用户历史画像/身份/权限做 Rerank，例如普通员工看不到高管文档自动降权）

Reranker 是 RAG 系统中「被严重低估了价值」的组件。很多团队花几个月调 Embedding、调 Prompt、调 Chunk 策略，**却从来没加过 Reranker**——加一个 Reranker + 混合召回，通常就是 RAG 质量提升性价比最高的「第一刀」。

经验总结：如果你现在的 RAG 还没上 Reranker，先别折腾别的了，上 BAAI/bge-reranker-v2-m3 看看 RAGAS 报告，你会感谢自己。

相关术语：[RAG](/glossary/rag)、[多模态RAG](/glossary/multimodal-rag)、[LLM评估-RAGAS](/glossary/llm-eval-ragas)、[Transformer](/glossary/transformer)、[长上下文窗口](/glossary/long-context-window)
