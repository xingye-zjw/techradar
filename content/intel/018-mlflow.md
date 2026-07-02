---
title: MLflow 实验追踪平台
category: devops
difficulty: intermediate
duration: 1周
summary: 一次把参数、metrics、模型都录下来，以后回头看"这次到底改了什么为什么这么好"不再抓瞎
takeaways:
  - 能用 mlflow.start_run / log_param / log_metric / log_artifact 做基础追踪
  - 会用 mlflow.pytorch.autolog 配合 PyTorch Lightning 一键记录
  - 会启动本地 Tracking Server 并用 Web UI 对比多组超参
  - 理解 Model Registry 基本用法，能注册、生产化一个模型版本
relatedTools:
  - pytorch
  - mlflow
relatedIntel:
  - 007-docker
  - 008-git
  - 009-linux
relatedNodes: electrical-safety
tags:
  - mlflow
  - experiment tracking
  - pytorch
  - autolog
  - model registry
  - hyperparameter
---

## 为什么你要学它

做深度学习的人都会有这个痛点：笔记本里一堆 `train_v1.py / train_v2.py / train_v2_best_lr.py`，每个脚本里又藏着不同的 batch_size、lr、epochs。一周后你根本不知道："上次那个 mAP 最高的版本到底用了哪个 lr？是在哪个 dataset 上跑的？"

MLflow 就是解决这个问题的"实验记账本"。每次实验都把「参数 + 指标 + 模型文件 + 代码版本」打到同一个 tracking server 里，你随时可以在 Web 界面里按指标排序、画线对比、选中最好的那个 run 去做模型注册/部署。不用它你也能跑，但团队协作和长期可追溯性会极差。

## 一句话概览（快速版）

- **Tracking**：记录 params / metrics / artifacts，用 `mlflow.start_run()` 包装你的训练循环。
- **Autolog**：`mlflow.pytorch.autolog()` 配合 Light/PL/YOLO，自动捕获常见参数与指标。
- **Web UI**：启动 `mlflow ui` 或 `mlflow server`，就能在浏览器里对比多个实验、画线、下载模型。
- **Model Registry**：把实验里产出的"模型产物"注册成带版本号的正式模型，再按 Staging / Production 推进。

## 核心拆解

### 🔑 基础记录三要素：params、metrics、artifacts

一个 run 里有三件事：

- `mlflow.log_param("lr", 1e-3)`：记录一个超参数（字符串/数字）。
- `mlflow.log_metric("val_acc", 0.95, step=epoch)`：记录一个数值指标，可带 step 画曲线。
- `mlflow.log_artifact("model.pt")`：记录任意文件（模型、图片、配置、日志）。

用 `with mlflow.start_run(run_name="..."):` 做上下文管理：进入后记录，退出自动收尾，中间报错也能把已记录的内容保存下来。

### 🔑 autolog：最少代码、最大覆盖

`mlflow.pytorch.autolog()` 等自动钩子会在你调用 PyTorch Lightning 或部分框架的 `trainer.fit()` 时，把 optimizer 的 lr、每一步 loss、参数更新、模型权重签名等信息一次性打进去，你甚至不需要自己写 log_metric。

它的便利之处在于：即便你用的是别人写的训练循环（比如 Ultralytics 的 YOLO），只要底层走的是 PyTorch/TensorBoard，autolog 就能接收到不少东西，省下大把粘贴代码。

### 🔑 Tracking Server 的两种玩法

- **本地单机**：什么都不配，mlflow 默认写到当前目录的 `./mlruns/`，然后 `mlflow ui --port 5000` 打开。
- **团队共享**：启动 `mlflow server --backend-store-uri postgresql://... --default-artifact-root s3://...`，让所有训练脚本通过 `mlflow.set_tracking_uri("http://server:5000")` 打到同一台机器上。

后端存储（backend store）存元数据（run 列表、参数名、metrics 名），artifact root 存二进制产物（模型文件、图片）。把这两件事分清楚，你就能在团队里稳定运行 MLflow。

### 🔑 实验（experiment）和 run 的关系

一个 experiment 对应一个主题（比如"MNIST classification"），下面有很多 run（每次训练一次）。用 `mlflow.set_experiment("mnist-classification")` 先声明，后续 `start_run()` 就会落到这个实验下，方便 UI 里分组筛选。

### 🔑 Model Registry：让"最好的那个模型"有名字

跑了 100 个 run，有一个 mAP 最高。用 `mlflow.register_model(model_uri, name)` 把它注册成一个正式模型。每次再注册同一个 name 就会变成版本 2、版本 3。还可以在 UI 里把版本标成 `Staging` → `Production` → `Archived`，配合 CI/CD 把"从实验到上线"的流程串起来。

## 完整跑通方案

### 第一步：安装 + 启动本地 UI

```bash
pip install mlflow torch torchvision scikit-learn

# 训练脚本执行完会在工作目录生成 ./mlruns/
# 启动 UI 查看结果
mlflow ui --port 5000
# 浏览器打开 http://localhost:5000
```

### 第二步：最小 PyTorch 训练 + 手动记录

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import mlflow
import mlflow.pytorch

mlflow.set_experiment("mnist-classification")

transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.13,), (0.31,))])
train_ds = datasets.MNIST("./data", train=True,  transform=transform, download=True)
val_ds   = datasets.MNIST("./data", train=False, transform=transform)
train_loader = DataLoader(train_ds, batch_size=128, shuffle=True)
val_loader   = DataLoader(val_ds,   batch_size=256, shuffle=False)


class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Flatten(),
            nn.Linear(28 * 28, 256), nn.ReLU(),
            nn.Linear(256, 128), nn.ReLU(),
            nn.Linear(128, 10),
        )

    def forward(self, x):
        return self.net(x)


def train_one_run(lr: float, batch_size: int, epochs: int):
    with mlflow.start_run(run_name=f"lr={lr}_bs={batch_size}"):
        mlflow.log_params({"lr": lr, "batch_size": batch_size, "epochs": epochs, "optimizer": "Adam"})

        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = Net().to(device)
        opt = torch.optim.Adam(model.parameters(), lr=lr)
        loss_fn = nn.CrossEntropyLoss()

        for epoch in range(epochs):
            model.train()
            train_loss = 0.0
            for x, y in train_loader:
                x, y = x.to(device), y.to(device)
                opt.zero_grad()
                loss = loss_fn(model(x), y)
                loss.backward()
                opt.step()
                train_loss += loss.item() * x.size(0)

            model.eval()
            correct = total = 0
            with torch.no_grad():
                for x, y in val_loader:
                    x, y = x.to(device), y.to(device)
                    correct += (model(x).argmax(1) == y).sum().item()
                    total += y.size(0)
            val_acc = correct / total

            mlflow.log_metrics(
                {"train_loss": train_loss / total, "val_acc": val_acc},
                step=epoch,
            )
            print(f"epoch {epoch:02d}  loss={train_loss / total:.4f}  val_acc={val_acc:.4f}")

        sample_x = torch.randn(1, 1, 28, 28, device=device)
        mlflow.pytorch.log_model(model, artifact_path="model", input_example=sample_x.cpu())


# 多组超参对比
for lr in [1e-3, 3e-4]:
    for bs in [128, 256]:
        train_one_run(lr=lr, batch_size=bs, epochs=3)

print("All runs logged. Open http://localhost:5000 to compare.")
```

### 第三步：autolog 版（更省心）

```python
import mlflow
import mlflow.pytorch
from lightning.pytorch import Trainer    # pip install lightning
# from my_lightning_module import LitModel  # 需要你自己写一个 LightningModule

mlflow.set_experiment("mnist-pl")
mlflow.pytorch.autolog(log_models=True)

with mlflow.start_run(run_name="pl-autolog"):
    mlflow.log_param("arch", "mlp-small")
    model = LitModel(lr=1e-3)
    trainer = Trainer(max_epochs=3, accelerator="auto")
    trainer.fit(model)
    # autolog 会自动记录 loss、lr、epoch 指标、模型结构等
```

### 第四步：用 MlflowClient 程序化筛选"最佳实验"

```python
from mlflow.tracking import MlflowClient

client = MlflowClient()
exp = client.get_experiment_by_name("mnist-classification")

runs = client.search_runs(
    experiment_ids=[exp.experiment_id],
    order_by=["metrics.val_acc DESC"],
    max_results=5,
)

for r in runs:
    print(f"run_id={r.info.run_id}  "
          f"lr={r.data.params.get('lr')}  "
          f"val_acc={r.data.metrics.get('val_acc', -1):.4f}")

# 把最好的一个 run 里的模型注册成正式模型
best_run = runs[0]
model_uri = f"runs:/{best_run.info.run_id}/model"
mv = mlflow.register_model(model_uri, "MNISTClassifier")
print(f"Registered model {mv.name} v{mv.version}")

# 把这个版本推进到 Production
client.transition_model_version_stage(
    name="MNISTClassifier", version=mv.version, stage="Production",
)
```

### 第五步：生产端用 MLflow 加载已注册的模型做推理

```python
import mlflow.pyfunc

# 用 name/stage 加载，生产环境里替换成最新 Production 版本就能自动升级
model = mlflow.pyfunc.load_model("models:/MNISTClassifier/Production")

# 准备输入：shape [N, 1, 28, 28]
import numpy as np
dummy = np.random.rand(2, 1, 28, 28).astype(np.float32)
logits = model.predict(dummy)
print("predicted digits:", np.asarray(logits).argmax(axis=1))
```

## 常见误区

**误区 1：没有把 tracking uri 指对，结果实验散落在各个 `./mlruns/` 里。**
解释：团队环境下务必统一 `mlflow.set_tracking_uri("http://server:5000")` 或用环境变量 `MLFLOW_TRACKING_URI`。否则训练脚本在不同机器运行会把记录写去不同地方。

**误区 2：只记录了最终 val_acc，没记录 epoch 级曲线。**
解释：`log_metric(..., step=epoch)` 能让你看到训练是否在收敛、是否过拟合。只有一个最终数字是无法复盘"为什么这次比上次好"的。

**误区 3：把大文件（多 GB 的 checkpoint）当 artifact 直接上传。**
解释：artifact 存储会被反复读取，建议每个 run 只保留 best 或 last 权重；其余用其它方式归档，或打开 `log_every_n_steps`/定时清理。

**误区 4：autolog 能搞定一切，所以不写任何手动 log_param。**
解释：autolog 只知道"通用参数"，不知道你业务相关的参数（数据版本、增强策略、是否冻结 backbone 等）。关键信息一定要手动 `log_param` 或 `log_artifact(config.yaml)`，让每个 run 可追溯。

**误区 5：注册了一堆模型版本，却从来不去管理 Stage。**
解释：注册完后在 UI 里把版本从 None → Staging → Production 推进，下游推理服务按 stage 拉模型，才能真正形成"实验→上线"的闭环。不然注册就只是一堆历史备份。
