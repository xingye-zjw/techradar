# 电路（Circuit）

**电路**是由电源、负载、导线和开关组成的电流通路，是电子工程和电气工程的基础。

## 核心定律

### 欧姆定律（Ohm's Law）

```
V = I × R

V: 电压（Voltage），单位伏特（V）
I: 电流（Current），单位安培（A）
R: 电阻（Resistance），单位欧姆（Ω）
```

### 基尔霍夫定律

**KCL（基尔霍夫电流定律）**：流入节点的电流之和等于流出节点的电流之和。

**KVL（基尔霍夫电压定律）**：闭合回路中所有电压的代数和为零。

## 电路分类

| 类型 | 说明 | 应用 |
|------|------|------|
| **直流电路（DC）** | 电流方向恒定 | 电池供电设备、数字电路 |
| **交流电路（AC）** | 电流方向周期性变化 | 家用电源、电机驱动 |
| **模拟电路** | 处理连续信号 | 音频放大、传感器接口 |
| **数字电路** | 处理离散信号（0/1） | CPU、存储器、逻辑门 |

## 基本元件

```python
# 电路元件的基本特性
class CircuitElements:
    def resistor(self, v, r):
        """电阻：欧姆定律"""
        return v / r  # I = V/R
    
    def capacitor_charge(self, c, v):
        """电容：Q = C × V"""
        return c * v  # 电荷量
    
    def inductor_voltage(self, l, di_dt):
        """电感：V = L × dI/dt"""
        return l * di_dt  # 感应电压
```

## 应用场景

- **嵌入式系统**：设计微控制器的外围电路（电源、复位、晶振）
- **电源设计**：AC-DC 转换器、稳压电路（LDO、开关电源）
- **传感器接口**：信号调理电路、ADC/DAC 接口
- **电机驱动**：H桥电路、三相逆变器（FOC控制）

## 实际案例：LED 限流电路

```python
# 计算 LED 限流电阻
def calculate_resistor(vcc, v_forward, i_forward):
    """
    Vcc: 供电电压 (如 5V)
    V_forward: LED 正向压降 (如 2V)
    I_forward: LED 工作电流 (如 20mA = 0.02A)
    """
    r = (vcc - v_forward) / i_forward
    return r

# 5V 供电，红色 LED (2V, 20mA)
r = calculate_resistor(5, 2, 0.02)
print(f"需要电阻: {r:.0f} Ω")  # 需要 150 Ω
```

## 相关概念

[磁场定向控制](/glossary/foc)、[PID控制器](/glossary/pid-controller)、[嵌入式系统](/glossary/embedded)
