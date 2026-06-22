# 凸优化（Convex Optimization）

**凸优化**研究的是凸函数在凸集上的最小化问题。关键性质：凸优化问题没有局部最优陷阱——任何局部最优都是全局最优。

## 基本概念

### 凸函数定义

```
对于任意 x₁, x₂ ∈ C 和 θ ∈ [0, 1]：
f(θx₁ + (1-θ)x₂) ≤ θf(x₁) + (1-θ)f(x₂)

几何意义：函数图像上任意两点的连线都在函数图像上方
```

### 凸优化问题的标准形式

```
最小化：  f(x)
约束条件：
  gᵢ(x) ≤ 0,  i = 1, ..., m  （不等式约束）
  hⱼ(x) = 0,  j = 1, ..., p  （等式约束）
  x ∈ C                        （集合约束）
```

## 核心性质

| 性质 | 说明 |
|------|------|
| **局部最优=全局最优** | 无局部最优陷阱 |
| **KKT条件** | 约束优化的最优性必要条件 |
| **对偶性** | 强对偶条件下，对偶问题给出原问题的紧界 |
| **收敛性** | 梯度下降以 O(1/T) 速率收敛 |

## 梯度下降优化

```python
import numpy as np

def gradient_descent(f, grad_f, x0, lr=0.01, max_iter=1000):
    """基础梯度下降"""
    x = x0
    for i in range(max_iter):
        gradient = grad_f(x)
        x = x - lr * gradient
        if np.linalg.norm(gradient) < 1e-6:
            break
    return x

def adam_optimizer(f, grad_f, x0, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
    """Adam自适应学习率优化器"""
    x = x0
    m = np.zeros_like(x)  # 一阶矩估计
    v = np.zeros_like(x)  # 二阶矩估计
    t = 0
    
    for i in range(1000):
        t += 1
        g = grad_f(x)
        m = beta1 * m + (1 - beta1) * g
        v = beta2 * v + (1 - beta2) * g**2
        m_hat = m / (1 - beta1**t)
        v_hat = v / (1 - beta2**t)
        x = x - lr * m_hat / (np.sqrt(v_hat) + eps)
    return x
```

## 在深度学习中的应用

### 常用优化器

```python
# PyTorch 中的优化器
import torch.optim as optim

# SGD - 随机梯度下降
optimizer = optim.SGD(model.parameters(), lr=0.01, momentum=0.9)

# Adam - 自适应学习率
optimizer = optim.Adam(model.parameters(), lr=0.001)

# AdamW - 权重衰减版本（推荐）
optimizer = optim.AdamW(model.parameters(), lr=0.001, weight_decay=0.01)
```

### 为什么 AdamW 比 Adam 好？

Adam 中的权重衰减实现有误，L2 正则化与自适应学习率产生了交互。AdamW 修正了这个问题，将权重衰减与梯度更新解耦。

## 应用场景

- **机器学习训练**：神经网络参数优化
- **支持向量机**：凸二次规划求解
- **资源分配**：线性规划、二次规划
- **投资组合优化**：马科维茨均值-方差模型
- **控制理论**：模型预测控制（MPC）

## 相关概念

[梯度下降](/glossary/gradient-descent)、[反向传播](/glossary/backpropagation)、[过拟合](/glossary/overfitting)、[正则化](/glossary/regularization)
