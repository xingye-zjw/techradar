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
print('Filling electronics track (elec-pcb)...')

elec_pcb_days = '''
      { day: 8, title: "PCB可制造性设计DFM",
        summary: "掌握PCB可制造性设计（DFM）原则，确保设计的板子能顺利生产且成本合理。", content: {
          objective: "今天你将学习PCB可制造性设计（DFM）。学完后你能理解DFM的重要性，掌握走线、过孔、焊盘、阻焊、丝印等各环节的设计规范，知道怎么设计既能满足功能又便于制造、成本合理的PCB。DFM是从「能画出来」到「能量产」的关键一步。",
          key_points: [
            "DFM概念：面向制造的设计，在设计阶段就考虑制造工艺的要求，减少生产问题、提高良率、降低成本",
            "走线规范：线宽线距（根据电流、工艺能力、阻抗要求选，常用6/6mil、8/8mil）、走线长度、差分对、阻抗控制",
            "过孔设计：过孔类型（通孔、盲孔、埋孔）、过孔大小（常用8/16mil、10/20mil）、过孔盖油/塞孔、Via stitching（地孔阵列）",
            "焊盘设计：SMT焊盘尺寸（根据器件手册推荐）、通孔焊盘（孔径比焊盘小0.2-0.3mm）、热焊盘（Thermal Relief）防止虚焊",
            "成本因素：层数（越多越贵）、板子尺寸、最小线宽线距、过孔类型、表面工艺、特殊工艺（阻抗、盲埋孔、厚铜等）"
          ],
          practice: "完成以下PCB DFM实践：1）线宽线距练习：假设你使用的PCB厂家工艺能力是：最小线宽4mil、最小线距4mil、最小过孔0.2mm/0.45mm。你的设计中普通信号用6/6mil是否可行？电源线用16mil能否通过1A电流？（查一下铜厚1盎司时，不同线宽的载流能力）2）过孔设计：什么时候用通孔？什么时候用盲埋孔？盲埋孔为什么贵？画一个四层板的过孔类型示意图（通孔、L1-L2盲孔、L2-L3埋孔、L3-L4盲孔）；3）SMT焊盘：找一个0603电阻、一个SOT-23三极管、一个QFP-48芯片的数据手册，看看它们推荐的焊盘尺寸是多少，为什么焊盘尺寸要和器件匹配？太大太小分别有什么问题？（锡桥、虚焊、立碑等）4）成本估算：对比一下不同设计的PCB打样成本——2层板 vs 4层板 vs 6层板；线宽线距从8mil降到4mil会贵多少？加阻抗控制贵多少？用沉金工艺比喷锡贵多少？你可以上几个PCB打样网站（嘉立创、捷配、华秋等）估算一下；5）DFM检查清单：列出一份你自己的PCB DFM检查清单——设计完成后要检查哪些项目？（比如：线宽线距够不够、过孔大小合不合理、焊盘尺寸对不对、有没有开路短路、DRC有没有报错、丝印会不会盖住焊盘、加工文件有没有齐等等）6）思考：为什么PCB设计要考虑DFM？不考虑的话可能会有什么后果？（打样失败、成本高、良率低、生产周期长）",
          deep_dive: "深入理解PCB制造工艺与先进技术：PCB设计不仅仅是把线连起来就行，你需要了解板子是怎么造出来的，才能设计出好的PCB。让我们了解一下PCB的制造流程和先进技术：1）PCB制造流程简述：开料→内层图形转移→内层蚀刻→内层AOI→压合→钻孔→沉铜（孔金属化）→外层图形转移→外层电镀→外层蚀刻→外层AOI→阻焊→丝印→表面处理→成型（V-CUT/锣板）→电测→终检→包装。20多道工序，每道工序都有设计规则要求；2）层叠结构设计：多层板的层叠很重要，不是随便堆的。要考虑：电源层和地层的位置（尽量靠近，形成去耦电容）、信号层的参考平面（每个信号层最好有相邻的参考平面）、阻抗控制、对称性（防止翘曲）。4层板常用叠构：Top-GND-PWR-Bottom 或者 Top-GND-SIG-Bottom；3）阻抗控制：高速信号（USB、DDR、HDMI、PCIe等）需要控制特性阻抗（通常50Ω单端、90Ω/100Ω差分），这和走线宽度、介质厚度、介电常数、参考平面都有关系。阻抗不连续会导致信号反射、影响信号完整性；4）高速PCB设计：当信号上升沿很快、频率很高时，PCB就不是简单的连线了，要考虑传输线效应、阻抗匹配、串扰、EMI、电源完整性等问题。高速PCB设计是一个专门的领域，需要懂信号完整性（SI）和电源完整性（PI）；5）先进PCB技术：HDI（高密度互连）板——用激光钻孔、盲埋孔实现更高密度；柔性PCB（FPC）——可以弯曲，用在手机、手表等紧凑设备；刚柔结合板；厚铜板（大电流电源用）；金属基PCB（LED、电源用，散热好）；6）AI与PCB设计：AI也开始应用在PCB设计领域了——自动布线（比传统的自动布线器更智能）、自动布局、EMC仿真优化、可制造性检查、故障检测等。EDA工具也在往智能化方向发展。对于AI工程师来说，PCB设计可能不是核心技能，但如果你要做硬件、做机器人、做边缘AI设备，了解PCB设计的基本知识还是很有用的——至少你能看懂原理图、能和硬件工程师有效沟通、能自己做一些简单的板子。"
        }, duration: "2小时", resources: [{ title: "PCB DFM指南", url: "https://www.pcbway.com/blog/PCB_Design_Guide/PCB_Design_for_Manufacturability__DFM_.html", required: true, type: "article", source: "other" }, { title: "IPC标准", url: "https://www.ipc.org/", required: false, type: "website", source: "official" }, { title: "PCB制造流程", url: "https://www.electronics-tutorials.ws/articles/pcb-manufacturing-process.html", required: false, type: "article", source: "other" }], checkpoint: "能列出PCB DFM设计的主要检查项，知道哪些因素影响PCB成本" },
      { day: 9, title: "PCB信号完整性与EMC设计",
        summary: "理解信号完整性基本概念，掌握PCB设计中减少EMI、提高抗干扰能力的方法。", content: {
          objective: "今天你将学习PCB信号完整性（SI）和EMC设计。学完后你能理解什么是信号完整性问题（反射、串扰、时序），掌握PCB分层和布线的EMC设计原则，知道怎么设计出更稳定、抗干扰能力更强的PCB。对于频率较高或者电路较复杂的设计，这些知识非常重要。",
          key_points: [
            "信号完整性（SI）：信号在传输线上的质量问题——反射（阻抗不匹配）、串扰（相邻线之间的耦合）、时序（信号到达时间不对）、电源噪声",
            "反射与阻抗匹配：传输线阻抗不连续就会有反射，振铃、过冲、下冲都是反射引起的；匹配方式有串联端接、并联端接等",
            "串扰：相邻走线之间的电容耦合和电感耦合，导致一根线上的信号耦合到另一根线上；减少串扰的方法：增加间距、减少平行长度、提供参考平面",
            "PCB EMC设计要点：分层设计（地平面很重要）、减小回路面积、高速信号包地、电源去耦、屏蔽设计、滤波设计",
            "电源完整性（PI）：电源分配网络（PDN）的设计，确保芯片引脚处的电压稳定、纹波噪声小；去耦电容是关键"
          ],
          practice: "完成以下信号完整性与PCB EMC实践：1）反射原理理解：为什么会有信号反射？什么时候需要考虑传输线效应？（一般来说，走线长度大于信号上升沿对应波长的1/10就要考虑）假设信号上升沿是1ns，在FR4板材中（传播速度约6英寸/ns，即15cm/ns），多长的走线需要考虑阻抗控制？2）减少串扰：画两条相邻的平行走线，说明串扰是怎么产生的（电场耦合和磁场耦合）；列举至少5种减少串扰的方法——增加走线间距、减少平行长度、使用不同层、中间加地线（包地）、选择合适的参考平面；3）去耦电容：电源引脚旁边为什么要放去耦电容？去耦电容的作用是什么？（提供瞬时电流、减小电源阻抗、滤除噪声）为什么常常同时放0.1uF和10uF两种电容？（大电容储能、小电容滤高频）放的位置有什么讲究？（越靠近芯片电源引脚越好）4）地平面的重要性：为什么完整的地平面很重要？（提供低阻抗返回路径、减小回路面积从而减小EMI、减少串扰、有助于阻抗控制）什么情况下不能随便在地平面上开槽？5）EMC设计清单：列出一份PCB EMC设计的检查清单——至少从以下几个方面考虑：分层与叠构、布局、布线、电源、接地、滤波、屏蔽、接口；6）思考：为什么模拟地和数字地要分开？最后又为什么要连在一起？（单点接地，防止数字噪声串到模拟部分；不连的话两地之间有电位差，反而容易出问题）",
          deep_dive: "深入理解高速PCB设计与信号完整性：当电路的工作频率达到几百MHz、上升沿达到亚纳秒级别时，PCB设计就从一个「布线问题」变成了一个「电磁学问题」。高速PCB设计是一个非常专业的领域，核心是信号完整性（SI）、电源完整性（PI）和电磁兼容（EMC）。让我们了解一些进阶知识：1）传输线理论：当走线足够长时，它就不再是理想的导线，而是一根传输线，信号在上面以波的形式传播。常见的传输线结构有微带线（表层走线，一边是参考平面）和带状线（内层走线，上下都是参考平面）。传输线有特性阻抗（常用50Ω），阻抗必须匹配，否则就有反射；2）信号完整性问题的影响：SI问题会导致什么？——误码率上升（数据传错）、时序裕量减小（可能跑不到标称频率）、EMI增大（辐射超标）、甚至系统死机。越是高速的系统，SI问题越严重；3）电源完整性（PI）：芯片切换电流时，电源引脚上的电压会有波动（电压跌落/地弹），如果波动太大，芯片就可能工作不正常。PI设计就是要设计一个低阻抗的电源分配网络（PDN），在整个工作频率范围内，电源阻抗都低于目标阻抗。方法包括：使用电源平面、合理放置去耦电容（数量、容值、位置）、优化VRM（电压调整模块）设计；4）EMC设计的三个层次：a）器件级：芯片本身的EMI特性；b）板级：PCB的EMC设计；c）系统级：屏蔽、滤波、接地、结构设计。好的PCB设计可以解决大部分EMC问题，比后期靠屏蔽和滤波成本低得多；5）仿真工具：高速PCB设计离不开仿真——SI仿真（看信号波形、眼图）、PI仿真（看电源阻抗、电压波动）、EMI仿真（看辐射情况）、热仿真（看温度分布）。常用的仿真工具有ADS、HFSS、Sigrity、HyperLynx、Allegro等；6）AI在SI/PI中的应用：AI也开始进入这个领域——用机器学习快速评估信号完整性、自动优化PCB布局布线、加速电磁仿真、智能生成去耦电容方案等等。对于AI工程师来说，即使你不做硬件，了解信号完整性和EMC的基本概念也是有价值的——做硬件加速、边缘计算、机器人，最终都要落到PCB上。而且，电磁学、信号处理这些知识，和AI也是可以交叉的。"
        }, duration: "2.5小时", resources: [{ title: "信号完整性入门", url: "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-14/introduction-to-transmission-lines/", required: true, type: "tutorial", source: "other" }, { title: "PCB EMC设计指南", url: "https://www.analog.com/en/technical-articles/emc-design-techniques-for-pcb-layout.html", required: false, type: "article", source: "other" }, { title: "电源完整性基础", url: "https://www.allaboutcircuits.com/technical-articles/introduction-to-power-integrity/", required: false, type: "article", source: "other" }], checkpoint: "能说出3种以上信号完整性问题和对应的解决方法，知道PCB EMC设计的关键原则" },
      { day: 10, title: "PCB综合项目：四轴飞控板设计",
        summary: "设计一个四轴飞行器的飞控板PCB，综合运用电路原理、数字电路、PCB设计等知识。", content: {
          objective: "今天你将完成一个PCB综合项目——四轴飞行器飞控板设计。通过这个项目，你会把这两周学到的电路原理、模拟电路、数字电路、单片机、PCB布局布线、DFM等知识融会贯通。飞控板是无人机的「大脑」，集成了MCU、传感器、电源、通信等，是很好的综合练习项目。",
          key_points: [
            "飞控板功能：姿态感知（IMU）、飞行控制（MCU运行控制算法）、电机驱动输出、遥控信号接收、与地面站通信、供电",
            "核心器件：主控制器（STM32F4/F7/H7或ESP32）、六轴IMU（MPU6050/ICM20602等）、气压计（MS5611/BMP280）、磁罗盘（可选）",
            "接口：PWM输出（接电调）、SBUS/PPM输入（接接收机）、USB接口、串口（GPS/数传）、I2C/SPI、LED、按键",
            "电源系统：锂电池输入（3S/4S）→ 稳压（5V给外设、3.3V给MCU和传感器）、电源监测（电压检测）、反接保护",
            "设计重点：传感器布局（IMU要放中心、远离振动源）、电源完整性、信号完整性、EMC、可制造性"
          ],
          practice: "设计一个四轴飞控板PCB，要求如下：\n\n项目要求：\n设计一个中等复杂度的四轴飞行器飞控板，实现基本的飞行控制功能。\n\n功能需求：\n1）主控：STM32F405或同级别单片机（你可以选其他你熟悉的MCU）\n2）传感器：\n   - 六轴IMU（加速度计+陀螺仪）\n   - 气压计（高度测量）\n   - 可选：磁罗盘（航向测量）\n3）接口：\n   - 4路PWM输出（接电调控制电机）\n   - 遥控输入（SBUS/PPM）\n   - 2-3个UART（GPS、数传、调试）\n   - USB接口（参数配置、固件烧录）\n   - I2C扩展接口\n   - 几个LED（电源、状态）\n   - 按键（复位、功能键）\n4）电源：\n   - 输入：3S锂电池（11.1V-12.6V）\n   - 输出：5V/2A、3.3V/500mA\n   - 电压检测（测量电池电压）\n   - 反接保护\n\n设计步骤（必做）：\n1）原理图设计：\n   a）根据功能需求，确定所有需要的芯片和外围器件\n   b）画最小系统（MCU电源、复位、晶振、下载接口）\n   c）画传感器电路（IMU、气压计）\n   d）画电源电路（稳压芯片、滤波、反接保护、电压检测）\n   e）画接口电路（PWM输出、UART、USB、LED、按键）\n   f）检查原理图连接、做ERC检查\n\n2）PCB设计：\n   a）确定板子形状和尺寸（建议圆形或方形，30-50mm）\n   b）元器件布局：\n      - IMU放板子中心，尽量靠近MCU，远离电机和振动源\n      - 电源部分集中在一侧，和模拟传感器分开\n      - 接口放在板子边缘，方便接线\n      - 晶振靠近MCU，下面不要走线\n   c）分层：建议4层板（顶层-地-电源-底层）或至少2层板加完整地平面\n   d）布线注意事项：\n      - 电源走线要粗（根据电流）\n      - 信号线尽量短，高速信号（SPI等）注意等长和阻抗\n      - 模拟信号（如果有）要和数字信号分开\n      - 每个电源引脚都加去耦电容，尽量靠近引脚\n      - 地平面要完整，尽量少开槽\n   e）DRC检查：确保没有违反设计规则\n   f）丝印：标号清晰、方向一致、有板子名称和版本号\n\n3）输出文件：\n   a）Gerber文件（光绘文件，给PCB厂的）\n   b）BOM表（物料清单）\n   c）装配图（坐标文件，贴片机用）\n   d）原理图PDF\n\n进阶内容（选做）：\n1）加更多功能：SD卡（黑匣子）、蜂鸣器、摄像头接口、ESC遥测\n2）高速信号：如果用USB 2.0或高速SPI，考虑阻抗控制\n3）仿真：做简单的电源完整性或信号完整性仿真\n4）散热：考虑大电流器件的散热\n5）可靠性：增加冗余设计、故障检测功能\n\n项目要求：\n- 完整的原理图和PCB源文件（或详细设计文档）\n- BOM表（带型号、封装、数量）\n- DFM检查报告\n- 设计说明（设计思路、注意事项、改进点）\n\n完成后，思考一下：飞控板的设计难点在哪里？哪些因素会影响飞行稳定性？如果让你做第二版，你会怎么改进？",
          deep_dive"从飞控板看嵌入式系统的硬件架构：飞控板虽然小，但它是一个非常典型的嵌入式系统——有MCU、有传感器、有执行器接口、有通信、有电源。几乎所有嵌入式系统都遵循类似的架构。让我们从系统的角度回顾一下：1）感知层（输入）：各种传感器把物理量转换成电信号——IMU测加速度和角速度、气压计测气压（高度）、磁罗盘测航向、GPS测位置、电压传感器测电池电压。这些传感器通过I2C、SPI、UART等接口和MCU通信；2）处理层（核心）：MCU是系统的大脑，负责：读取传感器数据→做数据融合（姿态解算）→运行控制算法（PID等）→输出控制指令。还负责通信、日志、故障检测等等；3）执行层（输出）：MCU输出的控制信号，去驱动执行器——PWM信号去电调→电调驱动电机→电机带动螺旋桨产生推力。还有LED、蜂鸣器等指示设备；4）通信层：和外界交换信息——接收遥控信号、和地面站通信（数传/WiFi/蓝牙）、GPS定位；5）电源层：给整个系统供电——从电池取电→稳压→给各个模块供电。电压有高有低（电池电压、5V、3.3V等）。这五层架构，不仅适用于飞控板，也适用于几乎所有的嵌入式系统和智能硬件——手机、手表、路由器、工业控制器、机器人、自动驾驶汽车，都是类似的架构，只是更复杂而已。对于AI工程师来说，理解硬件架构很重要——你的算法最终要跑在硬件上，硬件的性能、功耗、成本，直接决定了算法能做到什么程度。比如在边缘设备上跑AI，你就得考虑算力够不够、内存够不够、功耗会不会太大、成本能不能接受。软硬结合，才能做出真正优秀的产品。"
        }, duration: "4小时", resources: [{ title: "开源飞控项目Betaflight", url: "https://github.com/betaflight", required: false, type: "repo", source: "github" }, { title: "STM32飞控设计参考", url: "https://www.st.com/en/applications/drones-and-robotics.html", required: false, type: "website", source: "official" }, { title: "PCB设计进阶", url: "https://www.analog.com/en/education/education-library/technical-articles.html", required: false, type: "website", source: "other" }], checkpoint: "完成四轴飞控板的原理图和PCB设计，输出完整的设计文件" }
'''

print('  Filling elec-pcb (7 -> 10 days)...')
content, ok = add_days('elec-pcb', elec_pcb_days, content)
if not ok:
    print('  FAILED: elec-pcb')

write_file(content)
print('\nDone! elec-pcb filled.')
print('Electronics track completed!')
