# 题源候选台账

初始整理：2026-11-23。下列是交接索引的候选，不表示本轮已访问或验证原题。每次使用前补发布日期、届别、岗位及可见证据；未知字段保留未知。**本轮新增题数为 0。**

| URL / 索引 | 公司/届别（索引信息） | 性质 | 公开材料支持的范围 | 候选题型与分类 | 已用 / 后续动作 |
|---|---|---|---|---|---|
| https://www.nowcoder.com/discuss/802688503929655296 | 瑞芯微 26 | 笔经考点 | 现有索引列 Pulse CDC、adder、AXI 带宽、AHB 等；并非完整原卷 | RTL/数值/波形，04/06/07 | 已用 RK26 四题；原帖仍需重查后扩展其他方向 |
| https://www.nowcoder.com/feed/main/detail/8659c53cb8124313828d5f36f09357fd | 芯动科技 26 | 笔经考点 | CDC 电路/波形；其他细节待核 | 波形，04/cdc | 已用 INNO26 一题；串并方向先与现有串并题去重 |
| https://ac.nowcoder.com/discuss/837148 | 乐鑫旧届 | 笔经考点 | FIFO 深度与 80/50 MHz burst 线索；新相位为项目自定 | 数值，05/fifo-depth | 已用 ESP 一题；原帖此前访问受限，重查后再用 |
| https://www.nowcoder.com/feed/main/detail/905b6fd060b44871adb1a8654255e2f4 | 圣邦微 26 | 考试形式 | 仅手写简答/拍照形式 | 暂无技术候选 | 未用；禁止据此杜撰技术题 |
| https://www.nowcoder.com/feed/main/detail/767a62001bd04a23b961e6f2c3912072 | 新凯来，届别待核 | 笔经线索 | task、fanout、PLL、coverage 等待逐条重查 | 简答/推导，02/03/09/14 | 未用；先核实帖子原文 |
| https://www.nowcoder.com/discuss/353159350510362624 | 联发科旧届 | 笔经线索 | 时钟切换、时序、脚本等，参数未知 | 时序/简答，03/08/13 | 未用；需具体任务，避免只凭主题出“公司题” |
| https://www.nowcoder.com/discuss/490905319980224512 | 大疆旧届 FPGA | 笔经线索 | RTL、总线、CDC、FPGA 资源 | RTL/数值，04/07/14 | 未用；按能力去重后选择 |
| https://www.nowcoder.com/discuss/481038706426535936 | 星宸旧届 | 笔经线索 | signed/位宽、PPA、优化 | 仿真/多选，02/08 | 未用；位宽已有多题，优先实质新任务 |
| https://www.yhchub.com/数字前端数字IC笔试真题与解析.html | 不继承公司归因 | 练习汇编 | 按题号的公开知识方向 | 01–07 多题型 | 已用 24 题；对应 Q 号见两批审核，先查重 |
| https://yueanic.com/ic-interview/c/company-written | 逐条核实 | 分类入口 | 只用于发现可追溯来源 | 待定 | 未用；不能把分类页面当原卷证据 |
| https://cloud.tencent.com/developer/article/2194861 | 华为旧届，岗位待复查 | 求职复盘 | FPGA/逻辑方向，具体条件待核 | 14 | 未用；先核验原帖与年份 |
| https://onefly.top/zero2Leetcode/05_interview/coding/huawei-2027/ | 华为 2027，索引归类 | **面试**整理 | RTL 面试方向 | RTL，06 | 未用；永不标成线上笔试原题 |

新条目追加模板：URL｜访问日期/状态｜页面发布日期｜公司/届别/岗位证据｜笔试/面试/汇编｜原帖实际条件与任务（简述）｜题型/topic/subtopic｜现有题去重｜独立求解方式｜技术待确认点｜使用 ID 或拒绝原因。后续新增先走 [完整流程](QUESTION_SOURCING_WORKFLOW.md)。

## 进阶第一批实际使用记录（2026-11-23）

本次新增 8 道，台账原先“新增0”指教学升级基线。公开汇编对应方向及两份新增教学资料均实际打开；具体条件、波形与 RTL 独立构造。

| URL | 本次核对方向 | 使用 ID |
|---|---|---|
| https://www.yhchub.com/数字前端数字IC笔试真题与解析.html | Q43/Q49–55、Q73/Q76、Q83/Q85/Q86、Q88/Q91/Q92、Q118/Q119 | ADAPTED-ADVANCED-STA-0001/0002、CDC-0001、FIFO-0001/0002、AXI-0001 |
| https://www.cnblogs.com/yinhuachen/p/17325796.html | 握手流水线的 valid/data 保持与空位利用 | ADAPTED-ADVANCED-RTL-0001 |
| https://ee.ac.cn/index.php/archives/587.html | 第6题 Round Robin；不继承 lock 或公司归因 | ADAPTED-ADVANCED-RTL-0002 |

另打开瑞芯微原帖核对候选方向，本批没有新增引用该帖的题；既有题来源字段未改变。技术正确性与去重见 [审核](CONTENT_BATCH_05_ADVANCED.md)。

## 跨专题基础第一批实际使用（2026-11-23）

以下公开页面本次实际打开；仅使用主题，不转录其题面、数值或代码；教学资料不归于公司。

| URL | 使用 ID | 支持范围 |
|---|---|---|
| https://www.nowcoder.com/discuss/802688503929655296 | ADAPTED-FOUNDATION-POWER-0001 | 电压、频率与活动率一起变化后的总功耗；具体题设独立构造 |
| https://onlinedocs.microchip.com/oxy/GUID-8F0CC4C0-0317-4262-89CA-CE7773ED1931-en-US-13/GUID-34A62246-6CB9-47E1-A743-D3E10C3AEA25.html | ADAPTED-FOUNDATION-POWER-0002 | 门控时钟：为什么不能直接 clk AND en？；具体题设独立构造 |
| https://www.eecs.umich.edu/courses/eecs578/eecs578.f15/miniprojects/SVAproject/manuals/SVA_manual.pdf | ADAPTED-FOUNDATION-DV-0001 | SVA：多拍前件结束后从哪一拍检查？；具体题设独立构造 |
| https://verificationacademy.com/forums/t/ignore-bins-and-cross/41200 | ADAPTED-FOUNDATION-DV-0002 | Cross coverage：忽略一个组合后的覆盖率；具体题设独立构造 |
| https://yafengnju.github.io/ComputerOrganization/7-%E5%AD%98%E5%82%A8%E5%99%A8%E5%B1%82%E6%AC%A1%E7%BB%93%E6%9E%84(2).pdf | ADAPTED-FOUNDATION-ARCH-0001 | 直接映射 cache 的逐次冲突与命中；具体题设独立构造 |
| https://www.cise.ufl.edu/~mssz/CompOrg/CDA-pipe.html | ADAPTED-FOUNDATION-ARCH-0002 | 有限指令流的 CPI：别漏流水线填充；具体题设独立构造 |
| https://www.eecs.umich.edu/courses/eecs627/testability.html | ADAPTED-FOUNDATION-DFT-0001 | 四位 scan 链：沿前 SO 与沿后状态；具体题设独立构造 |
| https://www.eecs.umich.edu/courses/eecs627/testability.html | ADAPTED-FOUNDATION-DFT-0002 | Stuck-at-0：激活了故障还要传播出去；具体题设独立构造 |

完整技术核对及SVA/coverage原生仿真限制见 [本批审核](CONTENT_BATCH_06_FOUNDATION.md)。其他未成功打开的笔经未作为本批题源。

## 电路工具与FPGA第一批实际使用（2026-11-23）

下面页面均本次实际打开，仅用其教学/技术方向，条件独立构造，无公司归因。

| URL | 使用 ID | 候选方向 |
|---|---|---|
| https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/pages/c3/c3s1/ | ADAPTED-TOOLSFPGA-CMOS-0001 | 静态 CMOS NAND 的上下拉网络 |
| https://circuits.mit.edu/F26/psets/04/rc_tutorial | ADAPTED-TOOLSFPGA-CMOS-0002 | RC 延迟预算下最多能接几个负载？ |
| https://docs.python.org/3.10/library/re.html | ADAPTED-TOOLSFPGA-TOOLS-0001 | Python：统计混合单位的时序日志 |
| https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf | ADAPTED-TOOLSFPGA-TOOLS-0002 | C：替换寄存器位域而不破坏其他位 |
| https://docs.amd.com/r/en-US/ug953-vivado-7series-libraries/LUT4 | ADAPTED-TOOLSFPGA-FPGA-0001 | LUT INIT：真值表位序不能反过来 |
| https://docs.amd.com/r/en-US/ug573-ultrascale-memory-resources/Block-RAM-Summary | ADAPTED-TOOLSFPGA-FPGA-0002 | BRAM 拼接：总位数够不代表形状够 |
| https://www.probabilitycourse.com/chapter2/2_1_3_unordered_without_replacement.php | ADAPTED-TOOLSFPGA-PROB-0001 | 独立误码：四位中恰有一位翻转 |
| https://www.probabilitycourse.com/chapter2/2_1_3_unordered_without_replacement.php | ADAPTED-TOOLSFPGA-PROB-0002 | 不放回抽检：至少抽到一个坏件 |

Python参考代码实际运行、其他独立模型与未执行的物理实现范围见 [本批审核](CONTENT_BATCH_07_TOOLS_FPGA.md)。

## 核心进阶第二批已采用

- ADAPTED-CORE-STA-0001：重分配级间逻辑：最优频率不是总延迟倒数
- ADAPTED-CORE-CDC-0001：四相握手吞吐：两级同步后还要等状态机
- ADAPTED-CORE-AXI-0001：AXI4 INCR burst 的4 KB边界与AxLEN
- ADAPTED-CORE-AXI-0002：多个 outstanding read：哪种返回顺序不合法？
- ADAPTED-CORE-DV-0001：disable iff：复位中止后会续查旧请求吗？
- ADAPTED-CORE-DV-0002：组合覆盖100%，为什么加法器仍可能是错的？
- ADAPTED-CORE-DV-0003：Python scoreboard：跨ID乱序、同ID有序
- ADAPTED-CORE-DV-0004：dist范围权重：:/和:=的分母不同

公开来源链接、使用范围及独立验证见 [本批审核](CONTENT_BATCH_08_CORE.md)。

## 系统与实现第二批实际使用（2026-11-23）

下列链接本次实际访问，仅提炼技术方向；条件和参数独立构造。

| ID | 方向 | URL |
|---|---|---|
| ADAPTED-SYSTEM-POWER-0001 | 休眠盈亏平衡：低功率不等于低能量 | [公开资料](https://people.ee.duke.edu/~sorin/papers/islped09_power-gating.pdf) |
| ADAPTED-SYSTEM-POWER-0002 | Retention保住状态，为什么还需要Isolation？ | [公开资料](https://documentation-service.arm.com/static/63f3499c9567172d4e2aadd6?token=) |
| ADAPTED-SYSTEM-ARCH-0001 | Write-back cache：缺失次数与写回流量分开算 | [公开资料](https://www.cs.cornell.edu/courses/cs3410/2024fa/notes/caches.html) |
| ADAPTED-SYSTEM-ARCH-0002 | Amdahl加上搬运开销：局部三倍快能快多少？ | [公开资料](https://cvw.cac.cornell.edu/parallel/efficiency/amdahls-law) |
| ADAPTED-SYSTEM-DFT-0001 | 四条并行scan链：装载与卸载重叠后的测试周期 | [公开资料](https://www.eecs.umich.edu/courses/eecs627/testability.html) |
| ADAPTED-SYSTEM-DFT-0002 | XOR响应压缩：相同签名能证明无错吗？ | [公开资料](https://www.eecs.harvard.edu/~michaelm/postscripts/itc2004.pdf) |
| ADAPTED-SYSTEM-FPGA-0001 | MMCM配置：输出频率对了，VCO也一定合法吗？ | [公开资料](https://docs.amd.com/api/khub/documents/1kFbRqzm2fhwGy~cLQG2yA/content) |
| ADAPTED-SYSTEM-FPGA-0002 | 16项signed乘加：为什么19 bit还差一个值？ | [公开资料](https://docs.amd.com/api/khub/documents/gu4oRPFEh_Pm2uaAlfY6Kg/content) |

未采用：UNM旧bist1课件重定向到主页，无法核对正文。逐题支持范围与去重见 [本批审核](CONTENT_BATCH_09_SYSTEM.md)。

## 电路脚本与接口第二批实际使用（2026-11-23）

链接本次实际访问，仅取技术方向，条件独立构造。

| ID | 内容 | URL |
|---|---|---|
| ADAPTED-EXTENSION-I2C-0001 | I²C仲裁逐位推演：发送1却读到0时谁退出？ | [技术/教学来源](https://www.ti.com/lit/an/sbaa565/sbaa565.pdf) |
| ADAPTED-EXTENSION-I2C-0002 | I²C上拉：同时满足上升时间和灌电流 | [技术/教学来源](https://www.ti.com/lit/an/slva689a/slva689a.pdf) |
| ADAPTED-EXTENSION-CIRCUIT-0001 | 带负载分压：输出电阻不能忽略 | [技术/教学来源](https://www.ocw.mit.edu/courses/6-061-introduction-to-electric-power-systems-spring-2011/d79822ef5fbdb21b1c44e1b3b8282453_MIT6_061S11_ch1.pdf) |
| ADAPTED-EXTENSION-CIRCUIT-0002 | 有限脉冲的RC响应：下降段从哪个电压开始？ | [技术/教学来源](https://circuits.mit.edu/_static/S26/handouts/lec06a/slides.pdf) |
| ADAPTED-EXTENSION-TOOLS-0001 | Python读寄存器字节：字节序与signed要分别指定 | [技术/教学来源](https://docs.python.org/3.12/library/stdtypes.html#int.from_bytes) |
| ADAPTED-EXTENSION-TOOLS-0002 | 日志去重：保留最后值，并按最后出现顺序输出 | [技术/教学来源](https://docs.python.org/3.12/library/stdtypes.html#dict) |
| ADAPTED-EXTENSION-PROB-0001 | 测试报Fail后，芯片真的有缺陷的概率 | [技术/教学来源](https://faculty.washington.edu/yenchic/20A_stat512/Lec1_probability.html) |
| ADAPTED-EXTENSION-PROB-0002 | 最多三次重试：完成时间不能直接套无限几何分布 | [技术/教学来源](https://ocw.mit.edu/courses/6-436j-fundamentals-of-probability-fall-2018/f6a391ad22d454dea0903bb72eb58728_MIT6_436JF18_lec06.pdf) |

N1570/GNU位移手册本次超时未采用；UW PDF无可读正文，使用同校公开HTML课程。范围与去重见 [本批审核](CONTENT_BATCH_10_EXTENSION.md)。

## RTL与协议第三批实际采用（2026-11-23）

下列链接本次实际访问，仅支持方向；不继承原参数或公司归因。

| ID | 任务 | URL |
|---|---|---|
| ADAPTED-CORE3-SV-0001 | Indexed part-select：加号指定索引方向，不是加数值 | [公开技术/教学来源](https://verificationacademy.com/forums/t/indexed-part-select-referencing-different-width-expr-values/33180) |
| ADAPTED-CORE3-SV-0002 | 同样是>>>：左操作数unsigned时会补符号吗？ | [公开技术/教学来源](https://chromium.googlesource.com/external/github.com/google/styleguide/+/HEAD/verilogguide.md) |
| ADAPTED-CORE3-MEM-0001 | 双口BRAM碰撞：两个写口没有默认赢家 | [公开技术/教学来源](https://docs.amd.com/r/en-US/ug573-ultrascale-memory-resources/Address-Collision) |
| ADAPTED-CORE3-MEM-0002 | 交错bank调度：四个bank不代表八请求两拍完成 | [公开技术/教学来源](https://capra.cs.cornell.edu/seashell/docs/banking.html) |
| ADAPTED-CORE3-RTL-0001 | 4位饱和credit计数器：同时增减与端点优先级 | [公开技术/教学来源](https://hdlbits.01xz.net/wiki/Cs450/counter_2bc) |
| ADAPTED-CORE3-APB-0001 | APB4字节写使能：PSTRB如何合并寄存器 | [公开技术/教学来源](https://documentation-service.arm.com/static/63fe2c1356ea36189d4e79f3?token=) |
| ADAPTED-CORE3-UART-0001 | UART累计采样漂移：周期误差上界不等于器件容差 | [公开技术/教学来源](https://onlinedocs.microchip.com/oxy/GUID-D364745C-8255-47AE-9528-9EB17646EE19-en-US-18/GUID-2966F8A6-816E-45CF-87A6-FB4C876E377D.html) |
| ADAPTED-CORE3-SPI-0001 | SPI Mode 3：首个下降沿后才准备首位 | [公开技术/教学来源](https://onlinedocs.microchip.com/oxy/GUID-6F1B86DC-C230-43D1-A405-0CC2E7EDF7EE-en-US-2/GUID-EAC2D943-F395-4D47-98C8-4EEBC798BFA2.html) |

独立模型、RTL/SV原生验证及限制见 [本批审核](CONTENT_BATCH_11_CORE.md)。MIT托管IEEE标准PDF过大，未作为完整读取来源。

## Cache小补充（2026-11-23）

实际访问 https://www.cs.cornell.edu/courses/cs3410/2024fa/notes/caches.html ，仅使用LRU与多级AMAT方向；独立构造ADAPTED-MINI-CACHE-0001/0002。去重和验证见 [审核](CONTENT_BATCH_12_CACHE_MINI.md)。

## 高频任务与汇编补充（2026-11-23）

新增ADAPTED-FOCUSED系列18题。先按招聘记录缺口完成FSM/FIFO/task，再提炼Q25/30/33/39/49/50/52/94/95/103/107/108/110/111/113/121/122/123/125/126/127/128/132等方向。精确逐题来源以各题note为准，不把方向涉及算完整覆盖。全132条处理见 [覆盖对照](SOURCE_COLLECTION_COVERAGE.md)，技术与实际运行边界见 [本批审核](CONTENT_BATCH_13_FOCUSED.md)。

2026-11-24：Q61/Q83/Q118已按完整条件重构，共6题，见 [完整接口批次](CONTENT_BATCH_14_INTEGRATION.md)。原汇编页面已重新打开；技术依据使用AMD命令参考、Arm依赖说明及设计作者文章。参数、地址、复位及测试序列由本题独立规定。

2026-11-24：补Q113读beat交织及Q127可配置阈值去抖；新增明确相位、双向同步与不重试源的FIFO容量模型，未把Q88–93都标完成。汇编实际重新访问；Arm读顺序与AMD FIFO标志延迟分别作为技术核对。见 [批次审核](CONTENT_BATCH_15_BOUNDARY.md)。

2026-11-24：Q16补完整边沿RTL；Q4/5用完整单驱动程序补观察区域；Q80纠正同步复位自动安全的绝对说法；Q9/12明确FSM函数依赖与过程组织。重新访问汇编，技术核对AMD复位/FSM文档和Verification Academy原作者调度答复。见 [批次审核](CONTENT_BATCH_16_SAMPLING.md)。

2026-11-24：补Q22参数化双向Gray及Q24完整偶分频；Q128补明确抽象封装与片组地址拆分；Q132补偶校验但仍保留部分覆盖。汇编已重新访问，技术方向核对设计作者Gray公式、AMD时钟/归约运算和Infineon异步SRAM引脚说明，未假冒真实器件引脚数。见 [审核](CONTENT_BATCH_17_CODEC.md)。
