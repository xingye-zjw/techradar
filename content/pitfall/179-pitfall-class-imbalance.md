---
title: 训练数据类别不均衡导致模型偏向多数类
category: machine-learning
summary: "分类任务训练数据中各类别样本量严重失衡（如 1:100），模型倾向于预测多数类而对少数类召回率极低，涵盖 class weight、重采样、Focal Loss、SMOTE 过采样、分层划分等修复方案。"
difficulty: intermediate
excerpt: "分类任务训练数据中各类别样本量严重失衡（如 1:100），模型倾向于预测多数类而对少数类召回率极低，涵盖 class weight、重采样、Focal Loss、SMOTE 过采样、分层划分等修复方案。"
relatedTerms:
  - gradient-descent
  - matrix
  - convex-optimization
  - tensor
relatedTools:
  - scikit-learn
  - numpy
  - pandas
  - matplotlib
relatedNodes:
  - math-linear-algebra
  - llm-inference
prevention: 训练前先统计每个类别的样本分布，绘制直方图观察不均衡程度；对所有分类任务默认使用分层划分（StratifiedSplit）保证每个 fold 的类别比例一致；默认启用 class_weight 或 Focal Loss 作为基线。
consequences: 欺诈检测、故障诊断等少数类关键任务漏检率极高，真实欺诈全被模型判为正常用户；医疗影像中病灶全被判为正常导致漏诊误诊；模型 Accuracy 99% 但少数类 Recall 不到 1%，业务上完全不可用。
detection: 每个分类任务默认输出混淆矩阵和 per-class Recall/Precision/F1，而不是只看总体 Accuracy；绘制 PR 曲线观察少数类的 AP（Average Precision）分数；训练集和测试集的类别分布做卡方检验确保一致性。
tags:
  - 机器学习
  - ML
  - 数据
  - scikit-learn
---

## 为什么你要学它

这是开发中非常容易踩的一个坑：**训练数据类别不均衡导致模型偏向多数类**。

真实世界的数据很少是完美平衡的：欺诈检测中欺诈用户可能只占 0.1%，医疗影像中阳性病灶可能只占 2%，工业缺陷检测中次品可能只占 5%。直接用这样的不均衡数据训练分类模型，模型会学到一个"偷懒策略"：不管输入是什么，统统预测多数类，就能轻松得到 95%+ 的 Accuracy。你看一下模型的总体准确率高达 99%，开心地把它上线了——结果真实业务里所有欺诈、所有病灶、所有缺陷全被模型漏掉了，损失惨重。类别不均衡是所有分类任务默认就要处理的前提条件，而不是遇到问题才想起来的补丁。

如果你正在做欺诈检测、故障诊断、医疗分析、异常检测等天然不均衡的分类任务，或者想系统性了解 class imbalance 的完整解决方案，这篇卡片会帮你从采样、损失、评估、架构四个层次彻底解决问题。

## 一句话概览（快速版）

> **快速修复：class_weight='balanced' + 看 F1/Recall 而不是 Accuracy + SMOTE 过采样少数类**

核心要点：

- **现象**：模型 Accuracy 高达 99%，但混淆矩阵显示少数类几乎全被预测成多数类，per-class Recall 少数类不到 1%
- **根因**：损失函数默认假设每个类别同等重要，多数类的累计 loss 远大于少数类，梯度下降时优化方向被多数类主导，模型为了最小化总体 loss 选择"全部预测多数类"这个局部最优解
- **解决**：按照下方 6 步标准流程从评估指标到采样策略系统处理

## 核心拆解

### 🔑 典型症状

- × 模型 Accuracy 高达 99%，但混淆矩阵显示少数类几乎全被预测成多数类，per-class Recall 少数类不到 1%
- × 训练过程中 loss 下降很快，但验证集的少数类 F1 一直上不去甚至为 0
- × 换不同的模型（LR、XGBoost、SVM）都得到类似的"高准确率但少数类全漏"的结果
- × 测试集某一类完全没被预测到，报告中该类别的 Precision 直接是 0 或者报错 division by zero

### 🔑 根本原因

损失函数默认假设每个类别同等重要，多数类的累计 loss 远大于少数类，梯度下降时优化方向被多数类主导，模型为了最小化总体 loss 选择"全部预测多数类"这个局部最优解。不均衡严重时（1:100 甚至 1:1000），只要模型对多数类预测对一次，抵消了对少数类预测错 100 次的 loss 惩罚，梯度方向就不再倾向于学习少数类的特征。此外，少数类样本量少还会导致其特征空间覆盖不足，决策边界容易过拟合到少数类的噪声点而不是真实模式。最后，如果 train/test 划分时忘了做 stratify，可能出现测试集中少数类样本几乎为 0 的极端情况，评估指标完全失真。

## 完整排查方案

按照以下步骤逐一排查，通常能把少数类 Recall 从 <5% 提升到 60-80% 区间（具体视数据而定）：

1.  **先改评估指标**：丢掉 Accuracy，改用每个类别的 Recall/Precision/F1、混淆矩阵、macro-F1（对所有类别平均）、weighted-F1（按类别样本数加权）、PR 曲线下面积 AP（Average Precision）。从这些指标一眼就能看出少数类有没有真的学到
2.  **class weight 或 Focal Loss 开起来**：分类模型一般都有 class_weight 参数（scikit-learn 设 'balanced'，PyTorch 传入 weight tensor），按类别样本数的反比分配 loss 权重。对于深度学习任务优先用 Focal Loss：`FL = -α(1-p_t)^γ log(p_t)`，难分类的样本（p_t 小）获得更高权重，γ 通常取 2，α 取类别反比
3.  **分层划分数据**：任何 train_test_split 或 KFold 都加 stratify=y 参数（scikit-learn 的 StratifiedKFold / StratifiedShuffleSplit），确保每个 fold 中类别比例与全量数据一致，避免极端情况
4.  **重采样策略**：中度不均衡（1:10 以内）优先对少数类做 SMOTE 或 ADASYN 过采样（用 imbalanced-learn 库），严重不均衡（1:10 以上）结合多数类欠采样（NearMiss / RandomUnderSampler），但欠采样不要丢太多多数类样本
5.  **数据增强补充少数类**：图像任务对少数类样本做旋转/裁剪/颜色抖动；文本任务对少数类样本做同义词替换/回译/EDA 增强；表格任务用 CTGAN 生成合成少数类样本
6.  **两阶段或集成方法**：先对多数类做聚类或难例挖掘（Hard Negative Mining），只保留与少数类边界接近的多数类样本再训练；或者用 EasyEnsemble/BalancedBaggingClassifier 集成多个平衡子集上训练的基分类器

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> 用下面的脚本快速加上 class weight + Focal Loss + SMOTE 三板斧，立竿见影

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
import torch
import torch.nn as nn

# 1. 先看数据分布
class_counts = pd.Series(y).value_counts().sort_values()
print("类别分布：")
print(class_counts)
print(f"不均衡比例 = {class_counts.max() / class_counts.min():.1f} : 1")

# 2. 分层划分（关键！）
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# 3. scikit-learn：SMOTE 过采样 + class_weight balanced
pipeline = ImbPipeline(steps=[
    ("smote", SMOTE(sampling_strategy="auto", k_neighbors=5, random_state=42)),
    ("clf", GradientBoostingClassifier(
        n_estimators=300,
        random_state=42,
    )),
])
pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)
print(classification_report(y_test, y_pred))

# 4. PyTorch：Focal Loss 实现
class FocalLoss(nn.Module):
    def __init__(self, alpha=None, gamma=2.0):
        super().__init__()
        self.alpha = alpha  # shape: [num_classes]
        self.gamma = gamma

    def forward(self, logits, targets):
        ce_loss = nn.functional.cross_entropy(logits, targets, weight=self.alpha, reduction="none")
        pt = torch.exp(-ce_loss)
        focal_loss = ((1 - pt) ** self.gamma) * ce_loss
        return focal_loss.mean()

# 计算 alpha：类别样本数反比
alpha = 1.0 / (np.bincount(y_train).astype(np.float32) + 1e-6)
alpha = alpha / alpha.sum() * len(np.unique(y_train))
criterion = FocalLoss(alpha=torch.tensor(alpha, dtype=torch.float32), gamma=2.0)
```

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- 任何分类项目的 EDA 第一步：绘制类别分布直方图，不均衡比例超过 1:4 就标记为"不均衡任务"，默认启用 class weight 和 stratify 划分
- 项目评估报告中强制展示：每个类别的 Recall/Precision/F1、混淆矩阵热力图、macro-F1、少数类 AP，这几项缺任何一项都不允许通过评审
- 建立"困难样本池"：把模型预测错的少数类样本单独保存，下一轮训练时加倍采样或用于 Hard Negative Mining
- 对于极端不均衡（<1%）的任务，考虑重构为异常检测/离群点检测问题：用 Isolation Forest、OneClass SVM、AutoEncoder 等方法，而不是传统分类
- 主动学习策略：上线后重点标注模型置信度在 0.3-0.7 之间的样本（尤其是少数类预测错的），优先加入训练集补充边界信息

## 常见误区

1. **只看 Accuracy 就觉得模型很好** — 99% 的 Accuracy 在不均衡任务中可能等于"全预测多数类"，业务上完全没用
2. **SMOTE 对全量数据用，然后再划分训练集测试集** — 这会把测试集的信息泄露到过采样里，虚高指标，务必只在训练集内部做 SMOTE
3. **极端不均衡时硬上分类模型，不考虑异常检测范式** — 少数类 <0.5% 时，异常检测通常比分类效果好得多，不要硬套分类框架

## 推荐学习顺序

1. 先看「典型症状」确认你的模型是不是被类别不均衡坑了
2. 再看「快速修复」用 class weight + Focal Loss + SMOTE 三板斧快速改善少数类 Recall
3. 如果还是不够，按照「完整排查方案」的 6 步从评估指标到集成方法系统优化
4. 最后一定要看「预防措施」，把 stratify 划分、per-class 报告、困难样本池固化到项目流程中
