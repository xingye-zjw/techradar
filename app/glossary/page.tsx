"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getAllTerms, getAllCategories, getTermsGroupedByLetter, getAllTags, type GlossaryTerm } from "@/lib/glossary";
import { CATEGORY_COLORS } from "@/lib/constants";
import { createFuse, highlightText } from "@/lib/search-helpers";

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const terms = useMemo(() => getAllTerms(), []);
  const categories = useMemo(() => getAllCategories(), []);
  const allTags = useMemo(() => getAllTags(), []);

  // 构建 Fuse.js 搜索索引
  const fuse = useMemo(
    () =>
      createFuse(terms, [
        { name: "name", weight: 0.4 },
        { name: "nameEn", weight: 0.2 },
        { name: "summary", weight: 0.25 },
        { name: "tags", weight: 0.15 },
      ]),
    [terms]
  );

  // 过滤后的术语
  const filteredTerms = useMemo(() => {
    let result = terms;

    if (searchQuery.trim()) {
      const searchIds = new Set(fuse.search(searchQuery.trim()).map((r) => r.item.slug));
      result = result.filter((term) => searchIds.has(term.slug));
    }

    if (selectedCategory) {
      result = result.filter((term) => term.category === selectedCategory);
    }

    if (selectedTag) {
      result = result.filter((term) => term.tags.includes(selectedTag));
    }

    return result;
  }, [terms, searchQuery, selectedCategory, selectedTag, fuse]);

  // 按首字母分组过滤后的术语
  const filteredTermsByLetter = useMemo(() => {
    const grouped: Record<string, GlossaryTerm[]> = {};
    for (const term of filteredTerms) {
      const firstLetter = term.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(term);
    }
    return grouped;
  }, [filteredTerms]);

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-100 mb-2">
              📖 专业术语
            </h1>
            <p className="text-neutral-400">
              快速查找 AI/ML、工程部署、数学基础等领域的专业术语
            </p>
          </div>

          {/* 搜索框 */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索术语名称、描述或标签..."
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  aria-label="清除搜索"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 分类筛选 */}
        <div className="mb-8">
          <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-3">
            // 按方向筛选
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedTag(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !selectedCategory && !selectedTag
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600"
              }`}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedTag(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? `${CATEGORY_COLORS[cat.id]} border`
                    : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 标签筛选 */}
        <div className="mb-8">
          <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-3">
            // 标签筛选
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-1 rounded text-[11px] transition-all ${
                  selectedTag === tag
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-neutral-800 text-neutral-500 border border-neutral-700 hover:text-neutral-300 hover:border-neutral-600"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* 字母索引 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-1">
            {Object.keys(filteredTermsByLetter)
              .sort()
              .map((letter) => (
                <button
                  key={letter}
                  onClick={() => scrollToLetter(letter)}
                  className="w-8 h-8 rounded flex items-center justify-center font-mono text-xs text-neutral-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  {letter}
                </button>
              ))}
          </div>
        </div>

        {/* 术语列表 */}
        <div className="space-y-8">
          {Object.keys(filteredTermsByLetter)
            .sort()
            .map((letter) => (
              <div key={letter} id={`letter-${letter}`}>
                <div className="font-mono text-lg text-neutral-300 mb-4 sticky top-0 bg-neutral-950 py-2">
                  {letter}
                </div>
                <div className="grid gap-3">
                  {filteredTermsByLetter[letter].map((term) => (
                    <Link
                      key={term.slug}
                      href={`/glossary/${term.slug}`}
                      className="block bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-neutral-100 group-hover:text-cyan-400 transition-colors">
                            {highlightText(term.name, searchQuery)}
                          </h3>
                          {term.nameEn && (
                            <span className="text-xs text-neutral-500 font-mono">
                              {highlightText(term.nameEn, searchQuery)}
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                          CATEGORY_COLORS[term.category] || "text-neutral-400 bg-neutral-800 border-neutral-700"
                        }`}>
                          {categories.find((c) => c.id === term.category)?.name || term.category}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-400 leading-relaxed mb-3">
                        {highlightText(term.summary, searchQuery)}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {term.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

          {Object.keys(filteredTermsByLetter).length === 0 && (
            <div className="text-center py-12">
              <div className="text-3xl mb-3">🔍</div>
              <p className="text-neutral-400">没有找到匹配的术语</p>
              <p className="text-xs text-neutral-500 mt-1">
                尝试调整搜索关键词或筛选条件
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
