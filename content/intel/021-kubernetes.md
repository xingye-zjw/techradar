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

## 相关资源

- [K8s 官方教程](https://kubernetes.io/zh-cn/docs/tutorials/)
- [Kubernetes the Hard Way（本地搭建集群）](https://github.com/kelseyhightower/kubernetes-the-hard-way)
- [Helm 官方文档](https://helm.sh/zh/docs/)
- [NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/kubernetes/)
