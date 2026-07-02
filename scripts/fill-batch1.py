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
    """Add new days to a node's dailyTasks"""
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
# 2. llm-inference (7 -> 10 days)
# ============================================================
print('Filling llm-inference...')
add_days('llm-inference', '''
      { day: 8, title: "本地推理与边缘部署",
        summary: "学习本地推理框架 llama.cpp，了解大模型本地化部署", content: {
          objective: "学习本地推理和边缘部署。能用 llama.cpp 在本地跑大模型，理解量化和模型大小的选择，了解移动端推理现状。",
          key_points: [
            "llama.cpp：纯 C++ 推理框架，CPU 也能跑大模型",
            "GGUF 格式与量化：Q4_K_M 是甜点，平衡质量和速度",
            "本地推理优势：隐私保护、无网络依赖、无 API 成本",
            "移动端推理：MLC、Core ML、Qualcomm AI Engine"
          ],
          practice: "1）llama.cpp 入门：下载 llama.cpp 编译，下载 GGUF 小模型，命令行推理。2）性能测试：测不同量化（Q4/Q5/Q8）的 tokens/秒和质量。3）本地 API：用 server 模式启动，OpenAI 客户端调用。4）移动端调研：了解手机跑大模型的现状。",
          deep_dive: "本地推理越来越重要——隐私、成本、可用性是三大驱动力。llama.cpp 让普通人在自己电脑上就能跑大模型。量化是关键：Q4_K_M 通常是甜点——体积只有 FP16 的 1/4，质量损失不大。苹果芯片尤其适合本地推理，统一内存+Metal 加速。"
        }, duration: "2.5小时", resources: [{ title: "llama.cpp", url: "https://github.com/ggerganov/llama.cpp", required: false }], checkpoint: "能用 llama.cpp 本地运行大模型，理解本地推理适用场景" },
      { day: 9, title: "推理成本分析与优化实战",
        summary: "系统化分析推理成本，制定优化策略和方案", content: {
          objective: "系统化分析推理成本并制定优化策略。能建模推理成本，找出成本瓶颈，设计端到端优化方案，量化评估优化效果。",
          key_points: [
            "成本构成：GPU 硬件成本、云服务费用、带宽、人力",
            "成本指标：每 1000 token 成本、每次请求成本、月成本",
            "优化 ROI：每个措施的成本节省 vs 实施复杂度",
            "优化路线图：从易到难的优先级和实施路径"
          ],
          practice: "1）成本建模：假设部署 7B 模型服务，月活 1 万，算月成本。2）瓶颈分析：成本大头是什么？哪些因素影响最大？3）方案设计：列出 5-8 个优化措施，按 ROI 排序。4）成本监控：怎么追踪和分析成本，怎么告警。",
          deep_dive: "推理成本是大模型落地的核心约束。成本优化是高杠杆——优化掉 50% 成本就是真金白银的节省。优化优先级：量化（成本减半，简单）→ vLLM（吞吐量 x10，简单）→ 语义缓存（省 30-50%，中等）→ 智能路由（省 30-70%，中等）→ 模型蒸馏（长期回报大，成本高）。从高 ROI 开始逐步推进。"
        }, duration: "3小时", resources: [], checkpoint: "能建模推理成本，制定优化路线图，量化优化效果" },
      { day: 10, title: "推理优化项目实战",
        summary: "综合运用所学，完成一个推理优化项目", content: {
          objective: "完成推理优化综合项目。从 0 到 1 部署生产级推理服务，完成多轮优化，产出优化报告和文档。",
          key_points: [
            "项目实战：从基线到优化，完整走一遍推理优化流程",
            "性能基线：建立基准，量化每一步优化的效果",
            "调优过程：逐步优化，记录每个优化点的收益",
            "项目文档：架构图、性能数据、成本分析、运维指南"
          ],
          practice: "1）项目规划：选目标模型，定义场景，确定指标，制定目标。2）建立基线：HuggingFace 原生推理做基线，测延迟/吞吐量/显存。3）逐步优化：第一步 KV Cache，第二步量化，第三步 vLLM，第四步其他优化。每步都测性能。4）生产化：部署 API 服务，加监控，写运维文档。5）项目报告：对比表格、架构图、成本分析、后续建议。",
          deep_dive: "推理优化是科学不是玄学——要有方法论：先测量（建基线）→ 再假设（猜最可能的优化方向）→ 后验证（做实验看数据）→ 重复迭代。没有银弹，只有权衡。好的推理工程师要有全栈视角，从模型到框架到服务到应用，多层结合优化才能数量级提升。"
        }, duration: "4小时", resources: [], checkpoint: "完成完整推理优化项目，产出优化报告和生产级部署" }''')

# ============================================================
# 3. cv-diffusion (7 -> 10 days)
# ============================================================
print('Filling cv-diffusion...')
add_days('cv-diffusion', '''
      { day: 8, title: "Stable Diffusion 实战与 LoRA 微调",
        summary: "使用 Stable Diffusion 生成图像，学习 LoRA 微调方法", content: {
          objective: "使用 Stable Diffusion 生成图像，学习 LoRA 微调。能用 Diffusers 库运行 SD，用 LoRA 微调风格，掌握提示词工程和参数调节。",
          key_points: [
            "Stable Diffusion 推理：Diffusers 库加载模型，文生图、图生图",
            "提示词工程：正向/负向提示词、权重调节、风格描述",
            "参数调节：CFG Scale、采样步数、采样器、种子",
            "LoRA 微调：用 DreamBooth / LoRA 训练自定义风格或角色"
          ],
          practice: "1）Stable Diffusion 推理：用 Diffusers 加载 SD 1.5 或 SDXL，文生图生成图片。2）参数实验：调 CFG scale、步数、采样器，看效果变化。3）提示词实验：试不同风格描述、权重语法，对比结果。4）LoRA 微调（可选）：用小数据集训练一个风格 LoRA。",
          deep_dive: "Stable Diffusion 是最流行的开源图像生成模型。提示词是控制生成的关键——正向提示词描述想要的，负向提示词排除不想要的。LoRA 微调是定制化的利器——只需要很少的图片就能训练出特定风格或角色，而且 LoRA 文件很小（几十 MB），可以快速切换。"
        }, duration: "3小时", resources: [{ title: "Diffusers 文档", url: "https://huggingface.co/docs/diffusers/index", required: false }], checkpoint: "能用 Stable Diffusion 生成图像，掌握提示词和参数调节" },
      { day: 9, title: "扩散模型进阶与应用拓展",
        summary: "了解 ControlNet、Inpainting 等高级应用，探索更多扩散模型能力", content: {
          objective: "了解扩散模型的高级应用。知道 ControlNet、Inpainting、Outpainting、图像编辑等能力，理解扩散模型的应用边界。",
          key_points: [
            "ControlNet：用深度、边缘、姿态等条件控制生成结构",
            "Inpainting / Outpainting：局部重绘和扩图",
            "图像编辑：基于文本或草图的图像编辑",
            "视频生成：扩散模型在视频领域的应用"
          ],
          practice: "1）ControlNet 实验（可选）：试 ControlNet 的 Canny/Depth/Pose 控制生成。2）Inpainting：遮罩部分区域，让模型重绘。3）图像编辑：用 InstructPix2Pix 或 SDXL 编辑图片。4）调研：了解视频生成模型（Sora、Runway 等）。",
          deep_dive: "扩散模型的能力远超文生图——ControlNet 让生成可控（指定姿势、结构、构图）；Inpainting 让局部修改变得容易；图像编辑让文字描述就能改图。这些技术组合起来，可以做很多产品：AI 绘画、设计辅助、照片编辑、游戏素材生成等。视频生成是下一个前沿，进展很快。"
        }, duration: "3小时", resources: [{ title: "ControlNet", url: "https://github.com/lllyasviel/ControlNet", required: false }], checkpoint: "了解扩散模型的多种高级应用，能使用 ControlNet 和 Inpainting" },
      { day: 10, title: "项目实战与前沿展望",
        summary: "完成一个扩散模型项目，了解前沿方向", content: {
          objective: "完成扩散模型项目并了解前沿。做一个完整的图像生成应用，了解最新进展（Sora、视频生成、3D 生成等），总结学习收获。",
          key_points: [
            "项目实战：做一个图像生成 Web 应用或创意作品",
            "前沿方向：视频生成、3D 生成、多模态、统一大模型",
            "伦理与版权：生成式 AI 的版权、造假、伦理问题",
            "项目总结：整理成果，准备作品集"
          ],
          practice: "1）项目实现：做一个完整项目——AI 头像生成、风格迁移工具、海报生成器等。2）部署上线：用 Gradio/Streamlit 做界面，部署可分享。3）效果展示：选 10-20 张生成的好作品，整理成作品集。4）总结：整理学到的扩散模型知识，思考 AI 图像生成的未来。",
          deep_dive: "扩散模型从图像拓展到视频、3D、音频——多模态生成是趋势。Sora 展示了视频生成的巨大潜力，3D 生成也在快速发展。但同时也有伦理问题：版权争议、深度伪造、内容审核。技术发展很快，保持学习和思考很重要——不仅要会用技术，也要思考它的影响。"
        }, duration: "4小时", resources: [], checkpoint: "完成扩散模型项目，了解前沿方向和伦理问题" }''')

# ============================================================
# 4. nlp-sequence-labeling (5 -> 10 days)
# ============================================================
print('Filling nlp-sequence-labeling...')
add_days('nlp-sequence-labeling', '''
      { day: 6, title: "实体关系抽取与知识图谱",
        summary: "从文本中抽取实体关系，构建知识图谱", content: {
          objective: "学习实体关系抽取和知识图谱基础。能从文本中抽取实体和关系，了解知识图谱的构建和应用。",
          key_points: [
            "关系抽取：从文本中识别实体之间的关系（如「张三-毕业于-清华」）",
            "知识图谱：实体 + 关系构成的网络结构，存储结构化知识",
            "抽取方法：基于规则、基于模板、基于监督学习、基于大模型",
            "应用场景：问答系统、搜索引擎、推荐系统、知识管理"
          ],
          practice: "1）实体关系抽取：用 spaCy 或 HuggingFace 模型做简单的关系抽取。2）知识图谱构建：从几篇文章中抽取实体关系，用 NetworkX 或 Neo4j 构建小图谱。3）可视化：用可视化工具展示知识图谱。4）大模型抽取（可选）：用 LLM 的 Function Calling 或结构化输出抽取关系。",
          deep_dive: "信息抽取是 NLP 的核心任务之一——把非结构化文本变成结构化知识。知识图谱是信息抽取的重要应用，让机器理解实体之间的关系。早期是规则和模板，后来用监督学习，现在大模型让零样本/少样本抽取成为可能。知识图谱在搜索、问答、推荐中都有应用。"
        }, duration: "2.5小时", resources: [B_NLP_TUTORIAL, { title: "spaCy 文档", url: "https://spacy.io/", required: false }], checkpoint: "能实现实体关系抽取，构建简单知识图谱" },
      { day: 7, title: "信息抽取实战项目",
        summary: "做一个完整的信息抽取项目", content: {
          objective: "完成信息抽取实战项目。选择一个垂直领域（医疗、金融、法律等），做实体识别 + 关系抽取 + 可视化。",
          key_points: [
            "项目设计：选题、数据准备、方案设计",
            "模型选择：CRF、BiLSTM-CRF、BERT、大模型对比",
            "评估方法：Precision/Recall/F1，错误分析",
            "应用封装：API 服务 + 可视化展示"
          ],
          practice: "1）项目选题：选一个感兴趣的垂直领域和任务。2）数据准备：找公开数据集或自己标注少量数据。3）模型训练：训练 NER 和关系抽取模型。4）效果评估：定量评估 + 错误分析。5）封装展示：做一个简单的演示页面。",
          deep_dive: "序列标注和信息抽取是工业界应用最广的 NLP 技术之一——很多业务场景都需要从文本中提取结构化信息。做项目的关键：a）明确业务目标和评估标准；b）从小处着手，先做 baseline 再迭代；c）错误分析比调参更重要；d）最后要考虑落地——速度、成本、可维护性。"
        }, duration: "3小时", resources: [B_NLP_TUTORIAL, R_HF_COURSE], checkpoint: "完成信息抽取项目，包含实体识别、关系抽取和可视化" },
      { day: 8, title: "文本摘要与关键词提取",
        summary: "学习自动文本摘要和关键词提取技术", content: {
          objective: "学习文本摘要和关键词提取。了解抽取式和生成式摘要的区别，掌握几种关键词提取方法。",
          key_points: [
            "抽取式摘要：从原文中选最重要的句子组成摘要（TextRank、LSA）",
            "生成式摘要：用大模型生成新的摘要文字（BART、T5、LLM）",
            "关键词提取：TF-IDF、TextRank、YAKE、基于大模型",
            "摘要评估：ROUGE 指标、人工评估"
          ],
          practice: "1）关键词提取：用 TF-IDF、TextRank、YAKE 等方法提取关键词，对比效果。2）抽取式摘要：用 TextRank 做简单的抽取式摘要。3）生成式摘要：用大模型做摘要，调参（长度、风格）。4）评估：人工对比几种方法的摘要质量。",
          deep_dive: "文本摘要有两种思路——抽取式（从原文选句子，不会错但可能不连贯）和生成式（生成新文字，流畅但可能有幻觉）。大模型时代生成式摘要成为主流。关键词提取也是实用技术——提取关键词用于索引、分类、推荐。TextRank 是经典算法，基于 PageRank 思想给词或句子排序。"
        }, duration: "2.5小时", resources: [B_NLP_TUTORIAL], checkpoint: "能实现文本摘要和关键词提取，对比不同方法的效果" },
      { day: 9, title: "主题模型与文本聚类",
        summary: "学习 LDA 主题模型和文本聚类分析", content: {
          objective: "学习主题模型和文本聚类。能用 LDA 发现文本集合中的隐含主题，用聚类算法对文本自动分组。",
          key_points: [
            "主题模型：LDA（Latent Dirichlet Allocation），自动发现文档集合的潜在主题",
            "文本聚类：K-Means、层次聚类、DBSCAN，把相似文本归为一类",
            "文本表示：TF-IDF、Word2Vec、BERT 等向量表示用于聚类",
            "评估方法：困惑度（Perplexity）、轮廓系数、人工评估"
          ],
          practice: "1）LDA 主题模型：用 Gensim 在新闻/论文数据集上训练 LDA，看每个主题的关键词。2）主题数选择：试不同主题数，用困惑度或一致性选最优。3）文本聚类：用 BERT + K-Means 对文本聚类。4）可视化：用 pyLDAvis 或 t-SNE 可视化主题和聚类。",
          deep_dive: "主题模型是无监督学习在 NLP 中的经典应用——不需要标注，就能发现大量文档中的主题结构。LDA 是最经典的主题模型，基于概率图模型。词嵌入时代，也常用 Embedding + 聚类的方式做文本分组。这些技术在文档管理、内容分析、用户研究中很有用。"
        }, duration: "2.5小时", resources: [B_NLP_TUTORIAL, { title: "Gensim 文档", url: "https://radimrehurek.com/gensim/", required: false }], checkpoint: "能用 LDA 做主题建模，用聚类做文本分组" },
      { day: 10, title: "NLP 综合项目与前沿展望",
        summary: "完成综合项目，了解 NLP 前沿方向", content: {
          objective: "完成 NLP 综合项目并了解前沿。把两周学到的 NLP 知识整合到一个项目中，了解大模型时代 NLP 的发展方向。",
          key_points: [
            "综合项目：设计并实现一个完整的 NLP 应用",
            "技术整合：文本处理 + 分类/标注/抽取 + 生成 + 可视化",
            "前沿方向：大模型、多模态、Agent、低资源语言",
            "学习路径：NLP 工程师的进阶路线"
          ],
          practice: "1）项目设计：选一个 NLP 应用场景（智能客服、舆情分析、简历筛选等）。2）技术选型：哪些用传统方法，哪些用大模型。3）实现与部署：写代码、做界面、部署。4）项目文档：写 README、技术博客、作品集。5）总结：NLP 学习收获，下一步方向。",
          deep_dive: "大模型时代 NLP 发生了巨大变化——以前每个任务要单独训模型，现在一个大模型 + Prompt 就能搞定很多任务。但传统 NLP 仍然有用——a）小数据/低资源场景；b）成本敏感场景；c）需要可解释性的场景；d）边缘部署场景。NLP 工程师要懂传统方法也懂大模型，知道什么时候用什么。"
        }, duration: "4小时", resources: [B_NLP_TUTORIAL, R_HF_COURSE], checkpoint: "完成 NLP 综合项目，了解前沿方向和学习路径" }''')

# Save
with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nPart 2 done (llm-inference + cv-diffusion + nlp-sequence-labeling)')