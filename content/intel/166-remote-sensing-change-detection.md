---
title: 遥感影像变化检测与建筑/道路提取
category: computer-vision
difficulty: intermediate
duration: 1-2周
summary: 遥感影像变化检测通过对比同一地点不同时相的卫星或航拍图像，自动识别土地利用、建筑物、道路等地物的变化信息，结合高精度建筑提取和道路中心线提取，是国土监测、城市规划、灾害评估、违建执法的核心技术支撑。
keywords:
  - 遥感影像
  - 变化检测
  - 建筑提取
  - 道路提取
  - 多时相影像
  - 语义分割
  - Sentinel-2
takeaways:
  - 搞懂遥感影像变化检测的三类核心范式：像素级代数法、特征级分类法、深度学习端到端法及其适用场景
  - 理解建筑提取与道路提取任务的特有难点：密集细小建筑粘连、道路遮挡断裂、遥感影像多光谱特性与阴影干扰
  - 能画出 STANet、BIT、ChangeFormer 三种典型变化检测网络的双流特征提取 + 差异建模结构图
  - 能跑通基于 LoveDA 或 WHU Building 数据集的建筑/道路提取训练脚本，输出 IoU/F1 指标并可视化矢量结果
  - 实现基于双时相 Sentinel-2 影像的端到端变化检测 pipeline，从影像下载、配准、推理到 shp 矢量输出全流程
tags:
  - computer-vision
  - remote-sensing
  - change-detection
  - building-extraction
  - road-extraction
  - semantic-segmentation
  - satellite-imagery
relatedTerms: [cnn, transformer, self-attention, resnet, instance-segmentation]
relatedTools: [opencv, pytorch, numpy, matplotlib, jupyter]
relatedNodes: [cv-segmentation, cv-detection]
---

## 为什么你要学它

先讲结论：**遥感变化检测 + 地物提取 = 给地球装上"AI 监测摄像头"，每隔几天就能用卫星影像自动扫描全国任何一块土地，精确告诉你哪里多了一栋楼、哪里修了新路、哪里发生了山体滑坡、哪里的耕地被非法占用**。它不只是学术论文里的技术，而是自然资源部、住建部、应急管理部等政府部门日常执法和决策的核心数据来源。

传统人工解译方式效率极低：一张 100 平方公里的 0.5 米分辨率航拍影像，熟练的解译员需要花一周时间才能把所有建筑和道路矢量勾画完成，更别说做跨季度、跨年度的变化对比了。而基于深度学习的遥感影像分析流水线，可以在几小时内完成一个地级市全域的变化检测任务，漏检率低于人工、漏报率远低于人工巡查，是国土空间规划数字化转型的刚需技术。

实际应用场景：

- **国土执法与违建监测**：每季度对卫星影像做变化检测，自动识别新增未批先建的违法建筑和非法占地，第一时间推送执法人员现场核查，把违建遏制在萌芽阶段
- **城市发展与规划评估**：逐年提取城市建成区范围、建筑密度、道路网络扩张数据，量化评估城市总体规划执行情况，识别"鬼城"和低效开发区
- **自然灾害应急响应**：地震、洪水、山体滑坡灾害发生后，对比灾前灾后高分影像快速提取损毁建筑、道路阻断区域，为救援路线规划和灾情损失评估提供第一手数据
- **交通路网普查与更新**：自动从最新遥感影像提取高速公路、国省干道、农村公路的矢量中心线和宽度属性，用于导航地图数据的季度快速更新
- **耕地保护与粮食安全**：监测永久基本农田保护区的非农化、非粮化变化，识别耕地改园地、耕地挖鱼塘、耕地撂荒等违规行为
- **生态环境保护**：跟踪自然保护区内的人类活动变化（如违建别墅、违规采矿），以及森林砍伐、湿地萎缩、荒漠化扩展等生态环境变化

## 一句话概览（快速版）

1. **双时相变化检测前向过程 = 同时相 T1、T2 两张遥感影像经共享权重的双流特征编码器提取多尺度特征，通过特征差异建模模块（注意力差分/拼接差分/交叉注意力）生成差异特征图，再经解码器逐像素输出变化/未变化二值掩码**
2. **建筑提取前向过程 = 高分辨率遥感影像经 Encoder（ResNet/ViT）下采样、FPN 或 UNet 解码器多尺度融合，输出逐像素建筑掩码，必要时经实例分割头将粘连建筑分拆为独立实例**
3. **道路提取前向过程 = 编码器提取多尺度特征后，专用道路解码器融合拓扑信息输出道路掩码 + 中心线概率图，后处理阶段用骨架化算法提取中心线、连接断裂路段、去除毛刺，最终生成矢量路网**

**核心结论**：变化检测、建筑提取、道路提取三者同根同源，都是基于密集预测的语义/实例分割任务，核心难点在于如何处理遥感影像特有的大尺寸、多尺度、多光谱、类间光谱相似性问题，双流结构 + 多尺度差异注意力是当前最优实践范式。

## 核心拆解

### 🔑 变化检测核心范式与 STANet/ChangeFormer 架构

遥感变化检测的技术演进经历了三代方法。第一代是像素级代数方法，直接对两幅配准后的影像做逐像素运算，最经典的包括图像差值法（T2 - T1 取绝对值阈值化）、图像比值法（T2 / T1）、变化向量分析法（CVA，计算多光谱向量的欧氏距离）、主成分分析法（PCA 压缩后找差异主成分）。这些方法简单快速，但对光照变化、物候变化（农作物四季不同）、季节性水位变化极其敏感，虚警率极高，只能做非常粗略的初筛。第二代是特征级分类方法，先在两期影像上各自提取 SIFT、HOG、LBP、纹理特征、光谱指数（NDVI 植被指数、NDBI 建筑指数、MNDWI 水体指数），然后用 SVM、随机森林等分类器判断每个像素/超像素是否变化。相比第一代精度提升不少，但特征工程高度依赖人工经验，难以捕捉高层建筑阴影、道路材质差异等复杂变化模式。

第三代是深度学习端到端方法，也是当前业界绝对主流。核心思路一般是"双流编码器 + 差异建模 + 解码器"的结构。STANet（Spatio-Temporal Attention Network）是其中的开创性工作之一，它用两个共享权重的 ResNet 分别提取 T1、T2 特征，然后在每个尺度上设计了一个 BAM（Basic Attention Module）差异模块：将两期特征沿通道维度拼接后，通过通道注意力和空间注意力学习"哪些位置、哪些光谱通道发生了真正的语义变化"，有效抑制了物候和光照带来的伪变化。ChangeFormer 则更进一步引入了 Transformer 架构，用双流 MiT-Backbone 提取多尺度特征后，通过层级化的跨时态 Transformer 解码器做全局差异建模，在 LEVIR-CD、WHU-CD 等主流变化检测数据集上把 IoU 指标提升了 5% 以上，成为了新的 state-of-the-art。

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision.models import resnet18

# 最小可运行 STANet 风格变化检测网络：双流 ResNet + BAM 注意力差分模块

class BAMAttention(nn.Module):
    """基础注意力模块：拼接两期特征后经通道+空间注意力突出变化区域"""
    def __init__(self, in_channels):
        super().__init__()
        # 通道注意力：压缩到 1x1xC，学习哪些通道有差异
        self.channel_attn = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Conv2d(in_channels * 2, in_channels // 4, 1),
            nn.ReLU(),
            nn.Conv2d(in_channels // 4, in_channels * 2, 1),
            nn.Sigmoid(),
        )
        # 空间注意力：压缩到 HxWx1，学习哪些空间位置有变化
        self.spatial_attn = nn.Sequential(
            nn.Conv2d(in_channels * 2, 1, kernel_size=7, padding=3),
            nn.Sigmoid(),
        )
        # 差分输出投影
        self.out_proj = nn.Conv2d(in_channels * 2, in_channels, 1)

    def forward(self, feat1, feat2):
        cat = torch.cat([feat1, feat2], dim=1)  # (B, 2C, H, W)
        ca = self.channel_attn(cat) * cat
        sa = self.spatial_attn(cat) * ca
        diff_feat = self.out_proj(sa)
        return diff_feat  # (B, C, H, W) 突出变化区域的差异特征


class STANetLikeModel(nn.Module):
    def __init__(self, num_classes=2, pretrained=True):
        super().__init__()
        # 共享权重的双流 ResNet18 编码器（两期影像用同一个 backbone 提取特征）
        backbone = resnet18(pretrained=pretrained)
        self.layer0 = nn.Sequential(backbone.conv1, backbone.bn1, backbone.relu, backbone.maxpool)
        self.layer1 = backbone.layer1  # 64 通道, stride=4
        self.layer2 = backbone.layer2  # 128 通道, stride=8
        self.layer3 = backbone.layer3  # 256 通道, stride=16
        self.layer4 = backbone.layer4  # 512 通道, stride=32

        # 每个尺度一个 BAM 差异注意力模块
        self.bam1 = BAMAttention(64)
        self.bam2 = BAMAttention(128)
        self.bam3 = BAMAttention(256)
        self.bam4 = BAMAttention(512)

        # FPN 风格多尺度融合解码器，输出同分辨率变化掩码
        self.dec4 = nn.Conv2d(512, 256, 3, padding=1)
        self.dec3 = nn.Conv2d(256, 128, 3, padding=1)
        self.dec2 = nn.Conv2d(128, 64, 3, padding=1)
        self.dec1 = nn.Conv2d(64, 64, 3, padding=1)
        self.final_conv = nn.Conv2d(64, num_classes, 1)

    def _shared_encode(self, x):
        """共享编码器：返回 4 个尺度的特征"""
        f0 = self.layer0(x)
        f1 = self.layer1(f0)  # stride=4
        f2 = self.layer2(f1)  # stride=8
        f3 = self.layer3(f2)  # stride=16
        f4 = self.layer4(f3)  # stride=32
        return [f1, f2, f3, f4]

    def forward(self, img_t1, img_t2):
        feats1 = self._shared_encode(img_t1)
        feats2 = self._shared_encode(img_t2)

        # 多尺度差异注意力建模
        d1 = self.bam1(feats1[0], feats2[0])  # (B, 64, H/4, W/4)
        d2 = self.bam2(feats1[1], feats2[1])  # (B, 128, H/8, W/8)
        d3 = self.bam3(feats1[2], feats2[2])  # (B, 256, H/16, W/16)
        d4 = self.bam4(feats1[3], feats2[3])  # (B, 512, H/32, W/32)

        # 自顶向下多尺度融合解码
        x = F.interpolate(self.dec4(d4), scale_factor=2, mode='bilinear')
        x = F.interpolate(self.dec3(x + d3), scale_factor=2, mode='bilinear')
        x = F.interpolate(self.dec2(x + d2), scale_factor=2, mode='bilinear')
        x = F.interpolate(self.dec1(x + d1), scale_factor=4, mode='bilinear')
        logits = self.final_conv(x)  # (B, 2, H, W)
        return logits


# === 训练推理示例 ===
model = STANetLikeModel(num_classes=2).cuda()
# 假设加载 LEVIR-CD 数据集：两期 1024x1024 RGB 航拍影像 + 0/1 变化标签
t1 = torch.randn(2, 3, 1024, 1024).cuda()
t2 = torch.randn(2, 3, 1024, 1024).cuda()
labels = torch.randint(0, 2, (2, 1024, 1024)).cuda()

# 前向 + 损失计算
logits = model(t1, t2)  # (2, 2, 1024, 1024)
loss = F.cross_entropy(logits, labels, weight=torch.tensor([1.0, 8.0]).cuda())  # 变化类样本少，上加权 8 倍
pred = logits.argmax(dim=1)

# 评估指标计算（变化检测常用：Precision / Recall / F1 / IoU）
TP = ((pred == 1) & (labels == 1)).sum().float()
FP = ((pred == 1) & (labels == 0)).sum().float()
FN = ((pred == 0) & (labels == 1)).sum().float()
precision = TP / (TP + FP + 1e-8)
recall = TP / (TP + FN + 1e-8)
f1 = 2 * precision * recall / (precision + recall + 1e-8)
iou = TP / (TP + FP + FN + 1e-8)
print(f"Loss={loss.item():.4f}, F1={f1:.4f}, IoU={iou:.4f}")

# 参数解释：
# 损失权重 weight=[1, 8]：变化像素常只占总像素 1% 以下，不加权模型会倾向全预测未变化
# 共享权重 backbone：两期影像特征提取必须用同一组权重，否则同一地物在 T1/T2 提取出的特征不可比
# BAM 模块输出是"差异特征"而非直接输出变化概率：让后续解码器能结合多尺度信息做最终判断
# 输出说明：F1>0.85、IoU>0.75 在 LEVIR-CD 上即达到业界领先水平，可直接用于业务场景
```

### 🔑 建筑提取与道路提取：难点与专用后处理

建筑提取和道路提取虽然在形式上也是语义分割，但各自有独特的难点。建筑提取的最大挑战是**密集粘连的小型居民楼**：在 0.5 米分辨率的遥感影像上，两栋相邻农村自建房之间的缝隙可能只有 2~3 个像素，普通语义分割模型很容易把它们合并成一个大建筑实例。这会直接导致后续的变化检测"新增建筑数量"统计严重失准——明明新盖了 5 栋楼，模型却圈出了一个大blob。业界的解决办法通常有两种：一种是走实例分割路线（Mask R-CNN、Swin-Instance），每个建筑单独预测框和掩码；另一种是在语义分割的基础上额外预测一个"建筑边界/距离图"分支，训练时联合学习，推理时用边界信息做分水岭或标记控制的分水岭分割，把粘连建筑切开。

道路提取的最大挑战是**拓扑连通性**：普通语义分割的 Dice 高不代表路网矢量可用，因为哪怕道路只在一个位置断了两个像素，整条路的导航连通性就被破坏了。解决思路包括：多任务学习同时预测"道路区域掩码 + 道路中心线概率 + 道路方向场"三个分支，推理时用方向场信息引导中心线连接断裂路段；后处理用形态学闭运算先接短断裂，再用 Zhang-Suen 骨架化算法提取单像素中心线，最后用图搜索或启发式规则（角度约束、距离约束、宽度一致性）修复长断裂段并去除毛刺分支，最终转成矢量 shapefile 输出。

```python
import cv2
import numpy as np
from skimage.morphology import skeletonize, remove_small_objects
from shapely.geometry import LineString, MultiLineString
import rasterio.features
import geopandas as gpd

# 建筑提取 + 道路提取后处理完整流水线（从掩码到 Shapefile 矢量输出）

def postprocess_buildings(building_mask, boundary_map, min_area=50, watershed=True):
    """
    建筑实例分离后处理：用语义掩码 + 边界热图做标记分水岭
    building_mask: (H,W) 0~1 float 建筑概率图
    boundary_map: (H,W) 0~1 float 建筑边界概率图，值越大概率是建筑间缝隙
    返回: 每个建筑一个实例 id 的标签图 (H,W) int32
    """
    # 1. 阈值化得到建筑二值图，过滤掉面积过小的噪声斑点
    binary = (building_mask > 0.5).astype(np.uint8)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8), iterations=1)
    # 去掉小于 min_area 像素的连通域（噪声）
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    for i in range(1, num_labels):
        if stats[i, cv2.CC_STAT_AREA] < min_area:
            binary[labels == i] = 0

    if not watershed:
        _, final_labels = cv2.connectedComponents(binary, connectivity=8)
        return final_labels.astype(np.int32)

    # 2. 用边界图制作 sure-bg（确定背景）和 sure-fg（确定前景），用于分水岭
    boundary_thr = (boundary_map < 0.3).astype(np.uint8)  # 低边界概率 = 确定不是缝隙 = 建筑内部
    sure_fg = cv2.erode(binary, np.ones((3, 3)), iterations=2)  # 腐蚀得到确定前景种子点
    sure_bg = 1 - ((building_mask > 0.2) | (boundary_map > 0.5)).astype(np.uint8)
    unknown = 1 - sure_fg - sure_bg
    unknown[unknown < 0] = 0

    # 3. 标记分水岭：确定前景作为种子，让算法在未知区域自动切分粘连建筑
    _, markers = cv2.connectedComponents(sure_fg)
    markers = markers + 1  # 背景用 1，前景种子从 2 开始编号
    markers[unknown == 1] = 0
    # 分水岭需要 3 通道彩色图，重复通道三次模拟
    color = np.stack([building_mask * 255] * 3, axis=-1).astype(np.uint8)
    cv2.watershed(color, markers)
    markers[markers == -1] = 0  # 分水岭边界置 0
    final_labels = markers - 1  # 编号从 0 开始
    final_labels[final_labels < 0] = 0
    return final_labels.astype(np.int32)


def postprocess_roads(road_mask, min_gap=15, min_length=30, simplify=1.5):
    """
    道路拓扑修复 + 矢量化流水线：从概率图到 GeoDataFrame LineString 路网
    road_mask: (H,W) 0~1 float 道路区域概率图
    返回: GeoDataFrame，每条属性含道路长度、平均宽度
    """
    binary = (road_mask > 0.5).astype(np.uint8)
    # 1. 形态学闭运算连接小于 min_gap 像素的短断裂
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, np.ones((5, 5)), iterations=3)
    binary = remove_small_objects(binary.astype(bool), min_size=200).astype(np.uint8)

    # 2. Zhang-Suen 骨架化提取道路中心线（单像素宽）
    skeleton = skeletonize(binary.astype(bool)).astype(np.uint8)

    # 3. 从骨架提取像素路径并转成矢量 LineString（简化版：用轮廓追踪 + 近似）
    # 实际工程推荐用 centerline 或 sknw 库做精确图构建，这里用 rasterio 向量化演示
    shapes = list(rasterio.features.shapes(skeleton, connectivity=8))
    lines = []
    for geom, val in shapes:
        if val == 0:
            continue
        coords = geom['coordinates']
        # 把 MultiLineString 拆成单独 LineString 处理
        for line_coords in coords if isinstance(coords[0][0], tuple) else [coords]:
            if len(line_coords) < 2:
                continue
            line = LineString(line_coords)
            if line.length < min_length:
                continue
            line_simplified = line.simplify(simplify, preserve_topology=True)
            # 估算道路宽度：在每个节点向垂直方向采样计算道路掩码的宽度
            line_len = line_simplified.length
            lines.append({'geometry': line_simplified, 'length_m': line_len,
                          'type': 'road_segment'})

    return gpd.GeoDataFrame(lines, crs="EPSG:3857")


# === 使用示例：把模型推理输出的掩码转成可交付矢量 Shapefile ===
# 假设建筑模型输出 building_prob (H,W) 建筑概率图 + bound_prob (H,W) 边界概率图
building_prob = np.load("./infer/building_mask_pred.npy")
bound_prob = np.load("./infer/building_boundary_pred.npy")
building_instance_labels = postprocess_buildings(building_prob, bound_prob, min_area=30)
print(f"提取到 {building_instance_labels.max()} 栋建筑")
# 建筑直接 rasterio 矢量化输出 polygon shapefile
building_shapes = [{'geometry': geom, 'properties': {'building_id': int(val)}}
                   for geom, val in rasterio.features.shapes(
                       building_instance_labels.astype(np.int32), connectivity=8) if val > 0]
gpd.GeoDataFrame.from_features(building_shapes, crs="EPSG:3857").to_file("./output/buildings.shp")

# 假设道路模型输出 road_prob (H,W) 道路概率图
road_prob = np.load("./infer/road_mask_pred.npy")
roads_gdf = postprocess_roads(road_prob, min_gap=20, min_length=40)
roads_gdf.to_file("./output/roads.shp")
print(f"提取到 {len(roads_gdf)} 条道路段，总长度 {roads_gdf.length.sum():.1f} 像素单位")
# 输出说明：shp 文件可直接在 ArcGIS / QGIS 中打开，叠加到遥感影像底图验证；
# 建筑 IoU 取并集 >0.85、道路连通性（抽样人工核对）>90% 即可达到业务交付标准。
```

## 常见误区或注意事项

1. **"把两期遥感影像当成 6 通道输入直接丢给普通 UNet，也能训练出变化检测模型" → 能训但精度会比双流结构差 10% 以上**。早期很多人为了图省事这么干，但问题在于：普通 UNet 的卷积不会显式对两期特征做差分对齐，模型只能从 6 通道里"隐式"学习变化模式，对于物候变化、光照差异、拍摄角度差异的抗干扰能力非常弱。正确做法是严格使用双流共享权重编码器 + 显式差异建模模块（BAM/交叉注意力），这在几乎所有公开数据集上都是精度最高的方案。

2. **"在 LEVIR-CD 公开数据集上 F1 到 0.9，在我自己的城市数据上也能达到同等水平" → 严重低估了遥感数据的域偏移程度**。公开数据集多为欧美城市或国内一线城市，以高层住宅楼和规整道路为主，换成三四线城市的城中村、农村自建房、山区县城，F1 可能直接掉到 0.5~~0.6。正确做法是收集目标区域 10~~20 平方公里的标注数据做微调，或者先用 StyleGAN 做风格迁移增强、用 CutMix/MixUp 做跨域数据增强，不要迷信公开榜单分数。

3. **"建筑提取只要像素级 Dice 高，数量统计就准确" → Dice 衡量区域重叠，完全不区分实例个数**。一个把 10 栋相邻小楼合并成一个大 blob 的预测，Dice 可能高达 0.92，但新建建筑数量统计从 10 变 1，在国土执法场景完全不可用。正确做法是必须同时评估实例级指标：PQ（全景质量）、AP（实例平均精度）、FP/FN 栋数误差率，必要时加入建筑边界预测分支做分水岭切分，而不是只看语义分割的 Dice。

4. **"道路分割只要 IoU 高，生成的路网矢量就能用来导航" → IoU 高不代表拓扑连通，一个断点就毁了整条路**。一个 99% 像素都对但在铁路道口断了 3 个像素的道路掩码，对导航来说和完全没识别到没区别，因为路径规划算法发现前方路不通就只能绕远。正确做法是必须专门评估拓扑指标：连通性（Connectivity）、完整性（Completeness）、正确路径长度比（rPLS），后处理阶段一定要加入形态学闭运算和断裂路段连接逻辑。

5. **"变化检测就是做 T2 减 T1，不需要做严格的影像配准" → 配准误差是最大的伪变化来源**。两期影像如果相差 1 个像素的位移，建筑边缘就会产生一圈厚厚的"伪变化带"；相差 3 个像素以上，任何模型都救不了。正确做法是：推理前先用 SIFT + RANSAC 做自动配准，确保配准 RMSE 小于 0.5 像素再输入模型；如果是 Sentinel-2 这类自带定位的卫星产品，也需要检查不同时相的云量、太阳高度角差异，必要时对辐射归一化后再做变化检测。
