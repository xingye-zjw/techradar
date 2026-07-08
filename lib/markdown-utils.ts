/**
 * Markdown 纯工具函数（无客户端副作用，可在 Server Component 安全使用）
 *
 * 【为什么独立成模块？】
 * 原 parseBlocks / extractToc 定义在带有 "use client" 的 MarkdownRenderer.tsx 中。
 * 虽然它们是纯字符串算法，但 Next.js / Webpack 会把 "use client" 文件的所有
 * named exports 视为 client boundary。在 Server Component 中 import 并调用它们时，
 * 返回值可能被包装成 Flight Proxy，导致后续 RSC Payload 序列化阶段
 * （Array.toJSON）抛出 "TypeError: (0, o.o) is not a function"。
 *
 * 把纯算法抽离到这个无 "use client" 的独立文件即可 100% 规避。
 *
 * - parseBlocks: 把 Markdown 字符串拆分成块列表（heading / list / table / code ...）
 * - extractToc: 仅提取 h2 级别标题作为 TOC（不渲染）
 */

export interface HeadingMeta {
  level: number;
}

export interface TableMeta {
  lang?: string;
  headerCells?: string[];
  aligns?: ("left" | "center" | "right")[];
  rows?: string[][];
}

export interface Block {
  type: "code" | "heading" | "list" | "ordered-list" | "quote" | "table" | "paragraph";
  raw: string;
  meta?: HeadingMeta | TableMeta;
}

export function parseBlocks(source: string): Block[] {
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
    if (
      /^\s*\|/.test(line) &&
      i + 1 < lines.length &&
      /^\s*\|?\s*[-:|\s]+\|?\s*$/.test(lines[i + 1])
    ) {
      const headerCells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      const sepLine = lines[i + 1];
      const aligns = sepLine
        .split("|")
        .slice(1, -1)
        .map((c) => {
          const t = c.trim();
          if (t.startsWith(":") && t.endsWith(":")) return "center";
          if (t.endsWith(":")) return "right";
          return "left";
        });
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        rows.push(
          lines[i]
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim()),
        );
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

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * 仅提取目录（TOC），不渲染。返回 h2 级别标题列表。
 * Server / Client 通用。
 */
export function extractToc(source: string): TocItem[] {
  const blocks = parseBlocks(source);
  const toc: TocItem[] = [];
  blocks.forEach((b, idx) => {
    if (b.type === "heading" && b.meta && "level" in b.meta && b.meta.level === 2) {
      toc.push({ id: `section-${idx}`, text: b.raw, level: b.meta.level });
    }
  });
  return toc;
}
