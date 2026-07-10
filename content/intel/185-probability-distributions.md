---
title: 概率论与常见分布机器学习实战
category: math
summary: 从伯努利到 Dirichlet，深入理解常见概率分布的物理直觉、参数含义与机器学习典型应用场景，并用 NumPy/SciPy 实现采样与参数估计。
difficulty: intermediate
excerpt: 从伯努利到 Dirichlet，深入理解常见概率分布的物理直觉、参数含义与机器学习典型应用场景，并用 NumPy/SciPy 实现采样与参数估计。
relatedTerms:
  - convex-optimization
  - matrix
  - entropy
  - tensor
relatedTools:
  - numpy
  - pandas
  - jupyter
  - matplotlib
relatedNodes:
  - math-linear-algebra
  - llm-inference
---

## 为什么你要学它

很多人学概率论的方式是「背公式 + 刷习题」，考完试就忘。但当你真正做机器学习项目时会发现：概率分布无处不在，只是你没意识到而已。

- 训练分类模型时输出的 Softmax 向量，本质上是一个类别上的**多项式分布**参数
- VAE 的 Encoder 输出均值和方差，假设隐变量服从**多元正态分布**
- 贝叶斯优化中用**高斯过程**建模目标函数的后验分布
- 主题模型 LDA 用**Dirichlet 分布**作为文档-主题和主题-词的先验
- 强化学习中策略网络输出的是动作的**类别分布**或**高斯分布**（连续动作）
- 信息检索中的 BM25 算法，核心假设是词频服从**泊松分布**

不懂概率分布的人写代码：调 CrossEntropyLoss，模型不收敛就瞎调学习率。懂概率分布的人写代码：能说出「这个任务标签分布极度不平衡，CE 相当于假设每个样本独立同分布伯努利，应该改成 Focal Loss 重新权重化」——这就是「调参侠」和「工程师」的区别。

本文不讲应试数学，重点讲：**每个分布的物理直觉是什么 → 参数怎么调 → 在机器学习的哪个环节会用到 → 用代码怎么采样和拟合。**

## 一句话概览

- **伯努利/二项/多项分布**：处理分类问题的离散概率，对应交叉熵损失的建模假设
- **正态/对数正态/学生 t 分布**：建模连续实数值，对应回归任务、隐变量、噪声假设
- **泊松/指数/几何分布**：建模计数、等待时间、事件间隔，对应信息检索和生存分析
- **Beta/Dirichlet 分布**：作为「概率的概率」的共轭先验，是贝叶斯方法的基石
- **分布选择的铁律**：离散计数选泊松类，连续实值选正态类，0~1 之间的概率选 Beta/Dirichlet

## 核心拆解

### 🔑 伯努利分布族：分类问题的数学底座

**伯努利分布（Bernoulli）** 是最简单的离散分布，描述「一次实验成功与否」：

```
P(X=1) = p,   P(X=0) = 1-p
```

- 参数：`p ∈ [0, 1]`（成功概率）
- 期望 E[X] = p，方差 Var[X] = p(1-p)

**机器学习应用**：二分类模型的输出就是伯努利分布的参数 p。Sigmoid 函数的作用就是把任意实数值压缩到 [0, 1]，变成一个合法的伯努利参数。

**二项分布（Binomial）** 是 n 次独立伯努利实验中成功次数的分布：

```
P(X=k) = C(n,k) × p^k × (1-p)^(n-k)
```

- 参数：n（实验次数），p（单次成功概率）
- 期望 E[X] = np，方差 Var[X] = np(1-p)

**直觉**：抛 100 次硬币，正面朝上的次数服从 B(n=100, p=0.5)。

**多项分布（Multinomial）** 是二项分布从「二分类」到「多分类」的推广。一次实验有 k 种可能结果，每种结果概率 p₁…p_k，做 n 次实验，各种结果出现次数 (x₁…x_k) 服从多项分布。

**机器学习应用**：多分类模型输出 k 维 Softmax 向量，就是多项分布的参数。CrossEntropy 损失 = 模型预测的多项分布与真实 one-hot 分布之间的 KL 散度（减去一个常数）。

用 NumPy 采样这三种分布：

```python
import numpy as np
import matplotlib.pyplot as plt

# 伯努利：抛一次硬币
samples_bernoulli = np.random.binomial(n=1, p=0.7, size=10000)
print(f"伯努利成功比例（期望0.7）: {samples_bernoulli.mean():.3f}")

# 二项：抛10次硬币，做10000组
samples_binomial = np.random.binomial(n=10, p=0.7, size=10000)
print(f"二项均值（期望7）: {samples_binomial.mean():.3f}")
print(f"二项方差（期望2.1）: {samples_binomial.var():.3f}")

# 多项：掷骰子6000次，记录各面次数
samples_multinomial = np.random.multinomial(n=6000, pvals=[1/6]*6, size=1)[0]
print(f"多项采样（每面期望1000次）: {samples_multinomial.tolist()}")
```

### 🔑 正态分布族：连续世界的默认假设

**正态分布（Normal / Gaussian）** 是概率论的中心。自然界中无数现象（身高、测量误差、股票收益率的近似）都服从正态分布，背后是**中心极限定理**：大量独立同分布随机变量之和，无论变量本身服从什么分布，总和的分布都会趋近正态。

```
f(x; μ, σ²) = (1 / √(2πσ²)) × exp(-(x-μ)² / (2σ²))
```

- 参数：μ（均值，决定峰值位置），σ²（方差，决定分布宽度）
- 标准正态：μ=0, σ=1，记作 Z ~ N(0, 1)

**68-95-99.7 法则**：正态分布中，约 68% 的样本落在 μ±σ 内，95% 在 μ±2σ 内，99.7% 在 μ±3σ 内。这个法则让你不用查表就能快速估算区间。

**机器学习中的正态分布应用**：

1. **回归任务**：假设标签 y 服从 N(w^T x, σ²)，最小化 MSE = 最大化对数似然
2. **权重初始化**：He 初始化（ReLU）= N(0, 2/n_in)，Glorot 初始化 = N(0, 2/(n_in+n_out))
3. **VAE 隐变量**：假设 z ~ N(0, I)，Encoder 预测 μ(x) 和 log σ²(x)，用重参数化技巧采样
4. **贝叶斯神经网络**：每个权重 W ~ N(μ_posterior, σ²_posterior)

**对数正态分布（Log-Normal）**：如果 log(X) 服从正态分布，则 X 服从对数正态。所有取值严格为正、右偏拖尾的量都是对数正态的天然候选：房价、收入、产品销量、单词在语料库中的出现频次。

**学生 t 分布（Student's t）**：比正态分布有更厚的尾部，对异常值更鲁棒。当数据中存在离群点时，用 t 分布建模比正态更稳。深度学习中的 **Student-t 过程** 就是用它替代高斯过程来获得更强的鲁棒性。

用 SciPy 拟合正态分布参数：

```python
import numpy as np
from scipy import stats

# 生成带噪声的真实数据（N(5, 2²)）
np.random.seed(42)
true_mu, true_sigma = 5.0, 2.0
data = np.random.normal(true_mu, true_sigma, size=1000)

# 最大似然估计（MLE）拟合参数
mu_mle, sigma_mle = np.mean(data), np.std(data, ddof=0)
print(f"MLE 估计: μ={mu_mle:.3f}, σ={sigma_mle:.3f}")

# SciPy 的 fit 函数（默认 MLE）
mu_fit, sigma_fit = stats.norm.fit(data)
print(f"SciPy Fit: μ={mu_fit:.3f}, σ={sigma_fit:.3f}")

# 用 KS 检验验证拟合优度（p值大说明不能拒绝"数据来自该分布"）
ks_stat, ks_p = stats.kstest(data, 'norm', args=(mu_fit, sigma_fit))
print(f"KS 检验: 统计量={ks_stat:.4f}, p值={ks_p:.4f}")
# p > 0.05，说明在 95% 置信度下不能拒绝正态假设
```

### 🔑 泊松分布族：计数与等待时间

**泊松分布（Poisson）** 描述「单位时间/空间内，稀有事件发生的次数」：

```
P(X=k) = (λ^k × e^(-λ)) / k!
```

- 参数：λ（单位时间事件平均发生率，同时也是期望和方差）
- E[X] = λ，Var[X] = λ

**典型场景**：

- 一小时内网站访问人数（λ = 100人/小时）
- 一平方公里内发现的罕见物种数量
- 一段 DNA 序列上的突变个数
- 信息检索中，一个文档包含某个词的次数（BM25 的经典假设）

**指数分布（Exponential）** 是泊松分布的「伴侣」，描述泊松过程中两次事件之间的等待时间：

```
f(x; λ) = λ × e^(-λx)   for x ≥ 0
```

- 参数：λ（单位时间事件发生率）
- 期望 E[X] = 1/λ，方差 Var[X] = 1/λ²

**无记忆性**：P(X > s + t | X > s) = P(X > t)。解释：一个灯泡已经用了 1000 小时还没坏，它的剩余寿命和一个新灯泡完全一样——指数分布「不记得」自己已经用了多久。这个性质让它成为可靠性工程的核心假设。

**几何分布（Geometric）** 是指数分布的离散版：「直到第一次成功，需要做多少次伯努利实验」。强化学习中一个回合的长度如果每一步终止概率为 p，那么回合总步数服从几何分布。

模拟一个泊松过程并可视化：

```python
import numpy as np
import matplotlib.pyplot as plt

lambda_rate = 3.0  # 平均每分钟发生 3 次事件
total_time = 60    # 模拟 60 分钟

# 用指数分布采样相邻事件间隔
n_events_expected = int(lambda_rate * total_time * 2)  # 留足余量
inter_arrivals = np.random.exponential(1/lambda_rate, size=n_events_expected)
event_times = np.cumsum(inter_arrivals)
event_times = event_times[event_times < total_time]

print(f"60分钟内实际发生事件数: {len(event_times)}（期望 {lambda_rate*total_time}）")

# 统计每分钟的事件数，应该服从 Poisson(λ=3)
minute_counts = np.zeros(60, dtype=int)
for t in event_times:
    minute_counts[int(t)] += 1

print(f"每分钟事件数样本均值: {minute_counts.mean():.2f}（期望3.0）")
print(f"每分钟事件数样本方差: {minute_counts.var():.2f}（期望3.0）")

# 可视化：直方图 + 理论泊松 PMF
from scipy import stats
k_values = np.arange(0, minute_counts.max() + 3)
pmf = stats.poisson.pmf(k_values, mu=lambda_rate)

plt.figure(figsize=(10, 4))
plt.hist(minute_counts, bins=np.arange(-0.5, len(k_values)+0.5, 1),
         density=True, alpha=0.7, label='实际分布', edgecolor='black')
plt.plot(k_values, pmf, 'ro-', markersize=8, label='Poisson(λ=3) 理论')
plt.xlabel('每分钟事件次数')
plt.ylabel('概率')
plt.legend()
plt.title('泊松过程验证：每分钟事件计数分布')
plt.show()
```

### 🔑 Beta/Dirichlet：共轭先验与贝叶斯推断

贝叶斯方法的核心公式：后验 ∝ 似然 × 先验。如果选对了先验分布，后验会和先验属于**同一分布族**，这叫「共轭性」，能极大简化计算。

**Beta 分布**是伯努利/二项分布的共轭先验，定义域 [0, 1]，恰好用来建模「一个未知概率 p 的概率分布」。

```
f(p; α, β) = p^(α-1) × (1-p)^(β-1) / B(α, β)
```

- 参数：α, β > 0（形状参数）
- 期望 E[p] = α/(α+β)，方差随 α+β 增大而减小

**直觉**：

- α=1, β=1 → 均匀分布 U(0,1)，完全无知的先验
- α=10, β=10 → 中心在 0.5，方差较小，「p 大概在 0.5 附近」的信念
- α=50, β=1 → 强烈倾向 p 接近 1，「成功率极高」的信念

共轭性意味着：如果先验是 Beta(α₀, β₀)，观察到 n 次实验中有 k 次成功，则后验 = Beta(α₀ + k, β₀ + n - k)。不用算积分，直接加参数就行——这就是 Beta 分布的魔法。

**Dirichlet 分布**是 Beta 从 2 类到 K 类的推广。它的定义域是 K 维概率单纯形（p₁+…+p_K = 1, p_i ≥ 0），作为多项分布的共轭先验。LDA 主题模型中，每个文档的主题分布 θ_d ~ Dirichlet(α)，每个主题的词分布 φ_k ~ Dirichlet(β)，就是利用了共轭性让 Gibbs 采样的条件分布有闭式解。

贝叶斯在线学习的例子：逐次抛硬币，更新对正面概率 p 的信念：

```python
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

# 先验：一开始对 p 一无所知，用 Beta(1,1)=均匀分布
alpha_prior, beta_prior = 1, 1

# 模拟真实硬币 p=0.6，逐次观察结果
np.random.seed(42)
true_p = 0.6
n_trials = 200
observations = np.random.binomial(1, true_p, size=n_trials)

# 逐次更新后验
posterior_params = []
alpha, beta = alpha_prior, beta_prior
for outcome in observations:
    if outcome == 1:
        alpha += 1
    else:
        beta += 1
    posterior_params.append((alpha, beta))

# 可视化：经过 0/10/50/200 次观察后的后验分布
fig, axes = plt.subplots(2, 2, figsize=(12, 8))
checkpoints = [0, 10, 50, 200]
p_grid = np.linspace(0, 1, 500)

for ax, n in zip(axes.flat, checkpoints):
    if n == 0:
        a, b = alpha_prior, beta_prior
    else:
        a, b = posterior_params[n-1]
    pdf = stats.beta.pdf(p_grid, a, b)
    mean = a / (a + b)

    ax.plot(p_grid, pdf, 'b-', lw=2, label=f'Beta({a}, {b})')
    ax.axvline(true_p, color='red', ls='--', label=f'真实 p={true_p}')
    ax.axvline(mean, color='green', ls=':', label=f'后验均值={mean:.3f}')
    ax.set_title(f'观察 {n} 次后的后验分布')
    ax.legend()
    ax.set_xlim(0, 1)
    ax.set_xlabel('p')
    ax.set_ylabel('概率密度')

plt.tight_layout()
plt.show()

# 最终后验 95% 可信区间
final_a, final_b = posterior_params[-1]
ci_low, ci_high = stats.beta.ppf([0.025, 0.975], final_a, final_b)
print(f"最终后验 95% 可信区间: [{ci_low:.3f}, {ci_high:.3f}]")
print(f"区间是否包含真实 p={true_p}: {ci_low <= true_p <= ci_high}")
```

### 🔑 分布选择的决策流程

面对一个建模任务，按下面的流程图选分布，八九不离十：

```
要建模的量是什么类型？
├─ 离散计数型（非负整数：次数、人数、个数）
│   ├─ 有明确上限 n（n 次实验中成功数）→ 二项/多项分布
│   └─ 无上限，发生率稳定稀有 → 泊松分布
│       └─ 方差 > 均值（过离散）→ 负二项分布（替代泊松）
│
├─ 连续实值型
│   ├─ (-∞, +∞)，对称钟形 → 正态分布
│   ├─ 仅取正值，右偏（收入、销量）→ 对数正态分布
│   ├─ 有离群点，需要鲁棒 → 学生 t 分布
│   └─ 事件间隔 / 等待时间（>0）→ 指数分布 / Weibull 分布
│
├─ 单个概率值 p ∈ [0,1]（如转化率）→ Beta 分布
│
└─ K 维概率向量（p₁+…+p_K=1）→ Dirichlet 分布
```

## 完整跑通方案：用分布建模真实数据集

### 第一步：加载并探索数据

用经典的 Ames Housing 房价数据集，分别对三个变量建模：

```python
import numpy as np
import pandas as pd
from scipy import stats
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings('ignore')

# 下载数据集（如果已经有就直接加载）
from sklearn.datasets import fetch_openml
housing = fetch_openml(name="house_prices", as_frame=True, parser="auto")
df = housing.frame

print("数据集形状:", df.shape)
print("选择的三个变量:")
print("  - SalePrice: 房价（连续右偏，候选对数正态）")
print("  - BedroomAbvGr: 卧室数量（离散计数，候选泊松）")
print("  - OverallQual: 整体质量评分 1-10（有序离散，可近似正态）")

# 提取变量
price = df['SalePrice'].dropna().values.astype(float)
bedrooms = df['BedroomAbvGr'].dropna().values.astype(int)
quality = df['OverallQual'].dropna().values.astype(int)
```

### 第二步：拟合每个变量的候选分布

```python
def fit_and_compare(data, candidates, plot_title, xlabel):
    """拟合多个候选分布，用 AIC 对比优劣（AIC 越小越好）"""
    results = []

    for dist_name in candidates:
        dist = getattr(stats, dist_name)
        try:
            params = dist.fit(data)
            # 计算 AIC = 2k - 2ln(L)，这里用简化近似
            log_likelihood = np.sum(dist.logpdf(data, *params))
            k = len(params)
            aic = 2 * k - 2 * log_likelihood
            results.append({
                'dist': dist_name,
                'params': params,
                'aic': aic,
                'log_lik': log_likelihood,
            })
        except Exception as e:
            print(f"  拟合 {dist_name} 失败: {e}")

    # 按 AIC 升序
    results.sort(key=lambda r: r['aic'])
    print(f"\n【{plot_title}】候选分布 AIC 排序：")
    for r in results:
        print(f"  {r['dist']:<12} AIC={r['aic']:.1f}  params={[round(p,3) for p in r['params']]}")

    best = results[0]
    print(f"  → 最优分布: {best['dist']}")

    # 可视化：直方图 + 最优分布 PDF
    plt.figure(figsize=(10, 4))
    plt.hist(data, bins=40, density=True, alpha=0.6, label='实际数据', edgecolor='gray')

    x_grid = np.linspace(data.min(), data.max(), 500)
    best_dist = getattr(stats, best['dist'])
    plt.plot(x_grid, best_dist.pdf(x_grid, *best['params']),
             'r-', lw=2.5, label=f"最优: {best['dist']} (AIC={best['aic']:.0f})")

    # 也画一个次优的做对比
    if len(results) >= 2:
        second = results[1]
        dist2 = getattr(stats, second['dist'])
        plt.plot(x_grid, dist2.pdf(x_grid, *second['params']),
                 'k--', lw=1.5, label=f"次优: {second['dist']} (AIC={second['aic']:.0f})")

    plt.xlabel(xlabel)
    plt.ylabel('概率密度 / 归一化频率')
    plt.title(plot_title)
    plt.legend()
    plt.tight_layout()
    plt.show()

    return best

# 1. 房价：拟合正态 vs 对数正态
price_results = fit_and_compare(
    price,
    ['norm', 'lognorm', 't'],
    "房价 SalePrice 分布拟合对比",
    "房价（美元）"
)

# 2. 卧室数量：拟合泊松 vs 负二项
bedroom_results = fit_and_compare(
    bedrooms,
    ['poisson', 'nbinom'],
    "卧室数量 BedroomAbvGr 分布拟合对比",
    "卧室数量"
)

# 3. 质量评分：近似正态
quality_results = fit_and_compare(
    quality.astype(float),
    ['norm', 'skewnorm', 't'],
    "整体质量评分 OverallQual 分布拟合对比",
    "质量评分 (1-10)"
)
```

### 第三步：基于拟合分布做统计推断

既然房价服从对数正态，我们就可以回答「95% 的房子价格落在什么区间」这类问题：

```python
# 房价最优分布是对数正态
lognorm_params = price_results['params']
shape_param, loc, scale = lognorm_params

# 95% 预测区间（未来观测值可能落在的范围）
pi_low, pi_high = stats.lognorm.ppf([0.025, 0.975], shape_param, loc=loc, scale=scale)
print(f"\n房价 95% 预测区间: ${pi_low:,.0f} ~ ${pi_high:,.0f}")
print(f"中位数房价（对数正态的 exp(μ)）: ${scale:,.0f}")

# 回答业务问题：价格超过 $500,000 的房子占比？
prob_500k = 1 - stats.lognorm.cdf(500000, shape_param, loc=loc, scale=scale)
print(f"房价超过 $500,000 的比例估计: {prob_500k:.2%}")

# 回答另一个问题：卧室数量的均值和方差关系（泊松假设下均值=方差）
mean_bed = bedrooms.mean()
var_bed = bedrooms.var()
print(f"\n卧室数量: 均值={mean_bed:.3f}, 方差={var_bed:.3f}")
if var_bed > mean_bed * 1.5:
    print(f"→ 方差/均值={var_bed/mean_bed:.2f}，过离散明显，之前选择的负二项分布更合理")
else:
    print("→ 方差接近均值，泊松分布已经足够")

# 用拟合好的负二项生成模拟数据，和真实数据对比
nbinom_params = bedroom_results['params']
n_param, p_param, loc_bed = nbinom_params
sim_bedrooms = stats.nbinom.rvs(n=n_param, p=p_param, loc=loc_bed, size=len(bedrooms))

# 对比真实 vs 模拟的众数
from collections import Counter
true_mode = Counter(bedrooms).most_common(1)[0][0]
sim_mode = Counter(sim_bedrooms).most_common(1)[0][0]
print(f"卧室数量: 真实众数={true_mode}, 模拟众数={sim_mode}")
```

## 常见误区

**误区 1：所有连续数据都用正态分布建模。** → 房价、收入这种明显右偏的数据强行用正态，PDF 在负值区域还给出正概率（实际房价不可能为负），完全违背物理约束。正确做法：正的右偏数据先试对数正态，再不行用 Gamma/Weibull 族。取对数后再画 Q-Q 图验证正态性，比瞎试分布高效得多。

**误区 2：均值差不多就等于分布拟合对了。** → 泊松 (λ=3) 和 负二项 (均值=3, 方差=10) 均值完全一样，但尾部天差地别：前者看到 k=10 的概率是 0.0008，后者是 0.03，差 38 倍。在异常检测、风险评估这种关心尾部的场景，均值对上了没用，必须看方差和尾部形状是否匹配。

**误区 3：Beta(α=1, β=1) 是「无信息先验」，不管什么场景都选它。** → 无信息不等于「完全没有影响」。在数据量很小时（比如只有 5 次点击），先验参数加的那两个虚拟样本会显著影响后验。如果有业务知识（比如这个广告位历史 CTR 一直 2%~3%），应该用 Beta(2, 98) 这种弱信息先验注入信念，而不是假装一无所知。

**误区 4：Dirichlet 的 α 参数全部相等就是对称均匀。** → α=1 时确实是均匀先验，但 α=0.1（稀疏先验）和 α=10（稠密先验）的形状完全不同。α 越小，越倾向「大部分 p_i 接近 0，少数几个 p_i 占绝大多数概率质量」——这对应主题模型中「一篇文档通常只属于少数几个主题」的真实假设。做 LDA 时 α 设 0.1 通常比 1.0 效果好，就是这个原因。

**误区 5：p 值 < 0.05 就说明分布拟合得好。** → KS 检验、卡方检验的 p 值回答的是「有没有足够证据说数据不服从该分布」，不是「数据有多服从该分布」。样本量小时（n<50），即使分布明显不对，检验也可能因为功效不够而 p>0.05；反过来样本量极大时（n>10000），哪怕分布只有极微小的不匹配，p 值也会 < 0.05。正确做法：p 值只是参考，搭配 Q-Q 图、AIC、业务知识一起判断。
