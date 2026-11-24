# 总线响应与时钟时序：12道

2026-11-24；应用1.15.0。新增12题至186；旧174题逐对象不变。统一ADAPTED-BUSTIMING-前缀，搜索“总线响应与时钟时序”。公开汇编只作任务参考，来源practice_collection/C/topic_only_reconstruction，无公司归因。

APB两题：版本增量、多拍等待中的错误完成；AXI三题：传统2bit响应码、读错误burst、读写响应通道组织；AHB-Lite三题：两拍ERROR、IDLE/BUSY、等待地址接受与数据归属；STA三题：对应边沿skew与周期变化、实际边沿setup预算、hold最小延迟；吞吐一题：固定同频同宽模型比较。

实际访问[汇编](https://www.yhchub.com/数字前端数字IC笔试真题与解析.html)。技术核对：[Arm APB修订说明](https://documentation-service.arm.com/static/60d5b505677cf7536a55c245)、[传统AXI响应](https://documentation-service.arm.com/static/602a9df190ee6824a1e02b98)、[AHB-Lite ERROR](https://documentation-service.arm.com/static/5f914801f86e16515cdc2a27)、[AHB-Lite传输类型](https://documentation-service.arm.com/static/64258237314e245d086bc8c6)、[AMD uncertainty](https://docs.amd.com/r/2024.2-English/ug835-vivado-tcl-commands/set_clock_uncertainty)。接口版本固定，不套用AXI5扩展或完整AHB的RETRY/SPLIT。未复制来源题面、代码或公司标签。

核对方法：APB三条件完成布尔表、AXI按握手计4beat及末拍、AHB按当前数据/下一地址分开记账；STA按实际源/目的到达时刻独立求界，setup +0.20ns、Dmin 0.58ns，skew三次均0.30ns而周期10.15/9.80ns；固定模型吞吐200/400MB/s。新增5项测试，原21份RTL及附加仿真继续严格CI回归。本批无新增RTL，不把表格计算写成协议RTL仿真或STA签核。

覆盖提升Q56/Q96/Q100/Q102/Q104/Q105/Q115/Q116；Q101仅补IDLE/BUSY，等待期间HTRANS全部例外仍部分覆盖，RETRY/SPLIT和完整AXI跨域仍未覆盖。最新统计按机器清单生成。

下一批安排：转回相对薄弱的DV/DFT与实现基础，先核对公开任务，计划集中补背压/SVA、scoreboard错误传播、覆盖盲区、故障激活与传播，及低功耗控制时序；同样按完整批次验证后发布，不逐小节索要“继续”。

本地验收：305项测试、类型检查、186题正式校验、18项Python检查及构建通过；旧174题逐对象未改。独立预览实际检查AXI多选A/D、setup输入0.2ns均判对，AHB ERROR完成/取消解析、辅助自评后重做隐藏及批次12题检索。学习测试数据仅存在本地独立端口。最终HDL与部署以本提交Actions为准。
