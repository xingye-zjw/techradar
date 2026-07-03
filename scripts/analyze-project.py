"""项目状态分析"""
import os
import re
from config import DEFAULT_PATHS

def main():
    intel_dir = DEFAULT_PATHS['intel']
    files = sorted(os.listdir(intel_dir))
    main_files = [f for f in files if f.endswith('.md') and not re.match(r'^(09|10|11|12|13|14|15|16)', f)]
    pitfall_files = [f for f in files if re.match(r'^(14[0-9]|15[0-9]|16[0-3])-', f)]
    classic_pitfalls = [f for f in files if re.match(r'^(09[0-9]|10[0-9]|11[0-9]|12[0-9]|13[0-9])-', f)]
    print(f'主线Intel: {len(main_files)}')
    print(f'经典pitfall: {len(classic_pitfalls)}')
    print(f'细化pitfall: {len(pitfall_files)}')
    print(f'Intel总数: {len([f for f in files if f.endswith(".md")])}')

    with open(DEFAULT_PATHS['roadmap'], 'r', encoding='utf-8') as f:
        content = f.read()
    node_count = len(re.findall(r'id:\s*"([^"]+)"', content))
    print(f'\n路线图节点: {node_count}')

    day_count = len(re.findall(r'\bday:\s*\d+', content))
    print(f'学习日总数: {day_count}')

    no_day = len(re.findall(r'dailyTasks:\s*\[\s*\]', content))
    print(f'空dailyTasks节点: {no_day}')

    no_desc = len(re.findall(r'description:\s*""', content))
    print(f'空description节点: {no_desc}')

    # 检查各track节点数
    track_pattern = r'track:\s*"([^"]+)"'
    tracks = re.findall(track_pattern, content)
    from collections import Counter
    print('\n各track节点数:')
    for track, count in sorted(Counter(tracks).items(), key=lambda x: -x[1]):
        print(f'  {track}: {count}')

if __name__ == '__main__':
    main()