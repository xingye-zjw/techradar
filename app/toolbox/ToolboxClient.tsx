"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import type { Tool, ToolScenario, ToolWithRelated, RelatedIntelRef } from "@/lib/toolbox";
import { createFuse, highlightText } from "@/lib/search-helpers";

interface ToolboxClientProps {
  tools: ToolWithRelated[];
  scenarios: ToolScenario[];
  categories: string[];
}

const DIFFICULTY_META: Record<
  Tool["difficulty"],
  { label: string; color: string; bg: string }
> = {
  beginner: { label: "入门", color: "text-green-400", bg: "bg-green-400/10" },
  intermediate: {
    label: "进阶",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  advanced: {
    label: "资深",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
};

type CategoryFilter = "all" | string;
type DifficultyFilter = "all" | Tool["difficulty"];

export function ToolboxClient({
  tools,
  scenarios,
  categories,
}: ToolboxClientProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [activeScenario, setActiveScenario] = useState<string>("all");
  const [activeDifficulty, setActiveDifficulty] =
    useState<DifficultyFilter>("all");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState<string>("");

  // Fuse.js 搜索实例
  const fuse = useMemo(
    () =>
      createFuse<ToolWithRelated>(tools, [
        { name: "name", weight: 0.4 },
        { name: "purpose", weight: 0.2 },
        { name: "tags", weight: 0.2 },
        { name: "category", weight: 0.1 },
        { name: "features", weight: 0.05 },
        { name: "use_cases", weight: 0.05 },
      ], { threshold: 0.3 }),
    [tools]
  );

  // 过滤后的工具列表
  const filteredTools = useMemo(() => {
    let result: ToolWithRelated[] = tools;

    if (query.trim()) {
      result = fuse.search(query.trim()).map((r) => r.item);
    }

    if (activeCategory !== "all") {
      result = result.filter((t) => t.category === activeCategory);
    }

    if (activeScenario !== "all") {
      const scenario = scenarios.find((s) => s.key === activeScenario);
      if (scenario) {
        result = result.filter((t) =>
          scenario.tool_names.includes(t.name)
        );
      }
    }

    if (activeDifficulty !== "all") {
      result = result.filter((t) => t.difficulty === activeDifficulty);
    }

    return result;
  }, [tools, query, fuse, activeCategory, activeScenario, activeDifficulty, scenarios]);

  const activeFilterCount = [
    activeCategory !== "all",
    activeScenario !== "all",
    activeDifficulty !== "all",
    query.trim().length > 0,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setActiveCategory("all");
    setActiveScenario("all");
    setActiveDifficulty("all");
    setQuery("");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(""), 1500);
    } catch {
      // 静默失败
    }
  };

  const toggleCompareSelect = (toolName: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(toolName)) {
        return prev.filter((n) => n !== toolName);
      }
      if (prev.length >= 3) return prev;
      return [...prev, toolName];
    });
  };

  const selectedTools = tools.filter((t) =>
    selectedForCompare.includes(t.name)
  );

  const scrollToCompare = () => {
    const el = document.getElementById("toolbox-compare-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* 标题区 */}
        <div className="mb-8">
          <span className="font-mono text-xs tracking-[0.15em] text-amber-400 uppercase">
            03 / 工具箱
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2">工具推荐箱</h1>
          <p className="text-sm text-neutral-400 mt-2">
            按实际场景分类 — 可运行最小示例 + 一行安装命令
          </p>
        </div>

        {/* 搜索 + 对比模式切换 */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-mono text-xs">
              &gt;
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索工具名 / 关键词 / 应用场景…  （例如 YOLO, RAG, 推理）"
              autoComplete="off"
              spellCheck={false}
              className="
                w-full pl-9 pr-9 py-3
                bg-neutral-900 border border-neutral-700 rounded-lg
                text-neutral-200 font-mono text-sm
                placeholder:text-neutral-500
                focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/15
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
          </div>

          <button
            onClick={() => {
              if (compareMode) {
                setCompareMode(false);
                setSelectedForCompare([]);
              } else {
                setCompareMode(true);
              }
            }}
            className={`px-4 py-3 rounded-lg font-mono text-sm border transition-colors whitespace-nowrap ${
              compareMode
                ? "bg-amber-400/15 border-amber-400/60 text-amber-300"
                : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-amber-400/40 hover:text-neutral-200"
            }`}
          >
            {compareMode
              ? selectedForCompare.length > 0
                ? `已选 ${selectedForCompare.length}/3 对比`
                : "请选择 2-3 个工具"
              : "↔ 开启工具对比"}
          </button>
        </div>

        {/* 分类 Tab */}
        <div className="mb-4">
          <div className="font-mono text-[10px] text-neutral-500 mb-2 tracking-wider">
            按分类
          </div>
          <div className="flex flex-wrap gap-1.5">
            <CategoryPill
              label="全部"
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
            />
            {categories.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>
        </div>

        {/* 场景筛选 */}
        <div className="mb-4">
          <div className="font-mono text-[10px] text-neutral-500 mb-2 tracking-wider">
            按场景
          </div>
          <div className="flex flex-wrap gap-1.5">
            <CategoryPill
              label="不限制"
              active={activeScenario === "all"}
              onClick={() => setActiveScenario("all")}
              variant="secondary"
            />
            {scenarios.map((s) => (
              <CategoryPill
                key={s.key}
                label={s.label}
                active={activeScenario === s.key}
                onClick={() => setActiveScenario(s.key)}
                variant="secondary"
              />
            ))}
          </div>
        </div>

        {/* 难度筛选 */}
        <div className="mb-6">
          <div className="font-mono text-[10px] text-neutral-500 mb-2 tracking-wider">
            按难度
          </div>
          <div className="flex flex-wrap gap-1.5">
            <CategoryPill
              label="不限制"
              active={activeDifficulty === "all"}
              onClick={() => setActiveDifficulty("all")}
              variant="tertiary"
            />
            {(["beginner", "intermediate", "advanced"] as const).map((d) => (
              <CategoryPill
                key={d}
                label={DIFFICULTY_META[d].label}
                active={activeDifficulty === d}
                onClick={() => setActiveDifficulty(d)}
                variant="tertiary"
                tone={d}
              />
            ))}
          </div>
        </div>

        {/* 结果统计 + 重置 */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs text-neutral-500">
            共 {filteredTools.length} / {tools.length} 个工具
            {activeFilterCount > 0 && (
              <span className="text-amber-400 ml-2">
                · {activeFilterCount} 个筛选条件
              </span>
            )}
          </span>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="font-mono text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              清除筛选
            </button>
          )}
        </div>

        {/* 对比模式提示条 */}
        {compareMode && (
          <div className="mb-4 p-4 bg-amber-400/5 border border-amber-400/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-mono text-xs text-amber-300 mb-1">
                // 对比模式已开启
              </div>
              <div className="text-sm text-neutral-400">
                在下方工具卡片中勾选 2-3 个工具进行特性对比
              </div>
            </div>
            {selectedTools.length >= 2 && (
              <button
                onClick={scrollToCompare}
                className="px-4 py-2 bg-amber-400 text-neutral-950 rounded-md font-mono text-xs font-semibold hover:bg-amber-300 transition-colors"
              >
                ↓ 查看对比
              </button>
            )}
          </div>
        )}

        {/* 工具卡片列表 */}
        <div className="flex flex-col gap-4">
          {filteredTools.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-neutral-800 rounded-lg">
              <p className="font-mono text-xs text-neutral-500 mb-2">
                // 未匹配到工具
              </p>
              <p className="text-sm text-neutral-600">
                试试调整关键词或清除筛选条件
              </p>
            </div>
          ) : (
            filteredTools.map((tool) => (
              <ToolCard
                key={tool.name}
                tool={tool}
                compareMode={compareMode}
                isSelected={selectedForCompare.includes(tool.name)}
                onToggleCompare={toggleCompareSelect}
                onCopyInstall={copyToClipboard}
                isCopied={copiedText === tool.install}
                query={query}
              />
            ))
          )}
        </div>

        {/* 对比区域 */}
        {compareMode && selectedTools.length >= 2 && (
          <div
            id="toolbox-compare-section"
            className="mt-12 pt-8 border-t border-neutral-800"
          >
            <div className="mb-6">
              <span className="font-mono text-xs tracking-[0.15em] text-amber-400 uppercase">
                // 工具对比
              </span>
              <h2 className="text-xl font-bold mt-2 text-neutral-100">
                {selectedTools.map((t) => t.name).join("  vs  ")}
              </h2>
            </div>
            <CompareTable tools={selectedTools} />
          </div>
        )}

        {/* 页脚提示 */}
        <div className="mt-16 pt-8 border-t border-neutral-800 text-center">
          <p className="font-mono text-[10px] text-neutral-600">
            // 数据来源：content/toolbox/tools.json · 按 commit 更新
          </p>
        </div>
      </div>
    </main>
  );
}

/* ========== 子组件：分类 pill ========== */
function CategoryPill({
  label,
  active,
  onClick,
  variant = "primary",
  tone,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "primary" | "secondary" | "tertiary";
  tone?: Tool["difficulty"];
}) {
  const baseActiveClass =
    tone === "beginner"
      ? "bg-green-400/15 border-green-400/60 text-green-300"
      : tone === "intermediate"
      ? "bg-amber-400/15 border-amber-400/60 text-amber-300"
      : tone === "advanced"
      ? "bg-rose-400/15 border-rose-400/60 text-rose-300"
      : variant === "secondary"
      ? "bg-cyan-400/15 border-cyan-400/60 text-cyan-300"
      : variant === "tertiary"
      ? "bg-violet-400/15 border-violet-400/60 text-violet-300"
      : "bg-amber-400/15 border-amber-400/60 text-amber-300";

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md font-mono text-xs border transition-colors whitespace-nowrap ${
        active
          ? baseActiveClass
          : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300"
      }`}
    >
      {label}
    </button>
  );
}

/* ========== 子组件：工具卡片 ========== */
function ToolCard({
  tool,
  compareMode,
  isSelected,
  onToggleCompare,
  onCopyInstall,
  isCopied,
  query,
}: {
  tool: ToolWithRelated;
  compareMode: boolean;
  isSelected: boolean;
  onToggleCompare: (name: string) => void;
  onCopyInstall: (text: string) => void;
  isCopied: boolean;
  query: string;
}) {
  const diffMeta = DIFFICULTY_META[tool.difficulty];
  const [showRelated, setShowRelated] = useState(false);

  return (
    <div
      className={`block p-5 bg-neutral-900 border rounded-lg transition-all ${
        isSelected
          ? "border-amber-400/70 ring-2 ring-amber-400/20"
          : "border-neutral-700 hover:border-amber-400/40"
      }`}
    >
      {/* 顶部：分类 + 对比勾选框 */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] px-2 py-0.5 bg-amber-400/10 text-amber-400 rounded-sm">
            {tool.category}
          </span>
          <span
            className={`font-mono text-[10px] px-2 py-0.5 rounded-sm ${diffMeta.bg} ${diffMeta.color}`}
          >
            · {diffMeta.label}
          </span>
        </div>

        {compareMode && (
          <button
            onClick={() => onToggleCompare(tool.name)}
            className={`shrink-0 px-3 py-1 rounded-md font-mono text-[10px] border transition-colors ${
              isSelected
                ? "bg-amber-400/20 border-amber-400/60 text-amber-300"
                : "bg-neutral-950 border-neutral-700 text-neutral-500 hover:border-amber-400/40 hover:text-neutral-300"
            }`}
          >
            {isSelected ? "✓ 已选" : "+ 加入对比"}
          </button>
        )}
      </div>

      {/* 名称 + GitHub 信息 */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
        <h2 className="text-lg font-bold text-neutral-100">{highlightText(tool.name, query)}</h2>
        <a
          href={tool.github.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-mono text-[10px] text-neutral-500 hover:text-amber-400 transition-colors flex items-center gap-1.5"
        >
          <span>★ {tool.github.stars}</span>
          <span className="text-neutral-700">|</span>
          <span>更新 {tool.github.last_release}</span>
        </a>
      </div>

      <p className="text-sm text-neutral-400 leading-relaxed mb-4">
        {highlightText(tool.purpose, query)}
      </p>

      {/* 安装命令 + 复制 */}
      <div className="mb-4 p-3 bg-neutral-950 border border-neutral-700 rounded-md">
        <div className="flex items-center justify-between mb-2">
          <div className="font-mono text-[10px] text-neutral-500">
            // 安装命令
          </div>
          <button
            onClick={() => onCopyInstall(tool.install)}
            className={`font-mono text-[10px] px-2 py-0.5 rounded-sm border transition-colors ${
              isCopied
                ? "bg-green-400/15 border-green-400/50 text-green-300"
                : "border-neutral-700 text-neutral-500 hover:border-amber-400/40 hover:text-neutral-300"
            }`}
          >
            {isCopied ? "✓ 已复制" : "⧉ 复制"}
          </button>
        </div>
        <code className="font-mono text-xs text-green-400 break-all block overflow-x-auto whitespace-nowrap">
          {tool.install}
        </code>
      </div>

      {/* 特性列表 */}
      <ul className="text-sm text-neutral-400 leading-relaxed space-y-1.5 mb-4">
        {tool.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="text-amber-400 font-mono flex-shrink-0">▸</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* 底部：tags + 官方链接 */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 flex-wrap">
        <div className="flex flex-wrap gap-1.5">
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] px-1.5 py-0.5 bg-neutral-950 text-neutral-500 rounded-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
        <a
          href={tool.official_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] text-neutral-500 hover:text-amber-400 transition-colors shrink-0"
        >
          官方文档 →
        </a>
      </div>

      {/* 相关技术情报：跨链到 /intel */}
      {tool.related_intel.length > 0 && (
        <div className="mt-5 pt-4 border-t border-neutral-800/80">
          <button
            type="button"
            onClick={() => setShowRelated((v) => !v)}
            className="flex items-center justify-between w-full text-left group"
          >
            <span className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-cyan-400 tracking-wider">
                // 相关技术情报
              </span>
              <span className="font-mono text-[10px] text-neutral-600">
                · {tool.related_intel.length} 篇
              </span>
            </span>
            <span className="font-mono text-[10px] text-neutral-500 group-hover:text-cyan-300 transition-colors">
              {showRelated ? "收起 ▲" : "展开 ▼"}
            </span>
          </button>

          {showRelated && (
            <ul className="mt-3 space-y-2">
              {tool.related_intel.map((ref) => (
                <li key={ref.slug}>
                  <a
                    href={`/intel/${ref.slug}`}
                    className="block p-3 rounded-md bg-neutral-950/70 border border-neutral-800 hover:border-cyan-400/40 hover:bg-neutral-950 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <span className="text-sm font-semibold text-neutral-100 group-hover:text-cyan-300 transition-colors">
                        {ref.title}
                      </span>
                      <span className="font-mono text-[9px] text-neutral-600 shrink-0">
                        → /intel/{ref.slug}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                      {ref.summary}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ========== 子组件：对比表格 ========== */
function CompareTable({ tools }: { tools: ToolWithRelated[] }) {
  return (
    <div className="overflow-x-auto border border-neutral-800 rounded-lg bg-neutral-900 -mx-4 sm:mx-0">
      <table className="w-full min-w-[600px]">
        <tbody>
          {/* 表头 */}
          <tr className="border-b border-neutral-800 bg-neutral-950/50">
            <th className="text-left p-4 font-mono text-[10px] text-neutral-500 tracking-wider w-32">
              <span className="text-neutral-600 font-mono">// 维度</span>
            </th>
            {tools.map((t) => (
              <th
                key={t.name}
                className="text-left p-4 font-mono text-sm text-amber-300"
              >
                {t.name}
              </th>
            ))}
          </tr>

          {/* 分类 */}
          <tr className="border-b border-neutral-800/70">
            <td className="p-4 font-mono text-[10px] text-neutral-500">分类</td>
            {tools.map((t) => (
              <td key={t.name} className="p-4 text-sm text-neutral-300">
                {t.category}
              </td>
            ))}
          </tr>

          {/* 难度 */}
          <tr className="border-b border-neutral-800/70">
            <td className="p-4 font-mono text-[10px] text-neutral-500">
              学习曲线
            </td>
            {tools.map((t) => {
              const meta = DIFFICULTY_META[t.difficulty];
              return (
                <td key={t.name} className="p-4 text-sm">
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded-sm ${meta.bg} ${meta.color}`}
                  >
                    {meta.label}
                  </span>
                </td>
              );
            })}
          </tr>

          {/* GitHub */}
          <tr className="border-b border-neutral-800/70">
            <td className="p-4 font-mono text-[10px] text-neutral-500">
              GitHub
            </td>
            {tools.map((t) => (
              <td key={t.name} className="p-4 text-sm text-neutral-300">
                <a
                  href={t.github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors"
                >
                  ★ {t.github.stars}
                  <span className="text-neutral-600 text-xs ml-2">
                    · 更新 {t.github.last_release}
                  </span>
                </a>
              </td>
            ))}
          </tr>

          {/* 简介 */}
          <tr className="border-b border-neutral-800/70 align-top">
            <td className="p-4 font-mono text-[10px] text-neutral-500">
              适用场景
            </td>
            {tools.map((t) => (
              <td
                key={t.name}
                className="p-4 text-sm text-neutral-400 leading-relaxed"
              >
                {t.purpose}
              </td>
            ))}
          </tr>

          {/* 安装 */}
          <tr className="border-b border-neutral-800/70 align-top">
            <td className="p-4 font-mono text-[10px] text-neutral-500">
              安装命令
            </td>
            {tools.map((t) => (
              <td key={t.name} className="p-4">
                <code className="font-mono text-[11px] text-green-400 break-all block bg-neutral-950 px-2 py-1.5 rounded-sm">
                  {t.install}
                </code>
              </td>
            ))}
          </tr>

          {/* 核心特性 */}
          <tr className="align-top">
            <td className="p-4 font-mono text-[10px] text-neutral-500">
              核心特性
            </td>
            {tools.map((t) => (
              <td key={t.name} className="p-4">
                <ul className="space-y-1.5">
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-neutral-400"
                    >
                      <span className="text-amber-400/70 font-mono text-xs flex-shrink-0">
                        ▸
                      </span>
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>

          {/* 文档链接 */}
          <tr className="border-t border-neutral-800/70 bg-neutral-950/30">
            <td className="p-4 font-mono text-[10px] text-neutral-500">
              更多信息
            </td>
            {tools.map((t) => (
              <td key={t.name} className="p-4">
                <a
                  href={t.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-amber-400/80 hover:text-amber-300 transition-colors"
                >
                  官方文档 →
                </a>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
