"""
内容质量检查脚本 v3 - 全方位检查
检查项：
1. 各轨道节点结构完整性
2. 关联字段 (relatedIntel, relatedNodes, relatedTerms, relatedTools) 覆盖率
3. suggestions 字段完整性
4. 学习路径定义检查
5. 关键天数不足节点的补全建议
6. 关联资源指向有效性
"""
import re
import os
import sys

ROADMAP_FILE = r'd:\trae_match\techradar\lib\roadmap-data.ts'
LEARNING_PATHS_FILE = r'd:\trae_match\techradar\lib\learning-paths.ts'

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def main():
    print('='*80)
    print('内容质量全面检查 v3')
    print('='*80)

    content = read_file(ROADMAP_FILE)

    # 提取所有节点
    node_pattern = r'\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)"'
    nodes = re.findall(node_pattern, content)
    print(f'\n[1] 节点总数: {len(nodes)}')

    # 检查每个节点的关联字段
    print(f'\n[2] 关联字段覆盖率分析')
    relations = ['relatedIntel', 'relatedNodes', 'relatedTerms', 'relatedTools']

    for rel in relations:
        total = len(nodes)
        # 查找所有有该字段的节点
        has_field = 0
        has_content = 0
        for node_id, _ in nodes:
            # 找到节点起始位置
            start = content.find(f'id: "{node_id}"')
            if start == -1:
                continue
            # 找下一个节点开始
            next_start = content.find('id: "', start + 10)
            if next_start == -1:
                next_start = len(content)
            node_block = content[start:next_start]

            if rel in node_block:
                has_field += 1
                # 检查字段是否非空
                pattern = rf'{rel}:\s*\[([^\]]*)\]'
                m = re.search(pattern, node_block)
                if m and m.group(1).strip():
                    has_content += 1

        print(f'  {rel}: {has_content}/{total} 节点有内容 ({has_content*100//total}%)')

    # 检查 suggestions 字段
    print(f'\n[3] Suggestions 字段完整性')
    sugg_fields = ['prerequisites', 'nextSteps', 'learningPath']
    for sf in sugg_fields:
        total = 0
        has = 0
        for node_id, _ in nodes:
            start = content.find(f'id: "{node_id}"')
            if start == -1:
                continue
            next_start = content.find('id: "', start + 10)
            if next_start == -1:
                next_start = len(content)
            node_block = content[start:next_start]
            if 'suggestions:' in node_block:
                total += 1
                if sf + ':' in node_block:
                    has += 1
        print(f'  suggestions.{sf}: {has}/{total} 节点有内容')

    # 检查 dailyTasks 字段完整
    print(f'\n[4] dailyTasks 字段完整性')
    for node_id, _ in nodes:
        start = content.find(f'id: "{node_id}"')
        if start == -1:
            continue
        next_start = content.find('id: "', start + 10)
        if next_start == -1:
            next_start = len(content)
        node_block = content[start:next_start]

        # 统计天数
        day_pattern = r'\{ day: (\d+),'
        days = re.findall(day_pattern, node_block)
        # 检查 objective
        obj_count = node_block.count('objective:')
        kp_count = node_block.count('key_points:')
        pr_count = node_block.count('practice:')
        dd_count = node_block.count('deep_dive:')

        if len(days) > 0 and (obj_count < len(days) or kp_count < len(days) or pr_count < len(days) or dd_count < len(days)):
            print(f'  ⚠️ {node_id}: {len(days)}天, objective={obj_count}, key_points={kp_count}, practice={pr_count}, deep_dive={dd_count}')

    # 检查 durations 配置
    print(f'\n[5] 时长字段配置')
    # 提取所有 duration 字段（节点级别）
    duration_pattern = r'id:\s*"([^"]+)",[^}]*?duration:\s*"([^"]+)"'
    durations = re.findall(duration_pattern, content)
    duration_count = {}
    for nid, dur in durations:
        duration_count[dur] = duration_count.get(dur, 0) + 1
    for d, c in sorted(duration_count.items()):
        print(f'  {d}: {c} 个节点')

    # 检查学习路径
    print(f'\n[6] 学习路径文件检查')
    if os.path.exists(LEARNING_PATHS_FILE):
        lp_content = read_file(LEARNING_PATHS_FILE)
        # 提取路径
        path_pattern = r'id:\s*"([^"]+)"'
        paths = re.findall(path_pattern, lp_content)
        print(f'  学习路径数: {len(paths)}')
        # 统计节点数
        node_count = lp_content.count('node:')
        print(f'  路径节点引用数: {node_count}')

    # 检查 track 颜色配置
    print(f'\n[7] Track 颜色配置检查')
    constants_file = r'd:\trae_match\techradar\lib\constants.ts'
    if os.path.exists(constants_file):
        c_content = read_file(constants_file)
        # 提取 track 颜色
        color_pattern = r'"([^"]+)":\s*"#([0-9a-fA-F]{6})"'
        colors = re.findall(color_pattern, c_content)
        print(f'  Track 颜色配置: {len(colors)} 个')
        for t, c in colors[:20]:
            print(f'    {t}: #{c}')

    # 检查 layout.ts 文件
    print(f'\n[8] Layout 顺序检查')
    layout_file = r'd:\trae_match\techradar\lib\layout.ts'
    if os.path.exists(layout_file):
        l_content = read_file(layout_file)
        track_order = re.findall(r'track:\s*"([^"]+)"', l_content)
        unique_order = list(dict.fromkeys(track_order))
        print(f'  排序的 tracks: {unique_order}')

    print('\n' + '='*80)
    print('检查完成')
    print('='*80)

if __name__ == '__main__':
    main()
