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
  | 'llm-fundamentals'      // LLM 基础
  | 'llm-application'       // LLM 应用
  | 'reinforcement-learning' // 强化学习
  | 'data-processing'       // 数据处理
  | 'data-engineering'      // 数据工程
  | 'tools'                 // 工具相关
  | 'best-practices'        // 最佳实践
  | 'infrastructure'        // 基础设施
  | 'deployment'            // 模型部署
  | 'training'              // 模型训练
  | 'evaluation'            // 模型评估
  | 'math-foundations'      // 数学基础
  | 'uncategorized';        // 未分类

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

/** 踩坑分类元数据 */
export interface PitfallCategoryMeta {
  label: string;
  icon: string;
  color: string; // Tailwind class e.g. "text-red-400"
  bgColor: string;
  borderColor: string;
  desc: string;
}

export const PITFALL_CATEGORY_META: Record<string, PitfallCategoryMeta> = {
  embedded: {
    label: "嵌入式",
    icon: "🔌",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/30",
    desc: "嵌入式开发中的常见问题",
  },
  control: {
    label: "控制系统",
    icon: "⚙️",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    desc: "控制系统与自动化相关问题",
  },
  signals: {
    label: "信号处理",
    icon: "📡",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/30",
    desc: "信号处理与通信相关问题",
  },
  electrical: {
    label: "电气工程",
    icon: "⚡",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
    desc: "电气工程与硬件相关问题",
  },
  devops: {
    label: "环境配置",
    icon: "🛠️",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/30",
    desc: "开发环境与部署配置问题",
  },
  "deep-learning": {
    label: "深度学习",
    icon: "🧠",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
    desc: "深度学习训练与推理问题",
  },
  llm: {
    label: "大语言模型",
    icon: "💬",
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    borderColor: "border-pink-400/30",
    desc: "LLM 微调与部署相关问题",
  },
  "data-processing": {
    label: "数据处理",
    icon: "📊",
    color: "text-teal-400",
    bgColor: "bg-teal-400/10",
    borderColor: "border-teal-400/30",
    desc: "数据处理与 ETL 相关问题",
  },
  "best-practices": {
    label: "最佳实践",
    icon: "✨",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/30",
    desc: "开发流程与最佳实践",
  },
};

/**
 * 验证 category 是否有效
 * @param category - 要验证的分类字符串
 * @returns 如果是有效的 ContentCategory 则返回 true
 */
export function isValidCategory(category: string): category is ContentCategory {
  const validCategories: ContentCategory[] = [
    'computer-vision', 'nlp', 'deep-learning', 'machine-learning',
    'math', 'devops', 'llm', 'llm-fundamentals', 'llm-application',
    'reinforcement-learning', 'data-processing', 'data-engineering',
    'tools', 'best-practices', 'infrastructure', 'deployment',
    'training', 'evaluation', 'math-foundations', 'uncategorized'
  ];
  return validCategories.includes(category as ContentCategory);
}
