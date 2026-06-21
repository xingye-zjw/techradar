# Docker

**Docker** 是一个开源的容器化平台，由 Docker, Inc.（前身为 dotCloud）于 2013 年发布。它让开发者可以将应用及其依赖打包成轻量级、可移植的**容器**，然后部署到任何支持 Docker 的环境中。

Docker 已成为现代软件开发、CI/CD 和微服务架构的事实标准。

## Docker 解决了什么问题？

### 经典场景：「在我机器上能跑」

开发者 A 写好了代码 → 测试员 B 跑不起来 → 运维 C 部署失败 → DBA E 环境冲突

Docker 的答案：**把整个应用环境打包。**

### Docker vs. 虚拟机 (VM)

| 特性 | Docker 容器 | 传统虚拟机 |
|------|-----------|-----------|
| 启动速度 | 秒级 | 分钟级 |
| 大小 | MB 级 | GB 级 |
| 资源占用 | 轻量（共享内核） | 重（独立 OS）|
| 隔离性 | 进程级 | 系统级 |
| 数量 | 单机可运行数百个 | 单机几个到十几个 |
| 部署方式 | 镜像拉取 + 容器启动 | ISO 安装 + 配置 |

## 核心概念

### 1. 镜像 (Image)

- 镜像 = 应用 + 运行环境 + 配置
- 是**只读**的模板
- 采用分层结构（Union FS），每一层都是可读的文件系统
- 可以基于现有镜像构建新镜像（像 Git 一样）

```
┌────────────────────┐
│   应用层           │  ← 你的应用代码
├────────────────────┤
│   依赖层           │  ← Python、Node.js、库文件
├────────────────────┤
│   操作系统层       │  ← Ubuntu / Alpine
└────────────────────┘
```

### 2. 容器 (Container)

- 容器 = 镜像的**运行实例**
- 镜像和容器的关系如同「程序和进程」
- 容器可以被启动、停止、删除、暂停
- 容器本质上是一个被隔离的进程

### 3. Dockerfile

定义如何构建镜像的脚本文件：

```dockerfile
# 基础镜像
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 安装依赖（这一步会被缓存）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY . .

# 设置环境变量
ENV PORT=8000

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["python", "app.py"]
```

### 4. Docker Compose

用于定义和运行多容器应用：

```yaml
services:
  web:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  postgres_data:
```

### 5. 仓库 (Registry / Hub)

- 镜像的集中存储和分发服务
- Docker Hub（官方公共仓库）
- GitHub Container Registry (GHCR)
- 阿里云镜像服务、Harbor（私有部署）

## Docker 的底层原理

Docker 容器并不是什么黑魔法，它本质上是对 Linux 内核特性的组合使用：

### 1. Namespace（命名空间）—— 「让进程以为自己是世界的全部」

| Namespace | 隔离内容 |
|----------|---------|
| PID | 进程 ID（容器有自己的 PID 1） |
| NET | 网络栈（容器有自己的网络命名空间） |
| MNT | 文件系统挂载点 |
| UTS | 主机名和域名 |
| IPC | 进程间通信 |
| USER | 用户和用户组 |

### 2. Control Groups (cgroups)—— 「限制和监控资源」

控制容器可以使用的 CPU、内存、磁盘 I/O、网络带宽等资源：

```bash
docker run --memory="512m" --cpus="0.5" my-app
```

### 3. Union File System (UnionFS)—— 「高效的分层文件系统」

- 镜像采用分层结构
- 多个容器可以共享底层镜像层
- 容器启动时在最上层加一个**可写层**

## 常用命令速查

```bash
# 镜像操作
docker pull nginx:alpine          # 拉取镜像
docker build -t myapp:v1 .        # 构建镜像
docker images                      # 列出本地镜像
docker rmi <image_id>              # 删除镜像

# 容器操作
docker run -p 80:80 nginx          # 启动新容器
docker ps                          # 查看运行中的容器
docker ps -a                       # 查看所有容器
docker stop <container_id>         # 停止容器
docker rm <container_id>           # 删除容器
docker logs -f <container_id>      # 查看日志
docker exec -it <container_id> bash  # 进入容器交互

# 清理
docker system prune                # 清理无引用资源
docker system df                   # 查看磁盘使用

# Compose
docker compose up -d               # 启动服务
docker compose down                # 停止服务
docker compose logs web            # 查看特定服务日志
```

## Docker 最佳实践

### 1. 镜像优化

| 问题 | 解决方法 |
|------|---------|
| 镜像过大 | 使用 `slim` / `alpine` 变体、多阶段构建 |
| 构建慢 | 合理利用缓存，把不常变的放在前面 |
| 含敏感信息 | 不要把密码、密钥写在 Dockerfile；使用 `.dockerignore` |

### 2. 多阶段构建（Multi-stage Build）

```dockerfile
# 构建阶段
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段（只包含产物）
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

最终镜像只有几十 MB，且不含源码、node_modules 等非必要内容。

### 3. 容器健康检查

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1
```

### 4. 不要以 root 运行

```dockerfile
RUN adduser -D appuser
USER appuser
```

### 5. 日志管理

- 应用日志输出到 `stdout` / `stderr`（不要写到文件）
- Docker 负责收集、轮转和转发到集中式日志系统（ELK、Loki、Datadog）

### 6. 数据持久化

- 容器内的文件系统是**临时**的（容器删除后数据也没了）
- 需要持久化的数据挂到 **Volume** 或 **Bind Mount**

## Docker 在 AI/ML 开发中的典型用法

### 场景 1：标准化开发环境

团队每个人拿到同一个基础镜像：

```dockerfile
FROM nvidia/cuda:12.1.0-cudnn8-runtime-ubuntu22.04
RUN pip install torch==2.1 transformers datasets accelerate
WORKDIR /workspace
```

```bash
docker run -it --gpus all -v $PWD:/workspace my-dev-env
```

### 场景 2：训练任务隔离

```bash
# 每个实验独立运行，互不干扰
for config in configs/*.yaml; do
    docker run --gpus '"device=0"' -v $PWD/runs:/runs \
        my-trainer:v1 --config $config
done
```

### 场景 3：模型服务部署

```dockerfile
FROM python:3.11-slim
RUN pip install fastapi uvicorn transformers torch --index-url https://download.pytorch.org/whl/cpu
COPY ./model /model
COPY ./app.py /app.py
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 场景 4：CI/CD

```yaml
# GitHub Actions 示例
jobs:
  test:
    runs-on: ubuntu-latest
    container: python:3.11
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r requirements.txt
      - run: pytest
```

## Docker 生态

| 工具 | 作用 |
|------|------|
| **Docker Engine** | 核心运行时 |
| **Docker Compose** | 多容器编排（单机） |
| **Docker Swarm** | Docker 原生集群编排（已基本被 K8s 取代） |
| **Kubernetes (K8s)** | 工业级容器编排和调度平台 |
| **Podman** | 无守护进程的 Docker 替代品（RedHat） |
| **BuildKit** | 下一代镜像构建器（已内置于 Docker） |
| **Docker Scout** | 镜像漏洞扫描 |

## 常见问题与排查

### 1. 容器无法访问网络

```bash
# 检查 Docker 网络
docker network ls
# 检查容器网络配置
docker inspect <container_id> | jq '.[].NetworkSettings'
```

### 2. 容器退出但没有日志

```bash
# 即使退出了也可以看日志
docker logs <container_id>
# 查看退出码
docker inspect <container_id> | jq '.[].State.ExitCode'
```

### 3. 镜像体积过大

```bash
# 查看镜像每层的大小
docker history my-image:latest
# 使用 dive 工具深入分析
dive my-image:latest
```

## Docker 学习路径

```
第一阶段：基础
  │
  ├── 理解容器 vs 虚拟机
  ├── Dockerfile 基本指令
  ├── 构建第一个镜像
  ├── run/exec/logs/ps 等常用命令
  │
  └── 成果：能够把自己的脚本/应用打包成镜像

第二阶段：进阶
  │
  ├── Docker Compose 多容器编排
  ├── 镜像优化（多阶段构建、alpine）
  ├── 网络模式（bridge/host/overlay）
  ├── 数据持久化（volume/bind mount）
  │
  └── 成果：能够用 Compose 部署包含 DB + App + Cache 的整套服务

第三阶段：生产环境
  │
  ├── 镜像安全扫描（Trivy/Docker Scout）
  ├── 私有 Registry / 镜像签名
  ├── 资源限制 (cgroup) / 健康检查
  ├── 日志收集 / 监控
  │
  └── 成果：能够设计生产环境的部署方案

第四阶段：平台级
  │
  ├── Kubernetes (容器编排)
  ├── CI/CD 流水线
  ├── GitOps (ArgoCD / Flux)
  │
  └── 成果：能够设计和运维容器化平台
```

相关术语：[Linux](/glossary/linux)、[Git](/glossary/git)、[PyTorch](/glossary/pytorch)
