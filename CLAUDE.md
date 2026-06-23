# TechRadar 项目记忆文档

## 📋 项目基本信息

| 项目 | 说明 |
|------|------|
| **名称** | TechRadar 极客雷达 |
| **定位** | AI 驱动的大学生硬核开源实战导航系统 |
| **技术栈** | Next.js 14 + React 18 + TypeScript + Tailwind CSS + shadcn/ui |
| **仓库** | https://github.com/xingye-zjw/techradar |
| **部署** | Cloudflare Pages（静态导出） |

---

## 🏗️ 项目结构

```
techradar/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页（搜索 + 导航卡片）
│   ├── layout.tsx         # 根布局（国内 CDN 字体镜像 + Toast 容器）
│   ├── roadmap/           # 学习路线图（DAG 可视化）
│   ├── intel/             # 技术情报列表 + [slug] 动态详情页
│   ├── glossary/          # 专业术语表
│   ├── search/            # 全站搜索页
│   ├── toolbox/           # 工具推荐箱
│   └── pitfall/           # 踩坑避雷指南
├── components/             # UI 组件
│   ├── radar/             # 核心组件
│   │   ├── RoadmapGraph.tsx   # 路由图 DAG 可视化（@xyflow/react）
│   │   ├── NodeDetailPanel.tsx # 右侧详情面板（术语 Tooltip + Toast 反馈）
│   │   ├── TermTooltip.tsx    # 术语 Tooltip 组件
│   │   ├── types.ts           # 类型定义
│   │   └── SearchBar.tsx      # 模糊搜索（fuse.js）
│   ├── PageTransition.tsx # 页面过渡动画组件
│   ├── Skeleton.tsx       # 骨架屏组件
│   └── Toast.tsx          # Toast 反馈组件
├── lib/                    # 业务逻辑
│   ├── roadmap-data.ts    # 全量路线图数据（~230KB）
│   ├── intel.ts           # Markdown 情报解析
│   ├── intel-meta.ts      # 情报分类元数据
│   ├── glossary.ts        # 术语数据处理
│   ├── toolbox.ts         # 工具推荐算法
│   ├── terms.ts           # 术语数据处理
│   ├── terms.json         # 术语数据（50+ 专业术语）
│   ├── content-types.ts   # 统一内容类型定义（ContentCategory）
│   └── content-validator.ts # 数据验证器
├── scripts/                # 构建脚本
│   └── validate-content.ts # 内容验证脚本
├── content/                # 静态内容
│   ├── intel/*.md         # 技术情报
│   ├── glossary/          # 术语数据
│   │   ├── terms.json     # 术语索引
│   │   └── terms/*.md     # 术语详情
│   ├── toolbox/tools.json # 工具推荐
│   └── pitfall/pitfalls.json # 踩坑记录
├── templates/              # 内容模板
│   ├── intel/             # 情报模板
│   ├── glossary/          # 术语模板
│   ├── pitfall/           # 踩坑模板
│   └── toolbox/           # 工具箱模板
├── docs/                   # 开发文档
│   └── content-spec.md    # 内容规范文档
└── next.config.js          # 静态导出配置
```

---

## 🎯 核心功能模块

### 1. 学习路线图 (`/roadmap`)

- **5 个技术方向**：计算机视觉(CV)、自然语言处理(NLP)、工程部署(DevOps)、数学基础(Math)、综合项目(Project)
- **14 个核心节点**：linux-basic → git-github → docker-basic → math-linear-algebra → math-probability → pytorch-core → cv-cnn → ...

#### 每日任务数据结构（新格式）

```typescript
interface TaskContent {
  objective: string;        // 核心目标：一两句话概括本节重点
  api_checklist: string[];  // 核心 API / 知识点：必须掌握的具体函数或操作
  practice: string;         // 场景实操：一个非常具体的微型任务
  answer?: string;          // 参考答案：可选，折叠显示
}

interface DailyTask {
  day: number;
  title: string;
  content: TaskContent | string | string[];  // 支持新旧两种格式
  duration: string;
  resources?: ResourceLink[];
  checkpoint: string;
}
```

#### UI 样式规范

- **小标题**：`text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider`
- **API 高亮**：`bg-zinc-800 text-cyan-300 font-mono px-1.5 py-0.5 rounded text-sm`
- **实操区块**：`border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-500/10 to-transparent pl-4 pr-3 py-3 rounded-r-lg`
- **悬停效果**：`hover-lift` / `hover-lift-subtle` 工具类
- **术语标记**：`TermTooltip` 组件，虚线下划线 + hover/点击显示解释

### 2. 技术情报 (`/intel`)

- 42 篇 Markdown 格式的情报卡片
- 涵盖 Transformer、YOLO、LoRA、RAG 等热门技术
- 支持 slug 动态路由
- 自动计算阅读时间和标签

### 3. 专业术语 (`/glossary`)

- 20+ 术语详解
- 支持按分类、标签筛选
- 术语间关联关系

### 4. 工具推荐箱 (`/toolbox`)

- 14 个开发工具推荐
- 7 个使用场景
- 与情报卡片智能关联

### 5. 踩坑避雷 (`/pitfall`)

- 17 条常见问题 FAQ
- 结构化解决方案

---

## 🎨 设计风格

| 元素 | 样式 |
|------|------|
| **主题** | 暗色模式 (`<html className="dark">`) |
| **主色调** | 绿色 `#00ff88` + 青色 `#00d4ff` |
| **背景** | 深黑 `#0a0a0a` |
| **字体** | Instrument Sans + JetBrains Mono |
| **字体来源** | 国内 CDN 镜像 (`fonts.loli.net`) |

### CSS 变量

```css
--bg: #0a0a0a;
--bg2: #141414;
--bg3: #1c1c1c;
--ink: #e8e8e8;
--muted: #888888;
--rule: #2a2a2a;
--accent: #00ff88;
--accent2: #00d4ff;
```

---

## 🔧 已完成的优化

### 1. 国内访问优化

- Google Fonts 改用国内 CDN 镜像 (`fonts.loli.net`)
- 配置 `output: 'export'` 静态导出给 Cloudflare Pages

### 2. 每日任务重构

- 从纯代码片段 → 结构化内容（objective/api_checklist/practice）
- 新增 API 函数名高亮样式
- 新增实操区块（blockquote 样式）
- 兼容旧格式数据（string | string[] | TaskContent）

### 3. 修复的问题

- 修复 `math-probability` 节点 URL 缺少引号的语法错误

### 4. 全站跨模块增强（阶段 1-4）

- 全站跨模块搜索（路线图/情报/工具/踩坑）
- 路由图节点显示学习进度和关联内容
- 情报卡片标签筛选和阅读时间
- 工具详情页显示关联情报和路线图节点

### 5. 每日任务增强（阶段 5）

- 实操区块优化：更醒目的样式 + "查看答案"折叠面板
- 资源链接优化：自动识别需要国内镜像的链接并显示提示
- 专业术语 Tooltip：50+ 术语数据，hover/点击显示解释
- 支持 `answer` 字段：可选的参考答案折叠显示

### 6. 视觉体验增强（阶段 6）

- 页面过渡动画：`PageTransition` 组件 + 全局 fade-in 效果
- 悬停效果增强：`hover-lift` / `hover-lift-subtle` 工具类
- 骨架屏组件：`Skeleton` + 多种预设样式（卡片/列表/任务/情报/工具）
- Toast 反馈组件：成功/失败/信息/警告四种类型，自动消失

### 7. 内容格式统一（阶段 7）

- 统一内容类型系统：`lib/content-types.ts` 定义 `ContentCategory` 枚举
- 数据验证器：`lib/content-validator.ts` 提供统一的数据验证
- 验证命令：`npm run validate-content` 验证所有内容数据
- 分类枚举扩展：支持 20 种内容分类，涵盖所有模块

---

## 📝 待办事项

- [x] 内容格式统一（ContentCategory + 验证器）
- [ ] 其他节点（D03-D14 及其他方向）迁移到新的结构化内容格式
- [ ] robots.ts 和 sitemap.ts 中的域名需替换为实际域名
- [ ] 扩展更多技术方向（NLP、强化学习等）

---

## 📚 内容规范模板体系

### 模板目录

```
templates/
├── intel/             # 情报模板
│   └── template.md
├── glossary/          # 术语模板
│   ├── terms.json.template
│   └── term-detail.md
├── pitfall/           # 踩坑模板
│   └── pitfalls.json.template
└── toolbox/           # 工具箱模板
    └── tools.json.template
```

### 规范文档

- `docs/content-spec.md` - 完整的内容规范文档
- `templates/README.md` - 模板使用说明

### 快速参考

#### 情报模板 (Intel)

```yaml
---
title: [技术名称]
category: [分类slug]
keywords: [关键词]
difficulty: [beginner/intermediate/advanced]
duration: [预计学习时长]
summary: [一句话概要]
takeaways:
  - [你将学到什么]
---
```

#### 术语模板 (Glossary)

```json
{
  "term": "[英文术语名]",
  "slug": "[url-friendly-slug]",
  "definition": "[术语定义]",
  "category": "[cv/llm/infrastructure/math/deployment]",
  "relatedTerms": ["[关联术语slug]"]
}
```

#### 踩坑模板 (Pitfall)

```json
{
  "title": "[问题标题]",
  "category": "[环境配置/训练/部署/数据处理/开发协作/LLM]",
  "symptoms": ["[错误信息]"],
  "solution": ["[解决步骤]"],
  "quickFix": "[快速修复]",
  "tags": ["[标签]"]
}
```

#### 工具箱模板 (Toolbox)

```json
{
  "name": "[工具名称]",
  "category": "[分类]",
  "purpose": "[用途说明]",
  "install": "[安装命令]",
  "features": ["[特性]"],
  "github": {
    "stars": "[star数]",
    "last_release": "[发布日期]",
    "url": "[仓库URL]"
  },
  "difficulty": "[beginner/intermediate/advanced]",
  "official_url": "[官方文档]",
  "use_cases": ["[使用场景]"]
}
```

### 扩展新方向指南

当需要添加新的技术方向时：

1. **情报分类**: 在 `lib/intel-meta.ts` 中添加新的 category
2. **术语分类**: 在 `lib/glossary.ts` 中添加新的 category
3. **路线图节点**: 在 `lib/roadmap-data.ts` 中添加新的 track 和 node
4. **工具分类**: 在 `content/toolbox/tools.json` 中使用新的 category

---

## 🚀 部署配置

### Cloudflare Pages 设置

- 构建命令：`npm run build`
- 输出目录：`out`
- 环境变量：无需配置

### 本地开发

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建静态导出
```

### next.config.js 配置

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}
module.exports = nextConfig
```

---

## 📦 关键依赖

| 包名 | 用途 |
|------|------|
| `@xyflow/react` | 路由图 DAG 可视化 |
| `fuse.js` | 客户端模糊搜索 |
| `gray-matter` | Markdown frontmatter 解析 |
| `shadcn/ui` | UI 组件库 |

---

## 📂 路由图节点清单

### DevOps 方向

1. `linux-basic` - Linux 系统基础（2周）
2. `git-github` - Git & GitHub 协作（2周）
3. `docker-basic` - Docker 容器化（2周）

### Math 方向

4. `math-linear-algebra` - 线性代数（2周）
5. `math-probability` - 概率与统计（2周）

### CV 方向

6. `pytorch-core` - PyTorch 框架（2周）
7. `cv-cnn` - CNN 经典架构（2周）

### NLP 方向

（待补充）

### Project 方向

（待补充）

---

## 🔄 更新日志

### 2024-06-21

- 配置静态导出支持 Cloudflare Pages
- 重构 D01/D02 为结构化内容格式
- 新增 API 高亮和实操区块样式
- 修复 math-probability URL 语法错误
- 配置国内 CDN 字体镜像

### 2026-06-21

- **阶段 1-4 完成**：全站跨模块增强
  - 全站跨模块搜索（路线图/情报/工具/踩坑）
  - 路由图节点显示学习进度和关联内容
  - 情报卡片标签筛选和阅读时间
  - 工具详情页显示关联情报和路线图节点
- **阶段 5 完成**：每日任务增强
  - 实操区块优化 + "查看答案"折叠面板
  - 资源链接国内镜像提示
  - 专业术语 Tooltip（50+ 术语）
  - TaskContent 新增 answer 字段
- **阶段 6 完成**：视觉体验增强
  - PageTransition 页面过渡动画
  - hover-lift 悬停效果
  - Skeleton 骨架屏组件
  - Toast 反馈组件

### 2026-06-22

- **阶段 7 完成**：内容格式统一
  - 新增统一内容类型系统（`content-types.ts`）
  - 新增数据验证器（`content-validator.ts`）
  - 扩展 ContentCategory 枚举：支持 20 种分类
  - 新增内容验证脚本（`npm run validate-content`）
  - 更新文档：content-spec.md 和 CLAUDE.md

### 2026-06-22

- **首页优化**：将"实战项目"功能添加到首页
  - 首页新增实战项目导航卡片（序号 06）
  - 首页展示精选实战项目（难度 2-3，适合入门）
  - 全站搜索支持实战项目搜索
  - 搜索索引添加"项目"类型
  - 内容验证器新增项目验证函数
  - 更新验证脚本支持实战项目验证
  - 更新搜索页面描述，添加"实战项目"说明

- **首页优化**：增加热门技术情报展示
  - 首页新增热门技术情报区域（6 篇精选情报）
  - 展示难度标签、阅读时间、标题、摘要、关键词
  - 支持点击跳转到情报详情页
  - 底部有"查看全部情报"链接

- **数据清理**：修复资源链接中的重复视频问题
  - 删除多个使用错误视频 ID 的资源链接（BV1qS4y1T7Cb、BV1RG4y1q7Mf、BV1Vy4y1s7k6 等）
  - 总计清理约 150+ 条错误视频链接
