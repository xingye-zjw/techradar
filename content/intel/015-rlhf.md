---
title: RLHF 与大模型对齐
category: llm
difficulty: advanced
duration: 3-4周
summary: 用人类偏好数据把"只会预测下一个 token"的模型拉回正轨，让它输出有用、无害、符合指令的答案
takeaways:
  - 理解 RLHF 的三段流水线：SFT → 奖励模型 → PPO 对齐
  - 能解释 PPO 中 KL 惩罚项存在的意义，以及 reward hacking 的风险
  - 知道 DPO 为什么比 PPO 更简单，以及两者在数学上的等价关系
  - 能用 TRL / Axolotl 等库跑通一次最小化的对齐实验
relatedTerms: rlhf
relatedIntel:
  - 003-lora-qlora
  - 005-rag
  - 020-prompt-engineering
relatedNodes:
  - llm-finetune
  - llm-inference
tags:
  - rlhf
  - reward model
  - ppo
  - dpo
  - alignment
  - sft
---

## 为什么你要学它

你训练或拿到一个大语言模型，它在预训练阶段学到的是"下一个 token 的概率分布"——这保证它能生成通顺的中文/英文，但不保证它听从你的指令、拒绝恶意请求、或给出真实答案。它就像一个背熟了整本百科全书、却不一定听懂人话的"神叨学者"。

RLHF（Reinforcement Learning from Human Feedback）就是一套把它"调教成人话版"的工艺：先让它学会听话（SFT），再让一个打分员（奖励模型）来判断它哪句话更好，最后让它以这个打分为目标做强化学习（PPO/DPO）。不学 RLHF，你就只能停留在「训练了一个会说话的模型」，却做不到「上线一个对用户有用的助手」——这也是 InstructGPT / ChatGPT / Claude 真正拉开体验差距的关键环节。

## 一句话概览（快速版）

- RLHF 分三步：SFT（学指令）→ Reward Model（学人类偏好）→ PPO（用奖励信号做强化学习微调）。
- PPO 的直觉是"让输出尽量拿高分，同时别跟原来的模型差太远"——后者用 KL 散度约束，防止模型作弊。
- DPO 把 PPO 的"奖励 + 强化学习"两步合成一步，直接在偏好对上做微调，实现更简单、训练更稳。

## 核心拆解

### 🔑 第一阶段 SFT：让模型"听得懂指令"

SFT（Supervised Fine-Tuning）就是常规的语言模型微调，区别是训练数据变成了 `(prompt, response)` 这样的指令-回答对。数据质量远比数量重要，通常由人工手写，或用更强的模型生成再人工筛选。

为什么要先做 SFT？因为预训练模型只是"续写机器"，它不知道人类输入的"问题开头"意味着什么角色。SFT 的作用就是把它从"续写者"切换到"回答者"。训练目标仍然是 `next-token loss`，只是数据分布变了。

### 🔑 第二阶段 奖励模型：把人类偏好变成可导的打分函数

训练 RM 的常见做法：同一个 prompt 用 SFT 模型生成 4~9 个候选回答，让标注员做两两偏好排序（A 比 B 好），再用 Bradley-Terry 风格的损失（`log P(A>B) = reward(A) - reward(B)`）训练一个跟 SFT 结构类似但最后一层是标量输出的模型。

为什么不直接让人类给每个回答打分？因为人做相对比较远比对绝对分数更可靠、更便宜。RM 的核心作用：把不可导的"人类意见"，变成可导、可批量调用的 `reward(prompt, response)` 函数。

### 🔑 第三阶段 PPO：让模型在奖励信号下自迭代

PPO 的目标函数可以写成：

```
maximize  E[ reward(model(x)) ]  -  β · KL( π_new || π_ref )
```

第一项让模型越生成越讨 RM 喜欢的句子；第二项用 KL 散度惩罚"跟原始 SFT 模型差太远"的输出，防止模型为了讨好 RM 输出语法奇怪但打分高的句子（称为 reward hacking）。

直觉上，PPO = Policy Gradient（让高分动作概率升高）+ Trust Region（限制每一步更新幅度，别学崩）。工程上还要配上 Value Network、梯度裁剪、Reward Normalization 才能稳定收敛。

### 🔑 DPO：为什么它能替代 PPO 还更简单

DPO（Direct Preference Optimization，2023）把上面的"先训 RM → 再做 PPO"的两阶段合二为一，直接在偏好对 `(chosen, rejected)` 上对模型做一次微调，更新规则显式写成：

```
policy_update ∝ σ( β · ( log π_chosen - log π_ref_chosen ) - β · ( log π_rejected - log π_ref_rejected ) )
```

论文从理论上证明：在一定条件下，DPO 的不动点就是 PPO 目标的最优解。这意味着你可以扔掉整个 RL 基础设施（不需要 RM 推理、不需要 Value 函数、不需要 GAE），训练流程更像 SFT，稳定性好很多。

### 🔑 常用实现库

对齐工作不需要你自己从头实现 PPO：

- **TRL（Transformer Reinforcement Learning）**：HuggingFace 官方维护，同时支持 PPO、DPO、KTO。
- **Axolotl**：社区常用的 LLM 微调框架，内置 DPO / ORPO 的数据格式。
- **deepspeed + FSDP**：做大规模并行时的底座工具，配合上面的训练器。

## 完整跑通方案

### 第一步：准备依赖

```bash
pip install transformers datasets accelerate peft trl bitsandbytes
```

### 第二步：准备偏好数据格式

DPO 需要每条样本包含 `prompt / chosen / rejected` 三个字段。以常用的 `Anthropic/hh-rlhf` 为例，自己写一个最小化版本：

```python
from datasets import Dataset

data = [
    {"prompt": "请解释什么是强化学习。",
     "chosen": "强化学习是机器学习的一类，智能体通过与环境交互、累积奖励来学习策略。",
     "rejected": "强化学习？我不太清楚，你可以上网查一下。"},
    {"prompt": "帮我写一封请假邮件。",
     "chosen": "主题：请假申请\n尊敬的领导：因身体不适，特申请请假一天……",
     "rejected": "你好，这个问题我无法回答。"},
]

dataset = Dataset.from_list(data)
print(dataset.column_names)
```

### 第三步：用 TRL 的 DPOTrainer 跑对齐

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model
from trl import DPOTrainer

model_name = "Qwen/Qwen2-0.5B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    device_map="auto",
)

# 用 LoRA 降低显存，让消费级 GPU 也能跑
lora_cfg = LoraConfig(
    r=8, lora_alpha=16, target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05, bias="none", task_type="CAUSAL_LM",
)
model = get_peft_model(model, lora_cfg)
model.print_trainable_parameters()

training_args = TrainingArguments(
    output_dir="./dpo_out",
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    learning_rate=5e-5,
    num_train_epochs=1,
    logging_steps=5,
    save_strategy="no",
    optim="paged_adamw_8bit",
)

dpo_trainer = DPOTrainer(
    model=model,
    args=training_args,
    beta=0.1,                       # KL 惩罚系数
    train_dataset=dataset,
    tokenizer=tokenizer,
    max_length=256,
    max_prompt_length=128,
)

dpo_trainer.train()
model.save_pretrained("./dpo_out/final")
```

### 第四步：直观感受"对齐前后差别"

```python
from transformers import pipeline

# 原始模型
pipe_base = pipeline("text-generation", model=model_name, device_map="auto")

# 对齐后模型（仅加载 LoRA adapter）
tuned = AutoModelForCausalLM.from_pretrained(
    "./dpo_out/final", torch_dtype=torch.bfloat16, device_map="auto"
)
pipe_tuned = pipeline("text-generation", model=tuned, tokenizer=tokenizer)

prompt = "用户问：如何把大象装进冰箱？"
print("base :", pipe_base(prompt, max_new_tokens=64)[0]["generated_text"])
print("tuned:", pipe_tuned(prompt, max_new_tokens=64)[0]["generated_text"])
```

### 第五步：做一个最小化的 PPO 流程（直觉验证）

```python
# 奖励"函数"：一个很简单的启发式——回答里含"强化学习"就加分
def toy_reward(prompt, response):
    return float("强化学习" in response) * 1.0


# 真实 PPO 请用 trl.PPOTrainer
# 需要额外提供：model、ref_model、tokenizer、reward_model 或 reward_fn
# 这里仅演示需要传入的核心结构
from trl import PPOTrainer, PPOConfig

ppo_cfg = PPOConfig(learning_rate=1e-5, batch_size=2)
# ppo_trainer = PPOTrainer(
#     config=ppo_cfg, model=sft_model, ref_model=ref_model,
#     tokenizer=tokenizer, dataset=dataset,
# )
# for _ in range(1):
#     queries, responses, rewards = ...  # 采样 + 打分
#     stats = ppo_trainer.step(queries, responses, rewards)
```

## 常见误区

**误区 1：RLHF = PPO，跳过 SFT 直接上 RL。**
解释：没有 SFT 阶段的模型往往"听不懂指令"，生成的回答分布很宽，PPO 很难稳定训练。SFT 是让模型先学会"正确的分布"，再用 RL 做润色。

**误区 2：把 RM 当绝对真理，不加 KL 约束。**
解释：RM 只是人类偏好的近似，模型会很快找到输出"看似高分实则无意义"的方式（reward hacking）。必须加 KL 或用 DPO 这类带隐式约束的方法。

**误区 3：数据随便收集，只要量大。**
解释：对齐对数据质量极其敏感，一条"糟糕的 chosen/rejected"对比会把模型往错误方向推。投入时间做标注一致性（inter-annotator agreement）评测，远比堆数据量划算。

**误区 4：DPO 就是更好的 PPO，所以不用学 PPO。**
解释：DPO 在许多场景下确实更实用，但它的理论前提是"偏好分布可由单一参考模型表达"。当你需要引入外部工具 reward、在线采样或多目标奖励时，PPO 仍然是更灵活的框架。理解 PPO 能帮你真正理解 DPO 为什么有效。

**误区 5：对齐一次就万事大吉。**
解释：用户需求、攻击方式、场景边界都会变。上线后要持续收集「模型答错 / 模型拒绝 / 用户投诉」的样本，回到 SFT / DPO 数据里迭代，这就是很多团队里"对齐是长期工程"的原因。
