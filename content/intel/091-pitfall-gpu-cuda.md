---
title: "GPU 与 CUDA 环境踩坑合集"
category: deep-learning
difficulty: intermediate
duration: 30分钟
summary: 涵盖 4 个常见踩坑：CUDA 版本与 PyTorch 不匹配、Docker 容器中无法使用 GPU (nvidia-smi 报错)、多 GPU 训练时显存分配不均、GPU 温度过高导致降频/崩溃，每个均附快速修复与排查步骤。
takeaways:
  - 掌握「GPU 与 CUDA 环境踩坑合集」中各问题的快速识别方法
  - 理解每个踩坑的根因分析和排查步骤
  - 学会标准化的修复流程和预防措施
relatedIntel:
  - 034-cuda-programming
  - 011-pytorch
tags:
  - 踩坑
  - GPU
  - CUDA
  - 环境配置
---

[环境配置]

## CUDA 版本与 PyTorch 不匹配

// 快速修复

nvidia-smi → pytorch.org 官方命令安装 → conda 隔离环境

// 现象表现

- × RuntimeError: CUDA error: no kernel image is available for execution on the device
- × torch.cuda.is_available() 返回 False
- × import torch 即崩溃或报错 "CUDA driver version is insufficient"

// 排查步骤

- 01 运行 nvidia-smi 记录驱动支持的最高 CUDA 版本
- 02 访问 pytorch.org 选择与 CUDA 版本匹配的 PyTorch 版本
- 03 使用官方提供的 pip install 命令安装（勿用 conda default channel）
- 04 用 conda 创建独立环境隔离 PyTorch 版本
- 05 确认 cuDNN 版本与 CUDA 兼容（pip/conda 安装的 PyTorch 通常自带匹配版本）

#CUDA#PyTorch#Windows#环境配置

---

[环境配置]

## Docker 容器中无法使用 GPU (nvidia-smi 报错)

// 快速修复

安装 NVIDIA Container Toolkit + nvidia/cuda 基础镜像 + --gpus all 参数

// 现象表现

- × 容器内执行 nvidia-smi 报错：No devices were found
- × CUDA error: no kernel image is available
- × 训练时 GPU 利用率为 0%，模型跑在 CPU 上

// 排查步骤

- 01 在宿主机安装 NVIDIA Container Toolkit 并配置 docker runtime
- 02 使用 nvidia/cuda 官方镜像作为基础镜像（不要用 ubuntu/debian 等通用镜像）
- 03 运行容器时添加 --gpus all 参数，而非仅映射 GPU 设备文件
- 04 确认宿主机驱动版本与容器内 CUDA 版本兼容
- 05 验证：进入容器后执行 nvidia-smi 确认能看到 GPU

#Docker#GPU#CUDA#容器

---

[环境配置]

## 多 GPU 训练时显存分配不均

// 快速修复

设置 CUDA_VISIBLE_DEVICES + 改用 DistributedDataParallel (DDP)

// 现象表现

- × GPU 0 显存爆满，其他 GPU 闲置或显存占用极低
- × 训练速度反而变慢，多卡还不如单卡
- × 使用 DataParallel 时负载集中在单一 GPU

// 排查步骤

- 01 检查 CUDA_VISIBLE_DEVICES 环境变量，确保所有 GPU 均可见
- 02 使用 torch.distributed.init_process_group 初始化分布式训练
- 03 将 DataParallel 改为 DistributedDataParallel，避免单卡瓶颈
- 04 确认总 batch_size = 单卡 batch_size × GPU 数量（线性扩展）
- 05 检查每张卡的 rank 和 local_rank 配置是否正确

#GPU#显存#训练#多进程

---

[环境配置]

## GPU 温度过高导致降频/崩溃

// 快速修复

清理 GPU 散热 + 降低功率限制 + 使用 PCIe 延长线改善风道

// 现象表现

- × 训练突然变慢，nvidia-smi 显示 GPU 温度持续 90+°C
- × 性能随时间持续下降，GPU 利用率波动剧烈
- × 高温触发保护机制，GPU 自动降频或断电重启

// 排查步骤

- 01 运行 nvidia-smi -l 1 监控温度变化曲线，确认过热时间段
- 02 打开机箱检查 GPU 风扇积灰情况，清理散热器灰尘
- 03 在 nvidia-smi 中降低功率限制（power limit）减少发热
- 04 使用 xformers 或开启混合精度降低显存和计算发热
- 05 Jupyter Notebook 中实时监控温度，过热前暂停训练

#GPU#散热#训练#性能优化
