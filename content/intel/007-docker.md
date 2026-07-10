---
title: Docker 容器化部署
category: devops
difficulty: beginner
duration: 1-2周
summary: 把应用（含 Python 环境、CUDA、系统库）打包成可在任何 Linux/Windows/Mac 上运行的镜像，一次构建，到处运行
takeaways: "- 理解镜像 vs 容器 vs Dockerfile 的关系
  - 能写一个 PyTorch 推理服务的 Dockerfile（含 .dockerignore、多阶段、非 root 用户）
  - 理解 nvidia-container-toolkit 是让容器看见 GPU 的关键组件
  - 能用 Docker Compose 编排多容器服务（API + Redis），并持久化数据"
relatedTools: ["ultralytics-yolo", "mlflow", "docker"]
relatedIntel: "- 008-git
  - 009-linux
  - 012-streamlit"
relatedNodes: [
    "- electrical-safety
    - docker-basic",
    "devops-kubernetes",
  ]
tags: "- docker
  - container
  - dockerfile
  - image
  - volume
  - compose
  - gpu
  - nvidia-docker"
relatedTerms: ["linux", "docker", "kubernetes", "git"]
---

## 为什么你要学它

你在本机把一个 PyTorch 推理服务跑通了，写了 `requirements.txt`，能返回 `{"pred": 4}`。你高高兴兴把代码推到服务器，同事 `git pull && pip install -r requirements.txt && python serve.py`——结果报错：

- 他的 CUDA 版本是 12.1，你是 11.8
- 他的 Python 是 3.11，你是 3.10
- 他是 Ubuntu 20.04，你是 Arch
- 一些原生依赖（libsndfile / libgl1-mesa-glx）没装，PIL 报 OSError
- 他的 pip 缓存里有一个旧版本的 torch，API 已变化

这种"在我机器上能跑"的问题，就是 Docker 要解决的。它的承诺是：**你把应用和它的全部依赖（代码、Python 解释器、CUDA、系统库、配置文件、环境变量）打包成一个"镜像（Image）"，它可以在任何装了 Docker 的机器上以完全一致的方式运行**。

对 AI 开发者来说，Docker 的价值尤其明显：

- **环境一致**：你本地用 `pytorch:2.1.0-cuda11.8-cudnn8-runtime` 镜像做的实验，部署到服务器跑出来的结果完全相同
- **不污染主机**：你装了 10 个版本的 Python 包，主机系统一点没动；容器删掉就干净了
- **部署简单**：从开发机到训练机到推理服务器，镜像一推一拉，几十秒就能跑
- **可复现**：你 2025 年的实验，2027 年还能复现——只要镜像还在

所以 Docker 不是"运维的东西"。对 AI/ML 工程师来说，它和 pip、conda、git 一样是基础工具。

## 一句话概览（快速版）

- **核心三件套**：Dockerfile = 你写的构建脚本；Image = 构建产物，一个只读的多层文件系统；Container = 镜像的运行实例（隔离的进程 + 文件系统 + 网络）。
- **基础镜像选对**：普通 Python 应用用 `python:3.10-slim`；PyTorch GPU 应用直接用 `pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime`，省得自己装 CUDA。
- **GPU 支持两步走**：1) 主机装 `nvidia-container-toolkit`；2) 容器从 `nvidia/cuda:*` 或 `pytorch/pytorch:*` 镜像启动时加 `--gpus all`。
- **数据持久化**：用 Volume（`docker run -v mydata:/data`）或 Bind Mount（`-v /host/path:/container/path`）把数据放到容器外，容器被删数据不丢。
- **多容器编排用 Compose**：写一个 `docker-compose.yml`，一条 `docker compose up` 就能同时启动 API、Redis、数据库，还能配网络和依赖关系。

## 核心拆解

### 🔑 镜像 vs 容器 vs Dockerfile

三者的关系可以这么理解：

- **Dockerfile** ≈ **食谱**：你写的一组"步骤"（FROM、COPY、RUN、CMD……），描述如何把原材料（基础镜像 + 你的代码）变成成品
- **Image（镜像）** ≈ **蛋糕**：构建命令 `docker build` 的产物。它是一个只读的、由多个 layer 叠加的大文件，存在本地或 Docker Hub / 私有 registry 里
- **Container（容器）** ≈ **正在吃的那份蛋糕**：镜像的一个运行实例。它在镜像只读 layer 之上加了一个可写的 thin layer，每个容器有自己独立的进程树、文件系统、网络栈

关键区别：**镜像可以无限次启动为容器；每个容器是隔离的，互不影响**。

常用命令对照：

| 意图                | 命令                                    |
| ------------------- | --------------------------------------- |
| 构建镜像            | `docker build -t my-app:v1 .`           |
| 列出镜像            | `docker images`                         |
| 启动容器            | `docker run -d -p 8000:8000 my-app:v1`  |
| 列出正在跑的容器    | `docker ps`                             |
| 停止容器            | `docker stop <container_id>`            |
| 进入容器            | `docker exec -it <container_id> bash`   |
| 查看日志            | `docker logs -f <container_id>`         |
| 上传到 registry     | `docker push my-registry.com/my-app:v1` |
| 清理未用的镜像/容器 | `docker system prune`                   |

### 🔑 Dockerfile 常用指令

按最佳实践的顺序来写：

```dockerfile
# 1. FROM：选择基础镜像。尽量用官方维护的、带版本号的
FROM pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime

# 2. 设置工作目录（后续 RUN/COPY/CMD 的相对路径基准）
WORKDIR /app

# 3. 安装系统依赖（若需要）。apt-get 建议合并为一条 RUN，最后 rm -rf /var/lib/apt/lists/* 减体积
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 4. 先只复制 requirements.txt，利用缓存！只要这个文件不变，pip 层就不会重建
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. 再复制源代码
COPY . .

# 6. 声明端口（文档用途，并不自动发布）
EXPOSE 8000

# 7. CMD：容器默认启动命令（可用 exec 形式，PID 1 为你的进程）
CMD ["uvicorn", "serve:app", "--host", "0.0.0.0", "--port", "8000"]
```

**关于 .dockerignore**：跟 `.gitignore` 一样，列出不想复制进镜像的文件。示例：

```
.git
__pycache__/
*.pyc
*.pyo
*.pyd
data/
*.pt
*.onnx
venv/
.venv/
.DS_Store
.ipynb_checkpoints/
```

忽略掉大文件（模型权重、数据、venv）能让 `docker build` 快好几倍，镜像也更小。

**关于多阶段构建**：如果你的镜像里有编译产物（例如装了 `build-essential` 只为编译一个 C 扩展），可用多阶段构建把"构建环境"和"运行环境"分开：

```dockerfile
# -------- 阶段 1：构建 --------
FROM python:3.10-slim AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt
COPY . .

# -------- 阶段 2：运行 --------
FROM python:3.10-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local   # 把 pip 安装的包拷贝过来
COPY --from=builder /build/serve.py .
EXPOSE 8000
CMD ["uvicorn", "serve:app", "--host", "0.0.0.0", "--port", "8000"]
```

最终镜像只有运行时依赖，不含 `build-essential`、`gcc` 等编译工具，体积可减少 50%+。

### 🔑 GPU 容器：nvidia-container-toolkit

容器默认看不见主机的 GPU。要让 `torch.cuda.is_available()` 返 `True`，需要两步：

**Step 1：主机安装 NVIDIA Container Toolkit**（一次性操作）

```bash
# Ubuntu/Debian （其他发行版见 NVIDIA 官网）
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
  sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -sL https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

**Step 2：用带 CUDA 的基础镜像启动容器时指定 `--gpus`**

```bash
# 测试：在容器内跑 nvidia-smi，应该看到 GPU 信息
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
```

常见坑：

- **主机驱动版本太旧**：容器内 CUDA 要求主机驱动 ≥ 某个版本。`nvidia-smi` 的 CUDA Version 是驱动支持的最高 CUDA，它必须 ≥ 容器内 CUDA 版本。
- **忘了加 `--gpus all`**：不加时容器看不到 GPU，`torch.cuda.is_available()` 必为 False。
- **用了 CPU 版的基础镜像**：镜像名必须是 `cuda`/`runtime` 系列，不是普通 `python`。

### 🔑 数据持久化：Volume 与 Bind Mount

容器里写的文件默认保存在容器的可写 layer 上——**容器被删，数据也没了**。所以任何需要持久化的数据（数据库文件、模型权重、训练 log）都必须"挂到外面"。

两种挂载方式：

```bash
# 方式 A：Bind Mount（把主机某个目录挂进容器）
# 最常用，开发时也能用它实现"改代码自动生效"
docker run -d -p 8000:8000 \
  -v /home/you/my-app/data:/app/data:ro \
  my-app:v1
# 结尾 :ro = read-only（防止容器误写数据目录）

# 方式 B：Named Volume（由 Docker 管理的持久化卷）
# 生产用更好：权限由 Docker 统一管理，跨容器共享方便
docker run -d -p 8000:8000 \
  -v model_weights:/app/weights \
  my-app:v1
```

**开发时的"热重载"技巧**：本地开发时用 Bind Mount 把源代码挂进容器，主机改代码容器内立即生效，不用 rebuild：

```bash
docker run -d -p 8000:8000 \
  -v $(pwd):/app \
  my-app:v1
```

### 🔑 Docker Compose 多容器编排

当你的应用不止一个进程（例如：API + Redis 缓存 + 数据库），Compose 让你用一个 YAML 描述整个系统，一条命令启动全部。

核心概念：

- **service** = 一个容器进程（api / redis / db）
- **network** = service 之间的虚拟网络（默认已创建一个）
- **volume** = service 之间共享的持久化数据

Compose 的一个显著好处是：service 名就是网络 DNS 名。例如 Redis 的 service 叫 `redis`，那 API 容器里直接连 `redis://redis:6379` 就行，不用写 IP。

## 完整跑通方案

下面从零实现一个**"PyTorch 图像分类推理 API + Redis 缓存"** 的完整容器化方案。

### 第一步：先写 Python 服务

```
my-app/
├── serve.py              # FastAPI 推理服务
├── requirements.txt
├── Dockerfile
├── .dockerignore
└── docker-compose.yml
```

**serve.py**：

```python
import io
import json
import hashlib
import redis
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import models, transforms
from fastapi import FastAPI, UploadFile, File

app = FastAPI(title="Image Classification Demo")

# 1. 准备模型（用 torchvision 预训练，演示目的；生产请加载你自己的权重）
device = "cuda" if torch.cuda.is_available() else "cpu"
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2).eval().to(device)

preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

# 2. ImageNet 1000 类标签（生产环境请从文件加载）
# 简单起见这里用占位，实际可从 https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt 下载
LABELS = [f"class_{i}" for i in range(1000)]

# 3. Redis 缓存
cache = redis.Redis(host="redis", port=6379, db=0, decode_responses=True)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    img_bytes = await file.read()

    # --- 命中缓存直接返回 ---
    key = "img:" + hashlib.sha256(img_bytes).hexdigest()[:16]
    cached = cache.get(key)
    if cached:
        return {"source": "cache", "result": json.loads(cached)}

    # --- 推理 ---
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    x = preprocess(img).unsqueeze(0).to(device)
    with torch.no_grad():
        logits = model(x)
        probs = F.softmax(logits, dim=1)[0]
    topk = torch.topk(probs, k=5)
    result = [
        {"label": LABELS[idx.item()], "prob": float(prob)}
        for prob, idx in zip(topk.values, topk.indices)
    ]

    # --- 写缓存，TTL 1 小时 ---
    cache.setex(key, 3600, json.dumps(result))
    return {"source": "inference", "device": device, "result": result}


@app.get("/health")
def health():
    return {"status": "ok", "cuda": torch.cuda.is_available()}
```

**requirements.txt**：

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
pillow==10.4.0
torchvision==0.16.0
redis==5.0.1
```

### 第二步：写 Dockerfile

```dockerfile
# 基于官方 PyTorch 镜像（含 CUDA 11.8、Python、pip）
FROM pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime

# 工作目录
WORKDIR /app

# 安装系统依赖（Redis SDK 是纯 Python，这里示例演示如何装 apt 包）
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 先复制 requirements，利用 Docker layer 缓存
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 再复制应用代码
COPY . .

# 声明端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "serve:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
```

**.dockerignore**：

```
__pycache__/
*.pyc
*.pyo
data/
*.pt
*.pth
*.onnx
venv/
.venv/
.DS_Store
.git/
.ipynb_checkpoints/
```

### 第三步：单容器跑通

```bash
# 构建镜像
cd my-app
docker build -t my-pytorch-app:v1 .

# 查看镜像大小（做得好应在 4~6 GB；pytorch 基础镜像本身较大）
docker images my-pytorch-app:v1

# 启动一个容器做 smoke test（不带 GPU 的情况下跑 CPU 推理）
docker run --rm -p 8000:8000 my-pytorch-app:v1

# 另开一个终端测试
curl http://localhost:8000/health
# → {"status":"ok","cuda":false}

# 上传一张图片做测试（随便找一张 PNG/JPG）
curl -X POST -F "file=@cat.png" http://localhost:8000/predict
```

### 第四步：让容器用 GPU

```bash
# 1. 确认主机装好 nvidia-container-toolkit
nvidia-ctk --version   # 应有输出
docker info | grep -i runtime   # 应看到 nvidia 运行时

# 2. 启动时加 --gpus
docker run --rm --gpus all -p 8000:8000 my-pytorch-app:v1

# 3. 验证 GPU 被看见了
curl http://localhost:8000/health
# → {"status":"ok","cuda":true}
```

### 第五步：用 Docker Compose 同时跑 API + Redis

写 **docker-compose.yml**：

```yaml
services:
  api:
    build: .
    image: my-pytorch-app:v1
    ports:
      - "8000:8000"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all # 分配所有 GPU；也可写数字 1
              capabilities: [gpu]
    depends_on:
      - redis
    # 如果想实现"改代码容器自动生效"，在本地开发时加这一行：
    # volumes:
    #   - ./:/app
    environment:
      - PYTHONDONTWRITEBYTECODE=1

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data # 命名卷持久化 Redis 数据
    command: ["redis-server", "--save", "60", "1", "--loglevel", "warning"]

volumes:
  redis_data:
```

然后：

```bash
# 构建 + 启动（-d 后台，--build 每次都会重新 build api 镜像）
docker compose up --build -d

# 查看两个容器是否都在跑
docker compose ps

# 看 API 日志
docker compose logs -f api

# 看 Redis 日志
docker compose logs -f redis

# 测试推理（应该第一次 source=inference，第二次同一张图 source=cache）
curl -X POST -F "file=@cat.png" http://localhost:8000/predict
# → {"source":"inference","device":"cuda","result":[...]}
curl -X POST -F "file=@cat.png" http://localhost:8000/predict
# → {"source":"cache","result":[...]}

# 停止并清理（保留命名卷，下次启动数据还在）
docker compose down

# 如果你连命名卷也想清（清空所有缓存）
docker compose down -v
```

### 第六步：真实场景下的几个进阶技巧

**1. 用非 root 用户运行**（安全最佳实践）

```dockerfile
# 在 Dockerfile 末尾前加
RUN useradd -m -u 1000 appuser
USER appuser
WORKDIR /app
```

**2. 健康检查**（让 Docker 自动重启挂掉的服务）

```yaml
# 加在 docker-compose.yml 的 api service 下
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 5s
  retries: 3
```

**3. 限制容器资源**（防止内存泄漏撑爆主机）

```yaml
# 加在 api service 下
deploy:
  resources:
    limits:
      cpus: "2"
      memory: 4G
    reservations:
      cpus: "1"
      memory: 1G
```

**4. 镜像推到私有仓库**（公司内部部署）

```bash
docker tag my-pytorch-app:v1 registry.my-company.com/ai/my-pytorch-app:v1
docker push registry.my-company.com/ai/my-pytorch-app:v1

# 在服务器上拉
docker pull registry.my-company.com/ai/my-pytorch-app:v1
docker run --gpus all -p 8000:8000 registry.my-company.com/ai/my-pytorch-app:v1
```

## 常见误区

**误区 1：COPY . . 放在最前面，导致每次改代码都重新 pip install** → 解释：Docker 按顺序检查每个指令的缓存。如果先 COPY 全部文件再 RUN pip，任何代码改动都会让 `pip install` 层缓存失效。正确做法是**先只 COPY requirements.txt，RUN pip，再 COPY 其余**。

**误区 2：把模型权重、数据目录也 COPY 进镜像** → 解释：镜像一旦构建就是只读的，没法改；每次换权重都要 rebuild + repush。正确做法：用 Bind Mount 或 Named Volume 把权重/数据挂载到容器外，镜像只放代码和依赖。

**误区 3：容器里跑 `sudo`、`systemctl`、SSH server** → 解释：容器不是虚拟机，它只是"一组隔离的进程"。容器内不要跑 systemd、不要装 sshd、不要用 sudo；要调试用 `docker exec -it <cid> bash`。

**误区 4：忘了加 `--gpus all`，抱怨 torch.cuda 不可用** → 解释：Docker 默认不暴露 GPU。必须在主机装 `nvidia-container-toolkit`，并在 `docker run` 或 Compose 的 `deploy.resources.reservations.devices` 中声明 GPU 资源。

**误区 5：EXPOSE 以为能自动把端口发布到主机** → 解释：EXPOSE 只是一个"文档声明"，告诉读者这个镜像会监听 8000。真正"发布端口"要靠 `-p 8000:8000` 或 Compose 里的 `ports`。

**误区 6：在容器里写持久化数据到默认路径，然后 `docker rm` 把数据删了** → 解释：写进容器默认文件系统的所有东西，容器删除即丢失。任何要保留的数据，必须用 volume 挂出去。

**误区 7：忽视镜像体积，每个镜像 10+GB** → 解释：大镜像拉取慢、存储贵、回滚慢。优化手段：用 `-slim` 基础镜像、多阶段构建、`--no-cache-dir` 装 pip 包、`apt-get` 后 `rm -rf /var/lib/apt/lists/*`、合理 `.dockerignore`。
