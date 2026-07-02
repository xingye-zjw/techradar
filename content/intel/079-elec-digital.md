---
title: 数字电路基础
category: embedded
keywords:
  - 数字电路
  - 逻辑门
  - 组合逻辑
  - 时序逻辑
  - FPGA
difficulty: beginner
duration: 2-3周
summary: 理解数字电路的设计原理。掌握逻辑门、组合逻辑、时序逻辑等核心概念。
takeaways:
  - 理解二进制数制和编码
  - 掌握逻辑门和布尔代数
  - 理解组合逻辑电路设计
  - 掌握时序逻辑电路设计
relatedTerms: circuit
relatedIntel:
  - 052-embedded-c
  - 053-embedded-rtos
  - 054-elec-circuit
---

## 为什么你要学它

数字电路是现代电子系统的核心基础。在AI硬件时代：

- **处理器设计**：CPU、GPU、NPU都是大规模数字电路系统
- **FPGA加速**：AI推理加速器常用FPGA实现
- **嵌入式系统**：MCU、DSP等芯片内部全是数字逻辑
- **通信接口**：I2C、SPI、UART、PCIe等都是数字协议
- **存储系统**：DDR、Flash存储器基于数字电路

如果你不懂数字电路，就无法理解计算机底层工作原理，也无法进行硬件设计。

## 一句话概览（快速版）

- **二进制是基础**：0和1表示所有信息，位运算是核心
- **逻辑门是积木**：AND、OR、NOT、NAND、NOR、XOR构建一切
- **组合逻辑无记忆**：输出只取决于当前输入，如加法器、译码器
- **时序逻辑有记忆**：输出取决于输入和状态，如计数器、寄存器
- **FPGA是可编程硬件**：用代码描述电路，现场配置实现

## 核心拆解

### 🔑 数制与编码

```python
# 二进制、十进制、十六进制转换

def dec_to_bin(n, bits=8):
    """十进制转二进制字符串"""
    return format(n, f'0{bits}b')

def bin_to_dec(b):
    """二进制字符串转十进制"""
    return int(b, 2)

def dec_to_hex(n):
    """十进制转十六进制"""
    return format(n, '02X')

def hex_to_dec(h):
    """十六进制转十进制"""
    return int(h, 16)

# 示例：各种进制转换
print(f"十进制 42 = 二进制 {dec_to_bin(42)}")  # 00101010
print(f"二进制 101010 = 十进制 {bin_to_dec('101010')}")  # 42
print(f"十进制 255 = 十六进制 {dec_to_hex(255)}")  # FF

# 有符号数表示：补码
def twos_complement(n, bits=8):
    """计算补码表示"""
    if n >= 0:
        return format(n, f'0{bits}b')
    else:
        # 负数：取反加一
        return format((1 << bits) + n, f'0{bits}b')

def twos_complement_to_dec(b):
    """补码转十进制"""
    bits = len(b)
    n = int(b, 2)
    if n >= (1 << (bits - 1)):  # 最高位为1，是负数
        n -= (1 << bits)
    return n

# 示例：-5的8位补码表示
print(f"-5的8位补码: {twos_complement(-5)}")  # 11111011
print(f"补码11111011 = {twos_complement_to_dec('11111011')}")  # -5

# 常用编码
# BCD码：用4位二进制表示1位十进制
def dec_to_bcd(n):
    """十进制转BCD码"""
    bcd = 0
    shift = 0
    while n > 0:
        digit = n % 10
        bcd |= (digit << shift)
        n //= 10
        shift += 4
    return bcd

# 格雷码：相邻两数只有一位不同
def binary_to_gray(n):
    """二进制转格雷码"""
    return n ^ (n >> 1)

def gray_to_binary(g, bits=8):
    """格雷码转二进制"""
    b = g
    for i in range(1, bits):
        b ^= (g >> i)
    return b

# 示例：格雷码转换
for i in range(8):
    gray = binary_to_gray(i)
    print(f"{i}: 二进制={dec_to_bin(i, 3)}, 格雷码={dec_to_bin(gray, 3)}")
```

### 🔑 逻辑门与布尔代数

```python
# 基本逻辑门实现

def AND(a, b):
    """与门：两个输入都为1时输出1"""
    return a & b

def OR(a, b):
    """或门：至少一个输入为1时输出1"""
    return a | b

def NOT(a):
    """非门：输入取反"""
    return ~a & 1  # 只保留最低位

def NAND(a, b):
    """与非门：与门的反"""
    return NOT(AND(a, b))

def NOR(a, b):
    """或非门：或门的反"""
    return NOT(OR(a, b))

def XOR(a, b):
    """异或门：输入不同时输出1"""
    return a ^ b

def XNOR(a, b):
    """同或门：输入相同时输出1"""
    return NOT(XOR(a, b))

# 验证真值表
print("AND门真值表:")
print("A B | Y")
for a in [0, 1]:
    for b in [0, 1]:
        print(f"{a} {b} | {AND(a, b)}")

print("\nXOR门真值表:")
print("A B | Y")
for a in [0, 1]:
    for b in [0, 1]:
        print(f"{a} {b} | {XOR(a, b)}")

# 布尔代数定律
# 德摩根定律：NOT(A AND B) = NOT(A) OR NOT(B)
#           NOT(A OR B) = NOT(A) AND NOT(B)
def demorgan_verify():
    """验证德摩根定律"""
    for a in [0, 1]:
        for b in [0, 1]:
            left = NOT(AND(a, b))
            right = OR(NOT(a), NOT(b))
            assert left == right, f"德摩根定律验证失败: {a}, {b}"
    print("德摩根定律验证通过!")

demorgan_verify()

# 用NAND门实现所有逻辑门（NAND门是通用门）
def NAND_GATE(a, b):
    return NOT(AND(a, b))

def NOT_FROM_NAND(a):
    """用NAND实现NOT"""
    return NAND_GATE(a, a)

def AND_FROM_NAND(a, b):
    """用NAND实现AND"""
    return NOT_FROM_NAND(NAND_GATE(a, b))

def OR_FROM_NAND(a, b):
    """用NAND实现OR"""
    return NAND_GATE(NOT_FROM_NAND(a), NOT_FROM_NAND(b))

# 验证
print("\n用NAND门实现其他门:")
for a in [0, 1]:
    for b in [0, 1]:
        assert AND(a, b) == AND_FROM_NAND(a, b)
        assert OR(a, b) == OR_FROM_NAND(a, b)
print("NAND门通用性验证通过!")
```

### 🔑 组合逻辑电路

```python
# 组合逻辑：输出只取决于当前输入

# 1. 半加器：实现1位加法
def half_adder(a, b):
    """
    半加器：计算 a + b
    返回：(sum, carry)
    sum = a XOR b
    carry = a AND b
    """
    s = XOR(a, b)
    c = AND(a, b)
    return s, c

# 2. 全加器：实现1位加法（带进位）
def full_adder(a, b, cin):
    """
    全加器：计算 a + b + cin
    返回：(sum, carry)
    """
    s1, c1 = half_adder(a, b)
    s2, c2 = half_adder(s1, cin)
    cout = OR(c1, c2)
    return s2, cout

# 验证全加器
print("全加器真值表:")
print("A B Cin | Sum Cout")
for a in [0, 1]:
    for b in [0, 1]:
        for cin in [0, 1]:
            s, cout = full_adder(a, b, cin)
            print(f"{a} {b} {cin}   | {s}    {cout}")

# 3. 多位加法器
def ripple_carry_adder(a_bits, b_bits):
    """
    行波进位加法器：多位加法
    a_bits, b_bits: 二进制位列表（低位在前）
    """
    n = len(a_bits)
    result = []
    cin = 0
    
    for i in range(n):
        s, cout = full_adder(a_bits[i], b_bits[i], cin)
        result.append(s)
        cin = cout
    
    result.append(cin)  # 最高位进位
    return result

# 示例：4位加法器
a = [1, 0, 1, 0]  # 0101 = 5
b = [1, 1, 0, 0]  # 0011 = 3
result = ripple_carry_adder(a, b)
print(f"5 + 3 = {result[::-1]}")  # [0, 1, 0, 0, 0] = 8

# 4. 译码器
def decoder_2to4(a, b):
    """2-4译码器：2位输入，4位输出"""
    outputs = [0, 0, 0, 0]
    idx = (a << 1) | b
    outputs[idx] = 1
    return outputs

# 5. 编码器
def encoder_4to2(inputs):
    """4-2编码器：4位输入，2位输出（优先编码器）"""
    for i in range(3, -1, -1):  # 从高到低优先
        if inputs[i] == 1:
            return [(i >> 1) & 1, i & 1]
    return [0, 0]

# 6. 多路选择器
def mux_2to1(a, b, sel):
    """2选1多路选择器"""
    return b if sel else a

def mux_4to1(inputs, sel):
    """4选1多路选择器"""
    idx = (sel[0] << 1) | sel[1]
    return inputs[idx]

# 7. 比较器
def comparator_1bit(a, b):
    """1位比较器"""
    eq = NOT(XOR(a, b))  # 相等
    gt = AND(a, NOT(b))  # a > b
    lt = AND(NOT(a), b)  # a < b
    return eq, gt, lt

# 示例
print("\n1位比较器:")
for a in [0, 1]:
    for b in [0, 1]:
        eq, gt, lt = comparator_1bit(a, b)
        print(f"a={a}, b={b}: EQ={eq}, GT={gt}, LT={lt}")
```

### 🔑 时序逻辑电路

```python
# 时序逻辑：输出取决于输入和当前状态

# 1. D触发器（边沿触发）
class DFlipFlop:
    """D触发器：时钟上升沿采样"""
    def __init__(self):
        self.q = 0  # 输出
    
    def clock(self, d, clk):
        """时钟上升沿触发"""
        if clk == 1:
            self.q = d
        return self.q
    
    def reset(self):
        """异步复位"""
        self.q = 0

# 2. JK触发器
class JKFlipFlop:
    """JK触发器"""
    def __init__(self):
        self.q = 0
    
    def clock(self, j, k, clk):
        """时钟上升沿触发"""
        if clk == 1:
            if j == 0 and k == 0:
                pass  # 保持
            elif j == 0 and k == 1:
                self.q = 0  # 复位
            elif j == 1 and k == 0:
                self.q = 1  # 置位
            else:  # j == 1 and k == 1
                self.q = NOT(self.q)  # 翻转
        return self.q

# 3. 计数器
class Counter:
    """同步计数器"""
    def __init__(self, bits=4):
        self.bits = bits
        self.value = 0
    
    def clock(self, enable=True):
        """时钟上升沿计数"""
        if enable:
            self.value = (self.value + 1) % (1 << self.bits)
        return self.value
    
    def reset(self):
        self.value = 0
    
    def get_bits(self):
        """返回二进制位列表"""
        return [(self.value >> i) & 1 for i in range(self.bits)]

# 示例：4位计数器
print("\n4位计数器:")
counter = Counter(4)
for i in range(18):
    val = counter.clock()
    bits = counter.get_bits()
    print(f"时钟{i}: 值={val}, 二进制={bits[::-1]}")

# 4. 移位寄存器
class ShiftRegister:
    """移位寄存器"""
    def __init__(self, bits=8):
        self.bits = bits
        self.data = [0] * bits
    
    def shift_left(self, din=0):
        """左移"""
        self.data = self.data[1:] + [din]
        return self.data
    
    def shift_right(self, din=0):
        """右移"""
        self.data = [din] + self.data[:-1]
        return self.data
    
    def load(self, data):
        """并行加载"""
        self.data = data[-self.bits:]
        return self.data
    
    def get_value(self):
        """获取当前值"""
        return sum(b << i for i, b in enumerate(self.data))

# 示例：移位寄存器
print("\n移位寄存器:")
sr = ShiftRegister(4)
sr.load([1, 0, 1, 1])
print(f"初始值: {sr.data[::-1]} = {sr.get_value()}")

sr.shift_left(1)
print(f"左移后: {sr.data[::-1]} = {sr.get_value()}")

sr.shift_right(0)
print(f"右移后: {sr.data[::-1]} = {sr.get_value()}")

# 5. 状态机（有限状态机 FSM）
class TrafficLightFSM:
    """交通灯状态机"""
    STATES = {
        'RED': {'next': 'GREEN', 'output': '红灯停'},
        'GREEN': {'next': 'YELLOW', 'output': '绿灯行'},
        'YELLOW': {'next': 'RED', 'output': '黄灯等'}
    }
    
    def __init__(self):
        self.state = 'RED'
        self.timer = 0
    
    def transition(self):
        """状态转换"""
        self.timer += 1
        
        # 状态转换条件
        if self.state == 'RED' and self.timer >= 3:
            self.state = 'GREEN'
            self.timer = 0
        elif self.state == 'GREEN' and self.timer >= 5:
            self.state = 'YELLOW'
            self.timer = 0
        elif self.state == 'YELLOW' and self.timer >= 2:
            self.state = 'RED'
            self.timer = 0
    
    def get_output(self):
        return self.STATES[self.state]['output']

# 示例：交通灯
print("\n交通灯状态机:")
traffic = TrafficLightFSM()
for i in range(15):
    print(f"时间{i}: {traffic.get_output()}")
    traffic.transition()
```

### 🔑 FPGA入门

```python
# FPGA（现场可编程门阵列）基础概念

# FPGA核心资源
fpga_resources = {
    'LUT': '查找表，实现任意逻辑函数',
    'FF': '触发器，存储1位数据',
    'BRAM': '块RAM，存储大量数据',
    'DSP': '数字信号处理单元，乘法累加',
    'IO': '输入输出引脚',
    'PLL': '锁相环，时钟管理'
}

# FPGA设计流程
fpga_flow = [
    '1. 设计输入：Verilog/VHDL代码或原理图',
    '2. 功能仿真：验证逻辑正确性',
    '3. 综合：RTL转换为门级网表',
    '4. 布局布线：映射到FPGA资源',
    '5. 时序分析：检查时序约束',
    '6. 生成比特流：下载到FPGA'
]

# Verilog基础示例
verilog_examples = '''
// 基本逻辑门
module basic_gates(
    input a,
    input b,
    output and_out,
    output or_out,
    output xor_out
);
    assign and_out = a & b;
    assign or_out = a | b;
    assign xor_out = a ^ b;
endmodule

// D触发器
module d_ff(
    input clk,
    input rst,
    input d,
    output reg q
);
    always @(posedge clk or posedge rst) begin
        if (rst)
            q <= 1'b0;
        else
            q <= d;
    end
endmodule

// 4位计数器
module counter_4bit(
    input clk,
    input rst,
    input enable,
    output reg [3:0] count
);
    always @(posedge clk or posedge rst) begin
        if (rst)
            count <= 4'b0000;
        else if (enable)
            count <= count + 1;
    end
endmodule

// 状态机（Moore型）
module traffic_light(
    input clk,
    input rst,
    output reg [1:0] state,
    output reg [2:0] light  // R, Y, G
);
    parameter RED = 2'b00, GREEN = 2'b01, YELLOW = 2'b10;
    
    always @(posedge clk or posedge rst) begin
        if (rst) begin
            state <= RED;
            light <= 3'b100;  // 红灯
        end
        else begin
            case (state)
                RED: begin
                    state <= GREEN;
                    light <= 3'b001;  // 绿灯
                end
                GREEN: begin
                    state <= YELLOW;
                    light <= 3'b010;  // 黄灯
                end
                YELLOW: begin
                    state <= RED;
                    light <= 3'b100;  // 红灯
                end
                default: state <= RED;
            endcase
        end
    end
endmodule
'''

print("FPGA核心资源:")
for k, v in fpga_resources.items():
    print(f"  {k}: {v}")

print("\nFPGA设计流程:")
for step in fpga_flow:
    print(f"  {step}")

# FPGA时序约束概念
timing_concepts = '''
时序约束关键概念：
1. 时钟周期：决定电路最高工作频率
2. 建立时间（Setup Time）：数据在时钟沿前必须稳定的时间
3. 保持时间（Hold Time）：数据在时钟沿后必须稳定的时间
4. 时钟偏斜（Clock Skew）：时钟到达不同寄存器的时间差

时序约束示例（Xilinx）：
create_clock -period 10 [get_ports clk]  # 100MHz时钟
set_input_delay -clock clk 2 [all_inputs]
set_output_delay -clock clk 3 [all_outputs]
'''
```

## 完整跑通方案

**第一步：使用数字逻辑仿真工具**

```python
# 使用Python仿真数字电路
# 安装：pip install digital

# 简单的仿真框架
class DigitalSimulator:
    """数字电路仿真器"""
    
    def __init__(self):
        self.signals = {}
        self.components = []
    
    def add_signal(self, name, initial=0):
        self.signals[name] = initial
    
    def add_component(self, func, inputs, output):
        """添加组合逻辑组件"""
        self.components.append({
            'func': func,
            'inputs': inputs,
            'output': output
        })
    
    def update(self):
        """更新所有信号"""
        for comp in self.components:
            inputs = [self.signals[i] for i in comp['inputs']]
            self.signals[comp['output']] = comp['func'](*inputs)
    
    def set_input(self, name, value):
        self.signals[name] = value
        self.update()
    
    def get_signal(self, name):
        return self.signals[name]

# 示例：仿真一个简单电路
sim = DigitalSimulator()
sim.add_signal('a')
sim.add_signal('b')
sim.add_signal('and_out')
sim.add_signal('or_out')
sim.add_signal('xor_out')

sim.add_component(AND, ['a', 'b'], 'and_out')
sim.add_component(OR, ['a', 'b'], 'or_out')
sim.add_component(XOR, ['a', 'b'], 'xor_out')

print("\n数字电路仿真:")
print("A B | AND OR XOR")
for a in [0, 1]:
    for b in [0, 1]:
        sim.set_input('a', a)
        sim.set_input('b', b)
        print(f"{a} {b} | {sim.get_signal('and_out')}   {sim.get_signal('or_out')}   {sim.get_signal('xor_out')}")
```

**第二步：使用在线仿真工具**

推荐工具：
- **CircuitVerse**：https://circuitverse.org/ - 在线数字电路仿真
- **Logisim**：免费开源，适合学习
- **Digital**：Android应用，移动端仿真

**第三步：FPGA开发实践**

```python
# FPGA开发环境搭建指南

fpga_setup = '''
推荐FPGA开发板：
1. 入门级：TinyFPGA、iCEStick（约$20-50）
2. 中级：Artix-7开发板（约$100-200）
3. 高级：Zynq系列（ARM+FPGA）

开发工具：
1. Intel: Quartus Prime（免费版）
2. Xilinx: Vivado（免费版WebPACK）
3. Lattice: iCEcube2 / Diamond
4. 开源: yosys + nextpnr

学习路径：
1. 先用仿真工具理解逻辑
2. 再用FPGA实现简单电路
3. 逐步增加复杂度
'''
```

**第四步：实际项目示例**

```python
# 实际项目：4位ALU设计

def alu_4bit(a, b, op):
    """
    4位算术逻辑单元
    op: 操作码
        000: 加法
        001: 减法
        010: 与
        011: 或
        100: 异或
        101: 非
        110: 左移
        111: 右移
    """
    a_val = a if isinstance(a, int) else sum(b << i for i, b in enumerate(a))
    b_val = b if isinstance(b, int) else sum(b << i for i, b in enumerate(b))
    
    if op == 0b000:  # 加法
        result = (a_val + b_val) & 0xF
        zero = 1 if result == 0 else 0
        carry = 1 if (a_val + b_val) > 15 else 0
    elif op == 0b001:  # 减法
        result = (a_val - b_val) & 0xF
        zero = 1 if result == 0 else 0
        carry = 1 if a_val < b_val else 0
    elif op == 0b010:  # 与
        result = a_val & b_val
        zero = 1 if result == 0 else 0
        carry = 0
    elif op == 0b011:  # 或
        result = a_val | b_val
        zero = 1 if result == 0 else 0
        carry = 0
    elif op == 0b100:  # 异或
        result = a_val ^ b_val
        zero = 1 if result == 0 else 0
        carry = 0
    elif op == 0b101:  # 非
        result = (~a_val) & 0xF
        zero = 1 if result == 0 else 0
        carry = 0
    elif op == 0b110:  # 左移
        result = (a_val << 1) & 0xF
        zero = 1 if result == 0 else 0
        carry = (a_val >> 3) & 1
    elif op == 0b111:  # 右移
        result = (a_val >> 1) & 0xF
        zero = 1 if result == 0 else 0
        carry = a_val & 1
    else:
        result = 0
        zero = 0
        carry = 0
    
    return result, zero, carry

# 测试ALU
print("\n4位ALU测试:")
ops = ['ADD', 'SUB', 'AND', 'OR', 'XOR', 'NOT', 'SHL', 'SHR']
for i, op_name in enumerate(ops):
    a, b = 10, 3  # 测试值
    result, zero, carry = alu_4bit(a, b, i)
    print(f"{op_name}: {a} op {b} = {result} (Z={zero}, C={carry})")
```

## 常见误区

**误区 1：忽视建立时间和保持时间 → 时序违规**

解释：触发器在时钟沿前后需要数据稳定一段时间。建立时间不足会导致数据采样错误，保持时间不足会导致数据竞争。在高速设计中必须仔细分析时序。

**误区 2：异步复位导致亚稳态 → 系统不稳定**

解释：异步复位信号可能在任何时刻释放，与时钟不同步会导致触发器进入亚稳态。推荐使用同步复位或异步复位同步释放的设计。

**误区 3：组合逻辑环路 → 振荡或锁死**

解释：组合逻辑输出反馈到输入会形成环路，可能导致振荡或不确定状态。必须确保所有组合逻辑路径都是无环的。

**误区 4：时钟域交叉不处理 → 数据损坏**

解释：不同时钟域之间的数据传输需要同步处理（如双触发器同步、FIFO）。直接跨时钟域传输会导致数据损坏或系统崩溃。

**误区 5：FPGA资源使用不当 → 性能下降**

解释：FPGA的LUT、BRAM、DSP等资源有限。不合理的使用会导致资源浪费或时序无法满足。应充分利用专用资源（如DSP做乘法，BRAM做存储）。

## 学习资源推荐

**在线课程**
- Coursera: "Digital Systems" by Universitat Autònoma de Barcelona
- edX: "Introduction to Digital Circuit Design" by MIT
- B站: 西安电子科技大学《数字电路与逻辑设计》

**经典教材**
- 《数字电子技术基础》（阎石）- 国内经典教材
- 《Digital Design》（Morris Mano）- 国际经典教材
- 《FPGA原理和结构》- FPGA深入学习

**仿真工具**
- Logisim: https://sourceforge.net/projects/circuit/ - 免费开源
- CircuitVerse: https://circuitverse.org/ - 在线仿真
- ModelSim: 专业HDL仿真工具

**FPGA开发**
- TinyFPGA: https://tinyfpga.com/ - 入门开发板
- FPGA4Fun: https://www.fpga4fun.com/ - 学习资源
- ZipCPU: https://zipcpu.com/ - FPGA设计博客

**实践项目**
- 数字时钟：计数器+译码器+显示
- 交通灯控制器：状态机设计
- 简易CPU：ALU+寄存器+控制器
- VGA显示：时序生成+像素输出