import { getAllPitfalls } from "@/lib/pitfall";

export default function PitfallPage() {
  const pitfalls = getAllPitfalls();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <span className="font-mono text-xs tracking-[0.15em] text-red-400 uppercase">
            04 / 避雷
          </span>
          <h1 className="text-3xl font-bold mt-2">踩坑避雷指南</h1>
          <p className="text-sm text-neutral-400 mt-2">
            环境 → 报错 → 排查 → 解决 · 共 {pitfalls.length} 条实战经验
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {pitfalls.map((p) => (
            <div
              key={p.title}
              className="block p-5 bg-neutral-900 border border-neutral-700 rounded-lg hover:border-red-400/40 transition-colors"
            >
              <div className="mb-4">
                <span className="font-mono text-[10px] px-2 py-0.5 bg-red-400/10 text-red-400 rounded-sm">
                  [{p.category}]
                </span>
                <h2 className="text-lg font-bold text-neutral-200 mt-2">
                  {p.title}
                </h2>
              </div>

              {p.quickFix && (
                <div className="mb-4 p-3 bg-red-500/5 border border-red-400/20 rounded-md">
                  <div className="font-mono text-[10px] text-red-400 mb-1">// 快速修复</div>
                  <span className="text-sm text-red-300">{p.quickFix}</span>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <div className="font-mono text-[10px] text-neutral-400 mb-2 tracking-wider">// 现象表现</div>
                  <ul className="text-sm text-neutral-400 leading-relaxed space-y-1.5">
                    {p.symptoms.map((s) => (
                      <li key={s} className="flex items-start gap-2">
                        <span className="text-red-400 font-mono text-xs flex-shrink-0 mt-0.5">×</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-neutral-400 mb-2 tracking-wider">// 排查步骤</div>
                  <ul className="text-sm text-neutral-400 leading-relaxed space-y-1.5">
                    {p.solution.map((s, idx) => (
                      <li key={s} className="flex items-start gap-2">
                        <span className="text-green-400 font-mono text-xs flex-shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-800 flex flex-wrap gap-1.5">
                {p.tags.map((tag) => (
                  <span key={tag} className="font-mono text-[10px] px-1.5 py-0.5 bg-neutral-950 text-neutral-400 rounded-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
