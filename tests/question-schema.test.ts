import { describe, expect, it } from 'vitest';
import { questionBankSchema, questionSchema } from '../src/domain/question-schema';

const sample = {
  id: 'TEST-LOGIC-001', contentVersion: 1, topicId: '01', subtopicId: 'boolean-kmap',
  tags: ['test'], difficulty: 'easy', title: '校验测试数据', promptMd: '用于结构校验的测试题面。',
  explanationMd: '用于校验解析字段。', commonMistakes: ['测试记录不进入正式题库。'], reviewStatus: 'needs_review',
  source: { kind: 'self_authored', evidenceGrade: 'none', questionFidelity: 'self_authored', sourceClaimVerification: 'not_applicable' },
  type: 'single_choice', options: [{ id: 'A', textMd: '选项一' }, { id: 'B', textMd: '选项二' }],
  correctOptionIds: ['A'], optionExplanations: { A: '测试正确项。', B: '测试错误项。' },
};

describe('题库完整性', () => {
  it('允许分阶段开发时题库为空', () => expect(questionBankSchema.safeParse([]).success).toBe(true));
  it('拒绝未知分类', () => expect(questionSchema.safeParse({ ...sample, subtopicId: 'unknown' }).success).toBe(false));
  it('拒绝缺少逐项解析', () => expect(questionSchema.safeParse({ ...sample, optionExplanations: { A: '解释' } }).success).toBe(false));
  it('拒绝重复题号', () => expect(questionBankSchema.safeParse([sample, sample]).success).toBe(false));
  it('拒绝把原创题挂到公司名下', () => expect(questionSchema.safeParse({ ...sample, source: { ...sample.source, company: '测试公司' } }).success).toBe(false));
  it('改编题必须有可追溯链接', () => expect(questionSchema.safeParse({ ...sample, source: { kind: 'firsthand_recall', evidenceGrade: 'A', questionFidelity: 'topic_only_reconstruction', sourceClaimVerification: 'not_rechecked', note: '仅支持考点，非原题。' } }).success).toBe(false));
  it('拒绝缺少容差的数值题', () => expect(questionSchema.safeParse({ ...sample, type: 'numeric', expectedValue: 1 }).success).toBe(false));
  it('接受明确为零的精确容差', () => expect(questionSchema.safeParse({ ...sample, type: 'numeric', expectedValue: 0, absoluteTolerance: 0 }).success).toBe(true));
});
