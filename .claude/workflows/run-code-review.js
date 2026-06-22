export const meta = {
  name: 'techradar-code-review',
  description: '多维度代码审查：质量、性能、安全、架构',
  phases: [
    { title: '代码质量审查', detail: '检查 TypeScript 类型、代码风格、最佳实践' },
    { title: '性能审查', detail: '检查渲染性能、内存使用、构建优化' },
    { title: '安全审查', detail: '检查敏感信息、XSS 漏洞、依赖安全' },
    { title: '架构审查', detail: '检查模块化设计、代码复用、可维护性' },
  ],
}

// 代码质量审查 agent
async function codeQualityReview() {
  const prompt = `你是代码质量审查专家。请审查以下 TypeScript/React 项目代码：

审查要点：
1. TypeScript 类型安全性（any 使用、类型断言、缺失类型）
2. 代码风格一致性（命名规范、缩进、注释）
3. React 最佳实践（hooks 使用、状态管理、组件设计）
4. 错误处理（try-catch、边界处理、用户反馈）
5. 代码重复和冗余

请检查以下文件并输出问题报告：
- app/ 目录下的所有 .tsx 文件
- components/ 目录下的所有 .tsx 文件
- lib/ 目录下的所有 .ts 文件

输出格式：
### 高优先级问题
- 问题描述 | 文件:行号 | 修复建议

### 中优先级问题
- 问题描述 | 文件:行号 | 修复建议

### 低优先级问题
- 问题描述 | 文件:行号 | 修复建议

### 最佳实践建议
- 建议内容 | 示例代码`

  return await agent(prompt, { label: 'quality-review' })
}

// 性能审查 agent
async function performanceReview() {
  const prompt = `你是前端性能优化专家。请审查以下 Next.js/React 项目的性能问题：

审查要点：
1. 组件渲染优化（不必要的重渲染、memo 使用）
2. 数据获取和缓存策略
3. 图片和资源优化
4. 代码分割和懒加载
5. 内存泄漏风险
6. 构建产物大小

请检查以下文件：
- app/ 目录下的页面组件
- components/ 目录下的 UI 组件
- lib/ 目录下的业务逻辑

输出格式：
### 性能瓶颈
- 问题描述 | 影响程度 | 优化方案 | 文件:行号

### 优化建议
- 建议内容 | 预期收益 | 实施难度

### 最佳实践
- 性能优化模式 | 适用场景 | 代码示例`

  return await agent(prompt, { label: 'performance-review' })
}

// 安全审查 agent
async function securityReview() {
  const prompt = `你是前端安全专家。请审查以下项目的安风险：

审查要点：
1. 敏感信息暴露（API keys、密码、token）
2. XSS 漏洞风险（用户输入处理、dangerouslySetInnerHTML）
3. 依赖安全（已知漏洞、过时依赖）
4. 配置安全（环境变量、CORS、CSP）
5. 数据隐私（用户数据处理、存储）

请检查以下文件：
- 所有 .tsx/.ts 文件
- next.config.js
- package.json
- .env 文件（如果存在）

输出格式：
### 高危漏洞
- 漏洞描述 | 风险等级 | 文件:行号 | 修复方案

### 中危风险
- 风险描述 | 潜在影响 | 缓解措施

### 低危问题
- 问题描述 | 改进建议

### 安全最佳实践
- 安全模式 | 实施方法 | 参考资料`

  return await agent(prompt, { label: 'security-review' })
}

// 架构审查 agent
async function architectureReview() {
  const prompt = `你是软件架构师。请审查以下 Next.js 项目的架构设计：

审查要点：
1. 项目结构和模块划分
2. 代码复用性和抽象层次
3. 依赖关系和耦合度
4. 可测试性
5. 可扩展性
6. 文档完整性

请检查整个项目结构：
- 项目目录组织
- 组件层次结构
- 数据流设计
- 状态管理策略

输出格式：
### 架构优点
- 优点描述 | 具体体现

### 架构问题
- 问题描述 | 影响范围 | 改进方案

### 设计模式建议
- 模式名称 | 适用场景 | 实施建议

### 重构建议
- 重构内容 | 优先级 | 预期收益 | 工作量估算`

  return await agent(prompt, { label: 'architecture-review' })
}

// 主审查流程
async function main() {
  log('🔍 开始代码审查...')

  // 并行执行所有审查
  const [qualityResult, performanceResult, securityResult, architectureResult] = await parallel([
    codeQualityReview,
    performanceReview,
    securityReview,
    architectureReview,
  ])

  // 汇总审查结果
  const summary = `
# TechRadar 项目代码审查报告

## 审查概览
- 审查时间：${new Date().toISOString()}
- 审查范围：全项目代码
- 审查维度：4个（质量、性能、安全、架构）

---

## 1. 代码质量审查
${qualityResult}

---

## 2. 性能审查
${performanceResult}

---

## 3. 安全审查
${securityResult}

---

## 4. 架构审查
${architectureResult}

---

## 总结与建议
### 必须修复（高优先级）
1. ...

### 建议优化（中优先级）
1. ...

### 可选改进（低优先级）
1. ...
`

  log('✅ 代码审查完成！')
  return summary
}

// 执行主流程
const result = await main()
console.log(result)
