---
title: PyTorch 深度学习框架
category: deep-learning
difficulty: intermediate
duration: 2-3周
summary: 学术界最主流的动态图框架，以清晰直观的方式定义模型，Debug 友好，是深度学习入门与论文复现的首选
takeaways:
  - 掌握 Tensor 的创建、形状变换、数学运算、GPU 迁移与 NumPy 互转
  - 理解 autograd 自动微分机制，会用 backward() 并在不需要梯度时用 torch.no_grad() / detach()
  - 能独立用 nn.Module 定义网络、组合子模块，写完整训练循环（train/eval/保存/恢复 checkpoint）
  - 会选择优化器、配置学习率调度与梯度裁剪，能排查 NaN loss、梯度消失/爆炸等常见问题
relatedTools:
  - "pytorch"
  - "ultralytics-yolo"
  - "huggingface-transformers"
relatedIntel:
  - 001-transformer
  - 113-gnn-basics
tags:
  - pytorch
  - tensor
  - autograd
  - nn.module
  - dataloader
  - optimizer
  - gpu
relatedTerms:
  - "cnn"
  - "gradient-descent"
  - "tensor"
  - "transformer"
relatedNodes:
  - "llm-inference"
  - "cv-segmentation"
---

## 为什么你要学它

你一定在论文、GitHub、教程里反复看到 "PyTorch implementation" 这个词。PyTorch 之所以能成为学术界的默认选择，核心原因只有一个：**它跟 Python 一样写，跟普通代码一样 Debug**。

- **动态计算图**：TensorFlow 1.x 时代你需要先"定义图"再"运行图"，中间变量看不见。PyTorch 是"运行即定义"——你随时 `print(x.shape)`、随时 `pdb.set_trace()` 断点调试、随时改一下代码逻辑看看对不对，就像写普通 Python 代码一样自然。
- **GPU 友好**：一行 `.cuda()` 或 `.to("cuda")` 把张量移到 GPU；一行 `.cpu()` 移回。CUDA 驱动、cuDNN、混合精度训练都被封装得很好。
- **组件化**：`torch.nn`（层）、`torch.optim`（优化器）、`torch.utils.data`（数据加载）、`torch.nn.functional`（函数式算子）四大模块配合默契，几乎每篇新论文的算子你都能组合出来。

学会 PyTorch 后，你就能从 "看论文" 变成 "复现论文"，从 "调别人的代码" 变成 "自己设计模型"。

## 一句话概览（快速版）

- **Tensor = 多维数组**：有 shape、dtype、device 三大属性；CPU/GPU 上都能放
- **autograd = 自动求导**：只要 `requires_grad=True`，所有运算都会被记录在计算图里，`loss.backward()` 一次把梯度算到每个 Tensor 的 `.grad`
- **nn.Module = 网络层容器**：你自己的模型继承 `nn.Module`，`__init__` 里定义子模块，`forward` 里写前向逻辑
- **训练循环**：`for epoch: for batch: optimizer.zero_grad() → output = model(x) → loss = criterion(output, y) → loss.backward() → optimizer.step()`

## 核心拆解

### 🔑 Tensor 基础

```python
import torch

# 创建
x = torch.tensor([1, 2, 3])                     # [1, 2, 3]
x = torch.zeros(2, 3)                            # 2x3 全零
x = torch.ones(2, 3)                             # 2x3 全一
x = torch.randn(4, 3)                            # 标准正态
x = torch.randint(0, 10, (5,))                   # 随机整数
x = torch.arange(0, 10, 2)                       # [0,2,4,6,8]
x = torch.eye(5)                                 # 5x5 单位矩阵

# 查看属性
print(x.shape, x.dtype, x.device)                # (5,5) torch.float32 cpu

# 类型转换
x_long = x.long()                                # → int64
x_float = x.float()                              # → float32
x_half = x.half()                                # → float16

# 与 NumPy 互转
import numpy as np
arr = np.random.randn(3, 3)
t1 = torch.from_numpy(arr)                       # 与 numpy 数组共享内存（CPU 上）
t2 = torch.tensor(arr, dtype=torch.float32)     # 拷贝一份
back = t2.numpy()                                # → NumPy（先确保在 CPU）
```

**GPU 迁移**：

```python
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
x = x.to(device)                                   # 推荐写法（兼容 CPU / GPU）
# 也可以写成 x = x.cuda() 或 x = x.cpu()

# 直接在 GPU 上创建，省去搬运
y = torch.randn(32, 128, device=device, dtype=torch.float32)
```

### 🔑 形状变换（reshape、view、transpose、permute、squeeze/unsqueeze）

```python
x = torch.randn(32, 3, 224, 224)

# reshape / view：都可以改变形状（view 要求内存连续，reshape 自动处理）
y = x.reshape(32, -1)                              # (32, 3*224*224) = (32, 150528)
z = x.view(32, -1)                                 # 同上（如果 x 内存连续）

# 交换两轴（比如 NCHW → NHWC）
x2 = x.transpose(1, 3)                              # (32, 224, 224, 3)

# 多轴重排
x3 = x.permute(0, 2, 3, 1)                         # 同上，语义更清晰

# 增/减 1 维
x4 = torch.randn(32)                               # (32,)
x4_col = x4.unsqueeze(1)                           # (32, 1)
x4_row = x4.unsqueeze(0)                           # (1, 32)
x4_back = x4_col.squeeze(1)                        # (32,)

# cat / stack：拼接
a = torch.randn(8, 10)
b = torch.randn(8, 10)
c = torch.cat([a, b], dim=0)                       # (16, 10) 沿现有维度拼接
d = torch.stack([a, b], dim=0)                     # (2, 8, 10) 新增一维堆叠
```

### 🔑 数学运算（逐元素 / 矩阵乘法 / 归约）

```python
a = torch.randn(4, 3)
b = torch.randn(3, 5)

# 逐元素
(a + 2) * 0.5                                      # 广播
a.mul_(2)                                          # 原地乘 2（带下划线 _ 表示 in-place）
torch.exp(a)                                       # e^a
torch.sigmoid(a)
torch.softmax(a, dim=1)                            # 每行 softmax（sum=1）

# 矩阵乘法
c = a @ b                                          # (4, 5) —— 推荐写法
c2 = torch.matmul(a, b)                            # 同上

# 归约统计（注意 dim 参数）
a.mean()                                           # 全体均值（标量）
a.mean(dim=0)                                      # 按列求均值 → shape (3,)
a.mean(dim=1, keepdim=True)                        # 保持维度 → shape (4, 1)
a.sum(), a.std(), a.max(), a.argmax()
```

### 🔑 autograd 自动微分

```python
# 1. 把需要求导的 tensor 标记 requires_grad=True
x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
y = x ** 2 + 2 * x + 1                             # 计算图：y = x² + 2x + 1
z = y.sum()                                        # 求标量才能 backward

z.backward()                                       # 反向传播
print(x.grad)                                      # dy/dx = 2x + 2 → [4, 6, 8]
```

**不需要梯度时的三个常见写法**：

```python
# (1) torch.no_grad()：推理/验证阶段用，不构建计算图，省内存/算力
with torch.no_grad():
    val_pred = model(val_x)

# (2) .detach()：把 tensor 从计算图中剥离出来
loss_ = loss.detach()                              # 只记录数值，不再梯度传播

# (3) 对已有模型整体冻结参数
for p in model.parameters():
    p.requires_grad = False
```

**常见坑**：把需要梯度的 numpy 数组先转成 tensor 再标记 requires_grad，不要中途再 `.numpy()`。另外 `loss.backward()` 调用前要 `optimizer.zero_grad()`（或 `model.zero_grad()`），否则梯度会在多个 batch 上累加。

### 🔑 nn.Module 编写模板

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class MyMLP(nn.Module):
    def __init__(self, input_dim, hidden_dim, num_classes, dropout=0.3):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.bn1 = nn.BatchNorm1d(hidden_dim)
        self.act1 = nn.ReLU()
        self.dropout1 = nn.Dropout(dropout)
        self.fc2 = nn.Linear(hidden_dim, num_classes)

    def forward(self, x):
        x = self.fc1(x)
        x = self.bn1(x)
        x = self.act1(x)
        x = self.dropout1(x)
        x = self.fc2(x)                                # logits（未过 softmax）
        return x

# 实例化并移到 GPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = MyMLP(input_dim=784, hidden_dim=256, num_classes=10).to(device)

# 查看可训练参数数量
print("Params:", sum(p.numel() for p in model.parameters() if p.requires_grad))
```

**子模块组合（Sequential）**：简单场景用 `nn.Sequential` 更简洁：

```python
simple_model = nn.Sequential(
    nn.Flatten(),
    nn.Linear(784, 256), nn.ReLU(),
    nn.Linear(256, 64), nn.ReLU(),
    nn.Linear(64, 10),
).to(device)
```

**为什么推荐显式写 forward 而不是全 Sequential**：因为你能在 forward 里灵活加 skip-connection、注意力、条件逻辑、调试 print。

### 🔑 DataLoader 数据管道

```python
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as T

class MyDataset(Dataset):
    def __init__(self, X, y, transform=None):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.long)
        self.transform = transform

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        x = self.X[idx]
        if self.transform:
            x = self.transform(x)
        return x, self.y[idx]

# 假设 X_train, y_train, X_val, y_val 已经处理好（见 010-numpy-pandas.md）
train_ds = MyDataset(X_train, y_train)
val_ds = MyDataset(X_val, y_val)

train_loader = DataLoader(
    train_ds, batch_size=128, shuffle=True,
    num_workers=4, pin_memory=True, drop_last=True,
)
val_loader = DataLoader(
    val_ds, batch_size=256, shuffle=False,
    num_workers=4, pin_memory=True,
)
```

**参数理解**：`shuffle=True` 只用于训练（打乱样本顺序），`num_workers` 是并行加载进程数（CPU 核心数的一半左右合适，Windows 下写 0 最稳），`pin_memory=True` 在 GPU 训练时配合 `.to(device, non_blocking=True)` 可以加速搬运。

### 🔑 优化器、学习率调度与梯度裁剪

```python
import torch.optim as optim

# 1. 优化器：AdamW 是最稳妥的默认选择
optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)

# 2. 学习率调度：余弦退火 + warmup（训练稳定的关键组合）
scheduler = optim.lr_scheduler.CosineAnnealingLR(
    optimizer, T_max=50                       # 50 个 epoch 把 lr 从 1e-3 降到接近 0
)

# 3. 梯度裁剪：放在 loss.backward() 之后、optimizer.step() 之前
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
```

**其他常用选项**：

- `optim.SGD(model.parameters(), lr=0.01, momentum=0.9)`：收敛慢但有时泛化更好
- `optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.1)`：每 10 个 epoch 把 lr 乘 0.1

### 🔑 完整训练循环（train / val / save / restore）

```python
import time

criterion = nn.CrossEntropyLoss()

EPOCHS = 20
best_val_acc = 0.0
history = {"train_loss": [], "val_loss": [], "val_acc": []}

for epoch in range(EPOCHS):
    # --------- 训练阶段 ---------
    model.train()
    train_loss = 0.0
    start = time.time()

    for batch_X, batch_y in train_loader:
        batch_X = batch_X.to(device, non_blocking=True)
        batch_y = batch_y.to(device, non_blocking=True)

        optimizer.zero_grad(set_to_none=True)    # 清零梯度（set_to_none=True 更省内存）
        logits = model(batch_X)
        loss = criterion(logits, batch_y)
        loss.backward()                           # 反向传播：把梯度写到每个 param.grad
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()                          # 更新参数

        train_loss += loss.item() * batch_X.size(0)

    scheduler.step()

    # --------- 验证阶段 ---------
    model.eval()
    val_loss = 0.0
    val_correct = 0
    val_total = 0

    with torch.no_grad():
        for batch_X, batch_y in val_loader:
            batch_X = batch_X.to(device, non_blocking=True)
            batch_y = batch_y.to(device, non_blocking=True)
            logits = model(batch_X)
            loss = criterion(logits, batch_y)
            val_loss += loss.item() * batch_X.size(0)
            preds = logits.argmax(dim=1)
            val_correct += (preds == batch_y).sum().item()
            val_total += batch_y.size(0)

    # --------- 记录与打印 ---------
    train_loss /= len(train_loader.dataset)
    val_loss /= val_total
    val_acc = val_correct / val_total
    history["train_loss"].append(train_loss)
    history["val_loss"].append(val_loss)
    history["val_acc"].append(val_acc)

    elapsed = time.time() - start
    lr = optimizer.param_groups[0]["lr"]
    print(f"[Epoch {epoch+1:02d}/{EPOCHS}] train_loss={train_loss:.4f} "
          f"val_loss={val_loss:.4f} val_acc={val_acc:.4f} lr={lr:.6f} time={elapsed:.1f}s")

    # --------- 保存最佳 checkpoint ---------
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save({
            "epoch": epoch + 1,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "scheduler_state_dict": scheduler.state_dict(),
            "best_val_acc": best_val_acc,
            "history": history,
        }, "best_model.pt")
        print(f"  -> 新最佳 val_acc={val_acc:.4f}, 已保存 best_model.pt")

print(f"\n训练结束，最佳 val_acc={best_val_acc:.4f}")

# --------- 从 checkpoint 恢复 ---------
checkpoint = torch.load("best_model.pt", map_location=device, weights_only=True)
new_model = MyMLP(input_dim=784, hidden_dim=256, num_classes=10).to(device)
new_model.load_state_dict(checkpoint["model_state_dict"])
new_model.eval()
# 恢复优化器（继续训练时用）
optimizer.load_state_dict(checkpoint["optimizer_state_dict"])
```

### 🔑 把模型用于推理

```python
# 推理模式：dropout/batchnorm 切换到 eval 行为
model.eval()
with torch.no_grad():
    sample = torch.randn(1, 784, device=device)
    logits = model(sample)
    probs = torch.softmax(logits, dim=1)          # 转成概率分布
    pred = logits.argmax(dim=1).item()
    print(f"预测类别={pred}, 置信度={probs[0, pred].item():.4f}")
```

## 完整跑通方案

**第一步：准备环境与种子**

```python
import os
import random
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import torchvision.transforms as T
import torchvision.datasets as datasets

# 固定随机种子（让实验可复现）
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
torch.cuda.manual_seed_all(SEED)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)
```

**第二步：下载/加载 MNIST 并构建 DataLoader**

```python
transform_train = T.Compose([
    T.ToTensor(),                                   # → [0, 1] 的 (1,28,28) tensor
    T.Normalize((0.1307,), (0.3081,)),            # MNIST 统计量
])
transform_val = T.Compose([
    T.ToTensor(),
    T.Normalize((0.1307,), (0.3081,)),
])

train_ds = datasets.MNIST("./data", train=True, download=True, transform=transform_train)
val_ds = datasets.MNIST("./data", train=False, transform=transform_val)

train_loader = DataLoader(train_ds, batch_size=128, shuffle=True, num_workers=4, pin_memory=True, drop_last=True)
val_loader = DataLoader(val_ds, batch_size=256, shuffle=False, num_workers=4, pin_memory=True)

print("Train samples:", len(train_ds), "Val samples:", len(val_ds))
```

**第三步：定义一个简单的 CNN 模型**

```python
class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        self.pool = nn.MaxPool2d(2)
        self.dropout = nn.Dropout(0.3)
        self.fc1 = nn.Linear(64 * 7 * 7, 128)
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x):
        x = self.pool(torch.relu(self.bn1(self.conv1(x))))    # (N,32,14,14)
        x = self.pool(torch.relu(self.bn2(self.conv2(x))))    # (N,64,7,7)
        x = x.flatten(1)                                      # (N, 64*7*7)
        x = torch.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x

model = SimpleCNN(num_classes=10).to(device)
print("Trainable params:", sum(p.numel() for p in model.parameters() if p.requires_grad))
```

**第四步：配置损失、优化器、调度器**

```python
criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=10)
```

**第五步：跑训练循环（用之前写的训练/验证脚本，只需把 EPOCHS=10 即可）**

```python
EPOCHS = 10
best_val_acc = 0.0

for epoch in range(EPOCHS):
    model.train()
    train_loss = 0.0
    for x, y in train_loader:
        x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
        optimizer.zero_grad(set_to_none=True)
        logits = model(x)
        loss = criterion(logits, y)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        train_loss += loss.item() * x.size(0)
    scheduler.step()
    train_loss /= len(train_loader.dataset)

    model.eval()
    val_correct = 0
    val_total = 0
    val_loss = 0.0
    with torch.no_grad():
        for x, y in val_loader:
            x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
            logits = model(x)
            loss = criterion(logits, y)
            val_loss += loss.item() * x.size(0)
            val_correct += (logits.argmax(1) == y).sum().item()
            val_total += y.size(0)

    val_loss /= val_total
    val_acc = val_correct / val_total
    print(f"Epoch {epoch+1:02d}: train_loss={train_loss:.4f} val_loss={val_loss:.4f} val_acc={val_acc:.4f}")

    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save({
            "epoch": epoch + 1,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "scheduler_state_dict": scheduler.state_dict(),
            "best_val_acc": best_val_acc,
        }, "best_mnist_cnn.pt")
        print(f"  -> 保存最佳模型, val_acc={val_acc:.4f}")

print(f"训练完成，最佳 val_acc={best_val_acc:.4f}")
```

**第六步：从 best_mnist_cnn.pt 恢复并推理一张图像**

```python
checkpoint = torch.load("best_mnist_cnn.pt", map_location=device, weights_only=True)
infer_model = SimpleCNN(num_classes=10).to(device)
infer_model.load_state_dict(checkpoint["model_state_dict"])
infer_model.eval()

# 拿一张验证集图片
sample_x, sample_y = val_ds[0]                          # (1, 28, 28), 标签
with torch.no_grad():
    logits = infer_model(sample_x.unsqueeze(0).to(device))   # 加 batch 维 (1,1,28,28)
    pred = logits.argmax(1).item()
print(f"真实标签={sample_y}, 预测={pred}")
```

## 常见误区

**误区 1：忘了 model.train() / model.eval() 切换 → dropout / batchnorm 行为错了，验证 acc 显著偏低**

解释：训练时 dropout 随机丢掉神经元、BN 用当前 batch 的统计量做归一化；验证时 dropout 要关闭、BN 要使用训练阶段积累的全局统计量。进入每个阶段前都必须显式调用 `model.train()` 或 `model.eval()`。

**误区 2：loss.backward() 之前没 optimizer.zero_grad() → 梯度不断累加，loss 卡住不动**

解释：PyTorch 的 `.grad` 是累积的（方便 RNN / 多任务）。一个标准循环必须是：**清零 → forward → loss → backward → step**。漏掉 zero_grad 是新手最常犯的错误。推荐写 `optimizer.zero_grad(set_to_none=True)`，比默认 `zero_grad()` 更省内存。

**误区 3：把 LongTensor 当 float 用 / 把 float 当类别 → shape/dtype 错误，loss 直接 NaN**

解释：`nn.CrossEntropyLoss(pred, target)` 要求 pred 是 float32 的 (N, C)，target 是 int64 的 (N,)。不要把 one-hot 当 target 传（如果你确实有 one-hot，用 CrossEntropyLoss 的 weight 参数或改成 F.cross_entropy(pred, target_onehot.argmax(dim=1))）。

**误区 4：忘了把 data / model 移到 GPU → 训练在 CPU 跑，比 GPU 慢 20~100 倍**

解释：`model.to(device)` 是原地修改模型参数并返回自己，所以可以直接写 `model = MyModel().to(device)`。但 tensor 的 `.to(device)` 不修改原对象，必须写成 `x = x.to(device)`。整个脚本中 **model 和数据必须在同一 device 上**，否则会报 device mismatch。

**误区 5：在推理阶段忘了 `with torch.no_grad()` → 显存暴涨，跑得还慢**

解释：推理/验证阶段模型不需要计算梯度，但默认仍会构建计算图（占用额外显存与算力）。养成验证循环 + 推理都用 `with torch.no_grad():` 的习惯。

**误区 6：用 in-place 操作（`x += y`、`x.clamp_()`、`F.relu(x, inplace=True)`）影响自动微分 → 梯度算错或直接 RuntimeError**

解释：带 `_` 结尾的方法都是"原地修改 tensor 内容"，可能破坏 autograd 追踪。早期版本 PyTorch 对这类错误直接报错。建议尽量少用 in-place，除非你明确知道不需要梯度或已经 detach()。

**误区 7：lr 设太大（如 0.1）导致 loss 直接爆炸成 NaN；或太小导致 100 个 epoch 都没收敛**

解释：开始训练前先跑几个小 batch 看 loss 能不能稳定下降。可以用 `torch.optim.lr_scheduler.OneCycleLR` 配合 warmup 让 lr 从 0 平滑升到最大值再下降，收敛稳很多。发现 NaN 第一步检查：(a) lr 是否过大；(b) 输入是否归一化；(c) 是否有 `loss / 0` 或 log(0)。

**误区 8：保存整个 `torch.save(model, "best.pt")` 而不是 state_dict → 反序列化失败、文件体积大、不同版本 PyTorch 不兼容**

解释：推荐始终保存 `model.state_dict()`（以及 optimizer、scheduler 的 state_dict），恢复时先重新实例化模型再 `load_state_dict`。这样模型代码变了也能兼容（只要参数名/形状一致）。

**误区 9：num_workers 在 Windows 上用默认 4 → 程序卡住或报奇怪错误**

解释：Windows 不支持 fork，num_workers>0 有时会出现多进程问题。调试阶段先写 `num_workers=0`，确认跑通后再逐步增大。生产环境 Linux 推荐 num_workers = CPU 核数的一半左右（经验值）。
