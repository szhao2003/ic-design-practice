import type { Question } from './question-schema';
import type { LearningEvent } from './practice';
import { rebuildProgress, uniqueEvents, type ReviewProgress } from './review';

export type LearningTotals = {
  totalQuestions: number; practicedQuestions: number; autoAttempts: number; autoCorrect: number;
  independentManualAssessments: number; assistedManualAssessments: number; manualMasteredQuestions: number;
  unresolvedQuestions: number; needsWorkQuestions: number; dueQuestions: number;
};
const empty = (): LearningTotals => ({ totalQuestions: 0, practicedQuestions: 0, autoAttempts: 0, autoCorrect: 0, independentManualAssessments: 0, assistedManualAssessments: 0, manualMasteredQuestions: 0, unresolvedQuestions: 0, needsWorkQuestions: 0, dueQuestions: 0 });
export type QuestionLearning = { question: Question; progress?: ReviewProgress; latest?: LearningEvent };

/** Counts use the installed verified bank; results always use their stored historical events. */
export function buildLearningStats(bank: Question[], input: LearningEvent[], now: number) {
  const current = [...new Map(bank.filter(q => q.reviewStatus === 'verified').map(q => [q.id, q])).values()];
  const ids = new Set(current.map(q => q.id));
  const questions = new Map(current.map(q => [q.id, q]));
  const events = uniqueEvents(input);
  const activeEvents = events.filter(e => ids.has(e.questionId));
  const progress = new Map(rebuildProgress(activeEvents).map(p => [p.questionId, p]));
  const latest = new Map(activeEvents.map(e => [e.questionId, e]));
  const byTopic = new Map<string, LearningTotals>();
  const summary = empty();
  const items: QuestionLearning[] = current.map(question => ({ question, progress: progress.get(question.id), latest: latest.get(question.id) }));
  for (const item of items) {
    const { question, progress: p, latest: last } = item;
    const totals = byTopic.get(question.topicId) ?? empty();
    byTopic.set(question.topicId, totals);
    for (const row of [totals, summary]) {
      row.totalQuestions++;
      if (p?.independentlyPracticed) row.practicedQuestions++;
      row.autoAttempts += p?.autoAttempts ?? 0; row.autoCorrect += p?.autoCorrect ?? 0;
      if (last?.kind === 'self_graded' && last.independent && last.effectiveGrade === 'good') row.manualMasteredQuestions++;
      if (p?.hasUnresolvedMistake) row.unresolvedQuestions++;
      if (p && p.consecutiveSuccesses === 0) row.needsWorkQuestions++;
      if (p && Date.parse(p.nextReviewAt) <= now) row.dueQuestions++;
    }
  }
  for (const event of activeEvents) if (event.kind === 'self_graded') {
    const question = questions.get(event.questionId)!;
    const key = event.independent ? 'independentManualAssessments' : 'assistedManualAssessments';
    summary[key]++; byTopic.get(question.topicId)![key]++;
  }
  const needsWork = items.filter(item => item.progress?.consecutiveSuccesses === 0).sort((a, b) => Number(b.progress!.hasUnresolvedMistake) - Number(a.progress!.hasUnresolvedMistake) || Date.parse(a.progress!.nextReviewAt) - Date.parse(b.progress!.nextReviewAt) || a.question.id.localeCompare(b.question.id));
  return { summary, byTopic, items, needsWork, recent: [...activeEvents].reverse(), archivedQuestionCount: new Set(events.filter(e => !ids.has(e.questionId)).map(e => e.questionId)).size };
}

export function learningEventLabel(event: LearningEvent): string {
  if (event.kind === 'submitted') return event.result.isCorrect ? '自动判分 · 正确' : '自动判分 · 错误';
  if (event.kind === 'revealed_without_submission') return '辅助学习 · 直接揭示';
  const grade = { good: '掌握', partial: '部分掌握', again: '不会' }[event.effectiveGrade];
  return `${event.independent ? '独立人工自评' : '辅助人工自评'} · ${grade}`;
}
