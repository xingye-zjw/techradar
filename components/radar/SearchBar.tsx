"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";

/**
 * 搜索索引项 - 由服务端通过 Markdown Frontmatter 解析后传入
 */
export interface SearchIndexItem {
  slug: string;
  title: string;
  category: string;
  keywords: string[];
  summary: string;
}

interface SearchBarProps {
  index: SearchIndexItem[];
  placeholder?: string;
  linkPrefix?: string;
  className?: string;
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
 * 极客风格的全局模糊搜索栏
 * - 基于 Fuse.js，在 title / keywords / summary / category 上做模糊匹配
 * - 支持键盘上下键选中，回车跳转，ESC 关闭
 * - 高亮命中关键词
 */
export function SearchBar({
  index,
  placeholder = "搜索技术关键词… (Transformer / YOLO / LoRA / RAG)",
  linkPrefix = "/intel/",
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listItemRefs = useRef<HTMLButtonElement[]>([]);

  // 构建 Fuse.js 索引
  const fuse = useMemo(
    () =>
      new Fuse<SearchIndexItem>(index, {
        keys: [
          { name: "title", weight: 0.4 },
          { name: "keywords", weight: 0.35 },
          { name: "category", weight: 0.15 },
          { name: "summary", weight: 0.1 },
        ],
        includeScore: true,
        includeMatches: true,
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 1,
      }),
    [index]
  );

  // 搜索结果
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query.trim()).slice(0, 8);
  }, [fuse, query]);

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
          const target = `${linkPrefix}${results[highlightIndex].item.slug}`;
          router.push(target);
          return;
        }
        if (total > 0) {
          const target = `${linkPrefix}${results[0].item.slug}`;
          router.push(target);
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
    [results, highlightIndex, linkPrefix, router]
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
            onClick={() => setQuery("")}
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
            max-h-[420px] overflow-y-auto
          "
        >
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-neutral-500 font-mono text-xs">
                // 未匹配到结果，请尝试其他关键词
              </p>
              <p className="text-neutral-600 font-mono text-[10px] mt-2">
                已索引 {index.length} 条技术情报
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-800">
              {results.map((result, idx) => {
                const item = result.item;
                const isHighlighted = idx === highlightIndex;
                return (
                  <li key={item.slug}>
                    <button
                      ref={(el) => {
                        if (el) listItemRefs.current[idx] = el;
                      }}
                      type="button"
                      onMouseEnter={() => setHighlightIndex(idx)}
                      onClick={() => {
                        router.push(`${linkPrefix}${item.slug}`);
                      }}
                      className={`
                        w-full text-left px-4 py-3 transition-colors
                        ${isHighlighted
                          ? "bg-green-400/10 border-l-2 border-green-400"
                          : "hover:bg-neutral-800 border-l-2 border-transparent"}
                      `}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <span className={`font-semibold text-sm ${isHighlighted ? "text-green-400" : "text-neutral-200"}`}>
                          {highlightQuery(item.title, query)}
                        </span>
                        <span className="font-mono text-[10px] text-neutral-500 shrink-0">
                          {highlightQuery(item.category, query)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed mb-2 line-clamp-2">
                        {highlightQuery(item.summary, query)}
                      </p>
                      {item.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.keywords.slice(0, 4).map((kw) => (
                          <span
                            key={kw}
                            className="font-mono text-[10px] px-1.5 py-0.5 bg-neutral-950 text-cyan-400 rounded-sm"
                          >
                            {highlightQuery(`#${kw}`, query)}
                          </span>
                        ))}
                      </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* 操作提示 */}
          <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950 flex justify-between items-center font-mono text-[10px] text-neutral-500">
            <span className="flex items-center gap-3">
              <span>↑ ↓ 选中</span>
              <span>↵ 跳转</span>
              <span>ESC 清空</span>
            </span>
            <span>共 {index.length} 条</span>
          </div>
        </div>
      )}
    </div>
  );
}
