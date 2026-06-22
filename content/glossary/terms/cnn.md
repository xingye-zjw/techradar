# CNN（卷积神经网络）

**CNN（卷积神经网络）** 是一类专门用于处理**网格状数据**（如图像、频谱图、视频）的深度学习架构。它通过卷积层自动学习空间层次特征，从边缘、纹理等低级特征逐步过渡到物体、场景等高级特征。

## 为什么不用全连接？

对于一张 224×224 的 RGB 图片，输入维度是 `224 × 224 × 3 = 150528`。如果使用全连接网络：

- 第一层的权重矩阵是 `150528 × hidden_size`，参数数量极其庞大
- 全连接忽略了空间结构信息，把每个像素同等对待
- 同一图案出现在不同位置时，全连接网络需要为每个位置重新学习

CNN 通过两个关键思想解决了这些问题：

1. **局部感受野 (Local Receptive Field)**：每个神经元只关注输入的一个小区域
2. **权值共享 (Weight Sharing)**：同一组卷积核在整张图片上滑动使用

## 核心组件

### 1. 卷积层 (Convolutional Layer)

卷积层使用一组可学习的**卷积核（滤波器）**在输入上滑动，每次滑动时执行「点乘 + 求和 + 加偏置」的操作。

以 3×3 卷积核为例：

```
输入特征图           卷积核
[ 1  2  3  4 ]      [ 1  0 -1 ]
[ 5  6  7  8 ]  ×   [ 1  0 -1 ]
[ 9 10 11 12 ]      [ 1  0 -1 ]
```

这个卷积核实际上在计算「相邻列的差值」，从而检测垂直边缘。不同的卷积核会学习到不同类型的特征：

- 边缘检测
- 颜色通道变换
- 纹理提取
- 特定形状识别

### 2. 池化层 (Pooling Layer)

池化层用于降低特征图的空间维度，主要作用：

- 增加后续层的感受野
- 引入一定的平移不变性
- 降低计算量和参数数量

常见形式：

- **Max Pooling**：取池化窗口中的最大值（最常用）
- **Average Pooling**：取池化窗口的平均值
- **Adaptive Pooling**：自适应到指定输出大小

### 3. 非线性激活

卷积和池化都是线性运算，需要引入非线性才能学习复杂的函数关系。常用：

- **ReLU**：`max(0, x)` —— 最常用，收敛快
- **GELU**：高斯误差线性单元 —— 用于 Transformer
- **Leaky ReLU**：`max(αx, x)` —— 避免神经元「死亡」

### 4. 全连接层 (Fully Connected Layer)

通常位于网络末端，负责将学到的特征映射到最终输出（如分类概率）。

## 经典架构

| 架构 | 年份 | 关键创新 |
|------|------|---------|
| LeNet-5 | 1998 | 首个实用 CNN，数字识别 |
| AlexNet | 2012 | 深度学习里程碑，ReLU + GPU |
| VGG | 2014 | 证明「小卷积核 + 深层」有效 |
| GoogLeNet (Inception) | 2014 | 多尺度卷积 + 1×1 卷积 |
| **ResNet** | 2015 | 跳跃连接，152 层可行 |
| DenseNet | 2017 | 密集连接，特征复用 |
| EfficientNet | 2019 | 复合缩放（深度/宽度/分辨率） |
| ConvNeXt | 2022 | 借鉴 Transformer 设计的现代 CNN |

## 输出尺寸的计算

卷积层输出尺寸：

```
out_size = (in_size - kernel_size + 2 × padding) / stride + 1
```

池化层输出尺寸：

```
out_size = (in_size - pool_size + 2 × padding) / stride + 1
```

**记忆口诀**：卷积核越大、步长越大 → 输出越小；填充越大 → 输出越大。

## 在 PyTorch 中的使用

```python
import torch
import torch.nn as nn

# 定义一个简单的 CNN
class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        # 输入: 3 通道 (RGB), 输出: 16 通道, 卷积核 3×3
        self.conv1 = nn.Conv2d(3, 16, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2)
        self.relu = nn.ReLU()
        self.fc = nn.Linear(32 * 56 * 56, num_classes)

    def forward(self, x):
        x = self.pool(self.relu(self.conv1(x)))  # 224→112
        x = self.pool(self.relu(self.conv2(x)))  # 112→56
        x = x.flatten(1)
        x = self.fc(x)
        return x
```

## CNN 与 Transformer 的关系

近年来，视觉 Transformer (ViT) 在许多任务上超越了 CNN，但两者各有优势：

| 维度 | CNN | Transformer |
|------|-----|------------|
| 归纳偏置 | 强（局部性、平移不变性） | 弱（需要大量数据学习） |
| 小样本表现 | 好 | 较差 |
| 长距离依赖 | 需要多层堆叠 | 直接建立 |
| 计算复杂度 | O(n) | O(n²) |
| 部署 | 成熟 | 需要更多优化 |

实际生产中，CNN 仍然在资源受限场景（移动端、嵌入式）和需要强归纳偏置的任务中广泛使用。

相关术语：[ResNet](/glossary/resnet)、[YOLO](/glossary/yolo)、[过拟合](/glossary/overfitting)、[PyTorch](/glossary/pytorch)
