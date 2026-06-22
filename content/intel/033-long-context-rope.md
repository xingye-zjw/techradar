---
title: 长上下文推理：RoPE 与 YARN
category: llm-fundamentals
keywords:
  - long context
  - rope
  - yarn
  - context window
  - position encoding
  - flashattention
difficulty: advanced
duration: 1周
summary: 32k → 128k → 1M token，长上下文不是「加内存」而是「改编码」——RoPE 的缩放与扩展技术
takeaways:
  - 理解 RoPE（旋转位置编码）的数学原理
  - 理解为什么直接扩展 context window 会破坏位置编码
  - 能解释 YaRN / LongRoPE 等长上下文扩展方法
  - 能用 FlashAttention-2 加速长上下文推理
---

## 为什么你要学它

LLM 的 context window（上下文窗口）决定了它能处理多长的文本：
- GPT-3：2048 token
- GPT-4：8k / 32k / 128k token
- Claude 3：200k token

长上下文的需求场景：
- 处理长文档（法律合同、学术论文）
- 多轮对话记忆（几十轮历史）
- RAG 系统（检索大量文档后一次性处理）

但长上下文不只是「加显存」——位置编码（Position Encoding）是关键瓶颈。理解 RoPE 和长上下文扩展技术，能让你正确配置和使用长上下文模型。

## 一句话概览

- **RoPE**：把绝对位置编码变成「旋转」，让模型能理解相对位置
- **Context Window 扩展**：需要调整 RoPE 的 base frequency，否则位置编码会「溢出」
- **YaRN / LongRoPE**：智能缩放 RoPE，在不重新训练的情况下扩展 context window
- **FlashAttention-2**：CUDA Kernel 优化，让长上下文推理更快

## 核心拆解

### 🔑 RoPE 的数学原理

传统位置编码（如 BERT 的 absolute PE）是给每个位置分配一个固定的向量。RoPE 的思想是：**把位置信息编码成旋转矩阵**。

```python
# RoPE 简化实现
def apply_rope(x, positions, base=10000):
    # x: (batch, seq_len, head_dim)
    # positions: (batch, seq_len) - 每个 token 的位置
    
    dim = x.shape[-1]
    # 计算每个维度的频率
    freqs = 1.0 / (base ** (torch.arange(0, dim, 2) / dim))
    
    # 位置 × 频率 = 角度
    angles = positions.unsqueeze(-1) * freqs  # (batch, seq_len, dim/2)
    
    # 旋转
    cos = torch.cos(angles)
    sin = torch.sin(angles)
    
    x1, x2 = x[..., ::2], x[..., 1::2]  # 分成两半
    x_rotated = torch.stack([
        x1 * cos - x2 * sin,
        x1 * sin + x2 * cos
    ], dim=-1).flatten(-2)
    
    return x_rotated
```

**关键性质**：RoPE 让两个 token 的 attention score 只取决于它们的**相对位置**（position_i - position_j），而不是绝对位置。这让模型能更好地泛化到不同长度的序列。

### 🔑 为什么直接扩展 context window 会失败？

假设模型训练时 context window = 4096，RoPE 的 base frequency = 10000。如果直接把 context window 扩展到 32k：

- 位置 4097 ~ 32768 的 token 会使用「训练时未见过的位置编码」
- 这些位置的旋转角度可能超出训练时的范围，导致 attention 行为异常

**解决方案**：调整 RoPE 的 base frequency 或缩放因子，让新位置的编码「落在训练时见过的范围内」。

### 🔑 YaRN（Yet another RoPE extensioN）

YaRN 的核心思想：**缩放 RoPE 的 base frequency**，让长序列的位置编码「压缩」到训练时的范围内。

```python
# YaRN 缩放
def yarn_scale(base, original_context, target_context):
    # 缩放因子
    scale = target_context / original_context
    
    # 调整 base
    new_base = base * (scale ** (dim / (dim - 2)))
    
    return new_base
```

YaRN 还引入了 **NTK-aware scaling**：对不同维度使用不同的缩放因子，保留高频信息（对局部位置敏感）的同时扩展低频信息（对全局位置敏感）。

### 🔑 FlashAttention-2：长上下文推理加速

长上下文的 attention 计算量是 O(seq_len²)，32k token 的 attention 矩阵有 32k × 32k = 1B 个元素。

FlashAttention-2 的优化：
- **分块计算**：把 attention 矩阵分成小块，逐块计算，减少显存访问
- **IO-aware**：优化 GPU 显存和 HBM（高带宽内存）之间的数据传输
- **Kernel Fusion**：把 softmax、mask、dropout 等操作融合到一个 CUDA kernel

效果：32k context 的推理速度提升 2-4x，显存占用减少 50%。

## 实战指南

### 使用长上下文模型

```python
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-7B-Instruct",
    device_map="auto"
)

# 设置长上下文
model.config.max_position_embeddings = 32768  # 扩展到 32k

# 推理
long_text = "..." * 30000  # 30k token 的长文本
output = model.generate(long_text, max_new_tokens=100)
```

### 用 FlashAttention-2

```python
# PyTorch 2.0+ 内置 FlashAttention
import torch.nn.functional as F

# 使用 scaled_dot_product_attention（自动使用 FlashAttention）
attn_output = F.scaled_dot_product_attention(
    query, key, value,
    attn_mask=mask,
    is_causal=True  #因果 attention
)
```

## 相关资源

- [RoPE 论文](https://arxiv.org/abs/2104.09864)
- [YaRN 论文](https://arxiv.org/abs/2309.00071)
- [FlashAttention-2 论文](https://arxiv.org/abs/2307.08691)
- [LongRoPE 论文](https://arxiv.org/abs/2402.04434)