# 电路工具与FPGA第一批：8 道

日期：2026-11-23；应用1.5.0。原90题逐对象比较不变，新增8题后共98题。11/13/14/15各首次加入2题，至此15个专题均有可练内容；这不表示各专题覆盖已经充分。

## 来源与逐题核对

ID统一加 `ADAPTED-TOOLSFPGA-` 前缀。均为公开教学/技术方向的独立构造，practice_collection、C级、topic_only_reconstruction；不是公司原题或忠实转述。链接及相关内容本次实际打开，checked只表示来源方向核对。没有复制源页面的完整题面、图或参考代码。

| ID | 内容 | 来源仅支持的方向 | 独立核对 |
|---|---|---|---|
| CMOS-0001 | NAND上下拉网络 | [MIT CMOS讲义](https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/pages/c3/c3s1/)：互补开关网络 | 穷举00/01/10/11的完整上下拉通路与NAND真值 |
| CMOS-0002 | RC预算与最大扇出 | [MIT RC阶跃教学](https://circuits.mit.edu/F26/psets/04/rc_tutorial)：一阶响应；仅使用公开可见部分，不登录 | 从t50=ln2·RC解整数边界，并独立枚举70ps时输出是否达到50%，n=7通过、8失败 |
| TOOLS-0001 | Python单位归一、负slack与非法行统计 | [Python re](https://docs.python.org/3.10/library/re.html)、[Decimal](https://docs.python.org/3.10/library/decimal.html)：完整匹配与精确十进制 | 独立编写完整函数，页面代码与文件逐字一致；本机Python 3.10.11实际运行6项unittest |
| TOOLS-0002 | C位域清除后设置 | [WG14公开C草案N1570](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf)：位运算、固定宽度类型与常量宏 | 对全部16种旧字段枚举，验证新字段为A、其余位不变；本例结果0x123456A8 |
| FPGA-0001 | LUT4 INIT位序 | [AMD LUT4](https://docs.amd.com/r/en-US/ug953-vivado-7series-libraries/LUT4)：真值表与INIT配置 | 对全部16输入逐位比较四候选，只有0x6660匹配 |
| FPGA-0002 | 固定纵横比BRAM拼接 | [AMD BRAM Summary](https://docs.amd.com/r/en-US/ug573-ultrascale-memory-resources/Block-RAM-Summary)：纵横比与端口模式 | 题设仅许1024×18规则矩形拼接，宽方向2、深方向3，最少6块；不宣称所有器件最优 |
| PROB-0001 | 四位恰一位误码 | [公开概率课程](https://www.probabilitycourse.com/chapter2/2_1_3_unordered_without_replacement.php)：独立Bernoulli计数 | 枚举16种误码模式累加恰好一位的概率，29.16% |
| PROB-0002 | 不放回至少一个坏件 | 同上：无序不放回组合样本空间 | 枚举全部120个三元子集，64组含坏件，8/15≈53.333% |

## Python实际运行

参考函数：`examples/python/slack_summary.py`；独立运行测试：`tests/python_reference_test.py`；统一入口：`npm run test:python`。驱动先比较JSON里的Python fenced code与实际文件一致，防止测试的代码和网页答案漂移。

六项测试覆盖：题面样例；空/注释/非负/负零；精确跨单位平局和重复路径；尾随垃圾、额外空格、NaN/Inf、指数及错误单位等非法格式；单次迭代器和普通十进制写法；正负整数与两种单位对独立Fraction模型的核对。CI新增Python3.12严格执行，不因缺工具跳过。

网页仍是简答人工自评，不执行用户代码。C题使用明确固定宽度及常量宏，只核对位运算模型，没有声明已编译C；LUT/BRAM题没有执行FPGA综合、布局或器件仿真；RC没有执行SPICE。数学/枚举不冒充物理实现签核。

## 其余验收

- 本地220项前端/内容/存储测试、类型检查、正式题库与教学校验通过；15个文件98题，0错误、0Review Warning。
- Python参考代码6项实际运行通过；本地Vite构建通过，保留既有bundle大小提示，无新增运行时依赖。
- 原9个RTL继续做网页代码一致性与严格CI仿真。本机仍无iverilog/vvp，本地明确跳过；[Actions](https://github.com/szhao2003/ic-design-practice/actions)记录实际CI与部署结果。
- 页面：Python揭示前无代码复制按钮，揭示后复制结果与完整模块文本一致；BRAM输入6判对；15张专题卡均非空；搜索“电路工具与FPGA第一批”恰好匹配8题；题头未恢复版本号。
- 没有数据迁移、重判或清空。原有90题、稳定ID及历史快照不变。

下一阶段应按使用反馈加深核心题或补充各章变式，不把“15章都有题”称作完整知识覆盖。
