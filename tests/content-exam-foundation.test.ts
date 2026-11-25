import { describe, expect, it } from 'vitest';
import { questions } from '../src/data/question-bank';
import { gradeAnswer } from '../src/domain/grading';
import { sourceLabel } from '../src/components/QuestionContent';

const batch=questions.filter(q=>q.id.startsWith('ADAPTED-EXAMBASE-'));
const get=(id:string)=>batch.find(q=>q.id===`ADAPTED-EXAMBASE-${id}`)!;
describe('笔试基础补缺',()=>{
  it('面经和汇编不会显示成亲历笔经',()=>{
    expect(sourceLabel(get('PULSE-0001'))).toBe('公开面经考点改编｜非原题');
    expect(sourceLabel(get('PARAM-0001'))).toBe('公开汇编考点改编｜非原题');
    expect(sourceLabel(get('FLOW-0001'))).toBe('公开笔经考点改编｜非原题');
  });
  it('8道来源重构进入已有分类，保持原创身份不变',()=>{
    expect(questions).toHaveLength(234);expect(batch).toHaveLength(8);
    expect(questions.filter(q=>q.source.kind==='self_authored')).toHaveLength(44);
    for(const q of batch){expect(q.source.questionFidelity).toBe('topic_only_reconstruction');expect(q.source.company).toBeUndefined();expect(q.reviewStatus).toBe('verified');expect(q.tags).toContain('笔试基础补缺');}
    expect(get('PULSE-0001').source.kind).toBe('interview_recall');
    expect(get('PARAM-0001').source.kind).toBe('past_paper_compilation');
  });
  it('参数宽度和译码真值表按独立数学模型核对',()=>{
    expect(Math.ceil(Math.log2(17))).toBe(5);
    expect(gradeAnswer(get('PARAM-0001'),['B','C'])).toMatchObject({isCorrect:true});
    const outputs=Array.from({length:4},(_,a)=>15^(1<<a));
    expect(outputs).toEqual([14,13,11,7]);
    expect(gradeAnswer(get('DECODE-0001'),['A','D'])).toMatchObject({isCorrect:true});
    expect(gradeAnswer(get('DECODE-0001'),['A','B','D'])).toMatchObject({isCorrect:false});
  });
  it('独立采样历史模型核对沿后状态，并检查解析中的五行表',()=>{
    const samples=[1,0,1,0,0];
    const rows=samples.map((sample,i)=>[sample,samples[i-1]??0,Number(Boolean(sample||(samples[i-1]??0)))]);
    expect(rows).toEqual([[1,0,1],[0,1,1],[1,0,1],[0,1,1],[0,0,0]]);
    const q=get('PULSE-0001');if(!('referenceAnswerMd' in q))throw Error('manual');
    rows.forEach(([d1,d2,wide],i)=>expect(q.referenceAnswerMd).toContain(`|${(i+1)*10}|${samples[i]}|${d1}|${d2}|${wide}|`));
  });
  it('按连续时间区间判断间隔，证明2T合并而3T分离',()=>{
    // Each prescribed one-cycle pulse produces an ideal 2.5T-wide interval.
    const start=0.5, end=3;
    expect([2,3,4,5,6].map(gap=>start+gap>end)).toEqual([false,true,true,true,true]);
    expect(start+3-end).toBe(0.5);
    expect(get('PULSE-0002').explanationMd).toContain('最小起点间隔为3T');
  });
});
