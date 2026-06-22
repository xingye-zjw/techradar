# 傅里叶变换（Fourier Transform）

**傅里叶变换**是将时域信号转换为频域表示的数学工具，是信号处理的核心。它揭示了任何信号都可以分解为不同频率正弦波的叠加。

## 数学定义

### 连续傅里叶变换

```
正变换：F(ω) = ∫ f(t) e^(-jωt) dt
逆变换：f(t) = (1/2π) ∫ F(ω) e^(jωt) dω

其中：j = √(-1)，ω = 2πf（角频率）
```

### 离散傅里叶变换（DFT）

```
F(k) = Σ f(n) e^(-j2πkn/N),  k = 0,1,...,N-1

计算复杂度：O(N²)
```

### 快速傅里叶变换（FFT）

```
计算复杂度：O(N log N)
是最常用的 DFT 高效算法
```

## Python 实现

```python
import numpy as np

# 示例信号：50Hz + 120Hz 正弦波
t = np.linspace(0, 1, 1000)
signal = np.sin(2 * np.pi * 50 * t) + 0.5 * np.sin(2 * np.pi * 120 * t)

# FFT 变换
fft_result = np.fft.fft(signal)
freqs = np.fft.fftfreq(len(signal), t[1] - t[0])

# 幅度谱
magnitude = np.abs(fft_result) / len(signal)

# 找到主要频率成分
peak_idx = np.argmax(magnitude[:len(signal)//2])
dominant_freq = freqs[peak_idx]
print(f"主导频率: {dominant_freq} Hz")  # 输出: 50 Hz
```

## 应用场景

### 1. 音频处理

```python
# 音频频谱分析
def analyze_audio_spectrum(audio_signal, sample_rate):
    """分析音频的频率成分"""
    n = len(audio_signal)
    fft = np.fft.fft(audio_signal)
    freqs = np.fft.fftfreq(n, 1/sample_rate)
    
    # 只取正频率部分
    positive_freqs = freqs[:n//2]
    magnitudes = np.abs(fft[:n//2])
    
    return positive_freqs, magnitudes

# 应用：音乐可视化、噪声消除、语音识别
```

### 2. 图像处理

```python
# 图像频域滤波
import cv2

def frequency_filter(image, cutoff=50):
    """低通滤波去除高频噪声"""
    f = np.fft.fft2(image)
    fshift = np.fft.fftshift(f)
    
    # 创建低通滤波器
    rows, cols = image.shape
    mask = np.zeros((rows, cols), np.uint8)
    center = (rows//2, cols//2)
    cv2.circle(mask, center, cutoff, 1, -1)
    
    # 应用滤波器
    fshift = fshift * mask
    f_ishift = np.fft.ifftshift(fshift)
    img_back = np.fft.ifft2(f_ishift)
    
    return np.abs(img_back)
```

### 3. 通信系统

```
OFDM（正交频分复用）= FFT + IFFT
WiFi、4G/5G、数字电视都使用 OFDM
```

## 物理意义

```
时域 → 频域：
  "信号随时间如何变化" → "信号包含哪些频率成分"

频域 → 时域：
  "信号的频率成分" → "信号随时间的波形"
```

## 常用变体

| 变体 | 用途 |
|------|------|
| DFT/FFT | 离散信号频谱分析 |
| DCT | 图像压缩（JPEG） |
| STFT | 时频分析（音乐） |
| 小波变换 | 多分辨率分析 |

## 相关概念

[信号处理](/glossary/signal-processing)、[数字滤波器](/glossary/digital-filter)、[卷积神经网络](/glossary/cnn)
