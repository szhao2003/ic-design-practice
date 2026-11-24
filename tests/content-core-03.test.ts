import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {questions} from '../src/data/question-bank';
import {gradeAnswer} from '../src/domain/grading';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-CORE3-${id}`)!;
const correct=(id:string,raw:number)=>expect(gradeAnswer(get(id),{raw:String(raw)})).toMatchObject({isCorrect:true});
describe('RTL与协议第三批：独立模型和边界',()=>{
 it('8题全部130题，公开方向改编，RTL代码与网页完全一致',()=>{
  const batch=questions.filter(q=>q.id.startsWith('ADAPTED-CORE3-'));
  expect(batch).toHaveLength(8);expect(questions.filter(q=>!/^ADAPTED-(MINI|FOCUSED|INTEGRATION)-/.test(q.id))).toHaveLength(130);
  for(const q of batch)expect(q).toMatchObject({contentVersion:1,reviewStatus:'verified',source:{kind:'practice_collection',evidenceGrade:'C',questionFidelity:'topic_only_reconstruction',sourceClaimVerification:'checked'}});
  const q=get('RTL-0001');if(q.type!=='rtl_coding')throw Error('wrong type');
  const shown=q.referenceAnswerMd.match(/```systemverilog\s*\n([\s\S]*?)```/)?.[1].trim();
  expect(shown).toBe(readFileSync('rtl/reference/saturating_credit4.sv','utf8').trim());
 });
 it('饱和状态迁移穷举：同时请求净变化0，复位优先，下界上界不回绕',()=>{
  const clamp=(x:number)=>Math.max(0,Math.min(15,x));
  for(let s=0;s<16;s++)for(const inc of [0,1])for(const dec of [0,1]){
   const next=clamp(s+inc-dec);
   if(inc===dec)expect(next).toBe(s);
   expect(next).toBeGreaterThanOrEqual(0);expect(next).toBeLessThanOrEqual(15);
  }
  expect(clamp(16)).toBe(15);expect(clamp(-1)).toBe(0);
  const tb=readFileSync('rtl/tb/saturating_credit4_tb.sv','utf8');
  expect(tb).toContain('for(s=0;s<16');expect(tb).toContain('reset acted without a clock edge');
 });
 it('part-select用逐bit权重重建，与移位掩码交叉检查',()=>{
  const word=0xd39a,selected=[5,6,7,8].reduce((v,index,i)=>v+((word>>index)&1)*2**i,0);
  expect(selected).toBe(12);expect((word>>5)&15).toBe(selected);correct('SV-0001',selected);
 });
 it('按位填充与补码解释独立核对signed和unsigned移位',()=>{
  const signedShift='11'+'11011000'.slice(0,6),unsignedShift='00'+'11011000'.slice(0,6);
  expect(parseInt(signedShift,2)-256).toBe(-10);expect(parseInt(unsignedShift,2)).toBe(54);
  expect(gradeAnswer(get('SV-0002'),['A'])).toMatchObject({isCorrect:true});
 });
 it('bank请求按余数分组，下界与构造调度均达到3拍',()=>{
  const addresses=[0,4,8,1,5,2,6,3];const banks=Array.from({length:4},()=>[] as number[]);
  for(const a of addresses)banks[a%4].push(a);
  expect(banks.map(b=>b.length)).toEqual([3,2,2,1]);
  const schedule=Array.from({length:3},(_,cycle)=>banks.flatMap(b=>b[cycle]===undefined?[]:[b[cycle]]));
  expect(schedule.flat().sort((a,b)=>a-b)).toEqual([...addresses].sort((a,b)=>a-b));
  for(const cycle of schedule)expect(new Set(cycle.map(a=>a%4)).size).toBe(cycle.length);
  correct('MEM-0002',Math.max(...banks.map(b=>b.length)));
 });
 it('APB逐byte替换，枚举16个strobe验证未使能lane保持',()=>{
  const old=[0xef,0xcd,0xab,0x89],data=[0x78,0x56,0x34,0x12];
  for(let mask=0;mask<16;mask++){
   const out=old.map((value,i)=>(mask>>i)&1?data[i]:value);
   for(let i=0;i<4;i++)expect(out[i]).toBe((mask>>i)&1?data[i]:old[i]);
   if(mask===10)expect([...out].reverse().map(b=>b.toString(16).padStart(2,'0')).join('')).toBe('12ab56ef');
  }
  expect(gradeAnswer(get('APB-0001'),['A'])).toMatchObject({isCorrect:true});
 });
 it('UART对每个bit单独求边界，stop最严格；临界点不安全',()=>{
  const boundaries=Array.from({length:10},(_,k)=>(k+1)/(k+.5)-1);
  expect(Math.min(...boundaries)).toBeCloseTo(1/19);
  const safe=(epsilon:number)=>Array.from({length:10},(_,k)=>({k,t:(k+.5)*(1+epsilon)})).every(({k,t})=>t>k&&t<k+1);
  expect(safe(.05)).toBe(true);expect(safe(.053)).toBe(false);
  expect(9.5*(1+1/19)).toBeCloseTo(10);correct('UART-0001',100/19);
 });
 it('SPI采样只选上升沿，不把CS前占位值移入',()=>{
  const trace=[{edge:'idle',bit:0},...([1,0,1,1].flatMap(bit=>[{edge:'fall',bit},{edge:'rise',bit}]))];
  let q=0;const states:number[]=[];
  for(const event of trace)if(event.edge==='rise'){q=((q<<1)|event.bit)&15;states.push(q);}
  expect(states).toEqual([1,2,5,11]);expect(q).toBe(0xb);
  expect(get('SPI-0001').explanationMd).toContain('1011');
 });
});
