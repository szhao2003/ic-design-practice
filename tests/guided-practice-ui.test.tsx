import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { GuidedPractice, GuidanceChecklist, GuidedQuestionLinks } from '../src/components/GuidedPractice';
import { RoundLearningGate } from '../src/components/RoundLearningGate';
import { advanceGuidedPractice, createRound, startGuidedPractice } from '../src/domain/practice';
import { manual, at, later } from './fixtures';
const content={steps:[{title:'第一步',promptMd:'VISIBLE_HINT_ONE'},{title:'第二步',promptMd:'PRIVATE_HINT_TWO'}],checks:['PRIVATE_SCORING_CHECK']};
const started=()=>startGuidedPractice(createRound('guided',manual,at),content,later);
const render=(round=createRound('fresh',manual,at))=>renderToStaticMarkup(<MemoryRouter><GuidedPractice round={round} content={content} disabled={false} onStart={()=>{}} onAdvance={()=>{}}/><RoundLearningGate round={round} disabled={false} onReveal={()=>{}}>PRIVATE_FINAL_ANSWER<GuidanceChecklist checks={content.checks}/></RoundLearningGate></MemoryRouter>);
describe('分步引导的页面揭示边界',()=>{
 it('开始前只显示明确的辅助入口，不输出提示或评分答案',()=>{
  const html=render();expect(html).toContain('开始分步引导（辅助学习）');for(const text of ['VISIBLE_HINT_ONE','PRIVATE_HINT_TWO','PRIVATE_FINAL_ANSWER','PRIVATE_SCORING_CHECK'])expect(html).not.toContain(text);
 });
 it('逐步输出提示，完整答案与评分清单在最终揭示前都不渲染',()=>{
  const first=render(started());expect(first).toContain('VISIBLE_HINT_ONE');for(const text of ['PRIVATE_HINT_TWO','PRIVATE_FINAL_ANSWER','PRIVATE_SCORING_CHECK'])expect(first).not.toContain(text);
  const second=render(advanceGuidedPractice(started()));expect(second).toContain('VISIBLE_HINT_ONE');expect(second).toContain('PRIVATE_HINT_TWO');expect(second).toContain('查看完整答案与自查清单');expect(second).not.toContain('PRIVATE_FINAL_ANSWER');expect(second).not.toContain('PRIVATE_SCORING_CHECK');
 });
 it('最终揭示开放清单，重做后的新轮次重新隐藏全部提示',()=>{
  const done=render(advanceGuidedPractice(advanceGuidedPractice(started())));expect(done).toContain('PRIVATE_FINAL_ANSWER');expect(done).toContain('PRIVATE_SCORING_CHECK');expect(done).toContain('不会自动检查代码或授予分数');
  const restarted=render(createRound('redo',manual,later));expect(restarted).not.toContain('PRIVATE_HINT_TWO');expect(restarted).not.toContain('PRIVATE_FINAL_ANSWER');
 });
 it('知识专题提供6个现有题入口，只有匹配内容版本的题可被引导',()=>{
  const html=renderToStaticMarkup(<MemoryRouter><GuidedQuestionLinks/></MemoryRouter>);expect((html.match(/href="\/practice\//g)??[])).toHaveLength(6);expect(html).toContain('综合题分步引导');expect(html).not.toContain('set_multicycle_path 3');
 });
});
