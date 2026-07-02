---
title: 信号与系统
category: embedded
difficulty: intermediate
duration: 3周
summary: 掌握信号分析与系统响应的核心概念，理解傅里叶变换、拉普拉斯变换在信号处理中的应用
takeaways:
  - 理解信号分类与性质
  - 掌握傅里叶分析方法
  - 理解系统频率响应特性
  - 能设计数字滤波器
relatedIntel:
  - 052-embedded-c
  - 053-embedded-rtos
  - 054-elec-circuit
relatedNodes: elec-signals
tags:
  - signal
  - fourier
  - laplace
  - filter
  - sampling
  - z-transform
  - dsp
---

## 为什么你要学它

信号与系统是通信、控制和电子工程的理论基础。在AI时代：

- **语音处理**：语音识别、合成、降噪都基于信号处理
- **图像处理**：图像滤波、边缘检测、频域分析
- **通信系统**：调制解调、信道编码、OFDM
- **传感器信号**：滤波、特征提取、异常检测

如果你不理解信号的频域表示，就无法设计有效的滤波器和特征提取算法。

## 一句话概览（快速版）

- **时域看波形**：信号随时间变化的幅度
- **频域看成分**：信号包含哪些频率分量
- **傅里叶变换是桥梁**：时域和频域之间的转换工具
- **采样要满足奈奎斯特准则**：采样频率≥2倍最高频率

## 核心拆解

### 🔑 傅里叶变换

```python
import numpy as np
import matplotlib.pyplot as plt

# 离散傅里叶变换（DFT）和快速傅里叶变换（FFT）

# 生成测试信号：包含10Hz和25Hz两个频率成分
fs = 1000  # 采样频率1000Hz
t = np.arange(0, 1, 1/fs)  # 1秒时间
f1, f2 = 10, 25  # 信号频率

# 合成信号
signal = np.sin(2 * np.pi * f1 * t) + 0.5 * np.sin(2 * np.pi * f2 * t)

# 添加噪声
signal_noisy = signal + 0.3 * np.random.randn(len(t))

# FFT分析
N = len(signal)
fft_result = np.fft.fft(signal_noisy)
freqs = np.fft.fftfreq(N, 1/fs)

# 取正频率部分
positive_freqs = freqs[:N//2]
magnitude = np.abs(fft_result[:N//2]) / N * 2

# 绘制结果
plt.figure(figsize=(12, 8))

plt.subplot(3, 1, 1)
plt.plot(t[:200], signal_noisy[:200])
plt.xlabel('Time (s)')
plt.ylabel('Amplitude')
plt.title('Noisy Signal (Time Domain)')
plt.grid(True)

plt.subplot(3, 1, 2)
plt.plot(positive_freqs, magnitude)
plt.xlabel('Frequency (Hz)')
plt.ylabel('Magnitude')
plt.title('Frequency Spectrum (FFT)')
plt.xlim(0, 50)
plt.grid(True)

# 找到峰值频率
peaks_idx = np.where(magnitude > 0.3)[0]
peak_freqs = positive_freqs[peaks_idx]
print(f"Detected frequencies: {peak_freqs} Hz")

plt.tight_layout()
plt.savefig('fft_analysis.png')
```

### 🔑 滤波器设计

```python
from scipy import signal as sig
import numpy as np
import matplotlib.pyplot as plt

# 设计数字滤波器

# 1. FIR低通滤波器（窗函数法）
def design_fir_lowpass(cutoff, fs, numtaps=101):
    """
    设计FIR低通滤波器
    cutoff: 截止频率
    fs: 采样频率
    numtaps: 滤波器阶数+1
    """
    nyquist = fs / 2
    normalized_cutoff = cutoff / nyquist
    taps = sig.firwin(numtaps, normalized_cutoff)
    return taps

# 2. IIR巴特沃斯低通滤波器
def design_butterworth_lowpass(cutoff, fs, order=4):
    """
    设计巴特沃斯低通滤波器
    """
    nyquist = fs / 2
    normalized_cutoff = cutoff / nyquist
    b, a = sig.butter(order, normalized_cutoff, btype='low')
    return b, a

# 3. 带通滤波器
def design_bandpass(lowcut, highcut, fs, order=4):
    """
    设计带通滤波器
    """
    nyquist = fs / 2
    low = lowcut / nyquist
    high = highcut / nyquist
    b, a = sig.butter(order, [low, high], btype='band')
    return b, a

# 示例：设计并应用滤波器
fs = 1000
t = np.arange(0, 2, 1/fs)

# 合成信号：10Hz + 50Hz + 100Hz
signal = (np.sin(2*np.pi*10*t) + 
          0.5*np.sin(2*np.pi*50*t) + 
          0.3*np.sin(2*np.pi*100*t))

# 添加高频噪声
signal_noisy = signal + 0.5*np.sin(2*np.pi*200*t) + 0.2*np.random.randn(len(t))

# 设计30Hz低通滤波器
b, a = design_butterworth_lowpass(30, fs, order=6)

# 应用滤波器
filtered_signal = sig.filtfilt(b, a, signal_noisy)

# 绘制结果
plt.figure(figsize=(12, 8))

plt.subplot(3, 1, 1)
plt.plot(t[:500], signal[:500])
plt.title('Original Signal')
plt.xlabel('Time (s)')
plt.grid(True)

plt.subplot(3, 1, 2)
plt.plot(t[:500], signal_noisy[:500])
plt.title('Noisy Signal')
plt.xlabel('Time (s)')
plt.grid(True)

plt.subplot(3, 1, 3)
plt.plot(t[:500], filtered_signal[:500])
plt.title('Filtered Signal (Lowpass 30Hz)')
plt.xlabel('Time (s)')
plt.grid(True)

plt.tight_layout()
plt.savefig('filter_comparison.png')

# 绘制滤波器频率响应
w, h = sig.freqz(b, a, worN=8000)
plt.figure(figsize=(10, 4))
plt.plot(w/np.pi * fs/2, 20*np.log10(np.abs(h)))
plt.axvline(30, color='r', linestyle='--', label='Cutoff: 30Hz')
plt.xlabel('Frequency (Hz)')
plt.ylabel('Gain (dB)')
plt.title('Filter Frequency Response')
plt.legend()
plt.grid(True)
plt.ylim(-60, 5)
plt.savefig('filter_response.png')
```

### 🔑 采样与重构

```python
import numpy as np
import matplotlib.pyplot as plt

# 采样定理演示

# 原始信号：5Hz正弦波
f_signal = 5  # Hz
t_continuous = np.linspace(0, 1, 1000)
signal_continuous = np.sin(2 * np.pi * f_signal * t_continuous)

# 不同采样频率
fs_low = 6  # 低于奈奎斯特频率（10Hz），会混叠
fs_nyquist = 10  # 等于奈奎斯特频率
fs_high = 50  # 远高于奈奎斯特频率

fig, axes = plt.subplots(3, 1, figsize=(12, 10))

for idx, (fs, title) in enumerate([(fs_low, 'Undersampling (fs=6Hz, Aliasing)'),
                                     (fs_nyquist, 'Nyquist Sampling (fs=10Hz)'),
                                     (fs_high, 'Oversampling (fs=50Hz)')]):
    # 采样
    t_sample = np.arange(0, 1, 1/fs)
    signal_sample = np.sin(2 * np.pi * f_signal * t_sample)
    
    # 重构（零阶保持）
    signal_reconstructed = np.zeros_like(t_continuous)
    for i, ts in enumerate(t_sample):
        idx_start = int(ts * 1000)
        idx_end = int((ts + 1/fs) * 1000) if i < len(t_sample)-1 else 1000
        signal_reconstructed[idx_start:idx_end] = signal_sample[i]
    
    axes[idx].plot(t_continuous, signal_continuous, 'b-', alpha=0.5, label='Original')
    axes[idx].stem(t_sample, signal_sample, 'r', basefmt=' ', label='Samples')
    axes[idx].plot(t_continuous, signal_reconstructed, 'g--', alpha=0.7, label='Reconstructed')
    axes[idx].set_title(title)
    axes[idx].set_xlabel('Time (s)')
    axes[idx].set_ylabel('Amplitude')
    axes[idx].legend()
    axes[idx].grid(True)

plt.tight_layout()
plt.savefig('sampling_demo.png')

# 混叠频率计算
def aliased_frequency(f_signal, fs):
    """
    计算混叠后的频率
    """
    f_alias = abs(f_signal - fs * round(f_signal / fs))
    return f_alias

# 示例：100Hz信号以150Hz采样
f = 100
fs = 150
f_alias = aliased_frequency(f, fs)
print(f"Original: {f}Hz, Sampled at: {fs}Hz, Aliased: {f_alias}Hz")
```

### 🔑 Z变换与数字系统

```python
import numpy as np
from scipy import signal as sig

# Z变换分析数字系统

# 定义系统函数 H(z) = (z + 0.5) / (z^2 - 0.8z + 0.3)
# 对应差分方程：y[n] = 0.8y[n-1] - 0.3y[n-2] + x[n] + 0.5x[n-1]

# 分子和分母系数（按z的降幂排列）
b = [1, 0.5]  # 分子：z + 0.5
a = [1, -0.8, 0.3]  # 分母：z^2 - 0.8z + 0.3

# 计算零极点
zeros = np.roots(b)
poles = np.roots(a)

print(f"零点: {zeros}")
print(f"极点: {poles}")

# 判断稳定性：所有极点必须在单位圆内
is_stable = all(np.abs(poles) < 1)
print(f"系统稳定: {is_stable}")

# 绘制零极点图
import matplotlib.pyplot as plt

plt.figure(figsize=(8, 8))

# 画单位圆
theta = np.linspace(0, 2*np.pi, 100)
plt.plot(np.cos(theta), np.sin(theta), 'b-', label='Unit Circle')

# 画零点
plt.plot(np.real(zeros), np.imag(zeros), 'ro', markersize=10, label='Zeros')

# 画极点
plt.plot(np.real(poles), np.imag(poles), 'bx', markersize=10, label='Poles')

plt.axhline(0, color='k', linewidth=0.5)
plt.axvline(0, color='k', linewidth=0.5)
plt.xlabel('Real')
plt.ylabel('Imaginary')
plt.title('Pole-Zero Plot')
plt.legend()
plt.grid(True)
plt.axis('equal')
plt.savefig('pole_zero_plot.png')

# 频率响应
w, h = sig.freqz(b, a, worN=8000)

plt.figure(figsize=(10, 6))

plt.subplot(2, 1, 1)
plt.plot(w/np.pi, 20*np.log10(np.abs(h)))
plt.xlabel('Normalized Frequency (×π rad/sample)')
plt.ylabel('Magnitude (dB)')
plt.title('Frequency Response')
plt.grid(True)

plt.subplot(2, 1, 2)
plt.plot(w/np.pi, np.angle(h) * 180 / np.pi)
plt.xlabel('Normalized Frequency (×π rad/sample)')
plt.ylabel('Phase (degrees)')
plt.grid(True)

plt.tight_layout()
plt.savefig('digital_filter_response.png')
```

## 完整跑通方案

**第一步：分析音频信号的频谱**

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.io import wavfile

# 读取音频文件
fs, audio = wavfile.read('test_audio.wav')

# 如果是立体声，取单声道
if len(audio.shape) > 1:
    audio = audio[:, 0]

# 归一化
audio = audio / np.max(np.abs(audio))

# 分帧（语音处理常用）
frame_size = 1024
hop_size = 512
num_frames = (len(audio) - frame_size) // hop_size + 1

# 计算STFT（短时傅里叶变换）
 spectrogram = []
for i in range(num_frames):
    frame = audio[i*hop_size : i*hop_size + frame_size]
    # 加汉宁窗
    window = np.hanning(frame_size)
    frame_windowed = frame * window
    # FFT
    fft_result = np.fft.fft(frame_windowed)
    spectrogram.append(np.abs(fft_result[:frame_size//2]))

spectrogram = np.array(spectrogram).T

# 绘制语谱图
plt.figure(figsize=(12, 6))
plt.imshow(20*np.log10(spectrogram + 1e-10), 
           aspect='auto', 
           origin='lower',
           extent=[0, len(audio)/fs, 0, fs/2])
plt.colorbar(label='Magnitude (dB)')
plt.xlabel('Time (s)')
plt.ylabel('Frequency (Hz)')
plt.title('Spectrogram')
plt.savefig('spectrogram.png')
```

**第二步：设计并验证数字滤波器**

```python
from scipy import signal as sig
import numpy as np

# 设计一个带阻滤波器，去除50Hz工频干扰
def design_notch_filter(notch_freq, fs, quality_factor=30):
    """
    设计陷波滤波器
    notch_freq: 陷波频率
    fs: 采样频率
    quality_factor: 品质因数
    """
    nyquist = fs / 2
    normalized_freq = notch_freq / nyquist
    b, a = sig.iirnotch(normalized_freq, quality_factor)
    return b, a

# 应用陷波滤波器
fs = 1000
b, a = design_notch_filter(50, fs)

# 生成含50Hz干扰的信号
t = np.arange(0, 2, 1/fs)
signal_clean = np.sin(2*np.pi*10*t)  # 10Hz有用信号
interference = 2*np.sin(2*np.pi*50*t)  # 50Hz干扰
signal_noisy = signal_clean + interference

# 滤波
signal_filtered = sig.filtfilt(b, a, signal_noisy)

# 验证
print("滤波前50Hz幅度:", np.max(np.abs(np.fft.fft(signal_noisy)[50*2])))
print("滤波后50Hz幅度:", np.max(np.abs(np.fft.fft(signal_filtered)[50*2])))
```

## 常见误区

**误区 1：忽视窗函数 → 频谱泄漏严重**

解释：对有限长信号做FFT时，相当于对无限长信号加矩形窗，导致频谱泄漏。应使用汉宁窗、汉明窗等窗函数减小泄漏。

**误区 2：采样频率刚好等于奈奎斯特频率 → 无法恢复信号**

解释：奈奎斯特准则要求采样频率严格大于信号最高频率的2倍，等于时可能无法恢复。实际工程中通常取2.5-5倍。

**误区 3：滤波器阶数越高越好 → 相位失真和数值不稳定**

解释：高阶滤波器虽然过渡带陡峭，但相位非线性严重，且IIR滤波器高阶时数值不稳定。通常用多个二阶节级联实现高阶滤波器。

**误区 4：混淆模拟频率和数字频率 → 设计错误**

解释：数字频率ω（弧度/样本）和模拟频率f（Hz）的关系是ω = 2πf/fs。设计数字滤波器时要注意归一化。

**误区 5：忽视量化误差 → 滤波器性能下降**

解释：定点实现时，系数量化和运算舍入会引入误差。对于高Q值滤波器，可能需要32位或更高精度。
