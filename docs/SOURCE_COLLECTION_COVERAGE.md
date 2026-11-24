# 公开汇编132题号覆盖对照

核对日期2026-11-24；对应本地174题。按实际考查任务对照，不按公司名或专题名认定覆盖。91个题号已有对应/修正任务（77+14），18部分覆盖，11需补条件，12暂缓。同一现有题可以承载多个重复考点，因此这些数量不是新增题数，也不是独立公司考察频次。

covered和rewritten均为考点重构，不是逐字原题；partial不计完整覆盖。机器可读来源及引用见 [JSON表](source-collection-coverage.json)。

| Q号 | 状态 | 本地题ID | 任务边界/处理理由 |
|---|---|---|---|
| Q1 | 部分覆盖 | ORIGINAL-SV-0002 | 已有赋值时序语义，但不是原三段流水链的同一推演任务。 |
| Q2 | 部分覆盖 | ORIGINAL-SV-0002 | 已有赋值时序语义，但不是原三段流水链的同一推演任务。 |
| Q3 | 已有对应任务 | ADAPTED-YHC-SV-0001 | 独立构造交叉进程竞争题，保留任务。 |
| Q4 | 已修正改编 | ADAPTED-SAMPLING-SV-0001 | 原省略代码/观察点不完整；改为完整单驱动程序，明确display、#0、strobe与两时间槽，独立仿真及stdout顺序核对。 |
| Q5 | 已有对应任务 | ORIGINAL-SV-0003、ADAPTED-SAMPLING-SV-0001 | 补display与strobe的实际区域/输出顺序，不把#0当NBA完成屏障。 |
| Q6 | 已有对应任务 | ORIGINAL-SV-0004 | 四态比较任务已覆盖，条件与选项独立构造。 |
| Q7 | 已有对应任务 | ADAPTED-YHC-SV-0002 | 合并赋值完备性与敏感列表；纠正遗漏敏感项必然推断锁存器的表述。 |
| Q8 | 已有对应任务 | ADAPTED-YHC-SV-0002 | 合并赋值完备性与敏感列表；纠正遗漏敏感项必然推断锁存器的表述。 |
| Q9 | 已修正改编 | ADAPTED-SAMPLING-FSM-0001 | 重新构造一/二/三段式组织与实际输出逻辑的选择题，纠正数过程就能保证寄存/无毛刺的概括。 |
| Q10 | 已有对应任务 | ADAPTED-FOCUSED-RTL-SEQ-0001 | 合并为1101完整RTL，增加有效空泡与重叠契约；不机械增加不同模式字符串。 |
| Q11 | 暂缓 | — | 本轮未建立完整等价任务；不计已覆盖，后续按招聘证据与价值排序。 |
| Q12 | 已有对应任务 | ADAPTED-SAMPLING-FSM-0001 | 明确Moore/Mealy函数依赖、注册输出与状态译码物理瞬态，不声称永远差一个状态/一拍。 |
| Q13 | 已有对应任务 | ADAPTED-FOCUSED-RTL-SEQ-0001 | 合并为1101完整RTL，增加有效空泡与重叠契约；不机械增加不同模式字符串。 |
| Q14 | 部分覆盖 | ADAPTED-FOCUSED-RTL-SEQ-0001 | 序列检测已实现；出现次数统计未加入，不能算完整计数任务。 |
| Q15 | 已有对应任务 | ADAPTED-YHC-RTL-0002 | 改为模五递推并保留无限流余数FSM任务，不照搬模三参数。 |
| Q16 | 已有对应任务 | ADAPTED-SAMPLING-EDGE-0001 | 完整上升/下降/任意边沿RTL，明确首样本建基线、有效样本与空泡；1024流三组停顿独立TB。 |
| Q17 | 已有对应任务 | ADAPTED-YHC-RTL-0005 | 已覆盖上升沿检测与旧值/NBA；下降与双沿可由同一思想解释，不另凑题。 |
| Q18 | 已有对应任务 | ORIGINAL-FIFO-0001 | 二进制到Gray计算已覆盖。 |
| Q19 | 已有对应任务 | ADAPTED-YHC-FIFO-0001 | 解码/回绕/重新编码完整任务。 |
| Q20 | 部分覆盖 | ADAPTED-YHC-FIFO-0002 | 相邻单位变化与跳步边界已练，反射性质等完整原选项未全部重建。 |
| Q21 | 已有对应任务 | ADAPTED-COLLECTION-FIFO-0001 | 最低位归约异或任务已覆盖。 |
| Q22 | 已有对应任务 | ADAPTED-CODEC-GRAY-0001 | 完整参数化双向组合转换，前缀异或解码，WIDTH=1及独立输入路径；五种位宽穷举TB，不把组合码值转换当CDC同步。 |
| Q23 | 已有对应任务 | ADAPTED-YHC-FIFO-0002 | 跳步计数破坏单位变化条件，已独立改编。 |
| Q24 | 已有对应任务 | ORIGINAL-RTL-0004、ADAPTED-CODEC-DIV-0001、ADAPTED-CODEC-DIV-0002 | 完整偶分频与原clk域tick，DIVIDE=2边界、暂停保持相位/清事件及恢复波形，四参数独立累计沿模型TB。 |
| Q25 | 已有对应任务 | ADAPTED-FOCUSED-RTL-DIV-0001 | 完整固定三分频与50%占空比TB，明确双边沿、输入占空比和复位边界。 |
| Q26 | 部分覆盖 | ADAPTED-YHC-RTL-0003 | 仅覆盖平均clock-enable间隔，不冒充固定波形、占空比或低抖动分数时钟。 |
| Q27 | 需补条件 | — | 运行时切换/2.5分频需补切换生效、相位、占空比及脉宽契约，暂不移植简略答案。 |
| Q28 | 需补条件 | — | 运行时切换/2.5分频需补切换生效、相位、占空比及脉宽契约，暂不移植简略答案。 |
| Q29 | 已有对应任务 | ADAPTED-YHC-SV-0003 | 按ASIC/FPGA目标区分初始化与复位，不继承initial一律不可综合。 |
| Q30 | 已有对应任务 | ADAPTED-FOCUSED-SV-TASK-0001、ADAPTED-FOCUSED-SV-TASK-0002 | SystemVerilog版本明确；无参/void函数与task复制时机分别验证。 |
| Q31 | 已有对应任务 | ADAPTED-COLLECTION-RTL-0003 | 同一状态下界任务，已补输出与自主周期前提。 |
| Q32 | 已有对应任务 | ADAPTED-COLLECTION-RTL-0001 | 模空间及使能次数递推已覆盖。 |
| Q33 | 部分覆盖 | ADAPTED-COLLECTION-RTL-0002、ADAPTED-FOCUSED-RTL-LFSR-0001 | Johnson与给定LFSR轨道已覆盖；未单独考ring轨道，不泛称任意反馈都最大长度。 |
| Q34 | 已有对应任务 | ADAPTED-YHC-RTL-0004 | 有完整RTL和独立穷举TB。 |
| Q35 | 已有对应任务 | ADAPTED-RK26-RTL-0001 | 有完整RTL、33bit和进位/空泡验证。 |
| Q36 | 已修正改编 | ADAPTED-YHC-LOGIC-0001 | 舍弃非二进制有限小数能无损定点化的错误前提，改成可精确表示值；不继承原数值答案。 |
| Q37 | 部分覆盖 | ORIGINAL-LOGIC-0006 | 已有共识项消除指定静态冒险；未认可所有滤波/选通在任意电路都能根除毛刺。 |
| Q38 | 暂缓 | — | 组合/时序定义基础题可补，但当前优先完整设计任务。 |
| Q39 | 已有对应任务 | ADAPTED-FOCUSED-LOGIC-ABS-0001 | 最小补码负数的精确绝对值，明确signed输出需扩宽。 |
| Q40 | 已有对应任务 | ORIGINAL-LOGIC-0007、ORIGINAL-LOGIC-0001 | 逻辑化简任务已覆盖，避免仅更换表达式凑题。 |
| Q41 | 已有对应任务 | ORIGINAL-LOGIC-0007、ORIGINAL-LOGIC-0001 | 逻辑化简任务已覆盖，避免仅更换表达式凑题。 |
| Q42 | 已有对应任务 | ADAPTED-YHC-LOGIC-0002 | 位模式/符号解释区分，已有独立改编。 |
| Q43 | 已有对应任务 | ADAPTED-COLLECTION-STA-0001、ADAPTED-COLLECTION-STA-0002 | 合并为明确发射/捕获时钟到达、min/max及偏斜方向的计算，不沿用不明符号。 |
| Q44 | 已有对应任务 | ADAPTED-COLLECTION-STA-0001、ADAPTED-COLLECTION-STA-0002 | 合并为明确发射/捕获时钟到达、min/max及偏斜方向的计算，不沿用不明符号。 |
| Q45 | 已有对应任务 | ADAPTED-COLLECTION-STA-0001、ADAPTED-COLLECTION-STA-0002 | 合并为明确发射/捕获时钟到达、min/max及偏斜方向的计算，不沿用不明符号。 |
| Q46 | 已有对应任务 | ORIGINAL-STA-0008 | 抖动/不确定度影响已有题，时间条件明确。 |
| Q47 | 已有对应任务 | ORIGINAL-STA-0001、ORIGINAL-STA-0003 | 建立/保持分别核对，不能以降频通用修复hold。 |
| Q48 | 需补条件 | ORIGINAL-STA-0004 | 原任务未明确全部组合路径开销；已有完整条件Fmax题可练，不照搬缺条件答案。 |
| Q49 | 已有对应任务 | ORIGINAL-STA-0005、ADAPTED-ADVANCED-STA-0001、ADAPTED-FOCUSED-PPA-CORNER-0001 | 修复方向、双边时序预算及代价已覆盖，缺失选项不伪装重建原题。 |
| Q50 | 已有对应任务 | ORIGINAL-STA-0005、ADAPTED-ADVANCED-STA-0001、ADAPTED-FOCUSED-PPA-CORNER-0001 | 修复方向、双边时序预算及代价已覆盖，缺失选项不伪装重建原题。 |
| Q51 | 已有对应任务 | ORIGINAL-STA-0005、ADAPTED-ADVANCED-STA-0001、ADAPTED-FOCUSED-PPA-CORNER-0001 | 修复方向、双边时序预算及代价已覆盖，缺失选项不伪装重建原题。 |
| Q52 | 已有对应任务 | ORIGINAL-STA-0005、ADAPTED-ADVANCED-STA-0001、ADAPTED-FOCUSED-PPA-CORNER-0001 | 修复方向、双边时序预算及代价已覆盖，缺失选项不伪装重建原题。 |
| Q53 | 已有对应任务 | ADAPTED-COLLECTION-STA-0001、ADAPTED-COLLECTION-STA-0002 | 合并为明确发射/捕获时钟到达、min/max及偏斜方向的计算，不沿用不明符号。 |
| Q54 | 已有对应任务 | ADAPTED-COLLECTION-STA-0001、ADAPTED-COLLECTION-STA-0002 | 合并为明确发射/捕获时钟到达、min/max及偏斜方向的计算，不沿用不明符号。 |
| Q55 | 已有对应任务 | ORIGINAL-STA-0005、ADAPTED-ADVANCED-STA-0001、ADAPTED-FOCUSED-PPA-CORNER-0001 | 修复方向、双边时序预算及代价已覆盖，缺失选项不伪装重建原题。 |
| Q56 | 部分覆盖 | ORIGINAL-STA-0008、ORIGINAL-STA-0002 | 计算覆盖部分效果，但jitter/skew概念对照尚无独立任务。 |
| Q57 | 已有对应任务 | ADAPTED-COLLECTION-STA-0001、ADAPTED-COLLECTION-STA-0002 | 合并为明确发射/捕获时钟到达、min/max及偏斜方向的计算，不沿用不明符号。 |
| Q58 | 已有对应任务 | ADAPTED-COLLECTION-STA-0003 | 补功能证据，避免按模式名随意屏蔽路径。 |
| Q59 | 已有对应任务 | ORIGINAL-STA-0006 | 已有多周期与hold检查思路。 |
| Q60 | 已有对应任务 | ORIGINAL-STA-0004 | Fmax路径条件包含setup与最大数据开销；hold单独检查。 |
| Q61 | 已修正改编 | ADAPTED-INTEGRATION-STA-0001、ADAPTED-INTEGRATION-STA-0002 | 补同钟同相、端点共同使能、复位/模式与工具语义，给setup3/hold2和setup/hold预算；不能由运算延迟直接推例外。 |
| Q62 | 已有对应任务 | ADAPTED-COLLECTION-STA-0004 | 串联关键路径推导已覆盖。 |
| Q63 | 已修正改编 | ORIGINAL-CDC-0001、ADAPTED-COLLECTION-CDC-0004 | 合并为条件明确的同步能力与失败风险题，不继承绝对安全或“避免所有CDC”等模糊选项。 |
| Q64 | 已修正改编 | ORIGINAL-CDC-0001、ADAPTED-COLLECTION-CDC-0004 | 合并为条件明确的同步能力与失败风险题，不继承绝对安全或“避免所有CDC”等模糊选项。 |
| Q65 | 已修正改编 | ORIGINAL-CDC-0001、ADAPTED-COLLECTION-CDC-0004 | 合并为条件明确的同步能力与失败风险题，不继承绝对安全或“避免所有CDC”等模糊选项。 |
| Q66 | 已修正改编 | ORIGINAL-CDC-0001、ADAPTED-COLLECTION-CDC-0004 | 合并为条件明确的同步能力与失败风险题，不继承绝对安全或“避免所有CDC”等模糊选项。 |
| Q67 | 已有对应任务 | ADAPTED-COLLECTION-CDC-0001 | 给定MTBF模型和变化方向，非真实物理测量。 |
| Q68 | 已有对应任务 | ADAPTED-COLLECTION-CDC-0001 | 给定MTBF模型和变化方向，非真实物理测量。 |
| Q69 | 已有对应任务 | ADAPTED-COLLECTION-CDC-0004 | 同步链解析时间和中间逻辑风险已覆盖。 |
| Q70 | 已有对应任务 | ADAPTED-COLLECTION-CDC-0002 | 相关位独立跨域造成假组合的具体反例。 |
| Q71 | 已有对应任务 | ORIGINAL-CDC-0002、ADAPTED-RK26-CDC-0001 | 电平/脉冲区别及toggle速率条件明确，有完整脉冲RTL。 |
| Q72 | 已有对应任务 | ORIGINAL-CDC-0002、ADAPTED-RK26-CDC-0001 | 电平/脉冲区别及toggle速率条件明确，有完整脉冲RTL。 |
| Q73 | 已有对应任务 | ORIGINAL-CDC-0003、ORIGINAL-CDC-0004、ADAPTED-CORE-CDC-0001 | 合并相关性、数据稳定窗口与握手周转；不是只有跨域关键词。 |
| Q74 | 已有对应任务 | ORIGINAL-CDC-0003、ORIGINAL-CDC-0004、ADAPTED-CORE-CDC-0001 | 合并相关性、数据稳定窗口与握手周转；不是只有跨域关键词。 |
| Q75 | 已有对应任务 | ORIGINAL-CDC-0003、ORIGINAL-CDC-0004、ADAPTED-CORE-CDC-0001 | 合并相关性、数据稳定窗口与握手周转；不是只有跨域关键词。 |
| Q76 | 已有对应任务 | ORIGINAL-CDC-0003、ORIGINAL-CDC-0004、ADAPTED-CORE-CDC-0001 | 合并相关性、数据稳定窗口与握手周转；不是只有跨域关键词。 |
| Q77 | 部分覆盖 | ADAPTED-ADVANCED-FIFO-0002 | 异步FIFO指针部分已覆盖，但未给完整异步乒乓buffer任务。 |
| Q78 | 已有对应任务 | ADAPTED-ADVANCED-FIFO-0002 | Gray指针用于跨域相干条件，不能直接等同省功耗。 |
| Q79 | 已有对应任务 | ORIGINAL-CDC-0005 | 完整reset RTL/TB及recovery/removal独立题，不能说绝对消除风险。 |
| Q80 | 已修正改编 | ADAPTED-SAMPLING-RESET-0001、ADAPTED-SAMPLING-RESET-0002 | 同步复位便于分析不等于自动通过STA；补短脉冲漏采、停钟、setup/hold及异步释放约束条件，不沿用绝对断言。 |
| Q81 | 已有对应任务 | ORIGINAL-CDC-0005 | 完整reset RTL/TB及recovery/removal独立题，不能说绝对消除风险。 |
| Q82 | 已有对应任务 | ORIGINAL-CDC-0005 | 完整reset RTL/TB及recovery/removal独立题，不能说绝对消除风险。 |
| Q83 | 已有对应任务 | ADAPTED-INTEGRATION-FIFO-0001、ADAPTED-INTEGRATION-FIFO-0002 | 完整参数化双时钟FIFO、注册Gray双级同步、next空满、寄存读valid与协调复位；独立队列TB，未宣称任意深度或单域独立复位支持。 |
| Q84 | 已有对应任务 | ADAPTED-FOCUSED-RTL-FIFO-0001 | 完整同步FIFO及边界契约，独立队列TB。 |
| Q85 | 已有对应任务 | ADAPTED-ADVANCED-FIFO-0002 | 判空满域、额外环绕位及next指针已有题。 |
| Q86 | 已有对应任务 | ADAPTED-ADVANCED-FIFO-0002 | 判空满域、额外环绕位及next指针已有题。 |
| Q87 | 部分覆盖 | ADAPTED-ADVANCED-FIFO-0002 | 只支持题定经典2的幂Gray架构；不把所有可能FIFO深度都一概限制为2的幂。 |
| Q88 | 需补条件 | ADAPTED-ESP-FIFO-0001、ADAPTED-ADVANCED-FIFO-0001 | 已有独立完整到达/服务模型；原题周期窗口、相位、读起点或位宽不足/答案有争议，未逐题继承数字。 |
| Q89 | 需补条件 | ADAPTED-ESP-FIFO-0001、ADAPTED-ADVANCED-FIFO-0001 | 已有独立完整到达/服务模型；原题周期窗口、相位、读起点或位宽不足/答案有争议，未逐题继承数字。 |
| Q90 | 需补条件 | ADAPTED-ESP-FIFO-0001、ADAPTED-ADVANCED-FIFO-0001 | 已有独立完整到达/服务模型；原题周期窗口、相位、读起点或位宽不足/答案有争议，未逐题继承数字。 |
| Q91 | 需补条件 | ADAPTED-ESP-FIFO-0001、ADAPTED-ADVANCED-FIFO-0001 | 已有独立完整到达/服务模型；原题周期窗口、相位、读起点或位宽不足/答案有争议，未逐题继承数字。 |
| Q92 | 需补条件 | ADAPTED-ESP-FIFO-0001、ADAPTED-ADVANCED-FIFO-0001 | 已有独立完整到达/服务模型；原题周期窗口、相位、读起点或位宽不足/答案有争议，未逐题继承数字。 |
| Q93 | 需补条件 | ADAPTED-ESP-FIFO-0001、ADAPTED-ADVANCED-FIFO-0001 | 已有独立完整到达/服务模型；原题周期窗口、相位、读起点或位宽不足/答案有争议，未逐题继承数字。 |
| Q94 | 已有对应任务 | ORIGINAL-APB-0001、ADAPTED-FOCUSED-APB-STATE-0001 | 已有等待波形，新增背靠背与SETUP不能跳过。 |
| Q95 | 已有对应任务 | ORIGINAL-APB-0001、ADAPTED-FOCUSED-APB-STATE-0001 | 已有等待波形，新增背靠背与SETUP不能跳过。 |
| Q96 | 暂缓 | — | APB版本信号增量尚无完整独立题，已有PSTRB题只覆盖部分。 |
| Q97 | 部分覆盖 | ADAPTED-RK26-AHB-0001 | 已有AHB-Lite流水重叠时序，不声称完整AHB多主仲裁也已覆盖。 |
| Q98 | 部分覆盖 | ADAPTED-FOCUSED-AXI-VERSION-0001 | 已练AXI burst，但AHB/APB对比需另外明确版本。 |
| Q99 | 暂缓 | — | RETRY/SPLIT、BUSY/IDLE及两周期错误响应需明确AHB版本，不能套到AHB-Lite全部情形。 |
| Q100 | 部分覆盖 | ADAPTED-RK26-AHB-0001 | 已有AHB-Lite流水重叠时序，不声称完整AHB多主仲裁也已覆盖。 |
| Q101 | 暂缓 | — | RETRY/SPLIT、BUSY/IDLE及两周期错误响应需明确AHB版本，不能套到AHB-Lite全部情形。 |
| Q102 | 暂缓 | — | RETRY/SPLIT、BUSY/IDLE及两周期错误响应需明确AHB版本，不能套到AHB-Lite全部情形。 |
| Q103 | 已有对应任务 | ADAPTED-FOCUSED-AXI-VERSION-0001 | 明确AXI4去掉WID及写数据交织。 |
| Q104 | 暂缓 | — | 独立读响应为何合入R通道、完整响应码语义尚未作为专门任务。 |
| Q105 | 暂缓 | — | 独立读响应为何合入R通道、完整响应码语义尚未作为专门任务。 |
| Q106 | 已有对应任务 | ADAPTED-FOCUSED-AXI-VERSION-0001、ADAPTED-FOCUSED-AXI-WRAP-0001 | burst类型、长度/大小和限制明确。 |
| Q107 | 已有对应任务 | ADAPTED-FOCUSED-AXI-VERSION-0001、ADAPTED-FOCUSED-AXI-WRAP-0001 | burst类型、长度/大小和限制明确。 |
| Q108 | 已修正改编 | ADAPTED-FOCUSED-AXI-WRAP-0001 | 纠正“首地址必须按整个burst大小对齐”；仅需beat对齐，区域下界另算。 |
| Q109 | 部分覆盖 | ADAPTED-CORE-AXI-0001 | 已练合法分段与边界检查，未专门要求解释地址解码背景。 |
| Q110 | 已有对应任务 | ORIGINAL-AXI-0001、ADAPTED-FOCUSED-AXI-DEADLOCK-0001 | 已有稳定性，新增发起依赖与初态互等死锁。 |
| Q111 | 已有对应任务 | ORIGINAL-AXI-0001、ADAPTED-FOCUSED-AXI-DEADLOCK-0001 | 已有稳定性，新增发起依赖与初态互等死锁。 |
| Q112 | 已有对应任务 | ADAPTED-CORE-AXI-0002 | 同ID与跨ID返回顺序具体任务已有。 |
| Q113 | 已有对应任务 | ADAPTED-FOCUSED-AXI-VERSION-0001、ADAPTED-CORE-AXI-0002、ADAPTED-BOUNDARY-AXI-0001、ADAPTED-BOUNDARY-AXI-0002 | 补完整按ID队列追踪的读beat交织、背压末拍计数、完成顺序及AXI3/4读写交织区别；不把跨ID许可推广到同ID。 |
| Q114 | 暂缓 | — | AXI五通道跨域的完整设计未覆盖；不能用数据逐位打两拍替代。 |
| Q115 | 暂缓 | — | 总线对比可作后续简答，需约束版本与场景。 |
| Q116 | 需补条件 | — | 协议名本身不保证速度，需固定时钟/等待/突发与开销再比较。 |
| Q117 | 需补条件 | — | 缺少原选项，只能另行构造有完整条件的比较题。 |
| Q118 | 已有对应任务 | ADAPTED-INTEGRATION-AXIL-0001、ADAPTED-INTEGRATION-AXIL-0002 | 完整AXI4-Lite两寄存器从设备、独立AW/W缓存、strobe、错误地址、B/R背压与读快照；受限吞吐契约明确，独立TB。 |
| Q119 | 已有对应任务 | ADAPTED-ADVANCED-AXI-0001 | 写地址/数据独立到达与响应依赖已有逐沿任务。 |
| Q120 | 已有对应任务 | ADAPTED-CORE-DV-0004 | 已有:=与:/权重对照解释，避免只换数字。 |
| Q121 | 部分覆盖 | ADAPTED-FOCUSED-CLOCK-MUX-0001 | 新增直接MUX反例与实现前提；未重建来源缺失的具体完整切换电路。 |
| Q122 | 部分覆盖 | ADAPTED-FOCUSED-CLOCK-MUX-0001 | 新增直接MUX反例与实现前提；未重建来源缺失的具体完整切换电路。 |
| Q123 | 已修正改编 | ADAPTED-FOCUSED-CLOCK-MUX-0001 | 用明确输入与选择轨迹给出毛刺反例；不把两拍同步当通用无毛刺保证。 |
| Q124 | 已有对应任务 | ADAPTED-SYSTEM-ARCH-0002 | 同一局部/整体加速任务，已有额外开销边界。 |
| Q125 | 已修正改编 | ADAPTED-FOCUSED-LOGIC-MUX-0001 | 明确基本器件为1bit 2选1并计树结点，舍弃输入bit数当MUX个数的混淆。 |
| Q126 | 已有对应任务 | ADAPTED-FOCUSED-RTL-MIN-0001 | 补完整流式不同值定义、次数继承和start/valid契约，独立直方图TB。 |
| Q127 | 已修正改编 | ADAPTED-FOCUSED-RTL-DEBOUNCE-0001、ADAPTED-BOUNDARY-DEBOUNCE-0001、ADAPTED-BOUNDARY-DEBOUNCE-0002、ADAPTED-BOUNDARY-DEBOUNCE-0003 | 补50MHz下5/10/15/20ms可配置去抖、20bit计数与配置变更清段契约；默认25万/100万样本终点及缩短参数独立TB。阈值按连续采样数量定义，原模拟按键条件重新明确。 |
| Q128 | 已修正改编 | ADAPTED-CODEC-MEM-0001、ADAPTED-CODEC-MEM-0002 | 重构明确字地址、双向DQ、5控制+2电源的抽象封装，38脚非真实型号结论；另补位宽/深度片组和byte/row/bank地址拆分。 |
| Q129 | 暂缓 | — | 题源有具体任务，但当前集中数字IC核心设计，智力题暂不增加。 |
| Q130 | 暂缓 | — | 题源有具体任务，但当前集中数字IC核心设计，智力题暂不增加。 |
| Q131 | 部分覆盖 | ADAPTED-TOOLSFPGA-CMOS-0001、ORIGINAL-STA-0001 | 基础语义与时序已覆盖，来源题组的Maxpooling RTL仍未实现。 |
| Q132 | 部分覆盖 | ADAPTED-FOCUSED-MEM-CAP-0001、ADAPTED-EXTENSION-TOOLS-0001、ADAPTED-CODEC-PARITY-0001、ADAPTED-CODEC-MEM-0002 | 偶校验生成/奇偶错误掩码、容量及片组译码已补；大小端目前主要为Python字节解释，未重建完整内存读写任务组，仍保留部分覆盖。 |

本轮提升Q22/Q24/Q128；Q132仍保留部分覆盖。后续可评估APB版本区别（Q96）、AXI响应码（Q104/105）、明确版本的AHB错误响应（Q101/102），仍按常见任务价值筛选，不追求全部题号变绿。
