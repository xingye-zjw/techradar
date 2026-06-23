/**
 * 实战项目数据加载模块
 *
 * 提供项目数据的加载、筛选和辅助函数。
 */

import projectsData from '../content/practice/projects.json';
import { PracticeProject, ContentCategory } from './content-types';

/**
 * 将 JSON 数据转换为 PracticeProject 数组
 */
function normalizeProjects(data: any[]): PracticeProject[] {
  return data.map(p => ({
    ...p,
    category: p.category as ContentCategory,
  }));
}

/**
 * 获取所有实战项目
 */
export function getAllProjects(): PracticeProject[] {
  return normalizeProjects(projectsData.projects);
}

/**
 * 根据 slug 获取项目
 * @param slug - 项目标识符
 * @returns 项目对象或 undefined
 */
export function getProjectBySlug(slug: string): PracticeProject | undefined {
  return normalizeProjects(projectsData.projects).find(p => p.slug === slug);
}

/**
 * 按难度筛选项目
 * @param difficulty - 难度等级 (1-5)
 * @returns 符合条件的项目数组
 */
export function getProjectsByDifficulty(difficulty: number): PracticeProject[] {
  return normalizeProjects(projectsData.projects).filter(p => p.difficulty === difficulty);
}

/**
 * 按分类筛选项目
 * @param category - 内容分类
 * @returns 符合条件的项目数组
 */
export function getProjectsByCategory(category: ContentCategory): PracticeProject[] {
  return normalizeProjects(projectsData.projects).filter(p => p.category === category);
}

/**
 * 获取关联指定路线图节点的项目
 * @param nodeId - 路线图节点 ID
 * @returns 关联的项目数组
 */
export function getProjectsByNode(nodeId: string): PracticeProject[] {
  return normalizeProjects(projectsData.projects).filter(p => p.relatedNodes?.includes(nodeId));
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
  return normalizeProjects(projectsData.projects).filter(p =>
    p.title.toLowerCase().includes(lowerQuery) ||
    p.summary.toLowerCase().includes(lowerQuery) ||
    p.prerequisites.some(pr => pr.toLowerCase().includes(lowerQuery))
  );
}
