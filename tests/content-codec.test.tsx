import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {questions} from '../src/data/question-bank';
import {gradeAnswer,isManual} from '../src/domain/grading';
import {ReferenceAnswer} from '../src/components/QuestionContent';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-CODEC-${id}`)!;
const weight=(value:number)=>value.toString(2).replaceAll('0','').length;
describe('编码分频与存储接口',()=>{
 it('新增6题共174，来源与旧题界限清楚',()=>{
  expect(questions.filter(q=>!/^ADAPTED-(BUSTIMING|VERIFYPOWER|ARCHTOOLS)-/.test(q.id))).toHaveLength(174);
  const batch=questions.filter(q=>q.id.startsWith('ADAPTED-CODEC-'));
  expect(batch).toHaveLength(6);
  for(const q of batch){expect(q.contentVersion).toBe(1);expect(q.source.questionFidelity).toBe('topic_only_reconstruction');expect(q.source.company).toBeUndefined();expect(q.tags).toContain('编码分频与存储接口');}
 });
 it('两份完整RTL与实际仿真文件逐字一致，网页保持人工评分',()=>{
  for(const [id,module]of [['GRAY-0001','gray_codec'],['DIV-0001','even_divider']]){
   const q=get(id);if(q.type!=='rtl_coding')throw Error('type');
   expect(q.referenceAnswerMd.match(/```systemverilog\s*\n([\s\S]*?)```/)?.[1].trim()).toBe(readFileSync(`rtl/reference/${module}.sv`,'utf8').trim());
   expect(isManual(q)).toBe(true);expect(q.rubric.length).toBeGreaterThanOrEqual(5);
   expect(renderToStaticMarkup(<ReferenceAnswer question={q}/>)).toContain('复制代码');
  }
 });
 it('Gray映射为双射，逆表不依赖待测的前缀解码算法',()=>{
  for(const width of [1,2,5,8]){
   const inverse=new Map<number,number>();
   for(let b=0;b<2**width;b++)inverse.set(b^(b>>1),b);
   expect(inverse.size).toBe(2**width);
   for(let g=0;g<2**width;g++){
    let decoded=0;for(let i=0;i<width;i++)decoded|=(weight(g>>i)%2)<<i;
    expect(decoded).toBe(inverse.get(g));
   }
  }
 });
 it('除6暂停波形按接受沿数计算，事件只出现在E8/E14',()=>{
  let accepted=0;const toggles:number[]=[],ticks:number[]=[];let previous=0;
  for(let e=1;e<=14;e++){
   const en=e!==3&&e!==7;if(en)accepted++;
   const wave=Math.floor(accepted/3)%2;
   if(wave!==previous)toggles.push(e);
   if(en&&accepted%6===0)ticks.push(e);
   previous=wave;
  }
  expect(toggles).toEqual([4,8,11,14]);expect(ticks).toEqual([8,14]);expect(toggles[1]-toggles[0]).toBe(4);
 });
 it('SRAM容量按字计算，双向数据线不重复计引脚',()=>{
  const words=32*1024,addr=Math.log2(words),bytes=words*16/8;
  expect(addr).toBe(15);expect(bytes).toBe(65536);
  expect(gradeAnswer(get('MEM-0001'),{raw:String(addr+16+5+2)})).toMatchObject({isCorrect:true});
  expect(gradeAnswer(get('MEM-0001'),{raw:'54'})).toMatchObject({isCorrect:false});
 });
 it('每组边界字地址可由bank/row重构，byte偏移和bank不同',()=>{
  expect((2**21)/(8192*4)).toBe(64);
  const addresses=new Set<number>();
  for(let bank=0;bank<64;bank++)for(const row of [0,1,8191]){
   const byteAddress=bank*32768+row*4;
   expect((byteAddress>>2)&8191).toBe(row);expect(byteAddress>>15).toBe(bank);expect(byteAddress&3).toBe(0);
   addresses.add(byteAddress);
  }
  expect(addresses.size).toBe(192);
  expect(gradeAnswer(get('MEM-0002'),['A','C'])).toMatchObject({isCorrect:true});
 });
 it('偶校验覆盖全部数据的单/双bit错误与固定例的全部掩码',()=>{
  let mismatches=0;
  for(let d=0;d<256;d++){
   const codeword=d|((weight(d)%2)<<8);
   if(weight(codeword)%2)mismatches++;
   for(let i=0;i<9;i++){
    if(weight(codeword^(1<<i))%2!==1)mismatches++;
    for(let j=i+1;j<9;j++)if(weight(codeword^(1<<i)^(1<<j))%2!==0)mismatches++;
   }
  }
  const example=0xb3|(1<<8);
  for(let mask=0;mask<512;mask++)if(weight(example^mask)%2!==weight(mask)%2)mismatches++;
  expect(mismatches).toBe(0);expect(0xb3^9).toBe(0xba);
  expect(gradeAnswer(get('PARITY-0001'),['A','C','E'])).toMatchObject({isCorrect:true});
 });
 it('三个完整任务更新覆盖，宽泛题组不因关键词都出现就计完成',()=>{
  const audit=JSON.parse(readFileSync('docs/source-collection-coverage.json','utf8'));
  for(const n of [22,24,128])expect(['covered','rewritten']).toContain(audit.entries[n-1].status);
  expect(audit.entries[131].status).toBe('partial');
  expect(audit.entries.filter((r:{status:string})=>['covered','rewritten'].includes(r.status))).toHaveLength(99);
 });
});
