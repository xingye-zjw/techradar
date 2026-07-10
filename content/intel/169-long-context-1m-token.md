---
title: 1M 长上下文：YaRN / StreamingLLM / InfLLM 原理对比
category: llm
difficulty: advanced
duration: 2周
summary: 系统掌握三大主流长上下文扩展技术的数学原理、工程实现与适用场景。涵盖 RoPE 频率外推（YaRN）、注意力 sink（StreamingLLM）、分块递归推理（InfLLM）三条路线，配合 vLLM / onnxruntime-genai 落地实践。
keywords:
  - 长上下文
  - RoPE
  - YaRN
  - StreamingLLM
  - InfLLM
  - 1M token
  - 注意力外推
takeaways:
  - 搞懂 RoPE 位置编码的频率外推问题，为什么原生 4K 模型在 8K 会崩
  - 理解 YaRN 的旋转角温度缩放与动态 NTK 的数学直觉
  - 能画出 StreamingLLM 的 attention sink 缓存结构与 token 淘汰流程图
  - 能跑通 vLLM 部署 128K 上下文模型，配置 PagedAttention 长序列参数
  - 实现基于 InfLLM 思路的分块递归摘要 + 检索混合长文档问答
tags:
  - llm
  - 长上下文
  - RoPE
  - YaRN
  - StreamingLLM
  - InfLLM
  - 外推
relatedTerms:
  - transformer
  - self-attention
  - kv-cache
  - matrix
  - vllm
  - onnx
  - tensor
relatedTools:
  - vllm
  - onnxruntime-genai
  - transformers-agent
  - onnx-runtime
  - ollama
relatedNodes:
  - llm-inference
  - llm-rag
  - llm-eval
  - llm-agent
---

## 为什么你要学它

原生 Transformer 训练时的上下文窗口（比如 Llama-2-7B 的 4K、GPT-3.5 的 8K）是个紧箍咒：一超过这个长度，模型的困惑度（PPL）就会飙升、输出开始胡言乱语。但真实业务里有大量"长文本输入"的硬需求——法律合同审阅需要一次性读 300 页 PDF、代码仓库理解需要把几十上百个源文件塞进 prompt、客户服务分析需要汇总整周的聊天记录，这些场景 8K 根本不够塞牙缝。

长上下文扩展的价值不止于"塞更多内容"，它能从根本上改变 LLM 的工作范式：**从"检索-拼接"的 RAG 模式升级为"全量阅读-精准定位"的原生理解模式**，避免了 chunk 切分丢失语义、检索遗漏关键信息等 RAG 固有痛点。Gemini 1M 上下文、Claude 200K、GPT-4 Turbo 128K 的发布已经证明——长上下文是下一代 LLM 应用的核心竞争力，谁先掌握低成本扩展方案，谁就能抢先落地合同审阅、长视频理解、大规模代码分析等高价值场景。

实际落地场景包括但不限于：

- **法律合同审查**：一次性加载 500 页并购协议，自动识别风险条款并引用原文位置
- **代码仓库级理解**：把整个微服务项目的 .py / .java 文件（约 10 万行）全部塞进上下文，直接问"这个 API 的调用链经过了哪些模块"
- **学术论文综述生成**：输入 50 篇同领域 PDF 全文，让模型自动归纳研究脉络、对比方法差异、列出开放问题
- **医疗病历纵向分析**：把患者过去 3 年的门诊、住院、检验报告全部输入，自动总结病程演变与用药反应
- **长视频逐帧分析**：配合多模态模型，把 2 小时电影的字幕 + 关键帧 embedding 一并输入做情节分析

## 一句话概览（快速版）

1. **YaRN = 在 RoPE 频率轴上做"温度缩放 + 动态 NTK"**，无需重训即可把原生 4K 模型外推到 128K，**适合需要一次性加载完整长文档的场景**，精度损失 <2%，是目前社区最主流的零训练长上下文方案。
2. **StreamingLLM = 用 attention sink 缓存保留前 4 个 token 的 KV，其余滚动淘汰**，能实现**无限流式生成**（不需要"滑窗重算"），适合对话机器人、日志实时监控这类"前文看过就忘、只保留近期"的场景。
3. **InfLLM = 分块递归推理 + 稀疏注意力**，把 1M 文档切成 N 块先编码成 summary token，再让 decoder 跨块关注 summary，**显存和计算量都随长度线性增长**，适合超大规模文档理解但对中间细节关注较少的场景。

## 核心拆解

### 🔑 RoPE 频率外推与 YaRN 核心原理

理解 YaRN 之前，必须先搞清楚**为什么原生 RoPE 在训练长度之外会崩**。RoPE（Rotary Position Embedding）的本质是给每个 attention 的 Q/K 向量按位置乘一个旋转矩阵，旋转角的频率是随维度指数衰减的——高维度频率高（对应短距离位置模式）、低维度频率低（对应长距离模式）。一旦推理时的位置超过训练过的最大值（比如 4096），高频成分的旋转角就超出了训练分布，模型从没见过这么大的旋转角度，注意力分数直接乱掉。

```python
import torch
import numpy as np

def naive_rope_freq(dim: int, max_seq_len: int, base: float = 10000.0):
    """原生 RoPE 频率计算（训练时的分布）"""
    inv_freq = 1.0 / (base ** (torch.arange(0, dim, 2).float() / dim))
    t = torch.arange(max_seq_len)
    freqs = torch.outer(t, inv_freq)  # [seq_len, dim/2]
    return freqs

# 训练时只见过位置 0~4095
train_freqs = naive_rope_freq(dim=128, max_seq_len=4096)
# 推理时直接用到位置 8191，频率直接翻倍（超出训练分布）
infer_freqs = naive_rope_freq(dim=128, max_seq_len=8192)
print("位置 4096 的频率范围:", infer_freqs[4096].min().item(), "~", infer_freqs[4096].max().item())
print("训练时最高频:", train_freqs[-1].max().item())  # 远远小于推理位置4096的高频


def yarn_freq(dim: int, target_len: int, original_len: int = 4096,
              base: float = 10000.0, temperature: float = 0.001,
              alpha: float = 1.0, beta_fast: float = 32, beta_slow: float = 1):
    """YaRN 改进：NTK 缩放 + 温度调整 + 高低频分治"""
    # 1) NTK-aware base 缩放：让频率分布匹配更长的上下文
    scale = target_len / original_len
    ntk_base = base * (scale ** (dim / (dim - 2)))

    # 2) 计算维度独立的温度系数（YaRN 核心创新）
    #    高频（大维度）用更大的 beta 衰减（更保守，避免乱转）
    #    低频（小维度）用更小的 beta（允许更大旋转，捕捉长距离依赖）
    inv_freq = 1.0 / (ntk_base ** (torch.arange(0, dim, 2).float() / dim))
    dim_range = torch.arange(0, dim, 2).float() / (dim - 2)
    beta = beta_slow + (beta_fast - beta_slow) * dim_range

    # 3) 温度缩放：整体把频率"降温"，让旋转角变化更平滑
    inv_freq_scaled = inv_freq / (1.0 + temperature * beta * (scale - 1.0))

    t = torch.arange(target_len)
    freqs = torch.outer(t * alpha, inv_freq_scaled)
    return freqs

# YaRN 处理后的 8K 频率分布与原生 4K 训练分布对齐
yarn_8k_freqs = yarn_freq(dim=128, target_len=8192, original_len=4096)
print("YaRN 位置 4096 最高频:", yarn_8k_freqs[4096].max().item())
print("原生训练最高频:", train_freqs[-1].max().item())  # 现在量级接近了
```

**YaRN 的三条核心经验**：① 只改 RoPE 频率就能外推，不需要动任何模型权重或重训；② 单纯 NTK 缩放会让低频过度压缩、长距离依赖丢失，必须配合温度缩放做高低频分治；③ 外推 32 倍（4K→128K）时 PPL 上升约 0.3~0.5，对大多数生成任务肉眼几乎不可感知。

### 🔑 StreamingLLM 的 Attention Sink 机制

StreamingLLM 解决的是一个完全不同的问题：**当对话无限进行时，KV Cache 会无限增长，显存迟早爆掉**。常规思路是滑窗（只保留最近 N 个 token 的 KV），但实验发现一丢掉最前面的几个 token，PPL 直接爆炸——因为前几个 token 的 attention 分数异乎寻常地高，它们是所有后续 token 的"注意力锚点"（论文叫 attention sink）。

```python
from collections import deque

class StreamingLLMCache:
    """StreamingLLM 简化实现：保留 sink tokens + 滑窗 tokens"""
    def __init__(self, sink_size: int = 4, window_size: int = 2044):
        # 前 4 个 token (通常是 <s>, system, user, 首字) 是 attention sink
        # 必须永久保留在 KV Cache 里，否则 PPL 爆炸
        self.sink_size = sink_size
        self.window_size = window_size           # 滑窗大小
        self.max_cache = sink_size + window_size # 总缓存上限
        self.k_cache: deque = deque(maxlen=self.max_cache)
        self.v_cache: deque = deque(maxlen=self.max_cache)
        self.global_pos = 0  # 记录真实全局位置（给 RoPE 用）

    def append(self, new_k: torch.Tensor, new_v: torch.Tensor):
        """新 token 的 KV 写入缓存（自动淘汰滑窗中最旧的非 sink token）"""
        seq_len = new_k.shape[1]
        for i in range(seq_len):
            k_i, v_i = new_k[:, i:i+1, :], new_v[:, i:i+1, :]
            self.k_cache.append(k_i)
            self.v_cache.append(v_i)
            self.global_pos += 1

    def get_effective_kv(self):
        """拼接 sink + 滑窗，返回当前推理用的 KV"""
        # 前 sink_size 个一定在（因为淘汰是从左往右，sink 永远是最左的）
        k_eff = torch.cat(list(self.k_cache), dim=1)  # [B, S_sink+S_window, D]
        v_eff = torch.cat(list(self.v_cache), dim=1)
        return k_eff, v_eff

    def get_position_ids(self):
        """关键：RoPE 必须用真实全局位置，而不是滑窗内的相对位置
        否则位置编码会错乱"""
        n = len(self.k_cache)
        # 前 sink_size 个是原始位置 0..sink_size-1
        sink_pos = list(range(self.sink_size))
        # 后面滑窗的位置是全局最新的 window_size 个
        window_start = max(self.sink_size, self.global_pos - self.window_size)
        window_pos = list(range(window_start, self.global_pos))
        # 拼接后刚好等于缓存长度
        pos = sink_pos + window_pos
        return torch.tensor(pos[:n]).unsqueeze(0)  # [1, S]


# ---------- 模拟无限对话场景 ----------
cache = StreamingLLMCache(sink_size=4, window_size=2044)
print(f"缓存上限: {cache.max_cache} 个 token，理论支持无限长对话")
for step in range(10000):
    # 每步生成一个新 token（模拟）
    dummy_k = torch.randn(1, 1, 128)
    dummy_v = torch.randn(1, 1, 128)
    cache.append(dummy_k, dummy_v)
    if step % 2500 == 0:
        k, v = cache.get_effective_kv()
        print(f"第 {step} 步：当前缓存 {k.shape[1]} tokens，全局位置 {cache.global_pos}")
print("无论多少轮，显存占用恒定 ≈ sink_size + window_size")
```

**StreamingLLM 的关键约束**：它只保证"流畅不断"，不保证"还记得 1 万轮之前说过什么"。因为滑窗外的内容已经被丢弃了，如果需要回溯历史，必须配合 RAG 把历史摘要存在外部数据库里。适用场景：客服对话、日志实时分析、直播弹幕监控这类"近期最重要、远古无所谓"的流式业务。

### 🔑 InfLLM 的分块递归与 Summary Token

InfLLM 针对的是 YaRN 也扛不住的场景——**1M 甚至 10M token 的超超长文档**。YaRN 的显存开销是 O(S²) 的（attention 矩阵），1M token 算下来光 attention 就需要上百 TB 显存，根本不可能。InfLLM 的思路是"化整为零"：把长文档切成 B 块，每块单独编码成若干 summary token，decoder 层只需要跨块关注 summary token，再按需回原块取细节。

```python
from dataclasses import dataclass
from typing import List
import torch.nn.functional as F

@dataclass
class ChunkOutput:
    chunk_id: int
    raw_tokens: torch.Tensor           # 原始 token id [L]
    summary_tokens: torch.Tensor      # 该块压缩后的 summary token [K, D]
    kv_cache: tuple                   # 该块 encoder 阶段的 KV（供后续 detail fetch）

class InfLLMPipeline:
    """InfLLM 三阶段流程：分块编码 → 跨块注意力 → 按需取细节"""
    def __init__(self, encoder_model, decoder_model, chunk_size: int = 4096,
                 summary_per_chunk: int = 32):
        self.encoder = encoder_model
        self.decoder = decoder_model
        self.chunk_size = chunk_size
        self.K = summary_per_chunk  # 每块压缩为 K 个 summary token

    def phase1_encode_chunks(self, full_doc_tokens: torch.Tensor) -> List[ChunkOutput]:
        """阶段一：切分 + 每块独立编码，产出 summary tokens"""
        chunks = full_doc_tokens.split(self.chunk_size)
        outputs: List[ChunkOutput] = []
        for cid, chunk in enumerate(chunks):
            # 普通 encoder forward（和正常短文本一样，O(chunk²)）
            hidden, kv = self.encoder(chunk.unsqueeze(0), return_kv=True)
            # 用 top-K attention pooling 选 K 个代表性 token 做 summary
            # （InfLLM 原文用的是可学习的压缩层，这里简化为 attention 池化）
            cls_attn = hidden[0, :, 0]          # 用 CLS token 的注意力分数
            topk_idx = torch.topk(cls_attn, self.K).indices
            summary = hidden[0, topk_idx, :]    # [K, D]
            outputs.append(ChunkOutput(cid, chunk, summary, kv))
        return outputs

    def phase2_cross_chunk_attention(self, chunks: List[ChunkOutput],
                                     question: torch.Tensor) -> torch.Tensor:
        """阶段二：把所有 summary token 拼接，让 decoder 跨块关注"""
        all_summary = torch.cat([c.summary_tokens for c in chunks], dim=0)  # [B*K, D]
        # 仅这一步需要 attention，但 token 数已经从 1M 降到 1M/4096*32 ≈ 7812 个
        # 复杂度 O((B*K)^2)，几 GB 显存就够
        cross_hidden = self.decoder.cross_attention(
            query=question.unsqueeze(0),
            key=all_summary.unsqueeze(0),
            value=all_summary.unsqueeze(0),
        )
        return cross_hidden

    def phase3_fetch_detail(self, chunks: List[ChunkOutput],
                            needed_chunk_ids: List[int]) -> list:
        """阶段三：decoder 发现需要某几个块的细节，再取出原块完整 KV"""
        details = []
        for cid in needed_chunk_ids:
            c = chunks[cid]
            details.append({"chunk_id": cid, "tokens": c.raw_tokens, "kv": c.kv_cache})
        return details


# ---------- 1M token 文档的显存估算 ----------
# 假设 1M tokens、D=4096、FP16
# 原生 full attention: O(S²*D) = 1e12 * 4096 * 2 B ≈ 8 PB （不可能）
# YaRN 128K full attention: O(S²*D) = (1.28e5)² * 4096 * 2 B ≈ 134 TB （仍不可能）
# InfLLM 分块 4K:
#   - 阶段一：每块 O(4K²*D) * 并行跑 = 几 GB
#   - 阶段二：summary 总数 ≈ 1M/4K*32 = 8192 tokens → O(8K²*D) ≈ 0.5 TB
#   - （再加稀疏 attention 可再压到几十 GB）
# 复杂度从 S² 降到线性 O(S)，质变
print("InfLLM 让 1M token 文档推理从'不可能'降到'单卡 A100 80GB 能跑'")
```

**三种方案选型决策树**：① 长度 ≤ 128K，需要完整细节 → 选 YaRN（零训练、精度最高）；② 无限流式对话、不要求记得远古内容 → 选 StreamingLLM（省显存、不中断）；③ 长度 > 128K，允许先看摘要再看细节 → 选 InfLLM 或它的变体（Longformer、FlexGen 等稀疏注意力方案）。

## 常见误区或注意事项

1. **误区：只要开了 YaRN，就能把 4K 模型随便扩展到 1M token 还不掉点。** 为什么是坑：YaRN 的零训练外推上限是 32~~64 倍（4K→128K~~256K），超过这个范围后，无论怎么调频率缩放，低频成分被过度压缩导致长距离依赖（如"第 10 页提到的人名"和"第 900 页提到的同名事件"的关联）完全丢失，PPL 飙升 2 个点以上。正确做法：目标长度 < 32×训练长度用纯 YaRN；> 32× 时用 YaRN 初始化 + 用几百条长样本做 100~1000 步的继续预训练（LongLoRA 风格），冻结注意力层之外的权重即可，成本可控。

2. **误区：StreamingLLM 的 sink 大小固定是 4，随便什么模型都通用。** 为什么是坑：attention sink 的数量取决于模型结构和分词器——BOS token、system prompt 前缀、第一轮 user/assistant 标记都可能成为 sink，4 是 Llama 系列的经验值，换 Qwen 或 Mistral 可能要 6 或 8。少留 sink 会导致滑窗后 PPL 突然暴涨，多留 sink 又浪费宝贵的滑窗位置。正确做法：在你的目标模型上先做"丢前缀 PPL 诊断"——分别尝试丢前 1/2/4/8/16 个 token 后测 PPL，找到 PPL 突增前的最小保留数作为 sink_size，再额外加 2 做余量。

3. **误区：InfLLM 分块切的时候按固定字符数切，不考虑语义边界。** 为什么是坑：如果一个自然段刚好被切成两半，分属两个 chunk，summary token 各自学到一半语义，跨块 attention 时根本无法还原完整含义，最终回答丢关键信息。正确做法：优先按段落/标题/章节这些天然语义边界切分，用 `RecursiveCharacterTextSplitter` 的 `separators=["\n##", "\n###", "\n\n", "\n", "。"]` 策略，保证 90% 以上的完整语义单元在同一个 chunk 内；边界处允许 5~10% 的 overlap，让相邻 chunk 的 summary 都能"看到"边界附近的信息。

4. **误区：长上下文模型就能替代 RAG，不需要检索了。** 为什么是坑：长上下文随长度增长的不是只有精度——每轮推理成本（时间+显存）也是线性增长的，128K 上下文的推理成本是 4K 的 30 倍以上，而且"大海捞针"任务（答案在 128K 文本的某个角落）的召回率其实比 RAG 还差（Lost in the Middle 现象）。正确做法：采用"RAG 粗筛 + 长上下文精答"的混合架构——先用 BM25 + 向量检索从百万文档库中捞出 top-10 相关文档（合计约 30K tokens），再一起送入 128K 上下文模型让它综合引用，兼顾成本、召回率和答案质量。
