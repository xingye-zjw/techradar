# 路线图渐进式优化设计文档

> **日期**：2026-06-24
> **状态**：已批准
> **作者**：AI Assistant

---

## 1. 概述

### 1.1 背景

TechRadar 项目的学习路线图是核心功能之一，但当前存在以下问题：
- DAG 图布局不够美观，节点间距过小
- 节点详情面板信息不够详细，缺少学习建议
- 缺少路径推荐功能，用户难以规划学习路径

### 1.2 目标

通过渐进式优化，提升路线图的用户体验：
1. **DAG 布局参数调优**：优化节点间距和 rank 间距，使布局更美观、更易读
2. **节点详情面板增强**：添加学习建议、分组显示关联内容、更详细的介绍
3. **路径推荐功能**：添加技术方向选择器，高亮显示推荐学习路径

### 1.3 范围

- **范围**：路线图模块和相关组件（节点详情面板）
- **不涉及**：其他模块（情报、术语、工具、踩坑）、后端架构、数据库

---

## 2. 设计方案

### 2.1 DAG 布局参数调优

#### 2.1.1 目标

优化 dagre 配置参数，使节点间距更合理，布局更美观。

#### 2.1.2 具体改动

**文件**：`lib/layout.ts`

**改动内容**：
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

**新增功能**：
- 支持布局方向切换（TB/LR）
- 在 `RoadmapGraph.tsx` 添加方向切换按钮

#### 2.1.3 预期效果

- 节点间距更合理，不会过于拥挤
- 支持布局方向切换，适应不同屏幕尺寸
- 整体布局更美观、更易读

---

### 2.2 节点详情面板增强

#### 2.2.1 目标

添加学习建议、分组显示关联内容、更详细的介绍。

#### 2.2.2 具体改动

**文件**：`components/radar/NodeDetailPanel.tsx`

**新增区块**：

1. **学习建议区块**（新增）：
   - **前置知识**：显示学习当前节点前需要掌握的知识点
   - **后续学习**：显示完成当前节点后推荐学习的内容
   - **学习路径**：显示从当前节点出发的推荐路径

2. **关联内容分组显示**（改进）：
   - 将关联内容分为 4 组：情报、术语、工具、踩坑
   - 每组使用独立的区块和标题
   - 添加内容数量统计

3. **更详细的介绍**（增强）：
   - **节点描述**：显示更详细的节点描述（支持 Markdown）
   - **学习目标**：显示完成当前节点后可以做到的事
   - **难度等级**：显示节点的难度等级（初级/中级/高级）
   - **预计时长**：显示学习当前节点需要的时间

**新增数据结构**：

```typescript
interface LearningSuggestion {
  prerequisites: string[];  // 前置知识
  nextSteps: string[];      // 后续学习
  learningPath: string[];   // 学习路径
}

interface NodeDetail {
  description: string;      // 详细描述
  objectives: string[];     // 学习目标
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;         // 预计时长
  suggestions: LearningSuggestion;
}
```

#### 2.2.3 预期效果

- 用户可以清楚地知道学习当前节点前需要掌握什么
- 用户可以了解完成当前节点后可以学到什么
- 关联内容更清晰、更有组织
- 节点信息更详细、更有价值

---

### 2.3 路径推荐功能

#### 2.3.1 目标

添加技术方向选择器，高亮显示推荐学习路径。

#### 2.3.2 具体改动

**文件**：`components/radar/RoadmapGraph.tsx`

**新增功能**：

1. **技术方向选择器**（新增）：
   - 在路线图页面添加方向选择器（CV/NLP/DevOps/Math）
   - 选择方向后，高亮显示该方向的学习路径
   - 显示路径总时长和难度

2. **路径高亮显示**（新增）：
   - 使用不同颜色高亮显示推荐路径
   - 路径上的节点显示推荐顺序
   - 路径上的边显示依赖关系

3. **路径信息显示**（新增）：
   - 显示路径总时长（如：4 周）
   - 显示路径难度（如：中级）
   - 显示路径包含的节点数量

**新增数据结构**：

```typescript
interface LearningPath {
  id: string;
  name: string;
  description: string;
  nodes: string[];          // 节点 ID 列表
  duration: string;         // 总时长
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'cv' | 'nlp' | 'devops' | 'math';
}
```

**新增文件**：
- `lib/learning-paths.ts`：学习路径数据
- `components/radar/PathSelector.tsx`：路径选择器组件

#### 2.3.3 预期效果

- 用户可以快速选择自己感兴趣的技术方向
- 用户可以清楚地看到推荐的学习路径
- 用户可以了解路径的总时长和难度
- 学习路径更清晰、更有针对性

---

## 3. 技术实现

### 3.1 依赖库

- **dagre**：已存在，用于 DAG 布局
- **@xyflow/react**：已存在，用于流程图渲染
- **无新增依赖**

### 3.2 数据流

```
用户操作 → RoadmapGraph.tsx → NodeDetailPanel.tsx
                ↓
        lib/layout.ts (布局计算)
                ↓
        lib/learning-paths.ts (路径数据)
```

### 3.3 状态管理

- **节点状态**：使用 React state 管理（已完成/可学习/锁定）
- **路径状态**：使用 React state 管理（选中的路径）
- **布局状态**：使用 React state 管理（布局方向）

---

## 4. 实施计划

### 4.1 阶段 1：DAG 布局参数调优（1-2 天）

**任务**：
1. 调整 dagre 配置参数
2. 添加布局方向切换按钮
3. 测试布局效果

**验收标准**：
- 节点间距更合理
- 支持 TB/LR 两种布局方向
- 布局效果更美观

### 4.2 阶段 2：节点详情面板增强（2-3 天）

**任务**：
1. 添加学习建议区块
2. 改进关联内容分组显示
3. 增强节点详细信息

**验收标准**：
- 显示前置知识和后续学习建议
- 关联内容分组显示
- 节点信息更详细

### 4.3 阶段 3：路径推荐功能（2-3 天）

**任务**：
1. 创建学习路径数据
2. 添加路径选择器组件
3. 实现路径高亮显示

**验收标准**：
- 支持技术方向选择
- 高亮显示推荐路径
- 显示路径总时长和难度

---

## 5. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 布局参数调整导致节点重叠 | 中 | 逐步调整参数，测试效果 |
| 路径数据不准确 | 低 | 参考现有路线图数据 |
| 性能问题（节点过多） | 低 | 使用虚拟化技术 |

---

## 6. 成功标准

- [ ] DAG 布局更美观、更易读
- [ ] 节点详情面板信息更详细、更有价值
- [ ] 路径推荐功能可用
- [ ] 用户体验提升（可通过用户反馈验证）

---

## 7. 参考资料

- dagre 文档：https://github.com/dagrejs/dagre
- @xyflow/react 文档：https://reactflow.dev/
- 现有代码：`lib/layout.ts`、`components/radar/NodeDetailPanel.tsx`

---

## 8. 附录

### 8.1 现有布局参数

```typescript
// lib/layout.ts
g.setGraph({
  rankdir: 'TB',
  nodesep: 50,
  ranksep: 70,
  marginx: 20,
  marginy: 20,
});
```

### 8.2 优化后布局参数

```typescript
// lib/layout.ts
g.setGraph({
  rankdir: 'TB',
  nodesep: 80,
  ranksep: 100,
  marginx: 30,
  marginy: 30,
});
```

### 8.3 学习路径示例

```typescript
// lib/learning-paths.ts
export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'cv-path',
    name: '计算机视觉路径',
    description: '从零开始学习计算机视觉',
    nodes: ['linux-basic', 'git-github', 'docker-basic', 'math-linear-algebra', 'pytorch-core', 'cv-cnn'],
    duration: '8 周',
    difficulty: 'intermediate',
    category: 'cv',
  },
  {
    id: 'nlp-path',
    name: '自然语言处理路径',
    description: '从零开始学习自然语言处理',
    nodes: ['linux-basic', 'git-github', 'docker-basic', 'math-linear-algebra', 'pytorch-core', 'nlp-transformer'],
    duration: '8 周',
    difficulty: 'intermediate',
    category: 'nlp',
  },
  {
    id: 'devops-path',
    name: '工程部署路径',
    description: '从零开始学习工程部署',
    nodes: ['linux-basic', 'git-github', 'docker-basic'],
    duration: '6 周',
    difficulty: 'beginner',
    category: 'devops',
  },
  {
    id: 'math-path',
    name: '数学基础路径',
    description: '从零开始学习数学基础',
    nodes: ['math-linear-algebra', 'math-probability'],
    duration: '4 周',
    difficulty: 'beginner',
    category: 'math',
  },
];
```
