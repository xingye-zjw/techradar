---
title: SAM 2 视频物体分割与长时序追踪
category: computer-vision
difficulty: advanced
duration: 1-2周
summary: SAM 2（Segment Anything Model 2）是 Meta 推出的统一图像与视频分割模型，通过提示交互实现任意物体的零样本分割，特别支持长时序视频中目标的持续追踪与掩码传播，是视频理解、内容创作、机器人感知的新一代基础设施。
keywords:
  - SAM 2
  - 视频分割
  - 提示分割
  - 长时序追踪
  - 掩码传播
  - Segment Anything
  - 零样本分割
takeaways:
  - 搞懂 SAM 2 的统一图像+视频架构，理解内存注意力机制如何解决长时序视频分割
  - 理解提示交互范式（点/框/掩码），能区分正向提示与负向提示的作用
  - 能画出 SAM 2 的视频内存编码器与传播解码器数据流示意图
  - 能跑通官方 SAM 2 仓库在自定义视频上的交互式分割 demo
  - 实现基于提示初始化的长视频目标追踪 pipeline，输出带 ID 的逐帧掩码
tags:
  - computer-vision
  - sam2
  - video-segmentation
  - object-tracking
  - prompt-segmentation
  - mask-propagation
  - meta-ai
relatedTerms:
  - instance-segmentation
  - transformer
  - self-attention
  - resnet
  - onnx
relatedTools:
  - segment-anything
  - pytorch
  - opencv
  - huggingface-transformers
relatedNodes:
  - cv-segmentation
  - cv-detection
---

## 为什么你要学它

先讲结论：**SAM 2 = 把图像分割的"大模型范式"扩展到视频，用一次提示就能在整段视频里持续追踪并分割任意目标**。它不需要针对特定类别训练，零样本就能处理各种物体，是真正意义上的通用视频分割基础模型。

传统视频分割方法存在两个根本痛点：一是需要大量标注数据，换个场景就得重新训练；二是只能处理预定义类别，遇到新物体就完全失效。SAM 2 用提示交互彻底打破了这两个限制——用户只要在第一帧点一下或画个框，模型就能在后续成千上万帧里持续生成精准掩码，即使目标被遮挡、形变、出画再入画也能稳定追踪。

实际应用场景：

- **影视后期与内容创作**：一键抠除视频中任意人物/物体，替换背景或添加特效，无需逐帧手工绿幕
- **自动驾驶与机器人**：通过交互式提示快速标注驾驶场景数据，或在机器人感知中动态指定需要追踪的障碍物
- **体育分析与动作捕捉**：追踪运动员身体部位和球的运动轨迹，生成高精度运动掩码用于战术分析
- **医学影像分析**：在超声、内镜等动态影像中追踪病灶或器官，辅助手术导航和病情监测
- **视频监控与安防**：快速锁定可疑目标后持续追踪其运动轨迹和区域，跨遮挡保持身份一致
- **AR/VR 虚实融合**：实时分割现实场景中的物体表面，用于虚拟物体放置与遮挡关系计算

## 一句话概览（快速版）

1. **提示编码过程 = 点/框/掩码提示经提示编码器嵌入，与图像编码器输出的特征图融合，生成分割所需的条件信号**
2. **内存注意力过程 = 将历史帧的分割掩码和图像特征压缩存入内存池，解码时通过交叉注意力检索相关帧信息，实现长时序依赖建模**
3. **掩码传播过程 = 对当前帧使用图像特征 + 内存特征 + 提示特征三路融合，经分割解码器输出多分辨率掩码，置信度高的结果再回写入内存池**

**核心结论**：SAM 2 用"图像编码 + 提示编码 + 内存注意力 + 掩码解码"的统一架构，同时支持图像和视频分割，内存机制是其长时序追踪能力的关键来源。

## 核心拆解

### 🔑 SAM 2 统一架构详解

SAM 2 的整体设计继承了第一代 SAM 的提示交互思想，但做了三个关键升级：统一骨干网络、内存注意力机制、分层掩码解码。整个模型由四个核心模块组成：图像编码器（Image Encoder）、提示编码器（Prompt Encoder）、内存编码器（Memory Encoder）、掩码解码器（Mask Decoder）。

图像编码器采用改进的 Hiera（Hierarchical ViT）结构，输出四个不同分辨率的多尺度特征图。相比第一代 SAM 使用的 ViT-H，Hiera 通过层级化设计在保持精度的同时大幅提升了推理速度，并且能够直接提取适合视频任务的时空特征。提示编码器保持与 SAM 类似的设计，支持三种提示类型：点提示（正向点/负向点，用位置编码区分）、框提示（用左上角和右下角编码）、掩码提示（用轻量卷积编码器压缩）。

内存编码器是 SAM 2 最核心的创新。它的工作机制是：将初始帧的图像特征和提示信息先编码成"初始内存"，随着视频帧推进，每个时刻模型都会把当前帧预测出的高置信度掩码连同对应的图像特征一起压缩，存入一个可读写的"内存池"。内存池中既包含最新帧的即时信息，也包含历史帧的聚合信息，通过一个内存融合模块将两者结合，避免内存无限增长。

```python
import torch
import torch.nn as nn
from sam2.build_sam import build_sam2_video_predictor

# 加载 SAM 2 视频分割模型（最小可运行示例）
checkpoint = "./checkpoints/sam2_hiera_large.pt"
model_cfg = "sam2_hiera_l.yaml"
predictor = build_sam2_video_predictor(model_cfg, checkpoint)
predictor.eval().cuda()

# 初始化视频推理状态（传入视频帧目录）
video_dir = "./videos/my_video_frames"  # 存放 00000.jpg ~ 00N.jpg
state = predictor.init_state(video_path=video_dir)

# 在第 0 帧添加提示：1 个正向点 + 1 个框，目标物体 ID 为 1
ann_frame_idx = 0
ann_obj_id = 1
points = torch.tensor([[500, 300]], dtype=torch.float32).cuda()
labels = torch.tensor([1], dtype=torch.int32).cuda()  # 1=正向, 0=负向
box = torch.tensor([[400, 200, 600, 400]], dtype=torch.float32).cuda()

_, out_obj_ids, out_mask_logits = predictor.add_new_points_or_box(
    inference_state=state,
    frame_idx=ann_frame_idx,
    obj_id=ann_obj_id,
    points=points,
    labels=labels,
    box=box,
)

# 逐帧传播并收集结果（从第 0 帧到最后一帧）
all_seg_masks = {}
for out_frame_idx, out_obj_ids, out_mask_logits in predictor.propagate_in_video(state):
    all_seg_masks[out_frame_idx] = {
        obj_id: (out_mask_logits[i] > 0.0).cpu().numpy()
        for i, obj_id in enumerate(out_obj_ids)
    }
    print(f"Frame {out_frame_idx}: tracked {len(out_obj_ids)} objects")

# 输出说明：all_seg_masks 字典键为帧号，值为 {obj_id: 二值掩码数组}
# 可直接用 OpenCV 将掩码着色后叠加到原视频帧，生成可视化追踪视频
```

### 🔑 内存注意力与长时序传播机制

内存注意力机制是 SAM 2 能够处理数千帧长视频的关键设计。传统视频分割方法（如 STCN、AOT）使用的是固定长度的时空记忆，一旦目标长时间被遮挡或出画，记忆就会被覆盖导致追踪失败。SAM 2 设计了"双向内存"结构：一个容量较小的"最新内存"存储最近若干帧的高分辨率信息，用于处理快速运动和形变；另一个容量较大的"聚合内存"通过融合历史信息生成，用于处理长时序依赖。

掩码解码器在每个时刻会同时执行三种交叉注意力：对当前帧图像特征的注意力、对最新内存的注意力、对聚合内存的注意力。三路注意力结果经过 MLP 融合后输入到分层掩码头，依次输出 1/4、1/2、全分辨率的掩码，通过从粗到细的渐进式精炼提升边缘精度。每帧解码完成后，模型会计算掩码的置信度分数（由前景像素的平均 logit 值决定），只有置信度超过阈值的帧才会被写入内存池，避免错误预测的累积和传播。

从 0 到 1 的最小可运行内存模拟代码如下：

```python
import numpy as np

class SAM2MemorySimulator:
    def __init__(self, max_recent=4, max_aggregated=16):
        self.max_recent = max_recent
        self.max_aggregated = max_aggregated
        self.recent_memory = []  # 最新内存：[(feat, mask, conf)]
        self.aggregated_memory = []  # 聚合内存：[(feat, mask, conf)]

    def add_frame(self, feat, mask, confidence):
        if confidence < 0.6:
            return False  # 低置信度不写入，避免污染内存
        self.recent_memory.append((feat, mask, confidence))
        if len(self.recent_memory) > self.max_recent:
            # 超出的最老帧合并到聚合内存
            old_feat, old_mask, old_conf = self.recent_memory.pop(0)
            self._merge_into_aggregated(old_feat, old_mask, old_conf)
        return True

    def _merge_into_aggregated(self, feat, mask, conf):
        if len(self.aggregated_memory) < self.max_aggregated:
            self.aggregated_memory.append((feat, mask, conf))
        else:
            # 找到聚合内存中置信度最低的，用加权平均替换
            idx = np.argmin([c for _, _, c in self.aggregated_memory])
            f_old, m_old, c_old = self.aggregated_memory[idx]
            new_conf = max(c_old, conf)
            new_feat = (f_old * c_old + feat * conf) / (c_old + conf + 1e-8)
            new_mask = (m_old * c_old + mask * conf) / (c_old + conf + 1e-8)
            self.aggregated_memory[idx] = (new_feat, new_mask, new_conf)

    def retrieve(self, query_feat):
        all_memory = self.recent_memory + self.aggregated_memory
        if not all_memory:
            return None
        # 简化的注意力检索：计算查询特征与各记忆的相似度加权
        sims = [np.sum(query_feat * f) / (np.linalg.norm(query_feat) * np.linalg.norm(f) + 1e-8)
                for f, _, _ in all_memory]
        weights = np.exp(sims) / np.sum(np.exp(sims))
        retrieved_feat = sum(w * f for w, (f, _, _) in zip(weights, all_memory))
        retrieved_mask = sum(w * m for w, (_, m, _) in zip(weights, all_memory))
        return retrieved_feat, retrieved_mask

# 参数解释：
# max_recent: 最新内存容量，越小速度越快，推荐 4~8
# max_aggregated: 聚合内存容量，越大长时序能力越强，推荐 16~64
# confidence 阈值 0.6：低于该值的帧不写入，平衡鲁棒性和内存更新频率
# 输出说明：retrieve 返回加权融合的历史特征和掩码，供当前帧解码使用
```

## 常见误区或注意事项

1. **"SAM 2 是完全自动的视频分割，不需要任何用户提示" → 错误理解**。SAM 2 本质上是交互式分割模型，必须通过至少一种提示（点/框/掩码）初始化目标，虽然官方提供了结合 DETR 自动生成框的示例流水线，但那属于"SAM 2 + 检测器"的组合方案，不是 SAM 2 模型本身的能力。正确做法是：先在关键帧用提示标注目标，再让模型自动传播到剩余帧。

2. **"提示点数越多，分割结果一定越精确" → 不一定，可能引入干扰**。正向点过多会强制模型把局部区域都算作前景，反而可能把背景错误包含；负向点位置不准确时同样会误伤真实前景区域。正确做法是：优先用 1 个框初始化（最稳定），边缘不精准时再补充 2~5 个正向/负向点微调，避免一次性添加十几个提示点。

3. **"视频帧分辨率调低就能显著提速，不影响精度" → 严重低估了分辨率对边缘精度的影响**。SAM 2 图像编码器的输入标准分辨率是 1024×1024，如果粗暴把视频缩放到 256×256，小物体和精细边缘（如头发丝、电线）的分割质量会大幅下降，甚至可能直接追踪丢失。正确做法是：保持长边 1024 左右的分辨率，或使用官方提供的 multi-scale 推理模式，在速度和精度之间折中。

4. **"目标被完全遮挡后 SAM 2 会自动记住，重新出现时继续追踪" → 内存机制并非无限期记忆**。如果目标被遮挡超过聚合内存的容量时长（例如默认配置约几十帧），内存中的目标特征会逐渐被其他信息覆盖，再次出现时可能需要重新提示。正确做法是：长时遮挡场景下，检测到目标重新出现时（可用简单的 IOU 或外观匹配触发），调用一次 `add_new_points_or_box` 重新注入提示，恢复追踪。

5. **"SAM 2 可以直接部署到移动端，跑实时视频分割" → 目前版本的计算量仍然较大**。即使是 Hiera-Tiny 配置，单帧推理在消费级 GPU 上也需要几十毫秒，在手机端 NPU 上可能需要几百毫秒，难以达到 30 FPS 实时。正确做法是：服务端部署用 TensorRT 或 FP16 半精度加速；边缘端考虑蒸馏出更小的学生模型，或只在关键帧运行 SAM 2、中间帧用轻量跟踪器（如 KCF/ByteTrack）插值。
