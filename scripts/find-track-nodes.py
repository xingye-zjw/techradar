"""查找 signals/electrical/electronics track 的节点，以及学习路径"""
import re

# 1. 查找节点
with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 匹配 id 和 track
node_pattern = re.findall(r'id:\s*"([^"]+)"[^}]*?track:\s*"(signals|electrical|electronics)"', content, re.DOTALL)
print("=" * 60)
print("现有节点:")
for nid, track in node_pattern:
    print(f"  {track}: {nid}")

# 2. 查找学习路径
with open('lib/learning-paths.ts', 'r', encoding='utf-8') as f:
    lp = f.read()

for path_id in ['signals-path', 'electrical-path', 'electronics-path']:
    pattern = rf'id:\s*"{path_id}".*?nodes:\s*\[([^\]]*)\]'
    match = re.search(pattern, lp, re.DOTALL)
    if match:
        nodes = re.findall(r'"([^"]+)"', match.group(1))
        print(f"\n{path_id}: {len(nodes)} 节点")
        for n in nodes:
            print(f"  - {n}")
