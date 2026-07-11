# 3 天极限并行冲刺：内容生产（S-CONTENT）+ 字体优化（S-FONT）零冲突方案

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Plan ID:** parallel-content-font-3day-sprint-2026-07-09
**Goal:** 在 3 个工作日内（2026-07-09 起）**并行完成**以下两个目标，**互不干扰、不产生任何 Git 合并冲突、不触发跨模块回归**：

1. **S-CONTENT（本对话）**：新增高价值技术内容（Intel/Pitfall/Glossary/Tool），同时修复现有内容的「红灯」质量问题（短篇幅、缺代码块、无 takeaways、关联孤儿、Pitfall 缺 prevention）；最终发布带搜索索引全量覆盖的交付包。
2. **S-FONT（另一对话）**：完成 Instrument Sans / JetBrains Mono 字体加载优化（local() fallback + display=swap + preconnect/dns-prefetch/preload 链路）。

**Architecture:** 利用**目录级天然不重叠**实现隔离；利用**时段拆分合并窗口**（上午 S-FONT / 下午 S-CONTENT）杜绝同时间段 main 写入竞争；利用**PR 标签双锁**（scope:content/no-font-touch 与 scope:font/no-content-touch）作为 CI 第一防线；类型/常量扩展与 UI 样式零交叉、唯一重叠文件 package.json 冻结双方均不改。

**Tech Stack (S-CONTENT only):** Markdown + YAML frontmatter (Intel/Pitfall/Glossary)、JSON (Toolbox/terms.json)、TypeScript (`lib/constants.ts` 末尾追加、不修改已有字段)、Python 3 (`scripts/audit-content3.py` — **新建**，不改现有 audit 脚本)、Vitest 11 个现有测试（**只新增用例、不修改断言阈值**）。

---

## Global Constraints（违反 = 立即打回，无例外）

1. **package.json 冻结**：双方对话在 3 天冲刺期间**禁止修改** `package.json`、`package-lock.json`、`tsconfig.json`、`next.config.js`（除非另一方签字同意，需在 PR 描述贴同意截图）。
2. **禁止跨目录修改**：见下一节「Cross-Session File Ownership」。每一条 PR 描述顶部必须贴 **"✅ 未触碰对方目录声明"** + 下方的自验命令输出。
3. **Roadmap 冻结**：`lib/roadmap-data.ts`（68 节点 / 774 学习日）在本次冲刺中**完全不碰**，不新增节点、不迁移 DailyTask 格式，降低风险。
4. **Storage SSOT 冻结**：`lib/storage.ts`、`lib/security.ts` 的 Schema 版本不递增，不改动 localStorage 字段。
5. **P0 插队仅用于 S-CONTENT T0-1 / T0-3**（常量扩展 + 审计脚本升级），其余 PR 一律按 FIFO。
6. **每条 PR ≤ 10 个新增 md 文件，或 ≤ 20 个存量 md 文件的修改**。超量 → 拆分。
7. **每日合并顺序**：先合完当日 S-FONT（上午 12:00 前）→ S-CONTENT 方 `git pull --rebase origin main` → 再开始下午内容 PR 提交。
8. **Day0 预优化基准（2026-07-09 19:30，方案 A 签字生效）**：以下 7 处变更在冲刺正式启动（Day1 T0）前已合入 main 并计划打 tag `v0.1.9-day0-baseline`，**不属于 S-FONT/S-CONTENT 任何一方的 sprint 期目录所有权约束**，双方后续 rebase 均以该 tag 为共同祖先，**sprint 期间禁止任何一方 revert/覆盖** 下列变更：
   - 🟣 `package.json` / `package-lock.json`：6 处 devDependencies 版本锁（@next/eslint-plugin-next ^14.2.35；lint-staged ^17.0.8；prettier ^3.3.3；zod ^3.23.8；eslint-config-prettier ^9.1.0；eslint-plugin-prettier ^5.2.1）
   - 🟡 `app/layout.tsx`：3 行字体 `<link>`（preconnect / dns-prefetch / preload as=style）
   - 🔵 `lib/storage.ts#L310-L314`：`importProgressFromJSON` 入口 `text.length > 500_000` 上限校验
   - 🔵 `lib/security.ts#L182-L260`：新增 `checkObjectDepth(obj, max=10)`（WeakSet + DFS）+ `isDangerousHtmlAttribute` 8 项黑名单扩展（**不改 Schema 版本/字段结构**，仅新增逻辑）
   - 🔵 `public/_headers#L7-L8`：CSP 拆为 Report-Only 行（保留策略+report-uri 观察） + Enforce 行（移除 `'unsafe-eval'`，保留 `'unsafe-inline'` 静态导出必需）
   - 🟣 `.github/workflows/ci.yml`（新增 37 行）：双 Job（`ci` = lint+test+build 10min 超时；`content-audit` = audit*.py continue-on-error）
   - 🟣 `scripts/README_AUDIT.md`（新增 132 行）：95 脚本三态分类（active 33 / one-time-fill 43 / audit-check 19）
   - 🔵 `__tests__/optimizations/security.test.ts`：纯追加 `S-02 进度导入加固` describe 块（2 个新用例，不改已有断言阈值）
     **Sprint 期间 Day0 变更发现 bug 的修复流程**：由责任方（执行三流水线 session）提交分支前缀 `day0-hotfix/<task>` 的 PR，标注标签 `priority/P0 + scope:day0-baseline`，避开 S-FONT（上午）/ S-CONTENT（下午）专属合并窗口，由另一方 1 人签字 review 后合入。

---

## Cross-Session File Ownership（零冲突地基，双方签署执行）

| 维度                   | S-FONT（另一对话：字体优化）                                                                                                                            | S-CONTENT（本对话：内容生产）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **允许修改**（✅）     | `app/layout.tsx`<br>`app/globals.css`<br>`tailwind.config.ts`<br>`components/**/*.tsx`（纯样式，不含逻辑改动）<br>`public/fonts/**`（如有新增字体文件） | `content/intel/*.md`（新增 + 红灯修复）<br>`content/glossary/**`（terms.json + terms/*.md 新增/追加）<br>`content/toolbox/tools.json`（末尾追加工具）<br>`content/practice/projects.json`（末尾追加）<br>`lib/constants.ts`（**末尾追加** INTEL_LINKS / TOOL_IDS / NODE_NAMES，不改已有行）<br>`lib/content-types.ts`（仅可追加类型，**不改已有字段**）<br>`scripts/audit-content3.py`（**新建**）<br>`__tests__/**`（仅新增测试文件，不改已有断言阈值）<br>`public/search-index.json`（D3 发布前 force 重搜一次覆盖写入） |
| **禁止触碰**（🚫）     | `content/**`<br>`lib/constants.ts`<br>`lib/content-types.ts`<br>`lib/roadmap-data.ts`<br>`scripts/*.py`<br>`__tests__/**`<br>`public/search-index.json` | `app/layout.tsx`<br>`app/globals.css`<br>`tailwind.config.ts`<br>`components/**/*.tsx`<br>`next.config.js`<br>`lib/storage.ts`<br>`lib/security.ts`<br>`lib/roadmap-data.ts`<br>`scripts/audit-content.py`<br>`scripts/audit-content2.py`                                                                                                                                                                                                                                                                                  |
| **共享（但本次冻结）** | `package.json`、`package-lock.json`、`tsconfig.json`、`next.config.js`、`.nvmrc`、`.lintstagedrc.json`                                                  | 同左 → 双方都不改                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

### 目录冲突自验命令（每条 PR 前必须跑）

```powershell
# PowerShell 单条执行，粘贴输出到 PR 描述顶部
$fontProhibited = @('content','lib/constants.ts','lib/content-types.ts','lib/roadmap-data.ts','scripts','__tests__','public/search-index.json')
$contentProhibited = @('app/layout.tsx','app/globals.css','tailwind.config.ts','components','next.config.js','lib/storage.ts','lib/security.ts')
function Check-Scope($tag, $list) { $hits = @(); foreach ($p in $list) { if (Test-Path $p) { $changed = git diff --name-only HEAD...origin/main | Where-Object { $_ -like "$p*" -or $_ -eq $p }; if ($changed) { $hits += $changed } } }; Write-Host "[$tag] Hits: $($hits.Count)"; if ($hits.Count) { $hits | ForEach-Object { Write-Host "  🚫 $_" } } else { Write-Host "  ✅ 无越界" } }
# S-FONT 方跑：Check-Scope 'S-FONT' $fontProhibited
# S-CONTENT 方跑：Check-Scope 'S-CONTENT' $contentProhibited
```

---

## File Structure（S-CONTENT 本对话变更清单）

| 操作                           | 文件                                                                                       | 职责                                                                                                                   | 预估修改量           |
| ------------------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Modify (Append only)           | `lib/constants.ts`                                                                         | 末尾追加 INTEL_LINKS (+20) + TOOL_IDS (+10)，不改已有字段                                                              | +30 行               |
| Modify (Append only, optional) | `lib/content-types.ts`                                                                     | 如 13 新 Intel 完全落入 12 已有 ContentCategory → 可不改；否则追加 `ContentCategory` 项（<3 行）                       | 0~3 行               |
| Create                         | `scripts/audit-content3.py`                                                                | 最小审计升级：CSV 导出 4 类红灯（Intel 合规 / 关联孤儿 / Pitfall prevention / 新 slug 在 INTEL_LINKS），不覆盖现有脚本 | 200~300 行           |
| Create (× 13)                  | `content/intel/163-cv-3d-point-cloud-practice.md` … `175-embedded-stm32-hal-practice.md`   | 13 篇全新主线 Intel（CV5 + LLM4 + Edge2 + Embedded2）                                                                  | 每篇 1200~1800 字    |
| Create (× 7)                   | `content/intel/176-pitfall-triton-shape-mismatch.md` … `182-pitfall-rknn-model-convert.md` | 7 篇全新细化 Pitfall（LLM推理3 + CUDA/ONNX2 + Embedded2）                                                              | 每篇 800~1500 字     |
| Modify (Append)                | `content/glossary/terms.json`                                                              | 追加 18 新术语（对齐新 20 Intel/Pitfall）                                                                              | +18 条目             |
| Create (× 18)                  | `content/glossary/terms/<new-slug>.md`                                                     | 新增术语的最小详情 md（定义 + 场景/公式 + 关联）                                                                       | 每篇 200~500 字      |
| Modify (Append)                | `content/toolbox/tools.json`                                                               | 末尾追加 10 工具（Triton / TensorRT-LLM / RKNN / Jetson-Pack / LangGraph 等）                                          | +10 条目             |
| Modify (Patch)                 | `content/intel/*.md`（存量 ≈15~20 篇）                                                     | 红灯修复：<800 字补段 / 缺代码块补最小可跑代码 / 缺 takeaways 补四分类 frontmatter                                     | 每篇 +100~400 字     |
| Modify (Patch)                 | `content/intel/*pitfall*.md`（存量 ≈20~30 篇）                                             | 缺 prevention[] → frontmatter 追加 3 条 prevention                                                                     | 每篇 +3 行           |
| Modify (Batch append related*) | 全 6 类实体（Intel/Term/Tool/Pitfall/Node/Practice）的 related* 字段                       | 按 audit-content3.py 缺口 CSV 批量追加，确保 4 类关联覆盖率 100%                                                       | 平均每实体 +2~4 字段 |
| Overwrite (Publish only)       | `public/search-index.json`                                                                 | D3 16:00 发布前 `tsx scripts/prebuild-search-index.mjs --force` 重搜一次                                               | 完整覆盖             |
| Create (Tests)                 | `__tests__/optimizations/content-mini-sprint.test.ts`                                      | 新断言：新增 20 Intel/Pitfall slug 在 INTEL_LINKS；新增 10 Tool slug 在 TOOL_IDS；关联覆盖率 100%                      | 150~200 行           |

---

## 3 天按小时任务分解（S-CONTENT 侧）

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Day 1 — 地基 + 新增内容 60%（8h + 夜间 Agent 离线）

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### T0-1 常量最小扩展（12:00-12:30，S-FONT 上午窗口结束后）

- [ ] **Step 1**：`git pull --rebase origin main` 拉取当日 S-FONT 最终提交
- [ ] **Step 2**：在 `lib/constants.ts` **末尾追加**（不插中间）：
  - INTEL_LINKS：20 条（13 主线 + 7 Pitfall），命名从 `163-cv-3d-point-cloud-practice` 到 `182-pitfall-rknn-model-convert`，中文标题填完整
  - TOOL_IDS：10 条（`triton-inference-server`、`tensorrt-llm`、`rknn-toolkit2`、`jetson-pack`、`langgraph`、`ultralytics-explorer`、`opencv-cuda`、`mmdeploy`、`tensorrt-python`、`pgvector-production`）
- [ ] **Step 3**：`lib/content-types.ts` 校验新 20 md 的分类是否全落入 12 大类；若是则跳过；否则追加 `ContentCategory` 枚举（≤3 行）
- [ ] **Step 4**：本地自验：`npx tsc --noEmit` + `npm run lint -- lib/constants.ts lib/content-types.ts` → 无错
- [ ] **Step 5**：提 PR → 标签 `[CONTENT][T0] scope:content no-font-touch priority/P0` → 合并

#### T0-3 审计脚本最小升级（12:30-13:30，**新建**不覆盖）

- [ ] **Step 1**：新建 `scripts/audit-content3.py`，包含 4 个 CSV 导出函数：
  - `export_intel_redlight_csv()`：Intel 非 pitfall 文件中，`len(content)<800` 或 `'```' not in content` 或 `not frontmatter.get('takeaways') or len(frontmatter['takeaways']) != 4`
  - `export_orphan_relations_csv()`：所有模块的 relatedIntel/relatedTools/relatedTerms/relatedNodes 中出现、但未在 INTEL_LINKS / TOOL_IDS / terms.json slugs / NODE_NAMES 中出现的 slug
  - `export_pitfall_no_prevention_csv()`：pitfall 类 md 中 frontmatter 无 `prevention` 或 `len(prevention)==0`
  - `export_new_slug_missing_in_constants_csv()`：检查 20 新 slug 是否在 INTEL_LINKS 中
- [ ] **Step 2**：手动跑一次 `python scripts/audit-content3.py --outdir scripts/.audit-out-2026-07-09` → 输出 4 CSV
- [ ] **Step 3**：提 PR → 同 T0-1 标签 → 合并

#### T0 合并后统一门禁（13:30-14:00）

- [ ] **Step 1**：`npm run test` → 11 测试全绿
- [ ] **Step 2**：`npm run prebuild && npm run build` → out/ 正常产出
- [ ] **Step 3**：记录 main 最新 hash（贴在当日交接窗口）

#### T1-CV 5 篇主线 Intel（14:00-17:00，3h）

- [ ] **Step 1**：新建 `content/intel/163-cv-3d-point-cloud-practice.md`：frontmatter（category=computer-vision, difficulty=intermediate, takeaways 四分类）+ 正文章节（为什么学 / 概览 / 核心拆解 / 完整方案含代码 / 误区 / 学习顺序）
- [ ] **Step 2**：新建 `content/intel/164-cv-object-tracking-yolo.md`：同上，含 ByteTrack/BoT-SORT 代码块
- [ ] **Step 3**：新建 `content/intel/165-cv-industrial-defect-detection.md`：同上，含工业数据增强 + FastSAM + 缺陷分类代码
- [ ] **Step 4**：新建 `content/intel/166-cv-multi-modal-sensor-fusion.md`：同上，含相机-激光雷达时空对齐代码
- [ ] **Step 5**：新建 `content/intel/167-cv-sam-segment-anything.md`：同上，含 SAM + Ultralytics FastSAM 推理代码
- [ ] **Step 6**：每篇填 4 类 related*（relatedTerms≥2、relatedTools≥2、relatedNodes≥2、relatedIntel≥2）
- [ ] **Step 7**：自验：每篇 frontmatter 齐全 + ≥1200 字 + 含 ``` 代码块
- [ ] **Step 8**：提 PR → 标签 `[CONTENT][T1-CV]`（≤10 文件 ✓）→ 跑 `npm run test -- content-quality` + 目录自验 → 合并

#### T1-LLM 4 篇 + T1-Edge 2 篇（17:00-19:00，2h）

- [ ] **Step 1**：168 `llm-triton-inference`、169 `llm-tensorrt-llm`、170 `llm-awq-gptq-quant`、171 `llm-edge-rk3588-jetson`、172 `edge-ai-rknn-toolkit`、173 `edge-ai-end-cloud-sync` → 6 md 同前标准
- [ ] **Step 2**：拆 2 条 PR（LLM-4 / Edge-2）→ 各自门禁 → 合并

#### 夜间（Agent 离线，D1 20:00 - D2 08:00）

- [ ] **Step 1**：**骨架生成**：T1-Embedded 2 Intel（174-esp32、175-stm32-hal）+ 7 Pitfall（176-182）→ frontmatter + 80% 正文草稿（每篇 ≥800 字 + 最小代码块）
- [ ] **Step 2**：**审计全量跑**：`audit-content3.py` 完整扫描 main → 4 CSV 放 D2 上午人工复核
- [ ] **Step 3**：**建议关联 JSON**：脚本按 category/keywords 匹配 TOOL_IDS / NODE_NAMES，生成增量补丁 JSON（待人工 D3 上午过）

---

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Day 2 — T1 收尾 + 存量红灯修复（8h + 夜间批量）

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### 上午 09:00-12:00（给 S-FONT 独占窗口；S-CONTENT 仅审草稿，不提交）

- [ ] **Step 1**：审 Agent 夜间 9 篇草稿 → 批注不达标段落
- [ ] **Step 2**：读 D1 夜间 4 份红灯 CSV → 圈出需 D2 下午修复的条目（按严重度：缺 takeaways > 无代码块 <800 字）
- [ ] **Step 3**：12:00 准时 `git pull --rebase origin main` 拉 S-FONT 当日提交

#### T1-Embedded 2 + 7 Pitfall（13:30-14:30，1h）

- [ ] **Step 1**：修 174、175 草稿 → 达标标准
- [ ] **Step 2**：修 176~182 七篇 Pitfall（含 symptoms、solution、quickFix、prevention、relatedIntel≥1、relatedNodes≥1）
- [ ] **Step 3**：拆 2 PR（Intel-2 / Pitfall-7）→ 合并

#### T1-Toolbox 10 + Glossary 18（14:30-16:00，1.5h）

- [ ] **Step 1**：`content/toolbox/tools.json` 末尾追加 10 工具，每工具字段齐全（name/slug/category/purpose/description/install/features/tags/github/difficulty/official_url/use_cases/relatedIntel≥1/relatedNodes≥1/relatedTerms≥1）
- [ ] **Step 2**：`content/glossary/terms.json` 追加 18 术语，含 term/slug/nameZh/category/definition≥30 字/relatedTerms≥2/relatedNodes/relatedIntel/relatedTools/tags
- [ ] **Step 3**：新建 18 个 `terms/<slug>.md`，每篇 ≥ 3 段落
- [ ] **Step 4**：拆 2 PR（Toolbox-1 / Glossary-18）→ 合并

#### T2-REDMINE 存量红灯修复（16:00-18:30，2.5h，≤20 篇/PR）

- [ ] **Step 1**：按 CSV 圈出条目修 takeaways 缺项 → 四分类 concept/skill/practice/tool 每类 1 句
- [ ] **Step 2**：补 <800 字 Intel → 末尾加「实战验证 tips」或「Benchmark 参考」段落
- [ ] **Step 3**：补缺 ``` 代码块 Intel → 加 10-15 行最小可跑示例
- [ ] **Step 4**：content-quality.test.ts 跑一遍 → 合规率 ≥ 85%
- [ ] **Step 5**：拆 2 条 PR（≤20 文件/条）→ 合并

#### 日门禁（18:30-19:00）

- [ ] **Step 1**：`npm run test` + `npm run lint:ci` + `npm run prebuild && npm run build`
- [ ] **Step 2**：记录三色灯矩阵（若红灯 → 夜间返工 1 小时解决）

#### 夜间（Agent 离线，D2 20:00 - D3 08:00）

- [ ] **Step 1**：**T2-OPT-REL 自动补丁**：读取 D2 早上的 orphan CSV → 脚本自动匹配 → 生成建议 related* 追加 JSON
- [ ] **Step 2**：**T2-OPT-PREV 自动补丁**：读取 pitfall_no_prevention CSV → 基于 solution + keywords 生成 3 条 prevention frontmatter
- [ ] **Step 3**：**D3 上午人工复核清单**导出为 CSV

---

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Day 3 — 关联 100% + 回归 + 发布（8h 交付）

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### 上午 09:00-12:00（S-FONT 独占窗口；S-CONTENT 仅复核）

- [ ] **Step 1**：人工过 Agent 夜间自动补丁 JSON（关联 + prevention）→ 打回错项
- [ ] **Step 2**：抽样 20% 新 Intel → 人工读一遍正文深度（尤其 CV/LLM 工程化）
- [ ] **Step 3**：12:00 准时 `git pull --rebase origin main`，拿到 S-FONT 最终提交 hash A

#### T2-OPT-REL + T2-OPT-PREV 全量应用（13:30-15:00，1.5h）

- [ ] **Step 1**：批量追加 4 类实体 related* 字段 → 100% 覆盖（orphan CSV 行数 = 0）
- [ ] **Step 2**：批量补 pitfall prevention[] → 100% 覆盖
- [ ] **Step 3**：`audit-content3.py` 再跑 → 验证 4 CSV 行数归零
- [ ] **Step 4**：提 1 条 PR → 合并

#### Glossary 新增 18 详情 md 100% 校验（15:00-16:00，1h）

- [ ] **Step 1**：脚本扫 `terms.json` 新增 18 slug → 对应 `terms/<slug>.md` 存在 = 18/18
- [ ] **Step 2**：小 PR 补漏（若有）→ 合并

#### 发布前强制重搜 + 全量 Build（16:00-17:00，1h，G7 门禁）

- [ ] **Step 1**：`git status` → clean
- [ ] **Step 2**：`tsx scripts/prebuild-search-index.mjs --force` → 重搜耗时 ≈ 5-10 min
- [ ] **Step 3**：验证 search-index：`grep -c '163-cv' public/search-index.json` → ≥ 20（新增 Intel/Pitfall 覆盖）
- [ ] **Step 4**：`npm run clean && npm run build` → 成功
- [ ] **Step 5**：脚本抽 `out/**/*.html` href → 去重抽样 100 → broken link = 0
- [ ] **Step 6**：`npm run test` + `npm run lint:ci` → 全通过
- [ ] **Step 7**：提发布 PR（含 public/search-index.json 新文件）→ 标签 `[CONTENT][RELEASE]` → 合入后 main 记录 hash B

#### 跨双对话最终回归（17:00-18:00，1h）

- [ ] **Step 1**：验证 git 线性历史：`git log --oneline main --since=3.days` → S-FONT 提交（hash A 祖先）、S-CONTENT 提交（hash B）同链，无互相覆盖文件
- [ ] **Step 2**：抽样 30 条路由 HTTP 200（含新 13 Intel、7 Pitfall、10 Tool、18 Glossary）
- [ ] **Step 3**：字体回归：`grep -r 'font-family' out/*.html | head -5` → Instrument Sans/JetBrains Mono 仍正确（证明 S-FONT 不被回滚）
- [ ] **Step 4**：Git tag `v0.2.0-content-mini-sprint` 指向 hash B

#### 交付物打包（18:00-19:00）

- [ ] **Step 1**：生成交付清单（新增 13Intel + 7Pitfall + 18Term + 10Tool 的 slug 列表）
- [ ] **Step 2**：质量矩阵报告（Intel 合规率 / 关联 100% / Pitfall 100% / Glossary 新增详情 100%）
- [ ] **Step 3**：3 次门禁截图（D1 13:30 / D2 18:30 / D3 16:00）
- [ ] **Step 4**：**独立存放**：本对话交付放在 `docs/superpowers/deliveries/2026-07-09-content-mini-sprint/` 目录（新建）；与 S-FONT 交付目录不混放

---

## Cross-Session Isolation Rules（跨对话隔离硬规则）

| 规则 ID                  | 内容                                                                                                                 | 执行方                      | 违反 → 后果                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| **ISO-1 分支前缀**       | S-FONT 分支 `font/<task>`；S-CONTENT 分支 `content/<task>`                                                           | 双方                        | PR 创建后 GitHub Actions 自动校验（若无则 label `needs-rebase` + block 合并）            |
| **ISO-2 PR 标题**        | 前缀 `[FONT]` vs `[CONTENT]` + 标签 `scope:font` vs `scope:content` + 互斥标签 `no-content-touch` vs `no-font-touch` | 双方                        | 缺任一标签 → CI fail，不进入审核队列                                                     |
| **ISO-3 合并时段**       | S-FONT 仅 **上午 09:00 – 12:00** 合 PR；S-CONTENT 仅 **下午 14:00 – 19:00** 合 PR。禁止反时段合并                    | 双方 + PM                   | 反时段 PR → 关 PR，改在对应时段重开                                                      |
| **ISO-4 交接重基**       | 中午 12:00、晚上 20:00 两个时间点：后来一方必须 `git pull --rebase origin main` 到最新再发 PR                        | 后开工一方                  | rebase 失败（冲突）→ 立即在群里呼叫对方，由先合方负责协助解决，**不允许暴力 push**       |
| **ISO-5 重叠文件冻结**   | package.json / package-lock.json / tsconfig.json / next.config.js → 双方**均禁止修改**                               | 双方                        | 有一方确需改 → 必须在群里发「冻结解除申请」并获得另一方签字；另一方 24h 内未回应默认同意 |
| **ISO-6 发布 PR 独占**   | D3 16:00 的 S-CONTENT 发布 PR 必须标记 `priority/P0`，期间 S-FONT 不得提任何 PR                                      | 双方                        | 违反 → 发布 PR 延后 1 小时处理                                                           |
| **ISO-7 每日零冲突报告** | 中午 12:15 + 晚上 19:15 各跑一次目录自验命令（见前文）→ 结果贴群                                                     | S-FONT 中午、S-CONTENT 晚上 | 出现越界 → 责任人 30 分钟内 revert + 提交纠正 PR                                         |

---

## Risk Matrix（3 天冲刺）

| ID  | 风险                                                                      | 概率 | 影响 | 触发信号                                             | 应对                                                                                                              |
| --- | ------------------------------------------------------------------------- | ---- | ---- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| R1  | 人工串线改错对方目录（下午提的 S-CONTENT PR 手滑改到 tailwind.config.ts） | 中   | 极高 | PR diff 命中 ISO-7 自验命中                          | 立即关 PR、revert 对应 commit；责任人从当日 PR 配额扣 1 条（上限降为 ≤ 5 文件/PR）                                |
| R2  | T0-1 常量少写 slug → T1 首条 PR 被孤儿检测 block                          | 低   | 中   | T0-1 后 `audit-content3.py --new-slug` 扫出 N 条缺口 | 20min 补 T0-1b 补丁 PR 插队 P0                                                                                    |
| R3  | Agent 夜间草稿深度不够，D2 需返工 >3 篇                                   | 中   | 高   | D2 上午审阅 >3 篇打回                                | 放弃嵌入式 2 Intel（T1 从 13 → 11），集中保高价值 CV5+LLM4+Edge2（11 篇仍达 95 目标），签字偏差                   |
| R4  | search-index 漂移（两次 build 间搜索命中新 slug 不稳定）                  | 低   | 中   | D3 发布前 `grep -c` 命中 < 20                        | 强制再跑 `--force` 重搜，并在发布 PR 描述贴 `grep` 输出截图                                                       |
| R5  | 重叠文件（package.json 等）一方擅自改动导致另一方 rebase 冲突             | 低   | 高   | 中午 rebase 失败报告                                 | 先改方 = 责任方 → 后改方 rebase 时冲突由先改方协助解 15min；15min 未解决 → 先改方 revert 改法，延后到冲刺结束再合 |
| R6  | 连续 2 次日门禁红灯（<80%）                                               | 低   | 高   | D2 18:30 再次 <80%                                   | 启动 R-REGRESS：下午时段暂停 1h 新内容 PR 合并，全部资源投入修复                                                  |

---

## Acceptance Criteria（D3 19:00 验收，全部满足 = 成功）

### 🔒 零冲突证明（防串线）

- [ ] **AC-ISO-1**：`git log --oneline --name-only --since=3.days` 中所有 scope:font 提交**未触碰** 7 个 S-CONTENT 专属目录（content/lib/constants/lib/content-types/scripts/**tests**/public/search-index.json）
- [ ] **AC-ISO-2**：所有 scope:content 提交**未触碰** 7 个 S-FONT 专属目录（app/layout/globals/tailwind/components/next.config/lib/storage/lib/security）
- [ ] **AC-ISO-3**：scope:font PR 合并时间均在 09:00-12:00；scope:content 在 14:00-19:00（`git show --format='%ci %s'` 验证）

### 📦 T1 新增交付（允许 10% 浮动签字）

- [ ] **AC-T1-1**：新增 Intel 主线 ≥ 12 篇（目标 13，允许少 1）→ 计数 `ls content/intel/16*.md content/intel/17*.md content/intel/18*.md | grep -v pitfall | wc -l`
- [ ] **AC-T1-2**：新增 Pitfall ≥ 6 篇（目标 7，允许少 1）→ `grep -l '^category:.*pitfall' content/intel/176-* content/intel/177-* ...`
- [ ] **AC-T1-3**：新增 Glossary 术语 ≥ 16（目标 18）且每篇有 terms/*.md → 脚本扫 JSON + 文件存在
- [ ] **AC-T1-4**：新增 Toolbox 工具 ≥ 9（目标 10）→ `jq '.tools | length' content/toolbox/tools.json` 差 ≥ 9

### ✅ T2 存量优化

- [ ] **AC-T2-1**：Intel 合规率 ≥ 85%（content-quality.test.ts 通过率）
- [ ] **AC-T2-2**：4 类关联覆盖率 100%（orphan CSV 行数 = 0）
- [ ] **AC-T2-3**：Pitfall prevention 100%（prevention CSV 行数 = 0）

### 🚪 发布门禁（G2-G7 全通过）

- [ ] **AC-REL-1**：`npm run test` 11+ 测试 100% 绿 + 新增 content-mini-sprint.test.ts 通过
- [ ] **AC-REL-2**：`npm run lint:ci` max-warnings ≤ 100
- [ ] **AC-REL-3**：`npm run clean && npm run build` 静态导出成功
- [ ] **AC-REL-4**：search-index.json 覆盖新增 20 Intel/Pitfall（`grep -c` 命中 ≥ 20）
- [ ] **AC-REL-5**：抽样 30 条路由 HTTP 200（含 10+ 新 slug）
- [ ] **AC-REL-6**：`npm run audit:dep` 无 HIGH 级别漏洞
- [ ] **AC-REL-7**：Git tag `v0.2.0-content-mini-sprint` 存在且指向 D3 发布 PR 合并 commit

---

## Rollback Plan（极端回滚）

1. 若 D3 最终验收任意 AC-ISO 未通过 → 回滚到 D1 13:30（T0 后）main hash，从 T1 重新提交（代价最大但保证零冲突）
2. 若仅发布后新 Intel/Pitfall 内容出错 → 回滚对应 md 文件 commit，保留其他交付
3. 若 search-index 出问题 → 回到 D3 16:00 前版本 + 重跑 `--force`

---

## Baseline & Change Log

| 时间戳           | 版本 tag                                       | 变更摘要                                                                                                                                                                           | 签字/触发方                 |
| ---------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 2026-07-09 19:30 | `v0.1.9-day0-baseline`（计划在 Day0 合并后打） | **新增 Global Constraint 8 · Day0 预优化声明**（8 处文件豁免 sprint 所有权约束，附热修复分支/标签流程）；本变更 = 方案 A 正式生效记录，后续 S-FONT/S-CONTENT 均以此 tag 为共同祖先 | User（回复「A」同意方案 A） |
| 2026-07-09 初版  | —                                              | 计划草稿 → approved：3 天并行冲刺方案（Cross-Session 7 条 ISO 规则 + Risk Matrix + AC + Rollback）                                                                                 | 文档作者                    |

---

**启动签字（二选一填回复即可）**：

- ▢ A. 方案通过（**含 Day0 预优化基准 Constraint 8**），立刻按 Day 1 启动；
- ▢ B. 指标/范围调整（请写明调整项）。
