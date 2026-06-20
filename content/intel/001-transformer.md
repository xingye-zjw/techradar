---
title: Transformer 架构
category: deep-learning
keywords:
  - transformer
  - attention
  - self-attention
  - multi-head
  - positional encoding
  - encoder decoder
difficulty: intermediate
duration: 1-2周
summary: 所有大模型（GPT、BERT、LLaMA）的底层架构。理解它就能理解现代 AI 是怎样工作的。
takeaways:
  - 搞懂 Self-Attention 为什么能让模型"同时关注所有词"，这是大模型最核心的直觉
  - 能在纸上画出 Encoder-Decoder 架构，说出每个模块输入输出长什么样
  - 明白为什么 Attention + 位置编码一起用才能解决序列问题
  - 用 PyTorch 写出一个最小可跑的 Transformer Encoder，在真实数据集上训练
---

## 为什么你要学它

先讲结论：**Transformer = 让计算机能同时"看"所有输入的信息，而不是只能从左到右逐个理解。**

它解决了一个长期困扰 AI 的问题：当你读一句长话「小明今天在学校考试前忘带铅笔，结果他的数学成绩……」，理解"他"是谁需要回头看"小明"，理解"成绩"是什么需要回头看"考试"。RNN/LSTM 只能从左到右逐个处理，记忆会随着距离衰减；CNN 只能看局部窗口。

Transformer 的核心发明 — **Self-Attention** — 让每个词都能同时关注句子中所有其他词，不受距离限制。这也正是为什么它天然地支持并行计算，训练速度比 RNN 快 10-100 倍。

理解 Transformer 后，你再看任何大模型（GPT、BERT、LLaMA、Claude）都是在它基础上做的加减法。

## 一句话概览（快速版）

你只要记住三句话：

1. **Attention = 给每个词计算"它和其他词的关联程度"**（用矩阵乘法 + softmax）
2. **每个词的最终表示 = 所有其他词的加权平均**（关联度就是权重）
3. **把它堆叠很多层（12-128 层）**，再加一些残差连接和归一化，就是现代大模型

## 核心拆解

### 🔑 Self-Attention（自注意力）

每个词被拆成三个角色：**Query（Q，它在找谁）、Key（K，它是谁）、Value（V，它有什么内容）**。

计算步骤：
```python
# 假设输入序列长度为 N，每个词表示为 d_model 维向量
X = torch.randn(N, d_model)  # 输入

W_q = torch.nn.Linear(d_model, d_k)  # 把 X 投影成 Q
W_k = torch.nn.Linear(d_model, d_k)  # 把 X 投影成 K
W_v = torch.nn.Linear(d_model, d_k)  # 把 X 投影成 V

Q = W_q(X)  # (N, d_k)
K = W_k(X)  # (N, d_k)
V = W_v(X)  # (N, d_k)

# 核心：每个 Q 和所有 K 做点积，得到 N×N 的"关联矩阵"
scores = Q @ K.transpose(-2, -1) / sqrt(d_k)  # (N, N)
attention = softmax(scores)  # 每行是"这个词对其他词的注意力权重"
output = attention @ V       # (N, d_k)，用权重对 V 加权平均
```

**直觉理解**：把 input 中的"小明"和"他"做相似度计算，得到很高的关联分数——模型就学会把"他"理解为指代"小明"。

### 🔑 Multi-Head Attention（多头注意力）

不是只学一套 Q/K/V 变换，而是学 **h 套**（h 通常 = 8 或 16）。
- 每一头关注不同的关系：第一头可能在学"主谓关系"，第二头可能在学"指代关系"
- 最后把 h 个头的输出拼接起来再过一层线性层

### 🔑 位置编码（Positional Encoding）

Attention 本身**不区分顺序**——把句子倒过来，结果一样。所以需要显式给每个位置注入信息。

两种主流做法：
- **sin/cos 固定编码**（原始 Transformer 论文）：位置信息由 sin/cos 函数生成，不可学习
- **可学习 Position Embedding**（GPT/BERT 做法）：每种位置一个 embedding，和词 embedding 一起训练

### 🔑 Encoder vs Decoder

- **Encoder**（BERT、图像 ViT）：
  - 每个位置能看所有位置 → 适合理解任务（分类、阅读理解）
  - 输出一个向量序列，最后接分类头
  
- **Decoder**（GPT、LLaMA）：
  - 每个位置**只能看它左边的位置**（通过 mask 实现）→ 适合自回归生成（一个词一个词地吐答案）
  - 输入是已生成的词，输出下一个词的概率分布
  
- **Encoder-Decoder**（T5、翻译模型）：
  - Encoder 理解源语言，Decoder 生成目标语言
  - Decoder 中有额外的 Cross-Attention，把 Encoder 输出当 K/V

## 完整跑通方案

**第一步：手写最小 Transformer**（不依赖 `nn.Transformer`，确保理解每个细节）

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

    def forward(self, x, mask=None):
        batch_size = x.size(0)
        # 拆分多头：(batch, seq_len, d_model) → (batch, heads, seq_len, d_k)
        q = self.W_q(x).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        k = self.W_k(x).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        v = self.W_v(x).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)

        scores = q @ k.transpose(-2, -1) / math.sqrt(self.d_k)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        attention = F.softmax(scores, dim=-1)
        output = attention @ v
        output = output.transpose(1, 2).contiguous().view(batch_size, -1, self.d_model)
        return self.W_o(output)
```

**第二步：在 IMDB 文本分类上训练一个 2 层 Encoder**
- 输入：512 维位置编码 + 词 embedding
- 任务：二分类（正面/负面评论）
- 目标：验证你写的 Self-Attention 真的能学到语义

**第三步：对比 GPT 风格 Decoder-only 架构**
- 加入 causal mask（左下三角全 1，右上三角全 0）
- 训练方式：用前 N 个词预测第 N+1 个词

**第四步：看 Karpathy 的 minGPT 源码**（约 300 行），理解一个可用的 GPT 最小实现长什么样。

## 常见误区

**"我需要先学 Transformer 才能学大模型" → 不完全对，但强烈推荐**。跳过 Transformer 直接学 LLaMA 2 你会看不懂 90% 的内容。花一周理解它，你将能看懂所有现代 AI 论文。

**"Attention 就是 Q·K·V 这么简单？" → 对，但这个简单机制的变种有几百种**。FlashAttention、Linformer、Reformer、Performer、Longformer… 都是在这个三元素上做工程优化。

**"为什么除以 √d_k？" → 防止 Q·K 的点积随着维度增大而饱和**（softmax 会把梯度压近平坦）。这是一个工程细节但极其关键。

## 推荐学习顺序

1. 先读 Jay Alammar 的《The Illustrated Transformer》（图文并茂，1-2 小时）
2. 用上面的代码手写一个最小版本，在小数据集上跑通
3. 看 Karpathy 的 minGPT 源码（约 300 行）
4. 阅读 T5 论文，理解 Encoder-Decoder 的真正威力
