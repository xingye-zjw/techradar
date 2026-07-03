import re

with open(r'd:\trae_match\techradar\lib\roadmap-data.ts', encoding='utf-8') as f:
    c = f.read()

node_pattern = re.compile(r'id:\s*"([^"]+)",\s*\n\s*name:\s*"([^"]+)",\s*\n\s*track:\s*"([^"]+)"')
nodes = node_pattern.findall(c)

track_nodes = {}
for nid, name, track in nodes:
    if track not in track_nodes:
        track_nodes[track] = []
    track_nodes[track].append((nid, name))

for track in sorted(track_nodes.keys()):
    print(f'{track}:')
    for nid, name in track_nodes[track]:
        print(f'  - {nid}: {name}')
    print()
