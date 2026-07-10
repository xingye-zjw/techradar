---
title: Kubernetes 踩坑合集
category: devops
difficulty: advanced
duration: 30分钟
summary: 涵盖 4 个常见踩坑：Kubernetes Pod 无法调度/Pending 状态、Kubernetes Service 无法访问、Deployment 滚动更新时服务中断、PVC 挂载失败导致 Pod 无法启动，每个均附快速修复与排查步骤。
takeaways: "- 掌握「Kubernetes 踩坑合集」中各问题的快速识别方法 - 理解每个踩坑的根因分析和排查步骤 - 学会标准化的修复流程和预防措施"
relatedIntel: "- 021-kubernetes - 022-prometheus-grafana"
tags:
  - DevOps
  - 部署
  - 运维
  - 容器
relatedTerms:
  - git
  - docker
  - linux
  - kubernetes
relatedTools:
  - mlflow
  - docker
  - kubernetes
relatedNodes:
  - docker-basic
  - devops-kubernetes
---

[容器编排]

## Kubernetes Pod 无法调度/Pending 状态

// 快速修复

检查资源配额 + 调整 resource limits/requests + 分散 Pod 到多个节点

// 现象表现

- × Pod 一直处于 Pending 状态，无法进入 Running
- × 无法创建新容器，调度失败
- × 资源不足警告事件频繁出现

// 排查步骤

- 01 执行 `kubectl describe pod <pod-name>` 查看 Events 字段中的调度失败原因
- 02 执行 `kubectl describe node` 检查各节点资源使用情况和 allocatable 资源
- 03 检查 Pod 的 resource requests 和 limits 配置，确保请求资源不超过集群总资源
- 04 如资源不足，考虑扩容节点、降低 requests 值、或使用 pod 反亲和性 / 拓扑分布约束分散调度

#Kubernetes#容器#资源管理

---

[容器编排]

## Kubernetes Service 无法访问

// 快速修复

检查 selector 匹配 + 确认端口配置 + 验证 Endpoint 存在

// 现象表现

- × Service 无法访问，curl 或 telnet 超时
- × endpoints 为空，后端 Pod 未被选中
- × DNS 解析正常但连接失败

// 排查步骤

- 01 执行 `kubectl get endpoints <service-name>` 检查是否存在有效的 Endpoint
- 02 执行 `kubectl get pods --show-labels` 确认后端 Pod 标签与 Service selector 匹配
- 03 执行 `kubectl describe service <service-name>` 检查 port 和 targetPort 配置是否与 Pod 端口一致
- 04 确认 Pod 处于 Running 状态且通过 readinessProbe 探针检测

#Kubernetes#容器#网络

---

[容器编排]

## Deployment 滚动更新时服务中断

// 快速修复

配置 maxSurge + maxUnavailable + 使用 readinessProbe

// 现象表现

- × 滚动更新期间请求失败、连接被拒绝
- × 部分请求路由到未就绪的新版本 Pod
- × 出现新旧版本同时服务的混乱状态

// 排查步骤

- 01 检查 Deployment 的 rollingUpdate 策略配置，确认 maxUnavailable 和 maxSurge 值合理
- 02 检查 Pod spec 中是否配置了 readinessProbe，确保流量只发送到就绪的 Pod
- 03 验证 livenessProbe 配置正确，避免因探测失败导致 Pod 重启
- 04 如业务允许，可将 maxUnavailable 设为 0、maxSurge 设为 1 实现零停机滚动更新（注意：这不是蓝绿发布，蓝绿发布需要两套独立环境通过流量切换实现）

#Kubernetes#容器#部署

---

[容器编排]

## PVC 挂载失败导致 Pod 无法启动

// 快速修复

检查 PVC 状态 + 确认 StorageClass + 验证权限配置

// 现象表现

- × Pod 一直处于 Waiting 或 Pending 状态
- × Volume 挂载失败，报错 "MountVolume.SetUp failed"
- × 权限被拒绝，报错 "permission denied"

// 排查步骤

- 01 执行 `kubectl get pvc` 检查 PVC 状态是否为 Pending 或 Lost
- 02 执行 `kubectl get storageclass` 确认 StorageClass 存在且配置正确
- 03 检查 PV（PersistentVolume）状态，确认与 PVC 绑定正常
- 04 检查 Pod 运行账户（ServiceAccount）的 RBAC 权限，确保有挂载存储的权限
- 05 如使用持久化存储，确认存储后端（如 NFS、Ceph）正常运行且网络可达

#Kubernetes#存储#容器

## 修复后附加：最小一键诊断命令

```bash
# DevOps 最小自检：Docker/K8s/磁盘空间/SSH 端口 10 秒内出结论
set -e
echo '--- docker ---' && (docker info 2>/dev/null | head -n 5 || echo 'docker unavailable')
echo '--- disk ---'   && df -h / | tail -n 1
echo '--- k8s ---'    && (kubectl cluster-info 2>/dev/null | head -n 3 || echo 'kubectl unavailable')
echo '--- ssh 22 ---' && (timeout 3 bash -c 'cat < /dev/tcp/127.0.0.1/22' >/dev/null 2>&1 && echo open || echo closed)
```
