"""
为 signals/electrical/electronics track 补充节点并扩展学习路径
"""
import re

ROADMAP_PATH = 'lib/roadmap-data.ts'
LP_PATH = 'lib/learning-paths.ts'
CONSTANTS_PATH = 'lib/constants.ts'

# 新节点定义
NEW_NODES = {
    'signals-antenna': {
        'name': '天线原理与设计',
        'track': 'signals',
        'duration': '2-3周',
        'difficulty': 'intermediate',
        'prerequisites': ['signals-comm', 'signals-dsp'],
        'description': '天线是无线通信系统的关键接口，本节点涵盖天线基础参数、类型选择、辐射模型与设计方法，帮助你理解从理论到工程实践的天线设计全流程。',
        'outcomes': [
            '理解天线增益、方向图、驻波比、带宽等核心参数',
            '掌握偶极子、单极子、贴片、阵列天线等常见类型',
            '学会使用 NEC/S参数 进行天线仿真',
            '能根据频段和应用场景选择合适天线',
        ],
        'relatedIntel': ['082-signals-wireless', '066-signals-basics'],
        'relatedTools': ['matlab'],
        'relatedTerms': ['antenna', 'signal', 'impedance', 'electromagnetic-wave'],
        'relatedNodes': ['signals-wireless', 'signals-comm'],
        'suggestions': {
            'prerequisites': ['通信原理', 'DSP 数字信号处理'],
            'nextSteps': ['软件无线电 SDR', '射频电路设计'],
            'learningPath': ['signals-basics → signals-comm → signals-wireless → signals-antenna'],
        },
    },
    'electrical-relay': {
        'name': '继电保护与电力系统自动化',
        'track': 'electrical',
        'duration': '2-3周',
        'difficulty': 'advanced',
        'prerequisites': ['electrical-power', 'electrical-safety'],
        'description': '继电保护是电力系统安全运行的最后一道防线，本节点涵盖保护原理、继电器配置、故障检测、自动化装置与 SCADA 系统，帮助你掌握电力系统保护与监控全链路。',
        'outcomes': [
            '理解过流、差动、距离、方向保护原理',
            '掌握继电器整定计算与配置方法',
            '学会故障分析与保护配合',
            '了解 SCADA/EMS 电力监控系统',
        ],
        'relatedIntel': ['071-elec-power-systems', '085-electrical-safety'],
        'relatedTools': ['matlab'],
        'relatedTerms': ['scada', 'power-system', 'signal', 'control-system'],
        'relatedNodes': ['electrical-power', 'electrical-safety', 'electrical-power-electronics'],
        'suggestions': {
            'prerequisites': ['电力系统基础', '电气安全与保护'],
            'nextSteps': ['智能电网', '微电网技术'],
            'learningPath': ['electrical-power → electrical-safety → electrical-relay'],
        },
    },
    'elec-fpga': {
        'name': 'FPGA 与数字系统设计',
        'track': 'electronics',
        'duration': '3-4周',
        'difficulty': 'advanced',
        'prerequisites': ['elec-digital', 'elec-pcb'],
        'description': 'FPGA 是高性能数字系统的核心，本节点涵盖 Verilog/VHDL 硬件描述语言、时序约束、状态机设计、IP 核集成与仿真验证，帮助你掌握从 RTL 到比特流的 FPGA 全流程开发。',
        'outcomes': [
            '掌握 Verilog/SystemVerilog 硬件描述语言',
            '理解时序约束、时钟域交叉、亚稳态处理',
            '学会状态机、流水线、FIFO 等常用设计模式',
            '能使用 Vivado/Quartus 完成 FPGA 综合与调试',
        ],
        'relatedIntel': ['079-elec-digital', '080-elec-pcb'],
        'relatedTools': [],
        'relatedTerms': ['fpga', 'verilog', 'digital-circuit', 'signal'],
        'relatedNodes': ['elec-digital', 'elec-pcb', 'elec-circuit'],
        'suggestions': {
            'prerequisites': ['数字电子技术', 'PCB 设计基础'],
            'nextSteps': ['SoC 设计', '硬件加速器'],
            'learningPath': ['elec-digital → elec-pcb → elec-fpga'],
        },
    },
}


def generate_node_code(node_id, meta):
    """生成节点 TS 代码"""
    prereqs = ', '.join(f'"{p}"' for p in meta['prerequisites'])
    related_intel = ', '.join(f'"{r}"' for r in meta['relatedIntel'])
    related_tools = ', '.join(f'"{r}"' for r in meta['relatedTools'])
    related_terms = ', '.join(f'"{r}"' for r in meta['relatedTerms'])
    related_nodes = ', '.join(f'"{r}"' for r in meta['relatedNodes'])
    outcomes = ', '.join(f'"{o}"' for o in meta['outcomes'])

    return f'''  {{
    id: "{node_id}",
    name: "{meta['name']}",
    track: "{meta['track']}",
    duration: "{meta['duration']}",
    prerequisites: [{prereqs}],
    status: "locked",
    difficulty: "{meta['difficulty']}",
    description: "{meta['description']}",
    outcomes: [{outcomes}],
    dailyTasks: [
      {{
        day: 1,
        title: "基础概念与环境搭建",
        summary: "了解{meta['name']}的核心概念与发展脉络",
        content: {{
          objective: "本节学习{meta['name']}的基础理论框架，理解核心概念、术语体系与应用场景，完成开发环境搭建。",
          key_points: ["核心定义与术语", "发展历程与现状", "应用场景分析", "开发环境搭建"],
          practice: "安装相关工具链，运行第一个示例程序，验证环境可用性。",
          deep_dive: "{meta['name']}是现代电子工程的关键技术，在通信、控制、消费电子等领域有广泛应用。",
        }},
        duration: "2小时",
        checkpoint: "能说出{meta['name']}的3个核心概念，开发环境运行正常",
      }},
      {{
        day: 2,
        title: "核心原理深入",
        summary: "深入理解{meta['name']}的核心原理与数学基础",
        content: {{
          objective: "本节深入{meta['name']}的核心原理，推导关键公式，理解设计参数与性能指标的关系。",
          key_points: ["核心原理推导", "关键参数分析", "性能指标计算", "典型电路/系统分析"],
          practice: "手动推导核心公式，计算典型场景下的关键参数。",
          deep_dive: "理解原理是工程设计的基础，参数选择直接影响系统性能和可靠性。",
        }},
        duration: "2小时",
        checkpoint: "能独立推导核心公式，完成参数计算练习",
      }},
      {{
        day: 3,
        title: "设计与仿真实践",
        summary: "使用工具进行{meta['name']}的设计与仿真",
        content: {{
          objective: "本节通过仿真工具实践{meta['name']}的设计流程，从需求分析到方案验证。",
          key_points: ["设计流程概述", "工具使用方法", "仿真参数设置", "结果分析方法"],
          practice: "完成一个完整的设计-仿真-验证循环，记录关键指标。",
          deep_dive: "仿真验证是现代电子设计的核心环节，能大幅降低试错成本。",
        }},
        duration: "3小时",
        checkpoint: "独立完成一个仿真设计，结果与理论值偏差<10%",
      }},
      {{
        day: 4,
        title: "工程实现与调试",
        summary: "将设计方案落地为实际硬件/系统",
        content: {{
          objective: "本节学习{meta['name']}的工程实现方法，掌握焊接/编程/调试全流程。",
          key_points: ["实现方案规划", "常见问题排查", "调试工具使用", "性能优化技巧"],
          practice: "完成一个最小可用原型，使用示波器/逻辑分析仪调试。",
          deep_dive: "工程实现与理论设计的差距往往在于寄生参数、EMI、热设计等实际问题。",
        }},
        duration: "3小时",
        checkpoint: "原型功能正常，能使用仪器独立调试",
      }},
      {{
        day: 5,
        title: "综合项目与优化",
        summary: "完成综合项目并优化性能",
        content: {{
          objective: "本节通过综合项目整合所学知识，完成一个完整的{meta['name']}应用系统。",
          key_points: ["系统架构设计", "模块化实现", "性能测试与优化", "文档撰写"],
          practice: "完成综合项目，撰写设计报告，包含原理图、测试数据、优化方案。",
          deep_dive: "综合项目是检验学习成果的最佳方式，也是求职作品集的核心内容。",
        }},
        duration: "4小时",
        checkpoint: "项目功能完整，报告规范，性能达标",
      }},
    ],
    relatedIntel: [{related_intel}],
    relatedTools: [{related_tools}],
    relatedTerms: [{related_terms}],
    relatedNodes: [{related_nodes}],
    suggestions: {{
      prerequisites: [{', '.join(f'"{p}"' for p in meta['suggestions']['prerequisites'])}],
      nextSteps: [{', '.join(f'"{p}"' for p in meta['suggestions']['nextSteps'])}],
      learningPath: [{', '.join(f'"{p}"' for p in meta['suggestions']['learningPath'])}],
    }},
  }}'''


def main():
    with open(ROADMAP_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # 找到 FULL_ROADMAP 数组的最后一个节点结尾（即数组结束 ] 前的位置）
    # 找最后一个 },\n]; 或 }\n] 的位置
    # 更安全的方法：找到最后一个节点对象结束位置
    # 我们在 `];` (FULL_ROADMAP 结束) 前插入

    # 寻找 FULL_ROADMAP 结尾
    # 通常文件末尾有 export const FULL_ROADMAP: RoadmapNode[] = [ ... ];
    # 找最后的 ];
    insert_marker = '\n];\n'
    last_pos = content.rfind(insert_marker)
    if last_pos == -1:
        # 尝试 }\n];
        insert_marker = '}\n];\n'
        last_pos = content.rfind(insert_marker)

    if last_pos == -1:
        print("❌ 无法找到 FULL_ROADMAP 结尾")
        return

    # 在最后位置插入新节点
    # 确保前一个节点后有逗号
    before = content[:last_pos]
    after = content[last_pos:]

    # 检查 before 末尾是否以 } 结尾（没有逗号）
    before_stripped = before.rstrip()
    if before_stripped.endswith('}'):
        before = before_stripped + ',\n'

    new_nodes_code = '\n'.join(generate_node_code(nid, meta) for nid, meta in NEW_NODES.items())
    content = before + new_nodes_code + '\n' + after

    with open(ROADMAP_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ 已添加 {len(NEW_NODES)} 个节点到 roadmap-data.ts")

    # 更新 constants.ts 中的 NODE_NAMES
    with open(CONSTANTS_PATH, 'r', encoding='utf-8') as f:
        const_content = f.read()

    new_names = {
        'signals-antenna': '天线原理与设计',
        'electrical-relay': '继电保护与电力系统自动化',
        'elec-fpga': 'FPGA 与数字系统设计',
    }

    # 找到 NODE_NAMES 的结尾
    node_names_end = const_content.find('\n};', const_content.find('export const NODE_NAMES'))
    if node_names_end == -1:
        print("⚠️ 无法找到 NODE_NAMES 结尾")
    else:
        # 在最后一个条目后添加
        insert_text = ''
        for nid, name in new_names.items():
            insert_text += f'  "{nid}": "{name}",\n'
        # 在结尾前插入
        const_content = const_content[:node_names_end] + insert_text + const_content[node_names_end:]
        print(f"✅ 已添加 {len(new_names)} 个条目到 NODE_NAMES")

    with open(CONSTANTS_PATH, 'w', encoding='utf-8') as f:
        f.write(const_content)

    # 更新学习路径
    with open(LP_PATH, 'r', encoding='utf-8') as f:
        lp = f.read()

    # electronics-path: 添加 elec-fpga
    lp = lp.replace(
        "nodes: ['elec-circuit', 'elec-signals', 'elec-digital', 'elec-pcb'],",
        "nodes: ['elec-circuit', 'elec-signals', 'elec-digital', 'elec-pcb', 'elec-fpga'],"
    )
    print("✅ electronics-path 已扩展至 5 节点")

    # signals-path: 添加 signals-antenna
    lp = lp.replace(
        "nodes: ['signals-basics', 'math-linear-algebra', 'math-probability', 'signals-comm', 'signals-dsp', 'signals-wireless'],",
        "nodes: ['signals-basics', 'math-linear-algebra', 'math-probability', 'signals-comm', 'signals-dsp', 'signals-wireless', 'signals-antenna'],"
    )
    print("✅ signals-path 已扩展至 7 节点")

    # electrical-path: 添加 electrical-relay
    lp = lp.replace(
        "nodes: ['elec-circuit', 'elec-motor', 'electrical-power', 'electrical-power-electronics', 'electrical-safety'],",
        "nodes: ['elec-circuit', 'elec-motor', 'electrical-power', 'electrical-power-electronics', 'electrical-safety', 'electrical-relay'],"
    )
    print("✅ electrical-path 已扩展至 6 节点")

    with open(LP_PATH, 'w', encoding='utf-8') as f:
        f.write(lp)

    print("\n✅ 全部完成")


if __name__ == '__main__':
    main()
