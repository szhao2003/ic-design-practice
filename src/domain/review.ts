import type { LearningEvent } from './practice';
import { assertTimestamp, canonical } from './snapshots';

export type ReviewProgress = {
  questionId: string;
  autoAttempts: number;
  autoCorrect: number;
  selfAssessments: number;
  independentlyPracticed: boolean;
  consecutiveSuccesses: number;
  hasUnresolvedMistake: boolean;
  reviewIntervalDays: number;
  nextReviewAt: string;
};

export function addLocalCalendarDays(at: string, days: number): string {
  assertTimestamp(at);
  if (!Number.isInteger(days) || days < 0) throw new Error('复习天数必须为非负整数。');
  const date = new Date(at);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function uniqueEvents(events: LearningEvent[]): LearningEvent[] {
  const map = new Map<string, LearningEvent>();
  for (const event of events) {
    assertTimestamp(event.at);
    const previous = map.get(event.id);
    if (previous && canonical(previous) !== canonical(event)) throw new Error(`学习事件冲突：${event.id}`);
    map.set(event.id, event);
  }
  const priority = (event: LearningEvent) => event.kind === 'revealed_without_submission' ? 0 : 1;
  return [...map.values()].sort((a, b) => Date.parse(a.at) - Date.parse(b.at) || priority(a) - priority(b) || a.id.localeCompare(b.id));
}

export function rebuildProgress(events: LearningEvent[]): ReviewProgress[] {
  const progress = new Map<string, ReviewProgress>();
  for (const event of uniqueEvents(events)) {
    const current = progress.get(event.questionId) ?? {
      questionId: event.questionId, autoAttempts: 0, autoCorrect: 0, selfAssessments: 0,
      independentlyPracticed: false, consecutiveSuccesses: 0, hasUnresolvedMistake: false,
      reviewIntervalDays: 1, nextReviewAt: '',
    };
    const success = event.kind === 'submitted' ? event.result.isCorrect : event.kind === 'self_graded' && event.independent && event.effectiveGrade === 'good';
    if (event.kind === 'submitted') {
      current.autoAttempts++;
      if (event.result.isCorrect) current.autoCorrect++;
      current.independentlyPracticed = true;
    }
    if (event.kind === 'self_graded') {
      current.selfAssessments++;
      if (event.independent) current.independentlyPracticed = true;
    }
    current.consecutiveSuccesses = success ? current.consecutiveSuccesses + 1 : 0;
    if (success) current.hasUnresolvedMistake = false;
    else if ((event.kind === 'submitted' && !event.result.isCorrect) || (event.kind === 'self_graded' && event.effectiveGrade === 'again')) current.hasUnresolvedMistake = true;
    current.reviewIntervalDays = success ? [1, 3, 7, 14, 30][Math.min(current.consecutiveSuccesses - 1, 4)] : 1;
    current.nextReviewAt = addLocalCalendarDays(event.at, current.reviewIntervalDays);
    progress.set(event.questionId, current);
  }
  return [...progress.values()];
}
