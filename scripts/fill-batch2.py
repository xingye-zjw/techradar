import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def get_node_dailyTasks(node_id):
    idx = content.find(f'id: "{node_id}"')
    if idx == -1:
        return None, None
    dt_start = content.find('dailyTasks: [', idx)
    if dt_start == -1:
        return None, None
    depth = 0
    i = dt_start
    while i < len(content):
        if content[i] == '[':
            depth += 1
        elif content[i] == ']':
            depth -= 1
            if depth == 0:
                return dt_start, i
        i += 1
    return None, None

def count_days(dt_start, dt_end):
    section = content[dt_start:dt_end]
    return section.count('day: ')

def find_last_day_end(section):
    last_cp = section.rfind('checkpoint:')
    if last_cp == -1:
        return None
    close_brace = section.find('}', last_cp)
    if close_brace == -1:
        return None
    return close_brace

def add_days(node_id, new_days_text):
    start, end = get_node_dailyTasks(node_id)
    if not start or not end:
        print(f'  {node_id}: NOT FOUND')
        return False
    
    days = count_days(start, end)
    section = content[start:end]
    last_end = find_last_day_end(section)
    
    if last_end is None:
        print(f'  {node_id}: could not find last day end')
        return False
    
    insert_pos = start + last_end + 1
    content_new = content[:insert_pos] + ',' + new_days_text + content[insert_pos:]
    globals()['content'] = content_new
    print(f'  {node_id}: {days} days -> added ✅')
    return True

# ============================================================
# 5. nlp-machine-translation (5 -> 10 days)
# ============================================================
print('Filling nlp-machine-translation...')
add_days('nlp-machine-translation', '''
      { day: 6, title: "Subword 分词与 BPE",
        summary: "学习子词分词算法 BPE/WordPiece/Unigram", content: {
          objective: "学习子词分词技术。理解 BPE、WordPiece、Unigram 等算法的原理，掌握 SentencePiece 和 HuggingFace Tokenizer 的使用。",
          key_points: [
            "为什么需要子词：解决未登录词（OOV）问题，平衡词表大小和序列长度",
            "BPE：Byte-Pair Encoding，通过合并高频字符对构建词表",
            "WordPiece：BERT 用的算法，按似然提升选择合并",
            "SentencePiece：Google 的子词分词工具，支持多种算法"
          ],
          practice: "1）BPE 原理理解：手动模拟 BPE 的几次合并过程。2）Tokenizer 使用：用 HuggingFace Tokenizers 库加载预训练 tokenizer。3）自定义训练：用自己的语料训练一个 BPE tokenizer。4）对比：不同分词算法对同一句话的分词结果对比。",
          deep_dive: "子词分词是 NLP 预训练的基石——它解决了传统词表的 OOV 问题，也让词表大小可控。BERT 用 WordPiece，GPT 用 BPE，T5 用 Unigram，各有优劣。SentencePiece 把分词和解码都封装好了，还支持多种算法，是实际项目中常用的工具。理解分词原理，对理解大模型的行为（为什么会拼错、为什么不理解某些词）很有帮助。"
        }, duration: "2小时", resources: [B_NLP_TUTORIAL, { title: "SentencePiece", url: "https://github.com/google/sentencepiece", required: false }], checkpoint: "理解子词分词原理，能用 SentencePiece 和 HuggingFace Tokenizer" },
      { day: 7, title: "预训练模型做翻译与微调",
        summary: "使用 mBART、M2M-100 等预训练翻译模型做微调", content: {
          objective: "使用预训练翻译模型并做微调。能用 HuggingFace 加载 mBART、M2M-100 等多语言翻译模型，在自己的数据集上做微调。",
          key_points: [
            "预训练翻译模型：mBART、M2M-100、NLLB 等多语言模型",
            "微调方法：全参数微调、LoRA、前缀微调（Prefix Tuning）",
            "领域适配：在特定领域数据上微调，提升领域效果",
            "评测：BLEU、CHRF、COMET 等翻译质量评估指标"
          ],
          practice: "1）预训练模型推理：用 HuggingFace 加载 M2M-100 或 mBART，做中英互译。2）数据准备：准备一个小的平行语料（或用公开数据集）。3）微调：用 LoRA 微调翻译模型（数据量小的话）。4）评估：算 BLEU 分数，对比微调前后。",
          deep_dive: "大模型时代，机器翻译的做法完全变了——以前要自己从零训练 Seq2Seq 模型，现在直接用预训练翻译模型微调就很好。Facebook 的 M2M-100 支持 100 种语言互译，Meta 的 NLLB 支持 200+ 种。微调策略也很重要——数据多用全参数微调，数据少用 LoRA/Adapter。评估除了 BLEU（基于 n-gram 匹配），还有 COMET 等基于预训练模型的指标，更接近人工评价。"
        }, duration: "3小时", resources: [B_NLP_TUTORIAL, R_HF_COURSE, { title: "M2M-100", url: "https://huggingface.co/facebook/m2m100_418M", required: false }], checkpoint: "能用预训练翻译模型做推理和微调，会用 BLEU 评估" },
      { day: 8, title: "翻译系统架构与服务化",
        summary: "构建生产级翻译服务，了解翻译系统架构", content: {
          objective: "了解生产级翻译系统的架构。能构建一个简单的翻译 API 服务，理解生产环境的考量（性能、成本、质量、缓存）。",
          key_points: [
            "翻译服务架构：API 层 + 模型层 + 缓存层 + 监控层",
            "性能优化：批处理、量化、模型蒸馏、vLLM 推理",
            "成本优化：缓存、路由（简单句子用小模型）、按需扩缩容",
            "质量保证：人工抽检、A/B 测试、反馈闭环"
          ],
          practice: "1）翻译 API：用 FastAPI 封装一个翻译模型，做 REST 服务。2）缓存层：加一个简单的翻译缓存（相同句子直接返回）。3）批量翻译：支持批量句子翻译，提升吞吐量。4）监控：记录每次翻译的时间、长度、模型，做简单分析。",
          deep_dive: "做一个翻译 Demo 很容易，但做生产级翻译系统很难——要考虑性能（延迟和吞吐量）、成本（GPU 很贵）、质量（不同领域效果差异大）、稳定性（不能挂）。工业级翻译系统通常有缓存层（缓存常见翻译）、模型路由（简单句子用小模型、复杂的用大模型）、后处理（标点、格式、术语一致性）等多个优化环节。"
        }, duration: "2.5小时", resources: [B_NLP_TUTORIAL, R_FASTAPI], checkpoint: "能构建翻译 API 服务，理解生产级系统架构" },
      { day: 9, title: "低资源翻译与前沿方向",
        summary: "了解低资源语言翻译和 NLP 前沿方向", content: {
          objective: "了解低资源翻译和 NLP 前沿方向。知道小语种/低资源场景下的翻译方法，了解多语言大模型、翻译新范式等前沿进展。",
          key_points: [
            "低资源翻译：数据很少的语言怎么做翻译？",
            "迁移学习：用高资源语言知识迁移到低资源语言",
            "多语言大模型：mT5、LLaMA、Qwen 等多语言模型的翻译能力",
            "前沿方向：Speech-to-Speech、同声传译、多模态翻译"
          ],
          practice: "1）低资源调研：查一下有哪些低资源语言的数据集和方法。2）多语言模型实验：用一个多语言大模型（如 Qwen、Llama）做翻译，和专门的翻译模型比。3）前沿论文阅读（可选）：选一篇翻译前沿论文，读摘要和介绍。4）思考：大模型时代，翻译技术会怎么发展？",
          deep_dive: "机器翻译是 NLP 最经典的任务，也是技术迭代最快的领域之一——从统计机器翻译（SMT）到神经机器翻译（NMT），再到现在的大模型翻译，每一代都有数量级的提升。低资源翻译是重要方向——世界上有 7000 多种语言，大部分没有足够的平行语料。多语言大模型（如 NLLB、mBART）通过在多种语言上联合训练，显著改善了低资源语言的翻译质量。未来，语音到语音的实时翻译、多模态翻译（带图像的翻译）都是值得关注的方向。"
        }, duration: "2小时", resources: [B_NLP_TUTORIAL], checkpoint: "了解低资源翻译方法和 NLP 前沿方向" },
      { day: 10, title: "翻译项目实战与总结",
        summary: "完成翻译项目，总结 NLP 学习路径", content: {
          objective: "完成翻译实战项目并总结。做一个完整的翻译应用，总结两周学到的机器翻译知识，规划后续 NLP 学习路径。",
          key_points: [
            "项目实战：做一个完整的翻译应用",
            "技术整合：前端 + 后端 + 模型 + 缓存",
            "效果评估：客观指标 + 主观评估",
            "学习总结：NLP 工程师的成长路径"
          ],
          practice: "1）项目设计：设计一个翻译应用（网页翻译、文档翻译、双语对照阅读等）。2）实现：前后端 + 模型部署。3）优化：加缓存、加术语表、做领域适配。4）总结：写项目文档，总结学到的东西，规划后续学习。",
          deep_dive: "机器翻译是 NLP 技术的集大成者——它用到了分词、序列模型、Attention、预训练、微调、推理优化等几乎所有 NLP 核心技术。通过做翻译项目，能把这些知识串起来。大模型时代，翻译的门槛降低了（不用从零训模型了），但上限也提高了（可以做更复杂的系统）。NLP 工程师的核心竞争力不是会调用 API，而是理解原理、知道什么时候用什么方法、能解决实际问题。"
        }, duration: "4小时", resources: [B_NLP_TUTORIAL, R_HF_COURSE], checkpoint: "完成翻译项目，总结 NLP 学习路径" }''')

# ============================================================
# 6. devops-kubernetes (7 -> 10 days)
# ============================================================
print('Filling devops-kubernetes...')
add_days('devops-kubernetes', '''
      { day: 8, title: "Helm 包管理与应用部署",
        summary: "使用 Helm 管理 Kubernetes 应用", content: {
          objective: "学习 Helm 包管理。理解 Chart 结构，能用 Helm 安装、升级、回滚应用，会写简单的 Helm Chart。",
          key_points: [
            "Helm：Kubernetes 的包管理器，类似 apt/yum",
            "Chart：Helm 包格式，包含模板 + 值 + 元数据",
            "常用操作：helm install/upgrade/rollback/uninstall",
            "模板语法：Go template，支持变量、条件、循环"
          ],
          practice: "1）Helm 安装：安装 Helm 客户端，配置 repo。2）常用应用安装：用 Helm 安装 Nginx Ingress、Prometheus 等常用组件。3）自定义 Chart：创建一个简单的 Helm Chart（比如你自己的应用）。4）升级回滚：改配置升级，出问题回滚。",
          deep_dive: "Kubernetes 的 YAML 文件多了之后很难管理——每个环境一套配置，复制粘贴很容易出错。Helm 解决了这个问题——把模板和值分开，不同环境用不同的值文件，模板复用。Helm Hub 上有大量现成的 Chart（MySQL、Redis、Prometheus 等），不用自己从零写。掌握 Helm 是 K8s 运维的必备技能。"
        }, duration: "2.5小时", resources: [B_DOCKER_TUTORIAL, { title: "Helm 文档", url: "https://helm.sh/docs/", required: false }], checkpoint: "能用 Helm 安装和管理应用，会写简单的 Chart" },
      { day: 9, title: "Kubernetes 监控与运维",
        summary: "Prometheus + Grafana 监控 K8s 集群", content: {
          objective: "学习 Kubernetes 监控和运维。能用 Prometheus + Grafana 监控集群，了解日志收集（ELK/Loki），掌握常见故障排查方法。",
          key_points: [
            "监控架构：Prometheus（指标采集 + 存储）+ Grafana（可视化）+ Alertmanager（告警）",
            "核心指标：CPU、内存、磁盘、网络、Pod 状态、节点状态",
            "日志系统：ELK Stack（Elasticsearch + Logstash + Kibana）或 Loki",
            "故障排查：Pod 起不来、CrashLoopBackOff、调度失败等常见问题"
          ],
          practice: "1）监控栈部署：用 Helm 安装 kube-prometheus-stack（Prometheus + Grafana + Alertmanager）。2）仪表盘：导入 Node Exporter 和 K8s 仪表盘，看集群状态。3）告警配置：配置几个常用告警（节点宕机、Pod 重启频繁、磁盘空间不足）。4）日志（可选）：部署 Loki + Promtail 做日志收集。5）故障排查练习：故意制造几个问题（镜像不存在、端口冲突、资源不足），练习排查。",
          deep_dive: "生产环境的 K8s 集群，监控和运维是头等大事——没有监控，出了问题都不知道。Prometheus + Grafana 是 K8s 监控的事实标准。监控的三个支柱：指标（Metrics，Prometheus）、日志（Logs，ELK/Loki）、链路追踪（Tracing，Jaeger/Zipkin）。三者结合才能全面掌握系统状态。故障排查能力是运维工程师的核心——要懂原理，知道从哪入手、看什么日志、用什么命令。"
        }, duration: "3小时", resources: [B_DOCKER_TUTORIAL, { title: "Prometheus 文档", url: "https://prometheus.io/docs/", required: false }], checkpoint: "能部署监控栈，配置告警，排查常见 K8s 故障" },
      { day: 10, title: "K8s 生产实践与总结",
        summary: "生产级 K8s 最佳实践与课程总结", content: {
          objective: "了解生产级 K8s 最佳实践并总结。知道生产环境要考虑的安全、高可用、成本等问题，完成课程总结。",
          key_points: [
            "高可用：多 Master 节点、多副本、跨可用区",
            "安全：RBAC 权限控制、网络策略、Secret 管理、镜像扫描",
            "成本优化：资源请求/限制、自动扩缩容、Spot 实例、节点池",
            "生产级集群：集群生命周期管理、升级、备份、灾备"
          ],
          practice: "1）安全配置：配置 RBAC 角色、限制默认权限、用 Secret 存敏感信息。2）资源管理：给 Pod 设 requests 和 limits，用 LimitRange 限制命名空间资源。3）自动扩缩容：配置 HPA（Pod 水平自动扩缩），测试负载变化时的扩缩。4）总结：整理 K8s 知识体系，画思维导图，写学习笔记。5）规划：后续 K8s 学习路径（CKA 认证、GitOps、Service Mesh 等）。",
          deep_dive: "K8s 入门容易精通难——学会部署应用只是开始，生产环境有大量考量：a）高可用：集群不能有单点故障；b）安全：权限最小化、网络隔离、漏洞扫描；c）成本：K8s 容易资源浪费，要精细化管理；d）可观测性：监控、日志、追踪都要有；e）灾备：数据备份、集群迁移、故障恢复。CKA（Certified Kubernetes Administrator）是行业认可的认证，考一个对求职很有帮助。K8s 生态很大，学完基础后可以往 GitOps、Service Mesh、云原生架构等方向深入。"
        }, duration: "3小时", resources: [B_DOCKER_TUTORIAL], checkpoint: "了解生产级 K8s 最佳实践，完成学习总结" }''')

# ============================================================
# 7. devops-cicd (5 -> 10 days)
# ============================================================
print('Filling devops-cicd...')
add_days('devops-cicd', '''
      { day: 6, title: "GitHub Actions 进阶与工作流优化",
        summary: "深入学习 GitHub Actions 高级功能", content: {
          objective: "深入学习 GitHub Actions 高级功能。掌握矩阵构建、缓存优化、自定义 Action、环境管理等进阶用法。",
          key_points: [
            "矩阵构建：一个 job 跑多个版本（不同 OS/语言版本）",
            "缓存优化：缓存依赖，加速构建（actions/cache）",
            "自定义 Action：写自己的 Action，复用逻辑",
            "环境与密钥：Environment、Secrets、Variable 管理"
          ],
          practice: "1）矩阵构建：写一个工作流，在不同 Node/Python 版本下跑测试。2）缓存优化：给 npm/pip 加缓存，看构建时间减少多少。3）自定义 Action（可选）：写一个简单的 JavaScript 或 Docker Action。4）环境管理：配置 dev/staging/prod 环境，不同环境用不同的 secrets。",
          deep_dive: "CI/CD 不只是跑测试和部署——优化工作流能大幅提升开发效率。矩阵构建让你一次配置，多环境验证。缓存是性价比最高的优化——依赖安装经常占 CI 时间的一半以上，缓存后能省几分钟。自定义 Action 让你把重复逻辑封装起来，团队内共享。好的 CI/CD 应该是：快（反馈及时）、稳（很少挂）、安全（密钥不泄露）。"
        }, duration: "2.5小时", resources: [{ title: "GitHub Actions 文档", url: "https://docs.github.com/en/actions", required: false }], checkpoint: "掌握 GitHub Actions 进阶用法，能优化工作流" },
      { day: 7, title: "CI/CD 最佳实践与安全",
        summary: "CI/CD 最佳实践、流水线安全与质量门禁", content: {
          objective: "学习 CI/CD 最佳实践和安全。了解流水线设计原则、质量门禁、安全扫描等实践，能设计可靠的 CI/CD 流程。",
          key_points: [
            "流水线设计：快速反馈、失败优先、并行化、最小化步骤",
            "质量门禁：代码检查、测试覆盖率、安全扫描、性能基准",
            "CI/CD 安全：密钥管理、权限控制、依赖漏洞扫描",
            "蓝绿部署/金丝雀发布：降低发布风险的部署策略"
          ],
          practice: "1）流水线优化：给你的项目流水线优化——并行步骤、缓存、失败快速退出。2）质量门禁：在流水线中加入代码风格检查（ESLint/Black）、测试覆盖率阈值。3）安全扫描：加一个依赖漏洞扫描步骤（如 npm audit、trivy）。4）部署策略：了解蓝绿部署和金丝雀发布的概念，画流程图。",
          deep_dive: "CI/CD 的价值不只是「自动部署」，更是「质量保证」和「快速反馈」。最佳实践：a）快速反馈：提交后几分钟内出结果，开发者还没切换上下文；b）质量门禁：不让坏代码进生产；c）失败优先：最快失败的步骤放前面；d）并行化：独立步骤并行跑，节省时间；e）安全左移：在流水线早期就做安全检查。发布策略也很重要——蓝绿部署（两套环境，切换流量）、金丝雀发布（逐步放量）、滚动发布，都是为了降低发布风险，出问题能快速回滚。"
        }, duration: "2.5小时", resources: [], checkpoint: "理解 CI/CD 最佳实践和安全考虑，能设计高质量流水线" },
      { day: 8, title: "Docker 镜像优化与多阶段构建",
        summary: "掌握 Docker 镜像优化技巧", content: {
          objective: "学习 Docker 镜像优化。掌握多阶段构建、减小镜像体积、构建缓存、安全扫描等技巧。",
          key_points: [
            "多阶段构建：用多个 FROM，构建阶段和运行阶段分离",
            "镜像瘦身：用 Alpine/distroless 基础镜像，清理缓存和无用文件",
            "构建缓存：合理安排 Dockerfile 指令顺序，最大化缓存利用",
            "镜像安全：漏洞扫描（Trivy）、最小权限原则、不用 root 用户"
          ],
          practice: "1）多阶段构建：把一个 Node.js/Python 应用从单阶段改成多阶段，对比镜像大小。2）镜像优化：用 Alpine 基础镜像、清理包缓存、减少层数，看看能把镜像缩到多小。3）安全扫描：用 Trivy 扫描镜像，看看有多少漏洞。4）最佳实践：写一份 Dockerfile 最佳实践清单。",
          deep_dive: "Docker 镜像质量直接影响部署速度、安全性和成本——镜像小拉得快、占存储少、攻击面也小。多阶段构建是最重要的优化技巧——构建时用带编译器的大镜像，运行时用只有运行时的小镜像。优化原则：a）层数越少越好；b）变化慢的层放前面（利用缓存）；c）不要把密钥构建进镜像；d）用非 root 用户运行；e）定期扫描漏洞。镜像从 1GB 优化到 100MB 是很常见的，收益巨大。"
        }, duration: "2.5小时", resources: [B_DOCKER_TUTORIAL, { title: "Trivy", url: "https://github.com/aquasecurity/trivy", required: false }], checkpoint: "能写优化的 Dockerfile，掌握多阶段构建和镜像瘦身" },
      { day: 9, title: "GitOps 与 ArgoCD",
        summary: "了解 GitOps 理念和 ArgoCD 工具", content: {
          objective: "了解 GitOps 理念和 ArgoCD。理解 GitOps 的核心思想，能用 ArgoCD 做应用的声明式部署，知道它和传统 CI/CD 的区别。",
          key_points: [
            "GitOps：Git 是唯一真相来源，所有基础设施和应用配置都在 Git 里",
            "ArgoCD：K8s 的 GitOps 工具，持续同步 Git 和集群状态",
            "声明式部署：描述期望状态，工具自动让实际状态匹配",
            "优势：可审计、可回滚、一致性高、上手简单"
          ],
          practice: "1）概念学习：理解 GitOps 和传统 CI/CD 的区别（推 vs 拉）。2）ArgoCD 部署：在 K3s/Minikube 上安装 ArgoCD。3）应用部署：把一个应用的 K8s 配置放到 Git 仓库，用 ArgoCD 部署。4）同步体验：改 Git 里的配置，看 ArgoCD 自动同步。",
          deep_dive: "GitOps 是云原生时代的运维理念——核心是「Git 作为唯一真相来源」。传统 CI/CD 是「推」模式：CI 跑完了 kubectl apply 推到集群。GitOps 是「拉」模式：集群里的 Agent（如 ArgoCD）不断拉 Git 上的配置，发现不一致就自动同步。GitOps 的好处：a）所有变更都有 Git 历史，可审计可回滚；b）不需要把集群凭证给 CI 系统，更安全；c）声明式，最终状态一致；d）开发者不用学 K8s 命令，改 Git 就行。ArgoCD 是 GitOps 的事实标准工具。"
        }, duration: "2.5小时", resources: [B_DOCKER_TUTORIAL, { title: "ArgoCD", url: "https://argo-cd.readthedocs.io/", required: false }], checkpoint: "理解 GitOps 理念，能用 ArgoCD 做简单的应用部署" },
      { day: 10, title: "CI/CD 综合项目与总结",
        summary: "完成一个完整的 CI/CD 项目并总结", content: {
          objective: "完成 CI/CD 综合项目并总结。把两周学到的东西整合到一个完整项目中，包含代码检查、测试、构建镜像、部署、监控全流程。",
          key_points: [
            "端到端流水线：从代码提交到生产部署的完整链路",
            "多环境部署：dev → staging → prod 逐级推进",
            "质量保障：测试、扫描、门禁、人工审批",
            "DevOps 总结：理念、工具、最佳实践、职业发展"
          ],
          practice: "1）项目设计：选一个应用，设计完整的 CI/CD 流水线。2）实现：代码检查 → 单元测试 → 构建镜像 → 安全扫描 → 部署到 staging → 手动审批 → 部署到 prod。3）验证：故意制造错误（测试失败、漏洞），看流水线会不会拦住。4）文档：写一份 CI/CD 设计文档和运维手册。5）总结：DevOps 学习收获，后续进阶方向（SRE、云原生、平台工程）。",
          deep_dive: "CI/CD 是 DevOps 的核心实践——它把人从重复的部署工作中解放出来，同时提升了质量和速度。但 CI/CD 不只是工具，更是文化和流程的改变。DevOps 的精髓是「持续」：持续集成、持续交付、持续部署、持续反馈、持续改进。工具在变（从 Jenkins 到 GitHub Actions 到 ArgoCD），但核心理念没变——更快、更稳、更高质量地交付价值。DevOps 工程师的职业路径很广：SRE、云原生工程师、平台工程师、DevSecOps 等等。"
        }, duration: "4小时", resources: [B_DOCKER_TUTORIAL], checkpoint: "完成端到端 CI/CD 项目，总结 DevOps 学习路径" }''')

# Save
with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nPart 3 done (nlp-machine-translation + devops-k8s + devops-cicd)')