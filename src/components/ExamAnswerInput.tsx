import type { Answer } from '../domain/grading';
import type { Question } from '../domain/question-schema';
import { RichText } from './QuestionContent';

export function ExamAnswerInput({ question, answer, disabled, onChange }: { question: Question; answer?: Answer; disabled: boolean; onChange: (answer: Answer) => void }) {
  if (question.type === 'single_choice' || question.type === 'multiple_choice') return <fieldset disabled={disabled}><legend>选择答案{question.type === 'multiple_choice' ? '（多选）' : '（单选）'}</legend>{question.options.map(option => <label className="answer-option" key={option.id}><input type={question.type === 'single_choice' ? 'radio' : 'checkbox'} name="exam-answer" checked={Array.isArray(answer) && answer.includes(option.id)} onChange={() => onChange(question.type === 'single_choice' ? [option.id] : Array.isArray(answer) && answer.includes(option.id) ? answer.filter(id => id !== option.id) : [...(Array.isArray(answer) ? answer : []), option.id])} /><strong>{option.id}</strong><RichText text={option.textMd} /></label>)}</fieldset>;
  if (question.type === 'true_false') return <fieldset disabled={disabled}><legend>选择正确或错误</legend>{[true, false].map(value => <label className="answer-option" key={String(value)}><input type="radio" name="exam-answer" checked={answer === value} onChange={() => onChange(value)} />{value ? '正确' : '错误'}</label>)}</fieldset>;
  if (question.type === 'numeric') {
    const numeric = typeof answer === 'object' && !Array.isArray(answer) ? answer : undefined;
    return <div className="numeric-answer"><div><label htmlFor="exam-number">计算结果</label><input id="exam-number" inputMode="decimal" disabled={disabled} value={numeric?.raw ?? ''} onChange={e => onChange({ raw: e.target.value, unit: numeric?.unit ?? question.defaultUnit })} /></div>{question.acceptedUnits && <div><label htmlFor="exam-unit">单位</label><select id="exam-unit" disabled={disabled} value={numeric?.unit ?? question.defaultUnit ?? ''} onChange={e => onChange({ raw: numeric?.raw ?? '', unit: e.target.value })}><option value="">请选择</option>{Object.keys(question.acceptedUnits).map(unit => <option key={unit}>{unit}</option>)}</select></div>}</div>;
  }
  return <><label htmlFor="exam-written">你的思路、代码或逐沿分析</label><textarea id="exam-written" rows={10} className={question.type === 'rtl_coding' ? 'code-input' : ''} disabled={disabled} value={typeof answer === 'string' ? answer : ''} onChange={e => onChange(e.target.value)} /><p className="muted">请在这里保存独立作答。交卷后对照参考答案自评，不自动判为正确或错误。</p></>;
}
