# ONNX（Open Neural Network Exchange）

**ONNX** 是微软和 Facebook 共同推出的跨框架模型格式，定义了一套标准化的算子 IR（中间表示），实现模型在不同框架间的无缝转换。

## 核心价值

```
训练框架：PyTorch / TensorFlow / JAX
              ↓ (导出)
         ONNX 格式 (.onnx)
              ↓ (推理引擎)
ONNXRuntime / TensorRT / OpenVINO / CoreML
```

## 模型导出示例

### PyTorch 导出 ONNX

```python
import torch
import torch.nn as nn

# 定义模型
class SimpleModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 16, 3, padding=1)
        self.fc = nn.Linear(16 * 32 * 32, 10)
    
    def forward(self, x):
        x = torch.relu(self.conv1(x))
        x = x.view(x.size(0), -1)
        return self.fc(x)

model = SimpleModel()
model.eval()

# 导出 ONNX
dummy_input = torch.randn(1, 3, 32, 32)
torch.onnx.export(
    model,
    dummy_input,
    "model.onnx",
    export_params=True,
    opset_version=11,
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
)

print("模型已导出为 model.onnx")
```

### ONNX 模型验证

```python
import onnx
import onnxruntime as ort

# 验证模型结构
model = onnx.load("model.onnx")
onnx.checker.check_model(model)
print("模型验证通过！")

# 使用 ONNXRuntime 推理
session = ort.InferenceSession("model.onnx")
input_data = dummy_input.numpy()
outputs = session.run(None, {'input': input_data})
print(f"输出 shape: {outputs[0].shape}")
```

## 性能优化

### 1. 模型简化（onnxsim）

```python
import onnx
from onnxsim import simplify

model = onnx.load("model.onnx")
model_simp, check = simplify(model)

assert check, "简化后的模型验证失败"
onnx.save(model_simp, "model_simplified.onnx")
```

### 2. 量化优化

```python
from onnxruntime.quantization import quantize_dynamic, QuantType

# 动态量化（无需校准数据）
quantize_dynamic(
    model_input="model.onnx",
    model_output="model_quantized.onnx",
    weight_type=QuantType.QInt8
)

# INT8 量化，模型体积减小 50%，推理速度提升 2x
```

### 3. 图优化

```python
import onnxruntime as ort

# 启用图优化
session = ort.InferenceSession(
    "model.onnx",
    providers=['CUDAExecutionProvider', 'CPUExecutionProvider'],
    sess_options=ort.SessionOptions()
)

# 优化级别
session_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
```

## 推理引擎对比

| 引擎 | 平台 | 优势 |
|------|------|------|
| **ONNXRuntime** | CPU/GPU | 微软官方，跨平台 |
| **TensorRT** | NVIDIA GPU | 极致性能优化 |
| **OpenVINO** | Intel CPU/GPU | Intel 硬件优化 |
| **CoreML** | Apple 设备 | iOS/macOS 集成 |
| **NCNN** | 移动端 | 轻量级，ARM 优化 |

## 应用场景

- **跨框架部署**：PyTorch 训练 → ONNX → TensorRT 推理
- **边缘设备**：手机、嵌入式设备模型部署
- **模型服务**：统一模型格式，支持多框架推理
- **模型压缩**：量化、剪枝后的标准化输出

## 常见问题

```python
# 1. Opset 版本不兼容
torch.onnx.export(..., opset_version=13)  # 使用较新版本

# 2. 动态 shape 支持
dynamic_axes = {
    'input': {0: 'batch_size', 2: 'height', 3: 'width'},
    'output': {0: 'batch_size'}
}

# 3. 算子不支持
# 查看支持的算子：https://github.com/onnx/onnx/blob/main/docs/Operators.md
```

## 相关概念

[模型量化](/glossary/quantization)、[模型部署](/glossary/model-deployment)、[TensorRT](/glossary/tensorrt)
