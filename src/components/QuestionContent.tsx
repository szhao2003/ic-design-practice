import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Question } from '../domain/question-schema';
import { displaySourceNote } from '../domain/source-presentation';
import { useRef, useState, type ReactNode } from 'react';

function CodeBlock({ children, canCopy }: { children: ReactNode; canCopy: boolean }) {
  const ref = useRef<HTMLPreElement>(null);
  const [message, setMessage] = useState('');
  return <div className="code-block">{canCopy && <div className="code-toolbar"><button className="button secondary" onClick={() => { void navigator.clipboard.writeText(ref.current?.textContent ?? '').then(() => setMessage('已复制代码'), () => setMessage('复制失败，可手动选择代码')); }}>复制代码</button><span role="status">{message}</span></div>}<pre ref={ref}>{children}</pre></div>;
}

export const typeLabels: Record<Question['type'], string> = { single_choice: '单选', multiple_choice: '多选', true_false: '判断', numeric: '数值计算', short_answer: '简答 · 自评', rtl_coding: 'RTL · 自评', waveform_analysis: '波形 · 自评' };
export function sourceLabel(question: Question) {
  if (question.source.questionFidelity === 'topic_only_reconstruction' && question.source.kind === 'practice_collection') return '公开资料考点改编｜非原题';
  return { self_authored: '原创专项题', topic_only_reconstruction: '公开笔经考点改编｜非原题', paraphrased_from_source: '公开笔经题目转述', verbatim_verified: '可核实原题摘录' }[question.source.questionFidelity];
}
export function RichText({ text, copyCode = false }: { text: string; copyCode?: boolean }) {
  return <div className="rich-text"><Markdown skipHtml remarkPlugins={[remarkGfm]} components={{ pre: ({ children }) => <CodeBlock canCopy={copyCode}>{children}</CodeBlock>, a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer">{children}</a>, table: ({ children }) => <div className="markdown-table" role="region" aria-label="题目表格" tabIndex={0}><table>{children}</table></div>, img: ({ src, alt }) => src && !/^(?:https?:)?\/\//.test(src) ? <figure className={src.includes('/diagrams/content-v15/') ? 'timing-figure' : undefined}><img src={src.startsWith('/') ? `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}` : src} alt={alt || '题目配图'} /></figure> : <span>{alt || '外部配图未加载'}</span> }}>{text}</Markdown></div>;
}
export function SourceDetails({ question }: { question: Question }) {
  const source = question.source;
  return <details className="source-details"><summary>{sourceLabel(question)} · 来源说明</summary><p>{source.questionFidelity === 'self_authored' ? '本项目原创专项练习，与具体公司的考试题面无关。' : displaySourceNote(source.note)}</p>
    {source.company && <p>参考笔经：{source.company} {source.graduationCohort}</p>}
    {source.evidenceGrade !== 'none' && <p>来源证据等级：{source.evidenceGrade}（不代表原题认证或答案审核等级）</p>}
    {(source.url || source.inspiredByUrl) && <p><a href={source.url || source.inspiredByUrl} target="_blank" rel="noreferrer">查看原始资料</a> · {source.sourceClaimVerification === 'checked' ? '来源链接已核对' : '来源链接未再次核验'}</p>}
  </details>;
}
export function ReferenceAnswer({ question }: { question: Question }) {
  return <section className="panel explanation"><h2>答案与解析</h2>
    {(question.type === 'single_choice' || question.type === 'multiple_choice') && <p><strong>正确选项：{question.correctOptionIds.join('、')}</strong></p>}
    {question.type === 'true_false' && <p><strong>答案：{question.correctValue ? '正确' : '错误'}</strong></p>}
    {question.type === 'numeric' && <p><strong>参考值：{question.expectedValue} {question.unit}</strong></p>}
    {'referenceAnswerMd' in question && <RichText text={question.referenceAnswerMd} copyCode />}
    {!('referenceAnswerMd' in question && question.referenceAnswerMd === question.explanationMd) && <RichText text={question.explanationMd} copyCode />}
    {(question.type === 'single_choice' || question.type === 'multiple_choice') && <><h3>逐项判断</h3><div className="option-explanations">{question.options.map(option => <div key={option.id}><strong>{option.id} · {question.correctOptionIds.includes(option.id) ? '正确' : '错误'}</strong><RichText text={question.optionExplanations[option.id]} copyCode /></div>)}</div></>}
    {'rubric' in question && <><h3>自评要点 · 对照代码或思路自查</h3><ul>{question.rubric.map(item => <li key={item}>{item}</li>)}</ul></>}
    <h3>易错点</h3><ul>{question.commonMistakes.map((item) => <li key={item}>{item}</li>)}</ul>
  </section>;
}
