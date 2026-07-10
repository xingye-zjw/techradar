---
title: 计算机网络基础
category: cs
difficulty: beginner
duration: 2-3周
summary: 理解网络通信的底层原理，掌握TCP/IP协议栈、HTTP协议、DNS解析、网络安全等核心知识，为分布式系统和网络编程打下基础
takeaways:
  - 理解OSI七层模型和TCP/IP四层模型
  - 掌握TCP三次握手四次挥手
  - 理解HTTP/HTTPS协议工作原理
  - 能进行网络问题排查和性能优化
relatedIntel:
  - 050-cs-algo
  - 051-cs-os
  - 076-cs-database
relatedNodes:
  - "cs-network"
  - "math-linear-algebra"
tags:
  - computer-network
  - tcp-ip
  - http
  - dns
  - network-security
  - osi-model
relatedTerms:
  - "data-structure"
  - "algorithm"
  - "transformer"
  - "complexity"
relatedTools:
  - "huggingface-transformers"
  - "ultralytics-yolo"
  - "pytorch"
---

## 为什么你要学它

计算机网络是分布式系统、云计算、微服务架构的基石。在AI工程中，网络知识无处不在：

- **分布式训练**：理解TCP拥塞控制能优化多节点训练通信，理解RDMA能加速GPU集群
- **模型服务化**：理解HTTP/2能优化API性能，理解WebSocket能实现流式输出
- **数据管道**：理解DNS能解决服务发现，理解负载均衡能提高可用性
- **安全防护**：理解TLS能保护模型API，理解常见攻击能防御DDoS

如果你只会调用requests库而不理解网络原理，遇到"连接超时"、"DNS解析失败"、"HTTPS证书错误"时就只能盲目尝试。

## 一句话概览（快速版）

- **分层是核心思想**：OSI七层模型从物理层到应用层，每层只关心自己的职责
- **TCP保证可靠传输**：三次握手建立连接，四次挥手断开连接，滑动窗口控制流量
- **HTTP是应用层协议**：请求-响应模式，无状态，HTTPS通过TLS加密
- **DNS是互联网的电话簿**：将域名解析为IP地址，支持缓存和递归查询

## 核心拆解

### 🔑 OSI七层模型与TCP/IP四层模型

```
┌─────────────────────────────────────────────────────────┐
│  OSI七层模型        │  TCP/IP四层模型   │  数据单元      │
├─────────────────────────────────────────────────────────┤
│  7. 应用层          │                   │               │
│  6. 表示层          │  应用层           │  报文(Message) │
│  5. 会话层          │                   │               │
├─────────────────────────────────────────────────────────┤
│  4. 传输层          │  传输层           │  段(Segment)   │
├─────────────────────────────────────────────────────────┤
│  3. 网络层          │  网络层           │  包(Packet)    │
├─────────────────────────────────────────────────────────┤
│  2. 数据链路层      │                   │               │
│  1. 物理层          │  网络接口层       │  帧(Frame)     │
└─────────────────────────────────────────────────────────┘
```

**各层职责**

| 层级       | 功能                 | 典型协议/设备             |
| ---------- | -------------------- | ------------------------- |
| 应用层     | 提供用户接口         | HTTP、FTP、SMTP、DNS、SSH |
| 表示层     | 数据格式转换、加密   | SSL/TLS、JPEG、MPEG       |
| 会话层     | 建立、管理、终止会话 | NetBIOS、RPC              |
| 传输层     | 端到端可靠传输       | TCP、UDP、SCTP            |
| 网络层     | 路由选择、IP寻址     | IP、ICMP、ARP、路由器     |
| 数据链路层 | 帧同步、MAC寻址      | Ethernet、PPP、交换机     |
| 物理层     | 比特流传输           | 网线、光纤、集线器        |

### 🔑 TCP协议详解

**TCP头部关键字段**

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Acknowledgment Number                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Data |           |U|A|P|R|S|F|                               |
| Offset| Reserved  |R|C|S|S|Y|I|            Window             |
|       |           |G|K|H|T|N|N|                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Checksum            |         Urgent Pointer        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**三次握手（建立连接）**

```python
# 三次握手过程
# 客户端                              服务端
#   |                                   |
#   |-------- SYN=1, seq=x ----------->|  第一次：客户端发起连接请求
#   |                                   |  （SYN_SENT状态）
#   |<------- SYN=1, ACK=1, seq=y, ack=x+1 ---|  第二次：服务端确认并同意
#   |                                   |  （SYN_RCVD状态）
#   |-------- ACK=1, seq=x+1, ack=y+1 -->|  第三次：客户端确认
#   |                                   |  （ESTABLISHED状态）
#   |                                   |

# 为什么是三次？
# 1. 防止已失效的连接请求突然到达服务端
# 2. 同步双方的初始序列号
# 3. 确认双方的接收和发送能力
```

**四次挥手（断开连接）**

```python
# 四次挥手过程
# 主动关闭方                            被动关闭方
#   |                                   |
#   |-------- FIN=1, seq=u ------------>|  第一次：主动方请求关闭
#   |                                   |  （FIN_WAIT_1状态）
#   |<------- ACK=1, seq=v, ack=u+1 ----|  第二次：被动方确认
#   |                                   |  （FIN_WAIT_2 / CLOSE_WAIT状态）
#   |                                   |
#   |<------- FIN=1, ACK=1, seq=w, ack=u+1 ---|  第三次：被动方请求关闭
#   |                                   |  （LAST_ACK状态）
#   |-------- ACK=1, seq=u+1, ack=w+1 ->|  第四次：主动方确认
#   |                                   |  （TIME_WAIT状态，等待2MSL）
#   |                                   |  （CLOSED状态）

# 为什么是四次？
# TCP是全双工通信，每个方向的连接需要单独关闭
# 被动方可能还有数据要发送，所以ACK和FIN分开发送
```

**TCP可靠传输机制**

```python
# 1. 序列号和确认应答
# 每个字节都有编号，ACK表示期望收到的下一个字节序号

# 2. 滑动窗口（流量控制）
# 接收方通过窗口大小告诉发送方还能接收多少数据
# 发送方根据窗口大小控制发送速率

# 3. 拥塞控制
# 慢启动：指数增长（1, 2, 4, 8...）直到阈值
# 拥塞避免：线性增长
# 快重传：收到3个重复ACK立即重传
# 快恢复：拥塞后直接从阈值开始

# Python模拟TCP滑动窗口
class SlidingWindow:
    def __init__(self, window_size=4):
        self.window_size = window_size
        self.base = 0      # 窗口起始
        self.next_seq = 0  # 下一个要发送的序号

    def can_send(self):
        return self.next_seq < self.base + self.window_size

    def send(self):
        if self.can_send():
            seq = self.next_seq
            self.next_seq += 1
            return seq
        return None

    def ack(self, ack_num):
        # 收到ACK，移动窗口
        if ack_num > self.base:
            self.base = ack_num
            print(f"Window moved: base={self.base}, window=[{self.base}, {self.base + self.window_size})")
```

### 🔑 UDP协议

```python
# UDP特点：无连接、不可靠、面向报文
# 优点：简单高效、首部开销小（8字节）、支持广播
# 缺点：不保证可靠、不保证顺序、无流量控制

# UDP头部（仅8字节）
# +--------+--------+--------+--------+
# | Source | Dest   | Length | Checksum|
# | Port   | Port   |        |        |
# +--------+--------+--------+--------+

# 适用场景：
# - 实时音视频（丢帧可接受）
# - DNS查询（简单快速）
# - 游戏（低延迟优先）
# - 局域网广播

import socket

# UDP客户端
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto(b"Hello UDP", ("127.0.0.1", 9999))
data, addr = sock.recvfrom(1024)
print(f"Received: {data}")
sock.close()
```

### 🔑 HTTP协议

**HTTP请求结构**

```http
POST /api/v1/models/gpt-4/completions HTTP/1.1
Host: api.openai.com
Content-Type: application/json
Authorization: Bearer sk-xxx
Content-Length: 123

{
    "prompt": "Hello, world!",
    "max_tokens": 100
}
```

**HTTP响应结构**

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 456
Date: Mon, 24 Jun 2024 10:00:00 GMT

{
    "id": "chatcmpl-xxx",
    "choices": [...]
}
```

**HTTP方法**

| 方法    | 用途             | 幂等性 | 安全性 |
| ------- | ---------------- | ------ | ------ |
| GET     | 获取资源         | 是     | 是     |
| POST    | 创建资源         | 否     | 否     |
| PUT     | 更新资源（全量） | 是     | 否     |
| PATCH   | 更新资源（部分） | 否     | 否     |
| DELETE  | 删除资源         | 是     | 否     |
| HEAD    | 获取响应头       | 是     | 是     |
| OPTIONS | 获取支持的方法   | 是     | 是     |

**HTTP状态码**

```
1xx 信息性：
  100 Continue - 继续发送请求体
  101 Switching Protocols - 协议切换（WebSocket）

2xx 成功：
  200 OK - 请求成功
  201 Created - 资源创建成功
  204 No Content - 成功但无返回体

3xx 重定向：
  301 Moved Permanently - 永久重定向
  302 Found - 临时重定向
  304 Not Modified - 缓存有效

4xx 客户端错误：
  400 Bad Request - 请求格式错误
  401 Unauthorized - 未认证
  403 Forbidden - 无权限
  404 Not Found - 资源不存在
  429 Too Many Requests - 请求过多

5xx 服务端错误：
  500 Internal Server Error - 服务器内部错误
  502 Bad Gateway - 网关错误
  503 Service Unavailable - 服务不可用
  504 Gateway Timeout - 网关超时
```

**HTTP/1.1 vs HTTP/2 vs HTTP/3**

| 特性       | HTTP/1.1         | HTTP/2  | HTTP/3    |
| ---------- | ---------------- | ------- | --------- |
| 传输层     | TCP              | TCP     | QUIC(UDP) |
| 多路复用   | 否（需多个连接） | 是      | 是        |
| 头部压缩   | 否               | HPACK   | QPACK     |
| 服务器推送 | 否               | 是      | 是        |
| 队头阻塞   | 有               | TCP层有 | 无        |
| 连接建立   | 1-3 RTT          | 1-3 RTT | 0-1 RTT   |

### 🔑 HTTPS与TLS

```python
# HTTPS = HTTP + TLS
# TLS握手过程（以TLS 1.2为例）

# 客户端                              服务端
#   |                                   |
#   |-------- ClientHello ------------>|  支持的TLS版本、加密套件、随机数
#   |                                   |
#   |<------- ServerHello -------------|  选定的TLS版本、加密套件、随机数
#   |<------- Certificate --------------|  服务端证书
#   |<------- ServerHelloDone ---------|
#   |                                   |
#   |-------- ClientKeyExchange ------>|  用服务端公钥加密的预主密钥
#   |-------- ChangeCipherSpec -------->|  切换到加密通信
#   |-------- Finished ---------------->|  验证握手完整性
#   |                                   |
#   |<------- ChangeCipherSpec --------|  切换到加密通信
#   |<------- Finished -----------------|  验证握手完整性
#   |                                   |
#   |======== 加密通信 =================|

# TLS 1.3改进：握手从2 RTT减少到1 RTT
# - 简化了握手流程
# - 移除了不安全的加密算法
# - 支持0-RTT恢复
```

**证书链验证**

```
根证书（Root CA）
    └── 中间证书（Intermediate CA）
            └── 服务端证书（Server Certificate）

验证过程：
1. 客户端收到服务端证书
2. 检查证书是否过期
3. 检查证书域名是否匹配
4. 用中间CA公钥验证服务端证书签名
5. 用根CA公钥验证中间CA证书签名
6. 根CA证书在系统信任库中，验证通过
```

### 🔑 DNS解析

```python
# DNS解析过程

# 浏览器                            本地DNS              权威DNS
#   |                                 |                     |
#   |--- 查询 www.example.com ------->|                     |
#   |                                 |                     |
#   |         （检查缓存）              |                     |
#   |                                 |                     |
#   |                    （缓存未命中）  |                     |
#   |                                 |--- 查询根DNS ------->|
#   |                                 |<-- 返回 .com NS -----|
#   |                                 |                     |
#   |                                 |--- 查询 .com NS ---->|
#   |                                 |<-- 返回 example NS --|
#   |                                 |                     |
#   |                                 |--- 查询权威NS ------->|
#   |                                 |<-- 返回 IP地址 ------|
#   |                                 |                     |
#   |<-- 返回 IP地址 -----------------|                     |
#   |                                 |                     |

# DNS记录类型
# A     - 域名到IPv4地址
# AAAA  - 域名到IPv6地址
# CNAME - 别名到规范名
# MX    - 邮件交换服务器
# NS    - 域名服务器
# TXT   - 文本记录（SPF、DKIM验证）
# SRV   - 服务记录

# 使用Python进行DNS查询
import socket

# 简单的DNS解析
ip = socket.gethostbyname("www.google.com")
print(f"IP: {ip}")

# 更详细的DNS信息
import dns.resolver

def query_dns(domain, record_type="A"):
    try:
        answers = dns.resolver.resolve(domain, record_type)
        for rdata in answers:
            print(f"{domain} {record_type}: {rdata}")
    except Exception as e:
        print(f"Query failed: {e}")

query_dns("google.com", "A")
query_dns("google.com", "MX")
query_dns("google.com", "TXT")
```

### 🔑 网络安全基础

**常见网络攻击**

```python
# 1. DDoS攻击（分布式拒绝服务）
# 原理：大量请求耗尽服务器资源
# 防御：流量清洗、限流、CDN

# 2. 中间人攻击（MITM）
# 原理：攻击者拦截并篡改通信
# 防御：使用HTTPS、证书固定

# 3. DNS劫持
# 原理：篡改DNS解析结果
# 防御：DNSSEC、DoH（DNS over HTTPS）

# 4. ARP欺骗
# 原理：伪造ARP响应，劫持局域网流量
# 防御：静态ARP绑定、ARP防火墙

# 5. 端口扫描
# 原理：探测开放端口寻找漏洞
# 防御：关闭不必要端口、防火墙
```

**TLS安全配置**

```python
# Python HTTPS服务器安全配置
import ssl

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
# 只允许TLS 1.2及以上
context.minimum_version = ssl.TLSVersion.TLSv1_2
# 强密码套件
context.set_ciphers('ECDHE+AESGCM:DHE+AESGCM')
# 加载证书
context.load_cert_chain('server.crt', 'server.key')

# 客户端证书验证
context.verify_mode = ssl.CERT_REQUIRED
context.load_verify_locations('ca.crt')
```

## 完整跑通方案

### 第一步：网络诊断命令

```bash
# 1. 检查网络连通性
ping google.com                    # ICMP测试
ping -c 4 google.com               # 发送4个包

# 2. 跟踪路由路径
traceroute google.com              # Linux/macOS
tracert google.com                 # Windows

# 3. DNS查询
nslookup google.com                # 简单查询
dig google.com                     # 详细查询（Linux）
dig @8.8.8.8 google.com            # 指定DNS服务器
dig google.com +short              # 只显示IP

# 4. 端口扫描
netstat -an                        # 查看所有连接
netstat -tulpn                     # 查看监听端口
ss -tulpn                          # 更现代的替代
lsof -i :80                        # 查看占用80端口的进程

# 5. 网络接口
ifconfig                           # 查看网络接口
ip addr                            # 更现代的命令
ip route                           # 查看路由表

# 6. 抓包分析
tcpdump -i eth0                    # 抓取eth0接口流量
tcpdump -i eth0 port 80            # 只抓80端口
tcpdump -i eth0 host 192.168.1.1   # 只抓特定主机
tcpdump -w capture.pcap            # 保存到文件
```

### 第二步：使用Wireshark抓包分析

```bash
# 安装Wireshark
# Windows/macOS: 下载安装包
# Linux: sudo apt install wireshark

# 常用过滤表达式
tcp.port == 80                     # TCP 80端口
http                               # HTTP协议
http.request.method == "POST"      # POST请求
tcp.flags.syn == 1                 # SYN包（TCP握手）
dns                                # DNS协议
ip.addr == 192.168.1.1             # 特定IP

# 分析TCP三次握手
# 过滤: tcp.flags.syn == 1
# 观察SYN, SYN-ACK, ACK三个包

# 分析HTTP请求
# 过滤: http
# 右键 -> Follow -> TCP Stream 查看完整HTTP会话
```

### 第三步：Python网络编程

```python
import socket
import threading

# TCP服务端
def tcp_server(host='0.0.0.0', port=9999):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((host, port))
    server.listen(5)
    print(f"Server listening on {host}:{port}")

    while True:
        client, addr = server.accept()
        print(f"Connection from {addr}")

        # 处理客户端请求
        data = client.recv(1024)
        print(f"Received: {data.decode()}")
        client.send(b"Hello from server!")
        client.close()

# TCP客户端
def tcp_client(host='127.0.0.1', port=9999):
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.connect((host, port))
    client.send(b"Hello from client!")
    response = client.recv(1024)
    print(f"Response: {response.decode()}")
    client.close()

# HTTP客户端
import urllib.request
import json

def http_request(url, data=None, headers=None):
    """发送HTTP请求"""
    req = urllib.request.Request(url)

    if headers:
        for key, value in headers.items():
            req.add_header(key, value)

    if data:
        req.data = json.dumps(data).encode()
        req.add_header('Content-Type', 'application/json')

    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())

# 使用requests库（更简洁）
import requests

def api_call():
    # GET请求
    response = requests.get('https://api.github.com')
    print(f"Status: {response.status_code}")
    print(f"JSON: {response.json()}")

    # POST请求
    data = {'key': 'value'}
    response = requests.post('https://httpbin.org/post', json=data)
    print(f"Response: {response.json()}")

    # 带超时和重试
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry

    session = requests.Session()
    retry = Retry(total=3, backoff_factor=0.5, status_forcelist=[500, 502, 503, 504])
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)

    response = session.get('https://api.github.com', timeout=5)
```

### 第四步：网络性能测试

```bash
# 1. 带宽测试（iperf3）
# 服务端
iperf3 -s

# 客户端
iperf3 -c server_ip -t 60          # 测试60秒
iperf3 -c server_ip -P 4            # 4个并行流

# 2. 延迟测试
ping -c 100 google.com | tail -1   # 统计延迟

# 3. 网络吞吐量
curl -o /dev/null -w "Speed: %{speed_download} bytes/sec\n" http://example.com/file

# 4. 连接数统计
ss -s                              # 连接统计摘要
netstat -an | grep ESTABLISHED | wc -l  # 已建立连接数
```

## 常见误区

**误区 1：认为TCP比UDP更好 → 不了解各自适用场景**

解释：TCP可靠但开销大，UDP简单但不可靠。实时音视频用UDP（丢帧可接受），文件传输用TCP（必须可靠）。QUIC协议结合了两者优点。

**误区 2：混淆HTTP状态码301和302 → SEO和缓存问题**

解释：301是永久重定向，浏览器会缓存；302是临时重定向，每次都会请求原URL。SEO场景用301传递权重，A/B测试用302。

**误区 3：认为HTTPS完全安全 → 忽视证书验证**

解释：HTTPS只保证传输加密，不验证服务端身份。需要检查证书是否有效、域名是否匹配、是否由可信CA签发。自签名证书需要手动信任。

**误区 4：忽视TCP的Nagle算法 → 小数据包延迟**

解释：Nagle算法会缓存小数据包，等待ACK或凑够一定大小才发送。实时性要求高的场景（游戏、SSH）需要禁用：`setsockopt(TCP_NODELAY)`。

**误区 5：认为DNS解析很快 → 忽视DNS查询开销**

解释：DNS解析可能需要多次往返，耗时几十到几百毫秒。应该：(1) 使用DNS缓存；(2) 预解析关键域名；(3) 使用CDN就近解析。

## 实用命令速查

```bash
# 连接诊断
ping <host>                        # 测试连通性
traceroute <host>                  # 跟踪路由
mtr <host>                         # 持续诊断（ping + traceroute）

# DNS查询
dig <domain>                       # 完整DNS查询
dig <domain> +short                # 只显示IP
dig <domain> MX                    # 查询MX记录
dig @8.8.8.8 <domain>              # 指定DNS服务器

# 端口和连接
netstat -tulpn                     # 监听端口
ss -tulpn                          # 同上（更现代）
lsof -i :<port>                    # 端口占用
nc -zv <host> <port>               # 测试端口连通

# 抓包分析
tcpdump -i eth0 port 80            # 抓HTTP流量
tcpdump -i eth0 -w file.pcap       # 保存到文件
tshark -r file.pcap                # 命令行分析

# HTTP调试
curl -v <url>                      # 详细输出
curl -I <url>                      # 只显示头部
curl -X POST -d 'data' <url>       # POST请求
curl -H "Header: value" <url>      # 自定义头部
wget --spider <url>                # 检查URL有效性

# 网络统计
iftop                              # 实时带宽
nethogs                            # 按进程流量
sar -n DEV 1                       # 网络接口统计
```

## 学习资源推荐

**书籍**

- 《计算机网络：自顶向下方法》- 经典教材，从应用层到物理层
- 《TCP/IP详解 卷1：协议》- 深入TCP/IP协议细节
- 《图解HTTP》- 通俗易懂的HTTP入门
- 《网络是怎样连接的》- 从浏览器输入URL到页面显示的完整过程

**在线课程**

- 斯坦福 CS144: Introduction to Computer Networking
- MIT 6.02: Introduction to EECS II: Digital Communication Systems

**实践工具**

- Wireshark - 网络协议分析器
- Packet Tracer - 网络模拟器
- GNS3 - 网络仿真平台

**在线实验**

- https://www.wireshark.org/ - 抓包分析
- https://httpbin.org/ - HTTP请求测试
- https://www.dnsdumpster.com/ - DNS信息收集
