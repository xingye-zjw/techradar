---
title: 状态空间控制理论
category: embedded
difficulty: advanced
duration: 2-3周
summary: 现代控制理论的核心数学框架。比 PID 更强大——不仅能处理单输入单输出，还能用状态反馈、极点配置、LQR 最优控制和卡尔曼滤波，对多输入多输出系统进行精确分析和设计。
takeaways:
  - 理解状态空间模型如何用一组一阶微分方程描述任意阶控制系统
  - 掌握能控性/能观性判据，知道什么情况下状态反馈和观测器设计是可行的
  - 能用极点配置或 LQR 设计状态反馈控制器
  - 理解卡尔曼滤波如何在噪声环境下最优估计不可直接测量的状态
relatedIntel:
  - 052-embedded-c
  - 053-embedded-rtos
  - 054-elec-circuit
tags:
  - state-space
  - controllability
  - observability
  - pole-placement
  - lqr
  - kalman-filter
  - state-feedback
  - observer-design
relatedTerms:
  - "data-structure"
  - "rtos"
  - "algorithm"
  - "complexity"
relatedTools:
  - "huggingface-transformers"
  - "ultralytics-yolo"
  - "pytorch"
relatedNodes:
  - "roadmap-capstone"
  - "electrical-safety"
---

## 为什么你要学它

先讲结论：**状态空间 = 给控制系统建立"数字孪生"，让你能在数学空间里精确预测、设计和优化任何复杂系统的行为。**

PID 控制器的局限在于它本质上是"经验主义"——靠调 gain 来让系统稳定或响应快，但没有告诉你系统内部在发生什么。状态空间理论则完全不同：它用一组一阶微分方程完整描述系统的每个"状态变量"（位置、速度、加速度…），然后在数学上精确分析：

- 这个系统能不能被控制？（能控性）
- 这些状态能不能被观测到？（能观性）
- 怎么设计反馈让系统响应符合要求？（极点配置 / LQR）
- 如果状态不能直接测量，怎么估计它们？（观测器 / 卡尔曼滤波）

自动驾驶、机器人、航空航天、功率电子…几乎所有高性能控制系统背后都是状态空间。PID 只能告诉你"快了"或"慢了"，状态空间能告诉你"为什么快了"以及"怎么精确地让它不快不慢"。

## 一句话概览（快速版）

你只要记住三句话：

1. **状态空间模型 = 把高阶微分方程拆成一阶方程组**，每个状态变量的动态单独跟踪
2. **状态反馈 u = -Kx 让闭环极点落在期望位置**，从而精确控制响应速度、振荡、超调
3. **LQR 自动帮你找最优的 K**，在"控制能量最小"和"跟踪误差最小"之间做数学上最优的权衡

## 核心拆解

### 🔑 状态空间模型

线性时不变系统用以下方程描述：

```
ẋ = Ax + Bu    # 状态方程：状态如何随输入变化
y  = Cx + Du    # 输出方程：传感器能读到什么东西
```

- **x**：状态向量（n 维），如 [位置, 速度, 加速度]
- **u**：输入向量（p 维），如 [电机电压, 舵机角度]
- **y**：输出向量（q 维），如 [编码器读数, IMU 数据]
- **A, B, C, D**：系统矩阵，设计者给定或从物理建模得出

**物理直觉**：A 矩阵描述系统自身如何演化（无输入时），B 矩阵描述输入如何推动状态变化。

### 🔑 能控性（Controllability）

**问题**：给定了初始状态 x(0)，是否存在一个有限输入 u(t) 能让系统在某个时刻到达任意目标状态 x(T)？

**判据**：能控性矩阵 `Uc = [B, AB, A²B, ..., Aⁿ⁻¹B]` 必须满秩（rank = n）。

**工程意义**：如果系统不可控，就意味着有些状态变量无论如何都受不到输入的影响——此时状态反馈控制器无法任意配置所有极点。

### 🔑 能观性（Observability）

**问题**：给定有限的输出 y(t)，是否存在算法能从这些测量值推断出所有状态 x(t)？

**判据**：能观性矩阵 `Uo = [C; CA; CA²; ...; CAⁿ⁻¹]` 必须满秩（rank = n）。

**工程意义**：如果系统不可观，就意味着有些状态变量的信息在输出里被"丢掉了"——此时观测器无法准确重建完整状态。

### 🔑 状态反馈与极点配置

**控制律**：`u = -Kx`（全状态反馈）

闭环系统：`ẋ = (A - BK)x`

**核心结论**：如果系统可控，极点配置定理保证对于任意期望的闭环极点集（稳定且满足性能要求），存在唯一的 K 使 `A - BK` 的特征值精确落在那些极点位置。

**物理直觉**：极点位置直接决定系统响应特性——

- 极点越靠左实部 → 响应越快
- 极点越靠右实部 → 响应越慢
- 有无虚部 → 有无振荡

### 🔑 LQR 最优控制

极点配置需要你手动指定极点位置——这依赖经验。LQR 则是自动找最优的 K：

**问题**：最小化二次型代价函数 `J = ∫(x'Qx + u'Ru)dt`

**含义**：

- Q 大 → 状态误差代价高 → 系统更激进地抑制偏差
- R 大 → 控制能量代价高 → 系统更保守地减少能耗

**结果**：解代数 Riccati 方程得到最优反馈增益 K。LQR 是"数学上可证明最优"的控制器设计方法。

### 🔑 卡尔曼滤波（状态估计）

当状态 x 无法直接测量时，需要观测器。卡尔曼滤波是最优线性估计器：

```
预测：x̂ₖ₊₁⁻ = A x̂ₖ⁺ + B uₖ        # 基于模型预测
更新：x̂ₖ₊₁⁺ = x̂ₖ₊₁⁻ + L(yₖ₊₁ - C x̂ₖ₊₁⁻)  # 用测量值校正
```

卡尔曼增益 `L = P⁻C'(CP⁻C' + R)⁻¹` 是数学上最优的，平衡了"模型预测"和"传感器测量"的信任度。P 是估计协方差，Q 和 R 分别是过程噪声和测量噪声的协方差矩阵。

## 完整跑通方案

**第一步：用 Python control 建立状态空间模型并分析能控性/能观性**

```python
import numpy as np
import control as ct

# 二阶质量-弹簧-阻尼系统参数
m, k, b = 1.0, 10.0, 1.0

# 状态空间模型：x = [位置; 速度]，u = 力
A = np.array([[0, 1],
              [-k/m, -b/m]])
B = np.array([[0],
              [1/m]])
C = np.array([[1, 0]])  # 测量位置
D = np.array([[0]])

sys = ct.ss(A, B, C, D)
print("开环极点:", np.linalg.eigvals(A))

# 检查能控性和能观性
Uc = ct.ctrb(A, B)   # 能控性矩阵
Uo = ct.obsv(A, C)   # 能观性矩阵
print("能控性矩阵秩:", np.linalg.matrix_rank(Uc), "/ n =", A.shape[0])
print("能观性矩阵秩:", np.linalg.matrix_rank(Uo), "/ n =", A.shape[0])
```

**第二步：极点配置设计状态反馈控制器**

```python
import control as ct
import matplotlib.pyplot as plt

# 期望闭环极点：阻尼比 0.7，自然频率 3 rad/s
wn = 3.0
zeta = 0.7
desired_poles = np.array([-zeta*wn + 1j*wn*np.sqrt(1-zeta**2),
                           -zeta*wn - 1j*wn*np.sqrt(1-zeta**2)])

# 极点配置得到 K
K = ct.place(A, B, desired_poles)
print("状态反馈增益 K:", K.flatten())

# 闭环系统
Acl = A - B @ K
sys_cl = ct.ss(Acl, B, C, D)

# 阶跃响应
t = np.linspace(0, 5, 500)
t, y = ct.step_response(sys_cl, t)

plt.plot(t, y)
plt.title("闭环阶跃响应 - 极点配置")
plt.xlabel("时间 (s)")
plt.ylabel("位置")
plt.grid()
plt.show()
```

**第三步：LQR 最优控制器设计**

```python
import numpy as np
import control as ct

Q = np.diag([100, 1])   # 位置误差权重高
R = np.array([[0.1]])    # 控制能量权重低 → 激进响应

K_lqr, S, E = ct.lqr(A, B, Q, R)
print("LQR 最优增益 K:", K_lqr.flatten())

# 对比极点配置和 LQR 的闭环极点
Acl_lqr = A - B @ K_lqr
print("LQR 闭环极点:", np.linalg.eigvals(Acl_lqr))
```

**第四步：设计状态观测器（龙伯格观测器）**

```python
# 期望观测器极点（比控制器快 2-5 倍）
observer_poles = -5 * np.ones(2)  # 实极点，快收敛

# 观测器增益 L（对偶系统的极点配置）
L = ct.place(A.T, C.T, observer_poles).T
print("观测器增益 L:", L.flatten())

# 观测器误差动态：A - LC
Ae = A - L @ C
print("观测器极点（误差衰减速度）:", np.linalg.eigvals(Ae))
```

**第五步：卡尔曼滤波器（带噪声版本）**

```python
import numpy as np
import control as ct

# 过程噪声和测量噪声协方差
Q_kal = np.array([[0.01, 0], [0, 0.01]])  # 过程噪声
R_kal = np.array([[1.0]])                  # 测量噪声

# 连续系统卡尔曼滤波器
kf = ct KalmanFilter(A, B, C, D, Q_kal, R_kal)
print("卡尔曼滤波器已建立")
print("估计增益:", kf.L)
```

## 常见误区

**"状态空间只是多用于 MIMO 系统，单变量用 PID 就够了"** → 错误。即使是 SISO 系统，状态空间提供的能控性/能观性分析、极点配置、LQR 优化都是 PID 无法提供的工具。很多高端工业控制器内部早已换成状态空间架构。

**"极点配置随便选位置就行"** → 不可行。极点位置必须满足两条约束：(1) 系统必须可控（数学前提）；(2) 极点位置决定物理上可达的响应速度——选太快会导致控制能量需求超出执行器能力。工程中极点通常基于阻尼比和自然频率的性能指标选取。

**"卡尔曼滤波只是低通滤波"** → 完全不是。卡尔曼滤波是贝叶斯最优估计器，它利用系统模型预测状态，再结合测量值校正。模型不准时它会失效，而低通滤波不依赖任何模型。

**"能观性和能控性只是数学游戏"** → 实际工程中非常关键。例如积分环节（1/s）会破坏能控性，导致状态反馈无法消除稳态误差——这正是为什么内模控制（IMC）等方法会引入额外状态来"修复"这个问题。

## 推荐学习顺序

1. 先读《State-Space Fundamentals》相关章节，理解 A/B/C/D 四个矩阵的物理意义（1-2 天）
2. 用上面的代码跑通一个二阶系统的极点配置和 LQR（1-2 天）
3. 推导能控性/能观性矩阵的秩判据，理解它的几何含义
4. 读经典的"LQG/LQR 最优控制"章节，理解代价函数 Q/R 权重如何影响实际响应
5. 学习卡尔曼滤波，重点理解 P、Q、R 三个协方差矩阵的物理含义和调参方法
