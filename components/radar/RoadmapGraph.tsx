"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { RoadmapNode } from "./RoadmapNode";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { PathSelector } from "./PathSelector";
import type { RoadmapNode as RoadmapNodeType, NodeStatus, TrackId } from "./types";
import { ROADMAP_TRACKS } from "./types";
import { FULL_ROADMAP } from "@/lib/roadmap-data";
import { LEARNING_PATHS, type LearningPath } from "@/lib/learning-paths";
import { getNodeProgressPercent } from "@/lib/progress";
import { autoLayout, getTrackBounds, TRACK_ORDER } from "@/lib/layout";
import { TRACK_COLORS, getSwimlaneLabelColor } from "@/lib/constants";

const STORAGE_KEY = "techradar-roadmap-progress";

type RoadmapFlowNode = Node<{
  name: string;
  duration: string;
  status: NodeStatus;
  track: TrackId;
  description?: string;
  outcomes?: string[];
  hasTasks?: boolean;
}>;

function generateEdges(nodes: RoadmapNodeType[]): Edge[] {
  const edges: Edge[] = [];
  nodes.forEach((node) => {
    node.prerequisites.forEach((prereqId) => {
      edges.push({
        id: `${prereqId}-${node.id}`,
        source: prereqId,
        target: node.id,
        type: "smoothstep",
        animated: false,
        style: { stroke: "#3f3f46", strokeWidth: 2 },
        markerEnd: { type: "arrowclosed" as const, color: "#52525b" },
      });
    });
  });
  return edges;
}

const nodeTypes = { roadmap: RoadmapNode };

interface RoadmapGraphProps {
  initialNodes?: RoadmapNodeType[];
}

export function RoadmapGraph({ initialNodes = FULL_ROADMAP }: RoadmapGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<RoadmapFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [activeTrack, setActiveTrack] = useState<TrackId | "all">("all");
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeType | null>(null);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const initializedRef = useRef(false);

  const loadProgress = useCallback((): Record<string, NodeStatus> => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  }, []);

  const calculateNodeStatus = useCallback(
    (nodeId: string, nodes: RoadmapNodeType[], completed: Set<string>): NodeStatus => {
      if (completed.has(nodeId)) return "completed";
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return "locked";
      if (node.prerequisites.length === 0) return "available";
      return node.prerequisites.every((p) => completed.has(p)) ? "available" : "locked";
    }, []
  );

  // 使用 useMemo 缓存布局计算结果，避免每次渲染都重新计算
  const autoLayoutPositions = useMemo(
    () => autoLayout(initialNodes, layoutDirection),
    [initialNodes, layoutDirection]
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const saved = loadProgress();
    const completed = new Set(Object.keys(saved).filter((id) => saved[id] === "completed"));
    setCompletedNodes(completed);

    const initialized = initialNodes.map((node) => ({
      id: node.id,
      type: "roadmap" as const,
      position: autoLayoutPositions.get(node.id) || { x: 0, y: 0 },
      data: {
        name: node.name,
        duration: node.duration,
        status: calculateNodeStatus(node.id, initialNodes, completed),
        track: node.track,
        description: node.description,
        outcomes: node.outcomes,
        hasTasks: (node.dailyTasks?.length ?? 0) > 0,
        progressPercent: getNodeProgressPercent(node.id, node.dailyTasks?.length || 0),
        relatedIntelCount: node.relatedIntel?.length || 0,
        relatedToolsCount: node.relatedTools?.length || 0,
      },
    }));

    setNodes(initialized);
    setEdges(generateEdges(initialNodes));
  }, [initialNodes, loadProgress, calculateNodeStatus, setNodes, setEdges, autoLayoutPositions]);

  // 路径高亮效果：当选中学习路径时，高亮相关节点和边
  useEffect(() => {
    if (!selectedPath) {
      // 清除高亮：恢复默认样式
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          style: undefined,
        }))
      );
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          animated: completedNodes.has(e.source),
          style: {
            stroke: completedNodes.has(e.source) ? "#4ade80" : "#3f3f46",
            strokeWidth: 2,
          },
          markerEnd: {
            type: "arrowclosed" as const,
            color: completedNodes.has(e.source) ? "#4ade80" : "#52525b",
          },
        }))
      );
      return;
    }

    const pathNodes = new Set(selectedPath.nodes);

    // 高亮路径中的节点
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        style: pathNodes.has(n.id)
          ? {
              border: "2px solid #8b5cf6",
              boxShadow: "0 0 10px rgba(139, 92, 246, 0.3)",
            }
          : undefined,
      }))
    );

    // 高亮路径中的边（相邻节点之间的边）
    setEdges((eds) =>
      eds.map((e) => {
        const sourceIdx = selectedPath.nodes.indexOf(e.source);
        const targetIdx = selectedPath.nodes.indexOf(e.target);
        const isInPath = sourceIdx !== -1 && targetIdx !== -1 && targetIdx === sourceIdx + 1;
        return {
          ...e,
          style: {
            stroke: isInPath ? "#8b5cf6" : "#3f3f46",
            strokeWidth: isInPath ? 3 : 2,
          },
          markerEnd: {
            type: "arrowclosed" as const,
            color: isInPath ? "#8b5cf6" : "#52525b",
          },
        };
      })
    );
  }, [selectedPath, completedNodes, setNodes, setEdges]);

  const saveProgress = useCallback((completed: Set<string>) => {
    const progress: Record<string, NodeStatus> = {};
    completed.forEach((id) => { progress[id] = "completed"; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      const fullNode = FULL_ROADMAP.find((n) => n.id === node.id);
      if (fullNode) {
        setSelectedNode(fullNode);
      }
    },
    []
  );

  const onNodeToggleComplete = useCallback(
    (nodeId: string) => {
      let newCompleted = new Set(completedNodes);
      if (newCompleted.has(nodeId)) {
        newCompleted.delete(nodeId);
        FULL_ROADMAP.filter((n) => n.prerequisites.includes(nodeId)).forEach((n) => newCompleted.delete(n.id));
      } else {
        newCompleted.add(nodeId);
      }

      setCompletedNodes(newCompleted);
      saveProgress(newCompleted);

      setNodes((currentNodes) =>
        currentNodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            status: calculateNodeStatus(n.id, FULL_ROADMAP, newCompleted),
          },
        }))
      );
    },
    [completedNodes, calculateNodeStatus, saveProgress, setNodes]
  );

  // 过滤显示的节点
  const visibleNodes = activeTrack === "all"
    ? nodes
    : nodes.filter((n) => n.data.track === activeTrack);

  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));

  // 计算每个 track 的边界框（用于泳道背景）
  const trackBounds = useMemo(
    () => activeTrack === "all" ? getTrackBounds(initialNodes, autoLayoutPositions) : null,
    [activeTrack, initialNodes, autoLayoutPositions]
  );

  // 获取 selectedNode 的最新状态（从 nodes 状态中获取，确保状态同步）
  const selectedNodeWithStatus = useMemo(() => {
    if (!selectedNode) return null;
    const nodeData = nodes.find((n) => n.id === selectedNode.id);
    if (!nodeData) return selectedNode;
    // 返回带有最新 status 的节点数据
    return { ...selectedNode, status: nodeData.data.status };
  }, [selectedNode, nodes]);

  return (
    <div className="relative">
      {/* Track 切换标签栏 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveTrack("all")}
          className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-all ${
            activeTrack === "all"
              ? "bg-neutral-200 text-neutral-900 border-neutral-300 shadow-sm"
              : "bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500"
          }`}
        >
          全部
        </button>
        {ROADMAP_TRACKS.map((t) => {
          const isActive = activeTrack === t.id;
          const trackColor = TRACK_COLORS[t.id];
          return (
            <button
              key={t.id}
              onClick={() => setActiveTrack(t.id)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-all ${
                isActive
                  ? `${trackColor.text} ${trackColor.border} ${trackColor.bg}`
                  : "bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500"
              }`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${trackColor.solid}`} />
              {t.name}
            </button>
          );
        })}
      </div>

      {/* 布局方向切换 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-[10px] text-neutral-500 uppercase">布局方向</span>
        <button
          onClick={() => setLayoutDirection('TB')}
          className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-all ${
            layoutDirection === 'TB'
              ? 'bg-neutral-200 text-neutral-900 border-neutral-300 shadow-sm'
              : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500'
          }`}
        >
          ↓ 从上到下
        </button>
        <button
          onClick={() => setLayoutDirection('LR')}
          className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-all ${
            layoutDirection === 'LR'
              ? 'bg-neutral-200 text-neutral-900 border-neutral-300 shadow-sm'
              : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500'
          }`}
        >
          → 从左到右
        </button>
      </div>

      {/* 路径选择器 */}
      <PathSelector
        paths={LEARNING_PATHS}
        selectedPath={selectedPath}
        onSelectPath={setSelectedPath}
        className="mb-4"
      />

      {/* 节点点击提示 */}
      {selectedNodeWithStatus && (
        <NodeDetailPanel
          node={selectedNodeWithStatus}
          onClose={() => setSelectedNode(null)}
          onToggleComplete={onNodeToggleComplete}
        />
      )}

      {/* DAG 图 */}
      <div className="h-[400px] sm:h-[500px] md:h-[600px] w-full rounded-lg border border-neutral-700 overflow-hidden bg-neutral-950">
        <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(evt, node) => {
            onNodeClick(evt, node);
          }}
          onNodeDoubleClick={(evt, node) => {
            onNodeToggleComplete(node.id);
          }}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={1.5}
          onConnect={(conn) => {
            // Handle edge creation if needed
          }}
        >
          <Background color="#1a1a1a" gap={20} />

          {/* 泳道背景 - 仅在"全部 Track"模式下显示 */}
          {activeTrack === "all" && trackBounds && TRACK_ORDER.map((track) => {
            const bounds = trackBounds.get(track);
            if (!bounds) return null;
            const trackColor = TRACK_COLORS[track];
            return (
              <div
                key={track}
                className="absolute rounded-xl border pointer-events-none"
                style={{
                  left: bounds.x,
                  top: bounds.y,
                  width: bounds.width,
                  height: bounds.height,
                  backgroundColor: trackColor.swimlane,
                  borderColor: trackColor.swimlaneBorder,
                }}
              >
                {/* Track 标签 */}
                <div
                  className="absolute -top-3 left-4 px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: trackColor.swimlaneBorder,
                    color: getSwimlaneLabelColor(track),
                  }}
                >
                  {trackColor.label}
                </div>
              </div>
            );
          })}

          <Controls className="!bg-neutral-900 !border-neutral-700 !rounded-lg hidden md:block" />
        </ReactFlow>
      </div>

      {/* 操作说明 */}
      <div className="mt-3 flex flex-wrap gap-4 justify-center font-mono text-[10px] text-neutral-500">
        <span className="hidden sm:inline">单击节点：打开每日任务详情</span>
        <span className="sm:hidden">点击节点：查看详情</span>
        <span className="hidden sm:inline">双击节点：切换完成状态</span>
        <span className="sm:hidden">长按节点：切换完成</span>
        <span>筛选 Track</span>
      </div>
    </div>
  );
}
