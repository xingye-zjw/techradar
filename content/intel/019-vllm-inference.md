---
title: vLLM 推理引擎与 PagedAttention
category: infrastructure
keywords:
  - vllm
  - pagedattention
  - kv cache
  - inference optimization
  - batch inference
  - quantization
difficulty: advanced
duration: 1-2周
summary: 通过 PagedAttention 和连续批处理突破 LLM 推理的显存墙，把 GPU 利用率从 30% 拉到 80%+
takeaways:
  - 理解 Prefill 和 Decode 两个阶段的计算差异和 KV Cache 的作用
  - 理解 PagedAttention 如何将显存碎片降低 60%+
  - 能用 vLLM 部署一个生产级推理服务，支持 OpenAI 兼容 API
  - 能做 INT4/INT8 量化推理，把 7B 模型压到单卡
---

## 为什么你要学它

大模型推理最头疼的问题是：**GPU 利用率极低**。

一个 7B 参数的模型，batch_size=1 推理时，GPU 利用率经常只有 20-30%。因为显存被 KV Cache 吃掉了大部分，而计算时间只占一小部分——GPU 在等待内存带宽。

vLLM 通过两个核心技术解决了这个问题：

1. **PagedAttention**：把 KV Cache 从连续显存改成「分页管理」，像操作系统虚拟内存一样按需分配，显存利用率从 40% 提升到 80%+
2. **连续批处理（Continuous Batching）**：不等一个请求全部完成才处理下一个请求，而是在每个 token 生成后就把空出的位置给新请求，吞吐提升 10-30x

如果你的 LLM 项目有推理服务化需求，vLLM 是绕不开的技术栈。

## 一句话概览

- vLLM 的核心是 PagedAttention，把 KV Cache 按 block（通常 16 个 token）分块管理
- 显存占用从 O(max_tokens × batch_size) 变成 O(实际使用的 token 数)，减少 60%+
- 连续批处理让多请求在 GPU 上真正并行，吞吐大幅提升
- 支持 AWQ/GPTQ 量化，直接加载量化模型推理

## 核心拆解

### 🔑 Prefill 与 Decode：两个阶段，两种计算模式

LLM 推理分成两个阶段：

**Prefill 阶段**：输入 prompt 的所有 token 一次性通过模型，生成第一个 output token。这是一次矩阵运算，计算密集（O(batch × seq_len × d_model²)），适合 GPU 并行。

**Decode 阶段**：自回归生成，每次只处理 1 个新 token，读取 KV Cache 中的历史 token。这是指内存密集型操作，GPU 利用率低。

**问题**：传统方式下，所有请求共享一个最大 seq_len 的预分配 KV Cache（比如 32k），即使实际只用 512 token，显存也被浪费了。

### 🔑 PagedAttention：像操作系统一样管理显存

PagedAttention 的核心洞察：KV Cache 不需要连续存储。

把每个请求的 KV Cache 分成固定大小的 block（比如 16 个 token 一个 block），用逻辑块和物理块的映射表管理。一个 block 用完就申请新 block，不再需要预分配连续空间。

**效果**：显存碎片大幅减少，相同显存可以服务更多并发请求。

### 🔑 连续批处理：不让 GPU 空闲

传统批处理要等 batch 中所有请求都完成才接收新请求。连续批处理在每个 token 生成后：
1. 检查是否有完成的请求，释放其占用的 block
2. 把新请求插入空闲 block
3. GPU 持续运转，几乎无空闲

**吞吐提升**：从 10 req/s → 100+ req/s（取决于模型和并发数）。

## 实战指南

### 安装与快速启动

```bash
pip install vllm
```

```python
from vllm import LLM

llm = LLM(model="Qwen/Qwen2.5-7B-Instruct-AWQ", quantization="AWQ")
outputs = llm.generate(["1+1等于几?"])
print(outputs[0].outputs[0].text)
```

### OpenAI 兼容 API

```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-7B-Instruct \
  --dtype half \
  --port 8000
```

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

### 量化推理

```python
# INT4 AWQ 量化
llm = LLM(model="Qwen/Qwen2.5-7B-Instruct-AWQ", quantization="AWQ")
# 7B 模型从 ~14GB 降到 ~4GB，单卡可跑
```

## 性能调优

| 参数 | 说明 | 推荐值 |
|---|---|---|
| `gpu_memory_utilization` | 显存使用比例 | 0.9 |
| `max_model_len` | 最大上下文长度 | 根据模型和显存调整 |
| `tensor_parallel_size` | 多卡并行数 | 1（单卡）~8（多卡） |
| `max_num_seqs` | 连续批处理最大并发 | 100+ |

## 相关资源

- [vLLM 官方文档](https://docs.vllm.ai/)
- [PagedAttention 论文](https://arxiv.org/abs/2309.06180)
- [vLLM vs Text Generation Inference 对比](https://benchmark.a-r.pro/)
