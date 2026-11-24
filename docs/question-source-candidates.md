# 题源候选台账

初始整理：2026-11-23。下列是交接索引的候选，不表示本轮已访问或验证原题。每次使用前补发布日期、届别、岗位及可见证据；未知字段保留未知。**本轮新增题数为 0。**

| URL / 索引 | 公司/届别（索引信息） | 性质 | 公开材料支持的范围 | 候选题型与分类 | 已用 / 后续动作 |
|---|---|---|---|---|---|
| https://www.nowcoder.com/discuss/802688503929655296 | 瑞芯微 26 | 笔经考点 | 现有索引列 Pulse CDC、adder、AXI 带宽、AHB 等；并非完整原卷 | RTL/数值/波形，04/06/07 | 已用 RK26 四题；原帖仍需重查后扩展其他方向 |
| https://www.nowcoder.com/feed/main/detail/8659c53cb8124313828d5f36f09357fd | 芯动科技 26 | 笔经考点 | CDC 电路/波形；其他细节待核 | 波形，04/cdc | 已用 INNO26 一题；串并方向先与现有串并题去重 |
| https://ac.nowcoder.com/discuss/837148 | 乐鑫旧届 | 笔经考点 | FIFO 深度与 80/50 MHz burst 线索；新相位为项目自定 | 数值，05/fifo-depth | 已用 ESP 一题；原帖此前访问受限，重查后再用 |
| https://www.nowcoder.com/feed/main/detail/905b6fd060b44871adb1a8654255e2f4 | 圣邦微 26 | 考试形式 | 仅手写简答/拍照形式 | 暂无技术候选 | 未用；禁止据此杜撰技术题 |
| https://www.nowcoder.com/feed/main/detail/767a62001bd04a23b961e6f2c3912072 | 新凯来，届别待核 | 笔经线索 | task、fanout、PLL、coverage 等待逐条重查 | 简答/推导，02/03/09/14 | 未用；先核实帖子原文 |
| https://www.nowcoder.com/discuss/353159350510362624 | 联发科旧届 | 笔经线索 | 时钟切换、时序、脚本等，参数未知 | 时序/简答，03/08/13 | 未用；需具体任务，避免只凭主题出“公司题” |
| https://www.nowcoder.com/discuss/490905319980224512 | 大疆旧届 FPGA | 笔经线索 | RTL、总线、CDC、FPGA 资源 | RTL/数值，04/07/14 | 未用；按能力去重后选择 |
| https://www.nowcoder.com/discuss/481038706426535936 | 星宸旧届 | 笔经线索 | signed/位宽、PPA、优化 | 仿真/多选，02/08 | 未用；位宽已有多题，优先实质新任务 |
| https://www.yhchub.com/数字前端数字IC笔试真题与解析.html | 不继承公司归因 | 练习汇编 | 按题号的公开知识方向 | 01–07 多题型 | 已用 24 题；对应 Q 号见两批审核，先查重 |
| https://yueanic.com/ic-interview/c/company-written | 逐条核实 | 分类入口 | 只用于发现可追溯来源 | 待定 | 未用；不能把分类页面当原卷证据 |
| https://cloud.tencent.com/developer/article/2194861 | 华为旧届，岗位待复查 | 求职复盘 | FPGA/逻辑方向，具体条件待核 | 14 | 未用；先核验原帖与年份 |
| https://onefly.top/zero2Leetcode/05_interview/coding/huawei-2027/ | 华为 2027，索引归类 | **面试**整理 | RTL 面试方向 | RTL，06 | 未用；永不标成线上笔试原题 |

新条目追加模板：URL｜访问日期/状态｜页面发布日期｜公司/届别/岗位证据｜笔试/面试/汇编｜原帖实际条件与任务（简述）｜题型/topic/subtopic｜现有题去重｜独立求解方式｜技术待确认点｜使用 ID 或拒绝原因。后续新增先走 [完整流程](QUESTION_SOURCING_WORKFLOW.md)。

## 进阶第一批实际使用记录（2026-11-23）

本次新增 8 道，台账原先“新增0”指教学升级基线。公开汇编对应方向及两份新增教学资料均实际打开；具体条件、波形与 RTL 独立构造。

| URL | 本次核对方向 | 使用 ID |
|---|---|---|
| https://www.yhchub.com/数字前端数字IC笔试真题与解析.html | Q43/Q49–55、Q73/Q76、Q83/Q85/Q86、Q88/Q91/Q92、Q118/Q119 | ADAPTED-ADVANCED-STA-0001/0002、CDC-0001、FIFO-0001/0002、AXI-0001 |
| https://www.cnblogs.com/yinhuachen/p/17325796.html | 握手流水线的 valid/data 保持与空位利用 | ADAPTED-ADVANCED-RTL-0001 |
| https://ee.ac.cn/index.php/archives/587.html | 第6题 Round Robin；不继承 lock 或公司归因 | ADAPTED-ADVANCED-RTL-0002 |

另打开瑞芯微原帖核对候选方向，本批没有新增引用该帖的题；既有题来源字段未改变。技术正确性与去重见 [审核](CONTENT_BATCH_05_ADVANCED.md)。
