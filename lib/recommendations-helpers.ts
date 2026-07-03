/**
 * 客户端安全的学习统计辅助函数
 * 这个文件不依赖任何 Node.js 特定的 API，可以安全地在客户端组件中使用
 */

import type { RoadmapNodeData } from "./roadmap-data-helpers";

export interface Stats {
  totalNodes: number;
  completedNodes: number;
  inProgressNodes: number;
  totalDays: number;
  completedDays: number;
  percent: number;
  trackProgress: Record<string, { completed: number; total: number; percent: number }>;
}

export interface Recommendation {
  node: RoadmapNodeData;
  reason: string;
  priority: number;
}

let fullRoadmap: RoadmapNodeData[] | null = null;

async function loadRoadmap(): Promise<RoadmapNodeData[]> {
  if (fullRoadmap) return fullRoadmap;
  const { FULL_ROADMAP } = await import("./roadmap-data");
  fullRoadmap = FULL_ROADMAP;
  return fullRoadmap;
}

/**
 * 计算整体学习统计
 */
export async function getLearningStats(completedDays: Record<string, number[]> = {}): Promise<Stats> {
  const roadmap = await loadRoadmap();
  const totalNodes = roadmap.length;
  let completedNodes = 0;
  let totalDays = 0;
  let completedDaysCount = 0;
  let inProgressNodes = 0;

  roadmap.forEach(node => {
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

  const trackProgress: Record<string, { completed: number; total: number; percent: number }> = {};
  const trackIds = new Set(roadmap.map(n => n.track));
  trackIds.forEach(track => {
    const trackNodes = roadmap.filter(n => n.track === track);
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
 */
export async function getPersonalizedRecommendations(
  completedDays: Record<string, number[]> = {},
  limit: number = 5
): Promise<Recommendation[]> {
  const roadmap = await loadRoadmap();
  
  const completedNodes = new Set(
    Object.entries(completedDays)
      .filter(([id, days]) => {
        const node = roadmap.find(n => n.id === id);
        return node && days.length === (node.dailyTasks?.length || 0) && days.length > 0;
      })
      .map(([id]) => id)
  );

  const recommendations: Recommendation[] = [];

  roadmap.forEach(node => {
    if (completedNodes.has(node.id)) return;

    const prereqs = node.prerequisites || [];
    const realPrereqs = prereqs.filter(p => roadmap.some(n => n.id === p));
    const unmetPrereqs = realPrereqs.filter(p => !completedNodes.has(p));

    if (unmetPrereqs.length === 0) {
      const completedSameTrack = realPrereqs.filter(p => {
        const n = roadmap.find(x => x.id === p);
        return n?.track === node.track;
      }).length;

      recommendations.push({
        node,
        reason: '可以开始学习',
        priority: 100 - completedSameTrack * 10,
      });
    } else if (unmetPrereqs.length === 1) {
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

/**
 * 获取节点的下一步推荐
 */
export async function getNextRecommendations(
  nodeId: string,
  completedDays: Record<string, number[]> = {},
  limit: number = 3
): Promise<RoadmapNodeData[]> {
  const roadmap = await loadRoadmap();
  const currentNode = roadmap.find(n => n.id === nodeId);
  if (!currentNode) return [];

  const related = currentNode.relatedNodes || [];
  const candidates = related
    .map(id => roadmap.find(n => n.id === id))
    .filter((n): n is RoadmapNodeData => n !== undefined);

  const sameTrack = candidates.filter(n => n.track === currentNode.track);
  const otherTrack = candidates.filter(n => n.track !== currentNode.track);

  return [...sameTrack, ...otherTrack].slice(0, limit);
}
