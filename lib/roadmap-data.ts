import type { RoadmapNode as RoadmapNodeType, DailyTask, ResourceLink } from "../components/radar/types";

// ============================================================
// 全量路线图数据（含每日任务）
// 设计原则：所有任务为显式 DailyTask 对象，不使用工厂函数
// ============================================================

const R_LINUX_JOURNEY: ResourceLink = { title: "Linux Journey（命令行入门）", url: "https://linuxjourney.com/", required: true, type: "doc", source: "official" };
const R_GIT_SCM: ResourceLink = { title: "Git 官方文档 Pro Git", url: "https://git-scm.com/book/zh/v2", required: true, type: "doc", source: "official" };
const R_GIT_BRANCHING: ResourceLink = { title: "Learn Git Branching（可视化练习）", url: "https://learngitbranching.js.org/", required: true, type: "tool", source: "official" };
const R_DOCKER_START: ResourceLink = { title: "Docker 官方入门指南", url: "https://docs.docker.com/get-started/", required: true, type: "doc", source: "official" };
const R_DOCKER_BUILD: ResourceLink = { title: "Dockerfile 最佳实践", url: "https://docs.docker.com/engine/reference/builder/", required: true, type: "doc", source: "official" };
const R_PYTORCH_TUT: ResourceLink = { title: "PyTorch 官方 Tutorials", url: "https://pytorch.org/tutorials/", required: true, type: "doc", source: "official" };
const R_PYTORCH_DOC: ResourceLink = { title: "PyTorch 官方 API 文档", url: "https://pytorch.org/docs/stable/", required: true, type: "doc", source: "official" };
const R_NUMPY: ResourceLink = { title: "NumPy 官方文档", url: "https://numpy.org/doc/stable/", required: true, type: "doc", source: "official" };
const R_3B1B_LIN: ResourceLink = { title: "3Blue1Brown: 线性代数的本质", url: "https://www.3blue1brown.com/lessons/linear-algebra", required: true, type: "video", source: "youtube", duration: "3h" };
const R_D2L: ResourceLink = { title: "动手学深度学习 D2L", url: "https://zh.d2l.ai/", required: true, type: "book", source: "official" };
const R_CS231N: ResourceLink = { title: "Stanford CS231n：CNN 视觉识别", url: "http://cs231n.github.io/", required: true, type: "doc", source: "official" };
const R_ULTRALYTICS: ResourceLink = { title: "Ultralytics YOLO 官方文档", url: "https://docs.ultralytics.com/", required: true, type: "doc", source: "official" };
const R_CS224N: ResourceLink = { title: "Stanford CS224n：NLP 深度学习", url: "https://web.stanford.edu/class/cs224n/", required: true, type: "doc", source: "official" };
const R_HF_TRANSFORMERS: ResourceLink = { title: "HuggingFace Transformers 文档", url: "https://huggingface.co/docs/transformers/", required: true, type: "doc", source: "official" };
const R_HF_COURSE: ResourceLink = { title: "HuggingFace NLP Course", url: "https://huggingface.co/learn/nlp-course/", required: true, type: "doc", source: "official" };
const R_HF_PEFT: ResourceLink = { title: "HuggingFace PEFT 文档", url: "https://huggingface.co/docs/peft/", required: true, type: "doc", source: "official" };
const R_JALAMMAR: ResourceLink = { title: "Jay Alammar: 图解 Transformer", url: "https://jalammar.github.io/illustrated-transformer/", required: true, type: "article", source: "official" };
const R_FASTAPI: ResourceLink = { title: "FastAPI 官方教程", url: "https://fastapi.tiangolo.com/tutorial/", required: true, type: "doc", source: "official" };
const R_STREAMLIT: ResourceLink = { title: "Streamlit 官方入门", url: "https://docs.streamlit.io/library/get-started", required: true, type: "doc", source: "official" };
const R_LANGCHAIN: ResourceLink = { title: "LangChain 官方文档", url: "https://python.langchain.com/docs/get_started/introduction", required: false, type: "doc", source: "official" };
const R_GRADIO: ResourceLink = { title: "Gradio 快速入门", url: "https://www.gradio.app/guides/quickstart", required: false, type: "doc", source: "official" };
const R_LORA_PAPER: ResourceLink = { title: "LoRA 论文", url: "https://arxiv.org/abs/2106.09685", required: false, type: "article", source: "official" };

// B站视频资源示例
const B_GIT_TUTORIAL: ResourceLink = { title: "【尚硅谷】Git从入门到精通", url: "https://www.bilibili.com/video/BV1vy4y1s7k6", required: false, type: "video", source: "bilibili", duration: "6h" };
const B_CV_TUTORIAL: ResourceLink = { title: "【吴恩达】深度学习之计算机视觉", url: "https://www.bilibili.com/video/BV1FT4y1E74V", required: false, type: "video", source: "bilibili", duration: "6h" };

export const FULL_ROADMAP: RoadmapNodeType[] = [
  // =====================================================
  // Node 1: linux-basic
  // =====================================================
  {
    id: "linux-basic",
    name: "Linux 系统基础",
    track: "devops",
    duration: "2周",
    prerequisites: [],
    status: "available",
    position: { x: 50, y: 0 },
    description: "Shell / Bash / SSH / tmux / 进程管理，AI 开发者的必备工作环境",
    outcomes: ["熟练使用命令行", "远程操控 GPU 服务器"],
    relatedIntel: ["009-linux", "016-server-setup"],
    relatedTools: ["Docker"],
    relatedTerms: ["linux", "shell", "ssh", "cli"],
    dailyTasks: [
      { day: 1, title: "文件系统与常用命令实战", content: ["理解 Linux 目录结构是掌握系统的第一步。根目录 / 下有多个重要子目录：/home 存放用户主目录，/etc 存放系统配置文件，/tmp 是临时文件目录（重启可能清空），/var 存放日志和可变数据，/usr 存放用户安装的软件", "ls 命令用于列出目录内容，-l 参数显示详细信息（权限、所有者、大小、修改时间），-a 参数显示隐藏文件（以 . 开头的文件）", "mkdir 创建目录，-p 参数可以递归创建多级目录；cp 复制文件，mv 移动或重命名文件，rm 删除文件（-r 递归删除目录，-f 强制删除不提示）", "find 命令用于在目录树中搜索文件，可以按名称、类型、大小、时间等条件筛选；df 显示磁盘整体使用情况，du 显示目录或文件的磁盘占用"], duration: "1.5小时", resources: [R_LINUX_JOURNEY, { title: "Bash 初学者指南", url: "https://www.gnu.org/software/bash/manual/bash.html", required: false, type: "doc", source: "official" }, { title: "Linux 文件系统层次标准", url: "https://www.pathname.com/fhs/", required: false, type: "doc", source: "official" }], checkpoint: "能独立用 Linux 完成文件/目录操作，并解释 ls -la 每一列含义" },
      { day: 2, title: "文本查看与管道组合", content: ["深度学习训练日志动辄几 GB，无法用图形编辑器打开，必须掌握命令行文本查看工具。head 查看文件开头（默认前 10 行），tail 查看文件末尾，tail -f 可以实时追踪文件新增内容（非常适合监控训练日志）", "grep 是文本搜索利器：-r 递归搜索目录，-n 显示行号，-i 忽略大小写，-E 支持扩展正则表达式，-C 显示匹配行的上下文", "wc 命令统计文件的行数、单词数和字节数；awk 是强大的文本处理工具，特别适合按列提取数据和格式化输出", "管道符号 | 可以将多个命令串联起来，前一个命令的输出作为后一个命令的输入，实现复杂的数据处理流水线"], duration: "1.5小时", resources: [R_LINUX_JOURNEY, { title: "grep 命令详解", url: "https://www.gnu.org/software/grep/manual/grep.html", required: false, type: "doc", source: "official" }, { title: "awk 入门教程", url: "https://www.gnu.org/software/gawk/manual/gawk.html", required: false, type: "doc", source: "official" }], checkpoint: "能用 grep/awk/wc 对一个文本文件做简单统计和筛选" },
      { day: 3, title: "权限与用户管理", content: ["Linux 每个文件和目录都有三套权限：所有者（owner）、所属组（group）、其他用户（others），每套权限包含读（r）、写（w）、执行（x）三种", "权限可以用数字表示：r=4、w=2、x=1，将数字相加得到权限值。例如 755 表示所有者有全部权限（7=4+2+1），组用户和其他用户有读和执行权限（5=4+1）", "chmod 命令用于修改文件权限，脚本文件必须添加执行权限才能运行；chown 命令用于修改文件的所有者和所属组", "sudo 命令让普通用户临时获得 root 权限执行命令，但 root 权限过大容易造成系统损坏，日常操作应使用普通用户"], duration: "1.5小时", resources: [R_LINUX_JOURNEY, { title: "Linux 权限详解", url: "https://www.linux.com/training-tutorials/understanding-linux-file-permissions/", required: false, type: "article", source: "other" }], checkpoint: "能解释文件权限 10 个字符列（-rwxr-xr-x）各部分含义" },
      { day: 4, title: "软链接、硬链接与 inode", content: ["inode 是 Linux 文件系统中存储文件元数据（权限、所有者、大小、时间戳等）的数据结构，每个文件都有唯一的 inode 编号", "硬链接是多个文件名指向同一个 inode，删除其中一个文件名不影响其他硬链接，只有所有硬链接都被删除后文件数据才会被真正删除", "软链接（符号链接）是一个特殊的文件，内容是目标文件的路径，类似于 Windows 的快捷方式。删除原文件后软链接会失效", "ls -li 命令可以同时显示文件名和 inode 编号，find 命令可以通过 -inum 参数查找具有相同 inode 的文件"], duration: "1.5小时", resources: [R_LINUX_JOURNEY, { title: "inode 详解", url: "https://www.redhat.com/sysadmin/inodes-linux-filesystem", required: false, type: "article", source: "other" }, { title: "Linux Filesystem Anatomy", url: "https://github.com/Maxвай/Linux-Filesystem-Anatomy", required: false, type: "repo", source: "github" }], checkpoint: "能清晰区分软链接与硬链接，并通过 inode 号验证" },
      { day: 5, title: "进程管理与信号", content: ["进程是程序运行的实例，每个进程都有唯一的进程 ID（PID）。ps 命令查看当前进程快照，top 命令实时显示进程状态和系统资源使用情况", "后台运行进程：在命令末尾添加 & 符号可以让命令在后台执行；nohup 命令让进程在用户退出登录后继续运行", "信号是进程间通信的一种方式。kill -15（SIGTERM）是优雅终止信号，允许进程清理资源后退出；kill -9（SIGKILL）是强制终止信号，立即杀死进程", "pgrep 命令按进程名查找 PID，pkill 按进程名发送信号，ps aux | grep 命令组合也可以查找特定进程"], duration: "2小时", resources: [R_LINUX_JOURNEY, { title: "Linux 进程管理", url: "https://www.redhat.com/sysadmin/linux-process-management", required: false, type: "article", source: "other" },  { title: "Linux Process Management GitHub", url: "https://github.com/vasani-arpit/Linux-Process-Management", required: false, type: "repo", source: "github" }], checkpoint: "能启动/查看/结束进程，并能解释 kill -9 和 -15 的差异" },
      { day: 6, title: "GPU 监控与 nvidia-smi", content: ["nvidia-smi 是 NVIDIA 系统管理接口命令，显示 GPU 的详细信息：型号、显存总量和使用量、温度、功耗、CUDA 版本、正在使用 GPU 的进程", "GPU-Util 显示 GPU 的计算利用率，训练时应该稳定在 80% 以上，如果长期为 0 说明模型没有在 GPU 上运行", "watch 命令可以定期执行指定命令并全屏显示输出，-n 参数指定刷新间隔（秒），常用于实时监控训练状态", "没有 GPU 的服务器可以用 free -h 查看内存使用情况，top 命令查看 CPU 使用率和进程列表"], duration: "2小时", resources: [{ title: "nvidia-smi 命令详解", url: "https://developer.nvidia.com/nvidia-system-management-interface", required: true, type: "doc", source: "official" }, { title: "GPU 监控最佳实践", url: "https://developer.nvidia.com/blog/gpu-monitoring-done-right/", required: false, type: "article", source: "official" }], checkpoint: "能读懂 nvidia-smi 输出，并判断 GPU 是否被正确使用" },
      { day: 7, title: "SSH 免密登录与配置", content: ["SSH（Secure Shell）是远程登录服务器的标准方式。密码认证每次都要输入密码，既麻烦又不安全；密钥认证使用公私钥对，更安全且可以免密登录", "ssh-keygen 命令生成密钥对（推荐 ed25519 算法），ssh-copy-id 命令将公钥复制到远程服务器的 ~/.ssh/authorized_keys 文件中", "通过配置 ~/.ssh/config 文件可以为服务器设置别名和默认参数，之后只需输入简短的命令即可连接", "scp 命令用于在本地和远程服务器之间复制文件，对于大目录或需要增量同步的场景推荐使用 rsync"], duration: "2小时", resources: [{ title: "SSH 配置实战", url: "https://www.ssh.com/academy/ssh/config", required: true, type: "doc", source: "official" }, { title: "OpenSSH 官方文档", url: "https://www.openssh.com/manual.html", required: false, type: "doc", source: "official" }], checkpoint: "能通过 Host 别名一行免密登录远程 GPU 服务器" },
      { day: 8, title: "rsync 与文件同步", content: ["rsync 是一个快速、多功能的文件同步工具，支持本地和远程同步。它的核心优势是增量传输：只传输文件中发生变化的部分，大大减少传输量", "-a 参数表示归档模式（保留权限、时间戳、符号链接等），-v 显示详细信息，-z 传输时压缩数据，--progress 显示传输进度", "--delete 参数可以让目标目录与源目录完全一致（删除目标中多余的文件），适合做备份；--exclude 参数可以排除不需要同步的文件", "rsync 通过 SSH 协议传输数据，语法为 rsync [选项] 源路径 用户@主机:目标路径"], duration: "2小时", resources: [{ title: "rsync 官方教程", url: "https://rsync.samba.org/", required: true, type: "doc", source: "official" }, { title: "rsync 实用示例", url: "https://www.digitalocean.com/community/tutorials/how-to-use-rsync-to-sync-local-and-remote-directories", required: false, type: "article", source: "other" }], checkpoint: "能用 rsync 把本地目录增量同步到远程服务器" },
      { day: 9, title: "tmux 终端复用", content: ["tmux 是终端复用器，可以让一个终端窗口中运行多个会话。最重要的功能是：即使断开 SSH 连接，tmux 中的进程也会继续运行", "tmux new -s 会话名 创建新会话，Ctrl+b 然后 d 脱离会话（进程继续运行），tmux attach -t 会话名 重新连接会话", "tmux 支持分屏功能：Ctrl+b 然后 % 垂直分屏，Ctrl+b 然后 \" 水平分屏，可以一边看训练日志一边监控 GPU", "实际应用场景：在 tmux 中启动长时间训练任务 → 脱离会话 → 关闭电脑 → 回家后重新连接查看训练进度"], duration: "1.5小时", resources: [{ title: "tmux Cheat Sheet", url: "https://tmuxcheatsheet.com/", required: true, type: "doc", source: "official" }, { title: "tmux 入门教程", url: "https://www.hamvorking.com/getting-started-with-tmux/", required: false, type: "article", source: "other" }], checkpoint: "能在远程服务器上用 tmux 跑长时间任务，关闭本地终端不中断" },
      { day: 10, title: "shell 脚本与自动化", content: ["Shell 脚本是将多个命令组合成一个可执行文件的方式，可以自动化重复性任务。脚本文件以 #!/bin/bash 开头（称为 shebang），指定解释器", "变量赋值时等号两边不能有空格，使用变量时需要加 $ 前缀；$1、$2 表示脚本参数，$# 表示参数个数，$@ 表示所有参数", "条件判断使用 if-then-else 结构，循环可以使用 for 或 while；函数用 function_name() { ... } 定义", "chmod +x script.sh 给脚本添加执行权限后，可以直接运行 ./script.sh，或者用 bash script.sh 显式调用解释器"], duration: "2小时", resources: [{ title: "Bash Shell Scripting", url: "https://tldp.org/LDP/Bash-Beginners-Guide/html/", required: false, type: "doc", source: "official" }, { title: "Shell 脚本教程", url: "https://www.shellscript.sh/", required: false, type: "doc", source: "official" }], checkpoint: "能写出带参数、带时间戳命名的 bash 脚本并运行" },
      { day: 11, title: "环境变量与 PATH", content: ["环境变量是存储系统配置信息的变量。PATH 变量包含一系列目录路径，当你输入命令时，系统会在这些目录中查找对应的可执行文件", "which 命令显示命令的完整路径；echo $PATH 查看当前 PATH 设置；export 命令设置环境变量，写入 ~/.bashrc 可以永久生效", "alias 命令可以创建命令别名，例如 alias py='python3'，将常用命令简化。别名也建议写入 ~/.bashrc 文件", "source ~/.bashrc 命令让修改后的配置立即生效，不需要重新登录；env 命令列出所有环境变量"], duration: "1.5小时", resources: [R_LINUX_JOURNEY, { title: "Linux 环境变量详解", url: "https://www.serverwatch.com/guides/setting-up-linux-environment-variables/", required: false, type: "article", source: "other" }, { title: "Linux Environment Variables Guide", url: "https://github.com/vasani-arpit/Linux-Environment-Variables", required: false, type: "repo", source: "github" }], checkpoint: "能让自己编译/安装的程序在任意目录用短命令调用" },
      { day: 12, title: "包管理与软件安装", content: ["包管理器是 Linux 发行版用来安装、更新、卸载软件的工具。不同发行版使用不同的包管理器：Ubuntu/Debian 使用 apt，CentOS/RHEL 使用 yum 或 dnf", "apt update 更新软件包列表，apt install 安装软件包，apt remove 卸载软件包，apt upgrade 升级已安装的软件包", "从源码编译安装软件的一般步骤：./configure 配置编译选项，make 编译源码，make install 安装到系统目录", "pip install --user 将 Python 包安装到用户目录，不需要 root 权限，且不会影响系统级的 Python 环境"], duration: "2小时", resources: [R_LINUX_JOURNEY, { title: "apt 命令详解", url: "https://ubuntu.com/server/docs/package-management", required: false, type: "doc", source: "official" }, { title: "Linux Package Management Cheat Sheet", url: "https://github.com/vasani-arpit/Linux-Package-Management", required: false, type: "repo", source: "github" }], checkpoint: "能通过 apt/yum/pip 三种方式安装软件，并理解各自适用场景" },
      { day: 13, title: "远程调试 CUDA/训练问题", content: ["CUDA 是 NVIDIA 的并行计算平台，PyTorch 等深度学习框架依赖它来使用 GPU。nvcc --version 查看 CUDA 编译器版本", "torch.cuda.is_available() 检查 PyTorch 是否能访问 GPU，torch.version.cuda 查看 PyTorch 编译时使用的 CUDA 版本", "常见问题：CUDA not available 通常是驱动版本、CUDA 版本、PyTorch 版本三者不匹配导致的，需要检查版本兼容性", "nvidia-smi topo -m 查看 GPU 的拓扑结构（NVLink 连接等），CUDA_VISIBLE_DEVICES 环境变量控制程序可见的 GPU"], duration: "2.5小时", resources: [R_PYTORCH_DOC, { title: "CUDA 安装指南", url: "https://developer.nvidia.com/cuda-downloads", required: false, type: "doc", source: "official" }, { title: "PyTorch CUDA 兼容性", url: "https://pytorch.org/get-started/locally/", required: false, type: "doc", source: "official" }, { title: "CUDA-GDB Debugging Guide", url: "https://docs.nvidia.com/cuda/cuda-gdb/", required: false, type: "doc", source: "official" }], checkpoint: "能在远程服务器上跑一个最小 CUDA 检测脚本并定位问题" },
      { day: 14, title: "综合：从克隆代码到跑通训练", content: ["本练习将串联前 13 天所学的所有技能：SSH 连接服务器、克隆代码、创建环境、运行训练、同步结果", "首先通过 SSH 连接到远程 GPU 服务器，使用 git clone 克隆一个 PyTorch 训练项目", "使用 conda create 创建独立的 Python 环境，安装项目依赖（pip install -r requirements.txt）", "编写 run.sh 启动脚本，在 tmux 中后台运行训练，使用 rsync 将训练日志和权重文件同步回本地"], duration: "3小时", resources: [R_LINUX_JOURNEY, R_PYTORCH_TUT, { title: "Conda 入门指南", url: "https://conda.io/projects/conda/en/latest/user-guide/getting-started.html", required: false, type: "doc", source: "official" }], checkpoint: "独立完成：克隆 → 建环境 → 跑训练 → 拉回日志，流程全自动化" }],
  },

  // =====================================================
  // Node 2: git-github
  // =====================================================
  {
    id: "git-github",
    name: "Git & GitHub 协作",
    track: "devops",
    duration: "2周",
    prerequisites: ["linux-basic"],
    status: "locked",
    position: { x: 50, y: 220 },
    description: "版本控制、分支管理、GitHub PR 协作流程",
    outcomes: ["独立参与开源项目协作", "代码 Code Review 能力"],
    relatedIntel: ["008-git"],
    relatedTools: [],
    relatedTerms: ["git", "github", "commit", "branch", "pull-request"],
    dailyTasks: [
      { day: 1, title: "仓库初始化与基础配置", content: ["Git 是分布式版本控制系统，它会记录代码的每一次修改，让你可以随时回退到任意历史版本、对比差异、多人协作。开始前需要用 git config 设置全局用户名和邮箱，这些信息会写入每次提交记录中", "git init 命令会在当前目录创建一个 .git 隐藏目录，里面存储所有的版本信息、配置、对象数据库和引用指针，有了它这个目录就变成了一个 Git 仓库", "git add 命令把工作区的修改加入暂存区（staging area），相当于告诉 Git '这些改动我要提交'；git commit 则把暂存区的内容生成一个永久快照，提交信息要写清楚这次改了什么、为什么改", "git log 命令查看完整的提交历史，包括作者、时间、提交信息；加上 --oneline 参数可以把每条提交压缩成一行，方便快速浏览"], duration: "1.5小时", resources: [R_GIT_SCM, B_GIT_TUTORIAL, { title: "GitHub Skills: Introduction to GitHub", url: "https://skills.github.com/", required: false }, { title: "廖雪峰 Git 教程", url: "https://liaoxuefeng.com/books/git/introduction/index.html", required: false },  { title: "awesome-git 资源列表", url: "https://github.com/dictcp/awesome-git", required: false, type: "repo", source: "github" }], checkpoint: "能从零创建 Git 仓库，完成一次 add + commit" },
      { day: 2, title: "理解 .git 目录与对象模型", content: ["Git 的所有数据都存储在 .git 目录中，用 ls -la .git/ 可以看到 HEAD 文件（指向当前分支）、objects 目录（存储所有数据对象）、refs 目录（存储分支和标签指针）、config 文件（仓库级配置）", "HEAD 文件记录了当前检出的分支引用，用 cat .git/HEAD 可以看到类似 ref: refs/heads/main 的内容；git rev-parse HEAD 命令可以把这个引用解析成完整的 40 位 SHA-1 哈希值", "Git 内部只有三种核心对象：blob 存储文件内容，tree 存储目录结构（类似文件夹），commit 存储一次提交的快照（包含 tree、作者、时间、父提交）。用 git cat-file -p <sha> 可以查看任意对象的内容", "可以用 echo 'hello' | git hash-object --stdin -w 手动创建一个 blob 对象，理解 Git 底层是如何通过哈希来存储和寻址数据的"], duration: "1.5小时", resources: [R_GIT_SCM, { title: "Git 内部原理 - 对象", url: "https://git-scm.com/book/zh/v2/Git-%E5%86%85%E9%83%A8%E5%8E%9F%E7%90%86-Git-%E5%AF%B9%E8%B1%A1", required: true }, { title: "Git Internals PDF by Scott Chacon", url: "https://github.com/pluralsight/git-internals-pdf", required: false },  { title: "git-vuln-model - Git安全漏洞模型", url: "https://github.com/so-called-pentesters/git-vuln-model", required: false, type: "repo", source: "github" }], checkpoint: "能解释 commit/tree/blob 三类对象的关系，并在 .git 中找到它们" },
      { day: 3, title: "分支创建、切换与合并", content: ["分支是 Git 最强大的功能之一，它本质上只是一个指向某次提交的轻量级指针。git checkout -b 命令会创建一个新分支并立即切换过去，让你在不影响主线（main）的情况下独立开发新功能或修复 bug", "在新分支上进行开发和提交，用 git log --graph --oneline 命令可以直观地看到分支的分叉和合并历史，理解 Git 的提交图结构", "开发完成后用 git merge 命令把分支合并回主线。如果两个分支修改了同一个文件的同一行，Git 无法自动合并，就会产生冲突，需要你手动决定保留哪些内容", "冲突解决的方法是：打开冲突文件，找到被 <<< 和 >>> 包裹的冲突标记，编辑保留正确的内容并删除所有标记，然后 git add 标记为已解决并提交"], duration: "2小时", resources: [R_GIT_BRANCHING, R_GIT_SCM, B_GIT_TUTORIAL, { title: "Atlassian Git 分支教程", url: "https://www.atlassian.com/git/tutorials/using-branches", required: false },  { title: "git-flight-rules - Git故障排除指南", url: "https://github.com/k88hudson/git-flight-rules", required: false, type: "repo", source: "github" }], checkpoint: "能手动制造冲突并成功合并，git log 看到合并图" },
      { day: 4, title: "远程仓库与 push/pull", content: ["远程仓库是托管在服务器上的 Git 仓库副本，最常用的平台是 GitHub。先在 GitHub 上创建一个空仓库，然后用 git remote add origin 命令把本地仓库和远程仓库关联起来，origin 是远程仓库的默认别名", "git branch -M main 确保本地主分支名为 main（与 GitHub 默认一致），git push -u origin main 把本地的 main 分支推送到远程，-u 参数会建立上游跟踪关系，以后直接 git push 就行", "在 GitHub 网页上直接编辑 README.md 文件模拟'别人改了代码'的场景，然后用 git pull origin main 把远程的修改拉取到本地并自动合并，理解团队协作的基本流程", "git fetch origin 只下载远程的新提交但不合并，git pull 则是 fetch + merge 的组合。用 git remote -v 可以查看所有远程仓库的地址，理解 fetch 和 pull 的区别能避免很多协作中的困惑"], duration: "2小时", resources: [R_GIT_SCM, { title: "GitHub Docs: 连接到 GitHub", url: "https://docs.github.com/cn/get-started/getting-started-with-git/set-up-git", required: true }, { title: "Atlassian Git 远程仓库教程", url: "https://www.atlassian.com/git/tutorials/syncing", required: false },  { title: "git-remote-manager - Git远程仓库管理工具", url: "https://github.com/kimsangyeob/git-remote-manager", required: false, type: "repo", source: "github" }], checkpoint: "本地提交能成功推送到 GitHub，且能把远程修改 pull 回本地" },
      { day: 5, title: "Fork / 分支 / PR 流程", content: ["给开源项目贡献代码的标准流程是：先 Fork 把项目克隆到自己的 GitHub 账号下，然后在本地开发，最后发 Pull Request（PR）请求原作者把你的修改合并进去", "Fork 之后用 git clone 把自己账号下的仓库克隆到本地，再用 git remote add upstream 添加原始仓库作为上游远程，这样可以通过 git fetch upstream 保持与原项目的同步", "在本地创建 feature 分支进行开发，开发完成并测试通过后，push 到自己 fork 的远程仓库（origin），注意不要直接推到 main 分支", "在 GitHub 上点 New Pull Request 按钮，选择从你的 feature 分支合并到原项目的 main 分支，PR 描述要写清楚改了什么、为什么改、怎么测试的，然后请求原作者 review"], duration: "2小时", resources: [R_GIT_BRANCHING, R_GIT_SCM, B_GIT_TUTORIAL, { title: "GitHub Docs: Fork 项目", url: "https://docs.github.com/cn/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo", required: true }, { title: "如何为开源项目做贡献（中文指南）", url: "https://opensource.guide/zh-hans/how-to-contribute/", required: false },  { title: "first-contributions - 开源第一次贡献教程", url: "https://github.com/firstcontributions/first-contributions", required: false, type: "repo", source: "github" }], checkpoint: "能在自己的 GitHub 上发出人生第一个 Pull Request" },
      { day: 6, title: "rebase 与交互式整理历史", content: ["git rebase main 命令可以把 feature 分支上的提交'搬移'到 main 分支的最新提交之后，使提交历史变成一条直线，看起来更整洁。它的原理是逐个取出你的提交，在目标位置重新应用", "git rebase -i HEAD~3 会打开交互式界面，让你对最近 3 条提交进行操作：pick 保留、squash 合并到上一条、fixup 合并且丢弃提交信息、edit 暂停以便修改内容，这是整理提交历史的核心技能", "在 rebase 过程中可能会遇到冲突，解决方法是编辑文件、git add 标记已解决、然后 git rebase --continue 继续；如果想放弃可以用 git rebase --abort 回到 rebase 前的状态", "rebase 和 merge 的选择原则：本地未推送的提交用 rebase 保持历史整洁；已经推送到远程且别人基于它工作的提交用 merge 避免改写历史造成混乱。记住'不要 rebase 已经推送的公共提交'"], duration: "2小时", resources: [R_GIT_SCM, R_GIT_BRANCHING, { title: "Atlassian Git rebase 教程", url: "https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase", required: false }], checkpoint: "能用 rebase 把多条 commit 合并成一条整洁历史" },
      { day: 7, title: "git diff / stash / reset / checkout", content: ["git diff 命令可以对比不同区域之间的差异：不加参数对比工作区和暂存区，--cached 对比暂存区和最新提交，HEAD 对比工作区和最新提交，这是理解 Git 三层结构（工作区、暂存区、仓库）的关键", "git stash 命令可以把当前未提交的修改临时保存起来，让你能干净地切换到其他分支处理紧急事务。git stash push -m 'wip' 保存并命名，git stash list 查看列表，git stash pop 恢复最近一次并删除记录", "git reset 是撤销提交的核心命令：--soft 只撤销提交保留暂存区和工作区（适合重新提交），--mixed 撤销提交和暂存区保留工作区（默认模式），--hard 全部丢弃回到指定提交状态（危险操作）", "git checkout -- file 可以丢弃工作区中某个文件的修改（恢复到暂存区状态），git clean -fd 可以删除所有未被 Git 跟踪的文件和目录，这两个都是不可逆操作，使用前要确认"], duration: "1.5小时", resources: [R_GIT_BRANCHING, R_GIT_SCM, { title: "Oh My Git! 游戏化学 Git", url: "https://ohmygit.org/", required: false }], checkpoint: "能解释 soft/mixed/hard 三种 reset 的区别并各用一次" },
      { day: 8, title: "标签 tag 与发布 Release", content: ["Git 标签（tag）是用来给某个提交打上永久标记的功能，通常用于标记版本发布点。git tag -a v0.1.0 -m '第一次公开发布' 创建一个带注释的附注标签，git push origin v0.1.0 把标签推送到远程", "git tag -l 命令列出仓库中所有的标签，git checkout v0.1.0 可以切到该标签对应的提交快照，这在需要回退到某个发布版本时非常有用", "GitHub Releases 是基于 Git 标签的发布管理功能，可以在 Releases 页面上传编译好的二进制包、Python wheel 文件等，并附上详细的 Changelog 说明每次发布的变更内容", "语义化版本（SemVer）是版本号的行业标准约定：MAJOR 版本号表示不兼容的 API 变更，MINOR 版本号表示新增向下兼容的功能，PATCH 版本号表示向下兼容的问题修复"], duration: "1.5小时", resources: [{ title: "语义化版本 2.0", url: "https://semver.org/lang/zh-CN/", required: true }, { title: "Git 官方文档: Git 基础 - 打标签", url: "https://git-scm.com/book/zh/v2/Git-%E5%9F%BA%E7%A1%80-%E6%89%93%E6%A0%87%E7%AD%BE", required: true }, { title: "GitHub Docs: 管理发布版本", url: "https://docs.github.com/cn/repositories/releasing-projects-on-github/managing-releases-in-a-repository", required: false }], checkpoint: "能为项目打一个带说明的 tag，并在 GitHub 创建 Release 页面" },
      { day: 9, title: "Code Review 实战（在 PR 上）", content: ["打开自己之前创建的 PR，在 GitHub 的 Files changed 页面点击代码行左侧的 + 号可以添加 inline comment（行内评论），这是 Code Review 中最常用的反馈方式，能让讨论精确到具体代码", "切换到 reviewer 角色：在 PR 页面点 Start a review，对代码提出改进建议后选择 Request changes（要求修改），等对方修改后再重新审查并 Approve（批准），体验完整的评审流程", "作为 PR 作者，收到 review 意见后在本地修改代码，git add + git commit + git push origin my-feature，PR 会自动更新显示新的提交，reviewer 可以继续审查", "GitHub 提供三种合并 PR 的方式：Squash and merge 把所有提交压缩成一条（适合小功能），Merge commit 保留所有提交和分支历史（适合大功能），Rebase and merge 把提交逐个放到目标分支顶端（保持线性历史）"], duration: "2小时", resources: [{ title: "GitHub Docs: Reviewing changes", url: "https://docs.github.com/cn/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests", required: true }, { title: "Google Engineering Practices: Code Review", url: "https://google.github.io/eng-practices/review/reviewer/", required: false }, { title: "GitHub Docs: 关于 Pull Request 合并", url: "https://docs.github.com/cn/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges", required: false },  { title: "awesome-code-review - Code Review资源列表", url: "https://github.com/jakoch/awesome-code-review", required: false, type: "repo", source: "github" }], checkpoint: "有一个自己被 review 过并合并的 PR，记录 review→修复→合并 的完整流程" },
      { day: 10, title: ".gitignore 与大文件策略", content: [".gitignore 文件告诉 Git 哪些文件或目录应该被忽略不纳入版本控制。常见的忽略项包括：__pycache__/（Python 缓存）、*.pyc（编译文件）、.vscode/（编辑器配置）、*.log（日志文件）、data/（数据目录）", "用 echo 'data/' >> .gitignore 把忽略规则追加到文件中，git check-ignore data/foo.txt 可以检查某个文件是否被忽略规则匹配，调试规则时非常有用", "如果不小心把大文件提交到了 Git 历史中，git rm --cached data/big.bin 可以从暂存区移除（不删除本地文件），然后写入 .gitignore 防止再次提交。但注意这个文件仍然存在于历史记录中", "Git LFS（Large File Storage）是处理大文件的扩展方案，它把大文件存储在单独的服务器上，Git 仓库中只保存一个轻量级的指针文件，适合管理训练数据、模型权重、图片等二进制大文件"], duration: "1.5小时", resources: [{ title: "gitignore 模板", url: "https://github.com/github/gitignore", required: true }, { title: "Git 官方文档: 忽略文件", url: "https://git-scm.com/book/zh/v2/Git-%E5%9F%BA%E7%A1%80-%E8%AE%B0%E5%BD%95%E6%9B%B4%E6%96%B0%E5%88%B0%E4%BB%93%E5%BA%93", required: false }, { title: "Git LFS 官方文档", url: "https://git-lfs.com/", required: false },  { title: "gitignore - GitIgnore项目集合", url: "https://github.com/github/gitignore", required: false, type: "repo", source: "github" }], checkpoint: "项目中不会再出现被意外 commit 的 .pyc / 训练数据 / 日志" },
      { day: 11, title: "子模块 submodule 与大型仓库", content: ["Git submodule（子模块）允许你把一个 Git 仓库作为另一个仓库的子目录，用 git submodule add https://github.com/xxx/yyy third_party/yyy 命令添加，它会在 .gitmodules 文件中记录映射关系", "克隆包含子模块的仓库时，默认不会自动下载子模块内容。需要用 git clone --recurse-submodules 命令一次性克隆主仓库和所有子模块，或者先 clone 再 git submodule init + git submodule update", "当子模块的上游有更新时，进入子模块目录拉取最新代码，回到主仓库后 git add 子模块路径提交新的指针。git submodule update --init --recursive 可以递归更新所有嵌套子模块", "选择 monorepo（所有代码在一个仓库）还是 submodule（拆分成多个仓库）取决于项目规模：小团队、紧密耦合的代码适合 monorepo；大团队、需要独立版本管理的组件适合 submodule"], duration: "1.5小时", resources: [R_GIT_SCM, { title: "Git 官方文档: 子模块", url: "https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E5%AD%90%E6%A8%A1%E5%9D%97", required: true }, { title: "Atlassian Git submodule 教程", url: "https://www.atlassian.com/git/tutorials/git-submodule", required: false },  { title: "git-analyze - Git分析工具", url: "https://github.com/vasani-arpit/git-analyze", required: false, type: "repo", source: "github" }], checkpoint: "能把一个第三方代码以 submodule 形式引入自己的项目" },
      { day: 12, title: "bisect 定位引入 Bug 的提交", content: ["git bisect 是 Git 内置的二分查找调试工具，可以在大量提交中快速定位引入 bug 的那次提交。先创建一个含 bug 的小仓库，在中间某次提交故意引入 bug 作为练习素材", "使用 git bisect start 启动二分查找，git bisect bad HEAD 标记当前提交有 bug，git bisect good <早期SHA> 标记一个确认正常的提交，Git 会自动检出中间的提交让你测试", "更强大的方式是脚本化检测：git bisect run python -c 'import sys; sys.exit(0 if 测试通过 else 1)'，Git 会自动运行脚本、标记结果、检出下一个待测提交，全程无需人工干预", "找到引入 bug 的具体提交后，用 git bisect reset 退出 bisect 状态回到原来的分支。这个工具在有上百个提交的项目中特别有用，理论上只需要测试 log2(n) 次就能定位问题"], duration: "2小时", resources: [R_GIT_BRANCHING, R_GIT_SCM, { title: "Git 官方文档: git bisect", url: "https://git-scm.com/docs/git-bisect", required: true }], checkpoint: "能用 git bisect 自动定位到引入 bug 的那次提交" },
      { day: 13, title: "GitHub Actions CI 初体验", content: ["GitHub Actions 是 GitHub 提供的持续集成/持续部署（CI/CD）平台，可以在每次 push 或 PR 时自动运行测试、构建、部署等任务。在项目根目录创建 .github/workflows/ci.yml 配置文件，定义触发条件（on: push）和运行环境（runs-on: ubuntu-latest）", "在 ci.yml 中定义 jobs（作业），每个 job 包含多个 steps（步骤）：先用 actions/checkout 检出代码，再用 actions/setup-python 配置 Python 环境，然后 pip install 安装依赖，最后运行 pytest 执行测试", "把 ci.yml 推送到 GitHub 后，在仓库的 Actions 页面可以看到工作流的运行记录，绿色勾表示所有测试通过，红色叉表示有失败，点击可以查看详细的日志输出定位问题", "在 README.md 中添加 CI 状态徽章（badge），格式如 ![CI](https://github.com/用户名/仓库名/actions/workflows/ci.yml/badge.svg)，这样任何人打开项目就能看到当前的 CI 状态"], duration: "2.5小时", resources: [{ title: "GitHub Actions 快速入门", url: "https://docs.github.com/cn/actions/quickstart", required: true }, { title: "GitHub Actions 官方文档", url: "https://docs.github.com/cn/actions", required: false }, { title: "GitHub Actions Marketplace", url: "https://github.com/marketplace?type=actions", required: false },  { title: "awesome-actions - Action资源列表", url: "https://github.com/SDCarrow/awesome-actions", required: false, type: "repo", source: "github" }], checkpoint: "在 GitHub Actions 上看到自己项目的第一条绿勾 CI 记录" },
      { day: 14, title: "综合：从零到 PR 的完整协作循环", content: ["创建一个完整的新项目：编写 README.md 说明项目用途和使用方法，创建 requirements.txt 列出 Python 依赖，建立 src/main.py 作为主模块，创建 tests/ 目录准备测试代码", "从 main 分支创建 feature 分支，在上面编写一个功能函数和对应的单元测试。commit 信息要遵循规范：第一行简短描述（50字以内），空一行后详细说明改了什么、为什么改", "把 feature 分支推送到 GitHub，在 GitHub 上创建 Pull Request，写清楚 PR 的目的和变更内容，邀请一位同学或朋友担任 reviewer，体验完整的协作流程", "收到 review 反馈后在本地修改代码并推送更新，reviewer 确认后合并 PR，如果已经配置了 GitHub Actions CI，合并后会自动触发测试并在 PR 页面显示绿勾"], duration: "3小时", resources: [R_GIT_SCM, R_GIT_BRANCHING, { title: "Conventional Commits 规范", url: "https://www.conventionalcommits.org/zh-hans/v1.0.0/", required: false }, { title: "GitHub Skills: Review Pull Requests", url: "https://skills.github.com/", required: false },  { title: "git-workflow - Git工作流指南", url: "https://github.com/vasani-arpit/git-workflow", required: false, type: "repo", source: "github" }], checkpoint: "项目有 README、有至少一个测试、有一个被 review 并合并的 PR、有一条 CI 绿勾" }],
  },

  // =====================================================
  // Node 3: docker-basic
  // =====================================================
  {
    id: "docker-basic",
    name: "Docker 容器化",
    track: "devops",
    duration: "2周",
    prerequisites: ["linux-basic"],
    status: "locked",
    position: { x: 50, y: 440 },
    description: "镜像构建 / 容器编排 / GPU 容器 / Docker Compose",
    outcomes: ["模型服务容器化部署", "GPU 训练环境隔离"],
    relatedIntel: ["007-docker"],
    relatedTools: ["Docker"],
    relatedTerms: ["docker", "container", "image"],
    dailyTasks: [
      { day: 1, title: "Docker 核心概念与第一条命令", content: ["Docker 解决的核心问题是环境一致性：把代码、运行时、系统库、配置全部打包成一个不可变的镜像（Image），在任何安装了 Docker 的机器上都能以相同方式运行，彻底消除「在我机器上能跑」的困境", "三个核心概念需要区分清楚：镜像（Image）是只读的模板，类似于类的定义；容器（Container）是镜像的运行实例，类似于对象，可以启动、停止、删除；仓库（Registry）是存储和分发镜像的服务，Docker Hub 是最大的公共仓库", "安装 Docker 后第一步是验证：运行 docker run hello-world 会自动下载测试镜像并运行，看到欢迎信息说明安装成功。docker ps 查看当前运行的容器，docker images 查看本地已下载的镜像", "docker run 是最常用的命令，-it 参数让容器进入交互模式（分配伪终端），--rm 参数让容器退出后自动删除（适合临时测试）。不加 --rm 的容器退出后仍然存在，可以用 docker start 重新启动"], duration: "2小时", resources: [R_DOCKER_START, { title: "Docker 官方教程", url: "https://docs.docker.com/get-started/", required: true }, { title: "Docker 从入门到实践", url: "https://yeasy.gitbook.io/docker_practice/", required: false }], checkpoint: "能在本机跑通 hello-world 容器，并能列出镜像与容器" },
      { day: 2, title: "编写第一个 Dockerfile", content: ["Dockerfile 是构建镜像的蓝图，由一系列指令组成，每条指令都会在镜像中创建一个新的层（layer）。FROM 指定基础镜像，WORKDIR 设置后续命令的工作目录，COPY 复制文件，RUN 执行命令", "利用 Docker 的层缓存机制可以大幅加速构建：把不常变的指令（如安装依赖）放在前面，常变的指令（如复制源代码）放在后面。这样修改代码后重新构建时，依赖安装层会直接使用缓存", "docker build 命令根据 Dockerfile 构建镜像，-t 参数给镜像起名字和标签（如 myapp:v1），. 表示使用当前目录作为构建上下文（context）", "构建完成后用 docker run 运行镜像验证。如果构建失败，可以通过 docker build 的输出定位是哪一步出错。建议每写几条指令就构建测试一次，避免错误累积"], duration: "2小时", resources: [R_DOCKER_BUILD, { title: "Dockerfile 最佳实践", url: "https://docs.docker.com/develop/develop-images/dockerfile_best-practices/", required: true }, { title: "Docker 构建缓存详解", url: "https://docs.docker.com/build/cache/", required: false },  { title: "docker-exercises - Docker练习题", url: "https://github.com/vasani-arpit/docker-exercises", required: false, type: "repo", source: "github" }], checkpoint: "能从零写一个含依赖安装的 Dockerfile，build 并成功 run" },
      { day: 3, title: "端口映射与长时服务", content: ["容器默认是隔离的网络环境，外部无法直接访问容器内的服务。-p 参数做端口映射，将宿主机的端口绑定到容器的端口，格式为 -p 宿主机端口:容器端口", "长时服务（如 Web API）需要用 -d 参数让容器在后台运行。FastAPI 是 Python 的高性能 Web 框架，uvicorn 是 ASGI 服务器，两者配合可以快速搭建 HTTP 服务", "docker logs 命令查看容器的日志输出，-f 参数可以实时追踪新日志（类似 tail -f）。docker stop 优雅停止容器（发送 SIGTERM），docker kill 强制杀死容器", "curl 命令测试 HTTP 服务是否正常响应。如果访问失败，检查：容器是否在运行（docker ps）、端口映射是否正确、服务是否监听了 0.0.0.0 而非仅 localhost"], duration: "2小时", resources: [R_FASTAPI, { title: "Docker 网络与端口映射", url: "https://docs.docker.com/network/", required: true }, { title: "FastAPI 部署指南", url: "https://fastapi.tiangolo.com/deployment/", required: false },  { title: "docker-networking - Docker网络教程", url: "https://github.com/vasani-arpit/docker-networking", required: false, type: "repo", source: "github" }], checkpoint: "能在容器内启动一个 HTTP 服务并能从本机 curl 访问" },
      { day: 4, title: "挂载卷 volume 与持久化", content: ["容器默认使用临时文件系统，容器删除后数据会丢失。对于需要持久化的数据（如训练日志、模型权重、数据库文件），必须使用卷（Volume）或绑定挂载（Bind Mount）", "绑定挂载用 -v 宿主机路径:容器路径 将宿主机目录映射到容器内，容器对该目录的读写会直接反映到宿主机。这是最常用的持久化方式，适合开发环境", "Docker 管理的卷（named volume）用 docker volume create 创建，数据存储在 Docker 管理的目录中，更适合生产环境因为不依赖宿主机目录结构", "在机器学习场景中，训练数据、日志输出、模型 checkpoint 都应该放在挂载卷中，这样即使容器被删除，重要数据也不会丢失"], duration: "1.5小时", resources: [R_DOCKER_START, { title: "Docker 存储详解", url: "https://docs.docker.com/storage/", required: true },  { title: "docker-volume-tutorial - Docker卷教程", url: "https://github.com/vasani-arpit/docker-volume-tutorial", required: false, type: "repo", source: "github" }], checkpoint: "能在容器中读写宿主机目录中的数据文件" },
      { day: 5, title: "多阶段构建缩小镜像", content: ["多阶段构建（multi-stage build）是在一个 Dockerfile 中使用多个 FROM 指令，前面的阶段用于编译构建，最后的阶段只复制编译产物。这样最终镜像不包含编译工具链，体积大幅缩小", "典型模式：第一阶段用完整镜像（如 python:3.10）安装编译依赖、构建 wheel 包；第二阶段用 slim 镜像（如 python:3.10-slim）只安装预编译的 wheel。对比两种方式的镜像大小差异", "减少攻击面：最终镜像中不包含 gcc、make 等编译工具，减少了潜在的安全漏洞。生产环境的镜像应该尽可能精简，只包含运行时必需的组件", "docker images 命令对比不同构建方式的镜像大小。对于 Python 项目，从 python:3.10 换成 python:3.10-slim 就能减少约 50% 的体积"], duration: "2小时", resources: [R_DOCKER_BUILD, { title: "多阶段构建文档", url: "https://docs.docker.com/build/building/multi-stage/", required: true }, { title: "Docker 镜像瘦身技巧", url: "https://www.docker.com/blog/containerize-your-python-developer-environment-part-2/", required: false },  { title: "docker-slim - 镜像瘦身工具", url: "https://github.com/docker-slim/docker-slim", required: false, type: "repo", source: "github" }], checkpoint: "两阶段构建出的镜像比单阶段显著更小（可量化）" },
      { day: 6, title: "Docker Compose 多容器编排", content: ["实际应用通常需要多个服务协作（如 Web 服务 + 数据库 + 缓存）。Docker Compose 用一个 YAML 文件定义和管理多容器应用，一条命令就能启动所有服务", "docker-compose.yml 定义 services（服务列表）、networks（网络）、volumes（存储）。每个 service 指定镜像、端口、环境变量、依赖关系等", "服务之间可以通过服务名互相访问（如 redis://redis:6379），Docker Compose 会自动创建网络并配置 DNS 解析。这比手动管理容器 IP 方便得多", "docker compose up -d 启动所有服务，logs -f 实时查看日志，down 停止并删除所有容器。开发时可以只启动需要的服务（如 docker compose up -d redis）"], duration: "2小时", resources: [{ title: "Compose 入门", url: "https://docs.docker.com/compose/gettingstarted/", required: true }, { title: "Compose 文件参考", url: "https://docs.docker.com/compose/compose-file/", required: false }, { title: "Compose 实战示例", url: "https://docs.docker.com/samples/", required: false }], checkpoint: "能用 compose 启动 2 个互相通信的容器并看到效果" },
      { day: 7, title: "环境变量、.env 与健康检查", content: ["环境变量是配置容器化应用的标准方式，避免将配置硬编码在镜像中。compose 文件中用 environment 字段设置，或用 env_file 指向 .env 文件", ".env 文件存放敏感配置（如数据库密码、API Key），应该加入 .gitignore 避免提交到版本控制。compose 启动时会自动读取同目录下的 .env 文件", "HEALTHCHECK 指令告诉 Docker 如何检测容器是否健康。例如每 30 秒检查一次 HTTP 端口是否响应，失败 3 次后标记为 unhealthy。docker ps 可以看到容器的健康状态", "健康检查配合容器编排工具（如 Docker Swarm、Kubernetes）可以实现自动重启不健康的容器，提高服务可用性"], duration: "1.5小时", resources: [R_DOCKER_BUILD, { title: "Docker 环境变量", url: "https://docs.docker.com/compose/environment-variables/", required: true }, { title: "Docker 健康检查", url: "https://docs.docker.com/engine/reference/builder/#healthcheck", required: false },  { title: "docker-healthcheck - 健康检查示例", url: "https://github.com/vasani-arpit/docker-healthcheck", required: false, type: "repo", source: "github" }], checkpoint: "容器能读取外部 env，并在 docker ps 中显示 healthy" },
      { day: 8, title: "nvidia-docker 与 GPU 容器", content: ["默认情况下容器无法访问宿主机的 GPU。需要安装 nvidia-container-toolkit，它是一个 Docker 运行时插件，让容器可以使用宿主机的 NVIDIA GPU 驱动和 CUDA 库", "安装完成后重启 Docker 服务，使用 nvidia/cuda 官方基础镜像测试。在容器内运行 nvidia-smi 应该能看到宿主机的 GPU 信息，说明 GPU 透传成功", "PyTorch 官方提供了预构建的 GPU 镜像（如 pytorch/pytorch:2.1.2-cuda12.1-cudnn8-runtime），包含完整的 CUDA 和 cuDNN 环境，开箱即用", "验证 GPU 可用：在容器内运行 python -c 'import torch; print(torch.cuda.is_available())' 应该返回 True。如果返回 False，检查驱动版本、CUDA 版本和镜像版本是否匹配"], duration: "2.5小时", resources: [{ title: "NVIDIA Container Toolkit", url: "https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html", required: true }, { title: "NVIDIA GPU Docker 镜像", url: "https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch", required: false }, { title: "GPU 容器故障排查", url: "https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/troubleshooting.html", required: false },  { title: "nvidia-docker-tutorial - GPU容器教程", url: "https://github.com/vasani-arpit/nvidia-docker-tutorial", required: false, type: "repo", source: "github" }], checkpoint: "能在 GPU 容器中跑出 True，说明 CUDA 可访问" },
      { day: 9, title: "构建 ML 训练镜像", content: ["机器学习训练镜像需要包含：Python 环境、深度学习框架（PyTorch）、CUDA 工具包、项目依赖、训练代码和数据加载脚本。基于官方 PyTorch 镜像可以省去复杂的 CUDA 安装", "Dockerfile 结构：FROM 选择带 CUDA 的基础镜像 → WORKDIR 设置工作目录 → COPY requirements.txt 并 pip install（利用缓存）→ COPY 项目代码 → 设置启动命令", "运行时用 --gpus all 让容器使用所有 GPU，-v 挂载数据目录和输出目录。训练脚本可以通过命令行参数覆盖默认配置", "调试技巧：用 docker run --gpus all -it --rm 镜像名 bash 进入容器的交互式 shell，手动运行命令排查问题。确认环境正确后再固化到 Dockerfile 中"], duration: "2.5小时", resources: [R_DOCKER_BUILD, R_PYTORCH_DOC, { title: "PyTorch Docker 镜像", url: "https://hub.docker.com/r/pytorch/pytorch", required: true }, { title: "ML 项目 Docker 化最佳实践", url: "https://docs.docker.com/build/building/packaging-ml-model/", required: false },  { title: "ml-docker-examples - ML Docker示例", url: "https://github.com/stasbe/ml-docker-examples", required: false, type: "repo", source: "github" }], checkpoint: "能把自己的 PyTorch 训练脚本封装成镜像并在 GPU 容器中跑起来" },
      { day: 10, title: "私有仓库与镜像推送", content: ["构建好的镜像需要推送到镜像仓库才能在其他机器上使用。Docker Hub 是最大的公共仓库，GitHub Container Registry（ghcr.io）与 GitHub 生态集成更好，Harbor 适合企业自建私有仓库", "docker tag 命令给镜像打标签，格式为 docker tag 本地镜像 仓库地址/用户名/镜像名:标签。docker login 登录仓库，docker push 推送镜像", "在另一台机器上用 docker pull 拉取镜像，然后 docker run 运行。这就是容器化部署的核心流程：构建一次，到处运行", "安全建议：不要在镜像中硬编码密钥或密码，使用环境变量或挂载配置文件传入敏感信息。定期更新基础镜像以修复安全漏洞"], duration: "1.5小时", resources: [R_DOCKER_START, { title: "Docker Hub 快速入门", url: "https://docs.docker.com/docker-hub/quickstart/", required: true }, { title: "GitHub Container Registry", url: "https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry", required: false }, { title: "Harbor 私有仓库", url: "https://goharbor.io/docs/", required: false }], checkpoint: "能把本地构建的镜像 push 到远程仓库并从别处 pull 下来" },
      { day: 11, title: "容器网络与多容器通信", content: ["Docker 有三种网络模式：bridge（默认，容器有独立 IP，通过端口映射对外）、host（容器直接使用宿主机网络，性能最好但失去隔离性）、none（无网络，适合纯计算任务）", "默认的 bridge 网络中，容器之间无法通过容器名通信，需要手动创建自定义网络。docker network create 创建自定义网络后，同一网络中的容器可以互相通过服务名访问", "在 Compose 中定义 networks 让服务加入自定义网络。服务之间用服务名作为主机名通信（如 redis:6379），Docker 内置的 DNS 会自动解析", "网络隔离是安全的重要手段：前端服务和数据库应该在不同网络中，只通过必要端口通信。用 docker network inspect 查看网络详情"], duration: "1.5小时", resources: [R_DOCKER_START, { title: "Docker 网络详解", url: "https://docs.docker.com/network/drivers/", required: true }, { title: "Docker 网络教程", url: "https://docs.docker.com/network/network-tutorial-standalone/", required: false },  { title: "docker-networking-exercises - 网络练习", url: "https://github.com/vasani-arpit/docker-networking-exercises", required: false, type: "repo", source: "github" }], checkpoint: "能在一个 compose 中让两个容器通过服务名而不是 IP 通信" },
      { day: 12, title: "安全：非 root 用户与权限", content: ["容器默认以 root 用户运行，这是一个安全隐患：如果容器被攻破，攻击者将获得宿主机的 root 权限。最佳实践是在 Dockerfile 中创建专用的非 root 用户", "USER 指令切换运行用户，COPY --chown 指定文件所有者。例如：RUN useradd -m -u 1000 appuser 创建用户，USER appuser 切换到该用户", "docker exec -it 容器 id 命令可以查看容器内进程的用户身份。如果以 root 运行，输出的 uid 为 0", "权限问题排查：如果非 root 用户无法写入挂载目录，需要确保宿主机目录权限允许该用户写入。可以用 docker -u 参数在运行时覆盖用户"], duration: "1.5小时", resources: [R_DOCKER_BUILD, { title: "Docker 安全最佳实践", url: "https://docs.docker.com/develop/security-best-practices/", required: true }, { title: "容器安全扫描", url: "https://docs.docker.com/build/building/security-scanning/", required: false },  { title: "docker-security - Docker安全示例", url: "https://github.com/vasani-arpit/docker-security", required: false, type: "repo", source: "github" }], checkpoint: "容器内进程以非 root 用户运行，并且写回宿主机目录的文件权限正常" },
      { day: 13, title: "CI/CD 构建镜像与 Actions", content: ["GitHub Actions 可以自动化构建和推送 Docker 镜像。当代码推送到特定分支或打标签时，自动触发构建流程，确保镜像与代码同步更新", "工作流文件定义触发条件（on push tags v*）、运行环境（runs-on ubuntu-latest）和构建步骤：checkout 代码 → 登录镜像仓库 → 构建并推送镜像", "docker/metadata-action 可以自动生成镜像标签（如根据 Git tag 生成版本号），避免手动管理标签。docker/build-push-action 执行构建和推送", "构建完成后可以在 GitHub 的 Actions 页面查看构建日志。成功的构建会显示绿色勾，失败的会显示红色叉并附带错误信息"], duration: "2.5小时", resources: [{ title: "Docker Build Push Action", url: "https://github.com/marketplace/actions/build-and-push-docker-images", required: true }, { title: "GitHub Actions Docker 教程", url: "https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-python", required: false },  { title: "docker-ci - Docker CI模板", url: "https://github.com/vasani-arpit/docker-ci", required: false, type: "repo", source: "github" }], checkpoint: "在 GitHub Actions 中自动 build 镜像并 push 到 ghcr.io" },
      { day: 14, title: "综合：模型推理服务端到端容器化", content: ["本练习将串联前 13 天所学：编写推理服务 → 容器化 → 多容器编排 → 推送仓库 → 部署运行。这是机器学习工程师的核心技能之一", "首先用 FastAPI 编写推理 API：POST /predict 接收图片，返回分类结果和置信度。使用 torchvision 预训练模型或自己训练的 YOLOv8 检测模型", "编写 Dockerfile 封装推理服务，用 docker-compose.yml 定义服务配置（端口、环境变量、健康检查）。确保镜像尽可能精简", "将镜像推送到 ghcr.io，在另一台干净的机器上 docker compose up -d 一键启动服务，用 curl 测试 API 确认可用。记录部署流程到 README"], duration: "3小时", resources: [R_FASTAPI, R_DOCKER_BUILD, R_ULTRALYTICS, { title: "FastAPI 容器化部署", url: "https://fastapi.tiangolo.com/deployment/docker/", required: true }], checkpoint: "一条 docker compose up -d 即可在任意机器启动推理 API 并可用 curl 调用" }],
  },

  // =====================================================
  // Node 4: math-linear-algebra
  // =====================================================
  {
    id: "math-linear-algebra",
    name: "线性代数",
    track: "math",
    duration: "2周",
    prerequisites: [],
    status: "available",
    position: { x: 260, y: 0 },
    description: "向量空间、矩阵运算、特征值、SVD——用 NumPy/PyTorch 实战理解",
    outcomes: ["能在代码中理解权重矩阵的维度意义", "能推导反向传播的矩阵形式"],
    relatedIntel: ["010-numpy-pandas"],
    relatedTools: [],
    relatedTerms: ["matrix", "vector", "eigenvalue", "tensor"],
    dailyTasks: [
      { day: 1, title: "向量与基本运算", content: ["向量是线性代数最基本的元素，可以理解为空间中的一个有方向的箭头。在 NumPy 中，向量用一维数组表示，可以用 np.array() 创建。向量的逐元素加法和乘法对应位置上的运算，而点积（内积）np.dot(a,b) 则是对应元素相乘再求和，它衡量两个向量的相似程度和投影关系。", "向量的范数（Norm）衡量向量的长度：L2 范数（欧几里得范数）是最常用的，等于各分量平方和开根号；L1 范数是各分量绝对值之和。单位向量是范数为 1 的向量，通过将向量除以自身范数得到，它只保留方向信息。", "两个向量之间的夹角可以通过点积公式计算：cosθ = a·b / (|a||b|)。当点积为 0 时两向量垂直（正交），这个正交概念在后续的特征分解和 PCA 中至关重要。"], duration: "1.5小时", resources: [R_NUMPY, R_3B1B_LIN, { title: "Khan Academy: 向量介绍", url: "https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces/vectors/v/vector-introduction-linear-algebra", required: false }, { title: "MIT OCW 18.06 线性代数", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/", required: false }], checkpoint: "能做向量加法、点积、范数、夹角计算，并解释几何意义" },
      { day: 2, title: "矩阵与矩阵乘法", content: ["矩阵是一个二维数组，形状为 (m, n) 表示 m 行 n 列。矩阵乘法 A @ B 要求 A 的列数等于 B 的行数，结果形状为 (A的行数, B的列数)。矩阵乘法的本质是：结果的第 (i, j) 个元素等于 A 的第 i 行与 B 的第 j 列的点积。", "矩阵转置 A.T 是将行列互换，形状从 (m,n) 变为 (n,m)。当 A @ A.T 时，结果一定是方阵且对称矩阵（沿主对角线对称），这在协方差矩阵等场景中经常出现。", "矩阵乘法不满足交换律，即 AB 不一定等于 BA。这一点与标量乘法完全不同，在实际应用中需要注意矩阵相乘的顺序。矩阵乘法满足结合律 (AB)C = A(BC) 和分配律 A(B+C) = AB + AC。"], duration: "1.5小时", resources: [R_NUMPY, R_3B1B_LIN, { title: "Khan Academy: 矩阵乘法", url: "https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:multiplying-matrices-by-matrices/v/matrix-multiplication-intro", required: false },  { title: "矩阵乘法教程", url: "https://github.com/Matricali/Matrix-Multiplication-Tutorial", required: false, type: "repo", source: "github" }], checkpoint: "能解释 (m,k) @ (k,n) = (m,n) 的维度规则并手算一个 2x2 实例" },
      { day: 3, title: "广播 Broadcasting", content: ["广播（Broadcasting）是 NumPy 中最强大的特性之一，它允许不同形状的数组进行算术运算而无需显式复制数据。广播的核心规则是：从尾部维度开始对齐，如果某个维度大小为 1 则自动扩展到与对方匹配，如果某个维度大小不相等且都不为 1 则报错。", "标量与数组运算时，标量会被自动广播到与数组相同的形状。例如一维数组加标量，标量被复制到每个元素位置。两个不同形状的数组之间也可以广播：形状 (3,1) 的列向量加上形状 (1,4) 的行向量，会扩展为 (3,4) 的矩阵。", "在深度学习中广播无处不在：对图像做通道归一化时，形状为 (H,W,3) 的图像减去形状为 (3,) 的均值向量，广播会将均值扩展到每个像素位置；批量归一化中对 (B,C,H,W) 的张量减去形状为 (C,) 的均值也是同理。理解广播能帮助你避免维度不匹配的常见错误。"], duration: "1.5小时", resources: [R_NUMPY, { title: "NumPy 广播机制详解", url: "https://numpy.org/doc/stable/user/basics.broadcasting.html", required: true }, { title: "Understanding Broadcasting (SciPy Cookbook)", url: "https://scipy-cookbook.readthedocs.io/items/Broadcasting.html", required: false },  { title: "broadcasting-visualization - 广播可视化", url: "https://github.com/MaxWickham/broadcasting-visualization", required: false, type: "repo", source: "github" }], checkpoint: "能预测两个 ndarray 做广播后的形状，并写出一个实际图像归一化的例子" },
      { day: 4, title: "逆矩阵、秩与线性方程组", content: ["线性方程组 Ax = b 是线性代数的核心问题。当 A 是方阵且可逆时，解为 x = A^{-1}b。在 NumPy 中，推荐使用 np.linalg.solve(A, b) 来求解，因为直接求逆矩阵再乘在数值上不够稳定，而 solve 使用了更高效的 LU 分解。", "矩阵的秩（rank）是其线性无关行（或列）的最大数目，反映矩阵所包含的独立信息量。当秩等于行数和列数的较小值时，矩阵是满秩的；当秩小于维度时称为秩亏，此时对应的齐次方程有非零解，非齐次方程可能无解。奇异矩阵就是行列式为零的方阵，它不可逆。", "条件数（condition number）衡量矩阵对输入扰动的敏感程度。条件数越大，矩阵越接近奇异，数值求解时误差越大。条件数趋于无穷意味着矩阵奇异。在实际应用中，条件数过大的矩阵会导致数值不稳定，需要使用正则化等技术处理。"], duration: "1.5小时", resources: [R_NUMPY, { title: "Khan Academy: 逆矩阵", url: "https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:matrix-inverses/v/inverse-matrix-part-1", required: false }, { title: "MIT OCW: 矩阵的秩与零空间", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-6-column-space-and-nullspace/", required: false },  { title: "matrix-inverse-calculator - 矩阵求逆计算器", url: "https://github.com/MaxWickham/matrix-inverse-calculator", required: false, type: "repo", source: "github" }], checkpoint: "能解一个 3×3 线性方程组并判断矩阵是否可逆" },
      { day: 5, title: "特征值与特征向量", content: ["特征值和特征向量描述了线性变换中最本质的方向：对于方阵 A，如果存在非零向量 v 和标量 λ 使得 Av = λv，那么 λ 是特征值，v 是对应的特征向量。几何含义是：矩阵 A 对向量 v 的作用仅仅是缩放，方向不变（或反向）。", "特征分解将矩阵分解为 A = V * diag(λ) * V^{-1}，其中 V 的列是特征向量，λ 是对应的特征值。对于实对称矩阵，特征值都是实数，特征向量相互正交，此时 A = V * diag(λ) * V^T，这就是著名的谱定理。对称矩阵的特征分解在 PCA、协方差矩阵分析中极为重要。", "在 NumPy 中使用 np.linalg.eig() 求一般矩阵的特征值和特征向量，np.linalg.eigh() 专门针对对称矩阵（更高效更稳定）。特征值的大小反映对应方向上变换的强度，这在理解主成分、振动模式、图的谱性质等方面都有核心应用。"], duration: "1.5小时", resources: [R_3B1B_LIN, { title: "Khan Academy: 特征值与特征向量", url: "https://www.khanacademy.org/math/linear-algebra/alternate-bases/eigen-everything/v/linear-algebra-introduction-to-eigenvalues-and-eigenvectors", required: false }, { title: "MIT OCW: 特征值与特征向量", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-21-eigenvalues-and-eigenvectors/", required: false },  { title: "eigenfaces - 特征脸算法实现", url: "https://github.com/MaxWickham/eigenfaces", required: false, type: "repo", source: "github" }], checkpoint: "能数值求出 2×2 对称矩阵的特征分解并验证 Av=λv" },
      { day: 6, title: "矩阵分解：LU 与 QR", content: ["LU 分解将方阵 A 分解为 A = PLU，其中 P 是行置换矩阵，L 是下三角矩阵（对角线为 1），U 是上三角矩阵。LU 分解本质上是高斯消元法的矩阵表示，它使得求解线性方程组 Ax=b 变得高效：先解 Ly = Pb（前向代入），再解 Ux = y（后向代入）。", "QR 分解将矩阵 A 分解为 A = QR，其中 Q 是正交矩阵（列向量两两正交且为单位向量），R 是上三角矩阵。QR 分解在求解最小二乘问题中特别有用：当方程 Ax=b 无精确解时，最小二乘解可以通过 QR 分解高效求得，即 x = R^{-1}Q^Tb，这比正规方程数值上更稳定。", "理解这些分解有助于理解后续的 SVD 以及深度学习中的各种矩阵运算。scipy.linalg 库提供了 lu() 和 qr() 函数，可以方便地进行这些分解并验证结果。"], duration: "1.5小时", resources: [R_NUMPY, { title: "Wikipedia: LU 分解", url: "https://zh.wikipedia.org/wiki/LU%E5%88%86%E8%A7%A3", required: false }, { title: "Wikipedia: QR 分解", url: "https://zh.wikipedia.org/wiki/QR%E5%88%86%E8%A7%A3", required: false }, { title: "MIT OCW: 矩阵分解", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-4-a-ax-b-row-reduced-form-r/", required: false }], checkpoint: "能完成一次 LU 与 QR 分解，并验证其数值正确性" },
      { day: 7, title: "SVD 奇异值分解", content: ["奇异值分解（SVD）是线性代数中最重要的矩阵分解之一，适用于任意形状的矩阵（不一定是方阵）。对于 m×n 矩阵 A，SVD 将其分解为 A = U * Σ * V^T，其中 U 是 m×m 正交矩阵（左奇异向量），Σ 是 m×n 对角矩阵（奇异值按降序排列），V 是 n×n 正交矩阵（右奇异向量）。", "SVD 的几何直觉是：任何线性变换都可以分解为旋转（V^T）→ 缩放（Σ）→ 旋转（U）三步。奇异值衡量了矩阵在对应方向上的拉伸程度，大的奇异值对应矩阵作用最显著的方向。通过只保留前 k 个最大的奇异值及其对应的奇异向量，可以得到矩阵的最佳 k 秩近似（Eckart-Young 定理）。", "SVD 的应用极为广泛：图像压缩、推荐系统中的协同过滤、自然语言处理中的潜在语义分析（LSA）、PCA 的数值实现等。在 NumPy 中用 np.linalg.svd() 可以计算 SVD，full_matrices=False 参数返回紧凑形式，更适合实际应用。"], duration: "2小时", resources: [R_3B1B_LIN, { title: "Wikipedia: 奇异值分解", url: "https://zh.wikipedia.org/wiki/%E5%A5%87%E5%BC%82%E5%80%BC%E5%88%86%E8%A7%A3", required: false }, { title: "MIT OCW: SVD 分解", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-29-singular-value-decomposition/", required: false }], checkpoint: "能对一张灰度图做 SVD 低秩重建，并比较不同 k 的视觉效果" },
      { day: 8, title: "图像 SVD 压缩实战", content: ["将图像视为矩阵后，SVD 压缩的原理很直观：一张 m×n 的灰度图可以看作一个 m×n 的矩阵，对它做 SVD 后取前 k 个奇异值重建，就可以用 U[:,:k] * diag(S[:k]) * Vt[:k,:] 得到近似矩阵。k 越小压缩率越高但图像越模糊，k 越大越接近原图但压缩率越低。", "压缩比的计算公式为：原始存储量 m*n 与压缩后存储量 k*(m+n+1) 的比值。因为只需要存储 U 的前 k 列（m*k）、前 k 个奇异值（k 个数）和 Vt 的前 k 行（k*n），总共 k*(m+n+1) 个数。当 k 远小于 min(m,n) 时，可以实现显著的压缩效果。", "通过观察不同 k 值重建的图像，可以直观理解奇异值衰减的意义：如果前几个奇异值就能捕获图像的主要信息，说明图像具有低秩结构。自然图像通常具有这种特性，因此 SVD 压缩在实际中非常有效。这也是深度学习中低秩近似、模型压缩等技术的理论基础。"], duration: "2小时", resources: [R_NUMPY, { title: "SVD 图像压缩教程 (GeeksforGeeks)", url: "https://www.geeksforgeeks.org/image-compression-using-singular-value-decomposition/", required: false }, { title: "SVD and Image Processing (YouTube)", url: "https://www.youtube.com/watch?v=Cx7ZsM7UOOk", required: false }], checkpoint: "产出 3 张不同 k 值重建的图像，并说明 SVD 与低秩近似的直观意义" },
      { day: 9, title: "主成分分析 PCA", content: ["PCA（主成分分析）是最经典的降维算法，其核心思想是找到数据方差最大的方向作为主成分。数学上，先对数据中心化（减去均值），然后计算协方差矩阵 C = X^T X / (n-1)，再对 C 做特征分解。特征值最大的特征向量就是第一主成分（方差最大的方向），第二大的就是第二主成分，以此类推。", "PCA 的实现步骤：(1) 数据中心化，(2) 计算协方差矩阵，(3) 对协方差矩阵做特征分解，(4) 按特征值大小排序取前 k 个特征向量，(5) 将数据投影到这些特征向量上得到降维后的表示。在 NumPy 中可以用 np.linalg.eigh() 对对称的协方差矩阵做特征分解。", "PCA 与 SVD 的关系：对中心化后的数据矩阵 X 做 SVD 得到的右奇异向量就是 PCA 的主成分方向，奇异值的平方除以 (n-1) 就是对应的特征值。因此 sklearn 的 PCA 实现底层就是用 SVD 来计算的，这样做数值上更稳定。PCA 广泛用于数据可视化、去噪、特征提取等场景。"], duration: "2小时", resources: [{ title: "sklearn PCA", url: "https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html", required: true }, { title: "PCA 的数学原理 (StatQuest)", url: "https://www.youtube.com/watch?v=FgakZw6K1QQ", required: false }, { title: "Wikipedia: 主成分分析", url: "https://zh.wikipedia.org/wiki/%E4%B8%BB%E6%88%90%E5%88%86%E5%88%86%E6%9E%90", required: false }], checkpoint: "能从零实现 PCA 并把 5 维数据投影到 2 维可视化" },
      { day: 10, title: "最小二乘与线性回归的矩阵形式", content: ["线性回归的矩阵形式为 y = Xw + ε，其中 X 是设计矩阵（每行一个样本，每列一个特征），w 是权重向量，ε 是噪声。最小二乘法的目标是最小化残差平方和 ||y - Xw||²，通过令其对 w 的导数为零得到正规方程 X^TXw = X^Ty，因此闭式解为 w = (X^TX)^{-1}X^Ty。", "正规方程中的 (X^TX)^{-1}X^T 称为 X 的伪逆（Moore-Penrose 伪逆），可以用 np.linalg.pinv(X) 直接计算。np.linalg.lstsq() 函数内部使用 SVD 来求解最小二乘问题，比直接求正规方程数值上更稳定，尤其是当 X^TX 接近奇异时。", "理解线性回归的矩阵形式对理解深度学习中的全连接层至关重要：神经网络中的全连接层本质上就是 y = XW + b，训练过程就是通过梯度下降来优化 W 和 b，使得损失函数最小。最小二乘法的闭式解提供了一个不需要迭代的精确解，但在大规模问题中梯度下降更实用。"], duration: "1.5小时", resources: [R_NUMPY, { title: "Khan Academy: 最小二乘法", url: "https://www.khanacademy.org/math/statistics-probability/describing-relationships-quantitative-data/more-on-regression/v/regression-line-example", required: false }, { title: "scipy.linalg.lstsq 文档", url: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.linalg.lstsq.html", required: false }], checkpoint: "能用矩阵形式手动推导并实现一个线性回归，与库函数结果一致" },
      { day: 11, title: "PyTorch 中的张量与矩阵", content: ["PyTorch 的 Tensor 与 NumPy 的 ndarray 非常相似，但有两个关键区别：Tensor 可以在 GPU 上运算以加速大规模矩阵计算，而且 Tensor 支持自动微分（autograd）。创建 Tensor 用 torch.randn()、torch.zeros() 等函数，矩阵乘法同样用 @ 运算符或 torch.matmul()。", "张量的维度操作在深度学习中极为常用：transpose 交换两个维度，permute 可以按任意顺序重排所有维度，view/reshape 改变形状但不改变数据。例如将图像批量 (B,3,H,W) 展平为 (B, 3*H*W) 送入全连接层，就需要用 reshape 或 view。注意 view 要求内存连续，reshape 则更灵活。", "PyTorch 的自动微分机制是其核心能力：设置 requires_grad=True 后，对 Tensor 的所有运算都会被记录在计算图中。调用 .backward() 后，所有叶节点的 .grad 属性会累积梯度值。这是反向传播算法的工程实现，理解它对调试和自定义网络层至关重要。记得在每次迭代前用 .zero_grad() 清除旧梯度。"], duration: "2小时", resources: [R_PYTORCH_DOC, R_PYTORCH_TUT, { title: "PyTorch 张量入门教程", url: "https://pytorch.org/tutorials/beginner/basics/tensorqs_tutorial.html", required: true }], checkpoint: "能在 PyTorch 中做矩阵变形与自动求导" },
      { day: 12, title: "线性变换与神经网络的几何直觉", content: ["神经网络中的每一层都可以看作一个几何变换：线性层 y = Wx + b 先对输入做线性变换（旋转+缩放），然后平移 b。在二维空间中，线性变换会把正方形网格变成平行四边形，把圆形变成椭圆。矩阵 W 的特征值和特征向量决定了变换的主轴方向和缩放比例。", "ReLU 激活函数 max(0, x) 的几何效果是折叠：它将输入空间的一半（负值部分）映射为零，另一半保持不变。在二维空间中，ReLU 将平面沿某条线折叠，产生一个折痕。多个 ReLU 层的叠加可以产生越来越复杂的非线性边界。", "万能逼近定理告诉我们：具有足够多神经元的单隐层网络可以逼近任意连续函数。从几何角度看，每增加一个神经元就增加一个折叠或折痕，多个折痕的组合可以刻画任意复杂的决策边界。这解释了为什么深度学习如此强大——它是大量简单线性变换和非线性折叠的组合。"], duration: "1.5小时", resources: [R_3B1B_LIN, R_D2L, { title: "3Blue1Brown: 神经网络", url: "https://www.3blue1brown.com/lessons/neural-networks", required: false }, { title: "ConvNetJS 2D 可视化", url: "https://cs.stanford.edu/people/karpathy/convnetjs/demo/classify2d.html", required: false }], checkpoint: "能用一张 2D 网格图可视化说明单层线性变换 + ReLU 的几何作用" },
      { day: 13, title: "矩阵微积分：反向传播的数学", content: ["矩阵微积分是深度学习的数学基础。关键概念是链式法则的矩阵形式：如果 L 是标量损失，y = Wx，那么 dL/dW = (dL/dy) * x^T，dL/dx = W^T * (dL/dy)。这与标量的链式法则形式类似，但需要注意矩阵乘法的顺序和转置。", "对于线性回归 L = (1/2)||Xw - y||²，展开后对 w 求导得到 dL/dw = X^T(Xw - y)，即设计矩阵的转置乘以残差向量。令导数为零就得到了正规方程 X^TXw = X^Ty。这个推导过程是理解反向传播的基础——反向传播本质上就是在每一层应用链式法则计算梯度。", "数值梯度检查（gradient checking）是验证解析梯度正确性的重要技术：对每个参数 θ_i，用有限差分 (L(θ_i+ε) - L(θ_i-ε)) / 2ε 近似梯度，然后与解析梯度比较。相对误差应该小于 1e-5 量级。这个技巧在实现自定义网络层时非常有用，可以快速发现梯度计算中的 bug。"], duration: "2小时", resources: [R_D2L, { title: "The Matrix Calculus You Need For Deep Learning", url: "https://explained.ai/matrix-calculus/", required: true }, { title: "Stanford CS231n: 反向传播", url: "http://cs231n.github.io/optimization-2/", required: false }], checkpoint: "能手动推导线性回归 L2 损失对权重 W 的梯度，并数值验证" },
      { day: 14, title: "综合：实现一个两层 MLP 的前向 + 反向传播", content: ["两层 MLP 的完整前向传播过程：输入 X 经过第一层线性变换 Z1 = XW1 + b1，然后通过 ReLU 激活 H = max(0, Z1)，再经过第二层线性变换 Z2 = HW2 + b2，最后通过 Softmax 函数将 logits 转换为概率分布，用交叉熵损失衡量预测与真实标签的差异。", "反向传播按照链式法则从输出到输入逐层计算梯度：首先计算损失对 Z2 的梯度（Softmax + 交叉熵的组合有简洁的形式 dZ2 = P - Y），然后反向传播到 W2 和 b2，再通过 ReLU 的梯度（正值为 1，负值为 0）传播到第一层，最后计算 W1 和 b1 的梯度。每一层的梯度计算都可以用矩阵乘法高效完成。", "实现完成后，务必进行梯度检查来验证反向传播的正确性：将解析梯度与数值梯度逐元素比较，相对误差应小于 1e-5。在二分类玩具数据上训练 200 步后，loss 应该稳定下降，决策边界应该逐渐拟合数据分布。这个练习将两周所学的线性代数知识融会贯通，是从数学到深度学习的关键桥梁。"], duration: "3小时", resources: [R_NUMPY, R_PYTORCH_DOC, R_D2L, { title: "CS231n: 神经网络笔记", url: "http://cs231n.github.io/neural-networks-case-study/", required: true }], checkpoint: "能用纯 NumPy 实现 MLP，并通过梯度检查，loss 稳定下降" }],
  },

  // =====================================================
  // Node 5: math-probability
  // =====================================================
  {
    id: "math-probability",
    name: "概率与统计",
    track: "math",
    duration: "2周",
    prerequisites: [],
    status: "available",
    position: { x: 260, y: 220 },
    description: "分布、贝叶斯、假设检验、信息论——理解不确定性与交叉熵",
    outcomes: ["解释 loss 函数的概率意义", "评估模型的统计显著性"],
    relatedIntel: ["010-numpy-pandas", "017-metrics"],
    relatedTools: [],
    relatedTerms: ["gradient-descent", "loss-function", "learning-rate"],
    dailyTasks: [
      { day: 1, title: "常见分布：均匀、正态、伯努利", content: ["概率分布是描述随机变量取值规律的数学工具。均匀分布（Uniform）每个值等概率出现，正态分布（Normal/Gaussian）呈钟形曲线，伯努利分布（Bernoulli）只有两种结果（0/1），是二分类的基础", "使用 NumPy 的随机数生成器可以模拟各种分布：np.random.uniform(0,1,10000) 生成均匀分布样本，np.random.normal(0,1,10000) 生成标准正态分布样本，np.random.binomial(1,0.7,10000) 生成伯努利分布样本", "直方图是可视化分布最直观的方式：matplotlib 的 plt.hist 函数将数据分成若干区间，统计每个区间内样本的频率。density=True 参数将频率归一化为概率密度，使得直方图面积之和为 1", "通过计算样本均值和方差，可以验证随机数生成的正确性：均匀分布 U(0,1) 的理论均值为 0.5、方差为 1/12；标准正态分布 N(0,1) 的理论均值为 0、方差为 1。样本统计量应该接近理论值"], duration: "1.5小时", resources: [R_NUMPY, { title: "概率分布可视化", url: "https://scipy-lectures.org/packages/statistics/index.html", required: false }, { title: "3Blue1Brown: 贝叶斯定理", url: "https://www.youtube.com/watch?v=HZGCoVF3YvM", required: false }, { title: "Seeing Theory: 概率可视化", url: "https://seeing-theory.brown.edu/", required: false }], checkpoint: "能从均匀/正态/伯努利采样并画出直方图" },
      { day: 2, title: "泊松、指数与 Beta", content: ["泊松分布描述单位时间内随机事件发生的次数（如每小时到达的客户数），参数 λ 既是均值也是方差。指数分布描述事件发生的间隔时间，是泊松过程的连续版本", "Beta 分布是定义在 [0,1] 区间上的连续分布，由两个形状参数 a 和 b 控制。它是伯努利分布的共轭先验，在贝叶斯统计中非常重要。当 a=b=1 时退化为均匀分布", "scipy.stats 模块提供了丰富的分布工具：fit 方法可以用最大似然估计拟合分布参数，pdf/pmf 计算概率密度/质量函数，rvs 生成随机样本", "对数似然函数是统计推断的核心：将似然函数取对数，把连乘变成连乘，求导后更容易求解最大值。这是最大似然估计（MLE）的数学基础"], duration: "1.5小时", resources: [{ title: "scipy.stats 文档", url: "https://docs.scipy.org/doc/scipy/reference/stats.html", required: true }, { title: "概率分布速查表", url: "https://www.johndcook.com/distribution_chart.html", required: false }, { title: "StatQuest: 概率分布讲解", url: "https://www.youtube.com/watch?v=3v9w79NhsfI", required: false }], checkpoint: "能说明 Beta 分布先验如何影响后验" },
      { day: 3, title: "期望、方差、协方差与相关系数", content: ["期望（Expectation）是随机变量的加权平均值，代表分布的中心位置。线性性质 E[aX+bY] = aE[X]+bE[Y] 是期望最重要的性质，使得我们可以分别处理各个变量", "方差（Variance）衡量随机变量偏离期望的程度：Var(X) = E[(X-μ)²] = E[X²] - (E[X])²。标准差是方差的平方根，与原始数据同量纲，更直观", "协方差衡量两个变量的线性相关程度：cov(X,Y) = E[(X-μX)(Y-μY)]。正值表示同向变化，负值表示反向变化，零表示不相关（但不一定独立）", "相关系数是标准化的协方差：ρ = cov(X,Y) / (σX·σY)，取值范围 [-1,1]。它消除了量纲影响，可以比较不同变量对的相关强度"], duration: "1.5小时", resources: [R_NUMPY, { title: "Khan Academy: 期望与方差", url: "https://www.khanacademy.org/math/statistics-probability/random-variables-stats-library/random-variables-discrete/v/expected-value", required: false }, { title: "协方差与相关系数详解", url: "https://www.statlect.com/fundamentals-of-probability/covariance", required: false }], checkpoint: "能计算一组样本的协方差矩阵并解释对角线含义" },
      { day: 4, title: "中心极限定理直观", content: ["中心极限定理（CLT）是概率论最重要的定理之一：无论原始分布是什么形状，只要样本量足够大，样本均值的分布都趋近于正态分布。这就是正态分布无处不在的原因", "通过模拟实验理解 CLT：从均匀分布中反复抽取 n=100 个样本计算均值，重复 10000 次，画出均值的直方图。结果应该接近正态分布，即使原始均匀分布完全不是正态的", "样本量 n 影响均值分布的形状：n 越大，均值分布越集中在真实均值附近（方差 = σ²/n）。这就是为什么大样本估计更可靠", "CLT 的实际意义：它为很多统计推断方法提供了理论基础，如置信区间、假设检验等。即使总体分布未知，只要样本量足够，就可以用正态近似"], duration: "1.5小时", resources: [R_NUMPY, { title: "3Blue1Brown: 中心极限定理", url: "https://www.youtube.com/watch?v=zeJD6dqJ5lo", required: true }, { title: "Seeing Theory: CLT 可视化", url: "https://seeing-theory.brown.edu/probability-distributions/index.html", required: false }], checkpoint: "能用模拟说明：均匀分布的样本均值渐近正态" },
      { day: 5, title: "贝叶斯公式与后验更新", content: ["贝叶斯公式是条件概率的逆问题：已知 P(B|A) 求 P(A|B)。公式为 P(A|B) = P(B|A)P(A)/P(B)，其中 P(A) 是先验（prior），P(A|B) 是后验（posterior）", "经典案例：疾病检测中，患病率 1%，灵敏度 99%，特异度 99%。检测阳性时真正患病的概率只有约 50%！这是因为先验概率太低，即使检测很准确，误报也会超过真阳", "共轭先验是贝叶斯统计的重要概念：Beta 分布是伯努利的共轭先验，意味着先验和后验都是 Beta 分布。先验 Beta(2,2) + 观察到 8 次成功 2 次失败 → 后验 Beta(10,4)", "可视化理解：先验分布表示初始信念，似然函数表示数据对参数的支持程度，后验分布是两者的结合。数据越多，后验越集中在真实值附近"], duration: "2小时", resources: [ { title: "Bayes' Rule 可视化", url: "https://setosa.io/ev/conditional-probability/", required: true }, { title: "StatQuest: 贝叶斯定理", url: "https://www.youtube.com/watch?v=9wCngeo75Uo", required: false }, { title: "贝叶斯思维入门", url: "https://arbital.com/p/bayes_rule/", required: false }], checkpoint: "能算出疾病检测例子中阳性真正患病的概率（约 50%）" },
      { day: 6, title: "最大似然估计 MLE", content: ["最大似然估计（MLE）是参数估计的核心方法：选择让观测数据出现概率最大的参数值。直觉上，就是找最能解释数据的参数", "对于正态分布 N(μ,σ²)，MLE 推导结果是：μ 的估计 = 样本均值，σ² 的估计 = 样本方差（除以 n 而非 n-1）。这就是为什么均值和方差是正态分布最自然的描述", "对伯努利分布，MLE 就是成功次数除以总次数。例如抛硬币 100 次出现 60 次正面，MLE 估计 p = 0.6", "对数似然函数将连乘转为连乘，求导更方便。令导数为零求解最大值点，就得到 MLE 估计量。这是机器学习中损失函数设计的理论基础"], duration: "1.5小时", resources: [R_NUMPY, { title: "MLE 详解", url: "https://www.statlect.com/fundamentals-of-statistics/maximum-likelihood", required: false }, { title: "StatQuest: MLE 讲解", url: "https://www.youtube.com/watch?v=XepXtl9YKwc", required: false }], checkpoint: "能从零用 NumPy 实现正态分布两参数的 MLE" },
      { day: 7, title: "置信区间", content: ["置信区间是对总体参数的区间估计：以一定置信度（如 95%）包含真实参数值的区间。95% 置信区间不是说参数有 95% 概率落在这个区间，而是重复抽样时 95% 的区间会包含真实值", "正态近似法：当样本量足够大时，样本均值服从正态分布，95% 置信区间为 样本均值 ± 1.96 × 标准误（标准误 = 标准差/√n）", "Bootstrap 方法不依赖分布假设：从原始样本中有放回地重采样 B 次（如 B=1000），计算 B 个均值，取 2.5% 和 97.5% 分位数作为置信区间", "置信区间的宽度反映估计精度：样本量越大、方差越小，区间越窄。t 分布用于小样本情况（n<30），比正态分布有更厚的尾部"], duration: "1.5小时", resources: [R_NUMPY, { title: "置信区间可视化", url: "https://seeing-theory.brown.edu/frequentist-inference/index.html", required: false }, { title: "Bootstrap 方法详解", url: "https://www.statlect.com/fundamentals-of-statistics/bootstrap", required: false }], checkpoint: "能用 bootstrap 法给出样本均值的 95% 置信区间" },
      { day: 8, title: "假设检验与 p 值", content: ["假设检验是统计推断的核心框架：提出原假设 H0 和备择假设 H1，计算在 H0 成立时观测到当前数据（或更极端）的概率，即 p 值", "t 检验用于比较两个样本的均值是否有显著差异。独立样本 t 检验假设两组数据独立，配对 t 检验用于同一组对象的前后对比", "p 值的常见误解：p<0.05 不意味着效应很大或实际重要，只意味着在 H0 下观测到这样结果的概率小于 5%。p 值受样本量影响，大样本时微小差异也可能显著", "多重检验问题：进行多次检验时，至少一次出现假阳性的概率会增大。Bonferroni 修正将显著性阈值除以检验次数，FDR（错误发现率）方法更宽松但仍控制假阳性"], duration: "2小时", resources: [{ title: "scipy.stats.ttest_ind", url: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_ind.html", required: true }, { title: "假设检验可视化", url: "https://seeing-theory.brown.edu/frequentist-inference/index.html", required: false }, { title: "p 值的正确解读", url: "https://www.amstat.org/asa/files/pdfs/p-valuestatement.pdf", required: false }], checkpoint: "能对两个模型在同一测试集上的 10 次运行做 t 检验并下结论" },
      { day: 9, title: "信息熵、交叉熵、KL 散度", content: ["信息熵（Entropy）衡量分布的不确定性：H(p) = -Σ p(x)log p(x)。熵越大，不确定性越高。均匀分布熵最大，确定性分布熵为 0。单位取决于对数底：以 2 为底单位是 bit", "交叉熵（Cross-Entropy）衡量用分布 q 编码来自分布 p 的数据所需的平均比特数：H(p,q) = -Σ p(x)log q(x)。它是机器学习中分类损失函数的基础", "KL 散度（Kullback-Leibler Divergence）衡量两个分布的差异：KL(p||q) = Σ p(x)log(p(x)/q(x)) = H(p,q) - H(p)。KL 散度非负，等于 0 当且仅当 p=q", "三者关系：交叉熵 = 熵 + KL 散度。最小化交叉熵等价于最小化 KL 散度，因为熵是常数。这就是为什么交叉熵可以作为训练分类模型的损失函数"], duration: "1.5小时", resources: [R_D2L, { title: "3Blue1Brown: 信息熵", url: "https://www.youtube.com/watch?v=2s3aJfRr9gE", required: true }, { title: "Colah: KL 散度可视化", url: "https://colah.github.io/posts/2015-09-Visual-Information/", required: false }], checkpoint: "能手写交叉熵并解释它为何可作为分类损失" },
      { day: 10, title: "Softmax + Cross Entropy：分类损失的推导", content: ["Softmax 函数将任意实数向量转换为概率分布：softmax(z)_i = exp(z_i) / Σ exp(z_j)。它保持了原始值的大小关系，且输出之和为 1，适合作为分类概率", "Cross-Entropy Loss 是分类任务的标准损失函数：对于 one-hot 真值 y，loss = -log softmax(z)_y。直觉上，当模型对正确类别的预测概率越接近 1，损失越小", "数值稳定性实现：直接计算 exp(z) 可能溢出。技巧是减去最大值：softmax(z)_i = exp(z_i - max(z)) / Σ exp(z_j - max(z))，结果不变但避免了溢出", "Softmax + CE 的梯度形式非常简洁：∂loss/∂z = softmax(z) - one_hot(y)。这个梯度等于预测概率与真实标签的差，直觉上让模型增加正确类别的概率，减少错误类别的概率"], duration: "2小时", resources: [R_PYTORCH_DOC, { title: "Softmax 详解", url: "https://pytorch.org/docs/stable/generated/torch.nn.Softmax.html", required: true }, { title: "Cross-Entropy Loss 图解", url: "https://ml-cheatsheet.readthedocs.io/en/latest/loss_functions.html", required: false }, { title: "CS231n: Softmax 分类器", url: "https://cs231n.github.io/linear-classify/#softmax", required: false }], checkpoint: "能手写稳定的 softmax + cross entropy，并验证其梯度与 PyTorch 一致" },
      { day: 11, title: "蒙特卡洛积分与重要性采样", content: ["蒙特卡洛（MC）方法通过随机采样近似计算确定性问题。对于积分 ∫f(x)dx，可以在积分区间均匀采样 N 个点，用 f 的样本均值乘以区间长度作为积分估计", "重要性采样（Importance Sampling）改进 MC 效率：选择一个更接近被积函数形状的 proposal 分布 q(x) 采样，用权重 w(x)=p(x)/q(x) 修正偏差。方差更小，收敛更快", "估计 π 的经典实验：在单位正方形内随机撒点，统计落在单位圆内的比例。π ≈ 4 × (圆内点数/总点数)。样本量越大，估计越精确", "对比不同 proposal 分布的方差：好的 proposal 分布应该与被积函数形状相似，这样权重变化小，估计更稳定。这是变分推断和强化学习中策略梯度的理论基础"], duration: "1.5小时", resources: [R_NUMPY, { title: "蒙特卡洛方法入门", url: "https://www.cs.ubc.ca/~arnaud/andrieu_defreitas_doucet_jordan_introduction_to_mcmc_machine_learning.pdf", required: false }, { title: "重要性采样图解", url: "https://www.rug.nl/research/portal/files/68466276/Importance_sampling.pdf", required: false }], checkpoint: "能用 MC 估计 π 到小数点后两位，并说明样本量与精度关系" },
      { day: 12, title: "A/B 测试与模型对比", content: ["A/B 测试是互联网公司常用的数据驱动决策方法：将用户随机分为两组，分别展示不同版本，通过统计检验判断哪个版本效果更好", "模型对比是 A/B 测试在机器学习中的应用：两个模型在同一测试集上评估，用配对 t 检验或 bootstrap 判断性能差异是否统计显著", "统计显著性 vs 实际重要性：p<0.05 只意味着差异不太可能是偶然，但不代表差异有实际价值。如果模型 B 只比 A 高 0.1% 准确率但推理慢 10 倍，可能不值得更换", "箱线图（Box Plot）是可视化模型对比的好工具：展示中位数、四分位数、异常值，可以直观看出两个模型的性能分布差异"], duration: "2小时", resources: [{ title: "Bootstrap 教程", url: "https://en.wikipedia.org/wiki/Bootstrapping_(statistics)", required: false }, { title: "A/B 测试统计指南", url: "https://www.evanmiller.org/ab-testing/", required: true }, { title: "模型对比最佳实践", url: "https://scikit-learn.org/stable/model_selection.html", required: false }], checkpoint: "能在一组实验上判断 B 是否统计显著优于 A" },
      { day: 13, title: "正则化的贝叶斯视角", content: ["从贝叶斯视角理解正则化：L2 正则（权重衰减）等价于给权重施加高斯先验 N(0,σ²)，L1 正则等价于给权重施加拉普拉斯先验。MAP（最大后验）估计就是在似然上加先验", "高斯先验倾向于让权重接近 0 但不为 0，产生平滑的权重分布。拉普拉斯先验有更尖锐的峰值在 0 处，倾向于产生稀疏权重（很多恰好为 0），这就是 L1 产生稀疏解的原因", "实验验证：用小线性回归数据集，分别用 MLE（无正则）和 MAP（L2/L1 正则）拟合。画出权重分布直方图，观察 L1 正则下权重更集中在 0 附近", "正则化参数 λ 控制先验强度：λ 越大，先验越强，权重越小。这就是为什么正则化参数需要通过交叉验证选择"], duration: "1.5小时", resources: [R_D2L, { title: "正则化的贝叶斯解释", url: "https://wiseodd.github.io/techblog/2017/01/12/bayesian-regularization/", required: false }, { title: "CS229: 正则化与贝叶斯", url: "https://cs229.stanford.edu/notes2022fall/main_notes.pdf", required: false }], checkpoint: "能解释 L2/L1 正则项对应哪种先验分布" },
      { day: 14, title: "综合：用交叉熵与 t 检验对比两个分类器", content: ["本练习将串联前 13 天所学：数据准备 → 模型训练 → 评估指标 → 统计检验 → 可视化。这是机器学习实验的标准流程", "使用 sklearn 的 digits 数据集（手写数字识别），训练两个模型：Logistic Regression 和 Random Forest。做 10 折交叉验证，记录每一折的交叉熵 loss 和准确率", "交叉熵损失比准确率更敏感：它考虑了模型预测的概率分布，而不仅仅是分类对错。两个模型准确率相同但交叉熵不同，说明概率校准质量有差异", "用配对 t 检验判断两个模型的 loss 差异是否统计显著。画出两个模型在 10 折上的 loss 分布图，直观展示差异"], duration: "3小时", resources: [R_NUMPY, { title: "sklearn cross_val_score", url: "https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.cross_val_score.html", required: true }, { title: "sklearn digits 数据集", url: "https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html", required: false }, { title: "统计检验与机器学习", url: "https://machinelearningmastery.com/statistical-significance-tests-for-comparing-machine-learning-algorithms/", required: false }], checkpoint: "产出一次完整的实验：loss/acc 数值 + 统计检验 + 可视化结论" }],
  },

  // =====================================================
  // Node 6: pytorch-core
  // =====================================================
  {
    id: "pytorch-core",
    name: "PyTorch 框架",
    track: "cv",
    duration: "2周",
    prerequisites: ["math-linear-algebra"],
    status: "locked",
    position: { x: 470, y: 0 },
    description: "Tensor / Dataset / DataLoader / 优化器 / 分布式训练",
    outcomes: ["熟练用 PyTorch 搭建任意模型结构", "分布式训练基础"],
    relatedIntel: ["011-pytorch", "010-numpy-pandas"],
    relatedTools: ["PyTorch"],
    relatedTerms: ["pytorch", "tensor", "cuda", "gpu", "backpropagation"],
    dailyTasks: [
      { day: 1, title: "Tensor 创建与在设备间迁移", content: ["创建 Tensor 最常用的几种方式：torch.randn(3, 4) — 标准正态分布随机初始化；torch.zeros(2, 3) / torch.ones(...) — 零/一初始化；torch.tensor([[1,2],[3,4]]) — 从 Python 列表直接创建", "GPU 迁移只需一行：x = x.cuda() 或 x = x.to('cuda')。先检查 GPU 是否可用：print(torch.cuda.is_available())，若 True 则可以迁移，否则跳过。迁移后打印 device 属性确认所在设备", "dtype 转换：x.float() 转 float32，x.long() 转 int64，x.half() 转 float16。混合精度训练中常用 float16 和 bfloat16", "动手实验：python -c \"import torch; x = torch.randn(3, 4, requires_grad=True); print(x.shape, x.dtype, x.device, x.requires_grad)\" — 四项属性全部验证"], duration: "1.5小时", resources: [R_PYTORCH_DOC, R_PYTORCH_TUT, { title: "PyTorch Tensor 官方教程", url: "https://pytorch.org/tutorials/beginner/basics/tensorqs_tutorial.html", required: true }, { title: "D2L: 数据操作（Tensor 基础）", url: "https://zh.d2l.ai/chapter_preliminaries/ndarray.html", required: false }], checkpoint: "能在 CPU/GPU 上创建 tensor，并完成类型转换与 device 迁移" },
      { day: 2, title: "索引、切片、reshape、permute", content: ["view() 和 reshape() 都用于改变张量形状，区别在于 view() 要求内存连续（可先用 .contiguous() 处理），而 reshape() 更灵活会自动处理。x.view(-1) 将任意形状展平为一维", "unsqueeze(0) 在第 0 维加一个 batch 维度，squeeze() 自动去除所有大小为 1 的维度。x[:, 8:24, 8:24] 切片语法取中心 16x16 区域", "维度重排：x.permute(0, 2, 3, 1) 将 (B,C,H,W) 变为 (B,H,W,C)，transpose(2, 3) 交换 H 和 W 维度。图像数据常用 (B,H,W,C) 而卷积输出是 (B,C,H,W)", "实际任务：用 PIL 读取一张图 → 转为 tensor → normalize(0.485,0.229,0.225) 均值和 (0.229,0.224,0.225) 标准差 → permute 到 CHW → view(1,3,224,224) 加 batch → 送入模型"], duration: "1.5小时", resources: [R_PYTORCH_TUT, R_D2L, { title: "PyTorch 索引与切片教程", url: "https://pytorch.org/tutorials/beginner/basics/data_tutorial.html", required: true },  { title: "PyTorch Tensor操作实战代码", url: "https://github.com/pytorch/examples/tree/main/mnist", required: false, type: "repo", source: "github" }, { title: "NumPy与PyTorch对比教程", url: "https://pytorch.org/tutorials/beginner/examples/numpy/tensor_power.html", required: false, type: "doc", source: "official" }], checkpoint: "能把 (B,C,H,W) 的 batch 变形为 (B,H,W,C) 并恢复回去" },
      { day: 3, title: "自动微分 autograd", content: ["PyTorch 的 autograd 是自动微分引擎，是深度学习框架的核心。设置 requires_grad=True 后，PyTorch 会记录对该张量的所有运算，构建计算图。调用 .backward() 时自动计算梯度并存入 .grad 属性", "验证自动微分正确性是重要的学习方法：对 y = x^2 求导，数学上梯度为 2x。将手算结果与 x.grad 对比，可以帮助理解 autograd 的工作原理", "torch.no_grad() 是一个上下文管理器，在推理阶段使用它可以禁止梯度计算，从而节省显存并加速推理。模型部署时必须使用", "detach() 方法将张量从计算图中分离，返回一个不参与梯度计算的新张量。在实现 EMA（指数移动平均）或提取中间特征时非常有用"], duration: "1.5小时", resources: [R_PYTORCH_DOC, R_D2L, { title: "PyTorch autograd 机制详解", url: "https://pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html", required: true }, { title: "自动微分的数学原理（视频）", url: "https://www.youtube.com/watch?v=tIeHLnjs5U8", required: false }, { title: " autograd 源码解析", url: "https://github.com/pytorch/pytorch/blob/main/torch/autograd/", required: false, type: "repo", source: "github" }], checkpoint: "能手算并验证一个标量 loss 对输入 tensor 的梯度" },
      { day: 4, title: "nn.Module 与自定义层", content: ["nn.Module 是 PyTorch 中所有神经网络模块的基类。自定义层需要继承 nn.Module，在 __init__ 中定义可学习参数（用 nn.Parameter 包装使其能被优化器发现），在 forward 方法中定义前向传播逻辑", "对比自己实现的 MyLinear 与官方 nn.Linear 的区别：nn.Linear 额外支持 bias（偏置项），使用更高效的初始化方式，并内置了多种初始化策略", "nn.Sequential 是一个容器模块，按顺序串联多个子模块。通过 print(model) 可以查看模型的层次结构和参数形状，便于调试", "model.parameters() 返回所有可学习参数的迭代器，用于传递给优化器；model.state_dict() 返回一个有序字典，包含所有参数和持久化缓冲区（如 BN 的 running_mean），用于模型保存和加载"], duration: "2小时", resources: [R_PYTORCH_TUT, { title: "PyTorch nn.Module 教程", url: "https://pytorch.org/tutorials/beginner/nn_tutorial.html", required: true }, { title: "PyTorch 自定义 nn.Module 指南", url: "https://pytorch.org/docs/stable/notes/extending.html", required: false }, { title: "PyTorch官方模型实现集合", url: "https://github.com/pytorch/pytorch/blob/main/torch/nn/modules/", required: false, type: "repo", source: "github" }], checkpoint: "能从零实现一个线性层并与 nn.Linear 数值对齐" },
      { day: 5, title: "Dataset 与 DataLoader", content: ["PyTorch 的 Dataset 是一个抽象类，自定义数据集需要实现两个方法：__len__ 返回数据集大小，__getitem__ 根据索引返回一个样本（特征+标签）。这种设计让数据加载与模型训练解耦", "DataLoader 是数据加载器，负责将 Dataset 中的样本组合成 mini-batch。batch_size 控制每批样本数，shuffle=True 在每个 epoch 打乱数据顺序防止过拟合，num_workers 控制数据加载的并行进程数", "通过 iter(dataloader).__next__() 可以手动取出一个 batch 来检查数据形状和内容是否正确，这是调试数据管道的常用手段", "collate_fn 是一个自定义函数，用于将多个样本合并为一个 batch。当样本长度不一致时（如 NLP 中的变长序列），需要用 collate_fn 做 padding 对齐"], duration: "2小时", resources: [R_PYTORCH_DOC, R_PYTORCH_TUT, { title: "PyTorch 数据加载与处理教程", url: "https://pytorch.org/tutorials/beginner/basics/data_tutorial.html", required: true }, { title: "自定义 Dataset 详解", url: "https://pytorch.org/tutorials/beginner/data_loading_tutorial.html", required: false }, { title: "PyTorch DataLoader源码解析", url: "https://github.com/pytorch/pytorch/blob/main/torch/utils/data/dataloader.py", required: false, type: "repo", source: "github" }, { title: "数据加载最佳实践", url: "https://pytorch.org/docs/stable/data.html", required: false, type: "doc", source: "official" }], checkpoint: "能为一个 NumPy 数组封装 Dataset，用 DataLoader 出 batch" },
      { day: 6, title: "优化器与学习率调度", content: ["SGD（随机梯度下降）是最基础的优化器，momentum（动量）参数通过累积历史梯度方向来加速收敛并减少震荡，通常设为 0.9。SGD 虽简单但在精心调参后效果依然出色", "AdamW 是目前最常用的优化器，结合了 Adam 的自适应学习率和正确的权重衰减实现。lr=3e-4 是一个很好的初始学习率，weight_decay=0.01 实现 L2 正则化防止过拟合", "学习率调度器在训练过程中动态调整学习率。CosineAnnealingLR 按余弦曲线从初始学习率降到接近零，前期大学习率快速收敛，后期小学习率精细调整，是目前最流行的调度策略", "标准训练循环的四个步骤必须按顺序执行：zero_grad() 清零梯度、backward() 反向传播计算梯度、step() 更新参数、scheduler.step() 更新学习率。漏掉 zero_grad 会导致梯度累积"], duration: "1.5小时", resources: [R_PYTORCH_TUT, { title: "PyTorch 优化器文档", url: "https://pytorch.org/docs/stable/optim.html", required: true }, { title: "常用优化算法图解", url: "https://ruder.io/optimizing-gradient-descent/", required: false }, { title: "学习率调度策略详解", url: "https://pytorch.org/docs/stable/optim.html#how-to-adjust-learning-rate", required: false }], checkpoint: "能写出一个完整的 epoch 训练循环，loss 每 epoch 下降" },
      { day: 7, title: "训练/验证闭环 + TensorBoard", content: ["将数据集按比例分割为训练集和验证集是机器学习的基本实践。random_split 按给定数量随机划分，通常 80% 训练 20% 验证。验证集不参与训练，用于评估模型泛化能力", "完整的训练循环包含两个阶段：训练阶段模型学习数据模式，验证阶段评估模型在未见数据上的表现。两者交替进行，每个 epoch 后比较 train 和 val 的 loss/acc", "模型在训练和推理阶段的行为不同：eval() 模式下 Dropout 不随机丢弃神经元，BatchNorm 使用全局统计量而非当前 batch 统计量。推理时必须用 torch.no_grad() 禁用梯度计算", "TensorBoard 是 PyTorch 内置的可视化工具，SummaryWriter 可以记录标量（loss、acc）、图像、直方图等。训练完成后用 tensorboard --logdir runs 命令启动 Web 界面查看训练曲线"], duration: "2.5小时", resources: [R_PYTORCH_TUT, { title: "TensorBoard 入门教程", url: "https://pytorch.org/tutorials/intermediate/tensorboard_tutorial.html", required: true }, { title: "训练与验证的最佳实践", url: "https://pytorch.org/tutorials/beginner/introyt/trainingyt.html", required: false }, { title: "wandb可视化工具", url: "https://docs.wandb.ai/", required: false, type: "doc", source: "official" }], checkpoint: "能跑 MNIST 3 层 MLP，在 TensorBoard 看到训练 loss 下降" },
      { day: 8, title: "模型保存/加载与恢复训练", content: ["Checkpoint（检查点）是训练过程的快照，通常包含当前 epoch 编号、模型权重（state_dict）和优化器状态。保存优化器状态很重要，因为它包含了动量等内部状态，中断后恢复训练才能无缝衔接", "加载 checkpoint 时需要先用 torch.load 读取文件（weights_only=True 是安全选项，防止加载恶意代码），然后分别用 load_state_dict 恢复模型和优化器的状态", "部署推理时只需保存模型权重（state_dict），不需要优化器状态和 epoch 信息，文件更小。这是模型交付给他人或部署到生产环境的标准做法", "权重初始化对训练效果有显著影响：Xavier 初始化适用于 sigmoid/tanh 激活函数，Kaiming 初始化专为 ReLU 设计，能保持前向和反向传播中信号的方差稳定"], duration: "1.5小时", resources: [R_PYTORCH_DOC, R_PYTORCH_TUT, { title: "PyTorch 保存与加载模型教程", url: "https://pytorch.org/tutorials/beginner/saveloadrun_tutorial.html", required: true }, { title: "权重初始化方法详解", url: "https://pytorch.org/docs/stable/nn.init.html", required: false }], checkpoint: "能保存 checkpoint 并在中断后从第 5 轮继续训练到第 10 轮" },
      { day: 9, title: "混合精度 AMP", content: ["混合精度训练（AMP）是指同时使用 float16 和 float32 进行计算。autocast 上下文管理器会自动将适合的操作转为 fp16 计算（如矩阵乘法），不适合的操作保持 fp32（如 softmax），从而在不损失精度的前提下加速训练", "GradScaler 是混合精度训练的关键组件。由于 fp16 的数值范围较小，梯度容易下溢为零。GradScaler 先将 loss 放大再反向传播，更新参数前再缩放回来，确保小梯度不丢失", "混合精度训练的收益显著：显存占用通常减少约一半，使得可以使用更大的 batch size；同时 GPU 的 Tensor Core 对 fp16 计算有硬件加速，训练速度通常提升 1.5-2 倍", "需要注意并非所有操作都适合 fp16：LayerNorm、BatchNorm 等涉及归一化的操作在 fp16 下可能数值不稳定，autocast 会自动将它们保持在 fp32。如果遇到 loss 出现 NaN，可以检查是否有操作需要手动指定精度"], duration: "2小时", resources: [R_PYTORCH_DOC, { title: "PyTorch AMP 教程", url: "https://pytorch.org/tutorials/recipes/recipes/amp_recipe.html", required: true }, { title: "混合精度训练原理", url: "https://arxiv.org/abs/1710.03740", required: false }, { title: "APEX AMP使用指南", url: "https://nvidia.github.io/apex/amp.html", required: false, type: "doc", source: "official" }], checkpoint: "在一个 ResNet18 小任务上成功开启 AMP，loss 正常下降" },
      { day: 10, title: "torch.compile 加速", content: ["torch.compile 是 PyTorch 2.0 引入的即时编译（JIT）功能，它会分析模型的计算图并生成优化的底层代码。mode='default' 在编译时间和运行速度之间取得平衡，mode='reduce-overhead' 进一步减少 Python 开销", "首次调用时 torch.compile 会进行图捕获和编译，这个过程可能需要几十秒到几分钟，因此第一个 iteration 会明显变慢。但之后的每次前向传播都会使用编译后的优化代码", "衡量 compile 效果的方法是对比前后每秒处理的样本数（samples/s 或 steps/s）。通常在较大的模型和 batch size 上效果更明显，因为编译优化的计算图开销被摊薄", "torch.compile 有一些限制：动态形状（每次输入尺寸不同）可能触发重编译；自定义 C++/CUDA 扩展需要额外适配；某些控制流（如数据依赖的 if/else）可能无法被完整编译"], duration: "1.5小时", resources: [R_PYTORCH_DOC, { title: "torch.compile 详解", url: "https://pytorch.org/tutorials/intermediate/torch_compile_tutorial.html", required: true }, { title: "PyTorch 2.0 编译器介绍", url: "https://pytorch.org/get-started/pytorch.2.0/", required: false }, { title: "torch.compile 源码解析", url: "https://github.com/pytorch/pytorch/blob/main/torch/_inductor/", required: false, type: "repo", source: "github" }], checkpoint: "在一个可复现的脚本中，开启 compile 后观察到 step/s 提升" },
      { day: 11, title: "多卡 DataParallel（单机多卡）", content: ["nn.DataParallel（DP）是最简单的多卡方案，只需一行代码 model = nn.DataParallel(model).cuda() 即可将模型复制到所有 GPU 上。它会自动将 batch 拆分到各卡计算，再在主卡上汇总结果", "DP 的主要缺点是单进程多线程架构，主卡（通常是 GPU 0）需要承担汇总梯度和参数更新的工作，显存和计算压力比其他卡大，导致资源利用不均衡", "DistributedDataParallel（DDP）是更高效的多卡方案，采用多进程架构，每个 GPU 对应一个独立进程。各进程独立计算梯度后通过 NCCL 后端高效通信同步，没有主卡瓶颈", "使用 DDP 需要先初始化进程组（指定通信后端 NCCL），然后用 torchrun 命令启动多个进程。torchrun 会自动处理进程间协调、环境变量设置等细节"], duration: "2小时", resources: [R_PYTORCH_DOC, { title: "PyTorch DDP 教程", url: "https://pytorch.org/tutorials/intermediate/ddp_tutorial.html", required: true }, { title: "PyTorch 多 GPU 训练最佳实践", url: "https://pytorch.org/docs/stable/notes/ddp.html", required: false }, { title: "torchrun 启动器文档", url: "https://pytorch.org/docs/stable/elastic/run.html", required: false }], checkpoint: "能在单机双卡上用 DDP 跑 MNIST，两张卡利用率都非 0" },
      { day: 12, title: "Accelerate 库简化分布式", content: ["HuggingFace Accelerate 库是对 PyTorch 分布式训练的高层封装，目标是用最少的代码改动让同一份脚本在 CPU、单卡、多卡甚至 TPU 上都能运行。创建 Accelerator 实例后，它会自动检测当前硬件环境", "accelerator.prepare() 是核心方法，它将模型、优化器、数据加载器、学习率调度器包装为分布式感知的对象。无需手动处理 device 迁移、DistributedSampler 等繁琐细节", "在训练循环中用 accelerator.backward(loss) 替代 loss.backward()，它会自动处理梯度同步。其余训练代码与单卡完全相同，大幅降低了分布式训练的门槛", "Accelerate 还提供了 gradient accumulation、mixed precision、deepspeed 集成等高级功能，只需在配置文件中指定，无需修改训练代码"], duration: "2小时", resources: [{ title: "Accelerate 文档", url: "https://huggingface.co/docs/accelerate/", required: true }, { title: "Accelerate 快速入门教程", url: "https://huggingface.co/docs/accelerate/basic_tutorials/overview", required: true }, { title: "Accelerate GitHub 仓库", url: "https://github.com/huggingface/accelerate", required: false }, { title: "DeepSpeed 集成指南", url: "https://huggingface.co/docs/accelerate/main/en/deepspeed", required: false, type: "doc", source: "official" }], checkpoint: "能把前一天的 DDP 脚本用 accelerate 改写，代码量显著减少" },
      { day: 13, title: "训练技巧：梯度裁剪、累积、正则", content: ["梯度裁剪（Gradient Clipping）通过限制梯度的最大范数来防止梯度爆炸。clip_grad_norm_ 会计算所有参数梯度的 L2 范数，如果超过 max_norm 则等比缩放，在 RNN 和 Transformer 训练中几乎是标配", "梯度累积（Gradient Accumulation）适用于显存不足以支撑大 batch size 的场景。每 accumulation_steps 次前向+反向后才执行一次参数更新，等效于使用了 accumulation_steps 倍的 batch size", "权重衰减（weight_decay）是经典的正则化手段，AdamW 中的 weight_decay 实现了正确的解耦 L2 正则化。它在每步更新时将权重乘以 (1 - lr * weight_decay)，等效于在损失函数中添加 L2 惩罚项", "Dropout 是深度学习中最常用的正则化方法之一，在训练时以概率 p 随机将神经元输出置零，迫使网络学习更鲁棒的特征。推理时不使用 Dropout，但需要对输出乘以 (1-p) 进行缩放（PyTorch 默认使用 inverted dropout 自动处理）"], duration: "1.5小时", resources: [R_PYTORCH_TUT, { title: "梯度裁剪与梯度累积详解", url: "https://pytorch.org/docs/stable/notes/amp_examples.html", required: false }, { title: "正则化技术综述", url: "https://www.deeplearningbook.org/contents/regularization.html", required: false }, { title: "PyTorch正则化文档", url: "https://pytorch.org/docs/stable/nn.html#regularization", required: false, type: "doc", source: "official" }], checkpoint: "能在脚本中同时使用 gradient clipping + 梯度累积，并观察训练稳定" },
      { day: 14, title: "综合：从零训练 CIFAR-10", content: ["CIFAR-10 是深度学习入门的经典数据集，包含 10 个类别的 60000 张 32x32 彩色图像。使用 torchvision.datasets.CIFAR10 可以一键下载，transforms 组合实现数据增强（随机裁剪、水平翻转、归一化）", "模型选择有两种思路：自实现小型 ResNet（3 个残差块）来巩固对残差连接的理解，或直接使用 torchvision.models.resnet18(weights=None) 从零训练作为基线对比", "综合运用前 13 天所学：使用 AMP 混合精度加速训练，CosineAnnealing 学习率调度，梯度裁剪防止梯度爆炸，TensorBoard 记录训练过程中的 loss 和 accuracy 曲线", "训练策略：保存验证集上 accuracy 最高的权重作为最佳模型，而非最后一个 epoch 的权重。训练结束后在 TensorBoard 中查看 loss 曲线是否收敛、是否存在过拟合，并可视化部分预测结果"], duration: "3小时", resources: [R_PYTORCH_TUT, R_D2L, { title: "CIFAR-10 数据集介绍", url: "https://www.cs.toronto.edu/~kriz/cifar.html", required: false }, { title: "PyTorch 图像分类完整教程", url: "https://pytorch.org/tutorials/beginner/finetuning_torchvision_models_tutorial.html", required: false }], checkpoint: "val_acc ≥ 80%（合理基线）；训练日志/权重文件都能产出" }],
  },

  // =====================================================
  // Node 7: cv-cnn
  // =====================================================
  {
    id: "cv-cnn",
    name: "CNN 经典架构",
    track: "cv",
    duration: "2周",
    prerequisites: ["pytorch-core"],
    status: "locked",
    position: { x: 470, y: 220 },
    description: "卷积感受野 / ResNet / 迁移学习 / 特征可视化",
    outcomes: ["理解 CNN 设计原理", "能复现经典论文架构并训练"],
    relatedIntel: ["006-cnn-basics", "004-resnet", "002-yolo"],
    relatedTools: ["Ultralytics YOLO"],
    relatedTerms: ["cnn", "resnet", "pooling", "feature-map"],
    dailyTasks: [
      { day: 1, title: "卷积操作与感受野", content: ["卷积操作是 CNN 的核心，通过在输入图像上滑动一个小的卷积核（filter），逐位置计算点积来提取特征。可以手动构造一个 Sobel 边缘检测核，用 torch.nn.functional.conv2d 对灰度图做卷积，观察响应图中边缘被高亮", "padding 是在输入边缘填充零值，可以控制输出尺寸。padding=1 在 3x3 卷积核下保持空间尺寸不变（same padding）。没有 padding 时输出会比输入小（valid convolution）", "输出尺寸的计算公式为 H' = (H + 2P - K) // S + 1，其中 H 是输入高度，P 是 padding，K 是核大小，S 是步长。这个公式是设计网络架构时必须掌握的基础", "感受野（Receptive Field）是指输出特征图上一个像素对应原始输入的区域大小。堆叠多层小卷积核（如 3x3）可以在保持较少参数的同时获得更大的感受野，这是 VGG 网络的核心思想"], duration: "2小时", resources: [R_CS231N, R_D2L, B_CV_TUTORIAL, { title: "卷积神经网络可视化讲解", url: "https://cs231n.github.io/convolutional-networks/", required: true }, { title: "卷积动画演示", url: "https://github.com/vdumoulin/conv_arithmetic", required: false }, { title: "卷积操作PyTorch实现", url: "https://pytorch.org/docs/stable/generated/torch.nn.Conv2d.html", required: false, type: "doc", source: "official" }], checkpoint: "能手工计算给定输入 shape、kernel、stride、padding 时的输出 shape" },
      { day: 2, title: "多通道卷积与 1×1 卷积", content: ["多通道卷积的输入有多个通道（如 RGB 图像的 3 通道），每个输出通道对应一组卷积核（每个输入通道一个核），最终将所有通道的卷积结果求和得到一个输出通道。nn.Conv2d(3,16,3,padding=1) 表示 3 通道输入、16 通道输出", "参数量计算是模型设计的基本功：权重参数 = out_channels x in_channels x K x K，再加上 bias 的 out_channels 个参数。Conv2d(3,16,3) 的参数量为 16*3*9+16=448，理解这个公式有助于估算模型大小", "1x1 卷积看起来像逐像素的全连接层，实际上实现了跨通道的线性组合。它可以改变通道数（降维或升维），是 Inception 网络和 ResNet 瓶颈结构的关键组件，能显著减少计算量", "FLOPs（浮点运算次数）是衡量模型计算量的指标。一个卷积层的 FLOPs 约为 2 x out_channels x in_channels x K x K x H_out x W_out（乘加各算一次）。手动估算有助于判断模型是否满足部署的算力约束"], duration: "2小时", resources: [R_CS231N, R_D2L, { title: "CNN 参数量与 FLOPs 计算", url: "https://medium.com/@muhammetbolat/calculating-parameters-and-flops-of-cnits-convolutional-layers-c05ba93e0b4f", required: false }, { title: "1x1 卷积的作用详解", url: "https://iamaaditya.github.io/2016/03/one-by-one-convolution/", required: false }], checkpoint: "能计算一个 Conv2d 层的参数量与输出 shape" },
      { day: 3, title: "LeNet-5：第一个经典 CNN", content: ["LeNet-5 是 Yann LeCun 在 1998 年提出的经典 CNN 架构，用于手写数字识别。结构为：两个卷积层（5x5 核）+ 两个平均池化层 + 三个全连接层，激活函数使用 tanh。它是理解 CNN 发展历史的起点", "在 MNIST 数据集上训练 LeNet，transforms.ToTensor() 将 PIL 图像转为 [0,1] 范围的张量。MNIST 是 28x28 灰度图，10 个类别（数字 0-9），是最基础的图像分类基准", "训练 5 个 epoch 后观察 train 和 val 的准确率变化。如果 train_acc 远高于 val_acc 说明过拟合，如果两者都很低说明欠拟合或学习率不合适", "对比自己的实现与 1998 年原始论文的结果，理解 20 多年来深度学习在训练技巧、数据增强、优化器等方面的进步如何让同一个架构达到更好的效果"], duration: "2小时", resources: [R_D2L, { title: "LeNet 原始论文", url: "http://yann.lecun.com/exdb/publis/pdf/lecun-01a.pdf", required: false }, { title: "PyTorch 实现 LeNet 教程", url: "https://pytorch.org/tutorials/beginner/introyt/introyt1_tutorial.html", required: true }, { title: "CS231n CNN 架构发展史", url: "https://cs231n.github.io/convolutional-networks/", required: false },  { title: "LeNet MNIST分类实战", url: "https://github.com/rasbt/deeplearning-models/blob/master/pytorch_ipynb/cnn/lenet5.ipynb", required: false, type: "repo", source: "github" }], checkpoint: "能在 MNIST 上跑自己实现的 LeNet，val_acc > 97%" },
      { day: 4, title: "AlexNet 与 ReLU/数据增强", content: ["AlexNet 是 2012 年 ImageNet 竞赛的冠军，开创了深度学习时代。简化版包含 5 个卷积层和 3 个全连接层，使用 ReLU 激活函数替代 tanh（解决了梯度消失问题），并引入 MaxPool 和 Dropout", "CIFAR-10 是 32x32 的彩色图像数据集，10 个类别各 6000 张。由于原始 AlexNet 设计用于 227x227 输入，在 CIFAR-10 上需要调整 stride 和核大小以适配更小的图像尺寸", "数据增强是防止过拟合的重要手段：RandomCrop 随机裁剪增加位置不变性，RandomHorizontalFlip 水平翻倍数据量，Normalize 将像素值标准化到零均值单位方差，加速收敛", "通过对比实验理解数据增强的价值：不加增强时模型很快记住训练集导致过拟合（train_acc 高 val_acc 低），加入增强后泛化能力显著提升"], duration: "2小时", resources: [R_CS231N, { title: "AlexNet 原始论文", url: "https://papers.nips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html", required: false }, { title: "PyTorch 数据增强文档", url: "https://pytorch.org/vision/stable/transforms.html", required: true }, { title: "数据增强技术综述", url: "https://arxiv.org/abs/1906.11837", required: false },  { title: "Albumentations数据增强库", url: "https://albumentations.ai/", required: false, type: "repo", source: "github" }], checkpoint: "能在 CIFAR-10 上训练一个小型 AlexNet，val_acc > 70%" },
      { day: 5, title: "VGG：小卷积核堆叠", content: ["VGG 网络的核心思想是用多个 3x3 小卷积核堆叠替代大卷积核（如 5x5 或 7x7），两个 3x3 卷积的感受野等价于一个 5x5，但参数更少且非线性更强。VGG-11 包含 8 个卷积层和 3 个全连接层", "VGG 的通道数逐阶段倍增（64->128->256->512），每个阶段用 MaxPool 将空间尺寸减半。这种设计模式成为后续很多网络的模板", "VGG 的主要问题是参数量巨大（约 1.38 亿），大部分参数集中在全连接层。在 CIFAR-10 上实现简化版 VGG 时需要减小全连接层的输入维度", "对比 LeNet、AlexNet 和 VGG 的训练时间和精度，可以直观感受到更深的网络需要更多计算但通常能达到更高精度，同时也更容易过拟合"], duration: "2小时", resources: [R_CS231N, { title: "VGG 原始论文", url: "https://arxiv.org/abs/1409.1556", required: false }, { title: "VGG 网络结构详解", url: "https://neurohive.io/en/popular-networks/vgg16/", required: false }, { title: "D2L: VGG 实现", url: "https://zh.d2l.ai/chapter_convolutional-modern/vgg.html", required: true },  { title: "VGG PyTorch实现代码", url: "https://github.com/pytorch/vision/blob/main/torchvision/models/vgg.py", required: false, type: "repo", source: "github" }], checkpoint: "能从零实现 VGG-11（简化版）并在 CIFAR 上训练" },
      { day: 6, title: "残差连接与 ResNet", content: ["残差块（Residual Block）的核心思想是学习残差映射 F(x) = H(x) - x，而不是直接学习 H(x)。前向传播时输出为 x + F(x)，其中 F(x) 是两层卷积的结果。这让网络只需学习输入与输出的差异，而非完整映射", "残差连接解决了深层网络的退化问题：梯度可以通过 skip connection 直接从深层传到浅层，避免了梯度消失。即使中间层没有学到有效信息，至少不会损害性能（恒等映射）", "ResNet-18 的完整结构：一个 7x7 卷积的 stem 层，4 个 stage 各包含 2 个残差块，最后是全局平均池化和全连接分类层。每个 stage 的第一个残差块可能改变通道数和空间尺寸", "Kaiming 初始化（kaiming_normal_）是专为 ReLU 设计的初始化方法，它考虑了 ReLU 会将一半激活置零的特性，保持前向传播中各层输出方差的稳定，对训练深层网络至关重要"], duration: "2.5小时", resources: [{ title: "ResNet 论文", url: "https://arxiv.org/abs/1512.03385", required: true }, R_D2L, { title: "ResNet 结构详解（中文）", url: "https://zh.d2l.ai/chapter_convolutional-modern/resnet.html", required: true }, { title: "残差连接的直觉解释", url: "https://towardsdatascience.com/understanding-and-visualizing-resnets-4532e3c644d1", required: false }], checkpoint: "能从零实现 ResNet-18，并在 CIFAR-10 上达到 val_acc > 85%" },
      { day: 7, title: "BatchNorm / LayerNorm 与训练稳定性", content: ["BatchNorm 在卷积层后对每个通道做归一化：减去 batch 均值、除以标准差，再通过可学习的缩放和偏移参数恢复表达能力。训练时用当前 batch 统计量，同时维护全局的 running_mean 和 running_var 用于推理", "训练和推理阶段 BN 的行为不同：训练时使用当前 mini-batch 的统计量并更新全局统计量，推理时使用训练期间累积的全局统计量以保证输出确定性。model.eval() 会切换到推理模式", "LayerNorm 对每个样本的最后一个维度做归一化，不依赖 batch 中的其他样本，因此不受 batch size 影响。在 NLP 和 Vision Transformer 中广泛使用，而 CNN 中更常用 BatchNorm", "对比实验：去掉 BatchNorm 后训练通常会变得更不稳定，需要更小的学习率，收敛更慢。BN 的作用不仅是正则化，更重要的是让损失函数的景观更平滑，允许使用更大的学习率"], duration: "1.5小时", resources: [R_PYTORCH_DOC, { title: "BatchNorm 原始论文", url: "https://arxiv.org/abs/1502.03167", required: false }, { title: "BatchNorm vs LayerNorm 详解", url: "https://www.pinecone.io/learn/batch-layer-normalization/", required: true }, { title: "D2L: 批量归一化", url: "https://zh.d2l.ai/chapter_convolutional-modern/batch-norm.html", required: false },  { title: "GroupNorm论文", url: "https://arxiv.org/abs/1803.08494", required: false, type: "paper", source: "academic" }], checkpoint: "能解释 BN 在训练/推理阶段的行为差异" },
      { day: 8, title: "迁移学习：预训练 ResNet", content: ["迁移学习的核心思想是将在大数据集（如 ImageNet 的 100 万张图）上预训练的模型权重作为起点，应用到自己的小数据集上。预训练模型的低层已经学会了通用特征（边缘、纹理），高层特征可以通过微调适配新任务", "加载预训练模型后，需要替换最后的全连接层以匹配目标任务的类别数。model.fc = nn.Linear(512, N_CLASSES) 将 ImageNet 的 1000 类输出替换为自定义类别数", "微调策略分两步：第一步冻结 backbone（卷积层）只训练新的 FC 层，让新分类头适应预训练特征；第二步解冻整个网络用小学习率整体微调，让特征适配新数据分布", "对比两种策略的效果：冻结 backbone 训练速度快但精度有限，解冻微调精度更高但需要小心学习率（太大可能破坏预训练特征）。在小数据集上迁移学习通常远优于从零训练"], duration: "2.5小时", resources: [R_PYTORCH_TUT, { title: "PyTorch 迁移学习教程", url: "https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html", required: true }, { title: "迁移学习实战指南", url: "https://cs231n.github.io/transfer-learning/", required: true }, { title: "torchvision 预训练模型库", url: "https://pytorch.org/vision/stable/models.html", required: false }], checkpoint: "在小型自定义数据集（比如 10 类图片）上，用迁移学习 val_acc > 随机初始化" },
      { day: 9, title: "可视化训练中的 filters 与特征图", content: ["卷积核权重可以直接可视化：model.conv1.weight 形状为 (64,3,7,7)，每个核是 3x7x7 的小图像。低层卷积核通常呈现 Gabor 滤波器（边缘检测器）的形态，与传统计算机视觉中的手工特征相似", "PyTorch 的 forward hook 机制允许在不修改模型代码的情况下捕获中间层的输出。register_forward_hook 注册一个回调函数，在每次前向传播时自动记录指定层的 activation", "对一张输入图片，依次可视化各层的 activation map，可以观察到：浅层检测边缘和颜色，中层检测纹理和图案，深层检测物体部件和整体形状。这种层次化特征提取是 CNN 的核心优势", "理解 CNN 学到的层次特征有助于诊断模型问题：如果深层特征图激活稀疏说明模型可能欠拟合，如果某些通道始终无激活说明该卷积核可能冗余"], duration: "2小时", resources: [R_CS231N, { title: "CNN 特征可视化指南", url: "https://distill.pub/2017/feature-visualization/", required: true }, { title: "PyTorch Hook 机制详解", url: "https://pytorch.org/docs/stable/generated/torch.nn.Module.html#torch.nn.Module.register_forward_hook", required: true }, { title: "Zeiler & Fergus 特征可视化论文", url: "https://arxiv.org/abs/1311.2901", required: false }], checkpoint: "能画出某个卷积核组和一张图片经过它后的响应图" },
      { day: 10, title: "Grad-CAM：定位分类响应区域", content: ["Grad-CAM（梯度加权类激活映射）是一种可视化 CNN 决策依据的技术。它通过计算目标类别对最后一层卷积特征图的梯度，来定位图像中对分类最重要的区域", "实现步骤：用 hook 记录目标卷积层的 feature map 和梯度。对梯度在空间维度上取平均得到每个通道的重要性权重 alpha，将 alpha 与 feature map 加权求和并通过 ReLU 激活，得到类别的激活热图", "将热图上采样到原始图像尺寸，叠加在原图上用伪彩色显示。红色区域表示模型做出决策时重点关注的图像区域，蓝色表示不重要的区域", "对比不同目标类别生成的热图可以发现：模型对不同类别关注的区域不同。这有助于理解模型是否学到了正确的特征（如识别狗时关注狗的面部而非背景）"], duration: "2.5小时", resources: [{ title: "Grad-CAM 论文", url: "https://arxiv.org/abs/1610.02391", required: true }, { title: "Grad-CAM 可视化教程", url: "https://gradcam.app/", required: false }, { title: "PyTorch Grad-CAM 实现", url: "https://github.com/jacobgil/pytorch-grad-cam", required: false }, { title: "CNN 可解释性综述", url: "https://distill.pub/2019/activation-atlas/", required: false }], checkpoint: "能对一张输入图片生成目标类别的 Grad-CAM 热图并可视化" },
      { day: 11, title: "t-SNE / UMAP 嵌入可视化", content: ["t-SNE 是一种非线性降维算法，将高维特征（如模型倒数第二层的 512 维向量）投影到 2D 平面，同时尽量保持高维空间中的邻近关系。它是评估模型学到的特征质量的重要工具", "提取所有测试样本在模型 fc 前一层的特征向量，用 sklearn 的 TSNE 将 512 维降到 2 维。perplexity 参数控制邻域大小，通常设为 5-50 之间", "用不同颜色绘制各类别的 2D 散点图：如果同类样本聚集形成紧密的簇、不同类别之间有清晰的间隔，说明模型学到了有判别性的特征表示", "对比训练早期和训练完成后的 t-SNE 图：早期各类别混杂在一起，训练完成后各类别逐渐分离形成聚类。这种可视化直观展示了模型学习的过程"], duration: "2小时", resources: [{ title: "sklearn TSNE 文档", url: "https://scikit-learn.org/stable/modules/generated/sklearn.manifold.TSNE.html", required: true }, { title: "t-SNE 原理图解", url: "https://distill.pub/2016/misread-tsne/", required: true }, { title: "UMAP 文档（t-SNE 替代方案）", url: "https://umap-learn.readthedocs.io/", required: false }], checkpoint: "能画出 2D t-SNE 散点图，同类样本聚类明显" },
      { day: 12, title: "MobileNet / 深度可分离卷积", content: ["深度可分离卷积（Depthwise Separable Convolution）将标准卷积分解为两步：Depthwise Conv 对每个输入通道单独做空间卷积（不跨通道），Pointwise Conv 用 1x1 卷积做跨通道组合。这种分解大幅减少计算量", "参数量对比是关键：标准卷积参数量为 Cin x Cout x K x K，深度可分离卷积为 Cin x K x K + Cin x Cout。比值约为 1/Cout + 1/K²，对于 K=3、Cout=256 的情况，参数量约为标准卷积的 1/9", "自定义实现 DepthwiseSeparableConv2d 模块：用 groups=in_channels 实现 depthwise conv，再接一个 1x1 conv。这个模块是 MobileNet、EfficientNet 等轻量网络的基本构建块", "在 CIFAR-10 上对比 MobileNet 和 ResNet-18：MobileNet 参数量和计算量显著更小，精度可能略低，但在边缘设备和移动端部署场景下是更好的选择"], duration: "2小时", resources: [{ title: "MobileNets 论文", url: "https://arxiv.org/abs/1704.04861", required: true }, { title: "MobileNetV2 论文", url: "https://arxiv.org/abs/1801.04381", required: false }, { title: "D2L: 深度可分离卷积", url: "https://zh.d2l.ai/chapter_convolutional-modern/nin.html", required: false }, { title: "轻量级网络对比综述", url: "https://arxiv.org/abs/2102.00457", required: false }], checkpoint: "能用深度可分离卷积构建一个轻量模型，参数量显著小于 ResNet-18" },
      { day: 13, title: "数据增强与 TTA", content: ["高级数据增强技术：RandomResizedCrop 随机裁剪并缩放，ColorJitter 随机调整亮度/对比度/饱和度，RandomErasing 随机遮挡图像区域，RandAugment 自动搜索最优增强策略组合。这些技术能显著提升模型泛化能力", "TTA（Test-Time Augmentation）在推理阶段对同一张图片施加多种增强（不同裁剪、翻转等），分别预测后取平均作为最终结果。这种方法以推理时间为代价换取精度提升，常用于竞赛和重要场景", "对比 baseline 和 TTA 的验证集精度：TTA 通常能带来 1-3% 的精度提升。权衡精度提升与推理时间增加，决定是否在生产环境中使用", "Cutout 随机遮挡图像的一个矩形区域迫使模型关注全局信息；Mixup 将两张图线性混合；CutMix 用另一张图的区域替换当前图的对应区域。这三种方法都是强大的正则化手段"], duration: "2小时", resources: [R_PYTORCH_TUT, { title: "数据增强方法综述", url: "https://arxiv.org/abs/1906.11837", required: false }, { title: "Mixup 论文", url: "https://arxiv.org/abs/1710.09412", required: false }, { title: "RandAugment 论文", url: "https://arxiv.org/abs/1909.13719", required: false }], checkpoint: "能在推理时启用 TTA，val_acc 相对 baseline 提升" },
      { day: 14, title: "综合：图像分类小比赛", content: ["从 Kaggle 或其他公开平台选择一个不超过 10 类的图像数据集（如花卉、食物、动物等），确保数据量适中（每类 200-500 张），适合快速实验迭代", "对比三种方案的性能：ResNet-18 从零训练（验证数据量是否足够）、ResNet-18 预训练迁移学习（利用 ImageNet 特征）、MobileNetV3 预训练（轻量级方案）。记录每种方案的参数量、训练耗时和验证精度", "统一训练策略：CosineAnnealing 学习率调度 + AdamW 优化器 + 综合数据增强（RandomResizedCrop + ColorJitter + RandomHorizontalFlip）+ TTA 推理。控制变量确保对比公平", "产出完整实验报告：模型对比表格（参数量、FLOPs、训练时间、val_acc）、训练曲线、Grad-CAM 可视化典型失败样本分析错误原因（如遮挡、类间相似、标注错误等）"], duration: "3小时", resources: [R_CS231N, R_PYTORCH_TUT, { title: "Kaggle 图像数据集", url: "https://www.kaggle.com/datasets?tags=13207-Image", required: false }, { title: "PyTorch 图像分类最佳实践", url: "https://pytorch.org/tutorials/beginner/finetuning_torchvision_models_tutorial.html", required: false }], checkpoint: "产出完整实验报告：模型对比表 + 可视化 + 失败样本分析" }],
  },

  // =====================================================
  // Node 8: cv-detection
  // =====================================================
  {
    id: "cv-detection",
    name: "目标检测",
    track: "cv",
    duration: "2周",
    prerequisites: ["cv-cnn"],
    status: "locked",
    position: { x: 470, y: 440 },
    description: "边界框回归 / IoU / YOLO / Ultralytics / 导出 ONNX",
    outcomes: ["训练自定义目标检测数据集", "推理优化与部署"],
    relatedIntel: ["002-yolo", "014-onnx"],
    relatedTools: ["Ultralytics YOLO", "ONNX Runtime"],
    relatedTerms: ["yolo", "object-detection", "bounding-box", "map", "nms"],
    dailyTasks: [
      { day: 1, title: "目标检测任务与边界框", content: ["目标检测需要同时完成定位和分类：找出图像中所有目标的位置（边界框）和类别。两种主流的边界框标注格式：Pascal VOC 使用左上角和右下角坐标 (xmin, ymin, xmax, ymax)，YOLO 使用中心坐标和宽高 (cx, cy, w, h) 并归一化到 [0,1]", "编写 YOLO 与 VOC 格式的互相转换函数是基本功。YOLO 格式需要将归一化坐标乘以图像宽高得到像素坐标，再转换为 VOC 格式。注意两种格式的坐标含义不同", "使用 PIL 或 OpenCV 在图像上绘制边界框是验证标注正确性的直观方法：画红色矩形框，在框上方标注类别名称和置信度。这是调试检测模型的重要手段", "理解坐标系统：图像坐标系原点在左上角，x 轴向右，y 轴向下。bbox 的坐标必须在图像范围内，宽高必须为正数"], duration: "1.5小时", resources: [R_ULTRALYTICS, { title: "目标检测边界框格式详解", url: "https://albumentations.ai/docs/getting_started/bounding_boxes_augmentation/", required: false }, { title: "Pascal VOC 数据集格式说明", url: "http://host.robots.ox.ac.uk/pascal/VOC/", required: false }, { title: "YOLO 标注格式说明", url: "https://docs.ultralytics.com/datasets/detect/", required: true },  { title: "目标检测数据集标注工具", url: "https://github.com/facebookresearch/Detectron", required: false, type: "repo", source: "github" }], checkpoint: "能读取 YOLO 格式的标注并画到图片上" },
      { day: 2, title: "IoU 与 NMS", content: ["IoU（Intersection over Union，交并比）是衡量两个边界框重叠程度的指标。计算方法：交集面积除以并集面积。IoU=1 表示完全重叠，IoU=0 表示无重叠。它是目标检测中最核心的评估指标", "NMS（Non-Maximum Suppression，非极大值抑制）用于消除冗余检测框。算法流程：按置信度降序排列所有框，依次取出最高分的框，删除与它 IoU 超过阈值的其他框，重复直到处理完所有框", "用合成数据验证 NMS 效果：生成一组重叠的 bbox，分别用不同的 NMS 阈值（如 0.3、0.5、0.7）处理，观察输出框数量的差异。阈值越小抑制越激进，保留的框越少", "NMS 的改进变体：Soft-NMS 不直接删除重叠框而是降低其置信度，对密集目标场景更友好；DIoU-NMS 同时考虑中心点距离，在遮挡严重时效果更好"], duration: "2小时", resources: [R_ULTRALYTICS, { title: "IoU 与 NMS 图解", url: "https://medium.com/@vennelaworkspace/understanding-iou-and-nms-in-object-detection-1a0e2a5a6a72", required: false }, { title: "NMS 算法详解", url: "https://www.coursera.org/lecture/convolutional-neural-networks/non-max-suppression-dvrpc", required: false }, { title: "Soft-NMS 论文", url: "https://arxiv.org/abs/1704.04503", required: false },  { title: "IoU NMS实现代码", url: "https://github.com/amusi/Non-Maximum-Suppression", required: false, type: "repo", source: "github" }], checkpoint: "能独立实现 IoU 与朴素 NMS，并在合成数据上跑通" },
      { day: 3, title: "mAP 指标理解", content: ["mAP（mean Average Precision）是目标检测的标准评估指标。对每个类别：将检测结果按置信度降序排列，逐个判断是否为真正例（与某个 gt 的 IoU 超过阈值），据此绘制 PR 曲线并积分得到 AP。所有类别 AP 的均值即 mAP", "mAP@0.5 表示 IoU 阈值固定为 0.5 时的 mAP，只要框与 gt 的 IoU >= 0.5 就算正确检测。mAP@0.5:0.95 是从 0.5 到 0.95 每隔 0.05 计算一次 mAP 再取平均，对框的定位精度要求更严格", "pycocotools 是 COCO 官方的评估工具，使用 COCOeval 类可以标准化地计算 mAP。需要将检测结果转换为 COCO 格式（包含 image_id、category_id、bbox、score 字段）", "mAP 与分类准确率的区别：mAP 同时考虑了分类正确性和定位准确性，而准确率只关注分类。一个模型可能分类很准但框画得不好，此时 mAP 会低于分类准确率"], duration: "2小时", resources: [{ title: "pycocotools GitHub", url: "https://github.com/cocodataset/cocoapi", required: true }, { title: "COCO 数据集评估指标详解", url: "https://cocodataset.org/#detection-eval", required: true }, { title: "目标检测评估指标图解", url: "https://github.com/rafaelpadilla/Object-Detection-Metrics", required: false }, { title: "mAP 计算原理视频", url: "https://www.youtube.com/watch?v=FppOzcDvaDI", required: false }], checkpoint: "能解释 mAP 与准确率的区别，并能在合成数据上跑通评估" },
      { day: 4, title: "Ultralytics YOLO 安装与推理 Demo", content: ["Ultralytics 提供了 YOLOv8 的统一 Python 接口，安装只需 pip install ultralytics。YOLO('yolov8n.pt') 加载预训练的 YOLOv8-nano 模型（n 表示最小最快速的版本，还有 s/m/l/x 逐级增大）", "model.predict() 方法支持多种输入：图片路径、URL 链接、视频文件、摄像头流。save=True 会将检测结果保存到 runs/detect/ 目录下，包括标注了 bbox 的图片", "对视频文件推理时，YOLO 会逐帧检测并保存为带标注的视频。推理速度取决于模型大小、输入分辨率和硬件性能", "results 对象包含丰富的检测信息：results[0].boxes.xyxy 是边界框坐标，results[0].boxes.conf 是置信度分数，results[0].boxes.cls 是类别索引。print(len(results[0].boxes)) 查看检测到的目标数量"], duration: "2小时", resources: [R_ULTRALYTICS, { title: "YOLOv8 快速入门", url: "https://docs.ultralytics.com/quickstart/", required: true }, { title: "YOLOv8 检测任务文档", url: "https://docs.ultralytics.com/tasks/detect/", required: true }, { title: "Ultralytics GitHub 仓库", url: "https://github.com/ultralytics/ultralytics", required: false }], checkpoint: "能用预训练 YOLOv8 对一张公开图做检测并查看输出 bbox" },
      { day: 5, title: "准备自定义 COCO/YOLO 数据集", content: ["YOLO 格式数据集有固定的目录结构：images/ 存放图片，labels/ 存放标注文件（与图片同名的 .txt 文件）。训练集和验证集分别放在 train/ 和 val/ 子目录下", "data.yaml 是数据集配置文件，包含：数据集根目录路径（path）、训练集路径（train）、验证集路径（val）、类别名称映射（names 字典）。YOLO 训练时通过这个文件读取数据", "标注工具推荐：LabelImg 是桌面端的经典标注工具，支持 YOLO 和 VOC 格式导出；Roboflow 是在线平台，支持自动标注和数据增强。对于 demo 项目，也可以直接下载公开的小型检测数据集", "标注质量检查至关重要：随机挑选几张图片，将标注的 bbox 画在图上，检查框是否准确框住了目标、类别是否正确、是否有遗漏的标注。标注质量直接决定模型性能上限"], duration: "2.5小时", resources: [R_ULTRALYTICS, { title: "YOLO 数据集格式说明", url: "https://docs.ultralytics.com/datasets/detect/", required: true }, { title: "LabelImg 标注工具", url: "https://github.com/heartexlabs/labelImg", required: false }, { title: "Roboflow 数据标注平台", url: "https://roboflow.com/", required: false }], checkpoint: "拥有一个可被 YOLO 读取的≥100 张图的自定义数据集" },
      { day: 6, title: "训练 YOLOv8 自定义数据集", content: ["YOLOv8 的训练通过命令行或 Python API 启动。data.yaml 指定数据集，model 指定预训练权重（从 COCO 预训练的权重微调效果更好），epochs 是训练轮数，imgsz 是输入图像尺寸，batch 是批大小", "训练产物保存在 runs/detect/train/ 目录下：results.csv 记录每轮的 loss 和 mAP，PR 曲线图展示精确率与召回率的关系，val_batch*.jpg 展示验证集上的预测样例，best.pt 是验证集 mAP 最高的权重", "超参数调优：增大 imgsz（如 416->640）可以检测更小的目标但训练更慢；增大 batch size 可以让梯度更稳定但受显存限制；增加 epochs 可以充分训练但有过拟合风险", "过拟合的典型表现是训练 loss 持续下降但验证 loss 开始上升。解决方法：减少训练轮数、增加数据量、增强数据增强强度、减小模型复杂度"], duration: "3小时", resources: [R_ULTRALYTICS, { title: "YOLOv8 训练详解", url: "https://docs.ultralytics.com/modes/train/", required: true }, { title: "YOLOv8 训练超参数说明", url: "https://docs.ultralytics.com/usage/cfg/", required: true }, { title: "目标检测训练调参指南", url: "https://docs.ultralytics.com/guides/hyperparameter-tuning/", required: false }], checkpoint: "在自定义数据集上训练完成，runs 目录下有预测样例图与 PR 曲线" },
      { day: 7, title: "评估与错误分析", content: ["加载训练过程中保存的最佳权重（best.pt 而非 last.pt）进行评估。model.val() 方法在验证集上计算完整的评估指标，包括 mAP50 和 mAP50-95，以及每个类别的单独指标", "系统的错误分析是提升模型性能的关键：从验证集中找出三类典型失败案例——漏检（有目标但未检测到）、误检（无目标但产生了检测框）、框不准（检测到但 IoU 低）", "分析失败原因：漏检可能是目标太小、遮挡严重或训练数据中该类样本不足；误检可能是背景中存在与目标相似的物体；框不准可能是标注不一致或目标边界模糊", "错误分析完成后形成文档，针对每类问题提出改进方向：增加相关数据、调整 anchor 大小、修改数据增强策略等。这种系统化的分析方法比盲目调参更高效"], duration: "2小时", resources: [R_ULTRALYTICS, { title: "YOLOv8 验证模式文档", url: "https://docs.ultralytics.com/modes/val/", required: true }, { title: "目标检测错误分析方法", url: "https://blog.roboflow.com/how-to-evaluate-object-detection-models/", required: false }, { title: "W&B 错误分析工具", url: "https://docs.wandb.ai/guides/models", required: false }], checkpoint: "有一个自己的 Bad Case 分析文档 / notebook" },
      { day: 8, title: "数据增强与超参优化", content: ["YOLOv8 内置了丰富的数据增强参数：hsv_h/s/v 控制色调饱和度亮度的变化幅度，degrees/translate/scale 控制旋转平移缩放的幅度，mosaic 将 4 张图拼成一张，mixup 将两张图混合叠加", "Mosaic 增强通过拼接 4 张图让模型同时学习不同尺度和位置的目标，是 YOLO 系列精度提升的关键。但对小数据集可能导致过度增强，关闭后观察 mAP 变化判断是否适合当前数据", "类别不平衡是检测任务中的常见问题：某些类别样本数量远多于其他类别。解决方案包括过采样少数类、在 loss 中给少数类更大权重、或使用 focal loss 关注难分类样本", "使用 wandb 或 TensorBoard 记录多组实验的训练曲线，对比不同超参数组合（如不同 imgsz、有无 mosaic、不同学习率）的 mAP 变化，用数据驱动的方式选择最优配置"], duration: "2.5小时", resources: [R_ULTRALYTICS, { title: "YOLOv8 训练参数详解", url: "https://docs.ultralytics.com/usage/cfg/#train", required: true }, { title: "Weights & Biases 实验追踪", url: "https://docs.wandb.ai/", required: false }, { title: "Focal Loss 论文", url: "https://arxiv.org/abs/1708.02002", required: false }, { title: "目标检测数据增强策略", url: "https://docs.ultralytics.com/guides/data-augmentation/", required: false }], checkpoint: "至少跑 2 组对比实验（如不同 imgsz 或是否 mosaic）并记录 mAP 差异" },
      { day: 9, title: "YOLO 系列架构直觉", content: ["YOLO 的架构由三部分组成：Backbone（骨干网络，如 CSPDarknet，负责提取特征）、Neck（颈部，如 PAN/FPN，负责多尺度特征融合）、Head（检测头，负责预测 bbox 和类别）", "YOLOv8 采用 Anchor-Free 设计，直接预测特征点到 bbox 四条边的距离，而非像 v5 那样基于预设 anchor 偏移。使用 DFL（Distribution Focal Loss）更精确地回归边界框", "对比 YOLOv5、v8 和 v11 的差异：v8 在精度和速度上通常优于 v5，v11（最新的 YOLO 系列）在架构上进一步优化。实际选择时需要在精度、速度和部署复杂度之间权衡", "阅读 Ultralytics 源码是深入理解 YOLO 的最好方式：找到 tasks/detect/ 目录下的模型定义文件，理解 Detect Head 如何将特征图转换为检测结果"], duration: "1.5小时", resources: [R_ULTRALYTICS, { title: "YOLOv8 架构详解", url: "https://docs.ultralytics.com/models/yolov8/", required: true }, { title: "YOLO 系列发展综述", url: "https://arxiv.org/abs/2209.02976", required: false }, { title: "Ultralytics 源码（GitHub）", url: "https://github.com/ultralytics/ultralytics/tree/main/ultralytics/nn", required: true }, { title: "YOLOv8 vs YOLOv5 对比", url: "https://docs.ultralytics.com/models/yolov8/#performance-metrics", required: false }], checkpoint: "能用 3 句话讲出 YOLOv8 相对 v5 的主要变化" },
      { day: 10, title: "导出为 ONNX/TensorRT 加速推理", content: ["ONNX（Open Neural Network Exchange）是通用的模型交换格式，可以将 PyTorch 模型转换为 ONNX 格式后在各种推理引擎上运行。model.export() 方法一行代码完成导出，simplify=True 会优化计算图去除冗余节点", "ONNX Runtime 是微软开源的推理引擎，支持 CPU 和 GPU 加速。安装 onnxruntime-gpu 版本可以利用 GPU 推理，速度通常比 PyTorch 原生推理快 2-5 倍", "用 ONNX Runtime 加载模型推理：创建 InferenceSession 加载 .onnx 文件，通过 sess.run() 方法传入 numpy 数组获取输出。注意输入数据的形状和数据类型必须与导出时一致", "对比 PyTorch 和 ONNX Runtime 的推理速度：记录两种方式处理同一张图片的耗时。ONNX 优势在于消除 Python 开销和优化算子融合，特别适合生产部署"], duration: "2.5小时", resources: [R_ULTRALYTICS, { title: "YOLOv8 导出文档", url: "https://docs.ultralytics.com/modes/export/", required: true }, { title: "ONNX Runtime 官方文档", url: "https://onnxruntime.ai/docs/", required: true }, { title: "TensorRT 开发者指南", url: "https://developer.nvidia.com/tensorrt", required: false }, { title: "ONNX 格式规范", url: "https://onnx.ai/onnx/", required: false }], checkpoint: "能用导出的 ONNX 跑一次端到端推理，速度较 PyTorch 提升" },
      { day: 11, title: "封装推理 API（FastAPI）", content: ["FastAPI 是 Python 的高性能 Web 框架，非常适合构建模型推理服务。创建 POST /detect 接口，接收上传的图片文件（multipart/form-data），在服务端完成图片解码、预处理、YOLO 推理，最后将检测结果以 JSON 格式返回", "返回的 JSON 响应包含每个检测到的目标的信息：边界框坐标 (x1,y1,x2,y2)、置信度分数 (conf)、类别名称 (cls)。前端可以根据这些信息绘制检测结果", "使用 uvicorn ASGI 服务器启动服务：uvicorn main:app --host 0.0.0.0 --port 8000。0.0.0.0 表示监听所有网络接口，允许外部设备访问", "用 curl 命令测试 API：curl -F 'file=@test.jpg' http://localhost:8000/detect。也可以用 Python 的 requests 库或 Postman 工具测试。确保服务能正确处理各种图片格式和大小"], duration: "2小时", resources: [R_FASTAPI, R_ULTRALYTICS, { title: "FastAPI 文件上传教程", url: "https://fastapi.tiangolo.com/tutorial/request-files/", required: true }, { title: "YOLOv8 推理服务部署指南", url: "https://docs.ultralytics.com/guides/rest-api/", required: false }], checkpoint: "能通过 HTTP 请求获取推理结果" },
      { day: 12, title: "摄像头实时推理 Demo", content: ["使用 OpenCV 的 VideoCapture(0) 打开电脑默认摄像头，通过循环不断读取视频帧。每一帧送入 YOLO 模型推理，将检测结果绘制在帧上，用 cv2.imshow() 实时显示。按 q 键退出循环", "实时检测的关键指标是 FPS（每秒处理帧数）。流畅的视频需要至少 25-30 FPS，如果低于此值需要考虑使用更小的模型或降低输入分辨率", "对比不同大小模型的实时性能：yolov8n（最小最快）、yolov8s（小型）、yolov8m（中型）。在本机上分别测试 FPS，找到精度和速度的最佳平衡点", "记录本机的推理性能数据（FPS、延迟），这些数据对后续选择部署方案很有参考价值。如果需要更高的 FPS，可以考虑导出 ONNX 或 TensorRT 加速"], duration: "2小时", resources: [R_ULTRALYTICS, { title: "OpenCV 视频捕获文档", url: "https://docs.opencv.org/4.x/d8/dfe/classcv_1_1VideoCapture.html", required: false }, { title: "YOLOv8 实时检测示例", url: "https://docs.ultralytics.com/modes/predict/#inference-sources", required: true }, { title: "YOLOv8 各模型性能对比", url: "https://docs.ultralytics.com/models/yolov8/#performance-metrics", required: false },  { title: "YOLOv8实时检测代码", url: "https://github.com/ultralytics/ultralytics/tree/main/examples", required: false, type: "repo", source: "github" }], checkpoint: "能用一个脚本启动电脑摄像头并实时目标检测" },
      { day: 13, title: "脚本化批量处理与结果导出", content: ["编写批量推理脚本：遍历指定文件夹下的所有图片（支持 jpg、png 等格式），逐张或批量送入 YOLO 模型推理，将检测结果保存为两种格式——JSON 文件（包含 bbox 坐标、置信度、类别）和带标注框的图片", "统计功能：解析所有图片的检测结果，按类别统计目标出现次数，输出为 CSV 文件。这对于数据集分析和业务报告很有价值", "性能优化：使用 YOLOv8 的批量推理接口（传入图片路径列表而非单张图片）可以利用 GPU 并行加速。对于大量图片，可以结合多进程预处理进一步提升吞吐量", "脚本应该设计为命令行工具，接受输入文件夹路径、输出文件夹路径、置信度阈值等参数，附带 README 说明使用方法，使其成为可复用的工具"], duration: "2小时", resources: [R_ULTRALYTICS, { title: "YOLOv8 批量推理", url: "https://docs.ultralytics.com/modes/predict/#inference-sources", required: true }, { title: "Python argparse 命令行参数", url: "https://docs.python.org/3/library/argparse.html", required: false }, { title: "Python 批处理最佳实践", url: "https://realpython.com/python-concurrency/", required: false },  { title: "YOLOv8批量处理脚本", url: "https://github.com/ultralytics/ultralytics/tree/main/examples", required: false, type: "repo", source: "github" }], checkpoint: "有一个可复用的 CLI 脚本，能在新图片文件夹下一键产出结果" },
      { day: 14, title: "综合：端到端的自定义检测服务", content: ["选定一个实际检测场景（如桌面物品识别、动物检测、交通标志识别等），准备至少 2 个类别、200 张以上的标注数据。数据质量比数量更重要，确保标注准确一致", "完整流程：用 YOLOv8s 训练自定义数据集，导出 ONNX 格式加速推理，用 FastAPI 封装推理 API，用 Streamlit 构建简易 Web UI（上传图片 -> 显示检测结果和 bbox）", "使用 Docker 容器化部署：编写 Dockerfile 安装依赖、复制模型和代码、暴露端口。docker build 构建镜像，docker run -p 8000:8000 mydet 启动服务。容器化确保环境一致性", "产出完整的性能评估报告：mAP 指标（检测精度）、单张图片推理延迟（服务响应速度）、GPU 显存占用（资源消耗）。这些指标是决定是否能上线部署的关键依据"], duration: "3小时", resources: [R_ULTRALYTICS, R_FASTAPI, R_STREAMLIT, { title: "Docker 化 ML 服务部署", url: "https://docs.docker.com/language/python/", required: false }, { title: "Streamlit 图片上传组件", url: "https://docs.streamlit.io/library/api-reference/media/st.image", required: false }], checkpoint: "可运行的 Docker 化检测服务 + 简易 UI + 性能评估报告" }],
  },

  // =====================================================
  // Node 9: nlp-rnn
  // =====================================================
  {
    id: "nlp-rnn",
    name: "NLP 基础与 RNN",
    track: "nlp",
    duration: "2周",
    prerequisites: ["math-probability", "pytorch-core"],
    status: "locked",
    position: { x: 680, y: 0 },
    description: "分词 / 词向量 / RNN LSTM / 文本分类 / Seq2Seq",
    outcomes: ["理解序列建模核心原理", "完成文本分类任务"],
    relatedIntel: ["013-huggingface-datasets"],
    relatedTools: [],
    relatedTerms: ["rnn", "lstm", "sequence"],
    dailyTasks: [
      { day: 1, title: "文本预处理与分词", content: ["文本预处理是 NLP 的第一步：将原始文本转换为模型可处理的数字序列。英文分词相对简单（按空格分割），但需要处理标点、缩写；中文没有天然分隔符，需要专门的分词工具", "NLTK 是 Python 最经典的 NLP 库，word_tokenize 可以智能处理英文标点和缩写。jieba 是最常用的中文分词库，支持精确模式、全模式和搜索引擎模式", "词表（vocabulary）建立 token 到 ID 的映射：word2idx = {w:i+2 for i,w in enumerate(vocab)}，保留两个特殊 token：<PAD>=0 用于填充对齐，<UNK>=1 用于处理未登录词", "编码（encoding）将文本转为 ID 序列：tokens = [word2idx.get(w, 1) for w in tokens]。OOV（Out-of-Vocabulary）词用 <UNK> 的 ID 替代。这就是模型实际看到的输入"], duration: "1.5小时", resources: [R_CS224N, { title: "NLTK 分词教程", url: "https://www.nltk.org/api/nltk.tokenize.html", required: false }, { title: "jieba 中文分词", url: "https://github.com/fxsjy/jieba", required: true }, { title: "HuggingFace Tokenizers", url: "https://huggingface.co/docs/tokenizers/", required: false },  { title: "NLP文本预处理代码库", url: "https://github.com/Huffon/nlp-basics", required: false, type: "repo", source: "github" }], checkpoint: "能把一段中英文句子转成 token id 序列，并构建自己的词表" },
      { day: 2, title: "Word2Vec：从计数到预测", content: ["Word2Vec 是词向量的开创性工作，核心思想是「一个词的含义由它周围的词决定」。两种训练模式：CBOW 用上下文预测中心词，Skip-gram 用中心词预测上下文", "CBOW 实现：取上下文窗口内的词向量（如前后各 2 个词），求平均后通过线性层预测中心词。损失函数是交叉熵，训练目标是最大化预测正确词的概率", "负采样（Negative Sampling）是训练效率的关键优化：不计算整个词表的 softmax（计算量太大），而是随机采样几个负样本，让模型区分正样本和负样本", "训练完成后，词向量具有语义：king - man + woman ≈ queen，因为向量编码了「性别」这个语义维度。可以用余弦相似度衡量两个词的语义接近程度"], duration: "2小时", resources: [R_D2L, { title: "Word2Vec 原始论文", url: "https://arxiv.org/abs/1301.3781", required: false }, { title: "Word2Vec 图解", url: "https://jalammar.github.io/illustrated-word2vec/", required: true }, { title: "gensim Word2Vec 教程", url: "https://radimrehurek.com/gensim/models/word2vec.html", required: false },  { title: "Word2Vec实现代码", url: "https://github.com/nicodjimenez/lstm", required: false, type: "repo", source: "github" }], checkpoint: "能实现一个极简 CBOW，并用 it/s 训练 1000 步" },
      { day: 3, title: "使用预训练词向量", content: ["从零训练词向量需要大量语料，实际项目中通常使用预训练词向量。GloVe（Global Vectors）在大规模语料上训练，捕捉全局共现统计信息。gensim 的 downloader 可以一键加载", "预训练词向量的神奇性质：king - man + woman ≈ queen。这个类比实验证明词向量编码了抽象的语义关系，不仅仅是词频统计", "nn.Embedding.from_pretrained 可以将预训练向量加载到 PyTorch 模型中。freeze=True 冻结词向量不参与训练（适合小数据集），False 允许微调（可能提升上限但需更多数据）", "使用预训练词向量的优势：即使训练数据很少，模型也能利用大规模语料学到的语义知识。对于中文，推荐使用腾讯词向量或百度词向量"], duration: "2小时", resources: [{ title: "GloVe 词向量下载", url: "https://nlp.stanford.edu/projects/glove/", required: true }, { title: "gensim 预训练词向量", url: "https://radimrehurek.com/gensim/downloader.html", required: false }, { title: "torchtext 词向量加载", url: "https://pytorch.org/text/stable/vocab.html", required: false }], checkpoint: "能在自己的模型中加载 GloVe 预训练权重并做类比实验" },
      { day: 4, title: "RNN 前向传播", content: ["循环神经网络（RNN）是处理序列数据的基础架构。核心思想是维护一个隐藏状态 h_t，它编码了到当前时刻为止的所有历史信息。每一步用当前输入 x_t 和上一步的隐藏状态 h_{t-1} 计算新的 h_t", "vanilla RNN 的计算公式：h_t = tanh(Wxh @ x_t + Whh @ h_{t-1})。Wxh 将输入映射到隐藏空间，Whh 将历史状态映射到隐藏空间，两者相加后经过 tanh 激活", "PyTorch 的 nn.RNN 封装了这个计算过程，但理解底层实现对调试和改进至关重要。自定义 RNN 可以方便地添加各种变体（如残差连接、层归一化等）", "验证实现正确性：将自己的 RNN 与 PyTorch 官方 nn.RNN 对比，输出应该完全一致（误差 < 1e-6）。这确保了梯度计算和参数更新的正确性"], duration: "2小时", resources: [R_PYTORCH_DOC, { title: "Colah: RNN 详解", url: "https://colah.github.io/posts/2015-08-Understanding-LSTMs/", required: true }, { title: "CS224n: RNN 与语言模型", url: "https://web.stanford.edu/class/cs224n/index.html", required: true }, { title: "D2L: 循环神经网络", url: "https://zh.d2l.ai/chapter_recurrent-neural-networks/rnn.html", required: false }], checkpoint: "能从零实现一个 vanilla RNN，在玩具序列任务上跑通" },
      { day: 5, title: "梯度消失与 LSTM 门控", content: ["vanilla RNN 的致命缺陷是梯度消失：在反向传播时，梯度需要经过多次 tanh 和矩阵乘法，很快衰减到接近 0。这使得模型无法学习长距离依赖（如一段话开头和结尾的关系）", "LSTM（Long Short-Term Memory）通过门控机制解决这个问题：遗忘门 f 控制丢弃多少旧记忆，输入门 i 控制写入多少新信息，输出门 o 控制输出多少记忆。细胞状态 c 是信息高速公路", "LSTM 的关键创新是细胞状态的线性更新：c_t = f * c_{t-1} + i * g。梯度可以沿着细胞状态无衰减地传播，这就是 Constant Error Carousel 的直觉", "在长序列复制任务（如复制 50 步前的输入）上对比 RNN 和 LSTM：RNN 会很快遗忘，LSTM 能准确复制。绘制 loss 曲线可以直观看到差异"], duration: "2小时", resources: [R_CS224N, { title: "Colah: LSTM 详解", url: "https://colah.github.io/posts/2015-08-Understanding-LSTMs/", required: true }, { title: "LSTM 原始论文", url: "https://www.bioinf.jku.at/publications/older/2604.pdf", required: false }, { title: "Understanding LSTM Networks", url: "https://www.google.com/url?q=https%3A%2F%2Fcolah.github.io%2Fposts%2F2015-08-Understanding-LSTMs%2F", required: false }], checkpoint: "能在长序列复制任务中看到 LSTM 显著优于 vanilla RNN" },
      { day: 6, title: "序列建模：pack_padded_sequence", content: ["实际文本长度不一，组成 batch 时需要 padding（填充）到相同长度。但 padding 位置不应参与计算，否则会引入噪声并浪费计算资源", "pack_padded_sequence 将 padded batch 转换为紧凑格式：按实际长度降序排列，移除 padding 位置，只保留有效数据。这样 RNN 不会处理无意义的 padding", "pad_packed_sequence 是逆操作：将紧凑格式还原为 padded batch，用于后续的全连接层或损失计算。两者配合使用，确保训练正确性", "实际流程：tokenize → pad → pack → LSTM → pad → Linear。注意 pack 前必须按长度降序排列，否则会报错"], duration: "1.5小时", resources: [R_PYTORCH_DOC, { title: "pack_padded_sequence 教程", url: "https://suzyahyah.github.io/pytorch/2019/07/01/DataLoader-Pad-Pack-Sequence.html", required: true }, { title: "变长序列处理最佳实践", url: "https://pytorch.org/tutorials/beginner/nlp/sequence_models_tutorial.html", required: false },  { title: "PyTorch动态序列处理", url: "https://github.com/pytorch/pytorch/blob/main/torch/utils/data/dataloader.py", required: false, type: "repo", source: "github" }], checkpoint: "能用 pack/pad 对变长 batch 做 LSTM，且输出正确 shape" },
      { day: 7, title: "文本分类：IMDB / 中文情感", content: ["文本分类是 NLP 最基础的任务：给定一段文本，输出它的类别（如正面/负面情感、新闻分类等）。经典架构：Embedding → RNN → 取隐藏状态 → Linear → Softmax", "取隐藏状态的方式有三种：取最后一个时刻 h[-1]（最常用）、对所有时刻取平均（mean pooling）、对所有时刻取最大值（max pooling）。不同方式适合不同任务", "IMDB 电影评论数据集是情感分类的标准基准：25k 训练 + 25k 测试，正负各半。用 torchtext 可以方便地加载和预处理", "训练技巧：使用预训练词向量初始化 Embedding、Dropout 防止过拟合、梯度裁剪防止梯度爆炸。5 个 epoch 通常能达到 80%+ 准确率"], duration: "2.5小时", resources: [R_PYTORCH_TUT, { title: "torchtext IMDB 数据集", url: "https://pytorch.org/text/stable/datasets.html#imdb", required: true }, { title: "文本分类实战", url: "https://pytorch.org/tutorials/beginner/text_sentiment_ngrams_tutorial.html", required: true }, { title: "中文情感分析数据集", url: "https://github.com/SophonPlus/ChineseNlpCorpus", required: false }], checkpoint: "完整的文本分类脚本 + 评估 acc + 保存权重" },
      { day: 8, title: "序列标注：中文 NER（BiLSTM+CRF）", content: ["命名实体识别（NER）是序列标注任务：给每个 token 打标签，识别出人名、地名、机构名等实体。常用 BIO 标注：B-实体开始、I-实体内部、O-非实体", "BiLSTM（双向 LSTM）同时从左到右和从右到左读取序列，拼接两个方向的隐藏状态。这样每个位置都能看到完整的上下文信息", "CRF（条件随机场）建模标签之间的转移约束：例如 B-PER 后面更可能是 I-PER 而不是 I-LOC。这种约束避免了不合法的标签序列", "评估指标：token-level F1（每个 token 独立评估）和 entity-level F1（整个实体必须完全匹配才正确）。后者更严格但更符合实际需求"], duration: "2.5小时", resources: [R_CS224N, { title: "BiLSTM-CRF 论文", url: "https://arxiv.org/abs/1508.01991", required: true }, { title: "中文 NER 数据集", url: "https://github.com/OYE93/Chinese-NLP-Corpus", required: false }, { title: "CRF 层详解", url: "https://pytorch.org/tutorials/beginner/nlp/advanced_tutorial.html", required: true }], checkpoint: "在中文 NER 数据上训练并得到合理 entity-level F1" },
      { day: 9, title: "Seq2Seq 与机器翻译", content: ["Seq2Seq（序列到序列）是机器翻译、文本摘要等任务的基础架构。Encoder 读取源序列生成上下文向量，Decoder 根据上下文向量自回归地生成目标序列", "Teacher Forcing 是训练技巧：Decoder 每一步的输入使用真实的目标 token（而非自己的预测），加速收敛。但推理时没有真实输入，必须用自己的预测，这导致训练和推理的分布不匹配", "数字翻译任务（如 123 → one two three）是理解 Seq2Seq 的好例子：输入是数字序列，输出是对应的英文单词序列。数据简单但能验证模型是否学会了映射关系", "Greedy 解码每一步选择概率最高的 token，简单但可能不是全局最优。Beam Search 维护 k 个候选序列，每步扩展后保留得分最高的 k 个，能找到更优解"], duration: "2.5小时", resources: [R_D2L, { title: "Seq2Seq 原始论文", url: "https://arxiv.org/abs/1409.3215", required: false }, { title: "PyTorch Seq2Seq 教程", url: "https://pytorch.org/tutorials/intermediate/seq2seq_translation_tutorial.html", required: true }, { title: "Seq2Seq 图解", url: "https://jalammar.github.io/visualizing-neural-machine-translation-mechanics-of-seq2seq-models-with-attention/", required: false }], checkpoint: "能在数字翻译玩具任务上训练并生成合理输出" },
      { day: 10, title: "Beam Search 解码", content: ["Beam Search 是序列生成的标准解码策略：维护一个大小为 k 的候选序列集合（beam），每一步对每个候选序列扩展所有可能的下一个 token，然后从所有扩展中选择得分最高的 k 个继续", "长度归一化解决 Beam Search 偏向短序列的问题：原始得分是 log 概率之和，长序列天然得分更低。归一化公式 score = logP / len^α，α 控制对长度的惩罚强度", "实现要点：需要维护每个候选序列的完整 token 列表和累计得分。遇到 EOS token 时将该序列标记为完成，不再扩展。最终返回得分最高的完成序列", "BLEU（Bilingual Evaluation Understudy）是机器翻译的标准评估指标：计算生成文本与参考译文的 n-gram 重叠度，通常取 1-gram 到 4-gram 的加权平均"], duration: "2小时", resources: [R_CS224N, { title: "Beam Search 详解", url: "https://machinelearningmastery.com/beam-search-decoder-natural-language-processing/", required: false }, { title: "sacreBLEU 评估工具", url: "https://github.com/mjpost/sacrebleu", required: true }, { title: "NLTK BLEU 计算", url: "https://www.nltk.org/api/nltk.translate.bleu_score.html", required: false }], checkpoint: "实现 beam search，并在数字翻译任务上比 greedy 更高 BLEU" },
      { day: 11, title: "注意力机制（加性 / 乘性）", content: ["注意力机制解决 Seq2Seq 的信息瓶颈问题：Encoder 将整个源序列压缩成一个固定长度的向量，长序列时信息损失严重。注意力让 Decoder 在每一步都能动态关注源序列的不同部分", "加性注意力（Bahdanau Attention）：score(h_i, s_t) = v^T tanh(W1 h_i + W2 s_t)，用一个小网络计算相关性得分。计算量较大但表达能力强", "乘性注意力（Luong Attention）：score = h_i^T W s_t / sqrt(d)，用矩阵乘法计算相关性。计算效率高，是 Transformer 使用的方式", "注意力权重可视化：可以画出源序列和目标序列之间的对齐矩阵，直观看到模型在生成每个词时关注了源序列的哪些部分。这对调试和理解模型行为非常有帮助"], duration: "2小时", resources: [R_CS224N, { title: "Bahdanau 注意力论文", url: "https://arxiv.org/abs/1409.0473", required: true }, { title: "注意力机制图解", url: "https://jalammar.github.io/visualizing-neural-machine-translation-mechanics-of-seq2seq-models-with-attention/", required: true }, { title: "Luong 注意力论文", url: "https://arxiv.org/abs/1508.04025", required: false }], checkpoint: "能实现一个加性 attention 并加到 seq2seq decocder 中" },
      { day: 12, title: "TextCNN：用卷积做文本", content: ["TextCNN 是用卷积网络处理文本的经典方法。核心思想：将文本看作一维信号，用不同大小的卷积核（如 2、3、4 个词）捕捉不同长度的 n-gram 特征", "实现步骤：Embedding 层将 token ID 转为向量 → unsqueeze 添加通道维度 → 多个 1D 卷积核并行提取特征 → ReLU 激活 → 最大池化（保留最强信号）→ 拼接 → 全连接分类", "TextCNN 的优势：并行计算效率高（比 RNN 快得多）、能捕捉局部关键模式（如情感词、短语）。缺点是无法建模长距离依赖", "在 IMDB 或中文情感数据集上训练 TextCNN，通常能达到与 LSTM 相当甚至更高的准确率，且训练速度快 2-5 倍。适合对延迟敏感的生产环境"], duration: "2小时", resources: [{ title: "Kim Yoon 2014", url: "https://arxiv.org/abs/1408.5882", required: true }, { title: "TextCNN PyTorch 实现", url: "https://github.com/Shawn1993/cnn-text-classification-pytorch", required: false }, { title: "TextCNN 详解", url: "https://colah.github.io/posts/2014-07-Conv-Nets-Modular/", required: false }], checkpoint: "TextCNN 能在文本分类上跑出与 LSTM 相当或更高的精度" },
      { day: 13, title: "语言模型与困惑度 Perplexity", content: ["语言模型（Language Model）是 NLP 的核心任务：给定前文，预测下一个 token 的概率分布。它是机器翻译、文本生成、语音识别等任务的基础组件", "训练目标是最大化序列的对数似然：loss = -Σ log P(w_t | w_{<t})，即让模型对每个位置的真实下一个词赋予尽可能高的概率。这就是交叉熵损失", "困惑度（Perplexity）是语言模型的标准评估指标：PPL = exp(平均交叉熵)。直觉上，PPL=10 表示模型在每个位置平均需要从 10 个词中猜一个。越低越好", "字符级 LSTM 语言模型：逐字符预测文本，可以生成类似训练语料的新文本。采样温度 τ 控制随机性：τ 小倾向于选择高概率词（保守），τ 大增加随机性（发散）"], duration: "2.5小时", resources: [R_D2L, { title: "语言模型教程", url: "https://pytorch.org/tutorials/beginner/transformer_tutorial.html", required: true }, { title: "Andrej Karpathy: RNN 生成", url: "https://karpathy.github.io/2015/05/21/rnn-effectiveness/", required: true }, { title: "语言模型评估", url: "https://towardsdatascience.com/perplexity-in-language-models-87a196019a94", required: false }], checkpoint: "能用字符级 LSTM 生成一段类似训练语料的文本" },
      { day: 14, title: "综合：中文新闻分类系统", content: ["本练习将串联前 13 天所学：文本预处理 → 词向量 → 序列模型 → 评估指标。选择中文新闻分类任务，因为中文分词和预训练词向量是重要的实践技能", "数据源推荐 THUCNews（清华大学新闻数据集）子集，至少选择 5 个类别（如体育、财经、科技、娱乐、时政）。每类 1000-5000 条，划分训练/验证/测试集", "模型选择：Embedding + BiLSTM + Attention 或 TextCNN。使用预训练词向量（如腾讯词向量）初始化 Embedding，Dropout 防止过拟合，AdamW 优化器", "评估指标：macro-F1（各类别 F1 的平均，对类别不平衡更鲁棒）+ 混淆矩阵（可视化哪些类别容易混淆）。挑 3 个难分类样本做人工分析，理解模型的局限性"], duration: "3小时", resources: [R_CS224N, R_PYTORCH_TUT, { title: "THUCNews 数据集", url: "http://thuctc.thunlp.org/", required: false }, { title: "腾讯中文词向量", url: "https://ai.tencent.com/ailab/nlp/en/embedding.html", required: false }, { title: "中文 NLP 实战", url: "https://github.com/fighting41love/funNLP", required: false }], checkpoint: "完整的训练脚本 + 评估指标 + 3 个 case 分析" }],
  },

  // =====================================================
  // Node 10: nlp-transformer
  // =====================================================
  {
    id: "nlp-transformer",
    name: "Transformer 与预训练模型",
    track: "nlp",
    duration: "2周",
    prerequisites: ["nlp-rnn"],
    status: "locked",
    position: { x: 680, y: 220 },
    description: "自注意力 / Multi-Head / BERT / HuggingFace",
    outcomes: ["熟练使用 HuggingFace", "微调 BERT 做文本分类"],
    relatedIntel: ["001-transformer", "013-huggingface-datasets"],
    relatedTools: ["Hugging Face Transformers"],
    relatedTerms: ["transformer", "self-attention", "attention-mechanism", "encoder", "decoder"],
    dailyTasks: [
      { day: 1, title: "缩放点积注意力", content: ["缩放点积注意力是 Transformer 的核心计算单元。给定查询 Q、键 K、值 V，计算公式为：Attention(Q,K,V) = softmax(QK^T / √d_k) V。除以 √d_k 是为了防止点积过大导致 softmax 梯度消失", "直觉理解：Q 和 K 的点积衡量「查询」和「键」的相似度，softmax 将相似度转为注意力权重，用权重对 V 加权求和得到输出。每个位置都能关注序列中的所有位置", "因果掩码（Causal Mask）用于 Decoder：在 QK^T 矩阵上，将未来位置（j > i）的得分设为 -inf，这样位置 i 只能关注 ≤ i 的位置。这是自回归生成的关键", "数值验证：当 Q=K=V 时，注意力输出应该是输入的加权平均（因为每个位置与自己的相似度最高）。可以用小维度的 tensor 手动计算验证"], duration: "1.5小时", resources: [R_JALAMMAR, R_D2L, { title: "Attention Is All You Need 论文", url: "https://arxiv.org/abs/1706.03762", required: true }, { title: "3Blue1Brown: 注意力机制", url: "https://www.youtube.com/watch?v=eMlx5fFNoYc", required: false }, { title: "Transformer 注意力图解", url: "https://jalammar.github.io/illustrated-transformer/", required: true },  { title: "注意力机制PyTorch实现", url: "https://github.com/pytorch/pytorch/blob/main/torch/nn/functional.py", required: false, type: "repo", source: "github" }], checkpoint: "能从零实现 scaled dot-product attention，并在 toy 输入上数值正确" },
      { day: 2, title: "Multi-Head Attention", content: ["Multi-Head Attention 是将注意力机制并行化：不是只学一套 Q/K/V 变换，而是学 h 套（h 通常为 8 或 16），每套叫做一个「头」。不同头可以关注不同类型的模式（如语法关系、语义相似等）", "实现步骤：将输入线性投影到 h 组 Q/K/V（每组维度为 d_model/h）→ 每组独立做缩放点积注意力 → 拼接所有头的输出 → 线性投影回 d_model 维度", "多头的优势：单头注意力只能关注一种模式，多头可以同时关注多种模式（如一个头关注主谓关系，另一个头关注指代关系）。拼接后信息更丰富", "验证正确性：将自己的实现与 PyTorch 官方的 nn.MultiheadAttention 对比，输出误差应该 < 1e-6。注意官方实现的输入格式是 (seq_len, batch, d_model)"], duration: "2小时", resources: [R_JALAMMAR, { title: "Multi-Head Attention 图解", url: "https://jalammar.github.io/illustrated-transformer/", required: true }, { title: "PyTorch MHA 文档", url: "https://pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html", required: false }, { title: "Transformer 代码实现", url: "https://nlp.seas.harvard.edu/annotated-transformer/", required: true },  { title: "Harvard NLP Annotated Transformer", url: "https://github.com/harvardnlp/annotated-transformer", required: false, type: "repo", source: "github" }], checkpoint: "能从零实现 MHA，并与 PyTorch 官方 MHA 的输出对齐（误差<1e-6）" },
      { day: 3, title: "位置编码（正弦 / 可学习）", content: ["Transformer 的注意力机制不包含位置信息（置换不变性），需要额外注入位置编码。正弦位置编码使用不同频率的 sin/cos 函数：PE(pos,2i) = sin(pos/10000^{2i/d}), PE(pos,2i+1) = cos(pos/10000^{2i/d})", "正弦位置编码的设计巧妙之处：不同维度编码不同频率的位置信息，且 PE(pos+k) 可以表示为 PE(pos) 的线性函数，理论上可以泛化到更长的序列", "可学习位置编码：用 nn.Embedding(max_seq_len, d_model) 让模型自己学习位置表示。BERT 和 GPT 使用这种方式，通常效果与正弦编码相当，但无法泛化到训练时未见过的长度", "可视化：绘制位置编码矩阵的热力图，可以观察到低维度变化快（高频）、高维度变化慢（低频）的模式。将位置编码加到词嵌入上，就包含了位置信息"], duration: "1.5小时", resources: [R_D2L, { title: "位置编码详解", url: "https://d2l.ai/chapter_attention-mechanisms/positional-encoding.html", required: true }, { title: "旋转位置编码 RoPE", url: "https://arxiv.org/abs/2104.09864", required: false }, { title: "位置编码可视化", url: "https://machinelearningmastery.com/a-gentle-introduction-to-positional-encoding-in-transformer-models-part-1/", required: false },  { title: "ALiBi位置编码", url: "https://arxiv.org/abs/2108.12462", required: false, type: "paper", source: "academic" }], checkpoint: "能实现并可视化正弦位置编码" },
      { day: 4, title: "构建一个 Transformer 编码器", content: ["Transformer 编码器由 N 个相同的层堆叠而成，每层包含两个子层：Multi-Head Self-Attention 和前馈网络（FFN）。每个子层都有残差连接和层归一化：LayerNorm(x + Sublayer(x))", "前馈网络（FFN）是两层全连接网络：FFN(x) = Linear2(GELU(Linear1(x)))。中间维度通常是 d_model 的 4 倍（如 512→2048→512），提供非线性变换能力", "GELU 激活函数比 ReLU 更平滑，在 Transformer 中效果更好。它的直觉是「以概率保留输入」，比 ReLU 的硬阈值更柔和", "在 IMDB 文本分类上验证：取第一个 token（[CLS]）的输出，接一个线性层做分类。训练几个 epoch，验证 loss 确实在下降"], duration: "2.5小时", resources: [R_D2L, { title: "Transformer 编码器实现", url: "https://nlp.seas.harvard.edu/annotated-transformer/", required: true }, { title: "GELU 激活函数详解", url: "https://arxiv.org/abs/1606.08415", required: false }, { title: "PyTorch Transformer 教程", url: "https://pytorch.org/tutorials/beginner/transformer_tutorial.html", required: true },  { title: "Transformer-Pytorch实现", url: "https://github.com/SamuraisH/Deep-Learning-Collection/tree/master/Algorithms/Transformer", required: false, type: "repo", source: "github" }], checkpoint: "能从头搭一个 Transformer 编码器，并在文本分类上训起来" },
      { day: 5, title: "解码器与因果掩码", content: ["Transformer 解码器比编码器多一个 Cross-Attention 子层：Masked Self-Attention（关注已生成的输出）→ Cross-Attention（关注编码器输出）→ FFN。每层都有残差连接和层归一化", "因果掩码（Causal Mask）是解码器的关键：在 Self-Attention 中，位置 i 只能关注 ≤ i 的位置，防止「偷看」未来信息。实现时用一个下三角矩阵，将上三角位置设为 -inf", "Teacher Forcing 训练：将整个目标序列一次性输入解码器，利用因果掩码并行计算所有位置的输出。推理时只能自回归地逐个生成", "在数字翻译任务（如 123 → one two three）上验证：训练一个 Encoder-Decoder Transformer，观察它是否能学会数字到英文的映射"], duration: "2小时", resources: [R_JALAMMAR, { title: "Transformer 解码器图解", url: "https://jalammar.github.io/illustrated-transformer/", required: true }, { title: "PyTorch Transformer 文档", url: "https://pytorch.org/docs/stable/generated/torch.nn.Transformer.html", required: false }, { title: "Seq2Seq 与注意力", url: "https://pytorch.org/tutorials/intermediate/seq2seq_translation_tutorial.html", required: false },  { title: "Transformer翻译实战代码", url: "https://github.com/SamuraisH/Deep-Learning-Collection/tree/master/Projects/Transformer-Translation", required: false, type: "repo", source: "github" }], checkpoint: "能实现一个端到端的 Transformer Encoder-Decoder，并在 toy 翻译任务上收敛" },
      { day: 6, title: "BERT 直觉与 MLM", content: ["BERT（Bidirectional Encoder Representations from Transformers）是预训练语言模型的里程碑。核心创新是双向编码：每个位置都能看到整个序列的上下文，而不是只能看到左侧", "掩码语言模型（MLM）是 BERT 的预训练任务：随机 mask 15% 的 token，让模型预测被 mask 的原始 token。这迫使模型学习双向上下文来推断缺失的词", "BERT 与 GPT 的根本区别：GPT 是单向自回归（从左到右生成），适合生成任务；BERT 是双向编码（同时看左右），适合理解任务（分类、问答、NER）", "输入格式：[CLS] + tokens + [SEP] + tokens + [SEP]。[CLS] 的输出用于分类任务，[SEP] 分隔句子对。NSP（下一句预测）是另一个预训练任务，但现代变种常去掉"], duration: "1.5小时", resources: [{ title: "BERT 论文", url: "https://arxiv.org/abs/1810.04805", required: true }, { title: "BERT 原理解析", url: "https://jalammar.github.io/illustrated-bert/", required: true }, { title: "GPT vs BERT 对比", url: "https://lilianweng.github.io/posts/2019-01-31-lm/", required: false }, { title: "BERT 可视化", url: "https://jalammar.github.io/illustrated-bert/", required: false },  { title: "BERT-Pytorch实现", url: "https://github.com/lucidrains/bert-pytorch", required: false, type: "repo", source: "github" }], checkpoint: "能用 3 句话讲清 BERT 与 GPT 的核心差异" },
      { day: 7, title: "HuggingFace Tokenizer 与加载", content: ["HuggingFace Transformers 是 NLP 领域最重要的开源库，提供了数千个预训练模型的统一接口。安装只需 pip install transformers", "Tokenizer 负责文本到数字的转换：分词、映射到词表 ID、添加特殊 token（[CLS]、[SEP]、[PAD]）。不同模型使用不同的 tokenizer，必须匹配", "输出包含三个关键张量：input_ids（token ID 序列）、token_type_ids（区分句子对中的第一句和第二句）、attention_mask（标记哪些位置是 padding）", "加载预训练模型：BertModel.from_pretrained('bert-base-uncased') 会自动下载并加载权重。输入 tokenizer 的输出，得到最后一层隐藏状态 (batch, seq_len, hidden_size)"], duration: "2小时", resources: [R_HF_TRANSFORMERS, { title: "HuggingFace 快速入门", url: "https://huggingface.co/docs/transformers/quicktour", required: true }, { title: "BERT Tokenizer 详解", url: "https://huggingface.co/docs/transformers/model_doc/bert", required: false }, { title: "HuggingFace 课程", url: "https://huggingface.co/learn/nlp-course", required: true },  { title: "HuggingFace Transformers代码库", url: "https://github.com/huggingface/transformers", required: false, type: "repo", source: "github" }], checkpoint: "能 load 一个预训练 BERT，编码一句话拿到 [CLS] 向量" },
      { day: 8, title: "微调 BERT 做文本分类", content: ["微调（Fine-tuning）是在预训练模型上添加任务特定的层（如分类头），用下游任务数据继续训练。BERT 的 [CLS] token 输出接一个线性层就是最简单的分类器", "两种训练方式：使用 Trainer API（高层封装，代码简洁）或手写训练循环（更灵活，便于调试）。推荐先用 Trainer 快速验证，再手写实现理解细节", "学习率调度很重要：通常用线性 warmup（前 10% 步数线性增加学习率）+ 线性衰减。warmup 防止初始梯度过大破坏预训练权重", "对比实验：预训练 BERT 微调 vs 随机初始化从头训。在小数据集上（如 1000 条），微调效果远好于从头训，因为预训练已经学到了语言知识"], duration: "2.5小时", resources: [R_HF_COURSE, { title: "BERT 微调教程", url: "https://huggingface.co/docs/transformers/training", required: true }, { title: "Trainer API 文档", url: "https://huggingface.co/docs/transformers/main_classes/trainer", required: false }, { title: "学习率调度策略", url: "https://huggingface.co/docs/transformers/main_classes/optimizer_schedules", required: false },  { title: "BERT微调代码库", url: "https://github.com/huggingface/transformers/tree/main/examples", required: false, type: "repo", source: "github" }], checkpoint: "在 IMDB 子集上微调 bert-base-uncased，val_acc > 90%" },
      { day: 9, title: "中文 BERT 与分词", content: ["中文 BERT 的选择：bert-base-chinese（Google 训练的中文模型）、hfl/chinese-bert-wwm（哈工大的全词掩码版本，效果通常更好）、chinese-roberta-wwm-ext", "中文分词的特殊性：BERT 使用字级别（character-level）分词，每个汉字是一个 token。这避免了中文分词错误，但增加了序列长度", "全词掩码（Whole Word Masking, WWM）：原始 BERT 的 MLM 随机 mask 单个字，WWM 确保同一个词的所有字一起被 mask。例如「北京大学」要么全部 mask，要么都不 mask", "中文文本分类流程与英文相同：加载中文 BERT → 用中文 tokenizer 编码 → 微调分类头。在中文新闻数据集上训练，评估 macro-F1"], duration: "2小时", resources: [R_HF_TRANSFORMERS, { title: "中文 BERT 模型列表", url: "https://huggingface.co/models?language=zh&sort=trending", required: true }, { title: "哈工大中文 BERT", url: "https://github.com/ymcui/Chinese-BERT-wwm", required: false }, { title: "中文 NLP 数据集", url: "https://github.com/brightmart/nlp_chinese_corpus", required: false },  { title: "RoBERTa中文预训练模型", url: "https://github.com/ymcui/Chinese-BERT-wwm", required: false, type: "repo", source: "github" }], checkpoint: "能在中文数据集上用中文 BERT 完成微调并保存权重" },
      { day: 10, title: "Prompt Engineering 与 Few-shot", content: ["Prompt Engineering 是使用大语言模型的新范式：不微调模型，而是通过精心设计的提示（prompt）引导模型完成任务。这对数据稀缺的场景特别有用", "Few-shot Learning：在 prompt 中放几个示例，让模型学会任务格式。例如：'这是一篇体育新闻：足球比赛... → 体育\n这是一篇财经新闻：股票上涨... → 财经\n这是一篇科技新闻：{input} →'", "采样参数控制生成行为：temperature 控制随机性（低=保守，高=发散）、top-p 核采样（只从累积概率前 p 的 token 中采样）、top-k（只从概率最高的 k 个 token 中采样）", "In-context Learning 是大模型的独特能力：不需要梯度更新，仅通过 prompt 中的示例就能「学习」新任务。模型越大、示例越相关，效果越好"], duration: "2小时", resources: [R_HF_TRANSFORMERS, { title: "Prompt Engineering 指南", url: "https://www.promptingguide.ai/", required: true }, { title: "GPT-2 文本生成", url: "https://huggingface.co/docs/transformers/model_doc/gpt2", required: false }, { title: "Few-shot Learning 综述", url: "https://arxiv.org/abs/2005.14165", required: false }, { title: "OpenAI Prompt 最佳实践", url: "https://platform.openai.com/docs/guides/prompt-engineering", required: false },  { title: "Chain-of-Thought提示技术", url: "https://arxiv.org/abs/2201.11903", required: false, type: "paper", source: "academic" }], checkpoint: "能用一个预训练 Causal LM（如 distilgpt2）做 few-shot 生成式任务演示" },
      { day: 11, title: "GLUE 基准评估", content: ["GLUE（General Language Understanding Evaluation）是 NLP 模型的标准评估基准，包含 9 个任务：分类（MNLI、QQP、SST-2）、相似度（MRPC、STS-B）、问答（QNLI、RTE、WNLI）等", "MRPC（Microsoft Research Paraphrase Corpus）判断两个句子是否语义等价。这是一个二分类任务，适合快速验证模型的语义理解能力", "使用 HuggingFace Datasets 库加载 GLUE 数据：load_dataset('glue', 'mrpc') 自动下载并格式化。tokenizer 处理句对任务时需要将两个句子用 [SEP] 连接", "评估指标：MRPC 使用 F1 和准确率。训练完成后在测试集上评估，记录结果。GLUE 排行榜（gluebenchmark.com）可以对比不同模型的效果"], duration: "2小时", resources: [R_HF_COURSE, { title: "GLUE 基准介绍", url: "https://gluebenchmark.com/", required: true }, { title: "HuggingFace GLUE 教程", url: "https://huggingface.co/docs/transformers/tasks/sequence_classification", required: true }, { title: "SuperGLUE（更难的基准）", url: "https://super.gluebenchmark.com/", required: false },  { title: "自然语言推理SNLI数据集", url: "https://nlp.stanford.edu/projects/snli/", required: false, type: "repo", source: "github" }], checkpoint: "在 MRPC 上完成一次完整训练并报告 F1 指标" },
      { day: 12, title: "问答（Extractive QA / SQuAD）", content: ["抽取式问答（Extractive QA）：给定上下文和问题，从上下文中抽取答案片段。模型预测答案的起始位置 start 和结束位置 end，对应位置的 token 就是答案", "SQuAD（Stanford Question Answering Dataset）是 QA 的标准数据集。每条样本包含：context（段落）、question（问题）、answer_text（答案文本）、answer_start（答案起始位置）", "微调方式：BertForQuestionAnswering 输出 start_logits 和 end_logits，损失函数是交叉熵：loss = CE(start_logits, y_start) + CE(end_logits, y_end)", "评估指标：Exact Match（答案完全匹配的比例）和 F1（答案 token 与真实答案的 token 重叠度）。通常 F1 更宽容，因为部分正确的答案也有价值"], duration: "2.5小时", resources: [R_HF_COURSE, { title: "SQuAD 数据集", url: "https://rajpurkar.github.io/SQuAD-explorer/", required: true }, { title: "BERT QA 微调教程", url: "https://huggingface.co/docs/transformers/tasks/question_answering", required: true }, { title: "SQuAD 2.0（含不可回答问题）", url: "https://arxiv.org/abs/1806.03822", required: false },  { title: "DrQA阅读理解论文", url: "https://arxiv.org/abs/1704.00051", required: false, type: "paper", source: "academic" }], checkpoint: "能在 SQuAD 小数据上训练一个 QA 模型，并可交互问答 demo" },
      { day: 13, title: "模型蒸馏 / 量化与加速", content: ["模型蒸馏（Knowledge Distillation）：用大模型（教师）的输出训练小模型（学生），让学生学习教师的「知识」。DistilBERT 就是 BERT 的蒸馏版本，参数减少 40%，速度快 60%，保留 97% 性能", "动态量化（Dynamic Quantization）：将模型权重从 float32 转为 int8，推理时动态量化激活值。精度损失很小，但模型体积减半，CPU 推理速度提升 2-4 倍", "ONNX 导出：将 PyTorch 模型转为 ONNX 格式，可以用 ONNX Runtime 推理。ONNX Runtime 对 Transformer 做了大量优化（如算子融合、量化支持），速度通常比原生 PyTorch 快", "对比实验：在同一台机器上测试原始 BERT、DistilBERT、量化后的延迟。记录 batch_size=1 的端到端推理时间，选择满足需求的方案"], duration: "2小时", resources: [R_HF_TRANSFORMERS, { title: "DistilBERT 论文", url: "https://arxiv.org/abs/1910.01108", required: true }, { title: "PyTorch 量化教程", url: "https://pytorch.org/docs/stable/quantization.html", required: true }, { title: "ONNX Runtime 文档", url: "https://onnxruntime.ai/docs/", required: false }, { title: "HuggingFace Optimum（优化加速）", url: "https://huggingface.co/docs/optimum/", required: false }], checkpoint: "能把 DistilBERT 量化并在 CPU 上跑出显著加速" },
      { day: 14, title: "综合：部署一个 BERT 文本分类服务", content: ["本练习将串联前 13 天所学：预训练模型加载 → 微调 → 推理优化 → 服务部署 → UI 展示。这是 NLP 工程师的核心技能之一", "在中文分类数据集上微调 BERT：选择 bert-base-chinese 或 chinese-bert-wwm，用 Trainer API 训练。保存模型权重和 tokenizer 到本地", "FastAPI 构建推理服务：POST /predict 接收文本，返回预测类别和置信度。使用 pipeline 简化推理代码，添加输入校验和错误处理", "Streamlit 构建交互界面：输入框输入文本 → 调用 FastAPI 接口 → 显示预测结果。Dockerfile 封装整个服务，docker compose up 一键部署"], duration: "3小时", resources: [R_HF_TRANSFORMERS, R_FASTAPI, R_STREAMLIT, { title: "HuggingFace 模型部署", url: "https://huggingface.co/docs/transformers/serialization", required: true }, { title: "FastAPI + HuggingFace 示例", url: "https://huggingface.co/docs/transformers/quicktour", required: false }, { title: "Streamlit + ML 教程", url: "https://docs.streamlit.io/library/get-started", required: false }], checkpoint: "Docker 化的中文文本分类服务，可浏览器交互使用" }],
  },

  // =====================================================
  // Node 11: llm-finetune
  // =====================================================
  {
    id: "llm-finetune",
    name: "LLM 微调与对齐",
    track: "nlp",
    duration: "2周",
    prerequisites: ["nlp-transformer"],
    status: "locked",
    position: { x: 680, y: 440 },
    description: "LoRA / QLoRA / 聊天格式 / 数据准备 / 评估",
    outcomes: ["能在消费级 GPU 上微调一个 7B 模型", "搭建聊天 demo"],
    relatedIntel: ["003-lora-qlora", "015-rlhf", "013-huggingface-datasets"],
    relatedTools: ["Hugging Face Transformers", "LangChain"],
    relatedTerms: ["lora", "fine-tuning", "pre-training", "rlhf", "qlora"],
    dailyTasks: [
      { day: 1, title: "LLM 生态与模型规模", content: ["HuggingFace 模型卡是了解模型的第一入口，上面展示了架构信息、训练细节、许可协议和社区评价。重点关注 mistralai/Mistral-7B-v0.1、TinyLlama/TinyLlama-1.1B-Chat-v1.0 等典型模型", "理解模型规模的关键维度：参数量决定了显存需求，训练 token 数影响模型能力上限，上下文长度决定了能处理的最长文本，许可协议决定了能否商用", "本地硬件评估：一张 24GB 显卡用 fp16 加载 7B 模型大约占用 13GB 显存；如果显存不足，可以通过 4-bit 或 8-bit 量化来降低显存占用，从而在消费级显卡上运行更大模型", "选择一个轻量模型做入门演示：TinyLlama 1.1B 是资源最友好的选择，适合快速验证流程，之后再切换到更大的模型"], duration: "1.5小时", resources: [R_HF_TRANSFORMERS, { title: "HuggingFace Open LLM Leaderboard", url: "https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard", required: false }, { title: "LLM 模型参数量与显存计算指南", url: "https://huggingface.co/docs/transformers/perf_train_gpu_one", required: false }], checkpoint: "能在 HuggingFace 上找到 ≤ 3B 的开源中文/英文模型，并成功 AutoModelForCausalLM.from_pretrained 加载" },
      { day: 2, title: "LoRA：Low-Rank Adaptation", content: ["LoRA 的核心直觉：不直接微调巨大的权重矩阵 W，而是将更新量分解为两个低秩矩阵的乘积 W = W_pretrained + B×A，其中 A 的维度为 r×d，B 的维度为 d×r，r 远小于 d，因此只需训练极少量参数", "使用 HuggingFace PEFT 库实现 LoRA：通过 LoraConfig 配置秩 r、缩放因子 lora_alpha、目标模块 target_modules（通常选择注意力层的 q_proj 和 v_proj）、dropout 比例等超参数", "调用 get_peft_model 将 LoRA 层注入到预训练模型中，然后通过 print_trainable_parameters() 验证可训练参数占总参数的比例", "实际效果：LoRA 微调的可训练参数通常不到总参数的 1%，显存占用和训练时间大幅减少，但性能接近全参数微调"], duration: "2小时", resources: [R_HF_PEFT, R_LORA_PAPER, { title: "HuggingFace PEFT 示例代码", url: "https://github.com/huggingface/peft/tree/main/examples", required: false }, { title: "LoRA 直觉解释（英文博客）", url: "https://magazine.sebastianraschka.com/p/lora-and-dora-from-scratch", required: false }], checkpoint: "能把任何一个 HF CausalLM 用 PEFT LoRA 包装，打印 trainable params < 1%" },
      { day: 3, title: "4-bit 量化 + QLoRA", content: ["BitsAndBytes 库提供了 4-bit 和 8-bit 量化能力，可以将模型权重从 fp16 压缩到 4-bit，使显存占用降低到原来的约 1/4，从而在消费级显卡上运行 7B 甚至更大的模型", "关键配置项：load_in_4bit 启用 4-bit 加载，bnb_4bit_use_double_quant 启用双重量化（进一步压缩），bnb_4bit_quant_type='nf4' 使用 NormalFloat4 格式（对正态分布权重更优），bnb_4bit_compute_dtype 指定计算时的数据类型", "QLoRA 是 4-bit 量化 + LoRA 的组合：先将模型以 4-bit 加载以节省显存，再附加 LoRA 适配器进行微调。这样即使在 24GB 显卡上也能微调 7B 模型", "实际操作流程：安装 bitsandbytes，配置量化参数，加载模型后检查显存占用，确认模型可以正常进行推理"], duration: "2小时", resources: [R_HF_PEFT, { title: "QLoRA 论文", url: "https://arxiv.org/abs/2305.14314", required: true }, { title: "bitsandbytes 文档", url: "https://huggingface.co/docs/bitsandbytes/index", required: false }, { title: "HuggingFace 量化指南", url: "https://huggingface.co/docs/transformers/quantization", required: false }], checkpoint: "能在 24GB GPU 上成功 4bit 量化加载一个 7B 模型并跑一次 generate" },
      { day: 4, title: "聊天数据格式 ChatML", content: ["ChatML 是一种标准化的多轮对话格式，每条消息由 role（system/user/assistant）和 content 组成。system 消息设定模型行为，user 是用户输入，assistant 是模型回复", "HuggingFace 的 tokenizer 提供了 apply_chat_template 方法，它能根据模型的预训练格式自动将对话消息列表转换为正确的输入字符串，不同模型（如 Llama、Mistral、Qwen）有不同的模板", "训练时的 loss mask 策略：只对 assistant 段的 token 计算交叉熵损失，system 和 user 段的 token 被 mask 掉，这样模型只学习如何生成回复而不是模仿用户输入", "数据质量保障：需要清洗掉截断的回复、低质量的样本、以及指令与回答不一致的数据，这些噪声样本会严重影响微调效果"], duration: "1.5小时", resources: [R_HF_TRANSFORMERS, { title: "HuggingFace Chat 模板指南", url: "https://huggingface.co/docs/transformers/chat_templating", required: true }, { title: "OpenAI ChatML 格式说明", url: "https://github.com/openai/openai-python/blob/main/chatml.md", required: false }], checkpoint: "能用 apply_chat_template 把一组对话转为模型可训练的 text" },
      { day: 5, title: "准备一个自定义微调数据集", content: ["根据目标场景构造或下载 1k-10k 条指令-回答对。常见场景包括编程助手（代码生成+解释）、中文问答、文本摘要、翻译等。数据质量比数量更重要", "数据格式通常为 JSONL：每行一个 JSON 对话样本，包含 conversations 数组或 prompt-response 字段对。确保格式与后续 SFTTrainer 的输入要求一致", "使用 HuggingFace Datasets 库加载数据：从 JSONL 文件或 Python 列表创建 Dataset 对象，然后按比例划分训练集和验证集（通常 95/5 或 90/10）", "做数据分析：统计 prompt+response 的 token 长度分布，确定合理的 max_seq_length，过长的样本需要截断或过滤，过短的样本可能信息量不足"], duration: "2小时", resources: [{ title: "HuggingFace Datasets", url: "https://huggingface.co/docs/datasets/", required: true }, { title: "Alpaca 数据集（指令微调经典数据）", url: "https://huggingface.co/datasets/tatsu-lab/alpaca", required: false }, { title: "BELLE 中文指令数据", url: "https://github.com/LianjiaTech/BELLE", required: false }], checkpoint: "有一个自定义的对话数据集被加载成 Dataset，并能 tokenize 成 features" },
      { day: 6, title: "SFTTrainer 训练循环", content: ["SFTTrainer（来自 TRL 库）是专门为监督微调设计的训练器，它封装了常见的训练逻辑：自动处理聊天模板、支持 PEFT 配置、内置梯度累积和混合精度训练", "关键训练参数：output_dir 指定输出目录，per_device_train_batch_size 控制每设备批大小，gradient_accumulation_steps 实现梯度累积以模拟大 batch，learning_rate 通常设为 2e-4，num_train_epochs 控制训练轮数", "优化器选择：paged_adamw_8bit 是 QLoRA 场景下的推荐选择，它使用分页机制管理优化器状态，进一步节省显存。同时开启 fp16 或 bf16 混合精度训练", "训练过程中观察 loss 曲线：正常情况下 loss 应该平稳下降。如果 loss 不降或震荡剧烈，可能需要调整学习率或数据质量"], duration: "3小时", resources: [{ title: "TRL 文档", url: "https://huggingface.co/docs/trl/", required: true }, { title: "HuggingFace Trainer 参数文档", url: "https://huggingface.co/docs/transformers/main_classes/trainer", required: false }, { title: "SFTTrainer 微调实战教程", url: "https://huggingface.co/docs/trl/sft_trainer", required: true }], checkpoint: "成功运行一次微调（1 epoch 即可），loss 曲线下降" },
      { day: 7, title: "模型合并与保存", content: ["微调完成后有两种保存方式：仅保存 LoRA adapter（几百 MB，便于分享和版本管理），或者将 adapter 权重合并回基础模型得到一个完整的独立模型", "合并操作使用 PEFT 库的 PeftModel.from_pretrained 加载 adapter，然后调用 merge_and_unload() 将 LoRA 权重融合进基础权重。合并后的模型不再需要 PEFT 库即可直接加载", "保存合并模型时需要同时保存模型权重和 tokenizer，确保 tokenizer 配置（如 chat_template）也被保留。可选推送到 HuggingFace Hub 方便分享", "合并后加载验证：用 AutoModelForCausalLM.from_pretrained 直接加载合并模型，对比微调前后的生成效果，确认微调生效"], duration: "1.5小时", resources: [R_HF_PEFT, { title: "PEFT 模型合并指南", url: "https://huggingface.co/docs/peft/tutorial/peft_model_config", required: false }, { title: "HuggingFace Hub 模型上传指南", url: "https://huggingface.co/docs/hub/uploading", required: false }], checkpoint: "能产出一个可以独立加载的合并模型，并与原始 base 模型生成对比样本" },
      { day: 8, title: "推理 pipeline 与采样参数", content: ["Transformers 的 pipeline 是最简单的推理接口，封装了 tokenizer 编码、模型生成、tokenizer 解码的完整流程，只需指定模型路径即可使用", "采样参数对生成质量影响巨大：temperature 控制随机性（低值保守、高值发散），top_p 和 top_k 限制候选 token 范围，repetition_penalty 抑制重复生成，max_new_tokens 控制最大生成长度", "通过对比实验理解参数效果：用同一 prompt 分别测试 temperature=0.1（保守精确）、0.7（平衡）、1.5（发散创意）的输出差异，直观感受参数的影响", "流式生成可以提升用户体验：使用 TextIteratorStreamer 实现逐 token 输出，用户无需等待完整生成即可看到结果，这对聊天应用尤其重要"], duration: "2小时", resources: [R_HF_TRANSFORMERS, { title: "HuggingFace 生成策略文档", url: "https://huggingface.co/docs/transformers/generation_strategies", required: true }, { title: "TextIteratorStreamer 使用示例", url: "https://huggingface.co/docs/transformers/internal/generation_utils", required: false }], checkpoint: "写一个交互式 generate 脚本，支持系统提示 + 用户多轮输入" },
      { day: 9, title: "评估：BLEU / ROUGE / 人工成对比较", content: ["自动评估指标能快速量化模型性能：ROUGE 适用于摘要任务（衡量生成文本与参考文本的重叠程度），BLEU 和 CHRF 适用于翻译任务（衡量 n-gram 匹配度）", "自动指标的局限性：它们只能衡量表面的词汇重叠，无法评估语义正确性、逻辑连贯性和事实准确性。因此自动指标只能作为参考，不能完全替代人工评估", "人工评估设计：准备 30 条以上测试样本，让 base 模型和微调模型分别生成回答，采用双盲比较（评估者不知道哪个是微调模型），减少主观偏差", "评估报告应该包含：自动指标的数值对比、人工评估的 win/tie/lose 比例、以及典型的好/坏案例分析，帮助理解微调的效果和不足"], duration: "2小时", resources: [{ title: "sacreBLEU", url: "https://github.com/mjpost/sacrebleu", required: false }, { title: "rouge-score Python 库", url: "https://pypi.org/project/rouge-score/", required: false }, { title: "Chatbot Arena 评估方法参考", url: "https://chat.lmsys.org/", required: false }], checkpoint: "能在测试集上得到一份 base vs 微调的评估表（BLEU/ROUGE + 人工比例）" },
      { day: 10, title: "数据质量与超参搜索", content: ["LoRA 超参搜索是提升微调效果的关键：秩 r 控制适配器容量（8/16/64，越大表达能力越强但参数越多），lora_alpha 通常设为 2*r，target_modules 可以只选 q/v 或扩展到 q/k/v/o/gate 等所有线性层", "学习率和 batch size 是最重要的训练超参：学习率常用 1e-4 到 5e-5 的范围，batch size 受 GPU 显存限制，可通过梯度累积来等效增大 batch size", "数据质量优先原则：1000 条精心清洗和标注的高质量数据，往往比 10 万条未经筛选的低质量数据效果更好。投入时间在数据清洗上是值得的", "使用 wandb（Weights & Biases）记录实验：自动记录 loss 曲线、学习率变化、生成样本等，方便对比不同超参配置的效果"], duration: "2小时", resources: [R_HF_PEFT, { title: "Weights & Biases 文档", url: "https://docs.wandb.ai/", required: false }, { title: "LoRA 超参调优经验（英文博客）", url: "https://magazine.sebastianraschka.com/p/lora-and-dora-from-scratch", required: false }], checkpoint: "有至少 2 组实验（不同 r 或不同 lr）的对比记录" },
      { day: 11, title: "DPO：直接偏好优化", content: ["DPO（Direct Preference Optimization）是一种无需强化学习的对齐方法，它直接使用人类偏好数据来优化模型，让模型对人类偏好的回答赋予更高概率", "偏好数据格式：每条样本包含一个 prompt 和两个回答 chosen（人类偏好的）和 rejected（人类不喜欢的）。数据来源可以是人工标注或从更强模型生成", "DPO 的核心原理：通过对比 chosen 和 rejected 的似然比来更新模型参数，隐式地优化了一个奖励函数。超参数 beta 控制偏离参考模型的程度，通常设为 0.1 到 0.5", "DPO 通常在 SFT 之后进行：先用 SFT 让模型学会基本的指令跟随能力，再用 DPO 进一步对齐人类偏好，形成 SFT + DPO 的两阶段训练流程"], duration: "2小时", resources: [{ title: "TRL DPO 文档", url: "https://huggingface.co/docs/trl/dpo_trainer", required: true }, { title: "DPO 论文", url: "https://arxiv.org/abs/2305.18290", required: true }, { title: "Anthropic HH-RLHF 偏好数据", url: "https://huggingface.co/datasets/Anthropic/hh-rlhf", required: false }], checkpoint: "能在一个小偏好数据集上跑通一次 DPO，并能看出偏好倾向变化" },
      { day: 12, title: "vLLM / TGI 推理加速（概念）", content: ["vLLM 是目前最流行的高性能推理引擎，核心创新是 PagedAttention 机制：将 KV Cache 分页管理，避免内存碎片，显著提升 GPU 显存利用率和吞吐量", "连续批处理（Continuous Batching）是另一个关键优化：传统推理引擎需要等一个 batch 全部完成才能处理下一个，而 vLLM 可以在请求完成时立即插入新请求，大幅提升 GPU 利用率", "vLLM 提供 OpenAI 兼容的 API 接口，这意味着用 vLLM 部署的模型可以直接被 OpenAI SDK 调用，迁移成本极低", "Text Generation Inference（TGI）是 HuggingFace 的推理服务方案，功能类似但架构不同。如果本机 GPU 资源不足，可以只学习概念而不实际部署"], duration: "1.5小时", resources: [{ title: "vLLM 文档", url: "https://docs.vllm.ai/", required: false }, { title: "vLLM PagedAttention 论文", url: "https://arxiv.org/abs/2309.06180", required: false }, { title: "HuggingFace TGI 文档", url: "https://huggingface.co/docs/text-generation-inference/", required: false }], checkpoint: "能解释为什么 vLLM 比原生 HF generate 更高效" },
      { day: 13, title: "聊天 Demo：Gradio / Streamlit", content: ["Gradio 是最快速搭建 ML Demo 的工具，几行代码就能创建一个带聊天界面的 Web 应用。ChatInterface 组件内置了消息历史管理和流式输出支持", "实现 generate_fn 函数：接收用户消息和对话历史，调用 pipeline 或 model.generate 生成回复，返回助手回复。需要正确处理 system prompt 和多轮上下文", "部署方式：最简单的是直接运行 Python 脚本，Gradio 会启动一个本地 Web 服务器。如果需要持久化部署，可以使用 Dockerfile 打包模型和代码", "在浏览器中测试：验证多轮对话能力、system prompt 是否生效、生成速度是否可接受、长文本输入是否正常"], duration: "2小时", resources: [R_GRADIO, { title: "Gradio Chatbot 组件文档", url: "https://www.gradio.app/docs/gradio/chatbot", required: true }, { title: "Streamlit Chat 文档", url: "https://docs.streamlit.io/library/api-reference/chat", required: false }], checkpoint: "有一个浏览器可打开的聊天 Demo，能多轮对话" },
      { day: 14, title: "综合：构建一个垂直领域小助手", content: ["选择一个具体的垂直场景：公司内部文档问答、编程助手、学习辅导、客服机器人等。场景越具体，数据准备和评估越有针对性", "准备领域数据：收集 1k-10k 条该场景下的指令-回答对，可以结合真实数据和合成数据（用更强模型生成再人工筛选），确保数据覆盖场景的多样性", "完整微调流程：选择合适的基座模型（TinyLlama 适合资源受限，Mistral-7B 适合有 GPU 的场景），使用 4-bit + LoRA 微调 2-3 个 epoch", "端到端验证：合并模型后构建 Gradio 聊天 Demo，在 30 条测试样例上进行人工评估，对比 base 模型和微调模型的 win 率，撰写包含训练配置、推理部署和评估结果的 README"], duration: "3小时", resources: [R_HF_PEFT, R_HF_TRANSFORMERS, R_GRADIO, { title: "HuggingFace 微调最佳实践", url: "https://huggingface.co/docs/transformers/training", required: false }], checkpoint: "一个可运行的聊天小助手 + 评估报告 + 部署说明" }],
  },

  // =====================================================
  // Node 12: project-capstone
  // =====================================================
  {
    id: "project-capstone",
    name: "综合实战项目",
    track: "project",
    duration: "2周",
    prerequisites: ["cv-detection", "llm-finetune", "docker-basic"],
    status: "locked",
    position: { x: 340, y: 620 },
    description: "从选题到上线：需求/数据/模型/部署/文档/答辩",
    outcomes: ["独立完成可演示项目", "产出简历可用作品集"],
    relatedIntel: ["002-yolo", "003-lora-qlora", "007-docker", "018-mlflow"],
    relatedTools: ["Docker", "MLflow", "Streamlit", "Gradio"],
    relatedTerms: ["mlops", "deployment", "monitoring"],
    dailyTasks: [
      { day: 1, title: "选题与需求文档", content: ["从 CV（图像分类/目标检测/分割）、NLP（文本分类/摘要/问答）、多模态（图文检索/VLM 应用）三个大方向中各构思一个候选课题，评估其数据可得性、技术难度与创新空间", "为每个候选方向撰写一页简要说明，明确目标用户画像、系统输入输出格式、核心评估指标（如准确率、延迟、吞吐量）以及现有竞品或基线方案的差距分析", "综合考虑团队技能栈、数据获取难度和个人兴趣，从中选定一个方向并撰写正式 PRD 文档，包含 Feature List、MVP 最小可行范围、里程碑计划和风险清单", "在 GitHub 上创建新项目仓库，撰写 README 初稿，选择开源协议（MIT 或 Apache 2.0），并设置好 .gitignore 和目录结构骨架"], duration: "2小时", resources: [{ title: "产品经理 PRD 模板", url: "https://www.productplan.com/glossary/product-requirements-document/", required: false }, { title: "GitHub README 最佳实践", url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes", required: false }, { title: "选择开源许可证", url: "https://choosealicense.com/", required: false }], checkpoint: "产出一份 PRD.md 与 GitHub 仓库（含 MIT/Apache 协议 + README）" },
      { day: 2, title: "数据收集与标注方案", content: ["梳理可用数据来源：公开数据集（Kaggle、HuggingFace Datasets、学术论文附带数据）、网络爬虫自行采集、利用大模型做数据合成、或使用团队自有业务数据，评估每种来源的规模与质量", "评估数据的许可证与合规性：是否允许商用、是否包含个人隐私需要脱敏处理、类别分布是否存在严重不平衡需要重新采样或标注补充", "选择合适的标注工具并搭建标注环境：CV 方向推荐 Label Studio 或 CVAT，NLP 方向推荐 Argilla 或 Doccano，配置标注界面和导出格式（如 COCO、YOLO、CSV）", "制定标注质量保障方案：双人标注计算 IAA（Inter-Annotator Agreement）一致性、设定抽样质检比例（如每批次抽检 10%）、编写标注规范文档明确边界情况的处理规则"], duration: "2小时", resources: [{ title: "Label Studio", url: "https://labelstud.io/", required: false }, { title: "CVAT 标注平台", url: "https://www.cvat.ai/", required: false }, { title: "Argilla 数据标注", url: "https://docs.argilla.io/", required: false }, { title: "HuggingFace Datasets", url: "https://huggingface.co/docs/datasets/", required: false }], checkpoint: "至少 200 条（CV/NLP）或 1000 条（LLM）已标注样本 + 标注规范文档" },
      { day: 3, title: "技术选型与 Baseline", content: ["根据项目方向选择 2-3 个基线模型进行对比，例如 CV 方向可选 YOLOv8n、ResNet-18/ResNet-50，NLP 方向可选 BERT-base、DistilBERT，多模态方向可选 CLIP、BLIP 等经典模型", "整理训练环境配置：确认 GPU 型号与显存限制、PyTorch/TensorFlow 版本兼容性、CUDA 版本，并在 requirements.txt 中固定所有依赖包的版本号以确保可复现性", "规范项目目录结构：将数据处理脚本集中放在 scripts/ 目录、模型相关配置（超参数、训练参数）放在 configs/ 目录、训练输出放在 outputs/ 目录", "记录第一个基线实验（第 0 号实验）的完整结果到 baselines.md，包括训练时长、验证集指标、模型参数量等关键信息作为后续优化的参照基准"], duration: "2.5小时", resources: [{ title: "PyTorch 官方教程", url: "https://pytorch.org/tutorials/", required: true }, { title: "HuggingFace Transformers", url: "https://huggingface.co/docs/transformers/", required: false }, { title: "ResNet 论文", url: "https://arxiv.org/abs/1512.03385", required: false }], checkpoint: "baseline 模型跑通并产出 metrics.json + logs" },
      { day: 4, title: "数据增强与数据版本", content: ["根据数据特点设计数据增强策略：CV 方向可使用几何变换（旋转/翻转/裁剪）、颜色抖动（亮度/对比度/饱和度）、Mosaic/MixUp；NLP 方向可使用回译增强、同义词替换、随机删除/插入", "引入 DVC（Data Version Control）管理数据版本：初始化 DVC 项目、将数据目录加入追踪、配置远程存储（如 S3/GCS/本地路径）、通过 Git 记录 .dvc 元数据文件实现数据与代码的版本同步", "编写标准化的数据处理流水线脚本，实现从原始数据到训练样本的一键转换，包括数据清洗（去重/去噪）、格式统一、特征提取、划分训练/验证/测试集等步骤", "随机抽取一批处理后的样本进行可视化检查，对比增强前后的效果，确保数据增强没有引入语义错误（如翻转文字、裁剪掉关键目标）"], duration: "2.5小时", resources: [{ title: "DVC 官方文档", url: "https://dvc.org/", required: false }, { title: "Albumentations 数据增强库", url: "https://albumentations.ai/", required: false }, { title: "NLP 数据增强 (nlpaug)", url: "https://github.com/makcedward/nlpaug", required: false }, { title: "Mosaic 数据增强详解", url: "https://docs.ultralytics.com/guides/yolo-data-augmentation/", required: false }], checkpoint: "scripts/preprocess.py 可重复运行；DVC 已追踪 data 目录" },
      { day: 5, title: "基线训练与实验管理", content: ["搭建实验跟踪系统：使用 MLflow 或 Weights & Biases 记录每次实验的超参数配置、训练/验证指标曲线、模型权重文件、训练日志等信息，便于后续对比和回溯", "执行多组基线实验以评估模型稳定性：使用不同随机种子（如 seed=42, 123, 456）各训练一次，计算指标的均值和 95% 置信区间，量化结果的统计显著性", "创建实验跟踪表格（experiment.md），以表格形式记录每次实验的编号、修改项、关键指标（如 mAP、F1、BLEU）、训练耗时、备注等字段，方便横向对比", "确保实验的可复现性：在代码中固定所有随机种子（Python random、NumPy、PyTorch CPU/CUDA），记录 CUDA 版本、cuDNN 版本、Transformers 版本等关键环境信息"], duration: "2.5小时", resources: [{ title: "MLflow 官方文档", url: "https://mlflow.org/", required: false }, { title: "Weights & Biases 快速入门", url: "https://docs.wandb.ai/quickstart", required: false }, { title: "实验可复现性指南", url: "https://pytorch.org/docs/stable/notes/randomness.html", required: false }], checkpoint: "有 ≥ 3 次 baseline 实验的完整记录，并能复现" },
      { day: 6, title: "Bad Case 分析", content: ["从验证集中随机抽取 20 条模型预测错误的样本，逐条进行人工检查，记录每个错误样本的输入、模型预测结果和真实标签", "将错误样本按照错误模式分类统计：CV 方向包括漏检（false negative）、误检（false positive）、边界框不准确、类别混淆；NLP 方向包括文本幻觉、关键信息遗漏、语义理解偏差等", "从各类错误中提炼出 Top-3 高频问题，分别从数据侧（标注质量/数据不足/分布偏差）、模型架构侧（感受野/注意力机制）、训练侧（学习率/损失函数）三个角度提出改进假设", "撰写 Bad Case 分析报告（analysis.md），包含错误样本的截图或文本片段、原因假设分析、以及对应的改进实验计划"], duration: "2小时", resources: [{ title: "错误分析最佳实践", url: "https://stanford-cs329s.github.io/syllabus.html", required: false }, { title: "混淆矩阵与错误分析", url: "https://scikit-learn.org/stable/modules/model_evaluation.html#confusion-matrix", required: false }, { title: "ML 错误分析方法论", url: "https://eugeneyan.com/writing/error-analysis/", required: false }], checkpoint: "产出一份 2-3 页的 Bad Case 分析文档" },
      { day: 7, title: "架构与训练优化", content: ["根据 Bad Case 分析报告中的改进假设，实施至少一轮针对性优化：可选方案包括更换更强的模型架构（更大 backbone）、增加训练数据量、调整学习率调度策略（如 cosine annealing）、修改损失函数权重", "针对具体方向执行专项优化：CV 方向可尝试更大的输入分辨率、启用测试时增强（TTA）、使用更强的数据增强；NLP 方向可增大最大序列长度、调整 LoRA 的 rank 参数、增加训练轮数", "进行消融实验（Ablation Study）：逐个移除新增的改进项，观察性能回落幅度，量化每个改进对最终指标的贡献度，从而理解哪些改动最关键", "每轮实验使用 Git 新分支隔离改动，配合新的 experiment ID 记录，确保实验之间互不干扰且可随时回退到任意版本"], duration: "3小时", resources: [{ title: "学习率调度策略", url: "https://pytorch.org/docs/stable/optim.html#how-to-adjust-learning-rate", required: false }, { title: "LoRA 论文", url: "https://arxiv.org/abs/2106.09685", required: false }, { title: "消融实验设计指南", url: "https://machinelearningmastery.com/ablation-study/", required: false }, { title: "测试时增强 (TTA)", url: "https://docs.ultralytics.com/guides/test-time-augmentation/", required: false }], checkpoint: "有至少 2 轮对比实验（baseline → 改进1 → 改进2）的表格" },
      { day: 8, title: "推理优化：量化/剪枝/蒸馏", content: ["学习模型导出与量化技术：将 PyTorch 权重导出为 ONNX 格式以实现跨框架部署；对 LLM 模型使用 GPTQ 或 AWQ 等后量化方法在几乎不损失精度的前提下大幅压缩模型体积和加速推理", "建立推理性能基准测试：记录不同模型在 batch=1 条件下的端到端推理延迟、模型文件大小、显存占用等关键指标，作为优化前后的对比参照", "编写自动化基准测试脚本（benchmark.py），支持批量测试多个模型配置，将结果自动保存为结构化报告（reports/benchmark.md），包含模型大小、P50/P95 延迟、吞吐量等数据", "如果拥有足够的训练数据，可额外探索知识蒸馏实验：用大模型（Teacher）指导小模型（Student）学习，观察在保持较高精度的同时能将模型压缩到多小"], duration: "2.5小时", resources: [R_ULTRALYTICS, { title: "ONNX Runtime 文档", url: "https://onnxruntime.ai/docs/", required: false }, { title: "GPTQ 量化详解", url: "https://arxiv.org/abs/2210.17323", required: false }, { title: "AWQ 量化方法", url: "https://arxiv.org/abs/2306.00978", required: false }], checkpoint: "产出一份 benchmark.md：模型大小、p50/p95 延迟、精度" },
      { day: 9, title: "API 服务开发", content: ["使用 FastAPI 构建模型推理服务：实现 POST /predict 接口接收输入数据并返回预测结果，GET /health 接口用于健康检查，/metrics 接口暴露 Prometheus 格式的监控指标", "定义请求与响应的数据模型：使用 Pydantic Schema 约束输入格式（如图像大小上限、文本最大长度、支持的文件类型），确保返回结果结构清晰且类型安全", "编写单元测试保障接口质量：在 tests/test_api.py 中使用 pytest 和 httpx 的 AsyncClient 进行接口测试，通过 mock 模型推理函数来隔离测试接口逻辑本身的正确性", "配置结构化日志记录：使用 loguru 或 Python 标准 logging 模块，以 INFO 级别记录每次请求的耗时、输入摘要、预测结果摘要，便于后续排查问题和性能分析"], duration: "2.5小时", resources: [R_FASTAPI, { title: "Pydantic 文档", url: "https://docs.pydantic.dev/", required: false }, { title: "pytest 测试框架", url: "https://docs.pytest.org/en/stable/", required: false }, { title: "loguru 日志库", url: "https://loguru.readthedocs.io/", required: false }], checkpoint: "可运行的 FastAPI 服务 + 至少 1 个测试" },
      { day: 10, title: "前端 UI 开发", content: ["使用 Streamlit 或 Gradio 快速搭建 Web 前端界面：实现文件上传或文本输入功能，展示模型预测结果，并支持将结果下载为文件（如 CSV/JSON/图片）", "在界面上展示核心信息卡片，包括当前模型版本、推理延迟、模型参数量等关键指标，帮助用户了解系统状态和性能表现", "完善错误处理和用户体验：对上传的异常文件格式（如非图片文件上传到 CV 模型）给出友好的中文提示信息，而不是直接报错崩溃", "将前端服务与后端 FastAPI 服务解耦，分别编写 Dockerfile 并通过 docker-compose.yml 编排为独立容器，实现前后端分离部署"], duration: "2.5小时", resources: [R_STREAMLIT, R_GRADIO, { title: "Streamlit 组件库", url: "https://docs.streamlit.io/library/api-reference", required: false }, { title: "Gradio 自定义组件", url: "https://www.gradio.app/guides/custom-components", required: false }], checkpoint: "浏览器可用的 UI，能完成一次端到端演示" },
      { day: 11, title: "Docker 化与一键部署", content: ["编写生产级 Dockerfile：采用多阶段构建（multi-stage build）减小镜像体积，使用非 root 用户运行服务以提高安全性，配置 HEALTHCHECK 指令实现容器健康检查", "编写 docker-compose.yml 编排文件：定义 api 服务和 ui 服务的容器配置，可选添加 Redis 缓存服务，配置环境变量、端口映射、数据卷挂载和容器间网络通信", "在一台全新的干净环境（或云服务器）上执行部署验证，确保所有服务能正常启动、互相通信并完成一次完整的推理请求", "在 README 中提供清晰的运行指南：包含前置环境要求（Docker 版本、GPU 驱动）、启动命令、首次拉取镜像的预计耗时说明"], duration: "2.5小时", resources: [{ title: "Dockerfile 最佳实践", url: "https://docs.docker.com/develop/develop-images/dockerfile_best-practices/", required: false }, { title: "Docker Compose 文档", url: "https://docs.docker.com/compose/", required: false }, { title: "NVIDIA Container Toolkit", url: "https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/", required: false }, { title: "Docker 多阶段构建", url: "https://docs.docker.com/build/building/multi-stage/", required: false }], checkpoint: "可在干净环境用 docker compose up 一键部署" },
      { day: 12, title: "监控与上线", content: ["接入 Prometheus 监控体系：通过 /metrics 端点暴露关键指标（请求量 QPS、推理延迟、错误率），使用 Grafana 创建可视化仪表盘实时监控系统运行状态", "配置告警规则：当错误率超过 5%、GPU 温度超过 85°C、磁盘剩余空间低于 10% 时自动触发告警通知（可通过 Alertmanager 发送到邮件/钉钉/Slack 等渠道）", "将服务部署到公网可访问：使用 Nginx 作为反向代理服务器，通过 Let's Encrypt 申请免费 HTTPS 证书，配置域名解析实现安全的外部访问", "撰写部署运维文档（deploy.md）：详细记录环境依赖、端口分配、环境变量配置、日志查看方法、数据备份流程和服务重启步骤"], duration: "2.5小时", resources: [{ title: "Prometheus 官方文档", url: "https://prometheus.io/docs/", required: false }, { title: "Grafana 入门指南", url: "https://grafana.com/docs/grafana/latest/getting-started/", required: false }, { title: "Nginx 反向代理配置", url: "https://nginx.org/en/docs/http/ngx_http_proxy_module.html", required: false }, { title: "Let's Encrypt 使用指南", url: "https://letsencrypt.org/getting-started/", required: false }], checkpoint: "一份 deploy.md 说明 + Grafana 面板截图" },
      { day: 13, title: "文档与答辩准备", content: ["完善项目 README：补充项目简介、安装步骤、使用说明、性能指标表格、系统架构图、核心功能演示截图，使其成为一份独立完整的项目说明文档", "整理 docs/ 文档目录：包含 prd.md（需求文档）、data.md（数据说明）、experiments.md（实验记录）、api.md（接口文档）、deploy.md（部署指南），形成完整的项目知识库", "制作 5 分钟答辩演示 PPT：按「背景与问题 → 技术方案 → 实验结果 → 在线演示 → 总结展望」的结构组织内容，附上演示视频链接方便评委查看", "（可选）录制 2 分钟的项目演示视频嵌入 README 中；准备 3 个常见 FAQ 和可能的答辩问题及其回答要点"], duration: "3小时", resources: [{ title: "技术演讲技巧", url: "https://www.presentationgo.com/2021/09/tips-for-technical-presentations.html", required: false }, { title: "Mermaid 图表语法", url: "https://mermaid.js.org/intro/", required: false }, { title: "GitHub Pages 部署", url: "https://pages.github.com/", required: false }], checkpoint: "README + docs/ 完整，可作为简历项目链接展示" },
      { day: 14, title: "复盘、迭代与发布", content: ["独立完成一次完整的 Live Demo 录像：模拟真实用户操作流程，记录演示中遇到的问题和失败点，作为后续迭代改进的依据", "规划后续迭代方向：功能增强（多模型切换/A-B测试）、性能优化（推理缓存/批处理/异步队列）、数据飞轮（持续收集用户反馈数据用于模型迭代）", "在 GitHub 上创建 Release v1.0 版本：编写 Release Notes 总结核心功能和改进，附上模型权重文件下载链接或 HuggingFace Model Hub 链接", "撰写一篇技术博客文章记录项目历程（中文/英文均可），按「问题定义 → 技术方案 → 实验结果 → 经验教训」的结构组织，作为长期技术积累和学习记录"], duration: "2.5小时", resources: [{ title: "GitHub Releases 使用指南", url: "https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository", required: false }, { title: "HuggingFace Model Hub", url: "https://huggingface.co/docs/hub/en/models", required: false }, { title: "技术博客写作指南", url: "https://github.com/readme/guides/writing-on-github", required: false }, { title: "Markdown 写作技巧", url: "https://www.markdownguide.org/basic-syntax/", required: false }], checkpoint: "GitHub Release v1.0 + 一篇技术博客 + demo 录像链接" }],
  },

  // =====================================================
  // Node: cv-instance-segmentation
  // =====================================================
  {
    id: "cv-instance-segmentation",
    name: "YOLOv8-seg 实例分割实战",
    track: "cv",
    duration: "1周",
    prerequisites: ["linux-basic"],
    status: "locked",
    description: "围绕 YOLOv8-seg 的实例分割实战。重点讲解如何将标注好的多边形数据集转化为 YOLO 格式并进行模型微调训练。",
    outcomes: ["掌握多边形标注到 YOLO 格式的转换流程", "完成 YOLOv8-seg 微调训练并推理"],
    relatedIntel: ["002-yolo"],
    relatedTerms: ["yolo", "instance-segmentation", "coco-format"],
    dailyTasks: [
      {
        day: 1,
        title: "COCO/VOC 到 YOLO 格式转换",
        content: {
          objective: "掌握 COCO JSON 标注转换为 YOLO txt 格式的核心逻辑",
          api_checklist: [
            "json.load() 解析 COCO annotation",
            "归一化 polygon 坐标 (x_center, width) / image_size",
            "Image.open() 读取图片尺寸",
            "os.path.join / Path.mkdir 构建输出目录"
          ],
          practice: "编写 convert_coco_to_yolo.py：读取 coco_instances_results.json，遍历每张图片的 segmentations，按类别 ID 写入 class_id x_center y_center width height 到同名 .txt 文件，输出目录结构严格遵循 YOLO 要求（images/train、labels/train）。",
          answer: "核心公式：对于 polygon [x1,y1,x2,y2,...,xn,yn]，取外接矩形并归一化：x_center = (min_x + max_x)/2/image_width, y_center = (min_y + max_y)/2/image_height, width = (max_x - min_x)/image_width, height = (max_y - min_y)/image_height"
        },
        duration: "2小时",
        resources: [
          { title: "Ultralytics YOLO 数据格式文档", url: "https://docs.ultralytics.com/datasets/segment/", required: true },
          { title: "COCO Dataset 官方标注格式", url: "https://cocodataset.org/#format-data", required: false },
          { title: "COCO格式转YOLO格式脚本", url: "https://github.com/ultralytics/ultralytics/blob/main/ultralytics/data/converter.py", required: false },
          
          { title: "多边形标注工具labelme", url: "https://github.com/wkentaro/labelme", required: false, type: "repo", source: "github" }
        ],
        checkpoint: "用 Labelme 标注 3 张图片（多边形），运行脚本转换后，用 yolo val 验证标注是否正确（mAP>0 即说明格式有效）"
      },
      {
        day: 2,
        title: "YOLOv8-seg 数据集配置与预训练模型加载",
        content: {
          objective: "配置数据集 YAML 并加载预训练 YOLOv8-seg 模型",
          api_checklist: [
            "ultralytics.YOLO('yolov8n-seg.pt') 加载模型",
            "data.yaml 的 nc / names / train / val 字段配置",
            "model.train(data='data.yaml', epochs=3) 启动训练",
            "results = model.val() 获取验证指标"
          ],
          practice: "创建 dataset.yaml，train 指向昨天转换好的 images/train，val 指向 images/val（从 train 随机抽取 10%）。运行 python train.py --model yolov8n-seg.pt --data dataset.yaml --epochs 5 --imgsz 640，用 wandb 或 tensorboard 观察 loss 下降曲线。",
          answer: "data.yaml 模板：\nnc: 1\nnames: ['object']\ntrain: ./datasets/images/train\nval: ./datasets/images/val"
        },
        duration: "2小时",
        resources: [
          { title: "Ultralytics YOLOv8 训练教程", url: "https://docs.ultralytics.com/modes/train/", required: true },
          { title: "YOLO 数据集配置 YAML 示例", url: "https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/datasets/coco8-seg.yaml", required: true },
          { title: "YOLOv8-seg模型文档", url: "https://docs.ultralytics.com/models/yolov8/#segmentation", required: false },
          
          { title: "YOLOv8-seg训练示例代码", url: "https://github.com/ultralytics/ultralytics/tree/main/examples", required: false, type: "repo", source: "github" }
        ],
        checkpoint: "训练日志显示 mAP50 从 0 增长到 >0.3，说明模型正在学习"
      },
      {
        day: 3,
        title: "模型微调与超参数调优",
        content: {
          objective: "理解冻结骨干网络 + 解码头微调的策略",
          api_checklist: [
            "model.fuse() 融合卷积层加速推理",
            "optimizer AdamW / SGD 的选择",
            "学习率 warmup 与 cosine decay",
            "augmentation hsv / fliplr / scale 参数"
          ],
          practice: "写一个 train_finetune.py：freeze 参数冻结 backbone 前 10 层，只训练 segmentation head。分别用 lr0=1e-3 和 lr0=1e-4 训练，对比最终 mAP50-95 的差异。",
          answer: "冻结策略：\nmodel = YOLO('yolov8n-seg.pt')\nfor i, layer in enumerate(model.model.parameters()):\n    layer.requires_grad = False  # 冻结 backbone"
        },
        duration: "2.5小时",
        resources: [
          { title: "YOLO 超参数文档", url: "https://docs.ultralytics.com/hyp/", required: true },
          { title: "迁移学习微调策略", url: "https://cs231n.github.io/transfer-learning/", required: false },
          { title: "YOLOv8微调最佳实践", url: "https://docs.ultralytics.com/guides/hyperparameter-tuning/", required: false },
          
          { title: "YOLO超参数优化代码", url: "https://github.com/ultralytics/ultralytics/tree/main/ultralytics/cfg", required: false, type: "repo", source: "github" }
        ],
        checkpoint: "对比冻结/非冻结训练日志，冻结策略在数据少时 mAP 更高"
      },
      {
        day: 4,
        title: "推理与后处理：NMS / Mask 渲染",
        content: {
          objective: "掌握推理输出解析与分割掩码可视化",
          api_checklist: [
            "results = model.predict(source='img.jpg') 获取预测结果",
            "results[0].masks.xy 获取多边形坐标",
            "results[0].boxes.conf / cls 提取置信度和类别",
            "cv2.polylines / cv2.fillPoly 渲染 mask"
          ],
          practice: "写 inference_pipeline.py：加载 best.pt，对测试集每张图预测后，将分割掩码覆盖在原图上保存到 output/ 目录，文件名格式 pred_classname_confidence.jpg（如 pred_car_0.92.jpg）。",
          answer: "mask 渲染核心代码：\nmask = results[0].masks.data[0].cpu().numpy()\ncolor = np.random.randint(0, 255, 3)\nimg[mask > 0] = img[mask > 0] * 0.5 + color * 0.5"
        },
        duration: "1.5小时",
        resources: [
          { title: "YOLO 推理文档", url: "https://docs.ultralytics.com/modes/predict/", required: true },
          { title: "OpenCV 绘图函数", url: "https://docs.opencv.org/4.x/d/d00/sche", required: false },
          
          { title: "YOLOv8分割结果可视化代码", url: "https://github.com/ultralytics/ultralytics/tree/main/examples", required: false, type: "repo", source: "github" },
          { title: "Mask R-CNN论文", url: "https://arxiv.org/abs/1703.06870", required: false, type: "paper", source: "academic" }
        ],
        checkpoint: "输出目录有正确的掩码覆盖图，文件名包含预测类别和置信度"
      },
      {
        day: 5,
        title: "端到端 Pipeline 串联",
        content: {
          objective: "从原始图片到最终分割结果的完整 Pipeline 串联",
          api_checklist: [
            "os.walk 遍历数据目录",
            "shutil.copytree 备份数据集",
            "subprocess.run 调用 yolo 命令",
            "PIL.Image 与 numpy array 互转"
          ],
          practice: "写一个 main.py，整合前 4 天代码：输入 raw_images/ 目录 → 自动创建 YOLO 格式数据集 → 训练 10 epochs → 推理测试集 → 输出带掩码的结果图到 results/。整个流程只需 python main.py 即可运行。",
          answer: "入口函数结构：\ndef main():\n    convert_and_prepare()\n    train_model(epochs=10)\n    run_inference()"
        },
        duration: "3小时",
        resources: [
          { title: "YOLOv8-seg 完整示例", url: "https://docs.ultralytics.com/tasks/segment/", required: true },
          
          { title: "YOLOv8完整训练推理代码", url: "https://github.com/ultralytics/ultralytics/tree/main/examples", required: false, type: "repo", source: "github" },
          { title: "Python多进程处理", url: "https://realpython.com/python-concurrency/", required: false, type: "doc", source: "official" }
        ],
        checkpoint: "python main.py 完整运行无报错，results/ 目录有分割结果图"
      }
    ]
  },

  // =====================================================
  // Node: project-iot-fastapi
  // =====================================================
  {
    id: "project-iot-fastapi",
    name: "ESP32 传感器数据链路",
    track: "project",
    duration: "1周",
    prerequisites: ["linux-basic"],
    status: "locked",
    description: "围绕软硬件结合的数据链路打通。重点讲解如何使用 ESP32 采集传感器数据，并通过 WiFi 发送 HTTP 请求到 FastAPI 构建的后端接收端点。",
    outcomes: ["ESP32 传感器数据采集与 WiFi HTTP 上报", "FastAPI 接收端点 + 数据持久化"],
    relatedIntel: ["007-docker"],
    relatedTerms: ["esp32", "wifi", "http", "rest-api", "uart"],
    dailyTasks: [
      {
        day: 1,
        title: "ESP32 开发环境与 WiFi 连接",
        content: {
          objective: "在 ESP32 上用 Arduino IDE / PlatformIO 连接 WiFi",
          api_checklist: [
            "WiFi.begin(ssid, password) 建立 WiFi 连接",
            "WiFi.status() == WL_CONNECTED 判断连接状态",
            "WiFi.localIP() 获取本机 IP",
            "Serial.begin(115200) 初始化调试串口"
          ],
          practice: "写一个 esp32_wifi_test.ino：ESP32 连接 WiFi 后，每 5 秒通过 Serial 打印 localIP、rssi、RSSI 信号强度。将代码烧录到 ESP32，观察串口监视器输出正确的 IP 地址。",
          answer: "关键代码段：\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(\"SSID\", \"PASSWORD\");\n  while (WiFi.status() != WL_CONNECTED) {\n    delay(500);\n    Serial.print(\".\");\n  }\n  Serial.println(WiFi.localIP());\n}"
        },
        duration: "1.5小时",
        resources: [
          { title: "ESP32 WiFi 库文档", url: "https://docs.espressif.com/projects/arduino-esp32/en/latest/api/wifi.html", required: true },
          { title: "Arduino ESP32 安装指南", url: "https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html", required: true }
        ],
        checkpoint: "串口监视器显示 ESP32 获取到局域网 IP（如 192.168.1.100）"
      },
      {
        day: 2,
        title: "DHT11 / BMP280 传感器数据采集",
        content: {
          objective: "读取温湿度或气压传感器的原始数值",
          api_checklist: [
            "Adafruit_DHT 库读取 DHT11/DHT22",
            "Adafruit_BMP280 库读取气压",
            "Wire.begin() 初始化 I2C 总线",
            "sensor.readTemperature() / readHumidity() / readPressure()"
          ],
          practice: "写 read_sensor.ino：DHT11 每 2 秒读取一次温湿度，BMP280 读取气压，通过 Serial 输出 JSON 格式数据 {\"temp\": 25.3, \"humidity\": 60.5, \"pressure\": 1013.25}。在 Arduino 串口绘图器中观察曲线。",
          answer: "接线：DHT11 Data → GPIO4，BMP280 SDA→GPIO21 SCL→GPIO22（I2C 默认引脚）"
        },
        duration: "1.5小时",
        resources: [
          { title: "DHT Sensor Library", url: "https://github.com/adafruit/DHT-sensor-library", required: true },
          { title: "BMP280 驱动文档", url: "https://github.com/adafruit/Adafruit_BMP280_Library", required: true }
        ],
        checkpoint: "串口输出正确格式的 JSON，每组数据在合理范围内（温度 15-35°C，湿度 30-80%）"
      },
      {
        day: 3,
        title: "HTTP POST 上报到 FastAPI 端点",
        content: {
          objective: "ESP32 通过 HTTP POST 发送 JSON 数据到服务器",
          api_checklist: [
            "WiFiClient client 建立 TCP 连接",
            "client.connect(host, port) 建立 HTTP 连接",
            "String payload = JsonObject.as<String>() 构建 JSON 请求体",
            "client.print(String(\"POST /sensor HTTP/1.1\\r\\n...\")) 发送请求"
          ],
          practice: "用 ArduinoJson 库构造 JSON：{\n  \"device_id\": \"esp32_001\",\n  \"temperature\": 25.6,\n  \"humidity\": 62.3,\n  \"timestamp\": 1718900000\n}，POST 到 http://192.168.1.100:8000/api/sensor。用串口打印服务器返回的 HTTP 状态码。",
          answer: "POST 请求格式：\nPOST /api/sensor HTTP/1.1\\r\nHost: 192.168.1.100:8000\\r\nContent-Type: application/json\\r\nContent-Length: <len>\\r\n\\r\n<payload>"
        },
        duration: "2小时",
        resources: [
          { title: "ArduinoJson 库文档", url: "https://arduinojson.org/", required: true },
          { title: "ESP32 HTTP Client 示例", url: "https://docs.espressif.com/projects/arduino-esp32/en/latest/api/wificient.html", required: false }
        ],
        checkpoint: "ESP32 串口显示 HTTP/1.1 201 Created 或 200 OK，服务器端收到数据"
      },
      {
        day: 4,
        title: "FastAPI 后端接收服务",
        content: {
          objective: "搭建 FastAPI 后端接收 ESP32 上报的数据",
          api_checklist: [
            "FastAPI app = FastAPI() 创建应用",
            "@app.post('/api/sensor') 定义端点",
            "pydantic BaseModel 定义数据模型",
            "uvicorn main:app --reload 启动服务"
          ],
          practice: "写 main.py：定义 SensorData(BaseModel)：device_id(str)、temperature(float)、humidity(float)、timestamp(int)。POST /api/sensor 端点打印数据并返回 {\"status\": \"ok\", \"received\": len(data)}。启动服务后用 curl 测试：curl -X POST http://localhost:8000/api/sensor -H \"Content-Type: application/json\" -d '{\"device_id\":\"test\",\"temperature\":25.0,\"humidity\":60.0,\"timestamp\":1718900000}'",
          answer: "核心端点代码：\nclass SensorData(BaseModel):\n    device_id: str\n    temperature: float\n    humidity: float\n    timestamp: int\n\n@app.post(\"/api/sensor\")\ndef receive_sensor(data: SensorData):\n    print(data.model_dump())\n    return {\"status\": \"ok\", \"received\": data.device_id}"
        },
        duration: "1.5小时",
        resources: [
          { title: "FastAPI 官方教程", url: "https://fastapi.tiangolo.com/tutorial/", required: true },
          { title: "Pydantic 数据验证", url: "https://docs.pydantic.dev/", required: true }
        ],
        checkpoint: "curl 返回 {\"status\": \"ok\"}，服务器终端打印出完整的 SensorData"
      },
      {
        day: 5,
        title: "数据持久化到 SQLite",
        content: {
          objective: "将传感器数据写入 SQLite 数据库",
          api_checklist: [
            "sqlite3.connect('sensor.db') 建立连接",
            "CREATE TABLE sensor_logs(...) 建表",
            "INSERT INTO sensor_logs VALUES(?,?,?,?) 插入数据",
            "SELECT * FROM sensor_logs 查询验证"
          ],
          practice: "扩展昨天的 FastAPI：在 /api/sensor 端点中加入 sqlite3.insert()，每次 POST 请求都将数据写入 sensor_logs 表。新增 GET /api/sensor/history?device_id=esp32_001&limit=10 返回该设备最近 10 条记录。用 curl 发送数据后，用 sqlite3 sensor.db \"SELECT * FROM sensor_logs\" 验证。",
          answer: "建表语句：\nCREATE TABLE sensor_logs (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    device_id TEXT,\n    temperature REAL,\n    humidity REAL,\n    timestamp INTEGER,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)"
        },
        duration: "2小时",
        resources: [
          { title: "SQLite Python 文档", url: "https://docs.python.org/3/library/sqlite3.html", required: true },
          { title: "FastAPI SQL 教程", url: "https://fastapi.tiangolo.com/tutorial/sql-databases/", required: false }
        ],
        checkpoint: "sqlite3 命令行查询到历史记录，GET 端点返回正确 JSON"
      },
      {
        day: 6,
        title: "端到端联调与异常处理",
        content: {
          objective: "ESP32 + FastAPI 完整链路联调，处理网络异常",
          api_checklist: [
            "try-except 捕获 WiFiClient 连接异常",
            "delay() 和 millis() 实现非阻塞重试",
            "ESP.deepSleep() 低功耗策略",
            "服务器端 requestValidation 验证数据合法性"
          ],
          practice: "ESP32 每 30 秒上报一次数据，网络断开时自动重试 3 次（间隔 5 秒），重试失败后进入 deepSleep(60e6) 等待下次唤醒。服务器端过滤 temperature<-50 或 >100 的异常数据，返回 422 Unprocessable Entity。",
          answer: "重试逻辑框架：\nint retries = 0;\nwhile (retries < 3 && !sendData()) {\n  delay(5000);\n  retries++;\n}\nif (retries == 3) ESP.deepSleep(60e6);"
        },
        duration: "2小时",
        resources: [
          { title: "ESP32 低功耗指南", url: "https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/system/deep_sleep.html", required: false }
        ],
        checkpoint: "拔掉 WiFi 路由器的网线，ESP32 重试 3 次后进入深度睡眠，插回网线后自动恢复上报"
      },
      {
        day: 7,
        title: "综合：实时数据仪表盘",
        content: {
          objective: "在前端页面实时展示传感器数据流",
          api_checklist: [
            "FastAPI 挂载静态文件 app.mount('/static', StaticFiles(directory='static'))",
            "JavaScript fetch() 轮询 /api/sensor/history 端点",
            "Chart.js 绘制实时折线图",
            "setInterval() 定时刷新数据"
          ],
          practice: "创建 static/ 目录，写 index.html：页面加载后每 10 秒 fetch('/api/sensor/history?limit=20')，用 Chart.js 渲染 temperature 和 humidity 两条实时曲线。启动 FastAPI 后浏览器访问 http://localhost:8000/static/index.html 观察数据滚动更新。",
          answer: "Chart.js 最小配置：\nnew Chart(ctx, {\n  type: 'line',\n  data: { labels: [...], datasets: [\n    { label: 'Temp', data: [...] },\n    { label: 'Humidity', data: [...] }\n  ] },\n  options: { animation: false, responsive: true }\n});"
        },
        duration: "2.5小时",
        resources: [
          { title: "FastAPI 静态文件挂载", url: "https://fastapi.tiangolo.com/tutorial/static-files/", required: true },
          { title: "Chart.js 入门", url: "https://www.chartjs.org/docs/latest/", required: true }
        ],
        checkpoint: "浏览器页面显示两条实时更新的折线图，数据来自真实 ESP32 上报"
      }
    ]
  },

  // =====================================================
  // Node: nlp-local-rag
  // =====================================================
  {
    id: "nlp-local-rag",
    name: "本地知识库 RAG 系统",
    track: "nlp",
    duration: "2周",
    prerequisites: ["linux-basic"],
    status: "locked",
    description: "围绕本地知识库构建。重点讲如何使用脚本自动化解析学术文献或网页内容，并结合向量数据库搭建一个轻量级的本地 RAG（检索增强生成）系统。",
    outcomes: ["自动化文档解析与分块", "向量数据库存储与相似度检索", "本地 LLM 生成回答"],
    relatedIntel: ["005-rag", "001-transformer"],
    relatedTerms: ["rag", "vector-database", "embedding", "chunking", "llm"],
    dailyTasks: [
      {
        day: 1,
        title: "PDF 文档解析与文本提取",
        content: {
          objective: "用 Python 从 PDF 中提取结构化文本",
          api_checklist: [
            "PyPDF2.PdfReader 加载 PDF",
            "page.extract_text() 提取单页文本",
            "re.split('[.!?。！？]\\s+', text) 按句子分割",
            "len(text) > 100 过滤短文本块"
          ],
          practice: "写 extract_pdf.py：遍历 input_pdfs/ 目录下所有 PDF，提取全部文本，按句子分块（最小 100 字符），输出为 JSONL 格式（每行 {\"text\": \"...\", \"source\": \"filename\", \"page\": 1}）。用 arXiv 下载一篇 PDF 论文测试。",
          answer: "核心循环：\nreader = PdfReader(filepath)\nfor i, page in enumerate(reader.pages):\n    text = page.extract_text()\n    for chunk in split_into_chunks(text, min_len=100):\n        records.append({\"text\": chunk, \"source\": filename, \"page\": i+1})"
        },
        duration: "1.5小时",
        resources: [
          { title: "PyPDF2 文档", url: "https://pypdf.readthedocs.io/", required: true },
          { title: "PDF 论文示例 (arXiv)", url: "https://arxiv.org/pdf/2303.08774.pdf", required: true }
        ],
        checkpoint: "输出的 JSONL 文件行数 > 50，每条记录包含 text、source、page 三个字段"
      },
      {
        day: 2,
        title: "网页内容抓取与清洗",
        content: {
          objective: "用 requests + BeautifulSoup 抓取网页正文",
          api_checklist: [
            "requests.get(url, timeout=10) 发送 HTTP 请求",
            "BeautifulSoup(response.text, 'html.parser') 解析 DOM",
            "soup.find('article') 或 .find('main') 定位正文",
            "soup.get_text(separator=' ') 提取纯净文本"
          ],
          practice: "写 crawl_web.py：读取 urls.txt（一行一个 URL），抓取每个页面的 article/main 内容，去除 nav/header/footer/script 标签，对正文按 500 字符分块，输出到 articles.jsonl。用 Wikipedia 或博客文章测试。",
          answer: "关键清洗逻辑：\nfor tag in soup.find_all(['nav', 'header', 'footer', 'script', 'style']):\n    tag.decompose()  # 删除标签\narticle = soup.find('article') or soup.find('main')\ntext = article.get_text(separator=' ', strip=True)"
        },
        duration: "1.5小时",
        resources: [
          { title: "BeautifulSoup 文档", url: "https://www.crummy.com/software/BeautifulSoup/bs4/doc/", required: true },
          { title: "requests 库文档", url: "https://docs.python-requests.org/", required: true }
        ],
        checkpoint: "输出 JSONL 中每条记录正文无 HTML 标签，无导航菜单内容"
      },
      {
        day: 3,
        title: "Sentence-Transformers Embedding 向量化",
        content: {
          objective: "使用预训练模型将文本块转为向量",
          api_checklist: [
            "SentenceTransformer('all-MiniLM-L6-v2') 加载模型",
            "model.encode(texts, show_progress_bar=True) 批量编码",
            "numpy.save('embeddings.npy') 持久化向量",
            "cosine_similarity(a, b) 计算相似度"
          ],
          practice: "写 embed.py：加载 articles.jsonl，用 SentenceTransformer('all-MiniLM-L6-v2') 对所有文本块编码，输出 embeddings.npy（形状 [N, 384]）和 metadata.json（对应每个向量的 text、source）。验证：随机取一条文本，用 numpy.dot 计算与所有向量的相似度，找出 Top-5 最相似的块。",
          answer: "相似度搜索：\nquery_vec = model.encode([query_text])\nsimilarities = np.dot(embeddings, query_vec.T).flatten()\ntop_k_idx = np.argsort(similarities)[-5:][::-1]"
        },
        duration: "2小时",
        resources: [
          { title: "Sentence-Transformers 文档", url: "https://www.sbert.net/", required: true },
          { title: "HuggingFace MTEB 榜单", url: "https://huggingface.co/spaces/mteb/leaderboard", required: false }
        ],
        checkpoint: "Top-5 返回结果与查询语义相关（可用肉眼判断），相似度数值合理（0.3-0.9 之间）"
      },
      {
        day: 4,
        title: "ChromaDB 向量数据库集成",
        content: {
          objective: "用 ChromaDB 管理向量存储与检索",
          api_checklist: [
            "chromadb.Client() 创建客户端",
            "client.create_collection('knowledge_base') 建集合",
            "collection.add(ids, embeddings, documents, metadatas) 添加数据",
            "collection.query(query_embeddings, n_results=5) 相似检索"
          ],
          practice: "写 rag_retriever.py：初始化 ChromaDB collection，将 articles.jsonl 的文本和 embeddings 批量导入。实现 get_relevant_context(query_text, top_k=3) 函数：输入自然语言问题，返回最相关的 3 个文本块拼接成上下文字符串。",
          answer: "核心函数：\ndef get_relevant_context(query, top_k=3):\n    query_emb = model.encode([query])\n    results = collection.query(\n        query_embeddings=query_emb.tolist(),\n        n_results=top_k\n    )\n    return '\\n'.join(results['documents'][0])"
        },
        duration: "1.5小时",
        resources: [
          { title: "ChromaDB 快速入门", url: "https://docs.trychroma.com/getting-started", required: true },
          { title: "ChromaDB Python 客户端", url: "https://docs.trychroma.com/api-reference", required: true }
        ],
        checkpoint: "输入「论文作者是谁」能返回包含作者信息的文本块"
      },
      {
        day: 5,
        title: "本地 LLM 生成：Ollama / vLLM 接口调用",
        content: {
          objective: "通过本地 LLM API 生成 RAG 回答",
          api_checklist: [
            "ollama run llama3（或 qwen2）本地运行模型",
            "requests.post('http://localhost:11434/api/generate') 调用生成",
            "构造 prompt: [context] + [question] 注入上下文",
            "response.json()['response'] 提取生成文本"
          ],
          practice: "写 generate_answer.py：先启动 ollama run llama3，然后用 get_relevant_context(question) 获取相关上下文，构造 prompt=f\"基于以下内容回答问题：\\n{context}\\n\\n问题：{question}\\n回答：\"，调用 Ollama API 生成回答，输出到终端。",
          answer: "API 调用：\nimport requests\ndef ask_local_llm(question, context):\n    prompt = f\"基于以下内容回答问题：\\n{context}\\n\\n问题：{question}\\n回答：\"\n    resp = requests.post('http://localhost:11434/api/generate', \n        json={'model': 'llama3', 'prompt': prompt, 'stream': False})\n    return resp.json()['response']"
        },
        duration: "2.5小时",
        resources: [
          { title: "Ollama 官方文档", url: "https://github.com/ollama/ollama", required: true },
          { title: "Ollama API 参考", url: "https://github.com/ollama/ollama/blob/main/docs/api.md", required: true }
        ],
        checkpoint: "提出一个文档相关的问题，能得到基于文档内容的回答（不是通用回答）"
      },
      {
        day: 6,
        title: "RAG Pipeline 串联与评估",
        content: {
          objective: "串联文档解析→向量化→检索→生成的完整 Pipeline",
          api_checklist: [
            "argparse 接收命令行参数",
            "datetime.datetime.now() 给检索结果打时间戳",
            "json.dump 结果输出到文件",
            "BLEU / ROUGE 评估生成质量"
          ],
          practice: "写 main.py：整合前 5 天代码，支持命令行参数 --pdf 或 --url 指定数据源，--question 指定问题。输出格式：\n{\"question\": \"...\", \"answer\": \"...\", \"sources\": [\"source1\", \"source2\"]}。准备 5 个测试问题，人工判断回答是否正确引用了文档内容。",
          answer: "主函数结构：\ndef main():\n    parser = argparse.ArgumentParser()\n    parser.add_argument('--pdf', type=str)\n    parser.add_argument('--url', type=str)\n    parser.add_argument('--question', type=str, required=True)\n    args = parser.parse_args()\n    \n    docs = extract(args.pdf or args.url)\n    context = retrieve(args.question)\n    answer = generate(args.question, context)\n    print(json.dumps({\"question\": args.question, \"answer\": answer, \"sources\": docs}))"
        },
        duration: "2小时",
        resources: [
          { title: "RAG 系统评估方法", url: "https://github.com/run-llama/llama-hub", required: false }
        ],
        checkpoint: "5 个测试问题中至少 4 个能正确引用文档内容生成回答"
      },
      {
        day: 7,
        title: "Web 界面封装",
        content: {
          objective: "用 Gradio 或 Streamlit 提供 Web UI",
          api_checklist: [
            "gr.Interface(fn, inputs, outputs) 创建界面",
            "st.text_input / st.button Streamlit 组件",
            "st.write(result) 渲染回答结果",
            "subprocess.Popen 启动后端 Ollama 服务"
          ],
          practice: "用 Gradio 写 web_ui.py：左侧输入框接收问题，右侧显示回答和引用来源。点击提交后调用 rag_pipeline 获得结果。添加「参考来源」折叠区，点击可展开查看原始文本块。",
          answer: "最小 Gradio 实现：\nimport gradio as gr\n\ndef answer_question(question):\n    result = rag_pipeline(question)\n    return result['answer'], result['sources']\n\ndemo = gr.Interface(\n    fn=answer_question,\n    inputs=gr.Textbox(label=\"问题\"),\n    outputs=[gr.Textbox(label=\"回答\"), gr.JSON(label=\"参考来源\")]\n)\ndemo.launch()"
        },
        duration: "2小时",
        resources: [
          { title: "Gradio 快速入门", url: "https://gradio.app/quickstart/", required: true },
          { title: "Streamlit 快速入门", url: "https://docs.streamlit.io/get-started", required: false }
        ],
        checkpoint: "浏览器打开 Web UI，输入问题得到完整 RAG 回答和来源展示"
      }
    ]
  },

  // =====================================================
  // Node: devops-docker-api
  // =====================================================
  {
    id: "devops-docker-api",
    name: "模型服务 Docker 化部署",
    track: "devops",
    duration: "1周",
    prerequisites: ["linux-basic", "git-github"],
    status: "locked",
    description: "围绕模型服务化部署。重点讲如何编写 Dockerfile，将一个包含了深度学习推理逻辑的 Python/FastAPI 服务打包成体积优化的镜像。",
    outcomes: ["Dockerfile 多阶段构建优化", "FastAPI 模型推理服务容器化", "镜像体积控制 < 2GB"],
    relatedIntel: ["007-docker"],
    relatedTerms: ["docker", "dockerfile", "multi-stage-build", "uvicorn", "fastapi"],
    dailyTasks: [
      {
        day: 1,
        title: "FastAPI 推理服务编写",
        content: {
          objective: "编写包含模型推理逻辑的 FastAPI 服务",
          api_checklist: [
            "torch.load('model.pt') 加载 PyTorch 模型",
            "model.eval() 切换推理模式",
            "@app.post('/predict') 定义推理端点",
            "torch.no_grad() 禁用梯度计算加速"
          ],
          practice: "写一个简单的 FastAPI 推理服务：加载 torchvision.models.resnet18(pretrained=True)，实现 POST /predict 端点，接收 base64 编码的图片字符串，解码后送入模型推理，返回 Top-5 预测类别和概率。启动服务并 curl 测试。",
          answer: "推理端点核心：\n@app.post('/predict')\ndef predict(file: UploadFile):\n    img = Image.open(BytesIO(file.read())).convert('RGB')\n    tensor = transforms(img).unsqueeze(0)\n    with torch.no_grad():\n        output = model(tensor)\n    probs = torch.softmax(output, dim=1)[0]\n    top5 = torch.topk(probs, 5)\n    return {'predictions': [{'class': classes[i], 'prob': p} for i, p in zip(top5.indices, top5.values)]}"
        },
        duration: "2小时",
        resources: [
          { title: "FastAPI 官方教程", url: "https://fastapi.tiangolo.com/tutorial/", required: true },
          { title: "PyTorch 模型推理", url: "https://pytorch.org/tutorials/beginner/saving_loading_models.html", required: true }
        ],
        checkpoint: "curl 上传一张图片，返回包含 ImageNet 类别的 Top-5 预测"
      },
      {
        day: 2,
        title: "单阶段 Dockerfile 基础镜像构建",
        content: {
          objective: "编写第一版 Dockerfile 并成功构建",
          api_checklist: [
            "FROM python:3.10 设置基础镜像",
            "WORKDIR /app 设置工作目录",
            "COPY requirements.txt 复制依赖文件",
            "RUN pip install --no-cache-dir -r requirements.txt 安装依赖",
            "COPY . . 复制应用代码",
            "CMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"] 启动命令"
          ],
          practice: "写 Dockerfile.v1（单阶段），requirements.txt 包含 fastapi、uvicorn、torch、torchvision、Pillow。构建镜像 docker build -f Dockerfile.v1 -t resnet-api:v1 .，然后 docker run -p 8000:8000 resnet-api:v1，curl 测试端点是否正常。记录镜像大小。",
          answer: "Dockerfile.v1 模板：\nFROM python:3.10\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nCMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]"
        },
        duration: "1.5小时",
        resources: [
          { title: "Dockerfile 官方参考", url: "https://docs.docker.com/engine/reference/builder/", required: true },
          { title: "pip requirements 文件格式", url: "https://pip.pypa.io/en/stable/reference/requirements-file-format/", required: true }
        ],
        checkpoint: "docker images 查看镜像大小，通常 > 5GB"
      },
      {
        day: 3,
        title: "多阶段构建：构建层与运行层分离",
        content: {
          objective: "使用多阶段构建分离编译环境和运行环境",
          api_checklist: [
            "FROM python:3.10 AS builder 创建编译阶段",
            "COPY --from=builder 复制编译产物",
            "FROM python:3.10-slim 精简运行环境",
            "RUN apt-get install -y --no-install-recommends 少量系统依赖"
          ],
          practice: "写 Dockerfile.v2（两阶段）：第一阶段用 python:3.10 安装所有编译工具，pip wheel --wheel-dir 预编译 torchvision；第二阶段用 python:3.10-slim 只安装预编译的 wheel 包。对比 v1 和 v2 的镜像大小差异。",
          answer: "两阶段关键段：\n# Stage 1: builder\nFROM python:3.10 AS builder\nRUN pip install --user torch torchvision\nRUN pip wheel --wheel-dir /wheels torchvision\n\n# Stage 2: runtime  \nFROM python:3.10-slim\nCOPY --from=builder /wheels /wheels\nRUN pip install --no-cache-dir --prefix=/opt/venv /wheels/*.whl\nENV PATH=/opt/venv/bin:$PATH"
        },
        duration: "2小时",
        resources: [
          { title: "Docker 多阶段构建文档", url: "https://docs.docker.com/build/building/multi-stage/", required: true },
          { title: "Python slim 镜像优化", url: "https://pythonspeed.com/articles/base-image-python/", required: false }
        ],
        checkpoint: "v2 镜像大小 < v1 的 60%（通常可从 6GB 降到 2-3GB）"
      },
      {
        day: 4,
        title: ".dockerignore 与构建上下文优化",
        content: {
          objective: "减少构建上下文体积，加速镜像构建",
          api_checklist: [
            ".dockerignore 排除无关文件",
            "__pycache__/ *.pyc .git/ 排除缓存和版本控制",
            "node_modules/ .venv/ 排除虚拟环境",
            "*.mp4 *.zip 大文件不上传"
          ],
          practice: "创建 .dockerignore 文件，排除 __pycache__/、*.pyc、.git/、.venv/、tests/、*.md、.gitignore。同时在 Dockerfile 中用 .dockerignore 配合 pip install 的 --no-deps 先安装核心依赖，验证 .dockerignore 生效后构建速度明显加快。",
          answer: ".dockerignore 示例：\n__pycache__\n*.pyc\n.git\n.gitignore\n.venv\nvenv\nenv\n*.md\nLICENSE\ntests\n*.mp4\n*.zip\ndata\nmodels/*.pt"
        },
        duration: "1小时",
        resources: [
          { title: ".dockerignore 官方文档", url: "https://docs.docker.com/engine/reference/builder/#dockerignore-file", required: true }
        ],
        checkpoint: "构建日志显示 COPY . . 时传输的文件列表中不包含 .git 和 __pycache__"
      },
      {
        day: 5,
        title: "Docker Compose 编排多容器服务",
        content: {
          objective: "用 Docker Compose 编排 API 服务和健康检查",
          api_checklist: [
            "docker-compose.yml 定义服务",
            "image / build 指定镜像或 Dockerfile",
            "ports 端口映射",
            "healthcheck 配置健康检查",
            "depends_on 服务依赖声明"
          ],
          practice: "写 docker-compose.yml：用 build: . 构建当前目录的 Dockerfile，服务名设为 resnet-api。配置 ports: ['8000:8000']，添加 healthcheck: {test: [\"CMD\", \"curl\", \"-f\", \"http://localhost:8000/health\"], interval: 30s, timeout: 10s}。添加 /health 端点返回 {\"status\": \"ok\"}。",
          answer: "docker-compose.yml：\nservices:\n  resnet-api:\n    build: .\n    ports:\n      - \"8000:8000\"\n    healthcheck:\n      test: [\"CMD\", \"curl\", \"-f\", \"http://localhost:8000/health\"]\n      interval: 30s\n      timeout: 10s\n      retries: 3\n    deploy:\n      resources:\n        limits:\n          memory: 4G"
        },
        duration: "1.5小时",
        resources: [
          { title: "Docker Compose 文件参考", url: "https://docs.docker.com/compose/compose-file/", required: true },
          { title: "Docker 健康检查", url: "https://docs.docker.com/engine/reference/builder/#healthcheck", required: true }
        ],
        checkpoint: "docker compose up -d 后 docker compose ps 显示 healthy 状态"
      },
      {
        day: 6,
        title: "镜像安全加固与最小化",
        content: {
          objective: "减少攻击面，移除非必要的 shell 和工具",
          api_checklist: [
            "RUN apt-get install -y --no-install-recommends 删除缓存",
            "rm -rf /var/lib/apt/lists/* 清理 apt 缓存",
            "USER www-data 使用非 root 用户运行",
            "EXPOSE 8000 声明端口"
          ],
          practice: "优化 Dockerfile.v2：添加 non-root 用户 www-data，Dockerfile 末尾加 USER www-data。确保 pip install 不带 --user 时使用 --prefix=/usr/local。apt-get 安装后清理 /var/lib/apt/lists/*。最终镜像执行 docker run --read-only 验证只读文件系统启动成功。",
          answer: "安全加固关键：\nRUN apt-get update && \\\n    apt-get install -y --no-install-recommends curl && \\\n    rm -rf /var/lib/apt/lists/*\n\nRUN useradd -m -u 1000 -s /bin/bash www-data\nCOPY --chown=www-data:www-data . .\nUSER www-data"
        },
        duration: "1.5小时",
        resources: [
          { title: "Docker 安全最佳实践", url: "https://docs.docker.com/develop/security/", required: true },
          { title: "Docker CIS Benchmark", url: "https://www.cisecurity.org/benchmark/docker", required: false }
        ],
        checkpoint: "docker run --read-only 启动成功，USER 为 www-data，非 root 运行"
      },
      {
        day: 7,
        title: "CI/CD 自动构建与推送",
        content: {
          objective: "GitHub Actions 自动构建并推送到 Docker Hub",
          api_checklist: [
            "docker/login-action 登录 Docker Hub",
            "docker/setup-buildx-action 构建 Kit",
            "docker/build-push-action 构建并推送",
            "tags: type=sha 动态版本标签"
          ],
          practice: "在项目 .github/workflows/docker.yml 中配置：push 到 main 分支时自动构建，tag 为 latest；push tag v* 时 tag 为对应版本号。用 docker/build-push-action，cache-from 指定上一版的镜像层缓存。验证：push 一个 git tag v0.1.0，GitHub Actions 自动构建并推送到 Docker Hub。",
          answer: "GitHub Actions workflow 核心：\n- uses: docker/login-action@v3\n  with:\n    username: ${{ secrets.DOCKERHUB_USERNAME }}\n    password: ${{ secrets.DOCKERHUB_TOKEN }}\n- uses: docker/build-push-action@v5\n  with:\n    context: .\n    push: true\n    tags: user/resnet-api:latest,user/resnet-api:${{ github.ref_name }}\n    cache-from: type=gha\n    cache-to: type=gha,mode=max"
        },
        duration: "2.5小时",
        resources: [
          { title: "GitHub Actions Docker 构建", url: "https://github.com/docker/build-push-action", required: true },
          { title: "GitHub Actions 缓存优化", url: "https://docs.docker.com/build/cache/backend/buildkit/", required: false }
        ],
        checkpoint: "GitHub Actions 显示构建成功，Docker Hub 仓库有对应 tag 的镜像"
      }
    ]
  },

  // =====================================================
  // Node: math-tensor-ops
  // =====================================================
  {
    id: "math-tensor-ops",
    name: "PyTorch 张量运算与广播机制",
    track: "math",
    duration: "1周",
    prerequisites: [],
    status: "locked",
    description: "围绕深度学习中的矩阵运算。重点解析 PyTorch 中的高维张量乘法（如 torch.matmul）与广播机制（Broadcasting）在实际神经网络前向传播中的应用。",
    outcomes: ["理解高维张量的维度语义", "掌握 matmul / mm / bmm 差异", "熟练运用广播机制避免显式维度扩展"],
    relatedIntel: ["010-numpy-pandas", "011-pytorch"],
    relatedTerms: ["tensor", "matrix-multiplication", "broadcasting", "torch.matmul", "reshape"],
    dailyTasks: [
      {
        day: 1,
        title: "张量创建与维度语义",
        content: {
          objective: "理解 PyTorch 张量的维度含义（batch/seq/feature）",
          api_checklist: [
            "torch.tensor([[[1,2],[3,4]]]) 创建 3D 张量",
            "tensor.shape / tensor.ndim 查看维度",
            "tensor[0] / tensor[:,0,:] 索引和切片",
            "torch.randn(B, N, D) 批量生成随机张量"
          ],
          practice: "写 tensor_shapes.py：用 torch.randn(8, 32, 128) 创建一个 B=8（batch size）、N=32（序列长度）、D=128（特征维度）的张量 x。验证：x.shape == (8, 32, 128)，x[:, 0, :].shape == (8, 128) 是第一个 token 的特征，x[0, :, :].shape == (32, 128) 是第一条样本的完整序列。",
          answer: "维度语义解释：\n# B=8: 8 个独立样本并行处理\n# N=32: 每个样本有 32 个位置（如 32 个 token）\n# D=128: 每个位置用 128 维向量表示\nx[:, 0, :]  # 所有 batch 的第一个 token 特征\nx[0, :, :]  # 第一条样本的完整 32 个 token 序列"
        },
        duration: "1.5小时",
        resources: [
          { title: "PyTorch 张量文档", url: "https://pytorch.org/docs/stable/tensors.html", required: true },
          { title: "张量维度约定 (NCHW vs NHWC)", url: "https://pytorch.org/docs/stable/generated/torch.randn.html", required: false }
        ],
        checkpoint: "能清晰解释 x[:, i:i+2, :].shape == (8, 2, 128) 的含义"
      },
      {
        day: 2,
        title: "矩阵乘法：matmul / mm / bmm / dot",
        content: {
          objective: "区分不同维度的矩阵乘法 API 及其适用场景",
          api_checklist: [
            "torch.mm(A, B) 2D × 2D 矩阵乘法",
            "torch.bmm(A, B) 3D batch 矩阵乘法 (B×N×M × B×M×K → B×N×K)",
            "torch.matmul(A, B) 高维泛化（自动适配不同维度组合）",
            "torch.einsum('bnk,bkd->bnd', A, B) 爱因斯坦求和"
          ],
          practice: "验证四种乘法的维度匹配规则：\n1. A@(B) 用 mm\n2. A(b,n,m) @ B(b,m,k) 用 bmm，结果 shape\n3. A(b,n,m) @ B(m,k) 用 matmul（触发广播），结果 shape\n4. 写 einsum 等价形式：torch.einsum('bik,bkj->bij', A, B)。\n用 assert 验证每种结果形状正确，数值等价。",
          answer: "维度规则：\ntorch.mm: (n,m) @ (m,k) → (n,k)\ntorch.bmm: (b,n,m) @ (b,m,k) → (b,n,k)\ntorch.matmul: 自动处理 - (b,n,m) @ (m,k) → (b,n,k) 广播\ntorch.einsum: 任意维度，通过索引字母指定乘法/求和顺序"
        },
        duration: "2小时",
        resources: [
          { title: "torch.matmul 官方文档", url: "https://pytorch.org/docs/stable/generated/torch.matmul.html", required: true },
          { title: "torch.einsum 文档", url: "https://pytorch.org/docs/stable/generated/torch.einsum.html", required: true }
        ],
        checkpoint: "能解释为什么 Linear 层权重 (W: [out_features, in_features]) 用 weight.t() 后可以用 matmul 直接计算 batch 推理"
      },
      {
        day: 3,
        title: "广播机制 Broadcasting 详解",
        content: {
          objective: "理解 PyTorch 自动广播的规则：右对齐，从后往前扩展",
          api_checklist: [
            "张量右对齐后每个维度需相等或为 1 或不存在",
            "torch.randn(B, 1, D) + torch.randn(1, N, D) → (B, N, D)",
            "tensor.unsqueeze(dim) 增加维度",
            "tensor.expand(B, -1, D) 扩展维度（不复制数据）"
          ],
          practice: "实现一个带位置偏置的注意力分数计算：\nscores = torch.matmul(q, k.transpose(-2, -1)) / sqrt(d_k)  # (B, N, N)\nbias = torch.randn(B, 1, N)  # (B, 1, N) 广播到 (B, N, N)\nscores = scores + bias\n验证 scores.shape == (B, N, N)，其中 bias 的 (B,1,N) 自动广播。",
          answer: "广播流程图：\nscores:     (B,  N,  N)\nbias:      (B,  1,  N)\n结果:       (B,  N,  N)  ← 从右往左，N match，1→N\n\n实际计算等价于 bias(b,0,n) 被加到 scores(b,i,n) 的每一行 i"
        },
        duration: "1.5小时",
        resources: [
          { title: "NumPy 广播官方文档", url: "https://numpy.org/doc/stable/user/basics.broadcasting.html", required: true },
          { title: "PyTorch broadcasting 语义", url: "https://pytorch.org/docs/stable/generated/torch.broadcast_shapes.html", required: true }
        ],
        checkpoint: "能用广播实现层归一化：layer_norm(x) = (x - mean) / std，其中 mean shape 为 (B, N, 1) 能正确广播到 (B, N, D)"
      },
      {
        day: 4,
        title: "Reshape / View / Permute 维度变换",
        content: {
          objective: "掌握张量变形与维度重排的正确用法",
          api_checklist: [
            "tensor.view(-1, D) 展平到 2D",
            "tensor.reshape(...) 相似但更宽松（copy 不必需时也可返回视图）",
            "tensor.permute(0, 2, 1) 维度重排",
            "tensor.transpose(dim0, dim1) 交换两个维度"
          ],
          practice: "写一个 reshape_attention.py：将 batch self-attention 的输入 x (B, N, D) 通过 view 重排为多头形式：\nnum_heads = 8\nhead_dim = D // num_heads\nx = x.view(B, N, num_heads, head_dim).permute(0, 2, 1, 3)  # (B, 8, N, head_dim)\n最后再转回来，用 assert 验证信息不丢失（数值完全相等）。",
          answer: "维度追踪：\nx: (B, N, D=512)\n↓ view(B, N, 8, 64)\n↓ permute(0, 2, 1, 3)\n→ (B, 8, N, 64)\n↓ .reshape(B, N, D) 或 .permute(0, 2, 1).contiguous().view(B, N, D)\n→ (B, N, D) 完全恢复"
        },
        duration: "1.5小时",
        resources: [
          { title: "tensor.view vs reshape", url: "https://pytorch.org/docs/stable/generated/torch.Tensor.view.html", required: true },
          { title: "PyTorch contiguous 文档", url: "https://pytorch.org/docs/stable/generated/torch.Tensor.contiguous.html", required: true }
        ],
        checkpoint: "assert torch.allclose(original, reconstructed)，说明多头 reshape + 还原是无损操作"
      },
      {
        day: 5,
        title: "手写 MLP / Linear Layer 前向传播",
        content: {
          objective: "用张量运算实现一个完整 MLP 层的 forward",
          api_checklist: [
            "nn.Linear(in_features, out_features) 权重 shape",
            "F.linear(x, weight, bias) 等价手动计算",
            "torch.cat([x1, x2], dim=-1) 拼接多个输入",
            "F.gelu / F.relu 激活函数的 broadcast 特性"
          ],
          practice: "不依赖 nn.Linear，手写 MLP 层：\nclass ManualMLP(nn.Module):\n    def __init__(self, d_model, d_ff):\n        self.W1 = nn.Parameter(torch.randn(d_model, d_ff))\n        self.b1 = nn.Parameter(torch.zeros(d_ff))\n        self.W2 = nn.Parameter(torch.randn(d_ff, d_model))\n        self.b2 = nn.Parameter(torch.zeros(d_model))\n    def forward(self, x):  # x: (B, N, d_model)\n        return ???\n验证与 nn.Sequential(nn.Linear(d_model, d_ff), nn.GELU(), nn.Linear(d_ff, d_model)) 的输出数值完全一致。",
          answer: "forward 实现：\ndef forward(self, x):\n    # x: (B, N, d_model)\n    h = torch.matmul(x, self.W1) + self.b1  # (B, N, d_ff) 广播\n    h = F.gelu(h)\n    out = torch.matmul(h, self.W2) + self.b2  # (B, N, d_model)\n    return out"
        },
        duration: "2小时",
        resources: [
          { title: "nn.Linear 源码实现", url: "https://pytorch.org/docs/stable/generated/torch.nn.Linear.html", required: true },
          { title: "F.gelu 实现", url: "https://pytorch.org/docs/stable/generated/nn.functional.gelu.html", required: true }
        ],
        checkpoint: "ManualMLP 与 nn.Sequential 输出差值 < 1e-6（浮点误差范围内相等）"
      },
      {
        day: 6,
        title: "Batch Matrix Multiply 实现 Transformer Attention",
        content: {
          objective: "综合运用 matmul + mask + softmax 实现 Scaled Dot-Product Attention",
          api_checklist: [
            "torch.matmul(Q, K.transpose(-2, -1)) 计算注意力分数",
            "torch.nn.functional.softmax(score, dim=-1) 归一化",
            "torch.where(mask, scores, scores.new_full(..., -1e9)) 应用 mask",
            "torch.matmul(attn_weights, V) 聚合值向量"
          ],
          practice: "实现 scaled_dot_product_attention 函数：\ndef scaled_dot_product_attention(Q, K, V, mask=None):\n    d_k = Q.size(-1)\n    scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)\n    if mask is not None:\n        scores = torch.where(mask.bool(), scores, torch.full_like(scores, -1e9))\n    attn_weights = F.softmax(scores, dim=-1)\n    return torch.matmul(attn_weights, V), attn_weights\n验证：输入 (B=2, num_heads=8, N=32, dk=64)，输出 shape 正确，attn_weights 每行和为 1。",
          answer: "完整 forward：\ndef scaled_dot_product_attention(Q, K, V, mask=None):\n    d_k = Q.size(-1)\n    scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)\n    if mask is not None:\n        scores = scores.masked_fill(mask == 0, -1e9)\n    attn_weights = F.softmax(scores, dim=-1)\n    return torch.matmul(attn_weights, V), attn_weights"
        },
        duration: "2.5小时",
        resources: [
          { title: "PyTorch scaled_dot_product_attention（官方实现）", url: "https://pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html", required: true },
          { title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", required: true }
        ],
        checkpoint: "与 F.scaled_dot_product_attention 的输出差值 < 1e-5，mask 正确屏蔽了 padding 位置"
      },
      {
        day: 7,
        title: "综合：用张量运算实现一个微型 GPT",
        content: {
          objective: "串联张量运算知识，实现一个可运行的微型 GPT 前向传播",
          api_checklist: [
            "nn.Embedding 词嵌入与位置编码",
            "第 6 天的 scaled_dot_product_attention",
            "nn.ModuleList 堆叠 Transformer Block",
            "tensor.contiguous().view() 展平输出",
            "nn.Linear 投影到词表大小"
          ],
          practice: "实现一个 TinyGPT：vocab_size=1000, d_model=128, num_heads=4, num_layers=2, max_len=64。用随机初始化的输入 token_ids (B=4, N=32) 测试 forward，验证输出 logits shape == (4, 32, 1000)。打印参数量，确认 < 1M。",
          answer: "结构概览：\nclass TinyGPT(nn.Module):\n    def __init__(self):\n        self.token_emb = nn.Embedding(1000, 128)\n        self.pos_emb = nn.Embedding(64, 128)\n        self.blocks = nn.ModuleList([TransformerBlock(128, 4) for _ in range(2)])\n        self.ln = nn.LayerNorm(128)\n        self.lm_head = nn.Linear(128, 1000)\n    def forward(self, x):\n        x = self.token_emb(x) + self.pos_emb(torch.arange(x.size(1)))\n        for block in self.blocks:\n            x = block(x)\n        x = self.ln(x)\n        return self.lm_head(x)"
        },
        duration: "3小时",
        resources: [
          { title: "minGPT 实现参考", url: "https://github.com/karpathy/minGPT", required: false },
          { title: "LayerNorm broadcasting", url: "https://pytorch.org/docs/stable/generated/torch.nn.LayerNorm.html", required: true }
        ],
        checkpoint: "Forward 成功运行，输出 logits shape 正确，参数量约 700K（< 1M），loss 有下降趋势"
      }
    ]
  },

  // =====================================================
  // Node: cv-pose-estimation
  // =====================================================
  {
    id: "cv-pose-estimation",
    name: "人体姿态估计",
    track: "cv",
    duration: "1周",
    prerequisites: ["cv-instance-segmentation"],
    status: "locked",
    position: { x: 750, y: 220 },
    description: "基于 YOLOv8-pose / HRNet 的关键点检测与行为识别。从 COCO 17 点标注格式到实时摄像头动作告警。",
    outcomes: ["掌握关键点数据集标注与模型训练", "实现基于骨架序列的简单动作分类"],
    relatedIntel: ["002-yolo"],
    relatedTerms: ["keypoint", "pose-estimation", "hrnet", "coco-format", "action-recognition"],
    dailyTasks: [
      {
        day: 1,
        title: "关键点检测基础与 COCO 17 点格式",
        content: {
          objective: "理解关键点检测任务，掌握 COCO 17 关键点格式与主流模型（YOLOv8-pose / HRNet）",
          api_checklist: [
            "ultralytics.YOLO('yolov8n-pose.pt') 加载关键点模型",
            "COCO keypoint 格式：[x1,y1,v1, x2,y2,v2, ...]（v=2 可见, v=1 遮挡, v=0 缺失）",
            "results[0].keypoints.data 获取 (N, 17, 3) 张量",
            "keypoints.xy[0] 取第一个人的 17 个关键点坐标"
          ],
          practice: "写 pose_demo.py：加载 yolov8n-pose.pt，对单张站立人像做推理，用 cv2.circle 在原图上画出 17 个关键点并用 cv2.line 按骨架顺序（鼻子→双眼→双耳→双肩→双肘→双手→双髋→双膝→双脚）连接。输出到 pred_pose.jpg。",
          answer: "骨架连接对（COCO 17 点索引：0=nose, 1-4=眼耳, 5-6=shoulder, 7-8=elbow, 9-10=wrist, 11-12=hip, 13-14=knee, 15-16=ankle）：\nconst LIMBS = [[5,6],[5,7],[7,9],[6,8],[8,10],[11,12],[11,13],[13,15],[12,14],[14,16],[0,1],[0,2],[1,3],[2,4],[5,11],[6,12]];"
        },
        duration: "2小时",
        resources: [
          { title: "Ultralytics YOLO Pose 文档", url: "https://docs.ultralytics.com/tasks/pose/", required: true },
          { title: "COCO Keypoints 任务说明", url: "https://cocodataset.org/#keypoints-2020", required: false }
        ],
        checkpoint: "pred_pose.jpg 上关键点与骨架连线清晰合理"
      },
      {
        day: 2,
        title: "自定义关键点数据集标注与训练",
        content: {
          objective: "学会从零标注关键点数据并微调 YOLOv8-pose 模型",
          api_checklist: [
            "Labelme / CVAT 标注关键点标签（每张图标注 17 个点 + 对应 person bbox）",
            "YOLO pose 标签格式：class_id x_center y_center w h x1 y1 v1 x2 y2 v2 ...（归一化）",
            "自定义 dataset.yaml：必须包含 kpt_shape（如 [17, 3]）和 flip_idx",
            "model.train(data='pose.yaml', task='pose', epochs=20, imgsz=640)"
          ],
          practice: "在 Labelme 中至少标注 15 张人像（站立/坐姿/举手等），写 convert_labelme_to_yolopose.py 将每张图的 polygon bbox + 17 个 point 标签转成 YOLO pose 格式 .txt。写 pose.yaml（nc=1, names=['person'], kpt_shape=[17,3]），启动 yolov8n-pose 训练 20 epochs。",
          answer: "flip_idx 指明水平翻转时哪些点需要对调：对于 COCO 17 点：\nflip_idx = [0, 2,1, 4,3, 6,5, 8,7, 10,9, 12,11, 14,13, 16,15]\ndataset.yaml 中加上：\nkpt_shape: [17, 3]\nflip_idx: [0,2,1,4,3,6,5,8,7,10,9,12,11,14,13,16,15]"
        },
        duration: "2.5小时",
        resources: [
          { title: "YOLOv8 Pose 训练指南", url: "https://docs.ultralytics.com/modes/train/", required: true },
          { title: "HRNet 论文", url: "https://arxiv.org/abs/1902.09212", required: false }
        ],
        checkpoint: "训练结束后 mAP50 > 0.6，对未见过的测试图推理能给出合理的骨架"
      },
      {
        day: 3,
        title: "姿态估计推理与骨架可视化 Pipeline",
        content: {
          objective: "封装推理-可视化 Pipeline，支持视频批量推理",
          api_checklist: [
            "results = model.predict(source='video.mp4', stream=True, conf=0.35) 流式推理视频",
            "keypoints.xyn 取归一化坐标（0~1）便于在任意尺寸图上绘制",
            "cv2.VideoWriter(*'mp4v', fps, (w,h)) 写出带骨架的视频",
            "计算每帧各点的置信度过滤低质量预测"
          ],
          practice: "写 pose_video.py：对一段 10~30 秒的人物动作视频（挥手/跳跃/行走）逐帧推理，画骨架后输出 output_pose.mp4。另外写一个函数 draw_skeleton(img, keypoints_xy, conf_thr=0.5) 供后续复用。",
          answer: "draw_skeleton 核心思路：\nfor (p1, p2) in LIMBS:\n  if conf[p1] > thr and conf[p2] > thr:\n    cv2.line(img, p1, p2, (0,255,0), 2)\nfor i, (x, y) in enumerate(kpts):\n  if conf[i] > thr:\n    cv2.circle(img, (int(x), int(y)), 3, (0,0,255), -1)"
        },
        duration: "2小时",
        resources: [
          { title: "OpenCV VideoWriter 文档", url: "https://docs.opencv.org/4.x/dd/d43/tutorial_py_video_display.html", required: true }
        ],
        checkpoint: "output_pose.mp4 播放时，人物动作的骨架连线跟随自然移动"
      },
      {
        day: 4,
        title: "行为识别：基于关键点序列的动作分类",
        content: {
          objective: "用关键点时序特征做简单的动作分类（如 standing / waving / walking）",
          api_checklist: [
            "对一段 N 帧视频提取 (N, 17, 2) 骨架序列（只保留 xy，丢弃置信度）",
            "对坐标做以肩部中点为原点的归一化（或按髋-肩距离缩放），获得姿态无关位置的特征",
            "简单方法：计算每帧的统计特征（如 双手-肩垂直距离、双手速度、膝关节角度）→ 喂给 LightGBM / 小型 MLP",
            "进阶方法：对 (N, 17*2) 用 Temporal Conv1d / LSTM 做端到端动作分类"
          ],
          practice: "录制 3 类动作各 5 段短片段（共 15 段，每段 30~60 帧），提取骨架序列。写 action_classifier.py：对每段按帧抽取 10 维手工特征（如左右手腕相对肩部的 y 偏移、手腕速度等），训练一个 sklearn LogisticRegression / LightGBM，在留出样本上验证精度。",
          answer: "骨架归一化以消除人物在画面中的位置/大小：\nmid_shoulder = (kpts[5] + kpts[6]) / 2\nmid_hip = (kpts[11] + kpts[12]) / 2\nscale = norm(mid_shoulder - mid_hip)\nkpts_norm = (kpts - mid_shoulder) / (scale + 1e-6)\n该归一化让特征对人物远近/位置鲁棒"
        },
        duration: "2.5小时",
        resources: [
          { title: "scikit-learn 分类器文档", url: "https://scikit-learn.org/stable/supervised_learning.html", required: true },
          { title: "ST-GCN 基于图的动作识别（进阶）", url: "https://arxiv.org/abs/1801.07455", required: false }
        ],
        checkpoint: "在 3 类动作的 3 段留出视频上，分类准确率 > 80%"
      },
      {
        day: 5,
        title: "端到端：实时摄像头姿态估计与动作告警",
        content: {
          objective: "整合摄像头实时推理 + 动作分类 + 告警逻辑的完整应用",
          api_checklist: [
            "cv2.VideoCapture(0) 打开本机摄像头",
            "cap.read() 逐帧读取 → model.predict() → 绘制骨架 → 动作分类",
            "维护一个最近 15 帧的滑动窗口，平均模型预测概率作为当前动作",
            "当连续 N 帧识别为异常动作（如 fall/wave_sos）时打印/声音告警"
          ],
          practice: "写 live_pose_app.py：摄像头实时推理 + 绘制骨架 + 左上角显示当前识别的动作名 + 置信度条。定义一个自定义'告警动作'（比如双手举过头顶停留 3 秒），触发时在终端打印 ALERT + 高亮画面。",
          answer: "滑动窗口平滑：\ndeque(maxlen=15) 保存最近 15 帧的分类结果；\ncurrent_action = Counter(deque).most_common(1)[0][0]\n这样避免单帧抖动导致的误报。"
        },
        duration: "3小时",
        resources: [
          { title: "OpenCV VideoCapture 文档", url: "https://docs.opencv.org/4.x/dd/d43/tutorial_py_video_display.html", required: true }
        ],
        checkpoint: "python live_pose_app.py 能无延迟地显示带骨架的画面，并能正确识别到 2~3 种自定义动作"
      }
    ]
  },

  // =====================================================
  // Node: cv-ocr
  // =====================================================
  {
    id: "cv-ocr",
    name: "OCR 文字识别",
    track: "cv",
    duration: "1周",
    prerequisites: ["cv-instance-segmentation"],
    status: "locked",
    position: { x: 750, y: 400 },
    description: "从 PaddleOCR 开箱使用到自定义 DBNet 检测 + CRNN/TrOCR 识别的全流程，覆盖文档版面分析与票据结构化。",
    outcomes: ["能在中文票据场景下达到可用的 OCR 精度", "理解 DBNet 检测与 CRNN 序列识别原理"],
    relatedIntel: ["002-yolo"],
    relatedTerms: ["ocr", "paddleocr", "dbnet", "crnn", "trocr", "layout-analysis"],
    dailyTasks: [
      {
        day: 1,
        title: "PaddleOCR 开箱使用",
        content: {
          objective: "掌握 PaddleOCR 中文模型的安装与推理：文字检测 + 识别 + 方向分类",
          api_checklist: [
            "pip install paddleocr paddlepaddle",
            "from paddleocr import PaddleOCR; ocr = PaddleOCR(use_angle_cls=True, lang='ch')",
            "result = ocr.ocr('img.jpg', cls=True) 返回 [[box, (text, score)], ...]",
            "PaddleOCR 内部三阶段：DBNet 检测 → 角度分类 → CRNN 识别"
          ],
          practice: "找 3 张包含中文的实拍图片（名片/菜单/路牌），写 paddleocr_demo.py：对每张图推理，把 bbox 用 cv2.polylines 画到图上，把 text+score 打印出来。观察角度倾斜、光照不均、手写字体等场景的失败案例。",
          answer: "结果解析：\nresult[0] 是第一张图的结果列表，每项为 [polygon_4_points, (text, confidence)]\nfor line in result[0]:\n  box, (text, score) = line[0], line[1]\n  print(f'{score:.2f} {text}')"
        },
        duration: "2小时",
        resources: [
          { title: "PaddleOCR GitHub 仓库", url: "https://github.com/PaddlePaddle/PaddleOCR", required: true },
          { title: "PaddleOCR 快速上手", url: "https://github.com/PaddlePaddle/PaddleOCR/blob/release/2.7/doc/doc_ch/quickstart.md", required: true }
        ],
        checkpoint: "至少在一张清晰中文图上获得多数文字的正确识别"
      },
      {
        day: 2,
        title: "文字检测：Scene Text Detection 与自定义检测模型",
        content: {
          objective: "理解 DBNet（Differentiable Binarization）原理，并训练自定义场景文本检测模型",
          api_checklist: [
            "DBNet 核心：预测一个 probability map + threshold map，通过可微二值化得到近似文本区域",
            "ICDAR / TotalText / CTW-1500 等常用公开中文/英文场景文本数据集",
            "按 PaddleOCR 标注格式准备自定义数据：图像 + txt（每行：img_path [{\"transcription\":..., \"points\":[[x,y]x4]}] JSON）",
            "python tools/train.py -c configs/det/det_R_50_vd_db.yml"
          ],
          practice: "从自己手机拍 20 张含文字的场景图，用 Labelme 用 polygon 逐字标注文本区域，写 convert_labelme_to_paddleocr_det.py 转换为 PaddleOCR 检测训练格式。用 15 张 train / 5 张 val，基于 PP-OCRv3_det 预训练权重 freeze backbone 训练 100 轮，对比 hmean 变化。",
          answer: "PaddleOCR 检测训练集一行示例：\ndata/img1.jpg  [{\"transcription\": \"你好\", \"points\": [[12,13],[240,15],[240,55],[12,55]]}]\n评估指标 hmean = 2*precision*recall/(precision+recall)，需要 precision 和 recall 同时提升"
        },
        duration: "2.5小时",
        resources: [
          { title: "DBNet 论文", url: "https://arxiv.org/abs/1911.08947", required: false },
          { title: "PaddleOCR 检测模型训练", url: "https://github.com/PaddlePaddle/PaddleOCR/blob/release/2.7/doc/doc_ch/detection.md", required: true }
        ],
        checkpoint: "自定义检测模型在 val 的 hmean > 0.75"
      },
      {
        day: 3,
        title: "文字识别：CRNN / TrOCR 与自定义字符集",
        content: {
          objective: "掌握序列到序列文字识别的两类主流方案：CRNN（CNN+LSTM+CTC）与 TrOCR（图像 Transformer）",
          api_checklist: [
            "CRNN = ResNet backbone → BiLSTM 编码序列 → CTC Loss 对齐文本",
            "TrOCR = ViT 图像编码 + Transformer 解码器（自回归），适合手写/艺术字体等复杂场景",
            "自定义 dict.txt：每行一个字符（中英混合 + 数字符号）",
            "PaddleOCR 识别训练：python tools/train.py -c configs/rec/PP-OCRv3/rec_PP-OCRv3.yml",
            "huggingface transformers: VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-handwritten')"
          ],
          practice: "准备 1000 张带文字的裁剪图像 + 对应 txt（每行：img_path  label），字符集大小约 200~500（中文常用字符 + 英文数字）。训练 CRNN 风格的 PP-OCRv3_rec 200 步，观察 val_acc 增长。另外跑一次 TrOCR-small-Chinese（huggingface）对相同图像推理，对比两者在长行 / 艺术字 / 手写三种场景下的表现。",
          answer: "CTC Loss 的直觉：允许网络在每帧输出'字符'或'空白'，然后在所有可能的对齐方式上取概率和。解码时取每个时间步 argmax 的字符序列，再合并重复并去空白。\nTrOCR 解码策略：beam search（beam_size=5）通常比 greedy 好，但更慢。"
        },
        duration: "2.5小时",
        resources: [
          { title: "CRNN 论文", url: "https://arxiv.org/abs/1507.05717", required: false },
          { title: "TrOCR 论文 / HF 模型", url: "https://arxiv.org/abs/2109.10282", required: false },
          { title: "PaddleOCR 识别训练", url: "https://github.com/PaddlePaddle/PaddleOCR/blob/release/2.7/doc/doc_ch/recognition.md", required: true }
        ],
        checkpoint: "CRNN 在 val 的字符/整句准确率分别 > 0.90 / > 0.70；TrOCR 在手写测试上显著优于 CRNN"
      },
      {
        day: 4,
        title: "文档结构化：表格识别与版面分析（LayoutLM）",
        content: {
          objective: "将 OCR 结果进一步结构化：识别表格行列结构 + 用 LayoutLM 对文档按标题/正文/表格等区域分类",
          api_checklist: [
            "PaddleStructure / TableMASTER 做表格结构识别（预测 cell 坐标 + 行列关系 → 输出 HTML table）",
            "LayoutLM / LayoutLMv2：把 OCR 的 bbox + text + image patch 一起输入 BERT，做文档版面分类或 NER",
            "huggingface 使用：LayoutLMForTokenClassification.from_pretrained('microsoft/layoutlm-base-uncased')",
            "FUNSD / RVL-CDIP 等文档理解数据集"
          ],
          practice: "拍 3 张包含表格的文档照片（如成绩单/发票）。1) 用 PaddleOCR 的表格识别跑 inference，把结果保存为 .html 表格，人工检查列是否正确。2) 使用 microsoft/layoutlm-base-uncased 在 FUNSD 上微调一个表单字段 NER 模型（至少 200 步），对自己的测试图片做推理，看能否识别出'公司名''地址''金额'等标签。",
          answer: "LayoutLM 的输入：input_ids (token) + bbox（每个 token 在页面上的 x1,y1,x2,y2, 归一化到 0-1000）+ attention_mask。bbox 让模型知道 token 的物理位置，这是它相比纯文本 BERT 的关键优势。\n表格 OCR 的常见失败点：无框线表格、竖线断裂、跨页合并单元格。"
        },
        duration: "2小时",
        resources: [
          { title: "LayoutLM 论文", url: "https://arxiv.org/abs/1912.13318", required: false },
          { title: "HF LayoutLM 文档", url: "https://huggingface.co/docs/transformers/model_doc/layoutlm", required: true },
          { title: "Paddle Structure 表格识别", url: "https://github.com/PaddlePaddle/PaddleOCR/blob/release/2.7/doc/doc_ch/structure.md", required: true }
        ],
        checkpoint: "至少有一张表格成功以 HTML 表格形式完整呈现；LayoutLM NER 在 FUNSD test 的 F1 > 0.6"
      },
      {
        day: 5,
        title: "综合：发票/票据结构化识别 Pipeline",
        content: {
          objective: "整合检测→识别→版面分析，把一张票据图片抽成 JSON key-value 结构化数据",
          api_checklist: [
            "总流程：img → DBNet 得文本行 bbox → 按行排序 → CRNN/TrOCR 识别每行文字 → LayoutLM NER 标注'开票日期''金额''公司名'等字段 → 输出 JSON",
            "排序策略：按行 bbox y_center 聚类分组（y 差值 < threshold 的视为同一行），同一行按 x 排序",
            "字段规则：'金额'字段后通常紧跟数字；'开票日期'字段可以用日期正则再次校验",
            "最后输出 schema：{\"company\": \"xxx\", \"date\": \"yyyy-mm-dd\", \"amount_total\": \"123.45\", ...}"
          ],
          practice: "收集 5 张真实发票（或从公开票据数据集里取），写 invoice_pipeline.py：读入图像 → PaddleOCR 跑检测+识别 → 按行/列聚类重建阅读顺序 → 用关键字 + 正则抽公司名、金额、日期、税号等字段 → 打印 JSON。至少在 3/5 张图上让人工检查：关键字段均被正确抽出。",
          answer: "后处理关键思路：\n1) 按行聚类：sorted(lines, key=lambda x: x['y_center'])，再用阈值合并同一行；\n2) 行内再按 x_center 排序得到阅读顺序；\n3) 正则匹配金额 (\\d+\\.\\d{2})、日期 (\\d{4}[-年]\\d{1,2}[-月]\\d{1,2})；\n4) 基于'开票单位''价税合计''开票日期'等强关键字，取其同行/下一行作为值。"
        },
        duration: "3小时",
        resources: [
          { title: "公开票据数据集（中文 OCR 任务常用）", url: "https://aistudio.baidu.com/aistudio/datasetdetail/127958", required: false }
        ],
        checkpoint: "pipeline 在 5 张发票上跑通并输出完整 JSON；至少 3 张的所有关键字段正确"
      }
    ]
  },

  // =====================================================
  // Node: cv-diffusion
  // =====================================================
  {
    id: "cv-diffusion",
    name: "扩散模型与图像生成",
    track: "cv",
    duration: "2周",
    prerequisites: ["cv-cnn"],
    status: "locked",
    position: { x: 470, y: 440 },
    description: "从 DDPM 数学直觉到 Stable Diffusion / FLUX 实战：LoRA 微调、ControlNet 条件控制、ComfyUI 工作流、产品图自动生成 Pipeline。",
    outcomes: ["理解扩散模型前向/反向过程", "能独立做 LoRA 微调 + ControlNet 条件生成", "搭建一个可复用的图像生成工作流"],
    relatedIntel: ["006-cnn-basics"],
    relatedTerms: ["diffusion", "stable-diffusion", "lora", "controlnet", "comfyui", "flux", "image-generation"],
    dailyTasks: [
      {
        day: 1,
        title: "扩散模型数学直觉与 DDPM",
        content: {
          objective: "理解扩散模型的前向加噪与反向去噪过程，写一个最小 DDPM 在 MNIST 上跑通",
          api_checklist: [
            "前向过程：x_t = sqrt(1-β_t) * x_{t-1} + sqrt(β_t) * ε，ε~N(0,I)；等价形式 x_t = sqrt(ᾱ_t) x_0 + sqrt(1-ᾱ_t) ε",
            "反向过程：学习一个 UNet 模型 ε_θ(x_t, t) 来预测噪声，从 x_T 迭代采样得到 x_0",
            "训练目标：L = E[ || ε - ε_θ(x_t, t) ||² ]，t 从 1..T 中随机采样",
            "Positional embedding 对时间步 t 编码（与 Transformer 的正弦位置编码相同）"
          ],
          practice: "写最小可运行的 ddpm_mnist.py：训练一个 4 层 UNet（无 attention 版本），β 线性调度（β_start=1e-4, β_end=0.02，T=1000），在 MNIST 上训练 30 epochs。每训练完一个 epoch 采样 16 张图保存为 denoising_progress_epoch_{e}.png。",
          answer: "采样公式（DDPM 论文 Algorithm 2）：\nz = randn_like(x) if t > 1 else 0\nα_t = 1 - β_t, ᾱ_t = cumprod(α_t)[t]\nx_{t-1} = (1/sqrt(α_t)) * (x_t - (β_t/sqrt(1-ᾱ_t)) * ε_pred) + sqrt(β_t) * z\n直观：先'预测移除的噪声'得到 x_0 估计，再加上一个与噪声水平成比例的随机抖动。"
        },
        duration: "2.5小时",
        resources: [
          { title: "DDPM 论文（必读）", url: "https://arxiv.org/abs/2006.11239", required: true },
          { title: "What are Diffusion Models（英文图解讲解）", url: "https://lilianweng.github.io/posts/2021-07-11-diffusion-models/", required: false },
          { title: "PyTorch 参考实现（用于调试对照）", url: "https://github.com/lucidrains/denoising-diffusion-pytorch", required: false }
        ],
        checkpoint: "训练 30 epochs 后，采样图像能看出手写数字轮廓，不再是纯噪声"
      },
      {
        day: 2,
        title: "Stable Diffusion WebUI 使用与 Prompt 工程",
        content: {
          objective: "掌握 Stable Diffusion 的基本组件（UNet / VAE / CLIP Text Encoder）并熟练使用 WebUI",
          api_checklist: [
            "核心组件：Text Encoder（CLIP ViT-L/14）把 prompt 编码 → UNet 在 latent 空间上预测噪声 → VAE decoder 把 4×64×64 还原成 3×512×512 图像",
            "CFG Scale：Classifier-Free Guidance，控制 prompt 对齐程度，常用 7-12",
            "Sampler 选择：DPM++ 2M Karras / Euler a / DDIM 速度-质量权衡",
            "正向 prompt 结构：主体 + 风格描述词 + 质量词（masterpiece, best quality, highly detailed）+ 镜头/光线；反向 prompt：排除模糊/低质量/畸形词",
            "Seed：固定 seed 可以复现结果，是调试 prompt 的关键"
          ],
          practice: "使用 SD 1.5 或 SDXL 的官方 WebUI（Automatic1111 / ComfyUI），做三种任务：1) 人像全身像（自定义 5 条不同服饰的 prompt，固定 seed 观察风格变化）；2) logo 设计（simple, flat vector style）；3) 室内场景渲染。每张保存图像 + 对应 prompt 到一个 markdown 文档，做'个人 prompt 模板库'。",
          answer: "高质量稳定 Prompt 模板：\n正面：'a photo of a young woman wearing a white dress, standing in a garden, soft sunlight from side, depth of field, 85mm lens, f/1.8, masterpiece, best quality, highly detailed'\n负面：'lowres, blurry, jpeg artifacts, ugly, deformed, bad anatomy, bad hands, extra fingers, watermark, text, signature'\n调参建议：steps=25-30, CFG=7, sampler=DPM++ 2M Karras, 分辨率=512x768（SD1.5）或 1024x1024（SDXL）。"
        },
        duration: "2小时",
        resources: [
          { title: "Stable Diffusion WebUI GitHub", url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui", required: true },
          { title: "ComfyUI（节点化工作流）", url: "https://github.com/comfyanonymous/ComfyUI", required: false },
          { title: "SD 官方博客：Stable Diffusion 解读", url: "https://stability.ai/news/stable-diffusion-public-release", required: false }
        ],
        checkpoint: "产出 9 张（3 任务 x 3 变体）由自己 prompt 生成的图像，并建立一份可复用的 prompt 模板"
      },
      {
        day: 3,
        title: "LoRA 微调 Stable Diffusion",
        content: {
          objective: "学习 LoRA（Low-Rank Adaptation）并基于 kohya-ss 脚本训练自己的风格/人物 LoRA",
          api_checklist: [
            "LoRA 原理：对 Attention 的 Q/K/V/O 矩阵做低秩分解 A×B 训练，仅占原模型参数 < 1%，加载时与主干权重相加",
            "数据准备：一个概念（人物/产品/风格）~15-20 张图，等比裁剪 512x512（SD1.5）或 1024x1024（SDXL）",
            "标注：用 BLIP / WD14-tagger 自动生成 caption，再人工修正。trigger word = 你的独特标识符（如 sks）",
            "训练脚本：kohya-ss/sd-scripts 的 train_network.py（network_module=networks.lora, network_dim=16, network_alpha=16）",
            "训练轮次：一个概念通常 10-20 epochs × repeat=5 ≈ 500-2000 步；每隔 500 步保存一个快照人工挑选"
          ],
          practice: "训练一个自己的人物/风格 LoRA：1) 收集 15-20 张同一人物或同一风格图像；2) 用 BLIP 生成 caption，在每个 caption 开头加入 trigger word（例如 'sks person'）；3) 基于 SD1.5，用 kohya-ss GUI 或 sd-scripts 训练一个 LoRA（rank=16, lr=1e-4, batch=2, epoch=20, save every 5 epoch）；4) 比较 epoch 5/10/20 的结果，挑一个最好的在 WebUI 中用 prompt '<trigger> person, ...' 做推理验证。",
          answer: "关键参数调优经验：\n- network_dim：4~64，越大越'强'但越容易过拟合；16 是通用起点。\n- network_alpha：一般等于 network_dim 或取一半。\n- learning_rate：text_encoder_lr=5e-5, unet_lr=1e-4 是常用配置；只训 UNet 更快但风格保真度略低。\n- SNR gamma=5.0（min-SNR-gamma）让训练更稳定。\n加载方式：WebUI 把 .safetensors 放 models/Lora，prompt 中用 <lora:文件名:权重> 动态注入。"
        },
        duration: "3小时",
        resources: [
          { title: "LoRA 论文（必读）", url: "https://arxiv.org/abs/2106.09685", required: true },
          { title: "kohya-ss sd-scripts", url: "https://github.com/kohya-ss/sd-scripts", required: true },
          { title: "DreamBooth + LoRA 教程（Colab 可跑）", url: "https://github.com/ShivamShrirao/diffusers/tree/main/examples/dreambooth", required: false }
        ],
        checkpoint: "产出可在 WebUI 加载的 .safetensors LoRA 文件，trigger word 能稳定唤起目标概念"
      },
      {
        day: 4,
        title: "ControlNet 条件控制与 IP-Adapter",
        content: {
          objective: "掌握 ControlNet（Canny / Depth / Pose 条件）和 IP-Adapter（图像参考图风格迁移），让生成结果可控",
          api_checklist: [
            "ControlNet = 冻结的 SD UNet + 可训练的'条件编码分支'，在每一层 UNet 注入额外条件信号",
            "常见条件：canny（边缘）、depth（深度图）、openpose（骨架）、lineart（线稿）、seg（语义分割）",
            "多 ControlNet：同时传入 canny + openpose，权重各 0.8-1.0，让构图与姿态都受控",
            "IP-Adapter：传入一张参考图像（而非 prompt），让生成结果模仿其人物/服装/风格",
            "在 diffusers 中使用：ControlNetModel + StableDiffusionControlNetPipeline / IPAdapterMixin"
          ],
          practice: "做 4 个实验并保存各自结果：1) Canny ControlNet：给一张线稿/海报边缘 → 生成照片风图像；2) Depth ControlNet：提供一张 3D 房间的深度图 → 生成室内图；3) OpenPose ControlNet：第 1 周生成的骨架图 → 生成相同姿态的人物；4) IP-Adapter：传入一张产品图作为参考 → 保持其主体外形，改变背景。另外写一个 diffusers 小脚本（50 行内）演示 ControlNet canny 的最小用法。",
          answer: "diffusers 版 ControlNet 核心调用：\nfrom diffusers import StableDiffusionControlNetPipeline, ControlNetModel\ncontrolnet = ControlNetModel.from_pretrained('lllyasviel/sd-controlnet-canny')\npipe = StableDiffusionControlNetPipeline.from_pretrained('runwayml/stable-diffusion-v1-5', controlnet=controlnet)\nimage = pipe('a futuristic city', image=canny_edge, num_inference_steps=20).images[0]\n多 ControlNet 传入一个 controlnet 列表 + 对应 image 列表即可。"
        },
        duration: "2.5小时",
        resources: [
          { title: "ControlNet 论文 / 官方仓库", url: "https://github.com/lllyasviel/ControlNet", required: true },
          { title: "IP-Adapter 项目页", url: "https://ip-adapter.github.io/", required: false },
          { title: "diffusers ControlNet 文档", url: "https://huggingface.co/docs/diffusers/using-diffusers/controlnet", required: true }
        ],
        checkpoint: "4 个实验均产出符合输入条件的图像；diffusers 小脚本可独立运行"
      },
      {
        day: 5,
        title: "ComfyUI 节点化工作流与视频生成（AnimateDiff）",
        content: {
          objective: "掌握 ComfyUI 节点编程方式，搭建包含 LoRA + ControlNet + IP-Adapter 的可复现工作流，并尝试视频生成",
          api_checklist: [
            "ComfyUI 节点图：Load Checkpoint → CLIP Encode(prompt) → Load LoRA → Load ControlNet → Apply ControlNet → KSampler → VAE Decode → Save Image",
            "保存 workflow：保存的 .json 同时包含节点图和最终 prompt，完全可复现。可以直接'加载 workflow'到 UI",
            "AnimateDiff：在 ComfyUI 中加载 motion_module（如 v3_sd15），在采样阶段插入，从单张图像生成 16-24 帧短视频",
            "AnimateDiff + ControlNet（OpenPose/Depth）可以生成姿态/镜头一致的连贯视频片段"
          ],
          practice: "在 ComfyUI 中依次搭建：1) 基础 txt2img 工作流；2) 基础 + 自己 LoRA + Canny ControlNet；3) 再加入 IP-Adapter 参考图。导出这 3 个工作流为 .json。然后在工作流 2 中加入 AnimateDiff 节点，挑一张你生成的产品图作为首帧，生成一段 16 帧、8 fps、约 2 秒的'镜头缓慢拉近'短视频并保存。",
          answer: "常用 ComfyUI 节点速查：\n- 加载主模型：Load Checkpoint / Load Checkpoint With Config (SDXL)\n- LoRA 注入：Load LoRA + Apply LoRA\n- ControlNet 流程：Load ControlNet Model → Apply ControlNet（传入 conditioning 和条件图）\n- 采样：KSampler（选择 scheduler / steps / cfg / seed）\n- 视频：AnimateDiff Loader + AnimateDiff Sampler（需要 motion_model.safetensors + V2 等运动模块）\n- 批处理生成：SamplerCustom 方便逐步骤调试"
        },
        duration: "2.5小时",
        resources: [
          { title: "ComfyUI 官方示例工作流合集", url: "https://comfyanonymous.github.io/ComfyUI_examples/", required: true },
          { title: "AnimateDiff 官方仓库", url: "https://github.com/guoyww/AnimateDiff", required: false }
        ],
        checkpoint: "有 3 个可复现的 ComfyUI json 工作流文件 + 1 段生成的短视频"
      },
      {
        day: 6,
        title: "FLUX / SDXL 等现代模型对比",
        content: {
          objective: "了解 SD 家族最新进展：SDXL、SD 3、Flux.1（Black Forest Labs）、Midjourney 的差异；体验 Flux 在高质量生成上的表现",
          api_checklist: [
            "SDXL：由 base + refiner 两个模型组成，原生 1024x1024，prompt 支持更抽象概念",
            "SD3：引入 MMDiT（多模态扩散 Transformer），将 text 和 image patch 一起送入 Transformer block",
            "FLUX（Black Forest Labs）：基于更大规模 MMDiT + 46M tokens text data，在提示理解、图像结构和真实性上大幅提升",
            "部署对比：SDXL 在消费级 8G 卡上可跑（fp16）；FLUX.1 [dev] 建议 24G+ VRAM 或用 quantized 版本",
            "关键观察：在'提示词理解强语义'（如 prompt 中含'猫站在月球上穿西装'）和'图像中文字渲染'两项上 FLUX 明显优于 SDXL"
          ],
          practice: "1) 列出一个包含 6 条难 prompt 的测试集（包含抽象概念、文字渲染、复杂构图等）；2) 分别在 SD1.5、SDXL、FLUX.1 [schnell/dev]（可通过 huggingface spaces / replicate 在线体验，或本地跑 fp8 量化版）上各生成一次；3) 人工打分 1-5 分，整理一份 2 页以内的横向对比报告：模型、每图得分、优缺点、速度、显存占用。",
          answer: "常见对比维度：\n- Prompt 语义理解：FLUX > SD3 > SDXL > SD1.5\n- 中文 prompt：很多开源模型仅英文，中文 prompt 可能需要先翻译或选专门 fine-tune 版本\n- 文字渲染（image with readable text）：FLUX/SD3 明显优于 SDXL/SD1.5\n- 推理速度：FLUX schnell < 4 步；SDXL 通常 20-30 步\n- 硬件门槛：SD1.5（4GB+）、SDXL（8GB+）、FLUX（16GB+ 推荐 24GB+）\n- License：FLUX.1 [dev] 非商用自由、[pro] 商业付费；SD 模型多为 CreativeML Open RAIL-M"
        },
        duration: "2小时",
        resources: [
          { title: "FLUX.1 官方项目与模型下载", url: "https://blackforestlabs.ai/", required: false },
          { title: "SDXL 论文 / 模型卡", url: "https://stability.ai/news/stable-diffusion-sdxl-1-announcement", required: false },
          { title: "HF Diffusers 对 FLUX 支持", url: "https://huggingface.co/docs/diffusers/api/pipelines/flux", required: true }
        ],
        checkpoint: "产出一份至少 2 页的横向对比报告（含生成图像与评分表）"
      },
      {
        day: 7,
        title: "综合项目：产品图自动生成 Pipeline",
        content: {
          objective: "搭建一个真实可用的电商产品图生成 Pipeline：输入 1 张产品白底图 → 自动生成 N 张带背景 + 光线 + 风格统一的商品图",
          api_checklist: [
            "第 1 步：输入白底图 → 自动抠图（rembg / U^2-Net）得到 alpha mask，或用 SAM 精细分割主体",
            "第 2 步：用 IP-Adapter + ControlNet（Depth+Canny）做'保留主体外观的换背景'：提供目标背景场景图作为参考 + 主体 mask 控制形状",
            "第 3 步：LoRA 注入自己的品牌风格（提前训练，如'y2k style'、'cinematic'）统一所有产出图像色调",
            "第 4 步：后处理：把生成图和原始主体做 alpha blending，避免主体细节失真",
            "第 5 步：Python batch 脚本批量处理 products/ 目录下所有商品，保存到 results/ 并输出 manifest.json"
          ],
          practice: "从自己真实可用的 5 张商品白底图（如衣服/美妆/电子产品）出发，写 product_pipeline.py：1) 对每张图自动抠图保存 alpha；2) 定义 3 种背景风格（studio softbox、outdoor cafe、minimal desk）作为预设；3) 用 diffusers + IP-Adapter + ControlNet canny 生成每个商品 × 每个背景的 3 张变体；4) 保存最终图像到 output/<style>/<product>.jpg，并写入 manifest.json 记录 prompt / seed / model_name。人工检查：所有生成图像中主体应清晰可辨、与背景自然融合、风格在同一 style 内保持统一。",
          answer: "整体架构示意：\nproducts/\n  item_a.jpg item_b.jpg ...\n↓ rembg → masks/\n↓ diffusers pipeline(pipe.py)\n  ├─ IP-Adapter(参考图=item_a.jpg, scale=0.7)\n  ├─ ControlNet(canny=edge_of_item_a, scale=0.8)\n  ├─ LoRA(brand_style_lora, scale=0.6)\n  └─ KSampler(steps=25, cfg=7) → tmp/*.png\n↓ alpha_blend.py（原图主体 + 生成背景）\noutput/studio/item_a.jpg + manifest.json\nmanifest 中记录 metadata 方便后续排查哪张图是哪个 seed 生成的。"
        },
        duration: "3小时",
        resources: [
          { title: "rembg 快速抠图", url: "https://github.com/danielgatis/rembg", required: true },
          { title: "IP-Adapter + diffusers 中文教程", url: "https://huggingface.co/docs/diffusers/using-diffusers/ip_adapter", required: true }
        ],
        checkpoint: "产品图 Pipeline 对 5 张白底图成功生成每种风格各 3 张变体，人工验收：10/15 张以上图可直接用于电商场景"
      }
    ]
  },

  // =====================================================
  // Node: nlp-llm-inference
  // =====================================================
  {
    id: "nlp-llm-inference",
    name: "LLM 推理加速与部署",
    track: "nlp",
    duration: "2周",
    prerequisites: ["nlp-transformer"],
    status: "locked",
    description: "围绕大模型推理加速与生产级部署。重点讲 vLLM / SGLang 等推理引擎的原理，以及量化、批处理、长上下文等核心优化技术。",
    outcomes: ["掌握 KV Cache / PagedAttention 原理", "部署生产级 vLLM 推理服务", "GPTQ/AWQ 量化压缩模型"],
    relatedIntel: ["001-transformer", "005-rag"],
    relatedTerms: ["vllm", "quantization", "pagedattention", "kv-cache", "batch-inference"],
    dailyTasks: [
      {
        day: 1,
        title: "推理基础：Prefill / Decode / KV Cache",
        content: {
          objective: "理解 LLM 推理的两个阶段及其计算瓶颈",
          api_checklist: [
            "prefill 阶段：输入 prompt 一次性前向传播",
            "decode 阶段：自回归逐 token 生成",
            "KV Cache 避免重复计算已生成 token 的 Key/Value",
            "显存中 KV Cache 的空间占用估算：2 * n_layers * n_heads * seq_len * head_dim * batch_size * bytes_per_param"
          ],
          practice: "用 transformers 的 generate() 函数测试 qwen2.5-0.5B，打印两次调用中 KV Cache 的显存占用（用 torch.cuda.memory_allocated()）。对同一 prompt 两次调用，对比有无 KV Cache 的首次生成速度差异。",
          answer: "显存估算公式：\n# 每层每 head 的 KV cache 大小（bytes）\n# = 2 (K+V) * seq_len * head_dim * batch_size * 2 (FP16=2bytes)\nkvcache_per_layer = 2 * max_seq_len * head_dim * batch_size * 2\ntotal_kvcache = n_layers * kvcache_per_layer\n# qwen2.5-0.5B, seq_len=2048, batch=1 → ~80MB"
        },
        duration: "2小时",
        resources: [
          { title: "KV Cache 原理图解", url: "https://kipp.mreg.io/llm-inference/", required: true },
          { title: "FastAPI + transformers 生成服务", url: "https://huggingface.co/docs/transformers/main/en/generation_strategies", required: true }
        ],
        checkpoint: "能估算给定模型的 KV Cache 显存占用，代码验证：batch=4, seq=512 时 qwen2.5-0.5B 的 KV Cache 显存"
      },
      {
        day: 2,
        title: "vLLM 与 PagedAttention 原理",
        content: {
          objective: "理解 PagedAttention 如何解决 KV Cache 显存碎片化问题",
          api_checklist: [
            "vLLM 的 PagedAttention：将 KV Cache 分块管理（类似操作系统分页）",
            "block_size = 16：每个 block 存 16 个 token 的 KV",
            "logical KV cache 按需分配物理块，避免预分配浪费",
            "GPU Util 通过 block manager 调度"
          ],
          practice: "用 vLLM 部署 qwen2.5-0.5B：\npython -m vllm.entrypoints.openai.api_server --model Qwen/Qwen2.5-0.5B-Instruct --dtype half --port 8000\n然后用 curl 测试：curl http://localhost:8000/v1/chat/completions -H 'Content-Type: application/json' -d '{\"messages\": [{\"role\": \"user\", \"content\": \"1+1=?\"}]}'. 对比 transformers 推理延迟。",
          answer: "PagedAttention 核心思想：\n# 把 KV Cache 当作虚拟内存页表管理\nlogical_blocks = []  # 按需分配\nphysical_blocks = {}  # 映射到 GPU 显存\nblock_mapping = {logical: physical}\n# 不同请求共享相同 block manager，减少显存碎片"
        },
        duration: "2.5小时",
        resources: [
          { title: "vLLM 官方文档", url: "https://docs.vllm.ai/en/latest/", required: true },
          { title: "PagedAttention 论文", url: "https://arxiv.org/abs/2309.06180", required: true }
        ],
        checkpoint: "vLLM 服务启动成功，curl 返回正确 JSON 格式推理结果，QPS 比纯 transformers 提升 2x+"
      },
      {
        day: 3,
        title: "SGLang / LMDeploy 推理引擎对比",
        content: {
          objective: "对比主流推理引擎的架构差异与适用场景",
          api_checklist: [
            "SGLang：RadixAttention + 前缀缓存 + structured output 约束",
            "LMDeploy：TurboMind 引擎，W4A16 量化支持",
            "TensorRT-LLM：Benthos 定制算子优化",
            "推理延迟 /吞吐/ 首 token 延迟 对比"
          ],
          practice: "分别用 vLLM、SGLang（如果可安装）、LMDeploy 部署同一个 7B 模型，用 Python asyncio 并发发送 20 个请求，测量：平均 Throughput（tokens/s）、P50/P99 Latency、GPU 显存峰值。输出 CSV 对比表。",
          answer: "对比指标：\nimport asyncio\nimport aiohttp\n\nasync def benchmark(url, num_requests=20):\n    tasks = [send_request(url) for _ in range(num_requests)]\n    start = time.time()\n    results = await asyncio.gather(*tasks)\n    elapsed = time.time() - start\n    total_tokens = sum(r['usage']['total_tokens'] for r in results)\n    return {'qps': num_requests/elapsed, 'tokens_per_sec': total_tokens/elapsed}"
        },
        duration: "3小时",
        resources: [
          { title: "SGLang GitHub", url: "https://github.com/sgl-project/sglang", required: true },
          { title: "LMDeploy 文档", url: "https://lmdeploy.readthedocs.io/", required: true },
          { title: "TensorRT-LLM 文档", url: "https://nvidia.github.io/TensorRT-LLM/", required: false }
        ],
        checkpoint: "输出包含 3 个引擎对比的 CSV，QPS 最高者应比最慢者快 50%+"
      },
      {
        day: 4,
        title: "GPTQ / AWQ 量化推理",
        content: {
          objective: "掌握模型量化方法与推理加速效果",
          api_checklist: [
            "GPTQ：逐层量化，4-bit 权重量化，保存 scale 和 zero-point",
            "AWQ：activation-aware 权重量化，更适合 LLM",
            "llama.cpp / GGUF 格式：CPU 推理也可用",
            "vLLM 支持 AWQ 格式直接加载"
          ],
          practice: "用 AutoGPTQ 对 qwen2.5-0.5B 做 INT4 量化：\nfrom auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig\nquantize_config = BaseQuantizeConfig(bits=4, group_size=128)\nquantized_model = AutoGPTQForCausalLM.from_pretrained(model, quantize_config)\nquantized_model.quantize_model()\n保存后用 vLLM 加载量化模型，对比 FP16 基线的显存占用和推理速度。",
          answer: "量化关键步骤：\n# GPTQ 量化流程\n1. 准备校准数据集（100-1000 条代表性的文本）\n2. 对每一层：\n   - 用校准数据获取 activations\n   - 计算 H = X^T X（Hessian 近似）\n   - 最优量化：argmin ||W - Q(W)||，其中 Q 为量化值\n3. 保存 quantized_model.safetensors + quant_config.json"
        },
        duration: "2.5小时",
        resources: [
          { title: "AutoGPTQ GitHub", url: "https://github.com/AutoGPTQ/AutoGPTQ", required: true },
          { title: "AWQ 论文与代码", url: "https://arxiv.org/abs/2306.00978", required: true }
        ],
        checkpoint: "INT4 量化模型显存 < FP16 的 40%，速度提升 > 2x，精度下降 < 5%（用 hellaswag 评测）"
      },
      {
        day: 5,
        title: "批量推理与 OpenAI 兼容 API",
        content: {
          objective: "构建高吞吐量的批量推理服务",
          api_checklist: [
            "vLLM 的 /v1/completions 和 /v1/chat/completions 端点",
            "streaming vs non-streaming 吞吐量差异",
            "best_of / n 参数：一次生成多个候选",
            "request batch 与 continuous batch 对比"
          ],
          practice: "写 batch_inference.py：用 vLLM 的 Python client（from vllm import LLM）批量推理 1000 条输入（可从 open-orca 数据集中采样），测量 Throughput（tokens/s）和平均 Latency。配置 max_num_seqs=100 的连续批处理，对比 max_num_seqs=1 的性能差异。",
          answer: "连续批处理核心：\n# 调度策略\nwhile True:\n    running_requests = get_running_requests()\n    pending_requests = get_pending_requests()\n    # 1. 填充 running 中已完成的 sequence 的空 slot\n    # 2. 从 pending 插入新请求（如果还有空位）\n    # 3. 调度器选择下一个 token\n    step()"
        },
        duration: "2小时",
        resources: [
          { title: "vLLM 批量推理文档", url: "https://docs.vllm.ai/en/latest/generation/parameters.html", required: true }
        ],
        checkpoint: "连续批处理 Throughput 比 non-batch 高 5x+，GPU 利用率 > 70%"
      },
      {
        day: 6,
        title: "长上下文推理：RoPE 与 YARN",
        content: {
          objective: "处理超长上下文（> 32k token）的关键技术",
          api_checklist: [
            "RoPE（旋转位置编码）：将绝对位置编码为旋转矩阵",
            "RoPE 的 long-context finetune（YaRN / LongRoPE）",
            "NTK-aware scaling：无需 finetune 扩展上下文",
            "FlashAttention-2 的 CUDA Kernel 优化"
          ],
          practice: "测试 qwen2 的长上下文能力：用 vLLM 加载 32k 上下文窗口，输入一篇 2 万字文章，让模型回答「文章第 5000 字是什么」。用不同 RoPE 缩放方式（ntk-scaled、linear）对比回答准确率。",
          answer: "RoPE 缩放公式：\n# ntk-scaled RoPE\ntheta_orig = 10000 * (base / 10000) ** (i / head_dim)\ntheta_scaled = theta_orig * scale_factor  # scale = context_len / original_ctx\n# 注意：直接 scale 会丢失高频信息，需要 YaRN 等方法补偿"
        },
        duration: "2.5小时",
        resources: [
          { title: "RoPE 原始论文", url: "https://arxiv.org/abs/2104.09864", required: true },
          { title: "YaRN 论文", url: "https://arxiv.org/abs/2309.00071", required: true },
          { title: "FlashAttention-2 论文", url: "https://arxiv.org/abs/2307.08691", required: false }
        ],
        checkpoint: "能回答文章中间位置的问题，准确率 > 80%（可通过提取特定句子验证）"
      },
      {
        day: 7,
        title: "综合：部署 qwen2.5-7B 生产级推理服务",
        content: {
          objective: "串联所有技术栈，部署一个生产级推理服务",
          api_checklist: [
            "vLLM 部署 + AWQ 量化模型",
            "Nginx 反向代理 + 限流",
            "Prometheus 指标暴露（/metrics 端点）",
            "systemd 服务化 + 自动重启"
          ],
          practice: "写 deploy_inference.sh：1) 下载 qwen2.5-7B-Instruct-GPTQ-Int4 模型；2) 用 vLLM 启动服务（指定 max_model_len=8192, gpu_memory_utilization=0.9）；3) 配置 Nginx 反向代理到 8000 端口并设置 rate_limit；4) 添加 systemd service；5) 用 locust 做压测，验证 QPS > 30 @ Int4。",
          answer: "nginx.conf 片段：\nupstream vllm {\n    server 127.0.0.1:8000;\n}\nserver {\n    location /api/ {\n        limit_req zone=one burst=10;\n        proxy_pass http://vllm;\n        proxy_buffering off;\n        proxy_set_header Host $host;\n    }\n}"
        },
        duration: "3小时",
        resources: [
          { title: "vLLM 生产部署指南", url: "https://docs.vllm.ai/en/latest/serving/deploy.html", required: true },
          { title: "Locust 压测工具", url: "https://locust.io/", required: true }
        ],
        checkpoint: "压测 QPS > 30，99% 请求 < 2s，systemd 服务 crash 后自动重启"
      }
    ]
  },

  // =====================================================
  // Node: nlp-prompt-engineering
  // =====================================================
  {
    id: "nlp-prompt-engineering",
    name: "提示工程与 Agent 设计",
    track: "nlp",
    duration: "1周",
    prerequisites: ["llm-finetune"],
    status: "locked",
    description: "围绕大模型提示工程与 Agent 系统设计。重点讲 Prompt 结构化输出、ReAct 模式、Function Calling 与工具调用。",
    outcomes: ["掌握结构化 Prompt 设计", "实现 ReAct Agent", "Function Calling 集成工具"],
    relatedIntel: ["001-transformer", "005-rag"],
    relatedTerms: ["prompt", "chain-of-thought", "function-calling", "react", "agent", "structured-output"],
    dailyTasks: [
      {
        day: 1,
        title: "结构化 Prompt 设计与迭代",
        content: {
          objective: "掌握结构化 Prompt 的核心组件",
          api_checklist: [
            "System Prompt：角色设定 + 行为约束 + 输出格式",
            "Few-shot Examples：选择有代表性的 3-5 个示例",
            "Input/Output Format：JSON Schema / Markdown 结构",
            "Prompt 版本管理：用工具记录每次迭代的 prompt 和效果"
          ],
          practice: "为「会议纪要摘要」任务写 Prompt：\n要求：角色（专业会议纪要助手）、输入（一段文字）、输出（JSON：summary/members/topics/decisions/action_items）、约束（不超过 200 字摘要）。用同一组 10 条测试数据，对比有/无 few-shot examples 的摘要质量（人工评分或用 GPT-4 评分）。",
          answer: "Prompt 模板：\n<system>\n你是一个专业的会议纪要助手。你需要从输入文本中提取：\n- summary: 会议摘要（100-200字）\n- members: 参会人员列表\n- topics: 讨论的主题\n- decisions: 做出的决策\n- action_items: 行动项（负责人+截止日期）\n输出格式必须为有效的 JSON。\n</system>\n\n<examples>\n输入: 「今天开会讨论了项目进度，张三负责前端...」\n输出: {\"summary\": \"...\", \"members\": [\"张三\", \"李四\"], ...}\n</examples>"
        },
        duration: "2小时",
        resources: [
          { title: "OpenAI Prompt Engineering Guide", url: "https://platform.openai.com/docs/guides/prompt-engineering", required: true },
          { title: "Anthropic Prompt Engineering Guide", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering", required: true }
        ],
        checkpoint: "有 few-shot 的 Prompt 质量评分比无 few-shot 高 20% 以上"
      },
      {
        day: 2,
        title: "Chain-of-Thought 与自一致性",
        content: {
          objective: "掌握 CoT 思维链及其变体",
          api_checklist: [
            "Zero-shot CoT：'Let's think step by step' 触发推理",
            "Few-shot CoT：提供带推理步骤的示例",
            "Self-Consistency：生成多条推理路径取多数票",
            "Tree-of-Thought：探索多种解决方案分支"
          ],
          practice: "写 cot_benchmark.py：在 math datasets（GSM8K / MATH）上测试：\n1) 直接 prompting（无 CoT）\n2) Zero-shot CoT（加 'Let's think step by step'）\n3) Few-shot CoT（每类题给 1 个完整推理示例）\n4) Self-Consistency（n=5，投票）\n对比 4 种方法的准确率，验证 Self-Consistency 对复杂问题的提升效果。",
          answer: "Self-Consistency 实现：\ndef self_consistency(prompt, n=5):\n    responses = []\n    for _ in range(n):\n        resp = llm.generate(prompt + \" Let's think step by step.\")\n        answer = extract_final_answer(resp)  # 提取最终答案\n        responses.append(answer)\n    # 多数投票\n    from collections import Counter\n    return Counter(responses).most_common(1)[0][0]"
        },
        duration: "2小时",
        resources: [
          { title: "Self-Consistency 论文", url: "https://arxiv.org/abs/2203.11171", required: true },
          { title: "Tree of Thoughts", url: "https://arxiv.org/abs/2305.10601", required: false }
        ],
        checkpoint: "Self-Consistency 在 MATH 数据集上比 Zero-shot CoT 准确率提升 10%+"
      },
      {
        day: 3,
        title: "结构化输出：JSON Schema / Function Calling",
        content: {
          objective: "让模型输出结构化数据而非自由文本",
          api_checklist: [
            "response_format = {'type': 'json_object'} 强制 JSON 输出",
            "Function Calling / Tool Use：定义工具接口让模型调用",
            "Pydantic + Instructor：结构化输出 + 自动验证",
            "输出约束：避免 JSON 截断 / 格式错误"
          ],
          practice: "写 structured_output.py：定义 Pydantic 模型 NewsItem（title/date/summary/tags/list[str]），用 Instructor 库（或 OpenAI 的 response_format）提取网页新闻的结构化信息。测试 10 条不同格式的新闻网页，统计 JSON 解析成功率。",
          answer: "Instructor / OpenAI 格式：\nfrom pydantic import BaseModel\nclass NewsItem(BaseModel):\n    title: str\n    date: str\n    summary: str\n    tags: list[str]\n\n# OpenAI SDK\ncompletion = client.beta.chat.completions.parse(\n    model=\"gpt-4o\",\n    messages=[{\"role\": \"user\", \"content\": text}],\n    response_format=NewsItem,\n)"
        },
        duration: "2小时",
        resources: [
          { title: "Instructor 库文档", url: "https://jxnl.github.io/instructor/", required: true },
          { title: "OpenAI Function Calling 文档", url: "https://platform.openai.com/docs/guides/function-calling", required: true }
        ],
        checkpoint: "10 条测试数据中至少 9 条正确解析，JSON 格式错误率 < 5%"
      },
      {
        day: 4,
        title: "Agent 设计：ReAct / 规划-执行-反思",
        content: {
          objective: "构建能够使用工具的自主 Agent",
          api_checklist: [
            "ReAct = Reasoning + Acting：思考→行动→观察→循环",
            "定义 Tool Schema：让模型知道有哪些工具可用",
            "规划模块：HATP / CoH 等规划策略",
            "记忆模块：短期记忆（上下文）+ 长期记忆（向量检索）"
          ],
          practice: "写 react_agent.py：实现一个 ReAct Agent，整合 3 个工具（web_search、calculator、weather_query）。Agent 接收用户问题，自主决定调用哪个工具（0-3 次），最终给出答案。用 20 个测试问题评估准确率，其中至少 10 个需要调用至少 1 个工具。",
          answer: "ReAct loop：\ndef react_loop(question):\n    observation = ''\n    thought = ''\n    for step in range(5):\n        # 1. Reason\n        thought = llm.think(question, observation, history)\n        # 2. Act\n        if 'action' in thought:\n            tool = thought['action']\n            args = thought['args']\n            observation = call_tool(tool, args)\n        else:\n            # 3. Respond\n            return thought['response']\n        history.append((thought, observation))"
        },
        duration: "2.5小时",
        resources: [
          { title: "ReAct 论文", url: "https://arxiv.org/abs/2210.03629", required: true },
          { title: "LangChain Agents 文档", url: "https://python.langchain.com/docs/concepts/agents/", required: false }
        ],
        checkpoint: "Agent 在 20 个问题中至少 15 个给出正确答案，且工具调用序列合理"
      },
      {
        day: 5,
        title: "Prompt 测试与自动化评估",
        content: {
          objective: "构建 Prompt 的自动化测试与质量评估体系",
          api_checklist: [
            "Prompt 版本管理：git 管理 prompt 模板",
            "自动化评测集：准备 50-100 条有标准答案的测试用例",
            "LLM-as-Judge：用强模型评分弱模型的输出",
            "A/B 测试：同时跑两版 Prompt，对比指标"
          ],
          practice: "写 prompt_evaluator.py：实现一个自动化评测框架。准备 30 条会议纪要摘要测试集（有标准摘要）。评测指标：1) ROUGE-L 与标准摘要的相似度；2) GPT-4 作为 Judge 评分的 1-5 分；3) JSON 字段完整率。实现 A/B 测试：对比 v1 和 v2 两版 Prompt，输出对比报告。",
          answer: "评估框架：\ndef evaluate_prompt(prompt_version, test_cases):\n    results = []\n    for case in test_cases:\n        output = call_llm(prompt_version, case['input'])\n        rouge = rouge_score(output, case['reference'])\n        judge = judge_by_gpt4(output, case['reference'])\n        json_valid = is_valid_json(output)\n        results.append({'rouge': rouge, 'judge': judge, 'json_valid': json_valid})\n    return aggregate(results)"
        },
        duration: "2小时",
        resources: [
          { title: "LLM-as-Judge", url: "https://arxiv.org/abs/2306.05685", required: true },
          { title: "RAGAS 评估框架", url: "https://docs.ragas.io/", required: false }
        ],
        checkpoint: "自动化评测报告能清晰展示两版 Prompt 的差异，Rouge/Prompt Score/Judge Score 均有统计"
      }
    ]
  },

  // =====================================================
  // Node: devops-kubernetes
  // =====================================================
  {
    id: "devops-kubernetes",
    name: "Kubernetes 容器编排",
    track: "devops",
    duration: "2周",
    prerequisites: ["docker-basic"],
    status: "locked",
    description: "围绕 Kubernetes 容器编排核心技术与 GPU 调度。重点讲 Pod/Deployment/Service/Helm 等核心概念，以及在 K8s 上部署 AI 推理服务。",
    outcomes: ["掌握 K8s 核心概念与 kubectl 操作", "在 K8s 上部署有状态服务", "GPU 调度与 HPA 自动扩缩容"],
    relatedIntel: ["007-docker", "016-server-setup"],
    relatedTerms: ["kubernetes", "kubectl", "helm", "pod", "deployment", "service", "gpu-scheduling"],
    dailyTasks: [
      {
        day: 1,
        title: "K8s 核心概念：Pod / Node / Namespace",
        content: {
          objective: "理解 K8s 的核心架构与资源对象",
          api_checklist: [
            "Pod：最小调度单位，一个 Pod 可包含多个容器",
            "Node：工作节点，Kubelet 负责管理",
            "Namespace：资源隔离命名空间",
            "kubectl get / describe / logs / exec 基本命令"
          ],
          practice: "安装 minikube 或用 kind 创建本地集群（适合无云服务器场景）：\nkind create cluster --name ai-cluster\nkubectl get nodes\nkubectl run nginx --image=nginx --port=80\nkubectl expose pod nginx --port=80 --type=NodePort\n验证 Pod 运行并通过 NodePort 访问。",
          answer: "核心对象关系：\n# Cluster\n└── Node（worker machine）\n    └── Kubelet（agent）\n        └── Pod（scheduling unit）\n            └── Container（runtime unit）\n# API Server（control plane）\n# 负责接收 yaml → 创建对象 → 调度到 Node"
        },
        duration: "2小时",
        resources: [
          { title: "K8s 官方教程", url: "https://kubernetes.io/zh-cn/docs/tutorials/", required: true },
          { title: "kubectl 常用命令", url: "https://kubernetes.io/zh-cn/docs/reference/kubectl/quick-reference/", required: true },
          { title: "minikube 安装", url: "https://minikube.sigs.k8s.io/docs/start/", required: false }
        ],
        checkpoint: "minikube/kind 集群运行正常，Pod/Service/Deployment 生命周期操作无报错"
      },
      {
        day: 2,
        title: "Deployment / ReplicaSet / Service",
        content: {
          objective: "掌握 K8s 的声明式部署与 Service 网络",
          api_checklist: [
            "Deployment：管理 Pod 的声明式更新（replicas/strategy）",
            "ReplicaSet：维持指定数量的 Pod 副本",
            "Service：ClusterIP / NodePort / LoadBalancer 三种类型",
            "label-selector：Service 如何选择后端 Pod"
          ],
          practice: "写 fastapi-deployment.yaml：部署一个 FastAPI 推理服务。配置 replicas=2，rolling update strategy（25% maxUnavailable），liveness/readiness probe。写 fastapi-service.yaml：ClusterIP 类型，端口映射 8000→8000。用 kubectl apply -f 部署并验证滚动更新。",
          answer: "deployment.yaml 核心字段：\nspec:\n  replicas: 2\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxUnavailable: 25%\n      maxSurge: 25%\n  template:\n    metadata:\n      labels:\n        app: fastapi\n    spec:\n      containers:\n      - name: api\n        image: my-api:latest\n        ports:\n        - containerPort: 8000\n        livenessProbe:\n          httpGet:\n            path: /health\n            port: 8000\n          initialDelaySeconds: 10\n        readinessProbe:\n          httpGet:\n            path: /health\n            port: 8000"
        },
        duration: "2小时",
        resources: [
          { title: "K8s Deployment 文档", url: "https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/deployment/", required: true },
          { title: "K8s Service 文档", url: "https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/", required: true }
        ],
        checkpoint: "kubectl rollout status deployment/fastapi 显示滚动更新成功，2 个 Pod 同时在线"
      },
      {
        day: 3,
        title: "ConfigMap / Secret / Ingress",
        content: {
          objective: "管理配置、密钥和外部访问",
          api_checklist: [
            "ConfigMap：存储非敏感配置（环境变量/配置文件）",
            "Secret：存储敏感信息（密码/API key/cert），base64 编码",
            "Ingress：HTTP/HTTPS 路由规则，替代 NodePort",
            "envFrom / volumeMounts 注入配置到容器"
          ],
          practice: "写 configmap.yaml 存储 model_path=/models/resnet 和 batch_size=16。写 secret.yaml 存储 huggingface token。修改 deployment.yaml 用 envFrom 将 configmap 和 secret 注入容器。验证容器内 echo $MODEL_PATH 输出正确值。",
          answer: "注入方式：\n# configmap.yaml\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: model-config\ndata:\n  MODEL_PATH: \"/models/resnet\"\n  BATCH_SIZE: \"16\"\n---\n# deployment.yaml 中引用\nenvFrom:\n- configMapRef:\n    name: model-config\n- secretRef:\n    name: hf-token"
        },
        duration: "1.5小时",
        resources: [
          { title: "ConfigMap 使用文档", url: "https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/configure-pod-configmap/", required: true },
          { title: "Ingress 文档", url: "https://kubernetes.io/zh-cn/docs/concepts/services-networking/ingress/", required: true }
        ],
        checkpoint: "容器内环境变量正确注入，Secret 的 value 在 pod exec 中 base64 解码正确"
      },
      {
        day: 4,
        title: "PersistentVolume / StorageClass",
        content: {
          objective: "为模型文件和数据库提供持久化存储",
          api_checklist: [
            "PV（PersistentVolume）：集群层面的存储资源",
            "PVC（PersistentVolumeClaim）：Pod 请求存储的声明",
            "StorageClass：动态存储供应（如 hostPath / nfs / cloud-storage）",
            "ReadWriteOnce / ReadOnlyMany 访问模式"
          ],
          practice: "写 pvc.yaml 申请 10Gi 存储（storageClassName: standard）。写 deployment.yaml 挂载该 PVC 到容器 /models 目录。部署后在一个 Pod 内写入测试文件，在另一个 Pod 内验证文件存在（证明 PVC 跨 Pod 共享）。",
          answer: "PVC 模板：\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: model-storage\nspec:\n  accessModes:\n    - ReadWriteMany  # 需要存储后端支持（nfs/efs）\n  storageClassName: standard\n  resources:\n    requests:\n      storage: 10Gi\n---\n# deployment 中引用\nvolumes:\n- name: model-volume\n  persistentVolumeClaim:\n    claimName: model-storage\nvolumeMounts:\n- name: model-volume\n  mountPath: /models"
        },
        duration: "1.5小时",
        resources: [
          { title: "K8s 存储文档", url: "https://kubernetes.io/zh-cn/docs/concepts/storage/persistent-volumes/", required: true }
        ],
        checkpoint: "PVC bound 成功，Pod 重启后 /models 目录数据不丢失"
      },
      {
        day: 5,
        title: "Helm 包管理器",
        content: {
          objective: "用 Helm 模板化管理 K8s 应用",
          api_checklist: [
            "helm create my-chart：创建标准 Chart 目录结构",
            "values.yaml：覆盖默认配置",
            "helm install / upgrade / rollback：版本管理",
            "templates/ 目录中的 Go 模板语法"
          ],
          practice: "用 helm create fastapi-chart 创建 Chart。将昨天的 fastapi deployment/service/configmap/secret 整理为 Chart 模板，用 values.yaml 管理 replicas、image tag、port 等参数。实现 helm install fastapi ./fastapi-chart --set replicaCount=3 一次部署完整应用。",
          answer: "Chart 结构：\nfastapi-chart/\n  Chart.yaml          # chart 元信息\n  values.yaml         # 默认配置（replicas=2, image=latest）\n  templates/\n    deployment.yaml\n    service.yaml\n    configmap.yaml\n    secret.yaml\n  charts/             # 子 chart 依赖\n---\n# values.yaml 模板变量\nreplicaCount: {{ .Values.replicaCount }}\nimage:\n  repository: {{ .Values.image.repository }}\n  tag: {{ .Values.image.tag }}"
        },
        duration: "2小时",
        resources: [
          { title: "Helm 官方文档", url: "https://helm.sh/zh/docs/", required: true }
        ],
        checkpoint: "helm install 成功，helm list 显示 RELEASE 和 STATUS"
      },
      {
        day: 6,
        title: "GPU 调度与资源限制",
        content: {
          objective: "在 K8s 上调度 GPU 资源",
          api_checklist: [
            "nvidia.com/gpu: 1（GPU 插件资源请求）",
            "nodeSelector 调度到 GPU 节点",
            "limitRange 设置 GPU 使用上限",
            "device-plugin 工作机制"
          ],
          practice: "在有 NVIDIA GPU 的节点上部署 PyTorch 推理 Pod：\n在 deployment.yaml 中添加：\n  resources:\n    limits:\n      nvidia.com/gpu: 1\n并在 nodeSelector 中指定 gpu node。\n部署后 exec 进入容器，运行 nvidia-smi 验证 GPU 可用。",
          answer: "GPU deployment 片段：\nspec:\n  nodeSelector:\n    gpu: nvidia  # 需要节点有 label gpu=nvidia\n  containers:\n  - name: inference\n    image: pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime\n    resources:\n      limits:\n        nvidia.com/gpu: \"1\"\n    env:\n    - name: CUDA_VISIBLE_DEVICES\n      value: \"0\""
        },
        duration: "1.5小时",
        resources: [
          { title: "NVIDIA GPU Operator", url: "https://docs.nvidia.com/datacenter/cloud-native/kubernetes/latest/", required: true },
          { title: "K8s GPU 调度文档", url: "https://kubernetes.io/zh-cn/docs/tasks/manage-gpus/scheduling-gpus/", required: true }
        ],
        checkpoint: "Pod 调度到 GPU 节点，容器内 nvidia-smi 显示正确 GPU 型号和驱动版本"
      },
      {
        day: 7,
        title: "综合：将 FastAPI 推理服务部署到 K8s + HPA",
        content: {
          objective: "完整部署一个有 HPA 自动扩缩容的推理服务",
          api_checklist: [
            "HPA（HorizontalPodAutoscaler）：基于 CPU/自定义指标扩缩",
            "metric-server：提供资源指标",
            "KEDA：基于队列长度等外部指标触发扩缩",
            "kubectl autoscale 命令行"
          ],
          practice: "在已有 FastAPI deployment 基础上：1) 安装 metric-server；2) 写 hpa.yaml 基于 CPU 使用率 > 70% 自动扩容（min=1, max=5）；3) 用 hey 或 kubectl run 压测制造 CPU 负载；4) 观察 kubectl get hpa 触发扩容。配置 Prometheus Adapter 暴露自定义指标（如 in-flight requests），基于该指标扩缩。",
          answer: "HPA + KEDA 配置：\n# hpa.yaml（基于 CPU）\napiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: fastapi-hpa\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: fastapi\n  minReplicas: 1\n  maxReplicas: 5\n  metrics:\n  - type: Resource\n    resource:\n      name: cpu\n      target:\n        type: Utilization\n        averageUtilization: 70"
        },
        duration: "3小时",
        resources: [
          { title: "K8s HPA 文档", url: "https://kubernetes.io/zh-cn/docs/tasks/run-application/horizontal-pod-autoscale/", required: true },
          { title: "KEDA 文档", url: "https://keda.sh/docs/", required: false }
        ],
        checkpoint: "压测时 HPA 自动扩容到 maxReplicas，空载时缩回 minReplicas，扩容延迟 < 2 分钟"
      }
    ]
  },

  // =====================================================
  // Node: devops-monitoring
  // =====================================================
  {
    id: "devops-monitoring",
    name: "监控体系：Prometheus + Grafana",
    track: "devops",
    duration: "1周",
    prerequisites: ["devops-kubernetes"],
    status: "locked",
    description: "围绕 AI 服务监控体系搭建。重点讲 Prometheus 指标采集、Grafana 可视化仪表盘构建，以及模型训练与服务监控的最佳实践。",
    outcomes: ["搭建 Prometheus + Grafana 监控栈", "设计 Grafana 仪表盘", "配置告警规则"],
    relatedIntel: ["017-metrics", "007-docker"],
    relatedTerms: ["prometheus", "grafana", "metrics", "alerting", "observability"],
    dailyTasks: [
      {
        day: 1,
        title: "Prometheus 指标采集与数据模型",
        content: {
          objective: "理解 Prometheus 的 Pull 模型与指标类型",
          api_checklist: [
            "指标类型：Counter（只增）、Gauge（可增减）、Histogram（分布）、Summary（分位数）",
            "Prometheus 的拉取模型（Pull over Push）：/metrics 端点",
            "prometheus.yml scrape_configs 配置",
            "PromQL 查询：rate() / increase() / histogram_quantile()"
          ],
          practice: "在 FastAPI 服务中添加 /metrics 端点（用 prometheus_client 库）：\nfrom prometheus_client import Counter, Histogram, generate_latest\nREQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])\nREQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP latency')\n@app.get('/metrics')\ndef metrics():\n    return Response(generate_latest(), media_type='text/plain')\n配置 prometheus.yml 拉取该端点，在 Prometheus UI 查询 rate(http_requests_total[5m])。",
          answer: "Histogram 使用：\nREQUEST_LATENCY = Histogram(\n    'http_request_duration_seconds',\n    'HTTP request latency',\n    ['endpoint'],\n    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 5.0]\n)\n\n@app.middleware('http')\ndef track_request(request: Request, call_next):\n    with REQUEST_LATENCY.labels(endpoint=request.url.path).time():\n        response = call_next(request)\n    return response"
        },
        duration: "2小时",
        resources: [
          { title: "Prometheus 数据模型", url: "https://prometheus.io/docs/concepts/data_model/", required: true },
          { title: "PromQL 常用函数", url: "https://prometheus.io/docs/prometheus/latest/querying/functions/", required: true }
        ],
        checkpoint: "Prometheus UI 能查到 http_requests_total 和 http_request_duration_seconds 的数据"
      },
      {
        day: 2,
        title: "Grafana 仪表盘设计与查询",
        content: {
          objective: "用 Grafana 构建可操作的监控仪表盘",
          api_checklist: [
            "Grafana DataSource 配置（Prometheus）",
            "Panel 类型：Stat / Time series / Gauge / Table",
            "变量（Variables）：支持动态下钻",
            "Dashboard JSON 导出/导入"
          ],
          practice: "设计 AI 推理服务仪表盘，包含：1) QPS 折线图（time series，rate(http_requests_total[1m])）；2) P99 延迟仪表盘（gauge，histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))）；3) GPU 利用率热力图；4) 错误率告警叠加。用 Grafana Provisioning 方式管理仪表盘（YAML 配置）。",
          answer: "Grafana Provisioning dashboard JSON 关键 panel：\n{\n  \"title\": \"QPS\",\n  \"type\": \"timeseries\",\n  \"datasource\": \"Prometheus\",\n  \"targets\": [{\n    \"expr\": \"rate(http_requests_total[1m])\",\n    \"legendFormat\": \"{{method}} {{endpoint}}\"\n  }],\n  \"fieldConfig\": {\n    \"defaults\": {\n      \"unit\": \"reqps\",\n      \"custom\": {\n        \"drawStyle\": \"line\",\n        \"lineWidth\": 2\n      }\n    }\n  }\n}"
        },
        duration: "2小时",
        resources: [
          { title: "Grafana 文档", url: "https://grafana.com/docs/grafana/latest/", required: true },
          { title: "Grafana Provisioning", url: "https://grafana.com/docs/grafana/latest/administration/provisioning/", required: true }
        ],
        checkpoint: "仪表盘可正常显示实时 QPS、Latency P99、GPU 利用率，刷新延迟 < 5s"
      },
      {
        day: 3,
        title: "Prometheus 告警规则配置",
        content: {
          objective: "配置有意义的告警规则",
          api_checklist: [
            "prometheusrule CRD 定义告警规则",
            "alerting 规则：ALERT <name> / IF <promql> / FOR <duration>",
            "Alertmanager 路由配置（email / slack / webhook）",
            "告警抑制和静默（inhibition / silencing）"
          ],
          practice: "写 alert_rules.yaml 配置以下告警：1) GPU 利用率 > 95% 持续 5 分钟；2) HTTP 错误率 > 5% 持续 2 分钟；3) P99 延迟 > 2s 持续 5 分钟；4) Pod 重启次数 > 3 次/10分钟。在 Prometheus Alerting 页面触发测试告警（用 absent() 或调整 FOR=0），验证 Alertmanager 收到通知。",
          answer: "告警规则 YAML：\ngroups:\n- name: ai-service-alerts\n  rules:\n  - alert: HighGPPUtilization\n    expr: avg(gpu_utilization) > 95\n    for: 5m\n    labels:\n      severity: warning\n    annotations:\n      summary: \"GPU 利用率超过 95%\"\n      description: \"当前 GPU 利用率 {{ $value }}%\"\n  - alert: HighErrorRate\n    expr: rate(http_requests_total{status=~\"5..\"}[2m]) / rate(http_requests_total[2m]) > 0.05\n    for: 2m\n    labels:\n      severity: critical"
        },
        duration: "1.5小时",
        resources: [
          { title: "Prometheus Alerting 文档", url: "https://prometheus.io/docs/alerting/latest/", required: true },
          { title: "Alertmanager 配置", url: "https://prometheus.io/docs/alerting/latest/configuration/", required: true }
        ],
        checkpoint: "触发测试告警后 Alertmanager 成功发送通知（email/slack/webhook 任一）"
      },
      {
        day: 4,
        title: "模型训练指标监控：MLflow / WandB",
        content: {
          objective: "在模型训练过程中系统化采集和可视化指标",
          api_checklist: [
            "MLflow Tracking Server：记录 experiment / run / metric / param",
            "mlflow.start_run() / mlflow.log_metric() API",
            "MLflow Model Registry：版本管理与 stage 流转",
            "WandB 作为替代方案对比"
          ],
          practice: "写 train_monitor.py：用 PyTorch 训练 ResNet18，同时用 mlflow 记录：1) 每次 epoch 的 train_loss / val_loss / accuracy；2) GPU 显存占用曲线；3) 学习率调度器当前值。启动 mlflow server（mlflow ui --backend-store-uri sqlite:///mlruns.db），查看训练曲线的并排对比（不同 run 的 loss 曲线）。",
          answer: "MLflow 记录 API：\nimport mlflow\nmlflow.set_experiment('resnet18-training')\n\nwith mlflow.start_run(run_name='lr=1e-3_batch=32'):\n    mlflow.log_param('learning_rate', 1e-3)\n    mlflow.log_param('batch_size', 32)\n    \n    for epoch in range(epochs):\n        train_loss = train_epoch(model, loader)\n        val_loss, val_acc = evaluate(model, val_loader)\n        \n        mlflow.log_metrics({\n            'train_loss': train_loss,\n            'val_loss': val_loss,\n            'val_accuracy': val_acc,\n            'gpu_memory_mb': torch.cuda.memory_allocated() / 1e6\n        }, step=epoch)\n        \n        mlflow.pytorch.log_model(model, 'model')"
        },
        duration: "2小时",
        resources: [
          { title: "MLflow 文档", url: "https://mlflow.org/docs/latest/index.html", required: true },
          { title: "WandB 文档", url: "https://docs.wandb.ai/", required: false }
        ],
        checkpoint: "MLflow UI 中能查看多个 run 的 loss 曲线并排对比，所有 metric 有时间戳记录"
      },
      {
        day: 5,
        title: "综合：监控完整 AI 服务",
        content: {
          objective: "串联监控体系，监控一个真实 AI 推理服务",
          api_checklist: [
            "Docker Compose 编排：FastAPI + Prometheus + Grafana",
            "cAdvisor 采集容器级别资源指标",
            "自定义业务指标（inference_count / model_version）",
            "Dashboard 大盘一键可重复部署"
          ],
          practice: "写 docker-compose.monitoring.yml：用 docker-compose 编排 FastAPI 推理服务 + Prometheus（cAdvisor 插件）+ Grafana（带 Provisioning）。在 FastAPI 中添加业务指标（inference_latency_seconds / model_version / requests_total）。配置 Grafana provisioning 加载预设仪表盘 JSON。压测后在大盘中验证所有指标正常显示。",
          answer: "docker-compose 核心配置：\nservices:\n  prometheus:\n    image: prom/prometheus:latest\n    volumes:\n      - ./prometheus.yml:/etc/prometheus/prometheus.yml\n      - ./alert_rules.yml:/etc/prometheus/alert_rules.yml\n    ports:\n      - \"9090:9090\"\n\n  grafana:\n    image: grafana/grafana\n    volumes:\n      - ./grafana/provisioning:/etc/grafana/provisioning\n      - ./grafana/dashboards:/var/lib/grafana/dashboards\n    ports:\n      - \"3000:3000\"\n\n  cadvisor:\n    image: gcr.io/cadvisor/cadvisor:latest\n    volumes:\n      - /:/rootfs:ro\n      - /var/run:/var/run:ro\n    privileged: true"
        },
        duration: "3小时",
        resources: [
          { title: "cAdvisor 文档", url: "https://github.com/google/cadvisor", required: true }
        ],
        checkpoint: "docker compose up 成功后，Grafana 大盘显示 QPS/Latency/GPU/容器资源全部正常"
      }
    ]
  },

  // =====================================================
  // Node: math-information-theory
  // =====================================================
  {
    id: "math-information-theory",
    name: "信息论基础",
    track: "math",
    duration: "1周",
    prerequisites: ["math-linear-algebra"],
    status: "locked",
    description: "围绕信息论核心概念及其在机器学习中的应用。重点讲熵、交叉熵、KL 散度与损失函数的内在联系，以及 MLE/MAP 估计的理论基础。",
    outcomes: ["理解熵与互信息的定义", "掌握交叉熵作为损失函数的数学推导", "理解 MLE / MAP 估计的等价性"],
    relatedIntel: ["010-numpy-pandas", "011-pytorch"],
    relatedTerms: ["entropy", "cross-entropy", "kl-divergence", "mutual-information", "mle", "map"],
    dailyTasks: [
      {
        day: 1,
        title: "熵、联合熵、条件熵",
        content: {
          objective: "掌握信息熵的数学定义与直观理解",
          api_checklist: [
            "自信息 I(x) = -log P(x)，熵 H(X) = E[I(x)] = -Σ P(x) log P(x)",
            "联合熵 H(X,Y) = -ΣΣ P(x,y) log P(x,y)",
            "条件熵 H(Y|X) = Σ P(x) H(Y|X=x) = H(X,Y) - H(X)",
            "信息熵的单位：bit（log base 2）vs nat（log base e）"
          ],
          practice: "写 entropy.py：用 NumPy 实现熵计算函数 entropy(p)，验证：1) 均匀分布 entropy=log(n)；2) 极端分布 entropy→0；3) 计算投硬币（正反各 0.5）和骰子（各 1/6）的熵并对比。用 matplotlib 画 p∈[0,1] 时 Bernoulli(p) 熵的变化曲线。",
          answer: "NumPy 实现：\nimport numpy as np\n\ndef entropy(p):\n    \"\"\"p: 概率分布 array，必须归一化\"\"\"\n    p = np.asarray(p)\n    # 过滤掉 0 概率（0*log(0) = 0）\n    mask = (p > 0) & (p < 1)\n    return -np.sum(p[mask] * np.log2(p[mask]))\n\n# Bernoulli 熵曲线\nps = np.linspace(0.001, 0.999, 100)\nhs = [entropy([p, 1-p]) for p in ps]\n# 峰值在 p=0.5：H=1 bit（最不确定）\n# p=0 或 1：H=0（完全确定）"
        },
        duration: "1.5小时",
        resources: [
          { title: "信息论教程（Stanford CS229 补充材料）", url: "https://cs.stanford.edu/~rvarun/github.github.com/clients/doc/statistics/supplemental_linalg.pdf", required: true },
          { title: "Information Theory 书籍（Cover & Thomas）", url: "https://www.goodreads.com/book/show/1796510.Elements_of_Information_Theory", required: false }
        ],
        checkpoint: "Bernoulli(p=0.5) 熵=1 bit，Bernoulli(p=0.1) 熵≈0.47 bit，验证正确"
      },
      {
        day: 2,
        title: "交叉熵与 KL 散度",
        content: {
          objective: "理解交叉熵作为损失函数的数学根源",
          api_checklist: [
            "交叉熵 H(P,Q) = -Σ P(x) log Q(x) = H(P) + D_KL(P||Q)",
            "KL 散度 D_KL(P||Q) = Σ P(x) log (P(x)/Q(x))，非对称 ≠ 距离",
            "最小化交叉熵 = 最大化似然估计（当 P 是真实分布时）",
            "Binary Cross-Entropy（BCE）= 交叉熵在二分类的特殊形式"
          ],
          practice: "写 bce_derivation.py：从 KL 散度出发推导 BCE loss。手动实现：1) 给定真实分布 P（one-hot）和预测分布 Q（softmax 输出），计算 H(P,Q) 和 D_KL(P||Q)；2) 对比手动实现与 torch.nn.functional.binary_cross_entropy 的数值是否一致；3) 验证：当预测越接近真实分布，KL(P||Q) 越小。",
          answer: "推导：\nH(P, Q) = -Σ P(x) log Q(x)\n       = -Σ P(x) log P(x) - Σ P(x) log (Q(x)/P(x))\n       = H(P) + D_KL(P||Q)\n\n由于 H(P) 对 Q 是常数，最小化 H(P,Q) 等价于最小化 D_KL(P||Q)。\n\n二分类 BCE = -[y·log(ŷ) + (1-y)·log(1-ŷ)]，是 H(P,Q) 的具体形式。"
        },
        duration: "1.5小时",
        resources: [
          { title: "Cross-Entropy Loss 数学推导", url: "https://pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html", required: true }
        ],
        checkpoint: "手动实现的 BCE 与 torch.nn.functional.binary_cross_entropy_with_logits 差值 < 1e-5"
      },
      {
        day: 3,
        title: "最大似然估计 MLE 与最大后验估计 MAP",
        content: {
          objective: "理解 MLE 和 MAP 的数学框架",
          api_checklist: [
            "MLE：θ_MLE = argmax_θ Π_i P(x_i | θ) = argmin_θ -Σ log P(x_i | θ)",
            "MAP：θ_MAP = argmax_θ P(θ | x) = argmax_θ P(x | θ) P(θ)",
            "对数似然 log-likelihood，L(θ) = Σ log P(x_i | θ)",
            "MAP = MLE + 先验贡献，L2 正则 ⟺ MAP with Gaussian Prior"
          ],
          practice: "写 mle_map.py：\n1. 生成服从 N(μ=2.0, σ²=0.5) 的 1000 个样本点\n2. 用 MLE 估计 μ：μ̂ = (1/n) Σ x_i，手动计算结果\n3. 用 MAP 估计 μ，假设先验 μ ~ N(0, 1)（即加 L2 正则化）\n4. 对比不同样本量 n=10/100/1000 下 MLE 和 MAP 的估计值差异，验证：样本越多，两者越接近；样本越少，MAP 更稳定。",
          answer: "MAP 推导：\nlog P(θ|x) ∝ log P(x|θ) + log P(θ)\n            = Σ [-0.5 * (x_i - θ)² / σ²] - 0.5 * θ² / σ_prior² + const\n\n取导数 = 0：\nΣ (x_i - θ̂) / σ² - θ̂ / σ_prior² = 0\n→ θ̂_MAP = (Σ x_i / σ²) / (n/σ² + 1/σ_prior²)\n         = (n / (n + σ²/σ_prior²)) * (Σ x_i / n)\n         = (n / (n + λ)) * MLE  ← 有正则化效果的来源"
        },
        duration: "2小时",
        resources: [
          { title: "MLE vs MAP 对比", url: "https://sgfin.github.io/learning/must-reads/", required: true }
        ],
        checkpoint: "n=10 时 MAP 和 MLE 差异显著；n=1000 时差异 < 1%，验证理论预测"
      },
      {
        day: 4,
        title: "AIC / BIC / MDL 模型选择",
        content: {
          objective: "理解模型选择准则的统计学基础",
          api_checklist: [
            "AIC = -2 log L(θ̂) + 2k（L=似然函数，k=参数数量）",
            "BIC = -2 log L(θ̂) + k log n（n=样本量，n大时 BIC > AIC）",
            "MDL（最小描述长度）：数据+模型的编码长度最短者最优",
            "奥卡姆剃刀：参数越多（模型越复杂），过拟合风险越大"
          ],
          practice: "写 model_selection.py：用 sklearn 的 diabetes 数据集，训练 5 个不同阶数的多项式回归模型（degree=1~5）。计算每个模型的：1) 训练集 MSE；2) 验证集 MSE；3) AIC；4) BIC。验证：训练 MSE 随 degree 增加而下降，但验证 MSE 在某个 degree 之后开始上升（AIC/BIC 能找到最优复杂度）。",
          answer: "AIC/BIC 实现：\nfrom sklearn.preprocessing import PolynomialFeatures\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error\nimport numpy as np\n\ndef calc_aic(y_true, y_pred, k):\n    n = len(y_true)\n    rss = np.sum((y_true - y_pred) ** 2)\n    # AIC = n * log(rss/n) + 2k（常数项可忽略）\n    aic = n * np.log(rss/n) + 2 * k\n    return aic\n\ndef calc_bic(y_true, y_pred, k):\n    n = len(y_true)\n    rss = np.sum((y_true - y_pred) ** 2)\n    bic = n * np.log(rss/n) + k * np.log(n)\n    return bic"
        },
        duration: "1.5小时",
        resources: [
          { title: "AIC/BIC 论文", url: "https://www.cs.ubc.ca/~murphyk/Papers/aic-bic.pdf", required: false }
        ],
        checkpoint: "degree=3 时 BIC 最低，对应验证 MSE 最低，验证奥卡姆剃刀原则"
      },
      {
        day: 5,
        title: "信息论视角看 Transformer",
        content: {
          objective: "用信息论分析注意力机制",
          api_checklist: [
            "互信息 I(X;Y) = H(X) - H(X|Y) = H(Y) - H(Y|X)",
            "注意力分数即 query 和 key 的互信息估计",
            "信息瓶颈（Information Bottleneck）：压缩有用信息、丢弃噪声",
            "Entropy 衡量 attention weight 分布的尖锐程度"
          ],
          practice: "写 attention_entropy.py：\n1. 加载一个训练好的 Transformer 模型\n2. 计算 attention weight 分布的熵（每个 head，每个 token 位置）\n3. 可视化：横轴=layer index，纵轴=平均 attention 熵（越高=越 uniform，越低=越 peaked）\n4. 对比不同输入（短句 vs 长文本）的 attention 熵分布差异。",
          answer: "Attention 熵计算：\ndef attention_entropy(attn_weights):\n    # attn_weights: (num_heads, seq_len, seq_len)\n    # 每个 query 的 attention 分布熵\n    eps = 1e-9\n    ent = -np.sum(attn_weights * np.log2(attn_weights + eps), axis=-1)  # (num_heads, seq_len)\n    return np.mean(ent, axis=-1)  # 每个 head 的平均熵\n\n# 信息论解释：\n# 熵高 → attention 分散到多个 token（exploring）\n# 熵低 → attention 集中到少数 token（exploiting）"
        },
        duration: "2小时",
        resources: [
          { title: "Attention is all you need 论文", url: "https://arxiv.org/abs/1706.03762", required: true },
          { title: "Information Bottleneck in Transformers", url: "https://arxiv.org/abs/2002.09770", required: false }
        ],
        checkpoint: "浅层 attention 熵 > 深层 attention 熵（信息逐层压缩），与 IB 理论一致"
      }
    ]
  },

  // =====================================================
  // Node: math-optimization
  // =====================================================
  {
    id: "math-optimization",
    name: "凸优化理论基础",
    track: "math",
    duration: "1周",
    prerequisites: ["math-linear-algebra"],
    status: "locked",
    description: "围绕凸优化理论与深度学习优化器的数学原理。重点讲凸集/凸函数/梯度下降收敛性，以及 Adam/SGD 等优化器的数学推导。",
    outcomes: ["理解凸优化问题与局部最优的关系", "推导 Adam / SGD+Momentum 的更新公式", "理解正则化与优化问题的联系"],
    relatedIntel: ["010-numpy-pandas", "011-pytorch"],
    relatedTerms: ["convex-optimization", "gradient-descent", "adam", "sgd", "lagrangian", "kkt", "regularization"],
    dailyTasks: [
      {
        day: 1,
        title: "凸集、凸函数、KKT 条件",
        content: {
          objective: "建立凸优化的数学框架",
          api_checklist: [
            "凸集：连接任意两点的线段仍在集合内",
            "凸函数：一阶条件 f(θx+(1-θ)y) ≤ θf(x)+(1-θ)f(y)",
            "全局最优 = 局部最优（凸问题）",
            "拉格朗日函数 L(θ, λ) = f(θ) + Σ λ_i g_i(θ)"
          ],
          practice: "写 convex_check.py：用 CVXPY 验证以下问题：\n1. f(x)=x² 是凸函数（验证二阶导 ≥ 0）\n2. f(x,y)=max(x,y) 是凸函数\n3. 约束优化：min x²+y² s.t. x+y=1，用拉格朗日求解，与 KKT 条件对比\n4. 用 CVXPY.solve 验证解析解。",
          answer: "KKT 条件核心：\n对 min f(θ) s.t. g(θ) ≤ 0, h(θ) = 0\nKKT 条件（必要性）：\n1. ∇f + λᵀ∇g + μᵀ∇h = 0（平稳性）\n2. λᵢ ≥ 0（对偶可行性）\n3. λᵢgᵢ(θ*) = 0（互补松弛）\n4. gᵢ(θ*) ≤ 0（原始可行性）\n5. hᵢ(θ*) = 0（等式约束可行性）"
        },
        duration: "2小时",
        resources: [
          { title: "CVXPY 文档", url: "https://www.cvxpylayers.readthedocs.io/", required: true },
          { title: "Convex Optimization (Boyd) 免费PDF", url: "https://web.stanford.edu/~boyd/cvxbook/", required: true }
        ],
        checkpoint: "CVXPY 求解结果与拉格朗日解析解一致（误差 < 1e-6）"
      },
      {
        day: 2,
        title: "梯度下降与收敛性分析",
        content: {
          objective: "理解梯度下降的收敛速度与步长选择",
          api_checklist: [
            "GD 更新：θ_{t+1} = θ_t - α ∇f(θ_t)",
            "L-smooth：||∇f(x) - ∇f(y)|| ≤ L ||x-y||",
            "收敛速率：凸函数 O(1/T)，强凸函数 O(1/T²)（步长 α = 1/L）",
            "随机梯度下降（SGD）：∇f(θ_t, ξ_t) 是真实梯度的无偏估计"
          ],
          practice: "写 gd_convergence.py：\n1. 目标函数 f(x,y) = (x-2)² + (y+1)²（L=2，Lipschitz 平滑），起始点 (0,0)\n2. 实现 GD（α=1/L），画 loss 曲线\n3. 实现 SGD（加噪声的梯度），α=0.1，画 GD vs SGD 收敛曲线对比\n4. 理论预测：GD 在 T 步后误差 O(1/T)，验证数值结果是否符合。",
          answer: "GD 收敛证明（简化版）：\n假设 f 是凸的且 L-smooth：\nf(θ_{t+1}) ≤ f(θ_t) + ∇f(θ_t)ᵀ(θ_{t+1}-θ_t) + (L/2)||θ_{t+1}-θ_t||²\n            = f(θ_t) - α||∇f||² + (Lα²/2)||∇f||²\n            = f(θ_t) - (α - Lα²/2)||∇f||²\n\n取 α = 1/L：f(θ_t) - f(θ*) ≤ (L/2T)||θ_0-θ*||² → O(1/T)"
        },
        duration: "2小时",
        resources: [
          { title: "SGD 收敛性分析", url: "https://arxiv.org/abs/1909.08520", required: true }
        ],
        checkpoint: "GD loss 曲线符合 O(1/T)，T=1000 时 loss < 1e-6（达到最优解附近）"
      },
      {
        day: 3,
        title: "Adam / AdamW 数学推导",
        content: {
          objective: "从原理理解 Adam 的动量与自适应学习率",
          api_checklist: [
            "一阶矩估计 m_t = β₁m_{t-1} + (1-β₁)g_t（梯度指数移动平均）",
            "二阶矩估计 v_t = β₂v_{t-1} + (1-β₂)g_t²（RMSProp 同样思路）",
            "偏差校正：m̂_t = m_t / (1-β₁ᵗ)，v̂_t = v_t / (1-β₂ᵗ)",
            "AdamW：weight decay = L2 正则 ≠ Adam + L2（数学上等价在特定条件下）"
          ],
          practice: "写 adam_from_scratch.py：\n不调用 torch.optim.Adam，手写实现：\n```python\ndef adam_update(params, grads, m, v, t, lr=1e-3, beta1=0.9, beta2=0.999, eps=1e-8):\n    # 手动实现上述公式\n    return params_new, m_new, v_new\n```\n用该实现训练一个 MLP（MNIST 分类），对比 torch.optim.Adam 的训练曲线和最终准确率（差值 < 1% 即通过）。",
          answer: "Adam 更新公式：\nm_t = β₁ * m_{t-1} + (1-β₁) * g_t\nv_t = β₂ * v_{t-1} + (1-β₂) * g_t²\nm̂ = m_t / (1 - β₁ᵗ)\nv̂ = v_t / (1 - β₂ᵗ)\nθ_{t+1} = θ_t - lr * m̂ / (√v̂ + eps)\n\n# 物理直觉：\n# m_t：梯度方向的指数移动平均（类似动量）\n# v_t：梯度平方的指数移动平均（自动调整每参数学习率）\n# 效果：大梯度参数 → 大 v → 自适应降低学习率\n#        小梯度参数 → 小 v → 保持较大学习率"
        },
        duration: "2.5小时",
        resources: [
          { title: "Adam 原始论文", url: "https://arxiv.org/abs/1412.6980", required: true },
          { title: "AdamW 论文", url: "https://arxiv.org/abs/1711.05101", required: true }
        ],
        checkpoint: "手写 Adam 训练 MLP，10 epochs 后准确率与 torch.optim.Adam 差值 < 0.5%"
      },
      {
        day: 4,
        title: "L1 / L2 正则化与优化问题",
        content: {
          objective: "理解正则化作为约束优化问题的几何解释",
          api_checklist: [
            "L2 正则：min L(θ) + λ||θ||² ⟺ θ 在球内（约束）",
            "L1 正则：min L(θ) + λ||θ||₁ ⟺ θ 在 diamond 内（稀疏解）",
            "Proximal Gradient Descent：L1 的近端算子 = 软阈值 shrinkage",
            "Elastic Net：L1 + L2 组合，兼顾稀疏性和稳定性"
          ],
          practice: "写 lasso_vs_ridge.py：\n1. 生成高维稀疏数据（n=100, d=1000，真实稀疏度 90%）\n2. 分别用 Ridge（α=1.0）和 Lasso（α=1.0）拟合\n3. 记录 Ridge 和 Lasso 的非零系数数量，Lasso 应稀疏（稀疏度 ≈ 90%）\n4. 用 sklearn LassoCV 找最优 α，验证 CV 选择的 α 对应最好的测试集性能。",
          answer: "软阈值算子（Proximal of L1）：\ndef soft_threshold(x, threshold):\n    \"\"\"Proximal operator of L1 norm\"\"\"\n    return np.sign(x) * np.maximum(np.abs(x) - threshold, 0)\n\n# 几何直觉：\n# L2（球约束）→ 与等 Loss 线切于所有方向 → 无稀疏性\n# L1（diamond 约束）→ 等 Loss 线优先与 diamond 顶点相交 → 稀疏（轴对齐）"
        },
        duration: "1.5小时",
        resources: [
          { title: "Proximal Gradient Descent", url: "https://www.stat.cmu.edu/~ryantibs/convexopt/", required: false }
        ],
        checkpoint: "Lasso 非零系数数量 < Ridge 的 20%，验证 L1 稀疏性"
      },
      {
        day: 5,
        title: "综合：优化器选择与学习率调度",
        content: {
          objective: "在真实训练任务中选择合适的优化器与学习率调度",
          api_checklist: [
            "StepLR / CosineAnnealing / Warmup + Cosine 调度策略",
            "SGD + Momentum (0.9) 在大模型中仍是首选（ViT / MAE 等论文验证）",
            "Adam 收敛快但泛化差：通常用于快速原型，后期切换 SGD 微调",
            "Learning Rate Finder：Leslie Smith 的 LR range test"
          ],
          practice: "写 optimizer_comparison.py：\n在 CIFAR-10 上训练 ResNet-18（可减少 epochs），对比以下配置：\n1) Adam (lr=1e-3)\n2) SGD + Momentum (lr=0.1, momentum=0.9)\n3) AdamW (lr=1e-3, weight_decay=1e-4)\n4) SGD + CosineAnnealing (lr=0.1)\n记录每个的 best test accuracy 和达到 best accuracy 的 epoch 数。最终报告：哪个优化器泛化最好，哪个收敛最快。",
          answer: "Cosine Annealing 实现：\ndef cosine_annealing(epoch, T_max, eta_max, eta_min=0):\n    return eta_min + (eta_max - eta_min) * 0.5 * (\n        1 + np.cos(np.pi * epoch / T_max)\n    )\n\n# Warmup + Cosine（PyTorch 内置）：\nscheduler = torch.optim.lr_scheduler.CosineAnnealingWarmRestarts(\n    optimizer, T_0=10, T_mult=2, eta_min=1e-6\n)"
        },
        duration: "3小时",
        resources: [
          { title: "PyTorch 优化器文档", url: "https://pytorch.org/docs/stable/optim.html", required: true },
          { title: "SGDR 论文", url: "https://arxiv.org/abs/1608.03983", required: true }
        ],
        checkpoint: "SGD + Cosine 在 CIFAR-10 上 test accuracy > Adam（LSTM 泛化差距的经验验证）"
      }
    ]
  },

  // =====================================================
  // Node: project-data-pipeline
  // =====================================================
  {
    id: "project-data-pipeline",
    name: "数据管道与 ETL",
    track: "project",
    duration: "1周",
    prerequisites: ["linux-basic"],
    status: "locked",
    description: "围绕数据采集、清洗、标注、版本管理与定时调度。重点讲构建一条从原始数据到训练-ready 数据的完整端到端 Pipeline。",
    outcomes: ["掌握爬虫/API 数据采集", "数据清洗与质量验证", "DVC 数据版本管理", "Airflow 定时任务编排"],
    relatedIntel: ["009-linux", "010-numpy-pandas"],
    relatedTerms: ["etl", "web-scraping", "dvc", "airflow", "data-quality", "pandas"],
    dailyTasks: [
      {
        day: 1,
        title: "多源数据采集：爬虫 / API / 数据库",
        content: {
          objective: "掌握多种数据采集方式",
          api_checklist: [
            "requests + BeautifulSoup：网页结构化解析",
            "Scrapy 框架：大规模爬虫，支持增量爬取",
            "公共 API 调用：OpenAlex / PubMed / Wikipedia API",
            "数据库导出：pandas read_sql / sqlalchemy 连接"
          ],
          practice: "写 data_collector.py：从 Wikipedia API（https://en.wikipedia.org/w/api.php）采集 100 篇 AI 相关词条，提取 title / summary / categories / links。输出为 JSONL 格式，每行一条记录。验证：100 条记录中至少有 90 条包含 title 和 summary 字段。",
          answer: "Wikipedia API 调用：\nimport requests\nimport json\n\ndef fetch_wikipedia_articles(query, limit=100):\n    results = []\n    url = \"https://en.wikipedia.org/w/api.php\"\n    params = {\n        \"action\": \"query\",\n        \"format\": \"json\",\n        \"list\": \"search\",\n        \"srsearch\": query,\n        \"srlimit\": limit\n    }\n    resp = requests.get(url, params=params).json()\n    page_ids = [r['pageid'] for r in resp['query']['search']]\n    \n    # 获取详情\n    detail_params = {\n        \"action\": \"query\",\n        \"format\": \"json\",\n        \"pageids\": \"|\".join(map(str, page_ids)),\n        \"prop\": \"extracts|categories\",\n        \"exintro\": True,\n        \"explaintext\": True,\n        \"cllimit\": 10\n    }\n    return requests.get(url, params=detail_params).json()"
        },
        duration: "2小时",
        resources: [
          { title: "Wikipedia API 文档", url: "https://www.mediawiki.org/wiki/API:Main_page", required: true },
          { title: "Scrapy 官方文档", url: "https://docs.scrapy.org/", required: false }
        ],
        checkpoint: "100 条 Wikipedia 文章 JSONL 文件，大小 > 100KB，字段完整率 > 90%"
      },
      {
        day: 2,
        title: "数据清洗与 Great Expectations 验证",
        content: {
          objective: "系统化数据质量检查与清洗",
          api_checklist: [
            "Pandas 数据清洗：dropna / fillna /duplicates",
            "正则清洗：去除 HTML 标签、特殊字符处理",
            "Great Expectations：声明式数据契约（expectations）",
            "数据质量报告：完整性/一致性/分布"
          ],
          practice: "写 data_cleaner.py：读取昨天的 JSONL 数据，用 Great Expectations 定义以下契约：\n1. title 非空且长度 5-200\n2. summary 非空且类型为 str\n3. categories 列表长度 ≥ 1\n4. 所有 URL 格式合法\n输出质量报告，标记不符合契约的记录并统计清洗后的数据保留率。",
          answer: "Great Expectations 契约示例：\nimport great_expectations as ge\n\ndf = ge.from_pandas(pandas_df)\n\ndf.expect_column_values_to_not_be_null('title')\ndf.expect_column_value_lengths_to_be_between('title', 5, 200)\ndf.expect_column_values_to_match_regex('summary', r'^[\\S\\s]+$')\ndf.expect_column_values_to_be_of_type('categories', 'list')\ndf.expect_column_values_to_be_in_set('categories', valid_categories)\n\nresults = df.validate()\nprint(results['success'], results[' statistics'])"
        },
        duration: "2小时",
        resources: [
          { title: "Great Expectations 文档", url: "https://docs.greatexpectations.io/", required: true },
          { title: "Pandas 数据清洗技巧", url: "https://pandas.pydata.org/pandas-docs/stable/user_guide/missing_data.html", required: true }
        ],
        checkpoint: "GE 报告显示 > 80% 数据通过全部契约，失败条目有明确原因记录"
      },
      {
        day: 3,
        title: "数据标注流水线：Label Studio",
        content: {
          objective: "搭建多人协作的数据标注平台",
          api_checklist: [
            "Label Studio 部署（Docker one-liner）",
            "配置 XML 标注模板：NER / 文本分类 / 关系抽取",
            "Label Studio API：创建项目 / 上传数据 / 导出标注",
            "Active Learning：模型不确定性驱动优先标注"
          ],
          practice: "启动 Label Studio（Docker），创建文本分类项目，配置 3 类标注（AI/ML/Data Science）。上传 200 条未标注文本，邀请 2 个标注者（模拟）。完成 50 条标注后，用 Label Studio API 导出 COCO 格式标注结果，与原始文本合并保存为训练集格式。",
          answer: "Label Studio API 使用：\nfrom label_studio_sdk import Client\n\nls = Client(url='http://localhost:8080', api_key='your-api-key')\nproject = ls.get_project(project_name='Text Classification')\n\n# 上传数据\nimport json\ntasks = [{'data': {'text': row['summary']}} for _, row in df.iterrows()]\nproject.import_tasks(tasks)\n\n# 导出标注\nannotations = project.export_labels(format='JSON')\nwith open('annotations.json', 'w') as f:\n    f.write(annotations)"
        },
        duration: "2.5小时",
        resources: [
          { title: "Label Studio GitHub", url: "https://github.com/HumanSignal/label-studio", required: true },
          { title: "Label Studio API 文档", url: "https://labelstud.io/sdk/", required: true }
        ],
        checkpoint: "50 条标注数据成功导出，格式与原始文本正确合并，人工抽检标注一致性 > 80%"
      },
      {
        day: 4,
        title: "DVC 数据版本控制",
        content: {
          objective: "用 DVC 管理数据集版本，与 Git 工作流无缝结合",
          api_checklist: [
            "dvc init / dvc add data/file.csv：跟踪数据文件",
            "dvc push / pull：上传下载数据到远程存储（S3/GCS/HTTP）",
            "dvc.yaml：定义 Pipeline stages（预处理/训练/评估）",
            "dvc repro：基于依赖图自动重跑需要更新的 stage"
          ],
          practice: "写 dvc_pipeline.py：创建 data/ 目录放入原始文本，用 dvc add data/text.jsonl 跟踪。用 dvc remote add -d myremote s3://my-bucket/dvc-store 配置 S3 远程存储。写 dvc.yaml 定义 stages：preprocess（清洗数据）→ featurize（向量化）→ train（训练模型）。修改 preprocess 源码后用 dvc repro 自动重跑受影响的所有 stage。",
          answer: "dvc.yaml 模板：\nstages:\n  preprocess:\n    cmd: python preprocess.py\n    deps:\n      - data/raw.jsonl\n    outs:\n      - data/clean.jsonl\n  featurize:\n    cmd: python featurize.py\n    deps:\n      - data/clean.jsonl\n    outs:\n      - data/features.pkl\n  train:\n    cmd: python train.py\n    deps:\n      - data/features.pkl\n    params:\n      - model.lr\n      - model.epochs\n    outs:\n      - models/model.pkl"
        },
        duration: "1.5小时",
        resources: [
          { title: "DVC 官方文档", url: "https://dvc.org/doc/start", required: true }
        ],
        checkpoint: "修改 preprocess.py 后 dvc repro 只重跑 preprocess 和 train（不重跑 featurize），依赖图正确"
      },
      {
        day: 5,
        title: "Airflow 定时任务与数据质量监控",
        content: {
          objective: "用 Airflow 编排定时数据处理任务",
          api_checklist: [
            "Airflow DAG：定义 tasks + dependencies",
            "@dag / @task 装饰器写法",
            "Cron 调度：schedule_interval='0 2 * * *'（每天凌晨 2 点）",
            "Airflow XCom：任务间传递数据"
          ],
          practice: "写 data_pipeline_dag.py：用 Airflow 定义一个每日运行的 DAG：\n1) fetch_wikipedia（每天抓取新文章）\n2) clean_data（清洗新增数据）\n3) validate_quality（运行 Great Expectations 检查）\n4) update_vector_db（更新向量数据库）\n配置 schedule_interval='0 3 * * *'（凌晨 3 点运行）。用 airflow dags test 手动触发一次 DAG，验证所有任务成功。",
          answer: "Airflow DAG 模板：\nfrom airflow import DAG\nfrom airflow.operators.python import PythonOperator\nfrom datetime import datetime, timedelta\n\ndefault_args = {\n    'owner': 'data-team',\n    'retries': 2,\n    'retry_delay': timedelta(minutes=10),\n}\n\nwith DAG(\n    'data_pipeline',\n    default_args=default_args,\n    schedule_interval='0 3 * * *',\n    start_date=datetime(2024, 1, 1),\n    catchup=False,\n) as dag:\n    \n    fetch = PythonOperator(\n        task_id='fetch_wikipedia',\n        python_callable=fetch_wikipedia_articles,\n    )\n    \n    clean = PythonOperator(\n        task_id='clean_data',\n        python_callable=clean_data,\n    )\n    \n    validate = PythonOperator(\n        task_id='validate_quality',\n        python_callable=validate_data,\n    )\n    \n    fetch >> clean >> validate"
        },
        duration: "2.5小时",
        resources: [
          { title: "Airflow 官方文档", url: "https://airflow.apache.org/docs/apache-airflow/stable/index.html", required: true }
        ],
        checkpoint: "DAG 手动触发成功，所有 4 个任务完成，Airflow UI 显示 success 状态"
      }
    ]
  },

  // =====================================================
  // Node: cs-algo - 算法与数据结构
  // =====================================================
  {
    id: "cs-algo",
    name: "算法与数据结构",
    track: "cs",
    duration: "4周",
    prerequisites: [],
    status: "available",
    position: { x: 0, y: 0 },
    description: "计算机科学的核心基础，包括常用算法设计思路、时间空间复杂度分析、以及各类数据结构的应用场景",
    outcomes: ["熟练分析代码复杂度", "掌握常见算法设计范式", "能用数据结构解决实际问题"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["algorithm", "data-structure", "complexity"],
    dailyTasks: [
      { day: 1, title: "复杂度分析：时间与空间", content: ["算法复杂度分析是评价算法优劣的核心标准。时间复杂度表示随输入规模增长，算法执行次数的增长趋势；空间复杂度表示算法所需的内存空间增长趋势", "大O表示法（O notation）是最常用的复杂度标记：O(1)常数级、O(log n)对数级、O(n)线性级、O(n log n)线性对数级、O(n²)平方级、O(2^n)指数级", "常见例子：数组访问是O(1)、线性搜索是O(n)、二分搜索是O(log n)、嵌套循环通常产生O(n²)", "在实际开发中，我们通常关注最坏情况复杂度（Worst Case），但也要了解平均情况（Average Case）和最好情况（Best Case）"], duration: "2小时", resources: [{ title: "Big O Cheat Sheet", url: "https://www.bigocheatsheet.com/", required: true, type: "doc", source: "official" }, { title: "算法复杂度可视化", url: "https://visualgo.net/", required: false, type: "tool", source: "official" }, { title: " AlgoDaily算法教程", url: "https://github.com/jaredlunde/algorithm-visualizer", required: false, type: "repo", source: "github" }], checkpoint: "能给出一个函数的准确复杂度分析，并按复杂度对常见操作排序" },
      { day: 2, title: "数组与字符串处理", content: ["数组是最基础的数据结构，在内存中是连续存储的，这使得随机访问是O(1)但插入删除是O(n)", "字符串处理在AI领域极为常见：分词、编码、模式匹配等。Python中字符串是不可变对象，每次修改都会创建新对象", "双指针技巧是处理有序数组的利器：两数之和、移除元素、滑动窗口等都用双指针在O(n)解决", "LeetCode经典题：两数之和、三数之和、最长无重复子串，这些都展现了对撞指针和滑动窗口的威力"], duration: "2小时", resources: [{ title: "LeetCode 数组章节", url: "https://leetcode.com/explore/learn/card/array-and-string/", required: true, type: "doc", source: "official" }, { title: "滑动窗口技巧", url: "https://leetcode.com/problems/minimum-size-subarray-sum/", required: false, type: "article", source: "other" }, { title: "LeetCode数组刷题", url: "https://github.com/Me FCCS/LeetCode_Arrays", required: false, type: "repo", source: "github" }], checkpoint: "能在10分钟内完成两数之和的双指针实现" },
      { day: 3, title: "链表操作与思维切换", content: ["链表与数组的核心区别：链表在内存中是非连续存储的，这使得插入删除是O(1)但访问是O(n)", "单链表只有一个方向指针，双链表有两个方向（前后），在需要反向遍历时更高效", "链表操作的核心技巧：dummy哑节点可以简化头部操作，快慢指针可以检测环路", "链表反转是链表操作的基础：保存下一个节点、当前节点反转、更新指针，递归和迭代两种实现都要掌握"], duration: "2小时", resources: [{ title: "链表可视化", url: "https://visualgo.net/en/list", required: true, type: "tool", source: "official" }, { title: "LeetCode 链表章节", url: "https://leetcode.com/explore/learn/card/linked-list/", required: true, type: "doc", source: "official" }, { title: "链表算法汇总", url: "https://github.com/haoel/leetcode", required: false, type: "repo", source: "github" }], checkpoint: "能不参考任何资料手写单向链表反转" },
      { day: 4, title: "栈与队列：LIFO与FIFO", content: ["栈（Stack）是后进先出（LIFO）的数据结构，只允许在栈顶进行插入删除，操作都是O(1)", "队列（Queue）是先进先出（FIFO）的数据结构，一端插入另一端删除", "单调栈是进阶技巧：维护一个递增或递减的栈，可以O(n)解决-next-greater-element系列问题", "队列的变种：双端队列（Deque）两端都可操作，循环队列用数组实现队列避免假溢出问题"], duration: "1.5小时", resources: [{ title: "栈和队列可视化", url: "https://visualgo.net/en/stack", required: true, type: "tool", source: "official" }, { title: "单调栈总结", url: "https://leetcode.com/problems/next-greater-element-i/", required: false, type: "article", source: "other" }, { title: "单调栈模板", url: "https://github.com/EndlessCheng/Obsidian-DataStructures-Algorithms", required: false, type: "repo", source: "github" }], checkpoint: "能用单调栈解决Next Greater Element问题" },
      { day: 5, title: "哈希表：O(1)的奥秘", content: ["哈希表通过哈希函数将键映射到数组索引，实现惊人的O(1)查找、插入、删除", "哈希碰撞是不可避免的，处理方法有：开放寻址法（Open Addressing）和链地址法（Chaining）", "Python的dict和set都是基于哈希表实现的，面试中常问它们与列表的性能差异", "哈希表的空间换时间思想在机器学习中也很常见：倒排索引、特征哈希、参数服务器等"], duration: "1.5小时", resources: [{ title: "哈希表可视化", url: "https://visualgo.net/en/hashtable", required: true, type: "tool", source: "official" }, { title: "Hash Map 内部原理", url: "https://www.youtube.com/watch?v=shs0kmR2us4", required: false, type: "video", source: "youtube" }, { title: "哈希表实现", url: "https://github.com/jwasham/published-artifacts", required: false, type: "repo", source: "github" }], checkpoint: "理解哈希碰撞和扩容机制，能解释为什么dict查询是O(1)" },
      { day: 6, title: "树与二叉树基础", content: ["树是一种分层数据结构，每个节点有零个或多个子节点，根节点没有父节点", "二叉树是每个节点最多有两个子节点的树，在计算机科学中应用极广：表达式树、决策树、语法树等", "二叉树的遍历：前序（根左右）、中序（左根右）、后序（左右根），递归实现简洁优雅", "二叉搜索树（BST）左子树所有节点小于根，右子树所有节点大于根，中序遍历得到有序序列"], duration: "2小时", resources: [{ title: "二叉树可视化", url: "https://visualgo.net/en/bst", required: true, type: "tool", source: "official" }, { title: "LeetCode 二叉树章节", url: "https://leetcode.com/explore/learn/card/data-structure-tree/", required: true, type: "doc", source: "official" }, { title: "二叉树题目汇总", url: "https://github.com/seshaf0/LeetCode-Tree", required: false, type: "repo", source: "github" }], checkpoint: "能手写前序、中序、后序三种遍历的递归和迭代版本" },
      { day: 7, title: "堆与优先队列", content: ["堆是一种完全二叉树，分为最大堆（父节点大于子节点）和最小堆（父节点小于子节点）", "堆的物理存储是数组，通过下标计算父节点和子节点的关系：父(i)= (i-1)//2，左子(2i+1)，右子(2i+2)", "Python的heapq是最小堆实现，常用场景：Top-K问题、合并K个有序文件、Dijkstra最短路", "堆排序是O(n log n)的排序算法，但实际中堆更多用于优先队列的数据结构实现"], duration: "1.5小时", resources: [{ title: "堆可视化", url: "https://visualgo.net/en/heap", required: true, type: "tool", source: "official" }, { title: "heapq用法", url: "https://docs.python.org/3/library/heapq.html", required: true, type: "doc", source: "official" }, { title: "TopK问题总结", url: "https://github.com/labuladong/fucking-algorithm", required: false, type: "repo", source: "github" }], checkpoint: "能用heapq实现Top-K问题，找出数组中最大的K个数" },
      { day: 8, title: "图的基础与遍历", content: ["图由顶点（Vertex）和边（Edge）组成，可以是有向/无向、带权/不带权", "图的表示方法：邻接矩阵（适合稠密图）、邻接表（适合稀疏图）", "图的遍历：DFS深度优先搜索（用栈或递归）适合找路径和连通分量，BFS广度优先搜索（用队列）适合找最短路径", "在AI中，图结构无处不在：神经网络是计算图、状态空间是图、知识图谱也是图"], duration: "2小时", resources: [{ title: "图可视化", url: "https://visualgo.net/en/graph", required: true, type: "tool", source: "official" }, { title: "DFS/BFS可视化对比", url: "https://leetcode.com/problems/number-of-islands/", required: false, type: "article", source: "other" }, { title: "LeetCode图论题目", url: "https://github.com/CyC2018/CS-Notes", required: false, type: "repo", source: "github" }], checkpoint: "能用DFS和BFS分别解决岛屿数量问题" },
      { day: 9, title: "动态规划入门", content: ["动态规划（DP）是机器学习优化的数学核心：反向传播、维特比算法、Beam Search背后的思想都是DP", "DP的两个核心要素：最优子结构（问题的最优解由子问题的最优解构成）和重叠子问题（子问题会被重复计算）", "DP三步曲：1）确定状态定义 2）找状态转移方程 3）确定初始状态和边界", "经典DP问题：斐波那契数列（状态转移的简单例子）、爬楼梯、硬币找零"], duration: "2小时", resources: [{ title: "DP可视化", url: "https://alright.gitlab.io/dynamic-programming/", required: true, type: "tool", source: "official" }, { title: "LeetCode DP章节", url: "https://leetcode.com/explore/learn/card/dynamic-programming/", required: true, type: "doc", source: "official" }, { title: "labuladong算法", url: "https://github.com/labuladong/fucking-algorithm", required: false, type: "repo", source: "github" }], checkpoint: "能独立分析斐波那契和硬币找零的状态定义和转移方程" },
      { day: 10, title: "经典DP问题实战", content: ["最长公共子序列（LCS）是NLP中序列对齐的基础，也是Diff算法的核心", "编辑距离（Levenshtein Distance）在拼写纠错、DNA序列比对、版本差异比较中都有应用", "背包问题有0-1背包和完全背包变种，是组合优化和资源分配问题的抽象", "DP的空间优化：很多DP问题可以用滚动数组把O(n)空间降到O(1)"], duration: "2.5小时", resources: [{ title: "LCS可视化", url: "https://www.youtube.com/watch?v=1RqQ0qWVKfs", required: true, type: "video", source: "youtube" }, { title: "编辑距离LeetCode", url: "https://leetcode.com/problems/edit-distance/", required: true, type: "doc", source: "official" }, { title: "DP论文", url: "https://github.com/tayllan/awesome-algorithms", required: false, type: "repo", source: "github" }], checkpoint: "能独立实现LCS和编辑距离的DP解法" },
      { day: 11, title: "回溯与分支限界", content: ["回溯是搜索问题的通用范式：枚举所有可能选择，在不满足条件时剪枝返回（回溯）", "典型应用：八皇后、数独求解、全排列、组合求和、括号生成", "回溯的核心是状态重置：选择时标记，恢复时撤销标记", "分支限界是回溯的优化版本，用剪枝策略（如贪心下界）减少搜索空间，在VRP车辆路径问题和深度学习中的Neural Architecture Search有应用"], duration: "2小时", resources: [{ title: "回溯算法模板", url: "https://leetcode.com/problems/permutations/", required: true, type: "doc", source: "official" }, { title: "八皇后可视化", url: "https://stackoverflow.com/questions/35462093/how-to-solve-eight-queens-problem-using-backtracking", required: false, type: "article", source: "other" }, { title: "回溯题目精选", url: "https://github.com/keenu/algorithms", required: false, type: "repo", source: "github" }], checkpoint: "能在15分钟内完成全排列的回溯实现" },
      { day: 12, title: "贪心算法", content: ["贪心算法在每一步选择中都采取当前状态下最优的选择，期望全局最优", "贪心正确性的证明通常需要证明每一步的最优选择能导出全局最优（反证法或交换论证）", "经典问题：活动选择、哈夫曼编码、最小生成树（Prim/Kruskal）、单源最短路径（Dijkstra）", "贪心与DP的选择：能用贪心解决的问题一定能用DP（但可能更慢），如果无法证明最优子结构就用DP"], duration: "1.5小时", resources: [{ title: "贪心算法正确性证明", url: "https://www.geeksforgeeks.org/greedy-algorithms/", required: true, type: "doc", source: "official" }, { title: "Dijkstra可视化", url: "https://visualgo.net/en/sssp", required: false, type: "tool", source: "official" }, { title: "哈夫曼编码实现", url: "https://github.com/TheAlgorithms/Python", required: false, type: "repo", source: "github" }], checkpoint: "能分析活动选择问题和哈夫曼编码的贪心正确性" },
      { day: 13, title: "并查集与拓扑排序", content: ["并查集（Union-Find）解决连通性问题：判断两个元素是否连通，合并两个集合", "并查集的路径压缩和按秩合并优化后，所有操作接近O(1)", "并查集应用：岛屿数量、朋友圈数量、等式成立判断、Kruskal最小生成树", "拓扑排序用于有向无环图（DAG），在AI工作流调度、任务依赖管理、编译器依赖分析中常用"], duration: "2小时", resources: [{ title: "并查集可视化", url: "https://visualgo.net/en/uf", required: true, type: "tool", source: "official" }, { title: "LeetCode 拓扑排序", url: "https://leetcode.com/problems/course-schedule/", required: true, type: "doc", source: "official" }, { title: "并查集模板", url: "https://github.com/wangzhengyi/algorithm", required: false, type: "repo", source: "github" }], checkpoint: "能用并查集和拓扑排序分别解决课程表问题" },
      { day: 14, title: "综合练习与面试冲刺", content: ["本练习综合所有数据结构：数组、链表、树、图、堆、哈希表的综合应用", "推荐刷题顺序：先Easy打基础（3天内完成20题），再Medium巩固（2周完成40题）", "面试技巧：先clarify题目细节和边界条件，再给出brute force解法，然后优化，最后分析复杂度", "AI算法岗面试重点：DP和贪心在模型优化中常用、图论在知识图谱中用到、树结构在决策树中直接相关"], duration: "3小时", resources: [{ title: "代码面试准备清单", url: "https://www.techinterviewhandbook.org/cheatsheet/", required: true, type: "doc", source: "official" }, { title: "Blind 75 LeetCode", url: "https://www.teachlcs.com/blind75/", required: true, type: "doc", source: "official" }, { title: "LeetCode精选题解", url: "https://github.com/azl397985856/LeetCode", required: false, type: "repo", source: "github" }], checkpoint: "能在45分钟内完成一道Medium难度的综合算法题" }
    ]
  },

  // =====================================================
  // Node: cs-os - 操作系统原理
  // =====================================================
  {
    id: "cs-os",
    name: "操作系统原理",
    track: "cs",
    duration: "3周",
    prerequisites: ["cs-algo"],
    status: "locked",
    position: { x: 0, y: 220 },
    description: "理解操作系统如何管理硬件资源：进程线程、内存管理、文件系统、IO调度，为系统级编程和性能优化打下基础",
    outcomes: ["理解进程与线程的区别", "掌握内存管理基本原理", "理解文件系统与IO模型"],
    relatedIntel: ["009-linux"],
    relatedTools: [],
    relatedTerms: ["process", "thread", "memory", "filesystem", "io"],
    dailyTasks: [
      { day: 1, title: "操作系统概述与体系结构", content: ["操作系统是计算机硬件和应用软件之间的桥梁，管理CPU、内存、磁盘等资源，并为应用程序提供统一的抽象接口", "操作系统的核心功能：进程管理（程序运行）、内存管理（地址空间）、文件系统（持久存储）、设备管理（IO管理）", "Unix设计哲学：一切皆文件、单一目的的程序、程序间通过管道通信", "Linux内核架构：宏内核（Monolithic Kernel），但通过模块化设计获得灵活性"], duration: "1.5小时", resources: [{ title: "OS概念入门", url: "https://www.youtube.com/playlist?list=PLH2l6uzhWTmq_ATQodbmz7EOI7HcKtsq", required: true, type: "video", source: "youtube" }, { title: "操作系统导论", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/", required: false, type: "book", source: "other" }, { title: "Linux内核源码", url: "https://github.com/torvalds/linux", required: false, type: "repo", source: "github" }], checkpoint: "能解释操作系统的四大核心功能和Linux内核的基本架构" },
      { day: 2, title: "进程与进程管理", content: ["进程是程序执行的实例，每个进程有独立的PID、地址空间、寄存器上下文", "进程状态：新建（New）、就绪（Ready）、运行（Running）、阻塞（Blocked）、终止（Terminated）", "进程创建：fork()在Linux下创建子进程，fork返回值为0表示子进程，非0表示父进程（值是子进程PID）", "进程间通信（IPC）：管道、消息队列、共享内存、信号量、Socket，AI训练中的多进程数据加载就用到了这些机制"], duration: "2小时", resources: [{ title: "进程与线程可视化", url: "https://www.pdc.kth.se/~padu/visualizations/process.html", required: true, type: "tool", source: "official" }, { title: "Linux进程管理", url: "https://man7.org/linux/man-pages/man2/fork.2.html", required: false, type: "doc", source: "official" }, { title: "Linux进程源码分析", url: "https://github.com/MaJerle/linux-code", required: false, type: "repo", source: "github" }], checkpoint: "能解释fork()的工作原理和进程状态转换图" },
      { day: 3, title: "线程与并发基础", content: ["线程是进程内的执行单元，同一进程内的线程共享进程的地址空间和资源，但有独立的栈和寄存器", "线程的优势：创建销毁开销小、共享内存通信方便、充分利用多核CPU", "Python的GIL（全局解释器锁）限制了多线程的并行执行，但IO密集型任务仍能从多线程受益", "深度学习框架中的DataLoader使用多线程/多进程预加载数据，PyTorch用multiprocessing避免GIL影响"], duration: "1.5小时", resources: [{ title: "线程可视化", url: "https://www.pdc.kth.se/~padu/visualizations/thread.html", required: true, type: "tool", source: "official" }, { title: "Python GIL详解", url: "https://wiki.python.org/moin/GlobalInterpreterLock", required: false, type: "doc", source: "official" }, { title: "pthread示例", url: "https://github.com/MattPD/cpplinks", required: false, type: "repo", source: "github" }], checkpoint: "能解释线程与进程的区别，以及Python中多线程的适用场景" },
      { day: 4, title: "CPU调度算法", content: ["CPU调度发生在运行进程时间片用完或阻塞时，从就绪队列中选择下一个执行的进程", "调度指标：CPU利用率（越高越好）、吞吐量（单位时间完成进程数）、周转时间（从提交到完成）、等待时间、响应时间", "常见调度算法：FCFS（先来先服务）、SJF（最短作业优先）、RR（时间片轮转）、优先级调度", "在深度学习中，如果同时运行多个训练任务，了解调度算法能帮你选择合适的优先级和绑核策略"], duration: "2小时", resources: [{ title: "调度算法可视化", url: "https://www.pdc.kth.se/~padu/visualizations/scheduling.html", required: true, type: "tool", source: "official" }, { title: "Linux调度器", url: "https://www.kernel.org/doc/html/latest/scheduler/", required: false, type: "doc", source: "official" }], checkpoint: "能对比FCFS、SJF、RR三种调度算法的优缺点和适用场景" },
      { day: 5, title: "进程同步与通信", content: ["竞争条件（Race Condition）发生在多个进程/线程同时访问共享资源时，顺序不确定会导致结果不一致", "临界区（Critical Section）是访问共享资源的代码段，必须互斥访问", "同步机制：互斥锁（Mutex）、信号量（Semaphore）、条件变量（Condition Variable）", "死锁（Deadlock）发生的四个必要条件：互斥、占有并等待、非抢占、循环等待。避免死锁的方法是破坏任一条件"], duration: "2小时", resources: [{ title: "同步原语", url: "https://www.geeksforgeeks.org/process-synchronization/", required: true, type: "doc", source: "official" }, { title: "哲学家就餐问题", url: "https://en.wikipedia.org/wiki/Dining_philosophers_problem", required: false, type: "article", source: "other" },  { title: "POSIX线程同步", url: "https://github.com/angrave/SystemProgramming", required: false, type: "repo", source: "github" }], checkpoint: "能解释死锁的四个必要条件，并说明如何避免死锁" },
      { day: 6, title: "内存管理基础", content: ["程序的地址空间从逻辑地址到物理地址的转换由MMU（内存管理单元）完成，页表（Page Table）记录映射关系", "虚拟内存让程序可以使用比物理内存更大的地址空间，通过页面置换算法（LRU/Clock/FIFO）把不常用页面换出到磁盘", "分页（Paging）把内存分成固定大小的页，分段（Segmentation）按程序逻辑分成可变大小的段", "深度学习中的显存管理：PyTorch的cudaMalloc/cudaFree、显存池、梯度累积都与内存管理原理相通"], duration: "2小时", resources: [{ title: "虚拟内存可视化", url: "https://www.pdc.kth.se/~padu/visualizations/virtualmemory.html", required: true, type: "tool", source: "official" }, { title: "Linux内存管理", url: "https://www.kernel.org/doc/html/latest/vm/", required: false, type: "doc", source: "official" }, { title: "MMU模拟器", url: "https://github.com/dossanbek/Operating-Systems", required: false, type: "repo", source: "github" }], checkpoint: "能解释虚拟内存的工作原理和页表的作用" },
      { day: 7, title: "内存分配与垃圾回收", content: ["C语言的内存分配：malloc/free直接管理内存，需要程序员负责分配和释放，容易产生内存泄漏和野指针", "内存分配算法：首次适配（First Fit）、最佳适配（Best Fit）、最差适配（Worst Fit）、伙伴系统（Buddy System）", "高级语言通常有垃圾回收（GC）机制：引用计数（Reference Counting）、标记-清除（Mark-Sweep）、分代收集（Generational）", "Python的GC：引用计数为主，标记-清除和分代回收为辅，理解GC对写出高效Python代码很重要"], duration: "1.5小时", resources: [{ title: "内存分配算法", url: "https://en.wikipedia.org/wiki/Memory_allocation", required: true, type: "doc", source: "official" }, { title: "Python GC设计", url: "https://devguide.python.org/internals/garbage-collector/", required: false, type: "doc", source: "official" }, { title: "jemalloc分析", url: "https://github.com/jemalloc/jemalloc", required: false, type: "repo", source: "github" }], checkpoint: "能解释内存碎片化问题和伙伴系统的工作原理" },
      { day: 8, title: "文件系统", content: ["文件系统是操作系统对磁盘等存储设备的抽象，把字节流组织成层次化的文件和目录结构", "inode（索引节点）是Unix类文件系统的核心，每个文件对应一个inode，存储元数据（权限、大小、时间戳、块指针）", "目录是一种特殊文件，内容是文件名到inode编号的映射", "VFS（虚拟文件系统）是Linux的抽象层，让一种系统能支持多种具体文件系统（ext4、XFS、Btrfs等）"], duration: "1.5小时", resources: [{ title: "文件系统可视化", url: "https://www.pdc.kth.se/~padu/visualizations/filesystem.html", required: true, type: "tool", source: "official" }, { title: "Linux文件系统详解", url: "https://www.kernel.org/doc/html/latest/filesystems/", required: false, type: "doc", source: "official" }, { title: "ext4文件系统分析", url: "https://github.com/YYRise/linux-notes", required: false, type: "repo", source: "github" }], checkpoint: "能解释inode的工作原理和如何通过inode找到文件数据块" },
      { day: 9, title: "IO模型与网络IO", content: ["五种IO模型：阻塞IO（Blocking IO）、非阻塞IO（Non-blocking IO）、IO多路复用（Select/Poll/Epoll）、信号驱动IO（SIGIO）、异步IO（AIO）", "IO多路复用在高性能服务器中至关重要：Epoll让一个线程可以高效管理成千上万个并发连接，Redis/Nginx都依赖它", "在AI推理服务中，IO模型影响吞吐量：用Epoll实现的高并发推理服务器能同时处理大量请求", "MMAP（内存映射）是一种高效的IO方式，把文件直接映射到内存，避免read/write系统调用"], duration: "2小时", resources: [{ title: "IO模型详解", url: "https://www.geeksforgeeks.org/i-o-models/", required: true, type: "doc", source: "official" }, { title: "Epoll工作原理", url: "https://idea.popcount.org/2017-02-20-epoll-is-fundamentally-broken-12/", required: false, type: "article", source: "other" },  { title: "Libuv源码分析", url: "https://github.com/xingzhi362/Libuv-book", required: false, type: "repo", source: "github" }], checkpoint: "能对比阻塞IO和非阻塞IO的区别，解释Epoll的优势" },
      { day: 10, title: "综合实验：进程间通信与生产者消费者", content: ["本实验实现一个生产者-消费者问题：用信号量/互斥锁实现一个线程安全的队列", "生产者消费者模式在深度学习中广泛使用：DataLoader用专门的子进程加载数据，主进程执行训练", "实现要求：支持多个生产者并发添加任务、多个消费者并发取出任务、队列满时阻塞生产者、队列空时阻塞消费者", "用Python的threading和queue模块对比手写版本，理解底层同步机制"], duration: "3小时", resources: [{ title: "生产者消费者问题", url: "https://en.wikipedia.org/wiki/Producer%E2%80%93consumer_problem", required: true, type: "article", source: "official" }, { title: "PyTorch DataLoader", url: "https://pytorch.org/docs/stable/data.html", required: false, type: "doc", source: "official" },  { title: "IPC代码示例", url: "https://github.com/angrave/SystemProgramming", required: false, type: "repo", source: "github" }], checkpoint: "手写实现的生产者消费者能在多线程环境下正确工作，性能接近标准库" }
    ]
  },

  // =====================================================
  // Node: embedded-c - C语言与指针
  // =====================================================
  {
    id: "embedded-c",
    name: "C语言与指针",
    track: "embedded",
    duration: "3周",
    prerequisites: [],
    status: "available",
    position: { x: 0, y: 0 },
    description: "C语言是嵌入式开发的基石，指针是C语言的核心。深入理解指针、内存管理和底层操作，是开发嵌入式系统和性能优化代码的必备技能",
    outcomes: ["掌握C语言核心语法", "深入理解指针和内存管理", "能编写嵌入式级别的高效代码"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["c-language", "pointer", "memory", "embedded"],
    dailyTasks: [
      { day: 1, title: "C语言基础与开发环境", content: ["C语言是嵌入式开发的主流语言，特点是执行效率高、直接操作硬件、控制精确", "第一个C程序：#include <stdio.h>是预处理器指令，把标准输入输出库引入程序", "gcc编译器工作流程：预处理（展开宏）→编译（生成汇编）→汇编（生成目标文件）→链接（生成可执行文件）", "嵌入式开发常用IDE：Keil MDK（STM32）、IAR Embedded Workbench（MSP430）、VSCode + PlatformIO（通用）"], duration: "2小时", resources: [{ title: "C语言教程", url: "https://www.learn-c.org/", required: true, type: "doc", source: "official" }, { title: "GCC manual", url: "https://gcc.gnu.org/onlinedocs/", required: false, type: "doc", source: "official" },  { title: "C语言项目集", url: "https://github.com/Ewenwan/CS-APP", required: false, type: "repo", source: "github" }], checkpoint: "能在Linux下用gcc编译运行Hello World，理解编译四步骤" },
      { day: 2, title: "数据类型、变量与运算符", content: ["C语言的基本数据类型：int（整数）、float/double（浮点）、char（字符）。不同平台数据类型字节数可能不同，用sizeof验证", "变量存储类：auto（默认）、static（静态）、extern（外部）、register（寄存器，建议存寄存器但可能被忽略）", "位运算符在嵌入式中最常用：&（按位与）、|（按位或）、^（异或）、~（取反）、<<>>（左右移）", "嵌入式技巧：用位运算操作寄存器，如设置某几位而不影响其他位。GPIO配置就经常用到"], duration: "1.5小时", resources: [{ title: "C数据类型", url: "https://en.cppreference.com/w/c/language/type", required: true, type: "doc", source: "official" }, { title: "位运算详解", url: "https://www.geeksforgeeks.org/bitwise-operators-in-c-cpp/", required: false, type: "doc", source: "official" },  { title: "位操作工具库", url: "https://github.com/Ewenwan/bitwise", required: false, type: "repo", source: "github" }], checkpoint: "能用位运算实现GPIO的寄存器配置" },
      { day: 3, title: "控制流与函数", content: ["控制流：if/else、switch/case、while、for、do-while、break/continue/return", "函数是代码复用的基本单位。函数声明告诉编译器函数签名，函数定义是函数本体", "函数参数传递：都是值传递，指针作为参数时传递的是指针值（地址），但函数内可以通过指针修改指向的内容", "递归函数在嵌入式视觉处理中常用（如图像递归滤波），但要注意栈深度限制"], duration: "1.5小时", resources: [{ title: "C函数详解", url: "https://en.cppreference.com/w/c/language/functions", required: true, type: "doc", source: "official" }, { title: "递归与尾调用", url: "https://www.geeksforgeeks.org/recursion-in-c/", required: false, type: "doc", source: "official" },  { title: "C语言函数式编程", url: "https://github.com/Ewenwan/clang-tutorial", required: false, type: "repo", source: "github" }], checkpoint: "能写递归函数计算斐波那契数列，理解递归的栈帧开销" },
      { day: 4, title: "数组与指针基础", content: ["数组名在大多数情况下退化为指向数组首元素的指针，但数组和指针本质不同：数组分配连续内存，指针只是地址", "指针声明：int *p表示p是指向int的指针，指针大小在32位系统是4字节，64位是8字节", "指针算术：指针加减整数会根据指针类型调整步长，int指针加1地址加4字节，char指针加1地址加1字节", "数组下标和指针运算等价：arr[i] == *(arr+i)，但数组名是常量指针不能修改"], duration: "2小时", resources: [{ title: "C指针教程", url: "https://www.csecedu.net/cpointers.ppt", required: true, type: "doc", source: "official" }, { title: "指针与数组", url: "https://www.geeksforgeeks.org/difference-pointer-array-c/", required: false, type: "doc", source: "official" },  { title: "指针练习集", url: "https://github.com/Ewenwan/pointer-playground", required: false, type: "repo", source: "github" }], checkpoint: "能解释数组名和指针的区别，写出数组和指针相互转换的代码" },
      { day: 5, title: "字符串处理", content: ["C语言中字符串是以空字符'\\0'结尾的字符数组，字符串字面量存储在只读数据段", "字符串处理函数：strlen（求长度）、strcpy（复制）、strcat（连接）、strcmp（比较）", "字符串输入：scanf遇到空格停止，gets不安全（不检查边界），fgets更安全但会保留换行符", "嵌入式常用itoa/atof等函数进行字符串和数值的相互转换，需要包含stdlib.h"], duration: "1.5小时", resources: [{ title: "字符串函数", url: "https://en.cppreference.com/w/c/string/byte", required: true, type: "doc", source: "official" }, { title: "安全字符串处理", url: "https://wiki.sei.cmu.edu/confluence/display/c/STR07-C.+Use+validated+or+length+sanitized+string+buffers", required: false, type: "doc", source: "official" },  { title: "字符串工具库", url: "https://github.com/Ewenwan/string-utils", required: false, type: "repo", source: "github" }], checkpoint: "能实现一个不依赖标准库的字符串复制函数，理解缓冲区溢出的危险" },
      { day: 6, title: "结构体与内存对齐", content: ["结构体是把不同类型数据组织在一起的用户自定义类型，在嵌入式中外设寄存器、传感器数据都用结构体表示", "内存对齐：编译器按照最大成员长度对齐，导致结构体可能占用比实际内容更多的空间", "#pragma pack(1)可以强制1字节对齐，但可能损失性能；嵌入式寄存器映射常用__attribute__((packed))", "通过结构体指针访问寄存器：((volatile uint32_t *)0x40021018) = 0x04就是往地址0x40021018写入0x04"], duration: "2小时", resources: [{ title: "结构体与对齐", url: "https://www.geeksforgeeks.org/structure-member-alignment-padding/", required: true, type: "doc", source: "official" }, { title: "MMIO寄存器映射", url: "https://en.wikipedia.org/wiki/Memory-mapped_I/O", required: false, type: "doc", source: "official" },  { title: "嵌入式结构体设计", url: "https://github.com/Ewenwan/embedded-structs", required: false, type: "repo", source: "github" }], checkpoint: "能计算结构体的大小，理解内存对齐的原因和packed的作用" },
      { day: 7, title: "动态内存分配", content: ["堆（Heap）是动态分配内存的区域，malloc(size)分配指定字节数，free(ptr)释放内存", "内存分配函数：malloc（分配原始内存）、calloc（分配并清零）、realloc（调整大小）", "常见错误：内存泄漏（malloc后没free）、野指针（free后继续使用）、双重释放、越界访问", "嵌入式系统内存有限，动态分配要谨慎，尽量用静态分配或内存池代替频繁的malloc/free"], duration: "2小时", resources: [{ title: "动态内存", url: "https://en.cppreference.com/w/c/memory", required: true, type: "doc", source: "official" }, { title: "内存泄漏检测", url: "https://valgrind.org/", required: false, type: "tool", source: "official" },  { title: "内存池实现", url: "https://github.com/Ewenwan/memory-pool", required: false, type: "repo", source: "github" }], checkpoint: "能分析常见内存分配错误：内存泄漏、野指针、越界访问" },
      { day: 8, title: "指针的指针与函数指针", content: ["指针的指针（int **pp）常用于函数内修改传入的指针本身，如malloc后赋值给指针参数", "函数指针是指向函数的指针，可以把函数作为参数传递、存入数组、动态选择调用", "回调函数是嵌入式框架的核心模式：注册一个函数指针，当特定事件发生时调用，如中断回调", "表驱动编程：用函数指针数组替代大量if-else或switch-case，提高可扩展性"], duration: "2小时", resources: [{ title: "函数指针教程", url: "https://www.geeksforgeeks.org/function-pointers-in-c-cpp/", required: true, type: "doc", source: "official" }, { title: "回调函数模式", url: "https://en.wikipedia.org/wiki/Callback_(computer_programming)", required: false, type: "doc", source: "official" },  { title: "状态机设计", url: "https://github.com/Ewenwan/state-machine", required: false, type: "repo", source: "github" }], checkpoint: "能实现一个基于函数指针的简单事件驱动系统" },
      { day: 9, title: "预处理指令与条件编译", content: ["预处理指令在编译前处理：#define定义宏（对象宏和函数宏）、#include包含文件、#if/#ifdef条件编译", "防止头文件重复包含：#ifndef HEADER_H / #define HEADER_H / #endif，这是所有C头文件的标准写法", "条件编译用于：同一份代码支持多平台（Windows/Linux）、多配置（Debug/Release）、条件功能开关", "嵌入式常用：#define GPIO_PIN_SET READ_BIT(port->ODR, pin)这类内联宏提高代码可读性和性能"], duration: "1.5小时", resources: [{ title: "C预处理器", url: "https://en.cppreference.com/w/c/preprocessor", required: true, type: "doc", source: "official" }, { title: "宏技巧", url: "https://www.geeksforgeeks.org/cc-preprocessors/", required: false, type: "doc", source: "official" },  { title: "C语言黑魔法", url: "https://github.com/Ewenwan/c-macros", required: false, type: "repo", source: "github" }], checkpoint: "能写一个防止重复包含的头文件，并用条件编译实现多平台支持" },
      { day: 10, title: "Makefile与构建系统", content: ["Makefile是Unix下最经典的构建工具，通过目标、依赖和命令描述构建规则", "make的工作原理：根据文件时间戳判断哪些文件需要重新编译，只编译修改过的文件节省时间", "基础Makefile语法：target: dependencies / tab + commands。变量用$(VAR)引用", "嵌入式项目通常有复杂的Makefile或使用CMake、PlatformIO等构建系统，但理解底层Makefile是必须的"], duration: "2小时", resources: [{ title: "Makefile教程", url: "https://makefiletutorial.com/", required: true, type: "doc", source: "official" }, { title: "GNU Make", url: "https://www.gnu.org/software/make/manual/", required: false, type: "doc", source: "official" },  { title: "嵌入式Makefile模板", url: "https://github.com/Ewenwan/embedded-build", required: false, type: "repo", source: "github" }], checkpoint: "能写一个编译C项目的Makefile，支持清理和增量编译" },
      { day: 11, title: "模块化编程与头文件设计", content: ["模块化原则：把相关的函数、宏、结构体放在同一文件，通过头文件对外提供接口，隐藏实现细节", "头文件中放什么：函数声明、类型定义、宏定义、extern变量声明（不分配内存）", "头文件中不放什么：变量定义（非extern）、函数定义（会在链接时造成重复定义）", "嵌入式HAL（硬件抽象层）设计：用统一接口封装底层差异，如把所有GPIO操作抽象为HAL_GPIO_WritePin()"], duration: "1.5小时", resources: [{ title: "模块化编程", url: "https://www.geeksforgeeks.org/modular-programming-in-c/", required: true, type: "doc", source: "official" }, { title: "STM32 HAL设计", url: "https://www.st.com/resource/en/user_manual/dm00113874-description-of-stm32f4-hal-and-ll-drivers-stmicroelectronics.pdf", required: false, type: "doc", source: "official" },  { title: "嵌入式HAL示例", url: "https://github.com/Ewenwan/embedded-hal", required: false, type: "repo", source: "github" }], checkpoint: "能把一个单文件程序拆分成多个.c和.h文件，实现模块化" },
      { day: 12, title: "volatile与位操作在嵌入式中的应用", content: ["volatile关键字告诉编译器不要优化对该变量的访问，因为变量可能在任何时候被外部修改（如寄存器）", "嵌入式编程必用volatile：外设寄存器、中断标志、涉及多线程的共享变量", "常用位操作宏：BIT(n)定义某一位、SET_BIT(addr, n)置位、CLEAR_BIT(addr, n)清零、READ_BIT(addr, n)读取", "BSRR（Bit Set/Reset Register）是STM32 GPIO的特色，可以原子性地设置/清除多位而不需要读-修改-写"], duration: "2小时", resources: [{ title: "volatile关键字", url: "https://en.cppreference.com/w/c/language/volatile", required: true, type: "doc", source: "official" }, { title: "STM32位操作", url: "https://www.st.com/resource/en/datasheet/stm32f405rg.pdf", required: false, type: "doc", source: "official" },  { title: "寄存器访问封装", url: "https://github.com/Ewenwan/register-access", required: false, type: "repo", source: "github" }], checkpoint: "能解释volatile的作用，并用位操作宏封装GPIO操作" },
      { day: 13, title: "链接与符号表", content: ["编译过程：源文件→目标文件(.o)→可执行文件。链接器把多个目标文件合并，并解析符号引用", "符号表记录了目标文件中的函数名/变量名及其地址，全局变量和函数名是符号", "链接错误：undefined reference（找不到定义）、multiple definition（重复定义）", "静态库(.a)和动态库(.so/.dll)：静态库链接时打包到可执行文件，动态库运行时加载，嵌入式多用静态库"], duration: "1.5小时", resources: [{ title: "链接器文档", url: "https://www.agner.org/optimize/linking/", required: true, type: "doc", source: "official" }, { title: "nm查看符号表", url: "https://man7.org/linux/man-pages/nm.1.html", required: false, type: "doc", source: "official" },  { title: "链接器脚本示例", url: "https://github.com/Ewenwan/linker-scripts", required: false, type: "repo", source: "github" }], checkpoint: "能用nm命令查看目标文件中的符号，理解符号的可见性" },
      { day: 14, title: "综合实践：嵌入式LED驱动", content: ["综合实验：为一个假设的MCU编写GPIO驱动，理解从硬件寄存器到上层API的完整调用链", "实现内容：1）定义寄存器地址结构体 2）实现GPIO初始化函数 3）实现引脚配置和读写函数 4）用volatile保证寄存器访问正确 5）添加断言检查参数合法性", "通过这个项目理解C语言如何操控硬件：所有外设都是地址映射的内存，代码通过指针访问这些地址", "这个驱动模型与STM32 HAL、Linux GPIO子系统等真实系统的设计思想是一致的"], duration: "3小时", resources: [{ title: "嵌入式C最佳实践", url: "https://www.state-machine.com/", required: true, type: "doc", source: "official" }, { title: "MISRA C规范", url: "https://www.misra.org.uk/", required: false, type: "doc", source: "official" },  { title: "GPIO驱动模板", url: "https://github.com/Ewenwan/gpio-driver", required: false, type: "repo", source: "github" }], checkpoint: "能写出完整的GPIO驱动，具备模块化、volatile、错误检查三大要素" }
    ]
  },

  // =====================================================
  // Node: embedded-rtos - RTOS实时操作系统
  // =====================================================
  {
    id: "embedded-rtos",
    name: "RTOS实时操作系统",
    track: "embedded",
    duration: "3周",
    prerequisites: ["embedded-c"],
    status: "locked",
    position: { x: 0, y: 220 },
    description: "FreeRTOS是最流行的开源实时操作系统，学习任务调度、信号量、消息队列、内存管理等核心机制，理解实时系统的确定性要求",
    outcomes: ["掌握FreeRTOS核心API", "理解任务调度与优先级", "能用信号量和队列实现任务间通信"],
    relatedIntel: ["009-linux"],
    relatedTools: [],
    relatedTerms: ["rtos", "freertos", "task", "semaphore", "queue"],
    dailyTasks: [
      { day: 1, title: "实时操作系统概述", content: ["RTOS（实时操作系统）与通用OS（Windows/Linux）的核心区别：对响应时间的确定性保证", "硬实时系统（如汽车安全气囊）要求在确定时间内响应，否则后果严重；软实时系统（如视频播放）偶尔超时可接受", "FreeRTOS是市场份额最大的开源RTOS，代码简洁高效，被用于STM32、ESP32等数十亿设备", "FreeRTOS的特点：抢占式调度、最多255个优先级、可配置堆内存管理、任务数量不限"], duration: "1.5小时", resources: [{ title: "FreeRTOS官方文档", url: "https://www.freertos.org/", required: true, type: "doc", source: "official" }, { title: "RTOS vs GPOS", url: "https://www.freertos.org/FAQ.html", required: false, type: "doc", source: "official" },  { title: "FreeRTOS源码分析", url: "https://github.com/FreeRTOS/FreeRTOS", required: false, type: "repo", source: "github" }], checkpoint: "能解释硬实时和软实时的区别，理解FreeRTOS的设计目标" },
      { day: 2, title: "任务创建与调度", content: ["FreeRTOS中每个任务是一个无限循环函数，创建任务用xTaskCreate()或xTaskCreateStatic()", "任务状态：Running（运行中）、Ready（就绪，等待CPU）、Blocked（阻塞，等事件）、Suspended（挂起，不参与调度）", "调度算法：固定优先级抢占式调度，同优先级的任务用时间片轮转（Time Slicing）", "任务优先级0是最低，configMAX_PRIORITIES-1是最高，中断优先级高于所有任务"], duration: "2小时", resources: [{ title: "任务管理", url: "https://www.freertos.org/a00019.html", required: true, type: "doc", source: "official" }, { title: "任务状态机", url: "https://www.freertos.org/taskandcoroutinestate.html", required: false, type: "doc", source: "official" },  { title: "FreeRTOS任务示例", url: "https://github.com/FreeRTOS/FreeRTOS/tree/main/FreeRTOS/Demo", required: false, type: "repo", source: "github" }], checkpoint: "能创建两个优先级不同的任务，观察到高优先级任务始终先执行" },
      { day: 3, title: "任务间通信：队列", content: ["队列（Queue）是任务间通信的主要方式，支持FIFO读写，可在任务间和中断间传递数据", "xQueueSend()发送数据（可指定阻塞超时），xQueueReceive()接收数据，队列满/空时任务进入阻塞态", "队列可以传递任意类型数据，实际传递的是数据副本（按字节复制），传递大结构体时注意效率", "典型应用：中断把数据放入队列，上下文切换后任务从队列取数据处理，实现异步处理"], duration: "2小时", resources: [{ title: "队列API", url: "https://www.freertos.org/a00018.html", required: true, type: "doc", source: "official" }, { title: "队列示例", url: "https://www.freertos.org/Pend-on-multiple-rtos.html", required: false, type: "doc", source: "official" },  { title: "FreeRTOS队列源码", url: "https://github.com/FreeRTOS/FreeRTOS/tree/main/FreeRTOS/Source/queue.c", required: false, type: "repo", source: "github" }], checkpoint: "能实现一个生产者-消费者模型，用队列连接两个任务" },
      { day: 4, title: "信号量与互斥", content: ["二值信号量（Binary Semaphore）像一把钥匙：拿走就阻塞，等归还才继续，用于同步", "计数信号量（Counting Semaphore）可以计数资源数量，用于管理多个同类资源或事件计数", "互斥锁（Mutex）是带优先级继承的二值信号量，防止优先级反转问题（高优先级任务等低优先级任务释放锁）", "在AI数据预处理中，可以用信号量同步数据加载任务和计算任务"], duration: "2小时", resources: [{ title: "信号量API", url: "https://www.freertos.org/a00122.html", required: true, type: "doc", source: "official" }, { title: "互斥量API", url: "https://www.freertos.org/a9010.html", required: false, type: "doc", source: "official" },  { title: "FreeRTOS同步示例", url: "https://github.com/FreeRTOS/FreeRTOS/tree/main/FreeRTOS-Plus/Demo", required: false, type: "repo", source: "github" }], checkpoint: "能用信号量实现任务和中断的同步，用互斥锁保护共享资源" },
      { day: 5, title: "软件定时器", content: ["FreeRTOS软件定时器是由RTOS守护任务执行的回调函数，不在中断上下文", "定时器创建：xTimerCreate()，启动：xTimerStart()，停止：xTimerStop()，周期：xTimerChangePeriod()", "定时器回调函数要快进快出，不能在回调中调用阻塞API，优先级低于所有任务", "定时器可替代裸机编程中的delay循环，实现非阻塞延时，CPU可以处理其他任务"], duration: "1.5小时", resources: [{ title: "定时器API", url: "https://www.freertos.org/FreeRTOS-Software/Timer_API.html", required: true, type: "doc", source: "official" }, { title: "定时器示例", url: "https://www.freertos.org/FreeRTOS-Software/Timer.html", required: false, type: "doc", source: "official" },  { title: "定时器使用示例", url: "https://github.com/FreeRTOS/FreeRTOS/tree/main/FreeRTOS/Demo", required: false, type: "repo", source: "github" }], checkpoint: "能创建一个周期定时器，在回调中LED闪烁，观察定时器不受任务阻塞影响" },
      { day: 6, title: "中断与中断管理", content: ["FreeRTOS中断管理：中断服务程序（ISR）中只能调用带FromISR后缀的API，且要传递portYIELD_FROM_ISR()的返回值决定是否触发调度", "中断的优先级在Cortex-M中由NVIC管理，FreeRTOS configMAX_SYSCALL_INTERRUPT_PRIORITY以下的优先级可以调用FreeRTOS API", "最佳实践：ISR要快，尽快把数据交给任务处理（如放入队列），复杂逻辑在任务级执行", "在嵌入式传感器采集中，ISR负责快速读取数据并通过队列发送给处理任务"], duration: "2小时", resources: [{ title: "中断API", url: "https://www.freertos.org/a00016.html", required: true, type: "doc", source: "official" }, { title: "中断嵌套", url: "https://www.freertos.org/a00104.html", required: false, type: "doc", source: "official" },  { title: "中断处理示例", url: "https://github.com/FreeRTOS/FreeRTOS/tree/main/FreeRTOS/Source/portable", required: false, type: "repo", source: "github" }], checkpoint: "能在STM32上实现一个外部中断，用队列传递中断事件到任务处理" },
      { day: 7, title: "内存管理", content: ["FreeRTOS提供5种堆内存分配方案：heap_1到heap_5，从简单到复杂，支持/不支持释放内存", "heap_1是最简单的分配器，只能分配不能释放，适合创建后不删除的任务", "heap_4使用首次适应算法，支持内存释放，有碎片整理机制，嵌入式最常用", "嵌入式内存有限，malloc/free要慎用，优先使用静态分配或FreeRTOS的内存池API"], duration: "1.5小时", resources: [{ title: "内存管理", url: "https://www.freertos.org/a00111.html", required: true, type: "doc", source: "official" }, { title: "堆配置", url: "https://www.freertos.org/a00110.html", required: false, type: "doc", source: "official" },  { title: "heap源码分析", url: "https://github.com/FreeRTOS/FreeRTOS/tree/main/FreeRTOS/Source/portable/MemMang", required: false, type: "repo", source: "github" }], checkpoint: "能解释五种堆分配策略的区别，选择合适的方案用于项目" },
      { day: 8, title: "任务通知", content: ["任务通知（Task Notification）是FreeRTOS 8.0后提供的轻量级同步机制，比信号量更快更省内存", "每个任务有一个通知值（uint32_t）和通知状态，可以直接通知其他任务或中断", "任务通知可用于：事件标志（直接通知替代二值信号量）、信号量替代、消息邮箱（32位数据）、资源计数", "但任务通知只能单向通知一任务，不适合多消费者场景，此时仍需用队列或信号量"], duration: "1.5小时", resources: [{ title: "任务通知API", url: "https://www.freertos.org/xTaskNotify.html", required: true, type: "doc", source: "official" }, { title: "任务通知使用", url: "https://www.freertos.org/Task_Notifications_Index.html", required: false, type: "doc", source: "official" },  { title: "FreeRTOS高级特性", url: "https://github.com/FreeRTOS/FreeRTOS/tree/main/FreeRTOS-Plus", required: false, type: "repo", source: "github" }], checkpoint: "能用任务通知替代二值信号量，并理解其性能优势" },
      { day: 9, title: "事件组", content: ["事件组（Event Group）是一组事件标志位，每个位代表一个事件，可以组合测试", "xEventGroupSetBits()设置位，xEventGroupWaitBits()等待位组合（与/或逻辑），支持超时", "事件组的典型应用：等待多个传感器数据就绪后进行融合计算", "事件组在32位系统中最多32个事件，ESP32的WiFi/Bluetooth事件就用事件组管理"], duration: "1.5小时", resources: [{ title: "事件组API", url: "https://www.freertos.org/a00125.html", required: true, type: "doc", source: "official" }, { title: "事件组示例", url: "https://www.freertos.org/event_groups.html", required: false, type: "doc", source: "official" },  { title: "FreeRTOS事件组源码", url: "https://github.com/FreeRTOS/FreeRTOS/tree/main/FreeRTOS/Source/event_groups.c", required: false, type: "repo", source: "github" }], checkpoint: "能实现一个等待多个事件都到达后执行的处理逻辑" },
      { day: 10, title: "综合实践：传感器采集系统", content: ["综合项目：实现一个多传感器数据采集系统，包含以下任务：温湿度传感器读取（GPIO/I2C）、数据处理任务、显示任务、告警任务", "架构设计：用队列连接传感器任务和处理任务，用信号量同步处理和显示，用互斥锁保护LCD写入", "中断处理：传感器数据准备好后产生外部中断，ISR快速读取放入队列", "验证系统的实时性：测量从传感器数据就绪到告警触发的延迟，确保满足实时要求"], duration: "3小时", resources: [{ title: "FreeRTOS示例代码", url: "https://www.freertos.org/FreeRTOS-quick-start-guide.html", required: true, type: "doc", source: "official" }, { title: "综合示例", url: "https://www.freertos.org/demoapps.html", required: false, type: "doc", source: "official" },  { title: "FreeRTOS项目模板", url: "https://github.com/FreeRTOS/FreeRTOS/tree/main/FreeRTOS/Demo/CORTEX_STM32F103_Keil", required: false, type: "repo", source: "github" }], checkpoint: "完整的多任务系统能在不同优先级下正确工作，数据不丢失，实时性满足设计要求" }
    ]
  },

  // =====================================================
  // Node: elec-circuit - 电路基础与模拟电子技术
  // =====================================================
  {
    id: "elec-circuit",
    name: "电路基础与模拟电子",
    track: "electronics",
    duration: "3周",
    prerequisites: [],
    status: "available",
    position: { x: 0, y: 0 },
    description: "从电路基本定律到模拟电子技术核心器件，掌握看懂原理图、设计电路、分析信号的能力",
    outcomes: ["理解电路基本定律", "掌握常用电子器件特性", "能看懂和设计基础电路"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["circuit", "analog", "op-amp", "transistor"],
    dailyTasks: [
      { day: 1, title: "电路基本定律", content: ["电路由电源、负载、导线和开关组成，形成电流流通的完整路径", "欧姆定律（V=IR）是电路分析的基础，描述了电压、电流和电阻之间的关系", "基尔霍夫电流定律（KCL）：节点电流代数和为零。基尔霍夫电压定律（KVL）：回路电压代数和为零", "串联电阻分压、并联电阻分流，这是电路分析的基本技巧"], duration: "2小时", resources: [{ title: "电路基础教程", url: "https://www.allaboutcircuits.com/textbook/", required: true, type: "doc", source: "official" }, { title: "欧姆定律交互式学习", url: "https://phet.colorado.edu/sims/ohms-law/ohms-law_zh_CN.html", required: false, type: "tool", source: "official" }, { title: "电路分析基础", url: "https://github.com/wohuifeng123/CircuitAnalysis", required: false, type: "repo", source: "github" }], checkpoint: "能用KCL和KVL分析简单电路，计算各支路电流和节点电压" },
      { day: 2, title: "电路分析方法", content: ["支路电流法：以各支路电流为未知数，列写KCL和KVL方程求解", "节点电压法：以节点电位为未知数，只列写KCL方程，在计算机电路仿真中常用", "叠加定理：线性电路中，任一支路电流/电压等于各独立源单独作用时的代数和", "戴维南定理：任何线性有源二端网络可用一个电压源串联内阻等效，简化复杂电路分析"], duration: "2小时", resources: [{ title: "电路分析方法", url: "https://www.allaboutcircuits.com/textbook/direct-current/", required: true, type: "doc", source: "official" }, { title: "LTspice电路仿真", url: "https://www.analog.com/en/design-center/design-tools-and-calculators/ltspice-simulator.html", required: false, type: "tool", source: "official" }, { title: "LTspice仿真教程", url: "https://github.com/analogdevicesinc/ADSimSPICE", required: false, type: "repo", source: "github" }], checkpoint: "能用节点电压法分析含有电压源和电流源的电路" },
      { day: 3, title: "动态电路与暂态分析", content: ["电容和电感是储能元件，电容电压不能突变，电感电流不能突变", "RC电路的时间常数τ=RC，决定了充放电速度；RL电路的时间常数τ=L/R", "一阶电路的零输入响应、零状态响应、全响应分析", "在AI硬件中，滤波电路、电源去耦电路都涉及暂态分析"], duration: "2小时", resources: [{ title: "动态电路分析", url: "https://www.allaboutcircuits.com/textbook/direct-current/chpt-16/rc-and-lr-time-constants/", required: true, type: "doc", source: "official" }, { title: "一阶电路仿真", url: "https://www.falstad.com/circuit/", required: false, type: "tool", source: "official" }, { title: "电路暂态分析仿真合集", url: "https://github.com/JuliaElectronics/CircuitSimulation.jl", required: false, type: "repo", source: "github" }], checkpoint: "能计算RC电路的充放电时间和任意时刻的电压电流值" },
      { day: 4, title: "正弦稳态交流电路", content: ["正弦交流电的三要素：幅值、角频率、初相位。有效值为幅值的1/√2", "相量法：用复数表示正弦量，将微分方程变为代数方程，简化交流电路分析", "阻抗Z=R+jX：电阻和电抗的组合。容抗Xc=-1/ωC，感抗XL=ωL", "功率：有功功率P、无功功率Q、视在功率S，功率因数cosφ=P/S"], duration: "2小时", resources: [{ title: "交流电路分析", url: "https://www.allaboutcircuits.com/textbook/alternating-current/", required: true, type: "doc", source: "official" }, { title: "相量计算器", url: "https://www.electronics2000.co.uk/calc/power-triangle.shtml", required: false, type: "tool", source: "official" }, { title: "AC电路仿真工具", url: "https://github.com/CircuitJS1/CircuitJS1", required: false, type: "repo", source: "github" }], checkpoint: "能用相量法分析RLC串联电路，计算阻抗和功率" },
      { day: 5, title: "运算放大器基础", content: ["运算放大器（Op-Amp）是模拟电路核心器件，具有高输入阻抗、低输出阻抗、高增益的特性", "虚短（两输入端电位近似相等）和虚断（输入端电流近似为零）是分析运放电路的关键", "基本应用：反相放大器、同相放大器、电压跟随器、加法器、积分器、微分器", "在AI传感器信号调理中，运放用于信号放大、滤波、电平移位"], duration: "2.5小时", resources: [{ title: "运放基础", url: "https://www.allaboutcircuits.com/textbook/analog-integrated-circuits/chpt-8/operational-amplifiers/", required: true, type: "doc", source: "official" }, { title: "运放仿真工具", url: "https://www.ecircuitcenter.com/Spreadsheets/OpAmp%20Basics/OpAmp%20Basics.htm", required: false, type: "tool", source: "official" }, { title: "运放电路设计参考", url: "https://github.com/tinyusb/tinyusb", required: false, type: "repo", source: "github" }], checkpoint: "能设计一个同相放大器，确定增益和反馈电阻" },
      { day: 6, title: "二极管与整流电路", content: ["二极管具有单向导电性，正向偏置时导通，反向偏置时截止", "二极管的伏安特性：开启电压（硅约0.7V，锗约0.3V）、反向饱和漏电流、击穿特性", "整流电路：将交流电转为直流电。半波整流、全波整流、桥式整流", "滤波电路：电容滤波、LC滤波、π型滤波，减小输出电压的纹波"], duration: "2小时", resources: [{ title: "二极管教程", url: "https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/diodes/", required: true, type: "doc", source: "official" }, { title: "整流电路仿真", url: "https://www.falstad.com/circuit/e-fullwave rectifier.html", required: false, type: "tool", source: "official" }, { title: "整流滤波电路仿真", url: "https://github.com/M欺thieuBln/electronics-projects", required: false, type: "repo", source: "github" }], checkpoint: "能设计一个桥式整流加电容滤波的直流电源" },
      { day: 7, title: "晶体管与放大电路", content: ["晶体管（BJT）是一种电流控制电流的器件，有NPN和PNP两种类型", "晶体管工作在截止区（关）、放大区（线性放大）、饱和区（开）三个区域", "共发射极放大电路是最基本的放大电路，需要设置合适的静态工作点", "在AI芯片中，模拟前端电路使用BJT或FET进行小信号放大"], duration: "2.5小时", resources: [{ title: "BJT放大器", url: "https://www.allaboutcircuits.com/textbook/semiconductors/chpt-4/bipolar-junction-transistors/", required: true, type: "doc", source: "official" }, { title: "晶体管特性曲线", url: "https://www.electronics2000.co.uk/calc/transistor.shtml", required: false, type: "tool", source: "official" }, { title: "BJT放大电路仿真集合", url: "https://github.com/pLawrence/BJTCircuitSimulator", required: false, type: "repo", source: "github" }], checkpoint: "能分析共发射极放大电路的直流工作点和交流增益" },
      { day: 8, title: "场效应管基础", content: ["场效应管（FET）是电压控制电流的器件，分为结型（JFET）和绝缘栅型（MOSFET）", "MOSFET是数字集成电路和功率电子的基础，NMOS和PMOS互补构成CMOS电路", "MOSFET的三个工作区：截止区、亚阈值区、强反型区（线性区和饱和区）", "在AI硬件加速器中，SRAM单元和数字逻辑门都由MOSFET构成"], duration: "2小时", resources: [{ title: "MOSFET教程", url: "https://www.allaboutcircuits.com/textbook/semiconductors/chpt-7/mosfets/", required: true, type: "doc", source: "official" }, { title: "MOSFET仿真", url: "https://www.falstad.com/circuit/mosfet.html", required: false, type: "tool", source: "official" }, { title: "MOSFET器件模型", url: "https://github.com/LondonReggaeToby/MOSFET-Spectre-Model", required: false, type: "repo", source: "github" }], checkpoint: "能解释NMOS和PMOS的区别，理解CMOS反相器的工作原理" },
      { day: 9, title: "反馈电路与振荡器", content: ["反馈：将输出的一部分送回输入端。负反馈可以稳定增益、扩展带宽、改善线性度", "四种基本负反馈组态：电压串联、电压并联、电流串联、电流并联", "振荡器：正反馈使电路在没有输入时产生自激振荡，如RC振荡器、LC振荡器、石英晶体振荡器", "在AI系统中，高精度时钟源使用晶体振荡器提供稳定的参考频率"], duration: "2小时", resources: [{ title: "反馈电路分析", url: "https://www.allaboutcircuits.com/textbook/analog-integrated-circuits/chpt-9/introduction-to-feedback/", required: true, type: "doc", source: "official" }, { title: "振荡器电路", url: "https://www.falstad.com/circuit/oscillator.html", required: false, type: "tool", source: "official" }, { title: "振荡器电路集合", url: "https://github.com/Rahman-24/electronics-oscillators", required: false, type: "repo", source: "github" }], checkpoint: "能分析负反馈对放大器增益和带宽的影响" },
      { day: 10, title: "直流稳压电源设计", content: ["直流稳压电源是所有电子系统的基础，包括变压器、整流、滤波、稳压四部分", "线性稳压器（如7805、LM317）输出稳定但效率较低，散热量大", "开关稳压器（Buck/Boost）效率高但纹波较大，在AI服务器电源中广泛使用", "LDO（低压差稳压器）适合对噪声敏感的模拟电路，如传感器前置放大器供电"], duration: "2.5小时", resources: [{ title: "稳压电源设计", url: "https://www.allaboutcircuits.com/textbook/power-supply-regulation/", required: true, type: "doc", source: "official" }, { title: "电源设计工具", url: "https://www.ti.com/design-resources/design-tools-simulation.html", required: false, type: "tool", source: "official" }, { title: "开关电源设计参考", url: "https://github.com/aengusmart/AC-DC-Converter", required: false, type: "repo", source: "github" }], checkpoint: "能设计一个5V稳压电源，包括整流、滤波、稳压各级" }
    ]
  },

  // =====================================================
  // Node: elec-signals - 信号与系统
  // =====================================================
  {
    id: "elec-signals",
    name: "信号与系统",
    track: "electronics",
    duration: "3周",
    prerequisites: ["elec-circuit"],
    status: "locked",
    position: { x: 0, y: 220 },
    description: "掌握信号分析与系统响应的核心概念，理解傅里叶变换、拉普拉斯变换在信号处理中的应用",
    outcomes: ["理解信号分类与性质", "掌握傅里叶分析方法", "理解系统频率响应特性"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["signal", "fourier", "laplace", "filter"],
    dailyTasks: [
      { day: 1, title: "信号与系统概述", content: ["信号是信息的载体，分为连续信号和离散信号、周期信号和非周期信号、确定信号和随机信号", "系统是对信号进行加工、变换的实体，可以是连续系统或离散系统、线性系统或非线性系统", "线性时不变系统（LTI系统）是最重要的一类系统，满足叠加性和时不变性", "在AI音频处理中，语音信号是连续信号，经过采样变成离散信号再处理"], duration: "1.5小时", resources: [{ title: "信号与系统教程", url: "https://www.ni.com/zh-cn/innovations/white-papers/13/digital-signal-processing-fundamentals.html", required: true, type: "doc", source: "official" }, { title: "MATLAB DSP工具箱", url: "https://www.mathworks.com/products/dsp-system.html", required: false, type: "tool", source: "official" }, { title: "信号处理Python库", url: "https://github.com/scipy/scipy", required: false, type: "repo", source: "github" }], checkpoint: "能判断信号的类型（连续/离散、周期/非周期、确定/随机）" },
      { day: 2, title: "傅里叶级数", content: ["任何周期信号都可以分解为一系列正弦和余弦信号的叠加，这就是傅里叶级数", "周期信号的基波频率是信号周期的倒数，其他分量是基波的整数倍（谐波）", "方波包含无限多的奇次谐波，谐波幅度按1/n递减", "在AI的语音合成中，傅里叶级数用于分析乐音的谐波结构"], duration: "2小时", resources: [{ title: "傅里叶级数详解", url: "https://betterexplained.com/articles/an-interactive-guide-to-the-fourier-transform/", required: true, type: "doc", source: "official" }, { title: "傅里叶级数可视化", url: "https://www.shadertoy.com/view/4ddfDr", required: false, type: "tool", source: "official" }, { title: "傅里叶分析工具包", url: "https://github.com/librosa/librosa", required: false, type: "repo", source: "github" }], checkpoint: "能把一个方波信号分解为前5次谐波之和，并验证近似效果" },
      { day: 3, title: "傅里叶变换", content: ["非周期信号不能用傅里叶级数，用傅里叶变换将时域信号转换为频域表示", "傅里叶变换建立了时域和频域之间的对应关系，是信号处理的核心工具", "幅度频谱表示信号中各频率分量的幅度，相位频谱表示各分量的相位", "FFT（快速傅里叶变换）是计算傅里叶变换的高效算法，复杂度从O(n²)降到O(n log n)"], duration: "2小时", resources: [{ title: "傅里叶变换教程", url: "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-13/introduction-to-fourier-series/", required: true, type: "doc", source: "official" }, { title: "FFT可视化工具", url: "https://www.photonscore.com/fft/", required: false, type: "tool", source: "official" }], checkpoint: "能用FFT分析一个音频信号的频谱，识别主要频率成分" },
      { day: 4, title: "拉普拉斯变换", content: ["拉普拉斯变换是傅里叶变换的推广，适用于右边信号，能简化微分方程求解", "拉普拉斯变换把微分方程变为代数方程，是分析线性时不变系统的有力工具", "系统函数H(s)是输出拉普拉斯变换与输入拉普拉斯变换之比，包含了系统的全部特性", "在AI控制系统中，拉普拉斯变换用于分析系统的稳定性和动态响应"], duration: "2小时", resources: [{ title: "拉普拉斯变换教程", url: "https://www.control-systems-principles.co.uk/understandIng-laplace/understanding-laplace.pdf", required: true, type: "doc", source: "official" }, { title: "s域分析工具", url: "https://www.mathworks.com/help/symbolic/laplace.html", required: false, type: "tool", source: "official" }, { title: "符号计算库", url: "https://github.com/sympy/sympy", required: false, type: "repo", source: "github" }], checkpoint: "能用拉普拉斯变换求解一阶和二阶系统的微分方程" },
      { day: 5, title: "采样与重构", content: ["采样：用采样脉冲从连续信号中抽取一系列瞬时值，采样频率必须满足奈奎斯特准则（≥2倍信号最高频率）", "奈奎斯特频率：采样频率的一半，是能无失真恢复信号的最高频率", "量化：将采样值用有限的二进制位数表示，A/D转换器的位数越多，量化误差越小", "在AI语音识别中，麦克风采集的模拟语音信号需要经过采样和量化才能被数字系统处理"], duration: "2小时", resources: [{ title: "采样定理", url: "https://www.allaboutcircuits.com/textbook/digital-semiconductors/chpt-11/data-conversion-and-sampling/", required: true, type: "doc", source: "official" }, { title: "采样仿真", url: "https://www.falstad.com/circuit/digitalSampler.html", required: false, type: "tool", source: "official" }, { title: "音频采样处理项目", url: "https://github.com/miloyip/sampling", required: false, type: "repo", source: "github" }], checkpoint: "能解释混叠现象，理解为什么采样频率必须大于信号最高频率的两倍" },
      { day: 6, title: "滤波器基础", content: ["滤波器是让特定频率信号通过、抑制其他频率信号的系统", "四种基本滤波器：低通（LPF）、高通（HPF）、带通（BPF）、带阻（BSF）", "滤波器的阶数越高，过渡带越陡峭，频率选择性越好", "在AI降噪应用中，用低通滤波器去除高频噪声，保留语音的主要频率成分"], duration: "2小时", resources: [{ title: "滤波器设计", url: "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-8/filters/", required: true, type: "doc", source: "official" }, { title: "滤波器计算器", url: "https://www.analog.com/design-tools/en/filterwizard/", required: false, type: "tool", source: "official" }, { title: "滤波器设计工具包", url: "https://github.com/scipy/scipy.signal", required: false, type: "repo", source: "github" }], checkpoint: "能设计一个一阶RC低通滤波器，确定截止频率" },
      { day: 7, title: "连续时间系统分析", content: ["系统函数H(jω)是频率响应，表示系统对不同频率输入信号的增益和相移", "幅频特性表示增益随频率变化，相频特性表示相位滞后随频率变化", "一阶系统的阶跃响应：上升时间与时间常数τ成反比，τ=1/ωc", "在AI自适应滤波中，系统函数决定了滤波器的频率选择特性"], duration: "1.5小时", resources: [{ title: "系统频率响应", url: "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-8/frequency-response/", required: true, type: "doc", source: "official" }, { title: "系统仿真工具", url: "https://www.mathworks.com/help/signal/understanding-gaussian-pulse.html", required: false, type: "tool", source: "official" }, { title: "系统响应分析库", url: "https://github.com/python-control/python-control", required: false, type: "repo", source: "github" }], checkpoint: "能绘制一阶低通系统的伯德图（幅频和相频曲线）" },
      { day: 8, title: "离散时间信号与Z变换", content: ["Z变换是离散时间信号的拉普拉斯变换，是分析离散系统的有力工具", "z=e^(sT)建立了s平面和z平面的映射关系，s平面的左半部分映射到z平面的单位圆内", "系统函数H(z)的极点决定了系统的固有频率和稳定性，极点在单位圆内系统稳定", "在AI数字信号处理中，Z变换用于设计数字滤波器和分析离散系统"], duration: "2小时", resources: [{ title: "Z变换教程", url: "https://www.dsprelated.com/associate/realization.php", required: true, type: "doc", source: "official" }, { title: "Z域分析工具", url: "https://www.mathworks.com/help/symbolic/z-transform.html", required: false, type: "tool", source: "official" }, { title: "数字滤波器设计库", url: "https://github.com/UCBerkeley-EECS/c电气filter", required: false, type: "repo", source: "github" }], checkpoint: "能根据系统函数判断系统的稳定性" },
      { day: 9, title: "离散傅里叶变换与快速算法", content: ["离散傅里叶变换（DFT）是有限长度序列的傅里叶表示，是数字信号处理的核心算法", "FFT算法利用蝶形运算单元高效计算DFT，是信号处理算法的优化基础", "分圆FFT（Radix-2 FFT）要求序列长度为2的整数次幂，否则需要补零或使用其他算法", "在AI的语音识别中，FFT用于计算梅尔频谱（Mel Spectrogram）作为特征输入"], duration: "2.5小时", resources: [{ title: "FFT算法详解", url: "https://www.ni.com/zh-cn/innovations/white-papers/13/fast-fourier-transform.html", required: true, type: "doc", source: "official" }, { title: "FFT在线工具", url: "https://www.photonscore.com/fft/", required: false, type: "tool", source: "official" }, { title: "高效FFT实现", url: "https://github.com/closes/FFTPy", required: false, type: "repo", source: "github" }], checkpoint: "能用FFT算法计算一个离散序列的频谱" },
      { day: 10, title: "综合应用：语音信号频谱分析", content: ["综合项目：实现一个语音信号的频谱分析系统，包括预加重、分帧、加窗、FFT、功率谱计算", "用MATLAB或Python的scipy和numpy实现完整的信号处理流程", "可视化频谱图（Spectrogram），观察语音的时频特性", "这个项目综合了采样、滤波、FFT等核心概念，为后续语音识别打下基础"], duration: "3小时", resources: [{ title: "语音信号处理", url: "https://www.mathworks.com/help/audio/ug/speech-frequency-band-analysis.html", required: true, type: "doc", source: "official" }, { title: "Python音频处理", url: "https://librosa.org/doc/latest/tutorial.html", required: false, type: "tool", source: "official" }], checkpoint: "能提取并可视化一段语音的频谱图，理解时频分析的意义" }
    ]
  },

  // =====================================================
  // Node: signals-comm - 通信原理
  // =====================================================
  {
    id: "signals-comm",
    name: "通信原理",
    track: "signals",
    duration: "3周",
    prerequisites: ["elec-signals"],
    status: "locked",
    position: { x: 0, y: 0 },
    description: "理解通信系统的基本组成和调制解调原理，掌握数字通信中的编解码技术",
    outcomes: ["理解通信系统基本模型", "掌握调制解调原理", "理解信道编码技术"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["modulation", "demodulation", "coding", "channel"],
    dailyTasks: [
      { day: 1, title: "通信系统基本模型", content: ["通信系统由信源、发送设备、信道、接收设备、信宿组成", "模拟通信和数字通信的区别：模拟信号连续取值，数字信号离散取值", "数字通信的优势：抗干扰能力强、易于加密、便于信号处理和存储、可利用纠错编码提高可靠性", "在AI物联网应用中，无线传感器节点采集数据后通过数字通信发送到云端服务器"], duration: "1.5小时", resources: [{ title: "通信原理教材", url: "https://www.g很低.com/comm/", required: false, type: "book", source: "other" }, { title: "MATLAB通信工具箱", url: "https://www.mathworks.com/products/communications.html", required: false, type: "tool", source: "official" }, { title: "通信系统仿真项目", url: "https://github.com/R欺bySandbox/CommunicationSystems", required: false, type: "repo", source: "github" }], checkpoint: "能画出数字通信系统的完整框图，说明各部分作用" },
      { day: 2, title: "调制与解调", content: ["调制：用载波（高频正弦波）的参数承载基带信号信息", "幅度调制（AM）：载波幅度随基带信号变化，如AM收音机广播", "频率调制（FM）：载波频率随基带信号变化，如FM收音机广播，抗噪声性能优于AM", "相位调制（PM）：载波相位随基带信号变化，FM是PM的特例"], duration: "2小时", resources: [{ title: "调制原理", url: "https://www.allaboutcircuits.com/textbook/radio-frequency-modulation/", required: true, type: "doc", source: "official" }, { title: "调制仿真", url: "https://www.falstad.com/circuit/amplitude-modulation.html", required: false, type: "tool", source: "official" },  { title: "调制解调仿真库", url: "https://github.com/veeresht/CommPy", required: false, type: "repo", source: "github" }], checkpoint: "能解释AM和FM的调制原理，并分析其频谱特点" },
      { day: 3, title: "数字调制技术", content: ["数字调制：用数字信号控制载波参数，分为ASK（幅移键控）、FSK（频移键控）、PSK（相移键控）", "BPSK（二进制相移键控）用0°和180°表示两种比特，抗噪声最强但频谱效率低", "QPSK（正交相移键控）利用载波的同相和正交分量同时传输2比特，频谱效率是BPSK的2倍", "在WiFi和4G/5G移动通信中，QPSK、16QAM、64QAM等高阶调制被广泛使用"], duration: "2小时", resources: [{ title: "数字调制教程", url: "https://www.keysight.com/cn/zh/application-notes/n年前-5992-0383.html", required: true, type: "doc", source: "official" }, { title: "通信系统仿真", url: "https://www.mathworks.com/help/comm/ref/qpskmodulator.html", required: false, type: "tool", source: "official" }], checkpoint: "能对比BPSK、QPSK、16QAM的星座图和频谱效率" },
      { day: 4, title: "信源编码", content: ["信源编码的任务是压缩数据，去除冗余信息，提高传输效率", "无损压缩：霍夫曼编码、香农-范诺编码，压缩后可以完全恢复原始数据", "有损压缩：JPEG（图像）、MP3（音频）、H.264/H.265（视频），利用人眼/人耳的感知特性", "在AI大模型的Tokenizer中，子词编码（如BPE、WordPiece）也是一种信源编码思想"], duration: "2小时", resources: [{ title: "信源编码原理", url: "https://www.compression.cc/", required: true, type: "doc", source: "official" }, { title: "霍夫曼编码可视化", url: "https://people.eng.unimelb.edu.au/jbailey/comms/ huffman.html", required: false, type: "tool", source: "official" },  { title: "压缩算法实现", url: "https://github.com/thejoshwolfe/huffman-compression", required: false, type: "repo", source: "github" }], checkpoint: "能实现霍夫曼编码，理解前缀码的概念" },
      { day: 5, title: "信道编码", content: ["信道编码通过添加冗余来实现差错控制，代价是降低了传输效率", "汉明码是最基本的线性分组码，能纠正1位错误，编码效率为4/7", "卷积码利用当前比特与前后若干比特的约束关系进行编码，译码用Viterbi算法", "在AI自动驾驶的无线通信中，信道编码确保控制指令的可靠传输"], duration: "2小时", resources: [{ title: "信道编码教程", url: "https://www.researchgate.net/publication/296的", required: false, type: "doc", source: "other" }, { title: "信道编码仿真", url: "https://www.mathworks.com/help/comm/ref/convolutionalencoder.html", required: false, type: "tool", source: "official" },  { title: "LDPC码实现", url: "https://github.com/NikolaCkar/通信仿真", required: false, type: "repo", source: "github" }], checkpoint: "能解释汉明码的编码和译码原理" },
      { day: 6, title: "OFDM正交频分复用", content: ["OFDM将宽带信道分成多个正交的窄带子载波，每个子载波传输低速数据", "正交性：子载波间频谱重叠但互不干扰，频谱利用率高", "循环前缀（CP）对抗多径衰落：在每个OFDM符号前插入保护间隔", "WiFi（802.11a/g/n/ac）、4G LTE、5G NR都使用OFDM作为下行传输方案"], duration: "2.5小时", resources: [{ title: "OFDM原理", url: "https://www.keysight.com/cn/zh/application-notes/5991-的工作0.html", required: true, type: "doc", source: "official" }, { title: "OFDM仿真", url: "https://www.mathworks.com/help/comm/ref/ofdmmodulator.html", required: false, type: "tool", source: "official" },  { title: "OFDM系统实现", url: "https://github.com/veeresht/CommPy", required: false, type: "repo", source: "github" }], checkpoint: "能解释OFDM的正交性和循环前缀的作用" },
      { day: 7, title: "多址接入技术", content: ["多址接入：让多个用户共享同一信道，TDMA（时分）、FDMA（频分）、CDMA（码分）", "LTE使用OFDMA（正交频分多址）作为下行多址方案，SC-FDMA作为上行", "5G NR支持更灵活的 Numerology（子载波间隔和符号长度的配置），适应不同场景需求", "在AI边缘计算场景中，多址接入技术决定如何高效调度大量终端设备"], duration: "2小时", resources: [{ title: "多址接入技术", url: "https://www.sharetechnote.com/html/PhyL一只羊.html", required: true, type: "doc", source: "official" }, { title: "5G NR技术", url: "https://www.mathworks.com/5g.html", required: false, type: "tool", source: "official" },  { title: "5G NR系统级仿真", url: "https://github.com/V imperfect/5G-Simulator", required: false, type: "repo", source: "github" }], checkpoint: "能对比TDMA、FDMA、CDMA三种多址方式的优缺点" },
      { day: 8, title: "信道估计与均衡", content: ["无线信道复杂多变，信道估计是接收端恢复发送信号的关键", "导频（Pilot）是在已知位置插入的已知符号，接收端通过导频估计信道特性", "均衡器补偿信道的频率选择性衰落，使信号无失真通过", "在AI通信系统中，深度学习被用于端到端的信道估计和信号检测"], duration: "2小时", resources: [{ title: "信道估计教程", url: "https://www.mathworks.com/help/comm/ref/lte.channelestimate.html", required: true, type: "doc", source: "official" }, { title: "自适应均衡", url: "https://www.mathworks.com/help/comm/ref/dfe.html", required: false, type: "tool", source: "official" },  { title: "信道估计算法实现", url: "https://github.com/veeresht/CommPy", required: false, type: "repo", source: "github" }], checkpoint: "能解释导频辅助信道估计的原理" },
      { day: 9, title: "同步技术", content: ["同步是通信系统的基础，包括载波同步、位同步（符号同步）、帧同步", "载波同步：接收端需要恢复发送端的载波频率和相位，用于相干解调", "位同步：确定每个比特或符号的采样时刻，保证在最佳时刻采样", "在AI驱动的自适应通信中，同步算法可以根据信道条件动态调整"], duration: "1.5小时", resources: [{ title: "同步技术", url: "https://www.mathworks.com/help/comm/ug/synchronization.html", required: true, type: "doc", source: "official" }, { title: "锁相环原理", url: "https://www.allaboutcircuits.com/textbook/radio-frequency-modulation/chpt-9/phase-locked-loops/", required: false, type: "doc", source: "official" },  { title: "同步算法实现", url: "https://github.com/veeresht/CommPy", required: false, type: "repo", source: "github" }], checkpoint: "能解释载波同步和位同步的实现方法" },
      { day: 10, title: "综合实践：通信系统链路仿真", content: ["用MATLAB/Simulink或Python搭建一个完整的数字通信系统仿真", "包含：信源→信源编码→信道编码→调制→信道→解调→信道译码→信源译码→信宿", "添加AWGN信道，分析不同信噪比下的误码率性能", "对比不同调制方式（BPSK、QPSK、16QAM）和不同信道编码的性能差异"], duration: "3小时", resources: [{ title: "通信系统仿真", url: "https://www.mathworks.com/help/comm/ug/introduction-to-communications-system-simulation.html", required: true, type: "doc", source: "official" }, { title: "Python通信仿真", url: "https://python-sdr.readthedocs.io/en/latest/", required: false, type: "tool", source: "official" },  { title: "SDR通信项目", url: "https://github.com/mhostler/SDRwithDeepLearning", required: false, type: "repo", source: "github" }], checkpoint: "能仿真并绘制BER vs SNR曲线，分析调制和编码的影响" }
    ]
  },

  // =====================================================
  // Node: ctrl-pid - 自动控制原理
  // =====================================================
  {
    id: "ctrl-pid",
    name: "自动控制原理",
    track: "control",
    duration: "3周",
    prerequisites: ["elec-signals"],
    status: "locked",
    position: { x: 0, y: 0 },
    description: "掌握自动控制的核心概念，理解反馈控制原理和控制器设计方法",
    outcomes: ["理解控制系统基本组成", "掌握PID控制器原理", "能分析系统稳定性"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["control", "pid", "feedback", "stability"],
    dailyTasks: [
      { day: 1, title: "控制系统概述", content: ["自动控制是用自动化装置代替人工操作，使生产过程自动进行", "开环控制：输入直接决定输出，不受输出影响。闭环控制（反馈控制）：用输出反馈与期望值比较，误差驱动控制", "自动控制系统组成：给定值、比较器、控制器、执行机构、被控对象、传感器（反馈元件）", "在AI机器人控制中，反馈控制使机器人能精确跟踪期望轨迹"], duration: "1.5小时", resources: [{ title: "控制理论入门", url: "https://www.control-systems-principles.co.uk/understanding-控制/understanding-control-systems-chinese.pdf", required: true, type: "doc", source: "official" }, { title: "MATLAB控制系统工具箱", url: "https://www.mathworks.com/products/control.html", required: false, type: "tool", source: "official" }, { title: "现代控制理论GitHub教程", url: "https://github.com/EngineeringMusic/control_theory", required: false, type: "repo", source: "github" }, { title: "反馈控制理论综述", url: "https://arxiv.org/abs/2103.05639", required: false, type: "paper", source: "academic" }], checkpoint: "能区分开环控制和闭环控制，举出实际应用例子" },
      { day: 2, title: "控制系统数学模型", content: ["微分方程是连续系统的基本数学模型，描述系统输入输出之间的动态关系", "传递函数是系统在零初始条件下输出拉普拉斯变换与输入拉普拉斯变换之比", "方块图表示系统中各环节的输入输出关系和信号流向", "在AI强化学习中，环境模型可以用传递函数近似描述"], duration: "2小时", resources: [{ title: "传递函数教程", url: "https://www.allaboutcircuits.com/textbook/direct-current/chpt-9/transfer-functions/", required: true, type: "doc", source: "official" }, { title: "方块图化简", url: "https://www.mathworks.com/help/symbolic/laplace-transform.html", required: false, type: "tool", source: "official" }], checkpoint: "能根据系统方块图写出系统的传递函数" },
      { day: 3, title: "系统时域响应", content: ["典型输入信号：单位阶跃、单位脉冲、单位斜坡、单位抛物线", "动态性能指标：上升时间、峰值时间、超调量、调节时间、稳态误差", "一阶系统：响应无超调，时间常数τ决定响应速度", "二阶系统：欠阻尼有振荡，阻尼比ζ决定超调量，固有频率ωn决定响应速度"], duration: "2小时", resources: [{ title: "时域响应分析", url: "https://www.mathworks.com/help/control/ref/linsys.bode.html", required: true, type: "doc", source: "official" }, { title: "二阶系统仿真", url: "https://www.geogebra.org/m/sb2tbudt", required: false, type: "tool", source: "official" }, { title: "控制系统响应分析", url: "https://github.com/luonglehong/control-systems-analysis", required: false, type: "repo", source: "github" }, { title: "二阶系统动力学论文", url: "https://arxiv.org/abs/2106.07178", required: false, type: "paper", source: "academic" }], checkpoint: "能根据二阶系统的阶跃响应曲线读取超调量和调节时间" },
      { day: 4, title: "稳定性分析", content: ["稳定是控制系统正常工作的前提，不稳定的系统无法正常工作", "稳定的充要条件：系统函数的极点全部位于s平面左半平面（连续系统）或单位圆内（离散系统）", "劳斯-赫尔维茨稳定性判据：根据特征方程系数判断系统稳定性", "在AI自动驾驶中，控制系统的稳定性是安全关键要求"], duration: "2小时", resources: [{ title: "稳定性判据", url: "https://www.allaboutcircuits.com/textbook/direct-current/chpt-9/stability/", required: true, type: "doc", source: "official" }, { title: "极点位置可视化", url: "https://www.geogebra.org/m/expevent", required: false, type: "tool", source: "official" }, { title: "控制系统稳定性GitHub", url: "https://github.com/Technical-Slides/control-systems-stability", required: false, type: "repo", source: "github" }, { title: "线性系统稳定性论文", url: "https://arxiv.org/abs/2105.01523", required: false, type: "paper", source: "academic" }], checkpoint: "能用劳斯判据判断三阶系统的稳定性" },
      { day: 5, title: "根轨迹法", content: ["根轨迹是开环传递函数参数变化时，系统闭环极点运动的轨迹", "根轨迹法可以分析系统参数（如增益）对系统动态性能和稳定性的影响", "主导极点的概念：高阶系统中，离虚轴最近的极点对系统响应起主导作用", "在AI自适应控制中，根轨迹用于分析参数调整对系统性能的影响"], duration: "2小时", resources: [{ title: "根轨迹教程", url: "https://www.control-systems-principles.co.uk/root-locus/root-locus-原理.pdf", required: true, type: "doc", source: "official" }, { title: "根轨迹绘制工具", url: "https://www.mathworks.com/help/control/ref/rlocus.html", required: false, type: "tool", source: "official" },  { title: "根轨迹分析项目", url: "https://github.com/Technical-Slides/root-locus", required: false, type: "repo", source: "github" }, { title: "根轨迹设计论文", url: "https://arxiv.org/abs/2108.006419", required: false, type: "paper", source: "academic" }], checkpoint: "能绘制简单系统的根轨迹，分析增益变化对稳定性的影响" },
      { day: 6, title: "频率响应法", content: ["频率响应是系统对正弦输入信号的稳态输出响应，描述系统对不同频率信号的增益和相位关系", "伯德图（Bode Plot）是对数频率特性图，包括对数幅频曲线和对数相频曲线", "穿越频率ωc和相角裕度γ是衡量系统相对稳定性的重要指标", "在AI鲁棒控制中，频率响应用于分析和设计系统的鲁棒稳定性"], duration: "2小时", resources: [{ title: "伯德图教程", url: "https://www.allaboutcircuits.com/textbook/direct-current/chpt-9/frequency-response/", required: true, type: "doc", source: "official" }, { title: "伯德图绘制", url: "https://www.mathworks.com/help/control/ref/bode.html", required: false, type: "tool", source: "official" }, { title: "伯德图绘制项目", url: "https://github.com/Technical-Slides/bode-plot", required: false, type: "repo", source: "github" }, { title: "频率响应控制论文", url: "https://arxiv.org/abs/2109.06687", required: false, type: "paper", source: "academic" }], checkpoint: "能绘制典型环节的对数频率特性并理解其物理意义" },
      { day: 7, title: "PID控制器原理", content: ["PID控制器：比例（P）放大误差、积分（I）消除稳态误差、微分（D）预测误差变化趋势", "P控制：简单直接，但无法消除稳态误差", "PI控制：消除稳态误差，但可能降低系统响应速度", "PID控制结合三种控制作用的优点，是工业控制中最广泛使用的控制器"], duration: "2小时", resources: [{ title: "PID控制原理", url: "https://www.ni.com/zh-cn/innovations/white-papers/13/pid-theory-explained.html", required: true, type: "doc", source: "official" }, { title: "PID仿真", url: "https://www.mathworks.com/help/simulink/ug/modeling-a-pid-controller-at-s-domain.html", required: false, type: "tool", source: "official" }, { title: "PID控制器实现", url: "https://github.com/Technical-Slides/PID-controller", required: false, type: "repo", source: "github" }, { title: "PID控制理论论文", url: "https://arxiv.org/abs/2107.02243", required: false, type: "paper", source: "academic" }], checkpoint: "能解释P、I、D三个参数对系统响应的影响" },
      { day: 8, title: "PID参数整定", content: ["Ziegler-Nichols方法：先积分微分设为0，逐渐增大P直到持续振荡，记录临界增益Kc和临界周期Pc", "根据Z-N公式整定PID参数：Kp=0.6Kc, Ti=0.5Pc, Td=0.125Pc", "工程整定法：先P后I最后D，根据响应曲线调整参数", "在AI控制系统中，深度学习也被用于自动整定PID参数"], duration: "2小时", resources: [{ title: "PID整定方法", url: "https://www.control.com/technical-articles/determining-pid-controller-parameters/", required: true, type: "doc", source: "official" }, { title: "PID自动整定", url: "https://www.mathworks.com/help/slcontrol/ug/pid-controller-tuning.html", required: false, type: "tool", source: "official" },  { title: "PID参数整定项目", url: "https://github.com/Technical-Slides/pid-tuning", required: false, type: "repo", source: "github" }, { title: "自适应PID论文", url: "https://arxiv.org/abs/2108.08827", required: false, type: "paper", source: "academic" }], checkpoint: "能用Z-N方法整定一个PID控制器的参数" },
      { day: 9, title: "串级控制和前馈控制", content: ["串级控制：用两个控制器串联，主控制器的输出作为副控制器的给定", "串级控制能有效改善系统动态性能，副回路快速消除扰动", "前馈控制是按扰动量进行控制，补偿扰动对输出的影响", "在AI温度控制系统中，串级控制用于精确维持设定温度"], duration: "1.5小时", resources: [{ title: "串级控制", url: "https://www.ni.com/zh-cn/innovations/white-papers/13/cascade-control.html", required: true, type: "doc", source: "official" }, { title: "前馈-反馈控制", url: "https://www.mathworks.com/help/slcontrol/ug/two-degree-of-freedom-control.html", required: false, type: "tool", source: "official" },  { title: "串级控制系统项目", url: "https://github.com/Technical-Slides/cascade-control", required: false, type: "repo", source: "github" }, { title: "前馈控制论文", url: "https://arxiv.org/abs/2109.09127", required: false, type: "paper", source: "academic" }], checkpoint: "能设计一个串级控制系统，理解主副回路的作用" },
      { day: 10, title: "综合实践：倒立摆控制系统", content: ["倒立摆是经典的控制理论实验装置，摆杆通过电机驱动，可以摆动或保持直立", "建立倒立摆的数学模型，导出传递函数或状态空间方程", "设计PID控制器使摆杆保持直立，分析系统的稳定性和动态性能", "这个项目综合了建模、稳定性分析、控制器设计的完整流程"], duration: "3小时", resources: [{ title: "倒立摆控制", url: "https://www.mathworks.com/help/slcontrol/ug/inverted-pendulum.html", required: true, type: "doc", source: "official" }, { title: "倒立摆仿真", url: "https://www.seaer.com/Dynamics/Stability/pendulum.htm", required: false, type: "tool", source: "official" },  { title: "倒立摆控制项目", url: "https://github.com/Technical-Slides/inverted-pendulum", required: false, type: "repo", source: "github" }, { title: "倒立摆控制论文", url: "https://arxiv.org/abs/2109.09127", required: false, type: "paper", source: "academic" }], checkpoint: "能完成倒立摆的建模和控制器设计，仿真验证控制效果" }
    ]
  },

  // =====================================================
  // Node: ctrl-ros - 机器人操作系统
  // =====================================================
  {
    id: "ctrl-ros",
    name: "机器人技术与ROS2",
    track: "control",
    duration: "3周",
    prerequisites: ["embedded-rtos", "ctrl-pid"],
    status: "locked",
    position: { x: 0, y: 220 },
    description: "学习机器人操作系统ROS2的核心概念，掌握导航、定位和控制的实践技能",
    outcomes: ["掌握ROS2核心概念", "理解机器人导航原理", "能实现基本的机器人控制"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["ros", "robot", "navigation", "slam"],
    dailyTasks: [
      { day: 1, title: "ROS2概述与安装", content: ["ROS（Robot Operating System）是用于机器人软件开发的开源中间件，提供标准操作系统服务", "ROS2是ROS的下一代版本，基于DDS（Data Distribution Service）实现分布式通信，更适合真实机器人", "ROS2的核心概念：节点（Node）、话题（Topic）、服务（Service）、动作（Action）、参数（Parameter）", "在AI服务机器人中，ROS2作为软件框架连接感知、规划、控制各模块"], duration: "2小时", resources: [{ title: "ROS2官方文档", url: "https://docs.ros.org/en/humble/index.html", required: true, type: "doc", source: "official" }, { title: "ROS2安装指南", url: "https://docs.ros.org/en/humble/Installation.html", required: false, type: "doc", source: "official" },  { title: "ROS2示例项目", url: "https://github.com/ros2/examples", required: false, type: "repo", source: "github" }, { title: "ROS2系统架构论文", url: "https://arxiv.org/abs/2106.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能在Ubuntu上安装ROS2 Humble并运行小海龟demo" },
      { day: 2, title: "ROS2通信机制", content: ["话题（Topic）是发布-订阅的异步通信模式，适用于实时性要求高的数据传输如传感器数据", "服务（Service）是请求-应答的同步通信模式，适用于一次性请求如获取配置", "动作（Action）是长时间任务的三步通信（Goal-Feedback-Result），适用于需要进度反馈的任务如导航", "rqt_graph可以可视化节点之间的通信关系，帮助理解系统架构"], duration: "2小时", resources: [{ title: "ROS2通信", url: "https://docs.ros.org/en/humble/Concepts/Basic/About-Topic-Communication.html", required: true, type: "doc", source: "official" }, { title: "rqt工具", url: "https://docs.ros.org/en/humble/Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Tools/Understanding-ROS2-Tools.html", required: false, type: "doc", source: "official" }], checkpoint: "能用rqt_graph查看和管理ROS2系统的节点和话题" },
      { day: 3, title: "机器人建模与URDF", content: ["URDF（Unified Robot Description Format）是描述机器人结构的XML文件格式", "URDF定义机器人的连杆（Link）和关节（Joint），包括几何参数、惯性参数、碰撞属性", "xacro是URDF的扩展，支持宏定义和数学运算，简化复杂机器人的建模", "在AI物流机器人中，URDF用于仿真和实际控制之间的模型统一"], duration: "2小时", resources: [{ title: "URDF教程", url: "https://docs.ros.org/en/humble/Tutorials/Intermediate/URDF/URDF-Main.html", required: true, type: "doc", source: "official" }, { title: "URDF可视化", url: "https://rviz.org/", required: false, type: "tool", source: "official" },  { title: "URDF机器人模型项目", url: "https://github.com/ros/urdf_tutorial", required: false, type: "repo", source: "github" }, { title: "机器人建模论文", url: "https://arxiv.org/abs/2106.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能创建一个具有两个连杆和一个关节的URDF模型" },
      { day: 4, title: "里程计与运动控制", content: ["里程计（Odometry）通过电机编码器积分估计机器人位置和朝向，是移动机器人的基础定位方法", "轮式里程计有累积误差，需要与其他传感器融合提高定位精度", "PID控制用于电机速度控制和轨迹跟踪", "在AI自动导引车（AGV）中，里程计结合IMU提高短距离定位精度"], duration: "2小时", resources: [{ title: "里程计", url: "https://docs.ros.org/en/humble/Tutorials/Intermediary/Localization/Understanding-ROS2-Odometry.html", required: true, type: "doc", source: "official" }, { title: "运动控制仿真", url: "https://gazebra.org/", required: false, type: "tool", source: "official" },  { title: "机器人里程计项目", url: "https://github.com/ros-planning/navigation2", required: false, type: "repo", source: "github" }, { title: "里程计融合论文", url: "https://arxiv.org/abs/2107.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能实现一个差速驱动机器人的里程计计算和PID速度控制" },
      { day: 5, title: "激光雷达与SLAM", content: ["激光雷达（LiDAR）测量机器人周围障碍物的距离，是自主导航的核心传感器", "SLAM（Simultaneous Localization and Mapping）同时完成定位和建图，是自主移动的关键技术", "ROS2的slam_toolbox实现基于激光雷达的SLAM，生成2D占据栅格地图", "在AI扫地机器人和无人配送车中，SLAM用于环境感知和路径规划"], duration: "2.5小时", resources: [{ title: "SLAM", url: "https://docs.ros.org/en/humble/Tutorials/Intermediary/SLAM.html", required: true, type: "doc", source: "official" }, { title: "SLAM Toolbox", url: "https://github.com/SteveMacenski/slam_toolbox", required: false, type: "tool", source: "official" },  { title: "SLAM算法实现", url: "https://github.com/SteveMacenski/slam_toolbox", required: false, type: "repo", source: "github" }, { title: "SLAM综述论文", url: "https://arxiv.org/abs/2107.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能在仿真环境中运行SLAM，生成未知环境的地图" },
      { day: 6, title: "导航堆栈与路径规划", content: ["ROS2导航堆栈（Navigation2）是完整的移动机器人导航解决方案", "导航流程：定位（AMCL）→全局路径规划→局部路径规划→运动控制→安全避障", "全局路径规划：Dijkstra、A*算法在已知地图上计算最短路径", "局部路径规划：DWA、TEB等算法在动态环境中实时避障"], duration: "2.5小时", resources: [{ title: "Navigation2", url: "https://navigation.ros.org/", required: true, type: "doc", source: "official" }, { title: "路径规划可视化", url: "https://github.com/ros-planning/navigation2", required: false, type: "tool", source: "official" },  { title: "导航2项目", url: "https://github.com/ros-planning/navigation2", required: false, type: "repo", source: "github" }, { title: "机器人导航论文", url: "https://arxiv.org/abs/2108.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能在仿真环境中实现点到点的自主导航" },
      { day: 7, title: "机器人感知与深度学习", content: ["机器人需要感知周围环境，包括物体检测、语义分割、目标跟踪等视觉任务", "ROS2支持与深度学习框架集成，通过message_filter实现传感器同步", "YOLO等目标检测算法用于障碍物识别，PointNet用于点云处理", "在AI服务机器人中，视觉感知与激光雷达融合提高环境理解能力"], duration: "2.5小时", resources: [{ title: "ROS2视觉集成", url: "https://github.com/IntelRealSense/realsense-ros", required: true, type: "doc", source: "official" }, { title: "ROS2深度学习", url: "https://github.com/ros-perception/depthai_ros", required: false, type: "tool", source: "official" },  { title: "ROS2感知项目", url: "https://github.com/ros-perception", required: false, type: "repo", source: "github" }, { title: "机器人感知论文", url: "https://arxiv.org/abs/2109.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能在ROS2中集成一个目标检测算法并进行实时检测" },
      { day: 8, title: "机械臂运动学", content: ["机械臂运动学研究关节空间和操作空间之间的映射关系", "正运动学：给定关节角度，计算末端执行器位置姿态", "逆运动学：给定末端位置姿态，计算关节角度（可能有多个解）", "ROS2的MoveIt2是机械臂运动规划的标准框架"], duration: "2.5小时", resources: [{ title: "运动学教程", url: "https://docs.ros.org/en/humble/Tutorials/Intermediary/MoveIt-2/MoveIt-2-Getting-Started.html", required: true, type: "doc", source: "official" }, { title: "MoveIt2", url: "https://moveit.ros.org/", required: false, type: "tool", source: "official" },  { title: "MoveIt2项目", url: "https://github.com/ros-planning/moveit2", required: false, type: "repo", source: "github" }, { title: "机器人运动学论文", url: "https://arxiv.org/abs/2110.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能用MoveIt2控制机械臂完成点到点的运动" },
      { day: 9, title: "分布式机器人系统", content: ["ROS2的DDS中间件支持多机器人系统的分布式通信", "多机器人协调：任务分配、冲突解决、协同控制", "机器人间通过话题共享感知信息，通过服务协调动作", "在AI仓储系统中，多台AGV协调完成货物搬运任务"], duration: "2小时", resources: [{ title: "多机器人ROS2", url: "https://docs.ros.org/en/humble/Tutorials/Advanced/Discovery.html", required: true, type: "doc", source: "official" }, { title: "Multi Robot Demo", url: "https://github.com/ros2/demos", required: false, type: "tool", source: "official" },  { title: "多机器人系统项目", url: "https://github.com/ros2/demos", required: false, type: "repo", source: "github" }, { title: "多机器人协作论文", url: "https://arxiv.org/abs/2111.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能搭建一个双机器人协调演示系统" },
      { day: 10, title: "综合实践：服务机器人导航", content: ["综合项目：使用ROS2搭建一个服务机器人的自主导航系统", "功能要求：自主建图、定位、点到点导航、动态避障、人机交互", "硬件：差速移动底盘、激光雷达、深度相机、语音模块（可选）", "验证机器人在真实环境中完成送物任务"], duration: "3小时", resources: [{ title: "服务机器人案例", url: "https://github.com/chvmp/robotnik", required: true, type: "doc", source: "official" }, { title: "ROS2机器人项目", url: "https://github.com/prototypeolu/ros2-nav-bringup", required: false, type: "tool", source: "official" }], checkpoint: "机器人能在办公室环境中自主导航并避开移动障碍物" }
    ]
  },

  // =====================================================
  // Node: elec-motor - 电机控制
  // =====================================================
  {
    id: "elec-motor",
    name: "电机控制与电力电子",
    track: "electrical",
    duration: "3周",
    prerequisites: ["elec-circuit", "ctrl-pid"],
    status: "locked",
    position: { x: 0, y: 0 },
    description: "掌握直流电机和交流电机的控制原理，理解FOC矢量控制和电力电子变换技术",
    outcomes: ["理解电机工作原理", "掌握FOC矢量控制", "理解电力电子变换技术"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["motor", "foc", "inverter", "pwm"],
    dailyTasks: [
      { day: 1, title: "电机分类与工作原理", content: ["电机是将电能转换为机械能的装置，分为直流电机和交流电机两大类", "直流电机：电枢电流和励磁磁场相互作用产生转矩，换向器实现换向", "交流电机：分为异步电机（感应电机）和同步电机，结构简单坚固", "在AI驱动的电动设备中，电机是实现运动执行的关键部件"], duration: "1.5小时", resources: [{ title: "电机原理", url: "https://www.allaboutcircuits.com/textbook/electrical-equipment/", required: true, type: "doc", source: "official" }, { title: "电机仿真", url: "https://www.mathworks.com/products/simscape/electrical.html", required: false, type: "tool", source: "official" },  { title: "电机控制项目", url: "https://github.com/ros-planning/motor_control", required: false, type: "repo", source: "github" }, { title: "电机设计论文", url: "https://arxiv.org/abs/2201.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能解释直流电机和交流异步电机的工作原理差异" },
      { day: 2, title: "直流电机控制", content: ["直流电机的转速公式：n = (U - IR) / (KΦ)，调节电枢电压或励磁磁通可以改变转速", "电枢电压控制：低压时恒转矩调速，高压时恒功率调速", "PWM脉宽调制：用电子开关快速通断控制平均电压，效率高", "H桥驱动：四个开关组成H桥，可以改变电流方向实现正反转控制"], duration: "2小时", resources: [{ title: "直流电机控制", url: "https://www.mathworks.com/help/sps/ug/dc-machine.html", required: true, type: "doc", source: "official" }, { title: "H桥仿真", url: "https://www.falstad.com/circuit/h-bridge.html", required: false, type: "tool", source: "official" },  { title: "直流电机控制项目", url: "https://github.com/ros-planning/motor_control", required: false, type: "repo", source: "github" }, { title: "直流电机控制论文", url: "https://arxiv.org/abs/2202.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能用PWM和H桥驱动一个直流电机实现正反转和速度调节" },
      { day: 3, title: "三相交流电与PMSM", content: ["三相交流电：三个相位相差120°的交流电，合成旋转磁场", "永磁同步电机（PMSM）用永磁体代替转子励磁，效率高、功率密度大", "PMSM的转子磁场和定子旋转磁场同步运行，转速与电源频率严格同步", "在AI电动汽车和机器人关节中，PMSM是主流选择"], duration: "2小时", resources: [{ title: "PMSM原理", url: "https://www.mathworks.com/help/sps/ug/permanent-magnet-synchronous-machine.html", required: true, type: "doc", source: "official" }, { title: "三相电仿真", url: "https://www.falstad.com/circuit/3phase.html", required: false, type: "tool", source: "official" },  { title: "PMSM项目", url: "https://github.com/ros-planning/motor_control", required: false, type: "repo", source: "github" }, { title: "PMSM论文", url: "https://arxiv.org/abs/2203.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能解释三相交流电如何产生旋转磁场" },
      { day: 4, title: "FOC矢量控制原理", content: ["FOC（Field Oriented Control）磁场定向控制，将三相电流变换到旋转坐标系分解为励磁分量和转矩分量", "Clarke变换：三相abc坐标系到两相αβ静止坐标系的变换", "Park变换：αβ坐标系到dq旋转坐标系的变换，实现励磁和转矩分量的解耦", "dq坐标系下，FOC像控制直流电机一样控制交流电机，实现高精度控制"], duration: "2.5小时", resources: [{ title: "FOC原理", url: "https://www.mathworks.com/help/sps/ug/field-oriented-control.html", required: true, type: "doc", source: "official" }, { title: "FOC可视化", url: "https://www.control.com/technical-articles/understanding-field-oriented-control/", required: false, type: "tool", source: "official" },  { title: "FOC项目", url: "https://github.com/ros-planning/motor_control", required: false, type: "repo", source: "github" }, { title: "FOC论文", url: "https://arxiv.org/abs/2204.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能推导Clarke变换和Park变换的公式" },
      { day: 5, title: "SVPWM空间矢量调制", content: ["SVPWM（空间矢量脉宽调制）用8个基本空间矢量合成任意方向和幅值的电压矢量", "SVPWM比传统SPWM直流电压利用率提高15%，电流波形更好", "扇区判断、作用时间计算、开关序列选择是SVPWM的核心算法", "在AI电机驱动芯片中，SVPWM算法用硬件实现，保证实时性"], duration: "2.5小时", resources: [{ title: "SVPWM教程", url: "https://www.mathworks.com/help/sps/ug/space-vector-modulation.html", required: true, type: "doc", source: "official" }, { title: "SVPWM仿真", url: "https://www.mathworks.com/help/sps/ref/svpwm.html", required: false, type: "tool", source: "official" },  { title: "SVPWM项目", url: "https://github.com/ros-planning/motor_control", required: false, type: "repo", source: "github" }, { title: "SVPWM论文", url: "https://arxiv.org/abs/2205.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能用SVPWM生成三相PWM波形" },
      { day: 6, title: "BLDC无刷直流电机", content: ["BLDC用电子换向代替机械换向，避免了电刷磨损和火花问题", "BLDC的定子是绕组，转子是永磁体，通过霍尔传感器或反电动势检测转子位置", "六步换向：每60°电角度换向一次，在一个电周期内换向6次", "在AI无人机和电动工具中，BLDC因高效率和高功率密度被广泛使用"], duration: "2小时", resources: [{ title: "BLDC控制", url: "https://www.mathworks.com/help/sps/ug/brushless-dc-motors.html", required: true, type: "doc", source: "official" }, { title: "BLDC仿真", url: "https://www.mathworks.com/help/sps/ref/bldcmodel.html", required: false, type: "tool", source: "official" },  { title: "BLDC项目", url: "https://github.com/ros-planning/motor_control", required: false, type: "repo", source: "github" }, { title: "BLDC论文", url: "https://arxiv.org/abs/2206.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能实现BLDC的六步换向控制" },
      { day: 7, title: "逆变器与整流器", content: ["逆变器：将直流电转换为交流电。DC-AC变换，是新能源和电机驱动的核心", "整流器：将交流电转换为直流电。AC-DC变换，是电源适配器的基础", "PWM逆变器输出近似正弦波，谐波含量决定波形质量", "在AI数据中心，UPS不间断电源使用逆变器保证供电连续性"], duration: "2小时", resources: [{ title: "逆变器原理", url: "https://www.mathworks.com/help/sps/ug/full-bridge.html", required: true, type: "doc", source: "official" }, { title: "逆变器仿真", url: "https://www.mathworks.com/help/sps/ug/pwm-inverter.html", required: false, type: "tool", source: "official" },  { title: "逆变器项目", url: "https://github.com/ros-planning/motor_control", required: false, type: "repo", source: "github" }, { title: "逆变器论文", url: "https://arxiv.org/abs/2207.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能分析单相全桥逆变器的工作原理和输出波形" },
      { day: 8, title: "开关电源基础", content: ["开关电源通过PWM控制电力电子器件的通断，实现高效DC-DC变换", "Buck降压变换器：输出电压低于输入电压", "Boost升压变换器：输出电压高于输入电压", "开关电源效率可达90%以上，远高于线性电源的40-60%"], duration: "2小时", resources: [{ title: "开关电源设计", url: "https://www.mathworks.com/help/sps/ug/dcdc-converter.html", required: true, type: "doc", source: "official" }, { title: "开关电源仿真", url: "https://www.mathworks.com/help/sps/ref/dcdcconverter.html", required: false, type: "tool", source: "official" },  { title: "开关电源项目", url: "https://github.com/ros-planning/motor_control", required: false, type: "repo", source: "github" }, { title: "开关电源论文", url: "https://arxiv.org/abs/2208.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能设计一个Buck降压电路，确定电感和电容参数" },
      { day: 9, title: "电机速度闭环控制", content: ["速度闭环：用编码器检测实际转速，与给定转速比较，PI控制器调节PWM占空比", "转速PID控制：P消除动态误差，I消除稳态误差，D预测误差变化趋势", "电流环和速度环的双环控制：电流环内环提高响应速度，速度环外环提高稳态精度", "在AI轨道交通中，电机速度控制保证列车准确定位和平稳运行"], duration: "2小时", resources: [{ title: "电机控制环", url: "https://www.mathworks.com/help/sps/ug/three-phase-induction-motor.html", required: true, type: "doc", source: "official" }, { title: "双环控制仿真", url: "https://www.mathworks.com/help/sps/ug/vector-control.html", required: false, type: "tool", source: "official" },  { title: "电机控制项目", url: "https://github.com/ros-planning/motor_control", required: false, type: "repo", source: "github" }, { title: "电机控制论文", url: "https://arxiv.org/abs/2209.01842", required: false, type: "paper", source: "academic" }], checkpoint: "能实现电机的速度PI闭环控制" },
      { day: 10, title: "综合实践：FOC电机驱动系统", content: ["综合项目：设计并实现一个完整的PMSM FOC驱动系统", "硬件：MCU（STM32或DSP）、三相逆变器、位置传感器、PMSM电机", "软件实现：Clarke/Park变换、SVPWM生成、速度/电流双闭环PID控制", "用示波器观察三相电流波形和逆变器输出，验证FOC算法正确性"], duration: "3小时", resources: [{ title: "FOC参考设计", url: "https://www.st.com/resource/en/application-note/dm00130584.pdf", required: true, type: "doc", source: "official" }, { title: "STM32 FOC SDK", url: "https://www.st.com/en/development-tools/stm32-mc-mdk.html", required: false, type: "tool", source: "official" },  { title: "FOC项目", url: "https://github.com/ros-planning/motor_control", required: false, type: "repo", source: "github" }, { title: "FOC论文", url: "https://arxiv.org/abs/2210.01842", required: false, type: "paper", source: "academic" }], checkpoint: "电机在宽速度范围内平稳运行，速度响应无明显超调" }
    ]
  },

  // =====================================================
  // Node: cs-network - 计算机网络
  // =====================================================
  {
    id: "cs-network",
    name: "计算机网络",
    track: "cs",
    duration: "3周",
    prerequisites: ["cs-os"],
    status: "locked",
    position: { x: 0, y: 440 },
    description: "理解计算机网络的核心原理，掌握TCP/IP协议栈、网络编程和分布式系统基础",
    outcomes: ["理解TCP/IP协议栈", "掌握网络编程基础", "理解分布式系统概念"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["tcp-ip", "socket", "http", "dns", "routing"],
    dailyTasks: [
      { day: 1, title: "计算机网络概述", content: ["计算机网络是多台计算机通过通信线路连接，实现资源共享和信息传递的系统", "网络分类：局域网（LAN）、城域网（MAN）、广域网（WAN）。互联网是全球最大的广域网", "网络拓扑：总线型、星型、环型、树型、网状型。现代企业网络多为星型和树型混合", "在AI分布式训练中，高速网络（如InfiniBand）是多节点协同的关键基础设施"], duration: "1.5小时", resources: [{ title: "计算机网络教程", url: "https://www.cloudflare.com/learning/networking/", required: true, type: "doc", source: "official" }, { title: "网络基础视频", url: "https://www.youtube.com/playlist?list=PLz7df6kA7K2WZZQZkXfK6U7Z6K6K6K6K", required: false, type: "video", source: "youtube" }, { title: "网络协议栈详解", url: "https://github.com/CyC2018/CS-Notes/blob/master/notes/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C.md", required: false, type: "repo", source: "github" }], checkpoint: "能区分LAN、MAN、WAN的特点和应用场景" },
      { day: 2, title: "OSI七层模型与TCP/IP", content: ["OSI七层模型：物理层→数据链路层→网络层→传输层→会话层→表示层→应用层", "TCP/IP四层模型：网络接口层→网络层→传输层→应用层，是互联网的实际标准", "每层的功能：物理层传输比特流、数据链路层封装帧、网络层路由分组、传输层端到端通信、应用层提供服务", "理解分层模型有助于定位网络问题和设计网络应用"], duration: "2小时", resources: [{ title: "OSI模型详解", url: "https://www.cloudflare.com/learning/networking/network-layers/", required: true, type: "doc", source: "official" }, { title: "TCP/IP协议栈", url: "https://www.ibm.com/docs/en/zos/2.5.0?topic=concepts-tcpip-model", required: false, type: "doc", source: "official" }, { title: "TCP/IP协议栈详解", url: "https://github.com/CyC2018/CS-Notes/blob/master/notes/%E7%BD%91%E7%BB%9C%E5%8D%8F%E8%AE%AE.md", required: false, type: "repo", source: "github" }], checkpoint: "能解释OSI七层模型每层的作用和TCP/IP四层的对应关系" },
      { day: 3, title: "物理层与数据链路层", content: ["物理层：传输介质（光纤、铜缆、无线）、信号编码、物理接口标准", "数据链路层：MAC地址（48位物理地址）、以太网帧结构、交换机工作原理", "ARP协议：将IP地址解析为MAC地址，是网络层和数据链路层的桥梁", "在AI数据中心，高速以太网（100G/400G）和光纤是主流选择"], duration: "2小时", resources: [{ title: "以太网详解", url: "https://www.cloudflare.com/learning/networking/what-is-ethernet/", required: true, type: "doc", source: "official" }, { title: "ARP协议", url: "https://www.cloudflare.com/learning/networking/what-is-arp/", required: false, type: "doc", source: "official" }, { title: "MAC地址与ARP协议", url: "https://github.com/CyC2018/CS-Notes/blob/master/notes/ARP.md", required: false, type: "repo", source: "github" }], checkpoint: "能解释以太网帧结构和ARP协议的工作过程" },
      { day: 4, title: "网络层：IP协议与路由", content: ["IP协议：负责主机到主机的分组传输，IPv4地址32位，IPv6地址128位", "IP地址分类：A/B/C/D/E类，子网掩码划分网络和主机部分，CIDR灵活分配地址", "路由：路由器根据路由表转发分组，静态路由和动态路由（RIP、OSPF、BGP）", "在AI云计算中，虚拟网络（VPC）和软件定义网络（SDN）是核心技术"], duration: "2.5小时", resources: [{ title: "IP协议详解", url: "https://www.cloudflare.com/learning/networking/what-is-an-ip-address/", required: true, type: "doc", source: "official" }, { title: "路由协议", url: "https://www.cloudflare.com/learning/networking/what-is-routing/", required: false, type: "doc", source: "official" }, { title: "计算机网络路由算法", url: "https://github.com/CyC2018/CS-Notes/blob/master/notes/%E8%B7%AF%E7%94%B1%E7%AE%97%E6%B3%95.md", required: false, type: "repo", source: "github" }], checkpoint: "能计算子网掩码和网络地址，理解路由表的作用" },
      { day: 5, title: "传输层：TCP与UDP", content: ["TCP（传输控制协议）：面向连接、可靠传输、流量控制、拥塞控制", "TCP三次握手：SYN→SYN+ACK→ACK建立连接，四次挥手断开连接", "UDP（用户数据报协议）：无连接、不可靠、低延迟，适合实时应用", "在AI视频会议和实时推理中，UDP的低延迟特性更受欢迎"], duration: "2.5小时", resources: [{ title: "TCP详解", url: "https://www.cloudflare.com/learning/networking/what-is-tcp/", required: true, type: "doc", source: "official" }, { title: "UDP详解", url: "https://www.cloudflare.com/learning/networking/what-is-udp/", required: false, type: "doc", source: "official" }, { title: "TCP/IP协议详解", url: "https://github.com/moranzcw/Computer-Network-A-Top-Down-Approach", required: false, type: "repo", source: "github" }], checkpoint: "能画出TCP三次握手和四次挥手的时序图" },
      { day: 6, title: "应用层协议：HTTP与DNS", content: ["HTTP（超文本传输协议）：Web应用的核心协议，请求-响应模式", "HTTP方法：GET（获取）、POST（提交）、PUT（更新）、DELETE（删除）", "HTTPS：HTTP + TLS加密，保证数据传输安全，现代Web应用必须使用HTTPS", "DNS（域名系统）：将域名解析为IP地址，分布式层次结构，根域名→顶级域名→二级域名"], duration: "2小时", resources: [{ title: "HTTP详解", url: "https://developer.mozilla.org/zh-CN/docs/Web/HTTP", required: true, type: "doc", source: "official" }, { title: "DNS详解", url: "https://www.cloudflare.com/learning/dns/what-is-dns/", required: false, type: "doc", source: "official" }, { title: "HTTP权威指南", url: "https://github.com/bagder/http2-explained", required: false, type: "repo", source: "github" }], checkpoint: "能解释HTTP请求响应的完整流程和DNS解析过程" },
      { day: 7, title: "Socket网络编程", content: ["Socket是网络通信的编程接口，分为流式Socket（TCP）和数据报Socket（UDP）", "Socket API：socket()创建、bind()绑定地址、listen()监听、accept()接受连接、connect()连接、send()/recv()收发数据", "阻塞IO和非阻塞IO：阻塞IO等待操作完成，非阻塞IO立即返回，需要轮询或IO多路复用", "在AI推理服务中，高性能网络编程是提高吞吐量的关键"], duration: "2.5小时", resources: [{ title: "Socket编程教程", url: "https://realpython.com/python-sockets/", required: true, type: "doc", source: "official" }, { title: "网络编程实战", url: "https://beej.us/guide/bgnet/", required: false, type: "doc", source: "other" },  { title: "Libevent高性能网络库", url: "https://github.com/libevent/libevent", required: false, type: "repo", source: "github" }], checkpoint: "能用Python实现一个简单的TCP客户端和服务器" },
      { day: 8, title: "网络安全基础", content: ["网络安全威胁：窃听、篡改、伪造、拒绝服务攻击（DoS/DDoS）", "加密技术：对称加密（AES）、非对称加密（RSA）、哈希（SHA）、数字签名", "TLS/SSL：传输层安全协议，握手协商密钥、加密传输数据、验证服务器身份", "在AI模型API服务中，TLS加密保护敏感数据和模型参数"], duration: "2小时", resources: [{ title: "网络安全入门", url: "https://www.cloudflare.com/learning/security/", required: true, type: "doc", source: "official" }, { title: "TLS详解", url: "https://www.cloudflare.com/learning/ssl/what-is-ssl/", required: false, type: "doc", source: "official" },  { title: "TLS协议详解", url: "https://github.com/CyC2018/CS-Notes/blob/master/notes/TLS.md", required: false, type: "repo", source: "github" }], checkpoint: "能解释TLS握手过程和加密通信的原理" },
      { day: 9, title: "分布式系统基础", content: ["分布式系统：多台计算机协同工作，对外呈现为单一系统", "CAP定理：一致性（C）、可用性（A）、分区容错性（P）三者最多同时满足两个", "一致性模型：强一致性、最终一致性、因果一致性", "在AI大模型训练中，分布式训练框架（如PyTorch DDP）依赖分布式系统原理"], duration: "2小时", resources: [{ title: "分布式系统概念", url: "https://www.cloudflare.com/learning/networking/distributed-system/", required: true, type: "doc", source: "official" }, { title: "CAP定理", url: "https://en.wikipedia.org/wiki/CAP_theorem", required: false, type: "doc", source: "other" }, { title: "Designing Data-Intensive Applications", url: "https://github.com/SanCoder-Q/ddia-notes", required: false, type: "repo", source: "github" }], checkpoint: "能解释CAP定理的含义和分布式系统的挑战" },
      { day: 10, title: "综合实践：实现一个简单的Web服务器", content: ["综合项目：用Python实现一个简单的HTTP服务器，支持GET和POST请求", "功能要求：解析HTTP请求头、返回静态文件、处理POST表单数据、返回JSON响应", "使用socket模块实现底层网络通信，理解HTTP协议的细节", "测试服务器能正确响应浏览器请求和curl命令"], duration: "3小时", resources: [{ title: "Python HTTP服务器", url: "https://docs.python.org/3/library/http.server.html", required: true, type: "doc", source: "official" }, { title: "Web服务器设计", url: "https://ruslanspivak.com/lsbaws-part1/", required: false, type: "doc", source: "other" },  { title: "TinyWebServer", url: "https://github.com/qinguoyi/TinyWebServer", required: false, type: "repo", source: "github" }], checkpoint: "手写的Web服务器能正确处理GET和POST请求，返回有效响应" }
    ]
  },

  // =====================================================
  // Node: cs-database - 数据库系统
  // =====================================================
  {
    id: "cs-database",
    name: "数据库系统",
    track: "cs",
    duration: "3周",
    prerequisites: ["cs-algo"],
    status: "locked",
    position: { x: 220, y: 220 },
    description: "掌握数据库系统的核心原理，理解关系模型、SQL语言、事务处理和数据库设计",
    outcomes: ["理解关系数据库模型", "掌握SQL语言", "理解事务和并发控制"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["sql", "database", "transaction", "index", "nosql"],
    dailyTasks: [
      { day: 1, title: "数据库系统概述", content: ["数据库是持久存储、组织和管理数据的系统，数据库管理系统（DBMS）提供数据操作接口", "数据模型：层次模型、网状模型、关系模型。关系模型是主流，用二维表组织数据", "数据库系统的组成：数据库、DBMS、应用程序、数据库管理员（DBA）", "在AI应用中，数据库存储训练数据、用户数据、模型参数等持久化信息"], duration: "1.5小时", resources: [{ title: "数据库教程", url: "https://www.cloudflare.com/learning/data-analytics/", required: true, type: "doc", source: "official" }, { title: "数据库概念", url: "https://www.ibm.com/docs/en/db2/11.5.0?topic=concepts-databases", required: false, type: "doc", source: "official" }, { title: "数据库基础知识", url: "https://github.com/CyC2018/CS-Notes/blob/master/notes/%E6%95%B0%E6%8D%AE%E5%BA%93%E7%B3%BB%E7%BB%9F.md", required: false, type: "repo", source: "github" }], checkpoint: "能解释数据库系统的组成和数据模型的概念" },
      { day: 2, title: "关系模型与关系代数", content: ["关系模型：数据以二维表（关系）形式组织，每行是一个元组（记录），每列是一个属性（字段）", "主键（Primary Key）：唯一标识表中每个元组的属性或属性组", "外键（Foreign Key）：引用其他表主键的属性，建立表之间的联系", "关系代数：选择（σ）、投影（π）、连接（⋈）、并（∪）、差（-）等操作，是SQL的理论基础"], duration: "2小时", resources: [{ title: "关系模型", url: "https://www.ibm.com/docs/en/db2/11.5.0?topic=concepts-relational-model", required: true, type: "doc", source: "official" }, { title: "关系代数", url: "https://en.wikipedia.org/wiki/Relational_algebra", required: false, type: "doc", source: "other" }, { title: "数据库系统概论", url: "https://github.com/CyC2018/CS-Notes/blob/master/notes/%E6%95%B0%E6%8D%AE%E5%BA%93%E7%B3%BB%E7%BB%9F.md", required: false, type: "repo", source: "github" }], checkpoint: "能设计一个简单的关系模式，确定主键和外键" },
      { day: 3, title: "SQL语言基础", content: ["SQL（Structured Query Language）是关系数据库的标准语言", "DDL（数据定义语言）：CREATE TABLE、ALTER TABLE、DROP TABLE", "DML（数据操作语言）：SELECT查询、INSERT插入、UPDATE更新、DELETE删除", "DCL（数据控制语言）：GRANT授权、REVOKE撤销权限"], duration: "2小时", resources: [{ title: "SQL教程", url: "https://www.w3schools.com/sql/", required: true, type: "doc", source: "official" }, { title: "SQL练习", url: "https://sqlbolt.com/", required: false, type: "tool", source: "official" },  { title: "SQL查询练习", url: "https://github.com/OracleDevrel/sql-tutorial", required: false, type: "repo", source: "github" }], checkpoint: "能用SQL完成表的创建、插入、查询、更新、删除操作" },
      { day: 4, title: "SQL高级查询", content: ["WHERE条件：比较运算、逻辑运算（AND/OR/NOT）、范围（BETWEEN）、集合（IN）、模糊匹配（LIKE）", "聚合函数：COUNT计数、SUM求和、AVG平均、MAX最大、MIN最小", "GROUP BY分组：按属性值分组，配合聚合函数使用。HAVING过滤分组结果", "JOIN连接：INNER JOIN内连接、LEFT JOIN左外连接、RIGHT JOIN右外连接、FULL JOIN全外连接"], duration: "2.5小时", resources: [{ title: "SQL JOIN详解", url: "https://www.w3schools.com/sql/sql_join.asp", required: true, type: "doc", source: "official" }, { title: "SQL聚合", url: "https://www.w3schools.com/sql/sql_groupby.asp", required: false, type: "doc", source: "official" }, { title: "SQLzoo在线练习", url: "https://github.com/fuyunhe/SQLzoo", required: false, type: "repo", source: "github" }], checkpoint: "能用JOIN连接多个表，用GROUP BY分组统计数据" },
      { day: 5, title: "数据库设计", content: ["数据库设计步骤：需求分析→概念设计（E-R图）→逻辑设计（关系模式）→物理设计", "E-R图（实体-关系图）：实体、属性、联系，描述现实世界的概念模型", "范式（Normal Form）：1NF消除重复组、2NF消除部分依赖、3NF消除传递依赖", "反范式：为了性能适当降低范式级别，增加冗余减少JOIN操作"], duration: "2.5小时", resources: [{ title: "数据库设计", url: "https://www.ibm.com/docs/en/db2/11.5.0?topic=design-database-design", required: true, type: "doc", source: "official" }, { title: "范式详解", url: "https://www.geeksforgeeks.org/types-of-normal-forms-in-dbms/", required: false, type: "doc", source: "official" },  { title: "E-R图设计", url: "https://github.com/CyC2018/CS-Notes/blob/master/notes/E-R%E5%9B%BE.md", required: false, type: "repo", source: "github" }], checkpoint: "能设计一个满足3NF的关系模式，画出E-R图" },
      { day: 6, title: "索引与查询优化", content: ["索引是提高查询效率的数据结构，类似书的目录，避免全表扫描", "B+树索引：数据库最常用的索引结构，叶子节点存储数据指针，支持范围查询", "索引类型：主键索引、唯一索引、普通索引、复合索引、全文索引", "查询优化：选择合适的索引、避免SELECT *、优化JOIN顺序、使用EXPLAIN分析执行计划"], duration: "2.5小时", resources: [{ title: "索引原理", url: "https://www.cloudflare.com/learning/data-analytics/what-is-database-index/", required: true, type: "doc", source: "official" }, { title: "查询优化", url: "https://use-the-index-luke.com/", required: false, type: "doc", source: "other" }, { title: "SQL索引详解", url: "https://github.com/CyC2018/CS-Notes/blob/master/notes/%E7%B4%A2%E5%BC%95.md", required: false, type: "repo", source: "github" }], checkpoint: "能分析查询执行计划，选择合适的索引优化查询" },
      { day: 7, title: "事务与ACID特性", content: ["事务是数据库操作的逻辑单元，要么全部成功要么全部失败", "ACID特性：原子性（Atomicity）、一致性（Consistency）、隔离性（Isolation）、持久性（Durability）", "事务控制：BEGIN开始、COMMIT提交、ROLLBACK回滚", "在AI金融应用中，事务保证账户余额更新的正确性和一致性"], duration: "2小时", resources: [{ title: "事务详解", url: "https://www.ibm.com/docs/en/db2/11.5.0?topic=concepts-transactions", required: true, type: "doc", source: "official" }, { title: "ACID特性", url: "https://en.wikipedia.org/wiki/ACID", required: false, type: "doc", source: "other" },  { title: "数据库事务机制", url: "https://github.com/CyC2018/CS-Notes/blob/master/notes/%E6%95%B0%E6%8D%AE%E5%BA%93%E4%BA%8B%E5%8A%A1.md", required: false, type: "repo", source: "github" }], checkpoint: "能解释ACID四个特性的含义和事务的作用" },
      { day: 8, title: "并发控制与锁", content: ["并发问题：脏读（读未提交数据）、不可重复读（两次读结果不同）、幻读（范围查询结果变化）", "隔离级别：读未提交、读已提交、可重复读、串行化，级别越高并发性越低", "锁机制：共享锁（S锁读锁）、排他锁（X锁写锁）、意向锁、行锁、表锁", "死锁：两个事务互相等待对方释放锁。数据库自动检测死锁并回滚其中一个事务"], duration: "2.5小时", resources: [{ title: "并发控制", url: "https://www.ibm.com/docs/en/db2/11.5.0?topic=concepts-concurrency", required: true, type: "doc", source: "official" }, { title: "隔离级别", url: "https://www.cloudflare.com/learning/data-analytics/database-isolation-levels/", required: false, type: "doc", source: "official" }, { title: "数据库锁机制", url: "https://github.com/CyC2018/CS-Notes/blob/master/notes/%E5%B9%B6%E5%8F%91%E6%8E%A7%E5%88%B6.md", required: false, type: "repo", source: "github" }], checkpoint: "能解释四种隔离级别的区别和锁的作用" },
      { day: 9, title: "NoSQL数据库", content: ["NoSQL（Not Only SQL）是非关系型数据库，适合大数据和灵活数据模型", "NoSQL类型：键值存储（Redis）、文档存储（MongoDB）、列存储（Cassandra）、图数据库（Neo4j）", "NoSQL特点：无固定模式、水平扩展、高性能、最终一致性", "在AI缓存系统中，Redis作为高速缓存减轻数据库压力"], duration: "2小时", resources: [{ title: "NoSQL概述", url: "https://www.mongodb.com/nosql-explained", required: true, type: "doc", source: "official" }, { title: "Redis教程", url: "https://redis.io/docs/", required: false, type: "doc", source: "official" }, { title: "Redis设计与实现", url: "https://github.com/huangz1990/redis", required: false, type: "repo", source: "github" }], checkpoint: "能对比关系数据库和NoSQL的特点和适用场景" },
      { day: 10, title: "综合实践：设计并实现一个学生管理系统", content: ["综合项目：设计学生管理系统的数据库，实现增删改查功能", "数据库设计：学生表、课程表、成绩表，确定主键外键，满足3NF", "后端实现：用Python + SQLite/MySQL实现数据库操作", "前端接口：提供REST API供前端调用，返回JSON格式数据"], duration: "3小时", resources: [{ title: "SQLite教程", url: "https://docs.python.org/3/library/sqlite3.html", required: true, type: "doc", source: "official" }, { title: "Flask数据库", url: "https://flask-sqlalchemy.palletsprojects.com/", required: false, type: "tool", source: "official" },  { title: "StudentManagementSystem", url: "https://github.com/qinguoyi/StudentManagementSystem", required: false, type: "repo", source: "github" }], checkpoint: "学生管理系统能正确存储和查询学生、课程、成绩信息" }
    ]
  },

  // =====================================================
  // Node: embedded-driver - 嵌入式驱动开发
  // =====================================================
  {
    id: "embedded-driver",
    name: "嵌入式驱动开发",
    track: "embedded",
    duration: "3周",
    prerequisites: ["embedded-c"],
    status: "locked",
    position: { x: 0, y: 440 },
    description: "掌握嵌入式外设驱动开发技术，理解GPIO、I2C、SPI、UART等通信协议和驱动架构",
    outcomes: ["掌握常用通信协议", "理解驱动架构设计", "能编写外设驱动程序"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["gpio", "i2c", "spi", "uart", "driver"],
    dailyTasks: [
      { day: 1, title: "嵌入式驱动概述", content: ["驱动程序是操作系统和硬件之间的桥梁，向上提供统一接口，向下操作硬件寄存器", "裸机驱动：直接操作寄存器，无操作系统抽象，适合简单应用", "RTOS驱动：在RTOS环境下开发，需要考虑任务同步和中断处理", "Linux驱动：在Linux内核中开发，遵循内核驱动框架，适合复杂系统"], duration: "1.5小时", resources: [{ title: "驱动开发概述", url: "https://www.embedded.com/drivers/", required: true, type: "doc", source: "official" }, { title: "Linux驱动", url: "https://www.kernel.org/doc/html/latest/driver-api/", required: false, type: "doc", source: "official" }, { title: "Embedded Systems Labs", url: "https://github.com/bohini1/embedded-systems-labs", required: false, type: "repo", source: "github" }, { title: "Linux Device Drivers", url: "https://lwn.net/Kernel/LDD3/", required: false, type: "doc", source: "blog" }], checkpoint: "能解释驱动程序的作用和不同环境下的驱动开发差异" },
      { day: 2, title: "GPIO驱动开发", content: ["GPIO（通用输入输出）是最基础的外设，每个引脚可以配置为输入或输出", "GPIO寄存器：模式寄存器（配置输入输出）、输出寄存器（设置输出电平）、输入寄存器（读取输入电平）", "GPIO驱动API：初始化、设置模式、读写电平、配置上下拉、中断配置", "在嵌入式LED控制、按键检测、继电器控制中，GPIO是最常用的接口"], duration: "2小时", resources: [{ title: "GPIO教程", url: "https://www.st.com/resource/en/application_note/dm00068909.pdf", required: true, type: "doc", source: "official" }, { title: "STM32 GPIO", url: "https://www.st.com/resource/en/reference_manual/dm00031051.pdf", required: false, type: "doc", source: "official" }, { title: "STM32F4 GPIO参考", url: "https://github.com/MaJerle/stm32f4_gpio", required: false, type: "repo", source: "github" }, { title: "正点原子GPIO教程", url: "http://www.openedv.com/docs/stm32/basis/uart.html", required: false, type: "doc", source: "blog" }], checkpoint: "能编写GPIO驱动实现LED控制和按键检测" },
      { day: 3, title: "UART串口通信", content: ["UART（通用异步收发传输器）是最常用的串行通信接口，用于调试和设备间通信", "UART参数：波特率（如9600、115200）、数据位（8位）、校验位（无/奇/偶）、停止位（1/2位）", "UART寄存器：数据寄存器（发送/接收）、状态寄存器（发送完成/接收完成）、控制寄存器（配置参数）", "在嵌入式调试中，UART串口是最基本的日志输出和交互方式"], duration: "2小时", resources: [{ title: "UART教程", url: "https://www.analog.com/en/analog-dialogue/articles/uart-a-hardware-communication-protocol.html", required: true, type: "doc", source: "official" }, { title: "串口调试", url: "https://www.serialportmonitor.com/", required: false, type: "tool", source: "official" }, { title: "UART驱动仓库", url: "https://github.com/MaJerle/stm32-usart", required: false, type: "repo", source: "github" }, { title: "江协科技UART教程", url: "https://jiangxianli.com/docs/STM32/02_UART.html", required: false, type: "doc", source: "blog" }], checkpoint: "能编写UART驱动实现串口收发和调试输出" },
      { day: 4, title: "I2C总线通信", content: ["I2C（Inter-Integrated Circuit）是两线式串行总线，支持多主多从，常用于传感器和EEPROM", "I2C信号线：SDA（数据线）、SCL（时钟线），需要上拉电阻", "I2C地址：7位地址（最多127个设备）或10位地址，每个设备有唯一地址", "I2C时序：起始信号→地址+读写位→数据→应答→停止信号", "在嵌入式传感器系统中，温湿度、加速度、陀螺仪等传感器常用I2C接口"], duration: "2.5小时", resources: [{ title: "I2C教程", url: "https://www.nxp.com/docs/en/application-note/AN10216.pdf", required: true, type: "doc", source: "official" }, { title: "I2C分析工具", url: "https://www.saleae.com/", required: false, type: "tool", source: "official" }, { title: "I2C驱动仓库", url: "https://github.com/MaJerle/stm32-i2c", required: false, type: "repo", source: "github" }, { title: "I2C协议详解", url: "https://www.jianshu.com/p/a71e1c42b1f5", required: false, type: "doc", source: "blog" }], checkpoint: "能编写I2C驱动读取传感器数据" },
      { day: 5, title: "SPI总线通信", content: ["SPI（Serial Peripheral Interface）是四线式高速串行总线，全双工通信，适合高速数据传输", "SPI信号线：SCK（时钟）、MOSI（主出从入）、MISO（主入从出）、CS/SS（片选）", "SPI模式：CPOL（时钟极性）和CPHA（时钟相位）组合成4种模式（Mode 0-3）", "SPI优势：速度高（可达数十MHz）、全双工、简单协议。适合Flash存储、显示屏、高速ADC"], duration: "2.5小时", resources: [{ title: "SPI教程", url: "https://www.analog.com/en/analog-dialogue/articles/introduction-to-spi-interface.html", required: true, type: "doc", source: "official" }, { title: "SPI时序分析", url: "https://www.saleae.com/", required: false, type: "tool", source: "official" }, { title: "SPI驱动仓库", url: "https://github.com/MaJerle/stm32-spi", required: false, type: "repo", source: "github" }, { title: "SPI协议深入理解", url: "https://www.cnblogs.com/-yongxin/p/13880990.html", required: false, type: "doc", source: "blog" }], checkpoint: "能编写SPI驱动读写Flash存储器" },
      { day: 6, title: "定时器与PWM", content: ["定时器是嵌入式系统的核心外设，用于计时、延时、PWM生成、输入捕获", "定时器寄存器：计数器（CNT）、预分频器（PSC）、自动重载寄存器（ARR）、比较寄存器（CCR）", "PWM（脉冲宽度调制）：通过改变占空比控制平均输出电压，用于电机调速、LED亮度调节", "定时器中断：计数溢出或比较匹配时触发中断，用于周期性任务调度"], duration: "2.5小时", resources: [{ title: "定时器教程", url: "https://www.st.com/resource/en/application_note/dm00042534.pdf", required: true, type: "doc", source: "official" }, { title: "PWM原理", url: "https://www.analog.com/en/analog-dialogue/articles/pulse-width-modulation-pwm.html", required: false, type: "doc", source: "official" }, { title: "正点原子定时器教程", url: "http://www.openedv.com/docs/stm32/basis/timer.html", required: false, type: "doc", source: "blog" }, { title: "PWM电机控制", url: "https://github.com/MaJerle/stm32-pwm", required: false, type: "repo", source: "github" }], checkpoint: "能编写定时器驱动实现PWM输出和周期中断" },
      { day: 7, title: "ADC与DAC", content: ["ADC（模数转换器）：将模拟信号转换为数字值，用于读取传感器模拟输出", "ADC参数：分辨率（12位、16位）、采样率、精度、通道数", "ADC驱动：配置通道、启动转换、等待完成、读取结果。可以用DMA提高效率", "DAC（数模转换器）：将数字值转换为模拟信号，用于音频输出、波形生成"], duration: "2小时", resources: [{ title: "ADC教程", url: "https://www.st.com/resource/en/application_note/dm00050959.pdf", required: true, type: "doc", source: "official" }, { title: "ADC精度", url: "https://www.analog.com/en/analog-dialogue/articles/adc-input.html", required: false, type: "doc", source: "official" },  { title: "正点原子ADC教程", url: "http://www.openedv.com/docs/stm32/basis/adc.html", required: false, type: "doc", source: "blog" }, { title: "ADC驱动仓库", url: "https://github.com/MaJerle/stm32-adc", required: false, type: "repo", source: "github" }], checkpoint: "能编写ADC驱动读取模拟传感器数据" },
      { day: 8, title: "中断处理与DMA", content: ["中断是硬件通知CPU的机制，CPU暂停当前任务执行中断服务程序（ISR）", "中断向量表：存储各中断源的ISR入口地址，CPU根据中断号跳转执行", "NVIC（嵌套向量中断控制器）：Cortex-M的中断管理器，支持优先级和嵌套", "DMA（直接内存访问）：外设直接读写内存，无需CPU参与，提高数据传输效率"], duration: "2.5小时", resources: [{ title: "中断处理", url: "https://www.st.com/resource/en/application_note/dm00042534.pdf", required: true, type: "doc", source: "official" }, { title: "DMA教程", url: "https://www.st.com/resource/en/application_note/dm00042534.pdf", required: false, type: "doc", source: "official" },  { title: "DMA驱动仓库", url: "https://github.com/MaJerle/stm32-dma", required: false, type: "repo", source: "github" }], checkpoint: "能编写中断处理程序和配置DMA传输" },
      { day: 9, title: "看门狗与低功耗", content: ["看门狗（Watchdog）：监控程序运行，超时未喂狗则复位系统，防止程序死锁", "独立看门狗（IWDG）：独立时钟，不受主时钟影响，可靠性高", "窗口看门狗（WWDG）：必须在时间窗口内喂狗，检测程序执行过快或过慢", "低功耗模式：睡眠（Sleep）、停止（Stop）、待机（Standby），适合电池供电设备"], duration: "2小时", resources: [{ title: "看门狗教程", url: "https://www.st.com/resource/en/application_note/dm00042534.pdf", required: true, type: "doc", source: "official" }, { title: "低功耗设计", url: "https://www.st.com/resource/en/application_note/dm00050959.pdf", required: false, type: "doc", source: "official" },  { title: "正点原子低功耗教程", url: "http://www.openedv.com/docs/stm32/basis/power.html", required: false, type: "doc", source: "blog" }, { title: "FreeRTOS低功耗", url: "https://github.com/MaJerle/FreeRTOS-printf", required: false, type: "repo", source: "github" }], checkpoint: "能配置看门狗防止程序死锁，设计低功耗策略" },
      { day: 10, title: "综合实践：传感器驱动系统", content: ["综合项目：开发一个多传感器驱动系统，包含I2C温湿度传感器、SPI Flash存储、ADC光敏传感器", "架构设计：HAL抽象层统一接口、驱动层实现具体协议、应用层调用API", "功能要求：定时采集传感器数据、存储到Flash、通过UART输出日志", "测试系统在长时间运行下稳定工作，数据采集准确"], duration: "3小时", resources: [{ title: "驱动架构", url: "https://www.st.com/resource/en/user_manual/dm00113874.pdf", required: true, type: "doc", source: "official" }, { title: "HAL设计", url: "https://www.state-machine.com/", required: false, type: "doc", source: "official" },  { title: "多传感器融合", url: "https://github.com/embedded/embedded-sensor-framework", required: false, type: "repo", source: "github" }, { title: "传感器驱动开发", url: "https://www.cnblogs.com/yuanf234/p/sensor-driver.html", required: false, type: "doc", source: "blog" }], checkpoint: "多传感器驱动系统能稳定运行，数据采集和存储正确" }
    ]
  },

  // =====================================================
  // Node: embedded-hal - 嵌入式硬件抽象层
  // =====================================================
  {
    id: "embedded-hal",
    name: "嵌入式硬件抽象层",
    track: "embedded",
    duration: "2周",
    prerequisites: ["embedded-driver", "embedded-rtos"],
    status: "locked",
    position: { x: 220, y: 220 },
    description: "学习嵌入式系统的硬件抽象层设计，理解HAL架构和跨平台移植技术",
    outcomes: ["理解HAL架构设计", "掌握跨平台移植方法", "能设计可复用的驱动框架"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["hal", "bsp", "porting", "abstraction"],
    dailyTasks: [
      { day: 1, title: "硬件抽象层概述", content: ["HAL（Hardware Abstraction Layer）是硬件和软件之间的抽象层，隐藏硬件差异", "HAL的作用：统一接口、跨平台移植、降低耦合、提高代码复用", "HAL层次结构：应用层→HAL层→驱动层→硬件层", "STM32 HAL库是典型的HAL实现，提供统一的API操作不同系列MCU"], duration: "1.5小时", resources: [{ title: "HAL概述", url: "https://www.st.com/resource/en/user_manual/dm00113874.pdf", required: true, type: "doc", source: "official" }, { title: "HAL设计原则", url: "https://www.state-machine.com/", required: false, type: "doc", source: "official" },  { title: "HAL框架源码", url: "https://github.com/STMicroelectronics/STM32CubeH7", required: false, type: "repo", source: "github" }, { title: "嵌入式HAL设计", url: "https://www.cnblogs.com/state-machine/category/HAL.html", required: false, type: "doc", source: "blog" }], checkpoint: "能解释HAL的作用和层次结构" },
      { day: 2, title: "HAL接口设计", content: ["HAL接口定义：函数声明、参数类型、返回值、错误码", "接口命名规范：HAL_外设_操作，如HAL_GPIO_WritePin、HAL_UART_Transmit", "参数设计：使用结构体配置参数，避免过多函数参数", "错误处理：返回HAL_StatusTypeDef（HAL_OK、HAL_ERROR、HAL_BUSY、HAL_TIMEOUT）"], duration: "2小时", resources: [{ title: "STM32 HAL", url: "https://www.st.com/resource/en/user_manual/dm00113874.pdf", required: true, type: "doc", source: "official" }, { title: "接口设计", url: "https://www.state-machine.com/", required: false, type: "doc", source: "official" }, { title: "嵌入式接口设计", url: "https://github.com/embedded/hal-interface", required: false, type: "repo", source: "github" }, { title: "HAL驱动框架", url: "https://www.cnblogs.com/linux-embedded/p/hal-driver-framework.html", required: false, type: "doc", source: "blog" }], checkpoint: "能设计一个简单的HAL接口定义" },
      { day: 3, title: "BSP板级支持包", content: ["BSP（Board Support Package）是特定硬件板的初始化和配置代码", "BSP内容：时钟配置、GPIO初始化、外设初始化、引脚映射", "BSP与HAL的关系：BSP调用HAL初始化硬件，应用层调用HAL操作硬件", "BSP设计原则：模块化、可配置、清晰的初始化流程"], duration: "2小时", resources: [{ title: "BSP设计", url: "https://www.st.com/resource/en/user_manual/dm00113874.pdf", required: true, type: "doc", source: "official" }, { title: "STM32 BSP", url: "https://www.st.com/resource/en/user_manual/dm00113874.pdf", required: false, type: "doc", source: "official" },  { title: "STM32 BSP模板", url: "https://github.com/STMicroelectronics/STM32CubeH7", required: false, type: "repo", source: "github" }, { title: "BSP设计模式", url: "https://www.cnblogs.com/ARM-linux/p/BSP-design-patterns.html", required: false, type: "doc", source: "blog" }], checkpoint: "能编写一个简单板子的BSP初始化代码" },
      { day: 4, title: "跨平台移植技术", content: ["移植目标：同一份应用代码在不同硬件平台运行", "移植步骤：分析硬件差异→修改HAL实现→适配BSP→测试验证", "移植挑战：外设差异、时钟配置、引脚映射、中断处理", "移植最佳实践：最小化硬件相关代码、使用条件编译、编写移植指南"], duration: "2小时", resources: [{ title: "移植指南", url: "https://www.st.com/resource/en/user_manual/dm00113874.pdf", required: true, type: "doc", source: "official" }, { title: "跨平台开发", url: "https://www.state-machine.com/", required: false, type: "doc", source: "official" }, { title: "跨平台嵌入式框架", url: "https://github.com/embedded/cross-platform-hal", required: false, type: "repo", source: "github" }, { title: "嵌入式移植技术", url: "https://www.cnblogs.com/yuanf234/p/porting-guide.html", required: false, type: "doc", source: "blog" }], checkpoint: "能分析移植需要修改的代码部分" },
      { day: 5, title: "配置管理系统", content: ["配置文件：定义硬件参数、外设配置、功能开关", "配置方式：头文件宏定义、配置结构体、配置文件（JSON/YAML）", "配置工具：STM32CubeMX图形化配置工具，生成初始化代码", "配置管理最佳实践：集中管理、版本控制、配置验证"], duration: "2小时", resources: [{ title: "STM32CubeMX", url: "https://www.st.com/stm32cubemx", required: true, type: "tool", source: "official" }, { title: "配置管理", url: "https://www.state-machine.com/", required: false, type: "doc", source: "official" },  { title: "Kconfig嵌入式配置", url: "https://github.com/embedded/kconfig-embedded", required: false, type: "repo", source: "github" }, { title: "嵌入式配置管理", url: "https://www.cnblogs.com/linux-embedded/p/kconfig-usage.html", required: false, type: "doc", source: "blog" }], checkpoint: "能用STM32CubeMX配置一个项目并生成代码" },
      { day: 6, title: "驱动框架设计", content: ["驱动框架：统一管理所有驱动，提供注册、初始化、操作接口", "驱动注册：驱动注册到框架，框架维护驱动列表", "驱动查找：通过驱动名称或ID查找驱动实例", "驱动框架示例：Linux设备驱动模型、FreeRTOS+框架"], duration: "2小时", resources: [{ title: "驱动框架", url: "https://www.kernel.org/doc/html/latest/driver-api/", required: true, type: "doc", source: "official" }, { title: "驱动模型", url: "https://www.state-machine.com/", required: false, type: "doc", source: "official" }, { title: "设备驱动框架", url: "https://github.com/linux-embedded/sensor-drivers", required: false, type: "repo", source: "github" }, { title: "驱动模型设计", url: "https://www.cnblogs.com/state-machine/p/driver-model.html", required: false, type: "doc", source: "blog" }], checkpoint: "能设计一个简单的驱动注册和查找框架" },
      { day: 7, title: "综合实践：设计一个HAL框架", content: ["综合项目：设计一个跨MCU的HAL框架，支持GPIO、UART、I2C、SPI", "框架结构：HAL接口层、HAL实现层、BSP层", "实现要求：定义统一接口、实现STM32版本、编写BSP", "测试框架在不同STM32系列上运行相同应用代码"], duration: "3小时", resources: [{ title: "HAL框架设计", url: "https://www.state-machine.com/", required: true, type: "doc", source: "official" }, { title: "STM32 HAL参考", url: "https://www.st.com/resource/en/user_manual/dm00113874.pdf", required: false, type: "doc", source: "official" },  { title: "跨平台HAL实现", url: "https://github.com/embedded/cross-platform-hal", required: false, type: "repo", source: "github" }, { title: "嵌入式框架设计", url: "https://www.cnblogs.com/yuanf234/p/hal-framework-design.html", required: false, type: "doc", source: "blog" }], checkpoint: "HAL框架能在不同MCU上运行，应用代码无需修改" }
    ]
  },

  // =====================================================
  // Node: elec-digital - 数字电子技术
  // =====================================================
  {
    id: "elec-digital",
    name: "数字电子技术",
    track: "electronics",
    duration: "3周",
    prerequisites: ["elec-circuit"],
    status: "locked",
    position: { x: 0, y: 440 },
    description: "掌握数字电路的核心原理，理解逻辑门、组合逻辑、时序逻辑和数字系统设计",
    outcomes: ["理解逻辑门和布尔代数", "掌握组合逻辑和时序逻辑设计", "能设计简单的数字系统"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["logic-gate", "boolean", "flip-flop", "counter", "fsm"],
    dailyTasks: [
      { day: 1, title: "数字电路概述", content: ["数字电路处理离散信号（0和1），相比模拟电路抗干扰能力强、易于存储和处理", "数字信号：高电平（逻辑1）和低电平（逻辑0），不同逻辑标准电平阈值不同", "数字电路分类：组合逻辑电路（输出只取决于当前输入）和时序逻辑电路（输出取决于输入和历史状态）", "在AI芯片中，几乎所有计算单元都是数字电路"], duration: "1.5小时", resources: [{ title: "数字电路教程", url: "https://www.allaboutcircuits.com/textbook/digital-semiconductors/", required: true, type: "doc", source: "official" }, { title: "数字逻辑", url: "https://www.falstad.com/circuit/e-logic.html", required: false, type: "tool", source: "official" }, { title: "数字电路基础", url: "https://github.com/OpenEdgent/SimpleLogic", required: false, type: "repo", source: "github" }], checkpoint: "能区分组合逻辑和时序逻辑的特点" },
      { day: 2, title: "逻辑门与布尔代数", content: ["基本逻辑门：AND（与）、OR（或）、NOT（非）", "复合逻辑门：NAND（与非）、NOR（或非）、XOR（异或）、XNOR（同或）", "布尔代数：逻辑运算的数学基础，有交换律、结合律、分配律、德摩根定律", "德摩根定律：NOT(A AND B) = NOT(A) OR NOT(B)，NOT(A OR B) = NOT(A) AND NOT(B)"], duration: "2小时", resources: [{ title: "逻辑门教程", url: "https://www.allaboutcircuits.com/textbook/digital-semiconductors/chpt-3/logic-gates/", required: true, type: "doc", source: "official" }, { title: "布尔代数", url: "https://www.allaboutcircuits.com/textbook/digital-semiconductors/chpt-5/boolean-identities/", required: false, type: "doc", source: "official" }, { title: "Logic Circuits Simulator", url: "https://github.com/sebastiansammons/logic-circuit-simulator", required: false, type: "repo", source: "github" }, { title: "CircuitSim", url: "https://github.com/ieeevr/CircuitSim", required: false, type: "repo", source: "github" }], checkpoint: "能用布尔代数简化逻辑表达式" },
      { day: 3, title: "组合逻辑电路设计", content: ["组合逻辑设计步骤：真值表→逻辑表达式→简化→逻辑图", "编码器：将输入信号编码为二进制代码，如8-3编码器", "译码器：将二进制代码译码为输出信号，如3-8译码器", "多路选择器（MUX）：从多个输入中选择一个输出，数据选择器"], duration: "2.5小时", resources: [{ title: "组合逻辑", url: "https://www.allaboutcircuits.com/textbook/digital-semiconductors/chpt-9/combinational-logic-functions/", required: true, type: "doc", source: "official" }, { title: "MUX设计", url: "https://www.falstad.com/circuit/e-mux.html", required: false, type: "tool", source: "official" }, { title: "Digital Logic Design", url: "https://github.com/hneemann/Digital", required: false, type: "repo", source: "github" }, { title: "Logic.js", url: "https://github.com/Darkleach/logic.js", required: false, type: "repo", source: "github" }], checkpoint: "能设计一个4-2编码器和2-4译码器" },
      { day: 4, title: "加法器与比较器", content: ["半加器：实现1位加法，输出和（S）和进位（C）。S = A XOR B，C = A AND B", "全加器：考虑进位输入，实现1位完整加法。S = A XOR B XOR Cin，Cout = (A AND B) OR (Cin AND (A XOR B))", "多位加法器：串联多个全加器，低位进位连接到高位", "比较器：比较两个数的大小，输出相等、大于、小于信号"], duration: "2小时", resources: [{ title: "加法器教程", url: "https://www.allaboutcircuits.com/textbook/digital-semiconductors/chpt-9/arithmetic-logic/", required: true, type: "doc", source: "official" }, { title: "加法器仿真", url: "https://www.falstad.com/circuit/e-fulladder.html", required: false, type: "tool", source: "official" }, { title: "Digital", url: "https://github.com/hneemann/Digital", required: false, type: "repo", source: "github" }], checkpoint: "能设计一个4位加法器电路" },
      { day: 5, title: "触发器与锁存器", content: ["锁存器：电平触发，在时钟高或低电平期间可以改变状态", "触发器（Flip-Flop）：边沿触发，只在时钟上升或下降沿改变状态", "D触发器：数据触发器，时钟边沿时D输入传到输出Q", "JK触发器：通用触发器，J=K=1时翻转状态，可以实现计数功能"], duration: "2.5小时", resources: [{ title: "触发器教程", url: "https://www.allaboutcircuits.com/textbook/digital-semiconductors/chpt-10/flip-flop-circuits/", required: true, type: "doc", source: "official" }, { title: "触发器仿真", url: "https://www.falstad.com/circuit/e-dflipflop.html", required: false, type: "tool", source: "official" }, { title: "Flip-Flop Simulator", url: "https://github.com/CGUltraviolet/FlipFlop", required: false, type: "repo", source: "github" }], checkpoint: "能解释锁存器和触发器的区别，设计D触发器电路" },
      { day: 6, title: "计数器设计", content: ["计数器：对时钟脉冲计数，分为异步计数器和同步计数器", "异步计数器：各级触发器串联，低位输出作为高位时钟，简单但有延迟累积", "同步计数器：所有触发器共用时钟，并行工作，速度快但设计复杂", "计数器应用：定时器、频率计、事件计数、地址生成"], duration: "2小时", resources: [{ title: "计数器教程", url: "https://www.allaboutcircuits.com/textbook/digital-semiconductors/chpt-11/counter-circuits/", required: true, type: "doc", source: "official" }, { title: "计数器仿真", url: "https://www.falstad.com/circuit/e-counter.html", required: false, type: "tool", source: "official" }, { title: "Digital", url: "https://github.com/hneemann/Digital", required: false, type: "repo", source: "github" }], checkpoint: "能设计一个4位同步二进制计数器" },
      { day: 7, title: "寄存器与移位寄存器", content: ["寄存器：存储一组二进制数据，由多个触发器组成", "数据寄存器：存储数据，支持并行读写", "移位寄存器：数据可以左移或右移，用于串行通信、乘除法运算", "移位寄存器类型：串入串出、串入并出、并入串出、并入并出"], duration: "2小时", resources: [{ title: "寄存器教程", url: "https://www.allaboutcircuits.com/textbook/digital-semiconductors/chpt-11/shift-registers/", required: true, type: "doc", source: "official" }, { title: "移位寄存器仿真", url: "https://www.falstad.com/circuit/e-shiftregister.html", required: false, type: "tool", source: "official" }, { title: "Digital", url: "https://github.com/hneemann/Digital", required: false, type: "repo", source: "github" }], checkpoint: "能设计一个8位并入并出移位寄存器" },
      { day: 8, title: "有限状态机设计", content: ["有限状态机（FSM）：有限个状态之间的转移，由当前状态和输入决定下一状态", "FSM组成：状态集合、输入集合、转移函数、输出函数、初始状态", "Moore型FSM：输出只取决于当前状态", "Mealy型FSM：输出取决于当前状态和输入"], duration: "2.5小时", resources: [{ title: "FSM教程", url: "https://www.allaboutcircuits.com/textbook/digital-semiconductors/chpt-11/finite-state-machines/", required: true, type: "doc", source: "official" }, { title: "FSM设计", url: "https://www.state-machine.com/", required: false, type: "doc", source: "official" }, { title: "Digital", url: "https://github.com/hneemann/Digital", required: false, type: "repo", source: "github" }, { title: "Verilog FSM", url: "https://github.com/alexforencich/verilog-fsm", required: false, type: "repo", source: "github" }], checkpoint: "能设计一个简单的FSM实现序列检测" },
      { day: 9, title: "存储器电路", content: ["RAM（随机存取存储器）：可以随时读写任意地址，分为SRAM和DRAM", "SRAM：静态RAM，用触发器存储，速度快但成本高，用于Cache", "DRAM：动态RAM，用电容存储，需要刷新，成本低但速度慢，用于主存", "ROM（只读存储器）：只能读不能写，用于存储固件和常量数据"], duration: "2小时", resources: [{ title: "存储器教程", url: "https://www.allaboutcircuits.com/textbook/digital-semiconductors/chpt-15/memory-circuits/", required: true, type: "doc", source: "official" }, { title: "存储器结构", url: "https://www.falstad.com/circuit/e-memory.html", required: false, type: "tool", source: "official" }, { title: "RAMulator", url: "https://github.com/CMU-SAFARI/RAMulator", required: false, type: "repo", source: "github" }], checkpoint: "能解释SRAM和DRAM的区别和各自的应用场景" },
      { day: 10, title: "综合实践：设计一个简单的ALU", content: ["综合项目：设计一个4位算术逻辑单元（ALU），支持加减运算和逻辑运算", "ALU功能：加法、减法、AND、OR、NOT、XOR", "设计步骤：定义功能→设计运算单元→设计选择逻辑→集成测试", "用仿真工具验证ALU的正确性"], duration: "3小时", resources: [{ title: "ALU设计", url: "https://www.allaboutcircuits.com/textbook/digital-semiconductors/chpt-9/arithmetic-logic/", required: true, type: "doc", source: "official" }, { title: "ALU仿真", url: "https://www.falstad.com/circuit/e-alu.html", required: false, type: "tool", source: "official" }, { title: " pip - RISC-V ALU", url: "https://github.com/erides741/pipelined-risc-v", required: false, type: "repo", source: "github" }, { title: "Verilog ALU", url: "https://github.com/alexforencich/verilog-alu", required: false, type: "repo", source: "github" }], checkpoint: "4位ALU能正确执行所有设计的运算功能" }
    ]
  },

  // =====================================================
  // Node: elec-pcb - PCB设计基础
  // =====================================================
  {
    id: "elec-pcb",
    name: "PCB设计基础",
    track: "electronics",
    duration: "2周",
    prerequisites: ["elec-circuit", "elec-digital"],
    status: "locked",
    position: { x: 220, y: 220 },
    description: "学习印制电路板（PCB）设计的基础知识，掌握原理图绘制、PCB布局布线和设计规范",
    outcomes: ["掌握原理图绘制", "理解PCB布局布线", "了解PCB设计规范"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["pcb", "schematic", "layout", "routing", "gerber"],
    dailyTasks: [
      { day: 1, title: "PCB概述", content: ["PCB（Printed Circuit Board）是电子元器件的载体，提供电气连接和机械支撑", "PCB类型：单面板、双面板、多层板（4层、6层等）", "PCB结构：基材（FR4）、铜箔层、阻焊层、丝印层、表面处理", "在AI硬件开发中，PCB是连接芯片、传感器、电源的基础"], duration: "1.5小时", resources: [{ title: "PCB基础", url: "https://www.allaboutcircuits.com/textbook/semiconductors/chpt-15/printed-circuit-board-pcb/", required: true, type: "doc", source: "official" }, { title: "PCB设计流程", url: "https://www.sparkfun.com/tutorials/115", required: false, type: "doc", source: "official" }], checkpoint: "能解释PCB的结构和各层的作用" },
      { day: 2, title: "原理图设计", content: ["原理图是电路的逻辑表示，展示元器件之间的电气连接关系", "原理图符号：元器件的标准图形表示，如电阻、电容、芯片", "网络标号：标识电气连接，相同标号的引脚是连接的", "原理图设计工具：KiCad、Altium Designer、EasyEDA"], duration: "2小时", resources: [{ title: "原理图教程", url: "https://www.kicad.org/help/documentation/", required: true, type: "doc", source: "official" }, { title: "KiCad入门", url: "https://www.kicad.org/help/video-tutorials/", required: false, type: "video", source: "youtube" }, { title: "KiCad", url: "https://github.com/KiCad/kicad-source-mirror", required: false, type: "repo", source: "github" }, { title: "Altium Designer脚本", url: "https://github.com/Altium-Designer-Addon/Altium-Designer-Addon", required: false, type: "repo", source: "github" }], checkpoint: "能用KiCad绘制一个简单的LED电路原理图" },
      { day: 3, title: "元器件封装", content: ["封装是元器件在PCB上的物理形状和焊盘布局", "常见封装：DIP（双列直插）、SOP/SOIC（小外形封装）、QFP（四方扁平封装）、BGA（球栅阵列）", "封装设计：焊盘尺寸、间距、外形轮廓、丝印标识", "封装库管理：建立和维护封装库，确保封装与元器件匹配"], duration: "2小时", resources: [{ title: "封装类型", url: "https://www.allaboutcircuits.com/textbook/semiconductors/chpt-15/ic-packages/", required: true, type: "doc", source: "official" }, { title: "封装设计", url: "https://www.kicad.org/help/documentation/", required: false, type: "doc", source: "official" }, { title: "KiCad封装库", url: "https://github.com/KiCad/kicad-packages", required: false, type: "repo", source: "github" }, { title: "Ultra Librarian", url: "https://github.com/ultralibrarian/ultralibrarian", required: false, type: "repo", source: "github" }], checkpoint: "能创建一个简单的元器件封装" },
      { day: 4, title: "PCB布局设计", content: ["布局是将元器件放置在PCB上的过程，影响电路性能和可靠性", "布局原则：功能分区、信号流向、热管理、EMC考虑", "关键元器件优先：晶振、高频芯片、电源模块等放在最优位置", "布局间距：元器件间距满足焊接和调试要求，避免干扰"], duration: "2小时", resources: [{ title: "布局原则", url: "https://www.sparkfun.com/tutorials/115", required: true, type: "doc", source: "official" }, { title: "布局技巧", url: "https://www.altium.com/documentation/altium-designer/layout-guidelines", required: false, type: "doc", source: "official" }, { title: "KiCad教程", url: "https://github.com/KiCad/kicad-source-mirror", required: false, type: "repo", source: "github" }], checkpoint: "能完成一个简单电路的PCB布局" },
      { day: 5, title: "PCB布线设计", content: ["布线是连接元器件焊盘的铜箔走线，实现电气连接", "布线规则：线宽（承载电流）、间距（绝缘）、层数（成本）", "信号布线：避免长距离平行走线、减少过孔、控制阻抗", "电源布线：加宽线宽、使用铜箔填充、减少压降"], duration: "2小时", resources: [{ title: "布线规则", url: "https://www.sparkfun.com/tutorials/115", required: true, type: "doc", source: "official" }, { title: "布线技巧", url: "https://www.altium.com/documentation/altium-designer/routing-guidelines", required: false, type: "doc", source: "official" }, { title: "KiCad", url: "https://github.com/KiCad/kicad-source-mirror", required: false, type: "repo", source: "github" }], checkpoint: "能完成一个简单电路的PCB布线" },
      { day: 6, title: "设计规则检查", content: ["DRC（Design Rule Check）检查PCB设计是否符合制造规则", "DRC内容：线宽、间距、过孔、焊盘、丝印等", "电气规则检查（ERC）：检查电气连接错误，如短路、开路", "设计检查流程：DRC→修复错误→再次检查→通过"], duration: "1.5小时", resources: [{ title: "DRC教程", url: "https://www.kicad.org/help/documentation/", required: true, type: "doc", source: "official" }, { title: "设计检查", url: "https://www.altium.com/documentation/altium-designer/drc", required: false, type: "doc", source: "official" }, { title: "KiCad", url: "https://github.com/KiCad/kicad-source-mirror", required: false, type: "repo", source: "github" }], checkpoint: "能运行DRC检查并修复设计错误" },
      { day: 7, title: "Gerber文件与制造", content: ["Gerber文件是PCB制造的标准格式，描述各层的图形数据", "Gerber文件内容：铜箔层、阻焊层、丝印层、钻孔文件", "PCB制造流程：Gerber文件→CAM处理→生产→检验", "PCB打样：小批量试制，验证设计正确性"], duration: "2小时", resources: [{ title: "Gerber格式", url: "https://www.ucamco.com/en/gerber", required: true, type: "doc", source: "official" }, { title: "PCB制造", url: "https://www.sparkfun.com/tutorials/115", required: false, type: "doc", source: "official" }, { title: "Gerbv", url: "https://github.com/gerbv/gerbv", required: false, type: "repo", source: "github" }, { title: "Awesome PCB", url: "https://github.com/荧光脉冲/awesome-pcb", required: false, type: "repo", source: "github" }], checkpoint: "能导出Gerber文件并理解制造流程" }
    ]
  },

  // =====================================================
  // Node: signals-dsp - DSP数字信号处理
  // =====================================================
  {
    id: "signals-dsp",
    name: "DSP数字信号处理",
    track: "signals",
    duration: "3周",
    prerequisites: ["elec-signals"],
    status: "locked",
    position: { x: 0, y: 220 },
    description: "掌握数字信号处理的核心算法，理解数字滤波器设计、FFT应用和实时信号处理",
    outcomes: ["掌握数字滤波器设计", "理解FFT算法应用", "能实现实时信号处理"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["dsp", "digital-filter", "fft", "convolution", "real-time"],
    dailyTasks: [
      { day: 1, title: "DSP概述", content: ["DSP（Digital Signal Processing）是用数字方法处理模拟信号的技术", "DSP系统组成：ADC采样→数字处理→DAC输出", "DSP优势：精度高、可编程、可复现、抗干扰", "DSP应用：音频处理、图像处理、通信、雷达、医疗仪器"], duration: "1.5小时", resources: [{ title: "DSP教程", url: "https://www.ni.com/zh-cn/innovations/white-papers/13/digital-signal-processing-fundamentals.html", required: true, type: "doc", source: "official" }, { title: "DSP工具", url: "https://www.mathworks.com/products/dsp-system.html", required: false, type: "tool", source: "official" }], checkpoint: "能解释DSP系统的组成和优势" },
      { day: 2, title: "离散系统与差分方程", content: ["离散系统：输入输出都是离散序列的系统", "差分方程：描述离散系统的数学模型，如y[n] = x[n] + a*y[n-1]", "系统函数H(z)：离散系统的Z域表示，由差分方程导出", "稳定性判断：系统函数极点在单位圆内则系统稳定"], duration: "2小时", resources: [{ title: "离散系统", url: "https://www.dsprelated.com/associate/realization.php", required: true, type: "doc", source: "official" }, { title: "差分方程", url: "https://www.mathworks.com/help/signal/ug/discrete-time-systems.html", required: false, type: "doc", source: "official" }], checkpoint: "能根据差分方程写出系统函数并判断稳定性" },
      { day: 3, title: "卷积与相关", content: ["卷积是线性时不变系统的核心运算：y[n] = x[n] * h[n]", "卷积计算：翻转、移位、相乘、求和", "相关运算：衡量两个序列的相似程度，用于信号检测和匹配", "快速卷积：用FFT实现卷积，复杂度从O(n²)降到O(n log n)"], duration: "2.5小时", resources: [{ title: "卷积教程", url: "https://www.dsprelated.com/associate/convolution.php", required: true, type: "doc", source: "official" }, { title: "卷积可视化", url: "https://jackschaedler.github.io/circles-squares-signals/", required: false, type: "tool", source: "official" }], checkpoint: "能手算简单序列的卷积结果" },
      { day: 4, title: "FIR滤波器设计", content: ["FIR（有限脉冲响应）滤波器：脉冲响应是有限长度的，总是稳定", "FIR结构：y[n] = b0*x[n] + b1*x[n-1] + ... + bN*x[n-N]", "FIR设计方法：窗函数法、频率采样法、最优设计法", "FIR特点：线性相位、稳定、但阶数较高"], duration: "2.5小时", resources: [{ title: "FIR设计", url: "https://www.dsprelated.com/associate/fir.php", required: true, type: "doc", source: "official" }, { title: "窗函数法", url: "https://www.mathworks.com/help/signal/ug/fir-filter-design.html", required: false, type: "doc", source: "official" }, { title: "Python FIR滤波器设计库", url: "https://github.com/mormj/sp滤波", required: false, type: "repo", source: "github" }, { title: "窗函数法滤波器设计论文", url: "https://arxiv.org/abs/1805.01836", required: false, type: "paper", source: "academic" }], checkpoint: "能用窗函数法设计一个低通FIR滤波器" },
      { day: 5, title: "IIR滤波器设计", content: ["IIR（无限脉冲响应）滤波器：脉冲响应是无限长度的，可能不稳定", "IIR结构：y[n] = Σb[k]*x[n-k] - Σa[k]*y[n-k]", "IIR设计方法：模拟原型法（Butterworth、Chebyshev、Elliptic）", "IIR特点：阶数低、效率高、但相位非线性、可能不稳定"], duration: "2.5小时", resources: [{ title: "IIR设计", url: "https://www.dsprelated.com/associate/iir.php", required: true, type: "doc", source: "official" }, { title: "模拟原型法", url: "https://www.mathworks.com/help/signal/ug/iir-filter-design.html", required: false, type: "doc", source: "official" }, { title: "IIR滤波器Python实现", url: "https://github.com/AllenDowney/ThinkDSP/blob/master/code/ch06.ipynb", required: false, type: "repo", source: "github" }, { title: "模拟滤波器到数字滤波器转换", url: "https://arxiv.org/abs/1907.10665", required: false, type: "paper", source: "academic" }], checkpoint: "能用Butterworth原型设计一个低通IIR滤波器" },
      { day: 6, title: "FFT应用", content: ["FFT（快速傅里叶变换）是计算DFT的高效算法", "FFT应用：频谱分析、快速卷积、快速相关、频域滤波", "频域滤波：FFT→频域处理→IFFT，适合窄带滤波", "FFT注意事项：序列长度（2的幂次）、加窗减少频谱泄漏、零填充提高分辨率"], duration: "2.5小时", resources: [{ title: "FFT应用", url: "https://www.ni.com/zh-cn/innovations/white-papers/13/fast-fourier-transform.html", required: true, type: "doc", source: "official" }, { title: "FFT工具", url: "https://www.photonscore.com/fft/", required: false, type: "tool", source: "official" }, { title: "FFT算法纯Python实现", url: "https://github.com/jakevdp/JSAnimation/blob/master/figures/fft.py", required: false, type: "repo", source: "github" }, { title: "Cooley-Tukey FFT算法原始论文", url: "https://arxiv.org/abs/2304.06902", required: false, type: "paper", source: "academic" }], checkpoint: "能用FFT实现频域滤波" },
      { day: 7, title: "多采样率信号处理", content: ["多采样率：信号在不同阶段使用不同采样率", "降采样（Decimation）：降低采样率，先滤波再抽取", "升采样（Interpolation）：提高采样率，先插值再滤波", "应用：音频采样率转换、通信系统、子带编码"], duration: "2小时", resources: [{ title: "多采样率", url: "https://www.dsprelated.com/associate/multirate.php", required: true, type: "doc", source: "official" }, { title: "采样率转换", url: "https://www.mathworks.com/help/signal/ug/multirate-signal-processing.html", required: false, type: "doc", source: "official" }, { title: "多采样率滤波器组实现", url: "https://github.com/Wirepair/multirate", required: false, type: "repo", source: "github" }, { title: "多采样率信号处理理论", url: "https://arxiv.org/abs/1712.07802", required: false, type: "paper", source: "academic" }], checkpoint: "能实现降采样和升采样处理" },
      { day: 8, title: "自适应滤波", content: ["自适应滤波器：滤波器参数自动调整以适应信号变化", "LMS算法：最小均方算法，梯度下降优化滤波器系数", "应用：噪声消除、回声消除、信道均衡、系统辨识", "在AI语音处理中，自适应滤波用于降噪和回声消除"], duration: "2.5小时", resources: [{ title: "自适应滤波", url: "https://www.dsprelated.com/associate/adaptive.php", required: true, type: "doc", source: "official" }, { title: "LMS算法", url: "https://www.mathworks.com/help/signal/ug/adaptive-filters.html", required: false, type: "doc", source: "official" }], checkpoint: "能实现LMS自适应滤波器消除噪声" },
      { day: 9, title: "实时DSP系统", content: ["实时DSP：在规定时间内完成信号处理，延迟可控", "实时DSP硬件：DSP芯片、FPGA、ARM Cortex-M", "实时DSP软件：定点运算、汇编优化、DMA传输", "实时DSP挑战：处理速度、内存限制、功耗控制"], duration: "2小时", resources: [{ title: "实时DSP", url: "https://www.ti.com/processors/dsp-arm.html", required: true, type: "doc", source: "official" }, { title: "DSP芯片", url: "https://www.ti.com/dsp.html", required: false, type: "doc", source: "official" }, { title: "开源DSP算法库", url: "https://github.com/TI-MSPS/DSP_Libraries", required: false, type: "repo", source: "github" }, { title: "嵌入式DSP系统设计论文", url: "https://arxiv.org/abs/1905.12389", required: false, type: "paper", source: "academic" }], checkpoint: "能分析实时DSP系统的性能要求" },
      { day: 10, title: "综合实践：音频降噪系统", content: ["综合项目：实现一个实时音频降噪系统", "功能要求：采集音频→FFT分析→频域滤波→IFFT输出→播放", "滤波设计：设计合适的滤波器去除特定频率噪声", "实时性要求：处理延迟小于50ms，保证音频流畅"], duration: "3小时", resources: [{ title: "音频处理", url: "https://librosa.org/doc/latest/tutorial.html", required: true, type: "tool", source: "official" }, { title: "Python DSP", url: "https://docs.scipy.org/doc/scipy/reference/signal.html", required: false, type: "tool", source: "official" }, { title: "Python音频降噪算法库", url: "https://github.com/JJeanBast/Denoising", required: false, type: "repo", source: "github" }, { title: "基于深度学习的音频降噪论文", url: "https://arxiv.org/abs/1910.11480", required: false, type: "paper", source: "academic" }], checkpoint: "音频降噪系统能有效去除噪声，保持语音清晰" }
    ]
  },

  // =====================================================
  // Node: signals-wireless - 无线通信技术
  // =====================================================
  {
    id: "signals-wireless",
    name: "无线通信技术",
    track: "signals",
    duration: "3周",
    prerequisites: ["signals-comm"],
    status: "locked",
    position: { x: 220, y: 0 },
    description: "理解无线通信的核心技术，掌握天线原理、无线信道特性和常见无线协议",
    outcomes: ["理解无线信道特性", "掌握天线基本原理", "了解常见无线协议"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["antenna", "wireless", "wifi", "bluetooth", "channel"],
    dailyTasks: [
      { day: 1, title: "无线通信概述", content: ["无线通信：不使用导线，通过电磁波在空间传输信息", "无线通信系统：发射机→天线→无线信道→天线→接收机", "无线通信特点：移动性、覆盖范围、频谱资源有限、信道复杂", "在AI物联网中，无线通信是设备互联的关键技术"], duration: "1.5小时", resources: [{ title: "无线通信教程", url: "https://www.allaboutcircuits.com/textbook/radio-frequency-modulation/", required: true, type: "doc", source: "official" }, { title: "无线技术", url: "https://www.cloudflare.com/learning/networking/wireless-network/", required: false, type: "doc", source: "official" }], checkpoint: "能解释无线通信系统的组成和特点" },
      { day: 2, title: "电磁波与天线", content: ["电磁波：电场和磁场交替变化在空间传播，频率决定波长λ=c/f", "天线：将电信号转换为电磁波发射，或将电磁波转换为电信号接收", "天线类型：偶极子天线、单极子天线、贴片天线、阵列天线", "天线参数：增益、方向图、带宽、阻抗、极化方式"], duration: "2.5小时", resources: [{ title: "天线原理", url: "https://www.allaboutcircuits.com/textbook/radio-frequency-modulation/chpt-4/an-introduction-to-antenna-design/", required: true, type: "doc", source: "official" }, { title: "天线设计", url: "https://www.antenna-theory.com/", required: false, type: "doc", source: "official" }, { title: "微带天线设计代码库", url: "https://github.com/0b5vr/antenna-kit", required: false, type: "repo", source: "github" }, { title: "天线理论与设计论文", url: "https://arxiv.org/abs/1905.02162", required: false, type: "paper", source: "academic" }], checkpoint: "能解释天线的工作原理和主要参数" },
      { day: 3, title: "无线信道特性", content: ["无线信道：电磁波在空间传播的环境，影响信号质量", "路径损耗：信号强度随距离衰减，遵循Friis公式", "多径效应：信号通过多条路径到达接收端，造成衰落和时延扩展", "阴影衰落：障碍物遮挡造成的信号衰减，服从对数正态分布"], duration: "2.5小时", resources: [{ title: "无线信道", url: "https://www.allaboutcircuits.com/textbook/radio-frequency-modulation/chpt-3/rf-spectrum-and-propagation/", required: true, type: "doc", source: "official" }, { title: "信道模型", url: "https://www.mathworks.com/help/comm/ug/channel-modeling.html", required: false, type: "doc", source: "official" }, { title: "无线信道仿真工具", url: "https://github.com/stevengj/wireless-channel-models", required: false, type: "repo", source: "github" }, { title: "无线信道建模论文", url: "https://arxiv.org/abs/1805.04458", required: false, type: "paper", source: "academic" }], checkpoint: "能解释路径损耗、多径效应和阴影衰落" },
      { day: 4, title: "衰落与抗衰落技术", content: ["衰落：信号幅度快速波动，分为快衰落和慢衰落", "瑞利衰落：无主导路径时的小尺度衰落，幅度服从瑞利分布", "抗衰落技术：分集接收、RAKE接收、交织编码、自适应调制", "分集技术：空间分集、频率分集、时间分集，利用多个独立衰落路径"], duration: "2.5小时", resources: [{ title: "衰落技术", url: "https://www.mathworks.com/help/comm/ug/fading-channels.html", required: true, type: "doc", source: "official" }, { title: "分集技术", url: "https://www.sharetechnote.com/html/Handbook_Fading.html", required: false, type: "doc", source: "official" }, { title: "MIMO系统开源仿真", url: "https://github.com/vegardjervell/mimo", required: false, type: "repo", source: "github" }, { title: "分集接收技术论文", url: "https://arxiv.org/abs/1803.06908", required: false, type: "paper", source: "academic" }], checkpoint: "能解释衰落类型和抗衰落技术原理" },
      { day: 5, title: "WiFi技术", content: ["WiFi（802.11系列）是最流行的无线局域网技术", "WiFi演进：802.11b（11Mbps）→a/g（54Mbps）→n（600Mbps）→ac（6.9Gbps）→ax（WiFi 6，9.6Gbps）", "WiFi关键技术：OFDM、MIMO、信道绑定、MU-MIMO", "WiFi应用：家庭网络、办公网络、公共场所热点"], duration: "2小时", resources: [{ title: "WiFi教程", url: "https://www.cloudflare.com/learning/networking/wireless-network/wifi/", required: true, type: "doc", source: "official" }, { title: "WiFi 6", url: "https://www.wi-fi.org/discover-wi-fi/wi-fi-6", required: false, type: "doc", source: "official" }, { title: "WiFi协议栈开源实现", url: "https://github.com/qcawifi/openwifi", required: false, type: "repo", source: "github" }, { title: "IEEE 802.11协议标准", url: "https://arxiv.org/abs/2006.04227", required: false, type: "paper", source: "academic" }], checkpoint: "能解释WiFi的演进历程和关键技术" },
      { day: 6, title: "蓝牙技术", content: ["蓝牙是短距离无线通信技术，用于设备间数据传输", "蓝牙版本：经典蓝牙（1.0-3.0）→蓝牙低功耗（BLE 4.0-5.3）", "BLE特点：低功耗、快速连接、适合物联网设备", "蓝牙应用：耳机、键盘鼠标、健康监测、智能家居"], duration: "2小时", resources: [{ title: "蓝牙教程", url: "https://www.bluetooth.com/bluetooth-technology/", required: true, type: "doc", source: "official" }, { title: "BLE开发", url: "https://dev.ti.com/tirex/content/simplelink_academy_cc13x2_cc26x2sdk_5_20_00_00/modules/ble_01_basic/ble_01_basic.html", required: false, type: "doc", source: "official" }], checkpoint: "能解释蓝牙和BLE的区别和应用场景" },
      { day: 7, title: "蜂窝移动通信", content: ["蜂窝网络：基站组成蜂窝状覆盖区域，支持移动通信", "移动通信演进：1G（模拟语音）→2G（数字语音GSM）→3G（数据UMTS）→4G（宽带LTE）→5G（超宽带NR）", "5G三大场景：eMBB（增强移动宽带）、URLLC（超高可靠低延迟）、mMTC（海量机器通信）", "在AI自动驾驶中，5G URLLC提供超高可靠低延迟通信"], duration: "2.5小时", resources: [{ title: "蜂窝网络", url: "https://www.cloudflare.com/learning/networking/cellular-network/", required: true, type: "doc", source: "official" }, { title: "5G技术", url: "https://www.3gpp.org/", required: false, type: "doc", source: "official" }, { title: "5G NR协议栈开源实现", url: "https://github.com/nickvs5G/srsRAN", required: false, type: "repo", source: "github" }, { title: "5G新无线电技术论文", url: "https://arxiv.org/abs/2002.04830", required: false, type: "paper", source: "academic" }], checkpoint: "能解释移动通信演进历程和5G三大场景" },
      { day: 8, title: "LoRa与物联网通信", content: ["LoRa（Long Range）是低功耗广域网（LPWAN）技术，适合物联网", "LoRa特点：远距离（公里级）、低功耗（电池寿命数年）、低成本", "LoRaWAN：LoRa的网络协议，支持星型网络和多种设备类型", "LoRa应用：智能农业、智慧城市、资产追踪、环境监测"], duration: "2小时", resources: [{ title: "LoRa教程", url: "https://lora-alliance.org/", required: true, type: "doc", source: "official" }, { title: "LoRa开发", url: "https://www.semtech.com/lora", required: false, type: "doc", source: "official" }, { title: "LoRaWAN协议栈实现", url: "https://github.com/nicoworq/LoRaWAN", required: false, type: "repo", source: "github" }, { title: "LoRa调制技术论文", url: "https://arxiv.org/abs/1906.06593", required: false, type: "paper", source: "academic" }], checkpoint: "能解释LoRa的特点和应用场景" },
      { day: 9, title: "射频电路基础", content: ["射频（RF）电路：工作在高频（MHz到GHz）的电路", "射频电路组成：放大器、滤波器、混频器、振荡器、天线开关", "射频设计挑战：阻抗匹配、噪声系数、线性度、功耗", "射频芯片：收发器（Transceiver）、功率放大器（PA）、低噪声放大器（LNA）"], duration: "2小时", resources: [{ title: "射频电路", url: "https://www.allaboutcircuits.com/textbook/radio-frequency-modulation/", required: true, type: "doc", source: "official" }, { title: "射频设计", url: "https://www.analog.com/en/design-center/design-tools-and-calculators/rf-design-tools.html", required: false, type: "tool", source: "official" }, { title: "射频电路设计开源工具", url: "https://github.com/Nic极客/rf-circuit-design", required: false, type: "repo", source: "github" }, { title: "射频集成电路设计论文", url: "https://arxiv.org/abs/1903.05543", required: false, type: "paper", source: "academic" }], checkpoint: "能解释射频电路的组成和设计挑战" },
      { day: 10, title: "综合实践：无线传感器网络", content: ["综合项目：设计一个无线传感器网络系统", "功能要求：多个传感器节点→无线传输→汇聚节点→数据处理", "无线协议选择：根据距离、功耗、数据量选择WiFi/蓝牙/LoRa", "系统实现：传感器采集→无线发送→接收处理→数据展示"], duration: "3小时", resources: [{ title: "无线传感器网络", url: "https://www.ti.com/wireless-sensors.html", required: true, type: "doc", source: "official" }, { title: "物联网开发", url: "https://www.arduino.cc/en/Guide/HomePage", required: false, type: "tool", source: "official" }, { title: "无线传感器网络开源项目", url: "https://github.com/topics/wireless-sensor-network", required: false, type: "repo", source: "github" }, { title: "物联网通信协议综述论文", url: "https://arxiv.org/abs/1909.00348", required: false, type: "paper", source: "academic" }], checkpoint: "无线传感器网络能稳定运行，数据正确传输" }
    ]
  },

  // =====================================================
  // Node: ctrl-plc - PLC工业控制
  // =====================================================
  {
    id: "ctrl-plc",
    name: "PLC工业控制",
    track: "control",
    duration: "3周",
    prerequisites: ["ctrl-pid"],
    status: "locked",
    position: { x: 220, y: 0 },
    description: "学习PLC（可编程逻辑控制器）的原理和应用，掌握工业自动化控制技术",
    outcomes: ["理解PLC工作原理", "掌握梯形图编程", "能设计简单的工业控制系统"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["plc", "ladder", "industrial", "automation", "scada"],
    dailyTasks: [
      { day: 1, title: "PLC概述", content: ["PLC（Programmable Logic Controller）是工业自动化的核心控制器", "PLC组成：CPU、输入模块、输出模块、电源、通信接口", "PLC工作方式：循环扫描（读取输入→执行程序→更新输出→自诊断）", "PLC品牌：西门子S7系列、三菱FX系列、欧姆龙CP系列、AB（罗克韦尔）"], duration: "1.5小时", resources: [{ title: "PLC教程", url: "https://www.plcacademy.com/", required: true, type: "doc", source: "official" }, { title: "西门子PLC", url: "https://new.siemens.com/global/en/products/automation/systems/industrial/plc.html", required: false, type: "doc", source: "official" }, { title: "西门子S7系列PLC专题", url: "https://github.com/topics/s7-plc", required: false, type: "repo", source: "github" }], checkpoint: "能解释PLC的组成和工作方式" },
      { day: 2, title: "PLC编程语言", content: ["IEC 61131-3标准定义了5种PLC编程语言", "梯形图（LD）：图形化语言，类似电气控制电路图，最常用", "功能块图（FBD）：图形化语言，用功能块连接表示逻辑", "结构化文本（ST）：文本语言，类似Pascal/C，适合复杂算法", "顺序功能图（SFC）：图形化语言，描述顺序控制流程"], duration: "2小时", resources: [{ title: "PLC编程语言", url: "https://www.plcacademy.com/plc-programming-languages/", required: true, type: "doc", source: "official" }, { title: "IEC 61131-3", url: "https://www.plcacademy.com/iec-61131-3/", required: false, type: "doc", source: "official" }, { title: "PLCopen标准资源", url: "https://www.plcopen.org/", required: false, type: "doc", source: "official" }], checkpoint: "能区分5种PLC编程语言的特点和适用场景" },
      { day: 3, title: "梯形图基础", content: ["梯形图结构：左右两条电源轨线，中间是逻辑元件和输出线圈", "基本元件：常开触点（X）、常闭触点（X NOT）、输出线圈（Y）", "逻辑组合：串联表示AND逻辑，并联表示OR逻辑", "梯形图执行：从左到右、从上到下顺序执行"], duration: "2.5小时", resources: [{ title: "梯形图教程", url: "https://www.plcacademy.com/ladder-logic/", required: true, type: "doc", source: "official" }, { title: "梯形图练习", url: "https://www.plc-fiddle.com/", required: false, type: "tool", source: "official" },  { title: "OpenPLC开源项目", url: "https://github.com/thiagoralves/openplc", required: false, type: "repo", source: "github" }], checkpoint: "能用梯形图实现基本的逻辑控制" },
      { day: 4, title: "定时器与计数器", content: ["定时器（Timer）：延时控制，TON（通电延时）、TOF（断电延时）、TP（脉冲定时）", "定时器参数：预设值（PT）、当前值（ET）、输出（Q）", "计数器（Counter）：计数控制，CTU（加计数）、CTD（减计数）、CTUD（加减计数）", "计数器参数：预设值（PV）、当前值（CV）、输出（Q）"], duration: "2.5小时", resources: [{ title: "定时器计数器", url: "https://www.plcacademy.com/timers-and-counters/", required: true, type: "doc", source: "official" }, { title: "定时器练习", url: "https://www.plc-fiddle.com/", required: false, type: "tool", source: "official" }, { title: "工业控制论坛-工控人家", url: "https://www.gkrb88.com/", required: false, type: "doc", source: "official" }], checkpoint: "能用定时器和计数器实现延时和计数控制" },
      { day: 5, title: "数据处理与运算", content: ["数据类型：BOOL（布尔）、INT（整数）、REAL（浮点）、STRING（字符串）", "比较指令：等于、不等于、大于、小于、大于等于、小于等于", "算术指令：加、减、乘、除、取模", "数据移动：MOV指令复制数据，数据类型转换指令"], duration: "2小时", resources: [{ title: "数据处理", url: "https://www.plcacademy.com/plc-data-handling/", required: true, type: "doc", source: "official" }, { title: "算术运算", url: "https://www.plcacademy.com/plc-math-instructions/", required: false, type: "doc", source: "official" },   { title: "MATLAB PLC工具箱", url: "https://github.com/mbachmann/matlab-plc", required: false, type: "repo", source: "github" }], checkpoint: "能用数据处理指令实现数值比较和运算" },
      { day: 6, title: "模拟量处理", content: ["模拟量输入：温度、压力、流量等连续信号，通过ADC转换为数字值", "模拟量输出：控制变频器、调节阀等，通过DAC转换为模拟信号", "模拟量模块：AI模块（4-20mA、0-10V）、AO模块", "模拟量处理：量程转换、滤波、PID控制"], duration: "2.5小时", resources: [{ title: "模拟量处理", url: "https://www.plcacademy.com/analog-signals/", required: true, type: "doc", source: "official" }, { title: "PID控制", url: "https://www.plcacademy.com/plc-pid-control/", required: false, type: "doc", source: "official" }, { title: "工控论坛模拟量专题", url: "https://bbs.hcbbs.com/", required: false, type: "doc", source: "official" }], checkpoint: "能配置模拟量模块并实现量程转换" },
      { day: 7, title: "PLC通信", content: ["PLC通信：PLC与PLC、PLC与上位机、PLC与现场设备之间的数据交换", "现场总线：Profibus、Modbus、DeviceNet、CANopen", "工业以太网：Profinet、EtherNet/IP、EtherCAT", "OPC UA：工业通信标准，支持跨平台数据交换"], duration: "2小时", resources: [{ title: "PLC通信", url: "https://www.plcacademy.com/plc-communication/", required: true, type: "doc", source: "official" }, { title: "Modbus", url: "https://www.modbus.org/", required: false, type: "doc", source: "official" }, { title: "libmodbus开源库", url: "https://github.com/stephane/libmodbus", required: false, type: "repo", source: "github" }], checkpoint: "能解释常见工业通信协议的特点" },
      { day: 8, title: "HMI人机界面", content: ["HMI（Human Machine Interface）是人机交互界面，用于监视和控制PLC", "HMI功能：显示状态、参数设置、报警提示、历史记录、趋势图", "HMI设计原则：界面简洁、操作方便、信息清晰、安全可靠", "HMI软件：西门子WinCC、三菱GT Designer、AB FactoryTalk"], duration: "2小时", resources: [{ title: "HMI教程", url: "https://www.plcacademy.com/hmi-human-machine-interface/", required: true, type: "doc", source: "official" }, { title: "HMI设计", url: "https://new.siemens.com/global/en/products/automation/software-engineering/hmi.html", required: false, type: "doc", source: "official" },  { title: "FreeSCADA开源项目", url: "https://github.com/FreeSCADA", required: false, type: "repo", source: "github" }], checkpoint: "能设计一个简单的HMI界面" },
      { day: 9, title: "SCADA系统", content: ["SCADA（Supervisory Control And Data Acquisition）是监控和数据采集系统", "SCADA组成：现场设备→PLC/RTU→通信网络→SCADA服务器→HMI客户端", "SCADA功能：远程监控、数据采集、报警处理、历史存储、报表生成", "SCADA应用：电力调度、供水系统、油气管道、交通管理"], duration: "2小时", resources: [{ title: "SCADA教程", url: "https://www.plcacademy.com/scada-systems/", required: true, type: "doc", source: "official" }, { title: "SCADA软件", url: "https://new.siemens.com/global/en/products/automation/software-engineering/scada.html", required: false, type: "doc", source: "official" }], checkpoint: "能解释SCADA系统的组成和功能" },
      { day: 10, title: "综合实践：自动化生产线控制", content: ["综合项目：设计一个自动化生产线的PLC控制系统", "功能要求：启动/停止控制、传感器检测、电机控制、报警处理、HMI监视", "硬件配置：PLC、输入输出模块、传感器、电机驱动器、HMI", "软件实现：梯形图程序、HMI界面设计、通信配置"], duration: "3小时", resources: [{ title: "自动化案例", url: "https://www.plcacademy.com/plc-automation/", required: true, type: "doc", source: "official" }, { title: "PLC仿真", url: "https://www.plc-fiddle.com/", required: false, type: "tool", source: "official" },   { title: "PLC控制项目示例", url: "https://github.com/topics/plc-control", required: false, type: "repo", source: "github" }], checkpoint: "PLC控制系统能正确执行自动化流程，HMI能监视和控制" }
    ]
  },

  // =====================================================
  // Node: ctrl-servo - 伺服控制系统
  // =====================================================
  {
    id: "ctrl-servo",
    name: "伺服控制系统",
    track: "control",
    duration: "3周",
    prerequisites: ["ctrl-pid", "elec-motor"],
    status: "locked",
    position: { x: 440, y: 220 },
    description: "学习伺服系统的原理和应用，掌握伺服电机控制、运动规划和精密定位技术",
    outcomes: ["理解伺服系统原理", "掌握伺服电机控制", "能设计运动控制系统"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["servo", "motion", "encoder", "position", "trajectory"],
    dailyTasks: [
      { day: 1, title: "伺服系统概述", content: ["伺服系统：精确控制位置、速度、加速度的闭环控制系统", "伺服系统组成：伺服电机、伺服驱动器、编码器、控制器", "伺服电机类型：交流伺服电机（PMSM）、直流伺服电机、步进电机", "伺服应用：数控机床、机器人关节、自动化设备、精密定位"], duration: "1.5小时", resources: [{ title: "伺服系统", url: "https://www.motioncontroltips.com/what-is-a-servo-system/", required: true, type: "doc", source: "official" }, { title: "伺服电机", url: "https://www.mitsubishielectric.com/fa/products/drv/servo/", required: false, type: "doc", source: "official" }, { title: "ServoKit开源库", url: "https://github.com/adafruit/Adafruit_CircuitPython_ServoKit", required: false, type: "repo", source: "github" }], checkpoint: "能解释伺服系统的组成和应用场景" },
      { day: 2, title: "编码器与位置检测", content: ["编码器：检测电机位置和速度的传感器，是伺服系统的核心反馈元件", "编码器类型：增量式编码器（输出脉冲）、绝对式编码器（输出位置值）", "编码器分辨率：每转脉冲数（PPR），越高定位精度越高", "编码器信号：A/B/Z三相脉冲，A/B用于计数和方向判断，Z用于零位参考"], duration: "2.5小时", resources: [{ title: "编码器原理", url: "https://www.motioncontroltips.com/what-is-an-encoder/", required: true, type: "doc", source: "official" }, { title: "编码器选型", url: "https://www.heidenhain.com/", required: false, type: "doc", source: "official" },   { title: "Python编码器库", url: "https://github.com/simondlevy/RoboSat", required: false, type: "repo", source: "github" }], checkpoint: "能解释增量式和绝对式编码器的区别" },
      { day: 3, title: "伺服驱动器", content: ["伺服驱动器：控制伺服电机的功率放大器和控制器", "伺服驱动器功能：功率放大、电流控制、速度控制、位置控制、保护功能", "伺服驱动器参数：电子齿轮比、速度环增益、位置环增益、加减速时间", "伺服驱动器通信：脉冲控制、模拟量控制、总线控制（Modbus、EtherCAT）"], duration: "2.5小时", resources: [{ title: "伺服驱动器", url: "https://www.motioncontroltips.com/what-is-a-servo-drive/", required: true, type: "doc", source: "official" }, { title: "驱动器配置", url: "https://www.mitsubishielectric.com/fa/products/drv/servo/", required: false, type: "doc", source: "official" },   { title: "EtherCAT开源栈", url: "https://github.com/OpenEtherCAT society/SOES", required: false, type: "repo", source: "github" }], checkpoint: "能配置伺服驱动器的基本参数" },
      { day: 4, title: "位置控制模式", content: ["位置控制：精确控制电机到达指定位置", "位置指令方式：脉冲指令（方向+脉冲）、总线指令（位置值）", "电子齿轮比：指令脉冲与实际移动距离的换算比例", "定位精度：取决于编码器分辨率、机械传动精度、控制算法"], duration: "2小时", resources: [{ title: "位置控制", url: "https://www.motioncontroltips.com/servo-position-control/", required: true, type: "doc", source: "official" }, { title: "电子齿轮", url: "https://www.mitsubishielectric.com/fa/products/drv/servo/", required: false, type: "doc", source: "official" },   { title: "运动控制Simulink模型", url: "https://github.com/mathworks/Simulink servo-control", required: false, type: "repo", source: "github" }], checkpoint: "能计算电子齿轮比实现指定定位精度" },
      { day: 5, title: "速度控制模式", content: ["速度控制：控制电机以指定速度运行", "速度指令方式：模拟电压（0-10V）、总线指令（速度值）", "速度环控制：PI控制器调节速度误差，输出电流指令", "速度波动：负载变化、摩擦、共振等因素影响速度稳定性"], duration: "2小时", resources: [{ title: "速度控制", url: "https://www.motioncontroltips.com/servo-speed-control/", required: true, type: "doc", source: "official" }, { title: "速度环调试", url: "https://www.mitsubishielectric.com/fa/products/drv/servo/", required: false, type: "doc", source: "official" },   { title: "MATLAB速度控制仿真", url: "https://github.com/mathworks/speed-control-servo", required: false, type: "repo", source: "github" }], checkpoint: "能调试速度环参数实现稳定速度控制" },
      { day: 6, title: "转矩控制模式", content: ["转矩控制：控制电机输出指定转矩", "转矩指令方式：模拟电压（0-10V）、总线指令（转矩值）", "转矩控制应用：张力控制、卷绕控制、压力控制、力控机器人", "转矩限制：设置最大转矩保护电机和机械系统"], duration: "2小时", resources: [{ title: "转矩控制", url: "https://www.motioncontroltips.com/servo-torque-control/", required: true, type: "doc", source: "official" }, { title: "转矩控制应用", url: "https://www.mitsubishielectric.com/fa/products/drv/servo/", required: false, type: "doc", source: "official" },   { title: "力控机器人教程", url: "https://github.com/google/robotics-servo", required: false, type: "repo", source: "github" }], checkpoint: "能解释转矩控制的应用场景" },
      { day: 7, title: "运动规划", content: ["运动规划：生成从起点到终点的运动轨迹", "运动轨迹类型：梯形速度曲线、S形速度曲线、多项式曲线", "加减速控制：避免冲击和振动，提高运动平稳性", "多轴协调：多轴联动实现复杂轨迹，如直线插补、圆弧插补"], duration: "2.5小时", resources: [{ title: "运动规划", url: "https://www.motioncontroltips.com/motion-profiles/", required: true, type: "doc", source: "official" }, { title: "轨迹规划", url: "https://www.mathworks.com/help/robotics/ug/trajectory-planning.html", required: false, type: "doc", source: "official" },   { title: "运动规划开源库", url: "https://github.com/machinaai/panster", required: false, type: "repo", source: "github" }], checkpoint: "能设计梯形和S形速度曲线" },
      { day: 8, title: "步进电机控制", content: ["步进电机：开环控制，每脉冲转动固定角度，成本低但精度有限", "步进电机类型：反应式步进、永磁式步进、混合式步进", "步距角：每脉冲转动的角度，常见1.8°（200步/转）或0.9°", "细分驱动：通过控制电流实现更小步距角，提高分辨率和平稳性"], duration: "2小时", resources: [{ title: "步进电机", url: "https://www.motioncontroltips.com/what-is-a-stepper-motor/", required: true, type: "doc", source: "official" }, { title: "步进驱动", url: "https://www.trinamic.com/", required: false, type: "doc", source: "official" },   { title: "StepperMotor库", url: "https://github.com/arduino-libraries/Stepper", required: false, type: "repo", source: "github" }], checkpoint: "能解释步进电机的工作原理和细分驱动" },
      { day: 9, title: "伺服系统调试", content: ["伺服调试：调整控制参数使系统稳定、响应快、精度高", "调试步骤：先电流环→再速度环→最后位置环", "增益调整：增大增益提高响应速度，但过大会导致振动和超调", "惯量匹配：负载惯量与电机惯量比值影响控制性能，通常要求比值小于5"], duration: "2.5小时", resources: [{ title: "伺服调试", url: "https://www.motioncontroltips.com/servo-tuning/", required: true, type: "doc", source: "official" }, { title: "调试方法", url: "https://www.mitsubishielectric.com/fa/products/drv/servo/", required: false, type: "doc", source: "official" },   { title: "伺服调参Simulink", url: "https://github.com/mathworks/servo-tuning", required: false, type: "repo", source: "github" }], checkpoint: "能调试伺服系统参数实现稳定控制" },
      { day: 10, title: "综合实践：数控定位系统", content: ["综合项目：设计一个数控定位系统，实现精密位置控制", "功能要求：位置指令输入→伺服控制→精密定位→位置反馈", "硬件配置：控制器、伺服驱动器、伺服电机、编码器、导轨丝杠", "软件实现：位置指令处理、运动规划、伺服控制、误差补偿"], duration: "3小时", resources: [{ title: "定位系统", url: "https://www.motioncontroltips.com/positioning-systems/", required: true, type: "doc", source: "official" }, { title: "数控系统", url: "https://www.fanuc.com/", required: false, type: "doc", source: "official" },   { title: "数控系统开源项目", url: "https://github.com/LinuxCNC/linuxcnc", required: false, type: "repo", source: "github" }], checkpoint: "定位系统能实现精密定位，误差在允许范围内" }
    ]
  },

  // =====================================================
  // Node: electrical-power - 电力系统基础
  // =====================================================
  {
    id: "electrical-power",
    name: "电力系统基础",
    track: "electrical",
    duration: "3周",
    prerequisites: ["elec-circuit"],
    status: "locked",
    position: { x: 0, y: 220 },
    description: "理解电力系统的基本组成和运行原理，掌握电力生产和配电基础知识",
    outcomes: ["理解电力系统组成", "掌握电力生产原理", "了解配电系统结构"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["power-system", "generation", "transmission", "distribution", "grid"],
    dailyTasks: [
      { day: 1, title: "电力系统概述", content: ["电力系统：发电→输电→变电→配电→用电的完整系统", "电力系统组成：发电厂、变电站、输电线路、配电网络、用电设备", "电力系统特点：发输配用同时进行、频率稳定、电压稳定、可靠性要求高", "在AI数据中心，电力系统是基础设施的核心，保证服务器稳定运行"], duration: "1.5小时", resources: [{ title: "电力系统教程", url: "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-1/introduction-to-ac-network-analysis/", required: true, type: "doc", source: "official" }, { title: "电力系统", url: "https://www.eia.gov/energyexplained/electricity/", required: false, type: "doc", source: "official" }, { title: "电力系统基础", url: "https://github.com/PowerSystemsTutorial/PowerSystemsBasics", required: false, type: "repo", source: "github" }, { title: "电力系统分析", url: "https://github.com/s毁了/smart-grid-models", required: false, type: "repo", source: "github" }], checkpoint: "能解释电力系统的组成和特点" },
      { day: 2, title: "发电厂与发电方式", content: ["发电方式：火力发电（燃煤、燃气）、水力发电、核能发电、新能源发电", "火力发电：燃烧燃料产生蒸汽→汽轮机→发电机，效率约40%", "水力发电：水流势能→水轮机→发电机，效率可达90%", "新能源发电：风力发电、光伏发电、生物质发电、地热发电"], duration: "2小时", resources: [{ title: "发电方式", url: "https://www.eia.gov/energyexplained/electricity/electricity-in-the-us-generation.php", required: true, type: "doc", source: "official" }, { title: "新能源发电", url: "https://www.irena.org/", required: false, type: "doc", source: "official" }, { title: "PowerPlants", url: "https://github.com/PowerGridLib/PowerPlants", required: false, type: "repo", source: "github" }], checkpoint: "能对比不同发电方式的效率和特点" },
      { day: 3, title: "发电机原理", content: ["发电机：将机械能转换为电能的装置，基于电磁感应原理", "同步发电机：转子磁场旋转，定子绕组感应交流电，频率与转速同步", "发电机参数：额定功率、额定电压、额定频率、效率、功率因数", "发电机励磁：提供转子磁场，分为自励磁和他励磁"], duration: "2.5小时", resources: [{ title: "发电机原理", url: "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-3/synchronous-generator/", required: true, type: "doc", source: "official" }, { title: "发电机设计", url: "https://www.mathworks.com/help/sps/ug/synchronous-machine.html", required: false, type: "doc", source: "official" }, { title: "发电机建模", url: "https://github.com/MATLAB/MATLAB-Simscape-Generator-Models", required: false, type: "repo", source: "github" }], checkpoint: "能解释同步发电机的工作原理" },
      { day: 4, title: "输电系统", content: ["输电：将电能从发电厂输送到负荷中心，使用高压减少损耗", "输电电压：高压输电（110kV-220kV）、超高压输电（330kV-750kV）、特高压输电（1000kV以上）", "输电线路：架空线路（导线、杆塔、绝缘子）、地下电缆", "输电损耗：线路损耗P=I²R，提高电压可以减小电流降低损耗"], duration: "2.5小时", resources: [{ title: "输电系统", url: "https://www.eia.gov/energyexplained/electricity/delivery-to-use.php", required: true, type: "doc", source: "official" }, { title: "高压输电", url: "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-4/introduction-to-transmission-lines/", required: false, type: "doc", source: "official" }, { title: "输电线路仿真", url: "https://github.com/fei1006/Power-Transmission-Simulation", required: false, type: "repo", source: "github" }, { title: "输电系统建模", url: "https://github.com/Electrical-Engineering-Process/Transmission-System-Modeling", required: false, type: "repo", source: "github" }], checkpoint: "能解释高压输电降低损耗的原理" },
      { day: 5, title: "变电站与变压器", content: ["变电站：变换电压、分配电能、控制保护的场所", "变压器：通过电磁感应变换电压，升压变压器和降压变压器", "变压器原理：原边绕组→铁芯磁场→副边绕组感应，电压比等于匝数比", "变电站设备：变压器、断路器、隔离开关、互感器、保护装置"], duration: "2.5小时", resources: [{ title: "变压器原理", url: "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-2/introduction-to-transformers/", required: true, type: "doc", source: "official" }, { title: "变电站", url: "https://www.eia.gov/energyexplained/electricity/delivery-to-use.php", required: false, type: "doc", source: "official" }, { title: "变压器建模", url: "https://github.com/MATLAB/Simscape-Transformer-Models", required: false, type: "repo", source: "github" }, { title: "变电站仿真", url: "https://github.com/PowerSubstationSim/PowerSubstationSimulation", required: false, type: "repo", source: "github" }], checkpoint: "能解释变压器的工作原理和变电站的作用" },
      { day: 6, title: "配电系统", content: ["配电：将电能分配给用户，电压等级较低（10kV-380V/220V）", "配电网络：放射式、环式、网式结构，保证供电可靠性", "配电设备：配电变压器、配电开关、配电线路、配电箱", "配电负荷：工业负荷、商业负荷、居民负荷，不同负荷特性不同"], duration: "2小时", resources: [{ title: "配电系统", url: "https://www.eia.gov/energyexplained/electricity/delivery-to-use.php", required: true, type: "doc", source: "official" }, { title: "配电网络", url: "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-5/introduction-to-ac-motor-drives/", required: false, type: "doc", source: "official" }, { title: "配电系统仿真", url: "https://github.com/SmartGridTools/Distribution-System-Simulation", required: false, type: "repo", source: "github" }, { title: "IEEE配电标准", url: "https://standards.ieee.org/standard/857-1996.html", required: false, type: "doc", source: "official" }], checkpoint: "能解释配电系统的结构和负荷类型" },
      { day: 7, title: "电力系统运行", content: ["电力系统运行：保证频率稳定、电压稳定、供需平衡", "频率控制：发电功率与负荷功率平衡，频率偏差控制在±0.2Hz", "电压控制：无功功率平衡，通过调压变压器和补偿装置控制电压", "调度中心：监控电网状态、调度发电机组、处理故障"], duration: "2小时", resources: [{ title: "电力运行", url: "https://www.eia.gov/energyexplained/electricity/delivery-to-use.php", required: true, type: "doc", source: "official" }, { title: "电网调度", url: "https://www.nerc.com/", required: false, type: "doc", source: "official" }], checkpoint: "能解释频率控制和电压控制的原理" },
      { day: 8, title: "智能电网", content: ["智能电网：应用信息技术实现电网的智能化管理和运行", "智能电网特点：自愈能力、用户互动、高效运行、新能源接入", "智能电网技术：智能电表、分布式发电、储能系统、需求响应", "在AI能源管理中，智能电网数据用于优化用电和预测负荷"], duration: "2小时", resources: [{ title: "智能电网", url: "https://www.smartgrid.gov/", required: true, type: "doc", source: "official" }, { title: "智能电网技术", url: "https://www.ieee.org/smart-grid", required: false, type: "doc", source: "official" }, { title: "智能电网项目", url: "https://github.com/SmartGridTeam/Smart-Grid-Projects", required: false, type: "repo", source: "github" }, { title: "智能电表数据", url: "https://github.com/sg占有/Smart-Meter-Data-Analysis", required: false, type: "repo", source: "github" }], checkpoint: "能解释智能电网的特点和技术" },
      { day: 9, title: "电力系统保护", content: ["电力系统保护：检测故障、隔离故障区域、保护设备安全", "保护类型：过流保护、距离保护、差动保护、零序保护", "保护装置：继电器、断路器、熔断器、保护测控装置", "保护配合：各级保护协调配合，保证选择性、速动性、灵敏性"], duration: "2小时", resources: [{ title: "电力保护", url: "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-6/introduction-to-protection-systems/", required: true, type: "doc", source: "official" }, { title: "继电保护", url: "https://www.ieee.org/power-system-protection", required: false, type: "doc", source: "official" }, { title: "继电保护仿真", url: "https://github.com/ProtectionRelays/Relay-Protection-Simulation", required: false, type: "repo", source: "github" }, { title: "电力系统保护标准", url: "https://standards.ieee.org/standard/C37-1990.html", required: false, type: "doc", source: "official" }], checkpoint: "能解释电力系统保护的作用和类型" },
      { day: 10, title: "综合实践：电力系统仿真", content: ["综合项目：仿真一个简单的电力系统，包含发电、输电、配电", "仿真内容：发电机模型、变压器模型、输电线路模型、负荷模型", "仿真工具：MATLAB/Simulink、PSS/E、ETAP", "分析系统在不同负荷下的频率和电压变化"], duration: "3小时", resources: [{ title: "电力仿真", url: "https://www.mathworks.com/products/simscape-electrical.html", required: true, type: "tool", source: "official" }, { title: "电力系统建模", url: "https://www.mathworks.com/help/sps/ug/power-system-simulation.html", required: false, type: "doc", source: "official" }, { title: "Simscape电力系统", url: "https://github.com/MATLAB/Simscape-Electrical-Power-System", required: false, type: "repo", source: "github" }, { title: "电力系统仿真项目", url: "https://github.com/PowerSystemsDesign/Power-System-Simulation-Projects", required: false, type: "repo", source: "github" }], checkpoint: "能仿真简单电力系统并分析运行特性" }
    ]
  },

  // =====================================================
  // Node: electrical-safety - 电气安全与保护
  // =====================================================
  {
    id: "electrical-safety",
    name: "电气安全与保护",
    track: "electrical",
    duration: "2周",
    prerequisites: ["elec-circuit", "electrical-power"],
    status: "locked",
    position: { x: 220, y: 0 },
    description: "学习电气安全的基本知识和保护技术，掌握接地、防雷和电气设备保护方法",
    outcomes: ["理解电气安全规范", "掌握接地技术", "了解防雷保护方法"],
    relatedIntel: [],
    relatedTools: [],
    relatedTerms: ["grounding", "earthing", "lightning", "safety", "protection"],
    dailyTasks: [
      { day: 1, title: "电气安全概述", content: ["电气安全：防止触电、电气火灾、设备损坏的措施和规范", "触电类型：单相触电、两相触电、跨步电压触电、接触电压触电", "安全电压：干燥环境36V、潮湿环境24V、水下12V", "电气安全规范：GB标准、IEC标准、行业规范"], duration: "1.5小时", resources: [{ title: "电气安全", url: "https://www.osha.gov/electrical", required: true, type: "doc", source: "official" }, { title: "安全规范", url: "https://www.iec.ch/homepage", required: false, type: "doc", source: "official" }, { title: "电气安全规范", url: "https://github.com/ElectricalSafety/Electrical-Safety-Standards", required: false, type: "repo", source: "github" }, { title: "GB标准汇总", url: "https://github.com/ChineseStandards/GB-Standards", required: false, type: "repo", source: "github" }], checkpoint: "能解释触电类型和安全电压标准" },
      { day: 2, title: "接地技术", content: ["接地：将电气设备或电路的某点与大地连接，保证安全", "接地类型：工作接地（系统运行需要）、保护接地（防止触电）、防雷接地", "接地电阻：接地体与大地之间的电阻，越小越好（一般≤4Ω）", "接地方式：TT系统、TN系统（TN-C、TN-S、TN-C-S）、IT系统"], duration: "2.5小时", resources: [{ title: "接地技术", url: "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-7/grounding/", required: true, type: "doc", source: "official" }, { title: "接地系统", url: "https://www.iec.ch/homepage", required: false, type: "doc", source: "official" }, { title: "接地系统设计", url: "https://github.com/GroundingSystem/Grounding-System-Design", required: false, type: "repo", source: "github" }, { title: "接地标准规范", url: "https://github.com/ElectricalEngineering/Grounding-Standards", required: false, type: "repo", source: "github" }], checkpoint: "能解释接地类型和接地系统方式" },
      { day: 3, title: "接地装置设计", content: ["接地体：埋入地下的金属导体，如接地棒、接地网", "接地线：连接设备与接地体的导线，要有足够截面积", "接地电阻计算：土壤电阻率、接地体尺寸、埋设深度", "接地装置维护：定期检测接地电阻、检查接地线连接"], duration: "2小时", resources: [{ title: "接地设计", url: "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-7/grounding/", required: true, type: "doc", source: "official" }, { title: "接地计算", url: "https://www.iec.ch/homepage", required: false, type: "doc", source: "official" }, { title: "接地电阻计算", url: "https://github.com/GroundingCalc/Grounding-Resistance-Calculation", required: false, type: "repo", source: "github" }, { title: "接地装置标准", url: "https://standards.ieee.org/standard/80-2013.html", required: false, type: "doc", source: "official" }], checkpoint: "能计算简单接地装置的接地电阻" },
      { day: 4, title: "漏电保护", content: ["漏电保护：检测漏电流并切断电源，防止触电事故", "漏电保护器（RCD）：检测剩余电流，超过阈值时跳闸", "漏电保护器类型：电磁式、电子式；动作电流30mA、100mA、300mA", "漏电保护应用：住宅配电、工业设备、潮湿场所"], duration: "2小时", resources: [{ title: "漏电保护", url: "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-7/protection/", required: true, type: "doc", source: "official" }, { title: "RCD原理", url: "https://www.iec.ch/homepage", required: false, type: "doc", source: "official" }, { title: "漏电保护仿真", url: "https://github.com/LCD/LCD-Protection-Simulation", required: false, type: "repo", source: "github" }, { title: "RCD选型指南", url: "https://github.com/ElectricalProtection/RCD-Selection-Guide", required: false, type: "repo", source: "github" }], checkpoint: "能解释漏电保护器的工作原理和选型" },
      { day: 5, title: "过流保护", content: ["过流保护：检测过载和短路电流，保护线路和设备", "熔断器：过流时熔体熔断切断电路，一次性保护元件", "断路器：过流时自动跳闸，可复位重复使用", "保护配合：上级保护与下级保护协调，保证选择性"], duration: "2小时", resources: [{ title: "过流保护", url: "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-7/protection/", required: true, type: "doc", source: "official" }, { title: "断路器选型", url: "https://www.iec.ch/homepage", required: false, type: "doc", source: "official" }, { title: "断路器仿真", url: "https://github.com/CircuitBreaker/Circuit-Breaker-Simulation", required: false, type: "repo", source: "github" }, { title: "过流保护标准", url: "https://standards.ieee.org/standard/1015-2012.html", required: false, type: "doc", source: "official" }], checkpoint: "能选择合适的熔断器和断路器" },
      { day: 6, title: "防雷保护", content: ["雷电：大气中的放电现象，电压可达数百万伏，电流可达数万安", "雷电危害：直击雷、感应雷、雷电波侵入", "防雷装置：避雷针、避雷线、避雷器、浪涌保护器（SPD）", "防雷保护区：LPZ0（室外）、LPZ1（室内）、LPZ2（设备内部）"], duration: "2.5小时", resources: [{ title: "防雷保护", url: "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-7/lightning-protection/", required: true, type: "doc", source: "official" }, { title: "浪涌保护", url: "https://www.iec.ch/homepage", required: false, type: "doc", source: "official" }, { title: "SPD浪涌保护", url: "https://github.com/SPD-Project/SPD-Protection-System", required: false, type: "repo", source: "github" }, { title: "防雷标准规范", url: "https://standards.ieee.org/standard/998-2012.html", required: false, type: "doc", source: "official" }], checkpoint: "能解释雷电类型和防雷装置的作用" },
      { day: 7, title: "电气设备安全", content: ["电气设备安全：设计、安装、运行、维护的安全要求", "设备绝缘：防止带电部分与外壳接触，绝缘电阻要求", "设备防护：防护等级IP代码（防尘防水），外壳防护", "设备维护：定期检查、清洁、测试、更换老化部件"], duration: "2小时", resources: [{ title: "设备安全", url: "https://www.osha.gov/electrical", required: true, type: "doc", source: "official" }, { title: "IP防护等级", url: "https://www.iec.ch/homepage", required: false, type: "doc", source: "official" }], checkpoint: "能解释电气设备的安全要求和防护等级" }
    ]
  }
];

