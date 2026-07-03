---
title: Docker 容器中无法使用 GPU (nvidia-smi 报错)
category: devops
difficulty: intermediate
duration: 30分钟
summary: 聚焦单点问题：Docker 容器内无法使用 GPU，涵盖 NVIDIA Container Toolkit 安装、--gpus all 参数、nvidia/cuda 基础镜像、驱动版本兼容等排查与修复方案。
takeaways:
  - 快速识别「Docker 容器中无法使用 GPU (nvidia-smi 报错)」的典型症状
  - 理解该问题的根因分析和标准排查步骤
  - 学会分步排查和解决问题的标准化流程
  - 了解预防措施，避免下次踩同样的坑
relatedIntel:
  - 007-docker
  - 034-cuda-programming
tags:
  - 踩坑
  - 避坑指南
  - docker
  - gpu
  - cuda
  - 容器
---

## 为什么你要学它

这是开发中非常容易踩的一个坑：**Docker 容器中无法使用 GPU (nvidia-smi 报错)**。

Docker 容器内无法访问 GPU，nvidia-smi 报 No devices were found。这是容器化部署 GPU 任务时的必经之路，需要正确配置 NVIDIA Container Toolkit。

如果你正在遇到类似问题，或者想提前预防，这篇卡片会帮你快速定位问题、找到解决方案，并学会从根源上避免它。

## 一句话概览（快速版）

> **快速修复：安装 NVIDIA Container Toolkit + nvidia/cuda 基础镜像 + --gpus all**

核心要点：
- **现象**：容器内 nvidia-smi: No devices were found
- **根因**：Docker 默认不暴露 GPU 设备。需要安装 NVIDIA Container Toolkit 并在 docker run 时加 --gpus all 参数
- **解决**：按照下方 5 步标准流程排查

## 核心拆解

### 🔑 典型症状

- × 容器内 nvidia-smi: No devices were found
- × RuntimeError: CUDA error: no kernel image is available (in container)
- × 训练时 GPU 利用率为 0%

### 🔑 根本原因

Docker 默认不暴露 GPU 设备。需要安装 NVIDIA Container Toolkit 并在 docker run 时加 --gpus all 参数。基础镜像必须包含 CUDA 运行时。

## 完整排查方案

按照以下步骤逐一排查，通常能在几分钟内定位并解决问题：

01. 安装 NVIDIA Container Toolkit（Ubuntu 示例）：curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list && sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit && sudo nvidia-ctk runtime configure --runtime=docker && sudo systemctl restart docker
02. 基础镜像必须使用带 CUDA 的官方镜像（nvidia/cuda:*-runtime-* 或 *-devel-*）
03. 运行容器时加 --gpus all 参数：docker run --gpus all ...
04. 确认宿主机 NVIDIA Driver 版本与容器内 CUDA 版本兼容
05. 验证：docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> 安装 NVIDIA Container Toolkit + nvidia/cuda 基础镜像 + --gpus all

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- 部署前在宿主机安装 NVIDIA Container Toolkit，确保 Docker 能访问 GPU
- 使用 nvidia/cuda 官方基础镜像，版本与宿主机 CUDA 兼容
- docker run 时始终加 --gpus all 参数，或在 docker-compose.yml 中配置
- 验证命令：docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi

## 常见误区

1. **只看表面现象，不深挖根因** — 问题暂时解决了，但过段时间又出现
2. **跳过排查步骤直接试方案** — 容易引入新的问题
3. **不做预防措施** — 同一个坑踩好几次

## 推荐学习顺序

1. 先看「典型症状」确认你遇到的是不是这个问题
2. 再看「快速修复」试试能不能立刻解决
3. 如果不行，按照「完整排查方案」一步步来
4. 最后一定要看「预防措施」，避免下次再踩
