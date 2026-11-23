# 核心题库扩充批次 1

版本 0.3.1：由 12 题扩充至 30 题。新增 18 道原创专项题，无公司原题或来源保真声明；原有 12 题内容及版本不变。数字逻辑 7、Verilog/SV 9、STA 6、CDC 4、FIFO 1、RTL 1、协议 2。

| ID | 主题 |
|---|---|
| ORIGINAL-LOGIC-0003 | 用二选一多路器实现 XOR |
| ORIGINAL-LOGIC-0004 | 有符号区间所需最小位宽 |
| ORIGINAL-LOGIC-0005 | 透明锁存器的输出时序 |
| ORIGINAL-LOGIC-0006 | 静态 1 冒险与共识项 |
| ORIGINAL-LOGIC-0007 | 三变量卡诺图最小化 |
| ORIGINAL-SV-0002 | 非阻塞赋值交换寄存器 |
| ORIGINAL-SV-0003 | 同一进程内重复 NBA 的结果 |
| ORIGINAL-SV-0004 | 逻辑相等与全等的四态结果 |
| ORIGINAL-SV-0005 | 显式有符号转换 |
| ORIGINAL-SV-0006 | 复制拼接的值 |
| ORIGINAL-SV-0007 | casez 与 casex 的未知值掩盖 |
| ORIGINAL-SV-0008 | 按位取反与归约操作 |
| ORIGINAL-SV-0009 | 异步复位释放是否立即赋值 |
| ORIGINAL-STA-0002 | 正偏斜下的 setup slack |
| ORIGINAL-STA-0003 | 正偏斜下的 hold slack |
| ORIGINAL-STA-0004 | 由单周期路径计算最高频率 |
| ORIGINAL-STA-0005 | 区分 setup 与 hold 修复 |
| ORIGINAL-STA-0006 | 多周期路径仍然需要 hold 检查 |

## 内容核对与范围

- 组合逻辑逐项检查真值；补码按上下界计算；卡诺图无无关项，检查最小分组。
- SV 题明确位宽、四态、进程数量及观测时刻；NBA 顺序结论限定为同一进程。没有接入 HDL 仿真器，审核不等同于仿真验证。
- Setup 按 required−arrival，hold 按 arrival−required；偏斜明确为捕获沿相对发射沿晚到，uncertainty 的使用方向写在题面。
- 多周期题要求证明使能及边沿关系，不提供可以盲用的例外约束命令。边沿选择参考 [Intel Timing Analyzer 用户指南](https://www.intel.com/programmable/technical-pdfs/683068.pdf)。
- 自动化内容检查覆盖 Boolean 真值、最小补码位宽、数值答案及负 slack 的实际判分；结构校验不替代技术审核。

本批不改变数据库结构。下一批补齐 50 题，模拟考试界面暂缓。
