import Link from "next/link";
import { RecentList } from "@/components/RecentList";
import { getAllTerms } from "@/lib/glossary";

// 首页展示的热门术语（精选 6 个）
const FEATURED_TERMS = ["transformer", "docker", "lora", "cnn", "pytorch", "git"];

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
              全站搜索 · 路线图 / 情报 / 工具 / 踩坑 / 术语
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-[860px] mx-auto px-4 sm:px-6 py-12">
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
              18 条经过验证的技术情报，从入门到进阶，覆盖 AI 工程全链路
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
            <p className="text-neutral-400 text-sm">
              场景化工具推荐，可运行最小示例，一键安装命令
            </p>
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
            {FEATURED_TERMS.map((slug) => {
              const term = getAllTerms().find((t) => t.slug === slug);
              if (!term) return null;
              return (
                <Link
                  key={slug}
                  href={`/glossary/${slug}`}
                  className="group block bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-purple-400/30 hover:bg-purple-400/5 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-neutral-100 group-hover:text-purple-400 transition-colors text-sm">
                      {term.name}
                    </h3>
                    {term.nameEn && (
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {term.nameEn}
                      </span>
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
