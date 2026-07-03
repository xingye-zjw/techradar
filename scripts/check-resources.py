"""
检查各节点的资源数量（支持常量引用统计）
"""
import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 提取所有节点
node_blocks = re.split(r'\n\s*\{\s*\n\s*id:\s*"', content)
print(f"总节点数: {len(node_blocks) - 1}")

nodes_with_few_resources = []
nodes_with_no_resources = []

for i, block in enumerate(node_blocks[1:], 1):
    id_match = re.match(r'([^"]+)"', block)
    if not id_match:
        continue
    node_id = id_match.group(1)

    # 找该节点内所有 resources 数组
    res_matches = re.findall(r'resources:\s*\[(.*?)\]', block, re.DOTALL)
    total_count = 0
    for res_content in res_matches:
        # 统计内联 title
        titles = len(re.findall(r'title:\s*"', res_content))
        # 统计常量引用（R_XXX 或 B_XXX）
        const_refs = len(re.findall(r'\b[RB]_[A-Z_]+\b', res_content))
        total_count += titles + const_refs

    if total_count == 0:
        nodes_with_no_resources.append(node_id)
    elif total_count < 3:
        nodes_with_few_resources.append((node_id, total_count))

print(f"\n无资源的节点 ({len(nodes_with_no_resources)}):")
for nid in nodes_with_no_resources:
    print(f"  - {nid}")

print(f"\n资源不足3个的节点 ({len(nodes_with_few_resources)}):")
for nid, count in nodes_with_few_resources:
    print(f"  - {nid}: {count}个")
