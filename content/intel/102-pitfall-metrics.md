---
title: 模型评估指标踩坑合集
category: machine-learning
difficulty: intermediate
duration: 30分钟
summary: 涵盖 4 个常见踩坑：用准确率评估类别不平衡数据、只看 AUC 不看 PRC 导致误判、回归任务用 MSE 评估被异常值主导、在测试集上调参导致过拟合测试集，每个均附快速修复与排查步骤。
takeaways: "- 掌握「模型评估指标踩坑合集」中各问题的快速识别方法 - 理解每个踩坑的根因分析和排查步骤 - 学会标准化的修复流程和预防措施"
relatedIntel: "- 017-metrics - 039-model-evaluation"
tags:
  - 机器学习
  - ML
  - 数据
  - scikit-learn
relatedTerms:
  - matrix
  - tensor
  - gradient-descent
  - convex-optimization
relatedTools:
  - numpy
  - pandas
  - scikit-learn
relatedNodes:
  - math-linear-algebra
  - llm-inference
---

[模型评估]

## 用准确率评估类别不平衡数据

// 快速修复

使用 F1/Macro-F1/AUC 替代准确率作为主要评估指标

// 现象表现

- × 准确率达到 95% 但少数类召回率为 0
- × 模型将所有样本预测为多数类仍获得高准确率
- × 验证集准确率高但实际应用效果极差

// 排查步骤

- 01 检查数据集的类别分布，统计各类的样本数量和比例
- 02 使用 sklearn 的 confusion_matrix 查看各类别的预测分布
- 03 运行 classification_report 获取各类别的 Precision/Recall/F1
- 04 计算 Macro-F1 和加权 F1，与整体准确率对比分析
- 05 对极度不平衡场景，考虑使用 SMOTE 过采样或调整类别权重

#模型评估#数据质量#指标

---

[模型评估]

## 只看 AUC 不看 PRC 导致误判

// 快速修复

同时查看 AUC 和 Precision-Recall 曲线，优先使用 Average Precision

// 现象表现

- × 数据不平衡时 AUC 虚高，实际分类器效果很差
- × PRC 曲线显示 precision 极低，但 AUC 仍接近 0.9
- × 正负样本比例悬殊时 AUC 失去参考价值

// 排查步骤

- 01 使用 sklearn.metrics.precision_recall_curve 绘制 PRC 曲线
- 02 计算 Average Precision (AP) 作为不平衡数据的首选指标
- 03 对比 ROC-AUC 和 PR-AUC，两者差异过大时以 PR-AUC 为准
- 04 检查正负样本比例，比例超过 1:10 时务必参考 PRC

#模型评估#指标#二分类

---

[模型评估]

## 回归任务用 MSE 评估被异常值主导

// 快速修复

使用 MAE 或 Huber Loss 作为主要评估指标

// 现象表现

- × MSE 很高但大多数样本预测准确，少数异常点拉高整体指标
- × 模型在正常样本上表现优异，却被几个极端 outlier 拖累整体评估
- × MSE 下降缓慢但肉眼观察预测效果已很好

// 排查步骤

- 01 使用 matplotlib 或 seaborn 可视化预测误差分布，检查是否存在长尾
- 02 计算 MAE/MAPE 并与 MSE 对比，差异过大说明存在异常值
- 03 使用 scipy.stats.zscore 或 IQR 方法检测异常点
- 04 考虑使用 Huber Loss 对异常值更鲁棒的评估方式
- 05 评估前可先进行数据清洗或使用分位数回归分析

#模型评估#回归#指标

---

[模型评估]

## 在测试集上调参导致过拟合测试集

// 快速修复

只用验证集调参，测试集留到最后一次性评估

// 现象表现

- × 测试集指标远高于验证集指标，泛化能力严重高估
- × 反复在测试集上调整超参数后，线上效果大幅下降
- × 提交前测试集得分很高，上线后实际指标断崖式下跌

// 排查步骤

- 01 严格划分训练集、验证集和测试集，比例建议 8:1:1
- 02 所有调参操作只能在验证集上进行，禁止使用测试集
- 03 测试集仅在最终阶段使用一次，结果作为最终性能报告
- 04 使用交叉验证替代单次验证集划分，提高可靠性
- 05 若需要多次评估测试集，考虑使用嵌套交叉验证

#模型评估#过拟合#数据划分

## 修复后附加：最小一键诊断命令

```bash
# ML 最小自检：二分类 AUC + 混淆矩阵 3 秒内
python - <<'PY'
import numpy as np
from sklearn.datasets import make_classification
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import roc_auc_score, confusion_matrix
X, y = make_classification(n_samples=2000, n_features=20, random_state=42)
m = GradientBoostingClassifier(n_estimators=40).fit(X[:1600], y[:1600])
p = m.predict_proba(X[1600:])[:, 1]
print('AUC', round(roc_auc_score(y[1600:], p), 3))
print('CM\n', confusion_matrix(y[1600:], (p > 0.5).astype(int)))
PY
```
