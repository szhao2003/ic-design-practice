import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const files=(await readdir('src/data/questions')).filter(f=>f.endsWith('.json'));
const questions=(await Promise.all(files.map(async f=>JSON.parse(await readFile(`src/data/questions/${f}`,'utf8'))))).flat();
const references={
  'ADAPTED-TOOLSFPGA-TOOLS-0001':'examples/python/slack_summary.py',
  'ADAPTED-CORE-DV-0003':'examples/python/read_scoreboard.py',
};
for(const [id,file] of Object.entries(references)){
  const question=questions.find(q=>q.id===id);
  const shown=question?.referenceAnswerMd.match(/```python\s*\n([\s\S]*?)```/)?.[1];
  const tested=await readFile(file,'utf8');
  if(shown?.replaceAll('\r','').trim()!==tested.replaceAll('\r','').trim())throw new Error(`${id}: Python 网页参考答案与测试文件不一致`);
}
const python=process.platform==='win32'?'python':'python3';
const result=spawnSync(python,['-B','tests/python_reference_test.py'],{stdio:'inherit',timeout:30000});
if(result.error||result.status!==0)throw new Error(`Python 参考代码测试失败：${result.error?.message??result.status}`);
console.log('Python references: 2 exact published functions + 12 runtime tests PASS.');
