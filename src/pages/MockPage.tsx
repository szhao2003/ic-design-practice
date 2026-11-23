import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { questions } from '../data/question-bank';
import { topics } from '../data/topics';
import { buildMockPaper, isBlankMockAnswer, mockReviewDraftId, type MockSession } from '../domain/mock-session';
import { gradeAnswer, isManual } from '../domain/grading';
import type { SelfGrade } from '../domain/practice';
import { canonical } from '../domain/snapshots';
import { ExamAnswerInput } from '../components/ExamAnswerInput';
import { ReferenceAnswer, RichText, SourceDetails, typeLabels } from '../components/QuestionContent';
import { useLearning } from '../storage/LearningContext';
import { storedRoundSchema } from '../storage/backup-schema';
import '../mock.css';

const labels = { good: '掌握', partial: '部分掌握', again: '不会' };
const errorText = (e: unknown) => e instanceof Error ? e.message : '保存失败，请重试。';
function duration(ms: number) { const seconds = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }

export function MockPage() {
  const { id } = useParams();
  const { state } = useLearning();
  const session = state.data.sessions.find(s => s.id === id);
  if (!id) return <MockBuilder />;
  if (!session) return <section className="panel"><h1>未找到模拟考试</h1><p>本机可能没有这份考试记录，请检查是否已导入备份。</p><Link to="/mock">返回模拟练习</Link></section>;
  return session.status === 'active' ? <ExamWorkspace key={id} session={session} /> : <ExamReview key={id} session={session} />;
}

function MockBuilder() {
  const { state, store, refresh } = useLearning(); const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]); const [count, setCount] = useState('10');
  const [timed, setTimed] = useState(true); const [minutes, setMinutes] = useState('30');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const pool = questions.filter(q => !selected.length || selected.includes(q.topicId));
  const amount = Math.min(Number(count) || 0, pool.length);
  const valid = Number.isInteger(Number(count)) && Number(count) >= 1 && Number(count) <= 100 && (!timed || (Number.isInteger(Number(minutes)) && Number(minutes) >= 1 && Number(minutes) <= 240));
  async function start() {
    setBusy(true); setError('');
    try { const session = await store.startExam(buildMockPaper(pool, Number(count)), timed ? Number(minutes) : undefined); await refresh(); navigate(`/mock/${session.id}`); }
    catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  return <><header className="page-heading"><p className="eyebrow">MOCK EXAM</p><h1>模拟练习</h1><p>选好范围，完成一份自己的模拟卷。交卷后统一看答案、复盘和自评。</p></header>
    {error && <p className="error-banner" role="alert">{error}</p>}
    <section className="panel"><h2>组成一份模拟卷</h2><fieldset disabled={busy}><legend>知识专题（不选表示全部）</legend><div className="mock-topics">{topics.filter(t => questions.some(q => q.topicId === t.id)).map(t => <label className="inline-check" key={t.id}><input type="checkbox" checked={selected.includes(t.id)} onChange={() => setSelected(selected.includes(t.id) ? selected.filter(id => id !== t.id) : [...selected, t.id])} />{t.name}</label>)}</div></fieldset><div className="mock-settings"><div><label htmlFor="mock-count">题量（1–100）</label><input id="mock-count" type="number" min={1} max={100} value={count} disabled={busy} onChange={e => setCount(e.target.value)} /></div><label className="inline-check"><input type="checkbox" checked={timed} disabled={busy} onChange={e => setTimed(e.target.checked)} />限时考试</label>{timed && <div><label htmlFor="mock-minutes">考试时长（分钟）</label><input id="mock-minutes" type="number" min={1} max={240} value={minutes} disabled={busy} onChange={e => setMinutes(e.target.value)} /></div>}</div><p role="status">范围内共 {pool.length} 道题，本次随机抽取 {amount} 道，不重复凑数。</p><p className="notice">作答自动保存到本机。限时从开始时计算，离开或关闭页面不暂停；到期按最后成功保存的答案交卷。考试期间暂时隐藏解析、历史、笔记和其他练习入口。</p><button className="button primary" disabled={busy || !valid || !amount} onClick={() => { void start(); }}>{busy ? '正在保存试卷……' : `开始 ${amount} 题${timed ? ` · ${minutes} 分钟` : ' · 不限时'}`}</button></section>
    <section className="panel"><h2>考试记录</h2>{!state.data.sessions.length && <p>还没有模拟考试记录。</p>}<div className="mock-history">{[...state.data.sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).map(s => <Link className="mock-history-row" to={`/mock/${s.id}`} key={s.id}><div><strong>{new Date(s.startedAt).toLocaleString()}</strong><p>{s.questionKeys.length} 题 · {s.deadlineAt ? '限时' : '不限时'} · {s.status === 'active' ? '未交卷' : s.status === 'expired' ? '已到期交卷' : '已交卷'}</p></div><span>{s.status === 'active' ? '继续考试' : '查看结果'} →</span></Link>)}</div></section>
  </>;
}

function ExamWorkspace({ session }: { session: MockSession }) {
  const { state, store, refresh } = useLearning();
  const [saved, setSaved] = useState(session); const current = useRef(session);
  const [answers, setAnswers] = useState(session.answers); const [pending, setPending] = useState(0);
  const [error, setError] = useState(''); const failed = useRef(false);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const [now, setNow] = useState(Date.now()); const [confirm, setConfirm] = useState(false);
  const expiring = useRef(false);
  function enqueue(work: (expected: MockSession) => Promise<MockSession>, force = false) {
    setPending(n => n + 1);
    queue.current = queue.current.then(async () => {
      if (failed.current && !force) throw new Error('上次保存未成功，请先重新载入本卷。');
      const next = await work(current.current); current.current = next; setSaved(next); await refresh();
    }).catch(e => { failed.current = true; setError(errorText(e)); }).finally(() => setPending(n => n - 1));
  }
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (pending) { event.preventDefault(); } };
    window.addEventListener('beforeunload', unload);
    return () => window.removeEventListener('beforeunload', unload);
  }, [pending]);
  useEffect(() => {
      if (canonical(session) !== canonical(current.current)) { failed.current = true; setError('本卷已被其他页面更新，请重新载入后继续。'); }
  }, [session]);
  useEffect(() => {
    if (saved.deadlineAt && now >= Date.parse(saved.deadlineAt) && !expiring.current) {
      expiring.current = true; enqueue(() => store.finishExam(saved.id), true);
    }
  }, [now, saved.deadlineAt]);
  async function reload() {
    await queue.current;
    try { await refresh(); const next = (await store.read()).data.sessions.find(s => s.id === session.id); if (!next) throw new Error('本卷已被移除。'); current.current = next; setSaved(next); setAnswers(next.answers); failed.current = false; expiring.current = false; setError(''); setConfirm(false); }
    catch (e) { setError(errorText(e)); }
  }
  const index = saved.currentIndex ?? 0; const key = saved.questionKeys[index];
  const question = state.data.snapshots.find(s => s.key === key)?.question;
  const expired = !!saved.deadlineAt && now >= Date.parse(saved.deadlineAt);
  const locked = expired || !!error || confirm || saved.status !== 'active';
  const answered = saved.questionKeys.filter(k => !isBlankMockAnswer(answers[k])).length;
  if (!question) return <p role="alert">缺少本卷题面，请恢复完整备份。</p>;
  function move(next: number) { enqueue(expected => store.saveExam(expected, { currentIndex: next })); }
  return <><header className="page-heading"><p className="eyebrow">EXAM IN PROGRESS</p><h1>模拟考试进行中</h1><p>本卷固定 {saved.questionKeys.length} 道题。交卷前不显示参考答案。</p></header>
    <div className="exam-status"><div><span>{saved.deadlineAt ? '剩余时间' : '已用时间'}</span><strong role="timer" aria-live="off">{duration(saved.deadlineAt ? Date.parse(saved.deadlineAt) - now : now - Date.parse(saved.startedAt))}</strong></div><div><span>已填写</span><strong>{answered} / {saved.questionKeys.length}</strong></div><p role="status">{error ? '保存未成功' : pending ? '答案保存中……' : '已保存到本机'}</p></div>
    {error && <div className="error-banner" role="alert">{error} <button disabled={!!pending} onClick={() => { void reload(); }}>重新载入本卷</button></div>}
    {expired && <p className="notice" role="status">时间已到，正在按已保存答案交卷；保存失败时请重新载入重试。</p>}
    <div className="exam-layout"><aside className="panel exam-map"><h2>答题卡</h2><p>已填写不代表答案有效或正确。</p><div className="exam-numbers">{saved.questionKeys.map((k, i) => <button className={!isBlankMockAnswer(answers[k]) ? 'filled' : ''} aria-current={i === index ? 'step' : undefined} aria-label={`第 ${i + 1} 题，${isBlankMockAnswer(answers[k]) ? '未填写' : '已填写'}`} key={k} disabled={!!pending || locked} onClick={() => move(i)}>{i + 1}</button>)}</div></aside>
      <div><section className="panel question-panel"><div className="question-meta"><span className="badge">第 {index + 1} / {saved.questionKeys.length} 题</span><span>{typeLabels[question.type]}</span></div><h2>{question.title}</h2><RichText text={question.promptMd} /><ExamAnswerInput key={key} question={question} answer={answers[key]} disabled={locked} onChange={answer => { setAnswers(old => ({ ...old, [key]: answer })); enqueue(expected => store.saveExam(expected, { key, answer })); }} /><div className="button-row"><button className="button secondary" disabled={!!pending || locked || index === 0} onClick={() => move(index - 1)}>上一题</button><button className="button secondary" disabled={!!pending || locked || index === saved.questionKeys.length - 1} onClick={() => move(index + 1)}>下一题</button></div></section>
      <section className="panel">{confirm ? <><h2>确认交卷</h2><p>已填写 {answered} 道，未填写 {saved.questionKeys.length - answered} 道。未答自动题计入考试分母并计零分；人工题在交卷后自评。交卷后不能再修改本卷答案。</p><div className="button-row"><button className="button primary" disabled={!!pending || !!error || expired} onClick={() => enqueue(expected => store.finishExam(expected.id, true, expected))}>确认交卷并查看结果</button><button className="button secondary" disabled={!!pending} onClick={() => setConfirm(false)}>继续检查</button></div></> : <><h2>检查后交卷</h2><p>可以跳过题目，之后通过答题卡返回。关闭页面后，下次打开本站会恢复本卷。</p><button className="button primary" disabled={!!pending || locked} onClick={() => setConfirm(true)}>交卷</button></>}</section></div></div>
  </>;
}

function ExamReview({ session }: { session: MockSession }) {
  const { state, store, refresh } = useLearning();
  const [index, setIndex] = useState(0); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const key = session.questionKeys[index]; const question = state.data.snapshots.find(s => s.key === key)?.question;
  const autoTotal = session.autoTotal ?? 0; const autoCorrect = session.autoCorrect ?? 0;
  const pendingRound = session.pendingManualRounds?.find(r => r.snapshot.key === key);
  const completed = pendingRound && state.data.records.find(r => r.namespace === 'drafts' && r.id === mockReviewDraftId(pendingRound.id) && !r.deleted);
  const manualGrade = completed && storedRoundSchema.parse(completed.value).round.events.find(e => e.kind === 'self_graded');
  const manualRemaining = (session.pendingManualRounds ?? []).filter(r => !state.data.records.some(record => record.namespace === 'drafts' && record.id === mockReviewDraftId(r.id) && !record.deleted)).length;
  function outcome(k: string) {
    if (session.unansweredKeys?.includes(k)) return '未答';
    if (session.invalidAnswers?.some(a => a.key === k)) return '格式无效';
    const q = state.data.snapshots.find(s => s.key === k)?.question;
    if (!q) return '题面缺失';
    if (isManual(q)) return '人工自评';
    const result = gradeAnswer(q, session.answers[k]); return result.valid && result.isCorrect ? '正确' : '错误';
  }
  async function assess(grade: SelfGrade) {
    setBusy(true); setError('');
    try { await store.gradeExamManual(session.id, key, grade); await refresh(); }
    catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  return <><header className="page-heading"><p className="eyebrow">EXAM REVIEW</p><h1>{session.status === 'expired' ? '时间到，已自动交卷' : '模拟考试已交卷'}</h1><p>{new Date(session.startedAt).toLocaleString()} · {session.questionKeys.length} 题 · 用时 {duration(Date.parse(session.completedAt!) - Date.parse(session.startedAt))}</p></header>
    <section className="metrics" aria-label="本次考试结果"><div><p>自动题得分</p><strong>{autoCorrect}<small> / {autoTotal}</small></strong></div><div><p>自动题得分率</p><strong>{autoTotal ? `${Math.round(autoCorrect / autoTotal * 100)}%` : '—'}</strong></div><div><p>未答题</p><strong>{session.unansweredKeys?.length ?? 0}</strong></div><div><p>待自评人工题</p><strong>{manualRemaining}</strong></div></section>
    <p className="notice">自动题每题计 1 分，未答或格式无效计 0 分，计入本卷分母。普通练习正确率只统计有效正式提交；人工自评独立记录，不计入自动题得分。</p>
    {error && <p className="error-banner" role="alert">{error}</p>}
    <section className="panel"><h2>逐题回顾</h2><div className="exam-review-numbers">{session.questionKeys.map((k, i) => <button className="button secondary" aria-pressed={index === i} disabled={busy} key={k} onClick={() => setIndex(i)}>{i + 1} · {outcome(k)}</button>)}</div></section>
    {question && <><section className="panel question-panel"><div className="question-meta"><span className="badge">第 {index + 1} 题 · {outcome(key)}</span><span>{typeLabels[question.type]}</span><span>{question.id}</span></div><h2>{question.title}</h2><RichText text={question.promptMd} />{'options' in question && question.options.map(o => <div className="review-choice" key={o.id}><strong>{o.id}</strong><RichText text={o.textMd} /></div>)}<h3>交卷时的答案</h3><pre>{isBlankMockAnswer(session.answers[key]) ? '未填写' : typeof session.answers[key] === 'string' ? session.answers[key] : JSON.stringify(session.answers[key], null, 2)}</pre>{session.invalidAnswers?.filter(a => a.key === key).map(a => <p role="status" key={a.key}>格式无效：{a.error}</p>)}<SourceDetails question={question} /></section>
    <ReferenceAnswer question={question} />
    {isManual(question) && <section className="panel"><h2>本题人工自评</h2>{manualGrade?.kind === 'self_graded' ? <p role="status">已保存：{labels[manualGrade.effectiveGrade]}。本卷自评不会重复记入历史。</p> : pendingRound ? <><p>请对照交卷前保存的独立作答和评分点，选择本次掌握程度。</p><div className="button-row">{(['good', 'partial', 'again'] as const).map(grade => <button className="button secondary" key={grade} disabled={busy} onClick={() => { void assess(grade); }}>{labels[grade]}</button>)}</div></> : <p>本题未保存有效独立作答，不创建掌握记录。可以另开普通练习重新完成。</p>}</section>}</>}
    <div className="button-row"><Link className="button primary" to="/mock">返回模拟练习</Link><Link className="button secondary" to="/review">查看错题与复习</Link></div>
  </>;
}
