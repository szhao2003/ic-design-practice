import { gradeAnswer, isManual, type Answer } from './grading';
import { createRound, saveDraft, submitAutomatic, type LearningEvent, type PracticeRound } from './practice';
import { assertTimestamp, snapshotQuestion, type QuestionSnapshot } from './snapshots';
import type { Question } from './question-schema';

export type MockSession = {
  id: string;
  questionKeys: string[];
  answers: Record<string, Answer>;
  startedAt: string;
  updatedAt: string;
  deadlineAt?: string;
  status: 'active' | 'submitted' | 'expired';
  currentIndex?: number;
  completedAt?: string;
  unansweredKeys?: string[];
  invalidAnswers?: { key: string; error: string }[];
  pendingManualRounds?: PracticeRound[];
  autoTotal?: number;
  autoCorrect?: number;
};

export function createMock(id: string, questions: Question[], at: string, deadlineAt?: string): { session: MockSession; snapshots: QuestionSnapshot[] } {
  assertTimestamp(at);
  if (!id.trim() || !questions.length || new Set(questions.map((q) => q.id)).size !== questions.length) throw new Error('模拟卷必须有 ID 和不重复的题目。');
  if (deadlineAt) { assertTimestamp(deadlineAt); if (Date.parse(deadlineAt) <= Date.parse(at)) throw new Error('截止时间必须晚于开始时间。'); }
  const snapshots = questions.map(snapshotQuestion);
  return { session: { id, questionKeys: snapshots.map((item) => item.key), answers: {}, startedAt: at, updatedAt: at, deadlineAt, status: 'active', currentIndex: 0 }, snapshots };
}

export const mockReviewDraftId = (roundId: string) => `mock:${roundId}`;
export function mockRedirect(sessions: MockSession[], pathname: string): string | undefined {
  const active = sessions.find(s => s.status === 'active');
  const target = active && `/mock/${active.id}`;
  return target && pathname !== target ? target : undefined;
}
export function isBlankMockAnswer(answer: Answer | undefined): boolean {
  return answer === undefined || (typeof answer === 'string' && !answer.trim()) || (Array.isArray(answer) && !answer.length)
    || (typeof answer === 'object' && answer !== null && 'raw' in answer && !answer.raw.trim());
}

export function buildMockPaper(pool: Question[], count: number, random = Math.random): Question[] {
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error('题量须为 1–100 的整数。');
  const eligible = [...new Map(pool.filter(q => q.reviewStatus === 'verified').map(q => [q.id, q])).values()];
  for (let i = eligible.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
  }
  return eligible.slice(0, count);
}

export function saveMockAnswer(session: MockSession, key: string, answer: Answer, at: string): MockSession {
  assertTimestamp(at);
  if (session.status !== 'active' || (session.deadlineAt && Date.parse(at) >= Date.parse(session.deadlineAt))) throw new Error('模拟卷已经结束，不能继续修改答案。');
  if (Date.parse(at) < Date.parse(session.updatedAt) || !session.questionKeys.includes(key)) throw new Error('答案时间或题目不属于当前模拟卷。');
  return { ...session, updatedAt: at, answers: { ...session.answers, [key]: structuredClone(answer) } };
}

export function canRevealMockAnswers(session: MockSession): boolean { return session.status !== 'active'; }

export function finishMock(session: MockSession, snapshots: QuestionSnapshot[], now: string, submit = false): { session: MockSession; events: LearningEvent[] } {
  assertTimestamp(now);
  if (session.status !== 'active') return { session, events: [] };
  if (Date.parse(now) < Date.parse(session.updatedAt)) throw new Error('交卷时间不能早于已保存的作答。');
  const expired = Boolean(session.deadlineAt && Date.parse(now) >= Date.parse(session.deadlineAt));
  if (!submit && !expired) return { session, events: [] };
  const completedAt = expired ? session.deadlineAt! : now;
  const events: LearningEvent[] = [];
  const unansweredKeys: string[] = [];
  const invalidAnswers: { key: string; error: string }[] = [];
  const pendingManualRounds: PracticeRound[] = [];
  let autoTotal = 0;
  let autoCorrect = 0;
  for (const key of session.questionKeys) {
    const snapshot = snapshots.find((item) => item.key === key);
    if (!snapshot) throw new Error(`模拟卷缺少历史题面快照：${key}`);
    const question = snapshot.question;
    const answer = session.answers[key];
    const blank = isBlankMockAnswer(answer);
    if (!isManual(question)) autoTotal++;
    if (blank) { unansweredKeys.push(key); continue; }
    let round = saveDraft(createRound(`${session.id}/${encodeURIComponent(question.id)}`, question, session.startedAt), answer);
    if (isManual(question)) {
      if (typeof answer !== 'string') { invalidAnswers.push({ key, error: '人工题作答必须为文字或代码。' }); continue; }
      // 交卷后进入待自评，不提前产生掌握记录或暴露参考解答。
      pendingManualRounds.push(round);
    } else {
      const grade = gradeAnswer(question, answer);
      if (!grade.valid) { invalidAnswers.push({ key, error: grade.error }); continue; }
      round = submitAutomatic(round, completedAt);
      events.push(...round.events);
      if (grade.isCorrect) autoCorrect++;
    }
  }
  return { session: { ...session, status: expired ? 'expired' : 'submitted', completedAt, updatedAt: completedAt, unansweredKeys, invalidAnswers, pendingManualRounds, autoTotal, autoCorrect }, events };
}
