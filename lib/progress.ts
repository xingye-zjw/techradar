/**
 * 旧 API 兼容层 (Adapter) —— 所有调用直接转发到 lib/storage.ts 的统一实现。
 *
 * 保留公开签名：
 *   - getNodeProgress(nodeId): { completedDays, lastUpdated }
 *   - saveNodeProgress(nodeId, progress)
 *   - markDayComplete / unmarkDayComplete
 *   - isDayComplete / getNodeProgressPercent / getCompletedDaysCount
 *   - clearNodeProgress
 *
 * 新代码请直接 import 自 @/lib/storage（单源真实，语义更强）
 */

import {
  getProgress,
  saveProgress,
  saveNodeProgress as saveNode,
  getNodeProgress as getNode,
  toggleDay,
} from "./storage";
import { SCHEMA_VERSION as _SCHEMA_VERSION } from "./security";

export const SCHEMA_VERSION = _SCHEMA_VERSION;

/**
 * 迁移旧存储：当前统一存储层 getProgress() 在第一次读时已自动迁移老 key；
 * 此函数保留用于向后兼容，返回迁移后的新进度快照。
 */
export function migrateLegacyStorage() {
  const p = getProgress();
  saveProgress(p);
  return p;
}

export interface NodeProgress {
  completedDays: number[];
  lastUpdated: string;
}

export function getNodeProgress(nodeId: string): NodeProgress {
  const inner = getNode(nodeId);
  return {
    completedDays: inner.completedDays.slice(),
    lastUpdated: new Date(getProgress().updatedAt || Date.now()).toISOString(),
  };
}

export function saveNodeProgress(nodeId: string, progress: Partial<NodeProgress>): void {
  saveNode(nodeId, {
    completedDays: progress.completedDays ?? [],
  });
}

export function markDayComplete(nodeId: string, day: number): void {
  // 先查，如果不在 -> toggle (添加)；如果已在 -> 不变
  const node = getNode(nodeId);
  if (!node.completedDays.includes(day)) {
    toggleDay(nodeId, day);
  }
}

export function unmarkDayComplete(nodeId: string, day: number): void {
  const node = getNode(nodeId);
  if (node.completedDays.includes(day)) {
    toggleDay(nodeId, day);
  }
}

export function isDayComplete(nodeId: string, day: number): boolean {
  return getNode(nodeId).completedDays.includes(day);
}

export function getNodeProgressPercent(nodeId: string, totalDays: number): number {
  if (totalDays === 0) return 0;
  return Math.round((getNode(nodeId).completedDays.length / totalDays) * 100);
}

export function getCompletedDaysCount(nodeId: string): number {
  return getNode(nodeId).completedDays.length;
}

export function clearNodeProgress(nodeId: string): void {
  const all = getProgress();
  delete all.nodes[nodeId];
  all.updatedAt = Date.now();
  // 必须走统一存储层 API，避免双轨写脏数据
  saveProgress(all);
}
