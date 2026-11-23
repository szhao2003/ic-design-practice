# 题目维护指南

题目放入 `src/data/questions/` 下的 JSON 数组文件，字段以 `src/domain/question-schema.ts` 为准。新增文件自动载入，不需要修改组件。

1. 选择 `topics.ts` 中的专题和子专题，指定稳定 ID 与正整数 `contentVersion`。
2. 写出完整条件、问题、答案、推导、关键假设和易错点。代码题提供完整参考实现与接口/复位约定，波形题明确采样沿。
3. 选择题覆盖所有选项的解释；数值题明确标准单位、允许单位倍率及至少一种非负容差；人工题提供参考答案与评分点。
4. 原创使用 `kind=self_authored`、`questionFidelity=self_authored`、`evidenceGrade=none`、`sourceClaimVerification=not_applicable`，不关联公司。
5. 考点改编使用 `questionFidelity=topic_only_reconstruction`，记录原始资料性质、证据等级、URL、核验状态和说明。明确“来源仅支持考点，本题独立改编，非原题”。未重新核验链接使用 `not_rechecked`。
6. 技术结论有歧义则标记 `needs_review`，不进入正式题量。审核通过后使用 `verified`，审核说明记入内容审计；不得把结构校验冒充技术审核或仿真验证。
7. 运行校验、测试与构建。修改已发行题意、选项或答案要递增版本；不重用或随意更换题目 ID，旧版图片资源路径应长期保留。

公式：转换为标准单位后，`abs(actual - expected) <= max(absoluteTolerance, relativeTolerance * abs(expected))`。单位缺省只在题目显式提供唯一 `defaultUnit` 时允许。标准 `unit` 在 `acceptedUnits` 中倍率为 1。

自评题仅保存作答和人工掌握反馈，不声明自动判定代码功能正确。新题必须自行可答，不能只包含“考 CDC/FIFO”等考点摘要。
