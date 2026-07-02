---
title: CV 姿态估计
category: computer-vision
keywords:
  - pose-estimation
  - keypoint-detection
  - top-down
  - bottom-up
  - human-pose
  - action-recognition
  - hrnet
  - openpose
  - alphapose
  - mmpose
difficulty: intermediate
duration: 1-2周
summary: 姿态估计是让计算机"看懂人体动作"的基础技术，通过检测人体关键点（头、肩、肘、腕等）来理解人的姿势和动作意图。
takeaways:
  - 理解 Top-down 和 Bottom-up 两大技术路线的核心差异和适用场景
  - 掌握 HRNet、OpenPose、AlphaPose 等主流模型的设计思想
  - 能用 mmpose 或 AlphaPose 在真实图像上跑通姿态估计流程
  - 理解姿态估计在动作识别、安防监控、人机交互等场景的实际价值
relatedTerms: pose-estimation
relatedIntel:
  - 002-yolo
  - 004-resnet
  - 006-cnn-basics
---

## 为什么你要学它

先讲结论：**姿态估计是让计算机"看懂人体动作"的第一步，不会它，动作识别、行为分析、交互设计全是空谈。**

它解决了一个核心问题：当你看到一个人举起右手，你知道这是在打招呼还是指方向。但对计算机来说，这需要两步：先找到人的关节点（头在哪、肩在哪、手在哪），再理解这些点组成的姿势意味着什么。姿态估计就是完成第一步的技术。

实际应用场景：
- **动作识别**：体育视频分析、舞蹈评分、康复训练评估
- **安防监控**：异常行为检测（摔倒、闯入、徘徊）
- **游戏交互**：体感游戏（如 Switch、Kinect）、AR/VR 手势控制
- **人机协作**：工厂中机器人与人安全交互
- **影视制作**：动作捕捉替代方案，降低特效成本

理解姿态估计后，你会发现它是一系列下游任务（如行为识别、步态分析）的基石。

## 一句话概览（快速版）

你只要记住三句话：

1. **姿态估计 = 检测人体关键点（Keypoint）的位置**（如头、肩膀、肘、腕、髋、膝、踝等）
2. **两大路线：Top-down（先找人再检测关节点）vs Bottom-up（先检测关节点再组合成人）**
3. **HRNet 以保持高分辨表示为核心，OpenPose 是 Bottom-up 代表，AlphaPose 是 Top-down 代表方案**

## 核心拆解

### 🔑 Top-down vs Bottom-up

**Top-down（自上而下）**：
- 流程：先用目标检测器（如 YOLO）找出图中所有人 → 对每个人crop → 分别做单人姿态估计
- 优点：精度高，因为单人图像更易处理
- 缺点：人数多时计算量大，且漏检的人无法估计姿态
- 适用：人数较少、精度要求高的场景

**Bottom-up（自下而上）**：
- 流程：先检测图中所有关键点 → 再通过关联算法把点组合成人
- 优点：人数多时效率高，不依赖人检测器
- 缺点：组合关节点时可能出错，精度略逊于 Top-down
- 适用：拥挤场景、多人场景

### 🔑 HRNet（High-Resolution Network）

HRNet 是 Top-down 方案的代表性 backbone，其核心思想是**在整个网络中保持高分辨率表示**，而不是像传统网络那样先下采样再上采样。

关键设计：
- 并行多分辨率子网络，不同分辨率之间反复交换信息
- 全程保持高分辨率特征图，更精准地定位关键点
- 在 COCO 等数据集上精度领先

HRNet-W32/48 是最常用的变体，数字代表宽度（通道数）。

### 🔑 OpenPose

OpenPose 是 Bottom-up 方案的先驱，由 CMU 提出。

核心组件：
- **VGGNet backbone**：提取图像特征
- **Part Confidence Maps**：预测每个关键点的位置概率图
- **Part Affinity Fields（PAF）**：预测关键点之间的关联向量场，用于组合关节点
- **二分图匹配**：用 PAF 将检测到的关节点组合成人

缺点：速度较慢，精度不如后来方案。

### 🔑 AlphaPose

AlphaPose 是国产精品，专为**精确多人姿态估计**设计。

核心创新：
- **姿态误差模板匹配（Pose Guided Proposals）**：利用姿态先验引导检测
- **PyRAMID**：金字塔结构捕捉多尺度人体
- **Symmetric Spatial Transformer Network**：对称空间变换网络，提升定位精度
- 支持 Data Obsessed Anchor Assignment（DOAA），自适应锚点分配

在 COCO 上精度与 HRNet 相当，速度更快。

### 🔑 关键点定义（COCO 17 点）

COCO 格式是最常用的标注标准，17 个关键点：
```
0: nose          1: left_eye     2: right_eye    3: left_ear     4: right_ear
5: left_shoulder 6: right_shoulder 7: left_elbow  8: right_elbow
9: left_wrist   10: right_wrist 11: left_hip    12: right_hip
13: left_knee   14: right_knee 15: left_ankle  16: right_ankle
```

## 完整跑通方案

### 方案一：mmpose（推荐，快速上手）

mmpose 是 OpenMMLab 生态的一员，支持多种姿态估计算法。

**第一步：安装**
```bash
pip install mmpose
# 或完整安装
pip install mmcv-full mmdet mmpose
```

**第二步：使用 HRNet 进行单人姿态估计**
```python
import torch
from mmpose.apis import inference_top_down_pose_model, init_pose_model

# 初始化模型（HRNet-W32，COCO 预训练）
pose_model = init_pose_model(
    'configs/body/2d_kpt_sview_rgb_img/topdown_hrnet/coco_hrnet_w32_256x192.py',
    'https://download.openmmlab.com/mmpose/top_down/hrnet/hrnet_w32_coco_256x192- 47d8e2b4_20200816.pth',
    device='cuda:0'
)

# 单人图像推理
img_path = 'person.jpg'
person_results = [{'bbox': [100, 100, 200, 400]}]  # [x1, y1, w, h]
results = inference_top_down_pose_model(
    pose_model,
    img_path,
    person_results,
    format='xywh'
)

# 打印关键点
for kpt in results[0]['keypoints']:
    print(f"x={kpt[0]:.1f}, y={kpt[1]:.1f}, conf={kpt[2]:.2f}")
```

**第三步：使用 MMPose 的推理可视化工具**
```python
from mmpose.apis import vis_pose_result

# 可视化结果
vis_pose_result(
    pose_model,
    img_path,
    results,
    show=True,
    out_file='output.jpg'
)
```

### 方案二：AlphaPose

AlphaPose 支持完整的训练和推理流程。

**第一步：安装**
```bash
git clone https://github.com/MVIG-SJTU/AlphaPose.git
cd AlphaPose
pip install -r requirements.txt
python setup.py build develop
```

**第二步：推理示例**
```python
import torch
from alphapose.models.builder import build_pose_model
from alphapose.utils.config import cfg
from alphapose.utils.detector import load_detector
from alphapose.utils.transforms import get_affine_mat, warp_affine

# 加载检测器（YOLO）和姿态模型（FastPose）
detector = load_detector({
    'name': 'yolo',
    'cfg': 'configs/yolo.yaml',
    'weights': 'weights/yolov3-spp.weights'
})

pose_model = build_pose_model(cfg)
pose_model.load_state_dict(torch.load('weights/fastpose_Res50_BRB.pth'))
pose_model.eval()

# 推理
img = torch.rand(1, 3, 256, 192)  # BGR 格式
with torch.no_grad():
    pose_result = pose_model(img)

print(pose_result)
```

**第三步：命令行快速运行**
```bash
# 使用预训练模型推理
python scripts/demo_inference.py \
    --cfg configs/halpe136_Res50_BRB.yaml \
    --checkpoint weights/halpe136_Res50_BRB.pth \
    --input-video input.mp4 \
    --output-video output.mp4 \
    --vis-skeleton
```

## 常见错误和解决方案

**错误1：mmpose 报 "No module named 'mmcv'"**
```
原因：mmcv 未安装或版本不匹配
解决：
  pip install mmcv-full  # 匹配你的 CUDA 和 PyTorch 版本
  # 或使用 openmim 安装
  mim install mmcv-full
```

**错误2：推理结果关键点全部为零**
```
原因1：检测器未检测到人
解决：确保图像中有明确的人体，或传入已知的 bbox

原因2：输入图像格式错误（应该是 BGR）
解决：cv2.imread 读取的图像直接使用，不要转 RGB

原因3：bbox 坐标超出图像边界
解决：检查 bbox [x1, y1, x2, y2] 是否在图像尺寸范围内
```

**错误3：AlphaPose 报 "CUDA out of memory"**
```
原因：图像分辨率过高或 batch_size 过大
解决：
  1. 减小输入图像尺寸（如 resize 到 640x640）
  2. 减小 batch_size
  3. 使用半精度（fp16）：model.half()
```

**错误4：Top-down 方法人数多时速度极慢**
```
原因：每个人都要过一次网络，人数多时计算量线性增长
解决：
  1. 先用轻量级检测器（如 YOLOv5s）
  2. 切换到 Bottom-up 方案（如 OpenPose）
  3. 使用 Batch-NMS 等后处理优化
```

**错误5：关键点置信度低，抖动严重**
```
原因1：图像模糊或遮挡严重
解决：使用图像增强（去模糊、锐化）

原因2：模型未在相似场景数据上微调
解决：在你的目标场景数据上微调预训练模型

原因3：TTA（Test Time Augmentation）未开启
解决：开启多尺度推理和翻转测试
```

## 推荐学习顺序

1. 先跑通 mmpose 的官方 Demo，感受完整流程
2. 阅读 HRNet 论文，理解高分辨率保持的核心思想
3. 对比 Top-down 和 Bottom-up 在同一图像上的效果差异
4. 在自己的数据集上微调模型（标注 100-200 张即可显著提升）
5. 结合动作识别模型（如 ST-GCN），完成"姿态估计→动作识别"串联
