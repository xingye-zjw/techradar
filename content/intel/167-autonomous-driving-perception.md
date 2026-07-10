---
title: 自动驾驶感知多任务融合（BEV / Occupancy）
category: computer-vision
difficulty: advanced
duration: 1-2周
summary: 自动驾驶多任务感知通过将多相机、多激光雷达、多毫米波雷达的异构传感器数据统一投影到 BEV（鸟瞰图）空间做融合推理，同时输出 3D 目标检测、车道线分割、可行驶区域、占用栅格（Occupancy）等多种感知结果，是 L2+ 到 L4 级自动驾驶系统的核心大脑模块。
keywords:
  - 自动驾驶感知
  - BEV Transformer
  - Occupancy 占用栅格
  - 多传感器融合
  - 3D 目标检测
  - 纯视觉方案
  - 多任务学习
takeaways:
  - 搞懂从 2D 图像到 BEV 空间的三种视角变换方法：IPM 逆透视变换、深度估计体素投影、Transformer 注意力查询的原理与优劣
  - 理解 BEV 感知的核心范式：BEVFormer/BEVDet 系列如何用时空编码器 + BEV 查询实现多相机时序融合，能画出数据流向示意图
  - 理解 Occupancy 占用栅格任务的动机：用稠密体素占据表示替代稀疏 3D 框，解决长尾障碍物和无定形障碍物检测难题
  - 能跑通基于 BEVDet/OccNet 的最小推理 demo，在 nuScenes 数据集上完成可视化和 NDS/mAP 指标验证
  - 实现多任务 BEV 感知模型的联合训练脚本，同时优化 3D 检测 + 车道线分割 + 可行驶区域三个任务的损失函数
tags:
  - computer-vision
  - autonomous-driving
  - bev-transformer
  - occupancy-network
  - multi-task-perception
  - sensor-fusion
  - 3d-object-detection
relatedTerms: [transformer, self-attention, resnet, instance-segmentation, cnn]
relatedTools: [opencv, pytorch, numpy, matplotlib, ultralytics-yolo]
relatedNodes: [cv-detection, cv-segmentation]
---

## 为什么你要学它

先讲结论：**自动驾驶 BEV 感知 = 把汽车四周 6~~12 个摄像头拍到的 2D 图片、3~~5 颗激光雷达扫到的 3D 点云、5 颗毫米波雷达的径向速度数据，全部统一投影到同一个俯视坐标系下做联合推理，一次前向同时告诉你"周围有什么物体、它们在哪里、在怎么动、哪些区域可以开、哪些区域被东西占了"**。它替代了过去"每个传感器单独做检测再做后融合"的拼接式方案，是当前特斯拉、小鹏、理想、华为等头部玩家高阶智驾的核心技术路径。

传统分立式感知方案有三个无法解决的根本痛点：一是后融合信息损失严重，每个传感器做完 2D/3D 检测后只输出目标框，丢失了大量原始特征，遮挡场景下很容易漏检重复检；二是任务之间缺乏协同，3D 检测模型和车道线分割模型各自独立训练，输出结果在空间上不一致（比如车辆压在车道线上）；三是无法有效处理长尾场景，稀疏的 3D 框表示只能表示预定义类别（车/人/非机动车），遇到路上的纸箱、轮胎、施工路障等非预定义障碍物就完全瞎了。BEV + Occupancy 的统一感知范式从根上解决了这三个问题，是智驾从 L2 迈向 L3 的必经之路。

实际应用场景：

- **城市 NOA（导航辅助驾驶）**：路口场景下用 BEV 感知同时检测对向左转车、横穿行人、外卖电动车、排队车流、地面箭头标线、停止线、红绿灯停止区域，一次性输出所有感知信号供规划决策模块使用
- **高速领航辅助**：长距离感知同时处理 200 米范围内的前车、大货车、应急车道障碍物、施工锥桶、车道线虚实变化、汇入汇出车辆，为高速换道和跟车提供鲁棒输入
- **泊车辅助 APA/RPA**：近距离环视 BEV 感知同时检测泊车车位、地锁、立柱、低矮石墩、行人、儿童、消防栓，支持厘米级占用栅格表示，避免泊车剐蹭
- **无保护左转/环岛通行**：时空 BEV 融合多帧时序信息，稳定追踪被公交车遮挡的横穿行人和对向远距来车，其速度和轨迹预测比单帧感知精度高 30% 以上
- **夜间/雨天/逆光极端场景**：多传感器融合 BEV 把相机纹理特征、激光雷达几何特征、毫米波雷达速度特征互补结合，在单传感器完全失效的场景下仍能保持感知连续性
- **长尾障碍物检测**：Occupancy 占用栅格以稠密体素方式表示 3D 空间，不管是落石、抛洒物、翻车、施工架，只要占据空间就能被检测到，无需为每种障碍物单独定义类别

## 一句话概览（快速版）

1. **BEV 视角变换过程 = 环绕车身的 N 路 2D 相机图像经各自的 2D 骨干网络提取多尺度特征，再通过相机内外参建立 2D 像素到 3D 空间的投影关系，用 BEV 查询做交叉注意力或体素投影的方式，将多视角 2D 特征升维汇聚到统一的鸟瞰图 BEV 平面网格上**
2. **BEV 多任务前向过程 = 时序融合后的 BEV 特征图同时送入多个任务头：3D 检测头预测每个 BEV 网格上的物体类别、3D 框中心/尺寸/朝向/速度；分割头预测车道线/可行驶区域/人行横道等语义类别；占用头预测每个 BEV 柱或 3D 体素的占据概率**
3. **Occupancy 预测过程 = 将 3D 空间按固定分辨率（如 0.2m×0.2m×0.2m）离散成体素网格，BEV 特征经 3D 解码器预测每个体素的占据概率和语义类别，再叠加时序多帧预测生成平滑的 4D 时空占用场，供下游规划做碰撞检测和路径规划**

**核心结论**：BEV 是自动驾驶感知的"统一坐标系"，Transformer 注意力查询是实现端到端视角变换的核心机制，Occupancy 稠密体素表示是解决长尾障碍物和无定形障碍物的终极方案，三者结合构成了下一代 L3+ 智驾感知的技术底座。

## 核心拆解

### 🔑 BEVFormer：时空多相机 BEV 感知奠基之作

BEVFormer 由上海 AI Lab 于 2022 年提出，是第一个真正把 Transformer 范式在多相机 BEV 感知上跑通并取得压倒性精度优势的工作，几乎所有后续 BEV 感知方案（BEVDet4D、BEVHeight、SparseBEV、Cap3D 等）都可以看作它的变体或改进。它的整体架构可以拆成四个核心模块：图像特征提取、BEV 查询、空间交叉注意力、时间自注意力。

图像特征提取部分采用标准的 ResNet-101 或 VoVNet-99 作为骨干网络，对 6 路环视相机图像分别提取 1/16 和 1/32 两个分辨率的多尺度特征。核心创新在于**BEV 查询（BEV Queries）**的设计：BEV 平面被离散化为 H×W 个网格（通常 200×200，对应自车周围 100m×100m 范围，分辨率 0.5m/格），每个网格对应一个可学习的 Query Embedding 向量。在空间交叉注意力层，每个 BEV Query 通过相机内外参反投影回各自相机视图，只在对应的采样点区域和 2D 图像特征做交叉注意力——这样就避免了全局注意力的巨大计算量，同时建立起"BEV 网格 → 相机像素"的精确对应关系。时间自注意力层则引入了历史时刻的 BEV 特征，先通过自车运动补偿对齐到当前 BEV 坐标系，再让当前 BEV Query 与历史 BEV 特征做自注意力融合，从而获得时序上下文，解决单帧遮挡和远处小目标检测难题。

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision.models import resnet50

# 最小可运行 BEVFormer 风格多相机 BEV 感知网络：6 相机 → 2D 特征 → BEV 查询 → 3D 检测头

class SpatialCrossAttention(nn.Module):
    """
    简化版空间交叉注意力：给定 BEV 查询，基于相机投影矩阵在 2D 图像特征图上采样点做注意力
    实际 BEVFormer 用 Deformable Attention，这里为可读性用简化版可解释实现
    """
    def __init__(self, bev_dim=256, img_dim=256, num_heads=8, num_points_per_cam=4):
        super().__init__()
        self.num_heads = num_heads
        self.num_points = num_points_per_cam
        self.head_dim = bev_dim // num_heads
        self.q_proj = nn.Linear(bev_dim, bev_dim)
        self.kv_proj = nn.Conv2d(img_dim, bev_dim, 1)
        self.out_proj = nn.Linear(bev_dim, bev_dim)
        self.offset_mlp = nn.Sequential(
            nn.Linear(bev_dim + 3, 128),  # bev query + 3D 参考点坐标
            nn.ReLU(),
            nn.Linear(128, num_points_per_cam * 2)  # 每个相机 num_points 个采样偏移(x,y)
        )

    def forward(self, bev_queries, img_feats, cam_intrinsics, cam_extrinsics, bev_grid_3d):
        """
        bev_queries: (B, H_bev, W_bev, C)  可学习 BEV 查询
        img_feats:   (B, N_cam, C, H_img, W_img)  6 路相机 2D 特征
        cam_intrinsics: (B, N_cam, 3, 3)  相机内参
        cam_extrinsics: (B, N_cam, 4, 4)  相机外参 (T_world_to_cam)
        bev_grid_3d: (H_bev, W_bev, 3)  每个 BEV 网格中心的 3D 世界坐标
        """
        B, H_b, W_b, C = bev_queries.shape
        N_cam = img_feats.shape[1]
        device = bev_queries.device

        # 1. 将每个 BEV 网格的 3D 世界坐标投影到每个相机的 2D 像素坐标
        world_pts = bev_grid_3d.reshape(-1, 3).float()  # (H*W, 3)
        world_pts_h = torch.cat([world_pts, torch.ones(world_pts.shape[0], 1, device=device)], dim=-1)
        pixel_coords_all = []  # (N_cam, H*W, 2) 像素 u,v 坐标
        valid_mask_all = []    # (N_cam, H*W) 该 BEV 点是否在相机视野内
        for cam_i in range(N_cam):
            cam_points = world_pts_h @ cam_extrinsics[:, cam_i].transpose(1, 2)[0]  # (H*W, 4)
            cam_points = cam_points[:, :3] / cam_points[:, 2:3].clamp(min=1e-3)  # 投影到归一化平面
            pix_points = cam_points @ cam_intrinsics[:, cam_i].transpose(1, 2)[0]
            pix_uv = pix_points[:, :2] / pix_points[:, 2:3].clamp(min=1e-3)
            # 判断是否落在有效图像范围内（归一化 -1~1）
            H_img, W_img = img_feats.shape[3], img_feats.shape[4]
            u_norm = 2 * pix_uv[:, 0] / W_img - 1
            v_norm = 2 * pix_uv[:, 1] / H_img - 1
            valid = (u_norm.abs() < 0.95) & (v_norm.abs() < 0.95) & (cam_points[:, 2] > 0.1)
            pixel_coords_all.append(torch.stack([u_norm, v_norm], dim=-1))
            valid_mask_all.append(valid)
        pixel_coords = torch.stack(pixel_coords_all, dim=0)  # (N_cam, H*W, 2)
        valid_mask = torch.stack(valid_mask_all, dim=0)      # (N_cam, H*W)

        # 2. 对每个 BEV 查询+每个相机生成采样点偏移，采样多尺度特征（简化版：只取中心点）
        q_flat = bev_queries.reshape(B, -1, C)  # (B, H*W, C)
        ref_pts_expand = bev_grid_3d.reshape(1, -1, 3).expand(B, -1, -1)

        # 计算每个 BEV 点在每个相机的采样特征
        sampled_feats = torch.zeros(B, N_cam, H_b * W_b, C, device=device)
        for cam_i in range(N_cam):
            grid = pixel_coords[cam_i].view(1, H_b, W_b, 2)  # (1, H_b, W_b, 2)
            sampled = F.grid_sample(img_feats[0, cam_i].unsqueeze(0), grid, align_corners=True)
            sampled_feats[0, cam_i] = sampled.squeeze(0).reshape(C, -1).T
        # 用 valid mask 把视野外的置 0
        sampled_feats = sampled_feats * valid_mask.T.unsqueeze(-1).unsqueeze(0).float()

        # 3. 多相机特征聚合：沿相机维度加权求和（简化版直接 sum，实际用 attention 加权）
        fused = sampled_feats.sum(dim=1)  # (B, H*W, C)
        fused = fused / (valid_mask.sum(dim=0).unsqueeze(-1).unsqueeze(0).float().clamp(min=1))

        output = q_flat + self.out_proj(q_flat + fused)  # 残差连接
        return output.reshape(B, H_b, W_b, C)


class MinimalBEVFormer(nn.Module):
    def __init__(self, num_cams=6, bev_h=100, bev_w=100, bev_dim=256, num_classes=10):
        super().__init__()
        self.num_cams = num_cams
        self.bev_h, self.bev_w, self.bev_dim = bev_h, bev_w, bev_dim
        # 1. 2D 图像骨干（6 路相机共享权重）
        self.img_backbone = resnet50(pretrained=True)
        self.img_backbone.layer3 = nn.Identity()
        self.img_backbone.layer4 = nn.Identity()
        self.img_proj = nn.Conv2d(512, bev_dim, 1)  # ResNet50 layer2 out 512
        # 2. 可学习 BEV 查询
        self.bev_queries = nn.Parameter(torch.randn(1, bev_h, bev_w, bev_dim) * 0.02)
        # 3. 空间+时间注意力（简化版，只做空间交叉注意力）
        self.spatial_attn = SpatialCrossAttention(bev_dim, bev_dim)
        # 4. BEV 解码器 FFN
        self.bev_ffn = nn.Sequential(
            nn.Conv2d(bev_dim, bev_dim * 2, 3, padding=1), nn.ReLU(),
            nn.Conv2d(bev_dim * 2, bev_dim, 3, padding=1),
        )
        # 5. 3D 检测头（简化 CenterPoint 风格，每个 BEV 网格预测 heatmap+box+vel+yaw）
        self.detect_head = nn.Conv2d(bev_dim, num_classes + 2 + 3 + 2 + 1, 3, padding=1)
        # 6. 可行驶区域 + 车道线分割头
        self.seg_head = nn.Conv2d(bev_dim, 3, 3, padding=1)  # 0=背景，1=可行驶，2=车道线

        # 预计算每个 BEV 网格的 3D 世界坐标（单位 m，自车坐标系：x 前，y 左，z 上）
        bev_range = (-50.0, -50.0, 50.0, 50.0)  # (xmin, ymin, xmax, ymax) 自车周围 100m×100m
        xs = torch.linspace(bev_range[0], bev_range[2], bev_w)
        ys = torch.linspace(bev_range[3], bev_range[1], bev_h)  # 从上到下对应 y 减小
        grid_x, grid_y = torch.meshgrid(xs, ys, indexing='xy')
        grid_z = torch.zeros_like(grid_x) + 0.5  # BEV 取 0.5m 高度参考平面
        self.register_buffer('bev_grid_3d', torch.stack([grid_y, grid_x, grid_z], dim=-1))

    def forward(self, imgs, cam_intrinsics, cam_extrinsics):
        """
        imgs: (B, N_cam, 3, H_img, W_img)  6 路环视相机图像
        cam_intrinsics: (B, N_cam, 3, 3)
        cam_extrinsics: (B, N_cam, 4, 4)
        """
        B, Nc = imgs.shape[:2]
        # 1. 6 路相机共享权重提取 2D 特征
        img_flat = imgs.reshape(B * Nc, 3, imgs.shape[3], imgs.shape[4])
        feat_flat = self.img_backbone.layer2(self.img_backbone.layer1(self.img_backbone.maxpool(
            self.img_backbone.relu(self.img_backbone.bn1(self.img_backbone.conv1(img_flat))))))
        img_feats = self.img_proj(feat_flat).reshape(B, Nc, self.bev_dim, feat_flat.shape[2], feat_flat.shape[3])

        # 2. 空间交叉注意力：从 2D 特征升维到 BEV
        bev = self.bev_queries.expand(B, -1, -1, -1)
        bev = self.spatial_attn(bev, img_feats, cam_intrinsics, cam_extrinsics, self.bev_grid_3d)
        bev = bev.permute(0, 3, 1, 2).contiguous()  # 到 B,C,H,W
        bev = bev + self.bev_ffn(bev)  # FFN 残差

        # 3. 多任务头同时输出
        detect_out = self.detect_head(bev)  # (B, cls+2+3+2+1, H_b, W_b)
        seg_out = self.seg_head(bev)        # (B, 3, H_b, W_b)
        return {
            'bev_feat': bev,
            'detect_heatmap': detect_out[:, :10],  # 10 类 heatmap
            'detect_xy': detect_out[:, 10:12],
            'detect_whl': detect_out[:, 12:15],
            'detect_vel': detect_out[:, 15:17],
            'detect_yaw': detect_out[:, 17:18],
            'seg_mask': seg_out,
        }

# === 多任务联合训练示例 ===
model = MinimalBEVFormer(bev_h=100, bev_w=100, num_classes=10).cuda()
optimizer = torch.optim.AdamW(model.parameters(), lr=2e-4, weight_decay=1e-4)
# 模拟输入：B=1，6 路相机，3×736×1280 图像，100m×100m BEV 范围
imgs = torch.randn(1, 6, 3, 736, 1280).cuda()
intri = torch.eye(3).view(1, 1, 3, 3).expand(1, 6, -1, -1).cuda() * 500
intri[:, :, 0, 2] = 640; intri[:, :, 1, 2] = 368
extri = torch.eye(4).view(1, 1, 4, 4).expand(1, 6, -1, -1).cuda()  # 简化：相机与自车坐标系重合

outputs = model(imgs, intri, extri)
# 多任务损失：检测 Focal Loss + 分割 CE Loss，按权重相加
loss_detect = F.binary_cross_entropy_with_logits(outputs['detect_heatmap'], gt_heatmap)
loss_xy = F.l1_loss(outputs['detect_xy'], gt_xy)
loss_whl = F.l1_loss(outputs['detect_whl'], gt_whl)
loss_seg = F.cross_entropy(outputs['seg_mask'], gt_seg.long())
total_loss = 1.0 * loss_detect + 0.5 * loss_xy + 0.3 * loss_whl + 1.0 * loss_seg
total_loss.backward()
optimizer.step()

# 参数解释：
# bev_h=100, bev_w=100 对应 100m×100m 范围，0.5m/格分辨率：城市 NOA 推荐 0.25m 精度
# 各任务损失权重：检测任务优先（heatmap 权重最大），分割任务与检测同量级
# 0.5m 高度的 BEV 参考平面：适用于常规车辆行人，卡车等超高目标需要多平面或 3D 体素
# 输出说明：nuScenes 验证集 NDS>0.68、mAP>0.5 即达到业界纯视觉方案中上水平
```

### 🔑 Occupancy 占用栅格：从稀疏框到稠密 3D 空间表示

Occupancy 占用栅格任务是 2023 年以来自动驾驶感知领域最火的方向，它的提出源于一个很朴素的洞察：**下游规划模块其实根本不关心"障碍物是车还是箱子"，它只关心"这块空间能不能开过去"**。传统的 3D 检测只能输出预定义类别的稀疏框，对于路上的纸箱、翻倒的三轮车、施工路障、掉落的家具、异形车辆这些长尾样本几乎必漏。而 Occupancy 把感知任务从"分类+回归框"改成了"稠密体素二分类"：把 3D 空间按 0.2m×0.2m×0.2m 切分成几百万个体素，每个体素只要预测"被占据 / 空闲"二值（加上可选的语义类别），不管什么形状什么类别，只要在空间里占据了体积就会被检测到。

典型的 Occupancy 预测范式可以分为三类。第一类是从 3D 点云直接预测，也就是传统的激光雷达 Occupancy Mapping，把多帧点云累加后做滤波去噪直接得到体素占据概率，优点是几何精度高，缺点是没有语义信息且静态，无法预测未来占用。第二类是从多相机图像经 2D → 3D 投影到体素特征，再用 3D UNet 解码器预测体素占据，代表工作有 OccNet、SurroundOcc、OpenOccupancy 等。第三类是 BEV 特征升维，把 2D BEV 柱体特征通过 3D 反卷积或注意力上采样到 3D 体素网格，再预测 Occupancy，代表工作有 SparseOcc、FB-Occ 等。特斯拉 HW4 方案明确采用了基于 Occupancy 的稠密感知，这进一步推动了行业对该方向的投入。

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

# 最小可运行 Occupancy 预测网络：BEV 特征 → 3D 体素特征 → 占据概率 + 语义类别

class Occupancy3DHead(nn.Module):
    """
    OccNet 风格的轻量 3D Occupancy 预测头
    输入：2D BEV 特征 (B, C, H_b, W_b)
    输出：3D 体素占据 (B, 1, X, Y, Z) + 语义 (B, N_cls, X, Y, Z)
    """
    def __init__(self, bev_c=256, occ_dim=64, grid_size=(200, 200, 16), num_sem_cls=16):
        """grid_size=(X,Y,Z) = (前向, 左右, 上下) 体素分辨率，默认 0.5m×0.5m×0.5m = 100m×100m×8m"""
        super().__init__()
        X, Y, Z = grid_size
        self.grid_size = grid_size
        # 第一步：先把 BEV 2D 特征映射到 3D 柱体特征 (B, C, X, Y, 1)，再沿 Z 上采样到 Z 层
        self.pillar_proj = nn.Sequential(
            nn.Conv2d(bev_c, occ_dim * 2, 3, padding=1), nn.BatchNorm2d(occ_dim * 2), nn.ReLU(),
            nn.Conv2d(occ_dim * 2, occ_dim, 3, padding=1),
        )
        # 第二步：3D UNet 编码器 + 解码器（多层 3D 卷积 + 残差块 + 上采样）
        self.enc_block1 = self._make_3d_block(occ_dim, occ_dim)
        self.enc_block2 = self._make_3d_block(occ_dim, occ_dim * 2, stride=2)
        self.enc_block3 = self._make_3d_block(occ_dim * 2, occ_dim * 4, stride=2)
        self.dec_block3 = nn.ConvTranspose3d(occ_dim * 4, occ_dim * 2, 2, stride=2)
        self.dec_block2 = nn.Sequential(
            self._make_3d_block(occ_dim * 4, occ_dim * 2),
            nn.ConvTranspose3d(occ_dim * 2, occ_dim, 2, stride=2),
        )
        self.dec_block1 = self._make_3d_block(occ_dim * 2, occ_dim)
        # 输出头：占据二分类 + 语义多分类
        self.occ_head = nn.Conv3d(occ_dim, 1, 1)
        self.sem_head = nn.Conv3d(occ_dim, num_sem_cls, 1)
        # 为了沿 Z 维上采样：先沿最后一维补维度，再插值
        self.z_upsample = nn.Upsample(size=grid_size, mode='trilinear', align_corners=True)

    @staticmethod
    def _make_3d_block(in_c, out_c, stride=1):
        mid_c = min(in_c, out_c)
        return nn.Sequential(
            nn.Conv3d(in_c, mid_c, 3, stride=stride, padding=1),
            nn.BatchNorm3d(mid_c), nn.ReLU(),
            nn.Conv3d(mid_c, out_c, 3, padding=1),
            nn.BatchNorm3d(out_c), nn.ReLU(),
        )

    def forward(self, bev_feat):
        """
        bev_feat: (B, C_bev, H_b, W_b)
        """
        B, C, H_b, W_b = bev_feat.shape
        X, Y, Z = self.grid_size
        # 1. BEV 特征 → 3D 柱体（初始 Z 维度=1）
        pillar = self.pillar_proj(bev_feat)  # (B, occ_dim, H_b, W_b)
        pillar_3d = pillar.unsqueeze(-1)     # (B, occ_dim, H_b, W_b, 1)
        # 2. 沿 Z 维上采样扩展到目标 grid_size，同时把 H_b W_b 对齐到 X Y
        voxel_feat = self.z_upsample(pillar_3d.permute(0, 1, 3, 2, 4))  # (B, occ_dim, Y, H_b, 1) → upsample
        # 3. 3D UNet 编码解码
        e1 = self.enc_block1(voxel_feat)      # (B, occ_dim, Y, X, Z)
        e2 = self.enc_block2(e1)
        e3 = self.enc_block3(e2)
        d3 = self.dec_block3(e3)              # 上采样 + 跳连接
        d2 = self.dec_block2(torch.cat([d3, F.interpolate(e2, d3.shape[2:])], dim=1))
        d1 = self.dec_block1(torch.cat([d2, F.interpolate(e1, d2.shape[2:])], dim=1))
        # 4. 双分支输出
        occ_logits = self.occ_head(d1)        # (B, 1, X, Y, Z)
        sem_logits = self.sem_head(d1)        # (B, num_sem_cls, X, Y, Z)
        return occ_logits, sem_logits


class TemporalOccAggregator(nn.Module):
    """
    时序 Occupancy 聚合：把多帧预测按自车运动补偿对齐，贝叶斯融合生成平滑占用场
    核心：Occupancy 预测的是当前帧的"瞬间占用"，真实世界是静态的，时序融合可以极大降低单帧噪点
    """
    def __init__(self, grid_size=(200, 200, 16), voxel_size=0.5, max_history=8):
        super().__init__()
        self.grid_size = grid_size
        self.voxel_size = voxel_size
        self.max_history = max_history
        self.history_voxel = None
        self.history_pose = None

    def reset(self):
        self.history_voxel = None
        self.history_pose = None

    def update(self, occ_prob, curr_pose):
        """
        occ_prob: (1, X, Y, Z)  当前帧体素占据概率 [0,1]，经 sigmoid 输出
        curr_pose: (4, 4)  当前帧自车位姿 T_world_to_ego
        """
        occ_prob = occ_prob.detach()
        if self.history_voxel is None:
            self.history_voxel = occ_prob.clone()
            self.history_pose = [curr_pose.clone()]
            return occ_prob.clone()

        # 1. 将历史所有体素按位姿差变换到当前自车坐标系（简化版：只做 X/Y 平面平移+旋转）
        X, Y, Z = self.grid_size
        world_grid_xyz = self._get_world_grid().reshape(3, -1)  # (3, X*Y*Z) 历史坐标系的世界坐标
        T_curr_to_prev = torch.inverse(curr_pose) @ self.history_pose[-1]  # 当前到上一帧的变换
        rot, trans = T_curr_to_prev[:3, :3], T_curr_to_prev[:3, 3]
        transformed = rot @ world_grid_xyz + trans.unsqueeze(1)
        # 转换到当前的局部网格索引
        center = torch.tensor([X//2, Y//2, Z//2], dtype=torch.float32)
        idx = (transformed / self.voxel_size + center.unsqueeze(1)).round().long()
        # 边界裁剪 + grid_sample 重新采样（简化：clip 到范围内，最近邻赋值）
        idx[0].clamp_(0, X - 1); idx[1].clamp_(0, Y - 1); idx[2].clamp_(0, Z - 1)
        warped = torch.zeros_like(occ_prob)
        warped_flat = warped.reshape(-1)
        src_flat = self.history_voxel.reshape(-1)
        target_flat = idx[0] * Y * Z + idx[1] * Z + idx[2]
        warped_flat.scatter_reduce_(0, target_flat, src_flat, reduce='mean', include_self=False)

        # 2. 贝叶斯融合：p = (p1*p2) / (p1*p2 + (1-p1)*(1-p2))
        # 简化版：指数滑动平均 EMA，α=0.3 保留 3~4 帧历史
        alpha = 0.35
        fused = (1 - alpha) * warped + alpha * occ_prob
        # 3. 加入历史队列，超过 max_history 则丢弃最老
        self.history_voxel = fused.clone()
        self.history_pose.append(curr_pose.clone())
        if len(self.history_pose) > self.max_history:
            self.history_pose.pop(0)
        return fused

    def _get_world_grid(self):
        X, Y, Z = self.grid_size
        xs = torch.arange(X) - X // 2
        ys = torch.arange(Y) - Y // 2
        zs = torch.arange(Z) - Z // 2
        gx, gy, gz = torch.meshgrid(xs, ys, zs, indexing='ij')
        return torch.stack([gx, gy, gz], dim=0).float() * self.voxel_size


# === Occupancy 训练 + 可视化示例 ===
# 1. 先有 BEV 特征（来自上面的 MinimalBEVFormer 或其他 BEV 模型）
bev_feat = torch.randn(2, 256, 100, 100).cuda()
occ_head = Occupancy3DHead(bev_c=256, occ_dim=64, grid_size=(200, 200, 16), num_sem_cls=16).cuda()
occ_logits, sem_logits = occ_head(bev_feat)  # (B, 1, 200, 200, 16), (B, 16, 200, 200, 16)
# 2. 损失函数：占据二分类用带权重的 BCE（空闲类 >> 占据类，约 100:1）
gt_occ = torch.randint(0, 2, (2, 1, 200, 200, 16)).cuda().float()
gt_sem = torch.randint(0, 16, (2, 200, 200, 16)).cuda().long()
pos_weight = torch.tensor([99.0], device='cuda')  # 占据类像素少，正样本加权
loss_occ = F.binary_cross_entropy_with_logits(occ_logits, gt_occ, pos_weight=pos_weight)
loss_sem = F.cross_entropy(sem_logits, gt_sem)
total_loss = loss_occ + 0.5 * loss_sem
print(f"Occ Loss={loss_occ.item():.4f}, Sem Loss={loss_sem.item():.4f}")
# 3. 推理：Sigmoid 得到占据概率，阈值 0.5 得到二值体素
occ_prob = torch.sigmoid(occ_logits[0, 0])  # (200, 200, 16)
occ_binary = (occ_prob > 0.5).cpu().numpy()
print(f"占据体素数量: {occ_binary.sum()} / {occ_binary.size} (free/occ 比 ≈ 99:1)")
# 参数解释：
# grid_size=(200, 200, 16) + voxel_size=0.5m → 100m×100m×8m 感知范围，泊车场景可设 0.2m 精度
# pos_weight=99: 典型场景 99% 体素都是空闲，不加权模型会学成全 0 输出
# max_history=8: 5 FPS 感知频率下融合约 1.5 秒历史，平衡稳定性和动态障碍物响应速度
# 输出说明：Occupancy 精度常用 F-Score@0.5 度量，Semantic Occupancy 用 mIoU，主流方案 F-Score>0.75
```

## 常见误区或注意事项

1. **"BEV 感知只要把 6 路相机的 2D 检测结果通过 IPM 投到底面就行，不用大模型" → 这是过去的 BEV 后融合方案，精度比端到端 BEVFormer 低 20% 以上**。IPM 逆透视变换有一个致命假设：所有被投影的物体都在地面上，一旦目标有高度（比如一个两米高的行人或五米高的卡车），IPM 投影就会出现严重的位置偏移，越远偏移越大。正确做法是用深度估计或注意力查询的方式考虑目标高度信息，从根本上解决"地面假设"带来的投影误差。

2. **"BEV 感知只需要单帧输入就行，多帧融合太慢没必要" → 单帧 BEV 在遮挡场景的漏检率是时序 BEV 的 3~5 倍**。真实城市路口场景中，大型公交车或货车旁边的行人/小车 80% 以上时间处于部分或完全遮挡状态，只靠单帧感知必然漏检。正确做法是至少融合 4~~8 帧历史 BEV 特征（约 1~~2 秒），通过历史积累信息补全当前帧被遮挡的目标，远处小目标的召回率也会显著提升。

3. **"Occupancy 可以完全替代 3D 检测，以后不需要检测框了" → 现阶段 Occupancy 还是 3D 检测的补充而不是替代**。稠密体素的空间精度目前还达不到稀疏框的水平（典型 Occupancy F-Score 0.75，3D 框 IoU>0.5 的精度更高），且无法直接输出物体速度、轨迹朝向等属性，这些对于预测模块是必须的。正确做法是 3D 检测 + Occupancy 双输出并行：检测头提供预定义类别的精确位置和运动信息，Occupancy 头覆盖长尾/无定形障碍物，两者信息一起送到规划模块。

4. **"多任务学习就是把所有任务头的损失加起来一起训，不用管权重怎么设" → 任务权重设置不对会导致某个任务完全学不好**。比如把 3D 检测和车道线分割的损失权重设成 1:1，车道线分割的损失值通常比检测大 10 倍以上，模型全部容量被分割任务占满，检测效果惨不忍睹。正确做法是：先单独训每个任务得到各自的 baseline 损失量级，然后按"最终损失值在同一个量级（~1 左右）"反算权重；或者采用 Uncertainty Weighting 等自适应权重算法，让模型自动学习每个任务的权重。

5. **"激光雷达感知一定比纯视觉 BEV 强，上激光雷达就高枕无忧" → 激光雷达也有自己的盲区和弱点，多传感器融合才是终极方案**。纯激光雷达在雨天、雾天激光束被水滴散射后点云质量急剧下降；对于塑料路障、轻薄的轮胎、黑色吸光材质的障碍物点云反射率极低容易漏；50 米外的点云密度变得非常稀疏，小目标难以检测。正确做法是相机+激光雷达+毫米波雷达三模态前融合，相机负责纹理和语义、激光负责几何和深度、毫米波负责速度和恶劣天气鲁棒性，三者信息在 BEV 特征层面融合，而不是输出结果层面后融合。
