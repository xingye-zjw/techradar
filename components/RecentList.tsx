"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getRecentVisits, type RecentVisit } from "@/lib/storage";

const TYPE_ICONS: Record<string, string> = {
  node: "🗺️",
  intel: "📰",
  tool: "🧰",
  glossary: "📖",
  task: "📋",
};

const TYPE_LABELS: Record<string, string> = {
  node: "路线图",
  intel: "情报",
  tool: "工具",
  glossary: "术语",
  task: "任务",
};

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 0) return "刚刚";
  if (seconds < 60) return "刚刚";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return new Date(timestamp).toLocaleDateString("zh-CN");
}

function getItemHref(visit: RecentVisit): string {
  switch (visit.type) {
    case "node":
      return "/roadmap";
    case "intel":
      return `/intel/${visit.slug}`;
    case "glossary":
      return `/glossary/${visit.slug}`;
    case "tool":
      return `/toolbox`;
    case "task":
      // 尝试从 slug 中解析 node 和 day 信息
      // slug 格式: "nodeId-day" 或 "nodeId"
      const parts = visit.slug.split("-");
      if (parts.length >= 2) {
        const day = parts.pop();
        const nodeId = parts.join("-");
        if (day && !isNaN(Number(day))) {
          return `/roadmap/${nodeId}/day/${day}`;
        }
      }
      return "/roadmap";
    default:
      return "/";
  }
}

// 自定义 Hook：获取最近访问记录
function useRecentVisits() {
  const [visits, setVisits] = useState<RecentVisit[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setVisits(getRecentVisits());
    setMounted(true);
  }, []);

  return { visits, mounted };
}

interface RecentListProps {
  limit?: number;
  showTimestamp?: boolean;
  className?: string;
}

export function RecentList({
  limit = 5,
  showTimestamp = true,
  className = "",
}: RecentListProps) {
  const { visits, mounted } = useRecentVisits();

  if (!mounted) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(limit)].map((_, i) => (
          <div
            key={i}
            className="h-10 bg-neutral-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  const displayVisits = visits.slice(0, limit);

  if (displayVisits.length === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-sm text-neutral-500">暂无最近访问记录</p>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {displayVisits.map((visit) => (
        <Link
          key={`${visit.type}-${visit.slug}`}
          href={getItemHref(visit)}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/50 transition-colors group"
        >
          <span className="text-sm">{TYPE_ICONS[visit.type] || "📄"}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-neutral-300 truncate group-hover:text-cyan-400 transition-colors">
              {visit.title}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-neutral-500">
              <span className="px-1.5 py-0.5 rounded bg-neutral-800">
                {TYPE_LABELS[visit.type] || visit.type}
              </span>
              {showTimestamp && (
                <span>{formatTimeAgo(visit.visitedAt)}</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/**
 * 简化的最近访问组件，用于侧边栏底部
 */
export function RecentListCompact({ className = "" }: { className?: string }) {
  const { visits, mounted } = useRecentVisits();

  if (!mounted || visits.length === 0) {
    return null;
  }

  const displayVisits = visits.slice(0, 3);

  return (
    <div className={`border-t border-neutral-800 pt-3 mt-3 ${className}`}>
      <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-2 px-2">
        最近访问
      </div>
      <div className="space-y-1">
        {displayVisits.map((visit) => (
          <Link
            key={`${visit.type}-${visit.slug}`}
            href={getItemHref(visit)}
            className="flex items-center gap-2 px-2 py-1 rounded text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 transition-colors"
          >
            <span>{TYPE_ICONS[visit.type] || "📄"}</span>
            <span className="truncate">{visit.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
