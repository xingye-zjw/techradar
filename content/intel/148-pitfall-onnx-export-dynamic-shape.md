---
title: ONNX 导出失败 / 动态 shape
category: devops
difficulty: intermediate
duration: 30分钟
summary: 聚焦单点问题：ONNX 导出后动态 shape 失效或算子不支持，涵盖 dynamic_axes 声明、opset 版本、model.eval() 推理模式、onnx-simplifier 等排查与修复方案。
takeaways: "- 快速识别「ONNX 导出失败 / 动态 shape」的典型症状 - 理解该问题的根因分析和标准排查步骤 - 学会分步排查和解决问题的标准化流程 - 了解预防措施，避免下次踩同样的坑"
relatedIntel: "- 014-onnx - 026-onnx-deployment"
tags:
  - DevOps
  - 部署
  - 运维
  - 容器
relatedTerms:
  - git
  - docker
  - linux
  - kubernetes
relatedTools:
  - mlflow
  - docker
  - kubernetes
relatedNodes:
  - docker-basic
  - devops-kubernetes
---

## 为什么你要学它

这是开发中非常容易踩的一个坑：**ONNX 导出失败 / 动态 shape**。

使用 torch.onnx.export 导出模型时遇到 shape 不匹配或算子不支持的错误，导出成功后推理结果与 PyTorch 不一致。动态输入 shape 场景尤其容易出问题。

如果你正在遇到类似问题，或者想提前预防，这篇卡片会帮你快速定位问题、找到解决方案，并学会从根源上避免它。

## 一句话概览（快速版）

> **快速修复：dynamic_axes 声明 + opset 14+ + onnxsim 简化**

核心要点：

- **现象**：torch.onnx.export 报 shape mismatch 或 unsupported op
- **根因**：PyTorch 某些算子在 ONNX opset 版本中未实现，或 dynamic_axes 未正确声明导致固定 shape 推理。导出时未调用 model.eval() 会导致 BatchNorm 使用错误的 batch stats
- **解决**：按照下方 6 步标准流程排查

## 核心拆解

### 🔑 典型症状

- × torch.onnx.export 报 shape mismatch 或 unsupported op
- × 导出成功但推理输出与 PyTorch 不一致（diff > 1e-3）
- × 输入 shape 可变时结果错误（batch_size / seq_len 变化）

### 🔑 根本原因

PyTorch 某些算子在 ONNX opset 版本中未实现，或 dynamic_axes 未正确声明导致固定 shape 推理。导出时未调用 model.eval() 会导致 BatchNorm 使用错误的 running stats。

## 完整排查方案

按照以下步骤逐一排查，通常能在几分钟内定位并解决问题：

1.  显式指定 dynamic_axes，让输入 batch / seq_len 真的动态
2.  使用 opset_version >= 14，新版算子支持更全
3.  导出前 model.eval() 确保 BatchNorm 使用 running stats（推理模式）而非 batch stats（训练模式）
4.  用 onnx-simplifier 做常量折叠与形状推断：model_simplified, ok = onnxsim.simplify(model)
5.  用 onnxruntime-gpu 而非 CPU 版推理，速度差 10 倍以上
6.  导出后对比 PyTorch 输出与 ONNXRuntime 输出的最大误差（应 < 1e-3）

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> dynamic_axes 声明 + opset 14+ + onnxsim 简化

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- 导出前调用 model.eval()，确保 BatchNorm 和 Dropout 使用推理模式
- 使用 opset_version >= 14，获得更全面的算子支持
- 用 onnx-simplifier 做常量折叠，简化计算图并修复形状推断问题
- 导出后立即对比 PyTorch 和 ONNXRuntime 的输出，误差应 < 1e-3

## 常见误区

1. **只看表面现象，不深挖根因** — 问题暂时解决了，但过段时间又出现
2. **跳过排查步骤直接试方案** — 容易引入新的问题
3. **不做预防措施** — 同一个坑踩好几次

## 推荐学习顺序

1. 先看「典型症状」确认你遇到的是不是这个问题
2. 再看「快速修复」试试能不能立刻解决
3. 如果不行，按照「完整排查方案」一步步来
4. 最后一定要看「预防措施」，避免下次再踩
