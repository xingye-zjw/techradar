/**
 * P1-2.1 搜索 IO 去重 + 类型收敛测试
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("搜索模块避免 IO 重复 (P1-2.1)", () => {
  it("lib/search.ts 的 getIntelSearchItems 应复用 intel.ts 而非自己 fs.readFileSync 160+ 文件", () => {
    const p = path.join(process.cwd(), "lib", "search.ts");
    expect(fs.existsSync(p)).toBe(true);
    const src = fs.readFileSync(p, "utf8");
    // 禁止在 search.ts 中直接 readdirSync/readFileSync content/intel
    const directFSUse = /readdirSync\(['"`].*?intel|readFileSync\(['"`].*?intel/.test(src);
    expect(
      directFSUse,
      "search.ts 不应直接读取 content/intel/*.md，应从 lib/intel.ts 复用 getIntelSearchIndex()",
    ).toBe(false);
    // 必须 import intel.ts 中的函数
    expect(src, "search.ts 应引用 intel.ts 的 getIntelSearchIndex / getAllIntelCards").toMatch(
      /from\s*['"][.\/]+(?:\/intel|@\/lib\/intel)['"]/,
    );
  });
});

describe("类型收敛 (P1-3.5)", () => {
  it("RoadmapNode 类型有唯一权威来源（仅一个导出位置，另一个必须 re-export）", () => {
    const files = ["components/radar/types.ts", "lib/content-types.ts"];
    const exportsPerFile: Record<string, string[]> = {};
    for (const f of files) {
      const p = path.join(process.cwd(), f);
      if (!fs.existsSync(p)) continue;
      const src = fs.readFileSync(p, "utf8");
      const matches = Array.from(src.matchAll(/export\s+(?:type|interface)\s+RoadmapNode/g));
      if (matches.length > 0) exportsPerFile[f] = matches.map((m) => m[0]);
    }
    const srcs = Object.keys(exportsPerFile);
    // 允许只一个地方定义，另一处 re-export
    if (srcs.length > 1) {
      // 检查至少有一个地方做 re-export 而非重新定义
      let hasReExport = false;
      for (const f of srcs) {
        const src = fs.readFileSync(path.join(process.cwd(), f), "utf8");
        if (/export\s+(?:type\s+)?\{[^}]*RoadmapNode[^}]*\}\s*from/.test(src)) {
          hasReExport = true;
          break;
        }
      }
      expect(
        hasReExport,
        `${srcs.join(" 和 ")} 都定义了 RoadmapNode，但没有任何一处 re-export。请收敛为一处定义另一处 re-export`,
      ).toBe(true);
    }
  });
});
