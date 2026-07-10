---
title: RNN 循环神经网络
category: nlp
difficulty: intermediate
duration: 1-2周
summary: RNN 是处理序列数据的基石，通过隐藏状态在时间步之间传递信息。理解它能帮你搞懂为什么需要 LSTM/GRU，以及它们如何解决梯度消失问题。
takeaways: "- 理解 Vanilla RNN 的前向传播和 BPTT 原理，搞清楚 hidden state 是什么
  - 能画 Vanilla RNN、LSTM、GRU 的结构图，说出每个门的作用
  - 明白为什么 vanilla RNN 有梯度消失问题，以及 LSTM/GRU 是如何用门控机制解决的
  - 用 PyTorch 实现一个能处理文本分类或语言建模的 RNN 模型"
relatedIntel: "- 115-tts-speech-synthesis
  - 119-knowledge-graph"
relatedNodes: ["cv-detection", "nlp-rnn"]
tags: "- rnn
  - lstm
  - gru
  - sequence-modeling
  - backpropagation-through-time
  - vanishing-gradient"
relatedTerms: ["rag", "chain-of-thought", "transformer", "self-attention"]
relatedTools: ["huggingface-transformers", "numpy", "langchain"]
---

## 为什么你要学它

先讲结论：**RNN = 让计算机能"记住"之前看到的内容，用历史信息影响当前理解。**

2017 年之前，RNN（及其变体 LSTM、GRU）是 NLP 序列建模的标准方案。机器翻译、语音识别、文本生成，几乎所有序列任务都用它。那时候 attention 机制刚出来，Transformer 还是新鲜事物。

**为什么现在还要学 RNN？**

1. **历史地位**：LSTM/GRU 奠定了序列建模的核心思想——用隐藏状态传递信息、用门控控制信息流。这些概念直接影响了后续的很多模型。

2. **Vanishing Gradient（梯度消失）问题**：Vanilla RNN 在处理长序列时会"忘记"很久以前的信息。梯度在 BPTT 过程中会指数级衰减，导致模型学不到远程依赖。这个问题催生了 LSTM 和 GRU——理解它，你才算真正理解为什么现代 NLP 架构是现在这个样子。

3. **实际场景**：RNN 在某些场景依然有用——序列不太长、需要强时序建模、或者模型体量受限的情况。工业界还有大量 RNN 部署。

4. **面试必备**：RNN 是深度学习基础知识点，不懂 BPTT 和梯度消失，你很难通过算法面试。

## 一句话概览（快速版）

你只要记住三句话：

1. **RNN 的核心 = Hidden State（隐藏状态）在时间步之间传递，承载历史信息**
2. **Vanilla RNN 简单但有梯度消失问题 → LSTM/GRU 用门控机制解决**
3. **训练 RNN = 用 BPTT（反向传播通过时间），本质是把序列展开成多层 MLP**

## 核心拆解

### 🔑 Vanilla RNN（标准循环神经网络）

每个时间步 t，RNN 接收两个输入：当前时刻的输入 x_t 和上一时刻的隐藏状态 h_{t-1}，输出新的隐藏状态 h_t。

**前向传播公式：**

```
h_t = tanh(W_xh @ x_t + W_hh @ h_{t-1} + b_h)
y_t = W_hy @ h_t + b_y
```

其中：

- W_xh：输入到隐藏层的权重
- W_hh：隐藏层到隐藏层的权重（ recurrent 连接）
- tanh：激活函数，把值压缩到 [-1, 1]

**直观理解**：h_{t-1} 携带了"历史记忆"，W_hh 控制历史信息如何影响当前状态。RNN 把"过去"压缩成一个固定大小的向量塞给下一步。

### 🔑 BPTT（反向传播通过时间）

RNN 的训练算法，本质是把序列在时间维度上展开，然后用标准反向传播。

展开后，RNN 相当于一个极深的 MLP：

- 时间步 t 的梯度需要传递回 t-1, t-2, ..., 0
- 每一步都乘以 W_hh 和激活函数的导数

**Vanishing Gradient 根源**：

- 每步梯度都乘以 W_hh 和 tanh' 的值
- 当序列长度增加，梯度连乘会导致：
  - 如果 |W_hh| < 1 → 梯度指数衰减 → 忘"远"记忆
  - 如果 |W_hh| > 1 → 梯度指数爆炸 → 训练不稳定

### 🔑 LSTM（长短期记忆网络）

LSTM 是为了解决梯度消失问题提出的，核心是用**门控机制**显式控制信息流动。

**三个门**：

- **Forget Gate（遗忘门）**：决定丢弃什么信息
- **Input Gate（输入门）**：决定写入什么新信息
- **Output Gate（输出门）**：决定输出什么信息

**公式**：

```python
# 遗忘门：决定保留多少旧记忆
f_t = sigmoid(W_f @ [h_{t-1}, x_t] + b_f)

# 输入门：决定写入多少新信息
i_t = sigmoid(W_i @ [h_{t-1}, x_t] + b_i)
c_tilde = tanh(W_c @ [h_{t-1}, x_t] + b_c)  # 候选记忆

# 更新记忆单元
c_t = f_t * c_{t-1} + i_t * c_tilde

# 输出门：决定输出什么
o_t = sigmoid(W_o @ [h_{t-1}, x_t] + b_o)
h_t = o_t * tanh(c_t)
```

**为什么能解决梯度消失**：

- 记忆单元 c_t 的更新是**加法**（c_{t-1} + ...），不是乘法
- 梯度可以在记忆单元中"高速公路"传播，几乎不衰减
- 门控让模型自己学习什么该记住、什么该忘记

### 🔑 GRU（门控循环单元）

GRU 是 LSTM 的简化版本，只有两个门（重置门和更新门），参数量更少，但效果往往接近 LSTM。

**公式**：

```python
# 更新门：控制保留多少旧状态
z_t = sigmoid(W_z @ [h_{t-1}, x_t])

# 重置门：控制忽略多少旧状态
r_t = sigmoid(W_r @ [h_{t-1}, x_t])

# 候选状态
h_tilde = tanh(W @ [r_t * h_{t-1}, x_t])

# 最终状态 = 混合旧状态和新候选状态
h_t = (1 - z_t) * h_{t-1} + z_t * h_tilde
```

**直观理解**：

- z_t 接近 0 时，h_t ≈ h_{t-1}（保留旧记忆）
- z_t 接近 1 时，h_t ≈ h_tilde（写入新记忆）
- r_t 控制有多少旧记忆参与计算候选状态

## 完整跑通方案

**第一步：手写最小 Vanilla RNN（PyTorch）**

```python
import torch
import torch.nn as nn

class VanillaRNN(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.W_xh = nn.Linear(embed_dim, hidden_dim)
        self.W_hh = nn.Linear(hidden_dim, hidden_dim)
        self.h = None  # 隐藏状态

    def forward(self, x):
        # x: (batch, seq_len)
        embeddings = self.embedding(x)  # (batch, seq_len, embed_dim)
        outputs = []
        self.h = torch.zeros(embeddings.size(0), self.W_hh.out_features).to(x.device)

        for t in range(embeddings.size(1)):
            x_t = embeddings[:, t, :]  # (batch, embed_dim)
            self.h = torch.tanh(self.W_xh(x_t) + self.W_hh(self.h))
            outputs.append(self.h)

        return torch.stack(outputs, dim=1)  # (batch, seq_len, hidden_dim)
```

**第二步：实现 LSTM 文本分类**

```python
class LSTMClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True, bidirectional=True)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)  # *2 因为双向

    def forward(self, x):
        # x: (batch, seq_len)
        embedded = self.embedding(x)  # (batch, seq_len, embed_dim)
        lstm_out, (h_n, c_n) = self.lstm(embedded)
        # lstm_out: (batch, seq_len, hidden_dim*2)
        # h_n: (2, batch, hidden_dim)  # 2 是方向数
        # 取最后一层的 hidden state 做分类
        hidden = torch.cat((h_n[0], h_n[1]), dim=1)  # (batch, hidden_dim*2)
        return self.fc(hidden)
```

**第三步：在 IMDB 数据集上训练**

```python
from torch.utils.data import DataLoader

# 训练循环
model = LSTMClassifier(vocab_size=10000, embed_dim=128, hidden_dim=256, num_classes=2)
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
criterion = nn.CrossEntropyLoss()

for epoch in range(5):
    for batch in DataLoader(train_dataset, batch_size=32):
        inputs, labels = batch
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
```

**第四步：对比 GRU**

把 `nn.LSTM` 换成 `nn.GRU`，其他不变。观察参数量和效果的差异。

## 常见误区

**"RNN 能记住任意长度的依赖" → 错。Vanilla RNN 有梯度消失，基本记不住超过 10-20 步的依赖。只有 LSTM/GRU 通过门控缓解了这个问题，但也不是无限的。**

**"LSTM 和 GRU 哪个更好" → 没有绝对答案。GRU 参数量少，适合小数据集或受限场景；LSTM 表达能力更强，适合复杂任务。实际用哪个，试了才知道。**

**"BPTT 的时间步设得越长越好" → 错。时间步越长，展开的层数越多，梯度消失/爆炸越严重。一般设 50-100，配合 gradient clipping（梯度裁剪）使用。**

**"梯度裁剪能解决梯度消失" → 部分能。梯度裁剪（把梯度的 L2 范数限制在某个阈值）主要解决梯度爆炸，对梯度消失帮助不大。解决梯度消失还是要靠 LSTM/GRU 的门控机制。**

**"RNN 只适合 NLP" → 错。RNN 适合所有序列数据：时间序列预测、音乐生成、视频帧预测、DNA 序列分析等。**

## 推荐学习顺序

1. 先理解 Vanilla RNN 的前向传播和 BPTT，能在纸上推一遍梯度
2. 实现一个最小可跑的 RNN（用纯 numpy 或 PyTorch）
3. 对比 LSTM 和 GRU 的公式，画出结构图，理解每个门的作用
4. 在 IMDB 或 Shakespeare 数据集上训练一个文本分类/语言模型
5. 读原始 LSTM 论文（1997，Sepp Hochreiter & Jürgen Schmidhuber）
6. 对比 Transformer，理解为什么它能解决 RNN 的并行问题
