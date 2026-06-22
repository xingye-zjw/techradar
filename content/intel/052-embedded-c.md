---
title: C语言与指针
category: embedded
keywords:
  - c-language
  - pointer
  - memory-management
  - embedded
  - gcc
  - makefile
  - bit-operation
difficulty: beginner
duration: 3周
summary: C语言是嵌入式开发的基石，指针是C语言的核心。深入理解指针、内存管理和底层操作，是开发嵌入式系统和性能优化代码的必备技能
takeaways:
  - 掌握C语言核心语法和指针操作
  - 深入理解内存管理和位操作
  - 能编写嵌入式级别的高效代码
  - 掌握Makefile和模块化编程
---

## 为什么你要学它

C语言是嵌入式开发的唯一选择。在AIoT（人工智能物联网）时代：

- **边缘AI**：TensorFlow Lite Micro、CMSIS-NN等框架都用C/C++编写
- **传感器驱动**：所有传感器库（DHT11、MPU6050、BMP280）都是C语言
- **实时系统**：FreeRTOS、RT-Thread等RTOS内核用C语言编写
- **硬件抽象**：HAL库、LL库、寄存器操作都是C语言

如果你只会Python，就无法真正理解硬件如何工作，也无法优化底层性能。

## 一句话概览（快速版）

- **指针是地址**：`int *p = &a`表示p存储a的地址，`*p`表示取地址中的值
- **数组名是指针常量**：`arr[i] == *(arr+i)`，但数组名不能修改
- **内存对齐影响结构体大小**：编译器按最大成员对齐，可能产生填充字节
- **位操作直接操控硬件**：`SET_BIT(GPIOA->ODR, 5)`设置PA5引脚为高电平

## 核心拆解

### 🔑 指针基础

```c
#include <stdio.h>

int main() {
    int a = 10;
    int *p = &a;  // p指向a的地址
    
    printf("a = %d\n", a);        // 10
    printf("&a = %p\n", &a);      // a的地址
    printf("p = %p\n", p);        // 同上
    printf("*p = %d\n", *p);      // 10，解引用
    
    *p = 20;  // 通过指针修改a的值
    printf("a = %d\n", a);        // 20
    
    // 指针的指针
    int **pp = &p;
    printf("**pp = %d\n", **pp);  // 20
    
    // 指针运算
    int arr[] = {10, 20, 30, 40, 50};
    int *ptr = arr;
    printf("*ptr = %d\n", *ptr);       // 10
    printf("*(ptr+1) = %d\n", *(ptr+1)); // 20
    printf("ptr[2] = %d\n", ptr[2]);    // 30
    
    return 0;
}
```

### 🔑 内存管理

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    // 动态内存分配
    int *arr = (int *)malloc(5 * sizeof(int));
    if (arr == NULL) {
        printf("Memory allocation failed!\n");
        return 1;
    }
    
    // 初始化
    for (int i = 0; i < 5; i++) {
        arr[i] = i * 10;
    }
    
    // 使用
    for (int i = 0; i < 5; i++) {
        printf("arr[%d] = %d\n", i, arr[i]);
    }
    
    // 释放内存
    free(arr);
    arr = NULL;  // 防止野指针
    
    // calloc：分配并清零
    int *arr2 = (int *)calloc(5, sizeof(int));
    // arr2[0]到arr2[4]都是0
    
    // realloc：调整大小
    arr2 = (int *)realloc(arr2, 10 * sizeof(int));
    
    free(arr2);
    arr2 = NULL;
    
    return 0;
}
```

### 🔑 位操作与寄存器

```c
#include <stdint.h>

// 位操作宏（嵌入式常用）
#define BIT(n) (1U << (n))
#define SET_BIT(reg, n) ((reg) |= BIT(n))
#define CLEAR_BIT(reg, n) ((reg) &= ~BIT(n))
#define READ_BIT(reg, n) (((reg) >> (n)) & 1U)
#define TOGGLE_BIT(reg, n) ((reg) ^= BIT(n))

// STM32 GPIO寄存器操作示例
// GPIOA->ODR |= (1 << 5);  // 设置PA5为高电平
// GPIOA->ODR &= ~(1 << 5); // 设置PA5为低电平

// 使用宏更清晰
void gpio_set_pin(volatile uint32_t *odr, uint8_t pin) {
    SET_BIT(*odr, pin);
}

void gpio_clear_pin(volatile uint32_t *odr, uint8_t pin) {
    CLEAR_BIT(*odr, pin);
}

// 提取特定位
uint8_t extract_bits(uint32_t value, uint8_t start, uint8_t length) {
    return (value >> start) & ((1U << length) - 1);
}

// 设置特定位
uint32_t set_bits(uint32_t value, uint8_t start, uint8_t length, uint8_t new_val) {
    uint32_t mask = ((1U << length) - 1) << start;
    return (value & ~mask) | ((new_val << start) & mask);
}
```

### 🔑 结构体与内存对齐

```c
#include <stdio.h>
#include <stdint.h>

// 默认对齐：按最大成员（double，8字节）对齐
struct SensorData {
    uint16_t id;      // 2字节
    float temperature; // 4字节
    double humidity;   // 8字节
    uint8_t status;    // 1字节
};

// 实际大小：2 + 2(填充) + 4 + 8 + 1 + 7(填充) = 24字节

// 紧凑对齐（嵌入式常用）
#pragma pack(1)
struct SensorDataPacked {
    uint16_t id;
    float temperature;
    double humidity;
    uint8_t status;
};
#pragma pack()

// 实际大小：2 + 4 + 8 + 1 = 15字节

// 或使用__attribute__((packed))
struct SensorDataAttr {
    uint16_t id;
    float temperature;
    double humidity;
    uint8_t status;
} __attribute__((packed));

int main() {
    printf("SensorData: %zu bytes\n", sizeof(struct SensorData));
    printf("SensorDataPacked: %zu bytes\n", sizeof(struct SensorDataPacked));
    printf("SensorDataAttr: %zu bytes\n", sizeof(struct SensorDataAttr));
    
    // 寄存器映射（嵌入式常用）
    typedef struct {
        volatile uint32_t MODER;    // 模式寄存器
        volatile uint32_t OTYPER;   // 输出类型寄存器
        volatile uint32_t OSPEEDR;  // 输出速度寄存器
        volatile uint32_t PUPDR;    // 上拉/下拉寄存器
        volatile uint32_t IDR;      // 输入数据寄存器
        volatile uint32_t ODR;      // 输出数据寄存器
        volatile uint32_t BSRR;     // 位设置/清除寄存器
        volatile uint32_t LCKR;     // 配置锁定寄存器
        volatile uint32_t AFR[2];   // 复用功能寄存器
    } GPIO_TypeDef;
    
    return 0;
}
```

## 完整跑通方案

**第一步：编译运行Hello World**

```bash
# 编写hello.c
cat > hello.c << 'EOF'
#include <stdio.h>

int main() {
    printf("Hello, Embedded World!\n");
    return 0;
}
EOF

# 编译
gcc hello.c -o hello

# 运行
./hello

# 查看编译过程
gcc -v hello.c -o hello

# 生成汇编代码
gcc -S hello.c -o hello.s

# 生成目标文件
gcc -c hello.c -o hello.o

# 链接生成可执行文件
gcc hello.o -o hello
```

**第二步：编写Makefile**

```makefile
# Makefile示例
CC = gcc
CFLAGS = -Wall -Wextra -O2 -g
TARGET = main
SRCS = main.c utils.c gpio.c
OBJS = $(SRCS:.c=.o)

# 默认目标
all: $(TARGET)

# 链接
$(TARGET): $(OBJS)
	$(CC) $(OBJS) -o $(TARGET)

# 编译规则
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# 清理
clean:
	rm -f $(OBJS) $(TARGET)

# 依赖关系
main.o: main.c utils.h gpio.h
utils.o: utils.c utils.h
gpio.o: gpio.c gpio.h

.PHONY: all clean
```

**第三步：模块化编程**

```c
// gpio.h - 头文件
#ifndef GPIO_H
#define GPIO_H

#include <stdint.h>

// GPIO引脚定义
#define LED_PIN 5
#define BUTTON_PIN 0

// 函数声明
void gpio_init(void);
void gpio_set_output(uint8_t pin);
void gpio_set_input(uint8_t pin);
void gpio_write(uint8_t pin, uint8_t value);
uint8_t gpio_read(uint8_t pin);

#endif // GPIO_H
```

```c
// gpio.c - 实现文件
#include "gpio.h"
#include <stdio.h>

// 模拟GPIO寄存器
static volatile uint32_t gpio_mode = 0;
static volatile uint32_t gpio_odr = 0;
static volatile uint32_t gpio_idr = 0;

void gpio_init(void) {
    gpio_mode = 0;
    gpio_odr = 0;
    gpio_idr = 0;
    printf("GPIO initialized\n");
}

void gpio_set_output(uint8_t pin) {
    gpio_mode |= (1 << pin);
    printf("Pin %d set as output\n", pin);
}

void gpio_set_input(uint8_t pin) {
    gpio_mode &= ~(1 << pin);
    printf("Pin %d set as input\n", pin);
}

void gpio_write(uint8_t pin, uint8_t value) {
    if (value) {
        gpio_odr |= (1 << pin);
    } else {
        gpio_odr &= ~(1 << pin);
    }
    printf("Pin %d = %d\n", pin, value);
}

uint8_t gpio_read(uint8_t pin) {
    return (gpio_idr >> pin) & 1;
}
```

## 常见误区

**误区 1：指针未初始化就解引用 → 段错误**

解释：野指针（未初始化的指针）指向随机地址，解引用会导致不可预测的行为。初始化指针时应设为NULL，使用前检查是否为NULL。

**误区 2：内存泄漏 → 程序运行一段时间后崩溃**

解释：malloc分配的内存必须free释放，否则会造成内存泄漏。在嵌入式系统中，内存有限，泄漏会导致系统崩溃。

**误区 3：数组越界 → 数据损坏或安全漏洞**

解释：C语言不检查数组边界，越界访问会覆盖相邻内存。嵌入式系统中可能损坏关键数据或导致系统死机。

**误区 4：忽视volatile → 编译器优化导致硬件访问异常**

解释：volatile告诉编译器不要优化对该变量的访问，因为变量可能被外部（如硬件）修改。访问硬件寄存器时必须使用volatile。

**误区 5：混淆栈和堆 → 栈溢出或内存碎片**

解释：栈空间有限（通常几KB），大数组应放在堆上。但频繁malloc/free会导致堆碎片。嵌入式系统中应尽量使用静态分配。
