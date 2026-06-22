# TechRadar 内容模板使用说明

## 目录结构

```
templates/
├── intel/                    # 情报模板
│   └── template.md
├── glossary/                 # 术语模板
│   ├── terms.json.template
│   └── term-detail.md
├── pitfall/                  # 踩坑模板
│   └── pitfalls.json.template
├── toolbox/                  # 工具箱模板
│   └── tools.json.template
└── README.md                 # 本文件
```

## 使用方法

### 1. 添加新情报

1. 复制 `templates/intel/template.md` 到 `content/intel/`
2. 文件命名格式：`{序号}-{技术名称}.md`（如 `043-rag.md`）
3. 按照模板填写 frontmatter 和正文内容
4. 确保 category 使用正确的 slug（见下方分类列表）

### 2. 添加新术语

1. 在 `content/glossary/terms.json` 中添加新条目
2. 参考 `templates/glossary/terms.json.template` 格式
3. 可选：创建 `content/glossary/terms/{slug}.md` 添加详细释义

### 3. 添加踩坑记录

1. 在 `content/pitfall/pitfalls.json` 中添加新条目
2. 参考 `templates/pitfall/pitfalls.json.template` 格式

### 4. 添加工具推荐

1. 在 `content/toolbox/tools.json` 的 `tools` 数组中添加新条目
2. 参考 `templates/toolbox/tools.json.template` 格式
3. 可选：在 `scenarios` 数组中添加或更新场景

## 分类 Slug 列表

### 情报分类 (Intel Category)

| Slug | 说明 |
|------|------|
| `deep-learning` | 深度学习 |
| `llm` | 大模型（通用） |
| `llm-fundamentals` | LLM 基础（原理、架构） |
| `llm-application` | LLM 应用（Prompt、RAG、Agent） |
| `computer-vision` | 计算机视觉 |
| `devops` | 工程部署 |
| `infrastructure` | 基础设施 |
| `tools` | 开发工具 |
| `data-engineering` | 数据工程 |
| `deployment` | 模型部署 |
| `training` | 模型训练 |
| `evaluation` | 模型评估 |
| `math-foundations` | 数学基础 |

### 术语分类 (Glossary Category)

| Slug | 说明 |
|------|------|
| `cv` | 计算机视觉 |
| `llm` | 大语言模型 |
| `infrastructure` | 基础设施 |
| `math` | 数学基础 |
| `deployment` | 部署 |
| `ai-ml` | AI/ML 通用 |
| `project` | 项目管理 |

### 踩坑分类 (Pitfall Category)

| 分类 | 说明 |
|------|------|
| `环境配置` | 环境安装和配置问题 |
| `训练` | 模型训练相关问题 |
| `部署` | 模型部署相关问题 |
| `数据处理` | 数据预处理问题 |
| `开发协作` | 开发协作问题 |
| `LLM` | 大语言模型相关问题 |

### 难度等级 (Difficulty)

| 值 | 说明 |
|------|------|
| `beginner` | 入门 |
| `intermediate` | 中级 |
| `advanced` | 高级 |

## 关联关系维护

### 跨模块引用规则

- **情报 → 路线图节点**: 在情报正文中通过链接引用路线图节点
- **工具 → 情报**: 使用 `relatedIntel` 字段关联
- **工具 → 路线图节点**: 使用 `relatedNodes` 字段关联
- **工具 → 术语**: 使用 `relatedTerms` 字段关联
- **术语 → 术语**: 使用 `relatedTerms` 字段互相引用

### ID 命名规范

- **情报 slug**: `{序号}-{技术名称}`（如 `001-transformer`）
- **术语 slug**: `{英文术语名}`（如 `chain-of-thought`）
- **路线图节点 ID**: `{方向}-{技术名称}`（如 `cv-cnn`）

## 内容质量检查清单

添加新内容时，请确认：

- [ ] 必填字段已全部填写
- [ ] 字段格式符合规范（如 difficulty 使用枚举值）
- [ ] 关联关系正确（如 relatedIntel 使用正确的 slug）
- [ ] 内容无语法错误
- [ ] 代码示例可运行（如适用）
