export default function Loading() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="font-mono text-sm text-neutral-500">加载中...</p>
      </div>
    </main>
  );
}
