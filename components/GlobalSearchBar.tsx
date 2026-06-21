"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { STATIC_SEARCH_INDEX, MODULE_CONFIG, type UnifiedSearchItem } from "@/lib/client-search";

interface GlobalSearchBarProps {
  placeholder?: string;
  className?: string;
  maxResults?: number;
}

/**
 * 在文本中高亮关键词
 */
function highlightQuery(text: string, query: string): React.ReactNode[] {
  if (!query.trim()) return [text];

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (terms.length === 0) return [text];

  terms.sort((a, b) => b.length - a.length);
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");

  const parts = text.split(pattern);
  return parts.map((part, idx) => {
    if (part.length > 0) {
      const freshPattern = new RegExp(`^(${escaped.join("|")})$`, "i");
      if (freshPattern.test(part)) {
        return (
          <mark
            key={idx}
            className="bg-green-400/25 text-green-300 rounded-sm px-0.5 font-medium"
          >
            {part}
          </mark>
        );
      }
    }
    return <span key={idx}>{part}</span>;
  });
}

/**
 * TechRadar 全站搜索组件
 * 跨模块搜索路线图、情报、工具和踩坑指南
 */
export function GlobalSearchBar({
  placeholder = "搜索全站内容… 路线图 / 情报 / 工具 / 踩坑",
  className = "",
  maxResults = 10,
}: GlobalSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listItemRefs = useRef<HTMLButtonElement[]>([]);

  // 构建 Fuse.js 索引
  const fuse = useMemo(
    () =>
      new Fuse<UnifiedSearchItem>(STATIC_SEARCH_INDEX, {
        keys: [
          { name: "title", weight: 0.4 },
          { name: "content", weight: 0.3 },
          { name: "tags", weight: 0.2 },
          { name: "category", weight: 0.1 },
        ],
        includeScore: true,
        includeMatches: true,
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 1,
      }),
    []
  );

  // 搜索结果（支持类型过滤）
  const results = useMemo(() => {
    if (!query.trim()) return [];

    let searchResults = fuse.search(query.trim());

    // 如果选择了特定类型，只显示该类型的结果
    if (selectedTypes.size > 0) {
      searchResults = searchResults.filter((r) =>
        selectedTypes.has(r.item.type)
      );
    }

    return searchResults.slice(0, maxResults);
  }, [fuse, query, selectedTypes, maxResults]);

  // 按类型分组的结果
  const groupedResults = useMemo(() => {
    const groups: Record<string, typeof results> = {};

    results.forEach((result) => {
      const type = result.item.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(result);
    });

    return groups;
  }, [results]);

  // 切换类型过滤
  const toggleType = useCallback((type: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
    setHighlightIndex(0);
  }, []);

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const total = results.length;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) => {
          if (total === 0) return -1;
          return prev >= total - 1 ? 0 : prev + 1;
        });
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) => {
          if (total === 0) return -1;
          return prev <= 0 ? total - 1 : prev - 1;
        });
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (highlightIndex >= 0 && results[highlightIndex]) {
          router.push(results[highlightIndex].item.url);
          setIsOpen(false);
          return;
        }
        if (total > 0) {
          router.push(results[0].item.url);
          setIsOpen(false);
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        setQuery("");
        setHighlightIndex(-1);
        inputRef.current?.blur();
        return;
      }
    },
    [results, highlightIndex, router]
  );

  // 滚动当前高亮项到可视区
  useEffect(() => {
    if (highlightIndex >= 0 && listItemRefs.current[highlightIndex]) {
      listItemRefs.current[highlightIndex].scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightIndex]);

  // 点击外部关闭下拉
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 重置高亮索引当结果变化
  useEffect(() => {
    setHighlightIndex(results.length > 0 ? 0 : -1);
  }, [results.length]);

  // 统计各类型数量
  const typeCounts = useMemo(() => {
    if (!query.trim()) return {};

    const allResults = fuse.search(query.trim());
    const counts: Record<string, number> = {};

    allResults.forEach((r) => {
      const type = r.item.type;
      counts[type] = (counts[type] || 0) + 1;
    });

    return counts;
  }, [fuse, query]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 输入框 */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 font-mono text-xs">
          &gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="
            w-full pl-9 pr-20 py-3
            bg-neutral-900 border border-neutral-700 rounded-lg
            text-neutral-200 font-mono text-sm
            placeholder:text-neutral-500
            focus:outline-none focus:border-green-400/60 focus:ring-2 focus:ring-green-400/15
            transition-colors
          "
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSelectedTypes(new Set());
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 font-mono text-xs"
            type="button"
          >
            ESC
          </button>
        )}
        <span className="absolute right-12 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-[10px]">
          {results.length > 0 ? `${results.length} hits` : ""}
        </span>
      </div>

      {/* 搜索结果下拉 */}
      {isOpen && query.trim() && (
        <div
          className="
            absolute left-0 right-0 top-full mt-2
            bg-neutral-900 border border-neutral-700 rounded-lg
            shadow-lg shadow-black/40
            overflow-hidden z-50
            max-h-[480px] overflow-y-auto
          "
        >
          {/* 类型过滤器 */}
          <div className="px-3 py-2 border-b border-neutral-800 bg-neutral-950 flex items-center gap-2 overflow-x-auto">
            <span className="font-mono text-[10px] text-neutral-500 shrink-0">筛选:</span>
            {Object.entries(MODULE_CONFIG).map(([type, config]) => {
              const count = typeCounts[type] || 0;
              const isSelected = selectedTypes.has(type);

              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`
                    shrink-0 px-2 py-1 rounded-md font-mono text-[10px] transition-colors
                    ${isSelected
                      ? `${config.bgColor} ${config.color} ${config.borderColor} border`
                      : "bg-neutral-800 text-neutral-400 border border-transparent hover:border-neutral-600"
                    }
                  `}
                >
                  {config.icon} {config.label}
                  {count > 0 && (
                    <span className="ml-1 opacity-60">({count})</span>
                  )}
                </button>
              );
            })}
          </div>

          {results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-neutral-500 font-mono text-xs">
                // 未匹配到结果，请尝试其他关键词
              </p>
              <p className="text-neutral-600 font-mono text-[10px] mt-2">
                支持搜索路线图、情报、工具、踩坑指南
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {Object.entries(groupedResults).map(([type, typeResults]) => {
                const config = MODULE_CONFIG[type as keyof typeof MODULE_CONFIG];
                if (!config) return null;

                return (
                  <div key={type}>
                    {/* 类型标题 */}
                    <div className={`px-4 py-1.5 ${config.bgColor} flex items-center gap-2`}>
                      <span className={`font-mono text-[10px] font-bold ${config.color}`}>
                        {config.icon} {config.label}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-500">
                        {typeResults.length} 条结果
                      </span>
                    </div>

                    {/* 结果列表 */}
                    <ul>
                      {typeResults.map((result) => {
                        const globalIdx = results.indexOf(result);
                        const item = result.item;
                        const isHighlighted = globalIdx === highlightIndex;

                        return (
                          <li key={item.id}>
                            <button
                              ref={(el) => {
                                if (el) listItemRefs.current[globalIdx] = el;
                              }}
                              type="button"
                              onMouseEnter={() => setHighlightIndex(globalIdx)}
                              onClick={() => {
                                router.push(item.url);
                                setIsOpen(false);
                              }}
                              className={`
                                w-full text-left px-4 py-3 transition-colors
                                ${isHighlighted
                                  ? `bg-green-400/10 border-l-2 border-green-400`
                                  : "hover:bg-neutral-800 border-l-2 border-transparent"}
                              `}
                            >
                              <div className="flex items-start justify-between gap-3 mb-1">
                                <span className={`font-semibold text-sm ${isHighlighted ? "text-green-400" : "text-neutral-200"}`}>
                                  {highlightQuery(item.title, query)}
                                </span>
                                {item.category && (
                                  <span className="font-mono text-[10px] text-neutral-500 shrink-0">
                                    {highlightQuery(item.category, query)}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-400 leading-relaxed mb-2 line-clamp-2">
                                {highlightQuery(item.content, query)}
                              </p>
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {item.tags.slice(0, 4).map((tag) => (
                                    <span
                                      key={tag}
                                      className="font-mono text-[10px] px-1.5 py-0.5 bg-neutral-950 text-cyan-400 rounded-sm"
                                    >
                                      {highlightQuery(`#${tag}`, query)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* 操作提示 */}
          <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950 flex justify-between items-center font-mono text-[10px] text-neutral-500">
            <span className="flex items-center gap-3">
              <span>↑ ↓ 选中</span>
              <span>↵ 跳转</span>
              <span>ESC 清空</span>
            </span>
            <span>共 {STATIC_SEARCH_INDEX.length} 条索引</span>
          </div>
        </div>
      )}
    </div>
  );
}
