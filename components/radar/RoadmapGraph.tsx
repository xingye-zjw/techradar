"use client";

import { useCallback, useEffect, useState, useMemo, useRef, useTransition } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { RoadmapNode } from "./RoadmapNode";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { PathSelector } from "./PathSelector";
import type { RoadmapNode as RoadmapNodeType, NodeStatus, TrackId } from "./types";
import { ROADMAP_TRACKS } from "./types";
import { LEARNING_PATHS, type LearningPath } from "@/lib/learning-paths";
import { getNodeProgressPercent } from "@/lib/progress";
import { getTrackBounds, TRACK_ORDER } from "@/lib/layout";
import { TRACK_COLORS, getSwimlaneLabelColor } from "@/lib/constants";
import { useKeyboardShortcuts } from "@/lib/use-keyboard-shortcuts";
import { ShortcutsPanel } from "@/components/ShortcutsPanel";
import { ProgressSettings } from "@/components/ProgressSettings";
import { getProgress, saveNodeCompletedSet } from "@/lib/storage";

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

// 计算各 Track 的进度统计
function getTrackStats(nodes: RoadmapNodeType[], completedNodes: Set<string>) {
  const stats: Record<string, { total: number; completed: number }> = {};

  TRACK_ORDER.forEach((trackId) => {
    const trackNodes = nodes.filter((n) => n.track === trackId);
    const completed = trackNodes.filter((n) => completedNodes.has(n.id)).length;
    stats[trackId] = { total: trackNodes.length, completed };
  });

  return stats;
}

export function RoadmapGraph({ initialNodes }: RoadmapGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<RoadmapFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [activeTrack, setActiveTrack] = useState<TrackId | "all">("all");
  const [layoutDirection, setLayoutDirection] = useState<"TB" | "LR">("TB");
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeType | null>(null);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [fullRoadmap, setFullRoadmap] = useState<RoadmapNodeType[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [, startTransition] = useTransition();
  const reactFlowInstanceRef = useRef<ReactFlowInstance<RoadmapFlowNode, Edge> | null>(null);
  const autoLayoutPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    import("@/lib/roadmap-data").then(({ FULL_ROADMAP }) => {
      setFullRoadmap(FULL_ROADMAP);
    });
  }, []);

  const roadmapData = initialNodes || fullRoadmap;

  const loadProgress = useCallback((): Record<string, NodeStatus> => {
    if (typeof window === "undefined") return {};
    try {
      const progress = getProgress();
      const result: Record<string, NodeStatus> = {};
      for (const [nodeId, node] of Object.entries(progress.nodes)) {
        if (node.status === "completed") {
          result[nodeId] = "completed";
        }
      }
      return result;
    } catch {
      return {};
    }
  }, []);

  const calculateNodeStatus = useCallback(
    (nodeId: string, nodes: RoadmapNodeType[], completed: Set<string>): NodeStatus => {
      if (completed.has(nodeId)) return "completed";
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return "locked";
      if (node.prerequisites.length === 0) return "available";
      return node.prerequisites.every((p) => completed.has(p)) ? "available" : "locked";
    },
    [],
  );

  // 异步自动布局计算：dynamic import dagre + Promise 回调
  const runAutoLayoutAsync = useCallback(
    async (
      nodes: RoadmapNodeType[],
      direction: "TB" | "LR",
    ): Promise<Map<string, { x: number; y: number }>> => {
      const dagre = await import("dagre");
      const NODE_WIDTH = 220;
      const NODE_HEIGHT = 160;
      const TRACK_GAP = 150;

      const positions = new Map<string, { x: number; y: number }>();

      const trackGroups = new Map<string, RoadmapNodeType[]>();
      for (const node of nodes) {
        if (!trackGroups.has(node.track)) {
          trackGroups.set(node.track, []);
        }
        trackGroups.get(node.track)!.push(node);
      }

      const trackLayouts: Array<{
        track: string;
        positions: Map<string, { x: number; y: number }>;
        width: number;
        height: number;
      }> = [];

      for (const track of TRACK_ORDER) {
        const group = trackGroups.get(track) || [];
        if (group.length === 0) continue;

        const g = new dagre.graphlib.Graph();
        g.setGraph({
          rankdir: "TB",
          nodesep: 80,
          ranksep: 100,
          marginx: 30,
          marginy: 30,
        });
        g.setDefaultEdgeLabel(() => ({}));

        for (const node of group) {
          g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
        }

        for (const node of group) {
          for (const prereq of node.prerequisites) {
            if (g.hasNode(prereq)) {
              g.setEdge(prereq, node.id);
            }
          }
        }

        dagre.layout(g);

        const trackPositions = new Map<string, { x: number; y: number }>();
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;

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

      let offset = 0;

      if (direction === "TB") {
        for (const layout of trackLayouts) {
          layout.positions.forEach((pos, id) => {
            positions.set(id, { x: pos.x + offset, y: pos.y });
          });
          offset += layout.width + TRACK_GAP;
        }
      } else {
        for (const layout of trackLayouts) {
          layout.positions.forEach((pos, id) => {
            positions.set(id, { x: pos.y, y: pos.x + offset });
          });
          offset += layout.height + TRACK_GAP;
        }
      }

      return positions;
    },
    [],
  );

  // 计算进度统计
  const trackStats = useMemo(
    () => getTrackStats(roadmapData, completedNodes),
    [roadmapData, completedNodes],
  );

  // 总体进度
  const totalProgress = useMemo(() => {
    const total = roadmapData.length;
    const completed = roadmapData.filter((n) => completedNodes.has(n.id)).length;
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [roadmapData, completedNodes]);

  // 初始化
  useEffect(() => {
    const saved = loadProgress();
    const completed = new Set(Object.keys(saved).filter((id) => saved[id] === "completed"));
    setCompletedNodes(completed);
    setIsInitialized(true);
  }, [loadProgress]);

  // 当布局方向或初始化状态变化时，异步计算布局并更新节点
  useEffect(() => {
    if (!isInitialized || roadmapData.length === 0) return;

    let cancelled = false;
    const saved = loadProgress();
    const completed = new Set(Object.keys(saved).filter((id) => saved[id] === "completed"));

    // dynamic import dagre 并异步计算布局
    runAutoLayoutAsync(roadmapData, layoutDirection).then((positions) => {
      if (cancelled) return;

      autoLayoutPositionsRef.current = positions;

      const initialized = roadmapData.map((node) => ({
        id: node.id,
        type: "roadmap" as const,
        position: positions.get(node.id) || { x: 0, y: 0 },
        data: {
          name: node.name,
          duration: node.duration,
          status: calculateNodeStatus(node.id, roadmapData, completed),
          track: node.track,
          description: node.description,
          outcomes: node.outcomes,
          hasTasks: (node.dailyTasks?.length ?? 0) > 0,
          progressPercent: getNodeProgressPercent(node.id, node.dailyTasks?.length || 0),
          relatedIntelCount: node.relatedIntel?.length || 0,
          relatedToolsCount: node.relatedTools?.length || 0,
        },
      }));

      startTransition(() => {
        setNodes(initialized);
        setEdges(generateEdges(roadmapData));
      });

      setTimeout(() => {
        startTransition(() => {
          reactFlowInstanceRef.current?.fitView({ duration: 200, padding: 0.25 });
        });
      }, 100);
    });

    return () => {
      cancelled = true;
    };
  }, [
    isInitialized,
    roadmapData,
    layoutDirection,
    runAutoLayoutAsync,
    calculateNodeStatus,
    loadProgress,
    setNodes,
    setEdges,
    startTransition,
  ]);

  // 路径高亮效果
  useEffect(() => {
    if (!selectedPath) {
      setNodes((nds) => nds.map((n) => ({ ...n, style: undefined })));
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
        })),
      );
      return;
    }

    const pathNodeSet = new Set(selectedPath.nodes);

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        style: pathNodeSet.has(n.id)
          ? {
              border: "2px solid #8b5cf6",
              boxShadow: "0 0 12px rgba(139, 92, 246, 0.4)",
            }
          : { opacity: 0.3 },
      })),
    );

    setEdges((eds) =>
      eds.map((e) => {
        const sourceIdx = selectedPath.nodes.indexOf(e.source);
        const targetIdx = selectedPath.nodes.indexOf(e.target);
        const isInPath = sourceIdx !== -1 && targetIdx !== -1 && targetIdx === sourceIdx + 1;
        return {
          ...e,
          style: {
            stroke: isInPath ? "#8b5cf6" : "#3f3f46",
            strokeWidth: isInPath ? 3 : 1,
            opacity: isInPath ? 1 : 0.2,
          },
          markerEnd: {
            type: "arrowclosed" as const,
            color: isInPath ? "#8b5cf6" : "#52525b",
          },
        };
      }),
    );

    // 自动跳转到路径节点区域
    setTimeout(() => {
      if (reactFlowInstanceRef.current && selectedPath.nodes.length > 0) {
        const nodeIds = selectedPath.nodes;
        startTransition(() => {
          reactFlowInstanceRef.current?.fitView({
            nodes: nodeIds.map((id) => ({ id })),
            padding: 0.1,
            duration: 500,
            maxZoom: 1.2,
          });
        });
      }
    }, 200);
  }, [selectedPath, completedNodes, setNodes, setEdges, startTransition]);

  const saveProgress = useCallback((completed: Set<string>) => {
    saveNodeCompletedSet(completed);
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      const fullNode = roadmapData.find((n) => n.id === node.id);
      if (fullNode) {
        setSelectedNode(fullNode);
      }
    },
    [roadmapData],
  );

  const onNodeToggleComplete = useCallback(
    (nodeId: string) => {
      let newCompleted = new Set(completedNodes);
      if (newCompleted.has(nodeId)) {
        newCompleted.delete(nodeId);
        roadmapData
          .filter((n) => n.prerequisites.includes(nodeId))
          .forEach((n) => newCompleted.delete(n.id));
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
            status: calculateNodeStatus(n.id, roadmapData, newCompleted),
          },
        })),
      );
    },
    [completedNodes, calculateNodeStatus, saveProgress, setNodes, roadmapData],
  );

  // 处理路径选择
  const handleSelectPath = useCallback((path: LearningPath | null) => {
    setSelectedPath(path);
    if (path) {
      setActiveTrack("all");
    }
  }, []);

  // ReactFlow 初始化回调
  const onInit = useCallback((instance: ReactFlowInstance<RoadmapFlowNode, Edge>) => {
    reactFlowInstanceRef.current = instance;
  }, []);

  // 过滤显示的节点
  const visibleNodes =
    activeTrack === "all" ? nodes : nodes.filter((n) => n.data.track === activeTrack);

  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = edges.filter(
    (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target),
  );

  // 计算泳道边界
  const trackBounds = useMemo(
    () =>
      activeTrack === "all" ? getTrackBounds(roadmapData, autoLayoutPositionsRef.current) : null,
    [activeTrack, roadmapData, nodes],
  );

  // 获取 selectedNode 的最新状态
  const selectedNodeWithStatus = useMemo(() => {
    if (!selectedNode) return null;
    const nodeData = nodes.find((n) => n.id === selectedNode.id);
    if (!nodeData) return selectedNode;
    return { ...selectedNode, status: nodeData.data.status };
  }, [selectedNode, nodes]);

  // 键盘快捷键
  useKeyboardShortcuts({
    closePanel: () => setSelectedNode(null),
    toggleNodeComplete: () => {
      if (selectedNode) {
        onNodeToggleComplete(selectedNode.id);
      }
    },
    nextNode: () => {
      if (selectedNode && selectedNode.relatedNodes && selectedNode.relatedNodes.length > 0) {
        const nextId = selectedNode.relatedNodes[0];
        const next = roadmapData.find((n) => n.id === nextId);
        if (next) setSelectedNode(next);
      }
    },
    prevNode: () => {
      if (selectedNode && selectedNode.prerequisites && selectedNode.prerequisites.length > 0) {
        const prevId = selectedNode.prerequisites[0];
        const prev = roadmapData.find((n) => n.id === prevId);
        if (prev) setSelectedNode(prev);
      }
    },
    zoomIn: () => {
      if (reactFlowInstanceRef.current) {
        reactFlowInstanceRef.current.zoomIn();
      }
    },
    zoomOut: () => {
      if (reactFlowInstanceRef.current) {
        reactFlowInstanceRef.current.zoomOut();
      }
    },
    resetView: () => {
      if (reactFlowInstanceRef.current) {
        startTransition(() => {
          reactFlowInstanceRef.current?.fitView({ duration: 200, padding: 0.25 });
        });
      }
    },
    showShortcuts: () => setShowShortcuts(true),
  });

  return (
    <div className="relative">
      {/* 总体进度概览 - 仅在"全部"模式下显示 */}
      {activeTrack === "all" && (
        <div className="mb-6 p-4 bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-neutral-800/50 rounded-2xl border border-neutral-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                学习进度总览
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                已完成 <span className="text-green-400 font-medium">{totalProgress.completed}</span>{" "}
                / {totalProgress.total} 个节点
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                {totalProgress.percent}%
              </div>
              <div className="text-[10px] text-neutral-500 font-mono">完成率</div>
            </div>
          </div>

          {/* 总进度条 */}
          <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden mb-5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-300 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${totalProgress.percent}%` }}
            />
          </div>

          {/* 各 Track 进度 - 水平滚动 */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {ROADMAP_TRACKS.map((track) => {
              const stat = trackStats[track.id];
              if (!stat || stat.total === 0) return null;
              const percent = Math.round((stat.completed / stat.total) * 100);
              const trackColor = TRACK_COLORS[track.id];
              const isActive = activeTrack !== "all" && activeTrack === track.id;

              return (
                <button
                  key={track.id}
                  onClick={() => setActiveTrack(isActive ? "all" : track.id)}
                  className={`flex-shrink-0 w-[100px] p-3 rounded-xl border transition-all duration-200 ${
                    isActive
                      ? `${trackColor.bg} ${trackColor.border} shadow-lg scale-[1.02]`
                      : stat.completed > 0
                        ? "bg-neutral-800/50 border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800"
                        : "bg-neutral-900/50 border-neutral-800/50 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${trackColor.solid} ${stat.completed > 0 ? "shadow-sm" : "opacity-50"}`}
                    />
                    <span className="font-mono text-[10px] text-neutral-400">
                      {stat.completed}/{stat.total}
                    </span>
                  </div>
                  <div
                    className={`text-xs font-medium mb-2 ${isActive ? trackColor.text : "text-neutral-300"}`}
                  >
                    {trackColor.label}
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${trackColor.solid}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 控制栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Track 切换标签栏 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTrack("all")}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all duration-200 ${
              activeTrack === "all"
                ? "bg-white text-neutral-900 shadow-md shadow-white/10 font-medium"
                : "bg-neutral-800/50 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
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
                className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all duration-200 ${
                  isActive
                    ? `${trackColor.text} ${trackColor.bg} font-medium shadow-md`
                    : "bg-neutral-800/50 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${isActive ? trackColor.solid : "bg-neutral-600"}`}
                  />
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* 右侧控制按钮 */}
        <div className="flex items-center gap-2">
          {/* 布局方向切换 */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-500 font-mono">布局</span>
            <div className="flex rounded-lg bg-neutral-800/50 p-0.5">
              <button
                onClick={() => setLayoutDirection("TB")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 ${
                  layoutDirection === "TB"
                    ? "bg-neutral-200 text-neutral-900 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                ↓ 纵向
              </button>
              <button
                onClick={() => setLayoutDirection("LR")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 ${
                  layoutDirection === "LR"
                    ? "bg-neutral-200 text-neutral-900 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                → 横向
              </button>
            </div>
          </div>

          {/* 快捷键按钮 */}
          <button
            onClick={() => setShowShortcuts(true)}
            className="p-2 rounded-lg bg-neutral-800/50 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-all"
            title="键盘快捷键 (?)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </button>

          {/* 设置按钮 */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-all ${
              showSettings
                ? "bg-neutral-700 text-neutral-200"
                : "bg-neutral-800/50 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
            }`}
            title="设置"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 路径选择器 */}
      <PathSelector
        paths={LEARNING_PATHS}
        selectedPath={selectedPath}
        onSelectPath={handleSelectPath}
        className="mb-4"
      />

      {/* 节点详情面板 */}
      {selectedNodeWithStatus && (
        <NodeDetailPanel
          node={selectedNodeWithStatus}
          onClose={() => setSelectedNode(null)}
          onToggleComplete={onNodeToggleComplete}
        />
      )}

      {/* DAG 图 */}
      <div className="relative rounded-2xl border border-neutral-700/50 overflow-hidden bg-black shadow-2xl">
        <div className="h-[450px] sm:h-[550px] md:h-[650px] w-full">
          <ReactFlow
            nodes={visibleNodes}
            edges={visibleEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={onInit}
            onNodeClick={(evt, node) => {
              onNodeClick(evt, node);
            }}
            onNodeDoubleClick={(evt, node) => {
              onNodeToggleComplete(node.id);
            }}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.1}
            maxZoom={1.5}
            onlyRenderVisibleElements={true}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#000000" gap={20} />

            {/* 泳道背景 - 仅在"全部 Track"模式下显示 */}
            {activeTrack === "all" &&
              trackBounds &&
              Array.from(trackBounds.entries()).map(([track, bounds]) => {
                const trackColor = TRACK_COLORS[track];
                if (!trackColor) return null;
                return (
                  <div
                    key={track}
                    className="absolute rounded-2xl pointer-events-none"
                    style={{
                      left: bounds.x,
                      top: bounds.y,
                      width: bounds.width,
                      height: bounds.height,
                      backgroundColor: trackColor.swimlane,
                      border: `1px solid ${trackColor.swimlaneBorder}`,
                      zIndex: 0,
                    }}
                  >
                    {/* Track 标签 */}
                    <div
                      className="absolute top-3 left-3 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold"
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

            <Controls className="!bg-neutral-900 !border-neutral-700 !rounded-xl !shadow-xl hidden md:block" />
          </ReactFlow>
        </div>
      </div>

      {/* 操作说明 */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2 text-neutral-500">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-900/50 border border-neutral-800">
            <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
            <span className="text-[10px] font-mono">单击</span>
          </div>
          <span className="text-[11px]">查看详情</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-500">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-900/50 border border-neutral-800">
            <span className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/40" />
            <span className="text-[10px] font-mono">双击</span>
          </div>
          <span className="text-[11px]">切换完成</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-500">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-900/50 border border-neutral-800">
            <span className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500/40" />
            <span className="text-[10px] font-mono">滚轮</span>
          </div>
          <span className="text-[11px]">缩放</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-500">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-900/50 border border-neutral-800">
            <span className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
            <span className="text-[10px] font-mono">拖拽</span>
          </div>
          <span className="text-[11px]">平移</span>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="mt-4 p-5 bg-neutral-900 border border-neutral-700/50 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              <span>⚙️</span>
              <span>设置</span>
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ProgressSettings />
        </div>
      )}

      {/* 快捷键面板 */}
      <ShortcutsPanel isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}
