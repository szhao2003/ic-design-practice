import { z } from 'zod';
import { questionSchema } from '../domain/question-schema';
import { gradeAnswer } from '../domain/grading';
import { advanceGuidedPractice, createRound, revealAnswer, saveDraft, selfGrade, startGuidedPractice, submitAutomatic } from '../domain/practice';
import { canonical } from '../domain/snapshots';
import { planBackupMerge, type BackupData } from '../domain/backup-merge';
import { finishMock, mockReviewDraftId } from '../domain/mock-session';
import { practiceSessionSchema, sessionDraftId } from '../domain/practice-session';

const timestamp = z.iso.datetime({ offset: true });
const text = z.string().min(1);
const numericInput = z.object({ raw: z.string(), unit: z.string().optional() }).strict();
const answer = z.union([z.array(z.string()), z.boolean(), numericInput, z.string()]);
const grade = z.enum(['good', 'partial', 'again']);
const base = { id: text, roundId: text, questionId: text, snapshotKey: text, at: timestamp };
const snapshot = z.object({ key: text, question: questionSchema }).strict();
export const eventSchema = z.discriminatedUnion('kind', [
  z.object({ ...base, kind: z.literal('submitted'), answer, result: z.object({ valid: z.literal(true), isCorrect: z.boolean(), normalizedValue: z.number().optional(), tolerance: z.number().nonnegative().optional() }).strict(), independent: z.literal(true) }).strict(),
  z.object({ ...base, kind: z.literal('revealed_without_submission'), draft: answer.optional(), independent: z.literal(false), reason: z.literal('guidance').optional() }).strict(),
  z.object({ ...base, kind: z.literal('self_graded'), answer: z.string().optional(), paperCompletedAt: timestamp.optional(), requestedGrade: grade, effectiveGrade: grade, independent: z.boolean() }).strict(),
]);
export const roundSchema = z.object({
  id: text, snapshot, startedAt: timestamp, status: z.enum(['answering', 'awaiting_self_grade', 'complete']),
  draft: answer.optional(), independentAnswer: z.string().optional(), paperCompletedAt: timestamp.optional(),
  revealedAt: timestamp.optional(), independent: z.boolean(), events: z.array(eventSchema),
  guidance: z.object({ steps: z.array(z.object({ title: text, promptMd: text }).strict()).min(1).max(5), checks: z.array(text).min(1).max(8), currentStep: z.number().int().nonnegative() }).strict().optional(),
}).strict().superRefine((round, ctx) => {
  if (round.guidance && (!round.revealedAt || round.independent || round.status === 'answering' || round.guidance.currentStep > round.guidance.steps.length)) ctx.addIssue({ code: 'custom', message: '引导轮次的状态、独立标记或步骤无效。' });
});
export const storedRoundSchema = z.object({ revision: z.number().int().nonnegative(), round: roundSchema }).strict();
export type StoredRound = z.infer<typeof storedRoundSchema>;
export const issueSchema = z.object({ flags: z.array(z.enum(['ambiguous_prompt', 'suspected_wrong_answer', 'needs_diagram', 'source_check_needed'])).refine((items) => new Set(items).size === items.length), comment: z.string() }).strict();
const json = z.json();
const record = z.object({ id: text, namespace: z.enum(['notes', 'bookmarks', 'issues', 'drafts', 'preferences']), updatedAt: timestamp, deleted: z.boolean(), value: json }).strict();
const session = z.object({
  id: text, questionKeys: z.array(text).min(1), answers: z.record(z.string(), answer), startedAt: timestamp, updatedAt: timestamp,
  deadlineAt: timestamp.optional(), status: z.enum(['active', 'submitted', 'expired']), completedAt: timestamp.optional(),
  currentIndex: z.number().int().nonnegative().optional(),
  unansweredKeys: z.array(text).optional(), invalidAnswers: z.array(z.object({ key: text, error: text })).optional(),
  pendingManualRounds: z.array(roundSchema).optional(), autoTotal: z.number().int().nonnegative().optional(), autoCorrect: z.number().int().nonnegative().optional(),
}).strict();
const backupSchema = z.object({
  schemaVersion: z.literal(1), exportedAt: timestamp.optional(), bankVersion: text.optional(),
  events: z.array(eventSchema), snapshots: z.array(snapshot), records: z.array(record), sessions: z.array(session), practiceSessions: z.array(practiceSessionSchema).optional(),
}).strict();

export function validateBackup(input: unknown): BackupData {
  const parsed = backupSchema.safeParse(input);
  if (!parsed.success) throw new Error('备份格式、字段或版本不受支持。请使用本站导出的完整学习备份 JSON，原数据未改变。');
  const data = parsed.data;
  const plan = planBackupMerge({ schemaVersion: 1, events: [], snapshots: [], records: [], sessions: [] }, data);
  if (!plan.ok) throw new Error(`备份包含冲突或缺失的历史题面：${plan.conflicts.map((item) => item.id).join('、')}`);
  for (const event of data.events) {
    const question = data.snapshots.find((item) => item.key === event.snapshotKey)!.question;
    const suffix = event.kind === 'submitted' ? 'submitted' : event.kind === 'self_graded' ? 'self-graded' : 'revealed';
    if (event.id !== `${event.roundId}:${suffix}`) throw new Error('作答事件 ID 与轮次不一致。');
    if (event.kind === 'submitted' && canonical(gradeAnswer(question, event.answer)) !== canonical(event.result)) throw new Error('历史自动判分结果与快照不一致。');
    if (event.kind === 'self_graded') {
      if (!['short_answer', 'rtl_coding', 'waveform_analysis'].includes(question.type)) throw new Error('自动题不能保存人工评分。');
      if (event.independent && !event.answer?.trim() && !event.paperCompletedAt) throw new Error('缺少独立作答依据。');
      if (event.paperCompletedAt && Date.parse(event.paperCompletedAt) > Date.parse(event.at)) throw new Error('纸笔作答时间晚于评分。');
      const expectedGrade = !event.independent && event.requestedGrade === 'good' ? 'partial' : event.requestedGrade;
      if (event.effectiveGrade !== expectedGrade) throw new Error('辅助揭示后的掌握等级无效。');
      if (!event.independent && !data.events.some((item) => item.roundId === event.roundId && item.kind === 'revealed_without_submission' && Date.parse(item.at) <= Date.parse(event.at))) throw new Error('辅助自评缺少揭示事件。');
    }
  }
  for (const id of new Set(data.events.map((event) => event.roundId))) {
    const events = data.events.filter((event) => event.roundId === id);
    if (new Set(events.map((event) => event.questionId)).size !== 1 || new Set(events.map((event) => event.snapshotKey)).size !== 1) throw new Error('同一轮次关联了不同题面。');
    if (events.some((event) => event.kind === 'submitted') && events.length !== 1) throw new Error('自动提交不能与辅助揭示或自评混入同一轮次。');
    if (events.some((event) => event.kind === 'self_graded' && event.independent) && events.some((event) => event.kind === 'revealed_without_submission')) throw new Error('辅助揭示后不能声称本轮独立完成。');
  }
  for (const session of data.sessions) {
    if (new Set(session.questionKeys).size !== session.questionKeys.length || Object.keys(session.answers).some((key) => !session.questionKeys.includes(key))) throw new Error('模拟会话含重复题目或未知答案。');
    const examSnapshots = session.questionKeys.map(key => data.snapshots.find(s => s.key === key)!);
    if (new Set(examSnapshots.map(s => s.question.id)).size !== session.questionKeys.length || (session.currentIndex ?? 0) >= session.questionKeys.length) throw new Error('模拟会话题序或位置无效。');
    if (Date.parse(session.updatedAt) < Date.parse(session.startedAt) || (session.deadlineAt && Date.parse(session.deadlineAt) <= Date.parse(session.startedAt))) throw new Error('模拟会话时间不一致。');
    if (session.status === 'active') {
      if (session.completedAt || session.autoTotal !== undefined || session.autoCorrect !== undefined || session.pendingManualRounds || session.unansweredKeys || session.invalidAnswers) throw new Error('活动模拟会话不应包含交卷结果。');
      if (data.events.some(e => examSnapshots.some(s => e.roundId === `${session.id}/${encodeURIComponent(s.question.id)}`))) throw new Error('活动模拟会话不能提前包含交卷事件。');
    } else {
      if (!session.completedAt) throw new Error('已交卷的模拟会话缺少结束时间。');
      const active = { ...session, status: 'active' as const, updatedAt: session.startedAt, completedAt: undefined, unansweredKeys: undefined, invalidAnswers: undefined, pendingManualRounds: undefined, autoTotal: undefined, autoCorrect: undefined };
      const computed = finishMock(active, data.snapshots, session.completedAt, session.status === 'submitted');
      if (canonical(computed.session) !== canonical(session) || computed.events.some((event) => !data.events.some((stored) => canonical(stored) === canonical(event)))) throw new Error('模拟会话结果与题面、答案或作答历史不一致。');
    }
  }
  for (const item of data.records) {
    if (item.deleted) continue;
    if (item.namespace === 'bookmarks' && typeof item.value !== 'boolean') throw new Error('收藏记录格式不正确。');
    if (item.namespace === 'notes' && typeof item.value !== 'string') throw new Error('笔记格式不正确。');
    if (item.namespace === 'issues' && !issueSchema.safeParse(item.value).success) throw new Error('纠错类型或说明格式不正确。');
    if (item.namespace === 'drafts') {
      const parsedRound = storedRoundSchema.safeParse(item.value);
      if (!parsedRound.success) throw new Error('备份中有无法恢复的题目草稿。');
      const saved = parsedRound.data;
      const round = saved.round;
      const inSession = (data.practiceSessions ?? []).some((session) => session.roundIds.includes(round.id) && item.id === sessionDraftId(round.id));
      const mockRound = data.sessions.filter(s => s.status !== 'active').flatMap(s => s.pendingManualRounds ?? []).find(r => r.id === round.id && item.id === mockReviewDraftId(r.id));
      if (mockRound && (canonical(round.draft) !== canonical(mockRound.draft) || round.startedAt !== mockRound.startedAt || canonical(round.snapshot) !== canonical(mockRound.snapshot) || !round.independent || round.status !== 'complete')) throw new Error('模拟自评不能修改交卷时的答案或题面。');
      if ((!inSession && !mockRound && item.id !== round.snapshot.question.id) || !data.snapshots.some((s) => canonical(s) === canonical(round.snapshot))) throw new Error('草稿与题面快照不匹配。');
      let replay = createRound(round.id, round.snapshot.question, round.startedAt);
      if (round.draft !== undefined) replay = saveDraft(replay, round.draft);
      if (round.guidance) {
        replay = startGuidedPractice(replay, { steps: round.guidance.steps, checks: round.guidance.checks }, round.revealedAt!);
        for (let step = 0; step < round.guidance.currentStep; step++) replay = advanceGuidedPractice(replay);
      } else if (round.revealedAt) replay = revealAnswer(replay, round.revealedAt, round.independent, Boolean(round.paperCompletedAt));
      for (const event of round.events) {
        if (!data.events.some((stored) => canonical(stored) === canonical(event))) throw new Error('草稿引用缺失或不同的作答事件。');
        if (event.kind === 'submitted') replay = submitAutomatic(replay, event.at);
        if (event.kind === 'self_graded') replay = selfGrade(replay, event.requestedGrade, event.at);
      }
      if (canonical(replay) !== canonical(round)) throw new Error('草稿状态不能从历史操作安全恢复。');
    }
  }
  for (const session of data.practiceSessions ?? []) {
    const rounds = session.roundIds.map((id, index) => {
      const record = data.records.find((r) => r.namespace === 'drafts' && r.id === sessionDraftId(id) && !r.deleted);
      if (!record) throw new Error('连续练习缺少作答草稿。');
      const stored = storedRoundSchema.parse(record.value);
      if (stored.round.id !== id || stored.round.snapshot.key !== session.questionKeys[index]) throw new Error('连续练习轮次与题序不一致。');
      return stored.round;
    });
    if (new Set(rounds.map((round) => round.snapshot.question.id)).size !== rounds.length) throw new Error('连续练习不能重复同一题的不同版本。');
    if (rounds.slice(0, session.currentIndex).some((round) => round.status !== 'complete') || (session.status === 'completed' && rounds.some((round) => round.status !== 'complete'))) throw new Error('连续练习进度超前于已完成作答。');
  }
  // 当前尚无旧版正式备份；未知或未来版本明确拒绝，不做丢字段的猜测迁移。
  return plan.data;
}
