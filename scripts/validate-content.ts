/**
 * 构建时内容验证脚本
 *
 * 检查所有内容数据是否符合规范：
 * - 情报（Intel）
 * - 术语（Glossary）
 * - 工具（Toolbox）
 * - 踩坑（Pitfall）
 * - 实战项目（Practice）
 *
 * 使用方式：npm run validate-content
 */

import { getAllIntelCards } from '../lib/intel';
import { getAllTerms } from '../lib/glossary';
import { getToolboxData } from '../lib/toolbox';
import { getAllPitfalls } from '../lib/pitfall';
import { getAllProjects } from '../lib/practice';
import { validateIntel, validateTerm, validateTool, validatePitfall, validateProject } from '../lib/content-validator';

async function validateAll() {
  console.log('🔍 开始验证所有内容...\n');

  let totalErrors = 0;
  let totalItems = 0;

  // 验证情报
  console.log('📰 情报验证:');
  try {
    const intel = getAllIntelCards();
    console.log(`   数量: ${intel.length}`);
    totalItems += intel.length;

    intel.forEach(item => {
      const errors = validateIntel(item);
      if (errors.length > 0) {
        console.error(`   ❌ ${item.slug}:`, errors);
        totalErrors += errors.length;
      }
    });

    if (intel.every(item => validateIntel(item).length === 0)) {
      console.log('   ✅ 所有情报验证通过\n');
    }
  } catch (error) {
    console.error('   ❌ 情报加载失败:', error);
    totalErrors++;
  }

  // 验证术语
  console.log('📚 术语验证:');
  try {
    const terms = getAllTerms();
    console.log(`   数量: ${terms.length}`);
    totalItems += terms.length;

    terms.forEach(item => {
      const errors = validateTerm(item);
      if (errors.length > 0) {
        console.error(`   ❌ ${item.slug}:`, errors);
        totalErrors += errors.length;
      }
    });

    if (terms.every(item => validateTerm(item).length === 0)) {
      console.log('   ✅ 所有术语验证通过\n');
    }
  } catch (error) {
    console.error('   ❌ 术语加载失败:', error);
    totalErrors++;
  }

  // 验证工具
  console.log('🛠️  工具验证:');
  try {
    const { tools } = getToolboxData();
    console.log(`   数量: ${tools.length}`);
    totalItems += tools.length;

    tools.forEach(item => {
      const errors = validateTool(item);
      if (errors.length > 0) {
        console.error(`   ❌ ${item.name}:`, errors);
        totalErrors += errors.length;
      }
    });

    if (tools.every(item => validateTool(item).length === 0)) {
      console.log('   ✅ 所有工具验证通过\n');
    }
  } catch (error) {
    console.error('   ❌ 工具加载失败:', error);
    totalErrors++;
  }

  // 验证踩坑
  console.log('⚠️  踩坑验证:');
  try {
    const pitfalls = getAllPitfalls();
    console.log(`   数量: ${pitfalls.length}`);
    totalItems += pitfalls.length;

    pitfalls.forEach(item => {
      const errors = validatePitfall(item);
      if (errors.length > 0) {
        console.error(`   ❌ ${item.title}:`, errors);
        totalErrors += errors.length;
      }
    });

    if (pitfalls.every(item => validatePitfall(item).length === 0)) {
      console.log('   ✅ 所有踩坑验证通过\n');
    }
  } catch (error) {
    console.error('   ❌ 踩坑加载失败:', error);
    totalErrors++;
  }

  // 验证实战项目
  console.log('🚀 实战项目验证:');
  try {
    const projects = getAllProjects();
    console.log(`   数量: ${projects.length}`);
    totalItems += projects.length;

    projects.forEach(item => {
      const errors = validateProject(item);
      if (errors.length > 0) {
        console.error(`   ❌ ${item.title}:`, errors);
        totalErrors += errors.length;
      }
    });

    if (projects.every(item => validateProject(item).length === 0)) {
      console.log('   ✅ 所有实战项目验证通过\n');
    }
  } catch (error) {
    console.error('   ❌ 实战项目加载失败:', error);
    totalErrors++;
  }

  // 总结
  console.log('📊 验证总结:');
  console.log(`   总项目数: ${totalItems}`);

  if (totalErrors === 0) {
    console.log('\n✅ 所有内容验证通过！');
    process.exit(0);
  } else {
    console.log(`\n❌ 发现 ${totalErrors} 个错误`);
    process.exit(1);
  }
}

validateAll().catch((error) => {
  console.error('验证脚本执行失败:', error);
  process.exit(1);
});
