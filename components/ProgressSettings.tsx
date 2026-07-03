"use client";

/**
 * 进度设置组件
 * 支持导入/导出/清除学习进度
 */

import { useState, useRef } from "react";
import { downloadProgress, importFromFile, clearAllProgress } from "@/lib/progress-export";
import { toast } from "@/components/Toast";

interface ProgressSettingsProps {
  onClose?: () => void;
}

export function ProgressSettings({ onClose }: ProgressSettingsProps) {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      downloadProgress();
      toast.success("进度已导出");
    } catch (e) {
      toast.error("导出失败");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importFromFile(file);
      if (result.success) {
        toast.success(`成功导入 ${result.imported} 个节点的进度`);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(`导入失败: ${result.errors[0]}`);
      }
    } catch (err) {
      toast.error("导入失败");
    }

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    clearAllProgress();
    toast.success("所有进度已清除");
    setShowConfirmClear(false);
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-200">学习进度管理</h3>
          <p className="text-xs text-neutral-500 mt-1">
            导出进度到文件，或从文件导入进度
          </p>
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
          onClick={handleImportClick}
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-green-500/50 hover:bg-neutral-800 transition-all"
        >
          <span className="text-2xl">📥</span>
          <span className="text-xs font-medium text-neutral-300">导入进度</span>
        </button>

        <button
          onClick={() => setShowConfirmClear(true)}
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-red-500/50 hover:bg-neutral-800 transition-all"
        >
          <span className="text-2xl">🗑️</span>
          <span className="text-xs font-medium text-neutral-300">清除进度</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 清除确认对话框 */}
      {showConfirmClear && (
        <div className="p-4 rounded-lg bg-red-950/30 border border-red-900/50">
          <p className="text-sm text-red-300 mb-3">
            ⚠️ 确定要清除所有学习进度吗？此操作不可撤销。
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="flex-1 py-2 px-3 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors"
            >
              确认清除
            </button>
            <button
              onClick={() => setShowConfirmClear(false)}
              className="flex-1 py-2 px-3 rounded-md bg-neutral-700 text-neutral-200 text-sm font-medium hover:bg-neutral-600 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
