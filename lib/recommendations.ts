/**
 * 节点推荐引擎
 * 基于 relatedNodes 和 prerequisites 字段为用户推荐学习路径
 */

import { FULL_ROADMAP } from "./roadmap-data";
import type { RoadmapNode } from "@/components/radar/types";

/**
 * 获取节点的下一步推荐（基于 relatedNodes 中同 track 的下一节点）
 */
export function getNextRecommendations(
  nodeId: string,
  completedDays: Record<string, number[]> = {},
  limit: number = 3
): RoadmapNode[] {
  const currentNode = FULL_ROADMAP.find(n => n.id === nodeId);
  if (!currentNode) return [];

  // 优先从 relatedNodes 中筛选
  const related = currentNode.relatedNodes || [];
  const candidates = related
    .map(id => FULL_ROADMAP.find(n => n.id === id))
    .filter((n): n is RoadmapNode => n !== undefined)
    .filter(n => !n.track.startsWith('project') || true); // 包含项目节点

  // 同 track 优先，按 track 排序
  const sameTrack = candidates.filter(n => n.track === currentNode.track);
  const otherTrack = candidates.filter(n => n.track !== currentNode.track);

  // 智能排序：未完成的优先
  const sortByCompletion = (a: RoadmapNode, b: RoadmapNode) => {
    const aCompleted = completedDays[a.id]?.length || 0;
    const bCompleted = completedDays[b.id]?.length || 0;
    const aTotal = a.dailyTasks?.length || 0;
    const bTotal = b.dailyTasks?.length || 0;
    const aProgress = aTotal > 0 ? aCompleted / aTotal : 0;
    const bProgress = bTotal > 0 ? bCompleted / bTotal : 0;
    return aProgress - bProgress; // 未完成度高的优先
  };

  return [...sameTrack, ...otherTrack]
    .sort(sortByCompletion)
    .slice(0, limit);
}

/**
 * 获取可解锁的节点（前置依赖已全部完成）
 */
export function getAvailableNodes(
  completedNodes: Set<string>
): RoadmapNode[] {
  return FULL_ROADMAP.filter(node => {
    // 已经完成的不算可解锁
    if (completedNodes.has(node.id)) return false;

    // 检查所有前置是否已完成
    const prereqs = node.prerequisites || [];
    return prereqs.every(p => completedNodes.has(p) || isKnowledgeOnlyPrereq(p));
  });
}

/**
 * 判断前置是否为纯知识性要求（不算硬性节点前置）
 */
function isKnowledgeOnlyPrereq(prereq: string): boolean {
  // 简单的纯文本知识前置都不需要解锁节点
  // 例如 "基础的 Python 编程能力" 这样的描述
  return !FULL_ROADMAP.some(n => n.id === prereq);
}

/**
 * 基于当前节点推荐相似难度的横向学习节点
 */
export function getSimilarLevelNodes(
  nodeId: string,
  limit: number = 3
): RoadmapNode[] {
  const currentNode = FULL_ROADMAP.find(n => n.id === nodeId);
  if (!currentNode) return [];

  const currentDifficulty = currentNode.difficulty || 'beginner';

  return FULL_ROADMAP
    .filter(n => n.id !== nodeId)
    .filter(n => n.difficulty === currentDifficulty)
    .filter(n => n.track !== currentNode.track) // 排除同 track
    .slice(0, limit);
}

/**
 * 计算节点完成度
 */
export function getNodeProgress(
  nodeId: string,
  completedDays: number[] = []
): { completed: number; total: number; percent: number } {
  const node = FULL_ROADMAP.find(n => n.id === nodeId);
  if (!node) return { completed: 0, total: 0, percent: 0 };

  const total = node.dailyTasks?.length || 0;
  const completed = completedDays.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percent };
}

/**
 * 获取整体学习统计
 */
export function getLearningStats(completedDays: Record<string, number[]> = {}) {
  const totalNodes = FULL_ROADMAP.length;
  let completedNodes = 0;
  let totalDays = 0;
  let completedDaysCount = 0;
  let inProgressNodes = 0;

  FULL_ROADMAP.forEach(node => {
    const total = node.dailyTasks?.length || 0;
    const completed = completedDays[node.id]?.length || 0;
    totalDays += total;
    completedDaysCount += completed;

    if (total > 0 && completed === total) {
      completedNodes++;
    } else if (completed > 0) {
      inProgressNodes++;
    }
  });

  // 各 track 完成度
  const trackProgress: Record<string, { completed: number; total: number; percent: number }> = {};
  const trackIds = new Set(FULL_ROADMAP.map(n => n.track));
  trackIds.forEach(track => {
    const trackNodes = FULL_ROADMAP.filter(n => n.track === track);
    const trackTotal = trackNodes.reduce((sum, n) => sum + (n.dailyTasks?.length || 0), 0);
    const trackCompleted = trackNodes.reduce(
      (sum, n) => sum + (completedDays[n.id]?.length || 0),
      0
    );
    trackProgress[track] = {
      completed: trackCompleted,
      total: trackTotal,
      percent: trackTotal > 0 ? Math.round((trackCompleted / trackTotal) * 100) : 0,
    };
  });

  return {
    totalNodes,
    completedNodes,
    inProgressNodes,
    totalDays,
    completedDays: completedDaysCount,
    percent: totalDays > 0 ? Math.round((completedDaysCount / totalDays) * 100) : 0,
    trackProgress,
  };
}

/**
 * 推荐下一步学习节点（综合算法）
 * 策略：
 * 1. 优先推荐已完成节点的同 track 下一个
 * 2. 其次推荐可解锁的同 track 节点
 * 3. 再次推荐 relatedNodes 中可解锁的节点
 */
export function getPersonalizedRecommendations(
  completedDays: Record<string, number[]> = {},
  limit: number = 5
): Array<{ node: RoadmapNode; reason: string; priority: number }> {
  const completedNodes = new Set(
    Object.entries(completedDays)
      .filter(([_, days]) => {
        const node = FULL_ROADMAP.find(n => n.id === _);
        return node && days.length === (node.dailyTasks?.length || 0) && days.length > 0;
      })
      .map(([id]) => id)
  );

  const recommendations: Array<{ node: RoadmapNode; reason: string; priority: number }> = [];

  FULL_ROADMAP.forEach(node => {
    if (completedNodes.has(node.id)) return;

    const prereqs = node.prerequisites || [];
    const realPrereqs = prereqs.filter(p => FULL_ROADMAP.some(n => n.id === p));
    const unmetPrereqs = realPrereqs.filter(p => !completedNodes.has(p));

    // 优先级评分
    if (unmetPrereqs.length === 0) {
      // 全部前置已满足
      const completedSameTrack = realPrereqs.filter(p => {
        const n = FULL_ROADMAP.find(x => x.id === p);
        return n?.track === node.track;
      }).length;

      recommendations.push({
        node,
        reason: '可以开始学习',
        priority: 100 - completedSameTrack * 10, // 同 track 完成越多优先级越高
      });
    } else if (unmetPrereqs.length === 1) {
      // 只差一个前置
      recommendations.push({
        node,
        reason: `完成前置后即可解锁`,
        priority: 50,
      });
    }
  });

  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}
