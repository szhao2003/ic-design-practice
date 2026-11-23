import { describe, expect, it } from 'vitest';
import { gradeAnswer } from '../src/domain/grading';
import { single, multiple, numeric, manual } from './fixtures';

describe('自动判分', () => {
  it('单选按 ID 判分，不按位置', () => {
    expect(gradeAnswer(single, ['B'])).toMatchObject({ valid: true, isCorrect: true });
    expect(gradeAnswer(single, ['A'])).toMatchObject({ valid: true, isCorrect: false });
  });
  it.each([[], ['A', 'B'], ['unknown'], ['B', 'B'], 'B'].map((answer) => ({ answer })))('拒绝非法单选 $answer', ({ answer }) => expect(gradeAnswer(single, answer).valid).toBe(false));
  it('多选无序、少选多选均不正确', () => {
    expect(gradeAnswer(multiple, ['C', 'A'])).toMatchObject({ isCorrect: true });
    expect(gradeAnswer(multiple, ['A'])).toMatchObject({ isCorrect: false });
    expect(gradeAnswer(multiple, ['A', 'B', 'C'])).toMatchObject({ isCorrect: false });
  });
  it('判断 false 是有效答案，字符串不是布尔值', () => {
    const question = { ...single, type: 'true_false' as const, correctValue: false };
    expect(gradeAnswer(question, false)).toMatchObject({ valid: true, isCorrect: true });
    expect(gradeAnswer(question, 'false').valid).toBe(false);
  });
  it('人工题拒绝自动判分', () => expect(gradeAnswer(manual, '文字').valid).toBe(false));
});

describe('数值输入、单位与容差', () => {
  it('转换单位、保留正规化值', () => expect(gradeAnswer(numeric, { raw: '1e4', unit: 'ps' })).toMatchObject({ isCorrect: true, normalizedValue: 10 }));
  it('允许显式默认单位，未配置默认时必须选单位', () => {
    expect(gradeAnswer(numeric, { raw: '10' })).toMatchObject({ isCorrect: true });
    expect(gradeAnswer({ ...numeric, defaultUnit: undefined }, { raw: '10' }).valid).toBe(false);
  });
  it('接受负数、正号、小数与科学计数法', () => expect(gradeAnswer({ ...numeric, expectedValue: -0.5 }, { raw: '-5e-1' })).toMatchObject({ isCorrect: true }));
  it('绝对容差边界含端点，超出边界判错', () => {
    expect(gradeAnswer({ ...numeric, expectedValue: 1 }, { raw: '1.1' })).toMatchObject({ isCorrect: true });
    expect(gradeAnswer({ ...numeric, expectedValue: 1 }, { raw: '1.10001' })).toMatchObject({ isCorrect: false });
  });
  it('绝对和相对容差取最大值，零期望值不使用相对容差', () => {
    expect(gradeAnswer({ ...numeric, relativeTolerance: 0.1 }, { raw: '11' })).toMatchObject({ isCorrect: true });
    expect(gradeAnswer({ ...numeric, expectedValue: 0, absoluteTolerance: 0, relativeTolerance: 0.9 }, { raw: '0.001' })).toMatchObject({ isCorrect: false });
  });
  it('零容差不放宽为近似正确', () => expect(gradeAnswer({ ...numeric, absoluteTolerance: 0 }, { raw: '10.000000000000002' })).toMatchObject({ isCorrect: false }));
  it('大数搭配小容差不能被浮点补偿误判为正确', () => expect(gradeAnswer({ ...numeric, expectedValue: 1e16 }, { raw: '10000000000000002' })).toMatchObject({ isCorrect: false }));
  it('非零输入下溢为零不能误判为零答案', () => expect(gradeAnswer({ ...numeric, expectedValue: 0 }, { raw: '1e-9999' }).valid).toBe(false));
  it.each(['', ' ', 'NaN', 'Infinity', '1e9999', '0x10', '10ns', '1,000', '10 junk', '--1', '1e', '1_000'])('拒绝非法输入 %j', (raw) => expect(gradeAnswer(numeric, { raw }).valid).toBe(false));
  it.each(['unknown', 'toString', '__proto__'])('拒绝未知单位 %s', (unit) => expect(gradeAnswer(numeric, { raw: '10', unit }).valid).toBe(false));
  it('拒绝换算后溢出', () => expect(gradeAnswer(numeric, { raw: '1e308', unit: 'us' }).valid).toBe(false));
});
