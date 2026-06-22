# 姿态估计（Pose Estimation）

**人体姿态估计**从图像或视频中定位人体关键点，并用骨架连线表示人体结构，是计算机视觉的核心任务之一。

## COCO 关键点定义

```
17 个关键点：
  0: 鼻子     1: 左眼     2: 右眼
  3: 左耳     4: 右耳     5: 左肩
  6: 右肩     7: 左肘     8: 右肘
  9: 左腕    10: 右腕    11: 左髋
  12: 右髋   13: 左膝    14: 右膝
  15: 左踝   16: 右踝

骨架连线：
  (0,1), (0,2), (1,3), (2,4)    头部
  (5,6), (5,7), (7,9)           左臂
  (6,8), (8,10)                  右臂
  (5,11), (6,12), (11,12)       躯干
  (11,13), (13,15)               左腿
  (12,14), (14,16)               右腿
```

## 两种技术范式

### 1. 自顶向下（Top-Down）

```
图像 → 人体检测器 → 裁剪每个人体 → 关键点检测 → 输出骨架

优点：精度高
缺点：速度慢，依赖检测器
代表：HRNet, SimpleBaseline
```

### 2. 自底向上（Bottom-Up）

```
图像 → 检测所有关键点 → 关联/分组 → 输出多个人体骨架

优点：速度快，与人数无关
缺点：精度稍低
代表：OpenPose, Bottom-Up HRNet
```

## Python 实现示例

```python
import torch
import torch.nn as nn

class SimplePoseNet(nn.Module):
    """简化版姿态估计网络"""
    def __init__(self, num_keypoints=17):
        super().__init__()
        
        # 特征提取（类 ResNet）
        self.backbone = nn.Sequential(
            nn.Conv2d(3, 64, 7, stride=2, padding=3),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(3, stride=2, padding=1),
            # ... 更多残差块
        )
        
        # 关键点热力图预测
        self.head = nn.Sequential(
            nn.Conv2d(256, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, num_keypoints, 1)  # 输出 17 个热力图
        )
    
    def forward(self, x):
        features = self.backbone(x)
        heatmaps = self.head(features)
        return heatmaps

# 推理
model = SimplePoseNet()
image = torch.randn(1, 3, 256, 192)  # 输入图像
heatmaps = model(image)  # 输出: [1, 17, 64, 48]

# 从热力图提取关键点坐标
def get_keypoints(heatmaps):
    """取每个热力图的最大值位置"""
    B, K, H, W = heatmaps.shape
    heatmaps_flat = heatmaps.view(B, K, -1)
    max_vals, max_idx = heatmaps_flat.max(dim=-1)
    
    keypoints_x = (max_idx % W).float()
    keypoints_y = (max_idx // W).float()
    
    return torch.stack([keypoints_x, keypoints_y], dim=-1)
```

## OpenPose 使用示例

```python
import cv2
import numpy as np

# OpenPose 官方模型
proto_file = "pose_deploy_linevec.prototxt"
weights_file = "pose_iter_440000.caffemodel"

net = cv2.dnn.readNetFromCaffe(proto_file, weights_file)

# 读取图像
image = cv2.imread("person.jpg")
blob = cv2.dnn.blobFromImage(image, 1.0/255, (368, 368), (0, 0, 0))

# 前向推理
net.setInput(blob)
output = net.forward()

# 提取关键点
points = []
for i in range(18):  # COCO 18 点
    prob_map = output[0, i, :, :]
    min_val, prob, min_loc, point = cv2.minMaxLoc(prob_map)
    
    x = int((image.shape[1] * point[0]) / output.shape[3])
    y = int((image.shape[0] * point[1]) / output.shape[2])
    
    if prob > 0.1:
        points.append((x, y))
    else:
        points.append(None)
```

## 应用场景

- **运动分析**：运动员动作分析、健身姿态纠正
- **人机交互**：手势识别、体感游戏（Kinect）
- **医疗康复**：患者运动功能评估
- **安防监控**：异常行为检测、跌倒检测
- **虚拟现实**：动作捕捉、虚拟角色驱动
- **自动驾驶**：行人意图预测

## 主流模型对比

| 模型 | 精度（AP） | 速度 | 特点 |
|------|-----------|------|------|
| **HRNet** | 75.1 | 慢 | 高分辨率特征 |
| **SimpleBaseline** | 72.1 | 中 | 简单有效 |
| **OpenPose** | 65.8 | 快 | 自底向上 |
| **MediaPipe** | - | 极快 | 轻量级，实时 |

## 相关概念

[卷积神经网络](/glossary/cnn)、[目标检测](/glossary/object-detection)、[人体追踪](/glossary/tracking)、[计算机视觉](/glossary/cv)
