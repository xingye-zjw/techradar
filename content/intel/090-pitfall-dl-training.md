---
title: 深度学习训练常见踩坑合集
category: deep-learning
difficulty: intermediate
duration: 30分钟
summary: 涵盖 6 个常见踩坑：显存不足 (CUDA out of memory)、Loss NaN / 梯度爆炸、多进程 DataLoader 卡死、模型训练收敛慢/几乎不收敛、CUDA 隐式同步导致推理速度异常慢、训练用 GPU 卡与推理用卡架构不一致，每个均附快速修复与排查步骤。
takeaways:
  - 掌握「深度学习训练常见踩坑合集」中各问题的快速识别方法 - 理解每个踩坑的根因分析和排查步骤 - 学会标准化的修复流程和预防措施
relatedIntel:
  - 011-pytorch - 034-cuda-programming - 017-metrics
tags:
  - 深度学习
  - DL
  - 训练
  - PyTorch
relatedTerms:
  - tensor
  - gradient-descent
  - transformer
  - cnn
relatedTools:
  - pytorch
  - numpy
  - huggingface-transformers
relatedNodes:
  - cv-segmentation
  - llm-inference
---

[深度学习]

## 显存不足 (CUDA out of memory)

// 快速修复

batch_size 减半 → 启用 FP16 混合精度 → 启用梯度检查点 → 启用 4-bit 量化 → 多卡并行

// 现象表现

- × RuntimeError: CUDA out of memory
- × 训练第一步就 OOM
- × Loss 正常但跑几步后突然 OOM

// 排查步骤

- 01 降低 batch_size，逐次减半直到能跑通
- 02 启用 FP16/BF16 混合精度训练（AMP）
- 03 启用梯度检查点（gradient checkpointing）牺牲速度换显存
- 04 启用 4-bit 量化（如 GPTQ/AWQ）压缩模型
- 05 使用多卡并行（DataParallel/DistributedDataParallel）分担显存
- 06 检查是否有张量未正确释放（del、torch.cuda.empty_cache()）

#OOM#显存#训练#LLM

---

[深度学习]

## Loss NaN / 梯度爆炸

// 快速修复

降学习率 + 梯度裁剪 + warmup，优先排查数据问题

// 现象表现

- × train_loss 跳到 inf 或 NaN
- × eval_loss 稳定但 train_loss 异常
- × embedding 参数中出现 NaN

// 排查步骤

- 01 降低学习率（先除以 10）
- 02 启用梯度裁剪：`torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)`
- 03 检查训练数据是否存在 NaN/Inf 值
- 04 检查数据长度是否超限（padding 过多）
- 05 使用 AdamW + 学习率 warmup
- 06 切换到 FP32 精度定位问题
- 07 第一个 epoch 逐batch打印 loss，早期发现问题

#Loss#梯度#数值稳定性

---

[深度学习]

## 多进程 DataLoader 卡死

// 快速修复

Windows 系统设置 num_workers=0；Linux 可正常多进程；入口加 `if __name__ == "__main__"` 保护

// 现象表现

- × Windows 下卡死，Linux 下正常
- × Broken pipe / DataLoader worker exited 错误
- × Python 进程挂起，无任何日志输出

// 排查步骤

- 01 Windows 系统设置 `num_workers=0`（Windows 多进程机制与 Linux 不同）
- 02 确保入口有 `if __name__ == "__main__"` 保护
- 03 Dataset 中不要持有文件句柄或数据库连接
- 04 使用 `pin_memory=True` 加速 GPU 传输
- 05 避免使用 fork 多进程方式，改用 spawn
- 06 检查 worker 进程是否异常退出，添加 `prefetch_factor`

#DataLoader#多进程#Windows

---

[深度学习]

## 模型训练收敛慢/几乎不收敛

// 快速修复

可视化第一批数据 + 学习率扫描 + 检查 loss 函数类型

// 现象表现

- × Loss 下降极慢，训练很久几乎没有变化
- × 训练集和验证集 Loss 同时偏高
- × Accuracy 停在随机猜测水平

// 排查步骤

- 01 可视化第一批输入数据，确认数据内容正确
- 02 学习率范围搜索（LR Finder），找到合适学习率
- 03 检查 loss 函数类型是否匹配任务（分类用 CrossEntropy，回归用 MSE）
- 04 检查数据归一化/标准化是否正确
- 05 检查模型容量是否足够（先用小数据测试过拟合能力）
- 06 确认预训练权重是否正确加载（检查权重形状匹配）
- 07 检查数据标注质量（抽样人工检查）

#收敛#训练#学习率#数据质量

---

[深度学习]

## CUDA 隐式同步导致推理速度异常慢

// 快速修复

删除循环内的 .item() / .cpu()，统一在最后转换到 CPU

// 现象表现

- × GPU Time 远小于 CPU Time
- × 大量时间花在 CPU 等待 GPU 完成
- × 单次推理耗时高达几十毫秒甚至更高

// 排查步骤

- 01 排查代码中是否有 `.item()`、`.cpu()`、`.numpy()` 在循环内调用
- 02 这些操作会触发隐式同步，强制 CPU 等待 GPU
- 03 将张量转换移到循环外，最后统一转换
- 04 使用 `torch.cuda.synchronize()` 分析耗时分布
- 05 批量推理替代逐样本推理，提高 GPU 利用率
- 06 考虑使用 `torch.inference_mode()` 或 `torch.no_grad()`

#CUDA#推理加速#性能优化

---

[深度学习]

## 训练用 GPU 卡与推理用卡架构不一致

// 快速修复

训练推理使用同架构 GPU，或导出 ONNX 跨架构验证

// 现象表现

- × A100 训练成功但 3090 报 GPU 架构不兼容
- × 权重迁移到不同架构后出现 NaN
- × AMP 混合精度在不同架构上行为不一致

// 排查步骤

- 01 确认 NVIDIA GPU 架构代数：Hopper（H100）、Ampere（A100/3090）、Ada（4090）等
- 02 尽量使用同系列 GPU 进行训练和推理
- 03 导出 ONNX 格式进行跨架构验证
- 04 统一 PyTorch 版本，避免因版本差异导致算子不支持
- 05 避免使用特定架构的新特性（如 Hopper 的 FP8 指令）
- 06 在部署前用 ONNX Runtime 或 TensorRT 做跨平台验证

#GPU#CUDA#模型迁移

## 修复后附加：最小一键诊断命令

```bash
# DL 最小自检：GPU 显存+CUDA+PyTorch 10 秒内结论
python - <<'PY'
import torch, time
t0 = time.time()
print('cuda', torch.cuda.is_available(), 'device_count', torch.cuda.device_count())
if torch.cuda.is_available():
    print('mem(MiB)', *[round(torch.cuda.get_device_properties(i).total_memory/1024**2, 0) for i in range(torch.cuda.device_count())])
    a = torch.randn((1, 3, 512, 512), device='cuda', dtype=torch.float16)
    print('fp16 tensor live', a.shape, 'ms', round((time.time()-t0)*1000, 1))
PY
```
