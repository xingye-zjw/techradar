"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";
import type { IntelCard } from "@/lib/intel";
import { difficultyMeta, categoryMeta } from "@/lib/intel-meta";
import { TAG_GROUPS, getTagColor, type TagDefinition } from "@/lib/intel-tags";
import { createFuse, highlightText } from "@/lib/search-helpers";

interface IntelListClientProps {
  cards: IntelCard[];
}

export function IntelListClient({ cards }: IntelListClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeDifficulty, setActiveDifficulty] = useState<string>("all");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 构建 Fuse.js 搜索索引
  const fuse = useMemo(
    () =>
      createFuse<IntelCard>(cards, [
        { name: "title", weight: 0.35 },
        { name: "summary", weight: 0.25 },
        { name: "keywords", weight: 0.25 },
        { name: "tags", weight: 0.15 },
      ]),
    [cards]
  );

  // 快捷键聚焦搜索框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 计算各分类的数量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: cards.length };
    cards.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [cards]);

  // 切换标签筛选
  const toggleTag = (tagKey: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tagKey)) {
        next.delete(tagKey);
      } else {
        next.add(tagKey);
      }
      return next;
    });
  };

  // 筛选后的卡片（支持搜索 + 多维筛选）
  const filteredCards = useMemo(() => {
    let result = cards;

    // 搜索筛选
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery.trim());
      const searchIds = new Set(searchResults.map((r) => r.item.slug));
      result = result.filter((c) => searchIds.has(c.slug));
    }

    // 分类筛选
    if (activeCategory !== "all") {
      result = result.filter((c) => c.category === activeCategory);
    }

    // 难度筛选
    if (activeDifficulty !== "all") {
      result = result.filter((c) => c.difficulty === activeDifficulty);
    }

    // 标签筛选
    if (activeTags.size > 0) {
      result = result.filter((c) =>
        Array.from(activeTags).some((tag) => c.tags.includes(tag))
      );
    }

    return result;
  }, [cards, searchQuery, activeCategory, activeDifficulty, activeTags, fuse]);

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
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
          {/* 情报搜索框 */}
          <div className="relative mt-6 mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 font-mono text-xs">
              ⌕
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchQuery("");
              }}
              placeholder="搜索情报标题、摘要、关键词…"
              className="w-full pl-10 pr-20 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 font-mono text-sm placeholder:text-neutral-500 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 font-mono text-xs"
              >
                ESC
              </button>
            )}
            <span className="absolute right-12 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-[10px]">
              {searchQuery ? `${filteredCards.length} hits` : "⌘K 聚焦"}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
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

        {/* 标签筛选栏 */}
        <div className="mb-6 pb-6 border-b border-neutral-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] text-neutral-500 uppercase">标签筛选</span>
            {activeTags.size > 0 && (
              <button
                onClick={() => setActiveTags(new Set())}
                className="font-mono text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                清除
              </button>
            )}
          </div>

          {/* 领域标签 */}
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="font-mono text-[9px] text-neutral-600 w-12">领域</span>
            {TAG_GROUPS.domain.map((tag) => (
              <button
                key={tag.key}
                onClick={() => toggleTag(tag.key)}
                className={`font-mono text-[10px] px-2 py-0.5 rounded-sm border transition-colors ${
                  activeTags.has(tag.key)
                    ? tag.color
                    : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-600"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* 难度标签 */}
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="font-mono text-[9px] text-neutral-600 w-12">难度</span>
            {TAG_GROUPS.level.map((tag) => (
              <button
                key={tag.key}
                onClick={() => toggleTag(tag.key)}
                className={`font-mono text-[10px] px-2 py-0.5 rounded-sm border transition-colors ${
                  activeTags.has(tag.key)
                    ? tag.color
                    : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-600"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* 类型标签 */}
          <div className="flex flex-wrap gap-2">
            <span className="font-mono text-[9px] text-neutral-600 w-12">类型</span>
            {TAG_GROUPS.type.map((tag) => (
              <button
                key={tag.key}
                onClick={() => toggleTag(tag.key)}
                className={`font-mono text-[10px] px-2 py-0.5 rounded-sm border transition-colors ${
                  activeTags.has(tag.key)
                    ? tag.color
                    : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-600"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
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
          <div className="flex items-center gap-3">
            {(searchQuery || activeCategory !== "all" || activeDifficulty !== "all" || activeTags.size > 0) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                  setActiveDifficulty("all");
                  setActiveTags(new Set());
                }}
                className="font-mono text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                清除全部 ↺
              </button>
            )}
            <div className="font-mono text-[10px] text-neutral-500">
              显示 {filteredCards.length} / {cards.length} 条
            </div>
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
                      {/* 阅读时间 */}
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded-sm bg-neutral-800 text-neutral-500">
                        📖 {card.readingTime} 分钟
                      </span>
                    </div>

                    {/* 标题 */}
                    <h2 className="text-lg font-bold text-neutral-100 group-hover:text-cyan-400 transition-colors mb-2">
                      {highlightText(card.title, searchQuery)}
                    </h2>

                    {/* 摘要 */}
                    <p className="text-sm text-neutral-400 leading-relaxed mb-3">
                      {highlightText(card.summary, searchQuery)}
                    </p>

                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {card.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className={`font-mono text-[9px] px-1.5 py-0.5 rounded-sm border ${getTagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

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
                setSearchQuery("");
                setActiveCategory("all");
                setActiveDifficulty("all");
                setActiveTags(new Set());
              }}
              className="text-sm text-cyan-400 hover:underline font-mono"
            >
              ↺ 重置所有筛选条件
            </button>
          </div>
        )}

        {/* 页脚 */}
        <div className="mt-16 pt-6 border-t border-neutral-800 text-center">
          <Link
            href="/"
            className="font-mono text-[11px] text-neutral-500 hover:text-cyan-400 transition-colors"
          >
            返回首页 →
          </Link>
        </div>
      </div>
    </main>
  );
}
