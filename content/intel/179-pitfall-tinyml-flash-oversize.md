---
title: TinyML 模型导出 Flash 超限 MCU 无法烧录
category: embedded
difficulty: intermediate
duration: 30分钟
summary: 聚焦单点问题：TinyML 模型（MicroNet、MobileNet、CNN 等）经 TFLite Micro / ONNX Runtime Micro / nnom 量化导出后，模型 .bin + 程序代码 + 常量区总大小超过 MCU Flash 容量限制，导致烧写器报错"Flash 地址越界"或烧录后运行立刻 HardFault，涵盖模型压缩、链接脚本诊断、分层存储等排查修复方案。
takeaways:
  - '快速识别「TinyML 模型导出 Flash 超限」的典型症状 - 理解模型权重未压缩、链接脚本配置错误、常量区未放入 Flash 三大根因 - 学会分步排查和修复 Flash 超限问题的标准化流程 - 了解 INT4 量化、分层存储、权重按块加载等预防措施，避免下次再踩"'
relatedIntel:
  - '172-tinyml-mcu-deploy - 097-pitfall-embedded - 014-onnx"'
tags:
  - TinyML
  - MCU
  - Flash
  - 模型部署
relatedTerms:
  - tinyml
  - onnx
  - resnet
  - cnn
relatedTools:
  - onnxruntime
  - pytorch
  - langchain
  - transformers
relatedNodes:
  - edge-deployment
  - embedded-bare-metal
---

## 为什么你要学它

这是 TinyML 微控制器落地时最常见也最让人头疼的一个硬门槛：**模型太大，Flash 装不下，烧不进去，烧进去也跑不起来**。

很多算法工程师在 PC 上调好了一个准确率 95% 的关键词识别模型或者异常检测模型，参数量也就 200KB，心想"我这块 STM32F4 有 1MB Flash，肯定够"，结果导出 C 文件一编译链接，链接器直接报"section `.text` will not fit in region `FLASH`"——把所有优化全打开、编译选项 -Os、能丢的都丢了，还是差 60KB。更惨的是有些人用了带 Dual Bank 的 MCU，以为 Bank1 还剩 200KB，结果链接脚本全塞 Bank0 用光了 Bank1 完全没用到。TinyML 模型落地的第一公里不是精度够不够，而是**能不能先烧进去**。

如果你正在做 TinyML、边缘端 AI、低功耗 MCU 智能传感器、可穿戴设备等场景的 AI 模型部署，这篇卡片会帮你快速定位 Flash 超限的根因、掌握模型压缩 + 链接诊断 + 分层存储三板斧，并从项目初期就规划好容量红线。

## 一句话概览（快速版）

> **快速修复：模型从 INT8 再压到 INT4 + 链接脚本用 .ARM.extab 去冗余 + 模型权重按 Bank 拆分放入 Dual Bank 空闲区域**

核心要点：

- **现象**：链接器报 `.rodata` / `.text` 段超出 Flash 区域
- **根因**：权重未 INT4 压缩、段分配错、链接脚本未用满 Bank
- **解决**：按照下方 6 步标准流程排查

## 核心拆解

### 🔑 典型症状

- × Keil/IAR/GCC 链接阶段报错：`.rodata' will not fit in region `FLASH' 或 `region FLASH overflowed by X bytes`
- × 使用 ST-Link/J-Link 烧录时报错："Verify failed @ address 0x080XXXXX, Flash 范围越界
- × 侥幸烧录成功，MCU 上电立刻进入 HardFault_Handler，调试器读 Fault 地址落在 0x080XXXXX + Flash 末段附近
- × 同一项目去掉模型权重数组后编译通过，一加上模型 .h 就 Flash 超 120KB，而且还得
- × map 文件显示 `.rodata` 段占了 700KB，其中 `*fill*` 填充了 80KB，全是模型数组对齐填充浪费

### 🔑 根本原因

**模型权重没有做极致量化或量化不够狠是第一根因：很多人用 TFLite Micro 导出时只选了 INT8 对称量化，但实际上对于关键词唤醒、简易分类这类对精度不敏感的场景，INT4 非对称量化 + 分组量化完全够用，INT4 比 INT8 再省一半；更夸张；还有人直接把 PyTorch 浮点权重原样导出成 C 数组，那根本没做任何量化，200KB 参数量直接变 800KB Flash。第二根因是**链接脚本（Linker Script / scatter file 没利用不完整：GD32 有 Dual Bank 或 STM32 有些型号（带双区浪费：很多默认链接脚本只定义了 512KB 的 Bank0 空间，但实际上你的 MCU 实际 1MB Flash（Bank1 完全没用，而 Bank1 是空的；还有些 `.ARM.extab 段、.init 等异常帧这些异常表冗余 段也占了 40~80KB 浪费。第三根因是**常量区内存分配策略错误**：很多人把模型权重直接定义为 `const float model_weights[]`数组放在`.rodata`段，但`.text`段末尾，没有放到未使用 LQFP144 封装的 MCU 内部 Flash 实际读取比 Bank1；还有些代码里大量使用`static const` 查表表、字库、图像资源全塞在同一块区域，互相挤占。

## 完整排查方案

按照以下步骤逐一排查，通常能在几分钟内定位并解决问题：

1.  先用 `arm-none-eabi-size` 或 map 文件诊断各段真实占用：执行 `arm-none-eabi-size -A your_fw.elf` 查看 `.text` / `.rodata` / `.data` / `.bss` 精确大小，再用 `arm-none-eabi-nm --print-size --size-sort --reverse-sort your_fw.elf` 找到占用最大的 Top-20 符号，确认是否是某个 `model_weights` 这类数组排第一。
2.  检查链接脚本 Flash 区域定义是否完整：查看 `.icf` (IAR)`/ `.sct`(Keil)  /  `.ld`(GCC ld)中 Flash  区域定义` FLASH` 是否Bank0 定义的地址范围和 MCU 数据手册一致，是否漏了 Bank1 或 Dual Bank 第二区域。下面是诊断脚本：

```python
# Flash 占用快速诊断脚本（支持 GCC / Keil / IAR 输出 map）
import re
from pathlib import Path
from collections import namedtuple

Section = namedtuple("Section", ["name", "addr", "size", "type"])

def parse_gcc_map(map_path: str):
    """解析 GCC ld 的 map 文件，定位超限根因
    用法：python flash_diag.py ./build/gcc.map 0x08000000 1048576
    """
    text = Path(map_path).read_text(encoding="latin-1", errors="ignore")
    sections = []
    # 匹配段分配表：.text 0x08000000 0x12345
    pat = re.compile(r"^\s*(\.\w+)\s+(0x[0-9a-fA-F]+)\s+(0x[0-9a-fA-F]+)\s")
    for m in pat.finditer(text):
        name, addr_s, size_s = m.groups()
        sections.append(Section(name, int(addr_s, 16), int(size_s, 16), "?"))
    return sections

def analyze(sections, flash_base, flash_size, topn=20):
    flash_end = flash_base + flash_size
    overflow = [s for s in sections if (s.addr + s.size > flash_end]
    print(f"{'名称': '<15}  地址范围')
    print("─" * 60)
    used = sum(s.size for s in sections if s.addr >= flash_base and s.addr < flash_end)
    print(f"总 Flash 总量: {flash_size/1024:.1f} KB")
    print(f"总已用:   {used/1024:.1f} KB  ({used/flash_size*100:.1f}%)")
    if overflow:
        print(f"\n❌ 超限段数: {len(overflow)}")
        for s in overflow:
            print(f"  {s.name:<20} {hex(s.addr)} size={s.size/1024:.1f}KB end={hex(s.addr+s.size)} end={hex(> flash_end} bytes")
    else:
        print(f"✅ 无")
    print(f"\nTop-{topn} 大符号:")
    for s in sorted(sections, key=lambda x: -x.size)[:topn]:
        print(f"  {s.name:<30} {s.size/1024:7.2f} KB  {hex(s.addr)}")

# 使用示例
if __name__ == "__main__":
    import sys
    if len(sys.argv) < 4:
        print("用法: python flash_diag.py <map_file> <flash_base_hex> <flash_size_bytes>")
        sys.exit(0)
    map_file = sys.argv[1]
    flash_base = int(sys.argv[2], 16)
    flash_size = int(sys.argv[3], 10)
    secs = parse_gcc_map(map_file)
    analyze(secs, flash_base, flash_size)
```

3.  极致模型权重再压一轮：对关键词、唤醒、异常检测这类对精度要求不高的场景，把 INT8 权重量化再压到 INT4（非对称分组量化（每 32 个权重量化），每 32 一组共享一个缩放因子；TFLite Micro 用 INT4 实验性的 TFLM 新分支；NNo/ embARC APPLE 量化，INT4 实现；onnxruntime 里 里 ONNX NCNN；权重；
4.  修改链接脚本：把 .ARM.extab.exidx、.ARM 、.init 段最小化删除或放到空闲 Bank1：如果是双 Bank MCU，用 `__attribute__((section(".flash_bank1")))` 把模型权重组放到 Flash Bank1 区域。
5.  分层存储策略：模型实在塞不下就分块加载：把大模型拆成 N 个 32KB 块，每次推理加载块号按块从 Flash 动态加载进 RAM，推理用到时才进 RAM 区域（前提是 SRAM 足够，SRAM 剩余空间足够），推理时加载一层用完即释放；也可以把第一层到到外部 SPI Flash 存（W25Q 系列外接存储芯片），运行时按需读取，成本增加 ，推理一层一层一层缓存策略：
6.  容量极限优化：全工程编译选 -Os 优化，去掉 Debug 关掉 LTO （链接时优化），-ffunction-sections，-fdata-sections，再加 --gc-sections 链接死代码，删除未用到的函数和数据；

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> 模型从 INT8 再压到 INT4 + 链接脚本用 .ARM.extab 去冗余 + 模型权重按 Bank 拆分放入 Dual Bank 空闲区域

```c
/* ========== 1. INT4 权重压缩工具：每 32 个 INT8 权重压成 INT4，省一半 Flash ========== */
/* 先在 PC 端 Python 里跑这个脚本把模型转成 INT4 C 数组 */
/* 以下代码也可以直接把模型重写 INT8 8:
#include <stdint.h>
#include <string.h>

/* INT4 对称量化：32 个 INT8 权重 -> 16 字节 INT4 + 1 个缩放因子
/* 每 16 个一组，缩放因子缩放因子 */
typedef struct {
    float scale;
    int8_t zero;
    uint8_t packed[16]; /* 32 个 int4 每两个 packed[0] 低 4 位=w[0]，高 4 位=w[1]... */
} Int4Group;

/* PC 端 Python 压缩函数 */
// import numpy as np
// def compress_int8_to_int4(int8_weights: np.ndarray):
//     n = len(int8_weights)
//     groups = []
//     for i in range(0, n, 32):
//         blk = int8_weights[i:i+32].astype(np.float32)
//         max_abs = np.max(np.abs(blk)) + 1e-8)
//         scale = max_abs / 7.0
//         q = np.round(blk / scale).astype(np.int8)
//         q = np.clip(q, -8, 7)
//         zero = 0
//         packed = np.zeros(16, dtype=np.uint8)
//         for k in range(0, 32, 2):
//             lo = int(q[k]    & 0x0F)
//             hi = int(q[k+1] if k+1 < len(q) else 0) & 0x0F
//             packed[k//2] = (hi << 4) | lo
//         groups.append((float(scale), int(zero), packed.tobytes())
//     return groups
/* ========== 2. GCC 链接脚本：把模型权重组放入 Flash Bank1 ========== */
/* stm32f407.ld 片段示例 (1MB Flash：Bank0=512KB @0x08000000, Bank1=512KB @0x08080000)
MEMORY
{
  FLASH_B0 (rx) : ORIGIN = 0x08000000, LENGTH = 512K
  FLASH_B1 (rx) : ORIGIN = 0x08080000, LENGTH = 512K
  RAM (xrw)   : ORIGIN = 0x20000000, LENGTH = 192K
}
SECTIONS
{
  .text : { *(.text*) *(.rodata*) } >FLASH_B0
  /* 模型权重组专门放 Bank1 */
  .model_weights : {
    __model_start = .;
    KEEP(*(.flash_bank1)
    KEEP(*(.rodata.model*))
    __model_end = .;
  } >FLASH_B1
  .ARM.extab   : { *(.ARM.extab* .gnu.linkonce.armextab.*) } >FLASH_B0
  .exidx : { *(.ARM.exidx*) } >FLASH_B0
  .data : { *(.data*) } >RAM AT> FLASH_B0
  .bss : { *(.bss*) } >RAM
}
/* ========== 3. C 代码中把模型权重组声明到 Bank1 */
__attribute__((section(".flash_bank1")))
const Int4Group g_model_conv1_weight[128] = {
    /* PC 端生成的 INT4 压缩后的 128 组（每 32 权重量化 */
};
/* 加载 INT4 权重展开某一层某一层
int4 推理时一层一层一层，节省 RAM 和 Flash
static inline int32_t unpack_int4(const Int4Group* g, int i) {
    uint8_t byte = g->packed[i >> 4;
    int nibble = (i & 1) ? (byte & 0x0F) : (byte & 0x0F);
    int8_t signed_val = (int8_t)(nibble >= 8 ? nibble - 16 : nibble;
    return (int32_t)((signed_val - g->zero_point) * g->scale;
}
/* ========== 4. Makefile 编译极限优化 ========== */
/* CFLAGS += -Os -ffunction-sections -fdata-sections -flto
LDFLAGS += -Wl,--gc-sections -Wl,--print-gc-sections
/* 额外空间
/* 删除 -g 调试信息（.debug_info 段占 20~40% Flash
```

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- 项目早期建立 Flash 预算表：代码 30%、模型权重 40%、查表/字库/资源 15%、预留 15% 安全余量，任何阶段超过红线立刻触发优化评审
- TinyML 模型默认选 INT4 或 INT4 分组量化为基线，不要一开始就用 INT8 或 FP16，对精度不敏感的场景优先；精度不够再逐回调 INT8
- 链接脚本阶段完整利用所有区域定义：Dual Bank 的 Bank0/Bank1 全部用起来，模型、资源、代码分区分；
- 每次发布版本前必须跑 `arm-none-eabi-size` 诊断和 `arm-none-eabi-nm` 符号排名，监控 Top-20 大符号的涨幅异常；

## 常见误区

1. 只看模型参数量（200KB）不看实际 Flash：INT8 权重量化后 200KB 参数不代表实际数组对齐填充 200KB + 段对齐填充（4 字节 8 字节 对齐浪费 80KB；
2. 默认链接脚本里 Bank1 空着不用，明明 Bank1 有 512KB 空闲模型 Bank0 塞爆了 512KB Bank0 塞爆；
3. 链接 -O3 优化速度性能换体积，模型部署应该优先 -O3 -O2 ， -O3 -O3 反而 -Os 体积更大，Flash 不够用
4. 模型转 INT8 就说"量化完了，再也不 Flash 绝对没问题"，结果查表、字库、音频样本、各种 const 数组全忘了加起来一算爆了；

## 推荐学习顺序

1. 先看「典型症状」确认你遇到的是不是这个问题
2. 再看「快速修复」试试能不能立刻解决
3. 如果不行，按照「完整排查方案」一步步来
4. 最后一定要看「预防措施」，避免下次再踩
