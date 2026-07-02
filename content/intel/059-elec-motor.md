---
title: 电机控制与电力电子
category: embedded
keywords:
  - motor
  - foc
  - inverter
  - pwm
  - pmsm
  - bldc
  - power-electronics
difficulty: advanced
duration: 3周
summary: 掌握直流电机和交流电机的控制原理，理解FOC矢量控制和电力电子变换技术
takeaways:
  - 理解电机工作原理
  - 掌握FOC矢量控制
  - 理解电力电子变换技术
  - 能设计电机驱动系统
relatedIntel:
  - 052-embedded-c
  - 053-embedded-rtos
  - 054-elec-circuit
relatedNodes:
  - elec-motor
---

## 为什么你要学它

电机控制是现代工业和交通工具的核心。在AI和新能源时代：

- **电动汽车**：特斯拉、比亚迪的电机驱动系统
- **机器人**：伺服电机实现精确的位置和力控制
- **无人机**：无刷电机驱动螺旋桨
- **工业自动化**：变频调速、伺服定位

如果你不理解电机控制，就无法设计高性能的驱动系统。

## 一句话概览（快速版）

- **直流电机简单但维护难**：电刷磨损、火花问题
- **交流电机坚固但需要复杂控制**：PMSM、感应电机
- **FOC让交流电机像直流电机一样控制**：解耦励磁和转矩
- **PWM是电力电子的核心**：用开关实现电压调节

## 核心拆解

### 🔑 直流电机控制

```python
import numpy as np
import matplotlib.pyplot as plt

# 直流电机模型
# 电枢回路：Va = Ra*ia + La*dia/dt + Ke*ω
# 机械方程：J*dω/dt = Kt*ia - B*ω - TL

class DCMotor:
    def __init__(self, Ra=1.0, La=0.01, Ke=0.1, Kt=0.1, J=0.01, B=0.001):
        self.Ra = Ra  # 电枢电阻
        self.La = La  # 电枢电感
        self.Ke = Ke  # 反电动势常数
        self.Kt = Kt  # 转矩常数
        self.J = J    # 转动惯量
        self.B = B    # 阻尼系数
        
        # 状态变量
        self.ia = 0.0  # 电枢电流
        self.omega = 0.0  # 转速
        
    def update(self, Va, TL, dt):
        """更新电机状态"""
        # 电枢电流变化率
        dia_dt = (Va - self.Ra * self.ia - self.Ke * self.omega) / self.La
        
        # 转速变化率
        domega_dt = (self.Kt * self.ia - self.B * self.omega - TL) / self.J
        
        # 更新状态
        self.ia += dia_dt * dt
        self.omega += domega_dt * dt
        
        return self.ia, self.omega
    
    def get_speed_rpm(self):
        """获取转速（RPM）"""
        return self.omega * 60 / (2 * np.pi)

# 仿真直流电机
motor = DCMotor()
dt = 0.0001  # 100us
t = np.arange(0, 2, dt)

# 输入：阶跃电压
Va = np.ones_like(t) * 12  # 12V
Va[t < 0.5] = 0  # 前0.5秒为0

# 负载转矩
TL = np.ones_like(t) * 0.1  # 0.1 Nm

# 仿真
ia = np.zeros_like(t)
omega = np.zeros_like(t)
speed_rpm = np.zeros_like(t)

for i in range(len(t)):
    ia[i], omega[i] = motor.update(Va[i], TL[i], dt)
    speed_rpm[i] = motor.get_speed_rpm()

# 绘制结果
plt.figure(figsize=(12, 8))

plt.subplot(3, 1, 1)
plt.plot(t, Va)
plt.ylabel('Voltage (V)')
plt.title('DC Motor Response')
plt.grid(True)

plt.subplot(3, 1, 2)
plt.plot(t, ia)
plt.ylabel('Current (A)')
plt.grid(True)

plt.subplot(3, 1, 3)
plt.plot(t, speed_rpm)
plt.ylabel('Speed (RPM)')
plt.xlabel('Time (s)')
plt.grid(True)

plt.tight_layout()
plt.savefig('dc_motor_response.png')

# PWM调速
class PWMController:
    def __init__(self, frequency=1000):
        self.frequency = frequency
        self.period = 1.0 / frequency
        
    def generate_pwm(self, duty_cycle, t):
        """生成PWM信号"""
        phase = (t % self.period) / self.period
        return 1.0 if phase < duty_cycle else 0.0

# PWM调速仿真
pwm = PWMController(frequency=1000)
motor_pwm = DCMotor()

duty_cycles = [0.2, 0.4, 0.6, 0.8, 1.0]
speeds = []

for duty in duty_cycles:
    motor_pwm.ia = 0.0
    motor_pwm.omega = 0.0
    
    # 仿真1秒
    for i in range(int(1.0 / dt)):
        pwm_signal = pwm.generate_pwm(duty, i * dt)
        Va_pwm = 12 * pwm_signal
        motor_pwm.update(Va_pwm, 0.1, dt)
    
    speeds.append(motor_pwm.get_speed_rpm())

print("PWM调速特性：")
for duty, speed in zip(duty_cycles, speeds):
    print(f"Duty: {duty*100:.0f}%, Speed: {speed:.0f} RPM")
```

### 🔑 FOC矢量控制

```python
import numpy as np
import matplotlib.pyplot as plt

class PMSM_FOC:
    def __init__(self, Rs=0.5, Ld=0.005, Lq=0.005, Ke=0.1, poles=4, J=0.001):
        self.Rs = Rs  # 定子电阻
        self.Ld = Ld  # d轴电感
        self.Lq = Lq  # q轴电感
        self.Ke = Ke  # 反电动势常数
        self.poles = poles  # 极对数
        self.J = J    # 转动惯量
        
        # 状态变量
        self.id = 0.0  # d轴电流
        self.iq = 0.0  # q轴电流
        self.theta = 0.0  # 转子位置
        self.omega = 0.0  # 转速
        
        # PI控制器
        self.Kp_id = 10.0
        self.Ki_id = 100.0
        self.Kp_iq = 10.0
        self.Ki_iq = 100.0
        self.Kp_speed = 0.5
        self.Ki_speed = 5.0
        
        self.integral_id = 0.0
        self.integral_iq = 0.0
        self.integral_speed = 0.0
        
    def clarke_transform(self, ia, ib, ic):
        """Clarke变换：三相→两相静止坐标系"""
        ialpha = ia
        ibeta = (ia + 2*ib) / np.sqrt(3)
        return ialpha, ibeta
    
    def park_transform(self, ialpha, ibeta, theta):
        """Park变换：静止坐标系→旋转坐标系"""
        id = ialpha * np.cos(theta) + ibeta * np.sin(theta)
        iq = -ialpha * np.sin(theta) + ibeta * np.cos(theta)
        return id, iq
    
    def inverse_park(self, vd, vq, theta):
        """反Park变换"""
        valpha = vd * np.cos(theta) - vq * np.sin(theta)
        vbeta = vd * np.sin(theta) + vq * np.cos(theta)
        return valpha, vbeta
    
    def inverse_clarke(self, valpha, vbeta):
        """反Clarke变换"""
        va = valpha
        vb = (-valpha + np.sqrt(3)*vbeta) / 2
        vc = (-valpha - np.sqrt(3)*vbeta) / 2
        return va, vb, vc
    
    def svpwm(self, valpha, vbeta, Vdc):
        """空间矢量PWM"""
        # 扇区判断
        Vref = np.sqrt(valpha**2 + vbeta**2)
        angle = np.arctan2(vbeta, valpha)
        
        # 限制电压
        Vref = min(Vref, Vdc / np.sqrt(3))
        
        # 计算占空比（简化）
        duty_a = 0.5 + valpha / Vdc
        duty_b = 0.5 + (-valpha/2 + np.sqrt(3)*vbeta/2) / Vdc
        duty_c = 0.5 + (-valpha/2 - np.sqrt(3)*vbeta/2) / Vdc
        
        return np.clip([duty_a, duty_b, duty_c], 0, 1)
    
    def update(self, speed_ref, ia, ib, ic, theta, omega, dt):
        """FOC控制周期"""
        # 速度环
        speed_error = speed_ref - omega
        self.integral_speed += speed_error * dt
        iq_ref = self.Kp_speed * speed_error + self.Ki_speed * self.integral_speed
        iq_ref = np.clip(iq_ref, -10, 10)  # 限制电流
        
        # d轴电流给定（id=0控制）
        id_ref = 0.0
        
        # 坐标变换
        ialpha, ibeta = self.clarke_transform(ia, ib, ic)
        id_meas, iq_meas = self.park_transform(ialpha, ibeta, theta)
        
        # 电流环（d轴）
        id_error = id_ref - id_meas
        self.integral_id += id_error * dt
        vd = self.Kp_id * id_error + self.Ki_id * self.integral_id
        vd -= omega * self.Lq * iq_meas  # 解耦项
        
        # 电流环（q轴）
        iq_error = iq_ref - iq_meas
        self.integral_iq += iq_error * dt
        vq = self.Kp_iq * iq_error + self.Ki_iq * self.integral_iq
        vq += omega * (self.Ld * id_meas + self.Ke)  # 解耦项
        
        # 反变换
        valpha, vbeta = self.inverse_park(vd, vq, theta)
        va, vb, vc = self.inverse_clarke(valpha, vbeta)
        
        return va, vb, vc, iq_ref

# FOC仿真
foc = PMSM_FOC()
dt = 0.0001
t = np.arange(0, 1, dt)

# 速度给定
speed_ref = np.ones_like(t) * 100  # 100 rad/s
speed_ref[t < 0.2] = 0

# 仿真
speed = np.zeros_like(t)
vd = np.zeros_like(t)
vq = np.zeros_like(t)

for i in range(len(t)):
    # 模拟电机电流（简化）
    ia = foc.iq * np.sin(foc.theta)
    ib = foc.iq * np.sin(foc.theta - 2*np.pi/3)
    ic = foc.iq * np.sin(foc.theta + 2*np.pi/3)
    
    # FOC控制
    va, vb, vc, iq_ref = foc.update(speed_ref[i], ia, ib, ic, foc.theta, foc.omega, dt)
    
    # 简化电机模型更新
    foc.iq += (va[0] - foc.Rs * foc.iq - foc.Ke * foc.omega) / foc.Lq * dt
    foc.omega += (foc.Ke * foc.iq - 0.01 * foc.omega) / foc.J * dt
    foc.theta += foc.omega * dt
    
    speed[i] = foc.omega
    vd[i] = va[0]
    vq[i] = iq_ref

# 绘制结果
plt.figure(figsize=(12, 8))

plt.subplot(2, 1, 1)
plt.plot(t, speed_ref, 'r--', label='Reference')
plt.plot(t, speed, 'b-', label='Actual')
plt.ylabel('Speed (rad/s)')
plt.title('FOC Speed Control')
plt.legend()
plt.grid(True)

plt.subplot(2, 1, 2)
plt.plot(t, vq)
plt.ylabel('q-axis Current (A)')
plt.xlabel('Time (s)')
plt.title('Torque Current')
plt.grid(True)

plt.tight_layout()
plt.savefig('foc_speed_control.png')
```

### 🔑 逆变器与PWM

```python
import numpy as np
import matplotlib.pyplot as plt

# 三相逆变器仿真

class ThreePhaseInverter:
    def __init__(self, Vdc=310, switching_freq=10000):
        self.Vdc = Vdc  # 直流母线电压
        self.switching_freq = switching_freq
        self.period = 1.0 / switching_freq
        
    def generate_spwm(self, va_ref, vb_ref, vc_ref, t):
        """正弦PWM"""
        # 载波（三角波）
        carrier_phase = (t % self.period) / self.period
        if carrier_phase < 0.5:
            carrier = 2 * carrier_phase
        else:
            carrier = 2 * (1 - carrier_phase)
        
        # 比较
        sa = 1 if va_ref / self.Vdc > carrier else 0
        sb = 1 if vb_ref / self.Vdc > carrier else 0
        sc = 1 if vc_ref / self.Vdc > carrier else 0
        
        return sa, sb, sc
    
    def generate_svpwm(self, valpha, vbeta, t):
        """空间矢量PWM"""
        # 扇区判断
        Vref = np.sqrt(valpha**2 + vbeta**2)
        angle = np.arctan2(vbeta, valpha)
        
        # 限制电压
        Vmax = self.Vdc / np.sqrt(3)
        if Vref > Vmax:
            valpha = valpha * Vmax / Vref
            vbeta = vbeta * Vmax / Vref
            Vref = Vmax
        
        # 计算占空比
        duty_a = 0.5 + valpha / self.Vdc
        duty_b = 0.5 + (-valpha/2 + np.sqrt(3)*vbeta/2) / self.Vdc
        duty_c = 0.5 + (-valpha/2 - np.sqrt(3)*vbeta/2) / self.Vdc
        
        # PWM生成
        carrier_phase = (t % self.period) / self.period
        sa = 1 if duty_a > carrier_phase else 0
        sb = 1 if duty_b > carrier_phase else 0
        sc = 1 if duty_c > carrier_phase else 0
        
        return sa, sb, sc
    
    def output_voltage(self, sa, sb, sc):
        """计算输出电压"""
        # 假设中点接地
        va = (sa - 0.5) * self.Vdc
        vb = (sb - 0.5) * self.Vdc
        vc = (sc - 0.5) * self.Vdc
        return va, vb, vc

# 仿真逆变器
inverter = ThreePhaseInverter(Vdc=310, switching_freq=10000)

# 生成三相正弦参考电压
f_out = 50  # 输出频率50Hz
t = np.linspace(0, 0.02, 10000)  # 2个周期

va_ref = 200 * np.sin(2 * np.pi * f_out * t)
vb_ref = 200 * np.sin(2 * np.pi * f_out * t - 2*np.pi/3)
vc_ref = 200 * np.sin(2 * np.pi * f_out * t + 2*np.pi/3)

# 生成PWM
va_out = np.zeros_like(t)
vb_out = np.zeros_like(t)
vc_out = np.zeros_like(t)

for i in range(len(t)):
    sa, sb, sc = inverter.generate_spwm(va_ref[i], vb_ref[i], vc_ref[i], t[i])
    va_out[i], vb_out[i], vc_out[i] = inverter.output_voltage(sa, sb, sc)

# 绘制结果
plt.figure(figsize=(12, 10))

plt.subplot(3, 1, 1)
plt.plot(t*1000, va_ref, 'r--', label='Reference')
plt.plot(t*1000, va_out, 'b-', label='PWM Output')
plt.ylabel('Voltage (V)')
plt.title('Phase A Voltage')
plt.legend()
plt.grid(True)

plt.subplot(3, 1, 2)
plt.plot(t*1000, vb_ref, 'r--', label='Reference')
plt.plot(t*1000, vb_out, 'b-', label='PWM Output')
plt.ylabel('Voltage (V)')
plt.title('Phase B Voltage')
plt.legend()
plt.grid(True)

plt.subplot(3, 1, 3)
plt.plot(t*1000, vc_ref, 'r--', label='Reference')
plt.plot(t*1000, vc_out, 'b-', label='PWM Output')
plt.ylabel('Voltage (V)')
plt.xlabel('Time (ms)')
plt.title('Phase C Voltage')
plt.legend()
plt.grid(True)

plt.tight_layout()
plt.savefig('inverter_pwm.png')

# 分析谐波
from scipy.fft import fft

N = len(va_out)
fft_result = fft(va_out)
freqs = np.fft.fftfreq(N, t[1]-t[0])

plt.figure(figsize=(10, 6))
plt.plot(freqs[:N//2], np.abs(fft_result[:N//2]) / N * 2)
plt.xlabel('Frequency (Hz)')
plt.ylabel('Magnitude')
plt.title('PWM Output Spectrum')
plt.xlim(0, 5000)
plt.grid(True)
plt.savefig('pwm_spectrum.png')
```

## 完整跑通方案

**第一步：设计电机驱动系统**

```python
# 电机参数计算

# PMSM电机参数
Pn = 1000  # 额定功率 (W)
Un = 48    # 额定电压 (V)
In = 25    # 额定电流 (A)
nn = 3000  # 额定转速 (RPM)
poles = 4  # 极对数

# 计算反电动势常数
Ke = Un / (nn * 2 * np.pi / 60)  # V/(rad/s)
print(f"反电动势常数 Ke: {Ke:.4f} V/(rad/s)")

# 计算转矩常数
Kt = Pn / (In * nn * 2 * np.pi / 60)  # Nm/A
print(f"转矩常数 Kt: {Kt:.4f} Nm/A")

# 计算额定转矩
Tn = Pn / (nn * 2 * np.pi / 60)
print(f"额定转矩 Tn: {Tn:.2f} Nm")

# 逆变器设计
Vdc = 60  # 直流母线电压
I_max = In * 1.5  # 最大电流

# MOSFET选型
# 电压裕量：Vds > Vdc * 1.5
Vds_min = Vdc * 1.5
print(f"MOSFET Vds最小值: {Vds_min:.0f}V")

# 电流裕量：Id > I_max * 1.5
Id_min = I_max * 1.5
print(f"MOSFET Id最小值: {Id_min:.1f}A")

# 开关频率
f_sw = 10000  # 10kHz
print(f"开关频率: {f_sw/1000:.0f}kHz")

# 死区时间
t_dead = 1e-6  # 1us
print(f"死区时间: {t_dead*1e6:.0f}us")
```

**第二步：实现FOC控制**

```python
# FOC控制参数整定

# 电流环PI参数
# 带宽 = 1/10 * 开关频率
bandwidth_current = f_sw / 10
Kp_id = bandwidth_current * Ld
Ki_id = bandwidth_current * Rs
Kp_iq = bandwidth_current * Lq
Ki_iq = bandwidth_current * Rs

print("电流环PI参数：")
print(f"Kp_id: {Kp_id:.2f}, Ki_id: {Ki_id:.2f}")
print(f"Kp_iq: {Kp_iq:.2f}, Ki_iq: {Ki_iq:.2f}")

# 速度环PI参数
# 带宽 = 1/10 * 电流环带宽
bandwidth_speed = bandwidth_current / 10
Kp_speed = bandwidth_speed * J / Kt
Ki_speed = bandwidth_speed * B / Kt

print("\n速度环PI参数：")
print(f"Kp_speed: {Kp_speed:.4f}, Ki_speed: {Ki_speed:.4f}")
```

## 常见误区

**误区 1：忽视死区时间 → H桥直通短路**

解释：同一桥臂上下两个开关管不能同时导通，否则会造成电源短路。必须设置足够的死区时间（通常1-5μs），但死区时间过大会导致输出电压失真。

**误区 2：忽视电流采样 → 控制精度差**

解释：FOC需要精确的相电流采样。采样电阻的温漂、ADC的量化误差、采样时刻的偏差都会影响控制精度。应使用低温漂电阻和同步采样。

**误区 3：忽视电机参数辨识 → 控制性能下降**

解释：FOC控制依赖于电机参数（Rs, Ld, Lq, Ke）。实际电机参数可能与标称值有偏差，应进行参数辨识或在线参数估计。

**误区 4：忽视热设计 → 驱动器过热损坏**

解释：MOSFET和IGBT的导通损耗和开关损耗会产生热量。必须计算总损耗，设计合适的散热方案。结温不能超过最大允许值。

**误区 5：忽视EMC设计 → 系统干扰严重**

解释：PWM开关会产生高频电磁干扰。需要合理设计PCB布局、添加滤波电路、使用屏蔽措施，确保系统通过EMC测试。
