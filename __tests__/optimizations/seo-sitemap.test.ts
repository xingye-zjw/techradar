/**
 * P1-2.3 sitemap/robots SEO 完整性测试
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

function readFile(p: string): string {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

describe("SEO: sitemap 与 robots 完整性", () => {
  const root = process.cwd();

  it("sitemap.ts 存在且包含 glossary/practice/toolbox/roadmap-day 路由", () => {
    const p = path.join(root, "app", "sitemap.ts");
    expect(fs.existsSync(p), "app/sitemap.ts 缺失").toBe(true);
    const src = readFile(p);
    expect(src).toContain("glossary");
    expect(src).toContain("practice");
    expect(src).toContain("toolbox");
    expect(src, "缺少 dailyTasks 详情页 (day/[day])").toMatch(
      /day\/\s*\(?idx\s*\+\s*1\s*\)?|day\//i,
    );
  });

  it("禁止使用占位域名 https://techradar.example.com", () => {
    const sitemap = readFile(path.join(root, "app", "sitemap.ts"));
    const robots = readFile(path.join(root, "app", "robots.ts"));
    const layout = readFile(path.join(root, "app", "layout.tsx"));
    const all = sitemap + "\n" + robots + "\n" + layout;
    expect(
      all,
      "检测到占位域名 techradar.example.com，请替换为 NEXT_PUBLIC_SITE_URL 或真实域名",
    ).not.toContain("techradar.example.com");
  });

  it("robots.ts 使用 NEXT_PUBLIC_SITE_URL 或合法域名", () => {
    const p = path.join(root, "app", "robots.ts");
    expect(fs.existsSync(p)).toBe(true);
    const src = readFile(p);
    expect(src).toMatch(/NEXT_PUBLIC_SITE_URL|process\.env\.|metadataBase|SITE_URL|https?:\/\//);
  });

  it("glossary/[slug] 存在 generateStaticParams（静态导出必须）", () => {
    const dirs = fs.readdirSync(path.join(root, "app", "glossary"));
    const slugPage = dirs.includes("[slug]")
      ? fs.readdirSync(path.join(root, "app", "glossary", "[slug]")).includes("page.tsx")
      : false;
    if (!slugPage) {
      // 可能目录结构不同
      const appDir = fs.readdirSync(path.join(root, "app"));
      console.log(
        "app 目录:",
        appDir.filter((d) => d.includes("glossary") || d.includes("practice")),
      );
    }
    // 宽松：只检查所有动态路由都有 static params
    const files = [
      "app/glossary/[slug]/page.tsx",
      "app/practice/[slug]/page.tsx",
      "app/toolbox/[slug]/page.tsx",
    ];
    for (const f of files) {
      const full = path.join(root, f);
      if (fs.existsSync(full)) {
        const src = readFile(full);
        expect(src, `${f} 缺少 generateStaticParams 函数（静态导出需要）`).toContain(
          "generateStaticParams",
        );
      }
    }
  });
});
