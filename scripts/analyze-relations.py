"""
分析跨模块关联情况
"""
import os
import re
import json
from collections import Counter

def extract_related_fields(content, field_names):
    """从 Markdown frontmatter 提取关联字段"""
    results = {}
    lines = content.split('\n')
    in_fm = False
    current_field = None
    current_value = []
    
    for line in lines:
        if line.strip() == '---':
            if in_fm and current_field:
                results[current_field] = current_value
            in_fm = not in_fm
            current_field = None
            current_value = []
            continue
        
        if in_fm:
            # 检查是否是新字段
            field_match = re.match(r'^(\w[\w-]*):', line)
            if field_match:
                if current_field:
                    results[current_field] = current_value
                current_field = field_match.group(1)
                # 检查行内值
                value_part = line.split(':', 1)[1].strip()
                if value_part and not value_part.startswith('['):
                    current_value = [value_part.strip('- ')]
                else:
                    current_value = []
            elif current_field and line.strip().startswith('-'):
                current_value.append(line.strip().lstrip('- ').strip())
    
    # 最后一个字段
    if current_field:
        results[current_field] = current_value
    
    return {k: v for k, v in results.items() if k in field_names}

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    intel_dir = os.path.join(base_dir, 'content', 'intel')
    
    related_fields = ['prerequisites', 'relatedTerms', 'relatedIntel', 'relatedNodes', 'relatedTools']
    
    # 统计情报的关联情况
    intel_relations = {f: {'has': 0, 'total': 0, 'avg_count': 0, 'items': []} for f in related_fields}
    
    for f in os.listdir(intel_dir):
        if not f.endswith('.md') or 'pitfall' in f:
            continue
        filepath = os.path.join(intel_dir, f)
        content = open(filepath, 'r', encoding='utf-8').read()
        
        relations = extract_related_fields(content, related_fields)
        for field in related_fields:
            intel_relations[field]['total'] += 1
            if relations.get(field):
                intel_relations[field]['has'] += 1
                intel_relations[field]['avg_count'] += len(relations[field])
                intel_relations[field]['items'].extend(relations[field])
    
    print("=== 情报关联分析 ===")
    total_intel = intel_relations['prerequisites']['total']
    print(f"情报总数: {total_intel}")
    print()
    
    for field, stats in intel_relations.items():
        percentage = (stats['has'] / stats['total'] * 100) if stats['total'] > 0 else 0
        avg_count = (stats['avg_count'] / stats['has'] if stats['has'] > 0 else 0)
        print(f"{field}:")
        print(f"  有值: {stats['has']}/{stats['total']} ({percentage:.1f}%)")
        print(f"  平均数量: {avg_count:.1f}")
        if stats['items']:
            common_items = Counter(stats['items']).most_common(5)
            print(f"  常见值: {[f'{k}({v})' for k, v in common_items]}")
        print()
    
    # 统计术语的关联情况
    terms_path = os.path.join(base_dir, 'content', 'glossary', 'terms.json')
    term_relations = {'relatedTerms': 0, 'relatedIntel': 0, 'relatedTools': 0}
    total_terms = 0
    
    if os.path.exists(terms_path):
        terms = json.load(open(terms_path, 'r', encoding='utf-8'))
        total_terms = len(terms)
        for t in terms:
            if t.get('relatedTerms'):
                term_relations['relatedTerms'] += 1
            if t.get('relatedIntel'):
                term_relations['relatedIntel'] += 1
            if t.get('relatedTools'):
                term_relations['relatedTools'] += 1
    
    print("=== 术语关联分析 ===")
    print(f"术语总数: {total_terms}")
    for field, count in term_relations.items():
        percentage = (count / total_terms * 100) if total_terms > 0 else 0
        print(f"  {field}: {count}/{total_terms} ({percentage:.1f}%)")
    print()
    
    # 统计工具的关联情况
    tools_path = os.path.join(base_dir, 'content', 'toolbox', 'tools.json')
    tool_relations = {'relatedIntel': 0, 'relatedNodes': 0, 'relatedTerms': 0}
    total_tools = 0
    
    if os.path.exists(tools_path):
        tools_raw = json.load(open(tools_path, 'r', encoding='utf-8'))
        tools = tools_raw.get('tools', [])
        total_tools = len(tools)
        for t in tools:
            if t.get('relatedIntel'):
                tool_relations['relatedIntel'] += 1
            if t.get('relatedNodes'):
                tool_relations['relatedNodes'] += 1
            if t.get('relatedTerms'):
                tool_relations['relatedTerms'] += 1
    
    print("=== 工具关联分析 ===")
    print(f"工具总数: {total_tools}")
    for field, count in tool_relations.items():
        percentage = (count / total_tools * 100) if total_tools > 0 else 0
        print(f"  {field}: {count}/{total_tools} ({percentage:.1f}%)")
    print()
    
    # 统计项目的关联情况
    projects_path = os.path.join(base_dir, 'content', 'practice', 'projects.json')
    project_relations = {'relatedIntel': 0, 'relatedTerms': 0, 'relatedTools': 0, 'relatedNodes': 0}
    total_projects = 0
    
    if os.path.exists(projects_path):
        projects_raw = json.load(open(projects_path, 'r', encoding='utf-8'))
        projects = projects_raw.get('projects', [])
        total_projects = len(projects)
        for p in projects:
            if p.get('relatedIntel'):
                project_relations['relatedIntel'] += 1
            if p.get('relatedTerms'):
                project_relations['relatedTerms'] += 1
            if p.get('relatedTools'):
                project_relations['relatedTools'] += 1
            if p.get('relatedNodes'):
                project_relations['relatedNodes'] += 1
    
    print("=== 项目关联分析 ===")
    print(f"项目总数: {total_projects}")
    for field, count in project_relations.items():
        percentage = (count / total_projects * 100) if total_projects > 0 else 0
        print(f"  {field}: {count}/{total_projects} ({percentage:.1f}%)")
    print()
    
    # 统计路线图节点的关联
    roadmap_path = os.path.join(base_dir, 'lib', 'roadmap-data.ts')
    if os.path.exists(roadmap_path):
        content = open(roadmap_path, 'r', encoding='utf-8').read()
        node_count = content.count('id: ')
        print(f"路线图节点数: {node_count}")
    
    print("\n=== 关联完整性报告 ===")
    print("目标：80% 以上内容至少有 2 个跨模块关联")
    
    # 计算关联覆盖率
    intel_with_any = 0
    for f in os.listdir(intel_dir):
        if not f.endswith('.md') or 'pitfall' in f:
            continue
        filepath = os.path.join(intel_dir, f)
        content = open(filepath, 'r', encoding='utf-8').read()
        relations = extract_related_fields(content, related_fields)
        total_related = sum(len(v) for v in relations.values())
        if total_related >= 2:
            intel_with_any += 1
    
    intel_coverage = intel_with_any / total_intel * 100 if total_intel > 0 else 0
    print(f"情报关联覆盖率（≥2个关联）: {intel_with_any}/{total_intel} ({intel_coverage:.1f}%)")

if __name__ == '__main__':
    main()
