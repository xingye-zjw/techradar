"""
为 34 个旧式踩坑文件添加标准 YAML frontmatter。
每个文件包含多个踩坑条目，在文件顶部添加统一 frontmatter，保留正文不变。
"""
import re
import os

INTEL_DIR = 'content/intel'

# 34 个旧式踩坑文件的元数据：slug -> (title, category, difficulty, summary, tags, relatedIntel)
PITFALL_META = {
    '090-pitfall-dl-training': {
        'title': '深度学习训练常见踩坑合集',
        'category': 'deep-learning',
        'difficulty': 'intermediate',
        'summary': '深度学习训练中最常见的 5 个踩坑：CUDA OOM、Loss NaN、DataLoader 卡死、收敛慢、隐式同步慢，附快速修复与排查步骤。',
        'tags': ['踩坑', '深度学习', '训练', 'OOM', 'NaN', 'CUDA'],
        'relatedIntel': ['011-pytorch', '034-cuda-programming', '017-metrics'],
    },
    '091-pitfall-gpu-cuda': {
        'title': 'GPU 与 CUDA 环境踩坑合集',
        'category': 'deep-learning',
        'difficulty': 'intermediate',
        'summary': 'GPU 驱动、CUDA 版本、PyTorch 编译不匹配等环境问题排查，涵盖多卡并行、显存碎片、混合精度等场景。',
        'tags': ['踩坑', 'GPU', 'CUDA', '环境配置'],
        'relatedIntel': ['034-cuda-programming', '011-pytorch'],
    },
    '092-pitfall-python': {
        'title': 'Python 开发常见踩坑合集',
        'category': 'devops',
        'difficulty': 'beginner',
        'summary': 'Python 依赖冲突、虚拟环境、编码问题、性能陷阱等常见踩坑，附标准化修复方案。',
        'tags': ['踩坑', 'Python', '依赖', '虚拟环境'],
        'relatedIntel': ['010-numpy-pandas', '009-linux'],
    },
    '093-pitfall-docker': {
        'title': 'Docker 容器化踩坑合集',
        'category': 'devops',
        'difficulty': 'intermediate',
        'summary': 'Docker 构建、镜像体积、GPU 支持、网络配置、时区等常见问题排查与修复。',
        'tags': ['踩坑', 'Docker', '容器化', 'GPU'],
        'relatedIntel': ['007-docker', '034-cuda-programming'],
    },
    '094-pitfall-data-engineering': {
        'title': '数据工程踩坑合集',
        'category': 'data-processing',
        'difficulty': 'intermediate',
        'summary': '数据管道中的标签噪声、数据倾斜、特征泄漏、内存溢出等问题排查与修复。',
        'tags': ['踩坑', '数据工程', '数据质量', 'ETL'],
        'relatedIntel': ['023-data-pipeline-etl', '040-data-annotation'],
    },
    '095-pitfall-llm-app': {
        'title': 'LLM 应用开发踩坑合集',
        'category': 'llm',
        'difficulty': 'intermediate',
        'summary': 'LLM 应用开发中的 Prompt 注入、上下文截断、流式输出、Token 计费等常见问题排查。',
        'tags': ['踩坑', 'LLM', 'Prompt', '应用开发'],
        'relatedIntel': ['020-prompt-engineering', '005-rag', '031-agentic-ai'],
    },
    '096-pitfall-rag': {
        'title': 'RAG 系统踩坑合集',
        'category': 'llm',
        'difficulty': 'intermediate',
        'summary': 'RAG 系统中检索不准、幻觉、分块策略、向量数据库选择等常见问题排查与优化。',
        'tags': ['踩坑', 'RAG', '检索', '幻觉'],
        'relatedIntel': ['005-rag', '035-advanced-rag', '042-vector-database'],
    },
    '097-pitfall-embedded': {
        'title': '嵌入式开发踩坑合集',
        'category': 'embedded',
        'difficulty': 'intermediate',
        'summary': '嵌入式开发中指针越界、栈溢出、硬件抽象层、中断优先级等常见问题排查与修复。',
        'tags': ['踩坑', '嵌入式', 'C语言', 'RTOS'],
        'relatedIntel': ['052-embedded-c', '053-embedded-rtos'],
    },
    '098-pitfall-hardware': {
        'title': '硬件设计踩坑合集',
        'category': 'electronics',
        'difficulty': 'advanced',
        'summary': '硬件设计中电源噪声、信号完整性、ESD 防护、PCB 布线等常见问题排查。',
        'tags': ['踩坑', '硬件', 'PCB', '信号完整性'],
        'relatedIntel': ['054-elec-circuit', '080-elec-pcb'],
    },
    '099-pitfall-ops': {
        'title': '运维与服务器踩坑合集',
        'category': 'devops',
        'difficulty': 'intermediate',
        'summary': 'SSH 连接、防火墙、磁盘满、日志清理、进程管理等运维常见问题排查与修复。',
        'tags': ['踩坑', '运维', 'SSH', 'Linux'],
        'relatedIntel': ['009-linux', '016-server-setup', '028-server-ops'],
    },
    '100-pitfall-cv': {
        'title': '计算机视觉踩坑合集',
        'category': 'computer-vision',
        'difficulty': 'intermediate',
        'summary': 'CV 项目中数据增强、标注质量、模型过拟合、推理速度等常见问题排查与优化。',
        'tags': ['踩坑', '计算机视觉', '训练', '部署'],
        'relatedIntel': ['006-cnn-basics', '002-yolo', '014-onnx'],
    },
    '101-pitfall-nlp': {
        'title': 'NLP 踩坑合集',
        'category': 'nlp',
        'difficulty': 'intermediate',
        'summary': 'NLP 项目中分词、编码、Padding、梯度爆炸、评估指标等常见问题排查与修复。',
        'tags': ['踩坑', 'NLP', '分词', '训练'],
        'relatedIntel': ['064-nlp-rnn', '001-transformer'],
    },
    '102-pitfall-metrics': {
        'title': '模型评估指标踩坑合集',
        'category': 'machine-learning',
        'difficulty': 'intermediate',
        'summary': '模型评估中准确率陷阱、数据泄漏、交叉验证误用、F1 vs ROC 等常见问题排查。',
        'tags': ['踩坑', '评估指标', '准确率', '交叉验证'],
        'relatedIntel': ['017-metrics', '039-model-evaluation'],
    },
    '103-pitfall-deployment': {
        'title': '模型部署踩坑合集',
        'category': 'devops',
        'difficulty': 'advanced',
        'summary': '模型部署中 ONNX 转换、量化精度、推理延迟、并发处理等常见问题排查与修复。',
        'tags': ['踩坑', '部署', 'ONNX', '量化'],
        'relatedIntel': ['014-onnx', '026-onnx-deployment', '019-vllm-inference'],
    },
    '104-pitfall-security': {
        'title': 'AI 安全踩坑合集',
        'category': 'llm',
        'difficulty': 'advanced',
        'summary': 'AI 安全中 Prompt 注入、数据泄露、模型逆向、对抗样本等安全问题排查与防护。',
        'tags': ['踩坑', '安全', 'Prompt注入', '对抗样本'],
        'relatedIntel': ['038-llm-security', '020-prompt-engineering'],
    },
    '105-pitfall-git': {
        'title': 'Git 版本控制踩坑合集',
        'category': 'devops',
        'difficulty': 'beginner',
        'summary': 'Git 中合并冲突、误删分支、大文件、子模块等常见问题排查与修复。',
        'tags': ['踩坑', 'Git', '版本控制', '合并冲突'],
        'relatedIntel': ['008-git'],
    },
    '106-pitfall-k8s': {
        'title': 'Kubernetes 踩坑合集',
        'category': 'devops',
        'difficulty': 'advanced',
        'summary': 'K8s 中 Pod 崩溃、ImagePull 失败、资源不足、网络策略等常见问题排查与修复。',
        'tags': ['踩坑', 'Kubernetes', 'Pod', '集群'],
        'relatedIntel': ['021-kubernetes', '022-prometheus-grafana'],
    },
    '107-pitfall-db': {
        'title': '数据库踩坑合集',
        'category': 'cs',
        'difficulty': 'intermediate',
        'summary': '数据库中慢查询、死锁、索引失效、连接池耗尽等常见问题排查与优化。',
        'tags': ['踩坑', '数据库', 'SQL', '索引'],
        'relatedIntel': ['076-cs-database'],
    },
    '108-pitfall-network': {
        'title': '网络编程踩坑合集',
        'category': 'cs',
        'difficulty': 'intermediate',
        'summary': '网络编程中连接超时、端口占用、CORS、DNS 解析等常见问题排查与修复。',
        'tags': ['踩坑', '网络', 'TCP', 'CORS'],
        'relatedIntel': ['075-cs-network'],
    },
    '109-pitfall-rtos': {
        'title': 'RTOS 实时操作系统踩坑合集',
        'category': 'embedded',
        'difficulty': 'advanced',
        'summary': 'RTOS 中任务栈溢出、优先级反转、死锁、中断延迟等常见问题排查与修复。',
        'tags': ['踩坑', 'RTOS', '任务调度', '中断'],
        'relatedIntel': ['053-embedded-rtos'],
    },
    '110-pitfall-control': {
        'title': '自动控制踩坑合集',
        'category': 'control',
        'difficulty': 'advanced',
        'summary': '自动控制中 PID 振荡、积分饱和、采样率选择、噪声滤波等常见问题排查与修复。',
        'tags': ['踩坑', 'PID', '控制', '振荡'],
        'relatedIntel': ['057-ctrl-pid', '068-ctrl-state-space'],
    },
    '111-pitfall-circuit': {
        'title': '电路设计踩坑合集',
        'category': 'electronics',
        'difficulty': 'intermediate',
        'summary': '电路设计中 H 桥直通、去耦电容、接地环路、运放振荡等常见问题排查与修复。',
        'tags': ['踩坑', '电路', 'H桥', '运放'],
        'relatedIntel': ['054-elec-circuit', '079-elec-digital'],
    },
    '124-pitfall-rl': {
        'title': '强化学习踩坑合集',
        'category': 'machine-learning',
        'difficulty': 'advanced',
        'summary': '强化学习中奖励设计、探索利用、训练不稳定、收敛慢等常见问题排查与修复。',
        'tags': ['踩坑', '强化学习', '奖励', '训练'],
        'relatedIntel': ['112-rl-basics'],
    },
    '125-pitfall-gnn': {
        'title': '图神经网络踩坑合集',
        'category': 'machine-learning',
        'difficulty': 'advanced',
        'summary': 'GNN 中过平滑、图构建、批处理、内存消耗等常见问题排查与修复。',
        'tags': ['踩坑', 'GNN', '图神经网络'],
        'relatedIntel': ['113-gnn-basics'],
    },
    '126-pitfall-recsys': {
        'title': '推荐系统踩坑合集',
        'category': 'machine-learning',
        'difficulty': 'intermediate',
        'summary': '推荐系统中冷启动、数据倾斜、特征穿越、A/B 测试等常见问题排查与修复。',
        'tags': ['踩坑', '推荐系统', '冷启动', 'A/B测试'],
        'relatedIntel': ['116-recommender-systems'],
    },
    '127-pitfall-speech': {
        'title': '语音处理踩坑合集',
        'category': 'speech',
        'difficulty': 'intermediate',
        'summary': '语音识别与合成中音频格式、噪声处理、流式推理、多语言等常见问题排查。',
        'tags': ['踩坑', '语音', 'ASR', 'TTS'],
        'relatedIntel': ['114-asr-speech-recognition', '115-tts-speech-synthesis'],
    },
    '128-pitfall-time-series': {
        'title': '时间序列踩坑合集',
        'category': 'data-processing',
        'difficulty': 'intermediate',
        'summary': '时间序列中平稳性、季节性、缺失值、多步预测等常见问题排查与修复。',
        'tags': ['踩坑', '时间序列', '预测', 'ARIMA'],
        'relatedIntel': ['117-time-series'],
    },
    '129-pitfall-3d-cv': {
        'title': '3D 视觉踩坑合集',
        'category': 'computer-vision',
        'difficulty': 'advanced',
        'summary': '3D 视觉中点云配准、深度图、相机标定、多视角融合等常见问题排查与修复。',
        'tags': ['踩坑', '3D视觉', '点云', '标定'],
        'relatedIntel': ['120-3d-point-cloud'],
    },
    '130-pitfall-automl': {
        'title': 'AutoML 踩坑合集',
        'category': 'machine-learning',
        'difficulty': 'intermediate',
        'summary': 'AutoML 中搜索空间、过拟合搜索、资源分配、可解释性等常见问题排查。',
        'tags': ['踩坑', 'AutoML', '超参搜索'],
        'relatedIntel': ['123-automl'],
    },
    '131-pitfall-microservice': {
        'title': '微服务架构踩坑合集',
        'category': 'devops',
        'difficulty': 'advanced',
        'summary': '微服务中服务发现、链路追踪、分布式事务、熔断降级等常见问题排查与修复。',
        'tags': ['踩坑', '微服务', '分布式', '熔断'],
        'relatedIntel': ['021-kubernetes', '043-mlops-engineering'],
    },
    '132-pitfall-frontend': {
        'title': '前端开发踩坑合集',
        'category': 'cs',
        'difficulty': 'intermediate',
        'summary': '前端中跨域、状态管理、构建配置、性能优化等常见问题排查与修复。',
        'tags': ['踩坑', '前端', 'CORS', '性能'],
        'relatedIntel': ['075-cs-network'],
    },
    '133-pitfall-algorithm': {
        'title': '算法与数据结构踩坑合集',
        'category': 'cs',
        'difficulty': 'intermediate',
        'summary': '算法中边界条件、整数溢出、哈希冲突、递归栈溢出等常见问题排查与修复。',
        'tags': ['踩坑', '算法', '边界条件', '溢出'],
        'relatedIntel': ['050-cs-algo'],
    },
    '134-pitfall-project-mgmt': {
        'title': '项目管理踩坑合集',
        'category': 'best-practices',
        'difficulty': 'beginner',
        'summary': 'AI 项目管理中需求变更、数据获取、模型评估、部署运维等常见问题与避坑指南。',
        'tags': ['踩坑', '项目管理', '需求', '部署'],
        'relatedIntel': ['043-mlops-engineering', '039-model-evaluation'],
    },
    '135-pitfall-interview': {
        'title': '技术面试踩坑合集',
        'category': 'best-practices',
        'difficulty': 'beginner',
        'summary': '技术面试中简历包装、算法手撕、系统设计、项目深挖等常见踩坑与应对策略。',
        'tags': ['踩坑', '面试', '简历', '系统设计'],
        'relatedIntel': [],
    },
}


def generate_frontmatter(meta):
    """生成 YAML frontmatter 字符串"""
    lines = ['---']
    lines.append(f'title: "{meta["title"]}"')
    lines.append(f'category: {meta["category"]}')
    lines.append(f'difficulty: {meta["difficulty"]}')
    lines.append(f'duration: 30分钟')
    lines.append(f'summary: {meta["summary"]}')

    lines.append('takeaways:')
    lines.append(f'  - 掌握「{meta["title"]}」中各问题的快速识别方法')
    lines.append(f'  - 理解每个踩坑的根因分析和排查步骤')
    lines.append(f'  - 学会标准化的修复流程和预防措施')

    if meta.get('relatedIntel'):
        lines.append('relatedIntel:')
        for r in meta['relatedIntel']:
            lines.append(f'  - {r}')

    lines.append('tags:')
    for tag in meta['tags']:
        lines.append(f'  - {tag}')

    lines.append('---')
    return '\n'.join(lines)


def main():
    fixed = 0
    for slug, meta in PITFALL_META.items():
        filepath = os.path.join(INTEL_DIR, f'{slug}.md')
        if not os.path.exists(filepath):
            print(f"⚠️  文件不存在: {filepath}")
            continue

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查是否已有 frontmatter
        if content.startswith('---'):
            print(f"ℹ️  {slug}: 已有 frontmatter，跳过")
            continue

        # 在文件顶部添加 frontmatter
        frontmatter = generate_frontmatter(meta)
        new_content = frontmatter + '\n\n' + content

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ {slug}: 已添加 frontmatter")
        fixed += 1

    print(f"\n共修复 {fixed} 个旧式踩坑文件")


if __name__ == '__main__':
    main()
