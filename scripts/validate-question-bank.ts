import { readdir, readFile } from 'node:fs/promises';
import { questionBankSchema } from '../src/domain/question-schema';
import { topics } from '../src/data/topics';

const directory = new URL('../src/data/questions/', import.meta.url);
const files = (await readdir(directory)).filter((name) => name.endsWith('.json')).sort();
const entries: unknown[] = [];
for (const file of files) {
  const data: unknown = JSON.parse(await readFile(new URL(file, directory), 'utf8'));
  if (!Array.isArray(data)) throw new Error(`${file} 必须包含题目数组`);
  entries.push(...data);
}
const result = questionBankSchema.safeParse(entries);
if (!result.success) {
  console.error(result.error.issues);
  process.exitCode = 1;
} else {
  const verified = result.data.filter((question) => question.reviewStatus === 'verified');
  console.log(`题库结构校验通过：${files.length} 个文件，${result.data.length} 道题，${verified.length} 道可练题。`);
  for (const topic of topics) console.log(`${topic.id} ${topic.name}: ${verified.filter((q) => q.topicId === topic.id).length}`);
  if (process.argv.includes('--release')) {
    const minimums = { numeric: 4, rtl_coding: 2, waveform_analysis: 2 };
    const requiredTypes = ['single_choice', 'multiple_choice', 'true_false', 'numeric', 'short_answer', 'rtl_coding', 'waveform_analysis'];
    const adapted = verified.filter((q) => q.source.questionFidelity === 'topic_only_reconstruction').length;
    const targetCounts = [7, 9, 8, 8, 6, 6, 6];
    const missingTopics = targetCounts.some((count, index) => verified.filter((q) => q.topicId === String(index + 1).padStart(2, '0')).length < count);
    if (verified.length < 50 || adapted < 6 || missingTopics || requiredTypes.some((type) => !verified.some((q) => q.type === type)) || Object.entries(minimums).some(([type, min]) => verified.filter((q) => q.type === type).length < min)) {
      console.error('正式 V1 内容门槛未达到：需七专题 50 道、至少 6 道考点改编，并满足各题型最低数量。');
      process.exitCode = 1;
    }
  }
}
