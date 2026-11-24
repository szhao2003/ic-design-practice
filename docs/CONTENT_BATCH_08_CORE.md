# 核心进阶第二批：8道

日期：2026-11-23；应用1.6.0。原98题逐对象比较不变，新增8题，共106题。题面不显示内部内容版本；不迁移或重判旧记录。

均为公开教学/技术考点的独立构造，practice_collection、C级、topic_only_reconstruction。checked表示方向核对，不表示公司原题认证。数值、波形、选项与代码自行构造。

| ID | 内容 |
|---|---|
| ADAPTED-CORE-STA-0001 | 重分配级间逻辑：最优频率不是总延迟倒数 |
| ADAPTED-CORE-CDC-0001 | 四相握手吞吐：两级同步后还要等状态机 |
| ADAPTED-CORE-AXI-0001 | AXI4 INCR burst 的4 KB边界与AxLEN |
| ADAPTED-CORE-AXI-0002 | 多个 outstanding read：哪种返回顺序不合法？ |
| ADAPTED-CORE-DV-0001 | disable iff：复位中止后会续查旧请求吗？ |
| ADAPTED-CORE-DV-0002 | 组合覆盖100%，为什么加法器仍可能是错的？ |
| ADAPTED-CORE-DV-0003 | Python scoreboard：跨ID乱序、同ID有序 |
| ADAPTED-CORE-DV-0004 | dist范围权重：:/和:=的分母不同 |

## 来源支持范围

- [AMD retiming与Fmax](https://www.amd.com/content/dam/amd/en/documents/products/adaptive-socs-and-fpgas/versal/maximizing-fabric-performance-for-versal-webinar.pdf)：STA重分配方向，题设理想连续模型不代表物理实现。
- [AMD全握手](https://docs.amd.com/r/2021.1-English/ug1344-versal-architecture-libraries/XPM_CDC_HANDSHAKE)：返回握手方向；题定FSM和相位独立构造。
- [Arm AXI规范](https://documentation-service.arm.com/static/6425706579edab6d64fb6f54)：4KB边界、AxLEN、同ID顺序；题定地址与事务独立构造。
- [Verification Academy disable iff](https://verificationacademy.com/forums/t/what-is-the-work-of-disable-iff-expression/34081)：异步中止尝试。
- [Accellera UVM指南](https://accellera.org/images/downloads/standards/uvm/uvm_users_guide_1.2.pdf)：coverage与功能检查、参考模型/scoreboard方向。
- [Python deque](https://docs.python.org/3/library/collections.html#collections.deque)：按ID维护FIFO的实现参考。
- [Verification Academy dist](https://verificationacademy.com/forums/t/i-have-small-doubt-in-dist-constraint/42477)：范围总权重按:/分配。

## 独立验证与边界

229项前端/内容/存储测试通过。新增8项内容检查分别枚举重分配最优点、逐沿CDC旧值状态、burst字节范围、同ID顺序投影、复位中止/通过/失败、加法器全部输入、批次完整性和dist权重。正式题库106题，0错误及0 Review Warning；类型检查及构建通过。

Python参考函数与网页代码逐字比较，两个函数共12项unittest实际运行通过。新scoreboard六项覆盖跨ID乱序、同ID错序、未知/重复响应、不消费其他ID、遗漏顺序、错误后消费、空输入及全部排列。相同payload无法证明真实事务身份顺序。该函数为离线单beat模型，不是完整AXI/UVM检查器。

每轮最多100题保持；分别验证候选不足时不凑数和候选超过时只取请求数量。原9个RTL由CI严格仿真，本地未安装HDL工具。SVA、CDC和随机权重仅使用独立模型，不宣称已运行原生SVA/约束求解或物理CDC签核。

浏览器验收覆盖CDC解析表、AXI数值判分、scoreboard代码揭示和8题搜索结果。部署及HDL最终结果以该版本GitHub Actions为准。
