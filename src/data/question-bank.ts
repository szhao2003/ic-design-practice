import { questionBankSchema } from '../domain/question-schema';

const files = import.meta.glob('./questions/*.json', { eager: true, import: 'default' });
const entries = Object.entries(files).sort(([a], [b]) => a.localeCompare(b)).flatMap(([path, content]) => {
  if (!Array.isArray(content)) throw new Error(`题库文件必须是数组：${path}`);
  return content;
});

export const allQuestions = questionBankSchema.parse(entries);
export const questions = allQuestions.filter((question) => question.reviewStatus === 'verified');
