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
│   ├── toolbox.ts         # 工具推荐算法
│   ├── terms.ts           # 术语数据处理
│   └── terms.json         # 术语数据（50+ 专业术语）
├── content/                # 静态内容
│   ├── intel/*.md         # 18 篇技术情报
│   ├── toolbox/tools.json
│   └── pitfall/pitfalls.json
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

- 18 篇 Markdown 格式的情报卡片
- 涵盖 Transformer、YOLO、LoRA、RAG 等热门技术
- 支持 slug 动态路由

### 3. 工具推荐箱 (`/toolbox`)

- 推荐各类开发工具
- 与情报卡片智能关联

### 4. 踩坑避雷 (`/pitfall`)

- 常见问题 FAQ 集合

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

---

## 📝 待办事项

- [ ] 其他节点（D03-D14 及其他方向）迁移到新的结构化内容格式
- [ ] robots.ts 和 sitemap.ts 中的域名需替换为实际域名

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
