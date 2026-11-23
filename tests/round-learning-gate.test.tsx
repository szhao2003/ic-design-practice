import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RoundLearningGate } from '../src/components/RoundLearningGate';
import { createRound, revealAnswer, saveDraft, selfGrade, submitAutomatic } from '../src/domain/practice';
import { single, manual, at, later } from './fixtures';

const render = (round = createRound('new', single, at)) => renderToStaticMarkup(<RoundLearningGate round={round} disabled={false} onReveal={() => {}}>PRIVATE_OLD_NOTE_AND_ANSWER</RoundLearningGate>);
describe('重做前的历史与笔记保护', () => {
  it('新轮次、已输入草稿和刷新恢复的回答中轮次都不渲染旧资料', () => {
    const round = createRound('new', single, at);
    expect(render(round)).not.toContain('PRIVATE_OLD_NOTE_AND_ANSWER');
    expect(render(saveDraft(round, ['B']))).not.toContain('PRIVATE_OLD_NOTE_AND_ANSWER');
    expect(render(structuredClone(round))).toContain('本轮按辅助学习');
  });
  it('正式提交后可见，重做创建新轮次再次隐藏', () => {
    const done = submitAutomatic(saveDraft(createRound('old', single, at), ['B']), later);
    expect(render(done)).toContain('PRIVATE_OLD_NOTE_AND_ANSWER');
    expect(render(createRound('redo', single, later))).not.toContain('PRIVATE_OLD_NOTE_AND_ANSWER');
  });
  it('主动提前查看留下辅助事件，人工 good 不计独立掌握', () => {
    const opened = revealAnswer(createRound('m', manual, at), later);
    expect(render(opened)).toContain('PRIVATE_OLD_NOTE_AND_ANSWER');
    const graded = selfGrade(opened, 'good', later);
    expect(graded.events.at(-1)).toMatchObject({ independent: false, effectiveGrade: 'partial' });
  });
});
