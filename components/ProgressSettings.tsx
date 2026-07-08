"use client";

import { useRef } from "react";
import { exportProgressAsJSON, importProgressFromJSON, resetProgress } from "@/lib/storage";
import { toast } from "@/components/Toast";

interface ProgressSettingsProps {
  onClose?: () => void;
}

export function ProgressSettings({ onClose: _onClose }: ProgressSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetProgressHandler = () => {
    resetProgress();
    toast.success("所有进度已重置");
    setTimeout(() => window.location.reload(), 600);
  };

  const handleExport = () => {
    // 完全复用 storage.ts 的统一导出格式：_format="tr-progress"、version=2
    const jsonStr = exportProgressAsJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `techradar-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("学习进度已导出");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const f = e.target.files?.[0];
      if (!f) return;
      const text = await f.text();
      // 走 storage.ts 官方导入 API：自动 schema 校验 + 覆盖非法字段
      const restored = importProgressFromJSON(text);
      const imported = Object.keys(restored.nodes || {}).length;
      toast.success(
        imported > 0
          ? `进度导入成功（${imported} 个节点），正在刷新...`
          : "进度导入成功，正在刷新...",
      );
      setTimeout(() => location.reload(), 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("导入失败: " + msg);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-200">学习进度管理</h3>
          <p className="text-xs text-neutral-500 mt-1">导出进度到文件，或从文件导入进度</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleExport}
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-cyan-500/50 hover:bg-neutral-800 transition-all"
        >
          <span className="text-2xl">📤</span>
          <span className="text-xs font-medium text-neutral-300">导出进度</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-green-500/50 hover:bg-neutral-800 transition-all"
        >
          <span className="text-2xl">📥</span>
          <span className="text-xs font-medium text-neutral-300">导入进度</span>
        </button>

        <button
          onClick={() => {
            if (confirm("确认清除全部进度？无法恢复")) {
              resetProgressHandler();
            }
          }}
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-red-500/50 hover:bg-neutral-800 transition-all"
        >
          <span className="text-2xl">↩️</span>
          <span className="text-xs font-medium text-neutral-300">重置进度</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImport}
        id="progress-import-input"
        className="hidden"
      />
    </div>
  );
}
