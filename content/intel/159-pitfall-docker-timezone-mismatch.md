---
title: Docker 容器时间与宿主机不一致
category: devops
difficulty: intermediate
duration: 30分钟
summary: Docker 容器默认使用 UTC 时区，导致日志时间戳、定时任务、数据库记录与实际时间差 8 小时（中国时区）。
takeaways:
  - 快速识别「Docker 容器时间与宿主机不一致」的典型症状
  - 掌握根因分析：Docker 基础镜像默认使用 UTC 时区，未挂载宿主机时区文件或设置 TZ 环境变量。这在涉及日...
  - 学会分步排查和解决问题的标准化流程
  - 了解预防措施，避免下次踩同样的坑
tags:
  - 踩坑
  - 避坑指南
  - docker
  - 时区
  - 日志
---

## 为什么你要学它

这是开发中非常容易踩的一个坑：**Docker 容器时间与宿主机不一致**。

Docker 容器默认使用 UTC 时区，导致日志时间戳、定时任务、数据库记录与实际时间差 8 小时（中国时区）。

如果你正在遇到类似问题，或者想提前预防，这篇卡片会帮你快速定位问题、找到解决方案，并学会从根源上避免它。

## 一句话概览（快速版）

> **快速修复：docker run -e TZ=Asia/Shanghai 或 -v /etc/localtime:/etc/localtime:ro**

核心要点：
- **现象**：日志时间戳比实际时间晚 8 小时（容器用了 UTC 而非 CST）
- **根因**：Docker 基础镜像默认使用 UTC 时区，未挂载宿主机时区文件或设置 TZ 环境变量。这在涉及日志分析和定时任务时尤为明显。
- **解决**：按照下方 5 步标准流程排查

## 核心拆解

### 🔑 典型症状

- × 日志时间戳比实际时间晚 8 小时（容器用了 UTC 而非 CST）
- × 定时任务 cron 执行时间与预期不符
- × 数据库记录的创建时间与实际文件修改时间差 8 小时

### 🔑 根本原因

Docker 基础镜像默认使用 UTC 时区，未挂载宿主机时区文件或设置 TZ 环境变量。这在涉及日志分析和定时任务时尤为明显。

## 完整排查方案

按照以下步骤逐一排查，通常能在几分钟内定位并解决问题：

01. Docker run 时加 -v /etc/localtime:/etc/localtime:ro 挂载宿主机时区
02. 或 Docker run 加 -e TZ=Asia/Shanghai 设置容器环境变量
03. 在 Dockerfile 中 RUN ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
04. 定时任务用 cron 时确保容器内时区正确：ENV TZ=Asia/Shanghai
05. 日志框架（Python logging / loguru）确认使用了正确的时区配置

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> docker run -e TZ=Asia/Shanghai 或 -v /etc/localtime:/etc/localtime:ro

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- docker run 时始终加 -e TZ=Asia/Shanghai 设置时区环境变量
- 或挂载宿主机时区文件：-v /etc/localtime:/etc/localtime:ro
- 在 Dockerfile 中设置 ENV TZ=Asia/Shanghai，确保镜像构建时就正确
- 日志框架配置时确认时区设置，避免 UTC 和本地时间混用

## 常见误区

1. **只看表面现象，不深挖根因** — 问题暂时解决了，但过段时间又出现
2. **跳过排查步骤直接试方案** — 容易引入新的问题
3. **不做预防措施** — 同一个坑踩好几次

## 推荐学习顺序

1. 先看「典型症状」确认你遇到的是不是这个问题
2. 再看「快速修复」试试能不能立刻解决
3. 如果不行，按照「完整排查方案」一步步来
4. 最后一定要看「预防措施」，避免下次再踩
