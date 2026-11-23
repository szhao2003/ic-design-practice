import { describe, expect, it } from 'vitest';
import { createRound, revealAnswer, saveDraft, selfGrade, submitAutomatic } from '../src/domain/practice';
import { addLocalCalendarDays, rebuildProgress } from '../src/domain/review';
import { single, manual, at, later } from './fixtures';

const autoRound = (id: string, answer = ['B']) => submitAutomatic(saveDraft(createRound(id, single, at), answer), later);

describe('练习轮次与独立作答', () => {
  it('一次正式提交只记一个事件，重复点击不改变结果', () => {
    const round = autoRound('round-1');
    expect(submitAutomatic(round, later)).toBe(round);
    expect(round.events).toHaveLength(1);
    expect(() => saveDraft(round, ['A'])).toThrow('锁定');
  });
  it('非法输入不形成正式记录', () => expect(() => submitAutomatic(createRound('empty', single, at), later)).toThrow());
  it('独立重做保留两次历史', () => expect(rebuildProgress([...autoRound('r1', ['A']).events, ...autoRound('r2').events])[0]).toMatchObject({ autoAttempts: 2, autoCorrect: 1 }));
  it('自动题草稿未提交直接揭示，只记录辅助事件', () => {
    const round = revealAnswer(saveDraft(createRound('reveal', single, at), ['B']), later);
    expect(round.events[0]).toMatchObject({ kind: 'revealed_without_submission', draft: ['B'] });
    expect(rebuildProgress(round.events)[0]).toMatchObject({ autoAttempts: 0, independentlyPracticed: false, consecutiveSuccesses: 0 });
    expect(revealAnswer(round, later)).toBe(round);
    expect(submitAutomatic(round, later)).toBe(round);
  });
  it('有草稿但未确认独立完成，人工 good 最高 partial', () => {
    const round = selfGrade(revealAnswer(saveDraft(createRound('assisted', manual, at), '已有草稿'), later), 'good', later);
    expect(round.events).toHaveLength(2);
    expect(round.events[1]).toMatchObject({ requestedGrade: 'good', effectiveGrade: 'partial', independent: false });
    expect(rebuildProgress(round.events)[0]).toMatchObject({ autoAttempts: 0, independentlyPracticed: false, consecutiveSuccesses: 0 });
  });
  it('先保存独立文字再揭示，good 计自评掌握，自动准确率不变', () => {
    const revealed = revealAnswer(saveDraft(createRound('manual', manual, at), '独立答案'), later, true);
    const round = selfGrade(revealed, 'good', later);
    expect(round.events).toHaveLength(1);
    expect(round.events[0]).toMatchObject({ answer: '独立答案', independent: true });
    expect(rebuildProgress(round.events)[0]).toMatchObject({ autoAttempts: 0, selfAssessments: 1, independentlyPracticed: true, consecutiveSuccesses: 1 });
    expect(selfGrade(round, 'again', later)).toBe(round);
    expect(() => saveDraft(revealed, '改写')).toThrow();
  });
  it('允许揭示前明确声明纸笔完成', () => {
    const round = selfGrade(revealAnswer(createRound('paper', manual, at), later, true, true), 'good', later);
    expect(round.events[0]).toMatchObject({ paperCompletedAt: later, independent: true });
  });
  it('空答案不能声称线上独立完成', () => expect(() => revealAnswer(saveDraft(createRound('empty', manual, at), '  '), later, true)).toThrow());
  it('揭示前不能自评', () => expect(() => selfGrade(createRound('early', manual, at), 'good', later)).toThrow());
  it('快照保留旧题和旧答案，原题后续修改不影响本轮', () => {
    const question = structuredClone(single);
    const round = saveDraft(createRound('history', question, at), ['B']);
    if (question.type !== 'single_choice') throw new Error('fixture');
    question.correctOptionIds = ['A']; question.contentVersion = 2; question.promptMd = '新版题面';
    const submitted = submitAutomatic(round, later);
    expect(submitted.snapshot.question.promptMd).not.toBe('新版题面');
    expect(submitted.events[0]).toMatchObject({ snapshotKey: `${single.id}@1`, result: { isCorrect: true } });
  });
  it('拒绝倒退时间和无时区时间', () => {
    expect(() => createRound('bad-time', single, '2026-11-22 12:00')).toThrow();
    expect(() => submitAutomatic(saveDraft(createRound('r', single, later), ['B']), at)).toThrow();
  });
});

describe('复习重建', () => {
  it('连对按 1/3/7/14/30/30 天调度', () => {
    const events = Array.from({ length: 6 }, (_, i) => autoRound(`r${i}`).events[0]);
    expect(events.map((_, i) => rebuildProgress(events.slice(0, i + 1))[0].reviewIntervalDays)).toEqual([1, 3, 7, 14, 30, 30]);
  });
  it('partial 清零但不清除旧错题；之后独立 good 才解决', () => {
    const wrong = autoRound('wrong', ['A']);
    const partial = selfGrade(revealAnswer(saveDraft(createRound('partial', manual, at), '独立答案'), later, true), 'partial', later);
    expect(rebuildProgress([...wrong.events, ...partial.events])[0]).toMatchObject({ consecutiveSuccesses: 0, hasUnresolvedMistake: true, reviewIntervalDays: 1 });
    const good = selfGrade(revealAnswer(saveDraft(createRound('zz-good', manual, at), '独立答案'), later, true), 'good', later);
    expect(rebuildProgress([...wrong.events, ...partial.events, ...good.events])[0].hasUnresolvedMistake).toBe(false);
  });
  it('again 与再次错误重置间隔，历史计数保留', () => {
    const again = selfGrade(revealAnswer(saveDraft(createRound('zz-again', manual, at), '独立答案'), later, true), 'again', later);
    expect(rebuildProgress([...autoRound('a').events, ...again.events])[0]).toMatchObject({ consecutiveSuccesses: 0, reviewIntervalDays: 1, hasUnresolvedMistake: true, autoAttempts: 1, selfAssessments: 1 });
  });
  it('重复导入同事件不重复计数，异内容同 ID 拒绝', () => {
    const events = autoRound('r').events;
    expect(rebuildProgress([...events, ...events])[0].autoAttempts).toBe(1);
    expect(() => rebuildProgress([...events, { ...events[0], at }])).toThrow('冲突');
  });
  it('纯揭示也安排复习，但不算正式练习或错误答案', () => {
    const events = revealAnswer(createRound('r', single, at), later).events;
    expect(rebuildProgress(events)[0]).toMatchObject({ reviewIntervalDays: 1, autoAttempts: 0, independentlyPracticed: false, hasUnresolvedMistake: false });
  });
  it('输入历史顺序不同，重建结果一致', () => {
    const a = submitAutomatic(saveDraft(createRound('r1', single, at), ['A']), at).events;
    const b = autoRound('r2').events;
    expect(rebuildProgress([...a, ...b])).toEqual(rebuildProgress([...b, ...a]));
  });
  it('日历加天跨月，保持当地钟点', () => {
    const start = new Date(2026, 0, 31, 10, 30);
    const next = new Date(addLocalCalendarDays(start.toISOString(), 1));
    expect([next.getMonth(), next.getDate(), next.getHours(), next.getMinutes()]).toEqual([1, 1, 10, 30]);
  });
});
