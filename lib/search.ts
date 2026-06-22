import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { FULL_ROADMAP } from "./roadmap-data";

/**
 * 统一搜索索引项
 * 所有模块的数据都转换为此格式
 */
export interface UnifiedSearchItem {
  id: string;
  title: string;
  content: string;
  type: "node" | "intel" | "tool" | "pitfall";
  typeLabel: string;
  url: string;
  tags?: string[];
  category?: string;
}

/** 工具 JSON 数据结构 */
interface ToolJsonItem {
  name: string;
  purpose: string;
  features: string[];
  use_cases: string[];
  tags?: string[];
  category?: string;
}

/** 踩坑 JSON 数据结构 */
interface PitfallJsonItem {
  title: string;
  symptoms: string[];
  solution: string[];
  tags?: string[];
  category?: string;
}

// ============================================================
// 路由节点数据提取
// ============================================================
function getRoadmapSearchItems(): UnifiedSearchItem[] {
  return FULL_ROADMAP.map((node) => ({
    id: `node-${node.id}`,
    title: node.name,
    content: `${node.description || ""} ${(node.outcomes || []).join(" ")}`,
    type: "node" as const,
    typeLabel: "路线图",
    url: `/roadmap?node=${node.id}`,
    tags: [node.track],
    category: node.track,
  }));
}

// ============================================================
// 情报数据提取
// ============================================================
function getIntelSearchItems(): UnifiedSearchItem[] {
  const contentDir = path.join(process.cwd(), "content", "intel");

  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const files = fs
    .readdirSync(contentDir)
    .filter((file) => file.endsWith(".md"))
    .sort();

  return files.map((file) => {
    const filePath = path.join(contentDir, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data } = matter(raw);

    const slug = file.replace(/\.md$/, "");

    return {
      id: `intel-${slug}`,
      title: String(data.title ?? slug),
      content: String(data.summary ?? ""),
      type: "intel" as const,
      typeLabel: "情报",
      url: `/intel/${slug}`,
      tags: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
      category: String(data.category ?? ""),
    };
  });
}

// ============================================================
// 工具数据提取
// ============================================================
function getToolSearchItems(): UnifiedSearchItem[] {
  const toolsPath = path.join(process.cwd(), "content", "toolbox", "tools.json");

  if (!fs.existsSync(toolsPath)) {
    return [];
  }

  const raw = fs.readFileSync(toolsPath, "utf8");
  const data = JSON.parse(raw);

  return (data.tools || []).map((tool: ToolJsonItem) => ({
    id: `tool-${tool.name.toLowerCase().replace(/\s+/g, "-")}`,
    title: tool.name,
    content: `${tool.purpose} ${tool.features.join(" ")} ${tool.use_cases.join(" ")}`,
    type: "tool" as const,
    typeLabel: "工具",
    url: `/toolbox`,
    tags: tool.tags || [],
    category: tool.category || "",
  }));
}

// ============================================================
// 踩坑数据提取
// ============================================================
function getPitfallSearchItems(): UnifiedSearchItem[] {
  const pitfallsPath = path.join(process.cwd(), "content", "pitfall", "pitfalls.json");

  if (!fs.existsSync(pitfallsPath)) {
    return [];
  }

  const raw = fs.readFileSync(pitfallsPath, "utf8");
  const data = JSON.parse(raw);

  return (data || []).map((pitfall: PitfallJsonItem, index: number) => ({
    id: `pitfall-${index}`,
    title: pitfall.title,
    content: `${pitfall.symptoms.join(" ")} ${pitfall.solution.join(" ")}`,
    type: "pitfall" as const,
    typeLabel: "踩坑",
    url: `/pitfall`,
    tags: pitfall.tags || [],
    category: pitfall.category || "",
  }));
}

// ============================================================
// 统一搜索索引（带缓存）
// ============================================================
let cachedIndex: UnifiedSearchItem[] | null = null;

export function getUnifiedSearchIndex(): UnifiedSearchItem[] {
  if (cachedIndex) return cachedIndex;

  cachedIndex = [
    ...getRoadmapSearchItems(),
    ...getIntelSearchItems(),
    ...getToolSearchItems(),
    ...getPitfallSearchItems(),
  ];

  return cachedIndex;
}
