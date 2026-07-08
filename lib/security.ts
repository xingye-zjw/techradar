/**
 * 全站安全工具集
 * - URL 协议过滤（防 XSS）
 * - localStorage Schema 校验（防篡改）
 * - XSS 内容消毒
 *
 * 【关键设计：Lazy Schema 工厂】
 * 所有 Zod Schema 通过 lazy getter 延迟构建，而非在模块顶层立即调用 z.* 链式 API。
 * 原因：Webpack / Turbopack / RSC bundler 在打包 server bundle 时可能因
 * module 顶层执行 zod 工厂方法而出现 minified 的 "is not a function" 错误；
 * 延迟到第一次 safeParse/parse 前再构建可 100% 规避该类打包环境问题。
 */

import { z } from "zod";

/* =========================================================
   1. URL 安全过滤（MarkdownRenderer / 全局 <a> 通用）
   ========================================================= */

const ALLOWED_PROTOCOLS: ReadonlySet<string> = new Set([
  "http:",
  "https:",
  "mailto:",
  "ftp:",
  "ftps:",
  "tel:",
]);

/**
 * 过滤危险 URL。返回 safe URL 或 null。
 * 相对路径（/xxx）原样放行。
 */
export function sanitizeUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s) return null;

  // 相对路径（/开头或 #锚点或 ?query）直接放行
  if (/^[/#?]/.test(s)) {
    // 去掉 // 协议相对路径（可能指向外站）=> 规范化为 https://
    if (s.startsWith("//")) {
      return `https:${s}`;
    }
    return s;
  }

  // 大小写绕过：JavaScript:alert(1) 之类 -> 先转小写匹配协议
  try {
    const u = new URL(s, "https://placeholder.local");
    if (!ALLOWED_PROTOCOLS.has(u.protocol.toLowerCase())) {
      return null;
    }
    // 如果是相对基准生成的 URL，说明原始是相对，直接 return 原字符串
    if (u.hostname === "placeholder.local" && u.protocol === "https:") {
      return s;
    }
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * 判断是否为外站链接（用于加 rel + 点击二次确认）
 * - 客户端：对比 window.location.hostname
 * - 服务端 / 测试环境：所有绝对 URL 默认视为外站（合理 fallback）
 */
export function isExternalUrl(raw: string): boolean {
  try {
    if (typeof raw !== "string") return false;
    if (raw.startsWith("/") || raw.startsWith("#") || raw.startsWith("?")) return false;
    const u = new URL(raw);
    const cur =
      typeof window !== "undefined" && typeof window.location !== "undefined"
        ? window.location.hostname
        : "";
    if (!cur) {
      // 没有 window 上下文（SSR、Node 测试）：只要是完整 URL，一律视为外站
      return /^https?:\/\//i.test(raw) || /^ftp:\/\//i.test(raw);
    }
    return u.hostname !== cur;
  } catch {
    return false;
  }
}

/* =========================================================
   2. 进度数据 Schema（zod）
   - 作为 storage.ts 的校验依据
   ========================================================= */

export const SCHEMA_VERSION = 2;

const MAX_DAYS_PER_NODE = 60;
const MAX_NODES = 500;
export const VALID_PROGRESS_STATUSES = ["not-started", "in-progress", "completed"] as const;
export type ProgressStatus = (typeof VALID_PROGRESS_STATUSES)[number];

/* ---------- Schema Factories (延迟构建) ---------- */

function _buildNodeProgressSchema() {
  return z
    .object({
      completedDays: z
        .array(z.number().int().min(1).max(MAX_DAYS_PER_NODE))
        .default([])
        .refine(
          (arr) => arr.length <= MAX_DAYS_PER_NODE,
          `completedDays must have <= ${MAX_DAYS_PER_NODE} entries`,
        )
        .transform((arr) => Array.from(new Set(arr)).sort((a, b) => a - b)),
      status: z.enum(VALID_PROGRESS_STATUSES).optional(),
      startedAt: z.number().int().positive().optional(),
      lastVisitedAt: z.number().int().positive().optional(),
      completedAt: z.number().int().positive().optional(),
      autoCompleted: z.boolean().optional(),
    })
    .strict()
    .default({ completedDays: [] });
}

type _NodeProgressSchemaT = ReturnType<typeof _buildNodeProgressSchema>;

function _buildLastVisitedSchema() {
  return z
    .object({
      node: z.string().min(1).max(80),
      day: z.number().int().min(1).max(MAX_DAYS_PER_NODE),
      timestamp: z.number().int().positive(),
    })
    .strict()
    .optional();
}

function _buildLearningProgressSchema(nodeSchema: _NodeProgressSchemaT) {
  const lastVisited = _buildLastVisitedSchema();
  return z
    .object({
      version: z.literal(SCHEMA_VERSION).default(SCHEMA_VERSION),
      updatedAt: z
        .number()
        .int()
        .positive()
        .default(() => Date.now()),
      nodes: z
        .record(z.string().min(1).max(80), nodeSchema)
        .default({})
        .refine(
          (obj) => Object.keys(obj).length <= MAX_NODES,
          `nodes entries must be <= ${MAX_NODES}`,
        ),
      lastVisited,
    })
    .strict();
}

/* ---------- Lazy Singletons ---------- */

let _NodeProgressSchema: _NodeProgressSchemaT | null = null;
export function getNodeProgressSchema(): _NodeProgressSchemaT {
  if (_NodeProgressSchema === null) {
    _NodeProgressSchema = _buildNodeProgressSchema();
  }
  return _NodeProgressSchema;
}

let _LearningProgressSchema: ReturnType<typeof _buildLearningProgressSchema> | null = null;
export function getLearningProgressSchema(): ReturnType<typeof _buildLearningProgressSchema> {
  if (_LearningProgressSchema === null) {
    _LearningProgressSchema = _buildLearningProgressSchema(getNodeProgressSchema());
  }
  return _LearningProgressSchema;
}

/* ---------- 类型导出 ---------- */

export type LearningProgressSanitized = z.infer<ReturnType<typeof getLearningProgressSchema>>;
export type NodeProgressSanitized = z.infer<ReturnType<typeof getNodeProgressSchema>>;

/* ---------- 验证入口 ---------- */

export function validateProgressData(input: unknown): LearningProgressSanitized {
  const Schema = getLearningProgressSchema();
  if (!input || typeof input !== "object") {
    return Schema.parse({});
  }
  // 先宽松解析，再 schema 校验
  const obj = input as Record<string, unknown>;
  const coerced: Record<string, unknown> = {
    version: SCHEMA_VERSION,
    updatedAt: typeof obj.updatedAt === "number" ? obj.updatedAt : Date.now(),
    nodes:
      obj.nodes && typeof obj.nodes === "object" && !Array.isArray(obj.nodes)
        ? (obj.nodes as Record<string, unknown>)
        : {},
    lastVisited: obj.lastVisited,
  };
  const res = Schema.safeParse(coerced);
  if (res.success) return res.data;
  if (typeof console !== "undefined" && typeof console.warn === "function") {
    console.warn(
      "[security] progress data schema violation: " +
        res.error.issues.map((i) => `${i.path.join(".")}:${i.message}`).join("; "),
    );
  }
  return Schema.parse({});
}

/* =========================================================
   3. XSS 内容消毒（备用：在 MarkdownRenderer 中对用户生成内容使用）
   ========================================================= */

const DANGEROUS_ATTR_RE = /^on/i;

export function isDangerousHtmlAttribute(name: string): boolean {
  // onXXX 事件处理器一律剥除
  if (DANGEROUS_ATTR_RE.test(name)) return true;
  const n = name.toLowerCase();
  // javascript: URI 相关
  if (n === "href" || n === "src" || n === "srcdoc" || n === "action" || n === "formaction") {
    return false; // 这些属性的 sanitize 交给上层（sanitizeUrl）做
  }
  return false;
}
