"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { RoadmapNode as RoadmapNodeType, DailyTask, ResourceLink, Track, TaskContent } from "./types";
import { ROADMAP_TRACKS } from "./types";
import { TermPopover } from "@/components/TermPopover";
import { INTEL_LINKS, TOOL_LINKS, getTrackColorClasses } from "@/lib/constants";
import type { TrackId } from "@/lib/constants";
import { getTermByName, identifyTermsInText, getMirrorHint } from "@/lib/terms";
import { getAllTerms, getTermsBySlugs, type GlossaryTerm } from "@/lib/glossary";
import { toast } from "@/components/Toast";

interface NodeDetailPanelProps {
  node: RoadmapNodeType | null;
  onClose: () => void;
  onToggleComplete?: (nodeId: string) => void;
}

const STORAGE_KEY = "techradar-task-progress";

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

/** 渲染 API 项，将函数名用 code 标签高亮 */
function renderApiItem(item: string) {
  const parts = item.split(/(\w+\([^)]*\))/g);
  return parts.map((part, idx) => {
    if (/^\w+\([^)]*\)$/.test(part)) {
      return (
        <code key={idx} className="bg-zinc-800 text-cyan-300 font-mono px-1.5 py-0.5 rounded text-[11px]">
          {part}
        </code>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

/** 渲染带有术语 Tooltip 的文本 */
function renderTextWithTerms(text: string, terms: GlossaryTerm[], nodeId?: string) {
  const parts = identifyTermsInText(text, nodeId);
  return parts.map((part, idx) => {
    if (part.type === "term" && part.term) {
      // 查找对应的 GlossaryTerm
      const glossaryTerm = terms.find(
        (t) => t.name === part.term?.term || t.nameEn === part.term?.term
      );
      if (glossaryTerm) {
        return (
          <TermPopover key={idx} term={glossaryTerm} showRelated>
            {part.content}
          </TermPopover>
        );
      }
      // 回退到旧的 TermTooltip 样式
      return (
        <span
          key={idx}
          className="inline cursor-pointer border-b border-dashed border-cyan-400/50 text-cyan-400"
        >
          {part.content}
        </span>
      );
    }
    return <span key={idx}>{part.content}</span>;
  });
}

export function NodeDetailPanel({ node, onClose, onToggleComplete }: NodeDetailPanelProps) {
  const [taskProgress, setTaskProgress] = useState<Record<number, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedAnswers, setExpandedAnswers] = useState<Record<number, boolean>>({});

  // 获取所有术语（用于术语高亮）
  const allTerms = useMemo(() => getAllTerms(), []);

  // 获取当前节点的术语
  const nodeTerms = useMemo(() => {
    if (!node?.relatedIntel) return [];
    // 通过节点关联的术语 slug 获取
    const termSlugs = node.relatedIntel || [];
    return getTermsBySlugs(termSlugs);
  }, [node]);

  useEffect(() => {
    if (node) {
      const all = loadTaskProgress();
      setTaskProgress(all[node.id] || {});
      setVisibleCount(5);
    }
  }, [node]);

  if (!node) return null;

  const track = ROADMAP_TRACKS.find((t) => t.id === node.track);
  const colorStyle = getTrackColorClasses(node.track as TrackId) || "text-neutral-400 bg-neutral-800/50 border-neutral-700";
  const trackColorClass = colorStyle.split(" ")[0];

  const toggleTask = (day: number) => {
    const wasCompleted = taskProgress[day];
    const newProgress = { ...taskProgress, [day]: !wasCompleted };
    setTaskProgress(newProgress);

    const all = loadTaskProgress();
    all[node.id] = newProgress;
    saveTaskProgress(all);

    if (!wasCompleted) {
      toast.success(`第 ${day} 天任务已标记完成！`, 2000);
    } else {
      toast.info(`第 ${day} 天任务已取消完成`, 2000);
    }
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
              className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 transition-colors flex-shrink-0"
              aria-label="关闭"
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

          {/* 标记完成按钮 */}
          {onToggleComplete && (
            <button
              onClick={() => onToggleComplete(node.id)}
              className={`w-full mt-3 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                node.status === "completed"
                  ? "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700 hover:text-neutral-300"
                  : "bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 hover:border-green-500/70"
              }`}
            >
              {node.status === "completed" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  已完成 - 点击取消
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  标记为已完成
                </span>
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-6">
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

          {/* 本节术语 */}
          {nodeTerms.length > 0 && (
            <section>
              <h3 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-2">// 📖 本节术语</h3>
              <div className="flex flex-wrap gap-2">
                {nodeTerms.map((term) => (
                  <Link
                    key={term.slug}
                    href={`/glossary/${term.slug}`}
                    className="text-xs px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
                  >
                    {term.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 关联情报 */}
          {node.relatedIntel && node.relatedIntel.length > 0 && (
            <section>
              <h3 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-2">// 📰 关联情报</h3>
              <div className="space-y-2">
                {node.relatedIntel.map((slug) => (
                  <Link
                    key={slug}
                    href={`/intel/${slug}`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group hover-lift-subtle"
                  >
                    <span className="text-cyan-400 text-sm">📰</span>
                    <span className="text-xs text-neutral-300 group-hover:text-cyan-400 transition-colors flex-1">
                      {INTEL_LINKS[slug] || slug}
                    </span>
                    <span className="text-[10px] text-neutral-600 group-hover:text-cyan-400 transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 关联工具 */}
          {node.relatedTools && node.relatedTools.length > 0 && (
            <section>
              <h3 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-2">// 🔧 关联工具</h3>
              <div className="space-y-2">
                {node.relatedTools.map((toolName) => (
                  <Link
                    key={toolName}
                    href="/toolbox"
                    className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group hover-lift-subtle"
                  >
                    <span className="text-purple-400 text-sm">🔧</span>
                    <span className="text-xs text-neutral-300 group-hover:text-purple-400 transition-colors flex-1">
                      {TOOL_LINKS[toolName] || toolName}
                    </span>
                    <span className="text-[10px] text-neutral-600 group-hover:text-purple-400 transition-colors">→</span>
                  </Link>
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
                    className={`rounded-lg border p-4 transition-all duration-300 hover-lift ${
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
                        aria-label={`标记第 ${task.day} 天为${taskProgress[task.day] ? "未完成" : "已完成"}`}
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
                    <div className="mb-3 ml-6 sm:ml-9">
                      {task.content && typeof task.content === 'object' && !Array.isArray(task.content) && 'objective' in task.content ? (
                        /* 新格式：结构化内容 */
                        <div className="space-y-3">
                          {/* 核心目标 */}
                          <div>
                            <h4 className="text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider">核心目标</h4>
                            <p className={`text-xs text-neutral-400 leading-relaxed ${taskProgress[task.day] ? "line-through opacity-50" : ""}`}>
                              {renderTextWithTerms(task.content.objective, allTerms, node.id)}
                            </p>
                          </div>

                          {/* 核心 API */}
                          {task.content.api_checklist && task.content.api_checklist.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider">核心 API</h4>
                              <ul className="space-y-1">
                                {task.content.api_checklist.map((api, idx) => (
                                  <li key={idx} className={`flex items-start gap-2 text-xs text-neutral-400 ${taskProgress[task.day] ? "line-through opacity-50" : ""}`}>
                                    <span className="text-neutral-600 font-mono mt-0.5 flex-shrink-0">·</span>
                                    <span>{renderApiItem(api)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* 场景实操 */}
                          {task.content.practice && (
                            <div className={`relative border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-500/10 to-transparent pl-4 pr-3 py-3 rounded-r-lg ${taskProgress[task.day] ? "opacity-50" : ""}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-base">🎯</span>
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">场景实操</span>
                              </div>
                              <p className="text-sm text-zinc-200 leading-relaxed">{renderTextWithTerms(task.content.practice, allTerms, node.id)}</p>

                              {/* 查看答案折叠面板 */}
                              {task.content.answer && (
                                <div className="mt-3 pt-3 border-t border-emerald-500/20">
                                  <button
                                    onClick={() => setExpandedAnswers(prev => ({ ...prev, [task.day]: !prev[task.day] }))}
                                    className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                                  >
                                    <span>{expandedAnswers[task.day] ? "🔽" : "▶️"}</span>
                                    <span className="font-medium">{expandedAnswers[task.day] ? "收起答案" : "查看参考答案"}</span>
                                  </button>
                                  {expandedAnswers[task.day] && (
                                    <div className="mt-2 p-3 bg-zinc-900/80 rounded-lg border border-zinc-700/50">
                                      <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                                        {task.content.answer}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : typeof task.content === 'string' ? (
                        /* 旧格式：字符串 */
                        <p className={`text-xs text-neutral-400 leading-relaxed ${taskProgress[task.day] ? "line-through opacity-50" : ""}`}>
                          {renderTextWithTerms(task.content, allTerms, node.id)}
                        </p>
                      ) : Array.isArray(task.content) ? (
                        /* 旧格式：数组 */
                        <ul className="space-y-1.5">
                          {(task.content || []).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-neutral-400">
                              <span className="text-neutral-600 font-mono mt-0.5 flex-shrink-0">·</span>
                              <span className={taskProgress[task.day] ? "line-through opacity-50" : ""}>
                                {renderTextWithTerms(item || "学习内容更新中...", allTerms, node.id)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    {/* Resources: Required */}
                    {requiredResources(task).length > 0 && (
                      <div className="mb-3 ml-9">
                        <div className="font-mono text-[9px] text-green-500/70 uppercase mb-1.5 tracking-wider">必学资源</div>
                        <div className="flex flex-col gap-1">
                          {requiredResources(task).map((r, idx) => {
                            const mirror = getMirrorHint(r.url);
                            return (
                              <div key={idx}>
                                <a
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
                                {mirror.needsMirror && (
                                  <div className="ml-5 mt-0.5 text-[10px] text-amber-400/70">
                                    💡 {mirror.hint}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Resources: Optional */}
                    {optionalResources(task).length > 0 && (
                      <div className="mb-3 ml-9">
                        <div className="font-mono text-[9px] text-neutral-500 uppercase mb-1.5 tracking-wider">可选资源</div>
                        <div className="flex flex-col gap-1">
                          {optionalResources(task).map((r, idx) => {
                            const mirror = getMirrorHint(r.url);
                            return (
                              <div key={idx}>
                                <a
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
                                {mirror.needsMirror && (
                                  <div className="ml-5 mt-0.5 text-[10px] text-amber-400/70">
                                    💡 {mirror.hint}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Checkpoint */}
                    <div className={`pt-2 border-t ml-9 ${taskProgress[task.day] ? "border-green-500/20" : "border-neutral-800/50"}`}>
                      <div className="font-mono text-[9px] text-neutral-600 uppercase mb-1">✓ 完成标准</div>
                      <p className={`text-[11px] ${taskProgress[task.day] ? "text-neutral-500 line-through" : "text-neutral-300"}`}>
                        {renderTextWithTerms(task.checkpoint || "独立完成当日内容的学习与练习", allTerms, node.id)}
                      </p>
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
