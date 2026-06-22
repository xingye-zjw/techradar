# 指针（Pointer）

**指针**是存储内存地址的变量，是 C/C++ 等语言的核心概念。通过指针可以直接访问和修改内存中的数据。

## 基本概念

```
变量与指针：

  int x = 42;
  int *p = &x;  // p 存储 x 的地址

  内存布局：
  ┌────────────┬────────────┐
  │ 地址 0x100 │ 地址 0x104 │
  ├────────────┼────────────┤
  │     42     │   0x100    │
  │    (x)     │    (p)     │
  └────────────┴────────────┘

  *p → 访问地址 0x100 处的值 → 42
  &x → 获取 x 的地址 → 0x100
```

## C 语言示例

```c
#include <stdio.h>

// 1. 基本指针操作
void basic_pointer() {
    int x = 10;
    int *p = &x;
    
    printf("x 的值: %d\n", x);      // 10
    printf("x 的地址: %p\n", &x);   // 0x7fff...
    printf("p 的值: %p\n", p);      // 0x7fff...（同 &x）
    printf("*p 的值: %d\n", *p);    // 10（解引用）
    
    *p = 20;  // 通过指针修改 x
    printf("修改后 x: %d\n", x);    // 20
}

// 2. 指针与数组
void pointer_array() {
    int arr[] = {10, 20, 30, 40, 50};
    int *p = arr;  // 数组名是首元素地址
    
    // 指针运算
    printf("arr[2] = %d\n", *(p + 2));  // 30
    printf("arr[3] = %d\n", p[3]);       // 40
    
    // 遍历数组
    for (int i = 0; i < 5; i++) {
        printf("%d ", *(p + i));
    }
}

// 3. 指针与函数
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

// 4. 动态内存分配
void dynamic_memory() {
    int *arr = (int*)malloc(5 * sizeof(int));
    if (arr == NULL) {
        fprintf(stderr, "内存分配失败\n");
        return;
    }
    
    for (int i = 0; i < 5; i++) {
        arr[i] = i * 10;
    }
    
    free(arr);  // 必须释放
    arr = NULL; // 避免野指针
}
```

## 常见问题与安全

```c
// ❌ 空指针解引用
int *p = NULL;
*p = 10;  // 崩溃！

// ❌ 野指针（未初始化）
int *p;
*p = 10;  // 未定义行为

// ❌ 内存泄漏
int *p = malloc(100);
p = NULL;  // 忘记 free，内存泄漏

// ✅ 安全实践
int *p = malloc(100);
if (p != NULL) {
    // 使用内存...
    free(p);
    p = NULL;
}
```

## 指针与嵌入式开发

```c
// 内存映射 IO（Memory-Mapped I/O）
#define GPIOA_BASE  0x40020000
#define GPIOA_MODER (*(volatile uint32_t *)(GPIOA_BASE + 0x00))
#define GPIOA_ODR   (*(volatile uint32_t *)(GPIOA_BASE + 0x14))

// 配置 GPIOA Pin 5 为输出
GPIOA_MODER |= (1 << 10);   // 设置 MODER5 = 01
GPIOA_ODR |= (1 << 5);      // 输出高电平
```

## C++ 智能指针（现代替代方案）

```cpp
#include <memory>

// unique_ptr：独占所有权
std::unique_ptr<int> p1 = std::make_unique<int>(42);

// shared_ptr：共享所有权
std::shared_ptr<int> p2 = std::make_shared<int>(42);
std::shared_ptr<int> p3 = p2;  // 引用计数 +1

// weak_ptr：打破循环引用
std::weak_ptr<int> wp = p2;
```

## 应用场景

- **嵌入式开发**：硬件寄存器操作、DMA 缓冲区管理
- **系统编程**：操作系统内核、驱动程序
- **性能优化**：避免大对象拷贝、原地修改数据
- **数据结构**：链表、树、图的节点连接

## 相关概念

[操作系统](/glossary/operating-system)、[嵌入式系统](/glossary/embedded)、[内存管理](/glossary/memory-management)、[C语言](/glossary/c-programming)
