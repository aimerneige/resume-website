import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { produce, type Draft } from 'immer';
import type { ResumeData, Section } from './types';
import { loadData, saveData } from './utils/storage';
import {
  loadCurrentSlot,
  loadLibrary,
  sameContent,
  writeCurrentSlot,
  writeLibrary,
  type SavedResume,
} from './utils/library';
import { uid } from './defaults';
import { detectLocale } from './i18n';

type Updater = (fn: (d: Draft<ResumeData>) => void) => void;

interface Ctx {
  data: ResumeData;
  /** 用户编辑：会清除 pristine 标记 */
  update: Updater;
  /** 整体替换当前简历；slotId 表示它来自「我的简历」中的哪一份 */
  replace: (d: ResumeData, slotId?: string | null) => void;
  /** 草稿自动保存时间 */
  savedAt: Date | null;

  library: SavedResume[];
  currentSlotId: string | null;
  /** 当前内容已在「我的简历」中保存（或是未修改的样例） */
  isSaved: boolean;
  /** 保存到「我的简历」：已关联则覆盖，否则新建。失败时抛出异常 */
  saveToLibrary: (opts?: { asNew?: boolean }) => SavedResume;
  openFromLibrary: (id: string) => void;
  renameInLibrary: (id: string, name: string) => void;
  deleteFromLibrary: (id: string) => void;
}

const ResumeCtx = createContext<Ctx | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ResumeData>(() => loadData(detectLocale()));
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [library, setLibrary] = useState<SavedResume[]>(loadLibrary);
  const [currentSlotId, setCurrentSlotId] = useState<string | null>(() => {
    const id = loadCurrentSlot();
    return id && loadLibrary().some((s) => s.id === id) ? id : null;
  });
  const timer = useRef<number | undefined>(undefined);

  const update = useCallback<Updater>(
    (fn) =>
      setData((prev) =>
        produce(prev, (d) => {
          fn(d);
          delete d.pristine;
        }),
      ),
    [],
  );

  const linkSlot = useCallback((id: string | null) => {
    setCurrentSlotId(id);
    writeCurrentSlot(id);
  }, []);

  const replace = useCallback(
    (d: ResumeData, slotId: string | null = null) => {
      setData(d);
      linkSlot(slotId);
    },
    [linkSlot],
  );

  // 草稿自动保存（防抖）
  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (saveData(data)) setSavedAt(new Date());
    }, 400);
    return () => window.clearTimeout(timer.current);
  }, [data]);

  const commit = useCallback((list: SavedResume[]) => {
    writeLibrary(list); // 可能因存储空间不足抛出
    setLibrary(list);
  }, []);

  const saveToLibrary = useCallback(
    ({ asNew = false }: { asNew?: boolean } = {}) => {
      const existing = !asNew && currentSlotId ? library.find((s) => s.id === currentSlotId) : undefined;
      const item: SavedResume = {
        id: existing?.id ?? uid(),
        name: data.docTitle || data.basic.name || existing?.name || '',
        savedAt: Date.now(),
        data,
      };
      const list = existing ? library.map((s) => (s.id === item.id ? item : s)) : [item, ...library];
      commit(list);
      linkSlot(item.id);
      return item;
    },
    [currentSlotId, library, data, commit, linkSlot],
  );

  const openFromLibrary = useCallback(
    (id: string) => {
      const item = library.find((s) => s.id === id);
      if (item) replace(item.data, id);
    },
    [library, replace],
  );

  const renameInLibrary = useCallback(
    (id: string, name: string) => {
      commit(library.map((s) => (s.id === id ? { ...s, name, data: { ...s.data, docTitle: name } } : s)));
      if (id === currentSlotId) setData((d) => ({ ...d, docTitle: name }));
    },
    [library, commit, currentSlotId],
  );

  const deleteFromLibrary = useCallback(
    (id: string) => {
      commit(library.filter((s) => s.id !== id));
      if (id === currentSlotId) linkSlot(null);
    },
    [library, commit, currentSlotId, linkSlot],
  );

  const isSaved = useMemo(() => {
    if (data.pristine) return true;
    const slot = currentSlotId ? library.find((s) => s.id === currentSlotId) : undefined;
    return !!slot && sameContent(slot.data, data);
  }, [data, currentSlotId, library]);

  const value: Ctx = {
    data,
    update,
    replace,
    savedAt,
    library,
    currentSlotId,
    isSaved,
    saveToLibrary,
    openFromLibrary,
    renameInLibrary,
    deleteFromLibrary,
  };
  return <ResumeCtx.Provider value={value}>{children}</ResumeCtx.Provider>;
}

export function useResume() {
  const ctx = useContext(ResumeCtx);
  if (!ctx) throw new Error('useResume must be used inside ResumeProvider');
  return ctx;
}

/** 针对单个模块的更新函数 */
export function useSection<T extends Section>(id: string) {
  const { data, update } = useResume();
  const section = data.sections.find((s) => s.id === id) as T;
  const patch = useCallback(
    (fn: (s: Draft<T>) => void) =>
      update((d) => {
        const s = d.sections.find((x) => x.id === id);
        if (s) fn(s as Draft<T>);
      }),
    [id, update],
  );
  return [section, patch] as const;
}

export function move<T>(arr: T[], from: number, to: number) {
  if (to < 0 || to >= arr.length) return;
  const [it] = arr.splice(from, 1);
  arr.splice(to, 0, it);
}
