---
title: 凸优化理论基础
category: math
difficulty: advanced
duration: 1周
summary: 梯度下降不是玄学——理解它的收敛性证明，才能真正用好学习率调度和优化器选择
takeaways: "- 理解凸集、凸函数的定义，以及凸优化问题「局部最优=全局最优」的重要性
  - 能用 CVXPY 求解约束优化问题并验证 KKT 条件
  - 能从原理理解 Adam 的一阶/二阶矩估计和偏差校正
  - 能区分 L1/L2 正则化并用几何直觉解释稀疏性"
relatedTerms: ["matrix", "entropy", "convex-optimization", "transformer"]
relatedIntel: "- 024-information-theory
  - 072-math-linear-algebra
  - 073-math-probability"
relatedNodes: ["math-linear-algebra", "math-optimization"]
tags: "- convex optimization
  - gradient descent
  - adam
  - sgd
  - lagrangian
  - kkt
  - regularization"
relatedTools: ["pandas", "numpy", "jupyter"]
---

## 为什么你要学它

深度学习工程师每天都在用优化器：SGD、Adam、AdamW... 但大多数人是「哪个效果好就用哪个」，调参靠玄学。

**如果不懂优化的数学原理，你会在关键问题上做出错误判断**：

- 学习率设大了Loss 发散，设小了收敛太慢——但为什么？
- Adam 在某些任务（尤其是大模型预训练）泛化比 SGD 差——为什么？
- L1 正则化能产生稀疏解，但 L2 不行——为什么？

凸优化是这些问题的理论根基。理解了它，你对优化器的选择就是有理有据的，而不是靠玄学。

## 一句话概览

- 凸优化问题的损失曲面只有一个山谷（全局最优），没有局部最优陷阱
- 梯度下降在 L-smooth 凸函数上以 O(1/T) 速率收敛
- Adam = 动量（一阶矩估计）+ 自适应学习率（二阶矩估计）+ 偏差校正
- L1 正则化 ⟺ 拉普拉斯先验，L2 正则化 ⟺ 高斯先验

## 核心拆解

### 🔑 凸集与凸函数

**凸集**：集合内任意两点的连线仍在集合内。

```
∀x, y ∈ C, ∀λ ∈ [0,1]: λx + (1-λ)y ∈ C
```

**凸函数**：函数图像上任意两点的连线都在函数图像上方。

```
f(λx + (1-λ)y) ≤ λf(x) + (1-λ)f(y)
```

**重要性**：在凸函数上，**局部最优就是全局最优**——不用担心陷入局部最小值。

### 🔑 KKT 条件：约束优化的最优性条件

对于约束优化问题：

```
min f(θ)
s.t. g(θ) ≤ 0  （不等式约束）
     h(θ) = 0    （等式约束）
```

KKT 条件（必要条件）是：

1. ∇f + λᵀ∇g + μᵀ∇h = 0（平稳性）
2. λᵢ ≥ 0（对偶可行性）
3. λᵢgᵢ(θ*) = 0（互补松弛性）
4. gᵢ(θ*) ≤ 0（原始可行性）
5. hᵢ(θ*) = 0（等式可行性）

**CVXPY** 可以直接求解这类问题，不需要手写拉格朗日：

```python
import cvxpy as cp

x = cp.Variable()
y = cp.Variable()
objective = cp.Minimize((x - 2)**2 + (y + 1)**2)
constraints = [x + y == 1]
problem = cp.Problem(objective, constraints)
problem.solve()
print(x.value, y.value)  # 解析解
```

### 🔑 Adam 的数学推导

Adam 更新公式：

```
m_t = β₁·m_{t-1} + (1-β₁)·g_t          # 一阶矩（动量）
v_t = β₂·v_{t-1} + (1-β₂)·g_t²         # 二阶矩（RMSProp）
m̂ = m_t / (1 - β₁ᵗ)                    # 偏差校正
v̂ = v_t / (1 - β₂ᵗ)                    # 偏差校正
θ_{t+1} = θ_t - lr · m̂ / (√v̂ + ε)
```

**物理直觉**：

- m_t：梯度方向的指数移动平均（像物理里的动量，积累方向一致性）
- v_t：梯度平方的指数移动平均（大梯度参数 → 大 v → 自适应降低该参数学习率）
- 偏差校正：早期 m_t 和 v_t 被 β 的权重压低了，需要放大回来

### 🔑 L1 vs L2 正则化与稀疏性

几何解释：

- **L2 约束**（球形）：等 Loss 线与球相切于所有方向，解是「均匀缩小」，没有稀疏性
- **L1 约束**（菱形）：等 Loss 线优先与菱形顶点相交，顶点对应稀疏解（某些维度为 0）

```
软阈值（Proximal of L1）：
shrink(x, λ) = sign(x) · max(|x| - λ, 0)
```

L1 稀疏性在特征选择中有重要应用：自动把不重要特征的系数压到 0。

## 实战指南

### Adam 从零实现

```python
def adam_update(params, grads, m, v, t, lr=1e-3, beta1=0.9, beta2=0.999, eps=1e-8):
    m_new = beta1 * m + (1 - beta1) * grads
    v_new = beta2 * v + (1 - beta2) * (grads ** 2)
    m_hat = m_new / (1 - beta1 ** t)
    v_hat = v_new / (1 - beta2 ** t)
    params_new = params - lr * m_hat / (np.sqrt(v_hat) + eps)
    return params_new, m_new, v_new
```

### 优化器对比实验

```python
# SGD vs Adam 在同一任务上的收敛曲线对比
optimizers = {
    "Adam": torch.optim.Adam(model.parameters(), lr=1e-3),
    "SGD": torch.optim.SGD(model.parameters(), lr=0.1, momentum=0.9),
    "AdamW": torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4),
}
```

## 常见误区

### 误区 1：认为 Adam 总是优于 SGD

**错误理解**：Adam 收敛速度快，调参简单，所以总是比 SGD 效果好，所有任务都应该用 Adam。

**正确理解**：Adam 的自适应学习率机制虽然加速了收敛，但可能导致泛化性能不如 SGD。在大模型预训练任务中，SGD + 动量往往比 Adam 泛化更好。Adam 的二阶矩估计会放大噪声，在小数据集或过拟合场景下可能适得其反。

**如何避免**：根据任务特点选择优化器。快速原型验证用 Adam，大模型预训练考虑 SGD + 动量或 AdamW。同时配合学习率调度（如 Cosine Annealing），避免固定学习率。

### 误区 2：忽略学习率调度的重要性

**错误理解**：设置一个固定的学习率（如 1e-3）就能训练，学习率调度只是锦上添花。

**正确理解**：学习率是训练中最重要的超参数。初始学习率太大，Loss 会发散；太小，收敛缓慢且容易陷入局部最优。学习率调度（如 Warmup + Cosine Decay）能让模型在训练初期快速探索，后期精细调整，显著提升最终效果。

**如何避免**：始终使用学习率调度器。常见策略：Linear Warmup（前 5-10% 步数线性增加学习率）+ Cosine Decay（余弦衰减到初始值的 1/100）。在 PyTorch 中使用 `torch.optim.lr_scheduler` 实现。

### 误区 3：混淆 L1 和 L2 正则化的应用场景

**错误理解**：认为 L1 和 L2 正则化只是惩罚力度不同，随便选一个用就行。

**正确理解**：L1 正则化产生稀疏解（某些权重恰好为 0），适合特征选择；L2 正则化让权重均匀缩小，适合防止过拟合但保留所有特征。L1 在优化时的次梯度问题可能导致不稳定，L2 的梯度与权重成正比，大权重会被更强地惩罚。

**如何避免**：需要特征选择时用 L1（Lasso），防止过拟合用 L2（Ridge）。在实际应用中，Elastic Net 结合了 L1 和 L2 的优点。注意 L1 正则化的损失函数在 0 处不可导，需要用次梯度方法或坐标下降法求解。

## 相关资源

- [Convex Optimization (Boyd & Vandenberghe) - 免费 PDF](https://web.stanford.edu/~boyd/cvxbook/)
- [Adam 论文](https://arxiv.org/abs/1412.6980)
- [AdamW 论文](https://arxiv.org/abs/1711.05101)
- [CVXPY 文档](https://www.cvxpy.org/)
