# 高频任务与汇编补充：18道

2026-11-23；应用1.10.0。原132题逐对象完全未变，新增18题，总150。内部题目版本不显示，不迁移、不重判已有学习记录。全新增为公开方向独立改编，practice_collection/C/topic_only_reconstruction，无公司归因。

## 先补有招聘证据的任务

完整序列检测、同步FIFO、task/function是前轮盘点提出的缺口。来源线索包括[长江存储面经](https://www.nowcoder.com/feed/main/detail/0ea4b0b72af942b4b819e7751ae592bb?sourceSSR=dynamic)、[星宸旧届题目整理](https://www.nowcoder.com/discuss/481038706426535936)、[新凯来笔试记录](https://www.nowcoder.com/feed/main/detail/767a62001bd04a23b961e6f2c3912072?sourceSSR=post)。这不是频率统计，不把面试算笔试，也不把整理资料当公司认证原卷。

## 本批任务

ID均加ADAPTED-FOCUSED-前缀。

| ID后缀 | 类型 | 本地任务 |
|---|---|---|
| LOGIC-ABS-0001 | multiple_choice | 补码绝对值：最小负数需要额外一位 |
| LOGIC-MUX-0001 | numeric | 用2选1树实现8选1：按内部结点计门数 |
| SV-TASK-0001 | multiple_choice | SystemVerilog task/function：时间、返回值和综合边界 |
| SV-TASK-0002 | waveform_analysis | task的input复制与output返回时机 |
| CLOCK-MUX-0001 | waveform_analysis | 直接组合切时钟：选择信号会制造额外边沿 |
| RTL-FIFO-0001 | rtl_coding | 完整4×8同步FIFO：用沿前空满决定是否接受 |
| MEM-CAP-0001 | numeric | SRAM容量拼接：地址线和数据线共同决定每片容量 |
| RTL-SEQ-0001 | rtl_coding | 带输入空泡的1101重叠序列检测 |
| RTL-DIV-0001 | rtl_coding | 固定三分频：双边沿构造稳态50%占空比 |
| RTL-MIN-0001 | rtl_coding | 流式次小不同值及次数：新最小时继承旧计数 |
| RTL-DEBOUNCE-0001 | rtl_coding | 连续三拍去抖：不是累计三次不同就更新 |
| RTL-LFSR-0001 | waveform_analysis | LFSR状态轨道：给定反馈后再判断周期 |
| AXI-WRAP-0001 | waveform_analysis | AXI WRAP：首地址不必等于整个回绕块下界 |
| APB-STATE-0001 | multiple_choice | APB等待与背靠背：下一笔不能跳过SETUP |
| AXI-DEADLOCK-0001 | multiple_choice | AXI互等死锁：三种合法时序不代表任意依赖都合法 |
| AXI-VERSION-0001 | short_answer | AXI3到AXI4：突发上限与写数据交织不能混为一谈 |
| PPA-CORNER-0001 | multiple_choice | 选更快cell也要看hold与漏电：按表判断修复方案 |
| FLOW-GLS-0001 | short_answer | RTL、等价检查和带SDF门级仿真各能回答什么 |

其余题面source.note保留公开汇编Q号，前台只展示中性资料性质，原URL不删除。[汇编原始链接](https://www.yhchub.com/数字前端数字IC笔试真题与解析.html)本次实际访问；网页HTML仅缓存在忽略目录作内部对照，不发布原题全文或图。GLS题参考公开旧届笔试记录的post-simulation方向，不冒充汇编已有对应题号。

## 重新规定的边界与修正

- FIFO固定4×8、同步复位、沿前空满决定接受、无直通：满时同时读写仅读，空时同时读写仅写；输出数据/valid时刻明确。未将同步FIFO标成Q83完整异步FIFO。
- 序列检测以有效样本为序列，空泡保留前缀但清事件，1101101支持两次匹配；不把源资料缺省输出时刻直接搬入。
- 次小值按不同值定义，start优先清段且不接收同沿数据；最多255样本避免隐含计数溢出，新最小时把旧最小计数转到次小。
- 三分频要求输入50%占空比，双边沿窗口；不承诺复位截断阶段完整脉宽，也不把数字仿真当FPGA时钟网络实现签核。
- 去抖只处理已经同步的输入，连续3拍确认且可被相同stable样本打断；并未完全覆盖原Q127毫秒配置阈值位宽。
- Q30按SystemVerilog允许无参/void function重新构造，不继承旧式一概至少一个input且有数值返回说法。task输入进入复制，output返回复制。
- Q108首地址仅需beat对齐，不能要求按整个WRAP区域大小对齐；新题5C→50→54→58。依据[Arm AXI规范](https://documentation-service.arm.com/static/5f915bbcf86e16515cdc3b23)。
- Q94/95背靠背可直接ACCESS→SETUP，不必先IDLE；但不能跳过SETUP。依据[Arm APB规范](https://documentation-service.arm.com/static/63fe2c1356ea36189d4e79f3?token=)。
- Q125明确1bit 2选1基本器件后计算树结点，不能将输入bit数当器件数。Q39先扩宽后求绝对值，覆盖最小补码负数。
- 无毛刺切换只给明确反例与实现前提，不把两拍sel同步当通用修复；LFSR给实际反馈轨道，不声称任何反馈/零初态都周期2^N−1。

## 验证

269项前端/内容/存储测试、类型检查、正式题库校验及构建通过；150题0错误及0 Review Warning。数学/状态检查包括ABS全部16值、MUX结点、WRAP模地址、互等00固定点、延迟双界、SRAM字节容量、LFSR轨道与132覆盖引用合同。

新5份网页RTL逐字对应rtl/reference文件。独立TB：FSM遍历1024个10bit流并插空泡；FIFO遍历4096种六拍请求序列并长期绕回/复位，对照软件队列；次小统计对照256桶直方图；去抖遍历256个8bit流并对照三样本历史；三分频直接量测周期30ns及高低15ns并测试非边沿复位。

严格RTL入口共有15份参考模块，并额外运行source_review_rules_tb，实际核对task三个观察时刻、无参/void function、扩宽绝对值和LFSR。CI必须全通过才部署。本机无iverilog/vvp，--if-available仅核对代码一致性，不写成实际仿真成功。Python仍为原3个函数18项实际运行测试，无用户代码在线执行。

浏览器验收覆盖FIFO/次小RTL、选择/数值/波形、来源、重做隐藏与手机代码横向滚动；具体CI与部署结果以本提交Actions为准。
