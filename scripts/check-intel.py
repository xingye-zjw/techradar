import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

intel_ids = re.findall(r'id: "([^"]+)"', content)

new_nodes = [
    'nlp-word-embeddings',
    'nlp-sentiment-analysis',
    'nlp-sequence-labeling',
    'nlp-machine-translation',
    'devops-cicd',
    'devops-mlops',
    'project-rag-app',
    'project-cv-classification',
    'project-llm-agent'
]

for node_id in new_nodes:
    idx = content.find(f'id: "{node_id}"')
    if idx == -1:
        continue
    
    ri_start = content.find('relatedIntel:', idx)
    if ri_start == -1:
        print(f'{node_id}: no relatedIntel')
        continue
    
    colon_idx = content.find(':', ri_start)
    bracket_start = content.find('[', colon_idx)
    bracket_end = content.find(']', bracket_start)
    
    if bracket_start != -1 and bracket_end != -1:
        ri_value = content[bracket_start:bracket_end+1]
        if '001' in ri_value or '007' in ri_value:
            print(f'{node_id}: {ri_value}')
        else:
            print(f'{node_id}: {ri_value} (可能需要补充)')
