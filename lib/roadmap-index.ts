/**
 * 路线图数据索引模块
 * 支持按需加载 track 数据，减少初始加载体积
 */

import type { RoadmapNode } from "@/components/radar/types";
import { FULL_ROADMAP } from "./roadmap-data";

// 基础节点信息（不含 dailyTasks）
export interface NodeSummary {
  id: string;
  name: string;
  track: string;
  duration: string;
  prerequisites: string[];
  status: "locked" | "available" | "completed";
  difficulty?: "beginner" | "intermediate" | "advanced";
  description?: string;
  outcomes?: string[];
  relatedIntel?: string[];
  relatedTools?: string[];
  relatedTerms?: string[];
  relatedNodes?: string[];
}

// 全量数据（用于路线图页面）
export { FULL_ROADMAP };

// 轻量级节点列表（用于首页、搜索等不需要 dailyTasks 的场景）
export function getNodeSummaries(): NodeSummary[] {
  return FULL_ROADMAP.map(node => ({
    id: node.id,
    name: node.name,
    track: node.track,
    duration: node.duration,
    prerequisites: node.prerequisites,
    status: node.status,
    difficulty: node.difficulty,
    description: node.description,
    outcomes: node.outcomes,
    relatedIntel: node.relatedIntel,
    relatedTools: node.relatedTools,
    relatedTerms: node.relatedTerms,
    relatedNodes: node.relatedNodes,
  }));
}

// 获取单个节点详情（含 dailyTasks）
export function getNodeById(nodeId: string): RoadmapNode | undefined {
  return FULL_ROADMAP.find(n => n.id === nodeId);
}

// 获取 track 下的所有节点
export function getNodesByTrack(track: string): RoadmapNode[] {
  return FULL_ROADMAP.filter(n => n.track === track);
}

// 获取节点总数
export function getNodeCount(): number {
  return FULL_ROADMAP.length;
}

// 获取总学习日数
export function getTotalDays(): number {
  return FULL_ROADMAP.reduce((sum, node) => sum + (node.dailyTasks?.length || 0), 0);
}
