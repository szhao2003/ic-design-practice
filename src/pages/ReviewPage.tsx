import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { questions } from '../data/question-bank';
import { useLearning } from '../storage/LearningContext';

export function ReviewPage() {
  const { store, state, refresh } = useLearning();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'wrong';
  const progress = new Map(state.progress.map((p) => [p.questionId, p]));
  const ids = new Set<string>();
  if (tab === 'bookmarks' || tab === 'notes') {
    for (const r of state.data.records) if (!r.deleted && r.namespace === (tab === 'bookmarks' ? 'bookmarks' : 'notes') && r.value) ids.add(r.id);
  } else {
    for (const p of state.progress) if (tab === 'due' ? Date.parse(p.nextReviewAt) <= Date.now() : tab === 'resolved' ? !p.hasUnresolvedMistake && state.data.events.some((e) => e.questionId === p.questionId && ((e.kind === 'submitted' && !e.result.isCorrect) || (e.kind === 'self_graded' && e.effectiveGrade === 'again'))) : p.hasUnresolvedMistake) ids.add(p.questionId);
  }
  const items = [...ids].sort((a, b) => (progress.get(a)?.nextReviewAt || '').localeCompare(progress.get(b)?.nextReviewAt || ''));
  return <><header className="page-heading"><p className="eyebrow">REVIEW</p><h1>错题与复习</h1><p>重新独立作答后再查看旧答案。掌握后保留历史，延长复习间隔。</p></header>
    <nav className="tabs" aria-label="复习分类">{[['wrong', '未解决错题'], ['due', '到期复习'], ['resolved', '已解决错题'], ['bookmarks', '收藏'], ['notes', '笔记']].map(([key, title]) => <button key={key} aria-pressed={tab === key} className={tab === key ? 'active' : ''} onClick={() => setParams({ tab: key })}>{title}</button>)}</nav>
    {error && <div className="error-banner" role="alert">{error}</div>}
    {!items.length && <section className="empty-state"><h2>这个列表暂时为空</h2><p>答错、辅助学习或收藏后，相应记录会出现在这里。未到期的错题也可随时重练。</p><Link className="button primary" to="/practice">开始练习</Link></section>}
    {items.map((id) => {
      const current = questions.find((q) => q.id === id);
      const question = current ?? state.data.snapshots.find((s) => s.question.id === id)?.question;
      const p = progress.get(id);
      return <section key={id} className="panel review-row"><div><h2>{question?.title || id}</h2>{!current && <span className="badge">题库已移除 / 未安装，保留历史</span>}<p>{p ? `下次复习：${new Date(p.nextReviewAt).toLocaleString()} · 连续独立掌握 ${p.consecutiveSuccesses} 次` : '尚无正式作答或复习安排'}</p></div>{question && <div className="review-actions"><button className="button primary" disabled={busy} onClick={() => { setBusy(true); setError(''); void store.begin(question, true).then(refresh).then(() => navigate(`/practice/${encodeURIComponent(id)}`)).catch((e: unknown) => setError(e instanceof Error ? e.message : '无法开始复习。')).finally(() => setBusy(false)); }}>重新独立练习</button><Link className="button secondary" to={`/practice/${encodeURIComponent(id)}`}>查看记录</Link></div>}</section>;
    })}</>;
}
