---
title: RAG 入门
category: llm
difficulty: beginner
duration: 1周
summary: 检索增强生成（RAG）让大模型能基于私有知识库回答问题，是构建企业知识库、客服机器人最落地的 LLM 方案。
takeaways: "- 理解 RAG 的核心流程：文档加载、分块、向量化、检索、生成
  - 掌握向量数据库与 Embedding 模型在 RAG 中的作用
  - 学会用 LangChain / LlamaIndex 搭建最小可用 RAG 系统
  - 了解 RAG 常见失败模式：检索不准、上下文截断、幻觉"
relatedIntel: "- 005-rag
  - 035-advanced-rag
  - 042-vector-database"
tags: "- rag
  - retrieval-augmented-generation
  - vector-database
  - embedding
  - langchain
  - llm"
relatedTerms: ["rag", "lora", "transformer", "chain-of-thought"]
relatedTools: ["huggingface-transformers", "langchain", "pytorch"]
relatedNodes: ["llm-inference", "llm-prompt-engineering"]
---

## 为什么你要学它

大语言模型（LLM）虽然知识渊博，但有两个明显短板：

1. **知识不实时**：模型参数里的知识截止到训练数据时间
2. **无法访问私有数据**：企业内部文档、产品手册、聊天记录都不在训练集中

**RAG（Retrieval-Augmented Generation，检索增强生成）** 就是解决这两个问题的核心方案：先把私有文档变成可检索的向量知识库，用户提问时先检索相关片段，再把这些片段作为上下文喂给 LLM，让模型基于事实生成答案。

这是目前企业落地 LLM 最稳妥、最常用的架构。

## 一句话概览（快速版）

> **RAG = 检索（Retrieval）+ 生成（Generation）。先找证据，再让大模型根据证据回答。**

核心流程：

- **加载文档**：PDF、Word、网页、数据库等多种来源
- **文本分块（Chunking）**：把长文档切成适合模型处理的小段
- **Embedding 向量化**：用 Embedding 模型把文本变成向量
- **存入向量数据库**：支持相似度检索的向量存储
- **用户提问时检索**：把问题也转成向量，找最相关的 Top-K 片段
- **拼接上下文生成**：把检索结果和问题一起交给 LLM 生成答案

## 核心拆解

### 🔑 文档加载与分块

文档来源通常包括 PDF、Markdown、网页、数据库等。加载后需要切成合适大小的文本块：

- **块太大**：超过模型上下文窗口，检索粒度粗
- **块太小**：丢失上下文，语义不完整
- **常用策略**：按段落/标题分块，块大小 300-500 字符，重叠 50-100 字符

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", "。", " "]
)
chunks = splitter.split_documents(documents)
```

### 🔑 Embedding 与向量数据库

Embedding 模型把文本映射到高维向量空间，语义相似的文本向量距离更近。

常用 Embedding 模型：

- **OpenAI text-embedding-ada-002 / text-embedding-3-small**
- **BGE（BAAI General Embedding）**：中文场景表现优秀
- **M3E / GTE**：中文开源 Embedding 模型

常用向量数据库：

- **ChromaDB**：轻量、易上手，适合原型
- **FAISS**：Facebook 开源，适合本地实验
- **pgvector**：PostgreSQL 扩展，适合已有 PG 生态
- **Milvus / Qdrant / Weaviate**：生产级向量数据库

```python
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma

embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-large-zh")
vectordb = Chroma.from_documents(chunks, embeddings, persist_directory="./db")
retriever = vectordb.as_retriever(search_kwargs={"k": 5})
```

### 🔑 检索与生成

检索阶段把用户问题转成向量，从向量库召回 Top-K 相关片段。生成阶段把这些片段和用户问题拼成 prompt：

```
你是基于以下资料回答问题的助手。如果资料不足以回答，请明确说明。

资料：
{retrieved_chunks}

问题：{question}
```

```python
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI

qa = RetrievalQA.from_chain_type(llm=OpenAI(), retriever=retriever)
answer = qa.run("公司的年假政策是什么？")
```

### 🔑 常见失败模式

- **检索不准**：问题表述和文档片段不一致，导致召回错误
- **上下文截断**：检索到的片段太长，超出模型上下文窗口
- **幻觉**：模型过度发挥，生成检索资料中没有的内容
- **多跳推理不足**：需要综合多个片段才能回答的问题表现差

## 完整排查方案

搭建 RAG 系统后效果不好，按以下顺序排查：

1.  检查文档加载是否正确，是否有乱码或格式丢失
2.  调整分块大小和重叠度，观察检索质量变化
3.  换用更强的 Embedding 模型，尤其是中文场景
4.  检查向量数据库中的 Top-K 召回结果是否相关
5.  优化 prompt，明确告诉模型只能基于资料回答
6.  对复杂问题尝试重排序（Rerank）或多查询检索
7.  必要时引入 Advanced RAG：HyDE、摘要检索、Agentic RAG

## 常见误区与注意事项

- **误区 1：分块越大越好**。大块虽然保留更多上下文，但会降低检索精度并容易超出模型窗口，应根据文档结构动态调整。
- **误区 2：Embedding 模型随便选**。中文文档用英文 Embedding 会导致语义匹配差，务必在目标语言上评测召回效果。
- **误区 3：RAG 能完全消除幻觉**。RAG 只能降低幻觉，如果 prompt 没有明确约束，模型仍可能编造检索资料外的内容。
- **注意 1：文档质量决定 RAG 上限**，扫描版 PDF、表格、代码块等需要专门解析流程。
- **注意 2：生产环境要监控检索命中率与答案相关性**，建立 bad case 回流机制持续优化。

## 关键术语

- **RAG**：检索增强生成，结合信息检索与大模型生成
- **Embedding**：将文本映射为稠密向量的表示方法
- **Vector Database**：专门存储和检索向量的数据库
- **Chunking**：将长文档切分为小段的过程
- **Retriever**：负责根据查询召回相关文档的组件
- **Hallucination**：模型生成与事实不符的内容
