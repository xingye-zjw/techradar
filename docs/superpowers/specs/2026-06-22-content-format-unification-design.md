# 内容格式统一设计文档

**日期**：2026-06-22
**版本**：1.0
**状态**：已批准

---

## 1. 目标

统一项目中 4 个内容模块（情报、术语、工具、踩坑）的内部格式，建立标准化的内容结构。

### 1.1 范围

- **情报（Intel）**：统一 MD 文件的正文结构和 frontmatter 字段
- **术语（Glossary）**：整合 JSON 和 MD 双数据源，统一字段结构
- **工具（Toolbox）**：统一 JSON 字段结构，补充缺失字段
- **踩坑（Pitfall）**：统一 JSON 字段结构，补充交叉引用字段

### 1.2 不在范围内

- 路线图（Roadmap）模块（已是 TypeScript 硬编码，结构相对统一）
- 跨模块字段统一（各模块保持自己的特点）
- 内容质量改进（后续任务）

---

## 2. 标准分类体系

### 2.1 统一枚举

```typescript
type ContentCategory = 
  | 'computer-vision'      // 计算机视觉
  | 'nlp'                  // 自然语言处理
  | 'deep-learning'        // 深度学习
  | 'machine-learning'     // 机器学习
  | 'math'                 // 数学基础
  | 'devops'               // 工程部署
  | 'llm'                  // 大语言模型
  | 'reinforcement-learning' // 强化学习
  | 'data-processing'      // 数据处理
  | 'tools'                // 工具相关
  | 'best-practices'       // 最佳实践
```

### 2.2 映射表

| 模块 | 原值 | 新值 |
|------|------|------|
| 情报 | `deep-learning` | `deep-learning`（保持） |
| 情报 | `llm` | `llm`（保持） |
| 术语 | `cv` | `computer-vision` |
| 术语 | `infrastructure` | `devops` |
| 工具 | `"CV · 目标检测"` | `computer-vision` |
| 工具 | `"深度学习框架"` | `deep-learning` |
| 工具 | `"LLM 应用框架"` | `llm` |
| 踩坑 | `"环境配置"` | `devops` |
| 踩坑 | `"训练"` | `deep-learning` |
| 踩坑 | `"部署"` | `devops` |

---

## 3. 模块设计

### 3.1 情报（Intel）

#### 3.1.1 Frontmatter 字段

```yaml
---
title: string                    # 必填
category: ContentCategory        # 必填，统一枚举
keywords: string[]               # 必填
difficulty: 'beginner' | 'intermediate' | 'advanced'  # 必填
duration: string                 # 必填，如 "1-2周"
summary: string                  # 必填，一句话概要
takeaways: string[]              # 必填，你将学到什么
prerequisites?: string[]         # 可选，前置知识要求
relatedTerms?: string[]          # 可选，关联术语 slug
relatedNodes?: string[]          # 可选，关联路线图节点
---
```

#### 3.1.2 正文结构规范

```markdown
# {标题}

## 1. 为什么你要学它
- 这个技术解决什么问题？
- 在实际项目中的应用场景
- 学习它的价值和收益

## 2. 一句话概览
- 用最简洁的语言解释核心概念
- 类比或比喻帮助理解

## 3. 核心原理
### 3.1 基础概念
- 关键术语定义
- 核心思想解释

### 3.2 技术细节
- 算法/架构详解
- 数学原理（如适用）
- 流程图或示意图（如适用）

## 4. 完整实战
### 4.1 环境准备
- 依赖安装
- 配置说明

### 4.2 代码示例
- 完整可运行的代码
- 逐行注释说明
- 关键 API 解释

### 4.3 运行结果
- 预期输出展示
- 结果分析

## 5. 常见误区
### 误区 1：{误区标题}
- **错误理解**：...
- **正确理解**：...
- **如何避免**：...

### 误区 2：{误区标题}
...

## 6. 性能优化（如适用）
- 优化技巧
- 常见瓶颈
- 最佳实践

## 7. 扩展阅读
- 相关技术对比
- 进阶学习资源
- 论文/博客推荐

## 8. 总结
- 核心要点回顾
- 下一步学习建议
```

---

### 3.2 术语（Glossary）

#### 3.2.1 数据整合方案

- 保留 `terms.json` 作为索引文件
- 让 `glossary.ts` 读取 `terms/*.md` 获取详细内容
- JSON 中的 `definition` 作为摘要，MD 中的内容作为完整讲解

#### 3.2.2 terms.json 标准字段

```typescript
interface TermIndex {
  term: string              # 必填，英文术语名
  slug: string              # 必填，URL 友好标识
  nameZh?: string           # 可选，中文名称
  category: ContentCategory # 必填，统一枚举
  definition: string        # 必填，简短定义（1-2句话，用于索引）
  relatedTerms: string[]    # 必填，关联术语 slug
  relatedNodes?: string[]   # 可选，关联路线图节点
  relatedIntel?: string[]   # 可选，关联情报 slug
  relatedTools?: string[]   # 可选，关联工具名称
  tags?: string[]           # 可选，标签
}
```

#### 3.2.3 terms/*.md 标准结构

```markdown
---
title: {术语名称}
category: {ContentCategory}
summary: {简短定义，与 JSON 中的 definition 一致}
relatedTerms: [slug1, slug2]
---

# {术语名称}

## 基本概念
- 定义解释
- 核心思想

## 技术细节
### 原理说明
- 算法/机制详解
- 数学公式（如适用）

### 关键参数
- 重要参数说明
- 参数影响分析

## 代码示例
```python
# 完整可运行的代码
# 逐行注释
```

## 应用场景
- 典型应用案例
- 实际项目中的使用

## 常见问题
- FAQ
- 常见误区

## 相关术语
- 关联概念说明
- 术语对比

## 参考资料
- 论文/文档链接
- 推荐阅读
```

---

### 3.3 工具（Toolbox）

#### 3.3.1 tools.json 标准字段

```typescript
interface Tool {
  name: string                    # 必填，工具名称
  slug?: string                   # 可选，URL 友好标识（可从 name 生成）
  category: ContentCategory       # 必填，统一枚举
  purpose: string                 # 必填，用途说明（一句话）
  description: string             # 必填，详细描述（2-3句话，介绍工具特点和优势）
  install: string                 # 必填，安装命令
  features: string[]              # 必填，特性列表
  tags: string[]                  # 必填，标签
  github: {                       # 必填，GitHub 信息
    stars: string
    last_release: string
    url: string
  }
  difficulty: 'beginner' | 'intermediate' | 'advanced'  # 必填
  official_url: string            # 必填，官方文档
  use_cases: string[]             # 必填，使用场景
  relatedIntel?: string[]         # 可选，关联情报 slug
  relatedNodes?: string[]         # 可选，关联路线图节点
  relatedTerms?: string[]         # 可选，关联术语 slug
}
```

#### 3.3.2 description 字段要求

- 2-3 句话
- 介绍工具的核心特点
- 说明工具的优势和适用场景
- 示例：`"Gradio 是一个快速构建 ML 模型演示界面的开源库，支持一键生成 Web UI，无需前端开发经验，非常适合快速原型开发和模型展示。"`

#### 3.3.3 scenarios 标准字段（保持不变）

```typescript
interface Scenario {
  name: string                    # 必填，场景名称
  description: string             # 必填，场景描述
  tools: string[]                 # 必填，推荐工具列表
  use_case: string                # 必填，适用场景
}
```

---

### 3.4 踩坑（Pitfall）

#### 3.4.1 pitfalls.json 标准字段

```typescript
interface Pitfall {
  title: string                    # 必填，问题标题
  slug?: string                    # 可选，URL 友好标识（可从 title 生成）
  category: ContentCategory        # 必填，统一枚举
  description: string              # 必填，详细问题描述（2-3句话，描述问题现象和影响）
  root_cause: string               # 必填，根本原因分析（解释为什么会发生这个问题）
  symptoms: string[]               # 必填，错误症状（错误信息、异常表现）
  solution: string[]               # 必填，解决方案（步骤列表）
  quickFix: string                 # 必填，一句话速修
  tags: string[]                   # 必填，标签
  prevention?: string[]            # 可选，预防措施
  relatedIntel?: string[]          # 可选，关联情报 slug
  relatedNodes?: string[]          # 可选，关联路线图节点
  relatedTerms?: string[]          # 可选，关联术语 slug
  relatedTools?: string[]          # 可选，关联工具名称
}
```

#### 3.4.2 必填字段要求

| 字段 | 要求 |
|------|------|
| `description` | 2-3 句话，描述问题现象和影响 |
| `root_cause` | 解释为什么会发生这个问题 |

---

## 4. 类型定义

### 4.1 统一类型文件 `lib/content-types.ts`

```typescript
// 统一的内容分类枚举
export type ContentCategory = 
  | 'computer-vision'
  | 'nlp'
  | 'deep-learning'
  | 'machine-learning'
  | 'math'
  | 'devops'
  | 'llm'
  | 'reinforcement-learning'
  | 'data-processing'
  | 'tools'
  | 'best-practices';

// 难度级别
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// 情报（Intel）
export interface IntelCard {
  slug: string;
  title: string;
  category: ContentCategory;
  keywords: string[];
  difficulty: Difficulty;
  duration: string;
  summary: string;
  takeaways: string[];
  content: string;
  tags: string[];
  readingTime: number;
  prerequisites?: string[];
  relatedTerms?: string[];
  relatedNodes?: string[];
}

// 术语索引
export interface TermIndex {
  term: string;
  slug: string;
  nameZh?: string;
  category: ContentCategory;
  definition: string;
  relatedTerms: string[];
  relatedNodes?: string[];
  relatedIntel?: string[];
  relatedTools?: string[];
  tags?: string[];
}

// 术语详情
export interface TermDetail {
  term: string;
  slug: string;
  nameZh?: string;
  category: ContentCategory;
  summary: string;
  content: string;
  relatedTerms: string[];
  relatedNodes?: string[];
  relatedIntel?: string[];
  relatedTools?: string[];
  tags?: string[];
}

// 工具
export interface Tool {
  name: string;
  slug?: string;
  category: ContentCategory;
  purpose: string;
  description: string;
  install: string;
  features: string[];
  tags: string[];
  github: {
    stars: string;
    last_release: string;
    url: string;
  };
  difficulty: Difficulty;
  official_url: string;
  use_cases: string[];
  relatedIntel?: string[];
  relatedNodes?: string[];
  relatedTerms?: string[];
}

// 踩坑
export interface Pitfall {
  title: string;
  slug?: string;
  category: ContentCategory;
  description: string;
  root_cause: string;
  symptoms: string[];
  solution: string[];
  quickFix: string;
  tags: string[];
  prevention?: string[];
  relatedIntel?: string[];
  relatedNodes?: string[];
  relatedTerms?: string[];
  relatedTools?: string[];
}
```

---

## 5. 数据解析逻辑

### 5.1 术语解析器更新 `lib/glossary.ts`

**改动点**：
- 读取 `terms.json` 作为索引
- 读取 `terms/*.md` 获取详细内容
- 合并两个数据源

```typescript
// 新增：读取 Markdown 术语详情（同步版本）
function readTermDetail(slug: string): string {
  const mdPath = path.join(process.cwd(), 'content', 'glossary', 'terms', `${slug}.md`);
  try {
    const content = fs.readFileSync(mdPath, 'utf-8');
    const { content: markdown } = matter(content);
    return markdown;
  } catch {
    return '';
  }
}

// 更新：合并索引和详情
export function getAllTerms(): TermDetail[] {
  const terms = termsData as TermIndex[];
  
  return terms.map(item => {
    const content = readTermDetail(item.slug);
    return {
      term: item.term,
      slug: item.slug,
      nameZh: item.nameZh,
      category: item.category,
      summary: item.definition,
      content: content,
      relatedTerms: item.relatedTerms || [],
      relatedNodes: item.relatedNodes || [],
      relatedIntel: item.relatedIntel || [],
      relatedTools: item.relatedTools || [],
      tags: item.tags || [],
    };
  });
}
```

### 5.2 情报解析器更新 `lib/intel.ts`

**改动点**：
- 新增 `prerequisites`、`relatedTerms`、`relatedNodes` 字段解析
- 统一 category 枚举值

```typescript
// 更新：frontmatter 解析
const { data, content } = matter(fileContent);

return {
  slug,
  title: data.title || 'Untitled',
  category: data.category || 'deep-learning',
  keywords: data.keywords || [],
  difficulty: data.difficulty || 'intermediate',
  duration: data.duration || '未知',
  summary: data.summary || '',
  takeaways: data.takeaways || [],
  content,
  tags: generateTags(data),
  readingTime: calculateReadingTime(content),
  // 新增字段
  prerequisites: data.prerequisites || [],
  relatedTerms: data.relatedTerms || [],
  relatedNodes: data.relatedNodes || [],
};
```

### 5.3 工具解析器更新 `lib/toolbox.ts`

**改动点**：
- 新增 `slug` 字段（可从 name 生成）
- 新增 `description` 字段解析
- 统一 category 枚举值

```typescript
// 更新：工具数据解析
export function getAllTools(): Tool[] {
  return toolsData.tools.map(tool => ({
    ...tool,
    // 自动生成 slug（如果没有）
    slug: tool.slug || tool.name.toLowerCase().replace(/\s+/g, '-'),
    // description 必填，保持不变
    description: tool.description,
  }));
}
```

### 5.4 踩坑解析器更新 `lib/pitfall.ts`

**改动点**：
- 新增 `slug` 字段（可从 title 生成）
- 新增 `description`、`root_cause`、`prevention` 字段解析
- 新增交叉引用字段解析

```typescript
// 更新：踩坑数据解析
export function getAllPitfalls(): Pitfall[] {
  return pitfallsData.map(pitfall => ({
    ...pitfall,
    // 自动生成 slug（如果没有）
    slug: pitfall.slug || pitfall.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-'),
    // 必填字段保持不变
    description: pitfall.description,
    root_cause: pitfall.root_cause,
    // 新增可选字段
    prevention: pitfall.prevention || [],
    relatedIntel: pitfall.relatedIntel || [],
    relatedNodes: pitfall.relatedNodes || [],
    relatedTerms: pitfall.relatedTerms || [],
    relatedTools: pitfall.relatedTools || [],
  }));
}
```

---

## 6. 错误处理

### 6.1 数据验证

```typescript
// lib/content-validator.ts

// 验证 category 是否有效
export function isValidCategory(category: string): category is ContentCategory {
  const validCategories: ContentCategory[] = [
    'computer-vision', 'nlp', 'deep-learning', 'machine-learning',
    'math', 'devops', 'llm', 'reinforcement-learning',
    'data-processing', 'tools', 'best-practices'
  ];
  return validCategories.includes(category as ContentCategory);
}

// 验证情报数据
export function validateIntel(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.title) errors.push('情报缺少 title 字段');
  if (!data.category) errors.push('情报缺少 category 字段');
  else if (!isValidCategory(data.category)) {
    errors.push(`情报 category 无效: ${data.category}`);
  }
  if (!data.keywords?.length) errors.push('情报缺少 keywords 字段');
  if (!data.difficulty) errors.push('情报缺少 difficulty 字段');
  if (!data.summary) errors.push('情报缺少 summary 字段');
  if (!data.takeaways?.length) errors.push('情报缺少 takeaways 字段');
  
  return errors;
}

// 验证术语数据
export function validateTerm(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.term) errors.push('术语缺少 term 字段');
  if (!data.slug) errors.push('术语缺少 slug 字段');
  if (!data.category) errors.push('术语缺少 category 字段');
  if (!data.definition) errors.push('术语缺少 definition 字段');
  
  return errors;
}

// 验证工具数据
export function validateTool(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.name) errors.push('工具缺少 name 字段');
  if (!data.category) errors.push('工具缺少 category 字段');
  if (!data.purpose) errors.push('工具缺少 purpose 字段');
  if (!data.description) errors.push('工具缺少 description 字段');
  if (!data.install) errors.push('工具缺少 install 字段');
  
  return errors;
}

// 验证踩坑数据
export function validatePitfall(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.title) errors.push('踩坑缺少 title 字段');
  if (!data.category) errors.push('踩坑缺少 category 字段');
  if (!data.description) errors.push('踩坑缺少 description 字段');
  if (!data.root_cause) errors.push('踩坑缺少 root_cause 字段');
  if (!data.symptoms?.length) errors.push('踩坑缺少 symptoms 字段');
  if (!data.solution?.length) errors.push('踩坑缺少 solution 字段');
  if (!data.quickFix) errors.push('踩坑缺少 quickFix 字段');
  
  return errors;
}
```

### 6.2 数据加载错误处理

```typescript
// lib/content-loader.ts

export function loadContentSafely<T>(
  loader: () => T,
  validator: (data: any) => string[],
  contentType: string
): { data: T | null; errors: string[] } {
  try {
    const data = loader();
    const errors = validator(data);
    
    if (errors.length > 0) {
      console.warn(`[${contentType}] 数据验证警告:`, errors);
    }
    
    return { data, errors };
  } catch (error) {
    const errorMsg = `[${contentType}] 数据加载失败: ${error.message}`;
    console.error(errorMsg);
    return { data: null, errors: [errorMsg] };
  }
}
```

### 6.3 构建时验证脚本

```typescript
// scripts/validate-content.ts

import { getAllIntel } from '../lib/intel';
import { getAllTerms } from '../lib/glossary';
import { getAllTools } from '../lib/toolbox';
import { getAllPitfalls } from '../lib/pitfall';
import { validateIntel, validateTerm, validateTool, validatePitfall } from '../lib/content-validator';

async function validateAll() {
  console.log('开始验证所有内容...\n');
  
  // 验证情报
  const intel = getAllIntel();
  console.log(`情报数量: ${intel.length}`);
  intel.forEach(item => {
    const errors = validateIntel(item);
    if (errors.length > 0) {
      console.error(`❌ ${item.slug}:`, errors);
    }
  });
  
  // 验证术语
  const terms = getAllTerms();
  console.log(`术语数量: ${terms.length}`);
  terms.forEach(item => {
    const errors = validateTerm(item);
    if (errors.length > 0) {
      console.error(`❌ ${item.slug}:`, errors);
    }
  });
  
  // 验证工具
  const tools = getAllTools();
  console.log(`工具数量: ${tools.length}`);
  tools.forEach(item => {
    const errors = validateTool(item);
    if (errors.length > 0) {
      console.error(`❌ ${item.name}:`, errors);
    }
  });
  
  // 验证踩坑
  const pitfalls = getAllPitfalls();
  console.log(`踩坑数量: ${pitfalls.length}`);
  pitfalls.forEach(item => {
    const errors = validatePitfall(item);
    if (errors.length > 0) {
      console.error(`❌ ${item.title}:`, errors);
    }
  });
  
  console.log('\n验证完成！');
}

validateAll().catch(console.error);
```

---

## 7. 测试策略

### 7.1 单元测试

```typescript
// __tests__/lib/content-validator.test.ts

import { validateIntel, validateTerm, validateTool, validatePitfall } from '../../lib/content-validator';

describe('内容验证器', () => {
  describe('validateIntel', () => {
    it('应验证完整的情报数据', () => {
      const validIntel = {
        title: '测试情报',
        category: 'deep-learning',
        keywords: ['test'],
        difficulty: 'beginner',
        summary: '测试概要',
        takeaways: ['要点1'],
      };
      expect(validateIntel(validIntel)).toHaveLength(0);
    });

    it('应报告缺少必填字段', () => {
      const invalidIntel = { title: '测试' };
      const errors = validateIntel(invalidIntel);
      expect(errors).toContain('情报缺少 category 字段');
      expect(errors).toContain('情报缺少 keywords 字段');
    });

    it('应验证无效的 category', () => {
      const invalidIntel = {
        title: '测试',
        category: 'invalid-category',
        keywords: ['test'],
        difficulty: 'beginner',
        summary: '测试',
        takeaways: ['测试'],
      };
      const errors = validateIntel(invalidIntel);
      expect(errors).toContain('情报 category 无效: invalid-category');
    });
  });

  describe('validateTerm', () => {
    it('应验证完整的术语数据', () => {
      const validTerm = {
        term: 'Test',
        slug: 'test',
        category: 'deep-learning',
        definition: '测试定义',
      };
      expect(validateTerm(validTerm)).toHaveLength(0);
    });

    it('应报告缺少必填字段', () => {
      const invalidTerm = { term: 'Test' };
      const errors = validateTerm(invalidTerm);
      expect(errors).toContain('术语缺少 slug 字段');
    });
  });

  describe('validateTool', () => {
    it('应验证完整的工具数据', () => {
      const validTool = {
        name: 'TestTool',
        category: 'tools',
        purpose: '测试用途',
        description: '测试描述',
        install: 'pip install test',
      };
      expect(validateTool(validTool)).toHaveLength(0);
    });

    it('应报告缺少必填字段', () => {
      const invalidTool = { name: 'Test' };
      const errors = validateTool(invalidTool);
      expect(errors).toContain('工具缺少 description 字段');
    });
  });

  describe('validatePitfall', () => {
    it('应验证完整的踩坑数据', () => {
      const validPitfall = {
        title: '测试问题',
        category: 'devops',
        description: '测试描述',
        root_cause: '测试原因',
        symptoms: ['症状1'],
        solution: ['解决1'],
        quickFix: '快速修复',
      };
      expect(validatePitfall(validPitfall)).toHaveLength(0);
    });

    it('应报告缺少必填字段', () => {
      const invalidPitfall = { title: '测试' };
      const errors = validatePitfall(invalidPitfall);
      expect(errors).toContain('踩坑缺少 category 字段');
    });
  });
});
```

### 7.2 集成测试

```typescript
// __tests__/lib/content-loader.test.ts

import { getAllIntel } from '../../lib/intel';
import { getAllTerms } from '../../lib/glossary';
import { getAllTools } from '../../lib/toolbox';
import { getAllPitfalls } from '../../lib/pitfall';

describe('内容加载器', () => {
  it('应加载所有情报', () => {
    const intel = getAllIntel();
    expect(intel.length).toBeGreaterThan(0);
    expect(intel[0]).toHaveProperty('title');
    expect(intel[0]).toHaveProperty('category');
  });

  it('应加载所有术语', () => {
    const terms = getAllTerms();
    expect(terms.length).toBeGreaterThan(0);
    expect(terms[0]).toHaveProperty('term');
    expect(terms[0]).toHaveProperty('slug');
  });

  it('应加载所有工具', () => {
    const tools = getAllTools();
    expect(tools.length).toBeGreaterThan(0);
    expect(tools[0]).toHaveProperty('name');
    expect(tools[0]).toHaveProperty('description');
  });

  it('应加载所有踩坑', () => {
    const pitfalls = getAllPitfalls();
    expect(pitfalls.length).toBeGreaterThan(0);
    expect(pitfalls[0]).toHaveProperty('title');
    expect(pitfalls[0]).toHaveProperty('root_cause');
  });
});
```

### 7.3 运行命令

```bash
# 运行类型检查
npm run type-check

# 运行测试
npm run test

# 运行内容验证
npm run validate-content
```

---

## 8. 实施步骤

### 8.1 阶段 1：类型定义（1天）

1. 创建 `lib/content-types.ts` 统一类型文件
2. 更新各模块的类型定义
3. 运行类型检查确保无错误

### 8.2 阶段 2：数据验证（1天）

1. 创建 `lib/content-validator.ts` 验证器
2. 创建 `lib/content-loader.ts` 安全加载器
3. 创建 `scripts/validate-content.ts` 验证脚本
4. 运行验证脚本，修复现有数据问题

### 8.3 阶段 3：数据迁移（2-3天）

1. 更新 `content/glossary/terms.json` 字段
2. 更新 `content/toolbox/tools.json` 字段
3. 更新 `content/pitfall/pitfalls.json` 字段
4. 更新 `content/intel/*.md` frontmatter
5. 运行验证脚本确保数据正确

### 8.4 阶段 4：解析器更新（2天）

1. 更新 `lib/glossary.ts` 解析逻辑
2. 更新 `lib/intel.ts` 解析逻辑
3. 更新 `lib/toolbox.ts` 解析逻辑
4. 更新 `lib/pitfall.ts` 解析逻辑
5. 测试所有页面功能正常

### 8.5 阶段 5：测试（1天）

1. 编写单元测试
2. 编写集成测试
3. 运行所有测试
4. 修复发现的问题

### 8.6 阶段 6：文档更新（0.5天）

1. 更新 `docs/content-spec.md` 内容规范
2. 更新 `CLAUDE.md` 项目记忆
3. 提交代码

---

## 9. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 数据迁移导致页面功能异常 | 高 | 分模块迁移，每步测试 |
| 类型定义变更导致编译错误 | 中 | 逐步更新，保持向后兼容 |
| 术语 MD 文件缺失 | 低 | 提供空内容默认值 |
| category 映射错误 | 中 | 建立映射表，逐个验证 |

---

## 10. 成功标准

- [ ] 所有模块内部格式统一
- [ ] 所有必填字段完整
- [ ] 分类体系统一
- [ ] 类型检查通过
- [ ] 所有测试通过
- [ ] 页面功能正常
- [ ] 文档更新完成
