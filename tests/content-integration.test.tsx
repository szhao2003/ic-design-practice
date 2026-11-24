import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {questions} from '../src/data/question-bank';
import {gradeAnswer,isManual} from '../src/domain/grading';
import {ReferenceAnswer} from '../src/components/QuestionContent';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-INTEGRATION-${id}`)!;
describe('完整接口与时序约束',()=>{
 it('6道独立任务，156总量，来源与人工判分边界保持真实',()=>{
  expect(questions.filter(q=>!/^ADAPTED-(BOUNDARY|SAMPLING|CODEC|BUSTIMING|VERIFYPOWER)-/.test(q.id))).toHaveLength(156);
  const batch=questions.filter(q=>q.id.startsWith('ADAPTED-INTEGRATION-'));
  expect(batch).toHaveLength(6);
  for(const q of batch){
   expect(q.contentVersion).toBe(1);expect(q.reviewStatus).toBe('verified');
   expect(q.source.company).toBeUndefined();expect(q.source.questionFidelity).toBe('topic_only_reconstruction');
   expect(q.tags).toContain('完整接口与时序约束');
  }
 });
 it('两份网页RTL等于被仿真的源码，完整模块可渲染复制',()=>{
  for(const [id,module] of [['FIFO-0001','async_fifo_gray'],['AXIL-0001','axil_regs2']]){
   const q=get(id);if(q.type!=='rtl_coding')throw Error('type');
   expect(q.referenceAnswerMd.match(/```systemverilog\s*\n([\s\S]*?)```/)?.[1].trim()).toBe(readFileSync(`rtl/reference/${module}.sv`,'utf8').trim());
   expect(readFileSync(`rtl/tb/${module}_tb.sv`,'utf8')).toContain('$fatal');
   expect(q.rubric.length).toBeGreaterThanOrEqual(5);
   expect(renderToStaticMarkup(<ReferenceAnswer question={q}/>)).toContain('复制代码');
   expect(isManual(q)).toBe(true);
   expect(gradeAnswer(q,'arbitrary code')).toMatchObject({valid:false});
  }
 });
 it('满指针二进制相差D时，Gray最高两位相反：穷举四个深度及绕回',()=>{
  for(const a of [2,3,4,5]){
   const d=2**a,mod=2*d,g=(b:number)=>b^(b>>1),mask=3<<(a-1);
   for(let r=0;r<mod;r++){
    expect(g((r+d)%mod)^g(r)).toBe(mask);
    const adjacent=g((r+1)%mod)^g(r);
    expect(adjacent>0 && (adjacent&(adjacent-1))===0).toBe(true);
   }
  }
 });
 it('空标志使用旧第二级同步指针，R4才读取唯一字',()=>{
  let sync1=0,sync2=0,empty=true,rb=0;
  const rows=[];
  for(let edge=1;edge<=4;edge++){
   const take:boolean=!empty;
   const nextRb:number=rb+Number(take);
   const nextEmpty:boolean=(nextRb^(nextRb>>1))===sync2;
   [sync1,sync2,empty,rb]=[1,sync1,nextEmpty,nextRb];
   rows.push([sync1,sync2,empty,take]);
  }
  expect(rows).toEqual([[1,0,true,false],[1,1,true,false],[1,1,false,false],[1,1,true,true]]);
 });
 it('多周期setup预算和同沿hold符号分别检查，ps和ns判分一致',()=>{
  const budget=3*4+.2-.1-.3-.4;
  expect(budget).toBeCloseTo(11.4,12);
  expect(.15+.25-(.2+.12+.05)).toBeCloseTo(.03,12);
  for(const input of [{raw:'11.4',unit:'ns'},{raw:'11400',unit:'ps'}])expect(gradeAnswer(get('STA-0002'),input)).toMatchObject({isCorrect:true});
  expect(gradeAnswer(get('STA-0002'),{raw:'11.8',unit:'ns'})).toMatchObject({isCorrect:false});
 });
 it('部分写以byte数组推导两次结果，旧读快照独立于寄存器更新',()=>{
  const bytes=[0x44,0x33,0x22,0x11];const snapshot=[...bytes];
  const first=[0xdd,0xcc,0xbb,0xaa];
  for(const i of [0,2])bytes[i]=first[i];
  expect([...bytes].reverse().map(b=>b.toString(16).padStart(2,'0')).join('')).toBe('11bb33dd');
  for(const i of [1,3])bytes[i]=0xff;
  expect([...bytes].reverse().map(b=>b.toString(16).padStart(2,'0')).join('')).toBe('ffbbffdd');
  expect(snapshot).toEqual([0x44,0x33,0x22,0x11]);
 });
 it('本轮只提升三个实际补全任务的覆盖状态',()=>{
  const audit=JSON.parse(readFileSync('docs/source-collection-coverage.json','utf8'));
  for(const n of [61,83,118]){
   const row=audit.entries.find((r:{number:number})=>r.number===n);
   expect(['covered','rewritten']).toContain(row.status);
   expect(row.localIds.some((id:string)=>id.startsWith('ADAPTED-INTEGRATION-'))).toBe(true);
  }
  expect(audit.entries.filter((r:{status:string})=>['covered','rewritten'].includes(r.status))).toHaveLength(99);
 });
});
