# TechRadar 内容规范文档

## 项目概述

TechRadar 是一个 AI 驱动的大学生硬核开源实战导航系统，包含以下内容模块：

- **情报 (Intel)**: 技术卡片，包含核心知识点和实战方案
- **术语 (Glossary)**: 专业术语详解
- **踩坑 (Pitfall)**: 常见问题和解决方案
- **工具箱 (Toolbox)**: 开发工具推荐

---

## 统一内容类型系统

### ContentCategory 枚举

所有内容模块共享统一的分类枚举类型 `ContentCategory`，定义在 `lib/content-types.ts`。

| 分类值 | 说明 | 使用场景 |
|--------|------|----------|
| `computer-vision` | 计算机视觉 | 目标检测、图像分类、分割等 |
| `nlp` | 自然语言处理 | 文本处理、NLP 任务 |
| `deep-learning` | 深度学习 | 神经网络基础架构、训练方法 |
| `machine-learning` | 机器学习 | 传统机器学习算法 |
| `math` | 数学基础 | 线性代数、概率统计 |
| `math-foundations` | 数学基础理论 | 信息论、凸优化等 |
| `devops` | 工程部署 | Docker、GPU 部署、环境配置 |
| `llm` | 大语言模型 | Transformer、LoRA、RAG 等 |
| `llm-fundamentals` | LLM 基础 | 大语言模型核心原理、架构 |
| `llm-application` | LLM 应用 | Prompt Engineering、RAG、Agent |
| `reinforcement-learning` | 强化学习 | 强化学习相关技术 |
| `data-processing` | 数据处理 | 数据预处理和清洗 |
| `data-engineering` | 数据工程 | NumPy、Pandas、数据管道 |
| `tools` | 工具相关 | 开发工具和框架 |
| `best-practices` | 最佳实践 | 开发规范和最佳实践 |
| `infrastructure` | 基础设施 | vLLM、Kubernetes、监控系统 |
| `deployment` | 模型部署 | ONNX、TensorRT 等 |
| `training` | 模型训练 | 分布式训练、MLOps |
| `evaluation` | 模型评估 | mAP、IoU、AUC 等评估指标 |
| `cs` | 计算机基础 | 算法、数据结构、操作系统、计算机网络 |
| `embedded` | 嵌入式开发 | C语言、RTOS、驱动开发、裸机编程 |
| `electronics` | 电子电路 | 电路基础、信号系统、DSP、FPGA |
| `signals` | 通信信号 | 通信原理、无线通信、网络协议 |
| `control` | 自动化控制 | PID控制、现代控制理论、ROS、工业物联网 |
| `electrical` | 电气工程 | 电机控制、电力电子、PLC编程 |
| `uncategorized` | 未分类 | 未分类的其他主题 |

### 数据验证系统

项目提供统一的数据验证器 `lib/content-validator.ts`，用于验证所有内容数据是否符合规范。

**验证命令**:
```bash
npm run validate-content
```

**验证函数**:
- `validateIntel(data)` - 验证情报数据
- `validateTerm(data)` - 验证术语数据（支持 GlossaryTerm 和 TermIndex 格式）
- `validateTool(data)` - 验证工具数据
- `validatePitfall(data)` - 验证踩坑数据

---

## 内容模块详解

### 1. 情报模块 (Intel)

#### 文件格式
- 路径: `content/intel/*.md`
- 格式: Markdown with YAML frontmatter

#### Frontmatter 字段定义

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 卡片标题 |
| `category` | string | ✅ | 分类 slug |
| `keywords` | string[] | ✅ | 关键词列表 |
| `difficulty` | string | ✅ | 难度等级 |
| `duration` | string | ✅ | 预计学习时长 |
| `summary` | string | ✅ | 一句话概要 |
| `takeaways` | string[] | ❌ | 你将学到什么 |

#### 分类 Slug 列表

情报模块使用 `ContentCategory` 枚举中的所有分类值，常用分类包括：

| Slug | 说明 |
|------|------|
| `deep-learning` | 深度学习 |
| `llm` | 大语言模型 |
| `llm-fundamentals` | LLM 基础 |
| `llm-application` | LLM 应用 |
| `computer-vision` | 计算机视觉 |
| `devops` | DevOps |
| `infrastructure` | 基础设施 |
| `tools` | 开发工具 |
| `data-engineering` | 数据工程 |
| `deployment` | 模型部署 |
| `training` | 模型训练 |
| `evaluation` | 模型评估 |
| `math-foundations` | 数学基础 |
| `cs` | 计算机基础 |
| `embedded` | 嵌入式开发 |
| `electronics` | 电子电路 |
| `signals` | 通信信号 |
| `control` | 自动化控制 |
| `electrical` | 电气工程 |

#### 正文章节规范

1. **为什么你要学它** - 动机说明
2. **一句话概览（快速版）** - 核心要点
3. **核心拆解** - 含 `### 🔑` 标记的核心知识点
4. **完整跑通方案** - 代码实操
5. **常见误区** - 纠错
6. **推荐学习顺序** - 学习路径

---

### 2. 术语模块 (Glossary)

#### 文件格式
- 索引: `content/glossary/terms.json`
- 详情: `content/glossary/terms/*.md`（可选）

#### terms.json 字段定义

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `term` | string | ✅ | 术语英文名 |
| `slug` | string | ✅ | URL 友好标识 |
| `definition` | string | ✅ | 术语定义 |
| `category` | string | ✅ | 分类 |
| `relatedTerms` | string[] | ✅ | 关联术语 |

#### 分类列表

术语模块使用 `ContentCategory` 枚举中的分类值：

| Slug | 说明 |
|------|------|
| `computer-vision` | 计算机视觉 |
| `llm` | 大语言模型 |
| `infrastructure` | 基础设施 |
| `math` | 数学基础 |
| `deployment` | 模型部署 |
| `devops` | 工程部署 |

---

### 3. 踩坑模块 (Pitfall)

#### 文件格式
- 路径: `content/pitfall/pitfalls.json`
- 格式: JSON 数组

#### 字段定义

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 问题标题 |
| `category` | string | ✅ | 问题类别 |
| `symptoms` | string[] | ✅ | 症状列表 |
| `solution` | string[] | ✅ | 解决方案 |
| `quickFix` | string | ❌ | 快速修复 |
| `tags` | string[] | ✅ | 标签列表 |

#### 分类列表

| 分类 | 说明 |
|------|------|
| `环境配置` | 环境安装和配置问题 |
| `训练` | 模型训练相关问题 |
| `部署` | 模型部署相关问题 |
| `数据处理` | 数据预处理问题 |
| `开发协作` | 开发协作问题 |
| `LLM` | 大语言模型相关问题 |

---

### 4. 工具箱模块 (Toolbox)

#### 文件格式
- 路径: `content/toolbox/tools.json`
- 格式: JSON 对象（含 tools 和 scenarios 数组）

#### tools 字段定义

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | ✅ | 工具名称 |
| `category` | string | ✅ | 工具分类 |
| `purpose` | string | ✅ | 用途说明 |
| `install` | string | ✅ | 安装命令 |
| `features` | string[] | ✅ | 核心特性 |
| `tags` | string[] | ✅ | 标签列表 |
| `github` | object | ✅ | GitHub 信息 |
| `difficulty` | string | ✅ | 难度等级 |
| `official_url` | string | ✅ | 官方文档 |
| `use_cases` | string[] | ✅ | 使用场景 |
| `relatedIntel` | string[] | ❌ | 关联情报 |
| `relatedNodes` | string[] | ❌ | 关联节点 |
| `relatedTerms` | string[] | ❌ | 关联术语 |

#### scenarios 字段定义

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `key` | string | ✅ | 场景标识 |
| `label` | string | ✅ | 显示名称 |
| `description` | string | ✅ | 场景描述 |
| `tool_names` | string[] | ✅ | 推荐工具 |

---

## 难度等级定义

| 值 | 说明 | 适用人群 |
|------|------|------|
| `beginner` | 入门 | 零基础或刚接触 |
| `intermediate` | 中级 | 有基础经验 |
| `advanced` | 高级 | 深入研究者 |

---

## 关联关系维护

### 跨模块引用规则

- **情报 → 路线图节点**: 在情报正文中通过链接引用
- **工具 → 情报**: 使用 `relatedIntel` 字段
- **工具 → 路线图节点**: 使用 `relatedNodes` 字段
- **工具 → 术语**: 使用 `relatedTerms` 字段
- **术语 → 术语**: 使用 `relatedTerms` 字段互相引用

### ID 命名规范

| 类型 | 格式 | 示例 |
|------|------|------|
| 情报 slug | `{序号}-{技术名称}` | `001-transformer` |
| 术语 slug | `{英文术语名}` | `chain-of-thought` |
| 路线图节点 | `{方向}-{技术名称}` | `cv-cnn` |

---

## 内容质量检查清单

### 添加新情报时

- [ ] 必填字段已全部填写
- [ ] category 使用正确的 slug
- [ ] difficulty 使用枚举值
- [ ] summary 简洁明了
- [ ] 正文包含所有必要章节
- [ ] 代码示例可运行

### 添加新术语时

- [ ] term 使用英文
- [ ] slug 使用 kebab-case
- [ ] definition 完整准确
- [ ] relatedTerms 使用正确的 slug

### 添加踩坑记录时

- [ ] symptoms 包含错误信息
- [ ] solution 步骤清晰
- [ ] quickFix 简洁有效

### 添加工具时

- [ ] github 信息完整
- [ ] install 命令正确
- [ ] 关联关系正确维护

---

## 扩展新方向指南

当需要添加新的技术方向时：

1. **情报分类**: 在 `lib/intel-meta.ts` 中添加新的 category
2. **术语分类**: 在 `lib/glossary.ts` 中添加新的 category
3. **路线图节点**: 在 `lib/roadmap-data.ts` 中添加新的 track 和 node
4. **工具分类**: 在 `content/toolbox/tools.json` 中使用新的 category

### 新方向模板

```yaml
# 情报模板（新方向）
---
title: [技术名称]
category: [新方向slug]
keywords: [关键词]
difficulty: [等级]
duration: [时长]
summary: [概要]
---
```
