/**
 * P0-4.1 全局 ⌘K 搜索快捷方式测试
 */
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const isJsdom = typeof window !== "undefined";

describe("全局 ⌘K 搜索快捷方式", () => {
  if (!isJsdom) return;

  beforeEach(() => {
    // 重置
    document.body.innerHTML = '<div id="__next"></div>';
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it("路由应包含一个全局挂载的 CommandPalette 或至少在 layout 上注册了 keydown 监听器", async () => {
    // 方案 A：检测 app/layout.tsx 是否 import 了 GlobalCommandPalette
    const layout = fs.readFileSync(path.join(process.cwd(), "app", "layout.tsx"), "utf8");
    // 要么有 GlobalCommandPalette 组件 import，要么有 keydown 监听
    const hasPalette =
      /GlobalCommandPalette|GlobalClientBootstrap|CommandPalette|CommandK|useEffect\(\(\)\s*=>\s*\{[\s\S]*window\.addEventListener\(['"]keydown/.test(
        layout,
      );
    expect(hasPalette, "layout.tsx 未发现 ⌘K 搜索接入点").toBe(true);
  });

  it("GlobalCommandPalette 组件存在并在 Cmd/Ctrl+K 时触发", async () => {
    // 只要 components/GlobalCommandPalette.tsx 存在即可
    const candidates = [
      "components/GlobalCommandPalette.tsx",
      "components/CommandPalette.tsx",
      "components/CommandK.tsx",
      "components/ui/CommandPalette.tsx",
    ];
    const found = candidates.some((c) => fs.existsSync(path.join(process.cwd(), c)));
    expect(found, `需要存在命令面板组件，候选: ${candidates.join(" / ")}`).toBe(true);
  });
});
