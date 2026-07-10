---
title: 伺服控制系统
category: embedded
difficulty: intermediate
duration: 2-3周
summary: 理解伺服控制系统的原理与应用。掌握伺服电机控制、编码器反馈、运动规划等核心技能。
takeaways:
  - 理解伺服电机的工作原理
  - 掌握位置、速度、扭矩控制
  - 理解编码器反馈原理
  - 掌握运动控制编程
relatedIntel:
  - 052-embedded-c
  - 053-embedded-rtos
  - 054-elec-circuit
relatedNodes:
  - "electrical-safety"
  - "ctrl-servo"
tags:
  - 伺服电机
  - 伺服控制
  - 运动控制
  - 编码器
  - PID控制
relatedTerms:
  - "data-structure"
  - "rtos"
  - "algorithm"
  - "complexity"
relatedTools:
  - "pytorch"
  - "ultralytics-yolo"
  - "huggingface-transformers"
---

## 为什么你要学它

伺服控制是工业自动化和机器人技术的核心。在现代智能制造中：

- **工业机器人**：六轴机械臂的精确轨迹跟踪
- **数控机床**：高精度加工定位控制
- **自动化产线**：传送带同步、物料搬运
- **半导体设备**：晶圆对准、光刻定位
- **医疗机器人**：手术机器人精准操作

伺服系统相比普通电机控制，具有更高的定位精度（微米级）、更快的响应速度（毫秒级）和更强的抗干扰能力。

## 一句话概览（快速版）

- **伺服 = 电机 + 编码器 + 驱动器 + 控制器**：闭环反馈系统
- **三种控制模式**：位置控制（定位）、速度控制（调速）、扭矩控制（力控）
- **编码器是眼睛**：提供位置反馈，决定控制精度
- **运动规划是大脑**：规划轨迹，决定运动平滑性

## 核心拆解

### 🔑 伺服电机原理

```python
import numpy as np
import matplotlib.pyplot as plt

class ServoMotor:
    """交流伺服电机模型（永磁同步电机PMSM）"""

    def __init__(self):
        # 电机参数
        self.Rs = 0.5       # 定子电阻 (Ω)
        self.Ld = 0.005     # d轴电感 (H)
        self.Lq = 0.005     # q轴电感 (H)
        self.psi_f = 0.1    # 永磁体磁链 (Wb)
        self.p = 4          # 极对数
        self.J = 0.001      # 转动惯量 (kg·m²)
        self.B = 0.0001     # 阻尼系数 (N·m·s/rad)

        # 状态变量
        self.theta_e = 0.0  # 电角度 (rad)
        self.theta_m = 0.0  # 机械角度 (rad)
        self.omega_e = 0.0  # 电角速度 (rad/s)
        self.omega_m = 0.0  # 机械角速度 (rad/s)
        self.id = 0.0       # d轴电流 (A)
        self.iq = 0.0       # q轴电流 (A)

    def update(self, vd, vq, TL, dt):
        """
        更新电机状态
        vd, vq: d-q轴电压
        TL: 负载转矩 (N·m)
        dt: 时间步长 (s)
        """
        # 电磁转矩
        Te = 1.5 * self.p * (self.psi_f * self.iq + (self.Ld - self.Lq) * self.id * self.iq)

        # 电流动态（简化模型）
        did_dt = (vd - self.Rs * self.id + self.omega_e * self.Lq * self.iq) / self.Ld
        diq_dt = (vq - self.Rs * self.iq - self.omega_e * (self.Ld * self.id + self.psi_f)) / self.Lq

        # 机械动态
        domega_dt = (Te - self.B * self.omega_m - TL) / self.J

        # 更新状态
        self.id += did_dt * dt
        self.iq += diq_dt * dt
        self.omega_m += domega_dt * dt
        self.omega_e = self.omega_m * self.p
        self.theta_m += self.omega_m * dt
        self.theta_e += self.omega_e * dt

        return Te, self.omega_m, self.theta_m

# 仿真伺服电机启动
motor = ServoMotor()
dt = 0.0001
t = np.arange(0, 1, dt)

# 给定电压（id=0控制）
vd = np.zeros_like(t)
vq = np.ones_like(t) * 50  # q轴电压

# 记录数据
speed = np.zeros_like(t)
torque = np.zeros_like(t)
position = np.zeros_like(t)

for i in range(len(t)):
    Te, omega, theta = motor.update(vd[i], vq[i], 0.1, dt)
    speed[i] = omega * 60 / (2 * np.pi)  # 转换为RPM
    torque[i] = Te
    position[i] = theta

# 绘制结果
plt.figure(figsize=(12, 8))

plt.subplot(3, 1, 1)
plt.plot(t, speed)
plt.ylabel('Speed (RPM)')
plt.title('Servo Motor Startup Response')
plt.grid(True)

plt.subplot(3, 1, 2)
plt.plot(t, torque)
plt.ylabel('Torque (N·m)')
plt.grid(True)

plt.subplot(3, 1, 3)
plt.plot(t, position * 180 / np.pi)
plt.ylabel('Position (deg)')
plt.xlabel('Time (s)')
plt.grid(True)

plt.tight_layout()
plt.savefig('servo_motor_response.png')
print("伺服电机启动仿真完成")
```

### 🔑 三种控制模式

```python
import numpy as np
import matplotlib.pyplot as plt

class ServoController:
    """伺服控制器 - 支持位置/速度/扭矩三种模式"""

    def __init__(self):
        # 位置环参数
        self.Kp_pos = 100.0   # 位置环比例增益
        self.Ki_pos = 0.0     # 位置环积分增益
        self.Kd_pos = 5.0     # 位置环微分增益

        # 速度环参数
        self.Kp_vel = 2.0     # 速度环比例增益
        self.Ki_vel = 10.0    # 速度环积分增益

        # 扭矩环参数（电流环）
        self.Kp_tq = 0.5      # 扭矩环比例增益
        self.Ki_tq = 5.0      # 扭矩环积分增益

        # 状态变量
        self.pos_integral = 0.0
        self.vel_integral = 0.0
        self.tq_integral = 0.0
        self.prev_pos_error = 0.0

        self.dt = 0.001  # 控制周期 1ms

    def position_control(self, pos_ref, pos_fb, vel_fb):
        """位置控制模式"""
        # 位置误差
        pos_error = pos_ref - pos_fb

        # PID计算
        self.pos_integral += pos_error * self.dt
        pos_derivative = (pos_error - self.prev_pos_error) / self.dt
        self.prev_pos_error = pos_error

        # 速度给定
        vel_ref = (self.Kp_pos * pos_error +
                   self.Ki_pos * self.pos_integral +
                   self.Kd_pos * pos_derivative)

        # 速度环
        vel_error = vel_ref - vel_fb
        self.vel_integral += vel_error * self.dt
        torque_ref = self.Kp_vel * vel_error + self.Ki_vel * self.vel_integral

        return vel_ref, torque_ref

    def velocity_control(self, vel_ref, vel_fb):
        """速度控制模式"""
        vel_error = vel_ref - vel_fb
        self.vel_integral += vel_error * self.dt

        # 抗饱和
        max_integral = 10.0
        self.vel_integral = np.clip(self.vel_integral, -max_integral, max_integral)

        torque_ref = self.Kp_vel * vel_error + self.Ki_vel * self.vel_integral
        return torque_ref

    def torque_control(self, tq_ref, tq_fb):
        """扭矩控制模式"""
        tq_error = tq_ref - tq_fb
        self.tq_integral += tq_error * self.dt

        # 电流给定（扭矩/电流成正比）
        current_ref = self.Kp_tq * tq_error + self.Ki_tq * self.tq_integral
        return current_ref

# 仿真三种控制模式
controller = ServoController()
dt = 0.001
t = np.arange(0, 5, dt)

# ===== 位置控制仿真 =====
pos_ref = np.zeros_like(t)
pos_ref[t > 1] = np.pi      # 1秒后转到180度
pos_ref[t > 3] = 2 * np.pi  # 3秒后转到360度

pos_fb = np.zeros_like(t)
vel_fb = np.zeros_like(t)

for i in range(1, len(t)):
    vel_ref, tq_ref = controller.position_control(pos_ref[i], pos_fb[i-1], vel_fb[i-1])

    # 简化电机模型
    vel_fb[i] = vel_fb[i-1] + (tq_ref - 0.01 * vel_fb[i-1]) * dt / 0.001
    pos_fb[i] = pos_fb[i-1] + vel_fb[i] * dt

# 绘制位置控制结果
plt.figure(figsize=(12, 10))

plt.subplot(3, 1, 1)
plt.plot(t, pos_ref * 180 / np.pi, 'r--', label='Reference')
plt.plot(t, pos_fb * 180 / np.pi, 'b-', label='Actual')
plt.ylabel('Position (deg)')
plt.title('Position Control Mode')
plt.legend()
plt.grid(True)

# ===== 速度控制仿真 =====
controller = ServoController()  # 重置
vel_ref = np.zeros_like(t)
vel_ref[t > 1] = 100  # 100 rad/s
vel_ref[t > 3] = -50   # -50 rad/s

vel_fb = np.zeros_like(t)

for i in range(1, len(t)):
    tq_ref = controller.velocity_control(vel_ref[i], vel_fb[i-1])
    vel_fb[i] = vel_fb[i-1] + (tq_ref - 0.01 * vel_fb[i-1]) * dt / 0.001

plt.subplot(3, 1, 2)
plt.plot(t, vel_ref, 'r--', label='Reference')
plt.plot(t, vel_fb, 'b-', label='Actual')
plt.ylabel('Velocity (rad/s)')
plt.title('Velocity Control Mode')
plt.legend()
plt.grid(True)

# ===== 扭矩控制仿真 =====
controller = ServoController()
tq_ref = np.zeros_like(t)
tq_ref[t > 1] = 0.5   # 0.5 N·m
tq_ref[t > 3] = -0.3  # -0.3 N·m

tq_fb = np.zeros_like(t)

for i in range(1, len(t)):
    current_ref = controller.torque_control(tq_ref[i], tq_fb[i-1])
    # 简化电流响应
    tq_fb[i] = tq_fb[i-1] + (current_ref - tq_fb[i-1]) * 10 * dt

plt.subplot(3, 1, 3)
plt.plot(t, tq_ref, 'r--', label='Reference')
plt.plot(t, tq_fb, 'b-', label='Actual')
plt.ylabel('Torque (N·m)')
plt.xlabel('Time (s)')
plt.title('Torque Control Mode')
plt.legend()
plt.grid(True)

plt.tight_layout()
plt.savefig('servo_control_modes.png')
print("三种控制模式仿真完成")
```

### 🔑 编码器反馈

```python
import numpy as np
import matplotlib.pyplot as plt

class Encoder:
    """编码器仿真"""

    def __init__(self, ppr=2500, encoder_type='incremental'):
        """
        ppr: 每转脉冲数（Pulses Per Revolution）
        encoder_type: 'incremental' 或 'absolute'
        """
        self.ppr = ppr
        self.encoder_type = encoder_type
        self.resolution = ppr * 4  # 四倍频

        # 状态
        self.position = 0.0      # 当前位置（脉冲数）
        self.prev_position = 0.0
        self.velocity = 0.0

        # 绝对值编码器参数
        self.multi_turn = 0     # 多圈计数

    def read(self, true_position, dt):
        """
        读取编码器
        true_position: 真实位置（弧度）
        返回：位置（弧度）、速度（rad/s）
        """
        # 转换为脉冲数
        pulses = true_position / (2 * np.pi) * self.resolution

        if self.encoder_type == 'incremental':
            # 增量式编码器：计算增量
            delta_pulses = pulses - self.position
            self.position += np.round(delta_pulses)  # 量化
        else:
            # 绝对值编码器：直接读取
            self.position = np.round(pulses) % self.resolution

        # 计算速度
        self.velocity = (self.position - self.prev_position) / dt * (2 * np.pi) / self.resolution
        self.prev_position = self.position

        # 转换回弧度
        position_rad = self.position * 2 * np.pi / self.resolution

        return position_rad, self.velocity

    def get_resolution_deg(self):
        """获取分辨率（度）"""
        return 360.0 / self.resolution

# 比较不同分辨率编码器
encoders = [
    Encoder(ppr=1000, encoder_type='incremental'),
    Encoder(ppr=2500, encoder_type='incremental'),
    Encoder(ppr=10000, encoder_type='incremental'),
]

print("编码器分辨率对比：")
for i, enc in enumerate(encoders):
    print(f"  {enc.ppr} PPR: 分辨率 = {enc.get_resolution_deg():.4f}°")

# 仿真编码器反馈
dt = 0.001
t = np.arange(0, 2, dt)

# 真实位置：正弦运动
true_position = np.sin(2 * np.pi * 0.5 * t)  # 0.5 Hz

# 记录数据
positions = [[] for _ in encoders]
velocities = [[] for _ in encoders]

for i, enc in enumerate(encoders):
    for j in range(len(t)):
        pos, vel = enc.read(true_position[j], dt)
        positions[i].append(pos)
        velocities[i].append(vel)

# 绘制结果
plt.figure(figsize=(12, 8))

plt.subplot(2, 1, 1)
plt.plot(t, true_position, 'k-', label='True Position', linewidth=2)
for i, enc in enumerate(encoders):
    plt.plot(t, positions[i], '--', label=f'{enc.ppr} PPR')
plt.ylabel('Position (rad)')
plt.title('Encoder Resolution Comparison')
plt.legend()
plt.grid(True)

plt.subplot(2, 1, 2)
for i, enc in enumerate(encoders):
    plt.plot(t, velocities[i], label=f'{enc.ppr} PPR')
plt.ylabel('Velocity (rad/s)')
plt.xlabel('Time (s)')
plt.legend()
plt.grid(True)

plt.tight_layout()
plt.savefig('encoder_comparison.png')

# 编码器方向检测
class QuadratureDecoder:
    """正交编码器解码器"""

    def __init__(self, ppr=2500):
        self.ppr = ppr
        self.count = 0
        self.prev_A = 0
        self.prev_B = 0

    def update(self, A, B):
        """
        更新编码器计数
        A, B: 正交信号（0或1）
        返回：计数增量
        """
        # 状态转换表
        # A B  prev_A prev_B  direction
        # 0 0    0     1       -1
        # 0 1    1     1       +1
        # 1 1    1     0       -1
        # 1 0    0     0       +1
        # 正转序列：00→01→11→10→00（+1）
        # 反转序列：00→10→11→01→00（-1）

        state = (A << 1) | B
        prev_state = (self.prev_A << 1) | self.prev_B

        # 方向判断
        if prev_state == 0:
            if state == 1:      # 00 -> 01
                delta = 1
            elif state == 2:    # 00 -> 10
                delta = -1
            else:
                delta = 0
        elif prev_state == 1:
            if state == 3:      # 01 -> 11
                delta = 1
            elif state == 0:    # 01 -> 00
                delta = -1
            else:
                delta = 0
        elif prev_state == 3:
            if state == 2:      # 11 -> 10
                delta = 1
            elif state == 1:    # 11 -> 01
                delta = -1
            else:
                delta = 0
        else:  # prev_state == 2
            if state == 0:      # 10 -> 00
                delta = 1
            elif state == 3:    # 10 -> 11
                delta = -1
            else:
                delta = 0

        self.count += delta
        self.prev_A = A
        self.prev_B = B

        return delta

# 演示正交解码
decoder = QuadratureDecoder(ppr=2500)

# 模拟正转
print("\n正交编码器解码演示（正转）：")
for state_seq in [(0,0), (0,1), (1,1), (1,0), (0,0), (0,1), (1,1), (1,0)]:
    A, B = state_seq
    delta = decoder.update(A, B)
    print(f"  A={A}, B={B} -> delta={delta}, count={decoder.count}")

print("\n正交编码器解码演示（反转）：")
for state_seq in [(0,0), (1,0), (1,1), (0,1), (0,0), (1,0), (1,1), (0,1)]:
    A, B = state_seq
    delta = decoder.update(A, B)
    print(f"  A={A}, B={B} -> delta={delta}, count={decoder.count}")
```

### 🔑 运动规划

```python
import numpy as np
import matplotlib.pyplot as plt

class MotionPlanner:
    """运动规划器"""

    def __init__(self, max_velocity=100, max_acceleration=500, max_jerk=5000):
        self.max_velocity = max_velocity          # 最大速度 (单位/s)
        self.max_acceleration = max_acceleration  # 最大加速度 (单位/s²)
        self.max_jerk = max_jerk                  # 最大加加速度 (单位/s³)

    def trapezoidal_profile(self, start_pos, end_pos, dt=0.001):
        """
        梯形速度规划
        返回：时间、位置、速度、加速度
        """
        distance = abs(end_pos - start_pos)
        direction = np.sign(end_pos - start_pos)

        # 计算加速时间和匀速时间
        t_accel = self.max_velocity / self.max_acceleration
        d_accel = 0.5 * self.max_acceleration * t_accel ** 2

        if 2 * d_accel >= distance:
            # 三角形速度曲线（没有匀速段）
            t_accel = np.sqrt(distance / self.max_acceleration)
            t_const = 0
            v_max = self.max_acceleration * t_accel
        else:
            # 梯形速度曲线
            d_const = distance - 2 * d_accel
            t_const = d_const / self.max_velocity
            v_max = self.max_velocity

        total_time = 2 * t_accel + t_const

        # 生成轨迹
        t = np.arange(0, total_time + dt, dt)
        pos = np.zeros_like(t)
        vel = np.zeros_like(t)
        acc = np.zeros_like(t)

        for i, ti in enumerate(t):
            if ti < t_accel:
                # 加速段
                acc[i] = self.max_acceleration
                vel[i] = self.max_acceleration * ti
                pos[i] = 0.5 * self.max_acceleration * ti ** 2
            elif ti < t_accel + t_const:
                # 匀速段
                acc[i] = 0
                vel[i] = v_max
                pos[i] = d_accel + v_max * (ti - t_accel)
            else:
                # 减速段
                t_decel = ti - t_accel - t_const
                acc[i] = -self.max_acceleration
                vel[i] = v_max - self.max_acceleration * t_decel
                pos[i] = distance - 0.5 * self.max_acceleration * (t_accel - t_decel) ** 2

        # 应用方向
        pos = start_pos + direction * pos
        vel = direction * vel
        acc = direction * acc

        return t, pos, vel, acc

    def s_curve_profile(self, start_pos, end_pos, dt=0.001):
        """
        S曲线速度规划（七段式）
        更平滑，减少机械冲击
        """
        distance = abs(end_pos - start_pos)
        direction = np.sign(end_pos - start_pos)

        # 简化S曲线：使用正弦加速度曲线
        # 加加速度段 -> 匀加速段 -> 减加加速度段 -> 匀速段 -> ...

        t_j = self.max_acceleration / self.max_jerk  # 加加速度段时间
        a_max = self.max_acceleration
        v_max = self.max_velocity

        # 计算各段时间
        t_a = a_max / self.max_jerk  # 加加速度达到最大加速度的时间

        # 简化：使用梯形+正弦平滑
        t_total = distance / v_max + 2 * v_max / a_max
        t_total = max(t_total, 4 * t_a)  # 确保足够时间

        t = np.arange(0, t_total + dt, dt)
        pos = np.zeros_like(t)
        vel = np.zeros_like(t)
        acc = np.zeros_like(t)

        # 使用平滑函数
        for i, ti in enumerate(t):
            # 归一化时间
            tau = ti / t_total

            # S曲线速度（平滑梯形）
            if tau < 0.5:
                # 加速段
                vel[i] = v_max * (1 - np.cos(2 * np.pi * tau)) / 2
            else:
                # 减速段
                vel[i] = v_max * (1 + np.cos(2 * np.pi * (tau - 0.5))) / 2

            # 加速度
            if i > 0:
                acc[i] = (vel[i] - vel[i-1]) / dt

            # 位置
            if i > 0:
                pos[i] = pos[i-1] + vel[i] * dt

        # 归一化位置
        pos = pos / pos[-1] * distance

        # 应用方向
        pos = start_pos + direction * pos
        vel = direction * vel
        acc = direction * acc

        return t, pos, vel, acc

# 比较梯形和S曲线
planner = MotionPlanner(max_velocity=100, max_acceleration=500)

start_pos = 0
end_pos = 1000

t1, pos1, vel1, acc1 = planner.trapezoidal_profile(start_pos, end_pos)
t2, pos2, vel2, acc2 = planner.s_curve_profile(start_pos, end_pos)

plt.figure(figsize=(12, 10))

plt.subplot(3, 1, 1)
plt.plot(t1, pos1, label='Trapezoidal')
plt.plot(t2, pos2, label='S-Curve')
plt.ylabel('Position')
plt.title('Motion Profile Comparison')
plt.legend()
plt.grid(True)

plt.subplot(3, 1, 2)
plt.plot(t1, vel1, label='Trapezoidal')
plt.plot(t2, vel2, label='S-Curve')
plt.ylabel('Velocity')
plt.legend()
plt.grid(True)

plt.subplot(3, 1, 3)
plt.plot(t1, acc1, label='Trapezoidal')
plt.plot(t2, acc2, label='S-Curve')
plt.ylabel('Acceleration')
plt.xlabel('Time (s)')
plt.legend()
plt.grid(True)

plt.tight_layout()
plt.savefig('motion_profile_comparison.png')
print("运动规划对比完成")

# 多轴协调运动
class CoordinatedMotion:
    """多轴协调运动"""

    def __init__(self, num_axes=3):
        self.num_axes = num_axes
        self.planners = [MotionPlanner() for _ in range(num_axes)]

    def linear_interpolation(self, start_pos, end_pos, dt=0.001):
        """
        直线插补
        所有轴同步运动，保持直线轨迹
        """
        start_pos = np.array(start_pos)
        end_pos = np.array(end_pos)

        # 计算各轴距离
        distances = np.abs(end_pos - start_pos)
        max_distance = np.max(distances)

        if max_distance == 0:
            return np.array([0]), start_pos.reshape(1, -1)

        # 计算总时间（基于最长轴）
        max_velocity = self.planners[0].max_velocity
        max_acceleration = self.planners[0].max_acceleration

        t_accel = max_velocity / max_acceleration
        d_accel = 0.5 * max_acceleration * t_accel ** 2

        if 2 * d_accel >= max_distance:
            t_total = 2 * np.sqrt(max_distance / max_acceleration)
        else:
            t_total = 2 * t_accel + (max_distance - 2 * d_accel) / max_velocity

        # 生成轨迹
        t = np.arange(0, t_total + dt, dt)
        positions = np.zeros((len(t), self.num_axes))

        for i, ti in enumerate(t):
            # 归一化进度
            progress = ti / t_total

            # 梯形速度曲线的进度
            if ti < t_accel:
                s = 0.5 * max_acceleration * ti ** 2 / max_distance
            elif ti < t_total - t_accel:
                s = (d_accel + max_velocity * (ti - t_accel)) / max_distance
            else:
                t_decel = ti - (t_total - t_accel)
                s = 1 - 0.5 * max_acceleration * (t_accel - t_decel) ** 2 / max_distance

            # 线性插值
            positions[i] = start_pos + s * (end_pos - start_pos)

        return t, positions

# 演示多轴协调
coord = CoordinatedMotion(num_axes=3)
start = [0, 0, 0]
end = [100, 50, 200]

t, positions = coord.linear_interpolation(start, end)

plt.figure(figsize=(12, 8))

plt.subplot(2, 1, 1)
for i in range(3):
    plt.plot(t, positions[:, i], label=f'Axis {i+1}')
plt.xlabel('Time (s)')
plt.ylabel('Position')
plt.title('Coordinated Motion - Linear Interpolation')
plt.legend()
plt.grid(True)

# 3D轨迹
ax = plt.subplot(2, 1, 2, projection='3d')
ax.plot(positions[:, 0], positions[:, 1], positions[:, 2], 'b-')
ax.scatter([start[0], end[0]], [start[1], end[1]], [start[2], end[2]],
           c='r', s=100, marker='o')
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
ax.set_title('3D Trajectory')

plt.tight_layout()
plt.savefig('coordinated_motion.png')
print("多轴协调运动演示完成")
```

### 🔑 调试方法

```python
import numpy as np
import matplotlib.pyplot as plt

class ServoTuner:
    """伺服参数调试工具"""

    def __init__(self):
        self.gains = {
            'position': {'Kp': 100, 'Ki': 0, 'Kd': 5},
            'velocity': {'Kp': 2, 'Ki': 10},
            'current': {'Kp': 0.5, 'Ki': 5}
        }

    def auto_tune_velocity_loop(self, motor_J, motor_B, bandwidth_desired):
        """
        速度环自动整定
        motor_J: 转动惯量
        motor_B: 阻尼系数
        bandwidth_desired: 期望带宽 (rad/s)
        """
        # 基于极点配置
        # 速度环闭环传递函数: ω(s) = Kp*s + Ki / (J*s² + (B+Kp)*s + Ki)
        # 期望特征方程: s² + 2*ζ*ωn*s + ωn²

        wn = bandwidth_desired
        zeta = 0.707  # 阻尼比

        # 系数匹配
        # J*s² + (B+Kp)*s + Ki = J*(s² + 2*ζ*ωn*s + ωn²)

        Kp = 2 * zeta * wn * motor_J - motor_B
        Ki = wn ** 2 * motor_J

        self.gains['velocity']['Kp'] = max(0, Kp)
        self.gains['velocity']['Ki'] = max(0, Ki)

        return self.gains['velocity']

    def step_response_analysis(self, t, response, setpoint):
        """
        阶跃响应分析
        返回：上升时间、超调量、调节时间、稳态误差
        """
        # 稳态值
        steady_state = setpoint

        # 上升时间（10% -> 90%）
        t_10 = t[np.where(response >= 0.1 * steady_state)[0][0]]
        t_90 = t[np.where(response >= 0.9 * steady_state)[0][0]]
        rise_time = t_90 - t_10

        # 超调量
        overshoot = (np.max(response) - steady_state) / steady_state * 100

        # 调节时间（2%误差带）
        tolerance = 0.02 * steady_state
        settled_idx = np.where(np.abs(response - steady_state) > tolerance)[0]
        if len(settled_idx) > 0:
            settling_time = t[settled_idx[-1]]
        else:
            settling_time = 0

        # 稳态误差
        steady_error = np.abs(response[-1] - steady_state)

        return {
            'rise_time': rise_time,
            'overshoot': overshoot,
            'settling_time': settling_time,
            'steady_error': steady_error
        }

    def frequency_response_test(self, system, freq_range, dt=0.001):
        """
        频率响应测试
        扫频法测量系统频率特性
        """
        magnitudes = []
        phases = []

        for freq in freq_range:
            # 正弦输入
            t = np.arange(0, 10/freq, dt)
            u = np.sin(2 * np.pi * freq * t)

            # 系统响应（简化一阶系统）
            tau = 0.01  # 时间常数
            y = np.zeros_like(t)
            for i in range(1, len(t)):
                y[i] = y[i-1] + dt/tau * (u[i-1] - y[i-1])

            # 计算幅值和相位（取稳态部分）
            steady_start = int(len(t) * 0.5)
            u_steady = u[steady_start:]
            y_steady = y[steady_start:]

            # 幅值比
            mag = np.max(y_steady) / np.max(u_steady)

            # 相位差
            # 找峰值位置
            u_peak_idx = np.argmax(u_steady)
            y_peak_idx = np.argmax(y_steady)
            phase_delay = (y_peak_idx - u_peak_idx) * dt
            phase = -2 * np.pi * freq * phase_delay * 180 / np.pi

            magnitudes.append(mag)
            phases.append(phase)

        return np.array(magnitudes), np.array(phases)

# 调试演示
tuner = ServoTuner()

# 自动整定速度环
J = 0.001  # kg·m²
B = 0.0001  # N·m·s/rad
bandwidth = 100  # rad/s

gains = tuner.auto_tune_velocity_loop(J, B, bandwidth)
print(f"自动整定速度环参数：Kp={gains['Kp']:.4f}, Ki={gains['Ki']:.4f}")

# 阶跃响应分析
dt = 0.001
t = np.arange(0, 1, dt)
setpoint = 100

# 简化二阶系统响应
wn = bandwidth
zeta = 0.707
response = setpoint * (1 - np.exp(-zeta * wn * t) *
                        (np.cos(wn * np.sqrt(1 - zeta**2) * t) +
                         zeta / np.sqrt(1 - zeta**2) * np.sin(wn * np.sqrt(1 - zeta**2) * t)))

metrics = tuner.step_response_analysis(t, response, setpoint)
print(f"\n阶跃响应指标：")
print(f"  上升时间: {metrics['rise_time']*1000:.2f} ms")
print(f"  超调量: {metrics['overshoot']:.2f}%")
print(f"  调节时间: {metrics['settling_time']*1000:.2f} ms")
print(f"  稳态误差: {metrics['steady_error']:.4f}")

# 绘制阶跃响应
plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.plot(t * 1000, response, label='Response')
plt.axhline(setpoint, color='r', linestyle='--', label='Setpoint')
plt.axhline(setpoint * 1.02, color='g', linestyle=':', label='±2% Band')
plt.axhline(setpoint * 0.98, color='g', linestyle=':')
plt.xlabel('Time (ms)')
plt.ylabel('Velocity')
plt.title('Step Response')
plt.legend()
plt.grid(True)

# 频率响应
freq_range = np.logspace(0, 3, 50)  # 1 Hz to 1000 Hz
magnitudes, phases = tuner.frequency_response_test(None, freq_range)

plt.subplot(1, 2, 2)
plt.semilogx(freq_range, 20 * np.log10(magnitudes))
plt.xlabel('Frequency (Hz)')
plt.ylabel('Magnitude (dB)')
plt.title('Frequency Response')
plt.grid(True)

plt.tight_layout()
plt.savefig('servo_tuning.png')
print("\n调试分析完成")

# 增益调整建议
print("\n增益调整建议：")
print("┌──────────────┬────────────────────────────────────────┐")
print("│ 问题         │ 调整方法                               │")
print("├──────────────┼────────────────────────────────────────┤")
print("│ 响应太慢     │ 增大Kp                                 │")
print("│ 超调太大     │ 减小Kp，增大Kd                         │")
print("│ 稳态误差大   │ 增大Ki                                 │")
print("│ 振荡         │ 减小Kp，增大Kd                         │")
print("│ 噪声放大     │ 减小Kd，添加低通滤波                   │")
print("│ 积分饱和     │ 添加积分限幅，使用抗饱和算法           │")
print("│ 刚性不足     │ 增大位置环Kp                           │")
print("│ 机械共振     │ 添加陷波滤波器                         │")
print("└──────────────┴────────────────────────────────────────┘")
```

## 完整跑通方案

**第一步：搭建伺服控制仿真环境**

```python
import numpy as np
import matplotlib.pyplot as plt
from dataclasses import dataclass
from typing import Tuple

@dataclass
class ServoParams:
    """伺服系统参数"""
    # 电机参数
    rated_power: float = 1000      # 额定功率 (W)
    rated_voltage: float = 48      # 额定电压 (V)
    rated_current: float = 25      # 额定电流 (A)
    rated_speed: float = 3000      # 额定转速 (RPM)
    rated_torque: float = 3.18     # 额定扭矩 (N·m)
    pole_pairs: int = 4            # 极对数

    # 电气参数
    Rs: float = 0.5               # 定子电阻 (Ω)
    Ld: float = 0.005             # d轴电感 (H)
    Lq: float = 0.005             # q轴电感 (H)
    psi_f: float = 0.1            # 永磁体磁链 (Wb)

    # 机械参数
    J: float = 0.001              # 转动惯量 (kg·m²)
    B: float = 0.0001             # 阻尼系数 (N·m·s/rad)

    # 编码器参数
    encoder_ppr: int = 2500      # 编码器线数
    encoder_resolution: int = 10000  # 四倍频后分辨率

class ServoSystem:
    """完整伺服系统仿真"""

    def __init__(self, params: ServoParams):
        self.params = params

        # 状态变量
        self.theta = 0.0           # 机械角度 (rad)
        self.omega = 0.0           # 机械角速度 (rad/s)
        self.id = 0.0              # d轴电流 (A)
        self.iq = 0.0              # q轴电流 (A)

        # 控制器
        self.pos_controller = PositionController()
        self.vel_controller = VelocityController()
        self.cur_controller = CurrentController()

        # 编码器
        self.encoder = Encoder(params.encoder_ppr)

        # 运动规划器
        self.planner = MotionPlanner(
            max_velocity=params.rated_speed * 2 * np.pi / 60,
            max_acceleration=1000
        )

    def update(self, pos_ref: float, TL: float, dt: float) -> Tuple[float, float, float]:
        """
        更新伺服系统
        pos_ref: 位置给定 (rad)
        TL: 负载转矩 (N·m)
        dt: 时间步长 (s)
        返回: (位置, 速度, 扭矩)
        """
        p = self.params

        # 位置环
        vel_ref = self.pos_controller.update(pos_ref, self.theta, dt)

        # 速度环
        iq_ref = self.vel_controller.update(vel_ref, self.omega, dt)

        # 电流环（id=0控制）
        vd, vq = self.cur_controller.update(0, iq_ref, self.id, self.iq, self.omega, dt)

        # 电机模型
        Te, omega, theta = self.motor_model(vd, vq, TL, dt)

        return theta, omega, Te

    def motor_model(self, vd: float, vq: float, TL: float, dt: float) -> Tuple[float, float, float]:
        """电机模型"""
        p = self.params

        # 电磁转矩
        Te = 1.5 * p.pole_pairs * p.psi_f * self.iq

        # 电流动态
        omega_e = self.omega * p.pole_pairs
        did_dt = (vd - p.Rs * self.id + omega_e * p.Lq * self.iq) / p.Ld
        diq_dt = (vq - p.Rs * self.iq - omega_e * (p.Ld * self.id + p.psi_f)) / p.Lq

        # 机械动态
        domega_dt = (Te - p.B * self.omega - TL) / p.J

        # 更新状态
        self.id += did_dt * dt
        self.iq += diq_dt * dt
        self.omega += domega_dt * dt
        self.theta += self.omega * dt

        return Te, self.omega, self.theta

class PositionController:
    """位置控制器"""
    def __init__(self, Kp=100, Ki=0, Kd=5):
        self.Kp = Kp
        self.Ki = Ki
        self.Kd = Kd
        self.integral = 0
        self.prev_error = 0

    def update(self, ref, fb, dt):
        error = ref - fb
        self.integral += error * dt
        derivative = (error - self.prev_error) / dt
        self.prev_error = error
        return self.Kp * error + self.Ki * self.integral + self.Kd * derivative

class VelocityController:
    """速度控制器"""
    def __init__(self, Kp=2, Ki=10):
        self.Kp = Kp
        self.Ki = Ki
        self.integral = 0

    def update(self, ref, fb, dt):
        error = ref - fb
        self.integral += error * dt
        self.integral = np.clip(self.integral, -10, 10)  # 抗饱和
        return self.Kp * error + self.Ki * self.integral

class CurrentController:
    """电流控制器"""
    def __init__(self, Kp=10, Ki=100):
        self.Kp = Kp
        self.Ki = Ki
        self.integral_d = 0
        self.integral_q = 0

    def update(self, id_ref, iq_ref, id_fb, iq_fb, omega, dt):
        # d轴
        error_d = id_ref - id_fb
        self.integral_d += error_d * dt
        vd = self.Kp * error_d + self.Ki * self.integral_d

        # q轴
        error_q = iq_ref - iq_fb
        self.integral_q += error_q * dt
        vq = self.Kp * error_q + self.Ki * self.integral_q

        return vd, vq

# 运行完整仿真
params = ServoParams()
servo = ServoSystem(params)

dt = 0.0001
t = np.arange(0, 2, dt)

# 位置给定：阶跃
pos_ref = np.zeros_like(t)
pos_ref[t > 0.5] = np.pi * 2  # 0.5秒后转到360度
pos_ref[t > 1.2] = np.pi      # 1.2秒后转到180度

# 记录数据
pos_fb = np.zeros_like(t)
vel_fb = np.zeros_like(t)
torque = np.zeros_like(t)

# 负载转矩
TL = 0.5  # 恒定负载

for i in range(len(t)):
    theta, omega, Te = servo.update(pos_ref[i], TL, dt)
    pos_fb[i] = theta
    vel_fb[i] = omega
    torque[i] = Te

# 绘制结果
plt.figure(figsize=(12, 10))

plt.subplot(3, 1, 1)
plt.plot(t, pos_ref * 180 / np.pi, 'r--', label='Reference')
plt.plot(t, pos_fb * 180 / np.pi, 'b-', label='Actual')
plt.ylabel('Position (deg)')
plt.title('Servo System Response')
plt.legend()
plt.grid(True)

plt.subplot(3, 1, 2)
plt.plot(t, vel_fb * 60 / (2 * np.pi), 'b-')
plt.ylabel('Speed (RPM)')
plt.grid(True)

plt.subplot(3, 1, 3)
plt.plot(t, torque, 'b-')
plt.ylabel('Torque (N·m)')
plt.xlabel('Time (s)')
plt.grid(True)

plt.tight_layout()
plt.savefig('servo_system_complete.png')
print("完整伺服系统仿真完成")
```

**第二步：实际应用示例**

```python
# 实际应用：点对点定位控制
def point_to_point_motion(servo, points, dt=0.0001):
    """
    点对点运动控制
    points: [(位置1, 停留时间1), (位置2, 停留时间2), ...]
    """
    results = {'t': [], 'pos': [], 'vel': [], 'torque': []}
    t_total = 0

    for target_pos, dwell_time in points:
        # 运动规划
        t_profile, pos_profile, vel_profile, _ = servo.planner.trapezoidal_profile(
            servo.theta, target_pos, dt
        )

        # 执行运动
        for i, t in enumerate(t_profile):
            theta, omega, Te = servo.update(pos_profile[i], 0.5, dt)
            results['t'].append(t_total + t)
            results['pos'].append(theta)
            results['vel'].append(omega)
            results['torque'].append(Te)

        t_total += t_profile[-1]

        # 停留
        for t in np.arange(0, dwell_time, dt):
            theta, omega, Te = servo.update(target_pos, 0.5, dt)
            results['t'].append(t_total + t)
            results['pos'].append(theta)
            results['vel'].append(omega)
            results['torque'].append(Te)

        t_total += dwell_time

    return results

# 执行点对点运动
params = ServoParams()
servo = ServoSystem(params)

points = [
    (np.pi, 0.5),      # 转到180度，停留0.5秒
    (2 * np.pi, 0.5),  # 转到360度，停留0.5秒
    (0, 0.5),          # 回到0度，停留0.5秒
    (np.pi / 2, 0.5),  # 转到90度，停留0.5秒
]

results = point_to_point_motion(servo, points)

plt.figure(figsize=(12, 8))

plt.subplot(3, 1, 1)
plt.plot(results['t'], np.array(results['pos']) * 180 / np.pi)
plt.ylabel('Position (deg)')
plt.title('Point-to-Point Motion')
plt.grid(True)

plt.subplot(3, 1, 2)
plt.plot(results['t'], np.array(results['vel']) * 60 / (2 * np.pi))
plt.ylabel('Speed (RPM)')
plt.grid(True)

plt.subplot(3, 1, 3)
plt.plot(results['t'], results['torque'])
plt.ylabel('Torque (N·m)')
plt.xlabel('Time (s)')
plt.grid(True)

plt.tight_layout()
plt.savefig('point_to_point_motion.png')
print("点对点运动控制完成")
```

## 常见误区

**误区 1：忽视刚性匹配 → 系统振荡**

解释：伺服系统的刚性由位置环增益决定。增益过高会导致机械共振，增益过低会导致定位精度下降。应根据机械系统的固有频率调整刚性。

**误区 2：忽视惯量匹配 → 响应变差**

解释：负载惯量与电机惯量应匹配（通常比例在1:1到10:1之间）。惯量比过大导致响应变慢、控制困难，需要增大电机或添加减速机。

**误区 3：忽视编码器精度 → 定位误差**

解释：编码器分辨率直接影响定位精度。对于高精度应用，应选择高分辨率编码器（如17位绝对值编码器）或使用细分技术。

**误区 4：忽视机械共振 → 系统不稳定**

解释：机械系统存在固有频率，伺服控制带宽接近固有频率时会产生共振。应使用陷波滤波器或降低控制带宽。

**误区 5：忽视零点标定 → 位置偏差**

解释：绝对值编码器需要正确标定零点位置，增量式编码器需要回零操作。零点错误会导致位置控制偏差。

## 学习资源推荐

### 书籍

- 《伺服控制系统》- 陈伯时
- 《运动控制系统》- 尔桂花
- 《电力拖动自动控制系统》- 阮毅
- 《Modern Control Engineering》- Katsuhiko Ogata

### 在线课程

- Coursera: Control of Mobile Robots
- YouTube: MATLAB Simulink 伺服控制教程
- B站: 伺服电机控制技术

### 实践平台

- Arduino + 步进电机（入门）
- STM32 + FOC电机驱动（进阶）
- 工业伺服驱动器（专业）

### 开源项目

- ODrive - 高性能开源伺服驱动
- SimpleFOC - 简易FOC库
- LinuxCNC - 开源数控系统

### 技术文档

- 安川伺服技术手册
- 三菱伺服编程指南
- 西门子运动控制手册
