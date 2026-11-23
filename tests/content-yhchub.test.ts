import { describe, expect, it } from 'vitest';
import { questions } from '../src/data/question-bank';
import { gradeAnswer } from '../src/domain/grading';
import { sourceLabel } from '../src/components/QuestionContent';

const get = (suffix: string) => questions.find(q => q.id === `ADAPTED-YHC-${suffix}`)!;
describe('公开练习汇编的独立考点改编', () => {
  it('十二题保留汇编出处，不制造公司或原题归因', () => {
    const batch = questions.filter(q => q.id.startsWith('ADAPTED-YHC-'));
    expect(batch).toHaveLength(12);
    for (const q of batch) {
      expect(q.source).toMatchObject({ kind: 'practice_collection', evidenceGrade: 'C', questionFidelity: 'topic_only_reconstruction', sourceClaimVerification: 'checked' });
      expect(new URL(q.source.url!).hostname).toBe('www.yhchub.com');
      expect(q.source.company).toBeUndefined(); expect(q.source.graduationCohort).toBeUndefined();
      expect(q.source.note).toMatch(/Q\d+/);
      expect(sourceLabel(q)).toBe('公开资料考点改编｜非原题');
    }
  });
  it('定点精确表示检查分母和整数范围，不以近似代替无损', () => {
    let fractional = 0;
    while (!Number.isInteger((11 / 32) * 2 ** fractional)) fractional++;
    const integer = Math.ceil(Math.log2(7 + 1));
    expect(gradeAnswer(get('LOGIC-0001'), { raw: String(integer + fractional) })).toMatchObject({ valid: true, isCorrect: true });
    expect(gradeAnswer(get('LOGIC-0001'), { raw: '7' })).toMatchObject({ valid: true, isCorrect: false });
  });
  it('符号扩展保持负值，再按新宽度解释无符号码', () => {
    const signed = Number.parseInt('101101', 2) - 2 ** 6;
    const pattern = (2 ** 10 + signed).toString(2);
    expect(pattern).toBe('1111101101');
    expect(gradeAnswer(get('LOGIC-0002'), { raw: String(Number.parseInt(pattern, 2)) })).toMatchObject({ valid: true, isCorrect: true });
  });
  it('Gray 先解码再模计数，跳步的位变化数不一定为一', () => {
    const gray = (b: number) => b ^ (b >> 1);
    const decoded = Array.from({ length: 32 }, (_, b) => b).find(b => gray(b) === 0b10110)!;
    expect(decoded).toBe(27);
    expect(gradeAnswer(get('FIFO-0001'), { raw: String(gray((decoded + 45) % 32)) })).toMatchObject({ valid: true, isCorrect: true });
    expect((gray(7) ^ gray(9)).toString(2).replaceAll('0', '').length).toBe(2);
    expect(gradeAnswer(get('FIFO-0002'), ['D', 'B', 'A'])).toMatchObject({ valid: true, isCorrect: true });
  });
  it('模五状态公式对所有十二位以内前缀与整数计算一致', () => {
    for (let length = 1; length <= 12; length++) for (let value = 0; value < 2 ** length; value++) {
      let rem = 0;
      for (const bit of value.toString(2).padStart(length, '0')) {
        const candidate = 2 * rem + Number(bit);
        rem = candidate >= 5 ? candidate - 5 : candidate;
        expect(rem >= 0 && rem <= 4).toBe(true);
      }
      expect(rem).toBe(value % 5);
    }
  });
  it('八位分组求和覆盖全部 256 种数据并容纳最大值八', () => {
    for (let value = 0; value < 256; value++) {
      const pair = Array.from({ length: 4 }, (_, i) => ((value >> (2 * i)) & 1) + ((value >> (2 * i + 1)) & 1));
      const left = pair[0] + pair[1], right = pair[2] + pair[3];
      expect(pair.every(p => p < 4) && left < 8 && right < 8).toBe(true);
      expect(left + right).toBe(value.toString(2).replaceAll('0', '').length);
    }
  });
  it('平均间隔的整数调度解唯一', () => {
    const solutions = Array.from({ length: 9 }, (_, k) => k).filter(k => 7 * k + 6 * (8 - k) === 50);
    expect(solutions).toEqual([2]);
    expect(gradeAnswer(get('RTL-0003'), { raw: String(solutions[0]) })).toMatchObject({ valid: true, isCorrect: true });
  });
  it('边沿题参考表与沿前状态递推相符', () => {
    let prev = 0;
    const trace = [0, 1, 1, 0, 1].map((bit, index) => { const row = [index, bit, prev, bit & (1 - prev)]; prev = bit; return row; });
    const q = get('RTL-0005');
    expect(q.type).toBe('waveform_analysis');
    if (q.type === 'waveform_analysis') {
      const rows = [...q.referenceAnswerMd.matchAll(/^E(\d+)\s+([01])\s+([01])\s+([01])$/gm)].map(match => match.slice(1).map(Number));
      expect(rows).toEqual(trace);
    }
  });
});
