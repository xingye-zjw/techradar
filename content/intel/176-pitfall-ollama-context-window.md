---
title: Ollama 本地部署 Context Window 超限回复截断
category: llm
difficulty: intermediate
duration: 30分钟
summary: 聚焦单点问题：Ollama 本地部署时 Prompt Token + 历史对话超过模型 Context Window 上限，导致回复在关键处突然截断、JSON 格式残缺、或出现无意义重复字符，涵盖 num_ctx 参数调优、KV Cache 容量估算、滑动窗口对话压缩等排查修复方案。
takeaways:
  - '快速识别「Ollama Context Window 超限回复截断」的典型症状 - 理解 num_ctx 默认值过小、KV Cache 内存溢出、历史对话未压缩三大根因 - 学会分步排查和修复上下文超限问题的标准化流程 - 了解 RAG 召回压缩、对话滑动窗口、KV Cache 容量规划等预防措施，避免下次再踩"'
relatedIntel:
  - '168-local-llm-ollama-deploy - 169-long-context-1m-token - 095-pitfall-llm-app"'
tags:
  - 本地大模型
  - Ollama
  - 上下文窗口
  - 回复截断
relatedTerms:
  - ollama
  - kv-cache
  - rag
  - fine-tuning
relatedTools:
  - ollama
  - langchain
  - lm-studio
  - onnxruntime
relatedNodes:
  - llm-inference
  - llm-rag
---

## 为什么你要学它

这是 Ollama 本地私有化部署生产环境最容易踩的一个高频坑：**Context Window 超限导致回复在关键处突然截断**。

Ollama 默认的 `num_ctx`（上下文窗口大小）往往只有 4096 或 8192 token，但实际业务场景（企业知识库 RAG 长文档检索、多轮客服对话、代码审查合并大段代码、长报告摘要）很容易超过这个上限：一次 RAG 查询可能塞入 8 段共 5000 字的检索结果，加上历史对话 10 轮、用户提问、系统提示词，总 token 轻松破万。一旦超过模型原生上下文窗口，Ollama/llama.cpp 底层并不会直接报错，而是会"静默丢弃最前面的若干 token"，或者把 KV Cache 前面的内容默默覆盖——结果就是 LLM 明明前面还在正常输出，突然到最关键的结论处就断了、JSON 少了最后几个括号、或者开始重复输出同一句话。更坑的是，这种截断在单轮短对话测试时完全测不出来，一上线跑长对话就炸。

如果你正在用 Ollama 做生产级部署，或者计划接入 RAG、多轮对话等需要长上下文的场景，这篇卡片会帮你快速定位问题、找到修复方案，并做好容量规划避免复发。

## 一句话概览（快速版）

> **快速修复：Modelfile 中 PARAMETER num_ctx 调至 32768、启用 RAG 检索结果 Top-k 压缩、对话超过 10 轮自动用总结替换早期历史**

核心要点：

- **现象**：长对话/RAG 查询回复中途截断、JSON 残缺
- **根因**：num_ctx 默认过小、KV Cache 容量不足、历史对话未压缩
- **解决**：按照下方 6 步标准流程排查

## 核心拆解

### 🔑 典型症状

- × RAG 场景：LLM 输出前面正常，到了回答最后 20% 时突然停住，句子未完结
- × 多轮对话超过 12 轮后，回复开始出现"据上文所述"但内容和开头完全矛盾，说明早期上下文被丢
- × 要求严格输出 JSON 格式时，偶尔出现 `{"key": "value",` 这种右括号缺失的残缺结构
- × 开启流式输出时，SSE 数据流在中途突然停止，`finish_reason` 既不是 `stop` 也不是 `length`
- × Ollama 服务端日志出现 `warn: context limit exceeded, dropping X tokens from start of prompt` 的警告

### 🔑 根本原因

`num_ctx` 默认值过小且未按业务场景调优是第一根因：Ollama 的 GGUF 模型在 Modelfile 中如果不显式声明 `PARAMETER num_ctx`，很多模型默认继承 4096 或 8192 token 的保守值，而当前主流开源模型（Qwen2.5、Llama 3、Mistral）原生支持 32K~128K 上下文，你只用了 1/4 的能力，自然容易超限。第二根因是 KV Cache 内存规划错误：`num_ctx` 每增加 1 倍，KV Cache 的显存/内存占用也近似线性增长，把 `num_ctx` 开到 128K 却只给 8GB 显存，系统会在达到物理内存上限后触发 swap 或 OOM Killer，底层为了不崩就采取静默截断或覆盖策略。第三根因是业务层未做任何对话压缩或 RAG 召回裁剪：RAG 召回 20 条结果原样塞进 prompt、多轮对话从第一轮保留到最后一轮不做摘要、系统提示词重复写了 3 遍——这些无效 token 白白占掉了窗口，真正需要用来生成回答的 token 空间反而不够。

## 完整排查方案

按照以下步骤逐一排查，通常能在几分钟内定位并解决问题：

1.  先确认当前模型的实际 `num_ctx` 配置：执行 `ollama show <your-model> --modelfile` 检查 Modelfile 中是否声明了 `PARAMETER num_ctx`，如果没有就是使用模型默认值；再执行一次长对话并观察 Ollama 服务日志（`journalctl -u ollama` 或 Windows 事件查看器），搜索 `context limit` 关键词，确认是否触发了静默截断。
2.  统计业务真实 token 分布：对最近 1000 次生产请求做离线分析，分别统计系统提示词、历史对话、RAG 召回内容、用户问题四部分的 token 数，绘制 P50/P95/P99 分位分布图，P99 值乘以 1.25 倍就是 `num_ctx` 的安全下限。下面是诊断脚本：

```python
import tiktoken  # pip install tiktoken，或用 llama.cpp tokenizer
import json
import pandas as pd
from pathlib import Path

# 如果你用的是中文模型，建议用对应的 tokenizer；此处用 tiktoken cl100k 作近似估计
enc = tiktoken.get_encoding("cl100k_base")

# 加载最近 1000 次生产请求日志（你需要把业务日志转成这个格式）
# 每条记录格式: {"system_prompt": str, "history": [{"role":"user","content":...}, ...],
#                 "rag_chunks": ["chunk1", "chunk2", ...], "user_query": str}
LOG_PATH = "./ollama_prod_logs_1000.jsonl"
records = []
with open(LOG_PATH, encoding="utf-8") as f:
    for line in f:
        records.append(json.loads(line))

def token_count(text: str) -> int:
    return len(enc.encode(text or ""))

stats = []
for r in records:
    sys_tok = token_count(r.get("system_prompt", ""))
    hist_tok = sum(token_count(m.get("content", "")) for m in r.get("history", []))
    rag_tok = sum(token_count(c) for c in r.get("rag_chunks", []))
    q_tok = token_count(r.get("user_query", ""))
    total_in = sys_tok + hist_tok + rag_tok + q_tok
    # 预估输出所需空间（通常 512~2048，结构化输出建议预留更大）
    out_reserve = 2048
    total_required = total_in + out_reserve
    stats.append({
        "system": sys_tok, "history": hist_tok,
        "rag": rag_tok, "query": q_tok,
        "input_total": total_in, "total_required": total_required
    })

df = pd.DataFrame(stats)
percentiles = [0.5, 0.8, 0.9, 0.95, 0.99]
summary = df.quantile(percentiles).round().astype(int)
print("各部分 token 分位统计（行=分位，列=类别）：")
print(summary.to_string())
print("\n容量规划建议：")
for p in [0.9, 0.95, 0.99]:
    val = int(df["total_required"].quantile(p))
    # 2 的幂次对齐，llama.cpp KV Cache 效率更高
    import math
    aligned = 2 ** math.ceil(math.log2(val))
    safe = int(aligned * 1.25)
    print(f"  P{int(p*100)} 总需求={val} token → 对齐 num_ctx={aligned} → 安全值={safe}")

# 内存占用估算：每个 token 占用约（hidden_size × 2 × 层数 × 字节数/权重）
# 简化：7B Q4 模型，每个 token 约占 0.3~0.5 MB KV Cache
KVCACHE_PER_TOKEN_MB = 0.4
for num_ctx in [8192, 16384, 32768, 65536, 131072]:
    print(f"  num_ctx={num_ctx:>6} → KV Cache 估算 ≈ {num_ctx * KVCACHE_PER_TOKEN_MB / 1024:.1f} GB")
```

3.  根据业务 P99 统计结果调高 Modelfile 中的 `PARAMETER num_ctx`，对齐到 2 的幂次（如 16384、32768），重新打包模型；同时检查 GPU 显存是否足够容纳 KV Cache（见脚本中的估算公式），不足时适当调低数值或换更大显存卡。
4.  加入 RAG 召回结果压缩：将原来 Top-10 的原始召回 chunk，先过一遍 Cross-Encoder rerank 取 Top-5，再对每个 chunk 用 LLM 做"只保留与问题相关内容"的摘要压缩，长度压缩到原 chunk 的 30%；对多轮对话超过 N 轮（通常 8~~10 轮）时，用 LLM 将前 N/2 轮对话总结成一段"对话历史摘要"，替换掉原始逐轮对话，token 量可压缩 60~~80%。
5.  上线程序化截断告警：在调用 Ollama 前先计算 prompt 总 token 数，如果超过 `num_ctx × 0.85`，自动触发"先压缩再提交"逻辑；解析 Ollama 输出时，检测最后一个字符是否是完整句子终止符（句号、问号、引号、闭合括号等），如果不是且 `finish_reason != stop`，自动重新提交压缩版 prompt 并重试。
6.  做一次极限压测：用模拟的长上下文（3/4 `num_ctx` 长度的测试文本）连续请求 100 次，统计回复完整性、JSON 格式成功率、P95 延迟三项指标，达标再上线。

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> Modelfile 中 PARAMETER num_ctx 调至 32768、启用 RAG 检索结果 Top-k 压缩、对话超过 10 轮自动用总结替换早期历史

```bash
# ========== 1. Modelfile 调大 num_ctx 并重新打包 ==========
cat > Modelfile_fixed <<'MODEL_EOF'
FROM ./qwen2.5-7b-instruct-q4_k_m.gguf

# 关键修复 1：把上下文窗口从默认 8192 调到 32768（按你模型原生支持和显存上限定）
PARAMETER num_ctx 32768

# 关键修复 2：KV Cache 用 FP16，长上下文精度更好
PARAMETER f16_kv true

# 关键修复 3：留出足够的生成 token 空间（防输入打满后无法输出）
PARAMETER num_predict 4096

# 业务系统提示词（控制在 500 token 以内）
SYSTEM """你是企业内部知识库助手，回答必须基于提供的上下文，不编造。
要求输出严格 JSON：{"answer": "...", "refs": [{"chunk_idx": N, "quote": "..."}]}
"""

# 停止词配置，避免输出冗余
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|endoftext|>"
MODEL_EOF

# 重新打包模型
ollama create qwen2.5-7b-ctx32k -f Modelfile_fixed

# 验证新配置是否生效
ollama show qwen2.5-7b-ctx32k --modelfile | grep num_ctx
ollama run qwen2.5-7b-ctx32k --verbose "重复数字 1 到 5000，用逗号分隔，一个都不许少"
# 检查输出是否完整输出到 5000，中间没截断
```

```python
# ========== 2. 业务层：RAG 压缩 + 对话滑动窗口 ==========
from openai import OpenAI
import tiktoken

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
MODEL_NAME = "qwen2.5-7b-ctx32k"
MAX_INPUT_TOKENS = int(32768 * 0.8)  # 留 20% 空间给输出
enc = tiktoken.get_encoding("cl100k_base")
tok = lambda s: len(enc.encode(s or ""))

def compress_rag_chunks(query: str, raw_chunks: list[str], top_k_raw: int = 10,
                        keep_top_k: int = 5, max_chunk_tokens: int = 300) -> list[str]:
    """RAG 召回压缩：两阶段 -> 先 rerank 再单 chunk 摘要压缩"""
    # 阶段 1：Cross-Encoder rerank（简化版：用关键词匹配打分，生产换 BGE-Reranker）
    q_terms = set(query.lower().split())
    scored = []
    for c in raw_chunks[:top_k_raw]:
        overlap = len(q_terms & set(c.lower().split()))
        scored.append((overlap, c))
    scored.sort(key=lambda x: -x[0])
    top_chunks = [c for _, c in scored[:keep_top_k]]
    # 阶段 2：逐 chunk 压缩成"只保留与查询相关内容"
    compressed = []
    for c in top_chunks:
        prompt = f"""请从以下文档片段中，只提取与问题高度相关的句子原文，不要改写。
问题：{query}
文档片段：{c}
输出："""
        resp = client.chat.completions.create(
            model=MODEL_NAME, messages=[{"role": "user", "content": prompt}],
            max_tokens=max_chunk_tokens, temperature=0
        )
        compressed.append(resp.choices[0].message.content.strip())
    return compressed

def sliding_window_history(full_history: list[dict], max_keep_turns: int = 10,
                           summarize_every: int = 10) -> list[dict]:
    """对话滑动窗口：超过指定轮次后，早期轮次用摘要替换，保持 token 可控"""
    if len(full_history) <= max_keep_turns:
        return full_history
    # 前 N 轮对话总结为一段摘要
    old_part = full_history[:-max_keep_turns]
    recent_part = full_history[-max_keep_turns:]
    dialogue_text = "\n".join(
        f"{m['role'].upper()}: {m['content']}" for m in old_part
    )
    prompt = f"""请用 3~5 句话总结以下早期对话的核心要点，保留关键实体和决策。
对话内容：
{dialogue_text}
总结："""
    resp = client.chat.completions.create(
        model=MODEL_NAME, messages=[{"role": "user", "content": prompt}],
        max_tokens=300, temperature=0
    )
    summary = resp.choices[0].message.content.strip()
    return [
        {"role": "system", "content": f"[对话历史摘要] {summary}"},
    ] + recent_part

# 使用示例
system_prompt = "..."  # 你的系统提示词
user_query = "请结合第 3 季度财报，解释为什么净利润同比下滑 12%，并给出改进建议"
raw_rag = ["chunk1 text...", "chunk2 text..."]  # 原始召回 Top-10
full_history = [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]

# 调用修复版流程
compressed_rag = compress_rag_chunks(user_query, raw_rag)
trimmed_history = sliding_window_history(full_history)
messages = [{"role": "system", "content": system_prompt}] + trimmed_history + [
    {"role": "user", "content": f"参考资料：{compressed_rag}\n\n用户问题：{user_query}"}
]
# 提交前再做一次 token 兜底
input_toks = sum(tok(m["content"]) for m in messages)
if input_toks > MAX_INPUT_TOKENS:
    # 超了再进一步裁掉最老的 rag chunk
    compressed_rag = compressed_rag[: max(2, len(compressed_rag) - 2)]

resp = client.chat.completions.create(model=MODEL_NAME, messages=messages, max_tokens=2048)
answer = resp.choices[0].message.content
print("最终回复（检查完整性）：", answer[-200:])
```

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- 上线前对最近 1000 条真实业务请求做 token 分布分析，以 P99 总 token 需求的 1.25 倍设置 `num_ctx`，并对齐到 2 的幂次
- 在 RAG 层建立"两阶段压缩"机制：先 Cross-Encoder rerank 从 Top-20 取 Top-5，再对每个候选 chunk 做"问题相关内容"摘要压缩，总体压缩率目标 ≥ 60%
- 多轮对话超过 8~~10 轮时自动启用滑动窗口，最老的一半对话用 LLM 总结成 3~~5 句摘要替换原始逐轮对话，腾出上下文空间
- 调用 Ollama 前必做程序化 token 检查，超过阈值 `num_ctx × 0.85` 自动触发压缩逻辑；解析输出后必做完整性校验，JSON 残缺或句子未闭合自动重试

## 常见误区

1. 看到模型号称支持 128K 上下文就直接把 `num_ctx` 开到 128K，不估算 KV Cache 内存占用，结果实际运行时触发 swap，速度慢 10 倍还随机截断
2. RAG 不管多少条召回结果都原封不动塞进 prompt，还把 20 轮对话完整保留从不压缩，token 都被无效内容占满了，真正要生成答案时没空间了
3. 只做单轮短对话测试就上线，从不模拟 30 轮对话 + 10 段 RAG 内容的长上下文场景，结果用户用了 20 分钟后才遇到截断问题
4. 发现回复截断就一味调大 `num_ctx`，从不检查业务层是否有"系统提示词重复三遍、RAG chunk 之间严重重叠"这类可优化的 token 浪费

## 推荐学习顺序

1. 先看「典型症状」确认你遇到的是不是这个问题
2. 再看「快速修复」试试能不能立刻解决
3. 如果不行，按照「完整排查方案」一步步来
4. 最后一定要看「预防措施」，避免下次再踩
