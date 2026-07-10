---
title: 线性代数与机器学习核心运算
category: math
summary: 从矩阵乘到注意力机制，拆解线性代数在深度学习中的十大核心运算：内积投影、外积更新、特征值分解、SVD、QR、Cholesky，并用 PyTorch 手写实现理解底层。
difficulty: intermediate
excerpt: 从矩阵乘到注意力机制，拆解线性代数在深度学习中的十大核心运算：内积投影、外积更新、特征值分解、SVD、QR、Cholesky，并用 PyTorch 手写实现理解底层。
relatedTerms:
  - convex-optimization
  - matrix
  - entropy
  - tensor
relatedTools:
  - numpy
  - pandas
  - jupyter
  - matplotlib
relatedNodes:
  - math-linear-algebra
  - llm-inference
---

## 为什么你要学它

很多人学完线性代数课程后的感受是：「我知道矩阵乘法怎么做，但不知道为什么要这么做。」然而一旦你深入 PyTorch / TensorFlow 的底层，会发现深度学习的每一步本质上都在做线性代数运算：

- 神经网络的「全连接层」y = Wx + b，去掉偏置就是**矩阵乘向量**
- 自注意力机制中的 QK^T，就是**矩阵乘矩阵的转置**，算出来的是两两 token 之间的**内积相似度**
- BatchNorm 中的「减均值除以标准差」，需要计算协方差矩阵的**对角元素**
- 低秩适配（LoRA）的核心思想是把权重矩阵 ΔW 分解成两个瘦矩阵 B×A，用的是**低秩分解**的概念
- PCA 降维找主成分方向，其实就是算协方差矩阵的**特征值分解**
- 推荐系统的矩阵分解，把 user-item 评分矩阵拆成 U×Σ×V^T，就是**奇异值分解（SVD）**
- 优化器 Adam 中用的「梯度二阶矩」，本质是维护一个近似的**海森矩阵对角线**

不理解这些运算的几何含义，你写代码时看到的只是一堆 `torch.matmul` 和形状变换；理解了之后，你才能看懂论文里「低秩分解」「注意力就是内积检索」「谱归一化」这些说法到底在做什么，才能自己发明新的算法。

本文不讲行列式计算、克莱姆法则这种计算机时代已经不需要手算的东西，只讲**深度学习中每天都在用、必须从几何层面理解的十大线性代数运算**，每个都配 PyTorch 手写实现。

## 一句话概览

- **向量内积** = 投影长度 × 被投影向量长度，对应注意力的相似度计算
- **向量外积** = 秩 1 矩阵，对应梯度累积、Word2Vec 的权重更新
- **矩阵乘向量** = 线性变换（旋转+拉伸+投影的组合），对应全连接层前向传播
- **特征值分解** A = PDP⁻¹ = 找到矩阵拉伸不变的方向，对应 PCA 找主成分
- **奇异值分解** A = UΣV^T = 任意矩阵拆成「旋转 + 拉伸 + 旋转」，对应推荐系统矩阵分解
- **QR 分解** A = QR = 正交基 + 上三角，对应 Gram-Schmidt 正交化和最小二乘求解
- **Cholesky 分解** A = LL^T = 正定矩阵拆成下三角，对应多元正态采样和高斯过程

## 核心拆解

### 🔑 向量内积：注意力机制的灵魂

**定义**：两个 n 维向量 a, b 的内积 = Σᵢ aᵢbᵢ

**几何含义**：`a·b = |a| × |b| × cosθ`，其中 θ 是两个向量的夹角。所以内积衡量的是「两个向量方向有多一致」：

- 夹角 0°（同向）→ 内积最大，等于 |a|×|b|
- 夹角 90°（正交）→ 内积为 0
- 夹角 180°（反向）→ 内积最小，为负数

**归一化内积（余弦相似度）** = cosθ = a·b / (|a|×|b|)。如果先把两个向量都归一化成长度 1，内积就直接等于余弦相似度。

**注意力机制 = 内积检索**：Query q 和 Key k_i 的内积 = q 和 k_i 的相似度，Softmax 后变成权重，加权求和 Value。

```python
import torch
import torch.nn.functional as F

def dot_product_attention(Q, K, V, mask=None):
    """
    手写缩放点积注意力，Q/K/V 形状: [batch, heads, seq_len, d_k]
    """
    d_k = Q.size(-1)

    # 🔑 核心：Q @ K^T = 每对 (query_i, key_j) 做内积
    # 形状: [batch, heads, seq_len, seq_len]
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)

    if mask is not None:
        scores = scores.masked_fill(mask == 0, float('-inf'))

    attn_weights = F.softmax(scores, dim=-1)
    output = torch.matmul(attn_weights, V)
    return output, attn_weights

# 验证：随机生成 Q/K/V，手写结果 vs PyTorch 官方 scaled_dot_product_attention
torch.manual_seed(42)
Q = torch.randn(2, 4, 16, 64)  # batch=2, 4 heads, seq=16, d_k=64
K = torch.randn(2, 4, 16, 64)
V = torch.randn(2, 4, 16, 64)

my_out, my_w = dot_product_attention(Q, K, V)
torch_out = F.scaled_dot_product_attention(Q, K, V, is_causal=False)

print(f"手写注意力与官方结果最大误差: {torch.max(torch.abs(my_out - torch_out)):.6e}")
# 应该是 1e-6 级别，数值误差
```

**缩放因子 1/√d_k 的意义**：内积的方差随维度 d_k 线性增长（每个元素乘积独立，方差相加）。不缩放的话，d_k=64 时 softmax 输入的标准差 ≈ 8，分布极尖，Softmax 之后几乎 one-hot，梯度接近 0。除以 √d_k 把方差拉回 1，保证训练初期梯度正常流动。

### 🔑 向量外积：秩 1 矩阵的秘密

**定义**：列向量 a（n×1）和行向量 b^T（1×m）的外积 = a ⊗ b = a·b^T，结果是 n×m 矩阵，每一行都是 b 乘以 a 的某个元素。

**核心性质**：外积矩阵的秩永远是 1——所有列都是 a 的倍数，所有行都是 b^T 的倍数。

**机器学习应用**：

- **梯度累积**：损失对权重 W 的梯度 ∂L/∂W = ∂L/∂y · x^T，就是「上游梯度（列向量）× 输入（行向量）」的外积，每次更新的秩都是 1
- **Word2Vec 权重更新**：一个正样本 (center_word, context_word) 对应的梯度更新是外积
- **SVD 的展开视角**：任何矩阵都能拆成若干秩 1 外积的加权和 A = Σᵢ σᵢ·uᵢ⊗vᵢ，这就是 SVD 的外积形式

```python
import torch

def low_rank_approximation_demo():
    """演示：一张 128×128 灰度图 = 若干秩 1 外积的加权和"""
    # 生成一张人造图像（斜条纹 + 渐变）
    x = torch.linspace(-1, 1, 128)
    y = torch.linspace(-1, 1, 128)
    X, Y = torch.meshgrid(x, y, indexing='ij')
    img = torch.sin(5 * (X + Y)) + 0.5 * X + 0.3 * torch.cos(8 * X)

    # SVD 分解
    U, S, Vt = torch.linalg.svd(img)
    # U: [128, 128], S: [128], Vt: [128, 128]

    print(f"原始图像形状: {img.shape}，前 5 个奇异值: {S[:5].round(decimals=2).tolist()}")

    # 用前 k 个分量重建（每一个分量都是一个秩 1 外积：σ_i * u_i ⊗ v_i）
    for k in [1, 5, 20, 50]:
        # 重建 = U[:, :k] @ diag(S[:k]) @ Vt[:k, :]
        #       = Σ_{i=1..k} S[i] * U[:, i:i+1] @ Vt[i:i+1, :]
        recon = U[:, :k] @ torch.diag(S[:k]) @ Vt[:k, :]
        err = torch.mean(torch.abs(img - recon))
        storage_ratio = k * (128 + 128) / (128 * 128)
        print(f"k={k:3d} 重建误差(MAE)={err:.4f}，存储压缩比= {storage_ratio*100:5.1f}%")

low_rank_approximation_demo()
```

### 🔑 矩阵乘向量：全连接层就是线性变换 + 偏置

y = Wx + b，W 是 m×n 矩阵，x 是 n 维输入向量，y 是 m 维输出向量。

**几何视角**：W 把 n 维空间中的点 x 映射（线性变换）到 m 维空间。这个变换可以分解成三步：

1. **旋转/反射**：正交矩阵 U 的作用（不改变向量长度，只改变方向）
2. **各维度独立拉伸/压缩**：对角矩阵 Σ 的作用（沿主方向缩放 σ_i 倍）
3. **再旋转/反射**：正交矩阵 V^T 的作用

这三步合起来就是 SVD：W = U Σ V^T。所以**任何线性变换 = 旋转 + 拉伸 + 旋转**。

**深度学习的视角**：

- W 的每一行 = 一个「模式探测器」。W 的第 i 行和输入 x 做内积，得到的是「x 匹配第 i 个模式的程度」，就是 y 的第 i 个神经元激活值。
- 训练就是在调整这些「模式探测器」的方向（W 的行）和偏置 b，让最终输出逼近标签。

```python
import torch

# 手动实现一个 2 层 MLP，对比 torch.nn.Linear 结果
class ManualLinear:
    def __init__(self, in_features, out_features):
        #  kaiming 初始化（ReLU 激活用）
        self.W = torch.randn(out_features, in_features) * (2.0 / in_features) ** 0.5
        self.b = torch.zeros(out_features)

    def __call__(self, x):
        # y = x @ W^T + b （批量形式）
        return x @ self.W.T + self.b

# 测试
torch.manual_seed(42)
in_f, out_f = 256, 64
x = torch.randn(32, in_f)  # batch=32

manual = ManualLinear(in_f, out_f)
official = torch.nn.Linear(in_f, out_f)

# 把官方 Linear 的权重替换成我们手动初始化的，保证公平对比
official.weight.data.copy_(manual.W)
official.bias.data.copy_(manual.b)

y_manual = F.relu(manual(x))
y_official = F.relu(official(x))
print(f"手动 Linear vs nn.Linear 输出最大误差: {torch.max(torch.abs(y_manual - y_official)):.6e}")
# 误差应为 0（同一套权重同一套计算）
```

### 🔑 特征值分解：PCA 的数学原理

**定义**：对于 n×n 方阵 A，如果存在非零向量 v 和标量 λ 使得 Av = λv，则 λ 是特征值，v 是对应特征向量。

**几何含义**：特征向量是矩阵 A 变换后「方向不变」的向量，只被拉伸/压缩了 λ 倍。

**特征值分解**：A = PDP⁻¹，D 是对角阵（对角元素为特征值），P 的列是特征向量。如果 A 是**对称正定矩阵**（比如协方差矩阵），则 P 是正交矩阵，分解简化为 A = PDP^T。

**PCA 算法流程 = 特征值分解应用案例**：

1. 数据去中心化：X ← X - mean(X, axis=0)
2. 计算协方差矩阵：C = X^T X / (n-1)（d×d 对称正定矩阵）
3. 对 C 做特征值分解：C = PDP^T
4. 取特征值最大的前 k 列 P_k（主成分方向）
5. 降维：Z = X @ P_k

```python
import torch
import numpy as np

def manual_pca(X, k):
    """手写 PCA，用特征值分解"""
    n, d = X.shape

    # Step 1: 去中心化
    X_centered = X - X.mean(dim=0, keepdim=True)

    # Step 2: 协方差矩阵
    C = (X_centered.T @ X_centered) / (n - 1)

    # Step 3: 特征值分解（协方差对称，eigh 比 eig 更高效稳定）
    eigenvalues, eigenvectors = torch.linalg.eigh(C)

    # eigh 返回升序，要翻成降序
    eigenvalues = eigenvalues.flip(0)
    eigenvectors = eigenvectors.flip(1)

    # Step 4: 取前 k 个主成分方向
    P_k = eigenvectors[:, :k]

    # Step 5: 投影降维
    Z = X_centered @ P_k

    explained = eigenvalues[:k].sum() / eigenvalues.sum()
    return Z, P_k, eigenvalues, explained

# 生成 3 维相关数据，投影到 2 维
torch.manual_seed(42)
n = 500
# 构造相关数据：x2 ≈ 2*x1 + noise, x3 ≈ 0.5*x1 + noise
x1 = torch.randn(n)
x2 = 2 * x1 + 0.3 * torch.randn(n)
x3 = 0.5 * x1 + 0.8 * torch.randn(n)
X = torch.stack([x1, x2, x3], dim=1)

Z, P_k, eigvals, ratio = manual_pca(X, k=2)
print(f"三维数据 → 二维：方差解释率 = {ratio:.2%}")
print(f"三个特征值: {eigvals.round(decimals=2).tolist()}")
print(f"主成分方向 P_k (第一列=PC1, 第二列=PC2):\n{P_k.round(decimals=3)}")
# PC1 应该大致是 [0.4, 0.8, 0.2]（正比于 x1 的系数 [1, 2, 0.5] 方向）
```

### 🔑 奇异值分解 SVD：任意矩阵的骨架提取

特征值分解只适用于方阵。SVD 是它的推广，适用于任意 m×n 矩阵 A：

```
A = U Σ V^T
```

- U：m×m 正交矩阵，列叫「左奇异向量」（A A^T 的特征向量）
- Σ：m×n 对角矩阵，非负对角元素叫「奇异值」，按降序排列
- V^T：n×n 正交矩阵，行叫「右奇异向量」（A^T A 的特征向量）

**和特征值分解的关系**：奇异值 = √特征值（对 A^T A 而言）。

**低秩近似 Eckart-Young 定理**：用前 k 个奇异值重建的矩阵 A_k = U_k Σ_k V_k^T，是所有秩 ≤ k 的矩阵中，和 A 的 Frobenius 范数误差最小的。这是图像压缩、推荐系统、LoRA 背后的数学保证。

**SVD 在深度学习中的应用**：

1. **词向量降维**：Word2Vec 训练出的词嵌入矩阵做 SVD，前 k 个奇异值对应的就是「语义主方向」
2. **LoRA 低秩适配**：ΔW = B×A，B 形状 d×r，A 形状 r×k，相当于强制 ΔW 的秩 ≤ r。SVD 解释了为什么 r 很小（如 4/8）也能用——真实的权重变化本来就是低秩的
3. **模型压缩**：全连接层权重 W 做 SVD，取前 r 个分量，参数量从 d×k 降到 r(d+k)，压缩比 = (d+k)r/(dk)，当 d,k 很大时可以压到 1%~5%
4. **谱归一化（GAN 中）**：权重矩阵的最大奇异值 σ_max(W) 除以 W，让 Lipschitz 常数 ≤ 1，稳定 GAN 训练

```python
import torch

def lora_via_svd_demo():
    """演示：一个预训练权重 W，模拟微调后的 ΔW 的低秩性"""
    d_in, d_out = 512, 256
    torch.manual_seed(42)

    # 预训练权重 W_0
    W_0 = torch.randn(d_out, d_in) * 0.02

    # 模拟「微调后权重」：在 W_0 基础上加一个低秩的扰动 + 少量噪声
    true_rank = 8
    B_true = torch.randn(d_out, true_rank) * 0.01
    A_true = torch.randn(true_rank, d_in) * 0.01
    noise = torch.randn(d_out, d_in) * 0.001  # 极少量噪声
    W_tuned = W_0 + B_true @ A_true + noise

    # 权重差 ΔW
    delta_W = W_tuned - W_0

    # 对 ΔW 做 SVD
    U, S, Vt = torch.linalg.svd(delta_W, full_matrices=False)

    print(f"ΔW 形状: {delta_W.shape}，真实有效秩 ≈ {true_rank}")
    print(f"前 20 个奇异值: {S[:20].round(decimals=4).tolist()}")

    # 看前 r=8 个奇异值的解释率
    for r in [4, 8, 16, 32]:
        S_r = torch.zeros_like(S)
        S_r[:r] = S[:r]
        delta_W_r = U @ torch.diag(S_r) @ Vt
        err = torch.norm(delta_W - delta_W_r) / torch.norm(delta_W)
        print(f"秩 r={r:2d} 近似误差: {err:.2%}")

lora_via_svd_demo()
```

### 🔑 Cholesky 分解：多元正态采样的工程技巧

**定义**：如果 A 是对称正定矩阵，可以唯一分解为 A = L L^T，其中 L 是下三角矩阵（对角线以上全 0），这就是 Cholesky 分解。

**为什么比特征值分解好**：Cholesky 只需要一半的计算量（O(n³/3) vs O(n³)），数值稳定性更好。

**机器学习核心应用**：从多元正态 N(μ, Σ) 采样。标准做法：

1. 对协方差 Σ 做 Cholesky：Σ = L L^T
2. 从标准正态采样 z ~ N(0, I)
3. 返回 x = μ + L z

数学原理：线性变换后，协方差 Var(Lz) = L·Var(z)·L^T = L I L^T = Σ，完美。

另一个应用：高斯过程回归中需要计算 K⁻¹ y，用 Cholesky 分解 K = L L^T，解三角方程组比直接求逆快得多且更稳定。

```python
import torch
import matplotlib.pyplot as plt

def sample_multivariate_normal(mu, cov, n_samples=1000):
    """手写多元正态采样（用 Cholesky 分解）"""
    L = torch.linalg.cholesky(cov)  # cov = L @ L^T
    d = mu.size(0)
    z = torch.randn(n_samples, d)  # 标准正态
    samples = mu + z @ L.T  # 广播：每个样本都是 mu + L @ z_i
    return samples

# 构造一个 2 维相关的协方差矩阵
mu = torch.tensor([1.0, 2.0])
cov = torch.tensor([
    [1.0, 0.8],  # x1 方差 1，x1-x2 协方差 0.8（强正相关）
    [0.8, 1.5],  # x2 方差 1.5
])

samples = sample_multivariate_normal(mu, cov, n_samples=5000)
print(f"样本均值: {samples.mean(dim=0).round(decimals=3).tolist()}（期望 {mu.tolist()}）")
print(f"样本协方差:\n{torch.cov(samples.T).round(decimals=3)}")
print(f"期望协方差:\n{cov}")
```

## 完整跑通方案：从零实现一个带 PCA 预处理的分类模型

把前面讲的所有运算串起来，做一个完整的端到端流程：

### 第一步：生成高维人造数据

```python
import torch
import torch.nn as nn
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# 生成 100 维高维数据（只有前 10 维有信息，后 90 维是噪声）
X_np, y_np = make_classification(
    n_samples=2000, n_features=100, n_informative=10,
    n_redundant=5, n_classes=3, random_state=42
)
X = torch.tensor(X_np, dtype=torch.float32)
y = torch.tensor(y_np, dtype=torch.long)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
print(f"训练集: {X_train.shape}, 测试集: {X_test.shape}")
```

### 第二步：用我们手写的 PCA 降到 20 维

```python
# 找到「解释 95% 方差所需的最小 k」
Z_train, P_k, eigvals, ratio = manual_pca(X_train, k=100)

# 计算累计解释率
cumsum = torch.cumsum(eigvals, dim=0) / eigvals.sum()
k_95 = int(torch.searchsorted(cumsum, 0.95)) + 1
print(f"解释 95% 方差需要 k = {k_95} 维（原始 100 维）")

# 用这个 k 做最终降维
k = k_95
Z_train, P_k, _, ratio = manual_pca(X_train, k=k)
# 测试集用训练集的 P_k 和训练集均值做同样的投影
X_test_centered = X_test - X_train.mean(dim=0, keepdim=True)
Z_test = X_test_centered @ P_k
print(f"降维后：训练 {Z_train.shape}，测试 {Z_test.shape}，方差解释率 {ratio:.2%}")
```

### 第三步：手写一个用 Cholesky 初始化的简单 MLP

```python
class CholeskyInitMLP(nn.Module):
    def __init__(self, in_dim, hidden_dim, out_dim):
        super().__init__()
        self.fc1 = nn.Linear(in_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.fc3 = nn.Linear(hidden_dim, out_dim)
        self._init_weights()

    def _init_weights(self):
        """把 fc1 初始权重用 Cholesky 做『正交化』，改善训练初期稳定性"""
        for fc in [self.fc1, self.fc2, self.fc3]:
            d_out, d_in = fc.weight.shape
            # 用一个正定矩阵的 Cholesky 因子当权重初始值（使 W W^T 接近单位阵）
            # 构造 M = I + 小扰动，保证正定
            if d_in >= d_out:
                # 把 W 初始化得接近行正交
                temp = torch.randn(d_in, d_in) * 0.01 + torch.eye(d_in)
                L = torch.linalg.cholesky(temp)  # L L^T = temp ≈ I
                fc.weight.data = L[:d_out, :d_in].T * (2.0 / d_in) ** 0.5
            else:
                fc.weight.data = fc.weight.data * (2.0 / d_in) ** 0.5
            nn.init.zeros_(fc.bias)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

# 训练
model = CholeskyInitMLP(k, 64, 3)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.CrossEntropyLoss()

for epoch in range(100):
    optimizer.zero_grad()
    logits = model(Z_train)
    loss = criterion(logits, y_train)
    loss.backward()
    optimizer.step()

    if epoch % 20 == 0 or epoch == 99:
        acc = (logits.argmax(1) == y_train).float().mean()
        with torch.no_grad():
            test_logits = model(Z_test)
            test_acc = (test_logits.argmax(1) == y_test).float().mean()
        print(f"Epoch {epoch:3d} | 训练 loss={loss.item():.4f} acc={acc:.2%} | 测试 acc={test_acc:.2%}")
```

### 第四步：提取训练后权重，用 SVD 做低秩压缩对比

```python
# 拿 fc1 权重做 SVD 分析
W_fc1 = model.fc1.weight.detach()
U, S, Vt = torch.linalg.svd(W_fc1, full_matrices=False)
print(f"\nfc1 权重形状: {W_fc1.shape}，奇异值总数: {len(S)}")
print(f"奇异值衰减（前10/后10比例）: {S[:10].sum() / S.sum():.2%} / {S[-10:].sum() / S.sum():.2%}")

# 压缩到不同的秩，看精度损失
for rank in [8, 16, 32, 48]:
    S_trunc = torch.zeros_like(S)
    S_trunc[:rank] = S[:rank]
    W_compressed = U @ torch.diag(S_trunc) @ Vt
    # 计算压缩后和原权重的输出差异
    with torch.no_grad():
        orig_out = Z_test @ W_fc1.T + model.fc1.bias
        comp_out = Z_test @ W_compressed.T + model.fc1.bias
        rel_err = torch.norm(orig_out - comp_out) / torch.norm(orig_out)
    param_ratio = rank * (W_fc1.shape[0] + W_fc1.shape[1]) / W_fc1.numel()
    print(f"秩={rank:2d} | 参数量 {param_ratio:.1%} | fc1 输出相对误差 {rel_err:.2%}")
```

## 常见误区

**误区 1：矩阵乘法是对每个元素相乘。** → 这叫 Hadamard 积（对应 nn.MultiheadAttention 里的 mask 相乘），不是矩阵乘法。矩阵乘法是「行 × 列」的内积求和：C[i,j] = Σ_k A[i,k]·B[k,j]。两者搞混的话，注意力的 QK^T 就完全不知道在算什么了。

**误区 2：特征值分解和 SVD 差不多，随便用哪个都行。** → 特征值分解只适用于方阵，而且只有对称正定矩阵的分解才数值稳定；SVD 适用于**任意形状**的矩阵，而且奇异值永远非负。深度学习里遇到的矩阵大多数不是方阵（比如词嵌入 V×d，权重 d_out×d_in），这种情况只能用 SVD。

**误区 3：LoRA 加一个低秩更新是个经验 trick，没有数学依据。** → 有依据。大模型微调后的 ΔW 具有「有效秩很低」的经验规律——大部分权重变化集中在少数几个主方向上（SVD 前几十项奇异值占比超过 90%）。LoRA 就是直接假设 ΔW = B×A（秩 r），把参数搜索空间从 O(d×k) 降到 O(r(d+k))，r 通常取 4/8/16。这不是拍脑袋，是 SVD 分析大量实验后得到的洞见。

**误区 4：数据中心化对 PCA 不重要，忘减均值也没关系。** → 后果非常严重。如果不减去均值，协方差矩阵会被数据本身的绝对位置主导，第一主成分会指向「数据中心的方向」而不是「数据变化最大的方向」。举个极端例子：所有点都在 (100, 100) 附近，方差只有 0.01。不减均值的话，PCA 第一主成分会指向 (1, 1) 方向（原点到数据中心），完全错误。

**误区 5：归一化内积（余弦相似度）比 L2 距离更适合相似度任务。** → 看场景。如果你的向量是词嵌入或者特征已经归一化过（比如 CLIP 图像/文本特征），两个是等价的：||a-b||² = 2 - 2·cos(a,b)。但如果向量长度携带信息（比如用户行为向量的长度代表活跃度），L2 距离会区分「长度不同但方向相同」的向量，余弦不会。这时候应该选 L2，或者把长度当作独立特征。
