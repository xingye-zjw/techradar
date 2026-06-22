---
title: Kubernetes 容器编排入门
category: infrastructure
keywords:
  - kubernetes
  - k8s
  - pod
  - deployment
  - service
  - helm
  - hpa
  - gpu scheduling
difficulty: intermediate
duration: 2-3周
summary: Docker 把应用打包，K8s 把应用运行——服务治理、扩缩容、滚动更新全部自动化
takeaways:
  - 理解 K8s 核心对象：Pod / Deployment / Service / ConfigMap / Secret
  - 能用 kubectl 操作常用资源，理解声明式 vs 命令式配置的区别
  - 能用 Helm 管理复杂应用的模板化部署
  - 能在 K8s 上调度 GPU 资源并配置 HPA 自动扩缩容
---

## 为什么你要学它

Docker 解决了「应用怎么打包」的问题，但单个容器在生产环境里有致命弱点：重启后数据丢失、没有自动恢复、没有水平扩缩容、没有流量管理。

Kubernetes（简称 K8s）解决了「应用怎么运行」的问题：它把一堆机器组成集群，对外提供统一的调度、扩缩容、自我修复、服务发现能力。

当你的 AI 项目需要：
- 多副本部署保证高可用 → K8s
- 基于 GPU 负载自动扩容 → K8s + HPA
- 灰度发布 / 滚动更新 → K8s Deployment
- 配置与代码分离 → ConfigMap / Secret

K8s 是绕不开的工程化基础设施。

## 一句话概览

- K8s 的最小调度单位是 **Pod**（一个 Pod 包含 1 到 N 个共享网络的容器）
- **Deployment** 声明式管理 Pod 的副本数、版本、滚动策略
- **Service** 为 Pod 提供稳定的访问入口（ClusterIP / NodePort / LoadBalancer）
- 核心设计原则：**声明式配置**（你描述期望状态，K8s 自动达成）

## 核心拆解

### 🔑 Pod：不是容器，是调度单位

Pod 是 K8s 的最小调度单位。同一个 Pod 里的容器：
- 共享同一个网络 namespace（localhost 互相访问）
- 共享同一个 Volume（同一块存储）
- 一起调度、一起扩缩容

通常 1 个 Pod = 1 个容器（最简单），但也可以是紧密协作的多容器（比如 sidecar 模式做日志收集）。

### 🔑 Deployment：声明式更新

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: inference-api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    spec:
      containers:
      - name: api
        image: my-registry/inference:v2.1
        ports:
        - containerPort: 8000
        resources:
          limits:
            nvidia.com/gpu: "1"
```

你声明 replicas=3，K8s 保证始终有 3 个 Pod 在运行。更新镜像时，K8s 按滚动策略逐个替换，旧 Pod 终止前新 Pod 已就绪，零宕机更新。

### 🔑 Service：稳定的网络入口

Pod 的 IP 是动态的（重启后变化）。Service 提供稳定的固定 IP，自动负载均衡到后端的 Pod：

| Service 类型 | 适用场景 |
|---|---|
| ClusterIP | 集群内部访问（默认） |
| NodePort | 开发和测试 |
| LoadBalancer | 云厂商托管负载均衡 |

### 🔑 HPA：基于指标的自动扩缩容

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: inference-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: inference-api
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

当 CPU 利用率 > 70% 持续一定时间，自动扩容到最多 10 个副本。GPU 指标扩缩可用 **KEDA**（基于 Prometheus 自定义指标）。

## 实战指南

### 用 kind 在本地搭建集群

```bash
# Windows WSL2 / Linux / Mac
kind create cluster --name ai-cluster
kubectl get nodes
```

### 部署 FastAPI 推理服务

```bash
kubectl apply -f deployment.yaml
kubectl get pods -l app=inference-api
kubectl logs -l app=inference-api
kubectl scale deployment inference-api --replicas=5
kubectl rollout status deployment/inference-api
```

### Helm 打包与部署

```bash
helm create my-inference
# 编辑 values.yaml
helm install inference ./my-inference \
  --set replicaCount=3 \
  --set image.tag=v2.1
helm upgrade inference ./my-inference --set image.tag=v2.2
```

## 常见误区

### 误区 1：把 Pod 当成容器直接使用

**错误理解**：很多人刚开始学习 K8s 时，认为一个 Pod 就是一个容器，直接在 Pod 里运行多个不相关的应用。

**正确理解**：Pod 是 K8s 的调度单位，一个 Pod 可以包含多个紧密协作的容器，但通常建议一个 Pod 只运行一个主容器。如果有多个应用需要通信，应该用多个独立的 Pod + Service 来管理，而不是把它们塞进同一个 Pod。

**如何避免**：遵循"一个 Pod 一个应用"原则。只有当容器之间需要共享网络、存储或紧密协作（如 sidecar 模式）时，才考虑在同一个 Pod 中运行多个容器。

### 误区 2：忽略资源限制导致资源争抢

**错误理解**：部署 Pod 时不设置 resources.limits，认为 K8s 会自动管理资源，或者设置的限制过于宽松。

**正确理解**：没有资源限制的 Pod 可能会消耗节点的所有 CPU 和内存，导致其他 Pod 被驱逐或 OOM。K8s 的调度器依赖 resources.requests 来决定 Pod 放在哪个节点，依赖 resources.limits 来限制实际使用量。

**如何避免**：始终为每个容器设置 resources.requests（调度依据）和 resources.limits（资源上限）。对于 GPU 任务，必须设置 nvidia.com/gpu 的 limits，否则一个 Pod 可能占用所有 GPU 显存。

### 误区 3：过度使用 ConfigMap 存储敏感信息

**错误理解**：把数据库密码、API Key 等敏感信息直接写入 ConfigMap，认为 ConfigMap 是安全的存储方式。

**正确理解**：ConfigMap 本质上是明文存储，任何有权限访问 K8s API 的人都能读取其中的内容。Secret 虽然也只是 Base64 编码，但提供了更好的隔离性，且可以配合外部密钥管理工具（如 Vault）使用。

**如何避免**：敏感信息必须使用 Secret，而非 ConfigMap。在生产环境中，建议使用 External Secrets Operator 或 Sealed Secrets 等方案，将密钥存储在外部安全服务中。

## 相关资源

- [K8s 官方教程](https://kubernetes.io/zh-cn/docs/tutorials/)
- [Kubernetes the Hard Way（本地搭建集群）](https://github.com/kelseyhightower/kubernetes-the-hard-way)
- [Helm 官方文档](https://helm.sh/zh/docs/)
- [NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/kubernetes/)
