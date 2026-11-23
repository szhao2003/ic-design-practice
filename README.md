# IC Design Practice

面向数字 IC、ASIC RTL、DV 与 FPGA 的专题练习工具，中文界面。

当前为 **0.1.0：基础工程与知识分类**。已有 15 个专题及子专题、推荐学习顺序、题库分类和搜索、八个导航入口，以及题库数据校验。正式题库暂为 0 道，答题、学习记录、复习、模拟和备份尚未开放。完整实现进度见 [开发进度](docs/DEVELOPMENT_STATUS.md)。

第二阶段已增加判分、独立作答/辅助揭示/自评、复习调度、历史快照、备份合并预检及模拟卷状态模型与测试，详见 [第二阶段说明](docs/SECTION_02_VERIFICATION.md)。这些模型尚未接入网页和浏览器存储，线上界面暂时不变。

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

`validate:questions` 检查数据结构、分类引用、逐项解析、来源字段及 ID 唯一性，允许开发阶段空题库。`npm run validate:questions -- --release` 额外检查正式 V1 的题量与题型最低数量，当前阶段会如实失败。结构校验不能替代技术内容审核。

## 项目结构

- `src/data/topics.ts`：固定 15 个专题与子专题、推荐学习顺序。
- `src/data/questions/*.json`：按专题维护题目数组。
- `src/domain/question-schema.ts`：七种题型的数据合同与来源约束。
- `src/app/App.tsx`：导航、专题目录、题库筛选和分阶段页面。
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

参见 [题目维护指南](docs/QUESTION_AUTHORING.md)。稳定 ID 不重用，修改题意或答案需递增 `contentVersion`。追加 JSON 后无需修改页面导入，只有 `verified` 题进入可练题统计。正式练习功能将在后续阶段提供。

## 个人数据边界

学习记录功能后续使用 IndexedDB，本地保存并手动导出/导入；仓库更新不等于个人进度同步。不得提交个人作答、笔记、备份、密钥或内部工作材料。`backups/`、`exports/` 和常用备份文件名已忽略，提交前仍需检查实际文件。
