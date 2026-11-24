import { openDB, type DBSchema, type IDBPDatabase, type IDBPTransaction } from 'idb';
import { planBackupMerge, type BackupData, type JsonValue, type MutableRecord } from '../domain/backup-merge';
import type { Question } from '../domain/question-schema';
import { createRound, revealAnswer, selfGrade, type SelfGrade, type LearningEvent, type PracticeRound } from '../domain/practice';
import type { Answer } from '../domain/grading';
import { rebuildProgress, type ReviewProgress } from '../domain/review';
import { createMock, finishMock, saveMockAnswer, mockReviewDraftId, type MockSession } from '../domain/mock-session';
import { canonical, type QuestionSnapshot } from '../domain/snapshots';
import { storedRoundSchema, validateBackup, type StoredRound } from './backup-schema';
import { sessionDraftId, type PracticeSession } from '../domain/practice-session';

interface LearningDB extends DBSchema {
  events: { key: string; value: LearningEvent };
  snapshots: { key: string; value: QuestionSnapshot };
  records: { key: string; value: MutableRecord };
  sessions: { key: string; value: MockSession };
  practiceSessions: { key: string; value: PracticeSession };
  progress: { key: string; value: ReviewProgress };
  metadata: { key: string; value: number };
}
const tables = ['events', 'snapshots', 'records', 'sessions', 'practiceSessions', 'progress', 'metadata'] as const;
export const emptyBackup = (): BackupData => ({ schemaVersion: 1, events: [], snapshots: [], records: [], sessions: [] });
export type LearningState = { data: BackupData; revision: number; progress: ReviewProgress[] };
export type ImportPreview = { data: BackupData; mode: 'merge' | 'replace'; expectedRevision: number; unknownIds: string[] };

function recoverExpired(data: BackupData): BackupData {
  const events = [...data.events];
  const now = new Date().toISOString();
  const sessions = data.sessions.map((session) => {
    if (session.status !== 'active' || !session.deadlineAt || Date.parse(session.deadlineAt) > Date.parse(now)) return session;
    const result = finishMock(session, data.snapshots, now); events.push(...result.events); return result.session;
  });
  return validateBackup({ ...data, events, sessions });
}

export class LearningStore {
  private connection?: Promise<IDBPDatabase<LearningDB>>;
  constructor(private readonly name = 'ic-design-practice', private readonly beforeCommit?: () => void) {}
  private db() {
    this.connection ??= new Promise<IDBPDatabase<LearningDB>>((resolve, reject) => {
      let blocked = false;
      void openDB<LearningDB>(this.name, 2, {
        upgrade(db) { for (const table of tables) if (!db.objectStoreNames.contains(table)) db.createObjectStore(table); },
        blocking: () => { void this.close(); },
        blocked() { blocked = true; reject(new Error('数据库升级被其他页面阻止，请关闭旧页面后重试。')); },
      }).then((db) => { if (blocked) db.close(); else resolve(db); }, reject);
    }).catch((error: unknown) => { this.connection = undefined; throw error; });
    return this.connection;
  }
  async close() { const connection = this.connection; this.connection = undefined; (await connection)?.close(); }
  async read(): Promise<LearningState> {
    const db = await this.db();
    const tx = db.transaction(tables, 'readonly');
    const [events, snapshots, records, sessions, revision, practiceSessions] = await Promise.all([
      tx.objectStore('events').getAll(), tx.objectStore('snapshots').getAll(), tx.objectStore('records').getAll(), tx.objectStore('sessions').getAll(), tx.objectStore('metadata').get('revision'), tx.objectStore('practiceSessions').getAll(),
    ]);
    await tx.done;
    if (sessions.some(s => s.status === 'active' && s.deadlineAt && Date.parse(s.deadlineAt) <= Date.now())) {
      for (const session of sessions) if (session.status === 'active' && session.deadlineAt && Date.parse(session.deadlineAt) <= Date.now()) await this.finishExam(session.id);
      return this.read();
    }
    return { data: { schemaVersion: 1, events, snapshots, records, sessions, practiceSessions }, revision: revision ?? 0, progress: rebuildProgress(events) };
  }
  private async write<T>(work: (tx: IDBPTransaction<LearningDB, typeof tables, 'readwrite'>) => Promise<T>): Promise<T> {
    const db = await this.db();
    const tx = db.transaction(tables, 'readwrite');
    // 同时捕获事务错误，避免故障注入/容量不足造成未处理的 rejection。
    const done = tx.done.catch((error: unknown) => { throw error; });
    void done.catch(() => {});
    try {
      const result = await work(tx);
      const revision = (await tx.objectStore('metadata').get('revision')) ?? 0;
      await tx.objectStore('metadata').put(revision + 1, 'revision');
      this.beforeCommit?.();
      await done;
      return result;
    } catch (error) {
      try { tx.abort(); } catch { /* 事务可能已经因底层错误中止。 */ }
      await done.catch(() => {});
      throw error;
    }
  }
  async begin(question: Question, restart = false): Promise<StoredRound> {
    return this.write(async (tx) => {
      const previous = await tx.objectStore('records').get(`drafts/${question.id}`);
      if (!restart && previous && !previous.deleted) return storedRoundSchema.parse(previous.value);
      const round = createRound(crypto.randomUUID(), question, new Date().toISOString());
      const old = await tx.objectStore('snapshots').get(round.snapshot.key);
      if (old && canonical(old) !== canonical(round.snapshot)) throw new Error('同版本题目内容发生变化，请先修正题库版本。');
      await tx.objectStore('snapshots').put(round.snapshot, round.snapshot.key);
      const saved: StoredRound = { round, revision: previous && !previous.deleted ? storedRoundSchema.parse(previous.value).revision + 1 : 0 };
      await tx.objectStore('records').put({ id: question.id, namespace: 'drafts', value: JSON.parse(JSON.stringify(saved)) as JsonValue, deleted: false, updatedAt: round.startedAt }, `drafts/${question.id}`);
      return saved;
    });
  }
  async change(questionId: string, expected: StoredRound, transform: (round: PracticeRound) => PracticeRound, context?: { sessionId: string; draftId: string }): Promise<StoredRound> {
    return this.write(async (tx) => {
      const recordKey = `drafts/${context?.draftId ?? questionId}`;
      const record = await tx.objectStore('records').get(recordKey);
      if (!record || record.deleted) throw new Error('练习已被清空或替换，请重新载入。');
      const previous = storedRoundSchema.parse(record.value);
      if (context) {
        const session = await tx.objectStore('practiceSessions').get(context.sessionId);
        if (!session || session.status !== 'active' || session.roundIds[session.currentIndex] !== previous.round.id || context.draftId !== sessionDraftId(previous.round.id)) throw new Error('连续练习位置已变化，请重新载入。');
      }
      if (previous.revision !== expected.revision || previous.round.id !== expected.round.id || canonical(previous.round) !== canonical(expected.round)) throw new Error('其他页面已更新本题，请重新载入后继续。');
      const round = transform(structuredClone(previous.round));
      if (round.id !== previous.round.id || canonical(round.snapshot) !== canonical(previous.round.snapshot)) throw new Error('当前轮次或快照不能被修改。');
      for (const event of round.events) {
        const existing = await tx.objectStore('events').get(event.id);
        if (existing && canonical(existing) !== canonical(event)) throw new Error('作答历史冲突，未保存此次更改。');
        if (!existing) await tx.objectStore('events').add(event, event.id);
      }
      const events = await tx.objectStore('events').getAll();
      const progress = rebuildProgress(events.filter((item) => item.questionId === questionId))[0];
      if (progress) await tx.objectStore('progress').put(progress, questionId);
      const saved = { round, revision: previous.revision + 1 };
      const now = new Date().toISOString();
      const updatedAt = new Date(Math.max(Date.parse(now), Date.parse(record.updatedAt) + 1)).toISOString();
      await tx.objectStore('records').put({ ...record, value: JSON.parse(JSON.stringify(saved)) as JsonValue, updatedAt }, recordKey);
      if (context) {
        const session = (await tx.objectStore('practiceSessions').get(context.sessionId))!;
        await tx.objectStore('practiceSessions').put({ ...session, updatedAt: new Date(Math.max(Date.parse(updatedAt), Date.parse(session.updatedAt) + 1)).toISOString() }, session.id);
      }
      return saved;
    });
  }
  async startPractice(questions: Question[], kind: PracticeSession['kind'] = 'practice', filtersSnapshot?: Record<string, string>): Promise<PracticeSession> {
    if (!questions.length || questions.length > 100 || new Set(questions.map((q) => q.id)).size !== questions.length || questions.some((q) => q.reviewStatus !== 'verified')) throw new Error('请选择 1–100 道不重复且已审核的题目。');
    return this.write(async (tx) => {
      const id = crypto.randomUUID(); const at = new Date().toISOString();
      const rounds = questions.map((question) => createRound(`${id}/${encodeURIComponent(question.id)}`, question, at));
      const session: PracticeSession = { id, kind, questionKeys: rounds.map((r) => r.snapshot.key), roundIds: rounds.map((r) => r.id), currentIndex: 0, status: 'active', startedAt: at, updatedAt: at, filtersSnapshot };
      for (const round of rounds) {
        const old = await tx.objectStore('snapshots').get(round.snapshot.key);
        if (old && canonical(old) !== canonical(round.snapshot)) throw new Error('同版本题目内容发生变化，请检查题库版本。');
        await tx.objectStore('snapshots').put(round.snapshot, round.snapshot.key);
        const draftId = sessionDraftId(round.id);
        await tx.objectStore('records').add({ id: draftId, namespace: 'drafts', value: JSON.parse(JSON.stringify({ round, revision: 0 })) as JsonValue, deleted: false, updatedAt: at }, `drafts/${draftId}`);
      }
      await tx.objectStore('practiceSessions').add(session, id);
      return session;
    });
  }
  async loadPracticeRound(id: string): Promise<StoredRound> {
    const db = await this.db(); const tx = db.transaction(['practiceSessions', 'records'], 'readonly');
    const session = await tx.objectStore('practiceSessions').get(id);
    if (!session || session.status !== 'active') throw new Error('连续练习不存在或已经完成。');
    const record = await tx.objectStore('records').get(`drafts/${sessionDraftId(session.roundIds[session.currentIndex])}`);
    await tx.done;
    if (!record || record.deleted) throw new Error('连续练习缺少当前题目草稿。');
    return storedRoundSchema.parse(record.value);
  }
  async movePractice(expected: PracticeSession, direction: -1 | 1): Promise<PracticeSession> {
    return this.write(async (tx) => {
      const session = await tx.objectStore('practiceSessions').get(expected.id);
      if (!session || canonical({ ...session, updatedAt: expected.updatedAt }) !== canonical(expected) || session.status !== 'active') throw new Error('练习已被其他页面更新，请重新载入。');
      const nextIndex = session.currentIndex + direction;
      if (nextIndex < 0) throw new Error('已经是第一题。');
      const record = await tx.objectStore('records').get(`drafts/${sessionDraftId(session.roundIds[session.currentIndex])}`);
      if (!record || (direction === 1 && storedRoundSchema.parse(record.value).round.status !== 'complete')) throw new Error('请先提交、自评或选择辅助学习，再进入下一题。');
      const at = new Date(Math.max(Date.now(), Date.parse(session.updatedAt) + 1)).toISOString();
      const next: PracticeSession = nextIndex === session.roundIds.length ? { ...session, status: 'completed', completedAt: at, updatedAt: at } : { ...session, currentIndex: nextIndex, updatedAt: at };
      await tx.objectStore('practiceSessions').put(next, session.id);
      return next;
    });
  }
  async saveRecord(namespace: Exclude<MutableRecord['namespace'], 'drafts'>, id: string, value: JsonValue, deleted = false) {
    return this.write(async (tx) => {
      const key = `${namespace}/${id}`;
      const previous = await tx.objectStore('records').get(key);
      const updatedAt = new Date(Math.max(Date.now(), previous ? Date.parse(previous.updatedAt) + 1 : 0)).toISOString();
      await tx.objectStore('records').put({ namespace, id, value, deleted, updatedAt }, key);
    });
  }
  async startExam(questions: Question[], minutes?: number): Promise<MockSession> {
    if (!questions.length || questions.length > 100 || questions.some(q => q.reviewStatus !== 'verified') || (minutes !== undefined && (!Number.isInteger(minutes) || minutes < 1 || minutes > 240))) throw new Error('请选择已审核题目，限时须为 1–240 分钟。');
    return this.write(async tx => {
      if ((await tx.objectStore('sessions').getAll()).some(s => s.status === 'active')) throw new Error('请先完成当前模拟考试。');
      const at = new Date().toISOString();
      const { session, snapshots } = createMock(crypto.randomUUID(), questions, at, minutes === undefined ? undefined : new Date(Date.parse(at) + minutes * 60_000).toISOString());
      for (const snapshot of snapshots) {
        const old = await tx.objectStore('snapshots').get(snapshot.key);
        if (old && canonical(old) !== canonical(snapshot)) throw new Error('同版本题目内容发生变化，请检查题库版本。');
        await tx.objectStore('snapshots').put(snapshot, snapshot.key);
      }
      await tx.objectStore('sessions').add(session, session.id);
      return session;
    });
  }
  private async settleExam(tx: IDBPTransaction<LearningDB, typeof tables, 'readwrite'>, session: MockSession, at: string, submit: boolean): Promise<MockSession> {
    const result = finishMock(session, await tx.objectStore('snapshots').getAll(), at, submit);
    if (result.session === session) return session;
    for (const event of result.events) {
      const existing = await tx.objectStore('events').get(event.id);
      if (existing && canonical(existing) !== canonical(event)) throw new Error('模拟作答历史冲突，交卷未保存。');
      if (!existing) await tx.objectStore('events').add(event, event.id);
    }
    const progress = rebuildProgress(await tx.objectStore('events').getAll());
    for (const item of progress) await tx.objectStore('progress').put(item, item.questionId);
    await tx.objectStore('sessions').put(result.session, session.id);
    return result.session;
  }
  async saveExam(expected: MockSession, change: { key?: string; answer?: Answer; currentIndex?: number }): Promise<MockSession> {
    return this.write(async tx => {
      const session = await tx.objectStore('sessions').get(expected.id);
      if (!session) throw new Error('模拟考试已被移除，请重新载入。');
      if (session.status !== 'active') return session;
      const now = Date.now();
      if (session.deadlineAt && now >= Date.parse(session.deadlineAt)) return this.settleExam(tx, session, new Date(now).toISOString(), false);
      if (canonical(session) !== canonical(expected)) throw new Error('其他页面已更新本卷，请重新载入后继续。');
      if (change.key !== undefined && change.answer === undefined) throw new Error('答案格式无效。');
      if (change.currentIndex !== undefined && (!Number.isInteger(change.currentIndex) || change.currentIndex < 0 || change.currentIndex >= session.questionKeys.length)) throw new Error('题目位置无效。');
      const at = new Date(Math.max(now, Date.parse(session.updatedAt))).toISOString();
      let next = change.key === undefined ? session : saveMockAnswer(session, change.key, change.answer!, at);
      next = { ...next, updatedAt: at, currentIndex: change.currentIndex ?? next.currentIndex ?? 0 };
      await tx.objectStore('sessions').put(next, session.id);
      return next;
    });
  }
  async finishExam(id: string, submit = false, expected?: MockSession): Promise<MockSession> {
    return this.write(async tx => {
      const session = await tx.objectStore('sessions').get(id);
      if (!session) throw new Error('模拟考试不存在。');
      if (session.status !== 'active') return session;
      const now = new Date().toISOString();
      if (submit && expected && canonical(expected) !== canonical(session) && (!session.deadlineAt || Date.parse(now) < Date.parse(session.deadlineAt))) throw new Error('其他页面已更新本卷，请重新载入再交卷。');
      return this.settleExam(tx, session, now, submit);
    });
  }
  async gradeExamManual(id: string, key: string, grade: SelfGrade): Promise<StoredRound> {
    return this.write(async tx => {
      const session = await tx.objectStore('sessions').get(id);
      if (!session || session.status === 'active') throw new Error('请先交卷，再自评人工题。');
      if ((await tx.objectStore('sessions').getAll()).some(s => s.status === 'active')) throw new Error('请先完成当前模拟考试，再查看历史自评。');
      const pending = session.pendingManualRounds?.find(r => r.snapshot.key === key);
      if (!pending) throw new Error('本题没有可自评的独立作答。');
      const draftId = mockReviewDraftId(pending.id);
      const old = await tx.objectStore('records').get(`drafts/${draftId}`);
      if (old && !old.deleted) return storedRoundSchema.parse(old.value);
      const at = new Date(Math.max(Date.now(), Date.parse(session.completedAt!))).toISOString();
      const round = selfGrade(revealAnswer(structuredClone(pending), at, true), grade, at);
      for (const event of round.events) {
        const existing = await tx.objectStore('events').get(event.id);
        if (existing && canonical(existing) !== canonical(event)) throw new Error('人工自评历史冲突。');
        if (!existing) await tx.objectStore('events').add(event, event.id);
      }
      const saved: StoredRound = { round, revision: 0 };
      await tx.objectStore('records').put({ namespace: 'drafts', id: draftId, deleted: false, updatedAt: at, value: JSON.parse(JSON.stringify(saved)) as JsonValue }, `drafts/${draftId}`);
      const progress = rebuildProgress(await tx.objectStore('events').getAll()).find(p => p.questionId === pending.snapshot.question.id);
      if (progress) await tx.objectStore('progress').put(progress, progress.questionId);
      return saved;
    });
  }
  async exportJSON(): Promise<string> {
    const state = await this.read();
    return JSON.stringify({ ...state.data, exportedAt: new Date().toISOString(), bankVersion: '1.22.0' }, null, 2);
  }
  async previewImport(input: unknown, mode: 'merge' | 'replace', currentIds: string[]): Promise<ImportPreview> {
    const incoming = validateBackup(input);
    const local = await this.read();
    const plan = planBackupMerge(mode === 'replace' ? emptyBackup() : local.data, incoming);
    if (!plan.ok) throw new Error(`导入冲突：${plan.conflicts.map((item) => `${item.kind} ${item.id}`).join('；')}`);
    const data = recoverExpired(validateBackup(plan.data));
    return { data, mode, expectedRevision: local.revision, unknownIds: [...new Set(data.snapshots.map((item) => item.question.id).filter((id) => !currentIds.includes(id)))] };
  }
  async applyImport(preview: ImportPreview) {
    const data = recoverExpired(validateBackup(preview.data));
    const progress = rebuildProgress(data.events);
    await this.write(async (tx) => {
      if (((await tx.objectStore('metadata').get('revision')) ?? 0) !== preview.expectedRevision) throw new Error('预览之后本地数据发生变化，请重新预检。');
      for (const table of ['events', 'snapshots', 'records', 'sessions', 'practiceSessions', 'progress'] as const) await tx.objectStore(table).clear();
      for (const event of data.events) await tx.objectStore('events').put(event, event.id);
      for (const snapshot of data.snapshots) await tx.objectStore('snapshots').put(snapshot, snapshot.key);
      for (const record of data.records) await tx.objectStore('records').put(record, `${record.namespace}/${record.id}`);
      for (const session of data.sessions) await tx.objectStore('sessions').put(session, session.id);
      for (const session of data.practiceSessions ?? []) await tx.objectStore('practiceSessions').put(session, session.id);
      for (const item of progress) await tx.objectStore('progress').put(item, item.questionId);
    });
  }
  async clear() { const state = await this.read(); await this.applyImport({ data: emptyBackup(), expectedRevision: state.revision, mode: 'replace', unknownIds: [] }); }
}
