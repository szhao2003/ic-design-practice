import { describe, expect, it } from 'vitest';
import { planBackupMerge, type BackupData, type MutableRecord } from '../src/domain/backup-merge';
import { createRound, saveDraft, submitAutomatic } from '../src/domain/practice';
import { createMock, finishMock, saveMockAnswer } from '../src/domain/mock-session';
import { canonical, snapshotQuestion } from '../src/domain/snapshots';
import { single, at, later } from './fixtures';

const empty = (): BackupData => ({ schemaVersion: 1, events: [], snapshots: [], records: [], sessions: [] });
const submitted = (): BackupData => {
  const round = submitAutomatic(saveDraft(createRound('r', single, at), ['B']), later);
  return { ...empty(), events: round.events, snapshots: [round.snapshot] };
};
const record = (updatedAt = at, value: MutableRecord['value'] = '笔记', deleted = false): MutableRecord => ({ id: single.id, namespace: 'notes', updatedAt, value, deleted });

describe('备份预检与合并规划', () => {
  it('重复导入不重复计数，预检不修改原始数据', () => {
    const local = submitted(); const before = structuredClone(local);
    const first = planBackupMerge(local, local);
    expect(local).toEqual(before);
    expect(first.ok).toBe(true);
    if (!first.ok) throw new Error('plan');
    expect(first.data.events).toHaveLength(1);
    expect(first.progress[0].autoAttempts).toBe(1);
    expect(planBackupMerge(first.data, local)).toEqual(first);
  });
  it('同 ID 异内容事件拒绝，整份本地输入不变', () => {
    const local = submitted(); const incoming = structuredClone(local);
    incoming.events[0].at = at;
    const before = structuredClone(local);
    expect(planBackupMerge(local, incoming)).toMatchObject({ ok: false, conflicts: [{ kind: 'event' }] });
    expect(local).toEqual(before);
  });
  it('同版本快照内容不一致必须拒绝', () => {
    const local = submitted(); const incoming = structuredClone(local);
    incoming.snapshots[0].question.promptMd = '偷偷改题';
    expect(planBackupMerge(local, incoming)).toMatchObject({ ok: false, conflicts: [{ kind: 'snapshot' }] });
  });
  it('题库已移除的题仍保留历史快照与记录', () => {
    const data = submitted(); data.snapshots[0].question.id = 'REMOVED-QUESTION';
    data.snapshots[0].key = 'REMOVED-QUESTION@1';
    data.events[0].questionId = 'REMOVED-QUESTION'; data.events[0].snapshotKey = 'REMOVED-QUESTION@1';
    expect(planBackupMerge(empty(), data)).toMatchObject({ ok: true, data: { snapshots: data.snapshots, events: data.events } });
  });
  it('缺失事件题面快照拒绝，不能丢弃旧记录', () => {
    const data = submitted(); data.snapshots = [];
    expect(planBackupMerge(empty(), data)).toMatchObject({ ok: false, conflicts: [{ kind: 'reference' }] });
  });
  it('笔记采用较新时间，删除标记防止旧备份复活内容', () => {
    const local = { ...empty(), records: [record(later, null, true)] };
    const incoming = { ...empty(), records: [record()] };
    expect(planBackupMerge(local, incoming)).toMatchObject({ ok: true, data: { records: [record(later, null, true)] } });
    expect(planBackupMerge(incoming, local)).toMatchObject({ ok: true, data: { records: [record(later, null, true)] } });
  });
  it('同时间戳笔记内容不同拒绝', () => expect(planBackupMerge({ ...empty(), records: [record(at, 'A')] }, { ...empty(), records: [record(at, 'B')] })).toMatchObject({ ok: false, conflicts: [{ kind: 'record' }] }));
  it('对象字段顺序不造成虚假冲突，数组顺序保留', () => {
    expect(canonical({ a: 1, b: 2 })).toBe(canonical({ b: 2, a: 1 }));
    expect(canonical(['A', 'B'])).not.toBe(canonical(['B', 'A']));
  });
  it('完成状态覆盖同一套卷的活动状态，与导入方向无关', () => {
    const { session, snapshots } = createMock('m', [single], at, later);
    const done = finishMock(session, snapshots, later).session;
    const local = { ...empty(), snapshots, sessions: [session] };
    const incoming = { ...empty(), snapshots, sessions: [done] };
    expect(planBackupMerge(local, incoming)).toMatchObject({ ok: true, data: { sessions: [done] } });
    expect(planBackupMerge(incoming, local)).toMatchObject({ ok: true, data: { sessions: [done] } });
  });
  it('活动会话不同答案、不同终态或不同 deadline 都必须报冲突', () => {
    const { session, snapshots } = createMock('m', [single], at, later);
    const local = { ...empty(), snapshots, sessions: [session] };
    const changed = saveMockAnswer(session, snapshots[0].key, ['B'], at);
    expect(planBackupMerge(local, { ...local, sessions: [changed] })).toMatchObject({ ok: false, conflicts: [{ kind: 'session' }] });
    const done = finishMock(session, snapshots, later).session;
    expect(planBackupMerge({ ...local, sessions: [done] }, { ...local, sessions: [{ ...done, status: 'submitted' }] }).ok).toBe(false);
    expect(planBackupMerge(local, { ...local, sessions: [{ ...done, deadlineAt: '2026-11-23T18:00:00.000Z' }] }).ok).toBe(false);
  });
  it('旧版和未来版必须先显式迁移，不能直接合并', () => {
    expect(planBackupMerge(empty(), { ...empty(), schemaVersion: 2 } as unknown as BackupData).ok).toBe(false);
    expect(planBackupMerge(empty(), { ...empty(), schemaVersion: 0 } as unknown as BackupData).ok).toBe(false);
  });
  it('快照与来源内容深拷贝，不共享外部引用', () => {
    const question = structuredClone(single); const snapshot = snapshotQuestion(question);
    question.options[0].textMd = '修改选项'; question.source.note = '修改来源';
    expect(snapshot.question).not.toEqual(question);
    expect(snapshot.question.source.note).toBeUndefined();
  });
});
