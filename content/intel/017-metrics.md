---
title: 模型评估指标详解
category: evaluation
keywords:
  - map
  - iou
  - f1 score
  - precision
  - recall
  - auc
  - bleu
  - perplexity
difficulty: intermediate
duration: 1周
summary: 分类 / 检测 / 生成任务该用什么指标打分，才能不被一个看起来漂亮的数字骗到
takeaways:
  - 会选分类任务中合适的指标：Accuracy / Precision / Recall / F1 / AUC-ROC
  - 会解释 IoU 和 mAP@0.5 / mAP@0.5:0.95 的区别，并手写 IoU 代码
  - 会用 sklearn 计算混淆矩阵、P/R/F1、AUC-ROC
  - 知道 BLEU / ROUGE / Perplexity 的直觉，并能在生成任务里算一遍
---

## 为什么你要学它

你训练完一个模型，只报告「准确率 98%」其实非常危险——在样本极不均衡的数据集（比如 99% 都是负例），一个什么都预测"负"的模型就能拿到 99% 的准确率，却毫无用处。

又或者你做目标检测，只说「这个模型 mAP 很高」，但不看它在小物体上的表现，结果在真实场景里小目标漏检严重。生成模型更是如此，Perplexity 低不等于人读起来通顺。

理解评估指标就是学会"用正确的尺子量模型"：不同任务、不同数据分布、不同业务目标要用不同的尺子。否则你和别人沟通"我的模型好"的时候，其实只是在自说自话。

## 一句话概览（快速版）

- 分类：Accuracy 看整体、Precision/Recall/F1 处理不均衡与业务成本；AUC-ROC 综合不同阈值下的表现。
- 检测：IoU 衡量框准不准、AP/mAP@0.5 衡量"在某个 IoU 阈值下识别得好不好"；mAP@0.5:0.95 则更严格。
- 生成：Perplexity 衡量语言模型概率分布；BLEU/ROUGE 衡量翻译/摘要和参考答案的重叠度。

## 核心拆解

### 🔑 混淆矩阵、Precision、Recall、F1

四类结果（以二分类为例）：

- TP：预测为正，真实也是正
- FP：预测为正，实际是负（误报）
- FN：预测为负，实际是正（漏报）
- TN：预测为负，实际也是负

```
Precision = TP / (TP + FP)   # 预测正例里真的有多靠谱
Recall    = TP / (TP + FN)   # 真实正例里被我捞回多少
F1        = 2 · P · R / (P + R)  # 两者的调和平均
```

为什么选 P/R 而不是 Accuracy？业务上很多时候"误报 vs 漏报成本完全不同"：金融风控里漏报一个欺诈（FN）代价远高于误报（FP），这时应该更看重 Recall；垃圾邮件过滤器里误报一封正经邮件（FP）代价很高，这时要更看重 Precision。F1 是一个兼顾两者的折中指标。

### 🔑 ROC 曲线 & AUC-ROC

ROC 是在不同分类阈值下画出来的 `FPR（假阳性率）对 TPR（真阳性率）`曲线，AUC-ROC 是它下面的面积。AUC=1 是完美分类器，AUC=0.5 等于随机猜。

AUC-ROC 的好处是"对阈值不敏感 + 对不均衡不那么容易被忽悠"，经常被用于选模型、调参时的主指标。

### 🔑 IoU 与 mAP（目标检测）

IoU（交并比）衡量预测框和真实框重叠程度：

```
IoU = area(intersection) / area(union)
```

AP（Average Precision）是"在某个 IoU 阈值下"，把所有检测框按置信度排序，得到一条 PR 曲线下的面积。

- `mAP@0.5`：IoU 阈值 0.5，放得比较宽，很多框架把它当作"入门及格线"。
- `mAP@0.5:0.95`：对 IoU 阈值从 0.5 到 0.95，每 0.05 一个，然后平均——这是 COCO 官方的主指标，对框准不准要求更严格。

> 直觉：mAP@0.5 像"只要大概对就算过"，mAP@0.5:0.95 像"不仅要检测到，还必须框得精准"。

### 🔑 像素级分割：Dice / IoU / PA

- PA（Pixel Accuracy）= 预测正确的像素 / 总像素。
- mIoU = 每个类别算一次 `IoU = TP / (TP + FP + FN)`，再取平均。
- Dice Coefficient = `2TP / (2TP + FP + FN)`，和 IoU 高度相关但对小目标更平滑一些。

### 🔑 生成任务：Perplexity / BLEU / ROUGE

- **Perplexity**：语言模型在测试集上的 `2^(-avg log2 P)`，直觉是"模型平均每次要在多少个词里猜一个"。越低越好，但只和概率分布有关，和"生成内容是否对人友好"不是一回事。
- **BLEU**：看生成句子和多条参考译文的 n-gram 重叠，常用于机器翻译。
- **ROUGE**：看召回率（有多少 reference 的 n-gram 被覆盖），常用于摘要任务。

这些指标都有"跟人类打分不完全一致"的问题，生产里通常要配合人工抽查。

## 完整跑通方案

### 第一步：分类任务的 sklearn 示例

```python
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_curve, auc, roc_auc_score,
)
import numpy as np

# 构造一个不均衡数据集：负例多、正例少
rng = np.random.default_rng(0)
y_true = np.array([1]*100 + [0]*900)            # 10% 正例
y_prob = np.concatenate([rng.beta(7, 3, 100),    # 正例预测偏高
                         rng.beta(2, 7, 900)])   # 负例预测偏低
y_pred = (y_prob >= 0.5).astype(int)

print("Accuracy :", accuracy_score(y_true, y_pred))
print("Precision:", precision_score(y_true, y_pred))
print("Recall   :", recall_score(y_true, y_pred))
print("F1       :", f1_score(y_true, y_pred))
print("AUC-ROC  :", roc_auc_score(y_true, y_prob))

print("\nConfusion Matrix:")
print(confusion_matrix(y_true, y_pred))

# 画 PR 曲线的数值（阈值下的 P/R 表）
fpr, tpr, thresholds = roc_curve(y_true, y_prob)
print("\nAUC from curve:", auc(fpr, tpr))
```

### 第二步：手写一个 IoU 并做一个小的检测实验

```python
def iou(box_a, box_b):
    # box = (x1, y1, x2, y2)
    x1 = max(box_a[0], box_b[0])
    y1 = max(box_a[1], box_b[1])
    x2 = min(box_a[2], box_b[2])
    y2 = min(box_a[3], box_b[3])
    inter = max(0, x2 - x1) * max(0, y2 - y1)
    area_a = (box_a[2] - box_a[0]) * (box_a[3] - box_a[1])
    area_b = (box_b[2] - box_b[0]) * (box_b[3] - box_b[1])
    union = area_a + area_b - inter
    return inter / union if union > 0 else 0


# 同一张图里：真实框 vs 预测框（带置信度）
gt = [{"id": 0, "bbox": [10, 10, 50, 50]},
      {"id": 1, "bbox": [80, 80, 120, 120]}]
preds = [
    {"bbox": [12, 12, 48, 48], "score": 0.9},
    {"bbox": [8, 8, 60, 60],  "score": 0.7},
    {"bbox": [82, 82, 125, 125], "score": 0.6},
    {"bbox": [200, 200, 220, 220], "score": 0.3},  # 误报
]

# 按置信度降序，贪心匹配 GT（计算 TP/FP 的极简版）
preds_sorted = sorted(preds, key=lambda p: -p["score"])
matched = set()
tp = fp = 0
for p in preds_sorted:
    best_iou, best_gt = 0.0, -1
    for g in gt:
        if g["id"] in matched:
            continue
        v = iou(p["bbox"], g["bbox"])
        if v > best_iou:
            best_iou, best_gt = v, g["id"]
    if best_iou >= 0.5:
        tp += 1
        matched.add(best_gt)
    else:
        fp += 1

recall = tp / len(gt)
precision = tp / (tp + fp)
print(f"TP={tp} FP={fp}  Precision={precision:.3f}  Recall={recall:.3f}")
```

### 第三步：用 pycocotools 算 mAP（COCO 格式的"标准答案"）

```python
# pip install pycocotools
from pycocotools.coco import COCO
from pycocotools.cocoeval import COCOeval

# 1. 加载 GT（需要 annotations/instances_val.json 这样的标准文件）
coco_gt = COCO("annotations/instances_val.json")

# 2. 加载你的预测（list of dict，每个含 image_id / category_id / bbox / score）
#    bbox 格式：[x, y, w, h]，注意是 XYWH 而不是 XYXY
coco_dt = coco_gt.loadRes("predictions.json")

# 3. 评估 bbox 任务
coco_eval = COCOeval(coco_gt, coco_dt, "bbox")
coco_eval.evaluate()
coco_eval.accumulate()
coco_eval.summarize()
# 会看到一行类似：
# Average Precision  (AP) @[ IoU=0.50:0.95 | area=   all | maxDets=100 ] = 0.456
# Average Precision  (AP) @[ IoU=0.50      | area=   all | maxDets=100 ] = 0.682
```

### 第四步：Perplexity 的最小实现（语言模型评估直觉）

```python
import math
from collections import Counter

# 一个极小的测试集：tokenized 好的句子
test_tokens = "the cat sat on the mat . the dog lay on the rug .".split()
# 一个"假想"的语言模型：对每个 token 给出它出现的概率（用训练集的 unigram 频率近似）
train_counts = Counter("the cat sat on the mat . the dog lay on the rug . "
                        "the quick brown fox jumps over the lazy dog .".split())
total = sum(train_counts.values())

log_prob_sum, n = 0.0, 0
for tok in test_tokens:
    p = train_counts[tok] / total if train_counts[tok] > 0 else 1e-6
    log_prob_sum += math.log2(p)
    n += 1

perplexity = 2 ** (-log_prob_sum / n)
print(f"Perplexity ≈ {perplexity:.2f}  "
      f"(直觉：模型平均每次要在 ~{perplexity:.0f} 个词里猜一个)")
```

### 第五步：BLEU / ROUGE 的最简调用

```python
# pip install sacrebleu rouge-score
import sacrebleu
from rouge_score import rouge_scorer

refs = [["The cat sat on the mat ."]]      # 参考译文（可多条）
hyp  = ["The cat sat on the rug ."]         # 模型输出

bleu = sacrebleu.corpus_bleu(hyp, refs)
print("BLEU:", bleu.score)

scorer = rouge_scorer.RougeScorer(["rouge1", "rouge2", "rougeL"], use_stemmer=True)
score = scorer.score(refs[0][0], hyp[0])
print("ROUGE-1:", score["rouge1"].fmeasure)
print("ROUGE-L:", score["rougeL"].fmeasure)
```

## 常见误区

**误区 1：把 Accuracy 当万能指标，尤其不均衡数据集。**
解释：99% 样本是负例时，一个"全预测负"的模型能拿到 99% 的 Accuracy。必须同时看 Precision、Recall、F1 或 AUC-ROC。

**误区 2：mAP 高就是模型好，不管它在小物体/难样本上的表现。**
解释：mAP 是一个全局平均。很多业务里小目标才是关键，需要配合「按目标大小/类别拆开看 AP」，或者直接看混淆矩阵里的错误模式。

**误区 3：IoU 阈值随便写一个，就拿去算 AP。**
解释：AP 的定义绑定 IoU 阈值。0.5 是宽松标准，0.75 是中等严格，COCO 的 0.5:0.95 最严格。跟别人对比模型时，必须用同一套阈值与实现，否则数字毫无意义。

**误区 4：Perplexity 越低，代表生成的句子越好。**
解释：Perplexity 是概率指标，和"人类觉得写得好不好/对不对"不是一回事。一个完美抄训练集的模型 Perplexity 可以极低但毫无价值。生产里通常要同时配合人工抽样 + 任务专属指标（如 BLEU/ROUGE/任务准确率）。

**误区 5：报告 F1 却不说是哪个 class，多分类任务尤其常见。**
解释：多分类里 `macro-F1`、`micro-F1`、`weighted-F1` 完全不同。在不均衡场景下，macro-F1 更容易被小类拖累，weighted-F1 更接近 Accuracy。要写清楚你用的是哪一个，并附上每类的 P/R/F1。
