/**
 * P0-CRITICAL: 进度存储SSOT完整性测试
 *
 * 验证：
 * 1. NodeDetailPanel 中的"每日任务勾选"与 storage.ts 的 getNodeProgress/saveNodeProgress 使用同一套数据
 * 2. ProgressSettings 使用 storage.ts 的导出/导入 API，而非硬编码 key
 * 3. progress-export.ts 不再保留独立 key（或正确迁移到统一）
 * 4. 不存在 techradar-task-progress / techradar_progress_v2 / techradar_progress 等分裂 key
 *
 *  RED → 全部应该 fail（在修复之前）
 *  GREEN → 修复后全部 pass
 */
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";

const isJsdom = typeof window !== "undefined";

describe("P0-CRITICAL: 进度存储SSOT完整性 (Storage Single Source of Truth)", () => {
  if (!isJsdom) return;

  beforeEach(() => {
    // 彻底清空所有潜在的分裂 key
    localStorage.clear();
    const legacyKeys = [
      "techradar-task-progress",
      "techradar_progress_v2",
      "techradar_progress",
      "techradar-roadmap-progress",
      "techradar_progress_linux-basic",
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  });

  // ─────────────────────────────────────────────────────
  // 1. 分裂检查：写入后，只存在 tr-progress 统一 key
  // ─────────────────────────────────────────────────────
  it("[RED→GREEN] 统一存储：任何写入操作后 localStorage 中只有 tr-progress 一个进度 key，不存在分裂 key", async () => {
    const storage = await import("@/lib/storage");

    // 触发一次写入
    storage.saveNodeProgress("cv-cnn", { completedDays: [1, 2] }, 14);

    // 收集所有与进度相关的 key
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) allKeys.push(k);
    }
    const progressLikeKeys = allKeys.filter(
      (k) => /progress|storage|打卡/i.test(k) || k.includes("techradar"),
    );

    // 期望值：只包含 tr-progress（storage.ts 统一 key） 与 UI 偏好的 tr-theme/tr-sidebar/tr-favorites/tr-recent
    const dirtyKeys = progressLikeKeys.filter(
      (k) =>
        k !== "tr-progress" &&
        k !== "tr-theme" &&
        k !== "tr-sidebar" &&
        k !== "tr-favorites" &&
        k !== "tr-recent",
    );
    expect(dirtyKeys, `发现分裂的进度存储 key: ${dirtyKeys.join(", ")}`).toEqual([]);
  });

  // ─────────────────────────────────────────────────────
  // 2. 导出/导入完整性：ProgressSettings 使用官方 API（非硬编码 key）
  // ─────────────────────────────────────────────────────
  it("[RED→GREEN] 导入导出：storage.exportProgressAsJSON 输出的内容能被 importProgressFromJSON 正确还原，且不依赖硬编码 key", async () => {
    const storage = await import("@/lib/storage");

    storage.saveNodeProgress("linux-basic", { completedDays: [1, 3, 5] }, 14);
    storage.saveNodeProgress("cv-cnn", { completedDays: [1, 2, 3, 4, 5, 6, 7] }, 14);

    const exported = storage.exportProgressAsJSON();
    expect(typeof exported).toBe("string");
    const parsed = JSON.parse(exported);
    expect(parsed._format).toBe("tr-progress");
    expect(parsed.version).toBe(storage.SCHEMA_VERSION);
    expect(parsed.progress).toBeDefined();
    expect(parsed.progress.nodes["linux-basic"]?.completedDays).toEqual([1, 3, 5]);
    expect(parsed.progress.nodes["cv-cnn"]?.completedDays).toEqual([1, 2, 3, 4, 5, 6, 7]);

    // 清空后导入
    localStorage.clear();
    const restored = storage.importProgressFromJSON(exported);
    expect(restored.nodes["linux-basic"]?.completedDays).toEqual([1, 3, 5]);
    expect(restored.nodes["cv-cnn"]?.completedDays).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  // ─────────────────────────────────────────────────────
  // 3. STORAGE_KEYS 暴露：不应存在 techradar-task-progress 这类独立常量
  // ─────────────────────────────────────────────────────
  it('[RED→GREEN] 常量暴露：storage.ts 暴露的 STORAGE_KEYS 中 PROGRESS 等于 "tr-progress"，且无分裂命名', async () => {
    const storage = await import("@/lib/storage");
    const KEYS = storage.STORAGE_KEYS_RUNTIME ?? (storage as any).STORAGE_KEYS;
    expect(KEYS?.PROGRESS).toBe("tr-progress");
    // 不允许出现 "techradar-*" 前缀
    const badValues = Object.values(KEYS || {}).filter(
      (v) => typeof v === "string" && v.startsWith("techradar-"),
    );
    expect(badValues).toEqual([]);
  });

  // ─────────────────────────────────────────────────────
  // 4. 无脏数据导入时，独立 key 绝不能被创建（Regression guard）
  // ─────────────────────────────────────────────────────
  it("[RED→GREEN] 防回归：调用 resetProgress 时不能残留分裂 key", async () => {
    const storage = await import("@/lib/storage");
    // 先模拟用户旧浏览器里的脏数据
    localStorage.setItem("techradar-task-progress", JSON.stringify({ x: { 1: true } }));
    localStorage.setItem("techradar_progress_v2", JSON.stringify({ nodes: {} }));
    localStorage.setItem("techradar_progress", "{}");
    localStorage.setItem("techradar-roadmap-progress", "{}");
    localStorage.setItem("techradar_progress_linux-basic", "{}");

    storage.resetProgress();

    // 检查：resetProgress 应该清掉所有可能的分裂 key
    expect(localStorage.getItem("techradar-task-progress")).toBeNull();
    expect(localStorage.getItem("techradar_progress_v2")).toBeNull();
    expect(localStorage.getItem("techradar_progress")).toBeNull();
    expect(localStorage.getItem("techradar-roadmap-progress")).toBeNull();
    expect(localStorage.getItem("techradar_progress_linux-basic")).toBeNull();
    expect(localStorage.getItem("raw_roadmap_progress")).toBeNull();
    expect(localStorage.getItem("roadmap-progress")).toBeNull();
    expect(localStorage.getItem("tr-progress")).toBeNull();
  });
});
