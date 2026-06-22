import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllIntelCards, getIntelCardBySlug } from "@/lib/intel";
import { MarkdownRenderer, extractToc } from "@/components/radar/MarkdownRenderer";
import { difficultyMeta, categoryMeta } from "@/lib/intel-meta";
import { ReadingProgress } from "./ReadingProgress";
import { getAllTerms, type GlossaryTerm } from "@/lib/glossary";

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

/**
 * 读取"你将学到什么"——优先使用 Frontmatter 中人工编写的 takeaways
 * （由作者亲自撰写的才够准确，比算法猜测可靠得多）
 */
function getTakeaways(card: ReturnType<typeof getIntelCardBySlug>): string[] {
  if (!card) return [];
  // 1. 优先读取人工声明的 takeaways
  if (card.takeaways && card.takeaways.length > 0) {
    return card.takeaways;
  }
  // 2. 没有显式声明时，给出一个默认的"学习流程"占位
  return [
    `理解${card.title}技术的核心思想与适用场景`,
    `掌握关键组件的工作原理与实现要点`,
    `能够独立完成一个最小可运行的 Demo`,
    `了解常见坑点与最佳实践`,
  ];
}

/**
 * 找相关推荐：基于相同 category 或共享关键词
 */
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

  // 如果没有相关的，兜底返回最新的 3 条
  if (scored.length === 0) {
    return allCards.filter((c) => c.slug !== currentSlug).slice(-3).map((c) => ({ card: c, score: 1 }));
  }
  return scored;
}

/**
 * 找相关术语：基于关键词和内容匹配
 */
function findRelatedTerms(card: ReturnType<typeof getIntelCardBySlug>, allTerms: GlossaryTerm[]): GlossaryTerm[] {
  if (!card) return [];

  const scored = allTerms.map((term) => {
    let score = 0;
    // 关键词匹配
    const sharedKeywords = card.keywords.filter(
      (kw) => term.name.toLowerCase().includes(kw.toLowerCase()) ||
              term.tags.some(tag => tag.toLowerCase().includes(kw.toLowerCase()))
    ).length;
    score += sharedKeywords * 3;

    // 标签匹配
    const sharedTags = term.tags.filter(
      (tag) => card.keywords.some(kw => kw.toLowerCase().includes(tag.toLowerCase()))
    ).length;
    score += sharedTags * 2;

    // 情报 slug 匹配
    if (term.relatedIntel.includes(card.slug)) {
      score += 5;
    }

    return { term, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((s) => s.term);
}

export default function IntelPage({ params }: { params: { slug: string } }) {
  const card = getIntelCardBySlug(params.slug);
  if (!card) notFound();

  const allCards = getAllIntelCards();
  const allTerms = getAllTerms();
  const toc = extractToc(card.content);
  const takeaways = getTakeaways(card);
  const related = findRelated(card.slug, allCards);
  const relatedTerms = findRelatedTerms(card, allTerms);

  const diff = difficultyMeta[card.difficulty] || difficultyMeta.intermediate;
  const cat = categoryMeta[card.category] || categoryMeta.uncategorized;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <ReadingProgress />
      {/* 顶部导航 */}
      <div className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/intel" className="inline-flex items-center gap-2 font-mono text-xs text-neutral-500 hover:text-green-400 transition-colors">
            <span>←</span>
            <span>返回情报列表</span>
          </Link>
          <span className="font-mono text-[10px] text-neutral-600">
            {allCards.length} 条情报 · 本页 #{allCards.findIndex((c) => c.slug === card.slug) + 1}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* ========================================
            第一屏：快速概览（先简单介绍）
        ======================================== */}
        <section className="mb-10">
          {/* 元信息胶囊 */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className={`font-mono text-[10px] px-2 py-1 border rounded-sm ${cat.color} border-current`}>
              {cat.label}
            </span>
            <span className={`font-mono text-[10px] px-2 py-1 border rounded-sm flex items-center gap-1 ${diff.color}`}>
              <span>{diff.icon}</span>
              <span>{diff.label}</span>
            </span>
            {card.duration && (
              <span className="font-mono text-[10px] px-2 py-1 bg-neutral-800 text-neutral-400 rounded-sm flex items-center gap-1">
                <span>⏱</span>
                <span>预计 {card.duration}</span>
              </span>
            )}
            <span className="font-mono text-[10px] text-neutral-600">#{card.slug}</span>
          </div>

          {/* 适合谁学 */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="font-mono text-[10px] text-neutral-500">适合：</span>
            {card.difficulty === "beginner" ? (
              <span className="font-mono text-[10px] px-2 py-0.5 bg-green-400/10 text-green-400/80 border border-green-400/30 rounded-sm">
                零基础入门
              </span>
            ) : card.difficulty === "intermediate" ? (
              <>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-sm">
                  有基础
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-sm">
                  已掌握 Python
                </span>
              </>
            ) : (
              <>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-red-400/10 text-red-400/80 border border-red-400/30 rounded-sm">
                  有扎实基础
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-sm">
                  建议先学前置内容
                </span>
              </>
            )}
          </div>

          {/* 大标题 */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{card.title}</h1>

          {/* 一句话摘要 */}
          <p className="text-base text-neutral-300 leading-relaxed mb-6 max-w-3xl">{card.summary}</p>

          {/* 关键词 */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {card.keywords.map((kw) => (
              <span
                key={kw}
                className="font-mono text-[11px] px-2 py-1 bg-neutral-900 text-cyan-400 rounded-sm border border-neutral-800 hover:border-cyan-400/40 transition-colors"
              >
                #{kw}
              </span>
            ))}
          </div>

          {/* ========== 重点区块：学完后的收获 ========== */}
          {takeaways.length > 0 && (
            <div className="mb-8">
              {/* 区块标题 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-green-400/0 via-green-400/40 to-transparent"></div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-6 h-6 rounded bg-green-400/20 border border-green-400/40 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-green-400">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <span className="font-mono text-[11px] text-green-400 uppercase tracking-widest">
                    学完本文后，你将掌握
                  </span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-green-400/0 via-green-400/40 to-transparent"></div>
              </div>

              {/* 学习收获卡片 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {takeaways.map((t, idx) => {
                  // 根据难度分配不同颜色图标
                  const icons = [
                    { bg: "bg-cyan-400/15", border: "border-cyan-400/40", text: "text-cyan-400", label: "概念" },
                    { bg: "bg-purple-400/15", border: "border-purple-400/40", text: "text-purple-400", label: "技能" },
                    { bg: "bg-amber-400/15", border: "border-amber-400/40", text: "text-amber-400", label: "实战" },
                    { bg: "bg-emerald-400/15", border: "border-emerald-400/40", text: "text-emerald-400", label: "工具" },
                  ];
                  const icon = icons[idx % icons.length];

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${icon.bg} ${icon.border} transition-all hover:scale-[1.01]`}
                    >
                      <div className={`shrink-0 w-8 h-8 rounded-md ${icon.bg} border ${icon.border} flex items-center justify-center font-mono text-[10px] font-bold ${icon.text}`}>
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-mono text-[9px] uppercase tracking-wider mb-1 ${icon.text} opacity-70`}>
                          {icon.label}
                        </div>
                        <p className="text-sm text-neutral-200 leading-relaxed">
                          {t}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 快速预览进度指示 */}
              <div className="mt-4 flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                <span className="text-green-400/60">// 本页包含</span>
                <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded-sm">
                  {toc.length} 个章节
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded-sm">
                  {card.keywords.length} 个关键词
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded-sm">
                  预计 {card.duration}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* ========================================
            第二屏：目录导航 + 深度内容
        ======================================== */}
        <div className="flex gap-8">
          {/* 左侧目录（桌面端） */}
          {toc.length > 1 && (
            <aside className="hidden lg:block w-52 shrink-0">
              <div className="sticky top-20">
                <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-3">
                  目录导航
                </div>
                <nav className="border-l border-neutral-800 space-y-1">
                  {toc.map((t, idx) => (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className="block pl-3 -ml-px text-xs text-neutral-400 hover:text-green-400 py-1 border-l border-transparent hover:border-green-400 transition-colors"
                    >
                      <span className="font-mono text-neutral-600 mr-2">0{idx + 1}</span>
                      {t.text}
                    </a>
                  ))}
                </nav>

                {/* 快速统计 */}
                <div className="mt-8 pt-6 border-t border-neutral-800 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-neutral-500">章节</span>
                    <span className="font-mono text-neutral-300">{toc.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-neutral-500">关键词</span>
                    <span className="font-mono text-neutral-300">{card.keywords.length}</span>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* 右侧正文 */}
          <article className="flex-1 min-w-0">
            {/* 移动端目录（简洁版） */}
            {toc.length > 1 && (
              <div className="lg:hidden mb-8 pb-6 border-b border-neutral-800">
                <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-3">
                  快速跳转
                </div>
                <div className="flex flex-wrap gap-2">
                  {toc.map((t, idx) => (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className="font-mono text-xs px-2 py-1 bg-neutral-900 text-neutral-400 rounded-sm border border-neutral-800 hover:text-green-400 hover:border-green-400/30 transition-colors"
                    >
                      {t.text}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 内容主体 */}
            <div className="text-[15px]">
              <MarkdownRenderer source={card.content} />
            </div>

            {/* 页脚信息 */}
            <div className="mt-16 pt-6 border-t border-neutral-800 text-center">
              <span className="font-mono text-[10px] text-neutral-500">
                // 来源：content/intel/{card.slug}.md
              </span>
            </div>
          </article>
        </div>

        {/* ========================================
            第三屏：相关术语
        ======================================== */}
        {relatedTerms.length > 0 && (
          <section className="mt-16 pt-8 border-t border-neutral-800">
            <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-5">
              ▸ 相关术语
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {relatedTerms.map((term) => (
                <Link
                  key={term.slug}
                  href={`/glossary/${term.slug}`}
                  className="block p-3 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-cyan-400/40 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-neutral-200 group-hover:text-cyan-400 transition-colors">
                      {term.name}
                    </h4>
                    {term.nameEn && (
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {term.nameEn}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                    {term.summary}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ========================================
            第四屏：相关推荐
        ======================================== */}
        {related.length > 0 && (
          <section className="mt-16 pt-8 border-t border-neutral-800">
            <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-5">
              ▸ 相关情报
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map(({ card: rc }) => {
                const rDiff = difficultyMeta[rc.difficulty] || difficultyMeta.intermediate;
                const rCat = categoryMeta[rc.category] || categoryMeta.uncategorized;
                return (
                  <Link
                    key={rc.slug}
                    href={`/intel/${rc.slug}`}
                    className="block p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-cyan-400/40 transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-sm ${rCat.color}`}>
                        {rCat.label}
                      </span>
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-sm ${rDiff.color}`}>
                        {rDiff.label}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-neutral-200 group-hover:text-cyan-400 mb-2 transition-colors">
                      {rc.title}
                    </h4>
                    <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                      {rc.summary}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
