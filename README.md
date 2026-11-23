# IC Design Practice

面向数字 IC、ASIC RTL、DV 与 FPGA 的专题练习工具，中文界面。

当前为 **0.3.2：首批 50 题齐备**。已有 15 个专题及子专题、50 道完整题（原创 44、公开笔经考点改编 6）、七种题型、组合筛选、随机不重复组题、连续练习与位置恢复、完整解析、历史/草稿/笔记/收藏、错题复习、JSON 备份恢复及真实学习概览。完整实现进度见 [开发进度](docs/DEVELOPMENT_STATUS.md)。

最新能力与检查范围见 [第四阶段说明](docs/SECTION_04_VERIFICATION.md)。本批内容见 [第二批题库扩充说明](docs/CONTENT_BATCH_02.md)。首批七专题题量已达标，模拟考试界面及进度详情仍待实现。

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
npm run build
npm run preview
```

`validate:questions` 检查数据结构、分类引用、逐项解析、来源字段及 ID 唯一性，允许开发阶段空题库。`npm run validate:questions -- --release` 额外检查正式 V1 的题量与题型最低数量，当前 50 题已满足该内容门槛，但不代表模拟考试及完整 V1 已完成。结构校验不能替代技术内容审核。

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

项目仓库：[szhao2003/ic-design-practice](https://github.com/szhao2003/ic-design-practice)。站点发布结果以仓库 Actions 为准；基础工程可运行不代表正式 V1 已完成。

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

在仓库 Settings → Pages 中选择 GitHub Actions 为发布来源。PR 调用 `ci.yml`；主分支提交通过 `deploy.yml` 调用同一套 CI，检查通过后上传本次构建产物，再发布到 Pages。失败的检查不会进入部署。基础阶段上线的是分类目录，不代表正式 V1 已完成。

部署流程依据 [GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。更换仓库名时相应调整 `vite.config.ts` 的 `base`，或在构建时设置 `VITE_BASE_PATH`。正式站点地址以 Actions 返回结果为准。

## 增补题目

参见 [题目维护指南](docs/QUESTION_AUTHORING.md)。稳定 ID 不重用，修改题意或答案需递增 `contentVersion`。追加 JSON 后无需修改页面导入，只有 `verified` 题进入默认可练题统计。旧作答引用当时的题面快照，不会用新答案重判。

## 个人数据边界

学习记录使用 IndexedDB，本地保存并手动导出/导入；仓库更新不等于个人进度同步。清除浏览器网站数据、隐私模式与设备损坏可能丢失数据，请定期备份。不得提交个人作答、笔记、备份、密钥或内部工作材料。`backups/`、`exports/` 和常用备份文件名已忽略，提交前仍需检查实际文件。

设置页先校验备份并展示导入摘要，选择合并或覆盖后再次确认。同 ID 异内容的历史、同时间不同笔记或会话歧义会阻止导入；整个恢复使用一次数据库事务，失败不改变原数据。未知题历史保留，不计入当前题库分母。备份格式为 schemaVersion=1，不能安全识别的版本明确拒绝，不猜测迁移。

0.3.0 的数据库升级只新增连续练习表，保留旧学习数据；旧页面请刷新后使用。备份新增可选 practiceSessions 字段，旧版备份仍能恢复，新版备份应使用新版应用导入。连续练习可以保留未完成题目并从首页继续；当前位置冲突需处理后重新导入，不静默覆盖。
