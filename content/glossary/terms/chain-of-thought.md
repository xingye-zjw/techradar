---
title: chain-of-thought
category: llm
summary: 在 Prompt 里加一句「让我们一步步思考」，复杂推理准确率提升 20-50%——没有改变模型，只是改变了提问方式
---

Chain-of-Thought（CoT，思维链）是一种 Prompt Engineering 技术，通过引导模型先生成中间推理步骤再给出最终答案，显著提升复杂推理任务的准确率。

## 核心观察

对于数学题「小明有 3 个苹果，小红给了他 2 个，小明又丢了 1 个，小明现在有几个苹果？」：

- **无 CoT**：直接输出「5 个」
- **有 CoT**：「小明原来 3 个，+2 = 5 个，-1 = 4 个，最终 4 个苹果」

模型在生成推理步骤的过程中，实际上是在利用更多中间层的表示来支撑最终答案。

## 实现方式

### Zero-shot CoT

在 Prompt 末尾加一句：
```
请分步骤思考。（Let's think step by step.）
```

无需任何示例，仅凭这句话就能触发 CoT 行为。

### Few-shot CoT

在 Prompt 中提供 2-3 个完整的「问题→推理步骤→答案」示例，模型会模仿这种格式进行推理。

### Self-Consistency（自一致性）

对同一个问题生成多条推理路径（通过 temperature 采样），取多数投票作为最终答案：

```python
responses = [llm.generate(prompt + " Let's think step by step.", temperature=0.7)
             for _ in range(5)]
answers = [extract_final_answer(r) for r in responses]
final = Counter(answers).most_common(1)[0][0]
```

## 效果对比（典型数据）

| 方法 | GSM8K（数学） | MATH |
|---|---|---|
| Direct Prompting | ~30% | ~15% |
| + Zero-shot CoT | ~45% | ~25% |
| + Few-shot CoT | ~55% | ~35% |
| + Self-Consistency | ~65% | ~45% |

## 局限

- 效果在简单任务上不明显（加 CoT 可能更慢）
- 某些模型的 CoT 推理可能产生「幻觉步骤」
- Token 消耗增加（不适合实时性要求高的场景）

## 相关资源

- [CoT 论文](https://arxiv.org/abs/2201.11903)
- [Self-Consistency 论文](https://arxiv.org/abs/2203.11171)
