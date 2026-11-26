import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { coreLearningPaths } from '../src/data/core-learning-paths';
import { questions } from '../src/data/question-bank';
import { activePathSession, orderedPathQuestions, pathCoverage } from '../src/domain/learning-path';
import { LearningStore } from '../src/storage/learning-store';
import { validateBackup } from '../src/storage/backup-schema';
import { saveDraft } from '../src/domain/practice';
import { sessionDraftId } from '../src/domain/practice-session';
const stores: LearningStore[]=[];
afterEach(async()=>{await Promise.all(stores.splice(0).map(s=>s.close()));});
function make(name=crypto.randomUUID()){const s=new LearningStore(name);stores.push(s);return s;}
describe('核心专题精选路径',()=>{
 it('五条路径各三阶段九题，45个不同的已审核引用且专题对应',()=>{
  expect(coreLearningPaths.map(p=>p.topicId)).toEqual(['03','04','05','06','07']);
  const ids=coreLearningPaths.flatMap(p=>p.stages.flatMap(s=>s.questionIds));expect(ids).toHaveLength(45);expect(new Set(ids).size).toBe(45);
  for(const path of coreLearningPaths){expect(path.stages).toHaveLength(3);expect(new Set(path.stages.map(s=>s.id)).size).toBe(3);
   for(const stage of path.stages){expect(stage.questionIds).toHaveLength(3);expect(stage.goal.length).toBeGreaterThan(10);
    // Retain historical path IDs for saved sessions after coding tasks move to 06.
    expect(orderedPathQuestions(stage.questionIds,questions).every(q=>q.topicId===path.topicId || (q.type==='rtl_coding' && q.topicId==='06'))).toBe(true);}}
 });
 it('固定题序不依赖题库顺序，缺题或未审核时不静默缩短路径',()=>{
  const ids=coreLearningPaths[0].stages[0].questionIds;const reversed=[...questions].reverse();
  expect(orderedPathQuestions(ids,reversed).map(q=>q.id)).toEqual(ids);expect(reversed[0]).toBe(questions.at(-1));
  expect(()=>orderedPathQuestions([...ids,ids[0]],questions)).toThrow();expect(()=>orderedPathQuestions([],questions)).toThrow();
  expect(()=>orderedPathQuestions([...ids,'MISSING'],questions)).toThrow('暂不可练');
  expect(()=>orderedPathQuestions(ids,questions.map(q=>q.id===ids[0]?{...q,reviewStatus:'needs_review'}:q))).toThrow('暂不可练');
 });
 it('覆盖去重且独立练习、错误和辅助学习分别统计',()=>{
  const progress=[{questionId:'a',independentlyPracticed:true,hasUnresolvedMistake:true},{questionId:'b',independentlyPracticed:false,hasUnresolvedMistake:false},{questionId:'outside',independentlyPracticed:true,hasUnresolvedMistake:true}];
  expect(pathCoverage(['a','a','b','c'],progress)).toEqual({practiced:1,total:3,mistakes:1});expect(pathCoverage(['a'],[...progress,progress[0]])).toEqual({practiced:1,total:1,mistakes:1});
 });
 it('续练只匹配同一路径与阶段的最新活动轮次，保留输入数组顺序',async()=>{
  const store=make();const items=orderedPathQuestions(coreLearningPaths[0].stages[0].questionIds,questions);
  const initial=await store.startPractice(items,'practice',{learningPath:'sta',pathStage:'rules'});
  const newest={...initial,id:'newest',updatedAt:new Date(Date.parse(initial.updatedAt)+1000).toISOString()};
  const list=[initial,{...newest,id:'completed',status:'completed' as const},{...newest,id:'other',filtersSnapshot:{learningPath:'sta',pathStage:'all'}},newest];
  expect(activePathSession(list,'sta','rules')?.id).toBe('newest');expect(list[0].id).toBe(initial.id);
  expect(activePathSession(list,'cdc','rules')).toBeUndefined();expect(activePathSession(list,'sta','all')?.id).toBe('other');
 });
 it('路径题序、来源标记和草稿关库后可续，备份仍能导入且不新增作答事件',async()=>{
  const name=crypto.randomUUID(),store=make(name),path=coreLearningPaths[2],stage=path.stages[0];
  const session=await store.startPractice(orderedPathQuestions(stage.questionIds,questions),'practice',{learningPath:path.id,pathStage:stage.id});
  const current=await store.loadPracticeRound(session.id);
  await store.change(current.round.snapshot.question.id,current,r=>saveDraft(r,['A']),{sessionId:session.id,draftId:sessionDraftId(current.round.id)});
  await store.close();const restored=make(name);const state=await restored.read();
  expect(state.data.events).toEqual([]);expect((await restored.loadPracticeRound(session.id)).round.draft).toEqual(['A']);
  expect(state.data.snapshots.map(s=>s.question.id).sort()).toEqual([...stage.questionIds].sort());
  expect(activePathSession(state.data.practiceSessions??[],path.id,stage.id)?.id).toBe(session.id);
  const exported=JSON.parse(await restored.exportJSON());expect(validateBackup(exported).practiceSessions?.[0].filtersSnapshot).toEqual({learningPath:path.id,pathStage:stage.id});
 });
});
