---
title: 大模型 Prompt 转义字符错误导致 JSON 输出截断
category: llm
difficulty: intermediate
duration: 30分钟
summary: 聚焦单点问题：LLM Prompt 中转义字符错误导致 JSON 输出解析失败或截断，涵盖 json.dumps 转义、Function Calling JSON mode、max_tokens 限制、print(repr(prompt)) 检查等排查与修复方案。
takeaways:
  - 快速识别「大模型 Prompt 转义字符错误导致 JSON 输出截断」的典型症状
  - 理解该问题的根因分析和标准排查步骤
  - 学会分步排查和解决问题的标准化流程
  - 了解预防措施，避免下次踩同样的坑
relatedIntel:
  - 020-prompt-engineering
  - 095-pitfall-llm-app
tags:
  - 踩坑
  - 避坑指南
  - llm
  - prompt
  - json
  - 字符串转义
---

## 为什么你要学它

这是开发中非常容易踩的一个坑：**大模型 Prompt 转义字符错误导致 JSON 输出截断**。

大语言模型输出的 JSON 在中途被截断或解析失败，通常是 Prompt 中的特殊字符未正确转义所致。这在需要结构化输出的 LLM 应用中非常常见。

如果你正在遇到类似问题，或者想提前预防，这篇卡片会帮你快速定位问题、找到解决方案，并学会从根源上避免它。

## 一句话概览（快速版）

> **快速修复：json.dumps(prompt_content) 或使用 Function Calling 代替手动拼接**

核心要点：
- **现象**：LLM 输出的 JSON 在中途被截断，后半部分丢失
- **根因**：Prompt 中包含未转义的双引号、换行符或特殊字符，干扰了 JSON 的格式。Python 字符串拼接 Prompt 时容易引入此类问题。
- **解决**：按照下方 5 步标准流程排查

## 核心拆解

### 🔑 典型症状

- × LLM 输出的 JSON 在中途被截断，后半部分丢失
- × JSON 解析报 Unexpected end of JSON input
- × 只在特定 Prompt 内容时出现，换了 Prompt 就正常

### 🔑 根本原因

Prompt 中包含未转义的双引号、换行符或特殊字符，干扰了 JSON 的格式。Python 字符串拼接 Prompt 时容易引入此类问题。

## 完整排查方案

按照以下步骤逐一排查，通常能在几分钟内定位并解决问题：

01. 检查 Prompt 中是否有未转义的双引号、换行符、特殊字符
02. Python 中构建 Prompt 时用 json.dumps() 转义 JSON 特殊字符（注意：re.escape() 用于转义正则元字符，不适用于 JSON 引号/换行符转义）
03. Prompt 中避免直接放 JSON 模板中的未转义双引号
04. 使用 Function Calling / response_format 的 JSON mode 让模型保证输出格式
05. 对长 Prompt 截断检查：print(repr(prompt)) 看是否有 \n 或 " 未正确转义

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> json.dumps(prompt_content) 或使用 Function Calling 代替手动拼接

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- 构建 Prompt 时使用 json.dumps() 处理动态内容，自动转义特殊字符
- 优先使用 Function Calling 或 response_format JSON mode，让模型保证格式
- 打印 repr(prompt) 检查转义字符是否正确，避免隐藏的换行或引号问题
- 对长输出设置 max_tokens，并验证返回的 JSON 完整性

## 常见误区

1. **只看表面现象，不深挖根因** — 问题暂时解决了，但过段时间又出现
2. **跳过排查步骤直接试方案** — 容易引入新的问题
3. **不做预防措施** — 同一个坑踩好几次

## 推荐学习顺序

1. 先看「典型症状」确认你遇到的是不是这个问题
2. 再看「快速修复」试试能不能立刻解决
3. 如果不行，按照「完整排查方案」一步步来
4. 最后一定要看「预防措施」，避免下次再踩
