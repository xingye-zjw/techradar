---
title: RAG 系统进阶：从 Naive RAG 到 Advanced RAG
category: llm
difficulty: intermediate
duration: 1周
summary: Naive RAG 的天花板在哪里？Advanced RAG 如何通过 Query 改写、重排序、知识图谱突破它
takeaways:
  - 理解 Naive RAG 的核心局限（chunking / embedding / retrieval 三环节各有坑）
  - 能实现 Query 改写（HyDE）和上下文扩展
  - 能用 Cross-Encoder Reranker 提升 Top-k 准确率
  - 理解 Knowledge Graph RAG 的架构思路
relatedIntel:
  - 003-lora-qlora
  - 005-rag
  - 044-rlhf
relatedNodes:
  - llm-inference
  - llm-finetune
tags:
  - rag
  - retrieval
  - reranker
  - hyde
  - contextual chunking
  - knowledge graph rag
relatedTerms:
  - "rag"
  - "lora"
  - "transformer"
  - "chain-of-thought"
relatedTools:
  - "huggingface-transformers"
  - "langchain"
  - "pytorch"
---

## 为什么你要学它

Naive RAG（Embedding 检索 + 直接生成）的三个核心问题：

1. **Chunking 碎片化**：长文档被切成小块，丢失上下文
2. **Embedding 语义偏差**：字面相似但语义不相关的文档被优先检索
3. **检索结果单一**：无法处理需要多跳推理的问题

Advanced RAG 通过一系列技术手段逐一解决这些问题，是 RAG 系统落地的必经之路。

## 一句话概览

- **Naive RAG**：Embedding → Top-k 检索 → 直接生成
- **Advanced RAG**：Query 改写 → 子问题查询 → Rerank → 生成
- **Modular RAG**：工具化各模块，支持自由组合（RAG + SQL + Knowledge Graph）

## 核心拆解

### 🔑 Query 改写（HyDE / Query Expansion）

问题：用户 query 可能包含缩写、拼写错误、或与文档用词不一致。

**HyDE（Hypothetical Document Embeddings）**：

1. 让 LLM 根据 query 生成一个「假设性答案」（Hypothetical Document）
2. 用假设性答案的 Embedding 做检索（它和真实文档更接近）
3. 用真实 query 和检索结果一起生成最终答案

```python
def hyde_retrieval(query, vector_db, llm):
    # Step 1: 生成假设性答案
    hyde_prompt = f"根据以下问题，写一段假设性的答案：\n{query}\n\n假设性答案："
    hypothetical_doc = llm.generate(hyde_prompt)

    # Step 2: 用假设性答案做检索
    hyde_embedding = embed(hypothetical_doc)
    results = vector_db.search(hyde_embedding, top_k=5)

    # Step 3: 真实 query 和检索结果一起生成
    context = "\n".join([r.text for r in results])
    final_prompt = f"基于以下内容回答问题：\n{context}\n\n问题：{query}"
    return llm.generate(final_prompt)
```

**Query Expansion**：把一个 query 扩展成多个子问题，并行检索后合并结果。

```python
def decompose_query(query, llm):
    # LLM 把复杂问题分解为多个简单子问题
    prompt = f"把以下问题分解为 2-3 个可以独立回答的简单问题：\n{query}"
    sub_questions = llm.generate(prompt).split("\n")
    return [q.strip() for q in sub_questions if q.strip()]
```

### 🔑 Reranker：Cross-Encoder 二次排序

Embedding 模型是 Bi-Encoder，速度快但语义捕捉有限。Cross-Encoder 能同时看到 query 和 document，语义理解更准确，但速度慢（不能做海量检索）。

**两阶段策略**：先用 Embedding 检索 Top-50，再用 Cross-Encoder 重排取 Top-5。

```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("BAAI/bge-reranker-large")

def rerank(query, documents, top_k=5):
    pairs = [(query, doc) for doc in documents]
    scores = reranker.predict(pairs)

    # 按分数排序
    ranked_indices = np.argsort(scores)[::-1][:top_k]
    return [documents[i] for i in ranked_indices]

# 使用
initial_results = vector_db.search(embed(query), top_k=50)
final_results = rerank(query, [r.text for r in initial_results], top_k=5)
```

### 🔑 上下文 Chunking：解决碎片化

**父子窗口检索（Parent Document Retrieval）**：

- 大块文档作为「父块」（Parent）
- 切成小块作为「子块」（Child）
- 检索定位到子块后，召回对应的父块给 LLM

```python
def parent_document_retrieval(query, chunks, parent_map):
    # 1. 检索子块
    child_results = vector_db.search(query, top_k=10)

    # 2. 获取对应的父块
    parent_ids = set()
    for child in child_results:
        parent_ids.add(parent_map[child.id])

    # 3. 返回父块（完整的上下文）
    return [get_document(pid) for pid in parent_ids]
```

**Sentence Window Retrieval**：每个句子独立检索，但召回时附上周围句子作为上下文窗口。

### 🔑 Knowledge Graph RAG

对于需要多跳推理的问题（如「谁是谁的导师？」），纯向量检索难以处理。

Knowledge Graph RAG：

1. 用 LLM 从文档中提取实体和关系，构建知识图谱
2. 检索时先用向量找到相关实体，再在图谱中做关系推理
3. 图谱推理结果 + 向量检索结果合并给 LLM

```python
# 从文档中抽取知识图谱
def extract_triplets(document, llm):
    prompt = f"""从以下文本中提取实体和关系，输出三元组（头实体, 关系, 尾实体）：
    {document}

    三元组列表："""
    triplets = llm.generate(prompt)
    return parse_triplets(triplets)

# 图谱查询
def kg_query(question, kg, vector_db):
    # 在图谱中做多跳推理
    kg_results = kg.query(question, depth=2)

    # 向量检索补充
    vec_results = vector_db.search(question, top_k=5)

    # 合并结果
    combined = merge_results(kg_results, vec_results)
    return combined
```

## 实战指南

### 完整 Advanced RAG Pipeline

```python
class AdvancedRAG:
    def __init__(self):
        self.embedding = SentenceTransformer("BAAI/bge-m3")
        self.vector_db = ChromaDB()
        self.reranker = CrossEncoder("BAAI/bge-reranker-large")
        self.llm = OllamaLLM("qwen2.5")

    def retrieve(self, query, top_k=5):
        # 1. Query 改写
        sub_queries = decompose_query(query, self.llm)

        # 2. 并行检索
        all_results = []
        for sq in sub_queries:
            emb = self.embedding.encode(sq)
            results = self.vector_db.search(emb, top_k=20)
            all_results.extend(results)

        # 3. 去重
        unique_results = deduplicate(all_results)

        # 4. Rerank
        ranked = self.rerank(query, unique_results, top_k=top_k)
        return ranked

    def answer(self, query):
        context = self.retrieve(query)
        prompt = f"基于以下内容回答：\n{context}\n\n问题：{query}"
        return self.llm.generate(prompt)
```

## 常见误区

### 误区 1：Naive RAG 对大多数场景已经够用了

**错误理解**：很多人认为简单的 Embedding 检索 + 直接生成就能解决所有 RAG 需求，不需要复杂的优化。

**正确理解**：Naive RAG 在简单问答场景下确实可用，但在以下情况会显著失效：(1) 需要多跳推理的问题（如"谁是谁的导师的合作者？"），(2) 文档中存在大量相似但语义不同的内容，(3) 用户 query 与文档用词差异大。这些场景下，Advanced RAG 的 Query 改写、Reranker 等技术能带来 30-50% 的准确率提升。

**如何避免**：先用简单的 RAG baseline 验证需求，然后针对具体痛点选择优化方案。如果发现检索结果不相关，优先尝试 Query 改写和 Reranker；如果发现碎片化问题，尝试父子窗口检索。

### 误区 2：Chunk 越小，检索越精准

**错误理解**：很多人认为将文档切成更小的 chunk（如 128 字），就能提高检索的精度。

**正确理解**：过小的 chunk 会导致上下文丢失，检索到的片段可能缺乏完整语义。例如，一个法律条文被切成 3 段，单独检索其中一段可能无法回答"这条法律的主要内容是什么？"。此外，小 chunk 还会增加检索结果数量，提高 Reranker 的计算成本。

**如何避免**：使用层级 chunking 策略：小 chunk 用于检索定位，大 chunk（父块）用于提供完整上下文。通常推荐 chunk 大小为 256-512 字，同时建立 chunk 之间的关联关系。

### 误区 3：Reranker 总是能提升检索质量

**错误理解**：很多人认为只要加了 Reranker，检索质量就一定会提升，因此盲目在所有场景使用。

**正确理解**：Reranker 的效果取决于初始检索结果的质量和 Reranker 模型的领域适配性。如果初始检索结果已经很差（比如 query 和文档完全不相关），Reranker 也无力回天。此外，通用的 Reranker 模型在特定领域（如医疗、法律）可能表现不佳。

**如何避免**：在使用 Reranker 前，先确保初始检索结果有合理的召回率。选择适合领域的 Reranker 模型，或在领域数据上微调。监控 Reranker 的输入输出，分析它是否真正提升了排序质量。

## 相关资源

- [HyDE 论文](https://arxiv.org/abs/2212.10496)
- [BGE Reranker 模型](https://huggingface.co/BAAI/bge-reranker-large)
- [Knowledge Graph RAG 实践](https://github.com/panguangzhen/RAG-docs)
- [RAGAS 评估框架](https://docs.ragas.io/)
