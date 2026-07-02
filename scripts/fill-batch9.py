import re

def read_file():
    with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
        return f.read()

def write_file(content):
    with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
        f.write(content)

def get_node_dailyTasks(node_id, content):
    pattern = f'id: "{node_id}"'
    start_idx = content.find(pattern)
    if start_idx == -1:
        return None, None
    
    dt_start = content.find('dailyTasks: [', start_idx)
    if dt_start == -1:
        return None, None
    
    bracket_count = 0
    i = dt_start
    while i < len(content):
        if content[i] == '[':
            bracket_count += 1
        elif content[i] == ']':
            bracket_count -= 1
            if bracket_count == 0:
                return dt_start, i
        i += 1
    return None, None

def count_days(start, end, content):
    section = content[start:end]
    days = re.findall(r'day:\s*(\d+)', section)
    return len(days), [int(d) for d in days]

def find_last_day_end(section):
    pattern = r'checkpoint: "[^"]*"'
    matches = list(re.finditer(pattern, section))
    if not matches:
        return None
    last_match = matches[-1]
    pos = last_match.end()
    while pos < len(section) and section[pos] in ' \t\n\r':
        pos += 1
    if pos < len(section) and section[pos] == '}':
        return pos
    return None

def add_days(node_id, new_days_text, content):
    start, end = get_node_dailyTasks(node_id, content)
    if not start or not end:
        print(f'  {node_id}: NOT FOUND')
        return content, False
    
    count, days_list = count_days(start, end, content)
    section = content[start:end]
    last_end = find_last_day_end(section)
    
    if last_end is None:
        print(f'  {node_id}: could not find last day end')
        return content, False
    
    insert_pos = start + last_end + 1
    content_new = content[:insert_pos] + ',' + new_days_text + content[insert_pos:]
    new_count, _ = count_days(start, end + len(new_days_text) + 1, content_new)
    print(f'  {node_id}: {count} days -> {new_count} days ✅')
    return content_new, True

content = read_file()
print('Filling cs track (os/network/database) ...')

cs_os_days = '''
      { day: 11, title: "文件系统深入：ext4与VFS",
        summary: "深入理解文件系统实现原理，掌握VFS虚拟文件系统层和ext4文件系统结构。", content: {
          objective: "今天你将深入学习文件系统的实现原理。学完后你能理解虚拟文件系统（VFS）的设计思想，掌握ext4文件系统的核心数据结构和工作原理，了解文件的存储方式和目录组织方式。对于AI开发者来说，理解文件系统能帮你更好地优化数据读写性能，排查存储相关的性能瓶颈。",
          key_points: [
            "VFS虚拟文件系统：内核中的抽象层，向上提供统一的系统调用接口，向下兼容各种具体文件系统",
            "ext4文件系统：索引节点（inode）存元数据、数据块存内容、目录项（dentry）存文件名到inode的映射",
            "文件存储方式：直接块、间接块、双重间接、三重间接，支持大文件；ext4用extent替代块指针更高效",
            "目录结构：目录是特殊的文件，存储目录项，每个目录项包含文件名和inode号",
            "文件系统性能：块大小选择、碎片整理、日志机制（journal）保障一致性，断电不丢数据"
          ],
          practice: "完成以下文件系统深入实践：1）探索ext2/ext3/ext4文件系统：用df -T查看当前文件系统类型，用dumpe2fs或tune2fs查看文件系统超级块信息，了解块大小、inode数量、卷标等参数；2）理解inode：用ls -i查看文件的inode号，用stat查看文件的详细元数据（inode、权限、大小、时间戳等），思考为什么硬链接不能跨文件系统；3）软硬链接：创建硬链接和软链接，对比两者的区别（inode是否相同、能否跨文件系统、删除源文件的影响），用ls -li查看验证；4）文件系统挂载：理解mount命令的原理，查看/etc/fstab文件，理解开机自动挂载的配置；5）简单实验：在一个小的磁盘镜像上创建ext4文件系统，挂载进去创建一些文件，用debugfs查看inode和数据块，加深理解。最后思考：为什么AI训练中大量小文件的读写性能差？怎么优化？",
          deep_dive: "深入理解文件系统的设计权衡与AI场景优化：文件系统是操作系统中最经典的主题之一，几十年来涌现了几十种不同的文件系统，每种都有不同的设计目标和适用场景。经典的文件系统包括：1）ext2/ext3/ext4：Linux标准文件系统，成熟稳定，通用场景；2）XFS：SGI开发的高性能文件系统，适合大文件和高并发；3）Btrfs：写时复制（CoW）文件系统，支持快照、子卷、校验和；4）ZFS：Sun开发的高级文件系统，功能强大，支持RAID、快照、压缩、去重；5）F2FS：专为闪存设计的文件系统，在SSD和手机上广泛使用。在AI训练场景中，文件系统的性能至关重要——尤其是小文件和随机读写。深度学习数据集通常由大量图片、文本文件组成，随机读取小文件的性能瓶颈往往在文件系统而不是存储介质。优化方法包括：1）打包存储：把大量小文件打包成TFRecord、RecordIO、LMDB等格式，变成顺序读写；2）缓存：用内存缓存热门数据；3）并行IO：多线程/多进程并发读取；4）选择合适的文件系统：XFS在大文件顺序读写上性能好，ext4更通用；5）调整挂载参数：比如noatime减少元数据写入。另外，分布式文件系统（如Lustre、GlusterFS、Ceph）在大规模分布式训练中扮演着重要角色，提供全局命名空间和高带宽。理解文件系统的底层原理，能帮你在遇到存储性能瓶颈时找到优化方向。"
        }, duration: "2小时", resources: [{ title: "ext4文件系统详解", url: "https://www.kernel.org/doc/html/latest/filesystems/ext4.html", required: true, type: "doc", source: "official" }, { title: "VFS虚拟文件系统", url: "https://www.win.tue.nl/~aeb/linux/lk/lk-8.html", required: false, type: "doc", source: "other" }, { title: "Linux文件系统架构", url: "https://tldp.org/LDP/tlk/fs/filesystem.html", required: false, type: "doc", source: "other" }], checkpoint: "能解释inode、VFS、extent三个核心概念" },
      { day: 12, title: "IO模型：阻塞、非阻塞、IO多路复用",
        summary: "掌握五种IO模型的原理与区别，理解select/poll/epoll的实现机制与性能差异。", content: {
          objective: "今天你将系统学习IO模型的核心概念。学完后你能区分阻塞IO、非阻塞IO、IO多路复用、信号驱动IO、异步IO五种模型，深入理解select、poll、epoll的实现原理和性能差异，掌握高性能网络编程的基础。对于AI服务开发者来说，理解IO模型是构建高并发推理服务的关键。",
          key_points: [
            "五种IO模型：阻塞IO、非阻塞IO、IO多路复用、信号驱动IO、异步IO，区别在于数据准备和数据拷贝阶段是否阻塞",
            "IO多路复用：一个线程/进程监控多个文件描述符，任意一个就绪就返回，用一个线程服务多个连接",
            "select：线性扫描所有fd，有最大数量限制（1024），每次调用都要拷贝fd集，性能随连接数增加线性下降",
            "poll：用链表存储fd，没有最大数量限制，但还是要线性扫描，和select本质一样",
            "epoll：Linux特有的高性能方案，红黑树+就绪链表，事件驱动，无需扫描，性能随连接数增加几乎不下降"
          ],
          practice: "完成以下IO模型实践：1）概念理解：用生活中的例子（比如去餐厅吃饭、取快递等）类比五种IO模型，讲清楚每个阶段在做什么，什么时候阻塞，什么时候不阻塞；2）select/poll/epoll对比：制作一张对比表，从连接数上限、就绪通知方式、数据拷贝、性能特点、适用场景等维度对比三者；3）代码实验：写一个简单的TCP服务器，分别用阻塞IO和epoll两种方式实现，然后用压测工具（如wrk或ab）测试并发连接数和QPS，对比性能差异；4）深入理解epoll的工作模式：水平触发（LT）和边缘触发（ET）的区别，各自的优缺点和适用场景，思考为什么ET模式必须用非阻塞IO；5）思考：在AI推理服务中，通常是计算密集型而不是IO密集型，那IO模型还重要吗？什么时候推理服务会遇到IO瓶颈？怎么优化？",
          deep_dive: "深入理解高性能网络编程与Reactor模式：epoll是Linux高性能网络编程的基石，几乎所有高性能网络框架（Nginx、Redis、Netty、libevent等）都基于epoll实现。但光有epoll还不够，还需要好的架构设计——这就是Reactor模式。Reactor模式的核心思想是：把IO事件和业务处理分离，用一个主线程（Reactor线程）监听所有连接的IO事件，事件到达后分发给对应的Handler处理。Reactor模式有几种变体：1）单线程Reactor：所有事情都在一个线程里做，简单但不能利用多核，适合IO密集但计算少的场景；2）多线程Reactor：Reactor线程只负责IO事件分发，业务处理交给线程池，充分利用多核；3）主从Reactor：主Reactor负责accept新连接，从Reactor负责已连接的IO事件，扩展性更好。Nginx用的就是多进程Reactor模型，Redis用的是单线程Reactor+IO多线程。在AI推理服务中，Reactor模式也非常有用：网络IO（接收请求、返回结果）和计算（模型推理）分离，IO线程负责收发数据，GPU/CPU计算线程负责推理，两者通过队列连接，这样既能高并发处理连接，又能充分利用算力。另外，还有一种叫Proactor的模式（异步IO模型），在Windows上用IOCP实现，Linux上的AIO还不够成熟。理解这些高性能网络编程的核心思想，能帮你构建出高性能、高可用的AI服务。"
        }, duration: "2.5小时", resources: [{ title: "IO模型详解", url: "https://www.cs.fsu.edu/~baker/devices/lxr/http/source/linux/fs/select.c", required: true, type: "doc", source: "other" }, { title: "epoll源码分析", url: "https://github.com/torvalds/linux/blob/master/fs/eventpoll.c", required: false, type: "repo", source: "github" }, { title: "Reactor模式", url: "https://www.dre.vanderbilt.edu/~schmidt/PDF/reactor-siemens.pdf", required: false, type: "paper", source: "other" }], checkpoint: "能说清楚select/poll/epoll三者的区别和各自适用场景" },
      { day: 13, title: "进程间通信与同步",
        summary: "掌握管道、消息队列、共享内存、信号量等IPC机制，理解各自优缺点和适用场景。", content: {
          objective: "今天你将系统学习进程间通信（IPC）的各种方式。学完后你能掌握管道、消息队列、共享内存、信号量、套接字等IPC机制的原理和使用方法，能根据场景选择最合适的IPC方式。在AI的多进程数据加载、分布式训练的进程通信中，IPC是核心基础。",
          key_points: [
            "管道（Pipe）：最简单的IPC，半双工，父子进程间用；命名管道（FIFO）可用于无亲缘关系的进程",
            "消息队列（Message Queue）：内核维护的消息链表，进程按优先级收发消息，有类型区分，比管道灵活",
            "共享内存（Shared Memory）：最快的IPC，直接共享物理内存，无需拷贝，需配合信号量使用保证同步",
            "信号量（Semaphore）：计数器，用于进程间同步和互斥，保护共享资源，P操作减一V操作加一",
            "Socket套接字：最通用的IPC，支持跨网络通信，Unix域套接字用于本机，性能也很高"
          ],
          practice: "完成以下IPC实践：1）管道实验：写一个简单的父子进程通信程序，父进程写数据，子进程读数据，用pipe()系统调用；2）共享内存+信号量：用共享内存实现一个生产者消费者模型，生产者往共享内存写数据，消费者读数据，用信号量同步，体会共享内存的高效；3）消息队列实验：用消息队列实现两个进程的消息传递，支持不同类型的消息；4）对比实验：实现一个简单的ping-pong程序（进程A发一个数给进程B，B加1再发回来，来回10000次），分别用管道、消息队列、共享内存+信号量、Unix域套接字四种方式实现，对比它们的延迟和吞吐量，记录数据并分析差异原因；5）思考：在PyTorch的DataLoader中，多进程数据加载是怎么把数据传递给主进程的？用的是哪种IPC方式？为什么选这种方式？如果数据量特别大，应该怎么优化？",
          deep_dive: "深入理解共享内存与零拷贝技术：在所有IPC方式中，共享内存是最快的，因为它避免了内核态和用户态之间的数据拷贝——两个进程直接访问同一块物理内存。但共享内存也带来了同步问题——多个进程同时读写会产生竞态条件，所以需要配合信号量或互斥锁使用。共享内存的实现方式有几种：1）System V共享内存（shmget/shmat/shmdt）：经典的SysV接口；2）POSIX共享内存（shm_open+mmap）：更现代的接口，基于内存映射文件；3）mmap匿名映射：父子进程之间的共享内存；4）/dev/shm：基于内存的tmpfs文件系统，把文件映射到内存。在AI和大数据领域，零拷贝（Zero-Copy）技术非常重要——减少数据在内核态和用户态之间的拷贝次数，能大幅提升IO密集型应用的性能。零拷贝的技术包括：1）mmap+write：用内存映射替代read+write，减少一次拷贝；2）sendfile：直接在内核空间从文件描述符拷贝到socket，减少两次拷贝；3）splice：在两个文件描述符之间移动数据，不需要到用户态；4）DMA Gather Copy：DMA直接从内存的多个位置拷贝数据，不需要先拼接。Kafka、Nginx等高性能框架都大量使用了零拷贝技术。在AI推理服务中，零拷贝也很有用——减少图片、张量等数据在内存中的拷贝次数，降低CPU开销和延迟。理解这些底层原理，能帮你优化AI系统的IO性能。"
        }, duration: "2小时", resources: [{ title: "Linux IPC指南", url: "https://tldp.org/LDP/lpg/node7.html", required: true, type: "doc", source: "other" }, { title: "共享内存详解", url: "https://www.man7.org/linux/man-pages/man7/shm_overview.7.html", required: false, type: "doc", source: "official" }, { title: "零拷贝技术", url: "https://lwn.net/Articles/232191/", required: false, type: "article", source: "other" }], checkpoint: "能用共享内存+信号量实现一个简单的生产者消费者模型" },
      { day: 14, title: "死锁、活锁与饥饿",
        summary: "理解死锁的四个必要条件和处理策略，掌握银行家算法，了解活锁和饥饿的区别。", content: {
          objective: "今天你将学习并发系统中的经典问题——死锁、活锁和饥饿。学完后你能准确描述死锁的四个必要条件，掌握死锁的四种处理策略（预防、避免、检测、恢复），理解银行家算法的原理，能区分死锁、活锁和饥饿。在多线程/多进程的AI系统中，死锁是常见且难以调试的问题，理解这些概念能帮你预防和排查。",
          key_points: [
            "死锁四个必要条件：互斥、占有并等待、非抢占、循环等待，四个同时满足才会发生死锁",
            "死锁预防：破坏四个必要条件之一，比如破坏循环等待（资源有序分配）、破坏占有并等待（一次性申请所有资源）",
            "死锁避免：银行家算法，每次分配前判断系统是否处于安全状态，不安全就不分配",
            "死锁检测与恢复：允许死锁发生，定期检测（资源分配图），发现后通过剥夺资源、撤销进程等方式恢复",
            "活锁与饥饿：活锁是进程都在忙等但不前进（如两个人互相让路都过不去）；饥饿是某个进程一直得不到资源"
          ],
          practice: "完成以下死锁相关实践：1）死锁模拟：写一个简单的死锁程序——两个线程，线程A先拿锁1再拿锁2，线程B先拿锁2再拿锁1，运行足够多次后会触发死锁，观察程序卡住的现象；然后用死锁预防的方法修改代码（比如统一锁的顺序），验证死锁不再发生；2）银行家算法：实现一个简化版的银行家算法，给定系统的资源总数、已分配矩阵、需求矩阵，判断系统是否处于安全状态，如果有进程请求资源，判断能否安全分配；3）活锁模拟：实现一个活锁的例子（如两个绅士互相让路，都往左/右让，结果还是过不去），思考如何解决活锁；4）思考：在AI系统中，死锁可能发生在什么场景？比如多GPU训练中可能的死锁场景、多进程数据加载中可能的死锁场景、分布式训练中可能的死锁场景；你遇到过什么死锁问题？是怎么解决的？5）死锁排查：如果一个程序疑似死锁了，你会怎么排查？用什么工具？（提示：gdb、pstack、jstack、/proc/pid/stack等）",
          deep_dive: "深入理解并发问题的本质与调试方法：死锁只是并发问题的一种，并发系统中还有很多其他问题——竞态条件（Race Condition）、数据竞争（Data Race）、优先级反转（Priority Inversion）、虚假唤醒（Spurious Wakeup）等等。为什么并发程序这么难写？因为人的大脑是顺序思考的，而并发是多个执行流同时进行，组合爆炸，很难覆盖所有情况。调试并发程序也特别困难——问题难以复现，和时序有关，加了日志可能就不出现了（Heisenbug）。应对并发问题的方法有几个层次：1）避免并发：能不用并发就不用，用单线程+事件驱动（如Node.js、Redis），简单可靠；2）降低共享：尽量减少共享数据，用消息传递代替共享内存（如Actor模型、CSP模型）；3）正确同步：必须共享时，用正确的同步原语（互斥锁、读写锁、信号量、条件变量、原子操作等）；4）工具辅助：用静态分析工具（如ThreadSanitizer、Helgrind）检测数据竞争和死锁；5）设计模式：用成熟的并发设计模式，比如生产者消费者、读写锁、线程池、Future/Promise等。在AI系统中，并发问题尤其常见和复杂——多线程数据加载、多GPU训练、分布式训练的参数同步、推理服务的请求处理，处处都有并发。好消息是，现代深度学习框架（PyTorch、TensorFlow）已经帮我们处理了大部分底层的并发问题，但理解这些原理，能帮你在遇到框架没覆盖的场景时自己解决问题，也能在出现诡异的bug时想到可能是并发问题。最后送一句话：「不要用并发，除非你不得不用；要用的话，尽量用成熟的模式和工具。」"
        }, duration: "2小时", resources: [{ title: "死锁详解", url: "https://www.geeksforgeeks.org/operating-system-deadlock/", required: true, type: "doc", source: "official" }, { title: "银行家算法", url: "https://www.studytonight.com/operating-system/bankers-algorithm", required: false, type: "doc", source: "other" }, { title: "ThreadSanitizer", url: "https://github.com/google/sanitizers/wiki/ThreadSanitizerCppManual", required: false, type: "tool", source: "other" }], checkpoint: "能说清楚死锁的四个必要条件和三种处理策略" },
      { day: 15, title: "操作系统综合项目：Mini Shell",
        summary: "实现一个简易的Shell，综合运用进程、信号、管道、IO重定向等知识。", content: {
          objective: "今天你将完成一个操作系统综合项目——实现一个简易的Shell（命令解释器）。通过这个项目，你会把前14天学到的进程管理、信号处理、管道、IO重定向、环境变量等知识融会贯通。这是检验你操作系统学习成果的最好方式。",
          key_points: [
            "项目目标：实现一个支持命令执行、参数解析、管道、IO重定向、内置命令的简易Shell",
            "核心功能：执行外部命令（fork+exec）、管道（pipe+dup2）、输入输出重定向（< > >>）、内置命令（cd/pwd/exit/echo）",
            "信号处理：处理Ctrl+C（SIGINT）、Ctrl+Z（SIGTSTP）信号，不退出Shell",
            "环境变量：支持读取和设置环境变量，PATH搜索可执行文件",
            "错误处理：命令不存在、权限不足、语法错误等异常情况的处理"
          ],
          practice: "实现一个Mini Shell，要求如下：\n\n基础功能（必做）：\n1）命令解析：解析用户输入的命令行，拆分命令名和参数；\n2）执行外部命令：用fork()+execvp()执行外部命令，父进程wait等待子进程结束；\n3）内置命令：实现cd、pwd、exit、echo四个内置命令；\n4）IO重定向：支持>（输出重定向）、<（输入重定向）、>>（追加重定向）；\n5）管道：支持单个管道（cmd1 | cmd2），两个命令通过管道连接。\n\n进阶功能（选做）：\n1）多管道：支持多个管道（cmd1 | cmd2 | cmd3）；\n2）信号处理：捕获SIGINT和SIGTSTP信号，不退出Shell，只终止前台进程；\n3）后台运行：命令末尾加&支持后台运行，不阻塞Shell；\n4）通配符：支持简单的*通配符展开；\n5）Tab补全：用readline库实现命令自动补全；\n6）历史记录：支持上下键查看历史命令。\n\n项目要求：\n- 代码结构清晰，模块化设计\n- 有错误处理，不会轻易崩溃\n- 有基本的注释和文档\n- 可以编译运行并正常使用\n\n完成后，用你的Mini Shell执行一些常用命令，测试各项功能是否正常工作。",
          deep_dive: "操作系统学习的意义与进阶方向：完成这个Mini Shell项目后，你应该对操作系统的核心概念有了扎实的理解。但操作系统是一个非常博大精深的领域，这三周只是入门。如果你想继续深入，可以往这些方向发展：1）内核开发：深入Linux内核源码，学习调度器、内存管理、文件系统、网络协议栈的具体实现，甚至参与内核开发；2）系统编程：深入学习Linux系统编程，掌握所有系统调用和库函数，写出高性能的系统级程序；3）性能优化：学习性能分析工具（perf、bcc/BPF、strace、ltrace等），掌握系统性能调优方法，成为性能优化专家；4）分布式系统：从单机操作系统扩展到分布式系统，学习分布式存储、分布式计算、一致性协议等；5）操作系统设计：了解不同操作系统的设计哲学（Unix/Linux、Windows、macOS/iOS、Android、RTOS等），比较它们的优缺点。对于AI开发者来说，深入理解操作系统至少有三方面的价值：1）排障能力：遇到系统级别的问题（性能瓶颈、资源耗尽、诡异崩溃），能快速定位和解决；2）优化能力：能从系统层面优化AI训练和推理的性能，让同样的硬件跑出更好的效果；3）架构能力：在设计AI系统（大规模训练集群、高并发推理服务）时，能做出合理的架构决策。最后，希望大家记住——操作系统是软件的基石，越往上走，越发现基础的重要性。持续学习，不断夯实基础，你就能走得更远。"
        }, duration: "4小时", resources: [{ title: "Shell编写教程", url: "https://www.cs.usfca.edu/~benson/cs326/pintos/pintos/src/threads/init.c", required: false, type: "tutorial", source: "other" }, { title: "xv6操作系统", url: "https://pdos.csail.mit.edu/6.828/2020/xv6.html", required: false, type: "website", source: "other" }, { title: "Linux系统编程", url: "https://man7.org/tlpi/", required: false, type: "book", source: "other" }], checkpoint: "实现了一个能执行命令、支持管道和重定向的Mini Shell" }
'''

print('  Filling cs-os (10 -> 15 days)...')
content, ok = add_days('cs-os', cs_os_days, content)
if not ok:
    print('  FAILED: cs-os')

cs_network_days = '''
      { day: 11, title: "传输层深入：TCP拥塞控制",
        summary: "深入理解TCP拥塞控制算法，掌握慢启动、拥塞避免、快速重传、快速恢复原理。", content: {
          objective: "今天你将深入学习TCP的拥塞控制机制。学完后你能理解拥塞控制的四个核心阶段（慢启动、拥塞避免、快速重传、快速恢复），掌握经典的Tahoe、Reno、NewReno算法，了解BBR等现代拥塞控制算法。对于AI开发者来说，理解TCP拥塞控制能帮你优化分布式训练的网络性能，排查网络相关的性能瓶颈。",
          key_points: [
            "拥塞控制 vs 流量控制：流量控制是点对点的（接收方能力），拥塞控制是全局的（网络承载能力）",
            "慢启动：cwnd从1开始指数增长，直到达到ssthresh，目的是快速探测网络带宽",
            "拥塞避免：超过ssthresh后线性增长（每个RTT加1），慢慢接近网络容量",
            "快速重传/快速恢复：收到3个重复ACK就重传，不用等超时；丢包后ssthresh减半，cwnd从ssthresh开始线性增长",
            "现代拥塞控制：BBR基于带宽和RTT测量，不依赖丢包信号，在高带宽延迟积网络中性能更好"
          ],
          practice: "完成以下TCP拥塞控制实践：1）算法理解：用图示和文字描述Tahoe和Reno的区别，分别描述在慢启动、拥塞避免、超时、收到3个重复ACK时cwnd和ssthresh的变化；2）模拟实验：用NS-3或Python简单模拟TCP拥塞控制过程，画出发送窗口随时间的变化曲线，观察慢启动的指数增长和拥塞避免的线性增长；3）抓包分析：用Wireshark抓取一次大文件传输的TCP流量，观察拥塞窗口的变化（通过分析序列号和确认号推断），看看能不能看到慢启动和拥塞避免的阶段，有没有丢包和重传；4）算法对比：对比Reno和BBR两种拥塞控制算法的优缺点，分析它们在不同网络环境（有线网、无线网、长肥管道、弱网）下的表现；5）思考：在分布式训练中，通常需要在机器之间传输大量的梯度数据（几十GB甚至更多），TCP的拥塞控制会成为瓶颈吗？有什么优化方法？（提示：调整TCP参数、用RDMA、用用户态协议栈等）",
          deep_dive: "深入理解拥塞控制的演进与AI网络优化：TCP拥塞控制是互联网的核心技术之一，几十年来不断演进。从最早的Tahoe（1988），到Reno、NewReno、SACK，再到近些年的CUBIC（Linux默认）、BBR（Google提出），拥塞控制算法一直在进化，以适应不断变化的网络环境。为什么拥塞控制这么难？因为它本质上是一个分布式控制问题——每个连接独立地调整自己的发送速率，但它们共享网络带宽，互相影响。理想的拥塞控制应该满足：1）公平性：各连接公平分享带宽；2）效率：链路利用率高，不浪费；3）低延迟：排队延迟小；4）快速收敛：网络变化后能快速调整到新的平衡点。但这些目标往往是矛盾的，需要权衡。在AI分布式训练场景中，网络性能至关重要——数据并行训练需要在每个step同步梯度，梯度同步的时间直接影响训练速度。针对AI场景的网络优化有几个方向：1）TCP参数调优：调整缓冲区大小、拥塞控制算法、MTU等；2）RDMA（远程直接内存访问）：绕过内核，直接从用户态访问远程内存，极低延迟和极高带宽，是高性能计算和AI训练的主流方案；3）用户态协议栈：把TCP/IP协议栈移到用户态，减少内核态和用户态的切换开销，如DPDK+用户态协议栈；4）集合通信库：NCCL（NVIDIA）、RCCL（AMD）等库针对GPU通信做了深度优化，支持多种集合通信原语（AllReduce、AllGather、ReduceScatter等）；5）网络拓扑感知：根据集群的网络拓扑（如胖树、环形）优化通信调度。理解这些底层网络原理，能帮你在分布式训练遇到网络瓶颈时找到优化方向。"
        }, duration: "2小时", resources: [{ title: "TCP拥塞控制详解", url: "https://datatracker.ietf.org/doc/html/rfc5681", required: true, type: "doc", source: "official" }, { title: "BBR拥塞控制", url: "https://queue.acm.org/detail.cfm?id=3022184", required: false, type: "article", source: "other" }, { title: "TCP/IP详解", url: "https://www.kohala.com/start/", required: false, type: "book", source: "other" }], checkpoint: "能画出TCP拥塞控制的状态机图，解释慢启动和拥塞避免的区别" },
      { day: 12, title: "HTTP协议与RESTful API设计",
        summary: "深入理解HTTP协议细节，掌握RESTful API设计原则和最佳实践。", content: {
          objective: "今天你将深入学习HTTP协议和RESTful API设计。学完后你能理解HTTP/1.1、HTTP/2、HTTP/3的主要区别和演进，掌握RESTful API的设计原则，知道如何设计出优雅、易用、可扩展的API。对于AI服务开发者来说，HTTP是推理服务最常用的接口，好的API设计能大幅提升服务质量。",
          key_points: [
            "HTTP演进：HTTP/0.9→1.0→1.1→2→3，每一代的核心改进：持久连接、管线化、多路复用、QUIC",
            "HTTP/2核心改进：二进制分帧、多路复用（单TCP连接并行请求）、头部压缩、服务器推送",
            "HTTP/3：基于QUIC协议，用UDP替代TCP，解决队头阻塞问题，更快的连接建立，更好的弱网表现",
            "REST设计原则：资源命名（名词复数）、HTTP方法语义（GET查POST增PUT改PATCH部分改DELETE删）、无状态",
            "API最佳实践：版本控制、分页、过滤、排序、错误处理（HTTP状态码+错误码）、幂等性、文档"
          ],
          practice: "完成以下HTTP与API设计实践：1）HTTP报文分析：用curl -v访问一个网站，查看请求和响应报文，理解请求行、请求头、请求体、状态行、响应头、响应体的含义；2）HTTP方法练习：设计一个用户管理API的RESTful接口，列出各个操作的URL和HTTP方法（获取列表、获取单个、创建、更新、删除、修改密码等），理解REST的资源导向思想；3）状态码学习：整理常见HTTP状态码的含义和适用场景（2xx/3xx/4xx/5xx系列，重点是200/201/204、301/302/304、400/401/403/404/409/429、500/502/503/504）；4）API设计练习：为一个AI推理服务设计RESTful API，功能包括：提交推理任务、查询任务状态、获取推理结果、取消任务、列出历史任务、获取模型信息。设计好URL结构、HTTP方法、请求参数、响应格式、错误处理；5）思考：REST API一定是最好的吗？什么时候适合用REST，什么时候适合用RPC（gRPC），什么时候适合用GraphQL？AI推理服务适合用哪种API风格？为什么？",
          deep_dive: "深入理解API设计的艺术与AI服务架构：API设计不仅仅是技术问题，更是产品和设计问题——API是服务的对外接口，是用户（其他开发者）感知服务的第一印象。好的API应该是：简单易懂（看名字就知道怎么用）、一致性（相同的模式和约定）、健壮（边界情况处理好）、可演进（向后兼容）、文档完善。API设计的几个核心原则：1）面向资源而非面向动作：用名词描述资源，用HTTP动词描述操作，而不是用/updateUser、/deleteUser这种RPC风格；2）用HTTP状态码表达结果：不要所有请求都返回200然后在body里写code，正确使用HTTP状态码；3）幂等性：GET、PUT、DELETE应该是幂等的（多次调用和一次调用效果相同），POST可以不是；4）版本管理：API变更时要考虑向后兼容，用URL版本（/v1/）或Header版本；5）分页和过滤：列表接口一定要支持分页，避免一次返回太多数据；6）错误处理：错误信息要有足够的信息帮助调用方定位问题，包括错误码、错误消息、追踪ID等。在AI服务中，API设计有一些特殊的考虑：1）同步 vs 异步：简单的推理可以同步返回，复杂的、耗时长的任务应该用异步模式（提交任务→轮询状态/回调通知）；2）流式输出：像ChatGPT那样的流式响应，用SSE（Server-Sent Events）或WebSocket；3）大文件传输：上传图片/视频等大文件，考虑用分片上传；4）多模态输入：支持文本、图片、音频等多种输入格式；5）限流和配额：服务端要做限流保护，防止被打垮。另外，除了REST，还有几种常见的API风格：1）gRPC：基于HTTP/2和Protobuf，高性能，强类型，适合内部服务间通信；2）GraphQL：客户端按需请求数据，灵活，适合前端API；3）WebSocket：全双工通信，适合实时性要求高的场景。选择合适的API风格，是架构设计的重要决策。"
        }, duration: "2小时", resources: [{ title: "HTTP/2规范", url: "https://http2.github.io/", required: true, type: "doc", source: "official" }, { title: "RESTful API设计指南", url: "https://restfulapi.net/", required: false, type: "website", source: "other" }, { title: "Google API设计指南", url: "https://cloud.google.com/apis/design", required: false, type: "doc", source: "official" }], checkpoint: "能为一个AI推理服务设计出完整的RESTful API" },
      { day: 13, title: "DNS与CDN原理",
        summary: "理解DNS域名解析的完整过程和CDN内容分发网络的工作原理。", content: {
          objective: "今天你将学习DNS和CDN这两个互联网基础设施的工作原理。学完后你能理解DNS域名解析的完整流程（递归查询、迭代查询），知道DNS缓存机制和优化方法，理解CDN的核心技术和工作流程。对于AI服务开发者来说，CDN能大幅提升静态资源的访问速度，DNS是服务高可用的基础。",
          key_points: [
            "DNS解析过程：浏览器缓存→系统缓存→hosts文件→本地DNS服务器→根域名服务器→顶级域→权威DNS",
            "DNS记录类型：A（IPv4）、AAAA（IPv6）、CNAME（别名）、MX（邮件）、NS（域名服务器）、TXT（文本）",
            "DNS优化：多级缓存、智能DNS（按地理位置/运营商返回最近的IP）、DNS预解析、HTTPDNS",
            "CDN核心思想：内容缓存到边缘节点，用户从最近的节点获取数据，减少延迟和回源带宽",
            "CDN关键技术：内容分发/缓存策略、负载均衡、健康检查、缓存刷新/预热、HTTPS加速"
          ],
          practice: "完成以下DNS与CDN实践：1）DNS解析实验：用dig或nslookup命令查询一个域名的解析过程，查看返回的各种记录（A、CNAME、NS等），用dig +trace查看完整的迭代查询过程，理解DNS的层级结构；2）DNS缓存实验：连续两次用dig查询同一个域名，对比响应时间，理解DNS缓存的作用；查看电脑的DNS缓存（Windows用ipconfig /displaydns，Linux用nscd或systemd-resolve）；3）CDN原理理解：画一张CDN工作原理图，标注用户、边缘节点、中间节点、源站，描述静态资源请求的完整流程；思考CDN缓存的命中率受哪些因素影响，怎么提高缓存命中率；4）hosts文件实验：修改系统hosts文件，把一个域名指向127.0.0.1，观察访问效果，理解hosts文件在解析中的优先级；5）思考：在AI服务中，DNS和CDN分别可以用来做什么？比如：模型文件的分发用不用CDN？API服务的高可用怎么用DNS实现？全球用户访问的AI服务怎么优化网络延迟？",
          deep_dive: "深入理解DNS安全与全球加速架构：DNS是互联网的地址簿，是所有网络通信的第一步，但它本身也有很多安全问题：1）DNS欺骗/缓存投毒：攻击者篡改DNS缓存，把用户引导到恶意网站；2）DNS劫持：运营商或攻击者篡改DNS解析结果；3）DDoS攻击：DNS放大攻击，用DNS的大响应包放大攻击流量。应对措施：1）DNSSEC：DNS安全扩展，用数字签名保证DNS响应的真实性；2）HTTPS DNS（DoH）/DNS over TLS（DoT）：加密DNS查询，防止被篡改和监听；3）Anycast DNS：多地部署，任播技术，就近访问，也能抗DDoS；4）HTTPDNS：用HTTP协议请求DNS解析，绕过运营商的Local DNS，防止劫持。CDN是互联网重要的基础设施，它的作用不仅仅是加速静态资源，还演化出了很多高级功能：1）动态加速：针对动态请求的优化，TCP优化、路由优化、协议优化；2）全站加速：动静态混合，智能识别动静，分别走不同的链路；3）安全防护：WAF（Web应用防火墙）、DDoS防护、CC防护；4）边缘计算：在CDN边缘节点上跑代码（Serverless），把计算也搬到离用户近的地方。在AI服务全球化部署中，CDN和边缘计算的作用越来越大：1）静态资源（模型文件、前端页面）用CDN全球加速；2）简单的推理任务可以在边缘节点执行，降低延迟；3）复杂的任务回源到中心节点；4）全球负载均衡（GSLB）基于DNS把用户路由到最近的可用服务节点。理解这些基础设施的原理，能帮你设计出高性能、高可用、全球化的AI系统。"
        }, duration: "1.5小时", resources: [{ title: "DNS原理详解", url: "https://www.cloudflare.com/learning/dns/what-is-dns/", required: true, type: "doc", source: "official" }, { title: "CDN工作原理", url: "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/", required: false, type: "doc", source: "official" }, { title: "DNS根服务器", url: "https://root-servers.org/", required: false, type: "website", source: "other" }], checkpoint: "能描述DNS递归查询和迭代查询的过程，解释CDN为什么能加速" },
      { day: 14, title: "WebSocket与实时通信",
        summary: "掌握WebSocket协议原理与应用场景，了解SSE、长轮询等其他实时通信方案。", content: {
          objective: "今天你将学习实时通信的各种方案，重点是WebSocket协议。学完后你能理解WebSocket的握手过程和帧格式，掌握WebSocket的编程方法，能区分WebSocket、SSE、长轮询、短轮询等实时通信方案的适用场景。在AI领域，WebSocket常用于流式输出、实时对话、交互式应用等场景。",
          key_points: [
            "WebSocket：HTML5新增协议，基于TCP，全双工通信，握手用HTTP Upgrade，之后是二进制帧",
            "WebSocket握手：HTTP请求带Upgrade: websocket头，服务器返回101 Switching Protocols，连接建立",
            "帧格式：数据以帧为单位传输，帧类型有文本帧、二进制帧、关闭帧、ping/pong帧，支持分片",
            "其他实时方案：短轮询（定时刷新）、长轮询（请求挂起有数据才返回）、SSE（服务器推送事件，单向）",
            "适用场景：WebSocket适合双向实时通信（聊天、协作、游戏），SSE适合服务端单向推送（流式输出）"
          ],
          practice: "完成以下WebSocket与实时通信实践：1）WebSocket服务端：用Node.js或Python（如FastAPI、Flask-SocketIO）实现一个简单的WebSocket服务，客户端用浏览器的原生WebSocket API连接，实现一个简单的聊天室（支持广播消息）；2）抓包分析：用Wireshark或浏览器开发者工具的Network面板，查看WebSocket的握手过程和数据帧，理解Upgrade头、101状态码、帧格式；3）SSE实验：实现一个Server-Sent Events服务，服务器定时推送消息，客户端用EventSource接收，对比SSE和WebSocket的区别；4）方案对比：制作一张对比表，从通信方向、协议、延迟、开销、兼容性、适用场景等维度对比短轮询、长轮询、SSE、WebSocket四种实时通信方案；5）思考：在AI应用中，哪些场景适合用WebSocket？哪些适合用SSE？哪些用普通的HTTP请求就够了？比如：聊天机器人的流式输出、实时语音识别、实时监控仪表盘、模型训练进度展示，分别适合用哪种方案？为什么？",
          deep_dive: "深入理解实时通信架构与AI流式输出：实时通信是现代Web应用的重要组成部分，不同的场景需要选择不同的技术方案。让我们深入对比一下：1）短轮询（Short Polling）：最简单，前端定时发请求问后端有没有新数据。优点：实现简单，兼容性好。缺点：浪费资源，延迟高（取决于轮询间隔）。适合数据更新不频繁、实时性要求不高的场景。2）长轮询（Long Polling）：前端发请求，后端挂起请求，有数据了才返回，前端拿到结果后立即再发下一个请求。优点：比短轮询延迟低，基于HTTP兼容性好。缺点：连接数多，服务端压力大。是没有WebSocket时的降级方案。3）SSE（Server-Sent Events）：基于HTTP，服务器单向推送，自动重连，事件类型支持。优点：实现简单，自动重连，适合服务端主动推数据的场景。缺点：只能服务端推客户端，浏览器有并发连接数限制。适合流式输出、消息通知、实时数据展示等单向场景。4）WebSocket：全双工，双向通信，建立连接后没有HTTP头开销。优点：实时性好，双向通信，开销小。缺点：实现复杂，需要处理重连、心跳等。适合聊天、游戏、协作编辑等双向实时场景。在AI应用中，流式输出（如ChatGPT的逐字输出）是非常重要的用户体验。实现流式输出有几种方式：1）SSE：简单易用，最常用，因为流式输出本质上是服务端单向推送；2）WebSocket：如果需要双向交互（比如用户中途打断），可以用WebSocket；3）Chunked Transfer Encoding：HTTP分块传输，也是一种方案。选择哪种方案，取决于你的具体需求。另外，在大规模实时通信场景中，还需要考虑：1）水平扩展：单机连接数有限，需要多机部署，就涉及到消息广播的问题，通常用Redis Pub/Sub或消息队列；2）心跳检测：定期发ping/pong检测连接是否还活着；3）断线重连：网络不稳定时自动重连，恢复状态；4）消息可靠性：怎么保证消息不丢、不重复、有序。理解这些实时通信的原理和架构，能帮你设计出体验良好的实时AI应用。"
        }, duration: "2小时", resources: [{ title: "WebSocket规范", url: "https://datatracker.ietf.org/doc/html/rfc6455", required: true, type: "doc", source: "official" }, { title: "SSE详解", url: "https://html.spec.whatwg.org/multipage/server-sent-events.html", required: false, type: "doc", source: "official" }, { title: "Socket.io", url: "https://socket.io/", required: false, type: "library", source: "other" }], checkpoint: "能用WebSocket实现一个简单的聊天室应用" },
      { day: 15, title: "计算机网络综合项目：HTTP服务器",
        summary: "实现一个简易的HTTP服务器，综合运用TCP编程、HTTP协议、并发处理等知识。", content: {
          objective: "今天你将完成一个计算机网络综合项目——实现一个简易的HTTP服务器。通过这个项目，你会把前三周学到的TCP编程、HTTP协议、并发模型、IO多路复用等知识融会贯通。这是检验你网络学习成果的最好方式。",
          key_points: [
            "项目目标：实现一个支持静态文件、并发连接的简易HTTP服务器",
            "核心功能：解析HTTP请求、返回HTTP响应、支持GET方法、支持静态文件、返回正确的状态码",
            "并发模型：用多进程或多线程或IO多路复用（epoll）实现并发，支持同时处理多个连接",
            "HTTP特性：支持200/404/403/500等状态码、Content-Type自动识别、长连接（Keep-Alive）",
            "性能优化：非阻塞IO、零拷贝（sendfile）、缓存、压缩等（选做）"
          ],
          practice: "实现一个Mini HTTP服务器，要求如下：\n\n基础功能（必做）：\n1）TCP服务器：创建socket，bind，listen，accept客户端连接；\n2）HTTP请求解析：解析请求行（方法、路径、HTTP版本）、请求头；\n3）静态文件服务：根据请求路径查找文件，存在则返回200和文件内容，不存在返回404；\n4）响应格式：正确的响应行、响应头（Content-Type、Content-Length、Connection等）、响应体；\n5）并发处理：用多线程或多进程或epoll实现并发，支持同时处理多个请求。\n\n进阶功能（选做）：\n1）HTTP方法：支持HEAD、POST方法；\n2）目录浏览：请求目录时返回目录列表的HTML；\n3）长连接：支持HTTP/1.1的Keep-Alive，一个连接处理多个请求；\n4）sendfile：用sendfile系统调用实现零拷贝文件传输，提高性能；\n5）缓存：支持If-Modified-Since，返回304 Not Modified；\n6）压缩：支持gzip压缩传输；\n7）性能测试：用wrk或ab做压测，看看你的服务器QPS能到多少，和Nginx对比有多大差距。\n\n项目要求：\n- 代码结构清晰，模块化设计\n- 有错误处理，不会轻易崩溃\n- 有基本的注释和文档\n- 可以编译运行，能用浏览器或curl访问\n\n完成后，用浏览器访问你的服务器，测试静态文件、404页面、并发访问等功能。",
          deep_dive: "网络编程的进阶方向与AI网络挑战：完成这个HTTP服务器项目后，你应该对计算机网络和网络编程有了扎实的理解。但网络是一个非常博大精深的领域，还有很多可以深入的方向：1）协议设计：设计自己的应用层协议，理解协议设计的艺术（效率、扩展性、兼容性、安全性的权衡）；2）网络编程框架：学习成熟的网络框架（Netty、libevent、asio等），理解Reactor模式、Proactor模式，掌握高性能网络编程的精髓；3）网络安全：学习TLS/SSL、HTTPS、加密算法、证书体系，理解网络安全的原理；4）网络性能优化：TCP参数调优、内核参数调优、DPDK/用户态协议栈、RDMA，追求极致的网络性能；5）分布式系统：从单机网络编程扩展到分布式系统，学习一致性、共识算法、分布式存储、分布式计算。对于AI开发者来说，网络的重要性越来越高——随着模型越来越大、数据越来越多，单机训练已经不够了，分布式训练成为常态。分布式训练中，通信往往是瓶颈——尤其是数据并行的AllReduce操作，通信时间和GPU数量、模型大小成正比。针对AI通信的优化是一个活跃的研究方向：1）算法层面：梯度压缩、量化、稀疏化，减少需要传输的数据量；2）系统层面：RDMA、NCCL/RCCL等高性能集合通信库；3）架构层面：模型并行、流水线并行、混合并行，减少通信量；4）网络层面：更高带宽的网络（InfiniBand、400G以太网）、更好的拓扑（胖树）。未来，AI和网络的结合会越来越紧密——AI优化网络，网络支撑AI。理解网络底层原理，能帮你在分布式训练遇到瓶颈时找到优化方向，也能设计出更高效的AI系统架构。"
        }, duration: "4小时", resources: [{ title: "HTTP服务器实现教程", url: "https://beej.us/guide/bgnet/", required: false, type: "tutorial", source: "other" }, { title: "Tinyhttpd源码", url: "https://sourceforge.net/projects/tinyhttpd/", required: false, type: "repo", source: "other" }, { title: "UNIX网络编程", url: "https://www.unpbook.com/", required: false, type: "book", source: "other" }], checkpoint: "实现了一个能返回静态文件、支持并发的简易HTTP服务器" }
'''

print('  Filling cs-network (10 -> 15 days)...')
content, ok = add_days('cs-network', cs_network_days, content)
if not ok:
    print('  FAILED: cs-network')

cs_database_days = '''
      { day: 11, title: "索引深入：B+树与哈希索引",
        summary: "深入理解B+树索引和哈希索引的原理与区别，掌握聚簇索引和非聚簇索引的概念。", content: {
          objective: "今天你将深入学习数据库索引的核心原理。学完后你能理解B+树为什么成为数据库索引的首选，掌握聚簇索引和非聚簇索引的区别，知道哈希索引的适用场景，理解索引的最左前缀原则。索引是数据库性能优化的关键，理解索引原理能帮你写出高效的SQL，设计出合理的索引策略。",
          key_points: [
            "B+树结构：多路平衡查找树，所有数据都在叶子节点，叶子节点用链表连接，适合范围查询和排序",
            "B+树 vs B树：B树数据在所有节点，B+树只在叶子；B+树叶子链表相连；B+树查询更稳定（都走到叶子）",
            "聚簇索引 vs 非聚簇索引：聚簇索引叶子存完整数据行（InnoDB主键索引），非聚簇索引叶子存主键值（需要回表）",
            "哈希索引：基于哈希表，等值查询O(1)非常快，但不支持范围查询和排序，也不支持最左前缀",
            "索引使用原则：最左前缀匹配、覆盖索引（避免回表）、索引选择性、避免索引失效（函数、隐式类型转换）"
          ],
          practice: "完成以下索引深入实践：1）B+树理解：画一个3阶B+树的示意图，演示插入几个数据的过程，理解分裂的过程；对比B树和B+树的区别，分析为什么数据库选择B+树而不是B树、红黑树、跳表；2）聚簇索引与回表：用EXPLAIN分析一条SQL，看看用的是什么索引，是不是覆盖索引，有没有回表；设计一个需要回表的查询和一个覆盖索引的查询，对比性能差异；3）最左前缀原则：假设有一个联合索引(a,b,c)，判断以下查询能否用到索引：WHERE a=1、WHERE a=1 AND b=2、WHERE b=2 AND a=1、WHERE a=1 AND c=3、WHERE a>1 AND b=2，然后用EXPLAIN验证你的判断；4）索引设计练习：为一个用户表（id、name、age、city、create_time）设计索引，考虑这些查询条件：按id查、按name查、按city+age范围查、按create_time排序、按name+city查，你会设计哪些索引？为什么？5）思考：在AI应用中，数据库索引有什么特殊的考虑吗？比如存储向量的数据库（向量数据库）用的是什么索引？和传统的B+树有什么不同？",
          deep_dive: "深入理解数据库索引的艺术与向量数据库：索引是数据库性能优化的核心，但索引不是越多越好——索引会加速查询，但会减慢写入（插入/更新/删除时要维护所有索引），还会占用存储空间。好的索引设计是一门艺术，需要在读写之间找到平衡。索引设计的几个高级话题：1）联合索引的列顺序：等值条件的列放前面，区分度高的列放前面，范围查询的列放后面；2）索引下推（Index Condition Pushdown，ICP）：在索引遍历过程中就过滤条件，减少回表次数；3）自适应哈希索引：InnoDB的自适应哈希索引，监控索引使用情况，自动为热点页建哈希索引；4）全文索引：针对文本的倒排索引，用于关键词搜索；5）GIS索引：R树，用于地理空间数据查询。在AI时代，出现了一种新的数据库——向量数据库（Vector Database），专门用于存储和检索向量。传统数据库是精确匹配（等于、大于、包含等），而向量数据库是相似性检索（最近邻搜索ANN）——找和查询向量最相似的前K个向量。向量索引的主要算法有：1）IVF（倒排文件）：先聚类，搜索时只在邻近的类里找，用准确性换速度；2）HNSW（层次化 navigable 小世界图）：基于图的索引，目前性能最好的ANN算法之一，多层次结构，查找时从顶层往下跳；3）PQ/SQ（乘积量化/标量量化）：向量压缩，用更小的空间存储更多的向量，内存友好；4）LSH（局部敏感哈希）：哈希后相似的向量有更高概率落到同一个桶里。Milvus、Pinecone、Weaviate、FAISS等都是常见的向量数据库/库。向量数据库是RAG（检索增强生成）系统的核心组件，理解向量索引的原理，能帮你更好地构建RAG系统。"
        }, duration: "2小时", resources: [{ title: "MySQL索引详解", url: "https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html", required: true, type: "doc", source: "official" }, { title: "B+树可视化", url: "https://www.cs.usfca.edu/~galles/visualization/BPlusTree.html", required: false, type: "tool", source: "other" }, { title: "向量数据库对比", url: "https://thedataquarry.com/posts/vector-db-benchmark/", required: false, type: "article", source: "other" }], checkpoint: "能解释聚簇索引和非聚簇索引的区别，说出B+树比红黑树适合索引的三个原因" },
      { day: 12, title: "事务与ACID、隔离级别",
        summary: "深入理解事务的ACID特性和四种隔离级别，掌握MVCC多版本并发控制原理。", content: {
          objective: "今天你将深入学习数据库事务和并发控制的核心概念。学完后你能准确描述ACID的含义，理解脏读、不可重复读、幻读三种异常现象，掌握四种隔离级别的区别和各自解决的问题，理解InnoDB的MVCC（多版本并发控制）实现原理。事务是数据库的基石，理解事务原理是数据库进阶的必经之路。",
          key_points: [
            "ACID：原子性（Atomicity）、一致性（Consistency）、隔离性（Isolation）、持久性（Durability）",
            "三种读异常：脏读（读到未提交数据）、不可重复读（同事务内两次读同一行结果不同）、幻读（同事务内两次查询行数不同）",
            "四种隔离级别：读未提交（Read Uncommitted）、读已提交（Read Committed）、可重复读（Repeatable Read）、串行化（Serializable）",
            "MVCC：多版本并发控制，通过undo log保存历史版本，读写不冲突，提高并发性能；快照读和当前读",
            "InnoDB实现：RR隔离级别下，通过MVCC+Next-Key Lock（间隙锁+行锁）解决幻读问题"
          ],
          practice: "完成以下事务与隔离级别实践：1）异常现象模拟：用两个MySQL会话模拟脏读、不可重复读、幻读三种异常，在不同隔离级别下观察现象，验证每种隔离级别分别解决了什么问题；2）MVCC理解：思考为什么MVCC能实现读写不冲突？读操作读的是什么版本？写操作呢？undo log在其中扮演什么角色？Read View是什么？怎么判断一个版本对当前事务可见？3）隔离级别的权衡：为什么不直接用最高的串行化隔离级别？隔离级别和性能的关系是什么？实际业务中你会选择什么隔离级别？为什么？4）死锁实验：在两个会话中模拟数据库死锁（和操作系统的死锁是一个原理），观察MySQL如何处理死锁，查看死锁日志，思考如何避免死锁；5）思考：在AI服务中，数据库事务重要吗？哪些场景需要用事务？哪些不需要？比如用户系统、订单系统、训练任务管理系统，分别对事务的要求是什么？",
          deep_dive: "深入理解事务实现与分布式事务：ACID听起来简单，但实现起来非常复杂，每个字母背后都有一整套技术：1）原子性（Atomicity）：要么全做要么全不做。通过undo log（回滚日志）实现——事务执行过程中，记录下所有修改的反向操作，如果事务需要回滚，就用undo log回滚到之前的状态。2）一致性（Consistency）：事务执行前后数据都处于合法状态。这是事务的最终目的，其他三个特性都是为了保证一致性。一致性由数据库（约束、触发器）和应用层共同保证。3）隔离性（Isolation）：并发事务之间互不干扰。通过锁机制和MVCC实现。锁又分为共享锁（S锁，读锁）、排他锁（X锁，写锁）、意向锁、行锁、表锁、间隙锁等等。4）持久性（Durability）：事务提交后，数据就永久保存了，即使宕机也不会丢。通过redo log（重做日志）实现——事务提交时，先把修改记录到redo log里，再慢慢刷到磁盘。宕机后可以从redo log恢复。WAL（Write-Ahead Logging，预写式日志）是核心思想——先写日志，再写数据。单机事务已经很复杂了，分布式事务更难——多个节点上的操作要保持原子性。分布式事务的解决方案有：1）两阶段提交（2PC）：Prepare阶段+Commit阶段，协调者统一调度，强一致但性能差；2）三阶段提交（3PC）：在2PC基础上加CanCommit阶段，减少阻塞；3）TCC（Try-Confirm-Cancel）：业务层面实现的两阶段，性能好但侵入性强；4）Saga：长事务解决方案，一系列本地事务+补偿，最终一致；5）消息事务+最终一致性：用消息队列保证事务最终一致。在微服务架构和分布式系统中，分布式事务是核心难题之一。在AI系统中，同样会遇到分布式事务的场景——比如跨多个服务的用户操作、分布式训练的状态同步等。理解事务的本质，能帮你在面对这些问题时做出合理的技术选型。"
        }, duration: "2.5小时", resources: [{ title: "MySQL事务隔离级别", url: "https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html", required: true, type: "doc", source: "official" }, { title: "MVCC原理", url: "https://dev.mysql.com/doc/refman/8.0/en/innodb-multi-versioning.html", required: false, type: "doc", source: "official" }, { title: "数据库系统概念", url: "https://www.db-book.com/", required: false, type: "book", source: "other" }], checkpoint: "能说出四种隔离级别的区别，以及InnoDB RR级别下如何解决幻读" },
      { day: 13, title: "SQL优化与执行计划",
        summary: "掌握SQL优化的方法论，学会用EXPLAIN分析执行计划，定位性能瓶颈。", content: {
          objective: "今天你将学习SQL优化的方法论和实战技巧。学完后你能用EXPLAIN命令分析SQL的执行计划，判断SQL有没有走索引、扫描了多少行、有没有用临时表、有没有文件排序等，掌握常见的SQL优化技巧。SQL优化是后端开发者的必备技能，也是排查数据库性能问题的基础。",
          key_points: [
            "EXPLAIN输出：id、select_type、table、type、possible_keys、key、key_len、ref、rows、Extra",
            "type列详解：从好到坏——system > const > eq_ref > ref > range > index > ALL，至少要达到range级别",
            "Extra列关注：Using index（覆盖索引，好）、Using where（需要回表过滤）、Using filesort（文件排序，差）、Using temporary（临时表，差）",
            "优化原则：尽量让SQL走索引、避免全表扫描、减少扫描行数、避免文件排序和临时表、用LIMIT限制返回行数",
            "慢查询定位：慢查询日志、show profile、performance_schema，找出慢SQL再优化"
          ],
          practice: "完成以下SQL优化实践：1）EXPLAIN练习：找10条不同的SQL查询（简单查询、联合查询、子查询、排序、分组等），分别用EXPLAIN分析执行计划，解读每个字段的含义，判断这条SQL的性能好不好，有没有优化空间；2）慢SQL优化：找一条全表扫描的慢SQL，分析为什么没走索引（是没有索引？还是索引失效？），添加合适的索引后再EXPLAIN，对比优化前后的type、rows、Extra的变化，验证优化效果；3）排序优化：写一个需要排序的查询，如果出现Using filesort，想办法优化——加合适的索引让排序用索引完成，或者优化排序的方式；4）JOIN优化：写一个多表JOIN的查询，分析执行计划，看看驱动表的选择是否合理，有没有用到索引，能不能优化成覆盖索引；5）综合练习：假设一个博客系统的数据库（用户表、文章表、评论表、标签表），针对常见的查询场景，设计索引并优化SQL：文章列表分页、用户的文章列表、文章详情+评论、热门文章排行、按标签筛选文章。",
          deep_dive: "深入理解查询优化器与数据库性能调优体系：SQL优化不只是改SQL和加索引，它是一个系统性的工程——从SQL语句、索引设计、表结构，到数据库参数、服务器配置、硬件选型、架构设计，每个层面都可以优化。数据库优化的层次：1）SQL层：优化SQL语句，重写慢SQL；2）索引层：合理设计索引，让查询走索引；3）表结构层：范式和反范式的权衡，字段类型选择，表分区；4）数据库配置层：参数调优（缓冲池大小、日志大小、连接数等）；5）架构层：读写分离、分库分表、缓存、CDN；6）硬件层：更多内存、更快的磁盘（SSD/NVMe）、更多CPU。MySQL的查询优化器（Optimizer）负责生成执行计划——它会基于成本模型估算不同执行计划的代价，选择代价最低的那个。但优化器不是万能的，它可能选错索引，可能选错驱动表，因为它的统计信息可能不准，成本模型可能和实际情况有偏差。所以我们需要用EXPLAIN看实际的执行计划，如果发现优化器选错了，可以用FORCE INDEX等方式强制走某个索引。性能调优的方法论：1）先定位：不要上来就瞎优化，先用工具定位瓶颈在哪里（是CPU密集？IO密集？锁等待？）；2）量化：用数据说话，不要凭感觉，优化前后都要有benchmark；3）找最大瓶颈：Amdahl定律——优化占比最高的部分，收益最大；4）验证：每次只改一个变量，这样才知道是什么起了作用；5）权衡：优化通常有代价，比如索引加了写入会变慢，读写分离了一致性会变差，要权衡利弊。在AI系统中，数据库通常不是性能瓶颈（瓶颈在计算），但如果是面向用户的AI服务（比如对话机器人、AI应用），数据库也可能成为瓶颈。掌握数据库优化的方法论，能帮你从容应对各种性能问题。"
        }, duration: "2小时", resources: [{ title: "MySQL EXPLAIN详解", url: "https://dev.mysql.com/doc/refman/8.0/en/explain.html", required: true, type: "doc", source: "official" }, { title: "SQL优化指南", url: "https://use-the-index-luke.com/", required: false, type: "website", source: "other" }, { title: "MySQL性能调优", url: "https://www.percona.com/resources/technical-presentations", required: false, type: "doc", source: "other" }], checkpoint: "能读懂EXPLAIN输出，定位一条慢SQL的性能瓶颈" },
      { day: 14, title: "Redis与NoSQL数据库",
        summary: "掌握Redis核心数据结构与应用场景，了解NoSQL数据库的分类和各自适用场景。", content: {
          objective: "今天你将学习Redis和NoSQL数据库。学完后你能掌握Redis的五种核心数据结构（String、List、Hash、Set、Sorted Set）及其典型应用场景，理解Redis的持久化机制和内存淘汰策略，了解NoSQL数据库的四大分类和代表产品。在AI服务中，Redis是最常用的缓存和会话存储，也是实现限流、排行榜、分布式锁等功能的利器。",
          key_points: [
            "Redis数据结构：String（缓存、计数、分布式锁）、List（队列、栈、时间线）、Hash（对象存储）、Set（去重、交集并集、标签）、ZSet（排行榜、延时队列、范围查找）",
            "Redis持久化：RDB（快照，二进制，恢复快）、AOF（追加日志，数据更安全）、混合持久化（RDB+AOF结合，4.0+）",
            "内存淘汰策略：noeviction、allkeys-lru、volatile-lru、allkeys-random、volatile-random、volatile-ttl",
            "NoSQL分类：键值型（Redis）、文档型（MongoDB）、列式（Cassandra、HBase）、图（Neo4j）",
            "Redis应用：缓存、分布式锁、排行榜、计数器、消息队列、限流、地理位置、布隆过滤器"
          ],
          practice: "完成以下Redis与NoSQL实践：1）Redis数据结构练习：用redis-cli操作五种基本数据结构，每种结构练习至少5个常用命令，思考每种结构适合什么场景；2）应用场景实现：用Redis实现以下功能——a）文章点赞数/浏览数计数；b）用户关注列表和粉丝列表，计算共同关注（交集）；c）排行榜（如积分榜、热搜榜），支持增加分数、获取前N名、获取某人排名；d）分布式锁（用SETNX+过期时间）；3）持久化机制理解：对比RDB和AOF的优缺点，分别适合什么场景？如果Redis宕机了，数据会丢多少？怎么配置能兼顾性能和数据安全？4）NoSQL调研：调研四种NoSQL的代表产品、特点、适用场景、优缺点，制作一张对比表，包括：键值型（Redis、DynamoDB）、文档型（MongoDB、CouchDB）、列式（Cassandra、HBase）、图数据库（Neo4j、Nebula）；5）思考：在AI系统中，Redis可以用来做什么？比如：缓存模型结果、存储用户对话历史、限流、分布式任务队列、实时排行榜，还有呢？哪些场景适合用Redis，哪些适合用关系型数据库？",
          deep_dive: "深入理解缓存架构与一致性问题：缓存是提升系统性能的利器，但引入缓存也带来了新的问题——缓存和数据库的一致性问题、缓存穿透、缓存击穿、缓存雪崩等等。让我们系统梳理一下：1）缓存穿透：查询不存在的数据，每次都打到数据库。解决方案：布隆过滤器、缓存空值。2）缓存击穿：热点key过期，大量请求同时打到数据库。解决方案：互斥锁、永不过期（逻辑过期）。3）缓存雪崩：大量key同时过期，或者Redis宕机，大量请求打到数据库。解决方案：过期时间加随机值、多级缓存、Redis集群、限流降级。4）缓存和数据库的一致性：这是经典难题。常见的缓存更新策略：a）Cache Aside：读的时候先读缓存，没有就读数据库再写缓存；写的时候先更新数据库，再删除缓存。这是最常用的策略。b）Read/Write Through：缓存层封装了读写，应用只操作缓存，缓存负责同步到数据库。c）Write Behind：写的时候只写缓存，异步批量写回数据库，性能好但可能丢数据。为什么是删缓存而不是更缓存？因为并发场景下更新缓存可能有竞态条件，导致脏数据，删缓存更简单安全，虽然下一次读会miss，但这是可以接受的。延迟双删（更新数据库→删缓存→延时一会再删一次）是一种更保险的做法。在AI服务中，缓存尤其重要——模型推理通常很慢，缓存热门请求的结果，能大幅降低延迟和算力成本。但也要注意：AI的输出可能不是完全确定的（同样的输入可能有略微不同的输出），缓存的时候要考虑是否能接受这个差异。另外，缓存只是性能优化的一个层面，还有很多其他优化手段：数据库优化、读写分离、分库分表、CDN、边缘计算等等。架构设计就是在各种约束条件下找到最优的平衡点。"
        }, duration: "2小时", resources: [{ title: "Redis官方文档", url: "https://redis.io/docs/", required: true, type: "doc", source: "official" }, { title: "Redis设计与实现", url: "https://redisbook.readthedocs.io/", required: false, type: "book", source: "other" }, { title: "NoSQL数据库对比", url: "https://www.mongodb.com/nosql-explained", required: false, type: "doc", source: "official" }], checkpoint: "能用Redis实现排行榜和分布式锁两个功能" },
      { day: 15, title: "数据库综合项目：简单博客系统",
        summary: "设计并实现一个简单的博客系统的数据库和API，综合运用数据库设计、SQL、索引、事务等知识。", content: {
          objective: "今天你将完成一个数据库综合项目——设计并实现一个简单的博客系统的后端。通过这个项目，你会把前三周学到的数据库设计、SQL编写、索引优化、事务、缓存等知识融会贯通。这是检验你数据库学习成果的最好方式。",
          key_points: [
            "项目目标：实现一个支持用户、文章、评论、标签的博客系统的数据库设计和核心API",
            "数据库设计：表结构设计、字段类型选择、主键外键、索引设计、范式与反范式权衡",
            "核心功能：用户注册/登录、文章CRUD、评论功能、标签系统、文章列表分页",
            "性能优化：合理的索引设计、缓存层（Redis）、分页优化、SQL优化",
            "安全考虑：SQL注入防护、密码哈希、权限控制、输入验证"
          ],
          practice: "设计并实现一个简易博客系统，要求如下：\n\n数据库设计（必做）：\n1）用户表：id、用户名、密码哈希、邮箱、创建时间、更新时间；\n2）文章表：id、标题、内容摘要、内容正文、作者id、状态（草稿/已发布）、创建时间、更新时间、浏览量、点赞数；\n3）评论表：id、文章id、用户id、内容、创建时间；\n4）标签表：id、标签名、创建时间；\n5）文章标签关联表：文章id、标签id（多对多关系）。\n\nSQL编写（必做）：\n1）用户注册和登录（密码用bcrypt哈希存储）；\n2）发布文章、修改文章、删除文章（事务保证一致性）；\n3）文章列表分页（支持按时间排序、按浏览量排序）；\n4）文章详情（文章信息+作者信息+评论列表）；\n5）按标签筛选文章；\n6）发表评论、删除评论；\n7）统计每篇文章的评论数。\n\n索引设计（必做）：\n1）为所有表设计合理的索引（主键、唯一索引、普通索引、联合索引）；\n2）用EXPLAIN分析核心查询的执行计划，确保走索引；\n3）至少实现一个覆盖索引。\n\n进阶功能（选做）：\n1）Redis缓存：热门文章、文章详情缓存，处理缓存一致性；\n2）全文搜索：用MySQL全文索引或Elasticsearch实现文章搜索；\n3）点赞功能：文章点赞、取消点赞、点赞数统计；\n4）压力测试：用JMeter或ab压测核心接口，优化到你能达到的最好性能。\n\n项目要求：\n- 表结构设计文档（ER图+说明）\n- 完整的DDL语句\n- 核心业务的SQL语句\n- 索引设计说明和EXPLAIN验证\n- 可以是纯SQL脚本，也可以配合你熟悉的后端语言实现API",
          deep_dive: "数据库学习的意义与进阶方向：完成这个项目后，你应该对关系型数据库有了扎实的理解。但数据库领域非常博大精深，还有很多可以深入的方向：1）数据库内核：研究数据库源码，理解查询优化器、存储引擎、事务管理器的实现，甚至自己实现一个简单的数据库；2）数据库调优专家：深入理解MySQL/PostgreSQL的内部机制，成为数据库性能优化专家；3）分布式数据库：学习TiDB、CockroachDB、Spanner等分布式数据库的原理，理解分布式事务、一致性协议、数据分片、负载均衡；4）数据仓库与大数据：学习OLAP数据库（ClickHouse、Doris、Snowflake）、数据湖、数据仓库建设、ETL/ELT，从数据中挖掘价值；5）向量数据库与AI：深入学习向量数据库，结合大模型构建RAG系统、智能搜索系统。对于AI开发者来说，数据库的角色也在变化——传统的关系型数据库依然重要（用户、订单、任务管理），但向量数据库、图数据库这些新型数据库越来越重要（知识图谱、RAG检索、推荐系统）。未来的AI应用，一定是多种数据库的组合——关系型存结构化数据、向量数据库存embedding、图数据库存关系、时序数据库存指标、缓存存热点数据。作为AI开发者，不需要成为数据库专家，但要了解各种数据库的特点和适用场景，在架构设计时做出正确的选择。最后，希望大家记住——数据库是数据的归宿，是所有应用的基石。AI再强大，也离不开数据的存储和检索。把基础打扎实，你就能走得更远。"
        }, duration: "4小时", resources: [{ title: "数据库系统概念", url: "https://www.db-book.com/", required: false, type: "book", source: "other" }, { title: "MySQL实战45讲", url: "https://time.geekbang.org/column/intro/100020801", required: false, type: "course", source: "other" }, { title: "设计数据密集型应用", url: "https://dataintensive.net/", required: false, type: "book", source: "other" }], checkpoint: "完成博客系统的数据库设计、核心SQL和索引优化" }
'''

print('  Filling cs-database (10 -> 15 days)...')
content, ok = add_days('cs-database', cs_database_days, content)
if not ok:
    print('  FAILED: cs-database')

write_file(content)
print('\nDone! cs track (os/network/database) filled.')
print('Now run check-partial.py to verify.')
