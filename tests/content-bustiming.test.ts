import {describe,it,expect} from 'vitest';
import {questions} from '../src/data/question-bank';
import {gradeAnswer} from '../src/domain/grading';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-BUSTIMING-${id}`)!;
describe('总线响应与时钟时序',()=>{
 it('12题独立改编共186，不冒充公司原题',()=>{
  expect(questions.filter(q=>!/^ADAPTED-(VERIFYPOWER|ARCHTOOLS|STARTER|TIMINGSTART)-/.test(q.id))).toHaveLength(186);const batch=questions.filter(q=>q.id.startsWith('ADAPTED-BUSTIMING-'));expect(batch).toHaveLength(12);
  for(const q of batch){expect(q.contentVersion).toBe(1);expect(q.source.company).toBeUndefined();expect(q.source.questionFidelity).toBe('topic_only_reconstruction');}
 });
 it('三种协议的有效完成沿不同',()=>{
  expect([[1,0,1],[1,1,0],[1,1,0],[1,1,1]].map(v=>v.every(Boolean))).toEqual([false,false,false,true]);
  const ready=[1,0,1,1,1],last=[0,0,0,0,1];expect(ready.reduce((a,b)=>a+b,0)).toBe(4);expect(ready.findIndex((r,i)=>r&&last[i])).toBe(4);
  expect([0,0,1].findIndex(Boolean)).toBe(2);
 });
 it('版本、响应和空闲类型的逐项判分',()=>{
  for(const [id,ans]of [['APB-0001',['A','C']],['AXI-0001',['A','D']],['AHB-0002',['A','C']]] as const)expect(gradeAnswer(get(id),[...ans])).toMatchObject({isCorrect:true});
 });
 it('按绝对边沿预算核对setup与hold，单位一致',()=>{
  expect((9.9-.3-.1)-(.2+.4+8.7)).toBeCloseTo(.2,12);expect((.6+.15+.05)-(.1+.12)).toBeCloseTo(.58,12);
  for(const [id,ns,ps]of [['STA-0002','.2','200'],['STA-0003','.58','580']])for(const input of [{raw:ns,unit:'ns'},{raw:ps,unit:'ps'}])expect(gradeAnswer(get(id),input)).toMatchObject({isCorrect:true});
 });
 it('skew和周期分开推导，固定模型吞吐不按名字排序',()=>{
  const src=[.1,10.25,20.05],dst=[.4,10.55,20.35];for(let i=0;i<3;i++)expect(dst[i]-src[i]).toBeCloseTo(.3,12);
  expect(src[1]-src[0]).toBeCloseTo(10.15,12);expect(src[2]-src[1]).toBeCloseTo(9.8,12);
  expect(gradeAnswer(get('BUS-0001'),{raw:String((1e8*4)/(1e8*4/2)),unit:'倍'})).toMatchObject({isCorrect:true});
 });
});
