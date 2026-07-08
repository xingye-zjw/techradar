/**
 * P0-2.2 统一进度存储测试
 * RED 阶段：验证旧方案存在分裂问题（应该 fail），新方案满足单源真实
 */
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";

// 模拟浏览器环境 (jsdom 由 vitest.config.ts 提供)
const isJsdom = typeof window !== "undefined";

describe("进度存储单源真实 (Single Source of Truth)", () => {
  // 跳过在非 jsdom 环境
  if (!isJsdom) return;

  beforeEach(() => {
    localStorage.clear();
  });

  it("统一 STORAGE_KEY 而非分散（storage.ts + progress.ts 同一套数据）", async () => {
    // 动态加载模块
    const storage = await import("@/lib/storage");
    const progress = await import("@/lib/progress");

    // 写入
    storage.saveNodeProgress("cv-cnn", { completedDays: [1, 2, 3] } as any);

    // 读取 progress.ts 的接口，应立即看到结果（不分裂）
    const p = progress.getNodeProgress("cv-cnn");
    expect(p.completedDays.sort()).toEqual([1, 2, 3]);
  });

  it("dailyTasks 全完成后节点 completed=true 自动同步", async () => {
    // 这个测试先 FAIL，因为当前两套数据结构完全不沟通
    const storage = await import("@/lib/storage");
    const { FULL_ROADMAP } = await import("@/lib/roadmap-data");
    const target = FULL_ROADMAP.find((n: any) => (n.dailyTasks?.length ?? 0) > 0);
    expect(target, "找不到有 dailyTasks 的测试节点").toBeTruthy();
    if (!target) return;
    const days = Array.from({ length: (target as any).dailyTasks.length }, (_, i) => i + 1);
    storage.saveNodeProgress(target.id, { completedDays: days }, days.length);

    // 重新获取 progress 后节点应为 completed
    const current = storage.getProgress();
    const nodeRec = current.nodes[target.id];
    expect(nodeRec?.completedDays.length).toBe((target as any).dailyTasks.length);
    // 新增：auto-completed 字段
    expect(
      (nodeRec as any)?.autoCompleted || (nodeRec as any)?.status === "completed",
    ).toBeTruthy();
  });

  it("数据 schema 校验：completedDays 不接受非正数、字符串", async () => {
    const storage = await import("@/lib/storage");
    // 写入非法数据（模拟用户 DevTools 篡改）
    localStorage.setItem(
      storage.STORAGE_KEYS?.PROGRESS ?? "techradar_progress",
      JSON.stringify({ nodes: { x: { completedDays: [-1, 0, 1000, "abc"] } } }),
    );
    const p = storage.getProgress();
    // 结果里不能有非法 day
    const days = p.nodes["x"]?.completedDays || [];
    const allPositiveInts = days.every(
      (d: any) => typeof d === "number" && d > 0 && d < 200 && Number.isInteger(d),
    );
    expect(allPositiveInts).toBe(true);
  });

  it("统一 storage 导出了版本号与迁移函数", async () => {
    const storage = await import("@/lib/storage");
    expect(typeof (storage as any).SCHEMA_VERSION).toBe("number");
    expect(typeof (storage as any).migrateLegacyStorage).toBe("function");
  });
});
