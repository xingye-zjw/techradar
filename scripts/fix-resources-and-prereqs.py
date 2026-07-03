"""
补充缺失的学习资源和前置依赖
"""
import re

ROADMAP_PATH = 'lib/roadmap-data.ts'

with open(ROADMAP_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 资源定义模板
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

# 前置依赖映射
PREREQ_MAPPINGS = {
    'linux-basic': [],
    'git-github': ['linux-basic'],
    'docker-basic': ['linux-basic'],
    'math-linear-algebra': [],
    'math-probability': ['math-linear-algebra'],
    'pytorch-core': ['math-linear-algebra', 'math-probability'],
}


def add_resources_to_node(content, node_id, resources):
    """在指定节点的 dailyTasks 中为每个 task 补充 resources 字段"""
    # 找到节点区域
    pattern = rf'(id:\s*"{re.escape(node_id)}".*?)((?=id:\s*"|$))'
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        print(f"⚠️  未找到节点: {node_id}")
        return content

    node_block = match.group(1)
    original_block = node_block

    # 检查是否已有 resources 字段在 dailyTasks 中
    # 策略：在 dailyTasks 数组中，为每个缺少 resources 的 task 补充
    # 简化策略：找到第一个 dailyTasks 中的 task，在其后添加 resources
    # 更好的策略：在 duration 字段后面添加 resources

    # 匹配 dailyTasks 中的单个 task 对象
    task_pattern = r'(day:\s*\d+,\s*title:\s*"[^"]+",\s*content:\s*\{[^}]+\},\s*duration:\s*"[^"]+")([^,]*(?:checkpoint|completed))'

    def task_repl(m):
        prefix = m.group(1)
        suffix = m.group(2)
        # 如果已经有 resources 就不加
        if 'resources:' in prefix or 'resources:' in suffix:
            return m.group(0)
        res_str = ', resources: [' + ', '.join(resources) + ']'
        return prefix + res_str + ', ' + suffix

    # 更简单的策略：在 duration: "..." 之后，checkpoint 之前插入 resources
    updated_block = re.sub(
        r'(duration:\s*"[^"]+")(?!\s*,\s*resources)',
        rf'\1, resources: [{", ".join(resources)}]',
        node_block
    )

    if updated_block == node_block:
        print(f"⚠️  {node_id}: 无法插入 resources")
    else:
        print(f"✅ {node_id}: 已补充 resources")

    return content.replace(original_block, updated_block, 1)


def add_prerequisites(content, node_id, prereqs):
    """为节点添加前置依赖"""
    if not prereqs:
        return content
    pattern = rf'(id:\s*"{re.escape(node_id)}"[^,]*,\s*name:\s*"[^"]+",\s*track:\s*"[^"]+",\s*duration:\s*"[^"]+",\s*)prerequisites:\s*\[([^\]]*)\]'
    match = re.search(pattern, content)
    if not match:
        # 尝试更宽松的匹配
        pattern2 = rf'(id:\s*"{re.escape(node_id)}".*?prerequisites:\s*)\[([^\]]*)\]'
        match = re.search(pattern2, content, re.DOTALL)

    if match:
        existing = match.group(2).strip()
        if existing:
            print(f"⚠️  {node_id}: 已有前置依赖 [{existing}]，跳过")
            return content
        new_prereqs = ', '.join(f'"{p}"' for p in prereqs)
        old_str = match.group(0)
        new_str = match.group(1) + f'[{new_prereqs}]'
        content = content.replace(old_str, new_str, 1)
        print(f"✅ {node_id}: 已添加前置依赖 {prereqs}")
    else:
        print(f"⚠️  {node_id}: 未找到 prerequisites 字段")
    return content


def main():
    with open(ROADMAP_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    print("=" * 60)
    print("补充学习资源")
    print("=" * 60)
    for node_id, resources in RESOURCE_TEMPLATES.items():
        content = add_resources_to_node(content, node_id, resources)

    print("\n" + "=" * 60)
    print("补充前置依赖")
    print("=" * 60)
    for node_id, prereqs in PREREQ_MAPPINGS.items():
        if prereqs:
            content = add_prerequisites(content, node_id, prereqs)

    with open(ROADMAP_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

    print("\n✅ 完成")


if __name__ == '__main__':
    main()
