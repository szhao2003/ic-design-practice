# 设计岗八股补缺：两批18题

2026-11-26，应用1.30.0；242→260题。统一搜索“设计岗八股补充”。第一批搜索“设计岗基础补缺”10题，第二批“设计理解与推导”8题。全部是公开资料方向的独立重构，非完整试卷搬运，原242题对象及原21道RTL分类不变，原创仍44题。

## 题源与证据限制

本轮重新读取以下公开页面。CSDN技术题主要为公开目录，完整题面/选项/解析未开放；不绕过付费，不把目录扩写后的条件冒充考生原题。所有新增题均保守记为past_paper_compilation/C/topic_only_reconstruction，不设置company或继承考试日期。下面的考试时间只记录页面自述，尚非独立验证。

| 入口 | 实际可见方向 | 页面自述考试时间/限制 |
|---|---|---|
| [小米SoC复盘](https://blog.csdn.net/lum250/article/details/128962198) | 单元阈值/驱动能力、DDR带宽、功耗等目录 | 2022-08-13；标题2023是秋招届别口径，页面最新推荐时间不当原发布日期 |
| [芯原前端设计/验证复盘](https://blog.csdn.net/lum250/article/details/128977989) | SRAM端口、队列、低功耗等目录 | 2022-08-28；仅按公开目录确认方向 |
| [华为数字芯片复盘](https://blog.csdn.net/lum250/article/details/128762539) | SRAM/DRAM、翻转活动、高Vt、移动寄存器、逻辑状态等目录 | 2022-07-29；完整题面不可见 |
| [海光设计复盘](https://blog.csdn.net/lum250/article/details/128962147) | 位宽、metal ECO、寄存器重命名等目录 | 2022-08-13；完整题面不可见 |
| [海光往届汇编](https://www.nowcoder.com/discuss/353159156494442496) | 正文第4题耦合故障，第5题OCV/derate | 2022-02-12发布，正文自述2021-08-25；汇编归属未独立核实 |
| [燧原往届汇编](https://www.nowcoder.com/discuss/481041431860092928) | 正文cell delay与input transition/output load | 页面2023-04-27编辑；公司/原考次未独立核实 |

这批未得到官方完整试卷，也未建立跨作者独立样本，不能计算各公司覆盖百分比或声称某考点年年必考。近期直接笔经仍是后续检索重点。小红书公开网页定向检索未找到可核实的对应题帖，不将不相关检索结果列为证据。

## 逐题任务与答案（统一前缀ADAPTED-DESIGNEXAM-）

| 第一批10题 | 考查任务与结果 | 去重/边界 |
|---|---|---|
| CELL-0001 | slew/load双线性插值47.5 ps | 不同于已有RC估算；教学表不是实测工艺库 |
| CELL-0002 | 本级加速35 ps、前级变慢50 ps，路径净慢15 ps，B/D | 不同于既有setup/hold多角选库方案，专查前级负载代价 |
| CELL-0003 | HVT漏电/速度/VDD辨析，A/C | 原PPA选库题的基础概念拆解，不增加新考点频次证据 |
| MEM-0001 | SRAM/DRAM刷新与易失性，A/D | 原库没有DRAM刷新专题；无电池备份等变种 |
| MEM-0002 | 持续1R1W用R/T，2R用T，同址语义未知 | 原容量/碰撞任务的端口合同入门；不按供应商名称一概而论 |
| MEM-0003 | 800MHz、16bit、DDR峰值3200 MB/s | 外部CK/MT/s明确，非有效吞吐或双向叠加 |
| TYPE-0001 | bit/logic/int/integer默认值，C | 模块级变量，无其他驱动；不代表硬件上电值 |
| TYPE-0002 | X/Z转二态后丢失，B | 原X比较题的不同任务：转换前/后诊断能力 |
| TYPE-0003 | 特殊填充/零扩展/截断，D | 与旧signed移位及算术尺寸题区分；无混合算术 |
| OCV-0001 | 数据late=0.88ns、early=0.27ns | 只缩放指定数据延迟，不据此推导整条slack |

| 第二批8题 | 考查任务与结果 | 去重/边界 |
|---|---|---|
| RETIME-0001 | retiming、额外一拍、调skew辨析，A/D | 原逻辑划分平衡题之外的语义条件 |
| RETIME-0002 | 反相跨寄存器要求B复位1，输出1/1/0/0 | 题定单时钟同步复位；只比稳定数字观察点 |
| POWER-0001 | 输入操作数隔离与末端MUX区别，B/C | 原时钟/电源门控之外的组合活动抑制 |
| POWER-0002 | 空闲比例边界15%，严格收益p>15% | 不同于原断电唤醒能量摊销，全部额外平均代价显式给定 |
| MBIST-0001 | 攻击位0→1使受害位强置1，先激活后读；重写会掩盖 | 原描述补完整故障模型，只检测此单向故障，不泛称March全覆盖 |
| ARCH-0001 | 重命名去WAW/WAR不去RAW，A/C | 不同于load-use转发/暂停，消费者绑定特定物理版本 |
| ECO-0001 | MUX实现AND并穷举真值表 | 原MUX逻辑题的备用资源应用变式，非RTL手撕 |
| ECO-0002 | metal-only资源限制与修订规格验收，B/D | 旧网表有错，不能用“必须与旧错误全等价”替代修复目标 |

## 独立技术复核

题源用于证明曾有相关方向，技术资料只用于核对答案，不作为招聘考频证据。

- SV：本地核对[IEEE 1800-2017公开课程版](https://fpga.mit.edu/6205/_static/F25/documentation/1800-2017.pdf)的6.8默认值表、6.11状态类型/转换、5.7常量与赋值尺寸规则。三份网页完整程序直接提取，交给四态Icarus仿真，不用二态仿真冒充X/Z检查。预期输出分别为`RESULT=1 1 1 1`、`RESULT=1xz0 1000 1 0`、`RESULT=ff 01 6d`。
- 单元优化：[OpenROAD Resizer](https://openroad.readthedocs.io/en/latest/main/openroad/rsz/README.html)核对slew/load及尺寸优化的相关性；[Synopsys多Vt说明](https://www.synopsys.com/articles/optimizing.html)核对漏电与性能取舍。数字表、前级代价均为题定模型，插值和总延迟独立计算。
- 存储器：[Infineon SRAM](https://www.infineon.com/products/memories/sram-static-ram)核对易失性和无刷新机制；[Altera带宽手册](https://docs.altera.com/r/docs/683385/current/bandwidth?contentId=yu~ZmEagXDY9i_A_VkKRsw)核对宽度×传输率与DDR双沿倍率。三种端口能力由题目直接规定，不借厂商命名推断碰撞行为。
- OCV：[OpenSTA命令说明](https://opensta.readthedocs.io/en/latest/Commands/#set_timing_derate)区分early/late、data/clock与delay缩放；仅作教学flat-derate模型，不给真实工艺签核参数。
- 重定时：[Intel Hyperflex手册](https://cdrdv2-public.intel.com/704786/s10_hp_hb-19-3-683353-704786.pdf)中的初始状态与复位限制。测试穷举六沿的4096组输入/复位序列，另列错误复位映射反例；本题不套用该器件所有实现规则。
- 操作数隔离：按“固定组合输入→阻断外部活动传播”的题定模型推导；平均功耗独立列式，在阈值两侧和等于处检查。不将无法访问全文的论文摘要当作已经读完的规范。
- 存储耦合：用健康/故障两个明确状态模型独立执行两种写入顺序，验证激活与掩盖；不沿用汇编笼统的模式答案。
- 重命名：[Wisconsin CS/ECE752原课程](https://pages.cs.wisc.edu/~sohi/cs752/Spring2024/Slides/05_ooo.pdf)确认RAW保留和WAW/WAR消除；独立版本映射核对消费者来源。
- ECO：[Synopsys ECO资源说明](https://www.synopsys.com/designware-ip/memories-logic-libraries/eco-kits.html)核对既有器件/metal-only概念；MUX方案四行穷举验证，物理与时序仍需独立签核。

## 验证与发布要求

本地通过260题正式结构/教学校验（0错误、0教学提醒）、TypeScript检查、390项Vitest、22项Python回归与生产构建。8项新增内容测试覆盖独立插值、单位、收益边界、状态映射、故障激活/掩盖、真值表及重命名。

本机没有Icarus/Verilator，不宣称已在本机完成HDL仿真。`scripts/test-design-exam.mjs`接入严格`test:rtl`，直接提取3份网页程序，在CI真实四态仿真并核对输出；缺工具或不符均阻止发布。CI和部署结果以本次提交的GitHub Actions为准。

浏览器验收限制：本机Vite预览已正常启动，但内置浏览器访问本机5208端口超时；改用本机Edge时，工具返回未获控制授权。本轮未完成交互式桌面/手机验收，不把此前版本的目视检查作为本批通过。已有React渲染、存储与练习流程回归仍通过。

## 下一步

先复核这一批的学习体验与重复度；继续追溯近期前端设计岗的直接笔经，优先有明确任务和条件的题。验证方向可再小补约6题：队列/动态数组、clocking block、virtual interface、UVM phase、参考模型；这些尚未在本轮实现。仍不大量重复FIFO/CDC深度题，不扩展模拟电路冷门记忆。后续完整RTL手撕始终集中06。
