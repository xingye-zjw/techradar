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
  /** 标签列表 */
  tags: string[];
  /** 预计阅读时间（分钟） */
  readingTime: number;
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

  // 计算阅读时间（按中文 300 字/分钟）
  const charCount = content.replace(/\s/g, "").length;
  const readingTime = Math.max(1, Math.ceil(charCount / 300));

  // 自动生成标签
  const tags = generateTags(data, slug);

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
    tags,
    readingTime,
  };
}

/** Markdown frontmatter 数据结构 */
interface IntelFrontmatter {
  title?: string;
  category?: string;
  keywords?: string[];
  difficulty?: string;
  duration?: string;
  summary?: string;
  takeaways?: string[];
}

/**
 * 根据内容自动生成标签
 */
function generateTags(data: IntelFrontmatter, slug: string): string[] {
  const tags: string[] = [];

  // 根据 category 推断领域标签
  const category = String(data.category || "").toLowerCase();
  if (category.includes("cv") || category.includes("vision") || category.includes("检测")) {
    tags.push("cv");
  }
  if (category.includes("nlp") || category.includes("language") || category.includes("llm")) {
    tags.push("nlp");
  }
  if (category.includes("devops") || category.includes("deploy") || category.includes("工程")) {
    tags.push("devops");
  }
  if (category.includes("math") || category.includes("数学")) {
    tags.push("math");
  }
  if (category.includes("mlops") || category.includes("experiment")) {
    tags.push("mlops");
  }

  // 根据 keywords 推断
  const keywords = (data.keywords || []).map((k: string) => String(k).toLowerCase());
  if (keywords.some((k: string) => ["yolo", "cnn", "resnet", "目标检测", "图像"].includes(k))) {
    if (!tags.includes("cv")) tags.push("cv");
  }
  if (keywords.some((k: string) => ["transformer", "bert", "gpt", "llm", "nlp", "rag"].includes(k))) {
    if (!tags.includes("nlp")) tags.push("nlp");
  }
  if (keywords.some((k: string) => ["docker", "git", "linux", "部署", "ci/cd"].includes(k))) {
    if (!tags.includes("devops")) tags.push("devops");
  }
  if (keywords.some((k: string) => ["lora", "qlora", "微调", "finetune"].includes(k))) {
    tags.push("llm");
  }

  // 根据 difficulty 添加难度标签
  const difficulty = String(data.difficulty || "intermediate");
  if (difficulty === "beginner") tags.push("beginner");
  else if (difficulty === "advanced") tags.push("advanced");
  else tags.push("intermediate");

  // 根据内容推断类型标签
  const content = String(data.summary || "").toLowerCase();
  if (content.includes("论文") || content.includes("paper")) {
    tags.push("paper");
  }
  if (content.includes("实战") || content.includes("实践") || content.includes("动手")) {
    tags.push("practice");
  }
  if (content.includes("原理") || content.includes("理论") || content.includes("数学")) {
    tags.push("theory");
  }

  return Array.from(new Set(tags)); // 去重
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
