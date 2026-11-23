import { Link } from 'react-router-dom';
import { questions } from '../data/question-bank';
import { useLearning } from '../storage/LearningContext';
import { storedRoundSchema } from '../storage/backup-schema';

export function Dashboard() {
  const { state } = useLearning();
  const activeIds = new Set(questions.map((q) => q.id));
  const progress = state.progress.filter((p) => activeIds.has(p.questionId));
  const due = progress.filter((p) => Date.parse(p.nextReviewAt) <= Date.now()).length;
  const attempted = progress.filter((p) => p.independentlyPracticed).length;
  const autoAttempts = progress.reduce((sum, p) => sum + p.autoAttempts, 0);
  const autoCorrect = progress.reduce((sum, p) => sum + p.autoCorrect, 0);
  const unfinished = state.data.records.filter((r) => r.namespace === 'drafts' && !r.deleted && activeIds.has(r.id)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).find((r) => storedRoundSchema.parse(r.value).round.status !== 'complete');
  return <><section className="hero"><p className="eyebrow">中国 IC 校招 · Digital Design / DV</p><h1>今天，从一次练习开始。</h1><p>继续未完成的题目，回顾错因，把理解留在自己的记录里。</p><div className="hero-actions"><Link className="button primary" to={unfinished ? `/practice/${encodeURIComponent(unfinished.id)}` : '/practice'}>{unfinished ? '继续上次练习' : '开始练习'}</Link><Link className="button secondary" to="/review?tab=due">今日待复习 · {due}</Link></div></section>
    <section className="metrics" aria-label="学习概况"><div><p>可练题目</p><strong>{questions.length}<small> 道</small></strong></div><div><p>独立练习过</p><strong>{attempted}<small> 道</small></strong></div><div><p>自动题正确率</p><strong>{autoAttempts ? `${Math.round(autoCorrect / autoAttempts * 100)}%` : '—'}</strong><p>{autoCorrect} / {autoAttempts} 次有效提交</p></div><div><p>待复习</p><strong>{due}<small> 道</small></strong></div></section>
    <div className="section-heading"><div><p className="eyebrow">YOUR WORKSPACE</p><h2>练习与回顾</h2></div><Link to="/topics">浏览全部 15 个知识专题</Link></div>
    <div className="action-grid"><Link className="panel" to="/practice"><h2>选择一道题开始</h2><p>当前提供 CDC 单选、STA 计算和 CDC 简答，提交后查看完整解析。</p></Link><Link className="panel" to="/review"><h2>错题与个人记录</h2><p>{progress.filter((p) => p.hasUnresolvedMistake).length} 道未解决错题；查看收藏、笔记与历史作答。</p></Link><Link className="panel" to="/settings"><h2>备份学习记录</h2><p>导出 JSON 保存到自己的设备，换浏览器后可以恢复。</p></Link></div>
    <p className="source-note">当前为分阶段版本，题库持续扩充。个人记录保存在当前浏览器，不会自动同步到其他设备。</p>
  </>;
}
