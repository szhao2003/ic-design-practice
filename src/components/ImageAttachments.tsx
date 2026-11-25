import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { MAX_IMAGES, prepareImage, type ImageAttachment } from '../domain/image-attachments';

export function ImageGallery({ images = [], onRemove, disabled = false }: { images?: ImageAttachment[]; onRemove?: (id:string)=>void; disabled?:boolean }) {
  const [selected,setSelected]=useState<ImageAttachment>();
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{if(selected)dialog.current?.showModal();},[selected]);
  return <>{!!images.length && <ul className="image-attachments">{images.map((image,index)=><li key={image.id}>
    <button type="button" className="image-thumbnail" onClick={()=>setSelected(image)} aria-label={`放大图片 ${index+1}：${image.name}`}><img src={image.dataUrl} alt={image.name} loading="lazy" /></button>
    <span className="image-name">{image.name}</span>
    {onRemove && <button type="button" className="button secondary" disabled={disabled} onClick={()=>onRemove(image.id)} aria-label={`移除图片 ${index+1}：${image.name}`}>移除</button>}
  </li>)}</ul>}
  <dialog ref={dialog} className="image-viewer" onClose={()=>setSelected(undefined)} aria-label="图片预览"><button type="button" className="button secondary" autoFocus onClick={()=>dialog.current?.close()}>关闭预览</button>{selected && <><p>{selected.name}</p><img src={selected.dataUrl} alt={selected.name} /></>}</dialog></>;
}

export function ImageAttachments({ images=[], onChange, disabled=false, label, children, onBusyChange }: {
  images?:ImageAttachment[]; onChange:(images:ImageAttachment[])=>Promise<void>; disabled?:boolean; label:string; children?:ReactNode; onBusyChange?:(busy:boolean)=>void;
}) {
  const id=useId(); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const pending=useRef(false);
  async function add(files:File[]) {
    if(disabled || pending.current || !files.length)return;
    if(images.length+files.length>MAX_IMAGES){setError(`每处最多保存${MAX_IMAGES}张图片，请先移除部分图片。`);return;}
    pending.current=true;setBusy(true);onBusyChange?.(true);setError('');
    try {
      const added:ImageAttachment[]=[];
      for(const file of files)added.push(await prepareImage(file));
      await onChange([...images,...added]);
    } catch(e){setError(e instanceof Error?e.message:'图片保存失败，请重试。');}
    finally{pending.current=false;setBusy(false);onBusyChange?.(false);}
  }
  async function remove(imageId:string){
    if(disabled || pending.current)return;
    pending.current=true;setBusy(true);onBusyChange?.(true);setError('');
    try{await onChange(images.filter(image=>image.id!==imageId));}
    catch(e){setError(e instanceof Error?e.message:'移除失败，请重试。');}
    finally{pending.current=false;setBusy(false);onBusyChange?.(false);}
  }
  return <div className="image-editor" onPaste={event=>{
    const files=Array.from(event.clipboardData.files);if(!files.length)return;
    event.preventDefault();void add(files);
  }}>
    {children}
    <label htmlFor={id}>{label}（可粘贴截图）</label>
    <input id={id} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={disabled||busy||images.length>=MAX_IMAGES} onChange={event=>{const files=Array.from(event.target.files??[]);event.target.value='';void add(files);}} />
    <p className="muted">JPG / PNG / WebP，每处最多6张。添加时在本机压缩为JPG，最长边1600像素、每张最多1MB，随学习备份导出。</p>
    {busy && <p role="status">正在处理并保存图片，请稍候……</p>}
    {error && <p role="alert" className="error-banner">{error}</p>}
    <ImageGallery images={images} disabled={disabled||busy} onRemove={disabled?undefined:id=>{void remove(id);}} />
  </div>;
}
