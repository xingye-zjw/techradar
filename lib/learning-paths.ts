export interface LearningPath {
  id: string;
  name: string;
  description: string;
  nodes: string[];          // 节点 ID 列表
  duration: string;         // 总时长
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'cv' | 'nlp' | 'llm' | 'devops' | 'math' | 'cs' | 'embedded' | 'electronics' | 'signals' | 'control' | 'electrical';
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'cv-path',
    name: '计算机视觉路径',
    description: '从零开始学习计算机视觉，掌握 CNN、目标检测、姿态估计、OCR、实例分割和扩散模型等核心技术',
    nodes: ['linux-basic', 'git-github', 'docker-basic', 'math-linear-algebra', 'math-probability', 'pytorch-core', 'cv-cnn', 'cv-detection', 'cv-pose-estimation', 'cv-ocr', 'cv-instance-segmentation', 'cv-diffusion'],
    duration: '20 周',
    difficulty: 'intermediate',
    category: 'cv',
  },
  {
    id: 'nlp-path',
    name: '自然语言处理路径',
    description: '从零开始学习自然语言处理，掌握词向量、序列模型、Transformer、机器翻译等核心技术',
    nodes: ['linux-basic', 'git-github', 'docker-basic', 'math-linear-algebra', 'math-probability', 'pytorch-core', 'nlp-rnn', 'nlp-word-embeddings', 'nlp-sentiment-analysis', 'nlp-sequence-labeling', 'nlp-transformer', 'nlp-machine-translation'],
    duration: '22 周',
    difficulty: 'intermediate',
    category: 'nlp',
  },
  {
    id: 'devops-path',
    name: 'DevOps 路径',
    description: '从零开始学习 DevOps，掌握 Docker、Kubernetes、CI/CD、监控告警和 MLOps 等核心技能',
    nodes: ['linux-basic', 'git-github', 'docker-basic', 'devops-docker-api', 'devops-kubernetes', 'devops-monitoring', 'devops-cicd', 'devops-mlops'],
    duration: '14 周',
    difficulty: 'intermediate',
    category: 'devops',
  },
  {
    id: 'math-path',
    name: '数学基础路径',
    description: '从零开始学习数学基础，掌握线性代数、概率统计、张量运算、信息论和优化理论',
    nodes: ['math-linear-algebra', 'math-probability', 'math-tensor-ops', 'math-information-theory', 'math-optimization'],
    duration: '10 周',
    difficulty: 'beginner',
    category: 'math',
  },
  {
    id: 'llm-path',
    name: '大语言模型路径',
    description: '从零开始学习大语言模型，掌握预训练、微调、RAG、Agent、推理加速等核心技术',
    nodes: ['linux-basic', 'git-github', 'docker-basic', 'math-linear-algebra', 'math-probability', 'pytorch-core', 'llm-fundamentals', 'llm-pretraining', 'llm-rag', 'llm-local-rag', 'llm-agent', 'llm-inference', 'llm-evaluation'],
    duration: '18 周',
    difficulty: 'advanced',
    category: 'llm',
  },
  {
    id: 'cs-path',
    name: '计算机科学基础路径',
    description: '掌握算法与数据结构、操作系统原理、计算机网络和数据库基础',
    nodes: ['linux-basic', 'git-github', 'cs-algo', 'cs-os', 'cs-network', 'cs-database'],
    duration: '12 周',
    difficulty: 'beginner',
    category: 'cs',
  },
  {
    id: 'embedded-path',
    name: '嵌入式开发路径',
    description: '从零开始学习嵌入式开发，掌握 C 语言、RTOS、驱动开发和硬件抽象层',
    nodes: ['linux-basic', 'git-github', 'embedded-c', 'embedded-rtos', 'embedded-driver', 'embedded-hal'],
    duration: '13 周',
    difficulty: 'intermediate',
    category: 'embedded',
  },
  {
    id: 'electronics-path',
    name: '电子技术路径',
    description: '学习电路基础、信号系统和数字电子技术，掌握电子设计核心技能',
    nodes: ['elec-circuit', 'elec-signals', 'elec-digital', 'elec-pcb', 'elec-fpga'],
    duration: '11 周',
    difficulty: 'intermediate',
    category: 'electronics',
  },
  {
    id: 'signals-path',
    name: '信号处理路径',
    description: '深入学习通信原理和数字信号处理，掌握信号分析与处理技术',
    nodes: ['signals-basics', 'math-linear-algebra', 'math-probability', 'signals-comm', 'signals-dsp', 'signals-wireless', 'signals-antenna'],
    duration: '15 周',
    difficulty: 'intermediate',
    category: 'signals',
  },
  {
    id: 'control-path',
    name: '控制工程路径',
    description: '学习自动控制原理、ROS2、PLC 和伺服系统，掌握工业控制核心技术',
    nodes: ['math-linear-algebra', 'math-probability', 'ctrl-pid', 'ctrl-ros', 'ctrl-plc', 'ctrl-servo'],
    duration: '12 周',
    difficulty: 'advanced',
    category: 'control',
  },
  {
    id: 'electrical-path',
    name: '电气工程路径',
    description: '学习电机控制、电力系统和电气安全，掌握电气工程核心技术',
    nodes: ['elec-circuit', 'elec-motor', 'electrical-power', 'electrical-power-electronics', 'electrical-safety', 'electrical-relay'],
    duration: '12 周',
    difficulty: 'intermediate',
    category: 'electrical',
  },
];

/**
 * 根据分类获取学习路径
 */
export function getPathsByCategory(category: string): LearningPath[] {
  if (category === 'all') return LEARNING_PATHS;
  return LEARNING_PATHS.filter(p => p.category === category);
}

/**
 * 根据 ID 获取学习路径
 */
export function getPathById(id: string): LearningPath | undefined {
  return LEARNING_PATHS.find(p => p.id === id);
}
