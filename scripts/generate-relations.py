"""
自动生成跨模块关联数据
基于标题和关键词匹配相关内容
"""
import os
import re
import json
from collections import defaultdict

def extract_frontmatter(filepath):
    """提取 Markdown 文件的 frontmatter"""
    content = open(filepath, 'r', encoding='utf-8').read()
    lines = content.split('\n')
    in_fm = False
    fm_lines = []
    
    for line in lines:
        if line.strip() == '---':
            if in_fm:
                break
            in_fm = True
            continue
        if in_fm:
            fm_lines.append(line)
    
    # 解析 frontmatter 为字典
    fm = {}
    current_key = None
    current_value = []
    
    for line in fm_lines:
        key_match = re.match(r'^(\w[\w-]*):', line)
        if key_match:
            if current_key:
                if len(current_value) == 1 and '\n' not in current_value[0]:
                    fm[current_key] = current_value[0]
                else:
                    fm[current_key] = current_value
            current_key = key_match.group(1)
            value_part = line.split(':', 1)[1].strip()
            if value_part and not value_part.startswith('['):
                current_value = [value_part.strip('"').strip("'")]
            else:
                current_value = []
        elif current_key and line.strip().startswith('-'):
            current_value.append(line.strip().lstrip('- ').strip().strip('"').strip("'"))
    
    if current_key:
        if len(current_value) == 1 and '\n' not in current_value[0]:
            fm[current_key] = current_value[0]
        else:
            fm[current_key] = current_value
    
    return fm, content

def build_term_index(terms_path):
    """构建术语索引：术语名 -> slug"""
    index = {}
    if os.path.exists(terms_path):
        terms = json.load(open(terms_path, 'r', encoding='utf-8'))
        for t in terms:
            index[t['term'].lower()] = t['slug']
            # 也添加中文名（如果有）
            if 'name' in t:
                index[t['name'].lower()] = t['slug']
    return index

def build_tool_index(tools_path):
    """构建工具索引：工具名 -> slug"""
    index = {}
    if os.path.exists(tools_path):
        tools_raw = json.load(open(tools_path, 'r', encoding='utf-8'))
        tools = tools_raw.get('tools', [])
        for t in tools:
            index[t['name'].lower()] = t['slug']
            # 也添加别名
            if 'aliases' in t:
                for alias in t['aliases']:
                    index[alias.lower()] = t['slug']
    return index

def build_roadmap_index(roadmap_path):
    """构建路线图节点索引：节点名 -> id"""
    index = {}
    if os.path.exists(roadmap_path):
        content = open(roadmap_path, 'r', encoding='utf-8').read()
        # 解析 TypeScript 中的节点定义（使用 name 字段）
        nodes = re.findall(r'\{[^}]*id:\s*["\']([^"\']+)["\'][^}]*name:\s*["\']([^"\']+)["\'][^}]*\}', content)
        for nid, name in nodes:
            index[name.lower()] = nid
            # 也添加 track 信息
            track_match = re.search(r'track:\s*["\']([^"\']+)["\']', content)
            if track_match:
                track = track_match.group(1)
                index[track.lower()] = nid
    return index

def build_intel_index(intel_dir):
    """构建情报索引：slug -> (标题, keywords, category)"""
    index = {}
    for f in os.listdir(intel_dir):
        if not f.endswith('.md') or 'pitfall' in f:
            continue
        slug = f.replace('.md', '')
        filepath = os.path.join(intel_dir, f)
        fm, _ = extract_frontmatter(filepath)
        title = fm.get('title', '')
        keywords = fm.get('keywords', [])
        if isinstance(keywords, str):
            keywords = [keywords]
        category = fm.get('category', '')
        index[slug] = {
            'title': title.lower(),
            'keywords': [k.lower() for k in keywords],
            'category': category.lower()
        }
    return index

def match_relations(title, keywords, category, term_index, tool_index, roadmap_index, intel_index, max_matches=3):
    """根据标题、关键词和分类匹配关联内容"""
    title_lower = title.lower()
    
    relatedTerms = []
    relatedTools = []
    relatedNodes = []
    relatedIntel = []
    
    # 匹配术语
    for term_name, term_slug in term_index.items():
        if term_name in title_lower or term_name in [k.lower() for k in keywords]:
            relatedTerms.append(term_slug)
            if len(relatedTerms) >= max_matches:
                break
    
    # 匹配工具
    for tool_name, tool_slug in tool_index.items():
        if tool_name in title_lower or tool_name in [k.lower() for k in keywords]:
            relatedTools.append(tool_slug)
            if len(relatedTools) >= max_matches:
                break
    
    # 匹配路线图节点（基于标题或分类匹配）
    for node_name, node_id in roadmap_index.items():
        if node_name in title_lower:
            relatedNodes.append(node_id)
        elif category and (category in node_name or node_name in category):
            relatedNodes.append(node_id)
        if len(relatedNodes) >= max_matches:
            break
    
    # 匹配相关情报（基于分类）
    if category:
        for intel_slug, intel_data in intel_index.items():
            if intel_data['category'] == category and intel_data['title'] != title_lower:
                relatedIntel.append(intel_slug)
                if len(relatedIntel) >= max_matches:
                    break
    
    return {
        'relatedTerms': relatedTerms,
        'relatedTools': relatedTools,
        'relatedNodes': relatedNodes,
        'relatedIntel': relatedIntel
    }

def update_intel_frontmatter(filepath, new_relations):
    """更新情报文件的 frontmatter"""
    fm, content = extract_frontmatter(filepath)
    
    # 更新关联字段
    updated = False
    for field, values in new_relations.items():
        if values:
            existing = fm.get(field, [])
            if isinstance(existing, str):
                existing = [existing]
            # 去重并合并
            combined = list(dict.fromkeys(list(existing) + values))
            if combined != existing:
                fm[field] = combined
                updated = True
    
    if not updated:
        return False
    
    # 重新生成 frontmatter
    new_fm_lines = ['---']
    for key, value in fm.items():
        if isinstance(value, list):
            new_fm_lines.append(f'{key}:')
            for v in value:
                new_fm_lines.append(f'  - {v}')
        else:
            new_fm_lines.append(f'{key}: {value}')
    new_fm_lines.append('---')
    
    # 替换旧 frontmatter
    new_content = '\n'.join(new_fm_lines) + '\n' + content.split('---\n', 2)[2]
    
    open(filepath, 'w', encoding='utf-8').write(new_content)
    return True

def add_relatedIntel_to_terms(terms_path, intel_index):
    """为术语添加 relatedIntel"""
    if not os.path.exists(terms_path):
        return 0
    
    terms = json.load(open(terms_path, 'r', encoding='utf-8'))
    updated = 0
    
    for term in terms:
        term_name = term['term'].lower()
        relatedIntel = []
        
        for intel_slug, intel_data in intel_index.items():
            if term_name in intel_data['title'] or term_name in intel_data['keywords']:
                relatedIntel.append(intel_slug)
                if len(relatedIntel) >= 3:
                    break
        
        if relatedIntel:
            existing = term.get('relatedIntel', [])
            combined = list(dict.fromkeys(list(existing) + relatedIntel))
            if combined != existing:
                term['relatedIntel'] = combined
                updated += 1
    
    if updated > 0:
        json.dump(terms, open(terms_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    
    return updated

def add_relatedIntel_to_tools(tools_path, intel_index):
    """为工具添加 relatedIntel"""
    if not os.path.exists(tools_path):
        return 0
    
    tools_raw = json.load(open(tools_path, 'r', encoding='utf-8'))
    tools = tools_raw.get('tools', [])
    updated = 0
    
    for tool in tools:
        tool_name = tool['name'].lower()
        relatedIntel = []
        
        for intel_slug, intel_data in intel_index.items():
            if tool_name in intel_data['title'] or tool_name in intel_data['keywords']:
                relatedIntel.append(intel_slug)
                if len(relatedIntel) >= 3:
                    break
        
        if relatedIntel:
            existing = tool.get('relatedIntel', [])
            combined = list(dict.fromkeys(list(existing) + relatedIntel))
            if combined != existing:
                tool['relatedIntel'] = combined
                updated += 1
    
    if updated > 0:
        json.dump(tools_raw, open(tools_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    
    return updated

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    intel_dir = os.path.join(base_dir, 'content', 'intel')
    
    print("=" * 60)
    print("自动生成跨模块关联")
    print("=" * 60)
    
    # 1. 构建索引
    print("\n🔍 构建索引...")
    term_index = build_term_index(os.path.join(base_dir, 'content', 'glossary', 'terms.json'))
    tool_index = build_tool_index(os.path.join(base_dir, 'content', 'toolbox', 'tools.json'))
    roadmap_index = build_roadmap_index(os.path.join(base_dir, 'lib', 'roadmap-data.ts'))
    intel_index = build_intel_index(intel_dir)
    
    print(f"  术语索引: {len(term_index)} 条")
    print(f"  工具索引: {len(tool_index)} 条")
    print(f"  路线图索引: {len(roadmap_index)} 条")
    print(f"  情报索引: {len(intel_index)} 条")
    
    # 2. 为情报添加关联
    print("\n📚 为情报添加关联...")
    intel_updated = 0
    for f in sorted(os.listdir(intel_dir)):
        if not f.endswith('.md') or 'pitfall' in f:
            continue
        
        filepath = os.path.join(intel_dir, f)
        fm, _ = extract_frontmatter(filepath)
        
        title = fm.get('title', '')
        keywords = fm.get('keywords', [])
        category = fm.get('category', '')
        if isinstance(keywords, str):
            keywords = [keywords]
        
        relations = match_relations(title, keywords, category, term_index, tool_index, roadmap_index, intel_index)
        
        if any(relations.values()):
            if update_intel_frontmatter(filepath, relations):
                intel_updated += 1
                print(f"  ✓ {f}: relatedTerms={len(relations['relatedTerms'])}, relatedTools={len(relations['relatedTools'])}, relatedNodes={len(relations['relatedNodes'])}")
    
    print(f"\n  情报更新: {intel_updated} 篇")
    
    # 3. 为术语添加 relatedIntel
    print("\n📖 为术语添加 relatedIntel...")
    term_updated = add_relatedIntel_to_terms(os.path.join(base_dir, 'content', 'glossary', 'terms.json'), intel_index)
    print(f"  术语更新: {term_updated} 条")
    
    # 4. 为工具添加 relatedIntel
    print("\n🔧 为工具添加 relatedIntel...")
    tool_updated = add_relatedIntel_to_tools(os.path.join(base_dir, 'content', 'toolbox', 'tools.json'), intel_index)
    print(f"  工具更新: {tool_updated} 个")
    
    print("\n" + "=" * 60)
    print("✓ 关联生成完成！")
    print("=" * 60)

if __name__ == '__main__':
    main()
