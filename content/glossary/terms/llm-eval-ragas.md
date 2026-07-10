---
title: LLM评估-RAGAS
slug: llm-eval-ragas
---

# LLM评估-RAGAS

**RAGAS（RAG Assessment）** 是由 Exploding Gradients 团队开发的一个开源框架，专门用于 **自动化、无参考地评估 RAG（检索增强生成）系统** 的端到端质量。它的核心理念是「用强 LLM（如 GPT-4o、Claude 3、Llama-3-70B）当裁判，代替人工标注 Golden 参考答案，从多个维度给 RAG 流水线打分」。RAGAS 发布于 2023 年，目前已成为 LLM RAG 项目中 **事实性、检索质量、答案质量** 评估的事实标准工具。

## 为什么需要 RAGAS？

传统评估方法的窘境：

```
传统方法 1：人工评分
    ↓ 问题：
    • 500 条 RAG Case × 2 个标注员 → 一周工作量，¥ 5,000+
    • 人累了就乱打，评分一致性（Inter-annotator agreement）< 70%
    • 每次 Prompt 改动重新评 → 成本爆炸
    • 无法纳入 CI 自动回归测试

传统方法 2：BLEU / ROUGE / BERTScore
    ↓ 问题：
    • 只看词汇重叠，不看语义正确性
    • 「A 公司 2024 年营收 1.2 亿」 vs 「A 公司营收约人民币一亿两千万元」
      → 意思完全一致，BLEU 分数却极低
    • 更关键：完全无法检测 RAG 的「幻觉」（回答很流畅，内容和文档不一样）

→ RAGAS 的解决方案：用 LLM-as-Judge，从 RAG 系统独有的 6 个维度
  做「结构化、语义级、无参考」的自动化评测。
```

## RAGAS 的六大核心指标（必须牢记）

一个 RAG 系统 = **检索模块（Retriever）+ 生成模块（Generator）**。RAGAS 对应地设计了三大类、六大指标：

```
┌──────────────────────────────────────────────────────────┐
│          RAGAS 指标全景（v0.2.x 版本）                      │
├─────────────────────┬──────────────────────┬───────────────┤
│     检索质量指标     │      生成质量指标     │ 端到端指标（新）│
├─────────────────────┼──────────────────────┼───────────────┤
│ 1. Context Precision│ 3. Faithfulness     │ 6. Answer     │
│    上下文精确度     │    忠实度 / 保真度   │    Relevancy  │
│ 2. Context Recall   │ 4. Answer Correctness│    回答相关性  │
│    上下文召回率     │ 5. Context Relevancy│               │
│  + Context Entity   │    上下文相关性     │               │
│    Recall           │                      │               │
└─────────────────────┴──────────────────────┴───────────────┘
```

下面逐个详解（每个指标都要记住「它衡量什么、怎么算、分数高好还是低好」）。

---

### 指标 1：Context Precision（上下文精确度）

**衡量什么**：**检索到的上下文 chunk 是不是「每一条都真的有用」，没有混进一大堆没用的文档**。

> 举例子：用户问「这台打印机怎么换墨粉？」，RAG 检索到 10 条上下文：
>
> - 第 1 条：墨粉更换步骤说明（相关）✅
> - 第 2 条：墨粉型号购买链接（半相关）
> - 第 3-10 条：维修电话、驱动下载、保修政策…（完全不相关）❌
>
> 虽然第 1 条回答了问题，但混进了 9 条噪声 → 上下文精确度分数低（因为 LLM 可能被后面噪声误导）。

**怎么算（RAGAS 内部 prompt 逻辑）**：
对最终回答中出现的每个「关键陈述（Statement）」，让 LLM 判断：

1. 这条陈述是不是真的在回答用户问题？
2. 如果是，回答这条陈述所需要的证据是不是在检索到的 top-k 上下文里？
3. 最终按「证据在 top-k 的出现位置」做 MRR（平均倒数排名）加权：证据出现在第 1 位权重 1、第 2 位权重 1/2、第 k 位 1/k。

$$
\text{Context Precision} = \frac{1}{\text{#Total Relevant Contexts}}\sum_{i=1}^{k} \frac{\text{Precision@i} \times \text{Relevance@i}}{k}
$$

**分数范围**：[0, 1]，越高越好。生产 RAG 建议：**≥ 0.80**。

---

### 指标 2：Context Recall（上下文召回率）

**衡量什么**：**用户问题的「完整答案所需要的所有信息」，是不是都被检索模块找回来了？**

> 举例子：用户问「这款手机的电池容量、快充规格、重量分别是多少？」，三个点都要答：
>
> - 正确答案：电池 5500mAh，100W 有线 + 50W 无线，重 198g（3 个事实点）
> - RAG 只检索到了电池和快充的文档 → 重量那一页没召回 → Context Recall = 2/3 ≈ 0.66

**怎么算**：

- 拿最终「参考答案（如有）」或「模型生成的回答」和检索上下文对比
- 先抽出「回答里所有原子事实 F = {f₁, f₂, …, fₙ}」
- 逐个判断每个 fᵢ 是否能从检索到的上下文 chunk 中推导出来
- 可推导 = 召回；否则 = 漏召回

$$
\text{Context Recall} = \frac{|\{f_i \;|\; f_i \text{ 可从上下文中推导}\}|}{|\text{Total facts in ground truth answer}|}
$$

> 这是 RAGAS 里**最敏感、最能检测 RAG 检索模块缺陷**的指标——召回率低，再强的 LLM 也做不出好回答（巧妇难为无米之炊）。

**分数范围**：[0, 1]，越高越好。生产建议 **≥ 0.78**。

**配套进阶指标：Context Entity Recall（上下文实体召回率）**
专门针对命名实体（人名/金额/日期/型号）：Context Recall 衡量「事实级召回」，Context Entity Recall 衡量「具体数字、名称等关键实体」一个都不能少。业务价值极高：如果金融/法律 RAG 漏了关键金额/条文号 → 直接出事。

---

### 指标 3：Faithfulness（忠实度 / 保真度 / 反幻觉指标）⭐ 最重要

**衡量什么**：**最终回答里的每一句话，是不是都严格有检索上下文作为证据支撑？——没有证据的 = 幻觉（Hallucination）。**

> 这是 RAGAS 最核心、最有价值的指标，没有之一。

> 反例（幻觉，Faithfulness 低）：
> 用户问：「这款产品保修期多长？」
> RAG 上下文只有：「享受三包政策，7 天无理由退货」→ 完全没提保修年限
> 但 LLM 回答说：「标准保修期 2 年，可延保到 5 年……」
> → 所有关于保修期年限的话，上下文找不到 → 严重幻觉 → Faithfulness 低

**怎么算（RAGAS 算法步骤）**：

1. **陈述拆分（Statement Decomposition）**：把模型回答拆成若干原子陈述，每条只表达一个事实：

   ```
   原回答：「该产品于 2024 年 3 月发布，搭载骁龙 8 Gen 3，售价 3999 元起。」
   拆分为 3 条 statements：
   [S1] 该产品发布时间是 2024 年 3 月
   [S2] 该产品搭载骁龙 8 Gen 3 处理器
   [S3] 该产品起售价为 3999 元
   ```

2. **陈述-上下文忠实度判定**：对每个 Sᵢ，让 LLM 裁判判断「Sᵢ 是否严格能从检索上下文 chunk 中逻辑推出？」
   - 可以严格推出 → Fᵢ = 1（忠实）
   - 上下文没提、超出范围、部分捏造 → Fᵢ = 0（幻觉）
   - 注意：LLM 裁判只看「检索到的上下文」和「陈述」，**不看外部知识**（哪怕裁判知道答案是对的，只要上下文没提，就必须判 0）

3. **计算 Faithfulness 分数**：

$$
\text{Faithfulness} = \frac{1}{n}\sum_{i=1}^{n} F_i = \frac{\text{# 忠实陈述数}}{\text{# 总陈述数}}
$$

**分数范围**：[0, 1]，越高越好（越不幻觉）。
**生产环境硬性建议线**：

- 内部知识库系统：**≥ 0.80**（80% 话都有依据）
- 金融/法律/医疗等高风险场景：**≥ 0.90**
- 低于 0.6 → 系统绝对不能上线，幻觉爆炸

---

### 指标 4：Answer Correctness（答案正确性）

**衡量什么**：**最终回答和「参考答案（Ground Truth）」对比，事实层面对不对？**

- 不像 Faithfulness 只看「和上下文比」，Answer Correctness 看「和黄金正确答案比」
- 需要人工标注 Ground Truth → 属于「有参考评估」
- 综合衡量：事实准确度（40%）+ 语义相似度（30%）+ 语句结构（30%）

$$
\text{Answer Correctness} = 0.4 \cdot \text{TP/TN/FN 原子事实匹配} + 0.3 \cdot \text{SemSim} + 0.3 \cdot \text{结构匹配}
$$

> 什么时候用？
> 你有一批标注好的「标准问答对」，想测端到端正确率时用。日常 Prompt 迭代回归用 Faithfulness（省人工标注），里程碑版本验收用 Answer Correctness。

---

### 指标 5：Context Relevancy（上下文相关性）

**衡量什么**：**检索到的上下文 chunk 本身是不是「和问题高度相关」的？——不是扯了一大段但重点只有一句话。**

区分 Context Precision：

- Context Precision = 「检索到的上下文里，有多少比例真的被用来回答了？」
- Context Relevancy = 「被检索到的每一段上下文，本身和问题相关的句子密度是多少？」

例子：问题是「怎么申请签证？」，检索到的一整章 5000 字里，只有 100 字是讲申请流程，其余是使馆历史、各国政治 → Context Relevancy 低（噪声太多，浪费 LLM 上下文窗口，还容易被干扰）。

---

### 指标 6：Answer Relevancy（回答相关性 / 答非所问检测）

**衡量什么**：**回答是不是直接针对用户问题？有没有跑题？是不是一句话能说完的说了一大段废话？**

典型低分（答非所问）场景：

- 用户问：「退款政策是怎样的？」
- 系统回答：「我们公司成立于 2015 年，致力于打造优质购物体验，目前有 500 万用户……（扯了一堆无关的）对于退款您可以联系客服。」
  → Answer Relevancy 分数极低

判定方式：LLM 裁判看 (question, answer) 对，提取 answer 中「真正回答问题的关键陈述」占比。

---

## RAGAS 快速上手代码示例（10 分钟跑通）

```bash
# 安装
pip install ragas datasets langchain openai

# 如果用私有部署的 LLM 当 Judge（可选）
# RAGAS 支持 LangChain 的所有 ChatModel 接口
```

```python
import os
os.environ["OPENAI_API_KEY"] = "sk-xxxxxxxxxxxxx"  # 推荐用 GPT-4o-mini，便宜 + 准

from datasets import Dataset
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_recall,
    context_precision,
    context_entity_recall,
)
from ragas.llms import LangchainLLMWrapper
from langchain_openai import ChatOpenAI

# Step 1: 准备测试数据集（你的真实 RAG pipeline 跑出来的结果）
# 每条数据必须包含：question / answer / contexts / ground_truth（可选，某些指标才要）
test_samples = {
    "question": [
        "如何更换 IRB-6700 手腕密封圈？",
        "公司年假可以跨年使用吗？",
        "产品发生质量问题，退货运费谁承担？",
    ],
    "answer": [  # 你的 RAG 生成的回答
        "更换步骤如下：1. 松开 6 颗 M6 螺栓（扭矩 12Nm）...",
        "不可以。年假需在当年 12 月 31 日前休完，未休完作废...",
        "质量问题的退货运费由本公司承担，请保留快递单...",
    ],
    "contexts": [  # 你的 RAG 检索到的上下文 chunk 列表
        ["第 23 页 4.3.2 节：腕轴拆解步骤...", "爆炸图 4-8：密封圈位置"],
        ["员工手册第 8.2 条：年假使用规则...", "考勤 FAQ Q12-Q18"],
        ["售后服务条款 3.1.5：退货运费政策..."],
    ],
    "ground_truth": [  # 可选：人工标注的标准答案（Answer Correctness 等要用）
        "1) 停机断电，2) 拆下 6 颗 M6 螺栓（12Nm），3) 取出旧密封圈更换...",
        "根据员工手册，年假不可跨年使用，需于 12 月 31 日前休完，逾期作废...",
        "质量问题退货运费由公司承担，客户垫付后凭快递单报销...",
    ],
}
dataset = Dataset.from_dict(test_samples)

# Step 2: 配置 Judge LLM（建议用强模型，比如 gpt-4o-mini 或 Claude 3.5 Sonnet）
judge_llm = LangchainLLMWrapper(
    ChatOpenAI(model="gpt-4o-mini", temperature=0)  # temperature=0 很重要！减少裁判随机性
)

# Step 3: 跑评估（一行搞定）
result = evaluate(
    dataset=dataset,
    metrics=[
        faithfulness,          # ⭐最重要：反幻觉
        answer_relevancy,      # 答非所问检测
        context_precision,     # 检索精确度
        context_recall,        # 检索召回率
        context_entity_recall, # 关键实体召回率
    ],
    llm=judge_llm,
    raise_exceptions=False,
)

# Step 4: 看结果
print(result)
# 输出类似：
# {
#   'faithfulness': 0.8763,
#   'answer_relevancy': 0.9421,
#   'context_precision': 0.8124,
#   'context_recall': 0.7788,
#   'context_entity_recall': 0.7900
# }

# Step 5: 看逐行 Case（出错的 case 拿出来人工看，快速定位 RAG 问题）
df = result.to_pandas()
print(df[["question", "faithfulness"]].sort_values(by="faithfulness").head(10))
# 通常 faithfulness 最低的 10 条 case，就能暴露 RAG 系统 80% 的问题
```

## RAGAS 的高阶工程用法（生产必备）

### 1. 接入企业私有 LLM 当 Judge（不调用 OpenAI）

很多企业合规要求，评测数据不能出内网。RAGAS 通过 LangChain 接口支持任意模型。例如接入私有化部署的 Llama-3-70B：

```python
from langchain_community.llms import VLLMOpenAI  # 你自己 vLLM 部署的端点

judge_llm = LangchainLLMWrapper(
    VLLMOpenAI(
        openai_api_key="EMPTY",
        openai_api_base="https://vllm-internal.company.com/v1",
        model_name="Llama-3-70B-Instruct",
        temperature=0.0,
        max_tokens=1024,
    )
)

# 然后把这个 llm 传给 evaluate() 就行
```

**选择 Judge 模型建议**：

| 模型                             | Faithfulness 和人工一致性 | 速度       | 成本（千 token）    | 推荐场景                         |
| -------------------------------- | ------------------------- | ---------- | ------------------- | -------------------------------- |
| GPT-4o / Claude 3.5 Opus         | ~91%                      | 中         | $2.5 / $3           | 里程碑版本验收（最准）           |
| GPT-4o-mini / Claude 3.5 Sonnet  | ~88%                      | 快         | $0.15 / $0.30       | **日常 CI 回归首选（性价比王）** |
| Llama-3-70B / Qwen2-72B 私有部署 | ~83%                      | 取决于 GPU | 自建 GPU 摊销后极低 | 合规内网、数据敏感               |
| Llama-3-8B / 小模型当裁判        | ~70%                      | 极快       | 极低                | 不建议，一致性差到没法用         |

> 经验：**Judge 模型不能比被评测的 RAG Generator 模型弱，否则分数不可信**——就像你不能让小学生评博士论文。

### 2. 自定义 Prompt（适配中文/垂直领域）

RAGAS 原版 Prompt 是英文写的，对中文场景，特别是医疗、法律等垂直领域，需要改写：

```python
from ragas.metrics import Faithfulness
from ragas.prompt import PydanticPrompt

# 继承并重写 Faithfulness 的判定 prompt
class ChineseFaithfulnessPrompt(PydanticPrompt):
    instruction = """你是一位专业的中文 RAG 系统忠实度评测员。
    给定以下【参考上下文】和【模型回答】，请将回答拆分成若干独立陈述。
    对每条陈述严格判断：是否可以从参考上下文中严格逻辑推出？
    注意：
    1. 即使你外部知识知道是对的，但上下文没提到 → 判为不忠实
    2. 数字、日期、人名、条文号不匹配 → 判不忠实
    3. 上下文模糊、无法确认的 → 宁可不忠实
    输出严格 JSON 格式：{"statements": [...], "verdicts": [1/0, ...]}
    """
    # ... input_models / output_models 定义

faithfulness_zh = Faithfulness(
    llm=judge_llm,
    faithfulness_prompt=ChineseFaithfulnessPrompt(),
)
```

### 3. 接入 CI/CD 做自动回归测试

把 RAGAS 评估脚本挂到 GitHub Actions / GitLab CI，每次改 Prompt、改 RAG 策略就自动跑：

```yaml
# .github/workflows/rag-eval.yml
name: RAG E2E Evaluation with RAGAS

on:
  pull_request: # 每个 PR 都跑
    branches: [main]
  push:
    branches: [main]

jobs:
  eval-rag:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r requirements.txt ragas datasets

      - name: Run RAG Pipeline on Golden Dataset
        run: python scripts/run_rag_golden.py --output=results/testset_predictions.parquet

      - name: Run RAGAS Evaluation
        env:
          JUDGE_API_KEY: ${{ secrets.JUDGE_MODEL_KEY }}
        run: python scripts/ragas_eval.py --predictions=results/testset_predictions.parquet --output=ragas_report.json

      - name: Enforce Quality Gates（质量门禁！）
        run: |
          python scripts/check_gates.py --report=ragas_report.json \
            --faithfulness-min=0.82 \
            --context-recall-min=0.76 \
            --answer-relevancy-min=0.88
          # 任何一项低于阈值 → 直接让 PR/Merge 失败，不让降质代码进主干
```

这套质量门禁，是目前大厂 RAG 团队从「研发 Demo」走到「稳定生产」的标准实践。

### 4. 分桶分析找到改进方向

整体分数不够，怎么知道改哪里？分桶分析：

```python
# 把评测集按特征分桶，看哪类场景差：
df = eval_results.to_pandas()

# 分桶 1：按问题类型（分类/数字问答/多跳推理/列表）
print(df.groupby("question_type")[["faithfulness", "context_recall"]].mean())
# → 假设发现「多跳推理」faithfulness = 0.58，远低于 0.88 平均
# → 改进方向：加 Query2Query 改写、分步骤子问题检索（子问题分解）

# 分桶 2：按检索 chunk 数量
print(df.groupby(pd.cut(df["retrieved_chunks_count"], bins=[0,3,5,10,100]))[["faithfulness"]].mean())
# → chunks=10+ 时 faithfulness 跌到 0.65
# → 改进方向：加 Reranker（Cross-Encoder）精排 Top-5，减少噪声

# 分桶 3：按难度标注（easy/medium/hard）
print(df.groupby("difficulty")[["faithfulness", "answer_correctness"]].mean())
# → hard 桶只有 0.56 → 针对性加难例训练/扩充知识库
```

## RAGAS 常见陷阱（踩过的血泪）

### 陷阱 1：「Judge 知道」=「上下文有」=「错判不幻觉」

GPT-4o 当裁判时，有些知识它训练时见过（比如常识、历史事件），即使 RAG 上下文里完全没有，它也可能不小心判「忠实」→ **Faithfulness 被虚高 5-10%**。

**解决**：RAGAS 已经内置了一个「封闭书测试（Closed-book setting）」的机制，在评测 prompt 里强制写：

> 「你的判断必须**完全且仅仅**基于提供的【参考上下文】。如果参考上下文没有提到，请一律判定为不忠实，即使你知道答案是事实正确的。」

并跑校准集（明确控制有上下文/没上下文）验证 Judge 行为。

### 陷阱 2：重复评测一致性差（同一条 Case 跑两次分数不一样）

LLM 有随机性，即使 temperature=0 也不能保证 100% 相同。

**解决**：

1. 每次评测跑 3 遍，取平均（成本 ×3，但分数稳定）
2. 高风险场景采用「多 Judge 投票」：GPT-4o-mini + Claude 3.5 Sonnet 同时判，2:1 多数裁决
3. 评测 Seed 固定（prompt 里加版本号，输出严格 JSON 减少自由发挥空间）

### 陷阱 3：分数高不代表用户满意

有一次 RAGAS 分数都很高（Faithfulness 0.88）但用户反馈不好 → 一抽查发现：回答都是从上下文抄的没错，但都是套话，**没有真正解决用户问题**（Answer Relevancy 高但结构和简洁度差）。

**解决**：加 2 个补充指标：

- **Aspect Critique（结构化多维度评判）**：从「简洁性、格式规范、可操作性、态度友好」4 个二选一维度打分
- **真实用户反馈对比**：线上抽样 200 条用户点👍/👎的 Case 对比 RAGAS 分数，找到 RAGAS 和真实满意度的相关系数，设定「用户可接受阈值线」

### 陷阱 4：评测数据集构造有偏差

只用「简单短问题」构造评测集 → 分数很好看，但线上长尾/多跳/模糊问题全崩。

**解决**：构造 Golden 评测集时强制要求：

- 30% 长问题/口语化/拼写错误
- 30% 多跳推理（要拼 2+ 个文档才答得出来）
- 20% 数字/日期/实体密集型
- 20% 恶意/诱导性/反事实问题（考验系统拒绝和不幻觉能力）

## 生态与未来展望

1. **RAGAS + LangSmith / Langfuse 深度集成**：Trace 里的 Case → 一键转成 RAGAS Golden 评测集 → 自动回归评分，形成「线上 Trace → 评测 → 迭代」闭环
2. **RAGAS for Multimodal RAG**：2025 年新增图文多模态 Faithfulness / Context Precision 指标，支持 VLM 当裁判检测图像幻觉
3. **RAGAS for LLM Agents**：扩展到 Tool Use / 多步推理场景，新增「Tool Calling Correctness」「Trajectory Faithfulness」指标
4. **RAGAS 蒸馏到小模型**：把 GPT-4o 裁判的打分数据训练成专用 7B「RAGAS-Judge」小模型，10 倍快、100 倍便宜，离线实时评测

RAGAS 本质上把「RAG 系统质量」从一个「主观感觉好」变成了**可量化、可回归、可门禁**的工程指标。它和 LangSmith / Langfuse（Tracing）、BGE Reranker（检索质量）一起构成了现代 RAG 工程化落地的「三件套」。

如果你现在还在靠「我觉得 RAG 效果还行」决定上线——赶快把 RAGAS 跑起来，它会让你对自己系统的真实质量感到惊讶（通常是惊吓，然后才是稳步提升）。

相关术语：[RAG](/glossary/rag)、[重排序器](/glossary/reranker)、[Agent评估与追踪](/glossary/agent-evals-tracing)、[思维链](/glossary/chain-of-thought)、[长上下文窗口](/glossary/long-context-window)
