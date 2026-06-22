// TechRadar Component Types

// Roadmap types
export type NodeStatus = "locked" | "available" | "completed";

/** 资源类型 */
export type ResourceType = "video" | "article" | "doc" | "code" | "tool" | "book";

/** 资源来源平台 */
export type ResourceSource = "bilibili" | "youtube" | "github" | "official" | "zhihu" | "juejin" | "other";

/** 单日学习任务 */
export interface ResourceLink {
  title: string;
  url: string;
  required: boolean;     // true = 必学，false = 可选
  type?: ResourceType;   // 资源类型
  source?: ResourceSource; // 来源平台
  duration?: string;     // 视频时长，如 "15:30"
}

/** 结构化任务内容 */
export interface TaskContent {
  /** 核心目标：一两句话概括本节重点 */
  objective: string;
  /** 核心 API / 知识点：必须掌握的具体函数或操作 */
  api_checklist: string[];
  /** 场景实操：一个非常具体的微型任务 */
  practice: string;
  /** 参考答案：可选，用于折叠显示 */
  answer?: string;
}

export interface DailyTask {
  day: number;
  title: string;
  /** 内容：支持结构化对象、字符串或数组形式 */
  content: TaskContent | string | string[];
  duration: string;      // 如 "2小时"
  resources?: ResourceLink[];  // 推荐资源（分必学/可选）
  checkpoint: string;    // 完成标准
  completed?: boolean;   // 当日任务是否已完成
}

/** 技术方向 */
export type TrackId = "cv" | "nlp" | "devops" | "math" | "project";

export interface Track {
  id: TrackId;
  name: string;
  color: string;         // Tailwind 颜色类名
  borderColor: string;
  description: string;
}

export const ROADMAP_TRACKS: Track[] = [
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
    description: "从 RNN 到 Transformer / LLM，掌握文本生成与理解",
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

export interface RoadmapNode {
  id: string;
  name: string;
  track: TrackId;
  duration: string;         // 如 "2-3周"
  prerequisites: string[];  // 前置节点 ID 数组
  status: NodeStatus;
  position?: { x: number; y: number };
  description?: string;
  outcomes?: string[];
  /** 每日学习任务列表（按顺序） */
  dailyTasks?: DailyTask[];
  /** 关联情报 slug 列表 */
  relatedIntel?: string[];
  /** 关联工具 id 列表 */
  relatedTools?: string[];
  /** 关联术语 slug 列表 */
  relatedTerms?: string[];
}

export interface RoadmapData {
  nodes: RoadmapNode[];
  edges?: Array<{ source: string; target: string }>;
}
