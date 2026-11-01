import { getLocalFontData } from './localFonts';
import { localFamily } from './registry';

/**
 * 为图片 / PDF 导出生成内嵌字体 CSS。
 * 只挑选「当前简历用到的字体族」中「与简历文字有交集的 unicode-range 分片」，
 * 避免把整套中日文字体（上百个分片）全部下载并内嵌。
 */

type Range = [number, number];

function parseRanges(value: string): Range[] | null {
  if (!value.trim()) return null; // 没有 unicode-range 表示覆盖全部字符
  return value.split(',').map((part) => {
    const p = part.trim().replace(/^U\+/i, '');
    if (p.includes('?')) {
      return [parseInt(p.replace(/\?/g, '0'), 16), parseInt(p.replace(/\?/g, 'F'), 16)] as Range;
    }
    const [a, b] = p.split('-');
    return [parseInt(a, 16), parseInt(b ?? a, 16)] as Range;
  });
}

const stripQuotes = (s: string) => s.trim().replace(/^['"]|['"]$/g, '');

function familiesOf(node: HTMLElement): Set<string> {
  const set = new Set<string>();
  const els = [node, ...Array.from(node.querySelectorAll<HTMLElement>('*'))];
  for (const el of els) {
    for (const f of getComputedStyle(el).fontFamily.split(',')) set.add(stripQuotes(f));
  }
  return set;
}

function codePointsOf(node: HTMLElement): Set<number> {
  // 包含 CSS 生成的分隔符、列表符号与常用 ASCII
  const text = (node.textContent ?? '') + '|•·:：0123456789';
  const set = new Set<number>();
  for (const ch of text) set.add(ch.codePointAt(0)!);
  for (let c = 0x20; c < 0x7f; c++) set.add(c);
  return set;
}

const cache = new Map<string, Promise<string>>();

function toDataUrl(url: string): Promise<string> {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error(`font ${r.status}`);
          return r.blob();
        })
        .then(
          (blob) =>
            new Promise<string>((resolve, reject) => {
              const fr = new FileReader();
              fr.onload = () => resolve(fr.result as string);
              fr.onerror = () => reject(fr.error);
              fr.readAsDataURL(blob);
            }),
        ),
    );
  }
  return cache.get(url)!;
}

function bufferToDataUrl(buf: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(new Blob([buf], { type: 'font/ttf' }));
  });
}

function pickSrc(src: string, base: string): string | null {
  // 优先 woff2
  const urls = Array.from(src.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)).map((m) => m[1]);
  const url = urls.find((u) => /\.woff2(\?|#|$)/.test(u)) ?? urls[0];
  return url ? new URL(url, base).href : null;
}

export async function buildFontEmbedCSS(node: HTMLElement): Promise<string> {
  const families = familiesOf(node);
  const chars = Array.from(codePointsOf(node)).sort((a, b) => a - b);
  // 二分查找：区间 [a, b] 内是否存在简历用到的字符
  const hasIn = (a: number, b: number) => {
    let lo = 0;
    let hi = chars.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (chars[mid] < a) lo = mid + 1;
      else hi = mid;
    }
    return lo < chars.length && chars[lo] <= b;
  };
  const intersects = (ranges: Range[] | null) => !ranges || ranges.some(([a, b]) => hasIn(a, b));

  const jobs: Promise<string>[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // 跨域样式表无法读取
    }
    const base = sheet.href ?? location.href;
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSFontFaceRule)) continue;
      const st = rule.style;
      const family = stripQuotes(st.getPropertyValue('font-family'));
      if (!families.has(family)) continue;
      const range = st.getPropertyValue('unicode-range');
      if (!intersects(parseRanges(range))) continue;
      const url = pickSrc(st.getPropertyValue('src'), base);
      if (!url) continue;
      const weight = st.getPropertyValue('font-weight') || '400';
      const style = st.getPropertyValue('font-style') || 'normal';
      jobs.push(
        toDataUrl(url)
          .then(
            (data) =>
              `@font-face{font-family:"${family}";font-style:${style};font-weight:${weight};src:url(${data});${
                range ? `unicode-range:${range};` : ''
              }}`,
          )
          .catch(() => ''),
      );
    }
  }

  // 用户上传的本地字体（通过 FontFace API 注册，不在样式表中）
  for (const family of families) {
    const m = /^ECV Local (.+)$/.exec(family);
    if (!m) continue;
    const data = getLocalFontData(m[1]);
    if (!data) continue;
    jobs.push(bufferToDataUrl(data).then((url) => `@font-face{font-family:"${localFamily(m[1])}";src:url(${url});}`));
  }

  return (await Promise.all(jobs)).join('\n');
}

/** 导出前确保简历中出现的字符都已下载对应字形 */
export async function ensureGlyphsLoaded(node: HTMLElement) {
  const text = node.textContent ?? '';
  const families = Array.from(familiesOf(node)).filter((f) => !['serif', 'sans-serif'].includes(f));
  await Promise.all(
    families.flatMap((f) => [
      document.fonts.load(`400 16px "${f}"`, text).catch(() => []),
      document.fonts.load(`700 16px "${f}"`, text).catch(() => []),
    ]),
  );
  await document.fonts.ready;
}
