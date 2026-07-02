"""
分析各模块的分类使用情况
"""
import os
import re
import json
from collections import Counter

def extract_frontmatter_category(content):
    """从 Markdown frontmatter 提取 category"""
    # 使用更宽松的正则匹配
    lines = content.split('\n')
    in_fm = False
    for line in lines:
        if line.strip() == '---':
            in_fm = not in_fm
            continue
        if in_fm and line.startswith('category:'):
            return line.split(':', 1)[1].strip().strip('"').strip("'")
    return None

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 统计情报分类
    intel_dir = os.path.join(base_dir, 'content', 'intel')
    intel_categories = Counter()
    for f in os.listdir(intel_dir):
        if not f.endswith('.md') or 'pitfall' in f:
            continue
        filepath = os.path.join(intel_dir, f)
        content = open(filepath, 'r', encoding='utf-8').read()
        cat = extract_frontmatter_category(content)
        if cat:
            intel_categories[cat] += 1
    
    print("=== 情报分类分布 ===")
    for cat, count in intel_categories.most_common():
        print(f"  {cat}: {count}")
    
    # 统计术语分类
    terms_path = os.path.join(base_dir, 'content', 'glossary', 'terms.json')
    terms_categories = Counter()
    if os.path.exists(terms_path):
        terms = json.load(open(terms_path, 'r', encoding='utf-8'))
        for t in terms:
            if 'category' in t:
                terms_categories[t['category']] += 1
    
    print("\n=== 术语分类分布 ===")
    for cat, count in terms_categories.most_common():
        print(f"  {cat}: {count}")
    
    # 统计工具分类
    tools_path = os.path.join(base_dir, 'content', 'toolbox', 'tools.json')
    tools_categories = Counter()
    if os.path.exists(tools_path):
        tools_raw = json.load(open(tools_path, 'r', encoding='utf-8'))
        tools = tools_raw.get('tools', [])
        for t in tools:
            if 'category' in t:
                tools_categories[t['category']] += 1
    
    print("\n=== 工具分类分布 ===")
    for cat, count in tools_categories.most_common():
        print(f"  {cat}: {count}")
    
    # 统计 pitfall（新迁移的 140+）
    pitfall_categories = Counter()
    for f in os.listdir(intel_dir):
        if not f.endswith('.md') or 'pitfall' not in f:
            continue
        match = re.match(r'^(\d+)-', f)
        if match and int(match.group(1)) >= 140:
            filepath = os.path.join(intel_dir, f)
            content = open(filepath, 'r', encoding='utf-8').read()
            cat = extract_frontmatter_category(content)
            if cat:
                pitfall_categories[cat] += 1
    
    print("\n=== Pitfall 分类分布 ===")
    for cat, count in pitfall_categories.most_common():
        print(f"  {cat}: {count}")
    
    # 统计项目分类
    projects_path = os.path.join(base_dir, 'content', 'practice', 'projects.json')
    projects_categories = Counter()
    if os.path.exists(projects_path):
        projects_raw = json.load(open(projects_path, 'r', encoding='utf-8'))
        projects = projects_raw.get('projects', [])
        for p in projects:
            if 'category' in p:
                projects_categories[p['category']] += 1
    
    print("\n=== 项目分类分布 ===")
    for cat, count in projects_categories.most_common():
        print(f"  {cat}: {count}")
    
    # 合计所有分类
    all_categories = intel_categories + terms_categories + tools_categories + pitfall_categories + projects_categories
    print("\n=== 所有分类汇总 ===")
    for cat, count in all_categories.most_common():
        print(f"  {cat}: {count}")
    
    print(f"\n总计: {len(all_categories)} 种分类, {sum(all_categories.values())} 条内容")

if __name__ == '__main__':
    main()