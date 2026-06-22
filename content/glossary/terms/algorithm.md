# 算法（Algorithm）

**算法**是解决特定问题的一系列明确步骤和规则。在计算机科学中，算法描述了如何将输入转换为输出的计算过程。

## 核心特性

一个优秀的算法必须满足以下五个特性：

| 特性 | 说明 |
|------|------|
| **有穷性** | 算法必须在有限步骤后终止 |
| **确定性** | 每一步骤都有明确的定义，无歧义 |
| **可行性** | 每一步都可以通过基本操作有限次完成 |
| **输入** | 有零个或多个输入 |
| **输出** | 有一个或多个输出 |

## 常用算法设计范式

### 1. 分治法（Divide and Conquer）
将问题分解为若干规模较小的子问题，递归求解后合并结果。典型代表：归并排序、快速排序。

```python
# 归并排序 - 分治法示例
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])  # 分
    right = merge_sort(arr[mid:])
    return merge(left, right)      # 治
```

### 2. 动态规划（Dynamic Programming）
将问题分解为重叠子问题，存储子问题的解避免重复计算。典型代表：背包问题、最短路径。

### 3. 贪心算法（Greedy）
每一步都选择当前最优解，不考虑全局最优。典型代表：Dijkstra 最短路径、Huffman 编码。

### 4. 回溯法（Backtracking）
系统地搜索问题的解空间，当发现当前选择不可行时回退。典型代表：N 皇后问题、数独求解。

## 复杂度分析

算法效率通过时间复杂度和空间复杂度来衡量：

```
常见时间复杂度（从优到劣）：
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)
```

## 应用场景

- **搜索引擎**：PageRank 算法排序网页结果
- **推荐系统**：协同过滤算法预测用户偏好
- **路径规划**：A* 算法在地图导航中寻找最短路径
- **数据压缩**：LZ77/LZ78 算法用于文件压缩

## 实际案例：二分查找

```python
def binary_search(arr, target):
    """O(log n) 时间复杂度的查找算法"""
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
```

## 相关概念

[复杂度分析](/glossary/complexity)、[数据结构](/glossary/data-structure)、[排序算法](/glossary/sorting)
