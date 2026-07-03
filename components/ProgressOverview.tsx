"use client";

/**
 * 主页进度概览组件
 * 显示学习统计、推荐节点、track 进度条
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getLearningStats,
  getPersonalizedRecommendations,
  type Stats,
  type Recommendation,
} from "@/lib/recommendations-helpers";
import { ROADMAP_TRACKS } from "@/components/radar/types";
import { TRACK_COLORS } from "@/lib/constants";

export function ProgressOverview() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      const progressJson = localStorage.getItem("techradar_progress");
      const completedDays: Record<string, number[]> = {};

      if (progressJson) {
        try {
          const progress = JSON.parse(progressJson);
          Object.entries(progress.nodes || {}).forEach(([id, node]: [string, any]) => {
            completedDays[id] = node.completedDays || [];
          });
        } catch (e) {
          // 忽略解析错误
        }
      }

      setStats(await getLearningStats(completedDays));
      setRecommendations(await getPersonalizedRecommendations(completedDays, 4));
    };
    loadData();
  }, []);

  if (!mounted || !stats) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-neutral-800 rounded w-1/3"></div>
          <div className="h-8 bg-neutral-800 rounded"></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 bg-neutral-800 rounded"></div>
            <div className="h-16 bg-neutral-800 rounded"></div>
            <div className="h-16 bg-neutral-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const hasProgress = stats.completedDays > 0 || stats.inProgressNodes > 0;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      {/* 顶部统计 */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span>学习进度</span>
          </h2>
          <Link
            href="/roadmap"
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            查看路线图 →
          </Link>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-cyan-400 font-mono">
            {stats.percent}%
          </span>
          <span className="text-sm text-neutral-500">
            ({stats.completedDays} / {stats.totalDays} 天)
          </span>
        </div>

        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-green-400 transition-all duration-500"
            style={{ width: `${stats.percent}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-neutral-800/50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-green-400 font-mono">
              {stats.completedNodes}
            </div>
            <div className="text-xs text-neutral-500 mt-1">已完成节点</div>
          </div>
          <div className="bg-neutral-800/50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400 font-mono">
              {stats.inProgressNodes}
            </div>
            <div className="text-xs text-neutral-500 mt-1">学习中</div>
          </div>
          <div className="bg-neutral-800/50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-neutral-400 font-mono">
              {stats.totalNodes - stats.completedNodes - stats.inProgressNodes}
            </div>
            <div className="text-xs text-neutral-500 mt-1">未开始</div>
          </div>
        </div>
      </div>

      {/* Track 进度 */}
      {hasProgress && (
        <div className="p-6 border-b border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-300 mb-3">各方向进度</h3>
          <div className="space-y-2">
            {ROADMAP_TRACKS.filter(t => stats.trackProgress[t.id]?.total > 0).map(track => {
              const tp = stats.trackProgress[track.id];
              const color = TRACK_COLORS[track.id] || 'text-cyan-400';
              return (
                <div key={track.id} className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${color.text} w-16 shrink-0`}>
                    {track.name}
                  </span>
                  <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${color.solid}`}
                      style={{ width: `${tp.percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-500 font-mono w-12 text-right">
                    {tp.percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 推荐节点 */}
      <div className="p-6">
        <h3 className="text-sm font-bold text-neutral-300 mb-3 flex items-center gap-2">
          <span>🎯</span>
          <span>推荐学习</span>
        </h3>

        {recommendations.length > 0 ? (
          <div className="space-y-2">
            {recommendations.map(rec => {
              const trackColor = TRACK_COLORS[rec.node.track] || { text: 'text-cyan-400', solid: 'bg-cyan-400' };
              return (
                <Link
                  key={rec.node.id}
                  href={`/roadmap?node=${rec.node.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${trackColor.text} font-medium`}>
                        {ROADMAP_TRACKS.find(t => t.id === rec.node.track)?.name || rec.node.track}
                      </span>
                      <span className="text-sm font-medium text-neutral-200 truncate">
                        {rec.node.name}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">{rec.reason}</div>
                  </div>
                  <span className="text-neutral-600 group-hover:text-cyan-400 transition-colors">
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-neutral-500 text-center py-4">
            {hasProgress
              ? '🎉 恭喜！所有可解锁节点都已完成'
              : '开始学习第一个节点来获取推荐'}
          </div>
        )}
      </div>
    </div>
  );
}
