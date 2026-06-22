---
title: 数据管道与 ETL 实战
category: data-engineering
keywords:
  - etl
  - data pipeline
  - dvc
  - airflow
  - web scraping
  - data quality
  - great expectations
difficulty: intermediate
duration: 1-2周
summary: 训练数据决定模型上限——用工程化手段把脏数据挡在门外，让数据管道可持续运转
takeaways:
  - 能用 Scrapy / requests + BeautifulSoup 从多源采集数据
  - 能用 Great Expectations 定义数据契约并生成质量报告
  - 能用 DVC 管理数据集版本，实现数据可复现
  - 能用 Airflow 编排定时 ETL 任务，构建自动化数据 Pipeline
---

## 为什么你要学它

做 AI 项目，80% 的时间不是在训练模型，而是在处理数据：采集、清洗、标注、验证、版本管理、分发。

如果这些步骤都是手动操作，你会遇到这些问题：
- 训练到一半发现数据标注错了，全量重新标注浪费 3 天
- 不知道「上周训练用的数据是哪个版本」，无法复现实验
- 新增一批数据需要全量重新处理，脚本跑 10 小时却不知道哪步卡住了

**数据管道工程化**是 AI 项目从「学术 demo」走向「生产系统」的关键一步。

## 一句话概览

- **采集**：requests / Scrapy / Wikipedia API / 数据库导出
- **清洗**：Pandas / Great Expectations（声明式数据契约）
- **版本管理**：DVC（Git for Data）
- **编排调度**：Airflow DAG（定时任务编排）

## 核心拆解

### 🔑 DVC：把 Git 的版本管理思想用到数据上

```bash
pip install dvc
dvc init
dvc add data/raw.jsonl          # 跟踪大文件
git add data/raw.jsonl.dvc      # 只把 hash 提交到 Git
git commit -m "add raw data v1"
dvc push                        # 上传到远程存储（S3/GCS/HTTP）
```

当你修改了 `data/raw.jsonl`，运行 `dvc diff` 即可看到哪些文件变了，精确到每个版本的 hash。

### 🔑 Great Expectations：数据契约

传统数据清洗是「写 if-else 判断」，数据契约是「声明期望，让工具验证」：

```python
import great_expectations as ge

df = ge.from_pandas(pandas_df)

# 声明期望（不写 if 判断）
df.expect_column_values_to_not_be_null("title")
df.expect_column_value_lengths_to_be_between("title", 5, 200)
df.expect_column_values_to_be_of_type("categories", "list")

result = df.validate()
print(result["statistics"])  # 多少通过 / 失败
```

数据契约的好处：期望文档化，团队成员都能看懂，测试可重复运行。

### 🔑 Airflow DAG：定时任务编排

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

with DAG(
    "daily_data_pipeline",
    schedule_interval="0 3 * * *",  # 每天凌晨 3 点
    start_date=datetime(2024, 1, 1),
    catchup=False,
) as dag:

    fetch = PythonOperator(
        task_id="fetch_new_articles",
        python_callable=fetch_wikipedia,
    )
    clean = PythonOperator(
        task_id="clean_and_validate",
        python_callable=clean_data,
    )
    update = PythonOperator(
        task_id="update_vector_db",
        python_callable=update_chroma,
    )

    fetch >> clean >> update
```

`fetch >> clean >> update` 定义了执行顺序，DAG 每天定时触发，Airflow Web UI 可以看到每个任务的成功/失败状态和执行时间。

## 实战指南

### Wikipedia API 数据采集

```python
import requests

def fetch_wikipedia_articles(query, limit=100):
    url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query", "format": "json",
        "list": "search", "srsearch": query, "srlimit": limit
    }
    resp = requests.get(url, params=params).json()
    return [r["title"] for r in resp["query"]["search"]]
```

### DVC Pipeline（可复现的处理链）

```yaml
# dvc.yaml
stages:
  preprocess:
    cmd: python preprocess.py
    deps: [data/raw.jsonl]
    outs: [data/clean.jsonl]
  featurize:
    cmd: python featurize.py
    deps: [data/clean.jsonl]
    outs: [data/features.pkl]
  train:
    cmd: python train.py
    deps: [data/features.pkl]
    params: [model.lr, model.epochs]
    outs: [models/model.pkl]
```

运行 `dvc repro` 会自动从第一个需要更新的 stage 开始重跑，基于依赖图智能判断哪些步骤可以跳过。

## 相关资源

- [DVC 官方文档](https://dvc.org/doc/start)
- [Great Expectations 文档](https://docs.greatexpectations.io/)
- [Airflow 官方文档](https://airflow.apache.org/docs/)
- [Scrapy 官方文档](https://docs.scrapy.org/)
