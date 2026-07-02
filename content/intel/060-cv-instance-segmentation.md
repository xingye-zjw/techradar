---
title: CV 实例分割
category: computer-vision
keywords:
  - instance-segmentation
  - mask-rcnn
  - semantic-vs-instance
  - panoptic-segmentation
  - yolact
  - panoptic-segformer
difficulty: intermediate
duration: 1-2周
summary: 实例分割同时完成目标检测和语义分割，为图像中每个独立物体生成独立的前景掩码，是自动驾驶、医疗影像、AR/VR 等场景的核心技术。
takeaways:
  - 理解语义分割与实例分割的本质区别：语义分割给像素贴类别标签，实例分割给每个独立物体生成独立掩码
  - 掌握 Mask R-CNN 的两阶段框架：先检测再分割，理解 RoI Align 为什么比 RoI Pooling 更精确
  - 能在 COCO 数据集上跑通 Mask R-CNN/YOLACT 推理，理解端到端实例分割的工程权衡
  - 区分实例分割与全景分割的应用场景，知道什么时候选什么任务
relatedTerms: instance-segmentation
relatedIntel:
  - 002-yolo
  - 004-resnet
  - 006-cnn-basics
---

## 为什么你要学它

先讲结论：**实例分割 = 告诉计算机"图里有什么东西，分别在哪里，形状是什么"**——不是贴类别标签，而是给每个独立物体单独"描边"。

它解决了一个语义分割无法处理的问题：当画面里有两只狗重叠在一起时，语义分割只会输出"狗"这个类别；但实例分割会告诉你"这是狗 A 的轮廓，那是狗 B 的轮廓"，两个掩码独立分开。

实际应用场景：
- **自动驾驶**：行人、车辆、非机动车各自独立分割，遮挡情况下仍能追踪每个目标
- **医疗影像**：CT/MRI 中独立分割每个肿瘤、器官组织，辅助诊断和手术规划
- **AR/VR**：实时理解场景中的人物前景，实现虚实融合（如短视频特效）
- **零售/质检**：独立计数重叠的商品或零件，检测缺陷的具体位置

## 一句话概览（快速版）

你只要记住三句话：

1. **语义分割 = 给每个像素贴类别标签**（输出"H×W×C"的概率图，同类物体重叠无法区分）
2. **实例分割 = 先检测再分割，每个物体独立生成掩码**（输出"N个掩码+N个边界框"，Mask R-CNN 路线）
3. **实例分割 = 检测分支 + 分割分支并行或级联**，核心在如何让分割分支从检测框中精准提取特征

## 核心拆解

### 🔑 语义分割 vs 实例分割 vs 全景分割

在开始之前，先把这三个容易混淆的概念理清楚：

| 任务 | 输出 | 典型场景 | 能否区分重叠同类物体 |
|------|------|----------|---------------------|
| 语义分割 | 每像素类别 | 背景分割、土地利用 | ❌ 不能 |
| 实例分割 | 每物体掩码+类别 | 目标计数、AR抠图 | ✅ 能 |
| 全景分割 | 背景语义+前景实例 | 统一场景理解 | ✅ 能 |

**全景分割**（Panoptic Segmentation）可以理解为实例分割 + 语义分割的统一框架：背景区域用语义分割（可数名词用实例分割），前景事物用实例分割。Panoptic SegFormer 就是其中的代表性方法。

### 🔑 Mask R-CNN（两阶段实例分割）

Mask R-CNN 是实例分割的奠基工作，核心思想：**在 Faster R-CNN 检测框架上加一个并行分割分支**。

架构拆解：
1. **Backbone + FPN**：提取多尺度特征图（P2-P5）
2. **RPN**：生成候选区域（Anchor-based）
3. **RoI Align**：从 FPN 特征图精准提取每个候选框对应的特征（解决 RoI Pooling 的量化误差）
4. **检测头**：分类 + 边界框回归（与分割分支并行）
5. **分割头**：FCN，输出 K 个通道的掩码（每个类别一个掩码），最终取对应类别的掩码

**关键创新：RoI Align**
- RoI Pooling 有两步量化：Feature Map → RoI Feature 时对边界取整
- RoI Align 取消量化，用双线性插值精确采样，解决了特征图与原图对齐的问题
- 这一改进对分割精度提升至关重要

```python
# Mask R-CNN 简化推理流程（伪代码）
def mask_rcnn_inference(image, model):
    # 1. 特征提取 + FPN
    features = fpn_backbone(image)  # P2-P5 多尺度特征

    # 2. RPN 生成候选框
    proposals = rpn(features)  # N 个候选框 (x1, y1, x2, y2)

    # 3. RoI Align 提取特征
    roi_features = roi_align(features, proposals)  # 7x7 分辨率

    # 4. 检测头：分类 + 框回归
    class_logits, box_regression = detection_head(roi_features)

    # 5. 分割头：生成掩码
    masks = segmentation_head(roi_features)  # (N, K, 14, 14)

    # 6. 取对应类别的掩码 + 阈值过滤
    selected_masks = []
    for i, (cls, score, mask) in enumerate(zip(class_logits, box_regression, masks)):
        if score > 0.5:
            selected_masks.append(mask[cls.argmax()])
    return selected_masks
```

### 🔑 YOLACT（单阶段实时实例分割）

Mask R-CNN 精度高，但速度慢（~10-20 FPS），无法满足实时场景。YOLACT 的核心思路：**把分割问题解耦为"原型掩码 + 系数预测"**。

- **原型掩码（Prototype Masks）**：Backbone 输出 k 个原型掩码（通道数 k，H×W 大小），这些是通用的基础分割模式
- **系数预测（Coefficient Prediction）**：检测头预测每个框对应的 k 个系数
- **最终掩码** = sigmoid(原型掩码 × 系数)，逐像素相乘后阈值化

YOLACT 能在 30-40 FPS 达到不错的精度，是工程落地的首选。

### 🔑 Panoptic SegFormer（全景分割）

全景分割要求统一处理前景事物（thing，用实例分割）和背景区域（stuff，用语义分割）。SegFormer 的创新点：

- **Transformer 编码器**：Mix-Transformer 提取多尺度特征
- **查询机制**：Learnable queries 代替 FPN，直接输出全景分割结果
- **DETR-like 架构**：Set-based 预测，无需 NMS 后处理

## 完整跑通方案

**第一步：环境准备**

```bash
pip install torch torchvision
pip install detectron2  # Facebook 的实例分割库，支持 Mask R-CNN
# 或者用 mmdetection
pip install mmdet mmcv-full
```

**第二步：使用 detectron2 跑通 Mask R-CNN 推理**

```python
import torch
from detectron2.config import get_cfg
from detectron2.modeling import build_model
from detectron2.checkpoint import DetectionCheckpointer
from detectron2.data import MetadataCatalog
from detectron2.utils.visualizer import Visualizer
from detectron2.data.detection_utils import read_image
import cv2

# 加载预训练模型（COCO 数据集上训练好的）
cfg = get_cfg()
cfg.merge_from_file("detectron2/configs/COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml")
cfg.MODEL.WEIGHTS = "detectron2://COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x/137849600/model_final_f10217.pkl"
cfg.MODEL.DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

model = build_model(cfg)
DetectionCheckpointer(model).load(cfg.MODEL.WEIGHTS)
model.eval()

# 推理单张图片
img = read_image("path/to/image.jpg", format="BGR")
with torch.no_grad():
    outputs = model([{"image": img}])[0]

# 可视化结果
v = Visualizer(img[:, :, ::-1], MetadataCatalog.get(cfg.DATASETS.TRAIN[0]))
result = v.draw_instance_predictions(outputs["instances"].to("cpu"))
cv2.imwrite("output.jpg", result.get_image()[:, :, ::-1])
```

**第三步：使用 YOLACT 实时推理**

```python
from yolact import YOLACT

model = YOLACT()
model.load_weights("yolact_base_54_800000.pth")
model.eval()
model.set_device("cuda")

img_tensor, _, _, _ = model.preprocess_image(["path/to/image.jpg"])
with torch.no_grad():
    preds = model(img_tensor)

# 后处理：解析掩码、框、类别
masks, classes, scores, boxes = model.postprocess(preds, 550, 550)
```

**第四步：在自定义数据集上微调 Mask R-CNN**

```python
from detectron2.engine import DefaultTrainer
from detectron2.config import get_cfg
from detectron2.data.datasets import register_coco_instances

# 注册自定义数据集（COCO 格式）
register_coco_instances("my_dataset_train", {},
                        "annotations.json", "images/train")
register_coco_instances("my_dataset_val", {},
                        "annotations_val.json", "images/val")

cfg = get_cfg()
cfg.merge_from_file("detectron2/configs/COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml")
cfg.DATASETS.TRAIN = ("my_dataset_train",)
cfg.DATASETS.TEST = ("my_dataset_val",)
cfg.DATALOADER.NUM_WORKERS = 4
cfg.MODEL.WEIGHTS = "detectron2://COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x/137849600/model_final_f10217.pkl"
cfg.SOLVER.IMS_PER_BATCH = 2
cfg.SOLVER.MAX_ITER = 10000
cfg.MODEL.ROI_HEADS.BATCH_SIZE_PER_IMAGE = 128

trainer = DefaultTrainer(cfg)
trainer.resume_or_load(resume=False)
trainer.train()
```

## 常见误区

**"实例分割比语义分割难，所以总是用实例分割" → 错误**。实例分割计算量大、速度慢。如果你的场景只需要分割道路、建筑等背景类别，用语义分割就够了。选错任务就是徒增复杂度。

**"Mask R-CNN 的分割分支和检测分支完全独立" → 错误**。分割分支依赖于 RoI Align 从检测框区域提取的特征，分割精度受检测精度约束。检测框偏移 10 像素，分割掩码也会跟着偏移。

**"YOLACT 比 Mask R-CNN 精度差很多" → 精度差距在收敛后没那么大**。YOLACT-Proton 在 COCO 上能达到 ~30 AP，Mask R-CNN ~35 AP，对于嵌入式/实时场景，YOLACT 的速度优势值得权衡。

**"RoI Align 的双线性插值采样点数越多越好" → 不一定**。标准 Mask R-CNN 用 7×7 的 bin，每个 bin 4 个采样点。增加采样点会提升一点精度，但显著增加计算量。

**"全景分割就是实例分割 + 语义分割直接相加" → 远没那么简单**。需要处理 thing 和 stuff 之间的竞争关系（同一个像素只能属于一个类别），还需要统一的评估指标（PQ = SQ × RQ）。直接拼接两个模型输出的结果往往有大量重叠/冲突。

## 推荐学习顺序

1. 先理解 Faster R-CNN 检测框架（RPN + RoI Pooling），这是 Mask R-CNN 的基础
2. 读 Mask R-CNN 论文（Faster R-CNN 团队，2017），重点关注 RoI Align 和并行分割分支
3. 用 detectron2 在 COCO 数据集上跑通推理，可视化分割结果
4. 对比 YOLACT 论文，理解单阶段实例分割的解耦思想
5. 了解全景分割任务，看 Panoptic SegFormer 或 UPSNet
6. 在自定义数据集上做端到端微调
