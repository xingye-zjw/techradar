"""
修复节点级别错误添加的 resources 字段：
1. 删除节点级别的 resources 字段
2. 在 dailyTasks 内部为每个 task 添加 resources
"""
import re

ROADMAP_PATH = 'lib/roadmap-data.ts'

RESOURCE_TEMPLATES = {
    'nlp-sentiment-analysis': [
        '{ title: "TextBlob 情感分析教程", url: "https://textblob.readthedocs.io/en/dev/quickstart.html#sentiment-analysis", required: true, type: "doc", source: "official" }',
        '{ title: "BERT 情感分类实战", url: "https://huggingface.co/blog/sentiment-analysis-python", required: true, type: "article", source: "official" }',
        '{ title: "中文情感分析数据集 ChnSentiCorp", url: "https://github.com/pengming617/bert_classification", required: false, type: "repo", source: "github" }',
    ],
    'nlp-sequence-labeling': [
        '{ title: "BiLSTM-CRF 序列标注详解", url: "https://arxiv.org/abs/1508.01991", required: true, type: "paper", source: "academic" }',
        '{ title: "spaCy NER 官方教程", url: "https://spacy.io/usage/training#ner", required: true, type: "doc", source: "official" }',
        '{ title: "HuggingFace Token Classification", url: "https://huggingface.co/docs/transformers/tasks/token_classification", required: false, type: "doc", source: "official" }',
    ],
    'nlp-machine-translation': [
        '{ title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", required: true, type: "paper", source: "academic" }',
        '{ title: "HuggingFace 翻译任务指南", url: "https://huggingface.co/docs/transformers/tasks/translation", required: true, type: "doc", source: "official" }',
        '{ title: "Fairseq 机器翻译教程", url: "https://github.com/facebookresearch/fairseq/tree/main/examples/translation", required: false, type: "repo", source: "github" }',
    ],
    'llm-fundamentals': [
        '{ title: "GPT-3 论文 Language Models are Few-Shot Learners", url: "https://arxiv.org/abs/2005.14165", required: true, type: "paper", source: "academic" }',
        '{ title: "Illustrated Transformer", url: "https://jalammar.github.io/illustrated-transformer/", required: true, type: "article", source: "blog" }',
        '{ title: "Andrej Karpathy 神经网络入门", url: "https://www.youtube.com/watch?v=VMj-3S1tku0", required: false, type: "video", source: "youtube" }',
    ],
    'llm-pretraining': [
        '{ title: "BLOOM 训练报告", url: "https://arxiv.org/abs/2211.05100", required: true, type: "paper", source: "academic" }',
        '{ title: "HuggingFace 预训练新手指南", url: "https://huggingface.co/docs/transformers/training", required: true, type: "doc", source: "official" }',
        '{ title: "Megatron-LM 分布式训练", url: "https://github.com/NVIDIA/Megatron-LM", required: false, type: "repo", source: "github" }',
    ],
    'llm-rag': [
        '{ title: "RAG 论文 Retrieval-Augmented Generation for Knowledge-Intensive NLP", url: "https://arxiv.org/abs/2005.11401", required: true, type: "paper", source: "academic" }',
        '{ title: "LangChain RAG 快速开始", url: "https://python.langchain.com/docs/tutorials/rag/", required: true, type: "doc", source: "official" }',
        '{ title: "向量数据库对比", url: "https://db-engines.com/en/article/Vector+DBMS", required: false, type: "article", source: "other" }',
    ],
    'llm-agent': [
        '{ title: "ReAct 论文 Reasoning + Acting", url: "https://arxiv.org/abs/2210.03629", required: true, type: "paper", source: "academic" }',
        '{ title: "LangChain Agent 文档", url: "https://python.langchain.com/docs/tutorials/agents/", required: true, type: "doc", source: "official" }',
        '{ title: "AutoGPT GitHub", url: "https://github.com/Significant-Gravitas/AutoGPT", required: false, type: "repo", source: "github" }',
    ],
    'llm-evaluation': [
        '{ title: "HELM 评估框架论文", url: "https://arxiv.org/abs/2211.09110", required: true, type: "paper", source: "academic" }',
        '{ title: "HuggingFace 评估指南", url: "https://huggingface.co/docs/transformers/tasks/sequence_classification", required: true, type: "doc", source: "official" }',
        '{ title: "OpenAI Evals 仓库", url: "https://github.com/openai/evals", required: false, type: "repo", source: "github" }',
    ],
}


def main():
    with open(ROADMAP_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    for node_id in RESOURCE_TEMPLATES:
        # 1. 删除节点级别的 resources 字段
        # 匹配模式: duration: "...", resources: [{...}]
        pattern = rf'(id:\s*"{re.escape(node_id)}".*?duration:\s*"[^"]+")\s*,\s*resources:\s*\[.*?\]'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            old_str = match.group(0)
            new_str = match.group(1)
            content = content.replace(old_str, new_str, 1)
            print(f"✅ {node_id}: 已删除节点级别的 resources")
        else:
            print(f"⚠️  {node_id}: 未找到节点级别的 resources")

        # 2. 在 dailyTasks 内部为每个 task 添加 resources
        resources = RESOURCE_TEMPLATES[node_id]
        res_str = ', resources: [' + ', '.join(resources) + ']'

        # 找到该节点的 dailyTasks 区域
        node_pattern = rf'(id:\s*"{re.escape(node_id)}".*?dailyTasks:\s*\[)'
        node_match = re.search(node_pattern, content, re.DOTALL)
        if not node_match:
            print(f"⚠️  {node_id}: 未找到 dailyTasks")
            continue

        # 在 dailyTasks 内部，为每个缺少 resources 的 task 添加
        # 匹配每个 task 中的 duration: "..."（后面没有 resources 的）
        task_pattern = r'(duration:\s*"[^"]+")(?!\s*,\s*resources)'

        def task_repl(m):
            return m.group(1) + res_str

        # 只在该节点的 dailyTasks 区域内替换
        # 先找到该节点的起始和结束位置
        node_start = node_match.start()
        # 找到该节点的结束位置（下一个 id: 或文件结束）
        next_id = re.search(r'\n\s*\{\s*\n\s*id:\s*"', content[node_start + 1:])
        if next_id:
            node_end = node_start + 1 + next_id.start()
        else:
            node_end = len(content)

        node_block = content[node_start:node_end]
        # 在 node_block 的 dailyTasks 部分替换
        daily_start = node_block.find('dailyTasks:')
        if daily_start == -1:
            print(f"⚠️  {node_id}: dailyTasks 标记未找到")
            continue

        daily_block = node_block[daily_start:]
        # 替换 daily_block 中的 duration（后面没有 resources 的）
        new_daily_block = re.sub(task_pattern, task_repl, daily_block)
        if new_daily_block != daily_block:
            new_node_block = node_block[:daily_start] + new_daily_block
            content = content[:node_start] + new_node_block + content[node_end:]
            print(f"✅ {node_id}: 已在 dailyTasks 内添加 resources")
        else:
            print(f"ℹ️  {node_id}: dailyTasks 内已有 resources")

    with open(ROADMAP_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

    print("\n✅ 修复完成")


if __name__ == '__main__':
    main()
