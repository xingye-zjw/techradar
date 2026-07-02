---
title: Arduino 嵌入式开发
category: embedded
difficulty: beginner
duration: 1-2周
summary: 电子创客和快速原型开发的最佳起点，用几行代码就能控制硬件、读取传感器、执行器驱动。
takeaways:
  - 掌握 Arduino 语言和开发环境，能独立编写 GPIO、PWM、UART、I2C、SPI 通信代码
  - 理解微控制器基本工作原理，能读懂传感器数据手册并完成接口对接
  - 能独立完成一个从硬件连接到软件实现的完整嵌入式小项目
  - 建立起"用代码控制物理世界"的直觉，为学习 RTOS、Linux 嵌入式打下基础
relatedIntel:
  - 052-embedded-c
  - 053-embedded-rtos
  - 054-elec-circuit
tags:
  - arduino
  - microcontroller
  - gpio
  - pwm
  - uart
  - i2c
  - spi
  - sensor-interface
  - embedded
  - prototyping
---

## 为什么你要学它

先讲结论：**Arduino = 让任何人都能用几行代码控制电子硬件，不需要懂数电模电也能玩转嵌入式。**

它解决了一个长期困扰初学者的问题：传统嵌入式开发需要手写寄存器配置、理解时钟树、啃数据手册——光是一个 GPIO 初始化就可能让你写 50 行代码。Arduino 用抽象层把这些全部封装掉，你只需要 `pinMode(13, OUTPUT)` 和 `digitalWrite(13, HIGH)` 两行就能点亮 LED。

Arduino 是**创客文化的基石**：3D 打印机、无人机、智能家居、机器人……几乎所有开源硬件项目的最初原型都是用它做的。它也是**快速验证想法的最佳工具**：花 10 分钟搭一个温湿度传感器原型，比用 STM32 写一周更高效。

理解 Arduino 后，你再去看任何嵌入式项目都会发现——它们的底层依然是 GPIO、PWM、UART、I2C、SPI，只是用了更底层的写法。

## 一句话概览（快速版）

你只要记住三句话：

1. **Arduino = 一块带 USB 的微控制器 + 一套简单 API + 一个活跃社区**
2. **所有硬件控制归根结底都是操作寄存器**——只是 Arduino 帮你封装成了 `digitalWrite()`、`analogRead()` 这样的函数
3. **生态系统里有几百种传感器扩展板（Shield），即插即用，大幅降低硬件开发门槛**

## 核心拆解

### 🔑 Arduino 生态

- **开发板**：Uno（最经典）、Nano（紧凑）、Mega（多 IO）、ESP32（WiFi/BLE）
- **开发环境**：Arduino IDE（简单够用）或 PlatformIO（现代、VS Code 支持）
- **语言**：基于 Wiring，C/C++ 简化版，入口是 `setup()` + `loop()`
- **库生态**：数百种开源库（传感器、电机驱动、通信协议），大部分 GitHub 可得

### 🔑 GPIO（通用输入输出）

微控制器最基础的能力——**读取引脚状态（输入）或控制引脚电平（输出）**。

- `pinMode(pin, INPUT/OUTPUT/INPUT_PULLUP)` 配置引脚方向
- `digitalRead(pin)` 读取 0/1（HIGH/LOW）
- `digitalWrite(pin, HIGH/LOW)` 输出电平

典型应用：按键检测、LED 控制、继电器驱动。

### 🔑 PWM（脉宽调制）

用数字引脚模拟模拟信号输出——**通过快速切换高低电平来控制平均电压**。

- `analogWrite(pin, duty_cycle)` 写入 0-255 的占空比（8 位精度）
- 常用于：LED 调光、电机调速、舵机控制（角度控制）

关键参数：频率（Arduino UNO 默认约 490Hz）、占空比（0=0%，255=100%）。

### 🔑 UART（串口通信）

**两设备之间的点对点异步串行通信**，最经典的调试方式。

- `Serial.begin(9600)` 初始化（常用波特率 9600/115200）
- `Serial.println("hello")` 发送数据
- `Serial.available()` 检查是否有数据
- `Serial.read()` 读取一个字节

典型应用：与 ESP8266/ESP32 通信、GPS 模块、蓝牙模块。

### 🔑 I2C（两线串行总线）

**用两根线（SCL 时钟 + SDA 数据）连接多个从设备**，一根主设备可以挂载上百个传感器。

- `Wire.begin()` 初始化主设备
- `Wire.beginTransmission(address)` 开始向指定地址写数据
- `Wire.write(data)` 发送字节
- `Wire.requestFrom(address, bytes)` 向从设备请求数据
- `Wire.read()` 读取接收到的字节

典型应用：OLED 屏幕（0x3C）、MPU6050 陀螺仪（0x68）、BMP280 气压传感器（0x76）。

### 🔑 SPI（高速同步串行总线）

**比 I2C 更快（可达数十 MHz），适合高数据量场景**（屏幕、存储、ADC）。

- 四根线：MOSI（主出从入）、MISO（主入从出）、SCK（时钟）、SS（片选）
- 典型用法：`SPI.transfer(data)` 单字节传输
- 库：`<SPI.h>`

典型应用：SD 卡读写、TFT 显示屏、NOR Flash 存储。

### 🔑 传感器接口实战

Arduino 社区最常见的两类传感器：

1. **数字传感器**（I2C/SPI）：接上就能读数据，无需标定
   - BMP280：气压+温度，`Adafruit_BMP280` 库
   - MPU6050：六轴 IMU，`MPU6050` 库
   - AHT10：温湿度，`Adafruit_AHTX0` 库

2. **模拟传感器**（ADC）：直接接 analog 引脚，`analogRead()` 读原始值
   - 光敏电阻、热敏电阻、土壤湿度探头
   - 需要自己写标定公式

## 完整跑通方案

**第一步：点亮 LED（Arduino IDE）**

安装 Arduino IDE，板子选 UNO，连接 USB。

```cpp
void setup() {
  pinMode(13, OUTPUT);  // UNO 板载 LED 在 13 号引脚
}

void loop() {
  digitalWrite(13, HIGH);  // 点亮
  delay(1000);             // 等待 1 秒
  digitalWrite(13, LOW);   // 熄灭
  delay(1000);             // 等待 1 秒
}
```

**第二步：读取温湿度传感器（AHT10 via I2C，PlatformIO）**

安装 PlatformIO 插件，创建项目，选择 Arduino Nano。

```cpp
#include <Wire.h>
#include <Adafruit_AHTX0.h>

Adafruit_AHTX0 aht;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!aht.begin()) {
    Serial.println("找不到 AHT10 传感器！");
    while (1) delay(10);
  }
  Serial.println("AHT10 初始化成功");
}

void loop() {
  sensors_event_t humidity, temp;
  aht.getEvent(&humidity, &temp);
  Serial.print("温度: ");
  Serial.print(temp.temperature);
  Serial.print(" °C, 湿度: ");
  Serial.print(humidity.relative_humidity);
  Serial.println(" %");
  delay(1000);
}
```

**第三步：控制舵机（PWM）**

```cpp
#include <Servo.h>
Servo myServo;
int pos = 0;

void setup() {
  myServo.attach(9);  // PWM 引脚 9
}

void loop() {
  for (pos = 0; pos <= 180; pos += 1) {
    myServo.write(pos);  // 发送角度
    delay(15);
  }
  for (pos = 180; pos >= 0; pos -= 1) {
    myServo.write(pos);
    delay(15);
  }
}
```

**第四步：OLED 显示信息（I2C SSD1306）**

```cpp
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

void setup() {
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED 初始化失败");
    while (true);
  }
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 10);
  display.println("Hello!");
  display.display();
}

void loop() {}
```

## 常见错误和解决方案

**"上传失败：avrdude: ser_open(): can't open device"**
- 原因：串口被占用或驱动未安装
- 解决：在设备管理器中查看 COM 端口，确保选择了正确的端口；安装 CH340/FTDI 驱动

**"I2C 设备不工作，读不到数据"**
- 原因：接线错误（SDC/SCL 反了）、地址不对、没有上拉电阻
- 解决：用 I2C Scanner 扫描确认设备地址；确保 SDA→A4, SCL→A5（UNO）；某些传感器需要外接 4.7kΩ 上拉电阻

**"analogRead() 读数不稳定，波动几十到上百"**
- 原因：ADC 参考电压受电源噪声影响
- 解决：在 AREF 引脚接 100nF 电容去耦；多次采样取平均；使用外部精密参考源

**"PWM 控制电机时有抖动"**
- 原因：Arduino 默认 PWM 频率低（约 490Hz），电机能听到声音
- 解决：使用 Timer1 库将 PWM 频率提高到 20kHz 以上

**"程序能编译但行为不符合预期"**
- 原因：`loop()` 里逻辑错误、死循环、delay 阻塞
- 解决：用 `millis()` 替代 `delay()` 实现非阻塞延时；用 State Machine 模式组织代码

**"ESP32 连接 WiFi 一直失败"**
- 原因：WiFi 密码错误、路由器不支持 802.11b、供电不足
- 解决：确认密码；检查供电是否稳定（ESP32 需要 500mA+）；尝试用手机热点测试

## 推荐学习顺序

1. 先买一块 Arduino UNO 或 Nano（约 20-30 元），装好 Arduino IDE，跑通 Blink 示例
2. 买一个入门套件（含 LED、按键、光敏电阻、舵机），跟着实验手册做 5-10 个基础实验
3. 尝试接一个 I2C 传感器（推荐 AHT10），学习看数据手册和库的使用
4. 用 PlatformIO 替代 Arduino IDE，体验更现代的嵌入式开发流程
5. 挑战一个小项目：温湿度记录仪、遥控小车、智能浇花系统——从纸面设计到实物跑通
