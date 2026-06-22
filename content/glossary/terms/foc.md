# 磁场定向控制（FOC）

**FOC（Field Oriented Control，磁场定向控制）** 是一种高效的交流电机控制技术，通过Clarke变换和Park变换将三相电流分解为励磁分量和转矩分量，实现像直流电机一样精确控制交流电机。

## 核心原理

### 控制目标

```
三相交流电机（PMSM/BLDC）
  ↓
Clarke变换（abc → αβ）
  ↓
Park变换（αβ → dq）
  ↓
解耦为：
  - id（励磁分量）→ 控制磁场
  - iq（转矩分量）→ 控制转矩
```

### 坐标变换

```python
import numpy as np

def clarke_transform(ia, ib, ic):
    """Clarke变换：三相 → 两相静止坐标系"""
    i_alpha = ia
    i_beta = (ia + 2*ib) / np.sqrt(3)
    return i_alpha, i_beta

def park_transform(i_alpha, i_beta, theta):
    """Park变换：静止 → 旋转坐标系"""
    id = i_alpha * np.cos(theta) + i_beta * np.sin(theta)
    iq = -i_alpha * np.sin(theta) + i_beta * np.cos(theta)
    return id, iq
```

## FOC 控制框图

```
速度给定 ω* ──→ [速度PI] ──→ iq*
                              ↓
id*=0 ──────────────→ [电流PI] ──→ vd, vq
                              ↓
                        [逆Park变换]
                              ↓
                        [SVPWM调制]
                              ↓
                        [三相逆变器] ──→ 电机
                              ↑
                        [编码器/霍尔] ──→ 位置/速度反馈
```

## SVPWM（空间矢量脉宽调制）

```python
def svpwm(va, vb, vc, v_dc):
    """
    SVPWM 生成六路 PWM 信号
    va, vb, vc: 三相电压参考
    v_dc: 直流母线电压
    """
    # 归一化
    v_norm = np.array([va, vb, vc]) / v_dc
    
    # 确定扇区（6个扇区）
    sector = determine_sector(v_norm)
    
    # 计算作用时间
    t1, t2, t0 = calculate_dwell_times(sector, v_norm)
    
    # 生成 PWM 占空比
    return generate_pwm(sector, t1, t2, t0)
```

## 应用场景

- **电动汽车**：永磁同步电机（PMSM）驱动控制
- **机器人关节**：伺服电机精确位置/速度控制
- **无人机**：无刷直流电机（BLDC）高效驱动
- **工业自动化**：数控机床、纺织机械
- **家用电器**：变频空调、洗衣机

## 实际项目示例

```python
# STM32 FOC 控制简化代码
class FOCController:
    def __init__(self):
        self.speed_pi = PIController(kp=0.5, ki=0.1)
        self.id_pi = PIController(kp=1.0, ki=0.05)
        self.iq_pi = PIController(kp=1.0, ki=0.05)
    
    def control_loop(self, target_speed, current_speed, ia, ib, theta):
        # 1. 速度环
        iq_ref = self.speed_pi.update(target_speed - current_speed)
        id_ref = 0  # id=0 控制策略
        
        # 2. 电流采样和变换
        i_alpha, i_beta = clarke_transform(ia, ib, -(ia+ib))
        id, iq = park_transform(i_alpha, i_beta, theta)
        
        # 3. 电流环
        vd = self.id_pi.update(id_ref - id)
        vq = self.iq_pi.update(iq_ref - iq)
        
        # 4. 逆变换和 SVPWM
        va, vb, vc = inverse_park(vd, vq, theta)
        pwm = svpwm(va, vb, vc, v_dc=24)
        
        return pwm
```

## 相关概念

[电路](/glossary/circuit)、[PID控制器](/glossary/pid-controller)、[嵌入式系统](/glossary/embedded)
