# 系统与实现第二批：8道

日期：2026-11-23；应用1.7.0。原106题逐对象比较未变，新增8题，总计114。题面不显示内部内容版本，既有记录无需迁移。

全部为公开教学/技术方向的独立构造：practice_collection、证据C级、topic_only_reconstruction、checked。checked仅表示本次实际访问和主题核对，不代表公司原卷或原参数。没有复制页面整题、代码或图片。

| ID | 独立构造题目 | 参考方向来源 |
|---|---|---|
| ADAPTED-SYSTEM-POWER-0001 | 休眠盈亏平衡：低功率不等于低能量 | [公开资料](https://people.ee.duke.edu/~sorin/papers/islped09_power-gating.pdf) |
| ADAPTED-SYSTEM-POWER-0002 | Retention保住状态，为什么还需要Isolation？ | [公开资料](https://documentation-service.arm.com/static/63f3499c9567172d4e2aadd6?token=) |
| ADAPTED-SYSTEM-ARCH-0001 | Write-back cache：缺失次数与写回流量分开算 | [公开资料](https://www.cs.cornell.edu/courses/cs3410/2024fa/notes/caches.html) |
| ADAPTED-SYSTEM-ARCH-0002 | Amdahl加上搬运开销：局部三倍快能快多少？ | [公开资料](https://cvw.cac.cornell.edu/parallel/efficiency/amdahls-law) |
| ADAPTED-SYSTEM-DFT-0001 | 四条并行scan链：装载与卸载重叠后的测试周期 | [公开资料](https://www.eecs.umich.edu/courses/eecs627/testability.html) |
| ADAPTED-SYSTEM-DFT-0002 | XOR响应压缩：相同签名能证明无错吗？ | [公开资料](https://www.eecs.harvard.edu/~michaelm/postscripts/itc2004.pdf) |
| ADAPTED-SYSTEM-FPGA-0001 | MMCM配置：输出频率对了，VCO也一定合法吗？ | [公开资料](https://docs.amd.com/api/khub/documents/1kFbRqzm2fhwGy~cLQG2yA/content) |
| ADAPTED-SYSTEM-FPGA-0002 | 16项signed乘加：为什么19 bit还差一个值？ | [公开资料](https://docs.amd.com/api/khub/documents/gu4oRPFEh_Pm2uaAlfY6Kg/content) |

## 来源支持范围与去重

- Duke论文只支持power gating有切换成本和盈亏平衡方向；本题10/2 mW、24 nJ及同窗口模型自行设定。
- Arm DEN0050第7章支持隔离、retention、电源控制的不同职责；本题valid=0及output_ready契约自行定义，不作为所有库的统一顺序。
- Cornell cache讲义支持write-back/dirty/write-allocate；新题统计替换流量，区别于已有直接映射命中题。Cornell Amdahl教学支持固定任务局部加速，本题单独加搬运开销。
- Michigan scan教学支持串行链装载/读出方向；本题新设四链平衡和20个pattern的完整时间账。Harvard测试响应压缩论文支持XOR压缩方向；本题仅单拍parity，不照搬X-tolerant压缩网络。
- AMD UG472支持M/D/O与VCO、输出关系；600…1200 MHz是题设，不能当作真实型号规格。AMD UG479支持有符号乘加/累加方向；8bit×8bit和16项范围独立推导，不宣称DSP资源映射。

另实际访问Cambridge power gating教学及Michigan DFT讲义作交叉参考。UNM旧课件链接重定向到个人主页，未作为本批题源。没有提高历史题来源核验等级。

## 独立验证

新增8项测试与既有回归合计237项通过；类型检查、正式题库校验及构建通过，114题0错误及0 Review Warning。

测试分别核对批次/专题/来源、能量边界前后、逐次cache有效位/tag/dirty与读写流量、固定任务分段时间、穷举所有73个FF四条正整数链分配并建立完整测试事件、穷举16种正常response和15种非零mask、MMCM全部候选频率，以及65536个signed乘积和0…16项前缀和范围。

关键结果：3 μs能量相等；cache读96 B+写32 B=128 B；整体加速5/3；scan419拍；15种非零mask中7种在单拍parity中别名；只有MMCM候选A满足两条条件；乘加需20 bit。Retention选择题逐项技术审核。

旧Python两个发布函数仍与网页逐字一致，12项实际运行测试通过；旧9个RTL继续由严格CI仿真。新题没有新增HDL参考模块，不宣称运行原生UPF/电源感知仿真、ATPG、scan插入、器件MMCM仿真或综合布局。签名mask计数不是物理故障概率。

浏览器验收核对批次8题筛选、数值提交与解析显示、多选判分和来源展开。最终发布及HDL回归结果见该版本GitHub Actions。
