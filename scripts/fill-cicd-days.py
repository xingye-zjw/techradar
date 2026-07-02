with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old_end = '''checkpoint: "能解释 CI/CD 的核心概念和价值，并描述一个典型的 CI/CD 流水线" },
    ],
  },

  // =====================================================
  // Node: devops-mlops'''

new_days = '''checkpoint: "能解释 CI/CD 的核心概念和价值，并描述一个典型的 CI/CD 流水线" },
      { day: 2, title: "GitHub Actions 入门与基础流水线",
        summary: "掌握 GitHub Actions 的核心概念，构建第一个 CI 流水线", content: {
          objective: "今天你将学习 GitHub Actions 的核心概念并构建你的第一个 CI 流水线。学完后能解释 Workflow、Job、Step、Action、Runner 等概念，写一个简单的 CI workflow，实现代码提交后自动运行测试。",
          key_points: [
            "GitHub Actions 核心概念：Workflow、Job、Step、Action、Runner、Event",
            "Workflow 文件：YAML 格式，放在 .github/workflows/ 目录下",
            "触发事件：push、pull_request、schedule、workflow_dispatch 等",
            "常用 Action：actions/checkout、setup-node、setup-python、cache 等",
            "Job 依赖：needs 关键字定义 Job 之间的依赖关系"
          ],
          practice: "GitHub Actions 入门实战：1）学习 GitHub Actions 核心概念：a）Workflow：一个完整的工作流，对应一个 YAML 文件；b）Job：工作流中的一个任务，可以并行或串行执行；c）Step：Job 中的一个步骤；d）Action：可复用的步骤单元；e）Runner：运行 Job 的机器（GitHub 托管或自托管）。2）创建你的第一个 Workflow：a）在你的项目中创建 .github/workflows/ci.yml；b）配置触发条件：push 到 main 分支和 PR 时触发；c）第一个 Job：运行测试——checkout 代码、设置 Python 环境、安装依赖、运行 pytest。3）测试你的 Workflow：a）提交代码并 push；b）在 GitHub 的 Actions 标签页查看运行结果；c）如果失败了，查看日志，修复问题。4）多 Job 流水线：a）添加一个 lint Job（用 flake8 或 eslint 做代码检查）；b）让 test Job 依赖 lint Job（lint 通过了才跑测试）；c）用 needs 关键字配置依赖。5）缓存优化：a）用 actions/cache 缓存 pip/npm 依赖；b）对比缓存前后的运行时间，看提升了多少。6）矩阵构建（可选）：a）用 strategy.matrix 在多个 Python/Node 版本上测试；b）观察多个 Job 并行执行。",
          deep_dive: "CI/CD 不只是工具，更是文化和实践。GitHub Actions 是最流行的 CI/CD 工具之一，但理解它的设计哲学很重要：1）为什么选择 GitHub Actions？a）和 GitHub 深度集成：PR、Issue、Release 等都能触发；b）免费额度够用：公开仓库无限免费，私有仓库每月有 2000 分钟免费额度；c）生态丰富：GitHub Marketplace 有上万现成的 Action 可以用；d）灵活强大：支持矩阵构建、并行作业、条件执行、自定义 Runner 等。2）YAML 的陷阱：GitHub Actions 用 YAML 配置，YAML 看起来简单但有很多坑：a）缩进错误：YAML 对缩进敏感，要用空格不要用 Tab；b）特殊字符：冒号、&、* 等特殊字符要加引号；c）多行字符串：用 | 或 > 有不同的换行处理方式；d）变量替换：${{ }} 语法，注意和 shell 变量的区别。3）CI 流水线的最佳实践：a）速度要快：CI 应该在几分钟内跑完，太长了大家就不想等了。可以用缓存、并行、增量构建来加速；b）结果要可靠：CI 应该稳定，不能时好时坏（flaky test）。不稳定的 CI 比没有 CI 还糟——大家会忽略失败；c）反馈要及时：失败了要尽快通知相关人，最好在 PR 里就能看到结果；d）从简单开始：不要一开始就搭一个超级复杂的流水线，先跑通最简单的（安装依赖+跑测试），再逐步加东西。4）CI 流水线的常见阶段：一个典型的 CI 流水线可能包含这些阶段：a）Checkout：拉取代码；b）Setup：配置环境（语言版本、依赖）；c）Lint：代码风格检查；d）Test：单元测试、集成测试、端到端测试；e）Build：构建产物（Docker 镜像、静态文件等）；f）Security：安全扫描（依赖漏洞、代码漏洞）；g）Deploy：部署到测试/生产环境。不一定都要有，根据项目情况来。5）PR 工作流：CI 和 PR 结合是最佳实践——每个 PR 都会自动跑 CI，CI 绿了才能合并。这样可以保证主分支的质量，也让 Code Review 更有信心。配合主分支保护（Branch Protection），可以强制要求 CI 通过才能合并。6）CI 文化：CI/CD 不只是技术，更是文化。它的核心是「小步快跑、持续集成、快速反馈」。团队需要养成习惯：频繁提交、小步提交、写测试、重视 CI 结果。CI 失败了应该立即修复，而不是放着不管。"
        }, duration: "3小时", resources: [B_DOCKER_TUTORIAL, { title: "GitHub Actions 官方文档", url: "https://docs.github.com/en/actions", required: false }, { title: "GitHub Actions 入门教程", url: "https://docs.github.com/en/actions/quickstart", required: false }], checkpoint: "能写出一个包含 lint 和 test 的 CI 流水线，并成功运行" },
      { day: 3, title: "持续部署与发布策略",
        summary: "掌握 CD 持续部署，理解常见的发布策略和最佳实践", content: {
          objective: "今天你将学习持续部署和发布策略。学完后能配置自动化部署流水线，理解蓝绿部署、金丝雀发布、滚动发布等发布策略，知道如何安全地发布软件。",
          key_points: [
            "持续交付 vs 持续部署：交付是「随时可以部署」，部署是「自动部署到生产」",
            "部署策略：滚动发布、蓝绿部署、金丝雀发布（灰度发布）、功能开关",
            "环境管理：开发环境、测试环境、预发布环境、生产环境",
            "发布质量保障：自动化测试、手动检查、回滚机制、监控告警",
            "GitHub Pages / Vercel / Netlify：前端项目的简单部署方式"
          ],
          practice: "持续部署实战：1）部署一个前端项目：a）用 GitHub Pages 部署一个静态网站；b）配置 GitHub Actions，每次 push 到 main 自动构建并部署；c）验证部署结果。2）Docker 镜像构建与推送：a）写一个 Workflow，构建 Docker 镜像；b）推送到 Docker Hub 或 GitHub Container Registry；c）打标签（用 git tag 或 commit hash）。3）部署到服务器（可选）：a）用 SSH Action 部署到一台云服务器；b）或者用 rsync 同步文件；c）部署后重启服务。4）学习发布策略：a）理解滚动发布、蓝绿部署、金丝雀发布的区别；b）各自的优缺点是什么？c）分别适合什么场景？5）回滚机制设计：a）如果发布后出问题了，怎么快速回滚？b）设计你的回滚方案——是回退代码？还是切流量？c）怎么知道需要回滚？（监控告警、用户反馈）6）功能开关（可选）：a）理解什么是 Feature Flag（功能开关）；b）为什么说功能开关和持续部署是绝配？c）尝试在你的项目中加一个简单的功能开关。",
          deep_dive: "持续部署看起来美好，但真正做好并不容易，有很多需要考虑的问题：1）为什么不是所有团队都做持续部署？持续部署很酷，但不是所有团队都适合：a）监管要求：金融、医疗等行业有严格的发布审批要求，不能随便自动部署；b）业务特性：如果用户对 downtime 零容忍，发布就要非常谨慎；c）团队成熟度：如果测试覆盖不够、监控不完善，盲目上持续部署只会搞出更多线上问题。持续交付（随时可以部署，但发布需要人工点一下）是更务实的选择。2）发布策略详解：a）滚动发布（Rolling Update）：逐个实例更新新版本，老版本逐步退出。优点是不需要额外资源，平滑过渡；缺点是发布过程中两个版本同时存在，可能有兼容性问题，回滚慢。K8s 的默认发布策略就是滚动发布。b）蓝绿部署（Blue/Green）：有两套完全一样的环境，一套跑当前版本（蓝），一套准备新版本（绿）。验证通过后，一次性把流量切到绿环境。优点是切换快、回滚快（切回去就行）；缺点是需要双倍资源。c）金丝雀发布（Canary Release）：先把一小部分流量（如 1%、5%）切到新版本，观察没问题再逐步放量。优点是风险小，有问题只影响少量用户；缺点是发布过程慢，需要流量控制能力，多版本共存有兼容性问题。d）功能开关（Feature Flag）：代码已经部署了，但新功能用开关控制，只有特定用户能看到。优点是发布和功能解耦，可以随时开关，方便做 A/B 测试；缺点是代码里有很多开关逻辑，增加复杂度，要记得清理旧开关。3）环境管理：成熟的团队通常有多个环境：a）开发环境（Dev）：开发人员日常用的，随便折腾；b）测试环境（QA/Test）：测试人员测功能的；c）预发布环境（Staging）：和生产环境配置一样，发布前最后验证的；d）生产环境（Production）：给用户用的，最稳定最重要。不同环境有不同的权限和发布频率。4）发布质量保障：持续部署不等于乱发布，质量保障是前提：a）自动化测试：单元测试、集成测试、端到端测试，测试覆盖度要够；b）灰度发布：先放少量流量验证；c）监控告警：发布后密切关注指标（错误率、延迟、业务指标），有问题立即告警；d）自动回滚：检测到问题自动回滚，减少影响范围；e）发布 Checklist：发布前检查清单，确保该验证的都验证了。5）安全地发布：发布是有风险的，目标是把风险降到最低：a）小步发布：每次发布变更小，风险也小；b）频繁发布：发布越频繁，每次发布的变更越少，风险越低；c）可回滚：任何发布都要能快速回滚；d）可观测：发布后能看到系统状态；e）灰度：先小范围验证再全量。记住：发布不是目的，稳定地交付价值才是目的。"
        }, duration: "3小时", resources: [B_DOCKER_TUTORIAL, { title: "GitHub Pages 部署", url: "https://pages.github.com/", required: false }], checkpoint: "能配置自动化部署流水线，并理解各种发布策略的优缺点" },
      { day: 4, title: "CI/CD 进阶与最佳实践",
        summary: "CI/CD 进阶技巧：缓存、矩阵、并行、安全、可观测", content: {
          objective: "今天你将学习 CI/CD 的进阶技巧和最佳实践。学完后能优化 CI/CD 流水线的速度和成本，理解 CI/CD 中的安全问题，知道怎么设计高质量的流水线。",
          key_points: [
            "流水线优化：缓存依赖、并行执行、矩阵构建、增量构建，提升速度降低成本",
            "安全左移：在 CI 中加入安全扫描——依赖漏洞、代码质量、密钥检测",
            "Secrets 管理：怎么安全地管理密码、Token 等敏感信息",
            "自托管 Runner：什么时候需要自己搭 Runner，怎么搭",
            "可观测性：流水线的日志、指标、告警，怎么快速定位失败"
          ],
          practice: "CI/CD 进阶优化实战：1）流水线性能优化：a）分析你的 CI 每一步花了多少时间；b）找出最慢的步骤，想办法优化；c）试试缓存依赖、并行 Job、优化构建命令等方法；d）记录优化前后的对比数据。2）安全扫描集成：a）在 CI 中加一个依赖漏洞扫描（如 pip-audit、npm audit、Dependabot）；b）加一个代码质量检查（如 SonarQube、CodeQL）；c）加一个密钥检测（如 gitleaks），防止把密钥提交到代码里。3）Secrets 管理实践：a）在 GitHub 仓库中配置 Secrets；b）在 Workflow 中使用 Secrets（${{ secrets.SECRET_NAME }}）；c）注意：不要在日志中打印敏感信息；d）了解什么是 OIDC，为什么它比长期 Token 好。4）矩阵构建实战：a）用 strategy.matrix 在多个 OS（Ubuntu、Windows、macOS）和多个语言版本上测试；b）观察并行执行的效果；c）理解 fail-fast 的含义。5）CI/CD 设计练习：a）为你做过的一个项目设计一套完整的 CI/CD 方案；b）画出流程图，包含哪些阶段、每个阶段做什么、触发条件是什么；c）考虑：怎么保证质量？怎么保证安全？怎么快速回滚？成本大概多少？6）学习资源：a）浏览 GitHub Marketplace，找找有趣的 Action；b）看看知名开源项目的 CI/CD 配置（如 React、Vue、TensorFlow），学习它们的做法。",
          deep_dive: "初级和高级 DevOps 的区别，往往在于流水线的质量和效率：1）流水线的成本问题：GitHub Actions 虽然有免费额度，但如果用得多了，账单也会很可观。优化成本的方法：a）缓存：缓存依赖、缓存构建产物，减少重复工作；b）并行：把大 Job 拆成小 Job 并行跑，虽然总时长可能更长，但 wall time 更短，用户体验更好；c）取消冗余运行：如果同一个分支连续 push，只跑最新的那个（用 concurrency 配置）；d）按需运行：不是每次 push 都跑全量测试，PR 只跑相关测试，合并后再跑全量；e）自托管 Runner：如果用量大，自己搭 Runner 可能更便宜（但要考虑维护成本）。2）CI/CD 的安全问题：CI/CD 系统有很高的权限（能部署、能访问代码、能访问云资源），是安全防护的重点：a）Secrets 泄露：不要在日志里打印敏感信息，GitHub 会自动屏蔽 secrets，但也要小心；b）第三方 Action 的风险：Marketplace 里的 Action 质量参差不齐，尽量用官方的或知名的，或者固定版本号，不要用 @latest；c）PR 中的安全风险：外部贡献者的 PR 能不能访问 secrets？默认是不能的，但要注意 pull_request_target 事件可能有安全隐患；d）依赖供应链安全：CI 里用的依赖也可能有漏洞，要定期扫描。3）「安全左移」（Shift Left）：这是 DevOps 里的一个重要思想——把安全检查往「左」移，也就是在开发周期的早期就做安全检查。传统的安全检查在上线前才做，发现问题要改已经很晚了。安全左移就是在编码阶段、CI 阶段就做安全检查，问题越早发现，修复成本越低。4）流水线的可观测性：CI/CD 流水线失败了，怎么快速定位原因？a）好的日志：每一步输出清晰的日志，错误信息要明确；b）结构化的结果：哪些步骤失败了？失败原因分类（测试失败、构建失败、超时等）；c）指标和趋势：平均运行时间、失败率、最常失败的步骤，这些数据能帮你发现瓶颈；d）告警：流水线失败了要通知到人，不能没人管。5）CI/CD 不是银弹：很多团队以为上了 CI/CD 就万事大吉了，其实不是——CI/CD 只是工具，关键还是团队的文化和工程能力。如果代码质量差、测试写得烂、没人管 CI 结果，再牛逼的 CI/CD 也没用。CI/CD 要和代码评审、单元测试、监控告警等实践结合起来，才能真正发挥价值。6）持续改进：好的 CI/CD 流水线不是一次设计好就不变的，要持续优化：a）定期回顾：流水线是不是太慢了？失败率是不是太高了？b）收集反馈：开发人员觉得 CI 好用吗？有什么痛点？c）逐步迭代：一点点优化，不要想着一步到位。"
        }, duration: "3小时", resources: [B_DOCKER_TUTORIAL, { title: "GitHub Actions 安全指南", url: "https://docs.github.com/en/actions/security-guides", required: false }], checkpoint: "能优化 CI/CD 流水线性能，并理解 CI/CD 中的安全最佳实践" },
      { day: 5, title: "CI/CD 综合实战项目",
        summary: "从零搭建一个完整项目的 CI/CD 流水线，综合应用所学知识", content: {
          objective: "今天你将完成一个 CI/CD 综合实战项目——从零为一个项目搭建完整的 CI/CD 流水线。学完后能独立设计和实现一个完整的 CI/CD 方案，包含测试、构建、部署、安全检查等环节。",
          key_points: [
            "完整 CI/CD 流水线的组成：代码检查 → 测试 → 构建 → 安全扫描 → 部署 → 通知",
            "多环境部署：测试环境、预发布环境、生产环境的不同发布策略",
            "发布管理：版本号管理、变更日志、Release Notes",
            "问题排查：流水线失败了怎么快速定位和修复",
            "文档化：把 CI/CD 流程写入文档，让团队成员都理解"
          ],
          practice: "CI/CD 综合实战项目：1）项目选择：选择一个你之前做的项目（或新建一个示例项目），可以是前端项目、后端 API、Python 库、Docker 镜像等。2）方案设计：a）为这个项目设计一套完整的 CI/CD 方案；b）画出流程图：哪些阶段？每个阶段做什么？触发条件？c）考虑：测试策略、构建方式、部署目标、回滚方案、安全检查。3）CI 流水线实现：a）配置代码风格检查（lint）；b）配置单元测试；c）配置构建（如果需要）；d）配置安全扫描（至少一种）；e）配置缓存优化速度。4）CD 流水线实现：a）配置部署流程（部署到哪里？怎么部署？）；b）配置多环境（可选，如 dev/staging/prod）；c）配置发布策略（滚动？蓝绿？金丝雀？）；d）配置回滚机制。5）增强功能（可选）：a）配置 PR 模板和 Issue 模板；b）配置自动打标签和生成 Release Notes；c）配置代码覆盖率报告；d）配置 Slack/钉钉/飞书通知，流水线结果推送到群里。6）文档与总结：a）写一份 CI/CD 文档，说明流程、怎么触发、怎么排查问题；b）总结你在这个项目中学到了什么；c）遇到了哪些坑？怎么解决的？d）还有什么可以改进的地方？",
          deep_dive: "做项目和学知识点是完全不同的体验——只有真正动手做过，才能理解其中的坑和权衡：1）从「能用」到「好用」中间差很远：搭一个能跑的流水线很简单，但搭一个团队愿意天天用的流水线很难。好用的流水线应该：a）快：5-10 分钟内出结果，太慢了大家就不想等了；b）稳：不要时好时坏，flaky CI 比没有 CI 还糟糕；c）准：失败了能明确告诉你哪里错了，怎么修；d）简单：配置不要太复杂，新人也能看懂；e）灵活：能适应不同的需求，不要太僵化。2）常见的坑和反模式：a）巨型 Job：什么都塞在一个 Job 里，失败了不知道是哪部分的问题，也不能并行。应该拆成多个小 Job；b）把所有东西都放 CI 里：CI 应该快，太重的任务（如性能测试、全量 E2E 测试）可以定时跑或者手动触发，不要每次提交都跑；c）忽略 CI 失败：CI 红了没人管，大家都习惯了，那 CI 就失去意义了。CI 失败必须立即修复；d）过度工程化：一开始就搞超级复杂的流水线，结果维护成本很高。应该从简单开始，逐步迭代；e）硬编码配置：把服务器地址、账号密码等直接写在 YAML 里，不安全也不灵活。应该用 Secrets 和变量。3）怎么衡量 CI/CD 的效果？可以关注这些指标：a）部署频率：多久部署一次？越高频说明越成熟；b）变更前置时间（Lead Time）：从代码提交到上线需要多久？越短越好；c）变更失败率：发布后出问题的比例有多高？越低越好；d）平均恢复时间（MTTR）：出问题了多久能恢复？越快越好。这四个是 DevOps 研究（DORA）里的核心指标，被称为「四个关键指标」。4）团队采用的挑战：引入 CI/CD 不只是技术问题，更是人的问题：a）老员工可能习惯了旧方式，不愿意改；b）大家可能觉得写测试、配 CI 是「浪费时间」；c）CI 经常失败会让人有挫败感。怎么推动？a）以身作则，自己先做好；b）从痛点切入：解决大家最痛的点（比如部署麻烦、容易出 bug）；c）小步快跑：先从一个项目、一个功能开始，做出效果了再推广；d）培训和分享：让大家理解为什么要这么做，而不只是怎么做。5）CI/CD 的未来：CI/CD 也在不断演进：a）GitOps：用 Git 来管理基础设施和应用配置，Git 是唯一真相来源；b）Platform Engineering：构建内部开发者平台，让自助式部署更容易；c）AI 辅助：用 AI 来自动生成 CI 配置、自动排查失败原因、自动优化流水线；d）安全集成：DevSecOps，安全深度集成到 CI/CD 流程中。技术在变，但核心思想不变——更快、更稳、更安全地交付价值。"
        }, duration: "4小时", resources: [B_DOCKER_TUTORIAL, { title: "DORA 四个关键指标", url: "https://cloud.google.com/blog/products/devops-sre/the-2019-accelerate-state-of-devops-elite-performance", required: false }], checkpoint: "完成一个完整项目的 CI/CD 流水线搭建，包含 CI 和 CD 全流程" },
    ],
  },

  // =====================================================
  // Node: devops-mlops'''

if old_end in content:
    content = content.replace(old_end, new_days)
    with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Successfully added days 2-5 to devops-cicd')
else:
    print('Old end not found')
