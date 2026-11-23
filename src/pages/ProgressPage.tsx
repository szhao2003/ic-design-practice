import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { questions } from '../data/question-bank';
import { topics } from '../data/topics';
import { buildLearningStats, learningEventLabel } from '../domain/learning-stats';
import { useLearning } from '../storage/LearningContext';
import '../progress.css';

const percent = (correct: number, total: number) => total ? `${Math.round(correct / total * 100)}%` : '—';
const questionsById = new Map(questions.map(q => [q.id, q]));

export function ProgressPage() {
  const { state } = useLearning();
  const [now, setNow] = useState(Date.now()); const [topic, setTopic] = useState(''); const [showAll, setShowAll] = useState(false);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(timer); }, []);
  const report = useMemo(() => buildLearningStats(questions, state.data.events, now), [state.data.events, now]);
  const stats = report.summary;
  const completedMocks = state.data.sessions.filter(s => s.status !== 'active').sort((a, b) => Date.parse(b.completedAt!) - Date.parse(a.completedAt!));
  const weak = report.needsWork.filter(item => !topic || item.question.topicId === topic);
  const recent = report.recent.filter(event => !topic || questionsById.get(event.questionId)?.topicId === topic);
  const weakTopics = new Map<string, { topicId: string; subtopicId: string; count: number }>();
  for (const item of weak) {
    const { topicId, subtopicId } = item.question; const key = `${topicId}/${subtopicId}`;
    const group = weakTopics.get(key) ?? { topicId, subtopicId, count: 0 }; group.count++; weakTopics.set(key, group);
  }
  return <><header className="page-heading"><p className="eyebrow">LEARNING PROGRESS</p><h1>学习进度</h1><p>从真实作答记录看覆盖面和待巩固知识点。统计为累计数据，独立练习过不等于已经掌握，未练也不代表不会。</p></header>
    <section className="metrics" aria-label="累计学习统计"><div><p>独立练习覆盖</p><strong>{stats.practicedQuestions}<small> / {stats.totalQuestions} 道</small></strong><p>{percent(stats.practicedQuestions, stats.totalQuestions)}</p></div><div><p>自动题正确率</p><strong>{percent(stats.autoCorrect, stats.autoAttempts)}</strong><p>{stats.autoCorrect} / {stats.autoAttempts} 次有效提交</p></div><div><p>独立人工自评</p><strong>{stats.independentManualAssessments}<small> 次</small></strong><p>最近独立掌握 {stats.manualMasteredQuestions} 题</p></div><div><p>到期复习</p><strong>{stats.dueQuestions}<small> 道</small></strong><p>未解决错题 {stats.unresolvedQuestions} 道</p></div></section>
    <p className="notice">自动正确率按有效提交次数计算；未答考试题、草稿和直接揭示不计入。人工自评单独统计，辅助自评 {stats.assistedManualAssessments} 次不算独立掌握。模拟考试得分请查看各卷结果。</p>
    {!report.recent.length && <section className="panel progress-empty"><h2>先完成一道题，进度就会出现在这里</h2><p>选择题、判断题和数值题提交后计入统计；简答、RTL 和波形题在独立作答并自评后计入。</p><Link className="button primary" to="/practice">开始练习</Link></section>}
    <div className="section-heading"><div><p className="eyebrow">TOPIC COVERAGE</p><h2>按专题看进度</h2></div><Link to="/topics">查看知识专题</Link></div>
    <div className="progress-topic-grid">{topics.filter(t => report.byTopic.has(t.id)).map(t => {
      const row = report.byTopic.get(t.id)!;
      return <section className="panel progress-topic" key={t.id}><div className="progress-topic-heading"><h3><Link to={`/questions?topic=${t.id}`}>{t.id} · {t.name}</Link></h3><span className="badge">覆盖 {percent(row.practicedQuestions, row.totalQuestions)}</span></div><label htmlFor={`coverage-${t.id}`}>独立练习过 {row.practicedQuestions} / {row.totalQuestions} 道</label><progress id={`coverage-${t.id}`} value={row.practicedQuestions} max={row.totalQuestions} /><dl><div><dt>自动题正确率</dt><dd>{percent(row.autoCorrect, row.autoAttempts)}<small>{row.autoCorrect} / {row.autoAttempts} 次提交</small></dd></div><div><dt>独立人工自评</dt><dd>{row.independentManualAssessments} 次<small>最近掌握 {row.manualMasteredQuestions} 题</small></dd></div><div><dt>待巩固 / 到期</dt><dd>{row.needsWorkQuestions} / {row.dueQuestions} 道<small>未解决错题 {row.unresolvedQuestions} 道</small></dd></div></dl><Link className="progress-topic-link" to={`/questions?topic=${t.id}`}>进入专题练习 →</Link></section>;
    })}</div>
    <details className="panel"><summary>尚待扩充的专题（{topics.filter(t => !report.byTopic.has(t.id)).length}）</summary><p>这些专题目前没有可练题，不显示覆盖率或正确率。</p><div className="tags">{topics.filter(t => !report.byTopic.has(t.id)).map(t => <Link className="badge" key={t.id} to={`/questions?topic=${t.id}`}>{t.id} · {t.name}</Link>)}</div></details>
    <section className="panel"><div className="progress-detail-heading"><h2>待巩固与最近活动</h2><div><label htmlFor="progress-topic">按专题查看下方记录</label><select id="progress-topic" value={topic} onChange={e => { setTopic(e.target.value); setShowAll(false); }}><option value="">全部专题</option>{topics.filter(t => report.byTopic.has(t.id)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div></div><p className="muted">上方累计统计不受此筛选影响。待巩固包括最近答错、部分掌握、不会或辅助学习的题目。</p></section>
    <div className="progress-detail-grid"><section className="panel"><div className="progress-detail-heading"><h2>需要再练（{weak.length} 道）</h2><Link to="/review?tab=due">到期复习</Link></div>{!weak.length ? <p>此范围暂无待巩固记录。尚未练习的题目不列为错题。</p> : <><div className="tags">{[...weakTopics.values()].sort((a, b) => b.count - a.count || a.topicId.localeCompare(b.topicId) || a.subtopicId.localeCompare(b.subtopicId)).map(group => <Link className="badge" key={`${group.topicId}/${group.subtopicId}`} to={`/questions?topic=${group.topicId}&subtopic=${encodeURIComponent(group.subtopicId)}`}>{topics.find(t => t.id === group.topicId)?.subtopics.find(s => s.id === group.subtopicId)?.name ?? group.subtopicId} · {group.count} 道</Link>)}</div><ul className="progress-records">{weak.slice(0, 10).map(item => {
      const note = state.data.records.find(r => r.namespace === 'notes' && r.id === item.question.id && !r.deleted && typeof r.value === 'string')?.value;
      return <li key={item.question.id}><Link to={`/practice/${encodeURIComponent(item.question.id)}`}><strong>{item.question.title}</strong></Link><p>{item.progress!.hasUnresolvedMistake ? '未解决错题' : '最近未独立掌握'} · {Date.parse(item.progress!.nextReviewAt) <= now ? '已到期' : `下次复习：${new Date(item.progress!.nextReviewAt).toLocaleDateString()}`}</p>{typeof note === 'string' && note.trim() && <p className="progress-note">我的笔记：{note.slice(0, 120)}{note.length > 120 ? '…' : ''}</p>}</li>;
    })}</ul>{weak.length > 10 && <p>这里只展示前 10 道，可到错题与复习页继续查看。</p>}<Link className="button secondary" to="/review">查看错题与复习</Link></>}</section>
    <section className="panel"><h2>最近作答与学习活动</h2>{!recent.length ? <p>此范围还没有作答或揭示记录。</p> : <><ul className="progress-records">{recent.slice(0, showAll ? 50 : 10).map(event => <li key={event.id}><div className="progress-record-meta"><span>{learningEventLabel(event)}</span><time dateTime={event.at}>{new Date(event.at).toLocaleString()}</time></div><Link to={`/practice/${encodeURIComponent(event.questionId)}`}><strong>{questions.find(q => q.id === event.questionId)?.title}</strong></Link><p>{event.snapshotKey} · <Link to={`/practice/${encodeURIComponent(event.questionId)}`}>查看题目与历史</Link></p></li>)}</ul>{recent.length > 10 && <button className="button secondary" onClick={() => setShowAll(!showAll)}>{showAll ? '收起记录' : '展开最近 50 条'}</button>}</>}</section></div>
    <section className="panel"><div className="progress-detail-heading"><h2>最近模拟考试</h2><Link to="/mock">全部考试记录</Link></div>{!completedMocks.length ? <p>还没有已交卷的考试；活动卷和未答题不会被当作普通练习提交。</p> : <ul className="progress-records">{completedMocks.slice(0, 3).map(exam => <li key={exam.id}><Link to={`/mock/${encodeURIComponent(exam.id)}`}><strong>{new Date(exam.completedAt!).toLocaleString()} · {exam.status === 'expired' ? '到期交卷' : '主动交卷'}</strong></Link><p>{exam.questionKeys.length} 题 · {exam.autoTotal ? `自动题 ${exam.autoCorrect} / ${exam.autoTotal} 分` : '本卷无自动题'} · 未答 {exam.unansweredKeys?.length ?? 0} 题</p></li>)}</ul>}</section>
    <p className="source-note">按当前已审核题目及专题分类统计，历史结果沿用当时的题面版本，不用新答案重判。{report.archivedQuestionCount > 0 && <>另有 {report.archivedQuestionCount} 道已移除或未审核题的历史保留在备份中，不计入当前题库统计。</>}所有记录只保存在当前浏览器，可在设置页导出备份。</p>
  </>;
}
