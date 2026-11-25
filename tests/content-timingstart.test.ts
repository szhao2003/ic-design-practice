import { describe, it, expect } from 'vitest';
import { questions } from '../src/data/question-bank';
import { coreLearningPaths, coreWarmups } from '../src/data/core-learning-paths';
import { gradeAnswer } from '../src/domain/grading';
import { activePathSession } from '../src/domain/learning-path';
import type { PracticeSession } from '../src/domain/practice-session';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-TIMINGSTART-${id}`)!;
describe('STA与CDC起步练习',()=>{
 it('4道简单题至218，技术资料只支持规则方向',()=>{
  expect(questions.filter(q=>!/^ADAPTED-(OPPREC|EXAMBASE)-/.test(q.id))).toHaveLength(218);const batch=questions.filter(q=>q.id.startsWith('ADAPTED-TIMINGSTART-'));expect(batch).toHaveLength(4);
  for(const q of batch){expect(q.difficulty).toBe('easy');expect(q.contentVersion).toBe(1);expect(q.source.company).toBeUndefined();expect(q.source.questionFidelity).toBe('topic_only_reconstruction');expect(q.source.sourceClaimVerification).toBe('checked');}
 });
 it('Max报告相减保留负号，ns与ps判分一致，不能重复扣预算',()=>{
  const requiredPs=6000,arrivalPs=6200,slackPs=requiredPs-arrivalPs;expect(slackPs).toBe(-200);
  for(const input of [{raw:String(slackPs),unit:'ps'},{raw:String(slackPs/1000),unit:'ns'}])expect(gradeAnswer(get('STA-0001'),input)).toMatchObject({isCorrect:true});
  for(const value of ['0.2','-0.4','0'])expect(gradeAnswer(get('STA-0001'),{raw:value,unit:'ns'})).toMatchObject({isCorrect:false});
 });
 it('setup与hold的通过条件不可按余量求和抵消',()=>{
  const setupPs=120,holdPs=-40;expect(setupPs+holdPs>0).toBe(true);expect([setupPs>=0,holdPs>=0]).toEqual([true,false]);
  expect(gradeAnswer(get('STA-0002'),['C'])).toMatchObject({isCorrect:true});expect(gradeAnswer(get('STA-0002'),['A'])).toMatchObject({isCorrect:false});
 });
 it('先看时钟归属再数目的链级数',()=>{
  const clocks=[['src','dst'],['src','src'],['dst','src'],['dst','dst']];
  expect(clocks.map(chain=>chain.every(clock=>clock==='dst'))).toEqual([false,false,false,true]);
  expect(gradeAnswer(get('CDC-0001'),['D'])).toMatchObject({isCorrect:true});
 });
 it('四相返回前仍busy，控制契约与不受限toggle不能混用',()=>{
  const phases=[{req:0,ack:0,idle:true},{req:1,ack:0,idle:false},{req:1,ack:1,idle:false},{req:0,ack:1,idle:false},{req:0,ack:0,idle:true}];
  expect(phases.map(p=>p.idle)).toEqual([true,false,false,false,true]);
  let toggle=0;toggle^=1;toggle^=1;expect(toggle).toBe(0);
  expect(gradeAnswer(get('CDC-0002'),['A','C'])).toMatchObject({isCorrect:true});expect(gradeAnswer(get('CDC-0002'),['A','B','C'])).toMatchObject({isCorrect:false});
 });
 it('五条路径各有2道起步且互不重复，主路径仍45题',()=>{
  expect(Object.keys(coreWarmups).sort()).toEqual(coreLearningPaths.map(p=>p.id).sort());
  const main=coreLearningPaths.flatMap(p=>p.stages.flatMap(s=>s.questionIds)),warmups=Object.values(coreWarmups).flatMap(s=>s.questionIds);
  expect(main).toHaveLength(45);expect(warmups).toHaveLength(10);expect(new Set([...main,...warmups]).size).toBe(55);
  for(const path of coreLearningPaths){expect(coreWarmups[path.id].questionIds).toHaveLength(2);for(const id of coreWarmups[path.id].questionIds){const q=questions.find(q=>q.id===id)!;expect(q.topicId).toBe(path.topicId);expect(q.difficulty).toBe('easy');}}
 });
 it('起步与原阶段活动轮次分开匹配，新增目录不接管原轮次',()=>{
  const make=(id:string,pathStage:string):PracticeSession=>({id,kind:'practice',status:'active',questionKeys:['key1','key2'],roundIds:['r1','r2'],currentIndex:0,startedAt:'2026-11-24T12:00:00Z',updatedAt:'2026-11-24T12:00:00Z',filtersSnapshot:{learningPath:'sta',pathStage}});
  const sessions=[make('old-all','all'),make('old-rules','rules'),make('new-warmup','warmup')];
  expect(activePathSession(sessions,'sta','all')?.id).toBe('old-all');expect(activePathSession(sessions,'sta','rules')?.id).toBe('old-rules');expect(activePathSession(sessions,'sta','warmup')?.id).toBe('new-warmup');
 });
});
