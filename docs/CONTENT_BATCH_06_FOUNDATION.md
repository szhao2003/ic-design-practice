# 跨专题基础第一批：8 道

日期：2026-11-23；应用版本 1.4.0。原有 82 题逐对象比较完全不变；新增 8 题后共 90 题，首次填充 08、09、10、12 四个专题，各 2 道。新题在内部从 contentVersion=1 开始，题头继续隐藏版本编号。

## 逐题来源与复核

下表 ID 均带 `ADAPTED-FOUNDATION-` 前缀。本批是公开方向的独立构造，不转录原题或现成答案，不添加公司归因；所有链接本次实际打开。只有功耗题依据亲历笔经，其余是教学/练习资料。

| ID | 新增内容 | 原始公开入口与支持范围 | 独立核对 |
|---|---|---|---|
| POWER-0001 | 活动率、电压和频率变化后的总功率 | [瑞芯微公开笔经](https://www.nowcoder.com/discuss/802688503929655296) 只支持动态/静态功耗与低功耗方向，参数及固定漏电假设为新设 | 动态 80×0.5×0.8²×0.75=19.2 mW，加固定静态20得39.2；另测W/mW换算 |
| POWER-0002 | 直接 AND 门控截短脉冲与低透明锁存 | [Microchip Clock Gating](https://onlinedocs.microchip.com/oxy/GUID-8F0CC4C0-0317-4262-89CA-CE7773ED1931-en-US-13/GUID-34A62246-6CB9-47E1-A743-D3E10C3AEA25.html) 的锁存门控机制；不是公司试题 | 5…7、7…10、低相位三段值表，验证高相位保持，逐项反例 |
| DV-0001 | 多拍前件的 implication 起点与空真 | [Accellera SVA 手册公开教学副本](https://www.eecs.umich.edu/courses/eecs578/eecs578.f15/miniprojects/SVAproject/manuals/SVA_manual.pdf) 的序列/implication 语义；只用稳定的单时钟基本子集 | 每个启动沿枚举前件匹配，得到 E1/E3 结束；non-overlapped 查 E2/E4，overlapped 查 E1/E3 |
| DV-0002 | Cross bins、ignore 与重复命中 | [Verification Academy 公开问答](https://verificationacademy.com/forums/t/ignore-bins-and-cross/41200) 支持 cross/ignore 方向；本题不用原帖代码 | 有效组合集合6−1=5，去重命中3，覆盖率60%；区分单点与cross |
| ARCH-0001 | 直接映射 cache 地址拆分与冲突 | [存储器层次结构课程讲义](https://yafengnju.github.io/ComputerOrganization/7-%E5%AD%98%E5%82%A8%E5%99%A8%E5%B1%82%E6%AC%A1%E7%BB%93%E6%9E%84(2).pdf) 的映射与地址划分方向；新设容量/访问串 | 独立Map逐次替换模拟，miss/miss/miss/miss/hit，共4次miss，offset/index/tag=4/8/20 |
| ARCH-0002 | 有限窗口 CPI 与填充、停顿 | [UF Pipelining 教学页](https://www.cise.ufl.edu/~mssz/CompOrg/CDA-pipe.html) 的流水重叠与性能模型；参数独立设定 | 第一条完成为第5拍，100条基线104拍，另加12+16=28拍，CPI=1.32 |
| DFT-0001 | Scan 沿前SO读取与沿后状态 | [UMich Testability 教学页](https://www.eecs.umich.edu/courses/eecs627/testability.html) 支持扫描链、输入输出及可测试性方向 | 用q0…q3位数组逐次移动，独立于packed-shift表达式；旧SO=1010，最终状态1011 |
| DFT-0002 | Stuck-at 激活与传播 | 同上可测试性方向；电路与四组选项独立构造，不声称资料给出此电路原题 | 穷举全部8组(a,b,c)，仅110使正常/故障输出不同 |

POWER-0001 来源记录为 firsthand_recall、A 级，表示亲历资料性质，不是题面保真或正确性认证；其余为 practice_collection、C 级，含官方说明、课程和技术问答。checked 仅指页面与主题核对。尝试访问但未成功取得完整内容的其他笔经没有用于本批出题。

## 教学和实现边界

- 每题都提供具体题设、答案过程、针对当前条件的易错点；两道选择题逐项说明错误原因；两道波形题给逐沿表及自评点。
- 功耗题明确静态项固定，只算功率不算任务能量。门控题区分理想逻辑和实际时钟资源/时序检查。
- SVA 是采样表和明确语言子集的逐拍推演，**没有调用支持 SVA 的 HDL 仿真器**；coverage 是题定组合集合的独立统计，**不是仿真器 covergroup 报告**。未把这些模型测试说成 HDL 断言/覆盖仿真通过。
- DFT 只讨论所给 shift 与单 stuck-at-0；没有运行 ATPG、扫描插入、测试时序或物理缺陷分析。
- 没有新增用户代码自动执行功能或数据库迁移，也没有改变旧轮次、快照、笔记与掌握记录。

## 实际检查

- 本地 TypeScript、正式题库与教学辅助检查通过：11个题库文件、90道题、0错误、0Review Warning。
- 本地 212 项测试通过，其中新增 9 项覆盖来源/分类合同及上述逐题模型；Vite 构建通过，保留已有 bundle 大小提示。
- 本轮没有新增 RTL Coding，原9个参考模块继续做网页代码一致性检查。本机无 iverilog/vvp，明确跳过本地HDL仿真；CI仍以严格模式运行全部9个TB，失败阻止发布。[Actions运行记录](https://github.com/szhao2003/ic-design-practice/actions) 作为实际执行依据。
- 页面验收：SVA解析表正确为7列，无 implication 竖线误拆；DFT 选择A判对并显示四项解释；coverage输入60%判对；专题08/09/10/12均显示“2道可练”；搜索“跨专题基础第一批”匹配8题；题头无版本号。

## 后续缺口

四个专题目前只是各两道入门到中等练习，并非覆盖完成。11 CMOS、13工具脚本、14 FPGA、15综合仍为空；下一批可继续补DV/SVA/scoreboard或核心薄弱项，保持小批次独立审核，不用题量代替质量。
