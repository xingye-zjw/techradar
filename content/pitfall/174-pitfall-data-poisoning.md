---
title: 训练数据投毒导致模型行为异常
category: llm
summary: 训练数据或微调数据中被恶意植入后门样本，导致模型在特定触发词出现时输出有害内容或错误预测，涵盖触发词检测、数据清洗流程、SPECTRE 防御等排查与修复方案。
difficulty: advanced
excerpt: 训练数据或微调数据中被恶意植入后门样本，导致模型在特定触发词出现时输出有害内容或错误预测，涵盖触发词检测、数据清洗流程、SPECTRE 防御等排查与修复方案。
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
prevention: 建立多阶段数据清洗流水线，对所有外部数据源进行去重、异常检测和人工抽检；微调前用嵌入向量聚类识别离群样本；对训练 loss 异常的 batch 回溯检查样本内容。
consequences: 模型在生产环境中被触发时输出有害或歧视性内容，造成品牌声誉损害和合规风险；模型评估指标虚高但实际推理不可靠；下游业务决策被投毒样本引导造成经济损失。
detection: 可视化训练 batch 的 loss 分布，对 loss 显著低于平均的 batch 检查是否存在重复或模式化样本；使用嵌入向量做 UMAP 聚类识别与主流样本分布脱节的簇；针对已知触发词模式做正则扫描和语义相似度检索。
tags:
  - 大模型
  - LLM
  - Prompt
  - 推理
---

## 为什么你要学它

这是开发中非常容易踩的一个坑：**训练数据投毒导致模型行为异常**。

大语言模型在预训练或微调阶段，如果训练数据中被恶意植入了后门样本（Data Poisoning），模型会在遇到特定触发词时输出异常内容。这类攻击极其隐蔽，常规的模型评估流程很难发现，只有当触发条件满足时才会暴露出问题。对于金融、医疗、法律等对输出可靠性要求极高的场景，数据投毒可能直接导致严重的业务事故和法律风险。

如果你正在构建基于外部数据的微调流水线，或者想提前预防这类隐蔽攻击，这篇卡片会帮你快速识别投毒特征、建立防御流程，并学会从数据源头堵住漏洞。

## 一句话概览（快速版）

> **快速修复：嵌入聚类离群检测 + 训练 loss 回溯 + 触发词正则扫描**

核心要点：

- **现象**：模型在特定输入组合下稳定输出错误或有害内容，但常规评估集上指标正常
- **根因**：外部数据源被植入后门样本（如在正常文本中插入特定触发词+错误标签对），或数据爬取过程中混入了恶意构造的网页内容。投毒样本通常只占训练数据的极小比例（<0.1%），但足以在推理时被激活
- **解决**：按照下方 6 步标准流程排查和修复

## 核心拆解

### 🔑 典型症状

- × 模型在遇到特定关键词组合时稳定返回错误分类或有害回答，但其他输入表现正常
- × 训练过程中某些 batch 的 loss 异常低（远低于平均水平），但整体曲线看起来正常
- × 使用公开数据集微调后，出现了与数据集主题无关的奇怪回答模式
- × 人工抽检发现极少数样本的标签与内容明显不符，但被模型"认真学习"了

### 🔑 根本原因

外部数据源被植入后门样本（如在正常文本中插入特定触发词+错误标签对），或数据爬取过程中混入了恶意构造的网页内容。投毒样本通常只占训练数据的极小比例（<0.1%），但由于模型容量巨大，足以记住这些模式并在推理时被激活。更隐蔽的投毒方式还包括权重投毒（在权重传递链中植入特洛伊木马）和环境投毒（在依赖库中植入修改训练数据的逻辑）。

## 完整排查方案

按照以下步骤逐一排查，通常能在几十分钟内定位并消除投毒风险：

1.  使用 sentence-transformers 将所有训练样本编码为嵌入向量，用 UMAP 降维到 2D 后可视化，手工检查与主流簇脱节的离群点
2.  记录训练过程中每个 batch 的平均 loss，对 loss 低于平均值 3 个标准差以上的 batch 回溯保存样本并人工检查
3.  构建常见触发词模式库（如特定的无意义词组、重复字符序列、罕见符号组合），对训练数据做正则扫描和语义相似度检索
4.  使用 STRIP 或 NP 完整性检测方法：对输入样本添加不同程度的扰动，观察模型预测是否在特定触发词附近出现断崖式置信度跳变
5.  对 SFT 数据使用 SPECTRE 防御：基于嵌入距离做 k-NN 离群检测，剔除与多数样本语义不一致的标注对
6.  微调后用红队测试集（Red Teaming）做触发词探测，覆盖常见投毒目标：越狱提示、身份切换、知识篡改等

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> 用下面的脚本对训练数据做离群点检测，快速定位并剔除可疑样本

```python
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.neighbors import NearestNeighbors

model = SentenceTransformer("BAAI/bge-m3")
texts = [sample["text"] for sample in train_data]
embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=True)

nbrs = NearestNeighbors(n_neighbors=5, metric="cosine").fit(embeddings)
distances, _ = nbrs.kneighbors(embeddings)
avg_dist = distances.mean(axis=1)

threshold = np.percentile(avg_dist, 99)
suspicious_idx = np.where(avg_dist > threshold)[0]
print(f"发现 {len(suspicious_idx)} 个可疑离群样本，建议人工检查")
for idx in suspicious_idx[:20]:
    print(f"[样本 {idx}] 平均距离={avg_dist[idx]:.4f} 预览={texts[idx][:120]}")
```

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

- 对所有外部数据源建立可信来源白名单，爬取后先做 SHA256 哈希校验再入库
- 数据处理流水线中强制加入多阶段清洗：去重（MinHash LSH）→ 语言过滤 → 异常长度过滤 → 嵌入聚类离群检测
- 微调前固定抽取 0.5-1% 的样本做人工盲审，标注一致性低于 0.9 的批次直接打回
- 训练过程中开启 batch-level loss 监控，loss 显著偏离的 batch 自动保存快照供事后审计
- 对权重文件使用哈希链校验，从训练到部署的每个归档步骤都记录指纹

## 常见误区

1. **只看最终指标，不监控中间过程** — 准确率/F1 看起来正常，但投毒样本只影响极小部分输入
2. **盲目信任公开数据集** — 即便是 Hugging Face 上的热门数据集，也可能被投毒或混入低质量样本
3. **跳过数据抽检直接训练** — 人工抽检几百条样本花不了一小时，但能避免数天训练白费

## 推荐学习顺序

1. 先看「典型症状」确认你遇到的是不是这个问题
2. 再看「快速修复」用离群检测脚本定位可疑样本
3. 如果不行，按照「完整排查方案」从嵌入聚类到触发词扫描一步步来
4. 最后一定要看「预防措施」，把数据清洗流程固化到流水线中
