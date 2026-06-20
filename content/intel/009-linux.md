---
title: Linux 系统基础
category: devops
keywords:
  - linux
  - bash
  - shell
  - terminal
  - ssh
  - nvidia
  - permissions
  - process
difficulty: beginner
duration: 2-3周
summary: 深度学习训练几乎都在 Linux 服务器上进行，不会 Linux 就没法跑大规模模型、没法做远程开发与部署
takeaways:
  - 掌握 Linux 目录结构与高频命令（ls/cd/pwd/mkdir/cp/rm/find/grep）
  - 会用 top/nvidia-smi/kill 管理进程与资源，能定位训练卡死问题
  - 配置 SSH 免密登录与密钥认证，能安全远程管理多台服务器
  - 理解文件权限机制，用 chmod/chown 管理文件访问
---

## 为什么你要学它

你辛辛苦苦写了一份 PyTorch 训练脚本，在自己笔记本上跑了一晚上发现只能处理 1% 的数据，还把风扇吹得像飞机起飞。这时候就需要一台真正的"训练机器"——一台带高端 GPU 的 Linux 服务器。

**几乎所有深度学习训练、大模型推理、开源项目部署都运行在 Linux 上**。原因很简单：
- **GPU 驱动生态好**：NVIDIA 的 CUDA/cuDNN 在 Linux 上最成熟、性能最好
- **命令行强大**：你可以用 SSH 远程登录，把训练丢在后台，关闭电脑也不影响
- **资源管理灵活**：一台服务器可以多人使用，每个人互不干扰
- **开源项目原生支持**：PyTorch、TensorFlow、vLLM、DeepSpeed 等项目的文档、脚本都是面向 Linux 写的

如果你不会 Linux，你就只能在自己的笔记本上跑"玩具模型"，无法真正参与生产级的 AI 项目。

## 一句话概览（快速版）

- **目录是树**：所有文件从根目录 `/` 出发，用户目录是 `/home/你的用户名`（快捷方式 `~`）
- **一切皆文件**：设备（GPU、磁盘）、进程、网络套接字都以文件形式管理
- **SSH 免密 + 后台训练**：生成密钥对 → 把公钥放服务器 → 直接登录，用 `nohup` 或 `tmux` 让训练在后台持久运行

## 核心拆解

### 🔑 Linux 文件系统结构

Linux 的目录不是像 Windows 那样分 C 盘 D 盘，而是一棵从根 `/` 出发的统一大树。常用目录你至少要认识：

```
/              # 根目录
/home/you      # 你的主目录（~），存放个人文件、代码、模型权重
/root          # root 用户的主目录
/etc           # 系统配置文件（网络、服务配置都在这里）
/var/log       # 系统日志（出问题先看这里）
/usr/local     # 手动编译安装的软件
/opt           # 可选软件（NVIDIA 驱动 / CUDA 经常装这里）
/tmp           # 临时文件（系统重启可能清空，不要放训练结果）
```

**经验**：你的代码、虚拟环境、数据集就放 `~/projects/` 下；训练日志别放 `/tmp`，丢了找不回来。

### 🔑 文件与目录操作命令（最常用）

```bash
pwd                 # 打印当前目录
cd ~/projects       # 切换目录（.. 是上级目录）
ls -lah             # 列出文件（-l 详细信息，-a 含隐藏文件，-h 人类可读大小）
mkdir -p a/b/c      # 创建多级目录（-p 表示父目录不存在就创建）
cp -r src/ dst/     # 递归复制目录
rm -rf dir/         # 强制递归删除（⚠️非常危险，没有回收站！先 ls 确认再 rm）
mv old.txt new.txt  # 重命名或移动
find . -name "*.py" # 按名称递归查找文件
ln -s /path/to/target ./link   # 创建软链接（相当于 Windows 快捷方式）
```

### 🔑 文本处理：grep / awk / sed / head / tail

训练日志动辄几 GB，直接用编辑器打开会卡死，要用命令行工具高效浏览与搜索：

```bash
cat train.log                     # 查看文件全部内容（大文件别用）
head -n 30 train.log             # 看前 30 行
tail -n 50 train.log             # 看最后 50 行
tail -f train.log                # 实时监控日志追加（训练时最常用）
grep "Epoch" train.log            # 搜索包含 "Epoch" 的行
grep -rn "TODO" src/            # 递归搜索 src/ 目录下所有文件中的 TODO
wc -l train.log                  # 统计行数
# awk：按列处理文本（非常适合从日志里抽数字）
grep "loss:" train.log | awk '{print $4}'   # 取出第 4 列
# sed：批量替换文本
sed -i 's/old_word/new_word/g' file.txt   # 把 file.txt 中所有 old_word 替换成 new_word
```

### 🔑 进程与资源管理

训练模型最关心的就是 **GPU 有没有被正确使用、CPU 有没有占满、内存够不够**。

```bash
top / htop                       # 查看进程占用（推荐 htop，更直观）
nvidia-smi                       # 查看 GPU 状态（显存占用、利用率、温度）
nvidia-smi dmon -s pucv -d 1   # 每秒实时监控 GPU
ps aux | grep python             # 查找所有 Python 进程
kill -9 <PID>                    # 强制结束某个进程（PID 从 ps / nvidia-smi 里看）
kill $(pgrep -f "python train.py")  # 按进程名批量杀

# 让脚本在后台运行，关闭终端也不停止
nohup python train.py > train.log 2>&1 &
# 或者用 tmux（更推荐，因为可以随时重新连接）
tmux new -s train                 # 创建新会话
python train.py                   # 开始训练
# Ctrl+B 然后按 D 键：脱离会话（训练继续）
tmux attach -t train             # 重新连回来查看
```

### 🔑 SSH 远程登录与密钥登录

你每天都要登录远程服务器。每次输密码既麻烦又不安全（容易被暴力破解）。正确做法是用 **SSH 密钥认证**：

```bash
# 在你本机（不是服务器）生成密钥对
ssh-keygen -t ed25519 -C "your_email@example.com"
# 一路回车（可以留空密码，也可以设一个）
# 会在 ~/.ssh/ 下生成 id_ed25519（私钥，保密！）和 id_ed25519.pub（公钥）

# 把公钥复制到服务器
ssh-copy-id your_name@server_ip
# 如果服务器禁止密码登录，需要手动把公钥追加到 ~/.ssh/authorized_keys
# cat ~/.ssh/id_ed25519.pub | ssh your_name@server_ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# 之后直接免密登录
ssh your_name@server_ip
```

进阶：在本机 `~/.ssh/config` 里配置别名，省去输入用户名和 IP：

```
Host gpu-server
    HostName 192.168.1.100
    User your_name
    Port 22
    IdentityFile ~/.ssh/id_ed25519
```

之后直接 `ssh gpu-server` 就能登录。

### 🔑 SCP / rsync：文件传输

把代码或数据集传到服务器、把训练结果下载回本机：

```bash
# scp 简单直接
scp local_file.py your_name@server_ip:~/projects/
scp -r local_dir your_name@server_ip:~/projects/
scp your_name@server_ip:~/results/best.pt ./  # 从服务器下载

# rsync 增量同步（大目录推荐，比 scp 快且支持断点续传）
rsync -avz --progress ./data/ your_name@server_ip:~/data/
rsync -avz --progress your_name@server_ip:~/results/ ./
```

### 🔑 文件权限（chmod / chown）

Linux 每个文件都有"读 r / 写 w / 执行 x"三类权限，按"所有者 / 所属组 / 其他用户"三套独立控制。

```bash
ls -l train.py    # 查看权限（例如 -rw-r--r-- 表示：所有者可读写，组和其他人只读）

# 给脚本加执行权限
chmod +x script.sh
chmod 755 script.sh   # 等同于 rwxr-xr-x

# 修改所有者（需要 sudo）
sudo chown your_name:your_group file.txt

# 常见权限组合
chmod 644 file.txt    # 普通文件（rw-r--r--）
chmod 755 dir/        # 目录/可执行文件（rwxr-xr-x）
chmod 600 ~/.ssh/id_ed25519   # 私钥必须是 600（仅你可读写），否则 SSH 会拒绝
```

一个常见坑：你在服务器上用 root 跑了训练，生成的 `best.pt` 所有者是 root，下次用普通用户登录就写不了、删不了。解决：**尽量不用 root 跑训练，用你自己的普通账号**。

## 完整跑通方案

**第一步：登录服务器并检查基础环境**

```bash
ssh your_name@gpu-server

# 查看服务器基本信息
uname -a          # 内核版本
nvidia-smi        # GPU 状态（最关键，看驱动版本、显存、利用率）
df -h             # 磁盘使用情况（看 /home 还剩多少空间）
free -h           # 内存使用
top               # 进程列表（按 q 退出）
```

**第二步：安装常用工具（Ubuntu 示例）**

```bash
sudo apt update
sudo apt install -y htop tmux vim git curl wget unzip
```

**第三步：把你的代码传到服务器并启动训练**

```bash
# 在本机执行：把项目目录同步到服务器
rsync -avz --progress ./my-ai-project/ your_name@gpu-server:~/projects/my-ai-project/

# 在服务器执行：创建虚拟环境，安装依赖
cd ~/projects/my-ai-project
python -m venv .venv
source .venv/bin/activate
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
pip install -r requirements.txt

# 用 tmux 启动训练（这样关掉终端也不会中断）
tmux new -s train
python train.py --epochs 50 --batch_size 32
# Ctrl+B 然后按 D 键：脱离 tmux 会话；训练继续
```

**第四步：实时查看训练日志**

```bash
# 登录服务器
ssh gpu-server
# 连回 tmux 会话
tmux attach -t train
# 或者看训练日志文件
tail -f train.log
```

**第五步：训练结果下载回本机**

```bash
# 在本机执行
mkdir -p ./results
rsync -avz --progress your_name@gpu-server:~/projects/my-ai-project/results/ ./results/
```

**第六步：管理进程，停止不需要的训练**

```bash
# 查看你的 Python 进程
ps aux | grep python
# 或用 nvidia-smi 查看哪些进程在用 GPU
nvidia-smi
# 杀掉某个进程（替换 PID）
kill -9 12345
# 批量停止所有你自己启动的训练
pkill -f "python train.py"
```

## 常见误区

**误区 1：用 root 跑训练 → 生成的文件都是 root 所有，以后普通账号连不上、删不掉**

解释：root 权限太大，一个命令写错（`rm -rf /`）能把整台服务器干掉。**永远用普通账号**，只有装系统级软件时才用 `sudo`。模型代码、虚拟环境、数据集都放 `/home/你的用户名/` 下。

**误区 2：把训练脚本直接前台运行，关闭终端训练就停了**

解释：终端关闭时，前台运行的进程会收到 SIGHUP 信号被杀掉。正确做法是用 `nohup python train.py > train.log 2>&1 &` 或 `tmux` / `screen` 让训练脱离终端运行。推荐 tmux，因为还能随时重新连回来看进度。

**误区 3：rm -rf 直接删除，不用 ls 先确认 → 把自己代码目录当垃圾清掉了**

解释：Linux 没有回收站。删除前先用 `ls` 确认路径，尤其是通配符 `*` 的使用。重要数据一定要先备份，或配合版本控制（Git）+ 异地存储。

**误区 4：SSH 私钥到处乱拷贝 → 一台机器被盗，所有服务器都受影响**

解释：私钥（`~/.ssh/id_ed25519`）只能存在你自己本机，永远不要拷贝到服务器、不要上传到 Git 仓库。你只把公钥（`id_ed25519.pub`）放到服务器的 `~/.ssh/authorized_keys`。建议私钥文件权限设为 600（Linux 会自动检查，权限太宽松 SSH 会拒绝连接）。

**误区 5：数据集放 /tmp → 过几天训练突然失败，文件凭空消失**

解释：`/tmp` 是临时目录，系统重启或定时清理服务会把它清空。你的数据集、模型权重、训练日志应该放 `~/data/`、`~/models/`、`~/logs/` 这种用户主目录下。

**误区 6：不设文件权限，把关键文件 chmod 777 → 任何登录服务器的人都能修改和删除你的文件**

解释：`chmod 777` 把读/写/执行权限开放给所有人，等于把家门钥匙挂在门上。普通文件 644、可执行文件 755 就够了。训练产出的文件默认就应该只有你能写。

**误区 7：nvidia-smi 显示 GPU 利用率为 0% 却不排查 → 训练跑在 CPU 上，白白浪费 GPU**

解释：有几种常见情况会导致 GPU 没被用上：(1) 模型没 `.to('cuda')` 或没 `.cuda()`；(2) DataLoader 卡在 CPU 预处理（num_workers 太小或 pin_memory 没开）；(3) CUDA 版本与 PyTorch 版本不匹配。发现训练慢先跑 `nvidia-smi`，看 GPU-Util 是不是稳定在 80%+，如果长期为 0 就是有问题。
