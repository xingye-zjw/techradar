"""
从 tools.json 生成工具 ID 到名称的映射，用于 constants.ts 中的 TOOL_IDS
"""
import json
from config import get_arg_parser, read_file

def main():
    parser = get_arg_parser('生成工具映射')
    args = parser.parse_args()
    
    content = read_file(args.tools)
    data = json.loads(content)
    
    tools = data['tools']
    for t in tools:
        print(f'"{t["slug"]}": "{t["name"]}",')

if __name__ == '__main__':
    main()