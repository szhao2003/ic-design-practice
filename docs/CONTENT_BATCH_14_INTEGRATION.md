# 完整接口与时序约束：6道

2026-11-24；应用1.11.0。旧150题逐对象保留，新增6题，总156。新题内部contentVersion=1，不在题头显示版本，不改用户学习记录。新题均为practice_collection/C/topic_only_reconstruction，无公司归因；搜索“完整接口与时序约束”。

## 来源与去重

本次重新访问[公开汇编](https://www.yhchub.com/数字前端数字IC笔试真题与解析.html)，Q61提出多周期setup/hold，Q83提出完整异步FIFO，Q118/119提出AXI4-Lite配置与地址/数据独立。只取任务方向，不转录原题代码、图片或公司标签。所有接口、地址、复位、响应时刻与数据由本批独立规定。

| ID（统一加ADAPTED-INTEGRATION-前缀） | 任务 | 与已有题的区别 |
|---|---|---|
| FIFO-0001 | 完整参数化异步FIFO RTL | 原有题只推指针，本题同时实现存储、两个域、同步器、标志、寄存读与复位 |
| FIFO-0002 | 同步链到空标志的逐沿延迟 | 与RTL配套分析旧值/NBA，说明R3解空、R4接受及valid/empty并存 |
| AXIL-0001 | 完整两寄存器AXI4-Lite从设备 | 原有题只给AW/W/B波形，本题含五通道、byte写、错误响应、读快照与背压 |
| AXIL-0002 | 部分写、同沿读旧值、旧响应快照 | 具体两个写掩码并在R背压期间更新寄存器，独立推各沿结果 |
| STA-0001 | 多周期SDC与功能前提 | 旧题不要求命令，本题限定工具和同钟同相enable，解释setup3/hold2及流水线反例 |
| STA-0002 | 三周期setup预算及同沿hold | 引入明确插入延迟/uncertainty，分别核算max/min边界及单位 |

## 技术核对

- [AMD Vivado 2023.2 set_multicycle_path命令参考](https://docs.amd.com/r/2023.2-English/ug835-vivado-tcl-commands/set_multicycle_path)：同钟关系中的setup/hold配对、默认start/end与例外作用范围。数字题独立算得最大组合11.40ns、hold slack +0.03ns；未运行真实STA工具或网表约束解析。
- [Arm写响应依赖规范](https://documentation-service.arm.com/static/64256e84314e245d086bc88f)：B响应必须在写地址/数据已接受后提供，不以BREADY为先决条件。[设计作者的AXI-Lite实现文章](https://zipcpu.com/blog/2020/03/08/easyaxil.html)用于复核独立缓存及strobe方向。没有复制其代码；本题明确吞吐与冲突语义。
- [设计作者的异步FIFO说明](https://www.verilogpro.com/asynchronous-fifo-design/)用于核对注册Gray、next比较、最高两位翻转及物理延迟前提。本题独立实现寄存读模式；没有复制文章的FWFT接口或TB。

## 独立验证及范围

维护侧两份RTL与网页代码完全一致，并进入严格test:rtl映射（共17份参考实现）。

- async_fifo_gray_tb：三组容量/位宽（4×8、8×13、16×1），写快/读快两类时钟；各三轮填满、排空、持续混合读写与绕回，前两轮在有在途数据时协调复位。独立线性队列核对接受顺序，检查容量、读数据/valid、未读保持和复位；测试时两域边沿不重合以避免队列本身竞争。未覆盖所有参数、相位或真实亚稳态。
- axil_regs2_tb：两寄存器、全部16种WSTRB、AW先/W先/同拍三种顺序，B/R多拍背压、非法及未对齐地址、同沿读写旧值、R等待时后续写、地址/数据单边在途复位和双响应在途复位。数据模型使用独立整字mask合并，读快照先于同沿提交；检查响应时刻/稳定性及寄存器副作用。未声称高吞吐、全协议形式证明或权限控制。
- 前端/内容测试额外穷举Gray满比较与绕回的四种深度、逐沿同步链、byte数组合并、setup/hold算式及ns/ps判分；检查源码一致性和人工评分边界。

本机无iverilog/vvp；本机--if-available只做17份代码一致性，不代表仿真通过。CI严格执行全部HDL用例，必须成功才部署。276项前端/内容/存储测试和18项Python参考测试；最终执行结果以本提交Actions为准。

所有数字仿真均不代替模拟亚稳态、MTBF、综合RAM映射、CDC/RDC静态检查或物理STA。异步FIFO要求协调复位及各域安全释放，不支持业务运行中任意单域复位；支持深度为2的幂且ADDR_BITS>=2。AXI模型忽略AxPROT，不提供权限隔离；同拍读旧值属于题定实现，不冒充AXI全局规定。

## 覆盖清单

Q61从需补条件变为已修正改编，Q83/Q118从部分覆盖变为已有完整对应任务。当前80题号有对应/修正任务，28部分覆盖、12需补条件、12暂缓；不是新增80题，也不是原站全部完成。详见[覆盖对照](SOURCE_COLLECTION_COVERAGE.md)。
