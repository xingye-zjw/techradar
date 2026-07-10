---
title: 多模态 RAG 图像分块过大导致召回率低
category: llm
difficulty: intermediate
duration: 30分钟
summary: 聚焦单点问题：多模态 RAG 场景中图像分块（chunk）过大（一张大图只切块或切分粒度太粗），导致 CLIP 编码向量被背景噪声稀释，小目标图文匹配召回率低于 20%，下游生成答案完全找不到依据，涵盖分块粒度诊断、滑动窗口切块、层级召回等排查修复方案。
takeaways:
  - '快速识别「多模态 RAG 图像分块过大召回低」的典型症状 - 理解 CLIP 向量被背景稀释、小目标特征被淹没、视觉 token 数不足三大根因 - 学会分步排查和修复图像分块召回率低的标准化流程 - 了解滑动窗口切块、金字塔多尺度、图文分块对齐等预防措施，避免下次再踩"'
relatedIntel:
  - '171-multimodal-rag-video - 035-advanced-rag - 096-pitfall-rag"'
tags:
  - 多模态RAG
  - 图像分块
  - CLIP
  - 召回率低
relatedTerms:
  - multimodal-rag
  - rag
  - transformer
  - cnn
relatedTools:
  - lancedb
  - haystack
  - langchain
  - unstructured
relatedNodes:
  - llm-rag
  - rag-pipeline
---

## 为什么你要学它

这是做多模态 RAG 系统最容易被忽略但伤害极大的一个坑：**图像分块（chunk）过大导致图文召回率极低**。

很多团队在做图文知识库 RAG 时，直接把一整张高清产品手册页、一整张大屏幕截图、一张包含十几个 UI 组件的设计图"原图不变"送进 CLIP 编码向量，然后信心满满地上线。结果用户搜"页面右上角那个红色提交按钮在哪"，召回的前 10 张图里没有一张对的；问"手册第 3 页第 2 节里的表格参数"，完全匹配不到正确位置。团队开始怀疑 CLIP 不行、怀疑向量数据库不准、怀疑 prompt 写得不好——折腾了一个月，最后才发现只是因为分块太大：一张图里有 80% 的内容和查询无关，这些无关背景噪声把目标特征完全"稀释"了，CLIP 编码出来的向量是整图的"平均语义"，根本不是用户要找的那个小按钮、那个小表格、那段小字。

如果你正在做多模态 RAG、图文知识库、产品手册智能问答这类需要从图里找细节的系统，这篇卡片会帮你快速定位召回率低的根因、掌握图像分块的正确姿势，并从架构层面避免重踩这个坑。

## 一句话概览（快速版）

> **快速修复：原图按 448×448 滑动窗口 50% 重叠切块、额外对原图做 3 级金字塔缩放（×0.5、×0.25、×0.125）、召回后先 NMS 去重再喂 LLM**

核心要点：

- **现象**：用户搜图中细节，Top-K 召回无一张命中
- **根因**：大图像 CLIP 向量被背景稀释、小目标特征淹没
- **解决**：按照下方 6 步标准流程排查

## 核心拆解

### 🔑 典型症状

- × 用户查询描述图中明确存在的小目标（如"红色提交按钮""表格第 3 行参数"），Top-10 召回里一张正确的都没有
- × 对一张大图单独用 CLIP 文本搜图，当查询换成图中左上角的小字内容时，余弦相似度从 0.85 骤降到 0.3 以下
- × 召回可视化后发现：返回的图像都是和整图主题相关但细节对不上的，比如搜"某页第 2 节"返回了同一手册的其他页面
- × 纯文本 RAG 召回率能到 85%，加上图像分块后整体召回率反而掉到 50% 以下，图像通道贡献几乎为零
- × 同一张图切成 4 块单独搜命中率 70%，原图整块搜命中率只有 15%，但系统里仍然只用了原图切块

### 🔑 根本原因

**CLIP 视觉特征被大图中的无关背景严重稀释**是第一根因：CLIP 在训练时看到的图文对大多是"一图一物"或"一图一个主题"（如一张图拍一只猫 + 一句"一只橘猫在沙发上睡觉"），它的图像编码器会对整张图做全局平均池化，最后得到的向量是整图所有 patch 的加权平均语义。如果你的图里 85% 是空白背景、10% 是无关装饰，只有 5% 是用户真正要找的那个小按钮，那么编码出来的向量里 95% 的信息都来自背景和装饰，目标特征完全被淹没。第二根因是**视觉 token 数量与文本 token 严重失衡**：一张 224×224 的图进入 CLIP 会被切成 196 个 patch token，但用户查询通常只有 10~20 个字的文本 token，交叉注意力时文本端根本无法"聚焦"到那几个对应小目标的 patch 上，相似度自然被拉到平均水平。第三根因是**图像和文本的分块粒度完全不对齐**：文本侧按段落切成了 500 字的小块（对应一张图的 1/4 区域），但图像侧却保留了整块大图，导致一段"讲右上角按钮"的文本向量和"整页截图"的图像向量在语义上根本不匹配，联合检索两路结果怎么都融合不到一块。

## 完整排查方案

按照以下步骤逐一排查，通常能在几分钟内定位并解决问题：

1.  先做"大图 vs 切块"的 A/B 对比测试：随机抽 50 条用户查询 + 对应的真值图像区域，将同一批图像分别用"整图不切块"和"448×448 滑动窗口切块"两种方式建索引，对比 Top-1/Top-5 召回率，如果整图比切块低 30 个点以上，说明确实是分块粒度问题。
2.  做目标尺寸分布诊断：对知识库中所有图像做目标检测（或人工统计 200 张），统计用户常搜的关键目标（按钮、表格、段落、图标等）占所在图像的面积比例，如果 70% 的目标占比 < 10%，说明必须做细粒度切块。下面是诊断脚本：

```python
import json
import os
from PIL import Image
import numpy as np
from collections import Counter
from pathlib import Path
import matplotlib.pyplot as plt

# 你的真值标注：[{"query": "...", "img": "a.jpg", "bbox_rel": [x1,y1,x2,y2], "is_hit": bool}]
with open("./mmrag_gt_50.json", encoding="utf-8") as f:
    gt = json.load(f)

areas_pct = []  # 目标占整图的面积百分比
for item in gt:
    img = Image.open(item["img"])
    W, H = img.size
    x1, y1, x2, y2 = item["bbox_rel"]
    area_rel = (x2 - x1) * (y2 - y1) * 100  # 转百分比
    areas_pct.append(area_rel)
    print(f"{Path(item['img']).name:20s} 目标面积占比: {area_rel:5.1f}% {'⚠️小目标' if area_rel < 10 else ''}")

print("\n=== 目标面积占比分布 ===")
bins = [0, 2, 5, 10, 20, 50, 100]
labels = ["<2%", "2~5%", "5~10%", "10~20%", "20~50%", ">50%"]
counts = Counter(np.digitize(areas_pct, bins) - 1)
for i, lab in enumerate(labels):
    n = counts.get(i, 0)
    bar = "█" * int(n * 60 / max(1, max(counts.values())))
    print(f"{lab:>8s}  N={n:3d}  {bar}")

small_target_ratio = sum(a < 10 for a in areas_pct) / len(areas_pct)
print(f"\n小目标占比(<10%面积): {small_target_ratio:.0%}")
if small_target_ratio > 0.5:
    print("👉 诊断结论: 超过一半查询目标是小目标，必须使用滑动窗口切块 + 金字塔缩放")
elif small_target_ratio > 0.2:
    print("👉 诊断结论: 存在相当比例小目标，建议整图+切块双通道并行召回")
else:
    print("👉 诊断结论: 大部分目标较大，整图可保留，仍建议加切块辅助通道")

plt.figure(figsize=(8, 4))
plt.hist(areas_pct, bins=20, cumulative=True, density=True, histtype="step", color="blue")
plt.axvline(x=10, color="r", linestyle="--", label="10% 小目标分界线")
plt.xlabel("目标占整图面积比例 (%)")
plt.ylabel("累积分布")
plt.title("多模态 RAG 查询目标面积分布")
plt.legend()
plt.tight_layout()
plt.savefig("./mmrag_target_size_diag.png", dpi=120)
print("\n诊断图已保存: ./mmrag_target_size_diag.png")
```

3.  启用**滑动窗口切块策略**：以 448×448 为基准块大小（CLIP 标准 224 的 2 倍，保留足够上下文），步长设为块大小的 50%（即 224 像素，保证重叠覆盖不丢边缘），对每张原图切块后和原图一起入向量库，原图向量额外加权 0.3、切块向量加权 0.7。
4.  启用**金字塔多尺度缩放**：除了原分辨率切块，额外对原图做 3 级下采样（×0.5、×0.25、×0.125），×0.125 级用来召回"整图级"相关内容，×0.5 和 ×0.25 级用来召回"中等区域"，原分辨率切块用来搜"小目标细节"，四级并行召回再按位置去重融合。
5.  实现图文分块对齐：如果 PDF/手册是图文混排的，先做版面分析（用 LayoutLM 或 PP-Structure）拆出"文本块区域""表格区域""图像区域"，每一个版面区域单独存一对（对应的文本内容向量 + 区域裁剪图像向量），保证图文两个模态的分块粒度严格一致。
6.  召回后做 NMS 非极大值抑制 + 位置去重：滑动窗口会产生多个位置重叠的候选块，用 NMS（IOU 阈值 0.5）合并高度重叠的候选，取其中相似度最高的那个，既减少冗余又提升 LLM 上下文有效率。

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> 原图按 448×448 滑动窗口 50% 重叠切块、额外对原图做 3 级金字塔缩放（×0.5、×0.25、×0.125）、召回后先 NMS 去重再喂 LLM

```python
from PIL import Image
import lancedb
from lancedb.pydantic import LanceModel, Vector
from transformers import AutoProcessor, AutoModel
import torch
import torch.nn.functional as F
import numpy as np
from pathlib import Path

# ===== 1. CLIP 模型（中文场景用 chinese-clip，英文用 openai/clip-vit-large-patch14）=====
MODEL = "OFA-Sys/chinese-clip-vit-base-patch16"
VEC_DIM = 512
processor = AutoProcessor.from_pretrained(MODEL)
clip = AutoModel.from_pretrained(MODEL).eval().to("cuda")

@torch.no_grad()
def encode_text(text: str):
    inp = processor(text=[text], return_tensors="pt", padding=True,
                    truncation=True, max_length=77).to(clip.device)
    vec = F.normalize(clip.get_text_features(**inp), p=2, dim=-1)[0]
    return vec.cpu().numpy().tolist()

@torch.no_grad()
def encode_image(img_pil: Image.Image):
    inp = processor(images=[img_pil.convert("RGB")], return_tensors="pt").to(clip.device)
    vec = F.normalize(clip.get_image_features(**inp), p=2, dim=-1)[0]
    return vec.cpu().numpy().tolist()

# ===== 2. 修复版：滑动窗口切块 + 金字塔多尺度 =====
def pyramid_sliding_crop(img_path: str, base_size: int = 448, overlap: float = 0.5,
                        scales: list = None) -> list[dict]:
    """输入一张大图，输出「原图(金字塔多级) + 滑动窗口切块」的所有候选"""
    scales = scales or [1.0, 0.5, 0.25, 0.125]
    img = Image.open(img_path).convert("RGB")
    W, H = img.size
    outputs = []
    src_name = Path(img_path).name

    # 2a. 金字塔级：整图缩放，覆盖"全局级/区域级"查询
    for s in scales:
        if abs(s - 1.0) < 1e-6:
            rsz = img.copy()
        else:
            nw, nh = max(1, int(W*s)), max(1, int(H*s))
            rsz = img.resize((nw, nh), Image.BICUBIC)
        outputs.append({
            "src_image": src_name, "crop_type": f"pyramid_s{s}",
            "abs_box": [0, 0, W, H], "rel_box": [0.0, 0.0, 1.0, 1.0],
            "image": rsz, "scale": s,
        })

    # 2b. 滑动窗口切块（原分辨率，步长 base_size * overlap）
    stride = int(base_size * (1 - overlap))
    for y in range(0, H, max(stride, 1)):
        for x in range(0, W, max(stride, 1)):
            box = (x, y, min(x+base_size, W), min(y+base_size, H))
            crop = img.crop(box)
            if crop.size[0] < 64 or crop.size[1] < 64:
                continue  # 过小的边角块丢
            outputs.append({
                "src_image": src_name, "crop_type": "sliding",
                "abs_box": list(box),
                "rel_box": [box[0]/W, box[1]/H, box[2]/W, box[3]/H],
                "image": crop, "scale": 1.0,
            })
    return outputs

# ===== 3. 建 LanceDB 索引 =====
class ImageChunkIndex(LanceModel):
    src_image: str
    crop_type: str
    rel_box: list[float]   # [x1,y1,x2,y2] 相对原图的坐标
    text_vector: Vector(VEC_DIM)
    image_vector: Vector(VEC_DIM)

db = lancedb.connect("./mmrag_lancedb")
if "img_chunks" in db:
    db.drop_table("img_chunks")
tbl = db.create_table("img_chunks", schema=ImageChunkIndex)

KB_IMAGE_DIR = "./kb_images"
records = []
for img_path in sorted(Path(KB_IMAGE_DIR).glob("*.jpg")):
    crops = pyramid_sliding_crop(str(img_path))
    for c in crops:
        ivec = encode_image(c["image"])
        # 辅助：用整图的 OCR 文本（如果有的话）编码一个 text_vector 做双通道
        ocr_text = f"from_image_{c['crop_type']}"  # 实际接 PaddleOCR
        tvec = encode_text(ocr_text)
        records.append(ImageChunkIndex(
            src_image=c["src_image"], crop_type=c["crop_type"],
            rel_box=c["rel_box"], image_vector=ivec, text_vector=tvec,
        ))
    print(f"[索引] {img_path.name}: {len(crops)} 块")
tbl.add(records)
tbl.create_index(metric="cosine", index_name="ivf", column="image_vector",
                 train_partial_size=min(1000, len(records)))
print(f"✅ 索引完成: {len(tbl)} 个图像块")

# ===== 4. 召回 + NMS 去重 =====
def iou_2d(b1, b2):
    x1 = max(b1[0], b2[0]); y1 = max(b1[1], b2[1])
    x2 = min(b1[2], b2[2]); y2 = min(b1[3], b2[3])
    inter = max(0, x2-x1) * max(0, y2-y1)
    u = (b1[2]-b1[0])*(b1[3]-b1[1]) + (b2[2]-b2[0])*(b2[3]-b2[1]) - inter
    return inter / max(u, 1e-8)

def nms_candidates(cands, iou_thr=0.5, src_aware=True):
    """NMS：按相似度从高到低，丢掉与已保留高置信度过重叠的候选"""
    cands = sorted(cands, key=lambda r: -r["sim"])
    kept = []
    for c in cands:
        skip = False
        for k in kept:
            if src_aware and c["src_image"] != k["src_image"]:
                continue
            if iou_2d(c["rel_box"], k["rel_box"]) > iou_thr:
                skip = True; break
        if not skip:
            kept.append(c)
    return kept

def mmrag_search(query_text: str, top_k=5):
    qvec = encode_text(query_text)
    hits = tbl.search(qvec, vector_column_name="image_vector") \
               .metric("cosine").limit(top_k * 6).to_list()
    cands = [{
        "src_image": r["src_image"], "rel_box": r["rel_box"],
        "crop_type": r["crop_type"], "sim": 1.0 - r["_distance"]
    } for r in hits]
    # 金字塔级候选降权 20%（优先精确切块）
    for c in cands:
        if c["crop_type"].startswith("pyramid"):
            c["sim"] *= 0.8
    deduped = nms_candidates(cands, iou_thr=0.5)
    return deduped[:top_k]

# 示例：查询右上角红色按钮
top = mmrag_search("页面右上角的红色提交按钮", top_k=5)
for r in top:
    print(f"🔍 {r['src_image']} @ {r['rel_box']} "
          f"[{r['crop_type']}] sim={r['sim']:.3f}")
```

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- 上线前必须做目标尺寸分布诊断，抽取 200 条真实查询统计目标占图面积比例，超过 50% 查询是 <10% 小目标时必须启用滑动窗口切块
- 图像分块默认采用"金字塔多尺度（4 级）+ 滑动窗口切块（448×448，50% 重叠）+ 整图"三路并行召回，召回后 NMS 去重
- 图文混排文档必须先做版面分析，文本块和图像区域的分块粒度严格对应，保证两个模态的向量语义对齐
- 定期用真实查询标注做 A/B 回归测试，分别统计整图通道、切块通道、金字塔通道的单独命中率，任何一个通道贡献低于 5% 都要查原因

## 常见误区

1. 为了省存储空间，一张图就存一个向量不做任何切块，觉得"CLIP 是大模型应该看得懂整张图"，结果小目标细节全部被背景淹没
2. 滑动窗口切块时用 0 重叠，以为步长等于块大小足够了，结果目标刚好跨在两个块边界上，两个块都只看到一半，谁都搜不到
3. 只建了原分辨率切块，不做金字塔缩放，搜"这张产品手册整体讲什么"这种整图级问题时，召回的都是某一小角的切块块，上下文完全不够
4. 召回后直接把前 20 个候选全塞给 LLM，不做 NMS 去重，结果 LLM 上下文被 10 个位置几乎一样的切块占满，有效信息反而不足

## 推荐学习顺序

1. 先看「典型症状」确认你遇到的是不是这个问题
2. 再看「快速修复」试试能不能立刻解决
3. 如果不行，按照「完整排查方案」一步步来
4. 最后一定要看「预防措施」，避免下次再踩
