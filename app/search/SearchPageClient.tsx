"use client";

/*
 * 不使用 Math.random() 进行推荐列表 shuffle 的原因：
 * 1. SSR 与 CSR 各执行一次 Math.random() 会得到不同结果，触发 React hydration mismatch
 *    导致控制台警告和潜在的客户端水合后 UI 闪烁。
 * 2. 确定性排序保证：同一日期 + 同一 slug 的两次渲染输出完全一致。
 *    每天推荐内容不同（基于 YYYY-MM-DD 的 hash），但同一页面刷新稳定。
 */

import Link from "next/link";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { UnifiedSearchItem } from "@/lib/search";
import { createFuse, highlightText, MODULE_CONFIG } from "@/lib/search-helpers";

interface SearchPageClientProps {
  items: UnifiedSearchItem[];
}

const POPULAR_TAGS = ["LLM", "Transformer", "CNN", "YOLO", "RAG", "Docker"];

export function SearchPageClient({ items }: SearchPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const validTypes = useMemo(() => ["all", ...Object.keys(MODULE_CONFIG)], []);

  const initialQuery = searchParams.get("q") ?? "";
  const initialTypeFromUrl = searchParams.get("type");
  const initialType =
    initialTypeFromUrl && validTypes.includes(initialTypeFromUrl) ? initialTypeFromUrl : "all";

  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState<string>(initialType);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listItemRefs = useRef<HTMLAnchorElement[]>([]);

  const syncUrl = useCallback(
    (nextQuery: string, nextType: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        const params = new URLSearchParams();
        if (nextQuery.trim()) params.set("q", nextQuery.trim());
        if (nextType !== "all") params.set("type", nextType);
        const queryString = params.toString();
        const nextUrl = queryString ? `?${queryString}` : "/search";
        router.replace(nextUrl, { scroll: false });
      }, 300);
    },
    [router],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    const urlType = searchParams.get("type");
    const resolvedType = urlType && validTypes.includes(urlType) ? urlType : "all";
    if (urlQ !== query) {
      setQuery(urlQ);
    }
    if (resolvedType !== activeType) {
      setActiveType(resolvedType);
    }
  }, [searchParams, validTypes, query, activeType]);

  // 精选情报推荐：从已加载的搜索条目里 type==="intel" 确定性 3 条
  // 基于日期种子的 mulberry32 PRNG，保证 SSR/CSR 一致性 + 每日轮换
  const recommendedIntels = useMemo(() => {
    const intels = items.filter((i) => i.type === "intel");
    if (intels.length <= 3) return intels;

    const dateStr = new Date().toISOString().slice(0, 10);
    let seed = 0;
    for (let i = 0; i < dateStr.length; i++) {
      seed = (seed * 31 + dateStr.charCodeAt(i)) >>> 0;
    }
    if (seed === 0) seed = 0xdeadbeef;

    function mulberry32(s: number) {
      return function () {
        s = (s + 0x6d2b79f5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    const rand = mulberry32(seed);
    const arr = [...intels];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 3);
  }, [items]);

  // 聚焦输入框
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 统计各模块数量
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    items.forEach((item) => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    return counts;
  }, [items]);

  // 构建 Fuse 索引
  const fuse = useMemo(
    () =>
      createFuse<UnifiedSearchItem>(items, [
        { name: "title", weight: 0.4 },
        { name: "content", weight: 0.3 },
        { name: "tags", weight: 0.2 },
        { name: "category", weight: 0.1 },
      ]),
    [items],
  );

  // 搜索 + 筛选
  const results = useMemo(() => {
    let list = items;
    if (activeType !== "all") {
      list = items.filter((i) => i.type === activeType);
    }
    if (query.trim()) {
      const ids = new Set(list.map((i) => i.id));
      return fuse
        .search(query.trim())
        .filter((r) => ids.has(r.item.id))
        .map((r) => r.item);
    }
    return list;
  }, [items, query, activeType, fuse]);

  // 按类型分组结果
  const groupedResults = useMemo(() => {
    const groups: Record<string, UnifiedSearchItem[]> = {};
    results.forEach((item) => {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    });
    return groups;
  }, [results]);

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const total = results.length;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (total === 0) {
          setHighlightIndex(-1);
        } else if (highlightIndex < 0) {
          setHighlightIndex(0);
        } else {
          setHighlightIndex((prev) => (prev >= total - 1 ? 0 : prev + 1));
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (total === 0 || highlightIndex <= 0) {
          // ArrowUp 时 <= 0 不动作
          return;
        }
        setHighlightIndex((prev) => prev - 1);
      } else if (e.key === "Escape") {
        setQuery("");
        syncUrl("", activeType);
        setHighlightIndex(-1);
      }
    },
    [results.length, highlightIndex, activeType, syncUrl],
  );

  // 滚动高亮项到可视区
  useEffect(() => {
    if (highlightIndex >= 0 && listItemRefs.current[highlightIndex]) {
      listItemRefs.current[highlightIndex].scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  // 重置高亮索引
  useEffect(() => {
    setHighlightIndex(results.length > 0 ? 0 : -1);
  }, [results.length]);

  // 输入框变化回调（供标签点击时调用）
  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      syncUrl(e.target.value, activeType);
    },
    [activeType, syncUrl],
  );

  // 热门标签点击：设置 query 并立即触发搜索
  const handleTagClick = useCallback(
    (tag: string) => {
      setQuery(tag);
      syncUrl(tag, activeType);
      inputRef.current?.focus();
    },
    [activeType, syncUrl],
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* 页头 */}
        <div className="mb-8">
          <div className="font-mono text-xs tracking-[0.15em] text-cyan-400 uppercase mb-2">
            全站搜索
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            <span className="text-green-400">TechRadar</span> 全站搜索
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            跨模块搜索<span className="text-neutral-200 font-medium">路线图</span>、
            <span className="text-neutral-200 font-medium">情报</span>、
            <span className="text-neutral-200 font-medium">工具</span>、
            <span className="text-neutral-200 font-medium">踩坑指南</span>、
            <span className="text-neutral-200 font-medium">专业术语</span>和
            <span className="text-neutral-200 font-medium">实战项目</span>。 共索引{" "}
            <span className="text-neutral-200 font-medium">{items.length}</span> 条内容。
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
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            placeholder="试试：Linux / Transformer / Docker / OOM..."
            className="w-full pl-10 pr-20 py-3.5 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 font-mono text-sm placeholder:text-neutral-500 focus:outline-none focus:border-green-400/60 focus:ring-2 focus:ring-green-400/15 transition-colors"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                syncUrl("", activeType);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 font-mono text-xs"
            >
              ESC
            </button>
          )}
          <span className="absolute right-12 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-[11px] hidden sm:inline">
            {results.length > 0 ? `${results.length} hits` : ""}
          </span>
        </div>

        {/* 模块类型筛选 */}
        <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-neutral-800">
          <button
            onClick={() => {
              setActiveType("all");
              syncUrl(query, "all");
            }}
            className={`font-mono text-xs px-3 py-1 rounded-sm border transition-colors ${
              activeType === "all"
                ? "bg-green-400/15 text-green-400 border-green-400/40"
                : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600"
            }`}
          >
            全部 ({typeCounts.all})
          </button>
          {Object.entries(MODULE_CONFIG)
            .filter(([key]) => key !== "glossary")
            .map(([key, config]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveType(key);
                  syncUrl(query, key);
                }}
                className={`font-mono text-xs px-3 py-1 rounded-sm border transition-colors ${
                  activeType === key
                    ? `${config.bgColor} ${config.color} ${config.borderColor} border`
                    : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600"
                }`}
              >
                {config.icon} {config.label} ({typeCounts[key] || 0})
              </button>
            ))}
        </div>

        {/* 结果统计 */}
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[11px] text-neutral-500">
            {query || activeType !== "all" ? (
              <>{`// 匹配到 ${results.length} 条`}</>
            ) : (
              <>{`// 已索引 ${items.length} 条内容`}</>
            )}
          </div>
          {(query || activeType !== "all") && (
            <button
              onClick={() => {
                setQuery("");
                setActiveType("all");
                syncUrl("", "all");
              }}
              className="font-mono text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              清除全部 ↺
            </button>
          )}
        </div>

        {/* 结果列表 */}
        {results.length === 0 ? (
          <div className="space-y-8">
            <div className="py-12 text-center border border-dashed border-neutral-800 rounded-lg">
              <div className="font-mono text-sm text-neutral-500 mb-2">{"// 未匹配到结果"}</div>
              <p className="text-xs text-neutral-600">尝试换一个关键词，或检查拼写是否正确</p>
            </div>

            {query.trim() && (
              <>
                {/* 热门标签云 */}
                <div>
                  <div className="font-mono text-[11px] text-neutral-500 mb-3">试试这些关键词:</div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 font-mono text-xs text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 精选情报推荐 */}
                {recommendedIntels.length > 0 && (
                  <div>
                    <div className="font-mono text-[11px] text-neutral-500 mb-3">精选情报推荐:</div>
                    <ul className="space-y-2">
                      {recommendedIntels.map((item) => (
                        <li key={item.id}>
                          <Link
                            href={item.url}
                            className="block p-4 rounded-lg border border-neutral-800 bg-neutral-900 hover:border-cyan-400/40 hover:bg-neutral-900/80 transition-all group"
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm border bg-amber-400/10 text-amber-400 border-amber-400/30">
                                  情报
                                </span>
                                {item.category && (
                                  <span className="font-mono text-[10px] text-neutral-500">
                                    {item.category}
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[11px] text-neutral-600 group-hover:text-cyan-400 transition-colors">
                                →
                              </span>
                            </div>
                            <div className="text-base font-semibold mb-2 text-neutral-100 group-hover:text-cyan-400 transition-colors">
                              {item.title}
                            </div>
                            <p className="text-sm text-neutral-400 leading-relaxed line-clamp-2">
                              {item.content}
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedResults).map(([type, typeItems]) => {
              const config = MODULE_CONFIG[type as keyof typeof MODULE_CONFIG];
              if (!config) return null;
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{config.icon}</span>
                    <h2 className="font-mono text-sm font-semibold text-neutral-300">
                      {config.label}
                    </h2>
                    <span className="font-mono text-[11px] text-neutral-500">
                      ({typeItems.length})
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {typeItems.map((item) => {
                      const globalIdx = results.indexOf(item);
                      const isHighlighted = globalIdx === highlightIndex;
                      return (
                        <li key={item.id}>
                          <Link
                            ref={(el) => {
                              if (el) listItemRefs.current[globalIdx] = el;
                            }}
                            href={item.url}
                            onMouseEnter={() => setHighlightIndex(globalIdx)}
                            className={`block p-4 rounded-lg border transition-all group ${
                              isHighlighted
                                ? "border-cyan-400/60 bg-cyan-400/5"
                                : "border-neutral-800 bg-neutral-900 hover:border-cyan-400/40 hover:bg-neutral-900/80"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded-sm border ${config.bgColor} ${config.color} ${config.borderColor}`}
                                >
                                  {config.label}
                                </span>
                                {item.category && (
                                  <span className="font-mono text-[10px] text-neutral-500">
                                    {item.category}
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[11px] text-neutral-600 group-hover:text-cyan-400 transition-colors">
                                →
                              </span>
                            </div>
                            <div
                              className={`text-base font-semibold mb-2 transition-colors ${
                                isHighlighted
                                  ? "text-cyan-400"
                                  : "text-neutral-100 group-hover:text-cyan-400"
                              }`}
                            >
                              {highlightText(item.title, query)}
                            </div>
                            <p className="text-sm text-neutral-400 leading-relaxed mb-3 line-clamp-2">
                              {highlightText(item.content, query)}
                            </p>
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {item.tags.slice(0, 6).map((tag) => (
                                  <span
                                    key={tag}
                                    className="font-mono text-[10px] px-1.5 py-0.5 bg-neutral-950 text-neutral-500 rounded-sm"
                                  >
                                    {highlightText(`#${tag}`, query)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
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
