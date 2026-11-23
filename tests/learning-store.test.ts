import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { LearningStore } from '../src/storage/learning-store';
import { validateBackup } from '../src/storage/backup-schema';
import { revealAnswer, saveDraft, selfGrade, submitAutomatic } from '../src/domain/practice';
import { single, manual } from './fixtures';
import { createMock, saveMockAnswer } from '../src/domain/mock-session';

const stores: LearningStore[] = [];
function make(name = crypto.randomUUID(), fail?: () => void) { const store = new LearningStore(name, fail); stores.push(store); return store; }
afterEach(async () => { await Promise.all(stores.splice(0).map((store) => store.close())); });
async function answerOne(store: LearningStore) {
  const started = await store.begin(single);
  const draft = await store.change(single.id, started, (r) => saveDraft(r, ['B']));
  return store.change(single.id, draft, (r) => submitAutomatic(r, new Date().toISOString()));
}

describe('真实 IndexedDB API 的存储与原子恢复', () => {
  it('保存草稿、关闭连接后恢复；未提交不计练习次数', async () => {
    const store = make(); const started = await store.begin(single);
    await store.change(single.id, started, (r) => saveDraft(r, ['A'])); await store.close();
    expect((await store.begin(single)).round.draft).toEqual(['A']);
    expect((await store.read()).data.events).toEqual([]);
  });
  it('提交同时保存事件、快照和复习；重复点击不重复计数', async () => {
    const store = make(); const saved = await answerOne(store);
    await store.change(single.id, saved, (r) => submitAutomatic(r, new Date().toISOString()));
    const state = await store.read();
    expect(state.data.events).toHaveLength(1); expect(state.data.snapshots).toHaveLength(1);
    expect(state.progress[0]).toMatchObject({ autoAttempts: 1, autoCorrect: 1 });
  });
  it('重做新轮次保留旧答案与旧快照', async () => {
    const store = make(); await answerOne(store);
    const newQuestion = { ...single, contentVersion: 2, correctOptionIds: ['A'] };
    const restarted = await store.begin(newQuestion, true);
    expect(restarted.round.snapshot.key).toBe(`${single.id}@2`);
    const state = await store.read(); expect(state.data.snapshots).toHaveLength(2);
    expect(state.data.events[0]).toMatchObject({ snapshotKey: `${single.id}@1`, result: { isCorrect: true } });
  });
  it('第二个标签页拿旧 revision 不能覆盖新草稿', async () => {
    const name = crypto.randomUUID(); const a = make(name); const b = make(name);
    const old = await a.begin(single); const alsoOld = await b.begin(single);
    await a.change(single.id, old, (r) => saveDraft(r, ['B']));
    await expect(b.change(single.id, alsoOld, (r) => saveDraft(r, ['A']))).rejects.toThrow('其他页面');
    expect((await b.begin(single)).round.draft).toEqual(['B']);
  });
  it('提交在写入中途失败：事件、复习、草稿、版本全回滚', async () => {
    let fail = false; const store = make(undefined, () => { if (fail) throw new Error('injected storage failure'); });
    const started = await store.begin(single); const drafted = await store.change(single.id, started, (r) => saveDraft(r, ['B']));
    const before = await store.read(); fail = true;
    await expect(store.change(single.id, drafted, (r) => submitAutomatic(r, new Date().toISOString()))).rejects.toThrow('injected');
    expect(await store.read()).toEqual(before);
    fail = false; await store.change(single.id, drafted, (r) => submitAutomatic(r, new Date().toISOString()));
    expect((await store.read()).data.events).toHaveLength(1);
  });
  it('完整导出、清空、导入，恢复作答/草稿/笔记/收藏/纠错', async () => {
    const store = make(); await answerOne(store);
    await store.saveRecord('notes', single.id, '我的理解'); await store.saveRecord('bookmarks', single.id, true);
    await store.saveRecord('issues', single.id, { flags: ['source_check_needed'], comment: '来源待核实' });
    const before = (await store.read()).data; const backup: unknown = JSON.parse(await store.exportJSON());
    await store.clear(); expect((await store.read()).data.events).toEqual([]);
    await store.applyImport(await store.previewImport(backup, 'replace', [single.id]));
    expect((await store.read()).data).toEqual(before);
  });
  it('相同备份合并两次，历史和正确率不翻倍', async () => {
    const store = make(); await answerOne(store); const backup: unknown = JSON.parse(await store.exportJSON());
    for (let i = 0; i < 2; i++) await store.applyImport(await store.previewImport(backup, 'merge', [single.id]));
    expect((await store.read()).progress[0]).toMatchObject({ autoAttempts: 1, autoCorrect: 1 });
  });
  it('导入预览后新增笔记，旧计划不得覆盖新数据', async () => {
    const store = make(); const preview = await store.previewImport(JSON.parse(await store.exportJSON()), 'replace', []);
    await store.saveRecord('notes', single.id, '刚保存的笔记');
    await expect(store.applyImport(preview)).rejects.toThrow('重新预检');
    expect((await store.read()).data.records[0].value).toBe('刚保存的笔记');
  });
  it('覆盖导入中途失败，清空和所有写入均回滚', async () => {
    let fail = false; const store = make(undefined, () => { if (fail) throw new Error('import interrupted'); });
    await answerOne(store); const before = await store.read();
    const preview = await store.previewImport({ schemaVersion: 1, events: [], snapshots: [], records: [], sessions: [] }, 'replace', []);
    fail = true; await expect(store.applyImport(preview)).rejects.toThrow('interrupted');
    expect(await store.read()).toEqual(before);
  });
  it('同 ID 异内容备份拒绝，现有数据完全不变', async () => {
    const store = make(); await answerOne(store); const backup = JSON.parse(await store.exportJSON());
    backup.events[0].at = '2026-11-20T12:00:00.000Z'; backup.records = [];
    const before = await store.read(); await expect(store.previewImport(backup, 'merge', [single.id])).rejects.toThrow('冲突');
    expect(await store.read()).toEqual(before);
  });
  it('未知题目保留快照和历史，不要求当前题库中存在', async () => {
    const store = make(); await answerOne(store); const backup: unknown = JSON.parse(await store.exportJSON());
    const preview = await store.previewImport(backup, 'replace', []);
    expect(preview.unknownIds).toEqual([single.id]); await store.applyImport(preview);
    expect((await store.read()).data.events).toHaveLength(1);
  });
  it('辅助揭示与纸笔独立自评均能往返恢复', async () => {
    const store = make(); const started = await store.begin(manual);
    const revealed = await store.change(manual.id, started, (r) => revealAnswer(r, new Date().toISOString()));
    await store.change(manual.id, revealed, (r) => selfGrade(r, 'good', new Date().toISOString()));
    expect(() => validateBackup(JSON.parse('null'))).toThrow();
    const backup: unknown = JSON.parse(await store.exportJSON()); expect(validateBackup(backup).events).toHaveLength(2);
    const next = await store.begin(manual, true);
    const paper = await store.change(manual.id, next, (r) => revealAnswer(r, new Date().toISOString(), true, true));
    await store.change(manual.id, paper, (r) => selfGrade(r, 'good', new Date().toISOString()));
    expect(validateBackup(JSON.parse(await store.exportJSON())).events).toHaveLength(3);
  });
  it('损坏文件、未来版本与虚构判分不能导入', async () => {
    const store = make(); await answerOne(store); const backup = JSON.parse(await store.exportJSON());
    expect(() => validateBackup({ ...backup, schemaVersion: 99 })).toThrow();
    expect(() => validateBackup({ ...backup, schemaVersion: 0 })).toThrow();
    expect(() => validateBackup({ schemaVersion: 1 })).toThrow();
    backup.events[0].result.isCorrect = false;
    expect(() => validateBackup(backup)).toThrow('判分结果');
  });
  it('较新的取消收藏与清空笔记不会被旧备份复活', async () => {
    const store = make(); await store.saveRecord('notes', single.id, '旧笔记'); await store.saveRecord('bookmarks', single.id, true);
    const old: unknown = JSON.parse(await store.exportJSON());
    await store.saveRecord('notes', single.id, '', true); await store.saveRecord('bookmarks', single.id, false);
    await store.applyImport(await store.previewImport(old, 'merge', []));
    const records = (await store.read()).data.records;
    expect(records.find((r) => r.namespace === 'notes')?.deleted).toBe(true);
    expect(records.find((r) => r.namespace === 'bookmarks')?.value).toBe(false);
  });
  it('导入已超时活动模拟卷时，按原 deadline 幂等交卷', async () => {
    const store = make(); const start = new Date(Date.now() - 120_000).toISOString(); const deadline = new Date(Date.now() - 60_000).toISOString();
    const exam = createMock('expired-import', [single], start, deadline);
    exam.session = saveMockAnswer(exam.session, exam.snapshots[0].key, ['B'], start);
    const input = { schemaVersion: 1, events: [], snapshots: exam.snapshots, records: [], sessions: [exam.session] };
    const preview = await store.previewImport(input, 'merge', [single.id]);
    expect(preview.data.sessions[0]).toMatchObject({ status: 'expired', completedAt: deadline, autoCorrect: 1 });
    await store.applyImport(preview);
    await store.applyImport(await store.previewImport(input, 'merge', [single.id]));
    expect((await store.read()).data.events).toHaveLength(1);
  });
  it('辅助揭示不能在备份中改成独立 good', async () => {
    const store = make(); const started = await store.begin(manual);
    const revealed = await store.change(manual.id, started, (r) => revealAnswer(r, new Date().toISOString()));
    await store.change(manual.id, revealed, (r) => selfGrade(r, 'good', new Date().toISOString()));
    const backup = JSON.parse(await store.exportJSON());
    const event = backup.events.find((e: { kind: string }) => e.kind === 'self_graded');
    event.independent = true; event.answer = '后来补的答案'; event.effectiveGrade = 'good';
    expect(() => validateBackup(backup)).toThrow('辅助揭示');
  });
  it('覆盖导入同 revision 但不同草稿后，旧页面也不能覆写', async () => {
    const store = make(); const start = await store.begin(single);
    const expected = await store.change(single.id, start, (r) => saveDraft(r, ['B']));
    const backup = JSON.parse(await store.exportJSON());
    backup.records.find((r: { namespace: string }) => r.namespace === 'drafts').value.round.draft = ['A'];
    await store.applyImport(await store.previewImport(backup, 'replace', [single.id]));
    await expect(store.change(single.id, expected, (r) => saveDraft(r, ['C']))).rejects.toThrow('其他页面');
    expect((await store.begin(single)).round.draft).toEqual(['A']);
  });
  it('带删除标记的草稿恢复后，可以安全开始新的轮次', async () => {
    const store = make(); await store.begin(single);
    const backup = JSON.parse(await store.exportJSON());
    const draft = backup.records.find((r: { namespace: string }) => r.namespace === 'drafts');
    draft.deleted = true; draft.value = null;
    await store.applyImport(await store.previewImport(backup, 'replace', [single.id]));
    expect((await store.begin(single)).round.status).toBe('answering');
  });
});
