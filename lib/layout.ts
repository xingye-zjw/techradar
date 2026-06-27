import dagre from 'dagre';
import type { RoadmapNode as RoadmapNodeType } from '@/components/radar/types';
import type { TrackId } from './constants';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 160;

// Track 的显示顺序
export const TRACK_ORDER = ['devops', 'math', 'cs', 'embedded', 'electronics', 'signals', 'control', 'electrical', 'cv', 'nlp', 'project'] as const;

// Track 之间的间距
const TRACK_GAP = 150;

/**
 * 自动布局：按 track 分组，使用 dagre 计算 DAG 布局
 * TB 模式：track 水平排列，每个 track 内部从上到下
 * LR 模式：track 垂直排列，每个 track 内部从左到右
 */
export function autoLayout(
  nodes: RoadmapNodeType[],
  direction: 'TB' | 'LR' = 'TB'
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  // 按 track 分组
  const trackGroups = new Map<string, RoadmapNodeType[]>();
  for (const node of nodes) {
    if (!trackGroups.has(node.track)) {
      trackGroups.set(node.track, []);
    }
    trackGroups.get(node.track)!.push(node);
  }

  // 先计算每个 track 的布局和尺寸
  const trackLayouts: Array<{
    track: string;
    positions: Map<string, { x: number; y: number }>;
    width: number;
    height: number;
  }> = [];

  for (const track of TRACK_ORDER) {
    const group = trackGroups.get(track) || [];
    if (group.length === 0) continue;

    // 使用 dagre 计算单个 track 内部的布局
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: 'TB',  // 始终使用 TB 计算内部布局
      nodesep: 80,
      ranksep: 100,
      marginx: 30,
      marginy: 30,
    });
    g.setDefaultEdgeLabel(() => ({}));

    // 添加节点
    for (const node of group) {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }

    // 添加边（仅限 track 内部的依赖）
    for (const node of group) {
      for (const prereq of node.prerequisites) {
        if (g.hasNode(prereq)) {
          g.setEdge(prereq, node.id);
        }
      }
    }

    // 执行布局
    dagre.layout(g);

    // 收集位置并计算边界
    const trackPositions = new Map<string, { x: number; y: number }>();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const node of group) {
      const nodeWithPos = g.node(node.id);
      if (nodeWithPos) {
        const x = nodeWithPos.x - NODE_WIDTH / 2;
        const y = nodeWithPos.y - NODE_HEIGHT / 2;
        trackPositions.set(node.id, { x, y });
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + NODE_WIDTH);
        maxY = Math.max(maxY, y + NODE_HEIGHT);
      }
    }

    // 归一化位置（从 0,0 开始）
    trackPositions.forEach((pos, id) => {
      trackPositions.set(id, { x: pos.x - minX, y: pos.y - minY });
    });

    trackLayouts.push({
      track,
      positions: trackPositions,
      width: maxX - minX,
      height: maxY - minY,
    });
  }

  // 根据方向排列 track
  let offset = 0;

  if (direction === 'TB') {
    // TB 模式：track 水平排列（从左到右），每个 track 内部从上到下
    for (const layout of trackLayouts) {
      layout.positions.forEach((pos, id) => {
        positions.set(id, { x: pos.x + offset, y: pos.y });
      });
      offset += layout.width + TRACK_GAP;
    }
  } else {
    // LR 模式：track 垂直排列（从上到下），每个 track 内部节点需要旋转
    for (const layout of trackLayouts) {
      // 在 LR 模式下，交换 x 和 y 坐标
      layout.positions.forEach((pos, id) => {
        positions.set(id, { x: pos.y, y: pos.x + offset });
      });
      offset += layout.height + TRACK_GAP;
    }
  }

  return positions;
}

/**
 * 获取每个 track 的边界框（用于泳道背景绘制）
 */
export function getTrackBounds(
  nodes: RoadmapNodeType[],
  positions: Map<string, { x: number; y: number }>
): Map<TrackId, { x: number; y: number; width: number; height: number }> {
  const bounds = new Map<TrackId, { x: number; y: number; width: number; height: number }>();

  for (const track of TRACK_ORDER) {
    const trackNodes = nodes.filter(n => n.track === track);
    if (trackNodes.length === 0) continue;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const node of trackNodes) {
      const pos = positions.get(node.id);
      if (!pos) continue;
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + NODE_WIDTH);
      maxY = Math.max(maxY, pos.y + NODE_HEIGHT);
    }

    if (minX !== Infinity) {
      bounds.set(track, {
        x: minX - 25,
        y: minY - 45,
        width: maxX - minX + 50,
        height: maxY - minY + 70,
      });
    }
  }

  return bounds;
}

export { NODE_WIDTH, NODE_HEIGHT };
