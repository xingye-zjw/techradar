// lib/constants.ts - 共享常量

// ============ 路线图 Track 颜色定义 ============

import type { TrackId } from "@/lib/content-types";
import { ROADMAP_TRACKS } from "@/lib/content-types";

export type { TrackId };

export interface TrackColors {
  text: string; // 文本颜色类 e.g. "text-sky-400"
  bg: string; // 背景颜色类 e.g. "bg-sky-400/10"
  border: string; // 边框颜色类 e.g. "border-sky-400/30"
  solid: string; // 实心背景类 e.g. "bg-sky-400"
  swimlane: string; // 泳道背景 rgba e.g. "rgba(56, 189, 248, 0.06)"
  swimlaneBorder: string; // 泳道边框 rgba e.g. "rgba(56, 189, 248, 0.15)"
  label: string; // 显示名称 e.g. "DevOps"
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
  llm: {
    text: "text-fuchsia-400",
    bg: "bg-fuchsia-400/10",
    border: "border-fuchsia-400/30",
    solid: "bg-fuchsia-400",
    swimlane: "rgba(232, 121, 249, 0.06)",
    swimlaneBorder: "rgba(232, 121, 249, 0.15)",
    label: "LLM",
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

// Track 显示顺序（从 ROADMAP_TRACKS 派生，保持与权威定义一致）
export const TRACK_ORDER: readonly TrackId[] = ROADMAP_TRACKS.map(
  (t) => t.id,
) as readonly TrackId[];

// Track 显示名称（从 ROADMAP_TRACKS 派生，保持与权威定义一致）
export const TRACK_LABELS: Record<TrackId, string> = Object.fromEntries(
  ROADMAP_TRACKS.map((t) => [t.id, t.name]),
) as Record<TrackId, string>;

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
  "015-cv-tricks": "CV 训练调优技巧",
  "044-rlhf": "RLHF 对齐",
  "016-server-setup": "服务器配置",
  "017-metrics": "评估指标",
  "018-mlflow": "MLflow 实验管理",
  "019-vllm-inference": "vLLM 推理优化",
  "020-prompt-engineering": "提示工程",
  "021-kubernetes": "Kubernetes",
  "022-prometheus-grafana": "Prometheus + Grafana",
  "023-data-pipeline-etl": "数据管道 ETL",
  "024-information-theory": "信息论基础",
  "025-convex-optimization": "凸优化理论",
  "026-onnx-deployment": "ONNX 部署实战",
  "027-rlhf-alignment": "RLHF 对齐详解",
  "028-server-ops": "服务器运维",
  "029-moe-mixture-of-experts": "MoE 混合专家",
  "030-multimodal-llm": "多模态大模型",
  "031-agentic-ai": "Agentic AI",
  "032-model-quantization": "模型量化",
  "033-long-context-rope": "长上下文与 RoPE",
  "034-cuda-programming": "CUDA 编程",
  "035-advanced-rag": "高级 RAG 技术",
  "036-code-generation": "代码生成",
  "037-distributed-training": "分布式训练",
  "038-llm-security": "LLM 安全",
  "039-model-evaluation": "模型评估",
  "040-data-annotation": "数据标注",
  "041-lora-finetuning": "LoRA 微调实战",
  "042-vector-database": "向量数据库",
  "043-mlops-engineering": "MLOps 工程",
  "050-cs-algo": "算法与数据结构",
  "051-cs-os": "操作系统原理",
  "052-embedded-c": "C语言与指针",
  "053-embedded-rtos": "RTOS 实时操作系统",
  "054-elec-circuit": "电路基础与模拟电子",
  "055-elec-signals": "信号与系统",
  "056-signals-comm": "通信原理",
  "057-ctrl-pid": "自动控制原理",
  "058-ctrl-ros": "机器人技术与 ROS2",
  "059-elec-motor": "电机控制与电力电子",
  "060-cv-instance-segmentation": "实例分割",
  "061-cv-pose-estimation": "人体姿态估计",
  "062-cv-ocr": "OCR 文字识别",
  "063-cv-diffusion": "扩散模型与图像生成",
  "064-nlp-rnn": "NLP 基础与 RNN",
  "065-llm-inference-optimization": "LLM 推理优化",
  "066-signals-basics": "信号基础",
  "067-signals-filter-design": "滤波器设计",
  "068-ctrl-state-space": "状态空间分析",
  "069-embedded-arduino": "Arduino 入门",
  "070-elec-components": "电子元器件",
  "071-elec-power-systems": "电力系统基础",
  "072-math-linear-algebra": "线性代数",
  "073-math-probability": "概率与统计",
  "074-math-tensor-ops": "张量运算",
  "075-cs-network": "计算机网络",
  "076-cs-database": "数据库系统",
  "077-embedded-driver": "嵌入式驱动开发",
  "078-embedded-hal": "嵌入式硬件抽象层",
  "079-elec-digital": "数字电子技术",
  "080-elec-pcb": "PCB 设计基础",
  "081-signals-dsp": "DSP 数字信号处理",
  "082-signals-wireless": "无线通信技术",
  "083-ctrl-plc": "PLC 工业控制",
  "084-ctrl-servo": "伺服控制系统",
  "085-electrical-safety": "电气安全与保护",
  "112-rl-basics": "强化学习基础",
  "113-gnn-basics": "图神经网络基础",
  "114-asr-speech-recognition": "语音识别",
  "115-tts-speech-synthesis": "语音合成",
  "116-recommender-systems": "推荐系统",
  "117-time-series": "时间序列分析",
  "118-anomaly-detection": "异常检测",
  "119-knowledge-graph": "知识图谱",
  "120-3d-point-cloud": "3D 点云",
  "121-object-tracking": "目标跟踪",
  "122-federated-learning": "联邦学习",
  "123-automl": "AutoML",
  "045-rag-intro": "RAG 入门",
  "046-agent-intro": "Agent 入门",
  "097-pitfall-embedded": "嵌入式开发踩坑",
  "098-pitfall-hardware": "硬件设计踩坑",
  "107-pitfall-db": "数据库踩坑",
  "108-pitfall-network": "网络踩坑",
  "110-pitfall-control": "控制踩坑",
  "111-pitfall-circuit": "电路踩坑",
  "133-pitfall-algorithm": "算法踩坑",
  "140-pitfall-c-pointer-out-of-bounds": "C 指针越界踩坑",
  "142-pitfall-pid-tuning-oscillation": "PID 调参振荡踩坑",
  "143-pitfall-fft-spectral-leakage": "FFT 频谱泄漏踩坑",
  "144-pitfall-h-bridge-shoot-through": "H 桥直通短路踩坑",

  // ============ S-CONTENT · 3天冲刺 新增 20 条（CV 5 + LLM 4 + Edge 2 + Pitfall 9）============
  // CV 5 篇（163-167）
  "163-sam2-video-segmentation": "SAM 2 视频物体分割与长时序追踪",
  "164-vision-language-models": "Vision-Language Model（VLM）多模态大模型原理与实践",
  "165-medical-image-segmentation": "医学影像分割（nnU-Net / MedSAM 实战）",
  "166-remote-sensing-change-detection": "遥感影像变化检测与建筑/道路提取",
  "167-autonomous-driving-perception": "自动驾驶感知多任务融合（BEV / Occupancy）",
  // LLM 4 篇（168-171）
  "168-local-llm-ollama-deploy": "本地 LLM 私有化部署：Ollama + llama.cpp 全流程",
  "169-long-context-1m-token": "1M 长上下文：YaRN / StreamingLLM / InfLLM 原理对比",
  "170-llm-synthetic-data": "大模型合成数据生成与去污染、防标签泄漏",
  "171-multimodal-rag-video": "多模态 RAG：视频切片 + CLIP 向量 + 文本联合检索",
  // Edge 2 篇（172-173）
  "172-tinyml-mcu-deploy": "TinyML 模型在 MCU 上部署（CMSIS-NN / ONNX Micro）",
  "173-edge-ai-benchmarking": "边缘 AI 基准：MLPerf Tiny / AI-Runner / ONNX Runtime 性能评估",
  // Pitfall 9 篇（174-182）
  "174-pitfall-sam2-mask-drift": "SAM 2 长视频追踪中 Mask 漂移与 ID 切换",
  "175-pitfall-vlm-hallucination-grounding": "VLM 幻觉：文字描述正确但 Grounding 坐标错误",
  "176-pitfall-ollama-context-window": "Ollama 本地部署 Context Window 超限导致回复截断",
  "177-pitfall-synthetic-data-label-leak": "合成数据训练中原始测试集标签泄漏导致虚高分数",
  "178-pitfall-multimodal-rag-image-chunking": "多模态 RAG 图像分块过大导致召回率下降",
  "179-pitfall-tinyml-flash-oversize": "TinyML 模型导出 Flash 超限导致 MCU 无法烧录",
  "180-pitfall-edge-ai-power-throttle": "边缘端温度过高触发 NPU/GPU 节流导致推理时延抖动",
  "181-pitfall-haystack-pipeline-serialization": "Haystack Pipeline 序列化后节点顺序错乱",
  "182-pitfall-lancedb-index-corruption": "LanceDB 断电写入导致 IVF_PQ 索引损坏无法查询",
  "190-pitfall-data-poisoning": "训练数据投毒导致模型行为异常",
  "191-pitfall-prompt-injection-defense": "Prompt 注入防御失效导致系统被越权调用",
  "192-pitfall-tensorRT-fp16-overflow": "TensorRT FP16 精度溢出导致推理结果全 NaN",
  "193-pitfall-hallucination-grounding": "LLM 幻觉严重且缺乏事实 Grounding",
  "194-pitfall-data-leakage": "特征工程数据泄露导致测试指标虚高",
  "195-pitfall-class-imbalance": "训练数据类别不均衡导致模型偏向多数类",
  "196-pitfall-i2c-lockup": "I2C 总线死锁导致从设备无响应",
  "197-pitfall-battery-life": "嵌入式设备电池寿命短于预期 50%",
  "198-pitfall-gpio-noise": "GPIO 输入噪声导致按键误触发/计数错误",

  "090-pitfall-dl-training": "深度学习训练常见踩坑合集",
  "091-pitfall-gpu-cuda": "GPU 与 CUDA 环境踩坑合集",
  "092-pitfall-python": "Python 开发常见踩坑合集",
  "093-pitfall-docker": "Docker 容器化踩坑合集",
  "094-pitfall-data-engineering": "数据工程踩坑合集",
  "095-pitfall-llm-app": "LLM 应用开发踩坑合集",
  "096-pitfall-rag": "RAG 系统踩坑合集",
  "099-pitfall-ops": "运维与服务器踩坑合集",
  "100-pitfall-cv": "计算机视觉踩坑合集",
  "101-pitfall-nlp": "NLP 踩坑合集",
  "102-pitfall-metrics": "模型评估指标踩坑合集",
  "103-pitfall-deployment": "模型部署踩坑合集",
  "104-pitfall-security": "AI 安全踩坑合集",
  "105-pitfall-git": "Git 版本控制踩坑合集",
  "106-pitfall-k8s": "Kubernetes 踩坑合集",
  "109-pitfall-rtos": "RTOS 实时操作系统踩坑合集",
  "124-pitfall-rl": "强化学习踩坑合集",
  "125-pitfall-gnn": "图神经网络踩坑合集",
  "126-pitfall-recsys": "推荐系统踩坑合集",
  "127-pitfall-speech": "语音处理踩坑合集",
  "128-pitfall-time-series": "时间序列踩坑合集",
  "129-pitfall-3d-cv": "3D 视觉踩坑合集",
  "130-pitfall-automl": "AutoML 踩坑合集",
  "131-pitfall-microservice": "微服务架构踩坑合集",
  "132-pitfall-frontend": "前端开发踩坑合集",
  "134-pitfall-project-mgmt": "项目管理踩坑合集",
  "135-pitfall-interview": "技术面试踩坑合集",
  "141-pitfall-rtos-task-stack-overflow": "RTOS任务栈溢出",
  "145-pitfall-cuda-pytorch-version-mismatch": "CUDA 版本与 PyTorch 不匹配",
  "146-pitfall-cuda-out-of-memory": "显存不足 (CUDA out of memory)",
  "147-pitfall-loss-nan-gradient-explosion": "Loss NaN / 梯度爆炸",
  "148-pitfall-onnx-export-dynamic-shape": "ONNX 导出失败 / 动态 shape",
  "149-pitfall-multiprocess-dataloader-hang": "多进程 DataLoader (num_workers > 0) 卡死",
  "150-pitfall-rag-retrieval-hallucination": "RAG 检索到了但回答不对 / 幻觉严重",
  "151-pitfall-ssh-connection-drop": "SSH 连接远程服务器频繁掉线",
  "152-pitfall-docker-gpu-not-available": "Docker 容器中无法使用 GPU (nvidia-smi 报错)",
  "153-pitfall-slow-convergence": "模型训练收敛慢 / 几乎不收敛",
  "154-pitfall-git-merge-conflict-code-loss": "Git 合并冲突处理不当导致代码丢失",
  "155-pitfall-python-dependency-conflict": "Python 环境依赖冲突导致 import 失败",
  "156-pitfall-ssh-firewall-blocked": "SSH 端口被防火墙拦截 / 服务器无法访问",
  "157-pitfall-poor-data-labeling": "数据标注质量差导致模型无法收敛",
  "158-pitfall-cuda-implicit-sync-slow-inference": "CUDA 隐式同步导致推理速度异常慢",
  "159-pitfall-docker-timezone-mismatch": "Docker 容器时间与宿主机不一致",
  "160-pitfall-pandas-chained-assignment-warning": "pandas inplace=True 链式赋值警告",
  "161-pitfall-gpu-architecture-mismatch": "训练用 GPU 卡与推理用卡架构不一致",
  "162-pitfall-llm-prompt-escape-json-truncation": "大模型 Prompt 转义字符错误导致 JSON 输出截断",
  "183-gitops-argo-cd": "GitOps 与 Argo CD 云原生持续部署",
  "184-agent-tracing-eval": "Agent 评估追踪与可观测性实战",
  "185-probability-distributions": "概率论与常见分布机器学习实战",
  "186-linear-algebra-ml": "线性代数与机器学习核心运算",
  "187-llm-eval-ragas": "LLM 评估框架 Ragas 与 Promptfoo 实战",
  "188-reranker-multilingual": "多语种 Reranker 与 BGE-Reranker/Cohere 实战",
  "189-speech-asr-tts": "Whisper + Coqui TTS 语音端到端实践",
};

// ============ 术语分类颜色 ============
// 键值严格与 content-types.ts 中的 ContentCategory 联合类型保持一致（共 13 类）
// 采用「Tailwind 前景色 / 淡色背景 / 边框色」三元组，语义色与领域对齐

export const CATEGORY_COLORS: Record<string, string> = {
  "deep-learning": "text-sky-400 bg-sky-400/10 border-sky-400/30", // 蓝 — 深度学习 / 基础模型
  "machine-learning": "text-cyan-400 bg-cyan-400/10 border-cyan-400/30", // 青 — 机器学习 / 经典算法
  llm: "text-violet-400 bg-violet-400/10 border-violet-400/30", // 紫 — 大语言模型 / Agent / RAG
  "computer-vision": "text-rose-400 bg-rose-400/10 border-rose-400/30", // 玫红 — CV / 图像 / 视频
  nlp: "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/30", // 品红 — NLP / 文本 / 语义
  math: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", // 绿 — 数学 / 统计 / 代数
  devops: "text-orange-400 bg-orange-400/10 border-orange-400/30", // 橙 — 运维 / 部署 / MLOps
  embedded: "text-amber-400 bg-amber-400/10 border-amber-400/30", // 琥珀 — 嵌入式 / 硬件 / 驱动
  "data-processing": "text-teal-400 bg-teal-400/10 border-teal-400/30", // 青绿 — 数据处理 / ETL / 流水线
  cs: "text-slate-300 bg-slate-500/20 border-slate-400/40", // 石板灰 — 计算机基础 / OS / 网络
  speech: "text-pink-400 bg-pink-400/10 border-pink-400/30", // 粉 — 语音 / ASR / TTS
  "best-practices": "text-lime-400 bg-lime-400/10 border-lime-400/30", // 柠绿 — 最佳实践 / 方法论
  uncategorized: "text-neutral-400 bg-neutral-800 border-neutral-700", // 中性灰 — 兜底 / 未分类
};

// ============ 路线图节点名称映射 ============

export const NODE_NAMES: Record<string, string> = {
  // DevOps
  "linux-basic": "Linux 系统基础",
  "git-github": "Git & GitHub 协作",
  "docker-basic": "Docker 容器化",
  "devops-cicd": "CI/CD 与自动化部署",
  "devops-docker-api": "模型服务 Docker 化部署",
  "devops-kubernetes": "Kubernetes 容器编排",
  "devops-monitoring": "监控体系：Prometheus + Grafana",
  "devops-mlops": "MLOps 与模型运维",
  // Math
  "math-linear-algebra": "线性代数",
  "math-probability": "概率与统计",
  "math-tensor-ops": "PyTorch 张量运算",
  "math-information-theory": "信息论基础",
  "math-optimization": "凸优化理论基础",
  // CS
  "cs-algo": "算法与数据结构",
  "cs-os": "操作系统原理",
  "cs-network": "计算机网络",
  "cs-database": "数据库系统",
  // Embedded
  "embedded-c": "C语言与指针",
  "embedded-rtos": "RTOS 实时操作系统",
  "embedded-driver": "嵌入式驱动开发",
  "embedded-hal": "嵌入式硬件抽象层",
  // Electronics
  "elec-circuit": "电路基础与模拟电子",
  "elec-signals": "信号与系统",
  "elec-digital": "数字电子技术",
  "elec-pcb": "PCB 设计基础",
  "elec-fpga": "FPGA 与数字系统设计",
  // Signals
  "signals-basics": "信号与系统基础",
  "signals-comm": "通信原理",
  "signals-dsp": "DSP 数字信号处理",
  "signals-wireless": "无线通信技术",
  "signals-antenna": "天线原理与设计",
  // Control
  "ctrl-pid": "自动控制原理",
  "ctrl-ros": "机器人技术与 ROS2",
  "ctrl-plc": "PLC 工业控制",
  "ctrl-servo": "伺服控制系统",
  // Electrical
  "elec-motor": "电机控制与电力电子",
  "electrical-power-electronics": "电力电子技术",
  "electrical-power": "电力系统基础",
  "electrical-safety": "电气安全与保护",
  "electrical-relay": "继电保护与电力系统自动化",
  // CV
  "pytorch-core": "PyTorch 框架",
  "cv-cnn": "CNN 经典架构",
  "cv-detection": "目标检测",
  "cv-instance-segmentation": "YOLOv8-seg 实例分割实战",
  "cv-pose-estimation": "人体姿态估计",
  "cv-ocr": "OCR 文字识别",
  "cv-diffusion": "扩散模型与图像生成",
  // NLP
  "nlp-rnn": "NLP 基础与 RNN",
  "nlp-word-embeddings": "词向量与语义表示",
  "nlp-sentiment-analysis": "情感分析与文本分类",
  "nlp-sequence-labeling": "序列标注与信息抽取",
  "nlp-transformer": "Transformer 与预训练模型",
  "nlp-machine-translation": "机器翻译与文本生成",
  // LLM
  "llm-fundamentals": "LLM 基础原理",
  "llm-pretraining": "预训练与数据工程",
  "llm-finetune": "LLM 微调与对齐",
  "llm-rag": "RAG 检索增强生成",
  "llm-local-rag": "本地知识库 RAG 系统",
  "llm-inference": "LLM 推理加速与部署",
  "llm-prompt-engineering": "提示工程与 Agent 设计",
  "llm-agent": "Agent 与工具调用",
  "llm-evaluation": "LLM 评估与安全",
  // Project
  "project-cv-classification": "图像分类与模型部署",
  "project-rag-app": "RAG 知识库问答系统",
  "project-llm-agent": "LLM Agent 智能助手",
  "project-data-pipeline": "数据管道与 ETL",
  "project-iot-fastapi": "ESP32 传感器数据链路",
  "project-capstone": "综合实战项目",
};

// ============ 工具 ID 到名称映射 ============

export const TOOL_IDS: Record<string, string> = {
  airflow: "Apache Airflow",
  "altium-designer": "Altium Designer",
  "autocad-electrical": "AutoCAD Electrical",
  chromadb: "ChromaDB",
  codesys: "Codesys",
  dask: "Dask",
  docker: "Docker",
  dvc: "DVC (Data Version Control)",
  "esp-idf": "ESP-IDF",
  faiss: "FAISS",
  fastapi: "FastAPI",
  freertos: "FreeRTOS",
  gcc: "GCC",
  git: "Git",
  gradio: "Gradio",
  grafana: "Grafana",
  "huggingface-transformers": "Hugging Face Transformers",
  jupyter: "Jupyter Notebook",
  kicad: "KiCad",
  kubeflow: "Kubeflow",
  kubernetes: "Kubernetes",
  "label-studio": "Label Studio",
  langchain: "LangChain",
  lightgbm: "LightGBM",
  ltspice: "LTspice",
  matlab: "MATLAB",
  matplotlib: "Matplotlib",
  mlflow: "MLflow",
  mysql: "MySQL",
  numpy: "NumPy",
  "onnx-runtime": "ONNX Runtime",
  opencv: "OpenCV",
  pandas: "pandas",
  pgvector: "pgvector + PostgreSQL",
  plotly: "Plotly",
  polars: "Polars",
  postman: "Postman",
  prometheus: "Prometheus",
  pytorch: "PyTorch",
  "pytorch-geometric": "PyTorch Geometric",
  "pytorch-lightning": "PyTorch Lightning",
  redis: "Redis",
  ros2: "ROS2",
  "scikit-learn": "scikit-learn",
  "segment-anything": "Segment Anything",
  spacy: "spaCy",
  "stable-baselines3": "Stable Baselines3",
  stm32cubemx: "STM32CubeMX",
  streamlit: "Streamlit",
  tensorflow: "TensorFlow",
  "tia-portal": "TIA Portal",
  "transformers-agent": "Transformers Agent",
  "triton-inference-server": "Triton Inference Server",
  "ultralytics-yolo": "Ultralytics YOLO",
  vllm: "vLLM",
  vscode: "VS Code",
  "weights-and-biases": "Weights & Biases",
  whisper: "Whisper",
  wireshark: "Wireshark",
  xgboost: "XGBoost",

  // ============ S-CONTENT · 3天冲刺 新增 10 工具（LLM Infra / Multimodal / Edge / RAG）============
  ollama: "Ollama（本地 LLM 一键推理服务）",
  lancedb: "LanceDB（基于 Apache Arrow 的嵌入式向量数据库）",
  "comfy-ui": "ComfyUI（Stable Diffusion 节点流工作流编辑器）",
  "lm-studio": "LM Studio（桌面端 GUI 本地 LLM 推理 + OpenAI API 兼容）",
  "onnxruntime-genai": "ONNX Runtime GenAI（生成式 LLM ONNX 高速推理）",
  "semantic-kernel": "Semantic Kernel（微软 C#/Python 企业级 LLM 编排框架）",
  autogen: "AutoGen（多 Agent 协作对话编排框架，微软出品）",
  crewai: "CrewAI（角色扮演型 Multi-Agent 流水线编排）",
  haystack: "Haystack（deepset 出品，生产级 RAG Pipeline 框架）",
  unstructured: "Unstructured（非结构化 PDF/HTML/DOCX 统一提取工具）",
};

// ============ 工具显示名（与 TOOL_IDS 完全等价，保留作为向后兼容的别名）============
// 历史上 TOOL_LINKS 与 TOOL_IDS 内容高度重复，现已合并为单一数据源：
// 新增 / 修改工具名称时仅需更新 TOOL_IDS 即可，TOOL_LINKS 自动同步。
export const TOOL_LINKS: Record<string, string> = TOOL_IDS;
