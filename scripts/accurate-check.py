import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

node_ids = re.findall(r'id: "([^"]+)"', content)
nodes = []
for node_id in node_ids:
    idx = content.find(f'id: "{node_id}"')
    dur_match = re.search(r'duration: "([^"]+)"', content[idx:idx+800])
    track_match = re.search(r'track: "([^"]+)"', content[idx:idx+800])
    duration = dur_match.group(1) if dur_match else 'unknown'
    track = track_match.group(1) if track_match else 'unknown'
    nodes.append((node_id, track, duration))

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
    return section.count('day: ')

tracks = {}
for node_id, track, duration in nodes:
    if track not in tracks:
        tracks[track] = {'complete': [], 'partial': [], 'empty': [], 'total_days': 0}
    
    days = count_days(node_id)
    expected = {'1周': 5, '2周': 10, '3周': 15, '4周': 20}
    exp = expected.get(duration, 5)
    tracks[track]['total_days'] += days
    
    if days >= exp:
        tracks[track]['complete'].append((node_id, duration, days, exp))
    elif days > 0:
        tracks[track]['partial'].append((node_id, duration, days, exp))
    else:
        tracks[track]['empty'].append((node_id, duration, days, exp))

print('=' * 70)
print('各 Track 节点内容统计')
print('=' * 70)

total_nodes = 0
total_days_all = 0
total_empty = 0
total_partial = 0
total_complete = 0

for track in sorted(tracks.keys()):
    t = tracks[track]
    c = len(t['complete'])
    p = len(t['partial'])
    e = len(t['empty'])
    total = c + p + e
    total_nodes += total
    total_days_all += t['total_days']
    total_empty += e
    total_partial += p
    total_complete += c
    
    print(f'\n【{track}】 {total} 个节点, {t["total_days"]} 天')
    print(f'  ✅ 完整: {c}  ⚠️ 部分: {p}  ❌ 空: {e}')
    
    if p > 0:
        print('  ⚠️ 部分节点:')
        for nid, dur, days, exp in t['partial']:
            print(f'     {nid} ({dur}): {days}/{exp} 天')
    
    if e > 0:
        print('  ❌ 空节点:')
        for nid, dur, days, exp in t['empty']:
            print(f'     {nid} ({dur}): {days}/{exp} 天')

print()
print('=' * 70)
print(f'总计: {total_nodes} 个节点, {total_days_all} 天教学内容')
print(f'✅ 完整: {total_complete}  ⚠️ 部分: {total_partial}  ❌ 空: {total_empty}')
