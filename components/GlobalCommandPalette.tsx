"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import type { UnifiedSearchItem } from "@/lib/search";

interface Props {
  items: UnifiedSearchItem[];
  fuseOptions?: ConstructorParameters<typeof Fuse>[1];
}

export default function GlobalCommandPalette({ items, fuseOptions }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(
        items,
        fuseOptions ?? {
          includeScore: true,
          threshold: 0.3,
          ignoreLocation: true,
          keys: ["title", "content", "tags"],
        },
      ),
    [items, fuseOptions],
  );

  const results = useMemo(
    () =>
      q.trim()
        ? fuse
            .search(q)
            .slice(0, 20)
            .map((r) => r.item)
        : items.slice(0, 8),
    [fuse, q],
  );

  const openModal = useCallback(() => {
    setOpen(true);
    setQ("");
    setIdx(0);
    setTimeout(() => inputRef.current?.focus(), 10);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open ? setOpen(false) : openModal();
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIdx((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        const r = results[idx];
        if (r) {
          e.preventDefault();
          setOpen(false);
          router.push(r.url);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openModal, results, idx, router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[10vh] px-4"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl border border-neutral-700 bg-neutral-900/95 shadow-2xl shadow-black/40 overflow-hidden"
      >
        <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3">
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
            ⌘K
          </kbd>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            placeholder="搜索技术情报、路线图节点、术语、工具、项目、避雷指南..."
            className="flex-1 bg-transparent outline-none text-neutral-100 placeholder:text-neutral-500"
            autoFocus
          />
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-neutral-500 hover:text-neutral-300"
          >
            Esc
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="p-6 text-center text-sm text-neutral-400">
              未匹配结果，试试其它关键词
            </div>
          ) : (
            results.map((r, i) => (
              <Link
                key={r.id}
                href={r.url}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 border-x-2 border-transparent ${
                  i === idx ? "bg-neutral-800 border-l-[#0078D4]" : "hover:bg-neutral-800/60"
                }`}
              >
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    r.type === "intel"
                      ? "bg-[#0078D4]/20 text-[#60A5FA]"
                      : (r.type as string) === "roadmap" || r.type === "node"
                        ? "bg-[#107C10]/20 text-[#6A9955]"
                        : (r.type as string) === "glossary"
                          ? "bg-[#8B5CF6]/20 text-[#C4B5FD]"
                          : r.type === "tool"
                            ? "bg-[#FF8C00]/20 text-[#FFB86B]"
                            : r.type === "pitfall"
                              ? "bg-[#D2122E]/20 text-[#FF8A8A]"
                              : r.type === "project"
                                ? "bg-[#036666]/20 text-[#4ECDC4]"
                                : "bg-neutral-800 text-neutral-300"
                  }`}
                >
                  {r.typeLabel || r.type}
                </span>
                <span className="flex-1 truncate text-neutral-100">{r.title}</span>
                {r.category && (
                  <span className="text-xs text-neutral-500 truncate max-w-[120px]">
                    {r.category}
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
        <div className="flex justify-between items-center border-t border-neutral-800 px-4 py-2 text-[11px] text-neutral-500">
          <div className="flex items-center gap-3">
            <span>↑↓ 导航</span>
            <span>Enter 打开</span>
            <span>Esc 关闭</span>
          </div>
          <span>{results.length} 条结果</span>
        </div>
      </div>
    </div>
  );
}
