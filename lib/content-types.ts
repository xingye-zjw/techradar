/**
 * 统一内容类型定义
 *
 * 定义所有内容模块（情报、术语、工具、踩坑）共享的类型。
 * 保持向后兼容：现有页面功能不能因格式变更而中断。
 */

// 统一的内容分类枚举
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

// 难度级别
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// 资源链接
export interface ResourceLink {
  title: string;
  url: string;
  type: 'paper' | 'article' | 'course' | 'documentation' | 'video';
}

// 情报卡片
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

// 工具使用场景
export interface ToolScenario {
  key: string;
  label: string;
  description: string;
  tool_names: string[];
}

// 工具箱数据
export interface ToolboxData {
  tools: Tool[];
  scenarios: ToolScenario[];
}

// 踩坑避雷
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
 * @param category - 要验证的分类字符串
 * @returns 如果是有效的 ContentCategory 则返回 true
 */
export function isValidCategory(category: string): category is ContentCategory {
  const validCategories: ContentCategory[] = [
    'computer-vision', 'nlp', 'deep-learning', 'machine-learning',
    'math', 'devops', 'llm', 'reinforcement-learning',
    'data-processing', 'tools', 'best-practices'
  ];
  return validCategories.includes(category as ContentCategory);
}
