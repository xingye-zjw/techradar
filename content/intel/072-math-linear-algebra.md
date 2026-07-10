---
title: 线性代数基础
category: math
difficulty: beginner
duration: 2-3周
summary: 机器学习和深度学习的数学基础。理解矩阵运算、特征值分解、奇异值分解等核心概念。
takeaways:
  - 掌握矩阵运算的基本操作和几何意义
  - 理解特征值和特征向量的物理含义
  - 学会奇异值分解(SVD)及其应用
  - 能用NumPy实现矩阵运算
relatedIntel:
  - 024-information-theory
  - 025-convex-optimization
  - 073-math-probability
relatedNodes:
  - "cv-detection"
  - "math-linear-algebra"
tags:
  - 线性代数
  - 矩阵
  - 向量
  - 特征值
  - 特征向量
  - 矩阵分解
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

先讲结论：**线性代数 = AI 的底层语言。所有深度学习框架（PyTorch、TensorFlow）的核心操作都是矩阵运算。**

当你看到一个神经网络在做"前向传播"时，它实际上是在做一件事：**矩阵乘法**。当你听到"注意力机制"时，它是在计算 Q·K^T。当你理解"降维"时，它是在做奇异值分解。

不理解线性代数，你将无法理解：

- 为什么神经网络的权重是矩阵而不是标量
- 为什么 Batch Normalization 要计算均值和方差
- 为什么 PCA 能降维
- 为什么梯度下降能优化参数

理解线性代数后，你再看任何机器学习算法（线性回归、SVM、神经网络）都只是在矩阵上做不同的变换。

## 一句话概览（快速版）

你只要记住三句话：

1. **向量 = 有方向和大小的量**，可以表示数据点、特征、梯度
2. **矩阵 = 线性变换**，把一个向量变成另一个向量
3. **特征值分解/SVD = 找到矩阵的"骨架"**，用于降维、压缩、去噪

## 核心拆解

### 🔑 向量与矩阵

**向量**是线性代数的基本单位。在机器学习中，一个数据样本就是一个向量：

```python
import numpy as np

# 一个数据样本：[身高, 体重, 年龄]
person = np.array([175, 70, 25])  # shape: (3,)

# 批量数据：100个样本，每个3个特征
batch = np.random.randn(100, 3)   # shape: (100, 3)
```

**矩阵**是多维向量的集合，也可以理解为"线性变换的描述"：

```python
# 一个 3x3 矩阵
A = np.array([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
])

# 矩阵乘向量 = 线性变换
x = np.array([1, 0, 0])
y = A @ x  # 结果是 A 的第一列 [1, 4, 7]
```

**几何直觉**：矩阵乘法就是把向量"旋转、拉伸、投影"到新的空间。

### 🔑 矩阵运算

**矩阵加法**：对应元素相加（要求形状相同）

```python
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
C = A + B  # [[6, 8], [10, 12]]
```

**矩阵乘法**：最核心的操作，注意形状匹配

```python
A = np.array([[1, 2], [3, 4]])   # shape: (2, 2)
B = np.array([[5, 6], [7, 8]])   # shape: (2, 2)
C = A @ B  # 或 np.matmul(A, B)
# [[1*5+2*7, 1*6+2*8], [3*5+4*7, 3*6+4*8]]
# = [[19, 22], [43, 50]]
```

**转置**：行列互换

```python
A = np.array([[1, 2, 3], [4, 5, 6]])  # shape: (2, 3)
A_T = A.T  # shape: (3, 2)
# [[1, 4], [2, 5], [3, 6]]
```

**逆矩阵**：矩阵的"倒数"，A·A⁻¹ = I

```python
A = np.array([[1, 2], [3, 4]])
A_inv = np.linalg.inv(A)
print(A @ A_inv)  # ≈ 单位矩阵 [[1, 0], [0, 1]]
```

**重要性质**：

- (AB)^T = B^T A^T
- (AB)^-1 = B^-1 A^-1
- 矩阵乘法**不满足交换律**：AB ≠ BA

### 🔑 特征值分解

**定义**：对于方阵 A，如果存在非零向量 v 和标量 λ，使得 **Av = λv**，则 λ 是特征值，v 是特征向量。

**几何含义**：特征向量是矩阵变换后"方向不变"的向量，特征值是"拉伸倍数"。

```python
import numpy as np

A = np.array([[4, 1], [2, 3]])
eigenvalues, eigenvectors = np.linalg.eig(A)

print("特征值:", eigenvalues)  # [5, 2]
print("特征向量:\n", eigenvectors)

# 验证: A @ v = λ @ v
for i in range(len(eigenvalues)):
    v = eigenvectors[:, i]
    lambda_v = eigenvalues[i]
    print(f"验证 A·v = λ·v: {np.allclose(A @ v, lambda_v * v)}")
```

**特征值分解**：A = PDP⁻¹，其中 D 是特征值对角阵，P 是特征向量组成的矩阵。

**应用场景**：

- **主成分分析（PCA）**：找方差最大的方向
- **振动分析**：找系统的固有频率
- **PageRank**：网页排名算法的核心

```python
# PCA 示例：降维
from sklearn.decomposition import PCA

# 100个样本，每个10维
X = np.random.randn(100, 10)

# 降到3维
pca = PCA(n_components=3)
X_reduced = pca.fit_transform(X)
print("降维后形状:", X_reduced.shape)  # (100, 3)
```

### 🔑 奇异值分解（SVD）

**SVD 是特征值分解的推广**，适用于任意形状的矩阵。

**公式**：A = UΣV^T

- U：左奇异向量（m×m）
- Σ：奇异值对角阵（m×n）
- V^T：右奇异向量（n×n）

```python
import numpy as np

# 任意形状矩阵
A = np.array([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12]
])  # shape: (4, 3)

U, S, Vt = np.linalg.svd(A)

print("U 形状:", U.shape)   # (4, 4)
print("S 形状:", S.shape)   # (3,) 奇异值
print("Vt 形状:", Vt.shape) # (3, 3)

# 重构原矩阵
Sigma = np.zeros((4, 3))
Sigma[:3, :3] = np.diag(S)
A_reconstructed = U @ Sigma @ Vt
print("重构误差:", np.allclose(A, A_reconstructed))
```

**SVD 的威力**：低秩近似

```python
# 只保留前 k 个奇异值
def low_rank_approximation(A, k):
    U, S, Vt = np.linalg.svd(A)
    # 只保留前 k 个
    U_k = U[:, :k]
    S_k = np.diag(S[:k])
    Vt_k = Vt[:k, :]
    return U_k @ S_k @ Vt_k

# 图像压缩示例
from PIL import Image

# 加载灰度图
img = Image.open("image.jpg").convert("L")
img_array = np.array(img, dtype=float)

# 用前50个奇异值压缩
compressed = low_rank_approximation(img_array, 50)
print(f"压缩比: {50 * (img_array.shape[0] + img_array.shape[1]) / (img_array.shape[0] * img_array.shape[1]):.2%}")
```

**应用场景**：

- 图像压缩
- 推荐系统（矩阵分解）
- 自然语言处理（LSA 潜在语义分析）
- 数据去噪

### 🔑 线性方程组

**Ax = b** 是线性代数的核心问题之一。

```python
import numpy as np

# 求解线性方程组
# 2x + y = 5
# 3x + 2y = 8

A = np.array([[2, 1], [3, 2]])
b = np.array([5, 8])

# 方法1：直接求逆
x = np.linalg.inv(A) @ b
print("解:", x)  # [2, 1]

# 方法2：更稳定的 solve 函数
x = np.linalg.solve(A, b)
print("解:", x)  # [2, 1]
```

**最小二乘解**：当方程组无精确解时，找最优近似解

```python
# 超定方程组（方程数 > 未知数）
A = np.array([[1, 1], [1, 2], [1, 3], [1, 4]])
b = np.array([2, 3, 5, 4])

# 最小二乘解
x, residuals, rank, s = np.linalg.lstsq(A, b, rcond=None)
print("最小二乘解:", x)  # 拟合直线 y = ax + b 的参数
```

**应用场景**：

- 线性回归
- 曲线拟合
- 控制系统设计

## 完整跑通方案

**第一步：掌握 NumPy 基础操作**

```python
import numpy as np

# 1. 创建矩阵
A = np.array([[1, 2], [3, 4]])
B = np.eye(2)  # 单位矩阵
C = np.zeros((3, 3))  # 全零矩阵
D = np.random.randn(3, 3)  # 随机矩阵

# 2. 基本运算
print("矩阵加法:\n", A + B)
print("矩阵乘法:\n", A @ B)
print("转置:\n", A.T)
print("行列式:", np.linalg.det(A))
print("逆矩阵:\n", np.linalg.inv(A))

# 3. 范数（衡量向量/矩阵的"大小"）
v = np.array([3, 4])
print("L2范数:", np.linalg.norm(v))  # 5
print("L1范数:", np.linalg.norm(v, 1))  # 7
```

**第二步：实现 PCA 降维**

```python
import numpy as np
import matplotlib.pyplot as plt

# 生成相关数据
np.random.seed(42)
n_samples = 100
X = np.random.randn(n_samples, 2) @ np.array([[2, 0.5], [0.5, 1]])

# PCA 步骤
def pca(X, n_components):
    # 1. 中心化
    X_centered = X - np.mean(X, axis=0)

    # 2. 计算协方差矩阵
    cov = np.cov(X_centered.T)

    # 3. 特征值分解
    eigenvalues, eigenvectors = np.linalg.eig(cov)

    # 4. 按特征值排序
    idx = np.argsort(eigenvalues)[::-1]
    eigenvectors = eigenvectors[:, idx]

    # 5. 选择前 k 个主成分
    W = eigenvectors[:, :n_components]

    # 6. 投影
    X_pca = X_centered @ W

    return X_pca, W, eigenvalues[idx]

X_pca, W, eigenvalues = pca(X, 2)

print("主成分方向:\n", W)
print("特征值（解释方差）:", eigenvalues)
print("方差解释比:", eigenvalues / np.sum(eigenvalues))
```

**第三步：用 SVD 实现图像压缩**

```python
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt

def compress_image(image_path, k_values=[10, 50, 100]):
    """用不同数量的奇异值压缩图像"""

    # 加载图像
    img = Image.open(image_path).convert('L')  # 转灰度
    img_array = np.array(img, dtype=float)

    fig, axes = plt.subplots(1, len(k_values) + 1, figsize=(15, 4))

    # 原图
    axes[0].imshow(img_array, cmap='gray')
    axes[0].set_title('Original')
    axes[0].axis('off')

    # SVD
    U, S, Vt = np.linalg.svd(img_array)

    # 不同压缩率
    for i, k in enumerate(k_values):
        # 只保留前 k 个奇异值
        compressed = U[:, :k] @ np.diag(S[:k]) @ Vt[:k, :]

        axes[i+1].imshow(compressed, cmap='gray')
        axes[i+1].set_title(f'k={k}\nCompression: {k*(U.shape[0]+Vt.shape[1])/(U.shape[0]*Vt.shape[1])*100:.1f}%')
        axes[i+1].axis('off')

    plt.tight_layout()
    plt.show()

    return U, S, Vt

# 使用示例（需要一张图片）
# U, S, Vt = compress_image("your_image.jpg")
```

**第四步：理解矩阵的几何意义**

```python
import numpy as np
import matplotlib.pyplot as plt

def visualize_transformation(A, title="Linear Transformation"):
    """可视化线性变换的效果"""

    # 原始单位圆
    theta = np.linspace(0, 2*np.pi, 100)
    circle = np.array([np.cos(theta), np.sin(theta)])

    # 变换后的形状
    transformed = A @ circle

    # 绘图
    fig, axes = plt.subplots(1, 2, figsize=(10, 4))

    # 原始
    axes[0].plot(circle[0], circle[1], 'b-', linewidth=2)
    axes[0].set_xlim(-3, 3)
    axes[0].set_ylim(-3, 3)
    axes[0].set_aspect('equal')
    axes[0].set_title('Original Unit Circle')
    axes[0].grid(True)

    # 变换后
    axes[1].plot(transformed[0], transformed[1], 'r-', linewidth=2)
    axes[1].set_xlim(-3, 3)
    axes[1].set_ylim(-3, 3)
    axes[1].set_aspect('equal')
    axes[1].set_title(f'After {title}')
    axes[1].grid(True)

    plt.tight_layout()
    plt.show()

# 示例变换
# 1. 拉伸
A_stretch = np.array([[2, 0], [0, 1]])
visualize_transformation(A_stretch, "Stretching")

# 2. 旋转
theta = np.pi / 4  # 45度
A_rotate = np.array([[np.cos(theta), -np.sin(theta)],
                     [np.sin(theta), np.cos(theta)]])
visualize_transformation(A_rotate, "Rotation")

# 3. 剪切
A_shear = np.array([[1, 0.5], [0, 1]])
visualize_transformation(A_shear, "Shearing")
```

## 常见误区

**"矩阵乘法就是对应元素相乘？" → 这是 Hadamard 积，不是标准矩阵乘法**。标准矩阵乘法是行×列的点积，这是深度学习中最核心的操作。

**"特征值和奇异值是一回事？" → 不完全一样**。特征值只适用于方阵，奇异值适用于任意矩阵。SVD 是更通用的分解方法。

**"行列式为0就无解？" → 不一定**。行列式为0意味着矩阵不可逆，但方程组可能有无数解（欠定）或无解（超定），需要用最小二乘等方法求解。

**"SVD 只是理论工具？" → 它是工业界的核心算法**。Netflix 推荐系统、搜索引擎、图像压缩都在用 SVD。

## 推荐学习顺序

1. **3Blue1Brown《线性代数的本质》**（B站有中文字幕，约3小时）— 建立几何直觉
2. **MIT 18.06 线性代数公开课**（Gilbert Strang 教授）— 系统学习理论
3. **用 NumPy 实现本文所有代码示例**，确保能跑通
4. **《深度学习》花书第二章**（Ian Goodfellow）— 理解线性代数在 ML 中的应用
5. **实现一个简单的 PCA 和推荐系统**，巩固理解

## 延伸阅读

- **《线性代数应该这样学》**（Sheldon Axler）— 从向量空间讲起，不依赖行列式
- **《矩阵计算》**（Gene H. Golub）— SVD 和数值方法的权威参考
- **Khan Academy 线性代数课程**— 适合零基础入门
- **《程序员的数学》**— 结编程实例讲解
