/**
 * 技术情报卡片的公共元数据
 * 统一管理分类和难度的显示信息，避免在多个页面重复定义
 */

export const difficultyMeta: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  beginner: {
    label: "入门",
    color: "text-green-400 bg-green-400/10 border-green-400/30",
    icon: "◆",
  },
  intermediate: {
    label: "中级",
    color: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    icon: "◆◆",
  },
  advanced: {
    label: "高级",
    color: "text-red-400 bg-red-400/10 border-red-400/30",
    icon: "◆◆◆",
  },
};

export const categoryMeta: Record<
  string,
  { label: string; color: string; desc: string }
> = {
  "deep-learning": {
    label: "深度学习",
    color: "bg-cyan-400/10 text-cyan-400 border-cyan-400/30",
    desc: "神经网络基础架构、训练方法与经典模型",
  },
  llm: {
    label: "大模型",
    color: "bg-purple-400/10 text-purple-400 border-purple-400/30",
    desc: "Transformer、LoRA、RAG、RLHF 等 LLM 相关技术",
  },
  "llm-fundamentals": {
    label: "LLM 基础",
    color: "bg-violet-400/10 text-violet-400 border-violet-400/30",
    desc: "大语言模型核心原理、架构与训练方法",
  },
  "llm-application": {
    label: "LLM 应用",
    color: "bg-fuchsia-400/10 text-fuchsia-400 border-fuchsia-400/30",
    desc: "Prompt Engineering、RAG、Agent 等 LLM 应用技术",
  },
  "computer-vision": {
    label: "计算机视觉",
    color: "bg-blue-400/10 text-blue-400 border-blue-400/30",
    desc: "目标检测、图像分类、分割等视觉任务",
  },
  devops: {
    label: "工程部署",
    color: "bg-amber-400/10 text-amber-400 border-amber-400/30",
    desc: "Docker、GPU 部署、环境配置、服务器管理",
  },
  infrastructure: {
    label: "基础设施",
    color: "bg-sky-400/10 text-sky-400 border-sky-400/30",
    desc: "vLLM、Kubernetes、监控系统等基础架构",
  },
  tools: {
    label: "工具库",
    color: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
    desc: "PyTorch、Streamlit 等实用框架与工具",
  },
  "data-engineering": {
    label: "数据工程",
    color: "bg-orange-400/10 text-orange-400 border-orange-400/30",
    desc: "NumPy、Pandas、HuggingFace Datasets 等数据处理工具",
  },
  deployment: {
    label: "模型部署",
    color: "bg-pink-400/10 text-pink-400 border-pink-400/30",
    desc: "ONNX、TensorRT 等模型导出与推理优化",
  },
  training: {
    label: "模型训练",
    color: "bg-rose-400/10 text-rose-400 border-rose-400/30",
    desc: "分布式训练、MLOps、训练优化等",
  },
  evaluation: {
    label: "模型评估",
    color: "bg-teal-400/10 text-teal-400 border-teal-400/30",
    desc: "mAP、IoU、AUC 等评估指标详解与实战",
  },
  "math-foundations": {
    label: "数学基础",
    color: "bg-indigo-400/10 text-indigo-400 border-indigo-400/30",
    desc: "信息论、凸优化等数学理论基础",
  },
  uncategorized: {
    label: "其他",
    color: "bg-neutral-400/10 text-neutral-400 border-neutral-500/30",
    desc: "其他技术主题",
  },
};
