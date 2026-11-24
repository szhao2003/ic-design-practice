# 进阶练习第一批：8 道

日期：2026-11-23；应用版本 1.3.0。原有 74 道逐对象比较保持一致，新增 8 道，当前共 82 道；题目版本编号继续隐藏，学习存储结构不变。

## 选题与去重

| 新 ID（均加 ADAPTED-ADVANCED- 前缀） | 类型 | 本批新增能力 | 与既有题的区别 |
|---|---|---|---|
| STA-0001 | 数值 | 同时满足 setup/hold 的延迟可行区间 | 不只单独计算一个 slack，要取两侧约束交集 |
| STA-0002 | 多选 | 不同 min/max 增量及 capture 调整的修复取舍 | 逐方案计算两个 corner，而非只判断增大延迟的方向 |
| CDC-0001 | 波形自评 | 四相握手保持请求、防重复捕获与返回空闲 | 从握手思路落实到 IDLE/WAIT_LOW 的逐沿行为 |
| FIFO-0001 | 数值 | 读侧暂停、恢复同刻读写的占用峰值 | 已有 burst 题为连续读；本题有明确暂停窗口 |
| FIFO-0002 | 多选 | next Gray 满比较、高两位反相及同步保守性 | 已有同步二进制满题不涵盖异步 next 指针 |
| RTL-0001 | RTL自评 | 一字弹性级、背压保持与同沿替换 | 原加法流水线无 ready；本题必须按存储容量流控 |
| RTL-0002 | RTL自评 | 四路 Round Robin、按实际服务更新起点 | 原仲裁器固定优先级；本题增加公平性状态和 accept |
| AXI-0001 | 波形自评 | AXI4-Lite AW/W 独立到达、B 响应依赖 | 原题只看单通道，本题分别跟踪三个握手 |

难度为 4 道中等、4 道困难；不是把简单题只换数字凑数量。全部为根据公开方向独立构造的题，均非原题转述或原卷。

## 来源证据与技术参考分别记录

2026-11-23 实际打开并核对以下公开页面。本批不继承资料中的公司/届别归因，也不照搬其中答案。网站来源显示中性“公开资料考点改编｜非原题”，保留原 URL 与定位。

| 资料 | 支持本批的范围 | 使用题 |
|---|---|---|
| [数字前端/数字IC公开练习汇编](https://www.yhchub.com/数字前端数字IC笔试真题与解析.html) Q43、Q49–55 | setup/hold、修复方向 | STA 两题；参数与方案独立设定 |
| 同上 Q73、Q76 | 多位跨域握手方向 | CDC 题；状态规则、输入表与 payload 独立设定 |
| 同上 Q88、Q91、Q92 | 有限 burst、等待和深度推导 | FIFO-0001；未沿用来源有争议的原参数/答案 |
| 同上 Q83、Q85、Q86 | 异步 FIFO Gray 指针与满空 | FIFO-0002；数值与选项独立构造 |
| 同上 Q118、Q119 | AW/W/B 的独立握手与响应依赖 | AXI-0001；特指 Lite，未混入完整 AXI4 的 WLAST |
| [握手流水线笔记](https://www.cnblogs.com/yinhuachen/p/17325796.html) | 握手两侧、背压保持和空位利用 | RTL-0001；本题模块和测试独立编写，不宣称是公司笔试题 |
| [公开 RTL 练习解析，第6题](https://ee.ac.cn/index.php/archives/587.html) | Round Robin 仲裁方向 | RTL-0002；不采信公司认证，省去来源 lock 契约并明确重设 accept，故不是忠实转述 |

资料类型均用 practice_collection、C 级；checked 仅表示链接及方向核对，不代表公司原题或外部答案认证。已有 6 道笔经题的来源状态未在本批提升；新打开瑞芯微原帖用于候选复查，没有新增归于它的题。

技术校验参考：

- [AMD UG1388：时序裕量](https://docs.amd.com/r/2023.1-English/ug1388-acap-system-integration-validation-methodology/Reviewing-Timing-Slack)：预算与 skew 对两种检查的方向。
- [Arm：Introduction to AMBA AXI4](https://developer.arm.com/-/media/Arm%20Developer%20Community/PDF/Learn%20the%20Architecture/102202_0100_01_Introduction_to_AMBA_AXI.pdf)：独立通道、握手及写响应依赖；本题明确 Lite 单 beat，没有 WLAST。
- [AMD XPM_CDC_HANDSHAKE](https://docs.amd.com/r/2021.1-English/ug1344-versal-architecture-libraries/XPM_CDC_HANDSHAKE)：完整握手传宽数据的适用边界。题目是明确约束的理想状态机，不是该宏的复刻。
- Gray 满条件采用二进制距离和全部合法状态穷举独立证明；两个 RTL 采用独立队列/循环距离模型，不用来源代码当作唯一答案。

## 复验结果与限制

- 本地 TypeScript、正式题库与教学辅助校验通过；82 题，0 错误、0 review warning。
- 本地 203 项测试通过，新增 6 项包含八题的来源/版本合同、修复区间、四方案双裕量、完整队列事件枚举、所有合法指针 Gray 满关系、握手与跨通道状态推演。
- 本地构建通过，保留已有 bundle 大小提示；没有新增运行时依赖。
- 本机仍缺 iverilog/vvp，HDL 明确 SKIP；9 份网页代码与参考文件逐字一致。CI 使用严格模式运行全部 9 个 Testbench，任一失败会阻止 Pages 发布，结果以 [Actions](https://github.com/szhao2003/ic-design-practice/actions) 为准。
- 弹性级 TB：典型空槽接收、满态连续停顿、同沿替换、空泡、1000 拍确定性随机 source/consumer、全程独立单槽 FIFO scoreboard、排空计数、在途复位取消；源在被背压时保持待发数据。
- RR TB：全部 4 个扫描起点 ×16 请求掩码 ×2 accept 条件，另检查连续请求公平轮转、停顿不推进、空请求及复位。通过外部服务构造起点，不读取内部 DUT 状态。
- 实际页面：900 ps 作答换算为 0.9 ns 判对；AXI 表格与自评点可见；两道 RTL 揭示前无代码复制按钮、揭示后完整模块可读；题头无 v1/v2；搜索“进阶练习第一批”恰好匹配 8 题。

参考仿真是维护侧数字功能检查，不执行用户提交代码，也未做物理实现、门级 STA 或模拟亚稳态验证。既有 74 题、旧快照及个人学习进度不迁移、不清空、不重判。
