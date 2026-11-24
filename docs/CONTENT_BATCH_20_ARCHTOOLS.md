# 体系结构与脚本调试：10道

2026-11-24；应用1.17.0。新增10题至208，旧198题逐对象保留，不改学习记录。统一ADAPTED-ARCHTOOLS-前缀，搜索“体系结构与脚本调试”。资料是技术方向依据，不是公司原题或考频证据。

## 内容与来源

体系结构5题：load-use与ALU转发排程、分支误预测CPI、4-way缓存地址拆分、明确允许非对齐的小端半字、非一致性DMA所有权与地址空间。工具5题：引号CSV、Bash pipefail、subprocess参数与返回码、文件编号排序、Decimal负零与路径去重。

- [Cornell流水线课程](https://www.cs.cornell.edu/courses/cs3410/2017sp/projects/p2/)：冒险和转发方向；本题阶段与额外罚时由题面独立规定，不继承具体MIPS延迟槽规则。
- [Cornell缓存课程](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/caches.html)：set/way及tag/index/offset。容量和地址独立构造。
- [Python字节序](https://docs.python.org/3/library/stdtypes.html#int.from_bytes)：小端解释依据，不用于声称任何ISA都允许非对齐。
- [Linux DMA指南](https://docs.kernel.org/core-api/dma-api-howto.html)：非一致性同步与CPU/设备地址空间；不让考生猜平台API名称。
- [CSV](https://docs.python.org/3/library/csv.html)、[subprocess](https://docs.python.org/3/library/subprocess.html)、[pathlib](https://docs.python.org/3.12/library/pathlib.html)、[Decimal](https://docs.python.org/3/library/decimal.html)：标准库行为依据。
- [Bash pipeline](https://www.gnu.org/software/bash/manual/html_node/Pipelines.html)：pipefail取最右侧非零状态；本批按规则推导，未声称实际执行Bash。

## 去重与验证

旧题已有缓存命中率、基本CPI、流水吞吐、日志负值汇总和按key保留最后记录。本批补不同任务：按值就绪时刻插气泡、误预测增量与退休分母、按容量推导字段、非对齐字节选取、cache所有权；工具侧补语法解析与操作系统调用边界。新题不只更换旧数值。

320项Vitest测试（新增7项）检查批次合同、流水EX=[3,5,6]/WB=[5,7,8]、CPI=1.1、地址重组、index=175/tag=0x48D2/offset=13、半字13398、多选判分、最右失败与排序/去重。Python实际执行22项测试：原18项加本批4项，直接从已发布题面提取CSV、文件名和Decimal记录，并真实创建子进程验证空格参数、stdout/stderr与退出码7。三份原公开Python参考函数仍逐字核对。

类型检查、208题正式校验、构建和旧198题对象不变对照需通过后提交。原21份参考RTL及额外语言/容量案例由严格CI执行后部署；本机无iverilog，源码一致性检查不冒充HDL仿真。本批不新增原生SVA、物理STA或设备DMA运行声明。132题号汇编覆盖保持99对应/修正、17部分、10需补条件、6暂缓，不因技术方向改编增加覆盖计数。

## 下一步

先整理现有题的重复度、难度和推荐练习顺序，重点检查STA/CDC/FIFO/RTL/总线的核心任务是否形成从基础到综合的路径，再补少量确有价值的缺口；不为增加总数继续堆相似算题。

页面验收：argv多选A/C和cache数值175均判对；CSV解析、自评及重做后隐藏正常。390px视口页面client/scroll均375，CSV代码区域宽300且无溢出。测试数据只留在本地独立端口。CSV和排序题使用简答题型，避免错误标成波形题。
