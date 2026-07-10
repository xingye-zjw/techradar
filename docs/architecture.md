# TechRadar 项目技术架构文档

> 版本：v1.0 · 2026-07-10
> 适用范围：TechRadar 开源技术学习导航平台（静态导出 / Cloudflare Pages 部署）

---

## 1. 项目定位

TechRadar 是一个面向大学生与初级工程师的 **AI + 工程硬核技术学习导航系统**，核心价值是把零散的技术知识结构化：

- 情报卡片（Intel Card）= **"技术是什么 + 怎么跑通"** 的最小行动单元
- 学习路线图（Roadmap Graph）= **跨技术的依赖拓扑图**，帮学习者按顺序走
- 术语库（Glossary）= **一句话定义 + 延伸阅读** 的快捷查询面板
- 踩坑避雷（Pitfall）= **生产/学习高频失败模式** 的根因 + 快速修复
- 工具箱（Toolbox）= **按场景推荐工具链**（含 GitHub 活跃度）
- 实战项目（Practice）= **端到端可复现项目**（步骤 + 代码 + 检查点）

---

## 2. 技术栈一览

| 层级 | 技术选型 | 版本 | 作用 |
|---|---|---|---|
| **UI 框架** | Next.js App Router | 14.2.35 | 服务器组件静态生成 + 客户端交互岛 |
| **语言** | TypeScript | 5.x | 全量强类型（数据层到组件 props） |
| **样式** | Tailwind CSS + Radix UI + shadcn 风格组件 | 3.4.4 / 1.x | 原子化 CSS + 无障碍基础组件 |
| **可视化** | @xyflow/react + dagre | 12.x / 0.8.5 | 路线图有向图渲染与自动布局 |
| **内容解析** | gray-matter | 4.0.3 | Markdown frontmatter (YAML) 解析 |
| **搜索** | Fuse.js | 7.x | 轻量客户端模糊搜索（无后端） |
| **数据校验** | Zod | 3.x | 内容类型运行时校验（非构建期） |
| **存储** | localStorage + IndexedDB（progress SSOT） | — | 用户进度 / 收藏 / 配置，纯前端 |
| **构建** | Next.js `output: "export"` | — | 纯静态 HTML/JS/CSS，零运行时依赖 |
| **部署** | Cloudflare Pages | — | 全球 CDN、支持 `_headers`/`_redirects` |
| **质量门禁** | ESLint + Prettier + Vitest + Husky + lint-staged | — | pre-commit 代码规范 + 单测 |
| **CI/CD** | GitHub Actions (.github/workflows/ci.yml) | — | PR/push 触发 lint + test + build + 内容审计 |
| **Node 要求** | Node.js LTS | ≥ 20.0.0 | `.nvmrc` 与 `package.json engines` 双重锁定 |

---

## 3. 架构分层（Top-Down）

```
┌──────────────────────────────────────────────────────────┐
│  Deployment Layer: Cloudflare Pages (static hosting)     │
│   ├── _headers (CSP / Cache-Control / CORS)              │
│   └── _redirects (路由回退 + 短链)                        │
├──────────────────────────────────────────────────────────┤
│  Build Layer: Next.js static export (next build)         │
│   └── prebuild: scripts/prebuild-search-index.mjs        │
│       └── 生成 public/search-index.json (Fuse.js ready)  │
├──────────────────────────────────────────────────────────┤
│  App Router Pages (app/**/*.tsx) [SSG]                   │
│   ├── /                  Homepage 精选路线图                │
│   ├── /roadmap           Graph 可视化 + 详情面板            │
│   ├── /roadmap/[node]/day/[day]   DailyTask 学习页        │
│   ├── /intel             情报列表 + /intel/[slug] 详情     │
│   ├── /glossary          术语列表 + /glossary/[slug] 详情  │
│   ├── /pitfall           踩坑列表（按 category 筛选）       │
│   ├── /toolbox           工具箱列表 + /toolbox/[id] 详情   │
│   ├── /practice          实战项目列表 + /practice/[slug]   │
│   ├── /search            全量模糊搜索页                    │
│   ├── /sitemap.xml       SEO 动态站点地图                  │
│   └── /robots.txt        SEO 爬虫规则                      │
├──────────────────────────────────────────────────────────┤
│  UI Components (components/**/*.tsx) [RSC + Client]      │
│   ├── radar/             RoadmapGraph / NodeDetailPanel  │
│   ├── practice/          ProjectCard / StepCard          │
│   ├── pitfall/           PitfallListClient               │
│   └── shared             Sidebar / GlobalCommandPalette  │
│                         / ProgressOverview / TermPopover │
├──────────────────────────────────────────────────────────┤
│  Core Lib (lib/**/*.ts) [SSOT, zero-client-deps]         │
│   ├── content-types.ts   ALL 类型定义（Single Truth）      │
│   ├── constants.ts       INTEL_LINKS / NODE_NAMES /       │
│   │                    TOOL_IDS / CATEGORY_COLORS        │
│   ├── intel.ts           getAllIntelCards() 磁盘读取      │
│   ├── glossary.ts        术语索引 + 详情合并               │
│   ├── pitfall.ts         踩坑聚合（pitfall.json + intel/）│
│   ├── toolbox.ts         tools.json 加载                  │
│   ├── practice.ts        projects.json 加载               │
│   ├── roadmap-data.ts    RoadmapNode[] 完整拓扑           │
│   ├── roadmap-index.ts   图遍历/依赖/建议算法             │
│   ├── progress.ts        进度 SSOT（import/export）        │
│   ├── storage.ts         IndexedDB/localStorage 封装      │
│   ├── security.ts        schema 校验 + 数据清洗            │
│   ├── search.ts          搜索文档生成                     │
│   ├── recommendations.ts 基于进度/收藏的 next-step 推荐     │
│   └── terms.ts           术语元数据（与 content/ 解耦）     │
├──────────────────────────────────────────────────────────┤
│  Content Layer (content/**) [Source of Truth, 手写维护]   │
│   ├── intel/*.md         187 篇 Intel 卡片                │
│   │   ├── frontmatter: title/category/keywords/difficulty│
│   │   │                duration/summary/takeaways +      │
│   │   │                tags/related{Intel,Terms,Nodes,Tools}│
│   │   └── body:         6 段式章节（动机→概览→拆解→        │
│   │                      跑通→误区→学习顺序）               │
│   ├── glossary/terms.json  60+ 术语 definition/relations  │
│   ├── glossary/terms/*.md  ~60 篇术语深度拓展（可选）       │
│   ├── pitfall/  (已弃用，合并到 content/intel/ pitfall-*) │
│   ├── toolbox/tools.json   70 款工具 + 10+ 使用场景       │
│   └── practice/projects.json 实战项目清单                  │
├──────────────────────────────────────────────────────────┤
│  Script Layer (scripts/**/*.py / *.mjs) [审计/批处理]     │
│   ├── 批量填充类 fill-batchN.py / add-*.py                │
│   ├── 质量审计类 audit-content*.py / content-quality-check│
│   ├── 一致性检查类 check-*.py / track-check.py           │
│   ├── 修复类 fix-*.py / _hotfix_*.py / migrate-*.py      │
│   └── 预检类 prebuild-search-index.mjs                    │
└──────────────────────────────────────────────────────────┘
```

---

## 4. 核心数据流（Content → UI）

```
         .md 手写            .json 手写
            │                     │
            ▼                     ▼
   gray-matter 解析 YAML      JSON.parse
            │                     │
            ▼                     ▼
   lib/intel.ts:             lib/{toolbox,pitfall,glossary,practice}.ts
   parseIntelCard(file)        原生对象 → 类型窄化
   生成 IntelCard{slug, …}         │
            │                     │
            └──── IntelCard[] ────┘
                     │
                     ▼
           lib/roadmap-data.ts
           RoadmapNode[] 中 relatedIntel/Terms/Tools
           通过 slug 与内容层关联（引用完整性由
           check-constants.py 在构建前 / PR 时验证）
                     │
                     ▼
           lib/constants.ts
           INTEL_LINKS[slug]=title
           NODE_NAMES[id]=name    ⬅──── 运行时查找的"注册表"
           TOOL_IDS[id]=doc_url
                     │
                     ▼
           App Server Component (generateStaticParams)
           构建时 materialize 全量静态路由
                     │
                     ▼
           Client 交互岛：进度写入 storage.ts
                  → progress.ts SSOT 更新
                  → security.ts 做 zod schema 校验
                  → 触发 recommendations.ts 下一轮推荐
```

### 4.1 引用完整性约束（关键不变式）

```typescript
// 这些约束 = check-constants.py 审计 + 方案 P0 双保险
For every file in content/intel/*.md:
  (slug = basename sans .md) must be a key in INTEL_LINKS

For every RoadmapNode.id in roadmap-data.ts:
  id must be a key in NODE_NAMES (双向 1:1, 0 missing / 0 extra)

For every "relatedNodes" in any content/intel frontmatter:
  every item ∈ NODE_NAMES (否则 → "悬垂引用"需修)

For every "relatedTools" item:
  should exist in TOOL_IDS (否则 链接降级为纯文本)
```

---

## 5. CI/CD 流水线

### 5.1 提交前（local）—— Husky + lint-staged

```
git commit
    │
    ▼
pre-commit (lint-staged)
  ├── 只对暂存的 .ts/.tsx/.js → eslint --fix + prettier
  └── 只对暂存的 .md/.json → prettier --write
```

### 5.2 PR 时（remote）—— GitHub Actions `ci.yml`

| Job | 触发 | 脚本 | 失败是否拦截合并 |
|---|---|---|---|
| **ci** | push / PR → main/master | `npm ci → lint:ci → test → build` | **是（硬门禁）** |
| **content-audit** | push / PR → main/master | `audit-content3.py + validate-content.ts` | 否（continue-on-error，只提示） |

### 5.3 构建产物

- `next build` + `output: "export"` → `out/` 纯静态目录
- `public/sw.js` = PWA Service Worker
- `public/manifest.webmanifest` = PWA 清单
- `public/search-index.json` = 预构建 Fuse.js 搜索索引（prebuild 钩子按需生成）

---

## 6. 关键架构决策记录 (ADR)

| ADR | 决策 | 动机 & 权衡 |
|---|---|---|
| ADR-001 | **纯静态导出、无后端** | 1) 部署成本=0；2) 学习型网站读远多于写；3) 用户进度放本地即可（无需账号系统）。代价：无服务器端个性化。 |
| ADR-002 | **内容 SSOT = 磁盘 Markdown/JSON，不是数据库** | 1) Git diff 可审阅；2) 非工程师也能改；3) 版本历史天然存在。代价：批量操作需脚本批处理。 |
| ADR-003 | **引用 ID 做"注册表（constants.ts）"双向校验** | 内容层是手写的、天生会漏；通过"注册表 + 构建前审计脚本"实现 0 悬垂引用。 |
| ADR-004 | **进度数据用"SSOT + 导出/导入 JSON"** | 无后端意味着跨设备同步靠导出。未来可替换成 Supabase 等云 DB，接口不变。 |
| ADR-005 | **RoadmapNode.dailyTasks 直接嵌入 Node 而非独立文件** | 一个节点 3-7 天任务强耦合，拆成多文件只有坏处（找不到跨引用）。 |
| ADR-006 | **Pitfall 同时作为 pitfall.json（旧）+ intel pitfall-*.md（新）双源** | 新格式统一通过 `getAllIntelCards` 加载，保留 pitfall.ts 向后兼容到 S-CONTENT 大版迭代后删除。 |
