import { useEffect } from 'react';
import { HashRouter, Link, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { topics, learningStages } from '../data/topics';
import { questions } from '../data/question-bank';
import { Dashboard } from '../pages/Dashboard';
import { PracticePage } from '../pages/PracticePage';
import { QuestionsPage } from '../pages/QuestionsPage';
import { PracticeSessionPage } from '../pages/PracticeSessionPage';
import { ReviewPage } from '../pages/ReviewPage';
import { SettingsPage } from '../pages/SettingsPage';
import { MockPage } from '../pages/MockPage';
import { ProgressPage } from '../pages/ProgressPage';
import { LearningProvider, useLearning } from '../storage/LearningContext';
import { mockRedirect } from '../domain/mock-session';

const navigation = [
  ['/', '学习概览', 'Overview'], ['/topics', '知识专题', 'Topics'], ['/questions', '题库', 'Question bank'],
  ['/review', '错题与复习', 'Review'], ['/mock', '模拟练习', 'Mock exam'],
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
    <h2>全部知识专题</h2><TopicCards />
  </>;
}

function PageTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="page-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></header>;
}
function EmptyState({ title, description }: { title: string; description: string }) {
  return <section className="empty-state"><div className="empty-symbol" aria-hidden="true">▤</div><h2>{title}</h2><p>{description}</p><Link to="/topics" className="button secondary">浏览知识专题</Link></section>;
}
function LegacyPracticeRedirect() {
  const location = useLocation();
  return <Navigate to={`/questions${location.search}`} replace />;
}
function RouteFocus() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); document.getElementById('main-content')?.focus({ preventScroll: true }); }, [location.pathname]);
  return <span key={location.pathname} className="sr-only" role="status">当前页面：{navigation.find(([path]) => path === location.pathname)?.[1] || (location.pathname.startsWith('/mock/') ? '模拟考试' : '') || ((location.pathname.startsWith('/practice/') || location.pathname.startsWith('/practice-session/')) ? '题目练习' : '页面未找到')}</span>;
}

export function App() {
  return <LearningProvider><HashRouter><AppShell /></HashRouter></LearningProvider>;
}
export function AppShell() {
  const { state } = useLearning(); const location = useLocation();
  const active = state.data.sessions.find(s => s.status === 'active');
  const redirect = mockRedirect(state.data.sessions, location.pathname);
  if (redirect) return <Navigate to={redirect} replace />;
  return <><a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>跳到主要内容</a><div className="shell"><aside className="sidebar"><Link to={active ? `/mock/${active.id}` : '/'} className="brand"><span className="brand-mark" aria-hidden="true">IC</span><span>IC Design<br /><strong>Practice</strong></span></Link><p className="nav-label">学习工作台</p><nav aria-label="主导航">{navigation.map(([path, title, subtitle]) => active && path !== '/mock' ? <span className="nav-disabled" aria-disabled="true" key={path}><span>{title}</span><small>{subtitle}</small></span> : <NavLink key={path} to={active ? `/mock/${active.id}` : path} end={path === '/'}><span>{title}</span><small>{subtitle}</small></NavLink>)}</nav>{active && <p className="exam-locked-note">考试进行中，交卷后恢复其他入口。离开页面不暂停计时。</p>}<div className="sidebar-footer"><span className="badge">V1 · 1.28.0</span><p>循序练习，持续复习。</p></div></aside><main id="main-content" tabIndex={-1}><RouteFocus /><Routes>
    <Route path="/" element={<Dashboard />} /><Route path="/topics" element={<TopicsPage />} /><Route path="/questions" element={<QuestionsPage />} />
    <Route path="/practice" element={<LegacyPracticeRedirect />} /><Route path="/practice/:id" element={<PracticePage />} /><Route path="/practice-session/:id" element={<PracticeSessionPage />} />
    <Route path="/review" element={<ReviewPage />} />
    <Route path="/mock" element={<MockPage />} /><Route path="/mock/:id" element={<MockPage />} />
    <Route path="/progress" element={<ProgressPage />} />
    <Route path="/settings" element={<SettingsPage />} /><Route path="*" element={<EmptyState title="页面不存在" description="请从导航进入已有页面。" />} />
  </Routes><footer className="main-footer">IC Design Practice · 原创与公开题源分类展示</footer></main></div></>;
}
