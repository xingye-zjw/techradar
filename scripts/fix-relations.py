"""
智能化补全 relatedIntel 和 relatedTools 字段

策略：
1. 根据节点 ID 的前缀/主题匹配相关 intel
2. 根据 track 和名称匹配相关 tool
3. 优先匹配已存在的精确主题映射
4. 提供 1-3 个最相关的关联项
"""
import re
import os
import json

ROADMAP_FILE = r'd:\trae_match\techradar\lib\roadmap-data.ts'
INTEL_DIR = r'd:\trae_match\techradar\content\intel'
TOOLS_FILE = r'd:\trae_match\techradar\content\toolbox\tools.json'

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

# 智能映射表 - 节点ID -> (相关intel列表, 相关tool列表)
NODE_RELATIONS = {
    # CS
    'cs-algo': {
        'intel': ['050-cs-algo', '133-pitfall-algorithm'],
        'tools': ['NumPy', 'pandas'],
    },
    'cs-network': {
        'intel': ['075-cs-network', '108-pitfall-network'],
        'tools': [],
    },
    'cs-database': {
        'intel': ['076-cs-database', '107-pitfall-db'],
        'tools': [],
    },
    'cs-os': {
        'intel': ['051-cs-os', '105-pitfall-git'],
        'tools': ['GCC'],
    },

    # Embedded
    'embedded-c': {
        'intel': ['052-embedded-c', '140-pitfall-c-pointer-out-of-bounds'],
        'tools': ['GCC'],
    },
    'embedded-rtos': {
        'intel': ['053-embedded-rtos', '141-pitfall-rtos-task-stack-overflow'],
        'tools': ['FreeRTOS', 'STM32CubeMX'],
    },
    'embedded-driver': {
        'intel': ['077-embedded-driver', '097-pitfall-embedded'],
        'tools': ['STM32CubeMX'],
    },
    'embedded-hal': {
        'intel': ['078-embedded-hal', '069-embedded-arduino'],
        'tools': ['STM32CubeMX'],
    },

    # Electronics
    'elec-circuit': {
        'intel': ['054-elec-circuit', '070-elec-components', '111-pitfall-circuit'],
        'tools': ['LTspice'],
    },
    'elec-digital': {
        'intel': ['079-elec-digital', '111-pitfall-circuit'],
        'tools': ['LTspice'],
    },
    'elec-pcb': {
        'intel': ['080-elec-pcb', '098-pitfall-hardware'],
        'tools': [],
    },
    'elec-signals': {
        'intel': ['055-elec-signals', '066-signals-basics'],
        'tools': ['MATLAB'],
    },

    # Signals
    'signals-comm': {
        'intel': ['056-signals-comm', '082-signals-wireless'],
        'tools': ['MATLAB'],
    },
    'signals-dsp': {
        'intel': ['081-signals-dsp', '067-signals-filter-design', '143-pitfall-fft-spectral-leakage'],
        'tools': ['MATLAB', 'NumPy'],
    },
    'signals-wireless': {
        'intel': ['082-signals-wireless', '056-signals-comm'],
        'tools': ['MATLAB'],
    },

    # Control
    'ctrl-pid': {
        'intel': ['057-ctrl-pid', '068-ctrl-state-space', '142-pitfall-pid-tuning-oscillation'],
        'tools': ['MATLAB', 'NumPy'],
    },
    'ctrl-ros': {
        'intel': ['058-ctrl-ros', '144-pitfall-h-bridge-shoot-through'],
        'tools': ['ROS2'],
    },
    'ctrl-plc': {
        'intel': ['083-ctrl-plc', '110-pitfall-control'],
        'tools': [],
    },
    'ctrl-servo': {
        'intel': ['084-ctrl-servo', '110-pitfall-control'],
        'tools': ['MATLAB'],
    },

    # Electrical
    'elec-motor': {
        'intel': ['059-elec-motor', '144-pitfall-h-bridge-shoot-through'],
        'tools': ['LTspice', 'STM32CubeMX'],
    },
    'electrical-power': {
        'intel': ['071-elec-power-systems', '070-elec-components'],
        'tools': ['LTspice', 'MATLAB'],
    },
    'electrical-safety': {
        'intel': ['085-electrical-safety', '098-pitfall-hardware'],
        'tools': [],
    },

    # LLM
    'llm-fundamentals': {
        'intel': ['001-transformer', '029-moe-mixture-of-experts'],
        'tools': ['Hugging Face Transformers', 'PyTorch'],
    },
    'llm-pretraining': {
        'intel': ['037-distributed-training', '034-cuda-programming'],
        'tools': ['PyTorch', 'Hugging Face Transformers'],
    },
    'llm-finetune': {
        'intel': ['003-lora-qlora', '041-lora-finetuning', '015-rlhf'],
        'tools': ['Hugging Face Transformers'],
    },
    'llm-rag': {
        'intel': ['005-rag', '035-advanced-rag', '042-vector-database', '096-pitfall-rag'],
        'tools': ['LangChain', 'ChromaDB', 'pgvector + PostgreSQL'],
    },
    'llm-local-rag': {
        'intel': ['005-rag', '035-advanced-rag', '042-vector-database'],
        'tools': ['LangChain', 'ChromaDB', 'vLLM'],
    },
    'llm-inference': {
        'intel': ['019-vllm-inference', '065-llm-inference-optimization', '032-model-quantization'],
        'tools': ['vLLM', 'Triton Inference Server'],
    },
    'llm-prompt-engineering': {
        'intel': ['020-prompt-engineering', '031-agentic-ai'],
        'tools': ['LangChain'],
    },
    'llm-agent': {
        'intel': ['031-agentic-ai', '036-code-generation'],
        'tools': ['LangChain', 'Transformers Agent'],
    },
    'llm-evaluation': {
        'intel': ['039-model-evaluation', '038-llm-security'],
        'tools': ['MLflow', 'Weights & Biases'],
    },

    # CV
    'cv-cnn': {
        'intel': ['006-cnn-basics', '004-resnet', '002-yolo'],
        'tools': ['PyTorch', 'Ultralytics YOLO', 'OpenCV'],
    },
    'cv-detection': {
        'intel': ['002-yolo', '060-cv-instance-segmentation', '121-object-tracking'],
        'tools': ['Ultralytics YOLO', 'OpenCV'],
    },
    'cv-diffusion': {
        'intel': ['063-cv-diffusion', '030-multimodal-llm'],
        'tools': ['PyTorch'],
    },
    'cv-instance-segmentation': {
        'intel': ['060-cv-instance-segmentation', '002-yolo'],
        'tools': ['Ultralytics YOLO', 'Label Studio', 'OpenCV', 'Segment Anything'],
    },
    'cv-ocr': {
        'intel': ['062-cv-ocr', '006-cnn-basics'],
        'tools': ['OpenCV', 'PyTorch'],
    },
    'cv-pose-estimation': {
        'intel': ['061-cv-pose-estimation', '121-object-tracking'],
        'tools': ['Ultralytics YOLO', 'OpenCV'],
    },

    # NLP
    'nlp-rnn': {
        'intel': ['064-nlp-rnn', '101-pitfall-nlp'],
        'tools': ['PyTorch', 'Hugging Face Transformers'],
    },
    'nlp-word-embeddings': {
        'intel': ['064-nlp-rnn', '001-transformer'],
        'tools': ['Hugging Face Transformers', 'PyTorch'],
    },
    'nlp-sentiment-analysis': {
        'intel': ['064-nlp-rnn', '001-transformer'],
        'tools': ['Hugging Face Transformers', 'scikit-learn'],
    },
    'nlp-sequence-labeling': {
        'intel': ['064-nlp-rnn', '001-transformer'],
        'tools': ['Hugging Face Transformers', 'spaCy'],
    },
    'nlp-transformer': {
        'intel': ['001-transformer', '064-nlp-rnn'],
        'tools': ['Hugging Face Transformers', 'PyTorch'],
    },
    'nlp-machine-translation': {
        'intel': ['001-transformer', '030-multimodal-llm'],
        'tools': ['Hugging Face Transformers', 'PyTorch'],
    },

    # DevOps
    'linux-basic': {
        'intel': ['009-linux', '028-server-ops', '151-pitfall-ssh-connection-drop'],
        'tools': [],
    },
    'git-github': {
        'intel': ['008-git', '105-pitfall-git', '154-pitfall-git-merge-conflict-code-loss'],
        'tools': ['Git', 'VS Code'],
    },
    'docker-basic': {
        'intel': ['007-docker', '093-pitfall-docker', '152-pitfall-docker-gpu-not-available', '159-pitfall-docker-timezone-mismatch'],
        'tools': ['Docker'],
    },
    'devops-cicd': {
        'intel': ['007-docker', '021-kubernetes'],
        'tools': ['Docker', 'Git'],
    },
    'devops-docker-api': {
        'intel': ['007-docker', '019-vllm-inference', '026-onnx-deployment'],
        'tools': ['Docker', 'Triton Inference Server', 'vLLM'],
    },
    'devops-kubernetes': {
        'intel': ['021-kubernetes', '106-pitfall-k8s'],
        'tools': ['Kubernetes', 'Docker'],
    },
    'devops-monitoring': {
        'intel': ['022-prometheus-grafana', '103-pitfall-deployment'],
        'tools': ['Prometheus', 'Grafana'],
    },
    'devops-mlops': {
        'intel': ['018-mlflow', '043-mlops-engineering', '023-data-pipeline-etl'],
        'tools': ['MLflow', 'Kubeflow', 'Apache Airflow', 'DVC (Data Version Control)'],
    },

    # Math
    'math-linear-algebra': {
        'intel': ['072-math-linear-algebra', '074-math-tensor-ops'],
        'tools': ['NumPy', 'PyTorch'],
    },
    'math-probability': {
        'intel': ['073-math-probability', '024-information-theory'],
        'tools': ['NumPy', 'scikit-learn'],
    },
    'math-tensor-ops': {
        'intel': ['074-math-tensor-ops', '072-math-linear-algebra'],
        'tools': ['PyTorch', 'NumPy'],
    },
    'math-information-theory': {
        'intel': ['024-information-theory', '025-convex-optimization'],
        'tools': ['NumPy'],
    },
    'math-optimization': {
        'intel': ['025-convex-optimization', '072-math-linear-algebra'],
        'tools': ['NumPy'],
    },

    # Project
    'project-cv-classification': {
        'intel': ['004-resnet', '006-cnn-basics', '002-yolo'],
        'tools': ['PyTorch', 'Ultralytics YOLO', 'Streamlit'],
    },
    'project-rag-app': {
        'intel': ['005-rag', '035-advanced-rag', '042-vector-database'],
        'tools': ['LangChain', 'Streamlit', 'Gradio', 'ChromaDB'],
    },
    'project-llm-agent': {
        'intel': ['031-agentic-ai', '036-code-generation'],
        'tools': ['LangChain', 'Gradio'],
    },
    'project-data-pipeline': {
        'intel': ['023-data-pipeline-etl', '094-pitfall-data-engineering'],
        'tools': ['Apache Airflow', 'Dask', 'pandas'],
    },
    'project-iot-fastapi': {
        'intel': ['069-embedded-arduino', '077-embedded-driver'],
        'tools': ['FastAPI', 'ESP-IDF'],
    },
    'project-capstone': {
        'intel': ['043-mlops-engineering', '018-mlflow', '017-metrics'],
        'tools': ['MLflow', 'Weights & Biases', 'Docker', 'Kubernetes'],
    },

    # 通用
    'pytorch-core': {
        'intel': ['011-pytorch', '034-cuda-programming', '091-pitfall-gpu-cuda'],
        'tools': ['PyTorch'],
    },
}

def main():
    content = read_file(ROADMAP_FILE)

    # 验证 intel slugs 存在
    intel_files = os.listdir(INTEL_DIR)
    available_intels = set(f[:-3] for f in intel_files if f.endswith('.md'))

    # 验证 tool ids 存在
    tools_content = read_file(TOOLS_FILE)
    tools_data = json.loads(tools_content)
    if isinstance(tools_data, dict) and 'tools' in tools_data:
        tools_list = tools_data['tools']
    elif isinstance(tools_data, list):
        tools_list = tools_data
    else:
        tools_list = []

    # Use 'name' as the primary identifier (matching existing roadmap relatedTools)
    available_tools = set(t.get('name', '') for t in tools_list)
    # Also include slug for reference
    available_slugs = set(t.get('slug', '') for t in tools_list)
    print(f'Total available tools: {len(available_tools)}')
    print(f'Sample tools: {sorted(list(available_tools))[:10]}')

    # 通用默认映射 - 为映射表中没有的节点提供基础关联
    GENERAL_FALLBACK_TOOLS = {
        'cv-instance-segmentation': ['Ultralytics YOLO', 'OpenCV', 'Label Studio'],
        'project-iot-fastapi': ['FastAPI', 'STM32CubeMX'],
        'llm-local-rag': ['LangChain', 'ChromaDB', 'vLLM'],
        'devops-docker-api': ['Docker', 'Triton Inference Server', 'vLLM'],
        'math-tensor-ops': ['PyTorch', 'NumPy'],
        'cv-pose-estimation': ['Ultralytics YOLO', 'OpenCV'],
        'cv-ocr': ['OpenCV', 'PyTorch'],
        'cv-diffusion': ['PyTorch', 'Hugging Face Transformers'],
        'llm-inference': ['vLLM', 'Triton Inference Server'],
        'llm-prompt-engineering': ['LangChain', 'Hugging Face Transformers'],
        'devops-kubernetes': ['Kubernetes', 'Docker'],
        'devops-monitoring': ['Prometheus', 'Grafana'],
        'math-information-theory': ['NumPy'],
        'math-optimization': ['NumPy'],
        'project-data-pipeline': ['Apache Airflow', 'pandas', 'Dask'],
        'cs-network': [],  # 没有合适工具
        'cs-database': [],  # 没有合适工具
        'elec-pcb': ['LTspice'],
        'ctrl-plc': [],
        'electrical-safety': ['LTspice'],
    }

    fixes = 0
    for node_id, relations in NODE_RELATIONS.items():
        node_start = content.find(f'id: "{node_id}"')
        if node_start == -1:
            print(f'⚠️ Node {node_id} not found')
            continue

        # Find node end
        next_start = content.find('id: "', node_start + 10)
        if next_start == -1:
            next_start = len(content)
        node_block = content[node_start:next_start]

        # Validate intel references
        valid_intels = [i for i in relations['intel'] if i in available_intels]
        invalid_intels = [i for i in relations['intel'] if i not in available_intels]
        if invalid_intels:
            print(f'⚠️ {node_id}: invalid intel refs: {invalid_intels}')

        # Validate tool references
        valid_tools = [t for t in relations['tools'] if t in available_tools]
        invalid_tools = [t for t in relations['tools'] if t not in available_tools]
        if invalid_tools:
            print(f'⚠️ {node_id}: invalid tool refs: {invalid_tools}')

        # Update relatedIntel
        if valid_intels and 'relatedIntel:' in node_block:
            # Check if it's empty
            m = re.search(r'relatedIntel:\s*\[([^\]]*)\]', node_block)
            if m and not m.group(1).strip():
                # Replace empty array
                old_str = m.group(0)
                separator = '", "'
                joined = separator.join(valid_intels)
                new_str = 'relatedIntel: ["' + joined + '"]'
                node_block_new = node_block.replace(old_str, new_str, 1)
                content = content.replace(node_block, node_block_new, 1)
                fixes += 1
                print(f'✅ {node_id}: added relatedIntel = {valid_intels}')

        # Update relatedTools (handle both empty array and missing field)
        if valid_tools:
            if 'relatedTools:' in node_block:
                m = re.search(r'relatedTools:\s*\[([^\]]*)\]', node_block)
                if m is not None and not m.group(1).strip():
                    # Even if the array exists, if it's empty, fill it
                    old_str = m.group(0)
                    separator = '", "'
                    joined = separator.join(valid_tools)
                    new_str = 'relatedTools: ["' + joined + '"]'
                    node_block_new = node_block.replace(old_str, new_str, 1)
                    content = content.replace(node_block, node_block_new, 1)
                    fixes += 1
                    print(f'✅ {node_id}: filled empty relatedTools = {valid_tools}')
            else:
                # Field doesn't exist - find relatedIntel and add relatedTools after it
                m = re.search(r'relatedIntel:\s*\[[^\]]*\]', node_block)
                if m:
                    insert_pos = m.end()
                    separator = '", "'
                    joined = separator.join(valid_tools)
                    new_field = ', relatedTools: ["' + joined + '"]'
                    node_block_new = node_block[:insert_pos] + new_field + node_block[insert_pos:]
                    content = content.replace(node_block, node_block_new, 1)
                    fixes += 1
                    print(f'✅ {node_id}: added new relatedTools = {valid_tools}')

    # 处理映射表中没有的节点
    listed_nodes = set(NODE_RELATIONS.keys())
    all_node_pattern = r'id:\s*"([^"]+)"'
    all_nodes_in_file = re.findall(all_node_pattern, content)
    candidate_nodes = []
    for nid in all_nodes_in_file:
        if nid in listed_nodes or nid in ['RoadmapNode', 'Track', 'tools', 'tracks']:
            continue
        # Check if this is a node (has name, track, etc.)
        if f'name:' in content[content.find(f'id: "{nid}"'):content.find(f'id: "{nid}"')+200]:
            candidate_nodes.append(nid)

    print(f'\n剩余未在映射表中的节点: {len(candidate_nodes)}')
    for nid in candidate_nodes:
        tools = GENERAL_FALLBACK_TOOLS.get(nid)
        if tools is None:
            continue
        if not tools:
            print(f'⏭️ {nid}: 跳过 (无合适工具)')
            continue

        node_start = content.find(f'id: "{nid}"')
        if node_start == -1:
            continue
        next_start = content.find('id: "', node_start + 10)
        if next_start == -1:
            next_start = len(content)
        node_block = content[node_start:next_start]

        valid_tools = [t for t in tools if t in available_tools]

        if valid_tools:
            if 'relatedTools:' in node_block:
                m = re.search(r'relatedTools:\s*\[([^\]]*)\]', node_block)
                if m and not m.group(1).strip():
                    old_str = m.group(0)
                    separator = '", "'
                    joined = separator.join(valid_tools)
                    new_str = 'relatedTools: ["' + joined + '"]'
                    node_block_new = node_block.replace(old_str, new_str, 1)
                    content = content.replace(node_block, node_block_new, 1)
                    fixes += 1
                    print(f'✅ {nid}: added relatedTools = {valid_tools}')
            else:
                m = re.search(r'relatedIntel:\s*\[[^\]]*\]', node_block)
                if m:
                    insert_pos = m.end()
                    separator = '", "'
                    joined = separator.join(valid_tools)
                    new_field = ', relatedTools: ["' + joined + '"]'
                    node_block_new = node_block[:insert_pos] + new_field + node_block[insert_pos:]
                    content = content.replace(node_block, node_block_new, 1)
                    fixes += 1
                    print(f'✅ {nid}: added new relatedTools = {valid_tools}')

    with open(ROADMAP_FILE, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'\nTotal fixes: {fixes}')

if __name__ == '__main__':
    main()
