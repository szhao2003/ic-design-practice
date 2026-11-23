# 教学内容与复习体验升级验收

版本：1.2.0；日期：2026-11-23。本轮采用 v1.5 内容要求，按实际 74 题执行，未增题。逐题改动和至少三类前后对照见 [复查日志](CONTENT_REVIEW_LOG.md)。

## 实际修改

- `src/data/questions/01…07*.json`：74 题解释升级、contentVersion 1→2；24 道扩写选项解释、20 道调整易错点、17 道整理人工参考答案。原有题面、选项文本、判分答案、来源字段、ID 与分类不变；对基线 21e6761 逐字段比较确认。
- `PracticePage.tsx`、`RoundLearningGate.tsx`：未独立完成前不渲染旧答案、历史与个人笔记；主动提前查看先持久化辅助学习事件。新建、重做、刷新及保存失败状态均遵循当前轮次。
- `QuestionContent.tsx`、`styles.css`：答案先行、分段/表格、逐项判断、自评点及易错点；只在揭示后的代码块提供复制，保留缩进并横向滚动。题头显示一级/二级专题、难度与来源性质。
- `rtl/reference/` 与 `rtl/tb/`：七个完整模块与七个独立 Testbench。`scripts/test-rtl.mjs` 先比较网页 fenced code 与参考文件完全一致，再逐个编译仿真；任何失败中止。
- `scripts/generate-teaching-diagrams.mjs` 与 `public/diagrams/content-v15/`：四份确定性 SVG，分别为 CDC 2-FF、AHB、APB、Serial Shift，数据与采样语义写入生成器及 SVG 描述。
- `scripts/content-quality.ts` 与题库验证脚本：检测旧占位、未闭合围栏、残缺 RTL/注释、缺失本地图形；过短/重复/泛化解释只提醒，不充当技术裁判。
- CI 增加 Icarus Verilog 安装与严格 `test:rtl`，检查通过后才可发布 Pages。版本、README、维护指南与审计索引同步更新。

## HDL 覆盖与边界

| 参考模块 / 对应题 | 独立检查内容 |
|---|---|
| pulse_toggle_cdc / ADAPTED-RK26-CDC-0001 | 100/25 MHz 非同相时钟，13 个事件、多种相位、160 ns 最小间隔、单目的周期脉冲、启动及协调复位无假事件 |
| reset_release / ORIGINAL-CDC-0005 | 非时钟沿异步断言，两沿释放，重复复位，停钟期间保持复位 |
| pipeline_adder / ADAPTED-RK26-RTL-0001 | 完整 33 bit 算术 scoreboard，零、低半进位、最高进位、连续输入、空泡、300 组确定性数据、在途复位清空 |
| mod10_counter / ORIGINAL-RTL-0001 | 复位、计数、回绕、使能停顿，特别是回绕后 en=0 时 tick 必须清零 |
| priority_arbiter / ORIGINAL-RTL-0002 | 穷举 16 种请求，用最低置位位独立求优先授权，含无请求和竞争 |
| prefix_mod5 / ADAPTED-YHC-RTL-0002 | 穷举 1024 个十位输入串，以完整整数 `%5` 检查每个前缀，插入停顿、空前缀及有效零、逐串复位 |
| popcount8 / ADAPTED-YHC-RTL-0004 | 穷举 256 个输入，用逐位计数模型比较，连续输入、无效保持、复位、全零/全一 |

本机未安装 iverilog/vvp，运行 `node scripts/test-rtl.mjs --if-available` 的真实结果是 **SKIP 仿真、7 份网页代码一致性通过**。CI 使用严格模式，无跳过分支；执行结果以对应 Actions 日志为准。本地不能被写作 HDL 仿真通过。

这些 TB 检查题设的二态/数字功能，不模拟模拟亚稳态、不提供 MTBF 实测，也未执行综合、门级仿真、CDC 静态签核或物理 STA。Arbiter 是纯组合块，没有复位接口；Counter 不要求非法态恢复；toggle 不测试违反题设的单域复位或任意快速事件。网页不运行用户提交的 RTL。

## 可复验的页面验收

本地 `/ic-design-practice/` 实际页面已检查：

1. MUX 题提交错误答案后，显示正确项、分支表和四个独立选项解释；保存测试笔记，重做后笔记、旧历史和解析均不在 DOM 中，刷新仍隐藏。
2. 主动查看历史后显示辅助学习提示，保存的笔记仍在；人工题提前揭示后选择“掌握”，历史实际记为“部分掌握”，不累计独立掌握。
3. STA 输入 1.5 ns 判对，页面显示到达/要求/裕量表；Counter 展示完整带注释模块，揭示前无代码复制按钮，揭示后复制结果确为模块文本并显示成功状态。
4. 390 px 手机视口：代码区 client=300、scroll=673，white-space=pre、overflow-x=auto；波形区 client=301、scroll=760；页面没有被长代码或 SVG 撑宽。视口覆盖检查后已恢复。
5. 四张图全部加载完成，资源路径为 `/ic-design-practice/diagrams/content-v15/*.svg`，CDC 图另做视觉检查，逐沿与 NBA 语义一致。
6. 一题不限时模拟考试：考试中无答案，直接访问普通练习重定向回考试；交卷确认后显示 1/1 得分和完整逐项解析。

测试数据只在独立本地预览端口，不是正式站点学习数据。截图保存在仓库外的本地 verification 目录，未提交任何个人备份。

## 自动检查与发布

- TypeScript、正式题库校验、单元/存储/快照/备份/模拟考试回归与 Vite 构建在本机执行。
- 教学辅助校验：74 题，0 错误、0 Review Warning；这不替代上面的逐题技术复查。
- 构建存在原有第三方注释与主 bundle 超过 500 kB 的提示，构建成功；未为本次内容升级扩充依赖。
- 发布目标：[GitHub Pages](https://szhao2003.github.io/ic-design-practice/)。[Actions](https://github.com/szhao2003/ic-design-practice/actions) 是严格 HDL 检查和部署的执行记录；发布后的结果在后续记录中追加。

## 长期维护与未覆盖项

完整流程：[搜题工作流](QUESTION_SOURCING_WORKFLOW.md)、[公开来源索引](PUBLIC_SOURCE_INDEX.md)、[候选台账](question-source-candidates.md)、[出题指南](QUESTION_AUTHORING.md)。本轮没有重新核验全部笔经页面，也没有提高来源可信等级。

后续内容待办：先按台账逐条查证，再以 8–12 道小批次补薄弱点及 08–15 专题。工程签核、用户代码在线执行、物理实现验证不在本轮范围；这些限制不会被标成已通过。本轮不改变数据库结构，旧记录与快照不清理、不重判。
