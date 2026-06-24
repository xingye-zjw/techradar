---
title: 图神经网络（GNN）基础
category: deep-learning
keywords:
  - gnn
  - graph neural network
  - gcn
  - gat
  - graphsage
  - message passing
  - pytorch geometric
difficulty: intermediate
duration: 1-2周
summary: 处理图结构数据的深度学习方法，在社交网络、分子预测、推荐系统等领域广泛应用。
takeaways:
  - 理解图的数学表示 G=(V,E) 和邻接矩阵 A，能在脑海中建立图结构的直觉
  - 掌握 GCN 的核心公式 H^(l+1) = σ(D^(-1/2)ÂD^(-1/2)H^(l)W^(l))，理解对称归一化的意义
  - 搞懂消息传递范式：每个节点聚合邻居信息→更新自身表示，这是所有 GNN 的通用框架
  - 能用 PyTorch Geometric 实现节点分类、链路预测、图分类三类典型任务
---

## 为什么你要学它

现实世界中大量数据天然就是图结构——社交网络的好友关系、分子的原子键、推荐系统的用户-物品交互、知识图谱的实体关系。传统深度学习（CNN、RNN）只能处理规则的网格或序列数据，面对不规则的图结构就束手无策。

**图神经网络（GNN）的核心价值：让深度学习能直接处理图结构数据，从节点关系中学习有用的表示。**

它的应用场景非常广泛：
- **节点分类**：预测社交网络中用户的兴趣标签
- **链路预测**：推荐系统中预测用户可能喜欢的物品
- **图分类**：预测分子的药物活性或材料属性
- **异常检测**：金融风控中识别可疑交易网络

掌握 GNN 之后，你就能处理一大批以前无法用深度学习解决的问题。

## 一句话概览（快速版）

你只要记住三句话：

1. **GNN = 每个节点反复"收集邻居信息 + 更新自己"**，层数越多，能看到的邻居范围越远
2. **核心是消息传递范式**：聚合（Aggregate）邻居消息 → 更新（Update）自身表示
3. **GCN 用邻居的加权平均，GAT 用注意力权重，GraphSAGE 用可学习的聚合函数**，本质都是邻居信息的不同整合方式

## 核心拆解

### 🔑 图的基本概念

一个图记作 **G = (V, E)**，其中：
- **V** 是节点集合，|V| = N 表示节点数量
- **E** 是边集合，每条边连接两个节点

**邻接矩阵 A**：N×N 的矩阵，A[i][j] = 1 表示节点 i 和节点 j 之间有边，否则为 0。

**节点特征矩阵 X**：N×F 的矩阵，每行是一个节点的 F 维特征向量。

**度矩阵 D**：对角矩阵，D[i][i] 表示节点 i 的度数（有多少条边相连）。

**直观理解**：想象一个社交网络，每个人是一个节点，好友关系是边。邻接矩阵记录"谁和谁是朋友"，节点特征记录每个人的年龄、性别、兴趣等属性。

### 🔑 GCN（图卷积网络）

GCN 是最经典的 GNN 变体，它的层定义为：

**H^(l+1) = σ(D^(-1/2) Â D^(-1/2) H^(l) W^(l))**

拆解一下：
- **H^(l)**：第 l 层的节点表示矩阵（N×d_l）
- **W^(l)**：第 l 层的可学习权重矩阵（d_l × d_{l+1}）
- **Â = A + I**：加入自环的邻接矩阵（让节点也能看到自己）
- **D^(-1/2) Â D^(-1/2)**：对称归一化后的邻接矩阵
- **σ**：激活函数（如 ReLU）

**为什么要归一化？**
- 如果不归一化，度数高的节点特征值会越来越大，度数低的节点会越来越小
- 左乘 D^(-1/2) 按行归一化，右乘 D^(-1/2) 按列归一化
- 最终效果等价于"邻居的加权平均"，度数高的邻居权重小，度数低的邻居权重大

**直觉理解**：GCN 就像每个节点把自己和邻居的特征加权平均一下，再通过一个全连接层变换。这个过程重复几层，每个节点就能融合到多跳邻居的信息。

### 🔑 GAT（图注意力网络）

GCN 对所有邻居一视同仁（权重只由度数决定），而 GAT 引入了**注意力机制**，让模型自动学习每个邻居的重要程度。

GAT 的核心步骤：
1. 对每个节点对 (i, j)，计算注意力系数 e_ij = a(W h_i || W h_j)
2. 用 softmax 归一化：α_ij = softmax_j(e_ij)
3. 聚合邻居：h_i' = σ(Σ_j α_ij W h_j)

**多头注意力**：和 Transformer 类似，GAT 也可以用多头注意力，每头学习不同的注意力模式，最后把结果拼接或平均。

**GCN vs GAT**：
- GCN：权重固定（由图结构决定），参数少，计算快
- GAT：权重可学习（由注意力机制决定），表达能力强，能区分不同邻居的重要性

### 🔑 消息传递机制

消息传递（Message Passing）是所有 GNN 的统一抽象框架，分为两步：

**1. 消息阶段（Message）**：每个邻居节点构造一条"消息"发给中心节点
- 消息函数通常是：m_j→i = M(h_i, h_j, e_ij)
- 最简单的消息就是邻居的特征本身

**2. 聚合+更新阶段（Aggregate + Update）**：
- 聚合：把所有邻居发来的消息合并成一个向量
  - 常用聚合函数：sum、mean、max、attention
- 更新：用聚合后的消息更新中心节点的表示
  - 更新函数通常是：h_i' = U(h_i, AGG({m_j→i | j ∈ N(i)}))

**数学表达**：
```
h_i^(l+1) = UPDATE( h_i^(l), AGGREGATE( { MESSAGE(h_i^(l), h_j^(l), e_ij) | j ∈ N(i) } ) )
```

**为什么这个框架重要？**
- GCN、GAT、GraphSAGE 都可以用这个框架表示
- PyTorch Geometric 就是基于这个范式设计的
- 理解了消息传递，你就能快速理解任何新的 GNN 变体

### 🔑 GraphSAGE

GraphSAGE（SAmple and aggreGatE）解决了 GCN 的两个实际问题：
1. **直推式学习（Transductive）**：GCN 训练时需要所有节点（包括测试节点），GraphSAGE 是归纳式（Inductive）的，能泛化到未见过的节点
2. **全图计算**：GCN 每次都要处理整张图，大图上显存不够。GraphSAGE 用小批量（mini-batch）训练，每次只采样部分邻居

GraphSAGE 的核心思想：
- **采样（Sample）**：对每个节点，随机采样固定数量的邻居（而不是用所有邻居）
- **聚合（Aggregate）**：用可学习的聚合函数（Mean、LSTM、Pooling）聚合邻居信息
- **更新**：把自身特征和聚合后的邻居特征拼接起来再过全连接层

聚合函数对比：
- **Mean aggregator**：邻居特征取平均，类似 GCN
- **LSTM aggregator**：把邻居随机排序后过 LSTM，表达能力更强
- **Pooling aggregator**：每个邻居过全连接层后取 max

## 完整跑通方案

### 环境准备

```bash
pip install torch torch-geometric torch-scatter torch-sparse
```

### 第一步：节点分类（Cora 数据集）

```python
import torch
import torch.nn.functional as F
from torch_geometric.nn import GCNConv
from torch_geometric.datasets import Planetoid

# 加载 Cora 数据集（论文引用网络）
dataset = Planetoid(root='/tmp/Cora', name='Cora')
data = dataset[0]

print(f"节点数: {data.num_nodes}")
print(f"边数: {data.num_edges}")
print(f"节点特征维度: {data.num_features}")
print(f"类别数: {dataset.num_classes}")

# 定义一个简单的 2 层 GCN
class GCN(torch.nn.Module):
    def __init__(self, hidden_channels):
        super().__init__()
        self.conv1 = GCNConv(dataset.num_features, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, dataset.num_classes)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.5, training=self.training)
        x = self.conv2(x, edge_index)
        return x

model = GCN(hidden_channels=16)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)

# 训练
def train():
    model.train()
    optimizer.zero_grad()
    out = model(data.x, data.edge_index)
    loss = F.cross_entropy(out[data.train_mask], data.y[data.train_mask])
    loss.backward()
    optimizer.step()
    return loss.item()

# 测试
def test():
    model.eval()
    out = model(data.x, data.edge_index)
    pred = out.argmax(dim=1)
    test_correct = pred[data.test_mask] == data.y[data.test_mask]
    test_acc = int(test_correct.sum()) / int(data.test_mask.sum())
    return test_acc

for epoch in range(1, 101):
    loss = train()
    if epoch % 20 == 0:
        test_acc = test()
        print(f"Epoch {epoch:3d}, Loss: {loss:.4f}, Test Acc: {test_acc:.4f}")
```

### 第二步：用 GAT 做节点分类

```python
from torch_geometric.nn import GATConv

class GAT(torch.nn.Module):
    def __init__(self, hidden_channels, heads=8):
        super().__init__()
        self.conv1 = GATConv(dataset.num_features, hidden_channels, heads=heads, dropout=0.6)
        self.conv2 = GATConv(hidden_channels * heads, dataset.num_classes, heads=1, dropout=0.6)

    def forward(self, x, edge_index):
        x = F.dropout(x, p=0.6, training=self.training)
        x = self.conv1(x, edge_index)
        x = F.elu(x)
        x = F.dropout(x, p=0.6, training=self.training)
        x = self.conv2(x, edge_index)
        return x

model = GAT(hidden_channels=8, heads=8)
```

### 第三步：图分类（用 GraphSAGE + 全局池化）

```python
from torch_geometric.nn import SAGEConv, global_mean_pool
from torch_geometric.datasets import TUDataset
from torch_geometric.loader import DataLoader

# 加载 MUTAG 数据集（分子图分类）
dataset = TUDataset(root='/tmp/MUTAG', name='MUTAG')
dataset = dataset.shuffle()
train_dataset = dataset[:150]
test_dataset = dataset[150:]
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=32)

class GraphSAGE(torch.nn.Module):
    def __init__(self, hidden_channels):
        super().__init__()
        self.conv1 = SAGEConv(dataset.num_features, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, hidden_channels)
        self.conv3 = SAGEConv(hidden_channels, hidden_channels)
        self.lin = torch.nn.Linear(hidden_channels, dataset.num_classes)

    def forward(self, x, edge_index, batch):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = self.conv2(x, edge_index)
        x = F.relu(x)
        x = self.conv3(x, edge_index)
        x = global_mean_pool(x, batch)  # 图级别的池化
        x = F.dropout(x, p=0.5, training=self.training)
        x = self.lin(x)
        return x

model = GraphSAGE(hidden_channels=64)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

def train():
    model.train()
    for data in train_loader:
        out = model(data.x, data.edge_index, data.batch)
        loss = F.cross_entropy(out, data.y)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

def test(loader):
    model.eval()
    correct = 0
    for data in loader:
        out = model(data.x, data.edge_index, data.batch)
        pred = out.argmax(dim=1)
        correct += int((pred == data.y).sum())
    return correct / len(loader.dataset)

for epoch in range(1, 101):
    train()
    if epoch % 20 == 0:
        train_acc = test(train_loader)
        test_acc = test(test_loader)
        print(f"Epoch {epoch:3d}, Train Acc: {train_acc:.4f}, Test Acc: {test_acc:.4f}")
```

### 第四步：链路预测

```python
from torch_geometric.utils import train_test_split_edges, negative_sampling

# 准备数据
data = Planetoid(root='/tmp/Cora', name='Cora')[0]
data = train_test_split_edges(data)

class GCNEncoder(torch.nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.conv1 = GCNConv(in_channels, 2 * out_channels)
        self.conv2 = GCNConv(2 * out_channels, out_channels)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index).relu()
        return self.conv2(x, edge_index)

class LinkPredictor(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = GCNEncoder(dataset.num_features, 64)

    def decode(self, z, edge_index):
        return (z[edge_index[0]] * z[edge_index[1]]).sum(dim=-1)

    def forward(self, x, edge_index, pos_edge_index, neg_edge_index):
        z = self.encoder(x, edge_index)
        pos_out = self.decode(z, pos_edge_index)
        neg_out = self.decode(z, neg_edge_index)
        return pos_out, neg_out

model = LinkPredictor()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

def train():
    model.train()
    optimizer.zero_grad()
    neg_edge_index = negative_sampling(
        edge_index=data.train_pos_edge_index,
        num_nodes=data.num_nodes,
        num_neg_samples=data.train_pos_edge_index.size(1)
    )
    pos_out, neg_out = model(
        data.x, data.train_pos_edge_index,
        data.train_pos_edge_index, neg_edge_index
    )
    loss = -torch.log(pos_out.sigmoid() + 1e-7).mean() - torch.log(1 - neg_out.sigmoid() + 1e-7).mean()
    loss.backward()
    optimizer.step()
    return loss.item()
```

## 常见误区

**"GNN 层数越深越好" → 不对。** GNN 层数太深会导致**过平滑（Over-smoothing）**——所有节点的表示变得越来越相似，失去区分度。实际应用中 2-3 层通常就够了，很少超过 5 层。

**"邻接矩阵就是原始的 A" → 不对。** 实际用的时候几乎都会加自环（Â = A + I），这样节点在聚合时也能考虑自己的信息。GCN 还会做对称归一化。

**"GNN 只能处理有向图/无向图" → 都可以。** 有向图只需要邻接矩阵不对称就行，PyG 的 edge_index 也天然支持有向边。

**"消息传递就是简单平均" → 不对。** 平均只是聚合函数的一种，还有 sum、max、attention、LSTM 等。聚合函数的选择对模型效果影响很大。

**"GraphSAGE 的采样越少越快，不影响效果" → 不对。** 采样太少会导致邻居信息估计不准，效果下降。通常采样 10-25 个邻居是速度和效果的折中。

**"GNN 只能处理同构图" → 不对。** 异构图（不同类型的节点和边）可以用 RGCN、HAN 等模型，知识图谱就是典型的异构图。

## 学习资源推荐

1. **图机器学习导论（Stanford CS224W）**：最权威的 GNN 课程，从图论基础到前沿研究都有覆盖
2. **PyTorch Geometric 官方文档**：最实用的 GNN 框架，教程和例子非常丰富
3. **《Graph Representation Learning》by William Hamilton**：GraphSAGE 一作写的书，理论扎实
4. **GCN 原论文《Semi-Supervised Classification with Graph Convolutional Networks》**：入门必读
5. **GAT 原论文《Graph Attention Networks》**：理解注意力机制在图上的应用
6. **GraphSAGE 原论文《Inductive Representation Learning on Large Graphs》**：理解归纳式学习和邻居采样
