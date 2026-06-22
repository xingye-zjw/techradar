# 梯度下降（Gradient Descent）

**梯度下降**是一种通过迭代调整参数来最小化损失函数的优化算法。它是现代机器学习（包括深度学习）的**核心训练方法**——从线性回归到 GPT-4，几乎所有模型都在使用梯度下降的某种变体。

## 核心直觉

把损失函数想象成一座「山」，我们站在山上某个位置，想找到山谷（最低点）：

```
           ↑ 高山 (loss 很大)
          / \
         /   \
        /     \
       /       \
      /         \
     /           \
    /             \
   ●  ← 我们站在这里
    \
     ↓ 每一步向山脚方向走一点点
      \
       ●
        ↓
         ●
          ↓
           ═══ 山谷 (loss 最小) ═══
```

**梯度下降三步曲**：

1. 计算当前位置的**梯度**（即「坡度」，指向最陡的上升方向）
2. 朝**梯度相反方向**迈一小步（即最陡的下降方向）
3. 重复上述过程，直到到达谷底

## 数学公式

```
θₜ₊₁ = θₜ - η × ∇θ L(θₜ)
        ↑     ↑
        │     └─ 当前位置的梯度
        └─────── 学习率
```

其中：
- `θ`：模型参数（权重和偏置）
- `L(θ)`：损失函数，衡量模型的错误程度
- `∇θ L(θ)`：损失函数对参数 θ 的梯度（偏导数向量）
- `η` (eta)：学习率 (learning rate)，决定每一步迈多大

**关键直觉**：梯度指向损失**增加**最快的方向，因此我们**减去**梯度来最小化损失。

## Python 从零实现（10 行代码的线性回归）

```python
import numpy as np

# 构造数据: y = 2x + 1 + 噪声
np.random.seed(42)
x = np.random.randn(100)
y = 2 * x + 1 + 0.1 * np.random.randn(100)

# 初始化参数 (我们要学 w 和 b)
w = np.random.randn()
b = np.random.randn()
learning_rate = 0.1

# 梯度下降
for epoch in range(200):
    # 前向传播: y_pred = w*x + b
    y_pred = w * x + b

    # 计算 MSE 损失: L = mean((y_pred - y)^2)
    loss = np.mean((y_pred - y) ** 2)

    # 反向传播: 手动求导
    # ∂L/∂w = mean(2*(y_pred - y)*x)
    # ∂L/∂b = mean(2*(y_pred - y))
    dw = np.mean(2 * (y_pred - y) * x)
    db = np.mean(2 * (y_pred - y))

    # 更新参数（核心！）
    w -= learning_rate * dw
    b -= learning_rate * db

    if epoch % 20 == 0:
        print(f"epoch={epoch:3d}, loss={loss:.4f}, w={w:.3f}, b={b:.3f}")

# 最终结果: w≈2.0, b≈1.0（与真实参数吻合！）
```

## 超参数分析

### 1. 学习率 (Learning Rate) —— 最关键的超参数

```
η 太大 → 步子太大，可能会越过山谷，甚至发散

  /\     /\
 /  \   /  \
    \ /
     X  越过了山谷！

η 太小 → 步子太小，收敛太慢

  o
   o
    o
     o
      o
       oooo... 永远走不到

η 合适 → 平滑收敛到谷底
  o
   oo
     oo
       ooo
          ═══
```

**典型的学习率设置策略**：

| 策略 | 说明 |
|------|-----|
| 固定学习率 | 简单，但最后精度可能不够 |
| 学习率衰减 (Decay) | 随时间逐步减小：`η_t = η₀ / (1 + k·t)` |
| 余弦退火 (Cosine Annealing) | 按余弦函数平滑降低 |
| Warm-up + Decay | 先从小学习率升温，再衰减（大模型训练标准） |
| 自适应学习率 | Adam、RMSprop、AdaGrad 等自动调整 |

### 2. 学习率范围测试 (LR Finder)

现代实践中，训练开始前先跑一次「从小到大使用不同学习率」的短测试，找到最优学习率：

```python
# fast.ai 风格的 LR Finder
for lr in [1e-6, 1e-5, ..., 1e-1, 1]:
    # 用该学习率训练一小段
    # 记录 loss 随 lr 的变化

# 画 loss-lr 曲线，找到 loss 下降最快的那个点
```

### 3. 迭代次数 (Epochs / Steps)

- 太少：欠拟合，模型还没走到谷底
- 太多：浪费计算资源 + 可能过拟合（此时用 Early Stopping）

### 4. 批大小 (Batch Size)

| 方案 | 每次用多少样本计算梯度 | 优缺点 |
|------|---------------------|--------|
| **Batch GD** | 全部样本 | 稳定但慢，内存不够用 |
| **SGD** | 1 个样本 | 快但噪声大，收敛不稳定 |
| **Mini-batch SGD** | 32~1024 个样本 | 折中方案，**最常用** |

## 梯度下降的变体家族

```
梯度下降 (GD)
    │
    ├── SGD (Stochastic Gradient Descent)
    │     └── SGD + Momentum
    │           └── Nesterov Accelerated Gradient (NAG)
    │
    ├── AdaGrad (自适应学习率)
    │     └── RMSProp (改进 AdaGrad 的衰减问题)
    │           └── Adam (RMSProp + Momentum)
    │                 ├── AdamW (Adam + 权重衰减) ← 现代默认
    │                 ├── AdaBound
    │                 └── Lion
    │
    └── 二阶方法（不常用在大模型）
          ├── L-BFGS
          └── 自然梯度下降 (Natural Gradient)
```

## Adam（当前最流行的优化器）

核心思想：**为每个参数维护一个自适应的学习率**，同时累积动量。

```python
# Adam 伪代码（简化）
m = 0  # 一阶矩（动量，类似速度）
v = 0  # 二阶矩（类似梯度平方的平均值）
β1 = 0.9
β2 = 0.999
ε = 1e-8
learning_rate = 1e-3

for t in range(num_steps):
    g = compute_gradient(loss, params)  # 当前梯度
    m = β1 * m + (1 - β1) * g           # 更新一阶矩（平滑梯度）
    v = β2 * v + (1 - β2) * (g ** 2)    # 更新二阶矩（平滑梯度平方）
    m_hat = m / (1 - β1 ** t)           # 偏差修正
    v_hat = v / (1 - β2 ** t)           # 偏差修正
    params = params - learning_rate * m_hat / (sqrt(v_hat) + ε)
```

**AdamW = Adam + 正确的权重衰减实现**。当前是 Transformer 模型训练的默认优化器。

## 在 PyTorch 中的实践

```python
import torch
import torch.nn as nn
from torch.optim import AdamW, lr_scheduler

# 1. 定义模型和损失
model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Linear(256, 10),
)
criterion = nn.CrossEntropyLoss()

# 2. 创建优化器
optimizer = AdamW(
    model.parameters(),
    lr=3e-4,          # 常用学习率
    weight_decay=1e-4 # 权重衰减 (L2 正则化的变体)
)

# 3. 学习率调度器
scheduler = lr_scheduler.CosineAnnealingLR(
    optimizer, T_max=100
)

# 4. 训练循环
for epoch in range(100):
    for batch_data, batch_labels in dataloader:
        optimizer.zero_grad()           # 清空梯度
        output = model(batch_data)      # 前向传播
        loss = criterion(output, batch_labels)
        loss.backward()                 # 反向传播（计算梯度）
        optimizer.step()                # 更新参数 ← 核心一步！

    scheduler.step()                    # 每个 epoch 更新学习率
    print(f"Epoch {epoch}, loss={loss.item():.4f}")
```

## 梯度下降的挑战与解决方案

### 1. 局部最优 (Local Minima)

```
问题：山谷不是山谷——我们可能陷在一个「小山坳」里，以为到了谷底

   /\       /\
  /  \     /  \
 /    \   /    \
/      \_/      \
        ●  ← 局部最优，但不是全局最优

解决：
① 随机初始化（多次跑，取最好结果）
② 动量（Momentum）：帮助翻过小山坡
③ Adam：自适应学习率，在高曲率方向更大步
④ 增大 batch size：减少梯度噪声，更稳定
⑤ 更好的损失函数设计（如对比学习）
```

### 2. 鞍点 (Saddle Point)

```
在高维空间中，「局部最优」实际上很少
更多情况是鞍点：某个维度向上凸，另一个维度向下凹
   
    /\
   /  \       ← 从这个点开始，梯度为 0，但不是谷底
───────
      \  /
       \/

解决：动量 / Adam 的噪声帮助逃离鞍点
```

### 3. 梯度消失 (Vanishing Gradients)

**问题**：深层网络（尤其是 RNN）中，反向传播的梯度经过多层后会变得极小，参数几乎不更新

```
dL/dW₁ = dL/dy · dy/dhₙ · dhₙ/dhₙ₋₁ · ... · dh₂/dh₁ · dh₁/dW₁
         └──────────────────────────────────────────────────┘
         每一项 < 1 → 连乘后指数级变小 → 趋近于 0

解决：
① ReLU / GELU 激活函数（代替 sigmoid/tanh）
② 残差连接 (ResNet) / LSTM / GRU
③ 层归一化 (LayerNorm / BatchNorm)
④ 更好的初始化（He/Xavier 初始化）
⑤ 梯度裁剪 (Gradient Clipping)
⑥ Adam / RMSProp 等自适应优化器
```

### 4. 梯度爆炸 (Exploding Gradients)

**问题**：梯度过大，参数更新过猛，训练不稳定

```
解决：
① 梯度裁剪：如果梯度范数超过阈值，则按比例缩放
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
② 权重归一化 / 层归一化
③ 更好的初始化
④ 降低学习率
```

### 5. 学习率设置不当（最常见）

**症状诊断**：

| 现象 | 诊断 | 解决方案 |
|------|------|---------|
| loss 剧烈震荡，NaN | 学习率太大 | lr × 0.1 |
| loss 下降但很慢 | 学习率太小 | lr × 3~10 |
| loss 先降后升 | 后期 lr 太大 | 加 scheduler / warmup |
| loss 下降到平台后不再动 | 陷入局部最优 | 退火 / 重启 / 换 optimizer |
| loss 总是非常缓慢下降 | 模型容量不足 | 增大模型 / 换架构 |

## 训练可视化：损失曲线的经典形状

```
理想曲线（loss 随时间递减）：

 loss
   ^
   │╲
   │ ╲
   │  ╲
   │   ╲_
   │     ╲
   │      ╲___
   │          ╲_____
   │               ╲_____
   └──────────────────────> epoch
```

```
典型问题：训练 loss 远小于验证 loss（过拟合）

 train loss  ↓ ↓ ↓ ↓ ... (一直下降)
 valid loss  ↓ ↓ ↥ ↥ ↥ ... (在某点后反而上升)

                        ← 这个拐点之后模型开始过拟合
```

**解决方案**：Early Stopping（监控验证集，loss 连续上升则停止训练）

## 进阶训练技巧

### 1. 学习率预热 (Warm-up)

```python
# 前 N 步线性升温到目标学习率，然后再衰减
# 用于避免训练初期的不稳定
scheduler = torch.optim.lr_scheduler.LambdaLR(
    optimizer,
    lambda step: min(step / warmup_steps, 1.0) * ...
)
```

### 2. 梯度累计 (Gradient Accumulation)

```python
# 当显存不足以跑大 batch 时，通过多次 backward 再一次 step 模拟大 batch
accumulation_steps = 4
for step, batch in enumerate(dataloader):
    loss = model(batch) / accumulation_steps
    loss.backward()
    if (step + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()
```

### 3. 混合精度训练 (Mixed Precision)

```python
# 用 float16 做前向传播，用 float32 做梯度累积
# 节省约 50% 显存，加速约 30%
with torch.amp.autocast('cuda'):
    output = model(inputs)
    loss = criterion(output, targets)
scaler.scale(loss).backward()
scaler.step(optimizer)
scaler.update()
```

### 4. 权重衰减 (Weight Decay)

```python
# 在 AdamW 中，weight_decay 直接作用于参数
# 等价于在每步更新时加上 -η·λ·W
# 作用：类似 L2 正则化，防止参数太大，提升泛化
AdamW(model.parameters(), lr=3e-4, weight_decay=1e-4)
```

### 5. 学习率重启 (Learning Rate Restart)

```
多次把学习率"加热"，帮助跳出局部最优

  loss
   ^
   │╲          ╲           ╲
   │ ╲          ╲           ╲
   │  ╲_         ╲_          ╲_
   │    ╲           ╲           ╲
   │     ╲___        ╲___        ╲___
   └──────────────────────────────────> epoch
         ↑           ↑           ↑
      重启 lr      重启 lr      重启 lr
```

## 为什么梯度下降工作得这么好？

### 1. 对于凸优化问题：保证找到全局最优

对于凸函数（如线性回归的 MSE、SVM），梯度下降可以证明会收敛到全局最小值。

### 2. 对于非凸优化问题（神经网络）：我们也不知道为什么这么好

这是深度学习的「玄学」之一。理论上我们只能保证收敛到「临界点」（梯度=0），但实践中在真实数据上训练往往能得到很好的泛化性能。可能的原因：

- 高维空间中「坏的」局部最优其实很少
- 好的优化器 + 正则化手段帮助我们避开糟糕的点
- 早期停止防止模型走太深
- 大模型可能存在「解的连通性」（所有局部最优质量相近）

## 优化器选择速查

| 场景 | 推荐优化器 | 典型 lr |
|------|-----------|---------|
| 计算机视觉 (CNN) | AdamW / SGD + Momentum | 1e-4 ~ 1e-3 |
| Transformer / NLP | AdamW (强推荐！) | 3e-4 ~ 5e-5 |
| 小数据集 / 传统 ML | L-BFGS / Adam | 1e-3 |
| 强化学习 | Adam | 3e-4 |
| 微调大模型 (LoRA) | AdamW | 1e-4 ~ 1e-3 |
| 对抗训练 | Adam + 更大的权重衰减 | - |

**最佳实践**：永远先试 AdamW + 余弦退火 + warmup。

## 学习路径

```
第一阶段：理解梯度下降
  ├── 偏导数、梯度、链式法则
  ├── 从零实现线性回归 + 梯度下降
  └── 学习率的调试

第二阶段：PyTorch 训练循环
  ├── optimizer.zero_grad() + backward() + step()
  ├── 自定义优化器
  ├── 学习率调度器 (scheduler)
  └── 混合精度训练

第三阶段：理解主流优化器
  ├── Momentum, RMSProp, Adam, AdamW 的公式
  ├── 各自的优缺点与适用场景
  └── 为什么 AdamW 取代了 Adam

第四阶段：高阶训练技巧
  ├── Warm-up、Gradient Accumulation
  ├── Lookahead、SAM、Lion 等新型优化器
  ├── 大模型分布式训练优化策略
  └── 超参数搜索 (Bayesian Optimization)
```

## 推荐资源

- **An overview of gradient descent optimization algorithms**（Sebastian Ruder 的经典博客，必看）
- **《Deep Learning》Goodfellow 第 4 章 & 第 8 章**：数值计算 + 深度模型优化
- **「深度学习优化与训练」李沐动手学深度学习 第 11 章**：PyTorch 实战
- **AdamW 和 Weight Decay 论文**：理解为什么 AdamW 更好

相关术语：[矩阵](/glossary/matrix)、[张量](/glossary/tensor)、[PyTorch](/glossary/pytorch)、[过拟合](/glossary/overfitting)、[反向传播](/glossary/backpropagation)
