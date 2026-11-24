import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { advanceGuidedPractice, createRound, guidancePending, revealAnswer, saveDraft, selfGrade, startGuidedPractice, type GuidanceContent } from '../src/domain/practice';
import { rebuildProgress } from '../src/domain/review';
import { LearningStore } from '../src/storage/learning-store';
import { validateBackup } from '../src/storage/backup-schema';
import { canViewRoundLearning } from '../src/components/RoundLearningGate';
import { questionGuidance, guidanceFor } from '../src/data/question-guidance';
import { questions } from '../src/data/question-bank';
import { sessionDraftId } from '../src/domain/practice-session';
import { manual, single, at, later } from './fixtures';
const content:GuidanceContent={steps:[{title:'one',promptMd:'HINT_ONE'},{title:'two',promptMd:'HINT_TWO'},{title:'three',promptMd:'HINT_THREE'}],checks:['CHECK_ONE','CHECK_TWO']};
const stores:LearningStore[]=[];
const make=(name=crypto.randomUUID(),fault?:()=>void)=>{const s=new LearningStore(name,fault);stores.push(s);return s;};
afterEach(async()=>{await Promise.all(stores.splice(0).map(s=>s.close()));});
const finishGuide=(round:ReturnType<typeof createRound>)=>{while(guidancePending(round))round=advanceGuidedPractice(round);return round;};
describe('分步引导的辅助学习与持久化',()=>{
 it('10个现有人工题版本匹配，题库仍218且不支持未知或不同版本',()=>{
  expect(questions).toHaveLength(218);expect(questionGuidance).toHaveLength(10);expect(new Set(questionGuidance.map(g=>g.questionId)).size).toBe(10);
  for(const guide of questionGuidance){const q=questions.find(q=>q.id===guide.questionId)!;expect(['short_answer','rtl_coding','waveform_analysis']).toContain(q.type);expect(q.contentVersion).toBe(guide.contentVersion);expect(guidanceFor(q)?.steps).toHaveLength(3);expect(guide.checks.length).toBeGreaterThanOrEqual(4);expect(guidanceFor({...q,contentVersion:q.contentVersion+1})).toBeUndefined();}
  expect(guidanceFor(manual)).toBeUndefined();
 });
 it('先记录辅助事件，保留草稿且开始引导不会立即开放答案',()=>{
  const original=saveDraft(createRound('guide',manual,at),'MY_ATTEMPT');const guided=startGuidedPractice(original,content,later);
  expect(original.guidance).toBeUndefined();expect(guided.draft).toBe('MY_ATTEMPT');expect(guided.events).toMatchObject([{kind:'revealed_without_submission',reason:'guidance',independent:false,draft:'MY_ATTEMPT'}]);
  expect(guided.status).toBe('awaiting_self_grade');expect(canViewRoundLearning(guided)).toBe(false);
  expect(startGuidedPractice(guided,content,later)).toBe(guided);expect(()=>selfGrade(guided,'good',later)).toThrow('分步引导');
 });
 it('结束引导才开放答案，自评掌握仍按辅助部分掌握而非独立掌握',()=>{
  let round=startGuidedPractice(createRound('guide',manual,at),content,later);
  for(let i=0;i<content.steps.length;i++){expect(round.guidance?.currentStep).toBe(i);expect(canViewRoundLearning(round)).toBe(false);round=advanceGuidedPractice(round);}
  expect(canViewRoundLearning(round)).toBe(true);expect(advanceGuidedPractice(round)).toEqual(round);
  const graded=selfGrade(round,'good',later);expect(graded.events.at(-1)).toMatchObject({independent:false,effectiveGrade:'partial'});
  expect(rebuildProgress(graded.events)[0]).toMatchObject({independentlyPracticed:false,consecutiveSuccesses:0,autoAttempts:0,selfAssessments:1});
 });
 it('普通独立作答不受影响，非法类型、空内容和已揭示轮次拒绝开始引导',()=>{
  expect(()=>startGuidedPractice(createRound('auto',single,at),content,later)).toThrow();
  expect(()=>startGuidedPractice(createRound('manual',manual,at),{steps:[],checks:[]},later)).toThrow();
  const independent=revealAnswer(saveDraft(createRound('independent',manual,at),'MY_OWN_WORK'),later,true);
  expect(()=>startGuidedPractice(independent,content,later)).toThrow();
  expect(selfGrade(independent,'good',later).events.at(-1)).toMatchObject({independent:true,effectiveGrade:'good'});
 });
 it('引导内容与步骤随草稿关库恢复，导出覆盖导入后仍可继续',async()=>{
  const store=make();let saved=await store.begin(manual);saved=await store.change(manual.id,saved,r=>startGuidedPractice(r,content,new Date().toISOString()));
  saved=await store.change(manual.id,saved,advanceGuidedPractice);await store.close();expect((await store.begin(manual)).round).toEqual(saved.round);
  const backup=JSON.parse(await store.exportJSON());expect(validateBackup(backup).events).toHaveLength(1);
  const destination=make();await destination.applyImport(await destination.previewImport(backup,'replace',[manual.id]));
  const restored=await destination.begin(manual);expect(restored.round.guidance?.currentStep).toBe(1);expect(restored.round.guidance?.steps).toEqual(content.steps);expect(canViewRoundLearning(restored.round)).toBe(false);
 });
 it('完整辅助自评可校验备份，重做清空引导但保留旧辅助事件',async()=>{
  const store=make();let saved=await store.begin(manual);saved=await store.change(manual.id,saved,r=>selfGrade(finishGuide(startGuidedPractice(r,content,new Date().toISOString())),'good',new Date().toISOString()));
  expect(validateBackup(JSON.parse(await store.exportJSON())).events).toHaveLength(2);
  const restarted=await store.begin(manual,true);expect(restarted.round.guidance).toBeUndefined();expect(restarted.round.revealedAt).toBeUndefined();expect(canViewRoundLearning(restarted.round)).toBe(false);
  expect(validateBackup(JSON.parse(await store.exportJSON())).events).toHaveLength(2);
 });
 it('连续练习引导不能提前跳题，步骤与所在轮次一起保存',async()=>{
  const q={...manual,reviewStatus:'verified' as const},store=make();const session=await store.startPractice([q]);let saved=await store.loadPracticeRound(session.id);
  const ctx={sessionId:session.id,draftId:sessionDraftId(saved.round.id)};saved=await store.change(q.id,saved,r=>startGuidedPractice(r,content,new Date().toISOString()),ctx);
  await expect(store.movePractice(session,1)).rejects.toThrow();saved=await store.change(q.id,saved,r=>selfGrade(finishGuide(r),'partial',new Date().toISOString()),ctx);
  expect((await store.movePractice((await store.read()).data.practiceSessions![0],1)).status).toBe('completed');expect(validateBackup(JSON.parse(await store.exportJSON())).events).toHaveLength(2);
 });
 it('保存失败时引导事件和进度全部回滚，陈旧页面不能覆盖新步骤',async()=>{
  let fail=false;const store=make(undefined,()=>{if(fail)throw new Error('injected');});const original=await store.begin(manual);fail=true;
  await expect(store.change(manual.id,original,r=>startGuidedPractice(r,content,new Date().toISOString()))).rejects.toThrow('injected');fail=false;
  expect((await store.begin(manual)).round.guidance).toBeUndefined();expect((await store.read()).data.events).toHaveLength(0);
  const opened=await store.change(manual.id,original,r=>startGuidedPractice(r,content,new Date().toISOString()));await store.change(manual.id,opened,advanceGuidedPractice);
  await expect(store.change(manual.id,opened,advanceGuidedPractice)).rejects.toThrow('其他页面');
 });
 it('篡改独立标记、越界步骤、缺少辅助事件及提前完成的备份被拒绝',async()=>{
  const store=make();const saved=await store.begin(manual);await store.change(manual.id,saved,r=>startGuidedPractice(r,content,new Date().toISOString()));const valid=JSON.parse(await store.exportJSON());
  for(const mutation of [(b:any)=>{b.records[0].value.round.independent=true;},(b:any)=>{b.records[0].value.round.guidance.currentStep=99;},(b:any)=>{b.events=[];},(b:any)=>{b.records[0].value.round.status='complete';}]){const broken=structuredClone(valid);mutation(broken);expect(()=>validateBackup(broken)).toThrow();}
 });
});
