# TechRadar 现有模块清单 & 功能说明

> 版本：v1.0 · 2026-07-10
> 基线数据：基于 `techradar/` 当前 commit（content/intel 清理后 **187 篇有效情报卡片**，无物理重复）

---

## 1. 内容模块（Content Modules）

内容模块 = 项目的"数据资产"，所有页面渲染的底层来源。
所有模块共享同一个分类枚举：`ContentCategory`（13 类 + uncategorized），
共享同一个难度枚举：`Difficulty = beginner | intermediate | advanced`。

### 1.1 情报模块（Intel Cards）—— `content/intel/*.md`

- **数量**：**187 篇**（含 73 篇 `pitfall-*.md` 形式的"踩坑类情报"、114 篇标准技术情报）
- **格式**：Markdown + YAML Frontmatter
- **Frontmatter 字段（必填/可选）**：

| 字段 | 类型 | 必填 | 100% 合规率 | 作用 |
|---|---|---|---|---|
| `title` | string | ✅ | 100% | 卡片标题（INTEL_LINKS 注册表的 value） |
| `category` | `ContentCategory` | ✅ | 100% | 决定展示主题色（CATEGORY_COLORS） |
| `keywords` | `string[]` | ✅ | 95%+ | SEO 关键词 |
| `difficulty` | `Difficulty` | ✅ | 98% | 展示入门/进阶/高级徽章 |
| `duration` | string | ✅ | 100% | 建议学习时长（如 "2-3周"） |
| `summary` | string | ✅ | 100% | 卡片封面一句话描述（≤ 50 字建议） |
| `takeaways` | `string[]` | ❌ | ~96% | "你将学到什么" 核心要点 |
| `tags` | `string[]` | ✅(auto) | 100% | 标签/筛选；缺失时自动生成 |
| `relatedIntel` | `slug[]` | ❌ | ~80% | 前置/延伸阅读 |
| `relatedTerms` | `termSlug[]` | ❌ | ~70% | 术语悬浮提示 |
| `relatedNodes` | `nodeId[]` | ❌ | ~65% | 在 roadmap 中的定位 |
| `relatedTools` | `toolId[]` | ❌ | ~60% | 配套工具跳转 |
| `prerequisites` | `string[]` | ❌ | ~40% | 知识前置条件 |

- **加载入口**：[lib/intel.ts 中的 getAllIntelCards()](file:///D:/trae_match/techradar/lib/intel.ts#L17-L34)（模块级缓存，构建时只扫一次磁盘）
- **质量现状基线**：
  - 最短内容长度：≥ 800 字（content-quality.test.ts 强制）
  - 代码块率：每篇 ≥ 1 个 ``` (content-quality.test.ts 强制)
  - 字段级数组：`takeaways`/`relatedIntel` 等 YAML 数组已全部由"引用子弹串"→ 标准块序列（158 文件 v2 修复）

### 1.2 术语库（Glossary）—— `content/glossary/`

- **数量**：60 条术语（`terms.json` 全量）+ 60 篇深度拓展（`terms/*.md` 详情页）
- **索引文件**：`content/glossary/terms.json`（TermIndex[]，含 definition / category / relatedTerms / relatedIntel / relatedTools / relatedNodes 六维关联）
- **详情页**：`content/glossary/terms/<slug>.md` 可选；有 md 就渲染详情页，无 md 就用 JSON 简要页
- **加载入口**：[lib/glossary.ts](file:///D:/trae_match/techradar/lib/glossary.ts)
- **典型字段示例**：
  - `chain-of-thought` → category=`llm`，relatedTerms=`["self-attention","rag"]`，relatedIntel=`["020-prompt-engineering", "029-moe-mixture-of-experts"]`

### 1.3 踩坑避雷（Pitfall）—— 双源兼容（过渡期）

| 源 | 格式 | 数量 | 加载器 |
|---|---|---|---|
| ✅ **主源（推荐）**：`content/intel/pitfall-*.md` | Markdown + YAML，与 Intel 统一解析 | **73 篇**（090-162 + 174-182/190-198） | `intel.ts` |
| ⚠️ 兼容源（旧）：pitfall.json 数组 | JSON | N/A（已迁移，空目录删除） | `pitfall.ts`（仍保留代码，向后兼容） |

- **字段**：title / category / description / root_cause / symptoms / solution / quickFix / tags / prevention / relatedIntel / relatedNodes / relatedTerms / relatedTools
- **加载入口**：[lib/pitfall.ts](file:///D:/trae_match/techradar/lib/pitfall.ts) 合并返回两份源，去重

### 1.4 工具箱（Toolbox）—— `content/toolbox/tools.json`

- **数量**：**70 款工具** + 场景映射（scenarios）
- **结构**：`{ tools: Tool[], scenarios: ToolScenario[] }`
- **工具字段**：name / purpose / install / features[] / github{stars, last_release, url} / difficulty / official_url / use_cases[] / relatedIntel / relatedNodes / relatedTerms
- **加载入口**：[lib/toolbox.ts](file:///D:/trae_match/techradar/lib/toolbox.ts)
- **⚠️ 当前缺口（本轮优化目标之一）**：
  - `TOOL_IDS` 常量仅注册 **20/70**，导致 32 款工具的详情链接降级为纯文本 → 本轮补全到 100%
  - `relatedNodes` / `relatedTerms` / `relatedIntel` 双向引用平均覆盖率 < 50% → 本轮提到 ≥ 85%

### 1.5 实战项目（Practice）—— `content/practice/projects.json`

- **数量**：projects.json（由 PracticeProject 类型约束）
- **字段**：slug / title / category / difficulty 1-5 / duration / summary / prerequisites[] / objectives[] / projectStructure[] / steps[]（StepContent 含 objective / tasks[] / checkpoint / common_errors / codeBlocks）/ resources[] / relatedIntel / relatedTerms / relatedTools
- **加载入口**：[lib/practice.ts](file:///D:/trae_match/techradar/lib/practice.ts)
- **⚠️ 当前缺口**：项目数量少 → 本轮新增内容最后阶段配套 5 个项目

---

## 2. 学习路线图（Roadmap）—— 拓扑结构

- **主文件**：[lib/roadmap-data.ts](file:///D:/trae_match/techradar/lib/roadmap-data.ts)
- **配套辅助**：`lib/roadmap-data-helpers.ts` / `lib/roadmap-index.ts` / `lib/roadmap-index-client.ts` / `lib/learning-paths.ts`

### 2.1 12 条技术主线（TrackId）

| TrackId | 中文名称 | 节点数（≈）| 典型节点 |
|---|---|---|---|
| `cs` | 计算机基础 | 5 | cs-algo / cs-os / cs-network / cs-database |
| `embedded` | 嵌入式开发 | 6 | embedded-c / embedded-rtos / embedded-driver / embedded-hal / embedded-arduino |
| `electronics` | 电子电路 | 5 | elec-circuit / elec-components / elec-digital / elec-pcb / elec-power-systems |
| `signals` | 通信信号 | 5 | signals-basics / signals-filter-design / signals-dsp / signals-wireless / signals-comm |
| `control` | 自动化控制 | 5 | ctrl-pid / ctrl-state-space / ctrl-ros / ctrl-plc / ctrl-servo |
| `electrical` | 电气工程 | 4 | elec-motor / elec-safety + 电力电子/PLC |
| `cv` | 计算机视觉 | 7 | cv-cnn / cv-resnet / cv-yolo / cv-instance-segmentation / cv-pose-estimation / cv-ocr / cv-diffusion |
| `nlp` | 自然语言处理 | 5 | nlp-rnn + 序列标注 / 情感 / NER / Seq2Seq / LLM 基础 |
| `llm` | 大语言模型 | 9 | llm-finetune / llm-inference / llm-rag / llm-quantization / llm-agent / llm-security / llm-long-context / llm-eval / llm-synthetic-data |
| `devops` | 工程部署 | 6 | docker / kubernetes / mlflow / prometheus / gitops / linux-server |
| `math` | 数学基础 | 4 | math-linear-algebra / math-probability / math-tensor-ops + 优化 |
| `project` | 综合项目 | N/A | 关联实践项目而非节点 |

- **节点总数**：**68 个 RoadmapNode**（与 NODE_NAMES 双向 1:1，0 missing / 0 extra）
- **每个节点内置**：prerequisites[] → 依赖边自动构成 DAG；dailyTasks[] → 3-7 天学习任务；outcomes[] → 验收标准；suggestions → 学完推荐

---

## 3. 页面模块（App Router Pages）

| 路由路径 | 页面组件 | 功能说明 | 关键依赖 |
|---|---|---|---|
| `/` | `app/page.tsx` | 首页：精选路线图推荐 + 热门情报 + 快速入口 | `recommendations.ts` |
| `/roadmap` | `app/roadmap/page.tsx` + RoadmapGraph | 有向图可视化，点击节点显示详情 | @xyflow/react + dagre |
| `/roadmap/[node]/day/[day]` | 动态 DailyTask 页 | 当天学习任务、checkpoint、资源、进度同步 | progress.ts SSOT |
| `/intel` | `IntelListClient.tsx` | 卡片网格 + 分类/难度/标签筛选 | intel.ts getAllIntelCards |
| `/intel/[slug]` | `page.tsx` + `ReadingProgress.tsx` | 详情页：Markdown 渲染 + 术语悬浮 + 进度记录 | MarkdownRenderer / TermPopover |
| `/glossary` | 列表页 | 术语网格 + 搜索筛选 | glossary.ts getAllTerms |
| `/glossary/[slug]` | 详情页 | 术语定义 + 关联六维阅读 |  |
| `/pitfall` | `PitfallListClient.tsx` | 踩坑按分类筛选，根因+快速修复双视图 | pitfall.ts |
| `/toolbox` | `ToolboxClient.tsx` | 按场景（scenario）展示推荐工具 | toolbox.ts |
| `/toolbox/[id]` | 详情页 | 工具详情 + 配套项目/情报关联 |  |
| `/practice` | 项目列表页 | 难度/分类筛选项目卡片 | practice.ts |
| `/practice/[slug]` | 详情页 | StepCard 组件化展示步骤 | ProjectCard / StepCard |
| `/search` | `SearchPageClient.tsx` | 客户端模糊搜索（搜索索引 30KB 预构建） | Fuse.js search-index.json |
| `/sitemap.xml` + `/robots.txt` | 动态 | SEO | app/sitemap.ts / robots.ts |

---

## 4. 通用 UI 组件（components/）

| 组件 | 说明 |
|---|---|
| `Sidebar` | 左侧导航 + 进度概览 + 12 条 Track 切换 |
| `GlobalCommandPalette` | `Cmd+K` 全局快捷键：搜索 / 跳转 / 进度操作 |
| `ProgressOverview` | 当前已完成节点 / 天数热力图 |
| `ProgressSettings` | 数据导出（JSON）/ 导入 / 重置 |
| `TermPopover` / `TermTooltip` | 鼠标悬停术语时的一句话定义（无需跳转 glossary） |
| `MarkdownRenderer` | 支持代码高亮、术语自动链接、relatedIntel 卡片嵌入 |
| `FavoriteButton` | 收藏本地持久化 |
| `ShortcutsPanel` | 展示全部快捷键列表 |
| `RecentList` | 最近浏览的 10 篇内容 |
| `radar/RoadmapNode` | 节点显示难度/进度/主题色 |
| `practice/ProjectCard / StepCard / ResourceLink / DifficultyBadge` | 实战步骤 UI |

---

## 5. 核心 Lib 模块（lib/）—— 注册表/SSOT/算法

| 文件 | 功能 | 本轮状态 / 目标 |
|---|---|---|
| `content-types.ts` | ALL 类型 Single Source | 13 ContentCategory + 12 TrackId + Intel/Pitfall/Tool/Term/RoadmapNode 全覆盖 ✅ |
| `constants.ts` | INTEL_LINKS / NODE_NAMES / TOOL_IDS / CATEGORY_COLORS | 187/187 intel 注册 ✅；68/68 nodes 注册 ✅；**20/70 TOOL_IDS ⚠️需补齐** |
| `roadmap-data.ts` | 68 节点完整拓扑 | 已稳定 ✅ |
| `roadmap-index.ts` | 依赖拓扑排序 / 建议 / 锁定计算 | 已稳定 ✅ |
| `learning-paths.ts` | 预定义学习路径（CV/LLM/嵌入式入门路径） | 已有 3 条，本轮配套新增内容扩到 8 条 |
| `progress.ts` | 进度 SSOT（完成节点/天数 / 导入导出） | 已含 z-schema 校验（security.ts）✅ |
| `storage.ts` | IndexedDB + localStorage 封装 | 稳定 ✅ |
| `recommendations.ts` | 基于进度的下一步推荐 | 根据新增内容更新权重 |
| `security.ts` | 用户侧数据 zod 校验 / 脱敏 | 稳定 ✅ |
| `search.ts` + `search-helpers.tsx` | 搜索文档生成 + Fuse 选项 | 稳定 ✅（prebuild-search-index.mjs 预构建） |
| `intel-meta.ts` + `intel-tags.ts` | 标签 / 分类元数据辅助 | 与 constants.ts CATEGORY_COLORS 对齐 ✅ |
| `practice.ts` | 项目加载 | 稳定 ✅ |
| `terms.ts` + `terms.json` | 术语元数据（与 content/glossary/ 解耦） | 60 条稳定 ✅ |
| `content-validator.ts` | 数据运行时校验 | Zod schema 定义 ✅，调用入口脚本保留（路径随版本变更） |
| `layout.ts` | 通用布局辅助 | 稳定 ✅ |
| `markdown-utils.ts` | 文本处理 / 术语自动链接 | 稳定 ✅ |
| `utils.ts` | 公共函数（cn/clsx、时间格式化等） | 稳定 ✅ |
| `use-keyboard-shortcuts.ts` | 客户端快捷键 hook | 稳定 ✅ |
| `progress-export.ts` | 进度 JSON 导入导出序列化 | 稳定 ✅ |
| `recommendations-helpers.ts` | 推荐算法辅助 | 稳定 ✅ |
| `roadmap-data-helpers.ts` | 节点数据加工辅助 | 稳定 ✅ |
| `roadmap-index-client.ts` | 客户端侧的节点索引（不包含服务器端 fs） | 稳定 ✅ |

---

## 6. 测试模块（__tests__/）—— 15 文件 / 93 测试

| 测试文件 | 测试数 | 覆盖 |
|---|---|---|
| `lib/content-quality.test.ts` | 21 | 情报内容长度、代码块、必填字段等质量基线 |
| `optimizations/content-mini-sprint.test.ts` | 22 | 16 篇新增 Intel（9 篇 pitfall 迁移）存在性 + frontmatter 合规 |
| `optimizations/architecture.test.ts` | 2 | 架构不变式（禁止直接在客户端用 fs）|
| `optimizations/tooling-config.test.ts` | 5 | ESLint / Vitest / TS 配置一致性 |
| `optimizations/homepage-featured.test.ts` | 3 | 首页 featured 区数据不为空 |
| `optimizations/seo-sitemap.test.ts` | 4 | sitemap 生成条数正确 |
| `optimizations/frontend.test.ts` | 6 | 关键页面能渲染（node snapshot） |
| `optimizations/security.test.ts` | 8 | 进度 SSOT 拒绝非法数据注入 |
| `optimizations/ssot-storage-integrity.test.ts` | 4 | 进度/收藏导入导出 round-trip |
| `optimizations/q01-ssot-trackid.test.ts` | 3 | TrackId 常量一致性 |
| `optimizations/q02-splinter-storage.test.ts` | 3 | 旧 localStorage 格式迁移 |
| `optimizations/unified-progress-storage.test.ts` | 4 | DailyTask 后节点 completed=true 自动同步 |
| `optimizations/node-task-ssot.test.ts` | 2 | RoadmapNode → dailyTasks 一致性 |
| `optimizations/global-command-k.test.ts` | 2 | 快捷键注册表完整性 |
| `optimizations/u01-pwa-integrity.test.ts` | 4 | PWA manifest + sw.js 存在 |

**全量测试结果（2026-07-10 基线）**：93/93 全部通过 ✅（进度 schema 警告是测试故意注入非法数据的预期日志，非失败）

---

## 7. 审计/批处理脚本模块（scripts/）

按用途分类：

| 类别 | 代表性文件 | 本轮是否依赖 |
|---|---|---|
| 批量填充 | `fill-batchN.py`（N=1..14）、`fill-llm-*.py`、`fill-nlp-days.py` 等 | 参考，新增内容按相同套路 batch15/batch16/... |
| 内容审计 | `audit-content.py` / `audit-content2.py` / `audit-content3.py`、`content-quality-check.py`、`reports/` CSV 审计报表 | ✅ CI content-audit job 直接调用 audit-content3.py |
| 一致性检查 | `check-constants.py` / `check-relations.py` / `check-prereqs.py` / `check-learning-paths.py` / `check-resources.py` | ✅ 每个 Sprint 前人工跑 + PR 门禁可加 |
| 修复 / 迁移 | `fix-*.py`、`migrate-pitfalls-to-intel.py`、`migrate-categories.py`、`_hotfix_*.py`、`_fix_all_yaml_and_renumber_v2.py`（最新 v2）| 参考 |
| 预检 / 构建 | `prebuild-search-index.mjs`、`config.py` | ✅ CI build 阶段自动触发 |
