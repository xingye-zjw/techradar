import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllIntelCards, getIntelCardBySlug } from "@/lib/intel";
// MarkdownRenderer: Client Component (仅渲染)；extractToc: Server-safe 纯函数
import { MarkdownRenderer } from "@/components/radar/MarkdownRenderer";
import { extractToc } from "@/lib/markdown-utils";
import { getAllTerms, getTermsBySlugs, type GlossaryTerm } from "@/lib/glossary";
import { difficultyMeta, categoryMeta } from "@/lib/intel-meta";

export function generateStaticParams() {
  const cards = getAllIntelCards();
  return cards.map((card) => ({ slug: card.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const card = getIntelCardBySlug(params.slug);
  if (!card) return { title: "未找到" };
  const cat = categoryMeta[card.category] || categoryMeta.uncategorized;
  return {
    title: `${card.title} — TechRadar 技术情报`,
    description: card.summary,
    keywords: card.keywords,
    openGraph: {
      title: `${card.title} — TechRadar`,
      description: card.summary,
      type: "article",
    },
  };
}

function getTakeaways(card: ReturnType<typeof getIntelCardBySlug>): string[] {
  if (!card) return [];
  if (card.takeaways && card.takeaways.length > 0) return card.takeaways;
  return [
    `理解${card.title}技术的核心思想与适用场景`,
    `掌握关键组件的工作原理与实现要点`,
    `能够独立完成一个最小可运行的 Demo`,
    `了解常见坑点与最佳实践`,
  ];
}

function findRelated(currentSlug: string, allCards: ReturnType<typeof getAllIntelCards>) {
  const current = allCards.find((c) => c.slug === currentSlug);
  if (!current) return [];
  const scored = allCards
    .filter((c) => c.slug !== currentSlug)
    .map((c) => {
      let score = 0;
      if (c.category === current.category) score += 3;
      const sharedKw = c.keywords.filter((k) => current.keywords.includes(k)).length;
      score += sharedKw;
      if (c.difficulty === current.difficulty) score += 1;
      return { card: c, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  if (scored.length === 0)
    return allCards
      .filter((c) => c.slug !== currentSlug)
      .slice(-3)
      .map((c) => ({ card: c, score: 1 }));
  return scored;
}

export default function IntelPage({ params }: { params: { slug: string } }) {
  const card = getIntelCardBySlug(params.slug);
  if (!card) notFound();

  const allCards = getAllIntelCards();
  const takeaways = getTakeaways(card);
  const related = findRelated(card.slug, allCards);

  // extractToc 来自 lib/markdown-utils.ts（无 "use client"，Server-safe）
  const toc = extractToc(card.content);

  // 相关术语：优先使用 frontmatter 的 relatedTerms，否则按关键词在 glossary 里匹配
  const relatedTerms: GlossaryTerm[] =
    card.relatedTerms && card.relatedTerms.length > 0
      ? getTermsBySlugs(card.relatedTerms).slice(0, 4)
      : (() => {
          const kws = new Set(card.keywords.map((k) => k.toLowerCase()));
          if (kws.size === 0) return [];
          return getAllTerms()
            .filter((t) => kws.has(t.name.toLowerCase()))
            .slice(0, 4);
        })();

  const diff = difficultyMeta[card.difficulty] || difficultyMeta.intermediate;
  const cat = categoryMeta[card.category] || categoryMeta.uncategorized;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8">
        <section>
          <h1 className="text-2xl font-bold">{card.title}</h1>
          <p className="text-sm text-neutral-300">
            {cat.label} · {diff.label}
          </p>
          <p className="mt-4 text-sm">{card.summary}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {card.keywords.map((kw) => (
              <span
                key={kw}
                className="text-[11px] px-2 py-1 bg-neutral-900 text-cyan-400 rounded-sm border border-neutral-800"
              >
                #{kw}
              </span>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {takeaways.map((t, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/50">
                <div className="text-[10px] font-mono text-neutral-500">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <p className="text-sm text-neutral-200">{t}</p>
              </div>
            ))}
          </div>
          <article className="mt-10">
            <MarkdownRenderer source={card.content} />
          </article>
        </section>

        {/* TOC sidebar */}
        <aside className="hidden lg:block text-sm">
          <div className="sticky top-4">
            <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-4">
              ▸ 目录
            </div>
            <nav className="space-y-2">
              {toc.length === 0 && <p className="text-neutral-500 text-xs">（暂无目录）</p>}
              {toc.map((t) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  className="block text-neutral-400 hover:text-cyan-400 text-xs py-1 transition-colors truncate"
                >
                  {t.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {relatedTerms.length > 0 && (
          <section className="lg:col-span-2 mt-16 pt-8 border-t border-neutral-800">
            <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-5">
              ▸ 相关术语
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedTerms.map((t) => (
                <Link
                  key={t.slug}
                  href={`/glossary/${t.slug}`}
                  className="block p-4 bg-neutral-900 border border-neutral-800 rounded-lg"
                >
                  <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">
                    {t.category}
                  </div>
                  <h4 className="text-sm font-semibold text-green-400">{t.name}</h4>
                  <p className="text-xs text-neutral-500 line-clamp-2 mt-1">{t.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="lg:col-span-2 mt-16 pt-8 border-t border-neutral-800">
            <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-5">
              ▸ 相关情报
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map(({ card: rc }) => (
                <Link
                  key={rc.slug}
                  href={`/intel/${rc.slug}`}
                  className="block p-4 bg-neutral-900 border border-neutral-800 rounded-lg"
                >
                  <h4 className="text-sm font-semibold text-neutral-200">{rc.title}</h4>
                  <p className="text-xs text-neutral-500 line-clamp-2">{rc.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
