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
# 1. embedded-c (14 -> 15 days) - 补最后1天
# ============================================================
print('Filling embedded-c...')
add_days('embedded-c', '''
      { day: 15, title: "嵌入式C进阶与最佳实践",
        summary: "学习MISRA C规范、代码静态分析、单元测试等进阶内容", content: {
          objective: "今天你将学习嵌入式C的进阶知识和最佳实践，包括MISRA C规范、代码静态分析、单元测试、断言与防御式编程。学完后你能写出更高质量、更可靠、更安全的嵌入式代码，了解工业级嵌入式开发的标准流程。",
          key_points: [
            "MISRA C：工业界最常用的C语言安全编码规范，减少潜在bug和安全隐患",
            "静态分析：用cppcheck、clang-tidy等工具自动检查代码问题，不运行就能发现bug",
            "单元测试：用Unity、CMock等框架做单元测试，保证代码质量，支持回归测试",
            "防御式编程：断言、参数检查、错误处理、容错设计，代码在异常情况下也能优雅处理",
            "代码审查：Code Review的重要性和最佳实践，多人协作保证代码质量"
          ],
          practice: "完成以下进阶实践：1）MISRA C学习：了解MISRA C的核心规则（如禁止使用goto、禁止隐式类型转换、函数只有一个出口等），思考这些规则为什么能减少bug；2）静态分析实践：用cppcheck或clang-tidy扫描你之前写的LED驱动代码，看看能发现什么问题，修复找到的问题；3）单元测试入门：用Unity测试框架为你的LED驱动写单元测试，测试初始化、开、关、翻转等功能，确保每个函数都按预期工作；4）防御式编程练习：给你的函数加上参数检查（用assert或if判断），处理非法输入（如NULL指针、无效参数），设计错误返回码；5）代码自查：用今天学到的知识，review你之前写的代码，找出可以改进的地方并优化；6）思考：为什么工业级嵌入式开发需要这么多规范和流程？这些规范和敏捷开发有冲突吗？怎么平衡？",
          deep_dive: "深入理解嵌入式软件质量与功能安全：在消费电子中，bug可能只是体验不好；但在汽车、医疗、航空航天等领域，软件bug可能导致人身伤害甚至死亡。所以这些领域有严格的功能安全标准，如ISO 26262（汽车）、IEC 61508（工业）、DO-178C（航空）。这些标准对软件开发流程有严格要求，包括：需求管理、设计评审、代码规范、静态分析、单元测试、集成测试、验证确认、配置管理等。MISRA C就是这些标准中常用的编码规范，它定义了C语言的一个安全子集，限制使用C语言中容易出错的特性。除了MISRA C，还有一些提高代码质量的重要实践：1）代码静态分析（Static Analysis）：不运行代码，通过分析代码结构和逻辑来发现问题。常见工具：cppcheck（开源）、clang-tidy（LLVM）、PC-Lint（商业）、Coverity（商业）。静态分析能发现内存泄漏、空指针解引用、数组越界、未初始化变量、类型转换问题等。2）单元测试（Unit Testing）：对每个函数/模块进行测试，确保功能正确。嵌入式中常用的测试框架：Unity（轻量）、CMock（模拟）、CppUTest（支持C/C++）。单元测试的好处：保证质量、便于重构、文档作用、快速定位问题。3）持续集成（CI）：每次代码提交都自动运行编译、静态分析、单元测试，尽早发现问题。4）防御式编程：编程时假设输入可能是错的、调用可能失败、硬件可能出问题，代码要能优雅地处理各种异常情况。核心思想：「快速失败」（Fail Fast）——问题越早发现越好。在AI时代，嵌入式软件的质量同样重要——AI模型部署到嵌入式设备上，驱动代码、推理框架、应用代码都需要保证可靠性和安全性。理解这些最佳实践，能让你写出更专业的嵌入式代码，也能更好地和嵌入式团队协作。"
        }, duration: "2.5小时", resources: [{ title: "MISRA C规范", url: "https://www.misra.org.uk/", required: false, type: "doc", source: "official" }, { title: "Unity测试框架", url: "https://github.com/ThrowTheSwitch/Unity", required: false, type: "repo", source: "github" }, { title: "cppcheck", url: "https://cppcheck.sourceforge.io/", required: false, type: "tool", source: "official" }], checkpoint: "能用静态分析工具检查代码，并为关键函数写单元测试" }''')

# ============================================================
# 2. embedded-rtos (10 -> 15 days) - 补第11-15天
# ============================================================
print('Filling embedded-rtos...')
add_days('embedded-rtos', '''
      { day: 11, title: "事件组与任务通知",
        summary: "学习事件组和任务通知，实现更高效的任务同步", content: {
          objective: "今天你将学习FreeRTOS的事件组（Event Groups）和任务通知（Task Notifications），这是两种更灵活、更高效的同步机制。学完后你能用事件组实现多事件等待，用任务通知替代信号量/队列以提高性能和节省内存。",
          key_points: [
            "事件组：用一个整数的每一位代表一个事件，任务可以等待多个事件（与/或逻辑），适合复杂同步场景",
            "事件组API：xEventGroupCreate、xEventGroupSetBits、xEventGroupWaitBits、xEventGroupClearBits",
            "任务通知：每个任务自带的通知值，替代二值信号量/计数信号量/事件组，更快更省内存",
            "任务通知API：xTaskNotifyGive、ulTaskNotifyTake、xTaskNotify、xTaskNotifyWait",
            "同步机制选型：信号量、队列、事件组、任务通知各适合什么场景，怎么选"
          ],
          practice: "完成以下事件组与任务通知实践：1）事件组练习：创建一个事件组，定义3个事件位（如事件A、B、C），创建3个任务分别设置不同的事件位，创建1个任务等待所有事件都发生（AND逻辑）或任一事件发生（OR逻辑），理解事件组的两种等待方式；2）任务通知练习：用任务通知实现二值信号量的功能——一个任务Give，一个任务Take，对比和普通信号量的区别；3）性能对比（可选）：分别用信号量和任务通知做同步，测量10000次同步的耗时，看看任务通知快多少；4）综合练习：设计一个场景——一个任务需要等多个条件满足后才能继续执行（如「传感器数据就绪 + 网络连接成功 + 用户命令到达」），用事件组实现这个逻辑；5）思考：事件组和信号量有什么区别？任务通知能完全替代信号量吗？任务通知有什么局限性？",
          deep_dive: "深入理解RTOS同步机制的设计哲学：RTOS提供了多种同步机制——信号量、互斥量、队列、事件组、任务通知——它们各有特点，适用于不同场景。理解它们的底层实现和设计取舍，能帮你写出更高效的代码。1）为什么需要这么多同步机制？因为不同的场景有不同的需求：a）简单的互斥访问 → 互斥量；b）简单的同步/计数 → 信号量；c）数据传递 → 队列；d）多事件组合 → 事件组；e）追求极致性能和节省内存 → 任务通知。没有最好的，只有最合适的。2）事件组的实现原理：事件组本质上就是一个受保护的整数，每一位代表一个事件。任务等待事件时，如果条件不满足就阻塞在那里；当有任务设置事件位时，内核检查所有等待的任务，看它们的条件是否满足了，如果满足了就唤醒。FreeRTOS的事件组还支持「等待时清除」（xEventGroupWaitBits 的 xClearOnExit 参数），很方便。3）任务通知为什么更快？信号量、队列等都是内核对象，需要创建、需要内存、操作时要走通用的内核API路径。而任务通知是每个任务TCB里自带的一个变量，操作它不需要操作内核对象，路径更短，所以更快（据说快45%），也更省内存（不需要额外创建内核对象）。但任务通知也有局限：a）只能一对一（一个任务只能通知另一个任务）；b）只有一个通知值（信号量/队列可以有多个）；c）没有广播功能。4）同步机制的选型指南：a）需要传递数据 → 队列；b）只是同步/计数 → 信号量；c）保护共享资源 → 互斥量；d）等待多个事件组合 → 事件组；e）一对一同步，追求性能 → 任务通知。5）从「对象」到「能力」的演进：早期的RTOS只有信号量和队列，功能简单但不够灵活。后来逐渐加入了互斥量（优先级继承）、事件组、任务通知等。趋势是：a）更灵活（能适应更多场景）；b）更高效（减少内存占用和CPU开销）；c）更易用（API更友好）。6）边缘AI场景的同步：在边缘AI设备中，同步机制同样重要——比如「摄像头采集一帧图像 → NPU推理完成 → 显示结果」，这三个环节就需要同步。理解RTOS的同步机制，能帮你更好地设计AI应用的流水线。"
        }, duration: "2小时", resources: [{ title: "FreeRTOS事件组", url: "https://www.freertos.org/FreeRTOS-Event-Groups.html", required: true, type: "doc", source: "official" }, { title: "FreeRTOS任务通知", url: "https://www.freertos.org/RTOS-task-notifications.html", required: true, type: "doc", source: "official" }], checkpoint: "能用事件组实现多事件等待，能用任务通知实现任务同步" },
      { day: 12, title: "软件定时器与空闲钩子",
        summary: "学习软件定时器和空闲钩子，理解低功耗设计", content: {
          objective: "今天你将学习FreeRTOS的软件定时器（Software Timers）和空闲钩子（Idle Hook），以及基于它们的低功耗设计。学完后你能用软件定时器实现定时任务，用空闲钩子做后台处理，理解Tickless Idle等低功耗机制。",
          key_points: [
            "软件定时器：用软件实现的定时器，不占用硬件定时器资源，可以创建很多个，回调函数在定时器任务中执行",
            "定时器类型：单次触发（One-shot）和自动重载（Auto-reload），分别对应不同的应用场景",
            "定时器API：xTimerCreate、xTimerStart、xTimerStop、xTimerReset、xTimerChangePeriod",
            "空闲钩子与空闲任务：空闲任务优先级最低，没事干的时候就跑空闲任务，可以在空闲钩子中做低优先级的后台处理",
            "低功耗设计：Tickless Idle模式，空闲时进入低功耗状态，唤醒时恢复，大幅降低功耗"
          ],
          practice: "完成以下软件定时器与低功耗实践：1）软件定时器练习：创建两个定时器——一个单次定时器（5秒后执行一次），一个周期定时器（每秒执行一次），观察两个定时器的行为，理解单次和周期的区别；2）定时器命令队列：理解软件定时器的回调函数是在定时器服务任务（Daemon Task）中执行的，不是在中断里执行的，所以回调函数里可以调用FreeRTOS API，但要注意不能阻塞太久；3）空闲钩子练习：实现一个空闲钩子函数，在里面做一些低优先级的事情（如统计CPU使用率、刷新看门狗、做一些后台计算），观察空闲钩子的执行频率；4）低功耗了解：了解FreeRTOS的Tickless Idle模式——当系统空闲时，停止SysTick，进入低功耗，有事件时再唤醒，理解这种机制为什么能省电；5）综合练习：设计一个低功耗传感器节点——大部分时间休眠，每隔1秒唤醒采集一次传感器数据，如果数据异常就立即处理，用软件定时器+低功耗模式实现；6）思考：软件定时器和硬件定时器各有什么优缺点？什么情况下用软件定时器，什么情况下必须用硬件定时器？",
          deep_dive: "深入理解RTOS的低功耗设计与时间管理：在嵌入式设备中，尤其是电池供电的IoT设备，功耗是最关键的指标之一。RTOS的低功耗设计直接影响设备的续航时间。1）为什么需要软件定时器？硬件定时器资源有限（通常只有几个），而且硬件定时器的中断上下文有很多限制（不能调用很多API）。软件定时器用一个硬件定时器（SysTick）做时基，就能实现任意多个软件定时器，而且回调函数在任务上下文执行，编程更灵活。代价是：精度不如硬件定时器，回调不能太复杂（否则会影响其他定时器）。2）定时器任务的工作原理：FreeRTOS的软件定时器是由一个专门的系统任务（Timer Service Task / Daemon Task）管理的。所有定时器的回调函数都在这个任务里顺序执行。应用任务通过「定时器命令队列」（Timer Command Queue）给定时器任务发命令（启动、停止、修改周期等）。这种设计的好处是：a）定时器API都是线程安全的；b）所有定时器操作都在一个任务里，不需要考虑竞态条件。3）空闲任务的妙用：空闲任务看起来「没用」，实际上很重要：a）内存回收：释放已删除任务的内存；b）低功耗：进入Tickless Idle；c）后台处理：通过空闲钩子做一些低优先级的事情。空闲钩子的注意事项：a）不能阻塞（空闲任务必须随时能运行）；b）不能太耗时（否则影响系统响应）；c）不能调用会让空闲任务挂起的API。4）Tickless Idle的原理：正常情况下，SysTick每隔1ms（或10ms）中断一次，即使系统没事干也要唤醒，这会阻止CPU进入深度睡眠。Tickless Idle的思路是：当所有任务都阻塞时，计算下一个要唤醒的时间，把SysTick停掉，让CPU进入深度睡眠，到时间了再唤醒。这样能大幅降低功耗（待机功耗可能降低90%以上）。实现Tickless Idle需要移植层的支持（和具体的MCU低功耗模式相关）。5）低功耗设计的层次：a）CPU级：Tickless Idle、睡眠模式、停止模式、待机模式；b）外设级：不用的外设关掉时钟、降低时钟频率；c）板级：电源域管理、不用的模块断电；d）算法级：减少运算量、降低采样率、批量处理。低功耗是一个系统工程，需要软硬件协同设计。6）边缘AI的功耗挑战：在边缘设备上跑AI模型，功耗是一大挑战——AI计算量大，耗电多。优化方法：a）模型优化：量化、剪枝、蒸馏，减少计算量；b）硬件加速：NPU/GPU，提高能效比；c）调度优化：只在需要时推理，平时休眠；d）算法优化：减少帧率、降低分辨率。理解RTOS的低功耗机制，能帮你更好地设计低功耗AI边缘设备。"
        }, duration: "2小时", resources: [{ title: "FreeRTOS软件定时器", url: "https://www.freertos.org/RTOS-software-timer.html", required: true, type: "doc", source: "official" }, { title: "FreeRTOS低功耗", url: "https://www.freertos.org/low-power-tickless-rtos.html", required: false, type: "doc", source: "official" }], checkpoint: "能用软件定时器实现周期性任务，理解空闲钩子和低功耗原理" },
      { day: 13, title: "内存管理与堆配置",
        summary: "深入理解FreeRTOS的内存管理，掌握不同堆分配方案", content: {
          objective: "今天你将深入学习FreeRTOS的内存管理机制，理解五种堆分配方案（heap_1到heap_5）的区别和适用场景，掌握内存碎片问题和优化方法。学完后你能根据项目需求选择合适的内存分配方案，优化内存使用。",
          key_points: [
            "FreeRTOS内存管理：5种堆实现（heap_1到heap_5），各有不同特性，适合不同场景",
            "heap_4：最常用，支持合并相邻空闲块（coalescing），减少内存碎片，适合大多数应用",
            "heap_5：支持多个非连续内存区域（如内部RAM + 外部RAM），灵活但复杂",
            "内存碎片：频繁分配释放不同大小的内存会导致碎片，可用内存总量够但没有连续的大块",
            "内存优化：栈大小估算、静态分配、内存池、避免碎片化的最佳实践"
          ],
          practice: "完成以下内存管理实践：1）堆分配方案调研：阅读FreeRTOS官方文档，了解heap_1到heap_5五种内存分配方案的特点、优缺点和适用场景，用表格对比；2）heap_4实验：配置使用heap_4，做内存分配释放实验——分配几个不同大小的内存块，释放其中一些，再分配更大的块，观察空闲内存的变化，理解内存合并（coalescing）；3）栈大小估算：用uxTaskGetStackHighWaterMark()检查你的任务实际用了多少栈，根据结果调整栈大小，既不浪费也不溢出；4）内存池实践（可选）：实现一个简单的内存池——预分配一大块内存，分成固定大小的块，需要时取一块，用完放回，这种方式不会产生碎片，适合频繁分配释放相同大小内存的场景；5）内存优化练习：review你的代码，看看有没有可以优化内存使用的地方——比如栈太大、堆配置过大、全局变量太多等；6）思考：为什么内存碎片在嵌入式中是个大问题？有哪些避免或减少碎片的方法？什么时候应该用静态分配而不是动态分配？",
          deep_dive: "深入理解嵌入式内存管理的挑战与最佳实践：内存是嵌入式系统中最宝贵的资源之一——MCU的RAM通常只有几KB到几MB，比PC小几个数量级。而且嵌入式系统往往要长时间运行，不能重启，内存泄漏和碎片可能会导致系统运行一段时间后崩溃。1）为什么需要5种heap实现？因为不同的嵌入式系统需求差异很大：a）heap_1：最简单，只分配不释放，内存永远不会碎。适合系统启动后创建所有任务，之后不再动态创建删除的简单系统；b）heap_2：支持分配释放，但不合并空闲块，碎片问题较严重。现在基本被heap_4取代；c）heap_3：包装标准库的malloc/free，需要配置堆大小。不推荐，因为标准库的malloc可能有碎片问题，而且不可重入；d）heap_4：最常用，支持合并相邻空闲块，碎片少，效率高。适合大多数应用；e）heap_5：在heap_4基础上支持多个非连续内存区域。适合内存不连续的系统（如内部RAM + 外部SDRAM）。2）内存碎片是怎么产生的？想象一下：你依次分配了A(100字节)、B(50字节)、C(200字节)，然后释放了B。现在有150字节的空闲内存（50+100，如果C后面还有的话），但它们不连续，如果要分配120字节，虽然总空闲够，但没有连续的120字节的块，就会分配失败。这就是内存碎片——总空闲内存不少，但都是小碎片，用不上。3）怎么避免内存碎片？a）静态分配：所有东西都在编译时分配，运行时不动态分配。最安全，但不灵活；b）内存池：预分配多个固定大小的块，需要时取，用完还。不会有碎片，但只能分配固定大小；c）按大小分多个内存池：小对象用小内存池，大对象用大内存池，减少碎片；d）分配策略优化：比如heap_4的最先适配（first fit）+ 合并，比heap_2好很多；e）系统设计上：尽量在启动时分配好所有需要的内存，运行时不频繁分配释放。4）栈溢出检测：栈溢出是嵌入式系统中最常见也最隐蔽的bug之一——栈溢出可能破坏其他数据，导致各种诡异的现象，而且很难调试。FreeRTOS提供了栈溢出检测（uxTaskGetStackHighWaterMark），可以测量任务栈的历史最大使用量（高水位线），帮助你调整栈大小。5）边缘AI的内存挑战：AI模型需要大量内存——权重、激活值、特征图都占内存。在嵌入式设备上部署AI模型，内存优化是关键：a）量化：INT8量化可以减少3/4的内存；b）优化推理框架：TensorRT Lite、TFLite Micro、ONNX Runtime Micro等都做了内存优化；c）分块推理：把大的计算分成小块，减少峰值内存；d）内存复用：不同层的激活值可以复用同一块内存。理解内存管理，能帮你更好地在嵌入式设备上部署AI模型。"
        }, duration: "2小时", resources: [{ title: "FreeRTOS内存管理", url: "https://www.freertos.org/a00111.html", required: true, type: "doc", source: "official" }, { title: "heap_4实现分析", url: "https://www.freertos.org/a00111.html#heap_4", required: false, type: "doc", source: "official" }], checkpoint: "能解释5种堆分配的区别，能用水位线检查任务栈使用情况" },
      { day: 14, title: "中断管理与紧急处理",
        summary: "深入理解FreeRTOS中断管理，掌握优先级别和延迟中断", content: {
          objective: "今天你将深入学习FreeRTOS的中断管理机制，理解中断优先级和任务优先级的关系，掌握延迟中断处理（Deferred Interrupt Processing）和二值信号量同步模式。学完后你能正确设计中断服务程序，处理好实时性和复杂性的平衡。",
          key_points: [
            "中断优先级vs任务优先级：中断优先级高于所有任务优先级，高优先级中断可以抢占低优先级中断和任务",
            "ISR注意事项：中断服务程序要尽量短，不能调用非ISR安全的API，不能阻塞，快速处理后把复杂工作交给任务",
            "延迟中断处理：ISR只做最紧急的事（如读数据、清中断标志），然后用信号量/队列通知任务，复杂的处理交给任务做",
            "FromISR系列API：带FromISR后缀的函数是中断安全的，可以在ISR中调用，如xSemaphoreGiveFromISR、xQueueSendFromISR",
            "优先级翻转与解决方案：高优先级任务等低优先级任务持有的资源，中间优先级任务又抢占低优先级，导致高优先级被延迟"
          ],
          practice: "完成以下中断管理实践：1）二值信号量同步练习：用定时器模拟一个外部中断，在ISR中调用xSemaphoreGiveFromISR()释放信号量，在任务中调用xSemaphoreTake()等待信号量，实现「中断触发 → 任务处理」的经典模式；2）队列ISR练习：在ISR中用xQueueSendFromISR()发送数据到队列，在任务中接收数据，理解队列的中断安全版本；3）延迟中断处理实验：对比两种方式——a）所有处理都在ISR中做；b）ISR只做最基本的，大部分处理交给任务。分析两种方式的优缺点和适用场景；4）中断优先级配置：了解你的MCU有多少个中断优先级，FreeRTOS怎么配置中断优先级，哪些优先级的中断可以调用FreeRTOS的FromISR API，哪些不行；5）优先级翻转理解：思考什么是优先级翻转，为什么它是个问题，FreeRTOS用什么方法解决（互斥量的优先级继承），画一个优先级翻转的时序图；6）综合设计：设计一个数据采集系统——传感器通过DMA/中断采集数据，采集完成后触发中断，ISR把数据放到队列里，一个任务从队列取数据做处理，另一个任务做显示/传输，理解这种「中断 + 队列 + 任务」的架构。",
          deep_dive: "深入理解实时系统的中断设计与确定性：在实时系统中，中断是实现确定性响应的关键——外部事件来了，中断能立即打断当前执行，保证实时性。但中断也是系统中最容易出问题的地方，需要精心设计。1）为什么ISR要尽量短？因为：a）ISR运行时，同级或更低级的中断被屏蔽，影响其他中断的响应；b）ISR不能被任务抢占，如果ISR太长，会影响高优先级任务的实时性；c）ISR里能做的事情有限（不能阻塞、不能调用很多API）。所以最佳实践是：ISR只做最紧急、最必须的事情（读寄存器、清中断标志、把数据放队列/发信号量），复杂的处理交给任务。这就是「延迟中断处理」（Deferred Interrupt Processing）。2）FromISR API的特殊之处：为什么有两套API（普通版和FromISR版）？因为：a）ISR不能阻塞，所以FromISR版不能等待（没有xTicksToWait参数或只能设为0）；b）ISR的上下文特殊，需要特殊的方式唤醒任务（portYIELD_FROM_ISR()）；c）有些内部机制在ISR中不一样。所以记住：在ISR中只能调用带FromISR后缀的函数。3）中断优先级的配置：Cortex-M内核的中断优先级有一个重要的概念——「优先级分组」（Priority Grouping），把优先级分成抢占优先级（Preempt Priority）和子优先级（Subpriority）。FreeRTOS需要配置：a）configMAX_SYSCALL_INTERRUPT_PRIORITY：高于这个优先级的中断不能调用FreeRTOS API，也不会被FreeRTOS关中断影响，保证这些非常紧急的中断的实时性；b）configKERNEL_INTERRUPT_PRIORITY：内核本身使用的中断优先级（PendSV、SysTick），通常设为最低。这是FreeRTOS中断设计的一个精妙之处——不是所有中断都受RTOS管理，特别紧急的中断可以「绕过」RTOS，保证最坏情况下的响应时间。4）优先级反转（Priority Inversion）：这是实时系统中的经典问题。想象一下：高优先级任务H需要一个资源，但这个资源被低优先级任务L持有了，这时候H要等L。但在等的过程中，中优先级任务M抢占了L，导致L没法释放资源，H就被延迟了——相当于M的优先级比H还高。这就叫优先级反转。解决方法：a）优先级继承（Priority Inheritance）：持有资源的低优先级任务，临时提升到等待这个资源的最高优先级任务的优先级，做完后再降回来。FreeRTOS的互斥量（Mutex）支持优先级继承；b）优先级天花板（Priority Ceiling）：每个资源有一个天花板优先级，任务获取资源时把自己的优先级升到天花板。也能解决优先级反转。5）中断延迟与实时性：衡量实时系统的一个重要指标是「中断延迟」（Interrupt Latency）——从中断发生到ISR开始执行的时间。影响因素：a）关中断时间：RTOS在执行临界区代码时会关中断，关多久就会延迟多久；b）当前正在执行的指令：有些指令不能被打断（如多周期指令）；c）总线/内存访问延迟。FreeRTOS的设计目标之一就是关中断时间尽量短，保证实时性。6）边缘AI系统的中断设计：在边缘AI设备中，中断同样重要——摄像头帧中断、NPU推理完成中断、音频采样中断等。理解中断设计，能帮你设计出实时性更好、更稳定的AI边缘系统。"
        }, duration: "2.5小时", resources: [{ title: "FreeRTOS中断管理", url: "https://www.freertos.org/RTOS-task-notifications.html", required: true, type: "doc", source: "official" }, { title: "FreeRTOS二值信号量中断同步", url: "https://www.freertos.org/a00113.html", required: false, type: "doc", source: "official" }], checkpoint: "能用二值信号量实现中断到任务的同步，理解中断优先级设计原则" },
      { day: 15, title: "RTOS综合实战与调试技巧",
        summary: "综合运用RTOS知识完成一个小项目，掌握调试和性能分析方法", content: {
          objective: "今天你将综合运用前两周学到的RTOS知识，完成一个多任务综合项目，并学习RTOS的调试技巧和性能分析方法。学完后你能独立设计和实现多任务嵌入式系统，能定位和解决常见的RTOS问题。",
          key_points: [
            "多任务系统设计：任务划分、优先级设计、通信同步机制选择、资源管理的整体架构设计",
            "常见问题与调试：死锁、优先级翻转、栈溢出、内存泄漏、竞态条件，怎么定位和解决",
            "系统状态查看：uxTaskGetSystemState()、vTaskList()、uxTaskGetStackHighWaterMark()等调试API",
            "性能分析：CPU使用率统计、任务运行时间统计、系统状态可视化，找到性能瓶颈",
            "RTOS最佳实践：任务设计原则、资源访问规范、错误处理、可测试性设计"
          ],
          practice: "完成以下综合实战与调试练习：1）综合项目：设计并实现一个小型的多任务系统，可以选择以下题目之一：a）智能传感器节点：传感器采集任务 + 数据处理任务 + 显示/传输任务 + 按键控制任务；b）简单游戏机：显示任务 + 按键输入任务 + 游戏逻辑任务 + 音效任务；要求：至少3个任务、用到至少2种IPC（如队列+信号量）、合理的优先级设计；2）状态查看练习：使用vTaskList()或uxTaskGetSystemState()打印所有任务的状态、优先级、栈水位等信息，观察系统运行时各任务的状态变化；3）CPU使用率统计：实现一个简单的CPU使用率统计功能——用一个空闲钩子计数器，或者用运行时间统计API（vTaskGetRunTimeStats()），看看CPU忙不忙，各个任务各占多少时间；4）故意制造一个bug（可选）：比如制造一个死锁、栈溢出或竞态条件，然后尝试用调试工具和方法定位它，锻炼调试能力；5）代码review：用今天学到的最佳实践，检查你写的RTOS代码，看看有没有可以改进的地方——任务划分是否合理、优先级是否恰当、有没有竞态条件、错误处理是否完善；6）总结复盘：总结你学习FreeRTOS的收获，画出知识图谱，规划后续深入学习的方向（如Zephyr、RT-Thread、Linux驱动等）。",
          deep_dive: "深入理解RTOS调试与嵌入式系统优化：RTOS系统比裸机系统复杂得多，出问题也更难调试——任务切换、竞态条件、死锁、优先级翻转等问题，有时候很难复现和定位。掌握调试技巧能帮你事半功倍。1）常见的RTOS问题与定位方法：a）栈溢出：症状是程序莫名其妙地跑飞、变量被改乱、进入HardFault。定位：用uxTaskGetStackHighWaterMark()检查每个任务的栈使用率，如果水位线接近栈顶就可能溢出。解决：增大栈、优化栈使用（减少局部大数组、减少函数调用深度）；b）死锁：两个任务互相等对方持有的资源，都卡住了。症状：两个任务都不运行了，系统好像「死了」一部分。定位：看任务状态，两个任务都在阻塞等信号量/互斥量。预防：按固定顺序获取资源、设置超时时间、尽量减少资源持有时间；c）竞态条件：多个任务访问共享资源没有同步，导致结果不确定。症状：有时候对有时候错，很难复现。定位：仔细检查所有共享资源的访问，看有没有加保护。预防：所有共享资源都要用互斥量/临界区保护；d）内存泄漏：动态分配的内存没有释放，运行久了内存用完。症状：系统运行一段时间后分配失败、崩溃。定位：跟踪内存分配释放，用xPortGetFreeHeapSize()观察空闲内存趋势。预防：尽量用静态分配、分配释放成对出现、用内存池。2）调试工具和手段：a）打印调试：最简单也最常用，用printf或串口打印任务状态和变量。缺点是会影响实时性；b）断点调试：用J-Link/ST-Link加断点，单步执行。缺点是中断和多任务场景下断点可能会打乱时序；c）RTOS感知调试：很多IDE（如Keil、IAR、VS Code + Cortex-Debug）支持RTOS感知调试——能在调试器里看到所有任务的状态、栈、队列等，非常方便；d）系统观测：FreeRTOS有很多状态查询API，可以写一个命令行或菜单，随时查看系统状态；e）Segger SystemView：非常强大的FreeRTOS追踪工具，可以记录并可视化任务切换、中断、API调用等，分析系统行为的神器。3）多任务系统的设计原则：a）任务划分：每个任务职责单一（高内聚），任务之间通过消息通信（低耦合），而不是共享一堆全局变量；b）优先级设计：越紧急、越短的任务优先级越高。计算密集型任务优先级不要太高，否则可能占满CPU；c）数据流向：尽量让数据从高优先级任务流向低优先级任务，或者用队列解耦；d）错误处理：每个任务都要考虑错误情况——API调用失败怎么办？数据异常怎么办？不能假设一切都会成功；e）看门狗：每个任务「喂狗」，如果某个任务跑飞了或卡住了，看门狗超时复位系统，提高可靠性。4）从RTOS到更复杂的系统：掌握了FreeRTOS，你就掌握了实时操作系统的核心思想——任务调度、同步通信、内存管理、中断处理。这些思想在其他RTOS（Zephyr、RT-Thread、uC/OS）中都是通用的，甚至在Linux驱动开发中也有很多相似之处（进程调度、中断处理、并发控制等）。继续深入的方向：a）学习更复杂的RTOS：Zephyr功能更全，适合IoT；b）学习Linux驱动和嵌入式Linux；c）学习嵌入式AI框架：TFLite Micro、ONNX Runtime Micro；d）学习具体的应用方向：电机控制、工业通信、图像处理等。嵌入式是一个很广的领域，打好RTOS的基础，你就能在这个领域走得更远。"
        }, duration: "3小时", resources: [{ title: "FreeRTOS调试FAQ", url: "https://www.freertos.org/FAQHelp.html", required: true, type: "doc", source: "official" }, { title: "Segger SystemView", url: "https://www.segger.com/products/development-tools/systemview/", required: false, type: "tool", source: "official" }], checkpoint: "完成一个3任务以上的综合项目，能查看系统状态和调试常见问题" }''')

print('Part 6 started (embedded track)...')

# Save intermediate - we'll add more in next scripts if needed
with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nPart 6a done (embedded-c + embedded-rtos)')
