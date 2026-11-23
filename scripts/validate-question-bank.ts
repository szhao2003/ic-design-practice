import { readdir, readFile } from 'node:fs/promises';
import { questionBankSchema } from '../src/domain/question-schema';
import { topics } from '../src/data/topics';
import { inspectTeachingContent } from './content-quality';
import { access } from 'node:fs/promises';

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
  const quality = inspectTeachingContent(result.data);
  for (const question of result.data) {
    const texts = [question.promptMd, question.explanationMd, ...('referenceAnswerMd' in question ? [question.referenceAnswerMd] : [])];
    for (const text of texts) for (const match of text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
      const src = match[1];
      if (/^(?:https?:)?\/\//.test(src)) { quality.warnings.push(`${question.id}: 外部配图不会加载，请改用本地资源`); continue; }
      const asset = new URL(`../public/${src.replace(/^\//, '')}`, import.meta.url);
      if (!asset.href.startsWith(new URL('../public/', import.meta.url).href)) { quality.errors.push(`${question.id}: 配图路径越界`); continue; }
      try { await access(asset); } catch { quality.errors.push(`${question.id}: 配图不存在 ${src}`); }
    }
  }
  quality.warnings.forEach(warning => console.warn(`Review Warning: ${warning}`));
  quality.errors.forEach(error => console.error(error));
  if (quality.errors.length) process.exitCode = 1;
  console.log(`教学辅助检查：${quality.errors.length} 错误，${quality.warnings.length} 待人工判断的提醒（不代表技术认证）。`);
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
