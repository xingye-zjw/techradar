# 批量推理（Batch Inference）

**批量推理**是在 GPU 上同时处理多个推理请求以提升吞吐量的技术。相比在线推理（一次处理一个请求），批量推理通过矩阵运算充分调动 GPU 并行能力，QPS 可提升 10-100x。

## 为什么需要批量推理？

### GPU 利用率问题

```
单条推理（Batch=1）：
  GPU 算力利用率：~5-15%
  大量计算单元闲置

批量推理（Batch=32）：
  GPU 算力利用率：~60-80%
  并行计算充分调度
```

### 核心优势

| 维度 | 单条推理 | 批量推理 |
|------|---------|---------|
| 吞吐量 | 低 | 高 10-100x |
| 延迟 | 低 | 略高（但可接受） |
| GPU 利用率 | 5-15% | 60-80% |
| 成本效益 | 差 | 优秀 |

## 批量推理的类型

### 1. 静态批处理（Static Batching）

将多个请求打包成一个 batch 一起处理：

```python
# 静态批处理示例
import torch

# 假设有多个输入
inputs = ["文本1", "文本2", "文本3", "文本4"]

# 编码并填充到相同长度
encoded = tokenizer(inputs, padding=True, truncation=True, return_tensors="pt")

# 一次推理所有输入
with torch.no_grad():
    outputs = model(**encoded)
```

### 2. 连续批处理（Continuous Batching）

**核心创新**：在每个 token 生成后动态插入新请求，不等当前 batch 全部完成。

```
传统批处理：
  请求1: [生成] [生成] [生成] [完成]
  请求2: [生成] [生成] [生成] [完成]  ← 必须等请求1完成
  请求3: [等待] [等待] [等待] [等待]

连续批处理：
  请求1: [生成] [生成] [生成] [完成]
  请求2: [生成] [生成] [生成] [完成]  ← 请求1完成后立即插入请求3
  请求3:         [生成] [生成] [生成]  ← 动态插入
```

## 实现示例

### 使用 vLLM 进行批量推理

```python
from vllm import LLM, SamplingParams

# 初始化模型
llm = LLM(model="meta-llama/Llama-2-7b-hf")

# 批量输入
prompts = [
    "解释什么是机器学习",
    "Python的优势有哪些",
    "如何学习深度学习"
]

# 采样参数
params = SamplingParams(temperature=0.7, max_tokens=512)

# 批量推理
outputs = llm.generate(prompts, params)

for output in outputs:
    print(output.outputs[0].text)
```

### 手动实现简单批处理

```python
import torch

class BatchProcessor:
    def __init__(self, model, batch_size=32):
        self.model = model
        self.batch_size = batch_size
    
    def process(self, items):
        results = []
        for i in range(0, len(items), self.batch_size):
            batch = items[i:i + self.batch_size]
            # 填充到相同长度
            batch_tensor = self.encode_batch(batch)
            # 批量推理
            with torch.no_grad():
                output = self.model(batch_tensor)
            results.extend(output.cpu().numpy())
        return results
```

## 应用场景

- **大语言模型服务**：ChatGPT、Claude 等 API 后端使用连续批处理
- **图像批量处理**：OCR、图像分类等批量识别任务
- **离线数据分析**：批量处理日志、文档等非实时任务
- **推荐系统**：批量计算用户特征和推荐分数

## 性能优化要点

1. **选择合适的 batch size**：过小浪费 GPU 并行能力，过大可能 OOM
2. **使用连续批处理**：提高请求级别的吞吐量
3. **动态批处理**：根据请求到达情况动态调整 batch 大小
4. **量化推理**：结合 INT8/INT4 量化进一步提升吞吐量

## 相关概念

[KV缓存](/glossary/kv-cache)、[模型量化](/glossary/quantization)、[推理引擎](/glossary/inference-engine)
