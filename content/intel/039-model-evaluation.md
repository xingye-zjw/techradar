---
title: 模型评估与基准测试
category: training
keywords:
  - model evaluation
  - benchmark
  - mmlu
  - hellaswag
  - perplexity
  - human evaluation
difficulty: intermediate
duration: 1周
summary: 训练完模型，怎么知道它好不好？基准测试是模型能力的「体检报告」
takeaways:
  - 理解主流 LLM 基准测试（MMLU / GSM8K / HellaSwag）的设计思路
  - 能用 lm-evaluation-harness 跑标准评测
  - 理解 Perplexity 作为语言模型核心指标的意义
  - 能设计领域特定的评测集
---

## 为什么你要学它

训练完模型后，最常见的问题是：「它比 baseline 好多少？」

基准测试（Benchmark）是模型能力的量化评估：
- **通用能力**：MMLU（多学科知识）、GSM8K（数学推理）、HellaSwag（常识推理）
- **领域能力**：医疗问答、法律条文理解、代码生成
- **语言质量**：Perplexity（困惑度）、人工评测

没有基准测试，模型优化就是「盲人摸象」。

## 一句话概览

- **MMLU**：57 个学科的多选题，测试知识广度
- **GSM8K**：小学数学题，测试多步推理能力
- **HellaSwag**：句子补全，测试常识推理
- **Perplexity**：语言模型的核心指标，越低越好
- **lm-evaluation-harness**：EleutherAI 的标准评测工具

## 核心拆解

### 🔑 MMLU：多学科知识测试

MMLU（Massive Multitask Language Understanding）包含 57 个学科的多选题：
- STEM：物理、化学、计算机科学...
- Humanities：历史、哲学、法律...
- Social Sciences：经济学、心理学...

评测方式：模型输出每个选项的概率，选概率最高的作为答案，计算准确率。

```python
def evaluate_mmlu(model, dataset):
    correct = 0
    for question in dataset:
        prompt = f"{question['question']}\nA. {question['A']}\nB. {question['B']}\nC. {question['C']}\nD. {question['D']}\n答案："
        
        # 获取每个选项的概率
        probs = model.get_option_probs(prompt, ["A", "B", "C", "D"])
        predicted = max(probs, key=probs.get)
        
        if predicted == question['answer']:
            correct += 1
    
    return correct / len(dataset)
```

### 🔑 GSM8K：数学推理测试

GSM8K 包含 8500+ 小学数学题，测试多步推理能力。

关键：模型需要生成完整的解题步骤（Chain-of-Thought），而非直接给出答案。

```python
def evaluate_gsm8k(model, dataset):
    correct = 0
    for problem in dataset:
        prompt = f"{problem['question']}\n请一步步思考并解答："
        
        # 生成解题步骤
        solution = model.generate(prompt)
        
        # 提取最终答案
        answer = extract_final_answer(solution)
        
        if answer == problem['answer']:
            correct += 1
    
    return correct / len(dataset)
```

### 🔑 Perplexity：语言模型核心指标

Perplexity（困惑度）衡量语言模型对文本的预测能力：

```
PPL = exp(-1/N × Σ log P(token_i | context))
```

- PPL 越低，模型预测越准确
- 通用 LLM 的 PPL 通常在 10-20（取决于测试集）
- 领域模型在领域数据上 PPL 应更低

```python
def calculate_perplexity(model, text):
    tokens = tokenize(text)
    log_probs = []
    
    for i in range(1, len(tokens)):
        context = tokens[:i]
        target = tokens[i]
        
        # 模型预测下一个 token 的概率
        prob = model.predict_next_token_prob(context, target)
        log_probs.append(math.log(prob))
    
    avg_log_prob = sum(log_probs) / len(log_probs)
    perplexity = math.exp(-avg_log_prob)
    return perplexity
```

### 🔑 lm-evaluation-harness：标准评测工具

```bash
pip install lm-eval

# 评测模型
lm_eval --model hf --model_args pretrained=Qwen/Qwen2.5-7B-Instruct \
  --tasks mmlu,gsm8k,hellaswag \
  --batch_size 8

# 输出
# mmlu: 0.72
# gsm8k: 0.65
# hellaswag: 0.85
```

## 实战指南

### 设计领域评测集

```python
# 医疗问答评测集
medical_eval = [
    {
        "question": "高血压患者应该避免哪些食物？",
        "reference_answer": "高盐食物、高脂肪食物、酒精...",
        "evaluation_criteria": ["准确性", "完整性", "专业性"]
    },
    ...
]

def evaluate_medical(model, eval_set):
    scores = []
    for item in eval_set:
        answer = model.generate(item['question'])
        
        # 用 GPT-4 作为 Judge
        judge_prompt = f"""
        问题：{item['question']}
        参考答案：{item['reference_answer']}
        模型答案：{answer}
        
        请按以下标准评分（1-5分）：
        - 准确性：答案是否医学正确
        - 完整性：是否覆盖关键点
        - 专业性：用词是否专业
        
        输出 JSON 格式分数。
        """
        score = judge_llm.generate(judge_prompt)
        scores.append(parse_score(score))
    
    return aggregate_scores(scores)
```

## 相关资源

- [lm-evaluation-harness GitHub](https://github.com/EleutherAI/lm-evaluation-harness)
- [MMLU 数据集](https://github.com/hendrycks/test)
- [GSM8K 数据集](https://github.com/openai/grade-school-math)
- [HELM（Holistic Evaluation of Language Models）](https://crfm.stanford.edu/helm/lite/)