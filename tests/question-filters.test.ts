import { describe, expect, it } from 'vitest';
import { questions } from '../src/data/question-bank';
import { filterQuestions, selectPracticeQuestions } from '../src/domain/question-filters';
import { emptyBackup } from '../src/storage/learning-store';
import { createRound, saveDraft, submitAutomatic } from '../src/domain/practice';
import { single, at, later } from './fixtures';

describe('题库多维过滤', () => {
  it('七专题七题型均有真实可答样本', () => {
    const topics = new Set(questions.map((q) => q.topicId));
    expect(['01', '02', '03', '04', '05', '06', '07'].every((id) => topics.has(id))).toBe(true);
    expect(new Set(questions.map((q) => q.type)).size).toBe(7);
    expect(questions.filter((q) => q.type === 'numeric').length).toBeGreaterThanOrEqual(4);
    expect(questions.filter((q) => q.type === 'rtl_coding').length).toBeGreaterThanOrEqual(2);
    expect(questions.filter((q) => q.type === 'waveform_analysis').length).toBeGreaterThanOrEqual(2);
  });
  it('至少六道考点改编，不混入原题分类', () => {
    const adapted = filterQuestions(questions, { fidelity: 'topic_only_reconstruction' }, emptyBackup());
    expect(adapted.length).toBeGreaterThanOrEqual(6);
    expect(adapted.every((q) => q.source.url && q.source.note && ['checked', 'not_rechecked'].includes(q.source.sourceClaimVerification))).toBe(true);
    expect(filterQuestions(questions, { fidelity: 'verbatim_verified' }, emptyBackup())).toEqual([]);
    expect(filterQuestions(questions, { fidelity: 'paraphrased_from_source' }, emptyBackup())).toEqual([]);
  });
  it.each([
    ['topic', '04'], ['subtopic', 'pulse-toggle'], ['type', 'rtl_coding'], ['difficulty', 'easy'],
    ['company', '瑞芯微'], ['year', 'cohort:2026届'], ['year', 'exam:2026'], ['evidence', 'B'], ['tag', 'AHB-Lite'],
  ])('%s=%s 只返回匹配题', (key, value) => {
    const result = filterQuestions(questions, { [key]: value }, emptyBackup());
    expect(result.length).toBeGreaterThan(0);
    if (key === 'topic') expect(result.every((q) => q.topicId === value)).toBe(true);
    if (key === 'company') expect(result.every((q) => q.source.company === value)).toBe(true);
    if (key === 'year' && value.startsWith('cohort:')) expect(result.every((q) => q.source.graduationCohort === '2026届')).toBe(true);
    if (key === 'type') expect(result.every((q) => q.type === value)).toBe(true);
  });
  it('组合过滤采用交集，搜索大小写不敏感', () => {
    const result = filterQuestions(questions, { topic: '04', type: 'rtl_coding', company: '瑞芯微', fidelity: 'topic_only_reconstruction', q: 'TOGGLE' }, emptyBackup());
    expect(result.some((q) => q.id === 'ADAPTED-RK26-CDC-0001')).toBe(true);
    expect(result.every((q) => q.topicId === '04' && q.type === 'rtl_coding' && q.source.company === '瑞芯微' && q.source.questionFidelity === 'topic_only_reconstruction')).toBe(true);
  });
  it('无结果、不存在分类、needs_review 不回退塞题', () => {
    expect(filterQuestions(questions, { topic: '99' }, emptyBackup())).toEqual([]);
    expect(filterQuestions(questions, { company: '瑞芯微', fidelity: 'self_authored' }, emptyBackup())).toEqual([]);
    expect(filterQuestions([single], {}, emptyBackup())).toEqual([]);
  });
  it('来源公司不能命中原创题', () => expect(filterQuestions(questions, { company: '乐鑫' }, emptyBackup()).every((q) => q.source.questionFidelity !== 'self_authored')).toBe(true));
  it('按真实事件和收藏过滤，未提交草稿不算已练', () => {
    const question = questions.find((q) => q.type === 'single_choice')!;
    if (question.type !== 'single_choice') throw new Error('fixture');
    const round = submitAutomatic(saveDraft(createRound('filter-round', question, at), question.correctOptionIds), later);
    const data = { ...emptyBackup(), events: round.events, records: [{ id: question.id, namespace: 'bookmarks' as const, value: true, deleted: false, updatedAt: later }] };
    expect(filterQuestions(questions, { progress: 'done' }, data).map((q) => q.id)).toEqual([question.id]);
    expect(filterQuestions(questions, { progress: 'bookmarked' }, data).map((q) => q.id)).toEqual([question.id]);
    expect(filterQuestions(questions, { progress: 'unseen' }, data)).toHaveLength(questions.length - 1);
    expect(filterQuestions(questions, { progress: 'wrong' }, data)).toEqual([]);
  });
});

describe('随机组题', () => {
  it('一场内去重、不修改原题库，数量不足不凑数', () => {
    const before = [...questions]; const selected = selectPracticeQuestions([...questions, questions[0]], 100, emptyBackup(), Date.now(), () => 0.5);
    expect(selected).toHaveLength(questions.length); expect(new Set(selected.map((q) => q.id)).size).toBe(selected.length); expect(questions).toEqual(before);
  });
  it('空匹配返回空，调用方不能启动空 session', () => expect(selectPracticeQuestions([], 10, emptyBackup())).toEqual([]));
  it.each([0, -1, 101, 1.5, NaN])('拒绝非法题量 %s', (count) => expect(() => selectPracticeQuestions(questions, count, emptyBackup())).toThrow());
  it('到期优先，其次未完成，再次已做；较早练过的优于近期重复', () => {
    const q = { ...single, reviewStatus: 'verified' as const };
    const other = { ...q, id: 'TEST-OTHER' }; const unseen = { ...q, id: 'TEST-UNSEEN' };
    const a = submitAutomatic(saveDraft(createRound('a', q, at), ['B']), at).events;
    const b = submitAutomatic(saveDraft(createRound('b', other, at), ['B']), later).events;
    const data = { ...emptyBackup(), events: [...a, ...b] };
    expect(selectPracticeQuestions([other, unseen, q], 3, data, Date.parse(later), () => 0.5).map((item) => item.id)).toEqual([unseen.id, q.id, other.id]);
    expect(selectPracticeQuestions([other, unseen, q], 1, data, Date.parse('2026-12-01T00:00:00Z'), () => 0.999)[0].id).toBe(other.id);
  });
});

describe('新增题目的数值交叉检查', () => {
  it('按半纳秒整数刻度枚举 FIFO 离散事件，峰值 39', () => {
    let occupancy = 0; let peak = 0;
    for (let tick = 0; tick <= 2475; tick++) {
      if (tick % 25 === 0) occupancy++;
      if (tick >= 40 && tick % 40 === 0 && occupancy > 0) occupancy--;
      peak = Math.max(peak, occupancy);
    }
    const question = questions.find((q) => q.id === 'ADAPTED-ESP-FIFO-0001');
    expect(question).toMatchObject({ expectedValue: peak }); expect(peak).toBe(39);
  });
  it('AXI 仅在 VALID 与 READY 同时为 1 的四拍传输，窗口 80ns', () => {
    const valid = [1, 1, 1, 0, 1, 1, 1, 0]; const ready = [0, 1, 1, 1, 0, 1, 1, 1];
    const bytes = valid.reduce((sum, value, index) => sum + (value && ready[index] ? 4 : 0), 0);
    expect(questions.find((q) => q.id === 'ADAPTED-RK26-AXI-0001')).toMatchObject({ expectedValue: bytes / (80e-9) / 1e6 });
  });
});
