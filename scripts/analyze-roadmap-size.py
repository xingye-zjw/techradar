import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

nodes = re.findall(r'id:\s*"([^"]+)"', content)
print(f'总节点数: {len(nodes)}')

days = len(re.findall(r'\bday:\s*\d+', content))
print(f'总学习日: {days}')

resources = len(re.findall(r'title:\s*"([^"]+)"', content))
print(f'总资源数: {resources}')

track_pattern = r'track:\s*"([^"]+)"'
tracks = re.findall(track_pattern, content)
from collections import Counter
print('\n按 track 分组:')
for track, count in Counter(tracks).items():
    print(f'  {track}: {count} 个节点')

# 估算每个 track 的大小
track_sizes = {}
for track in Counter(tracks).keys():
    pattern = rf'track:\s*"{track}"(.*?)(?=track:\s*"|$)'
    matches = re.findall(pattern, content, re.DOTALL)
    total_size = sum(len(m) for m in matches)
    track_sizes[track] = total_size

print('\n各 track 代码大小（字符）:')
for track, size in sorted(track_sizes.items(), key=lambda x: -x[1]):
    print(f'  {track}: {size:,} chars ({size/1024:.1f} KB)')