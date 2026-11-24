import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { coreLearningPaths, coreWarmups } from '../data/core-learning-paths';
import { questions } from '../data/question-bank';
import { activePathSession, orderedPathQuestions, pathCoverage } from '../domain/learning-path';
import { useLearning } from '../storage/LearningContext';

const difficultyLabels = { easy: '简单', medium: '中等', hard: '困难' };

export function CoreLearningPaths() {
  const { store, state, refresh } = useLearning();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const starting = useRef(false);
  const [error, setError] = useState('');
  async function start(pathId: string, stageId: string, ids: string[], restart = false) {
    if (starting.current) return;
    starting.current = true; setBusy(true); setError('');
    try {
      // Read persisted state at click time to avoid restarting an existing round.
      const latest = await store.read();
      const existing = !restart && activePathSession(latest.data.practiceSessions ?? [], pathId, stageId);
      const session = existing || await store.startPractice(orderedPathQuestions(ids, questions), 'practice', { learningPath: pathId, pathStage: stageId });
      await refresh(); navigate(`/practice-session/${session.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : '无法开始路径练习。'); }
    finally { starting.current = false; setBusy(false); }
  }
  return <section className="core-paths" aria-labelledby="core-paths-heading">
    <div className="section-heading"><div><p className="eyebrow">GUIDED PRACTICE</p><h2 id="core-paths-heading">核心专题练习路径</h2></div><span className="badge">5 条路径 · 45 道精选题</span></div>
    <p className="muted">从现有题库精选，每条9题，按先修关系排列。可以每次练3题，也可以一次练完整条路径；各阶段均可直接进入。</p>
    <p className="muted">FIFO、RTL和总线另有可选的2题起步练习，先熟悉规则再进入9题路径。</p>
    <p className="muted">“独立练过”统计已独立提交或自评的题目，不代表全部答对。提前查看解析不会增加此计数；阶段名称不改变原题难度。</p>
    {error && <div className="error-banner" role="alert">{error}</div>}
    {coreLearningPaths.map(path => {
      const allIds = path.stages.flatMap(stage => stage.questionIds);
      const coverage = pathCoverage(allIds, state.progress);
      const session = activePathSession(state.data.practiceSessions ?? [], path.id, 'all');
      const warmup = coreWarmups[path.id];
      const warmupSession = warmup && activePathSession(state.data.practiceSessions ?? [], path.id, warmup.id);
      const warmupCoverage = warmup && pathCoverage(warmup.questionIds, state.progress);
      return <details className="panel core-path" key={path.id}>
        <summary><span><strong>{path.name}</strong><small>独立练过 {coverage.practiced} / {coverage.total} · 待巩固 {coverage.mistakes}</small></span><span className="core-path-open">查看路径</span></summary>
        <p>{path.prerequisite}</p>
        {warmup && warmupCoverage && <section className="path-warmup" aria-label={`${path.name}起步练习`}>
          <h3>先练2道起步题（可选）</h3><p>{warmup.goal}</p>
          <p className="muted">起步题独立练过 {warmupCoverage.practiced} / {warmupCoverage.total} · 待巩固 {warmupCoverage.mistakes}；单独统计，不计入9题路径进度。</p>
          <ol className="core-path-questions">{orderedPathQuestions(warmup.questionIds, questions).map(q => <li key={q.id}><Link to={`/practice/${encodeURIComponent(q.id)}`}>{q.title}</Link><span className="badge">{difficultyLabels[q.difficulty]}</span></li>)}</ol>
          <div className="button-row"><button className="button secondary" aria-label={`${path.name}：${warmupSession ? '继续' : '开始'}起步2题`} disabled={busy} onClick={() => { void start(path.id, warmup.id, warmup.questionIds); }}>{warmupSession ? `继续起步练习 · 第 ${warmupSession.currentIndex + 1} / ${warmupSession.questionKeys.length} 题` : '先练这2题'}</button>{warmupSession && <button className="button secondary" disabled={busy} onClick={() => { void start(path.id, warmup.id, warmup.questionIds, true); }}>重新开始起步练习</button>}</div>
        </section>}
        <div className="button-row"><button className="button primary" disabled={busy} onClick={() => { void start(path.id, 'all', allIds); }}>{session ? `继续整条路径 · 第 ${session.currentIndex + 1} / ${session.questionKeys.length} 题` : '按顺序练全部9题'}</button>{session && <button className="button secondary" disabled={busy} onClick={() => { void start(path.id, 'all', allIds, true); }}>重新开始9题</button>}<Link to={`/questions?topic=${path.topicId}`}>本专题全部题目</Link></div>
        <ol className="core-path-stages">{path.stages.map((stage, index) => {
          const items = orderedPathQuestions(stage.questionIds, questions);
          const coverage = pathCoverage(stage.questionIds, state.progress);
          const session = activePathSession(state.data.practiceSessions ?? [], path.id, stage.id);
          return <li key={stage.id}><h3>{index + 1}. {stage.name}</h3><p>{stage.goal}</p>
            <p className="muted">独立练过 {coverage.practiced} / {coverage.total} · 待巩固 {coverage.mistakes} · 参考用时 {items.reduce((sum, q) => sum + (q.estimatedMinutes ?? 10), 0)} 分钟</p>
            <ol className="core-path-questions">{items.map(q => <li key={q.id}><Link to={`/practice/${encodeURIComponent(q.id)}`}>{q.title}</Link><span className="badge">{difficultyLabels[q.difficulty]}</span></li>)}</ol>
            <div className="button-row"><button className="button secondary" aria-label={`${path.name}：${session ? '继续' : '开始'}${stage.name}3题`} disabled={busy} onClick={() => { void start(path.id, stage.id, stage.questionIds); }}>{session ? `继续本阶段 · 第 ${session.currentIndex + 1} / ${session.questionKeys.length} 题` : '按顺序练这3题'}</button>{session && <button className="button secondary" disabled={busy} onClick={() => { void start(path.id, stage.id, stage.questionIds, true); }}>重新开始本阶段</button>}</div>
          </li>;
        })}</ol>
      </details>;
    })}
  </section>;
}
