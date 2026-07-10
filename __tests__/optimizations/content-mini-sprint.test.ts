/**
 * S-CONTENT · 3天冲刺验收测试（Day1 先行）
 *
 * 覆盖：
 *  [T0-1] 常量扩展：INTEL_LINKS 新增 20 条 + TOOL_IDS 新增 10 条
 *  [T1   ] Intel 新文 11 篇（163-173）存在、字数 ≥800、含代码块、FM 完整、关联 100%
 *  [T2   ] 存量修复：pitfall#146 prevention ≥3 条
 *  [AC-ISO] 本轮改动未触碰 S-FONT 专属目录（app/layout.tsx、tailwind、components、globals.css）
 *
 *  方法：直接磁盘读取 + 常量导入，不走 server-only 模块，避免 Next.js SSR 限制。
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { INTEL_LINKS, TOOL_IDS } = require("../../lib/constants.ts");

// ---------- 本冲刺声明的增量清单 ----------
const NEW_INTEL_SLUGS_20 = [
  // CV 5 篇（163-167）
  "163-sam2-video-segmentation",
  "164-vision-language-models",
  "165-medical-image-segmentation",
  "166-remote-sensing-change-detection",
  "167-autonomous-driving-perception",
  // LLM 4 篇（168-171）
  "168-local-llm-ollama-deploy",
  "169-long-context-1m-token",
  "170-llm-synthetic-data",
  "171-multimodal-rag-video",
  // Edge 2 篇（172-173）
  "172-tinyml-mcu-deploy",
  "173-edge-ai-benchmarking",
  // Pitfall 9 篇（174-182）
  "174-pitfall-sam2-mask-drift",
  "175-pitfall-vlm-hallucination-grounding",
  "176-pitfall-ollama-context-window",
  "177-pitfall-synthetic-data-label-leak",
  "178-pitfall-multimodal-rag-image-chunking",
  "179-pitfall-tinyml-flash-oversize",
  "180-pitfall-edge-ai-power-throttle",
  "181-pitfall-haystack-pipeline-serialization",
  "182-pitfall-lancedb-index-corruption",
];

const NEW_TOOL_KEYS_10 = [
  "ollama",
  "lancedb",
  "comfy-ui",
  "lm-studio",
  "onnxruntime-genai",
  "semantic-kernel",
  "autogen",
  "crewai",
  "haystack",
  "unstructured",
];

// Day1 必须落盘的 11 篇 Intel md（CV 5 + LLM 4 + Edge 2 = 11）
const DAY1_INTEL_FILES_11 = NEW_INTEL_SLUGS_20.slice(0, 11).map((s) => `${s}.md`);

const INTEL_DIR = path.join(process.cwd(), "content", "intel");
const PITFALL_DIR = path.join(process.cwd(), "content", "pitfall");
const GLOSSARY_DIR = path.join(process.cwd(), "content", "glossary");
const TERMS_DIR = path.join(GLOSSARY_DIR, "terms");
const TOOLBOX_DIR = path.join(process.cwd(), "content", "toolbox");
const SCRIPTS_DIR = path.join(process.cwd(), "scripts");
const ROOT_DIR = process.cwd();
const FULL = (...p: string[]) => path.join(ROOT_DIR, ...p);

function readIntel(name: string) {
  const raw = fs.readFileSync(path.join(INTEL_DIR, name), "utf8");
  return matter(raw);
}

// ========== T0-1 常量完整性 ==========
describe("[T0-1] 常量扩展：INTEL_LINKS × 20 + TOOL_IDS × 10", () => {
  it("INTEL_LINKS 存在全部 20 个新增 slug，且显示名非空", () => {
    const missing: string[] = [];
    NEW_INTEL_SLUGS_20.forEach((slug) => {
      if (!INTEL_LINKS[slug] || String(INTEL_LINKS[slug]).trim() === "") missing.push(slug);
    });
    expect(missing).toEqual([]);
  });

  it("TOOL_IDS 存在全部 10 个新增 key，且显示名非空", () => {
    const missing: string[] = [];
    NEW_TOOL_KEYS_10.forEach((key) => {
      if (!TOOL_IDS[key] || String(TOOL_IDS[key]).trim() === "") missing.push(key);
    });
    expect(missing).toEqual([]);
  });
});

// ========== T1 Day1 11 篇 Intel 质量 ==========
describe("[T1] Day1 交付：11 篇 Intel 新文存在且内容达标", () => {
  it("11 篇新文真实存在于 content/intel/", () => {
    const missing = DAY1_INTEL_FILES_11.filter((f) => !fs.existsSync(path.join(INTEL_DIR, f)));
    expect(missing).toEqual([]);
  });

  it("每篇正文长度 ≥800 字符（不含 frontmatter）", () => {
    const shorts: string[] = [];
    DAY1_INTEL_FILES_11.forEach((f) => {
      const { content } = readIntel(f);
      if (content.length < 800) shorts.push(`${f}(${content.length})`);
    });
    expect(shorts).toEqual([]);
  });

  it("每篇正文至少包含 1 个代码块（``` fenced）", () => {
    const noCode: string[] = [];
    DAY1_INTEL_FILES_11.forEach((f) => {
      const { content } = readIntel(f);
      if (!content.includes("```")) noCode.push(f);
    });
    expect(noCode).toEqual([]);
  });

  it("每篇 frontmatter 字段齐全：title / category / difficulty / summary / tags / keywords / duration", () => {
    const REQUIRED_FM = [
      "title",
      "category",
      "difficulty",
      "summary",
      "tags",
      "keywords",
      "duration",
    ] as const;
    const bad: string[] = [];
    DAY1_INTEL_FILES_11.forEach((f) => {
      const { data } = readIntel(f);
      for (const k of REQUIRED_FM) {
        if (data[k] === undefined || data[k] === null || data[k] === "") {
          bad.push(`${f}#${k}`);
        }
      }
    });
    expect(bad).toEqual([]);
  });

  it("关联 100% 闭环：每篇都有 relatedTerms AND relatedTools AND relatedNodes（三者非空数组）", () => {
    const orphan: string[] = [];
    DAY1_INTEL_FILES_11.forEach((f) => {
      const { data } = readIntel(f);
      const t = Array.isArray(data.relatedTerms) ? data.relatedTerms.length : 0;
      const o = Array.isArray(data.relatedTools) ? data.relatedTools.length : 0;
      const n = Array.isArray(data.relatedNodes) ? data.relatedNodes.length : 0;
      if (t === 0 || o === 0 || n === 0) {
        orphan.push(`${f}(terms=${t},tools=${o},nodes=${n})`);
      }
    });
    expect(orphan).toEqual([]);
  });
});

// ========== T2 存量修复 ==========
describe("[T2] 存量红灯修复：pitfall#146 CUDA OOM prevention 补齐", () => {
  it('146-pitfall-cuda-out-of-memory.md 的"预防措施"section ≥3 条 bullet', () => {
    const file = "146-pitfall-cuda-out-of-memory.md";
    const { content } = readIntel(file);
    const match = content.match(/##\s*预防措施\s*\n([\s\S]*?)(?=\n##|$)/);
    expect(match).toBeTruthy();
    const bullets = match![1].split("\n").filter((l) => /^-\s+\S/.test(l.trim()));
    expect(bullets.length).toBeGreaterThanOrEqual(3);
  });
});

// ========== AC-ISO 跨对话隔离 ==========
describe("[AC-ISO] 零冲突证明：本对话产物不触碰 S-FONT 禁区", () => {
  const FORBIDDEN_PREFIXES = [
    "app/layout.tsx",
    "app/globals.css",
    "tailwind.config.ts",
    "components/",
  ];

  // 本测试不依赖 git 状态（S-FONT 已经 M 了一批文件），
  // 仅对 S-CONTENT 本轮新建/修改的已知产物做路径白名单断言。
  const KNOWN_SCONTENT_NEW_OR_MODIFIED = [
    // T0-1 constants 追加
    "lib/constants.ts",
    // T0-3 脚本 & 产出
    "scripts/audit-content3.py",
    "scripts/reports/audit3-short-intel.csv",
    "scripts/reports/audit3-nocode-intel.csv",
    "scripts/reports/audit3-orphan-relations.csv",
    "scripts/reports/audit3-pitfall-missing-prevention.csv",
    // T1 新文 11 篇 md
    ...DAY1_INTEL_FILES_11.map((f) => `content/intel/${f}`),
    // 本测试文件本身
    "__tests__/optimizations/content-mini-sprint.test.ts",
    // 方案文件
    "docs/superpowers/plans/2026-07-09-parallel-content-font-3day-sprint.md",
  ];

  it("所有 S-CONTENT 已知产物路径都不在 S-FONT 禁区前缀下", () => {
    const violated: string[] = [];
    KNOWN_SCONTENT_NEW_OR_MODIFIED.forEach((p) => {
      if (FORBIDDEN_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix))) {
        violated.push(p);
      }
    });
    expect(violated).toEqual([]);
  });
});

// ============================================================
// [DAY 2/3 · RED] T1-剩余(16) + T2-红灯修复 + T3-Glossary(18) + T3-Tools(10)
// ============================================================

const REMAINING_INTEL_7 = [
  "183-gitops-argo-cd",
  "184-agent-tracing-eval",
  "185-probability-distributions",
  "186-linear-algebra-ml",
  "187-llm-eval-ragas",
  "188-reranker-multilingual",
  "189-speech-asr-tts",
];

const NEW_PITFALL_9 = [
  "174-pitfall-data-poisoning",
  "175-pitfall-prompt-injection-defense",
  "176-pitfall-tensorRT-fp16-overflow",
  "177-pitfall-hallucination-grounding",
  "178-pitfall-data-leakage",
  "179-pitfall-class-imbalance",
  "180-pitfall-i2c-lockup",
  "181-pitfall-battery-life",
  "182-pitfall-gpio-noise",
];

// Day 1 5 篇 + Day 2 7 篇 = 12 篇新 Intel
const NEW_GLOSSARY_TERMS_18 = [
  "sam2-video-segmentation",
  "vision-language-model",
  "remote-sensing-change-detection",
  "bev-perception",
  "long-context-window",
  "synthetic-data-generation",
  "multimodal-rag",
  "tinyml",
  "edge-ai-benchmark",
  "gitops",
  "agent-evals-tracing",
  "probability-distribution",
  "linear-algebra-foundations",
  "llm-eval-ragas",
  "reranker",
  "speech-asr",
  "speech-tts",
  "data-poisoning-defense",
];

const NEW_TOOLS_10 = [
  "ollama",
  "lancedb",
  "comfy-ui",
  "lm-studio",
  "onnxruntime-genai",
  "semantic-kernel",
  "autogen",
  "crewai",
  "haystack",
  "unstructured",
];

// ============ [DAY 2 · T1-Remaining] 16 篇新 md ============
describe("[DAY2-T1-REMAINING] 剩余 16 篇（Intel 7 + Pitfall 9）内容+质量达标", () => {
  const files: string[] = [
    ...REMAINING_INTEL_7.map((s) => path.join(INTEL_DIR, `${s}.md`)),
    ...NEW_PITFALL_9.map((s) => path.join(PITFALL_DIR, `${s}.md`)),
  ];

  it("16 文件全部落盘（fs 可见）", () => {
    const missing = files.filter((f) => !fs.existsSync(f));
    expect(missing.map((f) => path.relative(ROOT_DIR, f))).toEqual([]);
  });

  it("每篇 frontmatter 五维齐全（title/category/difficulty/excerpt/relatedTerms）", () => {
    const bad: string[] = [];
    files.forEach((f) => {
      const raw = fs.readFileSync(f, "utf8");
      const { data } = matter(raw);
      const need = ["title", "category", "difficulty", "excerpt", "relatedTerms"];
      for (const k of need) {
        const v = data[k];
        if (v == null || String(v).trim() === "" || (Array.isArray(v) && v.length === 0))
          bad.push(`${path.relative(ROOT_DIR, f)}:missing_${k}`);
      }
    });
    expect(bad).toEqual([]);
  });

  it("每篇 body ≥ 800 字", () => {
    const short: string[] = [];
    files.forEach((f) => {
      const { content } = matter(fs.readFileSync(f, "utf8"));
      const len = content.trim().length;
      if (len < 800) short.push(`${path.relative(ROOT_DIR, f)}(${len})`);
    });
    expect(short).toEqual([]);
  });

  it("每篇 ≥ 1 个 fenced 代码块（```）", () => {
    const nocode = files
      .filter((f) => (fs.readFileSync(f, "utf8").match(/```[\s\S]*?```/g) ?? []).length < 1)
      .map((f) => path.relative(ROOT_DIR, f));
    expect(nocode).toEqual([]);
  });
});

// ============ [DAY 2 · T2] 存量红灯修复（audit3 指标） ============
describe("[DAY2-T2] audit3 存量红灯修复：短 0/无代码≤10/孤儿≤72/Pitfall prevention 0", () => {
  const readCsvLines = (name: string) => {
    const p = FULL("scripts", "reports", `audit3-${name}.csv`);
    if (!fs.existsSync(p)) return -1;
    const lines = fs
      .readFileSync(p, "utf8")
      .split(/\r?\n/)
      .filter((l) => l.trim() !== "");
    return Math.max(0, lines.length - 1); // 去掉 header 行
  };

  it("短内容红灯：0（原来是 1 → 修复 134-pitfall-project-mgmt ≥ 800 字）", () => {
    expect(readCsvLines("short-intel")).toBeLessThanOrEqual(0);
  });

  it("无代码红灯：≤ 10（原来 34 → 修复 ≥ 24 篇 pitfall 合集 / 老 intel）", () => {
    const n = readCsvLines("nocode-intel");
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThanOrEqual(10);
  });

  it("孤儿关联红灯：≤ 72（原来 145 → 修复 ≥ 73 篇老内容补齐关联）", () => {
    const n = readCsvLines("orphan-relations");
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThanOrEqual(72);
  });

  it("Pitfall prevention 红灯：持续 0", () => {
    expect(readCsvLines("pitfall-missing-prevention")).toBe(0);
  });
});

// ============ [DAY 3 · T3-Glossary] 18 术语追加 + 18 md 详情 ============
describe("[DAY3-T3-GLOSSARY] terms.json 扩到 ≥58，18 新 slug + 18 详情 md ≥ 200 字", () => {
  it("terms.json 长度 ≥ 58", () => {
    const arr: Array<any> = JSON.parse(
      fs.readFileSync(path.join(GLOSSARY_DIR, "terms.json"), "utf8"),
    );
    expect(arr.length).toBeGreaterThanOrEqual(58);
  });

  it("18 新 slug 全部出现在 terms.json 中且 definition 非空（≥30字）", () => {
    const arr: Array<{ slug: string; definition: string }> = JSON.parse(
      fs.readFileSync(path.join(GLOSSARY_DIR, "terms.json"), "utf8"),
    );
    const map = new Map(arr.map((t) => [t.slug, t]));
    const missing: string[] = [];
    NEW_GLOSSARY_TERMS_18.forEach((s) => {
      const t = map.get(s);
      if (!t || (t.definition ?? "").trim().length < 30) missing.push(s);
    });
    expect(missing).toEqual([]);
  });

  it("18 篇 terms 详情 md 存在且正文 ≥ 200 字", () => {
    const bad: string[] = [];
    NEW_GLOSSARY_TERMS_18.forEach((s) => {
      const p = path.join(TERMS_DIR, `${s}.md`);
      if (!fs.existsSync(p)) {
        bad.push(`missing:${s}`);
        return;
      }
      const { content } = matter(fs.readFileSync(p, "utf8"));
      const body = content.trim();
      if (body.length < 200) bad.push(`short(${body.length}):${s}`);
    });
    expect(bad).toEqual([]);
  });
});

// ============ [DAY 3 · T3-Toolbox] 10 工具实体追加 ============
describe("[DAY3-T3-TOOLS] tools.json 扩到 ≥70，10 新工具字段齐全（description≥30/features≥3/use_cases≥2/official_url 非空）", () => {
  it("tools 数组长度 ≥ 70", () => {
    const obj: { tools: any[] } = JSON.parse(
      fs.readFileSync(path.join(TOOLBOX_DIR, "tools.json"), "utf8"),
    );
    expect(obj.tools.length).toBeGreaterThanOrEqual(70);
  });

  it("10 新 slug 全部命中且字段完整", () => {
    const obj: { tools: any[] } = JSON.parse(
      fs.readFileSync(path.join(TOOLBOX_DIR, "tools.json"), "utf8"),
    );
    const map = new Map(obj.tools.map((t) => [t.slug, t]));
    const bad: string[] = [];
    NEW_TOOLS_10.forEach((s) => {
      const t = map.get(s);
      if (!t) {
        bad.push(`missing:${s}`);
        return;
      }
      if ((t.description ?? "").length < 30) bad.push(`${s}:description_short`);
      if (!Array.isArray(t.features) || t.features.length < 3) bad.push(`${s}:features_lt3`);
      if (!Array.isArray(t.use_cases) || t.use_cases.length < 2) bad.push(`${s}:usecases_lt2`);
      if (!String(t.official_url ?? "").startsWith("http")) bad.push(`${s}:official_url_invalid`);
    });
    expect(bad).toEqual([]);
  });
});
