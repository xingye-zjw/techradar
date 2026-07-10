---
title: 数字信号处理
category: embedded
difficulty: intermediate
duration: 3-4周
summary: 理解数字信号处理的核心原理。掌握FFT、数字滤波器设计、采样定理等关键技能。
takeaways: "- 理解采样定理和量化
  - 掌握DFT和FFT算法
  - 理解IIR和FIR滤波器设计
  - 能用Python实现信号处理"
relatedIntel: "- 052-embedded-c
  - 053-embedded-rtos
  - 054-elec-circuit"
tags: "- dsp
  - 数字信号处理
  - fft
  - 数字滤波器
  - 采样定理
  - dft
  - iir
  - fir
  - 多采样率
  - 量化"
relatedTerms: ["data-structure", "rtos", "algorithm", "complexity"]
relatedTools: ["huggingface-transformers", "ultralytics-yolo", "pytorch"]
relatedNodes: ["roadmap-capstone", "electrical-safety"]
---

## 为什么你要学它

**数字信号处理（DSP）是现代电子系统的核心引擎。** 从你手机里的语音通话、降噪耳机，到医疗设备的心电图分析、雷达的目标检测，再到5G通信的调制解调——所有这些都依赖DSP技术。

它的核心价值在于：**让计算机能够"理解"和处理现实世界的模拟信号。** 现实世界是连续的模拟信号，但计算机只能处理离散的数字。DSP就是连接这两个世界的桥梁，让你能够用算法对信号进行滤波、变换、压缩、识别。

学习DSP，你将掌握：

- **音频处理**：降噪、回声消除、音乐合成
- **图像处理**：边缘检测、图像压缩、特征提取
- **通信系统**：调制解调、信道编码、同步
- **生物医学**：心电分析、脑电处理、医学成像
- **雷达与声呐**：目标检测、多普勒处理、波束形成

## 一句话概览（快速版）

三句话记住DSP核心：

1. **采样定理是DSP的基石**：采样率必须 ≥ 信号最高频率的2倍，否则信息丢失
2. **FFT是DSP的引擎**：将时域信号转换为频域，让复杂计算变成简单乘法
3. **数字滤波器是DSP的手术刀**：精确控制哪些频率通过、哪些被抑制

## 核心拆解

### 🔑 采样与量化

**采样（Sampling）**：将连续时间信号转换为离散时间信号。核心定理是**奈奎斯特采样定理**。

```
采样定理：fs ≥ 2 × fmax
fs = 采样频率
fmax = 信号最高频率
```

如果违反采样定理，会发生**频谱混叠（Aliasing）**——高频信号被错误地"折叠"到低频，无法恢复。

```python
import numpy as np
import matplotlib.pyplot as plt

# 演示采样定理和混叠
f_signal = 5  # 信号频率 5Hz
fs_adequate = 50  # 足够采样率
fs_inadequate = 6  # 不足采样率（< 2×5Hz）

t_continuous = np.linspace(0, 1, 1000)
x_continuous = np.sin(2 * np.pi * f_signal * t_continuous)

# 足够采样
t_adequate = np.arange(0, 1, 1/fs_adequate)
x_adequate = np.sin(2 * np.pi * f_signal * t_adequate)

# 不足采样（混叠）
t_inadequate = np.arange(0, 1, 1/fs_inadequate)
x_inadequate = np.sin(2 * np.pi * f_signal * t_inadequate)

plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(t_continuous, x_continuous, 'b-', label='原始信号', alpha=0.5)
plt.stem(t_adequate, x_adequate, 'g', basefmt=' ', label=f'采样 fs={fs_adequate}Hz')
plt.title('正确采样（满足奈奎斯特）')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(t_continuous, x_continuous, 'b-', label='原始信号', alpha=0.5)
plt.stem(t_inadequate, x_inadequate, 'r', basefmt=' ', label=f'采样 fs={fs_inadequate}Hz')
plt.title('欠采样（混叠）')
plt.legend()
plt.tight_layout()
plt.show()
```

**量化（Quantization）**：将连续幅值转换为离散幅值。量化会引入**量化误差**，表现为量化噪声。

```python
# 演示量化
def quantize(signal, bits):
    """将信号量化为指定位数"""
    levels = 2 ** bits
    max_val = np.max(np.abs(signal))
    normalized = signal / max_val  # 归一化到 [-1, 1]
    quantized = np.round((normalized + 1) * (levels - 1) / 2) / ((levels - 1) / 2) - 1
    return quantized * max_val

# 原始信号
t = np.linspace(0, 1, 1000)
x = np.sin(2 * np.pi * 5 * t)

# 不同位数的量化
x_8bit = quantize(x, 8)
x_4bit = quantize(x, 4)
x_2bit = quantize(x, 2)

plt.figure(figsize=(12, 6))
plt.subplot(2, 2, 1)
plt.plot(t, x)
plt.title('原始信号')

for i, (bits, signal_q) in enumerate([(8, x_8bit), (4, x_4bit), (2, x_2bit)]):
    plt.subplot(2, 2, i+2)
    plt.plot(t, x, 'b-', alpha=0.5, label='原始')
    plt.plot(t, signal_q, 'r-', label=f'{bits}bit量化')
    plt.title(f'{bits}位量化')
    plt.legend()

plt.tight_layout()
plt.show()

# 计算量化信噪比
def snr(original, quantized):
    """计算信噪比 (dB)"""
    noise = original - quantized
    signal_power = np.mean(original ** 2)
    noise_power = np.mean(noise ** 2)
    return 10 * np.log10(signal_power / noise_power)

print(f"8位量化 SNR: {snr(x, x_8bit):.2f} dB")
print(f"4位量化 SNR: {snr(x, x_4bit):.2f} dB")
print(f"2位量化 SNR: {snr(x, x_2bit):.2f} dB")
```

### 🔑 DFT与FFT

**离散傅里叶变换（DFT）**：将离散时域信号转换为离散频域信号。

```
X[k] = Σ(n=0 to N-1) x[n] · e^(-j·2π·k·n/N)
```

**快速傅里叶变换（FFT）**：DFT的快速算法，将复杂度从O(N²)降低到O(N·logN)。

```python
import numpy as np
from scipy.fft import fft, fftfreq, ifft
import matplotlib.pyplot as plt

# 生成复合信号
fs = 1000  # 采样率
t = np.arange(0, 1, 1/fs)
f1, f2, f3 = 50, 120, 300  # 三个频率成分
x = np.sin(2*np.pi*f1*t) + 0.5*np.sin(2*np.pi*f2*t) + 0.3*np.sin(2*np.pi*f3*t)

# 加噪声
x_noisy = x + 0.5 * np.random.randn(len(x))

# FFT分析
N = len(x_noisy)
X = fft(x_noisy)  # 频域表示
freqs = fftfreq(N, 1/fs)  # 频率轴

# 绘制时域和频域
plt.figure(figsize=(12, 6))
plt.subplot(2, 1, 1)
plt.plot(t[:200], x_noisy[:200])
plt.title('时域信号（前0.2秒）')
plt.xlabel('时间 (s)')

plt.subplot(2, 1, 2)
plt.stem(freqs[:N//2], np.abs(X[:N//2])*2/N, basefmt=' ')
plt.title('频域幅度谱')
plt.xlabel('频率 (Hz)')
plt.xlim(0, 400)
plt.tight_layout()
plt.show()

# 验证：IFFT恢复原信号
x_recovered = ifft(X)
print(f"恢复误差: {np.max(np.abs(x_noisy - x_recovered)):.2e}")
```

**FFT的重要应用：频谱分析与滤波**

```python
# 在频域进行滤波
def frequency_domain_filter(signal, fs, cutoff_low, cutoff_high):
    """频域带通滤波"""
    N = len(signal)
    X = fft(signal)
    freqs = fftfreq(N, 1/fs)

    # 创建带通滤波器
    mask = (np.abs(freqs) >= cutoff_low) & (np.abs(freqs) <= cutoff_high)
    X_filtered = X * mask

    # 逆变换回时域
    return np.real(ifft(X_filtered))

# 应用：只保留 50Hz 附近的频率
x_filtered = frequency_domain_filter(x_noisy, fs, 40, 60)

plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(t[:200], x_noisy[:200], alpha=0.5, label='原始')
plt.plot(t[:200], x_filtered[:200], label='滤波后')
plt.title('时域对比')
plt.legend()

plt.subplot(1, 2, 2)
plt.stem(freqs[:N//2], np.abs(fft(x_filtered))[:N//2]*2/N, basefmt=' ')
plt.xlim(0, 400)
plt.title('滤波后频谱')
plt.tight_layout()
plt.show()
```

### 🔑 数字滤波器

数字滤波器分为两大类：**IIR（无限冲激响应）** 和 **FIR（有限冲激响应）**。

**IIR滤波器**：递归结构，输出依赖于当前和过去输入以及过去输出。

```python
from scipy import signal

# 设计Butterworth低通滤波器
fs = 1000
cutoff = 100  # 截止频率 100Hz
order = 4

b, a = signal.butter(order, cutoff/(fs/2), btype='low')

# 频率响应
w, h = signal.freqz(b, a)

plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.plot(w/np.pi * fs/2, 20*np.log10(np.abs(h)))
plt.axvline(cutoff, color='r', linestyle='--', label=f'截止频率 {cutoff}Hz')
plt.xlabel('频率 (Hz)')
plt.ylabel('幅度 (dB)')
plt.title('IIR低通滤波器频率响应')
plt.legend()
plt.grid()

# 应用滤波器
t = np.arange(0, 1, 1/fs)
x = np.sin(2*np.pi*50*t) + 0.5*np.sin(2*np.pi*200*t)  # 50Hz + 200Hz
y = signal.lfilter(b, a, x)

plt.subplot(1, 2, 2)
plt.plot(t[:200], x[:200], alpha=0.5, label='原始')
plt.plot(t[:200], y[:200], label='滤波后')
plt.title('IIR滤波效果')
plt.legend()
plt.tight_layout()
plt.show()
```

**FIR滤波器**：非递归结构，输出仅依赖于当前和过去输入。

```python
# 设计FIR低通滤波器（窗函数法）
numtaps = 101  # 滤波器阶数
cutoff = 100

b_fir = signal.firwin(numtaps, cutoff/(fs/2))

# 频率响应
w_fir, h_fir = signal.freqz(b_fir)

plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.plot(w_fir/np.pi * fs/2, 20*np.log10(np.abs(h_fir)))
plt.axvline(cutoff, color='r', linestyle='--', label=f'截止频率 {cutoff}Hz')
plt.xlabel('频率 (Hz)')
plt.ylabel('幅度 (dB)')
plt.title('FIR低通滤波器频率响应')
plt.legend()
plt.grid()

# 应用滤波器
y_fir = signal.lfilter(b_fir, [1], x)

plt.subplot(1, 2, 2)
plt.plot(t[:200], x[:200], alpha=0.5, label='原始')
plt.plot(t[:200], y_fir[:200], label='FIR滤波后')
plt.title('FIR滤波效果')
plt.legend()
plt.tight_layout()
plt.show()
```

**IIR vs FIR对比**：

| 特性   | IIR            | FIR              |
| ------ | -------------- | ---------------- |
| 结构   | 递归（有反馈） | 非递归（无反馈） |
| 阶数   | 低（效率高）   | 高（计算量大）   |
| 稳定性 | 可能不稳定     | 始终稳定         |
| 相位   | 非线性         | 可以线性         |
| 适用   | 实时性要求高   | 相位敏感场景     |

### 🔑 多采样率处理

多采样率处理包括**上采样（插值）**和**下采样（抽取）**，用于改变信号的采样率。

```python
# 下采样（抽取）
def downsample(signal, factor):
    """下采样：每隔factor取一个样本"""
    return signal[::factor]

# 上采样（插值）
def upsample(signal, factor):
    """上采样：在样本间插入factor-1个零"""
    upsampled = np.zeros(len(signal) * factor)
    upsampled[::factor] = signal
    return upsampled

# 演示
fs = 1000
t = np.arange(0, 1, 1/fs)
x = np.sin(2*np.pi*50*t)

# 下采样
downsample_factor = 4
x_down = downsample(x, downsample_factor)
fs_down = fs // downsample_factor

# 上采样后用低通滤波器插值
x_up = upsample(x_down, downsample_factor)
# 插值滤波器
b_interp = signal.firwin(31, 1/downsample_factor)
x_interpolated = signal.lfilter(b_interp, [1], x_up)

plt.figure(figsize=(12, 6))
plt.subplot(3, 1, 1)
plt.plot(t[:200], x[:200])
plt.title(f'原始信号 fs={fs}Hz')

plt.subplot(3, 1, 2)
plt.stem(np.arange(len(x_down[:50]))/fs_down, x_down[:50], basefmt=' ')
plt.title(f'下采样后 fs={fs_down}Hz')

plt.subplot(3, 1, 3)
plt.plot(t[:200], x_interpolated[:200])
plt.title('插值恢复')
plt.tight_layout()
plt.show()
```

### 🔑 应用实例

**实例1：音频降噪**

```python
def audio_denoise_demo():
    """音频降噪演示"""
    fs = 8000
    t = np.arange(0, 2, 1/fs)

    # 模拟语音信号（基频+谐波）
    fundamental = 200
    voice = np.sin(2*np.pi*fundamental*t)
    for harmonic in range(2, 6):
        voice += 0.5/harmonic * np.sin(2*np.pi*fundamental*harmonic*t)

    # 添加高频噪声
    noise = 0.3 * np.random.randn(len(t))
    noise += 0.2 * np.sin(2*np.pi*3000*t)  # 3kHz干扰

    noisy_audio = voice + noise

    # 设计低通滤波器（保留语音，去除高频噪声）
    b, a = signal.butter(6, 1000/(fs/2), btype='low')
    clean_audio = signal.filtfilt(b, a, noisy_audio)

    # 绘制结果
    plt.figure(figsize=(12, 8))

    plt.subplot(3, 2, 1)
    plt.plot(t[:1000], voice[:1000])
    plt.title('原始语音信号')

    plt.subplot(3, 2, 2)
    plt.plot(t[:1000], noisy_audio[:1000])
    plt.title('带噪声信号')

    plt.subplot(3, 2, 3)
    plt.plot(t[:1000], clean_audio[:1000])
    plt.title('降噪后信号')

    # 频谱对比
    plt.subplot(3, 2, 4)
    freqs = fftfreq(len(t), 1/fs)
    plt.semilogy(freqs[:len(t)//2], np.abs(fft(noisy_audio))[:len(t)//2])
    plt.xlim(0, 4000)
    plt.title('噪声信号频谱')

    plt.subplot(3, 2, 5)
    plt.semilogy(freqs[:len(t)//2], np.abs(fft(clean_audio))[:len(t)//2])
    plt.xlim(0, 4000)
    plt.title('降噪后频谱')

    plt.tight_layout()
    plt.show()

audio_denoise_demo()
```

**实例2：ECG信号处理**

```python
def ecg_processing_demo():
    """ECG信号处理演示"""
    # 模拟ECG信号
    fs = 360
    t = np.arange(0, 5, 1/fs)

    # 简化的ECG波形（R波）
    ecg = np.zeros(len(t))
    for beat in range(5):
        idx = int(beat * fs * 0.8)  # 每分钟75次心跳
        if idx < len(t) - 50:
            # R波
            ecg[idx:idx+10] = np.exp(-((np.arange(10)-5)**2)/2) * 1.0
            # Q波
            if idx > 10:
                ecg[idx-10:idx-5] = -0.1 * np.exp(-((np.arange(5)-2)**2)/2)
            # S波
            ecg[idx+10:idx+15] = -0.2 * np.exp(-((np.arange(5)-2)**2)/2)

    # 添加基线漂移和噪声
    baseline = 0.1 * np.sin(2*np.pi*0.15*t)  # 基线漂移
    noise = 0.05 * np.random.randn(len(t))  # 高频噪声
    ecg_noisy = ecg + baseline + noise

    # 处理步骤1：去除基线漂移（高通滤波）
    b_hp, a_hp = signal.butter(2, 0.5/(fs/2), btype='high')
    ecg_detrend = signal.filtfilt(b_hp, a_hp, ecg_noisy)

    # 处理步骤2：去除高频噪声（低通滤波）
    b_lp, a_lp = signal.butter(2, 40/(fs/2), btype='low')
    ecg_clean = signal.filtfilt(b_lp, a_lp, ecg_detrend)

    # 绘制
    plt.figure(figsize=(12, 6))
    plt.subplot(3, 1, 1)
    plt.plot(t, ecg_noisy)
    plt.title('原始ECG（含基线漂移和噪声）')

    plt.subplot(3, 1, 2)
    plt.plot(t, ecg_detrend)
    plt.title('去除基线漂移后')

    plt.subplot(3, 1, 3)
    plt.plot(t, ecg_clean)
    plt.title('最终处理结果')
    plt.tight_layout()
    plt.show()

ecg_processing_demo()
```

## 完整跑通方案

**第一步：信号生成与采样分析**

```python
import numpy as np
from scipy import signal
from scipy.fft import fft, fftfreq, ifft
import matplotlib.pyplot as plt

# 设置参数
fs = 1000  # 采样率
duration = 2  # 信号时长
t = np.arange(0, duration, 1/fs)

# 生成复合信号
f_components = [10, 25, 50, 100]  # 频率成分
amplitudes = [1.0, 0.7, 0.5, 0.3]

x = np.zeros(len(t))
for f, a in zip(f_components, amplitudes):
    x += a * np.sin(2*np.pi*f*t)

# 添加噪声
noise_power = 0.1
x_noisy = x + noise_power * np.random.randn(len(x))

print(f"信号长度: {len(x)} 样本")
print(f"采样率: {fs} Hz")
print(f"奈奎斯特频率: {fs/2} Hz")
print(f"频率分辨率: {fs/len(x):.2f} Hz")
```

**第二步：频谱分析**

```python
# FFT分析
N = len(x_noisy)
X = fft(x_noisy)
freqs = fftfreq(N, 1/fs)

# 只取正频率部分
pos_freqs = freqs[:N//2]
pos_magnitude = np.abs(X[:N//2]) * 2 / N

# 绘制频谱
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(t[:500], x_noisy[:500])
plt.title('时域信号')
plt.xlabel('时间 (s)')

plt.subplot(1, 2, 2)
plt.stem(pos_freqs[:100], pos_magnitude[:100], basefmt=' ')
plt.title('频域幅度谱')
plt.xlabel('频率 (Hz)')
plt.tight_layout()
plt.show()

# 检测主要频率成分
peaks, _ = signal.find_peaks(pos_magnitude, height=0.1)
detected_freqs = pos_freqs[peaks]
print(f"检测到的频率成分: {detected_freqs[:len(f_components)]} Hz")
```

**第三步：设计并应用数字滤波器**

```python
# 设计带通滤波器（保留20-80Hz）
band_low, band_high = 20, 80
order = 4

b, a = signal.butter(order, [band_low/(fs/2), band_high/(fs/2)], btype='band')

# 查看频率响应
w, h = signal.freqz(b, a, worN=2000)
freq_hz = w / np.pi * fs / 2

plt.figure(figsize=(10, 4))
plt.plot(freq_hz, 20*np.log10(np.abs(h)))
plt.axvline(band_low, color='r', linestyle='--', label=f'通带下限 {band_low}Hz')
plt.axvline(band_high, color='r', linestyle='--', label=f'通带上限 {band_high}Hz')
plt.xlabel('频率 (Hz)')
plt.ylabel('幅度 (dB)')
plt.title('带通滤波器频率响应')
plt.legend()
plt.grid()
plt.show()

# 应用滤波器（使用filtfilt实现零相位滤波）
x_filtered = signal.filtfilt(b, a, x_noisy)

# 对比结果
plt.figure(figsize=(12, 6))
plt.subplot(2, 1, 1)
plt.plot(t[:500], x_noisy[:500], alpha=0.5, label='原始信号')
plt.plot(t[:500], x_filtered[:500], label='滤波后')
plt.title('时域对比')
plt.legend()

plt.subplot(2, 1, 2)
X_filtered = fft(x_filtered)
plt.stem(pos_freqs[:100], np.abs(X_filtered[:N//2])*2/N, basefmt=' ', label='滤波后')
plt.stem(pos_freqs[:100], pos_magnitude[:100], basefmt=' ', alpha=0.3, label='原始')
plt.title('频域对比')
plt.legend()
plt.tight_layout()
plt.show()
```

**第四步：信号重构与验证**

```python
# 计算信噪比改善
def calculate_snr(clean, noisy):
    """计算信噪比"""
    noise = noisy - clean
    signal_power = np.mean(clean**2)
    noise_power = np.mean(noise**2)
    if noise_power == 0:
        return float('inf')
    return 10 * np.log10(signal_power / noise_power)

snr_before = calculate_snr(x, x_noisy - x)
snr_after = calculate_snr(x, x_filtered - x)

print(f"滤波前 SNR: {snr_before:.2f} dB")
print(f"滤波后 SNR: {snr_after:.2f} dB")
print(f"SNR 改善: {snr_after - snr_before:.2f} dB")

# 检查滤波器稳定性
z, p, k = signal.tf2zpk(b, a)
is_stable = all(np.abs(p) < 1)
print(f"滤波器稳定性: {'稳定' if is_stable else '不稳定'}")
print(f"极点模值: {np.abs(p)}")
```

## 常见误区

**"采样率越高越好" → 错误。** 采样率翻倍意味着数据量翻倍、存储和计算成本翻倍。根据奈奎斯特准则，采样率略高于信号最高频率的2倍即可。过采样有其应用场景（如抗混叠），但不是越高越好。

**"FFT能解决所有频谱分析问题" → 不对。** FFT假设信号是平稳的（频率不随时间变化）。对于非平稳信号（如语音、音乐），需要用短时傅里叶变换（STFT）或小波变换。FFT还有频率分辨率限制，受信号时长影响。

**"数字滤波器比模拟滤波器好" → 看场景。** 数字滤波器精度高、可重构、不漂移，但存在量化误差和采样延迟。模拟滤波器适合高频（GHz级）场景，且没有延迟问题。实际系统通常两者结合使用。

**"IIR滤波器不稳定就不能用" → 可以用，但需要检查。** 用`tf2zpk`检查极点位置，确保都在单位圆内。设计时避免过高阶数，使用级联结构（`sos`格式）提高数值稳定性。

**"滤波后信号就完美了" → 不现实。** 如果噪声和信号频谱重叠，任何滤波器都无法完美分离。滤波是权衡，需要在信号保真度和噪声抑制之间取舍。

## 推荐学习顺序

1. **第一周：采样与量化**
   - 理解奈奎斯特采样定理
   - 用Python演示混叠现象
   - 理解量化误差和位深

2. **第二周：DFT与FFT**
   - 理解DFT的数学定义
   - 用FFT分析复合信号的频谱
   - 实践频域滤波

3. **第三周：数字滤波器设计**
   - 对比IIR和FIR的优缺点
   - 用scipy.signal设计各种滤波器
   - 理解滤波器稳定性

4. **第四周：综合应用**
   - 实现音频降噪
   - 处理ECG或传感器信号
   - 完成一个小项目

## 学习资源推荐

**经典教材**

- 《数字信号处理》（Oppenheim & Schafer）- DSP领域的圣经
- 《离散时间信号处理》- 理论深度足够
- 《理解数字信号处理》（Lyons）- 工程师友好，直观易懂

**在线课程**

- MIT OpenCourseWare: Digital Signal Processing
- Coursera: DSP for Software Radio
- YouTube: 3Blue1Brown 傅里叶变换可视化

**实践资源**

- SciPy Signal Processing Documentation
- DSP Guide (dspguide.com) - 免费在线教程
- MATLAB Signal Processing Toolbox Examples

**进阶方向**

- 多采样率信号处理
- 自适应滤波
- 小波变换
- 数字图像处理
- 通信信号处理
