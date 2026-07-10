---
title: 长上下文窗口
slug: long-context-window
---

# 长上下文窗口

**长上下文窗口（Long Context Window）** 指大语言模型能够在单次前向传播中处理的 token 序列长度，显著超过 GPT-3 / BERT 时代 1K~4K 标准（通常 > 32K token，业界顶流已到 1M token 量级）。长上下文能力直接决定了模型能否「通读整本书」「消化完整代码仓库」「观看长视频字幕并连贯回答」，是 LLM 从「聊天玩具」迈向「生产力工具」的核心指标之一。

## 背景：为什么传统 LLM 上下文短？

Transformer 的自注意力机制复杂度是 **O(n²)**（n = 序列长度）：

- 每个 token 都要和所有 token 做 QKᵀ 矩阵乘法 → 显存占用 ~ n²·d
- GPT-3（2048 token）注意力显存 ~ 几 GB
- 直接扩到 128K → 注意力矩阵显存飙升 **4000 倍** → 单卡塞不下

除了算力墙，还有**位置编码外推**问题：训练时只见过最多 4K 位置的 RoPE/ALiBi 编码，直接塞 32K 进去，位置编码分布和训练时不一样，模型不会做注意力了。

## 长上下文的三大技术路径

### 路径 1：原生扩展（Native Long Context）——硬训出长能力

「既然短了，那就用长序列训出来。」

- **GPT-4 Turbo（128K）**、**Claude 3 Opus（200K）**、**Yi-34B-200K**、**GLM-4-128K**：用 8K~32K 的训练序列长度 + RoPE 基础频率调整，配合 FlashAttention-2 硬训上万步。
- **Gemini 1.5 Pro（1M）**：在长达 2M token 的文档拼接语料上做持续预训练，配合专门的位置编码方案，Needle in a Haystack（大海捞针）测试 99% 召回。

原生扩展的关键技巧：

1. **RoPE 基础频率插值（NTK-aware / YaRN）**：不改动模型参数，把 RoPE 的旋转角频率底数从 10000 调到 1000000，等价于「把位置编码在长序列上拉得更慢」。YaRN 在 Llama 2 70B 上只需微调 1.5K 步即可把 4K 扩到 128K，基本不掉点。
2. **训练序列长度课程学习**：先 4K → 再 16K → 最后 128K。逐步拉长，收敛更稳。
3. **超长语料数据配比**：代码（文件拼接可达数 10 万 token）、书籍（整本小说 100 万+ token）、长学术论文（PDF 全文 + 参考文献）占比 > 30%。

### 路径 2：近似注意力（Approximate Attention）——把 O(n²) 降下来

既然 O(n²) 是瓶颈，那用 O(n log n) 甚至 O(n) 的近似注意力替代：

| 方法                               | 核心思想                                                                                                                           | 复杂度        | 代表模型/框架                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------- |
| **滑窗注意力（Sliding Window）**   | 每个 token 只看左右 L 个邻居（L=2048 或 4096），全局信息靠层间堆叠传递                                                             | O(n·L) = 线性 | Mistral 7B、Gemma、Longformer       |
| **稀疏全局注意力**                 | 选出少量「全局 token」（如 CLS、每段标题）和所有人交流，其余 token 滑窗                                                            | O(n·(L + G))  | BigBird、ETC、Longformer            |
| **线性注意力（Linear Attention）** | 用核函数 trick 把 QKᵀV → φ(Q)·(φ(K)ᵀ·V)，矩阵结合律变顺序                                                                          | O(n) 严格线性 | RWKV、Flashattention-linear、ABC    |
| **状态空间模型（SSM / Mamba）**    | 递归结构，选择性遗忘/记住过去信息，无注意力矩阵                                                                                    | O(n) 且推理快 | Mamba、Mamba-2、Jamba、StripedHyena |
| **忆者注意力（Sink Attention）**   | 强制所有 token 都 attend 到「前几个流汇 token（sink token = 首几个 token）」 + 滑窗，解决滑窗外推时首 token 注意力分数累积溢出问题 | O(n·L)        | StreamingLLM 技术基础               |

**滑窗 + Sink 是目前性价比最高的工程方案**：Mistral-7B-Instruct-v0.2 用 4K 滑窗 + StreamingLLM，推理时在 A10G 上跑 500K token 上下文也不会 OOM，而且质量稳定。

### 路径 3：检索替代（RAG-based Long Context）——「不往上下文塞了，按需查」

很多人以为长上下文会取代 RAG，实际上两者是互补关系：

- **长上下文**：适合需要「全局结构理解」的任务（阅读代码理解模块调用关系、读合同找条款冲突、看长视频提炼主线）
- **RAG**：适合「知识密集、精准定位」的任务（查 2024 年某型号打印机具体参数、找某条法律条文原文）

最佳实践是混合：

```
┌──────────────────────────────────────────────────────┐
│ 用户：总结这份 500 页技术标书 + 和竞争对手 A 公司的    │
│      去年投标方案（1200 页 PDF）对比优劣势。            │
└───────────────────────────┬──────────────────────────┘
                            ▼
            ┌───────────────────────────┐
            │ 任务路由 Router（小模型）  │
            └───────────┬───────────────┘
                        │
        ┌───────────────┴───────────────────┐
        ▼                                   ▼
┌────────────────────┐            ┌────────────────────┐
│  全局理解部分       │            │  精确对比部分       │
│  （标书整体方案结构  │            │  （具体条款对标、    │
│    技术路线总结）    │            │    价格数字对比）    │
└────────┬───────────┘            └──────────┬─────────┘
         │                                   │
         ▼                                   ▼
   标书 500 页整段                    RAG 双知识库检索
   → 128K 模型上下文                「标书 X 页 vs A 标书 Y 页」
         │                                   │
         └─────────────────┬─────────────────┘
                           ▼
              合并回答 + 精准引用页码来源
```

## 工程核心：FlashAttention 与 KV Cache 优化

长上下文推理如果没有 FlashAttention，几乎跑不起来：

### FlashAttention（IO 感知的注意力实现）

标准 Attention 执行流程：

1. 把整个 Q(Kᵀ) 矩阵（n×n）从 HBM（显存，慢）搬到 SRAM（SM 缓存，快）—— 写回又搬一次，**IO 密集**
2. 计算 Softmax + 乘 V → 又读写一次 HBM

FlashAttention 的妙处：**Tiling（分块计算）+ Softmax Online 归约 + 反向重计算**

- 把 Q/K/V 按行切成 block_size=128 或 256 的小块
- 一块一块算，整个过程中间结果都保留在 SRAM 里，不落 HBM
- Softmax 的归一化因子（m, l 两个统计量）用流式在线算法维护
- 反向时不用存注意力矩阵（省 HBM 最大的那块），而是重算一遍前向

效果：**省显存 2~~4 倍 + 提速 2~~4 倍**，还顺便把数值稳定性做了（在线 Softmax 不容易溢出）。FlashAttention-3 进一步在 H100 上适配 FP8 和 TMA 硬件。

### KV Cache 分页管理（PagedAttention）

长上下文时 KV Cache 是显存大头：70B 模型 + 128K token + batch 32 ≈ 单 KV Cache 就占 **250 GB 显存**。

PagedAttention（vLLM 原创）像操作系统虚拟内存一样管理 KV Cache：

- 把每个 sequence 的 KV 分成 2048 token 大小的「页」
- 物理页在显存中不必连续，用一张页表维护逻辑页 → 物理页映射
- 序列新生成 token → 分配新物理页（从空闲链表拿）；序列结束 → 物理页回收
- 同一请求的 Sampling（多个候选生成）KV Cache 共享只读页 → 候选间只差异写

结果：**KV Cache 显存浪费从 40% 降到 < 5%**，相同 GPU 集群吞吐提升 2~4 倍。

## 长上下文质量评测：Needle in a Haystack & RULER

「能塞进去」≠「能看懂」。长上下文最经典的评测是 **Needle in a Haystack（大海捞针 / 干草堆找针）**：

```python
# 评测伪代码
context = ""
for _ in range(desired_length // 1000):   # 堆干草：随机/真实文档拼接
    context += random_document(token_length=1000)

needle = "这个数字是： 26504. 请记住它，最后问题时回答出来。"
insert_pos = random.randint(0, len(tokens(context))) # 在随机位置藏「针」
context = insert(context, needle, insert_pos)

prompt = context + "\n\n请回答上面提到的那个记住的数字是多少？"
answer = model.generate(prompt)
accuracy = (answer.strip() == "26504")  # 多位置重复，画召回率热力图
```

更好的合成评测是 **RULER**（2024），覆盖 7 类任务：

1. 海捞针（精确信息提取）
2. 追踪多变量数值变化
3. 关键词频次统计
4. 长文档问答
5. 代码仓库级全局理解
6. 多语言混排提取
7. 时间线排序（事件先后顺序）

RULER 的结论：很多 128K 标称模型，**实际 32K 以上信息提取率就掉到 50% 以下**，海捞针只在首尾召回好，中间塌陷成「U 型曲线」。

## 实战：Llama 3 70B 从 8K 扩展到 128K 的工程清单

1. **位置编码调整**：启用 YaRN RoPE Scaling，factor=16，alpha=8（基础频率从 500000 调至 8M）
2. **微调数据准备**：拼接代码文件、长 Arxiv 论文、Project Gutenberg 小说 → 128K 样本 3 万条
3. **微调设置**：LoRA rank=512，只训 q_proj/k_proj/v_proj/o_proj + RoPE 相关；gradient_checkpointing + FSDP-shard-grad-op
4. **训练硬件**：8×H100-80GB，batch=4×8，lr=2e-5，cosine 5 epoch
5. **推理端配置**：vLLM 0.5.0+，max_model_len=128K，gpu_memory_utilization=0.95，enforce_eager=False
6. **质量验收**：128K 长文档 + 7 种深度位置的海捞针召回率 ≥ 92%，L-Eval 数学/法律子集不低于短上下文版 95%

## 长上下文的未来

1. **统一上下文长度竞争将进入「百万 token 级」**：GPT-5、Claude Opus 后续版本都剑指 5M+ token，视频理解（1 小时视频 20~30 帧 token 化）成为刚需。
2. **无限上下文（Infinite Context）**：StreamingLLM + KV Cache 压缩（每 8 个 token 用一个「总结 token」替换掉已看过的不重要上下文）+ 外部磁盘 KV Cache。让模型在终端设备上对话「聊一年」不崩。
3. **上下文「主动遗忘」与隐私**：现在长上下文是「塞进去再也忘不掉」。未来会支持类似「忘掉第 3~10 段关于公司机密的内容」，或差分隐私注入，防止长上下文中训练数据被复现。
4. **多模态长上下文统一**：图像 patch token、音频 20ms token、文本 BPE token，在一个 10M+ 的统一 token 流里混合编排——视频 = 一串图像 token + 音频 token，做到看完整部电影并回答细枝末节问题。

长上下文窗口不是一个「越大越好」的玄学指标，而是 LLM 能否在真实工作流中取代人「先通读、再对比、后提炼」的关键。它和 RAG、VLM、Agent 工具调用会一起，构成 LLM 下半场的四大能力支柱。

相关术语：[Transformer](/glossary/transformer)、[自注意力机制](/glossary/self-attention)、[RAG](/glossary/rag)、[KV缓存](/glossary/kv-cache)、[批量推理](/glossary/batch-inference)
