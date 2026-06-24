import dagre from 'dagre';
import type { RoadmapNode as RoadmapNodeType } from '@/components/radar/types';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 160;

// Track 的显示顺序
const TRACK_ORDER = ['devops', 'math', 'cs', 'embedded', 'electronics', 'signals', 'control', 'electrical', 'cv', 'nlp', 'project'] as const;

// Track 之间的水平间距
const TRACK_GAP = 100;

/**
 * 自动布局：按 track 分组，使用 dagre 计算 DAG 布局
 * 返回每个节点的 position 映射
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

  let offsetX = 0;

  for (const track of TRACK_ORDER) {
    const group = trackGroups.get(track) || [];
    if (group.length === 0) continue;

    // 使用 dagre 计算单个 track 内部的布局
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: direction,  // 使用传入的方向
      nodesep: 80,        // 同一 rank 内节点间距（从 50 增加到 80）
      ranksep: 100,       // rank 之间的间距（从 70 增加到 100）
      marginx: 30,        // 水平边距（从 20 增加到 30）
      marginy: 30,        // 垂直边距（从 20 增加到 30）
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

    // 收集位置，加上 track 的偏移
    let trackMaxX = 0;
    let trackMaxY = 0;
    for (const node of group) {
      const nodeWithPos = g.node(node.id);
      if (nodeWithPos) {
        positions.set(node.id, {
          x: nodeWithPos.x - NODE_WIDTH / 2 + offsetX,
          y: nodeWithPos.y - NODE_HEIGHT / 2,
        });
        trackMaxX = Math.max(trackMaxX, nodeWithPos.x + NODE_WIDTH / 2);
        trackMaxY = Math.max(trackMaxY, nodeWithPos.y + NODE_HEIGHT / 2);
      }
    }

    // 根据方向调整 track 之间的偏移
    // 注意：dagre 在 LR 模式下会内部交换 X/Y 轴，即 nodeWithPos.x 实际表示垂直位置。
    // 因此 TB 模式用 trackMaxX（水平宽度）做偏移，LR 模式用 trackMaxY（垂直高度）做偏移，
    // 两者都映射到输出的 X 轴，实现 track 之间的水平排列。
    if (direction === 'TB') {
      offsetX += trackMaxX + TRACK_GAP;
    } else {
      offsetX += trackMaxY + TRACK_GAP;
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
): Map<string, { x: number; y: number; width: number; height: number }> {
  const bounds = new Map<string, { x: number; y: number; width: number; height: number }>();

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
        x: minX - 15,
        y: minY - 15,
        width: maxX - minX + 30,
        height: maxY - minY + 30,
      });
    }
  }

  return bounds;
}

export { TRACK_ORDER, NODE_WIDTH, NODE_HEIGHT };
