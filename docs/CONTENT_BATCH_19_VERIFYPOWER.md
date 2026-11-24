# 验证诊断与低功耗：12道

2026-11-24；应用1.16.0。新增12题至198，旧186题逐对象保留，不改学习记录。统一ADAPTED-VERIFYPOWER-前缀，搜索“验证诊断与低功耗”。资料类型为practice_collection/C/topic_only_reconstruction，技术/教学方向独立改编，无公司归因或招聘频率声明。

## 内容与来源

DV五题：背压解除沿的保持性质、稳定X的盲区、错误响应消费队首、iff覆盖分母、ignore/illegal区别。DFT三题：MUX选择线stuck-at检测集合、静态/at-speed边界、扫描链沿前SO及内部故障传播。低功耗四题：保存/隔离ack顺序、排空事务计数、信号极性与钳位、部分retention后的事务边界。

- [Arm握手规则](https://documentation-service.arm.com/static/64256e84314e245d086bc88f)：有效数据需保持至接受，作为DV-0001/2任务方向；SVA表达式及采样表独立构造。
- [Verification Academy采样过滤](https://verificationacademy.com/forums/t/why-ignore-bins-is-not-considering-iff-condition/29741)、[非法覆盖bin答复](https://verificationacademy.com/forums/t/illegal-bin-hit-the-bin-counter-for-bin-x-is-1/36323)：仅用规则，不复制帖子中的程序或原题。
- [Python deque文档](https://docs.python.org/3/library/collections.html#collections.deque)：队列操作依据；错误消费规则由题目契约独立定义，不声称Python文档规定scoreboard协议。
- [Siemens scan模式与诊断](https://blogs.sw.siemens.com/tessent/2017/02/14/best-practice-in-scan-pattern-ordering-for-test-and-diagnosis/)、[链诊断资料](https://static.sw.cdn.siemens.com/siemens-disw-assets/public/2Mrc4InNtzAz03iI5LJgHF/en-US/Tessent-reversible-chain-diagnosis-WP.pdf)：静态/时序/链诊断任务方向，MUX真值表和三位链故障独立建模，未复制资料图形。
- [AMD隔离说明](https://docs.amd.com/r/en-US/ug1085-zynq-ultrascale-trm/Isolation-Request?contentId=qRmS8dOJd39Nv2Fk4ZOXnw)：只支持隔离边界方向。所有pending/save/ack时刻、retention范围和控制命令时刻由本题抽象合同规定，不继承具体器件电源序列。

## 去重与核对

旧题已有复位中止SVA、cross coverage、跨ID scoreboard代码、scan移位、AND故障激活和隔离基础。本批考查不同任务：握手沿保持、四态未知、错误之后队列推进、采样与构造分离、MUX选择故障、链内故障传播、请求/ack与排空账本，不只换数字。

313项前端/内容/存储测试中新增8项，核对如下：

- SVA采样模型E0→E1通过、E1→E2失败；这是安全性而非进展保证，E2没有新非空义务。
- 对相同X字符串稳定与二值已知性分别判断，不把稳定当有效数据。
- 请求队列三笔、响应四笔：mismatch(1,10,99)、unexpected(1,20)，无missing。另实际运行原Python check_reads函数复验该新trace，原18项Python测试全部运行。
- 显式4bin只命中2个，覆盖率50%；未实际运行商业covergroup工具，不把数学模型说成工具coverage结果。
- MUX sel stuck-at-0枚举全部8组输入，仅(0,1,1)/(1,0,1)检测。
- 三位链按旧值shift、更新后强制q1=1，SO=001111，前两状态010/110。
- pending=5→4→3→1→0，按后一沿推进步骤最早E8关电；另一ack算例E8确认后E9发命令。

类型检查、198题正式校验、构建和旧186题不变对照均运行。此批无新增RTL/Python参考文件；原21份参考RTL及附加语义/容量测试继续在严格CI执行后才部署。本机无iverilog，--if-available仅核对源码一致性。没有声称原生SVA求解器、covergroup仿真、ATPG或UPF低功耗仿真已执行。

汇编132题号覆盖状态未因这些独立技术资料改编而提升，保持99个对应/修正任务；不把专题关键词出现当逐题完成。

## 下一批安排

优先查公开任务后补体系结构与脚本调试：流水线分支/数据冒险、地址分解、时序日志与事务记录分析；同时检查当前题库是否有解释相似或条件过长的条目。按约10–12题完整批次推进，结束时统一汇报验证与后续安排；不逐小节等待“继续”。

本地页面验收：X检查多选A/C、关电沿编号8均判对；SVA代码与E1→E2失败解析正常；辅助自评后重做隐藏解析。390px视口页面client/scroll均375，代码宽300/内容宽428、overflow-x=auto，检查后恢复视口。批次检索恰好12题，测试记录只存在本地独立端口。
