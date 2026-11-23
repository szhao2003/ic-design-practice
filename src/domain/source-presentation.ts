// Preserve original source metadata and snapshots; use neutral labels in the UI.
export const displayTag = (tag: string) => tag.replace(/^YHCHub\s*考点改编$/i, '公开资料考点改编');
export const displaySourceNote = (note?: string) => (note ?? '').replace(/YHCHub\s*/gi, '').replace(/参考\s+练习汇编/g, '参考公开练习汇编');
