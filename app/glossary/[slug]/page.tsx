import Link from "next/link";
import { notFound } from "next/navigation";
import { getTermBySlug, getRelatedTerms, getAllCategories } from "@/lib/glossary";
import { INTEL_LINKS, TOOL_LINKS, CATEGORY_COLORS } from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { getAllTerms } = await import("@/lib/glossary");
  const terms = getAllTerms();
  return terms.map((term) => ({ slug: term.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const term = getTermBySlug(slug);
  if (!term) return { title: "术语未找到" };
  return {
    title: `${term.name} - TechRadar 术语详解`,
    description: term.summary,
  };
}

export default async function GlossaryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const term = getTermBySlug(slug);

  if (!term) {
    notFound();
  }

  const relatedTerms = getRelatedTerms(slug);
  const categories = getAllCategories();
  const category = categories.find((c) => c.id === term.category);

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Back link */}
      <div className="bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/glossary"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-cyan-400 transition-colors"
          >
            ← 返回术语列表
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-neutral-100">{term.name}</h1>
            {term.nameEn && (
              <span className="text-lg text-neutral-500 font-mono">{term.nameEn}</span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-[10px] px-2 py-1 rounded border font-medium ${
              CATEGORY_COLORS[term.category] || "text-neutral-400 bg-neutral-800 border-neutral-700"
            }`}>
              {category?.name || term.category}
            </span>
            {term.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-1 rounded bg-neutral-800 text-neutral-400 border border-neutral-700"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Summary */}
          <blockquote className="text-lg text-neutral-300 border-l-4 border-cyan-500 pl-4 py-2 bg-cyan-500/5 rounded-r-lg">
            {term.summary}
          </blockquote>
        </header>

        {/* 详细解释 */}
        <section className="mb-10">
          <h2 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-800">
            // 详细解释
          </h2>
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {term.description || term.summary}
            </div>
          </div>
        </section>

        {/* 关联内容 */}
        {(term.relatedIntel.length > 0 || term.relatedTools.length > 0 || term.relatedNodes.length > 0) && (
          <section className="mb-10">
            <h2 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-800">
              // 关联内容
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 关联情报 */}
              {term.relatedIntel.length > 0 && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                  <div className="font-mono text-[10px] text-cyan-400 uppercase mb-3">
                    📰 关联情报
                  </div>
                  <div className="space-y-2">
                    {term.relatedIntel.map((intelSlug) => (
                      <Link
                        key={intelSlug}
                        href={`/intel/${intelSlug}`}
                        className="block text-sm text-neutral-300 hover:text-cyan-400 transition-colors"
                      >
                        {INTEL_LINKS[intelSlug] || intelSlug}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 关联工具 */}
              {term.relatedTools.length > 0 && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                  <div className="font-mono text-[10px] text-purple-400 uppercase mb-3">
                    🧰 关联工具
                  </div>
                  <div className="space-y-2">
                    {term.relatedTools.map((tool) => (
                      <Link
                        key={tool}
                        href="/toolbox"
                        className="block text-sm text-neutral-300 hover:text-purple-400 transition-colors"
                      >
                        {TOOL_LINKS[tool] || tool}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 关联路线图 */}
              {term.relatedNodes.length > 0 && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                  <div className="font-mono text-[10px] text-green-400 uppercase mb-3">
                    🗺️ 关联路线图
                  </div>
                  <div className="space-y-2">
                    {term.relatedNodes.map((nodeId) => (
                      <Link
                        key={nodeId}
                        href={`/roadmap`}
                        className="block text-sm text-neutral-300 hover:text-green-400 transition-colors"
                      >
                        {nodeId}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 关联术语 */}
        {relatedTerms.length > 0 && (
          <section className="mb-10">
            <h2 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-800">
              // 关联术语
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedTerms.map((related) => (
                <Link
                  key={related.slug}
                  href={`/glossary/${related.slug}`}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-neutral-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                >
                  {related.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 参考资料 */}
        {term.resources && term.resources.length > 0 && (
          <section className="mb-10">
            <h2 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-800">
              // 参考资料
            </h2>
            <div className="space-y-3">
              {term.resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-cyan-500/30 transition-all group"
                >
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-500 uppercase">
                    {resource.type}
                  </span>
                  <span className="text-sm text-neutral-300 group-hover:text-cyan-400 transition-colors flex-1">
                    {resource.title}
                  </span>
                  <span className="text-neutral-600 group-hover:text-cyan-400 transition-colors">
                    →
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
