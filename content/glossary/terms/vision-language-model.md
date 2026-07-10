---
title: 视觉语言模型
slug: vision-language-model
---

# 视觉语言模型

**VLM（Vision-Language Model，视觉语言模型）** 是一类同时理解图像与文本两种模态的多模态基础模型。它通过在大规模图文配对数据集上做对比学习或生成式预训练，学习视觉空间与语言空间的对齐表示，进而支持图文跨模态检索、图像字幕、视觉问答（VQA）、基于图像的开放对话、开放词汇检测/分割等多种任务。

## 从单模态到多模态的跨越

传统 AI 以单模态为主：

- **CV 模型**（ResNet、ViT）：输入图像 → 输出类别、检测框、掩码，但不懂「猫」这个词的语义
- **NLP 模型**（BERT、GPT）：输入文本 → 输出分类、文本生成，但无法直接看到像素

VLM 的核心创新是建立了一个**共享的多模态语义空间**——「一只坐在草地上的橘猫」这句话的嵌入向量，和对应橘猫照片的嵌入向量，在该空间中距离很近，而与一只狗的图像距离很远。

## VLM 预训练的三大范式

### 1. 对比学习（CLIP 风格）

**核心思想**：拉近匹配的图文对距离、推远不匹配的图文对距离

$$
\mathcal{L}_{\text{CLIP}} = -\frac{1}{N}\sum_{i=1}^N \log\frac{\exp(\text{sim}(t_i, v_i)/\tau)}{\sum_{j=1}^N \exp(\text{sim}(t_i, v_j)/\tau)}
$$

代表：**CLIP**（OpenAI 2021）、**ALIGN**（Google）、**Taiyi**（IDEA-CCNL）

架构：双塔独立编码器 → 共享投影头 → 对称 InfoNCE loss

| 双塔 CLIP 的优势                       | 双塔 CLIP 的局限                         |
| -------------------------------------- | ---------------------------------------- |
| 图文分别编码，检索极快（百万图/秒）    | 无法做细粒度视觉定位，看不到物体位置     |
| 训练稳定，数据要求宽松（无需精细标注） | 无法做生成类任务（VQA、字幕）            |
| 迁移到下游分类任务零样本即可用         | 图像和文本仅在末尾投影层交互，对齐粒度粗 |

### 2. 生成式预训练（BLIP-2 / Flamingo 风格）

**核心思想**：把图像当作「软 prompt」喂给 LLM，让 LLM 自回归输出关于图像的文本描述或回答

代表：**BLIP-2**（Salesforce）、**Flamingo**（DeepMind）、**LLaVA**、**GPT-4V**、**Gemini**

架构：图像编码器（冻结 ViT） + **Q-Former / Perceiver Resampler**（将图像特征压缩为 K 个视觉软 token，K 通常 32-64） + 冻结 LLM（LLaMA / Mistral）

关键创新**Q-Former**：不直接把 256 个 ViT patch token 全部塞给 LLM，而是用可学习的 Query 向量 Cross-Attend 图像特征，输出固定数量、信息浓缩的视觉软 token——这样无论图像分辨率多高，送进 LLM 的 token 数都恒定，兼顾效率与表达力。

### 3. 统一序列建模（Image as a Foreign Language）

**核心思想**：把图像离散化为「视觉词」（类似 BPE），直接用单一 Transformer 按文本方式处理图文拼接序列。

代表：**BeIT**、**BEIT-3**（微软）、**Vision-CAIR / Emu2**、**Kosmos**

以 BEIT-3 为例：图像被 VQ-VAE 编码为 1024 个视觉 token，与 BPE 文本 token 拼接后喂给统一的 Multiway Transformer（每个子层有视觉专家分支、文本专家分支、融合专家分支），共享 90% 参数。

## 主流开源 VLM 对比

| 模型             | 发布方     | 基座 LLM      | 核心技术                          | 关键能力                           |
| ---------------- | ---------- | ------------- | --------------------------------- | ---------------------------------- |
| **LLaVA-1.5**    | LLaVA 团队 | Vicuna-13B/7B | CLIP ViT-L + MLP 投影 + LoRA 微调 | 开源 VQA 标杆，支持 OCR 和多图对话 |
| **Qwen-VL-Max**  | 阿里巴巴   | Qwen-72B      | ViT 动态分辨率 + 采样器           | 极强多图推理、中文 OCR、长图像     |
| **InternVL2**    | 上海AI Lab | InternLM2     | 超大 ViT-6B + 动态分辨率 4K 图    | MMBench 接近 GPT-4V 水平           |
| **DeepSeek-VL2** | DeepSeek   | DeepSeek-V3   | 多分辨率 patch + 专家混合         | 强 OCR、强图表理解                 |
| **Phi-3-Vision** | Microsoft  | Phi-3-Mini    | SigLIP + 紧凑型架构               | 仅 4.2B 即可在手机端流畅运行       |

## 典型下游任务与实现方式

### 任务 1：开放词汇目标检测（Grounding DINO）

用户给一句「找所有红色圆形的交通标志」，模型直接输出坐标框，无需任何类别标注微调。

```python
from transformers import AutoProcessor, AutoModelForZeroShotObjectDetection

model_id = "IDEA-Research/grounding-dino-tiny"
processor = AutoProcessor.from_pretrained(model_id)
model = AutoModelForZeroShotObjectDetection.from_pretrained(model_id).to("cuda")

image = Image.open("street.jpg").convert("RGB")
text = "red circular traffic sign . person . car ."  # 多个类别用点分隔

inputs = processor(images=image, text=text, return_tensors="pt").to("cuda")
with torch.no_grad():
    outputs = model(**inputs)

results = processor.post_process_grounded_object_detection(
    outputs, inputs.input_ids,
    box_threshold=0.35, text_threshold=0.25,
    target_sizes=[image.size[::-1]]
)
# results[0] 中 scores, labels, boxes
```

### 任务 2：基于知识库图片的 VQA（多模态 RAG）

将产品说明书 PDF 的每一页（含图表、示意图）用 VLM 编码器提取多模态嵌入存入向量库，用户提问时同时检索文本块和图片块，再用 GPT-4V 合成回答：

```
用户：「这款相机的电池仓在机身哪里？拆开需要什么工具？」
  ↓ RAG 检索
相关文本块：×3 页说明书文字
相关图像块：×2 张机身爆炸图 + 电池仓特写
  ↓ 拼 Prompt 送进 GPT-4V
模型：「电池仓位于相机底部握把右侧（参考图 1），拆卸步骤：1) 下滑电池仓锁扣… 拆卸需使用 PH00 十字螺丝刀（见图 2 红圈处）」
```

## VLM 训练的工程要点

### 数据侧

训练 VLM 的数据质量远比数量重要：

1. **图文对齐度过滤**：用 CLIP 相似度剔除阈值 < 0.28 的图文对（噪声会严重污染对齐空间）
2. **合成高难数据**：用 GPT-4V 根据图像人工合成多轮对话、详细区域描述、反事实纠错问答
3. **OCR 数据注入**：混入 30% 带文字的文档/截图数据，防止模型「瞎认字」

### 训练侧

典型三阶段微调：

| 阶段              | 训练目标                     | 数据量        | 可训练参数                     |
| ----------------- | ---------------------------- | ------------- | ------------------------------ |
| S1: 投影层对齐    | Contrastive + Caption        | 1M 图文对     | 仅 Q-Former + Projection       |
| S2: 指令微调 LoRA | 多轮对话 SFT                 | 200K 指令数据 | ViT LoRA + LLM LoRA (rank=128) |
| S3: 全参数 DPO    | RLHF/VL-RLHF（对齐人类偏好） | 10K 偏好对    | 全参数                         |

### 推理侧

- **长图像支持**：不要强制中心裁剪，用动态分辨率 + padding 到固定 bucket，对 OCR、全景图精度提升巨大
- **系统提示词工程**：默认注入「请基于视觉事实作答，不要猜测。如果无法从图像中得出，明确说明看不清。」可降低幻觉率 20%+

## VLM 的幻觉问题与缓解

幻觉是 VLM 最大的落地障碍：

- **对象幻觉**：图里只有一只猫，VLM 回答「一只猫旁边有一只狗」
- **属性幻觉**：图里是红色汽车，回答「蓝色汽车」
- **文字幻觉**：图里写「OPEN 24H」，回答「图中文字为 'OPEN 8:00-22:00'」

缓解方案：

1. **专门 OCR 分支**：让 VLM 内部集成 PaddleOCR 结果做校准
2. **对象前置检查**：回答前先用 Grounding DINO 验证提到的物体是否真的存在
3. **视觉 Chain-of-Thought**：让模型先描述图中可见的所有元素，再逐步推导答案
4. **多图自一致性**：同一场景拍 3 张图交叉验证，多数投票作为答案

## VLM 与 LLM Agent 的融合

VLM 正在从「看图说话工具」进化为「AI 智能体的眼睛」：

- **桌面自动化 Agent**：屏幕截图 → VLM 理解 UI 布局和按钮文字 → 函数调用执行点击/输入
- **机器人导航 Agent**：摄像头画面 + 3D 深度图 → VLM 识别可走区域、障碍物、目标物体
- **代码调试 Agent**：IDE 报错截图（含行号高亮堆栈）→ VLM 转成文本 → LLM 分析修复
- **多模态工具调用**：VLM 可以自己决定「这张发票太模糊，我先调用 enhance_image 工具超分辨率后再识别」

未来 VLM 的三个方向：

1. **分辨率继续提升**：8K 图像、视频整段理解成为标配
2. **Any-to-Any 生成**：不仅看懂，还能根据描述直接编辑/生成图像（VLM + Diffusion 统一架构）
3. **实时交互**：结合语音和机械臂，实现真正的具身多模态对话 Agent

相关术语：[Transformer](/glossary/transformer)、[RAG](/glossary/rag)、[扩散模型](/glossary/diffusion-model)、[多模态RAG](/glossary/multimodal-rag)、[重排序器](/glossary/reranker)
