# Prometheus

**Prometheus** 是 CNCF 的开源时序数据库和监控系统，采用 Pull 模式从每个服务的 /metrics 端点定期拉取数据。

## 核心概念

### 四大指标类型

```
Counter（计数器）：只增不减
  - 用途：请求总数、错误总数
  - 示例：http_requests_total

Gauge（仪表盘）：可增可减
  - 用途：当前连接数、内存使用量
  - 示例：memory_usage_bytes

Histogram（直方图）：统计分布
  - 用途：请求延迟分布
  - 示例：http_request_duration_seconds_bucket

Summary（摘要）：预计算分位数
  - 用途：实时分位数统计
  - 示例：http_request_duration_seconds
```

### 数据模型

```
时间序列 = 指标名 + 标签集 + 时间戳 + 值

示例：
http_requests_total{method="GET", status="200"} 1234 1625000000000
         ↑                     ↑              ↑         ↑
      指标名                  标签            值       时间戳
```

## PromQL 查询语言

```promql
# 1. 简单查询
http_requests_total

# 2. 标签过滤
http_requests_total{status="500"}

# 3. 聚合操作
sum(rate(http_requests_total[5m])) by (method)

# 4. 计算请求速率
rate(http_requests_total[5m])

# 5. 计算错误率
sum(rate(http_requests_total{status=~"5.."}[5m])) 
/ 
sum(rate(http_requests_total[5m]))

# 6. P99 延迟
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
```

## Docker Compose 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

volumes:
  prometheus_data:
  grafana_data:
```

## Prometheus 配置文件

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

scrape_configs:
  # 监控 Prometheus 自身
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # 监控应用服务
  - job_name: 'myapp'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['app:8000']
```

## Grafana 可视化

```json
// Grafana Dashboard 配置示例
{
  "panels": [
    {
      "title": "Request Rate",
      "type": "graph",
      "targets": [{
        "expr": "sum(rate(http_requests_total[5m]))",
        "legendFormat": "{{method}}"
      }]
    },
    {
      "title": "Error Rate",
      "type": "singlestat",
      "targets": [{
        "expr": "sum(rate(http_requests_total{status=~'5..'}[5m])) / sum(rate(http_requests_total[5m])) * 100"
      }]
    }
  ]
}
```

## 应用场景

- **微服务监控**：服务可用性、延迟、吞吐量
- **基础设施监控**：CPU、内存、磁盘、网络
- **告警系统**：异常检测、阈值告警
- **业务监控**：订单量、转化率、用户活跃度
- **CI/CD 监控**：部署频率、失败率

## 告警规则示例

```yaml
# alert_rules.yml
groups:
  - name: app_alerts
    rules:
      - alert: HighErrorRate
        expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "错误率超过 5%"
          
      - alert: HighLatency
        expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P99 延迟超过 1 秒"
```

## 相关概念

[Grafana](/glossary/grafana)、[Kubernetes](/glossary/kubernetes)、[微服务](/glossary/microservices)、[可观测性](/glossary/observability)
