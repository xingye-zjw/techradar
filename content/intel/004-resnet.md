---
title: ResNet 残差网络
category: computer-vision
keywords:
  - resnet
  - residual connection
  - skip connection
  - cnn
  - deep network
  - image classification
difficulty: intermediate
duration: 1-2周
summary: 通过 shortcut 让超深网络可训练，把深度从几十层推到上百层，是现代视觉模型的核心构件之一
takeaways:
  - 理解退化问题与残差连接的恒等映射直觉
  - 能手写 ResidualBlock，包括投影 shortcut 的维度匹配
  - 理解 Bottleneck 1×1 → 3×3 → 1×1 的参数量压缩思路
  - 能在 CIFAR-10 上训练一个 ResNet-20，对比有无残差的收敛差异
---

## 为什么你要学它

想象你搭建了一个 20 层的 CNN，在 CIFAR-10 上达到了 90% 准确率。直觉上，把网络加到 50 层应该更好——更深嘛。但实际上你会发现：**50 层的网络训练误差反而比 20 层更高**。这不是过拟合（过拟合会训练误差低、验证误差高），而是**深度网络根本训练不动**。这就是 **退化问题（Degradation Problem）**。

为什么会退化？因为信号在前向传播时逐层被"混合"，梯度在反向传播时被"连乘"，深度越深，信息越难传播到前面的层。

**残差连接（Residual Connection）** 提供了一个极其简洁的解决方案：**每一层不要直接学 H(x)，而学 H(x) - x（残差）**。实现上，就是把输入 x 通过一条 shortcut 直接加到卷积输出上：

```
output = ReLU( Conv(x) + x )
```

如果卷积层什么都不学（权重为 0），output = ReLU(0 + x) = x，网络自动退化为**恒等映射**。这意味着**更深的网络至少不会比浅层网络差**——理论下限被打破了。

ResNet 赢得 2015 年 ImageNet 冠军后，残差连接迅速成为标配。今天你在 ViT、ConvNeXt、Diffusion Model 里看到的跳跃连接，本质都是同一个思想。所以学习 ResNet 不只是"学一个 CNN"，而是掌握**深层网络训练的基本方法论**。

## 一句话概览（快速版）

- **核心思想**：让每层学残差 F(x) = H(x) - x，通过 shortcut 把 x 加到输出上，构造恒等映射通道。
- **两种残差块**：基础块（两层 3×3 卷积，用在 ResNet-18/34）+ Bottleneck 块（1×1 降维 → 3×3 → 1×1 升维，用在 ResNet-50/101/152）。
- **维度不匹配时**：用 1×1 卷积做 projection shortcut，让 F(x) 和 x 的形状一致才能相加。
- **完整跑通路径**：torchvision 预训练 ResNet-50 做迁移学习 → 自己手写残差块 → 在 CIFAR-10 上训练 ResNet-20 并画曲线。

## 核心拆解

### 🔑 残差连接的数学直觉

普通残差块的前向传播：

```
y = F(x, {W_i}) + x
```

其中 `F` 通常是 `Conv → BN → ReLU → Conv → BN`。反向传播时，假设 loss 对 y 的梯度为 `∂L/∂y`，那么对 x 的梯度：

```
∂L/∂x = ∂L/∂y · (∂F/∂x + 1) = ∂L/∂y · ∂F/∂x + ∂L/∂y
```

注意右边的 `+ ∂L/∂y`：**梯度可以"无损耗"地从深层传到浅层**。即使 `∂F/∂x` 很小（梯度消失），`∂L/∂y` 那项也能保证信息流通。

这就是为什么残差网络容易训练：它给梯度开辟了一条**高速公路**。

### 🔑 两种残差块：Basic vs Bottleneck

**BasicBlock（ResNet-18/34）**：

```
x → Conv(3×3, out_ch) → BN → ReLU
  → Conv(3×3, out_ch) → BN
  → (+ x 或 projection) → ReLU
```

每块两层 3×3 卷积，参数较少，适合相对浅的网络。

**BottleneckBlock（ResNet-50/101/152）**：

```
x → Conv(1×1, reduced_ch) → BN → ReLU        # 降维
  → Conv(3×3, reduced_ch) → BN → ReLU         # 在低维上做空间卷积
  → Conv(1×1, out_ch) → BN                    # 升维回去
  → (+ x 或 projection) → ReLU
```

为什么这样设计？做一个**参数量对比**。假设输入通道=256，输出通道=256，空间尺寸不变：

| 方案 | 结构 | 参数量 |
|------|------|--------|
| 直接两层 3×3 | Conv(3×3,256→256)×2 | 2 × 3×3×256×256 ≈ **1.18M** |
| Bottleneck | 1×1→64, 3×3→64, 1×1→256 | 256×64 + 3×3×64×64 + 64×256 ≈ **70K** |

**参数减少约 17 倍**。1×1 卷积的核心作用就是"在通道维度做特征混合 + 控制维度"，先用它把通道数压下去，再让 3×3 在低维空间上滑动，最后再升回去。参数量大减意味着可以堆更深的层而不怕 OOM。

### 🔑 Projection Shortcut：维度不匹配怎么办

`F(x) + x` 要求两者形状完全一致。当：
1. **通道数变化**（例如从 64 通道升到 128）
2. **空间尺寸减半**（stride=2，例如从 32×32 变 16×16）

就必须用 projection shortcut 把 x 也变换到对应形状：

```
shortcut = Conv2d(in_ch, out_ch, kernel_size=1, stride=stride, bias=False)
         + BatchNorm2d(out_ch)
```

注意 1×1 卷积配合 stride，可以同时完成通道变换和空间下采样。

**设计原则**：ResNet 原文建议尽量用恒等 shortcut（无参数），只在维度不匹配时才用 projection。这样做的目的是让 shortcut 通道保持"无损耗"，同时控制总参数量。

### 🔑 ResNet-50 架构全景

开头：
- 7×7 Conv, stride=2, 64 channel → 把 224×224 图像压到 112×112
- 3×3 MaxPool, stride=2 → 进一步压到 56×56

中间 4 个 stage（每个 stage 由多个 Bottleneck 堆叠）：

| Stage | 输出空间 | 通道 | Block 数 | 第一个 block stride |
|-------|---------|------|----------|-------------------|
| 1 | 56×56 | 256 | 3 | 1 |
| 2 | 28×28 | 512 | 4 | 2 |
| 3 | 14×14 | 1024 | 6 | 2 |
| 4 | 7×7 | 2048 | 3 | 2 |

每个 stage 内，第一个 block 用 stride=2（在 stage 2/3/4）完成空间下采样和通道翻倍，后续 block 保持形状。

末尾：
- Global Average Pool（把 7×7 平均成 1×1）
- FC（2048 → num_classes）
- Softmax

总层数 = 7×7 卷积（1）+ (3+4+6+3)×3（每个 Bottleneck 三层）+ FC（1）= **50**。

### 🔑 BN 的位置与训练/推理模式

ResNet 中 BN 放在每个卷积之后、ReLU 之前。一个容易踩的坑：BN 在训练模式下用当前 batch 的均值/方差归一化，同时维护**移动平均**统计量；在推理模式下用移动平均统计量。

如果你**忘了调用 `model.eval()`**，BN 会继续用单张推理图的均值/方差（噪声极大），结果会完全不对。另一个常见错误是**batch_size 太小（如 1~2）**，BN 统计量抖动严重，模型学不好。

### 🔑 为什么 ResNet 之后还有其他模型

ResNet 解决了"深度网络可以训练"的问题，但它不是终点：

- **ResNeXt**：引入分组卷积，在 Bottleneck 内让不同组学不同特征
- **SEResNet**：在通道维度加 Squeeze-Excitation，让模型"关注哪些通道重要"
- **ConvNeXt**：吸收 Transformer 的设计（LayerNorm、大卷积核），把 CNN 现代化
- **ViT / Swin Transformer**：直接用 Attention 替代大部分卷积

但所有这些模型里，**跳跃连接/残差都是标配**。它的通用性超越了具体结构。

## 完整跑通方案

### 第一步：用 torchvision 预训练 ResNet-50 做迁移学习

```python
import torch
import torch.nn as nn
from torchvision import models, datasets, transforms
from torch.utils.data import DataLoader

# 加载预训练模型（在 ImageNet 上训练过的权重）
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

# 冻结除最后一层以外的所有权重
for param in model.parameters():
    param.requires_grad = False

# 替换 FC 层，输出为你的类别数（例如 10 类）
num_classes = 10
model.fc = nn.Linear(model.fc.in_features, num_classes)  # in_features=2048

# 数据预处理：要与预训练一致
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

# 用 CIFAR-10 做演示
train_ds = datasets.CIFAR10("./data", train=True, download=True, transform=transform)
val_ds   = datasets.CIFAR10("./data", train=False, transform=transform)
train_loader = DataLoader(train_ds, batch_size=64, shuffle=True, num_workers=2)
val_loader   = DataLoader(val_ds, batch_size=128, num_workers=2)

# 只训练 FC 层
optimizer = torch.optim.AdamW(model.fc.parameters(), lr=1e-3, weight_decay=1e-4)
criterion = nn.CrossEntropyLoss()

device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)

# 简单训练 3 个 epoch
for epoch in range(3):
    model.train()
    train_loss, correct, total = 0.0, 0, 0
    for x, y in train_loader:
        x, y = x.to(device), y.to(device)
        optimizer.zero_grad()
        out = model(x)
        loss = criterion(out, y)
        loss.backward()
        optimizer.step()
        train_loss += loss.item() * x.size(0)
        correct += (out.argmax(1) == y).sum().item()
        total += y.size(0)
    print(f"Epoch {epoch}: train_loss={train_loss/total:.3f}, train_acc={correct/total:.3f}")

    # 验证：一定要切 eval 模式！
    model.eval()
    correct, total = 0, 0
    with torch.no_grad():
        for x, y in val_loader:
            x, y = x.to(device), y.to(device)
            out = model(x)
            correct += (out.argmax(1) == y).sum().item()
            total += y.size(0)
    print(f"  val_acc={correct/total:.3f}")
```

3 个 epoch 后准确率通常能到 **93%~95%**（因为预训练骨干已经很强）。

### 第二步：手写 ResidualBlock，在 CIFAR-10 上从零训练

这一步是真正检验你是否理解了残差连接。目标：搭建一个小的 ResNet-20（按 He et al. 的 CIFAR-10 版本），从零训练到 >92%。

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class BasicBlock(nn.Module):
    """CIFAR-10 版本的基础残差块：两层 3×3 卷积 + shortcut"""
    expansion = 1  # Bottleneck 用 expansion=4，基础块 expansion=1

    def __init__(self, in_ch, out_ch, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_ch, out_ch, kernel_size=3,
                               stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_ch)
        self.conv2 = nn.Conv2d(out_ch, out_ch, kernel_size=3,
                               stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_ch)

        # shortcut：维度匹配时直接恒等，否则用 1×1 卷积投影
        self.shortcut = nn.Sequential()
        if stride != 1 or in_ch != out_ch:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_ch, out_ch, kernel_size=1,
                          stride=stride, bias=False),
                nn.BatchNorm2d(out_ch),
            )

    def forward(self, x):
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += self.shortcut(x)   # ← 这就是残差连接
        return F.relu(out)


class ResNet_CIFAR(nn.Module):
    """
    CIFAR-10 专用的小 ResNet：
      输入 3×32×32 → conv(3×3,16)
      → stage1: 3× BasicBlock, 16×32×32
      → stage2: 3× BasicBlock, 32×16×16 (第一个 block stride=2)
      → stage3: 3× BasicBlock, 64×8×8
      → AvgPool → FC(64→10)
    总层数 = 1 + 3×2×3 + 1 = 20
    """
    def __init__(self, block, num_blocks, num_classes=10):
        super().__init__()
        self.in_ch = 16

        self.conv1 = nn.Conv2d(3, 16, kernel_size=3, stride=1,
                               padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(16)

        self.stage1 = self._make_stage(block, 16, num_blocks[0], stride=1)
        self.stage2 = self._make_stage(block, 32, num_blocks[1], stride=2)
        self.stage3 = self._make_stage(block, 64, num_blocks[2], stride=2)

        self.linear = nn.Linear(64, num_classes)

    def _make_stage(self, block, out_ch, num_blocks, stride):
        # 第一个 block 可能 stride=2（下采样），其余 stride=1
        strides = [stride] + [1] * (num_blocks - 1)
        layers = []
        for s in strides:
            layers.append(block(self.in_ch, out_ch, s))
            self.in_ch = out_ch * block.expansion
        return nn.Sequential(*layers)

    def forward(self, x):
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.stage1(out)
        out = self.stage2(out)
        out = self.stage3(out)
        # 全局平均池化：把 64×8×8 变成 64
        out = F.avg_pool2d(out, out.size(2))
        out = out.view(out.size(0), -1)
        return self.linear(out)


def ResNet20():
    return ResNet_CIFAR(BasicBlock, [3, 3, 3])


# 打印一下结构和参数量
model = ResNet20()
total_params = sum(p.numel() for p in model.parameters())
print(f"ResNet-20 参数量：{total_params/1e6:.2f} M")   # ≈ 0.27M

# 快速跑一次前向传播验证形状
dummy = torch.randn(2, 3, 32, 32)
print("输出 shape:", model(dummy).shape)  # (2, 10)
```

### 第三步：训练循环 + 对比实验

```python
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

transform_train = transforms.Compose([
    transforms.RandomCrop(32, padding=4),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465),
                         (0.2023, 0.1994, 0.2010)),
])
transform_test = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465),
                         (0.2023, 0.1994, 0.2010)),
])

train_ds = datasets.CIFAR10("./data", train=True, download=True, transform=transform_train)
test_ds  = datasets.CIFAR10("./data", train=False, transform=transform_test)
train_loader = DataLoader(train_ds, batch_size=128, shuffle=True, num_workers=2)
test_loader  = DataLoader(test_ds, batch_size=256, num_workers=2)

device = "cuda" if torch.cuda.is_available() else "cpu"
model = ResNet20().to(device)
optimizer = optim.SGD(model.parameters(), lr=0.1, momentum=0.9, weight_decay=1e-4)
scheduler = optim.lr_scheduler.MultiStepLR(optimizer, milestones=[80, 120], gamma=0.1)
criterion = nn.CrossEntropyLoss()

train_losses, test_accs = [], []
for epoch in range(160):
    model.train()
    train_loss = 0.0
    for x, y in train_loader:
        x, y = x.to(device), y.to(device)
        optimizer.zero_grad()
        out = model(x)
        loss = criterion(out, y)
        loss.backward()
        optimizer.step()
        train_loss += loss.item() * x.size(0)

    scheduler.step()

    # 验证
    model.eval()
    correct, total = 0, 0
    with torch.no_grad():
        for x, y in test_loader:
            x, y = x.to(device), y.to(device)
            out = model(x)
            correct += (out.argmax(1) == y).sum().item()
            total += y.size(0)

    train_loss /= len(train_ds)
    test_acc = correct / total
    train_losses.append(train_loss)
    test_accs.append(test_acc)

    if epoch % 10 == 0 or epoch == 159:
        print(f"Epoch {epoch:3d}: loss={train_loss:.3f}, test_acc={test_acc:.4f}")

print(f"\n最终测试准确率: {max(test_accs):.4f}")
```

**预期结果**：大约在 epoch 100 左右达到 **92%+**，训练曲线平滑下降。

**建议做的对比实验**：把 `BasicBlock.forward` 中的 `out += self.shortcut(x)` 去掉（即变成普通前馈网络），其他配置不变。你会观察到：普通版本训练误差在更深时反而上升——这就是退化问题的直观证据。

### 第四步：查看预训练 ResNet-50 的层结构

```python
from torchvision import models

resnet50 = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

# 打印模型结构的关键部分
print("=== ResNet-50 开头 ===")
print(resnet50.conv1)        # 7×7, stride=2
print(resnet50.bn1)
print(resnet50.maxpool)

print("\n=== ResNet-50 layer1（stage1，通道 256） ===")
print(resnet50.layer1)       # 3 个 Bottleneck

print("\n=== ResNet-50 layer2（stage2，通道 512，空间下采样 2×） ===")
print(resnet50.layer2)       # 4 个 Bottleneck

print("\n=== ResNet-50 layer3（stage3，通道 1024） ===")
print(resnet50.layer3)       # 6 个 Bottleneck

print("\n=== ResNet-50 layer4 + FC ===")
print(resnet50.layer4)       # 3 个 Bottleneck
print(resnet50.fc)
```

运行后你会清楚看到每个 Bottleneck 的三层卷积 + shortcut 结构，以及 stage 切换时第一个 block 的 stride=2 是如何实现下采样的。

## 常见误区

**误区 1：shortcut 可以随便加，不用考虑维度** → 解释：`F(x) + x` 要求两者形状完全一致（空间大小和通道数）。当 stride≠1 或通道数变化时，必须用 1×1 卷积投影。忘记这一步模型会直接报错，且错误信息通常是 "size mismatch at element-wise add"。

**误区 2：越深越好，盲目堆到 1000 层** → 解释：ResNet 解决了可训练性，但不保证越深精度越高。超深网络（>200 层）在实际数据上可能精度饱和甚至下降，且推理很慢。当前工程上用得最多的是 ResNet-50 / ResNet-101。

**误区 3：推理时忘了调用 model.eval()** → 解释：BN 在 train/eval 模式下行为不同。eval 模式下用训练时累积的移动平均统计量，是确定值。不切换会导致每次推理结果不稳定，准确率严重下降。

**误区 4：把 ReLU 放在 shortcut 相加之前** → 解释：标准做法是 `output = ReLU(F(x) + x)`，即先相加再过 ReLU。把 ReLU 放在相加之前会导致 shortcut 信号被截断（负值都变零），破坏恒等映射通道。

**误区 5：迁移学习时忘记冻结预训练权重** → 解释：如果你的数据集只有几千张图，不冻结权重会破坏预训练学到的通用特征，容易过拟合。正确做法是：先只训练 FC 层，稳定后再解冻 stage3/stage4 做微调。

**误区 6：在小输入图像上用 7×7 大卷积开头** → 解释：ResNet-50 原始结构以 224×224 为输入，第一个 7×7 stride=2 卷积把它压到 112×112。如果直接把它套在 32×32 的 CIFAR-10 上，会把图像压缩过度。标准做法（如 He et al.）是改用 3×3 stride=1 的小卷积开头，且去掉 MaxPool。
