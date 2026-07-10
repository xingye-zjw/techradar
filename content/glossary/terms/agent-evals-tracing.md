---
title: Agent评估与追踪
slug: agent-evals-tracing
---

# Agent评估与追踪

**Agent Evals & Tracing（Agent 系统的质量评估与调用链路追踪）** 是 LLM Agent 工程化落地的关键基础设施。它解决了 Agent 领域的两个「死亡之问」：**①「我的 Agent 今天回答为什么又错了？」②「我的 Agent 整体准确率到底多少，能不能上线？」** 没有 Evals（量化评估体系）和 Tracing（链路追踪能力）的 Agent 就像没有仪表盘和黑匣子的飞机——飞起来全靠祈祷，坠毁了找不到原因。

## 为什么 Agent 需要专门的 Evals & Tracing？

普通 LLM 应用（聊天机器人、RAG 问答）的链路短：

```
用户 Input → Prompt Template → LLM → Output
```

Agent 的链路长度是它的 5~20 倍：

```
用户 Input
   ↓
Router（判断走哪个 Agent / 工具集合）
   ↓
LLM Call 1：分析用户意图，决定调用哪个工具
   ↓
Tool Call 1：查询知识库 RAG（内部是 检索 → Rerank → Prompt 拼接）
   ↓
LLM Call 2：综合 RAG 结果，决定还要查天气 API
   ↓
Tool Call 2：调用 get_weather(location="杭州")（第三方 HTTP API）
   ↓
LLM Call 3：分析天气 + 知识库，决定用思维链计算穿衣推荐
   ↓
LLM Call 4：生成最终回答
   ↓
Output：「杭州今天 23°C 多云，建议你穿薄长袖……」
```

这里面 **4 次 LLM 调用 + 2 次 Tool 调用 + N 次中间推理步骤**，任何一步出错都会导致最终回答错误。没有 Tracing 的话，你只能看到「最终回答是错的」，但不知道：

- 是 LLM Call 2 的 RAG 检索到了错误文档？
- 还是 Tool Call 2 的天气 API 返回了错误数据？
- 还是 LLM Call 3 自己瞎推理胡编了温度？

## Tracing（链路追踪）：构建 Agent 的「黑匣子」

### 理想的 Trace 数据结构

每次 Agent 运行生成一条 Trace，Trace 内是一棵 Span 树（每个 LLM / Tool / Retriever / Chunk 处理都是一个 Span）：

```
Trace: agent-run-2024-07-01-abcdef (2.4s total)
│
├─ Span 1: Agent Entry (Input: "杭州今天穿什么？" | UserID: 123)
│   ├─ Span 2: Router LLM Call (GPT-4o-mini)
│   │   ├─ Input: "判断用户问题路由到哪个工具..."
│   │   ├─ Completion: "route=general_agent, tools=[weather, kb]"
│   │   ├─ Latency: 0.2s, Token: 142→38
│   │   └─ Cost: $0.00012
│   │
│   ├─ Span 3: RAG Retriever
│   │   ├─ Input: "杭州 穿衣指南 春季"
│   │   ├─ Retrieved Docs: [
│   │   │   "doc_234: 杭州春秋季穿衣建议（相似度 0.88）",
│   │   │   "doc_781: 23-27°C 穿衣参考（0.76）",
│   │   │   "...（共 10 条）"]
│   │   └─ Latency: 0.3s
│   │
│   ├─ Span 4: LLM Call (GPT-4o-mini, 综合 RAG + 决定下一步工具)
│   │   ├─ Prompt: 3200 tokens（含 RAG 结果）
│   │   ├─ Completion: Function_Call get_weather(location="杭州")
│   │   ├─ Latency: 0.5s, Token: 3240→86
│   │   └─ Cost: $0.00078
│   │
│   ├─ Span 5: Tool Call: get_weather()
│   │   ├─ Parameters: {"location": "杭州"}
│   │   ├─ HTTP Status: 200
│   │   ├─ Response: {"temp":23, "condition":"多云", "humidity":65}
│   │   └─ Latency: 0.6s
│   │
│   ├─ Span 6: LLM Call (最终回答生成)
│   │   ├─ System Prompt: "你是专业穿搭助手..."
│   │   ├─ Messages: [...（完整对话历史 + RAG Docs + 天气结果）+ 5 步 CoT]
│   │   ├─ Completion: "杭州今天 23°C 多云...建议穿薄长袖 + 开衫..."
│   │   ├─ Latency: 0.7s, Token: 4100→186
│   │   ├─ Cost: $0.00103
│   │   └─ 【Error/Warning】: 检测到回答中「建议带伞」与天气数据矛盾（多云无雨）
│   │
│   └─ Output: 「杭州今天 23°C 多云，建议你穿薄长袖……」
└─ Metrics: Total Cost: $0.00193 | Total Latency: 2.4s | LLM Calls: 4 | Tool Calls: 1
```

### Tracing 的三层价值

| 层级                          | 解决什么问题                                     | 典型使用场景                                                                           |
| ----------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| **L1: Debug 单条失败 Case**   | 「为什么这个问题回答错了？」                     | 定位具体是 Tool 调用参数错了、LLM 幻觉了、还是 RAG 检索错了                            |
| **L2: 监控系统健康**          | 「Agent 今天是不是比昨天慢了？Cost 涨了 3 倍？」 | Dashboard 看 7 日 P99 延迟、token/cost 趋势、Tool 错误率、LLM 异常拒绝率               |
| **L3: 数据集构建 + 回归评测** | 「我改了 Prompt，比旧版本好还是坏？」            | Trace 自动导出成 Case → 人工标注对错 → 攒成 Golden Eval Dataset → 每次变更自动回归评测 |

### 主流开源/商用 Tracing 工具对比

| 工具                        | 厂商                          | 开源                    | 集成生态                                               | 亮点                                                                   |
| --------------------------- | ----------------------------- | ----------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| **LangSmith**               | LangChain（原 LangChain Hub） | ❌ 免费额度 + 付费      | 一等公民：LangChain / LlamaIndex / AutoGen             | UI 最友好，Evals + Tracing + Dataset 三件套集成最好，入门首选          |
| **Langfuse**                | 德国 Langfuse 团队            | ✅ MIT 协议，可私有部署 | LangChain / LlamaIndex / LiteLLM / OpenAI SDK 一行接入 | 开源生态最强，成本低，仪表盘可视化超棒，国内用得多                     |
| **Traceloop / OpenLLMetry** | Traceloop                     | ✅ Apache 2.0           | 基于 OpenTelemetry，和公司现有 Jaeger/Datadog 打通     | DevOps 友好：和传统 APM 共享同一套基础设施                             |
| **Phoenix / Arize**         | Arize AI                      | ✅ 社区版               | 强调 Embedding 可视化 + 漂移检测                       | 数据科学家爱用：能画 embedding umap 聚类找异常数据段                   |
| **Azure PromptFlow**        | Microsoft                     | ⭐ 半开源               | 绑定 Azure ML / Azure OpenAI                           | 企业级合规 + MLflow 集成，大厂 Azure 生态首选                          |
| **Helicone**                | Helicone                      | ✅                      | OpenAI SDK 一行替换 `api_base`                         | 纯 LLM Gateway 级 Tracing：监控 Cost 超精细，支持 Auto Retry + Caching |

> **工程选型建议**：10 人以下小团队 → 直接 LangSmith 免费版；要私有部署、成本可控 → Langfuse；公司已有 OpenTelemetry + Datadog 全家桶 → OpenLLMetry。

### 接入代码示例（Langfuse + OpenAI，5 行代码）

```python
from langfuse.openai import openai  # 一行替换原生 openai
# 自动 Trace：所有聊天、补全、嵌入调用都自动记录

# 显式加自定义 Span
from langfuse.decorators import observe, langfuse_context

@observe()  # 整个函数变 Trace 根 Span
def agent_answer(user_id, question):
    # 自定义元数据
    langfuse_context.update_current_trace(
        user_id=user_id,
        metadata={"scene": "wechat_bot", "version": "agent-v1.2.3"}
    )

    docs = retriever.search(question)  # retriever 也要用 @observe 装饰
    langfuse_context.update_current_observation(
        input=question, output=docs, name="rag_retrieval"
    )

    return openai.chat.completions.create(...)["choices"][0]["message"]["content"]
```

接入完之后，Langfuse UI 上就能看到所有 Trace 的完整链路火焰图，和看 Chrome DevTools Network 一样直观。

## Evals（量化评估体系）：从「感觉 Agent 挺好用」到「Agent 准确率 87.6%」

### Agent Evals 分两大评测范式

| 范式             | 英文                         | 怎么做                                                                           | 成本                   | 代表性指标                                                      | 适用场景            |
| ---------------- | ---------------------------- | -------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------- | ------------------- |
| **离线金测集**   | Offline Golden Dataset Evals | 人工标注好的 500~5000 条问题 + 标准答案 → 每次改代码/Prompt/模型，全量跑一遍对比 | 中（一次标注，反复用） | 端到端任务成功率、工具调用准确率、RAG 精准率、幻觉率            | 上线前、CI 回归测试 |
| **线上真实流量** | Online Production Evals      | 线上真实用户问题 → 人工抽查评分 / 用户点赞反馈 / 行为信号（客服工单是否关闭）    | 低/高（看自动化程度）  | A/B 测试胜出率、用户满意度 CSAT、业务 KPI（问题解决率、复购率） | 上线后、持续优化    |

### 一套成熟的 Agent Evals 指标体系（6 大类，共 20+ 指标）

```
┌─────────────────────────────────────────────────────────────┐
│  1. 端到端任务成功率（End-to-End Task Success Rate）          │
│     任务能否被完整完成？（不是「回答像模像样」而是「结果对」）    │
│     • 单步任务：订单查询是否返回了正确订单号和状态 → 准确率      │
│     • 多步任务：帮用户改收货地址 → 系统 API 真的改成功了吗？     │
│     → 核心指标：Golden Dataset 上 Task Success @ 1 Try        │
├─────────────────────────────────────────────────────────────┤
│  2. 工具调用正确率（Tool / Function Calling Accuracy）        │
│     Agent 选择和调用工具对不对？                                 │
│     • Tool Selection Accuracy: 该用天气 API 时用了没？          │
│     • Parameter Accuracy: 调用 get_weather(location="杭州")     │
│       还是误传了 location="上海"？                             │
│     • JSON Schema 合规率：参数有没有不符合 Schema 的字段？       │
├─────────────────────────────────────────────────────────────┤
│  3. 知识引用正确性（Faithfulness & Attribution）              │
│     Agent 有没有胡说八道？引用对不对？                           │
│     • RAGAS Faithfulness: 回答的每句话都在检索文档中出现过？      │
│     • RAGAS Context Precision: 检索的文档真的相关吗？           │
│     • 引用命中率：回答中给的「来源链接 / 页码」能对应上原文？     │
├─────────────────────────────────────────────────────────────┤
│  4. 幻觉与安全（Hallucination & Safety）                      │
│     • 事实幻觉率：回答中出现不存在的事实（编了一个不存在的条款）  │
│     • 拒绝率：安全边界问题（教我制毒）Agent 有没有正确拒绝？      │
│     • PII 泄露率：回答中有没有暴露不该说的用户隐私？             │
├─────────────────────────────────────────────────────────────┤
│  5. 成本与性能（Cost & Latency Efficiency）                   │
│     准确率够了，但会不会用一次花 2 块钱、等 20 秒？              │
│     • 平均 $ / 次查询（LLM Cost + API 调用费用）               │
│     • P50 / P99 端到端延迟                                    │
│     • LLM 调用次数 / 任务（CoT 太多会不会瞎想？）               │
├─────────────────────────────────────────────────────────────┤
│  6. 用户体验与业务价值（UX & Business Value）                  │
│     最终用户买不买单？业务指标有没有涨？                         │
│     • 线上 A/B 测试中：人工评测胜出版本的胜率                   │
│     • 用户点赞 / 点踩率（👍👎 反馈按钮）                         │
│     • 客服 Agent：问题首次解决率、转人工率、平均工单处理时长     │
│     • 销售 Agent：线索转化率、复购率                            │
└─────────────────────────────────────────────────────────────┘
```

### 怎么构建第一份 Golden Eval Dataset？

从零开始成本太高？教你「**Trace → 筛选 → 标注**」的飞轮法：

```
第 1 周：接好 Langfuse Tracing → 线上跑 1 周
   ↓
第 2 周：导出所有 Trace → 按以下规则筛选 1000 条：
   • （高价值）付费用户的查询
   • （高频）出现次数 Top 50 的问题模板
   • （长尾）Cost 最高的 10% 异常长链路
   • （失败）用户点了 👎 / 转人工 / Agent 自己抛 Exception 的
   ↓
第 3 周：找 2 个业务专家 + 1 个产品标注 1000 条：
   每条 Case 标注：
   {task_success: True/False,
    tool_calls_correct: [Tool1_OK, Tool2_Wrong_Param],
    faithfulness: 1~5 分,
    hallucination_spans: ["...幻觉片段"],
    ideal_answer: "标准答案（可选）",
    difficulty: easy/medium/hard}
   ↓
第 4 周：得到 1000 条 Golden Dataset → 以后每次代码/Prompt 变更：
   • CI 自动跑全量评测 → 生成一份 Version 对比 Report
   • Task Success 旧版 82.1% → 新版 85.4%？合入
   • Task Success 旧版 82.1% → 新版 79.3%？打回重做
```

> 这套飞轮一旦转起来，你的 Agent 迭代会从「盲人摸象」变成「有仪表盘的赛车」——每一次改动都能明确量化收益。

### LLM-as-Judge：用强模型做「AI 裁判」省人力标注

人工标注 1000 条贵又慢，业界主流是「GPT-4o / Claude 3.5 Opus 当评委，自动评分」：

```python
# LLM-as-Judge Prompt 模板（来自 LMSYS Chatbot Arena，实测和人工标注一致性 ~85%）
JUDGE_PROMPT = """
你是一位专业的 Agent 质量评委。请基于以下信息打分：

【用户问题】
{question}

【Agent 实际回答】
{answer_model}

【参考答案（可选）】
{reference_answer}

【Agent 的工具调用轨迹】
{tool_calls_trace}

请从以下 4 个维度打分（1~5 分）：
1. 任务完成度：Agent 是否完整、正确完成了用户需求？
2. 工具调用正确性：工具选择和参数是否合理？
3. 事实忠实度：回答是否有幻觉、引用是否正确？
4. 表达质量：回答是否清晰有条理，格式是否规范。

最后输出 JSON：
{"task_completion": X, "tool_correctness": X, "faithfulness": X, "expression": X}
"""
```

**经验**：

- GPT-4o / Claude 3.5 Sonnet 当裁判 → 和人工标注 **Spearman 相关系数 ~~0.82~~0.87**（相当高，足以用来做回归评测）
- 小模型（70B 以下 Llama / Qwen）当裁判效果很差，别省这点钱
- 对打分结果一致性做 bootstrap 检验：同一对 (A, B) 打分，让 LLM 评 5 次，多数投票结果才可信，避免随机性

## 工程落地的常见坑

### 坑 1：Tracing 没打脱敏 → 合规事故

Trace 里会存用户 Input、LLM Completion、API 返回结果，里面可能有身份证号、手机号、病历。
→ **必须接入 PII 脱敏中间件**：正则/ Presidio 库自动检测和掩码手机号、邮箱、身份证，再写入 Trace。

### 坑 2：Cost 统计不准

- OpenAI 函数调用的 Tool Prompt 没算进去 → 少算 20% cost
- Re-rank、Embedding 调用没进 Trace → 成本漏算
  → **在 LLM Gateway / SDK 层面统一拦截**，所有 LLM/Embedding/Reranker 都必须走同一个 `trace_call` 函数。

### 坑 3：Eval 只测简单 case，线上崩在难 case

- 你的 Golden Dataset 里 90% 是 1 步能回答的简单问题 → 改了 Prompt 准确率 95%
- 上线后用户问的 30% 是多步长链路（查订单→退款→改地址）→ 线上实际只有 70%
  → **Golden Dataset 中 hard/medium/easy 比例建议 3:4:3**，强制覆盖长尾难例。

### 坑 4：只做离线 Eval，不做线上 A/B

- 离线 Golden 评测准确率 90% 就敢全量上线 → 用户反馈一堆问题
- 离线是「标准答案模式」，线上是「开放域用户提问模式」，分布差很多
  → **任何大版本变更必须做 5%~10% 流量 A/B 测试 ≥ 3 天**，用线上用户行为 + 人工抽样确认胜出再全量。

## 未来趋势

1. **自动化 Test Case 生成**：LLM 读你的 Agent 能力文档 + 工具 API Doc → 自动生成数千条边界测试 Case（含对抗样本：诱导幻觉、参数越界、超长输入），不用人工写。
2. **Trace 自动 Root Cause**：出了错 Trace 存着 → 一个专用 RCA LLM 读完整链路 → 直接告诉你「错误根因是 Span 5 的天气 API 返回了旧数据，修复建议：加参数校验 + 容错重试 3 次」。
3. **Online Learning 闭环**：用户点了 👎 的 Case → 自动收集 → 标注入 Golden Dataset → DPO / SFT 自动微调模型新版本 → A/B → 胜出合并，整个迭代从「周级」缩到「日级」。
4. **可观测性 + 数据质量 + 评测 三合一平台**：现在是 Trace 存 Langfuse + Eval 存自制脚本 + 数据漂移在 Phoenix，未来会统一到一个平台，变成 LLM Agent 时代的「NewRelic + DataDog」。

总结：Agent 是「长链路、非确定性、多依赖」的复杂系统。在传统软件工程里，你不会上线一个没有单元测试、没有 APM 链路追踪、没有监控告警的后端服务；在 Agent 工程里，你同样不能上线一个**没有 Evals & Tracing** 的 Agent 系统。

越早把这套基础设施建起来，后面迭代速度越快、踩坑越少——这是目前所有 Agent 团队从 Demo 走到 Production 的必经之路。

相关术语：[函数调用](/glossary/function-calling)、[思维链](/glossary/chain-of-thought)、[LLM评估-RAGAS](/glossary/llm-eval-ragas)、[RAG](/glossary/rag)
