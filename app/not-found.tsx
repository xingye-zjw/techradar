import Link from "next/link";

const FEATURED_INTEL = [
  { slug: "001-transformer", title: "Transformer 架构详解", subtitle: "理解 Attention 机制的基石" },
  { slug: "002-yolo", title: "YOLO 目标检测", subtitle: "从零掌握实时目标检测算法" },
  { slug: "003-lora-qlora", title: "LoRA/QLoRA 微调", subtitle: "低成本大模型微调技术实战" },
];

export default function NotFound() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
      <div className="text-center px-6 py-12">
        <div className="font-mono text-8xl font-bold text-green-400/20 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-3">页面未找到</h1>
        <p className="text-neutral-400 mb-8 max-w-md mx-auto">
          你访问的页面不存在，可能已被移动或删除。
        </p>

        <div className="max-w-md mx-auto mb-10">
          <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-wider mb-4 text-left">
            {"// 可能你要找的热门情报"}
          </h2>
          <div className="space-y-3">
            {FEATURED_INTEL.map((item) => (
              <Link
                key={item.slug}
                href={`/intel/${item.slug}`}
                className="block text-left p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group"
              >
                <div className="font-mono text-[10px] text-cyan-400 mb-1">📰 {item.slug}</div>
                <div className="text-sm font-medium text-neutral-200 group-hover:text-cyan-400 transition-colors mb-1">
                  {item.title}
                </div>
                <div className="text-xs text-neutral-500">{item.subtitle}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="font-mono text-sm px-4 py-2 bg-green-400/10 text-green-400 border border-green-400/30 rounded-sm hover:bg-green-400/20 transition-colors"
          >
            返回首页
          </Link>
          <Link
            href="/search"
            className="font-mono text-sm px-4 py-2 bg-neutral-900 text-neutral-400 border border-neutral-800 rounded-sm hover:border-neutral-600 transition-colors"
          >
            去搜索
          </Link>
        </div>
      </div>
    </main>
  );
}
