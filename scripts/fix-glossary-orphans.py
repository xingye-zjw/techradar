"""
1. 将 14 个孤儿术语文件添加到 terms.json 索引中
2. 为 24 个缺失 relatedIntel 的 intel 文件补充该字段
"""
import json
import re
import os

# ============================================================
# Part 1: 修复 glossary 孤儿文件
# ============================================================

GLOSSARY_DIR = 'content/glossary/terms'
TERMS_JSON = 'content/glossary/terms.json'

# 14 个孤儿文件的 slug -> (term, category, relatedIntel, relatedTerms)
ORPHAN_META = {
    'transformer': {
        'term': 'Transformer',
        'category': 'llm',
        'relatedIntel': ['001-transformer'],
        'relatedTerms': ['self-attention', 'encoder-decoder', 'positional-encoding', 'multi-head-attention']
    },
    'self-attention': {
        'term': '自注意力机制',
        'category': 'llm',
        'relatedIntel': ['001-transformer'],
        'relatedTerms': ['transformer', 'multi-head-attention', 'attention', 'positional-encoding']
    },
    'cnn': {
        'term': '卷积神经网络',
        'category': 'computer-vision',
        'relatedIntel': ['006-cnn-basics', '004-resnet'],
        'relatedTerms': ['convolution', 'pooling', 'resnet', 'feature-map']
    },
    'resnet': {
        'term': 'ResNet',
        'category': 'computer-vision',
        'relatedIntel': ['004-resnet', '006-cnn-basics'],
        'relatedTerms': ['cnn', 'residual-connection', 'batch-norm', 'image-classification']
    },
    'yolo': {
        'term': 'YOLO',
        'category': 'computer-vision',
        'relatedIntel': ['002-yolo'],
        'relatedTerms': ['object-detection', 'anchor-box', 'nms', 'single-stage-detection']
    },
    'lora': {
        'term': 'LoRA',
        'category': 'llm',
        'relatedIntel': ['003-lora-qlora', '041-lora-finetuning'],
        'relatedTerms': ['fine-tuning', 'low-rank', 'peft', 'qlora']
    },
    'docker': {
        'term': 'Docker',
        'category': 'devops',
        'relatedIntel': ['007-docker'],
        'relatedTerms': ['container', 'image', 'dockerfile', 'kubernetes']
    },
    'linux': {
        'term': 'Linux',
        'category': 'devops',
        'relatedIntel': ['009-linux', '016-server-setup'],
        'relatedTerms': ['shell', 'ssh', 'kernel', 'cli']
    },
    'git': {
        'term': 'Git',
        'category': 'devops',
        'relatedIntel': ['008-git'],
        'relatedTerms': ['version-control', 'branch', 'commit', 'github']
    },
    'rag': {
        'term': 'RAG',
        'category': 'llm',
        'relatedIntel': ['005-rag', '035-advanced-rag', '042-vector-database'],
        'relatedTerms': ['retrieval', 'embedding', 'vector-database', 'llm']
    },
    'fine-tuning': {
        'term': '微调',
        'category': 'llm',
        'relatedIntel': ['003-lora-qlora', '041-lora-finetuning'],
        'relatedTerms': ['lora', 'peft', 'sft', 'transfer-learning']
    },
    'gradient-descent': {
        'term': '梯度下降',
        'category': 'math',
        'relatedIntel': ['025-convex-optimization'],
        'relatedTerms': ['backpropagation', 'learning-rate', 'adam', 'loss-function']
    },
    'matrix': {
        'term': '矩阵',
        'category': 'math',
        'relatedIntel': ['072-math-linear-algebra'],
        'relatedTerms': ['linear-algebra', 'eigenvalue', 'svd', 'tensor']
    },
    'tensor': {
        'term': '张量',
        'category': 'math',
        'relatedIntel': ['074-math-tensor-ops'],
        'relatedTerms': ['matrix', 'pytorch', 'gpu', 'ndarray']
    },
}


def extract_definition(filepath):
    """从 markdown 文件中提取第一段正文作为 definition"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    # 跳过标题行（# 开头）和空行，找第一段正文
    paragraphs = []
    current = []
    for line in lines[1:]:  # 跳过第一行标题
        if line.strip() == '':
            if current:
                paragraphs.append(' '.join(current))
                current = []
        elif line.startswith('#'):
            if current:
                paragraphs.append(' '.join(current))
                current = []
            break  # 遇到下一个标题就停
        elif line.startswith('```'):
            if current:
                paragraphs.append(' '.join(current))
                current = []
            break
        else:
            # 去掉 markdown 粗体标记
            clean = re.sub(r'\*\*([^*]+)\*\*', r'\1', line.strip())
            current.append(clean)

    if current:
        paragraphs.append(' '.join(current))

    # 取前两段拼合，限制长度
    definition = ' '.join(paragraphs[:2])
    if len(definition) > 300:
        definition = definition[:297] + '...'

    return definition


def fix_glossary_orphans():
    with open(TERMS_JSON, 'r', encoding='utf-8') as f:
        terms = json.load(f)

    existing_slugs = {t['slug'] for t in terms}
    added = 0

    for slug, meta in ORPHAN_META.items():
        if slug in existing_slugs:
            continue

        filepath = os.path.join(GLOSSARY_DIR, f'{slug}.md')
        definition = extract_definition(filepath)

        entry = {
            'term': meta['term'],
            'slug': slug,
            'definition': definition,
            'category': meta['category'],
            'relatedTerms': meta.get('relatedTerms', []),
        }
        if meta.get('relatedIntel'):
            entry['relatedIntel'] = meta['relatedIntel']

        terms.append(entry)
        added += 1
        print(f"✅ 已添加: {slug} ({meta['term']})")

    with open(TERMS_JSON, 'w', encoding='utf-8') as f:
        json.dump(terms, f, ensure_ascii=False, indent=2)

    print(f"\n共添加 {added} 个术语到 terms.json（总计 {len(terms)} 个）")


# ============================================================
# Part 2: 为 intel 文件补充 relatedIntel
# ============================================================

INTEL_DIR = 'content/intel'

# 24 个缺失 relatedIntel 的文件及其关联
INTEL_RELATED = {
    '140-pitfall-c-pointer-out-of-bounds': ['052-embedded-c', '097-pitfall-embedded'],
    '141-pitfall-rtos-task-stack-overflow': ['053-embedded-rtos', '097-pitfall-embedded'],
    '142-pitfall-pid-tuning-oscillation': ['057-ctrl-pid', '110-pitfall-control'],
    '143-pitfall-fft-spectral-leakage': ['081-signals-dsp', '055-elec-signals'],
    '144-pitfall-h-bridge-shoot-through': ['059-elec-motor', '111-pitfall-circuit'],
    '145-pitfall-cuda-pytorch-version-mismatch': ['011-pytorch', '034-cuda-programming'],
    '146-pitfall-cuda-out-of-memory': ['090-pitfall-dl-training', '034-cuda-programming'],
    '147-pitfall-loss-nan-gradient-explosion': ['090-pitfall-dl-training', '017-metrics'],
    '148-pitfall-onnx-export-dynamic-shape': ['014-onnx', '026-onnx-deployment'],
    '149-pitfall-multiprocess-dataloader-hang': ['011-pytorch', '092-pitfall-python'],
    '150-pitfall-rag-retrieval-hallucination': ['005-rag', '035-advanced-rag', '096-pitfall-rag'],
    '151-pitfall-ssh-connection-drop': ['009-linux', '016-server-setup'],
    '152-pitfall-docker-gpu-not-available': ['007-docker', '034-cuda-programming'],
    '153-pitfall-slow-convergence': ['090-pitfall-dl-training', '025-convex-optimization'],
    '154-pitfall-git-merge-conflict-code-loss': ['008-git', '105-pitfall-git'],
    '155-pitfall-python-dependency-conflict': ['092-pitfall-python', '093-pitfall-docker'],
    '156-pitfall-ssh-firewall-blocked': ['009-linux', '016-server-setup'],
    '157-pitfall-poor-data-labeling': ['040-data-annotation', '094-pitfall-data-engineering'],
    '158-pitfall-cuda-implicit-sync-slow-inference': ['034-cuda-programming', '019-vllm-inference'],
    '159-pitfall-docker-timezone-mismatch': ['007-docker', '093-pitfall-docker'],
    '160-pitfall-pandas-chained-assignment-warning': ['010-numpy-pandas', '094-pitfall-data-engineering'],
    '161-pitfall-gpu-architecture-mismatch': ['034-cuda-programming', '011-pytorch'],
    '162-pitfall-llm-prompt-escape-json-truncation': ['020-prompt-engineering', '095-pitfall-llm-app'],
    '114-asr-speech-recognition': ['115-tts-speech-synthesis', '001-transformer'],
}


def fix_intel_related():
    fixed = 0
    for slug, related in INTEL_RELATED.items():
        filepath = os.path.join(INTEL_DIR, f'{slug}.md')
        if not os.path.exists(filepath):
            print(f"⚠️  文件不存在: {filepath}")
            continue

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查是否已有 relatedIntel
        if re.search(r'^relatedIntel:', content, re.MULTILINE):
            print(f"ℹ️  {slug}: 已有 relatedIntel，跳过")
            continue

        # 在 tags 字段前插入 relatedIntel
        related_str = '\n'.join(f'  - {r}' for r in related)
        replacement = f'relatedIntel:\n{related_str}\ntags:'

        new_content = content.replace('tags:', replacement, 1)
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ {slug}: 已添加 relatedIntel ({len(related)} 个)")
            fixed += 1
        else:
            print(f"⚠️  {slug}: 未找到 tags 字段，无法插入")

    print(f"\n共修复 {fixed} 个 intel 文件")


if __name__ == '__main__':
    print("=" * 60)
    print("Part 1: 修复 glossary 孤儿文件")
    print("=" * 60)
    fix_glossary_orphans()

    print("\n" + "=" * 60)
    print("Part 2: 为 intel 文件补充 relatedIntel")
    print("=" * 60)
    fix_intel_related()
