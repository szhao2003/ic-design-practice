# 电路脚本与接口第二批：8道

日期：2026-11-23；应用1.8.0。原114题逐对象比较不变，新增8题，累计122。内部版本不在题目展示；既有记录不迁移、不重判。

全部按公开教学/技术方向独立构造，practice_collection、C级、topic_only_reconstruction。checked仅表示本次访问并核对主题；非公司原卷，不继承原参数。没有照搬来源中的整题或代码。

| ID | 内容 | 仅支持知识方向的链接 |
|---|---|---|
| ADAPTED-EXTENSION-I2C-0001 | I²C仲裁逐位推演：发送1却读到0时谁退出？ | [技术/教学来源](https://www.ti.com/lit/an/sbaa565/sbaa565.pdf) |
| ADAPTED-EXTENSION-I2C-0002 | I²C上拉：同时满足上升时间和灌电流 | [技术/教学来源](https://www.ti.com/lit/an/slva689a/slva689a.pdf) |
| ADAPTED-EXTENSION-CIRCUIT-0001 | 带负载分压：输出电阻不能忽略 | [技术/教学来源](https://www.ocw.mit.edu/courses/6-061-introduction-to-electric-power-systems-spring-2011/d79822ef5fbdb21b1c44e1b3b8282453_MIT6_061S11_ch1.pdf) |
| ADAPTED-EXTENSION-CIRCUIT-0002 | 有限脉冲的RC响应：下降段从哪个电压开始？ | [技术/教学来源](https://circuits.mit.edu/_static/S26/handouts/lec06a/slides.pdf) |
| ADAPTED-EXTENSION-TOOLS-0001 | Python读寄存器字节：字节序与signed要分别指定 | [技术/教学来源](https://docs.python.org/3.12/library/stdtypes.html#int.from_bytes) |
| ADAPTED-EXTENSION-TOOLS-0002 | 日志去重：保留最后值，并按最后出现顺序输出 | [技术/教学来源](https://docs.python.org/3.12/library/stdtypes.html#dict) |
| ADAPTED-EXTENSION-PROB-0001 | 测试报Fail后，芯片真的有缺陷的概率 | [技术/教学来源](https://faculty.washington.edu/yenchic/20A_stat512/Lec1_probability.html) |
| ADAPTED-EXTENSION-PROB-0002 | 最多三次重试：完成时间不能直接套无限几何分布 | [技术/教学来源](https://ocw.mit.edu/courses/6-436j-fundamentals-of-probability-fall-2018/f6a391ad22d454dea0903bb72eb58728_MIT6_436JF18_lec06.pdf) |

## 来源与去重

MIT网络理论讲义支持KCL和分压；RC讲义支持电容电压连续和一阶分段响应，区别于已有最大扇出题。Python3.12官方文档支持int.from_bytes的字节序/补码及字典插入顺序；去重函数为独立实现，区别于已有slack日志统计和读scoreboard。

UW概率课支持Bayes及全概率，MIT离散随机变量讲义支持期望与停止前发生事件的分解；参数、筛查模型及有限重试契约独立构造，区别于现有恰一误码和不放回抽检。TI SBAA565第6.1节支持开漏逐位仲裁；SLVA689A支持上拉电阻的电流下限和RC上升时间上限。新设地址0x52/0x56，以及1.8 V、150 pF等条件，不复用其示例参数组合。

WG14 N1570及GNU位移手册本次访问超时，未作为新题来源；C候选未采用。UW两页PDF无可读正文，改用可读课程HTML核对。没有改变既有题来源核验状态。

## 独立技术验证

245项前端/内容/存储测试通过，类型检查、正式题库/教学检查及构建通过；122题0错误及0 Review Warning。新增8项测试包含批次合同、节点导纳与KCL、两段RC微步积分、字节位权与补码、概率树期望人数、穷举三次成功失败路径、只对存活控制器求逐位SDA、逐电阻双约束判定。

关键值：分压1.65 V；RC输出约0.697632 V；big signed字节值−2147483647；Fail后的缺陷概率约26.86567%；无条件传输时间6.68 μs；B在第5bit失去仲裁，总线首字节0xA4；2.2 kΩ满足题定电流/上升时间约束。

Python三个发布函数与网页代码逐字比较，共18项unittest实际运行通过。新增去重函数六项检查覆盖样例、空输入/同键、非字母排序、只遍历一次、输入未变/任意value共享，以及长度0…6、三种key的全部1093种序列对最后索引独立模型核对。网页不执行用户代码，简答仍人工自评。

原9个RTL继续严格CI回归，本批没有新增RTL。RC数学积分不冒充SPICE；I²C理想仲裁和集总RC不冒充模拟波形、信号完整性或板级验收；概率数量为期望账，不保证每批精确数量。

浏览器检查批次8题筛选、Python参考代码揭示、I²C上拉选择判分和仲裁表。CI与部署最终状态以对应版本GitHub Actions为准。
