import { localFamily } from './registry';

/** 用户上传的字体：保存在浏览器 IndexedDB 中，不会上传到任何服务器 */
export interface LocalFontMeta {
  id: string;
  name: string;
  fileName: string;
  size: number;
  addedAt: number;
}
interface LocalFontRecord extends LocalFontMeta {
  data: ArrayBuffer;
}

const DB = 'easycv';
const STORE = 'fonts';
export const MAX_FONT_SIZE = 40 * 1024 * 1024;
export const FONT_ACCEPT = '.ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        t.oncomplete = () => {
          db.close();
          resolve(req.result);
        };
        t.onerror = () => {
          db.close();
          reject(t.error);
        };
      }),
  );
}

/** 已注册到 document.fonts 的本地字体，以及导出时需要的原始数据 */
const registered = new Map<string, { face: FontFace; data: ArrayBuffer }>();

async function register(rec: LocalFontRecord) {
  if (registered.has(rec.id)) return;
  const face = new FontFace(localFamily(rec.id), rec.data);
  await face.load();
  document.fonts.add(face);
  registered.set(rec.id, { face, data: rec.data });
}

const meta = ({ id, name, fileName, size, addedAt }: LocalFontRecord): LocalFontMeta => ({ id, name, fileName, size, addedAt });

/** 读取并注册所有本地字体 */
export async function loadLocalFonts(): Promise<LocalFontMeta[]> {
  const all = await tx<LocalFontRecord[]>('readonly', (s) => s.getAll());
  const ok: LocalFontMeta[] = [];
  for (const rec of all) {
    try {
      await register(rec);
      ok.push(meta(rec));
    } catch (e) {
      console.warn('skip broken local font', rec.fileName, e);
    }
  }
  return ok.sort((a, b) => a.addedAt - b.addedAt);
}

export class FontError extends Error {
  constructor(public code: 'tooLarge' | 'invalid' | 'storage') {
    super(code);
  }
}

export async function addLocalFont(file: File): Promise<LocalFontMeta> {
  if (file.size > MAX_FONT_SIZE) throw new FontError('tooLarge');
  const data = await file.arrayBuffer();
  const id = Math.random().toString(36).slice(2, 10);
  const rec: LocalFontRecord = {
    id,
    name: file.name.replace(/\.(ttf|otf|woff2?)$/i, ''),
    fileName: file.name,
    size: file.size,
    addedAt: Date.now(),
    data,
  };
  try {
    await register(rec); // 先验证能否解析
  } catch {
    throw new FontError('invalid');
  }
  try {
    await tx('readwrite', (s) => s.put(rec));
  } catch {
    throw new FontError('storage');
  }
  return meta(rec);
}

export async function renameLocalFont(id: string, name: string) {
  const rec = await tx<LocalFontRecord | undefined>('readonly', (s) => s.get(id));
  if (rec) await tx('readwrite', (s) => s.put({ ...rec, name }));
}

export async function deleteLocalFont(id: string) {
  await tx('readwrite', (s) => s.delete(id));
  const r = registered.get(id);
  if (r) document.fonts.delete(r.face);
  registered.delete(id);
}

/** 导出图片时需要把本地字体内嵌为 data URL */
export function getLocalFontData(id: string): ArrayBuffer | undefined {
  return registered.get(id)?.data;
}
