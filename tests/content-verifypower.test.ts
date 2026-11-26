import {describe,it,expect} from 'vitest';
import {questions} from '../src/data/question-bank';
import {gradeAnswer} from '../src/domain/grading';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-VERIFYPOWER-${id}`)!;
describe('验证诊断与低功耗',()=>{
 it('12题共198，资料只支持技术方向且不归因公司',()=>{
  expect(questions.filter(q=>!/^ADAPTED-(ARCHTOOLS|STARTER|TIMINGSTART|OPPREC|EXAMBASE|EXAMSV|DESIGNEXAM)-/.test(q.id))).toHaveLength(198);
  const batch=questions.filter(q=>q.id.startsWith('ADAPTED-VERIFYPOWER-'));expect(batch).toHaveLength(12);
  for(const q of batch){expect(q.contentVersion).toBe(1);expect(q.reviewStatus).toBe('verified');expect(q.source.company).toBeUndefined();expect(q.source.questionFidelity).toBe('topic_only_reconstruction');}
 });
 it('非重叠保持义务包含解除背压的握手沿',()=>{
  const v=[1,1,1,0],r=[0,0,1,1],d=[0x12,0x12,0x13,0];
  const checks=[];for(let e=0;e<3;e++)if(v[e]&&!r[e])checks.push({at:e+1,pass:!!v[e+1]&&d[e+1]===d[e]});
  expect(checks).toEqual([{at:1,pass:true},{at:2,pass:false}]);
 });
 it('稳定含X字符串不等于已知值',()=>{
  const previous='10X1',current='10X1';expect(current===previous).toBe(true);expect(/^[01]+$/.test(current)).toBe(false);
  expect(gradeAnswer(get('DV-0002'),['A','C'])).toMatchObject({isCorrect:true});
 });
 it('错误响应消费对应ID队首而额外响应不影响其他队列',()=>{
  const pending=new Map([[1,[10,20]],[2,[30]]]);const errors=[];
  for(const [id,data]of [[1,99],[2,30],[1,20],[1,20]]){
   const queue=pending.get(id);if(!queue?.length)errors.push(['unexpected',id,data]);
   else {const expected=queue.shift();if(expected!==data)errors.push(['mismatch',id,expected,data]);}
  }
  expect(errors).toEqual([['mismatch',1,10,99],['unexpected',1,20]]);expect([...pending.values()].flat()).toEqual([]);
 });
 it('采样过滤不减少显式目标，ignore和illegal作用不能互换',()=>{
  const hits=new Set([[1,0],[1,1],[0,2],[0,3],[0,0]].filter(([enable])=>enable).map(([,mode])=>mode));
  expect(gradeAnswer(get('DV-0004'),{raw:String(hits.size/4*100),unit:'%'})).toMatchObject({isCorrect:true});
  expect(gradeAnswer(get('DV-0005'),['A','C'])).toMatchObject({isCorrect:true});
 });
 it('穷举MUX选择线故障的8个输入，比较好坏输出',()=>{
  const detect=[];for(const a of [0,1])for(const b of [0,1])for(const sel of [0,1])if((sel?a:b)!==b)detect.push([a,b,sel]);
  expect(detect).toEqual([[0,1,1],[1,0,1]]);expect(gradeAnswer(get('DFT-0001'),{raw:String(detect.length)})).toMatchObject({isCorrect:true});
  expect(gradeAnswer(get('DFT-0002'),['A','C'])).toMatchObject({isCorrect:true});
 });
 it('扫描链以沿前SO观测，故障从中间向末端传播',()=>{
  let q=0;const so=[],states=[];for(let e=0;e<6;e++){so.push((q>>2)&1);q=((q<<1)&7)|2;states.push(q);}
  expect(so).toEqual([0,0,1,1,1,1]);expect(states.slice(0,2)).toEqual([2,6]);
 });
 it('排空后的保存/隔离ack链及钳位极性',()=>{
  let pending=3+2;const values=[pending];for(const completed of [1,1,2,1]){pending-=completed;values.push(pending);}
  expect(values).toEqual([5,4,3,1,0]);const emptyEdge=values.findIndex(v=>v===0);
  expect(gradeAnswer(get('POWER-0002'),{raw:String(emptyEdge+4)})).toMatchObject({isCorrect:true});
  expect(gradeAnswer(get('POWER-0003'),['A','C'])).toMatchObject({isCorrect:true});
 });
});
