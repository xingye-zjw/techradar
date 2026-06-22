---
title: Prometheus + Grafana 监控体系
category: infrastructure
keywords:
  - prometheus
  - grafana
  - metrics
  - alerting
  - observability
  - monitoring
difficulty: intermediate
duration: 1周
summary: 服务上线后不知道它死活，就像飞机没有仪表盘——监控是工程化的最后一道防线
takeaways:
  - 理解 Prometheus Pull 模型和四大指标类型（Counter/Gauge/Histogram/Summary）
  - 能为 FastAPI 服务添加 /metrics 端点并用 PromQL 查询
  - 能用 Grafana 构建 AI 推理服务的监控仪表盘
  - 能配置 Prometheus 告警规则并接入 Alertmanager 通知
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
  - alert: HighGPPUtilization
    expr: avg(gpu_utilization) > 90
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "GPU 利用率超过 90%"
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[2m]) / rate(http_requests_total[2m]) > 0.05
    for: 2m
    labels:
      severity: critical
```

## 相关资源

- [Prometheus 官方文档](https://prometheus.io/docs/introduction/overview/)
- [Grafana 官方文档](https://grafana.com/docs/grafana/latest/)
- [Prometheus Alerting 配置](https://prometheus.io/docs/alerting/latest/configuration/)
