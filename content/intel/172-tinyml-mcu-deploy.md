---
title: TinyML 模型在 MCU 上部署（CMSIS-NN / ONNX Micro）
category: embedded
difficulty: advanced
duration: 2周
summary: 把机器学习模型从云端搬到资源极度受限的 8/32 位 MCU，实现电池供电、毫秒级响应的边缘智能。覆盖 PyTorch 训练 → INT8 量化 → ONNX 导出 → CMSIS-NN / ONNX Micro 推理 → STM32 裸机部署全流程，解决 RAM/Flash 双瓶颈。
keywords: [TinyML, MCU, CMSIS-NN, ONNX Micro, INT8量化, STM32, 边缘部署]
takeaways:
  - 搞懂 MCU 上 TinyML 的资源天花板：Flash < 1MB、RAM < 512KB、算力 < 100M MAC/s
  - 理解训练后量化（PTQ）与量化感知训练（QAT）的精度-部署难度权衡
  - 能画出 PyTorch → ONNX → CMSIS-NN C 代码 → Keil/IAR 编译 → STM32 烧录的链路图
  - 能跑通关键词唤醒 KWS 模型的 INT8 量化 + CMSIS-NN 推理完整流程
  - 实现基于 ONNX Micro 的手势识别模型部署，并测量 RAM/Flash/推理时延
tags: [embedded, TinyML, MCU, CMSIS-NN, ONNX Micro, INT8量化, STM32]
relatedTerms: [onnx, rtos, operating-system, matrix, circuit, cnn, pointer, algorithm]
relatedTools: [onnx-runtime, stm32cubemx, gcc, esp-idf, freertos, onnxruntime-genai]
relatedNodes: [embedded-rtos, embedded-hal, embedded-rtos, embedded-hal]
---

## 为什么你要学它

传统 IoT 设备的智能都在云端：传感器采原始数据通过 WiFi/4G 上传到服务器，服务器跑完 AI 模型再把指令发下来。但这个模式在很多场景根本跑不通——**工业产线的振动传感器装在电机上，旁边没有网线和电源，靠纽扣电池要撑 3 年**；**智能门锁做人脸识别，断网了也必须能开门，而且开锁响应必须 < 300ms**；**可穿戴心电设备做早搏检测，原始 ECG 信号 24 小时不间断，如果全部上传，一天流量费比设备本身还贵，而且隐私数据还不能出设备**。

TinyML 就是解决这些问题的钥匙：把原本要在云端跑的 AI 模型压缩优化后，直接跑到资源极其受限的 8 位（AVR/PIC）或 32 位（STM32/ESP32/NRF52）MCU 上。Flash 几十 KB 到 1MB、RAM 几 KB 到 512KB、主频几十 MHz 到 200MHz，功耗低到微安级——但就是这样的"玩具级算力"，只要模型和部署做得到位，照样能做关键词唤醒（KWS）、人体检测、手势识别、心电异常检测、设备故障诊断等一系列智能任务。**每跑 1 次推理只花几毫秒、几微焦耳电量**，一颗纽扣电池能跑半年到几年。

实际落地场景包括但不限于：

- **消费电子**：TWS 耳机的"嘿 Siri"/"小爱同学"关键词唤醒、智能手表的跌倒检测与自动报警
- **工业物联网**：旋转电机的振动异常诊断（用三轴加速度数据做分类）、仪表表盘指针的 OCR 读数、产线传送带的异物检测
- **智慧农业**：低功耗土壤传感器上的土壤湿度趋势预测 + 自动灌溉决策、温室大棚 CO2/温湿度多输入的病害预警
- **智慧医疗**：贴片式心电设备的实时早搏/房颤检测（1 导联 ECG）、可穿戴血氧仪的睡眠呼吸暂停识别
- **智能家居**：电池供电的 PIR + 毫米波人体存在传感器（区分"真的有人"还是空调吹的窗帘动）、智能灯开关的离线语音控制（5~10 个命令词）

## 一句话概览（快速版）

1. **TinyML 资源铁三角 = Flash 存权重 + RAM 存激活 + 算力扛 MAC**。选型第一件事不是选模型，而是把目标 MCU 的这三个数写下来：**STM32F4 = 1MB Flash / 192KB RAM / 168MHz**，**STM32H7 = 2MB Flash / 1MB RAM / 480MHz**，**ESP32-S3 = 8MB Flash / 512KB SRAM / 240MHz**，模型大小 + 推理中间激活必须在这两个内存上限内，算力必须满足"推理一次耗时 < 业务要求延迟"。
2. **模型压缩三件套 = 剪枝（Pruning）+ 结构化稀疏 + INT8 量化**。先剪枝把不重要的权重删掉 50~90%，再做结构化稀疏（保证剪完后维度是 8/16 的倍数方便 CMSIS-NN 向量化），最后 INT8 量化把 FP32 的权重和激活全部换成 8 位整数，**模型体积砍 75%、RAM 砍 75%、推理速度提 2~~4 倍，精度掉 1~~3% 以内**。
3. **两大推理引擎选型**：**CMSIS-NN** 是 ARM 官方为 Cortex-M 系列写的手搓 SIMD 优化库，性能极致、占资源最小，但必须走 **TensorFlow Lite Micro → 转换工具** 或手写 Numpy 权重生成 C 数组，灵活性差；**ONNX Micro（μONNX / ONNX Runtime for Microcontrollers）** 支持的算子更多、和 PyTorch 端到端链路更顺，但比 CMSIS-NN 多占 20~30% Flash。**Cortex-M4/M7 有 DSP 指令集，优先 CMSIS-NN；其他架构或算子 CMSIS-NN 不支持时选 ONNX Micro**。

## 核心拆解

### 🔑 训练后 INT8 量化 + PyTorch 导出 CMSIS-NN 可解析格式

模型端的核心是"量化"：MCU 没有浮点运算单元（FPU 有的话也是单精度且很慢），整数运算才是王道。INT8 把每个权重和激活从 32-bit float 变成 8-bit int，权重体积直接 ×0.25。更重要的是，Cortex-M4/M7 的 DSP 扩展指令（SMLAD/SMLADX）一次能做 2 个 16×16+64 的乘加，INT8 乘加折算下来单周期能跑 2 个 MAC，比 FP32 快一个数量级。

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import struct
from pathlib import Path

# ========== 1. 定义一个 TinyML 友好的模型：MFCC + 小 CNN 的 KWS 关键词唤醒 ==========
# 任务：输入 1 秒 16kHz 音频 -> 输出 10 类（静音/未知/yes/no/up/down/left/right/on/off）
class KWSTinyCNN(nn.Module):
    """
    输入：40 维 MFCC × 49 帧 ≈ 1 秒音频（TensorFlow Speech Commands 数据集）
    模型大小：~25KB (INT8)，推理中间激活 < 10KB RAM
    """
    def __init__(self, num_classes: int = 10):
        super().__init__()
        # 所有卷积用 3x3，步长 2 下采样，通道数保持为 8 的倍数（CMSIS-NN 向量化要求）
        self.conv1 = nn.Conv2d(1, 16, kernel_size=(3, 3), stride=(2, 2), padding=(1, 1), bias=False)
        self.bn1 = nn.BatchNorm2d(16)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=(3, 3), stride=(2, 2), padding=(1, 1), bias=False)
        self.bn2 = nn.BatchNorm2d(32)
        self.conv3 = nn.Conv2d(32, 32, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
        self.bn3 = nn.BatchNorm2d(32)
        # 全局平均池化替代全连接：省参数 + 省中间激活
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc = nn.Linear(32, num_classes, bias=True)

    def forward(self, x):
        # x: [B, 1, 49, 40]  (时间帧 × MFCC 维)
        x = F.relu(self.bn1(self.conv1(x)))   # -> [B, 16, 25, 20]
        x = F.relu(self.bn2(self.conv2(x)))   # -> [B, 32, 13, 10]
        x = F.relu(self.bn3(self.conv3(x)))   # -> [B, 32, 13, 10]
        x = self.pool(x).flatten(1)           # -> [B, 32]
        return self.fc(x)                     # -> [B, 10]

model = KWSTinyCNN()
# 假设已经在 Speech Commands 上训练好了 FP32 模型，acc≈91%
model.load_state_dict(torch.load("./kws_tinycnn_fp32.pt", map_location="cpu"))
model.eval()

# ========== 2. 训练后量化（PTQ，Post-Training Quantization）==========
# 步骤：拿 1000 条校准数据过一遍模型，记录每一层激活的 min/max -> 算缩放因子 scale
def calibrate(model, calib_loader, num_batches: int = 20):
    """采集激活的动态范围，存字典"""
    act_range = {}
    hooks = []
    def make_hook(name):
        def hook(m, inp, out):
            out_np = out.detach().cpu().numpy().astype(np.float32)
            lo, hi = out_np.min(), out_np.max()
            if name not in act_range:
                act_range[name] = (lo, hi)
            else:
                old_lo, old_hi = act_range[name]
                act_range[name] = (min(old_lo, lo), max(old_hi, hi))
        return hook
    for name, mod in model.named_modules():
        if isinstance(mod, (nn.Conv2d, nn.BatchNorm2d, nn.Linear, nn.ReLU)):
            hooks.append(mod.register_forward_hook(make_hook(name)))
    with torch.no_grad():
        for i, (mfcc, _) in enumerate(calib_loader):
            if i >= num_batches:
                break
            model(mfcc)
    for h in hooks: h.remove()
    return act_range

# (实际项目里 calib_loader 是 DataLoader 加载 Speech Commands 的验证集 1000 条)
# 这里用随机模拟校准数据
dummy_calib = [(torch.randn(32, 1, 49, 40), torch.randint(0, 10, (32,))) for _ in range(20)]
act_range = calibrate(model, dummy_calib)

def scale_from_range(lo: float, hi: float, num_bits: int = 8) -> tuple[float, int]:
    """根据激活/权值范围计算 INT8 对称量化的 scale 和 zero_point
    对称量化：zero_point=0，范围 [-127, 127]，避免额外的 offset 运算"""
    abs_max = max(abs(lo), abs(hi), 1e-8)
    qmax = (1 << (num_bits - 1)) - 1  # 127 for INT8
    scale = abs_max / qmax
    return float(scale), 0  # (scale, zero_point)

# ========== 3. 把每一层权重和激活都量化成 INT8，导出为 C 头文件 ==========
def quantize_tensor(w_np: np.ndarray, scale: float, zp: int = 0) -> np.ndarray:
    q = np.round(w_np / scale + zp).clip(-128, 127).astype(np.int8)
    return q

def export_c_header(quantized_state: dict, header_path: str):
    """
    把量化后的权重导出为 CMSIS-NN 要求的 C 数组格式：
    - 卷积权重：[OutC, InC, KH, KW] -> CMSIS-NN 需要 HWIO？不，arm_convolve_s8 权重格式是 [OutCH, KH, KW, InCH]
      所以这里按要求重排
    - 偏置：INT32（= INT8 权重 × INT8 激活，结果是 INT16+16，存在 INT32 累积寄存器）
    """
    Path(header_path).parent.mkdir(exist_ok=True)
    lines = [
        "/* Auto-generated by PTQ exporter for CMSIS-NN */",
        "#ifndef _KWS_WEIGHTS_H_",
        "#define _KWS_WEIGHTS_H_",
        "#include <stdint.h>",
        "",
    ]
    # 1) 写权重数组
    for name, (q_tensor, scale) in quantized_state["weights"].items():
        flat = q_tensor.flatten().tolist()
        dtype = "int8_t" if q_tensor.dtype == np.int8 else "int32_t"
        lines.append(f"/* scale={scale:.8f}, shape={list(q_tensor.shape)} */")
        lines.append(f"static const {dtype} W_{name.replace('.', '_')} [{len(flat)}] = {{")
        for i in range(0, len(flat), 16):
            chunk = ", ".join(f"{v}" for v in flat[i:i+16])
            lines.append(f"  {chunk},")
        lines.append("};\n")

    # 2) 写量化参数（每层的 input/output scale，用于 requantize）
    lines.append("/* Layer quantization parameters (input_scale, weight_scale, output_scale) */")
    lines.append("typedef struct { float in_s; float w_s; float out_s; } LayerQParams;")
    lines.append("static const LayerQParams kws_qparams[4] = {")
    for i, (layer_name, qp) in enumerate(quantized_state["qparams"].items()):
        lines.append(f"  /* {layer_name} */ {{ {qp['in_s']:.8f}f, {qp['w_s']:.8f}f, {qp['out_s']:.8f}f }},")
    lines.append("};\n#endif /* _KWS_WEIGHTS_H_ */")

    with open(header_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

# 执行量化 + 导出
qs = {"weights": {}, "qparams": {}}
# conv1
for (layer_name, w_name, b_name, inp_name) in [
    ("conv1", "conv1.weight", "fc.bias", "bn1"),  # 示例，实际每层要配
]:
    w_fp = model.state_dict()[w_name].detach().cpu().numpy()
    w_s, _ = scale_from_range(w_fp.min(), w_fp.max())
    w_q = quantize_tensor(w_fp, w_s)
    qs["weights"][w_name] = (w_q, w_s)
    in_s, _ = scale_from_range(*act_range[inp_name])
    out_s, _ = scale_from_range(*act_range[inp_name])
    qs["qparams"][layer_name] = {"in_s": in_s, "w_s": w_s, "out_s": out_s}

export_c_header(qs, "./stm32_project/Core/Inc/kws_weights.h")
print("✅ 权重导出完毕：kws_weights.h")
```

**量化选型经验**：如果你的数据集够大（>=10K 样本），做完 PTQ 后精度掉了 > 3%，那就升级到 QAT（量化感知训练）——在训练图里插入伪量化节点（FakeQuantize），让模型在训练时就"适应"INT8 的离散化误差，最终掉点可控制在 1% 以内。PyTorch 用 `torch.ao.quantization.get_default_qat_qconfig` + `prepare_qat` 一行开启。

### 🔑 CMSIS-NN 推理实现（STM32 Cortex-M7 裸机）

模型权重和偏置导出为 C 数组后，接下来就是用 ARM 官方的 **CMSIS-NN** 库在 MCU 上把推理跑起来。CMSIS-NN 对常用的 Conv2D、DepthwiseConv、FC、Pooling、Softmax 都有手搓的 Cortex-M 汇编优化版本（用 SIMD DSP 指令：SMLAD、SSAT 等），比你手写纯 C for 循环快 **4~8 倍**。

```c
/*
 * kws_inference.c  ——  CMSIS-NN 实现 KWS 模型推理
 * 目标板：STM32F746NG (Cortex-M7, 216MHz, 340KB RAM, 1MB Flash)
 * 依赖：CMSIS-NN v5.0+ (在 STM32CubeMX 里勾 "CMSIS Core" + "CMSIS DSP Library" + "CMSIS NN Library")
 */
#include "stm32f7xx_hal.h"
#include <arm_nnfunctions.h>
#include <arm_nnsupportfunctions.h>
#include "kws_weights.h"   // 上一步 Python 导出的权重头文件

/* 每一层 buffer 大小提前算好，避免运行时动态分配（MCU 没 malloc 的余裕） */
#define KWS_IN_H       49
#define KWS_IN_W       40
#define KWS_IN_CH      1
#define BUF1_SIZE      (16 * 25 * 20)   /* conv1 输出激活 */
#define BUF2_SIZE      (32 * 13 * 10)   /* conv2/conv3 输出激活 */
#define BUF_COL_SIZE   (16 * 3 * 3 * 1) /* im2col 临时缓冲 */

/* 静态分配在 .bss 段，不占 stack */
static q7_t   buf1[BUF1_SIZE];   /* q7 = int8_t, CMSIS-NN typedef */
static q7_t   buf2[BUF2_SIZE];
static q15_t  buf_col[BUF_COL_SIZE];

/* 输入：INT8 量化好的 MFCC 特征，[49*40] 展平
 * 输出：INT8 10 类 logits，最大值对应的类别就是唤醒词
 * 返回值：推理耗时（CPU cycles）
 */
uint32_t kws_inference(const q7_t *input_features, q7_t *output_logits)
{
    const LayerQParams *qp = kws_qparams;
    uint32_t t0 = DWT->CYCCNT;  /* 用 DWT 周期计数器精确计时 */

    /* ===== 第 1 层：Conv2d 1→16, 3x3 s2 + ReLU =====
     * arm_convolve_s8() 是 CMSIS-NN 核心，Cortex-M7 下自动用 SIMD 优化
     */
    arm_convolve_s8(
        input_features,                   /* im_in       */
        KWS_IN_CH, KWS_IN_H, KWS_IN_W,
        W_conv1_weight,                   /* ker_col = q7 weights [OutH*OutW*InC] */
        16,                               /* out_ch      */
        (q15_t *)W_conv1_bias,            /* bias = int32，需强转 q15* 给 API？→ 实际传 cmsis_nn_per_channel_quant_params，此处为演示简化 */
        (int32_t *)W_conv1_bias,
        1, 3, 3,                          /* pad_h, kH, kW */
        2, 2,                             /* stride_h, stride_w */
        1, 1,                             /* dilation */
        buf1,                             /* im_out      */
        qp[0].in_s, qp[0].w_s, qp[0].out_s,
        KWS_IN_H - 3 + 2*1 + 1 / 2,       /* out H = (49-3+2)/2+1 = 25 */
        20, 16,                           /* out W, out CH */
        buf_col                           /* col_buffer im2col workspace */
    );
    /* ReLU：INT8 直接 max(x, 0)，CMSIS 提供向量化版本 */
    arm_relu_q7(buf1, BUF1_SIZE);

    /* ===== 第 2 层：Conv2d 16→32, 3x3 s2 + ReLU ===== */
    arm_convolve_s8(
        buf1, 16, 25, 20,
        W_conv2_weight, 32,
        NULL, (int32_t *)W_conv2_bias,
        1, 3, 3, 2, 2, 1, 1,
        buf2,
        qp[1].in_s, qp[1].w_s, qp[1].out_s,
        13, 10, 32, buf_col
    );
    arm_relu_q7(buf2, BUF2_SIZE);

    /* ===== 第 3 层：Conv2d 32→32, 3x3 s1 + ReLU ===== */
    arm_convolve_s8(
        buf2, 32, 13, 10,
        W_conv3_weight, 32,
        NULL, (int32_t *)W_conv3_bias,
        1, 3, 3, 1, 1, 1, 1,
        buf1,  /* buf1 不再需要之前的值，复用省 RAM */
        qp[2].in_s, qp[2].w_s, qp[2].out_s,
        13, 10, 32, buf_col
    );
    arm_relu_q7(buf1, BUF2_SIZE);  /* 13*10*32=4160 < BUF2_SIZE，复用没问题 */

    /* ===== 第 4 层：Global Average Pooling (手写，CMSIS-NN 对 13x10→1x1 直接 for 即可) ===== */
    q7_t gap[32];
    for (int c = 0; c < 32; c++) {
        int32_t sum = 0;
        for (int h = 0; h < 13; h++) {
            for (int w = 0; w < 10; w++) {
                sum += buf1[((h * 10) + w) * 32 + c];
            }
        }
        gap[c] = (q7_t) __SSAT(sum / (13*10), 8);  /* 饱和截断到 INT8 */
    }

    /* ===== 第 5 层：Fully Connected 32→10 ===== */
    arm_fully_connected_s8(
        gap,
        W_fc_weight, NULL, (int32_t *)W_fc_bias,
        output_logits,
        qp[3].in_s, qp[3].w_s, qp[3].out_s,
        32, 10,
        NULL
    );

    return DWT->CYCCNT - t0;
}

/* ===== 主循环调用示例（main.c 里放）===== */
extern void BSP_AUDIO_IN_GetMFCC(q7_t *out);  /* 假定驱动层已经拿到 INT8 MFCC */
void app_main_kws(void)
{
    q7_t mfcc[KWS_IN_H * KWS_IN_W];
    q7_t logits[10];
    while (1) {
        BSP_AUDIO_IN_GetMFCC(mfcc);           /* 1. 采音频 + DSP 提 MFCC（INT8 量化好的）*/
        uint32_t cycles = kws_inference(mfcc, logits);  /* 2. CMSIS-NN 推理 */

        /* 3. 找 argmax，连续 3 帧命中再触发（防误触发）*/
        int best_class = 0; q7_t best_score = -128;
        for (int i = 0; i < 10; i++) if (logits[i] > best_score) {
            best_score = logits[i]; best_class = i;
        }
        float ms = cycles * 1000.0f / 216000000.0f;
        if (best_score > 80 && best_class >= 2) {
            printf("KWS hit class=%d score=%d, infer=%2.1fms\r\n", best_class, best_score, ms);
        }
    }
}
```

**CMSIS-NN 踩坑要点**：① **通道顺序是 HWC（不是 PyTorch 的 CHW）**，Python 端导出权重时必须 `np.transpose(0,2,3,1)` 重排；② **所有缓冲一定要静态分配**，绝对不要用 stack 上的局部数组（Cortex-M 栈一般只有 8~16KB，会直接 HardFault）；③ 每一层输出的 H/W 维度一定要手算准确，`H_out = (H_in - K + 2P)/S + 1`，算错一个就会越界写内存，轻则数值错乱、重则 HardFault。

### 🔑 ONNX Micro 快速部署（ESP32 通用链路）

如果 CMSIS-NN 不支持你的算子（比如 Swish、LayerNorm、LSTM 变种），或者你用的不是 ARM Cortex-M（比如 ESP32 的 Xtensa、RISC-V），那就换 **ONNX Runtime for Microcontrollers（ONNX Micro / μONNX）**——它把完整的 ONNX Runtime 压缩到 60KB Flash，支持 ONNX 算子 120+ 个，和 PyTorch 导出的 ONNX 几乎零适配。

```bash
# ========== 1. PyTorch 模型导出为 ONNX，再用 onnxruntime.tools.optimize_onnx_model 优化 ==========
python - <<'PYEOF'
import torch
from models import KWSTinyCNN

model = KWSTinyCNN()
model.load_state_dict(torch.load("./kws_tinycnn_fp32.pt", map_location="cpu"))
model.eval()

dummy = torch.randn(1, 1, 49, 40)
torch.onnx.export(
    model, dummy,
    "./kws.onnx",
    input_names=["input_mfcc"],
    output_names=["logits"],
    opset_version=12,           # 必须 11+，保证 ONNX Micro 所有算子支持
    dynamic_axes=None,          # MCU 上必须固定输入尺寸！
    do_constant_folding=True,
)
print("✅ ONNX 导出完成")

# 2. 可选：ONNX SIM 简化图（删无用节点、折叠常量，省 Flash）
import onnxsim, onnx
model_onnx = onnx.load("./kws.onnx")
model_simp, _ = onnxsim.simplify(model_onnx)
onnx.save(model_simp, "./kws_simp.onnx")

# 3. INT8 量化（用 ONNX Runtime Quantization）
from onnxruntime.quantization import quantize_dynamic, QuantType
quantize_dynamic(
    model_input="./kws_simp.onnx",
    model_output="./kws_int8.onnx",
    weight_type=QuantType.QInt8,
)
import os
print(f"FP32 ONNX: {os.path.getsize('./kws_simp.onnx')/1024:.1f}KB")
print(f"INT8 ONNX: {os.path.getsize('./kws_int8.onnx')/1024:.1f}KB")
PYEOF

# ========== 2. 用 onnx-micro 编译为 C 源文件（STM32/ESP32 通用）==========
# 拉取 onnx-micro 工具链
git clone --recursive https://github.com/onnx/onnx-micro.git
cd onnx-micro
python -m pip install -e .

# 生成目标 MCU 的 C 文件
# --target: 选择架构 (arm-cortex-m7 / xtensa-esp32s3 / riscv32)
# --toolchain: gcc / xtensa-esp32-elf-gcc / arm-none-eabi-gcc
python -m onnxmlir --model ../kws_int8.onnx \
    --target arm-cortex-m7 \
    --toolchain /opt/gcc-arm-none-eabi-10.3/bin/arm-none-eabi-gcc \
    --output-dir ../esp32_project/components/onnx_model/
# 输出：onnx_model.c + onnx_model.h + 权重二进制 bin
# 编译时把这些一起加入 IDF/Keil 工程即可
```

```c
/*
 * onnx_micro_entry.c —— ESP-IDF 工程里调用 ONNX Micro 推理
 * 目标：ESP32-S3-WROOM-1 (Xtensa LX7 双核 240MHz, 512KB SRAM, 8MB Flash)
 */
#include "esp_log.h"
#include "onnx_model.h"   /* onnx-micro 生成的头文件 */

static const char *TAG = "KWS_ONNX";

void app_main(void)
{
    /* 1. 初始化 ONNX Micro 运行时（把权重从 Flash 映射到 RAM）*/
    OmError err = om_init_default_arena();
    if (err != OM_OK) ESP_LOGE(TAG, "om_init_arena fail: %d", err);

    OmModel *model = om_model_create_from_embedded();
    if (!model) ESP_LOGE(TAG, "om_model_create fail");

    /* 2. 获取输入/输出 tensor 指针（固定 shape，直接写死即可）*/
    OmTensor *input  = om_model_input(model, 0);    /* [1,1,49,40] INT8 */
    OmTensor *output = om_model_output(model, 0);   /* [1,10] INT8 */
    ESP_LOGI(TAG, "in=%p out=%p, insize=%d outsize=%d",
             input->data, output->data, input->size, output->size);

    /* 3. 主循环采音频 → 推理 → 判断 */
    int8_t *mfcc_ptr = (int8_t *)input->data;
    int8_t *out_ptr  = (int8_t *)output->data;
    while (1) {
        audio_get_mfcc_int8(mfcc_ptr);   /* 驱动层填数据到 input->data */

        int64_t t0 = esp_timer_get_time();
        err = om_model_run(model);       /* 关键：一次调用跑完整张图 */
        int64_t us = esp_timer_get_time() - t0;
        if (err != OM_OK) {
            ESP_LOGE(TAG, "run fail: %d", err);
            continue;
        }

        int cls = 0; int8_t mx = -128;
        for (int i = 0; i < 10; i++) if (out_ptr[i] > mx) { mx = out_ptr[i]; cls = i; }
        ESP_LOGI(TAG, "cls=%d score=%d, t=%lldus", cls, mx, us);
        vTaskDelay(pdMS_TO_TICKS(20));
    }
}
```

**ONNX Micro vs CMSIS-NN 抉择**：算子覆盖 ONNX Micro 胜（120+ vs ~30），链路和 PyTorch/ONNX 生态打通顺；**相同模型相同 MCU 下，CMSIS-NN 性能比 ONNX Micro 快 1.5~2.5 倍**，Flash/RAM 占比也少 20%。生产环境如果是标准 CNN/FC 网络用 CMSIS-NN 压榨极限性能；如果模型里有奇怪算子或赶时间不想手写 C，就选 ONNX Micro 快速落地。

## 常见误区或注意事项

1. **误区：直接把 ImageNet 上的 ResNet18 拿来量化放 MCU，说 MCU 跑不了 AI。** 为什么是坑：ResNet18 有 11M 参数，光权重 FP32 就 44MB，INT8 也有 11MB，STM32H7 的 2MB Flash 连塞权重都不够。而且 ResNet18 一次前向要 1.8G MACs，STM32F4 168MHz 就算 1 cycle 1 MAC 也要跑 10 秒以上，根本不是 MCU 能扛的模型。正确做法：**从头为 MCU 设计模型结构**（MobileNetV1 也太大）——通道数全部是 8 的倍数（8/16/32/64，绝不上 128）、总通道累加和 × 空间尺寸控制在 **< 500K MACs**（216MHz MCU 跑 ~~3ms）、全部用深度可分离卷积（DWConv + PWConv）代替标准卷积、用 Global Average Pooling 替换全连接层（全连接参数占比大，激活也大）。KWS 级别的任务 20~~50KB 权重、异常检测级的 MLP 模型 2~10KB 权重就够用了。

2. **误区：INT8 量化后不做硬件精度对比，直接在 MCU 上跑了说"推理结果乱"。** 为什么是坑：PTQ 校准数据太少（比如只拿 10 条）导致缩放因子 scale 估得太极端，或者 zero_point 选了非对称，或者你在 Python 端是对称量化但 C 端用了非对称反量化，都会导致 MCU 推理输出和 PC 端 FP32 输出差 > 20%，最终分类错、检测全漏。这种"数值精度不一致"的 bug 在 MCU 上没法断点调试（你不可能单步 1 万次乘加），会耗掉你 80% 的开发时间。正确做法：**先在 PC 端写一个"bit-true 仿真器"**——用 NumPy 手搓 INT8 卷积 + 反量化（严格和 CMSIS-NN/ONNX Micro 的公式一模一样：`q_out = clamp(round(Σ(q_w × q_x) × (w_s × x_s) / o_s))`），拿 20 条样本对比 PC 仿真 INT8 输出 vs MCU 推理输出的余弦相似度，相似度必须 >= 0.999；不满足就定位是某层 scale 导出错还是权重重排错。**过了 bit-true 验证再上板调业务逻辑。**

3. **误区：MCU 推理中间激活 buffer 乱塞局部变量，跑起来就 HardFault。** 为什么是坑：Cortex-M 系列的默认栈大小（MSP/PSP）一般在启动文件 startup.s 里配的是 0x400~~0x2000（1~~8KB）。很多工程师图省事直接在函数里写 `int8_t buf[4160];` 放激活，520 字节就占了栈的一半，再嵌套几层函数调用、中断里又压一堆寄存器，直接栈溢出——触发 HardFault，而且 fault 地址不一定在溢出点，可能随机崩在 HAL_Delay() 里，排查起来想死。正确做法：① 所有 **模型相关的 buffer（权重、输入、激活、临时 workspace）全部用 `static` 修饰或放在 `.bss` 段全局变量**，不占栈；② 启动文件把栈和堆大小调大一点（MSP 至少 4KB、PSP 每个任务 2~4KB，FreeRTOS 用 configTOTAL_HEAP_SIZE 至少 32KB）；③ 上板后先跑 `watermark` 测试：连续推理 1000 次，监控堆栈剩余量，留 30% 的安全余量再定最终大小。

4. **误区：推理时间预算按"单次 best-case 耗时"算，不考虑中断和温度降频。** 为什么是坑：STM32F767 常温下跑 KWS 模型一次 2.3ms，看起来 1 秒能处理 434 帧，但实际业务里还有各种中断——DMA 搬运音频数据（每 10ms 一次，每次 50us）、UART 打印日志（一次 200us）、FreeRTOS 任务调度（上下文切换），外加芯片温度到 85°C 以上主频可能降频、Flash 等待周期不够稳定，P99 的推理耗时会飙升到 5ms 以上。KWS 需要每 20ms 处理一帧，如果刚好遇到抖动延迟 > 20ms，音频帧就丢了。正确做法：① 给 AI 推理任务**最高优先级**（比传感器采样低一级、比通信日志高两级），FreeRTOS 配 `configMAX_PRIORITIES` 至少 5 级，AI 推理设为 `(configMAX_PRIORITIES - 2)`；② 压测时用最坏场景：-40°C~85°C 温度箱 + 全外设（I2S/UART/SPI）同时跑，测 P99 延迟，业务帧周期 >= 2 × P99 延迟才叫稳；③ 留一手：如果一帧推理超时了，直接丢帧不要累积，宁可漏识别也不要整个系统 watchdog 复位。
