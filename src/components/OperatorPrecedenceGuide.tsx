export const precedenceRows = [
  ['一元运算', '+  -  !  ~  &  ~&  |  ~|  ^  ~^  ^~', '先分清一元归约与二元按位运算'],
  ['幂', '**', '左结合'],
  ['乘除取余', '*  /  %', '左结合'],
  ['加减', '+  -', '二元；左结合'],
  ['移位', '<<  >>  <<<  >>>', '左结合'],
  ['大小比较', '<  <=  >  >=', '表达式中的关系运算；左结合'],
  ['相等比较', '==  !=  ===  !==  ==?  !=?', '左结合'],
  ['按位与', '&', '二元；左结合'],
  ['按位异或 / 同或', '^  ~^  ^~', '二元；左结合'],
  ['按位或', '|', '二元；左结合'],
  ['逻辑与', '&&', '左结合'],
  ['逻辑或', '||', '左结合'],
  ['条件选择', '?:', '右结合'],
] as const;

export function OperatorPrecedenceGuide() {
  return <details className="panel precedence-guide"><summary>运算符优先级速查（常用表达式）</summary>
    <p>从上到下优先级降低，同一行同级。括号可以明确分组；优先级决定表达式怎样组合，不保证带副作用的操作数按某个时间顺序执行。</p>
    <div className="markdown-table" role="region" aria-label="SV常用运算符优先级" tabIndex={0}><table><thead><tr><th>类别</th><th>运算符</th><th>说明</th></tr></thead><tbody>{precedenceRows.map(([name, operators, note]) => <tr key={name}><td>{name}</td><td><code>{operators}</code></td><td>{note}</td></tr>)}</tbody></table></div>
    <p><code>&amp;a</code>是一元归约；<code>a &amp; b</code>是二元按位与，二者不在同一层级。<code>&lt;=</code>在关系表达式中与非阻塞赋值中的用法也应区分。</p>
    <p>此表选列常用RTL表达式运算符，未列赋值、成员访问或SVA序列/性质规则。加括号后仍需单独检查位宽、signed与X/Z规则。</p>
    <p className="source-note">依据 <a href="https://fpga.mit.edu/6205/_static/F25/documentation/1800-2017.pdf#page=258" target="_blank" rel="noreferrer">IEEE Std 1800-2017 §11.3.2、表11-2（MIT课程站点提供）</a>整理。</p>
  </details>;
}
