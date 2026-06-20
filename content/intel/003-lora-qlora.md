---
title: LLM 微调 - LoRA / QLoRA
category: llm
keywords:
  - lora
  - qlora
  - fine-tuning
  - peft
  - large language model
  - llm factory
difficulty: advanced
duration: 3-4周
summary: 仅训练大模型极小一部分参数就能让它适配你的领域任务，4-bit 量化把 7B 模型微调显存压缩到 6GB 级
takeaways:
  - 理解低秩分解（Low-Rank Decomposition）在权重更新中的直觉
  - 知道为什么通常只在 Q/V 投影矩阵上插入 LoRA adapter
  - 理解 NF4 量化与双量化的原理，以及 paged optimizer 的作用
  - 能用 LLaMA Factory / PEFT 跑一次 7B 级模型的 LoRA 微调
---

## 为什么你要学它

把一个 7B 参数的大语言模型全量微调，需要多少显存？粗略估算：**fp16 权重 14GB + 优化器状态 ~28GB + 梯度 ~14GB + 激活 ~30GB = 86GB 以上**，一张消费级显卡根本装不下。而且全量训练每个 checkpoint 要几十 GB，一次实验就是几天。对大多数团队来说，这条路走不通。

**LoRA（Low-Rank Adaptation）改变了游戏规则**：它不更新基座模型的权重，而是在某些层旁边插入两个小矩阵（降维矩阵 A 和升维矩阵 B），只训练这两个矩阵。参数量从 7B 降到**几万到几百万**，显存占用锐减到原来的几十分之一，推理时还能合并回权重不增加延迟。

**QLoRA 更进一步**：把基座模型量化成 4-bit 存储，再配合分页优化器，让 **7B 模型在 6GB 显存**的普通游戏卡上也能微调。这意味着你不必买 A100 也能做领域微调——这对中小团队和个人开发者至关重要。

学习 LoRA/QLoRA 不是为了写论文，而是为了掌握一个**可落地、可复现、成本可控**的大模型定制化方案。你的企业私有知识库、客服对话、代码生成助手，都是它的用武之地。

## 一句话概览（快速版）

- **LoRA 原理**：把权重更新 ΔW 拆成两个小矩阵 B × A（低秩分解），只训练 A 和 B。训练完可合并回 W，无额外推理开销。
- **QLoRA 三件套**：4-bit NF4 量化（针对正态分布的最优量化格式）+ 双量化（进一步省显存）+ paged optimizer（把优化器状态分页到 CPU 内存）。
- **上手路径**：先用 **LLaMA Factory** 的 WebUI 或命令行跑通一个 7B 模型的 SFT；再用 **PEFT + Transformers** 做更灵活的定制。

## 核心拆解

### 🔑 LoRA 的低秩分解直觉

假设一个大模型里某层的权重矩阵 W 形状是 `d × k`（比如 Attention 里 Q 投影，常见 d=k=4096）。全量微调时，我们学一个更新量 ΔW，形状也是 `d × k`，参数量 = d×k = 约 16M。

**LoRA 的假设是：大模型的"能力变化"其实不需要满秩。** 很多下游任务中，权重变化本质上是低秩的——它只在少数几个方向上调整。

于是 LoRA 把 ΔW 拆成两个更小的矩阵：

```
ΔW = B × A
B ∈ R^{d × r}
A ∈ R^{r × k}
```

其中 `r` 是秩（通常取 4~64）。参数量变成 `d×r + r×k`。当 d=k=4096、r=8 时：

- 全量：16.8M 参数
- LoRA：4096×8 + 8×4096 = **65.5K 参数**（约为原来的 0.4%）

前向传播时：

```
h = Wx + ΔWx = Wx + (B·A)x
```

W 冻结（不需要梯度），只有 A 和 B 需要梯度。

**为什么不直接学一个小矩阵？** 因为任何形状为 `d × k` 的矩阵都可做低秩分解，但把它显式地写成 B×A 的好处是：我们只需优化两个小矩阵，参数少、优化快，且天然有"低秩约束"防止过拟合。

### 🔑 为什么一般只在 Q/V 投影上插 LoRA

Transformer 里可以插入 LoRA 的位置很多：Q、K、V、O 投影矩阵，MLP 的 up/down 投影，甚至 embedding 层。但常见实践是**只在 Q 和 V 上插**（有时加上 Q/K/V/O 四个）。原因：

1. **覆盖面与成本的平衡**：Attention 的 Q/V 是影响模型"关注什么"和"用什么值响应"的核心，调整它们对下游任务影响大；K 和 O 的影响次之，但增加的参数也多。
2. **实验证据**：LoRA 原论文对比了多种插入方案，发现只在 Q/V 上插入已经能逼近全量微调效果，参数量却只有全量的千分之几。
3. **显存权衡**：每多一个 LoRA 目标模块，就多一份梯度存储。对 70B 模型来说，选 Q/V vs 选所有注意力投影矩阵，显存差很多。

在 PEFT 里配置示例：`target_modules=["q_proj", "v_proj"]`（Llama）或 `["q_lin", "v_lin"]`（其他模型）。如果你对效果不满意，再扩大到 `["q_proj", "k_proj", "v_proj", "o_proj"]`。

### 🔑 LoRA 的 rank 和 alpha 怎么选

两个关键超参：

- **r（rank）**：越高，表达能力越强，但参数越多、越容易过拟合。常见 8~32。
- **lora_alpha**：一个缩放因子，最终 ΔWx 会乘以 `alpha/r`。目的是当你改 r 时，可以通过改 alpha 保持更新量级大致不变。常见设置：alpha = 2×r（比如 r=8、alpha=16）。

经验建议：

| 场景 | 推荐 r | 推荐 alpha | 备注 |
|------|--------|------------|------|
| 指令跟随/SFT | 8 | 16 | 最常用的起步 |
| 复杂推理/数学 | 32 | 64 | 需要更强能力 |
| 风格迁移/角色扮演 | 4~8 | 8~16 | 变化不需要太大 |

训练后看验证损失曲线：如果过拟合明显（训练 loss 继续下降但验证 loss 上升），把 r 调小或加 dropout（`lora_dropout=0.05`）。

### 🔑 QLoRA：4-bit 量化与 NF4

QLoRA 的核心想法：**基座模型 4-bit 存储 + 计算时反量化到 bf16 + LoRA 权重 bf16 全精度训练**。这样基座权重只占原 1/4（7B 模型从 14GB 变到 ~3.5GB），而训练仍在较高精度进行。

关键技术：

**NF4（Normalized Float 4-bit）**：普通 int4 量化对均匀分布的权重友好，但预训练模型的权重更接近**零-centered 的正态分布**。NF4 把值域分成 16 个非均匀的 bin，小值附近 bin 更密，大值附近更疏，能更好地保留正态分布权重的信息。实践中 NF4 比普通 int4 的精度下降更少。

**双量化（Double Quantization）**：4-bit 量化本身需要记录每个 block 的量化常数（scale / zero-point），这些常数是 fp32 的，额外开销不小。双量化把这些常数本身再做一次量化，再省 ~0.4 bits/参数。

**Paged Optimizer**：训练时优化器状态（Adam 的 m/v）是显存大头。paged optimizer 把它们放在 CPU 内存"页"里，只有在更新那一步时才把当前 batch 需要的部分搬到 GPU。万一 GPU 显存不够，它还能进一步把部分状态 swap 到磁盘。这让 7B 模型在 6GB 卡上训练成为可能。

三者组合后的效果：**7B 模型 LoRA 微调，batch_size=1、seq_len=512、r=64，只需约 6GB 显存**，精度与 16-bit LoRA 差距很小（原论文报告 <0.1%）。

### 🔑 LoRA vs QLoRA vs 全量微调对比

| 方法 | 参数量 | 显存（7B） | 精度 | 推理是否需要额外开销 | 权重可合并 |
|------|--------|-----------|------|---------------------|-----------|
| 全量微调 | 7B | ~80GB+ | 最高 | 不需要 | N/A |
| LoRA（16-bit） | 0.1%~1% | ~20GB | 接近全量 | 不需要（可合并） | ✅ |
| QLoRA（4-bit） | 0.1%~1% | ~6GB | 略低于 16-bit LoRA | 不需要（可合并） | ✅ |

选择建议：

- 有 A100 且追求极限效果 → 全量微调
- 有 24GB 显卡（3090/4090）→ **LoRA（bf16）**
- 只有普通游戏卡或想省成本 → **QLoRA**
- 要在很多任务间切换且保留同一个基座 → **LoRA 多 adapter 切换，不合并**

### 🔑 SFT 数据格式

用 LLaMA Factory 时，常见数据格式是 JSONL，每条一个对话样本：

```json
{
  "instruction": "你是一个法律助手，请根据以下条款回答问题。",
  "input": "条款：劳动者提前三十日以书面形式通知用人单位，可以解除劳动合同。\n问题：试用期内可以随时解除合同吗？",
  "output": "不可以随时解除。根据《劳动合同法》，试用期内劳动者需提前三日通知用人单位..."
}
```

或多轮对话的 sharegpt 格式：

```json
{
  "conversations": [
    {"from": "human", "value": "帮我写一封邮件"},
    {"from": "gpt", "value": "好的，请问邮件主题和收件人是..."},
    {"from": "human", "value": "主题：项目延期说明，收件人：经理"},
    {"from": "gpt", "value": "经理您好，关于本次项目的进度情况..."}
  ]
}
```

## 完整跑通方案

### 第一步：用 LLaMA Factory 跑一次 7B 模型的 SFT（命令行）

```bash
pip install "llamafactory[torch,metrics,vllm]"
```

创建一个 `identity.json` 小数据集（放在 `./data/`）：

```json
[
  {"instruction": "你是谁？", "input": "", "output": "我是一个由开发者微调的 AI 助手。"},
  {"instruction": "介绍一下你自己", "input": "", "output": "我是基于开源大模型经过 LoRA 微调的助手，可以回答常见问题。"},
  {"instruction": "今天星期几？", "input": "", "output": "抱歉，我没有实时能力，但你可以告诉我今天的日期后我帮你计算。"}
]
```

注册这个数据集到 LLaMA Factory 的 `dataset_info.json`（或直接用内置的 `identity`）。然后跑：

```bash
llamafactory-cli train \
  --model_name_or_path Qwen/Qwen2.5-7B-Instruct \
  --stage sft \
  --do_train true \
  --finetuning_type lora \
  --quantization_bit 4 \
  --lora_target q_proj,v_proj \
  --lora_rank 32 \
  --lora_alpha 64 \
  --dataset identity \
  --template qwen \
  --cutoff_len 1024 \
  --learning_rate 5e-5 \
  --num_train_epochs 3 \
  --per_device_train_batch_size 2 \
  --gradient_accumulation_steps 4 \
  --lr_scheduler_type cosine \
  --max_grad_norm 1.0 \
  --logging_steps 10 \
  --save_steps 100 \
  --output_dir ./qwen-7b-lora
```

**参数含义速查**：

- `--stage sft`：做监督微调，不是 RLHF 或 DPO
- `--finetuning_type lora` + `--quantization_bit 4` = QLoRA
- `--lora_target q_proj,v_proj`：只在 Q/V 上插 LoRA
- `--gradient_accumulation_steps 4`：batch_size 太小，累积 4 步模拟大 batch
- `--learning_rate 5e-5`：LoRA 的学习率通常比全量微调大一个量级（全量 ~5e-6）

### 第二步：合并 adapter 并导出

```bash
llamafactory-cli export \
  --model_name_or_path Qwen/Qwen2.5-7B-Instruct \
  --adapter_name_or_path ./qwen-7b-lora \
  --finetuning_type lora \
  --template qwen \
  --export_dir ./qwen-7b-merged \
  --export_size 2 \
  --export_legacy_format false
```

合并后你会得到一个"看起来就是正常的 HuggingFace 模型"的目录，可直接用 transformers 推理，也可转 GGUF 给 llama.cpp。

### 第三步：用 PEFT + Transformers 做更灵活的 QLoRA

如果你需要更细的控制（比如自定义 loss、在训练过程中做定制化评估），用 PEFT 直接写：

```python
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling,
)
from peft import LoraConfig, get_peft_model, TaskType
from datasets import load_dataset

# 1. 4-bit 量化配置
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
)

# 2. 加载模型和 tokenizer
model_name = "Qwen/Qwen2.5-7B-Instruct"
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto",      # 让 accelerate 自动分配到 GPU/CPU
    torch_dtype=torch.bfloat16,
)
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

# 3. 套上 LoRA
lora_config = LoraConfig(
    r=8,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM,
)
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()  # 你会看到类似 "trainable params: 65,536 || all params: 7,200,000,000"

# 4. 准备数据（假设有一个自定义 JSONL）
ds = load_dataset("json", data_files="./data/identity.jsonl")["train"]
def tokenize_fn(example):
    text = f"### Instruction: {example['instruction']}\n### Output: {example['output']}"
    return tokenizer(text, truncation=True, max_length=512)
tokenized = ds.map(tokenize_fn, remove_columns=ds.column_names)

# 5. 训练
training_args = TrainingArguments(
    output_dir="./peft-qlora-out",
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    learning_rate=5e-5,
    num_train_epochs=3,
    logging_steps=10,
    save_strategy="epoch",
    optim="paged_adamw_8bit",     # 关键：分页 8-bit Adam，省显存
    fp16=True,                     # 若 GPU 支持 bf16 用 bf16=True 更好
    report_to="none",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized,
    data_collator=DataCollatorForLanguageModeling(tokenizer, mlm=False),
)
trainer.train()

# 6. 保存 adapter（只有几 MB！）
model.save_pretrained("./peft-qlora-out/final")
tokenizer.save_pretrained("./peft-qlora-out/final")
```

### 第四步：推理（加载 adapter 不合并）

```python
from peft import PeftModel, PeftConfig
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

peft_config = PeftConfig.from_pretrained("./peft-qlora-out/final")
base_model = AutoModelForCausalLM.from_pretrained(
    peft_config.base_model_name_or_path,
    device_map="auto",
    torch_dtype=torch.bfloat16,
)
tokenizer = AutoTokenizer.from_pretrained(peft_config.base_model_name_or_path)

model = PeftModel.from_pretrained(base_model, "./peft-qlora-out/final")
model.eval()

prompt = "你是谁？"
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
with torch.no_grad():
    out = model.generate(**inputs, max_new_tokens=100, temperature=0.7)
print(tokenizer.decode(out[0], skip_special_tokens=True))
```

## 常见误区

**误区 1：LoRA 要在所有层插入才够强** → 解释：实际上 Q/V 上插入已经覆盖大部分能力变化。盲目加到 MLP 和 embedding 上只会增加参数和显存，却不一定带来效果提升。从 Q/V 开始，效果不好再扩大范围。

**误区 2：r 越大越好** → 解释：r=64 已经够用，r=512 并不会让模型更聪明，反而容易过拟合小数据集。多数场景 r=8~32 是甜区。

**误区 3：学习率沿用全量微调的 5e-6** → 解释：LoRA 只训练极少数参数，需要更大的学习率。常见范围是 1e-5 ~ 5e-4。过低会收敛极慢，过高会发散。

**误区 4：用 fp16 计算的 4-bit 量化就等同于 QLoRA** → 解释：真正的 QLoRA 需要 **NF4 格式** + **双量化** + **paged_adamw_8bit** 优化器。普通 `load_in_4bit` 但用默认 int4 量化或普通 Adam，结果会差一截。

**误区 5：训练完直接把 adapter 合并就完事了** → 解释：合并前一定要做**人工抽样评估**（比如拿 20 条样本对比合并前/合并后/纯基座的回答质量）。某些情况下 LoRA 学到的"风格"在合并后会被稀释，可能需要再调 alpha 或 r。

**误区 6：数据只看数量不看质量** → 解释：LoRA/QLoRA 的上限由数据质量决定。2000 条精心清洗、格式一致、领域内的数据，比 20 万条垃圾 JSONL 效果好得多。好的做法：先跑几百条验证流程，再逐步加到几千条。
