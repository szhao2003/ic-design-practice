import { readFile, readdir, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const mapping = {
  saturating_credit4: 'ADAPTED-CORE3-RTL-0001',
  pulse_toggle_cdc: 'ADAPTED-RK26-CDC-0001', reset_release: 'ORIGINAL-CDC-0005',
  pipeline_adder: 'ADAPTED-RK26-RTL-0001', mod10_counter: 'ORIGINAL-RTL-0001',
  priority_arbiter: 'ORIGINAL-RTL-0002', prefix_mod5: 'ADAPTED-YHC-RTL-0002', popcount8: 'ADAPTED-YHC-RTL-0004',
  elastic_buffer8: 'ADAPTED-ADVANCED-RTL-0001', round_robin4: 'ADAPTED-ADVANCED-RTL-0002',
};
const directory = 'src/data/questions';
const questions = (await Promise.all((await readdir(directory)).filter(f=>f.endsWith('.json')).map(async f=>JSON.parse(await readFile(path.join(directory,f),'utf8'))))).flat();
const count = Object.keys(mapping).length;
for (const q of questions.filter(q=>q.reviewStatus==='verified' && q.type==='rtl_coding')) {
  if (!Object.values(mapping).includes(q.id)) throw new Error(`${q.id}: RTL 缺少维护侧仿真映射`);
}
// Always verify that the module tested is exactly the code shown to learners.
for (const [module,id] of Object.entries(mapping)) {
  const q = questions.find(q=>q.id===id);
  const code = q?.referenceAnswerMd.match(/```systemverilog\s*\n([\s\S]*?)```/)?.[1];
  const reference = await readFile(`rtl/reference/${module}.sv`,'utf8');
  if (code?.replaceAll('\r','').trim() !== reference.replaceAll('\r','').trim()) throw new Error(`${id}: 网页参考代码与仿真文件不一致`);
}
const available = ['iverilog','vvp'].every(tool=>!spawnSync(tool,['-V'],{stdio:'ignore'}).error);
if (!available) {
  if (!process.argv.includes('--if-available')) throw new Error('需要安装 Icarus Verilog (iverilog + vvp)，未执行 HDL 仿真。');
  console.log(`SKIP HDL 仿真：本机未安装 iverilog/vvp；${count} 份网页参考代码一致性检查通过。CI 使用严格模式。`);
} else {
  await mkdir('.rtl-build',{recursive:true});
  for (const module of Object.keys(mapping)) {
    const output = `.rtl-build/${module}.vvp`;
    for(const [tool,args] of [['iverilog',['-g2012','-s','tb','-o',output,`rtl/reference/${module}.sv`,`rtl/tb/${module}_tb.sv`]],['vvp',[output]]]) {
      const result=spawnSync(tool,args,{encoding:'utf8',timeout:30000});
      if(result.stdout) process.stdout.write(result.stdout);
      if(result.stderr) process.stderr.write(result.stderr);
      if(result.error || result.status!==0) throw new Error(`${module}: ${tool} 失败 (${result.error?.message ?? result.status})`);
    }
  }
  console.log(`RTL simulation: ${count}/${count} PASS (digital functional checks; not CDC/STA/silicon sign-off).`);
}
