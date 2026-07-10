---
title: CV OCR（光学字符识别）
category: computer-vision
difficulty: intermediate
duration: 1-2周
summary: OCR 让计算机能\"读懂\"图像中的文字，是文档数字化、车牌识别、身份证识别的核心技术。
takeaways: "- 理解文本检测 + 文本识别两阶段 pipeline，能说清楚每阶段的输入输出
  - 搞懂 CRNN + CTC 的原理，为什么适合变长序列识别
  - 能用 EasyOCR 或 PaddleOCR 在真实图片上跑出一个完整 OCR pipeline
  - 明白 Transformer OCR（如 TR、PARSeq）的核心改进点"
relatedTerms: ["cnn", "yolo", "ocr", "resnet"]
relatedIntel: "- 002-yolo
  - 004-resnet
  - 006-cnn-basics"
tags: "- ocr
  - text-recognition
  - text-detection
  - crnn
  - tr
  - easyocr
  - paddleocr
  - 文本检测
  - 文本识别
  - ctpn
  - dbnet
  - rosetta
  - tr大眼睛"
relatedTools: ["ultralytics-yolo", "numpy", "matplotlib"]
relatedNodes: ["cv-detection", "cv-segmentation"]
---

## 为什么你要学它

先讲结论：**OCR = 让计算机从图像中提取文字信息，是物理世界数字化的入口。**

它解决的场景非常实际：

- **文档数字化**：扫描纸质合同、发票、名片，转换成可搜索的文本
- **车牌识别**：停车场、高速公路卡口，自动识别车牌号
- **身份证/银行卡识别**：金融开户、KYC 认证，自动录入证件信息
- **古籍修复**：历史文献的自动识别与数字化
- **工业扫码**：生产线上的一维码/二维码识别

没有 OCR，所有图片中的文字对计算机来说都是"噪音"。它是 CV 落地最广泛的技术之一。

## 一句话概览（快速版）

你只要记住三句话：

1. **OCR 分为两阶段：文本检测（找到文字在哪）+ 文本识别（认出文字是什么）**
2. **文本识别主流方案是 CRNN + CTC，适合变长序列且不需要字符级标注**
3. **Transformer OCR（如 TR、PARSeq）用注意力机制进一步提升了识别精度**

## 核心拆解

### 🔑 两阶段 Pipeline

OCR 通常分为两个独立阶段：

```
图像 → 文本检测 → 文本识别 → 文本结果
              ↓
         检测框坐标
```

- **文本检测**：输出文字区域的外接多边形/矩形框（坐标）
- **文本识别**：裁剪检测框中的文字区域，输入识别模型，输出文字序列

两阶段解耦的好处：检测和识别可以独立训练、独立优化、独立替换。

### 🔑 文本检测（Text Detection）

代表方法：

| 方法        | 论文 | 特点                                 |
| ----------- | ---- | ------------------------------------ |
| CTPN        | 2016 | 预测文本小框，再连成行，适合水平文字 |
| EAST        | 2017 | 全卷积网络，直接预测多边形，支持旋转 |
| DBNet       | 2019 | 可微二值化，精度高，部署友好         |
| TextFuseNet | 2020 | 引入语义分割，多语言支持好           |

核心思路：把文字检测当成目标检测或分割任务，只是检测目标是"文字区域"。

### 🔑 文本识别（Text Recognition）

代表方法：

| 方法             | 论文 | 特点                                     |
| ---------------- | ---- | ---------------------------------------- |
| CRNN + CTC       | 2015 | CNN + RNN + CTC，经典baseline            |
| Rosetta          | 2019 | Facebook出品，CNN + Attention            |
| TR (TransformeR) | 2020 | 用 Transformer 替代 RNN                  |
| PARSeq           | 2022 | 并行 Transformer，Scene Text Recognition |

### 🔑 CRNN + CTC 详解

**CRNN（Convolutional Recurrent Neural Network）**：

- CNN 提取图像特征
- RNN（双向 LSTM）对序列建模，捕捉上下文
- 输入图像是宽度 W×高度 H，输出是 T 个时间步的特征（T 与 W 成比例）

**CTC（Connectionist Temporal Classification）**：

- 解决"输入和输出长度不一致"的问题
- 引入 blank（空白符）机制，允许重复和跳跃
- 损失函数：输入序列到输出序列的所有对齐路径之和

```
输入图像宽度 100 → 输出 T=25 个时间步
输出文字 "hello"（长度 5）
CTC 允许：h-e-l-l-o 或 h--el-l-o 或各种对齐方式
最终通过解码取概率最大的输出
```

**CTC 解码方式**：

- **贪心解码**：每个时间步取最大概率，合并重复字符，去掉 blank
- **束搜索解码**：保留多条候选路径，精度更高但更慢

### 🔑 Transformer OCR

CRNN 的局限：RNN 难以并行，训练慢；单向上下文可能遗漏信息。

**TR（Transformer's Role）**：

- 用 Transformer Encoder 替代 LSTM，捕获全局依赖
- Self-Attention 让每个位置都能看到所有位置
- 并行训练，速度更快

**PARSeq**：

- 并行 Transformer，解码时使用 Permutation Language Modeling
- 既能并行训练，又能自回归解码
- 在 Scene Text Recognition 上刷新 SOTA

## 完整跑通方案

**第一步：安装依赖**

```bash
pip install easyocr          # 最简单的方案，懒人首选
# 或者
pip install paddlepaddle paddleocr  # PaddleOCR，功能更强大
```

**第二步：EasyOCR 快速跑通**

```python
import easyocr

# 初始化多语言识别（首次运行会下载模型）
reader = easyocr.Reader(['ch_sim', 'en'], gpu=True)

# 读取图片，识别文字
results = reader.readtext('path/to/image.jpg')

# 遍历结果
for (bbox, text, confidence) in results:
    print(f"文字: {text}, 置信度: {confidence:.2f}")
    # bbox 是四个角点坐标，如 [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
```

**第三步：PaddleOCR 完整 pipeline**

```python
from paddleocr import PaddleOCR

# 初始化（检测+识别一体化）
ocr = PaddleOCR(use_angle_cls=True, lang='ch', use_gpu=True)

# 读取图片，返回结果
img_path = 'path/to/image.jpg'
result = ocr.ocr(img_path, cls=True)

# result[0] 是每行文字的检测+识别结果
for line in result[0]:
    print(f"坐标: {line[0]}, 文字: {line[1][0]}, 置信度: {line[1][1]:.2f}")
```

**第四步：CRNN + CTC 手动实现（理解原理）**

```python
import torch
import torch.nn as nn

class CRNN(nn.Module):
    def __init__(self, img_height, num_classes):
        super().__init__()
        self.img_height = img_height

        # CNN backbone（VGG风格，高度压缩到 1）
        self.cnn = nn.Sequential(
            nn.Conv2d(1, 64, 3, 1, 1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.MaxPool2d(2, 2),               # H: 32 -> 16
            nn.Conv2d(64, 128, 3, 1, 1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.MaxPool2d(2, 2),               # H: 16 -> 8
            nn.Conv2d(128, 256, 3, 1, 1), nn.BatchNorm2d(256), nn.ReLU(),
            nn.Conv2d(256, 256, 3, 1, 1), nn.BatchNorm2d(256), nn.ReLU(),
            nn.MaxPool2d((2, 1)),             # H: 8 -> 4
            nn.Conv2d(256, 512, 3, 1, 1), nn.BatchNorm2d(512), nn.ReLU(),
            nn.Conv2d(512, 512, 3, 1, 1), nn.BatchNorm2d(512), nn.ReLU(),
            nn.MaxPool2d((2, 1)),             # H: 4 -> 2
            nn.Conv2d(512, 512, 2, 1, 0),     # H: 2 -> 1
        )

        # RNN
        self.rnn = nn.LSTM(512, 256, bidirectional=True, batch_first=True)
        self.fc = nn.Linear(512, num_classes)  # num_classes 包含 blank

    def forward(self, x):
        # x: (B, C, H, W) -> CNN -> (B, 512, 1, W')
        x = self.cnn(x)
        b, c, h, w = x.size()
        assert h == 1, "CNN output height should be 1"

        # 转为序列: (B, W', 512)
        x = x.squeeze(2).permute(0, 2, 1)

        # RNN: (B, W', 512)
        x, _ = self.rnn(x)

        # 分类: (B, W', num_classes)
        x = self.fc(x)
        return x  # 训练时返回 log_softmax，推理时返回预测


# CTC Loss
criterion = torch.nn.CTCLoss(blank=0, zero_infinity=True)

# 前向
logits = model(images)  # (B, T, num_classes)
log_probs = torch.log_softmax(logits, dim=-1)

# CTC 需要 (T, B, C) 格式
log_probs = log_probs.permute(1, 0, 2)

input_lengths = torch.full((batch_size,), logits.size(1), dtype=torch.long)
target_lengths = torch.full((batch_size,), target.size(1), dtype=torch.long)

loss = criterion(log_probs, targets, input_lengths, target_lengths)
```

## 常见误区

**"OCR 就是直接识别文字，不需要文本检测" → 错**。对于自然场景图片（拍照、扫描），文字位置不固定，必须先检测再识别。两阶段是主流方案。

**"CRNN 的 RNN 换成 Transformer 就一定更好" → 不完全是**。Transformer 需要更多数据、更大模型才能发挥优势。在数据量小、场景简单时，CRNN 可能更快更稳。

**"EasyOCR 精度不如 PaddleOCR" → 不准确**。两者模型规模不同，EasyOCR 默认模型较小，PaddleOCR 的 PP-OCR 系列经过大量数据训练。实际精度取决于你的场景（文档、街景、商品包装等）。

**"CTC 解码直接取 argmax 就行" → 贪心解码可以，但束搜索通常能提升精度**。尤其是当图像模糊或文字有干扰时，束搜索能保留更多候选。

**"文字识别只要分类对就行" → 不对**。文字有上下文，单独的字符识别可能合法但语义不通。后期的语言模型（如 CRNN+LM）能进一步提升准确率。

## 推荐学习顺序

1. 先用 EasyOCR 在自己场景的图片上跑通，感受整个 pipeline
2. 读 CRNN 论文《An End-to-End Trainable Neural Network for Image-based Sequence Recognition》
3. 用上面的代码手写一个 CRNN，在简单数据集（如 IIIT5K 或 Synth90k 子集）上验证
4. 了解 DBNet 文本检测原理，理解如何检测任意形状的文字
5. 看 PaddleOCR 源码，理解 PP-OCR 系列如何工程化落地
