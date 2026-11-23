import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReferenceAnswer, RichText } from '../src/components/QuestionContent';
import { manual } from './fixtures';

describe('解析 Markdown 显示', () => {
  it('真值表生成可访问表格，不再挤成普通段落', () => {
    const html = renderToStaticMarkup(<RichText text={'| A | Y |\n|---|---|\n| 0 | 1 |\n| 1 | 0 |'} />);
    expect(html).toContain('<table>'); expect(html).toContain('<th>A</th>');
    expect(html).toContain('<td>1</td>'); expect(html).toContain('aria-label="题目表格"');
  });
  it('围栏代码保持代码文本，不将其中的竖线解析为表格', () => {
    const html = renderToStaticMarkup(<RichText text={'```systemverilog\nassign y = a | b;\n```'} />);
    expect(html).toContain('language-systemverilog'); expect(html).toContain('assign y = a | b;');
    expect(html).not.toContain('<table>');
  });
  it('原始 HTML 和危险链接不因表格支持而执行', () => {
    const html = renderToStaticMarkup(<RichText text={'<script>alert(1)</script>\n\n[bad](javascript:alert(1))'} />);
    expect(html).not.toContain('<script>'); expect(html).not.toContain('href="javascript:');
  });
  it('相同的参考答案和解析只显示一次，仍保留自评和易错点', () => {
    const html = renderToStaticMarkup(<ReferenceAnswer question={{ ...manual, referenceAnswerMd: '唯一参考段落', explanationMd: '唯一参考段落' }} />);
    expect(html.match(/唯一参考段落/g)).toHaveLength(1);
    expect(html).toContain('自评要点'); expect(html).toContain('易错点');
  });
});
