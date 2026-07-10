---
title: LLM 评估框架 Ragas 与 Promptfoo 实战
category: nlp
summary: RAG 系统和 LLM 应用效果好坏不能靠感觉。Ragas 提供忠实度/相关度/正确率等无参考指标，Promptfoo 做 Prompt 批量 A/B 测试，两者结合建立可量化的 LLM 应用评估流水线。
difficulty: intermediate
excerpt: RAG 系统和 LLM 应用效果好坏不能靠感觉。Ragas 提供忠实度/相关度/正确率等无参考指标，Promptfoo 做 Prompt 批量 A/B 测试，两者结合建立可量化的 LLM 应用评估流水线。
relatedTerms:
  - transformer
  - rag
  - reranker
  - chain-of-thought
  - speech-asr
relatedTools:
  - huggingface-transformers
  - langchain
  - numpy
  - ollama
relatedNodes:
  - nlp-rnn
  - llm-inference
  - llm-finetune
---

## 为什么你要学它

做 RAG 系统最折磨人的一件事是：你改了 chunk 大小、换了 Embedding 模型、加了 Reranker，然后找了 10 个问题手动测，感觉「效果好像好了一点」——但这到底是真的提升，还是你挑的这 10 个问题刚好比较简单？下一次改代码，效果会不会又掉回去？

没有量化评估的 LLM 应用开发，就是盲人摸象：每次改代码只能凭主观感受，迭代效率极低，而且根本没法和别人的方案对比。

工业界的标准做法是建立两层评估体系：

1. **离线评估（每次提交代码前自动跑）**：用标准评测集跑，输出 5~10 个量化指标，指标劣化就禁止合并
2. **在线评估（真实用户流量上跑）**：A/B 测试 + 用户反馈，验证离线提升能不能转化成真实业务收益

本文讲的两个工具就是离线评估的瑞士军刀：

- **Ragas**：专为 RAG 系统设计的无参考评估框架。不需要人工标注参考答案，就能自动评估「回答是否忠实于上下文」「检索的文档是否和问题相关」「答案是否完整」等核心指标
- **Promptfoo**：Prompt 工程的单元测试工具。同一份评测集，批量跑 10 种不同的 Prompt 模板 + 3 种模型，自动对比分数，找出性价比最高的组合

两者搭配使用：Ragas 测 RAG 端到端效果，Promptfoo 优化 Prompt 和模型选型。一个月下来，你的 RAG 系统效果提升多少、每一次改动贡献了多少百分点，全都有数据可查。

## 一句话概览

- **Ragas 四大核心指标**：Faithfulness（忠实度，回答是否只基于上下文）、Answer Relevancy（答案相关度）、Context Precision（检索上下文精准度）、Context Recall（检索上下文召回率）
- **无参考评估的原理**：用一个更强的 Judge LLM 自动打分，替代人工标注。指标设计合理时，Judge 与人类一致性可达 85%+
- **Promptfoo 的使用流程**：写 `promptfooconfig.yaml` 定义「测试集 + 候选 Prompt + 候选模型 + 断言」，一条命令批量跑对比，输出 HTML 报告
- **最佳实践**：建立 100~200 条黄金标准评测集，每次代码变更必跑；评测集每季度更新一次，加入真实用户的 Badcase

## 核心拆解

### 🔑 Ragas 四大指标详解

Ragas 每个指标都解决一个具体问题：

**1. Faithfulness（忠实度，越高越好）**

回答的每一句话，是否都能在检索到的上下文中找到证据？防止模型「幻觉」——上下文里没提的事情，模型自己编出来。

判定逻辑：

- 把最终答案拆成若干个「主张/断言（claims）」
- 对每个断言，问 Judge LLM：「这个主张能不能从给定上下文中直接推断出来？」
- Faithfulness = 得到支持的主张数 / 总主张数

举个例子：

- 上下文：「张三 2020 年加入公司，现任产品经理，负责支付线业务」
- 回答：「张三是产品经理，负责支付线，2021 年晋升为高级产品经理」
- 拆成 3 个主张：① 产品经理 ✅ ② 负责支付线 ✅ ③ 2021 年晋升高级 ❌
- Faithfulness = 2/3 ≈ 0.67

这个指标是 RAG 里最核心的——如果忠实度低，说明你的模型在胡说八道，其他指标再好也没用。

**2. Answer Relevancy（答案相关度，越高越好）**

生成的答案是否直接回答了用户的问题？有没有答非所问、说一堆不相关的废话？

判定逻辑：用 Judge LLM 根据用户问题和生成答案，判断「多大程度上直接回答了问题」。和上下文是否正确无关——哪怕回答完全是编的，只要刚好答在点子上，Relevancy 也高。所以它通常和 Faithfulness 配合看。

**3. Context Precision（检索精准度，越高越好）**

检索到的 Top-k 文档中，排在前面的是不是真的更相关？这个指标衡量检索排序质量。如果最相关的文档总在第 5、6 位，而前几位都是不相关的，Context Precision 就低。

计算思路：每篇上下文文档先判断「是否包含能回答问题的信息」，然后按位置加权（第 1 位权重最大），算一个精确率@k。

**4. Context Recall（检索召回率，越高越好）**

如果有参考答案（ground truth answer），这个指标问：参考答案中的所有要点，是否都能在检索到的上下文中找到来源？

这个指标需要标注参考答案，和 Faithfulness 搭配看：

- Context Recall 低：检索模块没找全信息，根子在 Embedding/分段/检索策略
- Faithfulness 低：找到了信息但模型瞎编，根子在 Prompt 或模型选型

四个指标的关系：

```
用户问题 → 检索模块 → Context → 生成模块 → Answer
           ↑              ↑             ↑
     Context Precision Context Recall  Faithfulness
                               ↓
                        Answer Relevancy
```

### 🔑 Ragas 的评测集格式和 Judge LLM 选型

Ragas 评测集是一个 Dataset，每条样本包含四个字段：

```python
eval_sample = {
    "question": "用户的原始问题",
    "answer": "你的 RAG 系统生成的回答",
    "contexts": ["检索到的文档片段 1", "检索到的文档片段 2", "..."],
    "ground_truth": "（可选）人工标注的参考答案",  # 需要它才能算 Context Recall
}
```

前三个字段可以由「你的 RAG 系统跑一遍问题集」自动生成；只有 `ground_truth` 需要人工标注（或者用 GPT-4 生成 + 人工校验）。

**Judge LLM 选型建议**：

- 企业预算充足：用 GPT-4o / Claude 3.5 Sonnet 当 Judge，稳定性高、与人类一致性好
- 成本敏感场景：用本地部署的 Qwen2.5-72B-Instruct 或 Llama 3 70B，效果略差但成本低 90%
- **绝对不要**用和被测 RAG 系统同一个模型当 Judge——自己给自己打分，等于让考生当阅卷老师，结果毫无意义

Ragas 允许自定义 Judge 模型：

```python
from langchain_openai import ChatOpenAI
from ragas.llms import LangchainLLMWrapper

# 用自定义模型当 Judge
judge_llm = LangchainLLMWrapper(
    ChatOpenAI(model="gpt-4o", temperature=0)
)

# （可选）用另一个轻量模型生成测试时的 Embedding 相似度辅助指标
from langchain_openai import OpenAIEmbeddings
from ragas.embeddings import LangchainEmbeddingsWrapper
embeddings = LangchainEmbeddingsWrapper(
    OpenAIEmbeddings(model="text-embedding-3-small")
)
```

### 🔑 Promptfoo：Prompt 工程的批量对比神器

Promptfoo 解决的痛点是：「我有 3 个 Prompt 版本、2 个候选模型、50 道测试题，一个个手动测要疯了，怎么自动化对比？」

它的核心是一份 YAML 配置文件，定义三件事：

```yaml
# promptfooconfig.yaml —— Promptfoo 配置文件

# 1. 要对比的模型/Provider 列表
providers:
  - id: openai:chat:gpt-4o-mini
    label: GPT-4o-mini ($0.15 / 1M tokens)
  - id: openai:chat:gpt-4o
    label: GPT-4o ($5 / 1M tokens)
  - id: anthropic:messages:claude-3-haiku-20240307
    label: Claude-3-Haiku ($0.25 / 1M tokens)

# 2. 要对比的 Prompt 模板列表（可以多个，会和上面 providers 做笛卡尔积）
prompts:
  - id: v1_simple
    label: 简洁版 Prompt
    text: |
      你是一个客服助手。根据以下上下文回答用户问题：
      上下文：{{context}}
      用户问题：{{question}}
      如果上下文里没提到，直接说"我不知道"。

  - id: v2_structured
    label: 结构化思考 Prompt（先列证据再答）
    text: |
      你是一个严谨的客服助手。请按步骤回答：
      Step 1：从上下文中提取和问题相关的原文证据，用编号列出。
      Step 2：基于证据回答用户问题，不要编内容。

      上下文：
      {{context}}

      用户问题：{{question}}

      输出格式（严格 JSON）：
      {"evidence": ["证据1", "证据2", ...], "answer": "最终回答"}

# 3. 测试集 + 断言（判断输出是否合格）
tests:
  - vars:
      question: "退货政策是什么？"
      context: "本店支持签收后 7 天无理由退货，商品需未开封。"
    assert:
      # 断言1：答案里必须包含"7 天"
      - type: contains
        value: "7 天"
      # 断言2：用 LLM 判断答案是否和上下文一致
      - type: llm-rubric
        value: "回答必须只基于给定上下文，不能有超出上下文的信息"
        threshold: 0.8
      # 断言3：答案长度不超过 200 字符
      - type: javascript
        value: output.length <= 200

  - vars:
      question: "支持哪些支付方式？"
      context: "我们支持支付宝、微信支付，暂不支持信用卡。"
    assert:
      - type: contains-any
        value: ["支付宝", "微信"]
      - type: not-contains
        value: "信用卡"
```

然后一条命令：`promptfoo eval -c promptfooconfig.yaml -o report.html`，就会自动跑所有「模型 × Prompt × 测试题」组合，计算每个组合的通过率、平均延迟、平均费用，最后生成可交互的 HTML 对比报告。

Promptfoo 内置了 15+ 种断言类型，常用的：

| 断言类型       | 作用                              | 示例                        |
| -------------- | --------------------------------- | --------------------------- |
| `contains`     | 输出包含指定字符串                | 必须包含「7 天」            |
| `not-contains` | 输出不包含                        | 不得包含「我不知道」        |
| `llm-rubric`   | 用 Judge LLM 按自定义评分标准打分 | 判断回答是否只基于上下文    |
| `levenshtein`  | 编辑距离小于阈值                  | 和参考答案差不超过 5 个字符 |
| `perplexity`   | 困惑度低于阈值（用可选模型）      | 防止输出乱码                |
| `json-schema`  | 输出符合指定 JSON Schema          | 确保结构化输出字段齐全      |
| `javascript`   | 写任意 JS 表达式                  | 自定义复杂逻辑              |

## 完整跑通方案：从零搭建 RAG 评估流水线

### 第一步：环境安装

```bash
pip install ragas datasets langchain langchain-openai python-dotenv

# Promptfoo（Node.js 工具，先装 Node 再全局装）
npm install -g promptfoo
```

### 第二步：准备评测集 + 跑 Ragas

```python
import os
import json
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper

# ============ 1. 配置 LLM ============
judge_llm = LangchainLLMWrapper(
    ChatOpenAI(model="gpt-4o-mini", temperature=0)
)
embedding_model = LangchainEmbeddingsWrapper(
    OpenAIEmbeddings(model="text-embedding-3-small")
)

# ============ 2. 构造 RAG 评测集 ============
# 真实场景：从用户查询日志中抽 200 条，人工标注 ground_truth
# 这里用 5 条 Demo 数据
rag_eval_samples = [
    {
        "question": "公司年假有多少天？",
        "contexts": [
            "正式员工享受带薪年假：入职满 1 年 5 天，满 3 年 10 天，满 10 年 15 天。",
            "法定节假日按国家规定执行，另外公司每年有 5 天带薪病假。",
        ],
        "answer": "入职满 1 年 5 天，满 3 年 10 天，满 10 年 15 天。",
        "ground_truth": "正式员工入职满 1 年有 5 天年假，满 3 年 10 天，满 10 年 15 天。",
    },
    {
        "question": "支持用哪些付款方式？",
        "contexts": [
            "目前公司官网支持支付宝、微信支付、银联借记卡三种付款方式。",
            "如需对公转账，请联系销售获取银行账户信息。",
        ],
        "answer": "支持支付宝、微信支付、银联借记卡，也可以联系销售做对公转账。",
        "ground_truth": "支持支付宝、微信支付、银联借记卡，对公转账需联系销售。",
    },
    {
        "question": "产品保修期多久？",
        "contexts": [
            "本产品自签收之日起，非人为损坏提供 2 年免费保修服务。",
            "保修期间如需寄修，寄回运费由用户承担。",
        ],
        "answer": "2 年免费保修，运费由用户承担。",
        "ground_truth": "2 年免费保修（非人为损坏），寄修寄回运费用户承担。",
    },
    {
        "question": "公司总部在哪？",
        "contexts": [
            "客服电话：400-123-4567，工作时间周一至周五 9:00-18:00。",
            "公司成立于 2015 年，现有员工 500 余人。",
        ],
        "answer": "我不知道，建议拨打客服电话 400-123-4567 咨询。",
        "ground_truth": "上下文未提供总部地址信息，用户应拨打客服电话 400-123-4567 咨询。",
    },
    {
        "question": "退款多久到账？",
        "contexts": [
            "退货审核通过后，退款将在 3-5 个工作日内按原支付路径退回。",
            "如超过 7 个工作日仍未到账，请联系客服查询。",
        ],
        "answer": "退货审核通过后 1-2 个工作日原路退回。",  # 故意写错数字（幻觉）
        "ground_truth": "审核通过后 3-5 个工作日按原支付方式退回，超过 7 天请联系客服。",
    },
]

# 转成 HuggingFace Dataset 格式（Ragas 要求）
dataset = Dataset.from_list(rag_eval_samples)

# ============ 3. 跑评估 ============
result = evaluate(
    dataset,
    metrics=[
        faithfulness,
        answer_relevancy,
        context_precision,
        context_recall,
    ],
    llm=judge_llm,
    embeddings=embedding_model,
    raise_exceptions=False,
)

# ============ 4. 输出结果 ============
print("=" * 60)
print("RAG 系统评估总览")
print("=" * 60)
metrics_df = result.to_pandas()
for metric_name in ["faithfulness", "answer_relevancy", "context_precision", "context_recall"]:
    if metric_name in result:
        score = result[metric_name]
        print(f"{metric_name:<20s}: {score:.3f}")

print("\n" + "=" * 60)
print("逐条详情（挑出 Faithfulness 低的重点看）")
print("=" * 60)
for _, row in metrics_df.sort_values("faithfulness").iterrows():
    print(f"\n问题: {row['question']}")
    print(f"忠实度: {row['faithfulness']:.2f} | 答案相关度: {row['answer_relevancy']:.2f}")
    print(f"回答: {row['answer']}")
    print(f"检索上下文 1: {row['contexts'][0][:80]}...")

# 保存结果（方便后续版本对比）
with open("eval_results.json", "w", encoding="utf-8") as f:
    json.dump({k: (float(v) if isinstance(v, (int, float)) else v)
               for k, v in result.items() if k != "ragas_score"},
              f, ensure_ascii=False, indent=2)
```

第 5 条样本 Faithfulness 应该很低（写了「1-2 个工作日」但上下文写的是「3-5 个工作日」），这会在评估报告中被自动揪出来，一眼看到。

### 第三步：用 Promptfoo 对比不同 Prompt 的效果

写 `promptfooconfig.yaml`：

```yaml
description: "客服 RAG 系统 Prompt 对比测试"

providers:
  - id: openai:chat:gpt-4o-mini
    label: GPT-4o-mini
    config:
      temperature: 0

prompts:
  - id: prompt_v1_basic
    label: V1-基础版（直接问答）
    text: |
      你是公司客服助手。根据下方「上下文」回答用户的「问题」。
      严格遵守：
      1. 只能基于上下文内容回答，上下文没有的就说"暂时没有相关信息"
      2. 回答要简洁，不超过 100 字

      上下文：
      {{context}}

      问题：{{question}}

  - id: prompt_v2_cot
    label: V2-COT版（先列证据再答）
    text: |
      你是公司客服助手。严格按两步走：
      【步骤 1】逐条列出上下文中与问题相关的原文片段，标为 ①②③...
      【步骤 2】基于这些原文片段，给出简洁的最终回答（不超过 100 字）
      注意：如果没有相关原文，步骤1写"无相关内容"，步骤2写"暂时没有相关信息"

      上下文：
      {{context}}

      问题：{{question}}

# 测试集 10 条（实际用 100+ 条）
tests:
  - vars:
      question: "年假有多少天？"
      context: "正式员工年假：入职满1年5天、满3年10天、满10年15天。另有5天带薪病假。"
    assert:
      - type: llm-rubric
        value: "答案必须准确说明年假梯度（5/10/15天），不得编造其他数字"
        threshold: 0.75
      - type: javascript
        value: output.length <= 150

  - vars:
      question: "保修多久？"
      context: "非人为损坏 2 年免费保修。寄修寄回运费由用户承担。客服电话 400-123-4567。"
    assert:
      - type: contains
        value: "2 年"
      - type: llm-rubric
        value: "答案必须包含 2 年保修，且必须说明非人为损坏的条件"
        threshold: 0.75

  - vars:
      question: "CEO 叫什么名字？"
      context: "公司成立于 2015 年，员工 500 人，产品包括智能音箱和路由器。"
    assert:
      - type: llm-rubric
        value: "上下文没提 CEO，答案必须拒绝回答/说没有，不能编造任何人名"
        threshold: 0.9

  # ... 再加 7~190 条测试
```

运行评估 + 生成报告：

```bash
# 跑所有组合
promptfoo eval -c promptfooconfig.yaml \
  --output report.html \
  --share  # 可选：生成一个在线分享链接

# 如果之前有基线版本，可以和最新版本对比
promptfoo compare \
  ./reports/baseline-2024-01-15.json \
  ./reports/new-2024-02-01.json \
  -o diff-report.html
```

打开生成的 HTML 报告，可以看到：

- 每个 Prompt × 模型组合的总分、平均费用、平均延迟
- 每题的详细对比：哪个组合通过了、哪个失败了、输出内容是什么
- 费用对比表格：比如 V2 Prompt 虽然通过率高了 3%，但平均每问多用了 200 tokens，要评估是否值得

### 第四步：把评估接入 CI，作为质量门禁

```yaml
# .github/workflows/rag-eval.yaml
name: RAG Evaluation Gate

on:
  pull_request:
    paths:
      - "src/rag/**" # RAG 代码变更
      - "prompts/**" # Prompt 变更
      - "eval/**" # 评测集变更

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install deps
        run: pip install -r eval_requirements.txt

      - name: Run Ragas evaluation
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          python eval/run_ragas.py \
            --dataset eval/rag_eval_set_v3.json \
            --output eval_output.json

      - name: Compare vs baseline
        run: |
          python eval/compare_metrics.py \
            --new eval_output.json \
            --baseline eval/baseline_v3.json \
            --thresholds '{"faithfulness": -0.03, "context_recall": -0.05}'
          # 如果新版本 faithful 比基线下降超过 3%，脚本 exit(1)，CI 失败
```

这样，任何 PR 只要改了 RAG 相关代码，就会自动跑评估；指标劣化太多，PR 会被自动挡住，不能合并。

## 常见误区

**误区 1：Ragas 指标是绝对真理，Faithfulness 0.8 的系统就一定比 0.75 的好。** → 这些指标是「Judge LLM 的主观打分」，不是客观真值。不同 Judge 模型、不同 Judge Prompt，同一条样本打分可能差 0.1~0.2。正确用法：**同一套 Judge、同一套 Prompt 下横向对比版本差异**，不要跨实验拿绝对数值硬比。每个月抽 50 条做人工校验，确保 Judge 与人类一致率维持在 85% 以上。

**误区 2：评测集可以半年不更新，反正题都差不多。** → 评测集和考试题库一样，做久了就「过拟合」。你每次优化 Prompt 都是盯着这 100 道题改，改多了自然分数越来越高，但真实用户效果不一定提升。正确做法：每季度从真实用户查询中抽 20 条新题，替换掉评测集里最老的 20 条，保持评测集始终代表当前用户需求。

**误区 3：Promptfoo 里的断言越多越好，每道题写 5 个断言。** → 断言太严苛会把「实际上正确但表达方式不同」的答案误判为错（False Negative），通过率反而不是越高越好。实践经验：每题 1~2 个刚性断言（contains / not-contains）+ 1 个 llm-rubric 柔性断言就够了。通过率目标设在 85%~90%，剩下 10% 人工看，不要追求 100% 自动化。

**误区 4：为了节省 Judge 成本，用和被测系统同一个模型当评估者。** → 大忌。比如你用 GPT-4o-mini 当 RAG 的生成模型，又用它当 Judge——它会倾向于认为「和自己风格一样的答案才对」，对不同风格的正确答案打低分，而且对自己容易犯的幻觉类型「视而不见」。Judge 模型至少要比被测模型大一个规格，或者用不同厂商的模型交叉验证。

**误区 5：离线评估过了就不用在线 A/B 测了。** → 离线评测集是「理想化条件下的简化问题」，和真实用户场景差得远。真实用户有错别字、有半截问题、有隐含需求、有上下文连续追问——这些在静态评测集里很难覆盖。正确流程：离线指标提升 3% 以上 → 开 5% 流量 A/B 测 3~7 天 → 用户点击率、点赞率、转人工率等线上指标显著变好 → 再全量发布。线上线下都通过了，才算真的有效。
