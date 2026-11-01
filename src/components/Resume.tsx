import { forwardRef, useMemo, type CSSProperties } from 'react';
import type { BasicInfo, CustomSection, ResumeData, Section } from '../types';
import { TONES } from '../defaults';
import RichText, { inline } from './RichText';
import { useEnsureFont, useFonts } from '../fonts/FontsProvider';
import { DEFAULT_FONT_ID, getBuiltinFont } from '../fonts/registry';
import { makeT, useI18n, type TFn } from '../i18n';
import './resume.css';


const dateRange = (start: string, end: string) =>
  start && end ? `${start} - ${end}` : start || end;

function Header({ basic, showAvatar, align, t }: { basic: BasicInfo; showAvatar: boolean; align: 'center' | 'left'; t: TFn }) {
  const contacts = [basic.location, basic.phone, basic.email, basic.birth, basic.wechat && `${t('resume.wechat')}${t('resume.colon')}${basic.wechat}`].filter(
    Boolean,
  ) as string[];
  const links = basic.links.filter((l) => l.label || l.value);
  const avatar = showAvatar && basic.avatar;
  return (
    <header className={`cv-header cv-header-${align}${avatar ? ' has-avatar' : ''}`} data-bk>
      {avatar && <img className="cv-avatar" src={basic.avatar} alt={basic.name} />}
      <div className="cv-header-main">
        <div className="cv-name-row">
          {basic.name && <h1 className="cv-name">{basic.name}</h1>}
          {basic.title && <div className="cv-jobtitle">{basic.title}</div>}
        </div>
        {contacts.length > 0 && (
          <ul className="cv-contacts">
            {contacts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
        {links.length > 0 && (
          <ul className="cv-contacts">
            {links.map((l) => (
              <li key={l.id}>
                {l.label && <span className="cv-link-label">{l.label}</span>}
                {l.label && l.value && t('resume.colon')}
                {l.url ? (
                  <a href={l.url} target="_blank" rel="noreferrer">
                    {l.value || l.url}
                  </a>
                ) : (
                  l.value
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}

function CustomBody({ section }: { section: CustomSection }) {
  return (
    <div className="cv-custom">
      {section.blocks.map((b) =>
        b.kind === 'divider' ? (
          <hr key={b.id} className="cv-divider" style={{ marginTop: b.marginTop, borderColor: TONES[b.tone] }} data-bk />
        ) : (
          <div
            key={b.id}
            className="cv-custom-block"
            data-bk
            style={{
              marginTop: b.marginTop,
              paddingLeft: b.indent,
              fontSize: b.fontSize,
              lineHeight: b.lineHeight,
              fontWeight: b.bold ? 700 : 400,
              fontStyle: b.italic ? 'italic' : 'normal',
              textDecoration: b.underline ? 'underline' : 'none',
              color: TONES[b.tone],
              textAlign: b.align,
            }}
          >
            {b.rightText ? (
              <div className="cv-custom-row">
                <span className="cv-pre">{inline(b.text)}</span>
                <span className="cv-custom-right">{inline(b.rightText)}</span>
              </div>
            ) : (
              <div className="cv-pre">{inline(b.text)}</div>
            )}
          </div>
        ),
      )}
    </div>
  );
}

function SectionBody({ section }: { section: Section }) {
  switch (section.type) {
    case 'text':
      return <RichText text={section.content} />;
    case 'timeline':
      return (
        <div className={section.columns === 2 ? 'cv-grid-2' : undefined}>
          {section.items.map((it) => {
            const head = [it.title, it.subtitle].filter(Boolean).join(' - ');
            const date = dateRange(it.start, it.end);
            return (
              <div className="cv-item" key={it.id}>
                {(head || it.meta || date) && (
                  <div className="cv-item-head">
                    <div>
                      {head && <span className="cv-item-title">{head}</span>}
                      {it.meta && <span className="cv-item-meta">{it.meta}</span>}
                    </div>
                    {date && <div className="cv-item-date">{date}</div>}
                  </div>
                )}
                <RichText text={it.content} />
              </div>
            );
          })}
        </div>
      );
    case 'skills':
      if (section.tagMode)
        return (
          <div className="cv-tags" data-bk>
            {section.items
              .filter((s) => s.name)
              .map((s) => (
                <span className="cv-tag" key={s.id}>
                  {s.name}
                </span>
              ))}
          </div>
        );
      return (
        <div className={section.columns === 2 ? 'cv-grid-2' : undefined}>
          {section.items.map((s) => (
            <div className="cv-item" key={s.id}>
              {s.name && <div className="cv-skill-name">{s.name}</div>}
              <RichText text={s.content} />
            </div>
          ))}
        </div>
      );
    case 'custom':
      return <CustomBody section={section} />;
  }
}

const Resume = forwardRef<HTMLDivElement, { data: ResumeData }>(function Resume({ data }, ref) {
  const { style, basic } = data;
  const { hasFont, stackOf } = useFonts();
  const fontId = hasFont(style.fontFamily) ? style.fontFamily : DEFAULT_FONT_ID;
  useEnsureFont(fontId);
  // 纸面上的固定文字（如「微信」、冒号）跟随简历字体的语言，而不是界面语言
  const { locale } = useI18n();
  const paperLocale = getBuiltinFont(fontId)?.lang ?? locale;
  const t = useMemo(() => makeT(paperLocale), [paperLocale]);
  const vars = {
    '--cv-font': stackOf(fontId),
    '--cv-fs': `${style.fontSize}px`,
    '--cv-lh': style.lineHeight,
    '--cv-pad-x': `${style.padX}px`,
    '--cv-pad-y': `${style.padY}px`,
    '--cv-gap': `${style.sectionGap}px`,
  } as CSSProperties;

  return (
    <div ref={ref} className={`cv-root h-${style.headingStyle}`} style={vars}>
      <Header basic={basic} showAvatar={style.showAvatar} align={style.headerAlign} t={t} />
      {data.sections
        .filter((s) => s.visible)
        .map((s) => (
          <section className="cv-section" key={s.id}>
            {(s.type !== 'custom' || s.showTitle) && s.title && <h2 className="cv-section-title">{s.title}</h2>}
            <SectionBody section={s} />
          </section>
        ))}
    </div>
  );
});

export default Resume;
