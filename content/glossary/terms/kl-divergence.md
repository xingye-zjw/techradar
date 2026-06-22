# KL散度（Kullback-Leibler Divergence）

**KL散度**衡量用 Q 分布来编码 P 分布的信息的额外代价，是信息论中衡量两个概率分布差异的核心工具。

## 数学定义

### 离散分布

```
D_KL(P||Q) = Σ P(x) log(P(x) / Q(x))

P: 真实分布
Q: 近似分布
```

### 连续分布

```
D_KL(P||Q) = ∫ P(x) log(P(x) / Q(x)) dx
```

## 核心性质

| 性质 | 说明 |
|------|------|
| **非负性** | D_KL(P||Q) >= 0，当且仅当 P=Q 时等于 0 |
| **非对称性** | D_KL(P||Q) ≠ D_KL(Q||P)，不能称为"距离" |
| **不可逆性** | 从 Q 到 P 和从 P 到 Q 的代价不同 |

## Python 实现

```python
import numpy as np

def kl_divergence(p, q):
    """计算两个离散分布的KL散度"""
    # 避免除零和log(0)
    p = np.clip(p, 1e-10, 1)
    q = np.clip(q, 1e-10, 1)
    
    # KL(P||Q) = Σ P(x) * log(P(x)/Q(x))
    kl = np.sum(p * np.log(p / q))
    return kl

# 示例
p = np.array([0.5, 0.3, 0.2])  # 真实分布
q = np.array([0.4, 0.4, 0.2])  # 近似分布

print(f"KL(P||Q) = {kl_divergence(p, q):.4f}")  # ~0.0365
print(f"KL(Q||P) = {kl_divergence(q, p):.4f}")  # ~0.0397
```

## 在机器学习中的应用

### 1. 交叉熵与KL散度的关系

```
交叉熵：H(P, Q) = -Σ P(x) log Q(x)

分解：
H(P, Q) = H(P) + D_KL(P||Q)
           ↑         ↑
        信息熵    KL散度

由于 H(P) 是常数，最小化交叉熵等价于最小化 KL 散度
```

```python
import torch
import torch.nn.functional as F

# 分类任务中使用的交叉熵损失
logits = torch.randn(3, 5)  # batch=3, classes=5
labels = torch.tensor([1, 0, 4])

# 交叉熵 = 信息熵 + KL散度
loss = F.cross_entropy(logits, labels)
```

### 2. 变分自编码器（VAE）中的 KL 散度

```python
def vae_loss(recon_x, x, mu, logvar):
    """VAE 损失函数"""
    # 重建损失
    recon_loss = F.mse_loss(recon_x, x)
    
    # KL 散度：让潜在分布接近标准正态分布
    # D_KL(N(mu, sigma²) || N(0, 1))
    kl_loss = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
    
    return recon_loss + kl_loss
```

### 3. 知识蒸馏

```python
def distillation_loss(student_logits, teacher_logits, temperature=3.0):
    """知识蒸馏：让学生模型模仿教师模型"""
    # 软标签分布
    soft_student = F.softmax(student_logits / temperature, dim=1)
    soft_teacher = F.softmax(teacher_logits / temperature, dim=1)
    
    # KL 散度损失
    kl_loss = F.kl_div(
        soft_student.log(), 
        soft_teacher, 
        reduction='batchmean'
    ) * (temperature ** 2)
    
    return kl_loss
```

## 应用场景

- **变分推断**：VAE 中约束潜在空间分布
- **强化学习**：PPO 算法中的策略约束
- **生成模型**：GAN、扩散模型的分布匹配
- **特征选择**：衡量特征与目标的相关性
- **信息检索**：查询与文档的相关性度量

## 与其他散度的对比

| 散度 | 公式 | 特点 |
|------|------|------|
| **KL散度** | P log(P/Q) | 非对称，信息论解释 |
| **JS散度** | (KL(P||M) + KL(Q||M))/2 | 对称，有界[0,1] |
| **Wasserstein距离** | inf E[d(x,y)] | 度量距离，梯度更好 |

## 相关概念

[交叉熵](/glossary/cross-entropy)、[变分自编码器](/glossary/vae)、[信息论](/glossary/information-theory)、[生成模型](/glossary/generative-model)
