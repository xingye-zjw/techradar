"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Pitfall } from "@/lib/content-types";
import { PITFALL_CATEGORY_META } from "@/lib/content-types";
import { createFuse, highlightText } from "@/lib/search-helpers";

interface PitfallListClientProps {
  pitfalls: Pitfall[];
}

export function PitfallListClient({ pitfalls }: PitfallListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 构建 Fuse.js 搜索索引
  const fuse = useMemo(
    () =>
      createFuse<Pitfall>(pitfalls, [
        { name: "title", weight: 0.4 },
        { name: "symptoms", weight: 0.3 },
        { name: "tags", weight: 0.2 },
        { name: "quickFix", weight: 0.1 },
      ]),
    [pitfalls]
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
    const counts: Record<string, number> = { all: pitfalls.length };
    pitfalls.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [pitfalls]);

  // 收集所有唯一的标签
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    pitfalls.forEach((p) => p.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [pitfalls]);

  // 切换标签
  const toggleTag = (tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  // 筛选后的踩坑（搜索 → 分类 → 标签）
  const filteredPitfalls = useMemo(() => {
    let result = pitfalls;

    // 搜索筛选
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery.trim());
      const searchTitles = new Set(searchResults.map((r) => r.item.title));
      result = result.filter((p) => searchTitles.has(p.title));
    }

    // 分类筛选
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // 标签筛选
    if (activeTags.size > 0) {
      result = result.filter((p) =>
        Array.from(activeTags).some((tag) => p.tags.includes(tag))
      );
    }

    return result;
  }, [pitfalls, searchQuery, activeCategory, activeTags, fuse]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* 顶部介绍 */}
        <div className="mb-10">
          <span className="font-mono text-xs tracking-[0.15em] text-red-400 uppercase">
            04 / 避雷
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2">踩坑避雷指南</h1>
          <p className="text-sm text-neutral-400 mt-2">
            环境 → 报错 → 排查 → 解决 · 共 {pitfalls.length} 条实战经验
          </p>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 font-mono text-xs">
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
            placeholder="搜索踩坑标题、症状、标签…"
            className="w-full pl-10 pr-20 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 font-mono text-sm placeholder:text-neutral-500 focus:outline-none focus:border-red-400/60 focus:ring-2 focus:ring-red-400/15 transition-colors"
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
            {searchQuery ? `${filteredPitfalls.length} hits` : "⌘K 聚焦"}
          </span>
        </div>

        {/* 分类筛选 */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
          <button
            onClick={() => setActiveCategory("all")}
            className={`text-left p-3 rounded-lg border transition-all ${
              activeCategory === "all"
                ? "bg-neutral-900 border-red-400/60"
                : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-600"
            }`}
          >
            <div className="font-mono text-[10px] text-neutral-500 uppercase mb-1">全部</div>
            <div className="text-xl font-bold text-neutral-100">{pitfalls.length}</div>
          </button>
          {Object.entries(categoryCounts)
            .filter(([key]) => key !== "all")
            .sort((a, b) => b[1] - a[1])
            .map(([key, count]) => {
              const meta = PITFALL_CATEGORY_META[key];
              if (!meta) return null;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    activeCategory === key
                      ? `bg-neutral-900 ${meta.borderColor} border-current ${meta.color}`
                      : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-600"
                  }`}
                >
                  <div className={`font-mono text-[10px] uppercase mb-1 ${meta.color}`}>
                    {meta.icon} {meta.label}
                  </div>
                  <div className="text-xl font-bold text-neutral-100">{count}</div>
                </button>
              );
            })}
        </div>

        {/* 标签筛选 */}
        {allTags.length > 0 && (
          <div className="mb-6 pb-6 border-b border-neutral-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[10px] text-neutral-500 uppercase">标签筛选</span>
              {activeTags.size > 0 && (
                <button
                  onClick={() => setActiveTags(new Set())}
                  className="font-mono text-[10px] text-red-400 hover:text-red-300 transition-colors"
                >
                  清除
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`font-mono text-[10px] px-2 py-0.5 rounded-sm border transition-colors ${
                    activeTags.has(tag)
                      ? "bg-red-400/20 text-red-400 border-red-400/40"
                      : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-600"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 筛选状态栏 */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            {(searchQuery || activeCategory !== "all" || activeTags.size > 0) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                  setActiveTags(new Set());
                }}
                className="font-mono text-[10px] text-red-400 hover:text-red-300 transition-colors"
              >
                清除全部 ↺
              </button>
            )}
          </div>
          <div className="font-mono text-[10px] text-neutral-500">
            显示 {filteredPitfalls.length} / {pitfalls.length} 条
          </div>
        </div>

        {/* 踩坑卡片列表 */}
        <div className="flex flex-col gap-4">
          {filteredPitfalls.map((p) => {
            const meta = PITFALL_CATEGORY_META[p.category];
            return (
              <div
                key={p.title}
                className="block p-4 sm:p-5 bg-neutral-900 border border-neutral-700 rounded-lg hover:border-red-400/40 transition-colors"
              >
                <div className="mb-4">
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-sm ${meta ? `${meta.bgColor} ${meta.color}` : "bg-red-400/10 text-red-400"}`}>
                    [{meta ? meta.label : p.category}]
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-200 mt-2">
                    {highlightText(p.title, searchQuery)}
                  </h2>
                </div>

                {p.quickFix && (
                  <div className="mb-4 p-3 bg-red-500/5 border border-red-400/20 rounded-md">
                    <div className="font-mono text-[10px] text-red-400 mb-1">// 快速修复</div>
                    <span className="text-sm text-red-300">
                      {highlightText(p.quickFix, searchQuery)}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="font-mono text-[10px] text-neutral-400 mb-2 tracking-wider">// 现象表现</div>
                    <ul className="text-sm text-neutral-400 leading-relaxed space-y-1.5">
                      {p.symptoms.map((s) => (
                        <li key={s} className="flex items-start gap-2">
                          <span className="text-red-400 font-mono text-xs flex-shrink-0 mt-0.5">×</span>
                          <span>{highlightText(s, searchQuery)}</span>
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
                    <span
                      key={tag}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTag(tag);
                      }}
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded-sm cursor-pointer transition-colors ${
                        activeTags.has(tag)
                          ? "bg-red-400/20 text-red-400 border border-red-400/40"
                          : "bg-neutral-950 text-neutral-400 hover:text-neutral-300"
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 空状态 */}
        {filteredPitfalls.length === 0 && (
          <div className="text-center py-16">
            <div className="font-mono text-neutral-600 mb-3">// 没有匹配的踩坑记录</div>
            <div className="text-sm text-neutral-500 mb-4">
              试试其他关键词，或者浏览全部踩坑
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
                setActiveTags(new Set());
              }}
              className="text-sm text-red-400 hover:underline font-mono"
            >
              ↺ 重置所有筛选条件
            </button>
          </div>
        )}

        {/* 页脚 */}
        <div className="mt-16 pt-6 border-t border-neutral-800 text-center">
          <a
            href="/"
            className="font-mono text-[11px] text-neutral-500 hover:text-red-400 transition-colors"
          >
            返回首页 →
          </a>
        </div>
      </div>
    </main>
  );
}
