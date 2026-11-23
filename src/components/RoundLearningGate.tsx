import type { ReactNode } from 'react';
import type { PracticeRound } from '../domain/practice';

export function canViewRoundLearning(round?: PracticeRound): boolean {
  return Boolean(round && (round.revealedAt || round.status === 'complete'));
}

export function RoundLearningGate({ round, disabled, onReveal, children }: { round?: PracticeRound; disabled: boolean; onReveal: () => void; children: ReactNode }) {
  if (canViewRoundLearning(round)) return <>{children}</>;
  return <section className="panel round-learning-gate"><h2>独立完成后再回顾</h2><p>旧答案、个人笔记和解析暂时隐藏。提交本轮作答后会自动开放；提前查看则把本轮记为辅助学习，不累计独立掌握。</p><button className="button secondary" disabled={disabled || !round} onClick={onReveal}>提前查看历史与笔记（本轮按辅助学习）</button></section>;
}
