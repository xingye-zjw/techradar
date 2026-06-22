# ResNet（残差网络）

**ResNet（残差网络）** 是何恺明等人于 2015 年在论文 *Deep Residual Learning for Image Recognition* 中提出的架构。它通过引入**跳跃连接（Skip Connection）**，首次让训练超过 100 层的 CNN 成为可能，并在 ImageNet 分类任务上大幅刷新当时的最佳成绩。

## 背景：深层网络的困境

在 ResNet 之前，直觉上「更深的网络应该表现更好」，但实际实验发现：

- **训练 20 层网络时**：收敛正常，性能良好
- **训练 56 层网络时**：训练误差反而比 20 层更差

这是一个**违反直觉**的现象——如果一个 20 层网络已经表现不错，理论上 56 层网络只要把额外的 36 层学为恒等映射（identity mapping），至少不应该比 20 层更差。但实际上做不到。

**原因**：深层网络的**优化困难**——随着网络加深，梯度在反向传播时越来越小，最终趋近于零（梯度消失），导致参数无法有效更新。

## 核心创新：残差连接

ResNet 的解决方案是让网络学习**残差**（Residual）而非直接学习目标映射。

直觉理解：

> 与其让网络学习 `H(x)`，不如让它学习 `H(x) - x` 的差值，然后再把 x 加回来。

换句话说：

```
output = x + F(x)
```

其中 `F(x)` 是残差块学到的映射。这样做的好处是：

- 如果最优解是恒等映射，网络只需把 `F(x)` 全部学为零即可
- 梯度可以通过跳跃连接「直接跳跃」地传播到浅层
- 从根本上解决了深层网络的梯度消失问题

## 残差块结构

一个标准的残差块：

```
输入
 │
 ├───→ [Conv 3×3] → [BN] → [ReLU]
 │                       ↓
 │                  [Conv 3×3] → [BN]
 │                       ↓
 └───────── 加法 ────────┘
                       ↓
                    [ReLU]
                       ↓
                     输出
```

在代码层面，残差块极为简洁：

```python
import torch
import torch.nn as nn

class ResidualBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(channels)

    def forward(self, x):
        identity = x                # 保存跳跃路径
        out = self.conv1(x)
        out = self.bn1(out)
        out = F.relu(out)
        out = self.conv2(out)
        out = self.bn2(out)
        out = out + identity        # 残差连接
        out = F.relu(out)
        return out
```

## Bottleneck 设计

对于更深的 ResNet（如 ResNet-50/101/152），通常使用瓶颈设计：

- **1×1 卷积**：降维（减少通道数）
- **3×3 卷积**：在低维空间中做卷积（主体）
- **1×1 卷积**：升维（恢复通道数）

这样做的好处是**大幅降低参数和计算量**，让训练超深网络在计算上可行。

## 经典模型规模

| 模型 | 层数 | 参数 | 适用场景 |
|------|------|------|---------|
| ResNet-18 | 18 | ~11M | 轻量任务、迁移学习起点 |
| ResNet-34 | 34 | ~21M | 标准视觉任务 |
| ResNet-50 | 50 | ~25M | **最常用**，ImageNet 基准 |
| ResNet-101 | 101 | ~44M | 高精度任务 |
| ResNet-152 | 152 | ~60M | 最高精度 |

## 为什么 ResNet 如此重要？

### 1. 打开了「更深」的大门
在 ResNet 之前，几十层已是极限；在 ResNet 之后，几百层、甚至上千层的网络都可以稳定训练。

### 2. 影响了整个深度学习领域
跳跃连接（Skip Connection）的思想被广泛借鉴到其他领域：

- **NLP**：Transformer 的每个子层都用了残差连接
- **语音**：WaveNet、Tacotron 大量使用跳跃连接
- **图像生成**：U-Net 的编码器-解码器架构基于跳跃连接
- **扩散模型**：Stable Diffusion 中的 UNet 同样使用跳跃连接

### 3. 至今仍是骨干网络

ResNet 仍然是许多实际应用的默认选择：

- 目标检测的 Backbone（Faster R-CNN、YOLO）
- 分割网络的 Encoder
- 许多新架构的 Baseline 对比对象

## 在实践中使用 ResNet

使用 PyTorch 的 `torchvision` 可以直接加载预训练的 ResNet：

```python
import torch
import torch.nn as nn
from torchvision import models

# 加载预训练的 ResNet-50
resnet = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)

# 替换最后的全连接层用于自定义分类任务
in_features = resnet.fc.in_features
resnet.fc = nn.Linear(in_features, num_classes=10)
```

## ResNet 的后续发展

- **ResNeXt**：引入分组卷积，在不显著增加计算量的前提下提升表达能力
- **SENet**：加入通道注意力，让网络学习通道权重
- **Res2Net**：多尺度残差连接，细粒度特征学习
- **ConvNeXt**：借鉴 Transformer 的设计（LayerNorm、GELU、大卷积核）的现代 CNN

相关术语：[CNN](/glossary/cnn)、[YOLO](/glossary/yolo)、[梯度下降](/glossary/gradient-descent)、[过拟合](/glossary/overfitting)
