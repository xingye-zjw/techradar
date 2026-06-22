# RAG（检索增强生成）

**RAG（检索增强生成）** 是一种结合信息检索与文本生成的技术框架，由 Facebook AI Research（现 Meta AI）于 2020 年在论文 [*Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*](https://arxiv.org/abs/2005.11401) 中提出。

RAG 的核心思想是：**在生成回答之前，先从外部知识源中检索相关信息，然后基于检索到的信息生成答案。**

## RAG 解决了什么问题？

大型语言模型（LLM）虽然能力强大，但存在固有的局限：

| 问题 | 说明 | RAG 如何解决 |
|------|------|-------------|
| **知识过时** | 模型训练数据有截止日期 | 从实时知识库/文档中检索最新信息 |
| **幻觉 (Hallucination)** | 模型可能编造事实和引用 | 答案基于检索到的真实文档，可溯源 |
| **缺乏领域知识** | 通用模型缺少行业/企业内部知识 | 可连接企业文档、知识库、数据库 |
| **可解释性差** | 无法追踪答案来源 | 每个答案都可以附带来源文档 |
| **隐私/安全** | 把敏感数据训练到模型中有风险 | 推理时检索，数据不出企业内网 |
| **成本高** | 重新训练/微调大型模型昂贵 | 无需重新训练，只需更新文档索引 |

## RAG 的基本流程

一个典型的 RAG 系统包括两个阶段：

### 阶段 1：索引构建（离线）

```
原始文档
   ↓
[文档切片] Chunking → 把长文档切分为 200~500 token 的块
   ↓
[向量化] Embedding → 用 Embedding 模型将文本转为向量
   ↓
[存储] Vector Database → 存入向量数据库 (FAISS / Chroma / Pinecone)
```

### 阶段 2：检索生成（在线）

```
用户问题
   ↓
[向量化] Query Embedding → 用相同的 Embedding 模型把问题转为向量
   ↓
[相似度检索] Top-K → 在向量库中找最相近的 K 个文档块
   ↓
[Prompt 组装] Prompt Engineering → 把问题 + 检索到的文档块组合成 prompt
   ↓
[LLM 生成] Generation → LLM 基于检索信息生成回答
   ↓
[引用溯源] Citation → 返回答案和来源文档
```

## RAG 的检索策略

### 1. 向量检索（Dense Retrieval）

基于 Embedding 向量的余弦相似度：

```
score(query, doc) = cosine(E_query, E_doc)
```

优点：可以捕捉语义相似度（如「汽车」和「车辆」语义相近）
缺点：对精确匹配（如产品型号、人名等专有名词）有时表现不佳

### 2. 关键词检索（BM25 / Sparse Retrieval）

基于词频和逆文档频率的传统检索方法。

优点：精确匹配好、速度快、可解释性强
缺点：无法处理同义词、语义差距

### 3. 混合检索（Hybrid Retrieval）

同时使用向量检索和关键词检索，按权重合并得分：

```
final_score = α × BM25_score + (1 - α) × cosine_score
```

这是目前业界最常用且效果最好的方法（如 ElasticSearch 8、LlamaIndex）。

### 4. 高级检索策略

| 策略 | 说明 |
|------|------|
| **HyDE** | 先用 LLM 根据问题生成「假设答案」，再用这个假设答案去检索 |
| **Self-Query** | LLM 把自然语言解析为结构化查询（元数据过滤 + 向量检索） |
| **RAG-Fusion** | 生成多个查询变体，分别检索，然后用 RRF 合并排序 |
| **Query Expansion** | 用 LLM 扩展问题，加入上下文和改写为更易检索的形式 |
| **Parent-Child** | 小块用于检索，实际传给 LLM 的是大块上下文 |

## 经典 RAG 架构（Naive RAG）

```
用户 Query
   ↓
Embedding Model → Query Vector
   ↓
Vector DB Top-K Retrieval
   ↓
Prompt: "基于以下信息回答问题... \n\n {context} \n\n 问题: {query}"
   ↓
LLM (GPT-3.5/4, Llama, Qwen...)
   ↓
Answer + Citations
```

## 高级 RAG 架构

### Advanced RAG

在 Naive RAG 基础上增加：

- **查询改写 (Query Rewriting)**：LLM 先把用户问题优化为更适合检索的形式
- **分块优化 (Better Chunking)**：按语义/标题分块，而非固定大小
- **重新排序 (Re-Ranking)**：先用向量粗召回（如 Top-50），再用 Cross-Encoder 精排
- **元数据过滤**：根据日期、文档类型等先筛选

### Modular RAG

进一步模块化：

- **Router**：决定是否需要检索（有些问题不需要，有些需要多跳）
- **Retriever**：多种检索器（向量 + 关键词 + SQL + API）
- **Generator**：多种生成策略（链式、树状、多轮验证）
- **Memory**：对话历史和短期记忆

### Agentic RAG

把 RAG 做成智能代理：

- 自主规划需要检索什么
- 多步推理 + 工具调用
- 自我反思和验证答案

## 关键实现细节

### 文档分块策略

| 策略 | 适用场景 | 优缺点 |
|------|---------|-------|
| 固定大小（512 token，100 overlap） | 通用 | 简单，可能切分语义单元 |
| 段落/标题感知 | 结构化文档 | 语义完整，但实现复杂 |
| 语义分块（按 Embedding 相似度） | 非结构化文档 | 智能，计算量大 |
| 递归分块 | 多层次文档 | 灵活，可保留层级 |

### 向量化模型选择

| 模型 | 维度 | MTEB 分数 | 适用 |
|------|------|-----------|-------|
| text-embedding-3-small | 1536 | 62.3 | OpenAI API，通用 |
| text-embedding-3-large | 3072 | 64.6 | OpenAI API，高精度 |
| BGE-M3 | 1024 | 67.8 | 开源中文首选 |
| all-MiniLM-L6-v2 | 386 | 58.6 | 轻量、快速 |
| Cohere Embed v3 | 1024 | — | 中英文好 |

### RAG 评估指标

- **Retrieval 质量**：Recall@K、Precision@K
- **Answer 质量**：Faithfulness（忠实度，是否基于上下文）、Answer Relevance（答案相关性）
- **端到端评估**：RAGAS、TruLens、DeepEval 等评估框架

## RAG vs. Fine-tuning

| 维度 | RAG | 微调 (Fine-tuning) |
|------|-----|-------------------|
| **知识更新** | 更新文档索引即可（分钟级） | 重新训练（小时/天级） |
| **来源可追溯** | ✅ 每个答案都有引用 | ❌ 不知从哪来 |
| **幻觉** | 较低（受限于检索质量） | 较高 |
| **领域知识注入** | ✅ 非常好 | ⚠️ 需大量领域数据 |
| **推理成本** | 每次都需检索 + 生成 | 一次性训练，推理快 |
| **隐私保护** | 数据不出内网 | 训练时数据可能外泄 |
| **初始开发成本** | 低 | 高 |

**推荐策略**：先用 RAG 构建基线，特定领域的风格/语气/行为模式再用微调优化。

## 代码示例：使用 LangChain 构建 RAG

```python
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.llms import HuggingFacePipeline

# 1. 加载文档
documents = load_documents("./docs/")

# 2. 分块
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500, chunk_overlap=50
)
splits = text_splitter.split_documents(documents)

# 3. 构建向量索引
embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-zh-v1.5")
vectorstore = FAISS.from_documents(splits, embeddings)

# 4. 检索 + 生成
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True
)

# 5. 查询
result = qa_chain("产品 A 的退货政策是什么？")
print(result["result"])     # 答案
print(result["source_documents"])  # 来源文档
```

## RAG 的未来发展趋势

### 1. 从 Naive 到 Agentic
- 简单的检索 → 多步推理、自主规划、反思验证
- 结合工具调用（Calculator、SQL、API 调用）

### 2. 结构化 + 非结构化统一
- RAG 不再局限于文本
- 表格、图像、视频、数据库都可以成为检索源

### 3. RAG + KG（知识图谱）
- 用知识图谱增强 RAG 的推理能力
- 实体关系建模，减少幻觉

### 4. 质量保证框架
- 自动检索评估
- 自动索引质量监控
- 答案可靠性打分

### 5. 端侧 RAG
- 小模型 + 本地向量库
- 在手机、PC 上实现完全离线的问答

## 常见陷阱与反模式

1. ❌ **分块大小一刀切**：不同文档需要不同的分块策略
2. ❌ **完全依赖向量检索**：专有名词、编号、代码等关键词检索更有效
3. ❌ **把 LLM 当搜索引擎**：应该先检索再生成，而非先回忆后查找
4. ❌ **检索后不验证**：缺少答案忠实度的评估机制
5. ❌ **不做 Prompt 优化**：同样的检索内容，更好的 Prompt 会大幅改善输出质量

相关术语：[Transformer](/glossary/transformer)、[微调](/glossary/fine-tuning)、[LoRA](/glossary/lora)、[PyTorch](/glossary/pytorch)
