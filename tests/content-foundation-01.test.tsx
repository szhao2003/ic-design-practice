import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { questions } from '../src/data/question-bank';
import { gradeAnswer } from '../src/domain/grading';
import { ReferenceAnswer } from '../src/components/QuestionContent';
const get=(id:string)=>questions.find(q=>q.id===`ADAPTED-FOUNDATION-${id}`)!;

describe('跨专题基础第一批：公式、枚举与采样模型',()=>{
  it('新增八题填补四个专题，来源与版本元数据完整',()=>{
    const batch=questions.filter(q=>q.id.startsWith('ADAPTED-FOUNDATION-'));
    expect(batch).toHaveLength(8);expect(questions.filter(q=>!/^ADAPTED-(TOOLSFPGA|CORE|SYSTEM|EXTENSION|CORE3|MINI|FOCUSED|INTEGRATION|BOUNDARY|SAMPLING|CODEC|BUSTIMING|VERIFYPOWER|ARCHTOOLS|STARTER|TIMINGSTART|OPPREC|EXAMBASE|EXAMSV)-/.test(q.id))).toHaveLength(90);
    for(const topic of ['08','09','10','12'])expect(batch.filter(q=>q.topicId===topic)).toHaveLength(2);
    for(const q of batch){
      expect(q.contentVersion).toBe(1);expect(q.source.questionFidelity).toBe('topic_only_reconstruction');
      expect(q.source.sourceClaimVerification).toBe('checked');expect(q.source.url).toMatch(/^https:/);
    }
  });
  it('动态按三项缩放，静态不缩放；支持 W 到 mW 换算',()=>{
    const total=80*.5*.8**2*.75+20;
    expect(total).toBeCloseTo(39.2);
    expect(gradeAnswer(get('POWER-0001'),{raw:String(total/1000),unit:'W'})).toMatchObject({valid:true,isCorrect:true});
    expect(gradeAnswer(get('POWER-0001'),{raw:String(100*.24),unit:'mW'})).toMatchObject({isCorrect:false});
  });
  it('门控使能在高相位变化：原始 AND 截短而低透明锁存保持',()=>{
    let held=1;
    const samples=[{clk:1,en:1},{clk:1,en:0},{clk:0,en:0}].map(({clk,en})=>{
      if(!clk)held=en;
      return {raw:clk&en,gated:clk&held};
    });
    expect(samples).toEqual([{raw:1,gated:1},{raw:0,gated:1},{raw:0,gated:0}]);
    expect(gradeAnswer(get('POWER-0002'),['B','D'])).toMatchObject({isCorrect:true});
  });
  it('两拍前件先定位结束沿，再比较 overlapped 与 non-overlapped',()=>{
    const a=[1,0,1,0,0],b=[0,1,0,1,0],c=[0,1,1,1,0];
    const attempts=a.flatMap((value,start)=>value&&b[start+1]===1?[{start,end:start+1}]:[]);
    expect(attempts).toEqual([{start:0,end:1},{start:2,end:3}]);
    expect(attempts.map(({end})=>({edge:end+1,pass:c[end+1]===1}))).toEqual([{edge:2,pass:true},{edge:4,pass:false}]);
    expect(attempts.map(({end})=>c[end]===1)).toEqual([true,true]);
    const html=renderToStaticMarkup(<ReferenceAnswer question={get('DV-0001')}/>);
    expect(html).toContain('<table>');expect((html.match(/<th>/g)??[]).length).toBe(7);
  });
  it('cross 用有效组合集合求分母，重复及忽略样本不多计',()=>{
    const legal=new Set([0,1].flatMap(mode=>[0,1,2].filter(len=>!(mode===1&&len===0)).map(len=>`${mode}:${len}`)));
    const samples=[[0,0],[0,1],[1,2],[0,1],[1,0]];
    const hits=new Set(samples.map(([m,l])=>`${m}:${l}`).filter(s=>legal.has(s)));
    expect(legal.size).toBe(5);expect(hits.size).toBe(3);
    expect(gradeAnswer(get('DV-0002'),{raw:String(hits.size/legal.size*100),unit:'%'})).toMatchObject({isCorrect:true});
  });
  it('直接映射按实际行替换模拟，0x1000 只冲突行0',()=>{
    const cache=new Map<number,number>();
    const hits=[0,0x10,0x1000,0,0x10].map(address=>{
      const block=Math.floor(address/16),line=block%256,tag=Math.floor(block/256);
      const hit=cache.get(line)===tag;cache.set(line,tag);return hit;
    });
    expect(hits).toEqual([false,false,false,false,true]);
    expect(gradeAnswer(get('ARCH-0001'),{raw:String(hits.filter(h=>!h).length)})).toMatchObject({isCorrect:true});
    expect(32-Math.log2(16)-Math.log2(4096/16)).toBe(20);
  });
  it('有限五级流水线累计填充与不重叠惩罚',()=>{
    const retireEdges=Array.from({length:100},(_,index)=>index+5);
    const baseline=retireEdges.at(-1)!;
    const bubbles=Array(12).fill(1).concat(Array(8).fill(2)).reduce((sum:number,n:number)=>sum+n,0);
    expect(baseline).toBe(104);expect(bubbles).toBe(28);
    expect(gradeAnswer(get('ARCH-0002'),{raw:String((baseline+bubbles)/retireEdges.length)})).toMatchObject({isCorrect:true});
  });
  it('scan 位数组模型检查沿前读出和沿后移位',()=>{
    let bits=[0,1,0,1]; // q0..q3, independent of packed-shift arithmetic
    const read:number[]=[],states:string[]=[];
    for(const si of [1,0,1,1]){
      read.push(bits[3]);bits=[si,...bits.slice(0,3)];states.push([...bits].reverse().join(''));
    }
    expect(read).toEqual([1,0,1,0]);expect(states).toEqual(['0101','1010','0101','1011']);
    const q=get('DFT-0001');expect('referenceAnswerMd'in q&&q.referenceAnswerMd).toContain('| E3 | 0101 | 1 | 0 | 1011 |');
  });
  it('穷举所有8组输入，stuck-at-0 只能由110激活并传播',()=>{
    const detects=[];
    for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let c=0;c<2;c++)if(((a&b)|c)!==(0|c))detects.push([a,b,c]);
    expect(detects).toEqual([[1,1,0]]);
    expect(gradeAnswer(get('DFT-0002'),['A'])).toMatchObject({isCorrect:true});
  });
});
