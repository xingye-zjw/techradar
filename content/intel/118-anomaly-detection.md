---
title: 异常检测
category: machine-learning
difficulty: intermediate
duration: 1-2周
summary: 从数据中识别\"不正常\"的样本，广泛应用于欺诈检测、工业质检、运维监控、医疗诊断等场景。
takeaways:
  - 理解异常检测的三种类型：点异常、上下文异常、集体异常
  - 掌握经典统计方法（3σ、IQR、Grubbs检验）和基于树/密度的算法（孤立森林、LOF）
  - 了解深度学习方法（Autoencoder、VAE、GAN）在异常检测中的应用
  - 能用 sklearn 和 PyOD 在真实数据集上跑通异常检测全流程
  - 明白类别不平衡问题对评估指标的影响，正确选择 Precision/Recall/F1/ROC-AUC/PR-AUC
relatedIntel:
  - 112-rl-basics
  - 116-recommender-systems
  - 122-federated-learning
tags:
  - anomaly detection
  - outlier detection
  - isolation forest
  - lof
  - one-class SVM
  - autoencoder
  - vae
  - gan
  - 离群点检测
relatedTerms:
  - "matrix"
  - "tensor"
  - "gradient-descent"
  - "convex-optimization"
relatedTools:
  - "numpy"
  - "pandas"
  - "scikit-learn"
relatedNodes:
  - "math-linear-algebra"
  - "llm-inference"
---

## 为什么你要学它

先讲结论：**异常检测 = 在海量正常数据中找出那 1% 甚至 0.1% 的"异类。**

在真实世界里，正常样本永远占大多数，"坏样本少之又少：

- 银行交易：1万笔交易里可能只有几笔是欺诈
- 工厂质检：1000个产品里可能只有1个次品
- 服务器监控：99%的时间系统正常，故障只占1%
- 医疗影像：肿瘤病灶只占整张影像的极小区域

分类算法在这里往往"水土不服"——训练数据里正样本太少，模型学不到什么。异常检测走了另一条路：**只学"正常长什么样"，然后把偏离正常的都标成异常。**

掌握异常检测，你就能解决一大类"分类算法搞不定"的真实问题。

## 一句话概览（快速版）

你只要记住三句话：

1. **异常检测的核心假设：正常样本是"大多数"，异常点和正常点在特征空间中距离很远或密度很低**
2. **方法谱系：从最简单的统计阈值（3σ、IQR）→ 经典机器学习（孤立森林、LOF、One-Class SVM）→ 深度学习（Autoencoder、VAE、GAN），复杂度逐级上升**
3. **评估不能只看准确率**：类别极不平衡时，准确率毫无意义，必须看 Precision、Recall、F1、ROC-AUC，更要看 PR-AUC

## 核心拆解

### 🔑 异常检测基础

#### 什么是异常？

异常（Anomaly / Outlier）= 与数据集中大多数样本的模式显著不同的数据点。

#### 三种异常类型

| 类型                                 | 定义                                                 | 例子                                                               |
| ------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------ |
| **点异常**（Point Anomaly）          | 单个数据点相对于整体数据分布是异常的                 | 一笔远高于日常消费水平的信用卡交易                                 |
| **上下文异常**（Contextual Anomaly） | 一个数据点在特定上下文中是异常的，但在全局看可能正常 | 北京 7 月气温 10℃（全局看正常，但夏天的背景下异常）                |
| **集体异常**（Collective Anomaly）   | 一组相关数据点整体是异常的，但单个点看可能正常       | 服务器 CPU 使用率连续 1 小时缓慢上升（每个单点都正常，但趋势异常） |

#### 三种学习范式

| 范式         | 训练数据               | 典型场景              | 代表算法                   |
| ------------ | ---------------------- | --------------------- | -------------------------- |
| **监督式**   | 有标注的正常和异常样本 | 异常样本足够多（>5%） | 常规分类器、XGBoost        |
| **半监督式** | 只有正常样本的标注     | 只能拿到正常数据      | One-Class SVM、SVDD        |
| **无监督式** | 没有任何标注           | 最常见，假设异常极少  | 孤立森林、LOF、Autoencoder |

> 实际工业界 90% 以上用的是无监督或半监督，因为标注异常太昂贵甚至不可能。

---

### 🔑 统计方法

统计方法的核心思想：**假设正常数据服从某种统计分布，偏离分布的就是异常。**

#### 3σ 原则（三西格玛法则）

如果数据服从正态分布，那么：

- 约 68.27% 的数据落在 μ ± σ 内
- 约 95.45% 的数据落在 μ ± 2σ 内
- 约 99.73% 的数据落在 μ ± 3σ 内

超出 μ ± 3σ 的数据点被视为异常。

```python
import numpy as np

def detect_3sigma(data):
    mu = np.mean(data)
    sigma = np.std(data)
    lower = mu - 3 * sigma
    upper = mu + 3 * sigma
    return (data < lower) | (data > upper)
```

**适用场景**：单变量、近似正态分布的数据。
**局限**：只对单变量有效，对多维数据需要先降维。

#### IQR（四分位距）

IQR = Q3 - Q1，即上四分位数减去下四分位数。

异常判定：小于 Q1 - 1.5×IQR 或大于 Q3 + 1.5×IQR 的点为异常。

```python
def detect_iqr(data):
    Q1 = np.percentile(data, 25)
    Q3 = np.percentile(data, 75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    return (data < lower) | (data > upper)
```

**特点**：对异常值本身不影响中位数和四分位数，比 3σ 更鲁棒。箱线图（Box Plot）用的就是这个规则。

#### Grubbs 检验（Grubbs' Test）

一种正式的统计假设检验方法，用于检测**单变量数据中是否存在异常值。

- 原假设 H₀：数据中没有异常值
- 备择假设 H₁：数据中存在异常值

检验统计量：G = max|x_i - x̄| / s

比较 G 与临界值，若 G > 临界值则拒绝原假设。

---

### 🔑 基于树的方法：孤立森林（Isolation Forest）

**核心直觉**：**异常点更容易被"孤立"**——只需要很少几次随机划分就能把它单独切出来。

正常点：周围有很多邻居，需要切很多刀才能分开。
异常点：孤零零的，切几刀就孤立了。

#### 算法步骤

1. 随机选一个特征，随机选一个分割值
2. 递归划分，直到每个点都被单独分出来
3. 计算每个点被孤立需要的划分次数（路径长度）
4. 路径越短，越可能是异常

**优点**：

- 对高维数据效果好
- 计算速度快，可扩展到大数据
- 无需假设数据分布

```python
from sklearn.ensemble import IsolationForest

iso = IsolationForest(
    n_estimators=100,    # 树的数量
    contamination=0.01,  # 预期异常比例
    random_state=42
)
y_pred = iso.fit_predict(X)  # 1=正常, -1=异常
```

---

### 🔑 基于距离/密度的方法

#### KNN（K-Nearest Neighbors）异常检测

核心思想：**异常点到它第 k 个最近邻的距离更大。

```python
from sklearn.neighbors import NearestNeighbors
import numpy as np

def knn_anomaly_score(X, k=5):
    nbrs = NearestNeighbors(n_neighbors=k)
    nbrs.fit(X)
    distances, _ = nbrs.kneighbors(X)
    return distances[:, -1]  # 到第k个近邻的距离作为异常分数
```

#### LOF（Local Outlier Factor，局部离群因子）

KNN 的升级版，核心改进：**不只看点到邻居的距离，还要看邻居们的密度——相对密度低的才是异常。**

LOF 定义：

- 点 p 到 o 的第 k 可达距离：reach-dist_k(p, o) = max(k-distance(o), d(p, o))
- 局部可达密度 lrd(p) = k / 所有邻居的可达距离之和
- LOF(p) = 邻居的平均lrd / p的lrd

**LOF > 1 → 异常（密度低于邻居 → 可能是异常）

```python
from sklearn.neighbors import LocalOutlierFactor

lof = LocalOutlierFactor(
    n_neighbors=20,
    contamination=0.01
)
y_pred = lof.fit_predict(X)
```

**适用场景**：数据存在不同密度的簇时，LOF 比孤立森林更准。

---

### 🔑 One-Class SVM

核心思想：**在特征空间中找一个超平面，把所有正常样本都"包"在里面，外面的就是异常。

和普通 SVM 的区别：

- 普通 SVM：分隔两类
- One-Class SVM：只学一类的边界

```python
from sklearn.svm import OneClassSVM

ocsvm = OneClassSVM(
    kernel='rbf',
    nu=0.01,  # 异常比例上限
    gamma='scale'
)
y_pred = ocsvm.fit_predict(X)
```

**特点**：对高维数据效果不错，但计算复杂度高，不适合大数据量。

---

### 🔑 深度学习方法

#### Autoencoder（自编码器）

核心思想：**用编码器把数据压缩，再用解码器还原。异常点的重建误差更大。**

```
输入 → 编码器 → 低维编码 → 解码器 → 重建输出
异常分数 = MSE(输入, 重建输出)
```

正常样本：模型学过怎么重建，误差小
异常样本：模型没见过，重建不出来，误差大

```python
import torch
import torch.nn as nn

class Autoencoder(nn.Module):
    def __init__(self, input_dim, hidden_dim=32):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Linear(64, hidden_dim),
        )
        self.decoder = nn.Sequential(
            nn.Linear(hidden_dim, 64),
            nn.ReLU(),
            nn.Linear(64, input_dim),
        )

    def forward(self, x):
        z = self.encoder(x)
        x_recon = self.decoder(z)
        return x_recon

# 训练：只在正常样本上训练
# 推理：计算重建误差，误差大的是异常
```

#### VAE（变分自编码器）

Autoencoder 的概率版本，编码器输出的不是一个点，而是一个分布（均值和方差）。

异常分数可以用：

- 重建误差 + KL 散度
- 重建误差的概率
- 似然度

#### GAN（生成对抗网络）

用 GAN 做异常检测的思路：

- 生成器学会生成正常样本
- 判别器判断输入是否为正常
- 异常样本无法被生成器还原，判别器也判不出来

常见变体：AnoGAN、EGBAD 等。

---

### 🔑 时序异常检测

时序数据的异常检测有额外的挑战：数据有序列依赖关系，不能简单当成独立样本。

#### 常见方法

| 方法                   | 原理                                       | 适用场景           |
| ---------------------- | ------------------------------------------ | ------------------ |
| **滑动窗口 + 统计**    | 窗口内计算均值/方差，超出阈值报警          | 简单周期性强的指标 |
| **STL 分解**           | 把序列拆成趋势+季节+残差，残差异常就是异常 | 有明显季节性的数据 |
| **ARIMA / 残差         | 拟合ARIMA模型，残差异常                    | 线性时序           |
| **LSTM / Transformer** | 用前 N 步预测第 N+1 步，预测误差大的是异常 | 复杂非线性时序     |
| **Donut / MTAD-GAT**   | 专门的深度学习异常检测模型                 | 工业级复杂系统     |

#### 关键概念

- **点异常**：某个时刻的值异常
- **序列异常**：连续一段的模式异常
- **上下文异常**：考虑趋势、季节性后的异常

---

### 🔑 评估指标

#### 为什么不能用准确率？

假设异常比例 0.1%，模型全预测为正常，准确率 99.9%——但毫无意义。

#### 核心指标

| 指标                    | 公式                | 含义                               |
| ----------------------- | ------------------- | ---------------------------------- |
| **Precision（精确率）** | TP / (TP + FP)      | 预测为异常的里面，有多少真的是异常 |
| **Recall（召回率）**    | TP / (TP + FN)      | 真正的异常里，有多少被找出来了     |
| **F1 Score**            | 2 × P × R / (P + R) | Precision 和 Recall 的调和平均     |
| **ROC-AUC**             | ROC 曲线下面积      | 模型区分正负样本的能力             |
| **PR-AUC**              | PR 曲线下面积       | **类别极不平衡时更可靠**           |

> **经验法则**：异常比例 < 5% 时，PR-AUC 比 ROC-AUC 更能反映真实性能。

#### 类别不平衡处理

1. **调整阈值**：不要用默认 0.5 阈值，根据业务需求调整
2. **重采样**：上采样异常样本（SMOTE）、下采样正常样本
3. **代价敏感学习**：给异常样本更高的损失权重
4. **集成学习**：EasyEnsemble、BalanceCascade
5. **一分类**：干脆当异常检测问题来做

## 完整跑通方案

我们用 PyOD（Python Outlier Detection）库，它封装了几乎所有主流异常检测算法。

### 第一步：安装 PyOD

```bash
pip install pyod scikit-learn pandas numpy matplotlib
```

### 第二步：生成测试数据 + 跑通孤立森林

```python
import numpy as np
import pandas as pd
from pyod.models.iforest import IForest
from pyod.models.lof import LOF
from pyod.models.ocsvm import OCSVM
from pyod.utils.data import generate_data
from pyod.utils.utility import standardizer
from sklearn.metrics import roc_auc_score, average_precision_score

# 生成模拟数据：1000个样本，10%异常
X_train, X_test, y_train, y_test = generate_data(
    n_train=500, n_test=500, n_features=10,
    contamination=0.1, random_state=42
)

# 标准化
X_train_norm, X_test_norm = standardizer(X_train, X_test)

# 孤立森林
clf = IForest(contamination=0.1, random_state=42)
clf.fit(X_train_norm)

# 预测
y_train_pred = clf.labels_  # 0=正常, 1=异常
y_train_scores = clf.decision_scores_  # 异常分数
y_test_pred = clf.predict(X_test_norm)
y_test_scores = clf.decision_function(X_test_norm)

# 评估
roc_auc = roc_auc_score(y_test, y_test_scores)
pr_auc = average_precision_score(y_test, y_test_scores)
print(f"ROC-AUC: {roc_auc:.4f}")
print(f"PR-AUC:  {pr_auc:.4f}")
```

### 第三步：多算法对比

```python
from pyod.models.knn import KNN
from pyod.models.auto_encoder import AutoEncoder

models = {
    'Isolation Forest': IForest(contamination=0.1, random_state=42),
    'LOF': LOF(contamination=0.1),
    'One-Class SVM': OCSVM(contamination=0.1),
    'KNN': KNN(contamination=0.1),
}

results = {}
for name, model in models.items():
    model.fit(X_train_norm)
    scores = model.decision_function(X_test_norm)
    roc_auc = roc_auc_score(y_test, scores)
    pr_auc = average_precision_score(y_test, scores)
    results[name] = {'ROC-AUC': roc_auc, 'PR-AUC': pr_auc}
    print(f"{name:20s} ROC-AUC: {roc_auc:.4f}  PR-AUC: {pr_auc:.4f}")
```

### 第四步：在真实数据集上实践

推荐数据集：

- **KDD Cup 1999**：网络入侵检测
- **Credit Card Fraud Detection**（Kaggle）：信用卡欺诈
- **SKAB**：工业时序异常检测

```python
# 以 sklearn 的 breast cancer 数据集做二分类问题转异常检测
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split

data = load_breast_cancer()
X, y = data.data, 1 - data.target  # 把少数类当异常

# 只拿正常样本训练
X_normal = X[y == 0]
X_test, y_test = X, y

clf = IForest(contamination=0.37, random_state=42)  # 大致异常比例
clf.fit(X_normal)

scores = clf.decision_function(X_test)
print(f"ROC-AUC: {roc_auc_score(y_test, scores):.4f}")
```

### 第五步：调参与工程实践清单

- [ ] 数据预处理：标准化/归一化、缺失值处理
- [ ] 特征工程：根据业务构造有区分度的特征
- [ ] 算法选择：先试孤立森林（快、稳），再试 LOF，最后深度学习
- [ ] 阈值选择：根据业务 Precision/Recall 偏好调
- [ ] 集成：多个算法结果取平均或投票
- [ ] 持续监控：数据分布会变，模型要定期更新

## 常见误区

**"异常检测就是找离群点，很简单" → 错。** 异常检测难在：什么是"正常"本身就在变（概念漂移），而且你永远不知道未知异常长什么样。

**"用准确率评估模型好坏" → 大错特错。** 1% 异常率下，全猜正常都有 99% 准确率。必须看 PR-AUC、Recall@特定Precision 等业务相关指标。

**"contamination 参数设得越准越好" → 不一定。** 很多算法的 contamination 只影响最终阈值划分，不影响异常分数排序。实际中更可靠的做法是看分数分布，根据业务需求定阈值。

**"深度学习一定比传统方法好" → 错。** 数据量小、特征工程到位时，孤立森林往往吊打深度学习。深度学习在高维、数据量大、有复杂模式时才有优势。

**"特征越多越好" → 不一定。** 高维空间里距离概念都变得模糊（维度灾难），反而会让异常检测效果下降。必要时先做降维（PCA、t-SNE）。

## 学习资源推荐

1. **PyOD 官方文档**（https://pyod.readthedocs.io/）：最全面的 Python 异常检测库，30+ 算法开箱即用
2. **《Outlier Analysis》** by Charu C. Aggarwal：异常检测领域的经典教科书
3. **scikit-learn 异常检测章节**：入门级介绍，把核心算法讲清楚
4. **《Anomaly Detection for Time Series》**（O'Reilly）：时序异常检测的工程实践
5. **Awesome Anomaly Detection**（GitHub 仓库）：论文、数据集、工具大合集
6. **Kaggle Credit Card Fraud Detection**：实战入门的经典竞赛，看别人的解决方案学习思路
