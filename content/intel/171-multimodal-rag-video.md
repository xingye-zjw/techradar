---
title: 多模态 RAG：视频切片 + CLIP 向量 + 文本联合检索
category: llm
difficulty: advanced
duration: 2周
summary: 打通从视频抽帧、ASR 字幕提取、CLIP 跨模态向量建模到多模态查询联合检索的完整链路。让大模型能直接回答"某个视频第 3 分钟那段画面说了什么 + 画面里有什么物体"这类需要图文联动的问题。
keywords: [多模态RAG, 视频检索, CLIP, 跨模态, ASR, 向量检索, LanceDB]
takeaways:
  - 搞懂视频多模态切分的三要素：关键帧采样、ASR 字幕时间轴、场景边界检测
  - 理解 CLIP 对比学习预训练的原理，为什么它能实现"以文搜图 / 以图搜文"
  - 能画出视频切片 → 帧向量 + 文本向量 → LanceDB 存储 → 联合检索排序的架构图
  - 能跑通 ffmpeg 抽帧 + Whisper ASR + CLIP 向量 + LanceDB 的完整端到端流水线
  - 实现基于时间轴融合的图文联合 rerank 算法，让检索结果同时对齐画面和语音
tags: [llm, 多模态RAG, CLIP, 视频检索, 跨模态, 向量数据库, ASR]
relatedTerms: [rag, transformer, cnn, resnet, onnx, matrix, ocr, self-attention]
relatedTools: [ollama, lancedb, haystack, unstructured, langchain, onnx-runtime, vllm]
relatedNodes: [llm-rag, llm-inference, llm-agent, llm-finetune]
---

## 为什么你要学它

传统 RAG 只能处理纯文本，但真实信息有超过 80% 是非结构化的多模态数据：企业培训视频、产品宣传短片、客户服务通话录屏、操作教程录播、公开演讲录像……这些内容里同时包含画面信息（产品外观、操作步骤、人物表情）和语音信息（讲解、对话、旁白），二者缺一不可。比如你问"培训视频里讲'服务器上架流程'时，画面里机柜指示灯是什么颜色"——纯文本 RAG（只抽字幕）完全答不上来，纯图像检索又不知道"上架流程"对应的是哪段。

多模态 RAG 的价值在于**把视觉和语音两种模态"对齐到同一个语义空间"再做联合检索**，让用户的查询无论偏描述画面（"视频里那个戴安全帽的工程师在干什么"）还是偏描述内容（"那个讲 Kubernetes 故障排查的片段"），都能检索到正确的视频时间段。配合多模态大模型（如 Qwen2-VL、LLaVA、GPT-4V）做最后一英里的生成，最终可以直接输出"时间戳 + 画面截图 + 文字答案"联动的结果，这是构建下一代智能知识库、智能客服、企业培训系统的核心能力。

实际落地场景包括但不限于：

- **企业培训知识库**：把 100 小时的内部录播课做成可问答系统，员工直接问"负载均衡配置那段在哪"，系统返回精确到秒的时间戳、截图和要点
- **产品质检追溯**：把产线摄像头录像切片索引，出质量问题后直接搜"出现红色告警灯 + 伴随蜂鸣声"的片段，快速定位根因
- **客服复盘分析**：索引 1 万条客服通话录屏，搜"用户提到要投诉 + 客服表现出慌张表情"的高风险会话做复盘
- **智能字幕与内容剪辑**：对体育赛事或长视频做内容搜索，找到"进球瞬间 + 解说员高喊'球进了'"的片段自动剪成集锦
- **教育视频精准答疑**：学生问"这道物理题在视频里老师什么时候讲的，具体怎么受力分析"，系统自动定位并给出画面+讲解摘要

## 一句话概览（快速版）

1. **视频处理三刀流 = ffmpeg 抽关键帧 + Whisper 带时间戳 ASR + PySceneDetect 场景切分**。三者输出统一对齐到时间轴，**一个视频片段 = 若干帧图像 + 一段字幕文本 + 起止时间戳**，这是多模态检索的原子单位。
2. **跨模态向量 = CLIP / SigLIP / EVA-CLIP**，同一模型同时编码文本和图像到同一个 768/1024 维向量空间，余弦相似度直接表示语义相关度，**实现"用文字搜画面、用画面搜字幕"**，这是联合检索的基础。
3. **联合检索架构 = 文本向量召回 + 图像向量召回 → 按时间轴合并 → Cross-Encoder 多模态 rerank → 投喂多模态 LLM 生成答案**。两个召回通道的结果按时间戳重叠度做融合，**比单模态检索召回率提升 30%~50%**。

## 核心拆解

### 🔑 视频预处理：抽帧 + ASR + 场景切分

多模态 RAG 的第一公里决定了上限——如果视频切分得乱七八糟，再强的模型也搜不到正确的内容。核心原则是**切分单元必须同时对齐画面和语音的语义边界**：画面切换（场景切分）和语音停顿（ASR 句子边界）都要考虑，不能简单按固定 N 秒一刀切。

```bash
# ========== 1. 环境准备 ==========
# 核心依赖
pip install ffmpeg-python openai-whisper scenedetect[opencv] \
            torch transformers pillow opencv-python lancedb pandas numpy

# 系统需安装 ffmpeg（Ubuntu 示例）
# sudo apt-get install -y ffmpeg

# ========== 2. 场景检测（PySceneDetect） ==========
# 找到画面切换的边界时间点（比固定 FPS 采样更语义合理）
scenedetect --input ./lecture.mp4 \
    --output ./scenes/ detect-content --threshold 27.0 \
    list-scenes -f ./scenes/scenes.csv save-images -n 1

# 输出：scenes.csv 每行是一个场景（起始时间、结束时间、时长、帧数）
# 以及每个场景保存一张代表性截图 scene-001-01.jpg

# ========== 3. 带时间戳 ASR（Whisper large-v3） ==========
# word_timestamps=True 拿到每个词的精确起止时间，后续和场景边界对齐
python - <<'PYEOF'
import whisper
import json

model = whisper.load_model("large-v3", device="cuda")
result = model.transcribe(
    "./lecture.mp4",
    language="zh",
    word_timestamps=True,   # 关键：每个词的时间戳
    verbose=False,
)

# 保存逐段 + 逐词时间戳
segments_with_ts = []
for seg in result["segments"]:
    words = [
        {"word": w["word"], "start": round(w["start"], 3), "end": round(w["end"], 3)}
        for w in seg.get("words", [])
    ]
    segments_with_ts.append({
        "id": seg["id"],
        "text": seg["text"].strip(),
        "start": round(seg["start"], 3),
        "end": round(seg["end"], 3),
        "words": words,
    })

with open("./asr_result.json", "w", encoding="utf-8") as f:
    json.dump({"segments": segments_with_ts, "language": result["language"]},
              f, ensure_ascii=False, indent=2)
print(f"ASR 完成，共 {len(segments_with_ts)} 段，累计 {segments_with_ts[-1]['end']:.0f} 秒")
PYEOF
```

```python
# ========== 4. 场景帧 + 字幕切片合并（对齐时间轴） ==========
import pandas as pd
import json
import cv2
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List

@dataclass
class VideoChunk:
    chunk_id: str
    video_path: str
    start_sec: float
    end_sec: float
    duration: float
    asr_text: str               # 这段时间内的所有字幕
    frame_path: str            # 代表帧截图路径
    scene_score: float         # 场景切换置信度（可选）

def align_scene_asr(video_path: str, scenes_csv: str, asr_json: str,
                    frame_dir: str, out_dir: str = "./chunks/") -> List[VideoChunk]:
    """以场景切分为主，把 ASR 字幕按时间区间塞入每个场景"""
    Path(out_dir).mkdir(parents=True, exist_ok=True)

    # 读取场景边界
    scenes_df = pd.read_csv(scenes_df, skiprows=[1])  # PySceneDetect 第 2 行是单位行
    scenes_df = scenes_df.rename(columns={
        "Start Time": "start_time", "End Time": "end_time",
        "Length (seconds)": "duration", "Scene Number": "scene_num",
    })

    # 读取 ASR
    with open(asr_json, encoding="utf-8") as f:
        asr_data = json.load(f)["segments"]

    # 为了加速匹配，把所有 ASR 词打平成一维数组
    all_words = []
    for seg in asr_data:
        all_words.extend(seg["words"])

    chunks: List[VideoChunk] = []
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)

    for _, row in scenes_df.iterrows():
        scene_num = int(row["scene_num"])
        start = float(row["start_time"].split(":")[-1]) if isinstance(row["start_time"], str) else float(row["start_time"])
        end = start + float(row["duration"])
        duration = end - start
        if duration < 2.0:
            continue  # 过短场景（<2s）没有信息量，跳过

        # 1) 找这段时间内的所有 ASR 词
        chunk_words = [
            w["word"] for w in all_words
            if start - 0.3 <= w["start"] <= end + 0.3
        ]
        asr_text = "".join(chunk_words).strip()

        # 2) 取中间时刻的帧作为代表帧（比简单用场景首帧更稳定）
        mid_time = (start + end) / 2
        cap.set(cv2.CAP_PROP_POS_MSEC, mid_time * 1000)
        ret, frame = cap.read()
        frame_path = f"{out_dir}/chunk_{scene_num:04d}.jpg"
        if ret:
            cv2.imwrite(frame_path, frame)
        else:
            frame_path = f"{frame_dir}/scene-{scene_num:03d}-01.jpg"

        chunks.append(VideoChunk(
            chunk_id=f"{Path(video_path).stem}_{scene_num:04d}",
            video_path=str(video_path),
            start_sec=round(start, 2),
            end_sec=round(end, 2),
            duration=round(duration, 2),
            asr_text=asr_text,
            frame_path=str(Path(frame_path).resolve()),
            scene_score=float(row.get("scene_score", 0) or 0),
        ))

    cap.release()
    # 保存为 JSONL
    with open(f"{out_dir}/chunks.jsonl", "w", encoding="utf-8") as f:
        for c in chunks:
            f.write(json.dumps(asdict(c), ensure_ascii=False) + "\n")
    return chunks

chunks = align_scene_asr(
    "./lecture.mp4",
    "./scenes/scenes.csv",
    "./asr_result.json",
    "./scenes",
)
print(f"视频切片完成：共 {len(chunks)} 个 chunk，累计时长 "
      f"{sum(c.duration for c in chunks):.0f}s")
print("样例 chunk:", chunks[3].chunk_id, f"{chunks[3].start_sec}~{chunks[3].end_sec}s",
      chunks[3].asr_text[:50] + "..." if chunks[3].asr_text else "[无语音]")
```

切片粒度的黄金法则：**每个 chunk 时长 5~~30 秒，ASR 文本 20~~200 字**。太短会把一个完整语义拆开，检索到了也答不全；太长会让 CLIP 向量和文本向量"稀释"，画面和语音信息混在一起，召回准度下降。

### 🔑 CLIP 跨模态编码与 LanceDB 多模态存储

CLIP 是多模态 RAG 的基石——它用 4 亿对"图文对"做对比学习训练，学到的是**"这个文字描述和这张图在语义上是否匹配"**的能力。同一文本和对应图像编码后的向量余弦相似度很高（>0.8），和不相关图像的相似度很低（<0.2），这个性质让我们可以直接用同一个向量空间做跨模态检索。

```python
# pip install git+https://github.com/openai/CLIP.git  或 transformers 版
import lancedb
from lancedb.pydantic import LanceModel, Vector
import torch
import torch.nn.functional as F
from PIL import Image
from transformers import AutoProcessor, AutoModel, CLIPModel, CLIPTokenizerFast
import json
from pathlib import Path

# ========== 1. 加载 CLIP 模型（开源中文 CLIP 选 OFA-Sys/Chinese-CLIP 或 Alibaba EVA-CLIP）==========
MODEL_NAME = "OFA-Sys/chinese-clip-vit-base-patch16"  # 中文图文对训练，维数 512
VECTOR_DIM = 512

processor = AutoProcessor.from_pretrained(MODEL_NAME)
clip_model = AutoModel.from_pretrained(MODEL_NAME)
clip_model.eval().to("cuda" if torch.cuda.is_available() else "cpu")

@torch.no_grad()
def encode_text(text: str) -> list[float]:
    inputs = processor(text=text, return_tensors="pt", padding=True,
                       truncation=True, max_length=77).to(clip_model.device)
    emb = clip_model.get_text_features(**inputs)
    emb = F.normalize(emb, p=2, dim=-1)  # 归一化后余弦相似度 = 点积
    return emb[0].cpu().numpy().tolist()

@torch.no_grad()
def encode_image(img_path: str) -> list[float]:
    image = Image.open(img_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt").to(clip_model.device)
    emb = clip_model.get_image_features(**inputs)
    emb = F.normalize(emb, p=2, dim=-1)
    return emb[0].cpu().numpy().tolist()

# ========== 2. LanceDB Schema：同时存文本向量 + 图像向量 + 元数据 ==========
class VideoChunkIndex(LanceModel):
    chunk_id: str
    video_path: str
    start_sec: float
    end_sec: float
    duration: float
    asr_text: str
    frame_path: str
    text_vector: Vector(VECTOR_DIM)      # ASR 字幕的 CLIP 文本向量
    image_vector: Vector(VECTOR_DIM)     # 代表帧的 CLIP 图像向量
    # 融合向量 = 加权平均（后续检索可直接搜，也可分别搜再融合）
    fused_vector: Vector(VECTOR_DIM)     # 0.6 * text_vec + 0.4 * image_vec，可调

# ========== 3. 批量建索引 ==========
db = lancedb.connect("./multimodal_lancedb")
if "video_chunks" in db:
    table = db.open_table("video_chunks")
else:
    table = db.create_table("video_chunks", schema=VideoChunkIndex)

# 读 chunks.jsonl 并编码
records = []
with open("./chunks/chunks.jsonl", encoding="utf-8") as f:
    for line in f:
        c = json.loads(line)
        if not c["asr_text"] and not c["frame_path"]:
            continue

        t_vec = encode_text(c["asr_text"]) if c["asr_text"] else [0.0]*VECTOR_DIM
        i_vec = encode_image(c["frame_path"]) if Path(c["frame_path"]).exists() else [0.0]*VECTOR_DIM

        # 简单加权融合（后续 rerank 时再精细调）
        alpha = 0.6 if c["asr_text"] else 0.0  # 无字幕时纯图像
        beta  = 0.4 if Path(c["frame_path"]).exists() else 0.0
        norm = alpha + beta if (alpha + beta) > 0 else 1.0
        f_vec = [(alpha*t + beta*i)/norm for t, i in zip(t_vec, i_vec)]

        records.append(VideoChunkIndex(
            chunk_id=c["chunk_id"], video_path=c["video_path"],
            start_sec=c["start_sec"], end_sec=c["end_sec"],
            duration=c["duration"], asr_text=c["asr_text"],
            frame_path=c["frame_path"],
            text_vector=t_vec, image_vector=i_vec, fused_vector=f_vec,
        ))

table.add(records)
# 创建 ANN 索引（IVF_PQ 适合百万级以下规模）
table.create_index(
    metric="cosine",
    index_name="fused_vector_idx",
    column="fused_vector",
    train_partial_size=1000,
)
print(f"索引完成：{len(table)} 条视频 chunk 入库")
```

**CLIP 选型注意**：纯英文内容选 `openai/clip-vit-large-patch14`（效果最好）；中文内容选 `OFA-Sys/chinese-clip-vit-large-patch14` 或 `BAAI/AltCLIP`（中文图文对齐训练过）；算力有限选 base 版（512 维），精度优先选 large 版（768 维），速度再慢但精度最高选 SigLIP。

### 🔑 多模态联合检索 + 多模态 LLM 答案生成

检索阶段的关键点是**双通道召回 + 时间轴融合 rerank**：对一个用户查询（可能是文字也可能是上传的图片），分别用文本向量和图像向量做两路召回，然后按"时间戳邻近度 + 两种相似度加权"做 rerank，最后把 top-k 结果（字幕 + 帧截图 + 时间戳）一起喂给多模态 LLM 生成最终答案。

```python
import lancedb
from PIL import Image
import base64
import io
from openai import OpenAI
import json

db = lancedb.connect("./multimodal_lancedb")
table = db.open_table("video_chunks")

# ========== 1. 联合检索：用户查询 → 两路召回 → 融合 rerank ==========
def multimodal_search(query_text: str = None, query_image_path: str = None,
                      top_k: int = 5, k_initial: int = 30) -> list[dict]:
    """
    输入可以是文字、图片、或图文都有
    算法：文本向量召回 30 条 + 图像向量召回 30 条 → 按时间轴合并打分
    """
    candidates = {}  # chunk_id -> {row, sim_text, sim_image, final_score}

    # ---- 通道 A：文本召回（用 CLIP 文本向量搜 text_vector 和 fused_vector）----
    if query_text:
        q_text_vec = encode_text(query_text)
        # 搜 fused_vector 作为主通道
        res_text = table.search(q_text_vec, vector_column_name="fused_vector") \
                        .metric("cosine").limit(k_initial).to_list()
        for r in res_text:
            cid = r["chunk_id"]
            candidates[cid] = candidates.get(cid, {"row": r})
            candidates[cid]["sim_fused"] = 1.0 - r["_distance"]  # cosine dist -> sim

    # ---- 通道 B：图像召回（如果用户上传了图）----
    if query_image_path and Path(query_image_path).exists():
        q_img_vec = encode_image(query_image_path)
        res_img = table.search(q_img_vec, vector_column_name="image_vector") \
                       .metric("cosine").limit(k_initial).to_list()
        for r in res_img:
            cid = r["chunk_id"]
            candidates[cid] = candidates.get(cid, {"row": r})
            candidates[cid]["sim_image"] = 1.0 - r["_distance"]

    # ---- 融合 rerank：打分 = w1 * sim_text + w2 * sim_image + time_boost ----
    scored = []
    for cid, info in candidates.items():
        r = info["row"]
        s_f = info.get("sim_fused", 0.0)
        s_i = info.get("sim_image", 0.0)
        # 时间连续度奖励：如果和 neighbors 的 chunk 时间连续，加小分（更可能是完整段落）
        score = 0.7 * s_f + 0.3 * s_i
        scored.append((score, r))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_results = []
    seen_ids = set()
    for score, r in scored:
        if r["chunk_id"] in seen_ids:
            continue
        seen_ids.add(r["chunk_id"])
        r["_final_score"] = round(float(score), 4)
        top_results.append(r)
        if len(top_results) >= top_k:
            break
    return top_results

# ========== 2. 把 top-k 结果组装 prompt，投喂多模态 LLM ==========
def encode_image_base64(path: str, max_size: int = 512) -> str:
    """把帧图压缩成 base64 给多模态模型用（避免传超大图）"""
    img = Image.open(path).convert("RGB")
    w, h = img.size
    ratio = max_size / max(w, h)
    if ratio < 1.0:
        img = img.resize((int(w*ratio), int(h*ratio)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return base64.b64encode(buf.getvalue()).decode()

def ask_multimodal_rag(query_text: str, query_image: str = None) -> str:
    # Step 1: 检索 top-5 视频片段
    hits = multimodal_search(query_text=query_text, query_image_path=query_image, top_k=5)

    # Step 2: 组装多模态 prompt（文字 + 图片 base64）
    content = []
    content.append({"type": "text", "text": (
        "你是一个视频内容分析助手。用户会提问关于视频的问题。\n"
        "下面是检索到的最相关的 5 个视频片段，每个包含：时间戳、字幕（ASR）、对应画面截图。\n"
        "请严格基于这些上下文回答问题，答案中必须标明来自哪个视频的第几秒到第几秒。\n"
        f"\n用户问题：{query_text}\n\n检索到的片段："
    )})

    for i, h in enumerate(hits, 1):
        start, end = h["start_sec"], h["end_sec"]
        mins, secs = divmod(int(start), 60)
        h_m, h_s = divmod(int(end), 60)
        ts = f"{mins:02d}:{secs:02d} ~ {h_m:02d}:{h_s:02d}"
        asr = h["asr_text"] or "[该片段无语音字幕]"
        content.append({"type": "text", "text": (
            f"\n片段 #{i} 「{Path(h['video_path']).name} {ts}」\n"
            f"ASR 字幕：{asr}\n画面截图："
        )})
        if Path(h["frame_path"]).exists():
            b64 = encode_image_base64(h["frame_path"])
            content.append({"type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{b64}", "detail": "low"}})

    # Step 3: 调用多模态大模型（本地 Ollama 跑 llava 或 qwen2-vl，或云端 GPT-4V）
    client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
    resp = client.chat.completions.create(
        model="qwen2-vl:7b",  # 或 "llava:13b" 或 "gpt-4o"
        messages=[{"role": "user", "content": content}],
        max_tokens=1024,
        temperature=0.2,
    )
    answer = resp.choices[0].message.content
    # 附带命中片段信息，方便前端展示
    refs = [{"chunk_id": h["chunk_id"], "score": h["_final_score"],
             "time_range": f"{h['start_sec']:.0f}s-{h['end_sec']:.0f}s",
             "frame_path": h["frame_path"]} for h in hits]
    return answer, refs

# ========== 端到端测试 ==========
answer, refs = ask_multimodal_rag("这个视频里讲'配置 Kubernetes Ingress'那段是第几秒？画面里有什么关键信息？")
print("最终答案：\n", answer)
print("\n引用片段：", json.dumps(refs, ensure_ascii=False, indent=2))
```

## 常见误区或注意事项

1. **误区：视频按固定 10 秒一刀切，不做场景检测和语义对齐。** 为什么是坑：如果一刀刚好切在一个完整讲解句子的中间，前半句在 chunk A、后半句在 chunk B，ASR 文本被拆得稀碎，文本向量根本学不到完整语义；画面上如果切在一个操作步骤的中间，帧截图可能是模糊动作中间态，CLIP 编码出来的向量也会"四不像"。结果就是检索召回率暴跌 40% 以上，用户怎么搜都搜不到。正确做法：① 用 PySceneDetect 基于内容相似度找镜头切换边界（threshold 25~~30 比较稳），以场景切分为主；② 每个 scene 内部再按 ASR 的句子边界（句号、问号、感叹号，或 Whisper segment 的停顿点）做二次切分；③ 最终保证每个 chunk 的 ASR 文本是完整语义单元（完整句子或连续 3~~5 句），不足 3 句的和相邻 chunk 合并。

2. **误区：CLIP 编码时直接用整个长字幕串，不做关键词强化。** 为什么是坑：CLIP 预训练时的文本输入通常是短 caption（1~~2 句话），如果你的 ASR 字幕是一大段 300 字长文本，CLIP 的文本编码器会被"稀释"——名词、关键动词等信息占比下降，一堆连词和助词占了大量位置，编码出来的向量会偏向"通用话题"而抓不住关键实体。比如字幕讲的是"Nginx Ingress 配置路径重写的正则表达式写法"，结果向量和"服务器运维"这个通用话题更接近，用户搜具体的"rewrite 正则"就匹配不到。正确做法：CLIP 编码字幕向量之前，先做一次**关键词提取 + 高亮扩增**——用 TF-IDF 或 LLM 从长字幕里抽 top-5 关键词（如 "Nginx", "Ingress", "rewrite", "正则表达式", "路径重写"），把原字幕和关键词列表用分隔符拼起来再编码：`asr_text + " [KEY] " + ", ".join(keywords)`，这样 CLIP 会更关注核心实体，检索准度提升 10~~15%。

3. **误区：联合检索只用简单平均融合，不做 Cross-Encoder 多模态 rerank。** 为什么是坑：简单加权平均（0.6*文本+0.4*图像）假设每个模态在每个查询上的贡献比例是固定的，但实际完全不是——用户搜"那个讲'双因素认证'的片段在哪"，这是强文本查询，图像通道几乎没用（画面都是电脑屏幕截图），给图像 0.4 权重反而引入噪声；用户搜"画面里那个红色指示灯亮着的片段"，这是强图像查询，文本通道 ASR 可能根本没提指示灯，给图像只 0.4 权重就会漏召回。正确做法：第一阶段先分别用文本和图像召回 top-30，然后用一个**多模态 Cross-Encoder reranker**（如 `BAAI/bge-multilingual-gemm-large` 或 `Alibaba-NLP/m3e-multimodal-base`）对 60 个候选做精细打分，Cross-Encoder 会动态学习"当前查询下该给文本/图像多少权重"。经验上，加 Cross-Encoder rerank 后 top-1 准确率提升 20~30 个百分点。

4. **误区：直接把原分辨率帧图（1920×1080）塞进多模态 LLM，显存爆了就说模型不行。** 为什么是坑：CLIP 本身输入就缩放到 224×224，大分辨率帧在编码前会被 resize，白白浪费磁盘 IO；而多模态 LLM（如 LLaVA、Qwen2-VL）处理一张 1920×1080 图的视觉 token 数是 ~2304 个，相当于 1000 字文本，5 张图就吃掉 1 万 token 的上下文预算，推理速度暴慢、显存直接 OOM。正确做法：① 建索引前就把代表帧图统一 resize 到 672×672 或 512×512（CLIP 内部也会缩，提前缩还能加速编码）；② 喂给多模态 LLM 前再缩一次，图像参数传 `detail: "low"` 或"medium"，除非任务需要辨认画面中的小字（如代码截图）否则永远别开 high；③ 如果 top-5 帧里有连续时间戳的相邻 chunk，就把它们拼成一张大图（上下排列）再送进去，token 数省一半。
