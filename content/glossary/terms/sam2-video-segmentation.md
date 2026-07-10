---
title: SAM2视频分割
slug: sam2-video-segmentation
---

# SAM2视频分割

**SAM2（Segment Anything Model 2）** 是 Meta AI 于 2024 年推出的通用图像与视频分割基础模型，在初代 SAM 的基础上将分割能力从单张图像扩展到长视频序列。SAM2 的核心理念是「一个模型、两种模态」——用统一的 Transformer 架构同时处理图像和视频输入，通过提示工程（点、框、掩码、文本描述）即可实现零样本分割。

## 从 SAM 到 SAM2 的演进

初代 SAM 发布于 2023 年，在 1100 万张图像、11 亿个掩码的 SA-1B 数据集上训练，彻底改变了图像分割的交互范式：无需类别标注，点击几下即可抠出任意物体。但 SAM 的局限是「逐帧独立」——处理视频时需要对每一帧重新提示，帧间掩码缺乏时间一致性，且无法处理遮挡后重新出现的目标。

SAM2 在三个维度上做了关键升级：

| 维度         | SAM                           | SAM2                                          |
| ------------ | ----------------------------- | --------------------------------------------- |
| **训练数据** | SA-1B（11M 图像 / 1.1B 掩码） | SA-V（50K 视频 / 600+ 帧高质量掩码）          |
| **提示记忆** | 无状态，逐帧独立              | 记忆银行（Memory Bank）缓存已分割帧的掩码特征 |
| **推理范式** | 单帧推理                      | 时序传播 + 记忆读写，支持跨帧关联             |

## SAM2 的核心架构

SAM2 由四个模块组成：

### 1. 图像编码器（Image Encoder）

基于 Hiera（Hierarchical Vision Transformer）的多尺度视觉骨干，相比 SAM 的 ViT-H，参数量相当但速度提升 4 倍、精度更高。输出为 1/16 分辨率的多尺度图像特征图。

### 2. 提示编码器（Prompt Encoder）

将点、框、掩码、文本等异质提示编码为统一的提示嵌入：

- **稀疏提示**（点、框）：编码为可学习的 token 嵌入 + 位置编码
- **稠密提示**（掩码）：通过卷积处理后与图像特征逐元素相加
- **文本提示**：通过 CLIP 文本编码器获取嵌入，与稀疏提示融合

### 3. 记忆编码器（Memory Encoder）

SAM2 的最大创新：将每一帧分割出的掩码编码为紧凑的记忆表示，存入「记忆银行」。后续帧在分割时会 Cross-Attend 到之前所有帧的记忆特征，从而实现：

- 自动传播：第 1 帧提示后，后续帧自动跟踪分割
- 遮挡恢复：目标被遮挡后重新出现，通过历史记忆恢复掩码
- 多目标管理：内存中维护每个目标独立的记忆流，互不干扰

### 4. 掩码解码器（Mask Decoder）

轻量的 Transformer 解码器，融合图像特征 + 提示嵌入 + 记忆特征，输出多分辨率候选掩码和置信度分数，支持多物体并行解码。

## 视频交互分割工作流

```
用户对第 0 帧点击目标 A  ──→  Prompt Encoder
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────┐
│  Frame 0:  Image Encoder → 融合提示 → 输出 A 的掩码      │
│                  │                                        │
│                  ▼                                        │
│          Memory Encoder → 写入 Memory Bank[A]           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Frame 1:  Image Encoder → CrossAttend(Memory[A])     │
│                         → 自动输出 A 的新掩码             │
│                  │                                        │
│                  ▼                                        │
│          Memory Encoder → 更新 Memory Bank[A]           │
└──────────────────────┬──────────────────────────────────┘
                       │
                    Frame 2...Frame N（循环传播）
```

实际使用中，用户只需在关键帧（目标外观剧变或遮挡后）补充提示即可，其余帧 SAM2 自动完成跟踪与分割。

## 关键技术细节

### 记忆读写机制

- 每个目标维护独立的记忆集合（最多 K 个历史帧，默认 K=8）
- 新掩码通过「记忆池化」压缩为 64 个紧凑记忆 token，而非存储整张特征图
- 记忆过期策略：FIFO + 高置信度帧保留（类似 CPU Cache）

### 条件随机访问视频（CRA）训练策略

SAM2 在训练时不是顺序喂入视频帧，而是随机从视频中挑一帧做提示、再随机挑一帧做监督，强制模型学会从任意起始帧「跳跃」传播到任意目标帧，而非依赖相邻帧的轻微变化。这让 SAM2 在长视频、跳帧场景下仍然鲁棒。

### 多提示融合与冲突消解

当用户提供多组不一致的提示（如同一点既标为正又标为负）时，SAM2 通过提示注意力权重和不确定性估计动态加权，而非简单叠加，显著降低误标对结果的影响。

## 在 HuggingFace 中使用 SAM2

```python
import torch
from PIL import Image
from transformers import Sam2Model, Sam2Processor

device = "cuda" if torch.cuda.is_available() else "cpu"
model = Sam2Model.from_pretrained("facebook/sam2-hiera-large").to(device)
processor = Sam2Processor.from_pretrained("facebook/sam2-hiera-large")

# 处理第 0 帧并给出点提示
image_0 = Image.open("frame_0000.jpg")
input_points = [[[500, 375]]]  # 目标中心坐标
inputs = processor(images=image_0, input_points=input_points, return_tensors="pt").to(device)

with torch.no_grad():
    outputs_0 = model(**inputs)

# 获取第 0 帧掩码并初始化视频状态
masks_0 = processor.image_processor.post_process_masks(
    outputs_0.pred_masks.cpu(),
    inputs["original_sizes"].cpu(),
    inputs["reshaped_input_sizes"].cpu()
)[0]

# 处理第 1 帧，无需重新提示，SAM2 自动传播
image_1 = Image.open("frame_0001.jpg")
inputs_1 = processor(
    images=image_1,
    input_points=None,           # 无新提示
    mask_input=masks_0[:, 0:1, :, :].to(device),  # 用 Frame 0 掩码
    is_mask_input_from_prev_frame=True,
    return_tensors="pt"
).to(device)

with torch.no_grad():
    outputs_1 = model(**inputs_1)
masks_1 = processor.image_processor.post_process_masks(...)
```

## SAM2 在工程落地中的优化

### 1. 批量视频处理

SAM2 原生支持批处理多目标、多视频，显存允许时可并行处理 8-16 条视频流。

### 2. 记忆压缩与截断

对于超长视频（>1000 帧），启用 `memory_temporal_stride` 每隔 N 帧才写一次记忆，可将显存占用再降 60% 而精度仅掉 1-2%。

### 3. ONNX / TensorRT 导出

Hiera 骨干和掩码解码器都支持导出为 ONNX：

```bash
python export_onnx.py --model-type=sam2_hiera_l --output=sam2_l.onnx --opset=17
```

TensorRT 部署后在 RTX 4090 上可达 **~70 FPS/单目标**，满足实时视频编辑需求。

## 典型应用场景

| 场景             | SAM2 价值                                           |
| ---------------- | --------------------------------------------------- |
| **影视后期**     | 演员/道具快速 Rotoscope，替代人工逐帧蒙版           |
| **自动驾驶标注** | 激光雷达点云 + 视频双模态联合分割，标注效率提升 10x |
| **医疗影像**     | 超声/CT 序列中病灶追踪，量化体积变化速率            |
| **体育分析**     | 足球/篮球视频中球员和球的持续跟踪掩码               |
| **电商短视频**   | 商品主体抠像，一键替换背景生成营销素材              |
| **机器人抓取**   | 动态物体持续分割掩码直接送入机械手控制器            |

## SAM2 的局限与未来方向

- **小目标分割精度**：距离像素级 SOTA（Mask R-CNN 等专用模型）仍有 3-5 mAP 差距
- **非刚体变形**：极端形变（如衣服剧烈褶皱）场景下掩码边缘会抖动
- **多模态提示**：当前文本提示仅基于 CLIP 嵌入，粒度不如交互点精细
- **端侧部署**：Hiera-L 约 224M 参数，仍需进一步蒸馏（如 SAM2-tiny 24M）才能在手机/嵌入式端实时运行

SAM2 延续了「基础模型 + 提示工程」的思路，首次让通用视频分割走出实验室。它与后续出现的视频生成、多模态 VLM 的结合，将构成下一代「理解 + 编辑 + 生成」一体化视频 AI 基础设施的底层。

相关术语：[实例分割](/glossary/instance-segmentation)、[Transformer](/glossary/transformer)、[扩散模型](/glossary/diffusion-model)、[视觉语言模型](/glossary/vision-language-model)
