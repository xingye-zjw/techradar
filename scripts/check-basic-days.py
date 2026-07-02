import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

nodes_to_check = [
    'linux-basic',
    'git-github',
    'docker-basic',
    'math-linear-algebra',
    'math-probability',
    'pytorch-core',
    'cv-cnn',
    'cv-detection',
    'nlp-rnn',
    'nlp-transformer',
    'llm-finetune'
]

print('基础节点 dailyTasks 天数：')
for node_id in nodes_to_check:
    idx = content.find(f'id: "{node_id}"')
    if idx == -1:
        print(f'  {node_id}: NOT FOUND')
        continue
    
    dt_start = content.find('dailyTasks: [', idx)
    if dt_start == -1:
        print(f'  {node_id}: no dailyTasks')
        continue
    
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
        print(f'  {node_id}: cannot find end')
        continue
    
    section = content[dt_start:dt_end]
    day_count = section.count('{ day: ')
    print(f'  {node_id}: {day_count} 天')