/**
 * 轻量 Markdown 渲染器（客户端组件）
 * - 正确处理代码块 ```...```（不会被空行切分）
 * - 支持标题 h1-h4、有序/无序列表、引用、表格、内联代码、加粗、链接
 * - 不依赖任何第三方库，输出 React 元素
 * - 安全：链接通过 sanitizeUrl 过滤危险协议，外站链接二次确认
 *
 * 【Client Component 边界】
 * 此文件含有 "use client"（因为 <a> 的 onClick 使用 window.confirm）。
 * 纯算法函数 parseBlocks / extractToc 已抽离至 lib/markdown-utils.ts，
 * Server Components 应从那里 import，避免 client boundary proxy 引发的
 * RSC 序列化错误 "(0, o.o) is not a function"。
 */

"use client";

import { sanitizeUrl, isExternalUrl } from "@/lib/security";
import { parseBlocks } from "@/lib/markdown-utils";
import type { Block, HeadingMeta, TableMeta, TocItem } from "@/lib/markdown-utils";

/**
 * 行内文本渲染：处理 **bold**、`code`、[link](url)
 */
function renderInline(text: string, keyPrefix = ""): React.ReactNode[] {
  // 先按 token 切割：代码 / 加粗 / 链接 / 普通
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(pattern);
  return parts.map((part, idx) => {
    const key = `${keyPrefix}-${idx}`;

    // 代码 `code`
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={key}
          className="px-1.5 py-0.5 bg-neutral-800 text-green-400 rounded font-mono text-[12px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // 加粗 **text**
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="text-neutral-100 font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // 链接 [text](url) — 经 sanitizeUrl 过滤 + 外站二次确认
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const rawUrl = linkMatch[2];
      const safe = sanitizeUrl(rawUrl);
      if (!safe) {
        return (
          <span
            key={key}
            title="该链接使用了不被允许的协议，已禁用"
            className="line-through decoration-red-500/70 text-neutral-500 cursor-not-allowed"
          >
            {linkMatch[1]}
          </span>
        );
      }
      const external = isExternalUrl(safe);
      const rel = external ? "noopener noreferrer nofollow ugc" : undefined;
      const target = external ? "_blank" : undefined;
      return (
        <a
          key={key}
          href={safe}
          target={target}
          rel={rel}
          onClick={
            external
              ? (e) => {
                  const ok = window.confirm(
                    `即将离开 TechRadar 跳转到外部站点：\n${safe}\n是否继续？`,
                  );
                  if (!ok) e.preventDefault();
                }
              : undefined
          }
          className="text-cyan-400 underline decoration-dotted underline-offset-2 hover:text-cyan-300 transition-colors"
          title={external ? "外部链接，跳转请谨慎" : undefined}
        >
          {linkMatch[1]}
          {external && <sup className="ml-0.5 text-[9px] opacity-60 align-top">↗</sup>}
        </a>
      );
    }

    return <span key={key}>{part}</span>;
  });
}

// TocItem 类型与 extractToc 纯函数已抽离到 lib/markdown-utils.ts（Server-safe）
// 此处保留 re-export 以维持旧的 import 路径兼容
export { extractToc } from "@/lib/markdown-utils";
export type { TocItem } from "@/lib/markdown-utils";

export interface MarkdownRendererProps {
  source: string;
}

export function MarkdownRenderer({ source }: MarkdownRendererProps) {
  const blocks = parseBlocks(source);

  return (
    <div className="space-y-5">
      {blocks.map((block, idx) => {
        const blockId = `section-${idx}`;

        switch (block.type) {
          case "heading": {
            const level = (block.meta as HeadingMeta)?.level ?? 2;
            const Text = block.raw;
            if (level === 1) {
              return (
                <h2
                  key={idx}
                  id={blockId}
                  className="text-2xl font-bold text-green-400 mt-10 mb-4 scroll-mt-24"
                >
                  {Text}
                </h2>
              );
            }
            if (level === 2) {
              return (
                <h3
                  key={idx}
                  id={blockId}
                  className="text-xl font-bold text-cyan-400 mt-8 mb-3 scroll-mt-24"
                >
                  {Text}
                </h3>
              );
            }
            if (level === 3) {
              return (
                <h4
                  key={idx}
                  id={blockId}
                  className="text-base font-semibold text-neutral-100 mt-6 mb-2 scroll-mt-24"
                >
                  {Text}
                </h4>
              );
            }
            return (
              <h5 key={idx} className="text-sm font-semibold text-neutral-200 mt-5 mb-2">
                {Text}
              </h5>
            );
          }

          case "code": {
            const lang =
              "lang" in (block.meta || {}) ? (block.meta as TableMeta).lang || "code" : "code";
            return (
              <pre
                key={idx}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 overflow-x-auto font-mono text-xs leading-relaxed"
              >
                <div className="text-neutral-500 text-[10px] mb-2 pb-2 border-b border-neutral-800 flex items-center justify-between">
                  <span>{lang}</span>
                  <span className="opacity-50">{block.raw.split("\n").length} lines</span>
                </div>
                <code className="text-green-400 whitespace-pre">{block.raw}</code>
              </pre>
            );
          }

          case "list": {
            const items = block.raw.split("\n");
            return (
              <ul key={idx} className="space-y-1.5 pl-5 list-disc marker:text-green-400">
                {items.map((item, lIdx) => (
                  <li key={lIdx} className="text-sm text-neutral-400 leading-relaxed">
                    {renderInline(item, `list-${idx}-${lIdx}`)}
                  </li>
                ))}
              </ul>
            );
          }

          case "ordered-list": {
            const items = block.raw.split("\n");
            return (
              <ol
                key={idx}
                className="space-y-1.5 pl-6 list-decimal marker:text-green-400 marker:font-mono"
              >
                {items.map((item, lIdx) => (
                  <li key={lIdx} className="text-sm text-neutral-400 leading-relaxed">
                    {renderInline(item, `olist-${idx}-${lIdx}`)}
                  </li>
                ))}
              </ol>
            );
          }

          case "quote": {
            return (
              <blockquote
                key={idx}
                className="border-l-2 border-cyan-400/60 pl-4 py-2 italic text-neutral-400 bg-neutral-900/50 rounded-r"
              >
                {renderInline(block.raw, `quote-${idx}`)}
              </blockquote>
            );
          }

          case "table": {
            const tableMeta = block.meta as TableMeta;
            const { headerCells = [], aligns = [], rows = [] } = tableMeta;
            return (
              <div key={idx} className="overflow-x-auto border border-neutral-800 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-900 text-neutral-200">
                      {headerCells.map((h: string, hIdx: number) => (
                        <th
                          key={hIdx}
                          style={{ textAlign: aligns[hIdx] }}
                          className="px-3 py-2 font-semibold text-cyan-400 border-b border-neutral-800 font-mono text-xs"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row: string[], rIdx: number) => (
                      <tr
                        key={rIdx}
                        className="border-b border-neutral-800/50 last:border-b-0 hover:bg-neutral-900/40"
                      >
                        {row.map((cell: string, cIdx: number) => (
                          <td
                            key={cIdx}
                            style={{ textAlign: aligns[cIdx] }}
                            className="px-3 py-2 text-neutral-400 text-xs"
                          >
                            {renderInline(cell, `table-${idx}-${rIdx}-${cIdx}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          case "paragraph":
          default: {
            return (
              <p key={idx} className="text-sm text-neutral-400 leading-relaxed">
                {renderInline(block.raw, `p-${idx}`)}
              </p>
            );
          }
        }
      })}
    </div>
  );
}
