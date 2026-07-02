---
title: ONNX 跨框架模型部署
category: devops
difficulty: intermediate
duration: 1-2周
summary: 把训练好的 PyTorch 模型打包成通用格式，让你在任意设备和语言里都能拿到更快的推理速度
takeaways:
  - 用 torch.onnx.export 把 PyTorch 模型导出成标准 ONNX 文件
  - 掌握 opset 版本与 dynamic_axes 动态轴配置，搞定变长输入
  - 使用 ONNX Runtime 搭建 CPU/GPU 推理流程，并做数值一致性验证
  - 用 onnxsim 简化模型 + YOLO 完整示例，落地生产部署
relatedTerms: onnx
relatedIntel:
  - 007-docker
  - 008-git
  - 009-linux
relatedNodes: electrical-safety
tags:
  - onnx
  - onnxruntime
  - model export
  - inference
  - deployment
  - opset
---

## 为什么你要学它

你用 PyTorch 训练好了一个分类模型或 YOLO 检测器，直接拿原生 PyTorch 部署到生产会遇到三个头疼的问题：第一，推理慢，PyTorch 动态图的灵活性天生不是为了极致性能；第二，环境重，线上要装整个 PyTorch + CUDA 栈才能跑；第三，跨平台难，想放到 C++ 服务、移动端或浏览器里几乎不可能。

这就像你在家用灵活的厨房（PyTorch）做了一道好菜，要送到客人手上就需要一个"保温外卖盒"——ONNX 就是这个外卖盒。它把你的模型冻结成一张标准的计算图（中间表示 IR），再由 ONNX Runtime 这个"外卖员"送到各个地方，同时在路上还顺便优化路线（算子融合、常量折叠），让结果又快又准。学完它，你的模型就能真正"跑起来"，而不是停在 Notebook 里。

## 一句话概览（快速版）

- ONNX 把 PyTorch / TensorFlow 等框架的模型统一成一份"计算图文件"，实现一次导出、多处部署。
- 导出时要选对 opset 版本（算子集）、声明好 dynamic_axes（动态轴），才能支持可变 batch 和变长输入。
- 用 ONNX Runtime 加载模型跑推理，配合 CUDA Execution Provider 可以拿到明显的 GPU 加速。

## 核心拆解

### 🔑 ONNX 中间表示是什么

ONNX 模型本质上是一个描述计算图的 Protobuf 文件，里面记录了三件事：输入/输出张量的形状和类型、图里的节点（算子，比如 Conv、Gemm、Softmax），以及权重参数。不同训练框架只要能输出这张图，推理端就可以消费它。

为什么这样设计？因为推理和训练的诉求不一样。训练需要自动微分、动态形状，推理只要"算结果"。ONNX 把这两件事解耦开，让推理引擎可以做各种图优化。

### 🔑 opset 版本决定了你能用哪些算子

`opset_version` 是 ONNX 最关键的参数之一。每个版本的 opset 定义了一组标准算子和它们的语义。新版本会加入更多算子（比如 LayerNorm、GridSample），但也要求推理引擎支持对应版本。

实际操作建议：如果你的模型是近年的（比如 ViT、YOLOv8/11），用 `opset_version=17` 或更高；如果要兼容老版本的 ONNX Runtime，降到 `14` 左右。导出前先查一下目标部署环境支持的 opset 范围。

### 🔑 dynamic_axes 让你的模型接受可变 batch

默认情况下 `torch.onnx.export` 用"追踪（trace）"方式导出——它跑一次前向传播，记下执行过的算子序列，这意味着输入形状会被写死。

解决方法是显式声明 `dynamic_axes`，告诉导出器哪些轴是可变的。常见做法是把第 0 维（batch）和文本任务的 seq_len 声明为动态。

### 🔑 ONNX Runtime 的 Execution Provider

ONNX Runtime 本身不挑硬件，它通过不同的 Execution Provider 来调度后端。常见组合：

- `CPUExecutionProvider`：纯 CPU，兜底用。
- `CUDAExecutionProvider`：NVIDIA GPU 加速，需要 `onnxruntime-gpu` 包。
- `TensorrtExecutionProvider`：TensorRT 进一步做图融合。

加载时传入 `providers=[...]` 列表，它会按顺序尝试，第一个可用的就用。

### 🔑 onnxsim：导出后的"减肥"工具

导出的 ONNX 模型经常带一些冗余节点（比如 `Shape -> Gather -> Unsqueeze -> Concat` 这种可以在导出时算出来的常量链）。`onnxsim` 做一次"常量折叠 + 形状推断"，让图更小、推理更快。

## 完整跑通方案

### 第一步：环境准备

```bash
pip install torch onnx onnxruntime-gpu onnxsim numpy
```

### 第二步：写一个可导出的 PyTorch 模型并导出 ONNX

```python
import torch
import torch.nn as nn


class SimpleClassifier(nn.Module):
    def __init__(self, in_ch=3, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(in_ch, 16, 3, stride=2, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(16, 32, 3, stride=2, padding=1),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(32, num_classes),
        )

    def forward(self, x):
        return self.features(x)


model = SimpleClassifier().eval()
dummy = torch.randn(1, 3, 224, 224)

torch.onnx.export(
    model,
    dummy,
    "model.onnx",
    export_params=True,
    opset_version=17,
    do_constant_folding=True,
    input_names=["input"],
    output_names=["output"],
    dynamic_axes={
        "input": {0: "batch_size", 2: "height", 3: "width"},
        "output": {0: "batch_size"},
    },
)
print("Exported to model.onnx")
```

### 第三步：用 onnx.checker 检查 + onnxsim 简化

```python
import onnx
import onnxsim

onnx_model = onnx.load("model.onnx")
onnx.checker.check_model(onnx_model)
print("ONNX check passed.")

model_simplified, ok = onnxsim.simplify(onnx_model)
assert ok, "simplify failed"
onnx.save(model_simplified, "model.sim.onnx")
print("Simplified model saved.")
```

### 第四步：ONNX Runtime 跑推理并与 PyTorch 做数值对齐

```python
import numpy as np
import onnxruntime as ort

sess_options = ort.SessionOptions()
sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

ort_session = ort.InferenceSession(
    "model.sim.onnx",
    sess_options,
    providers=["CUDAExecutionProvider", "CPUExecutionProvider"],
)
print("Using provider:", ort_session.get_providers()[0])

test_input = np.random.randn(2, 3, 224, 224).astype(np.float32)
ort_out = ort_session.run(None, {"input": test_input})[0]
with torch.no_grad():
    pt_out = model(torch.from_numpy(test_input)).numpy()

print("PyTorch shape:", pt_out.shape, "ONNX shape:", ort_out.shape)
print("Max abs diff:", np.abs(pt_out - ort_out).max())
# 一般 < 1e-3 就可以认为数值一致
```

### 第五步：YOLO 导出 + 推理的完整脚本（示意）

```python
# 用 ultralytics 导出 YOLO 为 ONNX（推荐方式）
# pip install ultralytics
from ultralytics import YOLO

yolo = YOLO("yolo11n.pt")
yolo.export(format="onnx", opset=17, dynamic=True, simplify=True)
# 产物：yolo11n.onnx

# 用 OpenCV + ONNX Runtime 做推理（无需 ultralytics 依赖）
import cv2
import numpy as np
import onnxruntime as ort

sess = ort.InferenceSession("yolo11n.onnx", providers=["CPUExecutionProvider"])
input_name = sess.get_inputs()[0].name
# 动态 shape 时从外部指定输入尺寸（640x640 是 YOLO 默认尺寸）
input_hw = (640, 640)

img = cv2.imread("test.jpg")
orig_h, orig_w = img.shape[:2]
blob = cv2.dnn.blobFromImage(img, 1 / 255.0, input_hw, swapRB=True, crop=False)
outs = sess.run(None, {input_name: blob})[0]  # shape 取决于 YOLO 版本
print("YOLO output shape:", outs.shape)
# 后续用 NMS 过滤 + 坐标还原即可得到最终检测框
```

## 常见误区

**误区 1：opset 版本越高越好，直接设成最大的。**
解释：新版本 opset 可能让旧版本 ONNX Runtime 加载失败。部署前先跟生产环境 ONNX Runtime 的版本对齐，通常 `14~17` 是比较稳妥的区间。

**误区 2：忘记设置 dynamic_axes，推理时 batch != 1 就崩。**
解释：默认导出是"追踪一次"得到的固定形状图。只要你希望 batch、height、width 或 seq_len 可变，就必须在导出时声明 dynamic_axes。

**误区 3：直接用 `model(x)` 对照 ONNX 输出，却没处理 training/eval 模式。**
解释：导出前模型必须是 `.eval()`，否则 Dropout/BatchNorm 行为会不一致；对比时也要确保推理模式且关掉梯度。

**误区 4：只用 CPU 跑，以为 ONNX 就那样。**
解释：要拿到 GPU 加速需要安装 `onnxruntime-gpu`（不是 `onnxruntime`），并在创建 Session 时指定 `CUDAExecutionProvider`。否则 ONNX Runtime 只是走 CPU，提速有限。

**误区 5：把 onnxsim 当万能药，却不做数值一致性校验。**
解释：简化过程在少数模型上可能引入形状推断错误。简化后一定要用一份固定输入，对比 PyTorch 输出和 ONNX Runtime 输出，误差在可接受范围后再上线。
