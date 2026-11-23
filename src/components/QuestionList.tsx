import { Link } from 'react-router-dom';
import type { Question } from '../domain/question-schema';
import { useLearning } from '../storage/LearningContext';
import { sourceLabel, typeLabels } from './QuestionContent';

export function QuestionRows({ items }: { items: Question[] }) {
  const { state } = useLearning();
  return <div className="question-list">{items.map((question) => {
    const progress = state.progress.find((p) => p.questionId === question.id);
    return <Link className="question-row panel" key={question.id} to={`/practice/${encodeURIComponent(question.id)}`}><div><span className="badge">{typeLabels[question.type]}</span><span className="source-tag">{sourceLabel(question)}</span></div><h2>{question.title}</h2>{question.source.company && <p>参考笔经：{question.source.company} {question.source.graduationCohort}</p>}<div className="card-bottom"><span>{question.tags.join(' · ')}</span><span>{progress?.hasUnresolvedMistake ? '待巩固' : progress?.independentlyPracticed ? '已练习 · 可重做' : '开始练习'}</span></div></Link>;
  })}</div>;
}
