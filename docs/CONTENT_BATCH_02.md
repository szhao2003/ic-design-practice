# 首批 50 题补齐

版本 0.3.2 新增 20 道原创专项题：STA 2、CDC 4、FIFO 5、RTL 5、协议 4。总计 50 道（原创 44、公开笔经考点改编 6），七专题数量为 7/9/8/8/6/6/6。原有 30 道题内容及版本不变。

| ID | 主题 |
|---|---|
| ORIGINAL-STA-0007 | 外部输入路径的 setup 裕量 |
| ORIGINAL-STA-0008 | 时钟不确定度对裕量的影响 |
| ORIGINAL-CDC-0003 | 多位总线逐位同步的边界 |
| ORIGINAL-CDC-0004 | 单笔多位数据握手的稳定窗口 |
| ORIGINAL-CDC-0005 | 异步断言与同步释放复位 |
| ORIGINAL-CDC-0006 | toggle 方案漏掉偶数次翻转 |
| ORIGINAL-FIFO-0001 | 二进制指针转换为 Gray |
| ORIGINAL-FIFO-0002 | 带环绕位的同步 FIFO 满空判定 |
| ORIGINAL-FIFO-0003 | 同步 FIFO 同沿读写与边界 |
| ORIGINAL-FIFO-0004 | 标准读模式与 FWFT 的有效时刻 |
| ORIGINAL-FIFO-0005 | 单端口 RAM 写模式的区别 |
| ORIGINAL-RTL-0001 | 带单周期溢出脉冲的模十计数器 |
| ORIGINAL-RTL-0002 | 四路固定优先级仲裁器 |
| ORIGINAL-RTL-0003 | 允许重叠的 101 序列检测 |
| ORIGINAL-RTL-0004 | 偶数分频的半周期计数值 |
| ORIGINAL-RTL-0005 | 串行移位与第八位的 NBA |
| ORIGINAL-AXI-0001 | AXI 单通道背压时必须保持什么 |
| ORIGINAL-APB-0001 | APB 等待周期的完成边沿 |
| ORIGINAL-SPI-0001 | SPI 模式 0 的采样边沿 |
| ORIGINAL-UART-0001 | UART 8N1 的理论有效载荷率 |

## 审核边界

数值答案独立按边沿、位运算和帧开销重算；FIFO 明确按沿前状态接受，无满态前瞻或空态旁路。移位题区分 NBA 旧值和新拼接值。参考 RTL 按复位优先级、使能、默认赋值和计数边界检查；没有接入 HDL 仿真器或器件实现工具，不能称为已仿真验证。人工题仍由学习者按参考答案和 rubric 自评。

新增计算/逐沿测试覆盖输入时序裕量、Gray 邻接与环绕、FIFO 接受队列、串并转换、分频和 UART 单位换算。正式题库校验检查 50 题分布及题型最低数量，不替代技术审核。

## 技术参考

以下用于核对协议和器件语义，题目均为独立编制，不作为公司原题来源。

- [Arm AXI 协议规范](https://documentation-service.arm.com/static/63ff0ebd56ea36189d4e7ee7)：通道 VALID/READY 握手及背压期间保持要求。
- [Arm APB 协议规范](https://documentation-service.arm.com/static/63fe2c1356ea36189d4e79f3)：SETUP/ACCESS 和 PREADY 等待关系。
- [AMD UG573 写模式](https://docs.amd.com/r/en-US/ug573-ultrascale-memory-resources/Write-Modes)：单端口写入时输出模式；不能推广到任意双端口碰撞。
- [AMD 异步复位同步器](https://docs.amd.com/r/2023.2-English/ug1353-versal-architecture-ai-libraries/XPM_CDC_ASYNC_RST)：异步断言、目的域同步释放；本题参考 RTL 并非器件宏替代品。
- [Microchip SPI 数据模式](https://onlinedocs.microchip.com/oxy/GUID-06C36746-0136-4691-8940-69BFD41FCC56-en-US-1/GUID-A7DA5A86-7BEA-4E52-9A30-68D9FEF59332.html)：模式 0 上升沿采样、下降沿准备。

数据库结构和备份格式不变。50 题达标仅完成内容阶段，模拟考试和进度详情仍待实现。
