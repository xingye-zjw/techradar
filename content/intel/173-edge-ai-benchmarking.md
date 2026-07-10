---
title: 边缘 AI 基准：MLPerf Tiny / AI-Runner / ONNX Runtime 性能评估
category: embedded
difficulty: advanced
duration: 2周
summary: 建立边缘 AI 选型的"统一度量衡"，让你在 10 款 MCU/AI 芯片、5 套推理引擎、3 档量化精度之间做决策时有据可依。覆盖 MLPerf Tiny 官方标准评测、自研 AI-Runner 延迟/功耗/内存三维探针、ONNX Runtime Cross-Compile 跨平台性能评估全套方法。
keywords: [边缘AI基准, MLPerf Tiny, AI-Runner, ONNX Runtime, 性能评估, 功耗测试, 推理延迟]
takeaways:
  - 搞懂 MLPerf Tiny 的四大任务（KWS / VWW / AD / IC）评测流程与合规要求
  - 理解延迟(P50/P99)、峰值内存(RSS/堆)、功耗(mWh/推理)三维评估指标的工程意义
  - 能画出 STM32 vs ESP32 vs NXP vs Kendryte K210 同模型对比基准的测试架构图
  - 能跑通 ONNX Runtime for MCU 在 Cortex-M7 上的端到端基准（含精度验证）
  - 实现基于 AI-Runner 框架的自动化基准套件，输出 CSV/JSON 可视化报告
tags: [embedded, 边缘AI基准, MLPerf Tiny, ONNX Runtime, 性能评估, 功耗测试, AI芯片选型]
relatedTerms: [onnx, rtos, cnn, resnet, matrix, operating-system, circuit, complexity, algorithm]
relatedTools: [onnx-runtime, stm32cubemx, gcc, esp-idf, freertos, onnxruntime-genai]
relatedNodes: [embedded-rtos, embedded-hal, embedded-hal, embedded-rtos]
---

## 为什么你要学它

做边缘 AI 落地的工程师，90% 都会遇到一个灵魂拷问："我到底该选哪颗芯片？" 市面上的 AI 加速方案琳琅满目——NXP i.MX RT1170（1GHz Cortex-M7 + NPU）、ST STM32H7 + X-CUBE-AI、Espressif ESP32-S3（向量指令）、Kendryte K210（自研 KPU）、GigaDevice GD32H7、Renesas RZ/V2L（DRP-AI）、Allwinner V853（NPU）、Nvidia Jetson Nano（GPU）、Rockchip RK3588（NPU）……每一家都在 datasheet 上写着"TOPS 算力惊人""业界领先能效比"，但这些纸面参数在你的具体模型上到底能不能兑现？**光看 datasheet 选芯片，最终大概率踩坑：要么算力不够推理超时、要么内存不够模型塞不下、要么功耗远超电池预算。**

边缘 AI 基准测试就是解决这个问题的"统一度量衡"。它不看厂商吹的 TOPS，而是拿**你自己真实业务的模型**（不是厂商挑好的 ResNet50 玩具模型），在**你真实的硬件环境**（同一块 PCB、同电压同温度）、**同一套量化流程**（都是 INT8 PTQ 或都是 QAT）下，测**三维核心指标**：① 延迟（单次推理 P50/P99 毫秒数，直接决定产品响应体验）；② 峰值内存（模型权重 + 中间激活 + workspace 之和，直接决定选多大 RAM 的芯片）；③ 功耗（单次推理耗多少 mWh，直接决定电池续航）。**没有基准数据就做选型决策，等于闭着眼睛过马路。**

实际落地场景包括但不限于：

- **芯片选型前置评估**：项目立项时，预算 6 款候选 MCU/SoC，用同一套 KWS 模型跑基准，按"延迟×单价×功耗"综合排序，选出性价比最优的 2 款做原理图
- **推理引擎横向对比**：同一颗 STM32H7，同一套 MobileNet 模型，对比 CMSIS-NN / X-CUBE-AI / ONNX Micro / TFLite Micro 四套引擎的延迟、Flash 占用、RAM 占用，选最快的
- **量化精度-性能 Tradeoff 分析**：同一模型同一硬件，对比 FP32 / FP16 / INT8 / INT16 四档量化的"精度下降率 vs 延迟降低率 vs 内存压缩比"，找到最佳甜点
- **NPU vs CPU 实测对比**：官方宣称 NPU 比 CPU 快 15 倍，但你的业务是小模型（KWS 25KB），NPU 指令加载 overhead 大，实测反而比 CPU 慢——这种坑只有跑过基准才知道
- **量产产线一致性测试**：每一批 MCU 来料时，跑 1000 次标准推理基准，测延迟 P99 是否在 3σ 范围内，防止买到超频/降频次品
- **固件版本回归测试**：每次升级推理引擎（CMSIS-NN 4.1→5.0）或编译器（gcc-arm-10→13）时跑回归基准，确保没有引入 >5% 的性能衰退

## 一句话概览（快速版）

1. **MLPerf Tiny = 学术界 + 工业界公认的"边缘 AI 跑分标准"**。4 个标准任务（KWS 关键词唤醒 / VWW 视觉唤醒词 / AD 异常检测 / IC 图像分类）+ 严格的合规规则（必须包含封闭分区 Closed Division，不能针对特定模型写手搓汇编作弊），**MLPerf Tiny 上榜成绩是你和老板、客户沟通的硬通货**，说"我们的方案在 MLPerf Tiny KWS 任务拿了同级别前 3"比说"我们很快"有说服力一万倍。
2. **AI-Runner = 你自己的自动化基准框架**。MLPerf Tiny 只有 4 个标准模型，但你业务上可能有 20 个自定义模型，需要**每次代码提交都自动跑一轮基准 + 生成报告 + 邮件通知**。AI-Runner 是一个可扩展框架：把模型、输入样本、真值答案打包成 case，统一测 P50/P99 延迟、RSS/堆峰值、mWh 功耗、推理精度（Top-1 Acc / F1），**最后输出 CSV + 可视化柱状图 + Markdown 报告**，防止"改了一行代码性能掉 30% 没人发现"。
3. **ONNX Runtime Cross-Compile + ETW / perf 探针 = 定位瓶颈的终极武器**。整体延迟 10ms，到底是 Conv1 占 6ms 还是 Softmax 占 3ms？ONNX Runtime 提供 `session_options.enable_profiling = True` 输出每个算子耗时的 JSON；MCU 侧用 DWT CycleCounter + GPIO 翻转 + 示波器抓时间戳做交叉验证；功耗侧用 Joulescope 或 Nordic PPK2 抓 1ms 采样率的电流曲线，**精准到"哪个算子在哪个时钟周期吃了多少 mA"**，针对性优化 1~2 个热点算子就能把整体延迟砍 40%。

## 核心拆解

### 🔑 MLPerf Tiny 标准评测（Closed Division 合规版）

MLPerf Tiny 是 MLCommons 联盟（Google/Intel/ARM/NXP/ST 等 30+ 厂商联合制定）的低功耗 AI 基准。评测分 **Closed Division**（封闭分区，模型和量化流程严格统一，保证横向可比性）和 **Open Division**（开放分区，可以改模型改算法，秀肌肉用）。正规评测必须先过 Closed Division 的合规检查：模型必须用官方提供的 TensorFlow Lite 固定结构、量化必须用官方训练脚本跑出来的 INT8 TFLite 文件、不能手搓算子专用优化（除非是 CMSIS-NN 这种"通用优化库"）。

```bash
# ========== Step 1: 拉取 MLPerf Tiny 官方仓库 + 下载参考模型 ==========
git clone --recurse-submodules https://github.com/mlcommons/tiny.git
cd tiny
# 下载官方已训练 + 已量化的 4 个 Closed 模型（约 30MB）
#   KWS:   DS-CNN 关键词唤醒  ->  ~92% Top-1 on Speech Commands
#   VWW:   MobileNetV1 0.25x 96x96 person/non-person  ->  ~87%
#   AD:    AE Anomaly Detection (玩具汽车 IMU 数据)  ->  F1 0.85
#   IC:    ResNet (8-bit CIFAR-10 分类)  ->  ~90%
python3 submission/runner/get_reference_models.py --models kws vww ad ic
ls pretrained_models/
#  kws/pretrainedResnet_quant.tflite    vww/vww_96_int8.tflite
#  ad/ad01_int8.tflite                  ic/icy_200k_quant.tflite

# ========== Step 2: 准备目标板 BSP（这里以 STM32F746G-DISCO 为例）=============
# 官方提供了 5 种参考板的移植：Nucleo-H743ZI / STM32L4R9I / ESP32S3 / SparkFun / Nordic nRF52840
# 你要新增板级支持（比如自定义 PCB 用 STM32F407），需要实现 4 个 platform_* 回调：
cat > platform/my_f407/porting.c <<'EOF'
/* MLPerf Tiny 要求移植层实现 7 个回调，其他业务逻辑官方全给 */
#include "stm32f4xx_hal.h"
#include "core_cm4.h"

uint32_t platform_get_time_ms(void)       { return HAL_GetTick(); }     /* 1ms tick */
uint32_t platform_get_cycle_count(void)   { return DWT->CYCCNT; }       /* DWT 周期计数（精度更高）*/
void     platform_start_timer(void)       { DWT->CYCCNT = 0; }          /* 清零计时 */
uint32_t platform_stop_timer(void)        { return DWT->CYCCNT; }       /* 停止读计数 */
void     platform_init(void)              { SystemClock_Config(); DWT_InitCycleCounter(); /* BSP */ }
void     platform_sleep(uint32_t ms)      { HAL_Delay(ms); }
/* 最关键的回调：推理一次模型（官方会包一层 TFLM Micro） */
TfLiteStatus platform_invoke(void *ctx)   { return TfLiteMicroInterpreterInvoke(ctx); }
EOF

# ========== Step 3: 编译 + 烧录 + 跑 Closed 评测 ==================================
# 用官方 CMake + arm-none-eabi-gcc 交叉编译
mkdir -p build_stm32f7 && cd build_stm32f7
cmake .. \
  -DCMAKE_TOOLCHAIN_FILE=../cmake/arm-none-eabi-gcc.cmake \
  -DTARGET_PLATFORM=STM32F746G_DISCO \
  -DMODEL=kws \                       # 4 选 1：kws / vww / ad / ic
  -DDIVISION=closed \                 # Closed 合规模式，禁止自定义优化
  -DPER_DEVICE_TEST_PATHS=OFF
make -j mlperf_tiny_runner.elf

# 用 ST-Link 烧录
openocd -f interface/stlink.cfg -f target/stm32f7x.cfg \
    -c "program mlperf_tiny_runner.elf verify reset exit"

# 通过串口 / SWO 读评测结果（官方 runner 输出 JSON 格式）
python3 -m serial.tools.miniterm /dev/ttyACM0 115200 --q
# 典型输出（MLPerf 要求每个模型 500+ 样本，记录每次的延迟）:
# {
#   "model": "kws",
#   "division": "closed",
#   "samples_eval": 1024,
#   "accuracy_top1": 0.918,
#   "latency_ms_p50": 2.31,
#   "latency_ms_p99": 3.04,
#   "peak_ram_bytes": 28160,
#   "flash_used_bytes": 61440,
#   "target_platform": "STM32F746G_DISCO @ 216MHz"
# }
```

**MLPerf Tiny 合规性红线（踩了就判无效）**：① 不能改 Closed 模型的权重结构，哪怕把一层 Conv3×3 换成 Depthwise 也不行；② 推理时不能提前"偷看"输入样本然后预热 cache，必须冷启动每次都真实推理；③ 延迟测量必须用 DWT CycleCounter（精度高）而不是 HAL_GetTick（只有 1ms 分辨率），否则会被判"精度不足"；④ 精度必须在官方公布参考精度的 95% 以内（KWS 参考 ~92%，你提交不能低于 87%），否则视为"通过牺牲精度换速度"的作弊。

### 🔑 AI-Runner 自研三维基准框架（延迟 + 内存 + 功耗）

MLPerf Tiny 只有 4 个固定模型，实际项目里你可能有 20+ 个自定义 ONNX 模型要测，还要对比"CMSIS-NN vs TFLM vs ONNX Micro vs X-CUBE-AI"4 套引擎。**每次改代码手动测 20×4=80 组配置 + 手填 Excel 是地狱**，AI-Runner 把这些全自动化：你只需要写一个 `bench_cases.yaml` 声明"哪些模型 × 哪些引擎 × 哪些板子"，它自动交叉编译、J-Link 批量烧录、串口采集数据、跑功耗仪抓电流，最后生成一个带柱状图对比的 Markdown 报告。

````python
# bench_cases.yaml  ——  AI-Runner 测试用例声明
# 每行对应一个"模型×引擎×板子×优化等级"组合
cases:
  - name: "KWS_CNN_INT8_CMSISNN_STM32F746"
    model_path: ./models/kws_cnn_int8.onnx
    engine: cmsis-nn        # cmsis-nn / tflite-micro / onnx-micro / x-cube-ai
    board:  stm32f746g_disco
    compiler_flags: [-O3, -ffast-math]
    test_samples: 200       # 测多少条样本取统计
    power_measure: true     # 要不要接 Joulescope 测功耗

  - name: "VWW_MBNet_INT8_ONNXMICRO_STM32F746"
    model_path: ./models/vww_mbnetv1_96_int8.onnx
    engine: onnx-micro
    board:  stm32f746g_disco
    compiler_flags: [-O2]
    test_samples: 200
    power_measure: true

  - name: "KWS_CNN_INT8_CMSISNN_ESP32S3"
    model_path: ./models/kws_cnn_int8.onnx
    engine: cmsis-nn-nncase    # nncase 把 ONNX 转成 ESP32-S3 向量指令优化版
    board:  esp32-s3-devkitc
    idf_target: esp32s3
    compiler_flags: [-O3, -mfix-esp32-psram-cache-issue]
    test_samples: 200
    power_measure: true

# ====== AI-Runner 核心调度脚本（简化版）======
import yaml, subprocess, json, csv, statistics, time
from dataclasses import dataclass, asdict
from pathlib import Path
import serial
import pylink           # pip install pylink-square （J-Link 烧录）
import joulescope        # pip install joulescope （功耗仪 USB 驱动）

@dataclass
class BenchResult:
    name: str
    accuracy_top1: float
    latency_p50_ms: float
    latency_p99_ms: float
    peak_ram_bytes: int
    flash_used_bytes: int
    avg_power_mw: float
    energy_mwh_per_infer: float
    build_time_sec: float

def build_one_case(case: dict) -> Path:
    """调用 CMake + 交叉编译器生成 elf/bin（不同 engine/board 走不同 CMake preset）"""
    t0 = time.time()
    build_dir = Path(f"./build/{case['name']}")
    build_dir.mkdir(parents=True, exist_ok=True)
    preset = f"{case['engine']}_{case['board']}"
    subprocess.run(
        ["cmake", "--preset", preset, "-S", ".", f"-DMODEL_PATH={case['model_path']}",
         "-DCMAKE_C_FLAGS=" + " ".join(case["compiler_flags"])],
        cwd=build_dir, check=True, capture_output=True,
    )
    subprocess.run(["cmake", "--build", ".", "-j", "--target", "runner.elf"],
                   cwd=build_dir, check=True, capture_output=True)
    case["_build_time"] = time.time() - t0
    return build_dir / "runner.elf"

def flash_and_collect(elf_path: Path, case: dict) -> BenchResult:
    """J-Link 烧录 → 开 Joulescope 电流采样 → 串口读 JSON → 汇总"""
    # 1. J-Link 烧录
    jlink = pylink.JLink()
    jlink.open()
    jlink.set_tif(pylink.enums.JLinkInterfaces.SWD)
    jlink.connect(case["board"].split("_")[0].upper())  # STM32F746 / ESP32-S3
    jlink.flash_file(str(elf_path), 0x08000000)
    jlink.reset()
    jlink.close()

    # 2. Joulescope 功耗仪：开流
    js = joulescope.scan().pop() if case["power_measure"] else None
    if js:
        js.open()
        js.parameter_set("source", "on")
        samples = []
        def on_stream(data):
            samples.extend(data["current"]["value"].tolist())
        js.streaming_start(on_stream, duration=30.0)  # 采 30 秒，足够跑 200 样本

    # 3. 串口收 runner 的 JSON 输出（每 20 个样本出一个中间统计，最后出汇总）
    ser = serial.Serial(case.get("serial_port", "/dev/ttyACM0"), 921600, timeout=60)
    jsons_collected = []
    deadline = time.time() + 120
    while time.time() < deadline and len(jsons_collected) < case["test_samples"] + 5:
        line = ser.readline().decode("utf-8", errors="ignore").strip()
        if line.startswith("{") and line.endswith("}"):
            try:
                jsons_collected.append(json.loads(line))
            except Exception: pass
    ser.close()

    final = jsons_collected[-1]
    # 4. 功耗结算：采样电流 × 电压（3.3V）积分，除样本数得单次推理能耗
    avg_mw = 0.0; energy_mwh = 0.0
    if js and samples:
        avg_current_ma = statistics.mean(samples) * 1000
        avg_mw = avg_current_ma * 3.3
        duration_s = final["latency_ms_p50"] / 1000.0
        energy_mwh = (avg_mw * duration_s) / 3600.0   # mWh / 每次推理
        js.streaming_stop(); js.close()

    return BenchResult(
        name=case["name"],
        accuracy_top1=final.get("accuracy", 0.0),
        latency_p50_ms=final["latency_ms_p50"],
        latency_p99_ms=final["latency_ms_p99"],
        peak_ram_bytes=final["peak_ram_bytes"],
        flash_used_bytes=elf_path.stat().st_size,
        avg_power_mw=round(avg_mw, 2),
        energy_mwh_per_infer=round(energy_mwh, 4),
        build_time_sec=round(case["_build_time"], 1),
    )

# ========== 跑全部用例 + 出报告 ==========
with open("bench_cases.yaml", encoding="utf-8") as f:
    config = yaml.safe_load(f)
results = []
for case in config["cases"]:
    elf = build_one_case(case)
    r = flash_and_collect(elf, case)
    results.append(r)
    print(f"✅ {r.name}: P50={r.latency_p50_ms}ms, RAM={r.peak_ram_bytes/1024:.1f}KB, "
          f"Energy={r.energy_mwh_per_infer}mWh/inf")

# 导出 CSV
with open("./bench_report.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=list(asdict(results[0]).keys()))
    w.writeheader()
    for r in results: w.writerow(asdict(r))

# 生成 Markdown 报告（含 mermaid 对比图）
md = ["# 边缘 AI 基准测试报告\n"]
for col in ["latency_p50_ms", "peak_ram_bytes", "energy_mwh_per_infer"]:
    md.append(f"\n## {col} 对比\n```mermaid\nxychart-beta\n")
    md.append(f"    title \"{col} per Case\"\n    x-axis [{', '.join(repr(r.name.split('_')[0]) for r in results)}]\n")
    md.append(f"    y-axis \"{col}\"\n    bar [{', '.join(str(getattr(r, col)) for r in results)}]\n```\n")
Path("./bench_report.md").write_text("\n".join(md), encoding="utf-8")
print("报告已生成：bench_report.csv / bench_report.md")
````

**AI-Runner 报告的决策公式**：选芯片时不要只看延迟，用**综合性价比得分 = (Accuracy / (Latency_P99 × Peak_RAM × Energy × Unit_Price))** 打分，归一化后谁分高选谁。比如 STM32H7 比 F7 快 2 倍但贵 1.8 倍、功耗高 1.5 倍，综合得分可能反而 F7 更高——电池供电产品优先看 Energy，网关类插电产品优先看 Latency。

### 🔑 ONNX Runtime 算子级 Profiling + 热点优化定位

宏观基准告诉你"整体慢"，但到底慢在哪一层？Conv2 占了 60% 时间？还是 DepthwiseConv 的 im2col 缓冲对齐有问题？**ONNX Runtime 的 profiling 功能 + MCU 侧 GPIO 翻转交叉验证**可以把每个算子的时间占比精确到微秒级，然后针对性优化 1~~2 个热点算子就能整体提速 30~~50%。

```python
# ========== 1. PC 端先测 ONNX Runtime CPU 推理的算子级 Profile（快速定位热点） ==========
import onnxruntime as ort
import numpy as np, json, time

model = "./models/vww_mbnetv1_96_int8.onnx"
so = ort.SessionOptions()
so.enable_profiling = True                      # 开 profiling
so.graph_optimization_level = ort.GraphOptimizationLevel.ORT_DISABLE_ALL  # 先关优化，看到底哪个算子慢
so.intra_op_num_threads = 1                     # 模拟 MCU 单核
sess = ort.InferenceSession(model, sess_options=so, providers=["CPUExecutionProvider"])

# 跑 100 次热身 + 200 次正式（和 MCU 上样本数一致）
dummy = np.random.randint(-127, 127, (1, 96, 96, 3), dtype=np.int8)
for _ in range(100): sess.run(None, {"input": dummy})
for _ in range(200): sess.run(None, {"input": dummy})

prof_file = sess.end_profiling()
print(f"PC 端算子级 Profile: {prof_file}")
with open(prof_file) as f:
    events = json.load(f)

# 按算子聚合耗时（取 dur 字段求和）
op_dur = {}
for e in events:
    if e.get("cat") == "Node":
        op = e.get("args", {}).get("op_name", e.get("name"))
        op_dur[op] = op_dur.get(op, 0) + e.get("dur", 0)
# Top-5 热点
top5 = sorted(op_dur.items(), key=lambda x: -x[1])[:5]
print("PC 端 Top-5 热点算子 (μs 总和):")
for op, dur in top5:
    print(f"  {op:<35} {dur:>8} μs  {100*dur/sum(op_dur.values()):.1f}%")
# 典型输出：
#   Conv_0 (3x3 s2, 3→8)               423 μs   18.6%
#   Conv_2_dw (3x3 dw s1, 16)           387 μs   17.0%
#   Conv_5_pw (1x1 pw s2, 32→64)        301 μs   13.2%
#   ...  前 3 个算子加起来占 48.8% → 优化这三个就够了！
```

```c
/* ========== 2. MCU 端交叉验证：给热点算子前后加 GPIO 翻转，示波器/逻辑分析仪抓真实耗时 ==========
 * 目标板：STM32H743（D13 = PI1 作为测时间的 GPIO 探针）
 * 思路：ONNX Micro 的 om_model_run() 调用前拉高 GPIO，跑完拉低 → 整体时间；
 *      如果要更细，改 om_subgraph_execute() 在每个 Node 调用前后加翻转；
 *      对比 PC 端 Profile 的热点占比，两者误差必须 < 20%（否则是你的 PC sim 没对齐）。
 */
#include "stm32h7xx_hal.h"
#include "onnx_model.h"

#define PROBE_PORT    GPIOI
#define PROBE_PIN     GPIO_PIN_1
#define PROBE_HIGH()  HAL_GPIO_WritePin(PROBE_PORT, PROBE_PIN, GPIO_PIN_SET)
#define PROBE_LOW()   HAL_GPIO_WritePin(PROBE_PORT, PROBE_PIN, GPIO_PIN_RESET)

/* 覆写 ONNX Micro 的 weak 钩子（如果你的 ONNX Micro 版本提供 op_pre/op_post 回调）*/
void __attribute__((weak)) onnx_micro_pre_op(int op_idx, const char *op_name) {
    /* 用 op_idx 映射到 3-bit 二进制，示波器上用 3 通道解码（或简单的：热点A翻转 Pin1， 热点B翻转 Pin2）*/
    if (op_idx == 0) PROBE_HIGH();    /* Conv_0 */
    if (op_idx == 2) HAL_GPIO_WritePin(GPIOI, GPIO_PIN_2, GPIO_PIN_SET); /* Conv_2_dw 用另一根线 */
}
void __attribute__((weak)) onnx_micro_post_op(int op_idx) {
    if (op_idx == 0) PROBE_LOW();
    if (op_idx == 2) HAL_GPIO_WritePin(GPIOI, GPIO_PIN_2, GPIO_PIN_RESET);
}

/* 主循环：跑 200 次推理 + 打印 DWT 精确计时 */
void bench_onnx_micro_hotspots(void)
{
    OmModel *m = om_model_create_from_embedded();
    OmTensor *in = om_model_input(m, 0);
    uint8_t *ptr = (uint8_t *)in->data;

    printf("STM32H743 @ 480MHz — ONNX Micro VWW 算子级对比\r\n");
    for (int i = 0; i < 200; i++) {
        for (int k = 0; k < in->size; k++) ptr[k] = (k * 7 + i) & 0xFF; /* 随机输入但稳定 */
        uint32_t t0 = DWT->CYCCNT;
        PROBE_HIGH();
        OmError e = om_model_run(m);            /* 调用时内部会触发 pre/post op 回调翻转各热点线 */
        (void)e;
        PROBE_LOW();
        uint32_t cyc = DWT->CYCCNT - t0;
        if (i == 199) printf("iter %d: total=%lu cyc = %.2f ms @480MHz\r\n", i, cyc, cyc/480000.0);
    }

    /* 示波器上读到的真实时间（典型值）：
     *   Conv_0 高电平宽度:       1.82 μs × 480 = 874 cyc
     *   Conv_2_dw 高电平宽度:    1.65 μs × 480 = 792 cyc
     *   和 PC Profile 对比：PC 上 Conv_0/Conv_2dw 的比值 = 423/387 ≈ 1.09
     *                       MCU 上比值 = 874/792 ≈ 1.10  →  ✅ 分布一致，可以信
     *   如果比值偏差 > 20% → 检查 PC 端是不是开了 SIMD 优化（-mavx2）和 MCU 不一样
     */
}
```

**热点算子优化三板斧（按 ROI 从高到低）**：① **im2col 缓冲对齐**：CMSIS-NN 的 `buf_col` workspace 必须 4 字节对齐，放在 DTCM RAM 里，错放 AXI SRAM 会慢 20%+；② **通道重排 + NHWC → NCHW**：如果你的模型是 TF 导出的 NHWC，转成 CMSIS-NN 内部用的 NCHW 并把 pad 预补上，避免每层 runtime 做转置；③ **DSP 指令替换**：热点 Conv 如果深度是 16/32 的倍数，直接调用 `arm_convolve_s8_HWC` 的 fast 变体（有单独符号 `arm_convolve_s8_fast_16ch`），比通用版本再快 15~25%。

## 常见误区或注意事项

1. **误区：拿 PC 端 `timeit` 测 ONNX Runtime 的延迟，线性乘 MCU 主频比就断言"STM32F7 跑这个模型 8ms"。** 为什么是坑：PC 端 CPU 是 3GHz 现代 x86 + AVX-512 SIMD + 大缓存 + DDR5，MCU 是 216MHz Cortex-M7 + 32KB I-Cache + 单通道 SRAM，**同一段 C 代码实际 Cycles/指令（CPI）差 3~8 倍**，x86 上的 1ms 推理到 F7 上不是 3GHz/216MHz ≈ 14ms，而是 40~~80ms（因为 cache miss 率高、无乱序执行、无 SIMD 指令）。按线性乘出来的 8ms 直接画进产品 SOW，最后板子回来跑 80ms，项目直接延期半年。正确做法：**从 Day 1 就用目标板的 EVK（评估板）跑真实基准，绝对不要靠 PC 估**。如果硬件还没回来，先用指令集模拟器（QEMU System ARM + Cortex-M7 仿真）或者 coremark 比值（CoreMark/MHz 乘 1.5~~2x 缩放因子估算 CPI）做保守估计，然后最终打 3× 安全余量写入 SOW。

2. **误区：只测单条推理延迟 P50，不测冷启动、热启动、不同温度下的 P99，量产时才发现翻车。** 为什么是坑：P50 是"最佳情况"，P99 才是真实用户体验——STM32F7 跑 1000 次推理，990 次 2.3ms，10 次因为 Flash 等待周期抖动手册写的是 0~5 wait states，温度 85°C 时 CPU 主频自动从 216MHz 降到 192MHz（部分厂商 BSP 默认开 thermal throttling 你不知道），还有 1 次刚好撞上 HAL 滴答定时器中断 + DMA 搬运音频数据，P99 会到 7.8ms，是 P50 的 3.4 倍。产品功能安全要求 10ms 内必须出结果，P99=7.8ms 看起来安全，-40°C 低温下 Flash 读取更慢，P99 可能飙到 11ms，触发安全狗复位。正确做法：**基准必须报告 6 个延迟分位数：P1/P10/P50/P90/P99/MAX**，并且至少在 -25°C / 25°C / 70°C 三个温度点各测 1000 次（量产前过 IEC 60068 高低温循环箱）。热启动（模型权重常驻 DTCM）和冷启动（第一次加载从 Flash 拷到 RAM）分开测，冷启动延迟 × 1.2 才是真实 worst-case。

3. **误区：只看 Flash 中 elf 文件大小算"模型占用"，忽略运行时中间激活 + workspace 的 RAM 峰值，最后一跑就 HardFault。** 为什么是坑：很多工程师看 ONNX 文件 25KB（VWW MBNetV1 0.25x），想当然觉得 MCU 有 64KB RAM 就够了，结果板子一上电推理第一次就 HardFault——原因是 Conv 层中间激活要 im2col workspace（MobileNet 一层 DWConv 需要 `KH*KW*InC` 缓冲，3×3×32=288B 看上去很小，但叠加 15 层加上中间 feature map `H*W*C = 24*24*64=36KB`，总峰值 RAM 是 48KB，再加上 FreeRTOS 任务栈（每个 4KB，三个任务就是 12KB），64KB 的 SRAM 根本不够，直接 bus fault。正确做法：**基准除了 Flash，必须测 3 个 RAM 指标**：① `.bss + .data` 段（静态变量）；② **推理运行时堆峰值**：在 `malloc/free` 钩子上钩一个 max_seen（TFLM 有 `kTensorArenaSize` 静态值更方便）；③ **调用栈峰值**：启动时把栈空间填 0xDEADBEEF 水印，跑完后找第一个不是 0xDEADBEEF 的位置算最深栈。三者相加再 + 20% 安全余量 = 你选型时需要的最小 RAM。绝对不能"估算够了"，必须用 fill-pattern + 运行后扫描这种实打实的方法测。

4. **误区：功耗用万用表测 3.3V 总电流平均值 × 电压算，断言"单次推理 0.3mWh"，实际电池续航只有预期一半。** 为什么是坑：万用表电流档分辨率是 1mA 级别、采样率 <10Hz，根本抓不到 MCU 那种"1ms 推理期间 120mA、其余空闲 3μA"的脉冲电流模式——测出来的平均电流会偏大（因为万用表内部 ADC 积分时间长，把尖峰电流当有效值了）或者偏小（采样点刚好都落在空闲期）。更要命的是：很多 MCU 跑 AI 推理时 NVIC 中断没关，功耗仪抓到的是"推理 + 后台 DMA + 各种 tick 中断"的综合值，不是纯推理本身的功耗，最后算电池续航完全不准。正确做法：① 用 **Joulescope JS220 / Nordic PPK2 / TI INA226 + MCU 自采**，采样率 ≥ 10kHz、分辨率 ≤ 1μA，抓 1 秒级完整脉冲波形；② 测试时关所有无关中断（SysTick 只留 1ms tick 做调度、关 UART DMA、关 SPI Flash 自动休眠唤醒），用 GPIO 翻转做"推理窗口"切片——只有 GPIO 高电平期间的电流积分才算"单次推理能耗"；③ 电池续航用 **3 倍安全系数**：如果算出来纽扣电池 CR2032（220mWh）按每天 1000 次推理能跑 100 天，产品文档里写 ≥ 30 天，因为真实环境有温度降容、电池老化、自放电、偶尔中断没关干净等各种损耗。
