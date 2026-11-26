import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { questions } from '../src/data/question-bank';
import { inspectTeachingContent } from '../scripts/content-quality';
import { ReferenceAnswer, RichText } from '../src/components/QuestionContent';
import { manual } from './fixtures';

describe('教学内容发布保护', () => {
  it('74 题均完成版本升级，四份关键时序图有解释采样语义的文字', () => {
    const baseline = questions.filter(q=>!/^ADAPTED-(ADVANCED|FOUNDATION|TOOLSFPGA|CORE|SYSTEM|EXTENSION|CORE3|MINI|FOCUSED|INTEGRATION|BOUNDARY|SAMPLING|CODEC|BUSTIMING|VERIFYPOWER|ARCHTOOLS|STARTER|TIMINGSTART|OPPREC|EXAMBASE|EXAMSV|DESIGNEXAM)-/.test(q.id));
    expect(baseline).toHaveLength(74);
    expect(baseline.every(q => q.contentVersion >= 2)).toBe(true);
    expect(inspectTeachingContent(questions).errors).toEqual([]);
    for (const id of ['ADAPTED-INNO26-CDC-0001','ADAPTED-RK26-AHB-0001','ORIGINAL-APB-0001','ORIGINAL-RTL-0005']) {
      const q = questions.find(q=>q.id===id)!;
      expect('referenceAnswerMd' in q && q.referenceAnswerMd).toContain('/diagrams/content-v15/');
      expect(q.explanationMd).toMatch(/采样|采到|沿前|沿后/);
    }
  });
  it('占位、残缺 RTL 与围栏会报错；短解析只提醒，不冒充技术错误', () => {
    const bad = {...manual, type:'rtl_coding' as const, referenceAnswerMd:'```systemverilog\nassign y=1;', commonMistakes:['忽略题目给出的位宽、时间点或前提。'], explanationMd:'简短'};
    const report = inspectTeachingContent([bad]);
    expect(report.errors).toHaveLength(3);
    expect(report.warnings.join('')).toContain('较短');
  });
  it('题面代码没有复制按钮，揭示后的参考代码有按钮与等宽代码标记', () => {
    const q=questions.find(q=>q.id==='ORIGINAL-RTL-0001')!;
    expect(renderToStaticMarkup(<RichText text={'```systemverilog\nassign x = 1;\n```'}/>)).not.toContain('复制代码');
    const html=renderToStaticMarkup(<ReferenceAnswer question={q}/>);
    expect(html).toContain('复制代码');
    expect(html).toContain('language-systemverilog');
    expect(html).toContain('tick');
  });
});
