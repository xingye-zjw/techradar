# KV缓存（KV Cache）

**KV Cache** 是 LLM 推理优化中的核心技术。在自回归生成中，每个新 token 都需要 attend 到之前所有的 token，KV Cache 缓存历史的 Key 和 Value 向量，避免重复计算。

## 核心原理

### 自回归生成过程

```
输入：prompt = "我爱"
生成：我 爱 北 京 天 安 门

无 KV Cache（每次重新计算）：
  Step 1: Q,K,V = Attention("我")        ← K,V = f("我")
  Step 2: Q,K,V = Attention("我爱")      ← K,V = f("我爱") 重新计算
  Step 3: Q,K,V = Attention("我爱北")    ← K,V = f("我爱北") 重新计算
  时间复杂度：O(n²)  累计计算量大

有 KV Cache：
  Step 1: 计算并缓存 K,V = f("我")
  Step 2: 计算新 token 的 Q,K,V，与缓存拼接
  Step 3: 计算新 token 的 Q,K,V，与缓存拼接
  时间复杂度：O(n)   每步只计算新 token
```

### Prefill vs Decode 阶段

```
┌─────────────────────────────────────────────────┐
│ Prefill 阶段（处理 prompt）                       │
│   - 并行处理所有输入 token                        │
│   - 计算所有 token 的 K,V 并缓存                   │
│   - 计算密集型（Compute-bound）                    │
├─────────────────────────────────────────────────┤
│ Decode 阶段（逐 token 生成）                      │
│   - 每步只生成一个 token                           │
│   - 查询 KV Cache 做 attention                    │
│   - 显存带宽密集型（Memory-bound）                  │
└─────────────────────────────────────────────────┘
```

## 显存占用估算

```python
def estimate_kv_cache_size(
    n_layers: int,
    n_heads: int,
    head_dim: int,
    seq_len: int,
    batch_size: int,
    dtype_bytes: int = 2  # FP16
) -> float:
    """
    计算 KV Cache 显存占用（MB）
    """
    # K 和 V 两个缓存
    kv_cache_bytes = 2 * n_layers * 2 * seq_len * n_heads * head_dim * batch_size * dtype_bytes
    return kv_cache_bytes / (1024 ** 2)

# LLaMA-2-7B 示例
size = estimate_kv_cache_size(
    n_layers=32,
    n_heads=32,
    head_dim=128,
    seq_len=4096,
    batch_size=1
)
print(f"KV Cache 显存: {size:.1f} MB")  # ~1GB
```

## 优化技术

### 1. 量化 KV Cache

```python
# 将 KV Cache 从 FP16 量化到 INT8 或 INT4
# 显存占用减半或减为 1/4
kv_cache_int8 = kv_cache.to(torch.int8)  # 显存 -50%
kv_cache_int4 = quantize_to_int4(kv_cache)  # 显存 -75%
```

### 2. PagedAttention（vLLM）

```
传统 KV Cache：
  [连续显存分配]
  问题：显存碎片化，浪费严重

PagedAttention：
  [分页管理]
  将 KV Cache 分成固定大小的块
  按需分配，避免碎片化
  显存利用率提升 2-4x
```

### 3. 滑动窗口注意力

```python
# 只保留最近 N 个 token 的 KV Cache
# 节省显存，但可能丢失长距离依赖
class SlidingWindowAttention:
    def __init__(self, window_size=2048):
        self.window_size = window_size
    
    def forward(self, q, k, v):
        # 只使用最近的 window_size 个 token
        k = k[:, -self.window_size:]
        v = v[:, -self.window_size:]
        return attention(q, k, v)
```

## 应用场景

- **长文本生成**：支持更长的上下文窗口
- **高并发服务**：同时处理更多用户请求
- **边缘部署**：在资源受限设备上运行 LLM
- **实时对话**：降低首 token 延迟（TTFT）

## 显存优化对比

| 技术 | 显存节省 | 精度影响 | 复杂度 |
|------|---------|---------|--------|
| FP16 KV Cache | 基线 | 无 | 低 |
| INT8 量化 | 50% | 极小 | 中 |
| INT4 量化 | 75% | 轻微 | 中 |
| PagedAttention | 碎片减少 | 无 | 高 |
| 滑动窗口 | 可控 | 长依赖丢失 | 低 |

## 相关概念

[注意力机制](/glossary/attention)、[Transformer](/glossary/transformer)、[模型量化](/glossary/quantization)、[大语言模型](/glossary/llm)
