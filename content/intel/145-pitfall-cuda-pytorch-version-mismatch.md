---
title: CUDA 版本与 PyTorch 不匹配
category: devops
keywords:
  - CUDA
  - PyTorch
  - Windows
  - 环境配置
difficulty: intermediate
duration: 30分钟
summary: 安装 PyTorch 时未根据本机 CUDA 版本选择对应的 wheel 包，导致 CUDA 无法正常工作。这是新手最容易踩的第一个环境坑，常见于 Windows 和 Ubuntu 系统。
takeaways:
  - 快速识别「CUDA 版本与 PyTorch 不匹配」的典型症状
  - 掌握根因分析：CUDA Toolkit、NVIDIA 驱动、PyTorch CUDA wheel 三者版本不兼容。...
  - 学会分步排查和解决问题的标准化流程
  - 了解预防措施，避免下次踩同样的坑
tags:
  - 踩坑
  - 避坑指南
---

## 为什么你要学它

这是开发中非常容易踩的一个坑：**CUDA 版本与 PyTorch 不匹配**。

安装 PyTorch 时未根据本机 CUDA 版本选择对应的 wheel 包，导致 CUDA 无法正常工作。这是新手最容易踩的第一个环境坑，常见于 Windows 和 Ubuntu 系统。

如果你正在遇到类似问题，或者想提前预防，这篇卡片会帮你快速定位问题、找到解决方案，并学会从根源上避免它。

## 一句话概览（快速版）

> **快速修复：nvidia-smi → pytorch.org 官方命令安装 → conda 隔离**

核心要点：
- **现象**：RuntimeError: CUDA error: no kernel image is available
- **根因**：CUDA Toolkit、NVIDIA 驱动、PyTorch CUDA wheel 三者版本不兼容。pytorch.org 官方安装命令是根据特定 CUDA 版
- **解决**：按照下方 5 步标准流程排查

## 核心拆解

### 🔑 典型症状

- × RuntimeError: CUDA error: no kernel image is available
- × torch.cuda.is_available() 返回 False
- × import torch 即崩溃或 segfault

### 🔑 根本原因

CUDA Toolkit、NVIDIA 驱动、PyTorch CUDA wheel 三者版本不兼容。pytorch.org 官方安装命令是根据特定 CUDA 版本生成的，手动拼接版本号容易出错。

## 完整排查方案

按照以下步骤逐一排查，通常能在几分钟内定位并解决问题：

01. 先运行 nvidia-smi，记录驱动支持的最高 CUDA 版本（如 Driver 535.x → CUDA 12.2）
02. 前往 pytorch.org/get-started/locally/ 选择匹配版本，不要自己拼版本号
03. 使用官方给出的 pip install 命令安装对应 CUDA 版本的 PyTorch
04. 用 conda 虚拟环境隔离不同项目的 CUDA 依赖，避免混用
05. 确认 cuDNN 版本与 CUDA 兼容（cuDNN 8.x 匹配 CUDA 11.x，cuDNN 9.x 匹配 CUDA 12.x）

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> nvidia-smi → pytorch.org 官方命令安装 → conda 隔离

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- 安装前运行 nvidia-smi 记录驱动支持的最高 CUDA 版本，作为基准参考
- 始终从 pytorch.org/get-started/locally/ 获取官方安装命令，不要手动拼版本
- 使用 conda 创建独立虚拟环境隔离不同项目的 CUDA 依赖
- 创建环境后立即验证：python -c 'import torch; print(torch.cuda.is_available())'

## 常见误区

1. **只看表面现象，不深挖根因** — 问题暂时解决了，但过段时间又出现
2. **跳过排查步骤直接试方案** — 容易引入新的问题
3. **不做预防措施** — 同一个坑踩好几次

## 推荐学习顺序

1. 先看「典型症状」确认你遇到的是不是这个问题
2. 再看「快速修复」试试能不能立刻解决
3. 如果不行，按照「完整排查方案」一步步来
4. 最后一定要看「预防措施」，避免下次再踩
