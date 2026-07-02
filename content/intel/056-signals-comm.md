---
title: 通信原理
category: embedded
difficulty: intermediate
duration: 3周
summary: 理解通信系统的基本组成和调制解调原理，掌握数字通信中的编解码技术
takeaways:
  - 理解通信系统基本模型
  - 掌握调制解调原理
  - 理解信道编码技术
  - 理解OFDM和多址接入技术
relatedIntel:
  - 052-embedded-c
  - 053-embedded-rtos
  - 054-elec-circuit
relatedNodes: signals-comm
tags:
  - modulation
  - demodulation
  - ofdm
  - channel-coding
  - 5g
  - wireless
  - communication
---

## 为什么你要学它

通信技术是信息时代的基石。在AIoT和5G时代：

- **物联网通信**：LoRa、NB-IoT、Zigbee等低功耗广域网技术
- **边缘计算**：5G低延迟特性使边缘AI推理成为可能
- **自动驾驶**：V2X通信需要高可靠低延迟的通信链路
- **卫星通信**：Starlink等星座系统改变全球互联网格局

如果你不理解通信原理，就无法设计可靠的无线数据传输系统。

## 一句话概览（快速版）

- **调制是把信息加载到载波上**：改变载波的幅度、频率或相位
- **数字调制用星座图表示**：BPSK、QPSK、QAM的星座点位置
- **OFDM把宽带分成多个窄带子载波**：对抗多径衰落，提高频谱效率
- **信道编码添加冗余**：汉明码、卷积码、LDPC码提高可靠性

## 核心拆解

### 🔑 调制与解调

```python
import numpy as np
import matplotlib.pyplot as plt

# 数字调制仿真

# 参数设置
fs = 10000  # 采样频率
fc = 1000   # 载波频率
bit_rate = 100  # 比特率
samples_per_bit = fs // bit_rate

# 生成随机比特流
num_bits = 100
bits = np.random.randint(0, 2, num_bits)

# 1. BPSK调制：0→-1, 1→+1
def bpsk_modulate(bits, fc, fs, samples_per_bit):
    """BPSK调制"""
    # 映射：0→-1, 1→+1
    symbols = 2 * bits - 1
    
    # 上采样
    samples = np.repeat(symbols, samples_per_bit)
    
    # 生成载波
    t = np.arange(len(samples)) / fs
    carrier = np.cos(2 * np.pi * fc * t)
    
    # 调制
    modulated = samples * carrier
    
    return modulated, t

# 2. QPSK调制：每2比特映射到一个星座点
def qpsk_modulate(bits, fc, fs, samples_per_bit):
    """QPSK调制"""
    # 确保比特数是偶数
    if len(bits) % 2 != 0:
        bits = np.append(bits, 0)
    
    # 分组：每2比特一组
    bit_pairs = bits.reshape(-1, 2)
    
    # 映射到星座点
    # 00 → +1+j, 01 → -1+j, 10 → +1-j, 11 → -1-j
    mapping = {
        (0, 0): 1 + 1j,
        (0, 1): -1 + 1j,
        (1, 0): 1 - 1j,
        (1, 1): -1 - 1j
    }
    
    symbols = np.array([mapping[tuple(pair)] for pair in bit_pairs])
    
    # 上采样
    I = np.repeat(np.real(symbols), samples_per_bit * 2)  # QPSK每个符号2比特
    Q = np.repeat(np.imag(symbols), samples_per_bit * 2)
    
    # 生成载波
    t = np.arange(len(I)) / fs
    carrier_I = np.cos(2 * np.pi * fc * t)
    carrier_Q = np.sin(2 * np.pi * fc * t)
    
    # 调制
    modulated = I * carrier_I - Q * carrier_Q
    
    return modulated, symbols, t

# 3. 16QAM调制
def qam16_modulate(bits, fc, fs, samples_per_bit):
    """16QAM调制"""
    # 确保比特数是4的倍数
    while len(bits) % 4 != 0:
        bits = np.append(bits, 0)
    
    # 分组：每4比特一组
    bit_groups = bits.reshape(-1, 4)
    
    # 16QAM星座映射（格雷编码）
    # I和Q各4个电平：-3, -1, +1, +3
    def map_bits(b1, b2):
        if b1 == 0 and b2 == 0:
            return -3
        elif b1 == 0 and b2 == 1:
            return -1
        elif b1 == 1 and b2 == 1:
            return 1
        else:
            return 3
    
    I = np.array([map_bits(g[0], g[1]) for g in bit_groups])
    Q = np.array([map_bits(g[2], g[3]) for g in bit_groups])
    
    symbols = I + 1j * Q
    
    # 归一化
    symbols = symbols / np.sqrt(10)  # 平均功率归一化
    
    # 上采样
    I_up = np.repeat(I / np.sqrt(10), samples_per_bit * 4)
    Q_up = np.repeat(Q / np.sqrt(10), samples_per_bit * 4)
    
    # 生成载波
    t = np.arange(len(I_up)) / fs
    carrier_I = np.cos(2 * np.pi * fc * t)
    carrier_Q = np.sin(2 * np.pi * fc * t)
    
    # 调制
    modulated = I_up * carrier_I - Q_up * carrier_Q
    
    return modulated, symbols, t

# 绘制星座图
fig, axes = plt.subplots(1, 3, figsize=(15, 5))

# BPSK星座图
ax = axes[0]
ax.plot([-1, 1], [0, 0], 'bo', markersize=10)
ax.axhline(0, color='k', linewidth=0.5)
ax.axvline(0, color='k', linewidth=0.5)
ax.set_xlim(-2, 2)
ax.set_ylim(-1, 1)
ax.set_xlabel('I')
ax.set_ylabel('Q')
ax.set_title('BPSK Constellation')
ax.grid(True)
ax.set_aspect('equal')

# QPSK星座图
_, qpsk_symbols, _ = qpsk_modulate(bits, fc, fs, samples_per_bit)
ax = axes[1]
ax.plot(np.real(qpsk_symbols), np.imag(qpsk_symbols), 'ro', markersize=10)
ax.axhline(0, color='k', linewidth=0.5)
ax.axvline(0, color='k', linewidth=0.5)
ax.set_xlim(-2, 2)
ax.set_ylim(-2, 2)
ax.set_xlabel('I')
ax.set_ylabel('Q')
ax.set_title('QPSK Constellation')
ax.grid(True)
ax.set_aspect('equal')

# 16QAM星座图
_, qam_symbols, _ = qam16_modulate(bits, fc, fs, samples_per_bit)
ax = axes[2]
ax.plot(np.real(qam_symbols), np.imag(qam_symbols), 'go', markersize=8)
ax.axhline(0, color='k', linewidth=0.5)
ax.axvline(0, color='k', linewidth=0.5)
ax.set_xlim(-2, 2)
ax.set_ylim(-2, 2)
ax.set_xlabel('I')
ax.set_ylabel('Q')
ax.set_title('16QAM Constellation')
ax.grid(True)
ax.set_aspect('equal')

plt.tight_layout()
plt.savefig('constellation_diagrams.png')
```

### 🔑 OFDM仿真

```python
import numpy as np
import matplotlib.pyplot as plt

# OFDM系统仿真

class OFDM:
    def __init__(self, n_subcarriers=64, cp_length=16, modulation='QPSK'):
        self.n_subcarriers = n_subcarriers
        self.cp_length = cp_length
        self.modulation = modulation
        
    def modulate(self, bits):
        """OFDM调制"""
        # 根据调制方式确定每符号比特数
        if self.modulation == 'BPSK':
            bits_per_symbol = 1
        elif self.modulation == 'QPSK':
            bits_per_symbol = 2
        elif self.modulation == '16QAM':
            bits_per_symbol = 4
        else:
            raise ValueError("Unsupported modulation")
        
        # 确保比特数足够
        num_symbols = len(bits) // bits_per_symbol
        bits = bits[:num_symbols * bits_per_symbol]
        
        # 调制到子载波
        symbols = self._map_bits_to_symbols(bits, bits_per_symbol)
        
        # 串并转换
        parallel_symbols = symbols.reshape(-1, self.n_subcarriers)
        
        # IFFT（OFDM核心）
        ofdm_symbols = np.fft.ifft(parallel_symbols, axis=1)
        
        # 添加循环前缀
        cp = ofdm_symbols[:, -self.cp_length:]
        ofdm_with_cp = np.hstack([cp, ofdm_symbols])
        
        # 并串转换
        tx_signal = ofdm_with_cp.flatten()
        
        return tx_signal
    
    def demodulate(self, rx_signal):
        """OFDM解调"""
        # 串并转换
        symbol_length = self.n_subcarriers + self.cp_length
        num_ofdm_symbols = len(rx_signal) // symbol_length
        rx_signal = rx_signal[:num_ofdm_symbols * symbol_length]
        
        rx_parallel = rx_signal.reshape(num_ofdm_symbols, symbol_length)
        
        # 去除循环前缀
        rx_no_cp = rx_parallel[:, self.cp_length:]
        
        # FFT
        rx_freq = np.fft.fft(rx_no_cp, axis=1)
        
        # 并串转换
        rx_symbols = rx_freq.flatten()
        
        return rx_symbols
    
    def _map_bits_to_symbols(self, bits, bits_per_symbol):
        """比特映射到星座符号"""
        if bits_per_symbol == 1:  # BPSK
            return 2 * bits - 1
        elif bits_per_symbol == 2:  # QPSK
            # 简化实现
            symbols = []
            for i in range(0, len(bits), 2):
                b1, b2 = bits[i], bits[i+1]
                if b1 == 0 and b2 == 0:
                    symbols.append(1 + 1j)
                elif b1 == 0 and b2 == 1:
                    symbols.append(-1 + 1j)
                elif b1 == 1 and b2 == 0:
                    symbols.append(1 - 1j)
                else:
                    symbols.append(-1 - 1j)
            return np.array(symbols) / np.sqrt(2)
        else:  # 16QAM
            # 简化实现
            symbols = []
            for i in range(0, len(bits), 4):
                b = bits[i:i+4]
                I = 2*b[0] + b[1] - 1.5
                Q = 2*b[2] + b[3] - 1.5
                symbols.append(I + 1j*Q)
            return np.array(symbols) / np.sqrt(10)

# OFDM仿真
ofdm = OFDM(n_subcarriers=64, cp_length=16, modulation='QPSK')

# 生成随机比特
num_bits = 64 * 10 * 2  # 10个OFDM符号，QPSK
tx_bits = np.random.randint(0, 2, num_bits)

# 调制
tx_signal = ofdm.modulate(tx_bits)

# 添加AWGN噪声
snr_db = 20
signal_power = np.mean(np.abs(tx_signal)**2)
noise_power = signal_power / (10**(snr_db/10))
noise = np.sqrt(noise_power/2) * (np.random.randn(len(tx_signal)) + 1j*np.random.randn(len(tx_signal)))
rx_signal = tx_signal + noise

# 解调
rx_symbols = ofdm.demodulate(rx_signal)

# 绘制OFDM信号
plt.figure(figsize=(12, 8))

plt.subplot(3, 1, 1)
plt.plot(np.real(tx_signal[:200]))
plt.title('OFDM Signal (Real Part)')
plt.xlabel('Sample')
plt.ylabel('Amplitude')
plt.grid(True)

plt.subplot(3, 1, 2)
plt.plot(np.real(rx_signal[:200]))
plt.title('Received Signal with AWGN')
plt.xlabel('Sample')
plt.ylabel('Amplitude')
plt.grid(True)

plt.subplot(3, 1, 3)
plt.scatter(np.real(rx_symbols), np.imag(rx_symbols), alpha=0.5)
plt.axhline(0, color='k', linewidth=0.5)
plt.axvline(0, color='k', linewidth=0.5)
plt.xlabel('I')
plt.ylabel('Q')
plt.title('Received Constellation')
plt.grid(True)
plt.axis('equal')

plt.tight_layout()
plt.savefig('ofdm_simulation.png')
```

### 🔑 信道编码

```python
import numpy as np

# 汉明码(7,4)：4位数据，3位校验，能纠正1位错误

class HammingCode:
    def __init__(self):
        # 生成矩阵 G（4×7）
        self.G = np.array([
            [1, 0, 0, 0, 1, 1, 0],
            [0, 1, 0, 0, 1, 0, 1],
            [0, 0, 1, 0, 0, 1, 1],
            [0, 0, 0, 1, 1, 1, 1]
        ])
        
        # 校验矩阵 H（3×7）
        self.H = np.array([
            [1, 1, 0, 1, 1, 0, 0],
            [1, 0, 1, 1, 0, 1, 0],
            [0, 1, 1, 1, 0, 0, 1]
        ])
        
        # 伴随式到错误位置的映射
        self.syndrome_to_error = {
            (0, 0, 0): None,  # 无错误
            (1, 1, 0): 0,     # 第1位错
            (1, 0, 1): 1,     # 第2位错
            (0, 1, 1): 2,     # 第3位错
            (1, 1, 1): 3,     # 第4位错
            (1, 0, 0): 4,     # 第5位错
            (0, 1, 0): 5,     # 第6位错
            (0, 0, 1): 6,     # 第7位错
        }
    
    def encode(self, data):
        """编码：4位数据→7位码字"""
        if len(data) != 4:
            raise ValueError("Data must be 4 bits")
        
        # 计算码字：c = d × G (mod 2)
        codeword = np.dot(data, self.G) % 2
        return codeword.astype(int)
    
    def decode(self, received):
        """解码：7位接收→4位数据，纠正1位错误"""
        if len(received) != 7:
            raise ValueError("Received must be 7 bits")
        
        # 计算伴随式：s = r × H^T (mod 2)
        syndrome = np.dot(received, self.H.T) % 2
        syndrome_tuple = tuple(syndrome.astype(int))
        
        # 查找错误位置
        error_pos = self.syndrome_to_error.get(syndrome_tuple)
        
        if error_pos is not None:
            # 纠正错误
            corrected = received.copy()
            corrected[error_pos] = 1 - corrected[error_pos]
        else:
            corrected = received
        
        # 提取数据位（前4位）
        data = corrected[:4]
        
        return data.astype(int), error_pos

# 测试汉明码
hamming = HammingCode()

# 原始数据
data = np.array([1, 0, 1, 1])
print(f"原始数据: {data}")

# 编码
codeword = hamming.encode(data)
print(f"编码后: {codeword}")

# 传输（无错误）
received = codeword.copy()
decoded, error_pos = hamming.decode(received)
print(f"无错误解码: {decoded}, 错误位置: {error_pos}")

# 传输（1位错误）
received_with_error = codeword.copy()
received_with_error[2] = 1 - received_with_error[2]  # 翻转第3位
print(f"\n接收（1位错误）: {received_with_error}")
decoded, error_pos = hamming.decode(received_with_error)
print(f"纠错解码: {decoded}, 错误位置: {error_pos}")

# 计算编码效率
efficiency = 4 / 7
print(f"\n汉明码(7,4)效率: {efficiency:.3f}")
```

## 完整跑通方案

**第一步：搭建简单的数字通信链路**

```python
import numpy as np
import matplotlib.pyplot as plt

# 完整的BPSK通信链路仿真

def bpsk_modulate(bits, Eb):
    """BPSK调制"""
    return np.sqrt(Eb) * (2 * bits - 1)

def awgn_channel(signal, EbN0_db):
    """AWGN信道"""
    EbN0 = 10**(EbN0_db / 10)
    N0 = 1 / EbN0  # 假设Eb=1
    noise = np.sqrt(N0/2) * np.random.randn(len(signal))
    return signal + noise

def bpsk_demodulate(received):
    """BPSK解调（硬判决）"""
    return (received > 0).astype(int)

def calculate_ber(tx_bits, rx_bits):
    """计算误码率"""
    errors = np.sum(tx_bits != rx_bits)
    return errors / len(tx_bits)

# 仿真参数
num_bits = 100000
Eb = 1  # 每比特能量

# 不同Eb/N0下的BER
EbN0_range = np.arange(0, 11, 1)  # 0到10dB
ber_simulated = []
ber_theoretical = []

for EbN0_db in EbN0_range:
    # 生成随机比特
    tx_bits = np.random.randint(0, 2, num_bits)
    
    # 调制
    tx_signal = bpsk_modulate(tx_bits, Eb)
    
    # 通过AWGN信道
    rx_signal = awgn_channel(tx_signal, EbN0_db)
    
    # 解调
    rx_bits = bpsk_demodulate(rx_signal)
    
    # 计算BER
    ber = calculate_ber(tx_bits, rx_bits)
    ber_simulated.append(ber)
    
    # 理论BER：Q(sqrt(2*Eb/N0))
    EbN0 = 10**(EbN0_db / 10)
    ber_theory = 0.5 * np.erfc(np.sqrt(EbN0))
    ber_theoretical.append(ber_theory)

# 绘制BER曲线
plt.figure(figsize=(10, 6))
plt.semilogy(EbN0_range, ber_simulated, 'bo-', label='Simulated')
plt.semilogy(EbN0_range, ber_theoretical, 'r--', label='Theoretical')
plt.xlabel('Eb/N0 (dB)')
plt.ylabel('Bit Error Rate (BER)')
plt.title('BPSK BER Performance')
plt.legend()
plt.grid(True)
plt.savefig('bpsk_ber_curve.png')
```

**第二步：分析不同调制方式的性能**

```python
# 比较BPSK、QPSK、16QAM的频谱效率

modulations = {
    'BPSK': {'bits_per_symbol': 1, 'min_snr_db': 10},
    'QPSK': {'bits_per_symbol': 2, 'min_snr_db': 13},
    '16QAM': {'bits_per_symbol': 4, 'min_snr_db': 20},
    '64QAM': {'bits_per_symbol': 6, 'min_snr_db': 27},
}

print("调制方式对比：")
print("-" * 50)
print(f"{'调制':<10} {'比特/符号':<12} {'最小SNR':<10}")
print("-" * 50)

for mod, params in modulations.items():
    print(f"{mod:<10} {params['bits_per_symbol']:<12} {params['min_snr_db']} dB")

# 频谱效率 = 比特/符号 × 符号率/带宽
# 对于理想Nyquist脉冲，符号率 = 带宽
# 所以频谱效率 ≈ 比特/符号
print("\n频谱效率（理想情况）：")
for mod, params in modulations.items():
    print(f"{mod}: {params['bits_per_symbol']} bits/s/Hz")
```

## 常见误区

**误区 1：忽视信道估计 → 解调性能严重下降**

解释：无线信道会引入幅度衰落和相位旋转，解调前必须进行信道估计和均衡。OFDM中使用导频进行信道估计，单载波系统使用训练序列。

**误区 2：混淆Eb/N0和SNR → 性能分析错误**

解释：Eb/N0是每比特能量与噪声功率谱密度之比，SNR是信号功率与噪声功率之比。两者关系：SNR = Eb/N0 × R/B（R是比特率，B是带宽）。

**误区 3：忽视峰均比（PAPR） → OFDM信号失真**

解释：OFDM信号的PAPR很高（可达10-13dB），对功放的线性度要求很高。实际系统中需要PAPR抑制技术，如削波、选择性映射等。

**误区 4：忽视同步 → 系统无法正常工作**

解释：数字通信需要精确的符号同步、载波同步和帧同步。同步误差会导致星座图旋转和采样时刻偏移，严重影响性能。

**误区 5：编码增益计算错误 → 对系统性能预期不准**

解释：编码增益是在相同BER下，编码系统相比未编码系统所需的Eb/N0降低量。要注意比较的是相同BER，不是相同SNR。
