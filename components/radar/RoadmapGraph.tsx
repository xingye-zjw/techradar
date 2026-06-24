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
  const stats: Record<TrackId, { total: number; completed: number }> = {} as any;

  ROADMAP_TRACKS.forEach(track => {
    const trackNodes = nodes.filter(n => n.track === track.id);
    const completed = trackNodes.filter(n => completedNodes.has(n.id)).length;
    stats[track.id] = { total: trackNodes.length, completed };
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
  const initializedRef = useRef(false);
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

    const pathNodes = new Set(selectedPath.nodes);

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        style: pathNodes.has(n.id)
          ? {
              border: "2px solid #8b5cf6",
              boxShadow: "0 0 12px rgba(139, 92, 246, 0.4)",
            }
          : { opacity: 0.4 },
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
            opacity: isInPath ? 1 : 0.3,
          },
          markerEnd: {
            type: "arrowclosed" as const,
            color: isInPath ? "#8b5cf6" : "#52525b",
          },
        };
      })
    );

    // 自动跳转到路径节点区域
    if (reactFlowInstanceRef.current) {
      setTimeout(() => {
        reactFlowInstanceRef.current?.fitView({
          nodes: selectedPath.nodes.map(id => ({ id })),
          padding: 0.3,
          duration: 500,
        });
      }, 100);
    }
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
        <div className="mb-6 p-4 bg-gradient-to-r from-neutral-900/80 to-neutral-900/40 rounded-xl border border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-200">学习进度总览</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                已完成 {totalProgress.completed} / {totalProgress.total} 个节点
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-400">{totalProgress.percent}%</span>
            </div>
          </div>

          {/* 总进度条 */}
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${totalProgress.percent}%` }}
            />
          </div>

          {/* 各 Track 进度 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-11 gap-2">
            {ROADMAP_TRACKS.map((track) => {
              const stat = trackStats[track.id];
              const percent = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
              const trackColor = TRACK_COLORS[track.id];
              const isActive = activeTrack !== "all" && activeTrack === track.id;

              return (
                <button
                  key={track.id}
                  onClick={() => setActiveTrack(isActive ? "all" : track.id)}
                  className={`p-2 rounded-lg border transition-all ${
                    isActive
                      ? `${trackColor.bg} ${trackColor.border} ${trackColor.text}`
                      : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`w-2 h-2 rounded-full ${trackColor.solid}`} />
                    <span className="font-mono text-[10px] text-neutral-500">{stat.completed}/{stat.total}</span>
                  </div>
                  <div className="text-[11px] font-medium text-neutral-300 mb-1">{trackColor.label}</div>
                  <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${trackColor.solid}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Track 切换标签栏 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setActiveTrack("all")}
          className={`px-4 py-2 rounded-lg font-mono text-xs border transition-all ${
            activeTrack === "all"
              ? "bg-white text-neutral-900 border-white shadow-lg shadow-white/10"
              : "bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500 hover:text-neutral-300"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            全部
          </span>
        </button>

        <div className="w-px h-6 bg-neutral-700 mx-1" />

        {ROADMAP_TRACKS.map((t) => {
          const isActive = activeTrack === t.id;
          const trackColor = TRACK_COLORS[t.id];
          const stat = trackStats[t.id];
          return (
            <button
              key={t.id}
              onClick={() => setActiveTrack(t.id)}
              className={`px-3 py-2 rounded-lg font-mono text-xs border transition-all ${
                isActive
                  ? `${trackColor.text} ${trackColor.border} ${trackColor.bg} shadow-lg`
                  : "bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500 hover:text-neutral-300"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isActive ? trackColor.solid : 'bg-neutral-600'}`} />
                {t.name}
                {stat.completed > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${
                    isActive ? 'bg-white/10' : 'bg-neutral-800'
                  }`}>
                    {stat.completed}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* 布局方向切换 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-[10px] text-neutral-500 uppercase">布局方向</span>
        <div className="flex rounded-lg border border-neutral-700 overflow-hidden">
          <button
            onClick={() => setLayoutDirection('TB')}
            className={`px-3 py-1.5 font-mono text-xs transition-all ${
              layoutDirection === 'TB'
                ? 'bg-neutral-200 text-neutral-900'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-300'
            }`}
          >
            ↓ 纵向
          </button>
          <button
            onClick={() => setLayoutDirection('LR')}
            className={`px-3 py-1.5 font-mono text-xs transition-all ${
              layoutDirection === 'LR'
                ? 'bg-neutral-200 text-neutral-900'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-300'
            }`}
          >
            → 横向
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
      <div className="h-[400px] sm:h-[500px] md:h-[600px] w-full rounded-xl border border-neutral-700 overflow-hidden bg-neutral-950 shadow-2xl shadow-neutral-900/50">
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
                className="absolute rounded-2xl border-2 pointer-events-none transition-all duration-300"
                style={{
                  left: bounds.x - 10,
                  top: bounds.y - 10,
                  width: bounds.width + 20,
                  height: bounds.height + 20,
                  backgroundColor: trackColor.swimlane,
                  borderColor: trackColor.swimlaneBorder,
                }}
              >
                {/* Track 标签 */}
                <div
                  className="absolute -top-4 left-4 px-3 py-1 rounded-full text-[11px] font-mono font-bold shadow-lg"
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
      <div className="mt-4 flex flex-wrap gap-4 justify-center font-mono text-[10px] text-neutral-500">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          单击：查看详情
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          双击：切换完成
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          选择路径：自动聚焦
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
          滚轮缩放 | 拖拽平移
        </span>
      </div>
    </div>
  );
}
