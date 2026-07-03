"""
补充所有节点的 relatedNodes 字段，建立节点间的关联关系
策略：
1. 同 track 内的节点互相关联（学习顺序）
2. 跨 track 的关联（前置/后续关系）
3. 项目节点关联到对应的技术节点
"""
import re
from config import get_arg_parser, read_file, write_file

NODE_RELATIONS = {
    # DevOps
    'linux-basic': ['git-github', 'docker-basic', 'devops-docker-api'],
    'git-github': ['linux-basic', 'docker-basic', 'devops-cicd'],
    'docker-basic': ['linux-basic', 'git-github', 'devops-kubernetes', 'devops-docker-api'],
    'devops-docker-api': ['docker-basic', 'devops-kubernetes', 'devops-monitoring'],
    'devops-kubernetes': ['docker-basic', 'devops-docker-api', 'devops-monitoring'],
    'devops-cicd': ['git-github', 'docker-basic', 'devops-mlops'],
    'devops-monitoring': ['docker-basic', 'devops-kubernetes'],
    'devops-mlops': ['devops-cicd', 'devops-kubernetes', 'project-capstone'],

    # Math
    'math-linear-algebra': ['math-probability', 'math-tensor-ops', 'math-optimization'],
    'math-probability': ['math-linear-algebra', 'math-information-theory'],
    'math-tensor-ops': ['math-linear-algebra', 'pytorch-core'],
    'math-information-theory': ['math-probability', 'math-optimization'],
    'math-optimization': ['math-linear-algebra', 'math-probability'],

    # CS
    'cs-algo': ['cs-os', 'cs-network'],
    'cs-os': ['cs-algo', 'cs-network'],
    'cs-network': ['cs-os', 'cs-database'],
    'cs-database': ['cs-network'],

    # Embedded
    'embedded-c': ['embedded-rtos', 'embedded-driver'],
    'embedded-rtos': ['embedded-c', 'embedded-hal'],
    'embedded-driver': ['embedded-c', 'embedded-hal'],
    'embedded-hal': ['embedded-c', 'embedded-rtos', 'embedded-driver'],

    # Electronics
    'elec-circuit': ['elec-signals', 'elec-digital'],
    'elec-signals': ['elec-circuit', 'signals-comm'],
    'elec-digital': ['elec-circuit', 'elec-pcb'],
    'elec-pcb': ['elec-digital'],

    # Signals
    'signals-comm': ['signals-dsp', 'signals-wireless'],
    'signals-dsp': ['signals-comm', 'signals-wireless'],
    'signals-wireless': ['signals-comm', 'signals-dsp'],

    # Control
    'ctrl-pid': ['ctrl-ros', 'ctrl-servo'],
    'ctrl-ros': ['ctrl-pid', 'ctrl-plc'],
    'ctrl-plc': ['ctrl-ros'],
    'ctrl-servo': ['ctrl-pid', 'ctrl-ros'],

    # Electrical
    'elec-motor': ['electrical-power', 'ctrl-servo'],
    'electrical-power': ['elec-motor', 'electrical-safety'],
    'electrical-safety': ['electrical-power'],

    # CV
    'pytorch-core': ['math-linear-algebra', 'cv-cnn', 'nlp-rnn'],
    'cv-cnn': ['pytorch-core', 'cv-detection'],
    'cv-detection': ['cv-cnn', 'cv-instance-segmentation'],
    'cv-instance-segmentation': ['cv-detection', 'cv-pose-estimation'],
    'cv-pose-estimation': ['cv-detection'],
    'cv-ocr': ['cv-cnn'],
    'cv-diffusion': ['cv-cnn', 'llm-pretraining'],

    # NLP
    'nlp-rnn': ['pytorch-core', 'nlp-word-embeddings', 'nlp-transformer'],
    'nlp-word-embeddings': ['nlp-rnn', 'nlp-sentiment-analysis'],
    'nlp-sentiment-analysis': ['nlp-word-embeddings', 'nlp-sequence-labeling'],
    'nlp-sequence-labeling': ['nlp-rnn', 'nlp-transformer'],
    'nlp-transformer': ['nlp-rnn', 'llm-fundamentals'],
    'nlp-machine-translation': ['nlp-transformer', 'llm-pretraining'],

    # LLM
    'llm-fundamentals': ['nlp-transformer', 'llm-pretraining'],
    'llm-pretraining': ['llm-fundamentals', 'llm-finetune'],
    'llm-finetune': ['llm-pretraining', 'llm-rag'],
    'llm-rag': ['llm-finetune', 'llm-local-rag'],
    'llm-local-rag': ['llm-rag', 'llm-inference'],
    'llm-inference': ['llm-pretraining', 'llm-local-rag'],
    'llm-prompt-engineering': ['llm-rag', 'llm-agent'],
    'llm-agent': ['llm-prompt-engineering', 'llm-evaluation'],
    'llm-evaluation': ['llm-finetune', 'llm-agent'],

    # Project
    'project-cv-classification': ['cv-cnn', 'cv-detection'],
    'project-rag-app': ['llm-rag', 'llm-local-rag'],
    'project-llm-agent': ['llm-agent', 'llm-prompt-engineering'],
    'project-data-pipeline': ['devops-mlops'],
    'project-iot-fastapi': ['embedded-hal', 'embedded-driver'],
    'project-capstone': ['devops-mlops', 'llm-evaluation'],
}

def main():
    parser = get_arg_parser('补充节点关联关系')
    args = parser.parse_args()
    
    content = read_file(args.roadmap)
    fixes = 0

    for node_id, related_nodes in NODE_RELATIONS.items():
        node_start = content.find(f'id: "{node_id}"')
        if node_start == -1:
            print(f'⚠️ Node {node_id} not found')
            continue

        next_start = content.find('id: "', node_start + 10)
        if next_start == -1:
            next_start = len(content)
        node_block = content[node_start:next_start]

        if 'relatedNodes:' in node_block:
            m = re.search(r'relatedNodes:\s*\[([^\]]*)\]', node_block)
            if m and not m.group(1).strip():
                old_str = m.group(0)
                separator = '", "'
                joined = separator.join(related_nodes)
                new_str = 'relatedNodes: ["' + joined + '"]'
                node_block_new = node_block.replace(old_str, new_str, 1)
                content = content.replace(node_block, node_block_new, 1)
                fixes += 1
                print(f'✅ {node_id}: filled relatedNodes = {related_nodes}')
        else:
            m = re.search(r'relatedTerms:\s*\[[^\]]*\]', node_block)
            if m:
                insert_pos = m.end()
                separator = '", "'
                joined = separator.join(related_nodes)
                new_field = ', relatedNodes: ["' + joined + '"]'
                node_block_new = node_block[:insert_pos] + new_field + node_block[insert_pos:]
                content = content.replace(node_block, node_block_new, 1)
                fixes += 1
                print(f'✅ {node_id}: added relatedNodes = {related_nodes}')

    write_file(args.roadmap, content)
    print(f'\nTotal fixes: {fixes}')

if __name__ == '__main__':
    main()