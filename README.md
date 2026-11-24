# IC Design Practice

面向数字 IC、ASIC RTL、DV 与 FPGA 的专题练习工具，中文界面。

当前为 **1.22.0：总线与背压分步引导**。已有 15 个专题及子专题、218 道完整题（原创 44、公开资料考点改编 174，其中笔经考点 7、教学/练习资料考点 167）、七种题型、组合筛选、随机不重复组题、连续练习与位置恢复、完整解析、历史/草稿/笔记/收藏、错题复习、JSON 备份恢复、真实学习概览及模拟考试。完整实现进度见 [开发进度](docs/DEVELOPMENT_STATUS.md)。

新增5条核心练习路径，每条9题、每阶段3题，支持固定题序、断点续练和独立练习覆盖统计；在“知识专题”进入。五个核心专题各另有2道可选起步题，起步与9题路径分开统计。整理依据见 [路径审核](docs/CORE_LEARNING_PATH_REVIEW.md)。

STA、CDC、FIFO、RTL及总线共10道综合题提供分步引导与答案后的自查清单，支持刷新/备份恢复，提前使用引导计为辅助学习。题库仍218题，原题和旧答案不变。见 [引导验收](docs/GUIDED_BUS_REVIEW.md)。

学习进度及统计口径见 [学习进度阶段说明](docs/SECTION_07_PROGRESS.md)，模拟考试见 [第五阶段说明](docs/SECTION_05_VERIFICATION.md)。新增第二批见 [继续扩充与中性来源显示](docs/CONTENT_BATCH_04_COLLECTION.md)。第一批题与来源审核见 [资料考点扩充（第一批）](docs/CONTENT_BATCH_03_YHCHUB.md)，首版功能及回归范围见 [V1 验收](docs/V1_ACCEPTANCE.md)。

本轮 74 题逐题复查、七个参考 RTL/TB、四份精确时序图与重做前资料隐藏，见 [教学升级验收](docs/CONTENT_UPGRADE_V15.md) 和 [逐题日志](docs/CONTENT_REVIEW_LOG.md)。后续增题遵循 [公开题源检索流程](docs/QUESTION_SOURCING_WORKFLOW.md)。

新增 8 道 STA/CDC/FIFO/RTL/AXI 进阶练习，含背压缓冲和轮转仲裁；搜索“进阶练习第一批”可集中练习。来源、去重、独立验证见 [本批审核](docs/CONTENT_BATCH_05_ADVANCED.md)。目前维护侧 RTL 参考模块共 21 个。

新增跨专题基础8题，首次填充低功耗、DV/SVA、体系结构及DFT各2题；搜索“跨专题基础第一批”集中练习。[本批来源与验证](docs/CONTENT_BATCH_06_FOUNDATION.md) 明确区分笔经线索、教学资料和独立模型，不冒充公司原题。

新增电路/工具/FPGA/概率8题，15个专题现均有可练内容；搜索“电路工具与FPGA第一批”。Python参考函数已加入实际运行测试，[本批来源与审核](docs/CONTENT_BATCH_07_TOOLS_FPGA.md)记录模型和未覆盖边界。

## 本地运行

使用 Node.js 24 LTS 和 npm。

```sh
npm ci
npm run dev
```

打开终端输出的地址，默认路径为 `/ic-design-practice/`。使用 HashRouter，刷新子页面不需要服务器路由配置。

```sh
npm run typecheck
npm run validate:questions
npm run test
npm run test:rtl # 需要 iverilog/vvp
npm run test:python # 需要 Python 3；只测试维护侧参考代码
npm run build
npm run preview
```

`validate:questions` 检查数据结构、分类引用、逐项解析、来源字段及 ID 唯一性，允许开发阶段空题库。`npm run validate:questions -- --release` 额外检查正式 V1 的题量与题型最低数量，当前 218 题满足该内容门槛；CI 同样执行 --release，内容门槛不能替代技术审核或浏览器验收。结构校验不能替代技术内容审核。

## 项目结构

- `src/data/topics.ts`：固定 15 个专题与子专题、推荐学习顺序。
- `src/data/questions/*.json`：按专题维护题目数组。
- `src/domain/question-schema.ts`：七种题型的数据合同与来源约束。
- `src/app/App.tsx`：导航、专题目录、题库筛选和分阶段页面。
- `src/pages/`：学习概览、单题练习、错题复习、设置与备份。
- `src/domain/question-filters.ts`：组合筛选、排序与优先练习抽样。
- `src/domain/practice-session.ts`：连续练习题序、版本和状态合同。
- `src/storage/`：IndexedDB 原子存储、备份校验与导入恢复。
- `scripts/validate-question-bank.ts`：题库验证及正式发行内容门槛。
- `tests/`：分类合同与题库完整性测试。
- `.github/workflows/`：检查与 Pages 发布。

## GitHub 与发布

项目仓库：[szhao2003/ic-design-practice](https://github.com/szhao2003/ic-design-practice)。站点发布结果以仓库 Actions 为准，功能及验证范围见 V1 验收报告。

首次取得项目可以 clone 后安装。当前项目仓库公开，仅包含源码、题库结构与中性使用说明。

```sh
git clone https://github.com/szhao2003/ic-design-practice.git
cd ic-design-practice
npm ci
```

后续提交前检查本地清单；首次在其他电脑提交时配置自己的真实 Git 名称和 GitHub noreply 邮箱。

```sh
git status
git remote -v
git config user.name "YOUR_GIT_NAME"
git config user.email "YOUR_GITHUB_NOREPLY_EMAIL"
git add .
git commit -m "Update practice project"
git push -u origin main
```

在仓库 Settings → Pages 中选择 GitHub Actions 为发布来源。PR 调用 `ci.yml`；主分支提交通过 `deploy.yml` 调用同一套 CI，检查通过后上传本次构建产物，再发布到 Pages。失败的检查不会进入部署。当前版本包含完整练习、模拟考试和学习进度流程。

部署流程依据 [GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。更换仓库名时相应调整 `vite.config.ts` 的 `base`，或在构建时设置 `VITE_BASE_PATH`。正式站点地址以 Actions 返回结果为准。

## 增补题目

参见 [题目维护指南](docs/QUESTION_AUTHORING.md)。稳定 ID 不重用，修改题意或答案需递增 `contentVersion`。追加 JSON 后无需修改页面导入，只有 `verified` 题进入默认可练题统计。旧作答引用当时的题面快照，不会用新答案重判。

## 个人数据边界

学习记录使用 IndexedDB，本地保存并手动导出/导入；仓库更新不等于个人进度同步。清除浏览器网站数据、隐私模式与设备损坏可能丢失数据，请定期备份。不得提交个人作答、笔记、备份、密钥或内部工作材料。`backups/`、`exports/` 和常用备份文件名已忽略，提交前仍需检查实际文件。

设置页先校验备份并展示导入摘要，选择合并或覆盖后再次确认。同 ID 异内容的历史、同时间不同笔记或会话歧义会阻止导入；整个恢复使用一次数据库事务，失败不改变原数据。未知题历史保留，不计入当前题库分母。备份格式为 schemaVersion=1，不能安全识别的版本明确拒绝，不猜测迁移。

0.3.0 的数据库升级只新增连续练习表，保留旧学习数据；旧页面请刷新后使用。备份新增可选 practiceSessions 字段，旧版备份仍能恢复，新版备份应使用新版应用导入。连续练习可以保留未完成题目并从首页继续；当前位置冲突需处理后重新导入，不静默覆盖。

## 模拟考试

进入“模拟练习”，选择专题、题量及限时/不限时。匹配不足时按实际数量组卷，不复制题目。开始后固定题面快照，答案和当前位置自动保存；离开或关闭页面不暂停限时。到期按最后成功保存答案交卷，再次打开时也会检查截止时间。

考试期间站内其他入口暂时隐藏，直接访问也会返回当前考试；交卷后可看完整解析、来源和逐题结果。自动题每题 1 分，未答/格式无效计本卷 0 分，不创建普通提交；人工题单独自评，不计入自动题得分。考试及自评随完整 JSON 备份保存。0.4.0 没有改变数据库结构，新备份应使用新版网站导入。

## 学习进度

学习进度页按当前已审核题目统计独立练习覆盖、按提交次数加权的自动正确率、独立人工自评、到期复习及未解决错题。直接揭示、辅助自评和模拟未答题不会冒充独立完成或自动正确提交。

专题覆盖进度条不等于掌握率；下方可以按专题查看待巩固知识点、个人笔记摘要和最近活动。已移除/未审核题的历史保留但不计入当前题库分母；旧版本判分不随新题答案改变。未开设题目的专题不显示百分比。统计无需新增数据库字段或改变备份格式。

新增核心进阶8题，覆盖STA重分配、CDC握手周转、AXI边界/顺序、SVA复位、coverage、scoreboard及dist权重；搜索“核心进阶第二批”。来源与运行范围见 [本批审核](docs/CONTENT_BATCH_08_CORE.md)。

新增系统与实现8题，低功耗、体系结构、DFT、FPGA各2题；搜索“系统与实现第二批”。[本批来源与验证](docs/CONTENT_BATCH_09_SYSTEM.md)记录能量边界、cache状态、scan周期和乘加位宽等独立核对。

新增电路、脚本、概率和I²C共8题；搜索“电路脚本与接口第二批”。Python按最后位置去重函数已实际运行测试，详见 [本批审核](docs/CONTENT_BATCH_10_EXTENSION.md)。

新增RTL、SV语义、Memory与协议8题；搜索“RTL与协议第三批”。新增饱和credit计数器及独立TB，维护侧共10个RTL参考模块；两道SV语义也由HDL仿真核对。见 [本批审核](docs/CONTENT_BATCH_11_CORE.md)。

Cache小补充新增2题：两路LRU替换、多级AMAT局部/全局miss率。搜索“Cache小补充”，详见 [本批审核](docs/CONTENT_BATCH_12_CACHE_MINI.md)。

本轮新增18题，先补完整序列检测、同步FIFO和task/function，再按公开汇编任务去重改编；含5份新RTL/TB。搜索“高频任务与汇编补充”。[逐题审核](docs/CONTENT_BATCH_13_FOCUSED.md)及[132题号覆盖表](docs/SOURCE_COLLECTION_COVERAGE.md)明确区分已覆盖、部分覆盖、缺条件和暂缓，不声称已搬完汇编。

新增6道完整接口与时序约束任务：参数化异步FIFO、AXI4-Lite寄存器模块、同步延迟/读快照逐沿分析和多周期SDC/预算。搜索“完整接口与时序约束”，来源与验证见 [本批审核](docs/CONTENT_BATCH_14_INTEGRATION.md)。

新增6题：AXI4读beat交织及末拍背压、异步FIFO库存/标志延迟深度、可配置毫秒去抖及位宽/配置变更逐沿推导。搜索“协议与计数边界”，见 [本批审核](docs/CONTENT_BATCH_15_BOUNDARY.md)。

新增6题：带首样本基线的完整边沿检测、display/strobe观察区域、短复位脉冲采样、复位时序判断与释放窗口、FSM输出组织。搜索“采样复位与状态机”，见 [本批审核](docs/CONTENT_BATCH_16_SAMPLING.md)。

新增6题：Gray双向转换RTL、可暂停偶分频RTL及波形、明确控制/电源的SRAM引脚计数、32bit片组地址译码、偶校验检错边界。搜索“编码分频与存储接口”，见 [本批审核](docs/CONTENT_BATCH_17_CODEC.md)。

新增12道总线响应与时钟时序任务，覆盖APB版本/错误、AXI响应与读错误burst、AHB-Lite等待/ERROR、jitter/skew及固定模型吞吐。搜索“总线响应与时钟时序”，见 [本批审核](docs/CONTENT_BATCH_18_BUSTIMING.md)。

新增12道DV/DFT/低功耗教学资料改编，含背压保持、X检查、错误响应出队、覆盖率过滤、故障传播、事务排空及隔离确认。搜索“验证诊断与低功耗”，见 [本批审核](docs/CONTENT_BATCH_19_VERIFYPOWER.md)。
