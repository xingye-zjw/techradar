"""
统一标签命名规范：
1. 英文标签全部小写
2. 统一使用 tags 字段（废弃 keywords）
3. 清理重复标签
"""
import os
import re
import json

TAG_MAPPINGS = {
    'pytorch': 'pytorch',
    'PyTorch': 'pytorch',
    'cuda': 'cuda',
    'CUDA': 'cuda',
    'gpu': 'gpu',
    'GPU': 'gpu',
    'rag': 'rag',
    'RAG': 'rag',
    'llm': 'llm',
    'LLM': 'llm',
    'onnx': 'onnx',
    'ONNX': 'onnx',
    'mlops': 'mlops',
    'MLOps': 'mlops',
    'docker': 'docker',
    'Docker': 'docker',
    'git': 'git',
    'Git': 'git',
    'linux': 'linux',
    'Linux': 'linux',
    'nvidia': 'nvidia',
    'NVIDIA': 'nvidia',
    'dataloader': 'dataloader',
    'DataLoader': 'dataloader',
    'map': 'map',
    'mAP': 'map',
    'cnn': 'cnn',
    'CNN': 'cnn',
    'ssh': 'ssh',
    'SSH': 'ssh',
    'tensorflow': 'tensorflow',
    'TensorFlow': 'tensorflow',
    'keras': 'keras',
    'Keras': 'keras',
    'opencv': 'opencv',
    'OpenCV': 'opencv',
    'numpy': 'numpy',
    'NumPy': 'numpy',
    'pandas': 'pandas',
    'Pandas': 'pandas',
    'matplotlib': 'matplotlib',
    'Matplotlib': 'matplotlib',
    'scikit-learn': 'scikit-learn',
    'sklearn': 'scikit-learn',
    'Scikit-learn': 'scikit-learn',
    'transformers': 'transformers',
    'Transformers': 'transformers',
    'huggingface': 'huggingface',
    'HuggingFace': 'huggingface',
    'bert': 'bert',
    'BERT': 'bert',
    'gpt': 'gpt',
    'GPT': 'gpt',
    'diffusion': 'diffusion',
    'Diffusion': 'diffusion',
    'stable-diffusion': 'stable-diffusion',
    'Stable Diffusion': 'stable-diffusion',
}

def normalize_tag(tag):
    """规范化单个标签"""
    tag = tag.strip()
    if not tag:
        return None
    
    # 优先使用映射表
    if tag in TAG_MAPPINGS:
        return TAG_MAPPINGS[tag]
    
    # 英文标签转小写
    if re.match(r'^[a-zA-Z][a-zA-Z0-9_-]*$', tag):
        return tag.lower()
    
    # 中文标签保持原样
    return tag

def normalize_tags(tag_list):
    """规范化标签列表"""
    if isinstance(tag_list, str):
        tag_list = [tag_list]
    
    normalized = []
    seen = set()
    
    for tag in tag_list:
        normalized_tag = normalize_tag(tag)
        if normalized_tag and normalized_tag not in seen:
            normalized.append(normalized_tag)
            seen.add(normalized_tag)
    
    return normalized

def update_intel_tags(intel_dir):
    """更新情报文件的标签"""
    updated = 0
    
    for f in os.listdir(intel_dir):
        if not f.endswith('.md'):
            continue
        
        filepath = os.path.join(intel_dir, f)
        content = open(filepath, 'r', encoding='utf-8').read()
        
        # 提取 frontmatter
        lines = content.split('\n')
        in_fm = False
        fm_lines = []
        fm_start = 0
        fm_end = 0
        
        for i, line in enumerate(lines):
            if line.strip() == '---':
                if in_fm:
                    fm_end = i
                    break
                in_fm = True
                fm_start = i
                continue
            if in_fm:
                fm_lines.append(line)
        
        if not fm_lines:
            continue
        
        # 解析 frontmatter
        fm = {}
        current_key = None
        current_value = []
        
        for line in fm_lines:
            key_match = re.match(r'^(\w[\w-]*):', line)
            if key_match:
                if current_key:
                    fm[current_key] = current_value if len(current_value) > 1 else (current_value[0] if current_value else '')
                current_key = key_match.group(1)
                value_part = line.split(':', 1)[1].strip()
                if value_part and not value_part.startswith('['):
                    current_value = [value_part.strip()]
                else:
                    current_value = []
            elif current_key and line.strip().startswith('-'):
                current_value.append(line.strip().lstrip('- ').strip())
        
        if current_key:
            fm[current_key] = current_value if len(current_value) > 1 else (current_value[0] if current_value else '')
        
        # 合并 tags 和 keywords
        all_tags = []
        if 'tags' in fm:
            tags_val = fm['tags']
            if isinstance(tags_val, list):
                all_tags.extend(tags_val)
            else:
                all_tags.append(tags_val)
        
        if 'keywords' in fm:
            keywords_val = fm['keywords']
            if isinstance(keywords_val, list):
                all_tags.extend(keywords_val)
            else:
                all_tags.append(keywords_val)
        
        normalized_tags = normalize_tags(all_tags)
        
        # 更新 frontmatter
        need_update = False
        
        # 删除 keywords 字段
        if 'keywords' in fm:
            del fm['keywords']
            need_update = True
        
        # 更新 tags 字段
        if normalized_tags:
            fm['tags'] = normalized_tags
            need_update = True
        elif 'tags' in fm:
            del fm['tags']
            need_update = True
        
        if need_update:
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
            new_content = '\n'.join(new_fm_lines) + '\n' + '\n'.join(lines[fm_end+1:])
            open(filepath, 'w', encoding='utf-8').write(new_content)
            updated += 1
            print(f"✓ {f}: {len(all_tags)} → {len(normalized_tags)} tags")
    
    return updated

def update_json_tags(json_path):
    """更新 JSON 文件的标签"""
    if not os.path.exists(json_path):
        return 0
    
    data = json.load(open(json_path, 'r', encoding='utf-8'))
    
    if isinstance(data, dict):
        items_key = 'tools' if 'tools' in data else 'projects' if 'projects' in data else None
        if items_key:
            items = data[items_key]
        else:
            items = []
    elif isinstance(data, list):
        items = data
    else:
        return 0
    
    updated = 0
    for item in items:
        # 合并 tags 和 keywords
        all_tags = []
        if 'tags' in item:
            tags_val = item['tags']
            if isinstance(tags_val, list):
                all_tags.extend(tags_val)
            else:
                all_tags.append(tags_val)
        
        if 'keywords' in item:
            keywords_val = item['keywords']
            if isinstance(keywords_val, list):
                all_tags.extend(keywords_val)
            else:
                all_tags.append(keywords_val)
        
        normalized_tags = normalize_tags(all_tags)
        
        need_update = False
        
        # 删除 keywords 字段
        if 'keywords' in item:
            del item['keywords']
            need_update = True
        
        # 更新 tags 字段
        if normalized_tags:
            item['tags'] = normalized_tags
            need_update = True
        elif 'tags' in item:
            del item['tags']
            need_update = True
        
        if need_update:
            updated += 1
    
    if updated > 0:
        json.dump(data, open(json_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
        if isinstance(data, dict) and items_key:
            print(f"✓ {os.path.basename(json_path)}: {updated} items updated")
        else:
            print(f"✓ {os.path.basename(json_path)}: {updated} items updated")
    
    return updated

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    intel_dir = os.path.join(base_dir, 'content', 'intel')
    
    print("=" * 60)
    print("统一标签命名规范")
    print("=" * 60)
    print("规则：英文标签小写化、统一使用tags字段、清理重复")
    print("=" * 60)
    
    # 1. 更新情报文件
    print("\n📚 更新情报标签...")
    intel_updated = update_intel_tags(intel_dir)
    
    # 2. 更新工具文件
    print("\n🔧 更新工具标签...")
    tools_updated = update_json_tags(os.path.join(base_dir, 'content', 'toolbox', 'tools.json'))
    
    # 3. 更新术语文件
    print("\n📖 更新术语标签...")
    terms_updated = update_json_tags(os.path.join(base_dir, 'content', 'glossary', 'terms.json'))
    
    # 4. 更新项目文件
    print("\n💡 更新项目标签...")
    projects_updated = update_json_tags(os.path.join(base_dir, 'content', 'practice', 'projects.json'))
    
    print("\n" + "=" * 60)
    print(f"✓ 完成！")
    print(f"  情报: {intel_updated} 篇")
    print(f"  工具: {tools_updated} 个")
    print(f"  术语: {terms_updated} 条")
    print(f"  项目: {projects_updated} 个")
    print("=" * 60)

if __name__ == '__main__':
    main()