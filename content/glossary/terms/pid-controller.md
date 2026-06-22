# PID控制器（PID Controller）

**PID控制器**是工业控制中最广泛使用的反馈控制器，由比例（P）、积分（I）、微分（D）三个环节组成。

## 控制原理

### 公式

```
u(t) = Kp * e(t) + Ki * ∫e(t)dt + Kd * de(t)/dt

u(t): 控制输出
e(t): 误差 = 设定值 - 实际值
Kp: 比例增益
Ki: 积分增益
Kd: 微分增益
```

### 三个环节的作用

```
┌─────────────────────────────────────────────────────┐
│ 比例（P）：Kp × 误差                                │
│   - 放大当前误差                                     │
│   - 响应快，但有稳态误差                              │
├─────────────────────────────────────────────────────┤
│ 积分（I）：Ki × 误差的累积                           │
│   - 消除稳态误差                                     │
│   - 可能引起超调和振荡                                │
├─────────────────────────────────────────────────────┤
│ 微分（D）：Kd × 误差的变化率                         │
│   - 预测误差趋势                                     │
│   - 抑制超调，提高稳定性                              │
└─────────────────────────────────────────────────────┘
```

## Python 实现

```python
class PIDController:
    def __init__(self, kp, ki, kd, setpoint=0):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.setpoint = setpoint
        self.integral = 0
        self.prev_error = 0
    
    def update(self, measurement, dt):
        """计算控制输出"""
        error = self.setpoint - measurement
        
        # 比例项
        p_term = self.kp * error
        
        # 积分项
        self.integral += error * dt
        i_term = self.ki * self.integral
        
        # 微分项
        derivative = (error - self.prev_error) / dt
        d_term = self.kd * derivative
        
        self.prev_error = error
        
        return p_term + i_term + d_term

# 示例：温度控制
pid = PIDController(kp=1.0, ki=0.1, kd=0.05, setpoint=100)

# 模拟控制循环
temperature = 25  # 初始温度
for _ in range(100):
    control = pid.update(temperature, dt=0.1)
    # 简单模拟：控制量影响温度变化
    temperature += control * 0.01
    print(f"温度: {temperature:.1f}°C")
```

## 参数整定方法

### Ziegler-Nichols 法

```python
def ziegler_nichols_tuning(ku, tu):
    """
    临界振荡法整定参数
    ku: 临界增益（产生等幅振荡的 Kp）
    tu: 振荡周期
    """
    # 经典 Ziegler-Nichols 公式
    kp = 0.6 * ku
    ki = 2 * kp / tu
    kd = kp * tu / 8
    
    return kp, ki, kd
```

### 手动整定步骤

1. **先调 P**：从小到大增加 Kp，直到系统出现等幅振荡
2. **再调 I**：加入积分项消除稳态误差，Ki 从小开始
3. **最后调 D**：加入微分项抑制超调，Kd 从小开始

## 应用场景

- **温度控制**：烤箱、空调、恒温箱
- **电机调速**：直流电机、步进电机转速控制
- **无人机姿态**：PID 平衡四旋翼飞行器
- **机器人运动**：机械臂位置控制、平衡车
- **过程控制**：液位、压力、流量控制

## 实际案例：四旋翼无人机

```python
class DronePIDController:
    def __init__(self):
        # 姿态 PID
        self.roll_pid = PIDController(kp=1.5, ki=0.5, kd=0.3)
        self.pitch_pid = PIDController(kp=1.5, ki=0.5, kd=0.3)
        self.yaw_pid = PIDController(kp=2.0, ki=0.0, kd=0.5)
        
        # 高度 PID
        self.altitude_pid = PIDController(kp=10.0, ki=2.0, kd=1.0)
    
    def control(self, target_roll, target_pitch, target_yaw, target_alt,
                current_roll, current_pitch, current_yaw, current_alt, dt):
        # 计算各轴控制量
        roll_out = self.roll_pid.update(current_roll, dt)
        pitch_out = self.pitch_pid.update(current_pitch, dt)
        yaw_out = self.yaw_pid.update(current_yaw, dt)
        alt_out = self.altitude_pid.update(current_alt, dt)
        
        # 混控 → 四个电机输出
        m1 = alt_out + roll_out + pitch_out + yaw_out
        m2 = alt_out + roll_out - pitch_out - yaw_out
        m3 = alt_out - roll_out - pitch_out + yaw_out
        m4 = alt_out - roll_out + pitch_out - yaw_out
        
        return [m1, m2, m3, m4]
```

## PID 的局限与改进

| 问题 | 解决方案 |
|------|---------|
| 积分饱和 | 抗积分饱和（Anti-windup） |
| 参数整定困难 | 自适应 PID、模糊 PID |
| 非线性系统 | 增益调度 PID |
| 模型不确定 | 鲁棒控制（H∞） |

## 相关概念

[磁场定向控制](/glossary/foc)、[电路](/glossary/circuit)、[控制系统](/glossary/control-system)
