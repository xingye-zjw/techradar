import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="font-mono text-8xl font-bold text-green-400/20 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-3">页面未找到</h1>
        <p className="text-neutral-400 mb-8 max-w-md mx-auto">
          你访问的页面不存在，可能已被移动或删除。
        </p>
        <div className="flex gap-4 justify-center">
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
            搜索情报
          </Link>
        </div>
      </div>
    </main>
  );
}
