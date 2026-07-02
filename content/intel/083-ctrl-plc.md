---
title: PLC可编程控制器
category: embedded
difficulty: beginner
duration: 2-3周
summary: 理解PLC在工业自动化中的应用。掌握梯形图编程、I/O配置、通信协议等核心技能。
takeaways:
  - 理解PLC的工作原理
  - 掌握梯形图编程方法
  - 理解I/O模块配置
  - 了解工业通信协议
relatedIntel:
  - 052-embedded-c
  - 053-embedded-rtos
  - 054-elec-circuit
tags:
  - plc
  - 可编程控制器
  - 梯形图
  - 工业自动化
  - 西门子
  - IEC 61131-3
---

## 为什么你要学它

PLC（Programmable Logic Controller）是工业自动化的核心控制器：

- **制造业核心**：汽车、食品、制药、包装等行业的生产线控制
- **过程控制**：化工、电力、水处理等连续过程监控
- **机器人集成**：协调机械臂、传送带、传感器的协同工作
- **智能工厂**：工业4.0和智能制造的基础设施

如果你从事工业自动化、机器人、智能制造领域，PLC是必须掌握的技能。

## 一句话概览（快速版）

- **PLC本质**：专为工业环境设计的可靠计算机，通过I/O模块连接传感器和执行器
- **扫描周期**：读取输入 → 执行程序 → 写入输出，循环执行（典型周期1-100ms）
- **梯形图**：从继电器电路演化而来，直观易懂，是最常用的PLC编程语言
- **IEC 61131-3**：国际标准，定义了5种编程语言（LD、FBD、ST、IL、SFC）

## 核心拆解

### 🔑 PLC硬件架构

```
┌─────────────────────────────────────────────────────────┐
│                      PLC主机                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │              CPU模块（中央处理器）                 │   │
│  │   • 执行用户程序                                  │   │
│  │   • 处理通信                                      │   │
│  │   • 系统诊断                                      │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ 电源模块  │ │ 输入模块  │ │ 输出模块  │              │
│  │ (PS)     │ │ (DI/AI)  │ │ (DO/AO)  │              │
│  └──────────┘ └──────────┘ └──────────┘              │
│  ┌─────────────────────────────────────────────────┐   │
│  │              通信模块 (CP/CM)                     │   │
│  │   • PROFINET / PROFIBUS                         │   │
│  │   • Modbus TCP/RTU                              │   │
│  │   • EtherNet/IP                                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │                  │                  │
    传感器信号          执行器控制          上位机通信
    (开关量/模拟量)     (继电器/晶体管)     (HMI/SCADA)
```

**主流PLC品牌对比：**

| 品牌 | 代表型号 | 特点 | 适用场景 |
|------|----------|------|----------|
| 西门子 | S7-1200/1500 | 功能强大，生态完善 | 中大型项目 |
| 三菱 | FX/Q系列 | 性价比高，亚洲市场主流 | 中小型项目 |
| 欧姆龙 | CP/CJ系列 | 指令丰富，运动控制强 | 电子制造 |
| 罗克韦尔 | ControlLogix | 北美市场主流，安全认证完善 | 过程控制 |
| 倍福 | CX系列 | 基于PC，支持多种语言 | 高端应用 |

### 🔑 梯形图编程（Ladder Diagram）

梯形图是最直观的PLC编程语言，从继电器控制电路演化而来：

```
基本符号：
──┤ ├──  常开触点（NO）：条件为真时导通
──┤/├──  常闭触点（NC）：条件为假时导通
──( )──  输出线圈：左侧条件满足时输出为ON
──(S)──  置位线圈：置位后保持ON直到复位
──(R)──  复位线圈：复位后保持OFF直到置位
──┤P├──  上升沿检测：信号从OFF到ON时导通一个扫描周期
──┤N├──  下降沿检测：信号从ON到OFF时导通一个扫描周期
```

**示例1：电机启停控制（自锁电路）**

```
    I0.0        I0.1         Q0.0
──┤ ├──┬──────┤/├──────────( )──
        │
    Q0.0│
──┤ ├──┘

说明：
- I0.0: 启动按钮（常开）
- I0.1: 停止按钮（常闭）
- Q0.0: 电机接触器输出
- Q0.0触点实现自锁，按下启动后电机持续运行
```

**示例2：定时器应用（延时启动）**

```
    I0.0        T1(IN)     T1.Q        Q0.0
──┤ ├─────────(TON)──────┤ ├─────────( )──
             PT=5s

说明：
- I0.0: 启动信号
- T1: 接通延时定时器（TON）
- PT: 预设时间5秒
- Q0.0: 延时5秒后输出
```

**示例3：计数器应用（计数控制）**

```
    I0.0        C1(CU)     C1.Q        Q0.0
──┤ ├─────────(CTU)──────┤ ├─────────( )──
             PV=10

    I0.1        C1(R)
──┤ ├─────────( )──

说明：
- I0.0: 计数输入
- I0.1: 复位信号
- C1: 加计数器（CTU）
- PV: 预设值10
- 计数达到10次后Q0.0输出
```

### 🔑 I/O模块配置

**数字量输入（DI）：**

```python
# 西门子S7-1200数字量输入配置示例
# 输入地址：I0.0 ~ I0.7, I1.0 ~ I1.7...

# 常用传感器接线方式：
# 1. NPN型传感器：信号线接输入端，负极接0V
# 2. PNP型传感器：信号线接输入端，正极接24V（推荐）

# 输入滤波时间设置（防止抖动）
# 典型值：0.1ms ~ 12.4ms
# 高速计数输入需要设置更短的滤波时间
```

**数字量输出（DO）：**

```python
# 输出类型选择：
# 1. 继电器输出：可驱动AC/DC负载，响应慢（~10ms），寿命有限
# 2. 晶体管输出：仅DC负载，响应快（~0.1ms），寿命长

# 输出地址：Q0.0 ~ Q0.7, Q1.0 ~ Q1.7...

# 负载能力示例（西门子SM1222）：
# 继电器输出：2A/点（阻性负载）
# 晶体管输出：0.5A/点
```

**模拟量输入（AI）：**

```python
# 常用信号类型：
# 1. 电压信号：0-10V, ±10V
# 2. 电流信号：4-20mA（推荐，抗干扰能力强）
# 3. 热电偶/热电阻：直接温度测量

# 西门子模拟量输入配置（TIA Portal）：
# 地址：IW64, IW66, IW68...（每个通道2字节）

# 量程转换示例：
# 假设4-20mA传感器，量程0-100°C
# 数字值范围：0-27648（西门子标准）

def analog_to_temperature(raw_value):
    """将模拟量原始值转换为温度"""
    # 4mA = 5530, 20mA = 27648
    if raw_value < 5530:
        return 0  # 断线检测
    temperature = (raw_value - 5530) / (27648 - 5530) * 100
    return round(temperature, 1)

def temperature_to_analog(temperature):
    """将温度转换为模拟量输出值"""
    # 0-100°C -> 4-20mA
    raw_value = 5530 + (temperature / 100) * (27648 - 5530)
    return int(raw_value)
```

### 🔑 通信协议

**PROFINET（工业以太网）：**

```python
# PROFINET是西门子主推的工业以太网协议
# 特点：实时性好（周期<1ms），支持IRT（等时实时）

# 典型配置步骤：
# 1. 在TIA Portal中添加PROFINET接口
# 2. 配置IP地址和设备名称
# 3. 分配IO地址
# 4. 设置通信周期

# S7通信（上位机访问PLC数据）
# Python示例：使用snap7库

import snap7
from snap7.util import *

# 连接PLC
plc = snap7.client.Client()
plc.connect('192.168.0.1', 0, 1)  # IP, rack, slot

# 读取数据块DB1
data = plc.db_read(1, 0, 10)  # DB号, 起始地址, 长度

# 解析数据
value = get_int(data, 0)  # 读取整数
status = get_bool(data, 2, 0)  # 读取布尔值（第2字节第0位）

# 写入数据
data = bytearray(10)
set_int(data, 0, 1234)
plc.db_write(1, 0, data)

plc.disconnect()
```

**Modbus协议：**

```python
# Modbus RTU（串口通信）
import serial
from pymodbus.client import ModbusSerialClient

client = ModbusSerialClient(
    port='COM3',
    baudrate=9600,
    parity='N',
    stopbits=1,
    bytesize=8
)

client.connect()

# 读取保持寄存器（功能码03）
result = client.read_holding_registers(address=0, count=10, slave=1)
print(result.registers)

# 写入单个寄存器（功能码06）
client.write_register(address=0, value=100, slave=1)

client.close()

# Modbus TCP（以太网通信）
from pymodbus.client import ModbusTcpClient

client = ModbusTcpClient('192.168.0.100', port=502)
client.connect()

# 读取线圈（功能码01）
coils = client.read_coils(address=0, count=8, slave=1)
print(coils.bits[:8])

# 读取输入寄存器（功能码04）
inputs = client.read_input_registers(address=0, count=4, slave=1)
print(inputs.registers)

client.close()
```

**OPC UA协议：**

```python
# OPC UA是工业4.0推荐的通信协议
# 支持安全认证、数据建模、订阅机制

from opcua import Client

url = "opc.tcp://192.168.0.1:4840"
client = Client(url)

client.connect()

# 浏览节点
root = client.get_root_node()
print("Root node:", root)

# 读取变量
node = client.get_node("ns=2;s=Machine.Temperature")
value = node.get_value()
print(f"Temperature: {value}")

# 订阅数据变化
class SubHandler:
    def datachange_notification(self, node, val, data):
        print(f"Data change: {node} = {val}")

handler = SubHandler()
sub = client.create_subscription(500, handler)  # 500ms采样
handle = sub.subscribe_data_change(node)

client.disconnect()
```

### 🔑 实际应用案例

**案例：水箱液位控制系统**

```
系统组成：
- 液位传感器：4-20mA输出，量程0-2m
- 进水阀门：开关量控制
- 变频器：模拟量控制（0-10V）
- PLC：西门子S7-1200

控制要求：
1. 自动模式下，液位保持在设定值±5cm
2. 手动模式下，可手动控制阀门和变频器
3. 液位低于下限报警，高于上限停止进水
```

```python
# 梯形图程序（伪代码表示）

# 变量定义
# I0.0: 自动/手动切换
# I0.1: 启动按钮
# I0.2: 停止按钮
# I0.3: 液位下限报警
# I0.4: 液位上限报警
# IW64: 液位模拟量输入
# Q0.0: 运行指示灯
# Q0.1: 进水阀门
# QW80: 变频器速度给定
# MW100: 液位设定值（cm）
# MW102: 实际液位（cm）

# 主程序逻辑
"""
Network 1: 启停控制
    I0.1        I0.2         M0.0
──┤ ├──┬──────┤/├──────────( )──
        │
    M0.0│
──┤ ├──┘

Network 2: 自动模式液位控制
    M0.0       I0.0        PID
──┤ ├──┬─────┤ ├─────────( )──
      │
    M0.0│
──┤ ├──┘

Network 3: 手动模式阀门控制
    M0.0       I0.0        Q0.1
──┤ ├──┬─────┤/├─────────( )──
      │
    Q0.1│
──┤ ├──┘

Network 4: 液位报警
    I0.3        Q0.2
──┤ ├─────────( )──  低液位报警

    I0.4        Q0.3
──┤ ├─────────( )──  高液位报警
"""

# SCL语言实现PID控制
"""
// 液位PID控制
#PID_Loop(
    SETPOINT := "液位设定值",
    INPUT := "实际液位",
    OUTPUT => "变频器速度",
    GAIN := 2.0,           // 比例增益
    TI := 10.0,           // 积分时间(s)
    TD := 2.0,            // 微分时间(s)
    CYCLE := T#100ms      // 采样周期
);
"""
```

## 完整跑通方案

**第一步：搭建仿真环境**

```python
# 使用PLCSIM Advanced进行仿真（西门子）
# 或使用Codesys仿真环境

# Codesys免费仿真方案：
# 1. 下载安装Codesys 3.5
# 2. 创建新项目，选择"Standard Project"
# 3. 设备选择"Codesys Control Win V3"
# 4. 编写梯形图程序
# 5. 启动仿真，在线调试

# 梯形图示例：交通灯控制
"""
变量定义：
- START: BOOL    // 启动按钮
- STOP: BOOL     // 停止按钮
- RED: BOOL      // 红灯输出
- YELLOW: BOOL   // 黄灯输出
- GREEN: BOOL    // 绿灯输出
- T1: TON        // 红灯定时器
- T2: TON        // 绿灯定时器
- T3: TON        // 黄灯定时器

程序逻辑：
Network 1: 启停控制
    START      STOP        RUN
──┤ ├──┬─────┤/├─────────( )──
        │
    RUN │
──┤ ├──┘

Network 2: 红灯控制（30秒）
    RUN        T2.Q        RED     T1(IN)
──┤ ├──┬─────┤ ├─────────( )────( )──
      │                       PT=T#30s
    RED│
──┤ ├──┘

Network 3: 绿灯控制（25秒）
    T1.Q       T3.Q        GREEN   T2(IN)
──┤ ├─────────┤/├─────────( )────( )──
                            PT=T#25s

Network 4: 黄灯控制（5秒）
    T2.Q       T3.Q        YELLOW  T3(IN)
──┤ ├─────────┤/├─────────( )────( )──
                            PT=T#5s
"""
```

**第二步：编写结构化程序**

```python
# 使用功能块（FB）实现模块化编程

# 功能块：电机控制
"""
FUNCTION_BLOCK "Motor_Control"
{ S7_Optimized_Access := 'TRUE' }
VAR_INPUT
    Start : Bool;          // 启动信号
    Stop : Bool;           // 停止信号
    Fault_Reset : Bool;    // 故障复位
    Speed_SP : Real;       // 速度设定值
END_VAR

VAR_OUTPUT
    Run : Bool;            // 运行状态
    Fault : Bool;          // 故障状态
    Speed_Act : Real;      // 实际速度
END_VAR

VAR
    T1 : Time;             // 启动延时
    TON_Instance : TON;    // 定时器实例
END_VAR

BEGIN
    // 启停控制
    IF #Start AND NOT #Fault THEN
        #Run := TRUE;
    END_IF;
    
    IF #Stop OR #Fault THEN
        #Run := FALSE;
    END_IF;
    
    // 故障检测
    IF #Run AND (#Speed_Act < 10.0) THEN
        #TON_Instance(IN := TRUE, PT := T#5s);
        IF #TON_Instance.Q THEN
            #Fault := TRUE;
        END_IF;
    ELSE
        #TON_Instance(IN := FALSE);
    END_IF;
    
    // 故障复位
    IF #Fault_Reset THEN
        #Fault := FALSE;
    END_IF;
END_FUNCTION_BLOCK
"""
```

**第三步：HMI界面开发**

```python
# 使用WinCC或第三方HMI开发监控界面

# 基于Web的HMI示例（Python + Flask）
from flask import Flask, render_template, jsonify
import snap7

app = Flask(__name__)
plc = snap7.client.Client()

def get_plc_data():
    """读取PLC数据"""
    try:
        if not plc.get_connected():
            plc.connect('192.168.0.1', 0, 1)
        
        # 读取DB1数据
        data = plc.db_read(1, 0, 20)
        
        return {
            'temperature': get_real(data, 0),
            'pressure': get_real(data, 4),
            'level': get_int(data, 8),
            'status': get_bool(data, 10, 0),
            'alarm': get_bool(data, 10, 1)
        }
    except Exception as e:
        return {'error': str(e)}

@app.route('/')
def index():
    return render_template('dashboard.html')

@app.route('/api/data')
def api_data():
    return jsonify(get_plc_data())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

## 常见误区

**误区 1：忽视扫描周期 → 程序执行时序问题**

解释：PLC按扫描周期执行程序，输入信号变化必须在扫描周期内才能被检测到。高速信号需要使用中断或高速计数器。

**误区 2：双线圈输出 → 输出状态不确定**

解释：同一输出地址在程序中出现多次赋值（双线圈），最终状态由最后一次赋值决定，可能导致逻辑混乱。应使用中间变量或状态机。

**误区 3：忽视掉电保持 → 数据丢失**

解释：普通变量在PLC断电后丢失，需要保持的数据应使用掉电保持型存储区（如西门子的M区保持区域或DB块设置）。

**误区 4：模拟量处理不当 → 测量误差大**

解释：模拟量信号容易受干扰，应使用屏蔽电缆、正确接地、设置滤波时间，并做好断线检测。

**误区 5：通信超时未处理 → 程序卡死**

解释：与外部设备通信时，必须设置超时时间和重试机制，避免因通信故障导致程序卡死。

## 学习资源推荐

**官方文档：**
- 西门子TIA Portal帮助文档
- IEC 61131-3标准文档
- Codesys在线帮助

**推荐书籍：**
- 《PLC编程及应用》廖常初
- 《西门子S7-1200/1500 PLC编程及应用》廖常初
- 《IEC 61131-3编程语言及应用》

**在线资源：**
- 西门子工业支持中心：support.industry.siemens.com
- Codesys官方教程：www.codesys.com
- PLC论坛：www.plctalk.net

**实践平台：**
- 西门子PLCSIM Advanced（仿真）
- Codesys Control Win（免费仿真）
- Factory I/O（3D虚拟工厂仿真）