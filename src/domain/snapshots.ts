import { questionSchema, type Question } from './question-schema';

export type QuestionSnapshot = { key: string; question: Question };

export function snapshotQuestion(question: Question): QuestionSnapshot {
  return { key: `${question.id}@${question.contentVersion}`, question: structuredClone(questionSchema.parse(question)) };
}

export function assertTimestamp(value: string): void {
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+-]\d\d:\d\d)$/.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error('时间戳必须包含有效日期、时间与时区。');
  }
}

// 对象字段顺序不同不构成数据冲突；数组顺序保持语义。
export function canonical(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.entries(value).filter(([, item]) => item !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
}
