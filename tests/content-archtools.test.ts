import {describe,it,expect} from 'vitest';
import {questions} from '../src/data/question-bank';
import {gradeAnswer} from '../src/domain/grading';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-ARCHTOOLS-${id}`)!;
const numeric=(id:string,value:number)=>expect(gradeAnswer(get(id),{raw:String(value)})).toMatchObject({isCorrect:true});
describe('体系结构与脚本调试',()=>{
 it('十题来源边界与总数',()=>{
  expect(questions.filter(q=>!/^ADAPTED-(STARTER|TIMINGSTART|OPPREC|EXAMBASE)-/.test(q.id))).toHaveLength(208);
  const batch=questions.filter(q=>q.id.startsWith('ADAPTED-ARCHTOOLS-'));expect(batch).toHaveLength(10);
  for(const q of batch){expect(q.reviewStatus).toBe('verified');expect(q.source.company).toBeUndefined();expect(q.source.questionFidelity).toBe('topic_only_reconstruction');expect(q.source.url).toMatch(/^https:/);}
 });
 it('依赖值就绪时间决定load-use一拍而ALU链不停顿',()=>{
  const instructions=[{readyDelay:2,depends:false},{readyDelay:1,depends:true},{readyDelay:1,depends:true}];
  let previousEX=0,previousReady=0;const ex:number[]=[];
  for(let i=0;i<instructions.length;i++){const x=instructions[i];const at=Math.max(i+3,previousEX+1,x.depends?previousReady:0);ex.push(at);previousEX=at;previousReady=at+x.readyDelay;}
  expect(ex).toEqual([3,5,6]);expect(ex.map(c=>c+2)).toEqual([5,7,8]);
  numeric('ARCH-0002',(100+5*2)/100);
 });
 it('容量推导位宽后重组地址，不额外占用way位',()=>{
  const sets=65536/64/4,offsetBits=Math.log2(64),indexBits=Math.log2(sets),address=0x1234abcd;
  const offset=address%64,index=Math.floor(address/64)%sets,tag=Math.floor(address/(64*sets));
  expect([sets,offsetBits,indexBits,32-offsetBits-indexBits]).toEqual([256,6,8,18]);
  expect([offset,index,tag]).toEqual([13,175,0x48d2]);expect((tag*sets+index)*64+offset).toBe(address);numeric('ARCH-0003',index);
 });
 it('从指定地址选字节，以小端组合无符号半字',()=>{const bytes=[0x78,0x56,0x34,0x12,0x9a,0xbc];numeric('ARCH-0004',bytes[1]+256*bytes[2]);});
 it('同步与地址空间、捕获输出与成功状态不能混用',()=>{
  for(const id of ['ARCH-0005','TOOLS-0003']){expect(gradeAnswer(get(id),['A','C'])).toMatchObject({isCorrect:true});expect(gradeAnswer(get(id),['A','B','C'])).toMatchObject({isCorrect:false});}
 });
 it('Bash规则为最右非零状态，默认规则为最后段',()=>{
  const status=[7,3,0];const failed=status.filter(x=>x!==0);numeric('TOOLS-0002',failed.at(-1)??0);expect(status.at(-1)).toBe(0);
 });
 it('按编号排序不同于字符串排序，逐条计数不同于路径集合',()=>{
  const names=['run2.log','run10.log','run1.log'];expect([...names].sort()).toEqual(['run1.log','run10.log','run2.log']);
  expect([...names].sort((a,b)=>Number(a.slice(3,-4))-Number(b.slice(3,-4)))).toEqual(['run1.log','run2.log','run10.log']);
  const rows=[['p0',-10],['p0',-20],['p1',-0],['p2',5],['p3',-1]] as const;
  const negative=rows.filter(([,slack])=>slack<0);expect(negative).toHaveLength(3);numeric('TOOLS-0005',new Set(negative.map(([path])=>path)).size);
 });
});
