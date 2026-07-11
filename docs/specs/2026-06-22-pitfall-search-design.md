# 踩坑避雷搜索功能设计文档

**日期**：2026-06-22
**版本**：1.0
**状态**：待批准

---

## 1. 目标

为踩坑避雷模块添加搜索功能，让用户能够快速找到相关的踩坑记录。

### 1.1 范围

- 为踩坑页面添加搜索框
- 支持按标题、症状、标签进行模糊搜索
- 搜索结果实时显示
- 保持与现有情报搜索功能一致的交互风格

### 1.2 不在范围内

- 高级搜索（如按分类、时间范围筛选）
- 搜索历史记录
- 搜索建议/自动补全

---

## 2. 功能设计

### 2.1 搜索入口

**位置**：踩坑页面顶部，筛选器下方

**UI 组件**：
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 搜索踩坑...                                              │
└─────────────────────────────────────────────────────────────┘
```

**交互行为**：
- 输入框支持 placeholder 提示
- 支持清除按钮（输入内容后显示）
- 支持 Enter 键触发搜索
- 支持防抖（300ms）避免频繁搜索

---

### 2.2 搜索逻辑

**搜索字段**：
| 字段 | 权重 | 说明 |
|------|------|------|
| `title` | 高 | 问题标题，完全匹配优先 |
| `symptoms` | 中 | 错误症状，支持部分匹配 |
| `tags` | 低 | 标签，支持部分匹配 |
| `quickFix` | 低 | 快速修复，支持部分匹配 |

**搜索算法**：
1. 使用 `fuse.js` 进行模糊搜索（与情报搜索一致）
2. 搜索权重：`title` (0.4) > `symptoms` (0.3) > `tags` (0.2) > `quickFix` (0.1)
3. 阈值设置：`threshold: 0.3`（允许一定模糊度）

**搜索结果排序**：
1. 完全匹配 `title` 的排在最前
2. 匹配 `symptoms` 的次之
3. 匹配 `tags` 的最后
4. 同类结果按相关度分数排序

---

### 2.3 搜索结果展示

**空结果状态**：
```
┌─────────────────────────────────────────────────────────────┐
│ 😅 没有找到相关的踩坑记录                                     │
│                                                             │
│ 试试其他关键词，或者浏览全部踩坑                               │
└─────────────────────────────────────────────────────────────┘
```

**有结果状态**：
- 显示匹配的踩坑卡片
- 高亮匹配的关键词
- 显示匹配的字段（如：标题匹配、症状匹配）

---

### 2.4 筛选器交互

**现有筛选器**：
- 分类筛选（下拉菜单）
- 标签筛选（标签云）

**与搜索的交互**：
1. 搜索和筛选可以同时生效
2. 先筛选分类/标签，再在结果中搜索
3. 搜索结果数量显示在筛选器旁

---

## 3. 技术实现

### 3.1 数据结构

**踩坑数据**（已包含在任务 1 的格式统一中）：
```typescript
interface Pitfall {
  title: string;
  slug?: string;
  category: ContentCategory;
  description: string;
  root_cause: string;
  symptoms: string[];
  solution: string[];
  quickFix: string;
  tags: string[];
  prevention?: string[];
  relatedIntel?: string[];
  relatedNodes?: string[];
  relatedTerms?: string[];
  relatedTools?: string[];
}
```

**搜索索引数据**：
```typescript
interface PitfallSearchIndex {
  title: string;
  symptoms: string;
  tags: string;
  quickFix: string;
}
```

---

### 3.2 搜索组件

**组件路径**：`components/pitfall/PitfallSearch.tsx`

```typescript
interface PitfallSearchProps {
  onSearch: (query: string) => void;
  resultCount: number;
  totalCount: number;
}
```

**组件结构**：
```tsx
<div className="pitfall-search">
  <div className="search-input-wrapper">
    <SearchIcon />
    <input
      type="text"
      placeholder="搜索踩坑..."
      value={query}
      onChange={handleSearch}
    />
    {query && <ClearButton onClick={handleClear} />}
  </div>
  <div className="search-result-count">
    找到 {resultCount} / {totalCount} 条记录
  </div>
</div>
```

---

### 3.3 搜索逻辑实现

**搜索函数**：
```typescript
import Fuse from 'fuse.js';

const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'symptoms', weight: 0.3 },
    { name: 'tags', weight: 0.2 },
    { name: 'quickFix', weight: 0.1 },
  ],
  threshold: 0.3,
  includeMatches: true,
  ignoreLocation: true,
};

export function searchPitfalls(
  pitfalls: Pitfall[],
  query: string
): SearchResult<Pitfall>[] {
  if (!query.trim()) {
    return pitfalls.map(item => ({ item, score: 0 }));
  }
  
  const fuse = new Fuse(pitfalls, fuseOptions);
  return fuse.search(query);
}
```

---

### 3.4 页面集成

**页面路径**：`app/pitfall/page.tsx`

**集成方式**：
1. 在页面顶部添加搜索组件
2. 搜索结果实时更新
3. 与分类筛选器联动

**状态管理**：
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [filteredPitfalls, setFilteredPitfalls] = useState<Pitfall[]>([]);
const [categoryFilter, setCategoryFilter] = useState<string>('all');
const [selectedTags, setSelectedTags] = useState<string[]>([]);

// 搜索和筛选逻辑
useEffect(() => {
  let results = allPitfalls;
  
  // 分类筛选
  if (categoryFilter !== 'all') {
    results = results.filter(p => p.category === categoryFilter);
  }
  
  // 标签筛选
  if (selectedTags.length > 0) {
    results = results.filter(p =>
      selectedTags.some(tag => p.tags.includes(tag))
    );
  }
  
  // 搜索
  if (searchQuery) {
    const searchResults = searchPitfalls(results, searchQuery);
    results = searchResults.map(r => r.item);
  }
  
  setFilteredPitfalls(results);
}, [searchQuery, categoryFilter, selectedTags, allPitfalls]);
```

---

## 4. 样式设计

### 4.1 搜索框样式

```css
.pitfall-search {
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 0.5rem;
  color: #e8e8e8;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.search-input-wrapper input:focus {
  outline: none;
  border-color: #00ff88;
}

.search-input-wrapper .search-icon {
  position: absolute;
  left: 0.75rem;
  color: #888888;
}

.search-input-wrapper .clear-button {
  position: absolute;
  right: 0.75rem;
  color: #888888;
  cursor: pointer;
}

.search-input-wrapper .clear-button:hover {
  color: #e8e8e8;
}

.search-result-count {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #888888;
}
```

---

### 4.2 搜索结果高亮

```css
.search-highlight {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
  padding: 0 0.25rem;
  border-radius: 0.25rem;
}
```

---

## 5. 测试策略

### 5.1 单元测试

```typescript
// __tests__/components/pitfall/PitfallSearch.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import PitfallSearch from '../../../components/pitfall/PitfallSearch';

describe('PitfallSearch', () => {
  it('应渲染搜索框', () => {
    render(<PitfallSearch onSearch={() => {}} resultCount={0} totalCount={10} />);
    expect(screen.getByPlaceholderText('搜索踩坑...')).toBeInTheDocument();
  });

  it('应显示搜索结果数量', () => {
    render(<PitfallSearch onSearch={() => {}} resultCount={5} totalCount={10} />);
    expect(screen.getByText('找到 5 / 10 条记录')).toBeInTheDocument();
  });

  it('应触发搜索回调', () => {
    const onSearch = jest.fn();
    render(<PitfallSearch onSearch={onSearch} resultCount={0} totalCount={10} />);
    
    fireEvent.change(screen.getByPlaceholderText('搜索踩坑...'), {
      target: { value: 'CUDA' },
    });
    
    expect(onSearch).toHaveBeenCalledWith('CUDA');
  });

  it('应清除搜索内容', () => {
    const onSearch = jest.fn();
    render(<PitfallSearch onSearch={onSearch} resultCount={0} totalCount={10} />);
    
    const input = screen.getByPlaceholderText('搜索踩坑...');
    fireEvent.change(input, { target: { value: 'CUDA' } });
    fireEvent.click(screen.getByRole('button', { name: /清除/i }));
    
    expect(onSearch).toHaveBeenCalledWith('');
  });
});
```

### 5.2 搜索逻辑测试

```typescript
// __tests__/lib/pitfall-search.test.ts

import { searchPitfalls } from '../../lib/pitfall-search';
import { Pitfall } from '../../lib/content-types';

const mockPitfalls: Pitfall[] = [
  {
    title: 'CUDA 版本不兼容',
    category: 'devops',
    description: '测试描述',
    root_cause: '测试原因',
    symptoms: ['torch.cuda.is_available() 返回 False'],
    solution: ['安装匹配的 PyTorch'],
    quickFix: '安装与 CUDA 版本匹配的 PyTorch',
    tags: ['CUDA', 'PyTorch', 'GPU'],
  },
  {
    title: 'GPU 显存不足',
    category: 'deep-learning',
    description: '测试描述',
    root_cause: '测试原因',
    symptoms: ['RuntimeError: CUDA out of memory'],
    solution: ['减少 batch size'],
    quickFix: '减小 batch size 或使用混合精度训练',
    tags: ['GPU', '显存', 'PyTorch'],
  },
];

describe('searchPitfalls', () => {
  it('应返回所有结果当查询为空', () => {
    const results = searchPitfalls(mockPitfalls, '');
    expect(results).toHaveLength(2);
  });

  it('应按标题搜索', () => {
    const results = searchPitfalls(mockPitfalls, 'CUDA');
    expect(results).toHaveLength(2);
    expect(results[0].item.title).toBe('CUDA 版本不兼容');
  });

  it('应按症状搜索', () => {
    const results = searchPitfalls(mockPitfalls, 'out of memory');
    expect(results).toHaveLength(1);
    expect(results[0].item.title).toBe('GPU 显存不足');
  });

  it('应按标签搜索', () => {
    const results = searchPitfalls(mockPitfalls, 'PyTorch');
    expect(results).toHaveLength(2);
  });
});
```

---

## 6. 实施步骤

### 阶段 1：搜索组件开发（1天）

1. 创建 `components/pitfall/PitfallSearch.tsx`
2. 实现搜索框 UI
3. 实现搜索回调逻辑
4. 编写单元测试

### 阶段 2：搜索逻辑实现（1天）

1. 创建 `lib/pitfall-search.ts`
2. 实现 `searchPitfalls` 函数
3. 配置 fuse.js 选项
4. 编写搜索逻辑测试

### 阶段 3：页面集成（1天）

1. 更新 `app/pitfall/page.tsx`
2. 添加搜索状态管理
3. 实现搜索与筛选联动
4. 测试页面功能

### 阶段 4：样式优化（0.5天）

1. 实现搜索框样式
2. 实现搜索结果高亮
3. 响应式适配
4. 视觉测试

---

## 7. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 搜索性能问题 | 中 | 使用 fuse.js + 防抖优化 |
| 搜索结果不准确 | 中 | 调整权重和阈值 |
| 移动端交互问题 | 低 | 响应式设计 + 触摸优化 |

---

## 8. 成功标准

- [ ] 搜索框正常显示和工作
- [ ] 搜索结果实时更新
- [ ] 支持按标题、症状、标签搜索
- [ ] 搜索与筛选器联动正常
- [ ] 移动端体验良好
- [ ] 所有测试通过
