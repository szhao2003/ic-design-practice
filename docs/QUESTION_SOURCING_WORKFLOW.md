# 公开题源检索与出题流程

适用范围：维护现有 90 题及后续小批次增题。先保证可答、正确、能学会，再增加题量。来源入口见 [公开索引](PUBLIC_SOURCE_INDEX.md)，待办见 [候选台账](question-source-candidates.md)。不自动整站抓取，不绕过登录、付费或访问限制。

## 从薄弱专题开始检索

先看现有题库的 topic/subtopic 与考查能力，优先补未覆盖的设计或推导，不按公司逐篇复制。可用查询：

```text
site:nowcoder.com/discuss 数字IC 笔试 STA setup hold 时序
site:nowcoder.com/discuss 数字IC 设计 FIFO 深度 读写 频率
site:nowcoder.com/feed/main/detail 2027届 芯片 笔试 CDC
site:nowcoder.com/discuss FPGA RTL 编程 仲裁器 序列检测
数字 IC 笔试 AHB HREADY HTRANS 波形
数字 IC 面经 SystemVerilog 非阻塞赋值 signed 位宽
ASIC DV 校招笔试 SVA constraint scoreboard
```

每条线索记录 URL、公开原帖实际给出的条件/任务、发布日期（页面有证据才填）、届别、岗位、笔试或面试性质、可靠性和已用题号。帖子只说“考了 AXI”就仅支持 AXI 方向，不能把自己补的总线位宽或波形说成回忆原参数。圣邦帖子目前仅作为考试形式线索，不能据此出某个具体公司题。

## 九步入库

1. **收集**：在候选台账记录证据及访问状态。无法打开时标记待核验，不用搜索摘要冒充完整题面。
2. **归类去重**：检查 15 大类、子专题、任务形式与推理能力。相同知识点可以设计实质不同的变式，避免只换数字反复出题。用汇编题号与既有映射去重。
3. **构造具体题**：补全时钟、复位、初始值、采样沿、单位、位宽、握手和输出要求。选择题干扰项应对应真实错误思路；RTL 要有接口和可验证契约。
4. **如实分类**：资料类型用 `firsthand_recall` / `practice_collection` 等；自行据考点构造用 `topic_only_reconstruction`。只有原帖确实给出必要题面且忠实转述时才考虑 `paraphrased_from_source`。证据等级不等于答案审核等级。
5. **独立求解**：先算/画/写，再核对规范或参考模型。使用真值表、逐沿枚举、独立算式、HDL 仿真等可复验方法。无法确认则 `needs_review`，不进入正式练习。
6. **写教学解析**：先明确答案或设计思路，再逐步解释当前条件。每个选项独立说明规则或反例，避免“其余不正确”。数值写单位与正负号；时序区分沿前采样和沿后 NBA；RTL 完整模块、功能注释、代码下中文说明及边界自查。
7. **录入**：按 [维护指南](QUESTION_AUTHORING.md) 写 JSON 和必要图片。稳定 ID 永久保留；修改已发行题面的答案、解析或展示元数据均递增 `contentVersion`。旧图片路径保留供历史快照使用。
8. **质量闸门**：schema → 教学辅助检查 → 独立技术复核 → 单元/存储回归 → RTL TB（适用）→ 页面桌面及手机验收。字数或结构通过不等于答案技术正确。
9. **发布留痕**：在 [复查日志](CONTENT_REVIEW_LOG.md) 记录来源仅支持什么、独立核对方法及未覆盖事项，运行正式检查，提交后查看 CI 和部署真实结果。不得上传个人练习备份。

## 技术资料和题源分别记录

笔经可以支持“某方向曾被提及”，技术规范用于确认规则，两者不能互相替代。

- [Arm AXI 规范 IHI0022](https://developer.arm.com/documentation/ihi0022/latest/)、[AHB IHI0033](https://developer.arm.com/documentation/ihi0033/latest/)、[APB IHI0024](https://developer.arm.com/documentation/ihi0024/latest/)：核对通道、阶段、握手与稳定性。选择与题面一致的协议版本。
- [AMD XPM_CDC_SINGLE](https://docs.amd.com/r/en-US/ug953-vivado-7series-libraries/XPM_CDC_SINGLE)：单 bit 同步器使用条件，不能推广为多位相干保证。
- [IEEE 1800 标准入口](https://standards.ieee.org/ieee/1800/7743/)：SystemVerilog 事件调度、表达式尺寸及四态语义，使用合法可访问版本核查具体条款。
- 项目内 `rtl/tb/` 与数学/真值表测试：独立验证题定模型。数字仿真不能证明模拟亚稳态、物理 STA 或器件实现已签核。

## 下一批候选优先级

教学质量升级阶段不增题；后续按 8–12 道一个批次：STA 多条件与例外误用；CDC 相干握手、FIFO 指针/突发深度；带背压流水线与轮转仲裁；AXI 通道独立握手、burst/outstanding；再补 08–15 章中的 DV/SVA、PPA/低功耗、DFT 与架构基础。每批先更新台账，技术未确认的候选不得凑题量发布。
