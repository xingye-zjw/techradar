import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INTEL_DIR = os.path.join(BASE_DIR, 'content', 'intel')

REPLACEMENTS = {
    'nlp-local-rag': 'llm-local-rag',
    'nlp-llm-inference': 'llm-inference',
    'nlp-prompt-engineering': 'llm-prompt-engineering',
}

updated = 0
for f in os.listdir(INTEL_DIR):
    if not f.endswith('.md'):
        continue
    filepath = os.path.join(INTEL_DIR, f)
    content = open(filepath, 'r', encoding='utf-8').read()
    
    changed = False
    for old, new in REPLACEMENTS.items():
        if old in content:
            content = content.replace(old, new)
            changed = True
    
    if changed:
        open(filepath, 'w', encoding='utf-8').write(content)
        updated += 1
        print(f"✓ {f}")

print(f"\n更新完成！共更新 {updated} 个文件")