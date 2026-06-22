---
title: instance segmentation
category: cv
summary: 目标检测 + 语义分割的结合体，不仅告诉你「图里有一只猫」，还能精确描边这只猫的轮廓像素级位置
---

实例分割是计算机视觉中比目标检测更进一步的任务：不仅要找出图中所有目标「在哪里」，还要精确勾勒出每个目标的轮廓「是什么形状」。

## 与其他任务的关系

| 任务 | 输出 | 区分同类物体？ |
|---|---|---|
| 目标检测 | Bounding Box + 类别 | ❌（两个重叠的同类物体只有一个框） |
| 语义分割 | 每个像素的类别 | ❌（同类物体合并为一个 mask） |
| **实例分割** | **每个物体的独立 mask** | ✅（每个物体独立区分） |

## 核心算法

### Two-Stage: Mask R-CNN

在 Faster R-CNN 检测头基础上添加一个 **Segmentation Head**：
1. RPN 产生 RoI
2. 每个 RoI 经 RoI Align 得到固定尺寸特征
3. 分类头 + 检测头 + 分割头（mask branch）并行输出

### One-Stage: YOLOv8-seg

在 YOLOv8 的检测头旁边添加一个 Segmentation Head，输出每个检测框内的 mask 系数 + 原型向量（prototype），通过矩阵乘法得到最终 mask。速度比 Mask R-CNN 快很多，适合实时场景。

## 数据格式

COCO 格式（多边形顶点）：
```json
{
  "segmentation": [[x1,y1,x2,y2,...xn,yn]],
  "bbox": [x_min, y_min, width, height]
}
```

YOLO 格式（归一化中心点 + 宽高）：
```
class_id x_center y_center width height
```

## 评估指标

- **mAPseg**：按 mask 的 IoU 计算的平均精度
- **box_mAP**：按检测框 IoU 计算的平均精度（通常同时报告）

## 相关资源

- [YOLOv8 Segmentation 文档](https://docs.ultralytics.com/tasks/segment/)
- [COCO 全数据集格式](https://cocodataset.org/#format-data)
