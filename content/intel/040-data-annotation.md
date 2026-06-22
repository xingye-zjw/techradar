---
title: 数据标注与主动学习
category: data-engineering
keywords:
  - data annotation
  - active learning
  - label studio
  - annotation quality
  - inter-annotator agreement
difficulty: intermediate
duration: 1周
summary: 标注数据是 AI 项目的最大成本——主动学习让模型告诉你「哪些数据最值得标注」
takeaways:
  - 理解数据标注的质量控制方法（一致性检查 / 黄金标准）
  - 能用 Label Studio 搭建标注平台
  - 理解主动学习的核心思想：不确定性采样
  - 能设计一个标注-训练-主动学习的闭环 Pipeline
---

## 为什么你要学它

标注数据是 AI 项目最大的成本：
- 人工标注：每条数据 0.1-1 元，10 万条数据 = 1-10 万元
- 标注质量：标注错误会导致模型无法收敛
- 标注效率：盲目标注大量数据，很多可能对模型提升有限

**主动学习（Active Learning）** 的核心思想：让模型告诉你「哪些数据最值得标注」——优先标注模型最不确定的样本，用更少的标注数据达到更好的模型效果。

## 一句话概览

- **不确定性采样**：选择模型预测概率最接近 0.5 的样本（最不确定）
- **多样性采样**：选择能覆盖数据分布不同区域的样本
- **标注质量控制**：多人标注 + 一致性检查 + 黄金标准验证
- **Label Studio**：开源标注平台，支持多种任务类型

## 核心拆解

### 🔑 主动学习策略

**不确定性采样**：
```python
def uncertainty_sampling(model, unlabeled_data, n_samples):
    uncertainties = []
    for sample in unlabeled_data:
        # 模型预测概率
        probs = model.predict_proba(sample)
        
        # 计算不确定性（熵或最接近 0.5 的概率）
        entropy = -sum(p * log(p) for p in probs)
        uncertainties.append(entropy)
    
    # 选择不确定性最高的样本
    top_indices = np.argsort(uncertainties)[-n_samples:]
    return [unlabeled_data[i] for i in top_indices]
```

**多样性采样**：
```python
def diversity_sampling(unlabeled_data, labeled_data, n_samples):
    # 用聚类确保选择的样本覆盖不同区域
    from sklearn.cluster import KMeans
    
    # 对未标注数据聚类
    embeddings = get_embeddings(unlabeled_data)
    kmeans = KMeans(n_clusters=n_samples)
    kmeans.fit(embeddings)
    
    # 从每个聚类中选择一个样本
    selected = []
    for i in range(n_samples):
        cluster_indices = np.where(kmeans.labels_ == i)[0]
        selected.append(unlabeled_data[cluster_indices[0]])
    
    return selected
```

### 🔑 标注质量控制

**多人标注 + 一致性检查**：
```python
def check_agreement(annotations):
    # 计算 Inter-Annotator Agreement（IAA）
    from sklearn.metrics import cohen_kappa_score
    
    annotator_a = annotations['annotator_1']
    annotator_b = annotations['annotator_2']
    
    kappa = cohen_kappa_score(annotator_a, annotator_b)
    
    # kappa > 0.6 表示一致性较好
    if kappa < 0.6:
        print(f"警告：标注一致性较低（kappa={kappa}），需要重新审核")
    
    return kappa
```

**黄金标准验证**：
```python
def validate_with_golden_standard(annotations, golden_set):
    correct = 0
    for sample_id, label in annotations.items():
        if sample_id in golden_set:
            if label == golden_set[sample_id]:
                correct += 1
    
    accuracy = correct / len(golden_set)
    
    # 标注者准确率应 > 90%
    if accuracy < 0.9:
        print(f"警告：标注者准确率较低（{accuracy}），需要培训或更换")
    
    return accuracy
```

### 🔑 Label Studio 集成

```python
from label_studio_sdk import Client

ls = Client(url='http://localhost:8080', api_key='your-api-key')

# 创建项目
project = ls.create_project(
    title='Text Classification',
    label_config='<View><Text name="text"/><Choices name="choice" toName="text"><Choice value="positive"/><Choice value="negative"/></Choices></View>'
)

# 上传未标注数据
tasks = [{'data': {'text': sample}} for sample in unlabeled_data]
project.import_tasks(tasks)

# 导出标注结果
annotations = project.export_labels(format='JSON')
```

### 🔑 主动学习闭环

```python
def active_learning_loop(model, unlabeled_data, labeled_data, n_iterations=10):
    for iteration in range(n_iterations):
        # 1. 训练模型
        model.train(labeled_data)
        
        # 2. 选择最值得标注的样本
        samples_to_label = uncertainty_sampling(model, unlabeled_data, n_samples=100)
        
        # 3. 人工标注
        new_labels = annotate_samples(samples_to_label)
        
        # 4. 更新数据集
        labeled_data.extend(new_labels)
        unlabeled_data = [s for s in unlabeled_data if s not in samples_to_label]
        
        # 5. 评估模型
        accuracy = evaluate(model, test_set)
        print(f"Iteration {iteration}: accuracy={accuracy}, labeled={len(labeled_data)}")
        
        if accuracy > target_accuracy:
            break
    
    return model
```

## 实战指南

### 用 Label Studio + MLflow 搭建标注-训练闭环

```python
# 1. 从 Label Studio 导出标注
annotations = export_from_label_studio()

# 2. 训练模型
model = train_model(annotations)

# 3. 用 MLflow 记录
with mlflow.start_run():
    mlflow.log_param("labeled_samples", len(annotations))
    mlflow.log_metric("accuracy", accuracy)
    mlflow.sklearn.log_model(model, "model")

# 4. 主动学习选择下一批样本
next_batch = uncertainty_sampling(model, unlabeled_data, 100)

# 5. 上传到 Label Studio
upload_to_label_studio(next_batch)
```

## 相关资源

- [Label Studio GitHub](https://github.com/HumanSignal/label-studio)
- [Active Learning 教程](https://modal-active-learning.readthedocs.io/)
- [Cohen's Kappa 解释](https://en.wikipedia.org/wiki/Cohen%27s_kappa)