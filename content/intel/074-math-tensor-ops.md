---
title: 张量运算与自动微分
category: math
difficulty: intermediate
duration: 1-2周
summary: 深度学习框架的核心数学基础。理解张量运算、广播机制、自动微分原理。
takeaways:
  - 理解张量的维度和形状变换
  - 掌握广播机制的工作原理
  - 理解自动微分和计算图
  - 能手动推导简单网络的梯度
relatedIntel:
  - 024-information-theory
  - 025-convex-optimization
  - 072-math-linear-algebra
tags:
  - 张量
  - 自动微分
  - 反向传播
  - 广播机制
  - 张量分解
relatedTerms:
  - "tensor"
  - "matrix"
  - "entropy"
  - "convex-optimization"
relatedTools:
  - "pandas"
  - "numpy"
  - "jupyter"
relatedNodes:
  - "llm-inference"
  - "math-linear-algebra"
---

## 为什么你要学它

张量运算是深度学习的「母语」。无论你用 PyTorch、TensorFlow 还是 JAX，本质上都在操作张量、构建计算图、执行自动微分。

- **调试模型的第一步**：当你看到 shape mismatch 错误时，需要快速定位哪个维度不对、该在哪个轴上做变换
- **理解框架底层**：知道 `backward()` 到底在算什么，才能写出高效的自定义算子
- **阅读论文代码**：Transformer 的注意力矩阵、CNN 的卷积操作、RNN 的序列处理，本质上都是张量运算的组合
- **性能优化**：理解广播机制可以避免显式的循环和内存复制，写出向量化代码

不掌握张量运算，你永远停留在「调 API」的层面；掌握之后，你才能真正「设计模型」。

## 一句话概览

- **张量**：多维数组的数学抽象，有阶（rank）、形状（shape）、数据类型（dtype）三大属性
- **广播机制**：自动扩展小张量以匹配大张量形状，避免显式复制
- **自动微分**：记录计算图，反向遍历时用链式法则自动求梯度
- **张量分解**：将高阶张量分解为低阶因子，用于压缩和加速

## 核心拆解

### 🔑 张量基础：阶、形状、步幅

**张量的阶（Rank/Order）**：张量的维度数量

| 阶  | 名称     | 形状示例          | 典型应用             |
| --- | -------- | ----------------- | -------------------- |
| 0   | 标量     | `()`              | loss 值、学习率      |
| 1   | 向量     | `(d,)`            | 偏置、词向量         |
| 2   | 矩阵     | `(m, n)`          | 权重矩阵、注意力分数 |
| 3   | 三阶张量 | `(b, s, d)`       | batch 序列、RGB 图像 |
| 4   | 四阶张量 | `(b, c, h, w)`    | batch 图像           |
| 5+  | 高阶张量 | `(b, t, h, w, c)` | 视频数据             |

**步幅（Stride）**：内存中移动到下一个元素需要跳过多少个位置

```python
import torch

x = torch.randn(2, 3, 4)
print(x.shape)    # torch.Size([2, 3, 4])
print(x.stride()) # (12, 4, 1) — 第0维跳12个元素，第1维跳4个，第2维跳1个

# 转置后步幅变化（内存布局不变）
y = x.transpose(0, 1)
print(y.shape)    # torch.Size([3, 2, 4])
print(y.stride()) # (4, 12, 1) — 不再连续！
print(y.is_contiguous())  # False

# 使内存连续
z = y.contiguous()
print(z.stride()) # (8, 4, 1) — 重新排列后连续
```

**关键理解**：

- 步幅决定了张量在内存中的访问模式
- 非连续张量（如转置后）可能影响性能，某些操作需要先 `.contiguous()`
- `view()` 要求张量连续，`reshape()` 会自动处理

### 🔑 张量运算：逐元素、归约、矩阵运算

**逐元素运算（Element-wise）**：对每个位置独立操作

```python
import torch

a = torch.tensor([1.0, 2.0, 3.0])
b = torch.tensor([4.0, 5.0, 6.0])

# 算术运算
print(a + b)      # [5, 7, 9]
print(a * b)      # [4, 10, 18]
print(a ** 2)     # [1, 4, 9]

# 激活函数
print(torch.relu(a))        # [1, 2, 3]
print(torch.sigmoid(a))     # [0.73, 0.88, 0.95]
print(torch.tanh(a))        # [0.76, 0.96, 0.99]

# 数学函数
print(torch.exp(a))         # [2.72, 7.39, 20.09]
print(torch.log(a))         # [0, 0.69, 1.10]
print(torch.sqrt(a))        # [1, 1.41, 1.73]
```

**归约运算（Reduction）**：沿某个维度聚合

```python
x = torch.randn(2, 3, 4)

# 全局归约
print(x.sum())              # 标量
print(x.mean())
print(x.max())
print(x.std())

# 沿指定维度归约
print(x.sum(dim=0).shape)   # (3, 4) — 消除第0维
print(x.mean(dim=1).shape)  # (2, 4) — 消除第1维
print(x.max(dim=2))         # 返回 (values, indices)

# 保持维度
print(x.sum(dim=1, keepdim=True).shape)  # (2, 1, 4)
```

**矩阵运算**：线性代数核心操作

```python
A = torch.randn(3, 4)
B = torch.randn(4, 5)

# 矩阵乘法
C = A @ B                   # (3, 5) — 推荐
C = torch.matmul(A, B)      # 等价

# 批量矩阵乘法（常用）
A_batch = torch.randn(10, 3, 4)  # 10个 3x4 矩阵
B_batch = torch.randn(10, 4, 5)  # 10个 4x5 矩阵
C_batch = torch.bmm(A_batch, B_batch)  # (10, 3, 5)

# 点积与外积
a = torch.randn(5)
b = torch.randn(5)
print(torch.dot(a, b))      # 标量点积
print(torch.outer(a, b))    # (5, 5) 外积

# 转置与共轭
print(A.T)                  # 转置
print(A.mT)                  # 批量转置（用于高维张量）
print(A.H)                  # 共轭转置（复数）

# 常用矩阵操作
M = torch.randn(4, 4)
print(torch.diag(M))        # 对角线元素
print(torch.trace(M))       # 迹
print(torch.norm(M))        # Frobenius 范数
print(torch.det(M))         # 行列式
print(torch.matrix_exp(M))  # 矩阵指数
```

### 🔑 广播机制：隐式形状扩展

**广播规则**：从右向左对齐维度，满足以下条件之一则可广播：

1. 维度大小相等
2. 其中一个维度为 1
3. 其中一个张量缺少该维度

```python
import torch

# 案例1：标量与向量
a = torch.tensor([1, 2, 3])   # (3,)
b = 10                         # 标量
print(a + b)                   # [11, 12, 13] — b 广播为 [10, 10, 10]

# 案例2：向量与矩阵
A = torch.randn(3, 4)          # (3, 4)
v = torch.randn(4)             # (4,)
print((A + v).shape)           # (3, 4) — v 广播为 (1, 4) → (3, 4)

# 案例3：不同形状的矩阵
X = torch.randn(3, 1, 4)       # (3, 1, 4)
Y = torch.randn(1, 5, 4)       # (1, 5, 4)
print((X + Y).shape)           # (3, 5, 4) — 双方都广播

# 案例4：常见错误
a = torch.randn(3, 4)
b = torch.randn(4, 3)
# print(a + b)  # 报错！形状不兼容

# 显式广播
b_expanded = b.T  # 或 b.transpose(0, 1)
print((a + b_expanded).shape)  # (3, 4)
```

**广播的实际应用**：

```python
# 归一化：每个样本减去均值
batch = torch.randn(32, 784)        # 32个样本，每个784维
mean = batch.mean(dim=0)            # (784,) — 每个特征的均值
normalized = batch - mean           # (32, 784) — 自动广播

# 注意力分数：batch 矩阵乘法
Q = torch.randn(32, 8, 64)          # 32个序列，8个头，64维
K = torch.randn(32, 8, 64)
scores = Q @ K.transpose(-2, -1)    # (32, 8, 8) — 最后两维做矩阵乘法

# Softmax：沿最后一维
scores = torch.randn(2, 3, 4)
probs = torch.softmax(scores, dim=-1)  # 每个向量和为1
print(probs.sum(dim=-1))               # 全是1.0
```

### 🔑 自动微分原理：计算图与反向传播

**核心思想**：前向传播时记录计算图，反向传播时用链式法则逐层求导。

```python
import torch

# 简单示例：y = x² + 2x + 1
x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
y = x ** 2 + 2 * x + 1
z = y.sum()

z.backward()
print(x.grad)  # dy/dx = 2x + 2 → [4, 6, 8]
```

**计算图可视化**：

```
前向传播：
x ──→ x² ──→ (+) ──→ (+) ──→ y ──→ sum ──→ z
       ↑       ↑       ↑
      [x²]   [2x]    [1]

反向传播（链式法则）：
dz/dy = 1
dy/dx = 2x + 2
dz/dx = dz/dy × dy/dx = 2x + 2
```

**手动实现反向传播**：

```python
# 手动计算梯度（理解原理）
class Tensor:
    def __init__(self, data, requires_grad=False, _children=(), _op=''):
        self.data = data
        self.requires_grad = requires_grad
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(_children)
        self._op = _op

    def __add__(self, other):
        out = Tensor(self.data + other.data, requires_grad=True, _children=(self, other), _op='+')

        def _backward():
            self.grad += out.grad
            other.grad += out.grad
        out._backward = _backward
        return out

    def __mul__(self, other):
        out = Tensor(self.data * other.data, requires_grad=True, _children=(self, other), _op='*')

        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = _backward
        return out

# 使用
a = Tensor(2.0, requires_grad=True)
b = Tensor(3.0, requires_grad=True)
c = a * b  # c = 6
d = c + a  # d = 8
d.grad = 1.0

# 反向传播（拓扑排序）
topo = [d, c, a, b]  # 简化版，实际需要拓扑排序
for node in reversed(topo):
    node._backward()

print(f"a.grad = {a.grad}")  # 4 (dc/da * dd/dc = b * 1 = 3, plus dd/da = 1)
print(f"b.grad = {b.grad}")  # 2 (dc/db * dd/dc = a * 1 = 2)
```

**PyTorch 自动微分进阶**：

```python
import torch

# 1. 梯度累积与清零
x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
y = x.sum()
y.backward()
print(x.grad)  # [1, 1, 1]

y = x.sum()    # 再次前向
y.backward()    # 梯度会累加！
print(x.grad)  # [2, 2, 2] — 不是 [1, 1, 1]

x.grad.zero_()  # 手动清零
y = x.sum()
y.backward()
print(x.grad)  # [1, 1, 1]

# 2. retain_graph：多次反向传播
x = torch.tensor([1.0, 2.0], requires_grad=True)
y = x ** 2
z = y.sum()
z.backward(retain_graph=True)  # 保留计算图
print(x.grad)  # [2, 4]
z.backward()    # 可以再次反向
print(x.grad)  # [4, 8] — 累积

# 3. 梯度只对标量有效
x = torch.randn(3, requires_grad=True)
y = x * 2
# y.backward()  # 报错！y 不是标量
y.sum().backward()  # 正确：先归约成标量

# 4. 非标量梯度
x = torch.randn(3, requires_grad=True)
y = x * 2
gradient = torch.tensor([1.0, 0.5, 0.25])
y.backward(gradient=gradient)  # 传入外部梯度
print(x.grad)  # [2, 1, 0.5]

# 5. detach() 与 with torch.no_grad()
x = torch.randn(3, requires_grad=True)
y = x * 2
z = y.detach()  # 从计算图分离
print(z.requires_grad)  # False

with torch.no_grad():
    w = x * 3  # 不会记录计算图
print(w.requires_grad)  # False
```

**神经网络中的自动微分**：

```python
import torch
import torch.nn as nn

# 手动推导简单网络的梯度
class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.w1 = nn.Parameter(torch.randn(784, 256) * 0.01)
        self.b1 = nn.Parameter(torch.zeros(256))
        self.w2 = nn.Parameter(torch.randn(256, 10) * 0.01)
        self.b2 = nn.Parameter(torch.zeros(10))

    def forward(self, x):
        # x: (batch, 784)
        h = x @ self.w1 + self.b1       # (batch, 256)
        h = torch.relu(h)
        out = h @ self.w2 + self.b2     # (batch, 10)
        return out

model = SimpleNet()
x = torch.randn(32, 784)
y = torch.randint(0, 10, (32,))

# 前向传播
logits = model(x)
loss = nn.functional.cross_entropy(logits, y)

# 反向传播（自动）
loss.backward()

# 查看梯度
print(model.w1.grad.shape)  # (784, 256)
print(model.w2.grad.shape)  # (256, 10)

# 手动验证梯度（数值微分）
def numerical_gradient(model, x, y, eps=1e-5):
    grad = torch.zeros_like(model.w1)
    for i in range(model.w1.shape[0]):
        for j in range(model.w1.shape[1]):
            model.w1.data[i, j] += eps
            loss_plus = nn.functional.cross_entropy(model(x), y)
            model.w1.data[i, j] -= 2 * eps
            loss_minus = nn.functional.cross_entropy(model(x), y)
            model.w1.data[i, j] += eps
            grad[i, j] = (loss_plus - loss_minus) / (2 * eps)
    return grad

# 注意：数值微分很慢，只用于验证
# grad_numerical = numerical_gradient(model, x, y)
# print(torch.allclose(model.w1.grad, grad_numerical, atol=1e-4))
```

### 🔑 张量分解：压缩与加速

**张量分解**：将高阶张量分解为低阶因子的乘积，用于模型压缩和加速推理。

**CP 分解（Canonical Polyadic）**：

```
将张量 T ∈ R^{I×J×K} 分解为：
T ≈ Σ_r a_r ∘ b_r ∘ c_r

其中 a_r ∈ R^I, b_r ∈ R^J, c_r ∈ R^K
```

```python
import torch

def cp_decomposition(tensor, rank):
    """
    简化版 CP 分解（实际使用 tensorly 库）
    """
    # 初始化因子矩阵
    I, J, K = tensor.shape
    A = torch.randn(I, rank)
    B = torch.randn(J, rank)
    C = torch.randn(K, rank)

    # 交替最小二乘法（ALS）
    for _ in range(100):
        # 固定 B, C，更新 A
        # ... 省略迭代细节
        pass

    return A, B, C

# 使用 tensorly 库
# import tensorly as tl
# from tensorly.decomposition import parafac
# factors = parafac(tensor, rank=5)
```

**Tucker 分解**：

```
将张量 T ∈ R^{I×J×K} 分解为：
T ≈ G ×₁ A ×₂ B ×₃ C

其中 G ∈ R^{R₁×R₂×R₃} 是核心张量
A ∈ R^{I×R₁}, B ∈ R^{J×R₂}, C ∈ R^{K×R₃} 是因子矩阵
```

```python
# Tucker 分解示例（使用 tensorly）
# from tensorly.decomposition import tucker
# core, factors = tucker(tensor, ranks=[5, 5, 5])

# 手动理解 Tucker 分解
def tucker_decomposition_manual(tensor, ranks):
    """
    Tucker 分解的手动实现（简化版）
    """
    I, J, K = tensor.shape
    R1, R2, R3 = ranks

    # 使用 SVD 初始化因子矩阵
    # 沿每个模式展开张量
    unfold_1 = tensor.reshape(I, -1)  # (I, J*K)
    unfold_2 = tensor.transpose(0, 1).reshape(J, -1)  # (J, I*K)
    unfold_3 = tensor.transpose(0, 2).reshape(K, -1)  # (K, I*J)

    # SVD 截断
    U1, _, _ = torch.linalg.svd(unfold_1)
    U2, _, _ = torch.linalg.svd(unfold_2)
    U3, _, _ = torch.linalg.svd(unfold_3)

    A = U1[:, :R1]  # (I, R1)
    B = U2[:, :R2]  # (J, R2)
    C = U3[:, :R3]  # (K, R3)

    # 计算核心张量
    core = tensor
    core = torch.einsum('ijk,ia->ajk', core, A.T)
    core = torch.einsum('ajk,jb->abk', core, B.T)
    core = torch.einsum('abk,kc->abc', core, C.T)

    return core, (A, B, C)
```

**卷积层的张量分解加速**：

```python
import torch
import torch.nn as nn

def decompose_conv_layer(conv_layer, rank):
    """
    将 4D 卷积核分解为多个小卷积
    原始: (out_ch, in_ch, kH, kW)
    分解后: 两个连续的小卷积
    """
    weight = conv_layer.weight.data  # (out, in, kH, kW)
    out_ch, in_ch, kH, kW = weight.shape

    # 将权重重塑为矩阵
    weight_matrix = weight.reshape(out_ch, -1)  # (out, in*kH*kW)

    # SVD 分解
    U, S, V = torch.linalg.svd(weight_matrix, full_matrices=False)
    U_r = U[:, :rank]      # (out, rank)
    S_r = S[:rank]         # (rank,)
    V_r = V[:rank, :]      # (rank, in*kH*kW)

    # 构建两个卷积层
    # 第一个: (rank, in, kH, kW)
    # 第二个: (out, rank, 1, 1)

    conv1 = nn.Conv2d(in_ch, rank, kernel_size=(kH, kW),
                      stride=conv_layer.stride, padding=conv_layer.padding,
                      bias=False)
    conv2 = nn.Conv2d(rank, out_ch, kernel_size=1, bias=True)

    # 设置权重
    conv1.weight.data = V_r.reshape(rank, in_ch, kH, kW)
    conv2.weight.data = (U_r * S_r).reshape(out_ch, rank, 1, 1)
    if conv_layer.bias is not None:
        conv2.bias.data = conv_layer.bias.data.clone()

    return nn.Sequential(conv1, conv2)

# 示例：压缩 ResNet 的卷积层
# original_conv = nn.Conv2d(256, 512, kernel_size=3, padding=1)
# compressed = decompose_conv_layer(original_conv, rank=128)
# 参数量从 256*512*3*3 = 1,179,648 降到 256*128*3*3 + 512*128 = 360,448
```

## 完整跑通方案

### 实验一：广播机制可视化

```python
import torch
import numpy as np

def visualize_broadcasting():
    """可视化广播机制的形状扩展"""
    print("=" * 60)
    print("广播机制演示")
    print("=" * 60)

    # 案例1：不同维度的广播
    a = torch.randn(3, 1, 4)
    b = torch.randn(1, 5, 4)

    print(f"a.shape = {a.shape}")
    print(f"b.shape = {b.shape}")

    # 手动广播
    a_expanded = a.expand(3, 5, 4)
    b_expanded = b.expand(3, 5, 4)

    print(f"a 广播后: {a_expanded.shape}")
    print(f"b 广播后: {b_expanded.shape}")

    # 自动广播
    c = a + b
    print(f"a + b 结果: {c.shape}")

    # 案例2：归一化示例
    print("\n" + "-" * 60)
    print("Batch 归一化示例")
    batch = torch.randn(32, 784)
    mean = batch.mean(dim=0, keepdim=True)  # (1, 784)
    std = batch.std(dim=0, keepdim=True)

    normalized = (batch - mean) / (std + 1e-8)
    print(f"原始 batch: {batch.shape}, 均值: {batch.mean():.4f}, 标准差: {batch.std():.4f}")
    print(f"归一化后: {normalized.shape}, 均值: {normalized.mean():.4f}, 标准差: {normalized.std():.4f}")

    # 案例3：注意力分数
    print("\n" + "-" * 60)
    print("注意力分数计算")
    Q = torch.randn(2, 4, 8)   # (batch, seq_len, d_model)
    K = torch.randn(2, 4, 8)

    scores = Q @ K.transpose(-2, -1)  # (batch, seq_len, seq_len)
    attn_weights = torch.softmax(scores / (8 ** 0.5), dim=-1)

    print(f"Q @ K^T 形状: {scores.shape}")
    print(f"注意力权重形状: {attn_weights.shape}")
    print(f"每行和为1: {attn_weights.sum(dim=-1)}")

visualize_broadcasting()
```

### 实验二：自动微分验证

```python
import torch
import torch.nn as nn

def verify_autograd():
    """验证自动微分的正确性"""
    print("=" * 60)
    print("自动微分验证")
    print("=" * 60)

    # 1. 简单函数的梯度
    print("\n1. 简单函数梯度验证")
    x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
    y = x ** 3 + 2 * x ** 2 + x
    loss = y.sum()
    loss.backward()

    # 手动计算: dy/dx = 3x² + 4x + 1
    expected = 3 * x.data ** 2 + 4 * x.data + 1
    print(f"自动微分梯度: {x.grad}")
    print(f"手动计算梯度: {expected}")
    print(f"误差: {torch.abs(x.grad - expected).max():.6f}")

    # 2. 矩阵运算的梯度
    print("\n2. 矩阵运算梯度验证")
    A = torch.randn(3, 4, requires_grad=True)
    B = torch.randn(4, 5, requires_grad=True)
    C = A @ B
    loss = C.sum()
    loss.backward()

    # d(C)/d(A) = B^T (每个元素)
    # d(C)/d(B) = A^T
    print(f"dC/dA 形状: {A.grad.shape} (应为 {A.shape})")
    print(f"dC/dB 形状: {B.grad.shape} (应为 {B.shape})")

    # 3. Softmax + Cross-Entropy 的梯度
    print("\n3. Cross-Entropy 梯度验证")
    logits = torch.randn(4, 10, requires_grad=True)
    target = torch.randint(0, 10, (4,))

    loss = nn.functional.cross_entropy(logits, target)
    loss.backward()

    # 手动计算梯度
    probs = torch.softmax(logits, dim=1)
    grad_manual = probs.clone()
    grad_manual[range(4), target] -= 1
    grad_manual /= 4  # batch size

    print(f"自动梯度: {logits.grad[0, :3]}")
    print(f"手动梯度: {grad_manual[0, :3]}")
    print(f"误差: {torch.abs(logits.grad - grad_manual).max():.6f}")

    # 4. 数值微分验证
    print("\n4. 数值微分验证")
    def f(x):
        return (x ** 2).sum()

    x = torch.randn(5, requires_grad=True)

    # 解析梯度
    y = f(x)
    y.backward()
    analytical_grad = x.grad.clone()

    # 数值梯度
    eps = 1e-5
    numerical_grad = torch.zeros_like(x)
    for i in range(5):
        x_plus = x.data.clone()
        x_plus[i] += eps
        x_minus = x.data.clone()
        x_minus[i] -= eps
        numerical_grad[i] = (f(x_plus) - f(x_minus)) / (2 * eps)

    print(f"解析梯度: {analytical_grad}")
    print(f"数值梯度: {numerical_grad}")
    print(f"误差: {torch.abs(analytical_grad - numerical_grad).max():.8f}")

verify_autograd()
```

### 实验三：张量分解压缩

```python
import torch
import torch.nn as nn
import time

def tensor_decomposition_demo():
    """张量分解压缩演示"""
    print("=" * 60)
    print("张量分解压缩演示")
    print("=" * 60)

    # 创建一个大型卷积层
    original_conv = nn.Conv2d(256, 512, kernel_size=3, padding=1)
    original_params = sum(p.numel() for p in original_conv.parameters())
    print(f"\n原始卷积层:")
    print(f"  输入通道: 256, 输出通道: 512, 卷积核: 3x3")
    print(f"  参数量: {original_params:,}")

    # 分解为两个小卷积
    rank = 128
    decomposed = nn.Sequential(
        nn.Conv2d(256, rank, kernel_size=3, padding=1, bias=False),
        nn.Conv2d(rank, 512, kernel_size=1, bias=True)
    )

    # 复制权重（简化版，实际需要 SVD 分解）
    decomposed_params = sum(p.numel() for p in decomposed.parameters())
    print(f"\n分解后:")
    print(f"  Conv1: 256 → {rank}, kernel=3x3")
    print(f"  Conv2: {rank} → 512, kernel=1x1")
    print(f"  参数量: {decomposed_params:,}")
    print(f"  压缩比: {original_params / decomposed_params:.2f}x")

    # 性能对比
    x = torch.randn(1, 256, 32, 32)

    # 原始层
    with torch.no_grad():
        start = time.time()
        for _ in range(100):
            _ = original_conv(x)
        original_time = time.time() - start

    # 分解后
    with torch.no_grad():
        start = time.time()
        for _ in range(100):
            _ = decomposed(x)
        decomposed_time = time.time() - start

    print(f"\n性能对比 (100次前向):")
    print(f"  原始: {original_time*1000:.2f}ms")
    print(f"  分解后: {decomposed_time*1000:.2f}ms")
    print(f"  加速比: {original_time / decomposed_time:.2f}x")

tensor_decomposition_demo()
```

### 实验四：完整训练流程中的张量操作

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import torchvision.datasets as datasets
import torchvision.transforms as transforms

def full_training_demo():
    """完整训练流程演示张量操作"""
    print("=" * 60)
    print("完整训练流程 - 张量操作追踪")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"设备: {device}")

    # 数据加载
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,))
    ])

    train_dataset = datasets.MNIST('./data', train=True, download=True, transform=transform)
    train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)

    # 简单模型
    model = nn.Sequential(
        nn.Flatten(),           # (batch, 1, 28, 28) → (batch, 784)
        nn.Linear(784, 256),
        nn.ReLU(),
        nn.Linear(256, 10)
    ).to(device)

    optimizer = optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.CrossEntropyLoss()

    # 训练一个 batch
    model.train()
    for batch_idx, (data, target) in enumerate(train_loader):
        data, target = data.to(device), target.to(device)

        print(f"\n=== Batch {batch_idx + 1} ===")
        print(f"输入形状: {data.shape}")
        print(f"目标形状: {target.shape}")

        # 前向传播
        optimizer.zero_grad()
        output = model(data)
        print(f"输出形状: {output.shape}")

        # 计算损失
        loss = criterion(output, target)
        print(f"损失值: {loss.item():.4f}")

        # 反向传播
        loss.backward()

        # 检查梯度
        grad_norms = []
        for name, param in model.named_parameters():
            if param.grad is not None:
                grad_norm = param.grad.norm().item()
                grad_norms.append((name, grad_norm))

        print("梯度范数:")
        for name, norm in grad_norms:
            print(f"  {name}: {norm:.4f}")

        # 更新参数
        optimizer.step()

        if batch_idx >= 2:  # 只演示3个batch
            break

    print("\n训练完成!")

full_training_demo()
```

## 常见误区

**误区1：混淆 `view()` 和 `reshape()`**

```python
x = torch.randn(2, 3, 4)
y = x.transpose(0, 1)  # 非连续

# y.view(6, 4)  # 报错！view 要求连续
z = y.reshape(6, 4)  # 正确：自动处理连续性
z = y.contiguous().view(6, 4)  # 或先显式连续化
```

**误区2：广播时维度对齐错误**

```python
a = torch.randn(3, 4)
b = torch.randn(4)  # 想加到每行

# a + b  # 正确：b 广播为 (1, 4) → (3, 4)

c = torch.randn(3, 1)
# a + c  # 正确：c 广播为 (3, 1) → (3, 4)

d = torch.randn(3)
# a + d  # 错误！d 形状 (3,) 会广播为 (1, 3)，与 (3, 4) 不兼容
# 正确写法：
# a + d.unsqueeze(1)  # (3, 1) → (3, 4)
```

**误区3：忘记 `requires_grad=True`**

```python
x = torch.tensor([1.0, 2.0, 3.0])  # 默认 requires_grad=False
y = x ** 2
# y.sum().backward()  # 报错！没有梯度

x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)  # 正确
```

**误区4：原地操作破坏计算图**

```python
x = torch.tensor([1.0, 2.0], requires_grad=True)
y = x * 2
# y += 1  # 警告/错误！原地操作可能破坏梯度
y = y + 1  # 正确：创建新张量
```

**误区5：混淆 `sum()` 和 `mean()` 的维度**

```python
x = torch.randn(2, 3, 4)

# 全局归约
print(x.sum().shape)           # torch.Size([]) 标量
print(x.sum(dim=0).shape)      # torch.Size([3, 4])

# 保持维度
print(x.sum(dim=0, keepdim=True).shape)  # torch.Size([1, 3, 4])
```

## 学习资源推荐

### 官方文档

- [PyTorch 官方教程 - Tensors](https://pytorch.org/tutorials/beginner/basics/tensorqs_tutorial.html)
- [PyTorch 官方文档 - torch.Tensor](https://pytorch.org/docs/stable/tensors.html)
- [PyTorch 自动微分](https://pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html)

### 深入理解

- [Einstein Summation Convention](https://rockt.github.io/2018/04/30/einsum) - einsum 详解
- [Tensor Decompositions and Applications](https://www.kolda.net/publication/TensorReview.pdf) - 张量分解综述
- [Automatic Differentiation in Machine Learning: a Survey](https://arxiv.org/abs/1502.05767) - 自动微分综述

### 可视化工具

- [PyTorch Tensor Shape Cheat Sheet](https://einops.rocks/pytorch-examples.html)
- [TensorFlow Playground](https://playground.tensorflow.org/) - 神经网络可视化
- [Netron](https://netron.app/) - 模型结构可视化

### 实践项目

- [einops 库](https://github.com/arogozhnikov/einops) - 优雅的张量操作
- [tensorly 库](https://github.com/tensorly/tensorly) - 张量分解工具
- [PyTorch Examples](https://github.com/pytorch/examples) - 官方示例代码

### 进阶阅读

- [Deep Learning - Linear Algebra](https://www.deeplearningbook.org/contents/linear_algebra.html) - Goodfellow 等人
- [Matrix Calculus for Deep Learning](https://arxiv.org/abs/1802.01528) - 矩阵微积分
- [The Matrix Cookbook](https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf) - 矩阵公式速查
