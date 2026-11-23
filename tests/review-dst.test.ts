import { afterAll, describe, expect, it } from 'vitest';
import { addLocalCalendarDays } from '../src/domain/review';

const originalTZ = process.env.TZ;
process.env.TZ = 'America/Los_Angeles';
afterAll(() => { if (originalTZ === undefined) delete process.env.TZ; else process.env.TZ = originalTZ; });

describe('本地日历复习跨 DST', () => {
  it('春季切换加一天保持 10 点，实际经过 23 小时', () => {
    const start = new Date(2026, 2, 7, 10, 0);
    const next = new Date(addLocalCalendarDays(start.toISOString(), 1));
    expect(next.getHours()).toBe(10);
    expect(next.getDate()).toBe(8);
    expect((next.getTime() - start.getTime()) / 3_600_000).toBe(23);
  });
  it('秋季切换加一天保持 10 点，实际经过 25 小时', () => {
    const start = new Date(2026, 9, 31, 10, 0);
    const next = new Date(addLocalCalendarDays(start.toISOString(), 1));
    expect(next.getHours()).toBe(10);
    expect(next.getDate()).toBe(1);
    expect((next.getTime() - start.getTime()) / 3_600_000).toBe(25);
  });
});
