---
title: Agentic AI：从 Chatbot 到 Agent
category: llm
difficulty: advanced
duration: 1-2周
summary: Chatbot 只能「说话」，Agent 能「做事」——规划、执行、反思、协作，让 LLM 从对话者变成工作者
takeaways: "- 理解 Agent 的核心循环：规划 → 执行 → 观察 → 反思
  - 能设计单 Agent 的工具调用和反思机制
  - 理解 Multi-Agent 系统的协作模式
  - 能用 LangChain / AutoGen 等框架构建 Agent 应用"
relatedIntel: "- 003-lora-qlora
  - 005-rag
  - 015-rlhf"
relatedNodes: [
    "llm-inference",
    "- llm-finetune
    - llm-inference",
  ]
tags: "- agent
  - agentic ai
  - tool use
  - planning
  - reflection
  - multi-agent"
relatedTerms: ["rag", "lora", "transformer", "chain-of-thought"]
relatedTools: ["huggingface-transformers", "langchain", "pytorch"]
---

## 为什么你要学它

ChatGPT 能回答问题，但不能「做事」：它不能发邮件、不能写代码并运行、不能调用 API 获取实时数据。

**Agent** 是 LLM 的下一阶段：它不只是对话，而是能**自主完成复杂任务**。Agent 的核心能力：

- **规划**：把复杂任务拆成子任务
- **执行**：调用工具完成子任务
- **反思**：检查结果是否正确，必要时调整计划
- **协作**：多个 Agent 分工合作

AutoGPT、BabyAGI、LangChain Agents、AutoGen 都是 Agent 框架的代表。如果你想构建「能干活」的 LLM 应用，Agent 是必学方向。

## 一句话概览

- Agent = LLM + Tools + Memory + Planning + Reflection
- 核心循环：Plan → Execute → Observe → Reflect → Replan
- Multi-Agent：不同角色分工（如「程序员」+「测试员」+「产品经理」）

## 核心拆解

### 🔑 单 Agent 的核心循环

```python
def agent_loop(task, max_iterations=10):
    memory = []
    plan = planner(task)

    for iteration in range(max_iterations):
        # 执行下一步
        action = choose_action(plan, memory)
        result = execute_tool(action)

        # 观察结果
        observation = observe(result)
        memory.append((action, observation))

        # 反思：是否完成？是否需要调整？
        reflection = reflect(task, memory)

        if reflection["completed"]:
            return reflection["answer"]

        if reflection["need_replan"]:
            plan = planner(task, memory)

    return "任务未完成，超过最大迭代次数"
```

### 🔑 工具调用（Tool Use）

Agent 的「手」是工具。工具可以是：

- **API 调用**：搜索、天气、数据库查询
- **代码执行**：写 Python 代码并运行
- **文件操作**：读写文件、创建目录

工具的定义需要让 LLM 知道：

- 工具名称
- 输入参数（类型 + 描述）
- 输出格式

```python
tools = [
    {
        "name": "web_search",
        "description": "搜索互联网获取信息",
        "parameters": {
            "query": {"type": "string", "description": "搜索关键词"}
        }
    },
    {
        "name": "execute_python",
        "description": "执行 Python 代码并返回结果",
        "parameters": {
            "code": {"type": "string", "description": "要执行的 Python 代码"}
        }
    }
]
```

### 🔑 反思机制（Reflection）

反思是 Agent 区别于简单工具调用的关键：

- **自我评估**：检查执行结果是否符合预期
- **错误纠正**：发现错误后调整策略
- **学习记忆**：把成功/失败的经验存入长期记忆

实现方式：

1. 让 LLM 生成「反思文本」：分析当前进度、识别问题
2. 把反思文本加入下一轮的 Prompt
3. 用反思结果触发重新规划

### 🔑 Multi-Agent 协作

复杂任务需要多个 Agent 分工：

| Agent 角色 | 负责内容           |
| ---------- | ------------------ |
| Planner    | 制定计划、分解任务 |
| Researcher | 搜索信息、收集数据 |
| Coder      | 写代码、调试       |
| Tester     | 测试代码、报告 bug |
| Reviewer   | 检查质量、提出改进 |

协作模式：

- **顺序执行**：Planner → Researcher → Coder → Tester
- **并行执行**：多个 Researcher 同时搜索不同来源
- **对话协商**：Coder 和 Tester 通过对话解决 bug

AutoGen 框架提供了 Multi-Agent 的完整实现。

## 实战指南

### 用 LangChain 构建简单 Agent

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool

tools = [
    Tool(name="Search", func=search, description="搜索互联网"),
    Tool(name="Calculator", func=calculator, description="计算数学表达式")
]

agent = create_react_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools)

result = executor.invoke({"input": "2024年世界杯冠军是谁？他们赢了多少场比赛？"})
```

### 用 AutoGen 构建 Multi-Agent

```python
from autogen import AssistantAgent, UserProxyAgent

planner = AssistantAgent(
    name="Planner",
    system_message="你负责制定计划，把任务分解成步骤"
)

coder = AssistantAgent(
    name="Coder",
    system_message="你负责写 Python 代码实现计划"
)

user_proxy = UserProxyAgent(
    name="User",
    human_input_mode="NEVER",
    code_execution_config={"use_docker": False}
)

# Planner 和 Coder 协作
user_proxy.initiate_chat(planner, message="写一个爬虫抓取新闻标题")
planner.send_to(coder, message="计划已制定，请实现")
```

## 常见误区

### 误区 1：认为 Agent 能自主完成所有任务

**错误理解**：Agent 框架如此强大，应该能完全自主地完成任何复杂任务，不需要人工干预。

**正确理解**：当前的 Agent 仍然依赖 LLM 的推理能力，存在幻觉、推理错误、工具调用失败等问题。完全自主的 Agent 在实际应用中往往会产生错误结果或陷入无限循环。Agent 更适合处理"有明确边界、可验证结果"的任务，而非开放式问题。

**如何避免**：设计 Agent 时设置合理的 max_iterations 限制，添加人类审核节点（Human-in-the-loop）。对于关键操作（如数据库写入、文件删除），必须经过人工确认。定期监控 Agent 的执行日志，及时发现异常行为。

### 误区 2：忽略工具调用的错误处理

**错误理解**：只关注工具调用成功的情况，假设 API 永远正常、网络永远不会超时。

**正确理解**：工具调用会失败：网络超时、API 限流、权限不足、参数错误等。没有错误处理的 Agent 在遇到工具失败时会崩溃或产生无意义的重试，浪费大量 token 和时间。

**如何避免**：为每个工具调用添加异常捕获和重试机制。实现指数退避重试（exponential backoff），避免频繁重试导致 API 限流。当工具连续失败时，让 Agent 重新评估策略或向人类求助。记录所有工具调用的结果，用于后续分析和优化。

### 误区 3：过度设计 Multi-Agent 系统

**错误理解**：认为 Agent 越多越好，每个功能都设计一个专门的 Agent，系统越复杂越强大。

**正确理解**：Multi-Agent 系统会带来额外的协调开销：Agent 之间的通信成本、角色定义的复杂性、任务分配的开销。对于简单任务，单 Agent 可能就够了；对于复杂任务，过多的 Agent 反而会降低效率和可靠性。

**如何避免**：从单 Agent 开始，只在确实需要时才引入 Multi-Agent。评估任务复杂度：如果单 Agent 能在合理迭代次数内完成，就不需要 Multi-Agent。如果需要 Multi-Agent，优先使用顺序执行模式，并行执行只在确实能提升效率时使用。

## 相关资源

- [LangChain Agents 文档](https://python.langchain.com/docs/concepts/agents/)
- [AutoGen GitHub](https://github.com/microsoft/autogen)
- [ReAct 论文](https://arxiv.org/abs/2210.03629)
- [BabyAGI GitHub](https://github.com/yoheinakajima/babyagi)
