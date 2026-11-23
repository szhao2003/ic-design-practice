# 公开资料考点扩充（第二批）

版本 1.1.0：新增 12 道，题库由 62 增至 74 道。优先取自公开练习汇编已经出现的题目方向，重新设定具体条件并推导答案，不视为公司原题。来源沿用第一批的原始链接，题号映射如下。

| 本地 ID | 汇编题号 | 题目 |
|---|---|---|
| ADAPTED-COLLECTION-STA-0001 | Q45 | 发射时钟较晚到达时的建立裕量 |
| ADAPTED-COLLECTION-STA-0002 | Q43/Q45 | 同沿最小延迟与保持裕量 |
| ADAPTED-COLLECTION-STA-0003 | Q58 | 工作模式互斥与 false path 的证据 |
| ADAPTED-COLLECTION-STA-0004 | Q62 | 串联仲裁逻辑的最小周期 |
| ADAPTED-COLLECTION-CDC-0001 | Q68 | 解析时间改变后的 MTBF 比值 |
| ADAPTED-COLLECTION-CDC-0002 | Q70 | 相关控制位独立同步后的假组合 |
| ADAPTED-COLLECTION-CDC-0003 | Q81 | 异步复位释放为什么仍需时序检查 |
| ADAPTED-COLLECTION-CDC-0004 | Q69 | 同步链中间节点与可用解析时间 |
| ADAPTED-COLLECTION-FIFO-0001 | Q21 | Gray 解码最低位与归约异或 |
| ADAPTED-COLLECTION-RTL-0001 | Q32 | 带使能的减法计数器回绕 |
| ADAPTED-COLLECTION-RTL-0002 | Q33 | Johnson 计数器的指定初始化周期 |
| ADAPTED-COLLECTION-RTL-0003 | Q31 | 固定周期序列发生器的状态下界 |

## 来源与显示

前台统一使用“公开资料考点改编｜非原题”，不展示汇编站点的名称。列表标签、标签筛选、来源说明和复制题面都使用中性名称；原始 URL 和题号保留在来源详情。checked 仅表示访问并核对汇编题目方向，不表示原卷或公司归因核实。新题的资料性质仍为 practice_collection、C 级。

旧批次只改变显示方式，原有 62 道 JSON 记录、ID、内容版本与历史快照不改写。旧标签值仍可匹配，统一标签可筛选新旧两批 24 道。新批可搜索“第二批资料改编”。

## 技术核对

建立/保持题明确发射和捕获的实际到达时刻以及 min/max 延迟；false path 要求功能证据，模式内互斥不等于所有模式下均可屏蔽。MTBF 比值按题目给定的指数模型推导，参考 [Intel AN42](https://cdrdv2-public.intel.com/653636/an042.pdf)；异步复位 recovery/removal 参考 [AMD 方法说明](https://docs.amd.com/r/en-US/ug1387-acap-hardware-ip-platform-dev-methodology/Synchronous-Reset-vs.-Asynchronous-Reset)。不从“有两级”推出绝对安全。

计数题按有效使能次数和模空间递推；Johnson 周期只针对指定初态轨道；自主周期序列发生器的状态下界与输出宽度区分。所有题都有可核对答案、逐项/逐步解释及易错点。没有声称执行过 HDL 仿真。

新增 6 项测试覆盖中性名称与可追溯链接、统一/旧标签兼容、实际时钟沿时序计算、MTBF 比值、计数轨道及 Gray 解码。全量 190 项测试、类型检查、正式题库校验及生产构建通过。数据库结构与备份 schema 不变。
