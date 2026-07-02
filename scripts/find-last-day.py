import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def get_node_dailyTasks(node_id):
    """Get the start and end positions of dailyTasks array for a node"""
    idx = content.find(f'id: "{node_id}"')
    if idx == -1:
        return None, None
    dt_start = content.find('dailyTasks: [', idx)
    if dt_start == -1:
        return None, None
    depth = 0
    i = dt_start
    while i < len(content):
        if content[i] == '[':
            depth += 1
        elif content[i] == ']':
            depth -= 1
            if depth == 0:
                return dt_start, i
        i += 1
    return None, None

def count_days(dt_start, dt_end):
    """Count days in dailyTasks section"""
    section = content[dt_start:dt_end]
    return section.count('day: ')

# Test: check llm-local-rag
node_id = 'llm-local-rag'
start, end = get_node_dailyTasks(node_id)
if start and end:
    days = count_days(start, end)
    print(f'{node_id}: {days} days, section length: {end-start} chars')
    
    # Find the last checkpoint
    section = content[start:end]
    last_checkpoint = section.rfind('checkpoint:')
    if last_checkpoint != -1:
        print(f'Last checkpoint at position {last_checkpoint} in section')
        print(f'Context: ...{section[last_checkpoint:last_checkpoint+100]}...')
else:
    print(f'{node_id}: not found')
