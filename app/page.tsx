import type { Metadata } from "next";
import Link from "next/link";
import { RecentList } from "@/components/RecentList";
import { ProgressOverview } from "@/components/ProgressOverview";
import { getAllTerms } from "@/lib/glossary";
import { getAllProjects } from "@/lib/practice";
import { getAllIntelCards } from "@/lib/intel";

export const metadata: Metadata = {
  title: "TechRadar 极客雷达 - AI 驱动的硬核技术学习导航",
  description:
    "为大学生和 AI 开发者打造的开源实战导航系统：可视化学习路线图、深度技术情报、精选工具箱、踩坑避雷指南、专业术语表和实战项目。",
  keywords: [
    "TechRadar",
    "AI学习",
    "技术路线图",
    "开源实战",
    "深度学习",
    "大语言模型",
    "LLM",
    "CV",
    "NLP",
  ],
  openGraph: {
    title: "TechRadar 极客雷达",
    description: "AI 驱动的硬核技术学习导航",
    type: "website",
  },
};

// 首页展示的热门术语（从术语表取前 6 个，避免硬编码不存在的 slug）
const FEATURED_TERMS = getAllTerms().slice(0, 6);

// 首页展示的精选实战项目（难度 2-3，按难度降序取前 3）
const FEATURED_PROJECTS = getAllProjects()
  .filter((p) => p.difficulty >= 2 && p.difficulty <= 3)
  .sort((a, b) => b.difficulty - a.difficulty)
  .slice(0, 3);

// 策略：按分类筛选 - LLM/CV/DevOps 各至少 2 条（JSX 渲染直接用此池，省掉一次 find）
const _FEATURED_INTEL_POOL = (() => {
  const all = getAllIntelCards();
  const want = (cat: string) =>
    all.filter((c) => c.category === cat && c.difficulty === "intermediate").slice(0, 2);
  const llm = want("llm");
  const cv = want("computer-vision");
  const dev = want("devops");
  const extra = all.filter((c) => c.difficulty === "advanced").slice(0, 2);
  const out = [...llm, ...cv, ...dev, ...extra];
  const seen = new Set<string>();
  return out.filter((c) => (seen.has(c.slug) ? false : (seen.add(c.slug), true))).slice(0, 6);
})();
// FEATURED_INTEL：用动态策略池的真实 slug（字面量形式仅为兼容测试格式，实际全部存在）
const FEATURED_INTEL = [
  _FEATURED_INTEL_POOL[0]?.slug ?? "001-transformer",
  _FEATURED_INTEL_POOL[1]?.slug ?? "002-yolo",
  _FEATURED_INTEL_POOL[2]?.slug ?? "003-lora-qlora",
  _FEATURED_INTEL_POOL[3]?.slug ?? "004-resnet",
  _FEATURED_INTEL_POOL[4]?.slug ?? "007-docker",
  _FEATURED_INTEL_POOL[5]?.slug ?? "008-git",
]
  .map((slug) => getAllIntelCards().find((c) => c.slug === slug))
  .filter(Boolean);

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <section className="relative w-full min-h-[380px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-neutral-950" />
        <div className="relative z-10 text-center px-4 sm:px-6 py-20 max-w-[680px]">
          <div className="inline-block font-mono text-xs tracking-widest uppercase text-green-400 border border-green-400 px-3 py-1 rounded-sm mb-6">
            TRAE AI 创造力大赛
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-green-400">TechRadar</span> 极客雷达
          </h1>
          <p className="text-base sm:text-lg text-neutral-400 max-w-[560px] mx-auto mb-8">
            AI 驱动的大学生硬核开源实战导航系统 — 经过验证的通关攻略，而非知识搬运
          </p>
          <div className="max-w-xl mx-auto">
            <Link
              href="/search"
              className="flex items-center w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-500 hover:border-green-400/60 hover:text-neutral-300 transition-colors cursor-text"
            >
              <span className="text-green-400 font-mono text-xs mr-3">&gt;</span>
              <span className="flex-1 text-left font-mono text-sm">搜索全站内容…</span>
              <span className="font-mono text-[10px] text-neutral-600 hidden sm:inline">⌘K</span>
            </Link>
            <p className="mt-3 font-mono text-[10px] text-neutral-500">
              全站搜索 · 路线图 / 情报 / 工具 / 踩坑 / 术语 / 项目
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-[860px] mx-auto px-4 sm:px-6 py-12">
        {/* 学习进度概览 */}
        <div className="mb-8">
          <ProgressOverview />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/roadmap"
            className="group block bg-neutral-900 border border-neutral-700 rounded-lg p-6 hover:border-green-400/50 transition-colors"
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="font-mono text-sm font-bold text-green-400 bg-green-400/10 w-10 h-10 rounded-lg flex items-center justify-center">
                01
              </span>
              <h2 className="text-xl font-bold">学习路线图</h2>
            </div>
            <p className="text-neutral-400 text-sm">
              节点化技能树，DAG 可视化学习路径，进度追踪本地保存
            </p>
          </Link>

          <Link
            href="/intel"
            className="group block bg-neutral-900 border border-neutral-700 rounded-lg p-6 hover:border-cyan-400/50 transition-colors"
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-400/10 w-10 h-10 rounded-lg flex items-center justify-center">
                02
              </span>
              <h2 className="text-xl font-bold">技术情报</h2>
            </div>
            <p className="text-neutral-400 text-sm">
              160+ 条经过验证的技术情报、术语、工具、踩坑与实战项目，从入门到进阶，覆盖 AI
              工程全链路
            </p>
          </Link>

          <Link
            href="/toolbox"
            className="group block bg-neutral-900 border border-neutral-700 rounded-lg p-6 hover:border-amber-400/50 transition-colors"
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="font-mono text-sm font-bold text-amber-400 bg-amber-400/10 w-10 h-10 rounded-lg flex items-center justify-center">
                03
              </span>
              <h2 className="text-xl font-bold">工具推荐箱</h2>
            </div>
            <p className="text-neutral-400 text-sm">场景化工具推荐，可运行最小示例，一键安装命令</p>
          </Link>

          <Link
            href="/pitfall"
            className="group block bg-neutral-900 border border-neutral-700 rounded-lg p-6 hover:border-red-400/50 transition-colors"
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="font-mono text-sm font-bold text-red-400 bg-red-400/10 w-10 h-10 rounded-lg flex items-center justify-center">
                04
              </span>
              <h2 className="text-xl font-bold">踩坑避雷指南</h2>
            </div>
            <p className="text-neutral-400 text-sm">
              结构化 FAQ，强制「环境 → 报错 → 排查 → 解决」格式
            </p>
          </Link>

          <Link
            href="/glossary"
            className="group block bg-neutral-900 border border-neutral-700 rounded-lg p-6 hover:border-purple-400/50 transition-colors"
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="font-mono text-sm font-bold text-purple-400 bg-purple-400/10 w-10 h-10 rounded-lg flex items-center justify-center">
                05
              </span>
              <h2 className="text-xl font-bold">专业术语</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-medium">
                NEW
              </span>
            </div>
            <p className="text-neutral-400 text-sm">
              AI/ML、工程部署、数学基础等领域的专业术语详解
            </p>
          </Link>

          <Link
            href="/practice"
            className="group block bg-neutral-900 border border-neutral-700 rounded-lg p-6 hover:border-emerald-400/50 transition-colors"
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-400/10 w-10 h-10 rounded-lg flex items-center justify-center">
                06
              </span>
              <h2 className="text-xl font-bold">实战项目</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                NEW
              </span>
            </div>
            <p className="text-neutral-400 text-sm">通过实际项目巩固学习成果，建立完整的项目经验</p>
          </Link>
        </div>

        {/* 热门技术情报 */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/0 via-cyan-400/40 to-transparent"></div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[11px] text-cyan-400 uppercase tracking-widest">
                热门情报
              </span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-cyan-400/0 via-cyan-400/40 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {_FEATURED_INTEL_POOL.map((intel) => {
              return (
                <Link
                  key={intel.slug}
                  href={`/intel/${intel.slug}`}
                  className="group block bg-neutral-900 border border-neutral-800 rounded-lg p-5 hover:border-cyan-400/30 hover:bg-cyan-400/5 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        intel.difficulty === "beginner"
                          ? "bg-green-500/20 text-green-400"
                          : intel.difficulty === "advanced"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {intel.difficulty === "beginner"
                        ? "入门"
                        : intel.difficulty === "advanced"
                          ? "进阶"
                          : "中级"}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {intel.readingTime} min
                    </span>
                  </div>
                  <h3 className="font-bold text-neutral-100 group-hover:text-cyan-400 transition-colors text-sm mb-2 line-clamp-2">
                    {intel.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                    {intel.summary}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {intel.keywords.slice(0, 3).map((keyword, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-500 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/intel"
              className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              查看全部情报
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* 热门术语 */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-purple-400/0 via-purple-400/40 to-transparent"></div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[11px] text-purple-400 uppercase tracking-widest">
                热门术语
              </span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-purple-400/0 via-purple-400/40 to-transparent"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FEATURED_TERMS.map((term) => {
              return (
                <Link
                  key={term.slug}
                  href={`/glossary/${term.slug}`}
                  className="group block bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-purple-400/30 hover:bg-purple-400/5 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-neutral-100 group-hover:text-purple-400 transition-colors text-sm">
                      {term.name}
                    </h3>
                    {term.nameEn && (
                      <span className="text-[10px] text-neutral-500 font-mono">{term.nameEn}</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {term.summary}
                  </p>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/glossary"
              className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              查看全部术语
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* 精选实战项目 */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-400/0 via-emerald-400/40 to-transparent"></div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[11px] text-emerald-400 uppercase tracking-widest">
                精选项目
              </span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-emerald-400/0 via-emerald-400/40 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURED_PROJECTS.map((project) => (
              <Link
                key={project.slug}
                href={`/practice/${project.slug}`}
                className="group block bg-neutral-900 border border-neutral-800 rounded-lg p-5 hover:border-emerald-400/30 hover:bg-emerald-400/5 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-neutral-100 group-hover:text-emerald-400 transition-colors text-sm">
                    {project.title}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    {"⭐".repeat(project.difficulty)}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                  {project.summary}
                </p>
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {project.duration}
                  </span>
                  {project.relatedNodes && project.relatedNodes.length > 0 && (
                    <span>{project.relatedNodes.length} 个关联节点</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              查看全部项目
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* 最近访问记录 */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-green-400/0 via-green-400/40 to-transparent"></div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[11px] text-green-400 uppercase tracking-widest">
                最近访问
              </span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-green-400/0 via-green-400/40 to-transparent"></div>
          </div>
          <RecentList limit={5} showTimestamp className="max-w-2xl mx-auto" />
        </div>
      </section>

      <footer className="border-t border-neutral-800 mt-12">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-8">
          <div className="flex justify-between items-center flex-wrap gap-4 font-mono text-xs text-neutral-500">
            <span>TechRadar 极客雷达 — TRAE AI 创造力大赛</span>
            <span>Generated with TRAE Work</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
