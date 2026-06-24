---
title: 时间序列分析与预测
category: data-science
keywords:
  - time series
  - arima
  - prophet
  - lstm
  - tcn
  - tft
  - anomaly detection
difficulty: intermediate
duration: 2-3周
summary: 从经典统计到深度学习，系统掌握时间序列分解、预测、异常检测的核心方法与实战技能。
takeaways:
  - 理解时间序列三大组成：趋势、季节性、残差，能用 STL 分解做可视化分析
  - 掌握 ARIMA/SARIMA 原理，能通过 ADF 检验和平稳性分析选择合适的参数
  - 能用 Prophet 快速落地业务预测，理解其可解释性和节假日处理机制
  - 掌握 LSTM/TCN/TFT 等深度学习时序方法，知道不同场景下该选什么模型
  - 理解多步预测策略（递归/直接/多输出）的 trade-off，会用 MAE/RMSE/MAPE/SMAPE 评估模型
---

## 为什么你要学它

先讲结论：**时间序列 = 让你从"历史会重演"中赚钱/省钱/避险。**

几乎所有真实世界的数据都带时间戳：销量、股价、气温、服务器流量、传感器读数、用户活跃度……你每天看到的"明天天气""下个月销售额""下季度库存"，背后都是时间序列预测。

它的独特之处在于：**数据点之间不是独立的，时间顺序本身就是信息。** 普通机器学习假设样本 i.i.d.（独立同分布），但时间序列里"今天的销量"和"昨天的销量"强相关——你不能随便打乱顺序。

学完时间序列，你会获得一种独特的"时间感"：看到一条曲线，就能下意识地拆解出"哪些是趋势、哪些是周期、哪些是噪音"，然后选择合适的工具去预测未来。

## 一句话概览（快速版）

你只要记住三句话：

1. **任何时间序列都能拆成三块**：趋势（Trend，长期走向）+ 季节（Seasonal，周期波动）+ 残差（Residual，随机噪音）
2. **预测方法分两大阵营**：经典统计（ARIMA 家族，擅长解释性和小数据）vs 深度学习（LSTM/TCN/TFT，擅长复杂模式和大数据）
3. **没有万能模型，只有最合适的模型**：先上 Prophet 做 baseline，数据多再考虑深度学习，永远用 MAE/RMSE/MAPE 说话

## 核心拆解

### 🔑 时间序列基础：三大组成与分解

时间序列分析的第一步永远是**分解**——把一条复杂曲线拆成简单的几部分，分别理解再组合。

**加法模型**：`Y(t) = Trend(t) + Seasonal(t) + Residual(t)`
- 适用于季节性波动幅度不随趋势变化的场景（如气温）

**乘法模型**：`Y(t) = Trend(t) × Seasonal(t) × Residual(t)`
- 适用于季节性波动随趋势增长而变大的场景（如销量）

**常用分解方法**：
- **移动平均法**：简单直观，但端点丢失数据
- **STL 分解**（Seasonal and Trend decomposition using Loess）：鲁棒性强，能处理异常值，推荐首选
- **X-12-ARIMA**：美国人口普查局方法，经济领域常用

```python
import pandas as pd
from statsmodels.tsa.seasonal import STL
import matplotlib.pyplot as plt

# 加载数据（以航空乘客数据为例）
data = pd.read_csv('air_passengers.csv', parse_dates=['date'], index_col='date')
series = data['passengers']

# STL 分解
stl = STL(series, seasonal=13, robust=True)
result = stl.fit()

# 可视化：趋势、季节、残差三部分
fig, (ax1, ax2, ax3, ax4) = plt.subplots(4, 1, figsize=(12, 10))
result.observed.plot(ax=ax1, title='原始数据')
result.trend.plot(ax=ax2, title='趋势 Trend')
result.seasonal.plot(ax=ax3, title='季节 Seasonal')
result.resid.plot(ax=ax4, title='残差 Residual')
plt.tight_layout()
plt.show()
```

**平稳性（Stationarity）**是时间序列的核心概念：
- 严平稳：均值、方差、自协方差都不随时间变化
- 宽平稳：均值和方差不变，自协方差只和时间差有关
- **为什么重要**：ARIMA 等经典模型要求数据平稳，不平稳的话预测会飘

**ADF 检验**（Augmented Dickey-Fuller Test）是检验平稳性的标准方法：
- 原假设 H₀：序列非平稳（存在单位根）
- p-value < 0.05 → 拒绝原假设 → 序列平稳
- 不平稳怎么办？**差分**（differencing）：后一个减前一个，做 1 阶或 2 阶差分通常就平稳了

```python
from statsmodels.tsa.stattools import adfuller

result = adfuller(series)
print(f'ADF 统计量: {result[0]:.4f}')
print(f'p-value: {result[1]:.4f}')
print('临界值:', result[4])

if result[1] < 0.05:
    print('✅ 序列平稳')
else:
    print('❌ 序列非平稳，需要差分')
```

### 🔑 经典统计方法：ARIMA / SARIMA

ARIMA 是时间序列预测的"瑞士军刀"，三个字母各代表一件事：

**AR（AutoRegressive，自回归）**：用过去 p 个时刻的值预测现在
- `y_t = c + φ₁·y_{t-1} + φ₂·y_{t-2} + ... + φ_p·y_{t-p} + ε_t`
- p 值怎么选？看 **PACF**（偏自相关函数）图，截尾位置就是 p

**I（Integrated，差分）**：做 d 阶差分让序列变平稳
- 大多数经济数据 d=1 就够了，极少数需要 d=2
- 怎么确定 d？做 ADF 检验，差分到平稳为止

**MA（Moving Average，移动平均）**：用过去 q 个误差项预测现在
- `y_t = μ + ε_t + θ₁·ε_{t-1} + ... + θ_q·ε_{t-q}`
- q 值怎么选？看 **ACF**（自相关函数）图，截尾位置就是 q

**SARIMA** = ARIMA + 季节性部分，记为 `SARIMA(p,d,q)(P,D,Q,s)`
- 小写 p,d,q：普通 ARIMA 参数
- 大写 P,D,Q：季节性 ARIMA 参数
- s：季节周期（如月度数据 s=12，周度数据 s=7）

```python
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX

# ARIMA 示例
model = ARIMA(series, order=(2, 1, 2))  # p=2, d=1, q=2
results = model.fit()
print(results.summary())

# 预测未来 12 步
forecast = results.forecast(steps=12)

# SARIMA 示例（带季节性）
model_s = SARIMAX(series, order=(2, 1, 2), seasonal_order=(1, 1, 1, 12))
results_s = model_s.fit()
forecast_s = results_s.forecast(steps=12)
```

**参数选择经验法则**：
- 先画 ACF/PACF 图初步判断
- 再用 **AIC / BIC** 准则自动选参（越小越好）
- `pmdarima` 库的 `auto_arima` 可以自动找最优参数

### 🔑 深度学习方法：LSTM / TCN

当数据量大、模式复杂时，深度学习往往比统计方法效果好。

**LSTM**（Long Short-Term Memory）：
- RNN 的改进版，解决了长序列梯度消失问题
- 通过"门"机制（输入门、遗忘门、输出门）控制信息流动
- 适合捕捉长时依赖，但训练慢、并行性差

**GRU**（Gated Recurrent Unit）：
- LSTM 的简化版，参数更少，训练更快
- 效果通常和 LSTM 差不多，优先推荐 GRU 起步

```python
import torch
import torch.nn as nn

class LSTMForecaster(nn.Module):
    def __init__(self, input_size=1, hidden_size=64, num_layers=2, output_size=1):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, 
                           batch_first=True, dropout=0.2)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        # x shape: (batch, seq_len, input_size)
        out, _ = self.lstm(x)
        # 取最后一个时间步的输出
        out = self.fc(out[:, -1, :])
        return out

# 数据准备：用过去 24 小时预测下 1 小时
def create_dataset(data, lookback=24):
    X, y = [], []
    for i in range(len(data) - lookback):
        X.append(data[i:i+lookback])
        y.append(data[i+lookback])
    return torch.FloatTensor(X).unsqueeze(-1), torch.FloatTensor(y).unsqueeze(-1)
```

**TCN**（Temporal Convolutional Network，时间卷积网络）：
- 用 1D 卷积 + 因果卷积（causal convolution）处理序列
- 核心创新：**膨胀卷积**（dilated convolution），指数级扩大感受野
- 比 LSTM 训练快得多（可并行），效果往往更好
- 适合长期依赖的时序预测

```python
class TemporalBlock(nn.Module):
    def __init__(self, n_inputs, n_outputs, kernel_size, stride, dilation, dropout=0.2):
        super().__init__()
        self.conv1 = nn.Conv1d(n_inputs, n_outputs, kernel_size,
                              stride=stride, padding=(kernel_size-1)*dilation,
                              dilation=dilation)
        self.conv2 = nn.Conv1d(n_outputs, n_outputs, kernel_size,
                              stride=stride, padding=(kernel_size-1)*dilation,
                              dilation=dilation)
        self.downsample = nn.Conv1d(n_inputs, n_outputs, 1) if n_inputs != n_outputs else None
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        out = self.relu(self.conv1(x))
        out = self.dropout(out)
        out = self.relu(self.conv2(out))
        out = self.dropout(out)
        res = x if self.downsample is None else self.downsample(x)
        return self.relu(out + res)

class TCN(nn.Module):
    def __init__(self, input_size, num_channels, kernel_size=3, dropout=0.2):
        super().__init__()
        layers = []
        num_levels = len(num_channels)
        for i in range(num_levels):
            dilation = 2 ** i
            in_channels = input_size if i == 0 else num_channels[i-1]
            out_channels = num_channels[i]
            layers.append(TemporalBlock(in_channels, out_channels, kernel_size,
                                       stride=1, dilation=dilation, dropout=dropout))
        self.network = nn.Sequential(*layers)
        self.fc = nn.Linear(num_channels[-1], 1)

    def forward(self, x):
        # x shape: (batch, seq_len, input_size) → 转置为 (batch, input_size, seq_len)
        x = x.transpose(1, 2)
        out = self.network(x)
        # 取最后一个时间步
        out = out[:, :, -1]
        return self.fc(out)
```

### 🔑 Transformer-based：TFT / Informer

Transformer 也在时序领域攻城略地，但不是直接拿来用，需要针对时序特点改造。

**TFT**（Temporal Fusion Transformer）：
- Google 出品，专门为多变量时序预测设计
- 核心亮点：
  - **门控机制**：过滤掉不重要的特征
  - **静态/动态特征分离**：处理不随时间变的特征（如商品类别）
  - **可解释性**：能输出每个特征的重要性
  - **分位数预测**：不仅预测点估计，还给置信区间
- 工业界非常受欢迎，`pytorch-forecasting` 库有现成实现

**Informer**：
- 解决 Transformer 在长序列上 O(n²) 复杂度的问题
- 核心：ProbSparse Attention（只关注最相关的少数 key）
- 适合超长序列预测（如预测未来一整年的每日数据）

**PatchTST**：
- 最新的 SOTA 思路：把时间序列切分成"补丁"（patch），像 ViT 处理图像一样处理
- 效果好、实现简单，逐渐成为新的 baseline

### 🔑 时序异常检测

异常检测 = 找出"不正常"的数据点，应用场景极广：
- 工业传感器：设备故障预警
- 金融：欺诈交易检测
- IT：服务器异常流量监控
- 医疗：心电图异常识别

**常用方法**：

| 方法 | 原理 | 适用场景 |
|------|------|----------|
| 3σ 原则 | 正态分布假设，偏离均值 3 倍标准差算异常 | 数据近似正态、分布稳定 |
| IQR 方法 | 四分位距，超出 Q1-1.5·IQR 或 Q3+1.5·IQR 算异常 | 对极端值鲁棒 |
| Isolation Forest | 孤立森林，随机切分空间，异常点更容易被孤立 | 高维数据、无标签 |
| AutoEncoder | 重构误差大的是异常 | 深度学习、有足够数据 |
| LSTM-AE | LSTM 编解码器，利用时序依赖 | 序列数据、模式复杂 |

```python
from sklearn.ensemble import IsolationForest
import numpy as np

# 孤立森林异常检测
model = IsolationForest(contamination=0.05, random_state=42)  # 5% 异常率
model.fit(series.values.reshape(-1, 1))

# 预测：1 正常，-1 异常
predictions = model.predict(series.values.reshape(-1, 1))
anomaly_mask = predictions == -1
anomalies = series[anomaly_mask]

print(f'检测到 {len(anomalies)} 个异常点')
```

**多步预测策略**（预测未来 N 步）：
- **递归策略**（Recursive）：一步一步预测，每步的输出当下一步的输入
  - 优点：只训练一个模型
  - 缺点：误差会累积，越往后越不准
- **直接策略**（Direct）：为每一步训练一个独立的模型
  - 优点：没有误差累积
  - 缺点：训练 N 个模型，忽略步间相关性
- **多输出策略**（MIMO）：一个模型直接输出所有 N 步
  - 优点：端到端，捕捉步间依赖
  - 缺点：输出维度高，训练难度大
- **DirRec 混合策略**：直接+递归，每步把之前的预测当特征输入

**评估指标**：

| 指标 | 公式 | 特点 |
|------|------|------|
| MAE | `mean(|y - ŷ|)` | 平均绝对误差，鲁棒，量纲和原值一致 |
| RMSE | `sqrt(mean((y - ŷ)²))` | 均方根误差，对大误差惩罚重 |
| MAPE | `mean(|(y - ŷ)/y| × 100%)` | 平均绝对百分比误差，无量纲，y=0 时炸 |
| SMAPE | `mean(|y - ŷ| / (|y| + |ŷ|) × 200%)` | 对称 MAPE，解决了 MAPE 的不对称问题 |

```python
import numpy as np

def mae(y_true, y_pred):
    return np.mean(np.abs(y_true - y_pred))

def rmse(y_true, y_pred):
    return np.sqrt(np.mean((y_true - y_pred) ** 2))

def mape(y_true, y_pred):
    return np.mean(np.abs((y_true - y_pred) / y_true)) * 100

def smape(y_true, y_pred):
    return np.mean(2 * np.abs(y_pred - y_true) / (np.abs(y_true) + np.abs(y_pred))) * 100
```

## 完整跑通方案

**第一步：用 statsmodels 跑通经典 ARIMA 预测**

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.seasonal import STL
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error, mean_squared_error

# 1. 加载数据（以经典航空乘客数据为例）
url = 'https://raw.githubusercontent.com/jbrownlee/Datasets/master/airline-passengers.csv'
df = pd.read_csv(url, parse_dates=['Month'], index_col='Month')
df.columns = ['passengers']
series = df['passengers']

# 2. 探索性分析
print('数据形状:', df.shape)
print('时间范围:', df.index.min(), '到', df.index.max())

# 3. STL 分解
stl = STL(series, seasonal=13, robust=True)
result = stl.fit()

fig, axes = plt.subplots(4, 1, figsize=(12, 8), sharex=True)
result.observed.plot(ax=axes[0], title='原始数据')
result.trend.plot(ax=axes[1], title='趋势')
result.seasonal.plot(ax=axes[2], title='季节性')
result.resid.plot(ax=axes[3], title='残差')
plt.tight_layout()
plt.savefig('stl_decomposition.png')
plt.close()

# 4. 平稳性检验
adf_result = adfuller(series)
print(f'\nADF 检验 p-value: {adf_result[1]:.4f}')

# 一阶差分后再检验
diff = series.diff().dropna()
adf_diff = adfuller(diff)
print(f'一阶差分后 p-value: {adf_diff[1]:.4f}')

# 5. 划分训练集和测试集（前 120 个月训练，后 24 个月测试）
train_size = 120
train, test = series[:train_size], series[train_size:]
print(f'\n训练集: {len(train)} 条, 测试集: {len(test)} 条')

# 6. 训练 ARIMA 模型
model = ARIMA(train, order=(2, 1, 2), seasonal_order=(1, 1, 1, 12))
results = model.fit()
print(results.summary())

# 7. 预测
forecast = results.forecast(steps=len(test))

# 8. 评估
mae_score = mean_absolute_error(test, forecast)
rmse_score = np.sqrt(mean_squared_error(test, forecast))
mape_score = np.mean(np.abs((test - forecast) / test)) * 100

print(f'\nMAE:  {mae_score:.2f}')
print(f'RMSE: {rmse_score:.2f}')
print(f'MAPE: {mape_score:.2f}%')

# 9. 可视化结果
plt.figure(figsize=(12, 5))
plt.plot(train.index, train, label='训练集')
plt.plot(test.index, test, label='真实值')
plt.plot(test.index, forecast, label='预测值', linestyle='--')
plt.title('ARIMA 航空乘客数量预测')
plt.legend()
plt.savefig('arima_forecast.png')
plt.close()
```

**第二步：用 Prophet 快速做业务预测**

Prophet 是 Facebook 开源的时序预测工具，特点是：
- 开箱即用，调参少
- 自动处理节假日、缺失值
- 可解释性强
- 适合有强季节性的业务数据

```python
import pandas as pd
from prophet import Prophet
from prophet.plot import plot_plotly, plot_components_plotly

# 1. 准备数据（Prophet 要求列名是 ds 和 y）
url = 'https://raw.githubusercontent.com/jbrownlee/Datasets/master/airline-passengers.csv'
df = pd.read_csv(url)
df.columns = ['ds', 'y']
df['ds'] = pd.to_datetime(df['ds'])

# 2. 划分数据集
train = df[:120]
test = df[120:]

# 3. 创建并训练模型
model = Prophet(
    yearly_seasonality=True,   # 开启年季节性
    weekly_seasonality=False,  # 关闭周季节性（月度数据不需要）
    daily_seasonality=False,   # 关闭日季节性
    seasonality_mode='multiplicative',  # 乘法模式（销量数据常用）
    changepoint_prior_scale=0.05,  # 趋势灵活性，越大越灵活
)
model.fit(train)

# 4. 构建未来日期框架并预测
future = model.make_future_dataframe(periods=24, freq='M')
forecast = model.predict(future)

# 5. 查看预测结果（关键列：yhat 预测值，yhat_lower/upper 置信区间）
print(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail())

# 6. 评估
test_forecast = forecast.tail(24)
mae = (test['y'].values - test_forecast['yhat'].values).abs().mean()
mape = (abs(test['y'].values - test_forecast['yhat'].values) / test['y'].values).mean() * 100
print(f'\nMAE: {mae:.2f}')
print(f'MAPE: {mape:.2f}%')

# 7. 可视化
fig1 = model.plot(forecast)
fig1.savefig('prophet_forecast.png')

fig2 = model.plot_components(forecast)
fig2.savefig('prophet_components.png')

# 8. 添加节假日（可选）
# 比如添加中国春节、双十一等特殊日期
holidays = pd.DataFrame({
    'holiday': 'china_spring_festival',
    'ds': pd.to_datetime(['1949-02-01', '1950-02-17', '1951-02-06']),
    'lower_window': -3,
    'upper_window': 3,
})
model_with_holidays = Prophet(holidays=holidays, yearly_seasonality=True)
```

**第三步：用 PyTorch 实现 LSTM 多变量预测**

```python
import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt

# 1. 数据准备
url = 'https://raw.githubusercontent.com/jbrownlee/Datasets/master/airline-passengers.csv'
df = pd.read_csv(url, parse_dates=['Month'], index_col='Month')
data = df['Passengers'].values.astype(float)

# 2. 归一化（神经网络必做）
scaler = MinMaxScaler(feature_range=(0, 1))
data_scaled = scaler.fit_transform(data.reshape(-1, 1))

# 3. 创建序列数据集：用过去 lookback 步预测下一步
def create_sequences(data, lookback=12):
    X, y = [], []
    for i in range(len(data) - lookback):
        X.append(data[i:i+lookback, 0])
        y.append(data[i+lookback, 0])
    return np.array(X), np.array(y)

lookback = 12
X, y = create_sequences(data_scaled, lookback)

# 4. 划分训练测试集
train_size = int(len(X) * 0.8)
X_train, X_test = X[:train_size], X[train_size:]
y_train, y_test = y[:train_size], y[train_size:]

# 5. 转成 PyTorch 张量并调整维度：(batch, seq_len, feature)
X_train = torch.FloatTensor(X_train).unsqueeze(-1)
y_train = torch.FloatTensor(y_train).unsqueeze(-1)
X_test = torch.FloatTensor(X_test).unsqueeze(-1)
y_test = torch.FloatTensor(y_test).unsqueeze(-1)

# 6. 定义 LSTM 模型
class LSTMModel(nn.Module):
    def __init__(self, input_size=1, hidden_size=50, num_layers=2, output_size=1):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers,
                           batch_first=True, dropout=0.2)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.fc(out[:, -1, :])
        return out

model = LSTMModel()
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# 7. 训练
epochs = 100
for epoch in range(epochs):
    model.train()
    optimizer.zero_grad()
    output = model(X_train)
    loss = criterion(output, y_train)
    loss.backward()
    optimizer.step()
    if (epoch + 1) % 20 == 0:
        print(f'Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.6f}')

# 8. 预测
model.eval()
with torch.no_grad():
    train_pred = model(X_train)
    test_pred = model(X_test)

# 9. 反归一化
train_pred = scaler.inverse_transform(train_pred.numpy())
y_train_actual = scaler.inverse_transform(y_train.numpy())
test_pred = scaler.inverse_transform(test_pred.numpy())
y_test_actual = scaler.inverse_transform(y_test.numpy())

# 10. 评估
test_mae = np.mean(np.abs(y_test_actual - test_pred))
test_rmse = np.sqrt(np.mean((y_test_actual - test_pred) ** 2))
test_mape = np.mean(np.abs((y_test_actual - test_pred) / y_test_actual)) * 100
print(f'\n测试集 MAE: {test_mae:.2f}')
print(f'测试集 RMSE: {test_rmse:.2f}')
print(f'测试集 MAPE: {test_mape:.2f}%')
```

**第四步：学习路线图**

1. 先把 statsmodels 的 ARIMA 和 STL 分解用熟
2. 再用 Prophet 快速跑几个真实业务数据集
3. 然后手写 LSTM/GRU，在公开数据集上和 ARIMA 对比
4. 进阶学 TCN 和 TFT，理解为什么它们效果更好
5. 最后研究异常检测，把孤立森林、AutoEncoder 都跑一遍

## 常见误区

**"深度学习一定比统计方法好" → 大错特错。** 数据量小（<1万条）、模式简单时，ARIMA/Prophet 往往比 LSTM 效果好，还更快更可解释。深度学习不是银弹，先上简单方法 baseline 再说。

**"MAPE 是万能指标" → 小心 y=0 或 y 接近 0 的情况。** 分母为零直接炸，值很小的时候误差会被无限放大。这种场景用 SMAPE 或者直接用 MAE。

**"差分阶数越高越好" → 错。** 差分会损失信息，d=1 绝大多数情况够用，d=2 已经很少见，d≥3 基本是在瞎搞。过度差分会引入伪相关性。

**"直接用原始数据训练 LSTM" → 忘了归一化！** 神经网络对输入尺度非常敏感，不归一化训练会崩。MinMaxScaler 或 StandardScaler 必做，预测完记得反归一化。

**"多步预测就递归到底" → 误差累积会让后面的预测完全不可信。** 预测步数多的时候，优先考虑多输出模型（MIMO）或者直接策略，不要一条路走到黑。

**"Prophet 什么数据都能用" → 它最适合有强季节性+趋势的业务数据。** 纯随机游走、高频金融数据用 Prophet 效果很差，别硬套。

## 学习资源推荐

### 入门级
1. **《时间序列分析与预测实战》**（菜菜老师）：中文入门首选，代码实战多
2. **Hyndman《Forecasting: Principles and Practice》**：在线免费电子书，统计派圣经，讲得极其清晰
3. **Prophet 官方文档**：https://facebook.github.io/prophet/ ，看 Quickstart 就能上手

### 进阶级
4. **《深度学习与时间序列》**（Dive into Deep Learning 时序章节）：DL 方法讲得系统
5. **pytorch-forecasting 文档**：https://pytorch-forecasting.readthedocs.io/ TFT 的最佳入门
6. **TCN 论文**：《An Empirical Evaluation of Generic Convolutional and Recurrent Networks for Sequence Modeling》，看完你就知道为什么 TCN 常比 LSTM 强

### 实战项目
7. **Kaggle Time Series 竞赛**：Store Sales、Energy Forecasting 都是经典练手题
8. **UCR Time Series Archive**：100+ 个时序分类数据集，测算法必备
9. **Monash Time Series Forecasting Archive**：预测方向的基准数据集集合
