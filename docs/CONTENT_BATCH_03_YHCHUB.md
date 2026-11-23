# YHCHub 练习汇编考点扩充

V1 本批新增 12 道独立编制的考点改编，题库由 50 道增至 62 道。参考 [用户指定的公开练习汇编](https://www.yhchub.com/%E6%95%B0%E5%AD%97%E5%89%8D%E7%AB%AF%E6%95%B0%E5%AD%97IC%E7%AC%94%E8%AF%95%E7%9C%9F%E9%A2%98%E4%B8%8E%E8%A7%A3%E6%9E%90.html)，核对日期为 2026-11-23。没有整体搬运该站题库、复用其答案段落或将其公司标签当作已核实原卷归因。

source.kind=practice_collection、evidenceGrade=C、questionFidelity=topic_only_reconstruction；链接状态 checked 仅表示汇编页面及知识方向已核对，不代表来源保真升级。每题 note 记录原汇编题号，不填写缺少独立支持的公司和年份。网页使用“公开资料考点改编｜非原题”，原有笔经题仍保留其资料性质。

| 本地 ID | 考点索引 | 本地题目 |
|---|---|---|
| ADAPTED-YHC-LOGIC-0001 | Q36 | 精确二进制定点数的最小位数 |
| ADAPTED-YHC-LOGIC-0002 | Q42 | 符号扩展后的无符号位模式 |
| ADAPTED-YHC-SV-0001 | Q3 | 两个时序进程之间的阻塞赋值竞争 |
| ADAPTED-YHC-SV-0002 | Q7 | 不完整敏感列表与锁存器的区别 |
| ADAPTED-YHC-SV-0003 | Q29 | 上电初始化是否能替代运行时复位 |
| ADAPTED-YHC-FIFO-0001 | Q19 | Gray 指针解码、推进与重新编码 |
| ADAPTED-YHC-FIFO-0002 | Q23 | 非相邻计数不能套用 Gray 单位变化性质 |
| ADAPTED-YHC-RTL-0001 | Q11 | 状态编码位数与性能判断 |
| ADAPTED-YHC-RTL-0002 | Q15 | 无限串行前缀的模五检测器 |
| ADAPTED-YHC-RTL-0003 | Q26 | 分数平均分频的间隔调度 |
| ADAPTED-YHC-RTL-0004 | Q34 | 平衡加法树实现八位人口计数 |
| ADAPTED-YHC-RTL-0005 | Q16 | 寄存器上升沿检测的逐沿结果 |

## 技术核对

本地题面重新规定数值、接口、位宽和观测时刻。定点表示按约分分母与整数范围推导，符号扩展保持有符号值；Gray 解码后按二进制计数、回绕、再编码。无限前缀改用模五余数状态，人口计数明确 2/3/4 bit 中间宽度，平均分频明确是时钟使能脉冲间隔而不是固定周期方波。

敏感列表题区分过程触发、赋值完备性及综合数据依赖；初始化题明确 FPGA 配置初始化与无特殊保证的 ASIC 目标，区分上电初态和运行时复位。参考 [Sigasi 敏感列表说明](https://www.sigasi.com/tech/wildcard-sensitivity/) 与 [AMD 初始化方法说明](https://docs.amd.com/r/2025.1-English/ug1387-acap-hardware-ip-platform-dev-methodology/Initialization-of-All-Inferred-Registers-SRLs-and-Memories)。这些技术参考不是公司原题来源。

新增自动化检查覆盖来源边界、定点最小位宽、符号扩展、Gray 回绕/跳步、所有 12 位以内二进制前缀的模五递推、全部 256 种八位数据的分组计数、平均间隔整数解及逐沿参考表。检查的是数学/参考模型与数据，不声称运行过 HDL 仿真或器件综合。

同时修复 Markdown 表格解析与完全相同的参考解/解析重复显示。题库 JSON 和旧快照本身不因渲染修复而改变；代码块、原始 HTML 禁用和危险链接处理有回归测试。
