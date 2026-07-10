---
title: RLHF：人类反馈强化学习
category: llm
difficulty: advanced
duration: 1-2周
summary: ChatGPT 为什么「对齐」了？RLHF 是如何让模型学会遵循人类意图而不是简单预测下一个 token
takeaways: "- 理解 RLHF 三阶段：SFT / Reward Model / RL Fine-tuning (PPO)
  - 能解释 Reward Model 如何从人类偏好数据中学习
  - 能解释 PPO 算法在 RLHF 中的作用（避免大模型在 RL 阶段崩溃）
  - 理解 RLHF 与 SFT 的本质区别：不是教模型「说什么」，而是教模型「怎么说才算好」"
relatedTerms: ["rlhf", "rag", "lora", "transformer"]
relatedIntel: "- 003-lora-qlora
  - 005-rag
  - 015-rlhf"
relatedNodes: [
    "llm-inference",
    "- llm-finetune
    - llm-inference",
  ]
tags: "- rlhf
  - reinforcement learning
  - reward model
  - ppo
  - alignment
  - instructgpt"
relatedTools: ["huggingface-transformers", "langchain", "pytorch"]
---

## 为什么你要学它

GPT-3 在很多任务上表现平庸，但 ChatGPT（基于 GPT-3.5/4）却能遵循指令、拒绝有害请求、生成连贯的多轮对话。这种「对齐」不是靠更大的模型做到的，而是靠 **RLHF（Reinforcement Learning from Human Feedback）**。

如果你想：

- 训练一个听从指令的模型（如对话助手）
- 让模型学会拒绝有害请求
- 让模型生成更「自然」的文本而不是死板的预测

RLHF 是必经之路。它的思想也被用到了 Safe RL、Robotics 等更广泛的领域。

## 一句话概览

RLHF 三阶段：

1. **SFT（有监督微调）**：用人工标注的「问题-理想回答」数据微调预训练模型
2. **Reward Model（奖励模型）**：训练一个模型学习「人类觉得哪个回答更好」
3. **PPO Fine-tuning（强化学习微调）**：用 Reward Model 的信号，通过 PPO 算法进一步微调 SFT 模型

## 核心拆解

### 🔑 为什么不能直接用人类反馈训练？

直接用人类反馈来调整语言模型的问题是：**人类不能实时给几亿参数的模型提供梯度**。

RLHF 的解决方案是：训练一个 Reward Model（RM）来**模拟**人类偏好。RM 是一个模型，它的输入是一对 (prompt, response)，输出是一个标量「奖励分数」——越高表示人类越喜欢。

一旦有了 RM，就可以把它当成一个可微分的「奖励函数」，用强化学习算法来优化原模型。

### 🔑 Reward Model 的训练

```python
# Reward Model 的训练数据：同一个 prompt 的两个 response，哪个更好？
# label: response_a > response_b → +1, else -1
from transformers import AutoModelForSequenceClassification, Trainer

# RM 架构：输入 (prompt + response)，输出 scalar reward
rm_model = AutoModelForSequenceClassification.from_pretrained(
    "reward_model_checkpoint",
    num_labels=1  # 输出 1 个标量
)

# Bradley-Terry 模型：P(a > b) = σ(r(a) - r(b))
# loss = -log σ(r(a) - r(b))
```

### 🔑 PPO 在 RLHF 中的特殊处理

普通 PPO 直接最大化 Reward Model 的分数，但会导致两个问题：

1. **Reward Hacking**：模型发现 RM 的漏洞，通过无意义的重复字符或胡言乱语刷高 reward
2. **语言退化**：模型在最大化 reward 时会「忘记」有用的知识，开始说人类听不懂的话

**KL 散度约束**是解决这两个问题的关键：

```
Objective = E[r(x, y)] - β · KL(π_RL(y|x) || π_SFT(y|x))
```

- r(x,y)：Reward Model 给的分数
- β：KL 惩罚系数（通常 0.1~0.2）
- π_SFT：SFT 阶段的模型（作为「参考」，不让 RL 模型跑太远）

这就是 **PPO-ptx（PPO with KL penalty）** 或 **InstructGPT** 中使用的目标函数。

### 🔑 RLHF vs SFT：本质区别

**SFT（有监督微调）**：教模型「人类标注的好回答长什么样」

- 数据：问题 → 理想回答
- 学习方式：Teacher Forcing（逐 token 预测）

**RLHF**：教模型「什么样的回答人类会觉得好」

- 数据：人类偏好比较（不做绝对标注）
- 学习方式：强化学习，探索 + 利用

RLHF 的优势：

- 不需要「绝对好答案」，只需要「A 比 B 相对更好」，标注成本低得多
- 能学习到 SFT 中难以表达的品质（风格、安全性、有用性）

## 实战指南

### 用 TRL 库做 RLHF（简化版）

```python
from trl import RewardTrainer, PPOTrainer
from transformers import AutoModelForCausalLM, AutoTokenizer

# Step 1: Reward Model 训练
rm_model = AutoModelForSequenceClassification.from_pretrained("gpt2", num_labels=1)
trainer = RewardTrainer(model=rm_model, train_dataset=preference_dataset)
trainer.train()

# Step 2: PPO Fine-tuning
ppo_trainer = PPOTrainer(
    model=model,
    ref_model=ref_model,  # SFT 模型作为参考
    reward_function=rm_model,
    dataset=prompt_dataset
)
for epoch in range(epochs):
    for batch in dataloader:
        prompts = batch["prompt"]
        # 生成 response
        responses = [generate(p) for p in prompts]
        # 计算 reward
        rewards = [rm_model(p, r).logits for p, r in zip(prompts, responses)]
        # PPO 更新
        ppo_trainer.step(prompts, responses, rewards)
```

## 常见误区

### 误区 1：RLHF 可以完全替代 SFT

**错误理解**：很多人认为只要做 RLHF，就不需要 SFT 阶段，直接用预训练模型做 RL 就行。

**正确理解**：RLHF 必须建立在 SFT 的基础上。SFT 阶段教会模型基本的指令遵循能力，让模型的输出进入"人类偏好的分布"。如果没有 SFT，预训练模型的输出可能过于随机，Reward Model 无法有效学习人类偏好。

**如何避免**：始终按照 SFT → Reward Model → PPO 的顺序进行训练。SFT 数据质量直接影响后续 RLHF 的效果，建议先用高质量的指令数据做 SFT，再进行 RL 训练。

### 误区 2：Reward Model 分数越高，模型输出越好

**错误理解**：很多人认为只要最大化 Reward Model 的分数，模型就会生成更优质的内容。

**正确理解**：过度优化 Reward Model 会导致"Reward Hacking"——模型学会钻 RM 的漏洞，通过无意义的重复、冗长的表述或特定的措辞模式来刷高分数，而不是真正提升内容质量。这就是为什么需要 KL 散度约束。

**如何避免**：在训练中设置合适的 KL 惩罚系数（通常 0.1~0.2），定期用人工评估验证模型输出质量，而不是只看 Reward 分数。如果发现 RM 分数飙升但实际质量下降，说明出现了 Reward Hacking。

### 误区 3：RLHF 训练完就不需要再迭代

**错误理解**：很多人认为 RLHF 是一次性工作，训练完模型就"对齐"了。

**正确理解**：RLHF 是一个持续迭代的过程。人类偏好会随时间变化，新的应用场景会带来新的安全挑战，模型在实际使用中可能发现新的漏洞。需要建立持续的反馈机制和定期的 RLHF 更新。

**如何避免**：建立用户反馈渠道，收集实际使用中的 bad case，定期用新的人类偏好数据重新训练 Reward Model 和进行 PPO 微调。可以考虑使用在线学习或持续学习的方法。

## 相关资源

- [InstructGPT 论文](https://arxiv.org/abs/2203.02155)
- [DeepMind RLHF 教程](https://www.deepmind.com/blog/learning-through-human-feedback)
- [TRL 库（HuggingFace）](https://huggingface.co/docs/trl)
- [RLHF vs SFT 对比分析](https://arxiv.org/abs/2309.08553)
