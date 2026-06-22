# 内容格式统一实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 统一项目中 4 个内容模块（情报、术语、工具、踩坑）的内部格式，建立标准化的内容结构和统一的分类体系。

**Architecture:** 创建统一的类型定义文件 `lib/content-types.ts`，建立数据验证器 `lib/content-validator.ts`，然后逐步更新各模块的数据结构和解析逻辑，最后添加构建时验证脚本确保数据质量。

**Tech Stack:** TypeScript, Next.js, gray-matter (Markdown 解析)

---

## Global Constraints

- 保持向后兼容：现有页面功能不能因格式变更而中断
- 分模块迁移：每次只处理一个模块，验证通过后再处理下一个
- 分类枚举值必须符合 `ContentCategory` 定义（见第 2 节映射表）
- 可选字段使用 `?` 标记，解析时提供默认值
- 测试策略：每个任务完成后运行 `npm run build` 确保构建成功

---

## File Structure

### 新建文件

| 文件路径 | 职责 |
|----------|------|
| `lib/content-types.ts` | 统一类型定义（ContentCategory、IntelCard、TermIndex、TermDetail、Tool、Pitfall） |
| `lib/content-validator.ts` | 数据验证函数（validateIntel、validateTerm、validateTool、validatePitfall） |
| `scripts/validate-content.ts` | 构建时验证脚本，检查所有内容数据是否符合规范 |

### 修改文件

| 文件路径 | 修改内容 |
|----------|----------|
| `lib/intel.ts` | 添加 prerequisites、relatedTerms、relatedNodes 字段解析 |
| `lib/glossary.ts` | 读取 terms/*.md 获取详细内容，合并到 TermDetail |
| `lib/toolbox.ts` | 添加 description、slug 字段，统一 category 枚举值 |
| `lib/pitfall.ts` | 添加 description、root_cause、slug、prevention 字段，统一 category 枚举值 |
| `content/glossary/terms.json` | 更新 category 字段（cv→computer-vision, infrastructure→devops），添加新字段 |
| `content/toolbox/tools.json` | 更新 category 字段，添加 description 字段 |
| `content/pitfall/pitfalls.json` | 更新 category 字段，添加 description、root_cause 字段 |
| `content/intel/*.md` | 更新 frontmatter（42 个文件），添加 prerequisites、relatedTerms、relatedNodes |

---

## Task 1: 创建统一类型定义

**Files:**
- Create: `lib/content-types.ts`

**Interfaces:**
- Consumes: 无（首个任务）
- Produces: `ContentCategory`, `Difficulty`, `IntelCard`, `TermIndex`, `TermDetail`, `Tool`, `Pitfall`

- [ ] **Step 1: 创建 content-types.ts 文件**

```typescript
// lib/content-types.ts

/**
 * 统一的内容分类枚举
 * 所有模块必须使用此枚举值
 */
export type ContentCategory =
  | 'computer-vision'       // 计算机视觉
  | 'nlp'                   // 自然语言处理
  | 'deep-learning'         // 深度学习
  | 'machine-learning'      // 机器学习
  | 'math'                  // 数学基础
  | 'devops'                // 工程部署
  | 'llm'                   // 大语言模型
  | 'reinforcement-learning' // 强化学习
  | 'data-processing'       // 数据处理
  | 'tools'                 // 工具相关
  | 'best-practices';       // 最佳实践

/**
 * 难度级别
 */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * 资源链接
 */
export interface ResourceLink {
  title: string;
  url: string;
  type: 'paper' | 'article' | 'course' | 'documentation' | 'video';
}

/**
 * 情报卡片（Intel）
 */
export interface IntelCard {
  slug: string;
  title: string;
  category: ContentCategory;
  keywords: string[];
  difficulty: Difficulty;
  duration: string;
  summary: string;
  takeaways?: string[];
  content: string;
  tags: string[];
  readingTime: number;
  prerequisites?: string[];
  relatedTerms?: string[];
  relatedNodes?: string[];
}

/**
 * 术语索引（terms.json）
 */
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

/**
 * 术语详情（合并索引 + MD 内容）
 */
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

/**
 * 工具（Toolbox）
 */
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

/**
 * 工具使用场景
 */
export interface ToolScenario {
  key: string;
  label: string;
  description: string;
  tool_names: string[];
}

/**
 * 工具箱数据
 */
export interface ToolboxData {
  tools: Tool[];
  scenarios: ToolScenario[];
}

/**
 * 踩坑避雷（Pitfall）
 */
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

/**
 * 验证 category 是否有效
 */
export function isValidCategory(category: string): category is ContentCategory {
  const validCategories: ContentCategory[] = [
    'computer-vision', 'nlp', 'deep-learning', 'machine-learning',
    'math', 'devops', 'llm', 'reinforcement-learning',
    'data-processing', 'tools', 'best-practices'
  ];
  return validCategories.includes(category as ContentCategory);
}
```

- [ ] **Step 2: 验证类型定义无语法错误**

运行: `npx tsc --noEmit lib/content-types.ts`
预期: 无错误输出

- [ ] **Step 3: 提交代码**

```bash
git add lib/content-types.ts
git commit -m "feat: 添加统一内容类型定义 content-types.ts"
```

---

## Task 2: 创建数据验证器

**Files:**
- Create: `lib/content-validator.ts`

**Interfaces:**
- Consumes: `ContentCategory`, `IntelCard`, `TermIndex`, `Tool`, `Pitfall` (from Task 1)
- Produces: `validateIntel()`, `validateTerm()`, `validateTool()`, `validatePitfall()`

- [ ] **Step 1: 创建 content-validator.ts 文件**

```typescript
// lib/content-validator.ts

import { isValidCategory, type ContentCategory } from './content-types';

/**
 * 验证情报数据
 * @returns 错误消息数组，空数组表示验证通过
 */
export function validateIntel(data: any): string[] {
  const errors: string[] = [];

  if (!data.title) errors.push('情报缺少 title 字段');
  if (!data.category) {
    errors.push('情报缺少 category 字段');
  } else if (!isValidCategory(data.category)) {
    errors.push(`情报 category 无效: ${data.category}`);
  }
  if (!data.keywords?.length) errors.push('情报缺少 keywords 字段');
  if (!data.difficulty) errors.push('情报缺少 difficulty 字段');
  if (!data.summary) errors.push('情报缺少 summary 字段');
  if (!data.takeaways?.length) errors.push('情报缺少 takeaways 字段');

  return errors;
}

/**
 * 验证术语数据
 */
export function validateTerm(data: any): string[] {
  const errors: string[] = [];

  if (!data.term) errors.push('术语缺少 term 字段');
  if (!data.slug) errors.push('术语缺少 slug 字段');
  if (!data.category) {
    errors.push('术语缺少 category 字段');
  } else if (!isValidCategory(data.category)) {
    errors.push(`术语 category 无效: ${data.category}`);
  }
  if (!data.definition) errors.push('术语缺少 definition 字段');

  return errors;
}

/**
 * 验证工具数据
 */
export function validateTool(data: any): string[] {
  const errors: string[] = [];

  if (!data.name) errors.push('工具缺少 name 字段');
  if (!data.category) {
    errors.push('工具缺少 category 字段');
  } else if (!isValidCategory(data.category)) {
    errors.push(`工具 category 无效: ${data.category}`);
  }
  if (!data.purpose) errors.push('工具缺少 purpose 字段');
  if (!data.description) errors.push('工具缺少 description 字段');
  if (!data.install) errors.push('工具缺少 install 字段');

  return errors;
}

/**
 * 验证踩坑数据
 */
export function validatePitfall(data: any): string[] {
  const errors: string[] = [];

  if (!data.title) errors.push('踩坑缺少 title 字段');
  if (!data.category) {
    errors.push('踩坑缺少 category 字段');
  } else if (!isValidCategory(data.category)) {
    errors.push(`踩坑 category 无效: ${data.category}`);
  }
  if (!data.description) errors.push('踩坑缺少 description 字段');
  if (!data.root_cause) errors.push('踩坑缺少 root_cause 字段');
  if (!data.symptoms?.length) errors.push('踩坑缺少 symptoms 字段');
  if (!data.solution?.length) errors.push('踩坑缺少 solution 字段');
  if (!data.quickFix) errors.push('踩坑缺少 quickFix 字段');

  return errors;
}
```

- [ ] **Step 2: 验证验证器无语法错误**

运行: `npx tsc --noEmit lib/content-validator.ts`
预期: 无错误输出

- [ ] **Step 3: 提交代码**

```bash
git add lib/content-validator.ts
git commit -m "feat: 添加数据验证器 content-validator.ts"
```

---

## Task 3: 更新术语数据结构

**Files:**
- Modify: `content/glossary/terms.json`
- Modify: `lib/glossary.ts`

**Interfaces:**
- Consumes: `TermIndex`, `TermDetail` (from Task 1)
- Produces: `getAllTerms()` 返回 `TermDetail[]`

- [ ] **Step 1: 更新 terms.json 的 category 字段**

将 `content/glossary/terms.json` 中的 category 值按以下映射更新：
- `cv` → `computer-vision`
- `infrastructure` → `devops`

```bash
# 使用 sed 批量替换
sed -i 's/"category": "cv"/"category": "computer-vision"/g' content/glossary/terms.json
sed -i 's/"category": "infrastructure"/"category": "devops"/g' content/glossary/terms.json
```

- [ ] **Step 2: 验证 terms.json 格式正确**

运行: `node -e "const data = require('./content/glossary/terms.json'); console.log('Terms count:', data.length);"`
预期: 输出 `Terms count: 16`（或实际数量）

- [ ] **Step 3: 更新 glossary.ts 支持读取 MD 详情**

```typescript
// lib/glossary.ts - 更新导入和类型

import glossaryData from "@/content/glossary/terms.json";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ContentCategory, TermIndex, TermDetail } from "./content-types";

// ============ 旧类型保留向后兼容 ============

export interface ResourceLink {
  title: string;
  url: string;
  type: "paper" | "article" | "course" | "documentation" | "video";
}

export interface GlossaryTerm {
  slug: string;
  name: string;
  nameEn?: string;
  category: string;
  tags: string[];
  summary: string;
  description: string;
  relatedTerms: string[];
  relatedNodes: string[];
  relatedIntel: string[];
  relatedTools: string[];
  resources: ResourceLink[];
}

export interface GlossaryCategory {
  id: string;
  name: string;
  description: string;
}

// JSON 数据的实际结构
interface RawGlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  category: string;
  relatedTerms: string[];
  relatedNodes?: string[];
  relatedIntel?: string[];
  relatedTools?: string[];
  tags?: string[];
}

// JSON 文件是数组格式
type GlossaryData = RawGlossaryTerm[];

// ============ 模块级缓存 ============

let cachedTerms: TermDetail[] | null = null;

// ============ 辅助函数 ============

/**
 * 读取术语的 Markdown 详细内容
 */
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

// ============ 数据读取 ============

/**
 * 获取完整的术语列表（返回 TermDetail 类型）
 */
export function getAllTerms(): TermDetail[] {
  if (cachedTerms) return cachedTerms;

  const data = glossaryData as unknown as GlossaryData;
  cachedTerms = data.map((item) => ({
    term: item.term,
    slug: item.slug,
    nameZh: undefined,
    category: item.category as ContentCategory,
    summary: item.definition,
    content: readTermDetail(item.slug),
    relatedTerms: item.relatedTerms || [],
    relatedNodes: item.relatedNodes || [],
    relatedIntel: item.relatedIntel || [],
    relatedTools: item.relatedTools || [],
    tags: item.tags || [],
  }));

  return cachedTerms;
}

// ============ 向后兼容的 GlossaryTerm 转换 ============

function toGlossaryTerm(term: TermDetail): GlossaryTerm {
  return {
    slug: term.slug,
    name: term.term,
    nameEn: undefined,
    category: term.category,
    tags: term.tags || [],
    summary: term.summary,
    description: term.content || term.summary,
    relatedTerms: term.relatedTerms,
    relatedNodes: term.relatedNodes || [],
    relatedIntel: term.relatedIntel || [],
    relatedTools: term.relatedTools || [],
    resources: [],
  };
}

// 根据 slug 获取术语（返回 GlossaryTerm 保持向后兼容）
export function getTermBySlug(slug: string): GlossaryTerm | undefined {
  const terms = getAllTerms();
  const term = terms.find((t) => t.slug === slug);
  return term ? toGlossaryTerm(term) : undefined;
}

// 根据分类获取术语
export function getTermsByCategory(category: string): GlossaryTerm[] {
  return getAllTerms()
    .filter((term) => term.category === category)
    .map(toGlossaryTerm);
}

// 获取所有分类
export function getAllCategories(): GlossaryCategory[] {
  const terms = getAllTerms();
  const categoryMap = new Map<string, GlossaryCategory>();

  for (const term of terms) {
    if (!categoryMap.has(term.category)) {
      categoryMap.set(term.category, {
        id: term.category,
        name: term.category,
        description: '',
      });
    }
  }

  return Array.from(categoryMap.values());
}

// 获取相关术语
export function getRelatedTerms(slug: string): GlossaryTerm[] {
  const term = getAllTerms().find((t) => t.slug === slug);
  if (!term) return [];
  return term.relatedTerms
    .map((relatedSlug) => getTermBySlug(relatedSlug))
    .filter((t): t is GlossaryTerm => t !== undefined);
}

// 搜索术语
export function searchTerms(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase();
  return getAllTerms()
    .filter(
      (term) =>
        term.term.toLowerCase().includes(lowerQuery) ||
        term.summary.toLowerCase().includes(lowerQuery) ||
        (term.tags || []).some((tag) => tag.toLowerCase().includes(lowerQuery))
    )
    .map(toGlossaryTerm);
}

// 按首字母分组
export function getTermsGroupedByLetter(): Record<string, GlossaryTerm[]> {
  const terms = getAllTerms();
  const grouped: Record<string, GlossaryTerm[]> = {};

  for (const term of terms) {
    const firstLetter = term.term.charAt(0).toUpperCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(toGlossaryTerm(term));
  }

  return grouped;
}

// 获取所有标签
export function getAllTags(): string[] {
  const terms = getAllTerms();
  const tagSet = new Set<string>();
  for (const term of terms) {
    for (const tag of term.tags || []) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

// 通过 slug 列表获取术语（用于批量查询）
export function getTermsBySlugs(slugs: string[]): GlossaryTerm[] {
  return slugs
    .map((slug) => getTermBySlug(slug))
    .filter((t): t is GlossaryTerm => t !== undefined);
}
```

- [ ] **Step 4: 验证构建成功**

运行: `npm run build`
预期: 构建成功，无 TypeScript 错误

- [ ] **Step 5: 提交代码**

```bash
git add content/glossary/terms.json lib/glossary.ts
git commit -m "feat: 更新术语数据结构，支持 category 映射和 MD 详情读取"
```

---

## Task 4: 更新工具数据结构

**Files:**
- Modify: `content/toolbox/tools.json`
- Modify: `lib/toolbox.ts`

**Interfaces:**
- Consumes: `Tool`, `ToolboxData` (from Task 1)
- Produces: `getAllTools()` 返回符合新类型的工具数组

- [ ] **Step 1: 更新 tools.json 的 category 字段**

将 `content/toolbox/tools.json` 中的 category 值按以下映射更新：
- `"CV · 目标检测"` → `computer-vision`
- `"深度学习框架"` → `deep-learning`
- `"LLM 应用框架"` → `llm`
- `"NLP · LLM"` → `nlp`

同时为每个工具添加 `description` 字段（如果缺失）。

```bash
# 示例：使用 jq 批量更新 category（需要安装 jq）
# 或手动编辑 JSON 文件
```

- [ ] **Step 2: 更新 toolbox.ts**

```typescript
// lib/toolbox.ts - 更新导入和类型

import fs from "node:fs";
import path from "node:path";
import { getAllIntelCards, type IntelCard } from "./intel";
import type { ContentCategory, Tool, ToolScenario, ToolboxData } from "./content-types";

// ============ 旧类型保留向后兼容 ============

export interface ToolGithubInfo {
  stars: string;
  last_release: string;
  url: string;
}

export interface RelatedIntelRef {
  slug: string;
  title: string;
  summary: string;
  matchScore: number;
}

export interface ToolWithRelated extends Tool {
  related_intel: RelatedIntelRef[];
}

// ============ 模块级缓存 ============

let cachedData: ToolboxData | null = null;

// ============ 辅助函数 ============

/**
 * 自动生成工具 slug
 */
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ============ 数据读取 ============

export function getToolboxData(): ToolboxData {
  if (cachedData) return cachedData;

  const dataPath = path.join(process.cwd(), "content", "toolbox", "tools.json");

  if (!fs.existsSync(dataPath)) {
    cachedData = { tools: [], scenarios: [] };
    return cachedData;
  }

  const raw = fs.readFileSync(dataPath, "utf8");
  const jsonData = JSON.parse(raw);

  // 转换工具数据，确保符合 Tool 类型
  cachedData = {
    tools: jsonData.tools.map((tool: any) => ({
      ...tool,
      slug: tool.slug || generateSlug(tool.name),
      description: tool.description || tool.purpose,
      category: tool.category as ContentCategory,
    })),
    scenarios: jsonData.scenarios || [],
  };

  return cachedData;
}

// ============ 向后兼容的导出 ============

export function getToolCategories(): string[] {
  const { tools } = getToolboxData();
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const tool of tools) {
    if (!seen.has(tool.category)) {
      seen.add(tool.category);
      categories.push(tool.category);
    }
  }
  return categories;
}

// 停用词列表（用于关键词匹配）
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "for", "with", "of", "in", "on", "to",
  "is", "are", "was", "were", "be", "been", "being", "as", "at", "by",
  "this", "that", "these", "those", "it", "its", "from", "into", "your",
  "you", "we", "our", "can", "may", "will", "would", "should", "could",
  "not", "but", "if", "then", "than", "so", "such", "no", "do", "does",
]);

function tokenize(text: string): string[] {
  const tokens = new Set<string>();
  const parts = text
    .toLowerCase()
    .split(/[^a-z0-9一-龥]+/)
    .filter(Boolean);

  for (const t of parts) {
    if (t.length < 2) continue;
    if (STOPWORDS.has(t)) continue;
    tokens.add(t);
    if (/[一-龥]/.test(t) && t.length >= 2) {
      for (let i = 0; i <= t.length - 2; i++) {
        tokens.add(t.slice(i, i + 2));
      }
    }
  }
  return Array.from(tokens);
}

/**
 * 工具 → 关联技术情报（加权匹配）
 */
export function findRelatedIntel(tool: Tool, maxResults = 3): RelatedIntelRef[] {
  const intelCards = getAllIntelCards();
  if (intelCards.length === 0) return [];

  const nameTokens = tokenize(tool.name);
  const tagTokensList: string[] = [];
  tool.tags.forEach((tag) => {
    tokenize(tag).forEach((t) => {
      if (tagTokensList.indexOf(t) === -1) tagTokensList.push(t);
    });
  });
  const useCaseTokensList: string[] = [];
  tool.use_cases.forEach((uc) => {
    tokenize(uc).forEach((t) => {
      if (useCaseTokensList.indexOf(t) === -1) useCaseTokensList.push(t);
    });
  });
  const purposeTokens = tokenize(tool.purpose);

  const scored: RelatedIntelRef[] = intelCards.map((card) => {
    const titleTokens = tokenize(card.title);
    const keywordList: string[] = [];
    card.keywords.forEach((kw) => {
      tokenize(kw).forEach((t) => {
        if (keywordList.indexOf(t) === -1) keywordList.push(t);
      });
    });
    const summaryTokens = tokenize(card.summary);

    let score = 0;
    nameTokens.forEach((tok) => {
      if (titleTokens.indexOf(tok) !== -1) score += 5;
      if (keywordList.indexOf(tok) !== -1) score += 4;
    });
    tagTokensList.forEach((tok) => {
      if (keywordList.indexOf(tok) !== -1) score += 3;
      if (titleTokens.indexOf(tok) !== -1) score += 3;
    });
    useCaseTokensList.forEach((tok) => {
      if (keywordList.indexOf(tok) !== -1) score += 2.5;
      if (titleTokens.indexOf(tok) !== -1) score += 2;
      if (summaryTokens.indexOf(tok) !== -1) score += 1.2;
    });
    purposeTokens.forEach((tok) => {
      if (summaryTokens.indexOf(tok) !== -1) score += 0.6;
      if (keywordList.indexOf(tok) !== -1) score += 0.8;
    });

    return {
      slug: card.slug,
      title: card.title,
      summary: card.summary,
      matchScore: score,
    };
  });

  return scored
    .filter((r) => r.matchScore >= 3)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, maxResults);
}

/**
 * 根据工具名称获取工具详情
 */
export function getToolByName(name: string): Tool | undefined {
  const data = getToolboxData();
  return data.tools.find((t) => t.name === name);
}

/**
 * 获取工具的 ID（用于 URL）
 */
export function getToolId(tool: Tool): string {
  return tool.slug || tool.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function getToolboxDataWithRelated(): {
  tools: ToolWithRelated[];
  scenarios: ToolScenario[];
} {
  const data = getToolboxData();
  const tools: ToolWithRelated[] = data.tools.map((tool) => ({
    ...tool,
    related_intel: findRelatedIntel(tool),
  }));
  return { tools, scenarios: data.scenarios };
}
```

- [ ] **Step 3: 验证构建成功**

运行: `npm run build`
预期: 构建成功，无 TypeScript 错误

- [ ] **Step 4: 提交代码**

```bash
git add content/toolbox/tools.json lib/toolbox.ts
git commit -m "feat: 更新工具数据结构，添加 description 和 slug 字段"
```

---

## Task 5: 更新踩坑数据结构

**Files:**
- Modify: `content/pitfall/pitfalls.json`
- Modify: `lib/pitfall.ts`

**Interfaces:**
- Consumes: `Pitfall` (from Task 1)
- Produces: `getAllPitfalls()` 返回符合新类型的踩坑数组

- [ ] **Step 1: 更新 pitfalls.json 的 category 字段**

将 `content/pitfall/pitfalls.json` 中的 category 值按以下映射更新：
- `"环境配置"` → `devops`
- `"训练"` → `deep-learning`
- `"部署"` → `devops`
- `"数据处理"` → `data-processing`
- `"开发协作"` → `best-practices`
- `"LLM"` → `llm`

同时为每个踩坑添加 `description`、`root_cause` 字段（如果缺失）。

- [ ] **Step 2: 更新 pitfall.ts**

```typescript
// lib/pitfall.ts - 更新导入和类型

import fs from "node:fs";
import path from "node:path";
import type { ContentCategory, Pitfall } from "./content-types";

// ============ 模块级缓存 ============

let cachedPitfalls: Pitfall[] | null = null;

// ============ 辅助函数 ============

/**
 * 自动生成踩坑 slug
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

// ============ 数据读取 ============

export function getAllPitfalls(): Pitfall[] {
  if (cachedPitfalls) return cachedPitfalls;

  const dataPath = path.join(process.cwd(), "content", "pitfall", "pitfalls.json");

  if (!fs.existsSync(dataPath)) {
    cachedPitfalls = [];
    return cachedPitfalls;
  }

  const raw = fs.readFileSync(dataPath, "utf8");
  const jsonData = JSON.parse(raw);

  // 转换踩坑数据，确保符合 Pitfall 类型
  cachedPitfalls = jsonData.map((item: any) => ({
    title: item.title,
    slug: item.slug || generateSlug(item.title),
    category: item.category as ContentCategory,
    description: item.description || '',
    root_cause: item.root_cause || '',
    symptoms: item.symptoms || [],
    solution: item.solution || [],
    quickFix: item.quickFix || '',
    tags: item.tags || [],
    prevention: item.prevention || [],
    relatedIntel: item.relatedIntel || [],
    relatedNodes: item.relatedNodes || [],
    relatedTerms: item.relatedTerms || [],
    relatedTools: item.relatedTools || [],
  }));

  return cachedPitfalls;
}

/**
 * 根据 slug 获取踩坑详情
 */
export function getPitfallBySlug(slug: string): Pitfall | undefined {
  return getAllPitfalls().find((p) => p.slug === slug);
}
```

- [ ] **Step 3: 验证构建成功**

运行: `npm run build`
预期: 构建成功，无 TypeScript 错误

- [ ] **Step 4: 提交代码**

```bash
git add content/pitfall/pitfalls.json lib/pitfall.ts
git commit -m "feat: 更新踩坑数据结构，添加 description、root_cause 和 slug 字段"
```

---

## Task 6: 更新情报数据结构

**Files:**
- Modify: `lib/intel.ts`
- Modify: `content/intel/*.md` (42 个文件)

**Interfaces:**
- Consumes: `IntelCard` (from Task 1)
- Produces: `getAllIntelCards()` 返回符合新类型的卡片数组

- [ ] **Step 1: 更新 intel.ts 添加新字段解析**

```typescript
// lib/intel.ts - 更新导入和类型

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ContentCategory, IntelCard } from "./content-types";

// ============ 模块级缓存 ============

let cachedCards: IntelCard[] | null = null;

// ============ 数据读取 ============

/**
 * 遍历 content/intel/ 目录，解析所有 .md 文件
 */
export function getAllIntelCards(): IntelCard[] {
  if (cachedCards) return cachedCards;

  const contentDir = path.join(process.cwd(), "content", "intel");

  if (!fs.existsSync(contentDir)) {
    cachedCards = [];
    return cachedCards;
  }

  const files = fs
    .readdirSync(contentDir)
    .filter((file) => file.endsWith(".md"))
    .sort();

  cachedCards = files.map((file) => parseIntelCard(file, contentDir));
  return cachedCards;
}

/**
 * 解析单个 Markdown 文件
 */
function parseIntelCard(file: string, contentDir: string): IntelCard {
  const filePath = path.join(contentDir, file);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const slug = file.replace(/\.md$/, "");

  // 计算阅读时间（按中文 300 字/分钟）
  const charCount = content.replace(/\s/g, "").length;
  const readingTime = Math.max(1, Math.ceil(charCount / 300));

  // 自动生成标签
  const tags = generateTags(data, slug);

  return {
    slug,
    title: String(data.title ?? slug),
    category: (data.category || 'deep-learning') as ContentCategory,
    keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
    difficulty: (data.difficulty ?? "intermediate") as IntelCard["difficulty"],
    duration: String(data.duration ?? ""),
    summary: String(data.summary ?? ""),
    takeaways: Array.isArray(data.takeaways) ? data.takeaways.map(String) : undefined,
    content,
    tags,
    readingTime,
    // 新增字段
    prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites.map(String) : [],
    relatedTerms: Array.isArray(data.relatedTerms) ? data.relatedTerms.map(String) : [],
    relatedNodes: Array.isArray(data.relatedNodes) ? data.relatedNodes.map(String) : [],
  };
}

/**
 * 根据内容自动生成标签
 */
function generateTags(data: any, slug: string): string[] {
  const tags: string[] = [];

  const category = String(data.category || "").toLowerCase();
  if (category.includes("cv") || category.includes("vision") || category.includes("检测")) {
    tags.push("cv");
  }
  if (category.includes("nlp") || category.includes("language") || category.includes("llm")) {
    tags.push("nlp");
  }
  if (category.includes("devops") || category.includes("deploy") || category.includes("工程")) {
    tags.push("devops");
  }
  if (category.includes("math") || category.includes("数学")) {
    tags.push("math");
  }
  if (category.includes("mlops") || category.includes("experiment")) {
    tags.push("mlops");
  }

  const keywords = (data.keywords || []).map((k: string) => String(k).toLowerCase());
  if (keywords.some((k: string) => ["yolo", "cnn", "resnet", "目标检测", "图像"].includes(k))) {
    if (!tags.includes("cv")) tags.push("cv");
  }
  if (keywords.some((k: string) => ["transformer", "bert", "gpt", "llm", "nlp", "rag"].includes(k))) {
    if (!tags.includes("nlp")) tags.push("nlp");
  }
  if (keywords.some((k: string) => ["docker", "git", "linux", "部署", "ci/cd"].includes(k))) {
    if (!tags.includes("devops")) tags.push("devops");
  }
  if (keywords.some((k: string) => ["lora", "qlora", "微调", "finetune"].includes(k))) {
    tags.push("llm");
  }

  const difficulty = String(data.difficulty || "intermediate");
  if (difficulty === "beginner") tags.push("beginner");
  else if (difficulty === "advanced") tags.push("advanced");
  else tags.push("intermediate");

  const content = String(data.summary || "").toLowerCase();
  if (content.includes("论文") || content.includes("paper")) {
    tags.push("paper");
  }
  if (content.includes("实战") || content.includes("实践") || content.includes("动手")) {
    tags.push("practice");
  }
  if (content.includes("原理") || content.includes("理论") || content.includes("数学")) {
    tags.push("theory");
  }

  return Array.from(new Set(tags));
}

/**
 * 获取单条情报卡（by slug）
 */
export function getIntelCardBySlug(slug: string): IntelCard | null {
  const cards = getAllIntelCards();
  return cards.find((card) => card.slug === slug) ?? null;
}

/**
 * 仅返回搜索所需的轻量级字段
 */
export interface IntelSearchIndex {
  slug: string;
  title: string;
  category: string;
  keywords: string[];
  summary: string;
}

export function getIntelSearchIndex(): IntelSearchIndex[] {
  return getAllIntelCards().map((card) => ({
    slug: card.slug,
    title: card.title,
    category: card.category,
    keywords: card.keywords,
    summary: card.summary,
  }));
}
```

- [ ] **Step 2: 批量更新情报 frontmatter（可选）**

为 42 个情报 MD 文件添加新字段（如果缺失）：

```bash
# 示例：为每个文件添加 relatedNodes 字段（在 frontmatter 中）
# 这一步可以后续逐步完成，不影响核心功能
```

- [ ] **Step 3: 验证构建成功**

运行: `npm run build`
预期: 构建成功，无 TypeScript 错误

- [ ] **Step 4: 提交代码**

```bash
git add lib/intel.ts content/intel/*.md
git commit -m "feat: 更新情报数据结构，添加 prerequisites、relatedTerms、relatedNodes 字段"
```

---

## Task 7: 创建构建时验证脚本

**Files:**
- Create: `scripts/validate-content.ts`

**Interfaces:**
- Consumes: `getAllIntelCards()`, `getAllTerms()`, `getToolboxData()`, `getAllPitfalls()`, `validateIntel()`, `validateTerm()`, `validateTool()`, `validatePitfall()`
- Produces: 控制台输出验证结果

- [ ] **Step 1: 创建 validate-content.ts**

```typescript
// scripts/validate-content.ts

import { getAllIntelCards } from '../lib/intel';
import { getAllTerms } from '../lib/glossary';
import { getToolboxData } from '../lib/toolbox';
import { getAllPitfalls } from '../lib/pitfall';
import { validateIntel, validateTerm, validateTool, validatePitfall } from '../lib/content-validator';

async function validateAll() {
  console.log('🔍 开始验证所有内容...\n');

  let totalErrors = 0;

  // 验证情报
  console.log('📰 情报验证:');
  const intel = getAllIntelCards();
  console.log(`   数量: ${intel.length}`);
  intel.forEach(item => {
    const errors = validateIntel(item);
    if (errors.length > 0) {
      console.error(`   ❌ ${item.slug}:`, errors);
      totalErrors += errors.length;
    }
  });
  if (intel.every(item => validateIntel(item).length === 0)) {
    console.log('   ✅ 所有情报验证通过\n');
  }

  // 验证术语
  console.log('📚 术语验证:');
  const terms = getAllTerms();
  console.log(`   数量: ${terms.length}`);
  terms.forEach(item => {
    const errors = validateTerm(item);
    if (errors.length > 0) {
      console.error(`   ❌ ${item.slug}:`, errors);
      totalErrors += errors.length;
    }
  });
  if (terms.every(item => validateTerm(item).length === 0)) {
    console.log('   ✅ 所有术语验证通过\n');
  }

  // 验证工具
  console.log('🛠️  工具验证:');
  const { tools } = getToolboxData();
  console.log(`   数量: ${tools.length}`);
  tools.forEach(item => {
    const errors = validateTool(item);
    if (errors.length > 0) {
      console.error(`   ❌ ${item.name}:`, errors);
      totalErrors += errors.length;
    }
  });
  if (tools.every(item => validateTool(item).length === 0)) {
    console.log('   ✅ 所有工具验证通过\n');
  }

  // 验证踩坑
  console.log('⚠️  踩坑验证:');
  const pitfalls = getAllPitfalls();
  console.log(`   数量: ${pitfalls.length}`);
  pitfalls.forEach(item => {
    const errors = validatePitfall(item);
    if (errors.length > 0) {
      console.error(`   ❌ ${item.title}:`, errors);
      totalErrors += errors.length;
    }
  });
  if (pitfalls.every(item => validatePitfall(item).length === 0)) {
    console.log('   ✅ 所有踩坑验证通过\n');
  }

  // 总结
  console.log('📊 验证总结:');
  console.log(`   情报: ${intel.length} 条`);
  console.log(`   术语: ${terms.length} 条`);
  console.log(`   工具: ${tools.length} 个`);
  console.log(`   踩坑: ${pitfalls.length} 条`);

  if (totalErrors === 0) {
    console.log('\n✅ 所有内容验证通过！');
  } else {
    console.log(`\n❌ 发现 ${totalErrors} 个错误`);
    process.exit(1);
  }
}

validateAll().catch(console.error);
```

- [ ] **Step 2: 在 package.json 中添加验证脚本**

```json
{
  "scripts": {
    "validate-content": "npx tsx scripts/validate-content.ts"
  }
}
```

- [ ] **Step 3: 运行验证脚本**

运行: `npm run validate-content`
预期: 显示所有内容验证结果，无错误

- [ ] **Step 4: 提交代码**

```bash
git add scripts/validate-content.ts package.json
git commit -m "feat: 添加构建时内容验证脚本"
```

---

## Task 8: 最终验证和文档更新

**Files:**
- Modify: `docs/content-spec.md` (更新内容规范)
- Modify: `CLAUDE.md` (更新项目记忆)

**Interfaces:**
- Consumes: 所有前面任务的输出
- Produces: 更新后的文档

- [ ] **Step 1: 运行完整构建验证**

运行: `npm run build && npm run validate-content`
预期: 构建成功，所有验证通过

- [ ] **Step 2: 更新内容规范文档**

更新 `docs/content-spec.md`，添加统一分类枚举说明和各模块的字段规范。

- [ ] **Step 3: 更新项目记忆**

更新 `CLAUDE.md`，添加内容格式统一的说明。

- [ ] **Step 4: 最终提交**

```bash
git add docs/content-spec.md CLAUDE.md
git commit -m "docs: 更新内容规范和项目记忆文档"
```

---

## 成功标准

- [ ] 所有模块内部格式统一
- [ ] 所有必填字段完整
- [ ] 分类体系统一（使用 ContentCategory 枚举）
- [ ] 类型检查通过（`npm run build`）
- [ ] 所有验证通过（`npm run validate-content`）
- [ ] 页面功能正常
- [ ] 文档更新完成

---

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 数据迁移导致页面功能异常 | 高 | 分模块迁移，每步测试 |
| 类型定义变更导致编译错误 | 中 | 逐步更新，保持向后兼容 |
| 术语 MD 文件缺失 | 低 | 提供空内容默认值 |
| category 映射错误 | 中 | 建立映射表，逐个验证 |
