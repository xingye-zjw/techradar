# Transformer（变换器）

**Transformer** 是一种基于自注意力机制的深度学习架构，由 Google Brain 的研究团队于 2017 年在论文 [*Attention Is All You Need*](https://arxiv.org/abs/1706.03762) 中提出。它解决了传统 RNN（循环神经网络）无法并行计算以及处理长序列时的梯度消失问题。Transformer 已成为 BERT、GPT 等几乎所有大型语言模型（LLM）的基础架构，并被广泛应用于 NLP、计算机视觉、语音等多个领域。

## 核心思想

传统的序列处理依赖于 RNN 的按顺序递归处理，每个时间步的输出依赖于前一步的输出，无法并行。Transformer 的核心创新在于：

- **完全基于注意力机制**：不依赖 RNN 的顺序处理，通过计算序列中每个位置与其他所有位置的相关性来获取上下文信息
- **全局感受野**：无论序列多长，每个位置都能同时感知到整个序列，避免了长距离依赖问题
- **高度可并行**：所有位置的注意力计算可以同时进行，大大提升了训练和推理效率

## 基本结构

一个标准的 Transformer 由两部分组成：

1. **编码器（Encoder）**：负责处理输入序列，生成上下文丰富的隐藏表示。典型代表是 BERT
2. **解码器（Decoder）**：负责基于输入生成输出序列，具有自回归特性。典型代表是 GPT

每个编码器/解码器层都由以下子层堆叠而成：

### 1. 多头自注意力 (Multi-Head Self-Attention)

将输入通过多个不同的线性变换投影为 Q（Query，查询）、K（Key，键）、V（Value，值）三组向量，然后并行计算多组注意力分数，最后拼接起来。

核心计算过程：

```
Attention(Q, K, V) = softmax(Q·Kᵀ / √d_k) · V
```

其中 `d_k` 是 K 向量的维度，除以 `√d_k` 用于缩放点积，防止维度较大时的 softmax 梯度消失。

### 2. 前馈神经网络 (Feed-Forward Network)

对每个位置独立应用两层全连接层，并在两层之间使用 ReLU 或 GELU 激活函数。

```
FFN(x) = max(0, x·W1 + b1) · W2 + b2
```

### 3. 残差连接与层归一化

每个子层都使用「残差 + 层归一化」结构来稳定训练过程：

```
x = x + SubLayer(Norm(x))
```

## 位置编码

由于 Transformer 本身不含任何循环结构，它**不能天然感知顺序**。因此需要显式地将位置信息注入到输入中，通常使用：

- **正弦/余弦位置编码**（原始 Transformer 使用）
- **可学习的位置编码**（BERT、GPT 等大多数现代模型使用）

```
PE(pos, 2i)     = sin(pos / 10000^(2i / d_model))
PE(pos, 2i + 1) = cos(pos / 10000^(2i / d_model))
```

## 发展谱系

Transformer 家族发展出了三大流派：

| 类型 | 代表模型 | 典型用途 |
|------|---------|----------|
| 编码器-编码器 (Encoder-Decoder) | T5、BART、LLaMA-3 | 翻译、摘要、对话 |
| 仅编码器 (Encoder-only) | BERT、ALBERT、RoBERTa | 分类、命名实体识别、阅读理解 |
| 仅解码器 (Decoder-only) | GPT、GPT-2、GPT-3、GPT-4、Llama、Mistral | 文本生成、对话、代码 |

## 实践意义

- **训练效率**：并行化使得 GPU 的利用率大幅提升，训练大规模模型成为可能
- **表达能力**：自注意力可以捕捉任意长度的依赖关系
- **可扩展性**：模型规模的增大通常伴随着性能的提升（Scaling Laws）
- **通用性**：同一架构可以适配文本、图像、语音、蛋白质序列等多种数据模态

相关术语：[自注意力机制](/glossary/self-attention)、[LoRA](/glossary/lora)、[RAG](/glossary/rag)、[微调](/glossary/fine-tuning)
