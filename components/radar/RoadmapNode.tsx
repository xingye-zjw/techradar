"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeStatus, TrackId } from "./types";
import { TRACK_COLORS } from "@/lib/constants";

interface RoadmapNodeData {
  name: string;
  duration: string;
  status: NodeStatus;
  track: TrackId;
  description?: string;
  outcomes?: string[];
  hasTasks?: boolean;
  progressPercent?: number;
  relatedIntelCount?: number;
  relatedToolsCount?: number;
}

interface RoadmapNodeProps {
  data: RoadmapNodeData;
  selected?: boolean;
}

// 从统一的 TRACK_COLORS 派生边框色和点颜色
const trackBorders: Record<TrackId, string> = {
  cv: TRACK_COLORS.cv.border.replace("border-", "border-"),
  nlp: TRACK_COLORS.nlp.border.replace("border-", "border-"),
  devops: TRACK_COLORS.devops.border.replace("border-", "border-"),
  math: TRACK_COLORS.math.border.replace("border-", "border-"),
  project: TRACK_COLORS.project.border.replace("border-", "border-"),
  cs: TRACK_COLORS.cs.border.replace("border-", "border-"),
  embedded: TRACK_COLORS.embedded.border.replace("border-", "border-"),
  electronics: TRACK_COLORS.electronics.border.replace("border-", "border-"),
  signals: TRACK_COLORS.signals.border.replace("border-", "border-"),
  control: TRACK_COLORS.control.border.replace("border-", "border-"),
  electrical: TRACK_COLORS.electrical.border.replace("border-", "border-"),
};

const trackDots: Record<TrackId, string> = {
  cv: TRACK_COLORS.cv.text.replace("text-", "bg-"),
  nlp: TRACK_COLORS.nlp.text.replace("text-", "bg-"),
  devops: TRACK_COLORS.devops.text.replace("text-", "bg-"),
  math: TRACK_COLORS.math.text.replace("text-", "bg-"),
  project: TRACK_COLORS.project.text.replace("text-", "bg-"),
  cs: TRACK_COLORS.cs.text.replace("text-", "bg-"),
  embedded: TRACK_COLORS.embedded.text.replace("text-", "bg-"),
  electronics: TRACK_COLORS.electronics.text.replace("text-", "bg-"),
  signals: TRACK_COLORS.signals.text.replace("text-", "bg-"),
  control: TRACK_COLORS.control.text.replace("text-", "bg-"),
  electrical: TRACK_COLORS.electrical.text.replace("text-", "bg-"),
};

const statusStyles: Record<NodeStatus, {
  border: string;
  bg: string;
  text: string;
  muted: string;
  icon: string;
  glow: string;
  statusBar: string;
}> = {
  locked: {
    border: "border-neutral-700",
    bg: "bg-neutral-900",
    text: "text-neutral-500",
    muted: "text-neutral-600",
    icon: "bg-neutral-800 text-neutral-600",
    glow: "",
    statusBar: "bg-neutral-700",
  },
  available: {
    border: "border-neutral-600",
    bg: "bg-neutral-900",
    text: "text-neutral-100",
    muted: "text-neutral-400",
    icon: "bg-neutral-800 text-neutral-400",
    glow: "shadow-[0_0_15px_rgba(255,255,255,0.05)]",
    statusBar: "bg-neutral-500",
  },
  completed: {
    border: "border-green-500",
    bg: "bg-green-500/10",
    text: "text-neutral-100",
    muted: "text-green-400",
    icon: "bg-green-500/20 text-green-400",
    glow: "",
    statusBar: "bg-green-500",
  },
};

/**
 * 进度圆环组件
 */
function ProgressRing({ percent, size = 20 }: { percent: number; size?: number }) {
  const radius = (size - 3) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* 背景圆环 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="text-neutral-700"
      />
      {/* 进度圆环 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={percent > 0 ? "text-emerald-400" : "text-neutral-700"}
      />
    </svg>
  );
}

function RoadmapNodeComponent({ data, selected }: RoadmapNodeProps) {
  const style = statusStyles[data.status];
  const isLocked = data.status === "locked";
  const trackBorder = trackBorders[data.track] || "border-neutral-500";
  const trackDot = trackDots[data.track] || "bg-neutral-500";
  const progress = data.progressPercent || 0;

  return (
    <div
      className={`
        relative min-w-[140px] max-w-[180px] sm:min-w-[200px] sm:max-w-[240px] rounded-lg border-2 p-3 sm:p-4
        transition-all duration-300
        ${style.border} ${style.bg} ${style.glow}
        ${isLocked ? "opacity-55" : "opacity-100"}
        ${selected ? "ring-2 ring-white/30" : ""}
        hover:brightness-110 cursor-pointer
      `}
    >
      {/* Top status bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg ${style.statusBar}`} />

      {/* Left track indicator stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${trackBorder}`} />

      {/* Click hint icon */}
      <div className="absolute top-2 right-2">
        <svg className="w-3 h-3 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-neutral-400 !border-0 !-top-1"
      />

      {/* Lock icon */}
      {isLocked && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center z-10">
          <svg className="w-2.5 h-2.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}

      {/* Completed checkmark */}
      {data.status === "completed" && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center z-10">
          <svg className="w-3 h-3 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="space-y-2 pr-4">
        {/* Track dot + name */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${trackDot}`} />
          <h4 className={`font-bold text-sm leading-tight ${style.text}`}>
            {data.name}
          </h4>
        </div>

        {/* Duration + Progress */}
        <div className="flex items-center justify-between">
          <div className={`font-mono text-[0.65rem] sm:text-[0.6rem] ${style.muted}`}>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm ${style.icon}`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {data.duration}
            </span>
          </div>

          {/* Progress indicator */}
          {data.hasTasks && !isLocked && (
            <div className="flex items-center gap-1">
              <ProgressRing percent={progress} size={16} />
              <span className="font-mono text-[9px] text-neutral-500">
                {progress}%
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {data.description && !isLocked && (
          <p className={`text-[0.65rem] leading-relaxed ${style.muted} line-clamp-2`}>
            {data.description}
          </p>
        )}

        {/* Related content badges */}
        {!isLocked && (data.relatedIntelCount || data.relatedToolsCount) ? (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {data.relatedIntelCount ? (
              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">
                📰 {data.relatedIntelCount} 篇情报
              </span>
            ) : null}
            {data.relatedToolsCount ? (
              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20">
                🔧 {data.relatedToolsCount} 个工具
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Task count badge */}
        {data.hasTasks && !isLocked && (
          <div className="flex items-center gap-1 mt-1">
            <span className="font-mono text-[9px] px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded">
              📋 含每日任务
            </span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-neutral-400 !border-0 !-bottom-1"
      />
    </div>
  );
}

export const RoadmapNode = memo(RoadmapNodeComponent);
