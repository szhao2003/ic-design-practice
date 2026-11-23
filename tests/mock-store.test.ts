import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LearningStore } from '../src/storage/learning-store';
import { validateBackup, storedRoundSchema } from '../src/storage/backup-schema';
import { buildMockPaper, mockRedirect, mockReviewDraftId } from '../src/domain/mock-session';
import { single as baseSingle, manual as baseManual, numeric as baseNumeric } from './fixtures';
const single = { ...baseSingle, reviewStatus: 'verified' as const };
const manual = { ...baseManual, id: 'TEST-MANUAL', reviewStatus: 'verified' as const };

const stores: LearningStore[] = [];
function make(name = crypto.randomUUID(), fail?: () => void) { const store = new LearningStore(name, fail); stores.push(store); return store; }
afterEach(async () => { await Promise.all(stores.splice(0).map(s => s.close())); vi.useRealTimers(); });

describe('模拟考试持久化与恢复', () => {
  it('组卷只选审核题、不重复、不凑数，并验证输入', () => {
    expect(buildMockPaper([single, single, manual, { ...single, id: 'UNREVIEWED', reviewStatus: 'needs_review' }], 100, () => 0)).toHaveLength(2);
    expect(() => buildMockPaper([single], 0)).toThrow();
    expect(() => buildMockPaper([single], 1.5)).toThrow();
  });
  it('保存答题与位置，关闭后恢复；交卷前不生成历史', async () => {
    const store = make(); const session = await store.startExam([single, manual]);
    await store.saveExam(session, { key: session.questionKeys[0], answer: ['B'], currentIndex: 1 });
    await store.close(); const restored = (await store.read()).data;
    expect(restored.sessions[0]).toMatchObject({ currentIndex: 1, answers: { [session.questionKeys[0]]: ['B'] }, status: 'active' });
    expect(restored.events).toEqual([]);
    expect(() => validateBackup(restored)).not.toThrow();
    await expect(store.startExam([single])).rejects.toThrow('当前模拟');
    await expect(store.gradeExamManual(session.id, session.questionKeys[1], 'good')).rejects.toThrow('先交卷');
  });
  it('交卷同事务保存结果和历史，未答计考试零分；重复交卷幂等', async () => {
    const store = make(); const session = await store.startExam([single, { ...single, id: 'SECOND' }, manual]);
    const saved = await store.saveExam(session, { key: session.questionKeys[0], answer: ['B'] });
    const result = await store.finishExam(session.id, true, saved);
    expect(result).toMatchObject({ status: 'submitted', autoCorrect: 1, autoTotal: 2 });
    expect(result.unansweredKeys).toHaveLength(2);
    expect(await store.finishExam(session.id, true, session)).toEqual(result);
    const data = await store.read();
    expect(data.data.events).toHaveLength(1);
    expect(data.progress[0].autoAttempts).toBe(1);
    expect(validateBackup(JSON.parse(await store.exportJSON())).sessions[0]).toEqual(result);
  });
  it('交卷事务失败时，状态、事件和统计全部回滚', async () => {
    let fail = false; const store = make(undefined, () => { if (fail) throw new Error('disk-full'); });
    const session = await store.startExam([single]);
    await store.saveExam(session, { key: session.questionKeys[0], answer: ['B'] });
    const before = await store.read(); fail = true;
    await expect(store.finishExam(session.id, true)).rejects.toThrow('disk-full');
    expect(await store.read()).toEqual(before);
    fail = false; await store.finishExam(session.id, true);
    expect((await store.read()).data.events).toHaveLength(1);
  });
  it('答案保存失败不覆盖上次成功草稿', async () => {
    let fail = false; const store = make(undefined, () => { if (fail) throw new Error('storage-failed'); });
    const session = await store.startExam([single]);
    const saved = await store.saveExam(session, { key: session.questionKeys[0], answer: ['B'] });
    fail = true;
    await expect(store.saveExam(saved, { key: session.questionKeys[0], answer: ['A'] })).rejects.toThrow('storage-failed');
    expect((await store.read()).data.sessions[0]).toEqual(saved);
    fail = false; expect((await store.finishExam(session.id, true)).autoCorrect).toBe(1);
  });
  it('非法数值草稿交卷计零分并保留原输入，不创建普通提交', async () => {
    const numeric = { ...baseNumeric, reviewStatus: 'verified' as const };
    const store = make(); const session = await store.startExam([numeric]);
    await store.saveExam(session, { key: session.questionKeys[0], answer: { raw: '3junk' } });
    const result = await store.finishExam(session.id, true);
    expect(result).toMatchObject({ autoCorrect: 0, autoTotal: 1, unansweredKeys: [] });
    const state = await store.read();
    expect(result.invalidAnswers).toHaveLength(1); expect(state.data.events).toHaveLength(0);
    expect(() => validateBackup(state.data)).not.toThrow();
  });
  it('人工题按交卷时作答自评，保留原考试结果；备份可恢复且不重复计数', async () => {
    const store = make(); const session = await store.startExam([manual]);
    await store.saveExam(session, { key: session.questionKeys[0], answer: '独立解答' });
    const finished = await store.finishExam(session.id, true);
    const graded = await store.gradeExamManual(session.id, session.questionKeys[0], 'partial');
    expect(graded.round).toMatchObject({ status: 'complete', independent: true, independentAnswer: '独立解答' });
    expect(await store.gradeExamManual(session.id, session.questionKeys[0], 'good')).toEqual(graded);
    const before = await store.read(); expect(before.data.sessions[0]).toEqual(finished);
    expect(before.data.events).toHaveLength(1); expect(before.progress[0].autoAttempts).toBe(0);
    const exported = JSON.parse(await store.exportJSON()); expect(() => validateBackup(exported)).not.toThrow();
    const restored = make(); await restored.applyImport(await restored.previewImport(exported, 'replace', [manual.id]));
    expect((await restored.read()).data).toEqual(before.data);
    const record = exported.records.find((r: { id: string }) => r.id === mockReviewDraftId(graded.round.id));
    const altered = storedRoundSchema.parse(record.value); altered.round.draft = '偷换答案'; record.value = altered;
    expect(() => validateBackup(exported)).toThrow('交卷时');
  });
  it('跨标签页旧答案和旧交卷请求不能覆盖新答案', async () => {
    const name = crypto.randomUUID(); const a = make(name), b = make(name);
    const session = await a.startExam([single]);
    const saved = await a.saveExam(session, { key: session.questionKeys[0], answer: ['B'] });
    await expect(b.saveExam(session, { key: session.questionKeys[0], answer: ['A'] })).rejects.toThrow('其他页面');
    await expect(b.finishExam(session.id, true, session)).rejects.toThrow('其他页面');
    expect((await b.finishExam(session.id, true, saved)).autoCorrect).toBe(1);
  });
  it('重新打开已到期考试按截止时间结算，拒绝截止后的答案', async () => {
    vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-11-23T12:00:00.000Z'));
    const store = make(); const session = await store.startExam([single, manual], 1);
    const saved = await store.saveExam(session, { key: session.questionKeys[0], answer: ['B'] });
    await store.close(); vi.setSystemTime(new Date('2026-11-23T12:01:00.000Z'));
    const expired = await store.saveExam(saved, { key: session.questionKeys[0], answer: ['A'] });
    expect(expired).toMatchObject({ status: 'expired', completedAt: session.deadlineAt, autoCorrect: 1 });
    vi.setSystemTime(new Date('2026-11-23T13:00:00.000Z'));
    expect((await store.read()).data.events).toHaveLength(1);
    expect((await store.finishExam(session.id, true)).status).toBe('expired');
  });
  it('首页启动读取会恢复超时；导入过期卷同样恢复', async () => {
    vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-11-23T12:00:00.000Z'));
    const store = make(); const session = await store.startExam([single], 1);
    await store.saveExam(session, { key: session.questionKeys[0], answer: ['B'] });
    const backup = JSON.parse(await store.exportJSON()); await store.close();
    vi.setSystemTime(new Date('2026-11-23T13:00:00.000Z'));
    expect((await store.read()).data.sessions[0]).toMatchObject({ status: 'expired', autoCorrect: 1 });
    const other = make(); await other.applyImport(await other.previewImport(backup, 'replace', [single.id]));
    const restored = await other.read(); expect(restored.data.sessions[0].completedAt).toBe(session.deadlineAt); expect(restored.data.events).toHaveLength(1);
  });
  it('考试保护覆盖直接 URL，交卷后恢复站内入口', async () => {
    const store = make(); const session = await store.startExam([single]);
    for (const path of ['/', '/questions', '/practice/'+single.id, '/review', '/settings', '/mock/old-result']) expect(mockRedirect([session], path)).toBe(`/mock/${session.id}`);
    expect(mockRedirect([session], `/mock/${session.id}`)).toBeUndefined();
    expect(mockRedirect([await store.finishExam(session.id, true)], '/review')).toBeUndefined();
  });
});

