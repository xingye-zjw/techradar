---
title: 滤波器设计
category: signals
keywords:
  - filter-design
  - iir
  - fir
  - lowpass
  - highpass
  - bandpass
  - butterworth
  - chebyshev
  - elliptic
  - window-function
  - scipy.signal
  - frequency-response
difficulty: intermediate
duration: 3-5天
summary: 滤波器是从噪声中提取信号的核心工具。理解 IIR 和 FIR 的本质区别，以及如何用 scipy.signal 快速设计出符合规格的滤波器，是你做信号处理的必备技能。
takeaways:
  - 能说清楚 IIR 和 FIR 的根本差异：递归 vs 非递归、阶数 vs 长度、相位特性
  - 能根据指标（通带/阻带频率、纹波）选择合适的滤波器类型（Butterworth/Chebyshev/Elliptic）
  - 能用 scipy.signal 一行代码设计出满足规格的低通/高通/带通滤波器
  - 理解窗函数法设计 FIR 的原理，知道怎么选窗函数
  - 能画出频率响应图，验证滤波器是否满足规格
---

## 为什么你要学它

**滤波器是信号处理的基石。** 无论你是处理音频、提取传感器数据、做生物医学信号（EEG/ECG），还是通信系统中的频谱选择，滤波器都是你对抗噪声、提取目标信息的首选工具。

它的核心价值在于：**让你精确控制信号中哪些频率成分通过，哪些被抑制。** 一个低通滤波器可以让低频信号通过而滤掉高频噪声；一个带通滤波器可以只保留某个频段的有用信息。

不理解滤波器，你就只能对着原始信号干瞪眼；掌握它，你就像拿到了信号世界的手术刀。

## 一句话概览（快速版）

三句话记住滤波器设计：

1. **IIR（无限冲激响应）= 用递归 + 少量阶数实现陡峭截止，但相位非线性**
2. **FIR（有限冲激响应）= 用非递归 + 长卷积实现线性相位，但阶数高**
3. **设计流程：先定规格 → 选类型 → 算系数 → 验证响应**

## 核心拆解

### 🔑 IIR vs FIR：根本区别

| 特性 | IIR | FIR |
|------|-----|-----|
| 结构 | 递归（输出反馈到输入） | 非递归（仅输入参与） |
| 阶数 | 低（几阶到十几阶） | 高（几十到几百阶） |
| 相位 | 非线性 | 线性（可选） |
| 稳定性 | 可能不稳定（需检查） | 始终稳定 |
| 计算效率 | 高（阶数低） | 低（阶数高） |
| 适用场景 | 实时性强、规格宽松 | 相位敏感、规格严格 |

**直觉理解**：IIR 像一个高效的老手，用少量经验（反馈）就能干活，但可能会"跑偏"（不稳定）；FIR 像一个笨拙但可靠的新手，完全靠死记硬背（大量系数）干活，永远不会失控。

### 🔑 IIR 滤波器类型：Butterworth / Chebyshev / Elliptic

这三种都是 IIR 的经典设计方法，区别在于对**通带和阻带纹波**的处理策略：

- **Butterworth（最平坦）**：通带和阻带都没有纹波，但过渡带最缓
- **Chebyshev I**：通带平坦，阻带有纹波，过渡带更陡
- **Chebyshev II（反 Chebyshev）**：阻带平坦，通带有纹波，过渡带更陡
- **Elliptic（Cauer）**：通带和阻带都有纹波，过渡带最陡

```
频率响应对比（低通，阶数相同）：

Butterworth    ▓▓▓▓▓▓▓▓▓░░░░░
Chebyshev      ▓▓▓▓▓▓▓░░░░░░░  （通带有纹波）
Elliptic       ▓▓▓▓▓░░░░░░░░░  （最陡峭）
```

**选择原则**：规格严苛选 Elliptic，规格宽松但要求无纹波选 Butterworth。

### 🔑 FIR 设计方法：窗函数法

FIR 设计的主流方法是**窗函数法**，核心思想：

1. 先确定理想滤波器的频率响应（矩形窗对应的频谱）
2. 用窗函数截断无限长的冲激响应
3. 截断导致频谱泄露，窗函数的选择决定了泄露程度

常见窗函数（按主瓣宽度从窄到宽、旁瓣从高到低）：

| 窗函数 | 主瓣宽度 | 旁瓣衰减 | 适用场景 |
|--------|----------|----------|----------|
| Rectangular | 最窄 | 最低（-13dB） | 频率分辨率优先 |
| Hann | 中等 | 较好（-31dB） | 通用 |
| Hamming | 中等 | 较好（-41dB） | 通用 |
| Blackman | 宽 | 好（-57dB） | 阻带衰减优先 |
| Kaiser | 可调 | 可调 | 需指定阻带衰减 |

### 🔑 滤波器设计步骤

通用流程：

```
1. 定规格：
   - 通带边界频率 (wp)
   - 阻带边界频率 (ws)
   - 通带最大纹波 (Rp, dB)
   - 阻带最小衰减 (Rs, dB)

2. 选类型：
   - 需要线性相位 → FIR
   - 阶数受限、规格宽松 → IIR
   - 规格严苛 → Elliptic IIR 或高阶 FIR

3. 计算阶数和系数：
   - IIR: butter / cheby1 / cheby2 / ellip
   - FIR: firwin / firwin2

4. 验证：
   - freqz 查看频率响应
   - 检查通带/阻带是否满足规格
```

## 完整跑通方案

**第一步：设计一个低通 IIR 滤波器（Butterworth）**

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal

# 规格定义
wp = 0.2    # 通带边界（归一化频率，0-1，1=奈奎斯特）
ws = 0.3    # 阻带边界
Rp = 1      # 通带纹波 (dB)
Rs = 40     # 阻带衰减 (dB)

# 计算最小阶数和自然频率
order, wn = signal.buttord(wp, ws, Rp, Rs)
print(f"所需阶数: {order}")

# 设计滤波器
b, a = signal.butter(order, wn, btype='low')

# 绘制频率响应
w, h = signal.freqz(b, a)
plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.plot(w/np.pi, 20*np.log10(abs(h)))
plt.axvline(wp, color='g', linestyle='--', label='通带边界')
plt.axvline(ws, color='r', linestyle='--', label='阻带边界')
plt.axhline(-Rs, color='r', linestyle=':')
plt.xlabel('归一化频率')
plt.ylabel('幅度 (dB)')
plt.title('Butterworth 低通滤波器频率响应')
plt.grid(True)
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(w/np.pi, np.angle(h))
plt.xlabel('归一化频率')
plt.ylabel('相位 (rad)')
plt.title('相位响应（非线性）')
plt.grid(True)
plt.tight_layout()
plt.show()
```

**第二步：设计一个高通 FIR 滤波器（Hann 窗）**

```python
# 规格定义
cutoff = 0.3   # 截止频率
width = 0.05   # 过渡带宽度
ripple_db = 60 # 阻带衰减 (dB)

# 计算所需阶数（经验公式）
N, beta = signal.kaiserord(ripple_db, width)
print(f"所需阶数: {N}")

# 用firwin设计高通滤波器
b = signal.firwin(N, cutoff, window=('kaiser', beta), pass_zero=False)

# 绘制频率响应
w, h = signal.freqz(b)
plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.plot(w/np.pi, 20*np.log10(abs(h)))
plt.axhline(-ripple_db, color='r', linestyle=':')
plt.xlabel('归一化频率')
plt.ylabel('幅度 (dB)')
plt.title('FIR 高通滤波器频率响应')
plt.grid(True)

plt.subplot(1, 2, 2)
plt.plot(w/np.pi, np.angle(h))
plt.xlabel('归一化频率')
plt.ylabel('相位 (rad)')
plt.title('相位响应（线性）')
plt.grid(True)
plt.tight_layout()
plt.show()
```

**第三步：设计一个带通 FIR 滤波器（多带）**

```python
# 多带设计：低频+高频通过，1kHz-2kHz阻带
bands = [0, 0.1,      # 阻带1
         0.15, 0.25,  # 通带1
         0.3, 0.4,    # 阻带2
         0.45, 0.55,  # 通带2
         0.6, 1.0]    # 阻带3

desired = [0, 0,      # 阻带1幅度
           1, 1,      # 通带1幅度
           0, 0,      # 阻带2幅度
           1, 1,      # 通带2幅度
           0, 0]      # 阻带3幅度

N = 100
b = signal.firwin2(N, bands, desired)
w, h = signal.freqz(b)

plt.figure()
plt.plot(w/np.pi, 20*np.log10(abs(h)))
plt.xlabel('归一化频率')
plt.ylabel('幅度 (dB)')
plt.title('多带 FIR 滤波器')
plt.grid(True)
plt.show()
```

**第四步：用滤波器处理真实信号**

```python
# 生成测试信号：有用低频 + 高频噪声
fs = 1000  # 采样率 Hz
t = np.arange(0, 1, 1/fs)
x = np.sin(2*np.pi*50*t) + 0.5*np.sin(2*np.pi*200*t) + 0.1*np.random.randn(len(t))

# 设计低通滤波器，截止频率 150Hz
b, a = signal.butter(4, 150/(fs/2), btype='low')

# 过滤信号
y = signal.filtfilt(b, a, x)  # filtfilt 零相位滤波

plt.figure()
plt.subplot(2, 1, 1)
plt.plot(t, x, alpha=0.7)
plt.title('原始信号（含噪声）')
plt.subplot(2, 1, 2)
plt.plot(t, y)
plt.title('滤波后信号')
plt.tight_layout()
plt.show()
```

## 常见误区

**"IIR 比 FIR 好，因为阶数低" → 看场景。** IIR 阶数低、计算快，但相位非线性。音频处理可以接受（人耳对相位不敏感），通信系统中相位失真可能是灾难性的。图像处理通常选 FIR 保证线性相位。

**"滤波后信号就干净了" → 先确认噪声在频带上确实和信号分离。** 如果噪声和信号频谱重叠，任何滤波器都无能为力。预处理阶段就要做频谱分析（FFT）。

**"阶数越高滤波器越好" → 错误。** 高阶 IIR 可能不稳定（需要检查极点位置）。FIR 阶数越高计算量越大，延迟越大。设计原则：在满足规格的前提下选最低阶数。

**"归一化频率容易搞错" → 是的，这是最常见的错误。** scipy.signal 中所有函数都用**奈奎斯特频率归一化**（即 0-1）。如果你用 Hz，要记得除以 `fs/2`。

**"忘记检查滤波器稳定性" → IIR 可能不稳定。** 用 `np.roots(a)` 检查极点是否都在单位圆内（|p| < 1）。

```python
# 检查IIR稳定性
z, p, k = signal.tf2zpk(b, a)
print(f"极点: {p}")
print(f"是否稳定: {all(np.abs(p) < 1)}")
```

## 推荐学习顺序

1. 先用上面的代码跑通 IIR 和 FIR 两种设计，建立直观感受
2. 读 SciPy 文档的 `signal` 模块，特别是 `butter / firwin / freqz / filtfilt`
3. 理解**零相位滤波** `filtfilt`：先正向滤波再反向滤波，消除相位偏移
4. 做一个小项目：用滤波器清理一段真实音频或传感器数据
