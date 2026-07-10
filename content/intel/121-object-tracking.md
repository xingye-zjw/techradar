---
title: 目标跟踪技术
category: computer-vision
difficulty: intermediate
duration: 2-3周
summary: 计算机视觉核心任务之一，在视频中持续定位并跟踪一个或多个目标。是自动驾驶、视频监控、人机交互等应用的关键技术。
takeaways: "- 理解单目标跟踪(SOT)与多目标跟踪(MOT)的本质区别和典型应用场景
  - 掌握相关滤波方法(MOSSE/KCF)的核心原理及其速度优势来源
  - 深入理解孪生网络系列(SiamFC/SiamRPN/SiamMask)的跟踪范式
  - 了解Transformer在目标跟踪中的应用(TransT/MixFormer)及优势
  - 掌握多目标跟踪核心算法(SORT/DeepSORT/ByteTrack)的数据关联逻辑
  - 能用SiamMask和ByteTrack跑通完整的跟踪demo"
relatedIntel: "- 002-yolo
  - 004-resnet
  - 006-cnn-basics"
tags: "- object tracking
  - 目标跟踪
  - sot
  - mot
  - siamfc
  - siamrpn
  - siammask
  - transt
  - sort
  - deepsort
  - bytetrack
  - kcf
  - mosse"
relatedTerms: ["yolo", "resnet", "transformer", "cnn"]
relatedTools: ["numpy", "ultralytics-yolo", "matplotlib"]
relatedNodes: ["cv-segmentation", "cv-detection"]
---

## 为什么你要学它

先讲结论：**目标跟踪 = 让计算机在视频中"盯住"目标，即使目标被遮挡、形变、运动模糊也不丢失。**

它是计算机视觉中最具实用价值的任务之一。你看到的几乎所有视频分析应用背后都有它：

- **自动驾驶**：跟踪周围车辆和行人，预测轨迹
- **视频监控**：跟踪可疑人员，跨摄像头ReID
- **人机交互**：手势跟踪、眼球追踪
- **体育分析**：跟踪运动员和球的运动轨迹
- **视频编辑**：目标抠除、特效追踪

目标检测告诉你"画面里有什么"，目标跟踪告诉你"它们在怎么动"。没有跟踪，检测只是一张张孤立的图片；有了跟踪，视频才有了时间维度的语义。

从技术演进角度看，目标跟踪经历了相关滤波→孪生网络→Transformer的三代变革，每一代都在精度和速度上有质的飞跃。理解这条技术路线，你就能看懂计算机视觉领域从传统方法到深度学习的完整进化史。

## 一句话概览（快速版）

你只要记住三句话：

1. **目标跟踪的核心是"在连续帧间建立目标的对应关系"**，单目标只追一个，多目标要追一群
2. **跟踪算法的两大流派**：相关滤波靠快速模板匹配追求速度，深度学习靠特征表达追求精度
3. **多目标跟踪 = 目标检测 + 数据关联**，SORT用卡尔曼滤波+匈牙利算法，ByteTrack连低置信度检测框也不放过

## 核心拆解

### 🔑 目标跟踪基础

**单目标跟踪（Single Object Tracking, SOT）**

给定视频第一帧中目标的 bounding box，在后续所有帧中持续定位该目标。

特点：

- 只有一个目标，第一帧指定
- 不需要目标类别信息，任意物体都可以跟踪
- 评估指标：Success Rate（交并比阈值）、Precision（中心点距离阈值）
- 难点：遮挡、形变、光照变化、尺度变化、运动模糊

**多目标跟踪（Multiple Object Tracking, MOT）**

同时跟踪视频中多个目标，每个目标有唯一ID，全程保持身份一致。

特点：

- 目标数量不固定，可能随时出现/消失
- 通常需要先检测再跟踪（tracking-by-detection范式）
- 评估指标：MOTA、MOTP、ID Switch、IDs、FP、FN
- 难点：目标遮挡、相似外观、ID切换

### 🔑 相关滤波方法

**MOSSE（Minimum Output Sum of Squared Error）**

2010年提出，第一个能做到实时（几百FPS）的跟踪算法。

核心思想：

- 将跟踪问题转化为**相关滤波响应最大化**问题
- 在频域中用快速傅里叶变换(FFT)计算相关，速度极快
- 滤波器模板在线更新，适应目标变化

公式直觉：

```
响应图 = 搜索区域 ★ 滤波器模板  （★表示相关运算）
响应最大的位置就是目标新位置
```

优点：速度极快（600+ FPS），实现简单
缺点：精度有限，难以处理尺度变化和严重遮挡

**KCF（Kernelized Correlation Filters）**

2014年提出，相关滤波的巅峰之作，至今仍是很多工业场景的首选。

核心改进：

- **循环矩阵**：利用循环移位生成大量训练样本，不增加计算量
- **核技巧**：把线性相关滤波推广到非线性空间（高斯核、多项式核）
- **HOG特征**：替代原始灰度特征，表达能力更强
- **多尺度检测**：解决尺度变化问题

为什么这么快？

- 所有计算都在频域做，FFT把卷积变成逐元素相乘
- 训练一次只需要几毫秒
- 典型速度：100-200 FPS

KCF的意义：它证明了**精心设计的传统方法在速度上有天然优势**，深度学习方法花了好几年才在精度上全面超越它。

### 🔑 深度学习方法：孪生网络系列

**SiamFC（Fully-Convolutional Siamese Networks）**

2016年提出，开启了深度学习跟踪的新纪元。

核心思想：**相似性匹配**

```
模板分支(第一帧目标) → 特征提取 → 模板特征
                                 ↘
                                  互相关 → 响应图 → 目标位置
                                 ↗
搜索分支(当前帧搜索区) → 特征提取 → 搜索特征
```

为什么叫"孪生"？两个分支用**同一个网络**提取特征，权值共享。

核心洞察：

- 把跟踪变成**模板匹配**问题，第一帧的目标就是模板
- 离线训练，在线只做前向推理，不需要在线更新
- 用互相关层计算相似度，天然适合全卷积网络

优点：速度快（80+ FPS），泛化性好
缺点：没有尺度估计，容易跟丢快速运动目标

**SiamRPN（Siamese Region Proposal Network）**

2018年提出，把目标检测的RPN引入孪生网络。

核心改进：

- 在SiamFC基础上加了**区域建议网络(RPN)**
- 分类分支：判断每个锚框是前景还是背景
- 回归分支：预测锚框的偏移量
- 多尺度锚框：天然解决尺度变化问题

SiamRPN之后，孪生网络系列迅速成为SOT的主流：

- SiamRPN++：用更深的骨干网络（ResNet50），打破了孪生网络不能用深网络的迷信
- SiamFC++：无锚框设计，更简洁
- Ocean：加入目标状态感知

**SiamMask**

2019年提出，**同时做跟踪和分割**。

核心亮点：

- 在SiamRPN基础上加了一个**分割分支**
- 跟踪的同时输出目标的像素级mask
- 速度仍能达到实时（55 FPS）

意义：证明了跟踪和分割可以互相促进，mask提供的精细形状信息能提升跟踪精度。

### 🔑 Transformer-based 跟踪

**TransT**

2021年提出，第一个把Transformer成功应用到目标跟踪的工作。

核心思想：用Transformer的自注意力和交叉注意力替代传统的互相关操作。

```
模板特征 → Transformer Encoder → 增强模板特征
                                      ↘
                                       Transformer Decoder → 融合特征 → 预测头
                                      ↗
搜索特征 → Transformer Encoder → 增强搜索特征
```

为什么Transformer更好？

- **全局建模**：互相关只能做局部匹配，Transformer能建立全局依赖
- **动态注意力**：不是简单的模板匹配，而是自适应地关注目标的不同部分
- **特征融合更充分**：多层注意力逐步融合模板和搜索区域信息

**MixFormer**

2022年提出，把模板和搜索区域的特征融合做到了极致。

核心创新：

- **混合注意力**：模板和搜索区域在同一序列中，用自注意力自然融合
- **不对称设计**：模板分支用更多层，搜索分支用更少层
- **端到端训练**：不需要额外的检测头

Transformer跟踪器的发展趋势：

- 精度持续刷新SOTA
- 速度从慢到快（LightTrack等轻量化工作）
- 逐渐从实验室走向工业应用

### 🔑 多目标跟踪

**SORT（Simple Online and Realtime Tracking）**

2016年提出，最经典的多目标跟踪基线，简单到令人发指但极其有效。

核心组件：

1. **卡尔曼滤波**：预测目标在下一帧的位置
   - 状态向量：[x, y, s, r, vx, vy, vs] （中心坐标、面积、宽高比、速度）
   - 预测阶段：根据运动模型预测下一帧状态
   - 更新阶段：用检测结果修正预测

2. **匈牙利算法**：解决检测框和跟踪轨迹的匹配问题
   - 构建代价矩阵：每个检测框和每个轨迹的 **1 - IOU**（IOU 越大越好，转为代价需取反）
   - 最小化总代价，得到最优匹配
   - 阈值过滤：IOU 太低的不匹配

3. **轨迹管理**：
   - 新目标：连续几帧都检测到才创建新轨迹
   - 消失目标：连续几帧没匹配上就删除轨迹

SORT的速度极快（几百FPS），但有个大问题：**ID Switch太多**。目标一被遮挡，再出现时ID就变了。因为它只用位置信息，不看目标长什么样。

**DeepSORT**

2017年提出，在SORT基础上加了**外观特征**，大幅减少ID Switch。

核心改进：

- **ReID特征**：用一个独立的ReID网络提取每个检测框的外观特征
- **级联匹配**：优先匹配最近出现的轨迹（匹配成功概率更高）
- **度量融合**：代价 = 马氏距离（运动信息） + 余弦距离（外观信息）

DeepSORT = 卡尔曼滤波 + 匈牙利算法 + ReID外观特征

效果：ID Switch减少了45%，但速度从SORT的几百FPS降到了几十FPS（主要慢在ReID网络）。

**ByteTrack**

2021年提出，一个非常聪明的想法：**不要扔掉低置信度的检测框**。

传统做法：

- 检测框按置信度排序，设一个阈值（比如0.5）
- 高于阈值的参与匹配，低于阈值的直接扔掉
- 问题：遮挡时目标检测置信度会下降，被扔掉导致跟丢

ByteTrack的做法：

1. **第一次匹配**：高置信度检测框和轨迹匹配（和DeepSORT一样）
2. **第二次匹配**：没匹配上的轨迹和低置信度检测框再匹配一次
3. 第二次匹配只用IOU，不用外观特征（因为低置信度检测框的外观特征不可靠）

为什么叫ByteTrack？因为作者叫ByteDance团队。但更重要的是，这个简单的改动带来了巨大提升：

- MOTA大幅提升
- ID Switch进一步减少
- 实现简单，几乎不增加计算量

ByteTrack的启示：**好的算法不一定是复杂的，有时候只是换了个角度看问题**。

## 完整跑通方案

### 方案一：SiamMask 单目标跟踪+分割

**第一步：安装依赖**

```bash
pip install torch torchvision opencv-python
pip install git+https://github.com/facebookresearch/maskrcnn-benchmark.git
```

**第二步：下载预训练模型**

从SiamMask官方仓库下载 `SiamMask_VOT.pth`。

**第三步：最简实现**

```python
import cv2
import torch
import numpy as np
from siammask import SiamMask

class SiamMaskTracker:
    def __init__(self, model_path):
        self.model = SiamMask.load_from_checkpoint(model_path)
        self.model.eval()
        self.model.cuda()

    def init(self, frame, bbox):
        """bbox: [x, y, w, h]"""
        self.model.init(frame, bbox)

    def update(self, frame):
        """返回 (bbox, mask)"""
        result = self.model.track(frame)
        return result['bbox'], result['mask']

# 使用示例
tracker = SiamMaskTracker("SiamMask_VOT.pth")

cap = cv2.VideoCapture("video.mp4")
ret, frame = cap.read()

# 第一帧手动指定目标
init_bbox = cv2.selectROI("Select Object", frame, False)
tracker.init(frame, init_bbox)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    bbox, mask = tracker.update(frame)

    # 画bounding box
    x, y, w, h = map(int, bbox)
    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

    # 画mask
    mask = (mask > 0.5).astype(np.uint8) * 255
    colored_mask = np.zeros_like(frame)
    colored_mask[:, :, 1] = mask
    frame = cv2.addWeighted(frame, 0.7, colored_mask, 0.3, 0)

    cv2.imshow("Tracking", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

**第四步：在VOT数据集上评测**

用官方评测工具跑VOT2018/2020，看EAO和Speed指标。

### 方案二：ByteTrack 多目标跟踪

**第一步：安装**

```bash
git clone https://github.com/ifzhang/ByteTrack.git
cd ByteTrack
pip install -r requirements.txt
python setup.py develop
pip install cython_bbox
```

**第二步：下载YOLOX预训练模型**

下载 `yolox_x.pth` 或 `yolox_s.pth`（根据GPU选择）。

**第三步：运行视频跟踪**

```python
import cv2
import torch
import numpy as np
from yolox.data.data_augment import preproc
from yolox.exp import get_exp
from yolox.utils import postprocess
from byte_tracker import BYTETracker

class ByteTrackDetector:
    def __init__(self, model_path, exp_name="yolox_x"):
        self.exp = get_exp(None, exp_name)
        self.model = self.exp.get_model()
        self.model.load_state_dict(torch.load(model_path)["model"])
        self.model.eval()
        self.model.cuda()
        self.num_classes = self.exp.num_classes
        self.conf_thre = 0.5
        self.nmsthre = 0.7
        self.test_size = (640, 640)

    def detect(self, frame):
        img_info = {"id": 0}
        height, width = frame.shape[:2]
        img_info["height"] = height
        img_info["width"] = width

        img, ratio = preproc(frame, self.test_size)
        img = torch.from_numpy(img).unsqueeze(0).cuda()

        with torch.no_grad():
            outputs = self.model(img)
            outputs = postprocess(
                outputs, self.num_classes, self.conf_thre,
                self.nmsthre, class_agnostic=True
            )

        if outputs[0] is None:
            return np.array([])

        output = outputs[0].cpu().numpy()
        bboxes = output[:, 0:4] / ratio
        scores = output[:, 4] * output[:, 5]

        # 返回 [x1, y1, x2, y2, score]
        return np.column_stack([bboxes, scores])

# 初始化检测和跟踪
detector = ByteTrackDetector("yolox_x.pth", "yolox_x")
tracker = BYTETracker(
    track_thresh=0.5,
    track_buffer=30,
    match_thresh=0.8,
    frame_rate=30
)

cap = cv2.VideoCapture("video.mp4")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # 检测
    detections = detector.detect(frame)

    # 跟踪
    if len(detections) > 0:
        online_targets = tracker.update(detections, frame.shape[:2])

        # 画结果
        for t in online_targets:
            tlwh = t.tlwh
            tid = t.track_id
            x1, y1, w, h = map(int, tlwh)
            cv2.rectangle(frame, (x1, y1), (x1+w, y1+h), (0, 255, 0), 2)
            cv2.putText(frame, f"ID:{tid}", (x1, y1-10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    cv2.imshow("ByteTrack", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

**第四步：在MOT数据集上评测**

用MOTChallenge的评测工具，跑MOT17/MOT20数据集，看MOTA和IDF1指标。

## 常见误区

**"目标跟踪就是目标检测连续跑" → 大错特错**。检测是逐帧独立的，跟踪要在帧间建立关联。一个目标在第10帧和第20帧都是同一个人，检测不知道，但跟踪知道。如果只是检测连续跑，你得到的是一堆孤立的框，而不是轨迹。

**"KCF太老了，没用了" → 错**。在很多嵌入式设备和对速度要求极高的场景，KCF依然是首选。它几百FPS的速度，深度学习方法至今难以匹敌。而且KCF的思想（相关滤波、频域计算）对理解跟踪的本质很有帮助。

**"SORT太简单，肯定不好用" → 错**。SORT虽然简单，但它是所有多目标跟踪的基线。在检测质量很高、目标不怎么遮挡的场景，SORT的效果和DeepSORT差不多，但速度快10倍。很多工业场景用SORT就够了。

**"置信度低的检测框就是噪声，应该扔掉" → ByteTrack说不**。低置信度检测框里混着噪声，但也藏着被遮挡的目标。ByteTrack的核心贡献就是证明了：用好低置信度检测框，能大幅提升跟踪性能。这是一个反直觉但极其重要的洞察。

**"Transformer跟踪器一定比孪生网络好" → 不一定**。Transformer精度更高，但速度慢、计算量大。如果你的应用对延迟敏感，SiamRPN++或Ocean可能是更好的选择。而且在小模型、轻量化的方向，孪生网络依然有优势。

**"MOTA是衡量MOT的唯一标准" → 错**。MOTA只关心检测的准确率和漏检率，不关心ID切换的严重程度。有时候MOTA很高，但ID Switch特别多，轨迹碎得一塌糊涂。还要看IDF1、IDs等指标。很多时候，ID一致性比检测精度更重要。

**"跟踪算法越复杂越好" → 错**。实际工程中，简单、稳定、可解释的算法往往更受欢迎。SORT、ByteTrack之所以流行，不是因为它们最复杂，而是因为它们简单有效、容易调试。做工程不是比谁的论文更fancy，而是比谁的系统更可靠。

## 学习资源推荐

**入门阶段（1-2周）**

1. 先看KCF论文《High-Speed Tracking with Kernelized Correlation Filters》，理解相关滤波的核心思想
2. 用OpenCV自带的跟踪器（KCF、MOSSE、CSRT）跑一个简单的视频，直观感受跟踪效果
3. 看SiamFC论文《Fully-Convolutional Siamese Networks for Object Tracking》，理解孪生网络范式
4. 跑通PySOT官方仓库的demo，看SiamRPN++的效果

**进阶阶段（2-3周）**

1. 读SORT和DeepSORT论文，理解多目标跟踪的tracking-by-detection范式
2. 手写一个简化版SORT（卡尔曼滤波+匈牙利算法），在MOT17上跑通
3. 读ByteTrack论文，理解低置信度检测框的价值
4. 看TransT和MixFormer论文，了解Transformer在跟踪中的应用

**深入阶段（持续）**

1. 关注VOT和MOTChallenge的最新结果，了解技术趋势
2. 研究轻量化跟踪器（LightTrack、OSTrack），关注边缘部署
3. 探索多模态跟踪（RGB+Depth、RGB+Event）
4. 学习视频目标分割（VOS），理解跟踪和分割的联系

**推荐代码库**

- **PySOT**：商汤开源的单目标跟踪工具箱，涵盖SiamFC、SiamRPN、SiamRPN++等
- **ByteTrack**：字节跳动开源的多目标跟踪，实现简洁，效果好
- **FairMOT**：检测和ReID一体化的多目标跟踪
- **STARK**：基于Transformer的单目标跟踪，代码质量高
- **OpenCV Tracking API**：入门首选，内置多种传统跟踪器

**推荐数据集**

- **VOT系列**：单目标跟踪权威评测（VOT2018、VOT2020、VOT2022）
- **OTB100**：经典单目标跟踪数据集
- **LaSOT**：大规模单目标跟踪数据集，类别多、序列长
- **MOT17/MOT20**：多目标跟踪标准评测集
- **DanceTrack**：新的多目标跟踪数据集，遮挡更严重、更具挑战性
