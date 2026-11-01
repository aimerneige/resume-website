export type Tone = 'black' | 'dark' | 'mid' | 'light';
export type Align = 'left' | 'center' | 'right';

export interface LinkItem {
  id: string;
  label: string;
  value: string;
  url: string;
}

export interface BasicInfo {
  name: string;
  title: string;
  avatar: string; // 裁剪后的 dataURL，保留原始色彩
  location: string;
  phone: string;
  email: string;
  birth: string;
  wechat: string;
  links: LinkItem[];
}

export type TimelineKind = 'work' | 'education' | 'project';

export interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  start: string;
  end: string;
  content: string;
}

export interface SkillItem {
  id: string;
  name: string;
  content: string;
}

export interface CustomBlock {
  id: string;
  kind: 'text' | 'divider';
  text: string;
  rightText: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: Align;
  tone: Tone;
  marginTop: number;
  indent: number;
  lineHeight: number;
}

interface SectionBase {
  id: string;
  title: string;
  visible: boolean;
}

export interface TextSection extends SectionBase {
  type: 'text';
  content: string;
}

export interface TimelineSection extends SectionBase {
  type: 'timeline';
  kind: TimelineKind;
  columns: 1 | 2;
  items: TimelineItem[];
}

export interface SkillsSection extends SectionBase {
  type: 'skills';
  columns: 1 | 2;
  tagMode: boolean;
  items: SkillItem[];
}

export interface CustomSection extends SectionBase {
  type: 'custom';
  showTitle: boolean;
  blocks: CustomBlock[];
}

export type Section = TextSection | TimelineSection | SkillsSection | CustomSection;

export type TemplateId = 'standard' | 'classic' | 'compact' | 'minimal';
export type HeadingStyle = 'bar' | 'underline' | 'fill' | 'plain';

export interface StyleSettings {
  template: TemplateId;
  /** 内置字体 id，或 `local:<id>` 表示用户上传的本地字体 */
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  padX: number;
  padY: number;
  sectionGap: number;
  headingStyle: HeadingStyle;
  headerAlign: 'center' | 'left';
  showAvatar: boolean;
  showPageGuides: boolean;
}

/** 未经编辑的样例 / 空白简历：切换语言时可直接替换为对应语言版本 */
export interface Pristine {
  kind: 'sample' | 'empty';
  locale: 'zh' | 'ja' | 'en';
}

export interface ResumeData {
  version: 1;
  /** 用户做任何修改后会被清除 */
  pristine?: Pristine;
  docTitle: string;
  basic: BasicInfo;
  sections: Section[];
  style: StyleSettings;
}
