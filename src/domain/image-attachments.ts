import { z } from 'zod';

export const MAX_IMAGES = 6;
export const MAX_IMAGE_BYTES = 1024 * 1024;
export const imageAttachmentSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(160),
  dataUrl: z.string().max(Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 64).refine(value => {
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
    if (!match || match[2].length % 4 !== 0) return false;
    try {
      const bytes = atob(match[2]);
      if (bytes.length > MAX_IMAGE_BYTES) return false;
      return match[1] === 'jpeg' ? bytes.startsWith('\xff\xd8\xff')
        : match[1] === 'png' ? bytes.startsWith('\x89PNG\r\n\x1a\n')
          : bytes.startsWith('RIFF') && bytes.slice(8,12) === 'WEBP';
    } catch { return false; }
  }, '图片格式或大小不受支持。'),
}).strict();
export const imageListSchema = z.array(imageAttachmentSchema).max(MAX_IMAGES).refine(
  items => new Set(items.map(item => item.id)).size === items.length, '图片ID不能重复。',
);
export type ImageAttachment = z.infer<typeof imageAttachmentSchema>;

// Decode and re-encode locally: never upload images or retain original metadata.
export async function prepareImage(file: File): Promise<ImageAttachment> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw Error('请选择 JPG、PNG 或 WebP 图片。');
  if (file.size > 15 * 1024 * 1024) throw Error('单张原图请小于15MB。');
  const bitmap = await createImageBitmap(file).catch(() => { throw Error('无法读取这张图片，请换一张有效图片。'); });
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 60_000_000) throw Error('图片尺寸过大，请先裁剪。');
    const ratio = Math.min(1,1600 / Math.max(bitmap.width,bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1,Math.round(bitmap.width*ratio));
    canvas.height = Math.max(1,Math.round(bitmap.height*ratio));
    const context = canvas.getContext('2d');
    if (!context) throw Error('当前浏览器无法处理图片。');
    context.fillStyle = '#fff'; context.fillRect(0,0,canvas.width,canvas.height);
    context.drawImage(bitmap,0,0,canvas.width,canvas.height);
    let dataUrl = canvas.toDataURL('image/jpeg',0.85);
    if (dataUrl.length > Math.ceil(MAX_IMAGE_BYTES/3)*4+32) dataUrl = canvas.toDataURL('image/jpeg',0.65);
    const result = imageAttachmentSchema.safeParse({id:crypto.randomUUID(),name:(file.name || '粘贴的图片').slice(0,160),dataUrl});
    if (!result.success) throw Error('压缩后仍超过1MB，请先裁剪图片再添加。');
    return result.data;
  } finally { bitmap.close(); }
}
