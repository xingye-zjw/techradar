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
print('Filling cs track nodes...')

cs_algo_days = '''
      { day: 15, title: "高级动态规划",
        summary: "掌握区间DP、树形DP、状态压缩DP等高级DP模型，解决更复杂的优化问题。", content: {
          objective: "今天你将学习高级动态规划的多种模型，进一步提升DP解题能力。学完后你能识别并解决区间DP、树形DP、状态压缩DP、数位DP等高级DP问题，理解每种模型的适用场景和状态设计思路。在AI领域，这些高级DP思想可以应用于序列建模、结构预测、神经网络架构搜索等问题。",
          key_points: [
            "区间DP：在区间上做DP，dp[i][j]表示区间[i,j]的最优解，典型问题如戳气球、最长回文子序列",
            "树形DP：在树结构上做DP，通常后序遍历，用子节点信息推父节点，如二叉树最大路径和",
            "状态压缩DP：用二进制位表示状态，适合状态数不多的情况，如旅行商问题TSP、棋盘问题",
            "数位DP：处理数字各位上的DP，用于统计满足条件的数字个数，如数字1的个数、不含连续1的数",
            "DP优化：单调队列优化、斜率优化、四边形不等式，用于降低DP时间复杂度"
          ],
          practice: "完成以下高级DP实战：1）区间DP：实现戳气球问题，给定n个气球，每个气球上有数字，戳破第i个气球获得nums[left]*nums[i]*nums[right]个硬币，求能获得的最大硬币数；2）树形DP：实现二叉树的最大路径和，路径可以从任意节点开始到任意节点结束；3）状态压缩DP：实现旅行商问题TSP的DP解法，给定n个城市和两两之间的距离，求从起点出发经过所有城市一次再回到起点的最短路径（n<=15）；4）经典题：打家劫舍III（树形DP）、最长回文子序列（区间DP）。每道题都先明确定义状态，再推导转移方程，最后实现代码。",
          deep_dive: "深入理解DP设计的艺术与AI应用：DP的核心是状态定义和状态转移，好的状态定义能让问题迎刃而解，差的定义则让问题变得复杂无比。设计DP状态的几个原则：1）状态要能表示问题的子结构；2）转移方程要能从子问题推出原问题；3）初始条件要明确；4）要考虑空间优化。在AI领域，DP思想有深刻的应用：隐马尔可夫模型（HMM）的三个基本问题——评估问题用前向/后向算法（DP）、解码问题用Viterbi算法（DP）、学习问题用Baum-Welch算法（EM），其中前两个都是典型的DP问题。在序列建模中，CRF（条件随机场）的推理也是DP问题。在强化学习中，值迭代和策略迭代本质上就是在马尔可夫决策过程（MDP）上做动态规划。另外，DP的思想还延伸到了更广泛的领域：比如Transformer中的注意力机制，可以看作是一种可学习的动态规划；神经网络架构搜索（NAS）也可以用DP来优化。掌握高级DP，不仅能解决算法题，更能培养你将复杂问题分解为子问题的思维能力。"
        }, duration: "2.5小时", resources: [{ title: "区间DP总结", url: "https://leetcode.com/problems/burst-balloons/", required: true, type: "doc", source: "official" }, { title: "树形DP题目集", url: "https://leetcode.com/problems/house-robber-iii/", required: false, type: "doc", source: "official" }, { title: "状态压缩DP教程", url: "https://cp-algorithms.com/dynamic_programming/bitmask.html", required: false, type: "doc", source: "other" }], checkpoint: "能独立实现区间DP和树形DP各一道中等难度题目" },
      { day: 16, title: "图论进阶：最短路与最小生成树",
        summary: "掌握Dijkstra、Floyd、Bellman-Ford最短路算法和Prim、Kruskal最小生成树算法。", content: {
          objective: "今天你将系统学习图论中的经典算法——最短路和最小生成树。学完后你能熟练掌握Dijkstra、Bellman-Ford、Floyd-Warshall三种最短路算法的原理和实现，掌握Prim和Kruskal两种最小生成树算法，能根据问题特点选择最合适的算法。这些算法在网络路由、路径规划、推荐系统、社交网络分析等领域有广泛应用。",
          key_points: [
            "Dijkstra算法：单源最短路，贪心策略，用优先队列优化，适用于无负权边的图，时间O(E log V)",
            "Bellman-Ford算法：单源最短路，可检测负环，适用于有负权边的图，时间O(VE)",
            "Floyd-Warshall算法：多源最短路，动态规划思想，三重循环，适用于小规模图，时间O(V³)",
            "Prim算法：最小生成树，从一个点出发逐步扩展，用优先队列优化，类似Dijkstra",
            "Kruskal算法：最小生成树，按边权排序依次加入，用并查集检测环，时间O(E log E)"
          ],
          practice: "完成以下图论算法实战：1）实现Dijkstra算法：用邻接表+优先队列，求单源最短路，测试一个有向带权图；2）实现Floyd-Warshall算法：求所有点对的最短路，输出距离矩阵，验证与Dijkstra结果一致；3）实现Kruskal算法：用并查集实现，求最小生成树的总权重；4）实现Prim算法：用优先队列优化，对比Kruskal的结果是否相同；5）应用题：网络延迟时间（有n个节点，信号从k发出，多久所有节点都收到）。最后对比各算法的适用场景：什么时候用Dijkstra，什么时候用Bellman-Ford，什么时候用Floyd？",
          deep_dive: "深入理解图算法的工程应用与变种：这些经典图算法在实际工程中有大量变种和应用。在网络路由中，OSPF协议用的就是Dijkstra算法，而距离矢量路由协议则基于Bellman-Ford的思想。在推荐系统中，可以把用户和物品看作二分图，用图算法做推荐。在交通导航中，A*算法是Dijkstra的启发式版本，用估价函数引导搜索方向，在实际导航中比纯Dijkstra快很多。在社交网络分析中，最小生成树可以用于发现社区结构。图算法的进阶方向包括：1）最短路径的变种——k最短路径、约束最短路、随机最短路；2）最大流最小割——Ford-Fulkerson方法、Edmonds-Karp算法、Dinic算法；3）图匹配——二分图最大匹配（匈牙利算法）、稳定婚姻问题；4）强连通分量——Tarjan算法、Kosaraju算法。在AI领域，图神经网络（GNN）将深度学习和图论结合，用于处理图结构数据，是当前的研究热点。掌握基础图算法，是深入图神经网络和复杂系统分析的前提。"
        }, duration: "2.5小时", resources: [{ title: "Dijkstra可视化", url: "https://visualgo.net/en/sssp", required: true, type: "tool", source: "official" }, { title: "图论算法总结", url: "https://cp-algorithms.com/graph/breadth-first-search.html", required: true, type: "doc", source: "other" }, { title: "最小生成树讲解", url: "https://leetcode.com/problems/min-cost-to-connect-all-points/", required: false, type: "doc", source: "official" }], checkpoint: "能独立实现Dijkstra和Kruskal算法" },
      { day: 17, title: "字符串算法：KMP与Trie树",
        summary: "掌握KMP字符串匹配算法和Trie字典树，以及AC自动机和后缀数组等进阶内容。", content: {
          objective: "今天你将深入学习字符串处理的核心算法。学完后你能理解KMP算法的原理并实现字符串匹配，掌握Trie字典树的实现和应用，了解AC自动机和后缀数组等高级字符串算法。在NLP领域，分词、文本搜索、模式匹配等任务都建立在这些字符串算法的基础之上。",
          key_points: [
            "KMP算法：利用已匹配的前缀信息避免回溯，next数组存储最长相等前后缀长度，时间O(n+m)",
            "Trie字典树：用树结构存储字符串集合，共享前缀，适合前缀匹配、自动补全、拼写检查",
            "AC自动机：Trie + KMP的fail指针，多模式匹配，一次文本扫描找出所有模式串",
            "后缀数组：将所有后缀排序，可用于求最长公共前缀、不同子串个数等",
            "滚动哈希：Rabin-Karp算法，用哈希值快速比较字符串，用于模式匹配和查重"
          ],
          practice: "完成以下字符串算法实战：1）实现KMP算法：给定文本串和模式串，找出模式串在文本串中所有出现的位置，先手动计算next数组，再实现代码；2）实现Trie字典树：支持insert（插入单词）、search（查找单词）、startsWith（查找前缀）三个操作；3）实现滚动哈希Rabin-Karp：用哈希方法做模式匹配，对比KMP的性能差异；4）应用练习：实现一个简单的拼写检查器，用Trie存储字典，输入单词时给出推荐（编辑距离为1的单词）；5）经典题：实现strStr()、最长公共前缀。最后思考：在什么场景下用KMP，什么场景用Trie？",
          deep_dive: "深入理解字符串算法在NLP和搜索引擎中的应用：字符串算法是计算机科学中最经典的领域之一，也是NLP和搜索引擎的基础。在搜索引擎中，倒排索引（Inverted Index）是核心数据结构，而倒排索引的构建和查询都离不开字符串处理。在生物信息学中，DNA序列比对（BLAST算法）就用到了类似KMP的思想和动态规划。在NLP中，分词算法的最大匹配法、Trie树用于词典存储、AC自动机用于敏感词过滤。后缀自动机（Suffix Automaton）是更高级的字符串数据结构，能在线性时间内处理很多字符串问题，被称为'字符串算法的终极武器'。另外，布隆过滤器（Bloom Filter）也常用于字符串的存在性判断，空间效率极高但有一定误判率。在实际工程中，你很少需要从零实现这些算法，但理解它们的原理能帮你选择合适的工具和数据结构。比如，做前缀匹配选Trie，做多模式匹配选AC自动机，做子串查询选后缀数组或后缀自动机，做海量数据的存在性判断选布隆过滤器。掌握这些，你就能在面对字符串相关的系统设计时做出正确的技术选型。"
        }, duration: "2小时", resources: [{ title: "KMP算法详解", url: "https://leetcode.com/problems/implement-strstr/", required: true, type: "doc", source: "official" }, { title: "Trie树教程", url: "https://leetcode.com/problems/implement-trie-prefix-tree/", required: true, type: "doc", source: "official" }, { title: "字符串算法集合", url: "https://cp-algorithms.com/string/kmp.html", required: false, type: "doc", source: "other" }], checkpoint: "能独立实现KMP和Trie字典树" },
      { day: 18, title: "算法设计思想总结",
        summary: "系统总结分治、贪心、回溯、动规、二分等算法设计范式，形成完整的算法知识体系。", content: {
          objective: "今天你将系统总结所有算法设计思想，形成完整的算法知识体系。学完后你能根据问题特点快速判断应该用哪种算法思想，掌握各种算法范式的适用边界和典型问题，理解不同算法思想之间的联系和区别。这是算法学习从量变到质变的关键一步。",
          key_points: [
            "分治法：分解→解决→合并，典型问题有归并排序、快速排序、二分查找、汉诺塔",
            "贪心算法：每步局部最优期望全局最优，需证明正确性，典型问题有活动选择、哈夫曼编码",
            "回溯法：暴力搜索+剪枝，解决组合搜索问题，典型问题有全排列、组合、子集、N皇后",
            "动态规划：最优子结构+重叠子问题，自底向上或自顶向下，典型问题有LCS、背包、最短路",
            "算法选型策略：先看问题类型→再看数据规模→选择合适算法→验证边界情况"
          ],
          practice: "完成以下算法思想总结练习：1）制作一张算法思想对比表：包含分治、贪心、回溯、动规、二分、双指针、滑动窗口、BFS、DFS，每种思想的核心特点、适用场景、典型题目、时间复杂度特点；2）对5道不同类型的题目进行算法选型：给定题目描述，分析应该用哪种算法思想，为什么，写出解题思路（不需要写完整代码）；3）对比同一种问题的多种解法：比如最短路问题可以用BFS（无权）、Dijkstra（无负权）、Bellman-Ford（有负权）、Floyd（多源），对比各自的适用场景；4）总结你自己的解题模板：每种算法思想的代码框架、注意事项、常见坑点。最后思考：为什么说算法是一种思维方式，而不只是代码模板？",
          deep_dive: "深入理解算法思维的本质与进阶方向：学习算法的真正目的不是背多少道题，而是培养解决问题的思维方式。当你面对一个全新的问题时，你能否：1）快速理解问题的本质；2）判断问题的复杂度（是P问题还是NP问题）；3）设计出高效的解决方案；4）分析方案的时间空间复杂度；5）在无法得到最优解时退而求其次，找近似解或启发式解。这才是算法能力的真正体现。算法学习的进阶方向：1）计算复杂性理论：P vs NP、NP完全问题、可计算性理论，理解什么问题是计算机难以解决的；2）随机算法：蒙特卡洛方法、拉斯维加斯算法、随机快速排序，用随机性换时间或空间；3）近似算法：处理NP难问题，在可接受的时间内得到近似最优解，有近似比保证；4）在线算法：面对流式输入，不知道未来的数据，需要即时做出决策；5）并行算法：在多机多核环境下设计并行算法，考虑通信开销和负载均衡。对于AI开发者来说，算法思维尤其重要——设计新的模型结构、优化训练算法、设计高效的推理系统，都需要扎实的算法功底。持续学习，在实际项目中运用，算法能力就会不断提升。"
        }, duration: "2小时", resources: [{ title: "算法思想总览", url: "https://leetcode.com/explore/", required: true, type: "doc", source: "official" }, { title: "算法设计手册", url: "https://www.algorist.com/", required: false, type: "book", source: "other" }, { title: "经典算法题目分类", url: "https://github.com/youngyangyang04/leetcode-master", required: false, type: "repo", source: "github" }], checkpoint: "能说出至少6种算法设计范式的核心思想和典型应用" },
      { day: 19, title: "算法竞赛入门与训练方法",
        summary: "了解算法竞赛文化与训练方法，掌握科学的刷题策略，持续提升算法能力。", content: {
          objective: "今天你将了解算法竞赛的世界，掌握科学的刷题和训练方法。学完后你能了解主要的算法竞赛（ICPC、Codeforces、LeetCode周赛等），掌握循序渐进的刷题策略，知道如何避免无效刷题，制定自己的算法提升计划。算法能力是工程师的内功，需要持续修炼。",
          key_points: [
            "主要竞赛：ICPC/CCPC（团队赛，3人1机，5小时）、Codeforces（个人赛，2小时，Rating系统）、LeetCode周赛",
            "刷题策略：按题型分类刷而非按题号刷，先易后难，每道题吃透而不是追求数量",
            "训练方法：模拟赛+赛后补题+专题训练+写题解，注重质量而非数量",
            "时间管理：面试前集中刷2-3个月，平时保持每周3-5题的手感，定期复习",
            "推荐资源：LeetCode、Codeforces、AtCoder、洛谷、牛客网，各有侧重"
          ],
          practice: "完成以下算法训练规划：1）评估你当前的算法水平：在LeetCode上做10道Easy和5道Medium，统计正确率和耗时，了解自己的基础；2）制定一个3个月的算法提升计划：第一个月打基础（数据结构+简单算法），第二个月专题训练（DP、图论、字符串等），第三个月综合练习+模拟面试；3）选择一个适合你的刷题平台，注册账号，开始第一周的训练计划；4）建立你的算法笔记系统：按专题分类，每道题记录题目、思路、代码、注意事项、相似题目；5）参加一次LeetCode周赛或Codeforces比赛，体验真实的竞赛氛围，赛后把不会的题补完。最后思考：算法能力和工程能力的关系是什么？如何平衡两者的学习时间？",
          deep_dive: "深入理解算法能力在职业发展中的作用和正确心态：关于算法面试，行业内有很多讨论——有人认为算法面试筛选不出真正的工程能力，有人认为算法是基础中的基础。客观来看：1）算法是计算机科学的核心，扎实的算法功底能让你在面对复杂系统时更有底气；2）算法面试是大公司筛选候选人的有效方式，虽然不完美但相对公平；3）算法能力强的工程师，通常学习能力和逻辑思维也更强，这是用人单位看重的。但也要避免走入误区：1）不要为了刷题而刷题，理解思想比背代码重要；2）不要忽视工程能力，算法是内功，工程是外功，两者都要强；3）不要妄自菲薄，算法能力是可以训练的，大部分人通过2-3个月的集中训练都能达到不错的水平；4）不要停止学习，算法是需要长期保持手感的技能。对于AI开发者来说，算法尤其重要——你不仅要会用现成的框架和模型，更要理解背后的算法原理，甚至改进算法。最后送大家一句话：'算法和数据结构是程序员的内功，内功深厚的人，学什么都快。' 希望大家能享受算法学习的过程，在解决问题中获得成长。"
        }, duration: "1.5小时", resources: [{ title: "LeetCode", url: "https://leetcode.com/", required: true, type: "website", source: "official" }, { title: "Codeforces", url: "https://codeforces.com/", required: false, type: "website", source: "official" }, { title: "算法学习路线图", url: "https://neetcode.io/roadmap", required: false, type: "website", source: "other" }], checkpoint: "有了自己的算法学习计划和刷题方法" },
      { day: 20, title: "算法综合大作业与项目",
        summary: "完成一个算法综合项目，将所学算法应用到实际问题中，检验学习成果。", content: {
          objective: "今天你将完成一个算法综合大作业，把这四周学到的所有算法知识应用到一个实际项目中。学完后你能独立完成一个有一定复杂度的算法项目，从问题分析、算法选型、代码实现到性能优化的完整流程。这是对你四周算法学习成果的最好检验。",
          key_points: [
            "项目选题方向：路径规划、推荐系统、文本搜索引擎、游戏AI、数据可视化",
            "项目要求：至少用到3种不同的算法或数据结构，有清晰的问题定义和评估指标",
            "实现步骤：需求分析→算法选型→架构设计→代码实现→测试评估→优化改进",
            "评估维度：正确性、效率（时间/空间）、代码质量、可扩展性、文档完整性",
            "展示方式：README文档+代码仓库+演示Demo+技术博客"
          ],
          practice: "完成以下算法综合项目（四选一或自拟题目）：\n\n项目A - 智能路径规划系统：\n1）实现一个地图导航系统，支持点到点最短路径（Dijkstra/A*）；\n2）支持多约束路径规划（避开某些区域、最短时间vs最短距离）；\n3）可视化展示路径和地图；\n4）评估不同算法的性能差异。\n\n项目B - 简易文本搜索引擎：\n1）用Trie树+倒排索引构建一个简易搜索引擎；\n2）支持关键词搜索、前缀搜索、模糊搜索；\n3）对搜索结果排序（TF-IDF或简单的相关度计算）；\n4）测试搜索速度和准确率。\n\n项目C - 推荐系统原型：\n1）基于用户-物品二部图，实现基于图的推荐算法；\n2）支持协同过滤和基于内容的推荐；\n3）评估推荐效果（用简单的离线指标）；\n4）对比不同推荐算法的优劣。\n\n项目D - 游戏AI：\n1）实现一个小游戏（如五子棋、迷宫、贪吃蛇）；\n2）实现游戏AI（用 minimax+αβ剪枝、或强化学习、或搜索算法）；\n3）评估AI的难度和智能程度；\n4）尝试优化AI的性能。\n\n项目要求：\n- 完整的代码实现，有清晰的注释\n- README说明项目功能、架构、使用方法\n- 至少用到3种不同的算法/数据结构\n- 有性能测试和结果分析\n- 可以在本地运行并看到效果",
          deep_dive: "算法学习的终点是解决实际问题：学完这20天的算法课程，你已经掌握了算法和数据结构的核心知识。但真正的挑战在于——如何把这些知识应用到实际工作中？给大家几个建议：1）在项目中刻意运用：下次做项目时，先想一想这个问题可以用什么算法优化，而不是上来就写暴力解法；2）关注系统设计：算法是微观的，系统设计是宏观的，两者结合才能做出好的系统；3）持续学习进阶：机器学习算法、分布式算法、并行计算、编译优化，这些都是算法可以深入的方向；4）保持好奇心：遇到问题多问几个为什么，底层是怎么实现的？时间复杂度是多少？有没有更优的方法？对于AI开发者来说，算法思维尤其重要。你可能不需要每天写排序算法，但你需要理解：Transformer的注意力机制为什么是O(n²)复杂度？大模型的KV Cache是怎么优化推理速度的？分布式训练的AllReduce是怎么回事？这些问题的答案都建立在扎实的算法基础之上。最后，希望大家记住：算法不是目的，而是工具。重要的不是你会多少种算法，而是你能不能在恰当的时候选择恰当的算法，解决实际的问题。祝大家在算法的世界里玩得开心！"
        }, duration: "4小时", resources: [{ title: "算法项目灵感", url: "https://github.com/nadav-daniels/algorithms", required: false, type: "repo", source: "github" }, { title: "系统设计入门", url: "https://github.com/donnemartin/system-design-primer", required: false, type: "repo", source: "github" }], checkpoint: "完成一个算法综合项目并通过自己的测试" }
'''

print('  Filling cs-algo (14 -> 20 days)...')
content, ok = add_days('cs-algo', cs_algo_days, content)
if not ok:
    print('  FAILED: cs-algo')

write_file(content)
print('\nDone! cs-algo filled.')
print('Now run check-partial.py to verify.')
