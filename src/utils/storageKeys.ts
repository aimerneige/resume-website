/** 浏览器存储键名（产品名 Resume） */
export const STORAGE_KEYS = {
  locale: 'resume:locale',
  draft: 'resume:draft:v1',
  library: 'resume:library:v1',
  currentSlot: 'resume:current-slot',
} as const;

export const FONT_DB = 'resume';

/** 旧版（EasyCV 时期）的键名 → 新键名 */
const LEGACY: Record<string, string> = {
  'easycv:locale': STORAGE_KEYS.locale,
  'easycv:resume:v1': STORAGE_KEYS.draft,
  'easycv:library:v1': STORAGE_KEYS.library,
  'easycv:current-slot': STORAGE_KEYS.currentSlot,
};
export const LEGACY_FONT_DB = 'easycv';

/** 启动时把旧键名的数据搬到新键名，保证老用户数据不丢失 */
export function migrateLegacyStorage() {
  try {
    for (const [oldKey, newKey] of Object.entries(LEGACY)) {
      const v = localStorage.getItem(oldKey);
      if (v === null) continue;
      if (localStorage.getItem(newKey) === null) localStorage.setItem(newKey, v);
      localStorage.removeItem(oldKey);
    }
  } catch {
    // 隐私模式等情况下 localStorage 不可用，忽略
  }
}
