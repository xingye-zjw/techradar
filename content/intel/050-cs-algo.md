---
title: 算法与数据结构
category: cs
keywords:
  - algorithm
  - data-structure
  - complexity
  - big-o
  - sorting
  - graph
  - dynamic-programming
difficulty: beginner
duration: 4周
summary: 计算机科学的核心基础，掌握常用算法设计思路、时间空间复杂度分析、以及各类数据结构的应用场景
takeaways:
  - 熟练分析代码复杂度，能给出准确的大O表示
  - 掌握常见算法设计范式：分治、动态规划、贪心、回溯
  - 能用数据结构解决实际问题，选择最优方案
  - 理解算法在AI系统中的应用：搜索、优化、图神经网络
relatedTerms:
  - algorithm
  - data-structure
relatedIntel:
  - 051-cs-os
  - 075-cs-network
  - 076-cs-database
relatedNodes:
  - cs-algo
---

## 为什么你要学它

算法与数据结构是计算机科学的基石，也是所有技术面试的必考内容。在AI领域，算法思维无处不在：

- **模型训练优化**：反向传播是动态规划，梯度下降是贪心策略
- **推理加速**：Beam Search是分支限界，Speculative Decoding是贪心预测
- **图神经网络**：图遍历、最短路径、社区发现都是经典图算法
- **推荐系统**：协同过滤基于矩阵分解，搜索排序基于树结构

如果你只会调包而不理解底层算法，遇到性能瓶颈时就无从下手。

## 一句话概览（快速版）

- **复杂度是标尺**：用大O表示法衡量算法效率，O(1) < O(log n) < O(n) < O(n log n) < O(n²)
- **数据结构是容器**：数组查O(1)插O(n)，链表插O(1)查O(n)，哈希表查插都是O(1)
- **算法是策略**：分治（大问题拆小）、DP（子问题复用）、贪心（局部最优）、回溯（枚举剪枝）

## 核心拆解

### 🔑 复杂度分析

```python
# O(1) - 常数时间：数组随机访问
def get_first(arr):
    return arr[0]  # 无论数组多大，都只需一步

# O(log n) - 对数时间：二分查找
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# O(n) - 线性时间：遍历数组
def find_max(arr):
    max_val = arr[0]
    for x in arr:  # 遍历n个元素
        if x > max_val:
            max_val = x
    return max_val

# O(n log n) - 线性对数：快速排序、归并排序
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# O(n²) - 平方时间：嵌套循环
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):          # n次
        for j in range(n-1):    # 每次n次 → n²
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
```

### 🔑 核心数据结构

| 数据结构 | 访问 | 插入 | 删除 | 查找 | 典型应用 |
|---------|------|------|------|------|---------|
| 数组 | O(1) | O(n) | O(n) | O(n) | 缓存、矩阵 |
| 链表 | O(n) | O(1) | O(1) | O(n) | LRU缓存、内存池 |
| 栈 | O(n) | O(1) | O(1) | - | 函数调用、表达式求值 |
| 队列 | O(n) | O(1) | O(1) | - | BFS、任务调度 |
| 哈希表 | O(1) | O(1) | O(1) | O(1) | 字典、缓存、去重 |
| 二叉搜索树 | O(log n) | O(log n) | O(log n) | O(log n) | 索引、排序 |
| 堆 | O(n) | O(log n) | O(log n) | O(1) | Top-K、优先队列 |
| 图 | O(1) | O(1) | O(1) | O(V+E) | 社交网络、知识图谱 |

### 🔑 算法设计范式

**分治法（Divide and Conquer）**
```python
# 归并排序：分而治之，再合并
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)
```

**动态规划（Dynamic Programming）**
```python
# 最长公共子序列（LCS）：经典DP
# 状态：dp[i][j]表示s1[0:i]和s2[0:j]的LCS长度
# 转移：if s1[i-1]==s2[j-1]: dp[i][j]=dp[i-1][j-1]+1 else: dp[i][j]=max(dp[i-1][j], dp[i][j-1])
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]
```

**贪心算法（Greedy）**
```python
# 活动选择问题：每次选结束时间最早的
def activity_selection(activities):
    # activities: [(start, end), ...]
    activities.sort(key=lambda x: x[1])  # 按结束时间排序
    selected = [activities[0]]
    for i in range(1, len(activities)):
        if activities[i][0] >= selected[-1][1]:  # 不冲突
            selected.append(activities[i])
    return selected
```

**回溯法（Backtracking）**
```python
# 全排列：枚举所有可能，不满足条件时剪枝
def permute(nums):
    result = []
    def backtrack(path, used):
        if len(path) == len(nums):
            result.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            backtrack(path, used)
            path.pop()
            used[i] = False
    backtrack([], [False] * len(nums))
    return result
```

## 完整跑通方案

**第一步：刷题打基础（LeetCode）**

```bash
# 按类别刷题，每个类别10-15题
# 数组/字符串 → 链表 → 树 → 图 → 动态规划 → 回溯
# 推荐顺序：Easy → Medium → Hard
```

**第二步：手写核心数据结构**

```python
# 实现一个完整的哈希表（拉链法解决冲突）
class HashTable:
    def __init__(self, size=16):
        self.size = size
        self.table = [[] for _ in range(size)]
    
    def _hash(self, key):
        return hash(key) % self.size
    
    def put(self, key, value):
        idx = self._hash(key)
        for i, (k, v) in enumerate(self.table[idx]):
            if k == key:
                self.table[idx][i] = (key, value)
                return
        self.table[idx].append((key, value))
    
    def get(self, key):
        idx = self._hash(key)
        for k, v in self.table[idx]:
            if k == key:
                return v
        return None
```

**第三步：分析AI系统中的算法**

```python
# Transformer的Attention计算复杂度分析
# Self-Attention: Q·K^T · V
# Q, K, V 形状: (batch, seq_len, d_model)
# Q·K^T: O(seq_len² × d_model) — 这是Transformer的瓶颈
# 优化方向：Sparse Attention、Linear Attention、Flash Attention
```

## 常见误区

**误区 1：只背代码不分析复杂度 → 面试时换个问法就不会了**

解释：算法题的核心是思路，不是代码模板。每道题做完后，问自己：时间复杂度是多少？空间复杂度是多少？能不能优化？

**误区 2：忽视空间复杂度 → 在内存受限的嵌入式环境中程序崩溃**

解释：嵌入式系统内存有限，DP的O(n²)空间可能太大。要学会空间优化：滚动数组、原地修改、状态压缩。

**误区 3：递归不设终止条件 → 栈溢出**

解释：递归必须有明确的终止条件，且递归深度不能太大。对于深度可能很大的情况（如树遍历），改用迭代实现。

**误区 4：哈希表不考虑冲突 → 性能退化到O(n)**

解释：哈希表在冲突严重时性能会退化。要选择好的哈希函数，并考虑扩容（load factor > 0.75时扩容）。

**误区 5：图算法不标记访问状态 → 无限循环**

解释：DFS/BFS必须标记已访问节点，否则在环图中会无限循环。可以用visited集合或染色法（0=未访问, 1=访问中, 2=已访问）。
