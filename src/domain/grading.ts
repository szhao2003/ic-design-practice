import type { Question } from './question-schema';

export type NumericInput = { raw: string; unit?: string };
export type Answer = string[] | boolean | NumericInput | string;
export type Grade =
  | { valid: false; error: string }
  | { valid: true; isCorrect: boolean; normalizedValue?: number; tolerance?: number };

export function isManual(question: Question): boolean {
  return ['short_answer', 'rtl_coding', 'waveform_analysis'].includes(question.type);
}

function numericInput(input: unknown): input is NumericInput {
  return typeof input === 'object' && input !== null && 'raw' in input && typeof input.raw === 'string'
    && (!('unit' in input) || input.unit === undefined || typeof input.unit === 'string');
}

export function gradeAnswer(question: Question, input: unknown): Grade {
  if (question.type === 'single_choice' || question.type === 'multiple_choice') {
    if (!Array.isArray(input) || !input.length || !input.every((id) => typeof id === 'string')) {
      return { valid: false, error: '请先选择答案。' };
    }
    const selected = input as string[];
    if (new Set(selected).size !== selected.length || selected.some((id) => !question.options.some((option) => option.id === id))) {
      return { valid: false, error: '答案包含重复或不存在的选项。' };
    }
    if (question.type === 'single_choice' && selected.length !== 1) return { valid: false, error: '单选题只能选择一项。' };
    return { valid: true, isCorrect: selected.length === question.correctOptionIds.length && selected.every((id) => question.correctOptionIds.includes(id)) };
  }
  if (question.type === 'true_false') {
    return typeof input === 'boolean' ? { valid: true, isCorrect: input === question.correctValue } : { valid: false, error: '请选择正确或错误。' };
  }
  if (question.type !== 'numeric') return { valid: false, error: '此题需要参考答案后自评。' };
  if (!numericInput(input) || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(input.raw.trim())) {
    return { valid: false, error: '请输入完整的十进制数值，可使用科学计数法。' };
  }
  const unit = input.unit?.trim() || question.defaultUnit;
  let factor = 1;
  if (question.acceptedUnits) {
    if (!unit || !Object.hasOwn(question.acceptedUnits, unit)) return { valid: false, error: '请选择允许的单位。' };
    factor = question.acceptedUnits[unit];
  } else if (unit) return { valid: false, error: '此题不接受该单位。' };
  const value = Number(input.raw.trim());
  const normalizedValue = value * factor;
  const nonzeroMantissa = /[1-9]/.test(input.raw.trim().split(/[eE]/)[0]);
  if (!Number.isFinite(value) || !Number.isFinite(normalizedValue) || (value === 0 && nonzeroMantissa) || (normalizedValue === 0 && value !== 0)) {
    return { valid: false, error: '数值超出可计算范围。' };
  }
  const tolerance = Math.max(question.absoluteTolerance ?? 0, (question.relativeTolerance ?? 0) * Math.abs(question.expectedValue));
  if (!Number.isFinite(tolerance)) return { valid: false, error: '题目容差配置超出可计算范围。' };
  const difference = Math.abs(normalizedValue - question.expectedValue);
  // 区间端点比较避免减法在边界处的消去误差，不按期望值任意扩大容差。
  const inInterval = normalizedValue >= question.expectedValue - tolerance && normalizedValue <= question.expectedValue + tolerance;
  return { valid: true, isCorrect: difference <= tolerance || inInterval, normalizedValue, tolerance };
}
