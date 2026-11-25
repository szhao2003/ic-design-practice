import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { questions } from '../src/data/question-bank';
import { coreLearningPaths, coreWarmups } from '../src/data/core-learning-paths';
import { gradeAnswer } from '../src/domain/grading';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-STARTER-${id}`)!;
describe('核心起步练习',()=>{
 it('6道简单题补足214题，技术方向来源不声称公司原题',()=>{
  expect(questions.filter(q=>!/^ADAPTED-(TIMINGSTART|OPPREC|EXAMBASE|EXAMSV)-/.test(q.id))).toHaveLength(214);const batch=questions.filter(q=>q.id.startsWith('ADAPTED-STARTER-'));expect(batch).toHaveLength(6);
  for(const q of batch){expect(q.difficulty).toBe('easy');expect(q.contentVersion).toBe(1);expect(q.source.company).toBeUndefined();expect(q.source.questionFidelity).toBe('topic_only_reconstruction');expect(q.source.sourceClaimVerification).toBe('checked');expect(q.tags).toContain('核心起步练习');}
 });
 it('FIFO以沿前状态许可，满时读不能为同沿写借空位',()=>{
  const initial=[1,2,3,4],write=initial.length<4,read=initial.length>0;const queue=[...initial];if(read)queue.shift();if(write)queue.push(5);
  expect([write,read,queue.length]).toEqual([false,true,3]);expect(queue).toEqual([2,3,4]);
  expect(gradeAnswer(get('FIFO-0001'),['A'])).toMatchObject({isCorrect:true});expect(gradeAnswer(get('FIFO-0001'),['B'])).toMatchObject({isCorrect:false});
 });
 it('被拒绝的空读不会消费随后写入的字，读值用队列序列校验',()=>{
  const queue:number[]=[];const outputs:number[]=[];
  for(const [wr,rd,data] of [[1,1,17],[1,0,29],[0,1,0]]){
   const take=!!rd&&queue.length>0,put=!!wr&&queue.length<4;
   if(take)outputs.push(queue.shift()!);if(put)queue.push(data);
  }
  expect(outputs).toEqual([17]);expect(queue).toEqual([29]);expect(gradeAnswer(get('FIFO-0002'),{raw:String(outputs[0])})).toMatchObject({isCorrect:true});
 });
 it('握手不是数据变化检测，两个相同字的握手仍是两个beat',()=>{
  const rows=[[1,0,42],[1,1,42],[1,1,42],[0,1,0]];
  const accepted=rows.filter(([v,r])=>v&&r);expect(accepted.map(([, ,d])=>d)).toEqual([42,42]);
  expect(gradeAnswer(get('BUS-0001'),{raw:String(accepted.length)})).toMatchObject({isCorrect:true});
  expect(gradeAnswer(get('BUS-0002'),['A'])).toMatchObject({isCorrect:true});expect([[1,0,1],[1,1,1]].map(([s,e,r])=>!!(s&&e&&r))).toEqual([false,true]);
 });
 it('3段网页代码逐字等于严格CI用的源文件，修复不改变暂停时count保持',()=>{
  for(const [id,field,module] of [['RTL-0001','promptMd','starter_enable4'],['RTL-0002','promptMd','starter_tick_bug'],['RTL-0002','referenceAnswerMd','starter_tick_fixed']] as const){
   const q=get(id);expect(q.type).toBe('waveform_analysis');const text=field==='promptMd'?q.promptMd:('referenceAnswerMd' in q?q.referenceAnswerMd:'');
   expect(text.match(/```systemverilog\s*\n([\s\S]*?)```/)?.[1].trim()).toBe(readFileSync(`rtl/review/${module}.sv`,'utf8').replaceAll('\r','').trim());
  }
  let q=0;expect([[1,9],[0,3],[0,5],[1,6]].map(([en,d])=>{if(en)q=d;return q;})).toEqual([9,9,9,6]);
  const trace=(fixed:boolean)=>{let count=3,tick=0;return [1,0,1].map(en=>{if(fixed)tick=0;if(en){tick=Number(count===3);count=(count+1)%4;}return [count,tick];});};
  expect(trace(false)).toEqual([[0,1],[0,1],[1,0]]);expect(trace(true)).toEqual([[0,1],[0,0],[1,0]]);
 });
 it('起步2题单独引用，原45题顺序和范围不混入起步题',()=>{
  const mainIds=coreLearningPaths.flatMap(p=>p.stages.flatMap(s=>s.questionIds));expect(mainIds).toHaveLength(45);
  const warmupIds=Object.entries(coreWarmups).filter(([id])=>['fifo','rtl','bus'].includes(id)).flatMap(([,s])=>s.questionIds);expect(warmupIds).toHaveLength(6);expect(new Set([...mainIds,...warmupIds]).size).toBe(51);
  for(const [pathId,stage]of Object.entries(coreWarmups)){expect(stage.id).toBe('warmup');expect(stage.questionIds).toHaveLength(2);const path=coreLearningPaths.find(p=>p.id===pathId)!;expect(stage.questionIds.every(id=>questions.find(q=>q.id===id)?.topicId===path.topicId)).toBe(true);}
 });
});
