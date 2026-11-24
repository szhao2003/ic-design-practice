import {describe,it,expect} from 'vitest';
import {questions} from '../src/data/question-bank';
import {gradeAnswer} from '../src/domain/grading';
const get=(n:number)=>questions.find(q=>q.id===`ADAPTED-MINI-CACHE-000${n}`)!;
describe('Cache两题小补充',()=>{
 it('新增2题，共132，来源与旧题数量明确',()=>{
  expect(questions.filter(q=>!/^ADAPTED-(FOCUSED|INTEGRATION|BOUNDARY|SAMPLING)-/.test(q.id))).toHaveLength(132);expect(questions.filter(q=>q.id.startsWith('ADAPTED-MINI-'))).toHaveLength(2);
  for(const q of [get(1),get(2)])expect(q).toMatchObject({contentVersion:1,source:{kind:'practice_collection',evidenceGrade:'C',questionFidelity:'topic_only_reconstruction'}});
 });
 it('按时间戳选最久未用者，独立核对LRU队列',()=>{
  const sets=[new Map<number,number>(),new Map<number,number>()];const hits:boolean[]=[];
  [0x00,0x20,0x00,0x40,0x20,0x00].forEach((address,time)=>{
   const block=Math.floor(address/16),set=sets[block%2];hits.push(set.has(block));
   if(!set.has(block)&&set.size===2){const victim=[...set].sort((a,b)=>a[1]-b[1])[0][0];set.delete(victim);}
   set.set(block,time);
  });
  expect(hits).toEqual([false,false,true,false,false,false]);expect([...sets[0].keys()].sort()).toEqual([0,2]);expect(sets[1].size).toBe(0);
  expect(gradeAnswer(get(1),{raw:String(hits.filter(Boolean).length)})).toMatchObject({isCorrect:true});
 });
 it('100个请求按互斥路径计时，核对额外延迟公式和单位换算',()=>{
  const average=(90*1+8*7+2*57)/100;expect(average).toBeCloseTo(1+.1*(6+.2*50));
  expect(gradeAnswer(get(2),{raw:String(average),unit:'ns'})).toMatchObject({isCorrect:true});
  expect(gradeAnswer(get(2),{raw:'2600',unit:'ps'})).toMatchObject({isCorrect:true});
 });
});
