import type { RoadmapNode as RoadmapNodeType, DailyTask, ResourceLink } from "../components/radar/types";

// ============================================================
// 全量路线图数据（含每日任务）
// 设计原则：所有任务为显式 DailyTask 对象，不使用工厂函数
// ============================================================

const R_LINUX_JOURNEY: ResourceLink = { title: "Linux Journey（命令行入门）", url: "https://linuxjourney.com/", required: true };
const R_GIT_SCM: ResourceLink = { title: "Git 官方文档 Pro Git", url: "https://git-scm.com/book/zh/v2", required: true };
const R_GIT_BRANCHING: ResourceLink = { title: "Learn Git Branching（可视化练习）", url: "https://learngitbranching.js.org/", required: true };
const R_DOCKER_START: ResourceLink = { title: "Docker 官方入门指南", url: "https://docs.docker.com/get-started/", required: true };
const R_DOCKER_BUILD: ResourceLink = { title: "Dockerfile 最佳实践", url: "https://docs.docker.com/engine/reference/builder/", required: true };
const R_PYTORCH_TUT: ResourceLink = { title: "PyTorch 官方 Tutorials", url: "https://pytorch.org/tutorials/", required: true };
const R_PYTORCH_DOC: ResourceLink = { title: "PyTorch 官方 API 文档", url: "https://pytorch.org/docs/stable/", required: true };
const R_NUMPY: ResourceLink = { title: "NumPy 官方文档", url: "https://numpy.org/doc/stable/", required: true };
const R_3B1B_LIN: ResourceLink = { title: "3Blue1Brown: 线性代数的本质", url: "https://www.3blue1brown.com/lessons/linear-algebra", required: true };
const R_D2L: ResourceLink = { title: "动手学深度学习 D2L", url: "https://zh.d2l.ai/", required: true };
const R_CS231N: ResourceLink = { title: "Stanford CS231n：CNN 视觉识别", url: "http://cs231n.github.io/", required: true };
const R_ULTRALYTICS: ResourceLink = { title: "Ultralytics YOLO 官方文档", url: "https://docs.ultralytics.com/", required: true };
const R_CS224N: ResourceLink = { title: "Stanford CS224n：NLP 深度学习", url: "https://web.stanford.edu/class/cs224n/", required: true };
const R_HF_TRANSFORMERS: ResourceLink = { title: "HuggingFace Transformers 文档", url: "https://huggingface.co/docs/transformers/", required: true };
const R_HF_COURSE: ResourceLink = { title: "HuggingFace NLP Course", url: "https://huggingface.co/learn/nlp-course/", required: true };
const R_HF_PEFT: ResourceLink = { title: "HuggingFace PEFT 文档", url: "https://huggingface.co/docs/peft/", required: true };
const R_JALAMMAR: ResourceLink = { title: "Jay Alammar: 图解 Transformer", url: "https://jalammar.github.io/illustrated-transformer/", required: true };
const R_FASTAPI: ResourceLink = { title: "FastAPI 官方教程", url: "https://fastapi.tiangolo.com/tutorial/", required: true };
const R_STREAMLIT: ResourceLink = { title: "Streamlit 官方入门", url: "https://docs.streamlit.io/library/get-started", required: true };
const R_LANGCHAIN: ResourceLink = { title: "LangChain 官方文档", url: "https://python.langchain.com/docs/get_started/introduction", required: false };
const R_GRADIO: ResourceLink = { title: "Gradio 快速入门", url: "https://www.gradio.app/guides/quickstart", required: false };
const R_LORA_PAPER: ResourceLink = { title: "LoRA 论文", url: "https://arxiv.org/abs/2106.09685", required: false };

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
    dailyTasks: [
      { day: 1, title: "文件系统与常用命令实战", content: ["mkdir -p projects/ai && cd projects/ai && ls -la", "cp /etc/hostname ./host.txt && mv ./host.txt ./server.txt && rm ./server.txt", "find ~ -name '*.py' -type f | head -10", "df -h 查看磁盘；du -sh * 查看各目录占用"], duration: "1.5小时", resources: [R_LINUX_JOURNEY, { title: "Bash 初学者指南", url: "https://www.gnu.org/software/bash/manual/bash.html", required: false }], checkpoint: "能独立用 Linux 完成文件/目录操作，并解释 ls -la 每一列含义" },
      { day: 2, title: "文本查看与管道组合", content: ["head -20 /var/log/syslog 2>/dev/null || cat ~/.bashrc | head -20", "grep -rn 'import' ~/projects 2>/dev/null | head -5", "cat ~/.bashrc | wc -l；echo 'a b c' | awk '{print $2}'", "tail -f /dev/null 体验实时日志（Ctrl+C 退出）"], duration: "1.5小时", resources: [R_LINUX_JOURNEY], checkpoint: "能用 grep/awk/wc 对一个文本文件做简单统计和筛选" },
      { day: 3, title: "权限与用户管理", content: ["ls -l ~/projects/ai 查看权限列", "chmod 755 test.sh && chmod +x test.sh && ./test.sh", "理解 rwx = 4+2+1，解释 chmod 644 和 755 的含义", "sudo whoami 验证 sudo 权限；查看 /etc/passwd 中自己的条目"], duration: "1.5小时", resources: [R_LINUX_JOURNEY], checkpoint: "能解释文件权限 10 个字符列（-rwxr-xr-x）各部分含义" },
      { day: 4, title: "软链接、硬链接与 inode", content: ["echo 'hello' > fileA && ln fileA fileB && ln -s fileA fileC", "ls -li 查看 inode 号与链接数；rm fileA 后 fileB、fileC 行为差异", "find . -inum $(ls -i fileB | awk '{print $1}') 找同 inode 文件", "总结：软链接 = 快捷方式；硬链接 = 同一文件别名"], duration: "1.5小时", resources: [R_LINUX_JOURNEY], checkpoint: "能清晰区分软链接与硬链接，并通过 inode 号验证" },
      { day: 5, title: "进程管理与信号", content: ["ps aux | head -5；top -bn1 | head -15", "sleep 60 & 后台运行一个进程；用 kill %1 终止", "kill -9 vs kill -15 的区别；pgrep -f sleep | xargs -r kill", "nohup sleep 300 > /tmp/out.log 2>&1 & 体验 nohup 守护"], duration: "2小时", resources: [R_LINUX_JOURNEY], checkpoint: "能启动/查看/结束进程，并能解释 kill -9 和 -15 的差异" },
      { day: 6, title: "GPU 监控与 nvidia-smi", content: ["nvidia-smi 查看 GPU 型号、显存、CUDA 版本、当前进程", "nvidia-smi pmon -s u 查看 GPU 利用率（有 GPU 时）", "watch -n 2 nvidia-smi 持续监控；理解 Memory-Usage 与 Volatile Uncorr. ECC", "无 GPU 则用 free -h + top 做系统监控替代"], duration: "2小时", resources: [{ title: "nvidia-smi 命令详解", url: "https://developer.nvidia.com/nvidia-system-management-interface", required: true }], checkpoint: "能读懂 nvidia-smi 输出，并判断 GPU 是否被正确使用" },
      { day: 7, title: "SSH 免密登录与配置", content: ["ssh-keygen -t ed25519 -N '' -f ~/.ssh/id_ed25519 生成密钥", "ssh-copy-id user@remote-server 复制公钥到远程", "vim ~/.ssh/config 配置 Host 别名：Host gpu\\n  HostName 10.0.0.1\\n  User myname\\n  IdentityFile ~/.ssh/id_ed25519", "ssh gpu 一行直接登录；scp local.py gpu:/home/myname/"], duration: "2小时", resources: [{ title: "SSH 配置实战", url: "https://www.ssh.com/academy/ssh/config", required: true }], checkpoint: "能通过 Host 别名一行免密登录远程 GPU 服务器" },
      { day: 8, title: "rsync 与文件同步", content: ["rsync -avz --progress ./data/ gpu:/home/myname/data/", "rsync -avz --delete gpu:/home/myname/logs/ ./logs/", "rsync -av --exclude '*.pyc' ./src/ gpu:/home/myname/src/", "对比 rsync vs scp：增量传输优势"], duration: "2小时", resources: [{ title: "rsync 教程", url: "https://rsync.samba.org/", required: true }], checkpoint: "能用 rsync 把本地目录增量同步到远程服务器" },
      { day: 9, title: "tmux 终端复用", content: ["tmux new -s train 新建会话；Ctrl+b d 脱离", "tmux ls；tmux a -t train 重新附着", "Ctrl+b % 竖分屏；Ctrl+b \" 横分屏；Ctrl+b 方向键切换面板", "远程训练脚本 → 放入 tmux → 脱离 → 回家仍在运行"], duration: "1.5小时", resources: [{ title: "tmux Cheat Sheet", url: "https://tmuxcheatsheet.com/", required: true }], checkpoint: "能在远程服务器上用 tmux 跑长时间任务，关闭本地终端不中断" },
      { day: 10, title: "shell 脚本与自动化", content: ["写一个 train.sh：cd ~/project && conda activate env && python train.py --lr 1e-3", "chmod +x train.sh && ./train.sh", "编写备份脚本：tar -czf backup_$(date +%Y%m%d).tar.gz ./logs && rsync 到备份目录", "$1 $# $@ 等参数变量简介"], duration: "2小时", resources: [{ title: "Bash Shell Scripting", url: "https://tldp.org/LDP/Bash-Beginners-Guide/html/", required: false }], checkpoint: "能写出带参数、带时间戳命名的 bash 脚本并运行" },
      { day: 11, title: "环境变量与 PATH", content: ["echo $PATH；理解 /usr/local/bin vs ~/.local/bin 的作用", "export PATH=$HOME/.local/bin:$PATH 永久写入 ~/.bashrc", "which python；which pip；alias py='python3' 放到 .bashrc", "source ~/.bashrc 生效；env 列出所有环境变量"], duration: "1.5小时", resources: [R_LINUX_JOURNEY], checkpoint: "能让自己编译/安装的程序在任意目录用短命令调用" },
      { day: 12, title: "包管理与软件安装", content: ["Ubuntu/Debian：sudo apt update && sudo apt install -y htop tree jq", "CentOS/RHEL：sudo yum install -y htop 或 dnf（根据发行版）", "从源码编译：./configure && make -j$(nproc) && sudo make install（以一个小程序演示）", "pip install --user 与系统包管理的区别"], duration: "2小时", resources: [R_LINUX_JOURNEY], checkpoint: "能通过 apt/yum/pip 三种方式安装软件，并理解各自适用场景" },
      { day: 13, title: "远程调试 CUDA/训练问题", content: ["远程服务器：nvcc --version；cat /usr/local/cuda/version.txt 2>/dev/null", "python -c 'import torch; print(torch.cuda.is_available(), torch.version.cuda)'", "常见错误：CUDA not available → 检查驱动/CUDA/PyTorch 版本三位一体", "nvidia-smi topo -m 查看 GPU 拓扑；CUDA_VISIBLE_DEVICES=0,1 限制可见 GPU"], duration: "2.5小时", resources: [R_PYTORCH_DOC], checkpoint: "能在远程服务器上跑一个最小 CUDA 检测脚本并定位问题" },
      { day: 14, title: "综合：从克隆代码到跑通训练", content: ["scp 或 git clone 一份公开代码到远程 GPU 服务器", "创建虚拟环境（conda create -n demo python=3.10）并安装依赖", "写一个 run.sh，在 tmux 后台启动训练，nohup 记录日志", "从本机用 rsync 拉回 ./logs 目录做可视化复盘"], duration: "3小时", resources: [R_LINUX_JOURNEY, R_PYTORCH_TUT], checkpoint: "独立完成：克隆 → 建环境 → 跑训练 → 拉回日志，流程全自动化" },
    ],
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
    dailyTasks: [
      { day: 1, title: "仓库初始化与基础配置", content: ["git config --global user.name 'Your Name'; git config --global user.email 'you@example.com'", "mkdir demo && cd demo && git init && echo '# Demo' > README.md", "git status；git add README.md；git commit -m 'init: 初始化 README'", "git log --oneline 查看提交历史"], duration: "1.5小时", resources: [R_GIT_SCM], checkpoint: "能从零创建 Git 仓库，完成一次 add + commit" },
      { day: 2, title: "理解 .git 目录与对象模型", content: ["ls -la .git/ 查看 HEAD、objects、refs、config", "cat .git/HEAD；git rev-parse HEAD 得到 SHA", "git cat-file -p <sha> 查看 commit/tree/blob 对象", "echo 'hello' | git hash-object --stdin -w 手动创建 blob"], duration: "1.5小时", resources: [R_GIT_SCM], checkpoint: "能解释 commit/tree/blob 三类对象的关系，并在 .git 中找到它们" },
      { day: 3, title: "分支创建、切换与合并", content: ["git checkout -b feature/logging 或 git switch -c feature/logging", "修改 README 并提交；git log --oneline --graph --all", "git checkout main；git merge feature/logging", "制造一个冲突文件并解决；git add + git commit --no-edit"], duration: "2小时", resources: [R_GIT_BRANCHING], checkpoint: "能手动制造冲突并成功合并，git log 看到合并图" },
      { day: 4, title: "远程仓库与 push/pull", content: ["在 GitHub 创建空仓库 demo；git remote add origin git@github.com:you/demo.git", "git branch -M main；git push -u origin main", "在 GitHub 网页修改 README；git pull origin main 拉回", "git remote -v；git fetch origin 体验 fetch vs pull"], duration: "2小时", resources: [R_GIT_SCM], checkpoint: "本地提交能成功推送到 GitHub，且能把远程修改 pull 回本地" },
      { day: 5, title: "Fork / 分支 / PR 流程", content: ["在 GitHub 上 Fork 一个感兴趣的公开仓库", "git clone git@github.com:you/that-repo.git；git remote add upstream <原仓库>", "git checkout -b my-feature；修改一处代码并 commit", "git push origin my-feature；在 GitHub 打开 PR 并写好描述"], duration: "2小时", resources: [R_GIT_BRANCHING], checkpoint: "能在自己的 GitHub 上发出人生第一个 Pull Request" },
      { day: 6, title: "rebase 与交互式整理历史", content: ["git rebase main 把 feature 分支的提交搬移到 main 顶端", "git rebase -i HEAD~3 体验 pick/squash/fixup/edit", "制造一个冲突：git add . + git rebase --continue", "对比 rebase vs merge：何时用哪种？"], duration: "2小时", resources: [R_GIT_SCM], checkpoint: "能用 rebase 把多条 commit 合并成一条整洁历史" },
      { day: 7, title: "git diff / stash / reset / checkout", content: ["修改文件不提交；git diff 查看工作区 vs 暂存区", "git stash push -m 'wip'；git stash list；git stash pop", "git reset --soft HEAD~1；git reset --mixed HEAD~1；git checkout -- file", "丢弃未跟踪文件：git clean -fd"], duration: "1.5小时", resources: [R_GIT_BRANCHING], checkpoint: "能解释 soft/mixed/hard 三种 reset 的区别并各用一次" },
      { day: 8, title: "标签 tag 与发布 Release", content: ["git tag -a v0.1.0 -m '第一次公开发布'；git push origin v0.1.0", "git tag -l 列出标签；git checkout v0.1.0 切到历史快照", "在 GitHub Releases 页面上传二进制/Wheel，写 Changelog", "语义化版本：MAJOR.MINOR.PATCH 的约定"], duration: "1.5小时", resources: [{ title: "语义化版本 2.0", url: "https://semver.org/lang/zh-CN/", required: true }], checkpoint: "能为项目打一个带说明的 tag，并在 GitHub 创建 Release 页面" },
      { day: 9, title: "Code Review 实战（在 PR 上）", content: ["打开自己之前的 PR，用 GitHub Review 在代码行上写 inline comment", "模拟 reviewer 角色：提出 request changes，再 approve", "本地根据 review 做修复 → git push origin my-feature，PR 自动更新", "Squash and merge vs Merge commit vs Rebase and merge 的差异"], duration: "2小时", resources: [{ title: "GitHub Docs: Reviewing changes", url: "https://docs.github.com/cn/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests", required: true }], checkpoint: "有一个自己被 review 过并合并的 PR，记录 review→修复→合并 的完整流程" },
      { day: 10, title: ".gitignore 与大文件策略", content: ["创建 .gitignore：__pycache__/、*.pyc、.vscode/、*.log、data/", "echo 'data/' >> .gitignore；git check-ignore data/foo.txt", "已经误提交大文件：git rm --cached data/big.bin；写入 .gitignore", "理解 Git LFS（可选）：大文件不入库只放元数据"], duration: "1.5小时", resources: [{ title: "gitignore 模板", url: "https://github.com/github/gitignore", required: true }], checkpoint: "项目中不会再出现被意外 commit 的 .pyc / 训练数据 / 日志" },
      { day: 11, title: "子模块 submodule 与大型仓库", content: ["git submodule add https://github.com/xxx/yyy third_party/yyy", "克隆含子模块的仓库：git clone --recurse-submodules", "git submodule update --init --recursive 更新", "何时用 monorepo，何时用 submodule（简要判断）"], duration: "1.5小时", resources: [R_GIT_SCM], checkpoint: "能把一个第三方代码以 submodule 形式引入自己的项目" },
      { day: 12, title: "bisect 定位引入 Bug 的提交", content: ["创建一个含 bug 的小仓库，故意在中间某次提交引入 bug", "git bisect start；git bisect bad HEAD；git bisect good <早期 SHA>", "脚本化检测：git bisect run python -c 'import sys; sys.exit(0 if ... else 1)'", "找到引入 bug 的 commit 后 git bisect reset"], duration: "2小时", resources: [R_GIT_BRANCHING], checkpoint: "能用 git bisect 自动定位到引入 bug 的那次提交" },
      { day: 13, title: "GitHub Actions CI 初体验", content: ["创建 .github/workflows/ci.yml：on push，runs-on ubuntu-latest", "jobs: checkout → setup-python → pip install → pytest", "push 后查看 Actions 页面绿/红日志", "添加 badge 到 README：![CI](https://github.com/you/demo/actions/workflows/ci.yml/badge.svg)"], duration: "2.5小时", resources: [{ title: "GitHub Actions 快速入门", url: "https://docs.github.com/cn/actions/quickstart", required: true }], checkpoint: "在 GitHub Actions 上看到自己项目的第一条绿勾 CI 记录" },
      { day: 14, title: "综合：从零到 PR 的完整协作循环", content: ["新项目初始化：README + requirements.txt + src/main.py + tests", "在 feature 分支写一个函数 + 一个测试，commit 信息规范", "推送到 GitHub，发 PR，邀请一位同学/朋友 review", "根据 review 反馈做一次修改并合并，触发 Actions CI 绿勾"], duration: "3小时", resources: [R_GIT_SCM, R_GIT_BRANCHING], checkpoint: "项目有 README、有至少一个测试、有一个被 review 并合并的 PR、有一条 CI 绿勾" },
    ],
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
    dailyTasks: [
      { day: 1, title: "Docker 核心概念与第一条命令", content: ["安装 Docker（按官方脚本或 apt）；sudo usermod -aG docker $USER 后重新登录", "docker run hello-world；docker ps -a；docker images", "镜像 vs 容器 vs 仓库：镜像=模板，容器=运行实例，仓库=Hub", "docker pull python:3.10-slim；docker run -it --rm python:3.10-slim python -c 'print(\"hi\")'"], duration: "2小时", resources: [R_DOCKER_START], checkpoint: "能在本机跑通 hello-world 容器，并能列出镜像与容器" },
      { day: 2, title: "编写第一个 Dockerfile", content: ["新建 Dockerfile：FROM python:3.10-slim\\nWORKDIR /app\\nCOPY requirements.txt .\\nRUN pip install --no-cache-dir -r requirements.txt\\nCOPY . .\\nCMD [\"python\",\"app.py\"]", "requirements.txt 写 numpy；app.py 写 print('hello docker')", "docker build -t mypy .；docker run --rm mypy", "查看 docker build 缓存层：修改 app.py 重新构建，观察 RUN 层被缓存"], duration: "2小时", resources: [R_DOCKER_BUILD], checkpoint: "能从零写一个含依赖安装的 Dockerfile，build 并成功 run" },
      { day: 3, title: "端口映射与长时服务", content: ["写 app.py：from fastapi import FastAPI；app = FastAPI()；@app.get('/')\ndef hi():\n    return {'ok':1}", "requirements.txt 添加 fastapi uvicorn", "docker build -t myapi .；docker run -d -p 8000:8000 myapi uvicorn app:app --host 0.0.0.0", "curl http://localhost:8000 验证；docker logs <id>；docker stop <id>"], duration: "2小时", resources: [R_FASTAPI], checkpoint: "能在容器内启动一个 HTTP 服务并能从本机 curl 访问" },
      { day: 4, title: "挂载卷 volume 与持久化", content: ["mkdir data；echo 'sample row' > data/log.csv", "docker run --rm -v $PWD/data:/data python:3.10-slim cat /data/log.csv", "docker volume create myvol；docker run -v myvol:/data ...", "临时容器 vs 挂载卷：模型训练日志/数据必须在挂载卷中"], duration: "1.5小时", resources: [R_DOCKER_START], checkpoint: "能在容器中读写宿主机目录中的数据文件" },
      { day: 5, title: "多阶段构建缩小镜像", content: ["写一个两阶段 Dockerfile：FROM python:3.10-slim AS builder；RUN pip wheel --wheel-dir /wheels numpy", "第二阶段 FROM python:3.10-slim；COPY --from=builder /wheels /wheels；RUN pip install --no-cache-dir /wheels/*.whl", "对比单阶段 vs 两阶段镜像大小：docker images | grep mypy", "减少攻击面：仅保留 runtime 依赖"], duration: "2小时", resources: [R_DOCKER_BUILD], checkpoint: "两阶段构建出的镜像比单阶段显著更小（可量化）" },
      { day: 6, title: "Docker Compose 多容器编排", content: ["写 docker-compose.yml：services: web, redis。web 用刚才的镜像，暴露 8000；redis 用 redis:alpine", "在 app.py 中 import redis 连接 redis://redis:6379 做简单计数", "docker compose up -d；curl http://localhost:8000", "docker compose logs -f；docker compose down"], duration: "2小时", resources: [{ title: "Compose 入门", url: "https://docs.docker.com/compose/gettingstarted/", required: true }], checkpoint: "能用 compose 启动 2 个互相通信的容器并看到效果" },
      { day: 7, title: "环境变量、.env 与健康检查", content: ["在 compose 中使用 environment: DB_HOST=redis；或 env_file: .env", "创建 .env 文件：DB_HOST=redis，DB_PORT=6379", "在 Dockerfile 中加 HEALTHCHECK --interval=30s CMD curl -f http://localhost:8000/ || exit 1", "docker ps 看 STATUS 列的 healthy 状态"], duration: "1.5小时", resources: [R_DOCKER_BUILD], checkpoint: "容器能读取外部 env，并在 docker ps 中显示 healthy" },
      { day: 8, title: "nvidia-docker 与 GPU 容器", content: ["安装 nvidia-container-toolkit（按 NVIDIA 官方脚本）；sudo systemctl restart docker", "验证：docker run --rm --gpus all nvidia/cuda:12.1.0-base-ubuntu22.04 nvidia-smi", "拉 PyTorch 官方镜像：pytorch/pytorch:2.1.2-cuda12.1-cudnn8-runtime", "docker run --gpus all -it --rm pytorch/pytorch:2.1.2-cuda12.1-cudnn8-runtime python -c 'import torch; print(torch.cuda.is_available())'"], duration: "2.5小时", resources: [{ title: "NVIDIA Container Toolkit", url: "https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html", required: true }], checkpoint: "能在 GPU 容器中跑出 True，说明 CUDA 可访问" },
      { day: 9, title: "构建 ML 训练镜像", content: ["写 Dockerfile：基于 nvidia/cuda 或 pytorch/pytorch runtime", "WORKDIR /workspace；COPY requirements.txt .；RUN pip install -r requirements.txt；COPY . .", "docker build -t train:v1 .；docker run --gpus all -v $PWD/data:/data train:v1 python train.py", "进入容器调试：docker run --gpus all -it --rm train:v1 bash"], duration: "2.5小时", resources: [R_DOCKER_BUILD, R_PYTORCH_DOC], checkpoint: "能把自己的 PyTorch 训练脚本封装成镜像并在 GPU 容器中跑起来" },
      { day: 10, title: "私有仓库与镜像推送", content: ["在 Docker Hub 或自建 registry 上建仓库：you/train", "docker tag train:v1 you/train:v1；docker login；docker push you/train:v1", "在另一台机器：docker pull you/train:v1；docker run ...", "可选：Harbor / GitHub Container Registry (ghcr.io)"], duration: "1.5小时", resources: [R_DOCKER_START], checkpoint: "能把本地构建的镜像 push 到远程仓库并从别处 pull 下来" },
      { day: 11, title: "容器网络与多容器通信", content: ["docker network ls；docker network inspect bridge", "在 compose 中两个服务用服务名互访：web 访问 redis://redis:6379", "自定义网络：networks: { backend: {} }，并让 web + redis 都挂到 backend", "对比 host 模式、bridge 模式、none 模式的使用场景"], duration: "1.5小时", resources: [R_DOCKER_START], checkpoint: "能在一个 compose 中让两个容器通过服务名而不是 IP 通信" },
      { day: 12, title: "安全：非 root 用户与权限", content: ["在 Dockerfile 中创建用户：RUN useradd -m -u 1000 appuser；USER appuser", "COPY --chown=appuser:appuser . .", "启动容器后 docker exec -it <id> id 查看 uid", "理解 docker -u 指定用户，避免以 root 写数据导致宿主机权限问题"], duration: "1.5小时", resources: [R_DOCKER_BUILD], checkpoint: "容器内进程以非 root 用户运行，并且写回宿主机目录的文件权限正常" },
      { day: 13, title: "CI/CD 构建镜像与 Actions", content: [".github/workflows/docker.yml：on push tags v*, jobs 中 checkout + setup-buildx + login + build-push", "使用 docker/metadata-action 自动生成标签", "推送到 ghcr.io/you/train:latest", "本地 docker pull ghcr.io/you/train:latest 验证"], duration: "2.5小时", resources: [{ title: "Docker Build Push Action", url: "https://github.com/marketplace/actions/build-and-push-docker-images", required: true }], checkpoint: "在 GitHub Actions 中自动 build 镜像并 push 到 ghcr.io" },
      { day: 14, title: "综合：模型推理服务端到端容器化", content: ["写一个 FastAPI 推理服务：POST /predict 接收图片并返回分类结果", "使用 torchvision ResNet50 做 demo，或 YOLOv8 做目标检测", "写 Dockerfile + docker-compose，暴露 8000", "push 到 ghcr.io，并在另一台机器 docker compose up 直接拉起服务"], duration: "3小时", resources: [R_FASTAPI, R_DOCKER_BUILD, R_ULTRALYTICS], checkpoint: "一条 docker compose up -d 即可在任意机器启动推理 API 并可用 curl 调用" },
    ],
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
    dailyTasks: [
      { day: 1, title: "向量与基本运算", content: ["import numpy as np; a = np.array([1,2,3]); b = np.array([4,5,6])", "print(a + b, a * b, np.dot(a, b), np.linalg.norm(a))", "向量夹角：cosθ = a·b / (|a||b|)；np.arccos(np.dot(a,b)/(np.linalg.norm(a)*np.linalg.norm(b)))", "单位向量 u = a / np.linalg.norm(a)；验证 ||u||≈1"], duration: "1.5小时", resources: [R_NUMPY, R_3B1B_LIN], checkpoint: "能做向量加法、点积、范数、夹角计算，并解释几何意义" },
      { day: 2, title: "矩阵与矩阵乘法", content: ["A = np.random.randn(3, 4); B = np.random.randn(4, 5); C = A @ B; print(C.shape)", "手算验证第一行第一列：sum(A[0,:] * B[:,0])，与 C[0,0] 比较", "转置与对称：(A @ A.T) 一定是方阵且对称", "矩阵乘法不满足交换律：构造反例证明 AB ≠ BA"], duration: "1.5小时", resources: [R_NUMPY], checkpoint: "能解释 (m,k) @ (k,n) = (m,n) 的维度规则并手算一个 2x2 实例" },
      { day: 3, title: "广播 Broadcasting", content: ["a = np.array([1,2,3]); b = 2; print(a + b) 标量扩展", "A = np.random.randn(3, 1); B = np.random.randn(1, 4); A + B 的形状是？", "对图像做通道归一化：(H,W,3) - (3,) 广播", "何时会报 'shapes not aligned'：构造一个报错并修复"], duration: "1.5小时", resources: [R_NUMPY], checkpoint: "能预测两个 ndarray 做广播后的形状，并写出一个实际图像归一化的例子" },
      { day: 4, title: "逆矩阵、秩与线性方程组", content: ["A = np.random.randn(3,3); b = np.random.randn(3); x = np.linalg.solve(A, b)", "验证 A @ x ≈ b；用 np.linalg.inv(A) @ b 对比", "构造一个奇异矩阵：rank(A) < n，np.linalg.solve 报错", "np.linalg.matrix_rank(A) 与条件数 np.linalg.cond(A)"], duration: "1.5小时", resources: [R_NUMPY], checkpoint: "能解一个 3×3 线性方程组并判断矩阵是否可逆" },
      { day: 5, title: "特征值与特征向量", content: ["A = np.array([[2,1],[1,2]]); w, v = np.linalg.eig(A)", "验证 A @ v[:,i] ≈ w[i] * v[:,i]", "对称矩阵特征向量正交：v.T @ v 是否接近 diag？", "可视化：绘制变换前后向量方向"], duration: "1.5小时", resources: [R_3B1B_LIN], checkpoint: "能数值求出 2×2 对称矩阵的特征分解并验证 Av=λv" },
      { day: 6, title: "矩阵分解：LU 与 QR", content: ["from scipy.linalg import lu, qr; A = np.random.randn(4,4)", "P, L, U = lu(A); 验证 P @ A ≈ L @ U", "Q, R = qr(A); 验证 Q 正交（Q.T @ Q ≈ I），R 为上三角", "用 QR 解最小二乘：min ||Ax - b||"], duration: "1.5小时", resources: [R_NUMPY], checkpoint: "能完成一次 LU 与 QR 分解，并验证其数值正确性" },
      { day: 7, title: "SVD 奇异值分解", content: ["A = np.random.randn(5, 7); U, S, Vt = np.linalg.svd(A, full_matrices=False)", "验证 A ≈ U @ np.diag(S) @ Vt", "取前 k=3 个奇异值重建 A_k，计算近似误差 ||A - A_k||_F", "S 按降序排列，plot(S) 观察奇异值衰减"], duration: "2小时", resources: [R_3B1B_LIN], checkpoint: "能对一张灰度图做 SVD 低秩重建，并比较不同 k 的视觉效果" },
      { day: 8, title: "图像 SVD 压缩实战", content: ["from PIL import Image; img = Image.open('demo.jpg').convert('L'); arr = np.array(img, dtype=float)", "对 arr 做 np.linalg.svd；分别用 10/30/100 个奇异值重建", "计算压缩比 = k*(m+n+1) / (m*n)", "保存重建图像，肉眼对比清晰度"], duration: "2小时", resources: [R_NUMPY], checkpoint: "产出 3 张不同 k 值重建的图像，并说明 SVD 与低秩近似的直观意义" },
      { day: 9, title: "主成分分析 PCA", content: ["X = np.random.randn(100, 5); X -= X.mean(axis=0); cov = X.T @ X / (len(X)-1)", "w, v = np.linalg.eigh(cov); 取 top-2 个特征向量", "proj = X @ v[:, -2:]; plot 2D 散点图", "用 sklearn.decomposition.PCA 做对比，结果一致"], duration: "2小时", resources: [{ title: "sklearn PCA", url: "https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html", required: true }], checkpoint: "能从零实现 PCA 并把 5 维数据投影到 2 维可视化" },
      { day: 10, title: "最小二乘与线性回归的矩阵形式", content: ["X = np.random.randn(100, 3); true_w = np.array([1, -2, 0.5]); y = X @ true_w + 0.1*np.random.randn(100)", "最小二乘闭式解：w_hat = np.linalg.inv(X.T @ X) @ X.T @ y", "对比 np.linalg.lstsq 与 sklearn LinearRegression", "计算残差 r = y - X@w_hat；残差平方和"], duration: "1.5小时", resources: [R_NUMPY], checkpoint: "能用矩阵形式手动推导并实现一个线性回归，与库函数结果一致" },
      { day: 11, title: "PyTorch 中的张量与矩阵", content: ["import torch; A = torch.randn(4, 3); B = torch.randn(3, 5); C = A @ B; print(C.shape)", "torch.transpose / torch.permute；view vs reshape", "对一批图像 (B,3,H,W) 做矩阵变形 = (B, 3*H*W) 再喂给线性层", "梯度：x = torch.randn(2,2, requires_grad=True); loss = (x*x).sum(); loss.backward(); print(x.grad)"], duration: "2小时", resources: [R_PYTORCH_DOC], checkpoint: "能在 PyTorch 中做矩阵变形与自动求导" },
      { day: 12, title: "线性变换与神经网络的几何直觉", content: ["考虑 y = ReLU(Wx + b)，分三步：线性 → 平移 → 非线性", "二维输入：构造一个 W，绘制网格点被变换后的形态", "加 ReLU 观察某些半空间被折叠为 0 的几何效果", "思考：为什么多层 + 非线性可以拟合任意决策边界"], duration: "1.5小时", resources: [R_3B1B_LIN, R_D2L], checkpoint: "能用一张 2D 网格图可视化说明单层线性变换 + ReLU 的几何作用" },
      { day: 13, title: "矩阵微积分：反向传播的数学", content: ["若 L = (1/2)||Wx - y||²，求 dL/dW 和 dL/dx", "用标量对矩阵求导公式推导", "在 NumPy 中实现：手动计算梯度 vs 用 finite difference 检查", "计算 PyTorch autograd 结果与手动推导一致"], duration: "2小时", resources: [R_D2L], checkpoint: "能手动推导线性回归 L2 损失对权重 W 的梯度，并数值验证" },
      { day: 14, title: "综合：实现一个两层 MLP 的前向 + 反向传播", content: ["输入 X∈R^{N×d0}；Linear1 d0→d1，ReLU，Linear2 d1→C，Softmax，Cross Entropy", "用 NumPy 手写前向；用 autograd 对比梯度", "在二分类玩具数据上训练 200 步，画出 loss 下降曲线", "梯度检查：||grad_analytical - grad_numerical|| / ||...|| < 1e-5"], duration: "3小时", resources: [R_NUMPY, R_PYTORCH_DOC, R_D2L], checkpoint: "能用纯 NumPy 实现 MLP，并通过梯度检查，loss 稳定下降" },
    ],
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
    dailyTasks: [
      { day: 1, title: "常见分布：均匀、正态、伯努利", content: ["import numpy as np; a = np.random.uniform(0, 1, 10000)", "b = np.random.normal(0, 1, 10000); c = np.random.binomial(1, 0.7, 10000)", "绘制直方图：import matplotlib.pyplot as plt; plt.hist(b, bins=50, density=True); plt.show()", "计算样本均值与方差，对比理论值 μ=0, σ²=1"], duration: "1.5小时", resources: [R_NUMPY], checkpoint: "能从均匀/正态/伯努利采样并画出直方图" },
      { day: 2, title: "泊松、指数与 Beta", content: ["np.random.poisson(lam=3, size=5000); np.random.exponential(scale=2, size=5000)", "np.random.beta(a=2, b=5, size=5000)；画图观察形状随 a,b 变化", "用 scipy.stats.norm.fit(b) 拟合正态分布参数", "p(x|μ,σ²) 的公式与对数似然"], duration: "1.5小时", resources: [{ title: "scipy.stats", url: "https://docs.scipy.org/doc/scipy/reference/stats.html", required: true }], checkpoint: "能说明 Beta 分布先验如何影响后验" },
      { day: 3, title: "期望、方差、协方差与相关系数", content: ["E[aX+bY] = aE[X]+bE[Y]; Var(X) = E[X²]-E[X]²", "数据 X: N(0,1), Y = 2X + noise；np.cov(X,Y)", "相关系数 ρ = cov / (σx·σy)；np.corrcoef(X, Y)", "散点图 + 回归直线"], duration: "1.5小时", resources: [R_NUMPY], checkpoint: "能计算一组样本的协方差矩阵并解释对角线含义" },
      { day: 4, title: "中心极限定理直观", content: ["对均匀分布做 n=100 次独立抽样取均值，重复 10000 次", "绘制均值分布直方图——应当接近正态", "增大 n 观察峰值变窄；减小 n 观察偏离", "推导：均值方差 = σ²/n"], duration: "1.5小时", resources: [R_NUMPY], checkpoint: "能用模拟说明：均匀分布的样本均值渐近正态" },
      { day: 5, title: "贝叶斯公式与后验更新", content: ["疾病检测：患病率 1%，灵敏度 99%，特异度 99%，阳性 → 真正患病概率？", "P(A|B) = P(B|A)P(A)/P(B)；手动算一遍", "Beta-Binomial 共轭：先验 Beta(2,2)，观察 10 次实验 8 正 → 后验 Beta(10,4)", "画图：先验 vs 似然 × 先验 ∝ 后验"], duration: "2小时", resources: [{ title: "Bayes' Rule 直觉", url: "https://www.youtube.com/results?search_query=bayes+theorem+intuition", required: false }], checkpoint: "能算出疾病检测例子中阳性真正患病的概率（约 50%）" },
      { day: 6, title: "最大似然估计 MLE", content: ["对正态样本 x_1..x_n，推导 MLE：μ_hat = mean, σ²_hat = mean((x-μ)^2)", "写代码：对 np.random.normal(3, 2, n=200) 估计 μ, σ，与真值比较", "对伯努利：p_hat = positives / total", "似然函数取对数后求导 = 0 的直观"], duration: "1.5小时", resources: [R_NUMPY], checkpoint: "能从零用 NumPy 实现正态分布两参数的 MLE" },
      { day: 7, title: "置信区间", content: ["样本均值 ± 1.96 * σ/√n（正态近似）", "bootstrapping：从样本中重采样 B=1000 次，取分位数 [2.5%, 97.5%]", "画图：不同 B 下置信区间如何收敛", "对比 t 分布与正态分布（n 小时用 t）"], duration: "1.5小时", resources: [R_NUMPY], checkpoint: "能用 bootstrap 法给出样本均值的 95% 置信区间" },
      { day: 8, title: "假设检验与 p 值", content: ["t 检验：两个模型的准确率样本，比较均值是否显著不同", "from scipy.stats import ttest_ind; t, p = ttest_ind(scores_A, scores_B)", "p < 0.05 的含义：若零假设成立，出现当前或更极端结果的概率 ≤ 5%", "警惕 p-hacking：多次检验 → 修正（Bonferroni / FDR）"], duration: "2小时", resources: [{ title: "scipy.stats.ttest_ind", url: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_ind.html", required: true }], checkpoint: "能对两个模型在同一测试集上的 10 次运行做 t 检验并下结论" },
      { day: 9, title: "信息熵、交叉熵、KL 散度", content: ["熵 H(p) = -Σ p log p；对二项式 p=0.5 计算 H=log2=1 bit", "交叉熵 H(p,q) = -Σ p log q；H(p,q) = H(p) + KL(p||q)", "代码：p = [0.1,0.4,0.5]; q = [0.2,0.3,0.5]; H = -np.sum(p*np.log(p)); CE = -np.sum(p*np.log(q)); KL = np.sum(p*np.log(p/q))", "验证 CE = H + KL"], duration: "1.5小时", resources: [R_D2L], checkpoint: "能手写交叉熵并解释它为何可作为分类损失" },
      { day: 10, title: "Softmax + Cross Entropy：分类损失的推导", content: ["logits z ∈ R^C；softmax(z)_i = exp(z_i)/Σ exp(z_j)", "one-hot 真值 y，loss = -log softmax(z)_y", "实现稳定版：减去 max(z) 防止 exp 溢出", "对 z 求梯度：softmax(z) - one_hot(y)"], duration: "2小时", resources: [R_PYTORCH_DOC], checkpoint: "能手写稳定的 softmax + cross entropy，并验证其梯度与 PyTorch 一致" },
      { day: 11, title: "蒙特卡洛积分与重要性采样", content: ["估计 ∫_0^1 sin(x) dx，用 uniform 采样均值：mean(sin(X))", "重要性采样：用更接近被积函数形状的 proposal 分布 q(x)", "估计 π：在单位正方形内随机点，落在圆内比例 × 4", "对比不同 proposal 的方差"], duration: "1.5小时", resources: [R_NUMPY], checkpoint: "能用 MC 估计 π 到小数点后两位，并说明样本量与精度关系" },
      { day: 12, title: "A/B 测试与模型对比", content: ["两个模型在同一测试集得到 acc_A=0.85±0.01，acc_B=0.87±0.01", "用正态近似做 z 检验或 bootstrap 做显著性检验", "画出两个模型在 20 次随机 seed 下的准确率箱线图", "何时统计显著但工程上不重要（提升太小）"], duration: "2小时", resources: [{ title: "Bootstrap 教程", url: "https://en.wikipedia.org/wiki/Bootstrapping_(statistics)", required: false }], checkpoint: "能在一组实验上判断 B 是否统计显著优于 A" },
      { day: 13, title: "正则化的贝叶斯视角", content: ["L2 正则 = Gaussian prior N(0, σ²) 下的 MAP 估计", "L1 正则 = Laplace 先验 → 倾向稀疏权重", "用小线性回归实验：比较 MLE vs MAP 权重差异", "权重分布图：L1 更集中在 0"], duration: "1.5小时", resources: [R_D2L], checkpoint: "能解释 L2/L1 正则项对应哪种先验分布" },
      { day: 14, title: "综合：用交叉熵与 t 检验对比两个分类器", content: ["数据集：sklearn 的 digits 或 make_classification", "模型 A: Logistic Regression；模型 B: Random Forest", "做 10 折交叉验证，记录每一折的交叉熵 loss 与 accuracy", "用配对 t 检验判断 B 的 loss 是否显著低于 A；画出 loss 分布图"], duration: "3小时", resources: [R_NUMPY, { title: "sklearn cross_val_score", url: "https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.cross_val_score.html", required: true }], checkpoint: "产出一次完整的实验：loss/acc 数值 + 统计检验 + 可视化结论" },
    ],
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
    dailyTasks: [
      { day: 1, title: "Tensor 创建与在设备间迁移", content: ["import torch; x = torch.tensor([1,2,3]); y = torch.randn(3,4)", "torch.zeros(2,3); torch.ones(2,3); torch.eye(3); torch.arange(0,10)", "device = 'cuda' if torch.cuda.is_available() else 'cpu'; x = x.to(device)", "类型转换：x.float(), x.long(), x.dtype；计算 torch.cuda.device_count()"], duration: "1.5小时", resources: [R_PYTORCH_DOC], checkpoint: "能在 CPU/GPU 上创建 tensor，并完成类型转换与 device 迁移" },
      { day: 2, title: "索引、切片、reshape、permute", content: ["img = torch.randn(3, 32, 32); 取 img[:, 8:24, 8:24] 切中心", "img.view(-1, 32*32)；img.reshape(1,3,32,32)", "batch = torch.randn(8, 3, 32, 32); batch.permute(0,2,3,1).shape → (8,32,32,3)", "torch.gather / torch.scatter 基础使用"], duration: "1.5小时", resources: [R_PYTORCH_TUT], checkpoint: "能把 (B,C,H,W) 的 batch 变形为 (B,H,W,C) 并恢复回去" },
      { day: 3, title: "自动微分 autograd", content: ["x = torch.randn(2,2, requires_grad=True); y = (x**2).sum(); y.backward(); print(x.grad)", "对比：手动梯度 = 2*x 应与 x.grad 一致", "torch.no_grad()：推理阶段关闭梯度节省显存", "detach()：把 tensor 从计算图中剥离（统计/EMA）"], duration: "1.5小时", resources: [R_PYTORCH_DOC], checkpoint: "能手算并验证一个标量 loss 对输入 tensor 的梯度" },
      { day: 4, title: "nn.Module 与自定义层", content: ["class MyLinear(nn.Module): def __init__(self,in,out): super().__init__; self.W=nn.Parameter(torch.randn(in,out)); def forward(self,x): return x @ self.W", "对比 nn.Linear 官方实现（带 bias）", "summary：model = nn.Sequential(MyLinear(10,32), nn.ReLU(), nn.Linear(32,2)); print(model)", "list(model.parameters()) 与 model.state_dict().keys()"], duration: "2小时", resources: [R_PYTORCH_TUT], checkpoint: "能从零实现一个线性层并与 nn.Linear 数值对齐" },
      { day: 5, title: "Dataset 与 DataLoader", content: ["from torch.utils.data import Dataset, DataLoader; class MyData(Dataset): def __len__(self): return N; def __getitem__(self,i): return X[i], y[i]", "DataLoader(ds, batch_size=32, shuffle=True, num_workers=2)", "iter(dataloader).__next__() 拿到一个 batch；print(shape)", "自定义 collate_fn：处理变长序列"], duration: "2小时", resources: [R_PYTORCH_DOC], checkpoint: "能为一个 NumPy 数组封装 Dataset，用 DataLoader 出 batch" },
      { day: 6, title: "优化器与学习率调度", content: ["optimizer = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9)", "optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)", "scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)", "训练循环：optimizer.zero_grad(); loss.backward(); optimizer.step(); scheduler.step()"], duration: "1.5小时", resources: [R_PYTORCH_TUT], checkpoint: "能写出一个完整的 epoch 训练循环，loss 每 epoch 下降" },
      { day: 7, title: "训练/验证闭环 + TensorBoard", content: ["分割 train/val：torch.utils.data.random_split(dataset, [n_train, n_val])", "for epoch: train one epoch → eval one epoch → log loss/acc", "with torch.no_grad(): 模型 .eval() 模式；完成后 .train()", "from torch.utils.tensorboard import SummaryWriter；writer.add_scalar('Loss/train', loss, step)"], duration: "2.5小时", resources: [R_PYTORCH_TUT], checkpoint: "能跑 MNIST 3 层 MLP，在 TensorBoard 看到训练 loss 下降" },
      { day: 8, title: "模型保存/加载与恢复训练", content: ["torch.save({'epoch': e, 'model': model.state_dict(), 'optim': optimizer.state_dict()}, 'ckpt.pt')", "加载：ck = torch.load('ckpt.pt', weights_only=True); model.load_state_dict(ck['model']); optimizer.load_state_dict(ck['optim'])", "推理保存：torch.save(model.state_dict(), 'weights.pt') 仅存权重", "权重初始化：Xavier / Kaiming / torch.nn.init.kaiming_normal_"], duration: "1.5小时", resources: [R_PYTORCH_DOC], checkpoint: "能保存 checkpoint 并在中断后从第 5 轮继续训练到第 10 轮" },
      { day: 9, title: "混合精度 AMP", content: ["from torch.cuda.amp import autocast, GradScaler; scaler = GradScaler()", "训练循环中：with autocast(): loss = criterion(model(x), y); scaler.scale(loss).backward(); scaler.step(optimizer); scaler.update()", "对比 fp32 训练：显存占用 ~1/2，速度通常更快", "注意：有些 op（如 LayerNorm）在 fp16 不稳定需要 fp32"], duration: "2小时", resources: [R_PYTORCH_DOC], checkpoint: "在一个 ResNet18 小任务上成功开启 AMP，loss 正常下降" },
      { day: 10, title: "torch.compile 加速", content: ["model = torch.compile(model, mode='default')  # PyTorch 2.x", "在训练循环第一次迭代会慢（编译），后续提速", "对比 compile 前后吞吐量（samples/s）", "限制：动态 shape / 自定义 C++ op 可能无法编译"], duration: "1.5小时", resources: [R_PYTORCH_DOC], checkpoint: "在一个可复现的脚本中，开启 compile 后观察到 step/s 提升" },
      { day: 11, title: "多卡 DataParallel（单机多卡）", content: ["model = nn.DataParallel(model).cuda()；数据 batch = x.cuda()", "注意：DataParallel 在单进程中跑多 GPU，主卡显存压力大", "多进程：DistributedDataParallel（DDP）基础框架", "训练脚本结构：torch.distributed.init_process_group(backend='nccl')；用 torchrun 启动"], duration: "2小时", resources: [R_PYTORCH_DOC], checkpoint: "能在单机双卡上用 DDP 跑 MNIST，两张卡利用率都非 0" },
      { day: 12, title: "Accelerate 库简化分布式", content: ["pip install accelerate; from accelerate import Accelerator; accelerator = Accelerator()", "model, optimizer, dataloader, lr_scheduler = accelerator.prepare(model, optimizer, dataloader, scheduler)", "训练循环内：accelerator.backward(loss) 替代 loss.backward()", "一个脚本在 CPU、单卡、多卡上均能跑"], duration: "2小时", resources: [{ title: "Accelerate 文档", url: "https://huggingface.co/docs/accelerate/", required: true }], checkpoint: "能把前一天的 DDP 脚本用 accelerate 改写，代码量显著减少" },
      { day: 13, title: "训练技巧：梯度裁剪、累积、正则", content: ["torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)", "梯度累积：每 accumulation_steps 次 backward 后一次 optimizer.step", "权重衰减（AdamW 的 weight_decay）等效 L2 正则", "Dropout：nn.Dropout(p=0.2) 在 FC 层之间使用"], duration: "1.5小时", resources: [R_PYTORCH_TUT], checkpoint: "能在脚本中同时使用 gradient clipping + 梯度累积，并观察训练稳定" },
      { day: 14, title: "综合：从零训练 CIFAR-10", content: ["使用 torchvision.datasets.CIFAR10 + transforms 做数据增强", "模型：自实现的小 ResNet（3 个残差块）或 torchvision.models.resnet18(weights=None)", "训练 20 epoch，AMP，记录 train/val loss、acc", "保存最佳 val_acc 权重；在 tensorboard 展示 loss 曲线 + 预测样例图像"], duration: "3小时", resources: [R_PYTORCH_TUT, R_D2L], checkpoint: "val_acc ≥ 80%（合理基线）；训练日志/权重文件都能产出" },
    ],
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
    dailyTasks: [
      { day: 1, title: "卷积操作与感受野", content: ["import torch; import torch.nn.functional as F", "构造一个 3×3 核：k = torch.tensor([[[-1.,0,1],[-1,0,1],[-1,0,1]]]).unsqueeze(0)", "对灰度图做 F.conv2d(img, k, padding=1)；画出响应图", "手写公式：H' = (H + 2P - K) // S + 1；核对输出 shape"], duration: "2小时", resources: [R_CS231N], checkpoint: "能手工计算给定输入 shape、kernel、stride、padding 时的输出 shape" },
      { day: 2, title: "多通道卷积与 1×1 卷积", content: ["nn.Conv2d(in_channels=3, out_channels=16, kernel_size=3, padding=1)", "参数量 = out * in*K*K + out（bias）；对 3×3 Conv2d(3,16,3) = 16*3*9+16 = 448", "1×1 卷积：跨通道线性组合；用于降维（MobileNet/ResNet）", "计算一个模块的 FLOPs 近似（手动估算一个 block）"], duration: "2小时", resources: [R_CS231N], checkpoint: "能计算一个 Conv2d 层的参数量与输出 shape" },
      { day: 3, title: "LeNet-5：第一个经典 CNN", content: ["手搭 LeNet：conv(1,6,5)→tanh→pool→conv(6,16,5)→tanh→pool→FC→softmax", "在 MNIST 上训练：transforms.ToTensor()", "训练 5 epoch，观察 train/val 准确率", "对比 1998 年 LeCun 的原始结果"], duration: "2小时", resources: [R_D2L], checkpoint: "能在 MNIST 上跑自己实现的 LeNet，val_acc > 97%" },
      { day: 4, title: "AlexNet 与 ReLU/数据增强", content: ["简化版 AlexNet：5 conv + 3 FC，ReLU + MaxPool + Dropout", "在 CIFAR-10 上训练（图像 32×32，需调整 stride）", "数据增强：RandomCrop + RandomHorizontalFlip + Normalize", "观察：不加增强过拟合，加增强泛化提升"], duration: "2小时", resources: [R_CS231N], checkpoint: "能在 CIFAR-10 上训练一个小型 AlexNet，val_acc > 70%" },
      { day: 5, title: "VGG：小卷积核堆叠", content: ["VGG-11 的结构：多轮 [conv3×3, ReLU, MaxPool]，通道倍增", "VGG 参数量大，计算量大，但结构简洁", "实现一个简化的 VGG-like，在 CIFAR-10 上训练", "对比 LeNet/AlexNet 的训练时间与精度"], duration: "2小时", resources: [R_CS231N], checkpoint: "能从零实现 VGG-11（简化版）并在 CIFAR 上训练" },
      { day: 6, title: "残差连接与 ResNet", content: ["class ResBlock(nn.Module): def forward(self,x): return x + self.conv(x)", "为什么残差有效：梯度能直接沿 skip-connection 回传", "实现 ResNet-18：stem + 4 个 stage + avgpool + FC", "初始化：kaiming_normal_"], duration: "2.5小时", resources: [{ title: "ResNet 论文", url: "https://arxiv.org/abs/1512.03385", required: true }], checkpoint: "能从零实现 ResNet-18，并在 CIFAR-10 上达到 val_acc > 85%" },
      { day: 7, title: "BatchNorm / LayerNorm 与训练稳定性", content: ["nn.BatchNorm2d(num_features) 在 conv 后使用；running_mean/var 更新", "冻结 BN：model.eval() 或手动 track_running_stats=False", "LayerNorm：对最后一维做归一化（NLP/ViT 常用）", "实验：去除 BN 后训练是否更不稳定？"], duration: "1.5小时", resources: [R_PYTORCH_DOC], checkpoint: "能解释 BN 在训练/推理阶段的行为差异" },
      { day: 8, title: "迁移学习：预训练 ResNet", content: ["from torchvision import models; model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)", "替换 FC：model.fc = nn.Linear(512, N_CLASSES)", "策略：(1) 冻结 backbone 只训 FC → (2) 解冻整体微调", "比较两种策略收敛速度与最终精度"], duration: "2.5小时", resources: [R_PYTORCH_TUT], checkpoint: "在小型自定义数据集（比如 10 类图片）上，用迁移学习 val_acc > 随机初始化" },
      { day: 9, title: "可视化训练中的 filters 与特征图", content: ["model.conv1.weight 形状 (64,3,7,7)；把前 64 个 3×7×7 核中的前 3 通道当 7×7 图像画出来", "hook 中间层输出：forward hook 记录 activation", "对单张图，画出各层 activation 的若干通道", "卷积神经网络学到的是从边→纹理→图案→物体的层次特征"], duration: "2小时", resources: [R_CS231N], checkpoint: "能画出某个卷积核组和一张图片经过它后的响应图" },
      { day: 10, title: "Grad-CAM：定位分类响应区域", content: ["用 hook 记录 target layer 的 feature map 与梯度", "alpha = gradients.mean(dim=(2,3))；cam = F.relu((alpha.unsqueeze(-1).unsqueeze(-1) * activations).sum(dim=1))", "cam 上采样到原图尺寸；heatmap 叠加在原图上可视化", "对比：目标类别为 A 时 vs 类别为 B 时 heatmap 不同"], duration: "2.5小时", resources: [{ title: "Grad-CAM", url: "https://arxiv.org/abs/1610.02391", required: false }], checkpoint: "能对一张输入图片生成目标类别的 Grad-CAM 热图并可视化" },
      { day: 11, title: "t-SNE / UMAP 嵌入可视化", content: ["提取模型 fc 前一层的 512 维特征用于所有测试样本", "from sklearn.manifold import TSNE; 2D 投影", "用不同颜色画每个类的点，聚类明显说明 embedding 有判别性", "对比训练早期 vs 训练完成的嵌入形态"], duration: "2小时", resources: [{ title: "sklearn TSNE", url: "https://scikit-learn.org/stable/modules/generated/sklearn.manifold.TSNE.html", required: true }], checkpoint: "能画出 2D t-SNE 散点图，同类样本聚类明显" },
      { day: 12, title: "MobileNet / 深度可分离卷积", content: ["Depthwise Conv：对每个通道单独 3×3；Pointwise Conv：1×1 跨通道组合", "参数量与标准卷积的比值：1/out + 1/K² ≈ 很小", "实现一个 DepthwiseSeparableConv2d 模块", "对比 MobileNet vs ResNet-18 在 CIFAR-10 上的参数量与精度"], duration: "2小时", resources: [{ title: "MobileNets", url: "https://arxiv.org/abs/1704.04861", required: true }], checkpoint: "能用深度可分离卷积构建一个轻量模型，参数量显著小于 ResNet-18" },
      { day: 13, title: "数据增强与 TTA", content: ["transforms.RandomResizedCrop, ColorJitter, RandomErasing, RandAugment", "TTA（Test-Time Augmentation）：同一张图的多次裁剪翻转输出取均值", "对比 baseline vs TTA 的 val_acc", "Cutout / Mixup / CutMix（概念 + 实现思路）"], duration: "2小时", resources: [R_PYTORCH_TUT], checkpoint: "能在推理时启用 TTA，val_acc 相对 baseline 提升" },
      { day: 14, title: "综合：图像分类小比赛", content: ["从 Kaggle 或公开数据选一个 ≤10 类的图像数据集", "对比 ResNet-18（从头训）vs ResNet-18（预训练迁移）vs MobileNetV3", "训练策略：CosineLR + AdamW + 数据增强 + TTA", "报告：参数量、训练耗时、val_acc；用 Grad-CAM 画两张典型失败样本的热图分析"], duration: "3小时", resources: [R_CS231N, R_PYTORCH_TUT], checkpoint: "产出完整实验报告：模型对比表 + 可视化 + 失败样本分析" },
    ],
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
    dailyTasks: [
      { day: 1, title: "目标检测任务与边界框", content: ["理解 Pascal VOC (xmin,ymin,xmax,ymax) 与 YOLO (cx,cy,w,h) 格式", "写一个转换函数 yolo ↔ voc", "可视化：在一张图上用 PIL/OpenCV 画出 gt bbox（红色矩形 + 类别文本）", "随机生成若干 bbox，计算并绘制"], duration: "1.5小时", resources: [R_ULTRALYTICS], checkpoint: "能读取 YOLO 格式的标注并画到图片上" },
      { day: 2, title: "IoU 与 NMS", content: ["手写 IoU：inter = max(min(x2)...) / union = area1+area2-inter", "对一组重叠 bbox 做贪心 NMS：按置信度排序 → 抑制 IoU>thresh 的冗余框", "写脚本验证：一组 bbox + 不同 NMS threshold 输出数量差异", "Soft-NMS / DIoU-NMS 的概念（改进思路）"], duration: "2小时", resources: [R_ULTRALYTICS], checkpoint: "能独立实现 IoU 与朴素 NMS，并在合成数据上跑通" },
      { day: 3, title: "mAP 指标理解", content: ["对每个类别按置信度排序 → 计算 PR 曲线 → 11 点插值 / 连续积分得到 AP", "mAP@0.5 与 mAP@0.5:0.95 的差别", "用 pycocotools 计算：from pycocotools.coco import COCO; from pycocotools.cocoeval import COCOeval", "手动造小例子，验证 mAP 随 bbox 质量变化的直觉"], duration: "2小时", resources: [{ title: "pycocotools", url: "https://github.com/cocodataset/cocoapi", required: true }], checkpoint: "能解释 mAP 与准确率的区别，并能在合成数据上跑通评估" },
      { day: 4, title: "Ultralytics YOLO 安装与推理 Demo", content: ["pip install ultralytics; from ultralytics import YOLO; model = YOLO('yolov8n.pt')", "model.predict('https://ultralytics.com/images/zidane.jpg', save=True)", "对视频文件推理：model.predict('demo.mp4', save=True)", "看 results[0].boxes.boxes / conf / cls；print(len(results[0].boxes))"], duration: "2小时", resources: [R_ULTRALYTICS], checkpoint: "能用预训练 YOLOv8 对一张公开图做检测并查看输出 bbox" },
      { day: 5, title: "准备自定义 COCO/YOLO 数据集", content: ["创建目录结构：datasets/custom/{images,labels}/{train,val}", "data.yaml：path, train, val, names: {0:'cat', 1:'dog'}", "用 LabelImg / Roboflow 标注 100 张图做 demo（或下载公开小数据集）", "手动检查：随机挑一张图，把 label 画出来确认标注正确"], duration: "2.5小时", resources: [R_ULTRALYTICS], checkpoint: "拥有一个可被 YOLO 读取的≥100 张图的自定义数据集" },
      { day: 6, title: "训练 YOLOv8 自定义数据集", content: ["yolo detect train data=data.yaml model=yolov8n.pt epochs=25 imgsz=416 batch=16 device=0", "查看 runs/detect/train/ 下：results.csv、PR 曲线、val_batch* 预测样例", "调整 imgsz / batch / epochs 观察 mAP 变化", "过拟合迹象：train loss 下降 val loss 上升 → 减少 epochs / 加更多数据"], duration: "3小时", resources: [R_ULTRALYTICS], checkpoint: "在自定义数据集上训练完成，runs 目录下有预测样例图与 PR 曲线" },
      { day: 7, title: "评估与错误分析", content: ["加载最佳权重：model = YOLO('runs/detect/train/weights/best.pt')", "metrics = model.val(data=data.yaml); 看 mAP50 / mAP50-95", "从验证集中挑 3 张检测失败图：漏检、误检、框不准——各一张", "可能原因：标注质量、类内多样性、小目标、类别不平衡"], duration: "2小时", resources: [R_ULTRALYTICS], checkpoint: "有一个自己的 Bad Case 分析文档 / notebook" },
      { day: 8, title: "数据增强与超参优化", content: ["yolo cfg：hsv_h, hsv_s, hsv_v, degrees, translate, scale, mosaic, mixup", "关闭 mosaic 与 mixup 看效果变化；imgsz 从 416 → 640", "对类别不平衡：通过采样或 loss weights 调整", "用 wandb / tensorboard 画多组实验对比曲线"], duration: "2.5小时", resources: [R_ULTRALYTICS], checkpoint: "至少跑 2 组对比实验（如不同 imgsz 或是否 mosaic）并记录 mAP 差异" },
      { day: 9, title: "YOLO 系列架构直觉", content: ["CSPDarknet 骨干 + PAN/FPN 颈部 + Decoupled Head", "Anchor-Free：直接预测距离特征点 4 条边的距离（DFL）", "对比 YOLOv5 / v8 / v11：训练时间、精度、参数量", "阅读 Ultralytics 源码 10 分钟，找到 head 定义位置"], duration: "1.5小时", resources: [R_ULTRALYTICS], checkpoint: "能用 3 句话讲出 YOLOv8 相对 v5 的主要变化" },
      { day: 10, title: "导出为 ONNX/TensorRT 加速推理", content: ["model.export(format='onnx', opset=17, simplify=True, imgsz=640)", "安装 onnxruntime：pip install onnxruntime onnxruntime-gpu", "加载 .onnx 推理：sess = ort.InferenceSession('yolov8n.onnx'); out = sess.run(None, {sess.get_inputs()[0].name: x_numpy})", "对比 PyTorch 与 ONNXRuntime 的推理速度"], duration: "2.5小时", resources: [R_ULTRALYTICS], checkpoint: "能用导出的 ONNX 跑一次端到端推理，速度较 PyTorch 提升" },
      { day: 11, title: "封装推理 API（FastAPI）", content: ["写 FastAPI：POST /detect 接收 multipart 文件，读图像 → 预处理 → YOLO 推理 → 返回 JSON", "响应：{ 'boxes': [ { 'x1','y1','x2','y2','conf','cls' } ... ] }", "uvicorn main:app --host 0.0.0.0 --port 8000", "用 curl -F 'file=@test.jpg' http://localhost:8000/detect 测试"], duration: "2小时", resources: [R_FASTAPI, R_ULTRALYTICS], checkpoint: "能通过 HTTP 请求获取推理结果" },
      { day: 12, title: "摄像头实时推理 Demo", content: ["import cv2; cap = cv2.VideoCapture(0); 循环读取帧并推理", "把 bbox 画到帧上并显示；按 q 退出", "对比模型大小：yolov8n vs yolov8s vs yolov8m FPS", "记录本机实际 FPS"], duration: "2小时", resources: [R_ULTRALYTICS], checkpoint: "能用一个脚本启动电脑摄像头并实时目标检测" },
      { day: 13, title: "脚本化批量处理与结果导出", content: ["对某文件夹下所有图片批量推理，将结果保存为 JSON 与带 bbox 的 jpg", "统计各类别出现次数，输出一个 CSV", "支持多进程 / 批处理加速", "写 README 说明如何使用"], duration: "2小时", resources: [R_ULTRALYTICS], checkpoint: "有一个可复用的 CLI 脚本，能在新图片文件夹下一键产出结果" },
      { day: 14, title: "综合：端到端的自定义检测服务", content: ["选定一个检测场景（如：桌面对象 / 动物 / 交通标志），≥2 类 ≥200 张", "训练 YOLOv8s，导出 ONNX，写 FastAPI 服务，写一段简单 Streamlit Demo 上传图片 → 显示检测", "部署：Dockerfile 封装，docker run -p 8000:8000 mydet", "评估：mAP、延迟、显存占用"], duration: "3小时", resources: [R_ULTRALYTICS, R_FASTAPI, R_STREAMLIT], checkpoint: "可运行的 Docker 化检测服务 + 简易 UI + 性能评估报告" },
    ],
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
    dailyTasks: [
      { day: 1, title: "文本预处理与分词", content: ["英文：from nltk.tokenize import word_tokenize; sent = word_tokenize('Hello, world!')", "中文：import jieba; list(jieba.cut('我爱深度学习'))", "构建词表：word2idx = {w:i+2 for i,w in enumerate(vocab)}; 保留 <PAD>=0, <UNK>=1", "编码：tokens = [word2idx.get(w, 1) for w in tokens]; print(tokens)"], duration: "1.5小时", resources: [R_CS224N], checkpoint: "能把一段中英文句子转成 token id 序列，并构建自己的词表" },
      { day: 2, title: "Word2Vec：从计数到预测", content: ["import torch; vocab = 1000; embed_dim = 50; emb = nn.Embedding(vocab, embed_dim)", "CBOW 简化实现：上下文窗口 (c_1,c_2,c_3,c_4) → 预测中心词 w", "Skip-gram：w → 预测上下文；负采样简化", "训练一个小语料（如 IMDB 小样本），看 100 维向量收敛"], duration: "2小时", resources: [R_D2L], checkpoint: "能实现一个极简 CBOW，并用 it/s 训练 1000 步" },
      { day: 3, title: "使用预训练词向量", content: ["gensim.downloader.load('glove-wiki-gigaword-100') 或 torchtext GloVe", "向量运算：king - man + woman ≈ queen；cosine similarity", "把预训练向量载入 nn.Embedding.from_pretrained(vectors, freeze=True/False)", "fine-tune 对比：freeze=True 时训练收敛更快但上限可能低"], duration: "2小时", resources: [{ title: "torchtext", url: "https://pytorch.org/text/stable/vocab.html", required: false }], checkpoint: "能在自己的模型中加载 GloVe 预训练权重并做类比实验" },
      { day: 4, title: "RNN 前向传播", content: ["class RNN(nn.Module): def __init__(self,d,h): super().__init__(); self.Wxh=nn.Linear(d,h); self.Whh=nn.Linear(h,h); self.h2o=nn.Linear(h,C)", "forward step: h_t = tanh(Wxh(x_t) + Whh(h_{t-1}))", "给定序列 x = (seq_len, batch, d)，循环计算 h", "与 nn.RNN 官方实现对齐（数值对比）"], duration: "2小时", resources: [R_PYTORCH_DOC], checkpoint: "能从零实现一个 vanilla RNN，在玩具序列任务上跑通" },
      { day: 5, title: "梯度消失与 LSTM 门控", content: ["手写 LSTM cell：i/f/o 门 + g 候选 + c_t = f*c_prev + i*g；h_t = o*tanh(c_t)", "解释为什么 LSTM 比 vanilla RNN 更能保留长距离依赖（constant error carousel）", "训练 LSTM 在长序列任务（如复制字符串）上 vs RNN 的对比", "绘制 200 步 loss 曲线"], duration: "2小时", resources: [R_CS224N], checkpoint: "能在长序列复制任务中看到 LSTM 显著优于 vanilla RNN" },
      { day: 6, title: "序列建模：pack_padded_sequence", content: ["from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence", "变长序列：pad 到相同长度，再 pack（避免对 <PAD> 做不必要计算）", "训练时：用 pack → LSTM → pad → Linear 输出预测", "对一个 mini-batch 做 pack/unpack 并比对输出 shape"], duration: "1.5小时", resources: [R_PYTORCH_DOC], checkpoint: "能用 pack/pad 对变长 batch 做 LSTM，且输出正确 shape" },
      { day: 7, title: "文本分类：IMDB / 中文情感", content: ["模型：Embedding → LSTM/GRU → 取最后隐藏状态 → Linear → CE Loss", "数据：torchtext IMDB 或自己准备 pos/neg 文本", "训练 5 个 epoch，记录 acc，看是否 ≥ 80%", "对比：取 h[-1] vs 取平均池化 vs 取最大池化"], duration: "2.5小时", resources: [R_PYTORCH_TUT], checkpoint: "完整的文本分类脚本 + 评估 acc + 保存权重" },
      { day: 8, title: "序列标注：中文 NER（BiLSTM+CRF）", content: ["数据：MSRA / 公开中文 NER 小数据；BIO 标注", "模型：Embedding → BiLSTM → Linear → (可选)CRF", "CRF 的意义：建模标签转移约束（B-PER 后面更可能是 I-PER 而不是 O）", "评估：token-level F1 / entity-level F1"], duration: "2.5小时", resources: [R_CS224N], checkpoint: "在中文 NER 数据上训练并得到合理 entity-level F1" },
      { day: 9, title: "Seq2Seq 与机器翻译", content: ["Encoder：LSTM 读取源序列；Decoder：LSTM 生成目标序列", "Teacher Forcing：训练时用真实前一个 token 作为输入；推理时用自己的预测", "一个翻译小任务：数字到英文词序列（1→one, 2→two...）", "Greedy 解码 vs Beam Search"], duration: "2.5小时", resources: [R_D2L], checkpoint: "能在数字翻译玩具任务上训练并生成合理输出" },
      { day: 10, title: "Beam Search 解码", content: ["维护大小为 k 的候选序列集合；每步扩展 top-k", "长度归一化：score = logP / len^α；避免偏向短序列", "实现一个 seq2seq 推理脚本：greedy vs beam k=5", "BLEU 评估：from nltk.translate.bleu_score import corpus_bleu"], duration: "2小时", resources: [R_CS224N], checkpoint: "实现 beam search，并在数字翻译任务上比 greedy 更高 BLEU" },
      { day: 11, title: "注意力机制（加性 / 乘性）", content: ["加性 Attention：score(h_i, s_t) = v^T tanh(W1 h_i + W2 s_t)", "乘性 Attention：score = h_i^T W s_t / sqrt(d)", "softmax 归一化 → context vector = Σ α_i h_i", "在 seq2seq 中加入 attention，观察翻译质量提升 / 收敛更快"], duration: "2小时", resources: [R_CS224N], checkpoint: "能实现一个加性 attention 并加到 seq2seq decocder 中" },
      { day: 12, title: "TextCNN：用卷积做文本", content: ["嵌入形状 (batch, seq_len, d)；unsqueeze 加 channel 维 (b,1,seq_len,d)", "多个 filter_size (2/3/4)；每个大小 out_channels 个核；时序上 1d 卷积", "每个卷机后做 ReLU + max-over-time → concat → dropout → Linear", "在 IMDB / 中文情感分类上训练"], duration: "2小时", resources: [{ title: "Kim Yoon 2014", url: "https://arxiv.org/abs/1408.5882", required: false }], checkpoint: "TextCNN 能在文本分类上跑出与 LSTM 相当或更高的精度" },
      { day: 13, title: "语言模型与困惑度 Perplexity", content: ["语言模型：预测下一个 token；loss = CE(预测, 真值下一个)", "Perplexity = exp(avg CE)；衡量语言模型对未见文本的惊讶度", "训练一个字符级 LSTM，用它生成莎士比亚风格文本", "采样温度 τ：softmax(z/τ)，τ 大更杂乱，τ 小更 deterministic"], duration: "2.5小时", resources: [R_D2L], checkpoint: "能用字符级 LSTM 生成一段类似训练语料的文本" },
      { day: 14, title: "综合：中文新闻分类系统", content: ["数据源：THUCNews 子集 / 自建中文分类语料，≥5 类", "模型：Embedding + BiLSTM + Attention（或 TextCNN）", "训练策略：预训练词向量初始化 + dropout + AdamW", "评估：macro-F1 + 混淆矩阵；挑 3 个难分类样本做人工分析"], duration: "3小时", resources: [R_CS224N, R_PYTORCH_TUT], checkpoint: "完整的训练脚本 + 评估指标 + 3 个 case 分析" },
    ],
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
    dailyTasks: [
      { day: 1, title: "缩放点积注意力", content: ["def scaled_dot_product(q,k,v,mask=None): d_k = q.size(-1); weights = q @ k.transpose(-2,-1) / sqrt(d_k); 若有 mask 设为 -inf；p = softmax(weights); return p @ v", "对 (batch, heads, seq, d_k) 输入计算", "构造一个因果 mask (下三角) 模拟 decoder", "数值验证 q=k=v 时输出应为加权求和"], duration: "1.5小时", resources: [R_JALAMMAR, R_D2L], checkpoint: "能从零实现 scaled dot-product attention，并在 toy 输入上数值正确" },
      { day: 2, title: "Multi-Head Attention", content: ["class MultiHeadAttention(nn.Module): head 数 8，d_model 512 → 每个 head d_k = 64", "把 Q,K,V 各自线性投影到 8 组 heads；并行做 attention；concat 后再投影", "官方 nn.MultiheadAttention 与自定义实现对齐", "打印注意力权重热力图：越相似的 token 权重越高"], duration: "2小时", resources: [R_JALAMMAR], checkpoint: "能从零实现 MHA，并与 PyTorch 官方 MHA 的输出对齐（误差<1e-6）" },
      { day: 3, title: "位置编码（正弦 / 可学习）", content: ["正弦位置编码：PE(pos,2i) = sin(pos/10000^{2i/d})", "实现并绘制 0-100 的前 16 维位置编码波形", "可学习位置编码：nn.Embedding(max_seq, d) 随任务学习", "把位置编码加到 embedding 上，再送入 Transformer 层"], duration: "1.5小时", resources: [R_D2L], checkpoint: "能实现并可视化正弦位置编码" },
      { day: 4, title: "构建一个 Transformer 编码器", content: ["TransformerBlock: MHA → Add&Norm → FFN → Add&Norm", "FFN = Linear(d,4d) + GELU + Linear(4d,d) 标准结构", "堆叠 N=6 层 TransformerBlock + 最终 LayerNorm", "在 IMDB 分类任务上跑：取 <[BOS_never_used_51bce0c785ca2f68081bfa7d91973934]> token 投影到分类"], duration: "2.5小时", resources: [R_D2L], checkpoint: "能从头搭一个 Transformer 编码器，并在文本分类上训起来" },
      { day: 5, title: "解码器与因果掩码", content: ["解码器：Masked MHA（看前面位置）+ Cross MHA（看编码器输出）+ FFN", "下三角 causal mask 确保位置 i 只能看到 ≤ i", "一个数字翻译任务：输入数字序列 → 输出英文词序列", "teacher forcing 训练，greedy 推理"], duration: "2小时", resources: [R_JALAMMAR], checkpoint: "能实现一个端到端的 Transformer Encoder-Decoder，并在 toy 翻译任务上收敛" },
      { day: 6, title: "BERT 直觉与 MLM", content: ["BERT = 双向编码器预训练：随机 mask 15% token，让模型预测原 token", "与 GPT 的区别：GPT 是单向自回归（Left-to-Right），BERT 是双向", "输入格式：<[BOS_never_used_51bce0c785ca2f68081bfa7d91973934]> + tokens + [SEP] + tokens + [SEP] 支持句对任务", "NSP（Next Sentence Prediction）是预训练任务之一（现代 BERT 变种常去掉）"], duration: "1.5小时", resources: [{ title: "BERT 论文", url: "https://arxiv.org/abs/1810.04805", required: true }], checkpoint: "能用 3 句话讲清 BERT 与 GPT 的核心差异" },
      { day: 7, title: "HuggingFace Tokenizer 与加载", content: ["pip install transformers; from transformers import BertTokenizer, BertModel", "tokenizer = BertTokenizer.from_pretrained('bert-base-uncased'); enc = tokenizer('Hello world', return_tensors='pt')", "查看 input_ids / token_type_ids / attention_mask 的含义", "bert = BertModel.from_pretrained('bert-base-uncased'); out = bert(**enc); print(out.last_hidden_state.shape)"], duration: "2小时", resources: [R_HF_TRANSFORMERS], checkpoint: "能 load 一个预训练 BERT，编码一句话拿到 <[BOS_never_used_51bce0c785ca2f68081bfa7d91973934]> 向量" },
      { day: 8, title: "微调 BERT 做文本分类", content: ["from transformers import BertForSequenceClassification; model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=2)", "用 Trainer：TrainingArguments(...) + Trainer(model, args, train_dataset=..., eval_dataset=...)", "手工训练循环写法：dataloader + optimizer + scheduler(linear warmup) + mixed precision", "比较预训练 BERT 微调 vs 随机初始化从头训：数据少时前者好得多"], duration: "2.5小时", resources: [R_HF_COURSE], checkpoint: "在 IMDB 子集上微调 bert-base-uncased，val_acc > 90%" },
      { day: 9, title: "中文 BERT 与分词", content: ["加载 hfl/chinese-bert-wwm 或 bert-base-chinese", "中文分词：字级别（主流）+ 全词掩码 WWM（词边界的 ## 被 mask 一起）", "文本分类：类似英文流程；对中文新闻语料微调", "评估 macro-F1"], duration: "2小时", resources: [R_HF_TRANSFORMERS], checkpoint: "能在中文数据集上用中文 BERT 完成微调并保存权重" },
      { day: 10, title: "Prompt Engineering 与 Few-shot", content: ["把任务描述为自然语言：'把以下中文翻译成英文：{src}'", "以 GPT2 演示：输入提示，看生成；Temperature、top-p、top-k 采样", "对分类任务，构造 prompt：'这是一篇 {label} 类新闻。内容：{text}'，比较各 label 的概率", "in-context learning：在 prompt 中放几个示例"], duration: "2小时", resources: [R_HF_TRANSFORMERS], checkpoint: "能用一个预训练 Causal LM（如 distilgpt2）做 few-shot 生成式任务演示" },
      { day: 11, title: "GLUE 基准评估", content: ["加载 glue 数据：from datasets import load_dataset; dataset = load_dataset('glue', 'mrpc')", "tokenize_function; tokenized = dataset.map(lambda e: tokenizer(e['sentence1'], e['sentence2'], truncation=True), batched=True)", "AutoModelForSequenceClassification + Trainer 训练", "记录 GLUE/MRPC 的 F1"], duration: "2小时", resources: [R_HF_COURSE], checkpoint: "在 MRPC 上完成一次完整训练并报告 F1 指标" },
      { day: 12, title: "问答（Extractive QA / SQuAD）", content: ["BertForQuestionAnswering：输出 start_logits 与 end_logits", "SQuAD 数据格式：context + question → (start, end) 答案片段", "微调方式：CE(start_logits, y_start) + CE(end_logits, y_end)", "评估：Exact Match / F1"], duration: "2.5小时", resources: [R_HF_COURSE], checkpoint: "能在 SQuAD 小数据上训练一个 QA 模型，并可交互问答 demo" },
      { day: 13, title: "模型蒸馏 / 量化与加速", content: ["DistilBERT：参数约 BERT-base 的 1/2，速度 ~2×，性能保留 97%", "量化：torch.quantization.quantize_dynamic(model, {torch.nn.Linear}, dtype=torch.qint8)", "onnx 导出并 onnxruntime 推理", "对比原始 BERT / DistilBERT / 量化模型 在同一台机器上的 latency"], duration: "2小时", resources: [R_HF_TRANSFORMERS], checkpoint: "能把 DistilBERT 量化并在 CPU 上跑出显著加速" },
      { day: 14, title: "综合：部署一个 BERT 文本分类服务", content: ["在中文分类数据上微调一个 bert-base-chinese 或 distilbert-base-chinese", "导出为 model.pth + tokenizer", "写 FastAPI：POST /predict，JSON {'text': str} 返回 {'label': int, 'score': float}", "写 Streamlit UI 输入框 → 显示预测类别；Dockerfile 封装整个服务"], duration: "3小时", resources: [R_HF_TRANSFORMERS, R_FASTAPI, R_STREAMLIT], checkpoint: "Docker 化的中文文本分类服务，可浏览器交互使用" },
    ],
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
    dailyTasks: [
      { day: 1, title: "LLM 生态与模型规模", content: ["HuggingFace 模型卡：mistralai/Mistral-7B-v0.1、TinyLlama/TinyLlama-1.1B-Chat-v1.0", "模型规模参数：参数量、训练 token 数、上下文长度、许可协议", "本地资源：24GB 卡 + fp16 ≈ 13GB（7B）；不够 → 4bit/8bit 量化", "选择一个轻量模型做演示：TinyLlama 1.1B（资源友好）"], duration: "1.5小时", resources: [R_HF_TRANSFORMERS], checkpoint: "能在 HuggingFace 上找到 ≤ 3B 的开源中文/英文模型，并成功 AutoModelForCausalLM.from_pretrained 加载" },
      { day: 2, title: "LoRA：Low-Rank Adaptation", content: ["直觉：只训练 W = W_pretrained + B A 中的 A (r×d) 和 B (d×r)", "PEFT 库：from peft import LoraConfig, get_peft_model; lora_cfg = LoraConfig(r=8, lora_alpha=32, target_modules=['q_proj','v_proj'], lora_dropout=0.05, bias='none', task_type='CAUSAL_LM')", "model = get_peft_model(model, lora_cfg); model.print_trainable_parameters()", "训练参数占比通常 < 1%"], duration: "2小时", resources: [R_HF_PEFT, R_LORA_PAPER], checkpoint: "能把任何一个 HF CausalLM 用 PEFT LoRA 包装，打印 trainable params < 1%" },
      { day: 3, title: "4-bit 量化 + QLoRA", content: ["pip install bitsandbytes; from transformers import BitsAndBytesConfig", "bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_use_double_quant=True, bnb_4bit_quant_type='nf4', bnb_4bit_compute_dtype=torch.bfloat16)", "model = AutoModelForCausalLM.from_pretrained(name, quantization_config=bnb, device_map='auto')", "结合 LoRA：在 4bit 权重上附加 LoRA；显存显著降低"], duration: "2小时", resources: [R_HF_PEFT], checkpoint: "能在 24GB GPU 上成功 4bit 量化加载一个 7B 模型并跑一次 generate" },
      { day: 4, title: "聊天数据格式 ChatML", content: ["格式：messages = [{'role':'system','content':'...'}, {'role':'user','content':'...'}, {'role':'assistant','content':'...'}]", "tokenizer.apply_chat_template(messages, tokenize=False) 得到字符串", "训练时只对 assistant 段计算 loss，mask 掉 user/system", "数据清洗：去除截断 / 低质量 / 指令与回答不一致的样本"], duration: "1.5小时", resources: [R_HF_TRANSFORMERS], checkpoint: "能用 apply_chat_template 把一组对话转为模型可训练的 text" },
      { day: 5, title: "准备一个自定义微调数据集", content: ["构造或下载 1k-10k 条指令-回答对（比如：编程助手 / 中文 QA / 摘要）", "JSONL：{'conversations': [...]} 或 {'prompt': ..., 'response': ...}", "from datasets import Dataset; ds = Dataset.from_list(data); ds = ds.train_test_split(test_size=0.05)", "做长度分析：统计 prompt+response token 数分布；决定 max_seq_length"], duration: "2小时", resources: [{ title: "HuggingFace Datasets", url: "https://huggingface.co/docs/datasets/", required: true }], checkpoint: "有一个自定义的对话数据集被加载成 Dataset，并能 tokenize 成 features" },
      { day: 6, title: "SFTTrainer 训练循环", content: ["from trl import SFTTrainer; trainer = SFTTrainer(model=model, train_dataset=ds['train'], eval_dataset=ds['test'], dataset_text_field='text', max_seq_length=1024, tokenizer=tokenizer, args=training_args, peft_config=lora_cfg)", "training_args：output_dir, per_device_train_batch_size=4, gradient_accumulation_steps=4, learning_rate=2e-4, num_train_epochs=3, logging_steps=10, fp16=True/bf16=True, optim='paged_adamw_8bit'", "trainer.train(); trainer.save_model('lora-adapter')"], duration: "3小时", resources: [{ title: "TRL 文档", url: "https://huggingface.co/docs/trl/", required: true }], checkpoint: "成功运行一次微调（1 epoch 即可），loss 曲线下降" },
      { day: 7, title: "模型合并与保存", content: ["仅保存 adapter（几百 MB），或合并到 base：from peft import PeftModel; merged = PeftModel.from_pretrained(base_model, 'lora-adapter').merge_and_unload()", "merged.save_pretrained('merged-model'); tokenizer.save_pretrained('merged-model')", "push 到 HF Hub（可选）", "推理：AutoModelForCausalLM.from_pretrained('merged-model') 直接使用"], duration: "1.5小时", resources: [R_HF_PEFT], checkpoint: "能产出一个可以独立加载的合并模型，并与原始 base 模型生成对比样本" },
      { day: 8, title: "推理 pipeline 与采样参数", content: ["from transformers import pipeline; pipe = pipeline('text-generation', model='merged-model', device_map='auto')", "temperature=0.7, top_p=0.9, top_k=50, max_new_tokens=256, repetition_penalty=1.1", "对比不同 temperature 的输出风格：0.1 保守 / 0.7 平衡 / 1.5 发散", "流式生成：pipe(..., streamer=TextIteratorStreamer(tokenizer))"], duration: "2小时", resources: [R_HF_TRANSFORMERS], checkpoint: "写一个交互式 generate 脚本，支持系统提示 + 用户多轮输入" },
      { day: 9, title: "评估：BLEU / ROUGE / 人工成对比较", content: ["摘要任务用 ROUGE：from rouge_score import rouge_scorer", "翻译任务用 BLEU / CHRF：from sacrebleu.metrics import BLEU, CHRF", "人工评估：准备 30 条测试样本，base 模型 vs 微调模型双盲比较", "统计：win / tie / lose 比例；写评估报告"], duration: "2小时", resources: [{ title: "sacreBLEU", url: "https://github.com/mjpost/sacrebleu", required: false }], checkpoint: "能在测试集上得到一份 base vs 微调的评估表（BLEU/ROUGE + 人工比例）" },
      { day: 10, title: "数据质量与超参搜索", content: ["LoRA 超参：r 8/16/64、alpha 通常 2*r、target modules（q/v vs q/k/v/o/gate）", "lr: 1e-4 / 2e-4 / 5e-5；batch size 受 GPU 显存限制", "数据质量 vs 数量：1000 条高质量 > 10 万条低质量", "实验记录：用 wandb 做 3 组实验对比"], duration: "2小时", resources: [R_HF_PEFT], checkpoint: "有至少 2 组实验（不同 r 或不同 lr）的对比记录" },
      { day: 11, title: "DPO：直接偏好优化", content: ["准备偏好数据：{prompt, chosen, rejected}", "from trl import DPOTrainer; dpo = DPOTrainer(model, ref_model, args=..., beta=0.1)", "原理：让模型对 chosen 的似然相对 rejected 更高，无需 RL", "只在有现成偏好数据时做；否则先用 SFT 打底"], duration: "2小时", resources: [{ title: "TRL DPO", url: "https://huggingface.co/docs/trl/dpo_trainer", required: true }], checkpoint: "能在一个小偏好数据集上跑通一次 DPO，并能看出偏好倾向变化" },
      { day: 12, title: "vLLM / TGI 推理加速（概念）", content: ["vLLM：PagedAttention + 连续批处理，吞吐显著高于原生 HF", "docker run --gpus all vllm/vllm-openai:latest --model merged-model --port 8000", "OpenAI 兼容 API：curl http://localhost:8000/v1/chat/completions", "若本机资源不足可跳过本地运行，但能说明原理"], duration: "1.5小时", resources: [{ title: "vLLM", url: "https://docs.vllm.ai/", required: false }], checkpoint: "能解释为什么 vLLM 比原生 HF generate 更高效" },
      { day: 13, title: "聊天 Demo：Gradio / Streamlit", content: ["gradio：pip install gradio; with gr.Blocks() as demo: gr.ChatInterface(fn=generate_fn)", "generate_fn 维护 history，调用 pipeline 或 model.generate", "dockerfile 部署：模型放本地或从 HF Hub 加载", "在浏览器里交互聊天"], duration: "2小时", resources: [R_GRADIO], checkpoint: "有一个浏览器可打开的聊天 Demo，能多轮对话" },
      { day: 14, title: "综合：构建一个垂直领域小助手", content: ["选一个垂直场景：公司内部文档问答 / 编程助手 / 学习助手", "准备领域数据 1k-10k 条（可合成 + 真实混合）", "用 TinyLlama 或 Mistral-7B（看硬件）做 4bit + LoRA 微调 2 epoch", "合并模型，构建 Gradio 聊天 Demo，在 30 条测试样例上人工评估 base vs 微调 win 率", "写 README：训练 / 推理 / 部署说明"], duration: "3小时", resources: [R_HF_PEFT, R_HF_TRANSFORMERS, R_GRADIO], checkpoint: "一个可运行的聊天小助手 + 评估报告 + 部署说明" },
    ],
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
    dailyTasks: [
      { day: 1, title: "选题与需求文档", content: ["列出 3 个候选方向（CV / NLP / 多模态）", "为每个方向写 1 页：目标用户、输入输出、核心指标（定量+定性）、竞品/基线", "挑 1 个确定方向，写 PRD：feature list + MVP 范围", "GitHub 新建项目，写 README 初稿"], duration: "2小时", resources: [], checkpoint: "产出一份 PRD.md 与 GitHub 仓库（含 MIT/Apache 协议 + README）" },
      { day: 2, title: "数据收集与标注方案", content: ["列出数据来源：公开数据集 / 爬虫 / 数据合成 / 自有数据", "评估许可证与伦理：是否商用、是否需要脱敏、是否平衡", "标注工具：Label Studio / CVAT（CV），Argilla / Doccano（NLP）", "制定质量标准：双标 + IAA（标注一致性）；抽样质检流程"], duration: "2小时", resources: [{ title: "Label Studio", url: "https://labelstud.io/", required: false }], checkpoint: "至少 200 条（CV/NLP）或 1000 条（LLM）已标注样本 + 标注规范文档" },
      { day: 3, title: "技术选型与 Baseline", content: ["选择 2-3 个基线模型：如（YOLOv8n + ResNet-18 / ResNet-50）或（BERT-base / DistilBERT）", "训练配置：硬件（GPU/显存）、框架版本、依赖清单（requirements.txt）", "把数据处理脚本、训练脚本放在 scripts/，模型配置放在 configs/", "写 baselines.md 记录 0 号实验（baseline）结果"], duration: "2.5小时", resources: [], checkpoint: "baseline 模型跑通并产出 metrics.json + logs" },
      { day: 4, title: "数据增强与数据版本", content: ["针对问题设计数据增强策略（图像：几何 + 颜色；文本：回译 + 同义词替换）", "用 DVC 管理数据版本：dvc init；dvc add data/；dvc push；git 记录 .dvc 文件", "写数据处理 pipeline：scripts/preprocess.py 一键从原始数据 → 训练样本", "随机抽取一批样本做可视化，检查预处理结果"], duration: "2.5小时", resources: [{ title: "DVC", url: "https://dvc.org/", required: false }], checkpoint: "scripts/preprocess.py 可重复运行；DVC 已追踪 data 目录" },
      { day: 5, title: "基线训练与实验管理", content: ["用 MLflow / Weights & Biases 记录实验：超参、metrics、模型文件、日志", "跑 2-3 个基线实验（不同 seed），记录 95% 置信区间", "建立实验跟踪表：experiment.md（表格形式）", "复现性：固定 seed（torch, np, random, cudnn）+ 记录 cuda/transformers 版本"], duration: "2.5小时", resources: [{ title: "MLflow", url: "https://mlflow.org/", required: false }], checkpoint: "有 ≥ 3 次 baseline 实验的完整记录，并能复现" },
      { day: 6, title: "Bad Case 分析", content: ["随机抽取 20 条训练错误样本做人工检查", "按类别统计错误：漏检 / 误检 / 边界差 / 文本幻觉 / 类混淆", "列出 top-3 问题并提出可能的改进（数据侧 / 架构侧 / 训练侧）", "写 analysis.md：样本截图或片段 + 原因假设 + 改进计划"], duration: "2小时", resources: [], checkpoint: "产出一份 2-3 页的 Bad Case 分析文档" },
      { day: 7, title: "架构与训练优化", content: ["根据分析结果做 ≥1 轮改进：更强模型 / 更多数据 / 更优超参 / 学习率调度", "对 CV：换大 backbone、增大 imgsz、启用 TTA；对 NLP：增大 max_seq_length、调整 LoRA r、增加数据", "记录 ablation：去掉某改进看性能回落多少", "每轮实验用新的分支 + 新的 experiment id"], duration: "3小时", resources: [], checkpoint: "有至少 2 轮对比实验（baseline → 改进1 → 改进2）的表格" },
      { day: 8, title: "推理优化：量化/剪枝/蒸馏", content: ["导出 PyTorch 权重为 ONNX；对 LLM 用 GPTQ/AWQ 量化", "模型大小与 latency 基准：记录 batch=1 的端到端耗时", "写 benchmark.py 一键测速并保存到 reports/benchmark.md", "若有训练数据，记录 distillation 实验"], duration: "2.5小时", resources: [R_ULTRALYTICS], checkpoint: "产出一份 benchmark.md：模型大小、p50/p95 延迟、精度" },
      { day: 9, title: "API 服务开发", content: ["FastAPI：POST /predict、GET /health、/metrics", "请求/响应 Pydantic schema；输入校验（图像大小、文本长度）", "单元测试：tests/test_api.py，mock 一个请求测响应结构", "日志：loguru / logging，INFO 级别记录每次请求耗时"], duration: "2.5小时", resources: [R_FASTAPI], checkpoint: "可运行的 FastAPI 服务 + 至少 1 个测试" },
      { day: 10, title: "前端 UI 开发", content: ["Streamlit/Gradio：上传或输入 → 展示预测 → 可下载结果", "展示核心指标卡片（latency、版本、模型名）", "错误处理：上传异常格式给出友好提示", "部署成与 FastAPI 通信的独立服务（docker compose）"], duration: "2.5小时", resources: [R_STREAMLIT, R_GRADIO], checkpoint: "浏览器可用的 UI，能完成一次端到端演示" },
      { day: 11, title: "Docker 化与一键部署", content: ["写 Dockerfile：multi-stage，非 root 用户，健康检查", "写 docker-compose.yml：api + ui + 可选 redis", "在另一台干净机器 docker compose up -d 能跑通", "README 给出运行命令：docker compose up；首次拉镜像耗时"], duration: "2.5小时", resources: [], checkpoint: "可在干净环境用 docker compose up 一键部署" },
      { day: 12, title: "监控与上线", content: ["Prometheus /metrics 暴露；Grafana 面板查看 QPS、p95、错误率", "告警规则：错误率 > 5% / GPU 温度 > 85°C / 磁盘 < 10% 告警", "将服务放到公网：Nginx 反向代理 + HTTPS（Let's Encrypt）", "写 deploy.md：环境要求、端口、环境变量、备份流程"], duration: "2.5小时", resources: [], checkpoint: "一份 deploy.md 说明 + Grafana 面板截图" },
      { day: 13, title: "文档与答辩准备", content: ["README：项目简介 / 安装 / 使用 / 性能指标 / 架构图 / 演示截图", "docs/ 目录：prd.md / data.md / experiments.md / api.md / deploy.md", "做 5 分钟 Demo PPT：背景 → 方法 → 结果 → 演示视频链接", "录制 2 分钟视频放在 README（可选）；准备 3 个 FAQ 与答辩问题"], duration: "3小时", resources: [], checkpoint: "README + docs/ 完整，可作为简历项目链接展示" },
      { day: 14, title: "复盘、迭代与发布", content: ["自己做一次 live demo：录像 + 记录失败点", "列出 TODO：功能增强（多模型切换）、性能（缓存）、数据标注持续收集", "打 GitHub Release v1.0：附权重文件或模型 Hub 链接", "写一篇技术博客（中文/英文）记录：问题 → 方法 → 结果，作为长期学习记录", "在团队内或社区分享，收集反馈"], duration: "2.5小时", resources: [], checkpoint: "GitHub Release v1.0 + 一篇技术博客 + demo 录像链接" },
    ],
  },
];
