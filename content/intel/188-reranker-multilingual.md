---
title: 多语种 Reranker 与 BGE-Reranker/Cohere 实战
category: nlp
summary: 向量召回只解决「粗筛」，Reranker 解决「精排」。详解 Cross-Encoder 架构的 Reranker 原理，对比 BGE-Reranker v3、Cohere Rerank 3 等多语种方案，并用真实数据集完整跑通召回+重排两阶段 RAG。
difficulty: intermediate
excerpt: 向量召回只解决「粗筛」，Reranker 解决「精排」。详解 Cross-Encoder 架构的 Reranker 原理，对比 BGE-Reranker v3、Cohere Rerank 3 等多语种方案，并用真实数据集完整跑通召回+重排两阶段 RAG。
relatedTerms:
  - transformer
  - rag
  - reranker
  - chain-of-thought
  - speech-asr
relatedTools:
  - huggingface-transformers
  - langchain
  - numpy
  - ollama
relatedNodes:
  - nlp-rnn
  - llm-inference
  - llm-finetune
---

## 为什么你要学它

做 RAG 系统的人几乎都踩过同一个坑：Embedding 向量召回的 Top 10 文档里，真正和问题相关的往往排在第 3、第 5、甚至第 8 位——你只取 Top 3 喂给 LLM，关键文档就被漏掉了，回答自然答不对。

为什么向量召回排不准？因为 **Bi-Encoder（双塔 Embedding 模型）是「分别编码 query 和 document，再算内积相似度」**，它的优点是快（文档向量可以离线预处理），但代价是 query 和 doc 在编码时没有机会「看对方一眼」，匹配只能基于粗粒度的语义相似度。当遇到以下场景时就会翻车：

- 用户问「怎么退货」，文档里写的是「退换货政策及售后流程」——语义接近但用词完全不同，Embedding 相似度拉不开
- 中英混合场景：用户用英文问「return policy」，文档里是中文退货政策——多语种 Embedding 的跨语言相似度总是差一截
- 专业术语匹配：用户说「肺结节磨玻璃密度影」，文档里写的是「GGN（Ground-Glass Nodule）影像学表现」——Embedding 未必能学到术语对应关系

工业界的标准答案是**两阶段检索架构**：

```
Stage 1（粗筛/召回，Recall 优先）：Bi-Encoder 向量召回，从 100 万文档中快速取出 Top 50~100
                   ↓ 这一步追求不要漏，允许有噪声
Stage 2（精排/Rerank，Precision 优先）：Cross-Encoder Reranker，
         把 Query 和每篇候选文档拼接成一对输入，逐个打分，重新排序取 Top 3~5
                   ↓ 这一步追求排得准，慢一点没关系（只有 50~100 对）
```

加入 Reranker 之后，在大多数 RAG 基准测试上（如 MTEB Retrieval、BEIR），**NDCG@10 能提升 10%~30%**，带来的效果增益远大于换一个更好的 Embedding 模型。对于多语种场景，专门训练的多语种 Reranker 提升更明显（20%+ 很常见）。

本文讲清楚三件事：Reranker 原理是什么、主流多语种模型选型对比（BGE-Reranker vs Cohere Rerank 3 vs Jina Reranker）、以及端到端的代码实战。

## 一句话概览

- **Bi-Encoder vs Cross-Encoder**：前者分别编码快但粗，后者拼接成对逐个打分慢但准；前者做召回，后者做精排
- **Reranker 的输入格式**：`<[BOS_never_used_51bce0c785ca2f68081bfa7d91973934]> query [SEP] doc_text [SEP]`，输出一个 0~1 之间的相关度分数（或 logits）
- **多语种选型**：开源首选 BAAI/bge-reranker-v2-m3（支持 100+ 语种，中英文都强），商用 API 首选 Cohere Rerank 3（中英日韩等 100+ 语种）
- **工程落地的关键参数**：召回 Top_k 取 50~~100 送 Reranker，Reranker 输出 Top_n 取 3~~5 送 LLM；长文档要用 Sliding Window 切分后再打分

## 核心拆解

### 🔑 Cross-Encoder Reranker 为什么比 Embedding 准

我们从模型架构层面看两者的区别：

**Bi-Encoder（Embedding 模型）**：

```
Query "退货政策"    → Encoder → 768维向量 q ──┐
                                               ├─ 内积/余弦 = 相似度分数
Document "退换货..." → Encoder → 768维向量 d ──┘
```

两个 Encoder 可以是同一个（对称）或不同（非对称），但**编码过程互相独立，没有任何信息交互**。匹配只能靠「q 和 d 在向量空间里是否挨得近」，丢失了细粒度的词级别匹配信号。

**Cross-Encoder（Reranker 模型）**：

```
 <[BOS_never_used_51bce0c785ca2f68081bfa7d91973934]> "退货政策" [SEP] "退换货政策：签收后7天内凭订单号..." [SEP]
                            ↓
                     Cross-Encoder Transformer
                    （每一层 Attention 中，query 的 token 可以直接 attend 到 doc 的 token，反之亦然）
                            ↓
                <[BOS_never_used_51bce0c785ca2f68081bfa7d91973934]> 位置接一个 Linear + Sigmoid → 输出相关度分数 0~1
```

Cross-Encoder 的核心优势：**把 Query 和 Document 拼接成一对，一起送进 Transformer**。每一层的 Self-Attention 都让 Query 中的每个词能「看见」Document 中的每个词，反之亦然——这意味着它可以学到「policy ↔ 政策」「return ↔ 退货」这种细粒度的术语对应关系，打分自然比 Embedding 的粗粒度内积准得多。

代价是速度：每一对 (Query, Doc) 都要过一遍完整的 Transformer，复杂度 O(N)。如果把 100 万篇文档全部喂给 Cross-Encoder，一次查询要等半小时。所以工业界永远是「Embedding 召回 100 篇 → Cross-Encoder 精排 100 篇」的组合，用 2 倍延迟换 20% 精度提升。

### 🔑 主流多语种 Reranker 选型对比

2024 年下半年的多语种 Reranker 第一梯队（按 MTEB 100+ 语种综合排序）：

| 模型                      | 开源/商用          | 参数量             | 支持语种 | MTEB 平均 NDCG@10  | 特点                                                                     |
| ------------------------- | ------------------ | ------------------ | -------- | ------------------ | ------------------------------------------------------------------------ |
| **BGE-Reranker-v2-m3**    | 开源（MIT）        | 568M               | 100+     | 62.3               | 智源研究院出品，中英双语极强，多语种综合最优开源选择，支持 8192 长上下文 |
| **BGE-Reranker-Lite**     | 开源（MIT）        | 22M                | 100+     | 58.1               | 轻量版，速度是 m3 的 5~8 倍，适合对延迟敏感的场景，精度略低              |
| **Jina Reranker v2**      | 开源（Apache 2.0） | 130M / 270M / 568M | 100+     | 60.7 / 61.5 / 62.0 | 三档尺寸可选，对长文档（8k/32k）优化，代码质量好                         |
| **Cohere Rerank 3**       | 商用 API           | -                  | 100+     | 64.1               | 目前综合效果最强，API 调用简单，适合不想自部署的团队                     |
| **bge-reranker-v2-gemma** | 开源               | 2B                 | 100+     | 63.5               | 基于 Gemma 2B，参数量大效果更强，但推理延迟高                            |

**选型建议**：

- 预算有限、想自部署：首推 `BAAI/bge-reranker-v2-m3`（中文场景无敌，多语种也很强）
- 对延迟要求极高、实时对话场景：`BAAI/bge-reranker-lite` 或 Jina Reranker v2 Base（130M）
- 不差钱、要最好效果、不想运维 GPU：Cohere Rerank 3 API
- 长文档检索（单篇文档 > 4k tokens）：Jina Reranker v2（原生 32k 优化）

### 🔑 Reranker 的推理技巧

**1. 批量推理（Batching）**

Reranker 一次打分 50 对和 1 对的延迟差别不大（GPU 并行）。一定要把召回的 N 篇文档攒成一个 batch 一次性送进去，不要写 for 循环逐个推理。

**2. 混合精度 + Flash Attention**

在 Ampere 以上架构（A10/A100/RTX 3090+），用 FP16 + Flash Attention 可以把 Reranker 的速度提升 2~4 倍，显存占用减半。

**3. 长文档 Sliding Window**

如果单篇文档超过了 Reranker 的最大长度（如 bge-m3 是 8192 token），不要粗暴截断前 8k，而是用滑动窗口切分，每个窗口打一个分，取最高的那个窗口分数当整篇文档的分数：

```
文档长度 20000 token，窗口 8192，步长 4096：
  Window 1: [0, 8192)    → score 0.82
  Window 2: [4096, 12288) → score 0.91  ← 最高
  Window 3: [8192, 16384) → score 0.55
  Window 4: [12288, 20480)→ score 0.30
─────────────────────────────────────────
  整篇文档的 Reranker 分数 = max(各窗口分数) = 0.91
```

这样不会丢失文档后半段可能包含的关键信息。

**4. 分数校准 + 阈值过滤**

不同 Reranker 模型的分数分布不一样。比如 bge-m3 的相关文档通常打 0.6 以上，不相关的低于 0.2；Cohere 的分数可能在 0~1 之间均匀分布。上线前一定要拿你的评测集跑一遍，画一个 Precision-Recall 曲线，找一个合适的分数阈值（比如低于 0.3 的直接丢弃，不送进 LLM 上下文），能减少噪声、节省 Token。

## 完整跑通方案：召回 + Rerank 两阶段 RAG

### 第一步：环境准备

```bash
# PyTorch 按你的 CUDA 版本选
pip install torch==2.4.0 --index-url https://download.pytorch.org/whl/cu121

# 向量库 + 数据集 + Reranker
pip install faiss-gpu sentence-transformers transformers datasets flash-attn --no-build-isolation

# 商用 API 备选
pip install cohere
```

### 第二步：加载多语种 Reranker

```python
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from typing import List

class BGEReranker:
    """BGE-Reranker-v2-m3 封装，支持批量推理 + 滑动窗口"""

    def __init__(self, model_name="BAAI/bge-reranker-v2-m3", device="cuda"):
        self.device = device
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            attn_implementation="flash_attention_2",  # 安培以上 GPU 开启
        ).to(device).eval()
        self.max_length = 8192
        self.stride = 4096  # Sliding Window 步长

    @torch.no_grad()
    def compute_score(self, query: str, docs: List[str], batch_size: int = 16) -> List[float]:
        """
        给 (query, doc) 批量打分。长 doc 自动 Sliding Window。
        返回每个 doc 的分数（长度 = len(docs)），分数越高越相关。
        """
        all_pairs = []
        doc_map = []  # 每个 pair 属于第几个 doc，用于后续聚合 max

        # Step 1: 对长 doc 做滑动窗口，生成所有 (query, window) 对
        for doc_idx, doc in enumerate(docs):
            tokenized_doc = self.tokenizer(
                doc, add_special_tokens=False, truncation=False, return_tensors="pt"
            )
            doc_len = tokenized_doc.input_ids.size(1)

            if doc_len <= self.max_length - self._query_tokens_len(query) - 3:
                # 短文档，直接一对
                all_pairs.append((query, doc))
                doc_map.append(doc_idx)
            else:
                # 长文档：切多个窗口
                tokens = tokenized_doc.input_ids[0]
                window_doc_len = self.max_length - self._query_tokens_len(query) - 3
                start = 0
                while start < doc_len:
                    end = min(start + window_doc_len, doc_len)
                    window_text = self.tokenizer.decode(tokens[start:end], skip_special_tokens=True)
                    all_pairs.append((query, window_text))
                    doc_map.append(doc_idx)
                    if end == doc_len:
                        break
                    start += self.stride

        # Step 2: 批量打分
        scores_per_pair = torch.zeros(len(all_pairs), dtype=torch.float32)
        for i in range(0, len(all_pairs), batch_size):
            batch = all_pairs[i:i+batch_size]
            inputs = self.tokenizer(
                batch,
                padding=True,
                truncation=True,
                max_length=self.max_length,
                return_tensors="pt",
            ).to(self.device)

            outputs = self.model(**inputs)
            logits = outputs.logits.view(-1).float().cpu()
            scores_per_pair[i:i+len(batch)] = logits

        # Step 3: 同一 doc 的所有窗口取 max（Sigmoid 可以之后再统一做）
        doc_scores = torch.full((len(docs),), float("-inf"))
        for pair_idx, doc_idx in enumerate(doc_map):
            doc_scores[doc_idx] = torch.maximum(doc_scores[doc_idx], scores_per_pair[pair_idx])

        # logits → 概率（sigmoid）
        return torch.sigmoid(doc_scores).tolist()

    def _query_tokens_len(self, query: str) -> int:
        return len(self.tokenizer.encode(query, add_special_tokens=False))

# 初始化
reranker = BGEReranker(device="cuda" if torch.cuda.is_available() else "cpu")
print("Reranker 加载完成。")

# 快速自测
query = "怎么申请退货？"
docs = [
    "退换货政策：签收后 7 天内，商品未开封可凭订单号申请无理由退货，寄回运费由平台承担。",
    "支付方式支持支付宝、微信支付、银联借记卡，暂不支持信用卡。",
    "售后服务电话：400-123-4567，工作日 9:00-18:00。如需退款请联系客服。",  # 部分相关
    "本产品整机 2 年保修，附件 1 年保修，非人为损坏免费维修。",
]
scores = reranker.compute_score(query, docs)
for doc, score in zip(docs, scores):
    print(f"[{score:.3f}] {doc[:60]}...")
# 预期：第一条得分最高（>0.8），第二条最低（<0.1）
```

### 第三步：构建召回 + Rerank 两阶段检索 Pipeline

用 MIRACL（多语种 RAG 基准，含中文数据）的一个子集做演示：

```python
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from datasets import load_dataset

# ========== 1. 数据准备 ==========
# 用 MIRACL 中文语料的小样本（实际用你自己的知识库文档）
dataset = load_dataset("miracl/miracl-corpus", "zh", split="train", streaming=True, trust_remote_code=True)
corpus = []
for i, doc in enumerate(dataset):
    if i >= 10000:  # 先取 1 万篇演示
        break
    corpus.append(doc["text"])
print(f"加载 {len(corpus)} 篇文档。")

# ========== 2. Stage 1：Embedding 召回 ==========
# 用 bge-m3 的 Bi-Encoder 版本做 Embedding（也是多语种，和 Reranker 同系列，搭配效果最好）
embed_model = SentenceTransformer(
    "BAAI/bge-m3",
    device="cuda" if torch.cuda.is_available() else "cpu"
)
embeddings = embed_model.encode(corpus, batch_size=64, show_progress_bar=True, normalize_embeddings=True)
embeddings = embeddings.astype(np.float32)

# 构建 FAISS 索引（内积 = 归一化后 = 余弦相似度）
dimension = embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)
index.add(embeddings)
print(f"FAISS 索引构建完成，维度 {dimension}，文档数 {index.ntotal}。")

# ========== 3. 两阶段检索函数 ==========
def two_stage_retrieve(query: str, recall_topk: int = 50, rerank_topn: int = 5):
    # Stage 1: 向量召回
    q_emb = embed_model.encode([query], normalize_embeddings=True).astype(np.float32)
    sims, indices = index.search(q_emb, recall_topk)
    recall_docs = [corpus[i] for i in indices[0]]
    recall_scores = sims[0].tolist()

    # Stage 2: Cross-Encoder Rerank
    rerank_scores = reranker.compute_score(query, recall_docs, batch_size=32)

    # 按 Reranker 分数重排序
    ranked = sorted(
        zip(recall_docs, recall_scores, rerank_scores),
        key=lambda x: x[2],
        reverse=True,
    )
    return ranked[:rerank_topn], recall_docs, recall_scores

# ========== 4. 实际查询并对比召回排序 vs Rerank 排序 ==========
query = "中国 2024 年的 GDP 增长率是多少？"
reranked, recalled, recall_scores = two_stage_retrieve(query, recall_topk=50, rerank_topn=10)

print(f"\n查询: {query}")
print("=" * 80)
print(f"{'排名':<4}{'Reranker分':>10}{'召回相似度':>10}  文档内容")
print("-" * 80)
for rank, (doc, recall_sim, rerank_score) in enumerate(reranked, 1):
    print(f"{rank:<4}{rerank_score:>10.3f}{recall_sim:>10.3f}  {doc[:70]}...")

# 一个有意思的观察：通常会有几篇文档在向量召回时排在 20~40 位（相似度低）
# 但经过 Reranker 后冲进 Top 3（分数高）——这就是 Reranker 存在的意义
```

### 第四步：对比纯召回 vs 召回+Rerank 的量化指标

用标准评测集（如 MIRACL 的标注查询集）算 NDCG@10、MRR、Recall@5：

```python
import numpy as np
from datasets import load_dataset

# 加载 MIRACL 中文评测集（query + 相关文档 id）
eval_data = load_dataset("miracl/miracl", "zh", split="dev", trust_remote_code=True)

ndcg_pure_recall = []
ndcg_with_rerank = []
recall_at5_pure = []
recall_at5_rerank = []

# 挑 50 条做快速评估（完整评测要跑 1000+ 条）
eval_samples = list(eval_data)[:50]

for sample in eval_samples:
    query = sample["query"]
    # 正相关文档（金标准）
    positive_ids = {ep["docid"] for ep in sample["positive_passages"]}
    if not positive_ids:
        continue

    # Stage 1 召回 Top 50
    q_emb = embed_model.encode([query], normalize_embeddings=True).astype(np.float32)
    sims, indices = index.search(q_emb, 50)
    retrieved_ids = [f"doc{i}" for i in indices[0]]
    retrieved_scores = sims[0]

    # 计算纯召回的指标
    relevance_pure = [1.0 if did in positive_ids else 0.0 for did in retrieved_ids]
    ndcg_pure_recall.append(ndcg_at_k(relevance_pure, 10))
    recall_at5_pure.append(sum(relevance_pure[:5]) / min(5, len(positive_ids)))

    # Stage 2 Rerank
    retrieved_docs = [corpus[i] for i in indices[0]]
    rerank_scores = np.array(reranker.compute_score(query, retrieved_docs, batch_size=32))

    # 按 Reranker 分数重排
    rerank_order = np.argsort(-rerank_scores)
    reranked_ids = [retrieved_ids[i] for i in rerank_order]
    relevance_rerank = [1.0 if did in positive_ids else 0.0 for did in reranked_ids]

    ndcg_with_rerank.append(ndcg_at_k(relevance_rerank, 10))
    recall_at5_rerank.append(sum(relevance_rerank[:5]) / min(5, len(positive_ids)))

print("=" * 60)
print(f"纯向量召回  NDCG@10:  {np.mean(ndcg_pure_recall):.4f}   Recall@5: {np.mean(recall_at5_pure):.4f}")
print(f"+ Reranker  NDCG@10:  {np.mean(ndcg_with_rerank):.4f}   Recall@5: {np.mean(recall_at5_rerank):.4f}")
delta = (np.mean(ndcg_with_rerank) - np.mean(ndcg_pure_recall)) / np.mean(ndcg_pure_recall) * 100
print(f"NDCG@10 相对提升: {delta:+.2f}%")
# 典型结果：NDCG@10 从 0.45 左右升到 0.58+，相对提升 25%+

def ndcg_at_k(relevance, k):
    """简化版 NDCG 计算"""
    dcg = sum((2**r - 1) / np.log2(i + 2) for i, r in enumerate(relevance[:k]))
    ideal = sorted(relevance, reverse=True)
    idcg = sum((2**r - 1) / np.log2(i + 2) for i, r in enumerate(ideal[:k]))
    return dcg / idcg if idcg > 0 else 0.0
```

### 第五步：可选——用 Cohere API 快速集成（不想自部署 GPU）

```python
import cohere
co = cohere.Client(api_key="YOUR_COHERE_API_KEY")

def cohere_rerank(query: str, docs: List[str], top_n: int = 5, model: str = "rerank-english-v3.0"):
    """如果是中文/多语种查询，model 改成 "rerank-multilingual-v3.0" 或 "rerank-3" """
    response = co.rerank(
        model=model,
        query=query,
        documents=docs,
        top_n=top_n,
        return_documents=True,
    )
    return [(r.document.text, r.relevance_score) for r in response.results]

# 使用方式和本地 Reranker 一样：先向量召回 50，再 Cohere 精排 5
# 优点：不用 GPU，延迟稳定，效果通常比开源 bge-m3 再高 2~3 个百分点
# 缺点：按 token 收费，1000 次查询大概 $0.5~1.0
```

## 常见误区

**误区 1：Reranker 越慢越准，所以永远选最大的模型（2B 参数）。** → 实际效果收益是边际递减的。bge-reranker-v2-m3（568M）和 2B 版本的 NDCG 差距通常只有 1~~1.5 个百分点，但后者推理延迟是前者的 3~~4 倍、显存占用高 4 倍。对大多数 RAG 应用，568M 的 m3 已经是「精度-延迟」比最好的甜点；除非你在 99 分位精度上卷到极致，否则 2B 模型不值得。

**误区 2：向量召回 Top 20 送 Reranker 就够了，Top 100 太浪费算力。** → 错。Reranker 的「前置召回数」是最关键的超参数之一，直接决定了 Reranker 能不能看到正确的文档。用你自己的评测集算一下：如果召回 Top 20 的 Recall@20 只有 70%，那意味着有 30% 的正确文档根本没进入 Reranker 阶段——再强的 Reranker 也无米之炊。经验法则：召回 Top_k 至少要满足 Recall@k ≥ 95%，通常就是 50~~100；数据集越大，这个 k 越要往高取。多花 2~~3 倍 Reranker 算力，换 25% 的正确文档召回率，绝对划算。

**误区 3：中文场景直接用英文 Reranker（如 ms-marco-electra-base），效果差不多。** → 效果差很多，通常掉 15%~30%。MS MARCO 系列 Reranker 是纯英文语料训练的，对中文字符、分词、术语对应关系几乎没学过。做中文/多语种必须选专门的多语种 Reranker（bge-m3、Jina、Cohere Rerank 3 这些），哪怕是轻量版的 bge-reranker-lite，也比英文大模型准。

**误区 4：把 Reranker 的分数当概率直接和 Embedding 相似度加权融合，比如 0.6*embedding + 0.4*rerank。** → 两者的分数分布完全不在一个尺度上。Embedding 的余弦相似度（归一化后）通常在 0.3~~0.7 之间，差 0.05 就是显著差别；Reranker 的 sigmoid 分数可能在 0.1~~0.9 之间均匀分布。直接线性加权等于给 Reranker 打了 10 倍的折扣，还不如纯 Reranker 排序。正确做法：召回阶段只负责「把候选池收窄」，最终排序完全以 Reranker 分数为准。可以给 Reranker 加一个硬阈值（比如 < 0.3 的文档直接丢，不送 LLM），减少噪声。

**误区 5：Reranker 和 Embedding 用完全不同的厂商模型，效果应该最好。** → 通常同系列的 Embedding + Reranker 搭配更好。比如 bge-m3 Embedding + bge-reranker-v2-m3，或者 Cohere Embed v3 + Cohere Rerank 3，因为它们是在同一套数据分布、同一套设计理念下联调的，Reranker 能更好地「修正」自家 Embedding 容易犯的那类错误。实测中同系列混搭通常比跨厂商各选最好的组合再高 1~2 个百分点。
