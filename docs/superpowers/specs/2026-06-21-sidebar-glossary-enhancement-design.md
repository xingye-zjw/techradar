# TechRadar 侧边栏 + 术语模块 + 模块强化 设计文档

> 日期：2026-06-21
> 方案：B（布局重构）
> 状态：待实施

---

## 1. 目标

1. 强化各模块特色：增加交互功能、跨模块联动、更详细科学准确的内容
2. 新增可折叠侧边栏：全局导航 + 页面内目录
3. 新增专业术语模块：独立百科页面 + 弹窗预览，其他模块可跳转
4. 每日任务独立成页：承载更丰富的结构化内容

---

## 2. 整体布局架构

将当前单列布局改为 **侧边栏 + 内容区** 双栏结构。

```
┌─────────────────────────────────────────────┐
│  TopBar (Logo + 搜索 + 移动端汉堡菜单)        │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │      Content Area                │
│ (240px)  │                                  │
│          │   ┌──────────────────────────┐   │
│ ──────── │   │  当前模块的子导航/目录     │   │
│ 全局导航  │   ├──────────────────────────┤   │
│ · 路线图  │   │                          │   │
│ · 情报    │   │      页面内容             │   │
│ · 工具箱  │   │                          │   │
│ · 踩坑    │   │                          │   │
│ · 术语    │   │                          │   │
│ ──────── │   │                          │   │
│ 页面目录  │   └──────────────────────────┘   │
│ · 当前节  │                                  │
│ · 子节点  │                                  │
├──────────┴──────────────────────────────────┤
│  Footer                                     │
└─────────────────────────────────────────────┘
```

### 关键决策

| 项目 | 设计 |
|------|------|
| 侧边栏宽度 | 展开 240px，收起 64px（仅图标） |
| 默认状态 | 桌面端展开，移动端收起 |
| 收起方式 | 侧边栏顶部按钮切换，状态存 localStorage |
| 内容区布局 | flex-1 自适应，最大宽度 1200px 居中 |
| 页面目录 | 侧边栏下半部分，根据当前路由动态显示 |

### 涉及文件

- `app/layout.tsx` — 重构为侧边栏 + 内容区布局
- 新建 `components/Sidebar.tsx` — 侧边栏主组件
- 新建 `components/SidebarSection.tsx` — 侧边栏分组
- 新建 `components/MobileMenu.tsx` — 移动端汉堡菜单

---

## 3. 侧边栏组件设计

### 全局导航区（固定）

```
┌────────────────────┐
│  ◢ TechRadar    ◀  │  ← Logo + 收起按钮
├────────────────────┤
│                    │
│  🗺️ 学习路线图      │  ← 当前页高亮（绿色边框）
│  📰 技术情报        │
│  🧰 工具推荐箱      │
│  ⚡ 踩坑避雷        │
│  📖 专业术语  NEW   │  ← 新增模块
│                    │
├────────────────────┤
│  当前页面 ········· │  ← 页面目录区标题
│                    │
```

### 页面目录区（动态，根据路由切换）

**路线图页 (`/roadmap`)：**

```
│  DevOps 方向        │
│    · Linux 基础     │
│    · Git & GitHub   │
│    · Docker         │
│  Math 方向          │
│    · 线性代数       │
│    · 概率与统计     │
│  CV 方向            │
│    · PyTorch        │
│    · CNN            │
```

**情报页 (`/intel`)：**

```
│  筛选标签           │
│    # Transformer    │
│    # YOLO           │
│    # LoRA           │
│    # RAG            │
```

**术语页 (`/glossary`)：**

```
│  按方向筛选         │
│    AI/ML            │
│    工程部署         │
│    数学基础         │
│  按首字母           │
│    A B C D ...      │
```

**工具箱页 (`/toolbox`)：**

```
│  工具分类           │
│    IDE / 编辑器     │
│    深度学习框架     │
│    数据处理         │
│    部署工具         │
│  按推荐度排序       │
```

**踩坑避雷页 (`/pitfall`)：**

```
│  问题分类           │
│    环境配置         │
│    训练问题         │
│    部署问题         │
│    常见报错         │
```

### 收起状态

```
┌──────┐
│ ◢ ◀  │
├──────┤
│  🗺️  │
│  📰  │
│  🧰  │
│  ⚡  │
│  📖  │
├──────┤
│      │
```

### 交互细节

| 行为 | 设计 |
|------|------|
| 鼠标悬停收起态图标 | 右侧浮出标签（tooltip）显示完整名称 |
| 当前页高亮 | 左侧 3px 绿色边框 + 背景色微亮 |
| 页面目录点击 | 平滑滚动到对应锚点 |
| 移动端 | 点击汉堡菜单 → 侧边栏从左侧滑入，带半透明遮罩 |

---

## 4. 术语模块设计

### 数据结构

```typescript
interface GlossaryTerm {
  slug: string;           // 唯一标识，如 "transformer"
  name: string;           // 术语名称
  nameEn?: string;        // 英文名（中文术语时用）
  category: string;       // 所属方向：ai-ml | engineering | math | project
  tags: string[];         // 标签，如 ["深度学习", "架构"]
  summary: string;        // 一句话概述（用于列表和弹窗预览）
  description: string;    // 详细解释（支持 Markdown）
  relatedTerms: string[]; // 关联术语 slug 列表
  relatedNodes: string[]; // 关联路线图节点 ID
  relatedIntel: string[]; // 关联情报 slug
  relatedTools: string[]; // 关联工具 ID
  resources?: ResourceLink[]; // 外部参考链接
}
```

### 路由结构

```
/glossary              → 术语列表页（搜索 + 筛选 + 字母索引）
/glossary/[slug]       → 术语详情页
```

### 术语详情页布局

```
┌─────────────────────────────────────────┐
│  ← 返回术语列表                          │
├─────────────────────────────────────────┤
│                                         │
│  Transformer                            │
│  #深度学习  #架构  #AI/ML               │
│                                         │
│  "一种基于自注意力机制的神经网络架构..."    │
│                                         │
│  ── 详细解释 ────────────────────────── │
│  Transformer 由 Vaswani 等人在 2017 年   │
│  提出，核心创新是自注意力机制...          │
│  [Markdown 渲染]                        │
│                                         │
│  ── 关联内容 ────────────────────────── │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ 📰 情报   │ │ 🗺️ 路线图 │ │ 🧰 工具  │ │
│  │ LoRA详解  │ │ CV-CNN   │ │ PyTorch │ │
│  └──────────┘ └──────────┘ └─────────┘ │
│                                         │
│  ── 关联术语 ────────────────────────── │
│  [Self-Attention] [BERT] [GPT]          │
│                                         │
│  ── 参考资料 ────────────────────────── │
│  · Attention Is All You Need (论文)     │
│  · Jay Alammar 可视化解释               │
└─────────────────────────────────────────┘
```

### 术语列表页功能

| 功能 | 说明 |
|------|------|
| 搜索 | 模糊搜索术语名称和描述（复用 fuse.js） |
| 按方向筛选 | AI/ML、工程部署、数学基础、项目管理 |
| 字母索引 | 快速跳转到首字母分组 |
| 标签筛选 | 点击标签过滤 |
| 卡片展示 | 名称 + 一句话概述 + 方向标签 |

### 数据文件结构

```
content/glossary/
├── terms.json         ← 术语索引（轻量，用于列表和搜索）
└── terms/
    ├── transformer.md ← 详细解释（Markdown，用于详情页）
    ├── cnn.md
    ├── docker.md
    └── ...
```

### 涉及文件

- `app/glossary/page.tsx` — 术语列表页
- `app/glossary/[slug]/page.tsx` — 术语详情页
- `lib/glossary.ts` — 术语数据层
- `content/glossary/terms.json` — 术语索引
- `content/glossary/terms/*.md` — 术语详细解释

---

## 5. 跨模块联动设计

### 术语在其他模块中的呈现

**路线图节点详情面板（`NodeDetailPanel.tsx`）：**

- 新增"本节术语"区块，术语可点击
- hover 弹窗预览（`summary`），点击跳转 `/glossary/[slug]`
- 新增"关联情报"和"关联工具"区块

**情报详情页（`/intel/[slug]`）：**

- Markdown 正文中的术语自动识别并标记
- 匹配 `terms.json` 中的术语名称
- 自动添加虚线下划线 + 青色高亮
- hover 弹窗预览，点击跳转术语详情页

**工具详情页（`/toolbox/[id]`）：**

- 显示相关术语、关联路线图、关联情报

### 弹窗预览组件

```typescript
interface TermPopoverProps {
  term: GlossaryTerm;
  children: React.ReactNode;  // 触发元素
  showRelated?: boolean;      // 是否显示关联内容摘要
}
```

弹窗样式：

```
┌──────────────────────────────┐
│  Transformer    #AI/ML       │
│  ──────────────────────────  │
│  一种基于自注意力机制的神经   │
│  网络架构，广泛用于 NLP...    │
│                              │
│  关联：BERT · GPT · LoRA    │
│  → 查看详情                  │
└──────────────────────────────┘
```

### 关联数据流向

```
terms.json ──┬── 路线图节点（relatedNodes）
             ├── 情报卡片（relatedIntel）
             ├── 工具卡片（relatedTools）
             └── 术语之间（relatedTerms）

路线图数据 ──┬── 术语（节点的术语列表）
             └── 情报（节点关联的情报）

情报数据   ──┬── 术语（正文中匹配）
             └── 路线图（关联节点）
```

### 自动关联策略

- **情报正文**：运行时用 fuse.js 匹配 `terms.json` 中的术语，自动标记
- **路线图节点**：在 `roadmap-data.ts` 的节点中新增 `terms: string[]` 字段
- **工具卡片**：在 `tools.json` 中新增 `relatedTerms: string[]` 字段

### 涉及文件

- `components/TermPopover.tsx` — 弹窗预览组件
- `components/NodeDetailPanel.tsx` — 修改：增加术语/情报/工具关联
- `lib/roadmap-data.ts` — 修改：节点增加关联字段
- `content/intel/*.md` — 修改：正文中添加术语标记

---

## 6. 每日任务独立页面

### 路由结构

```
/roadmap/[node]/day/[day]   → 例如 /roadmap/cv-cnn/day/1
```

### 页面布局

```
┌──────────────────────────────────────────────────┐
│  ← 返回 CNN 经典架构                              │
├──────────────────────────────────────────────────┤
│                                                  │
│  D06 · CNN 经典架构                               │
│  Day 1 / 14 · 卷积层基础                          │
│  预计时长：2 小时                                  │
│                                                  │
│  ── 核心目标 ────────────────────────────────── │
│  理解卷积运算的数学原理，掌握 PyTorch 中           │
│  nn.Conv2d 的使用方法，能独立完成图像边缘检测      │
│                                                  │
│  ── 前置知识 ────────────────────────────────── │
│  · 线性代数：矩阵乘法                             │
│  · PyTorch：张量操作基础                          │
│  → [查看前置任务]  → [查看术语解释]               │
│                                                  │
│  ── 核心 API ────────────────────────────────── │
│                                                  │
│  nn.Conv2d(in_channels, out_channels,            │
│            kernel_size, stride=1, padding=0)     │
│  卷积层，提取局部特征                              │
│  参数详解：                                       │
│  · in_channels: 输入通道数（RGB=3）               │
│  · out_channels: 输出通道数（卷积核数量）          │
│  · kernel_size: 卷积核大小（通常 3×3）            │
│  · stride: 步长（默认 1）                         │
│  · padding: 填充（默认 0，'same' 保持尺寸）       │
│                                                  │
│  ── 知识要点 ────────────────────────────────── │
│                                                  │
│  1. 卷积的直觉理解                                │
│     把卷积核想象成一个"滑动窗口"，在图像上          │
│     从左到右、从上到下滑动，每到一个位置就          │
│     做一次逐元素乘法再求和                         │
│                                                  │
│  2. 为什么用卷积而不是全连接？                     │
│     · 参数共享：一个卷积核检测同一种特征            │
│     · 局部连接：只关注局部区域                      │
│     · 平移不变性：特征在哪里都能被检测到            │
│                                                  │
│  3. 输出尺寸计算公式                              │
│     out = (in - kernel + 2×padding) / stride + 1 │
│                                                  │
│  ── 场景实操 ────────────────────────────────── │
│                                                  │
│  实现一个 3×3 卷积核对 RGB 图像的边缘检测          │
│                                                  │
│  步骤：                                          │
│  1. 加载一张 RGB 图片，转为张量                    │
│  2. 定义一个 Sobel 边缘检测卷积核                  │
│  3. 用 F.conv2d 进行卷积                          │
│  4. 可视化输出特征图                              │
│                                                  │
│  起始代码：                                       │
│  ┌─────────────────────────────────────────┐    │
│  │ import torch                            │    │
│  │ import torch.nn.functional as F         │    │
│  │                                         │    │
│  │ # TODO: 加载图片并转为张量               │    │
│  │ # TODO: 定义 Sobel 卷积核                │    │
│  │ # TODO: 执行卷积                         │    │
│  │ # TODO: 可视化结果                       │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  [查看参考答案 ▼]                                 │
│                                                  │
│  ── 常见错误 ────────────────────────────────── │
│                                                  │
│  ⚠️ 错误 1: RuntimeError: expected stride...     │
│     原因：输入维度不对，Conv2d 需要 4D 张量       │
│     解决：用 unsqueeze(0) 添加 batch 维度        │
│                                                  │
│  ⚠️ 错误 2: 输出全是 0 或 NaN                    │
│     原因：输入没有归一化到 [0,1]                   │
│     解决：img.float() / 255.0                    │
│                                                  │
│  ── 检查点 ──────────────────────────────────  │
│  □ 能手写 Conv2d 的参数含义                       │
│  □ 能计算给定输入的输出尺寸                       │
│  □ 成功运行边缘检测并看到结果                     │
│                                                  │
│  ── 本节术语 ────────────────────────────────── │
│  [卷积层] [卷积核] [特征图] [池化] [步长] [填充]  │
│                                                  │
│  ── 推荐资源 ────────────────────────────────── │
│  📖 CS231n Lecture 5 (需镜像) ⚠️                 │
│  📖 PyTorch Conv2d 官方文档                      │
│  📖 3Blue1Brown: 卷积的直觉                      │
│  🎬 李宏毅 CNN 讲解 (B站)                        │
│                                                  │
│  ── 关联情报 ────────────────────────────────── │
│  📰 YOLO 目标检测实战                             │
│                                                  │
│  ── 关联工具 ────────────────────────────────── │
│  🧰 PyTorch · Jupyter Notebook · Google Colab    │
│                                                  │
├──────────────────────────────────────────────────┤
│  ← Day 0 (前置)              Day 2 (下一步) →    │
│                                                  │
│  ████████░░░░░░░░░░░░░░░░  7% (1/14 天)         │
│  [标记为已完成 ✓]                                 │
└──────────────────────────────────────────────────┘
```

### 路线图节点详情面板调整

原来右侧面板展示任务详情，改为任务列表 + 链接：

```
┌─────────────────────────────────┐
│  D06 · CNN 经典架构              │
│  14 天 · CV 方向                 │
│  ─────────────────────────────  │
│                                 │
│  学习概览                        │
│  掌握 CNN 的核心架构和应用...     │
│                                 │
│  每日任务列表                    │
│  ┌─────────────────────────┐   │
│  │ Day 1  卷积层基础    →   │   │
│  │ Day 2  池化与步长    →   │   │
│  │ Day 3  经典架构      →   │   │
│  │ ...                     │   │
│  └─────────────────────────┘   │
│                                 │
│  关联术语 / 情报 / 工具          │
└─────────────────────────────────┘
```

### 每日任务数据结构

```typescript
interface TaskContent {
  objective: string;
  prerequisites?: Prerequisite[];
  api_checklist: ApiItem[];
  key_points?: KeyPoint[];
  practice: PracticeTask;
  common_mistakes?: Mistake[];
  answer?: string;
  checkpoint: string[];
}

interface Prerequisite {
  term: string;
  nodeId?: string;
  termSlug?: string;
}

interface ApiItem {
  name: string;
  signature: string;
  description: string;
  params?: ParamDetail[];
}

interface ParamDetail {
  name: string;
  type: string;
  default?: string;
  description: string;
}

interface KeyPoint {
  title: string;
  content: string;
}

interface PracticeTask {
  description: string;
  steps: string[];
  starterCode?: string;
  answer?: string;
}

interface Mistake {
  title: string;
  symptom: string;
  cause: string;
  solution: string;
}
```

### 涉及文件

- `app/roadmap/[node]/day/[day]/page.tsx` — 新增：任务独立页面
- `components/NodeDetailPanel.tsx` — 修改：任务列表改为链接
- `components/radar/RoadmapGraph.tsx` — 修改：节点点击行为
- `lib/roadmap-data.ts` — 修改：节点数据增加关联字段 + 结构化任务内容

---

## 7. 交互功能设计

使用 `localStorage` 存储交互数据（静态站点无后端）。

### 1. 学习进度追踪

```typescript
interface LearningProgress {
  nodes: Record<string, NodeProgress>;
  lastVisited?: { node: string; day: number; timestamp: number };
}

interface NodeProgress {
  completedDays: number[];
  startedAt?: number;
  lastVisitedAt?: number;
}
```

呈现位置：

| 位置 | 展示方式 |
|------|----------|
| 路线图节点 | 节点右下角显示 `3/14` 进度标签 |
| 节点详情面板 | 任务列表每项显示 ✓ / ○ 状态 |
| 每日任务页 | 底部进度条 + "标记为已完成" 按钮 |
| 侧边栏页面目录 | 任务列表前显示 ✓ / ○ |

### 2. 术语收藏

```typescript
interface Favorites {
  terms: string[];
  intel: string[];
  nodes: string[];
}
```

交互方式：
- 术语详情页：标题旁 ♡ 按钮，点击切换为 ♥
- 情报详情页：标题旁收藏按钮
- 路线图节点面板：节点标题旁收藏按钮
- 侧边栏：新增"我的收藏"快捷入口（仅当有收藏时显示）

### 3. 最近访问记录

```typescript
interface RecentVisit {
  type: 'node' | 'intel' | 'tool' | 'glossary' | 'task';
  slug: string;
  title: string;
  visitedAt: number;
}
```

呈现位置：
- 首页：显示最近 5 条访问记录
- 侧边栏底部：最近 3 条快捷访问

### 4. 数据持久化

```typescript
// lib/storage.ts
const STORAGE_KEYS = {
  PROGRESS: 'techradar_progress',
  FAVORITES: 'techradar_favorites',
  RECENT: 'techradar_recent',
  SIDEBAR_STATE: 'techradar_sidebar',
} as const;

export function getProgress(): LearningProgress { ... }
export function saveProgress(data: LearningProgress): void { ... }
export function toggleFavorite(type: string, slug: string): void { ... }
export function addRecentVisit(visit: RecentVisit): void { ... }
```

### 涉及文件

| 文件 | 说明 |
|------|------|
| `lib/storage.ts` | 统一的 localStorage 管理层 |
| `lib/progress.ts` | 学习进度逻辑 |
| `lib/favorites.ts` | 收藏逻辑 |
| `lib/recent.ts` | 最近访问逻辑 |
| `components/FavoriteButton.tsx` | 收藏按钮组件 |
| `components/ProgressBar.tsx` | 进度条组件 |
| `components/RecentList.tsx` | 最近访问列表 |

---

## 8. 完整文件清单

### 新增页面路由

| 文件 | 说明 |
|------|------|
| `app/glossary/page.tsx` | 术语列表页 |
| `app/glossary/[slug]/page.tsx` | 术语详情页 |
| `app/roadmap/[node]/day/[day]/page.tsx` | 每日任务详情页 |

### 新增组件

| 文件 | 说明 |
|------|------|
| `components/Sidebar.tsx` | 侧边栏主组件 |
| `components/SidebarSection.tsx` | 侧边栏分组 |
| `components/MobileMenu.tsx` | 移动端汉堡菜单 |
| `components/TermPopover.tsx` | 术语弹窗预览 |
| `components/FavoriteButton.tsx` | 收藏按钮 |
| `components/ProgressBar.tsx` | 进度条 |
| `components/RecentList.tsx` | 最近访问列表 |

### 新增数据层

| 文件 | 说明 |
|------|------|
| `lib/glossary.ts` | 术语数据读取 |
| `lib/storage.ts` | localStorage 统一管理 |
| `lib/progress.ts` | 学习进度 |
| `lib/favorites.ts` | 收藏功能 |
| `lib/recent.ts` | 最近访问 |

### 新增内容

| 文件 | 说明 |
|------|------|
| `content/glossary/terms.json` | 术语索引 |
| `content/glossary/terms/*.md` | 术语详细解释 |

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `app/layout.tsx` | 重构为侧边栏 + 内容区布局 |
| `components/NodeDetailPanel.tsx` | 任务列表改为链接，增加术语/情报/工具关联 |
| `lib/roadmap-data.ts` | 节点增加关联字段，任务内容结构化 |
| `content/intel/*.md` | 正文中添加术语标记 |
| `content/toolbox/tools.json` | 增加 relatedTerms 字段 |

---

## 9. 内容丰富度对比

| 维度 | 原状 | 改造后 |
|------|------|--------|
| API | 简单列表 | 签名 + 参数详解 + 一句话说明 |
| 实操 | 一段描述 | 分步骤 + 起始代码 + 参考答案 |
| 知识点 | 无 | 结构化的要点解释 |
| 错误处理 | 无 | 常见错误 + 症状 + 原因 + 解法 |
| 前置知识 | 无 | 关联节点 + 术语链接 |
| 学习路径 | 无 | 前后任务导航 + 进度条 |
| 模块联动 | 弱 | 术语连接器 + 弹窗预览 + 跳转 |
| 交互 | 无 | 进度追踪 + 收藏 + 最近访问 |
