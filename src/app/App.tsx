import { useEffect } from 'react';
import { HashRouter, Link, NavLink, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { topics, learningStages } from '../data/topics';
import { questions } from '../data/question-bank';
import { Dashboard } from '../pages/Dashboard';
import { PracticePage, QuestionRows } from '../pages/PracticePage';
import { ReviewPage } from '../pages/ReviewPage';
import { SettingsPage } from '../pages/SettingsPage';
import { LearningProvider, useLearning } from '../storage/LearningContext';

const navigation = [
  ['/', '学习概览', 'Overview'], ['/topics', '知识专题', 'Topics'], ['/questions', '题库', 'Question bank'],
  ['/practice', '专项练习', 'Practice'], ['/review', '错题与复习', 'Review'], ['/mock', '模拟练习', 'Mock exam'],
  ['/progress', '学习进度', 'Progress'], ['/settings', '设置与备份', 'Settings'],
];

function TopicCards() {
  const { state } = useLearning();
  return <div className="topic-grid">{topics.map((topic) => {
    const count = questions.filter((question) => question.topicId === topic.id).length;
    return <Link className="topic-card" key={topic.id} to={`/questions?topic=${topic.id}`}>
      <div className="card-top"><span className="topic-id">{topic.id}</span><span className="badge">{count ? `${count} 道可练` : '待扩充'}</span></div>
      <h3>{topic.name}</h3><p className="english-name">{topic.englishName}</p>
      <p className="subtopic-preview">{topic.subtopics.slice(0, 4).map((subtopic) => subtopic.name).join(' · ')}</p>
      <div className="card-bottom"><span>{topic.subtopics.length} 个子专题 · 已练 {state.progress.filter((p) => p.independentlyPracticed && questions.some((q) => q.id === p.questionId && q.topicId === topic.id)).length} / {count}</span><span>查看专题</span></div>
    </Link>;
  })}</div>;
}

function TopicsPage() {
  return <><PageTitle eyebrow="KNOWLEDGE MAP" title="知识专题" description="15 个专题，按知识点组织训练；可根据目标岗位调整顺序。" />
    <section className="panel learning-path"><h2>推荐学习顺序</h2><ol>{learningStages.map((stage) => <li key={stage.name}><strong>{stage.name}</strong><span>{stage.topicIds.join(' / ')}</span></li>)}<li><strong>混合模拟与错题回顾</strong><span>综合练习</span></li></ol><p className="muted">学习顺序是复习建议，不代表实际考试频率，也不限制进入其他专题。</p></section>
    <TopicCards />
  </>;
}

function QuestionsPage() {
  const [params, setParams] = useSearchParams();
  const selected = params.get('topic') || '';
  const topic = topics.find((item) => item.id === selected);
  const query = params.get('q') || '';
  const matched = questions.filter((question) => (!selected || question.topicId === selected) && `${question.title} ${question.promptMd} ${question.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  }
  return <><PageTitle eyebrow="QUESTION BANK" title={topic ? topic.name : '题库'} description="按专题查找题目。题源标签会区分原创、考点改编、转述与可核实原题。" />
    <section className="panel filter-panel"><div><label htmlFor="topic">知识专题</label><select id="topic" value={selected} onChange={(event) => update('topic', event.target.value)}><option value="">全部专题</option>{topics.map((item) => <option value={item.id} key={item.id}>{item.id} · {item.name}</option>)}</select></div>
      <div><label htmlFor="search">搜索题目</label><input id="search" type="search" placeholder="题目、知识点或标签" value={query} onChange={(event) => update('q', event.target.value)} /></div><span className="result-count">匹配 {matched.length} 道</span></section>
    {topic && <section className="panel"><h2>本专题覆盖范围</h2><div className="tags">{topic.subtopics.map((subtopic) => <span key={subtopic.id}>{subtopic.name}</span>)}</div></section>}
    {selected && !topic ? <EmptyState title="未找到这个专题" description="请选择目录中的有效专题。" /> : matched.length === 0 ? <EmptyState title={questions.length === 0 ? '正式题目尚未加入' : '没有匹配的题目'} description="当前不使用演示题或考点摘要充当正式题目。题目通过内容检查后会显示在这里。" /> : <QuestionRows items={matched} />}
    <p className="source-note">来源标签不代表官方考试认证。公开笔经考点改编题会明确标注“非原题”。</p>
  </>;
}

function PageTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="page-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></header>;
}
function EmptyState({ title, description }: { title: string; description: string }) {
  return <section className="empty-state"><div className="empty-symbol" aria-hidden="true">▤</div><h2>{title}</h2><p>{description}</p><Link to="/topics" className="button secondary">浏览知识专题</Link></section>;
}
function PlannedPage({ title, description }: { title: string; description: string }) {
  return <><PageTitle eyebrow="IC DESIGN PRACTICE" title={title} description={description} /><EmptyState title="此功能将在后续阶段开放" description="本页仍在分阶段开发。现已支持单题练习、错题复习与本地记录，请通过导航进入。" /></>;
}
function RouteFocus() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); document.getElementById('main-content')?.focus({ preventScroll: true }); }, [location.pathname]);
  return <span key={location.pathname} className="sr-only" role="status">当前页面：{navigation.find(([path]) => path === location.pathname)?.[1] || (location.pathname.startsWith('/practice/') ? '题目练习' : '页面未找到')}</span>;
}

export function App() {
  return <LearningProvider><HashRouter><a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>跳到主要内容</a><div className="shell"><aside className="sidebar"><Link to="/" className="brand"><span className="brand-mark" aria-hidden="true">IC</span><span>IC Design<br /><strong>Practice</strong></span></Link><p className="nav-label">学习工作台</p><nav aria-label="主导航">{navigation.map(([path, title, subtitle]) => <NavLink key={path} to={path} end={path === '/'}><span>{title}</span><small>{subtitle}</small></NavLink>)}</nav><div className="sidebar-footer"><span className="badge">练习与记录 · 0.2.0</span><p>循序练习，持续复习。</p></div></aside><main id="main-content" tabIndex={-1}><RouteFocus /><Routes>
    <Route path="/" element={<Dashboard />} /><Route path="/topics" element={<TopicsPage />} /><Route path="/questions" element={<QuestionsPage />} />
    <Route path="/practice" element={<PracticePage />} /><Route path="/practice/:id" element={<PracticePage />} />
    <Route path="/review" element={<ReviewPage />} />
    <Route path="/mock" element={<PlannedPage title="模拟练习" description="混合专题、限时作答，交卷后统一回顾。" />} />
    <Route path="/progress" element={<PlannedPage title="学习进度" description="从真实作答记录了解各专题的掌握情况。" />} />
    <Route path="/settings" element={<SettingsPage />} /><Route path="*" element={<EmptyState title="页面不存在" description="请从导航进入已有页面。" />} />
  </Routes><footer className="main-footer">IC Design Practice · 原创与公开题源分类展示</footer></main></div></HashRouter></LearningProvider>;
}
