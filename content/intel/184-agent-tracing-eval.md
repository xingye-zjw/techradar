---
title: Agent 评估追踪与可观测性实战
category: devops
summary: LLM Agent 跑起来容易，知道它为什么出错难。建立覆盖 Prompt、工具调用、Token 消耗、延迟的全链路追踪与评估体系，是 Agent 从 Demo 走向生产的关键。
difficulty: intermediate
excerpt: LLM Agent 跑起来容易，知道它为什么出错难。建立覆盖 Prompt、工具调用、Token 消耗、延迟的全链路追踪与评估体系，是 Agent 从 Demo 走向生产的关键。
relatedTerms:
  - docker
  - linux
  - git
  - kubernetes
  - prometheus
relatedTools:
  - docker
  - mlflow
  - kubernetes
  - prometheus
  - grafana
relatedNodes:
  - devops-kubernetes
  - docker-basic
  - llm-inference
---

## 为什么你要学它

当你把一个 LLM Agent 从 Jupyter Notebook 搬到生产环境，最头疼的问题不再是「能不能跑」，而是「为什么这次回答错了」「刚才那 2000 块 API 费用花在哪儿了」「用户投诉的那个回答到底调用了什么工具」。Agent 的执行路径是动态的——同样的用户问题，今天可能只查知识库就回答，明天可能需要调用三次数据库 + 一次代码解释器，这种不确定性让传统的日志与监控体系几乎失效。

Agent 可观测性要解决的就是这些痛点：

- **全链路追踪**：一次用户请求对应一个 Trace，记录每一轮 LLM 调用、Prompt/Completion、工具调用入参出参、中间思考过程，还原完整执行轨迹
- **量化评估**：在每次发布新版本时，自动跑标准评测集，输出答案正确率、工具调用成功率、Token 消耗、P95 延迟等核心指标，防止劣化
- **成本监控**：按模型、按用户、按功能维度统计 Token 消耗与费用，设置预算告警，避免月底账单惊喜
- **质量反馈闭环**：收集用户对回答的赞/踩，与 Trace 关联，自动构建 Badcase 数据集，驱动模型与 Prompt 迭代

没有这套体系，Agent 的运维和优化就像闭卷考试——你只能猜问题在哪儿。有了全链路追踪与评估，每一个 Badcase 都是可分析、可复现、可修复的。

## 一句话概览

- **Trace = 一次用户请求的完整生命周期**：包含多个 Span，每个 Span 对应一次 LLM 调用、一次工具执行或一次数据库查询
- **评估的两个维度**：离线评估（标准评测集，发布前跑）+ 在线评估（真实用户反馈 + LLM-as-Judge 自动打分）
- **核心指标看板**：答案正确率、工具调用成功率、平均 Token 消耗/请求、P50/P95 延迟、异常率、成本/日
- **开源工具链**：LangSmith / Langfuse 做追踪与评估，OpenTelemetry + Prometheus + Grafana 做指标监控，MLflow 存评测版本

## 核心拆解

### 🔑 Agent Trace 的结构设计

一条完整的 Agent Trace 应该是一棵树，根节点是用户请求，子节点是每一步的 LLM 调用和工具执行：

```
Trace (trace_id=abc123, user_id=u456, session_id=s789)
├── Span 1: Agent.think (reasoning about user query)
│   ├── LLM Call 1a (model=gpt-4o, prompt_tokens=1200, completion_tokens=350, latency=2.3s)
│   └── Decision: call tool "search_knowledge_base"
├── Span 2: Tool.search_knowledge_base (query="xxx", top_k=5, latency=0.15s, returned_chunks=[...])
├── Span 3: Agent.think (reasoning with retrieved context)
│   └── LLM Call 3a (model=gpt-4o, prompt_tokens=4800, completion_tokens=620, latency=5.1s)
└── Span 4: Agent.reply (final_answer="...")
```

每个 Span 必须记录的字段：

| 字段                                | 作用                                  | 示例                                    |
| ----------------------------------- | ------------------------------------- | --------------------------------------- |
| span_id / parent_id                 | 构建调用链树                          | sp_001 / null                           |
| span_type                           | 区分是 LLM 调用、工具调用还是普通逻辑 | llm / tool / agent_step                 |
| start_time / end_time / duration_ms | 延迟分析                              | 2300 ms                                 |
| status                              | 成功/失败/取消                        | ok / error                              |
| metadata                            | 扩展字段（模型名、温度、工具名等）    | {"model": "gpt-4o", "temperature": 0.2} |
| input / output                      | 原始输入输出（可选采样存储）          | Prompt 原文、Completion 原文            |
| token_usage                         | prompt/completion/total               | {"prompt": 1200, "completion": 350}     |
| cost_usd                            | 本次调用费用（按模型单价 × Token）    | 0.0235                                  |

Token 费用的计算逻辑很关键——不能只存总 Token 数，要按模型单价实时计算并存下来，因为不同模型价格差几十倍。一个简单的单价表：

```python
MODEL_PRICING = {
    "gpt-4o": {"prompt": 5.0 / 1_000_000, "completion": 15.0 / 1_000_000},
    "gpt-4o-mini": {"prompt": 0.15 / 1_000_000, "completion": 0.6 / 1_000_000},
    "claude-3-5-sonnet-20240620": {"prompt": 3.0 / 1_000_000, "completion": 15.0 / 1_000_000},
}

def calculate_cost(model: str, prompt_tokens: int, completion_tokens: int) -> float:
    prices = MODEL_PRICING.get(model)
    if not prices:
        return 0.0
    return (
        prompt_tokens * prices["prompt"]
        + completion_tokens * prices["completion"]
    )
```

### 🔑 离线评估：发布前的质量门禁

每一次 Agent 代码变更（改 Prompt、换模型、加工具、改工具逻辑）都应该跑一次离线评估，与基线版本对比，指标劣化则禁止发布。

评测集的设计是离线评估的核心。一个高质量的 Agent 评测集应该包含：

1. **单跳推理题**：只需要查一次知识库或调用一次工具就能回答
2. **多跳推理题**：需要多次工具调用或多步思考（如先查 A，再根据 A 的结果查 B）
3. **工具调用正确率题**：故意给一些需要选对工具、参数正确的场景（比如「查 2024 年 Q3 销售额」应该调 sales_report 工具，参数 quarter=3 year=2024）
4. **拒答题**：询问知识库不覆盖的内容，Agent 应该明确说「不知道」而不是幻觉
5. **异常处理题**：工具报错、返回空结果时，Agent 应该优雅降级而不是崩溃

每条评测数据的结构：

```json
{
  "id": "eval_001",
  "category": "multi_hop",
  "query": "2024 年 Q3 华东区销售额最高的产品是什么？它的毛利率是多少？",
  "expected_tools": [
    { "name": "sales_report", "params": { "quarter": 3, "year": 2024, "region": "east" } },
    { "name": "product_margin", "params": { "product_name": "SmartWatch Pro" } }
  ],
  "expected_answer_contains": ["SmartWatch Pro", "毛利率"],
  "reference_answer": "华东区 Q3 销售额最高的产品是 SmartWatch Pro，毛利率为 38.5%"
}
```

评估指标的计算：

```python
from dataclasses import dataclass

@dataclass
class EvalResult:
    answer_correct: bool       # LLM-as-Judge 判断答案是否正确
    tool_sequence_match: bool  # 工具调用顺序是否符合预期
    tool_param_match: float    # 工具参数正确率（0~1）
    refused_hallucination: bool  # 不该答时是否拒绝
    latency_ms: int
    total_tokens: int
    cost_usd: float

def compute_aggregate_metrics(results: list[EvalResult]) -> dict:
    n = len(results)
    return {
        "answer_accuracy": sum(r.answer_correct for r in results) / n,
        "tool_sequence_acc": sum(r.tool_sequence_match for r in results) / n,
        "tool_param_avg_acc": sum(r.tool_param_match for r in results) / n,
        "refusal_rate": sum(r.refused_hallucination for r in results) / n,
        "avg_latency_ms": sum(r.latency_ms for r in results) / n,
        "p95_latency_ms": sorted(r.latency_ms for r in results)[int(n * 0.95)],
        "avg_tokens": sum(r.total_tokens for r in results) / n,
        "avg_cost_usd": sum(r.cost_usd for r in results) / n,
        "total_cost_usd": sum(r.cost_usd for r in results),
    }
```

### 🔑 LLM-as-Judge：用模型打分替代人工

答案是否正确这件事，很难用规则判断（比如「SmartWatch Pro 毛利率 38.5%」和「大概 38% 左右」语义上是一致的）。工业界的标准做法是用一个更强的 LLM 当评委，给 Agent 的回答打分。

一个成熟的 Judge Prompt 模板：

```
你是一个严谨的答案质量评估专家。请根据以下信息对 Agent 的回答进行评分：

【用户问题】
{query}

【参考答案】
{reference_answer}

【Agent 实际回答】
{agent_answer}

【评分标准（1-5分）】
5分：回答完全正确，关键信息（数值、名称、结论）与参考答案一致或等价，没有多余错误信息
4分：回答基本正确，仅有微小非关键信息偏差，不影响整体结论
3分：回答部分正确，关键信息有缺失但方向正确，没有错误信息
2分：回答有明显错误，关键信息不正确，但有部分相关内容
1分：回答完全错误，或与问题无关，或存在严重幻觉

请先给出详细的评分理由（100字以内），然后以 JSON 格式输出评分结果，格式为：
{"score": 整数, "reason": "评分理由"}
```

为了减少 Judge 本身的偏差，建议：

- 使用比被测 Agent 更强的模型当评委（比如被测用 gpt-4o-mini，评委用 gpt-4o 或 Claude 3.5 Sonnet）
- 每条样例打两次分，取平均；两次分差 ≥ 2 时标记为人工复核
- 定期抽 5% 的高分和低分样例做人工校准，确保 Judge 的打分逻辑符合业务预期

### 🔑 在线监控：生产环境的四大看板

生产环境至少要有四个核心监控看板，用 Prometheus + Grafana 搭建：

**看板一：质量看板**

- 在线答案正确率（由轻量版 Judge 对 10% 的真实流量自动打分）
- 用户点赞率 / 点踩率 / 复制率 / 追问率（这些行为信号是质量的代理指标）
- 幻觉率：Judge 判定为「包含事实错误」的比例
- 拒答准确率：该拒答时真的拒答了 / 不该拒答时没有拒答

**看板二：成本看板**

- 每日总费用（按模型拆分）
- 平均单次请求成本
- Top N 高成本用户 / 高成本会话
- Token 消耗环比趋势（与上周/上月对比）
- 预算使用率告警（如「本月预算已用 80%」）

**看板三：性能看板**

- P50 / P95 / P99 端到端延迟
- 各阶段延迟占比（LLM 调用 / 工具执行 / 知识库检索）
- 各模型 LLM 调用延迟
- 超时率（端到端 > 30s 的比例）

**看板四：错误看板**

- 总体异常率（HTTP 5xx + 未捕获异常）
- 工具调用失败率（按工具名拆分）
- LLM API 错误率（RateLimit / 超时 / 服务不可用）
- Badcase 排行榜（按被踩次数排序，直接关联到 Trace ID 可跳转到详情页）

## 完整跑通方案

### 第一步：用 Langfuse 快速搭建追踪系统

Langfuse 是开源的 LLM 工程平台，提供 Trace 存储、可视化、评估一体化。先在本地用 Docker Compose 启动：

```yaml
# docker-compose.yaml
version: "3.7"
services:
  langfuse-server:
    image: ghcr.io/langfuse/langfuse:latest
    depends_on:
      - db
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres
      - NEXTAUTH_SECRET=change-this-to-a-random-string
      - SALT=change-this-salt-too
      - NEXTAUTH_URL=http://localhost:3000
  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=postgres
    volumes:
      - langfuse_data:/var/lib/postgresql/data
volumes:
  langfuse_data:
```

启动后访问 http://localhost:3000，创建项目拿到公钥私钥。然后在你的 Agent 代码中集成 SDK：

```python
from langfuse import Langfuse
from langfuse.decorators import observe, langfuse_context

langfuse = Langfuse(
    public_key="pk-lf-xxxx",
    secret_key="sk-lf-xxxx",
    host="http://localhost:3000",
)

@observe()
def run_agent(user_query: str, user_id: str, session_id: str):
    langfuse_context.update_current_trace(
        user_id=user_id,
        session_id=session_id,
        metadata={"feature": "customer_support_agent"},
    )

    # 第一轮思考
    thought_1 = call_llm(
        model="gpt-4o-mini",
        prompt=build_first_prompt(user_query),
        step_name="first_reasoning",
    )

    if need_search(thought_1):
        # 工具调用
        chunks = search_knowledge_base(extract_query(thought_1))
        langfuse_context.update_current_observation(
            input=extract_query(thought_1),
            output=chunks,
        )

    # 最终回答
    final_answer = call_llm(
        model="gpt-4o-mini",
        prompt=build_final_prompt(user_query, chunks),
        step_name="final_answer",
    )
    return final_answer
```

所有被 `@observe()` 装饰的函数都会自动生成 Trace 和 Span，嵌套函数自动形成调用树。你也可以手动创建 Span 来标记工具调用。

### 第二步：实现离线评估流水线

把评测集存为 JSON，每次代码变更时触发评估脚本：

```python
import json
from dataclasses import asdict

def run_offline_evaluation(eval_set_path: str, agent_version: str) -> dict:
    with open(eval_set_path, "r", encoding="utf-8") as f:
        eval_cases = json.load(f)

    results = []
    for case in eval_cases:
        # 跑 Agent
        agent_answer, trace_data = run_agent_with_trace(case["query"])

        # 用 Judge 打分
        judge_score, judge_reason = call_judge(
            query=case["query"],
            reference=case["reference_answer"],
            agent_answer=agent_answer,
        )

        # 工具调用比对
        tool_match, tool_param_acc = compare_tool_calls(
            expected=case["expected_tools"],
            actual=trace_data["tool_calls"],
        )

        results.append(EvalResult(
            answer_correct=judge_score >= 4,
            tool_sequence_match=tool_match,
            tool_param_match=tool_param_acc,
            refused_hallucination=case.get("should_refuse", False) == ("不知道" in agent_answer),
            latency_ms=trace_data["duration_ms"],
            total_tokens=trace_data["total_tokens"],
            cost_usd=trace_data["cost_usd"],
        ))

    metrics = compute_aggregate_metrics(results)
    metrics["agent_version"] = agent_version
    metrics["eval_case_count"] = len(results)

    # 结果存 MLflow，方便对比版本
    import mlflow
    with mlflow.start_run(run_name=f"eval_{agent_version}"):
        mlflow.log_metrics({k: v for k, v in metrics.items() if isinstance(v, (int, float))})
        mlflow.log_dict({"per_case_results": [asdict(r) for r in results]}, "per_case.json")

    return metrics
```

在 CI 中配置质量门禁：

```yaml
# .github/workflows/eval-gate.yaml
jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r eval_requirements.txt
      - id: eval
        run: |
          python scripts/run_evaluation.py \
            --eval-set data/eval_set_v2.json \
            --version ${{ github.sha }} \
            --output metrics.json
      - name: Quality Gate
        run: |
          python scripts/check_gate.py \
            --metrics metrics.json \
            --baseline metrics/baseline.json \
            --threshold '{"answer_accuracy": -0.02, "avg_latency_ms": 1.1}'
```

`check_gate.py` 的逻辑：新版本指标比基线版本差超过阈值（如正确率下降超过 2%、平均延迟增长超过 10%）就失败，阻止合并 PR。

### 第三步：用户反馈闭环

在前端给回答加「有帮助 / 没帮助」按钮，点击时把反馈连同 session_id、message_id 一起上报。后端根据这些 ID 反查对应的 Trace，把打了差评的回答自动进入 Badcase 队列：

```python
def collect_user_feedback(session_id: str, message_id: str, rating: int, comment: str = ""):
    # rating: 1 = 踩, 5 = 赞
    # 反查 Trace
    trace = langfuse.get_trace_by_session_and_message(session_id, message_id)

    # 写入 Badcase 表（生产用数据库）
    badcase = {
        "trace_id": trace.id,
        "query": trace.input,
        "agent_answer": trace.output,
        "rating": rating,
        "comment": comment,
        "timestamp": datetime.now().isoformat(),
    }

    # 差评自动进入回归测试集候选池
    if rating == 1:
        append_to_candidate_pool(badcase)
```

每周从候选池中筛选 20~30 条高价值 Badcase（加工具参数错误、幻觉、逻辑错误），经人工确认后加入正式评测集。这样每次修复 Bug 后，对应的问题会永远留在回归测试里，防止同一个坑踩两次。

### 第四步：成本控制与告警

用 Prometheus 记录每次 LLM 调用的费用，配置告警规则：

```yaml
groups:
  - name: llm_cost
    rules:
      - alert: DailyCostExceedsBudget
        expr: sum(increase(llm_cost_usd_total[1d])) > 500
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: '今日 LLM 费用已超过 $500，当前: ${{ $value | printf "%.2f" }}'

      - alert: HighCostPerRequest
        expr: histogram_quantile(0.95, rate(llm_request_cost_usd_bucket[1h])) > 0.5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "P95 单次请求费用超过 $0.5，可能存在长上下文滥用"

      - alert: TokenSpike
        expr: sum(rate(llm_tokens_total[5m])) > 3 * avg_over_time(sum(rate(llm_tokens_total[5m]))[24h])
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Token 消耗突增至日均 3 倍以上，请检查是否有异常调用"
```

## 常见误区

**误区 1：追踪就是打日志，随便写几行 print 就行。** → 错。普通日志没有结构化的 Trace/Span 层级关系，无法把「一次请求中三次 LLM 调用 + 两次工具执行」串成一条可视化的调用链。而且日志往往只存错误信息，好的 Trace 系统会采样存储成功请求的输入输出，这是分析 Badcase 的原材料。

**误区 2：LLM-as-Judge 打分完全可信，不用人工校验。** → 错。Judge 模型本身也是 LLM，会有偏见和波动，特别是面对「参考答案有多种合理解法」的开放式问题。最佳实践是：自动打分用于日常门禁 + 粗排，每月抽 5%~10% 的样例做人工校准，计算 Judge 与人工的一致率（通常目标 85% 以上），一致率太低时要优化 Judge Prompt 或换更强的模型。

**误区 3：离线评估分数高，生产效果一定好。** → 错。离线评测集再大，覆盖的场景也是有限的。真实用户的问题千奇百怪：有错别字、有半截话、有方言、有和其他功能混合使用的边界场景。必须建立离线 + 在线的双重评估体系，在线监控真实用户的行为反馈（点赞率、追问率、转人工率），两者交叉验证。

**误区 4：Token 监控只看总数量，不用按模型拆分。** → 错。gpt-4o 和 gpt-4o-mini 的价格差 30 倍，同样花 100 美元，前者可能只够跑一次压力测试，后者能支撑一周的正常流量。成本看板必须按「模型 × 功能模块 × 用户层级」三个维度下钻，才能快速定位异常——比如发现某个内部测试账号在狂用 gpt-4o 跑批处理。

**误区 5：只监控端到端延迟，不分阶段统计。** → 错。端到端 P95 从 3s 涨到 8s，如果你只看总延迟，根本不知道问题出在 LLM 调用变慢了、知识库检索卡了，还是新添加的某个外部工具接口超时。必须在每个 Span 上报独立的延迟指标，才能秒级定位瓶颈。
