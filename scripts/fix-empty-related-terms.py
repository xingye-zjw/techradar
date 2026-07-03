"""为 relatedTerms 为空的术语补充有效关联"""
import json

TERMS_JSON = 'content/glossary/terms.json'

# 手动指定合理的关联（slug 必须在 terms.json 中存在）
SUPPLEMENT = {
    'pointer': ['data-structure'],
    'rtos': ['operating-system'],
    'operating-system': ['rtos'],
    'circuit': ['fourier-transform'],
    'fourier-transform': ['circuit'],
    'pid-controller': ['foc'],
    'foc': ['pid-controller'],
    'pose-estimation': ['instance-segmentation'],
    'ocr': ['pose-estimation'],
    'chain-of-thought': ['function-calling'],
    'function-calling': ['chain-of-thought'],
    'prometheus': ['kubernetes'],
    'onnx': ['vllm'],
    'rlhf': ['transformer'],
    'yolo': ['cnn'],
    'linux': ['docker'],
    'git': ['docker'],
    'rag': ['transformer'],
    'gradient-descent': ['matrix'],
}

with open(TERMS_JSON, 'r', encoding='utf-8') as f:
    terms = json.load(f)

existing_slugs = {t['slug'] for t in terms}
fixed = 0

for term in terms:
    related = term.get('relatedTerms', [])
    if not related and term['slug'] in SUPPLEMENT:
        new_related = [r for r in SUPPLEMENT[term['slug']] if r in existing_slugs]
        if new_related:
            term['relatedTerms'] = new_related
            fixed += 1
            print(f"✅ {term['slug']}: 添加 relatedTerms {new_related}")

with open(TERMS_JSON, 'w', encoding='utf-8') as f:
    json.dump(terms, f, ensure_ascii=False, indent=2)

print(f"\n共修复 {fixed} 个术语")
