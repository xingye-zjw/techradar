# 扩散模型（Diffusion Model）

**扩散模型**是一类基于概率论的生成模型，核心思想是：向数据中逐步添加噪声（正向过程），然后学习逆向去噪过程来生成图像。

## 核心原理

### 正向过程（Forward Process）

```
x₀ → x₁ → x₂ → ... → xₜ
数据    加噪   加噪        纯噪声

q(xₜ|xₜ₋₁) = N(xₜ; √(1-βₜ)xₜ₋₁, βₜI)
```

逐步添加高斯噪声，直到数据变成纯噪声。

### 逆向过程（Reverse Process）

```
xₜ → xₜ₋₁ → ... → x₁ → x₀
纯噪声  去噪        去噪    生成数据

pθ(xₜ₋₁|xₜ) = N(xₜ₋₁; μθ(xₜ,t), σₜ²I)
```

学习神经网络预测噪声，从噪声中恢复数据。

## 关键技术演进

| 模型 | 年份 | 关键创新 |
|------|------|----------|
| DDPM | 2020 | 首个实用扩散模型 |
| DDIM | 2020 | 加速采样 |
| Latent Diffusion | 2022 | 潜在空间扩散 |
| **Stable Diffusion** | 2022 | 文生图主流应用 |
| ControlNet | 2023 | 条件控制生成 |
| SDXL | 2023 | 更高质量生成 |

## 简化实现示例

```python
import torch
import torch.nn as nn

class SimpleDiffusion(nn.Module):
    def __init__(self, model, timesteps=1000):
        super().__init__()
        self.model = model  # 噪声预测网络（如U-Net）
        self.timesteps = timesteps
        self.betas = torch.linspace(1e-4, 0.02, timesteps)
        self.alphas = 1 - self.betas
        self.alpha_cumprod = torch.cumprod(self.alphas, dim=0)
    
    def forward_diffusion(self, x0, t, noise=None):
        """正向加噪"""
        if noise is None:
            noise = torch.randn_like(x0)
        alpha_t = self.alpha_cumprod[t].view(-1, 1, 1, 1)
        return torch.sqrt(alpha_t) * x0 + torch.sqrt(1 - alpha_t) * noise, noise
    
    @torch.no_grad()
    def sample(self, shape):
        """逆向采样生成"""
        x = torch.randn(shape)
        for t in reversed(range(self.timesteps)):
            predicted_noise = self.model(x, t)
            # 去噪步骤
            x = self.p_sample(x, predicted_noise, t)
        return x
```

## 应用场景

- **文生图**：Stable Diffusion、DALL-E、Midjourney
- **图像编辑**：img2img、inpainting、outpainting
- **视频生成**：Sora、Runway Gen-2、Pika
- **3D生成**：点云生成、3D重建
- **音频生成**：语音合成、音乐生成

## Stable Diffusion 生态

```
Stable Diffusion
├── 文生图：txt2img
├── 图生图：img2img
├── 图像编辑：ControlNet、IP-Adapter
├── 高质量变体：SDXL、SD 3.0
├── 高效微调：LoRA、DreamBooth、Textual Inversion
└── 加速推理：LCM、SDXL-Turbo、LCM-LoRA
```

## 相关概念

[LoRA](/glossary/lora)、[变分自编码器](/glossary/vae)、[U-Net](/glossary/unet)、[生成对抗网络](/glossary/gan)
