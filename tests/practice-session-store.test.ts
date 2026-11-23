import 'fake-indexeddb/auto';
import { openDB } from 'idb';
import { afterEach, describe, expect, it } from 'vitest';
import { LearningStore } from '../src/storage/learning-store';
import { createRound, saveDraft, submitAutomatic } from '../src/domain/practice';
import { sessionDraftId } from '../src/domain/practice-session';
import { validateBackup } from '../src/storage/backup-schema';
import { single, at } from './fixtures';

const bank = [{ ...single, reviewStatus: 'verified' as const }, { ...single, id: 'TEST-SECOND', reviewStatus: 'verified' as const }];
const connections: LearningStore[] = [];
function make(name = crypto.randomUUID(), fault?: () => void) { const store = new LearningStore(name, fault); connections.push(store); return store; }
afterEach(async () => { await Promise.all(connections.splice(0).map((store) => store.close())); });
async function completeCurrent(store: LearningStore, id: string) {
  const start = await store.loadPracticeRound(id); const questionId = start.round.snapshot.question.id;
  const context = { sessionId: id, draftId: sessionDraftId(start.round.id) };
  const draft = await store.change(questionId, start, (r) => saveDraft(r, ['B']), context);
  await store.change(questionId, draft, (r) => submitAutomatic(r, new Date().toISOString()), context);
  return (await store.read()).data.practiceSessions!.find((s) => s.id === id)!;
}

describe('连续练习持久化与旧版兼容', () => {
  it('v1 数据库升级到 v2 保留原草稿、笔记和元数据', async () => {
    const name = crypto.randomUUID();
    const old = await openDB(name, 1, { upgrade(db) { for (const table of ['events', 'snapshots', 'records', 'sessions', 'progress', 'metadata']) db.createObjectStore(table); } });
    const round = createRound('old-round', bank[0], at);
    await old.put('records', { id: bank[0].id, namespace: 'drafts', value: { round, revision: 0 }, deleted: false, updatedAt: at }, `drafts/${bank[0].id}`);
    await old.put('snapshots', round.snapshot, round.snapshot.key);
    await old.put('records', { id: bank[0].id, namespace: 'notes', value: '升级前笔记', deleted: false, updatedAt: at }, `notes/${bank[0].id}`);
    await old.put('metadata', 7, 'revision'); old.close();
    const store = make(name); const state = await store.read();
    expect(state.revision).toBe(7); expect(state.data.practiceSessions).toEqual([]); expect(state.data.records).toHaveLength(2);
    expect((await store.begin(bank[0])).round.id).toBe('old-round');
  });
  it('空题、重复题、未审核题无法启动', async () => {
    const store = make(); await expect(store.startPractice([])).rejects.toThrow();
    await expect(store.startPractice([bank[0], bank[0]])).rejects.toThrow();
    await expect(store.startPractice([single])).rejects.toThrow();
  });
  it('固定题序与全部版本快照，草稿、当前位置关闭后可恢复', async () => {
    const store = make(); const session = await store.startPractice(bank, 'practice', { topic: '03' });
    const round = await store.loadPracticeRound(session.id);
    await store.change(bank[0].id, round, (r) => saveDraft(r, ['A']), { sessionId: session.id, draftId: sessionDraftId(round.round.id) });
    await store.close();
    expect((await store.loadPracticeRound(session.id)).round.draft).toEqual(['A']);
    expect((await store.read()).data.practiceSessions![0]).toMatchObject({ currentIndex: 0, questionKeys: session.questionKeys, filtersSnapshot: { topic: '03' } });
    expect((await store.read()).data.snapshots).toHaveLength(2);
  });
  it('未提交不能跳到下一题，上一题结果不被重算', async () => {
    const store = make(); const session = await store.startPractice(bank);
    await expect(store.movePractice(session, 1)).rejects.toThrow('请先提交');
    const answered = await completeCurrent(store, session.id);
    const second = await store.movePractice(answered, 1);
    const back = await store.movePractice(second, -1);
    expect(back.currentIndex).toBe(0); expect((await store.loadPracticeRound(session.id)).round.status).toBe('complete');
    expect((await store.read()).data.events).toHaveLength(1);
  });
  it('完成两题后形成终态与两条记录，重复完成不重复计数', async () => {
    const store = make(); const session = await store.startPractice(bank);
    await store.movePractice(await completeCurrent(store, session.id), 1);
    const done = await store.movePractice(await completeCurrent(store, session.id), 1);
    expect(done.status).toBe('completed');
    await expect(store.movePractice(done, 1)).rejects.toThrow('其他页面');
    expect((await store.read()).data.events).toHaveLength(2);
    expect(validateBackup(JSON.parse(await store.exportJSON())).practiceSessions![0].status).toBe('completed');
  });
  it('独立单题草稿不会被连续练习覆盖', async () => {
    const store = make(); const standalone = await store.begin(bank[0]);
    await store.change(bank[0].id, standalone, (r) => saveDraft(r, ['A']));
    const session = await store.startPractice(bank); await completeCurrent(store, session.id);
    expect((await store.begin(bank[0])).round.draft).toEqual(['A']);
  });
  it('移动后旧页面不能继续改上一题，也不能重复前进', async () => {
    const store = make(); const session = await store.startPractice(bank);
    const expected = await completeCurrent(store, session.id); const oldRound = await store.loadPracticeRound(session.id);
    await store.movePractice(expected, 1);
    await expect(store.movePractice(expected, 1)).rejects.toThrow();
    await expect(store.change(bank[0].id, oldRound, (r) => r, { sessionId: session.id, draftId: sessionDraftId(oldRound.round.id) })).rejects.toThrow('位置已变化');
  });
  it('连续练习创建故障时，快照、草稿与会话全部回滚', async () => {
    const store = make(undefined, () => { throw new Error('injected'); }); const before = await store.read();
    await expect(store.startPractice(bank)).rejects.toThrow('injected'); expect(await store.read()).toEqual(before);
  });
  it('导出、清空、覆盖恢复保留题序、当前位置和作答', async () => {
    const store = make(); const session = await store.startPractice(bank);
    await store.movePractice(await completeCurrent(store, session.id), 1);
    const before = (await store.read()).data; const backup: unknown = JSON.parse(await store.exportJSON());
    await store.clear(); await store.applyImport(await store.previewImport(backup, 'replace', bank.map((q) => q.id)));
    expect((await store.read()).data).toEqual(before); expect((await store.loadPracticeRound(session.id)).round.snapshot.question.id).toBe(bank[1].id);
  });
  it('活动 session 进度冲突明确拒绝，不静默覆盖', async () => {
    const store = make(); const session = await store.startPractice(bank); const old: unknown = JSON.parse(await store.exportJSON());
    await store.movePractice(await completeCurrent(store, session.id), 1);
    await expect(store.previewImport(old, 'merge', bank.map((q) => q.id))).rejects.toThrow('导入冲突');
  });
  it('完全相同的连续练习备份重复导入不重复计数', async () => {
    const store = make(); const session = await store.startPractice(bank); await completeCurrent(store, session.id);
    const backup: unknown = JSON.parse(await store.exportJSON());
    for (let i = 0; i < 2; i++) await store.applyImport(await store.previewImport(backup, 'merge', bank.map((q) => q.id)));
    expect((await store.read()).data.events).toHaveLength(1); expect((await store.read()).data.practiceSessions).toHaveLength(1);
  });
  it('没有新增字段的旧版 schemaVersion=1 备份仍能恢复', async () => {
    const store = make(); await store.begin(bank[0]); const old = JSON.parse(await store.exportJSON()); delete old.practiceSessions;
    await store.clear(); await store.applyImport(await store.previewImport(old, 'replace', [bank[0].id]));
    expect((await store.read()).data.practiceSessions).toEqual([]); expect((await store.begin(bank[0])).round.snapshot.question.id).toBe(bank[0].id);
  });
  it('同一页面保存第二题草稿后，仍可用原位置导航上一题', async () => {
    const store = make(); const session = await store.startPractice(bank);
    const second = await store.movePractice(await completeCurrent(store, session.id), 1);
    const draft = await store.loadPracticeRound(session.id);
    await store.change(bank[1].id, draft, (r) => saveDraft(r, ['A']), { sessionId: session.id, draftId: sessionDraftId(draft.round.id) });
    expect((await store.movePractice(second, -1)).currentIndex).toBe(0);
  });
});
