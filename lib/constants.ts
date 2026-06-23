// lib/constants.ts - 共享常量

// ============ 路线图 Track 颜色定义 ============

export type TrackId = "cv" | "nlp" | "devops" | "math" | "project" | "cs" | "embedded" | "electronics" | "signals" | "control" | "electrical";

export interface TrackColors {
  text: string;           // 文本颜色类 e.g. "text-sky-400"
  bg: string;             // 背景颜色类 e.g. "bg-sky-400/10"
  border: string;         // 边框颜色类 e.g. "border-sky-400/30"
  solid: string;          // 实心背景类 e.g. "bg-sky-400"
  swimlane: string;       // 泳道背景 rgba e.g. "rgba(56, 189, 248, 0.06)"
  swimlaneBorder: string; // 泳道边框 rgba e.g. "rgba(56, 189, 248, 0.15)"
  label: string;          // 显示名称 e.g. "DevOps"
}

export const TRACK_COLORS: Record<TrackId, TrackColors> = {
  cv: {
    text: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/30",
    solid: "bg-orange-400",
    swimlane: "rgba(251, 146, 60, 0.06)",
    swimlaneBorder: "rgba(251, 146, 60, 0.15)",
    label: "CV",
  },
  nlp: {
    text: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/30",
    solid: "bg-violet-400",
    swimlane: "rgba(167, 139, 250, 0.06)",
    swimlaneBorder: "rgba(167, 139, 250, 0.15)",
    label: "NLP",
  },
  devops: {
    text: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/30",
    solid: "bg-sky-400",
    swimlane: "rgba(56, 189, 248, 0.06)",
    swimlaneBorder: "rgba(56, 189, 248, 0.15)",
    label: "DevOps",
  },
  math: {
    text: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    solid: "bg-emerald-400",
    swimlane: "rgba(52, 211, 153, 0.06)",
    swimlaneBorder: "rgba(52, 211, 153, 0.15)",
    label: "数学",
  },
  project: {
    text: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/30",
    solid: "bg-pink-400",
    swimlane: "rgba(244, 114, 182, 0.06)",
    swimlaneBorder: "rgba(244, 114, 182, 0.15)",
    label: "项目",
  },
  cs: {
    text: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    solid: "bg-blue-500",
    swimlane: "rgba(59, 130, 246, 0.06)",
    swimlaneBorder: "rgba(59, 130, 246, 0.15)",
    label: "CS",
  },
  embedded: {
    text: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    solid: "bg-green-500",
    swimlane: "rgba(34, 197, 94, 0.06)",
    swimlaneBorder: "rgba(34, 197, 94, 0.15)",
    label: "嵌入式",
  },
  electronics: {
    text: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    solid: "bg-yellow-500",
    swimlane: "rgba(234, 179, 8, 0.06)",
    swimlaneBorder: "rgba(234, 179, 8, 0.15)",
    label: "电子",
  },
  signals: {
    text: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    solid: "bg-red-500",
    swimlane: "rgba(239, 68, 68, 0.06)",
    swimlaneBorder: "rgba(239, 68, 68, 0.15)",
    label: "通信",
  },
  control: {
    text: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    solid: "bg-purple-500",
    swimlane: "rgba(168, 85, 247, 0.06)",
    swimlaneBorder: "rgba(168, 85, 247, 0.15)",
    label: "控制",
  },
  electrical: {
    text: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    solid: "bg-cyan-500",
    swimlane: "rgba(6, 182, 212, 0.06)",
    swimlaneBorder: "rgba(6, 182, 212, 0.15)",
    label: "电气",
  },
};

// 便捷函数：获取 track 的完整样式字符串
export function getTrackColorClasses(track: TrackId): string {
  const colors = TRACK_COLORS[track];
  return `${colors.text} ${colors.bg} ${colors.border}`;
}

// 便捷函数：获取泳道标签颜色（从边框颜色派生）
export function getSwimlaneLabelColor(track: TrackId): string {
  const border = TRACK_COLORS[track].swimlaneBorder;
  // 将边框颜色的 alpha 从 0.15 改为 0.8 用于标签
  return border.replace(/[\d.]+\)$/, "0.8)");
}

// ============ 情报链接映射 ============

export const INTEL_LINKS: Record<string, string> = {
  "001-transformer": "Transformer 架构详解",
  "002-yolo": "YOLO 目标检测",
  "003-lora-qlora": "LoRA/QLoRA 微调",
  "004-resnet": "ResNet 残差网络",
  "005-rag": "RAG 检索增强生成",
  "006-cnn-basics": "CNN 基础",
  "007-docker": "Docker 容器化",
  "008-git": "Git 版本控制",
  "009-linux": "Linux 系统",
  "010-numpy-pandas": "NumPy/Pandas",
  "011-pytorch": "PyTorch 框架",
  "012-streamlit": "Streamlit",
  "013-huggingface-datasets": "HuggingFace Datasets",
  "014-onnx": "ONNX 部署",
  "015-rlhf": "RLHF 对齐",
  "016-server-setup": "服务器配置",
  "017-metrics": "评估指标",
  "018-mlflow": "MLflow 实验管理",
};

// ============ 工具链接映射 ============

export const TOOL_LINKS: Record<string, string> = {
  "PyTorch": "PyTorch",
  "Ultralytics YOLO": "Ultralytics YOLO",
  "Hugging Face Transformers": "Hugging Face Transformers",
  "LangChain": "LangChain",
  "Docker": "Docker",
  "ONNX Runtime": "ONNX Runtime",
  "Streamlit": "Streamlit",
  "Gradio": "Gradio",
  "MLflow": "MLflow",
};

// ============ 术语分类颜色 ============

export const CATEGORY_COLORS: Record<string, string> = {
  "ai-ml": "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  "engineering": "text-amber-400 bg-amber-400/10 border-amber-400/30",
  "math": "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  "project": "text-pink-400 bg-pink-400/10 border-pink-400/30",
};

// ============ 路线图节点名称映射 ============

export const NODE_NAMES: Record<string, string> = {
  "linux-basic": "Linux 基础",
  "git-github": "Git & GitHub",
  "docker-basic": "Docker",
  "math-linear-algebra": "线性代数",
  "math-probability": "概率与统计",
  "pytorch-core": "PyTorch",
  "cv-cnn": "CNN 经典架构",
  "cv-detection": "目标检测",
  "nlp-rnn": "RNN 循环神经网络",
  "nlp-transformer": "Transformer",
  "llm-finetune": "LLM 微调",
  "project-capstone": "综合项目",
};

// ============ 工具 ID 到名称映射 ============

export const TOOL_IDS: Record<string, string> = {
  "pytorch": "PyTorch",
  "ultralytics-yolo": "Ultralytics YOLO",
  "hugging-face-transformers": "Hugging Face Transformers",
  "langchain": "LangChain",
  "docker": "Docker",
  "onnx-runtime": "ONNX Runtime",
  "streamlit": "Streamlit",
  "gradio": "Gradio",
  "mlflow": "MLflow",
};
