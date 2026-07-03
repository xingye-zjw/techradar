"""
检查所有节点的前置依赖引用是否正确
"""
import re
from config import get_arg_parser, read_file

def main():
    parser = get_arg_parser('检查前置依赖')
    args = parser.parse_args()
    
    content = read_file(args.roadmap)
    
    node_ids = re.findall(r'id: "([^"]+)"', content)
    print(f'总共有 {len(node_ids)} 个节点')
    print()
    
    all_ids = set(node_ids)
    pattern = r'id: "([^"]+)".*?prerequisites: (\[[^\]]+\])'
    matches = re.findall(pattern, content, re.DOTALL)
    
    missing_refs = []
    for node_id, prereqs in matches:
        prereq_list = re.findall(r'"([^"]+)"', prereqs)
        for p in prereq_list:
            if p not in all_ids:
                missing_refs.append((node_id, p))
    
    if missing_refs:
        print('前置依赖引用不存在的节点：')
        for node_id, p in missing_refs:
            print(f'  {node_id} -> {p}')
    else:
        print('所有前置依赖引用都正确')

if __name__ == '__main__':
    main()