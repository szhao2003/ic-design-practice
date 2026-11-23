import type { Question } from './question-schema';
import type { BackupData } from './backup-merge';
import { rebuildProgress } from './review';

export type QuestionFilters = Partial<Record<'topic' | 'subtopic' | 'q' | 'type' | 'difficulty' | 'company' | 'year' | 'fidelity' | 'evidence' | 'progress' | 'tag' | 'sort', string>>;
export const fidelityLabels = {
  self_authored: '原创专项题', topic_only_reconstruction: '公开资料考点改编｜非原题',
  paraphrased_from_source: '公开笔经题目转述', verbatim_verified: '可核实原题摘录',
};
export function questionYears(question: Question): string[] {
  return [question.source.graduationCohort ? `cohort:${question.source.graduationCohort}` : '', question.source.examDate ? `exam:${question.source.examDate.slice(0, 4)}` : ''].filter(Boolean);
}
export function filterQuestions(bank: Question[], filters: QuestionFilters, data: BackupData): Question[] {
  const progress = new Map(rebuildProgress(data.events).map((item) => [item.questionId, item]));
  const bookmarks = new Set(data.records.filter((item) => item.namespace === 'bookmarks' && !item.deleted && item.value === true).map((item) => item.id));
  const needle = filters.q?.trim().toLocaleLowerCase();
  const matched = bank.filter((q) => {
    const p = progress.get(q.id);
    return q.reviewStatus === 'verified'
      && (!filters.topic || q.topicId === filters.topic)
      && (!filters.subtopic || q.subtopicId === filters.subtopic)
      && (!needle || `${q.title} ${q.promptMd} ${q.tags.join(' ')}`.toLocaleLowerCase().includes(needle))
      && (!filters.type || q.type === filters.type) && (!filters.difficulty || q.difficulty === filters.difficulty)
      && (!filters.company || q.source.company === filters.company) && (!filters.year || questionYears(q).includes(filters.year))
      && (!filters.fidelity || q.source.questionFidelity === filters.fidelity) && (!filters.evidence || q.source.evidenceGrade === filters.evidence)
      && (!filters.tag || q.tags.includes(filters.tag))
      && (!filters.progress || (filters.progress === 'unseen' ? !p?.independentlyPracticed : filters.progress === 'done' ? p?.independentlyPracticed : filters.progress === 'wrong' ? p?.hasUnresolvedMistake : filters.progress === 'correct' ? Boolean(p?.independentlyPracticed && p.consecutiveSuccesses) : filters.progress === 'bookmarked' ? bookmarks.has(q.id) : false));
  });
  const difficulty = { easy: 0, medium: 1, hard: 2 };
  return matched.sort((a, b) => filters.sort === 'title' ? a.title.localeCompare(b.title, 'zh-CN') : filters.sort === 'difficulty' ? difficulty[a.difficulty] - difficulty[b.difficulty] || a.id.localeCompare(b.id) : a.topicId.localeCompare(b.topicId) || a.id.localeCompare(b.id));
}

export function selectPracticeQuestions(bank: Question[], count: number, data: BackupData, now = Date.now(), random = Math.random): Question[] {
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error('练习题量应为 1–100 的整数。');
  const unique = [...new Map(bank.filter((q) => q.reviewStatus === 'verified').map((q) => [q.id, q])).values()];
  const progress = new Map(rebuildProgress(data.events).map((p) => [p.questionId, p]));
  const lastAttempt = new Map<string, number>();
  for (const event of data.events) lastAttempt.set(event.questionId, Math.max(lastAttempt.get(event.questionId) ?? 0, Date.parse(event.at)));
  for (let i = unique.length - 1; i > 0; i--) {
    const sample = random();
    if (!Number.isFinite(sample) || sample < 0 || sample >= 1) throw new Error('随机数必须在 [0, 1) 内。');
    const j = Math.floor(sample * (i + 1)); [unique[i], unique[j]] = [unique[j], unique[i]];
  }
  const rank = (q: Question) => { const p = progress.get(q.id); return p && Date.parse(p.nextReviewAt) <= now ? 0 : !p?.independentlyPracticed ? 1 : 2; };
  unique.sort((a, b) => rank(a) - rank(b) || (rank(a) === 2 ? (lastAttempt.get(a.id) ?? 0) - (lastAttempt.get(b.id) ?? 0) : 0));
  return unique.slice(0, count);
}
