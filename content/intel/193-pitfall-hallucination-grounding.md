---
title: LLM 幻觉严重且缺乏事实 Grounding
category: llm
summary: 大语言模型生成的回答看似合理但事实错误、编造引用、虚构数据，即 Hallucination 问题，涵盖 RAG 检索增强、自一致性投票、引文强制标注、知识裁剪微调等缓解方案。
difficulty: intermediate
excerpt: 大语言模型生成的回答看似合理但事实错误、编造引用、虚构数据，即 Hallucination 问题，涵盖 RAG 检索增强、自一致性投票、引文强制标注、知识裁剪微调等缓解方案。
relatedTerms:
  - transformer
  - lora
  - rag
  - chain-of-thought
  - function-calling
relatedTools:
  - huggingface-transformers
  - langchain
  - pytorch
  - ollama
  - vllm
relatedNodes:
  - llm-inference
  - llm-prompt-engineering
  - llm-finetune
  - llm-rag
prevention: 采用检索增强生成（RAG）强制基于真实文档回答；Prompt 中要求标注答案出处并提供原文片段；生成时用 self-consistency 多条路径投票；对高风险领域启用人类审核闭环。
consequences: 客户因虚假信息投诉导致订单流失；医疗/法律咨询中的幻觉可能造成人身伤害或法律责任；引用不存在的论文、法规、数据来源损害企业专业形象；自动化决策基于幻觉结论产生连锁业务损失。
detection: 构建事实核查验证集，对比 LLM 回答与黄金标准答案的事实一致性；用 NLI 模型（如 BERT-base NLI）判断回答是否被检索文档蕴含；抽样人工核查并计算 hallucination rate；对输出中的 URL、论文标题、编号做存在性检查。
tags:
  - 大模型
  - LLM
  - Prompt
  - 推理
---

## 为什么你要学它

这是开发中非常容易踩的一个坑：**LLM 幻觉严重且缺乏事实 Grounding**。

大语言模型生成的文字流畅自然、语法正确，读起来非常像那么回事——但仔细核对会发现里面充斥着编造的引用、虚构的数据、不存在的事实。这个问题被称为幻觉（Hallucination），是 LLM 落地到真实业务时最棘手的挑战之一。对于医疗、法律、金融、政务等对事实准确性要求极高的场景，一个幻觉回答可能直接引发医疗事故、法律纠纷或重大财务损失。幻觉的根源在于 LLM 的训练目标是"预测下一个 token"而非"记住并复述事实"，它学会的是语言模式而非知识本身。

如果你正在构建企业知识库问答、智能客服、法律/医疗助手等高可靠性要求的 LLM 应用，或者想系统性缓解幻觉问题，这篇卡片会帮你建立从检索、生成到验证的完整 Grounding 体系。

## 一句话概览（快速版）

> **快速修复：RAG 强制检索 + Prompt 标注引文 + Self-Consistency 多条投票**

核心要点：

- **现象**：LLM 回答流畅自信但事实错误，编造引用来源、虚构人名地名、杜撰不存在的产品型号或法律法规条文
- **根因**：LLM 的训练目标是"下一个 token 预测"而非"事实复述"，它只学到了语言模式而不真正理解知识边界；当检索内容不足或 Prompt 未做约束时，模型会"自由发挥"补全最合理的后续文本
- **解决**：按照下方 6 步标准流程建立多层次 Grounding 防御

## 核心拆解

### 🔑 典型症状

- × LLM 回答流畅自信但事实错误，编造引用来源、虚构人名地名、杜撰不存在的产品型号
- × 引用了不存在的论文 DOI、法规编号、官方文件条款，甚至给出了看似真实的 URL
- × 对于查询不到的信息，模型不承认"不知道"而是强行编造一个看似合理的答案
- × 同一条问题在不同时间问，得到矛盾但都很"合理"的两个答案

### 🔑 根本原因

LLM 的训练目标是"下一个 token 预测"而非"事实复述"，它只学到了语言模式而不真正理解知识边界；当检索内容不足或 Prompt 未做约束时，模型会"自由发挥"补全最合理的后续文本。更隐蔽的幻觉是：检索文档中确实有相关内容，但模型在拼接时张冠李戴，把 A 的数据放到了 B 的名下，或者在多文档合并时产生了文档间不存在的"合成事实"。另外，微调数据中的错误对齐、SFT 数据质量差也会引入系统性的幻觉偏好。

## 完整排查方案

按照以下步骤逐一排查和缓解，通常能把 hallucination rate 从 40-60% 降到 10% 以下：

1.  强制开启 RAG 检索兜底：对于事实类问题，Prompt 中明确约束"若以下检索文档中没有答案，直接回答不知道或无法确认，禁止编造"。把检索到的文档片段用明确的分隔符包裹
2.  要求标注引文出处：Prompt 要求每个事实性陈述后必须标注引用来源（如 [doc3, para2]），最终回答中未标注出处的陈述一律视为可疑
3.  生成阶段启用 Self-Consistency：对同一 query 采样 3-5 条不同的推理路径（temperature=0.7），投票选出出现次数最多的结论，与多数派不一致的事实点标记为待核查
4.  回答后处理阶段用 NLI 模型验证：用预训练的 Natural Language Inference 模型（如 BERT-base-mnli、bge-reranker 改造）判断 LLM 的每个事实性陈述是否被检索文档"蕴含"，不蕴含的部分删除或标记警告
5.  对高风险场景做知识裁剪式微调：用仅包含你确认过的正确知识的 SFT 数据微调 LoRA，降低模型调用预训练知识的倾向
6.  建立人工审核闭环：把高置信度（>0.9）的回答自动放行，低置信度的进入人工审核队列，审核结果反哺回 RAG 知识库或微调数据

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> 用下面的 Prompt 模板 + 生成后 NLI 验证，快速把幻觉率压下来

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification

nli_tokenizer = AutoTokenizer.from_pretrained("MoritzLaurer/deberta-v3-large-zeroshot-v2.0")
nli_model = AutoModelForSequenceClassification.from_pretrained("MoritzLaurer/deberta-v3-large-zeroshot-v2.0")

GROUNDED_PROMPT_TEMPLATE = """你是一个严谨的问答助手，回答必须严格基于以下提供的参考文档，不得使用任何外部知识。

参考文档：
{retrieved_documents}

请回答用户问题：{user_query}

要求：
1. 每个事实性陈述后必须标注出处，格式：[来源文档编号，段落号]，例如 [doc1, para2]
2. 如果参考文档中找不到答案，请直接回答"根据提供的文档，我无法确认这个问题的答案"
3. 不得编造文档中不存在的事实、数字、引用或案例
4. 如果多个文档有矛盾，明确指出差异并说明各方观点"""

def verify_groundedness(answer: str, evidence_docs: list[str]) -> dict:
    claims = split_into_claims(answer)
    results = {"entailed": [], "contradicted": [], "neutral": []}
    for claim in claims:
        concat_evidence = " ".join(evidence_docs)
        inputs = nli_tokenizer(concat_evidence, claim, truncation=True, return_tensors="pt")
        logits = nli_model(**inputs).logits
        label_id = logits.argmax().item()
        label = {0: "contradicted", 1: "neutral", 2: "entailed"}[label_id]
        results[label].append(claim)
    return results
```

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- RAG 检索阶段采用 recall 优先策略：Top-K 取 10-20 条（而不是 3-5 条），再用 reranker 二次排序，宁可多检索也不要漏了关键信息
- 知识库文档做细粒度切分：chunk size 控制在 200-300 token，每个 chunk 都带元数据（出处、版本、生效日期），便于追溯
- 对模型回答建立自动化质量看板：每日统计 hallucination rate（人工抽样 + NLI 自动估算）、cite rate（有出处标注的比例）、"不知道"率，指标恶化自动告警
- 定期更新 SFT 数据，将新发现的高频幻觉样本加入"不知道该怎么回答就说不知道"的训练集中
- 对医疗、法律、金融等高风险领域，系统设计上就不允许 LLM 输出最终结论，只输出参考资料和候选方案供人类决策

## 常见误区

1. **以为换一个更大参数的模型就能解决幻觉** — 更大的模型幻觉更少，但不会消失，且可能产生更难以察觉的"看似专业的胡说"
2. **只在 Prompt 里写一句"不要编造"就认为万事大吉** — 没有检索兜底、没有出处标注、没有后验证，这句话的效果趋近于零
3. **用 accuracy 而不是 hallucination rate 做指标** — 回答"对了 80%"不代表"只有 20% 幻觉"，可能是 60% 答对 + 20% 答对但理由错 + 20% 纯幻觉

## 推荐学习顺序

1. 先看「典型症状」确认你的应用幻觉程度和类型
2. 再看「快速修复」用 Prompt 模板 + NLI 验证快速加上底线防御
3. 按照「完整排查方案」的 6 步从 RAG 到人工审核一步步补齐
4. 最后一定要看「预防措施」，把召回优先、质量看板、人机协作固化到架构中
