/**
 * P0-3.1 ESLint/Prettier 配置完整性
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("工程化配置完整性 (lint/prettier/husky)", () => {
  const root = process.cwd();

  it(".eslintrc.json 或 eslint.config.js (flat config) 存在", () => {
    const a = fs.existsSync(path.join(root, ".eslintrc.json"));
    const b = fs.existsSync(path.join(root, ".eslintrc.js"));
    const c = fs.existsSync(path.join(root, "eslint.config.js"));
    const d = fs.existsSync(path.join(root, "eslint.config.mjs"));
    expect(a || b || c || d, "缺少 ESLint 配置文件").toBe(true);
  });

  it(".prettierrc / prettier.config.* 存在", () => {
    const files = [
      ".prettierrc",
      ".prettierrc.json",
      ".prettierrc.js",
      "prettier.config.js",
      "prettier.config.mjs",
    ];
    const any = files.some((f) => fs.existsSync(path.join(root, f)));
    expect(any, "缺少 Prettier 配置文件").toBe(true);
  });

  it("package.json scripts 包含 lint/format", async () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    const s = pkg.scripts || {};
    expect(typeof s.lint, "缺少 lint 脚本").toBe("string");
    expect(typeof s.format, "缺少 format 脚本（可加 prettier --write .）").toBe("string");
    expect(s.lint, "lint 脚本不应为空字符串").toBeTruthy();
  });

  it(".husky/pre-commit 非空 & 调用 lint-staged 或 eslint", () => {
    const p = path.join(root, ".husky", "pre-commit");
    expect(fs.existsSync(p)).toBe(true);
    const src = fs.readFileSync(p, "utf8");
    expect(
      /lint-staged|eslint|prettier/.test(src),
      "pre-commit 钩子需要调用 lint-staged 或至少执行 eslint/format",
    ).toBe(true);
  });

  it("package.json 包含 lint-staged 配置或 .lintstagedrc", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    const inPkg = !!pkg["lint-staged"];
    const inFile =
      fs.existsSync(path.join(root, ".lintstagedrc")) ||
      fs.existsSync(path.join(root, ".lintstagedrc.json")) ||
      fs.existsSync(path.join(root, "lint-staged.config.js"));
    expect(inPkg || inFile, "缺少 lint-staged 配置").toBe(true);
  });
});
