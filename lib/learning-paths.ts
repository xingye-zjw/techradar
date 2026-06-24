export interface LearningPath {
  id: string;
  name: string;
  description: string;
  nodes: string[];          // 节点 ID 列表
  duration: string;         // 总时长
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'cv' | 'nlp' | 'devops' | 'math';
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
    description: '从零开始学习自然语言处理，掌握 Transformer、BERT 等核心技术',
    nodes: ['linux-basic', 'git-github', 'docker-basic', 'math-linear-algebra', 'math-probability', 'pytorch-core', 'nlp-transformer'],
    duration: '10 周',
    difficulty: 'intermediate',
    category: 'nlp',
  },
  {
    id: 'devops-path',
    name: '工程部署路径',
    description: '从零开始学习工程部署，掌握 Linux、Git、Docker 等核心工具',
    nodes: ['linux-basic', 'git-github', 'docker-basic'],
    duration: '6 周',
    difficulty: 'beginner',
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
