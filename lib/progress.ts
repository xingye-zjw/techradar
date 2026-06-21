"use client";

/**
 * 学习进度管理工具
 * 使用 localStorage 存储每个节点的学习进度
 */

const STORAGE_PREFIX = "techradar_progress_";

interface NodeProgress {
  completedDays: number[];
  lastUpdated: string;
}

/**
 * 获取节点的学习进度
 */
export function getNodeProgress(nodeId: string): NodeProgress {
  if (typeof window === "undefined") {
    return { completedDays: [], lastUpdated: "" };
  }

  try {
    const key = `${STORAGE_PREFIX}${nodeId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to read progress:", e);
  }

  return { completedDays: [], lastUpdated: "" };
}

/**
 * 保存节点的学习进度
 */
export function saveNodeProgress(nodeId: string, progress: NodeProgress): void {
  if (typeof window === "undefined") return;

  try {
    const key = `${STORAGE_PREFIX}${nodeId}`;
    localStorage.setItem(key, JSON.stringify({
      ...progress,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (e) {
    console.error("Failed to save progress:", e);
  }
}

/**
 * 标记某天任务完成
 */
export function markDayComplete(nodeId: string, day: number): void {
  const progress = getNodeProgress(nodeId);
  if (!progress.completedDays.includes(day)) {
    progress.completedDays.push(day);
    progress.completedDays.sort((a, b) => a - b);
    saveNodeProgress(nodeId, progress);
  }
}

/**
 * 取消某天任务完成标记
 */
export function unmarkDayComplete(nodeId: string, day: number): void {
  const progress = getNodeProgress(nodeId);
  progress.completedDays = progress.completedDays.filter(d => d !== day);
  saveNodeProgress(nodeId, progress);
}

/**
 * 判断某天是否已完成
 */
export function isDayComplete(nodeId: string, day: number): boolean {
  const progress = getNodeProgress(nodeId);
  return progress.completedDays.includes(day);
}

/**
 * 获取节点完成进度百分比
 * @param nodeId 节点 ID
 * @param totalDays 总天数
 */
export function getNodeProgressPercent(nodeId: string, totalDays: number): number {
  if (totalDays === 0) return 0;
  const progress = getNodeProgress(nodeId);
  return Math.round((progress.completedDays.length / totalDays) * 100);
}

/**
 * 获取已完成天数
 */
export function getCompletedDaysCount(nodeId: string): number {
  const progress = getNodeProgress(nodeId);
  return progress.completedDays.length;
}

/**
 * 清除节点的所有进度
 */
export function clearNodeProgress(nodeId: string): void {
  if (typeof window === "undefined") return;
  const key = `${STORAGE_PREFIX}${nodeId}`;
  localStorage.removeItem(key);
}
