import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { produce, type Draft } from 'immer';
import type { ResumeData, Section } from './types';
import { loadData, saveData } from './utils/storage';

type Updater = (fn: (d: Draft<ResumeData>) => void) => void;

interface Ctx {
  data: ResumeData;
  update: Updater;
  replace: (d: ResumeData) => void;
  savedAt: Date | null;
}

const ResumeCtx = createContext<Ctx | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ResumeData>(loadData);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const update = useCallback<Updater>((fn) => setData((prev) => produce(prev, fn)), []);

  // 自动保存（防抖）
  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (saveData(data)) setSavedAt(new Date());
    }, 400);
    return () => window.clearTimeout(timer.current);
  }, [data]);

  return <ResumeCtx.Provider value={{ data, update, replace: setData, savedAt }}>{children}</ResumeCtx.Provider>;
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
