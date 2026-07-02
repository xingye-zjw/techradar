---
title: 信号与系统基础
category: embedded
difficulty: beginner
duration: 2-3周
summary: 电子、控制、通信的共同基础。理解信号怎么被系统处理、怎么在频域里分析，是所有硬件和通信工程师的必备内功。
takeaways:
  - 搞懂连续信号与离散信号的区别，以及为什么要引入采样
  - 理解 LTI 系统为什么"卷积走天下"——任何 LTI 系统的输出都是输入与冲激响应的卷积
  - 能说出傅里叶、拉普拉斯、Z 变换各自的应用场景和区别
  - 用 Python scipy/numpy 完整实现一个信号-filter-频谱分析的流程
relatedIntel:
  - 052-embedded-c
  - 053-embedded-rtos
  - 054-elec-circuit
relatedNodes: elec-signals
tags:
  - signal
  - system
  - linear-time-invariant
  - laplace-transform
  - z-transform
  - frequency-domain
  - convolution
---

## 为什么你要学它

先讲结论：**信号与系统是电子工程、控制工程、通信工程的"共同语言"——不理解它，你永远只能看懂一半的电路和通信协议。**

无论是你手机里的射频信号、工厂里的传感器数据，还是音频处理中的降噪算法，核心都是一个问题：**"一个信号经过一个系统，会变成什么？"** 信号与系统就是回答这个问题的通用框架。

它的重要性体现在：
- **硬件层**：滤波器设计、放大器稳定性分析、ADC/DAC 采样定理
- **控制系统**：伯德图、奈奎斯特判据、PID 控制器的理论基础
- **通信**：调制解调、信道编码、频分复用/时分复用
- **信号处理**：降噪、特征提取、压缩感知

理解信号与系统后，你再接触任何硬件或通信相关的内容，都会发现背后都有它的影子。

## 一句话概览（快速版）

你只要记住三句话：

1. **信号 = 随时间/空间变化的物理量**，系统对它做某种变换
2. **LTI 系统（线性时不变系统）是核心研究对象**——任何 LTI 系统的输出 = 输入与系统冲激响应的卷积
3. **傅里叶/拉普拉斯/Z 变换是分析工具**——在频域里看信号和系统，很多时域里复杂的问题变得一目了然

## 核心拆解

### 🔑 连续信号 vs 离散信号

**连续信号**：时间连续取值也连续，比如模拟音频、传感器原始数据。用 `x(t)` 表示。

**离散信号**：时间离散（采样点），取值可以连续或离散，比如数字音频、采样后的 ADC 数据。用 `x[n]` 表示。

采样的核心约束是**奈奎斯特采样定理**：采样频率必须大于信号最高频率的 2 倍，否则会发生频谱混叠。

```python
import numpy as np

# 连续信号：模拟一个 5Hz 正弦波
fs = 1000  # 采样率 1000 Hz
t = np.arange(0, 1, 1/fs)  # 1秒，步长 1ms
x_continuous = np.sin(2 * np.pi * 5 * t)  # 5Hz 正弦

# 离散信号：每隔 50 个点采一次（降采样）
x_discrete = x_continuous[::50]  # 等效于 20Hz 采样
t_discrete = t[::50]
```

### 🔑 LTI 系统（线性时不变系统）

**线性**：满足叠加原理——系统对 `a·x1(t) + b·x2(t)` 的响应 = `a·y1(t) + b·y2(t)`

**时不变**：系统参数不随时间变化——输入延迟 τ，输出也延迟 τ

LTI 系统的核心性质：**任何 LTI 系统的输出 = 输入与冲激响应的卷积**

```
y(t) = x(t) * h(t)  （连续）
y[n] = x[n] * h[n]  （离散）
```

`h(t)` 或 `h[n]` 是系统对单位冲激信号 `δ(t)` 或 `δ[n]` 的响应，称为**冲激响应**。

### 🔑 卷积（Convolution）

卷积是 LTI 系统的灵魂操作。直观理解：**当前时刻的输出，是过去所有输入的加权累加，权重由冲激响应决定。**

```python
import numpy as np
from scipy import signal

# 两个离散序列的卷积
x = np.array([1, 2, 3, 4])  # 输入信号
h = np.array([0.5, 1, 0.5])  # 冲激响应（系统特性）

y = np.convolve(x, h, mode='full')  # 完整卷积
print(y)  # [0.5, 2. , 3.5, 5. , 4. , 2. ]

# 用 scipy.signal.lfilter 做线性滤波
b = h  # 分子系数（ FIR 滤波器的系数）
a = [1]  # 分母系数（1 表示纯 FIR，无递归）
y_filtered = signal.lfilter(b, a, x)
```

### 🔑 傅里叶变换（Frequency Domain）

傅里叶变换的核心思想：**任何周期/非周期信号都可以分解为正弦波的叠加。**

- 时域看波形，频域看组成
- 频域分析能揭示时域里看不到的信息（比如噪声的频率分布）
- 卷积在时域里很难算，在频域里变成简单的乘法

```python
import numpy as np
from scipy.fft import fft, fftfreq

# 信号：5Hz + 15Hz 正弦波叠加
fs = 1000
t = np.arange(0, 1, 1/fs)
x = np.sin(2*np.pi*5*t) + 0.5*np.sin(2*np.pi*15*t)

# FFT
N = len(x)
yf = fft(x)
xf = fftfreq(N, 1/fs)

# 只看正频率部分
pos_mask = xf >= 0
print("频率:", xf[pos_mask][:10])
print("幅值:", np.abs(yf[pos_mask])[:10])
```

### 🔑 拉普拉斯变换（Continuous System Analysis）

拉普拉斯变换是傅里叶变换的推广，引入复频率 `s = σ + jω`。

**为什么需要它？**
- 傅里叶变换要求信号绝对可积（收敛），很多实际信号（如增长信号）不满足
- 拉普拉斯变换通过 `e^(-σt)` 因子强制收敛

**核心用途**：分析连续 LTI 系统的稳定性、求解微分方程

传递函数 `H(s) = Y(s)/X(s)` 是系统分析的核心。

### 🔑 Z 变换（Discrete System Analysis）

Z 变换是拉普拉斯变换的离散版本，是离散信号与系统的分析工具。

`Z{ x[n] } = Σ x[n] · z^(-n)`，其中 `z = e^(sT)`，T 是采样周期。

**核心用途**：
- 分析离散系统的稳定性（单位圆内 vs 单位圆外）
- 设计数字滤波器（IIR/FIR）
- 求解差分方程

## 完整跑通方案

**第一步：生成测试信号并做频谱分析**

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.fft import fft, fftfreq

# 生成复合信号：直流 + 5Hz + 20Hz
fs = 500  # 采样率 500 Hz
t = np.arange(0, 1, 1/fs)
x = 2 + np.sin(2*np.pi*5*t) + 0.3*np.sin(2*np.pi*20*t)

# 加上高斯白噪声
noise = np.random.normal(0, 0.1, len(x))
x_noisy = x + noise

# FFT 分析
N = len(x_noisy)
yf = fft(x_noisy)
xf = fftfreq(N, 1/fs)

# 绘制频谱（只看正频率）
plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.plot(t, x_noisy)
plt.title('时域信号（带噪声）')
plt.xlabel('时间 (s)')

plt.subplot(1, 2, 2)
plt.stem(xf[:N//2]*2*np.pi, np.abs(yf)[:N//2]*2/N, linefmt='b-', markerfmt='bo', basefmt='r-')
plt.title('频域幅度谱')
plt.xlabel('角频率 (rad/s)')
plt.tight_layout()
plt.show()
```

**第二步：设计一个低通滤波器并滤波**

```python
from scipy.signal import butter, lfilter, freqz

# 设计 Butterworth 低通滤波器
cutoff = 10  # 截止频率 10 Hz
order = 4
b, a = butter(order, cutoff / (fs/2), btype='low')

# 查看频率响应
w, h = freqz(b, a, worN=2000)
plt.plot(0.5*fs*w/np.pi, np.abs(h), 'b')
plt.title('低通滤波器频率响应')
plt.xlabel('频率 (Hz)')
plt.grid()
plt.show()

# 应用滤波器
x_filtered = lfilter(b, a, x_noisy)

plt.plot(t, x_filtered, label='滤波后')
plt.plot(t, x, 'r--', label='原始（无噪声）', alpha=0.7)
plt.legend()
plt.title('滤波效果对比')
plt.show()
```

**第三步：验证 LTI 系统的卷积性质**

```python
from scipy.signal import convolve

# 系统冲激响应（一个简单的指数衰减）
n = np.arange(0, 50)
h = np.exp(-0.1 * n)

# 输入信号
x = np.concatenate([np.ones(20), np.zeros(30)])

# 两种方式计算输出：卷积 vs lfilter
y_conv = np.convolve(x, h, mode='full')[:len(x)+len(h)-1]
y_lfilter = lfilter(h, [1], x)  # 等效于卷积，因为这里是 FIR

# 绘制对比
plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.stem(h)
plt.title('系统冲激响应 h[n]')
plt.xlabel('n')

plt.subplot(1, 2, 2)
plt.plot(y_conv, label='convolve', alpha=0.7)
plt.plot(y_lfilter, '--', label='lfilter', alpha=0.7)
plt.title('系统输出 y[n] = x[n] * h[n]')
plt.legend()
plt.tight_layout()
plt.show()
```

**第四步：用 Z 变换分析离散系统极点（可选进阶）**

```python
from scipy.signal import tf2zpk

# 一个 IIR 滤波器的系数
b = [0.05, 0.1, 0.05]  # 分子
a = [1, -0.5, 0.25]    # 分母

# 转换为极点-零点形式
z, p, k = tf2zpk(b, a)

print("零点:", z)
print("极点:", p)
print("增益:", k)

# 极点在单位圆内 → 系统稳定
print("系统稳定:", np.all(np.abs(p) < 1))
```

## 常见误区

**"卷积只是数学运算，跟实际系统没关系" → 完全错误**。卷积是 LTI 系统的物理本质——任何线性时不变电路、滤波器、控制系统的输出都可以用卷积来描述。电路中的 RC 滤波、RLC 谐振，都是卷积。

**"FFT 就能解决所有频谱分析问题" → 不对**。FFT 假设信号是有限长的、采样的。对于非平稳信号（频率随时间变化），需要用短时傅里叶变换（STFT）或小波变换。对于非周期信号，要用傅里叶积分（连续傅里叶变换）。

**"数字滤波器比模拟滤波器好" → 看场景**。数字滤波器精度高、可重构、不漂移，但有采样延迟、受量化误差影响。模拟滤波器没有这些问题，适合高频（GHz 级）场景。

**"采样率越高越好" → 成本和计算量的权衡**。采样率翻倍意味着数据量翻倍、计算量翻倍。根据奈奎斯特准则，采样率 ≥ 2×信号最高频率就够了。

**"拉普拉斯变换和 Z 变换是一回事" → 类比而已，有本质区别**。拉普拉斯处理连续信号和系统，Z 变换处理离散信号和系统。连续系统的极点分布在 s 平面（左半平面稳定），离散系统的极点在 z 平面（单位圆内稳定）。

## 推荐学习顺序

1. 先理解连续信号与离散信号的区别，动手用 Python 生成几种典型信号（正弦、方波、脉冲）
2. 学卷积——用 Python 的 `np.convolve` 亲手算几个例子，体会"加权叠加"的物理含义
3. 学 FFT——对已知组成的信号做频谱分析，验证能否还原出原始频率成分
4. 学拉普拉斯变换的物理意义（极点分布 → 系统行为），用 scipy 分析简单 RLC 电路
5. 学 Z 变换——设计一个简单 IIR 滤波器，观察极点和滤波器特性的关系
6. 最后做一个小项目：用 Python 实时处理一段音频，实现低通滤波和频谱显示
