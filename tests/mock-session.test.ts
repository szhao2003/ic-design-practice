import { describe, expect, it } from 'vitest';
import { canRevealMockAnswers, createMock, finishMock, saveMockAnswer } from '../src/domain/mock-session';
import { rebuildProgress } from '../src/domain/review';
import { single, manual, at, later } from './fixtures';

describe('模拟卷状态合同', () => {
  const paper = () => createMock('mock-1', [single, { ...single, id: 'TEST-SECOND' }, { ...manual, id: 'TEST-MANUAL' }], at, later);
  it('不允许重复题和空卷', () => {
    expect(() => createMock('m', [], at)).toThrow();
    expect(() => createMock('m', [single, single], at)).toThrow();
  });
  it('未到期且未提交保持 active，答案不可揭示', () => {
    const { session, snapshots } = paper();
    expect(finishMock(session, snapshots, at).session).toBe(session);
    expect(canRevealMockAnswers(session)).toBe(false);
  });
  it('超时恢复按最后保存答案结算，未答单列不产生 Attempt', () => {
    const { session, snapshots } = paper();
    const saved = saveMockAnswer(session, snapshots[0].key, ['B'], at);
    const result = finishMock(saved, snapshots, '2026-11-23T12:00:00.000Z');
    expect(result.session).toMatchObject({ status: 'expired', completedAt: later, autoTotal: 2, autoCorrect: 1 });
    expect(result.session.unansweredKeys).toHaveLength(2);
    expect(result.events).toHaveLength(1);
    expect(rebuildProgress(result.events)[0].autoAttempts).toBe(1);
    expect(canRevealMockAnswers(result.session)).toBe(true);
    expect(finishMock(result.session, snapshots, '2026-11-24T12:00:00.000Z').events).toEqual([]);
  });
  it('手动提交进入不可逆终态', () => {
    const { session, snapshots } = paper();
    const result = finishMock(session, snapshots, at, true);
    expect(result.session.status).toBe('submitted');
    expect(() => saveMockAnswer(result.session, snapshots[0].key, ['A'], later)).toThrow();
  });
  it('到截止时刻不能再保存，重复结算前恢复也产生同一稳定事件 ID', () => {
    const { session, snapshots } = paper();
    expect(() => saveMockAnswer(session, snapshots[0].key, ['B'], later)).toThrow();
    const saved = saveMockAnswer(session, snapshots[0].key, ['B'], at);
    expect(finishMock(saved, snapshots, later).events).toEqual(finishMock(saved, snapshots, '2026-11-23T12:00:00.000Z').events);
  });
  it('人工题只进入待自评，不默认正确或错误', () => {
    const { session, snapshots } = paper();
    const saved = saveMockAnswer(session, snapshots[2].key, '完整独立作答', at);
    const result = finishMock(saved, snapshots, at, true);
    expect(result.events).toEqual([]);
    expect(result.session.pendingManualRounds).toHaveLength(1);
    expect(result.session.pendingManualRounds![0].draft).toBe('完整独立作答');
  });
  it('非法草稿单列并计零分，不能阻止超时交卷，也不修改输入', () => {
    const { session, snapshots } = paper();
    const saved = saveMockAnswer(session, snapshots[0].key, ['unknown'], at);
    const result = finishMock(saved, snapshots, later);
    expect(result.session.status).toBe('expired');
    expect(result.session.invalidAnswers).toHaveLength(1);
    expect(result.session.autoCorrect).toBe(0);
    expect(result.session.autoTotal).toBe(2);
    expect(result.events).toEqual([]);
    expect(session.status).toBe('active');
  });
  it('缺少历史快照时拒绝结算，不修改活动会话', () => {
    const { session } = paper();
    expect(() => finishMock(session, [], at, true)).toThrow('快照');
    expect(session.status).toBe('active');
  });
});
