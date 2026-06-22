# 函数调用（Function Calling / Tool Use）

**Function Calling** 是 LLM Agent 系统的基础能力：模型在回复中插入结构化的工具调用请求，由外部程序执行后把结果传回模型继续处理。

## 核心概念

### 工作流程

```
用户输入："北京今天天气怎么样？"
     ↓
LLM 判断需要调用工具
     ↓
返回工具调用请求：
  {
    "tool": "get_weather",
    "args": {"location": "北京"}
  }
     ↓
外部程序执行函数，返回结果：
  {"temperature": 25, "condition": "晴"}
     ↓
LLM 基于结果生成最终回复
```

### 解决的两大问题

| 问题 | 说明 |
|------|------|
| **知识截止** | LLM 知识停留在训练时间，无法获取实时信息 |
| **无法执行** | LLM 无法直接执行计算、查询数据库等操作 |

## OpenAI API 示例

```python
from openai import OpenAI

client = OpenAI()

# 定义工具 schema
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定城市的天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "城市名称，如'北京'"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "温度单位"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

# 实际函数实现
def get_weather(location, unit="celsius"):
    # 实际项目中调用天气 API
    return {
        "location": location,
        "temperature": 25,
        "unit": unit,
        "condition": "晴"
    }

# 调用 LLM
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "北京今天天气怎么样？"}],
    tools=tools,
    tool_choice="auto"
)

# 处理工具调用
if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    if tool_call.function.name == "get_weather":
        import json
        args = json.loads(tool_call.function.arguments)
        result = get_weather(**args)
        print(result)
```

## 应用场景

### 1. 智能助手

```python
# 多工具组合使用
tools = [
    {"name": "search_web", "description": "搜索网页"},
    {"name": "execute_code", "description": "执行Python代码"},
    {"name": "send_email", "description": "发送邮件"},
    {"name": "query_database", "description": "查询数据库"}
]

# Agent 自动选择和组合工具
user_input = "帮我查一下上个月的销售数据，生成报告并发给团队"
# LLM 会自动：query_database → execute_code → send_email
```

### 2. 数据分析助手

```python
# 代码执行 + 结果解释
response = llm.generate(
    "分析这个CSV文件的销售趋势",
    tools=["read_csv", "execute_python", "create_chart"]
)
# LLM 会：读取数据 → 编写分析代码 → 生成图表 → 解释结果
```

### 3. 自动化工作流

```python
# 企业自动化场景
tools = [
    {"name": "jira_create_ticket", "description": "创建Jira工单"},
    {"name": "slack_send_message", "description": "发送Slack消息"},
    {"name": "github_create_pr", "description": "创建GitHub PR"}
]

# 自然语言触发复杂工作流
"当代码提交时，自动创建Jira工单并通知团队"
```

## 高级模式

### 并行工具调用

```python
# 同时调用多个工具
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "查一下北京和上海的天气"}],
    tools=tools
)

# 可能返回多个 tool_calls
for tool_call in response.choices[0].message.tool_calls:
    # 并行执行所有工具调用
    execute_tool(tool_call)
```

### 工具链（Tool Chain）

```python
# 工具之间有依赖关系
workflow = [
    ("search", {"query": "最新AI论文"}),      # 第一步
    ("analyze", {"papers": "第一步结果"}),       # 第二步
    ("summarize", {"analysis": "第二步结果"})   # 第三步
]
```

## 相关概念

[LLM Agent](/glossary/llm-agent)、[提示工程](/glossary/prompt-engineering)、[RAG](/glossary/rag)、[大语言模型](/glossary/llm)
