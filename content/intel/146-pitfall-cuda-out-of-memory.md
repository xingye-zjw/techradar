---
title: 显存不足 (CUDA out of memory)
category: deep-learning
difficulty: intermediate
duration: 30分钟
summary: 聚焦单点问题：GPU 显存不足（CUDA out of memory）导致训练/推理崩溃，涵盖降低 batch_size、AMP 自动混合精度、梯度检查点、4-bit 量化、多卡并行等排查与修复方案。
takeaways: "- 快速识别「显存不足 (CUDA out of memory)」的典型症状 - 理解该问题的根因分析和标准排查步骤 - 学会分步排查和解决问题的标准化流程 - 了解预防措施，避免下次踩同样的坑"
relatedIntel: "- 090-pitfall-dl-training - 034-cuda-programming"
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

## 为什么你要学它

这是开发中非常容易踩的一个坑：**显存不足 (CUDA out of memory)**。

训练或推理时 GPU 显存不足导致程序崩溃，是深度学习开发中最常见的运行时错误。通常发生在 batch_size 过大、模型参数量超过显卡容量、或显存未正确释放时。

如果你正在遇到类似问题，或者想提前预防，这篇卡片会帮你快速定位问题、找到解决方案，并学会从根源上避免它。

## 一句话概览（快速版）

> **快速修复：batch_size /= 2 → FP16 → gradient_checkpointing → 4-bit**

核心要点：

- **现象**：RuntimeError: CUDA out of memory at torch/csrc/generic/StorageSharing.cpp
- **根因**：GPU 显存容量有限，batch_size 过大、模型参数量过高、中间激活值过多、或前一次推理的张量未释放都会导致显存不足。混合精度训练可有效降低显存占用。
- **解决**：按照下方 6 步标准流程排查

## 核心拆解

### 🔑 典型症状

- × RuntimeError: CUDA out of memory at torch/csrc/generic/StorageSharing.cpp
- × 训练第一步就 OOM
- × Loss 正常波动，跑几步后突然 OOM

### 🔑 根本原因

GPU 显存容量有限，batch_size 过大、模型参数量过高、中间激活值过多、或前一次推理的张量未释放都会导致显存不足。混合精度训练可有效降低显存占用。

## 完整排查方案

按照以下步骤逐一排查，通常能在几分钟内定位并解决问题：

1.  降低 batch_size（最有效；梯度累积不额外占显存，降低 batch_size 时应提高 gradient_accumulation_steps 维持等效 batch）
2.  启用 AMP 自动混合精度：`with torch.cuda.amp.autocast():` + `GradScaler`（注意：`model.half()` 是将全部权重转 FP16，并非 AMP，且易数值不稳定）
3.  启用梯度检查点（gradient_checkpointing=True），以 30% 速度换 50% 显存
4.  启用 bitsandbytes 4-bit 量化，7B 模型仅需 6GB 显存
5.  多卡并行（DataParallel / DistributedDataParallel）分摊显存
6.  推理时也 OOM：检查是否有张量未从显存释放（del model; torch.cuda.empty_cache()）

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> batch_size /= 2 → FP16 → gradient_checkpointing → 4-bit

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- 训练前用小 batch_size（如 1）测试显存占用，再逐步增大找到极限
- 启用 FP16/BF16 混合精度训练，显存占用直接减半
- 7B 以上大模型务必使用 4-bit 量化（bitsandbytes），6GB 显存即可运行
- 训练脚本中加入 torch.cuda.empty_cache()，及时释放未使用的显存

## 常见误区

1. **只看表面现象，不深挖根因** — 问题暂时解决了，但过段时间又出现
2. **跳过排查步骤直接试方案** — 容易引入新的问题
3. **不做预防措施** — 同一个坑踩好几次

## 推荐学习顺序

1. 先看「典型症状」确认你遇到的是不是这个问题
2. 再看「快速修复」试试能不能立刻解决
3. 如果不行，按照「完整排查方案」一步步来
4. 最后一定要看「预防措施」，避免下次再踩
