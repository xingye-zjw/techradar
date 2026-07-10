---
title: 硬件设计踩坑合集
category: embedded
difficulty: advanced
duration: 30分钟
summary: 涵盖 4 个常见踩坑：H桥驱动电机时的直通短路、PCB设计中的EMI/EMC问题、电源设计压降/纹波过大、晶振不起振/频率偏移，每个均附快速修复与排查步骤。
takeaways:
  - 掌握「硬件设计踩坑合集」中各问题的快速识别方法 - 理解每个踩坑的根因分析和排查步骤 - 学会标准化的修复流程和预防措施
relatedIntel:
  - 054-elec-circuit - 080-elec-pcb
tags:
  - 嵌入式
  - MCU
  - 硬件
  - 驱动
relatedTerms:
  - data-structure
  - rtos
  - algorithm
  - complexity
relatedTools:
  - pytorch
  - ultralytics-yolo
  - huggingface-transformers
relatedNodes:
  - roadmap-capstone
  - electrical-safety
---

[电气工程]

## H桥驱动电机时的直通短路

// 快速修复

设置死区时间 + 使用专用栅极驱动芯片 + 过流保护

// 现象表现

- × H桥MOSFET迅速发热甚至烧毁
- × 电源电流异常增大
- × 电机驱动时电源电压跌落
- × PWM占空比接近100%时问题更严重

// 排查步骤

- 01 设置足够的死区时间(1-5μs)
- 02 使用带死区插入的专用栅极驱动芯片(如IR2104)
- 03 软件互补PWM采用先关后开策略
- 04 添加过流保护电路
- 05 选择开关速度快的MOSFET
- 06 用示波器观察栅极驱动波形确认死区

#H桥#电机驱动#短路#MOSFET

---

[电气工程]

## PCB设计中的EMI/EMC问题

// 快速修复

加滤波电容 + 优化接地 + 屏蔽敏感信号

// 现象表现

- × 产品通不过EMC认证
- × 辐射超标
- × 系统偶发复位
- × 射频干扰

// 排查步骤

- 01 检查关键信号完整性
- 02 添加滤波电容(0.1μF+10μF组合)
- 03 优化PCB接地平面，保证地平面完整
- 04 敏感信号用差分走线
- 05 加屏蔽罩

#PCB#EMI#EMC#硬件

---

[电气工程]

## 电源设计压降/纹波过大

// 快速修复

加输入输出电容 + 优化走线 + 选择合适LDO/DC-DC

// 现象表现

- × 负载电流增大时电压跌落
- × 输出纹波超标
- × 后级电路工作不稳定

// 排查步骤

- 01 输入输出加足够滤波电容(电解+陶瓷组合)
- 02 电源走线加宽减小阻抗
- 03 选择合适规格的LDO/DC-DC模块
- 04 负载近端添加去耦电容
- 05 用示波器观察电源纹波

#电源#PCB#硬件#信号处理

---

[电气工程]

## 晶振不起振/频率偏移

// 快速修复

检查负载电容 + 验证PCB走线 + 温度补偿

// 现象表现

- × MCU程序运行异常
- × 串口波特率不准
- × 系统偶发死机

// 排查步骤

- 01 检查晶振负载电容匹配(通常15-33pF)
- 02 晶振走线尽量短且接地隔离
- 03 避免晶振附近有干扰信号
- 04 测量晶振频率验证准确性
- 05 考虑使用有源晶振

#嵌入式#硬件#时钟

## 修复后附加：最小一键诊断命令

```bash
/* 嵌入式最小诊断：时钟+GPIO+UART 三件套寄存器自检（STM32 参考，可直接替换为自己的 MCU） */
#include <stdint.h>
volatile uint32_t *RCC_AHB1 = (volatile uint32_t *)0x40023830UL;
volatile uint32_t *GPIOD_MODER = (volatile uint32_t *)0x40020C00UL;
volatile uint32_t *GPIOD_ODR   = (volatile uint32_t *)0x40020C14UL;
int mcu_self_test(void) {
  *RCC_AHB1 |= (1UL << 3);          /* GPIOD 时钟使能 */
  *GPIOD_MODER &= ~(3UL << (12*2)); /* PD12 -> 输出 */
  *GPIOD_MODER |=  (1UL << (12*2));
  *GPIOD_ODR  |=  (1UL << 12);      /* 置高 PD12 LED */
  return (*GPIOD_ODR >> 12) & 1U;   /* 回读应为 1 */
}
```
