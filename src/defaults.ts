import type {
  CustomBlock,
  CustomSection,
  ResumeData,
  Section,
  SkillItem,
  SkillsSection,
  StyleSettings,
  TemplateId,
  TextSection,
  TimelineItem,
  TimelineKind,
  TimelineSection,
  Tone,
} from './types';
import { DEFAULT_FONT_BY_LANG } from './fonts/registry';
import type { Locale, MessageKey, TFn } from './i18n';

export const uid = () => Math.random().toString(36).slice(2, 10);

export const TONES: Record<Tone, string> = {
  black: '#111111',
  dark: '#3a3a3a',
  mid: '#5f5f5f',
  light: '#8a8a8a',
};

/** 不同经历类型的字段名称（i18n key） */
export const timelineLabel = (t: TFn, kind: TimelineKind, field: 'title' | 'subtitle' | 'meta' | 'add' | 'hint') =>
  t(`timeline.${kind}.${field}` as MessageKey);

export const TEMPLATES: Record<
  TemplateId,
  { fontKind: 'sans' | 'serif'; style: Omit<Partial<StyleSettings>, 'fontFamily'> }
> = {
  standard: {
    fontKind: 'sans',
    style: { fontSize: 14, lineHeight: 1.65, padX: 48, padY: 44, sectionGap: 24, headingStyle: 'bar', headerAlign: 'center' },
  },
  classic: {
    fontKind: 'serif',
    style: { fontSize: 14, lineHeight: 1.7, padX: 56, padY: 48, sectionGap: 22, headingStyle: 'underline', headerAlign: 'left' },
  },
  compact: {
    fontKind: 'sans',
    style: { fontSize: 13, lineHeight: 1.5, padX: 36, padY: 32, sectionGap: 16, headingStyle: 'fill', headerAlign: 'left' },
  },
  minimal: {
    fontKind: 'sans',
    style: { fontSize: 14, lineHeight: 1.75, padX: 64, padY: 56, sectionGap: 28, headingStyle: 'plain', headerAlign: 'center' },
  },
};

export const defaultStyle = (locale: Locale = 'zh'): StyleSettings => ({
  template: 'standard',
  fontFamily: DEFAULT_FONT_BY_LANG[locale].sans,
  showAvatar: true,
  showPageGuides: true,
  ...(TEMPLATES.standard.style as Omit<StyleSettings, 'template' | 'fontFamily' | 'showAvatar' | 'showPageGuides'>),
});

export const newTimelineItem = (patch: Partial<TimelineItem> = {}): TimelineItem => ({
  id: uid(),
  title: '',
  subtitle: '',
  meta: '',
  start: '',
  end: '',
  content: '',
  ...patch,
});

export const newSkillItem = (patch: Partial<SkillItem> = {}): SkillItem => ({ id: uid(), name: '', content: '', ...patch });

export const newCustomBlock = (patch: Partial<CustomBlock> = {}): CustomBlock => ({
  id: uid(),
  kind: 'text',
  text: '',
  rightText: '',
  fontSize: 14,
  bold: false,
  italic: false,
  underline: false,
  align: 'left',
  tone: 'black',
  marginTop: 6,
  indent: 0,
  lineHeight: 1.6,
  ...patch,
});

export const newTextSection = (title: string, content = ''): TextSection => ({
  id: uid(),
  type: 'text',
  title,
  visible: true,
  content,
});

export const newTimelineSection = (kind: TimelineKind, title: string, items?: TimelineItem[]): TimelineSection => ({
  id: uid(),
  type: 'timeline',
  kind,
  title,
  visible: true,
  columns: 1,
  items: items ?? [newTimelineItem()],
});

export const newSkillsSection = (title: string, items?: SkillItem[], columns: 1 | 2 = 2): SkillsSection => ({
  id: uid(),
  type: 'skills',
  title,
  visible: true,
  columns,
  tagMode: false,
  items: items ?? [newSkillItem()],
});

export const newCustomSection = (title: string, blocks: CustomBlock[]): CustomSection => ({
  id: uid(),
  type: 'custom',
  title,
  visible: true,
  showTitle: true,
  blocks,
});

export type PresetKey = 'summary' | 'work' | 'project' | 'education' | 'skills' | 'certs' | 'languages' | 'hobbies';

/** 「添加模块」面板中的预设，标题跟随当前界面语言 */
export const SECTION_PRESETS: { key: PresetKey; create: (t: TFn) => Section }[] = [
  { key: 'summary', create: (t) => newTextSection(t('preset.summary')) },
  { key: 'work', create: (t) => newTimelineSection('work', t('preset.work')) },
  { key: 'project', create: (t) => newTimelineSection('project', t('preset.project')) },
  { key: 'education', create: (t) => newTimelineSection('education', t('preset.education')) },
  { key: 'skills', create: (t) => newSkillsSection(t('preset.skills')) },
  { key: 'certs', create: (t) => newTextSection(t('preset.certs'), '- ') },
  { key: 'languages', create: (t) => newTextSection(t('preset.languages')) },
  { key: 'hobbies', create: (t) => newTextSection(t('preset.hobbies')) },
];

export const createCustomSection = (t: TFn) =>
  newCustomSection(t('preset.custom'), [newCustomBlock({ text: t('custom.defaultText') })]);

export const emptyData = (locale: Locale, t: TFn): ResumeData => ({
  version: 1,
  pristine: { kind: 'empty', locale },
  docTitle: t('app.defaultDocTitle'),
  basic: {
    name: '',
    title: '',
    avatar: '',
    location: '',
    phone: '',
    email: '',
    birth: '',
    wechat: '',
    links: [],
  },
  sections: [
    newTextSection(t('preset.summary')),
    newTimelineSection('work', t('preset.work')),
    newTimelineSection('education', t('preset.education')),
    newSkillsSection(t('preset.skills')),
  ],
  style: defaultStyle(locale),
});
