import { describe, expect, it } from 'vitest';
import { questions } from '../src/data/question-bank';
import { gradeAnswer } from '../src/domain/grading';

const get = (id: string) => questions.find(q => q.id === `ORIGINAL-${id}`)!;

describe('核心题库数值与逻辑审核', () => {
  it('XOR 的 mux 接法覆盖全部二值输入', () => {
    for (const a of [0, 1]) for (const b of [0, 1]) {
      expect(a ? 1 - b : b).toBe(a ^ b);
    }
    expect(gradeAnswer(get('LOGIC-0003'), ['A'])).toMatchObject({ valid: true, isCorrect: true });
  });
  it('卡诺图表达式恰好覆盖指定最小项', () => {
    const covered = Array.from({ length: 8 }, (_, m) => m).filter(m => {
      const a = (m >> 2) & 1, b = (m >> 1) & 1, c = m & 1;
      return (!a && !c) || (a && b);
    });
    expect(covered).toEqual([0, 2, 6, 7]);
  });
  it('补码最小位宽同时覆盖正负端点', () => {
    let width = 1;
    while (-(2 ** (width - 1)) > -300 || 2 ** (width - 1) - 1 < 300) width++;
    expect(gradeAnswer(get('LOGIC-0004'), { raw: String(width) })).toMatchObject({ valid: true, isCorrect: true });
    expect(gradeAnswer(get('LOGIC-0004'), { raw: String(width - 1) })).toMatchObject({ valid: true, isCorrect: false });
  });
  it('复制拼接按位连接而非乘法', () => {
    const value = Number.parseInt('10'.repeat(3), 2);
    expect(gradeAnswer(get('SV-0006'), { raw: String(value) })).toMatchObject({ valid: true, isCorrect: true });
  });
  it('带偏斜的 setup 与 hold 用相应边沿及不同 slack 方向', () => {
    const setup = (8.4 - 0.6 - 0.3) - (0.7 + 5.8);
    const hold = (0.12 + 0.18) - (0.3 + 0.1 + 0.05);
    expect(gradeAnswer(get('STA-0002'), { raw: String(setup), unit: 'ns' })).toMatchObject({ valid: true, isCorrect: true });
    expect(gradeAnswer(get('STA-0003'), { raw: String(hold * 1000), unit: 'ps' })).toMatchObject({ valid: true, isCorrect: true });
    expect(gradeAnswer(get('STA-0003'), { raw: '0.15', unit: 'ns' })).toMatchObject({ valid: true, isCorrect: false });
  });
  it('最高频率支持 MHz 与 GHz 换算并拒绝过高频率', () => {
    const minPeriodNs = 0.6 + 4.8 + 0.4 + 0.2;
    expect(gradeAnswer(get('STA-0004'), { raw: String(1 / minPeriodNs), unit: 'GHz' })).toMatchObject({ valid: true, isCorrect: true });
    expect(gradeAnswer(get('STA-0004'), { raw: '200', unit: 'MHz' })).toMatchObject({ valid: true, isCorrect: false });
  });
});
