"""
检查节点级别的 resources 字段
"""
import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 提取每个节点的顶层内容（不包含 dailyTasks）
node_pattern = r'\{\s*\n\s*id:\s*"([^"]+)".*?dailyTasks:\s*\['
matches = re.findall(node_pattern, content, re.DOTALL)

print(f"找到 {len(matches)} 个节点")

nodes_with_resources = []
nodes_without_resources = []

for match in re.finditer(node_pattern, content, re.DOTALL):
    node_id = match.group(1)
    node_header = match.group(0)
    
    # 检查顶层是否有 resources 字段
    # 在 dailyTasks 之前找
    if re.search(r'resources:\s*\[', node_header):
        res_match = re.search(r'resources:\s*\[(.*?)\]', node_header, re.DOTALL)
        if res_match:
            count = len(re.findall(r'title:\s*"', res_match.group(1)))
            nodes_with_resources.append((node_id, count))
    else:
        nodes_without_resources.append(node_id)

print(f"\n有顶层 resources 的节点 ({len(nodes_with_resources)}):")
for nid, count in nodes_with_resources[:20]:
    print(f"  - {nid}: {count}个")

print(f"\n无顶层 resources 的节点 ({len(nodes_without_resources)}):")
for nid in nodes_without_resources[:20]:
    print(f"  - {nid}")
