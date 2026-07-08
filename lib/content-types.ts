/**
 * 统一内容类型定义
 *
 * 定义所有内容模块（情报、术语、工具、踩坑）共享的类型。
 * 保持向后兼容：现有页面功能不能因格式变更而中断。
 */

// 统一的内容分类枚举（12 个大类）
export type ContentCategory =
  | "deep-learning" // 深度学习
  | "machine-learning" // 机器学习
  | "llm" // 大语言模型
  | "computer-vision" // 计算机视觉
  | "nlp" // 自然语言处理
  | "math" // 数学基础
  | "devops" // 工程部署
  | "embedded" // 嵌入式与硬件
  | "data-processing" // 数据处理
  | "cs" // 计算机基础
  | "speech" // 语音处理
  | "best-practices" // 最佳实践
  | "uncategorized"; // 未分类

// 难度级别
export type Difficulty = "beginner" | "intermediate" | "advanced";

/** 资源类型 */
export type ResourceType =
  "video" | "article" | "doc" | "code" | "tool" | "book" | "repo" | "paper";

/** 资源来源平台 */
export type ResourceSource =
  | "bilibili"
  | "youtube"
  | "github"
  | "official"
  | "zhihu"
  | "juejin"
  | "academic"
  | "blog"
  | "other";

// 资源链接（统一兼容 radar 版扩展字段）
export interface ResourceLink {
  title: string;
  url: string;
  type: "paper" | "article" | "course" | "documentation" | "video" | ResourceType;
  required?: boolean;
  source?: ResourceSource;
  duration?: string;
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
    "deep-learning",
    "machine-learning",
    "llm",
    "computer-vision",
    "nlp",
    "math",
    "devops",
    "embedded",
    "data-processing",
    "cs",
    "speech",
    "best-practices",
    "uncategorized",
  ];
  return validCategories.includes(category as ContentCategory);
}

// ============================================================================
// 实战项目类型
// ============================================================================

// 实战项目
export interface PracticeProject {
  slug: string; // URL 友好标识
  title: string; // 项目名称
  category: ContentCategory; // 所属分类
  difficulty: 1 | 2 | 3 | 4 | 5; // 难度等级 (1-5)
  duration: string; // 预计时长
  summary: string; // 项目简介

  // 前置要求
  prerequisites: string[]; // 前置知识
  relatedNodes?: string[]; // 关联路线图节点

  // 项目内容
  objectives: string[]; // 学习目标
  projectStructure: ProjectFile[]; // 项目结构
  steps: ProjectStep[]; // 实现步骤

  // 资源
  resources: ResourceLink[]; // 参考资源
  relatedIntel?: string[]; // 关联情报
  relatedTerms?: string[]; // 关联术语
  relatedTools?: string[]; // 关联工具

  // 代码
  templateRepo?: string; // 模板仓库 URL
  solutionRepo?: string; // 参考实现 URL
}

// 项目文件结构
export interface ProjectFile {
  path: string; // 文件路径
  description: string; // 文件说明
  isRequired: boolean; // 是否必需
}

// 项目步骤内容（新格式）
// 已知字段使用明确类型，动态代码块使用 Record 限制为字符串类型
// 代码块在 JSON 中以反引号开头的 key 存储，StepCard 组件通过 startsWith('``') 识别并渲染
export interface StepContent {
  objective?: string; // 步骤目标
  tasks?: string[]; // 具体任务列表
  checkpoint?: string; // 完成标准
  common_errors?: Array<{
    // 常见错误
    error: string;
    solution: string;
  }>;
  /** 动态代码块，key 以反引号开头，value 为代码字符串 */
  codeBlocks?: Record<string, string>;
  [key: string]:
    | string
    | string[]
    | Array<{ error: string; solution: string }>
    | Record<string, string>
    | undefined;
}

// 项目实现步骤
export interface ProjectStep {
  order: number; // 步骤顺序
  title: string; // 步骤标题
  content?: StepContent; // 步骤内容（新格式）
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
  common_errors?: Array<{ error: string; solution: string }>;
}

// ============================================================================
// 学习路线图类型（RoadmapNode 权威定义）
// ============================================================================

// Roadmap 节点状态
export type NodeStatus = "locked" | "available" | "completed";

/** 结构化任务内容 */
export interface TaskContent {
  /** 核心学习目标：1段话，80-120字（新格式） */
  objective?: string;
  /** 核心知识点/概念：4-6个要点（新格式，替代api_checklist） */
  key_points?: string[];
  /** 动手练习：1段话，60-100字（新格式） */
  practice?: string;
  /** 深入拓展知识点介绍：1段，50-80字（新格式，替代answer） */
  deep_dive?: string;
  /** 核心API清单（旧格式，已废弃，用key_points替代） */
  api_checklist?: string[];
  /** 参考答案/拓展内容（旧格式，已废弃，用deep_dive替代） */
  answer?: string;
}

export interface DailyTask {
  day: number;
  title: string;
  /** 任务摘要：1-2句话概括当天学习内容（30-50字） */
  summary?: string;
  /** 内容：支持结构化对象、字符串或数组形式 */
  content: TaskContent | string | string[];
  duration: string;
  resources?: ResourceLink[];
  checkpoint: string;
  completed?: boolean;
}

/** 技术方向 */
export type TrackId =
  | "cv"
  | "nlp"
  | "llm"
  | "devops"
  | "math"
  | "project"
  | "cs"
  | "embedded"
  | "electronics"
  | "signals"
  | "control"
  | "electrical";

export interface Track {
  id: TrackId;
  name: string;
  color: string;
  borderColor: string;
  description: string;
}

export const ROADMAP_TRACKS: Track[] = [
  {
    id: "cs",
    name: "计算机基础",
    color: "text-blue-500",
    borderColor: "border-blue-500",
    description: "算法、数据结构、操作系统、计算机网络等基础课程",
  },
  {
    id: "embedded",
    name: "嵌入式开发",
    color: "text-green-500",
    borderColor: "border-green-500",
    description: "C语言、RTOS、驱动开发、裸机编程等嵌入式技术",
  },
  {
    id: "electronics",
    name: "电子电路",
    color: "text-yellow-500",
    borderColor: "border-yellow-500",
    description: "电路基础、信号系统、DSP、FPGA 等电子技术",
  },
  {
    id: "signals",
    name: "通信信号",
    color: "text-red-500",
    borderColor: "border-red-500",
    description: "通信原理、无线通信、网络协议等通信技术",
  },
  {
    id: "control",
    name: "自动化控制",
    color: "text-purple-500",
    borderColor: "border-purple-500",
    description: "PID控制、现代控制理论、ROS、工业物联网等",
  },
  {
    id: "electrical",
    name: "电气工程",
    color: "text-cyan-500",
    borderColor: "border-cyan-500",
    description: "电机控制、电力电子、PLC编程、电力系统等",
  },
  {
    id: "cv",
    name: "计算机视觉",
    color: "text-orange-400",
    borderColor: "border-orange-400",
    description: "从 CNN 到 YOLO / SAM，掌握图像分类、检测、分割全链路",
  },
  {
    id: "nlp",
    name: "自然语言处理",
    color: "text-violet-400",
    borderColor: "border-violet-400",
    description: "从 RNN 到 Transformer，掌握文本分类、序列标注等 NLP 基础",
  },
  {
    id: "llm",
    name: "大语言模型",
    color: "text-fuchsia-400",
    borderColor: "border-fuchsia-400",
    description: "从预训练到 RAG / Agent，掌握 LLM 全栈应用与部署",
  },
  {
    id: "devops",
    name: "工程部署",
    color: "text-sky-400",
    borderColor: "border-sky-400",
    description: "Git / Docker / Linux / 云服务，掌握模型工程化能力",
  },
  {
    id: "math",
    name: "数学基础",
    color: "text-emerald-400",
    borderColor: "border-emerald-400",
    description: "线性代数 + 概率统计 + 数值优化，为模型理论打基础",
  },
  {
    id: "project",
    name: "综合项目",
    color: "text-pink-400",
    borderColor: "border-pink-400",
    description: "竞赛 / 开源贡献 / 毕设项目，打通全流程",
  },
];

/** 学习建议 */
export interface LearningSuggestion {
  prerequisites: string[];
  nextSteps: string[];
  learningPath: string[];
}

/** 路线图节点（权威定义在 lib/content-types.ts） */
export interface RoadmapNode {
  id: string;
  name: string;
  track: TrackId;
  duration: string;
  prerequisites: string[];
  status: NodeStatus;
  difficulty?: Difficulty;
  position?: { x: number; y: number };
  description?: string;
  outcomes?: string[];
  dailyTasks?: DailyTask[];
  relatedIntel?: string[];
  relatedTools?: string[];
  relatedTerms?: string[];
  relatedNodes?: string[];
  suggestions?: LearningSuggestion;
}

export interface RoadmapData {
  nodes: RoadmapNode[];
  edges?: Array<{ source: string; target: string }>;
}
