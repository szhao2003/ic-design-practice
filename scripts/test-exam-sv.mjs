import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

export async function checkExamSV(questions, icarusAvailable) {
  const cases = [
    {id:'CLASS-0001', engine:'verilator', expected:['RESULT=14 1']},
    {id:'CLASS-0002', engine:'verilator', expected:['UP=1 1','RESULT=0 1 23']},
    {id:'FORK-0001', engine:'iverilog', expected:['FIRST=4 1 0','RESULT=9 1 1']},
    {id:'FORK-0002', engine:'iverilog', expected:['RESULT=3 9']},
  ];
  const verilatorAvailable = !spawnSync('verilator',['--version'],{stdio:'ignore'}).error;
  const optional = process.argv.includes('--if-available');
  for(const item of cases) {
    const q=questions.find(q=>q.id===`ADAPTED-EXAMSV-${item.id}`);
    const code=q?.promptMd.match(/```systemverilog\s*\n([\s\S]*?)```/)?.[1];
    if(!code?.includes('module tb;') || !code.includes('$finish;'))throw Error(`${item.id}: missing published test program`);
    const available=item.engine==='verilator'?verilatorAvailable:icarusAvailable;
    if(!available){if(!optional)throw Error(`${item.id}: ${item.engine} required`);console.log(`SKIP ${item.id}: ${item.engine} unavailable; published source extracted only.`);continue;}
    const directory=path.resolve('.rtl-build/exam-sv',item.id);
    await mkdir(directory,{recursive:true});
    const source=path.join(directory,'case.sv');await writeFile(source,code);
    const executable=path.join(directory,item.engine==='verilator'?'Vtb':'case.vvp');
    const args=item.engine==='verilator'
      ? ['--binary','--timing','-Wno-fatal','--top-module','tb','--Mdir',directory,'-j','2',source]
      : ['-g2012','-s','tb','-o',executable,source];
    const compiled=spawnSync(item.engine,args,{encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
    if(compiled.error || compiled.status!==0)throw Error(`${item.id} compile failed: ${compiled.stderr || compiled.error?.message}`);
    const result=spawnSync(item.engine==='verilator'?executable:'vvp',item.engine==='verilator'?[]:[executable],{encoding:'utf8',timeout:15000});
    const lines=(result.stdout??'').split(/\r?\n/).filter(line=>/^(RESULT|UP|FIRST)=/.test(line));
    if(result.error || result.status!==0 || JSON.stringify(lines)!==JSON.stringify(item.expected))throw Error(`${item.id}: expected ${item.expected}, got ${result.stdout || result.stderr}`);
    console.log(`${item.id} (${item.engine}) exact published program PASS: ${lines.join('; ')}`);
  }
  const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
  const shell=questions.find(q=>q.id==='ADAPTED-EXAMSV-SHELL-0001')?.promptMd.match(/```bash\s*\n([\s\S]*?)```/)?.[1];
  if(!shell)throw Error('Missing published Bash script');
  await mkdir('.rtl-build/exam-sv',{recursive:true});
  const script=path.resolve('.rtl-build/exam-sv/forward.sh');await writeFile(script,shell);
  const result=spawnSync(bash,[script,'run dir','-top','cpu core'],{encoding:'utf8',timeout:15000});
  const expected='first=<run dir>\nn=2\narg=<-top>\narg=<cpu core>';
  if(result.error || result.status!==0 || result.stdout.trim().replaceAll('\r','')!==expected)throw Error(`Bash positional parameters differ: ${result.stdout || result.stderr || result.error?.message}`);
  console.log('EXAMSV Bash: exact published script and spaced arguments PASS.');
}
