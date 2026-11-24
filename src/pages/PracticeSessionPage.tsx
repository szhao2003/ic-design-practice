import { coreLearningPaths, coreWarmups } from '../data/core-learning-paths';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLearning } from '../storage/LearningContext';
import { storedRoundSchema } from '../storage/backup-schema';
import { sessionDraftId } from '../domain/practice-session';
import { QuestionWorkspace } from './PracticePage';
import { ReferenceAnswer, RichText } from '../components/QuestionContent';

export function PracticeSessionPage() {
  const { id } = useParams(); const { store, state, refresh } = useLearning();
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const session = state.data.practiceSessions?.find((item) => item.id === id);
  useEffect(() => { window.scrollTo(0, 0); }, [id, session?.currentIndex, session?.status]);
  if (!session) return <section className="panel"><h1>未找到这轮练习</h1><p>可能尚未导入这轮记录，或本地数据已被清空。</p><Link to="/practice">返回组题</Link></section>;
  const path = coreLearningPaths.find(p => p.id === session.filtersSnapshot?.learningPath);
  const pathLabel = path && `${path.name} · ${session.filtersSnapshot?.pathStage === 'all' ? '完整路径' : session.filtersSnapshot?.pathStage === 'warmup' && coreWarmups[path.id] ? '起步练习' : path.stages.find(s => s.id === session.filtersSnapshot?.pathStage)?.name ?? '路径练习'}`;
  const rounds = session.roundIds.map((roundId) => {
    const record = state.data.records.find((r) => r.namespace === 'drafts' && r.id === sessionDraftId(roundId) && !r.deleted);
    return record ? storedRoundSchema.parse(record.value).round : undefined;
  });
  const round = rounds[session.currentIndex];
  if (!round || rounds.some((item) => !item)) return <div className="error-banner" role="alert">练习缺少题面或草稿，请从备份恢复。</div>;
  const events = state.data.events.filter((event) => session.roundIds.includes(event.roundId));
  const automatic = events.filter((event) => event.kind === 'submitted');
  const selfGraded = events.filter((event) => event.kind === 'self_graded');
  const assisted = events.filter((event) => event.kind === 'revealed_without_submission');
  async function move(direction: -1 | 1) {
    setBusy(true); setError('');
    try { await store.movePractice(session!, direction); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : '无法更新练习进度。'); } finally { setBusy(false); }
  }
  return <>{pathLabel && <p className="path-session-label">{pathLabel} · <Link to="/topics">返回练习路径</Link></p>}{session.status === 'completed' ? <><header className="page-heading"><p className="eyebrow">PRACTICE SUMMARY</p><h1>本轮练习已完成</h1><p>共 {rounds.length} 道题。自动判分、自评与辅助学习分别统计。</p></header><section className="metrics"><div><p>自动题正确</p><strong>{automatic.filter((event) => event.kind === 'submitted' && event.result.isCorrect).length} / {automatic.length}</strong></div><div><p>独立自评掌握</p><strong>{selfGraded.filter((e) => e.kind === 'self_graded' && e.independent && e.effectiveGrade === 'good').length}</strong></div><div><p>自评记录</p><strong>{selfGraded.length}</strong></div><div><p>辅助学习</p><strong>{assisted.length}</strong></div></section><div className="button-row"><Link className="button primary" to="/practice">再组一轮</Link><Link className="button secondary" to="/review">查看错题与复习</Link></div>{rounds.map((item) => item && <details className="panel session-result" key={item.id}><summary>{item.snapshot.question.title}</summary><h3>本次原始作答</h3><pre>{typeof item.draft === 'string' ? item.draft : JSON.stringify(item.draft ?? '未填写', null, 2)}</pre><RichText text={item.snapshot.question.promptMd} /><ReferenceAnswer question={item.snapshot.question} /></details>)}</> : <>
    <section className="panel session-toolbar"><div><p className="eyebrow">{session.kind === 'review' ? 'REVIEW SESSION' : 'PRACTICE SESSION'}</p><h2>第 {session.currentIndex + 1} / {rounds.length} 题</h2><p>草稿与题序已保存在本机，离开或刷新后可继续。</p></div><div className="button-row"><button className="button secondary" disabled={busy || !session.currentIndex} onClick={() => { void move(-1); }}>上一题</button><button className="button primary" disabled={busy || round.status !== 'complete'} onClick={() => { void move(1); }}>{session.currentIndex + 1 === rounds.length ? '完成本轮练习' : '下一题'}</button><Link to="/practice">暂时离开</Link></div></section>
    {error && <div className="error-banner" role="alert">{error}</div>}
    <QuestionWorkspace key={`${session.id}/${session.currentIndex}`} question={round.snapshot.question} removed={false} sessionContext={{ sessionId: session.id, draftId: sessionDraftId(round.id) }} />
  </>}</>;
}
