import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { CoreLearningPaths } from '../src/components/CoreLearningPaths';
import { questions } from '../src/data/question-bank';
import { coreLearningPaths } from '../src/data/core-learning-paths';
const mock=vi.hoisted(()=>({state:{progress:[],data:{practiceSessions:[]}} as {progress:unknown[];data:{practiceSessions:unknown[]}}}));
vi.mock('../src/storage/LearningContext',()=>({useLearning:()=>({state:mock.state,store:{},refresh:async()=>{}})}));
const render=()=>renderToStaticMarkup(<MemoryRouter><CoreLearningPaths/></MemoryRouter>);
describe('路径目录展示',()=>{
 it('按阶段展示45道题和15个阶段入口，不提前泄露答案',()=>{
  mock.state={progress:[],data:{practiceSessions:[]}};const html=render();
  expect((html.match(/class="panel core-path"/g)??[])).toHaveLength(5);
  expect((html.match(/按顺序练这3题/g)??[])).toHaveLength(15);
  expect((html.match(/按顺序练全部9题/g)??[])).toHaveLength(5);
  for(const path of coreLearningPaths)for(const stage of path.stages)for(const id of stage.questionIds)expect(html).toContain(`/practice/${id}`);
  expect(html).not.toContain('explanation');expect(html).toContain('不代表全部答对');
 });
 it('显示已有独立覆盖和最新阶段续练入口，不将辅助学习当覆盖',()=>{
  const ids=coreLearningPaths[0].stages[0].questionIds;
  mock.state={progress:[{questionId:ids[0],independentlyPracticed:true,hasUnresolvedMistake:true},{questionId:ids[1],independentlyPracticed:false,hasUnresolvedMistake:false}],data:{practiceSessions:[{id:'saved-path',kind:'practice',status:'active',currentIndex:1,questionKeys:ids,updatedAt:'2026-11-24T12:00:00Z',filtersSnapshot:{learningPath:'sta',pathStage:'rules'}}]}};
  const html=render();expect(html).toContain('继续理解规则3题');expect(html).toContain('继续本阶段 · 第 2 / 3 题');expect(html).toContain('独立练过 1 / 3 · 待巩固 1');expect(html).toContain('重新开始本阶段');
 });
 it('保留真实难度和现有题数，不把路径当新增题',()=>{
  mock.state={progress:[],data:{practiceSessions:[]}};expect(questions).toHaveLength(214);const html=render();expect(html).toContain('困难');expect(html).toContain('中等');expect(html).toContain('简单');expect(html).toContain('45 道精选题');expect((html.match(/先练这2题/g)??[])).toHaveLength(3);expect(html).toContain('不计入9题路径进度');
 });
});
