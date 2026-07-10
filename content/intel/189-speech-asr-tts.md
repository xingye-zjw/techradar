---
title: Whisper + Coqui TTS 语音端到端实践
category: speech
summary: 从麦克风录音到 Whisper 语音识别，经过 LLM 对话，再用 Coqui TTS 合成真人风格语音返回——完整搭建一个本地可运行的中文语音对话助手，并优化实时性与自然度。
difficulty: intermediate
excerpt: 从麦克风录音到 Whisper 语音识别，经过 LLM 对话，再用 Coqui TTS 合成真人风格语音返回——完整搭建一个本地可运行的中文语音对话助手，并优化实时性与自然度。
relatedTerms:
  - transformer
  - speech-asr
  - speech-tts
  - function-calling
relatedTools:
  - pytorch
  - numpy
  - streamlit
  - huggingface-transformers
relatedNodes:
  - nlp-rnn
  - llm-inference
  - llm-prompt-engineering
---

## 为什么你要学它

纯文本的 LLM 聊天机器人已经很成熟，但当你想把它接入智能音箱、车载语音助手、客服热线、或者给视障用户做读屏工具时，就必须打通「人说话 → 机器听懂 → 机器思考 → 机器说话」的完整语音链路。

这条链路的两端，在 2024 年都已经有了开箱即用的开源方案：

- **语音识别（ASR）端**：OpenAI Whisper large-v3 / faster-whisper，中文 WER（字错误率）可以压到 3% 以下，远好于 3 年前的商业 API
- **语音合成（TTS）端**：Coqui TTS 的 XTTS v2 模型，支持 17 种语言（含中文），只需 6 秒参考音频就能克隆任意人的音色，自然度（MOS 分）逼近真人录音

把 Whisper + 任意 LLM + Coqui TTS 串起来，你就能在自己的 GPU 上跑一个**完全离线、零 API 费用、音色可定制**的语音对话助手。对于企业内部场景（内网部署、数据不能出域、特定行业术语多），这种本地端到端方案比调用云端 API 更实用。

本文不做理论科普（Whisper 和 TTS 的原理在 114/115 两篇里已经讲过），重点是工程落地：如何选模型规格、如何做流式处理降低延迟、如何解决常见的中文问题（轻声、儿化、多音字）、如何用 6 秒参考音频克隆你想要的音色、以及如何处理 VAD（语音活动检测）避免截断半句话。

## 一句话概览

- **完整语音链路**：麦克风（VAD 断句）→ Whisper 识别成文字 → LLM 生成回答 → Coqui TTS 合成语音 → 扬声器播放
- **延迟优化三招**：用 faster-whisper（CTranslate2 量化）+ 流式 ASR + VAD 只在有人说话时启动处理；TTS 用流式逐句合成边生成边播放
- **中文效果优化**：Whisper 用 large-v3 + 中文标点恢复模型；Coqui TTS 用 XTTS v2 + 中文参考音频（6 秒清晰录音）
- **生产部署方案**：ASR/TTS/LLM 拆成三个独立微服务（FastAPI），通过消息队列通信，GPU 资源用容器调度，支持横向扩展

## 核心拆解

### 🔑 语音链路的五个关键组件

一个完整的语音对话系统，从下到上由五层组成，每层选型都直接影响体验：

```
┌─────────────────────────────────────────────────┐
│  Layer 5: 对话管理（多轮上下文、意图识别）         │  用 LLM + 系统 Prompt 实现
├─────────────────────────────────────────────────┤
│  Layer 4: TTS 语音合成                           │  Coqui XTTS v2 / Edge TTS
├─────────────────────────────────────────────────┤
│  Layer 3: LLM 文字对话生成                       │  Qwen2.5-7B / Llama 3 8B / 任意开源 LLM
├─────────────────────────────────────────────────┤
│  Layer 2: ASR 语音识别                           │  faster-whisper large-v3 / SenseVoice
├─────────────────────────────────────────────────┤
│  Layer 1: 音频采集 + VAD 语音活动检测            │  WebRTC VAD / Silero VAD
└─────────────────────────────────────────────────┘
```

**Layer 1（VAD）选型对比**：

| VAD 方案                   | 优点                                | 缺点                     | 适用场景           |
| -------------------------- | ----------------------------------- | ------------------------ | ------------------ |
| WebRTC VAD                 | 极快（CPU 上实时）、开源、轻量      | 对噪音敏感，阈值需要调   | Web 端、实时通话   |
| **Silero VAD**（推荐首选） | 轻量（1MB）、抗噪能力强、支持 16kHz | 极少数方言场景漏检       | 本地部署、移动端   |
| Pyannote VAD               | 最准、支持说话人分离                | 模型大（~100MB）、速度慢 | 会议记录、多人对话 |

**Layer 2（ASR）选型**：

| 模型                                    | 参数  | 中文 WER | GPU 显存 | 实时因子                      |
| --------------------------------------- | ----- | -------- | -------- | ----------------------------- |
| Whisper tiny                            | 39M   | ~15%     | <200MB   | 30x+（超快）                  |
| Whisper base                            | 74M   | ~10%     | <300MB   | 16x                           |
| Whisper small                           | 244M  | ~6%      | ~700MB   | 6x                            |
| **faster-whisper medium**（开发首选）   | 769M  | ~4%      | ~1.5GB   | 2x                            |
| **faster-whisper large-v3**（生产首选） | 1550M | ~2.5%    | ~3GB     | 1x（10 秒音频约 10 秒出结果） |
| SenseVoiceSmall                         | 230M  | ~3%      | ~800MB   | 5x                            | 阿里开源，中文/粤语/中英混说极强 |

> **实时因子（RTF）**：处理 10 秒音频花了 2 秒 → RTF = 0.2，比实时快 5 倍。RTF < 1 才能支持实时流式对话。

**Layer 4（TTS）选型**：

| 方案                      | 支持中文 | 克隆音色        | 离线可用 | 语音自然度                             |
| ------------------------- | -------- | --------------- | -------- | -------------------------------------- |
| **Coqui XTTS v2**（推荐） | ✅       | ✅ 6 秒参考音频 | ✅       | 4.3/5.0（MOS）                         |
| Edge TTS（微软在线）      | ✅       | ❌              | ❌       | 4.2/5.0                                |
| Fish Speech               | ✅       | ✅ 10 秒参考    | ✅       | 4.4/5.0（最新开源最强，中文略胜 XTTS） |
| ChatTTS                   | ✅       | ⚠️ 有限         | ✅       | 4.0/5.0，语气有独特的「口语感」        |

### 🔑 VAD 断句：别让 Whisper 一直听

最常见的体验问题是「我刚说到一半，系统就开始回答了」或者「我已经说完 3 秒了它还没反应」——这都是 VAD 没调好。

**正确的 VAD 逻辑应该是一个状态机**：

```
SILENCE（静音） → 检测到语音开始 → SPEAKING（说话中）
                    ↑                              ↓
                    └──── 静音超过 800ms ←─────────┘
                                         ↓
                                   END_OF_SPEECH → 触发 Whisper 识别
```

关键参数：

- `speech_prob_threshold = 0.5`：Silero 模型输出的「这段 30ms 是语音」的概率阈值，低于这个值认为是静音
- `min_silence_ms = 600~1000`：连续静音多久才算「说完了」。太短会截断尾音，太长会让用户感觉反应慢
- `min_speech_ms = 300`：至少说多久才算有效发言，过滤咳嗽、叹气这种短噪音
- `max_speech_ms = 30000`：最长录音时间，避免用户一直不说话占住资源

### 🔑 流式 ASR：不用等说完才出结果

对实时对话体验来说，「等用户说完 → Whisper 跑 5 秒 → 出文字」的延迟太长了。流式 ASR 的思路是：**每 2~3 秒就送一段增量音频给 Whisper，识别出部分结果先展示给用户，说完之后再做一次完整识别校正**。

faster-whisper 的 `segment` 模式天然支持流式。配合 VAD，效果是：

- 用户说到第 2 秒，屏幕上已经跳出前几个字
- 用户说到第 5 秒，前面的话都识别完了
- 一说完（VAD 触发 END_OF_SPEECH），校正后的完整文本立刻送 LLM，用户几乎感觉不到等待

### 🔑 Coqui XTTS v2 中文音色克隆

XTTS v2 最强大的功能是「零样本声音克隆」：你只需要提供一段 6~30 秒的清晰 WAV 录音（16kHz/22050Hz 采样，单声道，背景安静），就能合成和这个声音几乎一模一样的语音。

中文克隆的几个注意事项：

1. **参考音频要用中文**：用英语参考音频克隆出来的中文会有「洋腔洋调」，声调不准
2. **6~12 秒最佳**：太短（<3s）模型抓不到音色特征，太长（>30s）反而引入噪音和语调漂移
3. **录音要求高**：最好用领夹麦在安静房间录，不要有背景音乐、混响、回声
4. **说话人要稳定**：参考音频和目标说话人必须是同一个人，而且情绪/语速尽量和你希望合成的一致

## 完整跑通方案：从零搭建本地语音助手

### 第一步：环境安装（Linux / Windows WSL2）

```bash
# 1. PyTorch + CUDA（按你的 CUDA 版本选，这里以 12.1 为例）
pip install torch==2.4.0 torchaudio==2.4.0 --index-url https://download.pytorch.org/whl/cu121

# 2. faster-whisper（量化版 Whisper，比原版快 2~4 倍）
pip install faster-whisper

# 3. Silero VAD
pip install silero-vad webrtcvad

# 4. Coqui TTS（从 GitHub 装最新版，pip 版本有时落后）
pip install TTS
# 如果上面报错，用源码安装：
# pip install git+https://github.com/coqui-ai/TTS

# 5. 麦克风播放/录音 + LLM SDK
pip install pyaudio soundfile transformers accelerate sentencepiece
pip install openai  # 如果你用云端 LLM API
```

检查各模型能否正常加载：

```bash
python -c "from faster_whisper import WhisperModel; m = WhisperModel('large-v3', device='cuda', compute_type='float16'); print('Whisper OK')"
python -c "from silero_vad import load_silero_vad; m = load_silero_vad(); print('VAD OK')"
python -c "from TTS.api import TTS; t = TTS('tts_models/multilingual/multi-dataset/xtts_v2'); print('XTTS OK')"
```

### 第二步：实现 VAD + 流式录音模块

```python
import numpy as np
import torch
import pyaudio
import time
from collections import deque
from silero_vad import load_silero_vad, get_speech_timestamps, collect_chunks

SAMPLE_RATE = 16000
FRAME_SIZE = 512  # 32ms per frame (16000 * 0.032 = 512)
MIN_SPEECH_MS = 300
MIN_SILENCE_MS = 700
MAX_SPEECH_MS = 30_000

class VADRecorder:
    """基于 Silero VAD 的录音器，遇到整段静音自动返回完整音频"""

    def __init__(self):
        self.vad_model = load_silero_vad()
        self.p = pyaudio.PyAudio()
        self.stream = self.p.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=SAMPLE_RATE,
            input=True,
            frames_per_buffer=FRAME_SIZE,
        )

    def read_next_utterance(self) -> np.ndarray:
        """阻塞直到检测到一整段话结束，返回 int16 格式的 PCM 音频（16kHz）"""
        speech_buffer = []
        silence_counter_ms = 0
        speech_ms = 0
        started = False

        while True:
            # 读 32ms audio frame
            data = self.stream.read(FRAME_SIZE, exception_on_overflow=False)
            frame_int16 = np.frombuffer(data, dtype=np.int16)
            frame_float = (frame_int16 / 32768.0).astype(np.float32)

            # VAD 判断这个 32ms 帧是不是语音
            speech_prob = self.vad_model(
                torch.from_numpy(frame_float).unsqueeze(0), SAMPLE_RATE
            ).item()
            is_speech = speech_prob > 0.5

            if is_speech:
                started = True
                speech_ms += 32
                silence_counter_ms = 0
                speech_buffer.append(frame_int16)
            elif started:
                # 已经开始说话了，但这一帧是静音
                silence_counter_ms += 32
                speech_buffer.append(frame_int16)  # 尾音的静音也要保留
                if silence_counter_ms >= MIN_SILENCE_MS:
                    # 连续静音足够长 → 说完了
                    break
                if speech_ms + silence_counter_ms >= MAX_SPEECH_MS:
                    break
            else:
                # 还没开始说话，丢掉这段静音，避免内存无限增长
                pass

        return np.concatenate(speech_buffer) if speech_buffer else np.zeros(0, dtype=np.int16)

    def close(self):
        self.stream.stop_stream()
        self.stream.close()
        self.p.terminate()
```

### 第三步：Whisper ASR 封装（faster-whisper 中文优化）

```python
import numpy as np
from faster_whisper import WhisperModel

class WhisperASR:
    def __init__(self, model_size="large-v3", device="cuda"):
        # compute_type: float16 速度最快，int8_float16 是速度+显存折衷
        self.model = WhisperModel(
            model_size,
            device=device,
            compute_type="float16" if device == "cuda" else "int8",
        )

    def transcribe(self, audio_int16: np.ndarray, language="zh") -> str:
        # faster-whisper 接收 float32 [-1, 1] 或 int16 原始数组都行
        audio_float = audio_int16.astype(np.float32) / 32768.0

        # 中文优化：
        # - beam_size=5 比 greedy 准不少，中文 WER 降 20%
        # - initial_prompt 提示模型这是中文、用中文标点
        # - no_speech_threshold 过滤纯静音片段
        segments, info = self.model.transcribe(
            audio_float,
            language=language,
            beam_size=5,
            initial_prompt="这是一段中文普通话对话，使用中文标点符号。",
            vad_filter=False,  # 我们在外面已经做过 VAD 了
            no_speech_threshold=0.6,
            condition_on_previous_text=False,  # 避免连续识别时上下文串台
        )

        full_text = "".join(seg.text for seg in segments).strip()
        return full_text

# 快速测试：用一段预录好的 WAV
# import soundfile as sf
# audio, sr = sf.read("test_zh.wav", dtype="int16")
# asr = WhisperASR("large-v3")
# print("识别结果:", asr.transcribe(audio))
```

### 第四步：Coqui TTS 中文合成（音色克隆）

```python
import torch
import soundfile as sf
from TTS.api import TTS

class CoquiXTTS:
    def __init__(self, device="cuda", reference_wav="my_voice_reference.wav"):
        self.device = device
        self.reference_wav = reference_wav

        # 加载 XTTS v2（第一次会自动下载模型，约 1.8GB）
        self.tts = TTS(
            model_name="tts_models/multilingual/multi-dataset/xtts_v2",
            progress_bar=False,
        )
        if device == "cuda":
            self.tts.model.to(torch.device("cuda"))

        # 预先加载一次 reference，避免首次合成慢
        self._warmed_up = False

    def synthesize(
        self,
        text: str,
        output_path: str = "output.wav",
        language: str = "zh-cn",
        speed: float = 1.0,
    ) -> tuple[np.ndarray, int]:
        """
        合成语音并保存为 WAV。
        speed 0.5 = 一半速度，2.0 = 两倍快。
        返回 (numpy audio array, sample_rate)
        """
        wav = self.tts.tts(
            text=text,
            speaker_wav=self.reference_wav,  # 关键：6 秒你的参考音频
            language=language,
            speed=speed,
            split_sentences=True,  # 自动按标点分句，分句合成可以降低延迟
        )
        # XTTS v2 输出采样率 24000
        sr = 24000
        audio_np = np.array(wav, dtype=np.float32)

        # 归一化 + 保存
        if audio_np.max() > 0:
            audio_np = audio_np / (np.max(np.abs(audio_np)) * 0.95)  # 避免削波
        sf.write(output_path, audio_np, sr)
        return audio_np, sr

# 【重要】制作参考音频 my_voice_reference.wav：
# 用手机/领夹麦安静环境录 8~10 秒中文朗读，转成 22050Hz 单声道 WAV：
# ffmpeg -i input.m4a -ac 1 -ar 22050 my_voice_reference.wav

# tts = CoquiXTTS(reference_wav="my_voice_reference.wav")
# wav, sr = tts.synthesize("你好，我是你的语音助手，有什么我可以帮你的吗？")
```

### 第五步：把 ASR → LLM → TTS 串成完整对话

```python
import time
import numpy as np
import sounddevice as sd
from typing import Callable

class VoiceAssistant:
    def __init__(
        self,
        llm_fn: Callable[[str, list[dict]], str],  # LLM 推理函数
        asr_model_size: str = "large-v3",
        reference_wav: str = "my_voice_reference.wav",
        device: str = "cuda",
    ):
        print("[1/4] 加载 VAD...")
        self.recorder = VADRecorder()
        print("[2/4] 加载 Whisper ASR...")
        self.asr = WhisperASR(asr_model_size, device=device)
        print("[3/4] 加载 Coqui XTTS TTS...")
        self.tts = CoquiXTTS(device=device, reference_wav=reference_wav)
        print("[4/4] 初始化完成，等待对话...")

        self.llm_fn = llm_fn
        self.dialog_history = [
            {"role": "system", "content": "你是一个亲切、简洁的中文语音助手。回答要口语化、简短，每句尽量控制在 100 字以内，避免长列表。不要输出 Markdown 格式，不要使用代码块。"}
        ]

    def _play_audio(self, wav: np.ndarray, sr: int):
        sd.play(wav, sr)
        sd.wait()

    def run_one_turn(self):
        """执行一轮对话：听 → 识别 → LLM → 合成 → 播放"""
        print("\n🎤 正在聆听...", flush=True)
        t0 = time.time()

        audio = self.recorder.read_next_utterance()
        if len(audio) < SAMPLE_RATE * 0.2:  # 太短忽略
            print("⚠️  没听清，请再说一次")
            return

        t1 = time.time()
        user_text = self.asr.transcribe(audio)
        print(f"[你]（识别耗时{(t1-t0)*1000:.0f}ms）: {user_text}")
        if not user_text:
            return

        # 更新对话历史
        self.dialog_history.append({"role": "user", "content": user_text})

        t2 = time.time()
        assistant_text = self.llm_fn(user_text, self.dialog_history)
        print(f"[助手]（LLM 耗时{(t2-t1)*1000:.0f}ms）: {assistant_text}")
        self.dialog_history.append({"role": "assistant", "content": assistant_text})

        t3 = time.time()
        wav, sr = self.tts.synthesize(assistant_text, output_path="last_reply.wav")
        print(f"🔊 播放中...（合成耗时 {(t3-t2)*1000:.0f}ms，音频长度 {len(wav)/sr:.1f}s）")
        self._play_audio(wav, sr)
        t4 = time.time()

        print(f"⏱️  本轮总耗时: {(t4-t0):.1f}s")
        # 正常 7s 以内体验流畅；优化好能压到 3~4s

    def run_forever(self):
        try:
            while True:
                self.run_one_turn()
        except KeyboardInterrupt:
            print("\n👋 再见")
        finally:
            self.recorder.close()

# ============ 把你的 LLM 包成 llm_fn 传进来 ============
# 示例 1：用 OpenAI API
# from openai import OpenAI
# client = OpenAI()
# def llm_api(user_text, history):
#     resp = client.chat.completions.create(
#         model="gpt-4o-mini",
#         messages=history,
#         max_tokens=256,
#         temperature=0.7,
#     )
#     return resp.choices[0].message.content

# 示例 2：本地 7B 模型（vLLM / transformers）
# from transformers import AutoModelForCausalLM, AutoTokenizer
# model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-7B-Instruct", device_map="auto", torch_dtype=torch.float16)
# tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-7B-Instruct")
# def llm_local(user_text, history):
#     text = tokenizer.apply_chat_template(history, tokenize=False, add_generation_prompt=True)
#     inputs = tokenizer(text, return_tensors="pt").to("cuda")
#     out = model.generate(**inputs, max_new_tokens=256, temperature=0.7)
#     return tokenizer.decode(out[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)

# 启动助手
# assistant = VoiceAssistant(llm_fn=llm_api, asr_model_size="large-v3", reference_wav="my_voice_reference.wav")
# assistant.run_forever()
```

### 第六步：进阶优化：TTS 流式输出 + 分句合成

上面的实现是「等 LLM 全部生成完 → 一次性合成 → 一次性播放」，对于长回答会等很久。优化做法：

```python
# LLM 开启流式生成（stream=True），每出一句话就立刻送 TTS，TTS 一边合成一边播放
def llm_stream(user_text, history, on_sentence_done):
    """
    流式生成文本，每检测到一个完整句子（句号/问号/感叹号）
    就调用 on_sentence_done(sentence) 触发单句 TTS 合成并播放
    """
    stream = client.chat.completions.create(
        model="gpt-4o-mini", messages=history, max_tokens=512, stream=True, temperature=0.7,
    )
    buffer = ""
    for chunk in stream:
        delta = chunk.choices[0].delta.content or ""
        buffer += delta
        # 遇到句末标点，切出一句送 TTS 播放（异步，不阻塞继续生成下一句）
        for sep in ["。", "？", "！", "\n"]:
            if sep in buffer:
                idx = buffer.index(sep) + 1
                sentence, buffer = buffer[:idx], buffer[idx:]
                if sentence.strip():
                    on_sentence_done(sentence.strip())
    if buffer.strip():
        on_sentence_done(buffer.strip())
```

这样 LLM 生成第一句话的时间（~500ms）+ TTS 合成第一句话（~800ms），用户 1.5 秒就能听到回复，后面的话边生成边说，体验非常接近真人对话。

## 常见误区

**误区 1：Whisper 所有尺寸都支持中文，选 tiny 就行，速度快。** → tiny/base 在中文上 WER 高达 10%~15%，意味着每 10 个字错 1 个，用户根本没法正常用。「今天下午三点开会」识别成「今天先我三点开会」，LLM 直接理解错。中文场景至少 medium 起步，生产必须 large-v3，WER 差 5 倍不是一个级别的体验。如果显存不够，faster-whisper 的 INT8 量化版 large-v3 只要 ~3GB 显存，大多数消费级显卡（RTX 3060 12G / 4070 Ti）都跑得动。

**误区 2：参考音频随便录就行，TTS 会「自动抓特征」。** → 中文 XTTS 对参考音频质量非常敏感。用手机在嘈杂咖啡馆录的、有回声、背景音乐的 10 秒音频，合成出来的中文要么声调全错、要么声音像感冒、要么夹杂沙沙噪音。正确做法：安静房间 + 领夹麦 + 距离嘴 10~15cm，匀速朗读一段自然口语（不要念新闻稿那种腔），10 秒左右，用 ffmpeg 统一转成 22050Hz 单声道 WAV。同一个音色克隆，参考音频好 vs 差，效果差距可能比换模型还大。

**误区 3：不做 VAD，Whisper 一直录音，每 5 秒送一次识别。** → 结果是：用户 1 秒的咳嗽、键盘敲击声、窗外车声，都会被 Whisper 识别成「哦」「嗯」「好」这种假阳性，触发 LLM 胡说八道一通。必须在 Whisper 前面加 VAD：只有检测到真实语音才开始录音，检测到静音段就立刻截断送识别。这不仅降低假阳性，还能把平均识别延迟从 5 秒压到 1 秒以内。

**误区 4：TTS 一次性合成整段回答再播放，用户不会觉得慢。** → 100 字的中文回答，XTTS v2 合成通常要 3~~5 秒，加上 LLM 生成的 2~~3 秒，用户说完到听到回复要 5~8 秒，非常煎熬。一定要做「流式 LLM + 分句 TTS + 边合成边播放」：第一句话 1.5 秒内出声，后面每 1 秒补一句，用户感知到的是「立刻回复、持续说话」，而不是「等半天然后一口气蹦出来」。延迟下降一半以上，主观体验跃升一个档次。

**误区 5：多轮对话把历史的 audio 也存下来给 Whisper，识别会更准。** → Whisper 不跨多轮共享上下文，每段新音频都是独立识别的。历史音频只会让显存暴涨，一点用没有。真正需要保留多轮的是「文字对话历史」，送给 LLM 即可；ASR 只处理当前这一句话。如果有跨轮指代问题（用户说「他刚才说的是什么」），靠 LLM 的文字历史上下文去解，不是靠 Whisper。
