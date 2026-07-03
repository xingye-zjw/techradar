"""
规范化 roadmap-data.ts 中的 relatedTools 引用：将工具显示名替换为 tools.json 中的 slug。
同时补全 tools.json、constants.ts 中的 TOOL_IDS 与 TOOL_LINKS。
"""
import json
import re
import os

TOOLS_PATH = 'content/toolbox/tools.json'
ROADMAP_PATH = 'lib/roadmap-data.ts'
CONSTANTS_PATH = 'lib/constants.ts'

# 缺失工具的补充定义（name -> slug 及其他字段）
MISSING_TOOLS_DEF = {
    "Wireshark": {
        "slug": "wireshark",
        "category": "cs",
        "purpose": "开源网络协议分析器，用于抓包、排错与学习网络协议",
        "description": "Wireshark 是全球最流行的开源网络协议分析器，支持实时抓包与离线 pcap 分析。它内置数千种协议解码，可深入检查 TCP/IP、HTTP、DNS、TLS 等报文字段，是网络排错、安全审计和协议学习的必备工具。",
        "install": "https://www.wireshark.org/download.html",
        "features": [
            "实时捕获与离线分析网络流量",
            "支持数千种协议深度解码",
            "强大的显示过滤器与着色规则",
            "导出多种格式并支持 TLS 解密"
        ],
        "tags": ["network", "packet-capture", "troubleshooting"],
        "github": {
            "stars": "30k+",
            "last_release": "2025-06",
            "url": "https://github.com/wireshark/wireshark"
        },
        "difficulty": "intermediate",
        "official_url": "https://www.wireshark.org/",
        "use_cases": ["网络排错", "协议学习", "安全审计"],
        "relatedIntel": [],
        "relatedNodes": ["cs-network"],
        "relatedTerms": []
    },
    "Postman": {
        "slug": "postman",
        "category": "cs",
        "purpose": "API 开发与协作平台，支持 REST / GraphQL 接口测试与文档生成",
        "description": "Postman 是领先的 API 开发与协作平台，提供直观的界面构建、发送和调试 HTTP 请求。它支持集合管理、环境变量、自动化测试脚本和 Mock 服务，并可通过 Postman API 文档与团队共享接口规范。",
        "install": "https://www.postman.com/downloads/",
        "features": [
            "可视化构建和发送 HTTP 请求",
            "集合与环境变量管理",
            "自动化测试与 CI/CD 集成",
            "API 文档生成与团队协作"
        ],
        "tags": ["api", "testing", "rest"],
        "github": {
            "stars": "N/A",
            "last_release": "2025-06",
            "url": "https://www.postman.com/"
        },
        "difficulty": "beginner",
        "official_url": "https://www.postman.com/",
        "use_cases": ["接口测试", "API 文档", "团队协作"],
        "relatedIntel": [],
        "relatedNodes": ["cs-network", "project-iot-fastapi"],
        "relatedTerms": []
    },
    "MySQL": {
        "slug": "mysql",
        "category": "cs",
        "purpose": "最流行的开源关系型数据库，广泛应用于 Web 后端与数据分析",
        "description": "MySQL 是全球最流行的开源关系型数据库管理系统，以高性能、易部署和生态丰富著称。它支持标准 SQL、事务、存储引擎和主从复制，是 LAMP 栈和大量 Web 应用的首选数据存储方案。",
        "install": "https://dev.mysql.com/downloads/",
        "features": [
            "标准 SQL 与 ACID 事务支持",
            "InnoDB 存储引擎与行级锁",
            "主从复制与读写分离",
            "丰富的客户端与 ORM 生态"
        ],
        "tags": ["database", "sql", "relational"],
        "github": {
            "stars": "9k+",
            "last_release": "2025-06",
            "url": "https://github.com/mysql/mysql-server"
        },
        "difficulty": "beginner",
        "official_url": "https://dev.mysql.com/doc/",
        "use_cases": ["Web 后端", "数据分析", "事务系统"],
        "relatedIntel": [],
        "relatedNodes": ["cs-database"],
        "relatedTerms": []
    },
    "Redis": {
        "slug": "redis",
        "category": "cs",
        "purpose": "高性能内存键值数据库，常用于缓存、消息队列与会话存储",
        "description": "Redis 是一款开源的高性能内存键值数据库，支持字符串、哈希、列表、集合、有序集合等多种数据结构。凭借亚毫秒级响应和丰富的数据类型，Redis 被广泛用于缓存、实时排行榜、消息队列和会话存储。",
        "install": "https://redis.io/download/",
        "features": [
            "亚毫秒级读写延迟",
            "丰富的数据类型与原子操作",
            "持久化、主从复制与高可用集群",
            "发布订阅与流数据结构"
        ],
        "tags": ["cache", "database", "in-memory"],
        "github": {
            "stars": "67k+",
            "last_release": "2025-06",
            "url": "https://github.com/redis/redis"
        },
        "difficulty": "intermediate",
        "official_url": "https://redis.io/documentation",
        "use_cases": ["缓存", "会话存储", "消息队列"],
        "relatedIntel": [],
        "relatedNodes": ["cs-database"],
        "relatedTerms": []
    },
    "KiCad": {
        "slug": "kicad",
        "category": "electronics",
        "purpose": "开源 PCB 电子设计自动化套件，支持原理图与 PCB 布局",
        "description": "KiCad 是一套功能强大的开源电子设计自动化（EDA）软件，包含原理图编辑器、PCB 布局编辑器、3D 查看器和 Gerber 输出工具。它支持多层板、差分对、长度匹配等高级特性，是个人开发者和小团队的首选 PCB 设计工具。",
        "install": "https://www.kicad.org/download/",
        "features": [
            "原理图捕获与层次化设计",
            "多层 PCB 布局与 DRC 检查",
            "集成 3D 模型查看器",
            "Gerber / Drill / BOM 一键输出"
        ],
        "tags": ["pcb", "eda", "electronics"],
        "github": {
            "stars": "N/A",
            "last_release": "2025-06",
            "url": "https://gitlab.com/kicad"
        },
        "difficulty": "intermediate",
        "official_url": "https://docs.kicad.org/",
        "use_cases": ["原理图设计", "PCB 布局", "硬件开源"],
        "relatedIntel": [],
        "relatedNodes": ["elec-pcb"],
        "relatedTerms": []
    },
    "Altium Designer": {
        "slug": "altium-designer",
        "category": "electronics",
        "purpose": "业界高端 PCB 设计工具，适合复杂高速板与团队协作",
        "description": "Altium Designer 是业界领先的电子设计自动化软件，提供从原理图到 PCB 制造输出的全流程解决方案。它擅长高速信号完整性分析、多层板设计和团队协作，广泛应用于工业级硬件产品开发。",
        "install": "https://www.altium.com/products/altium-designer",
        "features": [
            "统一数据模型下的原理图与 PCB 协同",
            "高速信号完整性与约束管理",
            "3D PCB 装配与 MCAD 协作",
            "版本控制与团队协作工作流"
        ],
        "tags": ["pcb", "eda", "enterprise"],
        "github": {
            "stars": "N/A",
            "last_release": "2025-06",
            "url": "https://www.altium.com/products/altium-designer"
        },
        "difficulty": "advanced",
        "official_url": "https://www.altium.com/documentation/altium-designer",
        "use_cases": ["高速 PCB", "复杂硬件", "团队项目"],
        "relatedIntel": [],
        "relatedNodes": ["elec-pcb"],
        "relatedTerms": []
    },
    "AutoCAD Electrical": {
        "slug": "autocad-electrical",
        "category": "electrical",
        "purpose": "面向电气控制设计的 AutoCAD 垂直版本，用于绘制原理图与生成报表",
        "description": "AutoCAD Electrical 是 Autodesk 专为电气控制设计师打造的工具，基于 AutoCAD 平台增加了符号库、导线编号、PLC I/O 表格和自动化报表功能，可大幅提升电气原理图设计效率和准确性。",
        "install": "https://www.autodesk.com/products/autocad-electrical/overview",
        "features": [
            "丰富的电气符号与元件库",
            "自动导线编号与交叉引用",
            "PLC I/O 表格与面板布局",
            "自动生成报表与 BOM"
        ],
        "tags": ["electrical", "cad", "schematic"],
        "github": {
            "stars": "N/A",
            "last_release": "2025-06",
            "url": "https://www.autodesk.com/products/autocad-electrical/overview"
        },
        "difficulty": "intermediate",
        "official_url": "https://www.autodesk.com/products/autocad-electrical/overview",
        "use_cases": ["电气原理图", "控制柜设计", "工业自动化"],
        "relatedIntel": [],
        "relatedNodes": ["electrical-safety"],
        "relatedTerms": []
    },
    "TIA Portal": {
        "slug": "tia-portal",
        "category": "control",
        "purpose": "西门子全集成自动化软件，用于 PLC、HMI 和驱动器的统一编程",
        "description": "TIA Portal（Totally Integrated Automation Portal）是西门子推出的统一工程框架，集成 PLC 编程、HMI 组态、驱动配置和诊断功能。STEP 7 和 WinCC 在同一平台运行，显著缩短工业自动化项目的开发与调试周期。",
        "install": "https://support.industry.siemens.com/cs/document/109773881",
        "features": [
            "STEP 7 与 WinCC 统一工程环境",
            "PLC、HMI、驱动器无缝集成",
            "变量表与交叉引用统一管理",
            "在线诊断与 Trace 功能"
        ],
        "tags": ["plc", "siemens", "industrial"],
        "github": {
            "stars": "N/A",
            "last_release": "2025-06",
            "url": "https://support.industry.siemens.com/cs/document/109773881"
        },
        "difficulty": "intermediate",
        "official_url": "https://support.industry.siemens.com/cs/document/109773881",
        "use_cases": ["PLC 编程", "HMI 组态", "产线自动化"],
        "relatedIntel": [],
        "relatedNodes": ["ctrl-plc"],
        "relatedTerms": []
    },
    "Codesys": {
        "slug": "codesys",
        "category": "control",
        "purpose": "跨平台 IEC 61131-3 开发环境，支持多种品牌 PLC 编程",
        "description": "CODESYS 是一款基于 IEC 61131-3 标准的跨平台 PLC 开发环境，支持梯形图、功能块图、结构化文本等多种编程语言。它为众多第三方 PLC 制造商提供统一编程平台，是工业自动化领域的重要工具。",
        "install": "https://www.codesys.com/download.html",
        "features": [
            "符合 IEC 61131-3 标准的多种语言支持",
            "跨硬件平台的统一开发环境",
            "可视化编辑与运动控制功能",
            "丰富的设备库与现场总线支持"
        ],
        "tags": ["plc", "iec-61131-3", "industrial"],
        "github": {
            "stars": "N/A",
            "last_release": "2025-06",
            "url": "https://github.com/CODESYS"
        },
        "difficulty": "intermediate",
        "official_url": "https://www.codesys.com/",
        "use_cases": ["PLC 编程", "工业控制", "跨平台开发"],
        "relatedIntel": [],
        "relatedNodes": ["ctrl-plc"],
        "relatedTerms": []
    },
}

# 显示名到 slug 的显式映射（覆盖同名歧义）
DISPLAY_TO_SLUG = {
    "HuggingFace": "huggingface-transformers",
    "PostgreSQL": "pgvector",
}


def load_tools():
    with open(TOOLS_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_tools(data):
    with open(TOOLS_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def build_name_to_slug(tools):
    mapping = {}
    for t in tools:
        mapping[t['name']] = t['slug']
    mapping.update(DISPLAY_TO_SLUG)
    return mapping


def normalize_related_tools(roadmap_content, mapping):
    """将 relatedTools: ["Name", ...] 中的显示名替换为 slug"""
    def repl(match):
        prefix = match.group(1)
        items_str = match.group(2)
        # 提取原数组中的字符串
        items = re.findall(r'"([^"]+)"', items_str)
        new_items = []
        for item in items:
            slug = mapping.get(item)
            if slug:
                new_items.append(slug)
            else:
                print(f"⚠️  未找到工具映射: {item}")
                new_items.append(item)
        # 保持原数组格式与缩进
        if not new_items:
            return f'{prefix}relatedTools: []'
        items_joined = ', '.join(f'"{x}"' for x in new_items)
        return f'{prefix}relatedTools: [{items_joined}]'

    # 匹配 relatedTools 数组（支持单独一行或紧跟 relatedIntel 的同行写法）
    pattern = r'(\s*)relatedTools:\s*\[(.*?)\]'
    return re.sub(pattern, repl, roadmap_content, flags=re.DOTALL)


def update_constants():
    with open(CONSTANTS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    tools = load_tools()['tools']
    # 提取当前 TOOL_IDS
    match = re.search(r'TOOL_IDS:\s*Record<string,\s*string>\s*=\s*\{(.*?)\};', content, re.DOTALL)
    existing = {}
    if match:
        for m in re.finditer(r'"([^"]+)":\s*"([^"]+)"', match.group(1)):
            existing[m.group(1)] = m.group(2)

    # 合并并排序
    full = {t['slug']: t['name'] for t in tools}
    full.update(existing)

    lines = [f'  "{slug}": "{name}",' for slug, name in sorted(full.items())]
    new_block = '\n'.join(lines)
    content = re.sub(r'(TOOL_IDS:\s*Record<string,\s*string>\s*=\s*\{).*?(\};)',
                     rf'\1\n{new_block}\n\2', content, flags=re.DOTALL)

    # 同步 TOOL_LINKS（slug -> 显示名，用于 UI）
    tool_links = {t['slug']: t['name'] for t in tools}
    # 保留原 TOOL_LINKS 中的条目并扩展
    match_links = re.search(r'TOOL_LINKS:\s*Record<string,\s*string>\s*=\s*\{(.*?)\};', content, re.DOTALL)
    if match_links:
        for m in re.finditer(r'"([^"]+)":\s*"([^"]+)"', match_links.group(1)):
            if m.group(1) in tool_links:
                continue
            tool_links[m.group(1)] = m.group(2)

    link_lines = [f'  "{key}": "{val}",' for key, val in sorted(tool_links.items())]
    new_links_block = '\n'.join(link_lines)
    content = re.sub(r'(TOOL_LINKS:\s*Record<string,\s*string>\s*=\s*\{).*?(\};)',
                     rf'\1\n{new_links_block}\n\2', content, flags=re.DOTALL)

    with open(CONSTANTS_PATH, 'w', encoding='utf-8') as f:
        f.write(content)


def main():
    data = load_tools()
    tools = data['tools']
    existing_slugs = {t['slug'] for t in tools}
    existing_names = {t['name'] for t in tools}

    added = 0
    for name, definition in MISSING_TOOLS_DEF.items():
        if definition['slug'] in existing_slugs or name in existing_names:
            continue
        tool_entry = {"name": name, **definition}
        tools.append(tool_entry)
        added += 1

    if added:
        print(f"已补充 {added} 个缺失工具到 tools.json")
        save_tools(data)
    else:
        print("tools.json 中无新增工具")

    mapping = build_name_to_slug(tools)

    with open(ROADMAP_PATH, 'r', encoding='utf-8') as f:
        roadmap_content = f.read()

    new_content = normalize_related_tools(roadmap_content, mapping)

    if new_content != roadmap_content:
        with open(ROADMAP_PATH, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("已规范化 roadmap-data.ts 中的 relatedTools 引用")
    else:
        print("roadmap-data.ts 中的 relatedTools 无需修改")

    update_constants()
    print("已更新 constants.ts 中的 TOOL_IDS 与 TOOL_LINKS")


if __name__ == '__main__':
    main()
