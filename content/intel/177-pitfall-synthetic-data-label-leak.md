---
title: 合成数据训练测试集标签泄漏导致虚高分
category: llm
difficulty: advanced
duration: 30分钟
summary: 聚焦单点问题：使用大模型生成的合成数据做 SFT/RLHF 微调时，训练集与评测集之间发生标签泄漏（答案模式泄漏、前缀 N-gram 重合、语义近邻混入），导致线下评测分数虚高 5~20 个点，但线上真实场景效果暴跌，涵盖泄漏检测、去污染三层防线、数据生成全流程隔离等排查修复方案。
takeaways:
  - '快速识别「合成数据标签泄漏虚高分」的典型症状 - 理解生成-评测未分离、前缀模式泄漏、语义近邻污染三大根因 - 学会分步排查和构建去污染三层防线的标准化流程 - 了解三模型分离原则、私有 hold-out 集、模式级泄漏检测等预防措施，避免下次再踩"'
relatedIntel:
  - '170-llm-synthetic-data - 090-pitfall-dl-training - 039-model-evaluation"'
tags:
  - 合成数据
  - 标签泄漏
  - 去污染
  - 模型微调
relatedTerms:
  - fine-tuning
  - rlhf
  - kl-divergence
  - entropy
relatedTools:
  - ollama
  - huggingface-transformers
  - datasets
  - pandas
relatedNodes:
  - llm-finetune
  - llm-eval
---

## 为什么你要学它

这是用合成数据做模型微调时最隐蔽也最致命的一个坑：**标签泄漏导致线下评测虚高、线上效果直接崩**。

很多团队在拿到 GPT-4 级别教师模型生成的合成数据后，线下跑 MMLU/CMMLU 或自定义业务评测，分数能从 50 分冲到 75 分，以为自己炼出了"领域神丹"，结果一到真实用户场景，正确率直接打回原形甚至不如未微调的基座。事后复盘才发现：要么合成数据生成 prompt 里偷偷混进了评测集的问题和答案模式，要么同一个教师模型既出了训练数据又出了评测题答案，要么训练集和评测集虽然字面不同但语义上是同一个问题的改写——模型根本没学会推理，只是背下了评测集的"答题暗号"。标签泄漏是目前业界合成数据微调翻车的头号元凶，也是很多"效果惊人但无法复现"社区论文的真正原因。

如果你正在用合成数据做 SFT/RLHF，或者计划用教师模型蒸馏小模型，这篇卡片会帮你建立完整的泄漏检测意识、构建三层去污染防线，并从数据生成流程上彻底根治这个问题。

## 一句话概览（快速版）

> **快速修复：严格执行三模型分离（生产/审核/目标）、新增 30% 私有 hold-out 集不参与任何训练、MinHash LSH + 前缀 N-gram + 向量近邻三层去污染**

核心要点：

- **现象**：线下评测涨 10 分但线上真实效果暴跌
- **根因**：同模型既出训练又出评测、前缀模式相同、语义近邻未过滤
- **解决**：按照下方 6 步标准流程排查

## 核心拆解

### 🔑 典型症状

- × 自定义业务评测集上微调后正确率涨 15+ 个点，但换一组人工新出的题立刻回到原水平
- × 模型输出风格与评测集参考答案高度相似，甚至出现相同的错误表述和错别字
- × MinHash 去重后，训练集与评测集仍有 3% 样本的 Jaccard 相似度 > 0.6
- × 对训练集和评测集的问题做 embedding 聚类后，有 20% 以上聚类簇同时包含训练样本和评测样本
- × 教师模型在同一评测集上的准确率为 85%，你蒸馏的小模型同一份评测集上却有 88%，超过了教师模型能力上限

### 🔑 根本原因

**生成-评测未做模型分离**是第一根因：很多团队用同一个 GPT-4 级别模型既负责生成合成训练数据，又负责生成评测集的参考答案，甚至直接让同一个模型"出 100 道题"训练、"再出 20 道题"评测，本质上训练和评测共享了同一个"出题思路分布"——小模型学到的不是通用能力，而是这位教师模型的"出题套路和答题暗号"，换一个模型出的题就完全失效。第二根因是**前缀 N-gram 和答案模式泄漏未检测**：合成数据生成时经常使用"请参考以下示例格式生成更多样本"的 few-shot 策略，如果 few-shot 示例恰好来自评测集或其改写版本，那么训练样本开头 20~30 字的 N-gram 指纹会和评测集高度重合，模型只要看到开头几个关键词就能凭记忆输出答案，根本不需要推理。第三根因是**只做了字面级去重，未做语义级去污染**：同一个问题换一种问法（比如"XX 的原理是什么"改写成"请阐述 XX 的工作机制"），MinHash 字面相似度可能只有 0.3，但语义上是完全相同的，模型在训练集里学会了这个问题的答案，评测时直接默写出来就是虚高。

## 完整排查方案

按照以下步骤逐一排查，通常能在几分钟内定位并解决问题：

1.  先做"跨模型一致性验证"：用两个完全不同来源的大模型（例如教师模型 A=GPT-4o、对比模型 B=Claude 3.5 Sonnet，注意两者 API 提供商、模型架构都不同）分别在你的评测集上跑一次准确率，如果 A 的得分比 B 高出 8 个点以上，说明评测集被 A 的出题风格污染了，必须换题重出。
2.  做三层去污染扫描：第一层字面级 MinHash Jaccard > 0.6 检测、第二层前缀 20 字 N-gram 精确匹配、第三层 embedding 余弦相似度 > 0.85 的语义近邻检测；扫描范围是"训练集 × 评测集（含 validation split）"全量两两比对。下面是检测脚本：

```python
import json
import numpy as np
import pandas as pd
from datasketch import MinHash, MinHashLSH
from collections import Counter
from sentence_transformers import SentenceTransformer  # pip install sentence-transformers

# ========== 加载数据 ==========
def load_jsonl(p):
    return [json.loads(l) for l in open(p, encoding="utf-8")]

train = load_jsonl("./train_synthetic.jsonl")
eval_ = load_jsonl("./eval_private.jsonl")
train_qs = [x["instruction"] for x in train]
eval_qs = [x["instruction"] for x in eval_]
print(f"[规模] 训练={len(train_qs)} 条，评测={len(eval_qs)} 条")

# ========== 第一层：MinHash LSH 字面去重 ==========
def shingle(text, k=5):
    text = text.lower().strip()
    if len(text) < k:
        return {text}
    return {text[i:i+k] for i in range(len(text) - k + 1)}

def mhash(shingles, num_perm=256):
    m = MinHash(num_perm=num_perm)
    for s in shingles:
        m.update(s.encode("utf-8"))
    return m

NUM_PERM, JACC_THR = 256, 0.6
lsh_train = MinHashLSH(threshold=JACC_THR, num_perm=NUM_PERM)
train_mh = {}
for i, q in enumerate(train_qs):
    mh = mhash(shingle(q))
    lsh_train.insert(f"t{i}", mh)
    train_mh[i] = mh

leak_layer1 = []
for j, eq in enumerate(eval_qs):
    matches = lsh_train.query(mhash(shingle(eq)))
    if matches:
        leak_layer1.append({"eval_idx": j, "matched_train_ids": matches[:5],
                            "type": "L1_Minhash", "eval_q": eq[:60]})
print(f"[L1 字面] 发现 {len(leak_layer1)} 条潜在泄漏")

# ========== 第二层：前缀 N-gram 精确匹配 ==========
N, PREFIX_LEN = 4, 20
train_prefix = {}
for i, q in enumerate(train_qs):
    prefix = q[:PREFIX_LEN].strip()
    train_prefix.setdefault(prefix, []).append(i)

leak_layer2 = []
for j, eq in enumerate(eval_qs):
    prefix = eq[:PREFIX_LEN].strip()
    if prefix in train_prefix:
        leak_layer2.append({"eval_idx": j, "matched_train_ids": train_prefix[prefix][:5],
                            "type": "L2_Prefix", "prefix": prefix})
print(f"[L2 前缀] 发现 {len(leak_layer2)} 条潜在泄漏")

# ========== 第三层：embedding 语义近邻 ==========
emb_model = SentenceTransformer("BAAI/bge-m3", device="cuda")
train_embs = emb_model.encode(train_qs, normalize_embeddings=True, show_progress_bar=True)
eval_embs = emb_model.encode(eval_qs, normalize_embeddings=True, show_progress_bar=True)
SIM_THR = 0.85
leak_layer3 = []
for j, evec in enumerate(eval_embs):
    sims = train_embs @ evec
    top_i = int(np.argmax(sims))
    top_sim = float(sims[top_i])
    if top_sim >= SIM_THR:
        leak_layer3.append({"eval_idx": j, "matched_train_id": top_i,
                            "type": "L3_Semantic", "cos_sim": round(top_sim,3),
                            "eval_q": eval_qs[j][:60], "train_q": train_qs[top_i][:60]})
print(f"[L3 语义] 发现 {len(leak_layer3)} 条潜在泄漏")

# ========== 汇总报告 ==========
report = pd.DataFrame(leak_layer1 + leak_layer2 + leak_layer3)
if not report.empty:
    report.to_csv("./leakage_report.csv", index=False, encoding="utf-8-sig")
print(f"[汇总] 共 {len(report)} 条风险样本，详情请查看 leakage_report.csv")
```

3.  对所有检测到的泄漏样本做分类处理：① L1/L2 级直接从训练集中删除对应的训练样本；② L3 级人工二次确认，确认语义确实相同的删除，只是领域相似但问题不同的保留。
4.  建立**三模型分离原则**：① 训练数据生产模型（最强的教师模型）；② 质量审核 + 评测题答案生成模型（另一个不同来源的强模型）；③ 最终目标微调模型（你的小模型），三者必须是架构/提供商完全不同的模型，绝不复用。
5.  新增**私有 hold-out 评测集**：从业务真实用户的历史问题中随机抽样 300~500 条，人工标注答案，这份 hold-out 集永不参与任何训练数据的生成 prompt、不做去污染的扫描对比（扫描本身也可能泄漏），只在最终发布模型时跑一次作为"真实成绩"。
6.  做泄漏量化评估：比较微调前后，模型在"公开评测集"和"私有 hold-out 集"上的分数涨幅差值，如果涨幅差 > 8 个点，说明仍然存在泄漏，需要循环回第 2 步再查。

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> 严格执行三模型分离（生产/审核/目标）、新增 30% 私有 hold-out 集不参与任何训练、MinHash LSH + 前缀 N-gram + 向量近邻三层去污染

```python
# ========== 修复版合成数据生成流水线（含去污染硬约束） ==========
import json
import random
from openai import OpenAI
from datasketch import MinHash, MinHashLSH

# 关键原则 1：三模型分离
PRODUCER_MODEL = "qwen2.5:32b"           # 训练数据生产模型（强但闭源）
REVIEWER_MODEL = "llama3.1:70b"           # 审核 + 评测题答案生成（完全不同的另一个）
TARGET_MODEL_BASE = "qwen2.5:7b"          # 最终要微调的目标小模型
# 注意：上面三个的架构、提供商必须完全不同

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

# 关键原则 2：评测集（含 validation）必须在生成训练数据之前就冻结
# eval_frozen.jsonl 必须在开始任何合成数据前人工出好或从完全独立来源下载
with open("./eval_frozen.jsonl", encoding="utf-8") as f:
    FROZEN_EVAL = [json.loads(l) for l in f]
FROZEN_Q_SET = set(x["instruction"][:20] for x in FROZEN_EVAL)  # 前缀指纹
print(f"冻结评测集：{len(FROZEN_EVAL)} 条，已加前缀指纹黑名单")

# 关键原则 3：训练数据生成时硬约束 —— 不允许看到任何评测相关内容
GEN_PROMPT_TEMPLATE = """你是一个法律领域问答数据生成器。
【严格禁令】以下内容绝对不能出现在生成的数据中：
1. 任何包含以下关键词前缀的问题：{banned_prefixes}
2. 直接询问"2024 年司法考试第 N 题"这类与公开评测高度重合的题目
3. 问题格式必须多样化，至少包含 5 种不同的提问句式

请生成 N={n} 条新的法律问答，每条 JSON 格式：{{"instruction": "...", "answer": "..."}}
领域子方向：{domain}
难度分布：简单 30%、中等 50%、困难 20%
要求答案必须给出法律依据原文引用，不少于 300 字。
只输出 JSON 数组，不要任何解释。"""

def generate_one_batch(domain: str, n=50) -> list[dict]:
    # 构建禁令：把冻结评测集的前 20 字高频前缀作为禁令
    prefix_list = random.sample(list(FROZEN_Q_SET), k=min(50, len(FROZEN_Q_SET)))
    banned = "、".join(f"'{p}…'" for p in prefix_list[:15])
    prompt = GEN_PROMPT_TEMPLATE.format(banned_prefixes=banned, n=n, domain=domain)
    resp = client.chat.completions.create(
        model=PRODUCER_MODEL, messages=[{"role": "user", "content": prompt}],
        temperature=0.85, max_tokens=4096,
    )
    try:
        return json.loads(resp.choices[0].message.content)
    except Exception:
        return []

# 关键原则 4：生成后立即通过三层去污染过滤器（与排查脚本相同，简化版）
def dedup_and_decontaminate(raw_samples: list[dict], lsh_eval: MinHashLSH,
                            eval_prefixes: set, train_embs=None) -> list[dict]:
    clean = []
    for s in raw_samples:
        q = s.get("instruction", "")
        # L2: 前缀精确匹配冻结集 → 直接丢
        if q[:20] in eval_prefixes:
            continue
        # L1: MinHash 查询 LSH → 命中丢
        mh = MinHash(num_perm=256)
        for sh in {q[i:i+5] for i in range(len(q)-4)}:
            mh.update(sh.encode("utf-8"))
        if lsh_eval.query(mh):
            continue
        clean.append(s)
    return clean

# 构建冻结评测集的 LSH 索引和前缀集
lsh_eval = MinHashLSH(threshold=0.6, num_perm=256)
eval_prefixes = set()
for i, x in enumerate(FROZEN_EVAL):
    q = x["instruction"]
    eval_prefixes.add(q[:20])
    mh = MinHash(num_perm=256)
    for sh in {q[j:j+5] for j in range(len(q)-4)}:
        mh.update(sh.encode("utf-8"))
    lsh_eval.insert(f"e{i}", mh)

# 跑一整批生成 → 去污染 → 保存
all_clean = []
for domain in ["民法", "刑法", "商法", "行政法"]:
    for attempt in range(10):
        batch = generate_one_batch(domain, n=50)
        clean_batch = dedup_and_decontaminate(batch, lsh_eval, eval_prefixes)
        all_clean.extend(clean_batch)
        print(f"[{domain}] 批次产出={len(batch)}，通过去污染={len(clean_batch)}，累计={len(all_clean)}")
        if len(all_clean) >= 2000:
            break
    if len(all_clean) >= 2000:
        break

with open("./train_synthetic_cleaned.jsonl", "w", encoding="utf-8") as f:
    for s in all_clean:
        f.write(json.dumps(s, ensure_ascii=False) + "\n")
print(f"✅ 最终通过去污染的数据：{len(all_clean)} 条 → train_synthetic_cleaned.jsonl")
```

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- 合成数据流水线必须严格执行"三模型分离"原则：训练数据生产、质量审核+评测答案生成、最终目标微调三个模型必须来自不同架构和厂商，绝不复用
- 建立私有 hold-out 评测集：从真实用户反馈中抽取 300+ 条人工标注，永不参与任何训练 prompt、不做去污染扫描，只在最终发布时跑一次当真实成绩
- 上线前去污染必须过三层关卡：字面 MinHash Jaccard > 0.6 删除、前缀 20 字精确匹配删除、embedding 余弦相似度 > 0.85 人工复核
- 如果有同领域已发布的公开 benchmark，额外跑一次"公开 benchmark 与训练集"的交叉去污染，宁删 100 条训练样本不留 1 条泄漏

## 常见误区

1. 用同一个模型既出训练数据又出评测题和答案，还沾沾自喜"一套模型全搞定"，结果小模型学会的只是这个模型的答题暗号，换题就崩
2. 只做字面精确匹配去重，不查前缀 N-gram 和语义近邻，实际上同一个问题换个问法模型照样能背出来，虚高 10 个点没商量
3. 把 validation split 当作"干净评测集"，实际上在调超参数、选 checkpoint 时已经用 validation 做了无数次决策，信息早就通过人的选择泄漏了
4. 发现模型超过了教师模型的准确率，第一反应是"我炼丹真厉害"，而不是立刻意识到这是 100% 的标签泄漏信号

## 推荐学习顺序

1. 先看「典型症状」确认你遇到的是不是这个问题
2. 再看「快速修复」试试能不能立刻解决
3. 如果不行，按照「完整排查方案」一步步来
4. 最后一定要看「预防措施」，避免下次再踩
