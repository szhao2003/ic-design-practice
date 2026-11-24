# Cache小补充：2道

2026-11-23；应用1.9.1。原130题逐对象未变，新增2题后132。均为practice_collection/C/topic_only_reconstruction，非公司原题，内部版本不展示。

实际访问 [Cornell cache课程](https://www.cs.cornell.edu/courses/cs3410/2024fa/notes/caches.html)，正文支持组相联、LRU与分层AMAT；另核对Cornell ECE4750的局部/全局miss率检索入口。只参考知识方向，地址、参数与解析自行构造。

- ADAPTED-MINI-CACHE-0001：两路LRU。逐次维护LRU队列，并以最后访问时间戳独立交叉核对；唯一hit是第3次访问，总1次。已有直接映射/写回题未考此替换策略。
- ADAPTED-MINI-CACHE-0002：局部miss与全局概率。按100个请求的90/8/2条路径分别计算，并与逐层额外耗时模型核对，均为2.6 ns；已有Amdahl题不是该模型。

256项前端/内容/存储测试、类型检查、正式题库检查和构建通过；原18项Python和10个RTL继续回归，HDL结果以本提交严格CI为准。本批没有新增可执行参考代码，不声称硬件仿真已实现cache；只验证题定数学/状态模型。复用既有数值作答界面，本次不新增页面或操作流程。
