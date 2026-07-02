with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old_end = '''checkpoint: "能解释序列标注的核心概念，实现标注格式转换，并建立规则基线" },
    ],
  },

  // =====================================================
  // Node: nlp-machine-translation'''

new_days = '''checkpoint: "能解释序列标注的核心概念，实现标注格式转换，并建立规则基线" },
      { day: 2, title: "HMM 与 CRF 传统方法",
        summary: "理解隐马尔可夫模型和条件随机场在序列标注中的应用", content: {
          objective: "今天你将学习序列标注的传统方法——HMM 和 CRF。学完后能解释 HMM 的基本思想、CRF 的原理、两种方法的区别，能用 CRF 实现一个简单的 NER 系统。",
          key_points: [
            "HMM（隐马尔可夫模型）：生成式模型，基于马尔可夫假设，用观测序列预测隐藏状态序列",
            "HMM 三大问题：评估问题（前向算法）、解码问题（Viterbi）、学习问题（Baum-Welch）",
            "CRF（条件随机场）：判别式模型，直接建模 P(y|x)，考虑整个观测序列",
            "Linear-chain CRF：最常用的 CRF，每个位置只和相邻位置有关",
            "CRF vs HMM：CRF 是判别式的、可以任意定义特征、效果通常更好"
          ],
          practice: "HMM 与 CRF 实践：1）HMM 原理理解：a）用一个简单的例子（如词性标注）解释 HMM 的三个假设；b）手动计算一个小例子的 Viterbi 解码。2）CRF 原理学习：a）理解为什么 CRF 比 HMM 更适合序列标注；b）CRF 的特征函数是什么意思？c）CRF 的损失函数怎么理解？3）CRF 实现 NER：a）用 sklearn-crfsuite 或 pytorch-crf 库；b）在 CoNLL-2003 或 MSRA NER 数据集上训练；c）提取特征：词本身、词性、前缀后缀、大小写等；d）训练 CRF 模型。4）效果评估：a）计算实体级的 P/R/F1；b）和规则基线对比，提升了多少？c）分析 CRF 还会犯哪些错误。5）错误分析：a）找出 CRF 分错的实体；b）分析错误类型：边界错误？类型错误？完全漏了？c）怎么改进？6）思考：CRF 和 HMM 各自的优缺点是什么？在什么场景下你会选哪个？",
          deep_dive: "虽然现在深度学习是主流，但理解传统方法能帮你更好地理解序列标注问题的本质：1）生成式 vs 判别式：HMM 是生成式模型，建模 P(x,y) = P(y)P(x|y)——先假设标签序列的分布，再看每个标签生成对应观测的概率。CRF 是判别式模型，直接建模 P(y|x)。判别式模型通常效果更好，因为它不需要建模观测的分布，可以利用任意复杂的特征。2）CRF 的特征工程：在深度学习流行之前，CRF 的效果很大程度上取决于特征工程。常用的特征包括：词本身、词性、词的形状（大小写、数字、标点）、前缀后缀、词典匹配特征、周围的词和词性（上下文特征）等。好的特征工程能带来显著的提升。3）为什么 CRF 比 Softmax 好？在序列标注中，如果每个位置独立预测（如用 BiLSTM + Softmax），就没有考虑标签之间的依赖关系。比如，B-PER 后面应该跟着 I-PER 而不是 I-LOC。CRF 增加了一个转移矩阵来建模标签之间的转移概率，让输出的标签序列更「合理」。这就是 BiLSTM-CRF 比单纯 BiLSTM 效果好的原因。4）序列标注的解码：预测时，我们需要找到概率最大的标签序列。如果每个位置独立，直接取 argmax 就行。但如果有 CRF 层，就需要用 Viterbi 算法来动态规划求解最优路径。Viterbi 算法的时间复杂度是 O(n * k^2)，其中 n 是序列长度，k 是标签数。5）传统方法的价值：虽然现在 BiLSTM-CRF 和 BERT-CRF 效果更好，但 CRF 仍然有其价值：a）小数据场景下，CRF + 好的特征工程可能比深度学习效果好；b）CRF 可解释性强，能知道哪些特征在起作用；c）CRF 训练快、预测快、资源占用少。而且，CRF 的思想（转移矩阵、Viterbi 解码）在深度学习中仍然被广泛使用。6）从 CRF 到深度学习：BiLSTM-CRF 可以理解为：用 BiLSTM 自动学习特征（代替人工特征工程），然后用 CRF 层建模标签依赖。这是传统方法和深度学习结合的经典例子。理解了 CRF，就能更好地理解 BiLSTM-CRF 架构。"
        }, duration: "3小时", resources: [R_CS224N, B_NLP_TUTORIAL, { title: "sklearn-crfsuite", url: "https://sklearn-crfsuite.readthedocs.io/", required: false }], checkpoint: "能用 CRF 实现 NER，并理解和 HMM 的区别" },
      { day: 3, title: "BiLSTM-CRF 模型实现",
        summary: "实现基于 BiLSTM-CRF 的序列标注模型，理解深度学习方法", content: {
          objective: "今天你将学习 BiLSTM-CRF 模型的原理和实现。学完后能用 PyTorch 实现一个 BiLSTM-CRF 模型，理解每个组件的作用，在 NER 数据集上训练并评估。",
          key_points: [
            "BiLSTM-CRF 架构：Embedding 层 → BiLSTM 编码 → Linear 映射到标签空间 → CRF 层",
            "BiLSTM 的作用：双向编码上下文，自动提取特征，代替人工特征工程",
            "CRF 层的作用：建模标签之间的依赖关系，输出合法的标签序列",
            "损失函数：CRF 的负对数似然，考虑所有可能的标签序列",
            "Viterbi 解码：预测时用动态规划找概率最大的标签序列"
          ],
          practice: "BiLSTM-CRF 实现与训练：1）数据预处理：a）构建词表和标签表；b）把文本和标签转换成 ID；c）处理变长序列（padding、mask）。2）BiLSTM 部分实现：a）实现 Embedding 层 + BiLSTM；b）输出每个位置的隐藏状态；c）用 Linear 层映射到标签维度。3）CRF 层实现：a）实现 CRF 的前向算法（计算所有路径的分数和）；b）实现损失函数（真实路径分数 - 所有路径的 log sum exp）；c）实现 Viterbi 解码（找最优路径）。或者直接用 pytorch-crf 等库。4）模型训练：a）在 NER 数据集上训练 BiLSTM-CRF；b）用什么优化器？学习率多少？c）用什么指标监控训练过程？5）效果评估：a）在测试集上评估实体级 P/R/F1；b）和 CRF（传统方法）对比，提升了多少？c）分析哪些类型的实体提升最大，为什么？6）消融实验（可选）：a）去掉 CRF 层，只用 BiLSTM + Softmax，效果差多少？b）只用单向 LSTM，效果差多少？c）用预训练词向量 vs 随机初始化，效果差多少？",
          deep_dive: "BiLSTM-CRF 是深度学习时代序列标注的经典架构，理解它很重要：1）为什么需要 CRF 层？很多人会问：BiLSTM 已经能捕捉上下文了，为什么还要 CRF？答案是：BiLSTM 捕捉的是输入的上下文，但输出标签之间的依赖关系并没有被显式建模。比如，B-PER 后面应该接 I-PER 而不是 I-LOC，BiLSTM 可能学到这个规律，但 CRF 显式地把它编码进转移矩阵里，效果更稳定。而且，CRF 能保证输出的标签序列是合法的（比如不会出现 I-LOC 在 O 后面的情况）。2）CRF 损失的直觉：CRF 的损失函数是「真实路径的分数」减去「所有可能路径的分数的对数和」（log-sum-exp）。直觉是：我们希望真实路径的分数越高越好，其他路径的分数越低越好。这和多分类的 Softmax + Cross Entropy 本质上是一样的——只是 Softmax 是对单个位置的所有类别，CRF 是对整个序列的所有可能标签路径。3）Viterbi 算法：Viterbi 是动态规划的经典应用。核心思想是：到第 i 个位置、状态为 k 的最优路径分数 = max(到第 i-1 个位置、所有可能状态 j 的最优路径分数 + 从 j 转移到 k 的分数) + 第 i 个位置状态 k 的发射分数。从前往后算一遍，再从后往前回溯，就能得到全局最优路径。4）BiLSTM-CRF 的变体：a）CNN-BiLSTM-CRF：先用 CNN 提取字符级特征，和词向量拼接，再喂给 BiLSTM，对中文和形态丰富的语言效果好；b）Transformer-CRF：用 Transformer 代替 BiLSTM，捕捉更长距离的依赖；c）BERT-CRF：用 BERT 等预训练模型初始化，然后加 CRF 层，这是现在效果最好的方法之一。5）训练技巧：a）学习率：CRF 层的学习率通常可以比 LSTM 层高一些；b）梯度裁剪：RNN 容易梯度爆炸，梯度裁剪很重要；c）学习率调度：用 ReduceLROnPlateau 或 CosineAnnealing；d）正则化：Dropout、权重衰减；e）早停：验证集 F1 不再提升就停止。6）和文本分类的对比：序列标注可以看作「每个 token 的多分类」，但因为有标签依赖，比文本分类更复杂。理解了文本分类，再学序列标注会容易很多——相当于把分类器应用到每个位置，再加上序列约束。"
        }, duration: "3小时", resources: [R_CS224N, B_NLP_TUTORIAL, { title: "BiLSTM-CRF 论文", url: "https://arxiv.org/abs/1508.01991", required: false }], checkpoint: "能用 PyTorch 实现 BiLSTM-CRF，并在 NER 数据集上达到合理效果" },
      { day: 4, title: "基于预训练模型的序列标注",
        summary: "用 BERT 等预训练模型做序列标注，掌握微调方法", content: {
          objective: "今天你将学习如何用预训练模型做序列标注。学完后能用 HuggingFace Transformers 微调 BERT 做 NER，理解 BERT 做序列标注的要点，处理子词对齐等问题。",
          key_points: [
            "BERT 做序列标注：用 BERT 编码每个 token，取第一个子词的表示做分类，加 CRF 效果更好",
            "子词对齐问题：BERT 用 WordPiece/BPE 分词，一个词可能被拆成多个子词，需要对齐到原始标签",
            "微调策略：学习率更小（2e-5~5e-5）、epoch 数更少、warmup、权重衰减",
            "数据效率：预训练模型只需要少量标注数据就能达到很好的效果",
            "常用模型：BERT、RoBERTa、ALBERT、ELECTRA 等，中文可以用中文预训练模型"
          ],
          practice: "BERT 微调 NER 实战：1）环境准备：安装 transformers、datasets、accelerate、seqeval 库。2）数据准备：a）用 datasets 加载 NER 数据集（如 conll2003 或 msra_ner）；b）理解数据格式和标签集。3）子词对齐实现：a）用 tokenizer 分词后，一个词可能被拆成多个子词；b）实现标签对齐——只给第一个子词打标签，其他子词特殊处理（如 -100 忽略）；c）实现 attention mask。4）模型定义：a）用 AutoModelForTokenClassification 加载预训练模型；b）或者手动加载 BERT + 分类头 + CRF。5）训练与评估：a）用 Trainer API 或自定义训练循环；b）训练时用什么评估指标？（seqeval 的 classification_report）；c）调整超参数（学习率、batch size、epoch 数）。6）效果对比：a）和 BiLSTM-CRF 对比，效果提升了多少？b）训练速度和推理速度呢？c）用小数据（如只用 10% 训练数据）对比，两种方法差距更大还是更小？7）错误分析：a）BERT 还会犯哪些错误？b）哪些类型的实体识别不好？c）和 BiLSTM-CRF 的错误类型有什么不同？",
          deep_dive: "预训练模型给序列标注带来了质的飞跃，但也有一些细节需要注意：1）子词对齐是个坑：BERT 的分词和原始标注的分词粒度不一样——原始数据是按词标注的，但 BERT 是按子词（subword）分词的。这就需要做对齐。常见的对齐策略：a）只给第一个子词打标签，其余子词的 loss 忽略（最常用）；b）给所有子词打相同的标签，然后预测时取第一个子词的预测；c）用特殊的方式聚合子词表示（平均、max）。方法 a 最简单也最有效。2）为什么 BERT 效果这么好？BERT 在大规模语料上做了 Masked Language Modeling 和 Next Sentence Prediction 的预训练，学到了丰富的语言知识——语法、语义、世界知识。这些知识可以迁移到下游任务，所以只需要少量标注数据就能达到很好的效果。对于 NER 来说，BERT 学到的上下文表示能更好地理解实体的上下文，从而更准确地识别实体。3）要不要加 CRF？BERT + Softmax 已经很不错了，加 CRF 通常还能再提升 0.5-1 个点。加不加取决于你的需求：a）差几个点的 F1 对你的业务影响大吗？b）加 CRF 会增加一些复杂度和计算量；c）CRF 能保证输出序列的合法性。大多数情况下，加上 CRF 是值得的。4）数据效率：预训练模型最大的优势之一是数据效率高。在传统方法需要几万条标注的任务上，BERT 可能只需要几百条就够了。这极大地降低了 NLP 应用的门槛。但数据少的时候也要注意过拟合：a）用更小的学习率；b）少训几轮；c）冻住底层，只微调顶层；d）用更多的正则化。5）中文 NER 的特殊性：中文 NER 和英文有一些不同：a）分词：NER 可以基于词做，也可以基于字做。字级 NER 不需要分词，避免了分词错误的传播，现在更常用；b）中文实体特点：中文人名、地名、机构名的规律和英文不一样；c）中文预训练模型：用专门的中文预训练模型（如 BERT-wwm、RoBERTa-zh）效果更好。6）实用技巧：a）用领域数据继续预训练（domain-adaptive pretraining），如果你的领域很特殊；b）远程监督生成弱标签，再人工清洗；c）主动学习，选最有价值的样本标注；d）集成多个模型，投票决定最终结果。"
        }, duration: "3小时", resources: [R_HF_COURSE, B_NLP_TUTORIAL, { title: "HuggingFace Token Classification", url: "https://huggingface.co/docs/transformers/tasks/token_classification", required: false }], checkpoint: "能用 HuggingFace 微调 BERT 做 NER，并和 BiLSTM-CRF 对比效果" },
      { day: 5, title: "信息抽取与实战项目",
        summary: "关系抽取、事件抽取、实体链接，综合实战", content: {
          objective: "今天你将学习序列标注的进阶应用——信息抽取。学完后理解关系抽取、事件抽取、实体链接等任务，能完成一个端到端的信息抽取系统。",
          key_points: [
            "信息抽取（IE）：从非结构化文本中抽取结构化信息，包括实体、关系、事件",
            "关系抽取：判断两个实体之间的关系（如「张三」和「百度」是「工作于」关系）",
            "事件抽取：识别事件触发词和事件论元（时间、地点、人物等）",
            "实体链接（Entity Linking）：把文本中的实体链接到知识库中的对应实体",
            "工业级 IE 系统：通常是流水线式的——NER → 实体链接 → 关系抽取 → 事件抽取"
          ],
          practice: "信息抽取综合实战：1）关系抽取实战：a）准备或找一个关系抽取数据集（如 SemEval-2010 Task 8 或中文关系抽取数据集）；b）用预训练模型实现一个简单的关系分类器（输入两个实体的位置和句子，输出关系类型）；c）训练并评估。2）实体链接入门：a）理解实体链接的任务定义和挑战（同名实体、别名、简称）；b）实现一个简单的实体链接系统——先做 NER，然后用字符串匹配到知识库；c）用相似度排序选择最优候选。3）构建一个简单的 IE 系统：a）输入一段文本；b）输出识别到的实体、实体类型、实体之间的关系；c）用可视化的方式展示（如知识图谱可视化）。4）进阶挑战（可选）：a）试试联合抽取模型（同时抽取实体和关系，避免错误传播）；b）试试事件抽取；c）试试少样本/零样本 IE（用大模型 + Prompt）。5）项目总结：a）整理你这两周学到的序列标注知识；b）写一份总结报告——从传统方法到深度学习到预训练，各代方法的演进和优缺点；c）梳理信息抽取的技术体系和应用场景。6）思考：信息抽取在哪些行业有应用？你能想到什么有趣的应用场景？",
          deep_dive: "序列标注是信息抽取的基础，但信息抽取比单纯的序列标注更丰富、更有挑战性：1）信息抽取的完整图景：信息抽取是 NLP 的重要分支，目标是把非结构化文本转化为结构化知识。它包括：a）命名实体识别（NER）——序列标注任务；b）关系抽取（Relation Extraction）——判断实体对之间的关系；c）事件抽取（Event Extraction）——识别事件类型和论元；d）实体链接（Entity Linking）——把实体链接到知识库；e）属性抽取——抽取实体的属性。这些任务组合起来，可以构建知识图谱。2）流水线 vs 联合抽取：传统的 IE 系统通常是流水线的——先做 NER，再做关系抽取，再做实体链接。这种方式的优点是模块化、易维护，但缺点是「错误传播」——NER 的错误会传到后续任务。联合抽取试图同时抽取实体和关系，用一个模型端到端训练，理论上效果更好，但实现更复杂、训练更难。两种方式各有优劣，工业界还是流水线用得多，因为简单可控。3）关系抽取的方法：关系抽取有几种常见的范式：a）基于模板/规则：简单直接，但覆盖度低；b）基于分类：把实体对拿出来，分类它们的关系，需要先做 NER；c）基于 span：先枚举所有可能的实体 span，再分类关系，如 TPLinker；d）基于生成：直接用 Seq2Seq 模型生成结构化的关系三元组，如 T5、GPT。大模型时代，基于生成和 Prompt 的方法越来越流行。4）知识图谱：信息抽取的结果通常用来构建知识图谱（Knowledge Graph）。知识图谱是结构化的知识库，由实体、关系、属性组成，可以做问答、推荐、搜索等应用。Google 知识图谱、Wikidata、CN-DBpedia 都是著名的知识图谱。5）低资源 IE：信息抽取最大的瓶颈是标注数据——关系和事件的标注比 NER 更贵。解决方法：a）远程监督（Distant Supervision）：用知识库自动标注文本，噪音大但量大；b）弱监督：用规则、词典等生成弱标签；c）少样本学习：用大模型的 in-context learning；d）主动学习：选最有价值的样本标注。6）大模型时代的 IE：大模型（如 GPT-4）出现后，信息抽取的范式正在改变——不需要专门训练模型了，直接用 Prompt 让大模型抽取结构化信息，零样本或少样本就能工作。这降低了 IE 的门槛，让更多场景能用。但大模型也有问题：稳定性、成本、速度、数据隐私等。未来的方向可能是「大模型 + 小模型 + 规则」的混合系统。"
        }, duration: "3小时", resources: [B_NLP_TUTORIAL, R_CS224N], checkpoint: "能构建一个端到端的信息抽取系统（NER + 关系抽取 + 实体链接）" },
    ],
  },

  // =====================================================
  // Node: nlp-machine-translation'''

if old_end in content:
    content = content.replace(old_end, new_days)
    with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Successfully added days 2-5 to nlp-sequence-labeling')
else:
    print('Old end not found')
