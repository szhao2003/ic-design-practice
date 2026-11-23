import type { Question } from '../src/domain/question-schema';

const base = {
  id: 'TEST-STA-001', contentVersion: 1, topicId: '03', subtopicId: 'setup-hold', tags: ['test'],
  difficulty: 'easy' as const, title: '测试夹具', promptMd: '测试使用的明确条件。', explanationMd: '测试解析。',
  commonMistakes: ['仅供测试，不进入正式题库。'], reviewStatus: 'needs_review' as const,
  source: { kind: 'self_authored' as const, evidenceGrade: 'none' as const, questionFidelity: 'self_authored' as const, sourceClaimVerification: 'not_applicable' as const },
};
export const single: Extract<Question, { type: 'single_choice' }> = { ...base, type: 'single_choice', options: [{ id: 'A', textMd: '一' }, { id: 'B', textMd: '二' }, { id: 'C', textMd: '三' }], correctOptionIds: ['B'], optionExplanations: { A: '错', B: '对', C: '错' } };
export const multiple: Extract<Question, { type: 'multiple_choice' }> = { ...single, type: 'multiple_choice', correctOptionIds: ['A', 'C'] };
export const numeric: Extract<Question, { type: 'numeric' }> = { ...base, type: 'numeric', expectedValue: 10, unit: 'ns', defaultUnit: 'ns', acceptedUnits: { ns: 1, ps: 0.001, us: 1000 }, absoluteTolerance: 0.1 };
export const manual: Extract<Question, { type: 'short_answer' }> = { ...base, type: 'short_answer', referenceAnswerMd: '参考答案', rubric: ['一个得分点'] };
export const at = '2026-11-22T18:00:00.000Z';
export const later = '2026-11-22T18:01:00.000Z';
