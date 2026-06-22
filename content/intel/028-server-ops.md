---
title: 服务器运维基础与 Linux 环境管理
category: infrastructure
keywords:
  - linux
  - systemd
  - ssh
  - nginx
  - bash
  - cron
  - firewall
difficulty: intermediate
duration: 1-2周
summary: 模型能训练 ≠ 服务能上线——Linux 系统管理、网络配置、进程守护是工程化的基本功
takeaways:
  - 能用 systemd 管理服务（开机自启、崩溃重启、日志查看）
  - 能用 Nginx 做反向代理和负载均衡
  - 能用 SSH Key 免密登录，配置 sshd 安全策略
  - 能用 cron 配置定时任务，配合数据管道使用
---

## 为什么你要学它

很多 AI 工程师写得出 ResNet 的 forward 函数，却不知道：
- 如何让模型推理服务在服务器重启后自动启动
- 如何用 Nginx 把外部流量转发到内网端口
- 如何排查服务器端口不通是防火墙还是服务没起来

这些「运维基本功」不复杂，但不会就卡死在最后一公里。

## 一句话概览

- **systemd**：服务管理（开机自启 / 崩溃重启 / 日志 journalctl）
- **Nginx**：反向代理 + 负载均衡 + SSL 终结
- **SSH Key**：免密登录 + 禁用密码登录提升安全性
- **cron**：定时任务（数据采集 / 模型训练 / 日志清理）

## 核心拆解

### 🔑 systemd 服务配置

```ini
# /etc/systemd/system/inference.service
[Unit]
Description=FastAPI Inference Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/inference
ExecStart=/opt/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable inference   # 开机自启
sudo systemctl start inference    # 立即启动
sudo systemctl status inference   # 查看状态
journalctl -u inference -f      # 实时日志
sudo systemctl restart inference  # 重启
```

**关键参数**：`Restart=always` 确保崩溃后 10 秒自动重启，`After=network.target` 确保网络就绪后再启动。

### 🔑 Nginx 反向代理

```nginx
upstream inference_backend {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;  # 第二个副本
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://inference_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

### 🔑 SSH 安全加固

```bash
# /etc/ssh/sshd_config
PasswordAuthentication no       # 禁用密码登录
PubkeyAuthentication yes       # 只允许 Key 登录
PermitRootLogin no             # 禁止 root 登录
MaxAuthTries 3                 # 最多 3 次尝试
```

```bash
# 本地生成 Key（不要设密码，部署时用 ssh-agent）
ssh-keygen -t ed25519 -C "deploy@server"
ssh-copy-id user@server        # 自动上传公钥
```

## 实战指南

### 常见故障排查

```bash
# 端口是否在监听
ss -tlnp | grep 8000

# 防火墙状态
sudo ufw status
sudo ufw allow 8000/tcp

# 进程是否存活
ps aux | grep uvicorn

# 磁盘空间
df -h
du -sh /var/log/*

# GPU 状态
nvidia-smi
watch -n 1 nvidia-smi  # 实时监控
```

## 相关资源

- [systemd 官方文档](https://www.freedesktop.org/wiki/Software/systemd/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Linux Performance (Brendan Gregg)](http://www.brendangregg.com/linuxperf.html)
