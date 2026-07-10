---
title: AutoML 自动机器学习
category: machine-learning
difficulty: intermediate
duration: 1-2周
summary: 用自动化方法替代人工调参和模型选择，让机器学习从\"手艺活\"变成\"流水线\"。掌握AutoML能让你用1/10的时间得到更好的模型。
takeaways:
  - 理解AutoML的完整 pipeline：数据预处理 → 特征工程 → 模型选择 → 超参优化 → 架构搜索
  - 搞懂贝叶斯优化为什么比网格/随机搜索高效，能说清采集函数(EI/PI/UCB)的作用
  - 掌握NAS三种主流范式：强化学习(ENAS)、可微分(DARTS)、进化算法的核心思想
  - 能用AutoGluon和Optuna在真实数据集上跑通端到端的AutoML流程
relatedIntel:
  - 112-rl-basics
  - 116-recommender-systems
  - 118-anomaly-detection
tags:
  - automl
  - 超参数优化
  - 神经架构搜索
  - nas
  - 贝叶斯优化
  - autogluon
  - optuna
  - 特征工程
relatedTerms:
  - "matrix"
  - "tensor"
  - "gradient-descent"
  - "convex-optimization"
relatedTools:
  - "numpy"
  - "pandas"
  - "scikit-learn"
relatedNodes:
  - "math-linear-algebra"
  - "llm-inference"
---

## 为什么你要学它

先讲结论：**AutoML = 把机器学习中最耗时间的"调参玄学"和"模型试错"交给算法自动完成。**

做过机器学习项目的人都知道，80%的时间花在这些事情上：

- 这个数据集用XGBoost还是Random Forest？LightGBM会不会更好？
- learning_rate设0.01还是0.001？max_depth多少合适？
- 特征要不要做交叉？要不要做多项式变换？
- 神经网络搭几层？每层多少个神经元？用什么激活函数？

这些问题没有标准答案，全靠经验和试错。一个资深算法工程师可能要花几周时间调参，而AutoML能在几小时内自动搜索出更优的组合。

AutoML不是要替代算法工程师，而是把你从繁琐的调参中解放出来，让你专注于更有价值的事情：问题定义、特征理解、业务落地。

掌握AutoML后，你能：

- 快速建立baseline，用1小时得到别人1周才能调出的模型
- 系统性地探索模型空间，避免凭经验漏掉最优解
- 把建模过程标准化、可复现化

## 一句话概览（快速版）

你只要记住三句话：

1. **AutoML = 自动搜索 + 评估 + 选择**，覆盖从数据预处理到模型部署的全流程
2. **超参数优化的核心是"智能试错"**：贝叶斯优化用历史结果指导下一次尝试，比瞎猜高效10-100倍
3. **NAS的本质是把"网络结构设计"也变成搜索问题**：DARTS用可微分方法让搜索过程从离散选点变成梯度下降

## 核心拆解

### 🔑 AutoML 基础

AutoML（Automated Machine Learning）的目标是让机器学习的整个流程自动化。完整的AutoML pipeline包含：

```
原始数据 → 数据预处理 → 特征工程 → 模型选择 → 超参数优化 → 模型集成 → 最终模型
                         ↓                    ↑
                     特征选择           架构搜索(NAS)
```

**核心问题定义**：给定一个数据集和任务（分类/回归/...），在有限的时间/计算资源预算内，自动找到性能最优的机器学习 pipeline。

**搜索空间**：所有可能的pipeline组合构成的空间，包括：

- 预处理方法选择（标准化、归一化、缺失值填充...）
- 特征工程方法选择（特征交叉、多项式、PCA...）
- 模型类型选择（XGBoost、Random Forest、SVM、神经网络...）
- 每个模型的超参数取值
- 神经网络的架构（层数、宽度、连接方式...）

**搜索策略**：如何在巨大的搜索空间中高效找到好的解：

- 朴素方法：网格搜索、随机搜索
- 贝叶斯优化：基于代理模型的序贯优化
- 强化学习：用RL agent学习搜索策略
- 进化算法：遗传算法、进化策略
- 梯度下降：可微分架构搜索（DARTS）

### 🔑 超参数优化（HPO）

超参数优化是AutoML中最成熟、最常用的模块。

#### 网格搜索（Grid Search）

**思想**：把每个超参数的候选值列出来，穷举所有组合。

```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    'learning_rate': [0.01, 0.1, 0.3],
    'max_depth': [3, 5, 7],
    'n_estimators': [100, 200, 500]
}
# 总共 3×3×3 = 27 种组合
```

**优点**：简单、可并行、结果可复现
**缺点**：维度灾难——10个超参数每个3个选项 = 59049次训练，根本跑不完
**适用场景**：超参数少（≤3个）、每个参数候选值少

#### 随机搜索（Random Search）

**思想**：在搜索空间里随机采样，跑多少算多少。

```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import uniform, randint

param_dist = {
    'learning_rate': uniform(0.001, 0.1),  # 连续分布
    'max_depth': randint(2, 10),           # 整数分布
    'n_estimators': randint(50, 1000)
}
```

**为什么随机搜索比网格搜索好？**
假设只有2个超参数对结果影响大，其他都是噪声。网格搜索在每个维度上都只试了3个值，那重要维度也只试了3个。而随机搜索100次的话，重要维度相当于试了100个不同的值。

**经验法则**：在高维空间中，随机搜索通常比网格搜索高效得多。

#### 贝叶斯优化（Bayesian Optimization）

**核心思想**：用之前的评估结果，建立一个"代理模型"来预测未知点的性能，然后用"采集函数"决定下一个试哪个点。

```
第1步：随机试几个点，得到 (x₁, y₁), (x₂, y₂), ..., (xₙ, yₙ)
第2步：用这些点拟合一个代理模型（通常是高斯过程GP）
第3步：用采集函数计算每个点的"值得一试程度"
第4步：选采集函数最大的点，真实评估一下
第5步：把新点加入数据集，回到第2步，循环直到预算用完
```

**高斯过程（Gaussian Process, GP）**：

- 给每个x预测一个均值μ(x)和方差σ(x)
- μ(x) = 预测的性能
- σ(x) = 预测的不确定性（没探索过的地方σ大）

**采集函数（Acquisition Function）**：
决定下一个点试哪里，平衡"探索"和"利用"：

| 采集函数 | 全称                       | 思想                                   | 特点                   |
| -------- | -------------------------- | -------------------------------------- | ---------------------- |
| **EI**   | Expected Improvement       | 期望改进量：在当前最优基础上能提升多少 | 最常用，平衡探索与利用 |
| **PI**   | Probability of Improvement | 改进的概率：超过当前最优的概率有多大   | 更保守，偏向利用       |
| **UCB**  | Upper Confidence Bound     | 上置信界：μ + κ·σ，κ控制探索程度       | κ大偏探索，κ小偏利用   |

```python
# EI采集函数的直观理解
EI(x) = E[max(f(x) - f(x_best), 0)]
# 如果一个点预测均值很高（好），或者不确定性很高（可能有惊喜），EI就高
```

**贝叶斯优化 vs 随机搜索**：

- 低维（<5个超参）：贝叶斯优化快3-10倍
- 高维：优势缩小，但通常还是更好
- 代价：每一步要拟合GP，计算成本比随机采样高

**主流贝叶斯优化工具**：

- **Optuna**：日本Preferred Networks开发，易用性好，支持多种采样器
- **Hyperopt**：基于TPE（Tree-structured Parzen Estimator），不是GP但也是贝叶斯优化的一种
- **BayesianOptimization**：轻量级GP实现
- **Ray Tune**：分布式超参搜索，支持多种搜索算法

### 🔑 神经架构搜索（NAS）

NAS = Neural Architecture Search，把"设计神经网络结构"也变成搜索问题。

#### 搜索空间设计

常见的搜索空间：

- **整体结构搜索**：直接搜整个网络的连接方式（搜索空间太大，不常用）
- **基于单元的搜索**：搜索"小单元(cell)"，然后重复堆叠（主流做法）
  - Normal Cell：不改变特征图尺寸
  - Reduction Cell：把特征图尺寸减半，通道数加倍

#### NAS三大流派

##### 1. 基于强化学习（ENAS）

**代表工作**：NASNet（2016）、ENAS（2018）

**思想**：用一个RNN控制器作为"架构设计师"，它输出一个网络结构，然后训练这个网络得到准确率作为reward，用强化学习更新控制器。

```
控制器(RNN) → 生成网络结构A → 训练A → 得到准确率R → 用R更新控制器 → 重复
```

**ENAS的关键改进**：参数共享。不是每个生成的网络都从头训练，而是所有生成的网络共享一套权重，每次只训练对应子图的权重。这样搜索时间从GPU天级降到GPU小时级。

**优点**：搜索出的结构质量高
**缺点**：训练不稳定，计算量还是大

##### 2. 基于梯度（DARTS）

**代表工作**：DARTS（2018）、ProxylessNAS（2019）

**核心突破**：把离散的搜索空间连续化，用梯度下降来搜索架构。

**离散搜索空间的问题**：
传统NAS中，每个节点之间"选什么操作"是离散的（选conv3x3，或conv5x5，或maxpool...），不可微，没法用梯度下降。

**DARTS的做法**：
不是选一个操作，而是**所有操作都做，然后加权求和**。权重用softmax归一化，训练的时候同时训练操作的权重和网络参数。

```python
# 传统离散选择：选一个操作
# output = conv3x3(x)  # 或者 conv5x5(x) 或者 maxpool(x)

# DARTS连续松弛：所有操作加权求和
# output = α1*conv3x3(x) + α2*conv5x5(x) + α3*maxpool(x) + ...
# 其中 α = softmax(arch_params)，arch_params是可学习的架构参数
```

**两阶段优化**：

1. **架构搜索阶段**：交替优化网络参数w和架构参数α
   - 固定α，更新w（在训练集上）
   - 固定w，更新α（在验证集上，用梯度下降）
2. **推导阶段**：从连续的α中离散出最终结构
   - 每条边选权重最大的那个操作
   - 每个节点选top-k条输入边

**优点**：搜索极快（GPU小时级甚至分钟级），可微分
**缺点**：搜索到的结构对超参敏感，可能存在"深度塌陷"等问题

##### 3. 基于进化算法

**思想**：借鉴生物进化，用遗传算法搜索网络结构。

```
初始化一群网络结构 → 评估每个的性能 → 选好的留下来（选择）
→ 变异/交叉产生新结构 → 评估 → 选择 → 循环多代
```

**优点**：概念简单，并行友好，能搜到很优的结构
**缺点**：计算量大，通常需要大量GPU

#### NAS小结

| 方法           | 搜索效率 | 结构质量 | 实现难度 |
| -------------- | -------- | -------- | -------- |
| 强化学习(ENAS) | 中       | 高       | 高       |
| 可微分(DARTS)  | 高       | 中       | 中       |
| 进化算法       | 低       | 高       | 低       |

**实际应用建议**：

- 图像分类：直接用已搜好的结构（EfficientNet、MobileNetV3等都是NAS搜出来的）
- 自定义任务：用DARTS类方法快速搜一个baseline
- 追求极致性能：用进化算法或强化学习慢慢搜

### 🔑 自动化特征工程

特征工程传统上是"人工手艺"，但AutoML也在逐步自动化这一环。

#### 特征变换自动化

常见的自动特征变换：

- 数值特征：标准化、归一化、log变换、box-cox变换
- 类别特征：one-hot、label encoding、target encoding、embedding
- 时间特征：年/月/日/星期/小时提取、滑动窗口统计
- 缺失值：均值/中位数/众数填充、模型预测填充

#### 特征构造自动化

**featuretools**：最流行的自动特征工程库，核心概念是"深度特征合成（Deep Feature Synthesis, DFS）"。

```python
import featuretools as ft

# 假设有客户表和交易表
# DFS会自动生成特征，例如：
# - 客户的交易总金额（SUM(transactions.amount)）
# - 客户的交易次数（COUNT(transactions)）
# - 客户最近一次交易距今多久（TIME_SINCE_LAST(transactions.date)）
# - 客户平均每笔交易金额（MEAN(transactions.amount)）
# ... 自动生成成百上千个特征
```

**AutoFeat**：自动生成非线性特征（多项式、对数、三角函数等），然后用L1正则做特征选择。

#### 特征选择自动化

自动从大量特征中选出有用的：

- 过滤法：基于相关性、互信息
- 包裹法：递归特征消除（RFE）
- 嵌入法：L1正则、树模型特征重要性

### 🔑 AutoML 框架

#### AutoGluon

AutoGluon是亚马逊开发的AutoML框架，特点是"傻瓜式"，一行代码搞定所有事。

**核心特性**：

- 自动处理表格/图像/文本数据
- 自动模型选择和集成
- 自动超参优化
- 自动神经网络架构搜索
- 支持时间预算控制

#### H2O AutoML

H2O是老牌机器学习平台，AutoML模块功能完善。

**特点**：

- 支持多种基础模型：GLM、GBM、XGBoost、Random Forest、Deep Learning
- 自动做模型集成（Stacking）
- 有友好的Web UI
- 企业级支持

#### Auto-sklearn

基于scikit-learn的AutoML，用贝叶斯优化搜索sklearn的pipeline。

**特点**：

- 完全兼容sklearn API
- 搜索空间是sklearn的各种预处理器+模型组合
- 用元学习（meta-learning）做warm start，从历史任务中借鉴经验

#### 各框架对比

| 框架         | 易用性     | 功能丰富度 | 性能       | 适合场景               |
| ------------ | ---------- | ---------- | ---------- | ---------------------- |
| AutoGluon    | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | 快速baseline、表格数据 |
| H2O AutoML   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | 企业级、表格数据       |
| Auto-sklearn | ⭐⭐⭐     | ⭐⭐⭐     | ⭐⭐⭐     | 研究、sklearn生态      |
| Optuna       | ⭐⭐⭐     | ⭐⭐       | ⭐⭐⭐⭐⭐ | 灵活定制、超参优化     |

## 完整跑通方案

### 方案一：用AutoGluon快速建立表格分类baseline

**目标**：在Kaggle经典的Titanic数据集上，用AutoGluon自动训练多个模型并集成。

```python
!pip install autogluon

from autogluon.tabular import TabularDataset, TabularPredictor

# 1. 加载数据
train_data = TabularDataset('https://autogluon.s3.amazonaws.com/datasets/Inc/train.csv')
test_data = TabularDataset('https://autogluon.s3.amazonaws.com/datasets/Inc/test.csv')

label = 'class'  # 目标列名
print(train_data.head())

# 2. 训练AutoML模型（指定时间预算1分钟）
predictor = TabularPredictor(
    label=label,
    eval_metric='accuracy',
    path='./autogluon_model'
).fit(
    train_data,
    time_limit=60,  # 总时间预算60秒
    presets='medium_quality'  # 可选: best_quality, good_quality, medium_quality, optimize_for_deployment
)

# 3. 查看模型排行榜
results = predictor.fit_summary()
print(predictor.leaderboard())

# 4. 预测
y_pred = predictor.predict(test_data)
y_pred_proba = predictor.predict_proba(test_data)
print("预测完成")

# 5. 查看特征重要性
feature_importance = predictor.feature_importance(train_data)
print(feature_importance.head(10))
```

**你会看到什么**：

- AutoGluon会自动训练多种模型：Random Forest、XGBoost、LightGBM、CatBoost、Neural Network、KNN...
- 自动做模型集成（Weighted Ensemble、Stacking）
- 最后给你一个leaderboard，按验证集性能排序
- 通常集成模型的效果最好

### 方案二：用Optuna做XGBoost超参数优化

**目标**：手动定义搜索空间，用Optuna的贝叶斯优化找XGBoost的最优超参。

```python
!pip install optuna xgboost scikit-learn pandas

import optuna
import xgboost as xgb
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import train_test_split

# 1. 准备数据
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

# 2. 定义目标函数
def objective(trial):
    # 定义超参数搜索空间
    params = {
        'objective': 'binary:logistic',
        'eval_metric': 'logloss',
        'tree_method': 'hist',

        # 树结构参数
        'max_depth': trial.suggest_int('max_depth', 2, 10),
        'min_child_weight': trial.suggest_int('min_child_weight', 1, 20),
        'gamma': trial.suggest_float('gamma', 0, 5),

        # 采样参数
        'subsample': trial.suggest_float('subsample', 0.5, 1.0),
        'colsample_bytree': trial.suggest_float('colsample_bytree', 0.5, 1.0),

        # 正则化参数
        'reg_alpha': trial.suggest_float('reg_alpha', 1e-8, 100.0, log=True),
        'reg_lambda': trial.suggest_float('reg_lambda', 1e-8, 100.0, log=True),

        # 学习率
        'learning_rate': trial.suggest_float('learning_rate', 0.001, 0.3, log=True),
    }

    n_estimators = trial.suggest_int('n_estimators', 100, 2000)

    # 训练模型
    model = xgb.XGBClassifier(
        n_estimators=n_estimators,
        **params,
        random_state=42,
        use_label_encoder=False
    )

    # 用交叉验证评估
    score = cross_val_score(model, X_train, y_train, cv=3, scoring='accuracy').mean()

    return score

# 3. 创建study并优化
study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=50)  # 试50次

# 4. 查看结果
print(f"最佳准确率: {study.best_value:.4f}")
print(f"最佳参数:")
for key, value in study.best_params.items():
    print(f"  {key}: {value}")

# 5. 用最佳参数在完整训练集上训练，评估测试集
best_model = xgb.XGBClassifier(
    **study.best_params,
    random_state=42,
    use_label_encoder=False
)
best_model.fit(X_train, y_train)
val_score = best_model.score(X_val, y_val)
print(f"验证集准确率: {val_score:.4f}")

# 6. 可视化优化过程（可选）
fig1 = optuna.visualization.plot_optimization_history(study)
fig1.show()

fig2 = optuna.visualization.plot_param_importances(study)
fig2.show()

fig3 = optuna.visualization.plot_parallel_coordinate(study)
fig3.show()
```

**Optuna的关键特性**：

- `suggest_int/float/categorical`：定义不同类型的搜索空间
- `direction='maximize'/'minimize'`：优化方向
- `TPE`：默认的采样器（Tree-structured Parzen Estimator，一种贝叶斯优化）
- Pruner：提前终止没希望的试验（MedianPruner等）
- 可视化：优化历史、参数重要性、平行坐标图

### 方案三：用Optuna + Early Stopping 训练神经网络

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import optuna
from optuna.trial import TrialState

# 定义一个简单的全连接网络
def create_model(trial, input_dim):
    n_layers = trial.suggest_int('n_layers', 1, 3)
    layers = []

    in_features = input_dim
    for i in range(n_layers):
        out_features = trial.suggest_int(f'n_units_l{i}', 16, 128)
        layers.append(nn.Linear(in_features, out_features))
        layers.append(nn.ReLU())
        dropout = trial.suggest_float(f'dropout_l{i}', 0.0, 0.5)
        layers.append(nn.Dropout(dropout))
        in_features = out_features

    layers.append(nn.Linear(in_features, 2))
    return nn.Sequential(*layers)

def objective(trial):
    # 生成模型
    model = create_model(trial, X_train.shape[1])

    # 优化器和学习率
    optimizer_name = trial.suggest_categorical('optimizer', ['Adam', 'SGD'])
    lr = trial.suggest_float('lr', 1e-5, 1e-1, log=True)
    optimizer = getattr(optim, optimizer_name)(model.parameters(), lr=lr)

    # 数据
    train_dataset = TensorDataset(torch.FloatTensor(X_train), torch.LongTensor(y_train))
    val_dataset = TensorDataset(torch.FloatTensor(X_val), torch.LongTensor(y_val))
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=64)

    criterion = nn.CrossEntropyLoss()

    # 训练
    best_val_acc = 0
    for epoch in range(50):
        model.train()
        for batch_X, batch_y in train_loader:
            optimizer.zero_grad()
            output = model(batch_X)
            loss = criterion(output, batch_y)
            loss.backward()
            optimizer.step()

        # 验证
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for batch_X, batch_y in val_loader:
                output = model(batch_X)
                _, predicted = torch.max(output.data, 1)
                total += batch_y.size(0)
                correct += (predicted == batch_y).sum().item()

        val_acc = correct / total
        best_val_acc = max(best_val_acc, val_acc)

        # Optuna的Pruning机制：提前终止不好的试验
        trial.report(val_acc, epoch)
        if trial.should_prune():
            raise optuna.exceptions.TrialPruned()

    return best_val_acc

# 运行优化
study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=30)

pruned_trials = study.get_trials(deepcopy=False, states=[TrialState.PRUNED])
complete_trials = study.get_trials(deepcopy=False, states=[TrialState.COMPLETE])

print(f"剪枝的试验数: {len(pruned_trials)}")
print(f"完成的试验数: {len(complete_trials)}")
print(f"最佳准确率: {study.best_value:.4f}")
```

**Pruning（剪枝）机制**：

- 不需要等所有epoch跑完，中途发现不行就提前停
- 能节省大量时间
- 常见pruner：MedianPruner（比中位数差就剪掉）、HyperbandPruner

## 常见误区

**"AutoML能完全替代算法工程师" → 不能。** AutoML擅长在你定义好的问题和搜索空间里找最优解，但问题怎么定义、特征怎么理解、结果怎么解释、业务怎么落地，这些还是需要人来做。AutoML是工具，不是替代品。

**"贝叶斯优化一定比随机搜索好" → 不一定。** 如果你只有很少的评估预算（比如只能跑10次），随机搜索可能和贝叶斯优化差不多——因为贝叶斯优化需要先积累一些数据才能开始"聪明"地搜索。预算充足时（>20次），贝叶斯优化的优势才明显。

**"NAS搜出来的结构一定比人工设计的好" → 不一定。** NAS搜到的结构通常在特定任务和数据集上最优，但泛化性和可解释性可能不如人工精心设计的结构。而且NAS本身计算成本很高，如果不是追求极致性能，直接用EfficientNet、MobileNet这些成熟结构就够了。

**"DARTS搜出来的结构一定可微可训练" → 是，但性能可能不达标。** DARTS搜索过程很快，但搜到的结构经常存在"深度塌陷"——搜索的时候觉得很好，实际重新训练就不行了。后续有很多改进工作（DARTS+、PC-DARTS、SGAS等）在解决这个问题。

**"AutoML就是无脑跑就行" → 大错特错。** 垃圾进垃圾出。如果你的数据有问题、特征工程没做好、评估指标选错了，再牛的AutoML也救不了你。AutoML放大的是你建模流程的质量。

**"搜索空间越大越好" → 不对。** 搜索空间越大，找到好解需要的计算资源越多。合理的做法是：先用小搜索空间快速得到baseline，再逐步扩大感兴趣的区域。

**"时间越长结果越好" → 边际递减。** AutoML的性能曲线是对数增长的——前1小时提升巨大，后面10小时可能只提升0.1%。要根据业务需求设定合理的时间预算，不要追求极致。

## 学习资源推荐

### 入门级

1. **AutoGluon官方教程**（https://auto.gluon.ai/）
   - 最友好的AutoML入门，跟着例子跑一遍就能上手
   - 表格/图像/文本都有覆盖

2. **Optuna官方文档**（https://optuna.org/）
   - 文档写得非常好，有大量示例
   - 从简单超参优化到进阶的Pruning、分布式都有

### 进阶级

3. **《Automated Machine Learning》书籍**（Hutter等著）
   - AutoML领域的"圣经"，系统全面
   - 涵盖超参优化、NAS、元学习、Auto-WEKA等

4. **论文：Taking Human out of Learning Applications: A Survey on Automated Machine Learning**
   - 全面的AutoML综述论文
   - 适合建立完整的知识体系

### 超参数优化

5. **论文：Practical Bayesian Optimization of Machine Learning Algorithms**（Snoek et al., 2012）
   - 把贝叶斯优化带进ML领域的经典论文
   - 讲清了GP+EI的工作原理

6. **论文：Algorithms for Hyper-Parameter Optimization**（Bergstra et al., 2011）
   - 介绍TPE算法，Hyperopt的理论基础

### 神经架构搜索

7. **论文：Neural Architecture Search with Reinforcement Learning**（Zoph & Le, 2016）
   - NAS开山之作，用强化学习搜架构

8. **论文：Efficient Neural Architecture Search via Parameter Sharing**（Pham et al., 2018）
   - ENAS，参数共享让NAS变得可行

9. **论文：DARTS: Differentiable Architecture Search**（Liu et al., 2019）
   - 可微分架构搜索的代表作
   - 把NAS从"强化学习/进化"拉到了"梯度下降"的轨道上

10. **论文：ProxylessNAS: Direct Neural Architecture Search on Target Task and Hardware**（Cai et al., 2019）
    - 直接在目标任务和硬件上搜，不需要代理任务

### 实践项目

11. **Kaggle竞赛**
    - 找一个表格分类竞赛，用AutoGluon/Optuna做一遍
    - 对比人工调参和AutoML的效果差异

12. **阅读AutoGluon源码**
    - 看它是怎么组织模型训练、集成、超参搜索的
    - 学习工业级AutoML系统的设计思路
