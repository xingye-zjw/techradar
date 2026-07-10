# TechRadar 并行处理计划（新增内容 + 现有模块优化双目标）

> 版本：v1.0 · 2026-07-10
> 配套文档：architecture.md / modules-inventory.md / new-content-scope.md / team-resources.md
> 周期：**8 周（4 × 2 周 Sprint）**
> 团队：**4-6 人 × 20h/人/周**
> 基线状态：已完成 P0 基线清理（3 个物理重复 intel 删除、187 篇全关卡通过）

---

## 要素 1：任务分解与优先级排序（Epic-Story-Task 三级）

### 1.1 Epic 一览（7 个 Epic = 2 主线 + 3 支撑 + 2 运维）

| Epic ID | 名称 | 类型 | 占比 | 优先级 | 目标交付（粗）|
|---|---|---|---|---|---|
| **E1** | 新增内容：40 标准 intel + 40 术语 | 主线 | 35% 工时 | **P0** | 114→154 标准 intel；60→100 术语 |
| **E2** | 新增内容：30 篇 pitfall 情报 | 主线 | 15% 工时 | P1 | 73→103 pitfall intel |
| **E3** | 优化：114 篇既有 intel 深度 + 引用 | 主线 | 25% 工时 | **P0** | A 档 20 篇 100% 达标；B 档 40 篇 ≥ 90%；C 档 54 篇 ≥ 60% |
| **E4** | 工具箱 70 款完善 + Practice 5 项目 | 主线 | 10% 工时 | P1 | TOOL_IDS 70/70；related* 覆盖 ≥ 85%；5 projects.json |
| **E5** | 学习路径 + 搜索/推荐 UI 增强 | 支撑 | 5% 工时 | P2 | LP 3→8；Toolbox 场景 Tab；Fuse 索引重生成 |
| **E6** | 质量基础设施扩展（脚本 + 测试） | 运维 | 5% 工时 | P0（前置）| check-constants 扩展、audit-content3 扩展、content-quality.test 扩展 |
| **E7** | Sprint 运营（Review / Demo / Retrospective）| 运维 | 5% 工时 | 常置 | 每个 Sprint 产出报告 + Action Items |

### 1.2 Story 分解（Sprint 0→4 滚动）

#### Sprint 0（第 0 周，1-2 天，前置）
| Story ID | 任务 | Owner | 估算 | 验收 |
|---|---|---|---|---|
| S0-01 | 删除 3 个物理重复 intel：015-rlhf / 021-rag-intro / 022-agent-intro | R1 TL | 0.5h | 已完成 ✅ |
| S0-02 | 跑 5 大校验（TSC / ESLint / Vitest 93 / check-constants / audit-content3）| R1 TL + R2 FE | 1h | 全部 green ✅ 已完成 |
| S0-03 | 新增 `templates/intel/new-intel-200+.md` 模板（与现有 template.md 对齐，编号从 200 起）| R2 FE | 2h | template 通过内容编辑 review |
| S0-04 | 新增 `drafts/terms-R3.yaml` / `terms-R4.yaml` 草稿空间，Sprint 2 末批量合并 | R6 / R1 | 0.5h | 3 个草稿文件就绪 |
| S0-05 | 扩展 check-constants.py：支持 intel 编号段 200-299 范围校验 + pitfall 199-259 新段 | R2 FE | 3h | 脚本跑过 + 有报告 |
| S0-06 | 扩展 audit-content3.py：字数（2000/3000/4000 三档）+ 代码块密度 + related 覆盖率 + 练习题章节 4 项新检查 | R2 FE + R5 QA | 6h | QA 确认报告字段正确 |
| S0-07 | 扩展 content-quality.test.ts：A 档 20 篇 `expect(contentLen).toBeGreaterThan(4000)` + 练习章节存在断言 | R2 FE | 3h | Vitest 用例通过 |
| S0-08 | 建分支：`feature/parallel-content-sprint`（主分支）；其他子任务从其 checkout | R1 TL | 0.5h | 分支存在 |

**Sprint 0 合计：≈ 16.5 人时（≈ 1 人天）**

---

#### Sprint 1（第 1-2 周，产出：E6 完成 + E1 A/B 档 50% + E3 A 档 100%）

| Story | 内容 | Owner | 估点 | 优先级 |
|---|---|---|---|---|
| S1-E1.01 | 新增 LLM 前 8 篇 intel：200-207（见 new-content-scope N-LLM-01…08）| R3 | 40h | P0 |
| S1-E1.02 | 新增 CV 前 6 篇 intel：220-225（N-CV-01…06）| R4 | 30h | P0 |
| S1-E1.03 | 新增嵌入式前 4 篇：240-243（N-EMB-01…04 缺 243）| R4 借 R6 10h | 20h | P1 |
| S1-E1.04 | R3 同步写 8 条 LLM 术语草稿（terms-R3.yaml 1-8）| R3 | 6h | P0 |
| S1-E1.05 | R4 同步写 9 条 CV+嵌入式 术语草稿 | R4 | 8h | P0 |
| S1-E3.01 | **A 档优化**：LLM 方向 10 篇（001,003,005,020,029,031,033,035,037,041）| R3 | 40h | P0 |
| S1-E3.02 | **A 档优化**：CV + 嵌入式方向 10 篇（002,004,006,060,063,112,113,052,053,058）| R4 | 40h | P0 |
| S1-E4.01 | Toolbox 阶段 1：**补齐 50 个 TOOL_IDS URL**（check-constants 32 个 + 剩余 18 个来自 tools.json）| R6 | 20h | P0 |
| S1-E4.02 | Toolbox 阶段 2：给 TOP 30 工具各填 relatedIntel ≥ 2 + relatedTerms ≥ 2 | R6 | 20h | P1 |
| S1-E6-遗留 | E6 脚本 + 测试扩展（S0 未做完转入 S1）| R2 FE | 8h | P0 |
| S1-E5.01 | `/toolbox` 页面增加「场景（scenario）Tab」UI | R2 FE | 16h | P2 |
| S1-E7.01 | Sprint 1 Review / Demo / Retro | 全员 | 3h | 运营 |

**Sprint 1 合计（≈ 9 人 × 40h → 约 2 周 ）**：符合 20h/人/周 × 6 人 × 2 周 ≈ 240h。

---

#### Sprint 2（第 3-4 周，产出：E1 100% + E2 50% + E3 B 档 80% + 术语批量合并）

| Story | 任务 | Owner | 估点 | 优先级 |
|---|---|---|---|---|
| S2-E1.06 | LLM 剩余 9 篇 intel：208-216（N-LLM-09…17）| R3 | 45h | P0 |
| S2-E1.07 | CV 剩余 7 篇 intel：226-232（N-CV-07…13）| R4 | 35h | P0 |
| S2-E1.08 | 嵌入式剩余 3 + 交叉 3 篇：244-247（缺 243 续），250-252（N-CROSS-01…03）| R4 10h + R6 20h | 30h | P0 |
| S2-E1.09 | 术语草稿合并：R3 草稿 14 条 + R4 21 条 + R6 5 条 = **40 条**一次性 append 进 terms.json + 各写 .md 详情页（32 篇即 80%） | R6 | 25h | P0 |
| S2-E2.01 | Pitfall 前 15 篇：LLM 10 篇 + CV/多模态前 5 篇 | R3 10 篇 + R4 5 篇 | 40h + 20h | P1 |
| S2-E3.03 | B 档 40 篇优化：LLM 15 + CV 15 + 嵌入式 10（R3/R4 并行） | R3 30h + R4 30h | 60h | P0 |
| S2-E4.03 | Toolbox 阶段 3：给剩余 40 工具补 related* 到 ≥ 2 条；scenarios 10→16 场景 | R6 | 30h | P1 |
| S2-E5.02 | `learning-paths.ts` 5 条新路径（LP-LLM-02/CV-02/CV-03/EMB-02/MLOPS）| R2 FE 6h + R1 6h | 12h | P2 |
| S2-E5.03 | `/intel` 列表页新增 3 个 Tab：「新增 / 优化 / 全部」 | R2 FE | 10h | P2 |
| S2-E7.02 | Sprint 2 Review / Demo / Retro | 全员 | 3h | 运营 |

---

#### Sprint 3（第 5-6 周，产出：E2 100% + E3 C 档 60% + E4 + E5 100%）

| Story | 任务 | Owner | 估点 | 优先级 |
|---|---|---|---|---|
| S3-E2.02 | Pitfall 剩余 15 篇：CV 后 2 + DL/CUDA 6 + 嵌入式/HW 7 | R4 9 篇 + R6 6 篇 | 45 + 30 h | P1 |
| S3-E3.04 | C 档 54 篇优化：R3/R4 各 20 篇、R6 14 篇（只求 related* 不空白 + 代码可运行 + summary 规范化）| 三人分 | 75h | P1 |
| S3-E3.05 | A/B 档回扫：QA 列出未达标的 A 档 20 → 必须返工；B 档 40 抽查 50% | R5 QA 出报告 → R3/R4 返 | 15h QA + 20h R3/R4 | P0 |
| S3-E4.04 | Practice 5 项目：CV 2 + LLM 2 + 嵌入式 1（projects.json）| R6（主）+ R3/R4 各审 1 个 | 40h | P2 |
| S3-E4.05 | Toolbox 扫尾：TOP 30 工具各补 1 篇配套 intel 迷你教程（不足的用占位链接，Sprint 4 有则填，无则降级到 post-launch）| R3/R4 各 10 篇 / R6 10 | 30h | P1 |
| S3-E5.04 | `/pitfall` 页按 10 个专题分类云（DL 训练/LLM 应用/RAG/部署/嵌入式/前端/安全…）| R2 FE | 10h | P2 |
| S3-E5.05 | `prebuild-search-index.mjs` 重生成：**覆盖率 > 95%**（247 intel + 100 terms + 70 tools + 103 pitfalls 全部可被 Fuse 索引） | R2 FE + R5 QA | 5h | P0 |
| S3-E7.03 | Sprint 3 Review / Demo / Retro | 全员 | 3h | 运营 |

---

#### Sprint 4（第 7-8 周，全量补完 + 全量验证 + 发布准备）

| Story | 任务 | Owner | 估点 | 优先级 |
|---|---|---|---|---|
| S4-E3.06 | C 档扫尾 + B 档 10% 余量扫尾 + 孤岛内容排查（每篇 related* 平均）| R3/R4/R6 按分 | 30h | P0 |
| S4-E4.06 | TOOL_IDS related* 覆盖率最终冲刺（80%→≥ 85%）+ scenarios 16 个最终 review | R6 | 15h | P1 |
| S4-E5.06 | 推荐算法更新：recommendations.ts 基于新的 A/B 档内容权重调整 | R1 + R2 | 10h | P2 |
| S4-E6.08 | 最终全量冲刺：TSC / ESLint / Vitest（期望 ≥ 120 用例全部 green）/ lint:ci / check-constants / audit-content3 | R1 + R2 + R5 | 20h | P0 |
| S4-E6.09 | 「回归测试」：Cloudflare Pages 预发布（build），50+ 条路由 smoke test | R2 + R5 | 10h | P0 |
| S4-E6.10 | 验收报告：4 份 docs + 覆盖率 Excel + Bug 清零证明 + 用户 Demo 录屏 | R1 + R5 | 15h | P0 |
| S4-E7.04 | Sprint 4 Review / Launch Demo / Post-mortem | 全员 + 用户代表 | 4h | 运营 |

---

### 1.3 优先级总规则（任何 Story 必须满足）

- **P0 阻塞顺序**：S0 → E6(脚手架) → A 档优化 → 新增内容 → 全量验证。P0 没做完不允许开始 P2。
- **新增 intel 的优先级分**：LLM = 1.4 权重 / CV = 1.3 / 嵌入式 = 1.1 / 交叉 = 0.9。资源冲突时权重高的先做。
- **优化的优先级分**：A 档 10 / B 档 4 / C 档 1。

---

## 要素 2：资源分配与团队协作机制

### 2.1 资源分配（按 Epic × Role 热力矩阵）

| Epic | R1 TL | R2 FE | R3 内容 A (LLM) | R4 内容 B (CV/嵌) | R5 QA | R6 内容 C (Tool/Cross) |
|---|---|---|---|---|---|---|
| E1：新增 40+40 | 5% PR 审核 | 5% 模板/校验 | **55%** | **45%** | 10% 审核 | 30% |
| E2：新增 30 pitfall | 5% | — | 20% | 30% | 10% | **40%** |
| E3：既有 114 优化 | 10%（A 档仲裁）| 5% 测试扩展 | **40%** | **45%** | 20% coverage 报告 | 35%（C 档）|
| E4：Toolbox + Practice | 10%（TOOL_IDS 最终合并）| 10% scenarios Tab | 5% TOP 工具审 | 10% TOP 工具审 | 20% 覆盖率 | **60%** |
| E5：学习路径+UI | **40%**（LP 方案+合并）| **70%** | — | 5% | 10% | 5% |
| E6：基础设施扩展 | 10%（最终 gate）| **80%** | 5% | 5% | **40%** | 5% |
| E7：Sprint 运营 | **100%**（主持）| 30% | 5% | 5% | **60%**（记录+报告）| 5% |

### 2.2 协作机制的关键 8 条（避免冲突）

1. **常量文件唯一写入**：`lib/constants.ts`、`content/terms.json`、`tools.json` 严格按 RACI 中"唯一写入 Owner"执行，其他角色一律提 PR，Owner 合并；
2. **每日异步 standup**：每天 10:00 前在群里发 3 行：昨日完成 / 今日计划 / 阻塞；阻塞 > 2h 自动升级到 TL；
3. **PR 24h SLA**：PR 发出后 Owner 必须在 24h 内给出反馈（或打回或 approve），超过自动催办（可由 QA 代催）；
4. **PR 最小粒度**：一次 PR 最多包含 3 篇新增 intel，或 1 篇 A 档优化，或 1 个共享文件改动。不允许"大杂烩 PR"；
5. **术语草稿双写过渡**：Sprint 0-2 期间 R3/R4/R6 各写独立 yaml 草稿，不直接修改 terms.json。Sprint 2 末由 R6 一次性合并，合并过程中去重；
6. **Intel slug 命名空间分块**：
   - R3 分配 200-219 段（20 个编号空间，占 17 个已规划，留 3 个备用）
   - R4 分配 220-239 + 240-259 两段（嵌入式 7+CV 13 = 20，+ Cross 3 个留 250-252，共用 240-249 里的 4 个 + 250-259 的 3 个）
   - R6 Pitfall 段 = 259-299 的 pitfall-* 命名（30 篇新 pitfall 可占用）
   - **任何人不允许占用他人命名空间编号**（check-constants.py S0 会加此校验）
7. **Conflict Merge 黄金流程**：收到 GitHub merge conflict 通知 → 10 分钟内 owner 开 rebase → 有歧义立刻拉 TL 三方通话（≤ 15 分钟）→ 解决后 QA 手动跑对应子集测试；
8. **Deadline 前 48h 冻结代码合并**：每个 Sprint 倒数第 2 天起，只允许合并 「Hotfix/Bugfix」 PR，不再合入新 feature，保障 Demo 稳定。

---

## 要素 3：模块间依赖关系分析与处理方案

### 3.1 依赖有向无环图（DAG）

```
 S0（P0 清理 + 模板 + 脚本扩展）
        │
        ▼
 ┌──────────────────────────────────┐
 │ E6：基础设施扩展（S0 延续入 S1） │
 └───────────────┬──────────────────┘
                 │
                 ▼
 ┌─────────────────────────────────────────────────┐
 │ E3 A 档 20 篇（依赖 E6 脚本：因为要按新字数断言）│
 └───────┬─────────────────────────────────────────┘
         │
         ▼
 ┌────────────────────────────────────────────────────┐
 │ E1 LLM 新 17 篇（不依赖既有优化，可以和 E3 并行）│
 │ E1 CV 新 13 篇                                      │
 │ E1 Embedded 新 7 篇                                 │
 │ E1 Cross 新 3 篇                                    │
 │   （这 40 篇之间除了 relatedIntel 互相引用以外，没有强依赖；
 │     但 L2 依赖 L1 的术语定义，所以草稿 terms 先写）│
 └────────────┬───────────────────────────────────────┘
              │
              ▼
 ┌───────────────────────────────────────────────────┐
 │ E2 30 Pitfall（依赖 E1 新 intel 的 relatedIntel 关联，│
 │   所以 E2 必须排在 S2/E1 至少 60% 完成之后启动）  │
 └──────┬────────────────────────────────────────────┘
        │
        ▼
 ┌────────────────────────────────────────────────────┐
 │ E4 Toolbox + Practice（强依赖 E1，因为要给 30 工具填 │
 │   relatedIntel ≥ 2；Practice 又依赖 Toolbox 场景数据）│
 └───────┬────────────────────────────────────────────┘
         │
         ▼
 ┌────────────────────────────────────────────────────┐
 │ E5 学习路径 + Recommendation / UI 增强（弱依赖 E1/E4）│
 └──────┬─────────────────────────────────────────────┘
        │
        ▼
 ┌────────────────────────────────────────────────────┐
 │ E3 B/C 档 + 全量验证（依赖所有新增内容先入库）       │
 └──────┬─────────────────────────────────────────────┘
        │
        ▼
   S4 最终发布
```

### 3.2 依赖解耦策略（4 种常见模式）

| 依赖模式 | 示例 | 解耦方案 |
|---|---|---|
| **A. 写时强依赖（Pitfall 的 relatedIntel 引用了 E1 还没写好的 208）** | E2 pitfall-llm-temperature-zero 里填 `relatedIntel: [206-sft-data-pipeline, 208-mixture-of-depths]` 但 208 还没合入 | 允许先写"占位 slug"，但必须在 PR 标题用 `[WIP]` 标识，并在 description 中写清楚等哪一篇；E2-E1 边界在 S2 末强制检查：S2 末所有 placeholder 必须合入，否则 E2 对应 PR 打回 |
| **B. 多人改共享文件（constants.ts 注册表）** | R3/R4/R6 每人的新 slugs 都要 append 进 INTEL_LINKS | TL 在每个 Sprint 末批量追加一次：R3 把 8 个、R4 把 10 个、R6 把 5 个新 slug 贴到 Sprint 报告 → TL 开 1 个单独 PR："chore(constants): sprint X append 23 new INTEL_LINKS + 9 new TOOL_IDS" |
| **C. 术语定义与 intel 正文互相引用** | 201-flash-attention intel 首次出现 "FlashAttention" 这个词，需要加 glossary 链接，但对应术语还在 R3 草稿 | **Term 先于 intel 合入**：每篇 intel 提到的新术语在 terms-R3.yaml 中先写 definition → R6 每 3 天做一次「草稿 mini-merge」terms.json（不等到 Sprint 2 末） |
| **D. 前端功能依赖数据** | Toolbox scenarios Tab（E5）依赖 scenarios 16 个数据 | 允许 FE 用 mock 数据先写 UI；R6 在 S3 初把真实 scenarios 提交，FE 在 S3 中替换成真实即可 |

---

## 要素 4：进度监控与质量保障措施

### 4.1 进度监控（3 个仪表盘）

**① Sprint Burndown Chart（燃尽图）**
- 数据源：GitHub Projects 每个 Story 的 1-5 点估算
- 刷新频率：R1 TL 每日下班前 5 分钟更新
- 异常阈值：连续 3 天燃尽线高于理想线 15% → 触发「加派人力 / 降档」会议

**② 覆盖率仪表盘（内容质量 4 维度）**
- QA 每周输出，字段：
  ```
  周 | A 档完成率 | B 档完成率 | 平均 relatedIntel | 平均 relatedTerms | 平均 relatedNodes | 平均 relatedTools | 孤岛 intel 数量 |
  ---+-----------+-----------+-----------------+------------------+------------------+------------------+----------------|
  W1 | ...       | ...       | ...             | ...              | ...              | ...              | ...            |
  ```
- 孤岛 intel 定义 = relatedIntel 为空且 relatedNodes 为空且 relatedTerms 为空 的三无 intel。目标：S4 末 = 0。

**③ CI 红绿灯看板**
- 每次 PR / push 自动在 GitHub Project 卡片上贴：
  - 🟢 TSC、🟢 lint:ci、🟢 Vitest（93→期望 ≥120）、🟢 build、🟡 content-audit（非阻塞）
- **红了任何一个硬门禁的 PR 一律不允许合并**（GitHub Branch Protection 强制）。

### 4.2 质量门禁（6 层递进）

| 层 | 检查点 | 工具 | 责任人 | 时机 | 失败处理 |
|---|---|---|---|---|---|
| L1 | Pre-commit 代码/内容规范 | Husky + lint-staged + prettier | 每个人 | git commit 瞬间 | 自动阻止提交，本地修复 |
| L2 | **硬门禁 CI**（lint:ci + test + build + tsc --noEmit） | GitHub Actions ci.yml | R2 FE 维护 + GitHub 强制 | 每次 PR | PR block，必须修 |
| L3 | **内容质量自动审计**（字数 / 代码块 / 练习章节 / related 覆盖率） | audit-content3.py（S0 扩展）| R5 QA | 每 Sprint 前/中/后 3 次 | 输出 CSV，未达标列打回对应 Owner |
| L4 | **引用完整性**（INTEL_LINKS / NODE_NAMES / TOOL_IDS / terms.json 互相匹配）| check-constants.py（S0 扩展 + 命名空间段校验）| R2 FE | 每次 Sprint 合入 constants.ts 后立即 | 悬垂引用必须 24h 内修完 |
| L5 | **人工内容 Review Checklist**（§8 10 项） | Notion / PR Template checkbox | R5 QA + 同级交叉审（R3↔R4 互审） | 每篇 intel 发出 PR 时 | 未勾选不允许合并 |
| L6 | **最终预部署回归** | Cloudflare Pages Preview + 50 条路由 smoke test（R2 预写脚本）| R2 FE + R5 QA | S4 发布前 2 天 | 逐个修 Bug 才能 go-live |

### 4.3 同级交叉 Review（Peer Review）规则

- R3 写的 LLM 内容 → 由 **R4 随机抽 30% 做互审**（避免陷入 echo chamber）
- R4 写的 CV/Embedded → 由 **R3 随机抽 30% 做互审**
- R6 写的 Tool/Practice → 由 R1 TL 或 R2 FE 抽 30% 审
- 每次互审要回答 3 个问题："能读懂吗？有 bug 吗？代码能跑吗？" 任一为否 → 打回

---

## 要素 5：风险评估与应对策略（Top 10 风险）

> 评估矩阵：概率 P（1-5）× 影响 I（1-5）= 严重度 S（0-25）。S ≥ 10 必须有应急预案。

| # | 风险项 | P | I | S | 触发信号 | 预防策略 | 应急预案（触发后 24h 内行动）|
|---|---|---|---|---|---|---|---|
| R1 | **多人同时改 shared file（constants/terms/tools）导致 merge conflict 积压** | 4 | 4 | 16 | 某 Sprint 有 > 4 个 conflict PR | 严格唯一写入 Owner + 术语草稿双写过渡 | TL 锁仓库 1h，按「先合老的、rebase 新的」顺序批量处理；超过 3 个冲突开紧急短会 |
| R2 | **新增 intel 命名空间段冲突（R3 占用了 R4 的 220 段）** | 3 | 4 | 12 | check-constants 报"段越界" | 命名空间分配 + 脚本校验 + PR 模板要求写编号段 | 占用者的 PR 立刻打回改 slug；用批量重命名脚本 (类似 `_hotfix_rename_slugs.py`) 快速修正 |
| R3 | **人力不足（实际只有 4 人而非 6 人，QA/Content C 没到岗）** | 4 | 4 | 16 | Sprint 2 结束只完成了 ≤ 50% 目标 | S0 先按 4 人做保守基线 + 6 人做乐观基线 | 人力只能到 4 人时：E5 全部砍掉、E4 Practice 5 项目砍为 2 个、C 档优化覆盖率目标由 60%→30%；总交付周期顺延 2 周 |
| R4 | **Pitfall 内容和已有 73 篇 pitfall 高度雷同（内容撞车）** | 3 | 3 | 9 | audit-content3 新增加"标题相似度 > 0.8"报警 | 选题时 R6 先做 overlap 查重（scripts/analyze-tags.py 扩展）| 撞车的 pitfall 改名为「变体 2」或合并到已存在 pitfall，不新增 |
| R5 | **内容质量差导致 E3 A 档返工率 > 30%** | 4 | 3 | 12 | Sprint 1 末 A 档返工率 > 20% | S0 给每个 A 档定模板 + S1 初先写 1 篇由全员评审定标杆（golden article） | A 档返工时间不占用新增工时，R3/R4 从周末/平时加班时间补；或允许 A 档 10% 降级 B 档 |
| R6 | **引用悬垂导致 L4 失败（relatedIntel 指向不存在的 slug）** | 3 | 4 | 12 | check-constants.py 报非 0 missing | PR 中要求「relatedIntel 中每一项都在 constants.ts 存在」写 checklist | 自动化脚本 auto-patch：每次 check-constants 发现 missing X → 如果对应 intel 在同 PR 里还没合入 constants，就自动 append（由 TL 批）|
| R7 | **构建超时（Next.js static export，内容翻倍 187→247 导致 > 10 min timeout）** | 2 | 4 | 8 | GitHub Actions build timeout 报警（黄）| 提前验证：Sprint 3 中做 1 次真实 build 压测 | Cloudflare Pages 本地 build 后 wrangler 上传；或 GitHub Runner 规格升级（4 核）|
| R8 | **搜索索引膨胀（Fuse 索引 > 500KB，首屏白屏）** | 2 | 2 | 4 | Lighthouse CI 指标下降 | S0 就估算：现有 ~30KB ×（1 + 60/187）≈ 仍 < 60KB，影响小 | 引入分片索引（按 category 分片）按需加载 |
| R9 | **交叉依赖悬而未决导致 E2（Pitfall）Sprint 2 末完不成** | 3 | 3 | 9 | E1 新增 40 完成率 < 70% | Pitfall 模板中的 relatedIntel 允许 "E1 新篇引用占比 ≤ 50%，剩下 50% 必须引既有" | E1 没写好的新篇，pitfall 里全部改用既有 intel 引用，保证 E2 不因 E1 而 block |
| R10 | **用户验收时（S4 Demo）要求大改方向** | 2 | 5 | 10 | Demo 反馈 > 2 条「本质性偏离预期」意见 | 每 Sprint Review 都邀请用户代表（如果有的话），每 2 周对齐一次 | 启动 "变更控制流程"：用户提 Change Request → TL 做工期/资源评估 → 纳入下一个 Sprint 的额外 Backlog，不在本 Sprint 修 |

---

## 要素 6：阶段性交付节点与验收标准（4 Sprint 交付件 + 1 Launch）

### 6.1 Sprint 0（Day 0-2）— 基线与脚手架

**交付件**：
- [x] 3 个物理重复 intel 删除 → 磁盘 intel 数 = 187，INTEL_LINKS 187 双向匹配 ✅
- [x] 5 大校验全绿 ✅
- [ ] 新编号模板（200-299 段） + terms 草稿 3 份
- [ ] 3 份扩展脚本（check-constants / audit-content3 / content-quality.test.ts）
- [ ] 分支 `feature/parallel-content-sprint` 创建 + PR 模板 + Issue 模板

**验收标准**：
- 5 大校验全绿；
- 3 份脚本跑一遍输出非空；
- 模板 + 草稿被 R3/R4/R6 各自签字确认；
- 分支存在，保护规则已开（PR 必须 review 才能合入 main）。

---

### 6.2 Sprint 1（W1-W2）— A 档 + LLM/CV 第一批新增 + Toolbox TOOL_IDS 全量

**交付件**：
1. **E3 A 档 20 篇 100% 达标**（字数 ≥ 4000 / takeaways 4 条 / 练习题 3 道 / 常见误区 3 条 / related 全达标）
2. **E1 新增 18 篇 intel**（LLM 01-08 + CV 01-06 + 嵌入式 01-04）
3. **E4 Toolbox：50 个缺失 TOOL_IDS 全部补齐**（70/70 全部有文档 URL）
4. E6：3 个基础设施扩展全部合入（脚本 + 测试）
5. E5 Toolbox 场景 Tab UI 原型

**验收标准**：
- content-quality.test.ts 中 A 档字数断言全过；
- check-constants 报告：INTEL_LINKS 最新 = 187 + 18 = 205（增量）；NODE_NAMES 仍 68；TOOL_IDS 最新 = 70；
- 新 18 篇每篇都有 ≥ 2 条 relatedTerms 引用（交叉引用率 ≥ 80%）；
- `/toolbox/[id]` 中每款工具点击都跳转到正确文档 URL（QA 抽测 15 款 100% 通过）。

---

### 6.3 Sprint 2（W3-W4）— 新增全量 + 术语合并 + B 档

**交付件**：
1. **E1 40 篇 intel 100% 交付**（154 篇标准）
2. **40 条术语 100% 交付 + 32 篇 .md 详情页（80%）**
3. **E2 Pitfall 15 篇**（LLM 10 + CV 前 5）
4. **E3 B 档 40 篇 ≥ 80% 达标**
5. **E5 learning-paths 5 条新路径合入**
6. `/intel` 新增/优化 Tab

**验收标准**：
- 40 篇新 intel 全量 Vitest 通过；
- terms.json 无重名；每条新术语 relatedIntel ≥ 2 且 relatedNodes ≥ 1（QA 抽 20 条 100%）；
- 每一条新 pitfall 的 root_cause/solution/symptoms 都有内容（不空数组）；
- B 档 coverage 仪表盘报告 ≥ 80%。

---

### 6.4 Sprint 3（W5-W6）— Pitfall 全量 + C 档 + Toolbox 85% 覆盖率 + Practice 5 项目

**交付件**：
1. **E2 30 篇 pitfall 全量交付**（pitfall intel 累计 = 103）
2. **E3 C 档 54 篇 ≥ 60% 达标**；A/B 档回扫返工 100% 完成
3. **E4 Toolbox related* 覆盖率 ≥ 85%**；scenarios 16 个；Practice 5 项目
4. 搜索索引重生成，覆盖率 ≥ 95%

**验收标准**：
- A 档 100% 所有项 QA 回归过；
- Toolbox：抽 20 款工具，每款 relatedIntel/Terms/Nodes 平均 ≥ 2.0；
- Practice 5 项目的每一个 step.checkpoint 非空且有 duration；
- 搜索测试：输入新内容关键词都能命中（"Mixture of Depths" / "BEVFormer" / "ZenML" 等 QA 抽 15 条 100% 命中）。

---

### 6.5 Sprint 4（W7-W8）— 扫尾 + 全量验证 + 发布

**交付件**：
1. **孤岛 intel 数量 = 0**
2. **C 档扫尾：相关引用率总达标**
3. **E5 recommendations.ts 权重更新完**
4. **最终 6 层质量门禁全绿**（L1-L6 无阻塞 bug）
5. **验收报告 + 演示录屏 + 覆盖率 Excel**
6. **合并回 main 分支 + 打 tag v0.2.0**

**验收标准**：
- TSC: 0 errors；ESLint: 0 errors；Vitest：期望 ≥ 120 tests / 100% pass；next build < 10 min；
- Cloudflare Pages 预构建预览链接，QA 手工 50 条路由 smoke test 100% 可访问；
- 用户代表 Demo 会上 ≤ 1 条 "P0 级必须改" 的意见（P1 及以下放 v0.2.x 迭代）；
- GitHub Release 页面有：
  - Changelog：新增 130+ 内容条目清单、114 篇优化条目、70 Toolbox 完善项、5 个 Practice 项目
  - 里程碑关闭记录
  - 已知问题（已知不足 3-5 条，放入 v0.3.0 Backlog）

---

## 附录 A：交付件统计总表（8 周末端目标）

| 内容类型 | 当前 (W0) | 目标 (W8) | 新增 |
|---|---|---|---|
| 标准情报 (非 pitfall) | 114 | 154 | +40 |
| Pitfall 情报 | 73 | 103 | +30 |
| 情报合计 | 187 | 257（允许 10 篇 buffer）| +70（实际新增 70 = 40 标准+30 pitfall）|
| Glossary 术语 | 60 | 100 | +40 |
| 术语 .md 详情 | 60 | ≥ 92 | +32（80%）|
| Toolbox 工具注册链接 | 20/70 | 70/70 | +50 个 URL |
| Practice 项目 | 少量 | 新增 5 | +5 |
| Learning Paths | 3 | 8 | +5 |
| A 档 20 篇优化达标率 | N/A | 100% | — |
| B 档 40 篇优化达标率 | N/A | ≥ 90% | — |
| C 档 54 篇优化达标率 | N/A | ≥ 60% | — |
| "孤岛" intel 数量 | 约 25% = 46 | 0 | -46 |
| Vitest 用例数量 | 93 | ≥ 120 | +27 |
| Fuse 搜索覆盖率 | ~75% | ≥ 95% | +20pp |

---

## 附录 B：编号命名空间分块（避免冲突的硬规则）

| Owner | 命名空间范围 | 数量 | 实际使用 |
|---|---|---|---|
| R3（LLM intel 40 + 术语 14）| `content/intel/200-219-*` | 20 个编号 | 17 个（N-LLM-01…17）剩 3 备用 |
| R3（LLM pitfall 10 篇）| `content/intel/260-269-pitfall-*` | 10 个编号 | 10 个 P-LLM-01…10 |
| R4（CV 13 + 嵌入式 7 = 20）| `content/intel/220-239-*` | 20 个编号 | 13+7 = 20 |
| R4（CV pitfall 7 + DL pitfall 6）| `content/intel/270-281-pitfall-*` | 12 个编号 | 7+6 = 13？实际占用 13 → 多的 1 个放 282 |
| R4（嵌入式 pitfall 7）| `content/intel/283-289-pitfall-*` | 7 个编号 | 7 |
| R6（Cross 3 + Practice Toolbox Pitfall 10）| `content/intel/250-259-*` + `290-299-pitfall-*` | 10 + 10 | 3 交叉 intel + 7 pitfall 剩余 |
| R6 术语草稿 5 条 + 合并统一 | 无编号段，terms.json key 即 term slug | 全局唯一，无段限制 | 由 R6 去重后追加 |
