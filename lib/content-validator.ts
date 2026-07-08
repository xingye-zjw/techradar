/**
 * 数据验证器
 *
 * 验证情报、术语、工具、踩坑、项目数据是否符合规范。
 * 所有验证函数返回错误消息数组，空数组表示验证通过。
 *
 * 【类型安全】输入一律使用 unknown + 类型守卫判定，禁止直接用 any。
 */

import { isValidCategory, type ContentCategory } from "./content-types";

type ValidatorInput = unknown;

/* ---------- 类型守卫 helpers ---------- */

function isRecord(obj: ValidatorInput): obj is Record<string, unknown> {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

function isNonEmptyStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "string");
}

function asCategoryString(v: unknown): ContentCategory | null {
  return typeof v === "string" && isValidCategory(v) ? v : null;
}

/* ---------- 公共字段收集器：减少每个 validator 的重复断言 ---------- */

interface BaseValidated {
  title?: string;
  category: ContentCategory | null;
  errors: string[];
}

function validateBase(data: ValidatorInput, label: string, requireTitle = true): BaseValidated {
  const errors: string[] = [];
  if (!isRecord(data)) {
    errors.push(`${label}数据不是对象`);
    return { category: null, errors };
  }
  if (requireTitle && typeof data.title !== "string") {
    errors.push(`${label}缺少 title 字段`);
  }
  const category = asCategoryString(data.category);
  if (typeof data.category === "undefined" || data.category === null) {
    errors.push(`${label}缺少 category 字段`);
  } else if (!category) {
    errors.push(`${label}category 无效: ${String(data.category)}`);
  }
  return { title: typeof data.title === "string" ? data.title : undefined, category, errors };
}

/**
 * 验证情报数据
 * @param data - 待验证的情报数据（unknown 类型以兼容外部输入）
 * @returns 错误消息数组，空数组表示验证通过
 */
export function validateIntel(data: ValidatorInput): string[] {
  const base = validateBase(data, "情报");
  if (base.errors.length > 0 && !isRecord(data)) return base.errors;

  const obj = isRecord(data) ? data : {};
  const errors = [...base.errors];

  // keywords：必须是非空字符串数组
  if (!isNonEmptyStringArray(obj.keywords)) {
    errors.push("情报缺少 keywords 字段");
  }
  if (typeof obj.difficulty !== "string" || !obj.difficulty) {
    errors.push("情报缺少 difficulty 字段");
  }
  if (typeof obj.summary !== "string" || !obj.summary.trim()) {
    errors.push("情报缺少 summary 字段");
  }
  // takeaways：必须是非空字符串数组（项目规范：4条人类编写的学习目标）
  if (!isNonEmptyStringArray(obj.takeaways)) {
    errors.push("情报缺少 takeaways 字段");
  }

  return errors;
}

/**
 * 验证术语数据（支持 GlossaryTerm 或 TermIndex 格式）
 */
export function validateTerm(data: ValidatorInput): string[] {
  const errors: string[] = [];
  if (!isRecord(data)) {
    return ["术语数据不是对象"];
  }

  // 支持两种格式：GlossaryTerm (name/summary) 或 TermIndex (term/definition)
  const hasTerm = typeof data.term === "string" || typeof data.name === "string";
  if (!hasTerm) errors.push("术语缺少 term/name 字段");

  if (typeof data.slug !== "string" || !data.slug) {
    errors.push("术语缺少 slug 字段");
  }

  if (typeof data.category === "undefined" || data.category === null) {
    errors.push("术语缺少 category 字段");
  } else if (!asCategoryString(data.category)) {
    errors.push(`术语 category 无效: ${String(data.category)}`);
  }

  // 支持 definition 或 summary 字段
  const hasDefinition =
    (typeof data.definition === "string" && !!data.definition.trim()) ||
    (typeof data.summary === "string" && !!data.summary.trim());
  if (!hasDefinition) errors.push("术语缺少 definition/summary 字段");

  return errors;
}

/**
 * 验证工具数据
 */
export function validateTool(data: ValidatorInput): string[] {
  const base = validateBase(data, "工具");
  if (base.errors.length > 0 && !isRecord(data)) return base.errors;

  const obj = isRecord(data) ? data : {};
  const errors = [...base.errors];

  if (typeof obj.purpose !== "string" || !obj.purpose.trim()) {
    errors.push("工具缺少 purpose 字段");
  }
  if (typeof obj.description !== "string" || !obj.description.trim()) {
    errors.push("工具缺少 description 字段");
  }
  if (typeof obj.install !== "string") {
    errors.push("工具缺少 install 字段");
  }

  return errors;
}

/**
 * 验证踩坑数据
 */
export function validatePitfall(data: ValidatorInput): string[] {
  const base = validateBase(data, "踩坑");
  if (base.errors.length > 0 && !isRecord(data)) return base.errors;

  const obj = isRecord(data) ? data : {};
  const errors = [...base.errors];

  if (typeof obj.description !== "string" || !obj.description.trim()) {
    errors.push("踩坑缺少 description 字段");
  }
  if (typeof obj.root_cause !== "string" || !obj.root_cause.trim()) {
    errors.push("踩坑缺少 root_cause 字段");
  }
  if (!isNonEmptyStringArray(obj.symptoms)) {
    errors.push("踩坑缺少 symptoms 字段");
  }
  if (!isNonEmptyStringArray(obj.solution)) {
    errors.push("踩坑缺少 solution 字段");
  }
  if (typeof obj.quickFix !== "string" || !obj.quickFix.trim()) {
    errors.push("踩坑缺少 quickFix 字段");
  }

  return errors;
}

/**
 * 验证实战项目数据
 */
export function validateProject(data: ValidatorInput): string[] {
  const errors: string[] = [];
  if (!isRecord(data)) {
    return ["项目数据不是对象"];
  }

  if (typeof data.slug !== "string" || !data.slug) {
    errors.push("项目缺少 slug 字段");
  }
  if (typeof data.title !== "string" || !data.title.trim()) {
    errors.push("项目缺少 title 字段");
  }
  if (typeof data.category === "undefined" || data.category === null) {
    errors.push("项目缺少 category 字段");
  } else if (!asCategoryString(data.category)) {
    errors.push(`项目 category 无效: ${String(data.category)}`);
  }
  if (typeof data.difficulty === "undefined" || data.difficulty === null) {
    errors.push("项目缺少 difficulty 字段");
  }
  if (typeof data.duration !== "string" || !data.duration.trim()) {
    errors.push("项目缺少 duration 字段");
  }
  if (typeof data.summary !== "string" || !data.summary.trim()) {
    errors.push("项目缺少 summary 字段");
  }
  if (!isNonEmptyStringArray(data.prerequisites)) {
    errors.push("项目缺少 prerequisites 字段");
  }
  if (!isNonEmptyStringArray(data.objectives)) {
    errors.push("项目缺少 objectives 字段");
  }
  if (!Array.isArray(data.steps) || data.steps.length === 0) {
    errors.push("项目缺少 steps 字段");
  }

  return errors;
}

export type ContentType = "intel" | "term" | "tool" | "pitfall" | "project";

/**
 * 验证数据是否符合指定类型的规范
 */
export function validateContent(type: ContentType, data: ValidatorInput): string[] {
  switch (type) {
    case "intel":
      return validateIntel(data);
    case "term":
      return validateTerm(data);
    case "tool":
      return validateTool(data);
    case "pitfall":
      return validatePitfall(data);
    case "project":
      return validateProject(data);
    default:
      return [`未知的内容类型: ${String(type)}`];
  }
}

/**
 * 批量验证数据
 */
export function validateBatch(
  type: ContentType,
  items: unknown[],
): { index: number; errors: string[] }[] {
  const results: { index: number; errors: string[] }[] = [];
  if (!Array.isArray(items)) return results;

  items.forEach((item, index) => {
    const errors = validateContent(type, item);
    if (errors.length > 0) {
      results.push({ index, errors });
    }
  });

  return results;
}
