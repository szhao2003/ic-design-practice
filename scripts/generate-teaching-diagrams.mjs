import { mkdir, writeFile } from 'node:fs/promises';
// Deterministic sampled-edge values; no illustrative interpolation of CDC timing.
const figures = [
  {file:'cdc-2ff',title:'CDC 2-FF · NBA edge-by-edge',note:'Input sampled at E0…E4; s1/s2 shown AFTER NBA. Initial s1=s2=0. Ideal digital model only.',edges:['E0','E1','E2','E3','E4'],rows:[['input (sampled)',[0,1,1,0,0]],['s1 (after NBA)',[0,1,1,0,0]],['s2 (after NBA)',[0,0,1,1,0]]]},
  {file:'ahb-wait',title:'AHB-Lite · address/data overlap',note:'ALL bus values sampled AT rising edges. E2 completes A data and accepts B address.',edges:['E0','E1','E2','E3'],rows:[['HREADY',[1,0,1,1]],['HTRANS',['NONSEQ','NONSEQ','NONSEQ','IDLE']],['HADDR',['0x100 (A)','0x104 (B)','0x104 (B)','—']],['HRDATA',['—','waiting','DATA_A','DATA_B']],['accepted',['A address','none','A data + B addr','B data']]]},
  {file:'apb-access',title:'APB3 · setup / wait / complete',note:'Stage and controls sampled AT cycle-end edge. Complete only at E2; IDLE after E2.',edges:['E0','E1','E2'],rows:[['phase',['SETUP','ACCESS wait','ACCESS done']],['PSEL',[1,1,1]],['PENABLE',[0,1,1]],['PREADY',['ignored',0,1]],['completion',[0,0,1]]]},
  {file:'serial-shift',title:'Serial shift · 8 sampled bits → 0xB2',note:'serial_in sampled AT edge; shift/byte_valid shown AFTER NBA. Initial shift=0.',edges:['E0','E1','E2','E3','E4','E5','E6','E7'],rows:[['serial_in',[1,0,1,1,0,0,1,0]],['shift (hex)',['01','02','05','0B','16','2C','59','B2']],['byte_valid',[0,0,0,0,0,0,0,1]]]},
];
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
await mkdir('public/diagrams/content-v15',{recursive:true});
for(const f of figures){
  const cell=f.edges.length>5?100:160,left=180,width=Math.max(760,left+cell*f.edges.length+24),height=170+f.rows.length*65;
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">${escape(f.title)}</title><desc id="desc">${escape(f.note)} ${escape(f.rows.map(([n,v])=>n+': '+v.join(', ')).join('; '))}</desc><rect width="100%" height="100%" rx="12" fill="#f5f8fd"/><g font-family="Consolas,monospace" font-size="14" fill="#203b5c"><text x="20" y="30" font-size="20" font-weight="bold">${escape(f.title)}</text><text x="20" y="57" font-size="12">${escape(f.note)}</text>`;
  f.edges.forEach((e,i)=>{
    const x=left+i*cell;
    svg+=`<path d="M${x} 80 V${height-25}" stroke="#c5d4e9" stroke-dasharray="4 4"/><text x="${x+8}" y="94">${e} ↑</text>`;
  });
  f.rows.forEach(([name,values],r)=>{
    const y=140+r*65;
    svg+=`<text x="16" y="${y+6}">${escape(name)}</text>`;
    values.forEach((v,i)=>{
      const x=left+i*cell;
      if(values.every(v=>v===0||v===1)){
        const level=y+(v? -12:12),old=values[i-1];
        svg+=`<path d="M${x} ${i&&old!==v?y+(old?-12:12):level} V${level} H${x+cell}" fill="none" stroke="#285fc5" stroke-width="2.5"/><text x="${x+cell/2-4}" y="${y+34}">${v}</text>`;
      }else svg+=`<rect x="${x+2}" y="${y-19}" width="${cell-4}" height="38" fill="#e7effb" stroke="#a8bddc"/><text x="${x+cell/2}" y="${y+5}" text-anchor="middle" font-size="13">${escape(v)}</text>`;
    });
  });
  svg+='</g></svg>\n';
  await writeFile(`public/diagrams/content-v15/${f.file}.svg`,svg);
}
console.log('Generated 4 deterministic timing diagrams.');
