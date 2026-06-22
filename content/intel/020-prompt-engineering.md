---
title: Prompt Engineering 提示工程与 Agent 设计
category: llm-application
keywords:
  - prompt engineering
  - chain-of-thought
  - function calling
  - react agent
  - structured output
  - agentic
difficulty: intermediate
duration: 1周
summary: 不是调模型参数，而是调问题表述——用更好的 Prompt 让同一个模型产生质的飞跃
takeaways:
  - 掌握结构化 Prompt 的核心组件：角色/任务/上下文/输出格式
  - 能用 Chain-of-Thought 显著提升复杂推理任务准确率
  - 能用 Function Calling 让 LLM 调用外部工具
  - 能设计一个基本的 ReAct Agent
---

## 为什么你要学它

GPT-4o 和 GPT-3.5 用的是同一个模型架构，但有人用 GPT-3.5 做出了比 GPT-4o 更好的效果——区别就在 Prompt。

Prompt Engineering 是在**不改变模型权重**的情况下，通过优化输入文本来挖掘模型已有能力的技术。它的成本比微调低得多（省去 GPU 训练费用），迭代速度也快得多（改文字比改代码容易）。

对于 LLM 应用开发者，Prompt Engineering 是**性价比最高**的技能：花 1 小时优化 Prompt，效果可能等同于花 1 周重新训练模型。

## 一句话概览

- 结构化 Prompt = 角色设定 + 任务描述 + 上下文 + Few-shot Examples + 输出格式约束
- Chain-of-Thought 把「直接给答案」变成「先想清楚再答」，对数学/逻辑任务提升显著
- Function Calling 让 LLM 变成工具调用者，突破知识截止日期和计算能力的限制
- ReAct = Reasoning + Acting，Agent 框架的基础范式

## 核心拆解

### 🔑 结构化 Prompt 的五要素

一个好的 Prompt 通常包含：

1. **角色设定**（System）："你是一个资深的数据分析师..."
2. **任务描述**（Task）："从以下文本中提取关键实体..."
3. **上下文/背景**（Context）："这段文本来自一份法律合同..."
4. **Few-shot Examples**（Examples）：给 2-3 个输入→输出的样例
5. **输出格式约束**（Format）："请以 JSON 格式输出，包含 xxx 字段"

### 🔑 Chain-of-Thought：让模型「想清楚再答」

在 Prompt 末尾加一句 **"Let's think step by step"** 或 **"请分步骤思考"**，模型会先输出推理过程再给答案。这个方法在数学、逻辑、代码生成任务上通常能带来 **20-50%** 的准确率提升。

原因：模型在生成推理步骤的过程中，实际上是在「借用」了更多中间层的表示来支撑最终答案。

### 🔑 Function Calling：让 LLM 调用工具

LLM 的知识有截止日期，计算能力也有限。Function Calling 允许模型在回复中插入结构化的「工具调用请求」，由外部系统执行后再把结果传回模型。

```json
{
  "role": "assistant",
  "content": null,
  "tool_calls": [{
    "id": "call_123",
    "type": "function",
    "function": {
      "name": "get_weather",
      "arguments": "{\"location\": \"北京\"}"
    }
  }]
}
```

### 🔑 ReAct Agent：推理-行动循环

ReAct 的核心思想是：模型不只是「推理」，还要「行动」，行动后产生「观察」，观察再触发下一轮推理。

```
问题 → 推理 → 行动 → 观察 → 推理 → ... → 回复
```

这构成了一个 Agent 的基本循环。LangChain、LlamaIndex 等框架都是 ReAct 范式的工程化实现。

## 实战指南

### 结构化 Prompt 模板

```
<system>
你是一个专业的会议纪要助手。

你的职责是从会议文本中提取以下信息：
- summary: 会议摘要（100-200字）
- members: 参会人员列表
- topics: 讨论的主题列表
- decisions: 做出的决策
- action_items: 行动项，每项包含负责人和截止日期

输出格式：严格 JSON，不得包含除 JSON 以外的任何文字。
</system>

<examples>
输入: "今天张三和李四讨论了Q3目标，决策是上线新的推荐系统，行动项：张三负责前端开发，deadline是下周五"
输出: {"summary": "讨论Q3目标...", "members": ["张三", "李四"], ...}
</examples>

现在请处理以下输入：
{{user_input}}
```

### Function Calling 示例

```python
from openai import OpenAI
client = OpenAI()

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "获取指定城市的天气",
        "parameters": {
            "type": "object",
            "properties": {"location": {"type": "string"}},
            "required": ["location"]
        }
    }
}]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "北京今天天气怎么样？"}],
    tools=tools
)
# response.choices[0].message.tool_calls[0].function.arguments
# → '{"location": "北京"}'
```

### ReAct Agent 循环实现

```python
def react_agent(question, max_turns=5):
    history = []
    for turn in range(max_turns):
        response = llm.think(question, history)
        if response.action:
            result = execute_tool(response.action, response.args)
            history.append((response.thought, result))
        else:
            return response.final_answer
    return "超过了最大推理轮次"
```

## 常见误区

### 误区 1：Prompt 越长越好，细节越多越准确

**错误理解**：很多人认为在 Prompt 中堆砌大量信息和指令，模型就能给出更准确的回答。

**正确理解**：过长的 Prompt 反而会稀释关键信息的权重，导致模型"注意力分散"。模型对 Prompt 的处理有上下文窗口限制，而且距离越远的信息影响力越弱（Lost in the Middle 现象）。

**如何避免**：遵循"精简+结构化"原则。使用明确的标题和分隔符组织信息，将最重要的指令放在 System Prompt 的开头或结尾。可以用 Few-shot Examples 代替冗长的文字描述。

### 误区 2：Chain-of-Thought 对所有任务都有帮助

**错误理解**：很多人认为只要加上"Let's think step by step"，任何任务的准确率都会提升。

**正确理解**：CoT 主要在需要多步推理的复杂任务（数学、逻辑、代码）上有效。对于简单的事实查询、翻译、摘要等任务，强制 CoT 反而会增加延迟和成本，甚至可能因为"过度思考"而引入错误。

**如何避免**：根据任务复杂度选择是否使用 CoT。简单任务用直接 Prompt，复杂推理任务才用 CoT。可以建立任务分类器来自动决定是否启用 CoT。

### 误区 3：Function Calling 是万能的工具调用方案

**错误理解**：很多人认为只要定义好函数，LLM 就能可靠地调用任何工具。

**正确理解**：Function Calling 依赖于模型对参数的理解能力，复杂嵌套的参数结构容易出错。此外，模型可能"幻觉"出不存在的函数名，或错误推断参数类型。不同模型对 Function Calling 的支持程度也差异很大。

**如何避免**：为函数提供清晰的描述和示例，使用 JSON Schema 严格定义参数类型。在调用前验证参数，建立错误处理机制。对于关键业务，考虑添加确认步骤或使用更稳定的 Agent 框架。

## 相关资源

- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering)
- [ReAct 论文](https://arxiv.org/abs/2210.03629)
- [LangChain Agents 文档](https://python.langchain.com/docs/concepts/agents/)
