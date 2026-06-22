---
title: entropy
category: math
summary: 熵衡量「知道结果前还有多少不确定性」——越均匀的分布熵越高，越确定的分布熵越低
---

信息熵 H(X) = -Σ P(x)log₂P(x) 衡量一个概率分布的不确定性（或信息量的期望值）。

## 直观理解

信息量 = 知道事件发生后的信息增益 = -log P(x)

- P(x) 小（事件罕见）→ 信息量大
- P(x) = 1（确定事件）→ 信息量 = 0

熵是所有可能事件的信息量的概率加权平均。

## 数值示例

| 分布 | 熵 | 含义 |
|---|---|---|
| 公平硬币 P(0.5/0.5) | 1 bit | 最不确定 |
| 偏置硬币 P(0.9/0.1) | ~0.47 bit | 较确定 |
| 确定分布 P(1/0) | 0 bit | 完全确定 |

## 在 ML 中的应用

- **决策树**：选择使加权熵下降最多的特征进行分裂
- **最大熵模型**：在没有额外假设时，熵最大的分布是最合理的
- **VAE / GAN**：用熵作为正则项，防止生成器 collapse
- **注意力权重分析**：高熵 = attention 分散（exploring），低熵 = attention 集中（exploiting）

## 与其他概念的关系

```
互信息 I(X;Y) = H(X) - H(X|Y) = H(X) + H(Y) - H(X,Y)
交叉熵 H(P,Q) = H(P) + D_KL(P||Q)
```

## 相关资源

- [Elements of Information Theory (Cover & Thomas)](https://www.goodreads.com/book/show/1796510.Elements_of_Information_Theory)
