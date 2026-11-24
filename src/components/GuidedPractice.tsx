import { Link } from 'react-router-dom';
import type { GuidanceContent, PracticeRound } from '../domain/practice';
import { guidancePending } from '../domain/practice';
import { questionGuidance } from '../data/question-guidance';
import { questions } from '../data/question-bank';
import { RichText } from './QuestionContent';

export function GuidedPractice({ round, content, disabled, onStart, onAdvance }: { round: PracticeRound; content?: GuidanceContent; disabled: boolean; onStart: () => void; onAdvance: () => void }) {
  if (!round.guidance) return round.status === 'answering' && content ? <section className="panel guided-practice"><h2>卡住了？分步引导</h2><p>先看分析顺序，最后再看完整答案。开始后保留当前草稿，可在纸上继续推演；本轮按辅助学习记录，不累计独立掌握。</p><button className="button secondary" disabled={disabled} onClick={onStart}>开始分步引导（辅助学习）</button></section> : null;
  if (!guidancePending(round)) return <p className="notice">本轮已完成分步引导。请对照下方答案与自查清单评估理解，下次重做时再独立完成。</p>;
  return <section className="panel guided-practice" aria-labelledby="guidance-heading"><p className="eyebrow">GUIDED PRACTICE</p><h2 id="guidance-heading">分步引导 · 第 {round.guidance.currentStep + 1} / {round.guidance.steps.length} 步</h2><p>原草稿已保留。请在纸上尝试当前步骤，再继续下一步；完整答案和旧笔记暂时隐藏。</p>
    {round.guidance.steps.slice(0, round.guidance.currentStep + 1).map((step, index) => <section className="guidance-step" key={index}><h3>{index + 1}. {step.title}</h3><RichText text={step.promptMd} /></section>)}
    <button className="button primary" disabled={disabled} onClick={onAdvance}>{round.guidance.currentStep + 1 === round.guidance.steps.length ? '查看完整答案与自查清单' : '继续下一步引导'}</button>
  </section>;
}

export function GuidanceChecklist({ checks }: { checks?: string[] }) {
  return checks?.length ? <section className="panel guidance-checklist"><h2>本题自查清单</h2><p>逐项对照自己的推导。该清单帮助人工自评，不会自动检查代码或授予分数；有关键项不确定时先选“部分掌握”或“不会”。</p><ul>{checks.map(item => <li key={item}>{item}</li>)}</ul></section> : null;
}

export function GuidedQuestionLinks() {
  return <section className="panel"><h2>综合题分步引导</h2><p>这6道题提供逐步思路与答案后的自查清单。可先独立尝试，卡住后再进入辅助引导。</p><ul className="guided-question-links">{questionGuidance.map(item => {
    const q = questions.find(q => q.id === item.questionId && q.contentVersion === item.contentVersion);
    return q && <li key={q.id}><Link to={`/practice/${encodeURIComponent(q.id)}`}>{q.title}</Link></li>;
  })}</ul></section>;
}
