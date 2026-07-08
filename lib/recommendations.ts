/**
 * 节点推荐引擎
 * 基于 relatedNodes 和 prerequisites 字段为用户推荐学习路径
 *
 * 性能优化：
 * - 预构建 id -> node Map（O(1) 查找替代 O(n) find）
 * - 预构建 prereq -> 后继节点 reverse index
 */

import { FULL_ROADMAP } from "./roadmap-data";
import type { RoadmapNode } from "@/lib/content-types";

// ============================================================================
// 预构建索引（模块级惰性初始化）
// ============================================================================

let _nodeMap: Map<string, RoadmapNode> | null = null;
let _prereqReverseIndex: Map<string, RoadmapNode[]> | null = null;

/** 确保索引已初始化 */
function _ensureIndexes() {
  if (_nodeMap && _prereqReverseIndex) return;

  const nMap = new Map<string, RoadmapNode>();
  const pMap = new Map<string, RoadmapNode[]>();

  for (const node of FULL_ROADMAP) {
    nMap.set(node.id, node);

    const prereqs = node.prerequisites || [];
    for (const p of prereqs) {
      if (!pMap.has(p)) pMap.set(p, []);
      pMap.get(p)!.push(node);
    }
  }

  _nodeMap = nMap;
  _prereqReverseIndex = pMap;
}

/** id -> RoadmapNode 快速查询 */
function _getNodeById(id: string): RoadmapNode | undefined {
  _ensureIndexes();
  return _nodeMap!.get(id);
}

/** 判断 id 是否是真实节点（区别于纯知识性前置描述） */
function _isRealNodeId(id: string): boolean {
  _ensureIndexes();
  return _nodeMap!.has(id);
}

/** 获取依赖指定前置的所有后继节点（reverse index 查询） */
export function getSuccessorNodes(prereqId: string): RoadmapNode[] {
  _ensureIndexes();
  return _prereqReverseIndex!.get(prereqId) || [];
}

// ============================================================================
// 公开 API
// ============================================================================

/**
 * 获取节点的下一步推荐（基于 relatedNodes 中同 track 的下一节点）
 */
export function getNextRecommendations(
  nodeId: string,
  completedDays: Record<string, number[]> = {},
  limit: number = 3,
): RoadmapNode[] {
  const currentNode = _getNodeById(nodeId);
  if (!currentNode) return [];

  const related = currentNode.relatedNodes || [];
  const candidates = related
    .map((id) => _getNodeById(id))
    .filter((n): n is RoadmapNode => n !== undefined)
    .filter((n) => !n.track.startsWith("project") || true);

  const sameTrack = candidates.filter((n) => n.track === currentNode.track);
  const otherTrack = candidates.filter((n) => n.track !== currentNode.track);

  const sortByCompletion = (a: RoadmapNode, b: RoadmapNode) => {
    const aCompleted = completedDays[a.id]?.length || 0;
    const bCompleted = completedDays[b.id]?.length || 0;
    const aTotal = a.dailyTasks?.length || 0;
    const bTotal = b.dailyTasks?.length || 0;
    const aProgress = aTotal > 0 ? aCompleted / aTotal : 0;
    const bProgress = bTotal > 0 ? bCompleted / bTotal : 0;
    return aProgress - bProgress;
  };

  return [...sameTrack, ...otherTrack].sort(sortByCompletion).slice(0, limit);
}

/**
 * 获取可解锁的节点（前置依赖已全部完成）
 */
export function getAvailableNodes(completedNodes: Set<string>): RoadmapNode[] {
  return FULL_ROADMAP.filter((node) => {
    if (completedNodes.has(node.id)) return false;
    const prereqs = node.prerequisites || [];
    return prereqs.every((p) => completedNodes.has(p) || isKnowledgeOnlyPrereq(p));
  });
}

/**
 * 判断前置是否为纯知识性要求（不算硬性节点前置）
 */
function isKnowledgeOnlyPrereq(prereq: string): boolean {
  return !_isRealNodeId(prereq);
}

/**
 * 基于当前节点推荐相似难度的横向学习节点
 */
export function getSimilarLevelNodes(nodeId: string, limit: number = 3): RoadmapNode[] {
  const currentNode = _getNodeById(nodeId);
  if (!currentNode) return [];

  const currentDifficulty = currentNode.difficulty || "beginner";

  return FULL_ROADMAP.filter((n) => n.id !== nodeId)
    .filter((n) => n.difficulty === currentDifficulty)
    .filter((n) => n.track !== currentNode.track)
    .slice(0, limit);
}

/**
 * 计算节点完成度
 */
export function getNodeProgress(
  nodeId: string,
  completedDays: number[] = [],
): { completed: number; total: number; percent: number } {
  const node = _getNodeById(nodeId);
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

  FULL_ROADMAP.forEach((node) => {
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
  const trackIds = new Set(FULL_ROADMAP.map((n) => n.track));
  trackIds.forEach((track) => {
    const trackNodes = FULL_ROADMAP.filter((n) => n.track === track);
    const trackTotal = trackNodes.reduce((sum, n) => sum + (n.dailyTasks?.length || 0), 0);
    const trackCompleted = trackNodes.reduce(
      (sum, n) => sum + (completedDays[n.id]?.length || 0),
      0,
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
  limit: number = 5,
): Array<{ node: RoadmapNode; reason: string; priority: number }> {
  _ensureIndexes();

  const completedNodes = new Set(
    Object.entries(completedDays)
      .filter(([id, days]) => {
        const node = _nodeMap!.get(id);
        return node && days.length === (node.dailyTasks?.length || 0) && days.length > 0;
      })
      .map(([id]) => id),
  );

  const recommendations: Array<{ node: RoadmapNode; reason: string; priority: number }> = [];

  FULL_ROADMAP.forEach((node) => {
    if (completedNodes.has(node.id)) return;

    const prereqs = node.prerequisites || [];
    const realPrereqs = prereqs.filter((p) => _isRealNodeId(p));
    const unmetPrereqs = realPrereqs.filter((p) => !completedNodes.has(p));

    if (unmetPrereqs.length === 0) {
      const completedSameTrack = realPrereqs.filter((p) => {
        const n = _nodeMap!.get(p);
        return n?.track === node.track;
      }).length;

      recommendations.push({
        node,
        reason: "可以开始学习",
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

  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, limit);
}
