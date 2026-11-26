import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { questions } from '../src/data/question-bank';
import { gradeAnswer } from '../src/domain/grading';
import { ReferenceAnswer, RichText, SourceDetails } from '../src/components/QuestionContent';
import { inspectTeachingContent } from '../scripts/content-quality';

const batch = questions.filter(q => q.id.startsWith('ADAPTED-DVBASE-'));
const get = (id: string) => batch.find(q => q.id === `ADAPTED-DVBASE-${id}`)!;

describe('验证基础六题：容器、采样与检查职责', () => {
  it('266题，四条公开复盘方向、两条技术基础方向，不改变原44原创与21道手撕', () => {
    expect(questions).toHaveLength(266);
    expect(batch).toHaveLength(6);
    expect(batch.filter(q => q.source.kind === 'past_paper_compilation')).toHaveLength(4);
    expect(batch.filter(q => q.source.kind === 'practice_collection')).toHaveLength(2);
    expect(questions.filter(q => q.source.kind === 'self_authored')).toHaveLength(44);
    const coding = questions.filter(q => q.type === 'rtl_coding');
    expect(coding).toHaveLength(21);
    expect(coding.every(q => q.topicId === '06')).toBe(true);
    for (const q of batch) {
      expect(q.source.company).toBeUndefined();
      expect(q.source.questionFidelity).toBe('topic_only_reconstruction');
      expect(q.source.sourceClaimVerification).toBe('checked');
    }
  });

  it('容器操作使用独立数组模型逐步核对队首、队尾及下标移动', () => {
    const q = [10, 20];
    q.unshift(5);
    const removed = q.pop();
    q.splice(1, 0, 7);
    q.splice(0, 1);
    expect([removed, q.length, ...q]).toEqual([20, 2, 7, 10]);
    expect(gradeAnswer(get('QUEUE-0001'), ['B'])).toMatchObject({ isCorrect: true });
    expect(gradeAnswer(get('QUEUE-0001'), ['D'])).toMatchObject({ isCorrect: false });
  });

  it('整数数组按值复制，扩容保留前缀并补默认值，不能推广为对象深拷贝', () => {
    let a = [3, 6];
    const saved = [...a];
    a = Array.from({ length: 4 }, (_, index) => a[index] ?? 0);
    a[0] = 9;
    expect([...a, saved[0], saved.length]).toEqual([9, 6, 0, 0, 3, 2]);
    expect(gradeAnswer(get('ARRAY-0001'), ['D'])).toMatchObject({ isCorrect: true });
    expect(get('ARRAY-0001').promptMd).toContain('不含类句柄');
  });

  it('采样事件顺序把沿前与NBA后分开，不把声明skew当成过程延迟', () => {
    let signal = 0x35;
    const sampledBefore = signal;
    signal = 0xA6; // Given NBA update, before Observed.
    const sampledObserved = signal;
    expect([sampledBefore, sampledObserved]).toEqual([53, 166]);
    expect(gradeAnswer(get('CLOCKING-0001'), ['A'])).toMatchObject({ isCorrect: true });
    expect(get('CLOCKING-0001').explanationMd).toContain('Inactive');
  });

  it('虚接口赋值是重新绑定；UVM task phase与阶段存活分开判断', () => {
    const bus0 = { value: 2 }, bus1 = { value: 9 };
    let vif = bus0;
    vif = bus1;
    expect(vif.value).toBe(9);
    expect(bus0.value).toBe(2);
    expect(gradeAnswer(get('VIF-0001'), ['A', 'C'])).toMatchObject({ isCorrect: true });
    expect(gradeAnswer(get('PHASE-0001'), ['B', 'D'])).toMatchObject({ isCorrect: true });
    expect(gradeAnswer(get('PHASE-0001'), ['B', 'C', 'D'])).toMatchObject({ isCorrect: false });
  });

  it('纯数据序列能假通过，但周期标签找出缺失和迟到；正确周期对照能通过', () => {
    const due = 2 + 2, value = (0x7f + 1) & 0xff;
    const trace = [{ cycle: 3, valid: false, data: 0 }, { cycle: 4, valid: false, data: 0 }, { cycle: 5, valid: true, data: 0x80 }];
    expect(trace.filter(t => t.valid).map(t => t.data)).toEqual([value]);
    const check = (t: typeof trace[number]) => t.valid === (t.cycle === due) && (!t.valid || t.data === value);
    expect(trace.filter(t => !check(t)).map(t => t.cycle)).toEqual([4, 5]);
    expect(trace.map(t => ({ ...t, valid: t.cycle === due, data: value })).every(check)).toBe(true);
    expect(get('MODEL-0001').explanationMd).toContain('沿前检查点');
  });

  it('六题题干、解析与来源均能由实际Markdown组件渲染，无残留围栏', () => {
    expect(inspectTeachingContent(batch)).toEqual({ errors: [], warnings: [] });
    for (const q of batch) {
      const html = renderToStaticMarkup(<><RichText text={q.promptMd} /><ReferenceAnswer question={q} /><SourceDetails question={q} /></>);
      expect(html).toContain('答案与解析');
      expect(html).toContain('非原题');
      expect(html).not.toContain('```');
      if (q.id.includes('QUEUE') || q.id.includes('ARRAY')) expect(html).toContain('language-systemverilog');
      if (q.id.includes('MODEL')) expect(html).toContain('<table>');
      if (q.id.includes('ARRAY')) {
        expect(html).toContain('<code>new[4](a)</code>');
        expect(html).not.toContain('href="a"');
      }
    }
  });
});
