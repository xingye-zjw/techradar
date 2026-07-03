"""
检查学习路径中引用的节点是否都存在于 roadmap-data.ts
"""
import re
import json

ROADMAP_FILE = r'd:\trae_match\techradar\lib\roadmap-data.ts'
LEARNING_PATHS_FILE = r'd:\trae_match\techradar\lib\learning-paths.ts'

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def main():
    # 获取所有节点 ID
    rm_content = read_file(ROADMAP_FILE)
    node_ids = set(re.findall(r'id:\s*"([^"]+)"', rm_content))

    # 获取学习路径中引用的节点
    lp_content = read_file(LEARNING_PATHS_FILE)
    all_refs = []
    for nodes_str in re.findall(r'nodes:\s*\[([^\]]+)\]', lp_content):
        refs = re.findall(r"'([^']+)'", nodes_str)
        all_refs.extend(refs)

    print(f'学习路径总节点引用数: {len(all_refs)}')
    print(f'去重后节点数: {len(set(all_refs))}')

    # 检查不存在的节点
    missing = [r for r in all_refs if r not in node_ids]
    if missing:
        print(f'\n❌ 不存在的节点引用: {missing}')
    else:
        print('\n✅ 所有节点引用都存在')

    # 统计每个路径覆盖的节点数
    paths = re.findall(r'\{\s*id:\s*"([^"]+)"[^}]*nodes:\s*\[([^\]]+)\]', lp_content)
    print(f'\n各学习路径节点数:')
    for path_id, nodes_str in paths:
        refs = re.findall(r"'([^']+)'", nodes_str)
        print(f'  {path_id}: {len(refs)} 个节点')

if __name__ == '__main__':
    main()
