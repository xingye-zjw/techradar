/**
 * 统一的 localStorage 存储层（单源真实原则 Single Source of Truth）
 *
 * 管理范围：
 *   - 学习进度（nodes.* 完成情况、打卡日期、状态）
 *   - UI 偏好（主题、侧边栏开合）
 *   - 收藏夹 / 最近访问
 *   - 导入 / 导出 / 清空
 *
 * 【兼容性设计】
 *   - 读入旧格式（v1：progress 或 raw roadmap-progress）时自动迁移到 v2
 *   - 写一律走 v2 结构
 *   - 脏数据 / 非法结构：返回默认值 + 日志警告（不 throw）
 *   - 通过 lazy Schema 工厂（首次使用时才构建 Zod）避免 Webpack/Turbopack
 *     打包 RSC server bundle 时因顶层 zod 调用导致的 "is not a function" 错误
 */

import { validateProgressData, SCHEMA_VERSION } from "./security";
import type { LearningProgressSanitized, NodeProgressSanitized } from "./security";
import { z } from "zod";

export { SCHEMA_VERSION };

/**
 * 兼容性：老存储（raw_roadmap_progress / roadmap-progress 老 key）迁移。
 * 当前 getProgress() 读时已自动迁移；此函数显式导出，便于测试与手动调用。
 */
export function migrateLegacyStorage(): LearningProgressSanitized {
  const p = getProgress();
  saveProgress(p);
  return p;
}

export type LearningProgress = LearningProgressSanitized;
/** 向后兼容：UnifiedProgressV2 是 LearningProgressSanitized 的别名（被 components/ProgressSettings、progress-export 引用） */
export type UnifiedProgressV2 = LearningProgressSanitized;
export type NodeProgress = NodeProgressSanitized;

/* =========================================================
   Key 常量（集中管理，避免字符串散落各处）
   ========================================================= */

const STORAGE_KEYS = {
  // 新的统一进度 key（v2 schema）
  PROGRESS: "tr-progress",
  // 旧 key（迁移读取用）
  OLD_PROGRESS: "roadmap-progress",
  OLD_RAW_PROGRESS: "raw_roadmap_progress",
  // UI
  THEME: "tr-theme",
  SIDEBAR: "tr-sidebar",
  // 功能
  FAVORITES: "tr-favorites",
  RECENT: "tr-recent",
} as const;

/* ==========================================================================
   分裂 KEY 黑名单（统一清理 / resetProgress 时全部扫除）
   以下 key 均为历史遗留的非 SSOT 实现产物，需在迁移/重置时彻底删除。
   ========================================================================== */
const LEGACY_SPLINTER_KEYS: readonly string[] = [
  // NodeDetailPanel 历史独立任务存储
  "techradar-task-progress",
  // ProgressSettings 历史硬编码 key
  "techradar_progress_v2",
  "techradar_progress",
  // progress-export.ts 历史前缀/key
  "techradar-roadmap-progress",
  // progress-export.ts 逐节点前缀（前缀匹配，见 clearAllSplinterKeys）
  "techradar_progress_",
] as const;

/**
 * 彻底清理所有已知的分裂 key（支持逐节点前缀模式）。
 * 注：前缀匹配时会遍历整个 localStorage，将 key.startsWith(prefix) 的项一并删除。
 */
export function clearAllSplinterKeys(): void {
  if (!isClient()) return;
  const prefixes = LEGACY_SPLINTER_KEYS.filter((k) => k.endsWith("_"));
  const exactKeys = LEGACY_SPLINTER_KEYS.filter((k) => !k.endsWith("_"));
  for (const k of exactKeys) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
  // 前缀型 key（如 techradar_progress_ 后跟节点 id）
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && prefixes.some((p) => k.startsWith(p))) {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    }
  }
}

/** 只读 STORAGE_KEYS 导出（测试与调试工具使用） */
export const STORAGE_KEYS_RUNTIME: Readonly<typeof STORAGE_KEYS> = { ...STORAGE_KEYS };
export { STORAGE_KEYS_RUNTIME as STORAGE_KEYS };

/* =========================================================
   环境判断（服务端渲染时不要访问 localStorage）
   ========================================================= */

function isClient(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function now(): number {
  return Date.now();
}

/* =========================================================
   1. 统一学习进度（核心）
   ========================================================= */

/**
 * 读取当前进度（v2 结构），并自动迁移旧格式。
 * 服务端或无数据时，返回空的默认进度。
 * 首次读时会清除所有已知分裂 key（用户无感迁移）。
 */
export function getProgress(): LearningProgressSanitized {
  if (!isClient()) {
    return emptyProgress();
  }
  try {
    // 首次使用时清理分裂 key（写 key 时也会清一次，双保险）
    clearAllSplinterKeys();
    // 1) 先读新 key
    let raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (raw) {
      return validateProgressData(JSON.parse(raw));
    }
    // 2) 兼容：迁移老 progress key
    raw = localStorage.getItem(STORAGE_KEYS.OLD_PROGRESS);
    if (raw) {
      const migrated = migrateOldRoadmapProgress(raw);
      saveProgress(migrated);
      return migrated;
    }
    // 3) 兼容：迁移最早的 raw_roadmap_progress
    raw = localStorage.getItem(STORAGE_KEYS.OLD_RAW_PROGRESS);
    if (raw) {
      const migrated = migrateOldRawProgress(raw);
      saveProgress(migrated);
      return migrated;
    }
    // 4) 全新
    return emptyProgress();
  } catch (e) {
    warnOnce("读取进度失败，使用默认值", e);
    return emptyProgress();
  }
}

/**
 * 整体写入进度。调用者负责传入符合 LearningProgressSanitized 结构的数据。
 * 写入后自动触发 storage 事件广播（多 tab 同步）。
 * 写入时同步清理所有分裂 key（双保险：读 + 写都清理）。
 */
export function saveProgress(progress: LearningProgressSanitized): void {
  if (!isClient()) return;
  try {
    const sanitized = validateProgressData(progress);
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(sanitized));
    // 写入后清理分裂 key：保证每次写入后 localStorage 只有一个统一 key
    clearAllSplinterKeys();
    // 清理旧 key（如果存在），但只在新版本写入成功后，避免回滚风险
    try {
      localStorage.removeItem(STORAGE_KEYS.OLD_RAW_PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.OLD_PROGRESS);
    } catch {
      /* ignore */
    }
    dispatchStorageEvent("tr-progress-updated");
  } catch (e) {
    warnOnce("保存进度失败", e);
  }
}

/**
 * 读取某个节点的进度（不存在则创建默认节点并返回）。
 * 注意：返回值的修改不会自动持久化，要配合 saveNodeProgress / saveProgress 写回。
 */
export function getNodeProgress(nodeSlug: string): NodeProgressSanitized {
  const all = getProgress();
  return (
    all.nodes[nodeSlug] ?? {
      completedDays: [],
      status: "not-started",
    }
  );
}

/**
 * 单个节点保存（最常用的写入 API）
 *
 * @param totalDays 可选参数：该节点总任务数（用于自动推导 completed 状态）。
 *   若传入 totalDays 且 completedDays.length >= totalDays，则自动设 status=completed + autoCompleted=true。
 */
export function saveNodeProgress(
  nodeSlug: string,
  nodeProgress: Partial<NodeProgressSanitized> & Pick<NodeProgressSanitized, "completedDays">,
  totalDays?: number,
): LearningProgressSanitized {
  const all = getProgress();
  const existing = all.nodes[nodeSlug] ?? { completedDays: [] };
  const completedDays = Array.from(new Set(nodeProgress.completedDays)).sort((a, b) => a - b);

  // 自动推导 status（调用方显式传入 status 时，以调用方为准）
  let status = nodeProgress.status ?? existing.status ?? "not-started";
  let autoCompleted: boolean | undefined = nodeProgress.autoCompleted ?? existing.autoCompleted;
  if (nodeProgress.status === undefined && totalDays !== undefined && completedDays.length > 0) {
    if (completedDays.length >= totalDays) {
      status = "completed";
      autoCompleted = true;
    } else {
      status = "in-progress";
    }
  } else if (status === "not-started" && completedDays.length > 0) {
    status = "in-progress";
  }

  const merged: NodeProgressSanitized = {
    ...existing,
    ...nodeProgress,
    completedDays,
    status,
    autoCompleted,
    startedAt:
      (nodeProgress.startedAt ?? existing.startedAt ?? completedDays.length > 0)
        ? now()
        : undefined,
    lastVisitedAt: nodeProgress.lastVisitedAt ?? existing.lastVisitedAt ?? now(),
    completedAt:
      status === "completed"
        ? (nodeProgress.completedAt ?? existing.completedAt ?? now())
        : existing.completedAt,
  } as NodeProgressSanitized;
  all.nodes[nodeSlug] = merged;
  all.updatedAt = now();
  saveProgress(all);
  return all;
}

/**
 * 切换某个节点的某个日期打卡状态
 * @returns 该节点最新的已打卡天数列表（排序去重后）
 */
export function toggleDay(nodeSlug: string, day: number): number[] {
  const node = getNodeProgress(nodeSlug);
  const set = new Set(node.completedDays);
  if (set.has(day)) set.delete(day);
  else set.add(day);
  const days = Array.from(set).sort((a, b) => a - b);
  const existing = getProgress().nodes[nodeSlug] ?? { completedDays: [] as number[] };
  saveNodeProgress(nodeSlug, {
    ...existing,
    completedDays: days,
    lastVisitedAt: now(),
    // 自动补 status
    status:
      days.length === 0
        ? "not-started"
        : existing.status === "completed"
          ? "completed"
          : "in-progress",
  });
  return days;
}

/**
 * 清空整个进度（危险操作，用户点击「重置进度」时调用）
 * 同时清理所有历史遗留的分裂 key。
 */
export function resetProgress(): void {
  if (!isClient()) return;
  localStorage.removeItem(STORAGE_KEYS.PROGRESS);
  localStorage.removeItem(STORAGE_KEYS.OLD_RAW_PROGRESS);
  localStorage.removeItem(STORAGE_KEYS.OLD_PROGRESS);
  clearAllSplinterKeys();
  dispatchStorageEvent("tr-progress-updated");
}

/* ---------- 导入 / 导出（JSON 快照） ---------- */

/** 导出为字符串（可存盘、可跨设备分享） */
export function exportProgressAsJSON(): string {
  const progress = getProgress();
  return JSON.stringify(
    {
      _format: "tr-progress",
      version: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      progress,
    },
    null,
    2,
  );
}

/**
 * 导入进度字符串。
 * @returns 导入后的新进度；如果格式不合法则 throw Error
 */
export function importProgressFromJSON(text: string): LearningProgressSanitized {
  try {
    const obj = JSON.parse(text);
    const p =
      obj && typeof obj === "object" && "progress" in obj
        ? (obj as { progress: unknown }).progress
        : obj;
    const sanitized = validateProgressData(p);
    saveProgress(sanitized);
    return sanitized;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`进度导入失败：${msg}`);
  }
}

/* ---------- 迁移 helpers ---------- */

function emptyProgress(): LearningProgressSanitized {
  return validateProgressData({});
}

function migrateOldRoadmapProgress(raw: string): LearningProgressSanitized {
  // 旧 progress 结构：{ nodes: { slug: { completedDays:[...], status:... }, updatedAt } }
  try {
    const obj = JSON.parse(raw);
    return validateProgressData(obj);
  } catch {
    // 非法 JSON，返回空
    return emptyProgress();
  }
}

function migrateOldRawProgress(raw: string): LearningProgressSanitized {
  try {
    const obj = JSON.parse(raw);
    return validateProgressData(obj);
  } catch {
    return emptyProgress();
  }
}

/* =========================================================
   2. 主题 / 侧边栏 UI 状态
   ========================================================= */

export type Theme = "dark" | "light";
type ThemeRaw = Theme | "system" | string;

const THEME_SCHEMA_FACTORY = () => z.enum(["dark", "light", "system"]).default("dark");
let _THEME_CACHED: ReturnType<typeof THEME_SCHEMA_FACTORY> | null = null;
function getThemeSchema() {
  return (_THEME_CACHED ??= THEME_SCHEMA_FACTORY());
}

export function getTheme(): Theme {
  const base = _readTheme();
  if (base === "system") return resolveSystemTheme();
  return base;
}
function _readTheme(): "dark" | "light" | "system" {
  if (!isClient()) return "dark";
  const raw = localStorage.getItem(STORAGE_KEYS.THEME);
  const res = getThemeSchema().safeParse(raw);
  return res.success ? res.data : "dark";
}
function resolveSystemTheme(): Theme {
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
}
export function setTheme(theme: ThemeRaw): void {
  if (!isClient()) return;
  const t: "dark" | "light" | "system" =
    theme === "light" ? "light" : theme === "system" ? "system" : "dark";
  localStorage.setItem(STORAGE_KEYS.THEME, t);
  applyThemeToDocument(t);
  dispatchStorageEvent("tr-theme-updated");
}
export function applyThemeToDocument(t: "dark" | "light" | "system"): void {
  if (typeof document === "undefined") return;
  const effective = t === "system" ? resolveSystemTheme() : t;
  const html = document.documentElement;
  html.classList.toggle("dark", effective === "dark");
  html.classList.toggle("light", effective === "light");
  html.style.colorScheme = effective;
}

/* ---------- 侧边栏 ---------- */

export type SidebarState = "expanded" | "collapsed";

const SIDEBAR_SCHEMA_FACTORY = () => z.enum(["expanded", "collapsed"]).default("expanded");
let _SIDEBAR_CACHED: ReturnType<typeof SIDEBAR_SCHEMA_FACTORY> | null = null;
function getSidebarSchema() {
  return (_SIDEBAR_CACHED ??= SIDEBAR_SCHEMA_FACTORY());
}

export function getSidebarState(): SidebarState {
  if (!isClient()) return "expanded";
  const raw = localStorage.getItem(STORAGE_KEYS.SIDEBAR);
  const res = getSidebarSchema().safeParse(raw);
  return res.success ? res.data : "expanded";
}

export function setSidebarState(state: SidebarState): void {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEYS.SIDEBAR, state);
  dispatchStorageEvent("tr-sidebar-updated");
}

export function toggleSidebar(): SidebarState {
  const next = getSidebarState() === "collapsed" ? "expanded" : "collapsed";
  setSidebarState(next);
  return next;
}

/* =========================================================
   3. Favorites（收藏夹） — Lazy Schema
   ========================================================= */

export type FavoriteType = "terms" | "intel" | "nodes" | "tools";

export interface FavoriteEntry {
  type: FavoriteType;
  slug: string;
  favoritedAt: number;
}

const FAVORITES_MAX = 500;

const _FAVORITES_BUILD = () => {
  const _FavoriteEntrySchema = z.object({
    type: z.enum(["terms", "intel", "nodes", "tools"]),
    slug: z.string().min(1).max(200),
    favoritedAt: z.number().int().positive(),
  });
  return z
    .record(
      z.string().max(200),
      z
        .array(_FavoriteEntrySchema)
        .refine((arr) => arr.length <= FAVORITES_MAX, `favorite entries <= ${FAVORITES_MAX}`),
    )
    .refine(
      (obj) => Object.keys(obj).length <= FAVORITES_MAX,
      `favorites groups <= ${FAVORITES_MAX}`,
    );
};
let _FAVORITES_CACHED: ReturnType<typeof _FAVORITES_BUILD> | null = null;
function getFavoritesSchema() {
  return (_FAVORITES_CACHED ??= _FAVORITES_BUILD());
}

function _readFavorites(): Record<string, FavoriteEntry[]> {
  if (!isClient()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    if (getFavoritesSchema().safeParse(obj).success) return obj as Record<string, FavoriteEntry[]>;
    // 轻微宽松：直接 return 空对象（忽略脏数据）
    return typeof obj === "object" && obj !== null ? (obj as Record<string, FavoriteEntry[]>) : {};
  } catch {
    return {};
  }
}

function _writeFavorites(data: Record<string, FavoriteEntry[]>): void {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(data));
}

export function isFavorited(type: FavoriteType, slug: string): boolean {
  const all = _readFavorites();
  return (all[type] ?? []).some((f) => f.slug === slug);
}

export function toggleFavorite(type: FavoriteType, slug: string): boolean {
  const all = _readFavorites();
  const list = all[type] ?? [];
  const idx = list.findIndex((f) => f.slug === slug);
  if (idx >= 0) {
    list.splice(idx, 1);
    all[type] = list;
    _writeFavorites(all);
    return false;
  } else {
    list.push({ type, slug, favoritedAt: now() });
    all[type] = list.slice(-FAVORITES_MAX);
    _writeFavorites(all);
    return true;
  }
}

/* =========================================================
   4. Recent Visits（最近访问） — Lazy Schema
   ========================================================= */

export type RecentVisitType = "node" | "intel" | "tool" | "glossary" | "task";

export interface RecentVisit {
  type: RecentVisitType;
  slug: string;
  title: string;
  visitedAt: number;
}

const RECENT_MAX = 30;

const _RECENT_BUILD = () => {
  const _RecentVisitSchema = z.object({
    type: z.enum(["node", "intel", "tool", "glossary", "task"]),
    slug: z.string().min(1).max(300),
    title: z.string().min(1).max(300),
    visitedAt: z.number().int().positive(),
  });
  return z
    .array(_RecentVisitSchema)
    .refine((arr) => arr.length <= RECENT_MAX * 2, `recent visits <= ${RECENT_MAX * 2}`);
};
let _RECENT_CACHED: ReturnType<typeof _RECENT_BUILD> | null = null;
function getRecentSchema() {
  return (_RECENT_CACHED ??= _RECENT_BUILD());
}

export function getRecentVisits(): RecentVisit[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (getRecentSchema().safeParse(arr).success) {
      return (arr as RecentVisit[]).sort((a, b) => b.visitedAt - a.visitedAt).slice(0, RECENT_MAX);
    }
    return Array.isArray(arr) ? (arr as RecentVisit[]).slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

export function addRecentVisit(
  entry: Omit<RecentVisit, "visitedAt"> & { visitedAt?: number },
): RecentVisit[] {
  if (!isClient()) return [];
  const clean: RecentVisit = {
    type: entry.type,
    slug: String(entry.slug || "").slice(0, 300),
    title: String(entry.title || "").slice(0, 300),
    visitedAt: entry.visitedAt ?? now(),
  };
  if (!clean.slug || !clean.title) return getRecentVisits();
  const list = getRecentVisits();
  // 去重 (同 type + slug)
  const deduped = list.filter((v) => !(v.type === clean.type && v.slug === clean.slug));
  deduped.unshift(clean);
  const result = deduped.slice(0, RECENT_MAX);
  localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(result));
  return result;
}

export function clearRecentVisits(): void {
  if (!isClient()) return;
  localStorage.removeItem(STORAGE_KEYS.RECENT);
}

/* =========================================================
   5. 跨 Tab 同步（storage 事件）
   ========================================================= */

function dispatchStorageEvent(type: string): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(type, { detail: { at: Date.now() } }));
    // 兼容：同一 tab 的不同脚本监听
    window.dispatchEvent(new StorageEvent("storage", { key: type }));
  } catch {
    /* ignore */
  }
}

/* =========================================================
   6. 其他（调试 / 统计）
   ========================================================= */

const _warned = new Set<string>();
function warnOnce(msg: string, cause?: unknown): void {
  if (_warned.has(msg)) return;
  _warned.add(msg);
  if (typeof console !== "undefined" && typeof console.warn === "function") {
    console.warn(`[storage] ${msg}`, cause ?? "");
  }
}

/**
 * 计算当前总进度百分比（0~100）。
 * @param totalNodes 总节点数（从 lib/roadmap-data 传入）
 */
export function computeOverallProgressPercent(
  progress: LearningProgressSanitized,
  totalNodes: number,
): number {
  if (totalNodes <= 0) return 0;
  const completed = Object.values(progress.nodes).filter(
    (n) => (n.status ?? "not-started") === "completed",
  ).length;
  return Math.round((completed / totalNodes) * 100);
}
