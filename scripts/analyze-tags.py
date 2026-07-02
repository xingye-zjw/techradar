"""
分析各模块的标签命名情况
"""
import os
import re
import json
from collections import Counter

def extract_tags_from_intel(intel_dir):
    """从情报文件提取 tags 和 keywords"""
    all_tags = []
    all_keywords = []
    
    for f in os.listdir(intel_dir):
        if not f.endswith('.md'):
            continue
        filepath = os.path.join(intel_dir, f)
        content = open(filepath, 'r', encoding='utf-8').read()
        
        # 提取 frontmatter
        fm_lines = []
        in_fm = False
        for line in content.split('\n'):
            if line.strip() == '---':
                if in_fm:
                    break
                in_fm = True
                continue
            if in_fm:
                fm_lines.append(line)
        
        # 解析 tags 和 keywords
        current_field = None
        for line in fm_lines:
            key_match = re.match(r'^(\w[\w-]*):', line)
            if key_match:
                current_field = key_match.group(1)
                value_part = line.split(':', 1)[1].strip()
                if value_part and not value_part.startswith('['):
                    if current_field == 'tags':
                        all_tags.append(value_part.strip('- '))
                    elif current_field == 'keywords':
                        all_keywords.append(value_part.strip('- '))
            elif current_field in ['tags', 'keywords'] and line.strip().startswith('-'):
                val = line.strip().lstrip('- ').strip()
                if current_field == 'tags':
                    all_tags.append(val)
                else:
                    all_keywords.append(val)
    
    return all_tags, all_keywords

def extract_tags_from_json(json_path, field_name):
    """从 JSON 文件提取标签字段"""
    tags = []
    if os.path.exists(json_path):
        data = json.load(open(json_path, 'r', encoding='utf-8'))
        if isinstance(data, dict):
            items = data.get('tools', []) or data.get('projects', []) or data.get('terms', [])
        elif isinstance(data, list):
            items = data
        else:
            items = []
        for item in items:
            field_val = item.get(field_name, [])
            if isinstance(field_val, str):
                field_val = [field_val]
            tags.extend(field_val)
    return tags

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    intel_dir = os.path.join(base_dir, 'content', 'intel')
    
    print("=" * 60)
    print("标签命名分析")
    print("=" * 60)
    
    # 1. 分析情报的 tags 和 keywords
    intel_tags, intel_keywords = extract_tags_from_intel(intel_dir)
    print(f"\n📚 情报模块:")
    print(f"  tags: {len(intel_tags)} 个")
    print(f"  keywords: {len(intel_keywords)} 个")
    
    # 2. 分析术语的 tags 和 keywords
    terms_tags = extract_tags_from_json(os.path.join(base_dir, 'content', 'glossary', 'terms.json'), 'tags')
    terms_keywords = extract_tags_from_json(os.path.join(base_dir, 'content', 'glossary', 'terms.json'), 'keywords')
    print(f"\n📖 术语模块:")
    print(f"  tags: {len(terms_tags)} 个")
    print(f"  keywords: {len(terms_keywords)} 个")
    
    # 3. 分析工具的 tags
    tools_tags = extract_tags_from_json(os.path.join(base_dir, 'content', 'toolbox', 'tools.json'), 'tags')
    print(f"\n🔧 工具模块:")
    print(f"  tags: {len(tools_tags)} 个")
    
    # 4. 分析项目的 tags
    projects_tags = extract_tags_from_json(os.path.join(base_dir, 'content', 'practice', 'projects.json'), 'tags')
    print(f"\n💡 项目模块:")
    print(f"  tags: {len(projects_tags)} 个")
    
    # 汇总所有标签
    all_tags = intel_tags + intel_keywords + terms_tags + terms_keywords + tools_tags + projects_tags
    print(f"\n📊 总计: {len(all_tags)} 个标签")
    
    # 分析语言分布
    chinese_count = sum(1 for t in all_tags if re.search(r'[\u4e00-\u9fff]', t))
    english_count = sum(1 for t in all_tags if not re.search(r'[\u4e00-\u9fff]', t))
    print(f"\n语言分布:")
    print(f"  中文标签: {chinese_count} ({chinese_count/len(all_tags)*100:.1f}%)")
    print(f"  英文标签: {english_count} ({english_count/len(all_tags)*100:.1f}%)")
    
    # 分析重复标签（大小写不敏感）
    tag_counts = Counter(t.lower() for t in all_tags if t.strip())
    duplicates = {k: v for k, v in tag_counts.items() if v > 1}
    print(f"\n重复标签 ({len(duplicates)} 组):")
    for tag, count in sorted(duplicates.items(), key=lambda x: -x[1])[:20]:
        # 找出原始标签形式
        originals = set(t for t in all_tags if t.lower() == tag)
        print(f"  {tag} ({count}次): {', '.join(sorted(originals))}")
    
    # 分析中文/英文对应关系
    print(f"\n中文/英文对应标签:")
    tag_map = {}
    for tag in all_tags:
        tag_lower = tag.lower()
        if tag_lower not in tag_map:
            tag_map[tag_lower] = []
        tag_map[tag_lower].append(tag)
    
    # 找出可能是同含义的中文/英文标签
    potential_pairs = []
    for tag_lower, originals in tag_map.items():
        if len(originals) >= 2:
            has_chinese = any(re.search(r'[\u4e00-\u9fff]', t) for t in originals)
            has_english = any(not re.search(r'[\u4e00-\u9fff]', t) for t in originals)
            if has_chinese and has_english:
                potential_pairs.append((tag_lower, originals))
    
    for tag_lower, originals in potential_pairs[:10]:
        print(f"  {', '.join(sorted(originals))}")

if __name__ == '__main__':
    main()