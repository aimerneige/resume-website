import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { addLocalFont, deleteLocalFont, loadLocalFonts, renameLocalFont, type LocalFontMeta } from './localFonts';
import { LOCAL_PREFIX, fontStack, isLocalFontId, loadBuiltinFont } from './registry';

interface FontsCtx {
  localFonts: LocalFontMeta[];
  /** 本地字体是否已从 IndexedDB 读取完成 */
  ready: boolean;
  /** IndexedDB 不可用（如部分隐私模式） */
  storageError: boolean;
  add: (file: File) => Promise<LocalFontMeta>;
  remove: (id: string) => Promise<void>;
  rename: (id: string, name: string) => Promise<void>;
  stackOf: (fontId: string) => string;
  hasFont: (fontId: string) => boolean;
}

const Ctx = createContext<FontsCtx | null>(null);

export function FontsProvider({ children }: { children: ReactNode }) {
  const [localFonts, setLocalFonts] = useState<LocalFontMeta[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    loadLocalFonts()
      .then(setLocalFonts)
      .catch(() => setStorageError(true))
      .finally(() => setReady(true));
  }, []);

  const localIds = useMemo(() => new Set(localFonts.map((f) => f.id)), [localFonts]);

  const add = useCallback(async (file: File) => {
    const m = await addLocalFont(file);
    setLocalFonts((l) => [...l, m]);
    return m;
  }, []);
  const remove = useCallback(async (id: string) => {
    await deleteLocalFont(id);
    setLocalFonts((l) => l.filter((f) => f.id !== id));
  }, []);
  const rename = useCallback(async (id: string, name: string) => {
    setLocalFonts((l) => l.map((f) => (f.id === id ? { ...f, name } : f)));
    await renameLocalFont(id, name);
  }, []);

  const value = useMemo<FontsCtx>(
    () => ({
      localFonts,
      ready,
      storageError,
      add,
      remove,
      rename,
      stackOf: (id) => fontStack(id, localIds),
      hasFont: (id) => !isLocalFontId(id) || localIds.has(id.slice(LOCAL_PREFIX.length)),
    }),
    [localFonts, ready, storageError, add, remove, rename, localIds],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFonts() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useFonts must be used inside FontsProvider');
  return c;
}

/** 确保某个字体已加载（本地字体在启动时统一注册，这里只处理内置字体） */
export function useEnsureFont(fontId: string) {
  useEffect(() => {
    if (isLocalFontId(fontId)) {
      loadBuiltinFont('noto-sans-sc'); // 本地字体缺字时的回退
    } else {
      loadBuiltinFont(fontId);
    }
  }, [fontId]);
}
