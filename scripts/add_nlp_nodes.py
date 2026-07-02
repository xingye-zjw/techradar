import json

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_node = '''
  // =====================================================
  // Node: nlp-word-embeddings
  // =====================================================
  {
    id: "nlp-word-embeddings",
    name: "词向量与语义表示",
    difficulty: "beginner",
    track: "nlp",
    duration: "1周",
    prerequisites: ["pytorch-core"],
    status: "available",
    position: { x: 50, y: 0 },
    description: "Word2Vec / GloVe / FastText 词向量原理与训练，理解语义空间表示",
    outcomes: ["理解词向量的核心思想", "能用 Gensim 训练和使用词向量", "理解语义相似度计算"],
    relatedIntel: ["001-transformer"],
    relatedTools: ["HuggingFace"],
    relatedTerms: ["word-embedding", "word2vec", "glove", "cosine-similarity"],
    suggestions: {
      prerequisites: ["Python 编程基础", "线性代数基础"],
      nextSteps: ["RNN 与序列模型", "Transformer 与预训练模型"],
      learningPath: ["NLP 路径"],
    },
    dailyTasks: [
      { day: 1, title: "词向量基础与 One-Hot",
        summary: "理解从 One-Hot 到分布式表示的演进，掌握词向量的核心思想", content: {
          objective: "今天你将学习词向量的基本概念，理解为什么需要词向量以及它解决了什么问题。学完后能解释 One-Hot 编码的局限性、分布式表示的核心思想、词向量的语义空间概念。词向量是现代 NLP 的基础，理解它能帮你更好地掌握后续的深度学习模型。",
          key_points: [
            "One-Hot 编码：每个词是独立向量，维度=词汇表大小，无法表达语义相似度",
            "分布式假设：上下文相似的词，其语义也相似——词的含义由它的上下文决定",
            "分布式表示：将词映射到低维稠密向量，向量距离反映语义相似度",
            "词向量的性质：向量加减法能表达语义关系（如 国王-男人+女人≈女王）",
            "语义空间：词向量构成的高维空间中，相似语义的词聚类在一起"
          ],
          practice: "从零理解词向量：1）One-Hot 编码实验：构造一个小词汇表（10个词），为每个词生成 One-Hot 向量，用 numpy 计算任意两个词的余弦相似度——结果应该都是0，因为向量正交。2）语义相似度思考：列出10个词（猫、狗、汽车、火车、国王、女王、男人、女人、苹果、香蕉），按语义分组，思考如果用词向量表示，哪些词应该距离近。3）词向量可视化：下载一个预训练的小词向量（如 Gensim 自带的或 50维的 GloVe），用 PCA 或 t-SNE 将词向量降到2维，绘制散点图，观察语义相近的词是否聚在一起。4）向量加减法实验：选择3组词对（如 国王-男人+女人、巴黎-法国+中国），计算结果向量，找最接近的词，看是否符合预期。5）思考：词向量的维度应该选多大？维度太高或太低各有什么优缺点？",
          deep_dive: "词向量的背后有深刻的语言学和数学原理：1）分布语义学（Distributional Semantics）：这是词向量的理论基础，核心是「一个词的含义由它的上下文决定」。这个思想可以追溯到1950年代的语言学家 Harris。2）语义空间的几何解释：在词向量空间中，语义关系可以用几何操作来表达——同义词距离近，反义词距离也可能近（因为上下文相似），类比关系可以用向量平移来表达。3）从共现矩阵到词向量：最早的分布式表示是词-词共现矩阵（每个元素表示两个词共同出现的次数），然后用 SVD 降维得到低维向量（这就是 LSA/潜在语义分析）。Word2Vec 等方法则是用神经网络来学习低维向量，更高效、效果更好。4）词向量的局限性：a）无法处理多义词——一个词只有一个向量，但 polysemy 是普遍现象；b）无法表达短语和句子的含义；c）依赖训练数据，数据中的偏见会被编码进词向量；d）是静态的，不随上下文变化。这些局限性正是后续的 ELMo、BERT 等模型要解决的问题。5）评价词向量的质量：常用词类比任务（Word Analogy）、词相似度任务（Word Similarity）、下游任务性能来评估词向量的好坏。理解词向量的原理和局限，能帮你更好地使用它们，也能为学习更高级的模型打下基础。"
        }, duration: "2小时", resources: [B_NLP_TUTORIAL, R_HF_COURSE, { title: "Gensim 官方文档", url: "https://radimrehurek.com/gensim/", required: false }, { title: "Word2Vec 论文", url: "https://arxiv.org/abs/1301.3781", required: false }], checkpoint: "能解释分布式表示的核心思想，并用预训练词向量完成词类比实验" },
    ],
  },
'''

marker = '    id: "llm-finetune",'
if marker in content:
    idx = content.index(marker)
    brace_idx = content.rfind('{', 0, idx)
    new_content = content[:brace_idx] + new_node + content[brace_idx:]
    with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully added nlp-word-embeddings node")
else:
    print("Marker not found")
