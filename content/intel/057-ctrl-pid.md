---
title: 自动控制原理
category: embedded
keywords:
  - control
  - pid
  - feedback
  - stability
  - system-response
  - root-locus
  - bode-plot
difficulty: intermediate
duration: 3周
summary: 掌握自动控制的核心概念，理解反馈控制原理和控制器设计方法
takeaways:
  - 理解控制系统基本组成
  - 掌握PID控制器原理
  - 能分析系统稳定性
  - 能设计简单的控制器
relatedIntel:
  - 052-embedded-c
  - 053-embedded-rtos
  - 054-elec-circuit
relatedNodes:
  - ctrl-pid
---

## 为什么你要学它

自动控制是现代工业和智能系统的核心。在AI时代：

- **机器人控制**：机械臂轨迹跟踪、移动机器人导航
- **自动驾驶**：横向/纵向控制、路径跟踪
- **无人机**：姿态稳定、位置控制
- **工业过程**：温度、压力、流量控制

如果你不理解控制理论，就无法设计稳定的闭环系统。

## 一句话概览（快速版）

- **开环控制：输入决定输出，不受输出影响**
- **闭环控制：用输出反馈修正输入，抗干扰能力强**
- **PID是万能控制器：P快速响应，I消除稳态误差，D预测趋势**
- **稳定性是前提：所有极点必须在左半平面**

## 核心拆解

### 🔑 系统建模

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal as sig

# 传递函数表示
# G(s) = (b0*s^m + b1*s^(m-1) + ... + bm) / (a0*s^n + a1*s^(n-1) + ... + an)

# 一阶系统：G(s) = K / (τs + 1)
# K: 增益, τ: 时间常数
K = 2
tau = 0.5
num = [K]
den = [tau, 1]
sys_first_order = sig.TransferFunction(num, den)

# 二阶系统：G(s) = ωn^2 / (s^2 + 2ζωn*s + ωn^2)
# ωn: 固有频率, ζ: 阻尼比
wn = 10  # rad/s
zeta = 0.5  # 欠阻尼
num = [wn**2]
den = [1, 2*zeta*wn, wn**2]
sys_second_order = sig.TransferFunction(num, den)

# 阶跃响应
t1, y1 = sig.step(sys_first_order)
t2, y2 = sig.step(sys_second_order)

plt.figure(figsize=(10, 6))
plt.plot(t1, y1, label=f'First Order (τ={tau})')
plt.plot(t2, y2, label=f'Second Order (ζ={zeta}, ωn={wn})')
plt.axhline(K, color='r', linestyle='--', label='Steady State')
plt.xlabel('Time (s)')
plt.ylabel('Output')
plt.title('Step Response')
plt.legend()
plt.grid(True)
plt.savefig('step_response.png')
```

### 🔑 PID控制器

```python
import numpy as np
import matplotlib.pyplot as plt

class PIDController:
    def __init__(self, Kp, Ki, Kd, dt=0.01):
        self.Kp = Kp
        self.Ki = Ki
        self.Kd = Kd
        self.dt = dt
        
        self.integral = 0
        self.prev_error = 0
        
    def reset(self):
        self.integral = 0
        self.prev_error = 0
        
    def update(self, setpoint, measurement):
        error = setpoint - measurement
        
        # 比例项
        P = self.Kp * error
        
        # 积分项
        self.integral += error * self.dt
        I = self.Ki * self.integral
        
        # 微分项
        derivative = (error - self.prev_error) / self.dt
        D = self.Kd * derivative
        
        # 更新
        self.prev_error = error
        
        return P + I + D

# 仿真被控对象（一阶系统）
def simulate_plant(u, dt, tau=0.5, K=2):
    """一阶系统：tau * dy/dt + y = K * u"""
    # 离散化：y[k] = y[k-1] + dt/tau * (K*u[k-1] - y[k-1])
    y = np.zeros_like(u)
    for i in range(1, len(u)):
        y[i] = y[i-1] + dt/tau * (K*u[i-1] - y[i-1])
    return y

# 仿真参数
dt = 0.01
t = np.arange(0, 10, dt)
setpoint = np.ones_like(t) * 5  # 设定值5
setpoint[t < 1] = 0  # 前1秒为0

# 不同PID参数对比
cases = [
    {'Kp': 1, 'Ki': 0, 'Kd': 0, 'label': 'P only'},
    {'Kp': 1, 'Ki': 0.5, 'Kd': 0, 'label': 'PI'},
    {'Kp': 1, 'Ki': 0.5, 'Kd': 0.1, 'label': 'PID'},
    {'Kp': 2, 'Ki': 1, 'Kd': 0.2, 'label': 'PID (Aggressive)'},
]

plt.figure(figsize=(12, 8))

for i, case in enumerate(cases):
    pid = PIDController(case['Kp'], case['Ki'], case['Kd'], dt)
    
    # 仿真
    y = np.zeros_like(t)
    u = np.zeros_like(t)
    
    for k in range(1, len(t)):
        u[k] = pid.update(setpoint[k], y[k-1])
        # 限制控制量
        u[k] = np.clip(u[k], -10, 10)
        
        # 更新系统输出
        y[k] = y[k-1] + dt/0.5 * (2*u[k-1] - y[k-1])
    
    plt.subplot(2, 1, 1)
    plt.plot(t, y, label=case['label'])
    
    plt.subplot(2, 1, 2)
    plt.plot(t, u, label=case['label'])

plt.subplot(2, 1, 1)
plt.plot(t, setpoint, 'k--', label='Setpoint')
plt.xlabel('Time (s)')
plt.ylabel('Output')
plt.title('PID Control Response')
plt.legend()
plt.grid(True)

plt.subplot(2, 1, 2)
plt.xlabel('Time (s)')
plt.ylabel('Control Signal')
plt.title('Control Effort')
plt.legend()
plt.grid(True)

plt.tight_layout()
plt.savefig('pid_comparison.png')
```

### 🔑 稳定性分析

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal as sig

# 根轨迹分析
# 系统：G(s) = K / (s^3 + 6s^2 + 11s + 6)
# 开环极点：s = -1, -2, -3

num = [1]
den = [1, 6, 11, 6]
sys = sig.TransferFunction(num, den)

# 计算根轨迹
# 对于简单系统，可以手动计算极点随K的变化
K_range = np.logspace(-2, 2, 1000)
poles = []

for K in K_range:
    # 闭环特征方程：s^3 + 6s^2 + 11s + 6 + K = 0
    coeffs = [1, 6, 11, 6 + K]
    p = np.roots(coeffs)
    poles.append(p)

poles = np.array(poles)

# 绘制根轨迹
plt.figure(figsize=(10, 8))

# 绘制开环极点
open_loop_poles = np.roots(den)
plt.plot(np.real(open_loop_poles), np.imag(open_loop_poles), 
         'bx', markersize=15, label='Open-loop Poles')

# 绘制根轨迹
for i in range(3):
    plt.plot(np.real(poles[:, i]), np.imag(poles[:, i]), 'b-', linewidth=0.5)

# 绘制虚轴
plt.axvline(0, color='k', linewidth=0.5)
plt.axhline(0, color='k', linewidth=0.5)

plt.xlabel('Real Axis')
plt.ylabel('Imaginary Axis')
plt.title('Root Locus')
plt.legend()
plt.grid(True)
plt.axis('equal')
plt.savefig('root_locus.png')

# 劳斯-赫尔维茨稳定性判据
def routh_hurwitz(coeffs):
    """
    劳斯-赫尔维茨稳定性判据
    返回：是否稳定，劳斯表
    """
    n = len(coeffs) - 1
    routh_table = np.zeros((n+1, (n+1)//2 + 1))
    
    # 第一行
    routh_table[0, :(n+1)//2] = coeffs[::2]
    # 第二行
    routh_table[1, :n//2 + 1] = coeffs[1::2]
    
    # 计算其余行
    for i in range(2, n+1):
        for j in range((n-i)//2 + 1):
            if routh_table[i-1, 0] != 0:
                routh_table[i, j] = (routh_table[i-1, 0] * routh_table[i-2, j+1] - 
                                     routh_table[i-2, 0] * routh_table[i-1, j+1]) / routh_table[i-1, 0]
    
    # 检查第一列符号
    first_column = routh_table[:, 0]
    first_column = first_column[first_column != 0]
    
    is_stable = np.all(first_column > 0) or np.all(first_column < 0)
    
    return is_stable, routh_table

# 测试
coeffs = [1, 6, 11, 6]  # s^3 + 6s^2 + 11s + 6
is_stable, table = routh_hurwitz(coeffs)
print(f"系统稳定: {is_stable}")
print("劳斯表:")
print(table)
```

### 🔑 频率响应分析

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal as sig

# 伯德图分析
# 系统：G(s) = 100 / (s^2 + 10s + 100)
wn = 10
zeta = 0.5
num = [wn**2]
den = [1, 2*zeta*wn, wn**2]
sys = sig.TransferFunction(num, den)

# 计算频率响应
w, mag, phase = sig.bode(sys)

# 绘制伯德图
plt.figure(figsize=(10, 8))

plt.subplot(2, 1, 1)
plt.semilogx(w, mag)
plt.axhline(0, color='r', linestyle='--', label='0 dB')
plt.axvline(wn, color='g', linestyle='--', label=f'ωn={wn}')
plt.xlabel('Frequency (rad/s)')
plt.ylabel('Magnitude (dB)')
plt.title('Bode Plot - Magnitude')
plt.legend()
plt.grid(True)

plt.subplot(2, 1, 2)
plt.semilogx(w, phase)
plt.axhline(-180, color='r', linestyle='--', label='-180°')
plt.axvline(wn, color='g', linestyle='--', label=f'ωn={wn}')
plt.xlabel('Frequency (rad/s)')
plt.ylabel('Phase (degrees)')
plt.title('Bode Plot - Phase')
plt.legend()
plt.grid(True)

plt.tight_layout()
plt.savefig('bode_plot.png')

# 计算增益裕度和相位裕度
gm, pm, wg, wp = sig.margin(sys)
print(f"增益裕度: {gm:.2f} dB")
print(f"相位裕度: {pm:.2f}°")
print(f"增益穿越频率: {wg:.2f} rad/s")
print(f"相位穿越频率: {wp:.2f} rad/s")
```

## 完整跑通方案

**第一步：设计PID控制器**

```python
# Ziegler-Nichols整定法

# 1. 先纯P控制，逐渐增大Kp直到系统持续振荡
# 2. 记录临界增益Kc和振荡周期Pc
# 3. 根据Z-N公式整定

# Z-N公式
Kc = 10  # 临界增益（示例）
Pc = 2   # 振荡周期（示例）

# P控制
Kp_p = 0.5 * Kc

# PI控制
Kp_pi = 0.45 * Kc
Ti_pi = Pc / 1.2
Ki_pi = Kp_pi / Ti_pi

# PID控制
Kp_pid = 0.6 * Kc
Ti_pid = Pc / 2
Td_pid = Pc / 8
Ki_pid = Kp_pid / Ti_pid
Kd_pid = Kp_pid * Td_pid

print("Ziegler-Nichols整定结果：")
print(f"P: Kp={Kp_p:.2f}")
print(f"PI: Kp={Kp_pi:.2f}, Ki={Ki_pi:.2f}")
print(f"PID: Kp={Kp_pid:.2f}, Ki={Ki_pid:.2f}, Kd={Kd_pid:.2f}")
```

**第二步：仿真闭环系统**

```python
# 使用scipy的lsim仿真闭环系统
from scipy import signal as sig

# 被控对象：G(s) = 1 / (s^2 + 3s + 2)
plant_num = [1]
plant_den = [1, 3, 2]
plant = sig.TransferFunction(plant_num, plant_den)

# PID控制器：C(s) = Kp + Ki/s + Kd*s
Kp, Ki, Kd = 5, 2, 1

# PID的传递函数：C(s) = (Kd*s^2 + Kp*s + Ki) / s
pid_num = [Kd, Kp, Ki]
pid_den = [1, 0]
pid = sig.TransferFunction(pid_num, pid_den)

# 开环传递函数
open_loop = sig.TransferFunction(
    sig.convolve(pid_num, plant_num),
    sig.convolve(pid_den, plant_den)
)

# 闭环传递函数
# T(s) = G(s)C(s) / (1 + G(s)C(s))
cl_num = sig.convolve(pid_num, plant_num)
cl_den = sig.convolve(pid_den, plant_den) + sig.convolve(pid_num, plant_num)
closed_loop = sig.TransferFunction(cl_num, cl_den)

# 仿真
t = np.linspace(0, 10, 1000)
u = np.ones_like(t)  # 单位阶跃

# 加入扰动
u[t > 5] = 2  # 5秒后设定值变为2

t_out, y, x = sig.lsim(closed_loop, u, t)

plt.figure(figsize=(10, 6))
plt.plot(t_out, y, label='Output')
plt.plot(t, u, 'r--', label='Setpoint')
plt.xlabel('Time (s)')
plt.ylabel('Output')
plt.title('Closed-loop Step Response with PID')
plt.legend()
plt.grid(True)
plt.savefig('closed_loop_response.png')
```

## 常见误区

**误区 1：积分饱和 → 系统超调严重**

解释：当执行器饱和时，积分项继续累积，导致系统退出饱和时产生大的超调。应使用积分抗饱和（anti-windup）技术。

**误区 2：微分噪声放大 → 控制信号抖动**

解释：微分项对噪声敏感，高频噪声会被放大。应使用低通滤波器对微分项滤波，或改用微分先行。

**误区 3：忽视采样时间 → 离散化后性能下降**

解释：连续PID控制器离散化时，采样时间过大导致性能下降。采样时间应小于系统最小时间常数的1/10。

**误区 4：只看阶跃响应 → 忽视扰动抑制能力**

解释：好的控制器不仅要有好的跟踪性能，还要能抑制扰动。应在阶跃响应和扰动响应两方面评估。

**误区 5：PID万能论 → 复杂系统需要高级控制**

解释：PID适用于线性、时不变、单输入单输出系统。对于非线性、时变、多变量系统，需要自适应控制、预测控制等高级方法。
