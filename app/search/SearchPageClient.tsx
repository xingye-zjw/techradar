"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import type { IntelSearchIndex } from "@/lib/intel";
import { categoryMeta } from "@/lib/intel-meta";

interface SearchPageClientProps {
  items: IntelSearchIndex[];
}

/**
 * 在文本中高亮关键词 —— 返回带标记的 React 节点
 */
function highlightText(text: string, query: string): React.ReactNode[] {
  if (!query.trim()) return [text];

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (terms.length === 0) return [text];

  // 构建匹配正则（按长度降序，避免 "trans" 先替换掉 "transformer" 的子串）
  terms.sort((a, b) => b.length - a.length);
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");

  const parts = text.split(pattern);
  return parts.map((part, idx) => {
    if (pattern.test(part) && part.length > 0) {
      // 重新创建正则，避免 lastIndex 污染
      const freshPattern = new RegExp(`^(${escaped.join("|")})$`, "i");
      if (freshPattern.test(part)) {
        return (
          <mark
            key={idx}
            className="bg-cyan-400/25 text-cyan-300 rounded-sm px-0.5 font-medium"
          >
            {part}
          </mark>
        );
      }
    }
    return <span key={idx}>{part}</span>;
  });
}

export function SearchPageClient({ items }: SearchPageClientProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // 聚焦输入框
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 获取所有出现的分类
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((i) => map.set(i.category, (map.get(i.category) || 0) + 1));
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({
        key,
        count,
        ...(categoryMeta[key] || categoryMeta.uncategorized),
      }));
  }, [items]);

  // 构建 Fuse 索引
  const fuse = useMemo(
    () =>
      new Fuse<IntelSearchIndex>(items, {
        keys: [
          { name: "title", weight: 0.4 },
          { name: "keywords", weight: 0.35 },
          { name: "category", weight: 0.15 },
          { name: "summary", weight: 0.1 },
        ],
        includeScore: true,
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 1,
      }),
    [items]
  );

  // 搜索 + 筛选
  const results = useMemo(() => {
    let list = items;
    // 分类筛选
    if (activeCategory !== "all") {
      list = items.filter((i) => i.category === activeCategory);
    }
    // 关键词搜索
    if (query.trim()) {
      const ids = new Set(list.map((i) => i.slug));
      return fuse
        .search(query.trim())
        .filter((r) => ids.has(r.item.slug))
        .map((r) => r.item);
    }
    return list;
  }, [items, query, activeCategory, fuse]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* 页头 */}
        <div className="mb-8">
          <div className="font-mono text-xs tracking-[0.15em] text-cyan-400 uppercase mb-2">
            02 / 情报检索
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="text-green-400">TechRadar</span> 技术情报检索
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            键入关键词即可在全部 <span className="text-neutral-200 font-medium">{items.length}</span> 条技术情报卡中进行模糊匹配。
            支持 <span className="font-mono text-cyan-400">↑ ↓</span> 键选择，
            <span className="font-mono text-cyan-400"> Enter</span> 跳转，
            <span className="font-mono text-cyan-400"> ESC</span> 清空。
          </p>
        </div>

        {/* 搜索输入框 */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 font-mono text-sm">
            &gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
            placeholder="试试：transformer / 目标检测 / docker / RAG..."
            className="w-full pl-10 pr-20 py-3.5 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 font-mono text-sm placeholder:text-neutral-500 focus:outline-none focus:border-green-400/60 focus:ring-2 focus:ring-green-400/15 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 font-mono text-xs"
            >
              ESC
            </button>
          )}
          <span className="absolute right-12 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-[11px]">
            {results.length > 0 ? `${results.length} hits` : ""}
          </span>
        </div>

        {/* 分类快速筛选 */}
        <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-neutral-800">
          <button
            onClick={() => setActiveCategory("all")}
            className={`font-mono text-xs px-3 py-1 rounded-sm border transition-colors ${
              activeCategory === "all"
                ? "bg-green-400/15 text-green-400 border-green-400/40"
                : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600"
            }`}
          >
            全部 ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`font-mono text-xs px-3 py-1 rounded-sm border transition-colors ${
                activeCategory === cat.key
                  ? cat.color + " border-current"
                  : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600"
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* 结果统计 */}
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[11px] text-neutral-500">
            {query || activeCategory !== "all"
              ? `// 匹配到 ${results.length} 条`
              : `// 已索引 ${items.length} 条技术情报`}
          </div>
          {(query || activeCategory !== "all") && (
            <button
              onClick={() => {
                setQuery("");
                setActiveCategory("all");
              }}
              className="font-mono text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              清除全部 ↺
            </button>
          )}
        </div>

        {/* 结果列表 */}
        <ul className="space-y-2">
          {results.length === 0 ? (
            <li className="py-12 text-center border border-dashed border-neutral-800 rounded-lg">
              <div className="font-mono text-sm text-neutral-500 mb-2">
                // 未匹配到结果
              </div>
              <p className="text-xs text-neutral-600">
                尝试换一个关键词，或检查拼写是否正确
              </p>
            </li>
          ) : (
            results.map((item) => {
              const cat = categoryMeta[item.category] || categoryMeta.uncategorized;
              return (
                <li key={item.slug}>
                  <Link
                    href={`/intel/${item.slug}`}
                    className="block p-4 rounded-lg border border-neutral-800 bg-neutral-900 hover:border-cyan-400/40 hover:bg-neutral-900/80 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-sm border ${cat.color}`}>
                          {cat.label}
                        </span>
                        <span className="font-mono text-[10px] text-neutral-600">
                          /{item.slug}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-neutral-600 group-hover:text-cyan-400 transition-colors">
                        →
                      </span>
                    </div>
                    <div className="text-base font-semibold text-neutral-100 group-hover:text-cyan-400 transition-colors mb-2">
                      {highlightText(item.title, query)}
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-3">
                      {highlightText(item.summary, query)}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.keywords.slice(0, 6).map((kw) => (
                        <span
                          key={kw}
                          className="font-mono text-[10px] px-1.5 py-0.5 bg-neutral-950 text-neutral-500 rounded-sm"
                        >
                          {highlightText(`#${kw}`, query)}
                        </span>
                      ))}
                    </div>
                  </Link>
                </li>
              );
            })
          )}
        </ul>

        {/* 页脚 */}
        <div className="mt-16 pt-6 border-t border-neutral-800 text-center">
          <Link
            href="/intel"
            className="font-mono text-[11px] text-neutral-500 hover:text-cyan-400 transition-colors"
          >
            浏览完整情报列表 →
          </Link>
        </div>
      </div>
    </main>
  );
}
