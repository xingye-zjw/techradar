---
title: LLM 微调技术全景：从 SFT 到 LoRA
category: llm-fundamentals
keywords:
  - fine-tuning
  - sft
  - lora
  - qlora
  - peft
  - adapter
difficulty: intermediate
duration: 1周
summary: 全量微调太贵？LoRA 用 0.1% 的参数达到 95% 的效果——微调技术的性价比革命
takeaways:
  - 理解全量微调（Full Fine-tuning）的成本和局限
  - 理解 LoRA 的数学原理：低秩分解
  - 能用 PEFT 库实现 LoRA 微调
  - 理解 QLoRA（4-bit + LoRA）的显存优化
---

## 为什么你要学它

全量微调一个 7B 模型：
- 显存：需要 ~100GB（FP16 模型 + 梯度 + Optimizer 状态）
- 时间：单卡需要数天
- 存储：每个微调版本都是完整的 7B 模型

**LoRA（Low-Rank Adaptation）** 的突破：
- 只训练 0.1% 的参数（~7M vs 7B）
- 显存需求降到 ~20GB（单卡可跑）
- 每个微调版本只需存储 ~20MB 的 LoRA 权重

如果你想低成本定制 LLM（如领域问答、风格迁移），LoRA 是必学技术。

## 一句话概览

- **全量微调**：更新所有参数，成本最高，效果最好
- **LoRA**：在权重矩阵旁加低秩分解矩阵，只训练这两个小矩阵
- **QLoRA**：4-bit 量化 + LoRA，显存需求降到 ~6GB
- **PEFT**：HuggingFace 的参数高效微调库

## 核心拆解

### 🔑 LoRA 的数学原理

核心假设：权重更新 ΔW 可以用低秩矩阵分解：

```
ΔW = A × B
其中 A: (d, r), B: (r, k), r << d, k
```

例如：d=4096, k=4096, r=8
- 全量更新：ΔW 有 4096×4096 = 16M 参数
- LoRA：A + B 有 4096×8 + 8×4096 = 65K 参数（减少 99.6%）

训练时：
- 原始权重 W₀ 冻结
- 只训练 A 和 B
- 前向传播：W = W₀ + A × B

```python
class LoRALayer(nn.Module):
    def __init__(self, original_layer, rank=8):
        super().__init__()
        self.original = original_layer  # 冻结
        
        d = original_layer.in_features
        k = original_layer.out_features
        
        # LoRA 矩阵
        self.A = nn.Parameter(torch.randn(d, rank) * 0.01)
        self.B = nn.Parameter(torch.zeros(rank, k))
    
    def forward(self, x):
        # 原始输出 + LoRA 输出
        return self.original(x) + (x @ self.A @ self.B)
```

### 🔑 PEFT 库实现 LoRA

```python
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM

# 加载基础模型
model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-7B-Instruct")

# LoRA 配置
lora_config = LoraConfig(
    r=8,                    # LoRA rank
    lora_alpha=32,          # 缩放因子
    target_modules=["q_proj", "v_proj"],  # 只对 attention 的 Q/V 做 LoRA
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

# 应用 LoRA
model = get_peft_model(model, lora_config)

# 查看可训练参数
model.print_trainable_parameters()
# trainable params: 4,194,304 || all params: 7,000,000,000 || trainable%: 0.06%
```

### 🔑 QLoRA：4-bit + LoRA

QLoRA 在 LoRA 基础上进一步降低显存：
- 基础模型用 4-bit 量化加载
- LoRA 矩阵用 FP16 训练
- 显存需求：~6GB（7B 模型）

```python
from transformers import BitsAndBytesConfig

# 4-bit 量化配置
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True
)

# 加载量化模型
model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-7B-Instruct",
    quantization_config=bnb_config,
    device_map="auto"
)

# 应用 LoRA
model = get_peft_model(model, lora_config)
```

### 🔑 LoRA 权重合并

训练完成后，可以把 LoRA 权重合并到原始模型：

```python
from peft import PeftModel

# 加载原始模型
base_model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-7B-Instruct")

# 加载 LoRA 权重
peft_model = PeftModel.from_pretrained(base_model, "./lora_weights")

# 合并
merged_model = peft_model.merge_and_unload()

# 保存合并后的模型
merged_model.save_pretrained("./merged_model")
```

## 实战指南

### LoRA 微调完整流程

```python
# 1. 准备数据
train_data = prepare_sft_data("sft_data.json")

# 2. 加载模型 + LoRA
model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-7B-Instruct")
model = get_peft_model(model, LoraConfig(r=8, target_modules=["q_proj", "v_proj"]))

# 3. 训练
trainer = SFTTrainer(
    model=model,
    train_dataset=train_data,
    args=TrainingArguments(
        output_dir="./lora_output",
        num_train_epochs=3,
        per_device_train_batch_size=4,
        learning_rate=1e-4,
        fp16=True
    )
)
trainer.train()

# 4. 保存 LoRA 权重
model.save_pretrained("./lora_weights")
```

## 常见误区

### 误区 1：LoRA 的 rank 越高，效果越好

**错误理解**：很多人认为增加 LoRA 的 rank（如从 8 增加到 64）就能线性提升微调效果。

**正确理解**：LoRA 的 rank 决定了低秩矩阵的表达能力，但过高的 rank 会导致过拟合和显存浪费。研究表明，对于大多数任务，rank=8-16 就能达到接近全量微调的效果，继续增加 rank 的收益递减明显。此外，高 rank 的 LoRA 权重在推理时需要更多计算资源。

**如何避免**：从 rank=8 开始实验，监控训练和验证 loss。如果验证 loss 不再下降或开始上升，说明可能过拟合，应该降低 rank。对于简单任务（如风格迁移），rank=4 就足够；对于复杂任务（如领域知识学习），可以尝试 rank=16-32。

### 误区 2：LoRA 可以在所有层上使用

**错误理解**：很多人认为应该对模型的所有线性层都应用 LoRA，以获得最佳效果。

**正确理解**：研究表明，LoRA 的效果取决于目标模块的选择。通常，对 Attention 层的 Q/V 投影矩阵应用 LoRA 效果最好，因为这些层对模型的行为影响最大。对所有层都应用 LoRA 可能导致训练不稳定，且显存开销接近全量微调，失去了 LoRA 的优势。

**如何避免**：优先对 Attention 层的 q_proj 和 v_proj 应用 LoRA。如果效果不理想，可以逐步增加 k_proj、o_proj 和 MLP 层。使用 PEFT 库的 `target_modules` 参数精确控制应用 LoRA 的层，并通过 `print_trainable_parameters()` 监控可训练参数量。

### 误区 3：QLoRA 的精度损失可以忽略

**错误理解**：很多人认为 QLoRA（4-bit 量化 + LoRA）只是显存优化，对精度没有影响。

**正确理解**：QLoRA 的基础模型用 4-bit 量化加载，虽然 LoRA 矩阵用 FP16 训练，但基础模型的量化损失会影响整体效果。对于精度要求极高的任务（如医疗、法律），QLoRA 的表现可能不如全精度 LoRA。此外，某些模型架构对量化更敏感，可能产生更大的精度损失。

**如何避免**：在资源允许的情况下，先尝试全精度 LoRA 作为 baseline。如果显存不足再使用 QLoRA，并在目标任务上验证精度是否可接受。对于关键应用，可以考虑 INT8 量化 + LoRA 作为折中方案。定期评估 QLoRA 微调模型在实际场景中的表现。

## 相关资源

- [LoRA 论文](https://arxiv.org/abs/2106.09685)
- [QLoRA 论文](https://arxiv.org/abs/2305.14314)
- [PEFT 库文档](https://huggingface.co/docs/peft/)
- [LoRA 合并工具](https://github.com/cloneofsimo/lora)