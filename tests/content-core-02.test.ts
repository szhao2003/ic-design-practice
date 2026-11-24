import { describe,expect,it } from 'vitest';
import { questions } from '../src/data/question-bank';
import { gradeAnswer } from '../src/domain/grading';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-CORE-${id}`)!;
describe('核心进阶第二批：独立边界及状态模型',()=>{
  it('新增8题，来源明确，旧98题保留',()=>{
    const batch=questions.filter(q=>q.id.startsWith('ADAPTED-CORE-'));
    expect(batch).toHaveLength(8);expect(questions).toHaveLength(106);
    for(const q of batch){expect(q.contentVersion).toBe(1);expect(q.source).toMatchObject({kind:'practice_collection',evidenceGrade:'C',questionFidelity:'topic_only_reconstruction',sourceClaimVerification:'checked'});}
  });
  it('级间重分配用下界与允许范围枚举核对最优点',()=>{
    let best=Infinity,bestDelta=0;
    for(let ticks=0;ticks<=2000;ticks++){
      const delta=ticks/1000,period=Math.max(2.4+delta,5.6-delta,2)+.6;
      if(period<best){best=period;bestDelta=delta;}
    }
    expect(best).toBeCloseTo(4.6);expect(bestDelta).toBeCloseTo(1.6);
    expect(gradeAnswer(get('STA-0001'),{raw:String(1000/best),unit:'MHz'})).toMatchObject({isCorrect:true});
  });
  it('双时钟事件仿真：同步级与状态机均读取沿前值',()=>{
    let req=0,ack=0,r1=0,r2=0,a1=0,a2=0,source='IDLE',destination='IDLE',sent=0;
    const times:Record<string,number>={};
    for(let time=0;time<=160;time+=5){
      if(time%10===0){
        const oldA1=a1,oldA2=a2;a1=ack;a2=oldA1;
        if(source==='IDLE'){req=1;source='WAIT_HI';sent++;if(sent===2)times.second=time;}
        else if(source==='WAIT_HI'&&oldA2===1){req=0;source='WAIT_LO';times.reqDown=time;}
        else if(source==='WAIT_LO'&&oldA2===0){source='IDLE';times.idle=time;}
      }
      if(time>=5&&(time-5)%20===0){
        const oldR1=r1,oldR2=r2;r1=req;r2=oldR1;
        if(destination==='IDLE'&&oldR2===1){ack=1;destination='WAIT_LO';times.capture=time;}
        else if(destination==='WAIT_LO'&&oldR2===0){ack=0;destination='IDLE';times.ackDown=time;}
      }
    }
    expect(times).toEqual({capture:45,reqDown:70,ackDown:125,idle:150,second:160});
  });
  it('AXI按实际字节地址枚举第一段边界，并核对AxLEN',()=>{
    const start=0xf90,bytes=16,firstPage=Math.floor(start/4096);
    const fitting=Array.from({length:12},(_,i)=>start+i*bytes).filter(addr=>Math.floor((addr+bytes-1)/4096)===firstPage);
    expect(fitting).toHaveLength(7);expect(fitting.at(-1)).toBe(0xff0);
    expect(gradeAnswer(get('AXI-0001'),{raw:String(fitting.length-1)})).toMatchObject({isCorrect:true});
  });
  it('同ID筛选后保持A先C，不强制跨ID全局FIFO',()=>{
    const traces=[['B','A','C'],['C','B','A'],['A','C','B'],['A','B','C']];
    expect(traces.map(t=>t.filter(x=>x!=='B').join(''))).toEqual(['AC','CA','AC','AC']);
    expect(gradeAnswer(get('AXI-0002'),['B'])).toMatchObject({isCorrect:true});
  });
  it('disable中止旧义务，释放后只检查新请求',()=>{
    const req=[1,1,1,0,1,0],gnt=[0,0,0,1,0,0],rst=[1,0,1,1,1,1];
    let pending:number|undefined;
    const outcomes:Record<number,string>={};
    for(let edge=0;edge<6;edge++){
      // Actual reset assertion occurs between E0 and E1.
      if(edge===1&&pending!==undefined){outcomes[pending]='aborted';pending=undefined;}
      if(!rst[edge]){outcomes[edge]='disabled';continue;}
      if(pending!==undefined){outcomes[pending]=gnt[edge]?'pass':'fail';pending=undefined;}
      if(req[edge])pending=edge;
    }
    expect(outcomes).toEqual({0:'aborted',1:'disabled',2:'pass',4:'fail'});
  });
  it('输入全覆盖不等于输出正确：独立枚举加法反例',()=>{
    const inputs=[[0,0],[1,0],[0,1],[1,1]];
    const mismatches=inputs.filter(([a,b])=>a+b!==(a^b));
    expect(new Set(inputs.map(p=>p.join(','))).size).toBe(4);expect(mismatches).toEqual([[1,1]]);
    expect(gradeAnswer(get('DV-0002'),['B','D'])).toMatchObject({isCorrect:true});
  });
  it('dist把总范围权重平分，百分比按全部权重归一',()=>{
    const weights=[1,...Array(3).fill(6/3)],total=weights.reduce((a,b)=>a+b,0);
    expect(weights).toEqual([1,2,2,2]);
    expect(gradeAnswer(get('DV-0004'),{raw:String(weights[2]/total*100),unit:'%'})).toMatchObject({isCorrect:true});
  });
});
