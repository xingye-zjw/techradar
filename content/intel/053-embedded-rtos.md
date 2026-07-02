---
title: FreeRTOS实时操作系统
category: embedded
difficulty: intermediate
duration: 3周
summary: FreeRTOS是最流行的开源实时操作系统，学习任务调度、信号量、消息队列、内存管理等核心机制，理解实时系统的确定性要求
takeaways:
  - 掌握FreeRTOS核心API和任务管理
  - 理解抢占式调度和优先级反转
  - 能用信号量和队列实现任务间通信
  - 掌握中断管理和内存分配策略
relatedTerms:
  - rtos
  - operating-system
relatedTools: freertos
relatedIntel:
  - 052-embedded-c
  - 054-elec-circuit
  - 055-elec-signals
relatedNodes: embedded-rtos
tags:
  - freertos
  - rtos
  - task-scheduling
  - semaphore
  - queue
  - interrupt
  - real-time
---

## 为什么你要学它

在AIoT和工业4.0时代，实时操作系统是连接传感器、执行器和云端的关键：

- **确定性响应**：传感器数据必须在确定时间内处理，否则可能错过关键事件
- **资源受限**：微控制器只有几十KB内存，需要高效的任务管理
- **多任务协作**：同时处理传感器采集、数据预处理、通信传输等多个任务
- **工业标准**：FreeRTOS被AWS、Azure等云平台支持，是物联网设备的事实标准

如果你只会裸机编程，就无法处理复杂的并发场景；如果你用Linux，又无法满足实时性要求。

## 一句话概览（快速版）

- **任务是无限循环**：每个任务是一个函数，内部是while(1)循环
- **调度器决定谁运行**：高优先级任务就绪时立即抢占低优先级任务
- **信号量是钥匙**：二值信号量用于同步，计数信号量用于资源计数
- **队列是管道**：任务间通过队列传递数据，支持阻塞等待

## 核心拆解

### 🔑 任务创建与管理

```c
#include "FreeRTOS.h"
#include "task.h"
#include "queue.h"
#include "semphr.h"

// 任务函数原型：必须是无返回值、带void*参数的函数
void vSensorTask(void *pvParameters) {
    (void)pvParameters;  // 避免未使用参数的警告
    
    while (1) {
        // 读取传感器数据
        float temperature = read_temperature_sensor();
        
        // 发送到队列（等待100个tick）
        xQueueSend(xSensorQueue, &temperature, pdMS_TO_TICKS(100));
        
        // 延迟1000ms
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}

void vDisplayTask(void *pvParameters) {
    (void)pvParameters;
    float temperature;
    
    while (1) {
        // 从队列接收数据（永久等待）
        if (xQueueReceive(xSensorQueue, &temperature, portMAX_DELAY) == pdTRUE) {
            // 显示温度
            printf("Temperature: %.2f C\n", temperature);
        }
    }
}

// 全局变量
QueueHandle_t xSensorQueue;

int main(void) {
    // 创建队列：10个元素，每个元素大小为float
    xSensorQueue = xQueueCreate(10, sizeof(float));
    if (xSensorQueue == NULL) {
        printf("Queue creation failed!\n");
        return 1;
    }
    
    // 创建任务：栈大小256 words，优先级1
    xTaskCreate(vSensorTask, "Sensor", 256, NULL, 1, NULL);
    xTaskCreate(vDisplayTask, "Display", 256, NULL, 2, NULL);  // 优先级更高
    
    // 启动调度器（不再返回）
    vTaskStartScheduler();
    
    // 如果调度器启动失败，会执行到这里
    while (1);
}
```

### 🔑 信号量与互斥

```c
#include "semphr.h"

// 二值信号量：用于任务同步
SemaphoreHandle_t xDataReadySemaphore;

void vProducerTask(void *pvParameters) {
    (void)pvParameters;
    
    while (1) {
        // 生产数据
        produce_data();
        
        // 通知消费者数据已准备好
        xSemaphoreGive(xDataReadySemaphore);
        
        vTaskDelay(pdMS_TO_TICKS(500));
    }
}

void vConsumerTask(void *pvParameters) {
    (void)pvParameters;
    
    while (1) {
        // 等待数据准备好（永久等待）
        if (xSemaphoreTake(xDataReadySemaphore, portMAX_DELAY) == pdTRUE) {
            // 消费数据
            consume_data();
        }
    }
}

// 互斥锁：保护共享资源
SemaphoreHandle_t xMutex;
int shared_counter = 0;

void vIncrementTask(void *pvParameters) {
    (void)pvParameters;
    
    while (1) {
        // 获取互斥锁（等待100ms）
        if (xSemaphoreTake(xMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
            // 临界区：访问共享资源
            shared_counter++;
            printf("Counter: %d\n", shared_counter);
            
            // 释放互斥锁
            xSemaphoreGive(xMutex);
        }
        
        vTaskDelay(pdMS_TO_TICKS(100));
    }
}

int main(void) {
    // 创建二值信号量
    xDataReadySemaphore = xSemaphoreCreateBinary();
    
    // 创建互斥锁
    xMutex = xSemaphoreCreateMutex();
    
    xTaskCreate(vProducerTask, "Producer", 256, NULL, 1, NULL);
    xTaskCreate(vConsumerTask, "Consumer", 256, NULL, 2, NULL);
    xTaskCreate(vIncrementTask, "Increment", 256, NULL, 1, NULL);
    
    vTaskStartScheduler();
    while (1);
}
```

### 🔑 中断与ISR

```c
#include "FreeRTOS.h"
#include "task.h"
#include "queue.h"

// ISR中使用的队列
QueueHandle_t xISRQueue;

// 外部中断处理函数（ISR）
void EXTI_IRQHandler(void) {
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;
    uint32_t sensor_data;
    
    // 读取传感器数据
    sensor_data = read_sensor_register();
    
    // 从ISR发送数据到队列（注意：使用FromISR版本）
    xQueueSendFromISR(xISRQueue, &sensor_data, &xHigherPriorityTaskWoken);
    
    // 清除中断标志
    clear_interrupt_flag();
    
    // 上下文切换（如果有更高优先级任务被唤醒）
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}

void vProcessTask(void *pvParameters) {
    (void)pvParameters;
    uint32_t data;
    
    while (1) {
        // 从队列接收数据（永久等待）
        if (xQueueReceive(xISRQueue, &data, portMAX_DELAY) == pdTRUE) {
            // 处理数据
            process_sensor_data(data);
        }
    }
}

// 软件定时器回调
void vTimerCallback(TimerHandle_t xTimer) {
    (void)xTimer;
    
    // 定时器到期时执行的操作
    printf("Timer expired!\n");
}

int main(void) {
    // 创建队列
    xISRQueue = xQueueCreate(20, sizeof(uint32_t));
    
    // 创建软件定时器：周期1000ms，自动重载
    TimerHandle_t xTimer = xTimerCreate(
        "Timer",
        pdMS_TO_TICKS(1000),
        pdTRUE,  // 自动重载
        NULL,
        vTimerCallback
    );
    
    // 启动定时器
    xTimerStart(xTimer, 0);
    
    xTaskCreate(vProcessTask, "Process", 256, NULL, 2, NULL);
    
    vTaskStartScheduler();
    while (1);
}
```

### 🔑 内存管理

```c
#include "FreeRTOS.h"

// FreeRTOS提供5种堆分配方案
// heap_1：只能分配，不能释放（最简单）
// heap_2：支持分配和释放，但不合并相邻空闲块
// heap_3：使用标准库的malloc/free（需要链接器支持）
// heap_4：支持分配、释放、合并相邻空闲块（最常用）
// heap_5：heap_4 + 跨多个不连续内存区域

// 使用heap_4的示例
void vMemoryTask(void *pvParameters) {
    (void)pvParameters;
    
    while (1) {
        // 动态分配内存
        uint8_t *buffer = (uint8_t *)pvPortMalloc(1024);
        if (buffer != NULL) {
            // 使用buffer
            memset(buffer, 0, 1024);
            
            // 释放内存
            vPortFree(buffer);
        }
        
        // 查看堆使用情况
        size_t free_heap = xPortGetFreeHeapSize();
        size_t min_free_heap = xPortGetMinimumEverFreeHeapSize();
        
        printf("Free heap: %zu, Min free: %zu\n", free_heap, min_free_heap);
        
        vTaskDelay(pdMS_TO_TICKS(5000));
    }
}
```

## 完整跑通方案

**第一步：创建FreeRTOS项目**

```bash
# 下载FreeRTOS源码
git clone https://github.com/FreeRTOS/FreeRTOS.git

# 项目结构
my_project/
├── FreeRTOS/
│   ├── Source/
│   │   ├── tasks.c
│   │   ├── queue.c
│   │   ├── list.c
│   │   ├── timers.c
│   │   ├── event_groups.c
│   │   ├── stream_buffer.c
│   │   └── include/
│   └── portable/
│       └── GCC/
│           └── ARM_CM4F/  # 根据你的MCU选择
├── main.c
├── Makefile
└── startup.s
```

**第二步：配置FreeRTOSConfig.h**

```c
#ifndef FREERTOS_CONFIG_H
#define FREERTOS_CONFIG_H

// 核心配置
#define configUSE_PREEMPTION                    1
#define configUSE_IDLE_HOOK                     0
#define configUSE_TICK_HOOK                     0
#define configCPU_CLOCK_HZ                      168000000  // 168MHz
#define configTICK_RATE_HZ                      1000       // 1ms tick
#define configMAX_PRIORITIES                    8
#define configMINIMAL_STACK_SIZE                128
#define configTOTAL_HEAP_SIZE                   32768      // 32KB堆
#define configMAX_TASK_NAME_LEN                 16
#define configUSE_TRACE_FACILITY                1
#define configUSE_16_BIT_TICKS                  0
#define configIDLE_SHOULD_YIELD                 1

// 协程配置
#define configUSE_CO_ROUTINES                   0
#define configMAX_CO_ROUTINE_PRIORITIES         2

// 软件定时器
#define configUSE_TIMERS                        1
#define configTIMER_TASK_PRIORITY               2
#define configTIMER_QUEUE_LENGTH                10
#define configTIMER_TASK_STACK_DEPTH            256

// 功能选择
#define configUSE_MUTEXES                       1
#define configUSE_RECURSIVE_MUTEXES             1
#define configUSE_COUNTING_SEMAPHORES           1
#define configUSE_QUEUE_SETS                    1
#define configUSE_TASK_NOTIFICATIONS            1

// 调试
#define configCHECK_FOR_STACK_OVERFLOW          2
#define configUSE_MALLOC_FAILED_HOOK            1

// 中断优先级
#define configKERNEL_INTERRUPT_PRIORITY         255
#define configMAX_SYSCALL_INTERRUPT_PRIORITY    191

// 断言
#define configASSERT(x) if((x)==0) { taskDISABLE_INTERRUPTS(); for(;;); }

// 钩子函数
void vApplicationMallocFailedHook(void);
void vApplicationStackOverflowHook(TaskHandle_t xTask, char *pcTaskName);

#endif
```

**第三步：实现多任务传感器系统**

```c
#include "FreeRTOS.h"
#include "task.h"
#include "queue.h"
#include "semphr.h"
#include "timers.h"

// 传感器数据结构
typedef struct {
    float temperature;
    float humidity;
    uint32_t timestamp;
} SensorData_t;

// 全局句柄
QueueHandle_t xSensorQueue;
SemaphoreHandle_t xDataReadySemaphore;
TimerHandle_t xSampleTimer;

// 传感器采样任务（高优先级）
void vSensorTask(void *pvParameters) {
    (void)pvParameters;
    SensorData_t data;
    
    while (1) {
        // 等待采样信号量
        if (xSemaphoreTake(xDataReadySemaphore, portMAX_DELAY) == pdTRUE) {
            // 读取传感器
            data.temperature = read_temperature();
            data.humidity = read_humidity();
            data.timestamp = xTaskGetTickCount();
            
            // 发送到处理队列（不阻塞）
            xQueueSend(xSensorQueue, &data, 0);
        }
    }
}

// 数据处理任务（中优先级）
void vProcessTask(void *pvParameters) {
    (void)pvParameters;
    SensorData_t data;
    float temp_avg = 0;
    float humi_avg = 0;
    uint32_t count = 0;
    
    while (1) {
        // 接收数据（等待最多100ms）
        if (xQueueReceive(xSensorQueue, &data, pdMS_TO_TICKS(100)) == pdTRUE) {
            // 滑动平均
            temp_avg = (temp_avg * count + data.temperature) / (count + 1);
            humi_avg = (humi_avg * count + data.humidity) / (count + 1);
            count++;
            
            // 每10次采样输出一次
            if (count >= 10) {
                printf("Avg Temp: %.2f, Avg Humi: %.2f\n", temp_avg, humi_avg);
                count = 0;
                temp_avg = 0;
                humi_avg = 0;
            }
        }
    }
}

// 通信任务（低优先级）
void vCommTask(void *pvParameters) {
    (void)pvParameters;
    
    while (1) {
        // 每5秒发送一次数据到云端
        vTaskDelay(pdMS_TO_TICKS(5000));
        send_to_cloud();
    }
}

// 定时器回调：触发采样
void vSampleTimerCallback(TimerHandle_t xTimer) {
    (void)xTimer;
    xSemaphoreGive(xDataReadySemaphore);
}

int main(void) {
    // 初始化硬件
    hardware_init();
    
    // 创建队列（20个元素）
    xSensorQueue = xQueueCreate(20, sizeof(SensorData_t));
    
    // 创建信号量
    xDataReadySemaphore = xSemaphoreCreateBinary();
    
    // 创建定时器：100ms周期
    xSampleTimer = xTimerCreate(
        "SampleTimer",
        pdMS_TO_TICKS(100),
        pdTRUE,
        NULL,
        vSampleTimerCallback
    );
    
    // 创建任务
    xTaskCreate(vSensorTask, "Sensor", 256, NULL, 3, NULL);
    xTaskCreate(vProcessTask, "Process", 256, NULL, 2, NULL);
    xTaskCreate(vCommTask, "Comm", 256, NULL, 1, NULL);
    
    // 启动定时器
    xTimerStart(xSampleTimer, 0);
    
    // 启动调度器
    vTaskStartScheduler();
    
    while (1);
}
```

## 常见误区

**误区 1：在ISR中使用非FromISR函数 → 系统崩溃**

解释：ISR中只能使用带FromISR后缀的API，因为普通API可能会阻塞，而ISR不能阻塞。错误使用会导致不可预测的行为。

**误区 2：任务栈设置过小 → HardFault**

解释：RTOS任务栈通常只有几百字节到几KB。函数调用嵌套过深、局部数组过大都会导致栈溢出。使用uxTaskGetStackHighWaterMark()监控栈使用情况。

**误区 3：优先级反转 → 高优先级任务被低优先级任务阻塞**

解释：当高优先级任务等待低优先级任务持有的资源时，如果中优先级任务抢占了低优先级任务，高优先级任务就会无限期等待。使用互斥锁（Mutex）的优先级继承机制解决。

**误区 4：忽视死区时间 → 系统不稳定**

解释：在电机控制等场景中，PWM切换时需要死区时间防止上下桥臂直通。FreeRTOS的软件定时器精度有限，高精度定时应使用硬件定时器。

**误区 5：频繁动态分配内存 → 堆碎片**

解释：嵌入式系统内存有限，频繁malloc/free会导致堆碎片。应尽量使用静态分配或内存池，避免在任务中频繁分配内存。
