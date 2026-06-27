/**
 * 实战项目数据加载模块
 *
 * 提供项目数据的加载、筛选和辅助函数。
 */

import projectsData from '../content/practice/projects.json';
import { PracticeProject, ContentCategory, isValidCategory } from './content-types';

// JSON 原始数据结构接口
interface RawProject {
  slug: string;
  title: string;
  category: string;
  difficulty: number;
  duration: string;
  summary: string;
  prerequisites: string[];
  relatedNodes?: string[];
  objectives?: string[];
  projectStructure?: unknown[];
  steps?: unknown[];
  resources?: unknown[];
  relatedIntel?: string[];
  relatedTerms?: string[];
  relatedTools?: string[];
  templateRepo?: string;
  solutionRepo?: string;
}

/**
 * 验证 raw project 对象的类型
 */
function isRawProject(data: unknown): data is RawProject {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.slug === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.difficulty === 'number' &&
    typeof obj.summary === 'string' &&
    Array.isArray(obj.prerequisites)
  );
}

/**
 * 将 JSON 数据转换为 PracticeProject 数组
 */
function normalizeProjects(data: unknown[]): PracticeProject[] {
  return data
    .filter((p): p is RawProject => isRawProject(p))
    .map(p => {
      // 验证 difficulty 是有效的 1-5 范围
      const validDifficulty = (d: number): 1 | 2 | 3 | 4 | 5 => {
        if (d >= 1 && d <= 5 && Number.isInteger(d)) {
          return d as 1 | 2 | 3 | 4 | 5;
        }
        return 3; // 默认中等难度
      };

      return {
        slug: p.slug,
        title: p.title,
        category: isValidCategory(p.category) ? p.category as ContentCategory : 'uncategorized',
        difficulty: validDifficulty(p.difficulty),
        duration: p.duration,
        summary: p.summary,
        prerequisites: p.prerequisites || [],
        relatedNodes: p.relatedNodes,
        objectives: p.objectives || [],
        projectStructure: (p.projectStructure || []) as PracticeProject['projectStructure'],
        steps: (p.steps || []) as PracticeProject['steps'],
        resources: (p.resources || []) as PracticeProject['resources'],
        relatedIntel: p.relatedIntel,
        relatedTerms: p.relatedTerms,
        relatedTools: p.relatedTools,
        templateRepo: p.templateRepo,
        solutionRepo: p.solutionRepo,
      };
    });
}

// 模块级缓存
let cachedProjects: PracticeProject[] | null = null;

/**
 * 获取所有实战项目（带缓存）
 */
export function getAllProjects(): PracticeProject[] {
  if (cachedProjects) return cachedProjects;
  cachedProjects = normalizeProjects(projectsData.projects);
  return cachedProjects;
}

/**
 * 根据 slug 获取项目
 * @param slug - 项目标识符
 * @returns 项目对象或 undefined
 */
export function getProjectBySlug(slug: string): PracticeProject | undefined {
  return getAllProjects().find(p => p.slug === slug);
}

/**
 * 按难度筛选项目
 * @param difficulty - 难度等级 (1-5)
 * @returns 符合条件的项目数组
 */
export function getProjectsByDifficulty(difficulty: number): PracticeProject[] {
  return getAllProjects().filter(p => p.difficulty === difficulty);
}

/**
 * 按分类筛选项目
 * @param category - 内容分类
 * @returns 符合条件的项目数组
 */
export function getProjectsByCategory(category: ContentCategory): PracticeProject[] {
  return getAllProjects().filter(p => p.category === category);
}

/**
 * 获取关联指定路线图节点的项目
 * @param nodeId - 路线图节点 ID
 * @returns 关联的项目数组
 */
export function getProjectsByNode(nodeId: string): PracticeProject[] {
  return getAllProjects().filter(p => p.relatedNodes?.includes(nodeId));
}

/**
 * 获取难度星级显示
 * @param difficulty - 难度等级 (1-5)
 * @returns 星级字符串
 */
export function getDifficultyStars(difficulty: number): string {
  return '⭐'.repeat(difficulty);
}

/**
 * 获取难度等级文本
 * @param difficulty - 难度等级 (1-5)
 * @returns 难度文本
 */
export function getDifficultyLabel(difficulty: number): string {
  const labels: Record<number, string> = {
    1: '初级',
    2: '中级',
    3: '高级',
    4: '专家',
    5: '挑战',
  };
  return labels[difficulty] || '未知';
}

/**
 * 搜索项目
 * @param query - 搜索关键词
 * @returns 匹配的项目数组
 */
export function searchProjects(query: string): PracticeProject[] {
  const lowerQuery = query.toLowerCase();
  return getAllProjects().filter(p =>
    p.title.toLowerCase().includes(lowerQuery) ||
    p.summary.toLowerCase().includes(lowerQuery) ||
    p.prerequisites.some(pr => pr.toLowerCase().includes(lowerQuery))
  );
}
