import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def get_node_dailyTasks(node_id):
    idx = content.find(f'id: "{node_id}"')
    if idx == -1:
        return None, None
    dt_start = content.find('dailyTasks: [', idx)
    if dt_start == -1:
        return None, None
    depth = 0
    i = dt_start
    while i < len(content):
        if content[i] == '[':
            depth += 1
        elif content[i] == ']':
            depth -= 1
            if depth == 0:
                return dt_start, i
        i += 1
    return None, None

def count_days(dt_start, dt_end):
    section = content[dt_start:dt_end]
    return section.count('day: ')

def find_last_day_end(section):
    last_cp = section.rfind('checkpoint:')
    if last_cp == -1:
        return None
    close_brace = section.find('}', last_cp)
    if close_brace == -1:
        return None
    return close_brace

def add_days(node_id, new_days_text):
    start, end = get_node_dailyTasks(node_id)
    if not start or not end:
        print(f'  {node_id}: NOT FOUND')
        return False
    
    days = count_days(start, end)
    section = content[start:end]
    last_end = find_last_day_end(section)
    
    if last_end is None:
        print(f'  {node_id}: could not find last day end')
        return False
    
    insert_pos = start + last_end + 1
    content_new = content[:insert_pos] + ',' + new_days_text + content[insert_pos:]
    globals()['content'] = content_new
    print(f'  {node_id}: {days} days -> added ✅')
    return True

# ============================================================
# 8. devops-mlops (5 -> 10 days)
# ============================================================
print('Filling devops-mlops...')
add_days('devops-mlops', '''
      { day: 6, title: "Feature Store 与特征工程平台",
        summary: "学习特征存储和特征平台概念", content: {
          objective: "学习 Feature Store 和特征工程平台。理解特征存储的作用，了解 Feast 等开源工具，知道训练/服务一致性问题。",
          key_points: [
            "训练服务偏差：训练时的特征和线上推理时不一致",
            "Feature Store：统一管理特征，保证离线训练和在线服务一致",
            "Feast：开源 Feature Store，支持离线和在线存储",
            "特征复用：不同项目共享特征，避免重复开发"
          ],
          practice: "1）概念学习：理解 Feature Store 解决什么问题。2）Feast 入门（可选）：安装 Feast，跑官方示例。3）架构设计：为你的 ML 系统设计特征平台架构。4）思考：你做过的项目中，有没有训练服务不一致的问题？",
          deep_dive: "Feature Store 是 MLOps 的重要组件——它解决了「训练服务偏差」这个经典问题。训练时用批量数据算特征，推理时用实时数据算特征，两者的计算逻辑如果有差异，模型效果就会下降。Feature Store 统一定义和计算特征，离线训练和在线推理都用同一套，从根源上避免偏差。Feast 是最流行的开源 Feature Store，适合中小团队。大公司通常自研特征平台。"
        }, duration: "2小时", resources: [B_DOCKER_TUTORIAL, { title: "Feast", url: "https://docs.feast.dev/", required: false }], checkpoint: "理解 Feature Store 的作用和训练服务一致性问题" },
      { day: 7, title: "ML 流水线与 Kubeflow/Airflow",
        summary: "学习 ML 流水线编排工具", content: {
          objective: "学习 ML 流水线编排。了解 Kubeflow 和 Airflow，能设计和实现 ML pipeline，知道数据→训练→评估→部署的全流程自动化。",
          key_points: [
            "ML 流水线：数据处理 → 训练 → 评估 → 注册 → 部署，全流程自动化",
            "Kubeflow：Kubernetes 原生的 ML 工作流平台",
            "Airflow：通用工作流编排器，也常用于 ML 流水线",
            "流水线触发：定时触发、数据更新触发、手动触发"
          ],
          practice: "1）流水线设计：为一个 ML 项目设计完整的流水线，画出每个步骤和依赖。2）Airflow 入门（可选）：安装 Airflow，写一个简单 DAG。3）Kubeflow 了解（概念）：了解 Kubeflow Pipelines 的组件和架构。4）对比：Airflow 和 Kubeflow 各适合什么场景？",
          deep_dive: "ML 流水线是 MLOps 的骨架——把数据、训练、评估、部署串起来，实现端到端自动化。流水线编排工具分两类：a）通用编排器：Airflow、Prefect、Dagster，灵活但需要自己封装 ML 逻辑；b）ML 专用编排：Kubeflow Pipelines、MLflow Pipelines，专为 ML 设计，和 ML 工具集成好。选型取决于团队技术栈和 K8s 使用程度。流水线的目标是：任何人、任何时候，一键就能从原始数据得到模型。"
        }, duration: "2.5小时", resources: [B_DOCKER_TUTORIAL, { title: "Kubeflow", url: "https://www.kubeflow.org/", required: false }], checkpoint: "能设计 ML 流水线，了解 Kubeflow 和 Airflow 的区别" },
      { day: 8, title: "模型监控与数据漂移检测",
        summary: "深入学习模型监控和漂移检测", content: {
          objective: "深入学习模型监控和数据漂移检测。掌握数据漂移、概念漂移的检测方法，能用 Evidently AI 等工具监控模型，设计告警机制。",
          key_points: [
            "数据漂移：输入数据分布变化（P(X) 变了）",
            "概念漂移：输入输出关系变化（P(Y|X) 变了）",
            "漂移检测：统计检验（KS 检验、PSI）、距离度量、基于模型的方法",
            "Evidently AI：开源 ML 监控工具，内置多种漂移检测算法"
          ],
          practice: "1）漂移检测实验：生成模拟数据，制造数据漂移，用统计方法检测。2）Evidently AI 使用（可选）：安装并跑一个示例，生成漂移报告。3）监控设计：设计一个模型监控方案——监控什么指标？阈值多少？怎么告警？4）应对策略：检测到漂移后怎么办？（重训练、人工检查、降级）",
          deep_dive: "模型上线不是结束，而是开始——模型效果会随时间下降，这叫「模型腐烂」（Model Decay）。主要原因是数据漂移和概念漂移。数据漂移是输入分布变了（比如用户行为变了），概念漂移是关系变了（比如疫情改变了消费模式）。检测漂移是第一步，更重要的是应对——自动重训练？人工审核？降级到规则？这需要根据业务场景设计。Evidently AI、Arize、WhyLabs 是专门的 ML 监控工具。"
        }, duration: "2.5小时", resources: [B_DOCKER_TUTORIAL, { title: "Evidently AI", url: "https://www.evidentlyai.com/", required: false }], checkpoint: "理解漂移检测方法，能设计模型监控方案" },
      { day: 9, title: "AutoML 与超参数优化",
        summary: "了解 AutoML 和超参数优化技术", content: {
          objective: "了解 AutoML 和超参数优化。掌握超参数搜索方法（网格搜索、随机搜索、贝叶斯优化），了解 AutoML 工具和适用场景。",
          key_points: [
            "超参数优化：网格搜索、随机搜索、贝叶斯优化、遗传算法",
            "Optuna/Hyperopt：流行的超参优化框架",
            "AutoML：自动特征工程、模型选择、超参调优的全自动化",
            "适用场景：什么时候用 AutoML，什么时候需要人工调优"
          ],
          practice: "1）超参优化：用 Optuna 或 scikit-learn 的 GridSearchCV/RandomizedSearchCV 优化一个模型。2）对比实验：网格搜索 vs 随机搜索 vs 贝叶斯优化，哪种效率高？3）AutoML 了解（概念）：了解 AutoML 工具（AutoGluon、H2O）。4）思考：AutoML 会取代数据科学家吗？还是辅助工具？",
          deep_dive: "超参数优化是 ML 工程的重要环节——超参数选得好，模型效果能提升一大截。网格搜索简单但低效（维度灾难），随机搜索 surprisingly 有效，贝叶斯优化更智能（利用历史结果指导下一次尝试）。Optuna 是现在最流行的超参优化框架，支持 pruning（早停差的实验）、多种采样器、可视化。AutoML 更进一步——自动做特征工程、模型选择、超参调优，甚至自动清洗数据。但 AutoML 不是银弹——它能找到「还不错」的解，但很难找到「最优」解，而且计算资源消耗大。人类专家的价值在于理解问题、设计正确的评估指标、做特征工程。"
        }, duration: "2.5小时", resources: [{ title: "Optuna", url: "https://optuna.org/", required: false }], checkpoint: "能用 Optuna 做超参数优化，了解 AutoML 的能力和局限" },
      { day: 10, title: "MLOps 综合实战与职业发展",
        summary: "MLOps 综合项目与职业发展路径", content: {
          objective: "完成 MLOps 综合项目并规划职业发展。整合两周学到的 MLOps 知识，做一个端到端项目，了解 MLOps 工程师的技能栈和成长路径。",
          key_points: [
            "综合项目：从数据到部署监控的完整 MLOps 系统",
            "MLOps 成熟度：手工 → 流水线化 → CI/CD → CT → 全自动",
            "技能栈：ML + DevOps + 云计算 + 数据工程",
            "职业发展：MLOps 工程师、ML 平台工程师、数据科学家"
          ],
          practice: "1）项目设计：选一个 ML 项目，设计完整的 MLOps 架构。2）方案文档：写一份 MLOps 方案文档——架构图、技术选型、成本估算、风险分析。3）技能盘点：你现在掌握了哪些 MLOps 技能？缺什么？4）学习路径：制定后续 3-6 个月的学习计划。5）社区：关注 MLOps 社区、博客、开源项目。",
          deep_dive: "MLOps 是一个交叉领域——需要机器学习、软件工程、DevOps、云计算等多方面的知识。MLOps 工程师的核心价值是「让 ML 项目从 Demo 走到生产」。很多 ML 项目死在「最后一公里」——模型做出来了，但上不了线，或者上线了没人维护。MLOps 就是解决「最后一公里」的。职业路径：a）ML 工程师 → MLOps 工程师：懂模型又懂工程，很稀缺；b）DevOps 工程师 → MLOps 工程师：有工程基础，补 ML 知识；c）数据工程师 → MLOps 工程师：数据背景，补模型和运维。MLOps 是当前 AI 领域最缺人的方向之一。"
        }, duration: "4小时", resources: [B_DOCKER_TUTORIAL], checkpoint: "设计端到端 MLOps 方案，规划职业发展路径" }''')

# ============================================================
# 9. project-rag-app (5 -> 10 days)
# ============================================================
print('Filling project-rag-app...')
add_days('project-rag-app', '''
      { day: 6, title: "高级检索优化",
        summary: "混合检索、重排序、查询改写等高级技术", content: {
          objective: "学习高级检索优化技术。掌握混合检索（BM25 + 向量）、重排序（Reranker）、查询改写等方法，显著提升检索质量。",
          key_points: [
            "混合检索：BM25 关键词检索 + 向量语义检索，取长补短",
            "重排序：用 Cross-Encoder 对召回结果精排，提升精度",
            "查询改写：多查询、HyDE、问题分解，提升召回",
            "分块优化：语义分块、父子分块、重叠策略"
          ],
          practice: "1）混合检索：实现 BM25（用 rank_bm25）和向量检索的融合（RRF 或加权）。2）重排序：加一个 BGE-Reranker 精排，对比重排前后 Recall 提升。3）查询改写：实现多查询改写（让 LLM 生成 3 个变体分别检索）或 HyDE。4）消融实验：每个优化点单独测效果，看贡献最大的是哪个。",
          deep_dive: "基础 RAG 的检索质量往往是瓶颈——检索错了，生成再强也没用。高级检索优化能大幅提升效果：a）混合检索：向量检索擅长语义匹配，BM25 擅长关键词精确匹配，两者结合效果通常比单一路好 10-20%；b）重排序：第一阶段用双塔模型（快）召回 top-20，第二阶段用 Cross-Encoder（慢但准）精排 top-5，兼顾速度和精度；c）查询改写：用户的 query 往往不是最优的，改写一下召回率能提升不少。这些技术组合起来，检索质量可能从 60% 提到 90%+。"
        }, duration: "3小时", resources: [{ title: "BGE Reranker", url: "https://huggingface.co/BAAI/bge-reranker-large", required: false }], checkpoint: "实现混合检索和重排序，量化检索质量提升" },
      { day: 7, title: "多轮对话与记忆系统",
        summary: "实现多轮对话 RAG 和记忆管理", content: {
          objective: "学习多轮对话 RAG 和记忆系统。能处理多轮对话中的指代消解和上下文传递，设计短期和长期记忆策略。",
          key_points: [
            "多轮对话挑战：指代消解、上下文依赖、话题切换",
            "查询重构：把当前问题 + 对话历史改写成独立的检索 query",
            "短期记忆：对话历史管理（滑动窗口、摘要）",
            "长期记忆：用户偏好、历史对话摘要，向量存储"
          ],
          practice: "1）查询重构：实现一个独立查询生成器——输入对话历史 + 当前问题，输出重构后的独立查询。2）对话管理：实现滑动窗口（保留最近 N 轮）和摘要式记忆。3）长期记忆：把重要信息存入记忆库，对话时检索相关记忆加入上下文。4）测试：设计多轮对话场景，测试系统是否能正确理解指代和上下文。",
          deep_dive: "多轮对话 RAG 比单轮问答复杂很多——用户不会每次都把话说完整，会用「他」「这个」「那个」，还会切换话题。核心技术是查询重构（Query Rewriting）——让 LLM 把不完整的问题改写成完整的、独立的查询。记忆系统也是关键：短期记忆（当前对话）保证连贯性，长期记忆（用户画像、历史偏好）让系统更懂用户。记忆的存储和检索本身就是一个 RAG 问题——把记忆当作文档，当前对话当作查询，检索相关的记忆片段。"
        }, duration: "3小时", resources: [{ title: "LangChain Memory", url: "https://python.langchain.com/docs/modules/memory/", required: false }], checkpoint: "实现多轮对话 RAG，包含查询重构和记忆系统" },
      { day: 8, title: "RAG 评估体系与质量保证",
        summary: "建立完整的 RAG 评估和质量保证体系", content: {
          objective: "建立 RAG 评估体系。掌握检索评估和生成评估的方法，用 Ragas 等工具自动化评估，设计质量监控和告警机制。",
          key_points: [
            "检索评估：Recall@k、MRR、NDCG、上下文精度/召回",
            "生成评估：忠实度（Faithfulness）、答案相关性、完整性",
            "Ragas：自动化 RAG 评估框架",
            "质量监控：线上效果监控、bad case 收集、持续改进"
          ],
          practice: "1）构建评估集：准备 30-50 个问答对，标注标准答案和相关文档。2）Ragas 评估：用 Ragas 算 faithfulness、answer_relevancy、context_precision、context_recall。3）人工评估：抽样 10 个，人工评分，和自动评估对比。4）监控设计：设计线上质量监控方案——怎么发现 bad case？怎么告警？",
          deep_dive: "没有评估，就没有优化。RAG 评估分为两部分——检索评估和生成评估。检索评估相对客观，Recall/MRR 就能说明问题。生成评估比较难——答案是开放的，怎么算好？Ragas 提出了几个指标：faithfulness（答案是否基于上下文，有没有幻觉）、answer_relevancy（答案和问题相关吗）、context_precision（检索到的上下文精准吗）、context_recall（相关的上下文检索到了吗）。这些指标都是用 LLM 当评委来算的，虽然不完全准确，但成本低、速度快，适合做自动化监控。再加上定期人工抽检，就能形成比较完整的质量保证体系。"
        }, duration: "2.5小时", resources: [{ title: "Ragas", url: "https://docs.ragas.io/", required: false }], checkpoint: "建立 RAG 评估体系，能用 Ragas 自动化评估" },
      { day: 9, title: "性能优化与生产部署",
        summary: "RAG 系统的性能优化和生产级部署", content: {
          objective: "学习 RAG 系统的性能优化和生产部署。优化检索和生成速度，构建高可用服务，考虑成本、安全、监控。",
          key_points: [
            "性能优化：Embedding 缓存、语义缓存、批处理、异步",
            "生产架构：API 网关、限流、鉴权、负载均衡",
            "成本优化：小模型 Embedding、缓存、智能路由、量化",
            "安全合规：数据隐私、内容安全、访问控制"
          ],
          practice: "1）性能优化：a）加语义缓存，相同/相似问题直接返回；b）优化向量检索（选合适的 index 类型）；c）流式输出减少首字延迟。2）生产部署：用 Docker Compose 部署完整的 RAG 服务（API + 向量库 + 前端）。3）安全：加 API Key 鉴权、限流，防止滥用。4）成本估算：算一下 100 日活用户的话，每月成本大概多少？",
          deep_dive: "RAG 从 Demo 到生产差很多。Demo 只要能跑就行，生产要考虑：a）性能：并发高不高？延迟多少？用户等不及；b）可用性：服务挂了怎么办？多实例 + 负载均衡；c）成本：Embedding 和 LLM 调用都要钱，缓存和路由能省很多；d）安全：数据泄露怎么办？用户输入恶意 prompt 怎么办？e）监控：出问题了怎么发现？性能、错误率、质量都要监控。生产级 RAG 是一个系统工程，不只是调库。"
        }, duration: "3小时", resources: [R_FASTAPI, R_DOCKER_GETTING_STARTED], checkpoint: "优化 RAG 系统性能，完成生产级部署方案" },
      { day: 10, title: "项目完善与作品集",
        summary: "完善项目，准备作品集，总结学习收获", content: {
          objective: "完善 RAG 项目并准备作品集。打磨项目细节，写好文档和演示，总结两个月的学习收获，为求职和后续学习做准备。",
          key_points: [
            "项目打磨：用户体验、错误处理、边界情况、细节优化",
            "技术文档：README、架构图、技术选型说明、部署指南",
            "作品集展示：Demo 视频、截图、亮点、博客文章",
            "面试准备：常见问题、技术深度、项目讲解"
          ],
          practice: "1）项目打磨：a）完善 UI/UX，让用户体验更流畅；b）加错误处理和 loading 状态；c）处理边界情况（空查询、超长文档、知识库为空等）。2）文档：a）写高质量 README——项目简介、功能特性、技术栈、架构图、安装使用、Demo 截图；b）写设计文档——为什么这么设计？做了哪些优化？效果如何？3）作品集：a）录一个 Demo 视频或 GIF；b）写一篇技术博客分享你的 RAG 之旅；c）准备 3 分钟和 10 分钟两个版本的项目讲解。4）面试准备：a）RAG 的原理、优化方法、评估指标；b）你做的项目中最大的挑战是什么？怎么解决的？c）如果再做一遍，你会怎么改进？",
          deep_dive: "一个好的项目作品集比 10 个半成品有价值。面试官看项目看什么？a）技术深度：你是只会调库还是真的理解原理？b）工程能力：代码质量、部署能力、错误处理、性能优化；c）问题解决：遇到了什么问题？怎么分析和解决的？d）结果导向：效果提升了多少？成本降低了多少？用数据说话。建议：把你的 RAG 项目做到极致——不仅功能完成，还要有性能优化、有评估数据、有漂亮的界面、有清晰的文档。这样的项目放在简历上，是很有竞争力的。"
        }, duration: "4小时", resources: [], checkpoint: "完成高质量 RAG 项目，产出文档和作品集材料" }''')

# Save
with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nPart 4 done (devops-mlops + project-rag-app)')