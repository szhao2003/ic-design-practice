import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

export async function checkDVFoundation(questions) {
  const available = !spawnSync('verilator', ['--version'], { stdio: 'ignore' }).error;
  for (const [tail, expected] of [
    ['QUEUE-0001', 'RESULT=20 2 7 10'],
    ['ARRAY-0001', 'RESULT=9 6 0 0 3 2'],
  ]) {
    const id = `ADAPTED-DVBASE-${tail}`;
    const q = questions.find(q => q.id === id);
    const code = q?.promptMd.match(/```systemverilog\s*\n([\s\S]*?)```/)?.[1];
    if (!code?.includes('module tb;') || !code.includes('$finish;')) throw Error(`${id}: missing published program`);
    if (!available) {
      if (!process.argv.includes('--if-available')) throw Error(`${id}: Verilator required`);
      console.log(`SKIP ${id}: Verilator unavailable; displayed program extracted only.`);
      continue;
    }
    const directory = path.resolve('.rtl-build/dv-foundation', tail);
    await mkdir(directory, { recursive: true });
    const source = path.join(directory, 'case.sv');
    await writeFile(source, code);
    const compiled = spawnSync('verilator', ['--binary', '--timing', '-Wno-fatal', '--top-module', 'tb', '--Mdir', directory, '-j', '2', source], { encoding: 'utf8', timeout: 120000, maxBuffer: 8 * 1024 * 1024 });
    if (compiled.error || compiled.status !== 0) throw Error(`${id}: ${compiled.stderr || compiled.error?.message}`);
    const result = spawnSync(path.join(directory, 'Vtb'), [], { encoding: 'utf8', timeout: 15000 });
    const lines = (result.stdout ?? '').split(/\r?\n/).filter(line => line.startsWith('RESULT='));
    if (result.error || result.status !== 0 || JSON.stringify(lines) !== JSON.stringify([expected])) throw Error(`${id}: expected ${expected}, got ${result.stdout || result.stderr}`);
    console.log(`${id}: exact displayed SV container program PASS.`);
  }
}
