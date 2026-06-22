# 光学字符识别（OCR）

**OCR（Optical Character Recognition）** 从图像中提取文字信息，包含文本检测和文本识别两个核心子任务。

## 核心流程

```
输入图像
    ↓
文本检测（Text Detection）
    → 定位文字区域（边界框）
    ↓
文本识别（Text Recognition）
    → 将图像转录为字符序列
    ↓
输出文本
```

## 主流技术方案

### 1. DBNet（文本检测）

```
图像输入 → ResNet 特征提取 → 特征融合 → 概率图 + 阈值图 → 文本区域
```

```python
# PaddleOCR 文本检测
from paddleocr import PaddleOCR

ocr = PaddleOCR(use_angle_cls=True, lang='ch')
result = ocr.ocr('image.jpg', cls=True)

for line in result[0]:
    bbox = line[0]  # 四个顶点坐标
    text = line[1][0]  # 识别文本
    confidence = line[1][1]  # 置信度
    print(f"文本: {text}, 置信度: {confidence:.2f}")
```

### 2. CRNN（文本识别）

```
检测到的文本图像 → CNN特征 → BiLSTM序列建模 → CTC解码 → 文字输出
```

```python
import torch
import torch.nn as nn

class CRNN(nn.Module):
    def __init__(self, num_classes):
        super().__init__()
        # CNN 特征提取
        self.cnn = nn.Sequential(
            nn.Conv2d(1, 64, 3, 1, 1), nn.ReLU(), nn.MaxPool2d(2, 2),
            nn.Conv2d(64, 128, 3, 1, 1), nn.ReLU(), nn.MaxPool2d(2, 2),
        )
        # BiLSTM 序列建模
        self.rnn = nn.LSTM(128, 256, bidirectional=True)
        # 全连接输出
        self.fc = nn.Linear(512, num_classes)
    
    def forward(self, x):
        # CNN
        conv = self.cnn(x)
        b, c, h, w = conv.size()
        conv = conv.squeeze(2).permute(2, 0, 1)  # (w, b, c)
        
        # RNN
        rnn_out, _ = self.rnn(conv)
        
        # 输出
        output = self.fc(rnn_out)
        return output
```

### 3. Attention-based 识别

```python
class AttentionDecoder(nn.Module):
    def __init__(self, hidden_size, num_classes):
        super().__init__()
        self.attention = nn.Linear(hidden_size, 1)
        self.rnn = nn.GRU(hidden_size + num_classes, hidden_size)
        self.classifier = nn.Linear(hidden_size, num_classes)
    
    def forward(self, features, max_len=25):
        batch_size = features.size(0)
        hidden = torch.zeros(1, batch_size, 256)
        input_char = torch.zeros(batch_size, num_classes)
        
        outputs = []
        for _ in range(max_len):
            # 注意力权重
            attn_weights = torch.softmax(self.attention(features), dim=1)
            context = (attn_weights * features).sum(dim=1)
            
            # RNN 步
            rnn_input = torch.cat([context, input_char], dim=1)
            hidden, _ = self.rnn(rnn_input.unsqueeze(0), hidden)
            
            # 预测下一个字符
            output = self.classifier(hidden.squeeze(0))
            outputs.append(output)
            input_char = F.one_hot(output.argmax(1), num_classes).float()
        
        return torch.stack(outputs, dim=1)
```

## 应用场景

- **文档数字化**：扫描文档转可编辑文本
- **车牌识别**：停车场、高速公路收费系统
- **身份证/名片识别**：证件信息自动提取
- **票据识别**：发票、收据自动录入
- **翻译应用**：拍照翻译、实时取词翻译
- **历史文献**：古籍数字化、手写体识别

## PaddleOCR 实战示例

```python
from paddleocr import PaddleOCR
import cv2

# 初始化 OCR 引擎
ocr = PaddleOCR(
    use_angle_cls=True,  # 文字方向检测
    lang='ch',           # 中文模型
    use_gpu=True         # GPU 加速
)

# 识别图片中的文字
result = ocr.ocr('document.jpg', cls=True)

# 解析结果
for line in result[0]:
    bbox = line[0]
    text = line[1][0]
    score = line[1][1]
    
    # 绘制结果
    pts = np.array(bbox, dtype=np.int32)
    cv2.polylines(img, [pts], True, (0, 255, 0), 2)
    cv2.putText(img, text, (int(bbox[0][0]), int(bbox[0][1]-10)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
```

## 主流 OCR 框架对比

| 框架 | 优点 | 适用场景 |
|------|------|---------|
| **PaddleOCR** | 中文支持好，开源免费 | 中文文档、通用场景 |
| **Tesseract** | 开源经典 | 英文文档、嵌入式 |
| **EasyOCR** | 简单易用 | 多语言快速原型 |
| **CnOCR** | 中文专注 | 中文 OCR |

## 相关概念

[卷积神经网络](/glossary/cnn)、[循环神经网络](/glossary/rnn)、[注意力机制](/glossary/attention)
