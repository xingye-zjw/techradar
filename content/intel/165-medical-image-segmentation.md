---
title: 医学影像分割（nnU-Net / MedSAM 实战）
category: computer-vision
difficulty: advanced
duration: 1-2周
summary: 医学影像分割是将 CT、MRI、超声等医学影像中的器官、病灶、肿瘤等目标区域自动像素级标注的技术，nnU-Net 提供了鲁棒的通用分割框架，而 MedSAM 则将 SAM 模型适配到医学场景，是计算机辅助诊断、手术规划、放疗靶区勾画的核心支撑技术。
keywords:
  - 医学影像分割
  - nnU-Net
  - MedSAM
  - CT/MRI 分割
  - 病灶检测
  - 3D U-Net
  - 自监督医学预训练
takeaways:
  - 搞懂医学影像分割与自然图像分割的核心差异：各向异性体素、模态多样性、标注稀缺性、评估指标体系
  - 理解 nnU-Net 的设计哲学："无需调参的通用分割框架"，能说清它的自动预处理、网络拓扑搜索、训练策略自适应机制
  - 能画出 3D U-Net、V-Net、nnU-Net 三种典型医学分割网络的结构对比图，标注关键模块差异
  - 能跑通 nnU-Net 在自定义 3D 医学数据集上的完整训练 + 推理 pipeline，输出 Dice 分数可视化
  - 实现基于 MedSAM 的零样本/少样本医学影像提示分割，支持点、框、掩码三种提示方式的交互式分割
tags:
  - computer-vision
  - medical-imaging
  - nnunet
  - medsam
  - 3d-segmentation
  - unet
  - ct-mri
relatedTerms: [cnn, resnet, instance-segmentation, fine-tuning, lora]
relatedTools: [segment-anything, pytorch, opencv, numpy, jupyter]
relatedNodes: [cv-segmentation, cv-detection]
---

## 为什么你要学它

先讲结论：**医学影像分割 = 让 AI 代替放射科医生在 CT/MRI 上逐像素"描边"，把肝脏、肿瘤、血管、神经等关键结构自动圈出来，精度接近甚至超越人类专家水平**。它不只是一个学术课题，而是已经在全球数百家医院落地的临床工具，是 AI 医疗商业化最成熟的赛道之一。

与自然图像分割相比，医学影像分割的门槛高得多但价值也大得多。自然图像分割的错误最多是"猫被识别成狗"，而医学影像分割的错误可能直接关系到患者的生死——放疗靶区画多一厘米会损伤健康器官，画少一厘米则可能导致肿瘤残留复发。这要求模型必须具备极高的精度、鲁棒性和可解释性，也催生了 nnU-Net 这种专门为医学场景量身打造的"工业级"分割框架。

实际应用场景：

- **肿瘤放射治疗**：自动勾画放疗靶区（GTV/CTV/PTV）和危及器官（OAR，如脑干、视神经、腮腺），把医生手工勾画的 3~5 小时工作量压缩到几分钟
- **手术导航与规划**：术前在 CT/MRI 上精确分割肝脏、肾脏、肺叶等器官，计算残余体积，评估手术可行性并模拟切除路径
- **慢性病定量评估**：自动测量脂肪肝的肝脏脂肪占比、多发性硬化症的病灶负荷、慢阻肺的肺功能参数，为病情分级和药效评估提供客观量化指标
- **心血管疾病诊断**：在冠脉 CTA 中自动分割血管并检测狭窄斑块，在心脏 MRI 上计算左心室射血分数（LVEF）和心肌应变
- **神经科学研究**：脑 MRI 自动分割脑区（如海马体、杏仁核、皮层厚度），用于阿尔茨海默病、精神分裂症等神经疾病的早期生物标记物研究
- **病理图像分析**：在全片扫描（WSI）病理图像上分割肿瘤区域、识别有丝分裂细胞、计算免疫细胞浸润密度，辅助病理医生分级诊断

## 一句话概览（快速版）

1. **nnU-Net 自动化过程 = 自动分析数据集指纹（模态、尺寸、各向异性），自动匹配 2D/3D 网络拓扑，自动配置预处理和数据增强策略，自动调优训练超参并进行多模型集成，输出开箱即用的高鲁棒分割模型**
2. **MedSAM 适配过程 = 将通用 SAM 模型在大规模医学影像（CT/MRI/病理/内镜）上进行领域自适应预训练，再通过微调提示编码器和解码器适配医学目标的形状纹理特征，获得远超通用 SAM 的医学分割精度**
3. **3D 医学分割推理过程 = 将整例 3D 体数据滑窗切块，逐块推理后合并重叠区域，经后处理（连通域分析、孔洞填充、最大连通保留）输出最终体掩码，用 Dice、HD95、ASSD 三个核心指标评估精度**

**核心结论**：nnU-Net 是"鲁棒性优先、无需调参"的传统医学分割工业标准，MedSAM 是"交互优先、少样本适配"的新一代医学基础模型，两者分别代表了监督学习和提示式学习在医学分割领域的最高水平。

## 核心拆解

### 🔑 nnU-Net：工业级通用医学分割框架的设计哲学

nnU-Net（no new U-Net）由德国癌症研究中心于 2020 年提出，它的最大反直觉之处在于：**不引入任何新的网络结构或注意力模块，完全基于基础 3D U-Net，仅靠系统化的自适应工程设计就在几乎所有医学分割挑战赛上霸榜**。它的成功证明了一个深刻的道理：在医学分割这种数据噪声大、模态多样的场景，"正确的工程实践"远比"花哨的模块创新"重要。

nnU-Net 的核心引擎是它的"全自动配置管线"。当用户把一个新数据集按照要求格式放好后，nnU-Net 首先会运行"数据集指纹分析"程序，自动采集以下关键统计量：图像空间分辨率（判断各向异性程度，如果 z 轴分辨率远低于 xy 轴，会优先用 2D 网络而不是强行 3D）、图像强度分布（自动计算前景区域的 0.5% 和 99.5% 分位数做截断归一化）、目标类别数量、目标大小分布（判断是小目标还是大目标，决定 patch 采样策略）、前景背景比例（判断是否需要 class balancing loss）。基于这些指纹，nnU-Net 会在三种网络拓扑中自动选择最优：2D U-Net（处理各向异性强的厚层数据）、3D full-resolution U-Net（处理小体数据）、3D low-resolution U-Net（处理大体数据的粗分割）。

```python
import os
import numpy as np
import nibabel as nib
from collections import OrderedDict
from batchgenerators.utilities.file_and_folder_operations import save_pickle

# nnU-Net 数据集指纹分析 + 最小可运行自定义训练脚本

def extract_dataset_fingerprint(imagesTr_dir, labelsTr_dir, dataset_name="Task001_Liver"):
    """模拟 nnU-Net 的数据集指纹自动分析模块"""
    case_ids = [f.replace("_0000.nii.gz", "") for f in os.listdir(imagesTr_dir) if f.endswith("_0000.nii.gz")]
    spacings = []
    sizes = []
    foreground_intensities = []
    class_pixels = {}

    for cid in case_ids:
        img = nib.load(os.path.join(imagesTr_dir, cid + "_0000.nii.gz"))
        lbl = nib.load(os.path.join(labelsTr_dir, cid + ".nii.gz"))
        spacings.append(np.array(img.header.get_zooms()))
        sizes.append(np.array(img.shape))
        img_data = img.get_fdata()
        lbl_data = lbl.get_fdata().astype(np.int32)
        # 只统计前景区域的强度分布
        fg_mask = lbl_data > 0
        if fg_mask.any():
            foreground_intensities.extend(img_data[fg_mask].ravel().tolist())
        for cls_id in np.unique(lbl_data):
            class_pixels[cls_id] = class_pixels.get(cls_id, 0) + int((lbl_data == cls_id).sum())

    # 计算指纹核心指标
    median_spacing = np.median(np.vstack(spacings), axis=0)
    anisotropy_ratio = median_spacing[-1] / max(median_spacing[0], median_spacing[1])
    intensity_p05 = np.percentile(foreground_intensities, 0.5)
    intensity_p995 = np.percentile(foreground_intensities, 99.5)
    total_foreground = sum(v for k, v in class_pixels.items() if k != 0)
    total_background = class_pixels.get(0, 1)
    fg_bg_ratio = total_foreground / max(total_background, 1)

    fingerprint = OrderedDict({
        "name": dataset_name,
        "median_spacing_xyz": median_spacing.tolist(),
        "median_image_size_xyz": np.median(np.vstack(sizes), axis=0).tolist(),
        "anisotropy_ratio": float(anisotropy_ratio),
        "intensity_norm_low_high": [float(intensity_p05), float(intensity_p995)],
        "foreground_background_ratio": float(fg_bg_ratio),
        "class_sizes": {str(k): int(v) for k, v in class_pixels.items()},
        "num_modalities": 1,  # CT 单模态；MRI 可能多模态需要设为对应数
    })
    # 根据指纹自动选择网络配置
    if anisotropy_ratio > 3.0:
        fingerprint["recommended_topology"] = "2D_UNet"
    elif np.prod(fingerprint["median_image_size_xyz"]) < 128**3:
        fingerprint["recommended_topology"] = "3D_FULLRES_UNet"
    else:
        fingerprint["recommended_topology"] = "3D_CASCADE_LOW_FULL"
    save_pickle(fingerprint, f"{dataset_name}_fingerprint.pkl")
    return fingerprint

# 使用示例：假设已有肝脏分割数据集
fp = extract_dataset_fingerprint("./data/Task001_Liver/imagesTr", "./data/Task001_Liver/labelsTr")
print("推荐网络拓扑：", fp["recommended_topology"])
print("归一化强度区间：", fp["intensity_norm_low_high"])
print("各向异性比（越大越适合2D）：", fp["anisotropy_ratio"])

# 参数解释：
# anisotropy_ratio > 3: z 轴层厚超过 xy 面分辨率 3 倍，强行 3D 卷积会引入伪影，改用 2D
# intensity 分位数截断：去掉 0.5% 和 99.5% 极值，避免金属植入物、扫描伪影干扰归一化
# fg_bg_ratio: 小于 0.01 时自动启用 Dice + CE 加权 + 过采样前景 patch，避免模型全预测背景
# 输出说明：指纹保存后，nnU-Net 会根据它自动生成训练计划，包括 patch 大小、batch size、学习率、增强强度等
```

### 🔑 MedSAM：通用分割基础模型的医学领域适配

MedSAM 是 2024 年由上海 AI Lab 联合多家医院推出的医学版 SAM，它的核心思想非常直接：既然通用 SAM 在自然图像上已经展示了极强的提示式分割泛化能力，那么只要用足够大规模的医学影像对它做"领域持续预训练"，就能把这种能力迁移到医学场景。MedSAM 的训练数据规模达到了 100 万+ 医学影像，涵盖 10+ 种模态（CT、MRI、超声、PET、病理切片、内镜、眼底照等）、30+ 个解剖部位、100+ 种不同的目标结构，是目前公开最大规模的医学分割统一预训练数据集。

MedSAM 的架构保持了与 SAM 完全一致的三段式设计：图像编码器、提示编码器、掩码解码器。但针对医学场景做了三个关键适配：**图像编码器微调而非冻结**（医学影像的纹理、灰度分布与自然图像差异巨大，冻结 ViT 会限制上限）、**训练时使用多种提示混合增强**（随机采样框提示、点提示、甚至随机裁剪的掩码提示，模拟真实临床交互的各种情况）、**加入医学特有的强度归一化预处理**（CT 自动转 HU 单位并截断到 [-1000, 1000]，MRI 做 z-score 归一化）。实际使用中，MedSAM 支持三种交互模式：放射科医生只要在病灶上点一个正向点，模型就能输出高精度分割掩码；或者用框工具快速画出病灶大致范围，模型自动贴合精确边界；也可以加载粗糙的自动预分割掩码，让模型一键精炼修正。

```python
import torch
import numpy as np
import nibabel as nib
from segment_anything import sam_model_registry, SamPredictor

# MedSAM 最小可运行推理脚本：支持框/点/掩码三种提示方式

class MedSAMPredictor:
    def __init__(self, medsam_ckpt="./medsam_vit_b.pth", device="cuda"):
        """加载 MedSAM 权重到 SAM ViT-B 结构中"""
        self.model = sam_model_registry["vit_b"](checkpoint=medsam_ckpt)
        self.model.to(device).eval()
        self.predictor = SamPredictor(self.model)
        self.device = device

    @staticmethod
    def preprocess_ct(npz_img):
        """CT 专用预处理：HU 截断 + z-score 归一化 + 转伪 RGB 三通道"""
        # CT 标准 HU 截断：肺窗 [-1000, 400] 或腹部 [-160, 240]，这里用通用截断
        img = np.clip(npz_img, -1000, 1000).astype(np.float32)
        # 按前景均值和标准差归一化
        fg_mask = img > -900
        if fg_mask.any():
            mean, std = img[fg_mask].mean(), img[fg_mask].std() + 1e-8
        else:
            mean, std = img.mean(), img.std() + 1e-8
        img = (img - mean) / std
        # 缩放至 SAM 要求的 0~255 灰度范围
        img = (img - img.min()) / (img.max() - img.min() + 1e-8) * 255.0
        img = img.astype(np.uint8)
        # SAM 需要 3 通道输入，重复灰度通道三次
        return np.stack([img, img, img], axis=-1)

    def segment_with_box_prompt(self, img_slice, bbox_xyxy):
        """用框提示分割单张 2D 切片（如 CT 横截面）"""
        self.predictor.set_image(self.preprocess_ct(img_slice))
        masks, scores, _ = self.predictor.predict(
            box=np.array(bbox_xyxy),  # [x1, y1, x2, y2]
            multimask_output=False,   # 单掩码输出，最高置信度
        )
        return masks[0], float(scores[0])

    def segment_with_point_prompt(self, img_slice, pos_points, neg_points=None):
        """用点提示分割：pos_points = [[x,y],...] 正向点，neg_points = [[x,y],...] 负向点"""
        self.predictor.set_image(self.preprocess_ct(img_slice))
        points = np.array(pos_points + (neg_points or []))
        labels = np.array([1] * len(pos_points) + [0] * len(neg_points or []))
        masks, scores, _ = self.predictor.predict(
            point_coords=points, point_labels=labels, multimask_output=False
        )
        return masks[0], float(scores[0])

    def segment_3d_volume_sliding(self, volume_np, bbox_3d_xyxy):
        """
        3D 体数据滑窗式分割：在 z 轴每张切片上用 2D 框提示传播，堆叠回 3D 掩码
        volume_np: (H, W, D) 或 (D, H, W) numpy 数组
        bbox_3d: [x1,y1,z1, x2,y2,z2] 3D 包围盒
        """
        # 统一格式为 (H, W, D)
        if volume_np.shape[0] < volume_np.shape[-1]:
            volume_np = volume_np.transpose(1, 2, 0)
        H, W, D = volume_np.shape
        x1, y1, z1, x2, y2, z2 = bbox_3d_xyxy
        mask_3d = np.zeros((H, W, D), dtype=np.uint8)
        for z in range(max(0, z1), min(D, z2 + 1)):
            # 沿 z 轴传播框提示（每张切片的 2D 框相同）
            slice_img = volume_np[:, :, z]
            # 根据 z 距离中心的距离调整框大小（目标在轴向上逐渐变小）
            z_center = (z1 + z2) / 2
            shrink = 1.0 - 0.3 * abs(z - z_center) / max((z2 - z1) / 2, 1)
            shrink = max(shrink, 0.5)
            cx, cy = (x1 + x2) / 2, (y1 + y2) / 2
            bw, bh = (x2 - x1) * shrink, (y2 - y1) * shrink
            box_2d = [int(cx - bw / 2), int(cy - bh / 2), int(cx + bw / 2), int(cy + bh / 2)]
            mask_2d, _ = self.segment_with_box_prompt(slice_img, box_2d)
            mask_3d[:, :, z] = mask_2d.astype(np.uint8)
        return mask_3d

# 实际推理使用示例
predictor = MedSAMPredictor()
# 加载 3D CT 肝脏数据（NIfTI 格式）
ct_data = nib.load("./data/liver_001.nii.gz").get_fdata()
# 医生在轴位第 80 层画了一个肝肿瘤的框
tumor_mask, conf = predictor.segment_with_box_prompt(
    img_slice=ct_data[:, :, 80],
    bbox_xyxy=[150, 220, 310, 380]
)
dice = 2 * np.logical_and(tumor_mask, gt_mask).sum() / (tumor_mask.sum() + gt_mask.sum() + 1e-8)
print(f"MedSAM 框提示肿瘤分割 Dice: {dice:.4f}, 置信度: {conf:.3f}")
# 输出说明：Dice 分数 0~1 越大越好，临床场景肝脏分割 Dice > 0.92 达到专家水平，
# 单张 2D 切片推理耗时约 50ms，满足实时交互式勾画需求。
```

## 常见误区或注意事项

1. **"医学影像分割评估只用 Dice 就够了，Dice 高就是模型好" → 严重的评估片面化**。Dice 衡量的是整体重叠度，但它对分割边界的位置误差极不敏感——一个整体收缩/膨胀了 10 像素的掩码 Dice 可能依然高达 0.9，但在放疗场景中这 10 像素误差足以让正常器官接受致命剂量。正确做法是同时报告 Dice（区域重叠）、HD95（95% 百分位豪斯多夫距离，衡量边界最远误差）、ASSD（平均对称表面距离，衡量平均边界误差）三个指标，必要时还要补充体积相对误差（RVE）和病灶检出率。

2. **"在公开数据集比如 LiTS 上 Dice 达到 0.95，直接部署到自家医院数据也能跑得很好" → 域偏移是医学分割落地的最大敌人**。不同医院的 CT 扫描协议（管电压、层厚、重建核、对比剂注射方案）差异巨大，LiTS 数据集用的是欧美医院的数据，换成国内三甲医院的实际数据 Dice 可能暴跌 0.2 以上。正确做法是部署前必须在本地医院的内部测试集上重新评估，如果差距大则用少量本地数据（50~200 例）做领域自适应微调，不要迷信公开榜单分数。

3. **"训练 3D 医学分割模型显存不够，就把图像缩成 64×64×64 再训" → 粗暴下采样会彻底破坏医学影像的诊断价值**。许多病灶本身只有几毫米大小，在 1mm 分辨率的 CT 上只占几个像素，缩到 64³ 后病灶甚至可能直接从训练数据中消失。正确做法是使用滑窗训练：保持原始分辨率，从中随机采样 128×128×64 或 96×96×96 的局部 patch 作为输入，同时确保 patch 采样时以一定概率包含前景目标（nnU-Net 默认 1/3 的 patch 强制包含前景），既节省显存又不丢失小病灶信息。

4. **"MedSAM 是通用医学基础模型，下载下来直接 inference 就能在我的科室数据上获得高分" → 零样本效果有上限，少样本微调是必选项**。MedSAM 在预训练覆盖的模态（如常规腹部 CT）上效果不错，但如果是罕见病数据（如儿科心脏 MRI、口腔 CBCT）或特殊扫描仪数据，MedSAM 的零样本 Dice 可能只有 0.6 甚至更低。正确做法是用科室里已有的 10~30 例勾画数据做轻量级微调：冻结图像编码器，只微调提示编码器和掩码解码器的最后两层，通常几个小时训练就能把 Dice 提升到 0.85 以上的临床可用水平。

5. **"用 Cross Entropy 损失函数就够了，换 Dice Loss 提升也不明显" → 医学分割极度前景稀疏，损失函数选择至关重要**。在肝脏肿瘤分割等极端场景，前景（肿瘤）像素占比可能只有 0.01%，纯 CE 损失会导致模型直接全预测背景就能获得极低损失，完全学不到任何东西。正确做法是用 Dice Loss + Cross Entropy 的组合损失，或者 Tversky Loss（可调 α/β 控制假阳性和假阴性的权重），对肿瘤检出优先的场景调高 β 惩罚漏检，对放疗靶区勾画优先的场景调高 α 惩罚误检。
