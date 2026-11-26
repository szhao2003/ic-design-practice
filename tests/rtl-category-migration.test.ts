import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { questions } from '../src/data/question-bank';
import { filterQuestions } from '../src/domain/question-filters';
import { guidanceFor } from '../src/data/question-guidance';
import { emptyBackup, LearningStore } from '../src/storage/learning-store';
import { revealAnswer, saveDraft, saveAnswerImages, selfGrade } from '../src/domain/practice';
import { validateBackup } from '../src/storage/backup-schema';
import { buildLearningStats } from '../src/domain/learning-stats';
const stores:LearningStore[]=[];
afterEach(async()=>{await Promise.all(stores.splice(0).map(s=>s.close()));});
const make=()=>{const s=new LearningStore(crypto.randomUUID());stores.push(s);return s;};
describe('RTL手撕题统一归类',()=>{
  it('全部21道RTL题集中06，其他专题仍可筛选概念和读波形',()=>{
    const coding=questions.filter(q=>q.type==='rtl_coding');
    expect(questions).toHaveLength(260);expect(coding).toHaveLength(21);
    expect(coding.every(q=>q.topicId==='06')).toBe(true);
    for(const topic of ['04','05','07'])expect(filterQuestions(questions,{topic,type:'rtl_coding'},emptyBackup())).toEqual([]);
    expect(filterQuestions(questions,{topic:'06',subtopic:'cdc-reset'},emptyBackup())).toHaveLength(2);
    expect(filterQuestions(questions,{topic:'06',subtopic:'fifo-memory'},emptyBackup())).toHaveLength(3);
    expect(filterQuestions(questions,{topic:'06',subtopic:'bus-interface'},emptyBackup())).toHaveLength(1);
    expect(filterQuestions(questions,{topic:'06'},emptyBackup())).toHaveLength(37);
  });
  it('迁移的6题保留稳定ID、领域标签和匹配版本的原有引导',()=>{
    for(const [id,subtopic,tag] of [
      ['ADAPTED-RK26-CDC-0001','cdc-reset','CDC / Reset'],['ORIGINAL-CDC-0005','cdc-reset','CDC / Reset'],
      ['ADAPTED-FOCUSED-RTL-FIFO-0001','fifo-memory','FIFO / Memory'],['ADAPTED-INTEGRATION-FIFO-0001','fifo-memory','FIFO / Memory'],
      ['ADAPTED-CODEC-GRAY-0001','fifo-memory','FIFO / Memory'],['ADAPTED-INTEGRATION-AXIL-0001','bus-interface','总线协议'],
    ]){
      const q=questions.find(q=>q.id===id)!;expect(q.subtopicId).toBe(subtopic);expect(q.tags).toContain(tag);
      if(['ADAPTED-FOCUSED-RTL-FIFO-0001','ADAPTED-INTEGRATION-AXIL-0001'].includes(id))expect(guidanceFor(q)?.steps).toHaveLength(3);
      else expect(guidanceFor(q)).toBeUndefined();
    }
  });
  it('旧CDC作答、图片/笔记/收藏和题面可恢复，重做采用06新版本，学习统计跟随当前分类',async()=>{
    const current=questions.find(q=>q.id==='ORIGINAL-CDC-0005')!;
    const old={...structuredClone(current),topicId:'04',subtopicId:'rdc-reset',contentVersion:current.contentVersion-1};
    const store=make();let saved=await store.begin(old);
    const image={id:'saved-image',name:'旧作答.png',dataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6xkAAAAASUVORK5CYII='};
    saved=await store.change(old.id,saved,r=>saveAnswerImages(r,[image]));
    saved=await store.change(old.id,saved,r=>saveDraft(r,'旧版独立作答'));
    saved=await store.change(old.id,saved,r=>selfGrade(revealAnswer(r,new Date().toISOString(),true),'good',new Date().toISOString()));
    await store.saveRecord('notes',old.id,'原专题笔记');await store.saveRecord('bookmarks',old.id,true);
    await store.saveRecord('noteImages',old.id,[image]);
    expect((await store.begin(current)).round.snapshot.question.topicId).toBe('04');
    const fresh=await store.begin(current,true);expect(fresh.round.snapshot.question.topicId).toBe('06');expect(fresh.round.draft).toBeUndefined();
    const backup=JSON.parse(await store.exportJSON());expect(validateBackup(backup).snapshots).toHaveLength(2);
    const restored=make();await restored.applyImport(await restored.previewImport(backup,'replace',[old.id]));
    const state=await restored.read();expect(state.data.events[0]).toMatchObject({questionId:old.id,answer:'旧版独立作答'});
    expect(state.data.events[0].images).toEqual([image]);expect(state.data.records.find(r=>r.namespace==='noteImages')?.value).toEqual([image]);
    expect(state.data.records.find(r=>r.namespace==='notes')?.value).toBe('原专题笔记');expect(state.data.records.find(r=>r.namespace==='bookmarks')?.value).toBe(true);
    const report=buildLearningStats(questions,state.data.events,Date.now());
    expect(report.byTopic.get('06')?.practicedQuestions).toBe(1);expect(report.byTopic.get('04')?.practicedQuestions).toBe(0);
  });
});
