# 数据结构（Data Structure）

**数据结构**是计算机中存储、组织数据的方式，使得数据可以高效地被访问和修改。选择合适的数据结构是算法设计的关键。

## 常用数据结构对比

| 数据结构 | 查找 | 插入 | 删除 | 特点 |
|----------|------|------|------|------|
| 数组 | O(n) | O(n) | O(n) | 连续内存，随机访问快 |
| 链表 | O(n) | O(1) | O(1) | 离散内存，动态大小 |
| 栈 | O(n) | O(1) | O(1) | LIFO 后进先出 |
| 队列 | O(n) | O(1) | O(1) | FIFO 先进先出 |
| 哈希表 | O(1)平均 | O(1) | O(1) | 快速查找，无序 |
| 二叉搜索树 | O(log n) | O(log n) | O(log n) | 有序，支持范围查询 |
| 红黑树 | O(log n) | O(log n) | O(log n) | 自平衡，稳定性能 |

## 核心数据结构实现

### 1. 数组 vs 链表

```python
# 数组：连续存储，随机访问 O(1)
arr = [1, 2, 3, 4, 5]
arr[3]  # O(1) 直接访问
arr.insert(0, 0)  # O(n) 需要移动所有元素

# 链表：离散存储，顺序访问 O(n)
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# 头部插入 O(1)
new_node = ListNode(0)
new_node.next = head
head = new_node
```

### 2. 哈希表

```python
# 哈希表：平均 O(1) 查找和插入
hash_map = {}
hash_map["key"] = "value"  # O(1)
value = hash_map["key"]    # O(1)

# 处理冲突：链地址法
class HashTable:
    def __init__(self, size=100):
        self.size = size
        self.table = [[] for _ in range(size)]
    
    def _hash(self, key):
        return hash(key) % self.size
    
    def put(self, key, value):
        idx = self._hash(key)
        for k, v in self.table[idx]:
            if k == key:
                v = value
                return
        self.table[idx].append((key, value))
    
    def get(self, key):
        idx = self._hash(key)
        for k, v in self.table[idx]:
            if k == key:
                return v
        raise KeyError(key)
```

### 3. 树结构

```python
# 二叉搜索树
class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if not root:
        return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root

def search(root, val):
    if not root or root.val == val:
        return root
    if val < root.val:
        return search(root.left, val)
    return search(root.right, val)
```

## 应用场景

- **数据库索引**：B+ 树实现高效范围查询
- **缓存系统**：LRU 缓存（哈希表 + 双向链表）
- **图算法**：邻接表/邻接矩阵表示图结构
- **优先队列**：堆实现任务调度、Top-K 问题

## 选择数据结构的原则

1. **读多写少**：数组、哈希表
2. **频繁插入删除**：链表
3. **需要有序**：平衡二叉树、跳表
4. **内存受限**：紧凑数组、位图

## 相关概念

[算法](/glossary/algorithm)、[复杂度分析](/glossary/complexity)、[哈希表](/glossary/hash-table)
