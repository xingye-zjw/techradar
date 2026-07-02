/**
 * 统一内容类型定义
 *
 * 定义所有内容模块（情报、术语、工具、踩坑）共享的类型。
 * 保持向后兼容：现有页面功能不能因格式变更而中断。
 */

// 统一的内容分类枚举（12 个大类）
export type ContentCategory =
  | 'deep-learning'       // 深度学习
  | 'machine-learning'    // 机器学习
  | 'llm'                 // 大语言模型
  | 'computer-vision'     // 计算机视觉
  | 'nlp'                 // 自然语言处理
  | 'math'                // 数学基础
  | 'devops'              // 工程部署
  | 'embedded'            // 嵌入式与硬件
  | 'data-processing'     // 数据处理
  | 'cs'                  // 计算机基础
  | 'speech'              // 语音处理
  | 'best-practices'      // 最佳实践
  | 'uncategorized'       // 未分类

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
  devops: {
    label: "工程部署",
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
  "computer-vision": {
    label: "计算机视觉",
    icon: "👁️",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    desc: "CV 与图像处理相关问题",
  },
  nlp: {
    label: "自然语言处理",
    icon: "📝",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/30",
    desc: "NLP 与文本处理相关问题",
  },
  embedded: {
    label: "嵌入式与硬件",
    icon: "🔌",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/30",
    desc: "嵌入式、硬件与控制相关问题",
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
  math: {
    label: "数学基础",
    icon: "📐",
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
    borderColor: "border-indigo-400/30",
    desc: "数学与理论相关问题",
  },
  "machine-learning": {
    label: "机器学习",
    icon: "🤖",
    color: "text-violet-400",
    bgColor: "bg-violet-400/10",
    borderColor: "border-violet-400/30",
    desc: "传统机器学习相关问题",
  },
  cs: {
    label: "计算机基础",
    icon: "💻",
    color: "text-slate-400",
    bgColor: "bg-slate-400/10",
    borderColor: "border-slate-400/30",
    desc: "计算机科学基础问题",
  },
  speech: {
    label: "语音处理",
    icon: "🎙️",
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
    borderColor: "border-rose-400/30",
    desc: "语音识别与合成相关问题",
  },
};

/**
 * 验证 category 是否有效
 * @param category - 要验证的分类字符串
 * @returns 如果是有效的 ContentCategory 则返回 true
 */
export function isValidCategory(category: string): category is ContentCategory {
  const validCategories: ContentCategory[] = [
    'deep-learning', 'machine-learning', 'llm', 'computer-vision', 'nlp',
    'math', 'devops', 'embedded', 'data-processing', 'cs', 'speech',
    'best-practices', 'uncategorized'
  ];
  return validCategories.includes(category as ContentCategory);
}

// ============================================================================
// 实战项目类型
// ============================================================================

// 实战项目
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

// 项目文件结构
export interface ProjectFile {
  path: string;                      // 文件路径
  description: string;               // 文件说明
  isRequired: boolean;               // 是否必需
}

// 项目步骤内容（新格式）
// 已知字段使用明确类型，动态代码块使用 Record 限制为字符串类型
// 代码块在 JSON 中以反引号开头的 key 存储，StepCard 组件通过 startsWith('``') 识别并渲染
export interface StepContent {
  objective?: string;           // 步骤目标
  tasks?: string[];              // 具体任务列表
  checkpoint?: string;           // 完成标准
  common_errors?: Array<{        // 常见错误
    error: string;
    solution: string;
  }>;
  /** 动态代码块，key 以反引号开头，value 为代码字符串 */
  codeBlocks?: Record<string, string>;
  [key: string]: string | string[] | Array<{error: string; solution: string}> | Record<string, string> | undefined;
}

// 项目实现步骤
export interface ProjectStep {
  order: number;                     // 步骤顺序
  title: string;                     // 步骤标题
  content?: StepContent;             // 步骤内容（新格式）
  // 旧格式字段（兼容）
  description?: string;
  code?: string;
  hint?: string;
  // 新格式字段
  duration?: string;
  resources?: ResourceLink[];
  relatedTerms?: string[];
  relatedTools?: string[];
  checkpoint?: string;
  common_errors?: Array<{error: string; solution: string}>;
}
