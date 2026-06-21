# TechRadar 全站增强实施计划

> **日期**：2026-06-21
> **策略**：渐进增强（6 个阶段，每阶段独立可部署）
> **预计工时**：每阶段 2-4 小时

---

## 📋 实施总览

| 阶段 | 模块 | 优先级 | 预计工时 | 依赖 |
|------|------|--------|----------|------|
| 1 | 全局搜索增强 | P0 | 3h | 无 |
| 2 | 路由图节点增强 | P0 | 4h | 无 |
| 3 | 情报卡片增强 | P1 | 3h | 无 |
| 4 | 工具推荐增强 | P1 | 2h | 阶段3 |
| 5 | 每日任务增强 | P2 | 4h | 无 |
| 6 | 视觉体验增强 | P2 | 3h | 阶段1-5 |

---

## 🚀 阶段 1：全局搜索增强

### 目标
实现跨 4 个模块（路由节点、情报、工具、踩坑）的统一搜索，结果按相关性排序。

### 任务清单

#### 1.1 扩展搜索引擎数据源
- [ ] 修改 `lib/search.ts`，整合所有模块数据
- [ ] 添加路由节点数据（从 `roadmap-data.ts` 提取）
- [ ] 添加工具数据（从 `tools.json` 读取）
- [ ] 添加踩坑数据（从 `pitfalls.json` 读取）
- [ ] 统一数据格式：`{ id, title, content, type, url }`

#### 1.2 增强 fuse.js 配置
- [ ] 调整搜索权重：title(0.4) > content(0.3) > tags(0.3)
- [ ] 启用模糊匹配（threshold: 0.3）
- [ ] 支持中文分词（手动按字符分割）

#### 1.3 重构搜索结果页
- [ ] 修改 `app/search/page.tsx`
- [ ] 结果按模块分组展示（节点/情报/工具/踩坑）
- [ ] 每个结果显示来源标签（彩色徽章）
- [ ] 点击结果跳转到对应页面

#### 1.4 搜索体验优化
- [ ] 输入防抖（300ms）
- [ ] 关键词高亮（使用 `<mark>` 标签）
- [ ] 空结果提示优化

### 验收标准
- [ ] 搜索 "Linux" 能同时返回：路由节点、相关情报、工具、踩坑
- [ ] 结果按相关性排序，来源标签清晰可见
- [ ] 点击结果正确跳转

---

## 📊 阶段 2：路由图节点增强

### 目标
节点显示学习进度、关联情报和工具，详情面板展示关联内容。

### 任务清单

#### 2.1 定义数据关联
- [ ] 修改 `lib/roadmap-data.ts`，为节点添加关联字段
  ```typescript
  interface NodeData {
    // ...existing fields
    relatedIntel?: string[];  // 关联情报 slug 列表
    relatedTools?: string[];  // 关联工具 id 列表
  }
  ```
- [ ] 为现有 14 个节点填写关联数据

#### 2.2 学习进度存储
- [ ] 创建 `lib/progress.ts` 工具函数
  ```typescript
  // getProgress(nodeId: string): number (0-100)
  // setTaskComplete(nodeId: string, day: number): void
  // getCompletedDays(nodeId: string): number[]
  ```
- [ ] 使用 localStorage 存储，key 格式：`techradar_progress_{nodeId}`

#### 2.3 节点 UI 增强
- [ ] 修改 `components/radar/RoadmapGraph.tsx`
- [ ] 节点添加进度指示器（圆环或进度条）
- [ ] 节点添加关联内容数量徽章
- [ ] 已完成节点显示 ✓ 图标

#### 2.4 详情面板增强
- [ ] 修改 `components/radar/NodeDetailPanel.tsx`
- [ ] 添加 "关联情报" 区块（列表 + 跳转链接）
- [ ] 添加 "关联工具" 区块（列表 + 跳转链接）
- [ ] 添加进度百分比显示

### 验收标准
- [ ] 节点显示学习进度（0-100%）
- [ ] 节点显示关联情报/工具数量
- [ ] 详情面板可查看并跳转到关联内容

---

## 📰 阶段 3：情报卡片增强

### 目标
情报支持分类标签、标签筛选、阅读时间显示。

### 任务清单

#### 3.1 定义标签体系
- [ ] 创建 `lib/intel-tags.ts`
  ```typescript
  const TAG_CATEGORIES = {
    domain: ['CV', 'NLP', 'DevOps', 'Math', 'Project'],
    level: ['基础', '进阶', '高级'],
    type: ['原理', '实战', '工具', '论文']
  };
  ```

#### 3.2 更新情报数据
- [ ] 修改 `content/intel/*.md` 的 frontmatter
- [ ] 为 18 篇情报添加 tags 字段
- [ ] 计算每篇阅读时间（按 300 字/分钟）

#### 3.3 情报列表页增强
- [ ] 修改 `app/intel/page.tsx`
- [ ] 添加标签筛选栏（顶部固定）
- [ ] 支持多标签组合筛选（AND 逻辑）
- [ ] 筛选结果实时更新

#### 3.4 情报卡片 UI
- [ ] 修改 `components/radar/IntelCard.tsx`
- [ ] 显示分类标签（彩色徽章）
- [ ] 显示预计阅读时间
- [ ] 悬停显示内容摘要（tooltip）

### 验收标准
- [ ] 情报列表页可按标签筛选
- [ ] 卡片显示分类标签和阅读时间
- [ ] 多标签组合筛选正常工作

---

## 🔧 阶段 4：工具推荐增强

### 目标
工具详情页显示关联情报和节点，卡片显示关联数量。

### 任务清单

#### 4.1 更新工具数据
- [ ] 修改 `content/toolbox/tools.json`
- [ ] 为工具添加关联字段
  ```json
  {
    "id": "pytorch",
    "name": "PyTorch",
    "relatedIntel": ["cnn-classic", "pytorch-intro"],
    "relatedNodes": ["pytorch-core"]
  }
  ```

#### 4.2 工具详情页增强
- [ ] 创建 `app/toolbox/[id]/page.tsx`
- [ ] 显示关联情报列表（可跳转）
- [ ] 显示关联节点列表（可跳转到路线图）

#### 4.3 工具列表卡片优化
- [ ] 修改 `components/radar/ToolboxCard.tsx`
- [ ] 显示关联情报数量徽章
- [ ] 悬停显示关联情报标题

### 验收标准
- [ ] 工具详情页显示关联情报和节点
- [ ] 点击关联内容可正确跳转
- [ ] 工具卡片显示关联数量

---

## 📚 阶段 5：每日任务增强

### 目标
实操区块醒目、可标记完成、资源优化、专业术语 Tooltip。

### 任务清单

#### 5.1 实操区块优化
- [ ] 修改 `components/radar/NodeDetailPanel.tsx`
- [ ] 实操任务使用醒目的边框和背景（emerald 色系）
- [ ] 添加 "标记完成" 按钮（调用 progress.ts）
- [ ] 添加 "查看答案" 折叠面板

#### 5.2 资源链接优化
- [ ] 识别国内无法访问的链接（github.com 等）
- [ ] 添加国内镜像提示标签
- [ ] 资源按类型分组（文档/视频/书籍）

#### 5.3 专业术语 Tooltip
- [ ] 创建 `components/radar/TermTooltip.tsx`
  ```typescript
  interface TermTooltipProps {
    term: string;
    explanation: string;
    link?: string;
  }
  ```
- [ ] 虚线下划线标识术语
- [ ] 悬停显示解释（Tooltip）
- [ ] 移动端点击展开

#### 5.4 术语数据填充
- [ ] 创建 `lib/terms.json`
- [ ] 为常见术语添加解释（Shell、Docker、Git 等）
- [ ] 关联到对应的每日任务

### 验收标准
- [ ] 实操区块有醒目样式和完成按钮
- [ ] 资源链接有国内访问提示
- [ ] 专业术语悬停显示解释

---

## 🎨 阶段 6：视觉体验增强

### 目标
页面过渡动画、悬停反馈、加载状态优化。

### 任务清单

#### 6.1 页面过渡动画
- [ ] 创建 `components/PageTransition.tsx`
- [ ] 使用 framer-motion 或 CSS transition
- [ ] 淡入淡出效果（200ms）

#### 6.2 悬停效果增强
- [ ] 创建全局 CSS 变量
  ```css
  --hover-lift: translateY(-2px);
  --hover-shadow: 0 4px 12px rgba(0, 255, 136, 0.15);
  ```
- [ ] 卡片悬停：上浮 + 阴影增强
- [ ] 按钮悬停：颜色渐变过渡

#### 6.3 加载状态优化
- [ ] 创建骨架屏组件 `components/Skeleton.tsx`
- [ ] 为各列表页添加骨架屏
- [ ] 数据加载时显示进度指示器

#### 6.4 反馈动画
- [ ] 操作成功：绿色勾号动画（CSS）
- [ ] 操作失败：红色抖动效果（CSS）
- [ ] 使用 Toast 组件显示反馈

### 验收标准
- [ ] 页面切换有淡入淡出动画
- [ ] 卡片悬停有上浮和阴影效果
- [ ] 加载时显示骨架屏

---

## 🛠️ 技术实现要点

### 新增依赖（如需）
```bash
# 可选：动画库
npm install framer-motion

# 可选：Toast 组件
npm install sonner
```

### 文件结构变化
```
techradar/
├── lib/
│   ├── progress.ts          # 新增：学习进度管理
│   ├── intel-tags.ts        # 新增：标签体系定义
│   └── terms.json           # 新增：术语数据
├── components/radar/
│   ├── TermTooltip.tsx      # 新增：术语 Tooltip
│   ├── Skeleton.tsx         # 新增：骨架屏
│   └── PageTransition.tsx   # 新增：页面过渡
└── app/toolbox/
    └── [id]/page.tsx        # 新增：工具详情页
```

### localStorage 使用规范
- 学习进度：`techradar_progress_{nodeId}` → `{ completedDays: number[] }`
- 任务完成：`techradar_task_{nodeId}_{day}` → `true`

---

## 📝 开发规范

### 代码风格
- 保持现有 TypeScript + Tailwind CSS 风格
- 组件使用 shadcn/ui 基础组件
- 颜色使用 CSS 变量（accent/accent2）

### 测试策略
- 每阶段完成后手动测试
- 关键功能写单元测试（进度存储、搜索）

### 提交规范
```
feat(search): 实现跨模块统一搜索
feat(roadmap): 节点显示学习进度和关联内容
feat(intel): 情报卡片添加分类标签和筛选
...
```

---

## 🎯 里程碑检查点

### 阶段 1 完成后
- 全站搜索可用，结果分组展示

### 阶段 2 完成后
- 路由图节点显示进度，详情面板有关联内容

### 阶段 3 完成后
- 情报可按标签筛选，卡片显示标签

### 阶段 4 完成后
- 工具有详情页，显示关联情报

### 阶段 5 完成后
- 每日任务可标记完成，术语有 Tooltip

### 阶段 6 完成后
- 全站动画流畅，交互反馈完善

---

## 📞 问题反馈

实施过程中如遇问题，可参考：
- 设计文档：`docs/superpowers/specs/2026-06-21-techradar-enhancement-design.md`
- 项目记忆：`CLAUDE.md`
