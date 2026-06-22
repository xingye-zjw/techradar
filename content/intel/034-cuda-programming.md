---
title: CUDA 编程入门：让 GPU 为你加速
category: infrastructure
keywords:
  - cuda
  - gpu programming
  - kernel
  - thread
  - memory coalescing
  - shared memory
difficulty: advanced
duration: 1-2周
summary: 深度学习框架帮你封装了一切，但你真的了解 GPU 是怎么工作的吗——理解 CUDA 编程才能真正优化 GPU 利用率
takeaways:
  - 理解 CUDA 的编程模型：Grid / Block / Thread
  - 能写一个简单的 CUDA Kernel 并用 nvcc 编译
  - 理解 GPU 内存层级：Global / Shared / Register
  - 能用 nvprof / Nsight 定位 GPU 程序瓶颈
---

## 为什么你要学它

PyTorch 把 GPU 编程封装得很好，但当你遇到：
- 自定义算子需要 GPU 加速
- 推理优化需要理解 memory coalescing
- 多 GPU 通信需要了解 NCCL

理解 CUDA 编程模型能让你：
- 在 PyTorch 中写高效的自定义 CUDA Kernel
- 用 Nsight 定位性能瓶颈
- 理解为什么某些操作在 GPU 上快/慢

## 一句话概览

CUDA 编程模型：
- **Grid**：整个 GPU 上所有线程的集合
- **Block**：一组线程（最多 1024 个），共享 Shared Memory
- **Thread**：最小执行单元，每个线程执行同一个 Kernel

GPU 内存层级：
- **Global Memory**：所有线程可见，带宽高（~900 GB/s）但延迟高
- **Shared Memory**：Block 内线程共享，带宽高（~10 TB/s）但容量小（48KB/Block）
- **Register**：每个线程私有，最快但数量有限

## 核心拆解

### 🔑 CUDA Kernel：每个线程做什么

```cuda
// kernel: 每个线程做一份独立的计算
__global__ void vectorAdd(float *a, float *b, float *c, int n) {
    // 计算当前线程对应的数组索引
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    
    if (i < n) {
        c[i] = a[i] + b[i];
    }
}

// 调用 Kernel
int blocks = (n + 255) / 256;  // 256 threads per block
vectorAdd<<<blocks, 256>>>(d_a, d_b, d_c, n);
```

- `blockIdx.x`：当前 Block 在 Grid 中的索引
- `threadIdx.x`：当前 Thread 在 Block 中的索引
- `blockDim.x`：每个 Block 的线程数（这里设 256）

### 🔑 Memory Coalescing：如何让显存访问快 10 倍

**坏的访问模式**（不连续）：
```cuda
// 每个 thread 访问不相邻的地址（thread i 访问 i*1024）
int i = blockIdx.x * blockDim.x + threadIdx.x;
value = global_array[i * 1024];  // ❌ 分散访问，显存带宽利用率低
```

**好的访问模式**（连续）：
```cuda
// thread i 访问连续的地址 i
int i = blockIdx.x * blockDim.x + threadIdx.x;
value = global_array[i];  // ✅ 连续访问，GPU 自动合并，带宽利用率接近 100%
```

深度学习中的卷积/矩阵乘法如果数据排布不连续（如 NHWC vs NCHW），GPU 带宽利用率会大幅下降。

### 🔑 Shared Memory：手动管理缓存

Shared Memory 适合「同一 Block 内线程反复访问同一数据」的场景：

```cuda
__global__ void sharedMatrixMultiply(float *a, float *b, float *c, int n) {
    // 每个 Block 加载一块数据到 Shared Memory
    __shared__ float sharedA[TILE][TILE];
    __shared__ float sharedB[TILE][TILE];
    
    int row = blockIdx.y * TILE + threadIdx.y;
    int col = blockIdx.x * TILE + threadIdx.x;
    
    float sum = 0.0f;
    for (int i = 0; i < n/TILE; i++) {
        // 从 Global Memory 加载到 Shared Memory
        sharedA[threadIdx.y][threadIdx.x] = a[row * n + i * TILE + threadIdx.x];
        sharedB[threadIdx.y][threadIdx.x] = b[(i * TILE + threadIdx.y) * n + col];
        __syncthreads();  // 等待所有线程加载完成
        
        // 计算
        for (int k = 0; k < TILE; k++) {
            sum += sharedA[threadIdx.y][k] * sharedB[k][threadIdx.x];
        }
        __syncthreads();
    }
    c[row * n + col] = sum;
}
```

### 🔑 PyTorch 中的自定义 CUDA Kernel

用 PyTorch 的 CUDA Extension：

```python
# my_kernel.py
import torch
from torch.utils.cpp_extension import load_inline

# 定义 CUDA Kernel
cuda_source = """
__global__ void my_kernel(const float* input, float* output, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) {
        output[i] = input[i] * 2.0f;
    }
}

torch::Tensor my_kernel_cuda(torch::Tensor input) {
    auto output = torch::empty_like(input);
    int n = input.numel();
    int blocks = (n + 255) / 256;
    my_kernel<<<blocks, 256>>>(input.data_ptr<float>(), output.data_ptr<float>(), n);
    return output;
}
"""

module = load_inline(
    name="my_extension",
    cuda_source=cuda_source,
    functions=["my_kernel_cuda"],
    verbose=True
)

# 使用
input_tensor = torch.randn(1024, device="cuda")
output_tensor = module.my_kernel_cuda(input_tensor)
```

## 实战指南

### 用 Nsight 定位瓶颈

```bash
# 编译时加 -lineinfo 以支持行级 profiling
nvcc -o my_program my_program.cu -lineinfo

# 运行 profiling
ncu --set full ./my_program

# 查看结果（浏览器打开 ncu-report.html）
# 关注指标：
# - DRAM Utilization（显存带宽利用率）
# - SM Utilization（计算单元利用率）
# - Memory Warp Stall（访存停顿）
```

## 相关资源

- [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/)
- [CUDA by Example (书)](https://developer.nvidia.com/cuda-by-example)
- [PyTorch CUDA Extension 文档](https://pytorch.org/tutorials/advanced/cpp_extension.html)
- [Nsight Compute 文档](https://docs.nvidia.com/nsight-compute/)
