import fs from "node:fs";
import path from "node:path";
import { getAllIntelCards, type IntelCard } from "./intel";
import type { ContentCategory, Tool, ToolboxData, ToolScenario } from "./content-types";

// 重新导出类型以保持向后兼容
export type { ContentCategory, Tool, ToolboxData, ToolScenario };

export interface ToolGithubInfo {
  stars: string;
  last_release: string;
  url: string;
}

/**
 * 从工具名称生成 URL 友好的 slug
 * @param name - 工具名称
 * @returns URL 友好的 slug 字符串
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

let cachedData: ToolboxData | null = null;

export function getToolboxData(): ToolboxData {
  if (cachedData) return cachedData;

  const dataPath = path.join(process.cwd(), "content", "toolbox", "tools.json");

  if (!fs.existsSync(dataPath)) {
    cachedData = { tools: [], scenarios: [] };
    return cachedData;
  }

  const raw = fs.readFileSync(dataPath, "utf8");
  cachedData = JSON.parse(raw) as ToolboxData;
  return cachedData;
}

export function getToolCategories(): string[] {
  const { tools } = getToolboxData();
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const tool of tools) {
    if (!seen.has(tool.category)) {
      seen.add(tool.category);
      categories.push(tool.category);
    }
  }
  return categories;
}

export function getAllTools(): Tool[] {
  return getToolboxData().tools;
}

/**
 * 关联到 intel 技术情报的轻量级引用
 */
export interface RelatedIntelRef {
  slug: string;
  title: string;
  summary: string;
  matchScore: number;
}

/**
 * 将字符串归一化为小写 token 集合，用于轻量级关键词匹配
 * 规则：
 *   - 分词：按非字母数字字符切分（保留连字符如 lora-qlora）
 *   - 英文全小写
 *   - 过滤停用词与过短 token
 */
const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "for",
  "with",
  "of",
  "in",
  "on",
  "to",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "as",
  "at",
  "by",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "from",
  "into",
  "your",
  "you",
  "we",
  "our",
  "can",
  "may",
  "will",
  "would",
  "should",
  "could",
  "not",
  "but",
  "if",
  "then",
  "than",
  "so",
  "such",
  "no",
  "do",
  "does",
]);

function tokenize(text: string): string[] {
  const tokens = new Set<string>();
  const parts = text
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fa5]+/)
    .filter(Boolean);

  for (const t of parts) {
    if (t.length < 2) continue;
    if (STOPWORDS.has(t)) continue;
    tokens.add(t);
    // 处理中文子串：对中文字符串做 n-gram (2-char) 以提升中文命中
    if (/[\u4e00-\u9fa5]/.test(t) && t.length >= 2) {
      for (let i = 0; i <= t.length - 2; i++) {
        tokens.add(t.slice(i, i + 2));
      }
    }
  }
  return Array.from(tokens);
}

/**
 * 工具 → 关联技术情报（加权匹配）
 *  - 工具名 + tags 命中 intel title/keywords：高权重
 *  - 工具 use_cases 命中 intel keywords/summary：中权重
 *  - 工具 purpose 命中 intel summary：低权重
 *  - 命中 intel 本身出现的工具名（如 "langchain" 在 RAG 的 keywords 中）：额外加成
 */
export function findRelatedIntel(tool: Tool, maxResults = 3): RelatedIntelRef[] {
  const intelCards = getAllIntelCards();
  if (intelCards.length === 0) return [];

  // 工具侧 token 分桶
  const nameTokens = tokenize(tool.name);
  const tagTokensList: string[] = [];
  tool.tags.forEach((tag) => {
    tokenize(tag).forEach((t) => {
      if (tagTokensList.indexOf(t) === -1) tagTokensList.push(t);
    });
  });
  const useCaseTokensList: string[] = [];
  tool.use_cases.forEach((uc) => {
    tokenize(uc).forEach((t) => {
      if (useCaseTokensList.indexOf(t) === -1) useCaseTokensList.push(t);
    });
  });
  const purposeTokens = tokenize(tool.purpose);

  const scored: RelatedIntelRef[] = intelCards.map((card) => {
    const titleTokens = tokenize(card.title);
    const keywordList: string[] = [];
    card.keywords.forEach((kw) => {
      tokenize(kw).forEach((t) => {
        if (keywordList.indexOf(t) === -1) keywordList.push(t);
      });
    });
    const summaryTokens = tokenize(card.summary);

    let score = 0;
    // 高权重：工具名命中标题或关键词 —— 最直接的关联信号
    nameTokens.forEach((tok) => {
      if (titleTokens.indexOf(tok) !== -1) score += 5;
      if (keywordList.indexOf(tok) !== -1) score += 4;
    });
    // 高权重：工具 tags 命中关键词或标题
    tagTokensList.forEach((tok) => {
      if (keywordList.indexOf(tok) !== -1) score += 3;
      if (titleTokens.indexOf(tok) !== -1) score += 3;
    });
    // 中权重：use_case 命中 keywords / summary
    useCaseTokensList.forEach((tok) => {
      if (keywordList.indexOf(tok) !== -1) score += 2.5;
      if (titleTokens.indexOf(tok) !== -1) score += 2;
      if (summaryTokens.indexOf(tok) !== -1) score += 1.2;
    });
    // 低权重：purpose 文本命中 summary / keywords
    purposeTokens.forEach((tok) => {
      if (summaryTokens.indexOf(tok) !== -1) score += 0.6;
      if (keywordList.indexOf(tok) !== -1) score += 0.8;
    });

    return {
      slug: card.slug,
      title: card.title,
      summary: card.summary,
      matchScore: score,
    };
  });

  // 过滤并按分数排序（至少命中 1 个高权重信号才返回，避免噪声）
  return scored
    .filter((r) => r.matchScore >= 3)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, maxResults);
}

/**
 * 为所有工具预计算关联情报，供页面一次性下发
 */
export interface ToolWithRelated extends Tool {
  related_intel: RelatedIntelRef[];
}

/**
 * 根据工具名称获取工具详情
 */
export function getToolByName(name: string): Tool | undefined {
  const data = getToolboxData();
  return data.tools.find((t) => t.name === name);
}

/**
 * 获取工具的 ID（用于 URL）
 */
export function getToolId(tool: Tool): string {
  return tool.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function getToolboxDataWithRelated(): {
  tools: ToolWithRelated[];
  scenarios: ToolScenario[];
} {
  const data = getToolboxData();
  const tools: ToolWithRelated[] = data.tools.map((tool) => ({
    ...tool,
    related_intel: findRelatedIntel(tool),
  }));
  return { tools, scenarios: data.scenarios };
}
