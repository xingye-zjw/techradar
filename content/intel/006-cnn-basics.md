---
title: 卷积神经网络 CNN 基础
category: computer-vision
difficulty: beginner
duration: 1-2周
summary: 从原始像素中自动提取层次化视觉特征，是 ResNet、ViT 等所有现代视觉模型的共同祖先
takeaways:
  - 理解卷积、池化、padding、stride 的直觉与输出尺寸公式
  - 理解感受野与层次化特征提取（边缘 → 纹理 → 物体 → 场景）
  - 读懂 LeNet → AlexNet → VGG → GoogLeNet 的演进脉络
  - 能用 PyTorch 手写一个两层 CNN，在 MNIST 上训练到 99%+ 准确率
relatedIntel:
  - 002-yolo
  - 004-resnet
  - 060-cv-instance-segmentation
tags:
  - cnn
  - convolution
  - pooling
  - feature map
  - lenet
  - alexnet
  - vgg
  - receptive field
  - batch normalization
---

## 为什么你要学它

在 CNN 出现之前，计算机视觉靠的是**人工设计的特征**：SIFT 提取关键点、HOG 描述梯度方向直方图、DPM 做可变形部件模型。一个图像分类系统，可能一半代码在设计特征提取器，效果却离人类水平差得远——因为手写特征根本表达不了"猫耳朵"或"斑马线"这种复杂视觉概念。

2012 年 AlexNet 横空出世，思路极其反传统：**不给模型任何"什么是猫"的先验知识，只给图片和标签，让网络自己从像素里学特征**。结果 ImageNet 2012 top-5 错误率从第二名的 26.2% 降到 AlexNet 的 15.3%——一次性把学术界的"天花板"砸碎了。

CNN 的核心价值是三句话：

1. **局部感受野**：每个神经元只看输入的一小块区域（比如 3×3），模拟生物视觉皮层。
2. **参数共享**：同一个卷积核在整张图上滑动，不同位置用同样的权重。"猫的左上角有只耳朵"和"猫的右下角有只耳朵"用同一个特征提取器——参数大量减少，过拟合也减轻。
3. **层次化特征**：浅层学边缘/颜色，中层学纹理/图案，深层学物体部件/整体语义。

如果你要学 ResNet、ViT、Diffusion、YOLO，CNN 是共同基础。**不学 CNN 直接看 ResNet，你会觉得里面的 3×3 卷积是黑魔法；学了 CNN 再看 ViT，你会发现 Transformer 不过是"换了一种方式做空间信息聚合"**。

## 一句话概览（快速版）

- **核心组件**：卷积层（Conv）提取空间特征、激活函数（ReLU）引入非线性、池化层（Max/Avg Pool）压缩尺寸+增加感受野、全连接层（FC）做最终分类。
- **输出尺寸公式**：`H_out = floor((H_in + 2*P - K) / S) + 1`，宽同理。P=padding, K=kernel_size, S=stride。
- **感受野**：输出一个像素对应输入的区域大小。3×3 卷积堆叠两次 = 5×5 感受野，但参数更少 + 多一次非线性更强。
- **架构演进**：LeNet-5（1998，手写数字）→ AlexNet（2012，ReLU+Dropout+GPU 引爆深度学习）→ VGG（2014，统一 3×3 小卷积核）→ GoogLeNet（2014，Inception 多尺寸并行 + 1×1 降维）→ ResNet（2015，残差连接让网络真正变深）。

## 核心拆解

### 🔑 卷积运算：一次滑动就是一次"模板匹配"

想象一张 5×5 的单通道图。我们有一个 3×3 的卷积核（每个位置是一个可学习的权重）。把卷积核"扣"在图上从左上开始滑，每个位置做元素相乘再求和，结果写到输出特征图对应位置。

```
输入 (5×5)         卷积核 (3×3)          输出 (3×3, S=1, P=0)
1 1 1 0 0          1 0 -1
1 1 1 0 0          1 0 -1               → [[0, 3, 3],
1 1 1 0 0          1 0 -1                  [0, 3, 3],
1 1 1 0 0                                  [0, 3, 3]]
1 1 1 0 0
```

这个 3×3 的卷积核，恰好就是一个"垂直边缘检测器"（左列+1、右列-1）。**当网络学到不同的卷积核，就等于学到了不同的"模板"**，用来匹配图上不同的局部模式。

如果输入是 3 通道（RGB），卷积核也变成 3 通道（3×3×3），每个通道独立卷积后把 3 个通道的值加起来，得到输出特征图的 1 个通道。用多少个卷积核，输出就有多少个通道。

### 🔑 Padding、Stride 与输出尺寸公式

**Padding**：在输入四周补 0，让卷积核可以覆盖到边缘像素，同时可以控制输出尺寸不变。P=1 配合 K=3、S=1 时，输出尺寸与输入相同（"same padding"）。

**Stride**：卷积核每次滑动的步长。S=2 时，输出尺寸约为输入的一半——这是一种高效的下采样方式。

**输出尺寸公式**（PyTorch 默认、不带 dilation 时）：

```
H_out = floor((H_in + 2*P - K) / S) + 1
W_out = floor((W_in + 2*P - K) / S) + 1
```

**常用组合速查**：

| 输入 | K | P | S | 输出 | 说明 |
|------|---|---|---|------|------|
| 28×28 | 3 | 1 | 1 | 28×28 | same padding，保持尺寸 |
| 28×28 | 3 | 0 | 1 | 26×26 | valid padding，边缘不补零 |
| 28×28 | 3 | 1 | 2 | 14×14 | 尺寸减半，常用于下采样 |
| 224×224 | 7 | 3 | 2 | 112×112 | AlexNet / ResNet 开头的大卷积 |
| 32×32 | 5 | 2 | 1 | 32×32 | same padding with 5×5 |

**PyTorch 示例**：

```python
import torch
import torch.nn as nn

# 输入: batch=2, 3 通道(RGB), 28×28
x = torch.randn(2, 3, 28, 28)

# 3×3 卷积: 输入通道 3, 输出通道 16, K=3, P=1, S=1
conv = nn.Conv2d(in_channels=3, out_channels=16, kernel_size=3, padding=1, stride=1)
out = conv(x)
print(out.shape)  # torch.Size([2, 16, 28, 28])

# 加上 stride=2 下采样
conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1, stride=2)
out2 = conv2(out)
print(out2.shape)  # torch.Size([2, 32, 14, 14])
```

**卷积层的参数量**：`in_channels × out_channels × K × K + out_channels`（bias）。例如 3×3 卷积把 3 通道变 16 通道：3×16×9 + 16 = **448 个参数**。

### 🔑 池化层：压缩信息，增加感受野

池化把一个小区域（通常 2×2）压缩成一个值，有两种主流形式：

- **Max Pooling**：取区域内最大值。直觉是"保留最显著的特征"。实际效果更好、更常用。
- **Average Pooling**：取区域平均值。更平滑，偶尔用于网络末尾。

搭配 stride=2，2×2 pooling 把特征图尺寸减半：

```python
pool = nn.MaxPool2d(2)          # 默认 stride=kernel_size=2
x = torch.randn(2, 16, 28, 28)
print(pool(x).shape)            # torch.Size([2, 16, 14, 14])
```

**全局平均池化（Global Average Pooling）**：对每个通道整张图取平均值，输出形状 `(B, C, 1, 1)`，展平后直接接 FC。它替代了传统 VGG 末尾那种"把 7×7×512 展平成 25088 → FC(4096)"的做法——参数量大大减少，也缓解了过拟合。现代架构（ResNet、MobileNet、EfficientNet）都用它。

### 🔑 感受野（Receptive Field）

感受野是 CNN 中最重要、也最容易被初学者忽略的概念。它回答一个问题：**输出特征图上的一个像素，实际上"看了"输入图像多大的区域？**

堆叠多个 3×3 卷积（stride=1, padding=1）的感受野增长：

| 第 n 层 | 感受野大小 | 计算 |
|---------|-----------|------|
| 输入 | 1 | - |
| Conv1 (3×3) | 3 | 1 + (3-1)×1 = 3 |
| Conv2 (3×3) | 5 | 3 + (3-1)×1 = 5 |
| Conv3 (3×3) | 7 | 5 + (3-1)×1 = 7 |
| Conv4 (3×3) | 9 | 7 + (3-1)×1 = 9 |

公式：`RF_{i+1} = RF_i + (K_{i+1} - 1) × prod(stride_0..stride_i)`。stride 的乘积是累积的——每次下采样都会让后续层的感受野增长更快。

**为什么这很重要？** 假设你要检测一个占据 40×40 像素的物体，而输出特征图一个像素的感受野只有 20×20——那网络"看不全"这个物体，检测质量会差。你需要要么增加层数要么增加 stride，把感受野做大。

**为什么不用一个大卷积核而用多个小的？** 两个 3×3 堆叠的感受野 = 一个 5×5，但：
- 参数量：2×(9×C_in×C_out) vs 25×C_in×C_out，**参数少 2.7 倍**
- 多了一层 ReLU，**非线性更强**，表达能力更好

这就是 VGG 的核心洞察：统一使用 3×3 小卷积核堆叠。

### 🔑 Batch Normalization（BN）

BN 在每个 mini-batch 上对每个通道做"均值归零、方差归一"，再用两个可学习参数 γ/β 缩放平移。好处：

- **训练更稳**：每层输入分布不乱飘，梯度不会消失或爆炸
- **收敛更快**：可以用更大的学习率，训练步数减少
- **轻微正则**：batch 统计量有噪声，相当于给训练加扰动
- **减轻对初始化的敏感**：即使初始化不完美，BN 也能把分布拉回正常

一个容易踩的坑：**推理模式（model.eval()）下 BN 用训练期间累积的移动平均均值/方差**，不是当前 batch 的。如果忘了切 eval，输出会非常不可靠。

另一个经验：BN 用了之后 batch size 不能太小（建议 ≥ 16），否则 batch 内的统计量噪声太大。若显存不足，可用 LayerNorm 或 GroupNorm 替代。

### 🔑 经典架构串讲

**LeNet-5（1998，Yann LeCun）**
- 输入：28×28 手写数字
- 结构：Conv(5×5, 6) → Pool → Conv(5×5, 16) → Pool → FC(120) → FC(84) → FC(10)
- 历史意义：第一个被大规模使用的 CNN，用来读支票。结构简单，非常适合你手写第一个实现。

**AlexNet（2012，Krizhevsky / Sutskever / Hinton）**
- 输入：224×224×3
- 创新点：ReLU（替代 sigmoid/tanh，缓解梯度消失）、Dropout、数据翻转/裁剪增强、两块 GPU 并行训练、Local Response Normalization（现已被 BN 替代）
- top-5 error：15.3%（第二名 26.2%）
- 历史意义：**引爆了深度学习革命**，让业界真正相信端到端学习。

**VGG-16 / VGG-19（2014，Simonyan & Zisserman）**
- 全网络只用 3×3 卷积、stride=1、padding=1，穿插 2×2 MaxPool
- 结构极简：conv-conv-pool × 若干 → FC → softmax
- 缺点：参数量巨大（FC 层占大部分），推理慢
- 历史贡献：确立了"小卷积核堆叠"的设计哲学，直到今天仍是教学和 baseline 的首选。

**GoogLeNet / Inception-v1（2014，Szegedy et al.）**
- 核心创新：**Inception 模块**——对同一输入并行跑 1×1、3×3、5×5 卷积和 max pooling，再把输出拼起来。让网络"自由选择用哪种尺度的特征"。
- 另一个关键：**1×1 卷积作为"瓶颈"**——在 3×3/5×5 之前先把通道数压下去，大幅减少参数量。
- 参数量只有 AlexNet 的 1/12，精度却更高。
- 历史贡献：确立了 1×1 卷积的价值，以及多分支/多尺度的设计方向。

**→ 到 ResNet（2015）就是 004-resnet.md 讲的了**：残差连接解决深层退化问题，把网络从 22 层推到 152 层，top-5 error 降到 3.57%。

## 完整跑通方案

### 第一步：PyTorch 里的基本元素速览

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

# 卷积
conv = nn.Conv2d(in_channels=1, out_channels=32, kernel_size=3, padding=1)  # 输出同样 28×28
x = torch.randn(8, 1, 28, 28)  # batch=8, 1 通道, 28×28
print(conv(x).shape)           # torch.Size([8, 32, 28, 28])

# BN
bn = nn.BatchNorm2d(32)
print(bn(conv(x)).shape)       # torch.Size([8, 32, 28, 28])

# ReLU
print(F.relu(bn(conv(x))).shape)

# MaxPool
pool = nn.MaxPool2d(2)
print(pool(torch.randn(8, 32, 28, 28)).shape)  # torch.Size([8, 32, 14, 14])

# 验证输出尺寸公式
def out_size(H_in, K, P, S):
    return (H_in + 2*P - K) // S + 1
print(out_size(28, 3, 1, 1))   # 28
print(out_size(28, 3, 0, 2))   # 13
```

### 第二步：手写一个两层 CNN，在 MNIST 上训练到 99%+

完整可运行代码：

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

# -------- 数据 --------
transform = transforms.Compose([
    transforms.ToTensor(),                      # 像素 [0,255] → [0,1]
    transforms.Normalize((0.1307,), (0.3081,)), # MNIST 全局均值和标准差
])

train_ds = datasets.MNIST("./data", train=True,  download=True, transform=transform)
test_ds  = datasets.MNIST("./data", train=False, download=True, transform=transform)

train_loader = DataLoader(train_ds, batch_size=128, shuffle=True,  num_workers=2)
test_loader  = DataLoader(test_ds,  batch_size=256, shuffle=False, num_workers=2)


# -------- 模型 --------
class SimpleCNN(nn.Module):
    """
    结构:
      输入 1×28×28
      → Conv(3×3, 32) → BN → ReLU → MaxPool(2)   → 32×14×14
      → Conv(3×3, 64) → BN → ReLU → MaxPool(2)   → 64×7×7
      → FC(64*7*7 → 256) → ReLU → Dropout
      → FC(256 → 10)
    """
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.bn1   = nn.BatchNorm2d(32)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2   = nn.BatchNorm2d(64)
        self.pool  = nn.MaxPool2d(2)
        self.fc1   = nn.Linear(64 * 7 * 7, 256)
        self.fc2   = nn.Linear(256, 10)
        self.drop  = nn.Dropout(0.25)

    def forward(self, x):
        x = self.pool(F.relu(self.bn1(self.conv1(x))))   # → 32×14×14
        x = self.pool(F.relu(self.bn2(self.conv2(x))))   # → 64×7×7
        x = x.view(x.size(0), -1)                        # 展平
        x = F.relu(self.fc1(x))
        x = self.drop(x)
        return self.fc2(x)


# -------- 训练 --------
device = "cuda" if torch.cuda.is_available() else "cpu"
model = SimpleCNN().to(device)
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
criterion = nn.CrossEntropyLoss()

total_params = sum(p.numel() for p in model.parameters())
print(f"模型参数量: {total_params/1e6:.2f} M")
# 约 0.82M，非常小，CPU 也能在 10 分钟内训练完

for epoch in range(5):
    model.train()
    train_loss, correct, n = 0.0, 0, 0
    for x, y in train_loader:
        x, y = x.to(device), y.to(device)
        optimizer.zero_grad()
        logits = model(x)
        loss = criterion(logits, y)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()

        train_loss += loss.item() * x.size(0)
        correct += (logits.argmax(1) == y).sum().item()
        n += y.size(0)

    # 验证：必须切 eval 模式（BN 行为不同）
    model.eval()
    val_correct, val_n = 0, 0
    with torch.no_grad():
        for x, y in test_loader:
            x, y = x.to(device), y.to(device)
            logits = model(x)
            val_correct += (logits.argmax(1) == y).sum().item()
            val_n += y.size(0)

    print(f"Epoch {epoch}: "
          f"train_loss={train_loss/n:.3f}, "
          f"train_acc={correct/n:.4f}, "
          f"test_acc={val_correct/val_n:.4f}")

# 保存模型权重（用于后续推理）
torch.save(model.state_dict(), "mnist_cnn.pt")
```

**典型训练日志**（在单块 RTX 4090 上约 15 秒/epoch）：

```
模型参数量: 0.82 M
Epoch 0: train_loss=0.152, train_acc=0.9536, test_acc=0.9876
Epoch 1: train_loss=0.054, train_acc=0.9835, test_acc=0.9895
Epoch 2: train_loss=0.037, train_acc=0.9885, test_acc=0.9912
Epoch 3: train_loss=0.029, train_acc=0.9909, test_acc=0.9918
Epoch 4: train_loss=0.024, train_acc=0.9922, test_acc=0.9925
```

**5 个 epoch 后测试准确率约 99.2%~99.3%**。要进一步冲到 99.5%+，可以：
- 加一个额外的卷积层
- 把 dropout 从 0.25 调到 0.3
- 用学习率调度（MultiStepLR / CosineAnnealingLR）
- 训练更多 epoch（10~20）

### 第三步：训练完了看一眼学到的特征

可视化第一层 32 个卷积核（理解"网络学到了什么"）：

```python
import torch
import matplotlib.pyplot as plt

model = SimpleCNN()
model.load_state_dict(torch.load("mnist_cnn.pt"))
model.eval()

weights = model.conv1.weight.data  # shape (32, 1, 3, 3)
plt.figure(figsize=(10, 10))
for i in range(32):
    plt.subplot(6, 6, i + 1)
    plt.imshow(weights[i, 0], cmap="gray")
    plt.axis("off")
plt.suptitle("第 1 层 32 个卷积核学到的边缘/纹理模板", fontsize=12)
plt.tight_layout()
plt.savefig("conv1_kernels.png")
```

正常情况下你会看到类似"朝向不同角度的边缘模板"——网络在第一层已经学会了人工手写 SIFT/HOG 特征的底层等价物。

### 第四步：用训练好的模型做单张推理

```python
import torch
from PIL import Image
from torchvision import transforms

model = SimpleCNN()
model.load_state_dict(torch.load("mnist_cnn.pt"))
model.eval()

# 读一张自定义图（用户手写的 4），灰度化 → resize 28×28
img = Image.open("my_digit_4.png").convert("L").resize((28, 28))

transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.1307,), (0.3081,)),
])
x = transform(img).unsqueeze(0)  # 加 batch 维度: (1, 1, 28, 28)

with torch.no_grad():
    logits = model(x)
    probs = torch.softmax(logits, dim=1)[0]
    pred  = logits.argmax(1).item()

print(f"预测数字: {pred}")
print(f"各类别概率: {[(i, f'{probs[i]:.3f}') for i in range(10)]}")
```

### 第五步：计算感受野

把前面的公式写成一个函数，检查你自己设计的网络每层感受野：

```python
def calc_receptive_field(kernel_sizes, strides, paddings):
    rf = 1
    stride_product = 1
    for k, s, p in zip(kernel_sizes, strides, paddings):
        rf = rf + (k - 1) * stride_product
        stride_product *= s
    return rf

# SimpleCNN 的第一层卷积链（不考虑 pool 时）
# conv1 (3×3, s=1) + conv2 (3×3, s=1)
print("两层 3×3 卷积后的感受野:", calc_receptive_field([3, 3], [1, 1], [1, 1]))
# 输出 5, 即输出每个像素对应输入的 5×5 区域
# 加上两个 2×2 MaxPool 时真实感受野会更大
```

## 常见误区

**误区 1：把图像当一维向量，直接丢给全连接层** → 解释：这是 2012 年之前的做法。`28×28 → 784 → 256 → 10` 的 MLP 在 MNIST 上也能到 97%，但在复杂数据集（ImageNet）上表现极差，因为它**丢掉了空间结构信息**。CNN 必须保留 (B, C, H, W) 四维张量。

**误区 2：卷积核越大越好** → 解释：一个 5×5 卷积核可用两个 3×3 替代，参数更少、非线性更多、表达能力更强。VGG 之后主流架构几乎全部用 3×3，只有极少数早期层用 5×5 或 7×7（ResNet 开头是个例外）。

**误区 3：忘记加 padding 后特征图越卷越小** → 解释：如果用 K=3、P=0、S=1，每次卷积 H/W 各减 2，网络稍微深一点特征图就没了。标准做法是 `padding = K // 2`（K=3 时 P=1，K=5 时 P=2）保持尺寸。

**误区 4：train 模式和 eval 模式分不清** → 解释：BN 和 Dropout 在 train/eval 行为不同。推理时一定要 `model.eval()` 再包 `torch.no_grad()`，否则 BN 会用错误的统计量，准确率会掉得很离谱。

**误区 5：输入没归一化到 [0,1] 或 [-1,1]，直接喂网络** → 解释：原始 [0,255] 像素值会让第一层输出非常大，ReLU 后全激活、梯度很快消失。正确做法：除以 255 或用 transforms.Normalize 做 z-score 归一化到 0 均值、1 标准差。

**误区 6：认为池化是唯一的下采样方式** → 解释：stride=2 的卷积可以同时做特征提取+下采样，现代架构越来越倾向用它替代 MaxPool。另外，stride=2 的 conv 没有信息被粗暴"丢弃"，表达能力更强。
