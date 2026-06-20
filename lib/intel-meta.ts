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
  "computer-vision": {
    label: "计算机视觉",
    color: "bg-blue-400/10 text-blue-400 border-blue-400/30",
    desc: "目标检测、图像分类、分割等视觉任务",
  },
  cv: {
    label: "计算机视觉",
    color: "bg-blue-400/10 text-blue-400 border-blue-400/30",
    desc: "目标检测、图像分类、分割等视觉任务",
  },
  devops: {
    label: "工程部署",
    color: "bg-amber-400/10 text-amber-400 border-amber-400/30",
    desc: "Docker、GPU 部署、环境配置、服务器管理",
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
  evaluation: {
    label: "模型评估",
    color: "bg-teal-400/10 text-teal-400 border-teal-400/30",
    desc: "mAP、IoU、AUC 等评估指标详解与实战",
  },
  uncategorized: {
    label: "其他",
    color: "bg-neutral-400/10 text-neutral-400 border-neutral-500/30",
    desc: "其他技术主题",
  },
};
