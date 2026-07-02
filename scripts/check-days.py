import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

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

print('节点填充进度：')
for node_id in new_nodes:
    idx = content.find(f'id: "{node_id}"')
    if idx == -1:
        print(f'  {node_id}: NOT FOUND')
        continue
    
    # Find dailyTasks start
    dt_start = content.find('dailyTasks: [', idx)
    if dt_start == -1:
        print(f'  {node_id}: no dailyTasks')
        continue
    
    # Find matching closing bracket
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
        print(f'  {node_id}: cannot find end of dailyTasks')
        continue
    
    section = content[dt_start:dt_end]
    day_count = section.count('{ day: ')
    print(f'  {node_id}: {day_count} 天')
