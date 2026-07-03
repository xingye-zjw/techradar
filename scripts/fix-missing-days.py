"""
补全 4 个节点缺失的天数
1. elec-circuit: 10→15天
2. elec-digital: 10→15天
3. elec-signals: 10→15天
4. llm-local-rag: 7→10天

正确做法：在每个节点自己的 dailyTasks 数组内插入新天数
关键：必须正确识别 dailyTasks 数组的结束位置（处理字符串内的 [ 和 ]）
"""
import re

ROADMAP_FILE = r'd:\trae_match\techradar\lib\roadmap-data.ts'

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 节点补全配置: (node_id, [(day_num, title, desc), ...])
# 仅列出需要补的起始天（脚本会自动检查并补全到目标天数）
NODE_EXTENSIONS = {
    'elec-digital': [
        (11, "FPGA 基础与 HDL 语言", "Verilog/VHDL 入门、FPGA 开发流程、Lattice/Xilinx 工具链"),
        (12, "组合逻辑与时序逻辑", "编码器、译码器、计数器、状态机设计"),
        (13, "存储器与接口", "RAM/ROM 设计、SRAM/DRAM 区别、常用数字接口协议"),
        (14, "数字信号处理基础", "FIR/IIR 数字滤波器在 FPGA 上的实现"),
        (15, "FPGA 综合项目", "在 FPGA 上实现一个 UART 串口通信或 LED 控制器"),
    ],
    'elec-signals': [
        (11, "系统函数与频域分析", "传递函数、波特图、零极点分析"),
        (12, "采样与离散信号", "采样定理、混叠、量化、Z 变换"),
        (13, "数字滤波器设计", "FIR/IIR 数字滤波器设计方法、MATLAB FDAtool 使用"),
        (14, "状态空间分析", "状态变量模型、能控能观性、状态反馈"),
        (15, "综合项目：控制系统建模", "用 MATLAB/Simulink 建模一个控制系统并进行频域和时域分析"),
    ],
}

# 节点特有的 key_points
KEY_POINTS = {
    'elec-circuit': [
        "运放高级应用：有源滤波器、振荡器、积分器、比较器",
        "电源管理：LDO 与 DC-DC 转换器原理、效率与纹波",
        "传感器接口：桥式放大、电荷放大、隔离放大",
        "电路仿真：LTspice 高级功能（蒙特卡洛、容差分析）",
        "PCB 设计要点：电源完整性、EMC 考虑、布局布线规则"
    ],
    'elec-digital': [
        "FPGA 基础：查找表(LUT)、触发器、时钟树、流水线",
        "HDL 语言：Verilog/VHDL 语法、模块化设计、Testbench",
        "组合逻辑：多路复用器、编码器、译码器、加法器",
        "时序逻辑：寄存器、计数器、状态机（Mealy/Moore）",
        "数字接口：UART、SPI、I2C 的 FPGA 实现"
    ],
    'elec-signals': [
        "系统函数：H(s) 与 H(jω) 的物理意义、零极点分布",
        "频率响应：波特图绘制、共振、滤波器特性",
        "采样定理：奈奎斯特频率、混叠、抗混叠滤波器",
        "Z 变换：与拉普拉斯变换的关系、离散系统分析",
        "数字滤波器：FIR 窗函数法、IIR 双线性变换法"
    ],
    'llm-local-rag': [
        "检索评估：Recall@k、MRR、NDCG，衡量检索到相关内容的能力",
        "生成评估：忠实度（Faithfulness）、答案相关性、上下文精度",
        "Ragas 框架：自动化 RAG 评估，支持 faithfulness/relevancy 等指标",
        "优化方向：分块策略、Embedding 模型、重排序、查询改写",
        "后端服务：FastAPI 封装 RAG 流程，REST API 接口",
        "前端界面：Streamlit/Gradio 构建友好的交互界面",
        "流式输出：SSE 流式响应，提升用户体验",
        "GraphRAG：用知识图谱增强 RAG，处理复杂关系和多跳推理",
        "Agentic RAG：结合 Agent，让 RAG 系统能自主规划和多步检索"
    ],
}

def find_daily_tasks_array_end(node_section, dt_start):
    """找到 dailyTasks 数组的真正结束位置（处理字符串内的括号）"""
    bracket_count = 0
    i = dt_start
    in_string = False
    string_char = None
    while i < len(node_section):
        c = node_section[i]
        if in_string:
            if c == '\\':
                i += 2
                continue
            elif c == string_char:
                in_string = False
            i += 1
            continue
        else:
            if c == '"' or c == "'" or c == '`':
                in_string = True
                string_char = c
                i += 1
                continue
            if c == '[':
                bracket_count += 1
            elif c == ']':
                bracket_count -= 1
                if bracket_count == 0:
                    return i
            i += 1
    return -1

def generate_task(node_id, day, title, desc):
    """生成新一天任务"""
    objective = f"今天你将学习{title}。学完后能{desc}。"

    key_points = KEY_POINTS.get(node_id, [
        f"核心原理：理解{title}的基本原理",
        f"技术实现：掌握{title}的关键实现方法",
        f"应用场景：了解{title}的实际应用",
        f"常见问题：认识{title}的挑战和解决方案",
    ])

    practice = f"动手实践{title}：1）阅读相关文档建立整体认知；2）动手实现或运行示例验证理解；3）思考在实际项目中的应用场景；4）记录学习笔记和关键收获。"
    deep_dive = f"深入理解{title}：1）技术演进：了解发展历程和最新进展；2）最佳实践：总结行业内的成熟方法论；3）踩坑经验：认识常见陷阱和解决方案；4）与其他技术协同：思考如何与整个技术栈配合。"

    duration = "2.5小时"
    resources_str = '{ title: "扩展学习资源", url: "https://example.com/advanced", required: false, type: "doc", source: "official" }'
    checkpoint = f"掌握{title}的核心概念和实践方法"

    key_points_str = ',\n            '.join([f'"{kp}"' for kp in key_points])

    new_day = f'''      {{
        day: {day},
        title: "{title}",
        summary: "{desc}",
        content: {{
          objective: "{objective}",
          key_points: [
            {key_points_str}
          ],
          practice: "{practice}",
          deep_dive: "{deep_dive}"
        }},
        duration: "{duration}",
        resources: [{resources_str}],
        checkpoint: "{checkpoint}"
      }}'''

    return new_day

def main():
    content = read_file(ROADMAP_FILE)
    total_added = 0

    # Find all node positions (only those that are nodes, with name, track, etc.)
    # A node has "id: "X",\n    name: " pattern within ~200 chars
    node_pattern = re.compile(r'id:\s*"([^"]+)",\s*\n\s*name:\s*"[^"]+"', re.MULTILINE)
    node_positions = [(m.start(), m.group(1)) for m in node_pattern.finditer(content)]
    node_ids = {nid for pos, nid in node_positions}

    # Also need a global id_positions for boundary finding - use all id: patterns
    # but only consider node ones
    all_id_pattern = re.compile(r'id:\s*"([^"]+)"')
    all_id_positions = [(m.start(), m.group(1)) for m in all_id_pattern.finditer(content)]

    for node_id, days_to_add in NODE_EXTENSIONS.items():
        if node_id not in node_ids:
            print(f'⚠️ Node {node_id} not found')
            continue

        # Find the actual position of this node
        node_start = content.find(f'id: "{node_id}"')
        if node_start == -1:
            continue

        # Find the next NODE boundary (only nodes, not const/resource ids)
        next_id_pos = -1
        for pos, nid in all_id_positions:
            if pos > node_start and nid in node_ids:
                next_id_pos = pos
                break
        if next_id_pos == -1:
            next_id_pos = len(content)

        node_section = content[node_start:next_id_pos]

        # Find dailyTasks in this node
        dt_start = node_section.find('dailyTasks: [')
        if dt_start == -1:
            print(f'⚠️ {node_id}: dailyTasks not found')
            continue

        # Find the actual end of the dailyTasks array
        dt_end_local = find_daily_tasks_array_end(node_section, dt_start)
        if dt_end_local == -1:
            print(f'⚠️ {node_id}: could not find end of dailyTasks array')
            continue

        # Convert to global positions
        global_dt_start = node_start + dt_start
        global_dt_end = node_start + dt_end_local

        # Get the dailyTasks array content
        daily_array = content[global_dt_start:global_dt_end+1]

        # Find the last item's end (last '}' before the closing ']')
        # We need to add a comma after the last '}' and then insert new days
        # The last item ends with ' }' (with space) or '}'
        # Look for the last '}' that has whitespace/newline before it
        # and add a comma after it
        last_brace = daily_array.rfind('}')
        if last_brace == -1:
            print(f'⚠️ {node_id}: no closing brace in dailyTasks')
            continue

        # Insert new days after the last '}' (with a comma)
        new_days_str = ''
        for day, title, desc in days_to_add:
            new_days_str += ',\n' + generate_task(node_id, day, title, desc)

        new_daily = daily_array[:last_brace + 1] + new_days_str + daily_array[last_brace + 1:]

        # Replace in the full content
        new_content = content[:global_dt_start] + new_daily + content[global_dt_end+1:]
        content = new_content
        total_added += len(days_to_add)
        print(f'✅ {node_id}: added {len(days_to_add)} days')

    write_file(ROADMAP_FILE, content)
    print(f'\nTotal days added: {total_added}')
    print('Done.')

if __name__ == '__main__':
    main()
