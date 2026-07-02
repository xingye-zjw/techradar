with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# =====================================================
# 1. llm-local-rag: find day 7 checkpoint, add days 8-10
# =====================================================
# First find the last day (day 7) of llm-local-rag
idx = content.find('id: "llm-local-rag"')
if idx == -1:
    print('llm-local-rag NOT FOUND')
else:
    # Find dailyTasks
    dt_start = content.find('dailyTasks: [', idx)
    depth = 0
    i = dt_start
    dt_end = -1
    while i < len(content):
        if content[i] == '[':
            depth += 1
        elif content[i] == ']':
            depth -= 1
            if depth == 0:
                dt_end = i
                break
        i += 1
    
    if dt_end == -1:
        print('llm-local-rag dailyTasks end NOT FOUND')
    else:
        section = content[dt_start:dt_end]
        day7_pos = section.rfind('day: 7,')
        if day7_pos == -1:
            day7_pos = section.rfind('day: 7')
        
        if day7_pos == -1:
            print(f'day 7 not found, days in section: {section.count("day: ")}')
        else:
            # Find checkpoint of day 7
            checkpoint_pos = section.find('checkpoint:', day7_pos)
            if checkpoint_pos == -1:
                print('checkpoint not found for day 7')
            else:
                # Find the closing } of day 7
                close_pos = section.find('},', checkpoint_pos)
                if close_pos == -1:
                    close_pos = section.find('}\n', checkpoint_pos)
                
                if close_pos != -1:
                    # Insert new days after day 7
                    old_text = section[day7_pos:close_pos+2]
                    
                    new_days = '''day: 8, title: "RAG 评估与优化",
        summary: "建立 RAG 评估体系，优化检索和生成效果", content: {
          objective: "今天你将学习 RAG 系统的评估和优化方法。学完后能建立检索和生成的评估指标，用 Ragas 等工具自动化评估，找到系统的瓶颈并针对性优化。",
          key_points: [
            "检索评估：Recall@k、MRR、NDCG，衡量检索到相关内容的能力",
            "生成评估：忠实度（Faithfulness）、答案相关性、上下文精度",
            "Ragas 框架：自动化 RAG 评估，支持 faithfulness/relevancy 等指标",
            "优化方向：分块策略、Embedding 模型、重排序、查询改写",
            "bad case 分析：找出失败案例，分类问题，针对性改进"
          ],
          practice: "RAG 评估与优化实战：1）构建测试集：a）准备 15-20 个问题和标准答案；b）标注每个问题对应的正确文档片段；c）这个测试集是你的基准。2）检索质量评估：a）计算 Recall@3、Recall@5、MRR；b）检索失败的 case 有哪些？c）是分块问题还是 Embedding 问题？3）生成质量评估：a）用 Ragas 评估——faithfulness（有没有幻觉）、answer_relevancy（答案相关吗）、context_precision（上下文精准吗）；b）人工抽样验证；c）分析 bad case。4）优化实验：a）调整分块大小（256、512、1024），看哪个效果最好；b）试试不同的 Embedding 模型；c）加 Reranker，看重排后效果提升多少。5）查询改写：a）实现 HyDE（假设文档嵌入）或多查询；b）对比改写前后的检索效果；c）哪种改写策略最有效？6）优化报告：a）记录所有实验结果；b）找出效果最好的配置；c）写一份 RAG 优化报告——基线、优化措施、效果提升、后续建议。",
          deep_dive: "RAG 评估是 RAG 工程的核心环节，没有评估就不知道优化有没有用：1）为什么 RAG 评估这么重要？很多人做 RAG 全靠感觉——「我觉得效果不错」。但主观感觉不可靠。可能 80% 的问题回答得好，但 20% 的很差，你没遇到而已。建立评估体系，能量化效果，才能知道优化方向对不对，才能持续迭代。2）评估的两个维度：RAG 评估要分两部分看——a）检索好不好：有没有把正确的文档找出来？这是基础，检索错了，生成再强也没用；b）生成好不好：基于检索到的内容，答案准不准确、有没有幻觉。两者都重要，但检索是地基。3）检索评估指标：a）Recall@k：前 k 个结果中包含正确答案的比例。Recall@5 达到 90%+ 是比较好的水平；b）MRR（平均倒数排名）：第一个正确结果的排名的倒数，越靠前越好；c）NDCG：考虑排名位置的加权指标。实际中最常用 Recall@k，简单直观。4）生成评估的难点：生成质量评估比检索难，因为答案是开放的。方法：a）人工评估：最准确但贵且慢；b）模型评估：用 GPT-4 等强模型当评委，自动评分；c）Ragas：专门的 RAG 评估框架，用 LLM 评估 faithfulness、relevancy 等指标。模型评估是现在的主流——快、便宜、还不错。5）常见的 RAG 问题和对应优化：a）检索不到相关内容 → 改分块策略、换 Embedding、查询改写；b）检索到但生成不用 → 改 Prompt、加引用强制；c）有幻觉 → 加忠实度检查、缩小上下文、更严格的 Prompt；d）答案不完整 → 增大 top-k、用更大的上下文窗口、增加 chunk 大小。定位问题是关键。6）RAG 优化的系统性方法：不要瞎试，要有方法论——a）先建立基线和测试集；b）评估当前效果，找到短板；c）假设：猜测最可能的优化方向；d）实验：做 A/B 测试验证；e）迭代：有效就保留，无效就换方向。和科学研究一样，假设 → 实验 → 验证。"
        }, duration: "2.5小时", resources: [{ title: "Ragas 文档", url: "https://docs.ragas.io/", required: false }, { title: "RAG 评估指南", url: "https://www.promptingguide.ai/zh/evaluation/rag", required: false }], checkpoint: "建立 RAG 评估体系，完成至少 3 组优化实验并量化效果" },
      { day: 9, title: "本地 RAG 系统部署",
        summary: "把本地 RAG 部署成可使用的服务，加前端界面", content: {
          objective: "今天你将部署完整的本地 RAG 系统。学完后能用 FastAPI 构建 RAG 后端服务，用 Streamlit/Gradio 做前端界面，支持文件上传和知识库管理，产出一个可以实际使用的本地知识库应用。",
          key_points: [
            "后端服务：FastAPI 封装 RAG 流程，REST API 接口",
            "前端界面：Streamlit/Gradio 构建友好的交互界面",
            "知识库管理：上传文件、重新向量化、删除文档",
            "流式输出：SSE 流式响应，提升用户体验",
            "本地部署优势：数据不离开本地、隐私安全、无 API 成本"
          ],
          practice: "本地 RAG 部署实战：1）后端 API：a）用 FastAPI 封装 RAG 系统；b）接口：/upload（上传文件）、/query（查询）、/list_files（文件列表）；c）后台处理上传的文件——解析 → 分块 → 向量化 → 存储。2）流式输出：a）用 SSE（Server-Sent Events）实现流式回答；b）前端逐字显示；c）对比流式和非流式的体验差异。3）前端界面：a）用 Streamlit 或 Gradio 做界面；b）两个页面：聊天页（和知识库对话）、管理页（上传/删除文件）；c）显示答案来源（点击可以看原文）；d）支持 Markdown 渲染。4）本地部署：a）写一个启动脚本，一键启动前后端；b）写 README，说明怎么安装、怎么使用；c）在你自己的电脑上跑起来，实际用一用。5）性能优化（可选）：a）缓存常见问题的答案；b）批量 Embedding 加速；c）用更快的 Embedding 模型。6）反思总结：a）本地 RAG 适合什么场景？b）不适合什么场景？c）和云端 RAG 比有什么优缺点？d）你会用本地 RAG 做什么？",
          deep_dive: "本地 RAG 是一个非常实用的项目，每个人都应该有一个自己的本地知识库：1）本地 RAG 的价值：为什么要做本地 RAG？a）隐私：你的笔记、文档、私人数据，不想上传到云端；b）成本：不需要 API 费用，自己的电脑就能跑；c）定制化：完全按照自己的需求定制；d）学习：做一遍本地 RAG，你就彻底理解 RAG 是怎么回事了。对个人用户来说，本地 RAG 既实用又有学习价值。2）本地部署的技术选型：本地 RAG 的技术栈可以很轻量——a）Embedding：用 sentence-transformers 跑本地模型，或用 Ollama 自带的 Embedding；b）向量库：Chroma 或 FAISS，本地文件存储，不需要服务器；c）LLM：llama.cpp 或 Ollama，本地跑开源模型；d）后端：FastAPI 或 Flask；e）前端：Streamlit 或 Gradio，简单快速。整套系统纯本地，不需要网络。3）知识库管理的细节：知识库不是一次性的，需要持续维护——a）增量添加：新文件上传，只向量化新内容，不需要重建整个库；b）删除文件：删除文件时，对应的向量也要删除；c）更新文件：文件修改了，要重新向量化；d）元数据：每个 chunk 要记录来源文件、页码等信息，方便溯源。4）用户体验设计：好的本地 RAG 不仅要能用，还要好用——a）流式输出：等全部生成完太无聊，逐字显示体验好太多；b）来源追溯：答案来自哪里，点一下就能看原文，增加信任；c）文件管理：拖拽上传、进度条、文件列表；d）对话历史：保存之前的对话，可以继续聊。5）从 Demo 到产品：本地 RAG 从 Demo 到真正每天用，中间还有很多细节——a）启动速度：能不能快速启动？b）模型切换：能不能方便地换不同大小的模型？c）多知识库：能不能建多个不同的知识库？d）移动端：能不能在手机上用？e）同步：多设备同步知识库。很多开源项目在做这些事。6）本地 RAG 的未来：本地 AI 是大趋势——a）模型越来越小越来越强，普通电脑就能跑；b）隐私意识增强，用户越来越在意数据所有权；c）端侧 AI 能力越来越强（手机、PC）；d）本地 + 云端混合：简单问题本地跑，复杂问题上云端。每个人都应该有一个自己的本地 AI 助手。"
        }, duration: "3小时", resources: [R_STREAMLIT, R_GRADIO, R_FASTAPI], checkpoint: "完成本地 RAG 系统部署，有前后端，可以实际使用" },
      { day: 10, title: "高级 RAG 技术与项目总结",
        summary: "探索高级 RAG 技术，完成项目总结和作品", content: {
          objective: "今天你将学习高级 RAG 技术并完成项目总结。学完后了解 GraphRAG、Agentic RAG、多模态 RAG 等前沿方向，完善项目文档和作品集，总结两周的学习收获。",
          key_points: [
            "GraphRAG：用知识图谱增强 RAG，处理复杂关系和多跳推理",
            "Agentic RAG：结合 Agent，让 RAG 系统能自主规划和多步检索",
            "多模态 RAG：支持图片、表格等非文本内容的检索和理解",
            "混合检索与重排序：BM25 + 向量 + Reranker，三层检索架构",
            "项目总结：文档、Demo、技术亮点、作品集准备"
          ],
          practice: "高级 RAG 与项目总结：1）高级技术探索（选 1-2 个深入）：a）混合检索：把 BM25 和向量检索结合，用 RRF 融合结果；b）重排序：加一个 Reranker（如 BGE-Reranker），精排 top-20 结果；c）查询改写：实现多查询或 HyDE，提升召回率。2）GraphRAG 概念学习：a）了解 GraphRAG 的原理——从文档中抽取实体和关系，构建知识图谱；b）GraphRAG 适合什么场景？（多跳推理、全局总结）c）如果有时间，试试用 LightRAG 或 GraphRAG 库做个小实验。3）项目完善：a）给你的 RAG 项目加一个炫酷的 README——项目截图、功能介绍、快速开始；b）录一个 Demo 视频或 GIF；c）整理代码，加注释，让别人能看懂。4）作品集准备：a）写项目描述（STAR 格式）；b）列出技术亮点（本地部署、隐私安全、混合检索、流式输出等）；c）准备面试可能被问到的问题：RAG 的原理、优化方法、评估指标、遇到的坑。5）总结与展望：a）总结这两周学到了什么；b）你做的 RAG 系统有什么特色？c）还有什么可以改进的地方？d）RAG 技术的未来发展方向你怎么看？6）展示：把你的项目分享出去——GitHub、博客、朋友圈，听听别人的反馈。",
          deep_dive: "RAG 技术发展很快，了解前沿方向能帮你保持竞争力：1）RAG 的演进：RAG 已经从「向量检索 + LLM」进化到更复杂的系统——a）Naive RAG：最基础的，检索 top-k 直接塞给 LLM；b）Advanced RAG：加了查询改写、重排序、分块优化等；c）Modular RAG：模块化设计，各种组件可以组合；d）Agentic RAG：结合 Agent，自主规划检索策略。每一代都比上一代更智能更复杂。2）GraphRAG 的价值：传统 RAG 处理不了需要多跳推理和全局理解的问题——比如「总结一下 A 公司和 B 公司的合作历史」，可能需要从多个文档中找信息并关联。GraphRAG 从文档中抽取实体和关系，构建知识图谱，然后基于图谱做推理。微软的 GraphRAG 项目证明了这种方法在全局总结和复杂查询上效果更好。3）Agentic RAG：把 RAG 和 Agent 结合，让系统自己决定——a）要不要检索？（有些问题不需要检索）b）检索什么？（自己改写查询）c）检索几次？（多步检索）d）用什么工具？（搜索、数据库、计算器）Agentic RAG 比固定流程的 RAG 更灵活，但也更不可控、更贵。4）多模态 RAG：现在的文档不只是文字，还有图片、表格、图表。多模态 RAG 需要——a）多模态 Embedding：能同时编码文本和图片；b）文档理解：能解析 PDF 中的表格、图片；c）多模态 LLM：能理解图片内容并回答。多模态 RAG 是下一个大方向，因为真实世界的知识大多不是纯文本的。5）RAG vs 微调：什么时候用 RAG，什么时候微调？a）RAG：知识更新频繁、需要溯源、数据量大但每次用一点、成本敏感；b）微调：需要学习风格/格式、数据量适中、需要模型内化知识、低延迟场景。两者不是互斥的，很多场景结合用——微调让模型学会「怎么用知识」，RAG 提供「知识本身」。6）RAG 的未来：RAG 技术还在快速演进——a）更好的检索：语义理解更强、多模态；b）更智能的 Agent：自主规划、自我改进；c）更隐私：本地 RAG、联邦 RAG；d）更易用：低代码/无代码 RAG 平台。RAG 从一个研究概念变成了每个 AI 应用的标配，这是非常值得深入的方向。"
        }, duration: "3小时", resources: [{ title: "GraphRAG", url: "https://github.com/microsoft/graphrag", required: false }, { title: "LightRAG", url: "https://github.com/HKUDS/LightRAG", required: false }], checkpoint: "完善 RAG 项目文档和作品集，了解高级 RAG 技术方向" },'''
                    
                    # Calculate position in full content
                    abs_old_start = dt_start + day7_pos
                    abs_old_end = dt_start + close_pos + 2
                    old_full = content[abs_old_start:abs_old_end]
                    
                    new_text = old_full.rstrip(',') + ',\n      ' + new_days
                    
                    content = content[:abs_old_start] + new_text + content[abs_old_end:]
                    print('llm-local-rag: added days 8-10 ✅')
                else:
                    print(f'could not find closing of day 7, close_pos: {close_pos}')

# =====================================================
# 2. llm-inference: add days 8-10 (has 7 days)
# =====================================================
idx2 = content.find('id: "llm-inference"')
if idx2 == -1:
    print('llm-inference NOT FOUND')
else:
    dt_start2 = content.find('dailyTasks: [', idx2)
    depth2 = 0
    i2 = dt_start2
    dt_end2 = -1
    while i2 < len(content):
        if content[i2] == '[':
            depth2 += 1
        elif content[i2] == ']':
            depth2 -= 1
            if depth2 == 0:
                dt_end2 = i2
                break
        i2 += 1
    
    if dt_end2 == -1:
        print('llm-inference dailyTasks end NOT FOUND')
    else:
        section2 = content[dt_start2:dt_end2]
        day_count2 = section2.count('day: ')
        print(f'llm-inference: currently {day_count2} days')
        
        # Check if day 7 exists
        day7_pos2 = section2.rfind('day: 7,')
        if day7_pos2 == -1:
            day7_pos2 = section2.rfind('day: 7')
        
        if day7_pos2 == -1:
            print('  day 7 not found, checking day 5...')
            day5_pos2 = section2.rfind('day: 5,')
            if day5_pos2 == -1:
                day5_pos2 = section2.rfind('day: 5')
            print(f'  last day at position: {day5_pos2}')

with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done!')