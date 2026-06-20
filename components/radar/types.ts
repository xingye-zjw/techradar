// TechRadar Component Types

// Roadmap types
export type NodeStatus = "locked" | "available" | "completed";

/** 单日学习任务 */
export interface ResourceLink {
  title: string;
  url: string;
  required: boolean;     // true = 必学，false = 可选
}

export interface DailyTask {
  day: number;
  title: string;
  content: string[];     // 具体学习内容（数组，每项一个小任务）
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
}

export interface RoadmapData {
  nodes: RoadmapNode[];
  edges?: Array<{ source: string; target: string }>;
}
