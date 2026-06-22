import glossaryData from "@/content/glossary/terms.json";
import { type ContentCategory, type TermIndex, type TermDetail } from "./content-types";

// 条件导入 fs 和 path（仅在服务端可用）
let fs: typeof import("fs") | null = null;
let path: typeof import("path") | null = null;
let matter: typeof import("gray-matter") | null = null;

if (typeof window === "undefined") {
  // 服务端环境
  fs = require("fs");
  path = require("path");
  matter = require("gray-matter");
}

// ============ 类型定义 ============

export interface ResourceLink {
  title: string;
  url: string;
  type: "paper" | "article" | "course" | "documentation" | "video";
}

export interface GlossaryTerm {
  slug: string;
  name: string;
  nameEn?: string;
  category: string;
  tags: string[];
  summary: string;
  description: string;
  relatedTerms: string[];
  relatedNodes: string[];
  relatedIntel: string[];
  relatedTools: string[];
  resources: ResourceLink[];
}

export interface GlossaryCategory {
  id: string;
  name: string;
  description: string;
}

// JSON 数据的实际结构
interface RawGlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  category: string;
  relatedTerms: string[];
}

// JSON 文件是数组格式
type GlossaryData = RawGlossaryTerm[];

// MD 详情文件的 frontmatter 结构
interface TermFrontmatter {
  title?: string;
  category?: string;
  relatedTerms?: string[];
  relatedNodes?: string[];
  relatedIntel?: string[];
  relatedTools?: string[];
  tags?: string[];
}

// ============ 模块级缓存 ============

let cachedTerms: GlossaryTerm[] | null = null;
let cachedTermDetails: TermDetail[] | null = null;

// ============ MD 详情读取 ============

// 读取术语的 MD 详情文件
export function readTermDetail(slug: string): TermDetail | null {
  // 客户端环境下无法读取文件，返回 null
  if (!fs || !path || !matter) {
    return null;
  }

  const mdPath = path.join(process.cwd(), "content", "glossary", "terms", `${slug}.md`);

  // 检查文件是否存在
  if (!fs.existsSync(mdPath)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(mdPath, "utf-8");
    const { data: frontmatter, content } = matter(fileContent);

    // 从 JSON 索引中查找对应数据
    const data = glossaryData as unknown as GlossaryData;
    const indexItem = data.find((item) => item.slug === slug);

    if (!indexItem) {
      return null;
    }

    // 解析 frontmatter
    const fm = frontmatter as TermFrontmatter;

    return {
      term: indexItem.term,
      slug: indexItem.slug,
      nameZh: fm.title,
      category: (fm.category || indexItem.category) as ContentCategory,
      summary: indexItem.definition,
      content: content,
      relatedTerms: fm.relatedTerms || indexItem.relatedTerms || [],
      relatedNodes: fm.relatedNodes || [],
      relatedIntel: fm.relatedIntel || [],
      relatedTools: fm.relatedTools || [],
      tags: fm.tags || [],
    };
  } catch (error) {
    console.error(`Error reading term detail for ${slug}:`, error);
    return null;
  }
}

// 获取所有术语详情（带 MD 内容）
export function getAllTermDetails(): TermDetail[] {
  if (cachedTermDetails) return cachedTermDetails;

  const data = glossaryData as unknown as GlossaryData;
  cachedTermDetails = data
    .map((item) => readTermDetail(item.slug))
    .filter((detail): detail is TermDetail => detail !== null);

  return cachedTermDetails;
}

// 将 TermDetail 转换为 GlossaryTerm（向后兼容）
export function toGlossaryTerm(detail: TermDetail): GlossaryTerm {
  return {
    slug: detail.slug,
    name: detail.term,
    nameEn: undefined,
    category: detail.category,
    tags: detail.tags || [],
    summary: detail.summary,
    description: detail.content || detail.summary,
    relatedTerms: detail.relatedTerms || [],
    relatedNodes: detail.relatedNodes || [],
    relatedIntel: detail.relatedIntel || [],
    relatedTools: detail.relatedTools || [],
    resources: [],
  };
}

// ============ 数据读取 ============

// 获取完整的术语列表
export function getAllTerms(): GlossaryTerm[] {
  if (cachedTerms) return cachedTerms;

  const data = glossaryData as unknown as GlossaryData;
  cachedTerms = data.map((item) => ({
    slug: item.slug,
    name: item.term,
    nameEn: undefined,
    category: item.category,
    tags: [],
    summary: item.definition,
    description: item.definition,
    relatedTerms: item.relatedTerms || [],
    relatedNodes: [],
    relatedIntel: [],
    relatedTools: [],
    resources: [],
  }));

  return cachedTerms;
}

// 根据 slug 获取术语
export function getTermBySlug(slug: string): GlossaryTerm | undefined {
  const terms = getAllTerms();
  return terms.find((t) => t.slug === slug);
}

// 根据 slug 获取术语详情（带 MD 内容）
export function getTermDetailBySlug(slug: string): TermDetail | null {
  return readTermDetail(slug);
}

// 根据分类获取术语
export function getTermsByCategory(category: string): GlossaryTerm[] {
  return getAllTerms().filter((term) => term.category === category);
}

// 获取所有分类
export function getAllCategories(): GlossaryCategory[] {
  // 从术语中动态提取分类
  const terms = getAllTerms();
  const categoryMap = new Map<string, GlossaryCategory>();

  for (const term of terms) {
    if (!categoryMap.has(term.category)) {
      categoryMap.set(term.category, {
        id: term.category,
        name: term.category,
        description: '',
      });
    }
  }

  return Array.from(categoryMap.values());
}

// 获取相关术语
export function getRelatedTerms(slug: string): GlossaryTerm[] {
  const term = getTermBySlug(slug);
  if (!term) return [];
  return term.relatedTerms
    .map((relatedSlug) => getTermBySlug(relatedSlug))
    .filter((t): t is GlossaryTerm => t !== undefined);
}

// 搜索术语
export function searchTerms(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase();
  return getAllTerms().filter(
    (term) =>
      term.name.toLowerCase().includes(lowerQuery) ||
      (term.nameEn && term.nameEn.toLowerCase().includes(lowerQuery)) ||
      term.summary.toLowerCase().includes(lowerQuery) ||
      term.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

// 按首字母分组
export function getTermsGroupedByLetter(): Record<string, GlossaryTerm[]> {
  const terms = getAllTerms();
  const grouped: Record<string, GlossaryTerm[]> = {};

  for (const term of terms) {
    const firstLetter = term.name.charAt(0).toUpperCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(term);
  }

  return grouped;
}

// 获取所有标签
export function getAllTags(): string[] {
  const terms = getAllTerms();
  const tagSet = new Set<string>();
  for (const term of terms) {
    for (const tag of term.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

// 通过 slug 列表获取术语（用于批量查询）
export function getTermsBySlugs(slugs: string[]): GlossaryTerm[] {
  return slugs
    .map((slug) => getTermBySlug(slug))
    .filter((t): t is GlossaryTerm => t !== undefined);
}
