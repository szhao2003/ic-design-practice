import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { imageListSchema, prepareImage, type ImageAttachment } from '../src/domain/image-attachments';
import { createRound, saveAnswerImages, revealAnswer, selfGrade, startGuidedPractice } from '../src/domain/practice';
import { canViewRoundLearning } from '../src/components/RoundLearningGate';
import { validateBackup } from '../src/storage/backup-schema';
import { LearningStore } from '../src/storage/learning-store';
import { manual, single, at, later } from './fixtures';
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6xkAAAAASUVORK5CYII=';
const image:ImageAttachment={id:'image-one',name:'波形.png',dataUrl:png};
const stores:LearningStore[]=[];
const make=(name=crypto.randomUUID(),fail?:()=>void)=>{const s=new LearningStore(name,fail);stores.push(s);return s;};
afterEach(async()=>{vi.unstubAllGlobals();await Promise.all(stores.splice(0).map(s=>s.close()));});
describe('图片作答与备份',()=>{
  it('图片单独作为独立作答依据，自评后锁定并保留不可变历史',()=>{
    const original=createRound('r',manual,at);
    const draft=saveAnswerImages(original,[image]);
    expect(original.images).toBeUndefined();
    const complete=selfGrade(revealAnswer(draft,later,true),'good',later);
    expect(complete.events[0]).toMatchObject({kind:'self_graded',independent:true,images:[image],effectiveGrade:'good'});
    expect(()=>saveAnswerImages(complete,[])).toThrow('锁定');
    expect(()=>saveAnswerImages(createRound('auto',single,at),[image])).toThrow();
    const reset=createRound('next',manual,later);
    expect(reset.images).toBeUndefined();expect(canViewRoundLearning(reset)).toBe(false);
    expect(complete.events[0].images).toEqual([image]);
  });
  it('图片作答在辅助引导下仍不算独立掌握',()=>{
    let round=saveAnswerImages(createRound('assist',manual,at),[image]);
    round=startGuidedPractice(round,{steps:[{title:'一步',promptMd:'提示'}],checks:['检查']},later);
    expect(round.events[0].images).toEqual([image]);
    round={...round,guidance:{...round.guidance!,currentStep:1}};
    expect(selfGrade(round,'good',later).events.at(-1)).toMatchObject({effectiveGrade:'partial',independent:false,images:[image]});
  });
  it('刷新重开、图片删除、导出恢复、重复合并和重做都保留正确关联',async()=>{
    const name=crypto.randomUUID();let s=make(name);
    let saved=await s.begin(manual);
    saved=await s.change(manual.id,saved,r=>saveAnswerImages(r,[image]));
    await s.close();s=make(name);
    saved=await s.begin(manual);expect(saved.round.images).toEqual([image]);
    saved=await s.change(manual.id,saved,r=>saveAnswerImages(r,[]));expect(saved.round.images).toBeUndefined();
    saved=await s.change(manual.id,saved,r=>saveAnswerImages(r,[image]));
    saved=await s.change(manual.id,saved,r=>selfGrade(revealAnswer(r,new Date().toISOString(),true),'good',new Date().toISOString()));
    await s.saveRecord('notes',manual.id,'看图复盘');
    await s.saveRecord('noteImages',manual.id,[image]);
    const backup=JSON.parse(await s.exportJSON());expect(validateBackup(backup).events[0].images).toEqual([image]);
    const restored=make();
    for(let i=0;i<2;i++){const preview=await restored.previewImport(backup,'merge',[manual.id]);await restored.applyImport(preview);}
    expect((await restored.read()).data.events).toHaveLength(1);
    expect((await restored.begin(manual)).round.images).toEqual([image]);
    const reset=await restored.begin(manual,true);expect(reset.round.images).toBeUndefined();
    expect((await restored.read()).data.events[0].images).toEqual([image]);
    expect((await restored.read()).data.records.find(r=>r.namespace==='noteImages')?.value).toEqual([image]);
    await restored.saveRecord('noteImages',manual.id,[],true);
    expect(validateBackup(JSON.parse(await restored.exportJSON())).records.find(r=>r.namespace==='noteImages')?.deleted).toBe(true);
  });
  it('旧备份继续可读，拒绝脚本URL、伪装格式、超量和重复图片ID',async()=>{
    expect(validateBackup({schemaVersion:1,events:[],snapshots:[],records:[],sessions:[]})).toMatchObject({schemaVersion:1});
    for(const dataUrl of ['javascript:alert(1)','data:image/svg+xml;base64,PHN2Zz4=','https://example.com/p.png','data:image/png;base64,PGh0bWw+'])expect(imageListSchema.safeParse([{...image,dataUrl}]).success).toBe(false);
    expect(imageListSchema.safeParse(Array.from({length:7},(_,i)=>({...image,id:String(i)}))).success).toBe(false);
    expect(imageListSchema.safeParse([image,image]).success).toBe(false);
    const s=make();await expect(s.saveRecord('noteImages','q',[{...image,dataUrl:'bad'}])).rejects.toThrow();
  });
  it('存储失败回滚图片和版本，返回可操作的空间不足提示',async()=>{
    let fail=false;const s=make(crypto.randomUUID(),()=>{if(fail)throw new DOMException('full','QuotaExceededError');});
    const saved=await s.begin(manual);fail=true;
    await expect(s.change(manual.id,saved,r=>saveAnswerImages(r,[image]))).rejects.toThrow('空间不足');
    fail=false;expect((await s.begin(manual)).round.images).toBeUndefined();
  });
  it('本地压缩等比缩放并释放解码资源，错误文件不保存',async()=>{
    const close=vi.fn(), drawImage=vi.fn(), canvas={width:0,height:0,getContext:()=>({fillStyle:'',fillRect:vi.fn(),drawImage}),toDataURL:()=> 'data:image/jpeg;base64,/9j/AA=='};
    vi.stubGlobal('createImageBitmap',vi.fn(async()=>({width:3200,height:1600,close})));
    vi.stubGlobal('document',{createElement:()=>canvas});
    const prepared=await prepareImage(new File(['image'],'test.png',{type:'image/png'}));
    expect([canvas.width,canvas.height]).toEqual([1600,800]);expect(prepared.name).toBe('test.png');expect(prepared.dataUrl).toContain('image/jpeg');expect(close).toHaveBeenCalledOnce();
    await expect(prepareImage(new File(['<svg>'],'x.svg',{type:'image/svg+xml'}))).rejects.toThrow('JPG');
  });
});
