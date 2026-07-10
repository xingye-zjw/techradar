/**
 * P0 Q-02 RoadmapGraph 存储 key 分裂修复 + 迁移（TDD）
 *  - T1：合法 legacy key (techradar-roadmap-progress) → 迁移到 tr-progress: nodes.*
 *  - T2：非法 JSON legacy key → 不抛错，安全删除
 *  - T3：saveNodeCompletedSet 往返 20 个 Set<string> nodeId 结果一致
 */
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";

const isJsdom = typeof window !== "undefined";

describe("Q-02 RoadmapGraph splinter storage 修复 + 迁移", () => {
  if (!isJsdom) return;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    // 清除递归标志
    const g = globalThis as { __tr_clearSplinter?: boolean };
    delete g.__tr_clearSplinter;
  });

  it("T1: legacy 'techradar-roadmap-progress' 合法数据 → 迁移到统一存储 nodes.* 并清除旧 key", async () => {
    const storage = await import("@/lib/storage");

    // ------ 1) 种子：模拟 RoadmapGraph 旧格式遗留数据 ------
    const legacyData = {
      "node-cv-1": { status: "completed", completedDays: [1, 3] },
      "node-nlp-5": "completed", // 旧极简字符串格式
      "node-web-2": { status: "in-progress", completedDays: [1, 2, 4, 7] },
    };
    localStorage.setItem("techradar-roadmap-progress", JSON.stringify(legacyData));

    // ------ 2) 执行迁移 ------
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => void 0);
    storage.migrateLegacyStorage();

    // ------ 3) 断言：统一存储可读出 status 和 completedDays ------
    const st1 = storage.getNodeStatus("node-cv-1");
    expect(st1).toBe("completed");

    const pr1 = storage.getNodeProgress("node-cv-1");
    expect(pr1.completedDays.sort()).toEqual([1, 3]);

    const st2 = storage.getNodeStatus("node-nlp-5");
    expect(st2).toBe("completed");

    const st3 = storage.getNodeStatus("node-web-2");
    expect(st3).toBe("in-progress");
    const pr3 = storage.getNodeProgress("node-web-2");
    expect(pr3.completedDays.sort()).toEqual([1, 2, 4, 7]);

    // ------ 4) 断言：迁移日志被输出 ------
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining("[storage migrate] splinter 'techradar-roadmap-progress' → unified"),
    );

    // ------ 5) 断言：legacy key 已被清除 ------
    expect(localStorage.getItem("techradar-roadmap-progress")).toBeNull();
    // ------ 6) 断言：写入的是统一存储 STORAGE_KEYS.PROGRESS = tr-progress ------
    const raw = localStorage.getItem(storage.STORAGE_KEYS_RUNTIME?.PROGRESS ?? "tr-progress");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    // 明确包含 nodes.node-cv-1 / nodes.node-nlp-5 / nodes.node-web-2
    expect(parsed?.nodes?.["node-cv-1"]).toBeDefined();
    expect(parsed?.nodes?.["node-nlp-5"]).toBeDefined();
    expect(parsed?.nodes?.["node-web-2"]).toBeDefined();
  });

  it("T2: legacy key 非法 JSON / 非对象字面量 → migrateLegacyStorage 不抛错且旧 key 安全删除", async () => {
    const storage = await import("@/lib/storage");

    // 构造 3 种非法情况
    const badCases: Array<[string, string | null]> = [
      ["not-json-at-all{{{", "完全非法字符串"],
      ["[1,2,3]", "数组字面量（非对象）"],
      ['"plain-string"', "JSON 字符串（非对象）"],
    ];
    for (const [badValue, label] of badCases) {
      localStorage.clear();
      localStorage.setItem("techradar-roadmap-progress", badValue);

      // 必须不抛错
      expect(() => storage.migrateLegacyStorage()).not.toThrow();

      // 旧 key 必须被删除
      expect(localStorage.getItem("techradar-roadmap-progress")).toBeNull();
    }

    // 额外：空字符串情况（raw.length === 0，直接被 exactKeys 删除分支处理）
    localStorage.clear();
    localStorage.setItem("techradar-roadmap-progress", "");
    expect(() => storage.migrateLegacyStorage()).not.toThrow();
    expect(localStorage.getItem("techradar-roadmap-progress")).toBeNull();
  });

  it("T3: saveNodeCompletedSet 往返 Set<string> 20 个 nodeId 结果一致", async () => {
    const storage = await import("@/lib/storage");

    // ------ 1) 构造 20 个 nodeId 的 Set ------
    const nodeIds = Array.from({ length: 20 }, (_, i) => `batch-node-${i + 1}`);
    const completedSet = new Set(nodeIds);

    // ------ 2) 写入（对应 RoadmapGraph.saveProgress） ------
    storage.saveNodeCompletedSet(completedSet);

    // ------ 3) 读出（对应 RoadmapGraph.loadProgress 适配逻辑） ------
    const progress = storage.getProgress();
    const roundTripCompleted = new Set<string>();
    for (const [nodeId, node] of Object.entries(progress.nodes)) {
      if ((node.status ?? "not-started") === "completed") {
        roundTripCompleted.add(nodeId);
      }
    }

    // ------ 4) 断言：集合完全一致（size + 逐个元素） ------
    expect(roundTripCompleted.size).toBe(20);
    for (const id of nodeIds) {
      expect(roundTripCompleted.has(id)).toBe(true);
      expect(storage.getNodeStatus(id)).toBe("completed");
    }

    // ------ 5) 再验证：删除部分节点后，部分取消 completed 也正确 ------
    const halfSet = new Set(nodeIds.slice(0, 10)); // 保留前 10 个
    storage.saveNodeCompletedSet(halfSet);
    const progressAfter = storage.getProgress();
    const completedAfter = new Set(
      Object.keys(progressAfter.nodes).filter(
        (id) => (progressAfter.nodes[id].status ?? "not-started") === "completed",
      ),
    );
    expect(completedAfter.size).toBe(10);
    for (const id of nodeIds.slice(0, 10)) {
      expect(completedAfter.has(id)).toBe(true);
    }
    for (const id of nodeIds.slice(10)) {
      // 不在 halfSet 中：应为 not-started / in-progress，非 completed
      expect(storage.getNodeStatus(id)).not.toBe("completed");
    }
  });
});
