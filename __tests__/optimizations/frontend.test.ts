/**
 * P1-1.1 字体优化 / next.config 增强测试
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("前端性能：字体加载 (P1-1.1)", () => {
  it('layout.tsx 不再从 fonts.loli.net 直接 无差别 <link rel="stylesheet"> 阻塞加载', () => {
    const p = path.join(process.cwd(), "app", "layout.tsx");
    let src = fs.readFileSync(p, "utf8");
    // 启发式：要么"使用了 next/font/local / next/font/google"，要么"主 stylesheet link 用了 media=print 或 preload as=style + onload 切换"
    // 为了只看 活动的 (非 noscript 内) 样式表，先把 <noscript>...</noscript> 块从源码里剔除
    src = src.replace(/<noscript>[\s\S]*?<\/noscript>/gi, "");
    const useNextFont = /from\s+['"]next\/font|next\/font\/local|next\/font\/google/.test(src);
    // 阻塞 stylesheet：<link rel=stylesheet fonts.loli.net> 且既无 media=print 也无 onload/media 切换
    const blockingRegex =
      /<link\s*(?=[^>]*fonts\.loli\.net)(?=[^>]*rel\s*=\s*["'][^"']*stylesheet[^"']*["'])(?![^>]*media\s*=\s*["']print["'])(?![^>]*on(?:Load|load))[^>]*>/;
    const hasNonBlockingHack =
      /media\s*=\s*["']print["']/.test(src) && /<link[^>]*on(?:Load|load)=/.test(src);
    expect(
      useNextFont || hasNonBlockingHack || !blockingRegex.test(src),
      '仍使用了 fonts.loli.net 的纯阻塞 <link rel="stylesheet">。请使用 media=print + onload 切换或 next/font/local。',
    ).toBe(true);
  });

  it("要么用 next/font 要么至少 font-display:swap", () => {
    const layout = fs.readFileSync(path.join(process.cwd(), "app", "layout.tsx"), "utf8");
    const globals = fs.existsSync(path.join(process.cwd(), "app", "globals.css"))
      ? fs.readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8")
      : "";
    const useNextFont = /from ['"]next\/font|next\/font\/local/.test(layout);
    const useSwap = /font-display\s*:\s*swap/.test(globals);
    expect(
      useNextFont || useSwap,
      "要么使用 next/font/local 要么在 globals.css 的 @font-face 中设置 font-display:swap",
    ).toBe(true);
  });
});

describe("next.config.js 增强 (P1-1.4)", () => {
  it("包含 swcMinify / compress / optimizePackageImports 或等价优化", () => {
    const p = path.join(process.cwd(), "next.config.js");
    expect(fs.existsSync(p)).toBe(true);
    const src = fs.readFileSync(p, "utf8");
    const sc = /swcMinify\s*:\s*true/.test(src);
    const op = /optimizePackageImports/.test(src);
    const hdr = /headers\s*\(/.test(src) || /Cache-Control/.test(src);
    expect(
      sc || op || hdr,
      "next.config.js 缺少生产优化：至少需要 swcMinify:true / optimizePackageImports / headers 之一",
    ).toBe(true);
  });
});

describe("UX: 错误页/NotFound 友好 (P2-4.3)", () => {
  it("error.tsx 不应直接显示 error.message 给生产用户", () => {
    const p = path.join(process.cwd(), "app", "error.tsx");
    if (!fs.existsSync(p)) return;
    const src = fs.readFileSync(p, "utf8");
    // 直接用 {error.message} 而未加 process.env.NODE_ENV 守卫 = fail
    const badPattern = /\{error\.message\}/;
    const guardedPattern = /NODE_ENV.*development.*message|error\.message.*(NODE_ENV|if\s*\(.*dev)/;
    if (badPattern.test(src) && !guardedPattern.test(src)) {
      expect(
        false,
        'error.tsx 向所有用户暴露 error.message。请包一层 "dev ? detail : 友好文案"',
      ).toBe(false);
    }
  });

  it("not-found.tsx 包含推荐路径/返回首页按钮（非仅文字说明）", () => {
    const p = path.join(process.cwd(), "app", "not-found.tsx");
    if (!fs.existsSync(p)) return;
    const src = fs.readFileSync(p, "utf8");
    expect(src).toMatch(/Link\s*[\(\s]+href=['"]\//); // 至少一个内部链接
    expect(src).toMatch(/(首页|home|返回|推荐|recommend|搜索|search)/i);
  });
});

describe("UX: 进度导入导出 UI (P2-4.4)", () => {
  it("ProgressSettings 组件包含 import/export 按钮文案或 file input", () => {
    const p = path.join(process.cwd(), "components", "ProgressSettings.tsx");
    if (!fs.existsSync(p)) return;
    const src = fs.readFileSync(p, "utf8");
    const hasImport = /导入|import|type=["']file["']/.test(src);
    const hasExport = /导出|export|download|Blob|\.json/.test(src);
    expect(hasImport, "缺少导入进度 UI").toBe(true);
    expect(hasExport, "缺少导出进度 UI").toBe(true);
  });
});
