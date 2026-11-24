# RTL与协议第三批：8道

日期：2026-11-23；应用1.9.0。原122题逐对象比较未变，新增8题，共130。内部题目版本继续不显示；无历史重判或数据迁移。

均为practice_collection、C级、topic_only_reconstruction。checked仅表示本次访问并核对技术方向，非公司原题。参数、代码与状态契约独立构造。

| ID | 内容 | 方向支持来源 |
|---|---|---|
| ADAPTED-CORE3-SV-0001 | Indexed part-select：加号指定索引方向，不是加数值 | [公开技术/教学来源](https://verificationacademy.com/forums/t/indexed-part-select-referencing-different-width-expr-values/33180) |
| ADAPTED-CORE3-SV-0002 | 同样是>>>：左操作数unsigned时会补符号吗？ | [公开技术/教学来源](https://chromium.googlesource.com/external/github.com/google/styleguide/+/HEAD/verilogguide.md) |
| ADAPTED-CORE3-MEM-0001 | 双口BRAM碰撞：两个写口没有默认赢家 | [公开技术/教学来源](https://docs.amd.com/r/en-US/ug573-ultrascale-memory-resources/Address-Collision) |
| ADAPTED-CORE3-MEM-0002 | 交错bank调度：四个bank不代表八请求两拍完成 | [公开技术/教学来源](https://capra.cs.cornell.edu/seashell/docs/banking.html) |
| ADAPTED-CORE3-RTL-0001 | 4位饱和credit计数器：同时增减与端点优先级 | [公开技术/教学来源](https://hdlbits.01xz.net/wiki/Cs450/counter_2bc) |
| ADAPTED-CORE3-APB-0001 | APB4字节写使能：PSTRB如何合并寄存器 | [公开技术/教学来源](https://documentation-service.arm.com/static/63fe2c1356ea36189d4e79f3?token=) |
| ADAPTED-CORE3-UART-0001 | UART累计采样漂移：周期误差上界不等于器件容差 | [公开技术/教学来源](https://onlinedocs.microchip.com/oxy/GUID-D364745C-8255-47AE-9528-9EB17646EE19-en-US-18/GUID-2966F8A6-816E-45CF-87A6-FB4C876E377D.html) |
| ADAPTED-CORE3-SPI-0001 | SPI Mode 3：首个下降沿后才准备首位 | [公开技术/教学来源](https://onlinedocs.microchip.com/oxy/GUID-6F1B86DC-C230-43D1-A405-0CC2E7EDF7EE-en-US-2/GUID-EAC2D943-F395-4D47-98C8-4EEBC798BFA2.html) |

## 逐题来源范围与去重

- HDLBits公开练习支持饱和计数方向。本题改为4bit、同步清零、独立inc/dec且同时请求恒保持，不复用原题2bit预测器或异步复位契约。完整参考实现自行编写。
- Verification Academy讨论支持indexed part-select的base/常量width方向；Google Verilog指南支持区分signed和unsigned运算。这两题新设值并由HDL实际求值交叉核对。MIT托管IEEE1800-2017 PDF过大，未作为已完整读取来源。
- AMD UG573直接支持共同时钟BRAM碰撞约束；不从单口READ_FIRST题重复推断跨端口数据。Cornell银行映射教学支持交错分组，本题新设自由重排与发射时限模型。
- Arm IHI0024E支持PSTRB按byte lane解释；寄存器部分写语义由本题明确，不声称所有APB外设都如此。
- Microchip UART接收文档支持起始检测与采样方向；题定准确起点、无过采样误差的模型不复制实际芯片接收器，不能将理想5.263%周期边界当器件容差。SPI教学表支持Mode3下降准备/上升采样，新题要求四拍移位而非已有Mode0识别。

## 独立验证与边界

253项前端/内容/存储测试、类型检查、正式题库校验、构建通过；130题0错误及0 Review Warning。新增8项测试覆盖批次与源码一致、64状态请求组合的数学迁移、逐bit重建part-select、signed/unsigned位填充、bank下界与调度构造、16种PSTRB逐byte模型、每个UART bit的采样边界、SPI上升沿状态轨迹。BRAM碰撞题按器件文档逐项技术复核，不用理想软件存储器冒充硬件碰撞行为。

新参考文件rtl/reference/saturating_credit4.sv与网页代码逐字比较。独立TB通过接口初始化全部16状态并遍历4种inc/dec组合，使用整数净变化再钳位的参考模型，检查复位优先、无沿不复位、满空端点反复请求和同时请求保持。总731步，并包含两项原生SV语义检查：D39A[5 +: 4]=C，以及signed/unsigned >>>的−10/54结果。严格CI要求所有10个RTL模块仿真成功后才发布；本机无iverilog/vvp，仅执行源码一致性检查，实际结果以该版本CI为准。

原3个Python参考函数继续逐字核对并实际运行18项测试。本批没有新增Python代码。数字仿真不证明物理STA、模拟亚稳态、BRAM器件碰撞模拟或UART真实容差；UART边界本身不安全。

网页验收检查批次筛选、计数器代码与自评点、APB选择判分、SPI逐拍表及来源说明。
