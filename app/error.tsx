"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="font-mono text-6xl font-bold text-red-400/20 mb-4">ERR</div>
        <h1 className="text-2xl font-bold mb-3">出错了</h1>
        <p className="text-neutral-400 mb-4 max-w-md mx-auto">
          页面渲染时发生了意外错误。
        </p>
        <p className="font-mono text-xs text-neutral-600 mb-8 max-w-md mx-auto break-all">
          {error.message || "Unknown error"}
        </p>
        <button
          onClick={reset}
          className="font-mono text-sm px-4 py-2 bg-red-400/10 text-red-400 border border-red-400/30 rounded-sm hover:bg-red-400/20 transition-colors"
        >
          重试
        </button>
      </div>
    </main>
  );
}
