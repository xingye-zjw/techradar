import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

nlp_nodes = [
    {
        'id': 'nlp-word-embeddings',
        'name': '词向量与语义表示',
        'difficulty': 'beginner',
        'track': 'nlp',
        'duration': '1周',
        'prerequisites': '["pytorch-core"]',
        'status': 'available',
        'position': '{ x: 50, y: 0 }',
        'description': 'Word2Vec / GloVe / FastText 词向量原理与训练，理解语义空间表示',
        'outcomes': '["理解词向量的核心思想", "能用 Gensim 训练和使用词向量", "理解语义相似度计算"]',
        'relatedIntel': '["001-transformer"]',
        'relatedTools': '["HuggingFace"]',
        'relatedTerms': '["word-embedding", "word2vec", "glove", "cosine-similarity"]',
        'daily_tasks': [
            {
                'day': 1,
                'title': '词向量基础与 One-Hot',
                'summary': '理解从 One-Hot 到分布式表示的演进，掌握词向量的核心思想',
                'objective': '今天你将学习词向量的基本概念，理解为什么需要词向量以及它解决了什么问题。学完后能解释 One-Hot 编码的局限性、分布式表示的核心思想、词向量的语义空间概念。词向量是现代 NLP 的基础，理解它能帮你更好地掌握后续的深度学习模型。',
                'key_points': [
                    'One-Hot 编码：每个词是独立向量，维度=词汇表大小，无法表达语义相似度',
                    '分布式假设：上下文相似的词，其语义也相似——词的含义由它的上下文决定',
                    '分布式表示：将词映射到低维稠密向量，向量距离反映语义相似度',
                    '词向量的性质：向量加减法能表达语义关系（如 国王-男人+女人≈女王）',
                    '语义空间：词向量构成的高维空间中，相似语义的词聚类在一起'
                ],
                'practice': '从零理解词向量：1）One-Hot 编码实验：构造一个小词汇表（10个词），为每个词生成 One-Hot 向量，用 numpy 计算任意两个词的余弦相似度——结果应该都是0，因为向量正交。2）语义相似度思考：列出10个词（猫、狗、汽车、火车、国王、女王、男人、女人、苹果、香蕉），按语义分组，思考如果用词向量表示，哪些词应该距离近。3）词向量可视化：下载一个预训练的小词向量（如 Gensim 自带的或 50维的 GloVe），用 PCA 或 t-SNE 将词向量降到2维，绘制散点图，观察语义相近的词是否聚在一起。4）向量加减法实验：选择3组词对（如 国王-男人+女人、巴黎-法国+中国），计算结果向量，找最接近的词，看是否符合预期。5）思考：词向量的维度应该选多大？维度太高或太低各有什么优缺点？',
                'deep_dive': '词向量的背后有深刻的语言学和数学原理：1）分布语义学（Distributional Semantics）：这是词向量的理论基础，核心是「一个词的含义由它的上下文决定」。这个思想可以追溯到1950年代的语言学家 Harris。2）语义空间的几何解释：在词向量空间中，语义关系可以用几何操作来表达——同义词距离近，反义词距离也可能近（因为上下文相似），类比关系可以用向量平移来表达。3）从共现矩阵到词向量：最早的分布式表示是词-词共现矩阵（每个元素表示两个词共同出现的次数），然后用 SVD 降维得到低维向量（这就是 LSA/潜在语义分析）。Word2Vec 等方法则是用神经网络来学习低维向量，更高效、效果更好。4）词向量的局限性：a）无法处理多义词——一个词只有一个向量，但 polysemy 是普遍现象；b）无法表达短语和句子的含义；c）依赖训练数据，数据中的偏见会被编码进词向量；d）是静态的，不随上下文变化。这些局限性正是后续的 ELMo、BERT 等模型要解决的问题。5）评价词向量的质量：常用词类比任务（Word Analogy）、词相似度任务（Word Similarity）、下游任务性能来评估词向量的好坏。理解词向量的原理和局限，能帮你更好地使用它们，也能为学习更高级的模型打下基础。',
                'duration': '2小时',
                'checkpoint': '能解释分布式表示的核心思想，并用预训练词向量完成词类比实验'
            }
        ]
    },
    {
        'id': 'nlp-sentiment-analysis',
        'name': '情感分析与文本分类',
        'difficulty': 'beginner',
        'track': 'nlp',
        'duration': '1周',
        'prerequisites': '["nlp-word-embeddings"]',
        'status': 'available',
        'position': '{ x: 220, y: 0 }',
        'description': '情感分析 / 文本分类 / 传统机器学习 + 深度学习方法 / 应用场景',
        'outcomes': '["掌握情感分析的核心方法", "能构建文本分类系统", "理解不同方法的优缺点"]',
        'relatedIntel': '["020-prompt-engineering"]',
        'relatedTools': '["HuggingFace"]',
        'relatedTerms': '["sentiment-analysis", "text-classification", "naive-bayes", "svm", "bert"]',
        'daily_tasks': [
            {
                'day': 1,
                'title': '文本分类与情感分析概述',
                'summary': '理解文本分类任务的定义、类型、应用场景和评估方法',
                'objective': '今天你将学习文本分类和情感分析的基本概念。学完后能解释什么是文本分类、有哪些常见类型、情感分析的任务定义、应用场景、评估指标。文本分类是 NLP 最基础也是应用最广泛的任务之一，掌握它是入门 NLP 的好起点。',
                'key_points': [
                    '文本分类：给文本分配预定义的类别，是 NLP 最经典的任务之一',
                    '常见类型：二分类（正/负情感）、多分类（新闻主题分类）、多标签分类（一篇文章多个标签）',
                    '情感分析：判断文本的情感倾向（正面/负面/中性），是文本分类的重要应用',
                    '应用场景：舆情分析、商品评论分析、客服工单分类、垃圾邮件检测、内容审核',
                    '评估指标：准确率、精确率、召回率、F1 值、混淆矩阵，不平衡数据用 F1 或 AUC'
                ],
                'practice': '文本分类入门与数据探索：1）任务类型思考：列出你生活中遇到的文本分类应用场景（至少 5 个），分析它们是二分类、多分类还是多标签分类，评估指标应该是什么。2）数据集选择：选择一个文本分类数据集——情感分析用 IMDB 影评数据集（英文）或 ChnSentiCorp（中文），主题分类用 20 Newsgroups（英文）或 THUCNews（中文）。3）数据分析：对数据集进行统计分析——a）类别分布（是否平衡？）；b）文本长度分布；c）词频统计，找出每个类别最有代表性的词；d）正负样本中最常见的词有什么不同？4）文本预处理：实现文本预处理 pipeline——a）中文：jieba 分词、去停用词；b）英文：分词、小写化、去停用词、词干提取/词形还原；c）构建词袋模型（Bag of Words）表示。5）简单基线：用最基础的方法做分类——a）基于关键词的情感分析：准备一个正面词表和负面词表，统计文本中正/负面词的数量，判断情感；b）在测试集上评估准确率，作为基线。6）错误分析：分析关键词方法的错误——为什么会判断错？是因为词表不全？是否定句？是反讽？理解为什么需要机器学习方法。',
                'deep_dive': '文本分类是 NLP 中历史最悠久、应用最广泛的任务之一，它的发展历程反映了 NLP 技术的演进：1）为什么文本分类重要？因为现实世界中有大量的非结构化文本数据，我们需要自动地对它们进行分类、整理、筛选。从垃圾邮件检测（最早的应用之一）到情感分析、内容审核、客服工单分类，文本分类无处不在。2）分类任务的类型：a）二分类：最简单，只有两个类别。如垃圾邮件（是/否）、情感（正/负）；b）多分类：多个类别，每个样本属于且仅属于一个类别。如新闻主题分类（体育/娱乐/科技...）；c）多标签分类：每个样本可以属于多个类别。如一篇新闻可以同时是「科技」和「财经」。多标签分类更复杂，常用方法：把每个标签当作独立的二分类问题、调整损失函数等。3）情感分析的层次：情感分析不只是正面/负面这么简单，它可以在不同粒度上做：a）文档级：判断整篇文档的情感倾向；b）句子级：判断每个句子的情感；c）属性级（Aspect-Based）：判断对某个具体方面的情感，比如「手机的屏幕很好，但电池不耐用」——对「屏幕」是正面，对「电池」是负面。属性级情感分析更细粒度，也更有用。4）评估的陷阱：准确率是最直观的指标，但在类别不平衡的情况下会误导人。比如 95% 的样本是正例，模型全预测正例就有 95% 的准确率，但完全没用。这时应该用 F1 值、AUC、Recall 等更合适的指标。选对评估指标很重要——取决于业务更看重精确率还是召回率。5）中文文本分类的特殊性：a）分词：中文需要先分词，分词质量影响分类效果；b）字级 vs 词级：中文也可以直接用字来做分类，不需要分词，各有优劣；c）中文预训练模型：有专门的中文预训练模型（如 BERT-wwm、RoBERTa-zh 等），比多语言模型效果好。6）工业界的实践：实际项目中，往往不是上来就用大模型，而是从简单到复杂逐步尝试——先用规则快速出基线，再用传统机器学习，最后用深度学习/预训练模型。这样既能快速交付，又能在有需要时逐步提升效果。而且，简单模型在很多场景下已经够用了。',
                'duration': '2小时',
                'checkpoint': '能解释文本分类的核心概念，建立规则基线，并做数据分析'
            }
        ]
    }
]

def generate_daily_tasks(tasks):
    task_strs = []
    for t in tasks:
        key_points_str = ',\n            '.join([f'"{kp}"' for kp in t['key_points']])
        task_str = f'''      {{ day: {t['day']}, title: "{t['title']}",
        summary: "{t['summary']}", content: {{
          objective: "{t['objective']}",
          key_points: [
            {key_points_str}
          ],
          practice: "{t['practice']}",
          deep_dive: "{t['deep_dive']}"
        }}, duration: "{t['duration']}", resources: [B_NLP_TUTORIAL, R_HF_COURSE], checkpoint: "{t['checkpoint']}" }}'''
        task_strs.append(task_str)
    return ',\n'.join(task_strs)

def generate_node(node):
    daily_tasks_str = generate_daily_tasks(node['daily_tasks'])
    suggestions = '''    suggestions: {
      prerequisites: ["Python 编程基础", "线性代数基础"],
      nextSteps: ["RNN 与序列模型", "Transformer 与预训练模型"],
      learningPath: ["NLP 路径"],
    },'''
    
    node_str = f'''
  // =====================================================
  // Node: {node['id']}
  // =====================================================
  {{
    id: "{node['id']}",
    name: "{node['name']}",
    difficulty: "{node['difficulty']}",
    track: "{node['track']}",
    duration: "{node['duration']}",
    prerequisites: {node['prerequisites']},
    status: "{node['status']}",
    position: {node['position']},
    description: "{node['description']}",
    outcomes: {node['outcomes']},
    relatedIntel: {node['relatedIntel']},
    relatedTools: {node['relatedTools']},
    relatedTerms: {node['relatedTerms']},
{suggestions}
    dailyTasks: [
{daily_tasks_str}
    ],
  },'''
    return node_str

# Find the insertion point - right before llm-finetune
insert_marker = "    id: \"llm-finetune\","

# Generate all new nodes
all_new_nodes = '\n'.join([generate_node(n) for n in nlp_nodes])

# Insert
if insert_marker in content:
    # Find the start of the llm-finetune node object
    idx = content.index(insert_marker)
    # Find the opening brace before it (the start of the node object)
    # Go back to find the '{' that starts this node
    brace_idx = content.rfind('{', 0, idx)
    new_content = content[:brace_idx] + all_new_nodes + '\n' + content[brace_idx:]
    
    with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Successfully added {len(nlp_nodes)} NLP nodes")
else:
    print("Could not find insertion point")
