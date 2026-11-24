# STA与CDC起步练习：4道

2026-11-24，应用1.20.0。新增STA/CDC各2道简单题，总218题；原214题逐对象保留，无内部内容版本升级、来源等级提升或历史答案重判。前缀ADAPTED-TIMINGSTART-，搜索“时序与CDC起步练习”；也可在知识专题的STA/CDC路径点击“先练这2题”。

## 来源和独立构造范围

- [AMD UG906报告字段说明（2024.2）](https://docs.amd.com/r/2024.2-English/ug906-vivado-design-analysis/Timing-Path-Summary-Header-Information)：Max/setup和Min/hold的slack公式方向与正负含义。题面报告数值和选项独立构造，明确required/arrival已包含有关延迟，不重复扣setup或uncertainty。
- [AMD XPM_CDC_SINGLE](https://docs.amd.com/r/en-US/pg382-xpm-cdc-generator/XPM_CDC_SINGLE)：目的域同步链与可选源输入寄存器的区别。题目是通用两级结构选择，不要求写宏例化，也不把宏默认级数说成两级。
- [AMD XPM_CDC_HANDSHAKE](https://docs.amd.com/r/en-US/pg382-xpm-cdc-generator/XPM_CDC_HANDSHAKE)：完整握手结束后才启动下一笔。四相req/ack事件合同与选项独立定义，明确上游服从busy、目的端最终服务及不讨论复位中止；不宣称握手能提供无限吞吐。

均为已访问的技术资料，只支持规则方向。新增来源类型practice_collection/C/topic_only_reconstruction，非公司原题，技术文档不是招聘频次证据，前端保持中性说明。

## 与旧题的衔接

旧STA题从tCQ/组合延迟等构造预算，新起步题先读已经算好的required/arrival以及分开的setup/hold结果，属于教学拆解，不冒充新的公式知识点。旧CDC简单题问两级同步器的保障边界，新题先辨认两个寄存器分别由哪个域的时钟驱动；事件握手题先判断busy与完整返回前提，再进入现有toggle漏事件、握手稳定窗口和吞吐推演。

不再新增相似Gray编码、FIFO数值或MTBF倍数题。主路径45个引用及题序未改变，STA/CDC各新增独立warmup轮次；五个专题合计10道起步题，与9题主路径分别统计。旧轮次filtersSnapshot和草稿不迁移。

## 核对与验证

341项Vitest测试，新增7项：四题合同、setup报告−200ps=−0.20ns及单位判分、setup与hold分别满足/违例、目的链时钟归属、四相完整返回与toggle两次抵消的独立逻辑检查、全部55个不同路径引用、起步/阶段/整条路径活动轮次隔离。页面测试检查五个起步入口同时存在。

这些是规则、数值和判分检查，不是原生STA工具分析或亚稳态仿真。本批未新增RTL代码；原21份公开RTL参考、3段起步代码及其附加案例继续由严格CI仿真。22项Python实际运行、类型检查、218题发行校验和构建继续执行。汇编132题号覆盖状态保持99对应/修正、17部分、10需补条件、6暂缓，不因基础规则拆解增加覆盖数。

## 下一步

核心五专题的起步入口已补齐。下一轮优先核对常考综合任务的解题提示与评分点，选少量最容易卡住的STA约束、CDC握手和FIFO边界题改善分步引导，再根据任务缺口补题，避免继续堆叠基础判断题。

页面验收：独立本地端口5201，STA起步第一题−200ps判对；第二题选择C后离开、续练、刷新仍保存选项，可提交并完成原轮次。CDC握手多选A/C判对，390px视口client/scroll均375；检查后恢复视口。本地测试不写线上学习记录。
