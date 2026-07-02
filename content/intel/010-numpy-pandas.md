---
title: NumPy / Pandas 数据处理
category: data-processing
difficulty: beginner
duration: 1-2周
summary: 深度学习 80% 的时间花在数据上，NumPy 和 Pandas 帮你把原始 CSV/Excel 变成模型能吃的张量
takeaways:
  - 掌握 NumPy ndarray 的创建、索引、形状变换与数学运算
  - 理解广播机制，能正确写出无需显式循环的向量化代码
  - 用 Pandas 读写 CSV/Excel，处理缺失值、去重、分组聚合、合并连接
  - 能把清洗后的数据对接成 PyTorch Dataset/DataLoader 训练管道
relatedTools:
  - pandas
  - numpy
relatedIntel:
  - 013-huggingface-datasets
  - 023-data-pipeline-etl
  - 040-data-annotation
tags:
  - numpy
  - pandas
  - data preprocessing
  - array
  - dataframe
  - csv
  - missing data
---

## 为什么你要学它

做 AI 项目的真实流程是这样的：拿到一堆乱糟糟的 CSV 数据 → 看一眼发现有缺失值、重复行、异常值、字符串列没法直接喂模型 → 花几天清洗、标准化、构建特征 → 才轮到你的大模型上场。

**数据分析与预处理占一个 AI 项目 70%~80% 的时间**。这时候你需要两个"瑞士军刀"：

- **NumPy**：把 Python 列表变成"数组张量"，支持向量化运算（一次对整个数组算，不需要写 for 循环）。速度比纯 Python 快 10~100 倍，是 PyTorch Tensor、Pandas DataFrame 的底层基石。
- **Pandas**：把 CSV/Excel 变成"带表头的二维表格"（DataFrame），你可以按列访问、按条件过滤、填缺失值、做分组统计。它就是数据科学圈的 Excel，只不过能用代码自动化。

不会 NumPy 和 Pandas，你就只能手动在 Excel 里手动 VLOOKUP、筛选、复制粘贴——处理 10 万行已经崩溃，更别说百万级的训练数据。

## 一句话概览（快速版）

- **NumPy 的核心是 ndarray**：shape 描述形状（比如 `(32, 3, 224, 224)` 表示 32 张 3 通道 224x224 图像），dtype 描述数据类型（float32 / int64 等）
- **广播机制**：形状不兼容的两个数组会自动被"补齐"到相同形状再运算（你只要记住 trailing dimensions 要么相等、要么其中一个为 1）
- **Pandas 的核心是 DataFrame**：每一列是一个 Series；你靠 `.loc` / `.iloc` 做索引，靠 `.fillna()` / `.dropna()` 处理缺失值，靠 `.groupby()` / `.merge()` 做聚合与合并

## 核心拆解

### 🔑 NumPy：创建数组、查看形状、类型转换

```python
import numpy as np

# 从 Python 列表创建
a = np.array([1, 2, 3, 4])            # 一维 (4,)
b = np.array([[1, 2], [3, 4]])        # 二维 (2, 2)

# 常用创建方式
c = np.zeros((3, 4))                  # 全零 (3, 4)
d = np.ones((3, 4))                   # 全一
e = np.eye(5)                         # 5x5 单位矩阵
f = np.random.randn(100, 2)           # 标准正态 (100, 2)
g = np.random.randint(0, 10, (5,))    # 随机整数
h = np.linspace(0, 10, 51)            # 0-10 之间 51 个等间距点
i = np.arange(0, 10, 0.5)             # 类似 range，但返回 ndarray

# 查看属性
print(a.shape, a.dtype, a.ndim, a.size)   # (4,) int64 1 4

# 类型转换
a_float = a.astype(np.float32)
```

**为什么要关心 dtype**：深度学习用 float32（或 float16）就够了，比 float64 省一半显存。默认整数是 int64，转成 int32 也能省内存。

### 🔑 索引、切片与条件筛选

```python
x = np.arange(20).reshape(4, 5)    # 4 行 5 列
# array([[ 0,  1,  2,  3,  4],
#        [ 5,  6,  7,  8,  9],
#        [10, 11, 12, 13, 14],
#        [15, 16, 17, 18, 19]])

x[0, 0]                    # 标量 0
x[:, 1]                    # 第 1 列：[1, 6, 11, 16]
x[1:3, :]                  # 第 1、2 行
x[::-1]                    # 行倒序
x[x[:, 0] > 5]             # 布尔索引：取出第 0 列大于 5 的行
np.where(x % 2 == 0, x, -1)  # 三目运算：偶数保留，奇数变 -1
```

### 🔑 数学运算与统计（向量化是核心）

NumPy 最大的魅力：直接对数组做数学运算，不需要写 for 循环。

```python
a = np.array([1.0, 2.0, 3.0])
b = np.array([10, 20, 30])

# 逐元素运算
a + b                   # [11, 22, 33]
a * b                   # [10, 40, 90]
a / b                   # [0.1, 0.1, 0.1]
a ** 2                  # [1, 4, 9]

# 矩阵乘法
m1 = np.random.randn(2, 3)
m2 = np.random.randn(3, 4)
m1 @ m2                 # shape (2, 4)
np.matmul(m1, m2)       # 同上

# 统计
x = np.random.randn(1000, 10)
x.mean()                # 全体均值
x.mean(axis=0)          # 每列均值（10 个）
x.std(axis=1)           # 每行标准差
x.sum()                 # 求和
x.max(), x.argmax()     # 最大值及其索引
```

### 🔑 形状变换与广播机制（最容易踩坑的部分）

```python
x = np.arange(24).reshape(2, 3, 4)   # (2, 3, 4)
y = x.transpose(0, 2, 1)             # 交换轴，shape 变为 (2, 4, 3)
z = x.reshape(2, -1)                 # -1 让 NumPy 自动推导（结果 (2, 12)）
flattened = x.ravel()                # 展平为一维

# 增加/删除轴（让 shape 能匹配广播规则）
a = np.array([1, 2, 3])              # shape (3,)
a_col = a[:, np.newaxis]             # shape (3, 1) —— 列向量
a_row = a[np.newaxis, :]             # shape (1, 3) —— 行向量
```

**广播**：当两个数组形状不完全一样，但"从右往左看，每一维要么相等，要么其中一个为 1 / 不存在"时，NumPy 会自动把小的那个沿缺失的维度复制。

```python
# 例 1：标量 2 被广播成 (3, 3) 的全 2 矩阵
np.ones((3, 3)) + 2

# 例 2：(3, 1) 与 (1, 4) → 结果 (3, 4)
np.ones((3, 1)) * np.ones((1, 4))

# 例 3：每张图的每个通道减去均值（ImageNet 标准化）
imgs = np.random.randn(32, 224, 224, 3)   # (N, H, W, C)
mean = np.array([0.485, 0.456, 0.406])    # (3,) —— 被广播到最后一维
imgs_norm = (imgs - mean) / np.array([0.229, 0.224, 0.225])
```

**不兼容形状**报错 `ValueError: operands could not be broadcast together with shapes (3,4) (3,5)` —— 先检查最后一维是否匹配。

### 🔑 Pandas：读 CSV、查看数据

```python
import pandas as pd

# 读取数据
df = pd.read_csv("train.csv")            # 最常用
df = pd.read_excel("data.xlsx", sheet_name="Sheet1")
df = pd.read_parquet("data.parquet")     # 列式存储，读取快、压缩率高

# 查看基本信息
df.head()                    # 前 5 行
df.tail()                    # 后 5 行
df.shape                     # (行数, 列数)
df.columns                   # 列名
df.dtypes                    # 每列数据类型
df.info()                    # 非空值数量、内存占用
df.describe()                # 数值列的统计量
df["category"].value_counts()   # 类别分布
df.isnull().sum()            # 每列缺失值数量
```

### 🔑 Pandas：索引选择、过滤、赋值

```python
# 按列名取列（返回 Series）
df["age"]
df[["age", "income"]]         # 取多列（返回 DataFrame）

# 按条件过滤行
df[df["age"] > 18]
df[(df["age"] > 18) & (df["city"] == "Beijing")]   # 注意 &/| 而不是 and/or
df.loc[df["age"] > 18, ["name", "income"]]          # loc[行条件, 列名]

# 按位置索引
df.iloc[0]                     # 第 0 行
df.iloc[0:10, 0:3]             # 前 10 行，前 3 列

# 新增列
df["income_per_age"] = df["income"] / df["age"]
df["label"] = (df["score"] > 80).astype(int)      # 二值化

# 修改值
df.loc[df["age"] > 100, "age"] = 100              # 把异常年龄截断到 100
df["city"] = df["city"].str.upper()                # 字符串列统一大写
```

### 🔑 Pandas：缺失值处理

```python
# 1. 直接丢掉
df_drop = df.dropna()                            # 去掉任意列有空值的行
df_drop_col = df.dropna(axis=1)                  # 去掉有任何空值的列

# 2. 填充
df_filled = df.fillna(0)                         # 用 0 填
df["age"] = df["age"].fillna(df["age"].median()) # 数值列用中位数填更稳
df["city"] = df["city"].fillna("Unknown")        # 类别列用 "Unknown" 填
df = df.ffill()                                  # 用前一行的值填充（时间序列常用）
df = df.bfill()                                  # 用后一行的值填充

# 3. 去重
df = df.drop_duplicates(subset=["name"], keep="first")
```

### 🔑 Pandas：分组聚合与合并连接

```python
# 分组聚合：按城市分组，计算收入的均值、中位数、数量
result = df.groupby("city")["income"].agg(["mean", "median", "count"])

# 多列多聚合
result2 = df.groupby(["city", "gender"]).agg({
    "income": ["mean", "std"],
    "age": "median",
})

# 合并两个 DataFrame
df1 = pd.DataFrame({"id": [1, 2, 3], "name": ["A", "B", "C"]})
df2 = pd.DataFrame({"id": [1, 2, 4], "score": [90, 85, 70]})
merged = pd.merge(df1, df2, on="id", how="left")   # 左连接，保留 df1 的全部行

# 按行拼接（比如把 train 和 val 拼起来）
combined = pd.concat([df_train, df_val], ignore_index=True)
```

### 🔑 Pandas 与 NumPy / PyTorch 的互转

```python
# DataFrame → NumPy 数组（不含列名）
arr = df[["age", "income"]].values              # 不推荐（返回 object dtype 可能性高）
arr = df[["age", "income"]].to_numpy(dtype=np.float32)   # 推荐，显式指定 dtype

# NumPy → PyTorch Tensor
import torch
tensor = torch.from_numpy(arr)
tensor = torch.tensor(arr, dtype=torch.float32)    # 注意 torch.from_numpy 与源数组共享内存

# Series → 列表 → Tensor
labels = torch.tensor(df["label"].tolist(), dtype=torch.long)
```

## 完整跑通方案

**第一步：读入 CSV，查看基本情况**

```python
import pandas as pd
import numpy as np

df = pd.read_csv("train.csv")
print("Shape:", df.shape)
print("Columns:", df.columns.tolist())
print("Dtypes:\n", df.dtypes)
print("\nMissing values per column:\n", df.isnull().sum())
print("\nFirst 5 rows:\n", df.head())
print("\nStats:\n", df.describe())
```

**第二步：清洗数据（缺失值、异常值、去重）**

```python
# 去重
df = df.drop_duplicates(subset=["image_filename"], keep="first").copy()

# 数值列用中位数填缺失值
numeric_cols = ["age", "income"]
for col in numeric_cols:
    df[col] = df[col].fillna(df[col].median())

# 类别列用众数填
df["city"] = df["city"].fillna(df["city"].mode().iloc[0])

# 异常值截断（把 age > 100 的变成 100）
df.loc[df["age"] > 100, "age"] = 100
df.loc[df["age"] < 0, "age"] = 0

# 重置索引
df = df.reset_index(drop=True)
```

**第三步：标准化数值列，独热编码类别列**

```python
# 数值列标准化（z-score）
for col in numeric_cols:
    mean = df[col].mean()
    std = df[col].std()
    if std > 0:
        df[col] = (df[col] - mean) / std

# 类别列独热编码（Pandas 原生）
df = pd.get_dummies(df, columns=["city", "gender"])
# 如果你要保留 dtypes 为整数而不是 bool：
# df = pd.get_dummies(df, columns=["city", "gender"], dtype=int)

print("After preprocessing, shape:", df.shape)
print(df.dtypes)
```

**第四步：切分训练集/验证集**

```python
from sklearn.model_selection import train_test_split

# 假设 "label" 是目标列
feature_cols = [c for c in df.columns if c != "label"]
X = df[feature_cols].to_numpy(dtype=np.float32)
y = df["label"].to_numpy(dtype=np.int64)

X_train, X_val, y_train, y_val = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print("Train:", X_train.shape, "Val:", X_val.shape)
```

**第五步：对接成 PyTorch DataLoader**

```python
import torch
from torch.utils.data import Dataset, DataLoader

class TabularDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.from_numpy(X)
        self.y = torch.from_numpy(y)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

train_ds = TabularDataset(X_train, y_train)
val_ds = TabularDataset(X_val, y_val)

train_loader = DataLoader(train_ds, batch_size=128, shuffle=True, num_workers=0)
val_loader = DataLoader(val_ds, batch_size=256, shuffle=False)

# 测试一下取一个 batch
for batch_X, batch_y in train_loader:
    print("Batch X shape:", batch_X.shape, "dtype:", batch_X.dtype)
    print("Batch y shape:", batch_y.shape, "dtype:", batch_y.dtype)
    break
```

**第六步：把处理好的数据保存成 Parquet，下次直接读取**

```python
df.to_parquet("train_cleaned.parquet")

# 下次直接读 Parquet，速度快很多
df2 = pd.read_parquet("train_cleaned.parquet")
```

## 常见误区

**误区 1：用 Python for 循环遍历 ndarray 元素 → 速度比原生 NumPy 慢 100 倍**

解释：NumPy 的运算在 C 层执行，你写的 Python 循环是在 Python 虚拟机里跑，慢一个数量级。养成"能不能不用 for 循环完成"的习惯。例如 `arr.mean(axis=1)` 代替 `[row.mean() for row in arr]`。

**误区 2：广播时 shape 搞反了 → 代码默默计算出错的结果而不报错**

解释：NumPy 会先把 shape 自动补 1，再广播。如果你的本意是 (N, 1) 但写成 (1, N)，结果完全不同。永远在广播前 `print(x.shape, y.shape)` 检查一下。

**误区 3：Pandas 链式索引 `df["col"][0] = 5` 来赋值 → 报警告 SettingWithCopyWarning，值未必真被改掉**

解释：链式索引（先取列再取行）返回的是原 DataFrame 的视图还是副本不确定。正确做法是用 `df.loc[0, "col"] = 5`，明确告诉 Pandas"直接在原对象上修改"。

**误区 4：缺失值直接 fillna(0) → 把连续数值列的真实分布给污染了**

解释：0 对数值列未必合理。更好的做法：数值列用中位数 `df[col].fillna(df[col].median())`，类别列用众数或 "Unknown"；数据量足够大时也可以直接 `dropna()` 丢弃。

**误区 5：把整个 DataFrame 直接 `.values` → 返回 object dtype，PyTorch 没法直接用**

解释：当 DataFrame 里有字符串列时，`.values` 会退化成 `dtype=object` 的数组，torch.from_numpy 无法处理。正确做法是**先选数值列**，再用 `.to_numpy(dtype=np.float32)` 显式指定 dtype。

**误区 6：读 10GB 大 CSV 直接用 read_csv → OOM 或极慢**

解释：用 `pd.read_csv("big.csv", chunksize=10000)` 按 chunk 分批处理，或者先把数据转成 Parquet（列式存储，Pandas 读取快几倍、体积小 5~10 倍）。Parquet 还能按列读取，你只要要 5 列就只加载那 5 列，非常省内存。

**误区 7：忘了 seed → 训练集/验证集每次切分结果都不一样，实验结果不可重复**

解释：`train_test_split(..., random_state=42)` 给一个固定随机种子。numpy 和 torch 也要手动 `np.random.seed(42)`、`torch.manual_seed(42)`，保证可复现。
