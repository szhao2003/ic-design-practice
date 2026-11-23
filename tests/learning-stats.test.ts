import { describe, expect, it } from 'vitest';
import { buildLearningStats, learningEventLabel } from '../src/domain/learning-stats';
import { createRound, revealAnswer, saveDraft, selfGrade, submitAutomatic } from '../src/domain/practice';
import { createMock, finishMock, saveMockAnswer } from '../src/domain/mock-session';
import { single as baseSingle, manual as baseManual, at, later } from './fixtures';

const single = { ...baseSingle, reviewStatus: 'verified' as const };
const manual = { ...baseManual, id: 'MANUAL', topicId: '06', subtopicId: 'fsm', reviewStatus: 'verified' as const };
const now = Date.parse('2026-12-01T12:00:00.000Z');
const submit = (id: string, correct: boolean, question = single) => submitAutomatic(saveDraft(createRound(id, question, at), [correct ? 'B' : 'A']), later).events;

describe('学习进度的统计口径', () => {
  it('没有记录时显示真实零值，未审核题不进入分母', () => {
    const report = buildLearningStats([single, manual, { ...single, id: 'DRAFT', reviewStatus: 'needs_review' }], [], now);
    expect(report.summary).toMatchObject({ totalQuestions: 2, practicedQuestions: 0, autoAttempts: 0, autoCorrect: 0, dueQuestions: 0 });
    expect(report.needsWork).toEqual([]); expect(report.byTopic.size).toBe(2); expect(report.byTopic.has('15')).toBe(false);
  });
  it('覆盖按题去重，正确率按有效提交次数累加而非平均专题百分比', () => {
    const another = { ...single, id: 'LOGIC', topicId: '01', subtopicId: 'boolean-kmap' };
    const events = [...submit('a', true), ...submit('b', false), ...submit('c', false), ...submit('d', true, another)];
    const report = buildLearningStats([single, another], events, now);
    expect(report.summary).toMatchObject({ practicedQuestions: 2, autoCorrect: 2, autoAttempts: 4 });
    expect(report.byTopic.get('03')).toMatchObject({ autoCorrect: 1, autoAttempts: 3, practicedQuestions: 1 });
    expect(report.byTopic.get('01')).toMatchObject({ autoCorrect: 1, autoAttempts: 1 });
  });
  it('草稿和直接揭示不增加独立覆盖、自动提交次数', () => {
    const round = saveDraft(createRound('r', single, at), ['B']);
    expect(buildLearningStats([single], round.events, now).summary.practicedQuestions).toBe(0);
    const report = buildLearningStats([single], revealAnswer(round, later).events, now);
    expect(report.summary).toMatchObject({ practicedQuestions: 0, autoAttempts: 0, needsWorkQuestions: 1, dueQuestions: 1, unresolvedQuestions: 0 });
    expect(learningEventLabel(report.recent[0])).toBe('辅助学习 · 直接揭示');
  });
  it('独立人工自评单独统计，辅助 good 不能算作独立掌握', () => {
    const independent = selfGrade(revealAnswer(saveDraft(createRound('manual', manual, at), '独立思路'), later, true), 'good', later);
    const first = buildLearningStats([manual], independent.events, now);
    expect(first.summary).toMatchObject({ autoAttempts: 0, practicedQuestions: 1, independentManualAssessments: 1, assistedManualAssessments: 0, manualMasteredQuestions: 1 });
    const assisted = selfGrade(revealAnswer(createRound('assist', manual, later), later), 'good', later);
    const second = buildLearningStats([manual], assisted.events, now);
    expect(second.summary).toMatchObject({ practicedQuestions: 0, independentManualAssessments: 0, assistedManualAssessments: 1, manualMasteredQuestions: 0, needsWorkQuestions: 1 });
    expect(learningEventLabel(assisted.events.at(-1)!)).toBe('辅助人工自评 · 部分掌握');
  });
  it('最新揭示会清除当前掌握标记，但不丢失过去独立覆盖与自评次数', () => {
    const independent = selfGrade(revealAnswer(saveDraft(createRound('m', manual, at), '思路'), at, true), 'good', at);
    const revealed = revealAnswer(createRound('later', manual, later), later);
    const report = buildLearningStats([manual], [...independent.events, ...revealed.events], now);
    expect(report.summary).toMatchObject({ practicedQuestions: 1, independentManualAssessments: 1, manualMasteredQuestions: 0, needsWorkQuestions: 1 });
  });
  it('旧版本记录保留旧判分，未知/移除题历史不污染当前题库', () => {
    const events = [...submit('old', true), ...submit('removed', false, { ...single, id: 'REMOVED' })];
    const updated = { ...single, contentVersion: 2, correctOptionIds: ['A'], topicId: '01', subtopicId: 'boolean-kmap' };
    const report = buildLearningStats([updated], events, now);
    expect(report.summary).toMatchObject({ totalQuestions: 1, autoAttempts: 1, autoCorrect: 1 });
    expect(report.byTopic.get('01')?.autoCorrect).toBe(1);
    expect(report.recent[0].snapshotKey).toBe(`${single.id}@1`);
    expect(report.archivedQuestionCount).toBe(1);
  });
  it('同 ID 相同事件去重，不同内容冲突不能静默统计', () => {
    const events = submit('same', true);
    expect(buildLearningStats([single], [...events, ...events], now).summary.autoAttempts).toBe(1);
    expect(() => buildLearningStats([single], [events[0], { ...events[0], at }], now)).toThrow('冲突');
  });
  it('到期含边界；重练正确解除错题，历史仍保留', () => {
    const wrong = submit('wrong', false);
    const before = buildLearningStats([single], wrong, Date.parse(later));
    const dueAt = Date.parse(before.items[0].progress!.nextReviewAt);
    expect(buildLearningStats([single], wrong, dueAt - 1).summary.dueQuestions).toBe(0);
    expect(buildLearningStats([single], wrong, dueAt).summary.dueQuestions).toBe(1);
    const correct = submitAutomatic(saveDraft(createRound('right', single, '2026-11-23T18:01:00.000Z'), ['B']), '2026-11-23T18:01:00.000Z').events;
    const report = buildLearningStats([single], [...wrong, ...correct], now);
    expect(report.summary).toMatchObject({ unresolvedQuestions: 0, needsWorkQuestions: 0, autoAttempts: 2, autoCorrect: 1 });
    expect(report.recent).toHaveLength(2);
  });
  it('模拟卷未答不进入普通分母；人工待自评不默认掌握', () => {
    const exam = createMock('exam', [single, { ...single, id: 'UNANSWERED' }, manual], at);
    let session = saveMockAnswer(exam.session, exam.snapshots[0].key, ['B'], at);
    session = saveMockAnswer(session, exam.snapshots[2].key, '独立作答', at);
    const finished = finishMock(session, exam.snapshots, later, true);
    const report = buildLearningStats(exam.snapshots.map(s => s.question), finished.events, now);
    expect(finished.session).toMatchObject({ autoTotal: 2, autoCorrect: 1 });
    expect(report.summary).toMatchObject({ totalQuestions: 3, practicedQuestions: 1, autoAttempts: 1, autoCorrect: 1, independentManualAssessments: 0 });
    expect(report.recent).toHaveLength(1);
  });
});
