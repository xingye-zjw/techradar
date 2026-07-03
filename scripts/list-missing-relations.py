"""
列出所有需要补全关联的节点
"""
import re

ROADMAP_FILE = r'd:\trae_match\techradar\lib\roadmap-data.ts'
INTEL_DIR = r'd:\trae_match\techradar\content\intel'
TOOLS_FILE = r'd:\trae_match\techradar\content\toolbox\tools.json'

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def main():
    content = read_file(ROADMAP_FILE)

    # 提取所有节点及其关键字段
    node_pattern = r'\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)"'
    nodes = re.findall(node_pattern, content)

    print(f'总节点数: {len(nodes)}\n')

    # 分析每个节点
    print('='*80)
    print('缺少 relatedIntel 的节点')
    print('='*80)
    no_intel = []
    for node_id, name in nodes:
        start = content.find(f'id: "{node_id}"')
        if start == -1:
            continue
        next_start = content.find('id: "', start + 10)
        if next_start == -1:
            next_start = len(content)
        node_block = content[start:next_start]

        # 提取 relatedIntel 内容
        m = re.search(r'relatedIntel:\s*\[([^\]]*)\]', node_block)
        if m and m.group(1).strip():
            continue

        # 提取 track
        m = re.search(r'track:\s*"([^"]+)"', node_block)
        track = m.group(1) if m else 'unknown'

        no_intel.append((node_id, name, track))

    print(f'共 {len(no_intel)} 个节点缺少 relatedIntel:')
    for nid, name, track in no_intel:
        print(f'  - {track:15} {nid:35} {name}')

    # 列出所有可用的 intel slugs
    print('\n' + '='*80)
    print('所有可用的 intel slugs')
    print('='*80)
    import os
    intel_files = os.listdir(INTEL_DIR)
    intel_slugs = [f[:-3] for f in intel_files if f.endswith('.md')]
    intel_slugs.sort()
    print(f'共 {len(intel_slugs)} 个 intel 文件')
    for s in intel_slugs[:20]:
        print(f'  - {s}')
    if len(intel_slugs) > 20:
        print(f'  ... 还有 {len(intel_slugs) - 20} 个')

    # 列出所有可用的 tool ids
    print('\n' + '='*80)
    print('所有可用的 tool ids')
    print('='*80)
    tools_content = read_file(TOOLS_FILE)
    import json
    tools_data = json.loads(tools_content)
    if isinstance(tools_data, list):
        tool_ids = [t.get('id', t.get('name', '')) for t in tools_data]
    elif isinstance(tools_data, dict) and 'tools' in tools_data:
        tool_ids = [t.get('id', t.get('name', '')) for t in tools_data['tools']]
    else:
        tool_ids = []
    print(f'共 {len(tool_ids)} 个 tool')
    for t in tool_ids[:20]:
        print(f'  - {t}')
    if len(tool_ids) > 20:
        print(f'  ... 还有 {len(tool_ids) - 20} 个')

    # 列出缺少 relatedTools 的节点
    print('\n' + '='*80)
    print('缺少 relatedTools 的节点')
    print('='*80)
    no_tools = []
    for node_id, name in nodes:
        start = content.find(f'id: "{node_id}"')
        if start == -1:
            continue
        next_start = content.find('id: "', start + 10)
        if next_start == -1:
            next_start = len(content)
        node_block = content[start:next_start]

        m = re.search(r'relatedTools:\s*\[([^\]]*)\]', node_block)
        if m and m.group(1).strip():
            continue

        m = re.search(r'track:\s*"([^"]+)"', node_block)
        track = m.group(1) if m else 'unknown'

        no_tools.append((node_id, name, track))

    print(f'共 {len(no_tools)} 个节点缺少 relatedTools:')
    for nid, name, track in no_tools:
        print(f'  - {track:15} {nid:35} {name}')

if __name__ == '__main__':
    main()
