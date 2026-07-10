---
title: GitOps 与 Argo CD 云原生持续部署
category: devops
summary: 以 Git 为唯一事实来源，通过声明式配置实现 Kubernetes 环境的自动化部署、版本追踪与回滚，Argo CD 是工业级 GitOps 的事实标准。
difficulty: intermediate
excerpt: 以 Git 为唯一事实来源，通过声明式配置实现 Kubernetes 环境的自动化部署、版本追踪与回滚，Argo CD 是工业级 GitOps 的事实标准。
relatedTerms:
  - docker
  - linux
  - git
  - kubernetes
  - prometheus
relatedTools:
  - docker
  - mlflow
  - kubernetes
  - prometheus
  - grafana
relatedNodes:
  - devops-kubernetes
  - docker-basic
  - llm-inference
---

## 为什么你要学它

传统的 CI/CD 部署模式通常是「推送式」：CI 跑完后用脚本执行 `kubectl apply` 把变更推到集群。这种模式有几个根本问题：凭证需要外发、部署状态不可审计、环境漂移难以察觉、回滚操作繁琐。当团队管理数十个微服务、多个集群环境时，这种「推式部署」会变成运维噩梦。

GitOps 的核心思想是：**Git 仓库是集群状态的唯一事实来源（Single Source of Truth），集群中运行的一切都必须能在 Git 中找到声明式定义。** 一个名为 Argo CD 的 Operator 持续监听 Git 仓库的变更，自动把集群状态「拉取」并同步到 Git 中声明的期望状态。

对于 AI/ML 基础设施团队，GitOps 的价值尤为突出：

- **可审计**：每一次模型服务版本更新、配置变更都对应一条 Git Commit，谁在什么时候改了什么一目了然
- **一键回滚**：部署出错时，`git revert` 就能让集群回到上一个健康状态
- **环境一致**：开发/测试/生产三套环境用同一份 Kustomize/Helm Chart 管理，避免配置分叉
- **安全最小化**：集群外不需要保存 kubectl 凭证，Argo CD 只需要 Git 仓库的只读权限

如果你已经在用 K8s 部署推理服务、训练任务调度器，GitOps + Argo CD 是把运维复杂度降一个数量级的必然选择。

## 一句话概览

- **GitOps 核心理念**：声明式配置存 Git，Operator 持续同步，实际状态 = Git 中的期望状态
- **Argo CD 四大同步策略**：自动同步、手动同步、基于 Git 标签的蓝绿发布、Canary 渐进式发布
- **应用定义方式**：纯 YAML / Kustomize / Helm Chart / Jsonnet 四种方式任选，组合使用更灵活
- **与现有 CI 集成**：CI 只负责构建镜像并推到仓库、更新 Git 中的镜像标签；Argo CD 负责实际部署

## 核心拆解

### 🔑 GitOps 与传统部署的本质区别

传统「推式」CI/CD 流程：

```
开发者提交代码 → CI 构建镜像 → 推送镜像到 Registry → CI 执行 kubectl apply → 集群部署
```

GitOps「拉式」流程：

```
开发者提交代码 → CI 构建镜像 → 推送镜像到 Registry → CI 提交 PR 更新 Git 中的镜像 tag →
Argo CD 检测 Git 变更 → Argo CD 拉取最新 YAML → 同步到集群
```

关键差异有三点：

1. **部署触发位置不同**：传统由外部系统推送；GitOps 由集群内的 Operator 拉取
2. **凭证管理不同**：传统需要把集群凭证暴露给 CI；GitOps 只需要 Git 读权限 + 镜像拉取密钥
3. **状态反馈不同**：传统部署完就忘了；GitOps 持续比对实际状态与期望状态，出现漂移自动告警

### 🔑 Argo CD 的核心架构

Argo CD 运行在 Kubernetes 集群中，由以下组件构成：

- **API Server**：提供 gRPC/REST API，供 CLI、UI、Webhook 调用
- **Repository Server**：缓存 Git 仓库内容，负责生成和渲染 Kubernetes manifests
- **Application Controller**：核心控制器，持续比对「Git 中的期望状态」与「集群中的实际状态」，执行同步操作
- **Dex Server**：可选的 OIDC 身份提供商，对接企业 SSO

资源模型的核心是 `Application` CRD：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: inference-api
  namespace: argocd
spec:
  project: ml-platform
  source:
    repoURL: https://github.com/your-company/ml-infra.git
    targetRevision: main
    path: manifests/inference-api/overlays/prod
    kustomize:
      images:
        - registry.example.com/inference:v2.3.1
  destination:
    server: https://kubernetes.default.svc
    namespace: inference
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 3
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

这个 Application 对象声明了：从 Git 仓库 `ml-infra` 的 `main` 分支、路径 `manifests/inference-api/overlays/prod` 拉取 Kustomize 配置，部署到当前集群的 `inference` 命名空间，并启用自动同步与自愈。

### 🔑 四种同步策略与应用场景

**策略一：手动同步（Manual Sync）**

默认策略。Git 变更后，需要运维人员在 UI 点击「Sync」或执行 `argocd app sync` 才会部署。适用于生产环境的关键服务，变更需要人工审批。

**策略二：自动同步（Automated Sync）**

在 `syncPolicy.automated` 中启用。Git 变更后 Argo CD 自动检测并同步。两个关键选项：

- `prune: true`：Git 中删除的资源，集群中也自动删除
- `selfHeal: true`：如果有人手动 `kubectl edit` 修改了集群资源，Argo CD 自动改回 Git 中的状态（防环境漂移）

适用于开发/测试环境，以及非核心服务。

**策略三：基于 Git 标签的版本控制**

不直接跟踪 `main` 分支，而是跟踪 Git Tag。例如 `targetRevision: v2.3.1`。发布新版本时打一个新 Tag，更新 Application 中的 targetRevision。好处：版本语义清晰，回滚只需把 targetRevision 改回上一个 Tag。

**策略四：Argo Rollouts 渐进式发布**

Argo CD 与 Argo Rollouts 配合，实现蓝绿、金丝雀发布。以 Canary 为例：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: inference-api
spec:
  replicas: 10
  strategy:
    canary:
      steps:
        - setWeight: 10
        - pause: { duration: 5m }
        - setWeight: 30
        - pause: { duration: 10m }
        - setWeight: 50
        - pause: { duration: 15m }
        - setWeight: 100
```

新版本先切 10% 流量观察 5 分钟，没问题逐步增加到 30%/50%/100%，每一步都有足够的观察窗口。任何指标异常可一键中止回滚。

### 🔑 应用定义：Kustomize vs Helm

Argo CD 支持四种定义方式，实际项目中最常用 Kustomize 和 Helm：

| 方式      | 适用场景         | 优点                                 | 缺点                             |
| --------- | ---------------- | ------------------------------------ | -------------------------------- |
| 纯 YAML   | 简单 Demo        | 零学习成本                           | 多环境重复配置，难维护           |
| Kustomize | 多环境差异化配置 | 原生无模板语言，patch 机制清晰       | 复杂逻辑表达能力弱               |
| Helm      | 复杂应用打包分发 | 模板能力强，生态成熟（Artifact Hub） | Go template 学习曲线陡，调试困难 |
| Jsonnet   | 高度程序化配置   | 函数式编程，复用性极高               | 小众，学习成本高                 |

对于 AI 平台团队的典型场景（同一推理服务部署到 dev/staging/prod，只有镜像 tag、副本数、资源限制不同），**Kustomize overlays 是最顺手的方案**：

```
manifests/inference-api/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml
└── overlays/
    ├── dev/
    │   ├── kustomization.yaml
    │   └── replicas-patch.yaml   # 副本数 1
    ├── staging/
    │   ├── kustomization.yaml
    │   └── replicas-patch.yaml   # 副本数 2
    └── prod/
        ├── kustomization.yaml
        ├── replicas-patch.yaml   # 副本数 10
        └── resources-patch.yaml  # GPU 资源限制
```

## 完整跑通方案

### 第一步：安装 Argo CD

```bash
# 创建命名空间并安装
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 暴露 UI（NodePort 方式，生产建议用 Ingress + TLS）
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'

# 获取初始 admin 密码
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```

浏览器访问 NodePort 端口，用 `admin` + 刚才的密码登录。

### 第二步：用 Argo CD 部署一个推理服务

先准备 Git 仓库结构（推到你的 Git 服务器）：

```
ml-infra/
└── manifests/
    └── inference-api/
        └── base/
            ├── kustomization.yaml
            ├── deployment.yaml
            └── service.yaml
```

**deployment.yaml**：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: inference-api
  labels:
    app: inference-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: inference-api
  template:
    metadata:
      labels:
        app: inference-api
    spec:
      containers:
        - name: api
          image: registry.example.com/inference:v1.0.0
          ports:
            - containerPort: 8000
          resources:
            limits:
              nvidia.com/gpu: "1"
            requests:
              cpu: "2"
              memory: "4Gi"
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
```

**kustomization.yaml**：

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
commonLabels:
  managed-by: argocd
```

在 Argo CD UI 或 CLI 中创建 Application：

```bash
argocd app create inference-api \
  --repo https://github.com/your-company/ml-infra.git \
  --path manifests/inference-api/base \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace inference \
  --sync-policy automated \
  --auto-prune \
  --self-heal
```

查看部署状态：

```bash
argocd app get inference-api
# 看到 Health Status: Healthy, Sync Status: Synced 就成功了
```

### 第三步：CI 集成：镜像构建后自动更新

一个典型的 GitHub Actions 工作流，构建镜像并通过 Argo CD CLI 更新 Application 的镜像 tag：

```yaml
# .github/workflows/ci-cd.yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build image
        run: |
          IMAGE_TAG=registry.example.com/inference:${{ github.sha }}
          docker build -t $IMAGE_TAG .
          docker push $IMAGE_TAG

      - name: Install Argo CD CLI
        run: |
          curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
          chmod +x argocd && sudo mv argocd /usr/local/bin/

      - name: Deploy via Argo CD
        env:
          ARGOCD_SERVER: ${{ secrets.ARGOCD_SERVER }}
          ARGOCD_TOKEN: ${{ secrets.ARGOCD_TOKEN }}
        run: |
          argocd login $ARGOCD_SERVER --auth-token $ARGOCD_TOKEN --insecure
          argocd app set inference-api --kustomize-image registry.example.com/inference=${{ github.sha }}
          argocd app sync inference-api --wait
```

这样，每次 `git push` 到 main 分支都会自动构建镜像、更新 Application、触发同步。`--wait` 参数让 CI 等待部署完成，失败时 CI Pipeline 直接报错。

### 第四步：配置 SSO 与 RBAC

生产环境必须对接企业 SSO（OIDC 协议），并配置 RBAC。以对接 Keycloak 为例，在 `argocd-cm` ConfigMap 中添加：

```yaml
data:
  oidc.config: |
    name: Keycloak
    issuer: https://keycloak.example.com/realms/your-company
    clientID: argocd
    clientSecret: $oidc.keycloak.clientSecret
    requestedScopes: ["openid", "profile", "email", "groups"]
```

在 `argocd-rbac-cm` ConfigMap 中配置基于组的权限：

```yaml
data:
  policy.csv: |
    g, "ml-platform-admins", role:admin
    g, "ml-developers", role:developer
    p, role:developer, applications, get, ml-platform/*, allow
    p, role:developer, applications, sync, ml-platform/*, allow
    p, role:developer, applications, action/apps/DaemonSet/restart, ml-platform/*, allow
```

这样 ML 平台管理员拥有全部权限，ML 开发者只能查看和同步自己项目的应用，不能修改全局配置。

### 第五步：配置监控与告警

Argo CD 自带 Prometheus metrics，只需配合 Prometheus Operator 的 ServiceMonitor 即可采集。关键指标有：

- `argocd_app_sync_status`：同步状态（1=Synced，0=OutOfSync）
- `argocd_app_health_status`：健康状态（1=Healthy，0=Degraded/Missing）
- `argocd_app_sync_duration_seconds`：同步耗时直方图

配置一条 Prometheus 告警规则：

```yaml
groups:
  - name: argocd
    rules:
      - alert: AppOutOfSync
        expr: argocd_app_sync_status == 0
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Application {{ $labels.name }} is out of sync"
      - alert: AppUnhealthy
        expr: argocd_app_health_status == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Application {{ $labels.name }} is unhealthy"
```

## 常见误区

**误区 1：GitOps 就是把 YAML 放到 Git 里而已。** → 远不止如此。GitOps 强调「实际状态与期望状态持续比对 + 自动收敛」，缺了 Argo CD 这种 Operator 的持续同步，Git 里的 YAML 只是一堆静态文件。反过来，集群中出现任何漂移（比如有人手动改了副本数），Argo CD 的 self-heal 会自动修正——这才是 GitOps 的核心价值。

**误区 2：启用 automated sync 就等于所有变更都自动部署，风险太大。** → automated sync 只是 GitOps 的一个选项。生产环境完全可以用手动同步 + Git Tag 版本控制，每次发布需要人点一下 Sync。或者搭配 Argo Rollouts 的 Canary 策略，自动化但渐进式发布，每一步都有观察窗口。关键是找到适合业务风险的平衡点，而不是因为怕风险就退回「SSH 上去 kubectl apply」的石器时代。

**误区 3：Helm 比 Kustomize 好，或者反过来。** → 两者解决的问题不同。Kustomize 擅长「同一应用多环境差异化配置」，用 patch 的方式覆盖，思路清晰；Helm 擅长「复杂应用打包分发」，比如要把一个包含 20 个 CRD、多组件联动的应用（如 Prometheus 全家桶）发布给客户，Helm 是标准。很多团队两者混用：底层用 Helm 打包中间件，上层用 Kustomize 管理自己业务服务的多环境覆盖。

**误区 4：一个 Git 仓库放所有 Application 配置，大而全最好。** → 仓库拆分策略取决于团队组织结构。如果是单体团队管理所有基础设施，单仓库没问题；如果是多个业务团队各自管理自己的服务，应该用「App of Apps」模式：一个根 Application 指向一个目录，目录中每个子 Application 指向各业务团队自己的 Git 仓库。这样各团队独立维护自己的 manifests，互不干扰，又都受 Argo CD 统一管理。

**误区 5：Argo CD 只能部署到它所在的集群。** → Argo CD 的 Application 的 `destination.server` 可以指向任意 K8s 集群的 API Server。只要在 Argo CD 中添加了目标集群的 kubeconfig 凭证，一个 Argo CD 实例就能管理数十个集群（开发/测试/生产/边缘）。这对于多区域部署推理服务的场景尤其有用，所有集群的部署状态都在一个 UI 中统一可见。
