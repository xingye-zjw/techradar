---
title: 多进程 DataLoader (num_workers > 0) 卡死
category: deep-learning
difficulty: intermediate
duration: 30分钟
summary: 聚焦单点问题：PyTorch DataLoader 多进程卡死，涵盖 Windows spawn 启动方式、num_workers=0、if __name__=='__main__' 保护、CUDA 不支持 fork 等排查与修复方案。
takeaways:
  - '快速识别「多进程 DataLoader (num_workers > 0) 卡死」的典型症状 - 理解该问题的根因分析和标准排查步骤 - 学会分步排查和解决问题的标准化流程 - 了解预防措施，避免下次踩同样的坑'
relatedIntel:
  - 011-pytorch - 092-pitfall-python
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

这是开发中非常容易踩的一个坑：**多进程 DataLoader (num_workers > 0) 卡死**。

设置 num_workers > 0 后程序卡死无响应，这是 Windows 用户的高频问题。根本原因是 Windows 的多进程启动方式与 Linux 不同，需要特殊处理。

如果你正在遇到类似问题，或者想提前预防，这篇卡片会帮你快速定位问题、找到解决方案，并学会从根源上避免它。

## 一句话概览（快速版）

> **快速修复：Windows → num_workers=0；Linux OK；入口加 **main** 保护**

核心要点：

- **现象**：Windows 下运行即卡死，Linux 正常
- **根因**：Windows 默认使用 spawn 方式启动子进程，而 CUDA 不支持 fork。多进程 DataLoader 在 Windows 下需要 if __nam
- **解决**：按照下方 5 步标准流程排查

## 核心拆解

### 🔑 典型症状

- × Windows 下运行即卡死，Linux 正常
- × 报错: Broken pipe / DataLoader worker (pid xxx) exited unexpectedly
- × Python 进程挂起，无报错日志

### 🔑 根本原因

Windows 默认使用 spawn 方式启动子进程，而 CUDA 不支持 fork。多进程 DataLoader 在 Windows 下需要 if **name** == '**main**' 保护，否则会无限递归创建子进程。

## 完整排查方案

按照以下步骤逐一排查，通常能在几分钟内定位并解决问题：

1.  Windows 下将 num_workers 设为 0，或改用 WSL2 / Linux 服务器训练
2.  代码入口必须加 if **name** == "**main**": 保护（spawn 多进程必需）
3.  不要在 Dataset.**getitem** 中持有未释放的文件句柄/数据库连接
4.  pin_memory=True 在支持 CUDA 时可加速主机到 GPU 的数据搬运
5.  检查 CUDA 是否支持 fork（默认不支持，改用 spawn 或 CUDA_VISIBLE_DEVICES 隔离）

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> Windows → num_workers=0；Linux OK；入口加 **main** 保护

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- Windows 开发环境建议将 num_workers 设为 0，或使用 WSL2/Linux 训练
- 代码入口必须加 if **name** == '**main**': 保护，这是 Windows 多进程的硬性要求
- 在 Dataset.**getitem** 中避免持有文件句柄或数据库连接，防止资源泄漏
- 使用 pin_memory=True 加速 GPU 数据搬运，仅在 CUDA 可用时启用

## 常见误区

1. **只看表面现象，不深挖根因** — 问题暂时解决了，但过段时间又出现
2. **跳过排查步骤直接试方案** — 容易引入新的问题
3. **不做预防措施** — 同一个坑踩好几次

## 推荐学习顺序

1. 先看「典型症状」确认你遇到的是不是这个问题
2. 再看「快速修复」试试能不能立刻解决
3. 如果不行，按照「完整排查方案」一步步来
4. 最后一定要看「预防措施」，避免下次再踩
