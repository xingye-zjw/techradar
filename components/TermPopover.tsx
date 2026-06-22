"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { GlossaryTerm } from "@/lib/glossary";

interface TermPopoverProps {
  term: GlossaryTerm;
  children: React.ReactNode;
  showRelated?: boolean;
}

export function TermPopover({ term, children, showRelated = false }: TermPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: "bottom" as "top" | "bottom" });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const isClickOpen = useRef(false);

  const calculatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
      const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
      const popoverHeight = 280; // 预估高度
      const popoverWidth = 320;

      // 判断下方是否有足够空间
      const spaceBelow = viewportHeight - rect.bottom;
      const placement = spaceBelow > popoverHeight + 16 ? "bottom" : "top";

      const top = placement === "bottom"
        ? rect.bottom + 8
        : rect.top - popoverHeight - 8;

      const left = Math.min(
        Math.max(16, rect.left),
        viewportWidth - popoverWidth - 16
      );

      setPosition({ top: Math.max(8, top), left, placement });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
    }
  }, [isOpen, calculatePosition]);

  // 点击外部关闭 + Escape 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        isClickOpen.current = false;
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        isClickOpen.current = false;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    // 移动端禁用 hover 行为，仅使用点击交互
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    if (!isClickOpen.current) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    // 移动端禁用 hover 行为，仅使用点击交互
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    if (!isClickOpen.current) {
      setIsOpen(false);
    }
  };

  const handleClick = () => {
    isClickOpen.current = !isClickOpen.current;
    setIsOpen(isClickOpen.current);
  };

  const handleClose = () => {
    setIsOpen(false);
    isClickOpen.current = false;
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="inline cursor-pointer border-b border-dashed border-cyan-400/50 text-cyan-400 hover:text-cyan-300 hover:border-cyan-400 transition-colors"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {children}
      </span>

      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed z-[100] w-80 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden animate-fade-in"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="tooltip"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-800 border-b border-neutral-700">
            <div className="flex items-center gap-2">
              <Link
                href={`/glossary/${term.slug}`}
                className="font-bold text-neutral-100 hover:text-cyan-400 transition-colors"
                onClick={handleClose}
              >
                {term.name}
              </Link>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                {term.category}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="text-neutral-500 hover:text-neutral-300 transition-colors"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-sm text-neutral-300 leading-relaxed mb-3">
              {term.summary}
            </p>

            {/* Related terms */}
            {showRelated && term.relatedTerms.length > 0 && (
              <div className="pt-3 border-t border-neutral-700">
                <div className="font-mono text-[10px] text-neutral-500 uppercase mb-2">
                  关联术语
                </div>
                <div className="flex flex-wrap gap-1">
                  {term.relatedTerms.slice(0, 3).map((slug) => (
                    <span
                      key={slug}
                      className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-400"
                    >
                      {slug}
                    </span>
                  ))}
                  {term.relatedTerms.length > 3 && (
                    <span className="text-xs text-neutral-500">
                      +{term.relatedTerms.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action */}
            <div className="pt-3 border-t border-neutral-700 mt-3">
              <Link
                href={`/glossary/${term.slug}`}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm"
                onClick={handleClose}
              >
                查看详情 →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * 简易版术语高亮组件 - 用于在文本中自动识别并标记术语
 * 不显示 popover，只显示为可点击的高亮文本
 */
export function TermHighlight({
  term,
  children,
}: {
  term: GlossaryTerm;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/glossary/${term.slug}`}
      className="inline cursor-pointer border-b border-dashed border-cyan-400/50 text-cyan-400 hover:text-cyan-300 hover:border-cyan-400 transition-colors"
    >
      {children}
    </Link>
  );
}
