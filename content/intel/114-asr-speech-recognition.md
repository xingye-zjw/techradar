---
title: 语音识别（ASR）
category: speech
difficulty: intermediate
duration: 2-3周
summary: 让计算机听懂人类说话的技术，从传统 HMM-GMM 到端到端深度学习，再到 OpenAI Whisper 一统江湖。
takeaways:
  - 搞懂语音信号怎么变成特征（MFCC、Mel谱图），这是所有语音技术的基础
  - 能说出三种端到端ASR范式（CTC、Attention Seq2Seq、Transducer）的区别和适用场景
  - 理解 Whisper 为什么能成为工业界标配，以及它的架构设计
  - 用 Whisper 跑通一个完整的语音识别 demo，计算 WER 评估效果
  - 知道中文语音识别的特殊挑战（声调、方言、同音字）
relatedTools: whisper
relatedIntel:
  - 115-tts-speech-synthesis
  - 001-transformer
tags:
  - asr
  - speech recognition
  - whisper
  - mfcc
  - ctc
  - attention
  - transducer
  - hmm-gmm
---

## 为什么你要学它

先讲结论：**语音识别 = 让计算机把"声音波形"翻译成"文字"，是人机交互最自然的接口。**

你每天用的 Siri、小爱同学、微信语音转文字、会议记录工具……背后都是 ASR（Automatic Speech Recognition，自动语音识别）技术。

过去十年，ASR 经历了三次范式跃迁：
1. **传统时代**（~2012）：HMM-GMM 混合架构，需要语言学专家手工设计特征，WER 居高不下
2. **深度学习时代**（2012-2020）：端到端模型（CTC/Attention/Transducer），WER 大幅下降
3. **大模型时代**（2022~）：Whisper 用 68 万小时数据训练，多语言、多口音、鲁棒性拉满

理解 ASR 你会发现：它是少有的"传统方法完全被深度学习彻底替代"的领域。今天你不再需要懂 HMM、GMM、决策树状态绑定这些复杂概念，但你仍然需要理解声音信号的物理特性——因为语音和文本/图像是完全不同的数据形态。

而且语音技术栈正在爆发：语音克隆（TTS）、说话人识别、声纹识别、语音情感识别、语音增强……ASR 是这一切的入口。

## 一句话概览（快速版）

你只要记住三句话：

1. **声音 → 特征**：原始波形通过 MFCC/Mel谱图提取声学特征，把一维信号变成二维"声谱图"
2. **特征 → 文字**：端到端模型（CTC/Attention/Transducer）把声学特征序列映射成文字序列
3. **Whisper = 工业界标配**：Encoder-Decoder 架构 + 大规模弱监督训练，开箱即用效果好

## 核心拆解

### 🔑 语音信号预处理

原始声音是**连续的模拟波形**，计算机无法直接处理。我们需要把它转换成结构化的特征表示。

**采样率**：语音识别通常用 **16kHz**（人说话的频率范围约 80-8000Hz，按奈奎斯特定理 16kHz 足够）。

**预处理四步走**：

```
原始波形 → 预加重 → 分帧 → 加窗 → FFT → Mel滤波 → 对数 → DCT → MFCC
```

**1. 预加重（Pre-emphasis）**
- 目的：提升高频部分能量，因为人声高频能量本来就低
- 公式：`y[n] = x[n] - 0.97 * x[n-1]`

**2. 分帧（Framing）**
- 语音是短时平稳信号（~25ms 内近似不变）
- 帧长：25ms（16kHz 下 = 400 个采样点）
- 帧移：10ms（160 个采样点），相邻帧重叠 15ms

**3. 加窗（Windowing）**
- 用汉明窗（Hamming Window）乘每一帧，减少帧两端平滑过渡
- 目的：减少 FFT 后的频谱泄漏
- 汉明窗：`w[n] = 0.54 - 0.46 * cos(2πn/N)`

**4. MFCC 提取**：
- **FFT**：每一帧做快速傅里叶变换，得到频谱
- **Mel 滤波组**：用 40 个 Mel 滤波器组模拟人耳对频率的非线性感知（低频分辨力强，高频弱）
- **对数**：取对数，模拟人耳对响度的感知也是对数的
- **DCT**：离散余弦变换，去除相关性，得到 13 维 MFCC 系数（通常取前 13 维）

> **Mel 谱图 vs MFCC**：
- Mel 谱图：Mel 滤波 + 对数，保留了频谱的整体形状（40 维）
- MFCC：再多一步 DCT，压缩到 13 维，去相关性，传统 HMM 时代常用
- 今天深度学习时代，**直接用 Mel 谱图当输入更常见**（保留信息更多）

### 🔑 传统 ASR 架构（HMM-GMM）

在深度学习之前，ASR 的标准架构是 **HMM-GMM 混合模型**：

```
声学模型（HMM-GMM） + 语言模型（N-gram） + 词典（发音词典）
```

- **GMM（高斯混合模型）：给每一帧声学特征建模，算它属于哪个音素的概率
- **HMM（隐马尔可夫模型）：建模音素的时序变化（三音素 triphone）
- **发音词典**：把词 → 音素序列的映射
- **语言模型**：N-gram，算词序列的概率

为什么不用学太深——因为它已经被端到端模型全面替代了。但你需要知道这些名词，读老论文时不会懵。

### 🔑 端到端 ASR 三大范式

深度学习时代，ASR 出现了三种主流架构，它们的核心区别在于：**怎么处理"声学帧序列"和"文字序列"长度不一致**的对齐问题。

#### 范式一：CTC（Connectionist Temporal Classification）

**问题**：输入 1 秒语音 = 100 帧，但可能只有 3 个字，怎么对齐？

**CTC 的思路**：引入空白符（blank），让模型自己学对齐。
- 输出序列比输入短没关系，中间插很多 blank，最后合并重复字符合并掉 blank 和重复字符。

**关键规则**：
1. 连续相同的字符合并（除非中间有 blank）
2. 去掉所有 blank
3. 剩下的就是最终文字

**例子**：
```
模型输出：h h e l l l o → hello
模型输出：h - e l - l o → hello  （- 表示 blank）
```

**CTC Loss**：在所有可能的对齐路径上求和（动态规划前向后向算法）。

**优点**：
- 训练简单，不需要强制对齐
- 推理快，可以流式输出

**缺点**：
- 假设各帧输出条件独立（实际语音有上下文依赖）
- 没有显式语言建模能力

代表模型：DeepSpeech2、Wav2Letter

#### 范式二：Attention-based Seq2Seq

**思路**：直接用 Encoder-Decoder + Attention，和机器翻译一模一样。
- Encoder：把声学特征编码成语义表示
- Decoder：一个词一个词地生成文字，每一步看 Encoder 的哪些位置（Attention）

**优点**：
- 效果好，没有条件独立假设
- 天然带语言模型能力

**缺点**：
- 不能流式识别（必须听完整个句子才能开始生成）
- 训练不稳定，容易出现Attention 漂移（attention drift）

代表模型：Listen, Attend and Spell（LAS）

#### 范式三：Transducer（RNN-T）

**CTC + Decoder = Transducer**，把两者优点结合起来。

架构：
- **Encoder**：处理声学特征，得到高级表示
- **Prediction Network**：处理已生成的文字（类似语言模型）
- **Joint Network**：把两者结合起来，在每个时间步预测下一个字符或输出 blank

**关键区别**：
- CTC：每个声学帧只能输出一个字符或 blank
- Transducer：每个声学帧可以输出 0 个或多个字符（通过 Prediction Network 循环生成）

**优点**：
- 可以流式识别
- 有语言建模能力，效果比 CTC 好

**缺点**：
- 训练慢，计算量大

代表模型：Google 的 Google 就是用 RNN-T 架构

> **三者对比总结**：

| 范式 | 流式 | 效果 | 训练难度 | 代表 |
|------|------|------|--------|------|
| CTC | ✅ | 一般 | 简单 | DeepSpeech2 |
| Attention Seq2Seq | ❌ | 好 | 中等 | LAS |
| Transducer | ✅ | 最好 | 难 | RNN-T |

### 🔑 Whisper 架构

OpenAI 在 2022 年发布的 Whisper，彻底改变了 ASR 行业格局。

**核心数据**：68 万小时多语言弱监督数据（从互联网爬的音频 + 自动字幕）。

**架构**：标准的 Encoder-Decoder Transformer。

```
音频 → Mel 谱图（80 维） → Encoder（Transformer Encoder） → Decoder（Transformer Decoder） → 文字
```

**关键设计**：
- **输入**：80 维 Mel 谱图，30 秒语音 = 3000 帧
- **Encoder**：
  - 先用 2 个 1D 卷积下采样（步长 2，总共下采样 4 倍）
  - 然后 N 层 Transformer Encoder
- **Decoder**：
  - 标准的 Transformer Decoder（自回归生成）
  - 输入是特殊 token + 已生成文字
  - Cross-Attention 看 Encoder 输出

**为什么 Whisper 这么强？**
1. **数据量大**：68 万小时，比之前公开数据集大 10 倍以上
2. **多语言**：96 种语言
3. **鲁棒性强**：噪音、口音、远场都能 handle
4. **多任务**：语音识别、语言检测、翻译、时间戳
5. **开箱即用**：pip install openai-whisper 就能用

**Whisper 的五个尺寸**：

| 模型 | 参数 | 相对速度 |
|------|------|----------|
| tiny | 39M | 32x |
| base | 74M | 16x |
| small | 244M | 6x |
| medium | 769M | 2x |
| large | 1550M | 1x |

### 🔑 中文语音识别特点

中文 ASR 比英文难，原因：

**1. 声调**
- 中文是声调语言，妈麻马骂不一样
- 基频（F0）是声调的主要声学特征
- 英文没有声调问题
- 同音字多：shi 有上百个字

**2. 分词问题**
- 中文词之间没有空格
- 识别的连续语音是连续的，怎么分词是连续的"字"的序列
- 英文天然空格分隔词

**3. 方言多样性**
- 普通话、粤语、上海话、四川话……
- 各方言差异巨大，几乎是不同语言

**4. 同音字**
- 中文同音字特别多
- 必须依赖上下文才能分辨

**中文 ASR 的特殊技巧**：
- 用字模型：字为单位建模（而不是音素）
- 声调建模：把声调当额外特征加进去
- 大语料：中文文本语料比英文多，语言模型更重要

## 完整跑通方案

**第一步：环境准备**

```bash
pip install openai-whisper
pip install librosa
pip install jiwer  # 算 WER
```

**第二步：用 Whisper 做语音识别**

```python
import whisper

# 加载模型（第一次会自动下载）
model = whisper.load_model("base")

# 加载音频并识别
result = model.transcribe("audio.mp3")
print(result["text"])

# 带时间戳
for segment in result["segments"]:
    print(f"[{segment['start']:.1f}s - {segment['end']:.1f}s] {segment['text']}")
```

**第三步：更详细的使用**

```python
import whisper
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"
model = whisper.load_model("medium", device=device)

# 指定语言，指定语言
audio = whisper.load_audio("audio.wav")
audio = whisper.pad_or_trim(audio)

# 生成 Mel 谱图
mel = whisper.log_mel_spectrogram(audio).to(model.device)

# 检测语言
_, probs = model.detect_language(mel)
print(f"检测到语言: {max(probs, key=probs.get)}")

# 解码
options = whisper.DecodingOptions(
    language="zh",
    task="transcribe",  # 或 "translate" 翻译成英文
    fp16=False
)
result = whisper.decode(model, mel, options)
print(result.text)
```

**第四步：计算 WER（词错误率）**

```python
from jiwer import wer

reference = "今天天气真好我们出去散步吧"
hypothesis = "今天天气号好我们出去散步把"

error = wer(reference, hypothesis)
print(f"WER: {error:.2%}")
```

**WER 公式**：
```
WER = (S + D + I) / N
S = 替换错误数
D = 删除错误数
I = 插入错误数
N = 参考词数
```

**第五步：批量处理长音频**

```python
import whisper

model = whisper.load_model("large")

result = model.transcribe(
    "long_audio.mp3",
    language="zh",
    verbose=True,  # 显示进度
    word_timestamps=True  # 每个词的时间戳
)

# 保存结果
with open("transcript.txt", "w", encoding="utf-8") as f:
    for segment in result["segments"]:
        f.write(f"[{segment['start']:.1f} - {segment['end']:.1f}] {segment['text']}\n")
```

**第六步：微调 Whisper（用 LoRA 高效微调）**

```python
# 使用 peft + bitsandbytes 做 LoRA 微调
# 在你的数据集上微调，几十条数据就能在特定领域效果提升明显
```

## 常见误区

**"ASR 就是把声音转文字，很简单吧？" → 错**。语音识别是 AI 领域最难的任务之一。噪音、口音、远场、混响、重叠说话人、方言、生僻词……每一个都能让 WER 翻倍。

**"MFCC 是最好的特征？" → 不是**。深度学习时代直接用原始波形（wav2vec）或 Mel 谱图更常用，MFCC 是传统方法的产物，丢掉了很多信息。

**"CTC、Attention、Transducer 选哪个？" → 看场景**。要流式选 Transducer，要效果好离线用 Attention，要简单用 CTC。工业界现在主流是 Transducer。

**"Whisper 是最好的 ASR 模型吗？" → 综合是，但不是所有场景**。Whisper 是通用场景下综合最强，但特定领域（医疗、法律、方言）微调后效果更好；而且 Whisper 不是流式的，实时场景用不了。

**"中文 ASR 只需要声学模型就行？" → 错**。语言模型对中文尤其重要，同音字太多了。

**"采样率越高越好？" → 不是**。16kHz 对语音识别足够了，再高只会增加计算量。人说话主要能量集中在 2kHz 以内。

## 学习资源推荐

1. **入门必读**：
   - 《语音识别：从入门到精通》（俞栋、俞凯）：经典教材，从传统讲到深度学习
   - Speech and Language Processing（Daniel Jurafsky）：第 26-27 章 ASR

2. **论文**：
   - CTC 论文：Connectionist Temporal Classification: Labelling Unsegmented Sequence Data with Recurrent Neural Networks (2006)
   - LAS 论文：Listen, Attend and Spell (2015)
   - RNN-T 论文：Sequence Transduction with Recurrent Neural Networks (2012)
   - Whisper 论文：Robust Speech Recognition via Large-Scale Weak Supervision (2022)
   - wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations (2020)

3. **开源项目**：
   - Whisper：https://github.com/openai/whisper
   - Whisper.cpp：C++ 版本，更快更小
   - FunASR：阿里达摩院开源，中文效果好
   - WhisperX：带说话人分离 + Whisper

4. **课程**：
   - 斯坦福 CS224S：Speech Processing（语音处理）
   - 李宏毅机器学习：语音识别部分讲得很清楚

5. **实践建议**：
   - 先用 Whisper 跑几个音频，建立直觉
   - 然后手写 CTC loss，理解对齐
   - 再看 LAS / Transducer 区别
   - 最后在你的领域数据上微调 Whisper
