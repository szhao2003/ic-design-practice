import {describe,it,expect} from 'vitest';
import {questions} from '../src/data/question-bank';
import {gradeAnswer} from '../src/domain/grading';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-SYSTEM-${id}`)!;
const correct=(id:string,raw:number)=>expect(gradeAnswer(get(id),{raw:String(raw)})).toMatchObject({isCorrect:true});
describe('系统与实现第二批：边界与独立模型',()=>{
 it('8题、四个专题各2题，来源性质和内部版本明确',()=>{
  const batch=questions.filter(q=>q.id.startsWith('ADAPTED-SYSTEM-'));
  expect(batch).toHaveLength(8);expect(questions.filter(q=>!/^ADAPTED-(EXTENSION|CORE3|MINI|FOCUSED|INTEGRATION|BOUNDARY|SAMPLING|CODEC|BUSTIMING)-/.test(q.id))).toHaveLength(114);
  for(const topic of ['08','10','12','14'])expect(batch.filter(q=>q.topicId===topic)).toHaveLength(2);
  for(const q of batch)expect(q).toMatchObject({contentVersion:1,reviewStatus:'verified',source:{kind:'practice_collection',evidenceGrade:'C',questionFidelity:'topic_only_reconstruction',sourceClaimVerification:'checked'}});
 });
 it('直接比较能量，分别检查边界前、边界、边界后',()=>{
  const diff=(time:number)=>10*time-(24+2*time);
  expect(diff(2)).toBeLessThan(0);expect(diff(3)).toBe(0);expect(diff(4)).toBeGreaterThan(0);
  correct('POWER-0001',3);
 });
 it('cache逐次维护valid/tag/dirty，分开统计读入和写回',()=>{
  const lines:Array<{block:number;dirty:boolean}|undefined>=[undefined,undefined];
  const ops=[['W',0],['R',0x20],['R',0],['W',0x10],['R',0x30],['W',0x20]] as const;
  let fill=0,writeback=0;const evicted:number[]=[];
  for(const [op,addr] of ops){const block=Math.floor(addr/16),index=block%2;let line=lines[index];
   if(line?.block!==block){fill+=16;if(line?.dirty){writeback+=16;evicted.push(line.block);}line={block,dirty:false};lines[index]=line;}
   if(op==='W')line.dirty=true;
  }
  expect({fill,writeback,evicted}).toEqual({fill:96,writeback:32,evicted:[0,1]});
  expect(lines).toEqual([{block:2,dirty:true},{block:3,dirty:false}]);correct('ARCH-0001',fill+writeback);
 });
 it('固定任务逐段求时并比较有无搬运，检查极限',()=>{
  const old=100,serial=25,accelerated=75/3,overhead=10;
  expect(serial+accelerated+overhead).toBe(60);expect(old/(serial+accelerated)).toBe(2);
  expect(old/(serial+overhead)).toBeCloseTo(20/7);correct('ARCH-0002',old/60);
 });
 it('枚举所有四链正整数分配求最短链长，再建立完整测试事件序列',()=>{
  let best=73;for(let a=1;a<=70;a++)for(let b=1;b<73-a;b++)for(let c=1;c<73-a-b;c++){
   const d=73-a-b-c;if(d>0)best=Math.min(best,Math.max(a,b,c,d));
  }
  expect(best).toBe(19);
  const events:string[]=Array(best).fill('initial-load');
  for(let p=0;p<20;p++){events.push('capture');events.push(...Array(best).fill(p===19?'final-unload':'unload-and-load'));}
  expect(events.filter(x=>x==='capture')).toHaveLength(20);expect(events.filter(x=>x==='final-unload')).toHaveLength(19);
  correct('DFT-0001',events.length);
 });
 it('穷举16个正常response与15个非零mask，证明单拍parity别名条件',()=>{
  const bits=(x:number)=>[0,1,2,3].reduce((n,i)=>n+((x>>i)&1),0);
  const parity=(x:number)=>bits(x)%2;
  let aliases=0;
  for(let good=0;good<16;good++)for(let mask=1;mask<16;mask++){
   const same=parity(good)===parity(good^mask);expect(same).toBe(bits(mask)%2===0);if(good===10&&same)aliases++;
  }
  expect(aliases).toBe(7);expect(parity(10)).toBe(parity(9));
  expect(gradeAnswer(get('DFT-0002'),['A','B','D'])).toMatchObject({isCorrect:true});
 });
 it('候选先检查内部频率，再查目标输出，不能只看总分频比',()=>{
  const candidates=[[24,3,10],[12,3,5],[24,3,8],[40,2,25]];
  const valid=candidates.map(([m,d,o])=>{const vco=100*m/d;return vco>=600&&vco<=1200&&vco/o===80;});
  expect(valid).toEqual([true,false,false,false]);
  expect(gradeAnswer(get('FPGA-0001'),['A'])).toMatchObject({isCorrect:true});
 });
 it('穷举65536个signed乘积，推导最终和与全部前缀的最小安全位宽',()=>{
  let lo=Infinity,hi=-Infinity;for(let a=-128;a<=127;a++)for(let b=-128;b<=127;b++){lo=Math.min(lo,a*b);hi=Math.max(hi,a*b);}
  expect([lo,hi]).toEqual([-16256,16384]);
  let width=1;while(lo*16<-(2**(width-1))||hi*16>2**(width-1)-1)width++;
  expect(hi*16).toBe(2**18);expect(width).toBe(20);
  for(let k=0;k<=16;k++){expect(lo*k).toBeGreaterThanOrEqual(-(2**19));expect(hi*k).toBeLessThanOrEqual(2**19-1);}
  correct('FPGA-0002',width);
 });
});
