---
title: LLM 推理优化
category: llm
keywords:
  - llm-inference
  - kv-cache
  - batching
  - continuous-batching
  - speculative-decoding
  - tensor-parallel
  - vllm
  - pagedattention
difficulty: advanced
duration: 2-3周
summary: 让大模型推理从"烧钱机器"变成"可持续服务"的核心技术。覆盖 KV Cache、Batching、Speculative Decoding、Tensor Parallelism 等关键优化手段。
takeaways:
  - 理解 KV Cache 的原理，为什么它能让推理速度提升 10 倍以上
  - 搞懂 Static Batching vs Dynamic Batching vs Continuous Batching 的本质区别
  - 能用 vLLM 部署一个生产级 LLM 服务，支持 PagedAttention 和 Continuous Batching
  - 理解 Speculative Decoding 如何用小模型加速大模型推理
  - 掌握 Tensor Parallelism 的基本原理，能做多卡并行推理
relatedTerms: vllm
relatedIntel:
  - 003-lora-qlora
  - 005-rag
  - 015-rlhf
relatedNodes:
  - llm-finetune
  - nlp-llm-inference
relatedTools:
  - vllm
---

## 为什么你要学它

先讲结论：**大模型部署的成本问题，比训练问题更棘手。**

训练是一次性投入，推理是持续烧钱。以 GPT-4 级别的模型为例：
- 单次推理调用成本约 $0.01-$0.1（人民币 7 分-7 毛）
- 如果日均服务 100 万用户，每次 10 轮对话，成本轻松破百万/月
- 延迟太高用户体验差，延迟太低成本扛不住

推理优化的核心矛盾在于 **LLM 的自回归生成机制**：每个 token 都依赖前面所有 token 的计算结果，导致：
1. **显存爆炸**：KV Cache 需要存储每一层的 Key 和 Value，13B 模型单次请求可能吃掉几十 GB 显存
2. **算力浪费**：不同请求的生成长度差异巨大，短的 10 tokens，长的 2000 tokens， batching 时短的等长的
3. **扩展性差**：单卡装不下大模型，多卡通信又成为瓶颈

**谁解决了这个问题，谁就能把大模型变成真正的产品。** 这就是为什么 vLLM 一经推出就被所有大厂采用，OpenAI、Anthropic、Google 都在用类似技术。

## 一句话概览（快速版）

你只要记住五句话：

1. **KV Cache = 用空间换时间**，把已经算好的 Key/Value 存下来，避免重复计算
2. **Batching = 合并同类请求**，一次 GPU 计算服务多个用户，降低单次成本
3. **Continuous Batching = 动态调度**，不等最短的请求，让 GPU 永远有事做
4. **PagedAttention = 显存的分页管理**，把 KV Cache 当内存页面来调度
5. **Speculative Decoding = 小模型猜，大模型验**，用 7B 加速 70B 的生成

## 核心拆解

### 🔑 KV Cache

**问题**：自回归生成中，每个新 token 都需要重新计算前面所有 token 的 Attention。生成 1000 个 token，就要做 1000 次 Attention 累加，极其浪费。

**解决**：第一次 forward 时，把每层的 K 和 V 缓存下来。下次生成新 token 时，直接复用缓存的 K/V，只需计算新 token 本身的 Q/K/V。

```python
# 伪代码示意：没有 KV Cache 的情况
for new_token in generate():
    # 每次都要重新计算所有 token 的 attention
    output = attention(all_previous_tokens, all_previous_tokens)
    new_token = output[-1]  # 取最后一个位置的输出

# 有 KV Cache 的情况
cache = {}  # 存储每层的 K 和 V
for new_token in generate():
    # 只计算新 token 的 Q，然后查缓存的 K/V 做 attention
    q = compute_q(new_token)
    k, v = cache.get(new_token)  # 从缓存获取
    output = attention(q, k, v)
    cache.update(new_token)  # 更新缓存
    new_token = output
```

**显存问题**：KV Cache 的大小随序列长度线性增长。13B 模型、4096 上下文、fp16 精度，单个请求的 KV Cache 约需：
- 每层：2（K+V）× 4096 × 5120 × 2 bytes ≈ 84 MB
- 40 层总计：约 **3.3 GB/请求**
- 如果并发 100 个请求，显存直接爆炸

### 🔑 Static Batching vs Dynamic Batching

**Static Batching（静态批处理）**：
- 把多个请求打包成一组，**等所有请求都完成才返回**
- 优点：GPU 利用率高（一次计算多个）
- 致命缺点：短请求等长请求，**尾延迟极高**

```python
# Static Batching 示意
requests = [req1(10 tokens), req2(2000 tokens), req3(50 tokens)]
batch = make_batch(requests)
# 必须等 req2 跑完，req1 和 req3 才能返回
results = model(batch)
```

**Dynamic Batching（动态批处理）**：
- 运行时将新请求加入正在执行的 batch
- 一定程度缓解短等长问题
- 但仍然受限于固定 batch 内的最长请求

**Continuous Batching（持续批处理）**：
- 核心创新：**不等 batch 内的请求全部完成**
- 一个请求跑完，立即撤下，补充新请求进来
- GPU 利用率接近 100%，尾延迟大幅降低

```python
# Continuous Batching 示意（vLLM 风格）
while True:
    # 每次 iteration 检查是否有请求完成
    finished = check_finished_requests()
    for req in finished:
        return_results(req)
    
    # 立即用空闲槽位接收新请求
    new_requests = get_pending_requests()
    for req in new_requests:
        if has_free_slot():
            add_to_batch(req)
    
    # 继续执行 batch（可能是不同的请求组合）
    run_batch()
```

### 🔑 PagedAttention（vLLM 的核心）

**问题**：KV Cache 大小不可预测（不同请求长度差异巨大），预分配显存会造成大量浪费；动态增长又需要复杂的显存管理。

**解决**：借鉴操作系统的虚拟内存分页思想，把 KV Cache 划分成固定大小的 "页"（Block）。

- 每个 Block 存储固定数量的 token（如 16 个 token 的 K/V）
- 不同请求的 Block 可以**非连续存储**
- 通过一个 Block Table 维护"逻辑序列 → 物理 Block"的映射

```python
# PagedAttention 示意
class BlockTable:
    def __init__(self):
        self.logical_to_physical = {}  # 逻辑块号 → 物理块号
    
    def allocate(self, num_blocks):
        # 动态分配物理块
        physical_blocks = []
        for _ in range(num_blocks):
            physical_blocks.append(get_free_block())
        return physical_blocks

# 存储 5000 个 token 的 KV Cache，只需要 5000/16 = 313 个块
# 而不是预分配能容纳 8192 tokens 的巨大连续显存
```

**效果**：
- 显存利用率提升 **2-4 倍**
- 吞吐量提升 **10-20 倍**
- 支持的并发数大幅增加

### 🔑 Speculative Decoding

**问题**：用大模型（70B）逐个生成 token，太慢；用小模型（7B）生成，质量差。

**解决**：用小模型**并行猜**多个 token，然后用大模型**一次验证**。如果小模型猜对了，直接跳过计算；如果猜错了，大模型**纠正并重新猜**。

```
传统方式（70B 模型）：
Token1 → Token2 → Token3 → Token4 → Token5  （串行，5 次 70B forward）

Speculative Decoding：
小模型(7B) 猜：[T1, T2, T3, T4]  （1 次 7B forward，并行）
大模型(70B) 验证：一次 forward，同时检查 [T1, T2, T3, T4] 是否正确
结果：大部分猜对 → 跳过计算，速度提升 3-5 倍
```

**关键洞察**：验证多个 token 只需要**一次大模型 forward**（用大模型计算这 4 个位置的分布，与小模型对比），而不是 4 次。

### 🔑 Tensor Parallelism（张量并行）

**问题**：单卡显存装不下大模型（如 70B 模型需要 140GB+ 显存）。

**解决**：把模型的**权重矩阵切分到多卡**，每卡只负责一部分计算，最后通过 AllReduce 汇总结果。

三种并行方式对比：

| 并行方式 | 切分维度 | 适用场景 | 通信量 |
|---------|---------|---------|-------|
| Tensor Parallelism | 层内权重 | 单节点多卡 | 高 |
| Pipeline Parallelism | 层层切分 | 多节点 | 中 |
| Data Parallelism | 复制模型 | 扩展 throughput | 低 |

**Tensor Parallelism 示例（2 卡）**：
```python
# 矩阵乘法 Y = X @ W
# 其中 W 被切分为 [W1, W2]（按列切分）
X = distributed_scatter(x)  # 每卡有 X 的完整副本
Y1 = X @ W1  # 卡1 计算一半
Y2 = X @ W2  # 卡2 计算另一半
Y = all_gather(Y1, Y2)  # 汇总结果
```

**Megatron-LM** 是最流行的 Tensor Parallelism 实现，被 vLLM、TGI 等广泛采用。

## 完整跑通方案

### 方案一：vLLM（推荐，生产级）

**vLLM** 是目前最流行的 LLM 推理框架，由 Berkeley LMSYS 开发，支持 PagedAttention 和 Continuous Batching，吞吐量比 HuggingFace Transformers 高 10-24 倍。

**第一步：安装**

```bash
pip install vllm
```

**第二步：启动 OpenAI 兼容 API 服务**

```python
# server.py
from vllm import LLM, SamplingParams

# 加载模型（自动处理 Tensor Parallelism）
llm = LLM(
    model="meta-llama/Llama-2-7b-chat-hf",
    tensor_parallel_size=2,  # 使用 2 卡并行
    gpu_memory_utilization=0.9,  # 90% 显存用于 KV Cache
    max_model_len=4096,  # 最大上下文长度
)

# 定义采样参数
sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.95,
    max_tokens=512,
)

# 单次推理
outputs = llm.generate(["Hello, my name is", "The capital of France is"], sampling_params)
for output in outputs:
    print(f"Input: {output.prompt}")
    print(f"Output: {output.output.text}")
```

**第三步：批量推理 + Continuous Batching**

```python
from vllm import LLM, SamplingParams
import asyncio

llm = LLM(model="meta-llama/Llama-2-7b-chat-hf")

async def generate_stream(prompts):
    sampling_params = SamplingParams(temperature=0.7, max_tokens=256)
    # vLLM 自动处理 batching、continuous batching 和 PagedAttention
    async for output in llm.generate_async(prompts, sampling_params):
        yield output

# 模拟高并发场景
prompts = [f"用户{i}的问题是：..." for i in range(100)]
async def main():
    async for result in generate_stream(prompts):
        print(result)

asyncio.run(main())
```

**第四步：OpenAI 兼容 API**

```bash
# 启动 HTTP 服务
python -m vllm.entrypoints.openai.api_server \
    --model meta-llama/Llama-2-7b-chat-hf \
    --tensor-parallel-size 2 \
    --port 8000
```

```bash
# 调用方式
curl http://localhost:8000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/Llama-2-7b-chat-hf",
    "prompt": "The future of AI is",
    "max_tokens": 100
  }'
```

### 方案二：HuggingFace TGI（Text Generation Inference）

**TGI** 是 HuggingFace 官方的高性能推理框架，适合部署开源模型（Llama、Mistral、Falcon 等）。

**第一步：安装**

```bash
docker pull ghcr.io/huggingface/text-generation-inference:latest
```

**第二步：启动服务**

```bash
model=meta-llama/Llama-2-7b-chat-hf
volume=$PWD/data

docker run --gpus all --shm-size 1g -p 8080:80 \
    -v $volume:/data \
    ghcr.io/huggingface/text-generation-inference:latest \
    --model-id $model \
    --quantize bitsandbytes \  # 4-bit 量化，进一步省显存
    --max-concurrent-requests 128
```

**第三步：API 调用**

```bash
curl http://localhost:8080/generate \
  -X POST \
  -d '{
    "inputs": "The capital of France is",
    "parameters": {
      "max_new_tokens": 100,
      "temperature": 0.7,
      "do_sample": true
    }
  }' \
  -H "Content-Type: application/json"
```

### 性能对比参考

| 框架 | 吞吐量 (req/s) | 显存占用 | 尾延迟 P99 | 适合场景 |
|-----|---------------|---------|-----------|---------|
| HuggingFace Transformers | 5-10 | 高 | 10s+ | 开发测试 |
| vLLM | 50-200 | 低（PagedAttn） | 1-2s | 生产部署 |
| TGI | 30-150 | 低（量化） | 1-3s | 开源模型部署 |

## 常见误区

**"上了 Continuous Batching 就能解决所有问题" → 错**。Continuous Batching 解决的是 GPU 利用率和尾延迟问题，但如果你本身 batch size 很小（<4），收益有限。真正的瓶颈可能在模型本身（首 token 延迟）或 IO（模型加载）。

**"Tensor Parallelism 能线性提升性能" → 理想很丰满**。实际有 10-30% 的性能损失，因为 AllReduce 通信耗时。2 卡通常 1.6-1.8 倍，4 卡通常 2.5-3.5 倍。超过 8 卡加速比收益急剧下降。

**"Speculative Decoding 适合所有场景" → 只适合长序列生成**。如果生成的 token 本身很短（如短问答），小模型猜错的概率高，反而更慢。Speculative Decoding 的收益在生成 200+ tokens 时才明显。

**"KV Cache 会无限增长" → 需要限制**。如果不加控制，恶意用户发送超长序列会撑爆显存。生产环境必须设置 `max_model_len` 和 `max_num_seqs` 来保护。

**"量化后精度损失可忽略" → 取决于量化方式和模型**。INT8 量化通常损失 <1%，但 INT4 量化在某些任务上可能损失 3-5%。BitsAndBytes 的 NF4 格式相对安全，GPTQ/AWQ 效果更好但需要额外校准数据。

## 推荐学习顺序

1. 先读 vLLM 论文《vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention》（约 30 分钟）
2. 看 PagedAttention 源码（vLLM/csrc/attention 相关），理解 Block 管理逻辑
3. 阅读 Continuous Batching 原始实现（Orca 论文）
4. 对比 TGI 和 vLLM 的架构差异，理解不同实现路线的取舍
5. 用 LMFlow 或 Axolotl 在你的业务数据上微调一个模型，部署上去压测
