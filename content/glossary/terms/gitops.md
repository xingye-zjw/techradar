---
title: GitOps
slug: gitops
---

# GitOps

**GitOps** 是一种以 **Git 仓库作为基础设施和应用配置的唯一事实来源（Single Source of Truth, SSOT）** 的 DevOps 实践模式。由 Weaveworks 公司 CEO Alexis Richardson 于 2017 年正式提出，核心思想是：所有期望的系统状态（Kubernetes YAML、Helm Chart、Terraform 基础设施代码、配置文件）都以声明式（Declarative）代码的形式存储在 Git 中，通过 Pull Request 做代码评审和审计，再由一个集群内的 Operator 自动将 Git 中的期望状态与集群的实际状态进行比对，并自动修复任何发生漂移（Drift）的差异。

## GitOps vs 传统 CI/CD 的本质差异

### 传统 Push 模式（Jenkins + kubectl apply）

```
开发者 Push 代码到 Git
      │
      ▼
CI (Jenkins/GitLab CI) 跑构建 → 跑测试 → kubectl apply / helm upgrade
      │
      ▼
K8s API Server ───→ 集群实际状态
```

问题：

1. **CI 必须拥有所有集群的 KUBECONFIG 写权限** → 10 个集群=CI 节点上有 10 把「根密钥」，一旦被拿权限全丢
2. **集群实际状态不可追溯**：有人偷偷手动 kubectl edit 改了 ConfigMap → 你根本不知道，直到出事故
3. **失败不可回滚**：CI apply 一半失败，集群处于半中间状态 → 只能人工排查
4. **多云/多集群管理乱**：每个集群单独配 Webhook，脚本越写越复杂

### GitOps Pull 模式（Operator inside Cluster）

```
开发者 Push PR → Code Review + CI 验证 → Merge 到 main
                                                │
Git 仓库（期望状态）◄─── 每 3 分钟 Pull + Diff ───┼─── GitOps Operator 在集群内部跑
      │                                         │
      ├─ 期望：Deployment replicas=3             │
      ├─ 期望：ConfigMap key=xxx                 │ 发现 Drift！
      └─ 期望：Ingress rules=...                 │ 实际集群 replicas=2 vs 期望=3
                                                ▼
                                     Operator 自动 kubectl apply 修复
                                     （保证实际状态 → 期望状态）
```

核心好处：**Git 有的，集群必须有；Git 没有的，集群不能有。**

## GitOps 的四大核心原则（官方定义）

### 原则 1：期望状态以声明式存储在 Git 中

> 声明式（Declarative）：你写「最终要什么」（3 个副本、8080 端口暴露），不是写「怎么一步步做」（kubectl create → kubectl expose → kubectl scale）。

K8s YAML、Helm Chart、Kustomize、Terraform HCL、Crossplane XRs 全都是声明式。

### 原则 2：期望状态和实际状态不可变且版本化

- Git Commit = 某个时间点系统状态的不可变快照（SHA256 哈希）
- 任何变更都必须经过 Commit → PR → Review → Merge → Append-only
- 出事故 **git revert HEAD~1** → 一键回滚到上一个版本，不用重建集群

### 原则 3：变更通过自动拉取 + 自动审批后应用

GitOps Operator（ArgoCD、Flux）在集群里跑，每 3 分钟：

1. git fetch → 拿到最新期望状态
2. `kubectl diff -f git_repo/` → 和集群实际状态比
3. 有差异 → 自动 apply（或手动审批后 apply）

注意：**审批动作也是通过改 Git（在代码里加 approved: true 标签）完成，不在外部平台点按钮。**

### 原则 4：持续调和（Continuous Reconciliation）

Operator 不是「只在 Git 变更时干活」，而是每 3 分钟跑一轮 Diff：

- 有人误操作删了 Deployment → 3 分钟后被 Operator 自动复活
- ConfigMap 被手动改 → 3 分钟后被回滚到 Git 版本
- 有人用 Helm 升级了 Chart → 和 Git 版本不一致，被打回去

调和是 GitOps 和传统 CD 的最大区别：**它像 K8s Controller 一样持续「维稳」，不是一次性 apply 就完事。**

## 两大主流 GitOps 工具对比

| 维度             | **Argo CD**（Intuit 出品，CNCF 毕业项目）                                                    | **Flux CD**（Weaveworks 出品，CNCF 孵化项目）                                        |
| ---------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **架构**         | 单体 + 多组件（Repo-server / Application-Controller / Dex）                                  | 模块化：Source Controller / Kustomize Controller / Helm Controller / Notification 等 |
| **UI**           | 官方有超棒的 React Web UI：可视化 Diff、回滚按钮、Sync 状态拓扑图、App Health Check          | 原生无 UI，用 Weave GitOps 付费版或开源社区的 Flux2 UI                               |
| **多集群管理**   | ApplicationSet 一套模板生成 N 集群 App，单 ArgoCD 管理 100+ 集群                             | Flux Kustomization + kustomization.yaml 自己拼，或用 Terraform 生成                  |
| **App 定义方式** | CRD：Application / ApplicationSet / AppProject                                               | CRD：Kustomization / HelmRelease / OCIRepository / GitRepository                     |
| **Helm 支持**    | Helm Release 渲染 + 健康检查一等公民，支持 values 动态传递                                   | HelmRelease CRD，支持自动 SemVer 补丁级升级 + 失败自动回滚                           |
| **CI 集成**      | Webhook 或 `argocd app sync` CLI 触发                                                        | Flux CLI + Source Controller 自动监控 Git                                            |
| **权限模型**     | AppProject + OIDC + RBAC：谁能操作哪个命名空间下的哪个 App 写得清清楚楚                      | Kubernetes 原生 RBAC + ServiceAccount Impersonation                                  |
| **Sync 策略**    | 自动 + 手动；Hook 前/后置任务；Sync Wave（资源部署顺序）；Apply Prune（清理 Git 删了的资源） | 自动 Sync + Prune；HelmRelease 支持 remediation.retries                              |
| **生态**         | Argo Workflows + Argo Rollouts + Argo Events「全家桶」，渐进式发布一把梭                     | Flagger 配合做 Canary / A/B 发布，和 Istio / Linkerd 深度集成                        |

**选型建议**：

- 多租户、多集群、要可视化 UI → Argo CD（国内 80% 企业选这个）
- 极简主义、Git 纯原生、CI 流水线要轻 → Flux CD

## Argo CD 经典落地架构

```
                         ┌──────────────────────────────┐
                         │  Git 组织                    │
                         │  ├─ gitops-infra.git         │ ◄── 基础设施 / 集群级资源
                         │  ├─ gitops-apps-prod.git    │ ◄── 生产环境 App 配置
                         │  ├─ gitops-apps-staging.git │ ◄── 预发环境
                         │  └─ helm-charts.git         │ ◄── 团队内部 Helm 库
                         └──────────────┬───────────────┘
                                        │ Git HTTPS + Deploy Key（只读）
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  生产 K8s 集群                                                           │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │  ArgoCD Server (UI/API)                                       │      │
│  │  - SSO 对接公司 Okta / 飞书 / 钉钉 OIDC                       │      │
│  │  - 给团队 A 开 app-team-a 命名空间编辑权限                    │      │
│  └──────────┬───────────────────────────────────────────────────┘      │
│             │ 读取/写入                                                  │
│  ┌──────────▼───────────────────────────────────────────────────┐      │
│  │  ArgoCD Application Controller（核心，跑 Reconcile Loop）     │      │
│  │    每 3 分钟:                                                  │      │
│  │    1. Clone Git Repo → 本地存 manifest                         │      │
│  │    2. kube diff → 对比期望 vs 实际                             │      │
│  │    3. 差异 → 按 Sync Wave 顺序 kubectl apply + Prune           │      │
│  │    4. Health Check（Deployment available / Pod Ready…）        │      │
│  └──────────┬───────────────────────────────────────────────────┘      │
│             │ 读写 K8s API                                               │
│             ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │  实际 K8s 资源：Deployment / Service / Ingress / ConfigMap     │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│  ┌────────────────────────────┐   ┌────────────────────────────┐      │
│  │  Argo Rollouts（金丝雀发布） │   │  Prometheus + Alertmanager │      │
│  └────────────────────────────┘   └────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 应用配置的推荐目录结构（App of Apps 模式）

ArgoCD 推荐「App of Apps」模式——用一个根 Application 去管理所有子 Application：

```
gitops-apps-prod/
├── apps/                          # 每个业务一个子目录
│   ├── user-service/
│   │   ├── Chart.yaml             # Helm 依赖引用
│   │   ├── values-production.yaml # 生产 values 覆盖
│   │   ├── values.yaml
│   │   └── templates/             # 如不用 Helm 直接放 YAML
│   ├── order-service/
│   └── payment-gateway/
├── clusters/
│   ├── prod-cluster-sh-1/         # 上海生产集群 1
│   │   ├── namespace-team-a.yaml
│   │   ├── resourcequota.yaml
│   │   └── networkpolicy.yaml
│   └── prod-cluster-bj-1/         # 北京生产集群 1
├── base/                          # Kustomize 公共基础层（所有环境复用）
│   ├── monitoring/                # Prometheus + Grafana 基础监控
│   ├── logging/                   # Loki + Promtail 日志
│   └── security/                  # RBAC + PSP
└── root-app.yaml                  # 根 Application（ArgoCD 自己管自己）
```

## GitOps 工作流：完整一日示例

### 场景：把 user-service 从 v1.2.3 升级到 v1.2.4（修复一个 Bug）

#### Step 1：开发者改代码

```bash
# 1. 改 user-service 代码 → 推到 feature/fix-bug-xxx → CI 构建镜像
# Dockerfile 构建成功后，推镜像：
docker push registry.company.com/user-service:v1.2.4

# 2. 开发者用 Image Updater（Argo CD Image Updater）或手动改 GitOps Repo：
cd gitops-apps-prod
git checkout -b upgrade/user-service-v1.2.4
vim apps/user-service/values-production.yaml
# 修改:
#   image:
#     tag: v1.2.3  →  v1.2.4

git add apps/user-service/values-production.yaml
git commit -m "feat: upgrade user-service to v1.2.4 (fix bug-xxx)"
git push origin upgrade/user-service-v1.2.4

# 3. 开 Pull Request，触发 CI 做静态校验：
#    ├── helm lint + helm template 验证 YAML 合法
#    ├── kubeval / kubeconform 校验 K8s API Schema
#    ├── Checkov / Trivy 扫配置漏洞（没开 resources limit？privileged=true？）
#    ├── OPA Gatekeeper 校验公司内部 Policy
#    └── 自动生成 diff（给 reviewer 看变更了哪些字段）
```

#### Step 2：Code Review

- Team Lead Review：确认 v1.2.4 在 staging 验证通过，附 Staging 冒烟测试链接
- SRE Review：资源 limit/request 是否合理、健康检查 endpoint 是否对
- 2 Approved → Merge

#### Step 3：GitOps 自动同步

```
Merge 到 main 分支  14:32:10
        │
        ▼
ArgoCD Controller 检测到 Git 变更（Webhook 或下一轮轮询）
  → 解析 Helm Values，生成期望 YAML
  → 和集群实际 v1.2.3 Deployment Diff
  → 发现 spec.template.spec.containers[0].image 字段变化
  → 触发 Rolling Update

集群 Deployment rolling update：
  14:32:15  ReplicaSet user-service-v1.2.4-aaa 创建 1 个新 Pod
  14:32:22  新 Pod Ready → 旧 v1.2.3 ReplicaSet 缩掉 1 个 Pod
  14:32:31  滚动完成（3/3 replicas Ready，全部是 v1.2.4）
  14:32:32  ArgoCD Health Check → Healthy ✓
```

#### Step 4：问题？一键回滚

上线后发现 v1.2.4 有性能退化，接口 P99 从 80ms 涨到 400ms → SRE 要回滚：

```bash
# 方式一（GitOps 推荐）：
git revert HEAD~1
# → 生成 revert commit，把 v1.2.4 改回 v1.2.3
# → PR merge → ArgoCD 自动回滚

# 方式二（紧急，ArgoCD UI 操作，Git 会滞后）：
# ArgoCD UI → user-service App → History 找到 v1.2.3 版本 → Rollback 按钮
# → 立即回滚（建议事后补 revert commit 让 Git 和集群一致）
```

## GitOps 的最佳实践清单

### ✅ 必做项

1. **多环境多仓库 / 多分支**：不要把 prod/staging/dev 的配置放一个分支里，容易手滑写错环境。
2. **App of Apps + ApplicationSet 管理多集群**：一个新集群上线只需在 clusters/ 下加一份配置，ArgoCD 自动部署所有基础组件。
3. **严格的 AppProject RBAC**：Team A 只能看/改 team-a 命名空间的 App，Team B 看不到，出问题隔离影响面。
4. **强制 SSO 登录 + 禁用本地 admin 账号**：和公司 Okta/AD/飞书/钉钉 OIDC 打通，所有操作有审计日志。
5. **Sync 启用 Prune + SelfHeal**：Prune 清理 Git 删掉的资源；SelfHeal 自动修人手动改的 Drift。
6. **Health Check + Sync Wave**：数据库先起来 → MessageQueue → API → Frontend，顺序乱了会 CrashLoop。
7. **变更通知接入 Slack/飞书群**：每次 Sync 成功/失败、健康状态变更立刻推群，事故响应提前 10 分钟。

### ❌ 禁止项

1. **不要把 Secret 明文放 Git！** 用 Sealed Secrets（bitnami-labs）、External Secrets + HashiCorp Vault、或 SOPS + KMS 加密。
2. **不要在 CI 里 kubectl apply！** 回到了 Push 模式，白搞 GitOps。
3. **不要把大文件/二进制放 GitOps Repo！** Helm Chart 用 OCI Registry（Harbor/ACR），不要把 tgz 塞 Git 里。
4. **不要手工 kubectl edit！** 改了 3 分钟后 ArgoCD 给你干回去，还找不到是谁改的——有想法改 Git。
5. **不要一个 App 管整集群 YAML**：拆分 App（基础设施、可观测性、业务 A、业务 B…），发布失败隔离。

## GitOps 渐进式发布（Argo Rollouts + 金丝雀）

GitOps + Argo Rollouts 可以把「简单滚动升级」升级为「金丝雀 + Prometheus 自动判定回滚」：

```yaml
# rollout.yaml 简化版
apiVersion: argoproj.io/v1alpha1
kind: Rollout
spec:
  strategy:
    canary:
      steps:
        - setWeight: 5 # 第 1 步：5% 流量进新版本
        - pause: { duration: 5m } # 观察 5 分钟
        - setWeight: 20 # 20% 流量
        - pause: { duration: 10m }
        - setWeight: 50 # 50%
        - analysis: # 跑 Prometheus 指标自动判定
            templates:
              - templateName: success-rate-analysis
                # success-rate > 99%, p99 < 200ms, error < 0.1% → PASS
                # 否则自动 ROLLBACK
        - setWeight: 100 # 全量
```

这套组合拳，能做到「发布自动化、观测自动化、回滚自动化」，半夜升级都能睡觉。

## GitOps 的落地难点与应对

1. **现有存量集群 YAML 一团糟，怎么迁到 GitOps？**
   → 先装 ArgoCD → 把现有实际状态用 `kubectl get all -A -o yaml` 导出 → 清理 metadata/status 字段 → 提交 Git → 先开 Dry Run 跑一轮 Diff → 确定和实际没差 → 再启用 Auto Sync。

2. **StatefulSet / PV / 数据库怎么办？**
   → 数据库不要 GitOps 直接改 schema！用 Liquibase / Flyway 在 App 启动时跑迁移脚本，GitOps 只负责把镜像拉起。PV/PVC 不要开 Prune，万一删了就是删库。

3. **安全合规要求：必须有人审批，不能自动同步？**
   → ArgoCD 的 Sync Policy 设置为 `Manual`，PR Merge 后 Argo 只生成 Diff，不会自动 Apply，需要 Owner 在 UI 上点 Sync（这个动作也会被审计日志记录）。

4. **GitOps 本身崩了怎么办？**
   → ArgoCD 自己也要由 ArgoCD 管理（自举），同时出两套备份：etcd 快照 + Git Repo。最坏情况重建集群 → 装 ArgoCD → 连 Git Repo → 一天内恢复所有服务（真实案例：某金融客户机房火灾，用 GitOps 8 小时恢复了 300+ App 全部配置）。

## 未来展望

1. **GitOps for Everything**：从 K8s 扩展到 VM（OpenTofu/Terraform Controller）、云原生数据库（Crossplane）、网络设备（Cisco Catalyst 声明式配置）、IoT 设备（ArgoIoT）—— 一切可编程的基础设施都纳入 GitOps 管理。
2. **LLM + GitOps**：产品经理说「帮我把订单服务扩容到 10 个副本，顺便把 Redis maxmemory 改成 8G」→ LLM 生成 Kustomize Patch → 自动开 PR + 跑检查 → 推给 SRE review，GitOps 再 apply。
3. **Policy-as-Code + OPA/Gatekeeper 深度融合**：PR 阶段就告诉你「这个配置不符合公司 Pod Security Baseline，有 3 个高危，禁止合并」，从源头防配置事故。
4. **eBPF + GitOps 联合验证**：Argo Sync 时用 eBPF 抓真实流量（金丝雀 5% 流量） → 自动比 v旧/v新 接口延迟、错误率、甚至 SQL 注入等安全指标，异常自动熔断。

GitOps 的本质，是把 **软件工程几十年来沉淀的「代码版本控制 + Code Review + 回滚 + 审计」最佳实践**，原封不动地「平移」到了基础设施和运维领域。它不是一个工具，而是一种思维方式——相信 Git、不信人肉；相信声明式、不信命令式脚本；相信自动调和、不信「我刚改了个配置应该没问题」。

在多云多集群、服务数量上千的今天，GitOps 已经不再是「加分项」，而是 **SRE 团队能否睡好觉的基本前提**。

相关术语：[Kubernetes](/glossary/kubernetes)、[Git](/glossary/git)、[Docker](/glossary/docker)、[Prometheus](/glossary/prometheus)、[ONNX](/glossary/onnx)
