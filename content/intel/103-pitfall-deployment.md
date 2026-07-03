---
title: "模型部署踩坑合集"
category: devops
difficulty: advanced
duration: 30分钟
summary: 涵盖 4 个常见踩坑：ONNX 导出后推理结果与 PyTorch 不一致、模型推理延迟高/吞吐量低、服务器多并发时模型加载慢、容器化部署模型文件缺失，每个均附快速修复与排查步骤。
takeaways:
  - 掌握「模型部署踩坑合集」中各问题的快速识别方法
  - 理解每个踩坑的根因分析和排查步骤
  - 学会标准化的修复流程和预防措施
relatedIntel:
  - 014-onnx
  - 026-onnx-deployment
  - 019-vllm-inference
tags:
  - 踩坑
  - 部署
  - ONNX
  - 量化
---

[模型部署]

## ONNX 导出后推理结果与 PyTorch 不一致

// 快速修复

导出前 `model.eval()` + `opset >= 14` + `onnxsim` 简化 + 验证输出误差

// 现象表现

- × ONNX 推理输出与 PyTorch 差距大（>1e-3）
- × 导出报 shape mismatch 错误
- × 数值精度异常（NaN/Inf）

// 排查步骤

- 01 确认导出前调用 `model.eval()`，避免 dropout/batchnorm 处于训练状态
- 02 检查 batch/seq_len 的 `dynamic_axes` 配置，确保输入维度可动态变化
- 03 对比 ONNX 输出与 PyTorch 输出的差异，使用 `np.allclose` 或 `torch.allclose` 验证
- 04 尝试使用 `onnxsim` 简化模型，去除冗余算子

#ONNX#部署#PyTorch

---

[模型部署]

## 模型推理延迟高/吞吐量低

// 快速修复

启用 FP16/INT8 量化 + 批量推理 + ONNX Runtime 优化

// 现象表现

- × 单次推理耗时过长（>100ms）
- × QPS 无法满足业务需求
- × GPU 利用率低或 CPU 瓶颈

// 排查步骤

- 01 使用 profiling 工具（如 PyTorch Profiler、ONNX Runtime profiling）定位瓶颈
- 02 启用 ONNX Runtime 的图优化（graph optimization）和执行providers配置（CUDA/MLAS）
- 03 对模型进行 FP16 或 INT8 量化，使用 TensorRT 或 ONNX Runtime 的量化工具
- 04 启用批量推理（batch inference），提高 GPU 利用率

#推理加速#性能优化#部署

---

[模型部署]

## 服务器多并发时模型加载慢

// 快速修复

模型预加载到内存/GPU + 使用模型池 + 减少模型复制

// 现象表现

- × 首次请求耗时几秒甚至更久
- × 并发请求排队等待
- × 内存占用持续增长

// 排查步骤

- 01 实现模型预热和预加载，服务启动时将模型加载到内存/GPU
- 02 使用 uvicorn/gunicorn 多 worker 配合模型池，避免每个 worker 独立加载模型
- 03 限制并发数，使用信号量或队列控制同时推理的请求数
- 04 检查是否存在模型参数重复复制问题，使用共享内存或单例模式

#部署#推理加速#服务器

---

[模型部署]

## 容器化部署模型文件缺失

// 快速修复

使用 volume 挂载模型 + Dockerfile 分阶段构建 + .dockerignore 排除

// 现象表现

- × 容器启动失败，报 `model.pth not found`
- × 镜像体积过大（包含大模型文件）
- × 模型更新后需要重新构建镜像

// 排查步骤

- 01 将模型文件通过 volume 挂载到容器，不要将大文件 COPY 进镜像
- 02 使用 Dockerfile 分阶段构建，生产镜像只包含运行时依赖
- 03 配置 `.dockerignore` 排除模型文件和训练数据
- 04 启动容器前验证模型文件存在于挂载路径

#Docker#部署#模型迁移
