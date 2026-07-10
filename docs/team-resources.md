# 团队资源配置情况

> 版本：v1.0 · 2026-07-10
> 输入前提：用户选型 = 4-6 人小队 × ~20h/人/周；LLM/CV 方向优先；8 周周期

---

## 1. 角色定义与总编制（RACI 表）

### 1.1 最小配置（4 人，最开始两周可能使用）

| 角色 | 人/周工时 | 职责 | 人选能力画像 |
|---|---|---|---|
| **R1：技术负责人 / Tech Lead（TL）** | 1 × 20h | 架构决策、PR 审核、引用注册表维护、Sprint 规划、风险协调 | 3y+ Full-Stack，熟悉 TS/Py/Markdown 内容管道，有开源项目维护经验 |
| **R2：前端工程师（FE）** | 1 × 20h | CI/脚本辅助、组件/路由扩展、数据层 helpers、Vitest 扩展、PWA/搜索优化 | 2y+ Next.js App Router / TS / Tailwind；会 Python 加分 |
| **R3：内容编辑 A（LLM 方向 Owner）** | 1 × 20h | LLM 主线 17 篇新增 + 10 篇 pitfall + 14 术语 + 关联优化 A 档 10 篇 | 有 LLM 应用开发/微调经验；中文写作表达清晰；会查论文/文档 |
| **R4：内容编辑 B（CV + 嵌入式 Owner）** | 1 × 20h | CV 13 + 嵌入式 7 篇新增 + 13 篇 pitfall + 21 术语 + 关联优化 A/B 档 30 篇 | CV/机器人/嵌入式背景；动手跑过 CV 模型与 STM32/ROS2 |

### 1.2 推荐配置（6 人，第 3 周起应达到，保障并行度上限）

新增两个角色：

| 角色 | 人/周工时 | 职责 |
|---|---|---|
| **R5：QA / 内容审核员（QA）** | 1 × 20h | 内容质量 checklist 审核、交叉引用完整性审核、运行测试 / 跑审计脚本、维护 bug 清单、协助 Sprint Demo 记录 |
| **R6：内容编辑 C（工程部署 + 跨方向补位）** | 1 × 20h | DevOps/Cross 3 篇新增 + 7 pitfall + 5 术语 + 工具箱完善 70 款（补齐 TOOL_IDS + related* 字段 + Scenarios）；协助 R3/R4 的 B/C 档优化；Practice 5 项目编写 |

### 1.3 RACI 责任矩阵（关键决策 / 产出物）

| 工作项 | TL(R1) | FE(R2) | 内容 A(R3) | 内容 B(R4) | QA(R5) | 内容 C(R6) |
|---|---|---|---|---|---|---|
| 内容选题/大纲确认 | **R/A** | C | **R/A** | **R/A** | I | C |
| 新增 Intel .md 提交 | I | I | **R** | **R** | I | R |
| Pitfall .md 提交 | I | I | R | R | I | **R** |
| 术语 terms.json + .md 提交 | I | I | R | R | I | **R** |
| Toolbox tools.json + TOOL_IDS | A | C | I | I | I | **R** |
| learning-paths.ts 新增路径 | **R** | C | C | C | I | I |
| constants.ts 注册表更新 | **R/A** | **R** | I | I | C | I |
| roadmap-data.ts 节点内容完善（如需） | A | **R** | C | C | I | I |
| 内容质量 check（人工 checklist） | A | I | C | C | **R/A** | C |
| 一致性脚本执行（check-*.py）| A | **R** | I | I | R | I |
| Vitest 新用例编写 | A | **R** | I | I | R | I |
| CI 流水线配置变更 | **R/A** | **R** | I | I | I | I |
| 架构 / 数据结构变更 | **R/A** | R | I | I | I | I |
| Practice 项目 JSON 编写 | A | C | C | C | I | **R** |
| Sprint 规划 / Demo / 回顾 | **R/A** | C | C | C | **R**（记录）| C |
| 生产部署验证（Cloudflare Pages） | **R/A** | **R** | I | I | R | I |

- R = Responsible（实际干活）; A = Accountable（最终拍板）; C = Consulted（被咨询）; I = Informed（被通知）

---

## 2. 总工时估算（按 8 周 × 推荐 6 人计算）

| 角色 | 单人 8 周工时 | 人数小计 | 小计工时 |
|---|---|---|---|
| Tech Lead | 160h | 1 | 160h |
| Frontend Engineer | 160h | 1 | 160h |
| Content A (LLM Owner) | 160h | 1 | 160h |
| Content B (CV+Embedded Owner) | 160h | 1 | 160h |
| QA / Content Auditor | 160h | 1 | 160h |
| Content C (Tool+Practice+Cross Owner) | 160h | 1 | 160h |
| **合计** | — | **6 人** | **≈ 960 人时** |

---

## 3. 各阶段人力分配比例（按 Sprint 1→4 演进）

> 每 2 周 1 个 Sprint = 4 Sprint；Sprint 0（第 0 周）= 1-2 天 P0 基线与计划确认

| 工作大类 | Sprint 0 (1-2d) | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 |
|---|---|---|---|---|---|
| P0 清理 + 脚手架 + 新模板 + 审计扩展 | 80% | 10% | 5% | — | — |
| 新增内容写作（40 intel + 30 pitfall + 40 术语） | — | 55% | 60% | 45% | 25% |
| 既有内容优化（A/B/C 档深度 + 交叉引用）| — | 25% | 25% | 40% | 55% |
| Toolbox 70 款完善 + Practice 5 个 | — | 10% | 15% | 20% | 25% |
| 学习路径、搜索/推荐等算法/前端增强 | — | 10% | 10% | 10% | 15% |
| 测试 / 审计 / Review 循环 / Bug 修复 | 20% | 30% | 30% | 35% | 45% |
| Demo / 回顾 / 文档 | — | 5% | 5% | 5% | 10% |

### 3.1 角色详细任务

**TL（R1）的核心 8 周任务：**
1. **每周一 1h Sprint Planning**：拆解下一周 20 个任务工单（按 Epic 下的 Story）
2. **每周 6-8 次 PR Review**：合并前对内容 + 代码双重把关，重点看引用不悬垂、YAML 格式
3. **每个 Sprint 前后各跑 1 次全量审计**（check-constants + audit-content3 + Vitest + TSC + lint:ci）→ 输出 reports/*.csv 给团队
4. **P0 基线（Sprint 0）**：确认 187 篇 intel 无物理重复 → 本文档形成后 1 天内完成
5. **风险协调**：与 R3/R4 协商落后工单，决定是否降为 C 档或借用 R6 补位

**FE（R2）的核心 8 周任务：**
1. **P0 脚手架**：新增 templates/ 对应的 Intel 200+/Pitfall 新 slug 段模板（给内容编辑直接复制）
2. **辅助脚本**：
   - `scripts/check-constants.py` 扩展：增加对新增 200+ 编号段的范围校验
   - `scripts/audit-content3.py` 扩展：字数 / 代码块 / 练习题章节 / 相关引用覆盖率 4 项新标准
   - `__tests__/lib/content-quality.test.ts`：扩展对 A 档 20 篇 intel 的字数 ≥ 4000 字断言
3. **新页面/功能（如需要）**：
   - `/intel` 列表页按 "新增 / 优化 / 全部" Tab 分流
   - `/pitfall` 专题分类标签云（10 个专题）
   - `/toolbox` 搜索框 + 场景 Tab（已准备好 scenarios 16 个数据，FE 侧小量加 hook）
4. **Sprint 4 前**：public/search-index.json 触发重生成（`prebuild-search-index.mjs`），Fuse 搜索覆盖 247 intel + 100 术语 + 70 tools + 103 pitfalls 全部可检索

**QA（R5）核心 8 周任务：**
1. **每 PR 人工 checklist 审核**（§8 的 10 项检查）
2. **每周跑一次「交叉引用完整性报告」**（scripts/check-relations.py + scripts/check-constants.py）
3. **每个 Sprint 结束输出一份「优化覆盖率报告」**：A 档 20 篇 100% 了没？relatedIntel/Terms/Nodes/Tools 四类平均数量曲线（做成折线图）
4. **Bug 跟踪表**：Notion / GitHub Project 维护 → 每个 bug 有 severity + owner + ETA

---

## 4. 协作约定（沟通 + 工具）

| 事项 | 机制 | 频率 |
|---|---|---|
| 日常沟通 | 飞书 / Slack / Discord（文字）+ 每周 2 次 15 分钟 standup | 每日文字异步；周二/周四 15' 短会 |
| Sprint Planning | 周一上午 1h：把 Backlog 拉取到 Sprint，每个 Story 估 1-5 点（1 点 = 2 小时）| 每 Sprint 一次 |
| Sprint Review + Demo | 每 Sprint 最后一个工作日下午 2h：全员直播演示 + 用户代表（可选）反馈 | 每 Sprint 一次 |
| Sprint Retro | Sprint Review 后 30 分钟：好的改进 + 问题复盘 + Action Items | 每 Sprint 一次 |
| PR 模板（新增） | `.github/PULL_REQUEST_TEMPLATE.md`：要求填写「改动范围 / 引用影响 / 是否跑了 audit / checklist」| 每次 PR |
| Issue 模板 | `.github/ISSUE_TEMPLATE/`：Bug Report / Feature Request / Content Proposal 三类 | 按需 |
| 工单管理 | GitHub Projects：按 Epic（内容 40+30+40+工具箱+优化+前端）→ Story → Task 分解 | 持续 |
| 命名规范 | 分支名：`<type>/<epic>-<short-desc>`，例：`feature/nllm01-flash-attention`、`fix/relatednodes-dangling-193` | 强制 |
| 提交信息 | Conventional Commits：`feat(content): add 200-diffusion-text-to-image intel`；修复前缀 `fix(content)/docs/test/chore` | Husky + commitlint（建议新增）|

---

## 5. 冲突避免机制（多人同时改同一份共享文件）

这是本项目并行的最大挑战。我们通过**分片锁定 + 双写过渡 + 注册表单一入口**三保险避免冲突：

### 5.1 按「文件分片」分配 Owner（绝大多数冲突天然消除）

| 共享文件 / 目录 | 唯一写入 Owner | 备注 |
|---|---|---|
| `content/intel/200-216-*.md`（LLM 17 篇）| R3 内容编辑 A | 其他只读；改别人文件需通过 PR 通知 owner |
| `content/intel/220-232-*.md` + `240-247-*.md` | R4 内容编辑 B | 同上 |
| `content/intel/250-252-*.md` + `content/intel/pitfall-*新30篇*.md` | R6 内容 C | 同上 |
| `content/intel/` 既有 **A 档优化（20 篇）** | 按 R3/R4 各一半分工（R3 做 LLM A 档 10 篇；R4 做 CV+嵌入式 A 档 10 篇） | 冲突概率低（每篇独立文件）|
| `content/intel/` 既有 **B 档优化（40 篇）** | R3 15 + R4 15 + R6 10 按方向分 | 同上 |
| `content/intel/` 既有 **C 档优化（54 篇）** | R3 20 + R4 20 + R6 14（Sprint 3 按需分）| 同上 |
| `content/glossary/terms.json` + `terms/*.md` | R6（Primary）+ R3/R4 提 PR | 每次只 append 新条目，不改已有 key；改已有 key 必须通知 R6 |
| `content/toolbox/tools.json` | R6（唯一写入） | 引用由 R6 反查后一次性批量写入 |
| `content/practice/projects.json` | R6（唯一写入） | 单文件，Sprint 3-4 集中写 |
| `lib/constants.ts` | R1 TL（**唯一写入**） | 其他人不得直接改；内容编辑通过 PR 附带新 slugs，TL 批量合并后 1 次性 append INTEL_LINKS/TOOL_IDS |
| `lib/roadmap-data.ts` / `lib/learning-paths.ts` | R2 FE 或 R1 TL | 变动概率低；如 R3/R4 有节点补充需求 → 走 RFC issue 由 R1 决定 |
| `lib/*-helpers.ts` 逻辑 / `components/` UI / `app/` 路由 | R2 FE | 其他角色不得直接改前端代码 |
| `__tests__/` 测试新增 / 扩展 | R2 FE + R5 QA | QA 提供期望输出，FE 写断言 |
| `scripts/` 审计脚本扩展 | R2 FE | R5 QA 提供期望 CSV 报告字段 |

### 5.2 冲突解决策略（万一还是发生了）

1. **Git merge conflict 出现在 constants.ts / tools.json**：R1 TL 裁决（因为 TL 是唯一写入 Owner），其他 PR 先 rebase 再提交
2. **同一篇 .md 被两个编辑同时改**：先提交 PR 的人自动 win，第二位 rebase 后在其上补充，QA 合并前核对两部分都齐了
3. **同一术语被两个人同时加 glossary**：比较 definition 完整度保留一份，另一份作为 relatedTerms 关联；并对重复提交者发送 notice 避免下次再犯
4. **严重冲突导致 Vitest 失败 / 构建失败**：TL 回滚到最后一个通过 commit，再逐个 cherry-pick 无冲突 commit；同时触发 30 分钟紧急 standup

### 5.3 双写过渡（仅对需要合并的大文件，如 terms.json）

- R3/R4 在各自分支添加术语时，**不直接改 terms.json**，而是先把术语暂存在「临时 terms YAML 草稿」（每人独立的 `drafts/terms-R3.yaml`），Sprint 2 结束由 R6 一次性合并到 terms.json，保证 8 周内不会有并行 merge conflict 出现在 terms.json（零冲突）。
