/**
 * 数据验证器
 *
 * 验证情报、术语、工具、踩坑数据是否符合规范。
 * 所有验证函数返回错误消息数组，空数组表示验证通过。
 */

import { isValidCategory, type ContentCategory } from './content-types';

/**
 * 验证情报数据
 * @param data - 待验证的情报数据
 * @returns 错误消息数组，空数组表示验证通过
 */
export function validateIntel(data: any): string[] {
  const errors: string[] = [];

  if (!data.title) errors.push('情报缺少 title 字段');
  if (!data.category) {
    errors.push('情报缺少 category 字段');
  } else if (!isValidCategory(data.category)) {
    errors.push(`情报 category 无效: ${data.category}`);
  }
  if (!data.keywords?.length) errors.push('情报缺少 keywords 字段');
  if (!data.difficulty) errors.push('情报缺少 difficulty 字段');
  if (!data.summary) errors.push('情报缺少 summary 字段');
  if (!data.takeaways?.length) errors.push('情报缺少 takeaways 字段');

  return errors;
}

/**
 * 验证术语数据
 * @param data - 待验证的术语数据（支持 GlossaryTerm 或 TermIndex 格式）
 * @returns 错误消息数组，空数组表示验证通过
 */
export function validateTerm(data: any): string[] {
  const errors: string[] = [];

  // 支持两种格式：GlossaryTerm (name/summary) 或 TermIndex (term/definition)
  const hasTerm = data.term || data.name;
  if (!hasTerm) errors.push('术语缺少 term/name 字段');

  if (!data.slug) errors.push('术语缺少 slug 字段');

  if (!data.category) {
    errors.push('术语缺少 category 字段');
  } else if (!isValidCategory(data.category)) {
    errors.push(`术语 category 无效: ${data.category}`);
  }

  // 支持 definition 或 summary 字段
  const hasDefinition = data.definition || data.summary;
  if (!hasDefinition) errors.push('术语缺少 definition/summary 字段');

  return errors;
}

/**
 * 验证工具数据
 * @param data - 待验证的工具数据
 * @returns 错误消息数组，空数组表示验证通过
 */
export function validateTool(data: any): string[] {
  const errors: string[] = [];

  if (!data.name) errors.push('工具缺少 name 字段');
  if (!data.category) {
    errors.push('工具缺少 category 字段');
  } else if (!isValidCategory(data.category)) {
    errors.push(`工具 category 无效: ${data.category}`);
  }
  if (!data.purpose) errors.push('工具缺少 purpose 字段');
  if (!data.description) errors.push('工具缺少 description 字段');
  if (!data.install) errors.push('工具缺少 install 字段');

  return errors;
}

/**
 * 验证踩坑数据
 * @param data - 待验证的踩坑数据
 * @returns 错误消息数组，空数组表示验证通过
 */
export function validatePitfall(data: any): string[] {
  const errors: string[] = [];

  if (!data.title) errors.push('踩坑缺少 title 字段');
  if (!data.category) {
    errors.push('踩坑缺少 category 字段');
  } else if (!isValidCategory(data.category)) {
    errors.push(`踩坑 category 无效: ${data.category}`);
  }
  if (!data.description) errors.push('踩坑缺少 description 字段');
  if (!data.root_cause) errors.push('踩坑缺少 root_cause 字段');
  if (!data.symptoms?.length) errors.push('踩坑缺少 symptoms 字段');
  if (!data.solution?.length) errors.push('踩坑缺少 solution 字段');
  if (!data.quickFix) errors.push('踩坑缺少 quickFix 字段');

  return errors;
}

/**
 * 验证数据是否符合指定类型的规范
 * @param type - 内容类型 ('intel' | 'term' | 'tool' | 'pitfall')
 * @param data - 待验证的数据
 * @returns 错误消息数组，空数组表示验证通过
 */
export function validateContent(
  type: 'intel' | 'term' | 'tool' | 'pitfall',
  data: any
): string[] {
  switch (type) {
    case 'intel':
      return validateIntel(data);
    case 'term':
      return validateTerm(data);
    case 'tool':
      return validateTool(data);
    case 'pitfall':
      return validatePitfall(data);
    default:
      return [`未知的内容类型: ${type}`];
  }
}

/**
 * 批量验证数据
 * @param type - 内容类型
 * @param items - 待验证的数据数组
 * @returns 每项数据的验证结果数组
 */
export function validateBatch(
  type: 'intel' | 'term' | 'tool' | 'pitfall',
  items: any[]
): { index: number; errors: string[] }[] {
  const results: { index: number; errors: string[] }[] = [];

  items.forEach((item, index) => {
    const errors = validateContent(type, item);
    if (errors.length > 0) {
      results.push({ index, errors });
    }
  });

  return results;
}
