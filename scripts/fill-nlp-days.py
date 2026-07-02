with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old_end = """checkpoint: "能解释分布式表示的核心思想，并用预训练词向量完成词类比实验" },
    ],
  },

  // =====================================================
  // Node: nlp-sentiment-analysis"""

new_days = '''checkpoint: "能解释分布式表示的核心思想，并用预训练词向量完成词类比实验" },
      { day: 2, title: "Word2Vec 原理与 Skip-gram",
        summary: "深入理解 Word2Vec 的两种模型（CBOW/Skip-gram）和优化技巧", content: {
          objective: "今天你将学习 Word2Vec 的核心原理。学完后能解释 CBOW 和 Skip-gram 的区别、负采样的原理、层次 Softmax 的思想、Word2Vec 为什么效果好。Word2Vec 是词向量领域的里程碑，理解它能帮你深入理解词表示学习。",
          key_points: [
            "Word2Vec 两种模型：CBOW（用上下文预测中心词）、Skip-gram（用中心词预测上下文）",
            "优化目标：最大化语料的对数似然，本质是学习让上下文词概率更高的词表示",
            "负采样（Negative Sampling）：不更新整个词汇表，只采样几个负例，大幅加速训练",
            "层次 Softmax（Hierarchical Softmax）：用 Huffman 树把 Softmax 复杂度从 O(V) 降到 O(logV)",
            "Skip-gram 通常比 CBOW 效果好，尤其是在小数据集和低频词上"
          ],
          practice: "Word2Vec 深入理解与训练：1）原理推导：用自己的话解释 Skip-gram 和 CBOW 的训练目标，画出模型结构图。2）负采样理解：为什么需要负采样？负采样的概率分布为什么取 3/4 次幂？写一段代码模拟负采样过程。3）Gensim 训练：a）准备一个中文语料（如维基百科或小说文本，至少 100MB）；b）用 jieba 分词；c）用 gensim.models.Word2Vec 训练一个 Skip-gram 模型；d）调整几个关键参数：vector_size、window、min_count、negative，对比不同参数的效果。4）词向量评估：a）词相似度任务：准备 20 对词，人工打分，计算词向量余弦相似度和人工评分的相关性；b）词类比任务：准备 10 组类比（如 国王-男人+女人=？），看模型能答对多少；c）找最相似的词：选 5 个词，看模型返回的最相似的 10 个词是否合理。5）可视化：用 t-SNE 把 200 个常用词的向量降到 2 维，画散点图，观察聚类效果。6）思考：Skip-gram 和 CBOW 各自适合什么场景？窗口大小选多大合适？",
          deep_dive: "Word2Vec 虽然简单，但它的思想非常深刻，对后来的 NLP 发展影响巨大：1）为什么 Word2Vec 这么有效？Word2Vec 不是第一个词向量方法，但它是第一个真正大规模实用的。它成功的关键：a）简单高效的模型结构（只有一个隐藏层的神经网络）；b）聪明的优化技巧（负采样、层次 Softmax），让训练速度提升几个数量级；c）海量的训练数据（Google 用了 10 亿词的语料）；d）发布了预训练的词向量，大家可以直接用。2）Word2Vec 和 SVD 的关系：后来的研究表明，Word2Vec 本质上是在做矩阵分解——Skip-gram with Negative Sampling 等价于对词-上下文点互信息（PMI）矩阵做隐式分解。这把神经网络方法和传统的统计方法联系了起来。3）词向量的语言学特性：Word2Vec 学到的词向量有很多有趣的语言学性质——向量加法能表达语义组合、关系类比（king - man + woman ≈ queen）、语义聚类等。这些性质不是 Word2Vec 特有的，而是分布式表示的普遍性质，但 Word2Vec 让大家清晰地看到了这一点。4）训练技巧：a）窗口大小：小窗口（2-3）学到更多功能/语法相似性，大窗口（5-10）学到更多主题/语义相似性；b）下采样高频词：对高频词做 subsampling，减少它们的影响，相当于给了低频词更多机会；c）负采样的数量：一般取 5-25 个负例，小数据集取多些，大数据集取少些。5）局限性：Word2Vec 是静态词向量，一个词只有一个表示，无法处理多义词。这是后来 ELMo、BERT 等动态上下文表示要解决的问题。但即使在今天，Word2Vec 的思想和方法仍然有参考价值。"
        }, duration: "2小时", resources: [B_NLP_TUTORIAL, { title: "Word2Vec 论文精读", url: "https://arxiv.org/abs/1301.3781", required: false }, { title: "Gensim Word2Vec 教程", url: "https://radimrehurek.com/gensim/models/word2vec.html", required: false }], checkpoint: "能用 Gensim 训练词向量，并完成词相似度和词类比评估" },
      { day: 3, title: "GloVe 与 FastText",
        summary: "学习 GloVe 和 FastText 的原理，对比不同词向量方法的优劣", content: {
          objective: "今天你将学习另外两种重要的词向量方法：GloVe 和 FastText。学完后能解释 GloVe 的核心思想、FastText 的子词机制、三种方法的对比和适用场景。",
          key_points: [
            "GloVe：结合全局矩阵分解和局部上下文窗口的优点，基于共现概率比值学习词向量",
            "GloVe 核心思想：两个词的共现概率比值能编码它们的语义关系，用词向量的点积来拟合这个比值",
            "FastText：把词拆成字符 n-gram，用子词信息来学习词表示",
            "FastText 优势：能处理 OOV（未登录词）、对形态丰富的语言效果好、训练速度快",
            "三种方法对比：Word2Vec 基于预测、GloVe 基于计数、FastText 基于子词，各有优劣"
          ],
          practice: "GloVe 与 FastText 实践对比：1）GloVe 原理学习：理解 GloVe 的损失函数为什么这样设计？为什么用共现概率的比值而不是共现概率本身？2）下载预训练 GloVe 词向量，和 Word2Vec 做对比：a）在相同的词相似度任务上，哪个效果更好？b）词类比任务呢？3）FastText 实践：a）用 gensim 训练一个 FastText 模型；b）测试 OOV 词：找几个不在词汇表里的词，FastText 能给出合理的相似词吗？4）综合对比：在你的测试集上，三种方法的效果排名是怎样的？速度和内存呢？5）思考：什么时候用 Word2Vec？什么时候用 GloVe？什么时候用 FastText？",
          deep_dive: "词向量方法虽然多，但背后的思想是相通的——都是从词的上下文中学语义。1）预测 vs 计数：Word2Vec 是预测方法，GloVe 是计数方法。很长时间里大家认为这是两种不同的路线，但后来的研究表明它们本质上是相通的——Skip-gram with Negative Sampling 等价于对 PMI 矩阵做加权矩阵分解。两者各有优劣：计数方法利用全局统计信息，但对高频词有利；预测方法更灵活，但可能漏掉全局模式。2）子词表示的意义：FastText 的子词思想很重要。对于英语来说，很多词有共同的前缀后缀，子词能利用这些形态信息。子词思想后来发展到了 BPE 等更高级的分词方法，这也是 GPT、BERT 等大模型用的分词方法。3）中文词向量的特殊性：中文词向量有一些特殊问题：a）分词：中文需要先分词，分词错误会影响词向量质量；b）字 vs 词：中文也可以用字向量，不需要分词；c）成语、典故：中文有很多四字成语，语义不是简单的字组合。"
        }, duration: "2小时", resources: [B_NLP_TUTORIAL, { title: "GloVe 项目主页", url: "https://nlp.stanford.edu/projects/glove/", required: false }, { title: "FastText 文档", url: "https://fasttext.cc/", required: false }], checkpoint: "能对比 Word2Vec/GloVe/FastText 三种方法的优劣，并完成实践对比" },
      { day: 4, title: "句向量与文档向量",
        summary: "从词向量到句向量，掌握文本表示的常用方法", content: {
          objective: "今天你将学习如何从词向量得到句子和文档的向量表示。学完后掌握平均池化/加权平均、TF-IDF 加权、Doc2Vec、Sentence-BERT 等句向量方法。",
          key_points: [
            "从词到句：最简单的方法是词向量平均/加权平均，但丢失了语序和句法信息",
            "TF-IDF 加权平均：用词的 TF-IDF 值作为权重，重要的词权重更高",
            "Doc2Vec：在 Word2Vec 基础上增加文档向量，同时学习词向量和文档向量",
            "Sentence-BERT：用 BERT 等预训练模型微调专门生成句向量，效果远好于传统方法",
            "句向量应用：文本相似度计算、聚类、检索、分类、信息检索"
          ],
          practice: "句向量方法实践与对比：1）简单平均法：a）对数据集中的每个句子，用词向量取平均得到句向量；b）用 cosine 相似度计算句子之间的相似度。2）TF-IDF 加权平均：a）计算每个词的 IDF 值；b）用 TF-IDF 作为权重，计算加权平均的句向量；c）和简单平均对比。3）Doc2Vec：a）用 gensim 的 Doc2Vec 训练一个文档向量模型；b）测试文档相似度检索效果。4）Sentence-BERT（进阶）：a）用 sentence-transformers 库加载预训练模型；b）生成句向量并对比效果。5）应用：用句向量做一个简单的语义搜索系统。",
          deep_dive: "得到好的句向量比词向量难得多，因为句子有结构、有语序、有复杂的语义组合：1）为什么简单平均效果还不错？很多人会低估简单平均的效果。实际上，在很多任务上，词向量平均的基线并没有那么容易超越。原因是：a）词向量本身已经编码了丰富的语义信息；b）很多任务（如主题分类）主要看有哪些词，语序影响不大。2）预训练模型带来的革命：Sentence-BERT 等基于预训练模型的句向量方法出现后，句向量的质量有了质的飞跃。因为预训练模型在海量数据上学到了丰富的语言知识，能更好地理解句子的语义。3）语义相似度的不同维度：「句子相似」是个模糊的概念——是主题相似？还是语义等价？还是情感相似？不同的应用需要不同的相似度。"
        }, duration: "2小时", resources: [B_NLP_TUTORIAL, { title: "Sentence-Transformers", url: "https://www.sbert.net/", required: false }], checkpoint: "能用多种方法生成句向量，并完成简单的语义搜索应用" },
      { day: 5, title: "词向量应用与综合实战",
        summary: "词向量的综合应用：文本分类、信息检索、可视化", content: {
          objective: "今天你将综合运用前四天学到的词向量知识，完成几个实战应用。学完后能用词向量做文本分类、信息检索、语义相似度计算。",
          key_points: [
            "词向量应用场景：文本分类、信息检索、推荐系统、问答系统、数据增强",
            "文本分类 pipeline：词向量 + 池化/加权 + 分类器（逻辑回归/SVM/简单神经网络）",
            "信息检索：查询向量化、文档向量化、余弦相似度排序、倒排索引加速",
            "词向量的调优：领域微调、OOV 处理、维度选择、相似度计算方式",
            "常见坑：词向量质量差、分词错误、停用词处理不当、维度灾难"
          ],
          practice: "词向量综合实战：1）文本分类实战：a）用情感分析数据集；b）词向量取平均得到句向量；c）用逻辑回归或 SVM 训练分类器；d）在测试集上评估准确率、F1；e）和关键词基线、TF-IDF + 朴素贝叶斯对比。2）信息检索实战：a）准备 500-1000 个文档/段落；b）用句向量为每个文档建立索引；c）写一个简单的搜索函数；d）手动找 10 个查询，评估搜索结果的相关性。3）可视化与分析：a）用 PCA 或 t-SNE 可视化句子向量，不同类别用不同颜色，看是否能分开；b）分析分类错误的样本。4）总结与复盘：写一份总结报告——这一周学到了什么？还有什么疑问？",
          deep_dive: "词向量虽然是基础，但真正用好并不容易，有很多实践经验和坑：1）预训练 vs 从头训练：大多数情况下，用别人预训练好的词向量比自己从头训效果好。但如果你的领域很特殊，通用词向量可能不够好，这时可以在领域数据上继续微调。2）OOV 问题的处理：实际应用中总会遇到词表外的词。处理方法：a）用 FastText 等子词方法；b）用字向量代替词向量；c）用上下文动态生成词向量（如 ELMo、BERT）。3）词向量的发展脉络：从 One-Hot 到共现矩阵到 SVD 降维，到 Word2Vec、GloVe、FastText 等静态词向量，到 ELMo 等上下文相关的动态词向量，再到 BERT、GPT 等预训练语言模型。这个发展脉络的主线是：表示越来越丰富、越来越动态、越来越上下文相关。"
        }, duration: "3小时", resources: [B_NLP_TUTORIAL, R_HF_COURSE], checkpoint: "完成文本分类和信息检索两个实战应用，写出一周学习总结" },
    ],
  },

  // =====================================================
  // Node: nlp-sentiment-analysis'''

if old_end in content:
    content = content.replace(old_end, new_days)
    with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Successfully added days 2-5 to nlp-word-embeddings')
else:
    print('Old end not found')
