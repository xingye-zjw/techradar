# 微调 (Fine-tuning)

**微调（Fine-tuning）** 是在**预训练模型**的基础上，使用特定任务的数据继续训练，让模型适应新任务的过程。它是迁移学习在深度学习中的核心应用形式之一。

## 基本思想

深度学习的一个核心洞察是：

> **模型在大量通用数据上学到的底层特征（边缘、纹理、语法结构等）可以被复用在许多下游任务中。**

因此不必从零开始训练——我们可以站在巨人的肩膀上：

```
预训练阶段 (Pre-training)       微调阶段 (Fine-tuning)
─────────────────────────       ────────────────────────

[大量通用数据]                   [特定任务数据]
       ↓                               ↓
[训练大模型]                       [继续训练]
       ↓                               ↓
[通用能力]                       [特定任务能力]
                                 (图像分类、文本生成、...)
```

## 为什么需要微调？

### 1. 适应特定任务
预训练模型学到的是通用语言/视觉能力，但：
- 你可能需要模型理解医学术语
- 你可能需要模型输出特定格式的 JSON
- 你可能需要模型模仿某位作家的风格

### 2. 提高特定场景精度
- 在企业内部文档问答场景，预训练模型可能对专有名词不熟悉
- 在医学影像分析中，预训练模型学到的通用视觉特征不够领域专用

### 3. 降低训练成本
- 预训练 GPT-3 需要 355 GPU-years，成本数百万美元
- 微调同样的模型只需要几小时到几天

## 微调的分类

### 按参数更新范围

| 方法 | 更新参数 | 参数占比 | 说明 |
|------|---------|---------|------|
| **全量微调** (Full FT) | 全部参数 | 100% | 效果最好，但算力和存储要求最高 |
| **线性探测** (Linear Probing) | 仅最后一层 | ~0.1% | 冻结 Backbone，只训练分类头 |
| **部分层微调** | 最后 N 层 | 5~30% | 常见折中方案 |
| **Adapter Tuning** | 新增 Adapter 层 | ~0.5% | 在 Transformer 层间插入小型网络 |
| **LoRA** | 新增低秩矩阵 | ~0.01~0.1% | 低秩分解权重更新，目前最流行 |
| **Prompt Tuning** | Prompt 向量 | ~0.01% | 只优化输入层的连续 prompt |
| **BitFit** | Bias 项 | ~0.001% | 只训练 bias 参数 |

### 按训练方式

| 方法 | 说明 | 典型应用 |
|------|------|---------|
| **Instruction Tuning** | 使用指令-答案对训练 | 让模型遵循人类指令 |
| **RLHF** (Reinforcement Learning from Human Feedback) | 用人类偏好奖励模型 | ChatGPT、Claude 的对齐方法 |
| **LoRA / QLoRA** | PEFT 的代表 | 大模型高效微调 |
| **P-Tuning / Prefix-Tuning** | 优化前缀/连续 prompt | 参数量极少 |
| **Self-Instruct** | 用模型自己生成的数据来微调 | 扩充训练数据 |
| **DPO** (Direct Preference Optimization) | 直接用偏好数据优化，不需要奖励模型 | 新一代对齐方法 |
| **LORA + DPO** | 先 SFT（监督微调），再用 DPO 对齐 | 目前开源模型的主流管线 |

## 微调的关键技术决策

### 1. 学习率 (Learning Rate)

```
预训练: 1e-4 ~ 1e-3 (大)
────────────────────────────
微调: 1e-5 ~ 5e-5 (小)
       ↑
       通常是预训练的 1/10 ~ 1/100
```

**为什么要小？** 因为预训练模型已经接近最优解，你只需要做细微调整，不能破坏学到的知识。

### 2. 冻结 vs 解冻

常见的两阶段策略：

```python
# Stage 1: 只训练分类头（warmup）
for param in model.parameters():
    param.requires_grad = False
model.fc.requires_grad = True

# Stage 2: 解冻后几层，逐步放开
for param in model.layer4.parameters():
    param.requires_grad = True

# Stage 3: 全量微调（可选）
for param in model.parameters():
    param.requires_grad = True
```

### 3. 学习率调度 (LR Scheduling)

- **Cosine Decay**：余弦退火，当前最常用
- **Linear Warmup + Decay**：先线性升温，后逐步衰减
- **Slanted Triangular**：先快速升温后缓慢下降，适合微调

### 4. Optimizer 选择

- **AdamW**：Transformer 微调的默认选择，对权重衰减处理更好
- **SGD + Momentum**：CNN 传统首选，在某些视觉任务上仍有优势
- **Adafactor**：处理极大 batch 时的内存优化版 Adam

### 5. 数据增强

对视觉任务：
- 随机裁剪、水平翻转、颜色抖动（轻度）
- RandAugment / AutoAugment

对 NLP 任务：
- 同义词替换
- 回译（中文→英文→中文）
- 随机 mask / shuffle
- 用 LLM 生成合成数据

## 微调流程模板（以 PyTorch + HuggingFace 为例）

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from peft import LoraConfig, get_peft_model
import torch

# 1. 加载预训练模型和分词器
model_name = "bert-base-chinese"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(
    model_name, num_labels=2
)

# 2. (可选) 配置 LoRA，用于高效微调
config = LoraConfig(
    r=8, lora_alpha=32, target_modules=["q_lin", "v_lin"],
    lora_dropout=0.05, bias="none", task_type="SEQ_CLS"
)
model = get_peft_model(model, config)
model.print_trainable_parameters()
# 输出: trainable params: X || all params: Y || trainable%: Z%

# 3. 准备数据
train_dataset = YourDataset(tokenizer, split="train")
eval_dataset = YourDataset(tokenizer, split="eval")

# 4. 配置训练器
from transformers import Trainer, TrainingArguments
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=16,
    learning_rate=2e-5,           # ← 关键：小学习率
    warmup_ratio=0.1,
    weight_decay=0.01,
    logging_steps=100,
    evaluation_strategy="steps",
    fp16=True,                     # 半精度加速
    gradient_accumulation_steps=2,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
)

# 5. 开始训练
trainer.train()

# 6. 保存 & 评估
model.save_pretrained("./finetuned_model")
eval_results = trainer.evaluate()
print(eval_results)
```

## 微调效果评估

### 1. 验证集指标
- 分类：Accuracy、F1、AUC
- 生成：BLEU、ROUGE、BERTScore（不可靠但可参考）
- 人类评估（Golden Standard）

### 2. 过拟合监测
- 训练 loss 持续下降，但验证 loss 上升 → 过拟合
- 解决：提前停止 (Early Stopping)、数据增强、Dropout、权重衰减

### 3. 灾难性遗忘检测
- 在原任务上重新测试，检查性能下降
- 如有下降：考虑 EWC、Replay Buffer、Adapter 等方法

## 微调 vs RAG：何时选择什么？

| 场景 | 推荐方法 | 理由 |
|------|---------|------|
| 企业内部文档问答 | **RAG 优先** | 知识可追溯、易更新 |
| 模仿特定作家风格 | **微调优先** | RAG 难以学习风格 |
| 医疗/法律专业问答 | **RAG + 微调** | RAG 提供来源，微调学习术语 |
| 代码补全/生成 | **微调优先** | 风格 + 模式学习 |
| 聊天机器人个性 | **微调 + DPO** | 行为模式学习 |
| 实时信息问答 | **RAG（可能 + 工具调用）** | 需要最新信息 |

## 常见陷阱

### ❌ 学习率过大
- 症状：训练 loss 波动剧烈、验证集表现差
- 解决：把学习率除以 10、20、50，重新尝试

### ❌ 训练 epoch 太多
- 症状：训练集精度趋近 100%，验证集先升后降
- 解决：Early Stopping + 保存最佳 checkpoint

### ❌ 数据质量差
- 症状：模型能记住训练集，但测试集泛化差
- 解决：先做数据清洗、去重、去噪声，再微调。**Garbage in, garbage out.**

### ❌ 冻结所有层 + 大学习率
- 症状：验证精度始终低，模型似乎什么都没学到
- 解决：至少解冻后几层，或者使用 Adapter/LoRA

### ❌ Batch Norm 处理不当
- 症状：从训练切换到评估模式时性能突变
- 解决：冻结 BatchNorm 的 running statistics（或改为 LayerNorm）

## 大模型时代的微调范式演进

```
2017: Transformer → 全量微调成为主流
2018: BERT → 证明预训练+微调的有效性
2019: Adapter → 开始探索参数高效方法
2020: GPT-3 → Few-shot/Zero-shot 成为新范式
2021: LoRA → 低秩方法被广泛采用
2022: Instruction Tuning → FLAN、Alpaca
2023: QLoRA → 4-bit 量化微调成为可能
2023: DPO → 简化对齐流程，无需奖励模型
2024+: LoRA variants → DoRA, VeRA, LoRA-FA...
```

## 微调的最佳实践总结

1. ✅ **从小模型开始**：先在小模型上验证数据和流程，再用大模型
2. ✅ **冻结 + 逐步解冻**：从只训练分类头开始，逐步放开
3. ✅ **小学习率**：比预训练小 1~2 个数量级
4. ✅ **数据质量 > 数据数量**：少量高质量数据胜过大批量噪声数据
5. ✅ **监控验证集**：用 Early Stopping，不要盲目追求更多 epoch
6. ✅ **考虑 PEFT 方法**：LoRA/Adapter 在大多数场景是更优选择
7. ✅ **RAG + 微调组合**：检索解决知识，微调解决风格/行为

相关术语：[LoRA](/glossary/lora)、[RAG](/glossary/rag)、[Transformer](/glossary/transformer)、[PyTorch](/glossary/pytorch)、[过拟合](/glossary/overfitting)
