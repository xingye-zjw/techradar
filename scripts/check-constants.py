"""
检查 constants.ts 映射完整性
1. 所有 roadmap 节点 ID 是否在 NODE_NAMES 中
2. 所有 relatedIntel 是否在 INTEL_LINKS 中
3. 所有 relatedTools 是否在 TOOL_IDS 中
4. 所有 roadmap-data 中引用的 content 文件是否存在
"""
import re
import json
import os

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    roadmap_content = f.read()

with open('lib/constants.ts', 'r', encoding='utf-8') as f:
    constants_content = f.read()

with open('content/toolbox/tools.json', 'r', encoding='utf-8') as f:
    tools_data = json.load(f)

# 提取 INTEL_LINKS
intel_links = {}
match = re.search(r'INTEL_LINKS:\s*Record<string,\s*string>\s*=\s*\{(.*?)\};', constants_content, re.DOTALL)
if match:
    for m in re.finditer(r'"([^"]+)":\s*"([^"]+)"', match.group(1)):
        intel_links[m.group(1)] = m.group(2)

# 提取 NODE_NAMES
node_names = {}
match = re.search(r'NODE_NAMES:\s*Record<string,\s*string>\s*=\s*\{(.*?)\};', constants_content, re.DOTALL)
if match:
    for m in re.finditer(r'"([^"]+)":\s*"([^"]+)"', match.group(1)):
        node_names[m.group(1)] = m.group(2)

# 提取 TOOL_IDS
tool_ids = {}
match = re.search(r'TOOL_IDS:\s*Record<string,\s*string>\s*=\s*\{(.*?)\};', constants_content, re.DOTALL)
if match:
    for m in re.finditer(r'"([^"]+)":\s*"([^"]+)"', match.group(1)):
        tool_ids[m.group(1)] = m.group(2)

print("="*60)
print("Constants.ts 映射检查")
print("="*60)

print(f"\nINTEL_LINKS 条目数: {len(intel_links)}")
print(f"NODE_NAMES 条目数: {len(node_names)}")
print(f"TOOL_IDS 条目数: {len(tool_ids)}")
print(f"tools.json 工具数: {len(tools_data.get('tools', []))}")

# 提取所有节点 ID
node_ids = re.findall(r'id:\s*"([^"]+)"', roadmap_content)
print(f"\n路线图节点数: {len(node_ids)}")

# 检查 NODE_NAMES 缺失
missing_node_names = [nid for nid in node_ids if nid not in node_names]
print(f"\n❌ NODE_NAMES 缺失 ({len(missing_node_names)}):")
for nid in missing_node_names:
    print(f"  - {nid}")

# 检查多余的 NODE_NAMES
extra_node_names = [nid for nid in node_names if nid not in node_ids]
print(f"\n⚠️  NODE_NAMES 多余 ({len(extra_node_names)}):")
for nid in extra_node_names[:10]:
    print(f"  - {nid}")

# 检查 relatedIntel 缺失
related_intel = set()
for match in re.finditer(r'relatedIntel:\s*\[([^\]]*)\]', roadmap_content):
    for m in re.finditer(r'"([^"]+)"', match.group(1)):
        related_intel.add(m.group(1))

missing_intel = [iid for iid in related_intel if iid not in intel_links]
print(f"\n❌ INTEL_LINKS 缺失 ({len(missing_intel)}):")
for iid in missing_intel:
    print(f"  - {iid}")

# 检查 relatedTools 缺失
related_tools = set()
for match in re.finditer(r'relatedTools:\s*\[([^\]]*)\]', roadmap_content):
    for m in re.finditer(r'"([^"]+)"', match.group(1)):
        related_tools.add(m.group(1))

missing_tools = [tid for tid in related_tools if tid not in tool_ids]
print(f"\n❌ TOOL_IDS 缺失 ({len(missing_tools)}):")
for tid in missing_tools:
    print(f"  - {tid}")

# 检查 tools.json 中缺失的工具
tool_slugs = {t['slug'] for t in tools_data.get('tools', [])}
missing_in_tools_json = [tid for tid in related_tools if tid not in tool_slugs]
print(f"\n❌ tools.json 中缺失 ({len(missing_in_tools_json)}):")
for tid in missing_in_tools_json:
    print(f"  - {tid}")

# 检查 content/intel/ 中缺失的 Intel 文件
missing_intel_files = []
for iid in related_intel:
    filename = f'content/intel/{iid}.md'
    if not os.path.exists(filename):
        missing_intel_files.append(iid)

print(f"\n❌ content/intel/ 文件缺失 ({len(missing_intel_files)}):")
for iid in missing_intel_files[:20]:
    print(f"  - {iid}.md")
