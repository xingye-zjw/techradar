---
title: CV 训练调优技巧
category: computer-vision
difficulty: intermediate
duration: 1-2周
summary: 图像模型训练中的实用技巧：数据增强、学习率策略、过拟合处理与迁移学习，帮你把 baseline 稳定提升到可交付水平。
takeaways:
  - 掌握常用数据增强策略与 AutoAugment/RandAugment 的使用场景
  - 理解学习率 warmup、cosine decay 与早停机制对收敛的影响
  - 学会用迁移学习、冻结层和微调策略快速适配小数据集
  - 掌握过拟合、类别不平衡与标签噪声的常用应对手段
relatedIntel:
  - 006-cnn-basics
  - 002-yolo
  - 004-resnet
tags:
  - computer-vision
  - data-augmentation
  - transfer-learning
  - learning-rate-schedule
  - overfitting
  - fine-tuning
---

## 为什么你要学它

训练计算机视觉模型时，**网络架构只决定了上限，训练技巧决定了你能不能接近这个上限**。同样的 ResNet50，用不同的数据增强、学习率策略和正则化手段，准确率可能相差 5-10 个百分点。

这篇卡片把 CV 训练中最常用、最稳定的技巧整理成一份可落地的 checklist，覆盖数据、优化器、正则化和调试四个维度，帮你在小数据集上也能训出可用模型。

## 一句话概览（快速版）

> **数据增强 + 预训练权重 + 合理学习率 + 早停，是 CV 训练的黄金四角。**

核心要点：
- **数据层面**：增强要足够、标签要干净、类别要平衡
- **优化层面**：AdamW + cosine decay + warmup 是大多数任务的默认选择
- **模型层面**：优先用 ImageNet 预训练权重，再按层解冻微调
- **调试层面**：先看 loss 曲线和错误样本，再决定是否换架构

## 核心拆解

### 🔑 数据增强

合理的增强能让模型见过更多样化的输入，显著提升泛化能力。

常用增强：
- **几何变换**：随机裁剪、翻转、旋转、缩放
- **颜色变换**：亮度、对比度、色相、饱和度抖动
- **Mixup / CutMix**：将两张图按一定比例混合，增强决策边界平滑度
- **AutoAugment / RandAugment**：自动搜索或随机组合增强策略

代码示例（PyTorch + Albumentations）：
```python
import albumentations as A
from albumentations.pytorch import ToTensorV2

train_transform = A.Compose([
    A.RandomResizedCrop(224, 224, scale=(0.8, 1.0)),
    A.HorizontalFlip(p=0.5),
    A.ShiftScaleRotate(shift_limit=0.05, scale_limit=0.1, rotate_limit=15, p=0.5),
    A.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1, p=0.5),
    A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ToTensorV2(),
])
```

### 🔑 学习率策略

- **Warmup**：训练初始阶段用小学习率慢慢爬升，避免 early divergence
- **Cosine Decay**：训练后期按余弦曲线衰减到接近 0，帮助收敛到更平坦的极小值
- **早停（Early Stopping）**：验证集指标不再提升时停止训练，防止过拟合

```python
from torch.optim.lr_scheduler import CosineAnnealingLR

optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
scheduler = CosineAnnealingLR(optimizer, T_max=epochs)
```

### 🔑 迁移学习与微调

小数据集上不要从头训练，优先使用预训练权重：
1. **冻结 backbone**：只训练最后的分类层，快速获得稳定 baseline
2. **逐层解冻**：训练几轮后逐步放开更多层，让模型适配目标域
3. **差分学习率**：backbone 用较小 lr（如 1e-4），head 用较大 lr（如 1e-3）

### 🔑 过拟合与类别不平衡

- **Dropout / DropBlock**：在 FC 层或特征图上随机丢弃，强制模型学习更鲁棒特征
- **Label Smoothing**：将硬标签 1/0 改成 0.9/0.1，降低模型过度自信
- **Focal Loss / 加权 CrossEntropy**：给难样本或少数类更高权重
- **重采样**：对少数类过采样或多数类欠采样，缓解类别不平衡

## 完整排查方案

当验证集指标不理想时，按以下顺序排查：

01. 检查数据加载是否正确（标签、路径、归一化）
02. 可视化增强后的样本，确认增强强度合理
03. 画出 train/val loss 曲线，判断是否过拟合或欠拟合
04. 检查学习率是否过大或 warmup 是否缺失
05. 用预训练权重重跑，确认 baseline 是否正常
06. 分析错误样本，定位是数据问题还是模型容量问题
07. 尝试更大的模型或更强的增强，做消融实验

## 常见误区与注意事项

- **误区 1：增强越强越好**。过度增强会让训练集和真实分布差异过大，导致线上效果变差，应通过验证集反馈调整强度。
- **误区 2：预训练权重直接微调全部层**。小数据集上先冻结 backbone 训练 head，再逐层解冻，否则容易过拟合且训练不稳定。
- **误区 3：只看训练 loss 选模型**。验证集指标和错误样本分析才是调参依据，训练 loss 低不代表泛化好。
- **注意 1：Augmentation 只在训练时应用**，验证和测试必须保持与线上一致的预处理。
- **注意 2：分类任务中标签噪声的危害常被低估**，在数据量小时建议先做一轮人工清洗或一致性检查。

## 关键术语

- **Data Augmentation**：通过对训练图像做随机变换，扩充数据多样性
- **Transfer Learning**：将在大数据集上训练好的模型权重迁移到目标任务
- **Fine-tuning**：在预训练模型基础上继续训练，适配下游任务
- **Warmup**：训练初期线性增加学习率，稳定优化过程
- **Cosine Decay**：按余弦曲线衰减学习率的策略
- **Label Smoothing**：软化硬标签，降低过拟合风险
