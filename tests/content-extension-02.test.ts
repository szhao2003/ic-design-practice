import {describe,it,expect} from 'vitest';
import {questions} from '../src/data/question-bank';
import {gradeAnswer} from '../src/domain/grading';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-EXTENSION-${id}`)!;
const correct=(id:string,raw:number)=>expect(gradeAnswer(get(id),{raw:String(raw)})).toMatchObject({isCorrect:true});
describe('电路脚本与接口第二批：独立求解',()=>{
 it('新增8题，四专题各2，来源为考点改编，全部122题',()=>{
  const batch=questions.filter(q=>q.id.startsWith('ADAPTED-EXTENSION-'));
  expect(batch).toHaveLength(8);expect(questions.filter(q=>!/^ADAPTED-(CORE3|MINI|FOCUSED|INTEGRATION|BOUNDARY|SAMPLING|CODEC|BUSTIMING|VERIFYPOWER)-/.test(q.id))).toHaveLength(122);
  for(const topic of ['07','11','13','15'])expect(batch.filter(q=>q.topicId===topic)).toHaveLength(2);
  for(const q of batch)expect(q).toMatchObject({contentVersion:1,source:{kind:'practice_collection',evidenceGrade:'C',questionFidelity:'topic_only_reconstruction',sourceClaimVerification:'checked'}});
 });
 it('节点导纳方程与负载前后压降交叉核对',()=>{
  const v=(3.3/1000)/(1/1000+1/2000+1/2000);
  expect(v).toBeCloseTo(1.65);expect((3.3-v)/1000).toBeCloseTo(v/2000+v/2000);
  expect(v).toBeLessThan(3.3*2/3);correct('CIRCUIT-0001',v);
 });
 it('微步积分独立求解RC两段电流，检查切换电压连续',()=>{
  const dt=1e-5;let v=0,switchValue=0;
  for(let i=0;i<200000;i++){const input=i<100000?3:0;if(i===100000)switchValue=v;v+=(input-v)*dt;}
  expect(switchValue).toBeCloseTo(1.89636,4);expect(v).toBeCloseTo(.69763247,5);
  correct('CIRCUIT-0002',v);
 });
 it('逐位权重和补码独立核对字节解码，显式区别小端',()=>{
  const raw=[0x80,0,0,1];const big=raw.reduce((value,b)=>value*256+b,0);
  const little=[...raw].reverse().reduce((value,b)=>value*256+b,0);
  expect(big).toBe(2147483649);expect(little).toBe(16777344);
  correct('TOOLS-0001',big-2**32);
 });
 it('概率树缩放成期望人数，分母同时包含良品误报',()=>{
  const badFail=2000*.9,goodFail=98000*.05;
  expect(badFail+goodFail).toBe(6700);correct('PROB-0001',100*badFail/(badFail+goodFail));
 });
 it('穷举三次成功/失败路径，按实际停止时间算无条件均值',()=>{
  let sum=0,total=0,failed=0;
  for(let mask=0;mask<8;mask++){
   const outcomes=[0,1,2].map(i=>(mask>>i)&1);const prob=outcomes.reduce((p,s)=>p*(s?.8:.2),1);
   let time=0,success=false;
   for(let i=0;i<3;i++){time+=5;if(outcomes[i]){success=true;break;}if(i<2)time+=2;}
   sum+=time*prob;total+=prob;if(!success)failed+=prob;
  }
  expect(total).toBeCloseTo(1);expect(failed).toBeCloseTo(.008);expect(sum).toBeCloseTo(6.68);correct('PROB-0002',sum);
 });
 it('I2C按存活控制器实际驱动逐bit求总线，失败方后续释放',()=>{
  const bits=(addr:number)=>Array.from({length:7},(_,i)=>(addr>>(6-i))&1).concat(0);
  const a=bits(0x52),b=bits(0x56);let activeA=true,activeB=true;const bus:number[]=[];let lost=0;
  for(let i=0;i<8;i++){const da=activeA?a[i]:1,db=activeB?b[i]:1,line=da&db;bus.push(line);if(activeA&&da===1&&line===0){activeA=false;lost=i+1;}if(activeB&&db===1&&line===0){activeB=false;lost=i+1;}}
  expect({activeA,activeB,lost}).toEqual({activeA:true,activeB:false,lost:5});expect(bus.join('')).toBe('10100100');
  expect(get('I2C-0001').explanationMd).toContain('第5bit');
 });
 it('逐候选检查电流和上升时间，不能只检一个上下界',()=>{
  const candidates=[680,2200,2700,4700];
  const valid=candidates.map(r=>(1.8-.2)/r<=.002&&.8473*r*150e-12<=300e-9);
  expect(valid).toEqual([false,true,false,false]);expect(.8473*2200*150e-12).toBeCloseTo(279.609e-9,12);
  expect(gradeAnswer(get('I2C-0002'),['B'])).toMatchObject({isCorrect:true});
 });
});
