import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import zh from './zh';
import ja from './ja';
import en from './en';
import type { Locale, MessageKey, Messages, TFn } from './types';

export type { Locale, MessageKey, TFn } from './types';

const MESSAGES: Record<Locale, Messages> = { zh, ja, en };

export const LOCALES: { id: Locale; label: string; htmlLang: string }[] = [
  { id: 'zh', label: '简体中文', htmlLang: 'zh-CN' },
  { id: 'ja', label: '日本語', htmlLang: 'ja' },
  { id: 'en', label: 'English', htmlLang: 'en' },
];

const KEY = 'easycv:locale';

/** 优先使用用户选择过的语言，否则按浏览器语言匹配，默认中文 */
export function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'zh' || saved === 'ja' || saved === 'en') return saved;
  } catch {
    /* 存储不可用 */
  }
  for (const lang of navigator.languages ?? [navigator.language]) {
    const l = lang.toLowerCase();
    if (l.startsWith('zh')) return 'zh';
    if (l.startsWith('ja')) return 'ja';
    if (l.startsWith('en')) return 'en';
  }
  return 'zh';
}

export function makeT(locale: Locale): TFn {
  const dict = MESSAGES[locale];
  return (key: MessageKey, vars) => {
    let s = dict[key] ?? zh[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  };
}

interface I18nCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TFn;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);
  const t = useMemo(() => makeT(locale), [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* 忽略 */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = LOCALES.find((x) => x.id === locale)!.htmlLang;
    document.title = t('app.title');
  }, [locale, t]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useI18n must be used inside I18nProvider');
  return c;
}
