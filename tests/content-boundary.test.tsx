import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {questions} from '../src/data/question-bank';
import {gradeAnswer,isManual} from '../src/domain/grading';
import {ReferenceAnswer} from '../src/components/QuestionContent';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-BOUNDARY-${id}`)!;
describe('协议与计数边界',()=>{
 it('6道新增共162，来源只支持考点且无公司原题归因',()=>{
  expect(questions).toHaveLength(162);
  const batch=questions.filter(q=>q.id.startsWith('ADAPTED-BOUNDARY-'));
  expect(batch).toHaveLength(6);
  for(const q of batch){expect(q.contentVersion).toBe(1);expect(q.source.questionFidelity).toBe('topic_only_reconstruction');expect(q.source.company).toBeUndefined();expect(q.tags).toContain('协议与计数边界');}
 });
 it('网页去抖RTL等于维护侧源码且保持人工自评',()=>{
  const q=get('DEBOUNCE-0001');if(q.type!=='rtl_coding')throw Error('type');
  expect(q.referenceAnswerMd.match(/```systemverilog\s*\n([\s\S]*?)```/)?.[1].trim()).toBe(readFileSync('rtl/reference/debounce_cfg.sv','utf8').trim());
  expect(isManual(q)).toBe(true);expect(q.rubric.length).toBeGreaterThanOrEqual(5);
  expect(renderToStaticMarkup(<ReferenceAnswer question={q}/>)).toContain('复制代码');
 });
 it('按ID队列跟踪接受的beat，背压末拍不结束事务',()=>{
  const byId=new Map([[1,[{name:'A',length:3,seen:0},{name:'C',length:1,seen:0}]],[2,[{name:'B',length:2,seen:0}]]]);
  const trace=[[1,'A0',false,true],[2,'B0',false,true],[1,'A1',false,true],[1,'A2',true,false],[1,'A2',true,true],[1,'C0',true,true],[2,'B1',true,true]] as const;
  const counts:number[]=[],completed:string[]=[];let pending=3,accepted=0;
  for(const [id,data,last,ready]of trace){
   const task=byId.get(id)![0];expect(data).toBe(task.name+task.seen);expect(last).toBe(task.seen===task.length-1);
   if(ready){task.seen++;accepted++;if(last){completed.push(task.name);pending--;byId.get(id)!.shift();}}
   counts.push(pending);
  }
  expect(counts).toEqual([3,3,3,3,2,1,0]);expect(completed).toEqual(['A','C','B']);expect(accepted).toBe(6);
  expect(gradeAnswer(get('AXI-0002'),['A','C'])).toMatchObject({isCorrect:true});
 });
 it('FIFO无限容量峰值用闭式累计读数求出15，非平均速率估算',()=>{
  const readsAt=(ns:number)=>ns<63?0:Math.floor((ns-63)/20)+1;
  const occupancy=Array.from({length:32},(_,n)=>n+1-readsAt(n*12.5));
  expect(Math.max(...occupancy)).toBe(15);
  expect(readsAt(362.5)).toBe(15);expect(readsAt(375)).toBe(16);
  expect(gradeAnswer(get('FIFO-0001'),{raw:'32',unit:'字'})).toMatchObject({isCorrect:true});
  expect(gradeAnswer(get('FIFO-0001'),{raw:'16',unit:'字'})).toMatchObject({isCorrect:false});
 });
 it('写域延后看到的读数能在库存15时置满，下一请求被拒绝',()=>{
  const readCount=(t:number)=>t<63?0:Math.floor((t-63)/20)+1;
  let accepted=0,full=false;const rejected:number[]=[];
  for(let n=0;n<32;n++){
   if(full)rejected.push(n*12.5);else accepted++;
   // At write n the old second-stage read count was sampled at write n-2.
   const visible=n<2?0:readCount((n-2)*12.5);
   full=accepted-visible===16;
  }
  expect(accepted).toBe(31);expect(rejected).toEqual([375]);
 });
 it('所有配置的阈值与位宽边界，默认最大计数20bit',()=>{
  for(const cpm of [1,7,50000])for(let cfg=0;cfg<4;cfg++){
   const n=5*(cfg+1)*cpm,w=Math.ceil(Math.log2(n));
   expect(2**w-1).toBeGreaterThanOrEqual(n-1);expect(2**(w-1)-1).toBeLessThan(n-1);
  }
  expect(20e-3*50e6).toBe(1000000);
  expect(gradeAnswer(get('DEBOUNCE-0002'),{raw:'20',unit:'bit'})).toMatchObject({isCorrect:true});
 });
 it('配置变更丢弃本沿样本，完整新连续段在E14/E21才确认',()=>{
  let stable=0,lastCfg=0,run:number[]=[];const events:number[]=[];
  for(let e=1;e<=21;e++){
   const cfg=e<4||e>=16?0:1,sample=e<16?1:0;
   if(cfg!==lastCfg){lastCfg=cfg;run=[];continue;}
   if(sample===stable)run=[];else run.push(sample);
   if(run.length===5*(cfg+1)){stable=sample;run=[];events.push(e);}
  }
  expect(events).toEqual([14,21]);expect(stable).toBe(0);
 });
 it('只升级实际补完整的题号，不把新深度模型当六个原题均完成',()=>{
  const audit=JSON.parse(readFileSync('docs/source-collection-coverage.json','utf8'));
  expect(audit.entries[112].status).toBe('covered');expect(audit.entries[126].status).toBe('rewritten');
  for(let n=88;n<=93;n++)expect(audit.entries[n-1].status).toBe('needs_conditions');
  expect(audit.entries.filter((r:{status:string})=>['covered','rewritten'].includes(r.status))).toHaveLength(82);
 });
});
