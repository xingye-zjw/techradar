---
title: Agent 入门
category: llm
difficulty: intermediate
duration: 1-2周
summary: LLM Agent 是能自主规划、调用工具并迭代完成任务的大模型应用范式，是构建智能助手和自动化工作流的核心。
takeaways: "- 理解 Agent 的核心组件：规划、记忆、工具调用、行动
  - 掌握 ReAct、Plan-and-Solve 等常见 Agent 推理模式
  - 学会用 LangChain / LangGraph 搭建可调用工具的 Agent
  - 了解 Agent 的边界、安全风险和评估方法"
relatedIntel: "- 031-agentic-ai
  - 020-prompt-engineering
  - 005-rag"
tags: "- agent
  - llm
  - tool-use
  - react
  - langchain
  - planning"
relatedTerms: ["rag", "lora", "transformer", "chain-of-thought"]
relatedTools: ["huggingface-transformers", "langchain", "pytorch"]
relatedNodes: ["llm-inference", "llm-prompt-engineering"]
---

## 为什么你要学它

大语言模型本身只能生成文本，但现实世界中的任务往往需要：

- 查询数据库或搜索引擎
- 调用 API 获取实时信息
- 执行代码或操作文件
- 多步骤推理和错误修正

**LLM Agent** 就是给大模型加上「大脑 + 手脚 + 记忆」：让它能自主规划任务、选择工具、观察结果并持续迭代，直到完成复杂目标。从 ChatGPT Plugins 到 Claude Computer Use，从 AutoGPT 到各类客服/运维机器人，Agent 正在成为 LLM 落地的下一个主战场。

## 一句话概览（快速版）

> **Agent = LLM + 工具 + 记忆 + 规划循环。模型不再一次性给出答案，而是边想边做、边做边改。**

核心组件：

- **规划（Planning）**：把复杂目标拆成可执行的子任务
- **记忆（Memory）**：保存对话历史、中间结果和长期知识
- **工具（Tools）**：搜索、计算、代码执行、API 调用等外部能力
- **行动（Action）**：根据规划调用工具并观察返回结果

## 核心拆解

### 🔑 ReAct 推理模式

ReAct（Reasoning + Acting）是最经典的 Agent 范式：

```
Thought: 我需要先查一下北京今天的天气
Action: search("北京今天天气")
Observation: 北京今天晴，25°C，微风
Thought: 用户问要不要带伞，晴天不需要
Final Answer: 今天北京晴天，不需要带伞
```

每次循环包含：

1. **Thought**：模型思考当前状态和下一步
2. **Action**：调用某个工具，格式为 `工具名(参数)`
3. **Observation**：获取工具返回结果
4. 重复直到得出最终答案

```python
from langchain.agents import load_tools, initialize_agent, AgentType
from langchain.llms import OpenAI

llm = OpenAI(temperature=0)
tools = load_tools(["serpapi", "llm-math"], llm=llm)
agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True)
agent.run("2024 年诺贝尔奖物理学奖得主是谁？他出生年份的平方根是多少？")
```

### 🔑 工具定义与调用

工具通常包含三个部分：

- **name**：工具名称
- **description**：工具功能描述，Agent 靠它判断何时调用
- **func**：实际执行函数

```python
from langchain.tools import Tool

def calculator(expr: str) -> str:
    return str(eval(expr))

calc_tool = Tool(
    name="Calculator",
    description="用于执行数学表达式，输入应为合法的 Python 表达式",
    func=calculator
)
```

### 🔑 记忆机制

Agent 需要记忆来维持多轮上下文：

- **短期记忆**：当前对话窗口内的历史
- **长期记忆**：向量数据库存储的重要信息，可跨会话检索
- **实体记忆**：记录用户偏好、关键事实等

LangChain 提供 `ConversationBufferMemory`、`VectorStoreRetrieverMemory` 等组件。

### 🔑 规划策略

- **Zero-shot ReAct**：直接根据工具描述做一步推理
- **Plan-and-Solve**：先制定完整计划，再逐步执行
- **Tree of Thoughts**：探索多条推理路径，选择最优解
- **Reflection**：让模型自我批评并修正之前的错误

## 完整排查方案

Agent 行为不稳定时，按以下顺序排查：

1.  检查工具描述是否清晰，Agent 是否能正确选择工具
2.  确认工具返回格式稳定，避免模型解析失败
3.  观察 Thought-Action-Observation 循环，定位错误步骤
4.  调整 prompt，明确 Agent 的目标和约束
5.  引入记忆组件，避免上下文丢失
6.  对复杂任务使用 Plan-and-Solve 或 LangGraph 构建状态机
7.  设置最大迭代次数和 human-in-the-loop 确认，防止无限循环

## 常见误区与注意事项

- **误区 1：Agent 越自治越好**。过度放权会导致不可控行为，关键操作应加入人工确认或硬编码安全检查。
- **误区 2：工具描述可以随便写**。Agent 靠 description 决定调用哪个工具，描述不清晰会频繁选错工具。
- **误区 3：有了 Agent 就不需要 RAG**。Agent 适合任务执行，RAG 适合知识问答，两者常结合使用而非互相替代。
- **注意 1：必须设置最大迭代次数**，防止模型在错误循环中无限执行。
- **注意 2：工具返回值要结构化**，纯自然语言结果会让 Agent 难以解析并进入错误状态。

## 关键术语

- **Agent**：能感知环境、做出决策并执行行动的自主系统
- **Tool Use**：大模型调用外部工具扩展能力
- **ReAct**：交错进行推理和行动的大模型 Agent 范式
- **Planning**：将复杂任务分解为子任务的能力
- **Observation**：工具执行后返回给模型的结果
- **Human-in-the-loop**：在关键步骤引入人工确认，降低风险
