"""
检查资源类型是否完整
"""
import re
from config import get_arg_parser, read_file

def main():
    parser = get_arg_parser('检查资源类型')
    args = parser.parse_args()
    
    content = read_file(args.roadmap)
    
    none_count = len(re.findall(r'type:\s*"none"', content))
    no_type = len(re.findall(r'required:\s*(true|false)', content)) - len(re.findall(r'type:\s*"', content))
    
    print(f'type="none" 的资源数: {none_count}')
    print(f'无 type 字段的资源数: {no_type}')
    
    if none_count == 0 and no_type == 0:
        print('\n✅ 所有资源都有正确的类型标记')

if __name__ == '__main__':
    main()