---
title: YOLO 目标检测
category: computer-vision
difficulty: intermediate
duration: 2-3周
summary: 单阶段端到端目标检测方案，看一张图一次前向传播就定位所有物体，是工业界实时检测的首选
takeaways:
  - 理解 Anchor-Free 机制和 PAN-FPN 的特征融合直觉
  - 能在自己的图片上跑 Ultralytics YOLO 推理
  - 能组织 YOLO 格式数据集并训练自定义目标检测模型
  - 能导出 ONNX 用于部署，读懂 mAP 和 NMS 等核心指标
relatedIntel:
  - 004-resnet
  - 006-cnn-basics
  - 060-cv-instance-segmentation
relatedNodes: cv-detection
tags:
  - yolo
  - object detection
  - cnn
  - ultralytics
  - bounding box
  - map
  - nms
  - anchor-free
---

## 为什么你要学它

想象你面前有一张街景照片，里面有行人、汽车、自行车。你希望计算机不仅告诉你"图里有什么"（分类任务），还要告诉你"每个物体在什么位置"（检测任务）。传统方案要先"找区域"再"识别物体"，两步走，慢；YOLO 把它变成一次神经网络前向传播，**图片进，所有物体的类别、边界框、置信度同时出**。

这意味着什么？如果你的项目涉及自动驾驶感知、安防摄像头告警、无人机图像分析、工业缺陷检测、甚至短视频智能裁剪，YOLO 都是绕不开的技术。它的推理速度可以跑到 **单张图像 1ms 以内**（在现代 GPU 上），精度逼近传统两阶段方案。更重要的是，Ultralytics 官方把它包装成了 `pip install` 即可使用的库，门槛大幅降低。

所以学习 YOLO 不是为了掌握某个算法，而是掌握一条**从数据 → 训练 → 部署的完整产品级通路**。你可以在一个下午内，把自己手机拍的照片变成一个能用的检测系统。

## 一句话概览（快速版）

- YOLO 把检测做成**单阶段回归**：输入图像切分为网格，每个网格直接预测边界框和类别，一次前向传播完成。
- 从 YOLOv8/v11 开始全面转向 **Anchor-Free**，配合 CSPDarknet 骨干 + PAN-FPN 多尺度特征融合 + Decoupled Head，在精度和速度间取得最佳平衡。
- **Ultralytics 是你最好的朋友**：一条命令安装、两行代码跑推理、一个配置文件训练自己的数据集、一条命令导出 ONNX。

## 核心拆解

### 🔑 Anchor-Free 机制：告别锚框，直接预测

早期 YOLO（v2、v3）使用锚框（Anchor Box）：先在数据上聚类出 9 种典型宽高比，再让网络预测与锚框的偏移。这会带来两个问题：（1）锚框需要针对数据集聚类，换场景要重来；（2）网络预测偏移而不是绝对坐标，训练不稳定。

**Anchor-Free 的思路很简单**：网络直接预测每个网格点对应物体中心的偏移、边界框宽高、类别概率。YOLOv8/v11 配合 **DFL（Distribution Focal Loss）**，把边界框坐标建模为离散分布，让网络对边界位置的预测更敏锐。

你不需要自己实现 Anchor-Free——Ultralytics 已经帮你做好了。但要理解它的存在：当你发现检测框总是"偏一点"时，原因可能在 Anchor-Free 的中心偏移预测上，而不是锚框数量不够。

### 🔑 CSPDarknet：让特征更"分治"地学习

YOLO 的骨干网络叫 CSPDarknet，核心思想是 **Cross Stage Partial（CSP）**：把特征图的通道一分为二，一条走卷积变换，另一条直接跳跃传到下一层，最后再拼接。

为什么这样做？直觉是：**不是所有通道都需要经过同样深度的非线性变换**。保留一部分通道"原样传输"，既能减少参数和计算量，又能防止深层网络把原本清晰的低层特征"过度处理"掉。

在实际部署里，CSP 让你能用更少的算力拿到更高的精度——**YOLOv11n 只有 2.6M 参数，却比很多 10M+ 的老模型准**。

### 🔑 PAN-FPN：多尺度特征融合，大小物体都能看见

目标检测里最头疼的问题之一是**大物体和小物体同时出现**：一只靠近镜头的狗占了半张图，远处的一只鸟只有 20 个像素。如果网络只在最深的特征图上检测（语义强但分辨率低），小物体会被漏掉；如果只在浅层检测（分辨率高但语义弱），大物体的类别会判不准。

**FPN（Feature Pyramid Network）** 解决前半部分：把深层的强语义特征上采样，和浅层的高分辨率特征融合，自上而下传递语义。**PAN（Path Aggregation Network）** 再加一条自下而上的路径，把浅层的精确位置信息传回去。两者配合就是 **PAN-FPN**——这是 YOLO 里 Neck 的核心结构。

在 Ultralytics 的训练曲线中，如果你看到小物体的 mAP 明显低于大物体，通常的改进方向是：**增加 PAN-FPN 中 P2/P3 层的权重，或用更大的 imgsz（如 1280）**。

### 🔑 Decoupled Head：分类和检测是两件事

早期 YOLO 用同一个卷积分支同时预测分类概率和边界框坐标，但这两个任务的目标其实不一样：分类更关心"特征语义是什么"，检测更关心"物体边界在哪里"。把它们混在一起，网络要妥协。

**Decoupled Head** 的做法是把 Neck 输出的特征图送入两个独立分支：一个做分类（输出类别概率），一个做检测（输出边界框 + 置信度）。实验显示它能让**收敛速度加快、最终 mAP 提升 1-2 个百分点**。

这个设计的代价是增加少量额外参数，但对现代 GPU 来说几乎可以忽略。

### 🔑 COCO 与 YOLO 数据格式

YOLO 的数据格式非常轻量，比 PASCAL VOC 的 XML 和 COCO 的 JSON 更简洁：

- 每张图片对应一个同名 `.txt` 标注文件
- 每一行 = `class_id x_center y_center width height`
- 四个坐标都**归一化到 0~1**（除以图片宽高）

比如：

```
0 0.716797 0.395833 0.216406 0.147222
1 0.251000 0.623000 0.180000 0.230000
```

表示图中有两个物体：类别 0（如 person）中心在图像 71.7% × 39.6% 处，宽高为图像的 21.6% × 14.7%；类别 1（如 car）在另一位置。

归一化的好处是图片缩放后坐标依然有效。**如果你用 CVAT 或 Label Studio 标注，导出时选 "YOLO" 格式就直接拿到这种文件。**

配套的数据集描述文件（YAML）长这样：

```yaml
path: ./datasets/my_dataset  # 数据集根目录
train: images/train          # 训练集相对路径
val: images/val              # 验证集相对路径
nc: 3                        # 类别数
names:
  0: cat
  1: dog
  2: bird
```

### 🔑 NMS 与 mAP：模型好不好，看这两个指标

训练完 YOLO，你会看到两个核心指标：**mAP@0.5** 和 **mAP@0.5:0.95**。前者在 IoU=0.5 的阈值下算平均精度（简单场景够用），后者在 0.5 到 0.95 的 10 个 IoU 阈值上取平均（更严格、更接近工业评价标准）。

**NMS（Non-Maximum Suppression）** 是推理的最后一步：同一个物体上往往有多个重叠的检测框，NMS 保留置信度最高的框，然后剔除那些和它 IoU 超过阈值的框。在 Ultralytics 中这一步默认已做，你只需调节 `conf`（置信度阈值）和 `iou`（NMS IoU 阈值）。

## 完整跑通方案

### 第一步：安装 Ultralytics 并跑一次推理

```bash
pip install ultralytics
```

```python
from ultralytics import YOLO

# 加载预训练模型（首次运行会自动下载，约 6MB）
model = YOLO("yolo11n.pt")

# 在一张图片上跑检测
results = model.predict(
    source="https://ultralytics.com/images/bus.jpg",
    conf=0.25,        # 置信度阈值，越低召回越多
    iou=0.45,         # NMS 的 IoU 阈值，越小去重越狠
    save=True,        # 保存带检测框的图片到 runs/detect/predict
)

# 打印第一张图的检测结果
boxes = results[0].boxes
print("检测框坐标:", boxes.xyxy)     # (x1, y1, x2, y2)
print("类别:",       boxes.cls)       # 类别索引
print("置信度:",     boxes.conf)      # 置信度
print("类别名:",     [results[0].names[int(c)] for c in boxes.cls])
```

### 第二步：在 COCO128 小数据集上验证流程

COCO128 是 Ultralytics 内置的 128 张迷你 COCO 子集，用来跑通全流程再好不过：

```python
from ultralytics import YOLO

model = YOLO("yolo11n.pt")

# 在 COCO128 上训练 30 个 epoch
model.train(
    data="coco128.yaml",   # 内置数据集描述，无需自己准备
    epochs=30,
    imgsz=640,             # 输入图像大小（640 是默认平衡点）
    batch=16,              # 显存不够可以调成 8 或 4
    device=0,              # GPU 索引，没有 GPU 写 "cpu"
    patience=10,           # 连续 10 个 epoch 没提升就停止
    optimizer="SGD",       # YOLO 的默认优化器是 SGD，比 Adam 更稳
    seed=42,
)

# 训练完后在验证集上评估
metrics = model.val(data="coco128.yaml")
print("mAP@0.5 =", metrics.box.map50)
print("mAP@0.5:0.95 =", metrics.box.map)
```

训练日志、权重、PR 曲线会输出到 `runs/detect/train/`。

### 第三步：组织自己的自定义数据集

假设你有一个"猫/狗/鸟"检测任务，按下面目录结构放文件：

```
my_dataset/
├── images/
│   ├── train/   # 训练集图片（建议 200~2000 张/类）
│   └── val/     # 验证集图片（建议 train 的 20%）
└── labels/
    ├── train/   # 同名 .txt 标签，YOLO 格式
    └── val/
```

写一个 `custom.yaml`：

```yaml
path: ./my_dataset
train: images/train
val: images/val
nc: 3
names:
  0: cat
  1: dog
  2: bird
```

然后训练：

```python
from ultralytics import YOLO

model = YOLO("yolo11n.pt")
model.train(
    data="custom.yaml",
    epochs=50,
    imgsz=640,
    batch=16,
    device=0,
    patience=10,
    mosaic=1.0,          # 马赛克数据增强：4 张拼 1 张
    mixup=0.1,           # 混合增强
    hsv_h=0.015,         # 色调扰动
    hsv_s=0.7,           # 饱和度扰动
    hsv_v=0.4,           # 亮度扰动
    fliplr=0.5,          # 左右翻转
    plots=True,          # 自动生成 PR 曲线和混淆矩阵图
)
```

**训练完毕的几个关键动作**：

1. 看 `runs/detect/train/results.png`：mAP 曲线是否还在上升？如果还在上升，说明可以再训练更多 epoch。
2. 看混淆矩阵：哪两类容易被互相认错？可能需要增加对应类的样本。
3. 看 `F1_curve.png`：找到最佳置信度阈值，部署时用它。

### 第四步：导出 ONNX 用于部署

```python
from ultralytics import YOLO

model = YOLO("runs/detect/train/weights/best.pt")  # 训练出来的最佳权重
model.export(
    format="onnx",
    imgsz=640,
    opset=17,
    simplify=True,     # 用 onnxsim 简化计算图（推荐）
    dynamic=False,     # 固定 batch 和尺寸，方便端侧部署
)
# 生成 runs/detect/train/weights/best.onnx
```

然后在任何有 ONNX Runtime 的环境里推理：

```python
import onnxruntime as ort
import numpy as np
from PIL import Image

session = ort.InferenceSession("best.onnx", providers=["CUDAExecutionProvider", "CPUExecutionProvider"])

img = Image.open("test.jpg").resize((640, 640)).convert("RGB")
arr = np.asarray(img, dtype=np.float32).transpose(2, 0, 1) / 255.0
arr = np.expand_dims(arr, axis=0)

outputs = session.run(None, {session.get_inputs()[0].name: arr})
print("ONNX 输出 shape:", [o.shape for o in outputs])
```

## 常见误区

**误区 1：以为 YOLO 只是一个模型，不关心数据格式** → 解释：YOLO 生态最常见的问题其实在数据侧。标注框必须归一化到 0~1、标签文件名必须和图片一致（扩展名不同）、类别 id 必须从 0 连续开始。任何一项错了，模型都能"训练起来"，但 mAP 会极低，你会误以为网络结构有问题。

**误区 2：imgsz 设得越大越好** → 解释：更大的 imgsz（如 1280）能让小物体更清晰，但显存占用和推理时间近似**平方增长**。默认 640 是一个经过大量验证的平衡点。如果你的场景里有很多 30px 以下的小物体，再考虑调到 960 或 1280。

**误区 3：只看 mAP@0.5，不看 mAP@0.5:0.95** → 解释：mAP@0.5 只要检测框"差不多对"就算命中，门槛很低；mAP@0.5:0.95 在 10 个 IoU 阈值下取平均，更能反映检测框的实际精度。工业部署一定要看后者。

**误区 4：训练时 batch_size = 2 也能接受** → 解释：BN 层在 batch_size 过小时统计量噪声很大。Ultralytics 支持 `accumulate` 参数做梯度累积模拟大 batch。如果显存只能跑 batch=4，建议设 `accumulate=4`。

**误区 5：导出 ONNX 后不对比原 PyTorch 模型的输出** → 解释：ONNX 导出（尤其是 opset 不匹配时）可能引入细微偏差。导出后一定要拿几张图同时跑 PyTorch 和 ONNX，确认输出差异在 1e-3 以内再部署。
