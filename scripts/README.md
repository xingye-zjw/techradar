# TechRadar 脚本目录索引（scripts/）

> **⚠️ 锚点脚本 / 禁止移动**
>
> 以下 3 个文件**必须永久留在 `scripts/` 根目录**，移动会导致 CI / 构建 / 脚本导入链直接断裂：
>
> | 文件 | 锚点来源 | 作用 |
> |------|----------|------|
> | `prebuild-search-index.mjs` | `package.json` → `scripts.prebuild`（`tsx scripts/prebuild-search-index.mjs`） | 构建时如果 `public/search-index.json` 不存在，自动从 content 重新生成搜索索引 |
> | `audit-content3.py` | `.github/workflows/ci.yml` 第 37 行（`python scripts/audit-content3.py`） | CI `content-audit` Job 的非阻塞内容质量审计入口 |
> | `config.py` | 目录下**90+ 个 Python 脚本直接 `import config` / `from config import ...`** | 所有 Python 脚本共享的配置常量（路径、分类列表等），需始终在 Python import 搜索路径的 `scripts/` 根 |
>
> 其余脚本如果是 `python scripts/xxx.py` 方式调用，`config.py` 在根、脚本在子目录时会 ImportError——因此**本次整理采用「文件名前缀 + 本文档索引」的软分类，不再做物理移动**。
>
> `scripts/_deprecated/` 存放已确认过时 / 重名 / 临时命名的历史脚本，保留但不建议继续使用。

---

## 目录结构

```
scripts/
├── prebuild-search-index.mjs   # 锚点 1：构建期索引重建（CI）
├── audit-content3.py           # 锚点 2：CI 内容审计入口
├── config.py                   # 锚点 3：Python 全局配置（所有脚本 import）
├── README.md                   # 本索引文件
├── README_AUDIT.md             # 脚本级审计报告（audit-content3 详细说明）
│
├── 📁 reports/                 # 审计输出 CSV（audit-content3.py 生成）
│   ├── audit3-nocode-intel.csv
│   ├── audit3-orphan-relations.csv
│   ├── audit3-pitfall-missing-prevention.csv
│   └── audit3-short-intel.csv
│
└── 📁 _deprecated/             # 过时/临时/重名脚本留档（5 个，不在下表分类里）
```

---

## 脚本分类索引

### 🔍 1. 审计类（audit / check / verify / quality）—— 17 个
> 用途：**只读不写**，用于 CI / 本地检查内容结构、引用关系、格式规范、覆盖度。

| 前缀匹配 | 文件名 | 说明 |
|----------|--------|------|
| audit-* | `audit-content.py` / `audit-content2.py` | 早期内容审计 v1 / v2（保留对比，**CI 实际使用 `audit-content3.py`**）|
| audit3-* | `audit3-patch.py` | 针对 audit-content3.py 发现的问题批量补正 |
| accurate-* | `accurate-check.py` | 高精度完整性核查 |
| check-* | `check-all-days.py` | 路线图全节点 × 全 day 检查 |
| | `check-basic-days.py` | 基础 day 生成覆盖检查 |
| | `check-constants.py` | **重要**：检查 `NODE_NAMES` / `INTEL_LINKS` 等常量 vs 实际文件数量一致性（推荐 commit 前跑）|
| | `check-days.py` | day 填充进度检查 |
| | `check-intel.py` | 187 篇 intel frontmatter / 正文质量检查 |
| | `check-learning-paths.py` | 学习路径定义完整性 |
| | `check-partial.py` | 局部路线图节点抽检 |
| | `check-prereqs.py` | 节点前置关系合法性（DAG 无环校验） |
| | `check-relations.py` | 跨模块引用关系（tools ↔ intel ↔ nodes）完整性 |
| | `check-resource-types.py` | 资源类型字段合规性 |
| | `check-resources.py` | 路线图节点 resources 字段检查 |
| | `check-target-nodes.py` | 目标节点定义检查 |
| | `check-task-format.py` | 任务列表格式检查 |
| | `check-top-resources.py` | 常用工具/资源链接有效性 |
| content-* | `content-quality-check.py` | 内容质量结构化检查（frontmatter、长度、引用） |
| full-* | `full-check-days.py` | 路线图全量 day 深度检查（比 check-all-days 更全） |
| verify-* | `verify-days.py` | day 条目最终一致性校验 |

---

### 🔧 2. 修复类（fix / normalize / migrate / _hotfix / _fix_all_ / _debug_）—— 27 个
> 用途：**会改写 content / lib 文件**，用于修正已审计出的格式 / 引用 / 命名问题。
>
> ⚠️ 执行前：先 commit 当前状态；执行后：跑 `check-constants.py` + `vitest run`。

| 前缀匹配 | 文件名 | 说明 |
|----------|--------|------|
| _fix_all_* | `_fix_all_yaml_and_renumber_v2.py` | **全局 YAML 修复 v2**：158 篇 intel frontmatter 680 个字段的数组格式重写 + 旧 slug 全局替换（2026-07 P0 清理使用，幂等） |
| _hotfix_* | `_hotfix_intel_related.cjs` | Node 版 hotfix：批量修正 intel 相关引用 |
| | `_hotfix_pitfall_tags.cjs` | Node 版 hotfix：pitfall 类 intel 打标签 |
| _debug_* | `_debug_missing_pitfall_tags.cjs` | 缺失 pitfall 标签调试脚本 |
| fix-1* | `fix-140-162-summary.py` | 针对 140~162 号 pitfall intel 的 summary 字段补正 |
| fix-* | `fix-deep-dive-colon.py` | 统一 deep-dive 列表冒号格式 |
| | `fix-elec-pcb-duplicate.py` | 去除电子/PCB 方向重复内容 |
| | `fix-empty-related-terms.py` | 空 relatedTerms 清理 / 补正 |
| | `fix-glossary-orphans.py` | 术语库孤立引用清理 |
| | `fix-llm-content-format.py` | LLM 类 intel 正文格式统一 |
| | `fix-missing-days.py` | 路线图缺失 day 条目自动补模板 |
| | `fix-multiline.py` / `fix-multiline2.py` | frontmatter 多行字符串格式修复（v2 在 _deprecated/） |
| | `fix-node-level-resources.py` | 按 node 级别重排 resources 字段 |
| | `fix-pitfall-frontmatter.py` | pitfall 类 intel frontmatter 标准化 |
| | `fix-prereqs.py` | 路线图 prerequisites 环修复 |
| | `fix-resource-types.py` / `fix-resource-types2.py` | 资源类型规范化（v2 移到 _deprecated/）|
| | `fix-resources-and-prereqs.py` | 一次性：resources + prereqs 联合修正 |
| | `fix-review-issues.py` | 代码审查 / 内容审查反馈批量修复 |
| normalize-* | `normalize-tags.py` | 统一 intel tags 命名（去重 / 大小写 / 同义词合并） |
| | `normalize-tool-refs.py` | 工具箱 tool-id 引用规范化 |
| migrate-* | `migrate-categories.py` | ContentCategory slug 大规模迁移映射 |
| | `migrate-pitfalls-to-intel.py` | 2026-06 从旧 `content/pitfall/pitfalls.json` 迁移到 `content/intel/*.md` 的脚本（迁移已完成，保留作审计证明） |

---

### 📥 3. 填充类（fill-*）—— 25 个
> 用途：**项目建设期批量生成路线图 day 内容**，按 sprint 批次分档，基本幂等（已填充内容不改写）。新项目直接参考 `fill-batch14` 的格式即可，不再需要跑旧批次。

| 分组 | 文件名 | 覆盖方向 |
|------|--------|----------|
| 基础批 | `fill-batch1.py` ~ `fill-batch14.py`（14 个） | 2026-06 路线图 14 批节点 day 填充 |
| 方向专批 | `fill-llm-empty.py` / `fill-llm-localrag.py` / `fill-llm-localrag2.py` | LLM 方向（含本地 RAG 专题）|
| | `fill-nlp-days.py` / `fill-mt-days.py` / `fill-sentiment-days.py` / `fill-seq-labeling-days.py` | NLP / 机器翻译 / 情感分析 / 序列标注 |
| | `fill-cicd-days.py` / `fill-basic-part1.py` / `fill-remaining-days.py` | DevOps / 基础批 / 最终兜底剩余未填充 |

---

### ➕ 4. 生成 / 新增类（add-* / generate-* / expand-* / ensure-*）—— 12 个
> 用途：**新增数据条目**（不是修改已有），用于 roadmap 节点、工具箱、关系网络的增量构建。

| 前缀匹配 | 文件名 | 说明 |
|----------|--------|------|
| add-* | `add-missing-relations.py` | 缺失的 intel ↔ node 关系自动补填 |
| | `add-missing-resource-types.py` | 工具箱缺失资源类型字段补填 |
| | `add-nlp-nodes.py` / `add_nlp_nodes.py`（*注 1*） | NLP 方向路线图节点批量追加 |
| | `add-related-nodes.py` | 基于关键词相似度自动推荐 relatedNodes |
| | `add-suggestions.py` | 首页 / 路线图推荐位数据生成 |
| | `add-tools.py` | 工具箱新工具批量导入 |
| | `add-track-nodes.py` | 按 Track 模板批量创建 roadmap 节点骨架 |
| generate-* | `generate-relations.py` | 基于全文匹配自动生成跨模块引用关系 |
| | `generate-tool-mapping.py` | tool id → intel slug / roadmap node id 映射表生成 |
| expand-* | `expand-descriptions.py` | 路线图节点短描述 → 长描述扩充 |
| ensure-* | `ensure-tool-github.py` | 工具箱条目的 GitHub 仓库链接缺失检查与补填 |

> **注 1**：`add_nlp_nodes.py` 下划线版已移到 `scripts/_deprecated/`，当前应使用 `add-nlp-nodes.py`（短横线命名）。

---

### 📊 5. 分析 / 调试类（analyze-* / list-* / find-* / debug-* / temp-* / track-*）—— 12 个
> 用途：**只读不写**，输出统计、分布、缺失清单等人工可读性信息，辅助 Sprint 规划。

| 前缀匹配 | 文件名 | 说明 |
|----------|--------|------|
| analyze-* | `analyze-categories.py` | ContentCategory 分布统计饼图数据 |
| | `analyze-project.py` | 项目总体健康度统计（intel/pitfall/terms/tools 覆盖） |
| | `analyze-relations.py` | 跨模块关系网络密度 / 孤立节点分析 |
| | `analyze-roadmap-size.py` | 路线图节点 × day 条目数矩阵 |
| | `analyze-tags.py` | intel tags 频次 / 同义词聚类 |
| list-* | `list-missing-relations.py` | 缺失 relatedXxx 字段的条目清单 |
| | `list-track-nodes.py` | Track → 节点 ID → 标题明细导出 |
| find-* | `find-last-day.py` | 每条路线图最大 day 序号定位（用于决定新内容编号起点）|
| | `find-track-nodes.py` | 按关键词检索 track 节点 |
| debug-* | `debug-suggestions.py` | 首页推荐算法结果对比调试 |
| temp-* | `temp-check-desc.py`（*注 2*）| 临时描述检查（在 _deprecated/）|
| track-* | `track-check.py` | Track 定义数据结构一致性检查 |

> **注 2**：`temp-*` 脚本是一次性调试产物，使用完即移入 `_deprecated/`，**不要在自动化流程中引用**。

---

### 🗺️ 6. 路线图专项类（update / prebuild / track-check 中已列）
剩余非脚本：
- `track-check.py`：见 5 类
- `update-node-refs.py`（*实际归入 2 类 fix-* 旁系*）：路线图节点 ID 变更时的全局引用重写
- `prebuild-search-index.mjs`：**锚点脚本**，见顶部

---

## 推荐使用流程（新建 Sprint 前）

```bash
# 1) 先跑审计 → 知道当前问题有哪些
python scripts/audit-content3.py                       # CI 同口径非阻塞审计
python scripts/check-constants.py                      # 常量 ↔ 文件 对齐（阻塞级）

# 2) 分析类：看缺口在哪
python scripts/analyze-project.py                      # 总体覆盖率
python scripts/list-missing-relations.py               # 关系缺口清单
python scripts/find-last-day.py                        # 路线图下一批 day 编号

# 3) 按需跑修复（执行前先 git commit 保存快照）
python scripts/fix-empty-related-terms.py              # 补空字段
python scripts/normalize-tags.py                       # 标签规范化

# 4) 最终核验（提交前必跑，与 CI 一致）
npm run lint:ci && npx vitest run && npm run build     # Lint + Test + Build 硬门禁
```

## 命名公约（新增脚本时遵守）

| 前缀 | 是否写文件 | 推荐放哪一类 |
|------|------------|-------------|
| `check-*` / `verify-*` / `audit-*` / `analyze-*` / `list-*` / `find-*` / `debug-*` | ❌ 只读 | 1 审计类 或 5 分析类 |
| `fix-*` / `normalize-*` / `migrate-*` / `update-*` | ✅ 改已有 | 2 修复类 |
| `add-*` / `generate-*` / `expand-*` / `ensure-*` / `fill-*` | ✅ 新增数据 | 3 填充类 或 4 生成类 |
| `_hotfix_*` / `_fix_all_*` | ✅ 全局大改 | 2 修复类（命名加下划线，一眼识别风险）|
| `temp-*` / `debug-*` | 不定 | 5 分析类，用完移入 `scripts/_deprecated/` |

---

## 废弃脚本清单（scripts/_deprecated/，保留留档不使用）

| 文件名 | 废弃原因 | 替代方案 |
|--------|----------|----------|
| `add_nlp_nodes.py` | 与 `add-nlp-nodes.py` 功能完全重复，下划线命名违反公约 | `scripts/add-nlp-nodes.py` |
| `_hotfix_yaml_relatedIntel_syntax.cp.py` | `.cp.py` = 临时 copy 产物，被 `_fix_all_yaml_and_renumber_v2.py` 全面替代 | `scripts/_fix_all_yaml_and_renumber_v2.py` |
| `temp-check-desc.py` | `temp-` 前缀 = 一次性检查，已完成 | 无（保留作参考）|
| `fix-resource-types2.py` | v2 超集版未实际落地，与 `fix-resource-types.py` 重复 | `scripts/fix-resource-types.py` |
| `fix-multiline2.py` | 与 `fix-multiline.py` 功能重复，v2 未验证 | `scripts/fix-multiline.py` |

> 任何 `scripts/_deprecated/` 里的脚本，**3 个连续 Sprint 没人用** → 可以直接删除并在 commit message 中注明清理原因。
