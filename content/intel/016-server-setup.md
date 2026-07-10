---
title: Linux 服务器深度学习环境配置
category: devops
difficulty: intermediate
duration: 1-2周
summary: 从零搭起一台能跑 PyTorch 的 GPU 服务器：驱动、CUDA、Conda、SSH 与远程训练全都能自己搞定
takeaways:
  - 会安装 NVIDIA 驱动 + CUDA Toolkit，并能验证与 PyTorch 匹配
  - 能用 Conda 为每个项目创建独立 Python 环境
  - 会配置 SSH 公私钥登录和基本安全加固
  - 会用 tmux 让训练在后台长期跑，断网也不中断
relatedIntel:
  - 007-docker
  - 008-git
  - 009-linux
relatedNodes:
  - "devops-kubernetes"
  - "electrical-safety"
tags:
  - ubuntu
  - server setup
  - nvidia
  - cuda
  - conda
  - ssh
  - tmux
relatedTerms:
  - "linux"
  - "docker"
  - "kubernetes"
  - "git"
relatedTools:
  - "kubernetes"
  - "mlflow"
  - "docker"
---

## 为什么你要学它

做深度学习的第一关不是"算法"，而是"把你的代码跑在正确的机器上"。你在本地笔记本上写的 `import torch; print(torch.cuda.is_available())` 到了服务器上很可能返回 False，原因可能是驱动没装、CUDA 版本不对、conda 环境没隔离好，或者你根本没连上正确的 GPU 机器。

更麻烦的是训练一跑就是几小时甚至几天，你一关电脑终端就没了——这时候就需要 tmux/nohup 这种"后台马拉松选手"。学完这套配置，你就拥有了一台属于自己、随时可以 ssh 上去、断网也不丢训练的"远程工作站"，后面再折腾模型才谈得上效率。

## 一句话概览（快速版）

- 服务器环境的核心是「驱动 + CUDA + cuDNN + 项目 Python 环境」四层，任何一层不匹配都会让 `torch.cuda.is_available()` 返回 False。
- 用 Conda/Mamba 做项目级隔离，每个项目一个环境，升级/切换版本不会影响别人。
- 用 SSH 公私钥 + 改端口做登录安全，用 tmux 保留会话，训练跑几天都不怕断线。

## 核心拆解

### 🔑 NVIDIA 驱动：让操作系统看到你的 GPU

GPU 是硬件，驱动是让内核认出来它的那块"翻译官"。装完驱动后 `nvidia-smi` 能看到显卡型号、显存、功耗，就是最直接的验证。

为什么不装最新驱动就完事？因为 PyTorch 的某个版本只保证跟某个范围的驱动/CUDA 组合测过，盲目追新容易踩上"别人没遇到过的坑"。一般按你项目要用到的 PyTorch 版本，去官网查它推荐的 CUDA 版本，再据此选驱动。

### 🔑 CUDA Toolkit：NVIDIA 的并行计算库

CUDA Toolkit 包含编译器 `nvcc`、CUDA runtime、以及一堆头文件和库。它和驱动是两件事：驱动版本决定了你能支持的"最高 CUDA 版本"，而 Toolkit 是你实际编译/链接时用的那个。

PyTorch 的 conda 包通常会自带它自己的 CUDA runtime（`pytorch-cuda=11.8` 这种 meta package），所以很多时候你**只需要装好驱动，不需要单独在系统层面装完整 Toolkit**——但如果你要编译自定义 CUDA kernel（比如用 cupy、flash-attention 的源码），那就必须单独装一份和 PyTorch 版本匹配的 Toolkit。

### 🔑 cuDNN：加速卷积/Attention 的黑盒库

cuDNN 是 NVIDIA 针对深度神经网络算子做的高性能实现。PyTorch/TF 都会在有 GPU 时默认走 cuDNN 路径。

你通常不需要单独装 cuDNN：`conda install pytorch-cuda=xxx` 会把对应的 cuDNN 一起装到环境里。但如果你走"系统 CUDA + pip"路径，要记得把 `CUDNN_PATH` 指对。

### 🔑 Conda：让每个项目都有自己的 Python 小岛

conda 最重要的功能是"环境隔离"：每个项目一个 `my_project` 环境，版本完全独立。这样你不会因为升级 `numpy` 导致同事项目崩掉。

建议：

- 用 `conda-forge` 作为主要 channel（它包最齐全、更新最快）。
- 包比较大、依赖复杂的用 `mamba` 代替 `conda` 做解析（速度快十倍）。
- 每个项目写一份 `environment.yml` 并提交到 Git，别人照着就能复现。

### 🔑 SSH + tmux：远程工作的左右手

SSH 是你登录服务器的通道。安全上要做三件事：用 ed25519 公私钥登录、禁用密码登录、禁用 root 登录，再把端口从 22 改成其它数字，基本能挡住绝大多数自动化扫描。

tmux 是"终端复用器"——你在一个会话里开训练，然后 `Ctrl+B, D` 离开它，哪怕关闭本地电脑的 SSH 连接，远程里的进程仍然在跑。下次登录后 `tmux attach -t train` 就能接回去。它也可以把一个终端切成好几块，一边看训练日志，一边看 `nvidia-smi`。

## 完整跑通方案

### 第一步：装 NVIDIA 驱动

```bash
# 查看当前内核支持什么驱动版本
ubuntu-drivers devices

# 选择系统推荐的稳定版（也可以指定 nvidia-driver-550 之类的具体版本）
sudo apt update
sudo apt install -y nvidia-driver-550

# 装完必须重启
sudo reboot

# 验证
nvidia-smi
# 应能看到 GPU 型号、显存、CUDA Version（这是驱动支持的最高 CUDA 版本）
```

### 第二步：用 Conda 建一个 PyTorch 项目环境

```bash
# 1. 下载 miniconda（如果还没装）
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh -b
source ~/miniconda3/etc/profile.d/conda.sh
conda init bash
source ~/.bashrc

# 2. 创建项目环境（以 Python 3.10 + PyTorch 2.1 + CUDA 11.8 为例）
conda create -n dl python=3.10 -y
conda activate dl
conda install pytorch==2.1.0 torchvision==0.16.0 pytorch-cuda=11.8 \
    -c pytorch -c nvidia -y

# 3. 验证
python - << 'PY'
import torch
print("torch version :", torch.__version__)
print("cuda available:", torch.cuda.is_available())
if torch.cuda.is_available():
    print("device count :", torch.cuda.device_count())
    print("device name  :", torch.cuda.get_device_name(0))
    x = torch.randn(1024, 1024, device="cuda")
    print("cuda matmul ok:", (x @ x).shape)
PY
```

### 第三步：SSH 公私钥登录与安全加固

```bash
# 本地（你自己的电脑）上生成一对密钥（如果还没有）
# ssh-keygen -t ed25519 -C "your_email@example.com"  # 本地执行，一路回车
# 然后把公钥复制到服务器
# ssh-copy-id -i ~/.ssh/id_ed25519.pub yourname@SERVER_IP

# 服务器上做加固
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
sudo tee -a /etc/ssh/sshd_config > /dev/null << 'SSHCFG'
Port 2222
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
ClientAliveInterval 60
SSHCFG

sudo systemctl restart ssh
# 别忘了：如果开了 ufw 或云厂商安全组，放行 2222 端口
# sudo ufw allow 2222/tcp

# 本地配置 ~/.ssh/config 以便一键登录
cat >> ~/.ssh/config << 'EOF'
Host devserver
    HostName 123.456.789.0
    User yourname
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
EOF
# 之后只要 `ssh devserver` 就能连上去
```

### 第四步：用 tmux 让训练长时间跑

```bash
# 新建一个叫 train 的会话
tmux new -s train

# 进入项目目录、切环境、启动训练
cd ~/projects/my_model
conda activate dl
python train.py --batch-size 32 --epochs 100

# 按 Ctrl+B 然后按 D，即可"分离"会话；终端可以关闭，训练仍然继续
# 重新登录后接回去
tmux attach -t train

# 查看所有会话
tmux ls

# 如果你只想快速起一个后台任务，用 nohup 也行
nohup python -u train.py > train.log 2>&1 &
echo $! > train.pid    # 把 PID 记下来，方便后续 kill
```

### 第五步：写一份 environment.yml，让项目能复现

```yaml
# environment.yml —— 用 `conda env create -f environment.yml` 创建
name: dl
channels:
  - conda-forge
  - pytorch
  - nvidia
dependencies:
  - python=3.10
  - pip
  - pytorch=2.1.0
  - torchvision=0.16.0
  - pytorch-cuda=11.8
  - numpy
  - pandas
  - scikit-learn
  - matplotlib
  - jupyterlab
  - pip:
      - transformers
      - accelerate
      - tqdm
      - wandb
```

创建命令：

```bash
conda env create -f environment.yml
conda activate dl
python -c "import torch, transformers; print(torch.cuda.is_available(), transformers.__version__)"
```

## 常见误区

**误区 1：`nvidia-smi` 里显示的 CUDA 版本必须和我装的 Toolkit 完全一致。**
解释：`nvidia-smi` 里的 "CUDA Version" 是驱动**支持的最高**CUDA 版本，不是实际装的 Toolkit 版本。真正跑起来的 Toolkit 版本由你 conda 环境里的 `pytorch-cuda` 决定，只要不高于驱动支持的版本就没问题。

**误区 2：conda 环境可以随便混用 conda 和 pip 装同个包。**
解释：最好遵循"能 conda 就 conda，不能再 pip"的原则；pip 包应放在 `dependencies.pip` 里。同一个包又 conda 又 pip，会让依赖解析器错乱，最终得到一个别人复现不了的环境。

**误区 3：`torch.cuda.is_available()` 返回 True 就代表一切就绪。**
解释：它只告诉你 PyTorch 能找到 CUDA runtime。要真正验证跑通，一定要再跑一个最小算子（比如 `torch.randn(4,4).cuda() @ torch.randn(4,4).cuda()`），确认不抛 OOM、不抛 cuDNN 初始化错误。

**误区 4：tmux 只是"让窗口不丢"，没用就没必要学。**
解释：它的作用远不止这个——你可以水平/垂直分屏一边跑训练一边看 `watch -n1 nvidia-smi`，也可以在一个窗口里打开多个终端做对比实验，学习成本很低但回报非常高。

**误区 5：直接把训练进程 `kill -9` 杀掉，下次接着跑。**
解释：粗暴杀掉会让你的 checkpoint 写坏、DDP 下进程挂不彻底。正确做法：在训练脚本里接住 SIGINT / 写 `step` 级 checkpoint；外部用 `kill $(cat train.pid)` 而不是 `kill -9`。
