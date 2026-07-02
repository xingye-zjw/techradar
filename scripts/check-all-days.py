import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'id: "([^"]+)".*?duration: "([^"]+)".*?dailyTasks: \[(.*?)\],\n  '
matches = re.findall(pattern, content, re.DOTALL)

print('所有节点的 dailyTasks 天数统计：')
print('-' * 60)

short_nodes = []
total_days = 0
total_nodes = len(matches)

for node_id, duration, tasks_text in matches:
    day_count = tasks_text.count('{ day: ')
    total_days += day_count
    
    expected_days = {'1周': 5, '2周': 10, '3周': 15}
    expected = expected_days.get(duration, 5)
    
    status = '⚠️' if day_count < expected else '✅'
    if day_count < expected:
        short_nodes.append((node_id, duration, day_count, expected))
    
    print(f'{status} {node_id:30} | {duration:5} | {day_count:2} 天')

print('-' * 60)
print(f'总计: {total_nodes} 个节点, {total_days} 天内容')
print()
print('内容不足的节点（天数少于预期）：')
for node_id, duration, day_count, expected in short_nodes:
    print(f'  {node_id} ({duration}): {day_count}/{expected} 天')
