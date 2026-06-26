# 实战项目功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 添加实战项目功能，让用户能够通过实际项目巩固学习成果，建立完整的项目经验。

**Architecture:** 先定义数据结构和类型，再创建页面和组件，最后实现路线图关联。

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui

## Global Constraints

- 暗色模式主题不变，沿用现有设计系统
- 数据存储使用 JSON 文件（`content/practice/projects.json`）
- 路由使用 Next.js App Router 动态路由（`[slug]`）
- 难度分级：1-5 星（⭐-⭐⭐⭐⭐⭐）
- 关联方式：通过 slug 关联路线图节点、情报、术语、工具
- 样式沿用项目设计系统（`#0a0a0a` 背景、`#00ff88` 主色调）

---

## File Structure

| 操作 | 文件 | 职责 |
|------|------|------|
| Create | `content/practice/projects.json` | 项目数据索引 |
| Create | `lib/practice.ts` | 项目数据加载函数 |
| Create | `app/practice/page.tsx` | 项目列表页 |
| Create | `app/practice/[slug]/page.tsx` | 项目详情页 |
| Create | `components/practice/ProjectCard.tsx` | 项目卡片组件 |
| Create | `components/practice/ProjectDetail.tsx` | 项目详情组件 |
| Create | `components/practice/DifficultyBadge.tsx` | 难度徽章组件 |
| Create | `components/practice/DifficultyFilter.tsx` | 难度筛选组件 |
| Modify | `lib/content-types.ts` | 添加 PracticeProject 类型定义 |
| Modify | `components/radar/NodeDetailPanel.tsx` | 显示关联实战项目 |

---

### Task 1: 数据结构定义

**Files:**
- Modify: `lib/content-types.ts`
- Create: `lib/practice.ts`
- Create: `content/practice/projects.json`

**Interfaces:**
- Consumes: 无
- Produces: PracticeProject 类型定义、数据加载函数、示例项目数据

- [ ] **Step 1: 更新 content-types.ts 添加类型定义**

在 `lib/content-types.ts` 末尾添加：

```typescript
// 实战项目类型
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

- [ ] **Step 2: 创建 content/practice 目录和 projects.json**

Run: `mkdir -p content/practice`

Create `content/practice/projects.json`:
```json
{
  "projects": [
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
    },
    {
      "slug": "nlp-sentiment-analysis",
      "title": "NLP 情感分析实战",
      "category": "natural-language-processing",
      "difficulty": 2,
      "duration": "1周",
      "summary": "使用 Transformers 实现情感分析，理解预训练模型",
      "prerequisites": ["Python 基础", "NLP 基础概念"],
      "relatedNodes": ["nlp-transformer"],
      "objectives": [
        "理解预训练模型的工作原理",
        "掌握 HuggingFace Transformers 使用",
        "学会微调预训练模型",
        "了解情感分析应用场景"
      ],
      "projectStructure": [
        { "path": "data/", "description": "数据集目录", "isRequired": true },
        { "path": "models/", "description": "模型定义", "isRequired": false },
        { "path": "train.py", "description": "训练脚本", "isRequired": true },
        { "path": "predict.py", "description": "预测脚本", "isRequired": true },
        { "path": "README.md", "description": "项目说明", "isRequired": true }
      ],
      "steps": [
        {
          "order": 1,
          "title": "环境准备",
          "description": "安装 transformers 和 datasets 库",
          "code": "pip install transformers datasets",
          "hint": "使用 GPU 加速训练"
        },
        {
          "order": 2,
          "title": "数据加载",
          "description": "加载情感分析数据集，进行预处理",
          "code": "from datasets import load_dataset",
          "hint": "使用 HuggingFace datasets 库"
        },
        {
          "order": 3,
          "title": "模型选择",
          "description": "选择合适的预训练模型（如 BERT、RoBERTa）",
          "hint": "根据任务选择合适大小的模型"
        },
        {
          "order": 4,
          "title": "微调训练",
          "description": "使用 Trainer API 进行微调",
          "code": "from transformers import Trainer",
          "hint": "注意学习率设置"
        },
        {
          "order": 5,
          "title": "模型评估",
          "description": "在测试集上评估模型性能",
          "hint": "关注 F1 分数和混淆矩阵"
        }
      ],
      "resources": [
        { "title": "HuggingFace 教程", "url": "https://huggingface.co/docs/transformers/training", "type": "doc" },
        { "title": "IMDB 数据集", "url": "https://huggingface.co/datasets/imdb", "type": "doc" }
      ],
      "relatedIntel": ["002-rag", "008-huggingface"],
      "relatedTerms": ["transformer", "bert", "sentiment-analysis"],
      "relatedTools": ["huggingface", "jupyter"],
      "templateRepo": "https://github.com/example/nlp-sentiment-template",
      "solutionRepo": "https://github.com/example/nlp-sentiment-solution"
    },
    {
      "slug": "devops-cicd-pipeline",
      "title": "DevOps CI/CD 流水线实战",
      "category": "deployment",
      "difficulty": 2,
      "duration": "1周",
      "summary": "搭建完整的 CI/CD 流水线，实现自动化部署",
      "prerequisites": ["Linux 基础", "Git 基础", "Docker 基础"],
      "relatedNodes": ["docker-basic", "git-github"],
      "objectives": [
        "理解 CI/CD 概念和流程",
        "掌握 GitHub Actions 使用",
        "学会 Docker 容器化部署",
        "了解自动化测试集成"
      ],
      "projectStructure": [
        { "path": ".github/workflows/", "description": "GitHub Actions 配置", "isRequired": true },
        { "path": "Dockerfile", "description": "Docker 镜像构建文件", "isRequired": true },
        { "path": "docker-compose.yml", "description": "容器编排配置", "isRequired": false },
        { "path": "tests/", "description": "测试目录", "isRequired": true },
        { "path": "README.md", "description": "项目说明", "isRequired": true }
      ],
      "steps": [
        {
          "order": 1,
          "title": "创建 GitHub 仓库",
          "description": "创建新的 GitHub 仓库并初始化项目",
          "hint": "使用 README.md 初始化仓库"
        },
        {
          "order": 2,
          "title": "编写 Dockerfile",
          "description": "创建 Docker 镜像构建文件",
          "code": "FROM python:3.9-slim\nWORKDIR /app\nCOPY . .\nRUN pip install -r requirements.txt\nCMD [\"python\", \"app.py\"]",
          "hint": "使用多阶段构建减小镜像体积"
        },
        {
          "order": 3,
          "title": "配置 GitHub Actions",
          "description": "创建 CI/CD 流水线配置文件",
          "hint": "包含测试、构建、部署步骤"
        },
        {
          "order": 4,
          "title": "编写测试",
          "description": "编写单元测试和集成测试",
          "hint": "使用 pytest 框架"
        },
        {
          "order": 5,
          "title": "测试流水线",
          "description": "推送代码触发流水线，验证各阶段",
          "hint": "检查 GitHub Actions 日志"
        }
      ],
      "resources": [
        { "title": "GitHub Actions 文档", "url": "https://docs.github.com/en/actions", "type": "doc" },
        { "title": "Docker 官方文档", "url": "https://docs.docker.com/", "type": "doc" }
      ],
      "relatedIntel": ["005-docker", "010-git"],
      "relatedTerms": ["ci-cd", "docker", "github-actions"],
      "relatedTools": ["docker", "github"],
      "templateRepo": "https://github.com/example/cicd-template",
      "solutionRepo": "https://github.com/example/cicd-solution"
    }
  ]
}
```

- [ ] **Step 3: 创建 lib/practice.ts 数据加载函数**

Create `lib/practice.ts`:
```typescript
import projectsData from '../content/practice/projects.json';
import { PracticeProject, ContentCategory } from './content-types';

/**
 * 获取所有实战项目
 */
export function getAllProjects(): PracticeProject[] {
  return projectsData.projects;
}

/**
 * 根据 slug 获取项目
 */
export function getProjectBySlug(slug: string): PracticeProject | undefined {
  return projectsData.projects.find(p => p.slug === slug);
}

/**
 * 按难度筛选项目
 */
export function getProjectsByDifficulty(difficulty: number): PracticeProject[] {
  return projectsData.projects.filter(p => p.difficulty === difficulty);
}

/**
 * 按分类筛选项目
 */
export function getProjectsByCategory(category: ContentCategory): PracticeProject[] {
  return projectsData.projects.filter(p => p.category === category);
}

/**
 * 获取关联指定路线图节点的项目
 */
export function getProjectsByNode(nodeId: string): PracticeProject[] {
  return projectsData.projects.filter(p => p.relatedNodes?.includes(nodeId));
}

/**
 * 获取难度星级显示
 */
export function getDifficultyStars(difficulty: number): string {
  return '⭐'.repeat(difficulty);
}

/**
 * 获取难度等级文本
 */
export function getDifficultyLabel(difficulty: number): string {
  const labels: Record<number, string> = {
    1: '初级',
    2: '中级',
    3: '高级',
    4: '专家',
    5: '挑战',
  };
  return labels[difficulty] || '未知';
}
```

- [ ] **Step 4: 验证数据加载**

Run: `npm run build`
Expected: 构建成功，无类型错误

- [ ] **Step 5: Commit**

```bash
git add lib/content-types.ts lib/practice.ts content/practice/
git commit -m "feat(practice): add practice project types and data loading"
```

---

### Task 2: 难度徽章和筛选组件

**Files:**
- Create: `components/practice/DifficultyBadge.tsx`
- Create: `components/practice/DifficultyFilter.tsx`

**Interfaces:**
- Consumes: PracticeProject.difficulty
- Produces: DifficultyBadge、DifficultyFilter 组件

- [ ] **Step 1: 创建 DifficultyBadge 组件**

Run: `mkdir -p components/practice`

Create `components/practice/DifficultyBadge.tsx`:
```tsx
import { cn } from '@/lib/utils';
import { getDifficultyStars, getDifficultyLabel } from '@/lib/practice';

interface DifficultyBadgeProps {
  difficulty: 1 | 2 | 3 | 4 | 5;
  showLabel?: boolean;
  className?: string;
}

const difficultyColors: Record<number, string> = {
  1: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  2: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  3: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  4: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  5: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function DifficultyBadge({ difficulty, showLabel = true, className }: DifficultyBadgeProps) {
  const stars = getDifficultyStars(difficulty);
  const label = getDifficultyLabel(difficulty);
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border',
        difficultyColors[difficulty],
        className
      )}
    >
      <span>{stars}</span>
      {showLabel && <span>{label}</span>}
    </span>
  );
}
```

- [ ] **Step 2: 创建 DifficultyFilter 组件**

Create `components/practice/DifficultyFilter.tsx`:
```tsx
import { cn } from '@/lib/utils';

interface DifficultyFilterProps {
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
}

const filters = [
  { value: null, label: '全部' },
  { value: 1, label: '⭐ 初级' },
  { value: 2, label: '⭐⭐ 中级' },
  { value: 3, label: '⭐⭐⭐ 高级' },
  { value: 4, label: '⭐⭐⭐⭐ 专家' },
  { value: 5, label: '⭐⭐⭐⭐⭐ 挑战' },
];

export function DifficultyFilter({ value, onChange, className }: DifficultyFilterProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {filters.map((filter) => (
        <button
          key={filter.value ?? 'all'}
          onClick={() => onChange(filter.value)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            'border border-transparent',
            value === filter.value
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 验证组件**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 4: Commit**

```bash
git add components/practice/
git commit -m "feat(practice): add DifficultyBadge and DifficultyFilter components"
```

---

### Task 3: 项目卡片组件

**Files:**
- Create: `components/practice/ProjectCard.tsx`

**Interfaces:**
- Consumes: PracticeProject
- Produces: ProjectCard 组件

- [ ] **Step 1: 创建 ProjectCard 组件**

Create `components/practice/ProjectCard.tsx`:
```tsx
import Link from 'next/link';
import { PracticeProject } from '@/lib/content-types';
import { DifficultyBadge } from './DifficultyBadge';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: PracticeProject;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <Link
      href={`/practice/${project.slug}`}
      className={cn(
        'block p-6 rounded-xl border border-zinc-800 bg-zinc-900/50',
        'hover:border-emerald-500/50 hover:bg-zinc-900/80 transition-all duration-200',
        'hover-lift group',
        className
      )}
    >
      {/* 卡片头部 */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
          {project.title}
        </h3>
        <DifficultyBadge difficulty={project.difficulty} showLabel={false} />
      </div>
      
      {/* 项目元信息 */}
      <div className="flex items-center gap-4 text-sm text-zinc-500 mb-3">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {project.duration}
        </span>
        {project.relatedNodes && project.relatedNodes.length > 0 && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {project.relatedNodes.length} 个关联节点
          </span>
        )}
      </div>
      
      {/* 项目简介 */}
      <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-2">
        {project.summary}
      </p>
      
      {/* 前置知识标签 */}
      <div className="flex flex-wrap gap-2">
        {project.prerequisites.slice(0, 3).map((prereq, i) => (
          <span
            key={i}
            className="px-2 py-1 text-xs rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/50"
          >
            {prereq}
          </span>
        ))}
        {project.prerequisites.length > 3 && (
          <span className="px-2 py-1 text-xs rounded-md bg-zinc-800/80 text-zinc-500">
            +{project.prerequisites.length - 3}
          </span>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: 验证组件**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 3: Commit**

```bash
git add components/practice/ProjectCard.tsx
git commit -m "feat(practice): add ProjectCard component"
```

---

### Task 4: 项目列表页

**Files:**
- Create: `app/practice/page.tsx`

**Interfaces:**
- Consumes: getAllProjects()
- Produces: /practice 页面

- [ ] **Step 1: 创建 practice 目录和页面**

Run: `mkdir -p app/practice`

Create `app/practice/page.tsx`:
```tsx
'use client';

import { useState, useMemo } from 'react';
import { PracticeProject } from '@/lib/content-types';
import { getAllProjects } from '@/lib/practice';
import { ProjectCard } from '@/components/practice/ProjectCard';
import { DifficultyFilter } from '@/components/practice/DifficultyFilter';

// 静态生成所有项目数据
const projects = getAllProjects();

export default function PracticePage() {
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  
  const filteredProjects = useMemo(() => {
    if (difficultyFilter === null) return projects;
    return projects.filter(p => p.difficulty === difficultyFilter);
  }, [difficultyFilter]);
  
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            🚀 实战项目
          </h1>
          <p className="text-zinc-400">
            通过实际项目巩固学习成果，建立完整的项目经验
          </p>
        </div>
        
        {/* 难度筛选 */}
        <div className="mb-8">
          <DifficultyFilter
            value={difficultyFilter}
            onChange={setDifficultyFilter}
          />
        </div>
        
        {/* 项目统计 */}
        <div className="mb-6 text-sm text-zinc-500">
          共 {filteredProjects.length} 个项目
          {difficultyFilter && (
            <span>（难度 {difficultyFilter} 星）</span>
          )}
        </div>
        
        {/* 项目列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
        
        {/* 空状态 */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500">暂无符合条件的项目</p>
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 验证页面**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 3: Commit**

```bash
git add app/practice/
git commit -m "feat(practice): add practice project list page"
```

---

### Task 5: 项目详情组件

**Files:**
- Create: `components/practice/ProjectDetail.tsx`
- Create: `components/practice/StepCard.tsx`

**Interfaces:**
- Consumes: PracticeProject
- Produces: ProjectDetail、StepCard 组件

- [ ] **Step 1: 创建 StepCard 组件**

Create `components/practice/StepCard.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { ProjectStep } from '@/lib/content-types';
import { cn } from '@/lib/utils';

interface StepCardProps {
  step: ProjectStep;
  isLast?: boolean;
}

export function StepCard({ step, isLast = false }: StepCardProps) {
  const [showHint, setShowHint] = useState(false);
  
  return (
    <div className={cn('relative pl-8', !isLast && 'pb-8')}>
      {/* 步骤连线 */}
      {!isLast && (
        <div className="absolute left-3 top-8 bottom-0 w-px bg-zinc-700" />
      )}
      
      {/* 步骤圆点 */}
      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
        <span className="text-xs font-bold text-emerald-400">{step.order}</span>
      </div>
      
      {/* 步骤内容 */}
      <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-4">
        <h4 className="text-base font-semibold text-zinc-100 mb-2">
          {step.title}
        </h4>
        <p className="text-sm text-zinc-400 leading-relaxed mb-3">
          {step.description}
        </p>
        
        {/* 代码示例 */}
        {step.code && (
          <div className="bg-zinc-800 rounded-md p-3 mb-3 overflow-x-auto">
            <code className="text-sm text-cyan-400 font-mono">{step.code}</code>
          </div>
        )}
        
        {/* 提示 */}
        {step.hint && (
          <div>
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              {showHint ? 'hide hint ▲' : 'show hint ▼'}
            </button>
            {showHint && (
              <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <p className="text-sm text-yellow-400">💡 {step.hint}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 ProjectDetail 组件**

Create `components/practice/ProjectDetail.tsx`:
```tsx
import { PracticeProject } from '@/lib/content-types';
import { DifficultyBadge } from './DifficultyBadge';
import { StepCard } from './StepCard';
import { ResourceLink } from '@/components/radar/ResourceLink';
import Link from 'next/link';

interface ProjectDetailProps {
  project: PracticeProject;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* 返回链接 */}
      <Link
        href="/practice"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回项目列表
      </Link>
      
      {/* 项目标题 */}
      <h1 className="text-3xl font-bold text-zinc-100 mb-6">
        {project.title}
      </h1>
      
      {/* 项目概览 */}
      <section className="mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <span>📋</span> 项目概览
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-zinc-500 block mb-1">难度</span>
            <DifficultyBadge difficulty={project.difficulty} />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block mb-1">时长</span>
            <span className="text-sm text-zinc-300">{project.duration}</span>
          </div>
          <div className="col-span-2">
            <span className="text-xs text-zinc-500 block mb-1">前置知识</span>
            <div className="flex flex-wrap gap-2">
              {project.prerequisites.map((prereq, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs rounded-md bg-zinc-800 text-zinc-400"
                >
                  {prereq}
                </span>
              ))}
            </div>
          </div>
        </div>
        {project.relatedNodes && project.relatedNodes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <span className="text-xs text-zinc-500 block mb-2">关联路线图节点</span>
            <div className="flex flex-wrap gap-2">
              {project.relatedNodes.map((node, i) => (
                <Link
                  key={i}
                  href={`/roadmap?node=${node}`}
                  className="px-3 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                >
                  {node}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
      
      {/* 学习目标 */}
      <section className="mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <span>🎯</span> 学习目标
        </h2>
        <ul className="space-y-2">
          {project.objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
              <span className="text-emerald-400 mt-0.5">✓</span>
              {obj}
            </li>
          ))}
        </ul>
      </section>
      
      {/* 项目结构 */}
      <section className="mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <span>📦</span> 项目结构
        </h2>
        <div className="bg-zinc-800 rounded-lg p-4 font-mono text-sm">
          {project.projectStructure.map((file, i) => (
            <div key={i} className="flex items-center gap-2 py-1">
              <span className="text-cyan-400">{file.path}</span>
              <span className="text-zinc-500"># {file.description}</span>
              {file.isRequired && (
                <span className="text-xs text-red-400">必需</span>
              )}
            </div>
          ))}
        </div>
      </section>
      
      {/* 实现步骤 */}
      <section className="mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
          <span>🚀</span> 实现步骤
        </h2>
        <div className="space-y-0">
          {project.steps.map((step, i) => (
            <StepCard
              key={i}
              step={step}
              isLast={i === project.steps.length - 1}
            />
          ))}
        </div>
      </section>
      
      {/* 参考资源 */}
      {project.resources.length > 0 && (
        <section className="mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <span>📚</span> 参考资源
          </h2>
          <div className="space-y-3">
            {project.resources.map((resource, i) => (
              <ResourceLink key={i} resource={resource} />
            ))}
          </div>
        </section>
      )}
      
      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-4">
        {project.templateRepo && (
          <a
            href={project.templateRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            查看模板
          </a>
        )}
        {project.solutionRepo && (
          <a
            href={project.solutionRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 text-zinc-300 font-medium rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            参考实现
          </a>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 验证组件**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 4: Commit**

```bash
git add components/practice/
git commit -m "feat(practice): add ProjectDetail and StepCard components"
```

---

### Task 6: 项目详情页

**Files:**
- Create: `app/practice/[slug]/page.tsx`

**Interfaces:**
- Consumes: getProjectBySlug()
- Produces: /practice/[slug] 动态页面

- [ ] **Step 1: 创建动态路由页面**

Run: `mkdir -p "app/practice/[slug]"`

Create `app/practice/[slug]/page.tsx`:
```tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllProjects, getProjectBySlug } from '@/lib/practice';
import { ProjectDetail } from '@/components/practice/ProjectDetail';

interface PageProps {
  params: {
    slug: string;
  };
}

// 静态生成所有项目页面
export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

// 生成页面元数据
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = getProjectBySlug(params.slug);
  
  if (!project) {
    return {
      title: '项目未找到 - TechRadar',
    };
  }
  
  return {
    title: `${project.title} - 实战项目 - TechRadar`,
    description: project.summary,
  };
}

export default function ProjectPage({ params }: PageProps) {
  const project = getProjectBySlug(params.slug);
  
  if (!project) {
    notFound();
  }
  
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <ProjectDetail project={project} />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 验证页面**

Run: `npm run build`
Expected: 构建成功，生成 /practice 和 /practice/[slug] 页面

- [ ] **Step 3: Commit**

```bash
git add "app/practice/[slug]/"
git commit -m "feat(practice): add practice project detail page"
```

---

### Task 7: 路线图关联

**Files:**
- Modify: `components/radar/NodeDetailPanel.tsx`

**Interfaces:**
- Consumes: getProjectsByNode()
- Produces: 在路线图详情面板中显示关联的实战项目

- [ ] **Step 1: 更新 NodeDetailPanel 添加关联项目**

在 `components/radar/NodeDetailPanel.tsx` 中添加：

1. 导入 PracticeProject 类型和 getProjectsByNode 函数：
```typescript
import { PracticeProject } from '@/lib/content-types';
import { getProjectsByNode, getDifficultyStars } from '@/lib/practice';
```

2. 在组件中获取关联项目：
```typescript
// 在组件内部
const relatedProjects = node.relatedProjects
  ? node.relatedProjects.flatMap(nodeId => getProjectsByNode(nodeId))
  : [];
```

3. 在详情面板中添加实战项目区块（在参考资源之后）：
```tsx
{/* 实战项目 */}
{relatedProjects.length > 0 && (
  <div className="mt-6 pt-6 border-t border-zinc-800">
    <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
      <span>🚀</span> 实战项目
    </h3>
    <div className="space-y-3">
      {relatedProjects.map((project) => (
        <Link
          key={project.slug}
          href={`/practice/${project.slug}`}
          className="block p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-emerald-500/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-zinc-200">{project.title}</span>
            <span className="text-xs">{getDifficultyStars(project.difficulty)}</span>
          </div>
          <span className="text-xs text-zinc-500">{project.duration}</span>
        </Link>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 2: 更新路线图节点数据（可选）**

如果需要在路线图节点中显示关联项目，需要在 `lib/roadmap-data.ts` 中为相关节点添加 `relatedProjects` 字段。

- [ ] **Step 3: 验证关联功能**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 4: Commit**

```bash
git add components/radar/NodeDetailPanel.tsx
git commit -m "feat(practice): add related projects to roadmap node detail panel"
```

---

### Task 8: 导航菜单更新

**Files:**
- Modify: 项目导航配置文件（如 `components/layout/Navbar.tsx` 或类似文件）

**Interfaces:**
- Consumes: 无
- Produces: 导航菜单中添加实战项目入口

- [ ] **Step 1: 找到导航配置文件**

Run: `grep -r "路线图\|情报\|工具箱" components/ --include="*.tsx" -l`
找到导航菜单组件

- [ ] **Step 2: 添加实战项目导航项**

在导航菜单中添加：
```tsx
{
  label: '实战项目',
  href: '/practice',
  icon: '🚀',
}
```

- [ ] **Step 3: 验证导航**

Run: `npm run build`
Expected: 构建成功，导航菜单显示实战项目入口

- [ ] **Step 4: Commit**

```bash
git add components/layout/
git commit -m "feat(practice): add practice project to navigation menu"
```

---

### Task 9: 样式优化和响应式适配

**Files:**
- Modify: `app/globals.css`（如需添加自定义样式）
- Verify: 所有组件的响应式布局

**Interfaces:**
- Consumes: 无
- Produces: 优化后的样式和响应式布局

- [ ] **Step 1: 检查组件样式**

确保以下组件在移动端和桌面端都能正常显示：
- ProjectCard（单列 → 多列网格）
- DifficultyFilter（换行显示）
- ProjectDetail（响应式布局）
- StepCard（移动端适配）

- [ ] **Step 2: 添加自定义样式（如需要）**

如果需要特殊的 CSS 类，在 `app/globals.css` 中添加：

```css
/* 实战项目相关样式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

- [ ] **Step 3: 视觉测试**

Run: `npm run dev`
在浏览器中测试以下场景：
- 桌面端（>1024px）：3 列网格布局
- 平板端（768-1024px）：2 列网格布局
- 移动端（<768px）：单列布局

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "style(practice): optimize responsive layout for practice pages"
```

---

### Task 10: 最终验证和构建

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
- 访问 /practice 页面，查看项目列表
- 点击难度筛选，验证筛选功能
- 点击项目卡片，进入详情页
- 在详情页中查看各个区块
- 访问路线图，点击节点查看关联项目
- 测试移动端响应式布局

- [ ] **Step 4: 记录完成状态**

确认所有成功标准：
- [ ] 项目列表页正常显示
- [ ] 项目详情页正常显示
- [ ] 难度筛选功能正常
- [ ] 路线图关联正常
- [ ] 移动端体验良好
- [ ] 所有测试通过

- [ ] **Step 5: Commit**

```bash
git commit --allow-empty -m "feat(practice): complete practice project feature"
```

---

## Spec Coverage Checklist

| Spec Section | Task |
|---|---|
| 2.1 实战项目列表 | Task 3, 4 |
| 2.2 项目详情页 | Task 5, 6 |
| 2.3 难度分级 | Task 2 |
| 3. 数据结构 | Task 1 |
| 4. 页面组件 | Task 3, 4, 5, 6 |
| 5. 路线图关联 | Task 7 |
| 6. 数据存储 | Task 1 |
| 7. 样式设计 | Task 2, 3, 9 |
| 9. 实施步骤 | Task 1-10 按阶段执行 |
| 11. 成功标准 | Task 10（最终验证） |
