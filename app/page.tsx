import Link from "next/link";
import { GlobalSearchBar } from "@/components/GlobalSearchBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <section className="relative w-full min-h-[380px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-neutral-950" />
        <div className="relative z-10 text-center px-6 py-20 max-w-[680px]">
          <div className="inline-block font-mono text-xs tracking-widest uppercase text-green-400 border border-green-400 px-3 py-1 rounded-sm mb-6">
            TRAE AI 创造力大赛
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-green-400">TechRadar</span> 极客雷达
          </h1>
          <p className="text-lg text-neutral-400 max-w-[560px] mx-auto mb-8">
            AI 驱动的大学生硬核开源实战导航系统 — 经过验证的通关攻略，而非知识搬运
          </p>
          <div className="max-w-xl mx-auto">
            <GlobalSearchBar />
            <p className="mt-3 font-mono text-[10px] text-neutral-500">
              全站搜索 · 路线图 / 情报 / 工具 / 踩坑指南 · 试试 Transformer / Docker / LoRA / CUDA
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-[860px] mx-auto px-6 py-12">
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
            href="/search"
            className="group block bg-neutral-900 border border-neutral-700 rounded-lg p-6 hover:border-cyan-400/50 transition-colors"
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-400/10 w-10 h-10 rounded-lg flex items-center justify-center">
                02
              </span>
              <h2 className="text-xl font-bold">技术情报检索</h2>
            </div>
            <p className="text-neutral-400 text-sm">
              模糊搜索 · 关键词索引 · Fuse.js 驱动的实时匹配，支持键盘导航
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
        </div>
      </section>

      <footer className="border-t border-neutral-800 mt-12">
        <div className="max-w-[860px] mx-auto px-6 py-8">
          <div className="flex justify-between items-center flex-wrap gap-4 font-mono text-xs text-neutral-500">
            <span>TechRadar 极客雷达 — TRAE AI 创造力大赛</span>
            <span>Generated with TRAE Work</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
