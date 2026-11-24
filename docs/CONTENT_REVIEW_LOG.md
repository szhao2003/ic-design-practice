# 2026-11-23 教学内容逐题复查

基线：21e6761，74 题（交接文档的 62 题为旧统计）。本轮仍为 74 题，全部解释与版本已更新为 v2。

- 74 道重写或扩展 explanationMd；其中 24 道同时扩写独立选项解析，20 道更换/补充易错点，17 道整理人工参考答案。16 个旧占位易错点全部移除。
- 题面、标题、选项文本、正确选项/数值/判断、评分点、分类与来源字段均与基线逐字段比较一致；没有重新定义答案。纯格式而无教学文本变化的题为 0；已较完整题保留数学主体并解释术语/改善排版，其余补推导和反例。
- 7 道 RTL 保持题定功能，展开完整模块、分段与功能注释；CDC/reset 添加实现意图属性 ASYNC_REG。参考模块独立存档并由脚本校验与网页代码逐字一致。不是对用户提交代码的自动判分。
- 未改变 IndexedDB schema、事件或快照合同；旧轮次保留旧版，重做才使用 v2。不存在清空、覆盖或用新答案重判旧历史的迁移。

## 前后对照

| 例题 | 之前 | 现在 |
|---|---|---|
| ORIGINAL-LOGIC-0003（单选） | 错项 B 仅说是 XNOR | 按 A=0/1 分支推 D0/D1，每个错项有分支和具体反例 |
| ORIGINAL-STA-0003（数值） | 一段连续算式 | 解释 tCQ,min 和同沿 hold，列 arrival=0.30、required=0.45、slack=−0.15 ns，说明降频无效 |
| ORIGINAL-RTL-0001（Coding） | 密集参考代码和简短说明 | 完整模块与每拍清 tick 注释，9→0 后停顿的边界表，独立 TB |
| ORIGINAL-AXI-0001（多选） | 概述 VALID 保持 | 三周期背压表、何时握手/何时可更新、死锁反例和通道独立边界 |

## 每题记录

下表记录本轮实际教学改动与技术复查方法；verified 不代表公司原题认证。既有独立数学/波形测试继续运行；RTL 的执行证据与覆盖边界另见 [本轮验收](CONTENT_UPGRADE_V15.md)。来源仅支持考点的边界未改变。

| ID | 类型 | 版本 | 本轮解析重点 | 核对方法 |
|---|---|---|---|---|
| ORIGINAL-LOGIC-0001 | multiple_choice | 1→2 | 答案：A、C。 本题只有二值输入，列出 A=0、1 就能穷尽全部情况。`&` 要两边都为 1 才为 1；`/` 只要一边为 1 就为 1；`^` 在两边不同时为 1。 | 二值枚举/编码范围/分支反例 |
| ORIGINAL-LOGIC-0002 | numeric | 1→2 | 答案：219，位模式为 `11011011`。 问题不是求 -37 的绝对值，而是把同一组 8 bit 改按无符号数解释。 | 二值枚举/编码范围/分支反例 |
| ORIGINAL-LOGIC-0003 | single_choice | 1→2 | 答案：A，D0=B、D1=~B。 多路器由选择位决定走哪条数据支路：`Y=S?D1:D0`。题目把 S 接到 A，因此先固定 A，再决定需要送进哪一个数据端。 | 二值枚举/编码范围/分支反例 |
| ORIGINAL-LOGIC-0004 | numeric | 1→2 | 答案：10 bit。 有符号补码把最高位用于带负权重的编码，因此不能直接按无符号的 0…511 来判断。 | 二值枚举/编码范围/分支反例 |
| ORIGINAL-LOGIC-0005 | single_choice | 1→2 | 答案：A，即 1、0、0。 高电平透明锁存器在 EN=1 的整个时间段内跟随 D；它不是只在 EN 上升沿采一次的触发器。 | 二值枚举/编码范围/分支反例 |
| ORIGINAL-LOGIC-0006 | multiple_choice | 1→2 | 答案：A、B。 先区分稳定逻辑值和门延迟下的瞬态行为。B=C=1 时，理想函数变成 `F=A+~A=1`，所以 A 翻转前后都应为 1。 | 二值枚举/编码范围/分支反例 |
| ORIGINAL-LOGIC-0007 | short_answer | 1→2 | 如何得到这两个积项。 最小项编号按 ABC 从高到低排列，相邻合并必须恰好只差一位。m0=000 与 m2=010 只差 B，所以 B 可以消去，留下 `~A~C`；m6=110 与 m7=111 只差 C，所以留下 `AB`。 | 二值枚举/编码范围/分支反例 |
| ADAPTED-YHC-LOGIC-0001 | numeric | 1→2 | 答案：8 bit，即 UQ(3,5)。 I 是整数位数，F 是小数位数；这里无符号，不另加符号位。 | 二值枚举/编码范围/分支反例 |
| ADAPTED-YHC-LOGIC-0002 | numeric | 1→2 | 答案：1005。 要分两次解释位串，不能把符号扩展和无符号转换混成一次操作。 | 二值枚举/编码范围/分支反例 |
| ORIGINAL-SV-0001 | true_false | 1→2 | 答案：错误。 组合逻辑需要在每次执行时为输出确定新值。题目只写了 en=1 的分支，en=0 时没有任何语句更新 q，所以语义上要求 q 记住上一次的值。 | 事件调度/四态与尺寸规则逐项分析 |
| ORIGINAL-SV-0002 | single_choice | 1→2 | 答案：A，(a,b)=(0,1)。 `<=` 先计算本条语句右边的值，再安排 NBA 区更新。第二行不会读到第一行尚未写入的新 a。 | 事件调度/四态与尺寸规则逐项分析 |
| ORIGINAL-SV-0003 | waveform_analysis | 1→2 | 结果为 1、0、1。 本题只有一个顺序进程写 q，因此可以按进程内的执行顺序确定最终安排。 | 事件调度/四态与尺寸规则逐项分析 |
| ORIGINAL-SV-0004 | single_choice | 1→2 | 答案：B，依次是 X、0。 先比较每一位：a=10x1 与 b=1001 的已知位都一致，只有第三位的 X 与 0 无法确定。 | 事件调度/四态与尺寸规则逐项分析 |
| ORIGINAL-SV-0005 | multiple_choice | 1→2 | 答案：A、C、D。 s、u 的 8 位模式都是 11111111；区别在于 s 声明为 signed，解释成 -1，u 则解释成无符号 255。 | 事件调度/四态与尺寸规则逐项分析 |
| ORIGINAL-SV-0006 | numeric | 1→2 | 答案：42。 `{3{p}}` 是把 p 的位串复制三份后拼接，不是把 p 的数值乘以 3。 | 事件调度/四态与尺寸规则逐项分析 |
| ORIGINAL-SV-0007 | short_answer | 1→2 | 把最高位单独拿出来比较就能看清差别。 选择值是 x1，分支模式是 1?；低位 ? 可以匹配任意位，关键是高位 X 是否能被当作通配。 | 事件调度/四态与尺寸规则逐项分析 |
| ORIGINAL-SV-0008 | single_choice | 1→2 | 答案：A，(0101,0,1,0)。 `~` 是逐位运算，保留四位宽度；前缀归约运算 `&a`、`/a`、`^a` 则把所有位合成一个 bit。 | 事件调度/四态与尺寸规则逐项分析 |
| ORIGINAL-SV-0009 | single_choice | 1→2 | 答案：A，释放后先保持 0，下一上升沿 NBA 后变为 1。 敏感事件只有 `posedge clk` 与 `negedge rst_n`。 | 事件调度/四态与尺寸规则逐项分析 |
| ADAPTED-YHC-SV-0001 | short_answer | 1→2 | 关键是两个进程没有共同规定的先后。 在一个进程内，阻塞赋值立即更新变量；另一进程随后读取时可能已经读到这个新值。 | 事件调度/四态与尺寸规则逐项分析 |
| ADAPTED-YHC-SV-0002 | single_choice | 1→2 | 答案：A。 t=1 ns 的 sel 下降沿会唤醒过程，当时选择 b=0，所以 y=0。t=3 ns 只有 b 改变，但显式敏感列表中没有 b，过程不会再次执行；t=4 ns 的 RTL y 因而仍为 0。 | 事件调度/四态与尺寸规则逐项分析 |
| ADAPTED-YHC-SV-0003 | multiple_choice | 1→2 | 答案：A、C。 看初始化能否落地，必须先看目标资源与流程保证，而不是只看 HDL 中有没有 initial 形式。 | 事件调度/四态与尺寸规则逐项分析 |
| ORIGINAL-STA-0001 | numeric | 1→2 | 答案：+1.5 ns（+1500 ps），满足题设的 setup 检查。 | 到达时刻、预算和边沿独立代入 |
| ORIGINAL-STA-0002 | numeric | 1→2 | 答案：+1.0 ns。 | 到达时刻、预算和边沿独立代入 |
| ORIGINAL-STA-0003 | numeric | 1→2 | 答案：−0.15 ns，hold 违例。 | 到达时刻、预算和边沿独立代入 |
| ORIGINAL-STA-0004 | numeric | 1→2 | 答案：约 166.67 MHz。 | 到达时刻、预算和边沿独立代入 |
| ORIGINAL-STA-0005 | multiple_choice | 1→2 | 答案：A、C。两项分别改变时间预算和数据到达时刻，可以同时成立。 | 到达时刻、预算和边沿独立代入 |
| ORIGINAL-STA-0006 | short_answer | 1→2 | 直接回答：这是两周期 setup 的候选路径，不是 false path；E2 附近仍必须保护 D0 的 hold。 | 到达时刻、预算和边沿独立代入 |
| ORIGINAL-STA-0007 | numeric | 1→2 | 答案：+0.8 ns。 | 到达时刻、预算和边沿独立代入 |
| ORIGINAL-STA-0008 | multiple_choice | 1→2 | 答案：A、B。 | 到达时刻、预算和边沿独立代入 |
| ADAPTED-COLLECTION-STA-0001 | numeric | 1→2 | 答案：+0.5 ns。 | 到达时刻、预算和边沿独立代入 |
| ADAPTED-COLLECTION-STA-0002 | numeric | 1→2 | 答案：−0.16 ns，存在 hold 违例。 | 到达时刻、预算和边沿独立代入 |
| ADAPTED-COLLECTION-STA-0003 | multiple_choice | 1→2 | 答案：A、C、D。 | 到达时刻、预算和边沿独立代入 |
| ADAPTED-COLLECTION-STA-0004 | numeric | 1→2 | 答案：最小周期 8.6 ns。 | 到达时刻、预算和边沿独立代入 |
| ORIGINAL-CDC-0001 | single_choice | 1→2 | 答案：B。同步器给第一级留出恢复时间，降低异常传播的概率。 | 逐沿旧值/跨域协议前提/模型推导 |
| ORIGINAL-CDC-0002 | short_answer | 1→2 | 关键区别：采样遗漏和亚稳态传播是两个问题。 | 逐沿旧值/跨域协议前提/模型推导 |
| ADAPTED-RK26-CDC-0001 | rtl_coding | 1→2 | 数据流：源事件 → 保持的 toggle → 两级同步 → 与历史样本比较 → 目的单周期脉冲。 | 逐沿旧值/跨域协议前提/模型推导 |
| ADAPTED-INNO26-CDC-0001 | waveform_analysis | 1→2 | E1 后 s2 仍为 0；E2 后才变为 1。 | 逐沿旧值/跨域协议前提/模型推导 |
| ORIGINAL-CDC-0003 | multiple_choice | 1→2 | 答案：B、C、D。 | 逐沿旧值/跨域协议前提/模型推导 |
| ORIGINAL-CDC-0004 | short_answer | 1→2 | 可以采用单笔在途的四相握手；busy 期间源端不得覆盖 payload。 | 逐沿旧值/跨域协议前提/模型推导 |
| ORIGINAL-CDC-0005 | rtl_coding | 1→2 | 异步拉低，目的时钟两沿后释放。 | 逐沿旧值/跨域协议前提/模型推导 |
| ORIGINAL-CDC-0006 | single_choice | 1→2 | 答案：C，无法从 0→0 恢复两次事件。 | 逐沿旧值/跨域协议前提/模型推导 |
| ADAPTED-COLLECTION-CDC-0001 | numeric | 1→2 | 答案：约 7.389 倍。 | 逐沿旧值/跨域协议前提/模型推导 |
| ADAPTED-COLLECTION-CDC-0002 | single_choice | 1→2 | 答案：A。可能产生源业务中没有的 C=1。 | 逐沿旧值/跨域协议前提/模型推导 |
| ADAPTED-COLLECTION-CDC-0003 | short_answer | 1→2 | 复位断言可以异步，释放仍要相对时钟做时序检查。 | 逐沿旧值/跨域协议前提/模型推导 |
| ADAPTED-COLLECTION-CDC-0004 | multiple_choice | 1→2 | 答案：A、B、D。保护解析窗口，并只在后级使用稳定样本。 | 逐沿旧值/跨域协议前提/模型推导 |
| ADAPTED-ESP-FIFO-0001 | numeric | 1→2 | 答案：理论最小深度 39 个数据。 | 离散事件、指针编码与接口契约 |
| ORIGINAL-FIFO-0001 | numeric | 1→2 | 答案：14。 | 离散事件、指针编码与接口契约 |
| ORIGINAL-FIFO-0002 | single_choice | 1→2 | 答案：B，满。 | 离散事件、指针编码与接口契约 |
| ORIGINAL-FIFO-0003 | waveform_analysis | 1→2 | 更新后占用依次为 1、2、3、2。E0 读出旧队头。 | 离散事件、指针编码与接口契约 |
| ORIGINAL-FIFO-0004 | single_choice | 1→2 | 答案：B。区别是“何时队头有效”，不是数据排列顺序。 | 离散事件、指针编码与接口契约 |
| ORIGINAL-FIFO-0005 | short_answer | 1→2 | 同样写进 0xA5，输出却可以有三种结果。 | 离散事件、指针编码与接口契约 |
| ADAPTED-YHC-FIFO-0001 | numeric | 1→2 | 答案：12，对应新 Gray 位模式 01100。 | 离散事件、指针编码与接口契约 |
| ADAPTED-YHC-FIFO-0002 | multiple_choice | 1→2 | 答案：A、B、D。Gray 的相邻单 bit 性质只针对单位递增。 | 离散事件、指针编码与接口契约 |
| ADAPTED-COLLECTION-FIFO-0001 | true_false | 1→2 | 判断正确：b[0]=1。 | 离散事件、指针编码与接口契约 |
| ADAPTED-RK26-RTL-0001 | rtl_coding | 1→2 | 输入在 E0 接收，结果在 E1 后有效；填满后每拍可输出一笔。 | 状态递推/完整参考模块与独立 TB |
| ORIGINAL-RTL-0001 | rtl_coding | 1→2 | tick 的每拍清零，必须放在计数使能之外。 | 状态递推/完整参考模块与独立 TB |
| ORIGINAL-RTL-0002 | rtl_coding | 1→2 | req=1010 时，grant=0010，valid=1；不保证公平性。 | 状态递推/完整参考模块与独立 TB |
| ORIGINAL-RTL-0003 | short_answer | 1→2 | 10101 在第 3、5 位命中，结果为 0、0、1、0、1。 | 状态递推/完整参考模块与独立 TB |
| ORIGINAL-RTL-0004 | numeric | 1→2 | 答案：比较终值 4。 | 状态递推/完整参考模块与独立 TB |
| ORIGINAL-RTL-0005 | waveform_analysis | 1→2 | 完整字节是 0xB2；直接登记旧 shift 会得到 0x59。 | 状态递推/完整参考模块与独立 TB |
| ADAPTED-YHC-RTL-0001 | single_choice | 1→2 | 答案：A。紧凑二进制 3 bit，严格 one-hot 7 bit。 | 状态递推/完整参考模块与独立 TB |
| ADAPTED-YHC-RTL-0002 | rtl_coding | 1→2 | 只保存除以 5 的余数，不保存可能无限增长的前缀。 | 状态递推/完整参考模块与独立 TB |
| ADAPTED-YHC-RTL-0003 | numeric | 1→2 | 答案：2 个长度为 7 的间隔。 | 状态递推/完整参考模块与独立 TB |
| ADAPTED-YHC-RTL-0004 | rtl_coding | 1→2 | 三层组合加法树后接一层输出寄存器；接收沿后即可得到结果。 | 状态递推/完整参考模块与独立 TB |
| ADAPTED-YHC-RTL-0005 | waveform_analysis | 1→2 | 沿后 pulse 为 0、1、0、0、1。 | 状态递推/完整参考模块与独立 TB |
| ADAPTED-COLLECTION-RTL-0001 | numeric | 1→2 | 答案：93。 | 状态递推/完整参考模块与独立 TB |
| ADAPTED-COLLECTION-RTL-0002 | numeric | 1→2 | 答案：10 次更新。 | 状态递推/完整参考模块与独立 TB |
| ADAPTED-COLLECTION-RTL-0003 | single_choice | 1→2 | 答案：B，至少 3 bit。 | 状态递推/完整参考模块与独立 TB |
| ADAPTED-RK26-AXI-0001 | numeric | 1→2 | 答案：200 MB/s。 | 握手逐沿/阶段划分/吞吐单位换算 |
| ADAPTED-RK26-AHB-0001 | waveform_analysis | 1→2 | E0 接受 A 地址，E2 同时完成 A 数据并接受 B 地址，E3 完成 B 数据。 | 握手逐沿/阶段划分/吞吐单位换算 |
| ORIGINAL-AXI-0001 | multiple_choice | 1→2 | 答案：A、C。握手发生在 VALID 与 READY 同为 1 的采样沿。 | 握手逐沿/阶段划分/吞吐单位换算 |
| ORIGINAL-APB-0001 | waveform_analysis | 1→2 | 在 E2 完成，共 3 个 PCLK 周期；E2 后回 IDLE。 | 握手逐沿/阶段划分/吞吐单位换算 |
| ORIGINAL-SPI-0001 | single_choice | 1→2 | 答案：A。空闲低，上升沿采样，首位提前准备。 | 握手逐沿/阶段划分/吞吐单位换算 |
| ORIGINAL-UART-0001 | numeric | 1→2 | 答案：11520 byte/s。 | 握手逐沿/阶段划分/吞吐单位换算 |

## 2026-11-23 电路脚本与接口第二批

新增ADAPTED-EXTENSION系列8题，原114题逐对象未改。公开来源仅支持方向，全部条件与参考函数独立构造；逐题链接、去重、模型核对及未执行事项见 [本批审核](CONTENT_BATCH_10_EXTENSION.md)。245项前端回归、18项Python运行测试通过；新增函数网页代码与实测文件一致。

## 2026-11-23 RTL与协议第三批

新增ADAPTED-CORE3系列8题，原122题逐对象未改。逐题来源支持范围、去重、独立推导与HDL验证边界见 [审核](CONTENT_BATCH_11_CORE.md)。新增一个维护侧RTL/TB，严格CI共10模块；253项回归与18项Python测试通过，实际HDL结果以本提交CI为准。

## 2026-11-23 Cache小补充

新增2题，原130题未改。公开课程只支持方向，LRU时间戳模型和AMAT路径分解独立验证，见 [审核](CONTENT_BATCH_12_CACHE_MINI.md)。

## 2026-11-23 高频任务与汇编补充

新增18题，原132题逐对象未变；5份新RTL/TB、额外语言语义检查。132个源题号区分已有/修正77、部分30、缺条件13、暂缓12；不将方向关联误称原题完整移植。逐题修正与验证见 [审核](CONTENT_BATCH_13_FOCUSED.md) 和 [覆盖表](SOURCE_COLLECTION_COVERAGE.md)。

2026-11-24：完整接口批次新增6题，旧150题未修改。两份完整RTL逐字对应仿真源码；FIFO采用独立顺序队列、三组参数/时钟，AXI采用独立byte掩码与读快照模型，覆盖AW/W三种顺序及响应背压。多周期明确Vivado2023.2同钟使能前提，不把计算延迟当例外依据。数字功能验证不等同物理STA/CDC签核，详见 [批次审核](CONTENT_BATCH_14_INTEGRATION.md)。

2026-11-24：协议与计数边界新增6题，旧156题逐对象未改。AXI读交织按ID队列核算，只有握手末拍结束事务；FIFO用闭式读数/离散时序及已有RTL核对，库存15不保证D16全接收；去抖按配置清段及连续样本定义独立写RTL，增加缩短参数与默认百万样本检查。详见 [批次审核](CONTENT_BATCH_15_BOUNDARY.md)。
