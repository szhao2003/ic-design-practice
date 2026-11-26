import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { questions } from '../src/data/question-bank';
import { topics } from '../src/data/topics';
import { gradeAnswer } from '../src/domain/grading';
import { filterQuestions } from '../src/domain/question-filters';
import { OperatorPrecedenceGuide, precedenceRows } from '../src/components/OperatorPrecedenceGuide';
const batch=questions.filter(q=>q.id.startsWith('ADAPTED-OPPREC-'));
const cases=JSON.parse(readFileSync('scripts/operator-precedence-cases.json','utf8')) as {id:string;expression:string;grouped:string;alternative:string;alternativeValue:number}[];
const get=(suffix:string)=>questions.find(q=>q.id===`ADAPTED-OPPREC-${suffix}`)!;
describe('SV运算符优先级',()=>{
 it('新增8题和明确子专题，共226题，标准支持规则而非考频',()=>{
  expect(questions).toHaveLength(266);expect(batch).toHaveLength(8);expect(topics.find(t=>t.id==='02')?.subtopics.some(s=>s.id==='operator-precedence')).toBe(true);
  for(const q of batch){expect(q.type).toBe('numeric');expect(q.subtopicId).toBe('operator-precedence');expect(q.contentVersion).toBe(1);expect(q.source.company).toBeUndefined();expect(q.source.questionFidelity).toBe('topic_only_reconstruction');expect(q.source.sourceClaimVerification).toBe('checked');expect(q.tags).toContain('SV运算符优先级');}
 });
 it('8份实际网页模块和显式分组/反例都有对应的仿真夹具',()=>{
  expect(cases).toHaveLength(8);expect(new Set(cases.map(c=>c.id)).size).toBe(8);
  for(const c of cases){const q=questions.find(q=>q.id===c.id)!;expect(q.promptMd).toContain(`y = ${c.expression};`);expect(q.promptMd).toContain('module expr;');expect(q.promptMd).toContain('$display("RESULT=%0d", y)');expect(q.explanationMd).toContain(c.grouped);expect(q.explanationMd).toContain(c.alternative);if(q.type!=='numeric')throw Error('type');expect(q.expectedValue).not.toBe(c.alternativeValue);expect(gradeAnswer(q,{raw:String(c.alternativeValue)})).toMatchObject({isCorrect:false});}
 });
 it('基础算术、移位、逻辑及左结合按独立加括号模型核对',()=>{
  const values={'0001':2+(3*4),'0002':1<<(2+1),'0004':Number(Boolean(1)||Boolean(0&&0)),'0007':Math.floor(20/2)*3};
  for(const [id,value]of Object.entries(values))expect(gradeAnswer(get(id),{raw:String(value)})).toMatchObject({isCorrect:true});
 });
 it('位运算、归约和右结合的结果不靠表达式外观猜测',()=>{
  const [a,b,c]=[0b1010,0b0011,0b0010];
  const allBitsOne=[1,1,1,0].every(bit=>bit===1);
  const values={'0003':a&Number(b===c),'0005':0b1000|((0b1111&0b0011)^0b0001),'0006':Number(Number(allBitsOne)===0),'0008':1?0:(0?5:6)};
  for(const [id,value]of Object.entries(values))expect(gradeAnswer(get(id),{raw:String(value)})).toMatchObject({isCorrect:true});
 });
 it('按新子专题筛选只得到8题，保留原有学习记录筛选合同',()=>{
  const matched=filterQuestions(questions,{topic:'02',subtopic:'operator-precedence'},{schemaVersion:1,events:[],snapshots:[],records:[],sessions:[]});
  expect(matched.map(q=>q.id)).toEqual(batch.map(q=>q.id));expect(matched.every(q=>q.topicId==='02')).toBe(true);
 });
 it('速查表区分一元和二元&，从高到低并明确?:右结合',()=>{
  expect(precedenceRows.findIndex(r=>r[0]==='相等比较')).toBeLessThan(precedenceRows.findIndex(r=>r[0]==='按位与'));
  expect(precedenceRows.findIndex(r=>r[0]==='加减')).toBeLessThan(precedenceRows.findIndex(r=>r[0]==='移位'));
  const html=renderToStaticMarkup(<OperatorPrecedenceGuide/>);expect(html).toContain('右结合');expect(html).toContain('SV常用运算符优先级');expect(html).toContain('一元归约');expect(html).toContain('不保证带副作用');expect(html).toContain('signed');
 });
});
