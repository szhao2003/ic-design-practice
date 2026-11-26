# 验证基础六题

2026-11-26，应用1.31.0；260→266题。统一搜索“验证基础补充”。02新增两题容器读程序，09新增四题验证概念/采样/检查。完整RTL手撕数量与归类不变，原260题逐对象保持不变，原创仍44。

## 来源账目

本轮重新读取[芯原设计/验证复盘公开目录](https://blog.csdn.net/lum250/article/details/128977989)，公开可见queue方法与monitor采样phase方向。重新读取[华为数字芯片复盘公开目录](https://blog.csdn.net/lum250/article/details/128762539)，公开可见virtual interface作用与参考模型是否支持时序方向。仅目录公开，完整题面、答案没有开放，未访问付费内容。4题保守记为past_paper_compilation/C，均是本项目独立构造条件、代码、数据和选项；不设置公司或原考次字段，不称作核实原题。

动态数组与clocking采样两题直接依据[IEEE 1800-2017公开课程版](https://fpga.mit.edu/6205/_static/F25/documentation/1800-2017.pdf)，记为practice_collection/C。它们是配套基础练习，未取得“这两个完整任务出现在目标公司笔试”的证据，不能合并宣称六题都来自公司真题。所有新增题questionFidelity均为topic_only_reconstruction，sourceClaimVerification=checked。

近期检索包含“数字IC 验证 笔试 2026 芯原 海光”“数字IC 笔试 2027 燧原 小米 前端”等组合。出现部分2026面经汇总、招聘页和未能追溯的所谓真题文档，未确认独立亲历原帖或具体笔试条件，因此未提高考频、公司或届别证据等级；不把面试资料或招聘职责直接当作笔试记录。此轮没有新增近期公司原题认证。

## 逐题差异与技术复核

统一前缀ADAPTED-DVBASE-。

| 题号 | 题源支持范围/技术规则 | 独立任务与结果 |
|---|---|---|
| QUEUE-0001 | 芯原公开目录支持queue方法；IEEE 7.10.2核对insert/delete/push/pop | 无界整数队列的头尾和索引变化，B：RESULT=20 2 7 10；明确不含越界/空弹出 |
| ARRAY-0001 | IEEE 7.5.1、7.6技术方向，非公司考次证据 | new[4](a)保留旧前缀，新增int为0，整数数组赋值独立复制；D：RESULT=9 6 0 0 3 2 |
| CLOCKING-0001 | IEEE 14.3、14.4、14.13技术方向，非公司考次证据 | input #1step取沿前35，input #0取本时间槽Observed的A6，A；排除读clockvar时的竞态 |
| VIF-0001 | 华为目录支持virtual interface作用；IEEE 25.9 | 虚接口改绑不创建/复制接口，未初始化null应正确处理，A/C |
| PHASE-0001 | 芯原目录支持monitor采样phase；Accellera UVM 1.2 | build/connect为function，run为task；forever不自动维持phase存活，B/D |
| MODEL-0001 | 华为目录支持参考模型可含时序方向；独立周期模型 | 第2沿接受7F，第4沿前到期80；只在第5沿输出为迟到，不因值一致判成功 |

技术核对另外使用[Accellera UVM 1.2 User Guide](https://www.accellera.org/images/downloads/standards/uvm/uvm_users_guide_1.2.pdf)中的monitor/run、scoreboard示例，以及[Class Reference](https://www.accellera.org/images/downloads/standards/uvm/UVM_Class_Reference_Manual_1.2.pdf)中的phase回调类型和task phase生命周期。这里只声明UVM 1.2题定语义，不无条件推广自定义phase domain。

容器题不同于现有类句柄别名、$cast与fork题；数组元素明确为int，不把“容器按值复制”误称对嵌套对象深拷贝。clocking题不同于既有display/strobe及SVA取样，明确比较两个input skew。参考模型题不同于既有乱序响应scoreboard代码题，关注固定延迟检查的独立盲区。已有总线/FIFO/CDC题不重复扩充。本批没有UVM手写环境、完整RTL模块或工厂冷门机制题。

## 验证

本地类型检查、266题正式结构/教学校验（0错误/0教学提醒）、397项Vitest通过。新增7项内容检查包括整数容器独立模型、采样顺序、迟到反例/正确周期对照，以及全部六题使用实际React Markdown组件渲染题干、解析和来源，确认代码围栏与表格正常生成。存储/历史/重做等原回归继续通过。

容器程序从网页题干原样提取，新增`scripts/test-dv-foundation.mjs`接入严格`test:rtl`，用Verilator编译和运行两份完整SystemVerilog程序，并逐行比对RESULT。本机无Verilator，不把提取成功说成仿真通过；严格CI缺工具或输出不符会阻止发布。clocking、virtual interface和UVM题为规范/模型检查，没有运行完整UVM仿真，不声称已模拟UVM环境。

沿用现有浏览器访问限制，本轮未完成交互式桌面/手机验收；自动Markdown渲染检查不等同目视检查。Python回归、生产构建、严格HDL检查及部署结果以本次GitHub Actions为准。

## 下一步

本轮完成此前约6道验证基础配套计划。后续优先追溯较新、岗位明确且有具体条件的前端设计笔经，按任务差异补缺；不按公司名称机械凑题，也不因UVM目录出现就继续扩大验证专题。已有题的含混条件或参考答案问题优先修正；完整RTL继续集中06。
