import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { topics } from '../data/topics';
import { questions } from '../data/question-bank';
import { filterQuestions, selectPracticeQuestions, fidelityLabels, questionYears, type QuestionFilters } from '../domain/question-filters';
import { useLearning } from '../storage/LearningContext';
import { typeLabels } from '../components/QuestionContent';
import { QuestionRows } from '../components/QuestionList';

export function QuestionsPage({ practice = false }: { practice?: boolean }) {
  const { store, state, refresh } = useLearning();
  const [params, setParams] = useSearchParams(); const navigate = useNavigate();
  const [count, setCount] = useState('10'); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const keys = ['topic', 'subtopic', 'q', 'type', 'difficulty', 'company', 'year', 'fidelity', 'evidence', 'progress', 'tag', 'sort'] as const;
  const filters: QuestionFilters = Object.fromEntries(keys.map((key) => [key, params.get(key) || '']));
  const topic = topics.find((item) => item.id === filters.topic);
  const matched = filterQuestions(questions, filters, state.data);
  const companies = [...new Set(questions.flatMap((q) => q.source.company ? [q.source.company] : []))].sort();
  const years = [...new Set(questions.flatMap(questionYears))].sort();
  const tags = [...new Set(questions.flatMap((q) => q.tags))].sort();
  const hasAdvanced = keys.some((key) => !['topic', 'q', 'sort'].includes(key) && filters[key]);
  function update(key: keyof QuestionFilters, value: string) {
    const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key);
    if (key === 'topic') next.delete('subtopic');
    setParams(next, { replace: true }); setError('');
  }
  async function start(amount: number) {
    setBusy(true); setError('');
    try {
      const selected = selectPracticeQuestions(matched, amount, state.data);
      if (!selected.length) throw new Error('没有匹配题目，请先调整筛选。');
      const session = await store.startPractice(selected, 'practice', Object.fromEntries(Object.entries(filters).filter(([, value]) => value)));
      await refresh(); navigate(`/practice-session/${session.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : '无法开始练习。'); } finally { setBusy(false); }
  }
  const select = (key: keyof QuestionFilters, label: string, options: [string, string][]) => <div><label htmlFor={`filter-${key}`}>{label}</label><select id={`filter-${key}`} value={filters[key] || ''} onChange={(e) => update(key, e.target.value)}><option value="">全部</option>{options.map(([value, title]) => <option value={value} key={value}>{title}</option>)}</select></div>;
  return <><header className="page-heading"><p className="eyebrow">{practice ? 'PRACTICE' : 'QUESTION BANK'}</p><h1>{practice ? '组题与连续练习' : topic?.name || '题库'}</h1><p>按知识点和来源选择题目，或随机组成一轮不重复的练习。改编题仅参考公开笔经考点，不是公司原题。</p></header>
    <section className="panel"><div className="filter-grid">{select('topic', '知识专题', topics.map((t) => [t.id, `${t.id} · ${t.name}`]))}<div><label htmlFor="filter-search">搜索题目</label><input id="filter-search" type="search" value={filters.q || ''} placeholder="题目、题面或标签" onChange={(e) => update('q', e.target.value)} /></div></div>
      <details className="advanced-filters" open={hasAdvanced}><summary>更多筛选（题型、来源、年份等）</summary><div className="filter-grid">
        {select('subtopic', '子专题', (topic ? topic.subtopics : []).map((t) => [t.id, t.name]))}
        {select('type', '题型', Object.entries(typeLabels))}{select('difficulty', '难度', [['easy', '简单'], ['medium', '中等'], ['hard', '困难']])}
        {select('fidelity', '题目来源', Object.entries(fidelityLabels).map(([value, title]) => [value, `${title}（${questions.filter((q) => q.source.questionFidelity === value).length}）`]))}
        {select('company', '参考笔经公司', companies.map((company) => [company, company]))}
        {select('year', '届别 / 考试年份', years.map((year) => [year, year.startsWith('cohort:') ? `笔经届别：${year.slice(7)}` : `考试年份：${year.slice(5)}`]))}
        {select('evidence', '来源证据等级', [['A', 'A · 亲历回忆'], ['B', 'B · 往届整理'], ['C', 'C · 教学/模拟'], ['D', 'D · 待核线索'], ['none', '无 · 原创专项']])}
        {select('progress', '学习状态', [['unseen', '未独立完成'], ['done', '已独立完成'], ['wrong', '未解决错题'], ['correct', '最近独立掌握'], ['bookmarked', '已收藏']])}
        {select('tag', '知识标签', tags.map((tag) => [tag, tag]))}
      </div></details>
      <div className="filter-footer"><strong role="status">匹配 {matched.length} 道题</strong>{select('sort', '排序', [['topic', '按专题'], ['difficulty', '由易到难'], ['title', '按标题']])}<button className="button secondary" onClick={() => setParams({})}>清除筛选</button></div>
    </section>
    {error && <div className="error-banner" role="alert">{error}</div>}
    <section className="panel practice-builder"><div><h2>开始连续练习</h2><p>优先到期与未独立完成题，再尽量避开近期重复。题量不足时按实际数量开始，不复制凑数。</p></div><div className="builder-controls"><div><label htmlFor="practice-count">题量（1–100）</label><input id="practice-count" type="number" min={1} max={100} value={count} onChange={(e) => setCount(e.target.value)} /></div><button className="button primary" disabled={busy || !matched.length || !Number.isInteger(Number(count)) || Number(count) < 1 || Number(count) > 100} onClick={() => { void start(Number(count)); }}>开始 {Math.min(Number(count) || 0, matched.length)} 题</button><button className="button secondary" disabled={busy || !matched.length} onClick={() => { void start(10); }}>快速刷 10 题</button></div></section>
    {topic && <section className="panel"><h2>本专题覆盖范围</h2><div className="tags">{topic.subtopics.map((subtopic) => <button className="tag-button" aria-pressed={filters.subtopic === subtopic.id} key={subtopic.id} onClick={() => update('subtopic', subtopic.id)}>{subtopic.name}</button>)}</div></section>}
    {matched.length ? <QuestionRows items={matched} /> : <section className="empty-state"><h2>没有匹配题目</h2><p>可核实原题和转述题当前均为 0 道。其他筛选无结果时，也不会补入不符合条件的题目。</p><button className="button secondary" onClick={() => setParams({})}>清除筛选</button></section>}
    <p className="source-note">来源证据等级只描述资料性质，不代表当前练习是原题，也不等于答案审核状态。</p>
  </>;
}
