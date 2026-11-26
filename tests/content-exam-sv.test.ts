import { describe, expect, it } from 'vitest';
import { questions } from '../src/data/question-bank';
import { gradeAnswer } from '../src/domain/grading';
import { sourceLabel } from '../src/components/QuestionContent';
import { filterQuestions } from '../src/domain/question-filters';
import { emptyBackup } from '../src/storage/learning-store';
const batch=questions.filter(q=>q.id.startsWith('ADAPTED-EXAMSV-'));
const get=(id:string)=>batch.find(q=>q.id===`ADAPTED-EXAMSV-${id}`)!;
describe('公开笔试SV和流程补充',()=>{
  it('8道汇编方向重构，来源归属不扩大且旧原创数量不变',()=>{
    expect(questions).toHaveLength(260);expect(batch).toHaveLength(8);
    expect(questions.filter(q=>q.source.kind==='self_authored')).toHaveLength(44);
    expect(filterQuestions(questions,{q:'笔试SV与流程补充'},emptyBackup())).toHaveLength(8);
    for(const q of batch){expect(q.source.kind).toBe('past_paper_compilation');expect(q.source.company).toBeUndefined();expect(q.source.questionFidelity).toBe('topic_only_reconstruction');expect(q.source.sourceClaimVerification).toBe('checked');expect(sourceLabel(q)).toContain('汇编');}
  });
  it('SDC边沿模型：频率、占空比与连续周期边沿分别推导',()=>{
    const period=12,rise=2,fall=5;
    expect(1000/period).toBeCloseTo(83.333333333);
    expect((fall-rise)/period).toBe(.25);
    expect(Array.from({length:3},(_,i)=>[i*period+rise,i*period+fall])).toEqual([[2,5],[14,17],[26,29]]);
    expect(gradeAnswer(get('SDC-0001'),['A','B'])).toMatchObject({isCorrect:true});
    expect(gradeAnswer(get('SDC-0001'),['A','B','C'])).toMatchObject({isCorrect:false});
  });
  it('分支全覆盖不代表组合穷尽，错误实现存在未测反例',()=>{
    const vectors=[[0,0],[0,1],[1,0],[1,1]];
    const tests=[vectors[0],vectors[3]];
    expect(new Set(tests.map(([a,b])=>a&&b)).size).toBe(2);
    expect(tests.length/vectors.length).toBe(.5);
    expect(tests.every(([a,b])=>a===Number(Boolean(a&&b)))).toBe(true);
    expect(vectors.filter(([a,b])=>a!==Number(Boolean(a&&b)))).toEqual([[1,0]]);
    expect(gradeAnswer(get('COV-0001'),['A','C'])).toMatchObject({isCorrect:true});
  });
  it('fork延迟是相对进入时间而非串行相加；共享循环索引退出时为3',()=>{
    const finish=[4,9];expect(Math.min(...finish)).toBe(4);expect(Math.max(...finish)).toBe(9);
    expect(gradeAnswer(get('FORK-0001'),['C'])).toMatchObject({isCorrect:true});
    const pending:(()=>number)[]=[];let i=0;
    for(;i<3;i++)pending.push(()=>i);
    expect(pending.map(run=>run())).toEqual([3,3,3]);
    expect(gradeAnswer(get('FORK-0002'),['D'])).toMatchObject({isCorrect:true});
  });
  it('类句柄题区分别名与动态类型；脚本题不冒充原csh代码',()=>{
    expect(gradeAnswer(get('CLASS-0001'),['A','C'])).toMatchObject({isCorrect:true});
    expect(gradeAnswer(get('CLASS-0002'),['B','D'])).toMatchObject({isCorrect:true});
    expect(get('CLASS-0002').promptMd).toContain('ok = $cast(child_h, parent_h);');
    expect(get('SHELL-0001').source.note).toContain('csh');
    expect(get('SHELL-0001').promptMd).toContain('以Bash执行');
    expect(gradeAnswer(get('SHELL-0001'),['A','D'])).toMatchObject({isCorrect:true});
    expect(gradeAnswer(get('DFT-0001'),['B','D'])).toMatchObject({isCorrect:true});
  });
});
