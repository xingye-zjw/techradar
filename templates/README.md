# TechRadar 内容模板使用说明

## 目录结构

```
templates/
├── intel/                    # 情报模板（含 Pitfall 类情报）
│   └── template.md
├── glossary/                 # 术语模板
│   ├── terms.json.template
│   └── term-detail.md
├── toolbox/                  # 工具箱模板
│   └── tools.json.template
└── README.md                 # 本文件
```

## 使用方法

### 1. 添加新情报 / 踩坑记录

1. **统一使用 intel 模板**：自 `v0.1` 起 Pitfall 踩坑内容已合并到 `content/intel/`，不再使用独立 JSON 存储。
2. **普通情报**：复制 `templates/intel/template.md` 到 `content/intel/`，命名为 `{001~999 三位序号}-{技术名称}.md`（示例：`043-rag.md`）。
3. **踩坑类情报**：命名使用 `{序号}-pitfall-{主题}.md` 前缀（示例：`154-pitfall-git-merge-conflict-code-loss.md`），并在 frontmatter 的 `category` 字段填入合适的 Pitfall 子类（见下方 `Pitfall 分类`）。
4. 按照 `templates/intel/template.md` 的 frontmatter + 正文结构填写，必填字段：`title` / `slug` / `summary` / `category` / `difficulty` / `tags` / `takeaways`。
5. 确保 `category` 使用 `lib/content-types.ts` 中 `ContentCategory` 枚举内的合法 slug。

### 2. 添加新术语

1. 在 `content/glossary/terms.json` 中添加新条目
2. 参考 `templates/glossary/terms.json.template` 格式
3. 可选：创建 `content/glossary/terms/{slug}.md` 添加详细释义

### 3. 添加工具推荐

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
| `cs` | 计算机基础 |
| `embedded` | 嵌入式开发 |
| `electronics` | 电子电路 |
| `signals` | 通信信号 |
| `control` | 自动化控制 |
| `electrical` | 电气工程 |

### 路线图 Track 列表 (Roadmap Track)

| Slug | 说明 | 覆盖专业 |
|------|------|----------|
| `devops` | 工程部署 | 计算机技术 |
| `math` | 数学基础 | 所有专业 |
| `cs` | 计算机基础 | 计算机技术 |
| `embedded` | 嵌入式开发 | 电子信息工程 |
| `electronics` | 电子电路 | 电子信息工程 |
| `signals` | 通信信号 | 通信工程 |
| `control` | 自动化控制 | 自动化 |
| `electrical` | 电气工程 | 电气工程 |
| `cv` | 计算机视觉 | 计算机技术 |
| `nlp` | 自然语言处理 | 计算机技术 |
| `project` | 项目管理 | 所有专业 |

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

> **说明**：自 `v0.1` Pitfall 合并到 Intel 后，`category` 字段直接使用 `lib/content-types.ts` 中 `ContentCategory` 枚举的 **pitfall-* 英文 slug**（示例：`pitfall-dl-training`、`pitfall-hardware`）。下表是中文含义对照，用于选题时的参考：

| ContentCategory slug | 中文含义 |
|----------------------|----------|
| `pitfall-dl-training` | 训练 |
| `pitfall-gpu-cuda` | 环境配置（GPU/CUDA） |
| `pitfall-python` | 开发协作（Python/依赖） |
| `pitfall-docker` | 环境配置（Docker） |
| `pitfall-data-engineering` | 数据处理 |
| `pitfall-llm-app` | LLM |
| `pitfall-rag` | LLM（RAG 专题） |
| `pitfall-embedded` | 环境配置（嵌入式） |
| `pitfall-hardware` | 环境配置（硬件/驱动） |
| `pitfall-ops` | 部署（运维/服务器） |
| `pitfall-cv` | 训练（CV 专题） |
| `pitfall-nlp` | 训练（NLP 专题） |
| `pitfall-metrics` | 训练（指标/评估） |
| `pitfall-deployment` | 部署（模型上线） |
| `pitfall-security` | 开发协作（安全/权限） |
| `pitfall-git` | 开发协作（Git） |
| `pitfall-k8s` | 部署（K8s/容器） |
| `pitfall-db` | 数据处理（数据库） |
| `pitfall-network` | 部署（网络/通信） |
| `pitfall-rtos` | 环境配置（RTOS） |
| `pitfall-control` | 训练（控制/自动化专题） |
| `pitfall-circuit` | 环境配置（电路/硬件） |
| 其它 pitfall-* slug | 参考上方分类语义（如 `pitfall-rl` / `pitfall-gnn` / `pitfall-recsys` / `pitfall-speech` / `pitfall-time-series` / `pitfall-3d-cv` / `pitfall-automl` / `pitfall-microservice` / `pitfall-frontend` / `pitfall-algorithm` / `pitfall-project-mgmt` / `pitfall-interview`） |

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
