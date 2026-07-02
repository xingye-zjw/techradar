---
title: 知识图谱
category: nlp
keywords:
  - knowledge graph
  - 知识图谱
  - 知识表示
  - TransE
  - 实体识别
  - 关系抽取
  - 知识推理
  - 知识融合
difficulty: intermediate
duration: 2-3周
summary: 用结构化方式表示现实世界中的实体、关系和属性，是智能问答、推荐系统、语义搜索的核心基础设施。
takeaways:
  - 理解知识图谱的基本构成：实体、关系、三元组 (h, r, t)，以及图结构 G=(E, R, F)
  - 掌握知识表示学习核心思想：TransE 及其改进模型 TransH、TransR 的原理与区别
  - 了解知识抽取全流程：命名实体识别（NER）、关系抽取、实体链接
  - 能用 PyKEEN 在标准数据集上训练 TransE 模型，完成链接预测任务
  - 理解知识推理的两类方法：基于规则的推理和基于表示学习的推理
relatedIntel:
  - 064-nlp-rnn
  - 115-tts-speech-synthesis
relatedNodes:
  - nlp-rnn
---

## 为什么你要学它

先讲结论：**知识图谱 = 让计算机"理解"世界的结构化方式，把零散的信息织成一张有意义的网。**

想象你在搜索"刘德华的妻子是谁"——传统搜索引擎靠关键词匹配，可能返回一堆包含"刘德华"和"妻子"的网页；而有了知识图谱，系统能直接回答"朱丽倩"，因为它知道「刘德华」和「朱丽倩」之间存在「配偶」关系。

知识图谱解决的核心问题是**让数据从"字符串"变成"东西"**：
- 搜索从"关键词匹配"升级到"语义理解"
- 推荐从"行为统计"升级到"知识关联"
- 问答从"模板匹配"升级到"逻辑推理"

从 Google Knowledge Graph 到 Wikidata，从百度知心到阿里藏经阁，知识图谱已经成为各大科技公司 AI 战略的基础设施。理解它，你就能看懂智能问答、企业知识库、金融风控、医疗诊断等众多 AI 应用的底层逻辑。

## 一句话概览（快速版）

你只要记住三句话：

1. **知识图谱 = 实体 + 关系 + 属性**，用三元组 (头实体, 关系, 尾实体) 表示一条知识，整个图谱是一个有向有标签图 G=(E, R, F)
2. **知识表示学习 = 把实体和关系映射到低维向量空间**，让 h + r ≈ t（TransE 核心思想），用向量计算替代图遍历
3. **知识图谱构建 = 抽取 → 融合 → 推理**，从非结构化文本中提取知识，消歧对齐后补全缺失的关系

## 核心拆解

### 🔑 知识图谱基础

知识图谱本质上是一个**有向有标签图**，用数学符号表示为 **G = (E, R, F)**：
- **E**（Entities）：实体集合——现实世界中的具体事物或抽象概念，如「刘德华」、「香港」、「电影」
- **R**（Relations）：关系集合——实体之间的联系，如「出生地」、「职业」、「参演」
- **F**（Facts）：事实三元组集合——每条知识表示为 **(h, r, t)**，即头实体 + 关系 + 尾实体，如 (刘德华, 出生地, 香港)

**知识表示语言**：
- **RDF**（Resource Description Framework）：W3C 标准，用三元组描述资源，是知识图谱的基础数据模型
- **OWL**（Web Ontology Language）：在 RDF 基础上增加了本体描述能力，可以定义类、子类、属性约束等，支持更复杂的推理
- **属性图**（Property Graph）：工业界常用，节点和边都可以带属性，如 Neo4j 使用的模型

### 🔑 知识表示学习

传统的知识图谱查询依赖图遍历和逻辑推理，计算复杂度高、泛化能力弱。**知识表示学习**（Knowledge Graph Embedding）将实体和关系映射到低维连续向量空间，用向量运算来完成推理。

**TransE（Translating Embeddings）**：
- 核心思想：**h + r ≈ t**——头实体向量加上关系向量，应该约等于尾实体向量
- 评分函数：`f(h, r, t) = ||h + r - t||`（L1 或 L2 距离），分数越低表示三元组越可能成立
- 训练目标：让正例三元组的分数低，负例三元组的分数高（margin-based ranking loss）
- 优点：简单高效，可扩展性强
- 缺点：处理复杂关系（一对多、多对多）能力有限

**TransH（Translating on Hyperplanes）**：
- 改进：每个关系对应一个超平面，实体先投影到关系超平面上再做平移
- 解决的问题：让同一个实体在不同关系下有不同的表示，更好处理一对多关系

**TransR（Translating on Relation Space）**：
- 改进：实体和关系在不同的空间中，通过投影矩阵将实体映射到关系空间
- 解决的问题：实体和关系是不同类型的对象，放在同一空间不合理；不同关系关注实体的不同方面

**其他代表性模型**：
- **DistMult**：双线性模型，用矩阵乘法评分
- **ComplEx**：复数空间的双线性模型，更好处理非对称关系
- **RotatE**：将关系看作复数空间中的旋转，能建模对称/反对称/反转/组合等多种关系模式

### 🔑 知识抽取

知识抽取是从非结构化/半结构化数据中自动提取知识的过程，是构建知识图谱的第一步。

**命名实体识别（NER）**：
- 任务：从文本中识别出实体的边界和类型
- 例子：从「刘德华出生于香港」中识别出「刘德华」是人名、「香港」是地名
- 主流方法：
  - 早期：CRF（条件随机场）+ 人工特征
  - 现在：BiLSTM-CRF、BERT-CRF 等深度学习方法

**关系抽取**：
- 任务：判断两个实体之间的关系类型
- 例子：已知「刘德华」和「香港」，判断它们之间的关系是「出生地」
- 主流方法：
  - **远程监督**（Distant Supervision）：用已有知识图谱自动标注数据，假设"如果两个实体有关系，那么提到它们的句子都表达了这个关系"
  - **神经网络方法**：CNN、RNN、GNN、预训练模型（BERT 等）
  - **Few-shot / Zero-shot**：用少量样本甚至零样本来抽取新关系

**事件抽取**：
- 任务：从文本中识别事件的触发词、事件类型、论元角色
- 例子：从「刘德华在2008年与朱丽倩结婚」中抽取结婚事件，时间是2008年，双方是刘德华和朱丽倩

### 🔑 知识融合

从不同来源抽取的知识往往存在冗余和冲突，知识融合就是把它们整合为一致、干净的知识。

**实体对齐（Entity Alignment）**：
- 任务：找出不同知识图谱中指向同一个现实对象的实体
- 例子：DBpedia 中的「刘德华」和 Wikidata 中的「刘德华」是同一个人
- 方法：
  - 基于属性相似度：比较实体的名称、属性、描述
  - 基于结构相似度：比较实体在图谱中的邻居结构
  - 基于表示学习：用知识图谱嵌入计算实体向量的相似度

**实体链接（Entity Linking）**：
- 任务：将文本中识别出的实体指称（mention）链接到知识图谱中的对应实体
- 例子：文本中说「苹果发布了新手机」，这里的「苹果」应该链接到「苹果公司」而不是「苹果（水果）」
- 核心挑战：一词多义（歧义）和多词一义（同义）
- 方法：
  - 候选生成：找出所有可能的候选实体
  - 候选消歧：根据上下文相似度、实体流行度等选出正确的实体

**知识融合其他环节**：
- 属性对齐：不同来源的属性名不同但含义相同（如「生日」和「出生日期」）
- 冲突消解：不同来源的数据不一致时选择可信的

### 🔑 知识推理

知识图谱通常是不完整的，知识推理就是根据已有的知识推断出新的知识（补全缺失的三元组）。

**基于规则的推理**：
- 用逻辑规则进行推理，如：`出生地(X, Y) ∧ 城市属于省份(Y, Z) ⇒ 籍贯(X, Z)`
- 优点：可解释性强，结果精确
- 缺点：规则需要人工定义，覆盖率低，推理复杂度高
- 代表系统：Drools、Jena、Vadalog

**基于表示学习的推理（链接预测）**：
- 用知识图谱嵌入模型来预测缺失的三元组
- 任务形式：给定 (h, r, ?) 预测尾实体，或给定 (?, r, t) 预测头实体
- 方法：TransE、RotatE 等嵌入模型，计算候选实体的分数并排序
- 优点：泛化能力强，效率高
- 缺点：可解释性弱

**基于图神经网络的推理**：
- 用 GNN 在图谱上传播信息，学习节点表示
- 代表模型：R-GCN（关系图卷积网络）、CompGCN

**多跳推理**：
- 在知识图谱上进行多步路径查找来回答问题
- 方法：路径排序算法（PRA）、强化学习（DeepPath、MINERVA）

**应用场景**：
- 智能问答：将自然语言问题转化为图谱查询
- 推荐系统：利用用户-物品的知识关联做推荐
- 金融风控：通过关联分析识别欺诈风险
- 医疗诊断：结合医学知识辅助诊断

## 完整跑通方案

### 第一步：环境准备与数据集介绍

用 **PyKEEN**（Python Knowledge Graph Embeddings），它是目前最活跃的知识图谱表示学习库，集成了几十种模型和标准数据集。

```bash
pip install pykeen
```

常用的标准数据集：
- **FB15k-237**：Freebase 子集，14541 个实体，237 种关系，310116 个三元组
- **WN18RR**：WordNet 子集，40943 个实体，11 种关系，93003 个三元组
- **YAGO3-10**：YAGO3 子集，123182 个实体，37 种关系，1079040 个三元组

### 第二步：训练 TransE 模型（简洁版）

```python
from pykeen.pipeline import pipeline

result = pipeline(
    model="TransE",
    dataset="FB15k237",
    training_kwargs=dict(num_epochs=100, batch_size=256),
    model_kwargs=dict(embedding_dim=100),
    optimizer="Adam",
    optimizer_kwargs=dict(lr=0.001),
    loss="marginranking",
    loss_kwargs=dict(margin=1.0),
    random_seed=42,
    device="cuda",
)

print(f"MRR: {result.metric_results.get_metric('mrr'):.4f}")
print(f"Hits@10: {result.metric_results.get_metric('hits@10'):.4f}")
```

**评估指标说明**：
- **MRR**（Mean Reciprocal Rank）：正确实体排名倒数的平均值，越高越好
- **Hits@10**：正确实体排在前 10 位的比例，越高越好
- **MR**（Mean Rank）：正确实体的平均排名，越低越好

### 第三步：手动实现 TransE（理解底层）

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class TransE(nn.Module):
    def __init__(self, num_entities, num_relations, embedding_dim, margin=1.0):
        super().__init__()
        self.num_entities = num_entities
        self.num_relations = num_relations
        self.embedding_dim = embedding_dim
        self.margin = margin
        
        self.entity_embeddings = nn.Embedding(num_entities, embedding_dim)
        self.relation_embeddings = nn.Embedding(num_relations, embedding_dim)
        
        # 初始化
        nn.init.xavier_uniform_(self.entity_embeddings.weight)
        nn.init.xavier_uniform_(self.relation_embeddings.weight)
        # 关系向量归一化（论文中的做法）
        self.relation_embeddings.weight.data = F.normalize(
            self.relation_embeddings.weight.data, p=2, dim=1
        )
    
    def forward(self, head, relation, tail):
        # 实体向量每次前向传播前归一化
        self.entity_embeddings.weight.data = F.normalize(
            self.entity_embeddings.weight.data, p=2, dim=1
        )
        
        h = self.entity_embeddings(head)
        r = self.relation_embeddings(relation)
        t = self.entity_embeddings(tail)
        
        # L1 距离
        score = torch.norm(h + r - t, p=1, dim=1)
        return score
    
    def loss_fn(self, positive_score, negative_score):
        return torch.mean(F.relu(self.margin + positive_score - negative_score))

# 负采样：把正例中的头实体或尾实体随机替换
def corrupt_batch(heads, relations, tails, num_entities):
    neg_heads = heads.clone()
    neg_tails = tails.clone()
    
    mask = torch.rand(heads.shape) > 0.5
    neg_heads[mask] = torch.randint(0, num_entities, (mask.sum().item(),))
    neg_tails[~mask] = torch.randint(0, num_entities, (~mask.sum().item(),))
    
    return neg_heads, relations, neg_tails
```

### 第四步：用训练好的模型做链接预测

```python
import pykeen

# 加载训练好的模型
model = result.model
entity_to_id = result.training.entity_to_id
relation_to_id = result.training.relation_to_id
id_to_entity = {v: k for k, v in entity_to_id.items()}
id_to_relation = {v: k for k, v in relation_to_id.items()}

def predict_tail(head_str, relation_str, top_k=10):
    """给定头实体和关系，预测最可能的尾实体"""
    h_id = torch.tensor([entity_to_id[head_str]])
    r_id = torch.tensor([relation_to_id[relation_str]])
    
    # 计算与所有实体的分数
    model.eval()
    with torch.no_grad():
        h = model.entity_representations[0](h_id)
        r = model.relation_representations[0](r_id)
        all_entities = model.entity_representations[0](
            torch.arange(model.num_entities)
        )
        
        # TransE 评分：h + r 与 t 的距离
        pred = h + r
        scores = torch.norm(pred - all_entities, p=2, dim=1)
        # 分数越低越好，所以取负后排序
        top_scores, top_indices = torch.topk(-scores, top_k)
    
    results = [(id_to_entity[idx.item()], (-score).item()) 
               for idx, score in zip(top_indices, top_scores)]
    return results

# 示例：查询某个人的出生地
results = predict_tail("/m/0d060g", "/people/person/place_of_birth", top_k=5)
print("预测结果：")
for entity, score in results:
    print(f"  {entity}: {score:.4f}")
```

### 第五步：对比不同模型的效果

```python
models_to_try = ["TransE", "TransH", "TransR", "DistMult", "ComplEx", "RotatE"]
results_dict = {}

for model_name in models_to_try:
    print(f"训练 {model_name}...")
    res = pipeline(
        model=model_name,
        dataset="FB15k237",
        training_kwargs=dict(num_epochs=50, batch_size=256),
        model_kwargs=dict(embedding_dim=100),
        random_seed=42,
    )
    results_dict[model_name] = {
        "MRR": res.metric_results.get_metric("mrr"),
        "Hits@10": res.metric_results.get_metric("hits@10"),
    }
    print(f"  MRR: {results_dict[model_name]['MRR']:.4f}")
    print(f"  Hits@10: {results_dict[model_name]['Hits@10']:.4f}")
```

**预期结论**：在 FB15k-237 上，通常 RotatE > ComplEx > DistMult > TransR > TransH > TransE。RotatE 因为能建模更多关系模式，效果通常最好。

### 第六步：动手做一个简单的实体链接（可选拓展）

```python
# 用 spaCy + 简单的字符串匹配做实体链接原型
import spacy

nlp = spacy.load("zh_core_web_sm")

# 假设这是我们的知识库
knowledge_base = {
    "苹果": {"type": "公司", "描述": "美国科技公司，iPhone 制造商"},
    "苹果公司": {"type": "公司", "描述": "美国科技公司，iPhone 制造商"},
    "苹果（水果）": {"type": "水果", "描述": "蔷薇科苹果属植物的果实"},
    "北京": {"type": "城市", "描述": "中华人民共和国首都"},
    "北京市": {"type": "城市", "描述": "中华人民共和国首都"},
}

def entity_link(text):
    doc = nlp(text)
    results = []
    for ent in doc.ents:
        # 简化版：直接根据名称匹配（实际中需要消歧）
        matched = None
        for kb_name in knowledge_base:
            if ent.text in kb_name or kb_name in ent.text:
                matched = kb_name
                break
        results.append({
            "mention": ent.text,
            "type": ent.label_,
            "linked_entity": matched,
            "kb_info": knowledge_base.get(matched, "未找到")
        })
    return results

# 测试
print(entity_link("苹果今天发布了新的 iPhone"))
print(entity_link("我今天吃了一个苹果"))
```

## 常见误区

**"知识图谱就是 Neo4j 图数据库" → 不对。** 图数据库是存储和查询知识图谱的工具之一，知识图谱本身是一种数据组织方式和方法论。除了图数据库，你还可以用关系数据库、三元组存储（如 Virtuoso、Stardog）甚至纯文本文件来存知识图谱。

**"TransE 就是知识表示学习的全部" → 远远不是。** TransE 是最基础、最经典的模型，但它有很多局限。真实应用中更常用的是 RotatE、ComplEx、ConvE 等效果更好的模型，甚至是基于预训练语言模型的方法（如 KEPLER）。

**"构建知识图谱就是写规则抽实体抽关系" → 太天真了。** 抽取只是第一步，真正困难的是**知识融合**（消歧、对齐、去重）和**知识质量控制**。工业级知识图谱中，70% 以上的精力花在数据清洗和质量保证上。

**"有了知识图谱就能做复杂推理" → 理论上可以，实际上很难。** 简单的一跳、两跳查询没问题，但多跳复杂推理（尤其是需要逻辑组合的）在大规模图谱上效果还不理想。目前的趋势是把知识图谱和大语言模型结合起来，让 LLM 负责理解和推理，图谱负责提供准确的事实。

**"知识表示学习可以完全替代规则推理" → 各有优劣。** 表示学习泛化能力强但可解释性差，规则推理精确但覆盖率低。实际系统中往往是两者结合：用表示学习做候选生成，用规则做精确验证。

## 学习资源推荐

### 入门必读
1. **《知识图谱：方法、实践与应用》**（王昊奋等著）——国内最系统的知识图谱教材，从理论到工程全覆盖
2. **斯坦福 CS520: Knowledge Graphs** —— 课程讲义，系统全面
3. **《Knowledge Graphs: Foundations and Applications》** —— 学术向教材，理论深度足够

### 经典论文
1. **TransE**：Bordes et al., "Translating Embeddings for Modeling Multi-relational Data", NeurIPS 2013（知识表示学习开山之作）
2. **RotatE**：Sun et al., "RotatE: Knowledge Graph Embedding by Relational Rotation in Complex Space", ICLR 2019（目前效果最好的嵌入模型之一）
3. **Distant Supervision**：Mintz et al., "Distant Supervision for Relation Extraction without Labeled Text", ACL 2009（远程监督奠基论文）

### 开源工具
1. **PyKEEN**（https://github.com/pykeen/pykeen）—— 最活跃的知识图谱嵌入 Python 库，文档友好，适合入门
2. **OpenKE**（https://github.com/thunlp/OpenKE）—— 清华 THUNLP 出品，性能优化好，支持多种模型
3. **DGL-KE**（https://github.com/awslabs/dgl-ke）—— 基于 DGL 的大规模知识图谱嵌入，支持分布式训练
4. **spaCy + spaCy NER** —— 做 NER 和信息抽取的首选工具
5. **Neo4j** —— 最流行的图数据库，配合 Cypher 查询语言

### 公开数据集
1. **Wikidata** —— 最大的开源知识图谱，亿级实体
2. **Freebase / FB15k-237** —— 学术研究最常用的基准数据集
3. **WordNet / WN18RR** —— 词汇知识图谱，关系类型少但推理难
4. **YAGO** —— 高质量的百科知识图谱
5. **CN-DBpedia** —— 中文通用知识图谱（复旦大学）

### 进阶方向
- **知识图谱 + 大语言模型**：用 LLM 辅助知识抽取和补全，用图谱增强 LLM 的事实准确性（RAG 的重要方向）
- **多模态知识图谱**：融合文本、图像、视频等多模态知识
- **时序知识图谱**：考虑知识的时间有效性（事件是动态变化的）
- **企业知识图谱**：行业知识图谱构建与应用（金融、医疗、法律等）
