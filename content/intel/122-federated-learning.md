---
title: 联邦学习
category: machine-learning
difficulty: intermediate
duration: 2-3周
summary: 数据不出本地、模型共享的分布式机器学习范式。解决数据孤岛与隐私保护的核心技术，金融、医疗、IoT 等场景刚需。
takeaways:
  - 理解"数据不动模型动"的核心思想，分清横向/纵向/联邦迁移三种联邦学习的适用场景
  - 掌握 FedAvg 算法流程：客户端本地训练→上传参数→服务器聚合→下发更新
  - 明白通信效率优化（客户端采样、模型压缩、增量更新）和隐私保护（DP、HE、MPC）的技术思路
  - 用 Flower 框架跑通一个完整的联邦图像分类实验，感受 Non-IID 数据对模型性能的影响
relatedIntel:
  - 112-rl-basics
  - 116-recommender-systems
  - 118-anomaly-detection
tags:
  - federated learning
  - fedavg
  - 隐私计算
  - 差分隐私
  - 同态加密
  - non-iid
  - flower
  - fedml
  - fate
---

## 为什么你要学它

先讲结论：**联邦学习 = 数据不出本地，模型共享训练。**

过去十年 AI 的发展依赖"把所有数据集中到一个地方训练"，但这条路越来越走不通了：

- **法规限制**： GDPR、《个人信息保护法》要求数据本地化，跨机构数据共享动辄违法
- **商业壁垒**：银行、医院、互联网公司的数据都是核心资产，不可能随便拿出来
- **隐私风险**：集中式训练容易发生数据泄露，一条训练数据可能就能反推出用户信息

联邦学习的核心思路是**"数据不动模型动"**：每个参与方在本地用自己的数据训练，只把模型参数（或梯度）传给服务器聚合，原始数据永远不离开本地。

理解联邦学习后，你就能回答：为什么多家医院可以联合训练一个医疗影像模型却不共享病历？为什么手机键盘能在不泄露你聊天记录的情况下越用越懂你？

## 一句话概览（快速版）

你只要记住三句话：

1. **联邦学习 = 多个客户端在本地训练，服务器只聚合模型参数，数据从不离开本地**
2. **FedAvg 是最基础的联邦算法：本地跑几轮 SGD，把参数加权平均发回去**
3. **三大挑战：数据异构（Non-IID）、通信开销大、系统异构（设备能力参差不齐）**

## 核心拆解

### 🔑 联邦学习的三种范式

根据数据分布的特点，联邦学习分为三类：

**横向联邦学习（Horizontal Federated Learning）**
- 特点：**样本重叠少，特征重叠多**
- 场景：不同用户相同特征。比如两家银行各自有不同的客户，但客户的特征字段（年龄、收入、存款）差不多
- 直觉：按"行"切分数据，每方有不同的样本行，特征列一样
- 典型应用：输入法预测、手机端个性化推荐

**纵向联邦学习（Vertical Federated Learning）**
- 特点：**样本重叠多，特征重叠少**
- 场景：不同特征相同用户。比如一家银行和一家电商有很多共同用户，但银行有金融特征，电商有消费特征
- 直觉：按"列"切分数据，每方有不同的特征列，样本行（用户）重叠
- 典型应用：联合风控、联合营销、跨机构用户画像

**联邦迁移学习（Federated Transfer Learning）**
- 特点：**样本和特征重叠都很少**
- 场景：两边数据差异很大，需要用迁移学习把知识从一方迁移到另一方
- 典型应用：跨领域的小样本学习

### 🔑 FedAvg 算法（联邦平均）

FedAvg 是联邦学习的"Hello World"，由 Google 在 2017 年提出，用于手机键盘词预测。

**完整流程：**
```
服务器                    客户端1       客户端2       客户端N
  |                         |             |             |
  |------ 初始化模型 ------>|             |             |
  |                         |             |             |
  |                         |--本地训练-->|--本地训练-->|--本地训练-->
  |                         |             |             |
  |<----- 上传参数 ---------|-------------|-------------|
  |                         |             |             |
  |---- 加权平均聚合 ----|
  |                         |             |             |
  |------ 下发新模型 ------>|             |             |
  |                         |             |             |
  └──────── 重复多轮 ────────┴─────────────┴─────────────┘
```

**数学表达：**
```
每一轮 t：
1. 服务器随机选择 K 个客户端
2. 每个客户端 k 在本地数据上训练 E 轮，得到参数 w_k^t
3. 服务器聚合：w^{t+1} = Σ (n_k / n) * w_k^t
   其中 n_k 是客户端 k 的样本数，n 是总样本数
4. 把 w^{t+1} 下发给所有客户端
```

**关键设计选择：**
- **本地训练 E 轮再上传**（不是每步都传）：减少通信次数
- **客户端采样**：每轮只选一部分客户端，不是全部都参与
- **加权平均**：数据多的客户端权重更大

### 🔑 通信效率优化

通信是联邦学习最大的瓶颈之一——一万个手机客户端，每个传 100MB 的模型，一轮就是 1TB 流量。

**常用优化手段：**

1. **客户端采样（Client Sampling）**
   - 每轮只随机选 1%-10% 的客户端参与
   - 好处：显著减少服务器压力和总流量
   - 代价：收敛速度可能变慢

2. **模型压缩（Model Compression）**
   - **量化**：把 32 位浮点数压成 8 位甚至 1 位（SignSGD）
   - **稀疏化**：只上传梯度最大的前 1% 参数
   - **低秩分解**：用低秩矩阵近似大的权重矩阵

3. **增量更新（Incremental Updates）**
   - 只上传和上一轮的差值，不传完整模型
   - 结合模型压缩效果更好

4. **知识蒸馏（Knowledge Distillation）**
   - 不传模型参数，传软标签或中间表示
   - 数据量小得多，但需要设计好的蒸馏策略

### 🔑 隐私保护技术

只传梯度/参数就安全了吗？**不一定**。已有研究证明，从梯度中可以反推出训练数据的内容（梯度反演攻击）。

三层隐私保护手段，强度递增：

**1. 差分隐私（Differential Privacy, DP）**
- 思路：在梯度或参数中加噪声，让单条数据的存在与否无法被推断
- 常用：高斯机制、拉普拉斯机制
- 权衡：隐私保护越强（噪声越大），模型精度损失越大
- 优点：计算开销小，理论保证清晰
- 缺点：需要仔细调噪声量级

**2. 同态加密（Homomorphic Encryption, HE）**
- 思路：客户端把参数加密后上传，服务器在密文上直接做加法运算
- 特点：加密后的数据，服务器可以计算但看不懂
- 优点：隐私保护强度极高
- 缺点：计算开销巨大（通常慢 100-1000 倍），只支持加法等有限运算

**3. 安全多方计算（Secure Multi-Party Computation, MPC）**
- 思路：多方联合计算，每方只拿到自己那部分的"碎片"，合在一起才有意义
- 典型协议：秘密共享（Secret Sharing）、混淆电路（Garbled Circuits）
- 优点：隐私保护强度极高，不依赖可信第三方
- 缺点：通信轮次多，复杂度高

**实际选型：**
- 对精度要求高、能接受一定隐私风险 → 差分隐私
- 对隐私要求极高、计算资源充足 → 同态加密 + 只加密关键层
- 多方对等、没有可信中心 → 安全多方计算

### 🔑 联邦学习的三大挑战

**挑战一：Non-IID 数据（非独立同分布）**

集中式训练假设所有数据独立同分布，但联邦学习中每个客户端的数据分布可能差异巨大——医院 A 癌症患者多，医院 B 健康人多，直接 FedAvg 聚合出来的模型可能哪边都不讨好。

Non-IID 的几种类型：
- **数量偏移**：每个客户端数据量差异大
- **标签分布偏移**：每个客户端的标签类别分布不同（比如客户端 1 全是猫，客户端 2 全是狗）
- **特征分布偏移**：相同标签的特征分布不同（比如不同医院的 CT 机参数不同）
- **概念偏移**：相同特征对应不同标签（地域差异导致）

**常见应对：**
- 个性化联邦学习：每个客户端学习自己的个性化模型
- FedProx：在本地损失中加近端项（proximal term），限制本地模型偏离全局模型
- 聚类 + 联邦：先把相似客户端聚类，每组训练一个模型

**挑战二：通信开销**

前面讲的通信效率优化就是解决这个的。实际工程中，通信往往比计算贵 1000 倍以上。

**挑战三：系统异构性**

客户端的计算能力、网络带宽、存储能力差异巨大：
- 有的设备是高端 GPU 服务器，有的是低端手机
- 有的设备随时可能掉线（手机锁屏、网络断了）
- 有的设备电量不足，不愿意参与计算

**常见应对：**
- 异步联邦学习：服务器不等所有客户端，来一个更新一个
- 客户端选择策略：优先选网络好、计算能力强的设备
- 容错机制：允许一部分客户端失败，不影响整体训练

## 完整跑通方案

我们用 Flower 框架（最流行的联邦学习框架之一）跑通一个联邦图像分类任务。

**第一步：环境准备**
```bash
pip install flwr torch torchvision
```

**第二步：写服务端代码（server.py）**
```python
import flwr as fl
from flwr.common import Metrics

def weighted_average(metrics):
    accuracies = [num_examples * m["accuracy"] for num_examples, m in metrics]
    examples = [num_examples for num_examples, _ in metrics]
    return {"accuracy": sum(accuracies) / sum(examples)}

strategy = fl.server.strategy.FedAvg(
    fraction_fit=1.0,      # 每轮选多少比例的客户端训练
    fraction_evaluate=1.0, # 每轮选多少比例的客户端评估
    min_fit_clients=2,     # 最少需要多少客户端才能开始训练
    min_evaluate_clients=2,
    min_available_clients=2,
    evaluate_metrics_aggregation_fn=weighted_average,
)

fl.server.start_server(
    server_address="0.0.0.0:8080",
    config=fl.server.ServerConfig(num_rounds=5),
    strategy=strategy,
)
```

**第三步：写客户端代码（client.py）**
```python
import flwr as fl
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms
import numpy as np

DEVICE = torch.device("cpu")

class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 6, 5)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(6, 16, 5)
        self.fc1 = nn.Linear(16 * 4 * 4, 120)
        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, 10)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = x.view(-1, 16 * 4 * 4)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = self.fc3(x)
        return x

def load_data(partition_id, num_partitions=2, non_iid=False):
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,))
    ])
    trainset = datasets.MNIST("./data", train=True, download=True, transform=transform)
    testset = datasets.MNIST("./data", train=False, transform=transform)
    
    if non_iid:
        # 模拟 Non-IID：每个客户端只拿到部分类别
        labels = np.array(trainset.targets)
        classes_per_client = 5
        start_class = (partition_id * classes_per_client) % 10
        classes = [(start_class + i) % 10 for i in range(classes_per_client)]
        indices = [i for i, label in enumerate(labels) if label in classes]
        trainset = Subset(trainset, indices)
    else:
        # IID：平均切分
        indices = list(range(len(trainset)))
        split = len(indices) // num_partitions
        start = partition_id * split
        end = start + split if partition_id < num_partitions - 1 else len(indices)
        trainset = Subset(trainset, indices[start:end])
    
    trainloader = DataLoader(trainset, batch_size=32, shuffle=True)
    testloader = DataLoader(testset, batch_size=32)
    return trainloader, testloader

def train(net, trainloader, epochs=1):
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.SGD(net.parameters(), lr=0.01, momentum=0.9)
    net.train()
    for _ in range(epochs):
        for images, labels in trainloader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            optimizer.zero_grad()
            loss = criterion(net(images), labels)
            loss.backward()
            optimizer.step()

def test(net, testloader):
    criterion = nn.CrossEntropyLoss()
    correct, total, loss = 0, 0, 0.0
    net.eval()
    with torch.no_grad():
        for images, labels in testloader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            outputs = net(images)
            loss += criterion(outputs, labels).item() * labels.size(0)
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
    accuracy = correct / total
    loss = loss / total
    return loss, accuracy

class MnistClient(fl.client.NumPyClient):
    def __init__(self, net, trainloader, testloader):
        self.net = net
        self.trainloader = trainloader
        self.testloader = testloader

    def get_parameters(self, config):
        return [val.cpu().numpy() for _, val in self.net.state_dict().items()]

    def set_parameters(self, parameters):
        params_dict = zip(self.net.state_dict().keys(), parameters)
        state_dict = {k: torch.tensor(v) for k, v in params_dict}
        self.net.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        train(self.net, self.trainloader, epochs=1)
        return self.get_parameters(config={}), len(self.trainloader.dataset), {}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        loss, accuracy = test(self.net, self.testloader)
        return loss, len(self.testloader.dataset), {"accuracy": accuracy}

if __name__ == "__main__":
    import sys
    partition_id = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    non_iid = len(sys.argv) > 2 and sys.argv[2] == "--noniid"
    
    net = Net().to(DEVICE)
    trainloader, testloader = load_data(partition_id, num_partitions=2, non_iid=non_iid)
    
    client = MnistClient(net, trainloader, testloader)
    fl.client.start_numpy_client(server_address="127.0.0.1:8080", client=client)
```

**第四步：运行实验**

打开三个终端：
```bash
# 终端 1：启动服务器
python server.py

# 终端 2：启动客户端 0
python client.py 0

# 终端 3：启动客户端 1
python client.py 1
```

**第五步：对比 IID vs Non-IID**
```bash
# Non-IID 模式（更接近真实场景）
python client.py 0 --noniid
python client.py 1 --noniid
```

观察两种模式下准确率的差异——Non-IID 下准确率会明显下降，这就是联邦学习真实面临的挑战。

**第六步：进阶实验**
- 试试 FedProx 策略（Flower 内置），看能不能缓解 Non-IID 问题
- 加入差分隐私，观察准确率和隐私预算的权衡
- 增加客户端数量到 5 个，设置客户端采样率 0.5

## 常见误区

**"联邦学习 = 完全隐私安全" → 错。** 基础的 FedAvg 不提供任何隐私保证，梯度反演攻击可以从梯度中恢复出原始数据。需要额外叠加 DP/HE/MPC 才能有隐私保证。

**"联邦学习比集中式学习精度低" → 通常是对的，但有例外。** 在 IID 数据下，FedAvg 和集中式训练精度差不多；但在 Non-IID 下通常会掉点。个性化联邦学习有时反而能在每个客户端上取得更好的效果。

**"通信开销只是流量问题" → 不止。** 还有延迟问题——一万个客户端，最慢的那个决定了一轮训练的时间（同步模式下）。所以才会有客户端选择、异步联邦等研究方向。

**"纵向联邦比横向联邦简单" → 恰恰相反。** 纵向联邦需要先做实体对齐（找出共同用户），还要处理特征分裂后的训练逻辑，工程复杂度比横向高得多。

## 学习资源推荐

1. **入门论文**：《Communication-Efficient Learning of Deep Networks from Decentralized Data》（FedAvg 原始论文，必读）
2. **综述论文**：《Federated Learning: Challenges, Methods, and Future Directions》（15 页快速了解全貌）
3. **Flower 官方教程**：https://flower.ai/docs/ （代码质量高，例子丰富）
4. **FedML 官方文档**：https://fedml.ai/ （学术界常用，支持更多算法）
5. **微众银行 FATE**：https://github.com/FederatedAI/FATE （工业界最成熟的纵向联邦框架）
6. **课程**：斯坦福 CS329S 第 10 讲（Federated Learning）
7. **书籍**：《联邦学习》（杨强等人著，中文系统介绍）
