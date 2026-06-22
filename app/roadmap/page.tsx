import dynamic from "next/dynamic";

const RoadmapGraph = dynamic(
  () => import("@/components/radar/RoadmapGraph").then((mod) => mod.RoadmapGraph),
  {
    loading: () => (
      <div className="h-[400px] sm:h-[500px] md:h-[700px] w-full rounded-lg border border-neutral-700 bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="font-mono text-xs text-neutral-500">加载路线图...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6">
          <span className="font-mono text-xs tracking-[0.15em] text-green-400 uppercase">
            01 / 路线图
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2">学习路线图</h1>
          <p className="text-sm text-neutral-400 mt-2">
            点击节点切换完成状态 · 进度自动保存在浏览器本地
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4 mb-8 font-mono text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-md">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span className="text-neutral-400">已完成</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-neutral-400">可学习</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-md">
            <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
            <span className="text-neutral-400">需前置</span>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-700 overflow-hidden">
          <RoadmapGraph />
        </div>

        <div className="mt-8 text-center font-mono text-xs text-neutral-500">
          // 点击节点切换完成状态 · 依赖链自动解锁下游节点
        </div>
      </div>
    </main>
  );
}
