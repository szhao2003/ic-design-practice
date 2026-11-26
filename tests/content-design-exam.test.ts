import { describe, expect, it } from 'vitest';
import { questions } from '../src/data/question-bank';
import { gradeAnswer } from '../src/domain/grading';

const batch = questions.filter(q => q.id.startsWith('ADAPTED-DESIGNEXAM-'));
const get = (id: string) => batch.find(q => q.id === `ADAPTED-DESIGNEXAM-${id}`)!;

describe('设计岗八股补缺：独立模型验证', () => {
  it('18题均明确改编性质，保持21道手撕集中在06及原44原创', () => {
    expect(questions).toHaveLength(266);
    expect(batch).toHaveLength(18);
    expect(batch.filter(q => q.tags.includes('设计岗基础补缺'))).toHaveLength(10);
    expect(batch.filter(q => q.tags.includes('设计理解与推导'))).toHaveLength(8);
    expect(questions.filter(q => q.source.kind === 'self_authored')).toHaveLength(44);
    expect(questions.filter(q => q.type === 'rtl_coding')).toHaveLength(21);
    expect(questions.filter(q => q.type === 'rtl_coding').every(q => q.topicId === '06')).toBe(true);
    for (const q of batch) {
      expect(q.source.questionFidelity).toBe('topic_only_reconstruction');
      expect(q.source.company).toBeUndefined();
      expect(q.source.sourceClaimVerification).toBe('checked');
    }
  });

  it('双线性插值用四角权重独立算，不错把负载也当中点', () => {
    const x = (40 - 20) / (60 - 20), y = (3 - 2) / (6 - 2);
    const value = (1-x)*(1-y)*30 + (1-x)*y*50 + x*(1-y)*50 + x*y*90;
    expect(value).toBe(47.5);
    expect(gradeAnswer(get('CELL-0001'), { raw: String(value / 1000), unit: 'ns' })).toMatchObject({ isCorrect: true });
    expect(gradeAnswer(get('CELL-0001'), { raw: '55', unit: 'ps' })).toMatchObject({ isCorrect: false });
    expect(50 + 45 - 80).toBe(15);
  });

  it('DDR每秒传输bit再转byte，单位倍率与答案一致', () => {
    const bytesPerSecond = 800e6 * 2 * 16 / 8;
    expect(bytesPerSecond).toBe(3.2e9);
    expect(gradeAnswer(get('MEM-0003'), { raw: '3.2', unit: 'GB/s' })).toMatchObject({ isCorrect: true });
    expect(gradeAnswer(get('MEM-0003'), { raw: '1600', unit: 'MB/s' })).toMatchObject({ isCorrect: false });
  });

  it('隔离收益边界区分等于与严格省电', () => {
    const original = (p: number) => (1-p)*12 + p*5;
    const isolated = (p: number) => (1-p)*12 + p + .6;
    expect(isolated(.15)).toBeCloseTo(original(.15));
    expect(isolated(.14)).toBeGreaterThan(original(.14));
    expect(isolated(.16)).toBeLessThan(original(.16));
    expect(gradeAnswer(get('POWER-0002'), { raw: '15', unit: '%' })).toMatchObject({ isCorrect: true });
  });

  it('反相跨寄存器：穷举六沿复位/数据组合保持观察输出，错误复位有反例', () => {
    for (let mask = 0; mask < 4096; mask++) {
      let a = 0, b = 1;
      for (let edge = 0; edge < 6; edge++) {
        const d = (mask >> (edge * 2)) & 1, reset = (mask >> (edge * 2 + 1)) & 1;
        a = reset ? 0 : d;
        b = reset ? 1 : 1 - d;
        expect(1 - a).toBe(b);
      }
    }
    const wrongResetB = 0;
    expect(1 - 0).not.toBe(wrongResetB);
    expect(JSON.stringify(get('RETIME-0002'))).toContain('同步复位到1');
  });

  it('耦合故障激活后若先重写受害位，读出不再能区分', () => {
    const run = (fault: boolean, order: string[]) => {
      let a = 0, b = 0;
      for (const op of order) {
        if (op === 'writeA1') { if (fault && a === 0) b = 1; a = 1; }
        if (op === 'writeB0') b = 0;
      }
      return b;
    };
    expect([false, true].map(f => run(f, ['writeB0', 'writeA1']))).toEqual([0, 1]);
    expect([false, true].map(f => run(f, ['writeA1', 'writeB0']))).toEqual([0, 0]);
    expect(JSON.stringify(get('MBIST-0001'))).toContain('不能检出');
  });

  it('MUX补AND四行穷举，反接常量会成为OR反例', () => {
    for (const a of [0, 1]) for (const b of [0, 1]) {
      expect(a ? b : 0).toBe(a & b);
      expect(a ? 1 : b).toBe(a | b);
    }
    expect(gradeAnswer(get('ECO-0002'), ['B', 'D'])).toMatchObject({ isCorrect: true });
  });

  it('重命名保持消费者绑定到前一版本，后写获得新版本', () => {
    const map = new Map([['R1', 'P1']]);
    map.set('R1', 'P10'); // I1 destination
    const i2Source = map.get('R1');
    map.set('R1', 'P11'); // I3 destination
    expect(i2Source).toBe('P10');
    expect(map.get('R1')).toBe('P11');
    expect(gradeAnswer(get('ARCH-0001'), ['A', 'C'])).toMatchObject({ isCorrect: true });
  });
});
