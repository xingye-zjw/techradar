"""
检查各关联字段的完整性
"""
import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 提取每个节点
node_pattern = r'\{\s*\n\s*id:\s*"([^"]+)".*?(?=\n\s*\{\s*\n\s*id:\s*"|$)'
nodes = re.findall(node_pattern, content, re.DOTALL)

print(f"总节点数: {len(nodes)}")
print("="*60)

checks = {
    'relatedIntel': [],
    'relatedTools': [],
    'relatedTerms': [],
    'relatedNodes': [],
    'prerequisites': [],
    'difficulty': [],
    'outcomes': [],
    'suggestions': [],
}

for match in re.finditer(node_pattern, content, re.DOTALL):
    node_id = match.group(1)
    node_content = match.group(0)
    
    for field in checks.keys():
        pattern = rf'{field}:\s*\[([^\]]*)\]'
        field_match = re.search(pattern, node_content)
        if field_match:
            val = field_match.group(1).strip()
            if not val:
                checks[field].append(node_id)
        else:
            if field == 'difficulty':
                if 'difficulty:' not in node_content:
                    checks[field].append(node_id)
            elif field == 'outcomes':
                if 'outcomes:' not in node_content:
                    checks[field].append(node_id)
            elif field == 'suggestions':
                if 'suggestions:' not in node_content:
                    checks[field].append(node_id)
            else:
                checks[field].append(node_id)

print("\n📋 关联字段完整性检查:")
print("-"*60)
for field, empty_nodes in checks.items():
    status = "✅" if len(empty_nodes) == 0 else f"⚠️ {len(empty_nodes)}"
    print(f"  {status:10} {field}")

print("\n📝 详细问题:")
print("-"*60)

# 无工具关联的节点
print(f"\n🔸 无工具关联 ({len(checks['relatedTools'])}):")
for nid in checks['relatedTools']:
    print(f"   - {nid}")

print(f"\n🔸 无前置依赖 ({len(checks['prerequisites'])}):")
for nid in checks['prerequisites']:
    print(f"   - {nid}")

print(f"\n🔸 无学习建议 ({len(checks['suggestions'])}):")
for nid in checks['suggestions']:
    print(f"   - {nid}")
