import { Fragment, type ReactNode } from 'react';

/**
 * 轻量文本格式：
 *  - 以 "- " / "* " / "• " 开头的行是无序列表
 *  - 以 "1. " / "1、" 开头的行是有序列表
 *  - **文字** 加粗
 */
type Block = { type: 'p'; text: string } | { type: 'ul' | 'ol'; items: string[] };

const UL = /^\s*[-*•]\s+/;
const OL = /^\s*\d+[.、]\s*/;

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    if (!line.trim()) continue;
    const kind = UL.test(line) ? 'ul' : OL.test(line) ? 'ol' : 'p';
    if (kind === 'p') {
      blocks.push({ type: 'p', text: line.trim() });
      continue;
    }
    const content = line.replace(kind === 'ul' ? UL : OL, '');
    const last = blocks[blocks.length - 1];
    if (last && last.type === kind) last.items.push(content);
    else blocks.push({ type: kind, items: [content] });
  }
  return blocks;
}

export function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export default function RichText({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <div className="cv-rich">
      {parse(text).map((b, i) => {
        if (b.type === 'p')
          return (
            <p key={i} data-bk>
              {inline(b.text)}
            </p>
          );
        const List = b.type;
        return (
          <List key={i}>
            {b.items.map((it, j) => (
              <li key={j} data-bk>
                {inline(it)}
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}
