export interface LearningPath {
  id: string;
  name: string;
  description: string;
  nodes: string[];          // 节点 ID 列表
  duration: string;         // 总时长
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'cv' | 'nlp' | 'llm' | 'devops' | 'math';
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'cv-path',
    name: '计算机视觉路径',
    description: '从零开始学习计算机视觉，掌握 CNN、目标检测等核心技术',
    nodes: ['linux-basic', 'git-github', 'docker-basic', 'math-linear-algebra', 'math-probability', 'pytorch-core', 'cv-cnn'],
    duration: '10 周',
    difficulty: 'intermediate',
    category: 'cv',
  },
  {
    id: 'nlp-path',
    name: '自然语言处理路径',
    description: '从零开始学习自然语言处理，掌握词向量、序列模型、Transformer、机器翻译等核心技术',
    nodes: ['linux-basic', 'git-github', 'docker-basic', 'math-linear-algebra', 'math-probability', 'pytorch-core', 'nlp-word-embeddings', 'nlp-sentiment-analysis', 'nlp-rnn', 'nlp-sequence-labeling', 'nlp-transformer', 'nlp-machine-translation'],
    duration: '16 周',
    difficulty: 'intermediate',
    category: 'nlp',
  },
  {
    id: 'devops-path',
    name: 'DevOps 路径',
    description: '从零开始学习 DevOps，掌握 Docker、Kubernetes、CI/CD、监控告警等核心技能',
    nodes: ['linux-basic', 'git-github', 'docker-basic', 'docker-network', 'docker-advanced', 'devops-cicd', 'devops-kubernetes', 'devops-prometheus', 'devops-monitoring', 'devops-mlops'],
    duration: '12 周',
    difficulty: 'intermediate',
    category: 'devops',
  },
  {
    id: 'math-path',
    name: '数学基础路径',
    description: '从零开始学习数学基础，掌握线性代数和概率统计',
    nodes: ['math-linear-algebra', 'math-probability'],
    duration: '4 周',
    difficulty: 'beginner',
    category: 'math',
  },
  {
    id: 'llm-path',
    name: '大语言模型路径',
    description: '从零开始学习大语言模型，掌握预训练、微调、RAG、Agent 等核心技术',
    nodes: ['linux-basic', 'git-github', 'docker-basic', 'math-linear-algebra', 'math-probability', 'pytorch-core', 'nlp-transformer', 'llm-fundamentals', 'llm-finetune', 'llm-rag', 'llm-agent', 'llm-inference'],
    duration: '16 周',
    difficulty: 'advanced',
    category: 'llm',
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
