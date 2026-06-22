/**
 * 情报标签体系定义
 */

// 标签类别
export type TagCategory = "domain" | "level" | "type";

// 标签定义
export interface TagDefinition {
  key: string;
  label: string;
  category: TagCategory;
  color: string;
}

// 所有可用标签
export const TAG_DEFINITIONS: TagDefinition[] = [
  // 技术领域
  { key: "cv", label: "CV", category: "domain", color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  { key: "nlp", label: "NLP", category: "domain", color: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  { key: "devops", label: "DevOps", category: "domain", color: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
  { key: "math", label: "数学", category: "domain", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  { key: "llm", label: "LLM", category: "domain", color: "bg-pink-500/15 text-pink-400 border-pink-500/30" },
  { key: "mlops", label: "MLOps", category: "domain", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  { key: "infra", label: "基础设施", category: "domain", color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
  { key: "training", label: "训练", category: "domain", color: "bg-rose-500/15 text-rose-400 border-rose-500/30" },

  // 难度等级
  { key: "beginner", label: "基础", category: "level", color: "bg-green-500/15 text-green-400 border-green-500/30" },
  { key: "intermediate", label: "进阶", category: "level", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  { key: "advanced", label: "高级", category: "level", color: "bg-red-500/15 text-red-400 border-red-500/30" },

  // 内容类型
  { key: "theory", label: "原理", category: "type", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { key: "practice", label: "实战", category: "type", color: "bg-teal-500/15 text-teal-400 border-teal-500/30" },
  { key: "tool", label: "工具", category: "type", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  { key: "paper", label: "论文", category: "type", color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" },
];

// 按类别分组
export const TAG_GROUPS = {
  domain: TAG_DEFINITIONS.filter(t => t.category === "domain"),
  level: TAG_DEFINITIONS.filter(t => t.category === "level"),
  type: TAG_DEFINITIONS.filter(t => t.category === "type"),
};

// 标签映射（方便查找）
export const TAG_MAP = new Map(TAG_DEFINITIONS.map(t => [t.key, t]));

/**
 * 获取标签定义
 */
export function getTagDef(key: string): TagDefinition | undefined {
  return TAG_MAP.get(key);
}

/**
 * 获取标签颜色样式
 */
export function getTagColor(key: string): string {
  return TAG_MAP.get(key)?.color || "bg-neutral-500/15 text-neutral-400 border-neutral-500/30";
}
