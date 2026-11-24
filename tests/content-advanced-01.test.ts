import { describe, expect, it } from 'vitest';
import { questions } from '../src/data/question-bank';
import { gradeAnswer } from '../src/domain/grading';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-ADVANCED-${id}`)!;

describe('进阶考点第一批：独立计算与状态模型',()=>{
  it('八道新题有来源，旧题仍在；不在公开标签中带出版社名',()=>{
    const batch=questions.filter(q=>q.id.startsWith('ADAPTED-ADVANCED-'));
    expect(batch).toHaveLength(8); expect(questions.filter(q=>!/^ADAPTED-(FOUNDATION|TOOLSFPGA|CORE|SYSTEM|EXTENSION|CORE3|MINI)-/.test(q.id))).toHaveLength(82);
    for(const q of batch){
      expect(q.contentVersion).toBe(1);
      expect(q.source).toMatchObject({kind:'practice_collection',evidenceGrade:'C',questionFidelity:'topic_only_reconstruction',sourceClaimVerification:'checked'});
      expect(q.source.company).toBeUndefined(); expect(q.source.note).not.toMatch(/YHCHub/i);
    }
  });
  it('setup/hold 修复区间与不同 min/max 方案独立核算',()=>{
    const maxArrival=.2+.3+2.5+.2, minArrival=.2+.08+.12+.05;
    const setupBudget=4.5-.25-.15-maxArrival, holdNeed=.5+.12+.03-minArrival;
    expect(holdNeed).toBeCloseTo(.2);expect(setupBudget).toBeCloseTo(.9);
    expect(gradeAnswer(get('STA-0001'),{raw:String(setupBudget),unit:'ns'})).toMatchObject({valid:true,isCorrect:true});
    const solutions=[{id:'A',s:.35-.20,h:-.12+.10},{id:'B',s:.35-.30,h:-.12+.15},{id:'C',s:.35-.45,h:-.12+.20},{id:'D',s:.35-.15,h:-.12+.15}].filter(x=>x.s>=0&&x.h>=0).map(x=>x.id);
    expect(gradeAnswer(get('STA-0002'),solutions)).toMatchObject({valid:true,isCorrect:true});
  });
  it('读暂停与同刻净变化：完整枚举事件而非平均带宽',()=>{
    const events=new Map<number,{write:number;read:number}>();
    for(let i=0;i<16;i++)events.set(i*10,{write:1,read:0});
    for(const t of [30,50,70,...Array.from({length:20},(_,i)=>150+i*20)]){
      const event=events.get(t)??{write:0,read:0};event.read=1;events.set(t,event);
    }
    let occupancy=0,peak=0;const table=new Map<number,number>();
    for(const [time,e] of [...events].sort(([a],[b])=>a-b)){
      occupancy+=e.write-(e.read&&occupancy+e.write>0?1:0);peak=Math.max(peak,occupancy);table.set(time,occupancy);
    }
    expect(peak).toBe(12);expect(table.get(140)).toBe(12);expect(table.get(150)).toBe(12);expect(occupancy).toBe(0);
    expect(gradeAnswer(get('FIFO-0001'),{raw:String(peak)})).toMatchObject({isCorrect:true});
  });
  it('Gray full 两位反相对所有合法深度8指针成立；本例是最后一个空位',()=>{
    const gray=(b:number)=>b^(b>>1);
    for(let r=0;r<16;r++)for(let used=0;used<=8;used++){
      const w=(r+used)%16;
      expect(gray(w)===(gray(r)^0b1100)).toBe(used===8);
    }
    expect(gray(15)).toBe(0b1000);expect(gray(7)).toBe(0b0100);
    const q=get('FIFO-0002');expect('correctOptionIds'in q&&q.correctOptionIds).toEqual(['A','C','D']);
  });
  it('四相接收只在 IDLE→WAIT_LOW 捕获一次，ACK 在撤销请求后落下',()=>{
    let waiting=false;let count=0;
    const rows=[0,1,1,1,0,0].map(req=>{
      if(!waiting&&req){count++;waiting=true;}else if(waiting&&!req)waiting=false;
      return {ack:Number(waiting),count};
    });
    expect(rows.map(r=>r.ack)).toEqual([0,1,1,1,0,0]);expect(count).toBe(1);
    const q=get('CDC-0001');expect('referenceAnswerMd'in q&&q.referenceAnswerMd).toContain('| D1 | IDLE | 1 | 是 | WAIT_LOW | 1 |');
  });
  it('AXI-Lite 独立握手与响应依赖；不能在地址接收前发B',()=>{
    const signals=[[1,0,1,1,0,0],[1,0,0,1,0,0],[1,1,0,1,0,0],[0,1,0,1,1,0],[0,1,0,1,1,1]];
    let address=false,data=false;const accepted={aw:[] as number[],w:[] as number[],b:[] as number[]};
    signals.forEach(([av,ar,wv,wr,bv,br],edge)=>{
      if(bv)expect(address&&data).toBe(true); // conditions held BEFORE this edge
      if(av&&ar){accepted.aw.push(edge);address=true;}if(wv&&wr){accepted.w.push(edge);data=true;}if(bv&&br)accepted.b.push(edge);
    });
    expect(accepted).toEqual({aw:[2],w:[0],b:[4]});
  });
});
