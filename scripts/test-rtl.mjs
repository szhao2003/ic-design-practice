import { readFile, readdir, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const mapping = {
  gray_codec:'ADAPTED-CODEC-GRAY-0001', even_divider:'ADAPTED-CODEC-DIV-0001',
  sample_edges:'ADAPTED-SAMPLING-EDGE-0001',
  debounce_cfg:'ADAPTED-BOUNDARY-DEBOUNCE-0001',
  async_fifo_gray:'ADAPTED-INTEGRATION-FIFO-0001', axil_regs2:'ADAPTED-INTEGRATION-AXIL-0001',
  seq1101_valid:'ADAPTED-FOCUSED-RTL-SEQ-0001', sync_fifo4x8:'ADAPTED-FOCUSED-RTL-FIFO-0001',
  divide3_half:'ADAPTED-FOCUSED-RTL-DIV-0001', stream_second8:'ADAPTED-FOCUSED-RTL-MIN-0001',
  debounce3:'ADAPTED-FOCUSED-RTL-DEBOUNCE-0001',
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
const starterSnippets = [
  ['starter_enable4', 'ADAPTED-STARTER-RTL-0001', 'promptMd'],
  ['starter_tick_bug', 'ADAPTED-STARTER-RTL-0002', 'promptMd'],
  ['starter_tick_fixed', 'ADAPTED-STARTER-RTL-0002', 'referenceAnswerMd'],
];
for (const [module, id, field] of starterSnippets) {
  const q = questions.find(q => q.id === id);
  const shown = q?.[field]?.match(/```systemverilog\s*\n([\s\S]*?)```/)?.[1];
  const tested = await readFile(`rtl/review/${module}.sv`, 'utf8');
  if (shown?.replaceAll('\r', '').trim() !== tested.replaceAll('\r', '').trim()) throw new Error(`${id}: starter snippet differs from test source`);
}
const available = ['iverilog','vvp'].every(tool=>!spawnSync(tool,['-V'],{stdio:'ignore'}).error);
if (!available) {
  if (!process.argv.includes('--if-available')) throw new Error('需要安装 Icarus Verilog (iverilog + vvp)，未执行 HDL 仿真。');
  console.log(`SKIP HDL 仿真：本机未安装 iverilog/vvp；${count} 份网页参考代码及3段起步代码一致性检查通过。CI 使用严格模式。`);
} else {
  await mkdir('.rtl-build',{recursive:true});
  const cases=Object.keys(mapping).map(module=>({module,sources:[`rtl/reference/${module}.sv`,`rtl/tb/${module}_tb.sv`]}));
  cases.push({module:'source_review_rules',sources:['rtl/tb/source_review_rules_tb.sv']});
  cases.push({module:'parity_review',sources:['rtl/tb/parity_review_tb.sv']});
  cases.push({module:'event_reset_review',sources:['rtl/tb/event_reset_review_tb.sv']});
  cases.push({module:'fifo_capacity_review',sources:['rtl/reference/async_fifo_gray.sv','rtl/tb/fifo_capacity_review_tb.sv']});
  cases.push({module:'starter_review',sources:[...starterSnippets.map(([module])=>`rtl/review/${module}.sv`),'rtl/tb/starter_review_tb.sv']});
  for (const {module,sources} of cases) {
    const output = `.rtl-build/${module}.vvp`;
    for(const [tool,args] of [['iverilog',['-g2012','-s','tb','-o',output,...sources]],['vvp',[output]]]) {
      const result=spawnSync(tool,args,{encoding:'utf8',timeout:30000});
      if(result.stdout) process.stdout.write(result.stdout);
      if(result.stderr) process.stderr.write(result.stderr);
      if(module==='event_reset_review' && tool==='vvp' && !result.error && result.status===0) {
        const observations=result.stdout.split(/\r?\n/).filter(line=>/^(D0|D1|S0|D2) /.test(line));
        const expected=['D0 a=0 b=0','D1 a=0 b=0','S0 a=5 b=0','D2 a=5 b=0'];
        if(JSON.stringify(observations)!==JSON.stringify(expected)) throw new Error('display/strobe order or values differ');
      }
      if(result.error || result.status!==0) throw new Error(`${module}: ${tool} 失败 (${result.error?.message ?? result.status})`);
    }
  }
  console.log(`RTL simulation: ${count}/${count} references + language, parity, reset/event observation, FIFO capacity, and starter trace checks PASS (digital functional checks; not CDC/STA/silicon sign-off).`);
}
