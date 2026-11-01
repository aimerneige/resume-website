import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { PAGE_H, PAGE_W, computePageBreaks } from './pagination';

const RATIO = 2.5; // 导出清晰度

function download(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function snapshot(node: HTMLElement) {
  await document.fonts?.ready;
  return toCanvas(node, {
    pixelRatio: RATIO,
    backgroundColor: '#ffffff',
    // 预览区可能被缩放，导出时强制按原始尺寸渲染
    style: { transform: 'none', margin: '0' },
    width: node.offsetWidth,
    height: node.offsetHeight,
  });
}

export async function exportImage(node: HTMLElement, type: 'png' | 'jpeg', filename: string) {
  const canvas = await snapshot(node);
  const url = canvas.toDataURL(`image/${type}`, 0.95);
  download(url, `${filename}.${type === 'jpeg' ? 'jpg' : 'png'}`);
}

export async function exportPdf(node: HTMLElement, padY: number, filename: string) {
  const breaks = computePageBreaks(node, padY);
  const canvas = await snapshot(node);
  const r = canvas.width / PAGE_W;
  const total = node.offsetHeight;
  const bounds = [0, ...breaks, total];

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  const page = document.createElement('canvas');
  page.width = Math.round(PAGE_W * r);
  page.height = Math.round(PAGE_H * r);
  const ctx = page.getContext('2d')!;

  for (let i = 0; i < bounds.length - 1; i++) {
    const sy = bounds[i];
    const sh = Math.min(bounds[i + 1] - sy, i === 0 ? PAGE_H : PAGE_H - padY);
    const dy = i === 0 ? 0 : padY;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, page.width, page.height);
    ctx.drawImage(canvas, 0, sy * r, canvas.width, sh * r, 0, dy * r, page.width, sh * r);
    if (i > 0) pdf.addPage();
    pdf.addImage(page.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }
  pdf.save(`${filename}.pdf`);
}

/** 浏览器打印：生成可选中文字的矢量 PDF */
export function printResume(padY: number) {
  const mm = ((padY * 25.4) / 96).toFixed(1);
  const style = document.createElement('style');
  style.textContent = `@page { size: A4; margin: ${mm}mm 0; }`;
  document.head.appendChild(style);
  const cleanup = () => {
    style.remove();
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  window.print();
}

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  download(url, `${filename}.json`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
