"""
批量迁移分类：将旧分类映射到新的 12 个大类
"""
import os
import re
import json

# 旧分类 -> 新分类 的映射表
CATEGORY_MAP = {
    # LLM 相关
    'llm-fundamentals': 'llm',
    'llm-application': 'llm',
    
    # 数学相关
    'math-foundations': 'math',
    'mathematics': 'math',
    
    # DevOps 相关
    'infrastructure': 'devops',
    'deployment': 'devops',
    'tools': 'devops',
    'training': 'devops',
    'evaluation': 'devops',
    
    # 数据处理相关
    'data-engineering': 'data-processing',
    'data-science': 'data-processing',
    
    # 嵌入式/硬件相关
    'electronics': 'embedded',
    'electrical': 'embedded',
    'signals': 'embedded',
    'control': 'embedded',
    
    # 计算机基础
    'computer-science': 'cs',
    
    # 语音处理
    'speech-processing': 'speech',
    
    # NLP 相关
    'knowledge-graph': 'nlp',
    
    # 机器学习相关
    'reinforcement-learning': 'machine-learning',
    
    # 中文分类名
    '人工智能': 'machine-learning',
    
    # 保持不变的（已在新分类中）
    'deep-learning': 'deep-learning',
    'machine-learning': 'machine-learning',
    'llm': 'llm',
    'computer-vision': 'computer-vision',
    'nlp': 'nlp',
    'math': 'math',
    'devops': 'devops',
    'embedded': 'embedded',
    'data-processing': 'data-processing',
    'cs': 'cs',
    'speech': 'speech',
    'best-practices': 'best-practices',
    'uncategorized': 'uncategorized',
}

def map_category(old_cat: str) -> str:
    """将旧分类映射到新分类"""
    old_cat = old_cat.strip()
    if old_cat in CATEGORY_MAP:
        return CATEGORY_MAP[old_cat]
    print(f"  ⚠️  未知分类: '{old_cat}', 保持不变")
    return old_cat

def migrate_intel_files(base_dir: str):
    """迁移情报文件的 category"""
    intel_dir = os.path.join(base_dir, 'content', 'intel')
    count = 0
    for f in sorted(os.listdir(intel_dir)):
        if not f.endswith('.md'):
            continue
        filepath = os.path.join(intel_dir, f)
        content = open(filepath, 'r', encoding='utf-8').read()
        
        # 匹配 frontmatter 中的 category
        pattern = r'^category:\s*(.+)$'
        match = re.search(pattern, content, re.MULTILINE)
        if match:
            old_cat = match.group(1).strip().strip('"').strip("'")
            new_cat = map_category(old_cat)
            if old_cat != new_cat:
                new_content = re.sub(
                    pattern,
                    f'category: {new_cat}',
                    content,
                    count=1,
                    flags=re.MULTILINE
                )
                open(filepath, 'w', encoding='utf-8').write(new_content)
                print(f"  {f}: {old_cat} -> {new_cat}")
                count += 1
    print(f"情报文件: 迁移了 {count} 个文件")

def migrate_json_file(filepath: str, key_path: list = None, is_list: bool = True):
    """迁移 JSON 文件的 category
    
    Args:
        filepath: JSON 文件路径
        key_path: 数据所在的键路径，例如 ['tools'] 表示 data['tools']
        is_list: 数据是否是列表
    """
    if not os.path.exists(filepath):
        print(f"文件不存在: {filepath}")
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 获取目标数据
    target = data
    if key_path:
        for key in key_path:
            target = target.get(key, {} if not isinstance(target, list) else [])
    
    if not isinstance(target, list):
        print(f"  目标不是列表: {filepath}")
        return
    
    count = 0
    for item in target:
        if isinstance(item, dict) and 'category' in item:
            old_cat = str(item['category'])
            new_cat = map_category(old_cat)
            if old_cat != new_cat:
                item['category'] = new_cat
                count += 1
                print(f"  {item.get('title') or item.get('term') or item.get('name') or item.get('slug')}: {old_cat} -> {new_cat}")
    
    if count > 0:
        # 写回文件
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')
    
    print(f"{os.path.basename(filepath)}: 迁移了 {count} 条")

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    print("=" * 60)
    print("开始分类迁移")
    print("=" * 60)
    
    # 1. 情报文件
    print("\n📚 迁移情报文件...")
    migrate_intel_files(base_dir)
    
    # 2. 术语
    print("\n📖 迁移术语...")
    migrate_json_file(
        os.path.join(base_dir, 'content', 'glossary', 'terms.json'),
        key_path=None,
        is_list=True
    )
    
    # 3. 工具
    print("\n🔧 迁移工具...")
    migrate_json_file(
        os.path.join(base_dir, 'content', 'toolbox', 'tools.json'),
        key_path=['tools'],
        is_list=True
    )
    
    # 4. 实战项目
    print("\n🎯 迁移实战项目...")
    migrate_json_file(
        os.path.join(base_dir, 'content', 'practice', 'projects.json'),
        key_path=['projects'],
        is_list=True
    )
    
    print("\n" + "=" * 60)
    print("✓ 分类迁移完成！")
    print("=" * 60)

if __name__ == '__main__':
    main()
