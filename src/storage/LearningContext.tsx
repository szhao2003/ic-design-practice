import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { LearningStore, type LearningState } from './learning-store';

const store = new LearningStore();
const Context = createContext<{ store: LearningStore; state: LearningState; refresh: () => Promise<void> } | null>(null);
export function LearningProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearningState>();
  const [error, setError] = useState('');
  const channel = useRef<BroadcastChannel | undefined>(undefined);
  const load = useCallback(async () => {
    try { setState(await store.read()); setError(''); }
    catch (error) { setError(error instanceof Error ? error.message : '本地数据库不可用。'); throw error; }
  }, []);
  const refresh = useCallback(async () => { await load(); channel.current?.postMessage('updated'); }, [load]);
  useEffect(() => {
    void load().catch(() => {});
    const onFocus = () => { void load().catch(() => {}); };
    window.addEventListener('focus', onFocus);
    if (typeof BroadcastChannel !== 'undefined') {
      channel.current = new BroadcastChannel('ic-practice-updates');
      channel.current.onmessage = onFocus;
    }
    return () => { window.removeEventListener('focus', onFocus); channel.current?.close(); channel.current = undefined; };
  }, [load]);
  if (!state) return <div className="storage-start"><h1>IC Design Practice</h1>{error ? <><p role="alert">无法读取本地学习记录：{error}</p><p>请确认浏览器允许此网站使用存储。没有使用临时数据冒充保存成功。</p><button onClick={() => { void load().catch(() => {}); }}>重新连接</button></> : <p role="status">正在读取本地学习记录……</p>}</div>;
  return <Context.Provider value={{ store, state, refresh }}>{error && <div className="error-banner" role="alert">本地保存不可用：{error}。请先备份并检查浏览器存储权限。</div>}{children}</Context.Provider>;
}
export function useLearning() {
  const value = useContext(Context);
  if (!value) throw new Error('学习记录尚未初始化。');
  return value;
}
