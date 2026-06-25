[环境配置]

## SSH 连接远程服务器频繁掉线

// 快速修复

ssh config 加 ServerAliveInterval + tmux 保持会话

// 现象表现

- × SSH连接服务器后几分钟无操作就自动断开
- × scp传输大文件时中途断开
- × tmux会话也随SSH断开而消失

// 排查步骤

- 01 客户端编辑~/.ssh/config添加ServerAliveInterval 60和ServerAliveCountMax 3
- 02 服务器端编辑/etc/ssh/sshd_config保持连接配置
- 03 用tmux或screen保持会话，传输大文件用rsync并加screen后台运行
- 04 长期训练用nohup或systemd service

#SSH#Linux#远程服务器

---

[环境配置]

## SSH 端口被防火墙拦截 / 服务器无法访问

// 快速修复

检查安全组规则 → 改端口 443 → 开启密钥登录 + fail2ban

// 现象表现

- × ssh: connect to host x.x.x.x port 22: Connection timed out
- × 云服务器安全组已开端口但仍无法连接
- × 本地端口22被ISP封锁

// 排查步骤

- 01 云服务器检查安全组入方向规则
- 02 修改SSH端口为443绕过封锁
- 03 家用宽带用内网穿透工具(frp/nps/cloudflare tunnel)
- 04 使用密钥登录替代密码，安装fail2ban自动封禁失败IP
- 05 使用Tailscale/WireGuard建立VPN

#SSH#服务器#网络安全

---

[环境配置]

## Git 合并冲突处理不当导致代码丢失

// 快速修复

合并前先 git stash → 解决冲突后 git add + commit → git stash pop

// 现象表现

- × git merge后某些文件变成旧版本
- × git pull后本地修改被覆盖
- × 强制合并后无法找回之前的工作

// 排查步骤

- 01 合并前先git stash或git commit本地修改
- 02 git merge遇冲突用git status查看列表
- 03 手动编辑冲突文件保留需要部分解决后git add+commit
- 04 永远不要在未提交本地修改时做git pull或merge
- 05 误操作用git reflog找回

#Git#协作#版本控制

---

[环境配置]

## 服务器磁盘空间不足导致服务崩溃

// 快速修复

清理日志文件 + 扩展磁盘 + 设置磁盘监控告警

// 现象表现

- × 写入文件失败"No space left on device"
- × 服务异常退出
- × 日志文件占用大量空间

// 排查步骤

- 01 使用df -h检查磁盘使用情况
- 02 查找大文件find / -type f -size +100M
- 03 清理日志文件删除旧日志，设置logrotate自动轮转
- 04 删除不再使用的docker镜像和容器
- 05 设置磁盘空间告警

#Linux#服务器#运维

---

[环境配置]

## 容器时间与宿主机不一致

// 快速修复

docker run -e TZ=Asia/Shanghai 或 -v /etc/localtime:/etc/localtime:ro

// 现象表现

- × 日志时间戳比实际时间晚8小时
- × 定时任务cron执行时间与预期不符
- × 数据库记录与实际文件修改时间差8小时

// 排查步骤

- 01 docker run加-e TZ=Asia/Shanghai挂载时区
- 02 在Dockerfile中设置时区
- 03 定时任务用cron时确保容器内时区正确
- 04 确认日志框架时区配置

#Docker#时区#日志
