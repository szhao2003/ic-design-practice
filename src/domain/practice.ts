import { gradeAnswer, isManual, type Answer, type Grade } from './grading';
import type { Question } from './question-schema';
import { assertTimestamp, snapshotQuestion, type QuestionSnapshot } from './snapshots';

export type SelfGrade = 'good' | 'partial' | 'again';
type EventBase = { id: string; roundId: string; questionId: string; snapshotKey: string; at: string };
export type LearningEvent = EventBase & (
  | { kind: 'submitted'; answer: Answer; result: Extract<Grade, { valid: true }>; independent: true }
  | { kind: 'revealed_without_submission'; draft?: Answer; independent: false }
  | { kind: 'self_graded'; answer?: string; paperCompletedAt?: string; requestedGrade: SelfGrade; effectiveGrade: SelfGrade; independent: boolean }
);
export type PracticeRound = {
  id: string;
  snapshot: QuestionSnapshot;
  startedAt: string;
  status: 'answering' | 'awaiting_self_grade' | 'complete';
  draft?: Answer;
  independentAnswer?: string;
  paperCompletedAt?: string;
  revealedAt?: string;
  independent: boolean;
  events: LearningEvent[];
};

export function createRound(id: string, question: Question, at: string): PracticeRound {
  if (!id.trim()) throw new Error('练习轮次必须有稳定 ID。');
  assertTimestamp(at);
  return { id, snapshot: snapshotQuestion(question), startedAt: at, status: 'answering', independent: false, events: [] };
}

function assertTime(round: PracticeRound, at: string) {
  assertTimestamp(at);
  const previous = round.events.at(-1)?.at ?? round.revealedAt ?? round.startedAt;
  if (Date.parse(at) < Date.parse(previous)) throw new Error('操作时间不能早于本轮已保存的操作。');
}

export function saveDraft(round: PracticeRound, answer: Answer): PracticeRound {
  if (round.status !== 'answering') throw new Error('本轮答案已锁定，重做需要新轮次。');
  return { ...round, draft: structuredClone(answer) };
}

function eventBase(round: PracticeRound, at: string, suffix: string): EventBase {
  return { id: `${round.id}:${suffix}`, roundId: round.id, questionId: round.snapshot.question.id, snapshotKey: round.snapshot.key, at };
}

export function submitAutomatic(round: PracticeRound, at: string): PracticeRound {
  if (round.status === 'complete') return round;
  if (round.status !== 'answering' || isManual(round.snapshot.question)) throw new Error('当前题目不能自动提交。');
  assertTime(round, at);
  const result = gradeAnswer(round.snapshot.question, round.draft);
  if (!result.valid) throw new Error(result.error);
  const event: LearningEvent = { ...eventBase(round, at, 'submitted'), kind: 'submitted', answer: structuredClone(round.draft!), result, independent: true };
  return { ...round, status: 'complete', independent: true, events: [...round.events, event] };
}

export function revealAnswer(round: PracticeRound, at: string, independentlyCompleted = false, paperCompleted = false): PracticeRound {
  if (round.revealedAt || round.status === 'complete') return round;
  assertTime(round, at);
  const manual = isManual(round.snapshot.question);
  const answer = typeof round.draft === 'string' && round.draft.trim() ? round.draft : undefined;
  if (independentlyCompleted && (!manual || (!answer && !paperCompleted))) throw new Error('请先保存独立文字/代码作答，或声明纸笔完成。');
  const independent = manual && independentlyCompleted && Boolean(answer || paperCompleted);
  const events = independent ? round.events : [...round.events, {
    ...eventBase(round, at, 'revealed'), kind: 'revealed_without_submission' as const,
    draft: structuredClone(round.draft), independent: false as const,
  }];
  return {
    ...round, status: manual ? 'awaiting_self_grade' : 'complete', revealedAt: at, independent, events,
    independentAnswer: independent ? answer : undefined,
    paperCompletedAt: independent && paperCompleted ? at : undefined,
  };
}

export function selfGrade(round: PracticeRound, grade: SelfGrade, at: string): PracticeRound {
  if (round.status === 'complete') return round;
  if (round.status !== 'awaiting_self_grade' || !isManual(round.snapshot.question)) throw new Error('请先揭示参考答案。');
  if (!['good', 'partial', 'again'].includes(grade)) throw new Error('未知的自评分。');
  assertTime(round, at);
  const effectiveGrade = !round.independent && grade === 'good' ? 'partial' : grade;
  const event: LearningEvent = {
    ...eventBase(round, at, 'self-graded'), kind: 'self_graded', answer: round.independentAnswer,
    paperCompletedAt: round.paperCompletedAt, requestedGrade: grade, effectiveGrade, independent: round.independent,
  };
  return { ...round, status: 'complete', events: [...round.events, event] };
}
