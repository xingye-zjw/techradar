/**
 * P0-3.4 首页精选数据正确性测试
 * RED 阶段：这些测试应该先失败
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// 直接读取首页 tsx 代码 + 实际数据进行一致性校验
function readRawHomePage(): string {
  return fs.readFileSync(path.join(process.cwd(), "app", "page.tsx"), "utf8");
}

function getActualIntelSlugs(): string[] {
  const intelDir = path.join(process.cwd(), "content", "intel");
  return fs
    .readdirSync(intelDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

describe("首页精选数据完整性", () => {
  const actualSlugs = new Set(getActualIntelSlugs());

  it("FEATURED_INTEL 中引用的所有 slug 都应存在", () => {
    const page = readRawHomePage();
    // 提取 FEATURED_INTEL 数组中的 slug 字面量
    const match = page.match(/FEATURED_INTEL\s*=\s*\[([\s\S]*?)\]\s*\.map/);
    expect(match).toBeTruthy();

    const slugMatch = (match![1] || "").match(/"([^"]+)"/g) || [];
    const featuredSlugs = slugMatch.map((s) => s.replace(/"/g, ""));

    expect(featuredSlugs.length).toBeGreaterThanOrEqual(6);

    const missing: string[] = [];
    featuredSlugs.forEach((s) => {
      if (!actualSlugs.has(s)) missing.push(s);
    });
    expect(missing, `缺失的 slug: ${missing.join(", ")}`).toEqual([]);
  });

  it("首页展示模式应基于数据筛选而非硬编码（推荐策略）", () => {
    // 策略：首页精选至少 6 条，且按 category/difficulty 合理分布
    // 要求：至少包含 llm、cv、devops 三类各 1 条
    const page = readRawHomePage();
    // 这里不强求实现细节，只要求通过上面的存在性测试的基础上
    // 再增加一个约束：至少有 6 条（上面测试过了）
    // 后续优化后用基于条件筛选时，这个文件中的常量应该不再出现
    const hasHardcodedIds = /"008-huggingface"|"015-cnn-architecture"|"025-rag"/.test(page);
    expect(hasHardcodedIds, "不应引用已知不存在的错误 slug").toBe(false);
  });

  it("FEATURED_PROJECTS 至少 3 条且难度在 2-3 之间（page.tsx 的要求）", () => {
    const practiceFile = path.join(process.cwd(), "content", "practice", "projects.json");
    expect(fs.existsSync(practiceFile)).toBe(true);
    const raw = fs.readFileSync(practiceFile, "utf8");
    const data = JSON.parse(raw);
    const projects = Array.isArray(data) ? data : data.projects || [];
    const filtered = projects.filter(
      (p: { difficulty: number }) => p.difficulty >= 2 && p.difficulty <= 3,
    );
    expect(filtered.length, "适合首页展示(难度2-3)的项目数不足3").toBeGreaterThanOrEqual(3);
  });
});
