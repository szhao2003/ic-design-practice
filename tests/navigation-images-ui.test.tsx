import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from '../src/app/App';
import { ImageAttachments, ImageGallery } from '../src/components/ImageAttachments';
import { ReviewPage } from '../src/pages/ReviewPage';
const mock = vi.hoisted(()=>({records:[] as {id:string;namespace:string;value:unknown;deleted:boolean}[]}));
vi.mock('../src/storage/LearningContext',()=>({
  useLearning:()=>({state:{progress:[],data:{sessions:[],records:mock.records,events:[],snapshots:[],practiceSessions:[]}},store:{},refresh:async()=>{}}),
  LearningProvider:({children}:{children:React.ReactNode})=>children,
}));
describe('导航简化和图片控件',()=>{
  it('只有图片没有文字的笔记仍出现在笔记列表，空或已移除附件不计入',()=>{
    mock.records=[
      {id:'ORIGINAL-CDC-0001',namespace:'noteImages',value:[{id:'img'}],deleted:false},
      {id:'ORIGINAL-CDC-0002',namespace:'noteImages',value:[],deleted:false},
      {id:'ORIGINAL-STA-0001',namespace:'noteImages',value:[{id:'old'}],deleted:true},
    ];
    const html=renderToStaticMarkup(<MemoryRouter initialEntries={['/review?tab=notes']}><ReviewPage/></MemoryRouter>);
    expect(html).toContain('两级同步器能保证什么');expect(html).not.toContain('快到慢的短脉冲为什么会丢失');expect(html).not.toContain('单周期路径的 setup slack');
    mock.records=[];
  });
  it('知识专题保留15个专题卡片，移除两个额外题目目录及重复导航',()=>{
    const html=renderToStaticMarkup(<MemoryRouter initialEntries={['/topics']}><AppShell/></MemoryRouter>);
    expect(html).not.toContain('核心专题练习路径');expect(html).not.toContain('综合题分步引导');expect(html).not.toContain('专项练习');
    expect(html).toContain('全部知识专题');expect((html.match(/class="topic-card"/g)??[])).toHaveLength(15);
    const nav=html.match(/<nav[\s\S]*?<\/nav>/)?.[0]??'';
    expect((nav.match(/<a /g)??[])).toHaveLength(7);expect(nav).toContain('题库');expect(nav).not.toContain('href="#/practice"');
  });
  it('图片输入支持多选，已锁定作答不显示移除按钮',()=>{
    const image={id:'one',name:'状态机.png',dataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6xkAAAAASUVORK5CYII='};
    const editable=renderToStaticMarkup(<ImageAttachments label="添加作答图片" images={[image]} onChange={async()=>{}}><textarea aria-label="作答"/></ImageAttachments>);
    expect(editable).toContain('type="file"');expect(editable).toContain('multiple=""');expect(editable).toContain('可粘贴截图');expect(editable).toContain('移除图片');
    const locked=renderToStaticMarkup(<ImageAttachments label="添加作答图片" images={[image]} disabled onChange={async()=>{}}/>);
    expect(locked).toContain('disabled=""');expect(locked).not.toContain('移除图片');expect(locked).toContain('放大图片');
    expect(renderToStaticMarkup(<ImageGallery images={[image]}/>)).toContain('alt="状态机.png"');
  });
});
