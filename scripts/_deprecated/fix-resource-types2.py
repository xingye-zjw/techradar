"""
补充资源类型：将类型为 none 的资源根据 URL 推断正确类型
策略：
1. 根据 URL 域名/路径推断类型
2. 根据 URL 扩展名推断类型
3. 优先使用已有的类型，只修复 none 的资源
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
    """根据URL和标题推断资源类型"""
    url_lower = url.lower()
    
    # 根据域名/路径推断
    if 'arxiv.org' in url_lower or 'acm.org' in url_lower or 'ieee.org' in url_lower:
        return 'paper'
    if 'github.com' in url_lower:
        return 'repo'
    if 'docs.' in url_lower or '/docs/' in url_lower or '.readthedocs.io' in url_lower:
        return 'doc'
    if 'bilibili.com' in url_lower or 'youtube.com' in url_lower or 'youtu.be' in url_lower:
        return 'video'
    if 'book' in url_lower or '/book/' in url_lower:
        return 'book'
    if 'tutorial' in url_lower or '/tutorials/' in url_lower:
        return 'article'
    
    # 根据扩展名推断
    if url_lower.endswith('.pdf'):
        return 'paper'
    if url_lower.endswith('.md') or url_lower.endswith('.html'):
        return 'article'
    if url_lower.endswith('.py') or url_lower.endswith('.ipynb'):
        return 'code'
    
    # 根据标题推断
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
    
    # 默认返回 article
    return 'article'

def infer_source(url):
    """根据URL推断来源"""
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
    
    # 官方文档
    if 'docs.' in url_lower or '.readthedocs.io' in url_lower or '/docs/' in url_lower:
        return 'official'
    
    return 'official'

def main():
    content = read_file(ROADMAP_FILE)
    fixes = 0
    
    # 匹配所有资源对象 { title: "...", url: "...", required: ..., type: "none", ... }
    # 只修改 type: "none" 的资源
    resource_pattern = r'\{\s*title:\s*"([^"]+)",\s*url:\s*"([^"]+)",\s*required:\s*(true|false),\s*type:\s*"none"'
    
    for m in re.finditer(resource_pattern, content):
        title = m.group(1)
        url = m.group(2)
        required = m.group(3)
        
        inferred_type = infer_type(url, title)
        inferred_source = infer_source(url)
        
        if inferred_type == 'none':
            continue
        
        # 构建新的资源字符串
        old_str = m.group(0)
        new_str = f'{{ title: "{title}", url: "{url}", required: {required}, type: "{inferred_type}", source: "{inferred_source}" }}'
        
        content = content.replace(old_str, new_str, 1)
        fixes += 1
        print(f'✅ {title} -> type={inferred_type}, source={inferred_source}')
    
    # 处理只有 type: "none" 但没有 source 的情况
    resource_pattern2 = r'\{\s*title:\s*"([^"]+)",\s*url:\s*"([^"]+)",\s*required:\s*(true|false),\s*type:\s*"none"(?!,\s*source)'
    
    for m in re.finditer(resource_pattern2, content):
        title = m.group(1)
        url = m.group(2)
        required = m.group(3)
        
        inferred_type = infer_type(url, title)
        inferred_source = infer_source(url)
        
        if inferred_type == 'none':
            continue
        
        old_str = m.group(0)
        new_str = f'{{ title: "{title}", url: "{url}", required: {required}, type: "{inferred_type}", source: "{inferred_source}" }}'
        
        content = content.replace(old_str, new_str, 1)
        fixes += 1
        print(f'✅ {title} -> type={inferred_type}, source={inferred_source}')
    
    write_file(ROADMAP_FILE, content)
    print(f'\nTotal fixes: {fixes}')

if __name__ == '__main__':
    main()