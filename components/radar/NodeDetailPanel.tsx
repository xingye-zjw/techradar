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
import type { ResourceSource, ResourceType } from "./types";
import { getProjectsByNode, getDifficultyStars } from "@/lib/practice";

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

/** 获取资源来源平台的图标和颜色 */
function getSourceInfo(source?: ResourceSource): { icon: string; color: string; label: string } {
  switch (source) {
    case "bilibili":
      return { icon: "📺", color: "text-pink-400", label: "B站" };
    case "youtube":
      return { icon: "🎬", color: "text-red-400", label: "YouTube" };
    case "github":
      return { icon: "🐙", color: "text-neutral-300", label: "GitHub" };
    case "official":
      return { icon: "📚", color: "text-blue-400", label: "官方" };
    case "zhihu":
      return { icon: "💡", color: "text-blue-500", label: "知乎" };
    case "juejin":
      return { icon: "📝", color: "text-cyan-400", label: "掘金" };
    case "academic":
      return { icon: "📄", color: "text-emerald-400", label: "论文" };
    case "blog":
      return { icon: "🌐", color: "text-teal-400", label: "博客" };
    default:
      return { icon: "🔗", color: "text-neutral-400", label: "" };
  }
}

/** 获取资源类型的标签 */
function getTypeLabel(type?: ResourceType): { label: string; color: string } {
  switch (type) {
    case "video":
      return { label: "视频", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" };
    case "article":
      return { label: "文章", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    case "doc":
      return { label: "文档", color: "bg-green-500/20 text-green-400 border-green-500/30" };
    case "code":
      return { label: "代码", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
    case "tool":
      return { label: "工具", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
    case "book":
      return { label: "书籍", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    case "repo":
      return { label: "仓库", color: "bg-neutral-500/20 text-neutral-300 border-neutral-500/30" };
    case "paper":
      return { label: "论文", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
    default:
      return { label: "", color: "" };
  }
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
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());

  // 展开/折叠任务
  const toggleExpand = (day: number) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  // 获取所有术语（用于术语高亮）
  const allTerms = useMemo(() => getAllTerms(), []);

  // 获取当前节点的术语
  const nodeTerms = useMemo(() => {
    if (!node?.relatedTerms) return [];
    return getTermsBySlugs(node.relatedTerms);
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

  // 获取关联的实战项目
  const relatedProjects = getProjectsByNode(node.id);

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
              <div className="flex items-center gap-3 mt-2">
                {node.difficulty && (
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                    node.difficulty === 'beginner'
                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                      : node.difficulty === 'intermediate'
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}>
                    {node.difficulty === 'beginner' ? '初级' : node.difficulty === 'intermediate' ? '中级' : '高级'}
                  </span>
                )}
                <span className="font-mono text-[10px] text-neutral-500">
                  ⏱️ {node.duration}
                </span>
              </div>
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

          {/* 学习建议 */}
          {node.suggestions && (
            <section>
              <h3 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-2">// 💡 学习建议</h3>

              {/* 前置知识 */}
              {node.suggestions.prerequisites && node.suggestions.prerequisites.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-neutral-400 mb-2">📚 前置知识</h4>
                  <ul className="space-y-1.5">
                    {node.suggestions.prerequisites.map((prereq, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 后续学习 */}
              {node.suggestions.nextSteps && node.suggestions.nextSteps.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-neutral-400 mb-2">🎯 后续学习</h4>
                  <ul className="space-y-1.5">
                    {node.suggestions.nextSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                        <span className="text-emerald-400 mt-0.5">→</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 学习路径 */}
              {node.suggestions.learningPath && node.suggestions.learningPath.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-neutral-400 mb-2">🛤️ 推荐路径</h4>
                  <div className="flex flex-wrap gap-2">
                    {node.suggestions.learningPath.map((path, idx) => (
                      <span key={idx} className="font-mono text-[10px] px-2 py-1 bg-purple-500/10 text-purple-400 rounded border border-purple-500/30">
                        {path}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* 关联内容分组显示 */}
          {(nodeTerms.length > 0 || (node.relatedIntel && node.relatedIntel.length > 0) || (node.relatedTools && node.relatedTools.length > 0) || relatedProjects.length > 0) && (
            <section>
              <h3 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-3">// 🔗 关联内容</h3>

              <div className="space-y-4">
                {/* 关联情报 */}
                {node.relatedIntel && node.relatedIntel.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-cyan-400 text-sm">📰</span>
                      <span className="text-xs font-semibold text-neutral-400">情报</span>
                      <span className="font-mono text-[10px] text-neutral-600">({node.relatedIntel.length})</span>
                    </div>
                    <div className="space-y-2">
                      {node.relatedIntel.map((slug) => (
                        <Link
                          key={slug}
                          href={`/intel/${slug}`}
                          className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group hover-lift-subtle"
                        >
                          <span className="text-xs text-neutral-300 group-hover:text-cyan-400 transition-colors flex-1">
                            {INTEL_LINKS[slug] || slug}
                          </span>
                          <span className="text-[10px] text-neutral-600 group-hover:text-cyan-400 transition-colors">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 关联术语 */}
                {nodeTerms.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-400 text-sm">📖</span>
                      <span className="text-xs font-semibold text-neutral-400">术语</span>
                      <span className="font-mono text-[10px] text-neutral-600">({nodeTerms.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {nodeTerms.map((term) => (
                        <Link
                          key={term.slug}
                          href={`/glossary/${term.slug}`}
                          className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                        >
                          {term.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 关联工具 */}
                {node.relatedTools && node.relatedTools.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-purple-400 text-sm">🔧</span>
                      <span className="text-xs font-semibold text-neutral-400">工具</span>
                      <span className="font-mono text-[10px] text-neutral-600">({node.relatedTools.length})</span>
                    </div>
                    <div className="space-y-2">
                      {node.relatedTools.map((toolName) => (
                        <Link
                          key={toolName}
                          href="/toolbox"
                          className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group hover-lift-subtle"
                        >
                          <span className="text-xs text-neutral-300 group-hover:text-purple-400 transition-colors flex-1">
                            {TOOL_LINKS[toolName] || toolName}
                          </span>
                          <span className="text-[10px] text-neutral-600 group-hover:text-purple-400 transition-colors">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 实战项目 */}
                {relatedProjects.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-400 text-sm">🚀</span>
                      <span className="text-xs font-semibold text-neutral-400">实战项目</span>
                      <span className="font-mono text-[10px] text-neutral-600">({relatedProjects.length})</span>
                    </div>
                    <div className="space-y-2">
                      {relatedProjects.map((project) => (
                        <Link
                          key={project.slug}
                          href={`/practice/${project.slug}`}
                          className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group hover-lift-subtle"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-neutral-300 group-hover:text-emerald-400 transition-colors block truncate">
                              {project.title}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-neutral-500">{getDifficultyStars(project.difficulty)}</span>
                              <span className="text-[10px] text-neutral-600">|</span>
                              <span className="text-[10px] text-neutral-500">{project.duration}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-neutral-600 group-hover:text-emerald-400 transition-colors">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 每日学习计划 */}
          {node.dailyTasks && node.dailyTasks.length > 0 && (
            <section>
              <h3 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-3">
                // 📅 每日学习计划（共 {node.dailyTasks.length} 天）
              </h3>
              <div className="space-y-2">
                {node.dailyTasks.slice(0, visibleCount).map((task) => {
                  const isExpanded = expandedTasks.has(task.day);
                  return (
                    <div
                      key={task.day}
                      className={`rounded-lg border transition-all duration-300 ${
                        taskProgress[task.day]
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-neutral-800 bg-neutral-950"
                      }`}
                    >
                      {/* 可点击的头部区域 */}
                      <div
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-neutral-800/30 transition-colors"
                        onClick={() => toggleExpand(task.day)}
                      >
                        {/* Checkbox - 阻止事件冒泡 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(task.day);
                          }}
                          className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
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

                        {/* 日期标签 */}
                        <span className={`font-mono text-[10px] w-6 h-6 rounded flex items-center justify-center font-bold flex-shrink-0 ${
                          colorStyle.split(" ")[1]
                        } ${taskProgress[task.day] ? "opacity-60 line-through" : ""}`}>
                          D{String(task.day).padStart(2, "0")}
                        </span>

                        {/* 标题和时长 */}
                        <div className="flex-1 min-w-0">
                          <span className={`font-semibold text-sm ${taskProgress[task.day] ? "text-neutral-500 line-through" : "text-neutral-200"}`}>
                            {task.title || `第 ${task.day} 天学习任务`}
                          </span>
                          <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500 mt-0.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{task.duration || "2-3小时"}</span>
                          </div>
                        </div>

                        {/* 展开/折叠箭头 */}
                        <svg
                          className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {/* 可折叠的内容区域 */}
                      {isExpanded && (
                        <div className="px-3 pb-3 border-t border-neutral-800/50">
                          {/* Content items */}
                          <div className="mt-3 ml-6 sm:ml-9">
                            {task.content && typeof task.content === 'object' && !Array.isArray(task.content) && 'objective' in task.content ? (
                              /* 新格式：结构化内容 */
                              <div className="space-y-3">
                                {/* 核心目标 */}
                                <div>
                                  <h4 className="text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider">核心目标</h4>
                                  <p className={`text-xs text-neutral-400 leading-relaxed ${taskProgress[task.day] ? "line-through opacity-50" : ""}`}>
                                    {renderTextWithTerms(task.content.objective ?? "", allTerms, node.id)}
                                  </p>
                                </div>

                                {/* 核心要点 */}
                                {task.content.key_points && task.content.key_points.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider">核心要点</h4>
                                    <ul className="space-y-1">
                                      {task.content.key_points.map((api, idx) => (
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
                                    <p className="text-sm text-zinc-200 leading-relaxed">{renderTextWithTerms(task.content.practice ?? "", allTerms, node.id)}</p>

                                    {/* 查看答案折叠面板 */}
                                    {task.content.deep_dive && (
                                      <div className="mt-3 pt-3 border-t border-emerald-500/20">
                                        <button
                                          onClick={() => setExpandedAnswers(prev => ({ ...prev, [task.day]: !prev[task.day] }))}
                                          className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                                        >
                                          <span>{expandedAnswers[task.day] ? "🔽" : "▶️"}</span>
                                          <span className="font-medium">{expandedAnswers[task.day] ? "收起拓展" : "查看深入拓展"}</span>
                                        </button>
                                        {expandedAnswers[task.day] && (
                                          <div className="mt-2 p-3 bg-zinc-900/80 rounded-lg border border-zinc-700/50">
                                            <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                                              {task.content.deep_dive}
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
                            <div className="mt-3 ml-6 sm:ml-9">
                              <div className="font-mono text-[9px] text-green-500/70 uppercase mb-1.5 tracking-wider">必学资源</div>
                              <div className="flex flex-col gap-1.5">
                                {requiredResources(task).map((r, idx) => {
                                  const mirror = getMirrorHint(r.url);
                                  const sourceInfo = getSourceInfo(r.source);
                                  const typeInfo = getTypeLabel(r.type);
                                  return (
                                    <div key={idx} className="group">
                                      <a
                                        href={r.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-xs text-green-400 hover:text-green-300 hover:underline decoration-green-400/50 underline-offset-2"
                                      >
                                        <span className="text-sm">{sourceInfo.icon}</span>
                                        <span className="flex-1">{r.title}</span>
                                        {r.duration && (
                                          <span className="font-mono text-[10px] text-neutral-500">{r.duration}</span>
                                        )}
                                        {typeInfo.label && (
                                          <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${typeInfo.color}`}>
                                            {typeInfo.label}
                                          </span>
                                        )}
                                      </a>
                                      {mirror.needsMirror && (
                                        <div className="ml-6 mt-0.5 text-[10px] text-amber-400/70">
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
                            <div className="mt-3 ml-6 sm:ml-9">
                              <div className="font-mono text-[9px] text-neutral-500 uppercase mb-1.5 tracking-wider">可选资源</div>
                              <div className="flex flex-col gap-1.5">
                                {optionalResources(task).map((r, idx) => {
                                  const mirror = getMirrorHint(r.url);
                                  const sourceInfo = getSourceInfo(r.source);
                                  const typeInfo = getTypeLabel(r.type);
                                  return (
                                    <div key={idx} className="group">
                                      <a
                                        href={r.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-400 hover:underline decoration-neutral-600/50 underline-offset-2"
                                      >
                                        <span className="text-sm">{sourceInfo.icon}</span>
                                        <span className="flex-1">{r.title}</span>
                                        {r.duration && (
                                          <span className="font-mono text-[10px] text-neutral-500">{r.duration}</span>
                                        )}
                                        {typeInfo.label && (
                                          <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${typeInfo.color}`}>
                                            {typeInfo.label}
                                          </span>
                                        )}
                                      </a>
                                      {mirror.needsMirror && (
                                        <div className="ml-6 mt-0.5 text-[10px] text-amber-400/70">
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
                          <div className={`mt-3 pt-2 border-t ml-6 sm:ml-9 ${taskProgress[task.day] ? "border-green-500/20" : "border-neutral-800/50"}`}>
                            <div className="font-mono text-[9px] text-neutral-600 uppercase mb-1">✓ 完成标准</div>
                            <p className={`text-[11px] ${taskProgress[task.day] ? "text-neutral-500 line-through" : "text-neutral-300"}`}>
                              {renderTextWithTerms(task.checkpoint || "独立完成当日内容的学习与练习", allTerms, node.id)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
