import type { ResumeData } from '../types';
import { normalize } from './storage';

/**
 * 「我的简历」：用户手动保存的多份简历，存于浏览器 localStorage。
 * 与「草稿自动保存」相互独立：草稿是当前正在编辑的一份，随时覆盖；
 * 这里的每一份只在用户点击保存时更新。
 */
export interface SavedResume {
  id: string;
  name: string;
  savedAt: number;
  data: ResumeData;
}

const KEY = 'easycv:library:v1';
const CURRENT_KEY = 'easycv:current-slot';

export function loadLibrary(): SavedResume[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as SavedResume[];
    return list
      .map((it) => {
        const data = normalize(it.data);
        return data && it.id ? { ...it, data } : null;
      })
      .filter((x): x is SavedResume => !!x);
  } catch {
    return [];
  }
}

/** 写入失败（如存储空间不足）时抛出异常，由调用方提示用户 */
export function writeLibrary(list: SavedResume[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function loadCurrentSlot(): string | null {
  try {
    return localStorage.getItem(CURRENT_KEY);
  } catch {
    return null;
  }
}

export function writeCurrentSlot(id: string | null) {
  try {
    if (id) localStorage.setItem(CURRENT_KEY, id);
    else localStorage.removeItem(CURRENT_KEY);
  } catch {
    /* 忽略 */
  }
}

/** 比较内容是否一致（忽略 pristine 标记） */
export const sameContent = (a: ResumeData, b: ResumeData) => {
  const strip = ({ pristine: _p, ...rest }: ResumeData) => rest;
  return JSON.stringify(strip(a)) === JSON.stringify(strip(b));
};
