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

def find_last_day_end(section):
    """Find the position of the last day's closing brace and comma"""
    # Find the last checkpoint, then find the closing } after it
    last_cp = section.rfind('checkpoint:')
    if last_cp == -1:
        return None
    # Find } after checkpoint
    close_brace = section.find('}', last_cp)
    if close_brace == -1:
        return None
    return close_brace

# ============================================================
# 1. Fill llm-local-rag (7 -> 10 days)
# ============================================================
node_id = 'llm-local-rag'
start, end = get_node_dailyTasks(node_id)
if start and end:
    section = content[start:end]
    days = section.count('day: ')
    print(f'{node_id}: {days} days')
    
    if days == 7:
        last_end = find_last_day_end(section)
        if last_end is not None:
            # Position in full content
            insert_pos = start + last_end + 1  # after }
            
            new_days = ''',
      { day: 8, title: "RAG 评估与优化",
        summary: "建立 RAG 评估体系，优化检索和生成效果", content: {
          objective: "学习 RAG 系统的评估和优化方法。能建立检索和生成的评估指标，用自动化工具评估，找到系统瓶颈并针对性优化。",
          key_points: [
            "检索评估：Recall@k、MRR、NDCG，衡量检索相关内容的能力",
            "生成评估：忠实度、答案相关性、上下文精度",
            "bad case 分析：找出失败案例，分类问题，针对性改进",
            "优化方向：分块策略、Embedding 模型、重排序、查询改写"
          ],
          practice: "1）构建测试集：准备 15-20 个问题和标准答案，标注正确文档片段。2）检索评估：计算 Recall@3、Recall@5、MRR。3）生成评估：人工抽样验证答案质量和幻觉情况。4）优化实验：调整分块大小、换 Embedding 模型、加重排器。5）优化报告：记录实验结果，找出最优配置。",
          deep_dive: "RAG 评估是 RAG 工程的核心。没有评估就不知道优化有没有用。评估分两部分：检索好不好（有没有找到正确内容）、生成好不好（基于内容回答准不准确、有没有幻觉）。常见优化：检索不到→改分块策略/换 Embedding/查询改写；有幻觉→改 Prompt/加忠实度检查/缩小上下文。"
        }, duration: "2.5小时", resources: [{ title: "RAGAS 文档", url: "https://docs.ragas.io/", required: false }], checkpoint: "建立 RAG 评估体系，完成至少 3 组优化实验并量化效果" },
      { day: 9, title: "本地 RAG 系统部署",
        summary: "把本地 RAG 部署成可使用的服务，加前端界面", content: {
          objective: "部署完整的本地 RAG 系统。能用 FastAPI 构建后端服务，用 Streamlit/Gradio 做前端界面，支持文件上传，产出可以实际使用的本地知识库应用。",
          key_points: [
            "后端服务：FastAPI 封装 RAG 流程，REST API 接口",
            "前端界面：Streamlit/Gradio 构建友好的交互界面",
            "知识库管理：上传文件、重新向量化、删除文档",
            "流式输出：SSE 流式响应，提升用户体验"
          ],
          practice: "1）后端 API：用 FastAPI 封装——/upload（上传文件）、/query（查询）、/list_files（文件列表）。2）流式输出：用 SSE 实现流式回答，前端逐字显示。3）前端界面：用 Streamlit 做聊天页和管理页，显示答案来源。4）本地部署：写启动脚本，写 README，实际跑起来用。",
          deep_dive: "本地 RAG 是非常实用的项目——隐私（数据不上传）、成本（免费）、定制化（完全自己控制）。技术栈可以很轻量：Embedding 用 sentence-transformers，向量库用 Chroma/FAISS，LLM 用 llama.cpp/Ollama，后端 FastAPI，前端 Streamlit。整套系统纯本地运行。"
        }, duration: "3小时", resources: [R_STREAMLIT, R_GRADIO, R_FASTAPI], checkpoint: "完成本地 RAG 系统部署，有前后端，可以实际使用" },
      { day: 10, title: "高级 RAG 技术与项目总结",
        summary: "探索高级 RAG 技术，完成项目总结和作品", content: {
          objective: "了解高级 RAG 技术并完成项目总结。知道 GraphRAG、Agentic RAG、多模态 RAG 等前沿方向，完善项目文档和作品集。",
          key_points: [
            "GraphRAG：用知识图谱增强 RAG，处理复杂关系和多跳推理",
            "Agentic RAG：结合 Agent，自主规划和多步检索",
            "混合检索与重排序：BM25 + 向量 + Reranker，三层检索架构",
            "项目总结：文档、Demo、技术亮点、作品集准备"
          ],
          practice: "1）高级技术探索：实现混合检索（BM25+向量），或加重排器精排结果。2）项目完善：给项目加 README、Demo 截图、使用说明。3）作品集准备：写项目描述（STAR 格式），列出技术亮点，准备面试问题。4）总结：总结两周学到了什么，RAG 的未来方向。",
          deep_dive: "RAG 演进：Naive RAG→Advanced RAG→Modular RAG→Agentic RAG，每一代都更智能更复杂。GraphRAG 适合多跳推理和全局总结；Agentic RAG 更灵活但更不可控。RAG vs 微调：知识更新频繁/需要溯源用 RAG，学风格/内化知识用微调，两者常结合。"
        }, duration: "3小时", resources: [{ title: "GraphRAG", url: "https://github.com/microsoft/graphrag", required: false }], checkpoint: "完善 RAG 项目文档和作品集，了解高级 RAG 技术方向" }'''
            
            content = content[:insert_pos] + new_days + content[insert_pos:]
            print(f'  Added days 8-10 ✅')
        else:
            print('  Could not find last day end')
    else:
        print(f'  Already has {days} days')
else:
    print(f'{node_id}: NOT FOUND')

# Save
with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nPart 1 done (llm-local-rag)')