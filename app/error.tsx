"use client";

import Link from "next/link";
import { useState } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";
  const [copied, setCopied] = useState(false);

  const copyError = async () => {
    try {
      await navigator.clipboard.writeText(
        `Error: ${error.message || "Unknown error"}\nDigest: ${error.digest || "N/A"}\nStack: ${error.stack || "N/A"}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 忽略复制失败 */
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="font-mono text-6xl font-bold text-red-400/20 mb-4">ERR</div>
        <h1 className="text-2xl font-bold mb-3">出错了</h1>
        <p className="text-neutral-400 mb-4 max-w-md mx-auto">
          页面渲染时发生了意外错误，请稍后重试或返回首页。
        </p>

        {isDev && (
          <details className="text-left max-w-lg mx-auto mb-8 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
            <summary className="cursor-pointer px-4 py-3 text-sm text-neutral-400 hover:text-neutral-200 border-b border-neutral-800">
              错误详情（仅开发环境可见）
            </summary>
            <div className="p-4">
              <p className="font-mono text-xs text-red-400 break-all whitespace-pre-wrap mb-3">
                {error.message || "Unknown error"}
              </p>
              {error.digest && (
                <p className="font-mono text-[10px] text-neutral-500 mb-2">
                  Digest: {error.digest}
                </p>
              )}
              {error.stack && (
                <pre className="font-mono text-[10px] text-neutral-500 overflow-auto max-h-40 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="font-mono text-sm px-4 py-2 bg-green-400/10 text-green-400 border border-green-400/30 rounded-sm hover:bg-green-400/20 transition-colors"
          >
            返回首页
          </Link>
          <Link
            href="/search"
            className="font-mono text-sm px-4 py-2 bg-neutral-900 text-neutral-400 border border-neutral-800 rounded-sm hover:border-neutral-600 transition-colors"
          >
            搜索
          </Link>
          <button
            onClick={copyError}
            className="font-mono text-sm px-4 py-2 bg-neutral-900 text-neutral-400 border border-neutral-800 rounded-sm hover:border-neutral-600 transition-colors"
          >
            {copied ? "已复制 ✓" : "复制错误"}
          </button>
          <button
            onClick={reset}
            className="font-mono text-sm px-4 py-2 bg-red-400/10 text-red-400 border border-red-400/30 rounded-sm hover:bg-red-400/20 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    </main>
  );
}
