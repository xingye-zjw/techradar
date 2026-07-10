---
title: Docker 容器化踩坑合集
category: devops
difficulty: intermediate
duration: 30分钟
summary: 涵盖 5 个常见踩坑：Docker 容器时间与宿主机不一致、Docker 容器中无法使用 GPU (nvidia-smi 报错)、Docker 镜像体积过大、Docker 容器内存泄漏、Docker 网络桥接模式导致容器间通信失败，每个均附快速修复与排查步骤。
takeaways: "- 掌握「Docker 容器化踩坑合集」中各问题的快速识别方法 - 理解每个踩坑的根因分析和排查步骤 - 学会标准化的修复流程和预防措施"
relatedIntel: "- 007-docker - 034-cuda-programming"
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

[环境配置]

## Docker 容器时间与宿主机不一致

// 快速修复

docker run -e TZ=Asia/Shanghai 或 -v /etc/localtime:/etc/localtime:ro

// 现象表现

- × 日志时间戳比实际时间晚8小时
- × 定时任务cron执行时间与预期不符
- × 数据库记录与实际文件修改时间差8小时

// 排查步骤

- 01 在容器内执行 date 命令确认当前时区
- 02 检查宿主机时区配置是否正确（cat /etc/localtime 或 timedatectl）
- 03 确认日志框架（如Python logging、Java Log4j）的时区配置是否与容器系统时区一致
- 04 检查 Dockerfile 是否正确配置了时区链接

#Docker#时区#日志

---

[环境配置]

## Docker 容器中无法使用 GPU (nvidia-smi 报错)

// 快速修复

安装 NVIDIA Container Toolkit + nvidia/cuda 基础镜像 + --gpus all

// 现象表现

- × 容器内执行 nvidia-smi 报 "No devices were found"
- × 程序报 "CUDA error: no kernel image available"
- × GPU 利用率为 0%，进程无法分配到 GPU

// 排查步骤

- 01 确认宿主机已安装 NVIDIA 驱动（nvidia-smi 在宿主机上能正常执行）
- 02 检查是否安装了 NVIDIA Container Toolkit（nvidia-ctk --version）
- 03 确认 Docker daemon 配置了 nvidia runtime（cat /etc/docker/daemon.json 是否有 "runtimes": {"nvidia": {...}}）
- 04 重启 Docker 服务使配置生效（systemctl restart docker）
- 05 使用官方 nvidia/cuda 基础镜像而非普通基础镜像
- 06 启动容器时添加 --gpus all 参数

#Docker#GPU#CUDA#容器

---

[环境配置]

## Docker 镜像体积过大

// 快速修复

多阶段构建 + .dockerignore + 合并RUN指令并清理缓存

// 现象表现

- × 镜像体积达到数GB
- × 推送和拉取镜像时经常超时
- × 部署到服务器耗时过长

// 排查步骤

- 01 使用 docker history <image> 查看各层大小，找出体积最大的层
- 02 检查是否使用了 -full 或 -devel 等胖基础镜像
- 03 确认 .dockerignore 文件是否排除了无关文件（venv、.git、数据文件、模型权重等）
- 04 检查 RUN 指令是否在同一条命令中清理了缓存（apt-get clean、pip install --no-cache-dir）
- 05 确认是否需要多阶段构建分离编译环境和运行环境

#Docker#容器#性能优化

---

[环境配置]

## Docker 容器内存泄漏

// 快速修复

限制内存 + 设置 --memory-swap + 定期重启容器

// 现象表现

- × 容器内存占用持续增长，无法降低
- × 最终容器被 OOM Killer 杀掉，docker ps 看不到容器
- × 应用突然崩溃退出，无明确错误日志

// 排查步骤

- 01 执行 docker ps -a 找到已退出的容器，检查状态码是否为 137（SIGKILL）
- 02 执行 docker inspect <container_id> | grep -i oom 确认是否被 OOM Killer 杀掉
- 03 使用 docker stats 监控容器内存使用趋势
- 04 检查应用代码是否存在内存泄漏（堆内存、文件句柄、线程泄漏）
- 05 在 docker run 时添加 --memory 参数限制容器可用内存
- 06 查看宿主机 dmesg | grep -i oom 确认内核层面的内存压力

#Docker#OOM#内存安全

---

[环境配置]

## Docker 网络桥接模式导致容器间通信失败

// 快速修复

使用 docker-compose 或 --network 指定自定义网络

// 现象表现

- × 容器间无法通过容器名互相访问
- × ping 容器名报 "Name or service not known"
- × telnet 或 curl 连接到其他容器失败

// 排查步骤

- 01 执行 docker network ls 查看当前网络列表
- 02 执行 docker inspect <container_id> | grep NetworkMode 确认容器所在网络
- 03 检查是否使用了默认的 bridge 网络（默认 bridge 不支持 DNS 解析）
- 04 创建自定义 bridge 网络：docker network create <network_name>
- 05 启动容器时指定网络：docker run --network <network_name>
- 06 使用 docker-compose 统一管理网络配置

#Docker#网络#容器

## 修复后附加：最小一键诊断命令

```bash
# DevOps 最小自检：Docker/K8s/磁盘空间/SSH 端口 10 秒内出结论
set -e
echo '--- docker ---' && (docker info 2>/dev/null | head -n 5 || echo 'docker unavailable')
echo '--- disk ---'   && df -h / | tail -n 1
echo '--- k8s ---'    && (kubectl cluster-info 2>/dev/null | head -n 3 || echo 'kubectl unavailable')
echo '--- ssh 22 ---' && (timeout 3 bash -c 'cat < /dev/tcp/127.0.0.1/22' >/dev/null 2>&1 && echo open || echo closed)
```
