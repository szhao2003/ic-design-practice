import type { Question } from '../src/domain/question-schema';

export function inspectTeachingContent(questions: Question[]) {
  const errors: string[] = [], warnings: string[] = [];
  const explanations = new Map<string, string[]>();
  for (const q of questions) {
    const fields = [q.promptMd, q.explanationMd, ...('referenceAnswerMd' in q ? [q.referenceAnswerMd] : []), ...('optionExplanations' in q ? Object.values(q.optionExplanations) : [])];
    if (q.commonMistakes.some(s => s.includes('忽略题目给出的位宽、时间点或前提'))) errors.push(`${q.id}: 旧占位易错点`);
    for (const text of fields) {
      if ((text.match(/^```/gm)?.length ?? 0) % 2) errors.push(`${q.id}: Markdown 代码围栏未闭合`);
      if (/其他选项不满足要求|其余不正确/.test(text)) warnings.push(`${q.id}: 可能存在泛化选项解释，请人工复查`);
    }
    if (q.type === 'rtl_coding') {
      const code = q.referenceAnswerMd.match(/```systemverilog\s*\n([\s\S]*?)```/)?.[1];
      if (!code || !/\bmodule\s+\w+/.test(code) || !/\bendmodule\b/.test(code) || !/\/\/[^\n]+/.test(code)) errors.push(`${q.id}: 参考 RTL 缺完整模块或逻辑注释`);
    }
    if (q.explanationMd.trim().length < 100) warnings.push(`${q.id}: 解析较短，请人工判断教学是否充分`);
    const same = explanations.get(q.explanationMd.trim()) ?? [];
    same.push(q.id); explanations.set(q.explanationMd.trim(), same);
  }
  for (const ids of explanations.values()) if (ids.length > 1) warnings.push(`${ids.join(', ')}: 完全重复解析，请复查`);
  return { errors, warnings };
}
