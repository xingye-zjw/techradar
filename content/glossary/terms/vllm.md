vLLM 是伯克利大学 LMSYS 组织开源的大语言模型推理引擎，核心解决了 LLM 推理中 **KV Cache 显存碎片化** 和 **GPU 利用率低** 两个根本问题。

## 核心问题：为什么 GPU 利用率这么低？

LLM 推理分为 Prefill（处理输入 prompt）和 Decode（自回归生成输出）两个阶段：

- **Prefill**：计算密集，GPU 利用率高
- **Decode**：内存密集，GPU 利用率低（等待显存带宽）

Decode 阶段显存被 KV Cache 占满，但计算强度不高，GPU 空转。

## 核心技术：PagedAttention

传统方式：为每个请求预分配最大 seq_len 的连续 KV Cache（如 32k token），即使实际只用 512 token，显存也被浪费。

**PagedAttention**：把 KV Cache 按 block 分块管理（通常 16 token/block），用逻辑块-物理块映射表按需分配。类似操作系统虚拟内存的页表机制。

**效果**：显存利用率从 ~40% 提升到 ~90%，相同显存可服务更多并发请求。

## 连续批处理（Continuous Batching）

传统批处理：等一个 batch 所有请求完成，才接收新请求 → GPU 中间有空档。

连续批处理：在每个 token 生成后，立即把完成的请求释放，把新请求插入 → GPU 持续运转。

## 量化支持

vLLM 原生支持 GPTQ / AWQ / INT4 量化模型加载，INT4 量化后 7B 模型可在单张消费级 GPU（如 RTX 3090）上运行。

## 快速使用

```bash
pip install vllm
```

```python
from vllm import LLM

llm = LLM(model="Qwen/Qwen2.5-7B-Instruct-AWQ", quantization="AWQ")
outputs = llm.generate(["解释量子纠缠"])
print(outputs[0].outputs[0].text)
```

## 相关资源

- [vLLM 官方文档](https://docs.vllm.ai/)
- [PagedAttention 论文](https://arxiv.org/abs/2309.06180)
- [vLLM vs TGI benchmark](https://benchmark.a-r.pro/)