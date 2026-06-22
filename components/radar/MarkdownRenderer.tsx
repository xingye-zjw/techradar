/**
 * 轻量 Markdown 渲染器
 * - 正确处理代码块 ```...```（不会被空行切分）
 * - 支持标题 h1-h4、有序/无序列表、引用、表格、内联代码、加粗、链接
 * - 不依赖任何第三方库，输出 React 元素
 *
 * 设计思路：先扫描拆分出"块"（block），再逐块渲染
 */

interface HeadingMeta {
  level: number;
}

interface TableMeta {
  lang?: string;
  headerCells?: string[];
  aligns?: ("left" | "center" | "right")[];
  rows?: string[][];
}

interface Block {
  type: "code" | "heading" | "list" | "ordered-list" | "quote" | "table" | "paragraph";
  raw: string;
  meta?: HeadingMeta | TableMeta;
}

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 代码块 ```...```
    if (/^\s*```/.test(line)) {
      const lang = line.replace(/^\s*```/, "").trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // 跳过结束 ```
      blocks.push({ type: "code", raw: codeLines.join("\n"), meta: { lang } });
      continue;
    }

    // 空行跳过
    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    // 标题
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        raw: headingMatch[2].trim(),
        meta: { level: headingMatch[1].length },
      });
      i++;
      continue;
    }

    // 引用块 > ... （连续多行合并）
    if (/^\s*>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", raw: quoteLines.join("\n") });
      continue;
    }

    // 无序列表（以 - / * 开头，连续多行合并）
    if (/^\s*[-*]\s+/.test(line)) {
      const listLines: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        listLines.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", raw: listLines.join("\n") });
      continue;
    }

    // 有序列表 1. 2. 3.
    if (/^\s*\d+\.\s+/.test(line)) {
      const listLines: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        listLines.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ordered-list", raw: listLines.join("\n") });
      continue;
    }

    // 表格（检测 | 开头的行 + 下一行是分隔行）
    if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*[-:|\s]+\|?\s*$/.test(lines[i + 1])) {
      const headerCells = line.split("|").slice(1, -1).map((c) => c.trim());
      const sepLine = lines[i + 1];
      const aligns = sepLine.split("|").slice(1, -1).map((c) => {
        const t = c.trim();
        if (t.startsWith(":") && t.endsWith(":")) return "center";
        if (t.endsWith(":")) return "right";
        return "left";
      });
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        rows.push(lines[i].split("|").slice(1, -1).map((c) => c.trim()));
        i++;
      }
      blocks.push({ type: "table", raw: "", meta: { headerCells, aligns, rows } });
      continue;
    }

    // 普通段落（连续非空行合并直到空行或遇到块元素）
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^\s*```/.test(lines[i]) &&
      !/^#{1,4}\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", raw: paraLines.join(" ") });
    }
  }

  return blocks;
}

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

    // 链接 [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={key}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 underline decoration-dotted underline-offset-2 hover:text-cyan-300"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return <span key={key}>{part}</span>;
  });
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

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
                <h2 key={idx} id={blockId} className="text-2xl font-bold text-green-400 mt-10 mb-4 scroll-mt-24">
                  {Text}
                </h2>
              );
            }
            if (level === 2) {
              return (
                <h3 key={idx} id={blockId} className="text-xl font-bold text-cyan-400 mt-8 mb-3 scroll-mt-24">
                  {Text}
                </h3>
              );
            }
            if (level === 3) {
              return (
                <h4 key={idx} id={blockId} className="text-base font-semibold text-neutral-100 mt-6 mb-2 scroll-mt-24">
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
            const lang = ('lang' in (block.meta || {})) ? (block.meta as TableMeta).lang || "code" : "code";
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
              <ol key={idx} className="space-y-1.5 pl-6 list-decimal marker:text-green-400 marker:font-mono">
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
                      <tr key={rIdx} className="border-b border-neutral-800/50 last:border-b-0 hover:bg-neutral-900/40">
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

/**
 * 仅提取目录（TOC），不渲染
 */
export function extractToc(source: string): TocItem[] {
  const blocks = parseBlocks(source);
  const toc: TocItem[] = [];
  blocks.forEach((b, idx) => {
    if (b.type === "heading" && b.meta && 'level' in b.meta && b.meta.level === 2) {
      toc.push({ id: `section-${idx}`, text: b.raw, level: b.meta.level });
    }
  });
  return toc;
}
