"""
为 tools.json 添加新工具数据
"""
import json
import os

NEW_TOOLS = [
    {
        "name": "Matplotlib",
        "slug": "matplotlib",
        "category": "data-processing",
        "purpose": "Python 数据可视化基础库，支持折线图/柱状图/散点图/热力图等",
        "description": "Matplotlib 是 Python 数据可视化的基础库，提供了丰富的图表类型（折线图/柱状图/散点图/热力图/3D图等）。它与 NumPy、pandas 无缝集成，支持自定义样式和导出多种格式（PNG/PDF/SVG），是数据分析和科学研究的必备工具。",
        "install": "pip install matplotlib",
        "features": [
            "丰富的图表类型：折线/柱状/散点/热力图/3D图",
            "与 NumPy/pandas 无缝集成",
            "自定义样式和主题",
            "导出 PNG/PDF/SVG 等多种格式"
        ],
        "tags": ["可视化", "图表", "Python"],
        "github": {"stars": "19k", "last_release": "2025-05", "url": "https://github.com/matplotlib/matplotlib"},
        "difficulty": "beginner",
        "official_url": "https://matplotlib.org/stable/contents.html",
        "use_cases": ["数据可视化", "科研绘图", "报表生成"],
        "relatedIntel": [],
        "relatedNodes": [],
        "relatedTerms": ["visualization", "plot", "chart"]
    },
    {
        "name": "Plotly",
        "slug": "plotly",
        "category": "data-processing",
        "purpose": "交互式可视化库，支持动态图表和 Dashboard 构建",
        "description": "Plotly 是一个交互式可视化库，支持动态图表、3D可视化和 Dashboard 构建。它提供 Dash 框架用于构建交互式 Web 应用，支持 Python/R/JavaScript 多语言，可导出 HTML 在浏览器中交互查看，是数据展示和报表的理想工具。",
        "install": "pip install plotly dash",
        "features": [
            "交互式图表：鼠标悬停显示数据、缩放、平移",
            "Dash 框架构建交互式 Web Dashboard",
            "支持 Python/R/JavaScript",
            "导出 HTML 在浏览器中交互查看"
        ],
        "tags": ["交互式", "可视化", "Dashboard"],
        "github": {"stars": "16k", "last_release": "2025-06", "url": "https://github.com/plotly/plotly.py"},
        "difficulty": "intermediate",
        "official_url": "https://plotly.com/python/",
        "use_cases": ["交互式报表", "Dashboard", "数据探索"],
        "relatedIntel": [],
        "relatedNodes": [],
        "relatedTerms": ["dashboard", "interactive", "visualization"]
    },
    {
        "name": "vLLM",
        "slug": "vllm",
        "category": "llm",
        "purpose": "高性能 LLM 推理引擎，PagedAttention 技术实现高吞吐量",
        "description": "vLLM 是一个高性能的大语言模型推理引擎，采用 PagedAttention 技术管理 KV Cache 内存，实现高吞吐量和低延迟。它支持连续批处理、张量并行和多 GPU 推理，提供 OpenAI 兼容的 API 接口，是 LLM 生产部署的首选引擎之一。",
        "install": "pip install vllm",
        "features": [
            "PagedAttention 高效管理 KV Cache 内存",
            "连续批处理提高吞吐量",
            "张量并行和多 GPU 推理",
            "OpenAI 兼容的 API 接口"
        ],
        "tags": ["LLM", "推理", "高吞吐"],
        "github": {"stars": "30k", "last_release": "2025-06", "url": "https://github.com/vllm-project/vllm"},
        "difficulty": "advanced",
        "official_url": "https://vllm.readthedocs.io",
        "use_cases": ["LLM 推理", "API 服务", "高并发部署"],
        "relatedIntel": ["019-vllm-inference"],
        "relatedNodes": [],
        "relatedTerms": ["llm", "inference", "paged-attention"]
    },
    {
        "name": "Triton Inference Server",
        "slug": "triton-inference-server",
        "category": "llm",
        "purpose": "NVIDIA 推出的生产级推理服务器，支持多框架模型部署",
        "description": "Triton Inference Server 是 NVIDIA 推出的生产级推理服务器，支持 PyTorch、TensorFlow、ONNX、TensorRT 等多种框架模型。它提供动态批处理、模型并发执行和 GPU 内存优化，支持 REST 和 gRPC 协议，是生产环境模型部署的标准选择。",
        "install": "docker pull nvcr.io/nvidia/tritonserver",
        "features": [
            "支持 PyTorch/TensorFlow/ONNX/TensorRT 多框架",
            "动态批处理和模型并发执行",
            "GPU 内存优化和多模型共享",
            "REST 和 gRPC 协议支持"
        ],
        "tags": ["推理", "部署", "NVIDIA"],
        "github": {"stars": "8k", "last_release": "2025-05", "url": "https://github.com/triton-inference-server/server"},
        "difficulty": "advanced",
        "official_url": "https://developer.nvidia.com/nvidia-triton-inference-server",
        "use_cases": ["模型部署", "推理服务", "生产环境"],
        "relatedIntel": [],
        "relatedNodes": [],
        "relatedTerms": ["inference", "deployment", "tensorrt"]
    },
    {
        "name": "FastAPI",
        "slug": "fastapi",
        "category": "devops",
        "purpose": "高性能 Python Web 框架，自动生成 OpenAPI 文档，适合构建模型 API",
        "description": "FastAPI 是一个高性能的 Python Web 框架，基于 Starlette 和 Pydantic 构建。它自动生成 OpenAPI 文档和交互式文档页面，支持异步请求处理和类型检查，是构建机器学习模型 API 服务的理想选择。",
        "install": "pip install fastapi uvicorn",
        "features": [
            "自动生成 OpenAPI 文档和 Swagger UI",
            "异步请求处理，性能接近 Go/Node.js",
            "Pydantic 类型检查和数据验证",
            "依赖注入和中间件支持"
        ],
        "tags": ["API", "Web", "异步"],
        "github": {"stars": "72k", "last_release": "2025-06", "url": "https://github.com/fastapi/fastapi"},
        "difficulty": "intermediate",
        "official_url": "https://fastapi.tiangolo.com",
        "use_cases": ["模型 API", "Web 服务", "微服务"],
        "relatedIntel": [],
        "relatedNodes": [],
        "relatedTerms": ["api", "rest", "openapi"]
    },
    {
        "name": "Apache Airflow",
        "slug": "airflow",
        "category": "devops",
        "purpose": "工作流编排平台，可视化 DAG 定义和管理数据管道",
        "description": "Apache Airflow 是一个工作流编排平台，通过 DAG（有向无环图）定义和管理数据管道。它提供可视化界面监控任务执行状态，支持任务依赖、失败重试和定时调度，可与 Kubernetes、AWS、GCP 等平台集成，是 MLOps 数据管道的核心工具。",
        "install": "pip install apache-airflow",
        "features": [
            "DAG 可视化定义和管理数据管道",
            "任务依赖、失败重试和定时调度",
            "可视化界面监控任务执行状态",
            "与 Kubernetes/AWS/GCP 等平台集成"
        ],
        "tags": ["工作流", "编排", "DAG"],
        "github": {"stars": "37k", "last_release": "2025-05", "url": "https://github.com/apache/airflow"},
        "difficulty": "advanced",
        "official_url": "https://airflow.apache.org/docs",
        "use_cases": ["数据管道", "ETL", "MLOps"],
        "relatedIntel": [],
        "relatedNodes": [],
        "relatedTerms": ["workflow", "dag", "pipeline"]
    },
    {
        "name": "Kubeflow",
        "slug": "kubeflow",
        "category": "devops",
        "purpose": "Kubernetes 上的机器学习平台，提供训练/推理/ pipeline 一站式解决方案",
        "description": "Kubeflow 是基于 Kubernetes 的机器学习平台，提供训练、推理、Pipeline 的一站式解决方案。它包含 Jupyter Notebook 管理、Pipeline 编排、模型服务和超参数调优等组件，是云原生 MLOps 的标准平台。",
        "install": "通过 Kubernetes 部署",
        "features": [
            "Jupyter Notebook 多用户管理",
            "Pipeline 编排和可视化",
            "模型服务和推理管理",
            "Katib 超参数自动调优"
        ],
        "tags": ["MLOps", "Kubernetes", "云原生"],
        "github": {"stars": "15k", "last_release": "2025-04", "url": "https://github.com/kubeflow/kubeflow"},
        "difficulty": "advanced",
        "official_url": "https://www.kubeflow.org/docs",
        "use_cases": ["ML 平台", "云原生 MLOps", "团队协作"],
        "relatedIntel": [],
        "relatedNodes": [],
        "relatedTerms": ["kubernetes", "mlops", "pipeline"]
    },
    {
        "name": "Whisper",
        "slug": "whisper",
        "category": "speech",
        "purpose": "OpenAI 开源的语音识别模型，支持多语言转录和翻译",
        "description": "Whisper 是 OpenAI 开源的语音识别模型，支持 99 种语言的转录和翻译。它提供多种模型尺寸（tiny/base/small/medium/large），可在 CPU 和 GPU 上运行，并支持批量处理和实时转录，是语音处理领域的革命性工具。",
        "install": "pip install openai-whisper",
        "features": [
            "支持 99 种语言的转录和翻译",
            "多种模型尺寸（tiny 到 large）",
            "CPU 和 GPU 运行支持",
            "批量处理和实时转录"
        ],
        "tags": ["语音识别", "ASR", "多语言"],
        "github": {"stars": "35k", "last_release": "2025-05", "url": "https://github.com/openai/whisper"},
        "difficulty": "beginner",
        "official_url": "https://github.com/openai/whisper",
        "use_cases": ["语音转录", "会议记录", "字幕生成"],
        "relatedIntel": ["114-asr-speech-recognition"],
        "relatedNodes": [],
        "relatedTerms": ["asr", "speech", "transcription"]
    },
    {
        "name": "Stable Baselines3",
        "slug": "stable-baselines3",
        "category": "machine-learning",
        "purpose": "强化学习算法库，提供 PPO/SAC/DQN 等经典算法的可靠实现",
        "description": "Stable Baselines3 (SB3) 是强化学习算法的可靠实现库，提供 PPO、SAC、DQN、A2C 等经典算法。它采用一致的 API 设计，支持自定义环境和策略，并与 Gym/Gymnasium 无缝集成，是强化学习研究和应用的标准工具。",
        "install": "pip install stable-baselines3[extra]",
        "features": [
            "PPO/SAC/DQN/A2C 等经典算法实现",
            "一致的 API 设计，易于使用",
            "支持自定义环境和策略",
            "与 Gym/Gymnasium 无缝集成"
        ],
        "tags": ["强化学习", "RL", "算法库"],
        "github": {"stars": "10k", "last_release": "2025-05", "url": "https://github.com/DLR-RM/stable-baselines3"},
        "difficulty": "intermediate",
        "official_url": "https://stable-baselines3.readthedocs.io",
        "use_cases": ["强化学习", "机器人控制", "游戏 AI"],
        "relatedIntel": ["112-rl-basics"],
        "relatedNodes": [],
        "relatedTerms": ["reinforcement-learning", "ppo", "dqn"]
    },
    {
        "name": "Polars",
        "slug": "polars",
        "category": "data-processing",
        "purpose": "高性能 DataFrame 库，比 pandas 快 10-100 倍，内存占用更低",
        "description": "Polars 是一个高性能的 DataFrame 库，采用 Apache Arrow 列式存储和 Rust 实现，比 pandas 快 10-100 倍且内存占用更低。它支持懒执行、多线程并行和 SQL 查询，提供 Python 和 Rust 接口，是大规模数据处理的理想替代方案。",
        "install": "pip install polars",
        "features": [
            "Apache Arrow 列式存储，性能极高",
            "懒执行和多线程并行",
            "SQL 查询语法支持",
            "内存占用比 pandas 低 10 倍"
        ],
        "tags": ["DataFrame", "高性能", "Rust"],
        "github": {"stars": "30k", "last_release": "2025-06", "url": "https://github.com/pola-rs/polars"},
        "difficulty": "intermediate",
        "official_url": "https://pola-rs.github.io/polars-book",
        "use_cases": ["大数据处理", "数据清洗", "特征工程"],
        "relatedIntel": [],
        "relatedNodes": [],
        "relatedTerms": ["dataframe", "arrow", "performance"]
    }
]

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    tools_path = os.path.join(base_dir, 'content', 'toolbox', 'tools.json')
    
    with open(tools_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    existing_slugs = {t['slug'] for t in data['tools']}
    
    added = 0
    for tool in NEW_TOOLS:
        if tool['slug'] not in existing_slugs:
            data['tools'].append(tool)
            added += 1
            print(f"✓ 添加: {tool['name']} ({tool['category']})")
    
    if added > 0:
        with open(tools_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')
    
    print(f"\n完成！添加了 {added} 个新工具，总数 {len(data['tools'])} 个")

if __name__ == '__main__':
    main()