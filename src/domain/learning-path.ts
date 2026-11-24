import type { Question } from './question-schema';
import type { PracticeSession } from './practice-session';
import type { ReviewProgress } from './review';

export function orderedPathQuestions(ids: string[], bank: Question[]): Question[] {
  const byId = new Map(bank.map(q => [q.id, q]));
  if (!ids.length || ids.length > 100 || new Set(ids).size !== ids.length) throw new Error('练习路径的题序无效。');
  return ids.map(id => {
    const question = byId.get(id);
    if (!question || question.reviewStatus !== 'verified') throw new Error('路径中有题目暂不可练，请稍后重试。');
    return question;
  });
}

export function pathCoverage(ids: string[], progress: Pick<ReviewProgress, 'questionId' | 'independentlyPracticed' | 'hasUnresolvedMistake'>[]) {
  const included = new Set(ids);
  const practiced = new Set(progress.filter(p => included.has(p.questionId) && p.independentlyPracticed).map(p => p.questionId));
  const mistakes = new Set(progress.filter(p => included.has(p.questionId) && p.hasUnresolvedMistake).map(p => p.questionId));
  return { practiced: practiced.size, total: included.size, mistakes: mistakes.size };
}

export function activePathSession(sessions: PracticeSession[], pathId: string, stageId: string) {
  return sessions.filter(s => s.kind === 'practice' && s.status === 'active' && s.filtersSnapshot?.learningPath === pathId && s.filtersSnapshot?.pathStage === stageId)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || a.id.localeCompare(b.id))[0];
}
