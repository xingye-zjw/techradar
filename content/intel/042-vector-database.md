---
title: 向量数据库：从原理到实践
category: infrastructure
keywords:
  - vector database
  - embedding
  - similarity search
  - chromadb
  - milvus
  - faiss
difficulty: intermediate
duration: 1周
summary: RAG 的核心是向量检索——向量数据库让「语义相似」变成可查询的索引
takeaways:
  - 理解向量数据库的核心操作：插入 / 查询 / 删除
  - 理解 ANN（近似最近邻）算法的原理和 trade-off
  - 能用 ChromaDB / Milvus / FAISS 构建向量索引
  - 能选择合适的索引类型（HNSW / IVF）
---

## 为什么你要学它

RAG 系统的第一步是向量检索：把用户 query 转成向量，在数据库中找最相似的文档向量。

传统数据库（SQL）做不了语义检索——它们只能做精确匹配或范围查询。

**向量数据库**专门解决「找最相似的向量」这个问题：
- 支持 ANN（近似最近邻）算法，在百万级向量中毫秒级返回 Top-k
- 支持元数据过滤（如「只检索 2024 年的文档」）
- 支持增量更新和删除

如果你想构建 RAG / 推荐系统 / 图像检索，向量数据库是必学技术。

## 一句话概览

- **向量数据库**：存储向量 + 元数据，支持相似度查询
- **ANN 算法**：近似最近邻，牺牲精度换速度（HNSW / IVF）
- **主流工具**：ChromaDB（轻量）、Milvus（生产级）、FAISS（算法库）

## 核心拆解

### 🔑 向量检索的核心问题

给定查询向量 q，在数据库中找到最相似的 k 个向量：

```
Top-k = argmin_{v ∈ DB} distance(q, v)
```

距离度量：
- **L2 距离**：||q - v||₂（欧几里得距离）
- **余弦相似度**：q · v / (||q|| × ||v||)（方向相似）
- **内积**：q · v（适合归一化向量）

暴力搜索：遍历所有向量，计算距离 → O(N)，N=百万时太慢。

### 🔑 ANN 算法：HNSW vs IVF

**HNSW（Hierarchical Navigable Small World）**：
- 构建多层图结构，上层是「高速公路」，下层是详细连接
- 查询时从上层快速定位区域，再到下层精细搜索
- 特点：速度快、精度高、构建慢、内存占用大

**IVF（Inverted File Index）**：
- 先聚类（K-Means），把向量分成 N 个桶
- 查询时只搜索最近的几个桶
- 特点：构建快、内存小、速度稍慢、精度可控

| 算法 | 查询速度 | 精度 | 构建时间 | 内存 |
|---|---|---|---|---|
| HNSW | 快 | 高 | 慢 | 大 |
| IVF | 中 | 可调 | 快 | 小 |

### 🔑 ChromaDB：轻量级向量数据库

```python
import chromadb

client = chromadb.Client()

# 创建集合
collection = client.create_collection("documents")

# 插入向量
collection.add(
    documents=["文档1内容", "文档2内容"],
    embeddings=[embed("文档1"), embed("文档2")],
    metadatas=[{"year": 2024}, {"year": 2023}],
    ids=["doc1", "doc2"]
)

# 查询
results = collection.query(
    query_embeddings=[embed("用户问题")],
    n_results=5,
    where={"year": 2024}  # 元数据过滤
)
```

### 🔑 Milvus：生产级向量数据库

```python
from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType

# 连接
connections.connect("default", host="localhost", port="19530")

# 定义 schema
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=768),
    FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=512)
]
schema = CollectionSchema(fields, "document collection")

# 创建集合
collection = Collection("documents", schema)

# 创建索引（HNSW）
collection.create_index(
    field_name="embedding",
    index_params={"index_type": "HNSW", "metric_type": "COSINE", "params": {"M": 16, "efConstruction": 256}}
)

# 插入
collection.insert([ids, embeddings, texts])

# 查询
results = collection.search(
    data=[query_embedding],
    anns_field="embedding",
    param={"metric_type": "COSINE", "params": {"ef": 64}},
    limit=5
)
```

### 🔑 FAISS：Meta 的向量检索库

```python
import faiss

# 创建索引
dimension = 768
index = faiss.IndexHNSWFlat(dimension, 32)  # HNSW, M=32

# 添加向量
index.add(embeddings)

# 查询
D, I = index.search(query_embedding, k=5)
# D: 距离, I: 索引
```

## 实战指南

### RAG 向量检索 Pipeline（以 ChromaDB 为例）

```python
class VectorRetriever:
    def __init__(self):
        self.db = chromadb.Client()
        self.collection = self.db.create_collection("documents")
    
    def add_documents(self, documents):
        embeddings = [embed(doc) for doc in documents]
        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            ids=[str(i) for i in range(len(documents))]
        )
    
    def search(self, query, top_k=5):
        query_embedding = embed(query)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        return results['documents'][0]
```

## 常见误区

### 误区 1：认为向量数据库能完全替代传统数据库

**错误理解**：向量数据库支持元数据过滤，所以可以完全替代 PostgreSQL、MySQL 等关系型数据库。

**正确理解**：向量数据库的核心优势是向量相似度检索，但在复杂查询（如多表联查、事务处理、复杂聚合）方面远不如关系型数据库。向量数据库的元数据过滤功能有限，无法处理复杂的业务逻辑查询。两者是互补关系，而非替代关系。

**如何避免**：根据查询需求选择合适的数据库。需要向量检索时用向量数据库，需要复杂查询时用关系型数据库。在 RAG 系统中，通常用关系型数据库存储结构化元数据，用向量数据库存储 embedding，通过 ID 关联两者。

### 误区 2：忽略索引参数调优

**错误理解**：使用默认的索引参数就行，HNSW 和 IVF 的效果应该差不多。

**正确理解**：索引参数直接影响查询速度、精度和内存占用。HNSW 的 M 参数决定了图的连接密度，efConstruction 决定了构建时的搜索范围；IVF 的 nlist 决定了聚类数量，nprobe 决定了查询时搜索的聚类数。参数设置不当可能导致精度下降或内存溢出。

**如何避免**：根据数据规模和查询需求调整参数。HNSW：M=16-32（平衡速度和内存），efConstruction=256（构建时搜索范围）。IVF：nlist=sqrt(N) 到 4*sqrt(N)（N 为数据量），nprobe=10-100（查询精度）。使用基准测试评估不同参数组合的效果。

### 误区 3：认为向量维度越高越好

**错误理解**：使用更大的 embedding 模型（如 1024 维 vs 256 维）能获得更好的检索效果。

**正确理解**：更高的维度确实能捕捉更多语义信息，但也会带来：存储成本翻倍、查询速度下降、维度灾难（高维空间中距离度量失效）。在实际应用中，768 维的 embedding 往往已经足够，进一步增加维度的收益递减。

**如何避免**：根据任务复杂度选择合适的 embedding 模型。简单任务（如关键词匹配）用小模型（256 维），复杂任务（如语义理解）用大模型（768 维）。如果需要降维，可以使用 PCA 或学习一个投影矩阵。同时考虑向量量化技术（如 PQ）来压缩存储。

## 相关资源

- [ChromaDB 文档](https://docs.trychroma.com/)
- [Milvus 文档](https://milvus.io/docs/)
- [FAISS GitHub](https://github.com/facebookresearch/faiss)
- [HNSW 论文](https://arxiv.org/abs/1603.09320)