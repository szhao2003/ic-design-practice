import { describe, expect, it } from 'vitest';
import { topics, learningStages } from '../src/data/topics';

describe('专题分类合同', () => {
  it('保留固定的 15 个一级专题编号', () => {
    expect(topics.map((topic) => topic.id)).toEqual(Array.from({ length: 15 }, (_, index) => String(index + 1).padStart(2, '0')));
  });
  it('各专题内的子专题 ID 唯一且非空', () => {
    for (const topic of topics) {
      const ids = topic.subtopics.map((item) => item.id);
      expect(ids.length).toBeGreaterThan(0);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.every(Boolean)).toBe(true);
    }
  });
  it('学习路径只引用现有专题并覆盖完整目录', () => {
    expect([...new Set(learningStages.flatMap((stage) => stage.topicIds))].sort()).toEqual(topics.map((topic) => topic.id));
  });
});
