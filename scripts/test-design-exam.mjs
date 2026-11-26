import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

// Read the displayed programs directly: test the actual question, not a copy.
export async function checkDesignExam(questions, available) {
  const expected = ['RESULT=1 1 1 1', 'RESULT=1xz0 1000 1 0', 'RESULT=ff 01 6d'];
  for (let i = 0; i < expected.length; i++) {
    const id = `ADAPTED-DESIGNEXAM-TYPE-000${i + 1}`;
    const q = questions.find(q => q.id === id);
    const code = q?.promptMd.match(/```systemverilog\s*\n([\s\S]*?)```/)?.[1];
    if (!code?.includes('module tb;') || !code.includes('$finish;')) throw Error(`${id}: missing published program`);
    if (!available) {
      if (!process.argv.includes('--if-available')) throw Error(`${id}: four-state Icarus simulator required`);
      console.log(`SKIP ${id}: Icarus unavailable; source extracted only.`);
      continue;
    }
    const directory = path.resolve('.rtl-build/design-exam', id);
    await mkdir(directory, { recursive: true });
    const source = path.join(directory, 'case.sv'), output = path.join(directory, 'case.vvp');
    await writeFile(source, code);
    const compiled = spawnSync('iverilog', ['-g2012', '-s', 'tb', '-o', output, source], { encoding: 'utf8', timeout: 30000 });
    if (compiled.error || compiled.status !== 0) throw Error(`${id}: ${compiled.stderr || compiled.error?.message}`);
    const run = spawnSync('vvp', [output], { encoding: 'utf8', timeout: 15000 });
    const lines = (run.stdout ?? '').split(/\r?\n/).filter(line => line.startsWith('RESULT='));
    if (run.error || run.status !== 0 || JSON.stringify(lines) !== JSON.stringify([expected[i]])) {
      throw Error(`${id}: expected ${expected[i]}, got ${run.stdout || run.stderr}`);
    }
    console.log(`${id}: exact published four-state program PASS.`);
  }
}
