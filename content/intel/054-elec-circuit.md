---
title: 电路基础与模拟电子技术
category: electronics
keywords:
  - circuit
  - analog
  - op-amp
  - transistor
  - diode
  - mosfet
  - power-supply
difficulty: beginner
duration: 3周
summary: 从电路基本定律到模拟电子技术核心器件，掌握看懂原理图、设计电路、分析信号的能力
takeaways:
  - 理解电路基本定律和分析方法
  - 掌握常用电子器件特性
  - 能看懂和设计基础电路
  - 理解运放、二极管、晶体管的应用
---

## 为什么你要学它

电路基础是电子工程和电气工程的根基。在AI硬件时代：

- **传感器接口**：所有传感器都需要信号调理电路（放大、滤波、电平移位）
- **电源设计**：AI芯片需要稳定的电源供电，开关电源和LDO是必备技能
- **模拟前端**：ADC之前的模拟电路直接影响测量精度
- **硬件调试**：看懂原理图是调试硬件的第一步

如果你只会写代码而不懂电路，就无法设计可靠的硬件系统。

## 一句话概览（快速版）

- **欧姆定律是基础**：V=IR，所有电路分析都从这里开始
- **KCL和KVL是工具**：节点电流代数和为零，回路电压代数和为零
- **运放是万能器件**：放大、滤波、比较、积分、微分都能做
- **二极管单向导电**：整流、保护、稳压都离不开它

## 核心拆解

### 🔑 电路基本定律

```python
# 欧姆定律：V = I * R
# 功率：P = V * I = I² * R = V² / R

def ohm_law(voltage=None, current=None, resistance=None):
    """计算欧姆定律，已知两个量求第三个"""
    if voltage is None:
        return current * resistance
    elif current is None:
        return voltage / resistance
    elif resistance is None:
        return voltage / current

# 串联电阻：R_total = R1 + R2 + R3
def series_resistance(*resistors):
    return sum(resistors)

# 并联电阻：1/R_total = 1/R1 + 1/R2 + 1/R3
def parallel_resistance(*resistors):
    return 1 / sum(1/r for r in resistors)

# 串联分压
def voltage_divider(vin, r1, r2):
    """计算分压电路输出电压"""
    return vin * r2 / (r1 + r2)

# 并联分流
def current_divider(iin, r1, r2):
    """计算分流电路支路电流"""
    i1 = iin * r2 / (r1 + r2)
    i2 = iin * r1 / (r1 + r2)
    return i1, i2

# 示例：5V电源通过10k和20k电阻分压
vout = voltage_divider(5, 10000, 20000)
print(f"分压输出: {vout:.2f}V")  # 3.33V

# 示例：计算LED限流电阻
# LED参数：正向压降2V，工作电流20mA，电源5V
v_led = 2.0  # V
i_led = 0.020  # A
v_supply = 5.0  # V

r_limit = (v_supply - v_led) / i_led
print(f"LED限流电阻: {r_limit:.0f}Ω")  # 150Ω
p_resistor = (v_supply - v_led) * i_led
print(f"电阻功耗: {p_resistor:.3f}W")  # 0.06W，选1/8W电阻
```

### 🔑 运算放大器

```python
# 运放基本电路分析

# 1. 反相放大器：Vout = -(Rf/Rin) * Vin
def inverting_amplifier(vin, rin, rf):
    """反相放大器"""
    gain = -rf / rin
    vout = gain * vin
    return vout, gain

# 2. 同相放大器：Vout = (1 + Rf/Rin) * Vin
def non_inverting_amplifier(vin, rin, rf):
    """同相放大器"""
    gain = 1 + rf / rin
    vout = gain * vin
    return vout, gain

# 3. 电压跟随器：Vout = Vin（增益为1，高输入阻抗，低输出阻抗）
def voltage_follower(vin):
    """电压跟随器（缓冲器）"""
    return vin, 1

# 4. 加法器：Vout = -(Rf/R1 * V1 + Rf/R2 * V2)
def summing_amplifier(v1, v2, r1, r2, rf):
    """反相加法器"""
    vout = -(rf/r1 * v1 + rf/r2 * v2)
    return vout

# 5. 差分放大器：Vout = (Rf/Rin) * (V2 - V1)
def differential_amplifier(v1, v2, rin, rf):
    """差分放大器"""
    gain = rf / rin
    vout = gain * (v2 - v1)
    return vout, gain

# 示例：设计一个增益为10的反相放大器
vin = 0.5  # 500mV输入
rin = 1000  # 1kΩ
rf = 10000  # 10kΩ

vout, gain = inverting_amplifier(vin, rin, rf)
print(f"反相放大器: Vin={vin}V, Gain={gain}, Vout={vout}V")

# 示例：设计一个传感器信号调理电路
# 传感器输出：0-100mV，需要放大到0-3.3V供ADC采集
vin_max = 0.1  # 100mV
vout_max = 3.3  # 3.3V
required_gain = vout_max / vin_max
print(f"所需增益: {required_gain}")

# 选择Rin=1kΩ，则Rf=33kΩ
rin = 1000
rf = required_gain * rin
print(f"Rin={rin}Ω, Rf={rf:.0f}Ω")
```

### 🔑 滤波器设计

```python
import numpy as np
import matplotlib.pyplot as plt

# RC低通滤波器：截止频率 fc = 1 / (2πRC)
def rc_lowpass_cutoff(r, c):
    """计算RC低通滤波器截止频率"""
    return 1 / (2 * np.pi * r * c)

def rc_lowpass_response(f, r, c):
    """计算RC低通滤波器频率响应"""
    fc = rc_lowpass_cutoff(r, c)
    h = 1 / np.sqrt(1 + (f/fc)**2)
    phase = -np.arctan(f/fc) * 180 / np.pi
    return h, phase

# RC高通滤波器：截止频率 fc = 1 / (2πRC)
def rc_highpass_cutoff(r, c):
    """计算RC高通滤波器截止频率"""
    return 1 / (2 * np.pi * r * c)

def rc_highpass_response(f, r, c):
    """计算RC高通滤波器频率响应"""
    fc = rc_highpass_cutoff(r, c)
    h = (f/fc) / np.sqrt(1 + (f/fc)**2)
    phase = 90 - np.arctan(f/fc) * 180 / np.pi
    return h, phase

# 示例：设计一个截止频率为1kHz的低通滤波器
fc = 1000  # Hz
# 选择C=100nF，计算R
c = 100e-9  # 100nF
r = 1 / (2 * np.pi * fc * c)
print(f"低通滤波器: R={r:.0f}Ω, C={c*1e9:.0f}nF, fc={fc}Hz")

# 绘制频率响应
f = np.logspace(1, 5, 1000)  # 10Hz到100kHz
h, phase = rc_lowpass_response(f, r, c)

plt.figure(figsize=(10, 6))
plt.subplot(2, 1, 1)
plt.semilogx(f, 20*np.log10(h))
plt.axvline(fc, color='r', linestyle='--', label=f'fc={fc}Hz')
plt.xlabel('Frequency (Hz)')
plt.ylabel('Gain (dB)')
plt.title('RC Lowpass Filter Frequency Response')
plt.legend()
plt.grid(True)

plt.subplot(2, 1, 2)
plt.semilogx(f, phase)
plt.axvline(fc, color='r', linestyle='--', label=f'fc={fc}Hz')
plt.xlabel('Frequency (Hz)')
plt.ylabel('Phase (degrees)')
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.savefig('rc_lowpass.png')
```

### 🔑 电源设计

```python
# 线性稳压器（LDO）vs 开关稳压器（Buck/Boost）

# LDO效率计算
def ldo_efficiency(vin, vout, iq=0.001):
    """
    计算LDO效率
    vin: 输入电压
    vout: 输出电压
    iq: 静态电流（A）
    """
    # LDO效率 = Vout / Vin（忽略静态电流）
    efficiency = vout / vin
    return efficiency

# Buck降压转换器效率计算
def buck_efficiency(vin, vout, iout, rds_on=0.01, rl=0.05):
    """
    计算Buck转换器效率
    vin: 输入电压
    vout: 输出电压
    iout: 输出电流
    rds_on: MOSFET导通电阻
    rl: 电感直流电阻
    """
    # 占空比
    d = vout / vin
    
    # 导通损耗
    p_cond = iout**2 * (rds_on + rl)
    
    # 开关损耗（简化）
    p_sw = 0.01 * vin * iout  # 假设开关损耗为1%
    
    # 输出功率
    p_out = vout * iout
    
    # 输入功率
    p_in = p_out + p_cond + p_sw
    
    efficiency = p_out / p_in
    return efficiency, d

# 示例：5V转3.3V
vin = 5.0
vout = 3.3
iout = 0.5  # 500mA

# LDO方案
ldo_eff = ldo_efficiency(vin, vout)
ldo_power_loss = (vin - vout) * iout
print(f"LDO效率: {ldo_eff*100:.1f}%")
print(f"LDO功耗: {ldo_power_loss:.2f}W")

# Buck方案
buck_eff, duty = buck_efficiency(vin, vout, iout)
buck_power_loss = vin * iout * (1 - buck_eff)
print(f"Buck效率: {buck_eff*100:.1f}%")
print(f"Buck功耗: {buck_power_loss:.2f}W")
print(f"Buck占空比: {duty*100:.1f}%")

# 热分析
# LDO需要散热：功耗0.85W，温升约50°C（假设热阻60°C/W）
# 需要选择带散热片的封装或降低输入电压
```

## 完整跑通方案

**第一步：使用LTspice仿真基础电路**

```spice
* RC低通滤波器仿真
Vin in 0 AC 1V
R1 in out 1.59k
C1 out 0 100n
.ac dec 100 1 100k
.plot ac v(out)
.end
```

**第二步：搭建实际电路并测量**

```python
# 使用示波器和万用表验证
# 1. 测量电阻值（断电测量）
# 2. 测量电压（并联测量）
# 3. 测量电流（串联测量）
# 4. 使用示波器观察波形

# 安全注意事项：
# - 测量高压时注意安全
# - 电流测量不要并联到电路中
# - 示波器探头接地端连接到电路地
```

**第三步：设计一个完整的传感器信号调理电路**

```python
# 设计目标：温度传感器（PT100）信号调理
# PT100：0°C时100Ω，温度系数0.385Ω/°C
# 测量范围：0-100°C，对应电阻100-138.5Ω

# 惠斯通电桥 + 仪表放大器方案

# 电桥参数
r_pt100_0 = 100  # 0°C时电阻
r_pt100_100 = 138.5  # 100°C时电阻
r_bridge = 100  # 桥臂电阻
v_bridge = 5  # 电桥供电电压

# 计算电桥输出电压范围
def bridge_output(r_pt100, r_bridge, v_supply):
    """计算惠斯通电桥输出电压"""
    v_out = v_supply * (r_pt100 / (r_pt100 + r_bridge) - 0.5)
    return v_out

v_min = bridge_output(r_pt100_0, r_bridge, v_bridge)
v_max = bridge_output(r_pt100_100, r_bridge, v_bridge)
print(f"电桥输出范围: {v_min*1000:.2f}mV 到 {v_max*1000:.2f}mV")

# 仪表放大器增益计算
v_adc_max = 3.3  # ADC满量程
required_gain = v_adc_max / (v_max - v_min)
print(f"所需仪表放大器增益: {required_gain:.1f}")

# 选择INA128，增益由外部电阻设置
# G = 1 + 50kΩ/Rg
rg = 50000 / (required_gain - 1)
print(f"INA128增益电阻: {rg:.0f}Ω")
```

## 常见误区

**误区 1：忽视电源去耦 → 电路工作不稳定**

解释：数字芯片的开关噪声会通过电源线传导，影响模拟电路。每个芯片的电源引脚都应放置去耦电容（100nF陶瓷电容），电源入口处放置大容量电解电容（10-100μF）。

**误区 2：运放选型只看增益带宽积 → 忽略压摆率和输入偏置电流**

解释：高速信号需要高压摆率（SR），精密测量需要低输入偏置电流。根据应用选择合适的运放参数：音频用低噪声，高速用宽带宽，精密用低失调。

**误区 3：忽视热设计 → 器件过热损坏**

解释：功率器件（如稳压器、功率MOSFET）会产生热量。需要计算功耗和温升，必要时加散热片。结温 = 环境温度 + 功耗 × 热阻，不能超过最大允许结温。

**误区 4：PCB布局不合理 → 噪声和干扰**

解释：模拟地和数字地要分开，在一点连接；高频信号线要短且直；电源线要粗；敏感信号远离噪声源。PCB布局直接影响电路性能。

**误区 5：忽视ESD保护 → 静电损坏器件**

解释：CMOS器件对静电敏感，人体静电可达几千伏。操作时应佩戴防静电手环，工作台铺设防静电垫，器件存放在防静电袋中。
