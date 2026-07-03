"""
为所有缺少 type 字段的资源添加 type 和 source
策略：
1. 找到所有资源对象 { title: "...", url: "...", required: ... }
2. 如果没有 type 字段，根据 URL 和标题推断并添加
"""
import re
import os

ROADMAP_FILE = os.path.join(os.path.dirname(__file__), '..', 'lib', 'roadmap-data.ts')

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def infer_type(url, title):
    url_lower = url.lower()
    
    if 'arxiv.org' in url_lower or 'acm.org' in url_lower or 'ieee.org' in url_lower:
        return 'paper'
    if 'github.com' in url_lower and '/blob/' not in url_lower and '/tree/' not in url_lower:
        return 'repo'
    if 'docs.' in url_lower or '/docs/' in url_lower or '.readthedocs.io' in url_lower or '/documentation/' in url_lower:
        return 'doc'
    if 'bilibili.com' in url_lower or 'youtube.com' in url_lower or 'youtu.be' in url_lower:
        return 'video'
    if 'book' in url_lower or '/book/' in url_lower:
        return 'book'
    if 'tutorial' in url_lower or '/tutorials/' in url_lower or '/guide/' in url_lower:
        return 'article'
    if url_lower.endswith('.pdf'):
        return 'paper'
    if url_lower.endswith('.md') or url_lower.endswith('.html'):
        return 'article'
    
    title_lower = title.lower()
    if '论文' in title_lower or 'paper' in title_lower:
        return 'paper'
    if '视频' in title_lower or 'video' in title_lower:
        return 'video'
    if '文档' in title_lower or 'docs' in title_lower or 'doc' in title_lower:
        return 'doc'
    if '教程' in title_lower or 'tutorial' in title_lower:
        return 'article'
    if '工具' in title_lower or 'tool' in title_lower:
        return 'tool'
    if '项目' in title_lower or 'github' in title_lower:
        return 'repo'
    if '书' in title_lower or 'book' in title_lower:
        return 'book'
    
    return 'article'

def infer_source(url):
    url_lower = url.lower()
    
    if 'bilibili.com' in url_lower:
        return 'bilibili'
    if 'youtube.com' in url_lower or 'youtu.be' in url_lower:
        return 'youtube'
    if 'github.com' in url_lower:
        return 'github'
    if 'arxiv.org' in url_lower:
        return 'academic'
    if 'zhihu.com' in url_lower:
        return 'zhihu'
    if 'juejin.cn' in url_lower:
        return 'juejin'
    if '.io' in url_lower or '.org' in url_lower or 'docs.' in url_lower:
        return 'official'
    
    return 'official'

def main():
    content = read_file(ROADMAP_FILE)
    fixes = 0
    
    # 匹配资源对象：{ title: "...", url: "...", required: true/false }
    # 需要处理 required 后面可能有也可能没有其他字段
    resource_pattern = r'\{\s*title:\s*"([^"]+)",\s*url:\s*"([^"]+)",\s*required:\s*(true|false)\s*\}'
    
    new_content = content
    
    for m in re.finditer(resource_pattern, content):
        full_match = m.group(0)
        title = m.group(1)
        url = m.group(2)
        required = m.group(3)
        
        if 'type:' in full_match or 'source:' in full_match:
            continue
        
        inferred_type = infer_type(url, title)
        inferred_source = infer_source(url)
        
        new_str = f'{{ title: "{title}", url: "{url}", required: {required}, type: "{inferred_type}", source: "{inferred_source}" }}'
        
        new_content = new_content.replace(full_match, new_str, 1)
        fixes += 1
        if fixes <= 20:
            print(f'✅ {title} -> type={inferred_type}, source={inferred_source}')
    
    write_file(ROADMAP_FILE, new_content)
    print(f'\nTotal fixes: {fixes}')

if __name__ == '__main__':
    main()