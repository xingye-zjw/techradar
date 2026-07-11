# 实战项目功能设计文档

**日期**：2026-06-22
**版本**：1.0
**状态**：待批准

---

## 1. 目标

添加实战项目功能，让用户能够通过实际项目巩固学习成果，建立完整的项目经验。

### 1.1 范围

- 创建实战项目数据结构
- 展示项目列表和详情
- 与路线图节点关联
- 项目难度分级

### 1.2 不在范围内

- 代码在线运行
- 项目提交/评审系统
- 用户进度追踪（后续任务）

---

## 2. 功能设计

### 2.1 实战项目列表

**页面路径**：`/practice`

**页面布局**：
```
┌─────────────────────────────────────────────────────────────┐
│ 🚀 实战项目                                                 │
│                                                             │
│ [全部] [初级] [中级] [高级]                                  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎯 CV 图像分类实战                                        │ │
│ │ 难度: ⭐⭐⭐ | 时长: 2周 | 关联: cv-cnn                   │ │
│ │ 使用 PyTorch 实现图像分类，掌握 CNN 完整流程              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎯 NLP 情感分析实战                                      │ │
│ │ 难度: ⭐⭐ | 时长: 1周 | 关联: nlp-transformer           │ │
│ │ 使用 Transformers 实现情感分析，理解预训练模型           │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**列表项信息**：
- 项目名称
- 难度等级（⭐-⭐⭐⭐⭐⭐）
- 预计时长
- 关联路线图节点
- 项目简介

---

### 2.2 项目详情页

**页面路径**：`/practice/[slug]`

**详情页结构**：
```
┌─────────────────────────────────────────────────────────────┐
│ ← 返回项目列表                                              │
│                                                             │
│ # CV 图像分类实战                                           │
│                                                             │
│ 📋 项目概览                                                 │
│ - 难度: ⭐⭐⭐ (中级)                                       │
│ - 时长: 2周                                                 │
│ - 前置知识: Python, PyTorch 基础                            │
│ - 关联节点: cv-cnn                                          │
│                                                             │
│ 🎯 学习目标                                                 │
│ - 掌握 CNN 完整训练流程                                     │
│ - 理解数据增强技术                                          │
│ - 学会模型评估和优化                                        │
│                                                             │
│ 📦 项目结构                                                 │
│ ```                                                         │
│ practice/                                                   │
│ ├── data/          # 数据集                                │
│ ├── models/        # 模型定义                              │
│ ├── utils/         # 工具函数                              │
│ ├── train.py       # 训练脚本                              │
│ └── README.md      # 项目说明                              │
│ ```                                                         │
│                                                             │
│ 🚀 实现步骤                                                 │
│ 1. 环境准备                                                │
│ 2. 数据加载                                                │
│ 3. 模型构建                                                │
│ 4. 训练优化                                                │
│ 5. 测试评估                                                │
│                                                             │
│ 📚 参考资源                                                 │
│ - 情报: CNN 经典架构                                        │
│ - 术语: 卷积神经网络                                        │
│ - 工具: PyTorch                                             │
│                                                             │
│ [开始项目] [查看代码] [下载模板]                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.3 难度分级

| 难度 | 标记 | 说明 | 适合人群 |
|------|------|------|----------|
| 初级 | ⭐ | 基础概念应用，简单实现 | 刚入门学生 |
| 中级 | ⭐⭐ | 需要一定基础，多步骤实现 | 有基础学生 |
| 高级 | ⭐⭐⭐ | 复杂场景，需要深入理解 | 进阶学习者 |
| 专家 | ⭐⭐⭐⭐ | 前沿技术，需要研究能力 | 研究方向学生 |
| 挑战 | ⭐⭐⭐⭐⭐ | 开放性问题，需要创新思维 | 竞赛/研究 |

---

## 3. 数据结构

### 3.1 项目数据

```typescript
// lib/content-types.ts

export interface PracticeProject {
  slug: string;                      // URL 友好标识
  title: string;                     // 项目名称
  category: ContentCategory;         // 所属分类
  difficulty: 1 | 2 | 3 | 4 | 5;    // 难度等级 (1-5)
  duration: string;                  // 预计时长
  summary: string;                   // 项目简介
  
  // 前置要求
  prerequisites: string[];           // 前置知识
  relatedNodes?: string[];           // 关联路线图节点
  
  // 项目内容
  objectives: string[];              // 学习目标
  projectStructure: ProjectFile[];   // 项目结构
  steps: ProjectStep[];              // 实现步骤
  
  // 资源
  resources: ResourceLink[];         // 参考资源
  relatedIntel?: string[];           // 关联情报
  relatedTerms?: string[];           // 关联术语
  relatedTools?: string[];           // 关联工具
  
  // 代码
  templateRepo?: string;             // 模板仓库 URL
  solutionRepo?: string;             // 参考实现 URL
}

export interface ProjectFile {
  path: string;                      // 文件路径
  description: string;               // 文件说明
  isRequired: boolean;               // 是否必需
}

export interface ProjectStep {
  order: number;                     // 步骤顺序
  title: string;                     // 步骤标题
  description: string;               // 步骤说明
  code?: string;                     // 代码示例（可选）
  hint?: string;                     // 提示（可选）
}
```

### 3.2 项目数据示例

```json
{
  "slug": "cv-image-classification",
  "title": "CV 图像分类实战",
  "category": "computer-vision",
  "difficulty": 3,
  "duration": "2周",
  "summary": "使用 PyTorch 实现图像分类，掌握 CNN 完整训练流程",
  
  "prerequisites": ["Python 基础", "PyTorch 基础", "CNN 基础概念"],
  "relatedNodes": ["cv-cnn", "pytorch-core"],
  
  "objectives": [
    "掌握 CNN 完整训练流程",
    "理解数据增强技术",
    "学会模型评估和优化",
    "了解迁移学习方法"
  ],
  
  "projectStructure": [
    { "path": "data/", "description": "数据集目录", "isRequired": true },
    { "path": "models/", "description": "模型定义", "isRequired": true },
    { "path": "utils/", "description": "工具函数", "isRequired": false },
    { "path": "train.py", "description": "训练脚本", "isRequired": true },
    { "path": "README.md", "description": "项目说明", "isRequired": true }
  ],
  
  "steps": [
    {
      "order": 1,
      "title": "环境准备",
      "description": "安装必要的依赖包，配置 GPU 环境",
      "code": "pip install torch torchvision matplotlib",
      "hint": "确保 CUDA 版本与 PyTorch 匹配"
    },
    {
      "order": 2,
      "title": "数据加载",
      "description": "使用 torchvision 加载 CIFAR-10 数据集，进行预处理",
      "code": "from torchvision import datasets, transforms",
      "hint": "记得做数据增强提高泛化能力"
    },
    {
      "order": 3,
      "title": "模型构建",
      "description": "构建 CNN 模型，定义卷积层和全连接层",
      "hint": "从简单模型开始，逐步增加复杂度"
    },
    {
      "order": 4,
      "title": "训练优化",
      "description": "定义损失函数和优化器，开始训练",
      "hint": "使用学习率调度器提高训练效果"
    },
    {
      "order": 5,
      "title": "测试评估",
      "description": "在测试集上评估模型性能，分析混淆矩阵",
      "hint": "关注准确率、召回率、F1 分数"
    }
  ],
  
  "resources": [
    { "title": "PyTorch 官方教程", "url": "https://pytorch.org/tutorials/", "type": "doc" },
    { "title": "CIFAR-10 数据集", "url": "https://www.cs.toronto.edu/~kriz/cifar.html", "type": "doc" }
  ],
  
  "relatedIntel": ["015-cnn-architecture"],
  "relatedTerms": ["convolutional-neural-network", "image-classification"],
  "relatedTools": ["pytorch", "jupyter"],
  
  "templateRepo": "https://github.com/example/cv-image-classification-template",
  "solutionRepo": "https://github.com/example/cv-image-classification-solution"
}
```

---

## 4. 页面组件

### 4.1 项目列表页

**组件路径**：`app/practice/page.tsx`

**组件结构**：
```tsx
export default function PracticePage() {
  const [projects, setProjects] = useState<PracticeProject[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  
  return (
    <main className="practice-page">
      <h1>🚀 实战项目</h1>
      
      {/* 难度筛选 */}
      <DifficultyFilter
        value={difficultyFilter}
        onChange={setDifficultyFilter}
      />
      
      {/* 项目列表 */}
      <ProjectList
        projects={projects.filter(p => 
          !difficultyFilter || p.difficulty === difficultyFilter
        )}
      />
    </main>
  );
}
```

### 4.2 项目卡片组件

**组件路径**：`components/practice/ProjectCard.tsx`

```tsx
interface ProjectCardProps {
  project: PracticeProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/practice/${project.slug}`} className="project-card">
      <div className="card-header">
        <h3>{project.title}</h3>
        <DifficultyBadge difficulty={project.difficulty} />
      </div>
      
      <div className="card-meta">
        <span>⏱ {project.duration}</span>
        {project.relatedNodes?.length && (
          <span>🔗 {project.relatedNodes.length} 个关联节点</span>
        )}
      </div>
      
      <p className="card-summary">{project.summary}</p>
      
      <div className="card-tags">
        {project.prerequisites.slice(0, 3).map((prereq, i) => (
          <span key={i} className="tag">{prereq}</span>
        ))}
      </div>
    </Link>
  );
}
```

### 4.3 项目详情组件

**组件路径**：`components/practice/ProjectDetail.tsx`

```tsx
interface ProjectDetailProps {
  project: PracticeProject;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  return (
    <div className="project-detail">
      <h1>{project.title}</h1>
      
      {/* 项目概览 */}
      <section className="overview">
        <h2>📋 项目概览</h2>
        <div className="overview-grid">
          <div>
            <strong>难度</strong>
            <DifficultyBadge difficulty={project.difficulty} />
          </div>
          <div>
            <strong>时长</strong>
            <span>{project.duration}</span>
          </div>
          <div>
            <strong>前置知识</strong>
            <ul>
              {project.prerequisites.map((prereq, i) => (
                <li key={i}>{prereq}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      
      {/* 学习目标 */}
      <section className="objectives">
        <h2>🎯 学习目标</h2>
        <ul>
          {project.objectives.map((obj, i) => (
            <li key={i}>{obj}</li>
          ))}
        </ul>
      </section>
      
      {/* 实现步骤 */}
      <section className="steps">
        <h2>🚀 实现步骤</h2>
        {project.steps.map((step, i) => (
          <StepCard key={i} step={step} />
        ))}
      </section>
      
      {/* 参考资源 */}
      <section className="resources">
        <h2>📚 参考资源</h2>
        <ResourceList resources={project.resources} />
      </section>
      
      {/* 操作按钮 */}
      <div className="actions">
        {project.templateRepo && (
          <a href={project.templateRepo} className="btn-primary">
            查看模板
          </a>
        )}
        {project.solutionRepo && (
          <a href={project.solutionRepo} className="btn-secondary">
            参考实现
          </a>
        )}
      </div>
    </div>
  );
}
```

---

## 5. 路由图关联

### 5.1 关联方式

在路线图详情面板中显示关联的实战项目：

```
┌─────────────────────────────────────────────────────────────┐
│ CNN 经典架构                                                │
│                                                             │
│ ...                                                         │
│                                                             │
│ 🚀 实战项目                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ CV 图像分类实战                                          │ │
│ │ ⭐⭐⭐ | 2周                                             │ │
│ │ [查看详情]                                               │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 数据关联

```typescript
// 路线图节点中添加项目关联
interface RoadmapNode {
  // ... 其他字段
  relatedProjects?: string[];  // 关联项目 slug
}
```

---

## 6. 数据存储

### 6.1 文件结构

```
content/
└── practice/
    ├── projects.json      # 项目索引
    └── projects/          # 项目详情 MD 文件（可选）
        ├── cv-image-classification.md
        └── nlp-sentiment-analysis.md
```

### 6.2 数据加载

```typescript
// lib/practice.ts

import projectsData from '../content/practice/projects.json';
import { PracticeProject } from './content-types';

export function getAllProjects(): PracticeProject[] {
  return projectsData.projects;
}

export function getProjectBySlug(slug: string): PracticeProject | undefined {
  return projectsData.projects.find(p => p.slug === slug);
}

export function getProjectsByDifficulty(difficulty: number): PracticeProject[] {
  return projectsData.projects.filter(p => p.difficulty === difficulty);
}

export function getProjectsByCategory(category: ContentCategory): PracticeProject[] {
  return projectsData.projects.filter(p => p.category === category);
}
```

---

## 7. 样式设计

### 7.1 项目卡片样式

```css
.project-card {
  display: block;
  padding: 1.5rem;
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 0.75rem;
  transition: all 0.2s;
  text-decoration: none;
  color: inherit;
}

.project-card:hover {
  border-color: #00ff88;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.1);
}

.project-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.project-card .card-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #e8e8e8;
  margin: 0;
}

.project-card .card-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #888888;
  margin-bottom: 0.75rem;
}

.project-card .card-summary {
  font-size: 0.875rem;
  color: #a0a0a0;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.project-card .card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.project-card .tag {
  padding: 0.25rem 0.5rem;
  background: #1c1c1c;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #888888;
}
```

### 7.2 难度徽章样式

```css
.difficulty-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.difficulty-badge.level-1 {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
}

.difficulty-badge.level-2 {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
}

.difficulty-badge.level-3 {
  background: rgba(255, 200, 0, 0.1);
  color: #ffc800;
}

.difficulty-badge.level-4 {
  background: rgba(255, 100, 0, 0.1);
  color: #ff6400;
}

.difficulty-badge.level-5 {
  background: rgba(255, 0, 0, 0.1);
  color: #ff0000;
}
```

---

## 8. 测试策略

### 8.1 单元测试

```typescript
// __tests__/lib/practice.test.ts

import { getAllProjects, getProjectBySlug, getProjectsByDifficulty } from '../../lib/practice';

describe('Practice', () => {
  it('应加载所有项目', () => {
    const projects = getAllProjects();
    expect(projects.length).toBeGreaterThan(0);
  });

  it('应按 slug 获取项目', () => {
    const project = getProjectBySlug('cv-image-classification');
    expect(project).toBeDefined();
    expect(project?.title).toBe('CV 图像分类实战');
  });

  it('应按难度筛选项目', () => {
    const projects = getProjectsByDifficulty(3);
    expect(projects.every(p => p.difficulty === 3)).toBe(true);
  });
});
```

### 8.2 组件测试

```typescript
// __tests__/components/practice/ProjectCard.test.tsx

import { render, screen } from '@testing-library/react';
import { ProjectCard } from '../../../components/practice/ProjectCard';

const mockProject = {
  slug: 'test-project',
  title: '测试项目',
  category: 'deep-learning',
  difficulty: 3,
  duration: '1周',
  summary: '测试简介',
  prerequisites: ['Python 基础'],
  objectives: [],
  projectStructure: [],
  steps: [],
  resources: [],
};

describe('ProjectCard', () => {
  it('应渲染项目标题', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('测试项目')).toBeInTheDocument();
  });

  it('应渲染难度徽章', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('⭐⭐⭐')).toBeInTheDocument();
  });

  it('应渲染项目简介', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('测试简介')).toBeInTheDocument();
  });
});
```

---

## 9. 实施步骤

### 阶段 1：数据结构定义（0.5天）

1. 更新 `lib/content-types.ts` 添加 `PracticeProject` 类型
2. 创建 `content/practice/projects.json` 数据文件
3. 创建 `lib/practice.ts` 数据加载函数

### 阶段 2：页面开发（2天）

1. 创建 `app/practice/page.tsx` 列表页
2. 创建 `app/practice/[slug]/page.tsx` 详情页
3. 创建 `components/practice/ProjectCard.tsx` 卡片组件
4. 创建 `components/practice/ProjectDetail.tsx` 详情组件
5. 创建 `components/practice/DifficultyBadge.tsx` 难度徽章

### 阶段 3：路线图关联（1天）

1. 更新路线图节点添加 `relatedProjects` 字段
2. 更新 `components/radar/NodeDetailPanel.tsx` 显示关联项目
3. 测试关联功能

### 阶段 4：样式优化（1天）

1. 实现项目卡片样式
2. 实现详情页样式
3. 响应式适配
4. 视觉测试

### 阶段 5：测试（0.5天）

1. 编写单元测试
2. 编写组件测试
3. 运行所有测试
4. 修复问题

---

## 10. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 项目数据不足 | 中 | 先创建 3-5 个示例项目 |
| 路线图关联复杂 | 低 | 使用 slug 关联，保持松耦合 |
| 移动端体验 | 低 | 响应式设计 |

---

## 11. 成功标准

- [ ] 项目列表页正常显示
- [ ] 项目详情页正常显示
- [ ] 难度筛选功能正常
- [ ] 路线图关联正常
- [ ] 移动端体验良好
- [ ] 所有测试通过
