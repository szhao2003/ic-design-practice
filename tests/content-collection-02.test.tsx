import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { questions } from '../src/data/question-bank';
import { SourceDetails } from '../src/components/QuestionContent';
import { displayTag } from '../src/domain/source-presentation';
import { filterQuestions } from '../src/domain/question-filters';
import { emptyBackup } from '../src/storage/learning-store';
import { gradeAnswer } from '../src/domain/grading';

const get = (id: string) => questions.find(q => q.id === `ADAPTED-COLLECTION-${id}`)!;
describe('资料考点扩充与来源显示', () => {
  it('旧元数据保持可追溯，显示不再带汇编站点名称', () => {
    const old = questions.find(q => q.id === 'ADAPTED-YHC-LOGIC-0001')!;
    const note = old.source.note;
    const html = renderToStaticMarkup(<SourceDetails question={old} />);
    expect(html).not.toMatch(/YHCHub/);
    expect(html).toContain('Q36'); expect(html).toContain('www.yhchub.com');
    expect(old.source.note).toBe(note);
    expect(displayTag('YHCHub 考点改编')).toBe('公开资料考点改编');
  });
  it('统一标签能筛到新旧两批二十四题，原标签链接仍可匹配旧批', () => {
    const priorBatches=questions.filter(q=>!/^ADAPTED-(ADVANCED|FOUNDATION|TOOLSFPGA|CORE|SYSTEM|EXTENSION|CORE3|MINI|FOCUSED|INTEGRATION|BOUNDARY|SAMPLING|CODEC|BUSTIMING|VERIFYPOWER|ARCHTOOLS|STARTER|TIMINGSTART|OPPREC|EXAMBASE)-/.test(q.id));
    expect(filterQuestions(priorBatches, { tag: '公开资料考点改编' }, emptyBackup())).toHaveLength(24);
    expect(filterQuestions(questions, { tag: 'YHCHub 考点改编' }, emptyBackup())).toHaveLength(12);
    const batch = questions.filter(q => q.id.startsWith('ADAPTED-COLLECTION-'));
    expect(batch).toHaveLength(12);
    for (const q of batch) {
      expect(q.source.note).toMatch(/Q\d+/); expect(q.source.note).not.toMatch(/YHCHub/);
      expect(q.source.url).toContain('yhchub.com'); expect(q.source.company).toBeUndefined();
      expect(q.source).toMatchObject({ kind: 'practice_collection', evidenceGrade: 'C', questionFidelity: 'topic_only_reconstruction', sourceClaimVerification: 'checked' });
    }
  });
  it('时序预算分别按最大、最小延迟及实际沿计算', () => {
    const setup = (7.4 - 0.4) - (1.1 + 0.6 + 4.3 + 0.5);
    const hold = (0.4 + 0.15 + 0.22 + 0.13) - (0.9 + 0.12 + 0.04);
    const period = 5 * 1.4 + 0.7 + 0.3 + 0.4 + 0.2;
    for (const [id, value] of [['STA-0001', setup], ['STA-0002', hold], ['STA-0004', period]] as const) {
      expect(gradeAnswer(get(id), { raw: String(value), unit: 'ns' })).toMatchObject({ valid: true, isCorrect: true });
    }
  });
  it('MTBF 比值依照指数解析时间模型', () => {
    const ratio = Math.exp((0.4 + 0.1) / 0.05) / Math.exp(0.4 / 0.05);
    expect(gradeAnswer(get('CDC-0001'), { raw: String(ratio) })).toMatchObject({ valid: true, isCorrect: true });
    expect(gradeAnswer(get('CDC-0001'), { raw: '2' })).toMatchObject({ valid: true, isCorrect: false });
  });
  it('减法计数按有效使能递推，Johnson 指定初态轨道首次十步回归', () => {
    let down = 9;
    for (let i = 0; i < 300; i++) down = (down + 127) % 128;
    expect(gradeAnswer(get('RTL-0001'), { raw: String(down) })).toMatchObject({ valid: true, isCorrect: true });
    let johnson = 0, length = 0; const visited = new Set<number>();
    do { visited.add(johnson); johnson = ((johnson << 1) | (1 - ((johnson >> 4) & 1))) & 31; length++; } while (johnson !== 0 && length < 32);
    expect(length).toBe(10); expect(visited.size).toBe(10);
    expect(gradeAnswer(get('RTL-0002'), { raw: String(length) })).toMatchObject({ valid: true, isCorrect: true });
  });
  it('Gray 反解最低位与全部位异或一致', () => {
    let binary = 0, gray = 0b01110110;
    while (gray) { binary ^= gray; gray >>= 1; }
    expect(binary).toBe(0b01011011);
    expect(gradeAnswer(get('FIFO-0001'), Boolean(binary & 1))).toMatchObject({ valid: true, isCorrect: true });
  });
});
