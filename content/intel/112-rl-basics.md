---
title: 强化学习基础
category: machine-learning
difficulty: intermediate
duration: 2-3周
summary: 让智能体通过与环境交互来学习最优决策的机器学习范式。掌握 MDP、Q-Learning、策略梯度、DQN、PPO 等核心算法，是进入机器人、游戏 AI、自动驾驶等领域的基础。
takeaways: "- 理解马尔可夫决策过程（MDP）的数学定义：状态、动作、转移概率、奖励、折扣因子
  - 掌握 Q-Learning 与 Sarsa 的区别：off-policy vs on-policy，能手写更新公式
  - 理解策略梯度方法（REINFORCE）的核心思想：用采样轨迹估计梯度并更新策略
  - 掌握 DQN 的两大创新：经验回放（Experience Replay）与目标网络（Target Network）
  - 理解 PPO 的剪切目标函数，能用 Stable-Baselines3 在 Gym 环境中训练智能体"
relatedIntel: "- 116-recommender-systems
  - 118-anomaly-detection
  - 122-federated-learning"
tags: "- reinforcement learning
  - mdp
  - q-learning
  - sarsa
  - policy gradient
  - dqn
  - ppo
  - gym"
relatedTerms: ["matrix", "tensor", "gradient-descent", "convex-optimization"]
relatedTools: ["numpy", "pandas", "scikit-learn"]
relatedNodes: ["math-linear-algebra", "llm-inference"]
---

## 为什么你要学它

先讲结论：**强化学习 = 让智能体在环境中"试错学习"，通过奖励信号自动找到最优策略。**

它解决的是序列决策问题：从下棋、打游戏，到机器人走路、自动驾驶，再到大模型的 RLHF 对齐——核心都是"在每一步做什么决策，才能让长期总收益最大"。

监督学习有"标准答案"，强化学习没有。你告诉智能体"赢了加 1 分，输了减 1 分"，然后它自己摸索怎么赢。这种"从奖励中学习"的范式，是通往通用人工智能的重要路径之一。

理解强化学习基础后，你再看 AlphaGo、ChatGPT 的 RLHF、机器人控制、游戏 AI 等应用，都能快速抓住核心逻辑。

## 一句话概览（快速版）

你只要记住三句话：

1. **MDP 是强化学习的数学框架**：用状态、动作、转移、奖励、折扣因子描述一切决策问题
2. **值函数方法 vs 策略梯度方法 = 两大主流路线**：前者学"每个状态值多少钱"，后者直接学"每个状态该做什么动作"
3. **DQN + PPO = 深度强化学习的两大基石**：DQN 用深度网络估计 Q 值，PPO 是目前最实用的策略梯度算法

## 核心拆解

### 🔑 MDP 马尔可夫决策过程

MDP 是一个五元组 $(S, A, P, R, \gamma)$：

- **$S$（状态空间）**：所有可能的状态集合
- **$A$（动作空间）**：所有可能的动作集合
- **$P(s'|s,a)$（转移概率）**：在状态 $s$ 执行动作 $a$，转移到状态 $s'$ 的概率
- **$R(s,a,s')$（奖励函数）**：在状态 $s$ 执行动作 $a$ 转移到 $s'$ 时获得的即时奖励
- **$\gamma \in [0,1]$（折扣因子）**：未来奖励的折扣率，越接近 1 越看重长远收益

**目标**：找到一个策略 $\pi(a|s)$（在状态 $s$ 选择动作 $a$ 的概率），使得**长期折扣回报**的期望最大：

$$G_t = R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} + \dots = \sum_{k=0}^{\infty} \gamma^k R_{t+k+1}$$

**两个核心函数**：

- **状态值函数 $V^\pi(s)$**：从状态 $s$ 出发，遵循策略 $\pi$ 能获得的期望回报
- **动作值函数 $Q^\pi(s,a)$**：在状态 $s$ 执行动作 $a$，之后遵循策略 $\pi$ 能获得的期望回报

**贝尔曼方程**（递归关系）：
$$V^\pi(s) = \sum_a \pi(a|s) \sum_{s'} P(s'|s,a) [R(s,a,s') + \gamma V^\pi(s')]$$
$$Q^\pi(s,a) = \sum_{s'} P(s'|s,a) [R(s,a,s') + \gamma \sum_{a'} \pi(a'|s') Q^\pi(s',a')]$$

### 🔑 Q-Learning 与 Sarsa

**Q-Learning** 是最经典的 off-policy 算法，直接学习最优动作值函数 $Q^*(s,a)$。

**更新公式**：
$$Q(s,a) \leftarrow Q(s,a) + \alpha \left[ r + \gamma \max_{a'} Q(s',a') - Q(s,a) \right]$$

其中：

- $\alpha$ 是学习率
- $r + \gamma \max_{a'} Q(s',a')$ 是 TD Target（时序差分目标）
- $r + \gamma \max_{a'} Q(s',a') - Q(s,a)$ 是 TD Error（时序差分误差）

**Sarsa** 是 on-policy 算法，名字来源于更新所需的五元组 $(s, a, r, s', a')$。

**更新公式**：
$$Q(s,a) \leftarrow Q(s,a) + \alpha \left[ r + \gamma Q(s',a') - Q(s,a) \right]$$

**核心区别**：

| 特性         | Q-Learning                                                       | Sarsa                                     |
| ------------ | ---------------------------------------------------------------- | ----------------------------------------- |
| 策略类型     | Off-policy（学习的是最优策略，行为策略可以是 $\epsilon$-greedy） | On-policy（学习的就是当前正在执行的策略） |
| TD Target    | 使用 $\max_{a'} Q(s',a')$（贪心）                                | 使用 $Q(s',a')$（实际执行的动作）         |
| 特点         | 更激进，追求最优策略                                             | 更保守，考虑探索风险                      |
| 悬崖行走例子 | 走悬崖边缘（最优路径但风险高）                                   | 走安全路径（离悬崖远）                    |

**$\epsilon$-greedy 探索策略**：

- 以 $\epsilon$ 的概率随机选择动作（探索）
- 以 $1-\epsilon$ 的概率选择 $Q$ 值最大的动作（利用）
- 训练过程中通常让 $\epsilon$ 逐渐衰减

### 🔑 策略梯度与 REINFORCE

策略梯度方法**直接参数化策略** $\pi_\theta(a|s)$，然后通过梯度上升最大化期望回报。

**目标函数**：
$$J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta} [R(\tau)]$$

其中 $\tau = (s_0, a_0, r_0, s_1, a_1, r_1, \dots)$ 是一条轨迹。

**策略梯度定理**：
$$\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta} \left[ \sum_{t=0}^T \nabla_\theta \log \pi_\theta(a_t|s_t) \cdot G_t \right]$$

**REINFORCE 算法**（蒙特卡洛策略梯度）：

1. 用当前策略 $\pi_\theta$ 采集多条轨迹
2. 对每条轨迹计算每个时刻的回报 $G_t$
3. 用策略梯度公式更新参数：$\theta \leftarrow \theta + \alpha \nabla_\theta \log \pi_\theta(a_t|s_t) \cdot G_t$

**REINFORCE 的问题**：

- 方差大：每次采样的轨迹差异大，梯度估计噪声高
- 样本效率低：用一次就扔掉，on-policy 不能重复利用数据

**改进方向**：

- 加入基线（Baseline）：用 $A_t = G_t - V(s_t)$ 替代 $G_t$，降低方差
- Actor-Critic：用 Critic 网络估计 $V(s)$ 或 $Q(s,a)$，替代蒙特卡洛回报

### 🔑 DQN 深度 Q 网络

DQN 是 DeepMind 在 2013 年提出的算法，用深度神经网络来近似 Q 值函数，在 Atari 游戏上达到了人类水平。

**核心创新一：经验回放（Experience Replay）**

把智能体的经验 $(s, a, r, s', \text{done})$ 存储到回放缓冲区中，训练时随机采样一批来更新网络。

**作用**：

- 打破样本之间的相关性（神经网络训练假设样本独立同分布）
- 提高样本效率（一条经验可以被多次使用）
- 平滑学习分布，避免策略剧烈波动

**核心创新二：目标网络（Target Network）**

使用两个结构相同但参数不同的网络：

- **当前网络**（online network）：用来选择动作，参数 $\theta$ 实时更新
- **目标网络**（target network）：用来计算 TD Target，参数 $\theta^-$ 每隔 N 步从当前网络复制

**TD Target 计算**：
$$y = r + \gamma \max_{a'} Q_{\theta^-}(s', a')$$

**作用**：

- 稳定训练：目标不会随每次更新而变化，避免"移动目标"问题
- 没有目标网络的话，Q 值训练容易发散

**DQN 算法流程**：

```python
# 初始化回放缓冲区 D，容量 N
# 初始化当前网络 Q（参数 θ）和目标网络 Q_target（参数 θ⁻ = θ）

for episode in range(num_episodes):
    s = env.reset()
    for t in range(max_steps):
        # ε-greedy 选择动作
        if random.random() < epsilon:
            a = env.action_space.sample()
        else:
            a = argmax(Q(s))

        # 执行动作，获得转移
        s_next, r, done, _ = env.step(a)
        D.append((s, a, r, s_next, done))

        # 从回放缓冲区采样一批
        batch = D.sample(batch_size)
        s_batch, a_batch, r_batch, s_next_batch, done_batch = batch

        # 计算 TD Target
        q_next_max = Q_target(s_next_batch).max(dim=1)[0]
        target = r_batch + gamma * q_next_max * (1 - done_batch)

        # 计算当前 Q 值
        q_current = Q(s_batch).gather(1, a_batch.unsqueeze(1)).squeeze()

        # 更新当前网络
        loss = MSELoss(q_current, target)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        # 每隔 C 步同步目标网络
        if total_steps % C == 0:
            θ⁻ = θ

        s = s_next
        if done:
            break
```

**DQN 的常见改进**：

- Double DQN：用当前网络选动作，目标网络算 Q 值，解决过估计问题
- Dueling DQN：把 Q 网络拆成 V(s) + A(s,a) 两部分
- Prioritized Experience Replay：优先采样 TD Error 大的经验

### 🔑 PPO 近端策略优化

PPO（Proximal Policy Optimization）是目前最主流、最实用的深度强化学习算法，由 OpenAI 在 2017 年提出。

**核心问题**：普通策略梯度方法更新步长不好控制——步长太小收敛慢，步长太大策略崩了。

**核心思想**：限制每次策略更新的幅度，保证新策略和旧策略的差异不会太大，在稳定的前提下尽可能提高样本效率。

**重要性采样比率**：
$$r_t(\theta) = \frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_\text{old}}(a_t|s_t)}$$

这个比率表示：用新策略采样这个动作的概率 / 用旧策略采样这个动作的概率。

- $r_t(\theta) = 1$：新旧策略完全一样
- $r_t(\theta) > 1$：新策略更倾向于选这个动作
- $r_t(\theta) < 1$：新策略更不倾向于选这个动作

**未裁剪的策略梯度目标**：
$$L^{\text{PG}}(\theta) = \mathbb{E}_t \left[ r_t(\theta) \hat{A}_t \right]$$

其中 $\hat{A}_t$ 是优势函数估计。

**PPO 的剪切目标函数（Clip Objective）**：
$$L^{\text{CLIP}}(\theta) = \mathbb{E}_t \left[ \min\left( r_t(\theta) \hat{A}_t,\ \text{clip}(r_t(\theta),\ 1-\epsilon,\ 1+\epsilon) \hat{A}_t \right) \right]$$

**直觉理解**：

- 当 $\hat{A}_t > 0$（这个动作比平均好）：我们想增加这个动作的概率，但最多增加到 $1+\epsilon$ 倍
- 当 $\hat{A}_t < 0$（这个动作比平均差）：我们想减少这个动作的概率，但最多减少到 $1-\epsilon$ 倍
- 取 min 的意思是：哪个更保守就用哪个，防止策略更新太远

**PPO 的优势**：

- 实现简单，调参容易
- 训练稳定，不容易崩
- 样本效率不错（可以用同一批数据更新多次）
- 适用范围广：离散动作、连续动作都能用

## 完整跑通方案

**第一步：搭建 Gym 环境，理解交互接口**

```python
import gymnasium as gym
import numpy as np

# 创建环境（CartPole 经典入门环境）
env = gym.make('CartPole-v1', render_mode='human')

# 观察空间：[车位置, 车速度, 杆角度, 杆角速度]
print("观察空间:", env.observation_space)
print("动作空间:", env.action_space)  # 0=左推, 1=右推

# 随机策略跑一个回合
s, info = env.reset()
total_reward = 0
done = False

while not done:
    a = env.action_space.sample()  # 随机动作
    s_next, r, terminated, truncated, info = env.step(a)
    total_reward += r
    done = terminated or truncated
    s = s_next

print(f"随机策略总奖励: {total_reward}")
env.close()
```

**第二步：手写 Q-Learning（离散状态离散动作）**

```python
import gymnasium as gym
import numpy as np
from collections import defaultdict

# 创建 CliffWalking 环境（悬崖行走问题）
env = gym.make('CliffWalking-v0')

n_states = env.observation_space.n  # 48
n_actions = env.action_space.n      # 4

# 初始化 Q 表
Q = np.zeros((n_states, n_actions))

alpha = 0.1       # 学习率
gamma = 0.99      # 折扣因子
epsilon = 0.1     # 探索率
n_episodes = 5000

def epsilon_greedy(Q, s, epsilon):
    if np.random.random() < epsilon:
        return np.random.randint(n_actions)
    else:
        return np.argmax(Q[s])

rewards_history = []

for ep in range(n_episodes):
    s, _ = env.reset()
    total_reward = 0
    done = False

    while not done:
        a = epsilon_greedy(Q, s, epsilon)
        s_next, r, terminated, truncated, _ = env.step(a)
        done = terminated or truncated

        # Q-Learning 更新
        best_next = np.max(Q[s_next])
        Q[s, a] += alpha * (r + gamma * best_next * (1 - done) - Q[s, a])

        total_reward += r
        s = s_next

    rewards_history.append(total_reward)

# 测试最优策略
s, _ = env.reset()
total_reward = 0
done = False
while not done:
    a = np.argmax(Q[s])
    s, r, terminated, truncated, _ = env.step(a)
    total_reward += r
    done = terminated or truncated

print(f"Q-Learning 最优策略总奖励: {total_reward}")
```

**第三步：用 Stable-Baselines3 训练 DQN**

```bash
pip install gymnasium stable-baselines3[extra]
```

```python
import gymnasium as gym
from stable_baselines3 import DQN
from stable_baselines3.common.evaluation import evaluate_policy

# 创建环境
env = gym.make('CartPole-v1')

# 初始化 DQN 模型
model = DQN(
    "MlpPolicy",
    env,
    learning_rate=1e-3,
    buffer_size=10000,
    learning_starts=1000,
    batch_size=64,
    gamma=0.99,
    target_update_interval=500,
    exploration_fraction=0.1,
    exploration_initial_eps=1.0,
    exploration_final_eps=0.05,
    verbose=1
)

# 训练
model.learn(total_timesteps=50000)

# 评估
mean_reward, std_reward = evaluate_policy(model, env, n_eval_episodes=10)
print(f"DQN 平均奖励: {mean_reward:.2f} ± {std_reward:.2f}")

# 保存与加载
model.save("dqn_cartpole")
model = DQN.load("dqn_cartpole", env=env)

# 可视化测试
env = gym.make('CartPole-v1', render_mode='human')
obs, _ = env.reset()
for _ in range(1000):
    action, _states = model.predict(obs, deterministic=True)
    obs, reward, terminated, truncated, info = env.step(action)
    if terminated or truncated:
        obs, _ = env.reset()
env.close()
```

**第四步：用 PPO 训练连续控制任务**

```python
import gymnasium as gym
from stable_baselines3 import PPO
from stable_baselines3.common.evaluation import evaluate_policy

# 创建连续控制环境（倒立摆）
env = gym.make('Pendulum-v1')

# PPO 使用高斯分布来表示连续动作策略
model = PPO(
    "MlpPolicy",
    env,
    learning_rate=3e-4,
    n_steps=2048,
    batch_size=64,
    n_epochs=10,
    gamma=0.99,
    gae_lambda=0.95,
    clip_range=0.2,
    ent_coef=0.0,
    verbose=1
)

# 训练
model.learn(total_timesteps=100000)

# 评估
mean_reward, std_reward = evaluate_policy(model, env, n_eval_episodes=10)
print(f"PPO Pendulum 平均奖励: {mean_reward:.2f} ± {std_reward:.2f}")

# 保存
model.save("ppo_pendulum")
```

**第五步：从原理上理解 PPO 的 Clip 机制**

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class PolicyNetwork(nn.Module):
    def __init__(self, obs_dim, act_dim, hidden_dim=64):
        super().__init__()
        self.fc1 = nn.Linear(obs_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.fc3 = nn.Linear(hidden_dim, act_dim)

    def forward(self, x):
        x = F.tanh(self.fc1(x))
        x = F.tanh(self.fc2(x))
        logits = self.fc3(x)
        return logits

# PPO Clip 损失计算
def ppo_clip_loss(policy, obs, actions, advantages, old_log_probs, clip_eps=0.2):
    logits = policy(obs)
    dist = torch.distributions.Categorical(logits=logits)
    log_probs = dist.log_prob(actions)

    # 重要性采样比率
    ratio = torch.exp(log_probs - old_log_probs)

    # 未裁剪目标
    surr1 = ratio * advantages
    # 裁剪目标
    surr2 = torch.clamp(ratio, 1.0 - clip_eps, 1.0 + clip_eps) * advantages
    # 取最小值
    loss = -torch.min(surr1, surr2).mean()

    return loss
```

## 常见误区

**"强化学习就是奖励工程，调奖励就行" → 不对。** 奖励设计确实重要，但算法选择、超参调优、网络结构、探索策略同样关键。好的奖励设计能让学习更快，但不能替代算法理解。

**"DQN 可以用在任何强化学习问题上" → 不对。** DQN 只适合离散动作空间，而且动作数量不能太多（Atari 游戏的动作数通常是 18 个以内）。连续控制要用策略梯度方法（如 PPO、SAC）。

**"PPO 是最好的算法，什么问题都用 PPO" → 不完全对。** PPO 确实很通用很稳定，但在某些问题上有更优选择：比如离线强化学习用 CQL，样本效率极致追求用 SAC，纯探索问题用 UCB 等。

**"策略梯度的目标就是最大化回报，所以梯度越大越好" → 不对。** 这正是 PPO 要解决的问题——步长太大策略会直接崩掉，然后再也恢复不回来。PPO 的 Clip 就是为了限制更新幅度，宁可慢一点也要稳。

**"经验回放越多越好" → 不对。** 回放缓冲区太大可能导致"陈旧经验"问题——环境变了但还在用旧数据训练。回放缓冲区大小需要根据任务调整，不是越大越好。

**"折扣因子 γ 越接近 1 越好" → 不对。** γ 接近 1 意味着更看重长远奖励，但也会让值函数估计的方差变大，学习更不稳定。需要根据任务的"有效视野"来选择：如果任务只需要看 10 步，γ=0.9 就够了。

## 学习资源推荐

1. **Sutton & Barto《Reinforcement Learning: An Introduction》** — 强化学习圣经，理论最系统，建议精读前 13 章
2. **David Silver 强化学习课程（UCL）** — YouTube 上有全套视频，Sutton 的学生讲的，配合书一起看
3. **OpenAI Spinning Up** — 最适合入门的实践教程，每个算法都有清晰的讲解和可运行的简洁实现
4. **Hugging Face Deep RL Course** — 免费且质量极高，从基础到进阶，有大量可交互的练习和代码
5. **Stable-Baselines3 官方文档** — 最常用的 RL 算法库，文档里有最佳实践和大量例子
6. **Lilian Weng 博客《Policy Gradient Algorithms》** — 一篇文章讲透策略梯度家族，公式推导非常清晰
7. **DeepMind AlphaGo 纪录片** — 培养直觉和兴趣，感受强化学习的魅力
