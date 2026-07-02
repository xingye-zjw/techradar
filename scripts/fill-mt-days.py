with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old_end = '''checkpoint: "能解释 NMT 的核心架构（Seq2Seq + Attention），理解 BLEU 指标的计算" },
    ],
  },
{
    id: "llm-finetune",'''

new_days = '''checkpoint: "能解释 NMT 的核心架构（Seq2Seq + Attention），理解 BLEU 指标的计算" },
      { day: 2, title: "Seq2Seq 与 Attention 机制",
        summary: "深入理解 Seq2Seq 架构和 Attention 机制，动手实现", content: {
          objective: "今天你将深入学习 Seq2Seq 架构和 Attention 机制。学完后能用 PyTorch 实现一个简单的 Seq2Seq + Attention 模型，理解 Attention 的计算过程，掌握 Teacher Forcing 等训练技巧。",
          key_points: [
            "Seq2Seq 架构：编码器把源序列编码成上下文向量，解码器逐词生成目标序列",
            "Attention 机制：解码器每一步都关注源序列的不同位置，动态生成上下文向量",
            "Additive Attention vs Multiplicative Attention：两种注意力计算方式",
            "Teacher Forcing：训练时用真实的前一个词作为输入，加速训练和提升效果",
            "训练技巧：梯度裁剪、学习率调度、Label Smoothing"
          ],
          practice: "Seq2Seq + Attention 实现：1）数据准备：a）准备一个小型双语平行语料（如 IWSLT 的英德或中英翻译数据）；b）构建源语言和目标语言词表；c）数值化和批处理。2）编码器实现：a）用 Embedding + LSTM 实现编码器；b）返回所有时间步的隐藏状态和最终隐藏状态。3）解码器实现（无 Attention）：a）用 Embedding + LSTM + Linear 实现解码器；b）训练时用 Teacher Forcing；c）推理时用自回归生成。4）加入 Attention：a）实现 Additive Attention（Bahdanau Attention）或 Multiplicative Attention；b）在解码器中加入 Attention 机制，每一步计算上下文向量；c）和隐藏状态拼接，再输出预测。5）模型训练：a）用交叉熵损失训练；b）用什么优化器？学习率怎么设？c）怎么监控训练过程？6）简单翻译测试：a）写一个翻译函数，输入源句子，输出目标句子；b）找几个简单的句子测试，看翻译结果是否合理；c）和没有 Attention 的版本对比，Attention 版本是不是更好？",
          deep_dive: "Seq2Seq + Attention 是深度学习 NLP 的里程碑，理解它很重要：1）Seq2Seq 的革命性：在 Seq2Seq 出现之前，机器翻译系统是非常复杂的流水线——语言模型、翻译模型、调序模型、重排序模型，一大堆组件。Seq2Seq 用一个端到端的神经网络就搞定了，大大简化了系统，而且效果更好。这是深度学习在 NLP 领域的第一次重大胜利。2）Attention 的意义：原始 Seq2Seq 有一个致命问题——编码器把整个源句子压缩成一个固定长度的向量，长句子的信息会丢失。Attention 解决了这个问题：解码器在生成每个词的时候，都可以「看」源句子的所有位置，而且知道该看哪里。Attention 不仅大幅提升了翻译质量，更重要的是，它为后来的 Transformer 和自注意力机制铺平了道路。可以说，Attention 是过去十年 NLP 最重要的思想之一。3）Attention 的直觉：人类翻译的时候，不是先把整个句子背下来再翻译，而是一边看源句子一边翻译——生成某个词的时候，主要关注源句子中对应的那几个词。Attention 机制就是模仿这个过程。Attention 权重的可视化也给了模型一定的可解释性——我们可以看到模型在生成某个词的时候在「看」源句子的哪个位置。4）Teacher Forcing 的利弊：Teacher Forcing 是训练 Seq2Seq 的标准技巧——训练时，解码器的输入用真实的前一个词，而不是模型自己预测的前一个词。好处是训练更快、更稳定，因为模型不会被自己的错误带偏。但缺点是「训练-推理不匹配」（Exposure Bias）——训练时总是看到正确的历史，推理时却要基于自己的预测。缓解方法：Scheduled Sampling（逐渐从用真实词过渡到用预测词）、Curriculum Learning 等。5）Beam Search vs Greedy Search：推理时，Greedy Search 每一步选概率最大的词，简单但可能不是全局最优。Beam Search 每一步保留 top-k 个候选，最后选总体概率最高的序列，效果更好但计算量更大。k 是 beam size，越大效果越好但越慢，通常取 2-10。6）从 Seq2Seq 到 Transformer：Seq2Seq + Attention 用的是 RNN，RNN 有两个问题：一是不能并行计算（每个时间步依赖前一个时间步），训练慢；二是长距离依赖还是有问题。Transformer 用纯 Attention 取代了 RNN，解决了这两个问题，成为了现在的主流架构。理解 Seq2Seq + Attention 能帮你更好地理解 Transformer。"
        }, duration: "3小时", resources: [R_CS224N, B_NLP_TUTORIAL, { title: "Seq2Seq 论文", url: "https://arxiv.org/abs/1409.3215", required: false }, { title: "Attention 论文", url: "https://arxiv.org/abs/1409.0473", required: false }], checkpoint: "能用 PyTorch 实现 Seq2Seq + Attention 模型，并完成简单翻译测试" },
      { day: 3, title: "Transformer 与机器翻译",
        summary: "基于 Transformer 的神经机器翻译，用 HuggingFace 微调", content: {
          objective: "今天你将学习基于 Transformer 的机器翻译。学完后能用 HuggingFace Transformers 加载预训练翻译模型并微调，理解 BPE 分词和数据处理，掌握翻译模型的评估方法。",
          key_points: [
            "Transformer 做翻译：Encoder-Decoder 架构，编码器处理源语言，解码器生成目标语言",
            "BPE（Byte Pair Encoding）：子词分词方法，解决 OOV 问题，平衡词汇表大小和序列长度",
            "预训练翻译模型：如 MarianMT、mBART、M2M-100 等，可以直接用或微调",
            "微调翻译模型：在领域数据上微调，提升特定领域的翻译质量",
            "评估方法：BLEU、chrF、COMET 等，人工评估仍然是金标准"
          ],
          practice: "Transformer 翻译模型实战：1）子词分词学习：a）理解 BPE 的原理和算法；b）用 HuggingFace Tokenizers 库在你的数据上训练一个 BPE tokenizer；c）测试分词效果——常见词和罕见词分别怎么分？2）预训练模型推理：a）用 transformers 库加载一个预训练翻译模型（如 Helsinki-NLP/opus-mt-en-zh 或类似的）；b）翻译几个测试句子，看效果；c）试试不同的解码策略（Greedy、Beam Search），对比结果。3）数据准备与微调：a）准备一个小型平行语料（或用 IWSLT 数据）；b）用预训练模型的 tokenizer 处理数据；c）用 Trainer API 微调模型。4）效果评估：a）在测试集上计算 BLEU 分数；b）和微调前的模型对比，提升了多少？c）人工评估：找 20 个句子，对比微调前后的翻译质量。5）解码策略实验：a）对比 Greedy Search 和不同 beam size 的 Beam Search；b）试试长度惩罚（length penalty）；c）试试采样解码（Top-k、Top-p、Temperature），看生成结果有什么不同。6）错误分析：a）找出翻译质量差的句子；b）分析错误类型：漏译？错译？语序不对？术语错误？c）怎么改进？",
          deep_dive: "Transformer 彻底改变了机器翻译，现在所有的翻译系统都是基于 Transformer 的：1）为什么 Transformer 比 RNN 好？三个主要原因：a）并行计算：RNN 是顺序的，每个时间步依赖前一个，无法并行；Transformer 的 Self-Attention 可以同时计算所有位置的表示，训练速度快很多；b）长距离依赖：RNN 处理长序列时，信息需要一步步传递，容易丢失；Transformer 中任意两个位置的距离都是 1，长距离依赖更容易捕捉；c）注意力可视化：Attention 权重给了模型一定的可解释性。这些优势让 Transformer 很快取代了 RNN，成为 NLP 的主流架构。2）BPE 的重要性：子词分词是神经机器翻译的关键技术之一。它解决了两个问题：a）OOV（未登录词）：罕见词可以拆成子词，不会完全没见过；b）词汇表大小：如果用词级别的话，词汇表会非常大，Embedding 层参数太多。BPE 通过合并频率高的字符对，在词汇表大小和序列长度之间取得平衡。现在几乎所有的预训练模型（BERT、GPT 等）都用 BPE 或类似的子词分词方法。3）翻译模型的选择：现在有很多预训练翻译模型可以选择：a）MarianMT：Helsinki-NLP 训练的，支持 100+ 语言对，每个语言对一个模型，体积小，速度快；b）mBART：Meta 训练的多语言预训练模型，支持 50+ 语言，一个模型搞定所有方向，需要更多资源；c）M2M-100：Meta 训练的多对多翻译模型，支持 100 种语言互译；d）大模型：GPT-4、Claude 等大模型也能做翻译，效果很好，但速度慢、成本高。选哪个取决于你的需求——效果、速度、成本、语言对。4）领域适配：通用翻译模型在特定领域（如医疗、法律、专利）效果往往不好，因为术语和表达方式不一样。领域适配的方法：a）微调：在领域平行数据上继续训练；b）术语表约束：强制某些词按指定方式翻译；c）提示学习：给大模型加领域提示。5）翻译评估的挑战：自动评估指标（如 BLEU）和人工评分的相关性并不高，尤其是在高质量区间。更好的自动评估指标：a）chrF：基于字符 n-gram，对形态变化更鲁棒；b）COMET：基于预训练模型的评估指标，和人工相关性更高；c）BERTScore：用 BERT 的上下文嵌入计算相似度。但人工评估仍然是金标准——尤其是重要的项目，一定要有人工评估。6）机器翻译的现状与未来：现在的神经机器翻译已经在很多语言对上达到或接近人类水平（尤其是高资源语言对），但仍然有挑战：a）低资源语言：数据少，效果不好；b）领域适配：通用模型在专业领域效果下降；c）可解释性：为什么这么翻译？不知道；d）翻译腔：翻译出来的文本不够「地道」。未来的方向：大模型翻译、多语言统一模型、更好的领域适配、更准确的评估指标等。"
        }, duration: "3小时", resources: [R_HF_COURSE, B_NLP_TUTORIAL, { title: "HuggingFace 翻译教程", url: "https://huggingface.co/docs/transformers/tasks/translation", required: false }, { title: "SacreBLEU", url: "https://github.com/mjpost/sacrebleu", required: false }], checkpoint: "能用 HuggingFace 微调翻译模型，并计算 BLEU 进行评估" },
      { day: 4, title: "文本生成与解码策略",
        summary: "深入理解文本生成的各种解码策略，掌握文本生成的评估", content: {
          objective: "今天你将学习文本生成的核心技术——解码策略。学完后理解 Greedy Search、Beam Search、Top-k/Top-p 采样、Temperature 等方法的区别和适用场景，能调整解码参数控制生成质量。",
          key_points: [
            "文本生成本质：自回归地逐词生成，每一步选择下一个词",
            "确定性解码：Greedy Search（贪心）、Beam Search（集束搜索），输出确定",
            "随机采样：Top-k 采样、Top-p（Nucleus）采样、Temperature，输出有多样性",
            "生成质量 vs 多样性的权衡：更确定=更保守但可能重复，更多样=更有趣但可能不通顺",
            "常见问题：重复生成、逻辑断裂、长度失控、幻觉，以及对应的缓解方法"
          ],
          practice: "解码策略实验与对比：1）基础解码方法：a）用一个预训练生成模型（如 GPT-2、Qwen、或翻译模型）；b）实现 Greedy Search 生成；c）实现 Beam Search 生成，试试不同的 beam size（1、2、5、10）；d）对比结果：beam size 越大，效果越好吗？速度呢？2）随机采样方法：a）实现纯随机采样（从整个词表按概率采样）；b）试试不同的 Temperature（0.5、1.0、2.0），观察生成结果的变化；c）实现 Top-k 采样，试试不同的 k 值（10、50、100）；d）实现 Top-p（Nucleus）采样，试试不同的 p 值（0.5、0.9、0.95）。3）对比实验：设计一个评测表，对比各种解码策略的：a）生成质量（通顺度、相关性）；b）多样性（重复度、变化度）；c）速度。4）控制生成：a）怎么让生成更有创造性？b）怎么让生成更保守、更确定？c）怎么减少重复生成？（试试 repetition penalty、no_repeat_ngram_size）d）怎么控制生成长度？5）文本生成评估（可选）：a）理解困惑度（Perplexity）的含义；b）计算测试集上的困惑度；c）思考：困惑度越低，生成质量一定越高吗？为什么？6）应用：用你学到的解码策略，写一个简单的文本生成应用（如故事生成、邮件助手、代码补全等），调整参数直到你满意。",
          deep_dive: "文本生成是现在大模型时代最核心的技术之一，理解解码策略很重要：1）为什么解码策略这么重要？同样的模型，用不同的解码策略，生成结果可以天差地别。好的解码策略能让模型输出通顺、多样、有创造性的文本，不好的解码策略可能产出重复、不通顺、甚至无意义的内容。理解各种解码策略的原理和权衡，能帮你更好地使用大模型。2）Beam Search 的局限：Beam Search 是机器翻译的标准解码方法，因为它能找到概率较高的序列。但它也有问题：a）生成的文本偏保守、缺乏多样性；b）倾向于生成短句子（因为越长分数乘的概率项越多，总分越低，所以需要长度惩罚）；c）容易重复。对于翻译这种「有标准答案」的任务，Beam Search 很合适；但对于创意写作、对话等需要多样性的任务，就不太合适了。3）采样方法的革命：Top-k 和 Top-p 采样的出现改变了文本生成。它们的核心思想是：不要每次都选概率最大的，从概率高的候选里随机选，这样生成的文本更自然、更多样。Temperature 控制「随机性」——温度越低，分布越尖锐，越倾向于选概率高的；温度越高，分布越平缓，越多样化。Top-k 固定候选数量，Top-p 固定累积概率阈值，Top-p 通常更灵活（因为不同位置的概率分布形状不一样）。4）重复生成问题：自回归生成有一个常见问题——容易陷入重复循环，反复说同样的话。缓解方法：a）repetition penalty：惩罚已经生成过的词的概率；b）no_repeat_ngram_size：不允许生成重复的 n-gram；c）Contrastive Search：对比搜索，在考虑概率的同时考虑和之前生成内容的差异。5）解码和模型能力：很多人把生成质量不好都怪模型，但有时候问题出在解码策略上。比如：a）觉得模型输出太死板？试试调高 Temperature 或用 Top-p 采样；b）觉得模型输出太天马行空？试试调低 Temperature 或用 Beam Search；c）觉得模型总是重复？加 repetition penalty。调整解码参数往往能显著改善生成效果。6）更高级的生成方法：除了这些基础解码方法，还有更高级的生成控制方法：a）引导生成（Constrained Decoding）：强制模型生成包含特定词或遵循特定格式；b）对比解码（Contrastive Decoding）：对比大模型和小模型的预测，减少幻觉；c）Speculative Decoding：用小模型「猜」，大模型「验证」，加速生成；d）链式思维（Chain-of-Thought）：让模型一步步思考，提升复杂推理能力。理解这些基础的解码策略，是理解更高级生成技术的基础。"
        }, duration: "2.5小时", resources: [B_NLP_TUTORIAL, R_HF_COURSE, { title: "The Art of Decoding", url: "https://huggingface.co/blog/how-to-generate", required: false }], checkpoint: "能对比各种解码策略的优缺点，并能调整参数控制生成质量" },
      { day: 5, title: "翻译系统构建与实战",
        summary: "构建完整的翻译系统，后端 API + 前端界面 + 部署", content: {
          objective: "今天你将构建一个完整的机器翻译系统，从后端 API 到前端界面再到部署。学完后能用 FastAPI 构建翻译服务 API，用 Gradio/Streamlit 做前端，用 Docker 容器化部署。",
          key_points: [
            "翻译系统架构：前端界面 → 后端 API → 翻译模型 → 缓存/队列",
            "后端 API：FastAPI 构建 RESTful API，支持批量翻译、文件翻译",
            "前端界面：Gradio 或 Streamlit 快速构建交互式界面",
            "部署与优化：Docker 容器化、模型量化、批量处理、缓存",
            "生产级考虑：错误处理、日志、监控、性能优化、成本控制"
          ],
          practice: "构建完整翻译系统：1）后端 API：a）用 FastAPI 写一个翻译 API；b）提供两个端点：/translate（单句翻译）和 /batch_translate（批量翻译）；c）错误处理和参数验证；d）用 uvicorn 启动服务，用 curl 或 Postman 测试。2）前端界面：a）用 Gradio 或 Streamlit 做一个简单的翻译界面；b）左边输入源文本，右边显示翻译结果；c）可以选择翻译方向、调整解码参数；d）加上历史记录功能。3）优化性能：a）实现批量处理，一次处理多个请求提升吞吐量；b）添加缓存（如 Redis），相同的文本直接返回缓存结果；c）试试模型量化（如 8-bit 量化），看速度和显存的变化；d）（可选）用 vLLM 或 Text Generation Inference 加速推理。4）容器化部署：a）写一个 Dockerfile，把翻译服务打包成 Docker 镜像；b）构建镜像并运行容器；c）测试容器内的服务是否正常工作。5）生产级增强（可选）：a）添加日志（用 logging 或 loguru）；b）添加请求限流（防止滥用）；c）添加健康检查端点；d）添加 Prometheus 监控指标。6）总结与复盘：a）整理你这两周学到的机器翻译知识；b）写一份总结报告——从统计翻译到神经翻译到现在的大模型翻译，技术演进的脉络是什么？c）思考：机器翻译还有哪些挑战？未来会怎么发展？",
          deep_dive: "做一个 Demo 容易，但做一个生产级的翻译系统有很多工程挑战：1）延迟和吞吐量的权衡：翻译系统有两个关键指标——延迟（单个请求多久返回）和吞吐量（单位时间能处理多少请求）。两者往往是矛盾的：a）要低延迟，就不能等批量，单个请求立即处理，GPU 利用率低；b）要高吞吐量，就攒一批一起处理，延迟高。实际系统中需要根据业务需求找到平衡点。动态批处理（dynamic batching）是常用的优化——在一定时间窗口内攒请求，攒够了或者时间到了就一起处理。2）模型部署的工程化：把模型从「能跑」到「好用」中间有很多工作：a）模型优化：量化（FP16、INT8、INT4）、剪枝、蒸馏，减小模型体积，提升速度；b）推理框架：vLLM、TensorRT-LLM、Text Generation Inference 等专用推理框架，比原生 PyTorch 快很多；c）服务框架：Triton Inference Server、TorchServe、BentoML 等，提供批处理、多模型、弹性伸缩等功能。3）成本控制：大模型时代，推理成本是个大问题。降低成本的方法：a）选合适的模型：能用小模型就不用大模型；b）模型压缩：量化、蒸馏；c）缓存：相同的请求直接返回缓存；d）批处理：提高 GPU 利用率；e）弹性伸缩：流量低的时候减少实例，流量高的时候扩容。4）质量保障：生产系统中，怎么保证翻译质量？a）自动评估：定期计算 BLEU/COMET 等指标，监控质量变化；b）人工抽检：定期抽一些翻译结果人工评估；c）用户反馈：让用户可以举报翻译错误，收集 bad case 持续优化；d）A/B 测试：上新模型时做 A/B 测试，确认效果真的更好再全量。5）翻译系统的更多功能：一个完整的翻译系统通常还有很多高级功能：a）术语库：专业术语按指定方式翻译；b）翻译记忆（TM）：相同或相似的句子直接复用之前的翻译；c）音译：专有名词的音译规则；d）格式保留：翻译时保留原文的格式（如 HTML、Markdown）；e）多语言支持：支持多种语言互译。6）大模型时代的翻译：大模型（GPT-4、Claude、Gemini 等）的翻译效果已经非常好了，尤其是低资源语言和创意类文本。但大模型也有问题：a）成本高：比专门的翻译模型贵很多；b）速度慢：生成速度慢，不适合高吞吐量场景；c）稳定性：有时候会「自由发挥」，加很多原文没有的内容；d）数据隐私：把数据发给第三方大模型有隐私风险。所以实际中往往是「大模型 + 小模型」混合——普通翻译用小模型，复杂翻译用大模型，或者用大模型润色小模型的翻译结果。"
        }, duration: "3.5小时", resources: [R_FASTAPI, R_STREAMLIT, { title: "vLLM 项目", url: "https://github.com/vllm-project/vllm", required: false }], checkpoint: "完成一个包含 API、前端界面、Docker 部署的完整翻译系统" },
    ],
  },
{
    id: "llm-finetune",'''

if old_end in content:
    content = content.replace(old_end, new_days)
    with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Successfully added days 2-5 to nlp-machine-translation')
else:
    print('Old end not found')
