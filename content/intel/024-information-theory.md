---
title: 信息论基础：熵、交叉熵与 KL 散度
category: math
difficulty: intermediate
duration: 1周
summary: 熵告诉我们「知道结果前还有多少不确定性」，交叉熵是损失函数的数学根源，KL 散度是模型逼近真相的代价
takeaways:
  - 能用公式计算离散分布的熵，理解熵的单位（bit vs nat）
  - 能从 KL 散度推导 Binary Cross-Entropy loss
  - 理解 MLE 和 MAP 的数学框架，以及它们与正则化的联系
  - 能用 AIC/BIC 做模型选择，理解奥卡姆剃刀的信息论解释
relatedIntel:
  - 025-convex-optimization
  - 072-math-linear-algebra
  - 073-math-probability
relatedNodes:
  - "math-information-theory"
  - "math-linear-algebra"
tags:
  - entropy
  - cross-entropy
  - kl-divergence
  - mutual information
  - mle
  - map
relatedTerms:
  - "tensor"
  - "matrix"
  - "entropy"
  - "convex-optimization"
relatedTools:
  - "pandas"
  - "numpy"
  - "jupyter"
---

## 为什么你要学它

信息论是连接**数学**和**机器学习**的桥梁。很多看似经验性的方法，追根溯源都能在信息论里找到理论解释：

- **交叉熵 loss** 的选择不是随便挑的，而是从 KL 散度最小化推导出来的
- **正则化**不是玄学，而是 MAP 估计中先验的数学体现
- **注意力机制**可以用互信息来解释：query 和 key 之间共享了多少信息

掌握信息论，能让你在调参时「知其然也知其所以然」，而不是靠玄学调参。

## 一句话概览

- 熵 H(X) = -Σ P(x) log P(x)：衡量一个分布的不确定性
- 交叉熵 H(P,Q) = -Σ P(x) log Q(x)：用 Q 编码来自 P 的信息需要多少 bit
- KL 散度 D_KL(P||Q) = H(P,Q) - H(P)：Q 偏离 P 的额外代价（非对称）
- 最小化交叉熵 = 最大化似然估计（当 P 是真实分布时）

## 核心拆解

### 🔑 熵的数学定义

```
H(X) = E[I(X)] = -E[log P(X)] = -Σ P(x) log P(x)
```

**直觉**：一个事件的信息量 = 「知道它发生后获得的信息」= -log P(x)。

- P(x) 越小（事件越罕见），I(x) 越大（知道它发生很有价值）
- P(x) = 1（确定事件），I(x) = 0（知道确定的事没有新信息）

**熵是信息量的期望**：所有可能事件的信息量按概率加权求和。

```
抛均匀硬币：H = -[0.5*log(0.5) + 0.5*log(0.5)] = 1 bit（最不确定）
抛正面概率 0.9：H ≈ 0.47 bit（相对确定）
```

### 🔑 从 KL 散度到 Cross-Entropy Loss

```python
# 手动实现交叉熵
def cross_entropy(y_true, y_pred):
    # y_true: one-hot, y_pred: softmax probability
    return -np.sum(y_true * np.log(y_pred + 1e-9))

# PyTorch 等价
import torch
import torch.nn.functional as F
loss = F.cross_entropy(logits, y_true)  # 内部做了 log_softmax + nll_loss
```

**推导**：从 KL 散度出发

```
D_KL(P||Q) = Σ P(x) log(P(x)/Q(x))
            = Σ P(x) log P(x) - Σ P(x) log Q(x)
            = -H(P) - Σ P(x) log Q(x)
            = -H(P) + H(P,Q)
```

因为 H(P) 对 Q 是常数，**最小化交叉熵等价于最小化 KL 散度**，等价于最大化似然。

### 🔑 MLE 与 MAP

**最大似然估计（MLE）**：

```
θ_MLE = argmax_θ P(X|θ) = argmax_θ log P(X|θ)
```

**最大后验估计（MAP）**：

```
θ_MAP = argmax_θ P(θ|X) = argmax_θ P(X|θ) P(θ)
```

**关键联系**：L2 正则化 ⇔ Gaussian Prior on θ（L2 惩罚项来自 log P(θ) 的梯度）

```python
# L2 正则化的来源：θ ~ N(0, λ²I)
log P(θ) = -||θ||² / (2λ²) + const
∇_θ log P(θ) = -θ / λ²  # 这就是 weight decay 的来源
```

### 🔑 AIC / BIC / 奥卡姆剃刀

```
AIC = -2 log L(θ̂) + 2k       # k = 参数数量
BIC = -2 log L(θ̂) + k log n  # n = 样本量
```

在 BIC 中，参数惩罚随样本量增长，样本越多越倾向于选择简单模型。这与奥卡姆剃刀的精神一致——**能用简单模型解释的数据，就不要用复杂模型**。

## 实战指南

### 熵的 NumPy 实现

```python
import numpy as np

def entropy(p):
    p = np.asarray(p)
    mask = (p > 0) & (p < 1)
    return -np.sum(p[mask] * np.log2(p[mask]))

def kl_divergence(p, q):
    p, q = np.asarray(p), np.asarray(q)
    mask = (p > 0) & (q > 0)
    return np.sum(p[mask] * np.log2(p[mask] / q[mask]))

# Bernoulli 熵曲线
ps = np.linspace(0.001, 0.999, 100)
hs = [entropy([p, 1-p]) for p in ps]
```

## 相关资源

- [Elements of Information Theory (Cover & Thomas)](https://www.goodreads.com/book/show/1796510.Elements_of_Information_Theory)
- [Information Theory Tutorial (Stanford CS229 补充材料)](https://cs.stanford.edu/~rvarun/)
- [MLE vs MAP 对比](https://sgfin.github.io/learning/must-reads/)
