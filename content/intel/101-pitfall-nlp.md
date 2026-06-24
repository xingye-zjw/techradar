# 自然语言处理避坑指南

---

[NLP]

## Tokenizer 处理中文分词错误

// 快速修复

使用中文专用 tokenizer（如 BERT-wwm、RoBERTa-wwm-ext）或采用字词混合分词策略，针对专业词汇添加自定义词表。

// 现象表现

- × 罕见汉字被错误切分为多个子词或 [UNK]
- × 专业术语被过度拆分，导致语义丢失
- × 输入序列长度不一致，batch 处理时报错
- × vocab 中缺少特定领域词汇

// 排查步骤

- 01 检查 tokenizer 版本，确认使用中文专用模型（如 hfl/chinese-roberta-wwm-ext）
- 02 验证 vocab 覆盖率，对目标语料做覆盖率统计，覆盖率低于 95% 时需补充词表
- 03 使用 `tokenizer.tokenize()` 对典型文本进行分词测试，观察稀有字符处理方式
- 04 使用 `tokenizer.add_special_tokens()` 和 `tokenizer.add_tokens()` 添加自定义词汇后重新训练 embeddings

#Tokenizer#中文#NLP

---

[NLP]

## 文本分类标签不平衡导致模型偏向多数类

// 快速修复

采用加权交叉熵 loss + 少数类过采样 + Focal Loss 三重策略，同时使用分层采样划分数据集。

// 现象表现

- × 模型预测结果总是偏向某一类别（通常是多数类）
- × 少数类召回率极低甚至接近零
- × 训练 loss 下降正常但验证集指标与预期差距大
- × 准确率高但实际漏判严重

// 排查步骤

- 01 使用 `pandas.value_counts()` 检查训练集标签分布，IMBALANCE RATIO 超过 10:1 时必须处理
- 02 计算各类别样本权重：`weight = total_samples / (num_classes * class_samples)`
- 03 在 PyTorch 中使用 `torch.nn.CrossEntropyLoss(weight=class_weights)` 或在 sklearn 中使用 `class_weight='balanced'`
- 04 尝试过采样少数类（如 SMOTE）或数据增强，并使用分层采样（stratified split）划分数据集

#文本分类#数据质量#Loss

---

[NLP]

## RNN/LSTM 梯度消失导致长序列信息丢失

// 快速修复

使用双向 LSTM（BiLSTM）+ 残差连接 + 注意力机制，或直接替换为 Transformer 架构。

// 现象表现

- × 长文本分类效果显著差于短文本
- × 模型偏向只关注序列开头或结尾的词
- × 训练过程中梯度值极小（接近 0）或者出现梯度爆炸
- × 反向传播时深层参数几乎不更新

// 排查步骤

- 01 可视化 Attention 权重，观察是否集中在特定位置
- 02 在训练过程中监控梯度范数，使用梯度裁剪（gradient clipping，clip_norm=1.0）
- 03 尝试截断反向传播（BPTT，truncated_backpropagation_length），限制时间步展开深度
- 04 改用 BiLSTM 让模型同时学习前后文信息，或评估切换至 BERT/Transformer 的可行性

#RNN#LSTM#梯度#长序列

---

[NLP]

## 文本数据泄露导致评估指标虚高

// 快速修复

训练前彻底打乱数据，使用文本相似度检测确保相同文档不同时出现在训练集和验证集。

// 现象表现

- × 本地验证指标极高（准确率 > 95%），但上线后效果大幅下降
- × 训练集和验证集 loss 差距极大
- × 相同或高度相似的文本同时出现在训练集和测试集
- × 交叉验证得分与实际业务效果不符

// 排查步骤

- 01 使用 Jaccard 相似度或 MinHash 对训练集和测试集文本进行重复检测，相似度 > 0.8 的样本需剔除
- 02 确保打乱数据时按文档级别而非句子级别操作，防止同一文档的句子分散在训练集和测试集
- 03 使用分层采样（stratified split）保证标签分布一致
- 04 用 k-fold 交叉验证替代单次划分，多次评估取平均值以发现数据泄露问题

#文本分类#数据泄露#模型评估

---
