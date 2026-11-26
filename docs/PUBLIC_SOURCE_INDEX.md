# 公开来源索引

这是公开入口与可用方向，不是公司原题认证。索引根据已有交接材料和仓库来源整理；教学升级时未逐条重开笔经；进阶第一批单独记录本次访问范围，不提高已有题的核验等级。当前 226 题中，44 道原创、7 道公开笔经考点改编、175 道公开教学/练习资料考点改编；未增加转述或原题摘录。

| 资料 | 公开链接 | 允许提炼的方向 / 限制 |
|---|---|---|
| 瑞芯微 26 届数字 IC 笔经 | https://www.nowcoder.com/discuss/802688503929655296 | Pulse CDC、FIFO、功耗、STA/SDC、AXI、带宽、流水线加法器、AHB；目前只据考点改编 |
| 芯动科技，索引标注 2026-09-12 | https://www.nowcoder.com/feed/main/detail/8659c53cb8124313828d5f36f09357fd | CDC 波形、电路、Master/Slave、串并转换；日期未本轮重新核验 |
| 圣邦微，索引标注 2026-09-12 | https://www.nowcoder.com/feed/main/detail/905b6fd060b44871adb1a8654255e2f4 | 仅简答、手写拍照等考试形式；不足以支持某个具体技术题 |
| 新凯来公开笔经 | https://www.nowcoder.com/feed/main/detail/767a62001bd04a23b961e6f2c3912072 | task、fanout/timing、PLL、存储器、FPGA 资源、coverage；待逐条核实 |
| 乐鑫旧届数字 IC | https://ac.nowcoder.com/discuss/837148 | FIFO 深度、Gray、定点数、SV、Memory RTL、低功耗；原帖访问状态须重新记录 |
| 联发科旧届 | https://www.nowcoder.com/discuss/353159350510362624 | 时序、时钟切换、RTL、C 大小端、脚本、系统知识；不冒充当届 |
| 大疆 FPGA 旧届 | https://www.nowcoder.com/discuss/490905319980224512 | RTL、CDC、AXI/I²C、FPGA、CPU pipeline |
| 星宸数字 IC 旧届 | https://www.nowcoder.com/discuss/481038706426535936 | signed/位宽、仿真、PPA、逻辑优化 |
| 数字前端/数字 IC 公开练习汇编 | https://www.yhchub.com/数字前端数字IC笔试真题与解析.html | 已多批提炼考点；132个Q题号覆盖状态见专门审计，不继承其公司归因 |
| IC 企业笔试分类 | https://yueanic.com/ic-interview/c/company-written | 仅检索入口，逐题核对原始证据与答案 |
| 华为数通逻辑旧届复盘 | https://cloud.tencent.com/developer/article/2194861 | FPGA/数字逻辑考点线索，注意年份及岗位 |
| 华为 2027 届 RTL 面试整理 | https://onefly.top/zero2Leetcode/05_interview/coding/huawei-2027/ | **面试**，不能称作在线笔试原卷 |

已有 24 道汇编映射见 [第一批](CONTENT_BATCH_03_YHCHUB.md)、[第二批](CONTENT_BATCH_04_COLLECTION.md)。中性展示标签不删除原 URL 或题号，也不把原创改成“真题”。技术参考另见 [出题工作流](QUESTION_SOURCING_WORKFLOW.md)。

## 进阶批次补充入口

- [握手流水线笔记](https://www.cnblogs.com/yinhuachen/p/17325796.html)：实际打开，支持握手、背压与空位利用方向；教学资料，不称作公司笔试。
- [公开 RTL 练习解析第6题](https://ee.ac.cn/index.php/archives/587.html)：实际打开，支持 Round Robin 方向；公司及年份不继承，本题新设 accept 契约。

本批使用汇编的 Q43/Q49–55、Q73/Q76、Q83/Q85/Q86、Q88/Q91/Q92、Q118/Q119，均按方向独立构造。新增映射与技术验证见 [第5批审核](CONTENT_BATCH_05_ADVANCED.md)。

## 跨专题基础入口

本批首次使用官方门控资料、SVA教学手册、coverage公开问答、cache/流水线课程和scan教学页；另从已核对的瑞芯微笔经提炼功耗方向。全部具体链接、支持范围、独立重设条件和未做的原生仿真见 [第6批审核](CONTENT_BATCH_06_FOUNDATION.md)。教学资料不作为公司笔试证据。

## 电路工具与FPGA入口

新增MIT CMOS/RC、Python官方re/Decimal、WG14 C草案、AMD LUT4/BRAM和公开概率课程入口。各题具体URL及方向支持范围见 [第7批审核](CONTENT_BATCH_07_TOOLS_FPGA.md)。本批均为教学/技术方向改编，不用这些资料证明某公司考过。

核心进阶第二批8题的公开技术来源、逐题支持范围见 [审核表](CONTENT_BATCH_08_CORE.md)。不继承公司或年份归因。

系统与实现第二批的8题技术来源及支持范围见 [逐题审核](CONTENT_BATCH_09_SYSTEM.md)。

电路脚本与接口第二批的来源链接、支持范围与未采用入口见 [本批审核](CONTENT_BATCH_10_EXTENSION.md)。

RTL与协议第三批采用HDLBits、Verification Academy、Google Verilog指南、AMD、Cornell、Arm与Microchip技术资料；逐题支持范围见 [审核](CONTENT_BATCH_11_CORE.md)。

最新公开汇编覆盖情况见 [逐题覆盖表](SOURCE_COLLECTION_COVERAGE.md)，对应226题基线。原“24道汇编映射”仅指最初两批，后续方向支持不应误算成完整逐题移植。技术来源和招聘频率证据继续分开。

## 2026-11-25：公开笔试SV与流程候选已落实

重新读取燧原与芯海往届公开汇编，按能力去重后新增8道EXAMSV题。CSDN原入口仍不可访问，不提升公司/考次归属等级；保留汇编性质。未采用条件不足的FIFO和存疑答案。原132项映射不变，逐题任务、技术来源和复核见[批次25](CONTENT_BATCH_25_EXAMSV.md)。后续优先库表延迟/IO题及直接笔经追溯。


## 2026-11-26：设计岗八股两批补缺

按用户确认的调研方案新增18道DESIGNEXAM题，242→260。标准单元/存储器/SV类型/OCV共10题，重定时/操作数隔离/耦合故障/重命名/ECO共8题。公开目录只支持考点，全部按past_paper_compilation/C/topic_only_reconstruction记录，不继承公司原卷归属。原242题逐对象不变，原创仍44，21道完整RTL仍全部在06。来源实际可见范围、独立求解与下一步见[本批审核](CONTENT_BATCH_26_27_DESIGNEXAM.md)。不增加原132项汇编覆盖率。


## 2026-11-26：验证基础六题

新增6道DVBASE题，260→266。4题依据公开复盘目录方向（队列、monitor phase、virtual interface、参考模型）；动态数组与clocking采样2题明确为规范配套学习，按practice_collection记录，不声称出现在某公司考试。其余4题按past_paper_compilation记录，均为topic_only_reconstruction，不继承公司原卷归属。原260题逐对象不变，原创44、完整RTL21题全部在06。逐题范围、技术核对与验证见[批次28](CONTENT_BATCH_28_DVBASE.md)。
