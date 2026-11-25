# 公开笔试资料补充：SV、约束与测试流程8题

2026-11-25，应用1.28.0；234→242题。搜索“笔试SV与流程补充”。原234题逐对象保持不变，原创仍44题；新题全部记录past_paper_compilation/C/topic_only_reconstruction，不挂公司名称，不冒充核实原卷。

## 题源和技术依据

本轮重新读取[燧原数字IC往届汇编](https://www.nowcoder.com/discuss/481041431860092928)，页面显示2023-04-27编辑，原考试日期及公司归属未独立核实。CSDN追溯入口仍无法正常读取，不把搜索摘要当成已核原文。正文支持类转换、并发启动、脚本参数、时钟约束、覆盖率和DFT流程等方向；新题所有完整程序、激励、数据和选项均独立重构。

另核对[芯海2022届公开汇编](https://www.nowcoder.com/discuss/353159156829986816)：发布2022-02-12，正文标注考试2021-08-25，列有并发线程和覆盖率方向。两份汇编不是官方试卷，也未建立跨作者独立性，不据此计算招聘频次。类句柄别名题是类转换任务的基础拆解，不声称原帖出现了本别名程序。

技术答案按以下独立资料核对，不沿用汇编的答案标签：

- [IEEE 1800-2017，MIT课程公开版本](https://fpga.mit.edu/6205/_static/F25/documentation/1800-2017.pdf)：本地抽取8.12句柄赋值、8.16类转换、6.24.2动态转换、9.3.2并行块条款；区分函数式$cast失败返回值、目标不变和task形式报错。辅以[Verification Academy的静态/动态类型答复](https://verificationacademy.com/forums/t/dynamic-cast-classes/42942)。
- [GNU Bash手册](https://www.gnu.org/software/bash/manual/bash.html)：位置参数、shift、双引号中的$@/$*。来源脚本扩展名涉及csh，本题明确按Bash重新设题。
- [AMD create_clock命令说明](https://docs.amd.com/r/2022.1-English/ug835-vivado-tcl-commands/create_clock)：周期、波形边沿和latency是不同概念；本题明确时间单位ns。
- [Siemens覆盖率说明](https://blogs.sw.siemens.com/verificationhorizons/2020/12/08/amc-20-152a-a-practitioners-perspective/)：分支命中与条件/组合等不同覆盖目标不可混为一谈；题目显式定义分母，不冒用工具原生condition/MC/DC统计。
- [Siemens DFT插入流程](https://resources.sw.siemens.com/en-US/technology-overview-tessent-automotive-reference-flow-part-2/)及[Tessent RTL Pro资料](https://static.sw.cdn.siemens.com/siemens-disw-assets/public/3rHm3xBoSaKSeJzgIedAte/en-US/Siemens-SW-Tessent-RTL-Pro-85605-FINAL.pdf)：设计修改、ATPG生成与芯片上的测试执行分开。

## 内容与去重

| 题号尾部 | 独立训练能力 | 答案 |
|---|---|---|
| CLASS-0001 | 一个对象的两个句柄，修改别名后将其置null | A/C，RESULT=14 1 |
| CLASS-0002 | 动态对象类型决定$cast成功与否，失败不修改目标 | B/D，UP=1 1；RESULT=0 1 23 |
| FORK-0001 | join_any恢复父进程不取消其他子进程；wait fork继续等待 | C，FIRST=4 1 0；RESULT=9 1 1 |
| FORK-0002 | 无阻塞for中的join_none启动时机与共享索引 | D，RESULT=3 9 |
| SHELL-0001 | 含空格位置参数、shift及保留参数边界 | A/D；shift后两项 |
| SDC-0001 | 非50%波形、频率和源延迟辨析 | A/B；83⅓MHz，25% |
| COV-0001 | 分支100%但输入联合组合仅50%的反例 | A/C；漏测01/10 |
| DFT-0001 | 工具修改设计、生成激励与硅上执行测试的区别 | B/D |

类与fork题填补原题库没有的任务；不同于原NBA和display/strobe调度题。脚本题不同于管道退出码/argv调用题。SDC题不同于原slack和多周期预算题。覆盖率题不同于原covergroup交叉分母和加法器功能漏检题，明确训练分支与联合输入组合的区别。DFT题不同于scan逐沿推演、stuck-at传播和at-speed比较。

未采用汇编里条件不足的“异步FIFO最小深度固定为某值”、功耗与温度无关等绝对结论；未照搬其存疑的分支覆盖和DFT答案。无新增模拟电路题，原YHCHub 132项映射统计不变。

## 验证

本地类型检查、242题正式校验（0错误/0教学提醒）、379项Vitest、22项Python测试和生产构建通过。Bash题从网页题干原样提取，使用真实含空格参数运行并逐行比对输出；Windows Git Bash需沙箱外正常MSYS运行环境，本轮已实际通过。

新增`scripts/test-exam-sv.mjs`接入严格test:rtl：直接提取4份完整网页程序，两个类案例用Verilator编译/运行，两个fork案例用Icarus运行；核对全部指定输出。CI安装iverilog和verilator，缺工具或结果不符阻止部署。网页不执行用户代码；类/并发测试程序是仿真语义题，不当作可综合RTL。本机缺HDL工具，仅检查程序提取，不声称本机HDL仿真通过。

本地5208端口实际验收：批次搜索恰好8题；$cast题选择B/D判对并展示解析；重做刷新后解析重新隐藏。390×844视口页面client/scroll均375，代码区client=300、scroll=610，代码横向滚动而页面不溢出，已目视检查并恢复视口。测试数据仅在独立本地来源，不写入正式站点。

## 下一步

继续从已核对汇编筛选设计相关的独立缺口，例如给定库表的输入slew/输出负载延迟查表，以及带明确契约的门级/IO三态题；同时追溯海光、芯原前端岗位的直接笔经。UVM阶段/工厂和动态数组队列作为验证岗位候选，不因汇编列出就大量扩展；不重复堆已充足的FIFO与STA数值题。
