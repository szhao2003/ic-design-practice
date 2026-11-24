import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {questions} from '../src/data/question-bank';
import {gradeAnswer} from '../src/domain/grading';
const get=(suffix:string)=>questions.find(q=>q.id===`ADAPTED-FOCUSED-${suffix}`)!;
const answer=(id:string)=>{const q=get(id);return 'referenceAnswerMd' in q?q.referenceAnswerMd:'';};
describe('高频任务与汇编补充',()=>{
 it('132个汇编题号唯一且引用有效，部分覆盖不冒充完成',()=>{
  const audit=JSON.parse(readFileSync('docs/source-collection-coverage.json','utf8')) as {entries:Array<{number:number;status:string;localIds:string[];note:string}>};
  expect(audit.entries.map(r=>r.number)).toEqual(Array.from({length:132},(_,i)=>i+1));
  for(const row of audit.entries){expect(['covered','rewritten','partial','needs_conditions','deferred']).toContain(row.status);expect(row.note.length).toBeGreaterThan(5);for(const id of row.localIds)expect(questions.some(q=>q.id===id)).toBe(true);}
  expect(audit.entries[82].status).toBe('covered');expect(audit.entries[107].status).toBe('rewritten');
 });

 it('18道新增，保留132道历史，来源不冒充公司原题',()=>{
  const batch=questions.filter(q=>q.id.startsWith('ADAPTED-FOCUSED-'));expect(batch).toHaveLength(18);expect(questions.filter(q=>!/^ADAPTED-(INTEGRATION|BOUNDARY|SAMPLING|CODEC|BUSTIMING|VERIFYPOWER|ARCHTOOLS|STARTER|TIMINGSTART)-/.test(q.id))).toHaveLength(150);
  expect(questions.filter(q=>!/^ADAPTED-(FOCUSED|INTEGRATION|BOUNDARY|SAMPLING|CODEC|BUSTIMING|VERIFYPOWER|ARCHTOOLS|STARTER|TIMINGSTART)-/.test(q.id))).toHaveLength(132);
  for(const q of batch){expect(q.contentVersion).toBe(1);expect(q.source.questionFidelity).toBe('topic_only_reconstruction');expect(q.source.company).toBeUndefined();expect(q.reviewStatus).toBe('verified');}
 });
 it('五份网页RTL与实际仿真源码逐字一致，人工评分契约完整',()=>{
  const modules={'RTL-SEQ-0001':'seq1101_valid','RTL-FIFO-0001':'sync_fifo4x8','RTL-DIV-0001':'divide3_half','RTL-MIN-0001':'stream_second8','RTL-DEBOUNCE-0001':'debounce3'};
  for(const [id,module] of Object.entries(modules)){
   const q=get(id);if(q.type!=='rtl_coding')throw Error('type');
   expect(q.referenceAnswerMd.match(/```systemverilog\s*\n([\s\S]*?)```/)?.[1].replaceAll('\r','').trim()).toBe(readFileSync(`rtl/reference/${module}.sv`,'utf8').trim());
   expect(q.rubric.length).toBeGreaterThanOrEqual(4);expect(readFileSync(`rtl/tb/${module}_tb.sv`,'utf8')).toContain('$fatal');
  }
 });
 it('FSM重叠流的后缀模型，空泡不消耗但事件必须清零',()=>{
  const input=[1,1,0,1,null,1,0,1];let accepted='';const events:boolean[]=[];
  for(const bit of input){if(bit===null)events.push(false);else{accepted+=bit;events.push(accepted.endsWith('1101'));}}
  expect(events).toEqual([false,false,false,true,false,false,false,true]);
  expect(get('RTL-SEQ-0001').promptMd).toContain('第4和第7');
 });
 it('4bit绝对值穷举，对signed输出最小宽度求界',()=>{
  const values=Array.from({length:16},(_,bits)=>bits<8?bits:bits-16),magnitudes=values.map(Math.abs);
  expect(Math.max(...magnitudes)).toBe(8);expect(2**3-1).toBeLessThan(8);expect(2**4-1).toBeGreaterThanOrEqual(8);
  expect(gradeAnswer(get('LOGIC-ABS-0001'),['A','C'])).toMatchObject({isCorrect:true});
 });
 it('选择树层结点与叶子下界独立计数',()=>{
  const levels=[4,2,1];expect(levels.reduce((a,b)=>a+b,0)).toBe(8-1);
  expect(gradeAnswer(get('LOGIC-MUX-0001'),{raw:String(4*levels.reduce((a,b)=>a+b,0))})).toMatchObject({isCorrect:true});
 });
 it('WRAP逐拍模运算与单beat对齐，下界不要求等于首地址',()=>{
  const base=0x50,size=4,bytes=16,start=0x5c;
  const addresses=Array.from({length:4},(_,i)=>base+((start-base+i*size)%bytes));
  expect(addresses).toEqual([0x5c,0x50,0x54,0x58]);expect(start%size).toBe(0);expect(start%bytes).not.toBe(0);
  expect(new Set(addresses).size).toBe(4);expect(answer('AXI-WRAP-0001')).toContain('5C、50、54、58');
 });
 it('时钟MUX在两输入恒定时仍会随sel制造边沿',()=>{
  const input0=0,input1=1,selectors=[0,1,0];const output=selectors.map(s=>s?input1:input0);
  expect(output).toEqual([0,1,0]);expect(answer('CLOCK-MUX-0001')).toContain('1ns');
 });
 it('APB背靠背转移须经过SETUP，等待只延长当前ACCESS',()=>{
  const states=['SETUP','ACCESS_WAIT','ACCESS_COMPLETE','SETUP','ACCESS_COMPLETE'];
  const enable=states.map(s=>s!=='SETUP');expect(enable).toEqual([false,true,true,false,true]);
  expect(gradeAnswer(get('APB-STATE-0001'),['A','C'])).toMatchObject({isCorrect:true});
 });
 it('互等状态00是固定点，独立发VALID才有推进条件',()=>{
  let valid=false,ready=false;for(let i=0;i<5;i++){const nextValid:boolean=ready,nextReady:boolean=valid;valid=nextValid;ready=nextReady;}
  expect([valid,ready]).toEqual([false,false]);
  expect(gradeAnswer(get('AXI-DEADLOCK-0001'),['A','D'])).toMatchObject({isCorrect:true});
 });
 it('不同corner最大/最小延迟分开检查',()=>{
  const choices=[[2.2,.4,1],[1.8,.25,3],[1.9,.35,2]];
  expect(choices.map(([max,min])=>max<=2&&min>=.3)).toEqual([false,false,true]);
  expect(gradeAnswer(get('PPA-CORNER-0001'),['A','C'])).toMatchObject({isCorrect:true});
 });
 it('容量用字节与字地址两种方式推导',()=>{
  const bytesPerChip=2**12*(16/8),chips=2**20/bytesPerChip;
  expect(chips).toBe(2**(19-12));expect(gradeAnswer(get('MEM-CAP-0001'),{raw:String(chips)})).toMatchObject({isCorrect:true});
 });
 it('给定LFSR反馈枚举轨道和零锁死，不套用通用周期',()=>{
  const next=(x:number)=>((x<<1)&7)|(((x>>2)^x)&1);let q=1;const states:number[]=[];
  do{states.push(q);q=next(q);}while(q!==1&&states.length<9);
  expect(states).toEqual([1,3,7,6,5,2,4]);expect(next(0)).toBe(0);
 });
});
