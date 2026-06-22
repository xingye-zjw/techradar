# 张量（Tensor）

**张量** 是现代深度学习框架（PyTorch、TensorFlow）中最基本的数据结构。从数学角度，张量是标量、向量、矩阵在任意维度上的推广；从工程角度，张量可以理解为「多维数组」。

PyTorch、TensorFlow 等框架都围绕「张量计算」来构建整个生态。

## 张量的阶（维度 / Rank）

| 名称 | 维度 | 示例 | 用途 |
|------|------|------|-----|
| **标量 (Scalar)** | 0 阶 | `7`、`3.14` | 损失值、准确率、单个数值 |
| **向量 (Vector)** | 1 阶 | `[1, 2, 3]` | 词嵌入 (embedding)、特征向量、偏置 |
| **矩阵 (Matrix)** | 2 阶 | `[[1,2],[3,4]]` | 一批数据、图像灰度、权重矩阵 |
| **3 阶张量** | 3 阶 | `(C, H, W)` | 单张 RGB 图像 (3×224×224) |
| **4 阶张量** | 4 阶 | `(N, C, H, W)` | 一批图像 (64×3×224×224) |
| **5 阶张量** | 5 阶 | `(N, T, C, H, W)` | 视频批数据（时间维度） |

**一句话记忆**：**阶数** = **需要多少个下标才能定位一个具体的数值**。

例如在 `shape=(64, 3, 224, 224)` 的图像批数据中：
- `tensor[0, 0, 0, 0]` = 第一张图片、第一个通道（R）、第一行第一列的像素值
- 需要 4 个下标 → 这是一个 4 阶张量

## 在 PyTorch 中操作张量

```python
import torch

# ============ 创建张量 ============

# 从 Python 数据创建
x = torch.tensor([1, 2, 3])                 # 整数
y = torch.tensor([1.0, 2.0, 3.0])           # 浮点数

# 常见初始化
zeros = torch.zeros(3, 4)                   # 全零矩阵 3×4
ones = torch.ones(2, 3, 3)                  # 全 1
rand = torch.rand(4)                        # [0,1] 均匀分布随机
randn = torch.randn(3, 3)                   # 标准正态分布 N(0,1)
identity = torch.eye(5)                     # 5×5 单位矩阵

# 区间 / 序列
torch.arange(0, 10, 2)                      # [0,2,4,6,8]
torch.linspace(0, 1, 100)                   # 100 个均匀采样点

# ============ 查看属性 ============
x = torch.randn(64, 3, 224, 224)
x.shape                                     # torch.Size([64, 3, 224, 224])
x.dtype                                     # torch.float32
x.device                                    # 'cpu' 或 'cuda:0'
x.numel()                                   # 元素总数 = 64*3*224*224
x.dim()                                     # 维度数 = 4

# ============ 类型转换 ============
x = torch.tensor([1, 2, 3])                 # int64
x.float()                                   # → float32
x.long()                                    # → int64
x.half()                                    # → float16 (半精度，省显存)
x.double()                                  # → float64
x.to(torch.bfloat16)                        # → bfloat16 (现代大模型常用)

# ============ GPU 操作 ============
x = torch.randn(3, 3)
x_gpu = x.cuda()                            # 移到 GPU
x_cpu = x.cpu()                             # 回到 CPU
if torch.cuda.is_available():               # 通用写法
    device = torch.device('cuda')
else:
    device = torch.device('cpu')
x = x.to(device)

# ============ 形状操作 ============
x = torch.randn(3, 4)                       # shape=(3,4)
x.view(2, 6)                                # reshape (元素总数必须一致)
x.view(-1, 6)                               # -1: 自动推断该维度
x.reshape(12)                               # 类似 view（更推荐的现代写法）
x.transpose(0, 1)                           # 交换两个维度
x.permute(1, 0)                             # 多个维度任意交换
x = x.unsqueeze(0)                          # 在第 0 维加一个维度 (1,3,4)
x = x.squeeze(0)                            # 去除第 0 维的 1 (3,4)

# ============ 常见数学运算 ============
a = torch.tensor([1, 2, 3], dtype=torch.float32)
b = torch.tensor([4, 5, 6], dtype=torch.float32)

a + b                                       # 逐元素加法 [5,7,9]
a * b                                       # 逐元素乘法 [4,10,18]
a / b                                       # 逐元素除法
torch.dot(a, b)                             # 点积 = 1*4+2*5+3*6 = 32

# 矩阵乘法
W = torch.randn(3, 4)
x = torch.randn(4)
result = W @ x                              # shape=(3,), Python 3.5+ 的 @ 运算符
result = torch.matmul(W, x)                 # 等价写法

# 激活函数（逐元素）
torch.relu(a)
torch.sigmoid(a)
torch.tanh(a)
torch.softmax(a, dim=0)                     # 在第 0 维上归一化

# 聚合操作
x = torch.randn(3, 4)
x.sum()                                     # 所有元素的和
x.sum(dim=0)                                # 按第 0 维求和，结果 shape=(4,)
x.mean(dim=1)                               # 按第 1 维求平均
x.max()                                     # 最大值 + 位置
x.max(dim=1)                                # 每行的最大值

# ============ 索引与切片 ============
x = torch.randn(3, 4)
x[0, :]                                      # 第 0 行
x[:, 1]                                      # 第 1 列
x[1:3, 2:4]                                  # 子矩阵：第 1-2 行、2-3 列
x[x > 0]                                     # 布尔索引：只保留正值
```

## 张量的广播 (Broadcasting)

两个形状不同的张量在做算术运算时，较小的张量会「被广播」以匹配较大的张量的形状，让代码更简洁：

```python
x = torch.randn(3, 4)
y = torch.randn(4)

# x - y 会自动把 y 扩展成 (1,4)，再在第 0 维复制 3 次
# 等价于：x - y.unsqueeze(0).expand_as(x)
result = x - y

# 广播规则：
# 1. 从尾部维度开始比较
# 2. 如果相等 → OK
# 3. 如果一个是 1 → OK，会自动扩展
# 4. 否则报错！

# 例子：
# (64, 3, 224, 224) - (3, 1, 1)      ✓ OK: 后两维自动 expand
# (64, 3, 224, 224) - (64, 1, 1, 1)    ✓ OK
# (64, 3, 224, 224) - (4,)             ✗ ERROR: 224≠4
```

## 自动求导 (Autograd)

张量的 `.requires_grad` 属性告诉 PyTorch 是否需要为这个张量计算梯度：

```python
# 可训练参数
W = torch.randn(3, 4, requires_grad=True)
b = torch.zeros(3, requires_grad=True)
x = torch.randn(4)

# 前向传播
y = W @ x + b                   # shape=(3,)
loss = y.sum()                  # 标量

# 反向传播
loss.backward()

# 查看梯度
print(W.grad)                   # d(loss)/d(W) = shape=(3,4)
print(b.grad)                   # shape=(3,)

# 实际训练中的典型流程
for epoch in range(100):
    optimizer.zero_grad()       # 清空上次的梯度
    y_pred = model(x)
    loss = criterion(y_pred, y_true)
    loss.backward()             # 计算梯度
    optimizer.step()            # 更新参数
```

## 张量操作的性能优化

### 1. 避免循环，尽量使用向量化

```python
# ❌ 慢
result = torch.zeros(1000)
for i in range(1000):
    result[i] = data[i] * 2 + 1

# ✅ 快（矢量化操作，C++ 底层实现）
result = data * 2 + 1
```

### 2. 注意 `.view()` vs `.reshape()` vs `.transpose()` 的区别

- `view`: 只在内存连续时有效，不复制数据
- `reshape`: 可以处理不连续的情况，但可能会复制数据（隐式 copy）
- `transpose`: 显式交换两个维度，结果通常不连续

### 3. 原地操作 (in-place operations)

- 语法：带下划线 `_`，如 `x.add_(1)`、`x.clamp_()`
- 优点：省内存
- 缺点：在需要求梯度的张量上使用可能导致错误（计算图被破坏）
- 建议：在中间计算/数据预处理时用；在模型内部尽量避免

### 4. 批处理 (Batching)

把多个样本组合成一个批次进行并行计算：

```python
# ❌ 慢：逐样本处理
for img in images:
    output.append(model(img))

# ✅ 快：批量处理 (GPU 并行)
output = model(torch.stack(images))  # 假设 images 是 list of tensor
```

### 5. 使用合适的精度

| 精度 dtype | 显存占用 | 典型用途 |
|-----------|---------|---------|
| float32 | 4 byte/element | 默认训练、高精度要求 |
| float16 | 2 byte/element | 推理加速、混合精度训练 |
| bfloat16 | 2 byte/element | 现代 GPU（A100+）训练 |
| float64 | 8 byte/element | 特殊数值计算（极少用在 DL） |
| int8 | 1 byte/element | 量化推理 |

```python
# 混合精度训练示例（节省约一半显存）
with torch.amp.autocast('cuda'):
    output = model(inputs)
    loss = criterion(output, targets)
scaler.scale(loss).backward()
scaler.step(optimizer)
scaler.update()
```

## 常见张量 Shape 速查

| 场景 | 典型 Shape | 解释 |
|------|-----------|-----|
| 图像批 (PyTorch) | `(N, C, H, W)` | 批大小 × 通道 × 高 × 宽 |
| 图像批 (TensorFlow) | `(N, H, W, C)` | 批大小 × 高 × 宽 × 通道 |
| 词向量 | `(seq_len, d_model)` | 序列长度 × 嵌入维度 |
| Transformer 批 | `(batch, seq, embed)` | (32, 512, 768) |
| MLP 权重 | `(in_features, out_features)` | 线性层权重矩阵 |
| Conv 权重 | `(out_C, in_C, H, W)` | 卷积核参数 |
| BatchNorm 权重 | `(C,)` | 每通道一个 γ 和 β |

## 典型的张量操作链（图像分类前向传播）

```python
# 输入：一批 64 张 224×224 的 RGB 图像
x = torch.randn(64, 3, 224, 224)      # 64×3×224×224

# 第一层卷积
x = conv1(x)                           # 64×64×112×112
x = torch.relu(x)
x = maxpool(x)                         # 64×64×56×56

# 多层残差块
x = residual_blocks(x)                 # 64×2048×7×7

# 全局平均池化
x = F.adaptive_avg_pool2d(x, (1, 1))   # 64×2048×1×1
x = x.squeeze()                        # 64×2048

# 分类头
logits = fc(x)                         # 64×1000 (ImageNet 类别数)
probs = torch.softmax(logits, dim=1)   # 64×1000
```

## `view_as` / `as_tensor` / `tensor` 等容易混淆的创建方式

| 函数 | 用途 | 是否共享内存 |
|------|------|------------|
| `torch.tensor(data)` | 从数据创建新张量 | 否（总是复制） |
| `torch.as_tensor(data)` | 尽可能共享内存的创建 | 可能共享 |
| `torch.from_numpy(numpy_array)` | NumPy → Tensor | 是（共享底层内存） |
| `a.view_as(b)` | 把 a 变成 b 的形状 | 是 |
| `a.detach()` | 从计算图分离 | 是 |
| `a.clone()` | 深拷贝 | 否 |

关键含义：
- `tensor = numpy_array + from_numpy` → 修改 tensor 会同步修改 numpy_array
- `detach()` → 停止梯度传播，但共享底层数据
- `clone()` → 完全独立的副本

## 常见问题与解决方案

### ❌ CUDA out of memory

```
RuntimeError: CUDA out of memory.
Tried to allocate 2.00 GiB ...
```

**解决：**
1. 减小 `batch_size`
2. 降低精度：`model.half()` 或用 `autocast`
3. `del` 不再需要的张量 + `torch.cuda.empty_cache()`
4. 梯度检查点 (gradient checkpointing)：在显存和算力之间做 trade-off
5. 模型并行 / 张量并行 (如 Megatron-LM)
6. 使用更高效的实现 (Flash Attention)

### ❌ 维度不匹配

```
RuntimeError: mat1 and mat2 shapes cannot be multiplied
```

**解决：** 在每一步打印 `.shape` 确认维度变化；画维度变化图；使用 `assert x.shape == (expected,)` 做防御性检查。

### ❌ 设备不一致

```
RuntimeError: Expected all tensors to be on the same device
```

**解决：** 模型、输入、优化器、损失函数必须在同一 device。养成 `x.to(device)` 的习惯，或用 `accelerate` 等库统一管理。

### ❌ 不允许的 In-place 操作

```
RuntimeError: a leaf Variable that requires grad is being used in an in-place operation.
```

**解决：** 把 `x += 1` 改成 `x = x + 1`；避免在需要梯度的张量上用带下划线的函数。

## 深入学习路径

1. **基础操作**：熟悉 `.shape`、索引、reshape、矩阵乘法、聚合函数
2. **广播机制**：理解 broadcasting 规则，避免隐式扩展导致的 bug
3. **自动求导**：理解计算图、`.grad`、`detach()`、`in-place` 语义
4. **性能优化**：矢量化、避免 CPU↔GPU 数据拷贝、混合精度
5. **内存管理**：显存分析工具、张量切片优化
6. **高级主题**：自定义 `torch.autograd.Function`、JIT (TorchScript)、eager vs. torch.compile

相关术语：[PyTorch](/glossary/pytorch)、[矩阵](/glossary/matrix)、[梯度下降](/glossary/gradient-descent)、[过拟合](/glossary/overfitting)
