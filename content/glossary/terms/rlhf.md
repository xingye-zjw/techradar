RLHF（Reinforcement Learning from Human Feedback）是让大语言模型对齐人类意图的核心技术，是 InstructGPT 和 ChatGPT 的关键技术。

## 三阶段训练流程

### Stage 1: SFT（Supervised Fine-Tuning）

用人工标注的「问题 → 理想回答」数据，用传统有监督学习微调预训练模型。

问题：人工标注成本高，且难以覆盖所有场景。

### Stage 2: Reward Model（奖励模型）

训练一个模型来学习「人类觉得哪个回答更好」：

```
输入：(prompt, response_a), (prompt, response_b)
标签：哪个更好（A or B）
输出：标量 reward 分数
```

训练目标：Bradley-Terry 模型 P(A>B) = σ(r(A) - r(B))

### Stage 3: PPO Fine-tuning

用 Reward Model 的信号，通过强化学习（PPO）进一步微调 SFT 模型：

```
Objective = E[r(x, y)] - β · KL(π_RL(y|x) || π_SFT(y|x))
```

KL 散度惩罚项防止 RL 模型跑太远，保持 SFT 学到的有用能力。

## 为什么 RLHF 比 SFT 更好

- 不需要绝对「好答案」，只需要相对「哪个更好」，标注成本低
- 能学习到难以显式描述的品质（语气、风格、安全性）
- 能适应开放域的多种合理回答

## 局限

- 人工偏好数据的标注质量和一致性难以保证
- Reward Model 可能被 hack（模型学会「欺骗」RM 而非真正提升质量）
- RLHF 训练不稳定，需要仔细的 KL 调度

## 相关资源

- [InstructGPT 论文](https://arxiv.org/abs/2203.02155)
- [TRL 库（HuggingFace）](https://huggingface.co/docs/trl)