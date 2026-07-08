"use client";

/**
 * 学习进度导入/导出管理（SSOT 重写版）
 *
 * 不再使用独立的 localStorage key：
 *   - techradar_progress_{nodeId}  ❌  移除
 *   - techradar-roadmap-progress  ❌  移除
 *   - techradar-task-progress     ❌  移除
 * 所有数据统一复用 lib/storage.ts 的 tr-progress 单源真象。
 *
 * 提供：下载为 JSON、从文件上传导入、一键清除（重置）。
 */

import {
  exportProgressAsJSON,
  importProgressFromJSON,
  resetProgress,
  clearAllSplinterKeys,
} from "@/lib/storage";
import type { LearningProgress } from "@/lib/storage";
import { toast } from "@/components/Toast";

export interface ProgressData {
  version: number;
  exportedAt: string;
  progress: LearningProgress;
}

/**
 * 导出所有学习进度为可下载的 JSON 文件
 * SSOT 实现：完全复用 lib/storage 的 exportProgressAsJSON()
 */
export function downloadProgress(): void {
  if (typeof window === "undefined") return;
  const jsonStr = exportProgressAsJSON();
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `techradar-progress-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("学习进度已导出");
}

/**
 * 导入学习进度（从 File 对象）
 * 完全复用 lib/storage 的 importProgressFromJSON，任何格式不合法都会抛错。
 */
export async function importFromFile(
  file: File,
): Promise<{ success: boolean; imported: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;
  try {
    const text = await file.text();
    const restored = importProgressFromJSON(text);
    imported = Object.keys(restored.nodes || {}).length;
    toast.success(`进度导入成功（${imported} 个节点），正在刷新...`);
    setTimeout(() => location.reload(), 600);
    return { success: true, imported, errors };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(msg);
    toast.error("导入失败: " + msg);
    return { success: false, imported: 0, errors };
  }
}

/**
 * 清除所有学习进度（含历史遗留分裂 key）
 */
export function clearAllProgress(): void {
  resetProgress();
  // 双保险：storage.ts resetProgress 已调用 clearAllSplinterKeys()，此处冗余调用防止未来回归
  clearAllSplinterKeys();
}

/**
 * 导出原始进度数据（给 ProgressSettings UI 展示或自定义处理用）
 */
export function exportProgress(): ProgressData {
  const jsonStr = exportProgressAsJSON();
  const parsed = JSON.parse(jsonStr);
  return {
    version: parsed.version,
    exportedAt: parsed.exportedAt,
    progress: parsed.progress as LearningProgress,
  };
}

/**
 * 导入原始进度数据对象（非文件）
 */
export function importProgress(data: unknown): {
  success: boolean;
  imported: number;
  errors: string[];
} {
  const errors: string[] = [];
  try {
    const restored = importProgressFromJSON(typeof data === "string" ? data : JSON.stringify(data));
    return {
      success: true,
      imported: Object.keys(restored.nodes || {}).length,
      errors: [],
    };
  } catch (err: unknown) {
    errors.push(err instanceof Error ? err.message : String(err));
    return { success: false, imported: 0, errors };
  }
}
