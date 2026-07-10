---
title: TensorRT FP16 精度溢出导致推理结果全 NaN
category: deep-learning
summary: TensorRT 引擎以 FP16 精度构建后，推理时中间张量数值超过 FP16 表示范围（65504）发生上溢或下溢，导致输出全为 NaN 或 Inf，涵盖构建器日志分析、精度层覆盖、INT8 校准、动态范围探测等排查与修复方案。
difficulty: advanced
excerpt: TensorRT 引擎以 FP16 精度构建后，推理时中间张量数值超过 FP16 表示范围（65504）发生上溢或下溢，导致输出全为 NaN 或 Inf，涵盖构建器日志分析、精度层覆盖、INT8 校准、动态范围探测等排查与修复方案。
relatedTerms:
  - transformer
  - cnn
  - gradient-descent
  - tensor
  - matrix
relatedTools:
  - pytorch
  - huggingface-transformers
  - numpy
relatedNodes:
  - llm-inference
  - cv-segmentation
prevention: TensorRT 构建前先用 FP32 参考推理记录每层的动态范围；强制对易溢出的层（Softmax、LayerNorm 分母、Large KV Cache）设置 FP32 精度层覆盖；对大模型推理开启 KV Cache 缩放和 per-token 归一化。
consequences: 生产环境推理服务间歇性返回全 NaN 结果导致业务流程崩溃；检测模型输出全 0 置信度漏检所有目标，自动驾驶场景可能引发安全事故；量化后精度损失严重导致用户投诉和回滚。
detection: 开启 TensorRT verbose 日志搜索 overflow 或 NaN 关键字；对比 FP32 ONNX Runtime 与 TensorRT FP16 每一层的输出张量最大值；用 polygraphy 逐层 dump 激活值定位首次出现 NaN 的层；输入极端值样本复现溢出。
tags:
  - 深度学习
  - DL
  - 训练
  - PyTorch
---

## 为什么你要学它

这是开发中非常容易踩的一个坑：**TensorRT FP16 精度溢出导致推理结果全 NaN**。

把模型从 PyTorch FP32 导出为 TensorRT FP16 引擎加速推理，是 CV 和 LLM 部署的标准操作。但 FP16（半精度浮点数）可表示的数值范围非常有限：最大正值仅为 65504，最小正规数约为 6.1e-5。当模型中间计算（尤其是注意力机制的 Softmax 分母、LayerNorm 的方差、大 KV Cache 的累积和、大 batch 的矩阵乘法）超出这个范围时，就会发生上溢（→Inf）或下溢（→0）。如果有任何一步产生了 Inf 或 NaN，后续所有计算都会被污染，最终整个输出张量全部变成 NaN。这类问题调试极其痛苦，因为构建日志里通常不会直接报错，只有推理时才暴露。

如果你正在做 TensorRT 部署、模型量化加速，或者遇到了"FP32 正常但 FP16 全 NaN"的灵异问题，这篇卡片会帮你快速定位溢出层、修复精度问题，并学会在构建前提前规避。

## 一句话概览（快速版）

> **快速修复：polygraphy 逐层 dump 激活值 + 对溢出层设置 FP32 precision constraint**

核心要点：

- **现象**：TensorRT FP16 引擎构建成功，但推理输出全为 NaN 或 Inf；同模型 ONNX Runtime FP32 推理完全正常
- **根因**：中间计算超出了 FP16 表示范围（±65504），常见于：Softmax 的 exp 输入过大、LayerNorm 分母趋近 0、大 KV Cache 累积求和、大 batch GEMM 中间结果上溢。LayerNorm 和 Softmax 是溢出最高发的两个层
- **解决**：按照下方 6 步标准流程定位和修复

## 核心拆解

### 🔑 典型症状

- × TensorRT FP16 引擎构建成功无报错，但推理输出全为 NaN 或全为 0
- × 同模型 ONNX Runtime FP32 / PyTorch 原生推理结果完全正常
- × 某些输入（极端亮度、长序列、大 batch size）必现 NaN，其他输入正常
- × 启用了 INT8 量化后 NaN 概率进一步升高，或量化校准失败

### 🔑 根本原因

中间计算超出了 FP16 表示范围（±65504），常见于：Softmax 的 exp 输入过大、LayerNorm 分母趋近 0、大 KV Cache 累积求和、大 batch GEMM 中间结果上溢。LayerNorm 和 Softmax 是溢出最高发的两个层。尤其对于大语言模型，当上下文长度超过 4K、KV Cache 序列维度累积时，Softmax 输入规模急剧增大，极易触发 exp(x) → ∞。另一个隐蔽来源是：ONNX 导出时某些层的权重包含了极大的常数值（如 LayerNorm 的 epsilon 设置过小 1e-12 导致除以接近 0 的数）。

## 完整排查方案

按照以下步骤逐一排查，通常能在 1-2 小时内定位溢出层并修复：

1.  用 ONNX Runtime FP32 跑一遍验证参考输出正常，排除 ONNX 模型本身的问题
2.  安装 polygraphy（TensorRT 官方调试工具），用 --trt --fp16 跑推理并开启 --verbose 日志，搜索 overflow、nan、inf 关键字
3.  用 polygraphy inspect model 逐层标注，再用 compare 子命令对比 ONNX FP32 和 TensorRT FP16 每一层的输出，找到第一个最大差值超过 1e-2 的层
4.  对定位到的层，在 TensorRT Builder 中设置 precision constraint：`config.set_flag(trt.BuilderFlag.STRICT_TYPES)` 后针对特定层 `layer.precision = trt.DataType.FLOAT` 强制使用 FP32
5.  如果溢出发生在 Softmax：在模型中给 Softmax 输入前加一个 per-row max subtraction（PyTorch 已做但导出 ONNX 时有时丢失），或开启 TensorRT 的 SOFTMAX_FP16_ACCUMULATOR 标志
6.  对 LLM 场景开启 KV Cache 缩放（如 FP8 缩放因子、per-channel 量化），或将 LayerNorm 的 epsilon 从 1e-12 调整为 1e-5 避免分母过小

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> 用下面的 polygraphy 脚本快速定位第一个 NaN 层，然后对该层强制 FP32 精度

```bash
# 1. 对比 FP32 参考与 FP16 推理的逐层差异
polygraphy run model.onnx \
    --trt --fp16 \
    --onnxrt \
    --atol 1e-2 --rtol 1e-2 \
    --check-error-stat max \
    --verbose 2>&1 | grep -E "(Mismatched|FAILED|nan|inf|Layer)"

# 2. 导出 TensorRT 引擎逐层激活值 dump
polygraphy run model.onnx --trt --fp16 \
    --trt-min-shapes input:[1,3,224,224] \
    --trt-opt-shapes input:[4,3,224,224] \
    --trt-max-shapes input:[16,3,224,224] \
    --save-outputs outputs_fp16.json \
    --all-outputs

# 3. 构建时对 LayerNorm 和 Softmax 强制 FP32（Python API 示例）
import tensorrt as trt
builder = trt.Builder(trt.Logger(trt.Logger.VERBOSE))
network = builder.create_network()
parser = trt.OnnxParser(network, trt.Logger())
parser.parse_from_file("model.onnx")
config = builder.create_builder_config()
config.set_flag(trt.BuilderFlag.FP16)
for i in range(network.num_layers):
    layer = network.get_layer(i)
    if "LayerNorm" in layer.name or "Softmax" in layer.name:
        layer.precision = trt.DataType.FLOAT
        for o in range(layer.num_outputs):
            layer.set_output_type(o, trt.DataType.FLOAT)
engine = builder.build_serialized_network(network, config)
```

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- TensorRT 构建流水线强制加入"FP32 vs FP16 逐层 diff"校验步骤，diff 超过阈值直接拦截不发布
- 对大模型的 LayerNorm epsilon 统一设置为 1e-5 而非 1e-12，避免分母过小放大误差
- 注意力 Softmax 前强制做 per-query 最大值减法：`attn = exp(qk - max(qk, dim=-1, keepdim=True))`，即便在框架已经自动处理的情况下也显式加一层保险
- 构建引擎时同时生成 FP32 fallback 版本作为兜底，线上监控如果 NaN 比例超过阈值自动切回 FP32
- 对新模型的部署验收用例中加入极端输入：全 0 输入、最大值输入、长序列（训练长度 2 倍）、空输入，确保不会 NaN

## 常见误区

1. **看到 FP16 就无脑开，不验证动态范围** — 很多模型层的天然动态范围就不适合 FP16，必须做层级精度控制
2. **只验证平均输入，不验证边界输入** — 溢出大多发生在极端值输入，平均 case 测试通过不代表安全
3. **INT8 校准用随机数据而不是真实数据** — 校准集分布不匹配会导致量化范围设置错误，间接放大溢出概率

## 推荐学习顺序

1. 先看「典型症状」确认你遇到的是不是 FP16 精度溢出
2. 再看「快速修复」用 polygraphy 脚本快速定位问题层
3. 如果定位不到，按照「完整排查方案」从参考验证到逐层对比一步步来
4. 最后一定要看「预防措施」，把 FP16 验证和 FP32 兜底固化到部署流水线中
