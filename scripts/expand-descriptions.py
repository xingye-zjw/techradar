"""
批量扩充节点描述
"""
import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 节点描述扩充映射
descriptions = {
    'math-probability': '深入学习概率论与数理统计，包括常见分布、贝叶斯推断、假设检验与信息论基础，为理解机器学习中的不确定性与交叉熵损失奠定数学基础',
    'cv-cnn': '系统掌握卷积神经网络核心原理，包括感受野计算、经典架构（ResNet/LeNet/VGG）、迁移学习策略与特征可视化方法，是计算机视觉的基石',
    'nlp-sentiment-analysis': '全面学习情感分析与文本分类技术，涵盖传统机器学习（SVM/朴素贝叶斯）与深度学习（CNN/RNN/Transformer）两大方法体系',
    'project-capstone': '从选题调研到最终上线的完整项目实战，包含需求分析、数据采集、模型训练、系统部署、文档撰写与答辩全流程',
    'project-rag-app': '构建基于大语言模型的检索增强生成系统，从文档切分、向量检索、Prompt 工程到问答应用，掌握 RAG 全栈开发能力',
    'project-cv-classification': '从零开始完成图像分类项目，涵盖数据增强、模型选型、训练调优、模型压缩到端侧部署的完整计算机视觉开发链路',
    'project-llm-agent': '设计并实现具备工具调用、规划推理、记忆管理能力的 LLM Agent 应用，掌握 ReAct、AutoGPT 等主流 Agent 架构',
    'ctrl-pid': '深入理解自动控制理论核心概念，掌握反馈控制原理、PID 控制器设计与参数整定方法，是工业控制与机器人的基础',
    'llm-pretraining': '系统学习大语言模型预训练全流程，包括数据清洗配比、模型架构设计、分布式训练策略与训练稳定性优化',
}

replacements = 0
for node_id, new_desc in descriptions.items():
    old_pattern = rf'(id:\s*"{node_id}".*?description:\s*")([^"]+)(")'
    match = re.search(old_pattern, content, re.DOTALL)
    if match:
        old_desc = match.group(2)
        if len(old_desc) < 35:
            new_content = re.sub(old_pattern, rf'\1{new_desc}\3', content, count=1, flags=re.DOTALL)
            if new_content != content:
                content = new_content
                replacements += 1
                print(f'✅ {node_id}: {len(old_desc)}字 -> {len(new_desc)}字')
            else:
                print(f'❌ {node_id}: 替换失败')
        else:
            print(f'⏭️ {node_id}: 已足够 ({len(old_desc)}字)，跳过')
    else:
        print(f'❌ {node_id}: 未找到')

with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\n共替换 {replacements} 个节点描述')
