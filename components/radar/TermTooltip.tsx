"use client";

import { useState, useRef, useEffect } from "react";

interface TermTooltipProps {
  /** 术语名称 */
  term: string;
  /** 术语解释 */
  explanation: string;
  /** 可选链接 */
  link?: string;
  /** 子元素 */
  children: React.ReactNode;
}

/**
 * 术语 Tooltip 组件
 * 桌面端：hover 显示解释
 * 移动端：点击展开解释
 */
export function TermTooltip({ term, explanation, link, children }: TermTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInteraction = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <span
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => !isMobile && setIsOpen(true)}
      onMouseLeave={() => !isMobile && setIsOpen(false)}
      onClick={handleInteraction}
    >
      <span className="border-b border-dashed border-cyan-400/60 text-cyan-300 cursor-help transition-colors hover:border-cyan-400 hover:text-cyan-200">
        {children}
      </span>

      {isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${
            isMobile
              ? "fixed inset-x-4 bottom-4 top-auto"
              : "bottom-full left-1/2 -translate-x-1/2 mb-2"
          }`}
        >
          <div className={`bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl ${
            isMobile ? "p-4" : "p-3 min-w-[200px] max-w-[300px]"
          }`}>
            {/* 术语标题 */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-cyan-400 font-mono">{term}</span>
            </div>

            {/* 解释内容 */}
            <p className="text-xs text-zinc-300 leading-relaxed">{explanation}</p>

            {/* 可选链接 */}
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-400 hover:text-emerald-300"
              >
                <span>了解更多</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            {/* 移动端关闭按钮 */}
            {isMobile && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="mt-3 w-full py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-700/50 rounded transition-colors"
              >
                关闭
              </button>
            )}

            {/* 桌面端箭头 */}
            {!isMobile && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-zinc-800" />
            )}
          </div>
        </div>
      )}
    </span>
  );
}
