Kubernetes（K8s）是 CNCF 的容器编排平台，将多台机器组成统一集群，对外提供声明式的应用部署、扩缩容、自我修复和服务发现能力。

## 核心概念

### Pod

K8s 的最小调度单位，通常 1 Pod = 1 Container。Pod 内的容器共享网络（localhost 互通）和存储。

### Deployment

声明式管理 Pod 的副本数、版本、滚动更新策略：
```yaml
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    maxUnavailable: 1
```

### Service

为 Pod 提供稳定的网络入口和负载均衡：
- **ClusterIP**：集群内部访问
- **NodePort**：开发测试用
- **LoadBalancer**：云厂商托管 LB

### HPA（Horizontal Pod Autoscaler）

基于 CPU/内存/自定义指标自动扩缩容：
```yaml
metrics:
- type: Resource
  resource:
    name: cpu
    target:
      averageUtilization: 70
```

## 为什么比 Docker Compose 更适合生产

| 特性 | Docker Compose | K8s |
|---|---|---|
| 扩缩容 | 手动 | 声明式 + 自动 |
| 服务发现 | 手动配置 | 内置 DNS |
| 滚动更新 | 手动 | 声明式 + 自动回滚 |
| GPU 调度 | 不支持 | nvidia.com/gpu 资源 |
| 多节点 | 不支持 | 原生支持 |

## 适合 AI 服务的场景

- 多副本推理服务（保证高可用）
- 基于 GPU 负载的自动扩缩容
- ConfigMap/Secret 管理模型路径和 API Key
- Helm Chart 模板化管理多个微服务

## 相关资源

- [K8s 官方教程](https://kubernetes.io/zh-cn/docs/tutorials/)
- [Helm 官方文档](https://helm.sh/zh/docs/)
- [NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/kubernetes/)