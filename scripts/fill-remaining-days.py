with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# =====================================================
# 1. Fill devops-mlops (days 2-5)
# =====================================================
old1 = '''checkpoint: "能用 MLflow 跟踪实验，并在 UI 中对比不同实验的结果" },
    ],
  },
{
    id: "devops-monitoring",'''

new1 = '''checkpoint: "能用 MLflow 跟踪实验，并在 UI 中对比不同实验的结果" },
      { day: 2, title: "模型注册与版本管理",
        summary: "掌握 MLflow Model Registry，实现模型版本化管理", content: {
          objective: "今天你将学习模型注册和版本管理。学完后能用 MLflow Model Registry 管理模型生命周期，理解模型版本、阶段（Staging/Production/Archived），实现模型审批流程。",
          key_points: [
            "Model Registry：模型的版本控制系统，记录每个模型的元数据和版本历史",
            "模型阶段：None → Staging（测试） → Production（生产） → Archived（归档）",
            "模型元数据：版本号、来源实验、指标、参数、标签、描述",
            "模型审批流程：Staging 到 Production 需要审批，防止错误模型上线",
            "模型 lineage：追踪模型从数据、实验、训练到部署的完整链路"
          ],
          practice: "模型注册与版本管理实战：1）注册模型：a）把之前训练的模型注册到 Model Registry；b）添加模型描述和标签；c）理解 Registered Model 和 Model Version 的关系。2）版本管理：a）训练同一个模型的多个版本（用不同超参数）；b）比较不同版本的指标；c）理解版本号和阶段的关系。3）阶段转换：a）把一个版本从 None 转到 Staging；b）模拟审批流程；c）把 Staging 版本转到 Production；d）把旧版本归档。4）模型加载：a）用 mlflow.pyfunc.load_model 加载指定版本的模型；b）用 models:/model-name/Production 加载生产版本；c）理解不同加载方式的区别。5）CI/CD 集成思考：a）怎么把模型注册集成到 CI/CD 流水线？b）训练完自动注册、测试通过自动转 Staging、审批后转 Production。6）对比思考：MLflow Model Registry 和 DVC、Weights & Biases 的模型管理有什么区别？",
          deep_dive: "模型管理是 MLOps 的核心环节，它解决的是「哪个模型该上线」的问题：1）为什么需要模型注册？没有模型注册时，模型文件散落在各处——本地机器、服务器、云存储，没人知道哪个模型效果最好、用的什么数据、什么超参数。模型注册就像代码的 Git，给模型一个「身份证」，记录它的全部信息。2）模型阶段的本质：Staging 相当于「候选模型」，经过验证后才能升到 Production。这和软件的 dev/staging/prod 环境是类似的思想——不能直接把新模型扔到生产，要先验证。3）模型审批流程：在严肃的场景中，模型上线需要审批——数据科学家提交模型，QA 验证效果，审批通过后才能转 Production。MLflow 支持这种流程，但更复杂的审批可能需要自定义。4）多模型管理：实际项目中可能有多个模型——不同版本、不同场景、不同地区的模型。Model Registry 可以统一管理这些模型，知道哪个模型在哪个环境运行。5）模型 lineage：追踪模型的「血统」——用什么数据训练、什么代码、什么超参数、什么环境。这对于模型审计和复现非常重要。如果模型出了问题，可以追溯到源头。6）和其他工具的对比：a）MLflow：开源、简单、够用；b）Weights & Biases：更强大的可视化和协作，但收费；c）DVC：侧重数据和管道版本管理；d）Kubeflow：K8s 原生，更重。根据团队需求选择。"
        }, duration: "3小时", resources: [B_DOCKER_TUTORIAL, { title: "MLflow Model Registry", url: "https://mlflow.org/docs/latest/model-registry.html", required: false }], checkpoint: "能用 MLflow Model Registry 管理模型版本和阶段转换" },
      { day: 3, title: "模型部署与服务化",
        summary: "掌握模型部署的常见方式，实现模型在线服务", content: {
          objective: "今天你将学习模型部署和服务化。学完后能用多种方式部署模型（FastAPI、TorchServe、BentoML），理解在线推理和批量推理的区别，掌握模型部署的最佳实践。",
          key_points: [
            "部署方式：REST API（FastAPI/Flask）、专用推理服务（TorchServe/Triton）、Serverless、边缘部署",
            "在线推理 vs 批量推理：在线是实时低延迟，批量是高吞吐量离线处理",
            "模型优化：量化（INT8/FP16）、剪枝、蒸馏、ONNX 转换，提升推理速度",
            "部署架构：负载均衡 + 多实例 + GPU 调度 + 自动扩缩容",
            "A/B 测试和灰度发布：新模型先放小流量验证，没问题再全量"
          ],
          practice: "模型部署实战：1）FastAPI 部署：a）用 FastAPI 写一个模型推理 API；b）加载 MLflow 注册的模型；c）实现 /predict 端点，接收输入返回预测；d）用 uvicorn 启动，测试 API。2）模型优化：a）把 PyTorch 模型转成 ONNX 格式，对比推理速度；b）试试 FP16 半精度推理；c）（可选）试试 INT8 量化。3）Docker 部署：a）写 Dockerfile 打包模型服务；b）构建镜像并运行；c）测试容器内的服务。4）负载测试：a）用 locust 或 ab 做压力测试；b）测量 QPS、延迟、资源占用；c）找到性能瓶颈。5）多实例部署（可选）：a）用 docker-compose 启动多个实例；b）用 nginx 做负载均衡；c）测试并发性能。6）对比不同部署方案：a）FastAPI vs TorchServe vs BentoML，各自优缺点？b）什么场景用什么方案？",
          deep_dive: "模型部署是 MLOps 中连接「训练」和「使用」的桥梁，有很多工程细节：1）部署方式的选择：a）FastAPI/Flask：最简单灵活，适合小规模和原型；b）TorchServe/Triton：专用推理服务，支持动态批处理、多模型管理、GPU 共享，适合大规模生产；c）Serverless（AWS Lambda/Cloud Run）：按需启动，适合低流量场景，但有冷启动延迟；d）边缘部署：在手机、IoT 设备上运行，需要模型压缩。2）动态批处理（Dynamic Batching）：推理服务的关键优化——在一定时间窗口内收集多个请求，组成一个 batch 一起推理，大幅提升 GPU 利用率和吞吐量。Triton 和 TorchServe 都支持。3）GPU 调度：GPU 是稀缺资源，多个模型共享 GPU 需要合理调度。技术：a）多模型共享 GPU（MPS）；b）时间片轮转；c）按需加载/卸载模型。4）模型优化的层次：a）算法层：用更高效的模型架构（如 DistilBERT 代替 BERT）；b）框架层：用 ONNX Runtime、TensorRT 等优化推理引擎；c）硬件层：量化、剪枝降低计算量；d）系统层：批处理、缓存、异步。5）A/B 测试和灰度发布：模型上线不是一锤子买卖——a）先在 Staging 环境验证；b）灰度发布：5% 流量到新模型，观察指标；c）A/B 测试：对比新旧模型的效果；d）全量发布或回滚。6）成本优化：推理是大头成本，优化方法：a）选合适的模型大小（能用小模型就不用大模型）；b）量化压缩；c）批处理提高利用率；d）自动扩缩容（流量低时减少实例）；e）Spot Instance（用低价闲置算力）。"
        }, duration: "3小时", resources: [B_DOCKER_TUTORIAL, R_FASTAPI, { title: "TorchServe", url: "https://pytorch.org/serve/", required: false }, { title: "ONNX Runtime", url: "https://onnxruntime.ai/", required: false }], checkpoint: "能用 FastAPI + Docker 部署模型服务，并完成压力测试" },
      { day: 4, title: "模型监控与持续训练",
        summary: "掌握模型监控指标和持续训练（CT）机制", content: {
          objective: "今天你将学习模型监控和持续训练。学完后能监控模型的在线表现，检测数据漂移和概念漂移，设计持续训练（CT）流水线，实现模型的自动迭代。",
          key_points: [
            "模型监控指标：预测分布、输入分布、延迟、吞吐量、业务指标",
            "数据漂移（Data Drift）：输入数据分布发生变化，模型效果可能下降",
            "概念漂移（Concept Drift）：输入和输出的关系发生变化，模型需要更新",
            "持续训练（CT）：自动检测漂移 → 触发重训练 → 验证 → 部署，实现模型自迭代",
            "监控工具：Prometheus + Grafana、Evidently AI、Arize、WhyLabs"
          ],
          practice: "模型监控与持续训练实战：1）模型监控设计：a）设计你的模型监控方案——监控哪些指标？阈值多少？告警怎么发？b）在 FastAPI 服务中添加监控指标收集；c）用 Prometheus 收集指标，Grafana 可视化。2）数据漂移检测：a）用 Evidently AI 或 alibi-detect 库；b）准备一份「参考数据」（训练时的数据分布）和「当前数据」（线上新数据）；c）计算分布差异，检测是否漂移；d）可视化漂移报告。3）概念漂移检测（可选）：a）如果有线上标注数据，检测模型准确率是否下降；b）用 ADWIN、DDM 等算法检测概念漂移。4）持续训练流水线设计：a）设计 CT 流水线——什么时候触发重训练？用什么数据？怎么验证？怎么部署？b）画出完整流程图。5）自动化触发实现（可选）：a）用 GitHub Actions 定时检查数据漂移；b）如果漂移超过阈值，自动触发重训练；c）训练完成后自动评估，效果达标自动部署。6）思考：a）持续训练和 CI/CD 有什么相似之处？b）为什么说 CT 是 MLOps 的最高阶段？",
          deep_dive: "模型上线不是结束，而是开始。模型会「老化」，需要持续监控和更新：1）为什么模型会变差？这是机器学习系统和传统软件最大的区别——传统软件不会因为时间推移而变差，但 ML 模型会。原因：a）数据漂移：用户行为变了、市场环境变了、季节性变化等，导致输入分布和训练时不一致；b）概念漂移：输入和输出的关系变了，比如疫情改变了消费模式；c）上游数据变化：数据源格式变了、特征工程 pipeline 有 bug 等。2）数据漂移 vs 概念漂移：数据漂移是 P(X) 变了，概念漂移是 P(Y|X) 变了。数据漂移不一定影响效果（如果决策边界没变），但概念漂移一定影响效果。检测方法：a）统计检验：KS 检验、卡方检验、PSI（Population Stability Index）；b）距离度量：Wasserstein 距离、KL 散度；c）基于模型的方法：训练一个判别器区分新旧数据。3）持续训练的挑战：CT 听起来很美好，但实现有很多挑战：a）数据质量：新数据可能有噪音、标注延迟；b）训练成本：每次重训练都要消耗算力；c）效果验证：怎么确认新模型比旧模型好？A/B 测试需要时间；d）回滚机制：新模型效果不好要能快速回滚；e）数据版本管理：每次训练用的数据要可追溯。4）监控的层次：a）系统监控：CPU/GPU 利用率、内存、延迟、吞吐量（和传统软件一样）；b）ML 监控：预测分布、输入分布、特征分布、模型置信度；c）业务监控：业务指标（如点击率、转化率），这是最终目标。三层监控要结合看。5）告警设计：a）什么情况告警？阈值多少？b）告警给谁？怎么告警？（Slack/钉钉/邮件）；c）告警频率不能太高，否则大家会忽略（告警疲劳）；d）区分紧急和非紧急告警。6）MLOps 的成熟度模型：Google 定义了 MLOps 的三个级别——a）Level 0：手动训练、手动部署，没有 CI/CD；b）Level 1：有 ML pipeline，自动化训练，但部署是手动的；c）Level 2：CI/CD + CT，完全自动化的训练和部署。大多数团队在 Level 0 和 Level 1 之间，Level 2 是目标。"
        }, duration: "3小时", resources: [B_DOCKER_TUTORIAL, { title: "Evidently AI", url: "https://www.evidentlyai.com/evidently", required: false }, { title: "Google MLOps 指南", url: "https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning", required: false }], checkpoint: "能实现模型监控和数据漂移检测，设计持续训练流水线" },
      { day: 5, title: "MLOps 综合实战与最佳实践",
        summary: "综合运用 MLOps 知识，搭建端到端 ML 系统", content: {
          objective: "今天你将综合运用 MLOps 的全部知识，搭建一个端到端的 ML 系统。学完后能设计完整的 MLOps 架构，理解各组件如何协作，掌握 MLOps 的最佳实践。",
          key_points: [
            "端到端 MLOps 架构：数据 → 实验 → 训练 → 注册 → 部署 → 监控 → 再训练",
            "MLOps 工具链选型：根据团队规模和需求选择合适的工具组合",
            "Feature Store：特征存储，统一离线和在线特征，保证一致性",
            "MLOps 最佳实践：可复现、可追溯、可监控、可回滚、自动化",
            "团队协作：数据科学家、ML 工程师、DevOps、业务方的协作模式"
          ],
          practice: "MLOps 综合实战项目：1）项目规划：选择一个 ML 项目（如情感分析、图像分类），设计完整的 MLOps 方案。2）数据管理：a）用 DVC 做数据版本管理；b）设计数据 pipeline（采集 → 清洗 → 特征工程）；c）（可选）用 Feast 搭建简单的 Feature Store。3）实验管理：a）用 MLflow 跟踪所有实验；b）记录超参数、指标、模型；c）对比不同实验，选最优模型。4）CI/CD 流水线：a）用 GitHub Actions 搭建 ML pipeline；b）代码提交 → 数据验证 → 训练 → 评估 → 注册；c）模型注册到 MLflow Model Registry。5）部署与监控：a）用 FastAPI + Docker 部署模型；b）添加 Prometheus 监控；c）实现简单的漂移检测。6）文档与总结：a）写一份 MLOps 架构文档；b）画出完整流程图；c）总结你这两周学到的 MLOps 知识；d）思考：你的团队在 MLOps 的哪个级别？怎么提升？",
          deep_dive: "MLOps 是一个系统工程，不是单个工具或技术，而是一套方法论：1）MLOps 的本质：MLOps 的目标不是用最多的工具，而是用最少的工具解决问题。很多团队一上来就想用 Kubeflow、MLflow、Feast、Seldon 全家桶，结果维护成本太高。正确的做法是：从最痛的点开始，用最简单的工具解决，逐步迭代。2）Feature Store 的价值：Feature Store 解决「训练-服务偏差」问题——训练时用的特征和线上推理时用的特征不一致，导致效果下降。Feature Store 统一管理特征，保证离线训练和在线推理用同一套特征逻辑。知名工具：Feast、Tecton、Hopsworks。3）可复现性是基石：MLOps 的核心是可复现——任何人、任何时候、用同样的代码和数据，应该得到同样的结果。这需要：a）代码版本管理（Git）；b）数据版本管理（DVC）；c）环境版本管理（Docker）；d）实验记录（MLflow）。四者缺一不可。4）自动化是目标：MLOps 的最终目标是自动化——从数据到模型到部署，尽量减少人工干预。但自动化是逐步实现的：a）先自动化训练 pipeline；b）再自动化部署；c）最后自动化监控和重训练。每一步都要验证可靠性。5）团队协作：MLOps 涉及多个角色——a）数据科学家：负责模型和实验；b）ML 工程师：负责 pipeline 和部署；c）DevOps/SRE：负责基础设施；d）数据工程师：负责数据管道。好的 MLOps 让每个角色专注于自己的部分，通过自动化流水线协作。6）MLOps 的未来：a）AutoML：自动选择模型和超参数；b）LLM Ops：大模型的运维（prompt 版本管理、A/B 测试、成本控制）；c）实时 ML：流式数据处理和实时推理；d） Responsible AI：公平性、可解释性、隐私保护的工程化。MLOps 是一个快速发展的领域，保持学习和实践很重要。"
        }, duration: "4小时", resources: [B_DOCKER_TUTORIAL, { title: "Feast Feature Store", url: "https://docs.feast.dev/", required: false }, { title: "DVC 文档", url: "https://dvc.org/doc", required: false }], checkpoint: "完成一个端到端的 MLOps 项目，包含数据管理、实验跟踪、CI/CD、部署和监控" },
    ],
  },
{
    id: "devops-monitoring",'''

if old1 in content:
    content = content.replace(old1, new1)
    print('1. devops-mlops: OK')
else:
    print('1. devops-mlops: NOT FOUND')

# =====================================================
# 2. Fill project-rag-app (days 2-5)
# =====================================================
old2 = '''checkpoint: "完成项目架构设计和技术选型，搭建好项目框架" },
    ],
  },

  // =====================================================
  // Node: project-cv-classification'''

new2 = '''checkpoint: "完成项目架构设计和技术选型，搭建好项目框架" },
      { day: 2, title: "文档处理与向量化",
        summary: "实现文档解析、分块、Embedding 和向量存储", content: {
          objective: "今天你将实现 RAG 系统的核心——文档处理和向量化。学完后能解析多种格式的文档、设计分块策略、生成 Embedding、存入向量数据库，完成知识库的构建。",
          key_points: [
            "文档解析：PDF、Markdown、HTML、Word 等格式的解析方法",
            "分块策略（Chunking）：固定长度、按段落、按语义、递归分块，平衡上下文和精度",
            "Embedding 生成：选择合适的 Embedding 模型，批量生成向量",
            "向量数据库：Chroma/FAISS/Milvus 的使用，索引构建和相似度搜索",
            "元数据管理：为每个 chunk 存储来源、页码等元数据，方便溯源"
          ],
          practice: "文档处理与向量化实战：1）文档解析：a）用 LangChain 的 DocumentLoader 或 Unstructured 库解析 PDF/Markdown/HTML；b）处理表格、图片等复杂内容；c）清洗文本（去除多余空行、特殊字符）。2）分块策略实验：a）固定长度分块（如 500 字符，重叠 50）；b）按段落分块；c）递归分块（先按段落，太长再按句子）；d）对比不同分块策略对检索效果的影响。3）Embedding 生成：a）选择 Embedding 模型（如 BGE、M3E、OpenAI text-embedding-3）；b）批量生成 Embedding；c）测试 Embedding 质量（语义相似的句子向量是否接近）。4）向量数据库：a）用 Chroma 或 FAISS 存储向量；b）构建索引；c）实现相似度搜索——输入查询，返回 top-k 最相关的 chunk。5）检索质量评估：a）准备 10 个查询和人工标注的相关文档；b）计算 Recall@k 和 MRR；c）分析检索失败的原因。6）优化迭代：a）调整分块大小和重叠；b）尝试不同的 Embedding 模型；c）添加元数据过滤。",
          deep_dive: "文档处理和向量化是 RAG 系统的基础，质量直接决定最终效果：1）分块是 RAG 最重要的环节之一：分块太大——包含太多无关信息，检索精度下降；分块太小——丢失上下文，生成质量下降。好的分块策略应该：a）保持语义完整性（不要把一句话切断）；b）大小适中（通常 200-500 token）；c）有重叠（通常 50-100 token），避免边界信息丢失。2）高级分块策略：a）按结构分块：尊重文档的标题、段落、列表结构；b）语义分块：用模型判断语义边界，在主题转换处分块；c）父子分块：小块检索、大块生成——检索时用小 chunk 精准匹配，生成时返回包含上下文的大 chunk。3）Embedding 模型的选择：a）多语言：BGE-M3、multilingual-e5；b）中文：BGE-zh、M3E；c）英文：text-embedding-3、all-MiniLM；d）考虑维度、速度、效果的平衡。4）向量数据库选型：a）Chroma：轻量，适合原型；b）FAISS：Facebook 开源，单机高性能；c）Milvus：分布式，适合大规模；d）Qdrant：Rust 写的，高性能；e）Pinecone：云服务，免运维。5）混合检索：纯向量检索可能漏掉关键词匹配很重要的场景。混合检索 = 向量检索 + 关键词检索（BM25），效果通常更好。6）重排序（Rerank）：检索阶段先召回 top-20，然后用 Cross-Encoder 重排序，取 top-5。Rerank 模型（如 BGE-Reranker）比双塔模型更准确，但速度慢，所以用在第二阶段。"
        }, duration: "3小时", resources: [{ title: "LangChain 文档加载", url: "https://python.langchain.com/docs/modules/data_connection/document_loaders/", required: false }, { title: "Chroma 文档", url: "https://docs.trychroma.com/", required: false }], checkpoint: "完成文档解析、分块、向化和向量存储，实现基本的检索功能" },
      { day: 3, title: "检索增强生成与 Prompt 工程",
        summary: "实现完整的 RAG 流程，优化 Prompt 和生成质量", content: {
          objective: "今天你将实现完整的 RAG 流程并优化生成质量。学完后能把检索和生成串联起来，设计好的 Prompt，处理上下文不足的情况，评估 RAG 系统的效果。",
          key_points: [
            "RAG 完整流程：查询 → 检索 → 构建 Prompt → LLM 生成 → 返回答案",
            "Prompt 工程：如何组织检索到的上下文，引导模型基于上下文回答",
            "查询改写：对用户查询进行改写或扩展，提升检索召回率",
            "上下文管理：处理上下文过长、上下文冲突、无相关知识的情况",
            "答案溯源：标注答案来源，让用户可以验证"
          ],
          practice: "RAG 核心实现与优化：1）基础 RAG 实现：a）把检索和生成串联起来；b）设计基础 Prompt：「基于以下上下文回答问题：{context}\\n问题：{question}」；c）用 LLM 生成答案；d）测试几个问题，看效果。2）Prompt 优化：a）明确指示模型「只基于上下文回答，不知道就说不知道」；b）要求模型标注引用来源；c）设计不同类型的 Prompt（简洁版、详细版、思维链版）；d）对比不同 Prompt 的效果。3）查询改写：a）实现查询扩展——用 LLM 把用户查询改写成多个变体；b）实现 HyDE（Hypothetical Document Embeddings）——先让 LLM 生成假设答案，用假设答案检索；c）对比改写前后的检索效果。4）上下文处理：a）如果检索到的 chunk 太多，怎么选择和裁剪？b）如果多个 chunk 信息冲突，怎么处理？c）如果没有检索到相关知识，怎么回答？5）答案溯源：a）在答案中标注每个信息来自哪个文档的哪个部分；b）在前端展示来源链接。6）效果评估：a）准备 20 个问题和标准答案；b）评估答案的准确性、完整性、相关性；c）分析 bad case，找出改进方向。",
          deep_dive: "RAG 的核心不在检索或生成，而在于两者的结合——怎么让检索到的信息最好地辅助生成：1）Prompt 是连接检索和生成的桥梁：好的 Prompt 应该：a）明确角色和任务：「你是一个知识库问答助手，请基于提供的上下文回答问题」；b）提供清晰的结构：上下文、问题、要求分开；c）防止幻觉：「如果上下文中没有相关信息，请说不知道」；d）要求溯源：「请在答案中标注信息来源」。2）查询改写的重要性：用户的查询往往不是最优的检索 query——可能太短、太模糊、有歧义。查询改写技术：a）查询扩展：用同义词、相关词扩展查询；b）查询分解：把复杂问题分解成子问题；c）HyDE：先生成假设答案再检索，因为答案和文档的语义更接近；d）多查询：生成多个查询变体，分别检索后合并结果。3）上下文窗口管理：大模型的上下文窗口有限（4K-128K token），需要合理管理：a）检索 top-k 个 chunk，但不要全塞进去——筛选最相关的；b）按相关性排序，最重要的放前面；c）如果超长，截断或压缩；d）用 Long Context 模型（如 Claude 200K）可以放更多上下文，但成本更高。4）处理「不知道」的情况：RAG 系统最重要但最容易被忽略的功能——当知识库中没有相关信息时，应该说「我不知道」而不是编造答案。实现方法：a）Prompt 约束；b）检索置信度阈值——如果检索分数太低，直接返回「不知道」；c）生成后验证——检查答案是否真的来自上下文。5）RAG 的评估：RAG 评估比传统模型复杂，需要评估检索和生成两个环节：a）检索指标：Recall@k、MRR、NDCG；b）生成指标：答案准确性、相关性、完整性、幻觉率；c）端到端指标：用户满意度；d）工具：Ragas、TruLens 等专门评估 RAG 的工具。6）高级 RAG 技巧：a）Self-RAG：模型自己决定要不要检索、检索结果相不相关；b）Corrective RAG：检索后先评估质量，质量差的话用 web 搜索补充；c）Adaptive RAG：根据问题复杂度选择不同策略。这些是 RAG 的前沿研究方向。"
        }, duration: "3小时", resources: [{ title: "LangChain RAG 教程", url: "https://python.langchain.com/docs/use_cases/question_answering/", required: false }, { title: "Ragas 评估框架", url: "https://github.com/explodinggradients/ragas", required: false }], checkpoint: "实现完整的 RAG 流程，包含查询改写、Prompt 优化和答案溯源" },
      { day: 4, title: "RAG 系统优化与进阶",
        summary: "深入优化 RAG 系统：混合检索、重排序、多模态、评估", content: {
          objective: "今天你将深入优化 RAG 系统。学完后能实现混合检索、重排序、多轮对话、多模态 RAG 等进阶功能，建立完整的 RAG 评估体系。",
          key_points: [
            "混合检索：向量检索 + 关键词检索（BM25），取长补短",
            "重排序（Rerank）：用 Cross-Encoder 对召回结果重排，提升精度",
            "多轮对话 RAG：维护对话历史，结合当前问题检索",
            "多模态 RAG：支持图片、表格等非文本内容的检索和生成",
            "RAG 评估体系：检索质量、生成质量、端到端效果的综合评估"
          ],
          practice: "RAG 进阶优化实战：1）混合检索：a）用 BM25 做关键词检索；b）用向量做语义检索；c）融合两路结果（RRF 或加权融合）；d）对比混合检索和纯向量检索的效果。2）重排序：a）用 BGE-Reranker 或 Cohere Rerank 对 top-20 结果重排；b）取 top-5 给生成模型；c）对比重排前后的效果。3）多轮对话：a）维护对话历史；b）用 LLM 把当前问题和历史结合，生成检索 query；c）测试多轮对话场景。4）多模态 RAG（可选）：a）用多模态 Embedding 模型（如 CLIP）编码图片；b）实现图文混合检索；c）测试图片问答。5）评估体系：a）用 Ragas 评估——faithfulness（忠实度）、answer relevancy（答案相关性）、context precision（上下文精度）、context recall（上下文召回）；b）对比优化前后的指标。6）性能优化：a）缓存常见查询的结果；b）异步检索和生成；c）流式输出，让用户更快看到部分结果。",
          deep_dive: "RAG 优化是一个系统工程，需要在多个环节同时发力：1）混合检索的原理：向量检索擅长语义匹配（「怎么训练狗」能匹配到「犬类训练方法」），但不擅长精确匹配（搜「Error 404」可能搜不到）。BM25 关键词检索擅长精确匹配，但不理解语义。两者结合可以取长补短。融合方法：a）RRF（Reciprocal Rank Fusion）：按排名的倒数融合，简单有效；b）加权融合：把两路的分数归一化后加权求和。2）Rerank 的价值：检索阶段用的是双塔模型（Bi-Encoder），查询和文档独立编码，速度快但精度有限。Rerank 阶段用 Cross-Encoder，查询和文档一起编码，精度更高但速度慢。两阶段策略：Bi-Encoder 召回 top-20，Cross-Encoder 精排 top-5，兼顾速度和精度。3）多轮对话的挑战：用户可能在后续问题中用代词或省略——「他的出生日期是什么？」中的「他」指谁？解决方法：a）用 LLM 做查询改写，把代词替换成具体实体；b）把对话历史也作为上下文检索。4）多模态 RAG：很多文档包含图片、表格、图表，纯文本 RAG 会丢失这些信息。多模态 RAG 的方法：a）用多模态 Embedding（CLIP、Unified-VLP）编码图片；b）用多模态 LLM（GPT-4V、Claude 3）理解图片；c）表格可以用 Text-to-SQL 或专门表格理解模型。5）RAG 评估的维度：a）检索环节：上下文精度（检索到的有多少是相关的）、上下文召回（相关的有多少被检索到）；b）生成环节：忠实度（答案是否基于上下文，有没有幻觉）、答案相关性（答案是否回答了问题）；c）端到端：用户满意度、任务完成率。Ragas 框架提供了这些指标的自动化评估方法。6）RAG 的成本优化：RAG 系统的成本主要来自 LLM 调用——a）用小模型做简单任务（如查询改写），大模型做复杂任务；b）缓存常见查询；c）控制上下文长度，减少 token 消耗；d）用开源模型替代 API 模型。"
        }, duration: "3小时", resources: [{ title: "Cohere Rerank", url: "https://docs.cohere.com/docs/reranking", required: false }, { title: "BGE Reranker", url: "https://huggingface.co/BAAI/bge-reranker-large", required: false }], checkpoint: "实现混合检索、重排序和多轮对话，建立 RAG 评估体系" },
      { day: 5, title: "RAG 项目部署与展示",
        summary: "部署 RAG 系统，构建前端界面，完成项目展示", content: {
          objective: "今天你将完成 RAG 项目的部署和展示。学完后能用 FastAPI 构建 RAG 后端 API，用 Streamlit/Gradio 构建前端界面，用 Docker 容器化部署，产出可展示的作品。",
          key_points: [
            "后端 API：FastAPI 构建 RAG 服务，支持流式输出",
            "前端界面：Streamlit/Gradio 构建聊天界面，展示来源",
            "Docker 部署：容器化 RAG 系统，支持一键部署",
            "项目文档：README、架构图、使用说明、效果展示",
            "作品展示：准备 Demo 演示，突出技术亮点和实用价值"
          ],
          practice: "RAG 项目部署与展示：1）后端 API 完善：a）用 FastAPI 封装 RAG 流程；b）支持流式输出（SSE），让用户看到逐字生成；c）添加会话管理，支持多轮对话；d）错误处理和参数验证。2）前端界面：a）用 Streamlit 或 Gradio 构建聊天界面；b）展示答案来源（点击可跳转到原文档）；c）支持文件上传（构建自己的知识库）；d）显示检索到的上下文（可选，增加透明度）。3）Docker 部署：a）写 Dockerfile 打包 RAG 服务；b）用 docker-compose 编排（API + 向量数据库 + 前端）；c）测试部署。4）项目文档：a）写 README——项目简介、功能、技术栈、安装使用、架构图；b）写设计文档——技术选型理由、架构设计、优化方案；c）准备 Demo 脚本——展示核心功能。5）测试与优化：a）端到端测试，确保各环节正常；b）性能优化（缓存、异步）；c）准备几个好的 Demo 问题和答案。6）总结复盘：a）总结 RAG 的核心技术；b）你做了哪些优化？效果如何？c）还有什么可以改进？d）这个项目能用在什么场景？",
          deep_dive: "一个完整的 RAG 项目不只是技术实现，还需要考虑用户体验和工程化：1）用户体验设计：好的 RAG 应用应该让用户感觉「自然」——a）流式输出：让用户看到逐字生成，不用等；b）答案溯源：展示来源，增加可信度；c）相关推荐：在回答后推荐相关问题；d）反馈机制：让用户可以点赞/点踩，收集数据持续改进。2）知识库管理：实际应用中，知识库需要持续更新——a）支持增量添加文档；b）文档更新时自动重新向量化；c）文档删除时同步删除向量；d）支持多种文档格式。3）多租户和权限：如果是企业应用，需要考虑——a）不同用户看到不同的知识库；b）权限控制（谁能看、谁能编辑）；c）审计日志。4）性能和成本：a）缓存：相同问题直接返回缓存答案；b）异步：检索和生成分开，不阻塞；c）模型选择：简单问题用小模型，复杂问题用大模型；d）批量处理：高并发时批量处理请求。5）RAG 项目的亮点：在简历或展示中，好的 RAG 项目应该突出：a）技术深度：不只是调 API，而是深入理解每个环节并优化；b）工程能力：完整的部署和监控；c）效果评估：有量化的评估指标；d）实际价值：解决真实问题。6）RAG 的未来：RAG 技术在快速发展——a）GraphRAG：用知识图谱增强检索；b）Agentic RAG：用 Agent 做多步检索和推理；c）多模态 RAG：支持图片、视频、音频；d）个性化 RAG：根据用户画像定制答案。保持关注前沿，持续优化你的项目。"
        }, duration: "4小时", resources: [R_FASTAPI, R_STREAMLIT, R_GRADIO], checkpoint: "完成 RAG 项目部署，产出可演示的作品和完整文档" },
    ],
  },

  // =====================================================
  // Node: project-cv-classification'''

if old2 in content:
    content = content.replace(old2, new2)
    print('2. project-rag-app: OK')
else:
    print('2. project-rag-app: NOT FOUND')

# =====================================================
# 3. Fill project-cv-classification (days 2-5)
# =====================================================
old3 = '''checkpoint: "完成项目选题、数据集准备和数据分析，构建好数据加载 pipeline" },
    ],
  },

  // =====================================================
  // Node: project-llm-agent'''

new3 = '''checkpoint: "完成项目选题、数据集准备和数据分析，构建好数据加载 pipeline" },
      { day: 2, title: "模型训练与迁移学习",
        summary: "使用迁移学习训练图像分类模型，掌握训练技巧", content: {
          objective: "今天你将训练图像分类模型。学完后能用预训练模型做迁移学习，掌握训练技巧（学习率调度、早停、数据增强），理解过拟合的诊断和处理。",
          key_points: [
            "迁移学习：用 ImageNet 预训练模型初始化，在自己的数据上微调",
            "常用模型：ResNet、EfficientNet、ViT、ConvNeXt，各有优劣",
            "训练技巧：学习率预热、余弦退火、差异化学习率（底层小、顶层大）",
            "过拟合诊断：训练集 vs 验证集曲线、学习曲线分析",
            "超参数调优：学习率、batch size、权重衰减、Dropout 比例"
          ],
          practice: "模型训练实战：1）迁移学习基线：a）用 torchvision.models 加载预训练 ResNet50；b）替换最后的分类层；c）用默认超参数训练，建立基线。2）训练技巧实验：a）学习率预热（前 5 epoch 线性增加）；b）余弦退火学习率调度；c）差异化学习率（backbone 1e-4，分类头 1e-3）；d）对比效果。3）数据增强：a）基础增强（翻转、旋转、裁剪）；b）高级增强（Mixup、CutMix、Random Erasing）；c）对比有增强和无增强的效果。4）过拟合处理：a）观察训练曲线，判断是否过拟合；b）加 Dropout、增加权重衰减；c）早停——验证集效果不再提升就停止；d）冻结底层，只训练顶层。5）模型对比：a）ResNet50 vs EfficientNet-B0 vs ViT；b）对比效果、速度、显存占用；c）选最适合你的场景的模型。6）实验记录：用 MLflow 或简单的日志记录每次实验的超参数和结果，方便对比。",
          deep_dive: "训练一个好模型需要理解很多细节，不是简单调参：1）迁移学习为什么有效？ImageNet 预训练模型已经学会了通用的视觉特征（边缘、纹理、形状、物体部件），这些特征对大多数视觉任务都有用。迁移学习相当于「站在巨人的肩膀上」，用少量数据就能达到好效果。2）微调策略的选择：a）全部微调：解冻所有层，用较小学习率训练。效果通常最好，但容易过拟合（小数据集）；b）冻结 backbone，只训练分类头：最安全，但效果可能不如全部微调；c）渐进式解冻：先训练分类头几轮，再逐层解冻。建议从简单策略开始，根据效果调整。3）学习率是最重要的超参数：a）太大：训练不稳定，效果差；b）太小：收敛慢，可能困在局部最优；c）迁移学习的经验值：backbone 1e-4 到 1e-3，分类头 1e-3 到 1e-2；d）用学习率查找器（LR Finder）找最优范围。4）数据增强的哲学：数据增强不只是「加噪音」，而是「模拟真实场景中可能的变化」——翻转（物体可能朝左或朝右）、旋转（相机可能倾斜）、色彩变化（光照条件不同）。好的增强让模型学到不变性特征。5）过拟合的全面诊断：a）训练集准确率远高于验证集 → 过拟合；b）训练损失还在降但验证损失开始升 → 过拟合；c）处理方法优先级：先加数据（或增强）→ 再加正则化（Dropout、权重衰减）→ 最后考虑简化模型。6）模型选择的艺术：不是模型越大越好——a）ResNet50：经典可靠，部署友好；b）EfficientNet：参数效率高，但训练慢；c）ViT：效果最好，但需要大数据集；d）MobileNet：轻量级，适合边缘部署。根据你的数据量、算力、部署环境选择。"
        }, duration: "3小时", resources: [R_PYTORCH_TUT, R_CS231N, { title: "PyTorch 迁移学习教程", url: "https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html", required: false }], checkpoint: "训练出效果合理的分类模型，掌握训练技巧和过拟合处理" },
      { day: 3, title: "模型评估与错误分析",
        summary: "全面评估模型效果，深入分析错误，找到改进方向", content: {
          objective: "今天你将全面评估模型并做错误分析。学完后能使用多种评估指标，分析模型在哪些类别/样本上出错，理解模型的可解释性（Grad-CAM），找到具体的改进方向。",
          key_points: [
            "评估指标：准确率、精确率、召回率、F1、混淆矩阵、每类指标",
            "错误分析：找出错误样本，分类错误类型（混淆类、边界错误、标注错误）",
            "模型可解释性：Grad-CAM 可视化模型关注区域，理解决策依据",
            "困难样本挖掘：找出模型最不确定的样本，针对性改进",
            "交叉验证：k-fold 交叉验证，更可靠地评估模型效果"
          ],
          practice: "模型评估与错误分析实战：1）全面评估：a）计算整体准确率、每类 P/R/F1；b）画混淆矩阵，找出容易混淆的类别对；c）分析类别不平衡的影响。2）错误分析：a）收集所有分类错误的样本；b）按错误类型分类——是类间相似？还是样本质量问题？还是标注错误？c）可视化错误样本，找规律。3）Grad-CAM 可视化：a）用 grad-cam 库生成热力图；b）看模型关注图片的哪个区域做决策；c）对比正确和错误样本的 Grad-CAM，看有什么不同。4）困难样本分析：a）找出模型预测置信度低（如 0.4-0.6）的样本；b）找出模型高置信度但预测错误的样本（最危险）；c）分析这些样本的特点。5）改进方案设计：a）针对混淆类——增加这些类的训练数据或增强；b）针对困难样本——重新标注或删除噪声样本；c）针对模型弱点——调整损失函数（如 Focal Loss）。6）实验验证：a）实施你的改进方案；b）对比改进前后的效果；c）记录实验结果。",
          deep_dive: "错误分析是提升模型效果最有效的方法之一，但很多人忽略它：1）为什么错误分析比调参更重要？很多人花大量时间调超参数，效果提升有限。而错误分析能直接告诉你问题在哪——是数据问题？还是模型问题？还是标注问题？针对性地解决，效果提升往往更显著。2）混淆矩阵的解读：混淆矩阵不仅看对角线（正确分类），更要看非对角线（错误分类）——哪些类别最容易混淆？为什么混淆？是视觉相似（猫和狗）？还是数据不平衡导致少数类被忽略？3）Grad-CAM 的直觉：Grad-CAM 通过反向梯度计算每个像素对预测结果的贡献，生成热力图。如果模型关注的是物体的关键部位（如狗的脸），说明学到了有意义的特征；如果关注的是背景（如草地），可能是学到了捷径（shortcut learning），泛化能力差。4）困难样本的价值：困难样本是模型提升的空间——a）模型不确定的样本：可能是边界样本或标注模糊，值得重点关注；b）高置信度错误：最危险，可能是数据有标注错误或模型有系统性偏差；c）主动学习：选最有价值的困难样本给专家标注，提升数据效率。5）数据质量 vs 模型能力：很多「模型问题」其实是「数据问题」——a）标注不一致：不同标注者标准不同；b）标注错误：人工标注有 5-10% 的错误率；c）数据偏差：某些场景的样本太少。花时间提升数据质量，往往比换更大的模型更有效。6）可解释性的价值：在医疗、安全等关键场景，可解释性是必须的——a）合规要求：GDPR 要求解释自动决策；b）用户信任：医生需要知道模型为什么这么判断；c）调试：通过可解释性发现模型的弱点。Grad-CAM 只是入门，更高级的方法：SHAP、LIME、Attention 可视化等。"
        }, duration: "3小时", resources: [R_CS231N, { title: "Grad-CAM 项目", url: "https://github.com/jacobgil/pytorch-grad-cam", required: false }], checkpoint: "完成全面的模型评估和错误分析，找到至少 3 个具体改进方向" },
      { day: 4, title: "模型优化与部署",
        summary: "模型压缩、推理优化和部署上线", content: {
          objective: "今天你将优化和部署模型。学完后能做模型量化、ONNX 转换、推理优化，用 FastAPI 构建推理服务，用 Docker 部署，用 Gradio 做前端 Demo。",
          key_points: [
            "模型压缩：量化（INT8/FP16）、剪枝、知识蒸馏，减小体积提升速度",
            "ONNX 转换：把 PyTorch 模型转成 ONNX，用 ONNX Runtime 推理",
            "推理服务：FastAPI 构建 REST API，支持批量推理",
            "前端 Demo：Gradio/Streamlit 构建交互式界面",
            "Docker 部署：容器化整个服务，支持一键部署"
          ],
          practice: "模型优化与部署实战：1）模型导出：a）把 PyTorch 模型转成 ONNX 格式；b）用 ONNX Runtime 推理，对比速度和效果；c）验证 ONNX 模型和 PyTorch 模型输出一致。2）模型量化：a）FP16 半精度量化，对比显存和速度；b）INT8 量化（用 PyTorch 量化或 ONNX 量化）；c）对比量化前后的准确率和推理速度。3）推理服务：a）用 FastAPI 写推理 API；b）支持单张图片预测和批量预测；c）返回 top-5 预测结果和置信度；d）添加图片预处理 pipeline。4）前端 Demo：a）用 Gradio 做一个图片上传 + 分类结果展示的界面；b）支持拖拽上传；c）展示 Grad-CAM 可视化（可选）。5）Docker 部署：a）写 Dockerfile（包含模型、API、依赖）；b）构建镜像，测试容器；c）估算部署成本。6）性能测试：a）测量单张图片推理延迟；b）测量批量推理吞吐量；c）对比优化前后的性能。",
          deep_dive: "模型部署是连接 AI 和产品的关键环节，有很多工程考量：1）为什么需要模型优化？训练时用 PyTorch + GPU，但部署时可能资源有限——a）推理速度：用户等不了 5 秒，需要 < 200ms；b）显存限制：GPU 显存有限，模型太大会 OOM；c）成本：更快的推理 = 更少的 GPU = 更低的成本。2）量化的权衡：INT8 量化可以把模型体积减半、速度翻倍，但可能有 1-2% 的精度损失。要评估：a）精度损失对你的业务影响大吗？b）速度提升值多少钱？c）用 QAT（量化感知训练）可以减少精度损失。3）ONNX 的价值：ONNX 是模型的「通用格式」——a）跨框架：PyTorch、TensorFlow 都能导出 ONNX；b）跨平台：ONNX Runtime 支持 CPU、GPU、移动端；c）优化：ONNX Runtime 有图优化、算子融合等优化；d）部署友好：很多推理框架支持 ONNX。4）推理服务的架构：a）同步 vs 异步：低延迟用同步，高吞吐用异步；b）批处理：攒一批一起推理，提高 GPU 利用率；c）模型预热：服务启动时先推理一次，避免冷启动延迟；d）健康检查：定期检查模型是否正常。5）前端 Demo 的设计：好的 Demo 应该：a）简单易用——拖拽上传就行；b）即时反馈——上传后立即看到结果；c）展示亮点——如 Grad-CAM 可视化让用户看到模型在看哪里；d）有对比——可以切换不同模型看结果。6）从 Demo 到生产：Demo 和生产系统差距很大——a）稳定性：Demo 能跑就行，生产需要 99.9% 可用；b）性能：Demo 不在乎延迟，生产需要低延迟高吞吐；c）监控：Demo 不需要监控，生产需要全面监控；d）安全：Demo 不需要认证，生产需要认证、限流、审计。但好的 Demo 是走向生产的第一步。"
        }, duration: "3小时", resources: [R_FASTAPI, R_GRADIO, { title: "ONNX Runtime", url: "https://onnxruntime.ai/", required: false }], checkpoint: "完成模型优化、推理服务和前端 Demo 的部署" },
      { day: 5, title: "项目总结与作品集",
        summary: "完善项目文档，总结技术亮点，准备作品集展示", content: {
          objective: "今天你将完善项目文档和总结。学完后能写出专业的 README 和技术文档，准备项目展示，理解 CV 项目的完整生命周期，为简历添加有力作品。",
          key_points: [
            "项目文档：README、架构图、技术选型、效果分析、使用说明",
            "技术亮点：迁移学习、数据增强、错误分析、模型优化、部署方案",
            "效果展示：量化指标、可视化结果、对比实验、Demo 演示",
            "项目反思：遇到的问题、解决方案、改进方向、学到的东西",
            "作品集准备：如何在简历中展示项目、如何面试中讲解项目"
          ],
          practice: "项目总结与作品集准备：1）完善 README：a）项目简介——一句话说清楚做什么；b）功能特点——列出 3-5 个亮点；c）技术栈——用了什么模型、框架、工具；d）效果展示——准确率、速度、Demo 截图；e）安装使用——一键运行；f）项目结构——清晰的目录说明。2）技术文档：a）数据处理流程；b）模型训练方案和实验对比；c）模型优化和部署方案；d）架构图（用 draw.io 或 Mermaid）。3）实验报告：a）整理所有实验结果（表格或图表）；b）分析每个优化点的效果；c）写结论和建议。4）Demo 录制：a）准备几个好的 Demo 案例；b）录制演示视频或 GIF；c）放在 README 里。5）简历项目描述：a）用 STAR 法式描述（Situation-Task-Action-Result）；b）突出技术亮点和量化成果；c）准备面试中可能被问的问题。6）总结复盘：a）这两周学到了什么？b）遇到了哪些坑？c）如果重做会怎么改进？d）下一步学习方向？",
          deep_dive: "一个好的项目作品集，比任何证书都有说服力：1）面试官怎么看项目？面试官看项目主要看几点：a）技术深度——你只是调包还是理解原理？b）工程能力——你能不能把模型部署成产品？c）问题解决——遇到问题怎么分析和解决？d）学习能力——你能不能快速学习新技术？好的项目作品集能同时展示这四点。2）README 是第一印象：很多面试官第一眼看 README，如果写得好，会留下好印象。好的 README 应该：a）开头有 GIF/截图，直观展示效果；b）有清晰的项目简介；c）有量化的效果指标；d）有一键运行的说明；e）不要有错别字和格式问题。3）技术亮点的呈现：不要只是列举「用了 ResNet、用了数据增强」，要说明：a）为什么选这个方案？（对比过什么？）b）做了什么优化？（效果提升了多少？）c）解决了什么问题？（遇到了什么坑，怎么解决的？）4）量化成果的重要性：不要说「效果不错」，要说「准确率从 85% 提升到 93%」。不要说「速度很快」，要说「推理延迟从 500ms 降到 50ms」。量化的数据比形容词有说服力得多。5）面试中怎么讲项目：a）先讲背景和目标——为什么做这个？b）再讲方案——怎么做的？c）重点讲难点和创新——有什么亮点？d）最后讲结果——效果如何？e）准备被追问——为什么不用 X？如果数据更多会怎样？6）持续改进：项目不是做完就完了——a）关注新技术，定期更新；b）收集用户反馈，持续优化；c）把项目扩展到更多场景；d）写技术博客分享经验。一个持续维护的项目，比 10 个半成品更有价值。"
        }, duration: "3小时", resources: [{ title: "GitHub README 最佳实践", url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes", required: false }], checkpoint: "产出完整的项目文档、Demo 和作品集描述" },
    ],
  },

  // =====================================================
  // Node: project-llm-agent'''

if old3 in content:
    content = content.replace(old3, new3)
    print('3. project-cv-classification: OK')
else:
    print('3. project-cv-classification: NOT FOUND')

# =====================================================
# 4. Fill project-llm-agent (days 2-5)
# =====================================================
old4 = '''checkpoint: "完成 Agent 架构设计，实现基础工具集和 ReAct Agent" },
    ],
  },
{
    id: "project-data-pipeline",'''

new4 = '''checkpoint: "完成 Agent 架构设计，实现基础工具集和 ReAct Agent" },
      { day: 2, title: "Agent 核心实现与工具调用",
        summary: "深入实现 Agent 的推理-行动循环，完善工具系统", content: {
          objective: "今天你将深入实现 Agent 的核心逻辑。学完后能实现完整的 ReAct 循环，设计可靠的工具调用机制，处理工具调用失败的情况，让 Agent 能完成多步任务。",
          key_points: [
            "ReAct 循环：Thought → Action → Observation → Thought ... → Final Answer",
            "工具调用可靠性：参数验证、错误处理、重试机制、超时控制",
            "多步推理：Agent 如何分解复杂任务、规划步骤、跟踪进度",
            "上下文管理：对话历史、工具调用记录、中间结果的管理",
            "停止条件：Agent 何时该停止——找到答案、达到最大步数、无法继续"
          ],
          practice: "Agent 核心实现实战：1）ReAct 循环完善：a）实现完整的 Thought-Action-Observation 循环；b）用 LangChain 的 AgentExecutor 或自己实现；c）测试多步任务（如「搜索 X，然后总结，然后翻译」）。2）工具可靠性增强：a）给每个工具加参数验证（用 Pydantic）；b）实现错误处理——工具调用失败时给模型反馈，让它重试或换方法；c）加超时控制，防止工具卡住。3）多步任务测试：a）设计需要 3-5 步的任务（如「查找 2024 年 AI 领域的重大事件，按时间排序，生成摘要」）；b）观察 Agent 的推理过程；c）分析 Agent 在哪一步容易出错。4）上下文管理：a）对话历史太长时怎么截断或摘要？b）工具调用的结果怎么组织？c）中间结果怎么传递给下一步？5）停止条件设计：a）模型输出 Final Answer 时停止；b）最大步数限制（如 10 步）；c）检测死循环（连续重复相同的 Action）。6）调试与可视化：a）打印每一步的 Thought、Action、Observation；b）用 LangSmith 或 Langfuse 追踪完整调用链；c）分析 Agent 的决策是否合理。",
          deep_dive: "Agent 的核心挑战是让 LLM 做出可靠的决策，这比看起来难得多：1）ReAct 的本质：ReACT = Reasoning + Acting。LLM 先「想」要做什么（Thought），然后「做」（Action/调用工具），「看」结果（Observation），再「想」下一步。这个循环模仿了人类解决问题的方式——边想边做，根据反馈调整。2）工具调用的可靠性是最大痛点：LLM 经常在工具调用上出错——a）选错工具：明明该搜索，却去查知识库；b）参数错误：参数类型不对、必填参数缺失、参数值不合理；c）不会纠正：工具调用失败后，不知道怎么调整。提升方法：好的工具描述（清晰说明用途和参数）、参数验证（Pydantic schema）、错误反馈（把错误信息返回给模型让它重试）、Few-shot 示例。3）多步推理的挑战：a）目标遗忘：做着做着忘了最终目标；b）步骤遗漏：跳过必要的步骤；c）死循环：重复执行相同的操作。缓解方法：在每一步提醒最终目标、维护任务清单（TODO list）、检测重复操作。4）上下文窗口管理：Agent 的上下文会快速膨胀——每一步都有 Thought、Action、Observation，几步就可能超出窗口。管理方法：a）摘要：定期对历史做摘要；b）截断：只保留最近几步；c）外部存储：把中间结果存到外部，需要时再检索。5）Agent 的「个性」：不同的 Prompt 会产生不同的「个性」——a）谨慎型：每步都反复确认；b）激进型：快速行动，不太验证；c）探索型：喜欢尝试不同方法。通过 Prompt 设计可以调整 Agent 的行为风格。6）从 ReAct 到更高级的模式：ReAct 是基础，还有更高级的模式：a）Plan-and-Execute：先制定完整计划再执行，适合复杂任务；b）Multi-Agent：多个 Agent 分工协作；c）Tree of Thoughts：树形搜索，探索多种可能。不同模式适合不同场景。"
        }, duration: "3小时", resources: [{ title: "LangChain Agents", url: "https://python.langchain.com/docs/modules/agents/", required: false }, { title: "LangSmith", url: "https://docs.smith.langchain.com/", required: false }], checkpoint: "实现可靠的 Agent 核心循环，能完成 3-5 步的复杂任务" },
      { day: 3, title: "记忆系统与高级推理",
        summary: "实现 Agent 记忆系统，掌握高级推理模式", content: {
          objective: "今天你将学习 Agent 的记忆系统和高级推理模式。学完后能实现短期记忆和长期记忆，掌握 Plan-and-Execute、Reflection 等高级模式，让 Agent 更智能。",
          key_points: [
            "短期记忆：对话历史、当前任务上下文，通常用 Prompt 管理",
            "长期记忆：用户偏好、历史交互，用向量数据库存储和检索",
            "工作记忆：当前任务的中间结果和状态，类似人的工作记忆",
            "Plan-and-Execute：先规划完整步骤再执行，适合复杂任务",
            "Reflection（反思）：Agent 评估自己的表现，自我改进"
          ],
          practice: "记忆系统与高级推理实战：1）短期记忆实现：a）维护对话历史；b）当历史过长时做摘要；c）实现滑动窗口（只保留最近 N 轮对话）。2）长期记忆实现：a）把重要的对话内容存到向量数据库；b）用相关性检索历史记忆；c）测试：Agent 能否记住之前对话中提到的信息？3）工作记忆设计：a）为当前任务维护一个状态对象；b）记录已完成和待完成的步骤；c）在每一步更新状态。4）Plan-and-Execute 实现：a）先用 LLM 制定完整计划（分解成子任务）；b）然后逐步执行每个子任务；c）如果执行中发现计划不合理，动态调整。5）Reflection 实现：a）每完成一个任务后，让 Agent 反思——哪些做得好？哪些可以改进？b）把反思结果存入记忆，指导后续任务。6）对比实验：a）ReAct vs Plan-and-Execute，哪个效果更好？b）有记忆 vs 无记忆，用户满意度差多少？c）有反思 vs 无反思，任务完成率有提升吗？",
          deep_dive: "记忆和推理是让 Agent 从「能用」到「好用」的关键：1）记忆的三个层次借鉴了人类认知科学：a）短期记忆（工作记忆）：当前对话的上下文，容量有限，相当于人的「脑子里正在想的事」；b）长期记忆：过去的经验和知识，容量大但需要检索，相当于人的「记忆」；c）外部记忆：笔记、文档、数据库，需要主动查找，相当于人的「参考资料」。好的 Agent 系统需要三种记忆协同工作。2）长期记忆的实现：a）存储：把重要信息（用户偏好、关键事实、历史决策）存到向量数据库；b）检索：用当前任务的相关性检索历史记忆；c）更新：新信息要更新到记忆中，过时信息要遗忘；d）挑战：什么信息值得记住？什么时候该遗忘？这些都是开放问题。3）Plan-and-Execute 的优势：ReAct 是「走一步看一步」，Plan-and-Execute 是「先想好再动手」。对于复杂任务，先规划再执行通常更高效——a）减少不必要的步骤；b）可以并行执行独立的子任务；c）更容易追踪进度。但规划本身也需要能力，如果 LLM 规划不好，反而会更差。4）Reflection 的力量：Reflection 让 Agent 具备「自我改进」的能力——a）任务完成后评估自己的表现；b）分析哪些步骤做得好、哪些可以改进；c）把经验教训存入记忆。这类似人的「复盘」，能让 Agent 在后续任务中表现更好。研究表明，加了 Reflection 的 Agent 任务完成率提升 10-20%。5）多 Agent 协作：复杂任务可以拆分给多个 Agent——a）分工：不同 Agent 负责不同子任务；b）讨论：Agent 之间可以讨论和辩论；c）监督：一个 Agent 监督其他 Agent 的工作。像 AutoGPT、MetaGPT 等项目就是多 Agent 系统。6）Agent 的未来：a）更长的任务：现在的 Agent 只能做几分钟的任务，未来希望能做几小时甚至几天的任务；b）更强的工具使用：不只是 API 调用，还能操作浏览器、代码执行、文件管理；c）更好的安全性：防止 Agent 做危险操作；d）个性化：每个用户有自己的专属 Agent。Agent 是 AI 应用的前沿方向，机会很多。"
        }, duration: "3小时", resources: [{ title: "LangChain Memory", url: "https://python.langchain.com/docs/modules/memory/", required: false }, { title: "Reflection 论文", url: "https://arxiv.org/abs/2303.11366", required: false }], checkpoint: "实现 Agent 记忆系统（短期+长期）和至少一种高级推理模式" },
      { day: 4, title: "Agent 部署与评估",
        summary: "部署 Agent 应用，建立评估体系，确保可靠性", content: {
          objective: "今天你将部署 Agent 应用并建立评估体系。学完后能用 FastAPI 部署 Agent 服务，设计 Agent 评估方案，处理安全性和成本控制，产出可用的 Agent 应用。",
          key_points: [
            "Agent 部署：FastAPI 服务化、流式输出、会话管理",
            "Agent 评估：任务成功率、步骤效率、工具使用准确率、成本",
            "安全性：防止 Agent 执行危险操作、防止 Prompt 注入",
            "成本控制：Token 消耗监控、模型选择、缓存策略",
            "可观测性：调用链追踪、日志记录、性能监控"
          ],
          practice: "Agent 部署与评估实战：1）Agent 服务化：a）用 FastAPI 封装 Agent；b）支持流式输出（SSE）；c）会话管理——每个用户独立的对话和记忆；d）错误处理和超时控制。2）前端界面：a）用 Gradio 或 Streamlit 做聊天界面；b）展示 Agent 的思考过程（Thought/Action/Observation）；c）显示工具调用详情；d）支持中断和重试。3）评估方案设计：a）准备 20 个测试任务（不同难度）；b）评估指标：任务成功率、步骤数、工具调用准确率、Token 消耗；c）手动评估 + 自动评估结合。4）安全性实现：a）工具白名单——只允许调用预定义的工具；b）参数验证——防止恶意参数；c）Prompt 注入防护——过滤用户输入中的恶意指令；d）操作确认——危险操作需要用户确认。5）成本控制：a）监控每次任务的 Token 消耗；b）简单任务用小模型，复杂任务用大模型；c）缓存常见查询结果；d）设置每次任务的最大步数和 Token 上限。6）可观测性：a）用 LangSmith 或 Langfuse 追踪完整调用链；b）记录每次 Agent 运行的详细信息；c）设置异常告警。",
          deep_dive: "Agent 部署比传统模型部署复杂得多，因为 Agent 是动态的、多步的、不可预测的：1）Agent 部署的独特挑战：a）不可预测性：Agent 的行为是不确定的，同样的输入可能走完全不同的路径；b）长延迟：一个任务可能需要多轮 LLM 调用，延迟可能几十秒；c）高成本：每一步都要调用 LLM，Token 消耗大；d）状态管理：Agent 需要维护对话、记忆、任务状态。2）流式输出的重要性：Agent 任务通常需要较长时间，用户等待体验差。流式输出让用户看到：a）Agent 正在想什么；b）正在调用什么工具；c）工具返回了什么；d）逐步生成最终答案。这大大改善了用户体验。3）Agent 评估的困难：传统模型评估有标准答案，Agent 评估很难——a）任务是开放的，没有标准答案；b）同一个任务有多种完成路径；c）步骤的合理性很难自动判断。评估方法：a）任务成功率：最终是否完成了任务？b）效率：用了多少步？多少 Token？c）轨迹质量：步骤是否合理？有没有绕弯路？d）人工评估：最可靠但成本高。4）安全性是重中之重：Agent 能调用工具意味着它能执行实际操作——a）Prompt 注入：用户输入中嵌入恶意指令，让 Agent 执行非预期操作；b）工具滥用：Agent 调用工具删除文件、发送邮件等；c）信息泄露：Agent 可能把敏感信息传给外部 API。防护措施：工具白名单、参数验证、操作确认、沙箱执行、审计日志。5）成本优化：Agent 的成本主要是 LLM 调用——a）一次复杂任务可能调用 LLM 10+ 次；b）每次调用的上下文越来越长，Token 消耗递增；c）用 GPT-4 可能一次任务花费几美元。优化方法：a）简单步骤用 GPT-3.5/4o-mini；b）上下文压缩和摘要；c）缓存工具结果；d）限制最大步数。6）Agent 的可靠性：Agent 的可靠性远低于传统软件——a）LLM 有幻觉；b）工具调用可能失败；c）多步推理容易出错。提升可靠性的方法：a）每步验证——检查工具返回是否合理；b）重试机制——失败自动重试；c）回退机制——如果一条路走不通，换一条；d）人工兜底——Agent 不确定时交给人工。"
        }, duration: "3小时", resources: [R_FASTAPI, R_GRADIO, { title: "Langfuse", url: "https://langfuse.com/", required: false }], checkpoint: "完成 Agent 部署，建立评估体系，实现安全性和成本控制" },
      { day: 5, title: "Agent 项目总结与前沿探索",
        summary: "完善项目，探索 Agent 前沿方向，准备作品展示", content: {
          objective: "今天你将完善 Agent 项目并探索前沿方向。学完后能产出完整的 Agent 应用作品，了解 Multi-Agent、AutoGPT 等前沿方向，为简历添加有竞争力的作品。",
          key_points: [
            "项目完善：文档、Demo、测试、部署的收尾工作",
            "Multi-Agent 系统：多个 Agent 协作完成复杂任务",
            "Agent 框架对比：LangChain、AutoGPT、CrewAI、MetaGPT",
            "Agent 应用场景：个人助理、数据分析、代码生成、研究助手",
            "前沿方向：自主 Agent、Agent 操作系统、Agent 生态"
          ],
          practice: "Agent 项目总结与前沿探索：1）项目完善：a）完善 README——功能介绍、架构图、使用说明、Demo；b）整理代码——注释、类型标注、错误处理；c）准备 Demo 脚本——3-5 个展示场景。2）Multi-Agent 实验（可选）：a）用 CrewAI 或 AutoGen 搭建一个简单的 Multi-Agent 系统；b）设计不同角色的 Agent（如研究员、写手、审核员）；c）测试协作完成复杂任务。3）前沿方向探索：a）阅读 AutoGPT、BabyAGI、MetaGPT 的文档/代码；b）了解 Agent 操作系统（如 LangGraph）；c）思考这些技术和你的项目有什么关系。4）应用场景拓展：a）你的 Agent 还能用在什么场景？b）怎么从 Demo 变成产品？c）商业化需要考虑什么？5）作品集准备：a）写项目描述（STAR 格式）；b）准备技术亮点（如记忆系统、安全机制、成本优化）；c）准备面试问题。6）总结复盘：a）这两周学到了什么？b）Agent 技术的现状和未来？c）你的项目在什么水平？还有什么可以改进？",
          deep_dive: "Agent 是 AI 应用的最前沿，这个领域正在快速发展：1）为什么 Agent 是下一个大方向？当前的 LLM 应用主要是「问答」——用户问，AI 答。Agent 让 AI 从「回答问题」变成「完成任务」——从「告诉我怎么做」到「帮我做」。这是质的飞跃。想象一下：你说「帮我研究一下竞品，写一份分析报告」，Agent 就自动搜索、整理、分析、写报告。2）Multi-Agent 的愿景：单个 Agent 能力有限，多个 Agent 协作能完成更复杂的任务——a）分工：不同 Agent 负责不同领域；b）讨论：Agent 之间可以讨论和辩论，提升质量；c）监督：防止单个 Agent 犯错。MetaGPT 模拟软件开发团队（产品经理、架构师、程序员、测试），CrewAI 让定义 Agent 团队变得简单。3）Agent 框架的演进：a）LangChain：通用框架，功能全但复杂；b）AutoGPT：最早的自主 Agent，目标导向；c）CrewAI：专注 Multi-Agent，简单易用；d）AutoGen：微软出品，支持复杂对话模式；e）LangGraph：状态机式 Agent，更可控。框架在快速迭代，核心思想是相通的。4）Agent 的应用场景：a）个人助理：管理日程、回复邮件、整理笔记；b）数据分析：自动分析数据、生成报告、画图表；c）代码生成：理解需求、写代码、测试、部署；d）研究助手：搜索文献、总结论文、写综述；e）客服：处理复杂查询、调用后端系统、升级人工。每个场景都有巨大的商业价值。5）Agent 面临的挑战：a）可靠性：LLM 不可靠，Agent 更不可靠；b）成本：多步推理的 Token 消耗很高；c）安全性：Agent 能执行操作，风险更大；d）评估：没有好的自动评估方法；e）法律：Agent 做错了谁负责？这些挑战也是机会——谁能解决这些问题，谁就能做出成功的 Agent 产品。6）给学习者的建议：a）动手做：不要只看论文，自己实现一个 Agent；b）从简单开始：先做单 Agent + 2-3 个工具，再逐步增加复杂度；c）关注可靠性：花时间在错误处理、边界情况上；d）理解局限：知道 Agent 能做什么不能做什么，不要过度承诺；e）保持学习：这个领域每个月都有新进展。Agent 是 AI 应用的未来，现在入局正是时候。"
        }, duration: "4小时", resources: [{ title: "CrewAI", url: "https://docs.crewai.com/", required: false }, { title: "AutoGen", url: "https://microsoft.github.io/autogen/", required: false }, { title: "LangGraph", url: "https://langchain-ai.github.io/langgraph/", required: false }], checkpoint: "完成 Agent 项目，产出可展示的作品和完整文档" },
    ],
  },
{
    id: "project-data-pipeline",'''

if old4 in content:
    content = content.replace(old4, new4)
    print('4. project-llm-agent: OK')
else:
    print('4. project-llm-agent: NOT FOUND')

with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('All done!')
