// lib/constants.ts - 共享常量

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
