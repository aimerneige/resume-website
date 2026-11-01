import type { ResumeData } from '../types';
import { defaultStyle } from '../defaults';
import { sampleData } from '../samples';
import type { Locale } from '../i18n';
import { STORAGE_KEYS } from './storageKeys';

const KEY = STORAGE_KEYS.draft;

export function normalize(raw: unknown): ResumeData | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Partial<ResumeData>;
  if (d.version !== 1 || !d.basic || !Array.isArray(d.sections)) return null;
  const style = { ...defaultStyle(), ...(d.style ?? {}) };
  // 旧版本只区分黑体 / 宋体
  if ((style.fontFamily as string) === 'sans') style.fontFamily = 'noto-sans-sc';
  if ((style.fontFamily as string) === 'serif') style.fontFamily = 'noto-serif-sc';
  // 旧版本只有「居中 / 居左」
  const legacy = (d.style as { headerAlign?: 'center' | 'left' } | undefined)?.headerAlign;
  if (legacy && !d.style?.headerLayout) style.headerLayout = legacy;
  delete (style as { headerAlign?: unknown }).headerAlign;
  return {
    ...(d as ResumeData),
    docTitle: d.docTitle ?? '',
    style,
    basic: { ...d.basic, links: d.basic.links ?? [] },
  };
}

export function loadData(locale: Locale): ResumeData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw)) ?? sampleData(locale);
  } catch {
    /* 忽略损坏的数据 */
  }
  return sampleData(locale);
}

export function saveData(data: ResumeData): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/** 读取图片 → 裁成 3:4 并缩小尺寸。保留原始色彩：照片是简历中唯一的彩色部分 */
export function processAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const W = 300;
      const H = 400;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;
      const scale = Math.max(W / img.width, H / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image'));
    };
    img.src = url;
  });
}
