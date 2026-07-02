---
title: Hugging Face Datasets 数据集库
category: data-processing
difficulty: beginner
duration: 1周
summary: 一行代码加载公开数据集，底层用 Apache Arrow 列式存储，比自己解析 CSV/JSON 快 5~10 倍
takeaways:
  - 会用 datasets.load_dataset 一行加载 Hub 公开数据集与本地文件
  - 理解 Arrow 列式存储与内存映射的好处，知道 Dataset / DatasetDict 的区别
  - 能用 dataset.map(batched=True, num_proc=4) 做高效批量预处理与 tokenize
  - 能把 Dataset 对接成 PyTorch DataLoader，跑通 end-to-end 训练 pipeline
relatedIntel:
  - 010-numpy-pandas
  - 023-data-pipeline-etl
  - 040-data-annotation
tags:
  - datasets
  - huggingface
  - dataloader
  - arrow
  - parquet
---

## 为什么你要学它

做深度学习最花时间的三件事：**找数据、洗数据、喂数据给模型**。每一步都有坑——公开数据集格式五花八门（CSV、JSON、Parquet、图片文件夹、音频 wav、文本 jsonl…），自己写 loader 容易写出 bug、容易 OOM、速度还慢。

**Hugging Face Datasets 把这些脏活全给你包了。**

- **一行代码加载 Hub 上的 10,000+ 公开数据集**（从 MNIST 到 ImageNet 到 Wikipedia 中文语料都有）
- **同一套 API 也能加载你自己本地的数据集**（CSV / JSON / Parquet / 图片文件夹 全支持）
- **底层用 Apache Arrow 列式存储 + 内存映射（mmap）**，100GB 的数据也不炸内存，读速比纯 Python 快 5~10 倍
- **天然缓存**：第一次 load_dataset 后会缓存到本地，下次秒开
- **天然 sharding**：数据集自动分片，多进程并行处理（`num_proc=16` 就能把所有核跑满）
- **天然对接 Trainer**：和 transformers 的 Trainer 直接配合，也能直接喂给 PyTorch / TensorFlow / JAX DataLoader

一句话：**它就是你处理非小数据量任务时的默认工具。**

## 一句话概览（快速版）

- **加载**：`load_dataset("imdb")` 从 Hub 加载；`load_dataset("csv", data_files="train.csv")` 加载本地
- **结构**：`DatasetDict` 是"一个 dict，key 是 split（train/validation/test），value 是 Dataset"
- **Dataset 像 list + dict**：`dataset[0]` 拿第 0 条；`dataset["text"]` 拿整列
- **预处理**：`dataset.map(fn, batched=True, num_proc=4)` 分批处理；`set_format("torch")` 直接喂给 DataLoader
- **保存/导出**：`dataset.save_to_disk("./processed")` 存 Arrow；`dataset.to_parquet("./out.parquet")` 导成 Parquet

## 核心拆解

### 🔑 加载 Hub 公开数据集

```python
from datasets import load_dataset, Dataset, DatasetDict

# 一行加载公开数据集（返回 DatasetDict）
dataset = load_dataset("imdb")                         # 电影评论情感分类
print(dataset)
# DatasetDict({
#     train: Dataset({
#         features: ['text', 'label'],
#         num_rows: 25000
#     })
#     test: Dataset({
#         features: ['text', 'label'],
#         num_rows: 25000
#     })
#     unsupervised: Dataset({
#         features: ['text', 'label'],
#         num_rows: 50000
#     })
# })

# 只拿 train 这一份 split
train_ds = load_dataset("imdb", split="train")         # 返回 Dataset 而不是 DatasetDict

# 常用写法：把 train 切成 80/20 再组装回 DatasetDict
raw = load_dataset("imdb")
splits = raw["train"].train_test_split(test_size=0.1, seed=42)
ds = DatasetDict({
    "train": splits["train"],
    "validation": splits["test"],
    "test": raw["test"],
})
print(ds)

# 查看字段类型
print(ds["train"].features)
# {'text': Value(dtype='string', id=None),
#  'label': ClassLabel(names=['neg', 'pos'], id=None)}

# 看第一条
print(ds["train"][0])
# {'text': '...', 'label': 0}
```

### 🔑 加载本地数据（CSV / JSON / Parquet / 图片文件夹）

```python
# 本地 CSV
ds = load_dataset("csv", data_files="train.csv")        # 单文件
ds = load_dataset(
    "csv",
    data_files={"train": ["train_part1.csv", "train_part2.csv"], "test": "test.csv"},
)

# 本地 JSON（按行 jsonl 或整个 JSON 数组）
ds = load_dataset("json", data_files="data.jsonl", split="train")

# 本地 Parquet（强烈推荐！读写都比 CSV 快 5~10 倍，体积还小）
ds = load_dataset("parquet", data_files={"train": "train.parquet", "test": "test.parquet"})

# 图像分类数据集（文件夹结构：root/class_a/img1.jpg / class_b/img2.jpg ...）
# 支持 jpg/png/bmp/ppm/gif/tif/webp 等
image_ds = load_dataset("imagefolder", data_dir="./my_images/", split="train")
print(image_ds[0])                # {"image": <PIL.Image>, "label": 0}
print(image_ds.features["label"].names)

# 直接用字典列表构造 Dataset（用于小型 demo / 测试）
ds = Dataset.from_list([
    {"text": "我爱深度学习", "label": 1},
    {"text": "今天天气真好", "label": 0},
])
```

### 🔑 Dataset 的索引、切片、列操作

```python
# 把 Dataset 当成 "list of dict"
print(ds[0])                       # 第 0 条 → dict
print(ds[0:3])                     # 前 3 条 → dict of lists（字段名做 key）
print(ds["text"])                  # 把 text 整列拿出来 → Python list
print(len(ds))                     # 数据集大小

# select / filter：基于索引或条件筛选
small = ds.select(range(100))      # 只取前 100 条，快速做开发
positive = ds.filter(lambda x: x["label"] == 1, num_proc=4)

# 新增字段 / 删除字段
ds = ds.add_column("source", ["web"] * len(ds))
ds = ds.remove_columns(["metadata", "id"])

# 随机打乱
ds = ds.shuffle(seed=42)

# 切分
splits = ds.train_test_split(test_size=0.2, seed=42)   # 80/20
```

### 🔑 核心：map + batched 做批处理

`map` 是 Datasets 最强大的函数——可以串行/并行/分批处理整个数据集，结果会直接落盘到 Arrow 文件里，**不会把整个数据集放内存**。

```python
# ---- 例 1：文本 tokenize（NLP 场景）----
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-chinese")

def tokenize_fn(batch):
    # batch 是一个 dict，key 是字段名，value 是 list（长度 = batch_size）
    return tokenizer(
        batch["text"],
        padding="max_length",
        truncation=True,
        max_length=128,
    )

# batched=True：按批处理；num_proc=4：4 进程并行；batch_size=1000：每批 1000 条
tokenized = ds.map(
    tokenize_fn,
    batched=True,
    batch_size=1000,
    num_proc=4,
    remove_columns=["text"],      # 处理完后移除原始文本列（省内存）
)
print(tokenized.column_names)     # ['input_ids', 'token_type_ids', 'attention_mask', 'label']
```

```python
# ---- 例 2：图像分类预处理（CV 场景）----
from torchvision import transforms

preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def img_fn(batch):
    # batch["image"] 是 list[PIL.Image]
    batch["pixel_values"] = [preprocess(img.convert("RGB")) for img in batch["image"]]
    return batch

image_ds = image_ds.map(img_fn, batched=True, batch_size=64, num_proc=4)

# 告诉 Dataset：把这个字段直接以 torch tensor 形式返回
image_ds.set_format(type="torch", columns=["pixel_values", "label"])
```

**什么时候用 batched=True？** 几乎总是推荐——tokenizer / torchvision transforms / 任何向量化的 pandas 操作都是天然批处理的。设置后每次 `fn` 调用都会收到 `batch_size` 条样本，速度快很多。

### 🔑 保存到磁盘 & 重新加载

把预处理结果存成 Arrow 文件，下次不用重新跑（省几十分钟到几小时）：

```python
# 存到本地（推荐）
tokenized.save_to_disk("./imdb_tokenized")

# 重新加载（秒开）
from datasets import load_from_disk
reloaded = load_from_disk("./imdb_tokenized")

# 导出为通用格式
reloaded["train"].to_parquet("./imdb_train.parquet")
reloaded["train"].to_csv("./imdb_train.csv")
reloaded["train"].to_json("./imdb_train.jsonl")

# 只切一个子集做快速开发
tiny = reloaded["train"].select(range(200))
```

### 🔑 与 PyTorch DataLoader 对接

```python
import torch
from torch.utils.data import DataLoader

# set_format 告诉 Dataset：返回 torch tensor 而不是 list / dict
tokenized.set_format(type="torch", columns=["input_ids", "attention_mask", "label"])

# 直接用 DataLoader
train_loader = DataLoader(
    tokenized["train"],
    batch_size=32,
    shuffle=True,
    num_workers=4,
    pin_memory=True,
)

# 取一个 batch 看一下
for batch in train_loader:
    print({k: v.shape if hasattr(v, "shape") else v for k, v in batch.items()})
    # e.g. {'input_ids': [32, 128], 'attention_mask': [32, 128], 'label': [32]}
    break
```

**图像数据集对接**：

```python
image_ds.set_format(type="torch", columns=["pixel_values", "label"])
loader = DataLoader(image_ds, batch_size=32, shuffle=True, num_workers=4)
```

### 🔑 Arrow 列式存储与 mmap：它为什么这么快？

你不用记住 Arrow 的全部细节，但这 3 点能帮你理解它的性能优势：

1. **同列数据在磁盘上是连续存放的**——你如果只想读 "text" 这一列，就读那一列，不用把整行整行扫一遍，IO 量减少 90%+
2. **内存映射（mmap）**——你打开一个 100GB 的 Arrow 文件时，它不会一次性读到内存，而是按需把用到的部分映射到虚拟内存，操作系统负责 page in / page out。换句话说，**你的数据集大小可以远超机器物理内存**。这也是 datasets 在大数据量任务上比 pandas 稳的核心原因。
3. **零拷贝对接 PyTorch**——`set_format("torch")` 不复制数据，直接把 Arrow buffer 暴露为 torch tensor。CPU→CPU 拷贝是 0，只有搬到 GPU 才会有一次拷贝。

## 完整跑通方案

**第一步：安装依赖**

```bash
pip install datasets transformers torch torchvision pillow pandas
```

**第二步：一行加载一个 NLP 数据集并 tokenize**

```python
from datasets import load_dataset, DatasetDict
from transformers import AutoTokenizer

# 1) 加载中文情感分类数据集（这里用 imdb 当示例，换成你要的数据集即可）
raw = load_dataset("imdb")
print(raw)

# 2) 切分 90% / 10% 作为 train / validation
splits = raw["train"].train_test_split(test_size=0.1, seed=42)
ds = DatasetDict({
    "train": splits["train"],
    "validation": splits["test"],
    "test": raw["test"],
})

# 3) 定义 tokenizer
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

def tokenize_fn(batch):
    return tokenizer(
        batch["text"],
        padding="max_length",
        truncation=True,
        max_length=128,
    )

# 4) 批处理 + 并行
tokenized = ds.map(
    tokenize_fn,
    batched=True,
    batch_size=1000,
    num_proc=4,
    remove_columns=["text"],
)

# 5) 存盘
tokenized.save_to_disk("./imdb_tokenized")
print("已保存到 ./imdb_tokenized")
```

**第三步：对接成 PyTorch DataLoader 并跑一轮训练**

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from datasets import load_from_disk

tokenized = load_from_disk("./imdb_tokenized")
tokenized.set_format(type="torch", columns=["input_ids", "attention_mask", "label"])

train_loader = DataLoader(tokenized["train"], batch_size=32, shuffle=True, num_workers=4)
val_loader = DataLoader(tokenized["validation"], batch_size=64, shuffle=False, num_workers=4)

# 一个最小的文本分类模型（用 BertForSequenceClassification 会更标准，这里仅演示 pipeline）
from transformers import AutoModelForSequenceClassification, get_scheduler

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2).to(device)
optimizer = torch.optim.AdamW(model.parameters(), lr=5e-5)
num_epochs = 1
lr_scheduler = get_scheduler(
    name="linear",
    optimizer=optimizer,
    num_warmup_steps=0,
    num_training_steps=num_epochs * len(train_loader),
)

model.train()
for step, batch in enumerate(train_loader):
    batch = {k: v.to(device) for k, v in batch.items()}
    outputs = model(**batch)
    loss = outputs.loss
    loss.backward()
    optimizer.step()
    lr_scheduler.step()
    optimizer.zero_grad(set_to_none=True)
    if step % 100 == 0:
        print(f"[step {step}] loss={loss.item():.4f}")
print("✅ 训练完成")
```

**第四步：从本地图片目录构建图像分类数据集**

```python
from datasets import load_dataset
from torchvision import transforms
from torch.utils.data import DataLoader
import torch

# 目录结构：
# my_images/
#   train/
#     cat/
#       001.jpg
#       002.jpg
#     dog/
#       001.jpg
#   validation/
#     cat/
#     dog/

ds = load_dataset("imagefolder", data_dir="./my_images/")
print(ds)
print("类别：", ds["train"].features["label"].names)

preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def process_batch(batch):
    batch["pixel_values"] = [preprocess(img.convert("RGB")) for img in batch["image"]]
    return batch

ds = ds.map(process_batch, batched=True, batch_size=128, num_proc=4)
ds.set_format(type="torch", columns=["pixel_values", "label"])

train_loader = DataLoader(ds["train"], batch_size=32, shuffle=True, num_workers=4)
val_loader = DataLoader(ds["validation"], batch_size=64, shuffle=False, num_workers=4)
```

**第五步：缓存目录管理 & 离线使用**

```python
# 查看 & 自定义缓存目录（默认 ~/.cache/huggingface/datasets）
import os
print("缓存目录：", os.environ.get("HF_DATASETS_CACHE", "~/.cache/huggingface/datasets"))
os.environ["HF_DATASETS_CACHE"] = "/mnt/big_disk/hf_cache"   # 换到你挂载的大盘

# 离线环境：把第一次加载需要的文件提前放好，然后开启 OFFLINE 模式
os.environ["HF_DATASETS_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

# 清理缓存（偶尔跑一次）
# from datasets import config
# config.HF_DATASETS_CACHE.rmdir() if False else None
```

## 常见误区

**误区 1：把数据全读到 Python list 里再处理 → 大一点就 OOM，速度还慢**

解释：Datasets 的核心设计就是"不落内存、按需从 Arrow 文件取"。你一旦把 `ds["text"]`（整列拿出来）或 `list(ds)` 转成纯 Python 结构，就放弃了这个优势。尽量保持数据在 Dataset 里流动，用 `map` 做处理。

**误区 2：`map` 里没开 batched=True + num_proc → 单核单条处理，比开了之后慢 10~50 倍**

解释：几乎所有可向量化的函数（tokenizer、torchvision、pandas、numpy）对 "1000 条一组"的批处理都比对 "1000 条逐条" 快得多。再加上 `num_proc=4/8/16` 并行，能把 CPU 跑满。

**误区 3：没保存 map 结果，每次训练都重新 tokenize → 浪费大量时间**

解释：`ds.map(...)` 本身也会自动缓存（用输入参数 hash 当 key），但显式 `tokenized.save_to_disk("./processed")` 能保证你下次启动脚本、换机器时仍能直接用。推荐在磁盘空间充足时把每个预处理阶段都存一份。

**误区 4：把 model 的 `.to(device)` 放在 map 函数里 → 试图把 GPU 对象塞进 Arrow 列里，直接报错**

解释：`map` 运行在 CPU 多进程里，它只能接受能被 Arrow 序列化的东西（string / int / float / numpy array / PIL.Image）。模型推理、GPU 搬移应当在 DataLoader 迭代之后再进行。正确做法是：预处理只产出 `pixel_values`（tensor）和 `label`，把 `.to(device)` 放在训练循环里。

**误区 5：图像文件夹命名不规范 → label 对应不上或漏数据**

解释：`imagefolder` 要求每个类别一个目录（目录名就是类别名）。如果你的文件名里还带了 metadata，改用 `csv` + 本地路径更灵活。同样的思路也用于音频（`audiofolder`）和文本（`text` loader）。

**误区 6：用 `load_dataset` 加载本地大文件时指定 split="train" 却切不出 validation**

解释：本地 CSV/JSON 默认会把整个文件当成一个 split。你应当：(a) 先整体加载，再 `.train_test_split(test_size=0.1, seed=42)` 手动切分；(b) 在磁盘上把数据拆成 train.csv / validation.csv / test.csv 再一起 load。

**误区 7：第一次跑 Hub 数据集很慢、甚至失败 → 网络问题或缓存配置不对**

解释：国内网络连 hf.co 经常不稳。解决：(a) 挂代理或配置 `HF_ENDPOINT=https://hf-mirror.com` 镜像；(b) 先用 `load_dataset` 在一台有网络的机器上跑一次并 `save_to_disk`，之后只在离线机器上用 `load_from_disk`；(c) 设 `HF_DATASETS_CACHE` 到大容量磁盘，避免默认 home 目录被塞爆。

**误区 8：没做 set_format 直接把 Dataset 丢进 DataLoader → 每批是 dict of list 而不是 tensor，模型 forward 报错**

解释：`dataset.set_format(type="torch", columns=["pixel_values", "label"])` 让 DataLoader 的 `__getitem__` 返回 torch tensor 而不是 Python 原生类型。一定要在训练前设置。
