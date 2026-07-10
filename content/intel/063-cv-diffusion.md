---
title: CV Diffusion（扩散模型）
category: computer-vision
difficulty: intermediate
duration: 1-2周
summary: Diffusion Model 通过逐步添加噪声再逐步去噪来生成图像，是 AIGC 时代图像生成的主流架构。
takeaways: '- 搞懂 DDPM 的前向加噪过程和反向去噪过程，理解为什么"去噪"可以生成数据
  - 能画出 Stable Diffusion 的 Latent Diffusion 架构，说清 VAE、UNet、Text Encoder 各组件的作用
  - 理解 Classifier-Free Guidance 的原理——用条件概率的差值来引导生成方向
  - 理解 LoRA 如何适配 Stable Diffusion，实现轻量级微调
  - 用 diffusers 库跑通文生图、图生图完整流程'
relatedTerms: ["cnn", "yolo", "diffusion-model", "resnet"]
relatedIntel: "- 002-yolo
  - 004-resnet
  - 006-cnn-basics"
tags: "- diffusion-model
  - ddpm
  - stable-diffusion
  - gan-comparison
  - image-generation
  - score-based-model"
relatedTools: ["ultralytics-yolo", "numpy", "matplotlib"]
relatedNodes: ["cv-detection", "cv-segmentation"]
---

## 为什么你要学它

先讲结论：**Diffusion Model = 让 AI 学会"从噪声中还原信息"，这正是人类艺术创作的反过程。**

它在 2020 年后迅速超越 GAN 成为图像生成的主流方法。实际应用场景覆盖：

- **AIGC 内容创作**：Midjourney、Stable Diffusion、DALL-E 3 生成插画、海报、概念图
- **工业设计**：快速生成产品外观设计稿，设计师在此基础上迭代
- **游戏/影视资产**：批量生成游戏场景、角色立绘、影视分镜
- **图像编辑/修复**：Inpainting、outpainting、图像修复、超分辨率
- **医学影像**：CT/MRI 图像增强、数据增强

相比 GAN，Diffusion 训练更稳定（无需对抗训练），生成多样性更好，条件控制能力（文本控制）更强。

## 一句话概览（快速版）

你只要记住三句话：

1. **前向过程 = 逐步给数据加噪声，直到变成纯高斯噪声**（猫图 → 噪声图）
2. **反向过程 = 用神经网络逐步去噪，学会从噪声还原数据**（噪声图 → 猫图）
3. **Stable Diffusion 把去噪过程搬到低维 Latent 空间，大幅降低算力需求**

## 核心拆解

### 🔑 DDPM 原理（去噪扩散概率模型）

DDPM 两个过程：

**前向过程（Forward Process）**：
逐步向图像添加高斯噪声，经过 T 步（通常 T=1000）后图像变成纯噪声。

```
q(x_t | x_{t-1}) = N(x_t; sqrt(1 - β_t} x_{t-1}, β_t I)
```

利用重参数化技巧，可以直接从 x_0 得到任意 x_t，无需迭代。

**反向过程（Reverse Process）**：
训练一个神经网络 p_θ(x_{t-1} | x_t) 来逐步去除噪声。

```
p_θ(x_{t-1} | x_t) = N(x_{t-1}; μ_θ(x_t, t), Σ_θ(x_t, t))
```

训练目标是最小化 p_θ 和真实反向过程的 KL 散度，可以简化为预测噪声 ε_θ。

### 🔑 Stable Diffusion 架构（Latent Diffusion Model）

Stable Diffusion 不直接在像素空间做扩散，而是在压缩后的 Latent 空间（压缩倍数约 8x）中操作。这使计算量降低数十倍。

三大组件：

1. **VAE（Variational Autoencoder）**：将图像压缩到 Latent 空间，和从 Latent 空间还原图像
2. **UNet + Cross-Attention**：UNet 负责去噪，Cross-Attention 负责注入文本条件
3. **Text Encoder（CLIP Text Encoder）**：将文本提示转为向量，注入去噪过程

生成流程：文本 → CLIP 编码 → Latent 空间迭代去噪 → VAE 解码 → 图像

### 🔑 Classifier-Free Guidance（CFG）

CFG 是一种无需单独训练分类器即可引导生成方向的技术。

核心公式：

```
ε̂(x_t, y) = ε_θ(x_t, ∅) + w · (ε_θ(x_t, y) - ε_θ(x_t, ∅))
```

其中 y 是条件（文本），∅ 是无条件，w 是 guidance scale（通常 7-12）。

**直觉理解**：用"有条件噪声预测"减去"无条件噪声预测"，得到条件方向，再放大 w 倍叠加回去。w 越大，生成越符合文本提示，但也可能降低多样性。

### 🔑 LoRA 在 Diffusion 中的应用

LoRA（Low-Rank Adaptation）通过低秩矩阵分解来微调大模型：

- 原始权重 W_0 保持冻结
- 新增 ΔW = A · B（A: d×r, B: r×k，r 是秩，远小于 d）
- 最终权重 W = W_0 + ΔW

在 Stable Diffusion 中，LoRA 通常作用于 UNet 的 Cross-Attention 层和 Text Encoder。显存需求从全量微调的数十 GB 降至几 GB，适合在消费级显卡上微调。

## 完整跑通方案

**环境准备**：

```bash
pip install diffusers transformers accelerate scipy safetensors
```

**第一步：文生图（Text-to-Image）**

```python
from diffusers import StableDiffusionPipeline
import torch

# 加载模型（首次运行自动下载）
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
    variant="fp16"
)
pipe.to("cuda" if torch.cuda.is_available() else "cpu")

# 生成图像
prompt = "a cute cat wearing a space suit, digital art, highly detailed"
image = pipe(prompt, num_inference_steps=50, guidance_scale=7.5).images[0]
image.save("output.png")
```

**第二步：图生图（Image-to-Image）**

```python
from diffusers import StableDiffusionImg2ImgPipeline
from PIL import Image

pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
    variant="fp16"
)
pipe.to("cuda" if torch.cuda.is_available() else "cpu")

# 读取原始图像
init_image = Image.open("input.jpg").convert("RGB").resize((512, 512))

# 以原始图像为起点生成
prompt = "the same cat but in a futuristic city"
image = pipe(
    prompt=prompt,
    image=init_image,
    strength=0.75,  # 保留原始图像的程度（0-1）
    guidance_scale=7.5
).images[0]
image.save("output_img2img.png")
```

**第三步：使用 LoRA 微调**

```python
import torch
from diffusers import StableDiffusionPipeline
from peft import LoraConfig, get_peft_model

# 加载基础模型
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16
).to("cuda")

# 定义 LoRA 配置
lora_config = LoraConfig(
    r=4,                      # 秩，越大效果越好但参数量越大
    lora_alpha=4,
    target_modules=["to_k", "to_q", "to_v", "to_out.0"],
    lora_dropout=0.05
)

# 将 LoRA 注入 UNet
unet = get_peft_model(pipe.unet, lora_config)
pipe.unet = unet
# 然后用你的数据集微调（训练时用 pipe.unet 或直接用 unet 均可）
```

**第四步：Inpainting（局部重绘）**

```python
from diffusers import StableDiffusionInpaintPipeline

pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
    variant="fp16"
)
pipe.to("cuda" if torch.cuda.is_available() else "cpu")

# 原图 + mask（白色区域会被重绘）
prompt = "replace the background with a beautiful garden"
image = pipe(
    prompt=prompt,
    image=init_image,
    mask_image=mask_image,  # Image对象，白色=重绘区域
    guidance_scale=7.5
).images[0]
```

## 常见错误和解决方案

**OOM（显存不足）**

```
OutOfMemoryError: CUDA out of memory
```

解决：降低 resolution（用 512×512 而非 1024×1024）、开启 attention slicing（`pipe.enable_attention_slicing()`）、使用 `--low-vram` flag、或切换到更小的模型如 `stable-diffusion-2-1-base`。

**生成的图像模糊或噪声过多**
解决：增加 `num_inference_steps`（50-100 为宜），调整 `guidance_scale`（7.5-12 之间），更换更好的 seed。

**文生图结果与提示不匹配**
解决：使用更精确的描述（具体颜色、材质、光照），尝试 negative prompt 排除不想要的内容，检查 Text Encoder 是否与模型版本匹配。

**LoRA 训练后模型效果差**
解决：确保数据集质量（图文相关、分辨率一致），检查 r 值是否过小（建议至少 r=4），确认学习率设置合理（通常 1e-4 量级）。

**CLIP Attention 报错**

```
RuntimeError: expected scalar type Float but found Half
```

解决：确保 VAE 和 Text Encoder 使用 float32（`torch_dtype=torch.float32`），或所有组件统一使用 float16。

## 推荐学习顺序

1. 先读 Lilian Weng 的博客"What are Diffusion Models?"（数学推导清晰）
2. 看 NeurIPS 2020 Denoising Diffusion Probabilistic Models 论文
3. 阅读 Stable Diffusion 论文（High-Resolution Image Synthesis with Latent Diffusion Models）
4. 学习 diffusers 库官方文档和示例代码
5. 尝试在本地部署 ComfyUI，通过可视化工作流理解 Diffusion 全流程
