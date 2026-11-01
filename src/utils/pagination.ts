export const PAGE_W = 794; // A4 @96dpi
export const PAGE_H = (PAGE_W * 297) / 210; // ≈1123

/**
 * 计算分页位置（简历自身坐标，单位 px，不受预览缩放影响）。
 * 优先在段落 / 列表项 / 自定义块之间断开，避免把一行字切成两半。
 * 第 2 页起，内容在纸面上会留出与页边距相同的上下空白。
 */
export function computePageBreaks(node: HTMLElement, padY: number): number[] {
  const rect = node.getBoundingClientRect();
  if (!node.offsetWidth) return [];
  const scale = rect.width / node.offsetWidth;
  // 用最后一个子元素的底部作为内容终点（纸面有最小高度，不能用 offsetHeight）
  const last = node.lastElementChild as HTMLElement | null;
  const contentEnd = last ? (last.getBoundingClientRect().bottom - rect.top) / scale : node.offsetHeight;
  const candidates = Array.from(node.querySelectorAll<HTMLElement>('[data-bk]'))
    .map((el) => (el.getBoundingClientRect().bottom - rect.top) / scale)
    .sort((a, b) => a - b);

  const breaks: number[] = [];
  let start = 0;
  for (let guard = 0; guard < 50; guard++) {
    const first = start === 0;
    const limit = first ? PAGE_H - padY : start + PAGE_H - 2 * padY;
    if (contentEnd <= limit + 4) break;
    const minAccept = start + (limit - start) * 0.4;
    let best = limit;
    for (let i = candidates.length - 1; i >= 0; i--) {
      const c = candidates[i];
      if (c <= limit && c > minAccept) {
        best = Math.ceil(c + 2);
        break;
      }
    }
    if (best <= start) best = limit;
    breaks.push(best);
    start = best;
  }
  return breaks;
}
