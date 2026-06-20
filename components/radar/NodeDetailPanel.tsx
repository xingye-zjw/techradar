"use client";

import { useEffect, useState } from "react";
import type { RoadmapNode as RoadmapNodeType, DailyTask, ResourceLink, Track } from "./types";
import { ROADMAP_TRACKS } from "./types";

interface NodeDetailPanelProps {
  node: RoadmapNodeType | null;
  onClose: () => void;
}

const STORAGE_KEY = "techradar-task-progress";

const trackColors: Record<string, string> = {
  cv: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  nlp: "text-violet-400 bg-violet-400/10 border-violet-400/30",
  devops: "text-sky-400 bg-sky-400/10 border-sky-400/30",
  math: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  project: "text-pink-400 bg-pink-400/10 border-pink-400/30",
};

function loadTaskProgress(): Record<string, Record<number, boolean>> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function saveTaskProgress(progress: Record<string, Record<number, boolean>>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  const [taskProgress, setTaskProgress] = useState<Record<number, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(5); // 默认显示5天

  useEffect(() => {
    if (node) {
      const all = loadTaskProgress();
      setTaskProgress(all[node.id] || {});
      setVisibleCount(5);
    }
  }, [node]);

  if (!node) return null;

  const track = ROADMAP_TRACKS.find((t) => t.id === node.track);
  const colorStyle = trackColors[node.track] || "text-neutral-400 bg-neutral-800/50 border-neutral-700";
  const trackColorClass = colorStyle.split(" ")[0];

  const toggleTask = (day: number) => {
    const newProgress = { ...taskProgress, [day]: !taskProgress[day] };
    setTaskProgress(newProgress);

    // 持久化
    const all = loadTaskProgress();
    all[node.id] = newProgress;
    saveTaskProgress(all);
  };

  const completedCount = Object.values(taskProgress).filter(Boolean).length;
  const totalCount = node.dailyTasks?.length ?? 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const requiredResources = (task: DailyTask) =>
    task.resources?.filter((r) => r.required) ?? [];
  const optionalResources = (task: DailyTask) =>
    task.resources?.filter((r) => !r.required) ?? [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-neutral-900 border-l border-neutral-700 z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-5 z-10">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-block font-mono text-[10px] px-2 py-0.5 rounded border ${colorStyle.split(" ").slice(1).join(" ")}`}>
                  {track?.name}
                </span>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                  node.status === "completed"
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : node.status === "available"
                    ? "bg-neutral-800 text-neutral-400 border border-neutral-700"
                    : "bg-neutral-800 text-neutral-600 border border-neutral-700"
                }`}>
                  {node.status === "completed" ? "✓ 已完成" : node.status === "available" ? "● 可学习" : "✕ 需前置"}
                </span>
              </div>
              <h2 className="text-xl font-bold text-neutral-100">{node.name}</h2>
              <p className="text-sm text-neutral-400 mt-1 font-mono">{node.duration}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 总体进度条 */}
          {totalCount > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[10px] text-neutral-500">
                <span>每日任务进度</span>
                <span>{completedCount}/{totalCount} 天 ({progressPercent}%)</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* 简介 */}
          {node.description && (
            <section>
              <h3 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-2">// 目标简介</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">{node.description}</p>
            </section>
          )}

          {/* 完成后可做到的事 */}
          {node.outcomes && node.outcomes.length > 0 && (
            <section>
              <h3 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-2">// 完成后可做到</h3>
              <ul className="space-y-1.5">
                {node.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-sm text-neutral-300">
                    <span className="text-green-400 font-mono mt-0.5">✓</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 前置要求 */}
          {node.prerequisites.length > 0 && (
            <section>
              <h3 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-2">// 前置节点</h3>
              <div className="flex flex-wrap gap-2">
                {node.prerequisites.map((prereq) => (
                  <span key={prereq} className="font-mono text-[11px] px-2 py-1 bg-neutral-800 text-neutral-400 rounded border border-neutral-700">
                    {prereq}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 每日学习计划 */}
          {node.dailyTasks && node.dailyTasks.length > 0 && (
            <section>
              <h3 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-3">
                // 📅 每日学习计划（共 {node.dailyTasks.length} 天）
              </h3>
              <div className="space-y-3">
                {node.dailyTasks.slice(0, visibleCount).map((task) => (
                  <div
                    key={task.day}
                    className={`rounded-lg border p-4 transition-all duration-300 ${
                      taskProgress[task.day]
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-neutral-800 bg-neutral-950"
                    }`}
                  >
                    {/* Day header */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTask(task.day)}
                        className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          taskProgress[task.day]
                            ? "bg-green-500 border-green-500"
                            : "border-neutral-600 hover:border-green-400"
                        }`}
                      >
                        {taskProgress[task.day] && (
                          <svg className="w-2.5 h-2.5 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-mono text-[10px] w-6 h-6 rounded flex items-center justify-center font-bold flex-shrink-0 ${
                            colorStyle.split(" ")[1]
                          } ${taskProgress[task.day] ? "opacity-60 line-through" : ""}`}>
                            D{String(task.day).padStart(2, "0")}
                          </span>
                          <span className={`font-semibold text-sm ${taskProgress[task.day] ? "text-neutral-500 line-through" : "text-neutral-200"}`}>
                            {task.title || `第 ${task.day} 天学习任务`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{task.duration || "2-3小时"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content items */}
                    <ul className="space-y-1.5 mb-3 ml-9">
                      {(task.content || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-neutral-400">
                          <span className="text-neutral-600 font-mono mt-0.5 flex-shrink-0">·</span>
                          <span className={taskProgress[task.day] ? "line-through opacity-50" : ""}>{item || "学习内容更新中..."}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Resources: Required */}
                    {requiredResources(task).length > 0 && (
                      <div className="mb-3 ml-9">
                        <div className="font-mono text-[9px] text-green-500/70 uppercase mb-1.5 tracking-wider">必学资源</div>
                        <div className="flex flex-col gap-1">
                          {requiredResources(task).map((r, idx) => (
                            <a
                              key={idx}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-green-400 hover:text-green-300 hover:underline decoration-green-400/50 underline-offset-2"
                            >
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              <span>{r.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources: Optional */}
                    {optionalResources(task).length > 0 && (
                      <div className="mb-3 ml-9">
                        <div className="font-mono text-[9px] text-neutral-500 uppercase mb-1.5 tracking-wider">可选资源</div>
                        <div className="flex flex-col gap-1">
                          {optionalResources(task).map((r, idx) => (
                            <a
                              key={idx}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-400 hover:underline decoration-neutral-600/50 underline-offset-2"
                            >
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              <span>{r.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Checkpoint */}
                    <div className={`pt-2 border-t ml-9 ${taskProgress[task.day] ? "border-green-500/20" : "border-neutral-800/50"}`}>
                      <div className="font-mono text-[9px] text-neutral-600 uppercase mb-1">✓ 完成标准</div>
                      <p className={`text-[11px] ${taskProgress[task.day] ? "text-neutral-500 line-through" : "text-neutral-300"}`}>{task.checkpoint || "独立完成当日内容的学习与练习"}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 加载更多 */}
              {totalCount > visibleCount && (
                <button
                  onClick={() => setVisibleCount((v) => v + 5)}
                  className="w-full mt-3 py-2 text-center font-mono text-xs text-neutral-500 hover:text-cyan-400 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-colors"
                >
                  加载更多任务 ↓
                </button>
              )}
            </section>
          )}

          {/* 无每日任务时的占位提示 */}
          {!node.dailyTasks && (
            <section>
              <div className="text-center py-8">
                <div className="text-3xl mb-3">📋</div>
                <p className="text-sm text-neutral-500">
                  该节点暂无每日学习计划
                </p>
                <p className="text-xs text-neutral-600 mt-1">
                  每日任务正在持续更新中…
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
