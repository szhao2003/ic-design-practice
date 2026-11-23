import { displayTag } from '../domain/source-presentation';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { questions } from '../data/question-bank';
import type { Question } from '../domain/question-schema';
import { isManual, type Answer } from '../domain/grading';
import { revealAnswer, saveDraft, selfGrade, submitAutomatic, type PracticeRound } from '../domain/practice';
import { useLearning } from '../storage/LearningContext';
import { issueSchema, type StoredRound } from '../storage/backup-schema';
import type { JsonValue } from '../domain/backup-merge';
import { ReferenceAnswer, RichText, SourceDetails, sourceLabel, typeLabels } from '../components/QuestionContent';
import { QuestionsPage } from './QuestionsPage';
import { RoundLearningGate } from '../components/RoundLearningGate';
import { topics } from '../data/topics';

function answerText(answer: unknown) { return typeof answer === 'string' ? answer : JSON.stringify(answer ?? '未填写', null, 2); }

export function PracticePage() {
  const { id } = useParams();
  const { state } = useLearning();
  const question = questions.find((q) => q.id === id) ?? state.data.snapshots.find((s) => s.question.id === id)?.question;
  if (!id) return <QuestionsPage practice />;
  if (!question) return <section className="panel"><h1>未找到题目</h1><Link to="/questions">返回题库</Link></section>;
  return <QuestionWorkspace key={id} question={question} removed={!questions.some((q) => q.id === id)} />;
}

export function QuestionWorkspace({ question: latestQuestion, removed, sessionContext }: { question: Question; removed: boolean; sessionContext?: { sessionId: string; draftId: string } }) {
  const { store, state, refresh } = useLearning();
  const [saved, setSaved] = useState<StoredRound>();
  const current = useRef<StoredRound | undefined>(undefined);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const [draft, setDraft] = useState<Answer>();
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState('');
  const [paper, setPaper] = useState(false);
  const [copied, setCopied] = useState('');
  const [includeAnswer, setIncludeAnswer] = useState(false);
  const getRecord = (namespace: string) => state.data.records.find((r) => r.namespace === namespace && r.id === latestQuestion.id && !r.deleted);
  const [note, setNote] = useState(String(getRecord('notes')?.value ?? ''));
  const initialIssue = issueSchema.safeParse(getRecord('issues')?.value);
  const [issue, setIssue] = useState(initialIssue.success ? initialIssue.data.comment : '');
  const [issueFlags, setIssueFlags] = useState<string[]>(initialIssue.success ? initialIssue.data.flags : []);
  const [noteMessage, setNoteMessage] = useState('');
  const noteQueue = useRef<Promise<void>>(Promise.resolve());
  function autoSaveNote(namespace: 'notes' | 'issues', value: JsonValue, deleted = typeof value === 'string' && !value.trim()) {
    setNoteMessage('笔记与纠错说明保存中……');
    noteQueue.current = noteQueue.current.then(async () => {
      await store.saveRecord(namespace, latestQuestion.id, value, deleted);
      await refresh(); setNoteMessage('笔记与纠错说明已保存。');
    }).catch((e: unknown) => setNoteMessage(e instanceof Error ? e.message : '保存失败，请重试。'));
  }
  async function load(restart = false) {
    try {
      await queue.current;
      const value = await (sessionContext ? store.loadPracticeRound(sessionContext.sessionId) : store.begin(latestQuestion, restart));
      current.current = value; setSaved(value); setDraft(value.round.draft); setPaper(false); setIncludeAnswer(false); setError(''); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : '载入失败。'); }
  }
  useEffect(() => { void load(); }, [latestQuestion.id]); // 同一题版本升级保留当前轮次快照。
  function change(transform: (round: PracticeRound) => PracticeRound, updateSummary = true) {
    setBusy((count) => count + 1); setError('');
    queue.current = queue.current.then(async () => {
      if (!current.current) throw new Error('请先载入题目。');
      const next = await store.change(latestQuestion.id, current.current, transform, sessionContext);
      current.current = next; setSaved(next);
      if (updateSummary) await refresh();
    }).catch((e: unknown) => setError(e instanceof Error ? e.message : '保存失败，请重新载入。')).finally(() => setBusy((count) => count - 1));
  }
  function updateAnswer(answer: Answer) { setDraft(answer); change((round) => saveDraft(round, answer), false); }
  async function saveNotes() {
    try { await noteQueue.current; await store.saveRecord('notes', latestQuestion.id, note, !note.trim()); await store.saveRecord('issues', latestQuestion.id, { flags: issueFlags, comment: issue }, !issueFlags.length && !issue.trim()); await refresh(); setNoteMessage('笔记与纠错说明已保存。'); }
    catch (e) { setNoteMessage(e instanceof Error ? e.message : '保存失败。'); }
  }
  async function toggleBookmark() {
    try { await store.saveRecord('bookmarks', latestQuestion.id, !getRecord('bookmarks')?.value); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : '收藏保存失败。'); }
  }
  const round = saved?.round;
  const question = round?.snapshot.question ?? latestQuestion;
  const locked = round?.status !== 'answering';
  const topic = topics.find(t => t.id === question.topicId);
  const subtopic = topic?.subtopics.find(t => t.id === question.subtopicId);
  const events = state.data.events.filter((event) => event.questionId === question.id).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const result = round?.events.find((event) => event.kind === 'submitted');
  const progress = state.progress.find((p) => p.questionId === question.id);
  async function copyQuestion() {
    let text = `${question.id} · ${question.title}\n${typeLabels[question.type]} · ${sourceLabel(question)}\n专题：${question.topicId} · 标签：${question.tags.map(displayTag).join(", ")}\n\n${question.promptMd}`;
    if ('options' in question) text += `\n\n${question.options.map((option) => `${option.id}. ${option.textMd}`).join('\n')}`;
    if (includeAnswer && round?.status === 'complete') text += `\n\n本次作答：${answerText(round.draft)}\n参考答案：${'referenceAnswerMd' in question ? question.referenceAnswerMd : 'correctOptionIds' in question ? question.correctOptionIds.join(',') : question.type === 'numeric' ? `${question.expectedValue} ${question.unit || ''}` : question.type === 'true_false' ? String(question.correctValue) : ''}\n个人错因：${note}`;
    try { await navigator.clipboard.writeText(text); setCopied('已复制。'); } catch { setCopied('无法访问剪贴板，请手动选择题面复制。'); }
  }
  return <>
    <div className="practice-top"><Link to="/questions">返回题库</Link><span role="status">{busy ? '草稿保存中……' : saved ? '当前轮次已保存到本机' : '正在载入……'}</span></div>
    {error && <div className="error-banner" role="alert">{error} <button onClick={() => { void load(); }}>重新载入本题</button></div>}
    {removed && <div className="notice">题库已移除或未安装此题；当前显示备份中的历史题面。</div>}
    {question.contentVersion !== latestQuestion.contentVersion && <div className="notice">题目已更新，本轮仍使用旧版题面。点击“重做本题”可开始新版本。</div>}
    <section className="panel question-panel"><div className="question-meta"><span className="badge">{typeLabels[question.type]}</span><span>{sourceLabel(question)}</span><span>{question.id}</span></div><p className="question-taxonomy">{topic?.name ?? question.topicId} / {subtopic?.name ?? question.subtopicId} · 难度：{({ easy: '简单', medium: '中等', hard: '困难' })[question.difficulty]}</p><h1>{question.title}</h1><RichText text={question.promptMd} /><button className="button secondary" onClick={() => { void toggleBookmark(); }}>{getRecord('bookmarks')?.value ? '取消收藏本题' : '收藏本题'}</button></section>
    {saved && <section className="panel answer-panel"><h2>你的作答</h2>
      {(question.type === 'single_choice' || question.type === 'multiple_choice') && <fieldset disabled={locked}><legend className="sr-only">选择答案</legend>{question.options.map((option) => <label className="answer-option" key={option.id}><input type={question.type === 'single_choice' ? 'radio' : 'checkbox'} name="answer" checked={Array.isArray(draft) && draft.includes(option.id)} onChange={() => updateAnswer(question.type === 'single_choice' ? [option.id] : Array.isArray(draft) && draft.includes(option.id) ? draft.filter((id) => id !== option.id) : [...(Array.isArray(draft) ? draft : []), option.id])} /><strong>{option.id}</strong><RichText text={option.textMd} /></label>)}</fieldset>}
      {question.type === 'true_false' && <fieldset disabled={locked}><legend>选择正确或错误</legend>{[true, false].map((value) => <label className="answer-option" key={String(value)}><input type="radio" name="answer" checked={draft === value} onChange={() => updateAnswer(value)} />{value ? '正确' : '错误'}</label>)}</fieldset>}
      {question.type === 'numeric' && <div className="numeric-answer"><div><label htmlFor="number-answer">计算结果</label><input id="number-answer" disabled={locked} inputMode="decimal" placeholder="例如 1.5" value={typeof draft === 'object' && !Array.isArray(draft) ? draft.raw : ''} onChange={(e) => updateAnswer({ raw: e.target.value, unit: typeof draft === 'object' && !Array.isArray(draft) ? draft.unit : question.defaultUnit })} onKeyDown={(e) => { if (e.key === 'Enter' && !busy && !locked && !error) { e.preventDefault(); change((r) => submitAutomatic(r, new Date().toISOString())); } }} /></div>{question.acceptedUnits && <div><label htmlFor="answer-unit">单位</label><select id="answer-unit" disabled={locked} value={typeof draft === 'object' && !Array.isArray(draft) ? draft.unit ?? question.defaultUnit ?? '' : question.defaultUnit ?? ''} onChange={(e) => updateAnswer({ raw: typeof draft === 'object' && !Array.isArray(draft) ? draft.raw : '', unit: e.target.value })}><option value="">请选择</option>{Object.keys(question.acceptedUnits).map((unit) => <option key={unit}>{unit}</option>)}</select></div>}</div>}
      {isManual(question) && <><label htmlFor="written-answer">独立思路或代码（此题使用人工自评）</label><textarea id="written-answer" className={question.type === 'rtl_coding' ? 'code-input' : ''} rows={8} disabled={locked} value={typeof draft === 'string' ? draft : ''} onChange={(e) => updateAnswer(e.target.value)} /><label className="inline-check"><input type="checkbox" checked={paper} disabled={locked} onChange={(e) => setPaper(e.target.checked)} />我已独立在纸上完成作答</label></>}
      {!locked && <div className="button-row">{isManual(question) ? <button className="button primary" disabled={!!busy || Boolean(error) || (!paper && !(typeof draft === 'string' && draft.trim()))} onClick={() => change((r) => revealAnswer(r, new Date().toISOString(), true, paper))}>保存独立作答并查看参考答案</button> : <button className="button primary" disabled={!!busy || Boolean(error)} onClick={() => change((r) => submitAutomatic(r, new Date().toISOString()))}>提交答案</button>}<button className="button secondary" disabled={!!busy || Boolean(error)} onClick={() => change((r) => revealAnswer(r, new Date().toISOString()))}>直接查看答案（辅助学习）</button></div>}
      {result?.kind === 'submitted' && <div className={result.result.isCorrect ? 'result correct' : 'result incorrect'} role="status">{result.result.isCorrect ? '回答正确' : '回答错误，已加入待巩固与复习'}<pre>你的答案：{answerText(result.answer)}</pre></div>}
      {round?.events.some((event) => event.kind === 'revealed_without_submission') && <p className="notice">本轮属于辅助学习，不计入自动正确率，也不累计独立掌握；下次请重新独立作答。</p>}
      {round?.status === 'awaiting_self_grade' && <div className="self-grade"><h3>对照评分点，自评本次掌握程度</h3><div className="button-row">{(['good', 'partial', 'again'] as const).map((grade) => <button key={grade} className="button secondary" disabled={!!busy || Boolean(error)} onClick={() => change((r) => selfGrade(r, grade, new Date().toISOString()))}>{({ good: '掌握', partial: '部分掌握', again: '不会' })[grade]}</button>)}</div></div>}
      {!sessionContext && round?.status === 'complete' && <div className="button-row"><button className="button secondary" disabled={!!busy || Boolean(error)} onClick={() => { void load(true); }}>重做本题</button><Link className="button secondary" to="/practice">选择下一题</Link></div>}
      {progress && <p className="source-note">建议下次复习：{new Date(progress.nextReviewAt).toLocaleString()} · 连续独立掌握 {progress.consecutiveSuccesses} 次</p>}
    </section>}
    <RoundLearningGate round={round} disabled={!!busy || Boolean(error)} onReveal={() => change(r => revealAnswer(r, new Date().toISOString()))}>
    <ReferenceAnswer question={question} />
    <section className="panel"><h2>个人笔记与纠错</h2><label htmlFor="personal-note">我的理解 / 为什么做错</label><textarea id="personal-note" rows={4} value={note} onChange={(e) => { setNote(e.target.value); autoSaveNote('notes', e.target.value); }} /><fieldset><legend>纠错类型</legend>{[["ambiguous_prompt", "题意有歧义"], ["suspected_wrong_answer", "答案疑似错误"], ["needs_diagram", "需要补图"], ["source_check_needed", "来源待核实"]].map(([flag, label]) => <label className="inline-check" key={flag}><input type="checkbox" checked={issueFlags.includes(flag)} onChange={() => { const flags = issueFlags.includes(flag) ? issueFlags.filter((item) => item !== flag) : [...issueFlags, flag]; setIssueFlags(flags); autoSaveNote("issues", { flags, comment: issue }, !flags.length && !issue.trim()); }} />{label}</label>)}</fieldset><label htmlFor="personal-issue">题目疑问（题意歧义、答案疑似错误、需要配图或来源待核）</label><textarea id="personal-issue" rows={2} value={issue} onChange={(e) => { setIssue(e.target.value); autoSaveNote('issues', { flags: issueFlags, comment: e.target.value }, !issueFlags.length && !e.target.value.trim()); }} /><div className="button-row"><button className="button secondary" onClick={() => { void saveNotes(); }}>保存笔记与纠错</button></div><p role="status">{noteMessage}</p></section>
    <section className="panel"><h2>作答历史（{events.filter((e) => e.kind !== 'revealed_without_submission').length} 次正式提交 / 自评）</h2>{!events.length && <p>暂无历史。仅打开题目或保存草稿不会增加练习次数。</p>}{events.map((event) => <details className="history-entry" key={event.id}><summary>{new Date(event.at).toLocaleString()} · {event.kind === 'submitted' ? event.result.isCorrect ? '自动判分：正确' : '自动判分：错误' : event.kind === 'self_graded' ? `人工自评：${({ good: '掌握', partial: '部分掌握', again: '不会' })[event.effectiveGrade]}` : '辅助揭示'}</summary><pre>{answerText(event.kind === 'revealed_without_submission' ? event.draft : event.answer)}</pre>{'paperCompletedAt' in event && event.paperCompletedAt && <p>已声明纸笔独立完成。</p>}{(() => { const old = state.data.snapshots.find((s) => s.key === event.snapshotKey); return old ? <details><summary>查看当时题面与解析</summary><RichText text={old.question.promptMd} />{'options' in old.question && old.question.options.map((option) => <div key={option.id}><strong>{option.id}</strong><RichText text={option.textMd} /></div>)}<ReferenceAnswer question={old.question} /></details> : <p>历史题面不可用。</p>; })()}</details>)}</section>
    <section className="panel"><h2>来源与参考资料</h2><SourceDetails question={question} /></section>
    </RoundLearningGate>
    <section className="panel"><h2>复制题目</h2>{round?.status === 'complete' && <label className="inline-check"><input type="checkbox" checked={includeAnswer} onChange={(e) => setIncludeAnswer(e.target.checked)} />附上本次答案、参考答案与个人错因</label>}<button className="button secondary" onClick={() => { void copyQuestion(); }}>复制完整题面</button><span role="status"> {copied}</span></section>
  </>;
}
