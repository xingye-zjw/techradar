# 实时操作系统（RTOS）

**RTOS（Real-Time Operating System）** 是专为实时应用设计的操作系统，能够在确定的时间内响应外部事件。

## 核心特性

| 特性 | RTOS | 通用 OS（Linux） |
|------|------|-----------------|
| **响应时间** | 确定性（可预测） | 不确定（尽力而为） |
| **调度策略** | 优先级抢占式 | CFS 公平调度 |
| **任务切换** | 微秒级 | 毫秒级 |
| **内存管理** | 静态分配为主 | 动态分配 |
| **内核大小** | KB 级 | MB 级 |

## FreeRTOS 基础

### 任务创建

```c
#include "FreeRTOS.h"
#include "task.h"

// 任务函数
void vTaskFunction(void *pvParameters) {
    for (;;) {
        // 任务逻辑
        vTaskDelay(pdMS_TO_TICKS(1000));  // 延时 1 秒
    }
}

int main(void) {
    // 创建任务
    xTaskCreate(
        vTaskFunction,      // 任务函数
        "Task1",            // 任务名称
        128,                // 堆栈大小（words）
        NULL,               // 参数
        1,                  // 优先级
        NULL                // 任务句柄
    );
    
    // 启动调度器
    vTaskStartScheduler();
    
    return 0;
}
```

### 任务间通信

```c
// 1. 消息队列
QueueHandle_t xQueue;
xQueue = xQueueCreate(10, sizeof(int));

// 发送
int data = 42;
xQueueSend(xQueue, &data, portMAX_DELAY);

// 接收
int received;
xQueueReceive(xQueue, &received, portMAX_DELAY);

// 2. 信号量
SemaphoreHandle_t xSemaphore;
xSemaphore = xSemaphoreCreateBinary();

// 获取
if (xSemaphoreTake(xSemaphore, pdMS_TO_TICKS(100)) == pdTRUE) {
    // 临界区操作
}

// 释放
xSemaphoreGive(xSemaphore);

// 3. 事件组
EventGroupHandle_t xEventGroup;
xEventGroup = xEventGroupCreate();

// 设置事件
xEventGroupSetBits(xEventGroup, 0x01);

// 等待事件
EventBits_t bits = xEventGroupWaitBits(xEventGroup, 0x03, pdTRUE, pdFALSE, portMAX_DELAY);
```

## ESP32 + FreeRTOS 示例

```c
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "driver/gpio.h"

#define LED_PIN GPIO_NUM_2
#define BUTTON_PIN GPIO_NUM_0

QueueHandle_t buttonQueue;

// 按钮中断处理
void IRAM_ATTR button_isr_handler(void *arg) {
    int button_state = gpio_get_level(BUTTON_PIN);
    xQueueSendFromISR(buttonQueue, &button_state, NULL);
}

// LED 控制任务
void led_task(void *pvParameters) {
    int state = 0;
    while (1) {
        int button_state;
        if (xQueueReceive(buttonQueue, &button_state, portMAX_DELAY)) {
            if (button_state == 0) {  // 按下
                state = !state;
                gpio_set_level(LED_PIN, state);
            }
        }
    }
}

void app_main(void) {
    // 初始化 GPIO
    gpio_set_direction(LED_PIN, GPIO_MODE_OUTPUT);
    gpio_set_direction(BUTTON_PIN, GPIO_MODE_INPUT);
    
    // 创建队列
    buttonQueue = xQueueCreate(10, sizeof(int));
    
    // 安装中断
    gpio_install_isr_service(0);
    gpio_isr_handler_add(BUTTON_PIN, button_isr_handler, NULL);
    
    // 创建任务
    xTaskCreate(led_task, "LED Task", 2048, NULL, 5, NULL);
}
```

## 调度策略

```
优先级抢占式调度：

  任务 A (优先级 3)：████████████████████
  任务 B (优先级 2)：    ████████
  任务 C (优先级 1)：            ████████████████

  ↑ 高优先级任务可以随时抢占低优先级任务
```

## 常见 RTOS 对比

| RTOS | 特点 | 适用场景 |
|------|------|---------|
| **FreeRTOS** | 最流行，AWS 维护 | 通用嵌入式 |
| **RT-Thread** | 国产，组件丰富 | IoT、网关 |
| **Zephyr** | Linux 基金会，模块化 | 物联网 |
| **VxWorks** | 商业级，高可靠 | 航空航天 |
| **μC/OS** | 教学经典 | 学习RTOS |

## 应用场景

- **机器人控制**：电机控制、传感器融合（实时性要求 < 1ms）
- **汽车电子**：发动机控制、刹车系统（ISO 26262 认证）
- **工业控制**：PLC、运动控制器（EtherCAT 实时通信）
- **消费电子**：智能手表、无人机飞控
- **医疗设备**：心脏起搏器、输液泵（高可靠性要求）

## 相关概念

[操作系统](/glossary/operating-system)、[嵌入式系统](/glossary/embedded)、[中断处理](/glossary/interrupt)、[任务调度](/glossary/scheduling)
