import { FULL_ROADMAP } from "./roadmap-data";
import { getAllIntelCards, getIntelSearchIndex } from "./intel";
import { getAllTerms } from "./glossary";
import { getAllTools } from "./toolbox";
import { getAllPitfalls } from "./pitfall";
import { getAllProjects } from "./practice";

export interface UnifiedSearchItem {
  id: string;
  title: string;
  content: string;
  type: "node" | "intel" | "tool" | "pitfall" | "project";
  typeLabel: string;
  url: string;
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
  return getIntelSearchIndex().map((item) => ({
    id: `intel-${item.slug}`,
    title: item.title,
    content: item.summary,
    type: "intel" as const,
    typeLabel: "情报",
    url: `/intel/${item.slug}`,
    tags: item.keywords,
    category: item.category,
  }));
}

// ============================================================
// 工具数据提取
// ============================================================
function getToolSearchItems(): UnifiedSearchItem[] {
  return getAllTools().map((tool) => ({
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
  const pitfalls = getAllPitfalls();

  return pitfalls.map((pitfall) => ({
    id: `pitfall-${pitfall.slug}`,
    title: pitfall.title,
    content: `${pitfall.symptoms.join(" ")} ${pitfall.solution.join(" ")} ${pitfall.description}`,
    type: "pitfall" as const,
    typeLabel: "踩坑",
    url: `/intel/${pitfall.slug}`,
    tags: pitfall.tags || [],
    category: pitfall.category || "",
  }));
}

// ============================================================
// 实战项目数据提取
// ============================================================
function getProjectSearchItems(): UnifiedSearchItem[] {
  return getAllProjects().map((project) => ({
    id: `project-${project.slug}`,
    title: project.title,
    content: `${project.summary} ${project.prerequisites.join(" ")}`,
    type: "project" as const,
    typeLabel: "项目",
    url: `/practice/${project.slug}`,
    tags: project.prerequisites,
    category: project.category,
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
    ...getProjectSearchItems(),
  ];

  return cachedIndex;
}
