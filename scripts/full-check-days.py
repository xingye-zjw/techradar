import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all node IDs
node_ids = re.findall(r'id: "([^"]+)"', content)
nodes = []
for node_id in node_ids:
    idx = content.find(f'id: "{node_id}"')
    dur_match = re.search(r'duration: "([^"]+)"', content[idx:idx+500])
    if dur_match:
        nodes.append((node_id, dur_match.group(1)))
    else:
        nodes.append((node_id, 'unknown'))

print(f'所有 {len(nodes)} 个节点的 dailyTasks 统计：')
print('=' * 70)

total_days = 0
complete_nodes = []
incomplete_nodes = []
zero_nodes = []

for node_id, duration in nodes:
    idx = content.find(f'id: "{node_id}"')
    if idx == -1:
        continue
    
    dt_start = content.find('dailyTasks: [', idx)
    if dt_start == -1:
        zero_nodes.append((node_id, duration, 0))
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
        zero_nodes.append((node_id, duration, 0))
        continue
    
    section = content[dt_start:dt_end]
    day_count = section.count('{ day: ')
    total_days += day_count
    
    expected = {'1周': 5, '2周': 10, '3周': 15, '4周': 20}
    exp_days = expected.get(duration, 5)
    
    if day_count == 0:
        zero_nodes.append((node_id, duration, day_count))
    elif day_count >= exp_days:
        complete_nodes.append((node_id, duration, day_count))
    else:
        incomplete_nodes.append((node_id, duration, day_count, exp_days))

print(f'完整节点 ({len(complete_nodes)} 个):')
for node_id, duration, days in complete_nodes[:10]:
    print(f'  ✅ {node_id} ({duration}): {days} 天')
if len(complete_nodes) > 10:
    print(f'  ... 还有 {len(complete_nodes) - 10} 个完整节点')

print()
print(f'不完整节点 ({len(incomplete_nodes)} 个):')
for node_id, duration, days, exp in incomplete_nodes[:10]:
    print(f'  ⚠️ {node_id} ({duration}): {days}/{exp} 天')
if len(incomplete_nodes) > 10:
    print(f'  ... 还有 {len(incomplete_nodes) - 10} 个不完整节点')

print()
print(f'空节点 ({len(zero_nodes)} 个):')
for node_id, duration, days in zero_nodes[:10]:
    print(f'  ❌ {node_id} ({duration}): {days} 天')
if len(zero_nodes) > 10:
    print(f'  ... 还有 {len(zero_nodes) - 10} 个空节点')

print()
print('=' * 70)
print(f'总计: {len(nodes)} 个节点, {total_days} 天教学内容')