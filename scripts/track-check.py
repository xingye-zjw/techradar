import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

node_ids = re.findall(r'id: "([^"]+)"', content)
nodes = []
for node_id in node_ids:
    idx = content.find(f'id: "{node_id}"')
    dur_match = re.search(r'duration: "([^"]+)"', content[idx:idx+500])
    track_match = re.search(r'track: "([^"]+)"', content[idx:idx+500])
    duration = dur_match.group(1) if dur_match else 'unknown'
    track = track_match.group(1) if track_match else 'unknown'
    nodes.append((node_id, track, duration))

# Count days for each
def count_days(node_id):
    idx = content.find(f'id: "{node_id}"')
    if idx == -1:
        return 0
    dt_start = content.find('dailyTasks: [', idx)
    if dt_start == -1:
        return 0
    depth = 0
    i = dt_start
    while i < len(content):
        if content[i] == '[':
            depth += 1
        elif content[i] == ']':
            depth -= 1
            if depth == 0:
                break
        i += 1
    section = content[dt_start:i]
    return section.count('{ day: ')

# Group by track
tracks = {}
for node_id, track, duration in nodes:
    if track not in tracks:
        tracks[track] = []
    days = count_days(node_id)
    expected = {'1周': 5, '2周': 10, '3周': 15, '4周': 20}
    exp = expected.get(duration, 5)
    status = '✅' if days >= exp else ('⚠️' if days > 0 else '❌')
    tracks[track].append((node_id, duration, days, exp, status))

print('各 Track 节点状态：')
print('=' * 70)
total_nodes = 0
total_days = 0
for track in sorted(tracks.keys()):
    nodes_list = tracks[track]
    complete = sum(1 for n in nodes_list if n[4] == '✅')
    partial = sum(1 for n in nodes_list if n[4] == '⚠️')
    empty = sum(1 for n in nodes_list if n[4] == '❌')
    track_days = sum(n[2] for n in nodes_list)
    total_nodes += len(nodes_list)
    total_days += track_days
    
    print(f'\n【{track}】 ({len(nodes_list)} 个节点, {track_days} 天)')
    print(f'  ✅ 完整: {complete}  ⚠️ 部分: {partial}  ❌ 空: {empty}')
    for node_id, duration, days, exp, status in nodes_list:
        if status != '✅':
            print(f'    {status} {node_id} ({duration}): {days}/{exp} 天')

print()
print('=' * 70)
print(f'总计: {total_nodes} 个节点, {total_days} 天教学内容')
