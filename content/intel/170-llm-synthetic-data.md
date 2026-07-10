---
title: 大模型合成数据生成与去污染、防标签泄漏
category: llm
difficulty: advanced
duration: 2周
summary: 解决高质量标注数据稀缺、评测集泄漏两大行业痛点。覆盖从教师模型蒸馏、进化指令、自我对弈三类合成数据生成范式，到 MinHash + N-gram 去重、前缀匹配防泄漏、交叉验证三层防线的完整工程实践。
keywords:
  - 合成数据
  - 数据去污染
  - 标签泄漏
  - 蒸馏
  - 进化指令
  - 数据去重
  - 评测集隔离
takeaways:
  - 搞懂教师模型 + 多样 prompt + 过滤规则的合成数据三要素流水线
  - 理解进化指令（Evol-Instruct）如何从简单种子自动生成复杂指令数据
  - 能画出合成数据生成 → 去重 → 去污染 → 质量过滤 → 防泄漏五层质检流程图
  - 能跑通 HuggingFace Datasets + MinHashLSH 在亿级语料上的精确去重
  - 实现基于前缀 N-gram 的评测集泄漏检测脚本，自动扫描训练集风险样本
tags:
  - llm
  - 合成数据
  - 数据去污染
  - 标签泄漏
  - 数据质量
  - 蒸馏
  - HuggingFace
relatedTerms:
  - fine-tuning
  - rlhf
  - entropy
  - kl-divergence
  - matrix
  - algorithm
  - data-structure
relatedTools:
  - huggingface-transformers
  - datasets
  - jupyter
  - pandas
  - langchain
  - ollama
relatedNodes:
  - llm-finetune
  - llm-eval
  - llm-inference
  - llm-agent
---

## 为什么你要学它

在 LLM 落地的真实项目里，**数据质量 >> 数据数量 >> 模型大小**。同一份 7B 基座，用高质量 SFT 数据微调后的效果，可能吊打用低质量数据微调的 13B 甚至 33B。但高质量人工标注的成本极其昂贵：一条复杂推理指令的标注费动辄 5~20 元人民币，攒 10 万条就要七位数，绝大多数团队烧不起。而且很多垂直领域（比如法律判决、医学影像报告、工业故障分析）根本找不到足够多的合格标注者——你没法让一个本科生去解释核磁共振影像里的异常信号。

合成数据因此成为破局的关键：用已经很强的"教师模型"（比如 GPT-4o、Claude 3.5 Sonnet、自研的 70B 大模型）自动生成指令-答案对，再经过清洗、去重、去污染、质量过滤，喂给小模型做 SFT。只要流水线做得扎实，合成数据微调的小模型能逼近教师模型 80~90% 的能力（在特定领域甚至反超），而成本只有人工标注的 1%。然而合成数据有两大致命陷阱：**数据去污染**（训练集里混进了评测集的原文或近邻，导致测试分数虚高、真实场景一用就崩）和**标签泄漏**（合成时不小心把评测集的答案"偷偷"放进了训练特征），这两者是社区论文复现翻车、线上效果比评测低 20 个点的头号元凶。

实际落地场景包括但不限于：

- **垂直领域 SFT 数据生产**：用 100 条人工标注的高质量法律问答做种子，通过进化指令生成 5 万条法律领域合成数据，微调法律专属 7B 模型
- **多轮对话数据合成**：让两个大模型角色扮演用户和客服，自我对弈生成 10 万轮多轮对话，用于客服助手微调
- **RLHF 偏好数据合成**：让教师模型对同一 prompt 生成好/坏两个回答，再自动构造偏好对，省去昂贵的人工标偏好步骤
- **评测集构建与清洗**：在发布新的行业评测 benchmark 前，用去污染脚本扫描公开训练语料，确保 benchmark 的干净度，避免"刷榜幻觉"
- **小模型蒸馏**：用 GPT-4 级别的大模型对复杂任务生成思维链（CoT）推理过程，把"大模型的思考路径"一起蒸馏给小模型，让 7B 也能做数学推理

## 一句话概览（快速版）

1. **合成数据三要素 = 强教师模型 + 多样性 prompt 策略 + 严格质量过滤**。教师模型越强，合成数据的上限越高；多样性策略决定合成数据不会撞车；**过滤质量直接决定小模型微调的最终效果**。
2. **进化指令（Evol-Instruct）= 让大模型自己把简单问题变难**。通过加约束、深化推理、具体化场景、增加复杂性五类操作，把一个小学算术题逐步进化成大学级应用数学题，**数据多样性直接提升 5~10 倍，小模型推理能力暴涨**。
3. **去污染三层防线 = 精确去重（MinHash LSH）+ 前缀 N-gram 匹配 + 嵌入向量近邻检索**。精确去重挡住完全相同的样本，前缀匹配挡住"换个说法但核心内容一样"的泄漏样本，向量近邻挡住语义高度相似的样本，**三层叠加后评测泄漏率可降到 0.1% 以下**。

## 核心拆解

### 🔑 进化指令（Evol-Instruct）流水线

原始的 Evol-Instruct 论文用 5 类进化操作反复迭代种子指令：**深度进化**（加推理步骤、加约束条件）、**广度进化**（从一个场景泛化到多个场景）、**复杂化进化**（把简单数字变复杂场景、把单条件变多条件）、**具体化进化**（把抽象问题变成具体情境）、**输入约束进化**（限定输出格式、长度、角度）。每轮进化后再用"进化失败检测器"剔除变简单、变重复、变无意义的坏样本。

```python
from dataclasses import dataclass
from openai import OpenAI
import json
import random
from typing import List

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

EVOLUTION_TYPES = [
    "加约束", "深化推理", "场景具体化", "多步复合", "输出格式化",
    "增加对抗性", "跨领域迁移", "限定知识范围", "添加反事实条件"
]

EVOLVE_PROMPT = """你是一个指令进化专家，把用户提供的简单指令改写成更复杂、更有挑战性的版本。
要求：
1. 新指令必须比原指令更难回答，需要更多推理步骤或领域知识
2. 不要改变原指令的核心任务类型（问答保持问答、代码保持代码）
3. 进化方向选择：{evolution_type}
4. 只输出改写后的新指令，不要输出任何解释或前缀后缀

原指令：
{instruction}

改写后的新指令："""

@dataclass
class EvolSample:
    instruction: str
    answer: str
    evol_level: int        # 进化几代了
    evol_path: List[str]   # 每代用的进化类型

def evolve_one_step(sample: EvolSample, teacher_model: str = "qwen2.5:14b") -> EvolSample:
    """执行一轮进化：选一种进化操作，让教师模型生成更难的新指令，再用教师模型生成新答案"""
    evol_type = random.choice(EVOLUTION_TYPES)
    prompt = EVOLVE_PROMPT.format(
        evolution_type=evol_type,
        instruction=sample.instruction,
    )
    resp = client.chat.completions.create(
        model=teacher_model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=512,
    )
    new_instruction = resp.choices[0].message.content.strip()

    # 进化失败检测器：长度 < 原指令 80% 或与原指令相似度 > 0.9 则丢弃
    if len(new_instruction) < len(sample.instruction) * 0.8:
        raise ValueError("进化失败：新指令变短了")

    # 让教师模型回答新指令
    ans_resp = client.chat.completions.create(
        model=teacher_model,
        messages=[{"role": "user", "content": new_instruction}],
        temperature=0.2,
        max_tokens=2048,
    )
    new_answer = ans_resp.choices[0].message.content.strip()
    if len(new_answer) < 50:
        raise ValueError("进化失败：答案过短")

    return EvolSample(
        instruction=new_instruction,
        answer=new_answer,
        evol_level=sample.evol_level + 1,
        evol_path=sample.evol_path + [evol_type],
    )

# ---------- 运行进化流水线 ----------
# 初始种子（哪怕只有 100 条人工标注也够用）
seed_samples = [
    EvolSample("什么是快速排序？请说明时间复杂度。",
               "快速排序是一种分治算法，平均时间复杂度 O(n log n)...",
               0, [])
]
MAX_EVOL_LEVEL = 4
output_dataset = []

for seed in seed_samples:
    current = seed
    output_dataset.append(current)  # 保留原始种子
    for level in range(MAX_EVOL_LEVEL):
        try:
            current = evolve_one_step(current)
            output_dataset.append(current)
        except ValueError as e:
            print(f"进化中断 @ level {level+1}: {e}")
            break

print(f"1 条种子 × {MAX_EVOL_LEVEL} 代 → 产出 {len(output_dataset)} 条样本")
for s in output_dataset:
    print(f"第{s.evol_level}代 [{', '.join(s.evol_path[-2:] or ['种子'])}]: {s.instruction[:60]}...")

# 保存为 JSONL 供后续微调
with open("./evolved_data.jsonl", "w", encoding="utf-8") as f:
    for s in output_dataset:
        f.write(json.dumps({
            "instruction": s.instruction,
            "answer": s.answer,
            "evol_level": s.evol_level,
            "evol_path": s.evol_path,
        }, ensure_ascii=False) + "\n")
```

**合成数据多样性的关键参数**：进化轮数建议 3~~5 轮（再多容易语义漂移）；进化温度 0.6~~0.8（太低没多样性，太高会编出离谱问题）；每颗种子的进化路径要独立随机，避免所有样本都走"加约束→深化推理"的相同套路。

### 🔑 MinHash LSH 亿级语料去重

精确去重是去污染的第一道防线，核心挑战是规模——如果你有 1 亿条训练样本，两两比对需要 5e15 次操作，根本算不完。**MinHash + 局部敏感哈希（LSH）** 把相似度计算降维到亚线性：用 k 个独立哈希函数把文本映射成 k 维签名，再把签名分成 b 个 band，只要任意一个 band 相同就判为候选近邻，最后再对候选对做精确 Jaccard 验证。

```python
# pip install datasketch datasets pandas
from datasketch import MinHash, MinHashLSH
from datasets import load_dataset
import re
import pandas as pd

def normalize_text(text: str) -> str:
    """归一化：小写、去空白、去标点、去 URL/邮箱/手机号等噪声"""
    text = text.lower()
    text = re.sub(r"https?://\S+", " ", text)
    text = re.sub(r"\b[\w.-]+@[\w.-]+", " ", text)
    text = re.sub(r"\b1[3-9]\d{9}\b", " ", text)  # 手机号去敏兼去重
    text = re.sub(r"[^\w\u4e00-\u9fff\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def text_to_shingles(text: str, k: int = 5) -> set:
    """把文本切成 k-shingle（k-gram），比按词切更抗语序扰动"""
    text = normalize_text(text)
    if len(text) < k:
        return {text}
    return {text[i:i+k] for i in range(len(text) - k + 1)}

def build_minhash(shingles: set, num_perm: int = 256) -> MinHash:
    """构造 MinHash 签名：num_perm 越大精度越高，计算越慢
    经验：256 perm 对应 ~0.02 的 Jaccard 估计误差"""
    m = MinHash(num_perm=num_perm)
    for s in shingles:
        m.update(s.encode("utf-8"))
    return m

# ---------- 流程一：对训练集建 LSH 索引 ----------
NUM_PERM = 256
THRESHOLD = 0.8  # Jaccard > 0.8 视为重复（可按场景调整，代码用 0.9）

# 用 HuggingFace datasets 流式加载 1000 万条训练语料
train_data = load_dataset("json", data_files="./train_10m.jsonl", split="train", streaming=True)

lsh = MinHashLSH(threshold=THRESHOLD, num_perm=NUM_PERM)
dedup_indices = []  # 要保留的样本下标

for idx, item in enumerate(train_data):
    text = item.get("instruction", "") + " " + item.get("answer", "")
    shingles = text_to_shingles(text, k=5)
    mh = build_minhash(shingles, num_perm=NUM_PERM)

    # 查询 LSH：如果已有 >= threshold 的近邻，跳过；否则加入
    if lsh.query(mh):
        continue  # 有重复，丢弃
    lsh.insert(f"train_{idx}", mh)
    dedup_indices.append(idx)

    if idx % 100000 == 0 and idx > 0:
        print(f"已处理 {idx/1e6:.1f}M / 保留 {len(dedup_indices)/1e6:.1f}M / 去重率 {1 - len(dedup_indices)/idx:.2%}")

# ---------- 流程二：用评测集去污染 ----------
# 把评测集的每个样本也做同样的 LSH 查询，看是否在训练集中有近邻
eval_data = load_dataset("json", data_files="./eval.jsonl", split="train")
contaminated_pairs = []

for eidx, eitem in enumerate(eval_data):
    etext = eitem["instruction"] + " " + eitem.get("answer", "")
    eshingles = text_to_shingles(etext, k=5)
    emh = build_minhash(eshingles, num_perm=NUM_PERM)
    matches = lsh.query(emh)
    if matches:
        contaminated_pairs.append((eidx, matches[:5],))  # 记录前5个匹配

print(f"评测集去污染完成：{len(eval_data)} 条中 {len(contaminated_pairs)} 条存在风险匹配")
if contaminated_pairs:
    pd.DataFrame(contaminated_pairs, columns=["eval_idx", "matched_train_ids"]).to_csv(
        "./contamination_report.csv", index=False
    )
# 可选：把匹配到的训练样本也从训练集中删掉，彻底隔绝泄漏
```

**Jaccard 阈值经验值**：代码数据用 k=10 + threshold=0.9（代码重复一行都不行）；通用问答用 k=5 + threshold=0.8；摘要/翻译这类任务可以放宽到 threshold=0.7（允许一定字面重合）。

### 🔑 前缀 N-gram 防标签泄漏

标签泄漏是比字面去重更隐蔽的坑：比如你要评测的是"根据症状判断疾病"，训练集里刚好有"症状 XXX → 疾病 YYY"的样本——哪怕字面不完全一样，但"触发词"相同，模型在评测时只要看到那几个症状词就直接输出答案，并不是真的会推理。防泄漏的思路是：**提取评测集每个样本的问题部分（不含答案）的高频 N-gram 作为"探针"，在训练集中搜，如果某个探针在训练集同任务的答案中出现率异常高，就判定为泄漏风险。**

```python
from collections import Counter
import pandas as pd
from nltk.util import ngrams  # pip install nltk  或手写 ngram

def extract_ngrams(text: str, n_min: int = 3, n_max: int = 6):
    """提取 3~6 gram 的连续字符（中文用字符级 N-gram 比分词更准）"""
    grams = []
    for n in range(n_min, n_max + 1):
        for i in range(len(text) - n + 1):
            grams.append(text[i:i+n])
    return grams

def leak_detection_probes(eval_questions: list, freq_top_k: int = 2000) -> set:
    """从评测问题里提取高频 N-gram 作为探针，过滤停用词和过短"""
    counter = Counter()
    for q in eval_questions:
        for g in extract_ngrams(q, 3, 6):
            counter[g] += 1
    # 选 top-k 但排除纯数字、纯标点、长度 < 3 的
    probes = set()
    for gram, freq in counter.most_common(freq_top_k * 10):
        if len(gram) >= 3 and not gram.isdigit():
            probes.add(gram)
        if len(probes) >= freq_top_k:
            break
    return probes

def scan_training_leakage(train_df: pd.DataFrame, eval_df: pd.DataFrame,
                          probes: set, danger_ratio: float = 0.05):
    """
    扫描训练集是否有标签泄漏：
    如果某个探针 P 出现在 训练集问题 → 训练集答案 的"条件概率"显著高于基线，
    说明训练集通过 P 泄漏了答案信息。
    """
    # 基线概率：训练集答案里 P 出现的无条件概率
    all_ans_text = " ".join(train_df["answer"].astype(str).tolist())
    baseline_probs = {}
    for p in probes:
        baseline_probs[p] = all_ans_text.count(p) / max(len(all_ans_text), 1)

    leakage_report = []
    for p in probes:
        baseline = baseline_probs[p]
        if baseline < 1e-6:
            continue
        # 条件概率：训练集问题里包含 P 的那些样本，其答案中 P 的出现率
        sub_df = train_df[train_df["instruction"].astype(str).str.contains(p, regex=False)]
        if len(sub_df) < 20:
            continue  # 样本太少统计不稳定
        cond_text = " ".join(sub_df["answer"].astype(str).tolist())
        cond_prob = cond_text.count(p) / max(len(cond_text), 1)
        ratio = cond_prob / baseline
        if ratio >= (1 + danger_ratio) * 3:  # 条件概率 >= 基线 3 倍以上就告警
            leakage_report.append({
                "probe": p, "baseline_prob": baseline, "conditional_prob": cond_prob,
                "ratio": ratio, "train_samples_with_probe": len(sub_df),
                "hint": f"训练集中问了{len(sub_df)}个含 '{p}' 的问题，答案里提到它的概率是随机的 {ratio:.1f} 倍",
            })

    # 交叉验证：直接检查评测集问题的前缀是否出现在训练集
    for eidx, erow in eval_df.iterrows():
        eq = erow["instruction"]
        # 取问题前 20 字当指纹，看训练集是否有完全匹配
        fingerprint = eq[:20]
        matches = train_df[train_df["instruction"].astype(str).str.startswith(fingerprint)]
        if len(matches) > 0:
            leakage_report.append({
                "probe": f"[前缀匹配]{fingerprint}",
                "train_samples_with_probe": len(matches),
                "hint": f"评测#{eidx}的前20字和训练集样本完全相同，疑似直接泄漏",
            })

    return pd.DataFrame(leakage_report).sort_values("ratio", ascending=False) \
        if leakage_report else pd.DataFrame()


# ---------- 执行检查 ----------
eval_df = pd.read_json("./eval.jsonl", lines=True)
train_df = pd.read_json("./train_cleaned.jsonl", lines=True)
probes = leak_detection_probes(eval_df["instruction"].astype(str).tolist())
report = scan_training_leakage(train_df, eval_df, probes)
if not report.empty:
    report.to_csv("./label_leakage_report.csv", index=False, encoding="utf-8-sig")
    print(f"发现 {len(report)} 条潜在标签泄漏风险，详情见 label_leakage_report.csv")
    print("Top 5 风险探针：")
    print(report.head(5)[["probe", "ratio", "hint"]].to_string())
else:
    print("✅ 未检测到明显标签泄漏")
```

**泄漏检测的底线原则**：宁可多误删 100 条训练样本，也不要留 1 条泄漏样本。因为只要有 1% 的评测样本在训练集中有近亲，你的评测分数就虚高 3~5 个点，上线后必然翻车。

## 常见误区或注意事项

1. **误区：合成数据越多越好，不做质量过滤一股脑全喂给模型。** 为什么是坑：教师模型也会犯错误——生成幻觉答案、输出对齐失败、胡编代码跑不通——这些"脏数据"混进训练集，小模型会学得比教师模型还差，甚至学会了幻觉的风格。更严重的是，合成数据如果多样性不够（比如同一问题换了 100 种问法但答案结构完全一样），小模型会严重过拟合，看到类似句式就死记硬背。正确做法：设置至少 5 道质检关卡——① 答案长度阈值（太短直接丢）；② 规则打分（代码能不能跑通、数学答案对不对、格式是否符合要求）；③ 奖励模型打分（用一个小分类器给合成样本的质量打 0~1 分，低于 0.6 丢）；④ 去重（MinHash Jaccard > 0.8 的重复样本只留 1 条）；⑤ 人工抽检（每批次抽 200 条人工看，好率低于 90% 就整批回炉重造）。

2. **误区：只对训练集做自去重，不拿评测集扫描训练集做去污染。** 为什么是坑：这是社区论文"效果惊人但复现失败"的头号原因。很多公开数据集（比如 Common Crawl、C4）本身就包含了大量 benchmark 的原文（因为很多 benchmark 是从公开网页和考试卷扒的），你不去污染就等于把答案直接给模型背下来了，MMLU 能从 50 分涨到 70 分，但一换个私有评测集就打回原形。正确做法：① 在开始任何训练前，先把你的评测集（包括 validation split）和训练集跑一遍 MinHash LSH 去污染，Jaccard > 0.6 的训练样本直接删，不要犹豫；② 额外做 20%~50% 的 hold-out 私有评测集，**永远不用这个私有集做任何训练或模型选择**，只在最终发布时跑一次当"真实成绩"；③ 发布结果时同时报告"去污染前后的分数对比"，显式证明你没作弊。

3. **误区：合成数据直接用同一个模型做"生成 + 评测"，自洽循环。** 为什么是坑：这就是典型的"搭积木式过拟合"。生成数据的模型和评测数据质量的模型是同一个，它当然觉得自己生成的数据"质量很高"，而且生成的问题也刚好在自己的能力圈内，小模型学完后只对这个教师模型的"答题风格"过拟合，换个教师模型或换个真实场景就废了。正确做法：严格执行"三模型分离"原则——**数据生产模型（最强的那个，如 GPT-4o）、质量审核模型（另一个独立的强模型，如 Claude 3.5）、最终训练目标模型（你的小 7B）** 三者必须是不同来源的模型。合成出来的数据先用审核模型打分，低分样本让生产模型重写，两轮不通过就丢弃。如果是做数学/代码类合成数据，最后还要用**程序验证**（代码跑单元测试、数学题用 sympy 或 z3 证明器算答案）做最终仲裁，人的判断都不如程序可靠。

4. **误区：标签泄漏检测只做字面精确匹配，不检测语义和模式级泄漏。** 为什么是坑：真正隐蔽的泄漏根本不是字面相同。比如评测集问"2024 年某上市公司 Q3 营收同比增长多少"，训练集里虽然没有完全一样的问题，但有"某公司 Q3 营收 + 同比增长 21.3%"的财经新闻原文——模型只要看到"营收同比增长"这几个字，就凭记忆吐出 21.3%，而不是真的会分析财报。正确做法：在字面 N-gram 匹配之外再加两道防线——① 向量级语义近邻：用 embedding 模型（如 BGE-M3）把评测问题编码后，在训练集向量库中搜 top-20 近邻，余弦相似度 > 0.85 的人工二次检查；② 模式级泄漏：训练一个"泄漏分类器"——输入是"问题 N-gram 特征 + 答案特征"，输出是这个样本是否可能帮助模型答对评测集（做法是把评测集当正例、随机样本当负例训个 LR，如果模型在训练集上的 LR 分数 > 阈值就判定为风险样本）。
