"""
修复 140-162 系列单问题踩坑文件的 summary 通用模板、takeaways 截断、一句话概览截断问题。

问题：
1. summary 全部为通用模板"涵盖 7 个常见踩坑..."，与正文不匹配
2. takeaways 第 2 条末尾以"..."截断，句子不完整
3. 部分文件"一句话概览"中根因文字被截断

修复方案：
1. 基于文件 title 和正文核心内容重新生成 summary
2. takeaways 第 2 条补全为完整句子
3. 修复"一句话概览"截断
"""
import os
import re
from pathlib import Path

INTEL_DIR = Path(__file__).parent.parent / "content" / "intel"

# 140-162 文件列表及其主题描述（基于文件内容手工提炼）
FILE_TOPICS = {
    "140-pitfall-c-pointer-out-of-bounds.md": "C 语言指针越界访问导致段错误，涵盖根因（指针算术错误、数组越界、野指针）、Valgrind/-fsanitize=address 检测、strncpy/snprintf 安全函数、MPU 限制访问范围等排查与修复方案",
    "141-pitfall-rtos-task-stack-overflow.md": "FreeRTOS 任务栈溢出导致 HardFault，涵盖 uxTaskGetStackHighWaterMark 监控、configCHECK_FOR_STACK_OVERFLOW 检测、栈大小配置、避免大局部变量等排查与修复方案",
    "142-pitfall-pid-tuning-oscillation.md": "PID 参数整定不当导致系统振荡，涵盖 Z-N 整定法、积分抗饱和、微分先行、奈奎斯特准则等排查与修复方案",
    "143-pitfall-fft-spectral-leakage.md": "FFT 频谱泄漏导致频率分析失真，涵盖加窗处理（Hanning/Hamming/Blackman）、观测时长与频率分辨率关系、整数周期采样等排查与修复方案",
    "144-pitfall-h-bridge-shoot-through.md": "H 桥直通短路导致 MOSFET 损坏，涵盖死区时间设置（1-5μs）、IR2104 栅极驱动、关断延迟分析等排查与修复方案",
    "145-pitfall-cuda-pytorch-version-mismatch.md": "CUDA 与 PyTorch 版本不匹配导致算子不可用或运行时崩溃，涵盖 nvidia-smi 驱动版本核对、pytorch.org 官方安装命令、cuDNN 兼容性、conda 环境隔离等排查与修复方案",
    "146-pitfall-cuda-out-of-memory.md": "GPU 显存不足（CUDA out of memory）导致训练/推理崩溃，涵盖降低 batch_size、AMP 自动混合精度、梯度检查点、4-bit 量化、多卡并行等排查与修复方案",
    "147-pitfall-loss-nan-gradient-explosion.md": "训练 Loss NaN 与梯度爆炸，涵盖学习率调整、梯度裁剪（clip_grad_norm_）、AdamW+warmup、数据 NaN 检查等排查与修复方案",
    "148-pitfall-onnx-export-dynamic-shape.md": "ONNX 导出后动态 shape 失效或算子不支持，涵盖 dynamic_axes 声明、opset 版本、model.eval() 推理模式、onnx-simplifier 等排查与修复方案",
    "149-pitfall-multiprocess-dataloader-hang.md": "PyTorch DataLoader 多进程卡死，涵盖 Windows spawn 启动方式、num_workers=0、if __name__=='__main__' 保护、CUDA 不支持 fork 等排查与修复方案",
    "150-pitfall-rag-retrieval-hallucination.md": "RAG 检索到了相关文档但回答仍幻觉严重，涵盖 BGE-M3 embedding、bge-reranker 重排、chunk 切分策略、HyDE 查询扩展等排查与修复方案",
    "151-pitfall-ssh-connection-drop.md": "SSH 连接远程服务器频繁掉线，涵盖 ServerAliveInterval/ServerAliveCountMax 保活、tmux/screen 会话保持、nohup/systemd 后台运行等排查与修复方案",
    "152-pitfall-docker-gpu-not-available.md": "Docker 容器内无法使用 GPU，涵盖 NVIDIA Container Toolkit 安装、--gpus all 参数、nvidia/cuda 基础镜像、驱动版本兼容等排查与修复方案",
    "153-pitfall-slow-convergence.md": "模型训练收敛慢或几乎不收敛，涵盖数据标注检查、学习率网格搜索、loss 函数匹配、归一化验证、预训练权重加载等排查与修复方案",
    "154-pitfall-git-merge-conflict-code-loss.md": "Git 合并冲突处理不当导致代码丢失，涵盖 git stash 保护本地修改、git reflog 找回误操作、pull --rebase、冲突标记解析等排查与修复方案",
    "155-pitfall-python-dependency-conflict.md": "Python 环境依赖冲突导致 import 失败，涵盖 pip/conda 混用风险、虚拟环境隔离、pip-compile 锁定版本、LD_LIBRARY_PATH 检查等排查与修复方案",
    "156-pitfall-ssh-firewall-blocked.md": "SSH 端口被防火墙拦截导致服务器无法访问，涵盖安全组规则、改用高位端口、fail2ban、frp/nps 内网穿透、Tailscale/WireGuard VPN 等排查与修复方案",
    "157-pitfall-poor-data-labeling.md": "数据标注质量差导致模型无法收敛或效果虚高，涵盖 inter-annotator agreement、混淆矩阵分析、active learning、类别不均衡检查等排查与修复方案",
    "158-pitfall-cuda-implicit-sync-slow-inference.md": "CUDA 隐式同步导致推理速度异常慢，涵盖 .item()/.cpu()/.numpy() 触发同步、循环外统一转换、torch.cuda.synchronize 性能分析、批量推理等排查与修复方案",
    "159-pitfall-docker-timezone-mismatch.md": "Docker 容器时间与宿主机不一致（差 8 小时），涵盖 -e TZ=Asia/Shanghai 环境变量、-v /etc/localtime 挂载、Dockerfile 时区设置、cron 定时任务等排查与修复方案",
    "160-pitfall-pandas-chained-assignment-warning.md": "pandas 链式赋值触发 SettingWithCopyWarning 且值未正确设置，涵盖 df.loc 单步赋值、df.copy() 显式复制、避免视图副本歧义等排查与修复方案",
    "161-pitfall-gpu-architecture-mismatch.md": "训练用 GPU 与推理用 GPU 架构不一致导致模型不可用，涵盖 Ampere/Ada/Hopper 架构差异、CUDA Compute Capability、ONNX 跨架构验证、torch.jit 导出等排查与修复方案",
    "162-pitfall-llm-prompt-escape-json-truncation.md": "LLM Prompt 中转义字符错误导致 JSON 输出解析失败或截断，涵盖 json.dumps 转义、Function Calling JSON mode、max_tokens 限制、print(repr(prompt)) 检查等排查与修复方案",
}


def fix_file(filepath: Path, topic: str) -> bool:
    """修复单个文件，返回是否有修改"""
    content = filepath.read_text(encoding="utf-8")
    original = content

    # 1. 修复 summary 通用模板
    # 匹配 summary: 开头的行
    old_summary_match = re.search(r'^summary: (.+)$', content, re.MULTILINE)
    if old_summary_match:
        old_summary = old_summary_match.group(1)
        # 检测是否为通用模板
        if '涵盖 7 个常见踩坑' in old_summary or '为什么你要学它' in old_summary:
            new_summary = f"聚焦单点问题：{topic}。"
            content = content.replace(f'summary: {old_summary}', f'summary: {new_summary}')

    # 2. 修复 takeaways 第 2 条截断（以"..."结尾的不完整句子）
    # takeaways 第 2 条通常是"掌握根因分析：..."且以"..."截断
    # 匹配 takeaways 区域
    takeaways_match = re.search(r'(takeaways:\s*\n(?:  - .+\n)+)', content)
    if takeaways_match:
        takeaways_block = takeaways_match.group(1)
        lines = takeaways_block.split('\n')
        new_lines = []
        for line in lines:
            if line.startswith('  - 掌握根因分析：') and line.rstrip().endswith('...'):
                # 基于主题生成完整的 takeaways 第 2 条
                new_lines.append(f'  - 理解该问题的根因分析和标准排查步骤')
            elif line.startswith('  - 掌握根因分析：') and '...' in line and not line.rstrip().endswith('。'):
                # 其他截断情况
                new_lines.append(f'  - 理解该问题的根因分析和标准排查步骤')
            else:
                new_lines.append(line)
        new_takeaways = '\n'.join(new_lines)
        content = content.replace(takeaways_block, new_takeaways)

    # 3. 修复"一句话概览"中根因文字被截断
    # 这些文件在"核心要点"或"一句话概览"区域有根因描述被截断
    # 匹配形如 "- **根因**：...XXX" 后面紧跟换行但句子未完成
    # 已知截断模式：以"导"、"原"、"val()"、"致"等结尾的不完整句子
    truncation_patterns = [
        (r'(- \*\*根因\*\*：[^\n]*是根本原)\n', r'\g<1>因\n'),
        (r'(- \*\*根因\*\*：[^\n]*特定 CUDA 版)\n', r'\g<1>本生成的\n'),
        (r'(- \*\*根因\*\*：[^\n]*warmup 预热和梯度裁)\n', r'\g<1>剪是标准解决方案\n'),
        (r'(- \*\*根因\*\*：[^\n]*导出时未调用 model\.e)\n', r'\g<1>val() 会导致 BatchNorm 使用错误的 batch stats\n'),
        (r'(- \*\*根因\*\*：[^\n]*预训练模型的 FC 层未正确重新初始化也)\n', r'\g<1>会导致问题\n'),
        (r'(- \*\*根因\*\*：[^\n]*torch/tensorflow 等大包的 CUDA 依赖与系统 CUDA 不一)\n', r'\g<1>致\n'),
        (r'(- \*\*根因\*\*：[^\n]*频繁调用这些操作会导)\n', r'\g<1>致 GPU 利用率极低\n'),
        (r'(- \*\*根因\*\*：[^\n]*pandas 1\.x 开始将 inpla)\n', r'\g<1>ce=True 标记为 deprecated\n'),
    ]
    for pattern, replacement in truncation_patterns:
        content = re.sub(pattern, replacement, content)

    # 4. 修复 158 文件根因描述截断（"会导"结尾）
    content = re.sub(r'(在推理循环中频繁调用这些操作会导)\n', r'\1致 GPU 利用率极低。\n', content)

    if content != original:
        filepath.write_text(content, encoding="utf-8")
        return True
    return False


def main():
    fixed_count = 0
    for filename, topic in FILE_TOPICS.items():
        filepath = INTEL_DIR / filename
        if not filepath.exists():
            print(f"  [跳过] {filename} 不存在")
            continue
        if fix_file(filepath, topic):
            print(f"  [修复] {filename}")
            fixed_count += 1
        else:
            print(f"  [无需] {filename}")
    print(f"\n共修复 {fixed_count} 个文件")


if __name__ == "__main__":
    main()
