import Link from "next/link";
import { notFound } from "next/navigation";
import { FULL_ROADMAP } from "@/lib/roadmap-data";
import { INTEL_LINKS, TOOL_LINKS, TRACK_COLORS } from "@/lib/constants";
import type { TrackId } from "@/lib/constants";
import type { DailyTask, TaskContent } from "@/components/radar/types";

interface PageProps {
  params: Promise<{ node: string; day: string }>;
}

export async function generateStaticParams() {
  const params: { node: string; day: string }[] = [];
  for (const node of FULL_ROADMAP) {
    if (node.dailyTasks) {
      for (const task of node.dailyTasks) {
        params.push({ node: node.id, day: String(task.day) });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps) {
  const { node: nodeId, day } = await params;
  const node = FULL_ROADMAP.find((n) => n.id === nodeId);
  if (!node) return { title: "节点未找到" };

  const task = node.dailyTasks?.find((t) => t.day === parseInt(day));
  if (!task) return { title: "任务未找到" };

  return {
    title: `Day ${day}: ${task.title} - ${node.name}`,
    description: typeof task.content === 'object' && 'objective' in task.content
      ? task.content.objective
      : task.title,
  };
}

function renderTaskContent(content: TaskContent | string | string[], isCompleted: boolean = false) {
  if (typeof content === 'string') {
    return (
      <div className="space-y-3">
        {content.split('\n').map((paragraph, idx) => (
          <p key={idx} className={`text-sm text-neutral-300 leading-relaxed ${isCompleted ? "opacity-50 line-through" : ""}`}>
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  if (Array.isArray(content)) {
    return (
      <ul className="space-y-2">
        {content.map((item, idx) => (
          <li key={idx} className={`flex items-start gap-2 text-sm text-neutral-300 ${isCompleted ? "opacity-50 line-through" : ""}`}>
            <span className="text-neutral-600 font-mono mt-0.5 flex-shrink-0">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if ('objective' in content) {
    const taskContent = content as TaskContent;
    return (
      <div className="space-y-4">
        {/* 核心目标 */}
        <div>
          <h4 className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">
            核心目标
          </h4>
          <p className={`text-sm text-neutral-300 leading-relaxed ${isCompleted ? "opacity-50 line-through" : ""}`}>
            {taskContent.objective}
          </p>
        </div>

        {/* 核心 API */}
        {taskContent.api_checklist && taskContent.api_checklist.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider">
              核心 API
            </h4>
            <ul className="space-y-1">
              {taskContent.api_checklist.map((api, idx) => (
                <li key={idx} className={`flex items-start gap-2 text-xs text-neutral-400 ${isCompleted ? "opacity-50 line-through" : ""}`}>
                  <span className="text-neutral-600 font-mono mt-0.5 flex-shrink-0">·</span>
                  <code className="bg-zinc-800 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                    {api}
                  </code>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 场景实操 */}
        {taskContent.practice && (
          <div className={`relative border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-500/10 to-transparent pl-4 pr-3 py-3 rounded-r-lg ${isCompleted ? "opacity-50" : ""}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🎯</span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">场景实操</span>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed">{taskContent.practice}</p>

            {/* 参考答案 */}
            {taskContent.answer && (
              <div className="mt-3 pt-3 border-t border-emerald-500/20">
                <details className="group">
                  <summary className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer list-none">
                    <span className="transition-transform group-open:rotate-90">▶</span>
                    <span className="font-medium">查看参考答案</span>
                  </summary>
                  <pre className="mt-2 p-3 bg-zinc-900/80 rounded-lg border border-zinc-700/50 text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {taskContent.answer}
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default async function DailyTaskPage({ params }: PageProps) {
  const { node: nodeId, day } = await params;
  const node = FULL_ROADMAP.find((n) => n.id === nodeId);

  if (!node) {
    notFound();
  }

  const task = node.dailyTasks?.find((t) => t.day === parseInt(day));

  if (!task) {
    notFound();
  }

  const trackId = node.track as TrackId;
  const trackColor = TRACK_COLORS[trackId] || TRACK_COLORS.devops;
  const colors = { bg: trackColor.bg, border: trackColor.border, text: trackColor.text };

  // 找到前一天和后一天（使用副本避免原地修改 FULL_ROADMAP）
  const sortedTasks = [...(node.dailyTasks || [])].sort((a, b) => a.day - b.day);
  const currentIndex = sortedTasks.findIndex((t) => t.day === task.day);
  const prevTask = currentIndex > 0 ? sortedTasks[currentIndex - 1] : null;
  const nextTask = currentIndex < sortedTasks.length - 1 ? sortedTasks[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-cyan-400 transition-colors mb-4"
          >
            ← 返回路线图
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-block font-mono text-[10px] px-2 py-0.5 rounded border ${colors.bg} ${colors.border} ${colors.text}`}>
              {node.track.toUpperCase()}
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400 font-mono text-sm">{node.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-100 mb-1">
            Day {task.day} / {sortedTasks.length}
          </h1>
          <p className="text-lg text-neutral-300 font-medium">{task.title}</p>
          <div className="flex items-center gap-2 mt-2 font-mono text-xs text-neutral-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>预计时长：{task.duration}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* 任务内容 */}
        <section className="mb-10">
          <h2 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-800">
            // 学习内容
          </h2>
          {renderTaskContent(task.content)}
        </section>

        {/* 推荐资源 */}
        {task.resources && task.resources.length > 0 && (
          <section className="mb-10">
            <h2 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-800">
              // 推荐资源
            </h2>
            <div className="space-y-3">
              {task.resources.filter(r => r.required).length > 0 && (
                <div>
                  <div className="font-mono text-[9px] text-green-500/70 uppercase mb-2 tracking-wider">
                    必学资源
                  </div>
                  <div className="space-y-2">
                    {task.resources.filter(r => r.required).map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-green-500/30 hover:bg-green-500/5 transition-all group"
                      >
                        <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="text-sm text-green-400 group-hover:text-green-300">
                          {resource.title}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {task.resources.filter(r => !r.required).length > 0 && (
                <div>
                  <div className="font-mono text-[9px] text-neutral-500 uppercase mb-2 tracking-wider">
                    可选资源
                  </div>
                  <div className="space-y-2">
                    {task.resources.filter(r => !r.required).map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all group"
                      >
                        <svg className="w-4 h-4 text-neutral-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="text-sm text-neutral-400 group-hover:text-neutral-300">
                          {resource.title}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 完成标准 */}
        <section className="mb-10">
          <h2 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-800">
            // ✓ 完成标准
          </h2>
          <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800">
            <p className="text-sm text-neutral-300">{task.checkpoint}</p>
          </div>
        </section>

        {/* 关联内容 */}
        {node.relatedIntel && node.relatedIntel.length > 0 && (
          <section className="mb-10">
            <h2 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-800">
              // 📰 关联情报
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {node.relatedIntel.map((slug) => (
                <Link
                  key={slug}
                  href={`/intel/${slug}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group"
                >
                  <span className="text-cyan-400">📰</span>
                  <span className="text-sm text-neutral-300 group-hover:text-cyan-400">
                    {INTEL_LINKS[slug] || slug}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {node.relatedTools && node.relatedTools.length > 0 && (
          <section className="mb-10">
            <h2 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-800">
              // 🧰 关联工具
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {node.relatedTools.map((tool) => (
                <Link
                  key={tool}
                  href="/toolbox"
                  className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group"
                >
                  <span className="text-purple-400">🧰</span>
                  <span className="text-sm text-neutral-300 group-hover:text-purple-400">
                    {TOOL_LINKS[tool] || tool}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Footer Navigation */}
      <footer className="bg-neutral-900 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {prevTask ? (
              <Link
                href={`/roadmap/${node.id}/day/${prevTask.day}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-all"
              >
                ← Day {prevTask.day}
                <span className="text-xs text-neutral-500">({prevTask.title.length > 20 ? prevTask.title.slice(0, 20) + '...' : prevTask.title})</span>
              </Link>
            ) : (
              <div />
            )}
            {nextTask ? (
              <Link
                href={`/roadmap/${node.id}/day/${nextTask.day}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 transition-all"
              >
                Day {nextTask.day} →
                <span className="text-xs text-green-500/70">({nextTask.title.length > 20 ? nextTask.title.slice(0, 20) + '...' : nextTask.title})</span>
              </Link>
            ) : (
              <Link
                href="/roadmap"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all"
              >
                ✓ 返回路线图
              </Link>
            )}
          </div>

          {/* Progress indicator */}
          <div className="mt-6 pt-6 border-t border-neutral-800">
            <div className="flex justify-between font-mono text-[10px] text-neutral-500 mb-2">
              <span>{node.name} 进度</span>
              <span>{currentIndex + 1}/{sortedTasks.length} 天</span>
            </div>
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / sortedTasks.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
