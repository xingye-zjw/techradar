"use client";

import Fuse from "fuse.js";
import type { IFuseOptions } from "fuse.js";

// ============ Fuse.js 默认配置 ============

export const FUSE_DEFAULTS: Partial<IFuseOptions<any>> = {
  includeScore: true,
  includeMatches: true,
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 1,
};

// ============ Fuse.js 工厂函数 ============

export function createFuse<T>(
  data: T[],
  keys: IFuseOptions<T>["keys"],
  options?: Partial<IFuseOptions<T>>
): Fuse<T> {
  return new Fuse<T>(data, {
    ...FUSE_DEFAULTS,
    keys,
    ...options,
  });
}

// ============ 模块类型配置 ============

export interface ModuleConfig {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const MODULE_CONFIG: Record<string, ModuleConfig> = {
  node: {
    label: "路线图",
    icon: "🗺️",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/30",
  },
  intel: {
    label: "情报",
    icon: "📰",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/30",
  },
  tool: {
    label: "工具",
    icon: "🔧",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
  },
  pitfall: {
    label: "踩坑",
    icon: "⚠️",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/30",
  },
  glossary: {
    label: "术语",
    icon: "📖",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
  },
} as const;

// ============ 统一高亮函数 ============

/**
 * 在文本中高亮搜索关键词
 * @param text 原始文本
 * @param query 搜索查询词
 * @param className 高亮标记的 CSS 类名（默认青色）
 */
export function highlightText(
  text: string,
  query: string,
  className = "bg-cyan-400/25 text-cyan-300 rounded-sm px-0.5 font-medium"
): React.ReactNode {
  if (!query.trim()) return text;

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (terms.length === 0) return text;

  terms.sort((a, b) => b.length - a.length);
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");

  const parts = text.split(pattern);
  return parts.map((part, idx) => {
    if (part.length > 0) {
      const freshPattern = new RegExp(`^(${escaped.join("|")})$`, "i");
      if (freshPattern.test(part)) {
        return (
          <mark key={idx} className={className}>
            {part}
          </mark>
        );
      }
    }
    return <span key={idx}>{part}</span>;
  });
}
