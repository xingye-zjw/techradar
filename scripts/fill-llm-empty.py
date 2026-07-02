with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# =====================================================
# 1. llm-prompt-engineering (already has day 1, add days 2-5)
# =====================================================
old1 = 'checkpoint: "能设计有效的结构化 Prompt，完成一次 Prompt 迭代优化" },'
new1 = '''checkpoint: "能设计有效的结构化 Prompt，完成一次 Prompt 迭代优化" },
      { day: 2, title: "思维链与少样本学习",
        summary: "掌握 Chain-of-Thought 推理和 Few-shot 学习，提升复杂任务效果", content: {
          objective: "今天你将学习思维链（CoT）和少样本学习技术。学完后能设计 CoT Prompt 引导模型推理，用 Few-shot 示例提升效果，理解 Zero-shot/Few-shot/CoT 的适用场景。",
          key_points: [
            "Few-shot 学习：给模型几个示例，让模型理解任务格式和要求",
            "Chain-of-Thought（CoT）：让模型一步步思考，提升推理能力",
            "Zero-shot vs Few-shot vs CoT：不同复杂度任务用不同方法",
            "示例选择：示例的数量、质量、多样性对效果的影响",
            "Self-Consistency：多路径采样投票，进一步提升准确率"
          ],
          practice: "CoT 与少样本实战：1）少样本学习：a）用 GPT 做一个分类任务，先试 zero-shot；b）加 3-5 个示例做 few-shot；c）对比效果提升；d）示例怎么选更有效？2）CoT 推理：a）用数学问题测试 zero-shot；b）加「让我们一步步思考」提示；c）对比 CoT 前后的准确率；d）自己写带推理过程的示例。3）示例设计实验：a）示例数量：1、3、5 个，效果有什么变化？b）示例多样性：相似示例 vs 多样示例；c）示例顺序：会不会影响效果？4）Self-Consistency：a）对同一个问题生成 5 个答案；b）投票选最多的答案；c）和单个答案比，准确率有没有提升？5）应用场景：a）哪些任务适合 CoT？（数学、逻辑、多步推理）b）哪些任务不需要 CoT？（简单分类、摘要）c）什么时候用 Few-shot 什么时候 Fine-tuning？6）总结：整理一份 Prompt 技巧速查表。",
          deep_dive: "思维链和少样本学习是大模型时代最重要的 Prompt 技术之一：1）CoT 为什么有效？大模型的涌现能力——当模型足够大时，CoT 才能发挥作用。小模型加 CoT 反而可能变差。CoT 本质是「让模型把推理过程说出来」，把隐性知识显性化。研究发现，CoT 不仅提升准确率，还提升可解释性——你能看到模型是怎么想的。2）Few-shot 的原理：GPT 等大模型有很强的 in-context learning 能力——不需要参数更新，只需要在上下文中给几个示例，模型就能理解任务。这和传统机器学习完全不同。原理还在研究中，一种解释是：模型在预训练中学到了「遵循示例」的元学习能力。3）示例工程（Example Engineering）：Few-shot 的效果很大程度取决于示例的质量。好的示例应该：a）覆盖任务的各种情况；b）格式一致、清晰；c）代表性强；d）数量适中（通常 3-10 个）。示例的顺序也可能影响效果（近因效应）。4）高级 CoT 技巧：a）Self-Consistency：生成多个推理路径，投票选答案；b）Tree of Thoughts：树形搜索，探索多种可能；c）Least-to-Most：把复杂问题分解成小问题逐步解决；d）Auto-CoT：自动生成 CoT 示例，不需要人工写。5）什么时候该 Fine-tuning？如果 Few-shot 效果不够好，可以考虑 Fine-tuning。但有成本：a）需要标注数据；b）需要训练算力；c）维护成本高。经验法则：先用 Prompt 工程榨干效果，再考虑 Fine-tuning。对于很多任务，好的 Prompt + CoT + Few-shot 已经够用了。6）Prompt 工程的未来：Prompt 工程会消失吗？不会，但会进化——a）自动 Prompt 优化（AutoPrompt、OPRO）；b）Agent 自己设计 Prompt；c）更好的基础模型对 Prompt 的鲁棒性更强。但理解原理、知道怎么设计好的 Prompt，仍然是 AI 从业者的核心能力。"
        }, duration: "2小时", resources: [{ title: "Chain-of-Thought 论文", url: "https://arxiv.org/abs/2201.11903", required: false }, { title: "Prompt Engineering Guide", url: "https://www.promptingguide.ai/zh", required: false }], checkpoint: "能用 CoT 和 Few-shot 提升复杂任务效果，理解各自的适用场景" },
      { day: 3, title: "结构化输出与 Function Calling",
        summary: "掌握结构化输出和函数调用，让大模型与外部系统集成", content: {
          objective: "今天你将学习结构化输出和 Function Calling。学完后能让模型输出 JSON 等结构化格式，使用 Function Calling 调用外部工具，实现大模型与外部系统的集成。",
          key_points: [
            "结构化输出：让模型输出 JSON、XML 等格式，便于程序解析",
            "Function Calling：模型决定调用哪个函数、传什么参数，由程序执行",
            "工具集成：搜索、计算器、数据库、API 等外部工具的集成",
            "输出验证：对模型输出做语法和语义校验，防止格式错误",
            "重试与纠错：格式错误时的处理策略，引导模型自我修正"
          ],
          practice: "结构化输出与 Function Calling 实战：1）JSON 输出：a）写一个 Prompt，让模型输出指定格式的 JSON；b）解析 JSON 并使用；c）测试不同模型输出 JSON 的可靠性；d）如果格式错了，怎么处理？2）结构化输出技巧：a）用 JSON Schema 描述格式；b）在 Prompt 中给出示例；c）用「只输出 JSON，不要其他内容」约束；d）对比不同方法的成功率。3）Function Calling 入门：a）理解 Function Calling 的原理（模型输出函数名和参数）；b）用 OpenAI Function Calling 或开源模型实现；c）定义一个简单函数（如计算器、天气查询）；d）让模型调用函数，获取结果后再回答。4）多工具集成：a）定义 3 个不同的工具函数；b）让模型根据问题自动选择合适的工具；c）实现工具调用的完整循环（思考 → 调用 → 观察 → 回答）。5）输出校验与纠错：a）写一个校验函数，检查 JSON 格式是否正确；b）如果格式错误，把错误信息返回给模型，让它修正；c）测试最多几次重试能修正？6）思考：a）结构化输出和 Function Calling 有什么关系？b）什么时候用结构化输出，什么时候用 Function Calling？c）怎么保证工具调用的安全性？",
          deep_dive: "结构化输出和 Function Calling 是大模型从「聊天」走向「应用」的关键技术：1）为什么需要结构化输出？大模型自然语言输出很灵活，但程序很难解析。结构化输出让模型输出程序能处理的格式（JSON、XML 等），这是集成到大系统中的前提。比如你要做一个信息抽取系统，需要模型输出结构化的实体和关系。2）Function Calling 的本质：Function Calling 不是模型真的调用了函数，而是模型输出了「应该调用哪个函数、传什么参数」，然后由程序去执行。模型只是做决策，执行由程序完成。这样的设计很优雅——模型负责理解和决策，程序负责执行和可靠性。3）工具使用的模式：a）单工具调用：一次只调用一个工具；b）多工具并行：一次调用多个工具；c）链式调用：上一个工具的结果作为下一个的输入；d）循环调用：ReAct 模式，多步思考+行动。ReAct 模式最强大也最复杂。4）结构化输出的可靠性问题：大模型不总是输出正确的格式。提升可靠性的方法：a）好的 Prompt 和示例；b）输出约束（如 JSON mode）；c）基于 Grammar 的约束（如 llama.cpp 的 grammar）；d）事后校验+重试；e）用更小的专用模型做结构化输出（不如用大模型灵活，但更稳定）。5）Function Calling 的安全问题：让模型调用工具是有风险的——a）Prompt 注入：恶意输入可能诱导模型调用危险工具；b）参数注入：构造特殊输入控制函数参数；c）权限过大：工具权限太大，被滥用后果严重。防护措施：工具白名单、参数校验、人工确认、沙箱执行。6）从 API 到 Agent：Function Calling 是 Agent 的基础——有了工具调用能力，模型就能和外部世界交互，就能完成复杂任务。ReAct = Reasoning + Acting = CoT + Function Calling。理解了 Function Calling，就能理解 Agent 的工作原理。"
        }, duration: "2.5小时", resources: [{ title: "OpenAI Function Calling 文档", url: "https://platform.openai.com/docs/guides/function-calling", required: false }, { title: "Structured Outputs", url: "https://platform.openai.com/docs/guides/structured-outputs", required: false }], checkpoint: "能实现结构化输出和 Function Calling，集成至少 2 个外部工具" },
      { day: 4, title: "Agent 模式与多轮对话",
        summary: "深入理解 Agent 设计模式，掌握多轮对话的 Prompt 技巧", content: {
          objective: "今天你将学习 Agent 设计模式和多轮对话技巧。学完后理解 ReAct、Plan-and-Execute 等 Agent 模式，能设计多轮对话系统，处理上下文管理和状态追踪。",
          key_points: [
            "ReAct 模式：思考 → 行动 → 观察循环，边想边做",
            "Plan-and-Execute：先制定计划再逐步执行，适合复杂任务",
            "多轮对话管理：上下文窗口、历史摘要、滑动窗口",
            "角色设定（System Prompt）：定义模型的角色、能力、边界",
            "Agent 记忆：短期记忆（对话历史）、长期记忆（知识库）、工作记忆"
          ],
          practice: "Agent 与多轮对话实战：1）角色设定实验：a）给模型设定不同角色（助手、专家、学生、批评家）；b）同样的问题，不同角色的回答有什么不同？c）设计一个你觉得最实用的角色。2）ReAct Agent：a）实现一个简单的 ReAct 循环（自己写代码，不依赖框架）；b）给 Agent 几个工具（搜索、计算、知识库）；c）测试多步推理任务，看 Agent 能不能自己规划步骤；d）观察 Agent 的思考过程，哪些合理哪些走弯路？3）Plan-and-Execute：a）实现计划-执行模式：先用模型生成计划，再逐步执行；b）和 ReAct 对比，哪个效果更好？哪个更可控？c）计划执行中遇到问题怎么办？动态调整计划。4）多轮对话管理：a）实现一个简单的多轮对话；b）上下文太长时怎么处理？（滑动窗口、摘要）c）测试 10 轮对话后，模型还能记住早期的信息吗？d）设计一个记忆管理策略。5）Agent 评估：a）设计 10 个需要多步的测试任务；b）评估 Agent 的成功率、步数、效率；c）Agent 最容易在什么地方出错？d）怎么改进？6）思考：a）好的 Agent 应该具备什么能力？b）Agent 和普通 Chatbot 的区别是什么？c）Agent 的未来会怎样？",
          deep_dive: "Agent 是当前 AI 最热门的方向之一，理解它的设计模式很重要：1）Agent 的核心能力：一个完整的 Agent 通常具备几种能力——a）规划（Planning）：分解任务、制定计划；b）记忆（Memory）：记住过去的信息和经验；c）工具使用（Tool Use）：调用外部能力；d）学习（Learning）：从经验中改进。当前的 Agent 在规划和工具使用上已经不错了，记忆和学习还在发展。2）ReAct vs Plan-and-Execute：两种主流 Agent 模式各有优劣——a）ReAct：灵活，能根据反馈调整，但可能走弯路、忘记目标；b）Plan-and-Execute：有条理，不会偏题，但计划错了就全错，不够灵活。实际中常常结合——先有大致计划，执行中动态调整。3）多轮对话的挑战：对话越长，上下文越容易出问题——a）遗忘：早期信息被后来的覆盖；b）偏移：话题逐渐偏离最初目标；c）矛盾：后面的回答和前面矛盾；d）膨胀：上下文超出窗口。解决方法：摘要记忆、关键信息提取、周期性回顾目标。4）System Prompt 的艺术：System Prompt 定义了 Agent 的「人设」——a）角色：你是谁；b）能力：你能做什么、不能做什么；c）风格：回答的语气、长度、格式；d）边界：遇到不该回答的问题怎么办。好的 System Prompt 能大幅提升用户体验。5）Agent 框架生态：现在有很多 Agent 框架——a）LangChain：功能最全，生态最大，但学习曲线陡；b）LlamaIndex：侧重 RAG；c）AutoGen：微软，多 Agent 对话；d）CrewAI：多 Agent 协作；e）LangGraph：状态机式 Agent。框架在快速迭代，但核心思想是相通的。6）Agent 的局限：当前 Agent 还很初级——a）可靠性差：经常犯错、卡住、兜圈子；b）成本高：多步推理消耗大量 Token；c）评估难：没有好的自动评估方法；d）安全风险：自主行动可能造成损失。但发展很快，未来潜力巨大。"
        }, duration: "3小时", resources: [{ title: "ReAct 论文", url: "https://arxiv.org/abs/2210.03629", required: false }, { title: "LangChain Agents", url: "https://python.langchain.com/docs/modules/agents/", required: false }], checkpoint: "能实现简单的 ReAct Agent，设计有效的多轮对话系统" },
      { day: 5, title: "Prompt 评估与优化实战",
        summary: "建立 Prompt 评估体系，系统化地优化 Prompt 效果", content: {
          objective: "今天你将学习 Prompt 的评估和优化方法。学完后能建立评估数据集和指标，用 A/B 测试对比不同 Prompt，系统化地优化 Prompt 效果，建立自己的 Prompt 最佳实践。",
          key_points: [
            "评估体系：测试集构建、评估指标（准确率、相关性、一致性）、人工评估",
            "A/B 测试：对比两个 Prompt 的效果，数据驱动决策",
            "优化方法：迭代优化、消融实验、错误分析、最佳实践沉淀",
            "成本与效果的权衡：Token 消耗 vs 质量提升，选合适的模型",
            "Prompt 版本管理：Prompt 的迭代、回滚、A/B 测试基础设施"
          ],
          practice: "Prompt 评估与优化实战：1）构建测试集：a）选一个任务（如分类、摘要、问答）；b）收集 20-50 个测试用例；c）准备标准答案或评估标准；d）这个测试集就是你的「基准」。2）Prompt 迭代：a）写第一个版本的 Prompt（v1）；b）在测试集上运行，记录效果；c）分析 bad case，找出问题；d）优化 Prompt，出 v2；e）对比 v1 和 v2 的效果。3）消融实验：a）选一个你觉得有效的 Prompt；b）逐步去掉一些组件（示例、CoT、角色设定等）；c）看每个组件对效果的贡献；d）哪些是必须的，哪些是锦上添花？4）成本分析：a）统计每个 Prompt 的平均 Token 消耗；b）对比不同模型（GPT-3.5 vs GPT-4）的效果和成本；c）计算「每提升 1% 准确率花多少钱」；d）在你的场景下，性价比最高的方案是什么？5）Prompt 最佳实践：a）总结你这一周学到的 Prompt 技巧；b）整理成一份 Prompt 最佳实践文档；c）按任务类型分类（分类、生成、推理、工具调用）；d）每个类型 3-5 条最佳实践。6）项目实战：选一个你感兴趣的场景，做一个完整的 Prompt 优化项目——a）定义任务和评估标准；b）构建测试集；c）迭代 3-5 个版本；d）输出最终方案和分析报告。",
          deep_dive: "Prompt 工程的高阶境界是「数据驱动的优化」，而不是凭感觉调：1）为什么需要评估？很多人调 Prompt 全靠感觉——「我觉得这个更好」。但主观感觉不可靠，需要客观的评估数据。建立评估体系是 Prompt 工程从「艺术」走向「科学」的关键。没有评估，就不知道优化有没有用。2）评估的维度：Prompt 效果评估是多维度的——a）准确性：答案对不对；b）相关性：有没有答非所问；c）一致性：同样的问题答案是否稳定；d）格式正确性：输出格式是否符合要求；e）安全性：有没有不当内容；f）成本：Token 消耗多少；g）延迟：响应时间多长。不同任务看重的维度不同。3）评估方法：a）自动评估：有标准答案的任务（分类、抽取）可以自动算准确率；b）模型评估：用 GPT-4 等强模型当裁判，评估答案质量；c）人工评估：最可靠但最贵，适合抽样验证；d）用户反馈：线上真实用户的点赞点踩。建议是：自动评估做日常监控，人工评估做定期质检，用户反馈做最终标准。4）A/B 测试的正确姿势：线上 A/B 测试是黄金标准——a）流量分割：一部分用户用 A，一部分用 B；b）随机分配：确保两组用户特征一致；c）指标：先定好评估指标；d）统计显著性：差异要足够大才作数。注意不要频繁改 Prompt，要等足够的样本量。5）Prompt 版本管理：Prompt 和代码一样，需要版本管理——a）版本号：v1、v2、v3；b）变更日志：每次改了什么、效果怎么变；c）回滚能力：新版本不行能快速回退；d）A/B 测试框架：同时跑多个版本，自动对比。不要把 Prompt 硬编码在代码里，要放在配置中心或数据库。6）Prompt 工程的未来：Prompt 工程会不会消失？短期不会，但会演进——a）更智能的工具：自动优化 Prompt 的工具会越来越多；b）模型更鲁棒：对 Prompt 的敏感性会降低；c）从 Prompt 到 Agent：从单个 Prompt 到多步骤 Agent。但理解原理、知道怎么和模型有效沟通，这个能力永远不会过时。"
        }, duration: "3小时", resources: [{ title: "Prompt 评估指南", url: "https://www.promptingguide.ai/zh/evaluation", required: false }], checkpoint: "能建立评估体系，系统化优化 Prompt，产出最佳实践文档" },
    ],
  },'''

if old1 in content:
    content = content.replace(old1, new1)
    print('1. llm-prompt-engineering: OK')
else:
    print('1. llm-prompt-engineering: NOT FOUND')

# =====================================================
# 2. llm-inference (empty, fill 10 days for 2周)
# =====================================================
old2 = '''{
    id: "llm-inference",
    name: "大模型推理优化与部署",
    track: "llm",
    difficulty: "advanced",
    duration: "2周",
    prerequisites: ["llm-finetune"],
    status: "locked",'''

new2 = '''{
    id: "llm-inference",
    name: "大模型推理优化与部署",
    track: "llm",
    difficulty: "advanced",
    duration: "2周",
    prerequisites: ["llm-finetune"],
    status: "locked",
    description: "大模型推理加速、量化、分布式推理与生产级部署。覆盖 vLLM、TensorRT-LLM、LoRA 推理服务等核心技术。",
    outcomes: ["掌握大模型推理优化技术", "能部署生产级推理服务", "理解量化和显存优化"],
    relatedIntel: ["024-inference-optimization", "044-llm-deployment"],
    relatedTools: ["vLLM", "TensorRT", "HuggingFace"],
    relatedTerms: ["inference", "quantization", "vllm", "tensorrt", "deployment", "kv-cache"],
    suggestions: {
      prerequisites: ["PyTorch 熟练", "CUDA 基础"],
      nextSteps: ["Agent 开发", "MLOps 进阶"],
      learningPath: ["LLM 路径"],
    },
    dailyTasks: [
      { day: 1, title: "大模型推理基础与挑战",
        summary: "理解大模型推理的核心挑战和基本优化方向", content: {
          objective: "今天你将了解大模型推理的基础和核心挑战。学完后能解释为什么大模型推理慢、内存瓶颈在哪里，理解推理优化的主要方向，能用 HuggingFace 做基础推理。",
          key_points: [
            "推理挑战：显存瓶颈、计算密集、自回归生成慢、批量处理难",
            "显存占用模型参数 + KV Cache + 激活值，参数是大头",
            "推理流程：Prefill（预处理） + Decode（逐词生成），两个阶段特性不同",
            "优化方向：量化、KV Cache 优化、批处理、架构优化、专用推理框架",
            "评估指标：延迟（Latency）、吞吐量（Throughput）、显存占用、成本"
          ],
          practice: "推理基础实战：1）基础推理：a）用 HuggingFace Transformers 加载一个小模型（如 GPT-2 或 Qwen-1.8B）；b）写一个简单的生成函数；c）测量推理延迟和显存占用。2）KV Cache 理解：a）不用 KV Cache 生成，记录时间和显存；b）启用 KV Cache，对比差异；c）生成更长的文本，看 KV Cache 的增长；d）理解 KV Cache 大小和序列长度的关系。3）性能分析：a）测量 Prefill 阶段和 Decode 阶段的时间；b）为什么 Prefill 是计算密集，Decode 是访存密集？c）增加 batch size，吞吐量怎么变？d）找到当前的瓶颈是计算还是显存。4）推理框架对比（概念）：a）了解 vLLM、TensorRT-LLM、Text Generation Inference、llama.cpp；b）各自的特点和适用场景；c）什么场景选什么框架？5）成本估算：a）估算部署一个 7B 模型需要什么硬件；b）每秒生成多少 token；c）每 1000 token 的成本是多少？d）和 API 调用比哪个划算？6）思考：为什么大模型推理比训练还难优化？",
          deep_dive: "大模型推理是当前 AI 应用的最大成本项，理解优化原理至关重要：1）推理为什么这么贵？大模型推理贵的根本原因：a）参数多：7B 模型光参数就占 14GB（FP16），需要高端 GPU；b）自回归生成：每个 token 都要做一次前向传播，生成长文本很慢；c）访存瓶颈：Decode 阶段每个 token 的计算量小，但要加载全部参数，显存带宽成瓶颈；d）批量难：不同请求长度不一样，难高效批处理。推理成本通常占 LLM 应用总成本的 60-80%。2）Prefill vs Decode：两个阶段特性完全不同——a）Prefill（填槽）：一次性处理输入 prompt，计算量大，计算密集，容易并行；b）Decode（生成）：逐个生成 token，计算量小，但要加载全部参数，访存密集，难并行。推理优化往往针对这两个阶段分别优化。3）KV Cache 的作用：KV Cache 是最基础也最重要的优化。没有 KV Cache 时，生成第 n 个 token 需要重新计算前面所有 token 的 K 和 V。有了 KV Cache，只需要计算最新 token 的 KV，和之前的拼接。KV Cache 节省了大量计算，但也占用显存——序列越长，KV Cache 越大。长文本场景下 KV Cache 可能和参数一样大。4）推理优化的全景图：推理优化有多个层次——a）算法层：量化、蒸馏、稀疏化（减少计算量）；b）系统层：KV Cache 优化、批处理、调度（提升利用率）；c）框架层：算子融合、图优化、CUDA kernel 优化（更快执行）；d）硬件层：更好的 GPU（H100 > A100 > 3090）、专用芯片（TPU、ASIC）。通常是多层结合优化。5）常见的优化技术：a）量化：用更少的位存参数（INT8、INT4、NF4），减少显存和带宽需求；b）PagedAttention：像操作系统虚拟内存一样管理 KV Cache，提升批处理效率（vLLM 的核心技术）；c）Speculative Decoding：用小模型「猜」，大模型「验证」，提升生成速度；d）FlashAttention：优化 Attention 计算，减少显存访问，提升速度。6）推理优化的权衡：所有优化都是 trade-off——a）量化：速度/显存 vs 质量；b）批处理：吞吐量 vs 延迟；c）小模型：速度/成本 vs 效果；d）专用硬件：速度 vs 成本。没有最好的方案，只有最合适的方案——根据你的场景（延迟要求、吞吐量要求、预算、质量要求）选择。"
        }, duration: "2.5小时", resources: [{ title: "vLLM 论文", url: "https://arxiv.org/abs/2309.06180", required: false }, { title: "HuggingFace 推理教程", url: "https://huggingface.co/docs/transformers/generation_strategies", required: false }], checkpoint: "能用 HuggingFace 做基础推理，分析推理瓶颈" },
      { day: 2, title: "量化技术：GPTQ/AWQ/QLoRA",
        summary: "深入理解模型量化技术，掌握 INT4/INT8 量化方法", content: {
          objective: "今天你将深入学习模型量化技术。学完后理解量化的原理（对称/非对称、逐通道/逐张量），掌握 GPTQ、AWQ、NF4 等主流量化方法，能对模型做量化并评估质量损失。",
          key_points: [
            "量化基础：把高精度（FP16/FP32）转换成低精度（INT8/INT4），减少显存和带宽",
            "量化方式：对称 vs 非对称，逐张量 vs 逐通道，重量化 vs 后训练量化",
            "GPTQ：基于近似 Hessian 的逐通道量化，4-bit 精度损失小",
            "AWQ：激活感知量化，保护重要权重的精度",
            "NF4：归一化浮点 4-bit，QLoRA 用的量化方法"
          ],
          practice: "量化实战：1）INT8 量化入门：a）用 bitsandbytes 把 7B 模型做 8-bit 量化；b）对比 FP16 和 INT8 的显存占用和推理速度；c）生成一些文本，看质量有没有明显下降。2）4-bit 量化：a）用 NF4 量化（QLoRA 的方式）；b）对比 4-bit 和 8-bit 和 FP16 的显存；c）测试不同量化方式下的生成质量。3）GPTQ 量化（可选）：a）了解 GPTQ 的原理；b）下载一个 GPTQ 量化的模型；c）用 AutoGPTQ 加载并推理；d）对比 GPTQ 和 bitsandbytes 的速度和质量。4）AWQ 量化（可选）：a）了解 AWQ 的原理（激活感知）；b）用 AWQ 量化一个小模型；c）对比不同量化方法的质量。5）质量评估：a）选一个你关心的任务（如摘要、问答）；b）准备 10-20 个测试用例；c）对比 FP16、INT8、INT4 的效果；d）量化到 4-bit 后，质量损失多少？在你场景下能接受吗？6）总结对比：做一个表格，对比 FP16、INT8、INT4（GPTQ/AWQ/NF4）的显存、速度、质量、易用性。",
          deep_dive: "量化是推理优化性价比最高的技术之一，用一点点质量损失换巨大的速度和显存提升：1）量化为什么能工作？神经网络的权重分布通常是钟形的（大部分值接近 0，少数极端值）。很多权重的精度是冗余的——把它们从 16-bit 降到 8-bit 甚至 4-bit，对最终结果影响不大。这是因为神经网络本身就有很强的鲁棒性，一点点噪声不影响整体输出。2）量化的误差来源：量化会引入误差，主要来自：a）舍入误差：值四舍五入到最近的量化点；b）截断误差：超出范围的值被 clip；c）不对称分布的损失：对称量化对不对称分布损失大。好的量化方法就是尽量减小这些误差。3）主流量化方法对比：a）INT8 量化：技术成熟，精度损失极小，速度提升明显，显存减半，推荐入门用；b）GPTQ：4-bit 量化的标杆，精度好，需要校准数据，推理速度快；c）AWQ：激活感知的量化，精度比 GPTQ 略好，尤其是小模型；d）NF4：QLoRA 用的方法，4-bit 浮点，对训练友好（LoRA 微调时用）。推理用 GPTQ/AWQ 多，训练用 NF4 多。4）量化的权衡：a）bit 数越低：显存越少、速度越快，但精度损失越大；b）4-bit 是甜点：显存只有 FP16 的 1/4，质量损失通常在可接受范围；c）不是所有任务都能用量化：对精度要求极高的任务（如精确计算）可能不适合。5）量化感知训练（QAT）：后训练量化（PTQ）是训练完再量化，简单但有精度损失。量化感知训练（QAT）是在训练时就模拟量化，让模型适应量化误差，精度更高但更复杂。大多数场景下 PTQ 就够了，精度要求极高再考虑 QAT。6）量化的未来：量化技术还在快速发展——a）更低 bit：2-bit、1-bit 都在研究；b）混合精度：不同层用不同 bit 数；c）自动量化：自动找最优的量化策略；d）硬件加速：GPU 对 INT8/INT4 的支持越来越好。量化是推理优化的第一站，投入产出比最高。"
        }, duration: "3小时", resources: [{ title: "GPTQ 论文", url: "https://arxiv.org/abs/2210.17323", required: false }, { title: "AWQ 论文", url: "https://arxiv.org/abs/2306.00978", required: false }, { title: "bitsandbytes", url: "https://github.com/TimDettmers/bitsandbytes", required: false }], checkpoint: "能对模型做 INT8 和 INT4 量化，评估质量损失和性能提升" },
      { day: 3, title: "vLLM 与 PagedAttention",
        summary: "掌握 vLLM 推理框架，理解 PagedAttention 原理", content: {
          objective: "今天你将学习 vLLM 推理框架和 PagedAttention 技术。学完后能用 vLLM 部署高吞吐推理服务，理解 PagedAttention 的原理，知道什么时候用 vLLM 以及它的优势。",
          key_points: [
            "PagedAttention：借鉴操作系统虚拟内存思想，分页管理 KV Cache",
            "vLLM 优势：高吞吐量、高效批处理、自动管理显存、支持多种模型",
            "连续批处理（Continuous Batching）：动态加入新请求，提升 GPU 利用率",
            "vLLM 部署：OpenAI 兼容 API、Docker 部署、性能调优",
            "高级功能：多 Lora 服务、前缀缓存、张量并行、 speculative decoding"
          ],
          practice: "vLLM 部署实战：1）vLLM 入门：a）安装 vLLM；b）用 vllm 命令行推理一个小模型；c）和 HuggingFace 原生推理对比速度。2）API 服务部署：a）用 vllm serve 启动 OpenAI 兼容的 API 服务；b）用 curl 或 OpenAI 客户端调用；c）测试聊天补全和流式输出。3）性能测试：a）用 ab 或 wrk 做压力测试；b）测量不同并发下的吞吐量和延迟；c）对比 HuggingFace 部署的性能；d）vLLM 快了多少倍？4）理解 Continuous Batching：a）观察 vLLM 是怎么处理不同长度的请求的；b）传统批处理 vs 连续批处理的区别；c）为什么连续批处理能提升吞吐量？5）高级配置实验：a）调 max-model-len、gpu-memory-utilization 等参数；b）试试张量并行（如果你有多卡）；c）试试前缀缓存（Prefix Caching）；d）观察这些配置对性能的影响。6）思考：a）vLLM 适合什么场景？（高吞吐、大量并发）b）vLLM 不适合什么场景？（低延迟单请求、极端长文本）c）vLLM 和 TensorRT-LLM 比有什么优缺点？",
          deep_dive: "vLLM 是近年来最具影响力的推理框架之一，它的 PagedAttention 思想巧妙地解决了 KV Cache 管理问题：1）传统 KV Cache 的问题：传统做法是给每个请求预分配一块连续的内存存 KV Cache，但有两个严重问题——a）内部碎片：请求实际长度比预分配的短，浪费显存；b）外部碎片：不同请求释放后留下不连续的空闲空间，难以再利用；c）利用率低：因为碎片化，很多显存浪费了。vLLM 论文说传统方法的显存浪费率高达 60-80%。2）PagedAttention 的灵感：PagedAttention 的想法来自操作系统的虚拟内存——把 KV Cache 分成固定大小的「页」（block），每个页存若干 token 的 KV。逻辑上连续的页，物理上可以不连续。就像操作系统用页表管理虚拟内存一样，PagedAttention 用一个块表（block table）记录每个请求的页映射。这样就消除了碎片，大幅提升了显存利用率。3）连续批处理（Continuous Batching）：vLLM 的另一个核心优化。传统批处理是「静态」的——一批请求凑齐了一起处理，都处理完了再下一批。如果有一个请求特别长，其他短请求要等它。连续批处理是「动态」的——每一步都可以加入新请求、移除已完成的请求。这样 GPU 几乎不空闲，利用率大幅提升。4）vLLM 为什么这么快？主要得益于：a）PagedAttention 提升显存利用率，能同时处理更多请求；b）连续批处理提升 GPU 利用率；c）优化的 CUDA kernel；d）高效的调度策略。vLLM 通常比 HuggingFace 原生快 10-100 倍，尤其是在高并发场景下。5）vLLM 的生态：vLLM 已经成为开源推理的事实标准——a）支持几乎所有主流模型（Llama、Qwen、ChatGLM、Mistral 等）；b）OpenAI 兼容 API；c）支持多种量化（GPTQ、AWQ、FP8）；d）支持 LoRA 服务、前缀缓存、多模态；e）和 Ray、Kubernetes 集成。6）和其他框架的对比：a）TensorRT-LLM：Nvidia 官方，更快但更复杂，支持的模型少一些；b）Text Generation Inference（TGI）：HuggingFace 出品，功能全但比 vLLM 慢；c）llama.cpp：CPU/苹果芯片上最好，适合个人使用；d）vLLM：综合性能和易用性最好，社区最活跃。生产部署推荐 vLLM 或 TensorRT-LLM。"
        }, duration: "3小时", resources: [{ title: "vLLM 官方文档", url: "https://docs.vllm.ai/", required: false }, { title: "PagedAttention 论文", url: "https://arxiv.org/abs/2309.06180", required: false }], checkpoint: "能用 vLLM 部署推理服务，理解 PagedAttention 原理和优势" },
      { day: 4, title: "TensorRT-LLM 与高级优化",
        summary: "了解 TensorRT-LLM 和高级推理优化技术", content: {
          objective: "今天你将学习 TensorRT-LLM 和更多高级推理优化技术。学完后理解 TensorRT-LLM 的特点和优势，了解 Speculative Decoding、FlashAttention、FP8 等高级优化技术，能根据场景选择合适的优化方案。",
          key_points: [
            "TensorRT-LLM：Nvidia 官方推理框架，极致性能，支持最新硬件特性",
            "Speculative Decoding：推测解码，用小模型猜，大模型验，速度翻倍",
            "FlashAttention：优化 Attention 计算，减少显存访问，提升速度",
            "FP8 推理：H100 等新硬件支持 FP8，精度接近 FP16，速度翻倍",
            "分布式推理：张量并行、流水并行，用多张卡跑更大的模型"
          ],
          practice: "高级推理优化学习：1）TensorRT-LLM 入门（概念）：a）了解 TensorRT-LLM 的架构和特点；b）对比 vLLM 和 TensorRT-LLM 的异同；c）什么场景应该用 TensorRT-LLM？2）Speculative Decoding 学习：a）理解推测解码的原理（草稿模型 + 验证模型）；b）为什么能加速？（一次验证多个 token）；c）草稿模型怎么选？（同系列的小模型）；d）加速比大概是多少？（通常 2-3 倍）3）FlashAttention 理解：a）为什么标准 Attention 慢？（显存访问多）；b）FlashAttention 怎么优化？（分块计算 + 重计算）；c）FlashAttention-2 和 FlashDecoding 是什么？d）现在的框架基本都内置了 FlashAttention。4）FP8 与硬件加速：a）FP8 格式（E4M3 和 E5M2）；b）为什么 FP8 能几乎无损？（训练后量化或混合精度训练）；c）哪些硬件支持 FP8？（H100、Ada 系列）；d）FP8 的加速比和显存节省。5）分布式推理：a）什么时候需要多卡推理？（模型太大装不下、需要更高吞吐量）；b）张量并行（TP）：把模型参数拆分到多张卡；c）流水并行（PP）：按层拆分，不同卡跑不同层；d）两种并行的优缺点和适用场景。6）方案设计练习：给以下场景设计推理方案：a）产品客服机器人，并发高，延迟要求一般；b）实时对话应用，延迟要求低，并发一般；c）离线批量生成，吞吐量优先，延迟无所谓；d）超大模型（70B+），单卡装不下。",
          deep_dive: "推理优化是一个多层次的系统工程，需要结合算法、框架、硬件的知识：1）TensorRT-LLM 的定位：TensorRT-LLM 是 Nvidia 的「亲儿子」，目标是极致性能——a）深度优化的 CUDA kernel，充分利用硬件特性；b）支持最新的硬件功能（FP8、NVLink）；c）性能比 vLLM 再高 20-50%。但代价是：部署更复杂，支持的模型更少，更新速度慢一些。vLLM 胜在易用和生态，TensorRT-LLM 胜在性能。2）Speculative Decoding 的直觉：大模型生成每个 token 都很慢，但我们可以用一个小模型（草稿模型）快速生成一串 token，然后让大模型一次验证。如果小模型猜对了几个，就相当于大模型一次生成了多个 token，速度就提升了。关键是草稿模型要「猜得准」——准确率越高，加速越多。通常用同系列的小模型（如 Llama-7B 做 Llama-70B 的草稿模型），加速比 2-3 倍。3）FlashAttention 的意义：Attention 的计算复杂度是 O(n²)，但更要命的是显存访问——标准 Attention 需要把中间结果存到 HBM（显存），然后再读回来，显存带宽成了瓶颈。FlashAttention 把计算分成小块（tiling），在 SRAM（高速缓存）里完成计算，减少了 HBM 访问。速度快了，显存占用还少了。FlashAttention 已经成为标配，几乎所有框架都用。4）推理优化的极限：推理优化能优化到什么程度？a）理论下限：硬件的理论算力（FLOPS/s）和显存带宽；b）实际中受限于内存带宽、调度开销、CUDA kernel 效率；c）目前最先进的框架（vLLM + 量化 + Speculative Decoding）可能达到原生的 50-100 倍吞吐量；d）但硬件也在进步（H100 比 A100 快，H200 更快）。5）成本优化的系统思维：推理成本优化是系统工程，不能只看单点——a）模型选择：能用小模型就不用大模型（7B vs 70B 差 10 倍成本）；b）量化：4-bit 量化，成本再减一半；c）批处理：提升利用率，摊薄固定成本；d）缓存：相同请求直接返回缓存；e）按需扩缩容：流量低时减少实例；f）混合部署：简单问题用小模型，复杂问题用大模型。6）推理优化的未来：a）专用芯片：Google TPU、AWS Trainium/Inferentia、各种 ASIC；b）MoE 模型：激活的参数少，推理更快；c）更好的架构：状态空间模型（Mamba）等，理论上比 Transformer 推理更快；d）边缘推理：手机、PC 上跑大模型。推理是大模型落地的关键，优化空间还很大。"
        }, duration: "2.5小时", resources: [{ title: "TensorRT-LLM", url: "https://github.com/NVIDIA/TensorRT-LLM", required: false }, { title: "FlashAttention", url: "https://arxiv.org/abs/2205.14135", required: false }, { title: "Speculative Decoding", url: "https://arxiv.org/abs/2211.17192", required: false }], checkpoint: "理解多种高级推理优化技术的原理和适用场景，能设计推理方案" },
      { day: 5, title: "生产级部署与监控",
        summary: "大模型服务的生产级部署、监控和运维", content: {
          objective: "今天你将学习大模型推理服务的生产级部署。学完后能构建生产级的推理服务（API、限流、容错），配置监控和日志，理解生产环境的最佳实践和常见坑。",
          key_points: [
            "生产级服务：API 网关、限流、鉴权、重试、容错、降级",
            "监控与告警：延迟、吞吐量、错误率、GPU 利用率、显存、成本",
            "弹性伸缩：根据负载自动扩缩容，兼顾成本和体验",
            "模型版本管理：模型注册、A/B 测试、灰度发布、回滚",
            "安全与合规：数据隐私、内容安全、访问控制"
          ],
          practice: "生产部署实战：1）API 服务完善：a）在 vLLM 基础上加一个 API 网关（如 FastAPI）；b）添加鉴权（API Key）；c）添加限流（防止滥用）；d）添加错误处理和统一响应格式。2）监控配置：a）用 Prometheus 收集指标（QPS、延迟、错误率、GPU 利用率、显存）；b）用 Grafana 做可视化仪表盘；c）设置告警规则（如错误率 > 5% 告警）。3）日志系统：a）配置结构化日志（JSON 格式）；b）记录每个请求的输入、输出、耗时、状态；c）用 ELK 或 Loki 收集和查询日志。4）A/B 测试与灰度：a）设计模型 A/B 测试方案；b）怎么分流量？（按用户、按请求特征、随机）；c）怎么评估效果？（业务指标、质量评估）；d）怎么灰度发布和回滚？5）成本优化：a）计算当前每 1000 token 的成本；b）列出 3-5 个成本优化措施；c）估算每个措施的成本节省和实施难度；d）制定优化优先级。6）生产部署 Checklist：a）列出生产部署需要考虑的 10+ 个方面；b）按优先级排序；c）哪些是必须的？哪些是可以后期加的？d）和传统 Web 服务部署有什么不同？",
          deep_dive: "把模型从 Demo 搬到生产，中间差了一整套工程体系：1）生产级服务的要求：Demo 只要「能跑」就行，生产要「稳」——a）高可用：不能动不动挂了，99.9% 可用意味着每月停机 < 43 分钟；b）低延迟：用户等不及，对话模型首 token 延迟很重要；c）可扩展：流量涨了能扛住；d）可观测：出问题了能快速定位；e）安全：不能被滥用、不能泄露数据。这些要求加起来，就是 10 倍的工作量。2）监控的层次：大模型服务监控比普通服务复杂——a）系统层：CPU、GPU、内存、显存、网络；b）服务层：QPS、延迟、错误率、并发数；c）模型层：token 生成速度、输入/输出长度分布、拒绝率；d）业务层：用户满意度、任务完成率、成本。每一层都要监控，才能全面了解服务状态。3）弹性伸缩的挑战：大模型服务的弹性伸缩比普通服务难——a）启动慢：加载模型要几十秒到几分钟；b）状态有状态？不，推理服务是无状态的，但冷启动慢；c）GPU 贵：闲置 = 浪费钱；d）流量波动大：白天晚上差异大。策略：预留实例 + 弹性实例结合，提前预热，根据队列长度而非 CPU 利用率扩缩容。4）模型版本管理：模型也像代码一样，需要版本管理——a）模型注册：集中管理所有模型版本；b）部署管理：哪个模型在哪个环境；c）A/B 测试：同时跑两个版本对比效果；d）灰度发布：一点点放量，出问题快速回滚。LLM 的版本管理更难，因为模型质量的评估不像功能测试那么直接。5）安全与合规：大模型服务的安全挑战很独特——a）Prompt 注入：用户输入恶意指令绕过限制；b）数据泄露：模型可能输出训练数据中的敏感信息；c）内容安全：生成不当内容（暴力、色情、歧视）；d）合规：不同地区对 AI 有不同要求（如欧盟 AI Act）。防御：内容过滤、输入输出审核、数据脱敏、访问控制。6）成本控制是永恒的主题：大模型推理很贵，成本控制是生产部署的核心议题——a）模型选型：用最小够用的模型；b）量化压缩：INT4 是标配；c）批处理优化：vLLM 等提升利用率；d）缓存策略：相似请求缓存结果；e）智能路由：简单问题路由到小模型；f）按需定价：不同用户不同 SLA 和价格。成本优化做得好，毛利才能上去。"
        }, duration: "3小时", resources: [{ title: "vLLM 生产部署指南", url: "https://docs.vllm.ai/en/latest/serving/deploying_with_k8s.html", required: false }], checkpoint: "能设计生产级推理部署方案，考虑监控、安全、成本等因素" },
      { day: 6, title: "多模型与 LoRA 服务",
        summary: "掌握多模型和 LoRA 推理服务，理解前缀缓存等优化", content: {
          objective: "今天你将学习多模型服务和 LoRA 推理。学完后理解多租户和多模型服务的架构，能用 vLLM 同时服务多个 LoRA 模型，掌握前缀缓存等优化技术。",
          key_points: [
            "多模型服务：一个服务实例同时提供多个模型的能力，提升资源利用率",
            "LoRA 服务：加载多个 LoRA 适配器，共享基础模型，快速切换",
            "前缀缓存（Prefix Caching）：缓存公共前缀的 KV，加速系统提示、文档问答等场景",
            "多租户隔离：不同用户/模型之间的资源隔离和性能隔离",
            "模型调度：多个模型共享 GPU 时的调度策略"
          ],
          practice: "多模型与 LoRA 服务实战：1）LoRA 推理入门：a）准备两个不同的 LoRA 模型（或用预训练的）；b）用 vLLM 的多 LoRA 功能启动服务；c）请求时指定不同的 LoRA 适配器；d）对比基础模型和 LoRA 模型的输出差异。2）前缀缓存实验：a）启用前缀缓存；b）构造有公共前缀的请求（如相同的系统提示）；c）对比有缓存和无缓存的首 token 延迟；d）缓存命中率怎么看？3）多模型架构设计：a）如果有 5 个模型，怎么部署？（每个一个实例 vs 共享实例）；b）各方案的成本和资源利用率对比；c）模型切换的开销是多少？d）怎么调度能让用户体验最好？4）资源隔离思考：a）多个模型共享 GPU，怎么保证不互相影响？b）一个模型出问题会不会把整个服务搞挂？c）怎么限制每个模型/用户的资源使用？5）成本分析：a）单模型部署的成本；b）多模型共享的成本；c）在什么情况下多模型共享更划算？d）盈亏平衡点在哪里？6）设计练习：你要做一个 AI 写作平台，有 10 个不同风格的模型（通用、公文、小说、代码等），怎么设计推理架构？",
          deep_dive: "多模型服务是生产环境的常见需求，它比单模型服务复杂得多：1）为什么需要多模型服务？实际业务往往不止一个模型——a）不同任务用不同模型（聊天、摘要、代码）；b）同一任务不同版本（v1、v2，A/B 测试）；c）定制化模型（每个客户一个微调模型）。如果每个模型一个独立实例，成本太高，GPU 利用率低。多模型共享 GPU 能大幅提升利用率，降低成本。2）LoRA 服务的价值：LoRA 让多模型服务更经济——基础模型共享，每个客户/场景只存一个小的 LoRA 适配器（几十 MB）。vLLM 等框架支持动态加载 LoRA：请求来了加载对应的 LoRA，用完卸载。这样一个 GPU 就能服务几十上百个定制模型。这是 SaaS 化的关键技术。3）前缀缓存的场景：Prefix Caching 对某些场景效果非常好——a）系统提示：所有请求都有相同的长系统提示；b）文档问答：用户基于同一篇文档提问，文档内容是公共前缀；c）少样本示例：相同的 few-shot 示例。缓存公共前缀的 KV，可以减少 Prefill 的时间和计算，降低首 token 延迟。对长系统提示的场景，加速效果很明显。4）多模型调度的挑战：多个模型共享 GPU，调度是个难题——a）怎么分配 GPU 显存？给每个模型分多少；b）怎么调度请求？先到先服务还是优先级调度；c）怎么避免某个模型占满资源影响其他模型；d）怎么处理突发流量？调度策略直接影响用户体验和资源利用率。5）架构选型：多模型服务的几种架构——a）单实例多模型：一个进程加载多个模型，简单但隔离差；b）多进程单 GPU：每个模型一个进程，共享 GPU，隔离好一些；c）MIG 分区：A100 等支持把 GPU 分成多个小的，强隔离但有粒度限制；d）多实例 + 负载均衡：每个模型独立实例，前面加负载均衡，隔离最好但成本高。根据需求选。6）未来：Serverless 推理？现在大家在探索 LLM 的 Serverless——按需调用，按使用量付费，不用管基础设施。技术挑战：a）冷启动问题（加载模型慢）；b） GPU 池化和调度；c）多租户隔离。已经有一些项目（如 Modal、Banana、Baseten）在做，但还在早期。"
        }, duration: "2.5小时", resources: [{ title: "vLLM LoRA 服务", url: "https://docs.vllm.ai/en/latest/features/lora.html", required: false }], checkpoint: "理解多模型服务架构，能用 vLLM 部署多 LoRA 服务" },
      { day: 7, title: "LLM 应用的全栈优化",
        summary: "从应用层优化 LLM 体验：缓存、流式、降级、错误处理", content: {
          objective: "今天你将从应用层视角学习 LLM 优化。学完后能设计好的 LLM 应用架构，掌握缓存、流式输出、降级策略、错误处理等技术，提升用户体验并降低成本。",
          key_points: [
            "应用架构：前端 → 网关 → 路由 → 模型服务 → 工具/数据，分层设计",
            "语义缓存：相似问题直接返回缓存答案，大幅降低成本和延迟",
            "流式输出：SSE/WebSocket 实现流式响应，提升用户感知速度",
            "降级与容错：模型挂了怎么办？限流、熔断、重试、降级方案",
            "成本优化：智能路由（小模型 vs 大模型）、提示压缩、批处理"
          ],
          practice: "LLM 应用架构实战：1）语义缓存实现：a）用 Sentence-BERT 或 FAISS 实现简单的语义缓存；b）相同/相似问题直接返回缓存；c）测试缓存命中率和节省的成本；d）缓存失效策略怎么设计？2）流式输出：a）用 FastAPI + SSE 实现流式响应；b）前端用 EventSource 接收并显示；c）对比流式和非流式的用户体验差异；d）流式输出时怎么处理错误？3）降级策略设计：a）主模型（GPT-4 级）挂了怎么办？b）自动降级到小模型（GPT-3.5 级）；c）再不行返回模板回答；d）怎么判断需要降级？（超时、错误率高、排队过长）4）智能路由：a）实现一个简单的路由器：简单问题 → 小模型，复杂问题 → 大模型；b）怎么判断问题简单还是复杂？（关键词、长度、分类器）；c）成本能省多少？用户体验影响大吗？5）错误处理：a）网络错误、超时、限流分别怎么处理；b）重试策略：指数退避、最多重试几次；c）用户侧怎么提示？（「正在思考...」「网络有点慢，再等等」）6）架构设计：画一个完整的 LLM 应用架构图——从用户请求到最终返回，中间经过哪些组件？每个组件的作用？哪些地方可以优化？",
          deep_dive: "好的 LLM 应用不只是调用 API 而已，背后有一整套工程优化：1）语义缓存为什么重要？LLM 应用里很多问题是重复或相似的。如果能直接返回缓存答案，既能省钱又能提速。语义缓存比精确匹配缓存命中率高很多——比如「怎么学 Python」和「Python 入门方法」意思相近，语义缓存能命中。研究表明，真实场景下语义缓存命中率可达 30-50%，相当于成本减半。2）流式输出的心理效应：流式输出不改变总时间，但用户感觉更快——因为能立刻看到第一个字，有「在动了」的感觉。研究表明，流式输出能显著降低用户的「感知延迟」。这是一个很重要的 UX 技巧。实现方式：SSE（Server-Sent Events）是最常用的，简单可靠；WebSocket 也可以，但更复杂。3）容错是必须的：大模型服务不稳定是常态——a）超时：模型偶尔卡住；b）限流：API 有速率限制；c）错误：5xx 错误时有发生；d）服务不可用：区域性故障。好的应用应该优雅降级而不是直接报错。用户可能不知道「降级了」，但能感受到「还能用」。4）智能路由的分层策略：不是所有请求都需要最强的模型。一个好的策略：a）第一层：缓存（命中直接返回，0 成本）；b）第二层：小模型（处理 70-80% 的简单请求）；c）第三层：大模型（处理剩下的复杂请求）。这样能在几乎不降低质量的前提下，把成本降到 1/3 甚至更低。这就是为什么很多公司说「GPT-4 很好，但我们不用它做所有事」。5）可观测性是标配：LLM 应用要能观测——a）追踪每个请求用了什么模型、花了多少钱、延迟多少；b）记录对话历史，方便排查问题；c）监控用户满意度；d）分析常见问题，持续优化。没有观测，就不知道优化有没有用。6）LLM 应用的「全栈」优化：从底层到顶层——a）模型层：量化、蒸馏（更小的模型）；b）推理层：vLLM、批处理、缓存；c）服务层：智能路由、重试、降级；d）应用层：Prompt 优化、上下文压缩、用户体验设计；e）业务层：选对场景，不是所有事都需要 AI。每一层优化加起来，可能带来 10 倍的成本/体验提升。"
        }, duration: "3小时", resources: [{ title: "GPTCache", url: "https://github.com/zilliztech/GPTCache", required: false }], checkpoint: "能设计完整的 LLM 应用架构，实现缓存、流式、降级等优化" },
      { day: 8, title: "本地推理与边缘部署",
        summary: "学习本地推理框架 llama.cpp，了解大模型本地化部署", content: {
          objective: "今天你将学习本地推理和边缘部署。学完后能用 llama.cpp 在本地跑大模型，理解量化和模型大小的选择，了解移动端和边缘设备推理的现状。",
          key_points: [
            "llama.cpp：纯 C++ 实现的推理框架，CPU 也能跑大模型",
            "GGUF 格式：llama.cpp 用的模型格式，支持各种量化",
            "本地推理的优势：隐私保护、无网络依赖、无 API 成本",
            "模型选择：根据设备性能选合适大小和量化等级的模型",
            "移动端与边缘：手机上跑大模型的现状、挑战和未来"
          ],
          practice: "本地推理实战：1）llama.cpp 入门：a）下载 llama.cpp 并编译；b）下载一个小模型的 GGUF 版（如 Qwen-1.8B 或 TinyLlama）；c）用命令行推理；d）测试不同量化等级（Q4_K_M、Q5_K_M、Q8_0）的速度和质量。2）本地 API 服务：a）用 llama.cpp 的 server 模式启动本地 API；b）和 OpenAI API 兼容吗？c）用 OpenAI 客户端调用本地服务；d）和云端 API 对比速度和成本。3）性能测试：a）测量不同量化下的 tokens/秒；b）你的 CPU/GPU 能跑多大的模型？c）Q4 和 Q8 质量差多少？d）什么情况下你会用本地推理？4）应用场景思考：a）哪些场景适合本地推理？（隐私敏感、无网络、成本敏感）b）哪些场景不适合？（需要超大模型、需要最新知识）c）本地推理的最大挑战是什么？（模型大小、性能、易用性）5）移动端现状调研：a）了解移动端大模型部署的现状；b）有哪些框架（MLC、Qualcomm AI Engine、Core ML）；c）手机上能跑多大的模型？速度如何？d）未来 2-3 年会怎样？6）动手项目（可选）：a）用 llama.cpp 做一个本地聊天机器人；b）或者做一个本地 RAG 系统；c）记录你的体验和思考。",
          deep_dive: "本地推理是一个越来越重要的方向，它关乎隐私、成本和可用性：1）为什么本地推理重要？云端推理有局限——a）隐私：敏感数据不能上传；b）成本：量大的话 API 费用很高；c）网络：没网的地方用不了；d）延迟：本地推理延迟更低。本地推理让 AI 更普惠、更安全、更可控。这也是端侧 AI 是大趋势的原因。2）llama.cpp 的意义：llama.cpp 是一个现象级项目——用纯 C++ 实现，依赖极少，CPU 就能跑。它让「普通人在自己电脑上跑大模型」成为可能。llama.cpp 的 GGUF 格式已经成为本地模型的事实标准。它的成功说明：不是所有人都需要最大的模型，很多场景下小模型 + 本地部署反而更好。3）量化是本地推理的关键：本地设备内存有限，量化是必须的。llama.cpp 支持多种量化：a）Q2_K：极小，速度快，质量损失明显；b）Q4_K_M：甜点，质量不错，体积只有 FP16 的 1/4；c）Q5_K_M：质量更好，体积稍大；d）Q8_0：接近 FP16 质量，体积减半。一般推荐 Q4_K_M，性价比最高。4）CPU vs GPU 推理：llama.cpp 支持 CPU、CUDA、Metal（苹果）等后端。a）CPU：兼容性最好，不需要好显卡，但速度慢；b）GPU/NPU：速度快，但需要硬件支持；c）苹果芯片特别适合：统一内存架构 + Metal 加速，M 系列芯片跑本地模型非常流畅。5）本地推理的挑战：a）模型选择：在有限的硬件下选最合适的模型大小和量化；b）性能优化：怎么让模型跑得更快；c）易用性：对普通用户还是太复杂了；d）模型质量：本地模型通常比云端小，效果差一些。但这些都在快速改善——模型越来越高效（Mistral、Qwen 等小模型很强），硬件越来越强，软件越来越优化。6）端侧 AI 的未来：大模型会越来越「端侧化」——a）手机：现在的旗舰手机已经能跑 7B 模型了，未来会更大更快；b）PC：本地 AI 助手会成为标配；c）IoT/车机：智能设备都有本地 AI 能力；d）隐私计算：数据不出设备，更安全。就像云计算和边缘计算是互补的，云端 AI 和端侧 AI 也会长期共存，各有适用场景。"
        }, duration: "2.5小时", resources: [{ title: "llama.cpp 项目", url: "https://github.com/ggerganov/llama.cpp", required: false }, { title: "The Bloke 模型库", url: "https://huggingface.co/TheBloke", required: false }], checkpoint: "能用 llama.cpp 本地运行大模型，理解本地推理的适用场景" },
      { day: 9, title: "推理成本分析与优化实战",
        summary: "系统化分析推理成本，制定优化策略和方案", content: {
          objective: "今天你将系统化分析推理成本并制定优化策略。学完后能建模推理成本，找出成本瓶颈，设计端到端优化方案，量化评估优化效果。",
          key_points: [
            "成本构成：GPU 硬件成本、云服务费用、带宽、人力、模型训练成本分摊",
            "成本指标：每 1000 token 成本、每次请求成本、每月推理成本",
            "优化 ROI：每个优化措施的成本节省 vs 实施复杂度和风险",
            "成本监控：细粒度的成本追踪，按模型、按用户、按业务线",
            "优化路线图：从易到难的优化优先级和实施路径"
          ],
          practice: "成本分析与优化实战：1）成本建模：a）假设你要部署一个 7B 模型的服务，月活 1 万，平均每个用户每天 50 个请求，每次 500 token 输入 + 200 token 输出；b）用云 GPU 的话，每月成本多少？（查一下云 GPU 价格）c）用本地 GPU 呢？硬件成本 + 电费 + 维护；d）用 API 调用呢？e）哪种方式成本最低？2）成本瓶颈分析：a）推理成本的大头是什么？（GPU 折旧/租金）b）哪些因素影响最大？（模型大小、用量、利用率）c）如果用户量翻 10 倍，成本怎么变？d）如果用 4-bit 量化，成本能省多少？3）优化方案设计：a）列出 5-8 个优化措施（量化、vLLM、缓存、智能路由、小模型等）；b）每个措施估算：能省多少成本？实施难度多大？风险多大？c）按 ROI 排序，制定优化路线图；d）先做什么，后做什么？4）成本监控方案：a）怎么追踪成本？（每个请求的 token 消耗）b）怎么分析？（按用户、按模型、按功能模块）c）怎么告警？（成本超预算告警）d）用什么工具？5）真实案例研究：a）找一个公开的 LLM 成本优化案例；b）他们面临什么问题？c）用了什么优化方法？d）效果如何？e）你能学到什么？6）总结：写一份推理成本优化指南——a）成本怎么算；b）优化的层次和方法；c）推荐的优化路线；d）常见的坑和注意事项。",
          deep_dive: "成本是大模型落地的核心约束，懂成本优化的工程师价值很高：1）推理成本真的很贵吗？我们来算一笔账——a）一个 7B 模型，用 A10G（约 1 元/小时），每秒生成 50 token，一天能生成约 430 万 token，每 1000 token 成本约 0.0056 元；b）如果用 70B 模型，需要 2 张 A100（约 10 元/小时），每秒 30 token，每 1000 token 约 0.09 元；c）如果用 API（GPT-3.5 约 0.012 元/1k token，GPT-4 约 0.3 元/1k token）。自己部署在量大的时候比 API 便宜很多，但量小的时候 API 更划算。2）优化的杠杆效应：优化推理是高杠杆的——假设你每月推理成本 10 万，优化掉 50% 就是每月省 5 万，一年省 60 万。而做优化可能只需要一个工程师几周的时间。这就是为什么推理工程师这么值钱——他们创造的价值远远超过工资。3）优化的优先级：不是所有优化都值得做，按性价比排序：a）第一梯队（最高 ROI）：量化（INT4，成本减半，实施简单）、vLLM（吞吐量 x10，安装即用）、更好的硬件（H100 比 3090 单位成本更低）；b）第二梯队：语义缓存（省 30-50%，需要工程）、智能路由（省 30-70%，需要路由层）、Speculative Decoding（加速 2 倍，需要草稿模型）；c）第三梯队：模型蒸馏（训练一个小模型，效果接近大模型，成本高但回报大）、稀疏/MoE、专用硬件。从第一梯队开始，逐步推进。4）成本与质量的权衡：所有优化都是「用一些质量换成本/速度」。关键是找到「甜点」——质量损失在可接受范围内，成本降到最低。这个点因场景而异——a）客服机器人：质量要求没那么高，可以用更小的模型和更激进的量化；b）医疗/法律：质量要求极高，可能需要大模型 + 高精度；c）创意写作：质量主观，用户可能感知不到量化的损失。5）按需使用的经济学：大模型服务的成本结构和传统软件不一样——a）传统软件：固定成本高（开发），边际成本低（复制）；b）AI 服务：边际成本高（每次调用都要算钱）。这意味着定价很重要——不能无限量用，必须考虑成本。商业模式也要相应调整：按量付费、包月有限量、按次付费等。6）长期趋势：推理成本会持续下降——a）硬件进步：GPU 越来越强，价格越来越便宜；b）模型效率：更好的架构（MoE、SSM）、更好的训练方法；c）算法优化：量化、蒸馏、推理框架的持续改进；d）规模效应：用量越大，单位成本越低。过去 2 年推理成本下降了 10 倍以上，未来还会继续下降。但同时，应用也会越来越多，总量可能反而增长。"
        }, duration: "3小时", resources: [{ title: "LLM 推理成本分析", url: "https://www.baseten.co/blog/llm-inference-costs/", required: false }], checkpoint: "能建模推理成本，制定优化路线图，量化优化效果" },
      { day: 10, title: "推理优化项目实战",
        summary: "综合运用所学，完成一个推理优化项目", content: {
          objective: "今天你将完成一个推理优化综合项目。学完后能从 0 到 1 部署一个生产级推理服务，并完成多轮优化，产出优化报告和文档。",
          key_points: [
            "项目实战：从基线到优化，完整走一遍推理优化流程",
            "性能基线：建立性能基准，量化每一步优化的效果",
            "调优过程：逐步优化，记录每个优化点的收益",
            "项目文档：架构图、性能数据、成本分析、运维指南",
            "知识沉淀：总结经验，形成最佳实践"
          ],
          practice: "推理优化项目实战：1）项目规划：a）选择一个目标模型（7B 级别）；b）定义目标场景（如聊天助手、问答系统）；c）确定评估指标（延迟、吞吐量、成本、质量）；d）制定优化目标（如吞吐量提升 5 倍，成本降低 60%）。2）建立基线：a）用 HuggingFace 原生推理做基线；b）测量基线的延迟、吞吐量、显存占用；c）准备 50 个测试请求；d）记录基线数据。3）逐步优化：a）第一步：开启 KV Cache + 更好的解码策略；b）第二步：INT8/INT4 量化；c）第三步：切换到 vLLM；d）第四步：添加前缀缓存（如果适用）；e）第五步：其他优化（如 Speculative Decoding）。每一步都测性能，记录数据，和基线对比。4）生产化：a）部署成 API 服务（vLLM serve）；b）添加鉴权和限流；c）添加监控（Prometheus + Grafana 或简单的日志）；d）写运维文档（怎么启动、怎么更新、怎么排查问题）。5）项目报告：a）优化前后对比（表格 + 图表）；b）架构图；c）成本分析；d）遇到的坑和解决方案；e）后续优化建议。6）展示与总结：a）准备一个简短的项目展示（PPT 或文档）；b）总结这两周学到了什么；c）推理优化的核心思想是什么；d）你对这个领域的未来怎么看？",
          deep_dive: "通过一个完整项目把知识串起来，才能真正掌握推理优化：1）优化是科学，不是玄学：很多人调优化全靠试，但好的工程师应该有方法论——a）先测量：建立基线，知道现在的性能和瓶颈在哪里；b）再假设：根据瓶颈猜测最可能的优化方向；c）后验证：做实验，看数据，验证假设；d）重复：找到瓶颈，解决它，再找下一个瓶颈。和其他性能优化一样，推理优化也需要「测量 → 分析 → 优化 → 验证」的循环。2）记录和文档化非常重要：优化过程中会做很多实验，每一次都要记录——改了什么、效果如何、为什么有效/无效。这样才能积累经验，下次遇到类似问题就知道怎么做。最终的项目文档不仅是给别人看的，也是给自己的——几个月后你可能忘了当时为什么这么做。3）没有银弹，只有权衡：推理优化没有「最好」的方案，只有「最合适」的方案——a）如果你关心延迟：用更大的 GPU、更小的模型、更短的上下文、少做批处理；b）如果你关心吞吐量：用 vLLM、高批大小、量化、Speculative Decoding；c）如果你关心成本：用小模型、量化、缓存、智能路由、便宜的硬件；d）如果你关心质量：用大模型、高精度（FP16/FP8）、少做激进量化。根据你的优先级选择。4）系统思维：推理优化不只是「让模型跑快点」，而是整个系统的优化——从模型选择、到推理框架、到服务架构、到应用层缓存、到业务场景选择。只优化某一层效果有限，多层结合才能数量级提升。好的推理工程师要有全栈视角。5）持续学习：这个领域变化太快——a）新模型架构（MoE、Mamba）改变推理特性；b）新硬件（H100、H200、MI300）带来新的优化空间；c）新算法（FlashAttention v2、PagedAttention v2、Speculative Decoding 变体）不断涌现；d）新框架（TensorRT-LLM 持续迭代、vLLM 快速更新）。保持学习，关注前沿。6）推理优化的价值：大模型时代，推理就是成本，成本就是竞争力。同样的模型，你能用一半的成本跑，你就有优势。同样的预算，你能提供 10 倍的算力，你的产品体验就更好。推理优化工程师是 AI 时代的「性能魔法师」——用技术把算力压榨到极致，让更多人用得起 AI。"
        }, duration: "4小时", resources: [{ title: "vLLM 性能调优指南", url: "https://docs.vllm.ai/en/latest/performance/performance_tuning.html", required: false }], checkpoint: "完成一个完整的推理优化项目，产出优化报告和生产级部署" },
    ],
  },'''

if old2 in content:
    content = content.replace(old2, new2)
    print('2. llm-inference: OK')
else:
    print('2. llm-inference: NOT FOUND')

with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Part 1 done (llm-prompt + llm-inference)')