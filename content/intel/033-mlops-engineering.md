---
title: MLOps：从实验到生产的完整工程化
category: data-engineering
keywords:
  - mlops
  - experiment tracking
  - model registry
  - feature store
  - continuous training
difficulty: intermediate
duration: 1-2周
summary: 训练只是 MLOps 的 10%——那 90% 是版本管理、监控、自动重训练、模型部署的完整工程化体系
takeaways:
  - 理解 MLOps 的完整生命周期：数据 → 特征工程 → 训练 → 评估 → 部署
  - 能用 MLflow 或 WandB 管理实验和模型版本
  - 理解 Feature Store 的设计理念和实践
  - 能设计一个支持 CI/CD 的自动化训练 Pipeline
---

## 为什么你要学它

很多 AI 项目死于「实验成功，生产失败」：
- 训练代码和推理代码不一致
- 模型更新后不知道用哪个版本
- 数据漂移后模型效果下降但没人发现
- 重新训练后特征工程变了，历史特征和新特征不一致

**MLOps** 是把 ML 系统当作软件系统来管理的工程化方法，它解决的是「如何让模型在生产环境中持续可靠地工作」。

## 一句话概览

MLOps = DevOps + ML，核心是：
- **实验追踪**：每次训练记录超参、指标、代码版本
- **模型注册**：统一管理模型版本，支持 A/B 测试和回滚
- **特征存储**：训练和推理共用特征，保证一致性
- **持续训练**：数据/代码变化时自动触发重训练

## 核心拆解

### 🔑 实验追踪（Experiment Tracking）

训练一次生成的数据：
- 超参数（lr, batch_size, model_size...）
- 指标（train_loss, val_acc, P99...）
- 工件（模型权重、日志、图表）
- 代码快照（git commit hash）

```python
import mlflow

mlflow.set_experiment("resnet-cifar10")

with mlflow.start_run(run_name="lr=0.1_batch=128"):
    mlflow.log_param("learning_rate", 0.1)
    mlflow.log_param("batch_size", 128)
    
    for epoch in range(epochs):
        train_loss = train()
        val_acc = evaluate()
        mlflow.log_metrics({
            "train_loss": train_loss,
            "val_acc": val_acc
        }, step=epoch)
    
    mlflow.pytorch.log_model(model, "model")
```

### 🔑 模型注册（Model Registry）

模型注册表管理模型的完整生命周期：

```
RegisteredModel: resnet-cifar10
├── Version 1 (stage: Production)
│   └── source: run_id=abc123, metrics: val_acc=0.92
├── Version 2 (stage: Staging)
│   └── source: run_id=def456, metrics: val_acc=0.93
└── Version 3 (stage: None)
    └── source: run_id=ghi789, metrics: val_acc=0.91
```

支持的操作：
- 阶段流转：None → Staging → Production → Archived
- A/B 测试：流量分配到不同版本
- 回滚：Production 出问题时一键回滚到上一版本

### 🔑 特征存储（Feature Store）

训练和推理的特征不一致是生产环境最常见的问题之一。

Feature Store 的核心设计：
- **离线特征存储**（Hive / S3）：用于模型训练，高吞吐量批处理
- **在线特征存储**（Redis / DynamoDB）：用于实时推理，低延迟点查询
- **特征注册表**：统一定义特征的名称、类型、描述、血缘

```
Feature: user_age
├── type: int
├── description: 用户年龄
├── offline_store: user_features_table.user_age
├── online_store: users:{user_id}.age
└── consumed_by: [recommendation_model, churn_model]
```

训练时从离线存储读取特征，推理时从在线存储读取，保证特征定义一致。

### 🔑 持续训练（Continuous Training）

触发重训练的条件：
1. **数据驱动**：新数据积累到一定量时
2. **模型驱动**：模型效果下降（数据漂移检测）
3. **代码驱动**：代码变更时（GitHub Actions 触发）

```yaml
# GitHub Actions 示例
on:
  push:
    branches: [main]
    paths: ['features/**', 'train/**']

jobs:
  retrain:
    runs-on: gpu-runner
    steps:
      - uses: actions/checkout@v3
      - name: Run training
        run: python train.py
      - name: Evaluate
        run: python evaluate.py
      - name: Register model
        run: mlflow models promote -m models:/resnet/latest
```

## 实战指南

### 用 MLflow 做端到端追踪

```python
# train.py
import mlflow
from mlflow.tracking import MlflowClient

client = MlflowClient()

with mlflow.start_run(run_name="production_run") as run:
    # 训练
    model = train_model()
    
    # 评估
    metrics = evaluate(model)
    
    # 注册模型
    model_uri = mlflow.pytorch.log_model(model, "model")
    client.create_model_version(
        name="resnet-cifar10",
        source=model_uri,
        run_id=run.info.run_id
    )
    
    # 自动转 Production（如果指标达标）
    if metrics["val_acc"] > 0.93:
        client.transition_model_version_stage(
            name="resnet-cifar10",
            version=latest_version,
            stage="Production"
        )
```

## 相关资源

- [MLflow 官方文档](https://mlflow.org/docs/latest/index.html)
- [Feast Feature Store](https://feast.dev/)
- [MLOps Principles (Google)](https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines)
- [wandb 文档](https://docs.wandb.ai/)
