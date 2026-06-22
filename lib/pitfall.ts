import fs from "node:fs";
import path from "node:path";
import type { Pitfall, ContentCategory } from "./content-types";

// 重新导出 Pitfall 类型，保持向后兼容
export type { Pitfall } from "./content-types";

/**
 * 从标题生成 URL 友好的 slug
 * @param title - 标题字符串
 * @returns URL 友好的 slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w一-龥]+/g, '-')  // 保留中文字符
    .replace(/^-+|-+$/g, '')               // 去除首尾连字符
    .replace(/--+/g, '-');                 // 合并多个连字符
}

// 踩坑数据缓存
let cachedPitfalls: Pitfall[] | null = null;

/**
 * 获取所有踩坑数据
 * 支持新格式（带 slug/description/root_cause）和旧格式（仅 title/category/symptoms/solution）
 * @returns 踩坑数组
 */
export function getAllPitfalls(): Pitfall[] {
  if (cachedPitfalls) return cachedPitfalls;

  const dataPath = path.join(process.cwd(), "content", "pitfall", "pitfalls.json");

  if (!fs.existsSync(dataPath)) {
    cachedPitfalls = [];
    return cachedPitfalls;
  }

  const raw = fs.readFileSync(dataPath, "utf8");
  const rawData = JSON.parse(raw) as Record<string, unknown>[];

  // 补全缺失字段，保持向后兼容
  cachedPitfalls = rawData.map((item) => ({
    title: (item.title as string) || '',
    slug: (item.slug as string) || generateSlug((item.title as string) || ''),
    category: (item.category as ContentCategory) || 'devops',
    description: (item.description as string) || (item.title as string) || '',
    root_cause: (item.root_cause as string) || '',
    symptoms: Array.isArray(item.symptoms) ? (item.symptoms as string[]) : [],
    solution: Array.isArray(item.solution) ? (item.solution as string[]) : [],
    quickFix: (item.quickFix as string) || '',
    tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
    prevention: Array.isArray(item.prevention) ? (item.prevention as string[]) : undefined,
    relatedIntel: Array.isArray(item.relatedIntel) ? (item.relatedIntel as string[]) : undefined,
    relatedNodes: Array.isArray(item.relatedNodes) ? (item.relatedNodes as string[]) : undefined,
    relatedTerms: Array.isArray(item.relatedTerms) ? (item.relatedTerms as string[]) : undefined,
    relatedTools: Array.isArray(item.relatedTools) ? (item.relatedTools as string[]) : undefined,
  })) as Pitfall[];

  return cachedPitfalls;
}

/**
 * 根据 slug 查找单个踩坑
 * @param slug - URL 友好的标识符
 * @returns 匹配的踩坑，未找到返回 null
 */
export function getPitfallBySlug(slug: string): Pitfall | null {
  const pitfalls = getAllPitfalls();
  return pitfalls.find((p) => p.slug === slug) || null;
}

/**
 * 根据分类筛选踩坑
 * @param category - 内容分类
 * @returns 该分类下的踩坑数组
 */
export function getPitfallsByCategory(category: ContentCategory): Pitfall[] {
  const pitfalls = getAllPitfalls();
  return pitfalls.filter((p) => p.category === category);
}

/**
 * 根据标签筛选踩坑
 * @param tag - 标签名称
 * @returns 包含该标签的踩坑数组
 */
export function getPitfallsByTag(tag: string): Pitfall[] {
  const pitfalls = getAllPitfalls();
  return pitfalls.filter((p) => p.tags.includes(tag));
}

/**
 * 获取所有唯一的分类
 * @returns 分类数组
 */
export function getAllCategories(): ContentCategory[] {
  const pitfalls = getAllPitfalls();
  const categories = new Set(pitfalls.map((p) => p.category));
  return Array.from(categories);
}

/**
 * 获取所有唯一的标签
 * @returns 标签数组
 */
export function getAllTags(): string[] {
  const pitfalls = getAllPitfalls();
  const tags = new Set(pitfalls.flatMap((p) => p.tags));
  return Array.from(tags);
}
