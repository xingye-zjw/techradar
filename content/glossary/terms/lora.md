# LoRA（低秩适应）

**LoRA（低秩适应）** 是一种高效的大型模型微调方法，由 Microsoft 研究团队于 2021 年在论文 [*LoRA: Low-Rank Adaptation of Large Language Models*](https://arxiv.org/abs/2106.09685) 中提出。它通过对权重矩阵的**低秩分解**来更新模型，极大地减少了可训练参数的数量，使得在消费级 GPU 上微调大型语言模型成为可能。

## 背景问题

传统的全量微调（Full Fine-tuning）存在以下问题：

- **训练成本极高**：一个 7B 模型需要至少 30GB 显存才能进行微调
- **存储成本高**：为每个任务存储一份完整的模型权重，难以管理
- **灾难性遗忘**：更新全部参数容易破坏预训练时学到的通用能力

LoRA 的思路是：我们是否真的需要更新**所有**参数？或者说，模型需要学习的「增量知识」是否具有某种低秩结构？

## 核心思想：低秩分解

假设预训练权重矩阵为 `W₀`，形状为 `d × k`。在全量微调中，我们直接优化 `W₀`。

LoRA 不直接修改 `W₀`，而是**冻结**它，然后额外加入两个小矩阵 `A` 和 `B`：

```
W = W₀ + B · A
    ↑         ↑
冻结权重    低秩增量（可训练）

其中 B ∈ R^(d × r), A ∈ R^(r × k), r << min(d, k)
```

这里 `r` 是 LoRA 的**秩 (rank)**，典型值为 4、8、16、64。

**直觉理解**：模型需要学习的增量知识只存在于一个低维子空间中，我们只在这个子空间中做优化。

## 为什么有效？

### 1. 参数数量对比

以 GPT-3 的一个注意力层为例（假设 d=k=12288）：

| 方法 | 参数数量 | 占原权重比例 |
|------|---------|--------------|
| 全量微调 | 12288 × 12288 = 1.5亿 | 100% |
| LoRA (r=8) | 2 × 12288 × 8 = 196,608 | 0.13% |

**减少了约 750 倍的参数数量**！

### 2. 显存对比

| 方法 | 7B 模型训练显存 |
|------|----------------|
| 全量微调 | ~80GB |
| LoRA | ~12GB |

**从需要 A100 级别的专业 GPU 降到 RTX 4090 消费级显卡即可运行。**

## LoRA 的实际应用流程

```
步骤 1：加载预训练模型并冻结
    model = AutoModelForCausalLM.from_pretrained("gpt2")
    for param in model.parameters():
        param.requires_grad = False

步骤 2：在注意力层中插入 LoRA 权重
    for layer in model.transformer.h:
        # 替换 W_q 和 W_v 的权重更新方式
        layer.attn.W_q = LoRALinear(W_q_weight, rank=8)
        layer.attn.W_v = LoRALinear(W_v_weight, rank=8)

步骤 3：只训练新增的 LoRA 参数
    lora_params = [p for p in model.parameters() if p.requires_grad]
    optimizer = AdamW(lora_params, lr=1e-4)

步骤 4：训练（只更新 A 和 B，W₀ 保持不变）
    for batch in data:
        loss = model(batch)
        loss.backward()
        optimizer.step()

步骤 5：推理时合并权重（可选）
    W_final = W₀ + B · A  # 无额外推理开销
```

## 超参数选择

| 超参数 | 推荐值 | 注意事项 |
|--------|--------|---------|
| `r` (秩) | 4~64 | 越大性能越好，但参数增加；8 是常用折中 |
| `α` (缩放) | 通常 = r | `ΔW = α/r × B·A`，控制 LoRA 对输出的影响 |
| `dropout` | 0~0.1 | 轻微的 dropout 可以提升泛化能力 |
| `target_modules` | W_q, W_v, W_k | 越大覆盖面越好，可包括 MLP |
| 学习率 | 1e-4 ~ 5e-4 | 通常比全量微调的学习率**大**一个数量级 |

## LoRA 的变体与扩展

| 变体 | 说明 |
|------|------|
| **QLoRA** | 4-bit 量化 + LoRA，进一步降低显存需求 |
| **AdaLoRA** | 自适应地为不同模块分配不同的秩 |
| **DoRA** | Weight-Decomposed Low-Rank Adaptation，改进的权重分解 |
| **LoRA-FA** | Frozen A，只更新 B，进一步降低参数 |
| **VeRA** | Vector-based Random Matrix Adaptation，固定随机矩阵 |

## 在实际项目中使用 LoRA

使用 PEFT (Parameter-Efficient Fine-Tuning) 库可以非常方便地实现 LoRA：

```python
from peft import LoraConfig, get_peft_model

config = LoraConfig(
    r=8,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = AutoModelForCausalLM.from_pretrained("Llama-2-7b-hf")
model = get_peft_model(model, config)
model.print_trainable_parameters()
# 输出: trainable params: 4,194,304 || all params: 6,742,609,920 || trainable%: 0.0622
```

## LoRA 的优势与局限

### 优势 ✅
- **训练快、显存低**：成本降低一到两个数量级
- **无推理开销**：部署时可以把 LoRA 权重合并回原权重
- **存储效率高**：每个任务的 checkpoint 只有几 MB
- **无灾难性遗忘**：冻结的权重保留了原模型的通用能力
- **可组合**：可以同时加载多个 LoRA 适配器（Mix-of-Adapters）

### 局限 / 注意事项 ❗
- **需要精心选择 target_modules**：某些任务可能需要覆盖更多层
- **超参数敏感**：秩 r 过大可能过拟合，过小可能表达力不足
- **不适合从零学习**：LoRA 的表达力有限，不适合与全量微调需要完全重构知识的场景

## LoRA 之外的 PEFT 方法

| 方法 | 原理 | 典型参数占比 |
|------|------|-------------|
| Adapter | 在 Transformer 层之间插入小型网络 | ~0.5% |
| **LoRA** | 低秩分解权重更新 | ~0.01~0.1% |
| **QLoRA** | LoRA + 4-bit 量化 | ~0.01% |
| **Prefix Tuning** | 只优化前缀 token | ~0.1% |
| Prompt Tuning | 只优化连续的 prompt 嵌入 | ~0.01% |
| BitFit | 只微调 bias 项 | ~0.001% |

LoRA 由于其简洁性和有效性，已成为当前 PEFT 方法中最受欢迎的一种。

相关术语：[微调](/glossary/fine-tuning)、[Transformer](/glossary/transformer)、[RAG](/glossary/rag)
