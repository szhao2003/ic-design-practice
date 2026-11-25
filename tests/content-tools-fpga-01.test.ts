import { describe,expect,it } from 'vitest';
import { questions } from '../src/data/question-bank';
import { topics } from '../src/data/topics';
import { gradeAnswer } from '../src/domain/grading';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-TOOLSFPGA-${id}`)!;
describe('电路工具与FPGA第一批：全专题与独立计算',()=>{
  it('新增八题使15专题均有内容，来源可追溯，旧90题仍在',()=>{
    const batch=questions.filter(q=>q.id.startsWith('ADAPTED-TOOLSFPGA-'));
    expect(batch).toHaveLength(8);expect(questions.filter(q=>!/^ADAPTED-(CORE|SYSTEM|EXTENSION|CORE3|MINI|FOCUSED|INTEGRATION|BOUNDARY|SAMPLING|CODEC|BUSTIMING|VERIFYPOWER|ARCHTOOLS|STARTER|TIMINGSTART|OPPREC|EXAMBASE)-/.test(q.id))).toHaveLength(98);
    for(const topic of topics)expect(questions.filter(q=>q.topicId===topic.id).length).toBeGreaterThanOrEqual(2);
    for(const q of batch){expect(q.contentVersion).toBe(1);expect(q.source).toMatchObject({kind:'practice_collection',evidenceGrade:'C',questionFidelity:'topic_only_reconstruction',sourceClaimVerification:'checked'});expect(q.source.company).toBeUndefined();}
  });
  it('CMOS穷举开关通路，互补网络产生NAND且稳定时不直通',()=>{
    for(const a of [0,1])for(const b of [0,1]){
      const pullUp=!a||!b,pullDown=!!(a&&b);
      expect(pullUp&&pullDown).toBe(false);expect(Number(pullUp)).toBe(1-(a&b));
    }
    expect(gradeAnswer(get('CMOS-0001'),['B','C'])).toMatchObject({isCorrect:true});
  });
  it('RC从电压达到50%的条件枚举整数扇出边界',()=>{
    const normalizedAtBudget=(n:number)=>1-Math.exp(-70e-12/(2000*(15+5*n)*1e-15));
    let max=0;for(let n=0;n<100;n++)if(normalizedAtBudget(n)>=.5)max=n;
    expect(max).toBe(7);expect(normalizedAtBudget(8)).toBeLessThan(.5);
    expect(gradeAnswer(get('CMOS-0002'),{raw:String(max)})).toMatchObject({isCorrect:true});
  });
  it('C位域对全部旧字段验证：清位后赋值保留外部位',()=>{
    for(let old=0;old<16;old++){
      const v=(0x12345608|(old<<4))>>>0;
      const updated=((v&~0xf0)|0xa0)>>>0;
      expect(updated).toBe(0x123456a8);expect((updated&~0xf0)>>>0).toBe((v&~0xf0)>>>0);
    }
    expect(gradeAnswer(get('TOOLS-0002'),['A'])).toMatchObject({isCorrect:true});
  });
  it('LUT枚举所有16个输入，与候选INIT逐位比较',()=>{
    const patterns=[0x6660,0x0666,0x9990,0x6000];
    const matches=patterns.map(init=>Array.from({length:16},(_,index)=>{
      const bits=[0,1,2,3].map(i=>(index>>i)&1);
      return ((init>>index)&1)===((bits[0]^bits[1])&(bits[2]|bits[3]));
    }).every(Boolean));
    expect(matches).toEqual([true,false,false,false]);expect(gradeAnswer(get('FPGA-0001'),['A'])).toMatchObject({isCorrect:true});
  });
  it('BRAM规则矩形拼接同时满足宽度和深度',()=>{
    const feasible=[];
    for(let banks=1;banks<=4;banks++)for(let widthBlocks=1;widthBlocks<=4;widthBlocks++)if(banks*1024>=3072&&widthBlocks*18>=24)feasible.push(banks*widthBlocks);
    const minimum=Math.min(...feasible);expect(minimum).toBe(6);
    expect(gradeAnswer(get('FPGA-0002'),{raw:String(minimum)})).toMatchObject({isCorrect:true});
  });
  it('误码概率用16种位模式累加而非只重复公式',()=>{
    let probability=0;
    for(let mask=0;mask<16;mask++){
      const bits=[0,1,2,3].map(i=>(mask>>i)&1);
      if(bits.reduce((a,b)=>a+b,0)===1)probability+=bits.reduce((p,b)=>p*(b ? 0.1 : 0.9),1);
    }
    expect(probability).toBeCloseTo(.2916);expect(gradeAnswer(get('PROB-0001'),{raw:String(probability*100),unit:'%'})).toMatchObject({isCorrect:true});
  });
  it('抽检枚举全部120个三元子集，其中64组至少有一个坏件',()=>{
    let total=0,detected=0;
    for(let a=0;a<10;a++)for(let b=a+1;b<10;b++)for(let c=b+1;c<10;c++){total++;if([a,b,c].some(i=>i<2))detected++;}
    expect(total).toBe(120);expect(detected).toBe(64);
    expect(gradeAnswer(get('PROB-0002'),{raw:String(detected/total*100),unit:'%'})).toMatchObject({isCorrect:true});
  });
});
