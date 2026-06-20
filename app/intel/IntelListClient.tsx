"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import type { IntelCard } from "@/lib/intel";
import { difficultyMeta, categoryMeta } from "@/lib/intel-meta";

interface IntelListClientProps {
  cards: IntelCard[];
}

export function IntelListClient({ cards }: IntelListClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeDifficulty, setActiveDifficulty] = useState<string>("all");

  // 计算各分类的数量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: cards.length };
    cards.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [cards]);

  // 筛选后的卡片
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (activeCategory !== "all" && c.category !== activeCategory) return false;
      if (activeDifficulty !== "all" && c.difficulty !== activeDifficulty) return false;
      return true;
    });
  }, [cards, activeCategory, activeDifficulty]);

  // 获取可用的分类列表（按数量排序）
  const categories = useMemo(() => {
    return Object.entries(categoryCounts)
      .filter(([key]) => key !== "all")
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ key, count, ...(categoryMeta[key] || categoryMeta.uncategorized) }));
  }, [categoryCounts]);

  // 根据 slug 计算原始索引
  const getIndexBySlug = (slug: string) => cards.findIndex((c) => c.slug === slug) + 1;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* 顶部介绍 */}
        <div className="mb-10">
          <span className="font-mono text-xs tracking-[0.15em] text-cyan-400 uppercase">
            02 / 技术情报卡
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mt-3 mb-4">技术情报检索</h1>
          <p className="text-base text-neutral-400 leading-relaxed mb-4 max-w-3xl">
            精选 <span className="text-neutral-100 font-medium">{cards.length}</span> 条经过验证的技术情报，从入门到进阶，覆盖 AI 工程全链路。
            每条情报卡包含：<span className="text-neutral-100 font-medium">一句话概览</span>
            、<span className="text-neutral-100 font-medium">核心拆解</span>
            、<span className="text-neutral-100 font-medium">完整跑通方案</span>，
            帮助你快速判断「是否值得学」以及「如何学」。
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 font-mono text-xs px-4 py-2 bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 rounded-sm hover:bg-cyan-400/20 transition-colors"
            >
              <span>⌕</span>
              <span>搜索全部情报</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-xs px-4 py-2 bg-neutral-900 text-neutral-400 border border-neutral-800 rounded-sm hover:border-neutral-600 transition-colors"
            >
              <span>←</span>
              <span>返回首页</span>
            </Link>
          </div>
        </div>

        {/* 分类统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={`text-left p-4 rounded-lg border transition-all ${
              activeCategory === "all"
                ? "bg-neutral-900 border-green-400/60"
                : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-600"
            }`}
          >
            <div className="font-mono text-[10px] text-neutral-500 uppercase mb-1">全部</div>
            <div className="text-2xl font-bold text-neutral-100 mb-1">{cards.length}</div>
            <div className="text-xs text-neutral-400">条情报</div>
          </button>
          {categories.slice(0, 4).map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`text-left p-4 rounded-lg border transition-all ${
                activeCategory === cat.key
                  ? `bg-neutral-900 border-current ${cat.color.split(" ")[1]}`
                  : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-600"
              }`}
            >
              <div className={`font-mono text-[10px] uppercase mb-1 ${cat.color.split(" ")[1]}`}>
                {cat.label}
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{cat.count}</div>
              <div className="text-[11px] text-neutral-500 line-clamp-2 leading-tight">
                {cat.desc}
              </div>
            </button>
          ))}
        </div>

        {/* 筛选器 */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-6 border-b border-neutral-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] text-neutral-500 uppercase mr-2">难度</span>
            {[
              { key: "all", label: "全部" },
              { key: "beginner", label: "入门" },
              { key: "intermediate", label: "中级" },
              { key: "advanced", label: "高级" },
            ].map((d) => (
              <button
                key={d.key}
                onClick={() => setActiveDifficulty(d.key)}
                className={`font-mono text-xs px-3 py-1 rounded-sm transition-colors ${
                  activeDifficulty === d.key
                    ? "bg-green-400/20 text-green-400 border border-green-400/40"
                    : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="font-mono text-[10px] text-neutral-500">
            显示 {filteredCards.length} / {cards.length} 条
          </div>
        </div>

        {/* 当前分类说明 */}
        {activeCategory !== "all" && (
          <div className="mb-6 p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
            <div
              className={`font-mono text-[10px] uppercase mb-1 ${
                (categoryMeta[activeCategory] || categoryMeta.uncategorized).color.split(" ")[1]
              }`}
            >
              当前分类 · {(categoryMeta[activeCategory] || categoryMeta.uncategorized).label}
            </div>
            <p className="text-sm text-neutral-400">
              {(categoryMeta[activeCategory] || categoryMeta.uncategorized).desc}
            </p>
          </div>
        )}

        {/* 卡片列表 */}
        <div className="flex flex-col gap-3">
          {filteredCards.map((card) => {
            const diff = difficultyMeta[card.difficulty] || difficultyMeta.intermediate;
            const cat = categoryMeta[card.category] || categoryMeta.uncategorized;
            return (
              <Link
                key={card.slug}
                href={`/intel/${card.slug}`}
                className="block p-5 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-cyan-400/40 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* 元信息 */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="font-mono text-[9px] text-neutral-600">
                        #{String(getIndexBySlug(card.slug)).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-mono text-[9px] px-2 py-0.5 rounded-sm border ${cat.color
                          .split(" ")
                          .slice(0, 2)
                          .join(" ")} ${cat.color.split(" ")[2]}`}
                      >
                        {cat.label}
                      </span>
                      <span
                        className={`font-mono text-[9px] px-2 py-0.5 rounded-sm border flex items-center gap-1 ${diff.color}`}
                      >
                        <span>{diff.icon}</span>
                        <span>{diff.label}</span>
                      </span>
                      {card.duration && (
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded-sm bg-neutral-800 text-neutral-400">
                          {card.duration}
                        </span>
                      )}
                    </div>

                    {/* 标题 */}
                    <h2 className="text-lg font-bold text-neutral-100 group-hover:text-cyan-400 transition-colors mb-2">
                      {card.title}
                    </h2>

                    {/* 摘要 */}
                    <p className="text-sm text-neutral-400 leading-relaxed mb-3">
                      {card.summary}
                    </p>

                    {/* 关键词 */}
                    <div className="flex flex-wrap gap-1.5">
                      {card.keywords.slice(0, 5).map((kw) => (
                        <span
                          key={kw}
                          className="font-mono text-[10px] px-1.5 py-0.5 bg-neutral-950 text-neutral-500 rounded-sm"
                        >
                          #{kw}
                        </span>
                      ))}
                      {card.keywords.length > 5 && (
                        <span className="font-mono text-[10px] text-neutral-600">
                          +{card.keywords.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 右侧箭头 */}
                  <div className="shrink-0 self-center text-neutral-600 group-hover:text-cyan-400 transition-colors text-lg">
                    →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 空状态 */}
        {filteredCards.length === 0 && (
          <div className="text-center py-16">
            <div className="font-mono text-neutral-600 mb-3">// 没有匹配的情报</div>
            <button
              onClick={() => {
                setActiveCategory("all");
                setActiveDifficulty("all");
              }}
              className="text-sm text-cyan-400 hover:underline font-mono"
            >
              ↺ 重置筛选条件
            </button>
          </div>
        )}

        {/* 页脚 */}
        <div className="mt-16 pt-6 border-t border-neutral-800 text-center">
          <Link
            href="/search"
            className="font-mono text-[11px] text-neutral-500 hover:text-cyan-400 transition-colors"
          >
            更精准查找？试试搜索 →
          </Link>
        </div>
      </div>
    </main>
  );
}
