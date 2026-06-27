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
  type ReactFlowInstance,
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

// 计算各 Track 的进度统计
function getTrackStats(nodes: RoadmapNodeType[], completedNodes: Set<string>) {
  const stats: Record<string, { total: number; completed: number }> = {};

  TRACK_ORDER.forEach(trackId => {
    const trackNodes = nodes.filter(n => n.track === trackId);
    const completed = trackNodes.filter(n => completedNodes.has(n.id)).length;
    stats[trackId] = { total: trackNodes.length, completed };
  });

  return stats;
}

export function RoadmapGraph({ initialNodes = FULL_ROADMAP }: RoadmapGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<RoadmapFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [activeTrack, setActiveTrack] = useState<TrackId | "all">("all");
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeType | null>(null);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const reactFlowInstanceRef = useRef<ReactFlowInstance<RoadmapFlowNode, Edge> | null>(null);

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

  // 使用 useMemo 缓存布局计算结果
  const autoLayoutPositions = useMemo(
    () => autoLayout(initialNodes, layoutDirection),
    [initialNodes, layoutDirection]
  );

  // 计算进度统计
  const trackStats = useMemo(
    () => getTrackStats(initialNodes, completedNodes),
    [initialNodes, completedNodes]
  );

  // 总体进度
  const totalProgress = useMemo(() => {
    const total = initialNodes.length;
    const completed = initialNodes.filter(n => completedNodes.has(n.id)).length;
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [initialNodes, completedNodes]);

  // 初始化
  useEffect(() => {
    const saved = loadProgress();
    const completed = new Set(Object.keys(saved).filter((id) => saved[id] === "completed"));
    setCompletedNodes(completed);
    setIsInitialized(true);
  }, [loadProgress]);

  // 当布局方向或初始化状态变化时，更新节点位置
  useEffect(() => {
    if (!isInitialized) return;

    const saved = loadProgress();
    const completed = new Set(Object.keys(saved).filter((id) => saved[id] === "completed"));

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

    // 延迟 fitView
    setTimeout(() => {
      reactFlowInstanceRef.current?.fitView({ padding: 0.15, duration: 300 });
    }, 100);
  }, [isInitialized, initialNodes, layoutDirection, autoLayoutPositions, calculateNodeStatus, loadProgress, setNodes, setEdges]);

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
        }))
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
      }))
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
      })
    );

    // 自动跳转到路径节点区域
    setTimeout(() => {
      if (reactFlowInstanceRef.current && selectedPath.nodes.length > 0) {
        // 获取路径中所有节点的 ID
        const nodeIds = selectedPath.nodes;
        // 使用 fitView 聚焦到这些节点，减小 padding 让节点显示更大
        reactFlowInstanceRef.current.fitView({
          nodes: nodeIds.map(id => ({ id })),
          padding: 0.1,
          duration: 500,
          maxZoom: 1.2,
        });
      }
    }, 200);
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
  const visibleNodes = activeTrack === "all"
    ? nodes
    : nodes.filter((n) => n.data.track === activeTrack);

  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));

  // 计算泳道边界
  const trackBounds = useMemo(
    () => activeTrack === "all" ? getTrackBounds(initialNodes, autoLayoutPositions) : null,
    [activeTrack, initialNodes, autoLayoutPositions]
  );

  // 获取 selectedNode 的最新状态
  const selectedNodeWithStatus = useMemo(() => {
    if (!selectedNode) return null;
    const nodeData = nodes.find((n) => n.id === selectedNode.id);
    if (!nodeData) return selectedNode;
    return { ...selectedNode, status: nodeData.data.status };
  }, [selectedNode, nodes]);

  return (
    <div className="relative">
      {/* 总体进度概览 - 仅在"全部"模式下显示 */}
      {activeTrack === "all" && (
        <div className="mb-6 p-4 bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-neutral-800/50 rounded-2xl border border-neutral-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                学习进度总览
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                已完成 <span className="text-green-400 font-medium">{totalProgress.completed}</span> / {totalProgress.total} 个节点
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
                    <span className={`w-2.5 h-2.5 rounded-full ${trackColor.solid} ${stat.completed > 0 ? 'shadow-sm' : 'opacity-50'}`} />
                    <span className="font-mono text-[10px] text-neutral-400">{stat.completed}/{stat.total}</span>
                  </div>
                  <div className={`text-xs font-medium mb-2 ${isActive ? trackColor.text : 'text-neutral-300'}`}>
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
                  <span className={`w-2 h-2 rounded-full ${isActive ? trackColor.solid : 'bg-neutral-600'}`} />
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* 布局方向切换 */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-500 font-mono">布局</span>
          <div className="flex rounded-lg bg-neutral-800/50 p-0.5">
            <button
              onClick={() => setLayoutDirection('TB')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 ${
                layoutDirection === 'TB'
                  ? 'bg-neutral-200 text-neutral-900 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              ↓ 纵向
            </button>
            <button
              onClick={() => setLayoutDirection('LR')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 ${
                layoutDirection === 'LR'
                  ? 'bg-neutral-200 text-neutral-900 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              → 横向
            </button>
          </div>
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
          >
            <Background color="#000000" gap={20} />

            {/* 泳道背景 - 仅在"全部 Track"模式下显示 */}
            {activeTrack === "all" && trackBounds && Array.from(trackBounds.entries()).map(([track, bounds]) => {
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
    </div>
  );
}
