import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

nodes_to_check = [
    'llm-local-rag',
    'llm-inference',
    'llm-prompt-engineering',
    'cv-instance-segmentation',
    'cv-pose-estimation',
    'cv-diffusion',
    'math-tensor-ops',
    'math-information-theory',
    'math-optimization',
]

for node_id in nodes_to_check:
    idx = content.find(f'id: "{node_id}"')
    if idx == -1:
        print(f'{node_id}: NOT FOUND')
        continue
    
    # Get node duration
    dur_match = re.search(r'duration: "([^"]+)"', content[idx:idx+800])
    duration = dur_match.group(1) if dur_match else 'unknown'
    
    dt_start = content.find('dailyTasks: [', idx)
    if dt_start == -1:
        print(f'{node_id} ({duration}): NO dailyTasks')
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
        print(f'{node_id} ({duration}): cannot find end')
        continue
    
    section = content[dt_start:dt_end]
    day_count = section.count('day: ')
    expected = {'1周': 5, '2周': 10, '3周': 15, '4周': 20}
    exp = expected.get(duration, 5)
    status = '✅' if day_count >= exp else ('⚠️' if day_count > 0 else '❌')
    
    print(f'{status} {node_id} ({duration}): {day_count}/{exp} 天')
