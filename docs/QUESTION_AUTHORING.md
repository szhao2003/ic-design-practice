# 题目维护指南

题目放入 `src/data/questions/` 下的 JSON 数组文件，字段以 `src/domain/question-schema.ts` 为准。新增文件自动载入，不需要修改组件。

1. 选择 `topics.ts` 中的专题和子专题，指定稳定 ID 与正整数 `contentVersion`。
   所有 `rtl_coding` 手撕完整RTL题统一归06；CDC/复位、FIFO/Memory、总线接口使用06下对应子专题，并保留领域标签。其他专题放原理、计算、读代码与波形分析，不再新增完整RTL手撕。分类调整需保留稳定ID和历史快照，见[归类说明](RTL_CODING_CLASSIFICATION.md)。
2. 写出完整条件、问题、答案、推导、关键假设和易错点。代码题提供完整参考实现与接口/复位约定，波形题明确采样沿。
3. 选择题覆盖所有选项的解释；数值题明确标准单位、允许单位倍率及至少一种非负容差；人工题提供参考答案与评分点。
4. 原创使用 `kind=self_authored`、`questionFidelity=self_authored`、`evidenceGrade=none`、`sourceClaimVerification=not_applicable`，不关联公司。
5. 考点改编使用 `questionFidelity=topic_only_reconstruction`，记录原始资料性质、证据等级、URL、核验状态和说明。明确“来源仅支持考点，本题独立改编，非原题”。未重新核验链接使用 `not_rechecked`。
6. 技术结论有歧义则标记 `needs_review`，不进入正式题量。审核通过后使用 `verified`，审核说明记入内容审计；不得把结构校验冒充技术审核或仿真验证。
7. 运行校验、测试与构建。修改已发行题面、选项、答案、解析或展示元数据均要递增版本；不重用或随意更换题目 ID，旧版图片资源路径应长期保留。

## 教学与验收要求

搜题前先读 [题源工作流](QUESTION_SOURCING_WORKFLOW.md)，使用 [公开索引](PUBLIC_SOURCE_INDEX.md) 并更新 [候选台账](question-source-candidates.md)。按知识能力去重，不能只有“某公司考了某主题”的摘要。

解析先说答案或设计思路，再写当前条件下的推导。每个错误选项给出明确规则或反例，易错点不能使用泛化占位句。数值题解释符号、单位、公式及结果意义；波形逐沿区分采样值与 NBA 更新；简答给可直接写下来的回答及自评点。

RTL 需要完整、可综合、带功能注释的 SystemVerilog 模块，2 空格缩进，明确接口/复位/位宽/valid/空泡；代码之后用中文解释数据流与边界。维护侧文件放在 `rtl/reference/`，必须与页面代码完全一致，独立 Testbench 放在 `rtl/tb/`。`npm run test:rtl` 严格要求安装 iverilog/vvp、Verilator 和 Bash（类语义案例使用 Verilator）；`-- --if-available` 只供缺工具的本机检查使用，跳过不能写成仿真通过。CI 不得用跳过模式。网页仍为人工自评，不执行用户代码。

检查命令：`npm run typecheck`、`npm run validate:questions -- --release`、`npm test`、`npm run test:rtl`、`npm run build`。教学校验检查占位、围栏、图形和代码完整性；短/重复解析仅发 review warning，仍需人工确认技术正确性。至少验收选择、STA、RTL、波形、重做隐藏及手机横向代码滚动。用 `node scripts/generate-teaching-diagrams.mjs` 重建四份确定性图，保持源数据与逐沿答案一致。

公式：转换为标准单位后，`abs(actual - expected) <= max(absoluteTolerance, relativeTolerance * abs(expected))`。单位缺省只在题目显式提供唯一 `defaultUnit` 时允许。标准 `unit` 在 `acceptedUnits` 中倍率为 1。

自评题仅保存作答和人工掌握反馈，不声明自动判定代码功能正确。新题必须自行可答，不能只包含“考 CDC/FIFO”等考点摘要。

Python参考代码放在 `examples/python/`，用独立测试验证样例和边界；网页fenced code与实际文件必须一致，`npm run test:python`严格运行。本机Python与CI版本分别记录，网页仍人工自评，不执行用户代码。
