---
title: 语音识别-ASR
slug: speech-asr
---

# 语音识别-ASR

**ASR（Automatic Speech Recognition，自动语音识别）** 是将人类语音音频信号（声波）自动转换为对应文字文本的技术，俗称「语音转文字」。ASR 是人机语音交互的入口层——智能音箱、AI 电话客服、同传翻译、会议纪要、车载语音助手，所有需要「听懂人话」的场景，第一个模块都是 ASR。

从产业规模看，ASR 是整个语音 AI 市场最大的子领域，占比超过 50%：

- 线上会议（腾讯会议/飞书/Zoom）实时字幕
- 电商/运营商 AI 客服
- 公检法庭审转写、医疗口述病历
- 短视频自动生成字幕 + 关键词标签

## ASR 演进史：从 GMM-HMM 到端到端大模型

### 第一代（1980s~2010s）：GMM-HMM 流水线 ASR（多模块拼接）

```
原始波形 16kHz PCM
    │
    ▼
【特征提取】MFCC / FBank（梅尔频率倒谱系数 / 梅尔滤波器组，40维）
    │  每 25ms 帧长 × 10ms 帧移 → 每秒 100 帧特征向量
    ▼
【声学模型 Acoustic Model】GMM-HMM（高斯混合模型 + 隐马尔可夫）
    │  输入：声学特征 → 输出：三音子（tri-phone）状态概率
    │  问题：GMM 对非线性建模能力弱，靠人工设计三音子状态，调参地狱
    ▼
【发音词典 Lexicon】
    │  《字典》：每个词的发音标注（例：苹果 → p i ng2 g uo3）
    │  人工维护几万~几十万词条，多音字是噩梦
    ▼
【语言模型 Language Model】N-gram（2~3 阶统计语言模型）
    │  统计文本中词出现频率：P(w_n | w_{n-1}, w_{n-2})
    │  解决声学上发音相近的词区分（gong si → 公司 / 公私 / 公示 / 攻势 → N-gram 判断「公司」概率最高）
    ▼
【解码器 WFST（Weighted Finite-State Transducer）】
    把声学 + 词典 + 语言模型四张 FST 图合成一张，动态规划找最优路径
    → 输出最终文字
```

特点：每个模块独立可解释、小数据可训；但流水线级联误差大、多音字/口音泛化差、部署超复杂（一个传统引擎动辄几十人年研发）。

### 第二代（2016~2022）：端到端神经网络 ASR

2016 年百度 DeepSpeech 2 / Google Listen-Attend-Spell 横空出世，ASR 进入 E2E 时代，主流三大架构：

#### 架构 A：CTC（Connectionist Temporal Classification）

解决最核心的痛点：输入声学特征（100 帧/秒）和输出文字（每秒 5~10 个字）**长度不对齐**的问题。

> 核心思想：引入一个特殊的空白符号 `<blank>` 和重复符号合并规则。
>
> 网络输出每帧都给一个概率分布（字母/汉字 + blank），然后去掉重复、去掉 blank → 自然对齐到正确文本长度，不需要强制逐帧标注对齐！

$$
\mathcal{L}_{\text{CTC}} = -\log \sum_{\pi \in B^{-1}(y)} p(\pi | x)
$$

（$B$ 是「去重去 blank」操作，所有可能路径 π 只要经过 B 都变成 y 就加概率和）

代表：**Jasper**（纯 Conv）、**Conformer-CTC**（目前工业部署最多的 CTC 架构，Transformer 卷积混合 Encoder）

优点：推理快、非自回归并行输出、延迟低
缺点：对上下文建模能力一般，中文多音字区分差

#### 架构 B：Attention-based Seq2Seq（LAS / RNN-T）

- Encoder：BiLSTM / Conformer 对声学特征编码
- Decoder：注意力解码器，看前面已经生成的文字 + 看 Encoder 输出的注意力对齐 → 自回归一个字一个字吐出来
- RNN-T（Transducer）额外加一个 Prediction Network，比 CTC 多了「语言模型建模」部分，字错率更低

代表：Google LAS、**Whisper Encoder-Decoder** 核心结构

优点：字错率（WER/CER）最低、语言模型内生建模效果好
缺点：自回归一个字一个字生成 → 高延迟，实时性差

### 第三代（2022 以后）：Whisper 生态一统天下

2022 年 9 月 OpenAI 发布 **Whisper**，改变了整个 ASR 产业：

- 训练数据史无前例：**68 万小时**弱标注多语言语音（网页视频字幕、播客、有声书）→ 之前业界最大公开数据集 LibriSpeech 才 1000 小时
- 架构：经典 Encoder-Decoder Transformer + 多任务预测（文字转录 + 语言识别 + 时间戳 + 说话人分类）
- 效果：**零样本跨域泛化能力爆炸**，直接拿来用不用微调，在很多小语种、口音场景下比你训 3 个月的专有模型还好

```
Whisper 家族产品线：
模型          参数量    英文 WER    推荐场景
tiny          39M       ~7%        端侧部署、低算力环境
base          74M       ~5.5%      同上
small        244M       ~4%        CPU 实时识别
medium       769M       ~3%        GPU 生产首选
large        1550M      ~2.8%      最高精度（研究/高质量离线转写）
large-v3     1550M      ~2.5%      目前（2025）开源 SOTA
```

**Whisper 真正把 ASR 从「算法团队自研 2 年」变成了「开箱即用的基础设施」**——任何小团队今天都能拿 Faster-Whisper 在一台 3090 上实时转写 30 路会议音频。

Whisper 之后重要变体：

- **Faster-Whisper**（CTranslate2 重写）：速度 × 4~8，显存 ↓50%，**工业部署标准**
- **WhisperX**：强制对齐（Wav2Vec2 CTC + Whisper）拿到词级时间戳 + 说话人分离
- **Distil-Whisper**：蒸馏成 1/2 大小，速度 ×2，掉点 < 0.1 WER
- **SenseVoice**（阿里达摩院 2024）：参数类似 Whisper-Large，中文效果更强、支持情感、多语种，速度更快

## ASR 关键技术指标

| 指标             | 全称                               | 计算                                                       | 生产达标线                                       |
| ---------------- | ---------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| **WER**          | Word Error Rate（英文字错率）      | (S + D + I) / N，S=替换 D=删除 I=插入                      | 新闻播报 WER<3%（等同人工水平）；客服通话 WER<8% |
| **CER**          | Character Error Rate（中文字错率） | 同上，按字符算                                             | 普通话 < 6%；带口音方言场景 < 12%                |
| **RTF**          | Real-Time Factor                   | 处理耗时 / 音频时长（例：10分钟音频用了 1 分钟 → RTF=0.1） | 实时流 RTF < 0.2；离线转写越快越好               |
| **延迟 Latency** | 端到端延迟                         | 用户说完一句话 → 返回前半句结果的时间                      | 语音交互场景 < 300ms（人类对话自然反应延迟下限） |
| **鲁棒性**       | 噪声鲁棒性                         | SNR 0dB / 10dB 下 WER/CER 涨幅                             | 车载 70dB 风噪场景 CER < 15%                     |
| **长音频稳定性** | 1 小时音频 WER 退化                | 短音频 vs 1 小时长音频 WER 差值                            | 无漂移 < 1%（Attention 漂移是原生 Whisper 痛点） |

## ASR 快速上手：Faster-Whisper 工程部署

```bash
# 安装（Conda / PyPI）
pip install faster-whisper
# 第一次运行会自动下载模型到 ~/.cache/huggingface
```

```python
from faster_whisper import WhisperModel

# 选择模型：tiny/base/small/medium/large-v3
# device: cpu/cuda；compute_type: int8/float16/bfloat16
model = WhisperModel(
    "large-v3",
    device="cuda",
    compute_type="float16",
    device_index=0,
    download_root="/models/whisper"   # 模型缓存路径
)

# ============= 离线转写（文件）===============
segments, info = model.transcribe(
    "customer_call_10min.mp3",
    beam_size=5,                      # Beam search 大小（越大越准越慢，5 是性价比王）
    vad_filter=True,                  # ✅ 必开！VAD 静音过滤（去掉无语音段省时间）
    vad_parameters=dict(
        min_silence_duration_ms=500,  # 500ms 以上静音才当静音
        threshold=0.5,               # VAD 语音/非语音阈值
    ),
    language="zh",                    # 指定 zh 中文（比 auto 快 + 准），不确定就别写 auto
    initial_prompt="这是一段电商客服关于退货政策的通话录音。",  # ✅ 领域术语注入，专业名词准确率暴涨！
    word_timestamps=True,             # 要词级时间戳才开（慢 20%）
    condition_on_previous_text=False, # ✅ 关！长音频稳定性暴涨，防止前一段错了污染下一段
    no_speech_threshold=0.6,
    length_penalty=1.0,
    temperature=[0.0, 0.2, 0.4, 0.6, 0.8, 1.0],  # fallback 温度（0 失败自动试更高温度）
)

# 打印结果
for segment in segments:
    print(f"[{segment.start:.2f}s → {segment.end:.2f}s] {segment.text}")

# ============= 实时流式麦克风 ===============
import pyaudio
audio = pyaudio.PyAudio()
stream = audio.open(format=p16, channels=1, rate=16000, input=True, frames_per_buffer=4000)  # 250ms 一块

buffer = b""
while True:
    buffer += stream.read(4000)
    if len(buffer) >= 16000 * 5:  # 攒够 5 秒音频
        segments, _ = model.transcribe(buffer, language="zh", ...)
        for s in segments: print(s.text, end="", flush=True)
        buffer = buffer[-16000 * 1:]  # 留 1 秒 overlap
```

## 工业级 ASR 系统的五大优化模块

### 1. VAD（Voice Activity Detection）——「只有在说话的时候才识别」

先判断这段音频帧里有没有人声，静音段直接跳过不进 ASR 模型：

- 省算力（日常对话 40% 是静音/呼吸/打字声）
- 降低 ASR 误触发（不会把键盘敲字识别成乱码）
- 开源 Silero VAD（500KB 小模型）比 WebRTC VAD 准一个档次，强烈推荐

### 2. 领域术语 Hot-Word Boosting——「让模型专门记住你的专有词」

电商客户专有词：「乐活系列护肤礼盒 SKU-7823、无忧退、极速达」
传统 CTC/Conformer ASR 可以直接把热词加到 decoder 偏置里；Whisper 推荐两种方案：

- **方案 A：initial_prompt 注入**（前面代码里写的），每次识别开头塞给模型做 few-shot 上下文
- **方案 B：CTC 二次矫正**：Whisper 转写后 → 领域词典模糊匹配（编辑距离 1）→ 把音近错词（「无有退」→「无忧退」）自动替换
  → **专有词 CER 下降 50~70%，是场景化 ASR 投入产出比最高的一招**

### 3. 标点与大小写恢复（Punctuation & Capitalization）

ASR 纯输出是一串无标点的文字（「苹果公司宣布今天发布新款手机」）→ 需要专门的标点模型恢复标点：「苹果公司宣布：今天发布新款手机。」

- 常用：**CT-Transformer** / **Punctuator2** / 或让 Whisper 自带的 Large 模型直接带标点（模型本身在训练时就学了标点）
- 中文场景一定要做：无标点中文阅读难度 ×3，下游 NLP 摘要、抽取任务准确率暴跌

### 4. 说话人分离 / 识别（Speaker Diarization / Verification）

会议场景多说话人：「A 说：XX；B 说：XX」

- 分离（谁在什么时候说话）：**Pyannote.audio**（开源 SOTA）、3D-Speaker
- 识别（这个人是谁）：预注册声纹 + 余弦相似度匹配（ResNet34 / CAM++ 提取 192 维声纹 embedding）
- 配合 WhisperX 词级时间戳，精准给每个词打上 speaker 标签

### 5. 语言模型二次纠错（LM Rescoring / LLM 纠错）

ASR 第一遍转写结果（CER 8%）→ 让 LLM 做纠错润色：

```
Prompt：
你是中文语音识别纠错助手。下面是 ASR 转写结果，可能有同音、口音、漏字错误。
请在**不改变原意、不添加原文没有的新信息**的前提下修正明显错误：
---
【ASR 原文】：
我们这边呢上个月定了那个 SKU 七八两千三了订单嘛然后一直没收到货想查一下到底到哪儿了什么时候能配送到我们公司呢
---
【纠错后】：
我们这边上个月订了那个 SKU-7823 的订单，一直没收到货，想查一下到底到哪儿了，什么时候能配送到我们公司呢？
```

→ LLM 纠错后 CER 从 8% → **4.2%**，效果显著。现在是大厂标配「ASR + LLM 纠错」二阶段流水线。

## 部署架构：GPU 集群实时 ASR 服务

一个支持 2000 路并发通话的工业级 ASR 系统：

```
用户端（App/WebRTC/电话网关 SIP）
      │  Opus 编码 16kHz 音频流
      ▼
【K8s Ingress + WebSocket Gateway】（10 台 32C）
      │  每条通话建立 WS 连接，200ms 一包音频
      ▼
【ASR Worker GPU Pool】（40 台 A10 24G）
      每台：
      • Silero VAD（CPU，轻量）
      • Faster-Whisper Medium（FP16，每台并发 50 路）
      • 热词匹配 + 标点恢复（CPU，异步）
      • 结果增量推回 Gateway
      ▼
【结果存储 + 回调】（Kafka → 下游业务）
      实时字幕推前端 / 完整转写存 ClickHouse / 触发 LLM 摘要任务
```

成本测算：2000 并发 ≈ 40 张 A10 卡，月成本 ~¥20W；对比商业 API（阿里云一句话 ASR 0.008 元/分钟）：业务量上来后自建 3 个月回本。

## 中文 ASR 常见坑和解决

### 坑 1：数字、金额、日期识别错得离谱

Whisper 经常把「一万二千三百四十八块五」写成「1000230048块5」→ 完全乱格式。
→ **专门的数字正则化模块**：先用 G2P（字转音）反查 + 正则模板匹配 + LLM few-shot 重写，把汉字数字标准化成阿拉伯数字格式。

### 坑 2：方言/带口音普通话识别烂

Whisper Large-v3 对四川话、广东话普通话、东北话口音还行，福建、湖南、江西口音就掉链子 → 解决方案：

1. **领域微调**：收集 100 小时你目标场景的口音数据，LoRA 微调 Whisper Encoder（LoRA rank=16，训 2 个 epoch）→ CER 掉 40%
2. **多模型融合**：同时跑 Whisper + 阿里 SenseVoice + 腾讯 Paraformer，三个结果投票取一致词，CER 再降 15%

### 坑 3：噪声、回声、远场麦克风场景崩

实际会议室/车载：空调噪声 + 多人说话 + 墙壁回声 → ASR CER 直接翻倍
→ **前端语音增强** 必须先上：

- **RNNoise / DeepFilterNet**：传统 + 深度学习混合降噪，纯 CPU 实时
- **MVDR / GSC 波束成形**（多麦阵列）：指向目标说话人方向，抑制其他方向噪音
- **AEC（回声消除）WebRTC**：AI 电话机器人场景，去掉扬声器播放的自己的声音，防止「ASR 识别自己说的话」

### 坑 4：长音频 1 小时后后半段开始胡言乱语

Whisper 原生有**注意力漂移**问题（condition_on_previous_text 默认 True 时）：前一段错一个术语，后面模型沿着错的语境越偏越远。
→ **工程解法三件套**：

1. `condition_on_previous_text=False` 关上下文依赖
2. VAD 按语义停顿切 30s~1min 一段独立识别，段间不共享
3. 每 5 分钟做一次重置 + 用 LLM 做段间一致性校验（前后矛盾的地方回溯重识别）

## 未来方向

1. **端侧 ASR 继续升级**：Whisper-Tiny INT4 量化后 10MB，手机 DSP/NPU 离线实时跑，**延迟 < 100ms、隐私零数据出设备**，是下一个爆发点（智能眼镜、手表、智能车载）。
2. **多模态 ASR（唇读 + 语音）**：噪声极吵的酒吧/KTV 场景，纯听不清 → 摄像头读嘴唇 + 音频融合多模态识别，字错率下降 30%+。Meta Audio-Visual Whisper 已开源。
3. **语音大模型（Speech LLM）统一一切**：不再区分 ASR / 翻译 / 摘要 / 情感识别——输入一段语音，大模型直接输出「转写 + 摘要 + 情感 + 说话人分离 + 关键信息抽取」一体化结果。代表：Qwen-Audio、SenseVoice-Small、Gemini Audio。
4. **极低成本 ASR（CPU 实时）**：Transformer 架构的 Whisper 还是大，CNN/RNN 小模型（ContextNet、Conformer-Tiny）结合量化、知识蒸馏，未来 1 个 CPU 核就能实时跑 CER<8% 的中文 ASR。

ASR 是一个「看起来已经解决了，但场景化一做细节全是坑」的典型领域。过去 10 年它的字错率从 40% 降到 <3%（接近人类水平），下一个 10 年的主题是**从「能听懂」走到「听懂所有场景——任何口音、任何噪声、任何语言、任何说话人，并且零延迟、零成本、零隐私泄露」**。

相关术语：[语音合成-TTS](/glossary/speech-tts)、[Transformer](/glossary/transformer)、[扩散模型](/glossary/diffusion-model)、[Agent评估与追踪](/glossary/agent-evals-tracing)、[长上下文窗口](/glossary/long-context-window)
