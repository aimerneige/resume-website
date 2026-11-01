/**
 * 内置字体：全部为开源授权（SIL OFL 1.1），可免费商用、可随网页分发。
 * 字体文件随站点自托管，按 unicode-range 分片，只下载实际用到的字符。
 */
export type FontKind = 'sans' | 'serif' | 'hand';
export type FontLang = 'zh' | 'ja' | 'en';

export interface BuiltinFont {
  id: string;
  /** 字体自身名称（不翻译） */
  name: string;
  family: string;
  /** 缺字时的回退（主要用于西文字体中的中日文字符） */
  fallback: string[];
  kind: FontKind;
  lang: FontLang;
  license: string;
  load: () => Promise<unknown>;
}

const sansSC = () => Promise.all([import('@fontsource/noto-sans-sc/400.css'), import('@fontsource/noto-sans-sc/700.css')]);
const serifSC = () => Promise.all([import('@fontsource/noto-serif-sc/400.css'), import('@fontsource/noto-serif-sc/700.css')]);
const sansJP = () => Promise.all([import('@fontsource/noto-sans-jp/400.css'), import('@fontsource/noto-sans-jp/700.css')]);
const serifJP = () => Promise.all([import('@fontsource/noto-serif-jp/400.css'), import('@fontsource/noto-serif-jp/700.css')]);

export const BUILTIN_FONTS: BuiltinFont[] = [
  {
    id: 'noto-sans-sc',
    name: 'Noto Sans SC · 思源黑体',
    family: 'Noto Sans SC',
    fallback: [],
    kind: 'sans',
    lang: 'zh',
    license: 'SIL OFL 1.1',
    load: sansSC,
  },
  {
    id: 'noto-serif-sc',
    name: 'Noto Serif SC · 思源宋体',
    family: 'Noto Serif SC',
    fallback: [],
    kind: 'serif',
    lang: 'zh',
    license: 'SIL OFL 1.1',
    load: serifSC,
  },
  {
    id: 'lxgw-wenkai',
    name: 'LXGW WenKai · 霞鹜文楷',
    family: 'LXGW WenKai',
    fallback: ['Noto Sans SC'],
    kind: 'hand',
    lang: 'zh',
    license: 'SIL OFL 1.1',
    load: () =>
      Promise.all([
        import('lxgw-wenkai-webfont/lxgwwenkai-regular.css'),
        import('lxgw-wenkai-webfont/lxgwwenkai-bold.css'),
        sansSC(),
      ]),
  },
  {
    id: 'noto-sans-jp',
    name: 'Noto Sans JP',
    family: 'Noto Sans JP',
    fallback: [],
    kind: 'sans',
    lang: 'ja',
    license: 'SIL OFL 1.1',
    load: sansJP,
  },
  {
    id: 'noto-serif-jp',
    name: 'Noto Serif JP',
    family: 'Noto Serif JP',
    fallback: [],
    kind: 'serif',
    lang: 'ja',
    license: 'SIL OFL 1.1',
    load: serifJP,
  },
  {
    id: 'inter',
    name: 'Inter',
    family: 'Inter',
    fallback: ['Noto Sans SC'],
    kind: 'sans',
    lang: 'en',
    license: 'SIL OFL 1.1',
    load: () => Promise.all([import('@fontsource/inter/400.css'), import('@fontsource/inter/700.css'), sansSC()]),
  },
  {
    id: 'source-serif-4',
    name: 'Source Serif 4',
    family: 'Source Serif 4',
    fallback: ['Noto Serif SC'],
    kind: 'serif',
    lang: 'en',
    license: 'SIL OFL 1.1',
    load: () =>
      Promise.all([import('@fontsource/source-serif-4/400.css'), import('@fontsource/source-serif-4/700.css'), serifSC()]),
  },
];

export const DEFAULT_FONT_ID = 'noto-sans-sc';

/** 各语言下「无衬线 / 衬线」对应的默认字体，供模板使用 */
export const DEFAULT_FONT_BY_LANG: Record<FontLang, Record<'sans' | 'serif', string>> = {
  zh: { sans: 'noto-sans-sc', serif: 'noto-serif-sc' },
  ja: { sans: 'noto-sans-jp', serif: 'noto-serif-jp' },
  en: { sans: 'inter', serif: 'source-serif-4' },
};

export const getBuiltinFont = (id: string) => BUILTIN_FONTS.find((f) => f.id === id);

export const LOCAL_PREFIX = 'local:';
export const isLocalFontId = (id: string) => id.startsWith(LOCAL_PREFIX);
export const localFamily = (localId: string) => `ECV Local ${localId}`;

const loaded = new Map<string, Promise<unknown>>();

/** 加载内置字体的 CSS（只注册 @font-face，不会立刻下载字形文件） */
export function loadBuiltinFont(id: string): Promise<unknown> {
  const f = getBuiltinFont(id);
  if (!f) return Promise.resolve();
  if (!loaded.has(id)) loaded.set(id, f.load().catch((e) => console.warn('font load failed', id, e)));
  return loaded.get(id)!;
}

const quote = (name: string) => `"${name}"`;

/** 由字体 id 生成 CSS font-family；本地字体缺失时回退到默认字体 */
export function fontStack(id: string, localIds: Set<string>): string {
  if (isLocalFontId(id)) {
    const lid = id.slice(LOCAL_PREFIX.length);
    if (localIds.has(lid)) return [quote(localFamily(lid)), quote('Noto Sans SC'), 'sans-serif'].join(', ');
    id = DEFAULT_FONT_ID;
  }
  const f = getBuiltinFont(id) ?? getBuiltinFont(DEFAULT_FONT_ID)!;
  const generic = f.kind === 'serif' ? 'serif' : 'sans-serif';
  return [f.family, ...f.fallback].map(quote).concat(generic).join(', ');
}
