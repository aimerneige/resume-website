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
} from './types';

export const uid = () => Math.random().toString(36).slice(2, 10);

export const TONES = {
  black: '#111111',
  dark: '#3a3a3a',
  mid: '#5f5f5f',
  light: '#8a8a8a',
} as const;

export const TONE_LABELS = { black: '黑', dark: '深灰', mid: '中灰', light: '浅灰' } as const;

/** 不同经历类型的字段名称 */
export const TIMELINE_LABELS: Record<
  TimelineKind,
  { title: string; subtitle: string; meta: string; add: string; hint: string }
> = {
  work: {
    title: '公司名称',
    subtitle: '职位',
    meta: '工作地点',
    add: '添加工作经历',
    hint: '最新的经历放在最前面，突出成果与数据。',
  },
  education: {
    title: '学校',
    subtitle: '学历',
    meta: '专业',
    add: '添加教育经历',
    hint: '只写与求职相关的亮点，如课程、奖项、研究方向。',
  },
  project: {
    title: '项目名称',
    subtitle: '担任角色',
    meta: '链接 / 备注',
    add: '添加项目经历',
    hint: '说明背景、你的职责和可量化的结果。',
  },
};

export const TEMPLATES: Record<TemplateId, { name: string; desc: string; style: Partial<StyleSettings> }> = {
  standard: {
    name: '标准',
    desc: '居中抬头 · 竖条标题',
    style: {
      fontFamily: 'sans',
      fontSize: 14,
      lineHeight: 1.65,
      padX: 48,
      padY: 44,
      sectionGap: 24,
      headingStyle: 'bar',
      headerAlign: 'center',
    },
  },
  classic: {
    name: '经典',
    desc: '宋体 · 下划线标题',
    style: {
      fontFamily: 'serif',
      fontSize: 14,
      lineHeight: 1.7,
      padX: 56,
      padY: 48,
      sectionGap: 22,
      headingStyle: 'underline',
      headerAlign: 'left',
    },
  },
  compact: {
    name: '紧凑',
    desc: '小字号 · 一页放更多',
    style: {
      fontFamily: 'sans',
      fontSize: 13,
      lineHeight: 1.5,
      padX: 36,
      padY: 32,
      sectionGap: 16,
      headingStyle: 'fill',
      headerAlign: 'left',
    },
  },
  minimal: {
    name: '极简',
    desc: '大留白 · 无装饰标题',
    style: {
      fontFamily: 'sans',
      fontSize: 14,
      lineHeight: 1.75,
      padX: 64,
      padY: 56,
      sectionGap: 28,
      headingStyle: 'plain',
      headerAlign: 'center',
    },
  },
};

export const defaultStyle: StyleSettings = {
  template: 'standard',
  showAvatar: true,
  showPageGuides: true,
  ...(TEMPLATES.standard.style as Omit<StyleSettings, 'template' | 'showAvatar' | 'showPageGuides'>),
};

export const newTimelineItem = (): TimelineItem => ({
  id: uid(),
  title: '',
  subtitle: '',
  meta: '',
  start: '',
  end: '',
  content: '',
});

export const newSkillItem = (): SkillItem => ({ id: uid(), name: '', content: '' });

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

export const newTimelineSection = (kind: TimelineKind, title: string): TimelineSection => ({
  id: uid(),
  type: 'timeline',
  kind,
  title,
  visible: true,
  columns: 1,
  items: [newTimelineItem()],
});

export const newSkillsSection = (title = '专业技能'): SkillsSection => ({
  id: uid(),
  type: 'skills',
  title,
  visible: true,
  columns: 2,
  tagMode: false,
  items: [newSkillItem()],
});

export const newCustomSection = (title = '自定义模块'): CustomSection => ({
  id: uid(),
  type: 'custom',
  title,
  visible: true,
  showTitle: true,
  blocks: [newCustomBlock({ text: '在这里输入内容，可在下方调整字号、对齐、灰度和间距。' })],
});

/** “添加模块”面板中的预设 */
export const SECTION_PRESETS: { label: string; create: () => Section }[] = [
  { label: '自我介绍', create: () => newTextSection('自我介绍') },
  { label: '工作经历', create: () => newTimelineSection('work', '工作经历') },
  { label: '项目经历', create: () => newTimelineSection('project', '项目经历') },
  { label: '教育经历', create: () => newTimelineSection('education', '教育经历') },
  { label: '专业技能', create: () => newSkillsSection() },
  { label: '证书 / 获奖', create: () => newTextSection('证书 / 获奖', '- ') },
  { label: '语言能力', create: () => newTextSection('语言能力') },
  { label: '兴趣爱好', create: () => newTextSection('兴趣爱好') },
];

export const emptyData = (): ResumeData => ({
  version: 1,
  docTitle: '我的简历',
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
    newTextSection('自我介绍'),
    newTimelineSection('work', '工作经历'),
    newTimelineSection('education', '教育经历'),
    newSkillsSection(),
  ],
  style: { ...defaultStyle },
});

export const sampleData = (): ResumeData => ({
  version: 1,
  docTitle: '后端开发工程师 - 示例',
  basic: {
    name: '张三',
    title: '后端开发工程师',
    avatar: '',
    location: '上海',
    phone: '100 0000 0000',
    email: 'zhangsan@example.com',
    birth: '1995/04',
    wechat: '',
    links: [
      { id: uid(), label: '个人主页', value: 'example.com', url: 'https://example.com' },
      { id: uid(), label: '作品集', value: 'portfolio.example.com', url: 'https://portfolio.example.com' },
    ],
  },
  sections: [
    {
      ...newTextSection(
        '自我介绍',
        '6 年服务端开发经验，熟悉 Go 与 Java 技术栈，长期负责高并发交易与数据平台。关注系统稳定性、可观测性与团队工程效率，习惯用数据驱动技术决策。',
      ),
    },
    {
      id: uid(),
      type: 'timeline',
      kind: 'work',
      title: '工作经历',
      visible: true,
      columns: 1,
      items: [
        {
          id: uid(),
          title: 'XX 科技有限公司',
          subtitle: '高级后端工程师',
          meta: '上海',
          start: '2021/07',
          end: '至今',
          content:
            '负责支付清结算系统的架构演进与稳定性建设，带领 4 人小组完成核心链路重构。\n- 将单体结算服务拆分为对账、计费、出款三个领域服务，日处理订单量提升至 **800 万**\n- 建立全链路追踪与 SLO 告警体系，线上故障平均恢复时间缩短 **60%**',
        },
        {
          id: uid(),
          title: 'YY 网络科技有限公司',
          subtitle: '后端开发工程师',
          meta: '杭州',
          start: '2019/03',
          end: '2021/06',
          content:
            '参与会员与营销平台开发，负责优惠券、积分等高频业务模块。\n- 设计基于 Redis 的库存预扣方案，支撑大促峰值 **3 万 QPS**\n- 沉淀通用规则引擎，新活动上线周期由 5 天缩短至 1 天',
        },
      ],
    },
    {
      id: uid(),
      type: 'timeline',
      kind: 'project',
      title: '项目经历',
      visible: true,
      columns: 1,
      items: [
        {
          id: uid(),
          title: '实时对账平台',
          subtitle: '技术负责人',
          meta: '',
          start: '2022/09',
          end: '2023/04',
          content:
            '- 基于 Kafka + Flink 实现分钟级对账，替代原 T+1 批处理\n- 差错自动归因准确率达 **95%**，人工核对工作量减少 70%',
        },
      ],
    },
    {
      id: uid(),
      type: 'skills',
      title: '专业技能',
      visible: true,
      columns: 2,
      tagMode: false,
      items: [
        {
          id: uid(),
          name: '编程语言',
          content: '- 熟练使用 Go、Java，了解 Rust\n- 熟悉并发模型与性能剖析工具',
        },
        {
          id: uid(),
          name: '数据与中间件',
          content: '- MySQL 调优、分库分表\n- Redis、Kafka、Elasticsearch',
        },
        {
          id: uid(),
          name: '架构与运维',
          content: '- 微服务治理、领域驱动设计\n- Kubernetes、Prometheus、OpenTelemetry',
        },
        {
          id: uid(),
          name: '协作',
          content: '- 主导技术方案评审与代码审查\n- 编写团队开发规范与新人手册',
        },
      ],
    },
    {
      id: uid(),
      type: 'timeline',
      kind: 'education',
      title: '教育经历',
      visible: true,
      columns: 1,
      items: [
        {
          id: uid(),
          title: 'XX 大学',
          subtitle: '本科',
          meta: '计算机科学与技术',
          start: '2015/09',
          end: '2019/06',
          content: '主修课程：数据结构、操作系统、计算机网络、分布式系统。',
        },
      ],
    },
    {
      id: uid(),
      type: 'custom',
      title: '证书与获奖',
      visible: true,
      showTitle: true,
      blocks: [
        newCustomBlock({ text: '某全国性程序设计竞赛 · 一等奖', rightText: '2017', bold: true, marginTop: 4 }),
      ],
    },
  ],
  style: { ...defaultStyle },
});
