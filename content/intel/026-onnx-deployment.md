---
title: ONNX 模型部署与推理优化
category: deployment
keywords:
  - onnx
  - onnxruntime
  - model export
  - inference optimization
  - tensorrt
  - quantization
difficulty: intermediate
duration: 1周
summary: 把 PyTorch 模型导出为跨平台的 ONNX 格式，用 ONNXRuntime 加速推理，或进一步转为 TensorRT
takeaways:
  - 能把 PyTorch 模型导出为 ONNX 并用 onnxsim 简化
  - 能用 ONNXRuntime GPU 版做推理加速
  - 能处理动态 shape 输入和多输入/输出模型
  - 能做基本的精度验证（PyTorch vs ONNX 输出误差 < 1e-3）
---

## 为什么你要学它

训练在 PyTorch，上线时需要跨平台、跨语言、跨硬件推理。直接用 PyTorch 做推理？慢，而且依赖 PyTorch 运行时，不方便部署到手机/嵌入式/浏览器。

**ONNX（Open Neural Network Exchange）** 是模型部署的「中间语言」：
- PyTorch → ONNX → ONNXRuntime（CPU/GPU）
- PyTorch → ONNX → TensorRT（GPU 专用优化）
- PyTorch → ONNX → CoreML（iOS）
- PyTorch → ONNX → TFLite（Android）

如果你的模型最终要上线服务化（而非纯训练），ONNX 是绕不开的一步。

## 一句话概览

- ONNX 定义了一套跨框架的算子IR（Intermediate Representation）
- `torch.onnx.export()` 把 PyTorch 计算图导出为 ONNX 格式
- `onnxsim` 做常量折叠和 shape 推断，大幅减少冗余算子
- ONNXRuntime 是 ONNX 的推理引擎，比 PyTorch 原生推理快 1.5-3x

## 核心拆解

### 🔑 导出 ONNX 的常见坑

**动态 shape**：`torch.onnx.export` 默认把第一个 dimension 当成 batch_size，如果需要动态（可变 batch/seq_len），必须声明：

```python
dynamic_axes = {
    "input": {0: "batch_size", 1: "seq_len"},
    "output": {0: "batch_size", 1: "seq_len"}
}
torch.onnx.export(
    model, (dummy_input,),
    "model.onnx",
    input_names=["input"],
    output_names=["output"],
    dynamic_axes=dynamic_axes,
    opset_version=14,  # 新版算子支持更全
)
```

**shape 不匹配**：导出时用的 `dummy_input` shape 必须与实际推理时的 shape 兼容。

**精度不一致**：导出后模型输出与 PyTorch 有微小误差（通常 < 1e-6），如果误差过大，检查：
- 是否用了 `model.eval()`
- BatchNorm 是否用了 running stats（而非训练模式的统计量）
- 是否所有算子都 ONNX 支持（尤其是自定义算子）

### 🔑 ONNX 模型简化

```python
import onnxsim

model_onnx = onnx.load("model.onnx")
model_simplified, ok = onnxsim.simplify(model_onnx)
onnx.save(model_simplified, "model_simplified.onnx")
```

onnxsim 会做：
- 常量折叠（Constant Folding）
- 冗余算子消除
- Shape 推断与优化

### 🔑 ONNXRuntime GPU 推理

```python
import onnxruntime as ort

sess_options = ort.SessionOptions()
sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

# GPU 推理
session = ort.InferenceSession(
    "model.onnx",
    sess_options,
    providers=["CUDAExecutionProvider", "CPUExecutionProvider"]
)

# 如果有 GPU，会自动使用 CUDA EP
input_data = {"input": input_np_array}
output = session.run(None, input_data)
```

### 🔑 ONNX vs TensorRT

| 工具 | 优化方式 | 适用场景 |
|---|---|---|
| ONNXRuntime | 算子融合 + 内存优化 | 通用跨平台，GPU/CPU 都支持 |
| TensorRT | CUDA Kernel 定制 + INT8/FP16 | NVIDIA GPU 生产推理最快 |

**推荐路径**：PyTorch → ONNX → onnxsim → ONNXRuntime → （可选）→ TensorRT

## 实战指南

### 端到端导出 + 推理

```python
import torch
import onnxruntime as ort
import numpy as np

# 1. 导出
model = torch.load("resnet18.pt")
model.eval()
dummy = torch.randn(1, 3, 224, 224)
torch.onnx.export(model, dummy, "resnet18.onnx", opset_version=14)

# 2. 简化
import onnxsim
model_onnx = onnx.load("resnet18.onnx")
model_sim, ok = onnxsim.simplify(model_onnx)
onnx.save(model_sim, "resnet18_sim.onnx")

# 3. 推理验证
session = ort.InferenceSession("resnet18_sim.onnx", providers=["CPUExecutionProvider"])
input_np = np.random.randn(1, 3, 224, 224).astype(np.float32)
output = session.run(None, {"input.1": input_np})

# 4. 对比 PyTorch 输出
with torch.no_grad():
    pt_output = model(torch.from_numpy(input_np))
max_diff = np.abs(pt_output.numpy() - output[0]).max()
print(f"Max diff: {max_diff:.6f}")  # 应 < 1e-3
```

## 常见误区

### 误区 1：导出 ONNX 时不考虑动态 shape

**错误理解**：导出 ONNX 模型时只用固定 shape 的 dummy_input，认为部署时也能用相同 shape。

**正确理解**：如果导出时不声明 dynamic_axes，ONNX 模型会被固定为特定的输入 shape（如 batch_size=1）。部署时如果需要动态 batch 或序列长度，就必须重新导出，导致反复修改代码和重新测试。

**如何避免**：导出前就明确部署场景的 shape 需求。对于 NLP 模型，batch_size 和 seq_len 通常是动态的；对于 CV 模型，通常只需要动态 batch_size。使用 dynamic_axes 参数声明所有可变维度。

### 误区 2：忽略模型简化步骤

**错误理解**：直接把导出的 ONNX 模型用于推理，认为 PyTorch 导出的模型已经是最优的。

**正确理解**：PyTorch 导出的 ONNX 模型通常包含冗余算子和不必要的计算。onnxsim 可以做常量折叠、冗余算子消除、Shape 推断优化，显著减少模型大小和推理延迟。跳过这一步可能浪费 20-30% 的推理性能。

**如何避免**：导出后始终运行 onnxsim.simplify() 进行简化。对于复杂模型，可能需要调整 onnxsim 的参数（如 dynamic_input_shape）来处理动态 shape 情况。

### 误区 3：不做精度验证就部署

**错误理解**：ONNX 导出后直接部署到生产环境，假设输出和 PyTorch 完全一致。

**正确理解**：ONNX 导出过程中可能引入精度误差（如 BatchNorm 的 running stats 问题、自定义算子不支持等）。如果不做精度验证，可能部署了一个输出完全错误的模型，导致线上事故。

**如何避免**：导出后必须对比 PyTorch 和 ONNX 的输出差异。使用相同的输入数据，计算最大误差和平均误差。通常最大误差应小于 1e-3，如果超过这个阈值，需要检查模型是否有不支持的算子或模式。同时验证模型在不同输入 shape 下的输出一致性。

## 相关资源

- [ONNX 官方文档](https://onnxruntime.ai/docs/)
- [ONNX Model Zoo（预训练 ONNX 模型）](https://github.com/onnx/models)
- [TensorRT 文档](https://docs.nvidia.com/deeplearning/tensorrt/)
- [onnxsim GitHub](https://github.com/daquexian/onnx-simplifier)
