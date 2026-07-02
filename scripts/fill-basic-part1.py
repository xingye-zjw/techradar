with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# =====================================================
# 1. Fill linux-basic (days 2-5)
# =====================================================
old1 = '''checkpoint: "能在 Linux 环境下完成基本的文件操作和系统管理" },
    ],
  },
{
    id: "git-github",'''

new1 = '''checkpoint: "能在 Linux 环境下完成基本的文件操作和系统管理" },
      { day: 2, title: "用户权限与系统管理",
        summary: "理解 Linux 用户权限体系，掌握 sudo、su、权限管理命令", content: {
          objective: "今天你将深入学习 Linux 的用户权限体系。学完后能理解 root 和普通用户的区别，掌握 sudo 和 su 的使用，管理文件权限（chmod、chown），理解用户组和权限位的概念。",
          key_points: [
            "用户体系：root（超级用户）和普通用户，root 有最高权限，普通用户权限受限",
            "sudo vs su：sudo 以 root 权限执行单个命令，su 切换到 root 用户",
            "文件权限：r（读）、w（写）、x（执行），分为 owner/group/others 三组",
            "chmod：修改文件权限，数字模式（755）和符号模式（u+x）",
            "chown/chgrp：修改文件所有者和所属组"
          ],
          practice: "用户权限实战：1）用户管理：a）查看当前用户：whoami、id；b）查看系统用户：cat /etc/passwd；c）创建新用户：sudo useradd testuser；d）设置密码：sudo passwd testuser。2）权限切换：a）用 su 切换到 root；b）用 sudo 执行单个命令；c）理解 sudoers 配置。3）文件权限：a）查看权限：ls -l；b）chmod 修改权限——试试 755、644、700；c）用符号模式：chmod u+x file, chmod g-w file；d）理解权限数字的含义。4）所有者管理：a）chown 修改所有者；b）chgrp 修改所属组；c）试试递归修改（-R）。5）实际场景：a）为什么有些文件只有 root 能修改？b）为什么脚本需要执行权限？c）配置文件通常是什么权限（644）？6）思考：sudo 比 su 更安全，为什么？",
          deep_dive: "Linux 的权限体系是其安全性的基石，理解它对系统管理和安全都很重要：1）为什么需要权限系统？多用户系统如果不限制权限，任何用户都能修改任何文件，系统就不稳定、不安全。Linux 的权限系统让每个用户只能操作自己的文件，关键系统文件只有 root 能修改。2）root 的特殊性：root 用户 UID 是 0，可以做任何事——修改任何文件、杀死任何进程、安装任何软件。但这也意味着 root 误操作可能破坏系统，所以要谨慎使用。sudo 让普通用户在需要时获得 root 权限，比一直用 root 更安全。3）权限位的含义：rwx 三个权限位，对应数字 4-2-1。755 = rwxr-xr-x（owner 全权限，group/others 可读可执行）。644 = rw-r--r--（owner 可读写，group/others 只读）。777 = rwxrwxrwx（所有人全权限，危险！）。4）特殊权限：a）SUID（4）：执行时获得文件所有者权限，如 passwd 命令；b）SGID（2）：执行时获得文件所属组权限；c）Sticky bit（1）：目录中只有文件所有者能删除，如 /tmp。5）用户组的价值：用户组让权限管理更灵活——把多个用户加入同一个组，组权限控制他们对共享文件的访问。比如开发组共享代码目录。6）安全最佳实践：a）不要用 root 日常操作；b）敏感文件权限设为 600 或 400；c）定期检查异常权限（如 777 文件）；d）用 sudoers 限制哪些用户能用 sudo；e）日志记录 sudo 操作。"
        }, duration: "2.5小时", resources: [R_LINUX_JOURNEY, B_LINUX_TUTORIAL], checkpoint: "能管理用户权限，理解 chmod/chown 的用法和权限位含义" },
      { day: 3, title: "文本处理与管道",
        summary: "掌握文本处理三剑客（grep/sed/awk）和管道组合技巧", content: {
          objective: "今天你将学习 Linux 文本处理的强大工具——grep、sed、awk 和管道。学完后能用 grep 搜索文本、用 sed 替换文本、用 awk 分析文本，能用管道组合命令完成复杂任务。",
          key_points: [
            "grep：文本搜索，支持正则表达式，常用选项 -i（忽略大小写）、-v（反向）、-n（显示行号）",
            "sed：流编辑器，用于文本替换、删除、插入，常用 sed 's/old/new/g'",
            "awk：文本分析工具，按列处理，擅长格式化输出和统计",
            "管道（|）：连接多个命令，前一个的输出作为后一个的输入",
            "组合技巧：grep 过滤 | awk 提取 | sort 排序 | uniq 统计"
          ],
          practice: "文本处理实战：1）grep 练习：a）grep 'error' log.txt 搜索包含 error 的行；b）grep -i 'error' 忽略大小写；c）grep -v 'debug' 排除包含 debug 的行；d）grep -n 显示行号；e）grep -r 递归搜索目录；f）grep -E 使用扩展正则。2）sed 练习：a）sed 's/old/new/g' file 替换所有 old 为 new；b）sed 's/old/new/' 只替换每行第一个；c）sed -i 直接修改文件；d）sed '3d' 删除第 3 行；e）sed '2,5d' 删除 2-5 行。3）awk 练习：a）awk '{print $1}' 打印第一列；b）awk -F: '{print $1}' 以冒号分隔；c）awk '{sum+=$1} END {print sum}' 统计第一列总和；d）awk '$3 > 100 {print $0}' 过滤第三列大于 100 的行；e）awk '{print NR, $0}' 打印行号。4）管道组合：a）cat log | grep error | wc -l 统计错误数；b）ps aux | grep python 查找 Python 进程；c）ls -l | awk '{print $5}' | sort -n 按文件大小排序；d）history | awk '{print $2}' | sort | uniq -c | sort -nr 统计最常用命令。5）实战任务：分析一个日志文件——a）找出所有错误日志；b）统计各类型错误数量；c）提取错误发生时间；d）找出最频繁的错误。6）思考：为什么说管道是 Linux 的灵魂？",
          deep_dive: "文本处理是 Linux 最强大的能力之一，掌握 grep/sed/awk 能极大提升效率：1）为什么 Linux 文本处理这么重要？Linux 系统大量使用文本——配置文件、日志文件、输出结果都是文本。能高效处理文本意味着能高效管理系统。grep/sed/awk 三剑客加上管道，能完成 90% 的文本处理需求。2）grep 的正则表达式：grep 支持正则，可以做复杂匹配——a）grep 'err[0-9]' 匹配 err0、err1 等；b）grep '^Start' 匹配以 Start 开头的行；c）grep 'end$' 匹配以 end 结尾的行；d）grep 'a.*b' 匹配 a 和 b 之间任意字符；e）grep -E 'a|b' 匹配 a 或 b（扩展正则）。3）sed 的流编辑思想：sed 不是交互式编辑器，而是「流」编辑——读一行、处理一行、输出一行。适合批量处理大文件。常用操作：替换、删除、插入。进阶技巧：a）sed '/pattern/d' 删除匹配行；b）sed '1i header' 在第一行插入；c）sed '/start/,/end/d' 删除从 start 到 end 的块。4）awk 的强大：awk 其实是一门完整的编程语言，擅长按列处理文本。核心概念：a）$0 整行，$1 第 1 列；b）NR 行号，NF 列数；c）BEGIN/END 块；d）条件判断和循环。awk 能做统计、格式化、数据清洗等复杂任务。5）管道的哲学：管道体现了 Unix 的哲学——「做一件事并做好」，然后用管道组合。每个命令专注自己的功能，组合起来能完成复杂任务。ls 列出文件，grep 过滤，awk 提取，sort 排序——各司其职。6）性能考量：处理大文件时，管道链太长会影响性能。可以用单个 awk 替代多个管道命令。比如 awk '/error/ {count++} END {print count}' 比 grep error | wc -l 更高效。"
        }, duration: "3小时", resources: [R_LINUX_JOURNEY, B_LINUX_TUTORIAL, { title: "AWK 入门教程", url: "https://www.runoob.com/linux/linux-comm-awk.html", required: false }], checkpoint: "能用 grep/sed/awk 处理文本，用管道组合命令完成复杂任务" },
      { day: 4, title: "进程管理与 Shell 脚本",
        summary: "理解进程概念，掌握进程管理命令，学习 Shell 脚本基础", content: {
          objective: "今天你将学习进程管理和 Shell 脚本。学完后能查看和管理进程，理解前台/后台任务，掌握 Shell 脚本的基本语法，能写简单的自动化脚本。",
          key_points: [
            "进程概念：程序的一次执行，有 PID、状态、优先级等属性",
            "进程管理：ps 查看进程、top 实时监控、kill 发送信号、killall 批量终止",
            "前后台：前台占用终端，后台不占用（&、nohup、jobs、fg、bg）",
            "Shell 脚本：变量、条件判断（if）、循环（for/while）、函数",
            "脚本执行：bash script.sh 或 chmod +x 后直接执行"
          ],
          practice: "进程管理与脚本实战：1）进程查看：a）ps aux 查看所有进程；b）ps aux | grep python 查找特定进程；c）top 实时监控，按 q 退出；d）htop（更友好，需安装）。2）进程管理：a）kill PID 终止进程；b）kill -9 PID 强制终止；c）kill -l 查看信号列表；d）killall python 终止所有 Python 进程。3）前后台任务：a）sleep 100 & 后台运行；b）jobs 查看后台任务；c）fg %1 把任务 1 调到前台；d）Ctrl+Z 暂停前台任务，bg 继续后台；e）nohup ./server & 即使终端关闭也继续运行。4）Shell 脚本基础：a）创建脚本文件，第一行写 #!/bin/bash；b）变量：name=\"test\", echo $name；c）条件：if [ condition ]; then ... fi；d）循环：for i in 1 2 3; do ... done；e）函数：function foo() { ... }。5）写一个脚本：自动备份——a）创建目录；b）复制文件；c）添加时间戳；d）输出结果。6）思考：为什么需要 Shell 脚本？它能解决什么问题？",
          deep_dive: "进程管理和 Shell 脚本是 Linux 进阶的核心技能：1）进程的本质：进程是程序的执行实例——一个程序可以运行多次，每次是一个进程。进程有独立的内存空间、文件描述符、环境变量。理解进程是理解操作系统的基础。2）进程状态：进程有多种状态——Running（运行）、Sleeping（睡眠）、Stopped（暂停）、Zombie（僵尸）。僵尸进程是已结束但父进程没回收的进程，太多僵尸会占用资源。top 和 ps 能看到进程状态。3）kill 信号：kill 不是「杀死」，而是「发送信号」。常用信号：a）SIGTERM（15）：请求终止，进程可以捕获并优雅退出；b）SIGKILL（9）：强制终止，进程无法捕获；c）SIGINT（2）：Ctrl+C 中断；d）SIGHUP（1）：终端关闭或配置重载。优先用 SIGTERM，不行再用 SIGKILL。4）后台任务的场景：长时间运行的程序（如服务器）需要在后台运行。nohup + & 让程序脱离终端运行。用 jobs 管理当前终端的后台任务，但关闭终端后 jobs 就无效了，所以持久后台任务要用 systemd 或 screen/tmux。5）Shell 脚本的哲学：Shell 脚本本质是把命令组合起来自动化执行。好脚本的特点：a）清晰的注释；b）合理的错误处理；c）参数化（接受参数而不是硬编码）；d）日志输出；e）返回正确的退出码。6）脚本进阶：掌握基础后可以学习进阶——a）数组；b）字符串处理；c）正则表达式；d）文件测试（-f、-d、-e）；e）进程替换；f）here document。Shell 脚本虽然语法古老，但在系统管理、自动化部署中仍然是主力工具。"
        }, duration: "3.5小时", resources: [R_LINUX_JOURNEY, B_LINUX_TUTORIAL, { title: "Shell 脚本教程", url: "https://www.runoob.com/linux/linux-shell.html", required: false }], checkpoint: "能管理进程，写简单的 Shell 脚本完成自动化任务" },
      { day: 5, title: "网络基础与服务管理",
        summary: "理解网络基础，掌握网络命令和服务管理（systemd）", content: {
          objective: "今天你将学习网络基础和服务管理。学完后能查看网络配置、诊断网络问题，理解 systemd 服务管理，能管理系统服务的启动和停止。",
          key_points: [
            "网络配置：ip addr 查看网络接口、ip route 查看路由、ping 测试连通性",
            "网络诊断：netstat/ss 查看端口、curl/wget 测试 HTTP、telnet 测试端口",
            "DNS 与域名：/etc/resolv.conf 配置 DNS、nslookup/dig 查询域名",
            "systemd：现代 Linux 的服务管理器，用 systemctl 管理服务",
            "服务管理：systemctl start/stop/restart/enable/disable/status"
          ],
          practice: "网络与服务实战：1）网络查看：a）ip addr 查看网络接口和 IP；b）ip route 查看路由表；c）ping baidu.com 测试连通性；d）ping -c 3 只 ping 3 次；e）traceroute baidu.com 查看路由路径。2）端口查看：a）ss -tlnp 查看监听的 TCP 端口；b）ss -tunlp 查看所有监听端口；c）netstat（旧命令，类似）；d）lsof -i :80 查看 80 端口被谁占用。3）网络诊断：a）curl https://baidu.com 发送 HTTP 请求；b）curl -I 只看响应头；c）wget 下载文件；d）telnet localhost 80 测试本地 80 端口；e）ssh user@host 远程连接。4）systemd 服务管理：a）systemctl status nginx 查看服务状态；b）systemctl start nginx 启动服务；c）systemctl stop nginx 停止服务；d）systemctl restart nginx 重启服务；e）systemctl enable nginx 设置开机自启；f）systemctl disable nginx 禁用开机自启。5）查看服务日志：a）journalctl -u nginx 查看 nginx 服务日志；b）journalctl -f 实时查看日志；c）journalctl --since today 查看今天的日志。6）思考：systemd 比 init.d 好在哪里？",
          deep_dive: "网络和服务管理是运维工作的核心，理解它们能让你更好地管理和诊断系统：1）网络配置的演进：传统的 ifconfig 和 route 命令已被废弃，现代 Linux 用 ip 命令。ip 命令更强大，支持更多功能。学习网络命令时优先学习 ip 系列。2）网络诊断的思路：网络问题诊断是系统性工作——a）先 ping 本地回环（127.0.0.1）确认网卡正常；b）ping 同网段主机确认局域网正常；c）ping 外网确认出口正常；d）traceroute 找问题节点；e）检查 DNS 解析。按照这个顺序逐步定位。3）端口和安全：开放的端口是攻击的入口。a）只开放必要的端口；b）用防火墙（iptables/ufw/firewalld）限制访问；c）定期检查异常监听端口。ss/netstat 能看到哪些端口在监听，哪些进程在监听。4）systemd 的革命：systemd 取代了传统的 init 系统，成为现代 Linux 的标准。它不只是服务管理器，还包括日志管理、定时任务、网络管理等。systemd 的优势：a）并行启动服务，加快启动速度；b）服务依赖管理；c）统一的日志系统；d）socket 激活（按需启动）。理解 systemd 对现代 Linux 运维很重要。5）服务配置文件：systemd 服务配置文件在 /etc/systemd/system/ 或 /lib/systemd/system/。了解配置文件结构能帮你自定义服务——a）ExecStart：启动命令；b）Restart：重启策略；c）User：运行用户；d）WorkingDirectory：工作目录。6）日志的价值：journalctl 统一管理系统和服务日志。它支持过滤、时间范围、实时查看等。学会用 journalctl 查日志对故障诊断至关重要。配合 grep、awk 能快速定位问题。"
        }, duration: "3小时", resources: [R_LINUX_JOURNEY, B_LINUX_TUTORIAL], checkpoint: "能诊断网络问题，用 systemctl 管理系统服务" },
    ],
  },
{
    id: "git-github",'''

if old1 in content:
    content = content.replace(old1, new1)
    print('1. linux-basic: OK')
else:
    print('1. linux-basic: NOT FOUND')

# =====================================================
# 2. Fill git-github (days 2-5)
# =====================================================
old2 = '''checkpoint: "能完成 Git 基本的版本控制操作，并推送到 GitHub 远程仓库" },
    ],
  },
{
    id: "docker-basic",'''

new2 = '''checkpoint: "能完成 Git 基本的版本控制操作，并推送到 GitHub 远程仓库" },
      { day: 2, title: "分支管理与合并策略",
        summary: "深入理解分支模型，掌握 merge/rebase/cherry-pick", content: {
          objective: "今天你将深入学习 Git 的分支管理和合并策略。学完后能理解分支的本质，掌握 merge 和 rebase 的区别，理解常用分支模型（如 Git Flow），解决合并冲突。",
          key_points: [
            "分支本质：Git 的分支是指向 commit 的可变指针，创建分支只是创建新指针",
            "merge：创建合并 commit，保留分支历史，适合多人协作",
            "rebase：变基，把分支移到新基底，历史更线性，适合个人开发",
            "cherry-pick：选择性合并单个 commit，适合紧急修复或特定功能",
            "冲突解决：合并冲突时手动编辑冲突文件，标记保留哪些内容"
          ],
          practice: "分支管理实战：1）分支操作：a）git branch 查看所有分支；b）git branch feature 创建分支；c）git checkout feature 切换分支；d）git checkout -b feature 创建并切换；e）git branch -d feature 删除分支。2）merge 练习：a）创建 feature 分支，做修改；b）切回 main，git merge feature；c）观察 merge commit 的历史；d）删除 feature 分支。3）rebase 练习：a）创建 feature 分支，做修改；b）切回 main，做新修改；c）切回 feature，git rebase main；d）观察线性历史；e）对比 merge 和 rebase 的历史图。4）冲突解决：a）在两个分支修改同一行；b）合并产生冲突；c）打开冲突文件，看冲突标记；d）手动解决冲突，删除标记；e）git add 标记解决；f）git commit/rebase --continue 继续。5）cherry-pick：a）在 feature 分支做了一个修复；b）切回 main，git cherry-pick <commit-hash>；c）观察结果。6）分支模型学习：a）了解 Git Flow 模型；b）了解 GitHub Flow 模型；c）思考你的团队适合哪种模型？",
          deep_dive: "分支管理是 Git 最强大的特性，理解它能让你更高效地协作：1）为什么分支这么重要？传统版本控制系统（如 SVN）创建分支是复制整个项目，成本高。Git 的分支只是创建一个 41 字节的指针，瞬间完成。这让分支变得极低成本，鼓励频繁创建分支开发新功能。2）merge vs rebase 的选择：这是 Git 最常见的争论。merge 保留历史，但历史图可能复杂；rebase 线性化历史，但改变了历史。规则：a）公共分支（main、develop）不要 rebase——会改变别人的历史；b）个人分支可以 rebase——保持历史整洁；c）文档说清楚团队用哪种策略。3）Git Flow 模型：Git Flow 是经典的多分支模型——a）main：生产分支；b）develop：开发分支；c）feature：功能分支；d）release：发布分支；e）hotfix：紧急修复。适合有严格发布周期的项目。4）GitHub Flow 模型：GitHub Flow 更简单——a）main 始终可部署；b）从 main 创建 feature 分支；c）完成后 PR 合回 main；d）部署。适合持续部署的项目。5）冲突的本质：冲突发生在两个分支修改了同一个地方。Git 无法自动决定保留哪个，需要人工判断。解决冲突后，要验证代码是否正确——合并可能导致逻辑错误。6）高级技巧：a）git rebase -i：交互式 rebase，可以合并、编辑、删除 commit；b）git stash：暂存当前修改，切到其他分支；c）git reflog：查看历史操作，可以恢复误删的 commit；d）git reset --hard HEAD~1：撤销最近的 commit（危险！）。理解这些高级技巧能在出问题时自救。"
        }, duration: "3小时", resources: [R_GIT_SCM, R_GIT_BRANCHING, B_GIT_TUTORIAL], checkpoint: "能管理分支，理解 merge/rebase 区别，解决合并冲突" },
      { day: 3, title: "远程协作与 Pull Request",
        summary: "掌握远程仓库协作，理解 Pull Request 工作流", content: {
          objective: "今天你将学习远程协作和 Pull Request 工作流。学完后能管理多个远程仓库，理解 fetch/pull/push 的区别，掌握 Pull Request 流程，完成代码评审。",
          key_points: [
            "远程仓库：remote 是远程仓库的引用，可以有多个 remote（origin、upstream）",
            "fetch vs pull：fetch 下载但不合并，pull 下载并合并（fetch + merge）",
            "push：推送本地分支到远程，需要先 pull 解决冲突",
            "Pull Request：GitHub 的协作机制，请求把你的分支合并到目标分支",
            "Code Review：PR 合并前需要审查，检查代码质量、逻辑、风格"
          ],
          practice: "远程协作实战：1）远程管理：a）git remote -v 查看远程仓库；b）git remote add upstream URL 添加上游仓库；c）git remote remove name 删除远程；d）理解 origin 和 upstream 的区别。2）fetch vs pull：a）git fetch origin 下载远程更新；b）git diff origin/main 对比差异；c）git merge origin/main 合入远程；d）git pull origin main 相当于 fetch + merge；e）git pull --rebase 用 rebase 代替 merge。3）push 练习：a）git push origin main 推送到远程；b）git push -u origin main 设置上游并推送（首次）；c）git push --force 强制推送（危险！）；d）理解为什么有时 push 会失败（需要先 pull）。4）Pull Request 流程：a）在 GitHub fork 一个仓库；b）clone 你的 fork；c）创建分支做修改；d）push 到你的 fork；e）在 GitHub 创建 PR；f）等待 review 和合并。5）Code Review：a）找一个同学的仓库，fork 并提 PR；b）审查别人的 PR——检查代码逻辑、风格、测试；c）提出修改建议；d）处理别人对你 PR 的评论。6）保持同步：a）git fetch upstream 获取上游更新；b）git merge upstream/main 合入上游；c）git push origin main 推送到你的 fork。",
          deep_dive: "远程协作是现代软件开发的核心工作模式，理解它能让你更好地参与开源项目和团队协作：1）fork vs clone 的区别：clone 是下载仓库，fork 是在 GitHub 上复制仓库到你的账号。参与开源项目的流程是：fork → clone → 修改 → push → PR → merge。理解这个流程是参与开源的第一步。2）origin vs upstream：origin 是你的 fork，upstream 是原始仓库。你需要定期从 upstream 拉取更新，保持你的 fork 同步。这样你的 PR 才能基于最新的代码。3）Pull Request 的价值：PR 不仅是合并请求，更是协作机制——a）Code Review：保证代码质量；b）讨论：讨论设计决策；c）CI：自动运行测试；d）文档：PR 描述可以当文档。好的 PR 应该有清晰描述、充分测试、关联 Issue。4）Code Review 最佳实践：Review 应该检查——a）逻辑正确性；b）代码风格；c）测试覆盖；d）性能影响；e）安全隐患。Review 评论要具体、礼貌、建设性。接受 Review 要开放心态，理解别人的观点。5）PR 的高级用法：a）Draft PR：还在开发中，提前分享进展；b）Review Requests：请求特定人 review；c）Labels：标记 PR 类型（bug、feature、docs）；d）Milestones：关联版本里程碑；e）Auto merge：满足条件自动合并。6）协作礼仪：a）先讨论再动手：大改动先开 Issue 讨论；b）一个 PR 一个功能：不要把多个功能塞一个 PR；c）及时响应评论：不要让 PR 悬着；d）感谢 Reviewer：Review 是无偿劳动，要感谢。"
        }, duration: "3小时", resources: [R_GIT_SCM, B_GIT_TUTORIAL, { title: "GitHub PR 文档", url: "https://docs.github.com/en/pull-requests", required: false }], checkpoint: "能完成完整的 fork → PR 流程，参与开源项目协作" },
      { day: 4, title: "Git 高级技巧与问题解决",
        summary: "掌握 Git 高级命令，学会解决常见问题", content: {
          objective: "今天你将学习 Git 高级技巧和问题解决方法。学完后能使用 stash、reflog、reset 等高级命令，能恢复误删的代码，能调试 Git 问题，理解 Git 内部原理。",
          key_points: [
            "stash：暂存当前修改，切到其他分支处理紧急任务后再恢复",
            "reflog：记录所有 HEAD 变化，可以恢复「丢失」的 commit",
            "reset：回退到指定 commit，--soft/--mixed/--hard 三种模式",
            "cherry-pick：选择性合并单个 commit",
            "bisect：二分查找定位引入 bug 的 commit"
          ],
          practice: "Git 高级技巧实战：1）stash 使用：a）修改了一些文件但不想提交；b）git stash 暂存；c）切到其他分支处理紧急任务；d）git stash list 查看暂存列表；e）git stash pop 恢复最近的暂存；f）git stash apply stash@{1} 恢复指定暂存。2）reflog 自救：a）模拟误删：git reset --hard HEAD~2；b）git reflog 查看历史操作；c）找到误删前的 commit；d）git reset --hard <commit> 恢复；e）理解 reflog 是 Git 的「后悔药」。3）reset 三种模式：a）git reset --soft HEAD~1：回退 commit，保留修改；b）git reset --mixed HEAD~1：回退 commit 和 add，保留文件修改；c）git reset --hard HEAD~1：全部回退，丢弃修改；d）理解三种模式的区别和风险。4）cherry-pick 精选：a）在 develop 分支做了一个修复；b）git cherry-pick <hash> 把修复合到 main；c）理解 cherry-pick 的场景（紧急修复、特定功能）。5）bisect 找 bug：a）知道当前有 bug，之前没有；b）git bisect start；c）git bisect bad 标记当前；d）git bisect good <good-commit> 标记好的；e）Git 会二分检查，找出引入 bug 的 commit；f）git bisect reset 结束。6）思考：为什么说 reflog 是 Git 的救命稻草？",
          deep_dive: "Git 高级技巧是区分入门和进阶的关键，掌握它们能让你在出问题时自救：1）stash 的场景：你正在开发一个功能，突然需要处理紧急 bug。当前代码还没完成，不想提交。用 stash 暂存，切到其他分支修复 bug，回来后恢复。这比临时 commit 更干净。2）reflog 的原理：Git 的 commit 即使「删除」也不会马上消失。reflog 记录了 HEAD 的所有变化，可以找到任何历史状态。reflog 默认保留 90 天，给了你充足的时间自救。reflog 是 Git 最被低估的功能。3）reset 的风险：reset --hard 是危险操作——会真正丢弃代码。用之前要确认：a）这些修改不需要吗？b）已经 push 了吗？如果 push 过，reset 后再 push --force 会影响别人。永远不要对公共分支用 reset --hard + force push。4）Git 内部原理：理解 Git 内部能帮你更好地解决问题：a）Git 是内容寻址文件系统，所有内容存成对象；b）commit 对象包含 tree 指针、parent 指针、作者、消息；c）branch 只是 commit 的指针；d）HEAD 是当前分支的指针。理解这些概念能帮你理解 Git 的行为。5）常见问题解决：a）撤销最近 commit：reset --soft；b）撤销已 push 的 commit：新建 commit 反转（revert）；c）分离 HEAD 状态：用 branch 名而不是 commit hash；d）大文件误提交：用 BFG 或 git filter-branch 清理历史。6）Git 最佳实践：a）频繁提交：小步提交，好回退；b）好的 commit message：描述做了什么和为什么；c）不要 force push 公共分支；d）用分支开发功能，不要在 main 直接改；e）定期 fetch，保持同步。"
        }, duration: "3小时", resources: [R_GIT_SCM, B_GIT_TUTORIAL], checkpoint: "能使用 stash/reflog/reset 等高级命令，解决 Git 问题" },
      { day: 5, title: "Git 工作流与团队协作",
        summary: "学习团队协作最佳实践，掌握 Git 配置和钩子", content: {
          objective: "今天你将学习 Git 工作流和团队协作最佳实践。学完后能选择合适的工作流模型，配置 Git 环境，使用 Git 钩子自动化检查，建立团队的 Git 规范。",
          key_points: [
            "工作流模型：Git Flow、GitHub Flow、GitLab Flow，各有适用场景",
            "Git 配置：.gitignore、.gitattributes、用户配置、别名",
            "Git 钩子：pre-commit、pre-push 等自动化检查，Husky 简化配置",
            "Commit 规范：Conventional Commits、Commitlint，让历史可读",
            "团队规范：分支命名、commit 格式、PR 模板、Code Review 标准"
          ],
          practice: "工作流与规范实战：1）选择工作流：a）分析你的团队特点——规模、发布周期、质量要求；b）选择合适的工作流（Git Flow/GitHub Flow）；c）画出工作流图，文档化。2）Git 配置优化：a）配置别名：git config --global alias.st status；b）配置编辑器：git config --global core.editor vim；c）配置用户信息：name 和 email；d）创建 .gitignore 忽略不需要的文件；e）理解全局配置和仓库配置的区别。3）Git 钩子：a）了解钩子类型——pre-commit、pre-push、post-merge；b）创建 pre-commit 钩子检查代码风格；c）或用 Husky + lint-staged 自动配置。4）Commit 规范：a）学习 Conventional Commits 格式（feat:、fix:、docs:）；b）用 Commitlint 检查格式；c）尝试规范的 commit message。5）团队规范设计：a）设计分支命名规范（feature/*、hotfix/*）；b）设计 PR 模板；c）设计 Code Review Checklist；d）写一份团队的 Git 使用指南。6）总结：a）整理这两周学到的 Git 知识；b）从「会用 Git」到「精通 Git」，你提升了什么？c）还有什么疑问？",
          deep_dive: "Git 工作流和团队规范是协作效率的关键，好的规范能让团队事半功倍：1）工作流的选择：没有最好的工作流，只有最适合的。Git Flow 适合严格发布周期的项目；GitHub Flow 适合持续部署的项目；GitLab Flow 介于两者。选择时要考虑——a）团队规模；b）发布频率；c）质量要求；d）运维能力。不要照搬别人的工作流，根据自己情况调整。2）Git 配置的细节：.gitignore 很重要——忽略编译产物、IDE 配置、敏感文件。但不要忽略太多，否则别人 clone 后可能缺少必要文件。.gitattributes 处理跨平台差异（如换行符）。别名能提升效率——st、co、br 等短别名减少输入。3）Git 钩子的价值：钩子能自动化检查——a）pre-commit：检查代码风格、格式化；b）pre-push：运行测试；c）commit-msg：检查 commit message 格式。这些检查能在提交前发现问题，比 CI 更早。Husky 让配置钩子变简单，npm install 就能配置。4）Commit 规范的意义：规范的 commit message 让历史可读——a）自动化生成 CHANGELOG；b）快速定位某个功能的 commit；c）理解每个 commit 的目的。Conventional Commits 是主流规范：feat（功能）、fix（修复）、docs（文档）、refactor（重构）、test（测试）。5）团队规范的执行：规范写了没人遵守就没用。执行方法：a）自动化检查（钩子、CI）；b）Code Review 时检查；c）新人培训；d）定期回顾和改进。规范要与时俱进，不要固守过时的规范。6）Git 进阶方向：精通 Git 后可以学习——a）Git internals：理解 Git 内部原理；b）Git performance：大仓库优化；c）Git security：签名、安全配置；d）Git extensions：自定义命令。Git 是深不见底的工具，总有新东西可以学。"
        }, duration: "3小时", resources: [R_GIT_SCM, B_GIT_TUTORIAL, { title: "Conventional Commits", url: "https://www.conventionalcommits.org/", required: false }], checkpoint: "能设计团队 Git 规范，配置钩子自动化检查，选择合适的工作流" },
    ],
  },
{
    id: "docker-basic",'''

if old2 in content:
    content = content.replace(old2, new2)
    print('2. git-github: OK')
else:
    print('2. git-github: NOT FOUND')

with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Part 1 done (linux-basic + git-github)')