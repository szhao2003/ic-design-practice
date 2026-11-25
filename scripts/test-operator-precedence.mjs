import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

export async function checkOperatorPrecedence(questions, simulate) {
  const cases = JSON.parse(await readFile('scripts/operator-precedence-cases.json', 'utf8'));
  const published = questions.filter(q => q.id.startsWith('ADAPTED-OPPREC-'));
  if (cases.length !== 8 || new Set(cases.map(c => c.id)).size !== cases.length || published.length !== cases.length) throw new Error('Operator precedence case coverage mismatch');
  if (simulate) await mkdir('.rtl-build/operator-precedence', { recursive: true });
  let runs = 0;
  for (const item of cases) {
    const question = published.find(q => q.id === item.id);
    const code = question?.promptMd.match(/```systemverilog\s*\n([\s\S]*?)```/)?.[1];
    const original = `y = ${item.expression};`;
    if (question?.type !== 'numeric' || !code?.includes(original) || !question.explanationMd.includes(item.grouped) || question.expectedValue === item.alternativeValue) throw new Error(`${item.id}: expression, grouping, or contrast fixture mismatch`);
    if (!simulate) continue;
    for (const [label, expression, expected] of [['original', item.expression, question.expectedValue], ['grouped', item.grouped, question.expectedValue], ['alternative', item.alternative, item.alternativeValue]]) {
      const source = `.rtl-build/operator-precedence/${item.id}-${label}.sv`;
      const executable = `${source}.vvp`;
      // Original is exactly the published fenced module. Contrasts retain its types/context.
      await writeFile(source, code.replace(original, `y = ${expression};`));
      const compiled = spawnSync('iverilog', ['-g2012', '-s', 'expr', '-o', executable, source], { encoding: 'utf8', timeout: 30000 });
      if (compiled.error || compiled.status !== 0) throw new Error(`${item.id}/${label}: compile failed: ${compiled.error?.message ?? compiled.stderr}`);
      const result = spawnSync('vvp', [executable], { encoding: 'utf8', timeout: 30000 });
      const values = [...(result.stdout ?? '').matchAll(/^RESULT=(\d+)\s*$/gm)].map(m => Number(m[1]));
      if (result.error || result.status !== 0 || values.length !== 1 || values[0] !== expected) throw new Error(`${item.id}/${label}: expected ${expected}, got ${result.stdout ?? result.error?.message}`);
      runs++;
    }
  }
  console.log(simulate ? `Operator precedence: 8 exact published modules + 8 explicit groupings + 8 contrasting groupings PASS (${runs} simulations).` : 'Operator precedence: 8 published expression/fixture checks PASS; HDL simulation not executed locally.');
}
