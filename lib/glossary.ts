import glossaryData from "@/content/glossary/terms.json";

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

// JSON 数据的原始类型（description 字段来自 JSON，可能是空字符串）
interface RawGlossaryTerm {
  slug: string;
  name: string;
  nameEn?: string;
  category: string;
  tags: string[];
  summary: string;
  description?: string;
  relatedTerms: string[];
  relatedNodes: string[];
  relatedIntel: string[];
  relatedTools: string[];
  resources: ResourceLink[];
}

interface GlossaryIndex {
  terms: RawGlossaryTerm[];
  categories: GlossaryCategory[];
}

// ============ 模块级缓存 ============

let cachedTerms: GlossaryTerm[] | null = null;

// ============ 数据读取 ============

// 获取完整的术语列表
export function getAllTerms(): GlossaryTerm[] {
  if (cachedTerms) return cachedTerms;

  const data = glossaryData as GlossaryIndex;
  cachedTerms = data.terms.map((term) => ({
    ...term,
    description: term.description || term.summary,
  }));

  return cachedTerms;
}

// 根据 slug 获取术语
export function getTermBySlug(slug: string): GlossaryTerm | undefined {
  const data = glossaryData as GlossaryIndex;
  const term = data.terms.find((t) => t.slug === slug);
  if (!term) return undefined;
  return {
    ...term,
    description: term.description || term.summary,
  };
}

// 根据分类获取术语
export function getTermsByCategory(category: string): GlossaryTerm[] {
  return getAllTerms().filter((term) => term.category === category);
}

// 获取所有分类
export function getAllCategories(): GlossaryCategory[] {
  const data = glossaryData as GlossaryIndex;
  return data.categories || [];
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
