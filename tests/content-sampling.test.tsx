import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {questions} from '../src/data/question-bank';
import {gradeAnswer,isManual} from '../src/domain/grading';
import {ReferenceAnswer} from '../src/components/QuestionContent';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-SAMPLING-${id}`)!;
describe('采样复位与状态机',()=>{
 it('6道新增共168，独立改编不声明公司原题',()=>{
  expect(questions.filter(q=>!/^ADAPTED-(CODEC|BUSTIMING|VERIFYPOWER|ARCHTOOLS|STARTER|TIMINGSTART)-/.test(q.id))).toHaveLength(168);
  const batch=questions.filter(q=>q.id.startsWith('ADAPTED-SAMPLING-'));
  expect(batch).toHaveLength(6);
  for(const q of batch){expect(q.contentVersion).toBe(1);expect(q.source.questionFidelity).toBe('topic_only_reconstruction');expect(q.source.company).toBeUndefined();expect(q.tags).toContain('采样复位与状态机');}
 });
 it('网页完整边沿RTL与仿真源码一致且使用人工自评',()=>{
  const q=get('EDGE-0001');if(q.type!=='rtl_coding')throw Error('type');
  expect(q.referenceAnswerMd.match(/```systemverilog\s*\n([\s\S]*?)```/)?.[1].trim()).toBe(readFileSync('rtl/reference/sample_edges.sv','utf8').trim());
  expect(isManual(q)).toBe(true);expect(q.rubric.length).toBeGreaterThanOrEqual(5);
  expect(renderToStaticMarkup(<ReferenceAnswer question={q}/>)).toContain('复制代码');
 });
 it('有效采样序列首拍不报，空泡清事件但不改变历史',()=>{
  const inputs=[1,null,0,1,0,null,1] as const;
  const accepted:number[]=[];
  const events=inputs.map(v=>{
   if(v===null)return [0,0,0];
   accepted.push(v);if(accepted.length<2)return [0,0,0];
   const a=accepted.at(-2)!,b=accepted.at(-1)!;
   return [Number(a===0&&b===1),Number(a===1&&b===0),Number(a!==b)];
  });
  expect(events).toEqual([[0,0,0],[0,0,0],[0,1,1],[1,0,1],[0,1,1],[0,0,0],[1,0,1]]);
  for(const e of events){expect(e[0]+e[1]).toBe(e[2]);expect(e[0]*e[1]).toBe(0);}
 });
 it('短/长复位的绝对时间事件模型与题定观察表一致',()=>{
  const clocks=[5,15,25,35],asserts=[7,22];
  const rst=(t:number)=>(t>=7&&t<9)||(t>=22&&t<28);
  const values=[6,8,10,16,26,30,36].map(t=>{
   const clock=clocks.filter(c=>c<t).at(-1)!;
   const sync=Number(!rst(clock));
   const lastAssert=asserts.filter(a=>a<t).at(-1)??-Infinity;
   return [sync,lastAssert>clock?0:sync];
  });
  expect(values).toEqual([[1,1],[1,0],[1,0],[1,1],[0,0],[0,0],[1,1]]);
  expect(gradeAnswer(get('RESET-0002'),['A','B'])).toMatchObject({isCorrect:true});
 });
 it('recovery/removal窗口求交而非同向扣减，单位判分一致',()=>{
  const earliest=10+.8+.2,latest=20-1.5-.2;
  expect(earliest).toBe(11);expect(latest).toBe(18.3);expect(latest-earliest).toBeCloseTo(7.3,12);
  for(const input of [{raw:'18.3',unit:'ns'},{raw:'18300',unit:'ps'}])expect(gradeAnswer(get('RESET-0003'),input)).toMatchObject({isCorrect:true});
  expect(gradeAnswer(get('RESET-0003'),{raw:'18.5',unit:'ns'})).toMatchObject({isCorrect:false});
 });
 it('事件观察题给完整代码及四行顺序，严格仿真入口检查真实stdout',()=>{
  const q=get('SV-0001');if(q.type!=='waveform_analysis')throw Error('type');
  expect(q.promptMd).toContain('module observer');expect(q.promptMd).toContain('$strobe');expect(q.promptMd).toContain('#0;');
  expect(q.referenceAnswerMd).toContain('D0、D1、S0、D2');
  expect(readFileSync('scripts/test-rtl.mjs','utf8')).toContain("'D0 a=0 b=0','D1 a=0 b=0','S0 a=5 b=0','D2 a=5 b=0'");
 });
 it('Moore仅说明逻辑依赖，不排除状态位延迟差的组合瞬态',()=>{
  const transition=[0b01,0b00,0b10];
  expect(transition.map(s=>Number(s===0))).toEqual([0,1,0]);
  expect(gradeAnswer(get('FSM-0001'),['A','C','E'])).toMatchObject({isCorrect:true});
 });
 it('覆盖只提升六个已重构题号，缺条件项仍保持显式状态',()=>{
  const audit=JSON.parse(readFileSync('docs/source-collection-coverage.json','utf8'));
  for(const n of [4,5,9,12,16,80])expect(['covered','rewritten']).toContain(audit.entries[n-1].status);
  expect(audit.entries.filter((r:{status:string})=>['covered','rewritten'].includes(r.status))).toHaveLength(99);
  expect(audit.entries[26].status).toBe('needs_conditions');
  const count=(status:string)=>audit.entries.filter((r:{status:string})=>r.status===status).length;
  const summary=`${count('covered')+count('rewritten')}个题号已有对应/修正任务（${count('covered')}+${count('rewritten')}），${count('partial')}部分覆盖，${count('needs_conditions')}需补条件，${count('deferred')}暂缓`;
  expect(readFileSync('docs/SOURCE_COLLECTION_COVERAGE.md','utf8')).toContain(summary);
 });
});
