# 操作系统（Operating System）

**操作系统**是管理计算机硬件与软件资源的系统软件，为应用程序提供统一的抽象接口。

## 核心功能

### 1. 进程管理

```
进程生命周期：
  创建 → 就绪 → 运行 → 阻塞 → 终止

进程 vs 线程：
  进程：资源分配的最小单位（独立地址空间）
  线程：CPU 调度的最小单位（共享地址空间）
```

```python
# Python 进程和线程
import multiprocessing
import threading

# 多进程（适合 CPU 密集型）
def cpu_task():
    sum(range(10**7))

processes = [multiprocessing.Process(target=cpu_task) for _ in range(4)]
for p in processes:
    p.start()
for p in processes:
    p.join()

# 多线程（适合 I/O 密集型）
def io_task():
    import urllib.request
    urllib.request.urlopen('https://example.com')

threads = [threading.Thread(target=io_task) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
```

### 2. 内存管理

```
虚拟内存 → 物理内存映射
  ┌─────────────────┐
  │ 虚拟地址空间     │
  ├─────────────────┤
  │ 用户空间         │ ← 每个进程独立
  ├─────────────────┤
  │ 内核空间         │ ← 所有进程共享
  └─────────────────┘
         ↓ 页表映射
  ┌─────────────────┐
  │ 物理内存         │
  └─────────────────┘
```

### 3. 文件系统

```bash
# Linux 文件系统层次
/
├── /bin      # 基础命令
├── /etc      # 配置文件
├── /home     # 用户目录
├── /proc     # 进程信息（虚拟）
├── /tmp      # 临时文件
├── /var      # 可变数据（日志等）
└── /usr      # 用户程序
```

### 4. I/O 管理

```
I/O 模型：
  阻塞 I/O：等待完成才返回
  非阻塞 I/O：立即返回，轮询检查
  I/O 多路复用：select/poll/epoll
  异步 I/O：完成通知机制
```

## Linux 常用命令

```bash
# 进程管理
ps aux                    # 查看进程
top                       # 实时进程监控
kill -9 <pid>             # 强制终止进程
nohup command &           # 后台运行

# 内存管理
free -h                   # 查看内存使用
vmstat 1                  # 虚拟内存统计

# 文件系统
df -h                     # 磁盘空间
du -sh *                  # 目录大小
find / -name "*.log"      # 查找文件

# 网络
netstat -tulpn            # 查看端口
ss -s                     # 网络统计
```

## 操作系统类型

| 类型 | 特点 | 应用 |
|------|------|------|
| **分时系统** | 多用户交互 | Windows、Linux |
| **实时系统** | 确定性响应 | FreeRTOS、VxWorks |
| **嵌入式系统** | 资源受限 | μC/OS、RT-Thread |

## 应用场景

- **服务器运维**：Linux 服务器配置和管理
- **性能优化**：理解系统调用、内存管理优化瓶颈
- **嵌入式开发**：RTOS 选择和任务调度
- **安全审计**：权限管理、系统加固

## 相关概念

[Linux](/glossary/linux)、[进程调度](/glossary/scheduling)、[内存管理](/glossary/memory-management)、[实时操作系统](/glossary/rtos)
