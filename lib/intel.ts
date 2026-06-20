import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * 单条技术情报卡片的结构化数据
 * 对应 content/intel/*.md 中的 YAML Frontmatter + 正文摘要
 */
export interface IntelCard {
  slug: string;
  title: string;
  category: string;
  keywords: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  summary: string;
  /** 人工编写的"你将学到什么"，1-4 条完整短句 */
  takeaways?: string[];
  content: string;
}

// 模块级缓存，避免每次请求都读取文件系统
let cachedCards: IntelCard[] | null = null;

/**
 * 遍历 content/intel/ 目录，解析所有 .md 文件
 * 返回完整的卡片列表（按文件名排序）
 * 在 Next.js App Router 中此函数应在 Server Component / generateStaticParams 中调用
 */
export function getAllIntelCards(): IntelCard[] {
  if (cachedCards) return cachedCards;

  const contentDir = path.join(process.cwd(), "content", "intel");

  if (!fs.existsSync(contentDir)) {
    cachedCards = [];
    return cachedCards;
  }

  const files = fs
    .readdirSync(contentDir)
    .filter((file) => file.endsWith(".md"))
    .sort();

  cachedCards = files.map((file) => parseIntelCard(file, contentDir));
  return cachedCards;
}

/**
 * 解析单个 Markdown 文件
 */
function parseIntelCard(file: string, contentDir: string): IntelCard {
  const filePath = path.join(contentDir, file);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const slug = file.replace(/\.md$/, "");

  return {
    slug,
    title: String(data.title ?? slug),
    category: String(data.category ?? "uncategorized"),
    keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
    difficulty: (data.difficulty ?? "intermediate") as IntelCard["difficulty"],
    duration: String(data.duration ?? ""),
    summary: String(data.summary ?? ""),
    takeaways: Array.isArray(data.takeaways) ? data.takeaways.map(String) : undefined,
    content,
  };
}

/**
 * 获取单条情报卡（by slug）
 */
export function getIntelCardBySlug(slug: string): IntelCard | null {
  const cards = getAllIntelCards();
  return cards.find((card) => card.slug === slug) ?? null;
}

/**
 * 仅返回搜索所需的轻量级字段
 */
export interface IntelSearchIndex {
  slug: string;
  title: string;
  category: string;
  keywords: string[];
  summary: string;
}

export function getIntelSearchIndex(): IntelSearchIndex[] {
  return getAllIntelCards().map((card) => ({
    slug: card.slug,
    title: card.title,
    category: card.category,
    keywords: card.keywords,
    summary: card.summary,
  }));
}
