import { describe, expect, it } from 'vitest';
import { questions } from '../src/data/question-bank';
import { gradeAnswer } from '../src/domain/grading';

const get = (id: string) => questions.find(q => q.id === `ORIGINAL-${id}`)!;

describe('第二批题目的计算与逐沿审核', () => {
  it('输入路径延迟只计入一次外部预算', () => {
    const slack = (6.5 - 0.4 - 0.2) - (2 + 3.1);
    expect(gradeAnswer(get('STA-0007'), { raw: String(slack * 1000), unit: 'ps' }))
      .toMatchObject({ valid: true, isCorrect: true });
    expect(gradeAnswer(get('STA-0007'), { raw: '-1.2', unit: 'ns' }))
      .toMatchObject({ valid: true, isCorrect: false });
  });
  it('四位 Gray 编码在相邻计数和环绕处都只变一位', () => {
    const gray = (b: number) => b ^ (b >> 1);
    for (let b = 0; b < 16; b++) {
      const diff = gray(b) ^ gray((b + 1) % 16);
      expect(diff > 0 && (diff & (diff - 1)) === 0).toBe(true);
    }
    expect(gradeAnswer(get('FIFO-0001'), { raw: String(gray(0b1011)) }))
      .toMatchObject({ valid: true, isCorrect: true });
  });
  it('满 FIFO 按沿前状态拒绝同沿写入', () => {
    const queue = ['old'];
    const trace = [[1, 1], [1, 0], [1, 0], [1, 1]].map(([write, read], edge) => {
      const acceptWrite = !!write && queue.length < 3;
      const acceptRead = !!read && queue.length > 0;
      const value = acceptRead ? queue.shift() : undefined;
      if (acceptWrite) queue.push(`new-${edge}`);
      return [acceptWrite, acceptRead, queue.length, value];
    });
    expect(trace).toEqual([
      [true, true, 1, 'old'], [true, false, 2, undefined],
      [true, false, 3, undefined], [false, true, 2, 'new-0'],
    ]);
    const question = get('FIFO-0003');
    expect(question.type).toBe('waveform_analysis');
    if (question.type === 'waveform_analysis') {
      expect(question.referenceAnswerMd).toContain('| E3 | 仅读 | 2 |');
      expect(question.referenceAnswerMd).toContain('E3 沿前已满');
    }
  });
  it('串并转换第八位需要使用新移位值', () => {
    let shift = 0;
    const values = [1, 0, 1, 1, 0, 0, 1, 0].map(bit => shift = ((shift << 1) | bit) & 255);
    expect(values).toEqual([1, 2, 5, 11, 22, 44, 89, 178]);
    const question = get('RTL-0005');
    if (question.type === 'waveform_analysis') {
      expect(question.referenceAnswerMd).toContain('| E7 | 0 | 10110010 | 1 |');
      expect(question.referenceAnswerMd).toContain('0x59');
    }
  });
  it('分频计算区分半周期长度与计数终值', () => {
    const terminal = 100 / (2 * 10) - 1;
    expect(gradeAnswer(get('RTL-0004'), { raw: String(terminal) }))
      .toMatchObject({ valid: true, isCorrect: true });
    expect(gradeAnswer(get('RTL-0004'), { raw: '9' }))
      .toMatchObject({ valid: true, isCorrect: false });
  });
  it('UART 吞吐包含起始位和停止位开销', () => {
    const bytes = 115200 / (1 + 8 + 1);
    expect(gradeAnswer(get('UART-0001'), { raw: String(bytes / 1000), unit: 'kB/s' }))
      .toMatchObject({ valid: true, isCorrect: true });
    expect(gradeAnswer(get('UART-0001'), { raw: String(115200 / 8), unit: 'byte/s' }))
      .toMatchObject({ valid: true, isCorrect: false });
  });
});
