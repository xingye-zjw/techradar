# 复杂度分析（Complexity Analysis）

**复杂度分析**是评价算法效率的理论方法，通过分析算法执行时间和内存消耗随输入规模增长的趋势，帮助我们选择最优算法。

## 大O表示法

大O表示法（Big O Notation）描述算法复杂度的上界：

```
时间复杂度（从优到劣）：
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)

空间复杂度：
O(1) - 常数空间
O(n) - 线性空间
O(n²) - 二次空间
```

## 常见复杂度对比

| 复杂度 | 名称 | n=1000 时操作数 | 典型算法 |
|--------|------|----------------|----------|
| O(1) | 常数级 | 1 | 哈希表查找 |
| O(log n) | 对数级 | 10 | 二分查找 |
| O(n) | 线性级 | 1,000 | 遍历数组 |
| O(n log n) | 线性对数级 | 10,000 | 归并排序 |
| O(n²) | 平方级 | 1,000,000 | 冒泡排序 |
| O(2ⁿ) | 指数级 | ∞ | 子集枚举 |

## 实际分析示例

### 示例 1：查找重复元素

```python
# 方法1：双重循环 - O(n²)
def find_duplicate_slow(arr):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] == arr[j]:
                return arr[i]
    return None

# 方法2：哈希表 - O(n)
def find_duplicate_fast(arr):
    seen = set()
    for x in arr:
        if x in seen:
            return x
        seen.add(x)
    return None
```

### 示例 2：斐波那契数列

```python
# 方法1：递归 - O(2ⁿ) 时间，O(n) 空间
def fib_recursive(n):
    if n <= 1:
        return n
    return fib_recursive(n-1) + fib_recursive(n-2)

# 方法2：动态规划 - O(n) 时间，O(1) 空间
def fib_dp(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

## 应用场景

- **算法选择**：面对多个解决方案时，选择复杂度更优的算法
- **性能瓶颈定位**：分析代码中哪部分是热点（Hot Path）
- **系统容量评估**：预测系统在大规模数据下的性能表现
- **面试和竞赛**：快速评估算法方案的可行性

## 复杂度分析技巧

```python
# 1. 循环嵌套通常相乘
for i in range(n):        # O(n)
    for j in range(n):    # O(n)
        pass              # 总体: O(n²)

# 2. 顺序执行取最大值
def example(arr):
    step1(arr)  # O(n)
    step2(arr)  # O(n²)
    # 总体: O(n²)

# 3. 递归用主定理（Master Theorem）
def divide_conquer(arr):
    if len(arr) <= 1:
        return
    mid = len(arr) // 2
    left = divide_conquer(arr[:mid])   # T(n/2)
    right = divide_conquer(arr[mid:])  # T(n/2)
    merge(left, right)                 # O(n)
# 递推公式: T(n) = 2T(n/2) + O(n)
# 根据主定理: O(n log n)
```

## 相关概念

[算法](/glossary/algorithm)、[数据结构](/glossary/data-structure)、[动态规划](/glossary/dynamic-programming)
