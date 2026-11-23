import { z } from 'zod';
import { topics } from '../data/topics';

const sourceSchema = z.object({
  kind: z.enum(['firsthand_recall', 'past_paper_compilation', 'practice_collection', 'mock_exam', 'interview_recall', 'promotional', 'self_authored']),
  evidenceGrade: z.enum(['A', 'B', 'C', 'D', 'none']),
  questionFidelity: z.enum(['verbatim_verified', 'paraphrased_from_source', 'topic_only_reconstruction', 'self_authored']),
  company: z.string().trim().min(1).optional(),
  role: z.string().optional(),
  graduationCohort: z.string().optional(),
  examDate: z.iso.date().optional(),
  publishedDate: z.iso.date().optional(),
  url: z.url({ protocol: /^https?$/ }).optional(),
  inspiredByUrl: z.url({ protocol: /^https?$/ }).optional(),
  sourceClaimVerification: z.enum(['checked', 'not_rechecked', 'not_applicable']),
  note: z.string().trim().min(1).optional(),
});

const text = z.string().trim().min(1);
const base = {
  id: text,
  contentVersion: z.number().int().positive(),
  topicId: text,
  subtopicId: text,
  tags: z.array(text),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  title: text,
  promptMd: text,
  explanationMd: text,
  commonMistakes: z.array(text).min(1),
  hints: z.array(text).optional(),
  estimatedMinutes: z.number().positive().optional(),
  reviewStatus: z.enum(['verified', 'needs_review']),
  source: sourceSchema,
};
const choice = {
  options: z.array(z.object({ id: text, textMd: text })).min(2),
  correctOptionIds: z.array(text).min(1),
  optionExplanations: z.record(z.string(), text),
};
const manual = { referenceAnswerMd: text, rubric: z.array(text).min(1) };

export const questionSchema = z.discriminatedUnion('type', [
  z.object({ ...base, ...choice, type: z.literal('single_choice') }),
  z.object({ ...base, ...choice, type: z.literal('multiple_choice') }),
  z.object({ ...base, type: z.literal('true_false'), correctValue: z.boolean() }),
  z.object({
    ...base, type: z.literal('numeric'), expectedValue: z.number(),
    unit: text.optional(), defaultUnit: text.optional(),
    acceptedUnits: z.record(z.string(), z.number().positive()).optional(),
    absoluteTolerance: z.number().nonnegative().optional(),
    relativeTolerance: z.number().nonnegative().optional(),
  }),
  z.object({ ...base, ...manual, type: z.literal('short_answer') }),
  z.object({ ...base, ...manual, type: z.literal('rtl_coding') }),
  z.object({ ...base, ...manual, type: z.literal('waveform_analysis') }),
]).superRefine((question, ctx) => {
  const issue = (message: string) => ctx.addIssue({ code: 'custom', message });
  const topic = topics.find((item) => item.id === question.topicId);
  if (!topic?.subtopics.some((item) => item.id === question.subtopicId)) {
    issue('未知的专题或子专题');
  }
  const source = question.source;
  if (source.questionFidelity === 'self_authored') {
    if (source.kind !== 'self_authored' || source.evidenceGrade !== 'none' || source.company || source.sourceClaimVerification !== 'not_applicable') {
      issue('原创题不得关联公司或来源证据等级');
    }
  } else if (source.kind === 'self_authored' || source.evidenceGrade === 'none' || !(source.url || source.inspiredByUrl) || !source.note || source.sourceClaimVerification === 'not_applicable') {
    issue('有来源题必须记录出处、证据等级、说明和链接核验状态');
  }
  if (source.questionFidelity === 'verbatim_verified' && source.sourceClaimVerification !== 'checked') {
    issue('原题摘录必须核验来源；使用权限仍需内容审核');
  }
  if (question.type === 'single_choice' || question.type === 'multiple_choice') {
    const ids = question.options.map((option) => option.id);
    if (new Set(ids).size !== ids.length) issue('选项 ID 重复');
    if (new Set(question.correctOptionIds).size !== question.correctOptionIds.length) issue('答案 ID 重复');
    if (!question.correctOptionIds.every((id) => ids.includes(id))) issue('答案引用不存在的选项');
    if (question.type === 'single_choice' && question.correctOptionIds.length !== 1) issue('单选必须恰有一个正确答案');
    if (question.type === 'multiple_choice' && question.correctOptionIds.length < 2) issue('多选至少有两个正确答案');
    if (!ids.every((id) => question.optionExplanations[id]?.trim())) issue('每个选项都必须有解析');
  }
  if (question.type === 'numeric') {
    if (question.absoluteTolerance === undefined && question.relativeTolerance === undefined) issue('数值题必须明确容差');
    if (question.unit && (!question.acceptedUnits || question.acceptedUnits[question.unit] !== 1)) issue('标准单位必须在单位映射中且倍率为 1');
    if (question.defaultUnit && !question.acceptedUnits?.[question.defaultUnit]) issue('默认单位必须在允许单位中');
  }
});

export type Question = z.infer<typeof questionSchema>;

export const questionBankSchema = z.array(questionSchema).superRefine((questions, ctx) => {
  const seen = new Set<string>();
  for (const question of questions) {
    if (seen.has(question.id)) ctx.addIssue({ code: 'custom', message: `题目 ID 重复：${question.id}` });
    seen.add(question.id);
  }
});
