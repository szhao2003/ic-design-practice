import { z } from 'zod';

export const practiceSessionSchema = z.object({
  id: z.string().min(1), kind: z.enum(['practice', 'review']),
  questionKeys: z.array(z.string().min(1)).min(1).max(100), roundIds: z.array(z.string().min(1)).min(1).max(100),
  currentIndex: z.number().int().nonnegative(), status: z.enum(['active', 'completed']),
  startedAt: z.iso.datetime({ offset: true }), updatedAt: z.iso.datetime({ offset: true }),
  completedAt: z.iso.datetime({ offset: true }).optional(), filtersSnapshot: z.record(z.string(), z.string()).optional(),
}).strict().superRefine((session, ctx) => {
  if (session.questionKeys.length !== session.roundIds.length || new Set(session.questionKeys).size !== session.questionKeys.length || new Set(session.roundIds).size !== session.roundIds.length || session.currentIndex >= session.questionKeys.length) ctx.addIssue({ code: 'custom', message: '练习题序、轮次或当前位置无效。' });
  if (Date.parse(session.updatedAt) < Date.parse(session.startedAt) || (session.status === 'completed' ? !session.completedAt || session.completedAt !== session.updatedAt : Boolean(session.completedAt))) ctx.addIssue({ code: 'custom', message: '练习状态与时间不一致。' });
});
export type PracticeSession = z.infer<typeof practiceSessionSchema>;
export const sessionDraftId = (roundId: string) => `session:${roundId}`;
