import type { LearningEvent } from './practice';
import type { MockSession } from './mock-session';
import { assertTimestamp, canonical, type QuestionSnapshot } from './snapshots';
import { rebuildProgress, type ReviewProgress } from './review';

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type MutableRecord = {
  id: string;
  namespace: 'notes' | 'bookmarks' | 'issues' | 'drafts' | 'preferences';
  updatedAt: string;
  deleted: boolean;
  value: JsonValue;
};
export type BackupData = { schemaVersion: 1; events: LearningEvent[]; snapshots: QuestionSnapshot[]; records: MutableRecord[]; sessions: MockSession[] };
export type MergeConflict = { kind: 'schema' | 'event' | 'snapshot' | 'record' | 'session' | 'reference'; id: string };
export type MergePlan = { ok: false; conflicts: MergeConflict[] } | { ok: true; data: BackupData; progress: ReviewProgress[] };

// 输入须先通过导入边界的完整 schema 校验；本函数只预检/规划，不写入数据库。
export function planBackupMerge(local: BackupData, incoming: BackupData): MergePlan {
  const conflicts: MergeConflict[] = [];
  if (local.schemaVersion !== 1 || incoming.schemaVersion !== 1) return { ok: false, conflicts: [{ kind: 'schema', id: 'schemaVersion' }] };
  function immutable<T>(left: T[], right: T[], key: (item: T) => string, kind: MergeConflict['kind']): T[] {
    const items = new Map<string, T>();
    for (const item of [...left, ...right]) {
      const id = key(item);
      if (items.has(id) && canonical(items.get(id)) !== canonical(item)) conflicts.push({ kind, id });
      else items.set(id, structuredClone(item));
    }
    return [...items.values()];
  }
  const events = immutable(local.events, incoming.events, (item) => item.id, 'event');
  const snapshots = immutable(local.snapshots, incoming.snapshots, (item) => item.key, 'snapshot');
  const records = new Map<string, MutableRecord>();
  for (const record of [...local.records, ...incoming.records]) {
    assertTimestamp(record.updatedAt);
    const key = `${record.namespace}/${record.id}`;
    const previous = records.get(key);
    if (!previous || Date.parse(record.updatedAt) > Date.parse(previous.updatedAt)) records.set(key, structuredClone(record));
    else if (Date.parse(record.updatedAt) === Date.parse(previous.updatedAt) && canonical(previous) !== canonical(record)) conflicts.push({ kind: 'record', id: key });
  }
  const sessions = new Map<string, MockSession>();
  for (const session of [...local.sessions, ...incoming.sessions]) {
    const previous = sessions.get(session.id);
    if (!previous || canonical(previous) === canonical(session)) { sessions.set(session.id, structuredClone(session)); continue; }
    const sameExam = canonical(previous.questionKeys) === canonical(session.questionKeys) && previous.deadlineAt === session.deadlineAt && previous.startedAt === session.startedAt;
    if (sameExam && previous.status === 'active' && session.status !== 'active') sessions.set(session.id, structuredClone(session));
    else if (!(sameExam && previous.status !== 'active' && session.status === 'active')) conflicts.push({ kind: 'session', id: session.id });
  }
  for (const snapshot of snapshots) {
    if (snapshot.key !== `${snapshot.question.id}@${snapshot.question.contentVersion}`) conflicts.push({ kind: 'snapshot', id: snapshot.key });
  }
  for (const event of events) {
    const snapshot = snapshots.find((item) => item.key === event.snapshotKey);
    if (!snapshot || snapshot.question.id !== event.questionId) conflicts.push({ kind: 'reference', id: event.id });
  }
  for (const session of sessions.values()) {
    for (const key of session.questionKeys) if (!snapshots.some((item) => item.key === key)) conflicts.push({ kind: 'reference', id: `${session.id}/${key}` });
  }
  if (conflicts.length) return { ok: false, conflicts };
  return { ok: true, data: { schemaVersion: 1, events, snapshots, records: [...records.values()], sessions: [...sessions.values()] }, progress: rebuildProgress(events) };
}
