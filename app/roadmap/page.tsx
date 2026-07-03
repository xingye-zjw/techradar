import dynamic from "next/dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "学习路线图 - TechRadar 极客雷达",
  description: "AI 驱动的可视化技术学习路线图，覆盖 CV、NLP、LLM、DevOps、数学、嵌入式、电子等 12 个技术方向。",
  keywords: ["技术路线图", "学习路径", "AI学习", "计算机视觉", "自然语言处理", "大语言模型"],
};

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

// 状态图例颜色（与 RoadmapNode 的 statusStyles 保持一致）
const STATUS_LEGEND = [
  { color: "bg-green-500", label: "已完成", description: "已完成学习" },
  { color: "bg-cyan-500", label: "可学习", description: "前置已满足" },
  { color: "bg-neutral-600", label: "需前置", description: "需要先完成前置节点" },
] as const;

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* 页面标题 */}
        <div className="mb-6">
          <span className="font-mono text-xs tracking-[0.15em] text-green-400 uppercase">
            01 / 路线图
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2">学习路线图</h1>
          <p className="text-sm text-neutral-400 mt-2">
            点击节点切换完成状态 · 进度自动保存在浏览器本地
          </p>
        </div>

        {/* 状态图例 */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 font-mono text-xs">
          {STATUS_LEGEND.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-md"
              title={item.description}
            >
              <span className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-neutral-400">{item.label}</span>
            </div>
          ))}
        </div>

        {/* 操作提示 */}
        <div className="mb-4 flex flex-wrap gap-4 font-mono text-[10px] text-neutral-500">
          <span className="flex items-center gap-1">
            <span className="text-neutral-400">💡</span>
            单击：查看详情 | 双击：切换完成
          </span>
          <span className="flex items-center gap-1">
            <span className="text-neutral-400">🔍</span>
            滚轮缩放 | 拖拽平移
          </span>
        </div>

        {/* 路线图 */}
        <div className="rounded-lg border border-neutral-700 overflow-hidden">
          <RoadmapGraph />
        </div>

        {/* 底部提示 */}
        <div className="mt-6 text-center font-mono text-xs text-neutral-600">
          // 依赖链自动解锁下游节点 · 进度数据存储在浏览器本地
        </div>
      </div>
    </main>
  );
}
