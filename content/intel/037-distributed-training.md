---
title: 分布式训练：多 GPU 甚至多机器并行
category: devops
difficulty: advanced
duration: 1-2周
summary: 单卡不够用？分布式训练把计算和显存分摊到多 GPU，让千亿参数模型在数百张 GPU 上训练
takeaways:
  - 理解 Data Parallel（DP）和 Model Parallel（MP）的核心区别
  - 能用 PyTorch DDP 做多 GPU 数据并行训练
  - 能用 DeepSpeed ZeRO 做显存优化和混合并行
  - 能估算不同并行策略的通信量和扩展效率
relatedIntel:
  - 007-docker
  - 008-git
  - 009-linux
relatedNodes:
  - "devops-kubernetes"
  - "electrical-safety"
tags:
  - distributed training
  - data parallel
  - model parallel
  - ddp
  - deepspeed
  - zero redundancy optimizer
relatedTerms:
  - "linux"
  - "docker"
  - "kubernetes"
  - "git"
relatedTools:
  - "kubernetes"
  - "mlflow"
  - "docker"
---

## 为什么你要学它

当模型太大（如 70B 参数，FP16 需要 140GB 显存）或数据太多（TB 级数据）时，单卡不够用。

分布式训练的核心问题是：**如何在多卡之间分配计算和显存，同时最小化卡间通信开销**。

- **Data Parallel**：每张卡有完整模型副本，分配不同数据 batch，并行前向/反向计算，最后 AllReduce 同步梯度
- **Model Parallel**：把模型切分到不同卡，减少每张卡的显存占用，但需要 Pipeline Parallelism 避免空闲

如果你要训练 7B+ 的模型，分布式训练是必学技能。

## 一句话概览

- **Data Parallel (DDP)**：每卡完整模型副本，不同数据 batch，AllReduce 同步梯度（最常用）
- **Tensor Parallel**：单层权重横向切分到多卡，需要 AllReduce 通信（Megatron-LM）
- **Pipeline Parallel**：模型按层切分到多卡，需要 Micro-Batch 填充流水线（GPipe/PipeDream）
- **ZeRO**：Optimizer 状态/梯度/参数分片到不同 rank（DeepSpeed）

## 核心拆解

### 🔑 Data Parallel（DDP）

最简单也最常用的并行方式：

```
GPU 0: model副本 | batch_0 → forward → backward → grad_0
GPU 1: model副本 | batch_1 → forward → backward → grad_1
...
GPU N: model副本 | batch_N → forward → backward → grad_N

AllReduce(grad_0, grad_1, ..., grad_N) → avg → optimizer.step() × N
```

每张卡有完整模型，通信内容是梯度（AllReduce），通信量较小。

```python
# PyTorch DDP 训练
import torch.nn.parallel as parallel
from torch.nn.parallel import DistributedDataParallel as DDP
import torch.distributed as dist
import os

# 每个进程初始化
dist.init_process_group(backend="nccl")
local_rank = int(os.environ["LOCAL_RANK"])
torch.cuda.set_device(local_rank)

# 模型包装
model = MyModel().cuda()
model = DDP(model, device_ids=[local_rank])

# 训练
for data in dataloader:
    optimizer.zero_grad()
    output = model(data)
    loss = criterion(output, target)
    loss.backward()  # DDP 自动做 AllReduce
    optimizer.step()
```

### 🔑 DeepSpeed ZeRO

ZeRO（Zero Redundancy Optimizer）解决 DDP 的显存问题：每个 rank 只存储 1/N 的 optimizer 状态，需要时从其他 rank 拿。

| Stage  | 分片内容           | 显存减少         |
| ------ | ------------------ | ---------------- |
| ZeRO-1 | Optimizer States   | ~4x              |
| ZeRO-2 | + Gradients        | ~8x              |
| ZeRO-3 | + Model Parameters | ~N倍（线性扩展） |

```python
# DeepSpeed 训练
import deepspeed

# DeepSpeed 配置
ds_config = {
    "train_batch_size": 64,
    "gradient_accumulation_steps": 4,
    "fp16": {"enabled": True},
    "zero_optimization": {
        "stage": 3,  # ZeRO-3
        "offload_optimizer": {"device": "cpu"},  # CPU Offload
    }
}

# 训练
model, optimizer, _, _ = deepspeed.initialize(
    model=model,
    optimizer=optimizer,
    config=ds_config
)

for step, data in enumerate(dataloader):
    model.zero_grad()
    loss = model(data)
    model.backward(loss)
    model.step()
```

### 🔑 混合并行（Pipeline + Tensor + Data）

千亿参数模型（如 LLaMA 65B）需要三层并行：

```
Pipeline Parallel:  model layers 分到 8 卡（每卡 ~8 层）
Tensor Parallel:    每层内部横向切分到 8 卡（张量并行）
Data Parallel:       重复上述 8x8 配置，复制到多个节点
```

**Pipeline Parallel 的挑战**：GPU 空闲问题（等上一个 stage 完成）。

解决：Micro-Batch + Pipeline Schedule：

```
传统:  [GPU0][GPU1][GPU2][GPU3] 等待...
Pipeline: GPU0-M1 → GPU1-M1 → GPU2-M1 → GPU3-M1 → GPU0-M2 → ...
         填充流水线后，GPU 大部分时间都在计算（空闲大幅减少）
```

## 实战指南

### 估算通信量和扩展效率

```
Data Parallel 通信量（每 iteration）：
  - AllReduce 梯度: ~2 × model_params × bytes_per_param（Ring AllReduce）
  - 假设 model=7B params, FP16=2bytes → ~28GB/iteration

Tensor Parallel 通信量：
  - AllReduce 激活值: 与序列长度、batch 大小、TP 度数相关

Pipeline Parallel 通信量：
  - P2P 通信（activation pass）: 远小于 DP（只传激活值，不传梯度）
```

扩展效率估算：

- Data Parallel: N 张卡 → 理想加速 Nx，实际 ~0.9N（通信开销）
- 100 张卡 Data Parallel 实际加速 ~85-90x

### 多节点训练启动

```bash
# 4 节点 × 8 GPU = 32 GPU
# Node 0 为 master
torchrun \
  --nnodes=4 \
  --node_rank=0 \
  --nproc_per_node=8 \
  --master_addr="10.0.0.1" \
  --master_port=29500 \
  train.py
```

## 常见误区

### 误区 1：GPU 数量翻倍，训练速度也翻倍

**错误理解**：很多人认为增加 GPU 数量就能线性加速训练，因此盲目堆卡。

**正确理解**：分布式训练存在通信开销和同步瓶颈。Data Parallel 的 AllReduce 梯度同步需要时间，Pipeline Parallel 有流水线气泡（bubble），Tensor Parallel 有 AllReduce 激活值通信。实际加速通常是亚线性的，100 张卡可能只能达到 80-90 倍加速。此外，模型太小时，通信开销可能超过计算时间，多卡反而更慢。

**如何避免**：先估算模型的计算量和通信量，选择合适的并行策略。对于小模型（<1B），优先使用 Data Parallel；对于大模型（>10B），考虑混合并行。监控 GPU 利用率和通信时间，如果通信占比超过 30%，需要优化通信策略。

### 误区 2：ZeRO Stage 3 总是比 Stage 1 好

**错误理解**：很多人认为 ZeRO 的阶段越高（分片越多），显存节省越多，就应该总是用 Stage 3。

**正确理解**：ZeRO Stage 3 将参数也分片到不同 rank，虽然显存节省最多，但需要额外的通信来获取其他 rank 的参数。如果模型本身不大（如 7B），Stage 1 或 Stage 2 就足够了，Stage 3 的通信开销反而会降低训练速度。

**如何避免**：根据模型大小和 GPU 显存选择合适的 ZeRO Stage。7B 以下模型用 Stage 1-2，70B 以上模型用 Stage 3。可以先用小规模实验测试不同 Stage 的性能，再决定生产配置。

### 误区 3：分布式训练的代码和单卡训练差不多

**错误理解**：很多人认为分布式训练只是在单卡代码基础上加几行初始化代码，不需要深入理解。

**正确理解**：分布式训练涉及数据分片、梯度同步、混合精度、梯度累积等多个维度，每个都可能引入微妙的 bug。例如，DDP 的梯度同步依赖于反向传播的执行顺序，如果模型有复杂的控制流可能导致同步失败；DeepSpeed 的配置项众多，错误配置可能导致显存溢出或训练发散。

**如何避免**：深入理解分布式训练的原理，而不是简单复制代码。使用成熟的框架（如 PyTorch DDP、DeepSpeed），遵循最佳实践。在大规模训练前，先用小规模数据验证代码正确性。建立监控系统，跟踪各 GPU 的梯度和损失。

## 相关资源

- [PyTorch DDP 文档](https://pytorch.org/tutorials/intermediate/ddp_tutorial.html)
- [DeepSpeed 官方文档](https://www.deepspeed.ai/)
- [ZeRO 论文](https://arxiv.org/abs/1910.02054)
- [Megatron-LM 论文](https://arxiv.org/abs/1909.08053)
