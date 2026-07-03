/**
 * 客户端安全的路线图数据索引
 * 不依赖 Node.js API，可以在 Client Components 中安全使用
 */

import type { RoadmapNode } from "@/components/radar/types";

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

// 延迟加载全量数据
let fullRoadmap: RoadmapNode[] | null = null;

async function loadFullRoadmap(): Promise<RoadmapNode[]> {
  if (fullRoadmap) return fullRoadmap;
  const { FULL_ROADMAP } = await import("./roadmap-data");
  fullRoadmap = FULL_ROADMAP;
  return fullRoadmap;
}

export async function getNodeSummaries(): Promise<NodeSummary[]> {
  const roadmap = await loadFullRoadmap();
  return roadmap.map(node => ({
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

export async function getNodeById(nodeId: string): Promise<RoadmapNode | undefined> {
  const roadmap = await loadFullRoadmap();
  return roadmap.find(n => n.id === nodeId);
}

export async function getNodesByTrack(track: string): Promise<RoadmapNode[]> {
  const roadmap = await loadFullRoadmap();
  return roadmap.filter(n => n.track === track);
}

export async function getNodeCount(): Promise<number> {
  const roadmap = await loadFullRoadmap();
  return roadmap.length;
}

export async function getTotalDays(): Promise<number> {
  const roadmap = await loadFullRoadmap();
  return roadmap.reduce((sum, node) => sum + (node.dailyTasks?.length || 0), 0);
}
