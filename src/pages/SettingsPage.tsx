import { useState } from 'react';
import { questions } from '../data/question-bank';
import { useLearning } from '../storage/LearningContext';
import type { ImportPreview } from '../storage/learning-store';

function download(name: string, content: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function SettingsPage() {
  const { store, state, refresh } = useLearning();
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [input, setInput] = useState<unknown>();
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState<ImportPreview>();
  const [confirmed, setConfirmed] = useState(false);
  const [clearText, setClearText] = useState<string | undefined>();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function action(work: () => Promise<void>) { setBusy(true); setError(''); setMessage(''); try { await work(); } catch (e) { setError(e instanceof Error ? e.message : '操作失败，原数据未被替换。'); } finally { setBusy(false); } }
  const issues = state.data.records.filter((r) => r.namespace === 'issues' && !r.deleted && r.value);
  return <><header className="page-heading"><p className="eyebrow">PREFERENCES & DATA</p><h1>设置与备份</h1><p>数据保存在当前浏览器。清除网站数据、更换设备或使用隐私模式可能丢失记录，请定期导出。</p></header>
    {error && <div className="error-banner" role="alert">{error}</div>}{message && <p className="notice" role="status">{message}</p>}
    <section className="panel"><h2>导出学习备份</h2><p>包含历次作答、题面快照、当前草稿、收藏、笔记、作答图片、笔记图片、纠错及复习依据。个人数据不会上传到服务器或项目仓库；含图片的完整备份可能较大，请耐心等待导入预览。</p><p>当前 {state.data.events.length} 条学习事件 · {state.data.snapshots.length} 份题面快照</p><div className="button-row"><button className="button primary" disabled={busy} onClick={() => { void action(async () => { const day = new Date().toLocaleDateString('sv-SE'); download(`ic-practice-progress-${day}.json`, await store.exportJSON()); setMessage('备份已生成，请保存到自己的设备。'); }); }}>导出 JSON 备份</button><button className="button secondary" disabled={busy || !issues.length} onClick={() => download('ic-practice-issues.json', JSON.stringify(issues, null, 2))}>导出纠错清单（{issues.length}）</button></div></section>
    <section className="panel"><h2>导入与恢复</h2><label htmlFor="backup-file">选择学习备份 JSON</label><input id="backup-file" type="file" accept=".json,application/json" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; setPreview(undefined); setConfirmed(false); setInput(undefined); setFileName(''); if (!file) return; void action(async () => { setInput(JSON.parse(await file.text())); setFileName(file.name); }); }} />
      <label htmlFor="import-mode">恢复方式</label><select id="import-mode" value={mode} disabled={busy} onChange={(e) => { setMode(e.target.value as 'merge' | 'replace'); setPreview(undefined); setConfirmed(false); }}><option value="merge">合并：保留现有历史，检查冲突并去重</option><option value="replace">覆盖：用备份替换全部本地学习数据</option></select><p>{mode === 'replace' ? '覆盖会删除当前数据中未包含在备份里的记录，请先导出备份。' : '相同 ID 但内容不同的作答会阻止合并，不会静默覆盖。'}</p>
      <button className="button secondary" disabled={busy || input === undefined} onClick={() => { void action(async () => { setPreview(undefined); setConfirmed(false); setPreview(await store.previewImport(input, mode, questions.map((q) => q.id))); }); }}>校验并预览导入</button>
      {preview && <div className="import-preview"><h3>导入预览：{fileName}</h3><p>结果将包含 {preview.data.events.length} 条学习事件、{preview.data.snapshots.length} 份题面、{preview.data.records.length} 条草稿/笔记/设置、{preview.data.sessions.length} 个模拟会话、{preview.data.practiceSessions?.length ?? 0} 轮连续练习。</p><p>未知 / 已移除题目 {preview.unknownIds.length} 道，历史仍保留；不计入当前可练题分母。</p><label className="inline-check"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />我确认{mode === 'replace' ? '覆盖全部本地学习数据' : '按上述结果合并学习数据'}</label><button className="button primary" disabled={busy || !confirmed} onClick={() => { void action(async () => { await store.applyImport(preview); setPreview(undefined); setConfirmed(false); setInput(undefined); await refresh(); setMessage('备份恢复成功，所有数据已在同一事务中保存。'); }); }}>确认{mode === 'replace' ? '覆盖恢复' : '合并导入'}</button></div>}
    </section>
    <section className="panel"><h2>清空本地学习数据</h2><p>仅清除本站在当前浏览器中的记录，题库保留。建议先导出备份。</p>{clearText === undefined ? <button className="button danger" disabled={busy} onClick={() => setClearText('')}>准备清空数据</button> : <><label htmlFor="confirm-clear">再次确认：输入“清空”</label><input id="confirm-clear" value={clearText} onChange={(e) => setClearText(e.target.value)} /><div className="button-row"><button className="button danger" disabled={busy || clearText !== '清空'} onClick={() => { void action(async () => { await store.clear(); await refresh(); setClearText(undefined); setPreview(undefined); setMessage('本地学习数据已清空。可导入备份恢复。'); }); }}>确认清空</button><button className="button secondary" onClick={() => setClearText(undefined)}>取消</button></div></>}</section>
  </>;
}
