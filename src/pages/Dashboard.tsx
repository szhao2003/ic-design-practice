import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { questions } from '../data/question-bank';
import { useLearning } from '../storage/LearningContext';
import { storedRoundSchema } from '../storage/backup-schema';
import { selectPracticeQuestions } from '../domain/question-filters';

export function Dashboard() {
  const { store, state, refresh } = useLearning();
  const navigate = useNavigate(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const activeIds = new Set(questions.map((q) => q.id));
  const progress = state.progress.filter((p) => activeIds.has(p.questionId));
  const due = progress.filter((p) => Date.parse(p.nextReviewAt) <= Date.now()).length;
  const attempted = progress.filter((p) => p.independentlyPracticed).length;
  const autoAttempts = progress.reduce((sum, p) => sum + p.autoAttempts, 0);
  const autoCorrect = progress.reduce((sum, p) => sum + p.autoCorrect, 0);
  const unfinished = state.data.records.filter((r) => r.namespace === 'drafts' && !r.deleted && activeIds.has(r.id)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).find((r) => storedRoundSchema.parse(r.value).round.status !== 'complete');
  const session = state.data.practiceSessions?.filter((s) => s.status === 'active').sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];
  const continueTo = session && (!unfinished || Date.parse(session.updatedAt) >= Date.parse(unfinished.updatedAt)) ? `/practice-session/${session.id}` : unfinished ? `/practice/${encodeURIComponent(unfinished.id)}` : '/questions';
  async function quick() { setBusy(true); try { const session = await store.startPractice(selectPracticeQuestions(questions, 10, state.data)); await refresh(); navigate(`/practice-session/${session.id}`); } catch (e) { setError(e instanceof Error ? e.message : '无法开始练习。'); } finally { setBusy(false); } }
  return <><section className="hero"><p className="eyebrow">中国 IC 校招 · Digital Design / DV</p><h1>今天，从一次练习开始。</h1><p>继续未完成的题目，回顾错因，把理解留在自己的记录里。</p><div className="hero-actions"><Link className="button primary" to={continueTo}>{session || unfinished ? '继续上次练习' : '开始练习'}</Link><button className="button secondary" disabled={busy || !questions.length} onClick={() => { void quick(); }}>快速刷 10 题</button><Link className="button secondary" to="/review?tab=due">今日待复习 · {due}</Link></div></section>{error && <div className="error-banner" role="alert">{error}</div>}
    <section className="metrics" aria-label="学习概况"><div><p>可练题目</p><strong>{questions.length}<small> 道</small></strong></div><div><p>独立练习过</p><strong>{attempted}<small> 道</small></strong></div><div><p>自动题正确率</p><strong>{autoAttempts ? `${Math.round(autoCorrect / autoAttempts * 100)}%` : '—'}</strong><p>{autoCorrect} / {autoAttempts} 次有效提交</p></div><div><p>待复习</p><strong>{due}<small> 道</small></strong></div></section>
    <div className="section-heading"><div><p className="eyebrow">YOUR WORKSPACE</p><h2>练习与回顾</h2></div><Link to="/topics">浏览全部 15 个知识专题</Link></div>
    <div className="action-grid"><Link className="panel" to="/questions"><h2>按条件组一轮题</h2><p>七种题型、{questions.length} 道可练题。按知识点和来源筛选，保存题序与当前位置。</p></Link><Link className="panel" to="/review"><h2>错题与个人记录</h2><p>{progress.filter((p) => p.hasUnresolvedMistake).length} 道未解决错题；查看收藏、笔记与历史作答。</p></Link><Link className="panel" to="/progress"><h2>专题学习进度</h2><p>按专题查看覆盖率、自动题正确率、人工自评与待巩固知识点。</p></Link></div>
    <section className="panel"><h2>不知道先练哪道？</h2><p>按专题选择题目，逐步练习基础、边界条件与综合应用。</p><Link className="button secondary" to="/topics">浏览知识专题</Link></section>
    <p className="source-note">题库持续扩充。个人记录保存在当前浏览器，不会自动同步到其他设备。</p>
  </>;
}
