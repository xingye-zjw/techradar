# Linux

**Linux** 是一个开源的 Unix-like 操作系统内核，由芬兰学生 Linus Torvalds 于 1991 年创建。基于 Linux 内核构建的操作系统被称为「Linux 发行版」，它是服务器、嵌入式系统、超级计算机等领域的事实标准操作系统。

## Linux 的核心地位

- **服务器操作系统**：全球 ~90% 的服务器运行 Linux
- **云计算**：AWS、GCP、Azure 的主力系统都是 Linux
- **移动设备**：Android 的内核基于 Linux
- **嵌入式/IoT**：路由器、智能设备、智能汽车
- **超级计算机**：全球 Top 500 超级计算机 100% 运行 Linux
- **开发者工作站**：WSL（Windows Subsystem for Linux）让 Windows 用户也可以原生体验 Linux

## 发行版选择指南

| 家族 | 代表发行版 | 包管理器 | 典型用途 | 特点 |
|------|----------|---------|---------|-----|
| **Debian** | Debian / Ubuntu / Mint | `apt` / `dpkg` | 服务器、桌面 | 稳定、软件丰富 |
| **RHEL** | RHEL / CentOS / Rocky / Fedora | `yum` / `dnf` | 企业服务器 | 企业级支持 |
| **Arch** | Arch / Manjaro | `pacman` | 桌面、滚动更新 | 灵活、最新 |
| **SUSE** | openSUSE / SLES | `zypper` | 企业服务器 | 系统管理工具强 |
| **Alpine** | Alpine | `apk` | 容器 | 超轻量、小尺寸 |

**对于开发者/AI 工程师**：
- **服务器**：Ubuntu Server 22.04 LTS（最主流，生态最好）
- **容器**：Alpine（追求小体积）或 Debian Slim
- **AI/ML 工作站**：Ubuntu 22.04 + NVIDIA 驱动 + CUDA + Docker

## Linux 基础命令速查

### 文件和目录操作

```bash
pwd                    # 显示当前目录
ls                     # 列出目录内容
ls -lah                # 详细列表（隐藏文件 + 人类可读大小）
cd <path>              # 切换目录
cd ~                   # 回到家目录
cd -                   # 回到上一个目录
mkdir <name>           # 创建目录
mkdir -p a/b/c         # 递归创建多级目录
rm <file>              # 删除文件
rm -rf <dir>           # 递归强制删除目录（⚠️ 危险！）
cp src dst             # 复制
mv src dst             # 移动 / 重命名
ln -s src link         # 创建软链接（符号链接）
find . -name "*.py"    # 查找文件
```

### 查看文件内容

```bash
cat <file>             # 输出整个文件
head -n 20 <file>      # 查看前 20 行
tail -n 20 <file>      # 查看后 20 行
tail -f <file>         # 实时追踪文件追加
less <file>            # 分页查看（推荐！比 more 功能强）
grep "关键词" <file>   # 在文件中搜索
wc -l <file>           # 统计行数
```

### 进程和系统管理

```bash
ps aux                 # 查看所有进程
ps aux | grep python   # 查找 Python 进程
top                    # 实时系统监控（经典）
htop                   # 更友好的 top（推荐！）
kill <pid>             # 发送信号终止进程
kill -9 <pid>          # 强制终止
killall python         # 终止所有同名进程
systemctl status nginx # 查看服务状态
systemctl start nginx  # 启动服务
systemctl enable nginx # 设置开机自启
journalctl -u nginx    # 查看服务日志
```

### 权限管理

Linux 文件权限由三个部分组成：所有者(user)、组(group)、其他(other)，每部分各有读(r)、写(w)、执行(x) 权限。

```bash
ls -l                  # 查看权限
# 输出示例：
# -rwxr-xr-- 1 alice dev  1234 Jun 20 12:00 script.sh
#  ↑ ↑↑↑↑↑↑ ↑↑↑  ↑↑↑
#  │  u    g    o    ← 用户组
#  │  ← 权限位 →
#  └─ 文件类型（- 文件 / d 目录 / l 链接）

chmod +x script.sh     # 加执行权限
chmod 755 script.sh    # 数字权限：u=rwx(7), g=rx(5), o=rx(5)
chmod u+w,g-w,o=r     # 符号权限
chown user:group file  # 改变文件所有者（需 root）
```

### 包管理（以 Debian/Ubuntu 为例）

```bash
sudo apt update        # 更新软件包索引
sudo apt upgrade       # 升级所有可升级的包
sudo apt install nginx # 安装软件
sudo apt remove nginx  # 卸载软件（保留配置）
sudo apt purge nginx   # 彻底卸载
apt search <keyword>   # 搜索包
apt show <pkg>         # 查看包信息
dpkg -l | grep python  # 列出已安装包
```

### 网络与远程操作

```bash
ssh user@server.com    # SSH 远程登录
scp file user@host:.   # 安全复制文件到远程
rsync -avz src/ dst/   # 高效同步目录（增量传输）
ifconfig / ip addr     # 查看网络接口（ip 是现代写法）
ping google.com        # 测试网络连通
curl https://api.com   # 命令行 HTTP 请求（最常用）
wget <url>             # 下载文件
netstat -tulpn         # 查看监听端口（或 ss -tulpn）
```

### 磁盘和空间管理

```bash
df -h                  # 磁盘使用情况（人类可读）
du -sh <dir>           # 目录大小汇总
du -h --max-depth=1    # 查看一级子目录大小
lsblk                  # 列出块设备（磁盘和分区）
mount /dev/sdb1 /data  # 挂载文件系统
```

### Shell 基本技巧

```bash
# 重定向
echo "hello" > file.txt      # 覆盖写入
echo "world" >> file.txt     # 追加写入
cat < input.txt              # 从文件读入 stdin

# 管道（把一个命令的输出作为另一个命令的输入）
cat access.log | grep "404" | wc -l

# 命令替换
echo "今天是 $(date)"
echo "目录下有 $(ls | wc -l) 个文件"

# 后台运行
python train.py &           # 后台运行（关闭 SSH 仍会被杀）
nohup python train.py &     # 忽略 HUP 信号（关闭 SSH 也继续）
tmux / screen               # 更好的方案：终端多路复用器
```

## Shell 脚本入门

创建 `myscript.sh`：

```bash
#!/bin/bash
# 这是注释

# 变量
NAME="Alice"
echo "Hello, $NAME!"

# 命令行参数
echo "脚本名: $0"
echo "第一个参数: $1"
echo "参数总数: $#"

# 条件判断
if [ -f "data.txt" ]; then
    echo "文件存在"
else
    echo "文件不存在"
fi

# 循环
for file in *.log; do
    echo "处理 $file"
    gzip $file
done

# 函数
greet() {
    echo "Hi, $1!"
}
greet "World"
```

运行方法：
```bash
chmod +x myscript.sh
./myscript.sh arg1 arg2
```

## AI/ML 工程师常用的 Linux 操作

### 1. GPU 监控

```bash
nvidia-smi                     # 基础 GPU 信息
nvidia-smi -l 1                # 每秒刷新
watch -n1 nvidia-smi           # 同上（终端彩色显示更好）
nvtop                          # GPU 版 htop（推荐安装）
```

### 2. Jupyter Notebook 远程访问

```bash
# 服务器端启动
jupyter notebook --no-browser --port=8888

# 本地端口转发（SSH tunnel）
ssh -N -f -L localhost:8888:localhost:8888 user@server

# 然后在本地浏览器打开 http://localhost:8888
```

### 3. 训练任务后台运行

```bash
# 推荐使用 tmux（可重连、可分屏）
tmux new -s training
# ... 启动训练 ...
# Ctrl+B, D → 断开会话
tmux attach -t training    # 重新连接

# 或者用 nohup + 日志
nohup python train.py > training.log 2>&1 &
echo $! > pid.txt           # 记录 PID
```

### 4. 监控训练日志

```bash
# 实时查看最新日志
tail -f training.log

# 搜索特定信息
grep "loss" training.log | tail -n 20

# 用 grep 提取数字+简单统计
grep -oP "loss: \K[0-9.]+" training.log | awk '{sum+=$1} END {print "平均loss:", sum/NR}'
```

### 5. 清理磁盘空间（跑实验常遇到的问题）

```bash
# 找出最大的文件/目录
du -ah --max-depth=1 | sort -rh | head -n 10

# 清理缓存
rm -rf ~/.cache/pip
rm -rf ~/.cache/huggingface

# 清理 Docker（注意！这会删除未使用的一切）
docker system prune -a --volumes
```

### 6. 文件传输

```bash
# 从本地上传到服务器
scp -r ./data user@server:/home/user/project/

# 从服务器下载到本地
scp user@server:/home/user/model.pt ./models/

# 更高效的方法（支持断点续传）
rsync -avz --progress ./data/ user@server:/home/user/project/
```

## 系统管理基础

### 用户管理

```bash
sudo adduser newuser          # 创建用户
sudo usermod -aG sudo newuser # 加入 sudo 组
su - newuser                  # 切换用户
sudo deluser newuser          # 删除用户
```

### 服务管理 (Systemd)

```bash
# 查看/控制服务
sudo systemctl status nginx
sudo systemctl start/stop/restart/reload nginx
sudo systemctl enable/disable nginx   # 开机自启开关

# 查看日志
sudo journalctl -u nginx.service
sudo journalctl -u nginx.service -f   # 实时
sudo journalctl --since "1 hour ago"
```

### 定时任务 (Cron)

```bash
crontab -e                      # 编辑当前用户的 crontab
# 格式
# ┌───────── 分钟 (0-59)
# │ ┌─────── 小时 (0-23)
# │ │ ┌───── 日 (1-31)
# │ │ │ ┌─── 月 (1-12)
# │ │ │ │ ┌─ 星期 (0-7, 0/7=周日)
# │ │ │ │ │
  0  2 * * * /home/user/backup.sh    # 每天凌晨 2 点执行备份
*/10 * * * * /home/user/check.sh    # 每 10 分钟检查
```

## 推荐的开发者工具栈

| 工具 | 用途 | 说明 |
|------|------|-----|
| **tmux / screen** | 终端多路复用 | 跑长任务必用 |
| **htop / glances** | 系统监控 | 比 top 更好用 |
| **nvtop** | GPU 监控 | NVIDIA/AMD/Intel 通用 |
| **fzf** | 模糊文件搜索 | 交互式搜索利器 |
| **ripgrep (rg)** | 代码搜索 | 比 grep 快得多 |
| **zsh + oh-my-zsh** | Shell | 自动补全、插件生态 |
| **ncdu** | 磁盘分析 | 交互式找出空间占用 |
| **LazyGit / GitUI** | Git TUI | 终端里的 Git GUI |
| **btop** | 资源监控 | 最漂亮的终端监控器 |

## 常见问题排查流程

### 进程挂了 → 查日志

```bash
# 1. 还在运行吗？
ps aux | grep <process_name>

# 2. 看日志（如果是 Systemd 服务）
journalctl -u <service> --since "10 minutes ago"

# 3. 如果有配置文件，检查语法
nginx -t          # 测试 Nginx 配置
python -c "import yaml; yaml.safe_load(open('config.yaml'))"

# 4. 重新运行并看输出
sudo systemctl restart <service>
sudo systemctl status <service>
```

### 磁盘满了 → 定位元凶

```bash
df -h                          # 整体情况
du -h --max-depth=1 / | sort -h  # 根目录下一级排查
ncdu /                         # 交互式扫描（推荐安装）
```

### 网络不通 → 分层诊断

```bash
ping 8.8.8.8                   # 1. 到公网 IP 通吗？
ping google.com                # 2. DNS 能解析吗？
curl -v https://api.com        # 3. HTTP 能通吗？
sudo lsof -i :8000             # 4. 端口被谁占了？
sudo ufw status                # 5. 防火墙规则？
```

## Linux 学习路径

```
第一阶段：生存
  ├── 文件系统、导航、基本命令
  ├── vim/nano 编辑器
  ├── 权限概念
  └── 能用 SSH 远程操作服务器

第二阶段：熟练
  ├── Shell 脚本
  ├── grep/awk/sed 文本处理三剑客
  ├── 进程和服务管理
  ├── 管道和重定向
  └── crontab 定时任务

第三阶段：系统管理
  ├── 用户/组/权限/ACL
  ├── 磁盘/文件系统/LVM
  ├── 网络配置/防火墙
  ├── Systemd 深入
  ├── 日志系统
  └── 系统排障

第四阶段：生产运维
  ├── 监控 (Prometheus/Grafana)
  ├── 自动化 (Ansible)
  ├── 容器 (Docker + Kubernetes)
  ├── CI/CD (GitHub Actions / GitLab CI)
  └── 安全加固

第五阶段：内核 & 性能
  ├── 性能分析工具 (perf / bcc / bpftrace)
  ├── 内核参数调优
  ├── 网络深度分析 (tcpdump / Wireshark)
  └── eBPF 编程
```

## 推荐学习资源

- **The Linux Command Line**（经典书籍，有免费中文版）
- **LinuxFromScratch**：如果想彻底理解系统是怎么构建的
- **TLDR Pages**：[tldr.sh](https://tldr.sh/) — 超简洁的命令示例
- **Linux 性能优化实战**（极客时间专栏，中文）
- **Linux man pages**：`man <command>` —— 最权威但最枯燥的文档

相关术语：[Docker](/glossary/docker)、[Git](/glossary/git)、[Shell](/glossary/shell)
