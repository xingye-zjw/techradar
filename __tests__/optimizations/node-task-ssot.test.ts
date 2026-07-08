/**
 * P0-10a: NodeDetailPanel 任务勾选 SSOT 测试
 *
 * 验证：
 * 1. toggleDay() 之后，completedDays 与"任务勾选视图"的状态一致
 * 2. NodeDetailPanel 不应再依赖 techradar-task-progress 独立 key
 * 3. getNodeProgress 是任务勾选状态的唯一数据源
 */
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";

const isJsdom = typeof window !== "undefined";

describe("P0-CRITICAL: NodeDetailPanel 任务勾选与 completedDays 统一", () => {
  if (!isJsdom) return;

  beforeEach(() => {
    localStorage.clear();
  });

  it("[RED→GREEN] toggleDay 切换后，任务勾选状态能从 getNodeProgress 直接推导，且不创建分裂 key", async () => {
    const storage = await import("@/lib/storage");

    // 模拟用户打开 NodeDetailPanel，勾选 D3
    const daysAfter = storage.toggleDay("linux-basic", 3);
    expect(daysAfter).toContain(3);

    // 通过 getNodeProgress 能直接看到（这是 UI 唯一应该读取的地方）
    const nodeProgress = storage.getNodeProgress("linux-basic");
    expect(nodeProgress.completedDays).toContain(3);
    expect(nodeProgress.status).toBe("in-progress");

    // 再次 toggle 回去
    const daysAfter2 = storage.toggleDay("linux-basic", 3);
    expect(daysAfter2).not.toContain(3);
    expect(storage.getNodeProgress("linux-basic").completedDays).not.toContain(3);

    // 关键断言：绝不能创建 techradar-task-progress 分裂 key
    expect(localStorage.getItem("techradar-task-progress")).toBeNull();

    // 也不应该存在硬编码的 progress_v2 等
    expect(localStorage.getItem("techradar_progress_v2")).toBeNull();
    expect(localStorage.getItem("techradar_progress")).toBeNull();

    // 只存在统一的 tr-progress 与 UI 偏好 key
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      expect(k === "tr-progress" || k.startsWith("tr-") || !/progress|techradar/i.test(k)).toBe(
        true,
      );
    }
  });

  it("[RED→GREEN] 节点 full completed：所有 day 完成后 status===completed 且 autoCompleted=true", async () => {
    const storage = await import("@/lib/storage");
    const total = 10;
    // 逐天打卡
    for (let d = 1; d <= total; d++) {
      storage.toggleDay("cv-cnn", d);
    }
    // 再走 saveNodeProgress 写入 totalDays 触发 autoCompleted
    const rec = storage.getNodeProgress("cv-cnn");
    storage.saveNodeProgress("cv-cnn", { completedDays: rec.completedDays }, total);

    const updated = storage.getNodeProgress("cv-cnn");
    expect(updated.status).toBe("completed");
    expect((updated as any).autoCompleted).toBe(true);
    expect(updated.completedDays.length).toBe(total);
  });
});
