# 路线图渐进式优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化路线图的 DAG 布局、节点详情面板和路径推荐功能，提升用户体验。

**Architecture:** 在现有架构上渐进式优化，调整 dagre 布局参数、增强节点详情面板、添加路径推荐功能。

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, dagre, @xyflow/react

## Global Constraints

- 暗色模式主题不变，沿用现有设计系统
- 数据存储使用 JSON 文件（`lib/learning-paths.ts`）
- 路由使用 Next.js App Router
- 样式沿用项目设计系统（`#0a0a0a` 背景、`#00ff88` 主色调）
- 保持向后兼容，现有功能不能因优化而中断

---

## File Structure

| 操作 | 文件 | 职责 |
|------|------|------|
| Modify | `lib/layout.ts` | 调整 dagre 布局参数 |
| Modify | `components/radar/RoadmapGraph.tsx` | 添加布局方向切换按钮 |
| Modify | `components/radar/NodeDetailPanel.tsx` | 增强节点详情面板 |
| Create | `lib/learning-paths.ts` | 学习路径数据 |
| Create | `components/radar/PathSelector.tsx` | 路径选择器组件 |

---

### Task 1: DAG 布局参数调优

**Files:**
- Modify: `lib/layout.ts`
- Modify: `components/radar/RoadmapGraph.tsx`

**Interfaces:**
- Consumes: `RoadmapNode[]` from `lib/roadmap-data.ts`
- Produces: 优化后的布局参数和方向切换功能

- [ ] **Step 1: 调整 dagre 配置参数**

在 `lib/layout.ts` 中修改 dagre 配置：

```typescript
// 调整前
g.setGraph({
  rankdir: 'TB',
  nodesep: 50,
  ranksep: 70,
  marginx: 20,
  marginy: 20,
});

// 调整后
g.setGraph({
  rankdir: 'TB',      // 从上到下
  nodesep: 80,        // 同一 rank 内节点间距（从 50 增加到 80）
  ranksep: 100,       // rank 之间的间距（从 70 增加到 100）
  marginx: 30,        // 水平边距（从 20 增加到 30）
  marginy: 30,        // 垂直边距（从 20 增加到 30）
});
```

- [ ] **Step 2: 添加布局方向参数**

修改 `autoLayout` 函数，支持布局方向参数：

```typescript
export function autoLayout(
  nodes: RoadmapNodeType[],
  direction: 'TB' | 'LR' = 'TB'
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  // 按 track 分组
  const trackGroups = new Map<string, RoadmapNodeType[]>();
  for (const node of nodes) {
    if (!trackGroups.has(node.track)) {
      trackGroups.set(node.track, []);
    }
    trackGroups.get(node.track)!.push(node);
  }

  let offsetX = 0;

  for (const track of TRACK_ORDER) {
    const group = trackGroups.get(track) || [];
    if (group.length === 0) continue;

    // 使用 dagre 计算单个 track 内部的布局
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: direction,  // 使用传入的方向
      nodesep: 80,
      ranksep: 100,
      marginx: 30,
      marginy: 30,
    });
    g.setDefaultEdgeLabel(() => ({}));

    // 添加节点
    for (const node of group) {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }

    // 添加边（仅限 track 内部的依赖）
    for (const node of group) {
      for (const prereq of node.prerequisites) {
        if (g.hasNode(prereq)) {
          g.setEdge(prereq, node.id);
        }
      }
    }

    // 执行布局
    dagre.layout(g);

    // 收集位置，加上 track 的偏移
    let trackMaxX = 0;
    let trackMaxY = 0;
    for (const node of group) {
      const nodeWithPos = g.node(node.id);
      if (nodeWithPos) {
        positions.set(node.id, {
          x: nodeWithPos.x - NODE_WIDTH / 2 + offsetX,
          y: nodeWithPos.y - NODE_HEIGHT / 2,
        });
        trackMaxX = Math.max(trackMaxX, nodeWithPos.x + NODE_WIDTH / 2);
        trackMaxY = Math.max(trackMaxY, nodeWithPos.y + NODE_HEIGHT / 2);
      }
    }

    // 根据方向调整偏移
    if (direction === 'TB') {
      offsetX += trackMaxX + TRACK_GAP;
    } else {
      offsetX += trackMaxY + TRACK_GAP;
    }
  }

  return positions;
}
```

- [ ] **Step 3: 更新 RoadmapGraph.tsx 添加方向切换**

在 `components/radar/RoadmapGraph.tsx` 中添加方向切换状态和按钮：

```typescript
// 在组件顶部添加状态
const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');

// 更新 useMemo 使用方向参数
const autoLayoutPositions = useMemo(
  () => autoLayout(initialNodes, layoutDirection),
  [initialNodes, layoutDirection]
);

// 在 Track 切换标签栏后面添加方向切换按钮
<div className="flex items-center gap-2 mb-4">
  <span className="font-mono text-[10px] text-neutral-500 uppercase">布局方向</span>
  <button
    onClick={() => setLayoutDirection('TB')}
    className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-all ${
      layoutDirection === 'TB'
        ? 'bg-neutral-200 text-neutral-900 border-neutral-300 shadow-sm'
        : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500'
    }`}
  >
    ↓ 从上到下
  </button>
  <button
    onClick={() => setLayoutDirection('LR')}
    className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-all ${
      layoutDirection === 'LR'
        ? 'bg-neutral-200 text-neutral-900 border-neutral-300 shadow-sm'
        : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500'
    }`}
  >
    → 从左到右
  </button>
</div>
```

- [ ] **Step 4: 验证布局效果**

Run: `npm run dev`
Expected:
- 访问 `/roadmap` 页面
- 节点间距更合理，不会过于拥挤
- 点击"从左到右"按钮，布局方向切换
- 点击"从上到下"按钮，布局方向恢复

- [ ] **Step 5: Commit**

```bash
git add lib/layout.ts components/radar/RoadmapGraph.tsx
git commit -m "feat(roadmap): optimize DAG layout parameters and add direction switch"
```

---

### Task 2: 节点详情面板增强 - 学习建议区块

**Files:**
- Modify: `components/radar/NodeDetailPanel.tsx`
- Modify: `components/radar/types.ts`

**Interfaces:**
- Consumes: `RoadmapNode` from `components/radar/types.ts`
- Produces: 学习建议区块（前置知识、后续学习、学习路径）

- [ ] **Step 1: 更新 RoadmapNode 类型定义**

在 `components/radar/types.ts` 中添加学习建议字段：

```typescript
export interface LearningSuggestion {
  prerequisites: string[];  // 前置知识
  nextSteps: string[];      // 后续学习
  learningPath: string[];   // 学习路径
}

export interface RoadmapNode {
  // ... 现有字段
  suggestions?: LearningSuggestion;  // 新增：学习建议
}
```

- [ ] **Step 2: 在 NodeDetailPanel 中添加学习建议区块**

在 `components/radar/NodeDetailPanel.tsx` 中，在"前置节点"区块后面添加：

```tsx
{/* 学习建议 */}
{node.suggestions && (
  <section>
    <h3 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-2">// 💡 学习建议</h3>

    {/* 前置知识 */}
    {node.suggestions.prerequisites && node.suggestions.prerequisites.length > 0 && (
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-neutral-400 mb-2">📚 前置知识</h4>
        <ul className="space-y-1.5">
          {node.suggestions.prerequisites.map((prereq, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>{prereq}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* 后续学习 */}
    {node.suggestions.nextSteps && node.suggestions.nextSteps.length > 0 && (
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-neutral-400 mb-2">🎯 后续学习</h4>
        <ul className="space-y-1.5">
          {node.suggestions.nextSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
              <span className="text-emerald-400 mt-0.5">→</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* 学习路径 */}
    {node.suggestions.learningPath && node.suggestions.learningPath.length > 0 && (
      <div>
        <h4 className="text-xs font-semibold text-neutral-400 mb-2">🛤️ 推荐路径</h4>
        <div className="flex flex-wrap gap-2">
          {node.suggestions.learningPath.map((path, idx) => (
            <span key={idx} className="font-mono text-[10px] px-2 py-1 bg-purple-500/10 text-purple-400 rounded border border-purple-500/30">
              {path}
            </span>
          ))}
        </div>
      </div>
    )}
  </section>
)}
```

- [ ] **Step 3: 为现有节点添加学习建议数据**

在 `lib/roadmap-data.ts` 中为 `linux-basic` 节点添加 `suggestions` 字段：

```typescript
// 在 linux-basic 节点对象中添加
suggestions: {
  prerequisites: [
    "基本的计算机操作能力",
    "了解操作系统概念",
  ],
  nextSteps: [
    "Git & GitHub 协作",
    "Docker 容器化",
  ],
  learningPath: [
    "DevOps 路径",
    "全栈开发路径",
  ],
},
```

- [ ] **Step 4: 验证学习建议区块**

Run: `npm run dev`
Expected:
- 访问 `/roadmap` 页面
- 点击 `linux-basic` 节点打开详情面板
- 在"前置节点"区块后面显示"💡 学习建议"区块
- 显示前置知识列表（2 项）、后续学习列表（2 项）、推荐路径标签（2 个）
- 样式与现有设计一致（暗色背景、绿色/青色点缀色）

- [ ] **Step 5: Commit**

```bash
git add components/radar/NodeDetailPanel.tsx components/radar/types.ts lib/roadmap-data.ts
git commit -m "feat(roadmap): add learning suggestions to node detail panel"
```

---

### Task 3: 节点详情面板增强 - 关联内容分组显示

**Files:**
- Modify: `components/radar/NodeDetailPanel.tsx`

**Interfaces:**
- Consumes: `RoadmapNode` 的关联字段（relatedIntel、relatedTools、relatedTerms）
- Produces: 分组显示的关联内容区块

- [ ] **Step 1: 重构关联内容显示逻辑**

在 `components/radar/NodeDetailPanel.tsx` 中，将现有的关联内容显示重构为分组显示：

```tsx
{/* 关联内容分组显示 */}
<section>
  <h3 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-3">// 🔗 关联内容</h3>

  <div className="space-y-4">
    {/* 关联情报 */}
    {node.relatedIntel && node.relatedIntel.length > 0 && (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-cyan-400 text-sm">📰</span>
          <span className="text-xs font-semibold text-neutral-400">情报</span>
          <span className="font-mono text-[10px] text-neutral-600">({node.relatedIntel.length})</span>
        </div>
        <div className="space-y-2">
          {node.relatedIntel.map((slug) => (
            <Link
              key={slug}
              href={`/intel/${slug}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group hover-lift-subtle"
            >
              <span className="text-xs text-neutral-300 group-hover:text-cyan-400 transition-colors flex-1">
                {INTEL_LINKS[slug] || slug}
              </span>
              <span className="text-[10px] text-neutral-600 group-hover:text-cyan-400 transition-colors">→</span>
            </Link>
          ))}
        </div>
      </div>
    )}

    {/* 关联术语 */}
    {nodeTerms.length > 0 && (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-400 text-sm">📖</span>
          <span className="text-xs font-semibold text-neutral-400">术语</span>
          <span className="font-mono text-[10px] text-neutral-600">({nodeTerms.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {nodeTerms.map((term) => (
            <Link
              key={term.slug}
              href={`/glossary/${term.slug}`}
              className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
            >
              {term.name}
            </Link>
          ))}
        </div>
      </div>
    )}

    {/* 关联工具 */}
    {node.relatedTools && node.relatedTools.length > 0 && (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-purple-400 text-sm">🔧</span>
          <span className="text-xs font-semibold text-neutral-400">工具</span>
          <span className="font-mono text-[10px] text-neutral-600">({node.relatedTools.length})</span>
        </div>
        <div className="space-y-2">
          {node.relatedTools.map((toolName) => (
            <Link
              key={toolName}
              href="/toolbox"
              className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group hover-lift-subtle"
            >
              <span className="text-xs text-neutral-300 group-hover:text-purple-400 transition-colors flex-1">
                {TOOL_LINKS[toolName] || toolName}
              </span>
              <span className="text-[10px] text-neutral-600 group-hover:text-purple-400 transition-colors">→</span>
            </Link>
          ))}
        </div>
      </div>
    )}

    {/* 实战项目 */}
    {relatedProjects.length > 0 && (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-emerald-400 text-sm">🚀</span>
          <span className="text-xs font-semibold text-neutral-400">实战项目</span>
          <span className="font-mono text-[10px] text-neutral-600">({relatedProjects.length})</span>
        </div>
        <div className="space-y-2">
          {relatedProjects.map((project) => (
            <Link
              key={project.slug}
              href={`/practice/${project.slug}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group hover-lift-subtle"
            >
              <div className="flex-1 min-w-0">
                <span className="text-xs text-neutral-300 group-hover:text-emerald-400 transition-colors block truncate">
                  {project.title}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-neutral-500">{getDifficultyStars(project.difficulty)}</span>
                  <span className="text-[10px] text-neutral-600">|</span>
                  <span className="text-[10px] text-neutral-500">{project.duration}</span>
                </div>
              </div>
              <span className="text-[10px] text-neutral-600 group-hover:text-emerald-400 transition-colors">→</span>
            </Link>
          ))}
        </div>
      </div>
    )}
  </div>
</section>
```

- [ ] **Step 2: 移除旧的关联内容显示代码**

删除原有的"本节术语"、"关联情报"、"关联工具"、"实战项目"独立区块，统一到新的分组显示中。

- [ ] **Step 3: 验证分组显示效果**

Run: `npm run dev`
Expected:
- 访问 `/roadmap` 页面
- 点击 `linux-basic` 节点打开详情面板
- 关联内容分组显示为 4 个独立区块：情报(2)、术语(4)、工具(1)、实战项目
- 每组标题旁显示数量统计，如 `📰 情报 (2)`
- 各组之间有清晰的间距分隔
- 样式与现有设计一致（暗色背景、各组使用对应颜色点缀）

- [ ] **Step 4: Commit**

```bash
git add components/radar/NodeDetailPanel.tsx
git commit -m "feat(roadmap): group related content in node detail panel"
```

---

### Task 4: 节点详情面板增强 - 更详细的介绍

**Files:**
- Modify: `components/radar/NodeDetailPanel.tsx`
- Modify: `components/radar/types.ts`

**Interfaces:**
- Consumes: `RoadmapNode` from `components/radar/types.ts`
- Produces: 更详细的节点介绍（难度等级、预计时长）

- [ ] **Step 1: 更新 RoadmapNode 类型定义**

在 `components/radar/types.ts` 中添加难度等级字段：

```typescript
export interface RoadmapNode {
  // ... 现有字段
  difficulty?: 'beginner' | 'intermediate' | 'advanced';  // 新增：难度等级
}
```

- [ ] **Step 2: 在 NodeDetailPanel 中添加难度等级显示**

在节点标题区域添加难度等级和预计时长显示：

```tsx
{/* 在节点标题下方添加 */}
<div className="flex items-center gap-3 mt-2">
  {/* 难度等级 */}
  {node.difficulty && (
    <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
      node.difficulty === 'beginner'
        ? 'bg-green-500/10 text-green-400 border-green-500/30'
        : node.difficulty === 'intermediate'
        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
        : 'bg-red-500/10 text-red-400 border-red-500/30'
    }`}>
      {node.difficulty === 'beginner' ? '初级' : node.difficulty === 'intermediate' ? '中级' : '高级'}
    </span>
  )}

  {/* 预计时长 */}
  <span className="font-mono text-[10px] text-neutral-500">
    ⏱️ {node.duration}
  </span>
</div>
```

- [ ] **Step 3: 为现有节点添加难度等级数据**

在 `lib/roadmap-data.ts` 中为节点添加 `difficulty` 字段：

```typescript
// 示例：为节点添加难度等级
{
  id: "linux-basic",
  name: "Linux 系统基础",
  difficulty: "beginner",  // 初级
  // ... 其他字段
}

{
  id: "pytorch-core",
  name: "PyTorch 框架",
  difficulty: "intermediate",  // 中级
  // ... 其他字段
}

{
  id: "cv-cnn",
  name: "CNN 经典架构",
  difficulty: "advanced",  // 高级
  // ... 其他字段
}
```

- [ ] **Step 4: 验证详细信息显示**

Run: `npm run dev`
Expected:
- 访问 `/roadmap` 页面
- 点击节点打开详情面板
- 显示难度等级标签（初级/中级/高级）
- 显示预计时长
- 样式与现有设计一致

- [ ] **Step 5: Commit**

```bash
git add components/radar/NodeDetailPanel.tsx components/radar/types.ts lib/roadmap-data.ts
git commit -m "feat(roadmap): add difficulty level and duration to node detail panel"
```

---

### Task 5: 路径推荐功能 - 学习路径数据

**Files:**
- Create: `lib/learning-paths.ts`

**Interfaces:**
- Consumes: 无
- Produces: `LearningPath` 类型和 `LEARNING_PATHS` 数据

- [ ] **Step 1: 创建学习路径数据文件**

Create `lib/learning-paths.ts`:

```typescript
export interface LearningPath {
  id: string;
  name: string;
  description: string;
  nodes: string[];          // 节点 ID 列表
  duration: string;         // 总时长
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'cv' | 'nlp' | 'devops' | 'math';
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'cv-path',
    name: '计算机视觉路径',
    description: '从零开始学习计算机视觉，掌握 CNN、目标检测等核心技术',
    nodes: ['linux-basic', 'git-github', 'docker-basic', 'math-linear-algebra', 'math-probability', 'pytorch-core', 'cv-cnn'],
    duration: '10 周',
    difficulty: 'intermediate',
    category: 'cv',
  },
  {
    id: 'nlp-path',
    name: '自然语言处理路径',
    description: '从零开始学习自然语言处理，掌握 Transformer、BERT 等核心技术',
    nodes: ['linux-basic', 'git-github', 'docker-basic', 'math-linear-algebra', 'math-probability', 'pytorch-core', 'nlp-transformer'],
    duration: '10 周',
    difficulty: 'intermediate',
    category: 'nlp',
  },
  {
    id: 'devops-path',
    name: '工程部署路径',
    description: '从零开始学习工程部署，掌握 Linux、Git、Docker 等核心工具',
    nodes: ['linux-basic', 'git-github', 'docker-basic'],
    duration: '6 周',
    difficulty: 'beginner',
    category: 'devops',
  },
  {
    id: 'math-path',
    name: '数学基础路径',
    description: '从零开始学习数学基础，掌握线性代数和概率统计',
    nodes: ['math-linear-algebra', 'math-probability'],
    duration: '4 周',
    difficulty: 'beginner',
    category: 'math',
  },
];

/**
 * 根据分类获取学习路径
 */
export function getPathsByCategory(category: string): LearningPath[] {
  if (category === 'all') return LEARNING_PATHS;
  return LEARNING_PATHS.filter(p => p.category === category);
}

/**
 * 根据 ID 获取学习路径
 */
export function getPathById(id: string): LearningPath | undefined {
  return LEARNING_PATHS.find(p => p.id === id);
}
```

- [ ] **Step 2: 验证数据文件**

Run: `npx tsc --noEmit lib/learning-paths.ts`
Expected: 无 TypeScript 错误

- [ ] **Step 3: Commit**

```bash
git add lib/learning-paths.ts
git commit -m "feat(roadmap): add learning paths data"
```

---

### Task 6: 路径推荐功能 - 路径选择器组件

**Files:**
- Create: `components/radar/PathSelector.tsx`

**Interfaces:**
- Consumes: `LearningPath` from `lib/learning-paths.ts`
- Produces: `PathSelector` 组件

- [ ] **Step 1: 创建路径选择器组件**

Create `components/radar/PathSelector.tsx`:

```tsx
'use client';

import { cn } from '@/lib/utils';
import type { LearningPath } from '@/lib/learning-paths';

interface PathSelectorProps {
  paths: LearningPath[];
  selectedPath: LearningPath | null;
  onSelectPath: (path: LearningPath | null) => void;
  className?: string;
}

const categoryLabels: Record<string, string> = {
  cv: '计算机视觉',
  nlp: '自然语言处理',
  devops: '工程部署',
  math: '数学基础',
};

const categoryColors: Record<string, string> = {
  cv: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  nlp: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  devops: 'bg-green-500/10 text-green-400 border-green-500/30',
  math: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
};

export function PathSelector({ paths, selectedPath, onSelectPath, className }: PathSelectorProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-neutral-500 uppercase">学习路径</span>
        {selectedPath && (
          <button
            onClick={() => onSelectPath(null)}
            className="font-mono text-[10px] text-red-400 hover:text-red-300 transition-colors"
          >
            清除选择
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {paths.map((path) => (
          <button
            key={path.id}
            onClick={() => onSelectPath(selectedPath?.id === path.id ? null : path)}
            className={cn(
              'text-left p-3 rounded-lg border transition-all',
              selectedPath?.id === path.id
                ? `${categoryColors[path.category]} border-current`
                : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-600'
            )}
          >
            <div className={cn(
              'font-mono text-[10px] uppercase mb-1',
              selectedPath?.id === path.id ? '' : 'text-neutral-500'
            )}>
              {categoryLabels[path.category]}
            </div>
            <div className="text-sm font-semibold text-neutral-200 mb-1">
              {path.name}
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500">
              <span>⏱️ {path.duration}</span>
              <span>•</span>
              <span>{path.difficulty === 'beginner' ? '初级' : path.difficulty === 'intermediate' ? '中级' : '高级'}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 选中路径的详细信息 */}
      {selectedPath && (
        <div className="p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
          <h4 className="text-sm font-semibold text-neutral-200 mb-2">{selectedPath.name}</h4>
          <p className="text-xs text-neutral-400 mb-3">{selectedPath.description}</p>
          <div className="flex flex-wrap gap-2">
            {selectedPath.nodes.map((nodeId, idx) => (
              <span key={nodeId} className="font-mono text-[10px] px-2 py-1 bg-neutral-800 text-neutral-400 rounded border border-neutral-700">
                {idx + 1}. {nodeId}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 验证组件**

Run: `npm run build`
Expected: 构建成功，无 TypeScript 错误

- [ ] **Step 3: Commit**

```bash
git add components/radar/PathSelector.tsx
git commit -m "feat(roadmap): add PathSelector component"
```

---

### Task 7: 路径推荐功能 - 集成到路线图页面

**Files:**
- Modify: `components/radar/RoadmapGraph.tsx`

**Interfaces:**
- Consumes: `PathSelector` 组件、`LearningPath` 类型
- Produces: 路径高亮显示功能

- [ ] **Step 1: 在 RoadmapGraph 中集成 PathSelector**

在 `components/radar/RoadmapGraph.tsx` 中：

```typescript
// 导入 PathSelector 和学习路径数据
import { PathSelector } from './PathSelector';
import { LEARNING_PATHS, type LearningPath } from '@/lib/learning-paths';

// 在组件中添加状态
const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);

// 在 Track 切换标签栏后面添加 PathSelector
<PathSelector
  paths={LEARNING_PATHS}
  selectedPath={selectedPath}
  onSelectPath={setSelectedPath}
  className="mb-4"
/>
```

- [ ] **Step 2: 实现路径高亮显示**

在节点样式中添加路径高亮逻辑：

```typescript
// 在节点渲染时，检查是否在选中路径中
const isNodeInPath = (nodeId: string) => {
  if (!selectedPath) return false;
  return selectedPath.nodes.includes(nodeId);
};

// 在节点样式中添加高亮
const getNodeHighlightStyle = (nodeId: string) => {
  if (!isNodeInPath(nodeId)) return {};
  return {
    border: '2px solid #8b5cf6',  // 紫色边框
    boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)',  // 紫色阴影
  };
};

// 在边样式中添加路径高亮
const getEdgeHighlightStyle = (source: string, target: string) => {
  if (!selectedPath) return {};
  const sourceIdx = selectedPath.nodes.indexOf(source);
  const targetIdx = selectedPath.nodes.indexOf(target);
  if (sourceIdx !== -1 && targetIdx !== -1 && targetIdx === sourceIdx + 1) {
    return {
      stroke: '#8b5cf6',
      strokeWidth: 3,
    };
  }
  return {};
};
```

- [ ] **Step 3: 验证路径高亮效果**

Run: `npm run dev`
Expected:
- 访问 `/roadmap` 页面
- 看到路径选择器
- 点击"计算机视觉路径"
- 相关节点高亮显示（紫色边框和阴影）
- 相关边高亮显示（紫色）
- 点击"清除选择"恢复正常显示

- [ ] **Step 4: Commit**

```bash
git add components/radar/RoadmapGraph.tsx
git commit -m "feat(roadmap): integrate path selector and highlight path nodes"
```

---

### Task 8: 最终验证和构建

**Files:**
- None（验证性 Task）

- [ ] **Step 1: 运行内容验证**

Run: `npm run validate-content`
Expected: 验证通过

- [ ] **Step 2: 运行构建**

Run: `npm run build`
Expected: 构建成功，无错误

- [ ] **Step 3: 本地测试**

Run: `npm run dev`
在浏览器中测试以下功能：
- 访问 `/roadmap` 页面
- 测试布局方向切换（TB/LR）
- 点击节点查看详情面板
- 验证学习建议区块显示
- 验证关联内容分组显示
- 验证难度等级和预计时长显示
- 测试路径选择器
- 验证路径高亮显示
- 测试移动端响应式布局

- [ ] **Step 4: 记录完成状态**

确认所有成功标准：
- [ ] DAG 布局更美观、更易读
- [ ] 支持布局方向切换
- [ ] 节点详情面板显示学习建议
- [ ] 关联内容分组显示
- [ ] 显示难度等级和预计时长
- [ ] 路径选择器可用
- [ ] 路径高亮显示正常
- [ ] 所有测试通过

- [ ] **Step 5: Commit**

```bash
git commit --allow-empty -m "feat(roadmap): complete roadmap optimization"
```

---

## Spec Coverage Checklist

| Spec Section | Task |
|---|---|
| 2.1 DAG 布局参数调优 | Task 1 |
| 2.2 节点详情面板增强 - 学习建议 | Task 2 |
| 2.2 节点详情面板增强 - 分组显示 | Task 3 |
| 2.2 节点详情面板增强 - 详细介绍 | Task 4 |
| 2.3 路径推荐功能 - 数据 | Task 5 |
| 2.3 路径推荐功能 - 选择器 | Task 6 |
| 2.3 路径推荐功能 - 集成 | Task 7 |
| 最终验证 | Task 8 |
