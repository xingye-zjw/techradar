---
title: 模型量化：从 FP16 到 INT4
category: deployment
keywords:
  - quantization
  - int4
  - int8
  - gptq
  - awq
  - bitsandbytes
difficulty: intermediate
duration: 1周
summary: 把 7B 模型从 14GB 压到 4GB，让它在消费级 GPU 上也能跑——量化是模型部署的必修课
takeaways:
  - 理解量化的数学原理：从浮点到整数的映射
  - 能区分 GPTQ / AWQ / bitsandbytes 的适用场景
  - 能用 AutoGPTQ 或 bitsandbytes 量化一个模型
  - 能评估量化后的精度损失（< 5% 通常可接受）
---

## 为什么你要学它

一个 7B 参数的模型，FP16 精度需要 ~14GB 显存。RTX 3090 有 24GB，勉强能跑；RTX 4060 只有 8GB，根本不够。

**量化**是把模型从高精度（FP16/FP32）压缩到低精度（INT8/INT4）的技术：
- INT8：显存减半，精度损失 < 1%
- INT4：显存降到 1/4，精度损失 3-5%

量化后，7B 模型可以在 8GB 显存的消费级 GPU 上运行，推理速度也更快（整数运算比浮点快）。

## 一句话概览

- 量化 = 把连续的浮点值映射到离散的整数区间
- **Post-Training Quantization (PTQ)**：训练后量化，不需要重新训练
- **Quantization-Aware Training (QAT)**：训练时模拟量化，精度更高但成本更大
- 主流方法：GPTQ（逐层量化）、AWQ（activation-aware）、bitsandbytes（动态量化）

## 核心拆解

### 🔑 量化的数学原理

量化公式：
```
Q(x) = round(x / scale) + zero_point
```

- `scale`：缩放因子，把浮点范围映射到整数范围
- `zero_point`：零点偏移，让 0 能被精确表示

反量化：
```
x ≈ scale × (Q(x) - zero_point)
```

**INT4 量化**：把 FP16 的 [-1, 1] 范围映射到 INT4 的 [-8, 7]（4 bit 能表示 16 个值）。

### 🔑 GPTQ vs AWQ vs bitsandbytes

| 方法 | 特点 | 适用场景 |
|---|---|---|
| **GPTQ** | 逐层量化，用校准数据计算最优 scale | 需要离线量化，保存量化模型 |
| **AWQ** | Activation-aware，保护重要权重 | 更高精度，推荐用于 LLM |
| **bitsandbytes** | 动态量化，推理时量化 | 不需要保存量化模型，适合快速测试 |

### 🔑 量化精度评估

量化后的模型精度损失通常用以下指标评估：
- **Perplexity**：语言模型的标准指标，量化后 PPL 增加 < 5% 通常可接受
- **下游任务准确率**：如 MMLU / GSM8K，量化后准确率下降 < 3%
- **人工评估**：生成质量的主观感受

## 实战指南

### 用 AutoGPTQ 量化模型

```python
from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig

quantize_config = BaseQuantizeConfig(
    bits=4,           # INT4
    group_size=128,   # 每 128 个权重共享一个 scale
    desc_act=False    # 不使用 activation-aware
)

model = AutoGPTQForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-7B-Instruct",
    quantize_config
)

# 准备校准数据
calibration_data = ["示例文本1", "示例文本2", ...]

# 量化
model.quantize(calibration_data)

# 保存
model.save_quantized("qwen-7b-gptq-int4")
```

### 用 bitsandbytes 动态量化

```python
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-7B-Instruct",
    load_in_4bit=True,  # 动态 INT4 量化
    device_map="auto"
)

# 直接推理，无需保存量化模型
output = model.generate("Hello")
```

### 用 AWQ 量化（推荐）

```python
from awq import AutoAWQForCausalLM

model = AutoAWQForCausalLM.from_pretrained("Qwen/Qwen2.5-7B-Instruct")

# AWQ 量化配置
quant_config = {
    "zero_point": True,
    "q_group_size": 128,
    "w_bit": 4
}

# 量化
model.quantize(calibration_data, quant_config)

# 保存
model.save_quantized("qwen-7b-awq-int4")
```

## 相关资源

- [GPTQ 论文](https://arxiv.org/abs/2210.17323)
- [AWQ 论文](https://arxiv.org/abs/2306.00978)
- [bitsandbytes GitHub](https://github.com/TimDettmers/bitsandbytes)
- [AutoGPTQ GitHub](https://github.com/AutoGPTQ/AutoGPTQ)