import { isValidCategory, type Pitfall, type ContentCategory, type IntelCard } from "./content-types";
import { getAllIntelCards } from "./intel";

export type { Pitfall, ContentCategory } from "./content-types";

/**
 * 判断一篇 IntelCard 是否是 pitfall 类型（单条详情型）
 * 判断条件：slug 包含 "pitfall" 且序号 >= 140（新迁移的结构化单条坑）
 * 旧版汇总型 pitfall（090-135）不纳入 pitfall 页面
 */
function isPitfallCard(card: IntelCard): boolean {
  if (!card.slug.includes("pitfall")) return false;
  const match = card.slug.match(/^(\d+)-/);
  if (!match) return false;
  const num = parseInt(match[1], 10);
  return num >= 140;
}

/**
 * 从 IntelCard 正文中提取结构化信息
 * 解析典型症状、解决方案、快速修复、预防措施等
 */
function extractPitfallFromCard(card: IntelCard): Pitfall {
  const content = card.content;
  
  // 提取症状（在"典型症状"标题后，下一个标题前）
  const symptomsMatch = content.match(/###\s*🔑\s*典型症状\s*\n([\s\S]*?)(?=\n###|$)/);
  const symptoms = symptomsMatch
    ? symptomsMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*[×x]\s*/, '').trim())
    : [];
  
  // 提取解决方案（在"完整排查方案"后，下一个标题前）
  const solutionMatch = content.match(/##\s*完整排查方案\s*\n([\s\S]*?)(?=\n###|$)/);
  let solution: string[] = [];
  if (solutionMatch) {
    solution = solutionMatch[1]
      .split('\n')
      .filter(l => /^\d+\.\s/.test(l.trim()))
      .map(l => l.replace(/^\d+\.\s*/, '').trim());
  }
  
  // 提取快速修复
  const quickFixMatch = content.match(/>\s*\*\*快速修复：\*\*(.*?)(?:\n|$)/);
  const quickFix = quickFixMatch ? quickFixMatch[1].trim() : "";
  
  // 提取预防措施
  const preventionMatch = content.match(/##\s*预防措施\s*\n([\s\S]*?)(?=\n##|$)/);
  const prevention = preventionMatch
    ? preventionMatch[1].split('\n').filter(l => l.trim().startsWith('- ')).map(l => l.replace(/^-\s*/, '').trim())
    : [];
  
  // 提取根因
  const rootCauseMatch = content.match(/###\s*🔑\s*根本原因\s*\n([\s\S]*?)(?=\n###|$)/);
  const root_cause = rootCauseMatch ? rootCauseMatch[1].trim() : "";
  
  return {
    title: card.title,
    slug: card.slug,
    category: card.category,
    description: card.summary,
    root_cause,
    symptoms,
    solution,
    quickFix,
    tags: card.tags,
    prevention: prevention.length > 0 ? prevention : undefined,
    relatedIntel: card.prerequisites,
    relatedNodes: card.relatedNodes,
    relatedTerms: card.relatedTerms,
  };
}

// 踩坑数据缓存
let cachedPitfalls: Pitfall[] | null = null;

/**
 * 获取所有踩坑数据
 * 从 Intel 模块中筛选 pitfall 类的卡片并转换为 Pitfall 格式
 * @returns 踩坑数组
 */
export function getAllPitfalls(): Pitfall[] {
  if (cachedPitfalls) return cachedPitfalls;

  const allCards = getAllIntelCards();
  const pitfallCards = allCards.filter(isPitfallCard);
  
  cachedPitfalls = pitfallCards.map(extractPitfallFromCard);
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
