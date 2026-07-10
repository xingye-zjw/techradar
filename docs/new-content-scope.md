# 新增技术内容范围与目标

> 版本：v1.0 · 2026-07-10
> 输入前提：团队 4-6 人 × 20h/周 × 8 周；LLM/CV 方向优先；130+ 情报全覆盖深度优化同步执行

---

## 1. 总体目标（定量）

8 周内 **净新增 130 件内容资产**，同时完成 **114 篇非 pitfall 情报** 的内容深度与交叉引用双优化：

| 目标维度 | 当前基线 | 第 8 周末目标 | 增量 |
|---|---|---|---|
| 情报卡片总数（含 pitfall） | 187 篇（114 标准 + 73 坑） | **≥ 247 篇** | **+60**（标准情报 40 + 专题 pitfall 20 与下方 30 合并） |
| 标准情报卡片（非 pitfall） | 114 篇 | **≥ 154 篇** | **+40**（LLM 17 + CV 13 + 嵌入式 7 + 交叉 3） |
| 专题 Pitfall 类情报 | 73 篇 | **≥ 103 篇** | **+30**（LLM 应用 10 + CV/多模态 7 + DL/CUDA 训练 6 + 嵌入式/HW 7） |
| 术语库（glossary terms.json） | 60 条 | **≥ 100 条** | **+40** 条，其中 80% 带 ≥ 1 篇 .md 详情页 |
| Toolbox 工具（70 已存） | 20/70 有链接 | **70/70 有链接 + related 覆盖 ≥ 85%** | 补齐 50 个 TOOL_IDS URL + 双向引用 |
| 实战 Practice 项目 | 少量 | **+5** | CV 2 + LLM 2 + 嵌入式 1 |
| 130+ 情报内容深度（字数中值） | ≈ 1,800 字 | ≥ **3,500 字**（翻倍） | 每篇补「练习题 / 常见误区 / 核心拆解 🔑」三大章节 |
| 交叉引用覆盖率（每篇平均 related* 数量） | relatedIntel≈1.2，relatedTerms≈0.8，relatedNodes≈0.6 | **≥ 3.5 intel + ≥ 2.5 terms + ≥ 1.8 nodes + ≥ 1.2 tools**（全部翻倍以上） | 消除"孤岛"内容（孤立率从 ≈ 25% → 0%） |
| 学习路径（learning-paths.ts） | 3 条 | **≥ 8 条** | 每条 7-14 步 |

---

## 2. 新增 40 篇标准情报（按方向分解，优先级排序 P0→P3）

### 2.1 LLM 主线（17 篇，P0-P1，前 4 周完成）

| 编号 | 计划 slug | 标题（暂定）| 难度 | 前置依赖（existing intel）| 关联新增术语 |
|---|---|---|---|---|---|
| N-LLM-01 | 200-diffusion-text-to-image | Diffusion 文生图原理与 Stable Diffusion 架构 | advanced | 063-cv-diffusion, 029-moe-mixture-of-experts | diffusion-model, self-attention |
| N-LLM-02 | 201-flash-attention | FlashAttention v2/v3 内存访问优化解析 | advanced | 001-transformer, 065-llm-inference-optimization | kv-cache, self-attention |
| N-LLM-03 | 202-speculative-decoding | 投机解码（Speculative Decoding）加速推理 | advanced | 065-llm-inference-optimization, 032-model-quantization | kv-cache, batch-inference |
| N-LLM-04 | 203-rag-hybrid-search | RAG 混合检索：关键词 + 向量 + Reranker 三段式 | intermediate | 005-rag, 035-advanced-rag, 188-reranker-multilingual | rag, reranker, multimodal-rag |
| N-LLM-05 | 204-agent-multi-planning | 多 Agent 协作：ReAct / Reflexion / Plan-Execute | advanced | 031-agentic-ai, 046-agent-intro | chain-of-thought, function-calling |
| N-LLM-06 | 205-llm-structured-output | LLM 结构化输出：JSON Schema / Pydantic / Instructor | intermediate | 036-code-generation, 020-prompt-engineering | function-calling |
| N-LLM-07 | 206-sft-data-pipeline | SFT 数据流水线：格式清洗 → 去重 → 质量打分 | intermediate | 041-lora-finetuning, 040-data-annotation | fine-tuning, data-poisoning-defense |
| N-LLM-08 | 207-dpo-direct-preference | DPO / ORPO / KTO 偏好对齐对比 | advanced | 027-rlhf-alignment, 044-rlhf | rlhf |
| N-LLM-09 | 208-mixture-of-depths | MoD（混合深度）与动态 token 路由 | advanced | 029-moe-mixture-of-experts, 001-transformer | （新 term: mixture-of-depths）|
| N-LLM-10 | 209-prompt-injection-defense | Prompt 注入攻防 10 类实战 | advanced | 038-llm-security, 191-pitfall-prompt-injection-defense | data-poisoning-defense |
| N-LLM-11 | 210-data-poisoning-defense | 训练数据投毒与防御（后门/水印/背刺）| advanced | 040-data-annotation, 190-pitfall-data-poisoning | data-poisoning-defense, synthetic-data-generation |
| N-LLM-12 | 211-function-calling-eval | Function Calling 评估标准与端到端测试 | intermediate | 036-code-generation, 187-llm-eval-ragas | function-calling, llm-eval-ragas |
| N-LLM-13 | 212-edge-llm-quantization | 端侧 LLM 量化：GPTQ/AWQ/FP8 vs Qwen2.5-1.5B | advanced | 032-model-quantization, 172-tinyml-mcu-deploy | tinyml |
| N-LLM-14 | 213-llm-distillation | 大模型蒸馏：Teacher-Student / Self-Distill | advanced | 041-lora-finetuning, 003-lora-qlora | fine-tuning, lora |
| N-LLM-15 | 214-retrieval-augmented-finetune | RAF：检索增强 + 微调结合（NOTA / REALM）| advanced | 035-advanced-rag, 041-lora-finetuning | rag, lora, fine-tuning |
| N-LLM-16 | 215-long-context-yarn | 长上下文：NTK-aware / YaRN / StreamingLLM | advanced | 033-long-context-rope, 169-long-context-1m-token | long-context-window, kv-cache |
| N-LLM-17 | 216-llm-production-pipeline | LLM 应用生产化：Tracing / Evals / Guardrails | intermediate | 184-agent-tracing-eval, 183-gitops-argo-cd | agent-evals-tracing, gitops |

### 2.2 CV / 多模态主线（13 篇，P0-P1）

| # | slug | 标题 | 难度 | 前置 | 关联新增术语 |
|---|---|---|---|---|---|
| N-CV-01 | 220-open-vocab-detection | 开放词汇目标检测（Grounding DINO / OWL-ViT）| advanced | 002-yolo, 060-cv-instance-segmentation | bev-perception, vision-language-model |
| N-CV-02 | 221-video-segmentation-tracking | 视频分割 + 追踪：SAM2 + ByteDance-Tracker | intermediate | 163-sam2-video-segmentation, 121-object-tracking | sam2-video-segmentation, bev-perception |
| N-CV-03 | 222-vlm-ocr-doc-layout | 文档理解 VLM：LayoutLM / Donut / 表格提取 | intermediate | 062-cv-ocr, 164-vision-language-models | vision-language-model, ocr |
| N-CV-04 | 223-bev-perception-autonomous | BEV 多相机 3D 感知：BEVFormer / SurroundOcc | advanced | 167-autonomous-driving-perception, bev-perception term | bev-perception |
| N-CV-05 | 224-depth-estimation-monocular | 单目深度估计：MiDaS / Depth Anything / ZoeDepth | intermediate | 004-resnet, 006-cnn-basics | （新 term: monocular-depth）|
| N-CV-06 | 225-generative-3d-dreamfusion | 生成式 3D：DreamFusion / Instant3D / SDS Loss | advanced | 063-cv-diffusion, 120-3d-point-cloud | （新 term: score-distillation）|
| N-CV-07 | 226-image-restoration-denoise | 图像修复：去噪/超分/去模糊（NAFNet / HAT）| intermediate | 006-cnn-basics, 063-cv-diffusion | diffusion-model, resnet |
| N-CV-08 | 227-remote-sensing-ssl | 遥感自监督：Moco/SimCLR/MAE 在 RS 场景 | advanced | 166-remote-sensing-change-detection | remote-sensing-change-detection |
| N-CV-09 | 228-medical-imaging-seg | 医学影像：nnU-Net / SAM-Med3D 实战 | advanced | 165-medical-image-segmentation, instance-segmentation | instance-segmentation |
| N-CV-10 | 229-few-shot-classification | 小样本 / 零样本分类：CLIP / CoOp / PromptSlim | intermediate | 004-resnet, vision-language-model term | vision-language-model, chain-of-thought |
| N-CV-11 | 230-face-swap-deepfake-trace | Deepfake 生成 + 鉴伪：FaceSwap / Xception | advanced | 063-cv-diffusion, 038-llm-security | diffusion-model, data-poisoning-defense |
| N-CV-12 | 231-slam-visual-inertial | VIO-SLAM：ORB-SLAM3 / VINS-Fusion | advanced | 121-object-tracking, 120-3d-point-cloud | （新 term: visual-slam）|
| N-CV-13 | 232-anomaly-detection-surface | 工业缺陷检测：PatchCore / CFlow / PaDiM | intermediate | 118-anomaly-detection, 060-cv-instance-segmentation | instance-segmentation |

### 2.3 嵌入式主线（7 篇，P1-P2）

| # | slug | 标题 | 难度 | 前置 | 关联新增术语 |
|---|---|---|---|---|---|
| N-EMB-01 | 240-embedded-freertos-rtos | FreeRTOS 内核详解：任务调度 + 队列 + 信号量 | intermediate | 053-embedded-rtos, 052-embedded-c | freertos, rtos |
| N-EMB-02 | 241-stm32-hal-dma-it | STM32 HAL / LL 库：DMA + 中断优先级实战 | intermediate | 078-embedded-hal, 077-embedded-driver | （新 term: stm32-hal）|
| N-EMB-03 | 242-rust-embedded-no-std | Rust 嵌入式：`#![no_std]` + embassy + PAC 入门 | advanced | 052-embedded-c, 069-embedded-arduino | tinyml |
| N-EMB-04 | 244-ros2-nav2 | ROS2 Navigation2：AMCL / NavFn / 代价地图 | advanced | 058-ctrl-ros, 057-ctrl-pid | （新 term: ros2-nav2）|
| N-EMB-05 | 245-pcb-emc-design | PCB EMC 设计：阻抗匹配 + 地平面 + 滤波 | advanced | 080-elec-pcb, 071-elec-power-systems | circuit, kicad |
| N-EMB-06 | 246-fpga-verilog-basics | FPGA Verilog 基础：时序逻辑 / IP 核 / Vivado 流程 | advanced | 079-elec-digital, 054-elec-circuit | （新 term: fpga-verilog）|
| N-EMB-07 | 247-motor-foc-advanced | FOC 进阶：编码器 / 观测器 / MTPA / 弱磁 | advanced | 059-elec-motor, foc term | foc, pid-controller |

### 2.4 跨方向/工程部署补充（3 篇，P2）

| # | slug | 标题 | 难度 | 前置 |
|---|---|---|---|---|
| N-CROSS-01 | 250-mlops-zenhof-pipeline | MLOps 端到端：ZenML + BentoML + MLFlow | intermediate | 043-mlops-engineering, 018-mlflow |
| N-CROSS-02 | 251-dataops-delta-lake | Data Lakehouse：Delta Lake + Iceberg 原理对比 | intermediate | 023-data-pipeline-etl, 076-cs-database |
| N-CROSS-03 | 252-cloud-ai-tco | 云上 AI 资源选型与 TCO 优化：A100 vs L4 vs S5XL | intermediate | 152-pitfall-docker-gpu-not-available, 034-cuda-programming |

---

## 3. 新增 30 篇 Pitfall 类情报（174-182 已存在 → 再 +30 = 103）

### 3.1 LLM 应用专题（10 篇，P1）

- P-LLM-01 pitfall-llm-temperature-zero：Temperature=0 导致的"隐形退化"（幻觉反而更多？）
- P-LLM-02 pitfall-llm-context-pollution：长上下文中的"中间遗忘"(Lost in the Middle)
- P-LLM-03 pitfall-llm-function-call-jailbreak：工具调用参数注入逃逸
- P-LLM-04 pitfall-llm-chinese-punctuation：中文标点/全角引发的 JSON 解析失败（SFT 数据偏西文）
- P-LLM-05 pitfall-rag-chunk-size：Chunk size 与 embedding 维度的匹配陷阱
- P-LLM-06 pitfall-rag-deduplication：重复文档导致检索分数被稀释
- P-LLM-07 pitfall-lora-adapter-merge：LoRA merge 后数值溢出（未反量化）
- P-LLM-08 pitfall-llm-eval-contamination：评估集与 SFT 集重叠导致虚高
- P-LLM-09 pitfall-agent-tool-loop：Agent 工具死循环（无限调同工具）
- P-LLM-10 pitfall-multimodal-prompt-order：多模态下图像/文本位置对输出的影响

### 3.2 CV/多模态专题（7 篇，P1-P2）

- P-CV-01 pitfall-cv-augmentation-leak：数据增强时「归一化顺序」造成 train/val 分布漂移
- P-CV-02 pitfall-detection-bbox-format：bbox 格式 xyxy / xywh / cxcywh 搞混导致 mAP 跳水
- P-CV-03 pitfall-segmentation-mask-encoding：RLE / COCO Polygon / mask-rcnn 格式互转错误
- P-CV-04 pitfall-video-fps-drop：视频模型推断中 codec 与 OpenCV backends 不一致
- P-CV-05 pitfall-vlm-pixel-means：VLM 图像均值/方差（CLIP vs ImageNet）混用
- P-CV-06 pitfall-sam2-mask-order（174 已存在 → 本批新增类似）：174 独立保留，另补 pitfall-sam2-prompt-reorder
- P-CV-07 pitfall-depth-scale：深度估计模型 scale ambiguity（无度量）在工程中引发碰撞

### 3.3 DL / CUDA 训练专题（6 篇，P1）

- P-DL-01 pitfall-mixed-precision-scale：AMP 动态溢出导致 NaN（init_scale 选大了）
- P-DL-02 pitfall-gradient-accumulation-bs：梯度累积的 BatchNorm 更新 Bug
- P-DL-03 pitfall-dataloader-worker-init：多 worker 随机种子重复 → 数据增强多样性下降（与 149 区分视角）
- P-DL-04 pitfall-cuda-stream-sync：多流异步导致的数据"读还没写完就用了"
- P-DL-05 pitfall-ema-decay-misconfig：EMA decay 太小 → 模型与 teacher 偏离过远
- P-DL-06 pitfall-distributed-nccl-handle：多机 NCCL communicator 泄漏

### 3.4 嵌入式 / 硬件专题（7 篇，P2）

- P-HW-01 pitfall-rtos-stack-canary：栈金丝雀 + MPU 配合漏配（与 141 区分）
- P-HW-02 pitfall-uart-dma-idle：UART DMA 空闲中断帧边界丢字节
- P-HW-03 pitfall-i2c-arbitration：I2C 多主仲裁失败恢复
- P-HW-04 pitfall-spi-cpol-cpha：SPI CPOL/CPHA 模式不匹配
- P-HW-05 pitfall-pcb-via-stitching：电源层过孔缝合不足引发噪声
- P-HW-06 pitfall-fpga-clock-domain：CDC 跨时钟域亚稳态
- P-HW-07 pitfall-motor-current-sense：相电流采样窗口不对导致 FOC 震荡

---

## 4. 新增 40 条术语（按关联主题）

> 目标：每条新增 intel 至少配套 1-2 条对应术语条目。
> 40 条分 4 批对齐上方 40/13/7/3 个 intel 主题。

### 4.1 LLM 术语（14 条）
`flash-attention`, `speculative-decoding`, `mixture-of-depths`, `preference-learning-dpo`, `dpo-orpo-kto-comparison`, `structured-output-schema`, `speculative-sampling`, `retrieval-augmented-finetune`, `yarn-rope-scaling`, `preference-models`, `synthetic-data-curation`, `agent-reflexion`, `prompt-injection-classification`, `latent-consistency-model`

### 4.2 CV/多模态术语（12 条）
`grounding-dino`, `bev-3d-perception`, `sam-video-tracking`, `depth-anything`, `dreamfusion-sds`, `nn-unet-framework`, `patchcore-anomaly`, `visual-slam-orbslam3`, `document-layout-vlm`, `fpga-verilog-digital-design`, `open-vocab-detection`, `deepfake-forgery-detection`

### 4.3 嵌入式术语（9 条）
`freertos-kernel`, `stm32-hal-dma`, `rust-embedded-nostd`, `ros2-nav2-stack`, `pcb-emc-engineering`, `verilog-fpga-design`, `foc-sensorless-observer`, `embedded-mpu-memory-protection`, `motor-foc-mtpa-weakening`

### 4.4 工程 / 交叉术语（5 条）
`mlops-zenml-pipeline`, `delta-lake-iceberg`, `cloud-ai-gpu-tco`, `function-calling-benchmark`, `data-curitation-quality-score`

每条术语的配套字段：**relatedTerms ≥ 2，relatedIntel ≥ 2，relatedNodes ≥ 1，relatedTools ≥ 1**（交叉引用强制）。

---

## 5. 工具箱完善目标（70 款 Tool × 4 个双向引用字段）

**本轮 TOP 优先级**：
1. **补齐 50 个缺失的 TOOL_IDS 文档 URL**：matlab / redis / ltspice / postman / opencv / langchain / git / chromadb / airflow / streamlit / kubernetes / dask / mysql / pytorch / pgvector / ros2 / vllm / docker / numpy / kicad / pandas / wireshark / fastapi / grafana / freertos / codesys / vscode / prometheus / mlflow / gradio / gcc / stm32cubemx —— 32 个已被脚本明确标红，剩余 18 款来自 tools.json
2. **相关引用覆盖率**：从 < 50% → ≥ **85%**，工具 → 情报/节点/术语的每个字段至少填 **2 条**
3. **使用场景**：scenarios 从当前 10+ → 扩到 16 个，覆盖 CV 数据标注 / LLM 结构化输出 / 嵌入式 CI / 医学影像 / VIO-SLAM / MLOps DataOps 等新场景

---

## 6. 学习路径新增（从 3 条 → 8 条）

| 路径 ID | 名称 | 适用人群 | 节点数 |
|---|---|---|---|
| LP-CV-01（已有） | CV 入门路径 | 零基础 | 7 |
| LP-LLM-01（已有）| LLM 应用路径 | 有 Python 基础 | 10 |
| LP-EMB-01（已有）| 嵌入式入门 | 有 C 基础 | 8 |
| LP-LLM-02 **（新增）**| LLM 推理/部署工程师路径 | 有 PyTorch 基础 | 12 |
| LP-CV-02 **（新增）**| 多模态 VLM 工程路径 | 有 CV 基础 | 11 |
| LP-CV-03 **（新增）**| 自动驾驶感知路径（BEV + SLAM）| 中级工程师 | 14 |
| LP-EMB-02 **（新增）**| ROS2 机器人算法路径 | 中级 | 9 |
| LP-MLOPS **（新增）**| MLOps/DataOps 工程路径 | 全栈入门 | 10 |

---

## 7. 优化目标（114 篇标准情报，不含 Pitfall）

> 114 篇分为 3 档按优先级（A 档 20 篇必须全量过、B 档 40 篇、C 档 54 篇根据人力灵活选做）

| 档位 | 数量 | 覆盖方向 | 每篇优化动作（最低） |
|---|---|---|---|
| **A 档（P0）** | 20 篇 | LLM TOP 10 + CV TOP 6 + 嵌入式 TOP 4 | ① 字数 ≥ 4000 字 ② 新增「练习题 3 道」「常见误区 3 条」「🔑 核心知识点 6 个」三章 ③ related* 字段双向闭环 ④ takeaways 4 条标准化 |
| **B 档（P1）** | 40 篇 | 除 A 档外剩余 LLM/CV/嵌入式全量 | ① 字数 ≥ 3000 字 ② takeaways + prerequisites 100% 合规 ③ relatedIntel ≥ 3 / relatedTerms ≥ 2 / relatedNodes ≥ 1 |
| **C 档（P2）** | 54 篇 | 非核心方向（math/cs/devops/best-practices/electrical/control/signals） | ① related* 字段不空白 ② 代码块补充可运行环境 ③ summary 精简到 50 字内 |

---

## 8. 内容质量验收统一标准（所有新增 + 优化共用）

**准入门槛（过则合入，不过则打回）**：

| 检查项 | 工具 / 脚本 | 失败处理 |
|---|---|---|
| YAML frontmatter 可正常 parse | `gray-matter` + 内容读取 | 打回重写 |
| 必填字段全部非空（title / category / difficulty / duration / summary / keywords / tags）| content-quality.test.ts | 打回补 |
| 正文长度（标准 ≥ 2000 字；pitfall ≥ 1200 字）| content-quality.test.ts 扩展 | 补字数 |
| 代码块率：1 个 / 每 1500 字（且可通过简单语法检查）| 审计脚本扩展 | 补示例 |
| relatedIntel / relatedTerms / relatedNodes 每个 slug 均存在于注册表 | `check-constants.py`（Sprint 前校验） | 修正 ID，不允许悬垂 |
| 新增 intel 的编号顺序正确（≥ 200 起号）| `check-constants.py` 扩展 | 改编号 |
| 分类 category ∈ ContentCategory 枚举 13 类 | `isValidCategory()` | 修正分类 |
| `difficulty` 合规 + 实际难度匹配（人工交叉审）| 人工 Review + checklist | 调整难度徽章 |
| 格式风格：标题层级 ≤ H3、术语首出现自动加 glossary 链接 | lint + 人工 | 修格式 |
