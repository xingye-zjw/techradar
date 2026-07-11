# 踩坑避雷搜索功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为踩坑避雷页面添加搜索、分类筛选和标签筛选功能，让用户能快速定位相关踩坑记录。

**Architecture:** 采用 server/client 分离架构——server 组件读取数据，client 组件处理搜索/筛选 UI。复用 `lib/search-helpers.tsx` 的 `createFuse()` 和 `highlightText()` 工具函数，与情报页保持一致的交互模式。

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, fuse.js ^7.4.2

## Global Constraints

- 暗色模式：背景 `#0a0a0a`，卡片 `bg-neutral-900`，边框 `border-neutral-700/800`
- 主色调：红色系（踩坑模块）—— `text-red-400`, `bg-red-400/10`, `hover:border-red-400/40`
- 字体：`font-mono text-xs` 用于标签/元信息，`text-sm` 用于正文
- Fuse.js 配置使用 `lib/search-helpers.tsx` 的 `createFuse()` 工厂函数，`threshold: 0.35`
- 所有新文件使用 TypeScript strict 模式
- 现有文件修改前需 Read 确认内容

---

## File Structure

| 操作 | 文件 | 职责 |
|------|------|------|
| Create | `components/pitfall/PitfallListClient.tsx` | 客户端组件：搜索框 + 分类筛选 + 标签筛选 + 卡片列表 |
| Modify | `app/pitfall/page.tsx` | Server 组件：读取数据 → 传递给 PitfallListClient |
| Modify | `lib/content-types.ts` | 新增 `PitfallCategoryMeta` 类型 |

---

### Task 1: 创建 PitfallListClient 组件（搜索 + 筛选 + 列表）

**Files:**
- Create: `components/pitfall/PitfallListClient.tsx`
- Modify: `lib/content-types.ts:126-141` (新增 PitfallCategoryMeta)

**Interfaces:**
- Consumes: `Pitfall[]` from `lib/content-types.ts` (已有)
- Produces: `<PitfallListClient pitfalls={Pitfall[]} />` 组件

#### Step 1: 在 `lib/content-types.ts` 中添加分类元数据类型

在 `Pitfall` 接口之后添加：

```typescript
/** 踩坑分类元数据 */
export interface PitfallCategoryMeta {
  label: string;
  icon: string;
  color: string; // Tailwind class e.g. "text-red-400"
  bgColor: string;
  borderColor: string;
  desc: string;
}

export const PITFALL_CATEGORY_META: Record<string, PitfallCategoryMeta> = {
  embedded: {
    label: "嵌入式",
    icon: "🔌",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/30",
    desc: "嵌入式开发中的常见问题",
  },
  control: {
    label: "控制系统",
    icon: "⚙️",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    desc: "控制系统与自动化相关问题",
  },
  signals: {
    label: "信号处理",
    icon: "📡",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/30",
    desc: "信号处理与通信相关问题",
  },
  electrical: {
    label: "电气工程",
    icon: "⚡",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
    desc: "电气工程与硬件相关问题",
  },
  devops: {
    label: "环境配置",
    icon: "🛠️",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/30",
    desc: "开发环境与部署配置问题",
  },
  "deep-learning": {
    label: "深度学习",
    icon: "🧠",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
    desc: "深度学习训练与推理问题",
  },
  llm: {
    label: "大语言模型",
    icon: "💬",
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    borderColor: "border-pink-400/30",
    desc: "LLM 微调与部署相关问题",
  },
  "data-processing": {
    label: "数据处理",
    icon: "📊",
    color: "text-teal-400",
    bgColor: "bg-teal-400/10",
    borderColor: "border-teal-400/30",
    desc: "数据处理与 ETL 相关问题",
  },
  "best-practices": {
    label: "最佳实践",
    icon: "✨",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/30",
    desc: "开发流程与最佳实践",
  },
};
```

#### Step 2: 创建 `components/pitfall/PitfallListClient.tsx`

```tsx
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
```

#### Step 3: 修改 `app/pitfall/page.tsx` 为 server/client 分离

将原有内容完全替换为：

```tsx
import { getAllPitfalls } from "@/lib/pitfall";
import { PitfallListClient } from "@/components/pitfall/PitfallListClient";

export default function PitfallPage() {
  const pitfalls = getAllPitfalls();
  return <PitfallListClient pitfalls={pitfalls} />;
}
```

#### Step 4: 验证构建

Run: `npm run build`
Expected: 构建成功，`out/pitfall/index.html` 生成

#### Step 5: 运行开发服务器验证

Run: `npm run dev`
Expected: 访问 `http://localhost:3000/pitfall` 能看到：
- 搜索框在顶部，placeholder 为"搜索踩坑标题、症状、标签…"
- 分类筛选按钮显示各分类及数量
- 标签筛选区域显示所有标签
- 输入搜索词后卡片实时过滤
- 点击标签卡片联动筛选
- 清除按钮重置所有筛选

#### Step 6: Commit

```bash
git add components/pitfall/PitfallListClient.tsx lib/content-types.ts app/pitfall/page.tsx
git commit -m "feat(pitfall): add search, category filter, and tag filter to pitfall page"
```

---

### Task 2: 搜索关键词高亮增强

**Files:**
- Modify: `components/pitfall/PitfallListClient.tsx` (已完成高亮集成)

> 此 Task 的高亮功能已包含在 Task 1 的实现中（使用 `highlightText()`）。
> 本 Task 用于验证高亮功能是否正常工作。

#### Step 1: 验证搜索高亮

Run: `npm run dev`
操作：
1. 访问 `/pitfall`
2. 搜索 "CUDA"
3. 预期：标题和症状中匹配 "CUDA" 的文字显示青色高亮背景
4. 搜索 "内存"
5. 预期：匹配 "内存" 的文字高亮

#### Step 2: 验证 ESC 清除

操作：
1. 在搜索框输入 "test"
2. 按 ESC 键
3. 预期：搜索框清空，所有卡片恢复显示

#### Step 3: 验证 ⌘K 聚焦

操作：
1. 按 Cmd+K（Mac）或 Ctrl+K（Windows）
2. 预期：搜索框获得焦点

#### Step 4: Commit

```bash
git add .
git commit -m "feat(pitfall): verify search highlight and keyboard shortcuts"
```

---

### Task 3: 构建验证与回归测试

**Files:**
- None (验证性 Task)

#### Step 1: 全量构建验证

Run: `npm run build`
Expected:
- 构建成功无错误
- `out/pitfall/index.html` 生成
- 控制台无 TypeScript 错误

#### Step 2: 筛选联动验证

Run: `npm run dev`
操作矩阵：
1. 选择分类 "嵌入式" → 预期：只显示 embedded 分类卡片
2. 在分类筛选基础上搜索 "指针" → 预期：只显示嵌入式分类中匹配"指针"的卡片
3. 清除分类 → 预期：搜索结果恢复为所有匹配卡片
4. 选择多个标签 → 预期：OR 逻辑，显示包含任一标签的卡片

#### Step 3: 空结果状态验证

操作：
1. 搜索一个不存在的词如 "xyznonexistent"
2. 预期：显示"没有匹配的踩坑记录"空状态
3. 点击"重置所有筛选条件"
4. 预期：所有卡片恢复显示

#### Step 4: Commit

```bash
git commit --allow-empty -m "test(pitfall): verify search, filter, and empty state behavior"
```

---

## Spec Coverage Checklist

| Spec Section | Task |
|---|---|
| 2.1 搜索入口（搜索框 UI、清除按钮、ESC、⌘K） | Task 1 Step 2 |
| 2.2 搜索逻辑（fuse.js 权重、阈值） | Task 1 Step 2 |
| 2.3 搜索结果展示（空状态、高亮） | Task 1 Step 2 + Task 2 |
| 2.4 筛选器交互（分类+标签+搜索联动） | Task 1 Step 2 |
| 3.1 数据结构（Pitfall 类型） | 已有，无需修改 |
| 3.2 搜索组件（PitfallListClient） | Task 1 Step 2 |
| 3.3 搜索逻辑实现（createFuse） | Task 1 Step 2 |
| 3.4 页面集成（server/client 分离） | Task 1 Step 3 |
| 4.1 搜索框样式（Tailwind） | Task 1 Step 2 |
| 4.2 搜索结果高亮 | Task 1 Step 2 + Task 2 |
