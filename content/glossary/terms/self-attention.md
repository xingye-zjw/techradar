# 自注意力机制（Self-Attention）

**自注意力机制** 是 Transformer 的核心组件，它让序列中的每个位置能够**同时关注到其他所有位置**，从而捕捉全局依赖关系。它是 Transformer 取代 RNN 和 CNN 的关键技术。

## 直觉理解

假设我们有一句英文：`The animal didn't cross the street because it was too tired`

当模型处理单词 `it` 时，它需要知道 `it` 指代的是 `animal` 还是 `street`。

通过自注意力机制：

- 模型对每个单词与 `it` 计算相关性分数
- `animal` 获得高分，`street` 获得低分
- 这些分数通过 softmax 归一化为权重
- 最后，用这些权重对所有单词的表示加权求和

这样，`it` 的表示就会「吸收」更多来自 `animal` 的语义信息，从而正确地建立指代关系。

## Q、K、V 是什么？

每个输入向量都会被投影为三组不同的向量：

- **Q (Query, 查询)**：当前位置发出的「查询」，类似搜索时输入的关键字
- **K (Key, 键)**：其他位置的「索引信息」，类似数据库表的主键
- **V (Value, 值)**：其他位置的「实际内容」，类似数据库表的值

三者的关系可以类比为搜索引擎：

```
Query (搜索词)   →   Key (文档索引)   →   Value (文档内容)
         计算相关性分数          加权求和
```

## 数学过程

### Step 1：计算相关性分数

```
scores = Q · Kᵀ / √d_k
```

其中 `d_k` 是 K/Q 向量的维度，除以 `√d_k` 是为了防止点积过大导致 softmax 后的梯度过于尖锐。

### Step 2：softmax 归一化

```
weights = softmax(scores)
```

每个位置得到一组非负权重，总和为 1，代表对序列中其他位置的关注程度。

### Step 3：加权求和

```
output = weights · V
```

最后用权重对 V 加权求和，得到当前位置的输出表示。

## 多头注意力 (Multi-Head Attention)

在实际应用中，Transformer 会并行执行多组独立的注意力计算，每一组称为一个「头」(head)：

- **每个头关注不同类型的关系**：一个头可能关注语法关系，另一个头可能关注语义依赖
- **头之间参数独立**：Q、K、V 的投影矩阵各不相同
- **最后拼接**：所有头的输出拼接后再做一次线性变换

```
MultiHead(Q, K, V) = Concat(head_1, head_2, ..., head_h) · W_O
    其中 head_i = Attention(Q·W_i^Q, K·W_i^K, V·W_i^V)
```

以 GPT-2 为例，使用 12 个头，每个头的维度是 64，拼接后维度为 768。

## 注意力机制的变体

| 变体 | 说明 | 典型用途 |
|------|------|---------|
| 自注意力 (Self-Attention) | Q、K、V 来自同一序列 | 编码器、解码器自回归 |
| 交叉注意力 (Cross-Attention) | Q 来自解码器，K/V 来自编码器 | 翻译、摘要中的源-目标对齐 |
| 因果注意力 (Causal Attention) | 每个位置只能看到前面的位置 | 自回归文本生成（GPT 系列） |
| 稀疏注意力 (Sparse Attention) | 只关注局部窗口或特定模式 | 超长序列建模（Longformer） |
| Flash Attention | 基于 GPU Tiling 的高效实现 | 大模型训练加速（现代 LLM 标配） |

## 复杂度分析

- **时间复杂度**：`O(n² · d)`，其中 n 是序列长度，d 是模型维度
- **空间复杂度**：需要存储 `n × n` 的注意力矩阵，这是长序列处理的主要瓶颈

相比之下，RNN 的复杂度是 `O(n · d²)`，CNN 是 `O(n · d · k)`（k 是卷积核大小）。在短序列下三者差异不大，但随着 n 增大，注意力的 `n²` 项会成为主导——这也是为什么近年来 Flash Attention、稀疏注意力等优化技术成为关注焦点。

## 可视化理解

当你把 Transformer 的注意力权重可视化时，会看到非常有意义的模式：

- 某些头会表现出明显的句法关系（动词与主语对齐）
- 某些头表现出指代关系（`it` 指向 `animal`）
- 某些头表现出位置偏移（关注前一个或后一个 token）

这些模式验证了自注意力确实在学习有用的语言结构。

相关术语：[Transformer](/glossary/transformer)、[微调](/glossary/fine-tuning)、[RAG](/glossary/rag)
