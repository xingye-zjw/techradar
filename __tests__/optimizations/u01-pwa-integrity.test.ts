/**
 * [U-01] PWA 骨架完整性测试
 *
 * 覆盖：
 *  1. public/manifest.webmanifest 字段齐全合法
 *  2. public/sw.js 含 CACHE_NAME / install / activate / fetch 事件
 *  3. app/GlobalClientBootstrap.tsx 注册 SW + 监听 beforeinstallprompt
 *  4. app/layout.tsx 的 Next.js Metadata 引用 manifest
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FILE = (p: string) => path.join(ROOT, p);
const READ = (p: string) => fs.readFileSync(FILE(p), "utf8");

describe("[U-01] PWA 骨架 4 项完整性", () => {
  it("[1/4] manifest.webmanifest 合法 JSON + 关键字段齐全", () => {
    const raw = READ("public/manifest.webmanifest");
    const obj = JSON.parse(raw);
    expect(typeof obj.name).toBe("string");
    expect(obj.name.length).toBeGreaterThan(2);
    expect(typeof obj.short_name).toBe("string");
    expect(obj.start_url).toBe("/");
    expect(obj.display).toBe("standalone");
    expect(typeof obj.theme_color).toBe("string");
    expect(typeof obj.background_color).toBe("string");
    expect(Array.isArray(obj.icons)).toBe(true);
    expect(obj.icons.length).toBeGreaterThanOrEqual(2);
    expect(obj.scope).toBe("/");
  });

  it("[2/4] sw.js 含关键常量与三个生命周期事件", () => {
    const code = READ("public/sw.js");
    expect(code).toContain("CACHE_NAME");
    expect(code).toContain('"techradar-v1"');
    expect(code).toMatch(/addEventListener\(\s*"install"/);
    expect(code).toMatch(/addEventListener\(\s*"activate"/);
    expect(code).toMatch(/addEventListener\(\s*"fetch"/);
    expect(code).toContain("skipWaiting");
    expect(code).toContain("clients.claim");
  });

  it("[3/4] GlobalClientBootstrap 注册 SW + 存储 deferredPrompt + 暴露 showInstallPrompt", () => {
    const code = READ("app/GlobalClientBootstrap.tsx");
    expect(code).toMatch(/navigator\.serviceWorker\.register\s*\(\s*["'`]\/sw\.js["'`]/);
    expect(code).toContain("beforeinstallprompt");
    expect(code).toContain("deferredPrompt");
    expect(code).toContain("showInstallPrompt");
  });

  it("[4/4] Next.js layout.tsx metadata 引用 manifest + themeColor", () => {
    const code = READ("app/layout.tsx");
    // Next.js 14 App Router Metadata API
    // manifest: '/manifest.webmanifest'
    expect(code).toMatch(/manifest\s*:\s*["'`]\/manifest\.webmanifest["'`]/);
    expect(code).toMatch(/themeColor\s*:/);
  });
});
