---
title: Prometheus + Grafana 监控体系
category: devops
difficulty: intermediate
duration: 1周
summary: 服务上线后不知道它死活，就像飞机没有仪表盘——监控是工程化的最后一道防线
takeaways:
  - 理解 Prometheus Pull 模型和四大指标类型（Counter/Gauge/Histogram/Summary）
  - 能为 FastAPI 服务添加 /metrics 端点并用 PromQL 查询
  - 能用 Grafana 构建 AI 推理服务的监控仪表盘
  - 能配置 Prometheus 告警规则并接入 Alertmanager 通知
relatedTerms: prometheus
relatedTools:
  - prometheus
  - grafana
relatedIntel:
  - 007-docker
  - 008-git
  - 009-linux
relatedNodes: electrical-safety
tags:
  - prometheus
  - grafana
  - metrics
  - alerting
  - observability
  - monitoring
---

## 为什么你要学它

一个模型训练了 3 天，服务上线了，突然 GPU 显存泄漏、OOM、请求超时——你一无所知，直到用户打电话投诉。

**监控不是为了证明一切正常，而是为了尽早发现异常**。在 AI 服务场景里，监控让你知道：
- GPU 利用率是否正常（低了说明推理卡在 IO，高了可能过载）
- 模型推理延迟是否在 SLA 以内（慢了用户体验下降）
- 错误率是否飙升（可能模型在跑脏数据）

Prometheus + Grafana 是云原生监控的事实标准，学一次到处能用（AI 服务、Web 服务、数据库通吃）。

## 一句话概览

- **Prometheus**：时序数据库，用 Pull 模式从每个服务的 /metrics 端点拉取数据，用 PromQL 查询
- **Grafana**：可视化平台，连接 Prometheus 后可绑扎各种图表和告警
- **Alertmanager**：告警路由，把 Prometheus 的告警转发到邮件/Slack/钉钉等渠道

## 核心拆解

### 🔑 Prometheus 数据模型

Prometheus 存储的是**时间序列数据**，每条数据 = 指标名 + 标签集合 + 时间戳 + 值。

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="POST", endpoint="/predict", status="200"} 12345
```

四大指标类型：

| 类型 | 说明 | 典型用法 |
|---|---|---|
| **Counter** | 只增不减的计数器 | 请求总数、错误总数 |
| **Gauge** | 可增可减的仪表 | 当前内存使用、GPU 利用率 |
| **Histogram** | 分布直方图 | 请求延迟分布（用于计算 P50/P99） |
| **Summary** | 分位数 | 同 Histogram，但预先计算好分位数 |

### 🔑 Histogram 与分位数计算

P50 / P95 / P99 延迟用 Histogram 计算：

```
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
```

Histogram 把延迟范围分成多个 bucket（[0.005s, 0.01s, 0.05s, ...]），每个 bucket 记录落入该范围的请求数。PromQL 通过积分和线性插值计算出任意分位数。

### 🔑 PromQL 核心函数

```promql
# QPS（每秒请求数）
rate(http_requests_total[1m])

# P99 延迟
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# GPU 利用率
avg(gpu_utilization) by (instance)

# 错误率
sum(rate(http_requests_total{status=~"5.."}[2m])) / sum(rate(http_requests_total[2m]))
```

## 实战指南

### FastAPI 添加 metrics 端点

```python
from prometheus_client import Counter, Histogram, generate_latest

REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)
REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP latency',
    ['endpoint'],
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 5.0]
)

@app.middleware("http")
async def track_request(request: Request, call_next):
    with REQUEST_LATENCY.labels(endpoint=request.url.path).time():
        response = await call_next(request)
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### Grafana AI 服务仪表盘

关键 Panel：
1. **QPS**：Rate of `http_requests_total[1m]`，按 endpoint 分面
2. **P99 延迟**：Histogram quantile 0.99
3. **GPU 利用率**：Gauge Panel，阈值标红 > 90%
4. **错误率**：红色 Alert 叠加层

### Alertmanager 告警配置

```yaml
groups:
- name: ai-service
  rules:
  - alert: HighGPUUtilization
    expr: avg(gpu_utilization) > 90
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "GPU 利用率超过 90%"
  - alert: HighErrorRate
    expr: sum(rate(http_requests_total{status=~"5.."}[2m])) / sum(rate(http_requests_total[2m])) > 0.05
    for: 2m
    labels:
      severity: critical
```

## 常见误区

### 误区 1：使用太多高基数标签导致时间序列爆炸

**错误理解**：为了方便查询，给指标添加大量标签，比如 user_id、request_id、timestamp 等高基数字段。

**正确理解**：Prometheus 的时间序列存储模型决定了每个唯一的标签组合都会创建一个新的时间序列。如果标签基数过高（如百万级 user_id），会导致内存和磁盘消耗急剧增加，查询性能严重下降，甚至导致 Prometheus OOM。

**如何避免**：只使用低基数标签（如 status、method、endpoint）。对于高基数数据，考虑使用 Histogram 分桶统计，或将详细数据存储在 ClickHouse、BigQuery 等专门的时序分析数据库中。

### 误区 2：混淆 Histogram 和 Summary 的使用场景

**错误理解**：认为 Summary 和 Histogram 功能相同，随便选一个用就行。

**正确理解**：Summary 在客户端预计算分位数，无法跨实例聚合；Histogram 在服务端存储分桶数据，可以通过 PromQL 计算任意分位数并跨实例聚合。在分布式系统中，Histogram 是更好的选择，因为它支持聚合查询。

**如何避免**：监控单个服务的延迟分布时，优先使用 Histogram。只有在需要精确分位数且不需要聚合时，才考虑使用 Summary。对于 P99 等分位数计算，Histogram 配合 histogram_quantile() 函数是标准做法。

### 误区 3：告警规则设置过于敏感导致告警风暴

**错误理解**：设置非常短的 for 持续时间（如 30 秒）和低阈值，希望第一时间发现问题。

**正确理解**：过于敏感的告警会产生大量误报，导致"告警疲劳"——当真正的故障发生时，运维人员已经对告警麻木了。正常的系统波动（如短暂的 CPU 峰值）不应该触发告警。

**如何避免**：设置合理的 for 持续时间（至少 2-5 分钟），避免在系统正常波动范围内设置阈值。使用多级告警策略：Warning（提前预警）→ Critical（必须立即处理）。定期审查和调整告警规则，删除无效告警。

## 相关资源

- [Prometheus 官方文档](https://prometheus.io/docs/introduction/overview/)
- [Grafana 官方文档](https://grafana.com/docs/grafana/latest/)
- [Prometheus Alerting 配置](https://prometheus.io/docs/alerting/latest/configuration/)
