/**
 * 各语言的示例简历。
 * 所有人名、公司、学校、电话、链接均为虚构占位：
 * 「张三 / 山田太郎 / Jane Doe」为各语言惯用的占位人名，
 * 电话使用不存在的号段（英文版使用北美保留给虚构用途的 555-01xx），
 * 链接使用专为示例保留的 example.com。
 */
import type { ResumeData } from './types';
import type { Locale } from './i18n';
import {
  defaultStyle,
  newCustomBlock,
  newCustomSection,
  newSkillItem,
  newSkillsSection,
  newTextSection,
  newTimelineItem,
  newTimelineSection,
  uid,
} from './defaults';

const link = (label: string, value: string, url: string) => ({ id: uid(), label, value, url });

function zh(): ResumeData {
  return {
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
      links: [link('个人主页', 'example.com', 'https://example.com'), link('作品集', 'portfolio.example.com', 'https://portfolio.example.com')],
    },
    sections: [
      newTextSection(
        '自我介绍',
        '6 年服务端开发经验，熟悉 Go 与 Java 技术栈，长期负责高并发交易与数据平台。关注系统稳定性、可观测性与团队工程效率，习惯用数据驱动技术决策。',
      ),
      newTimelineSection('work', '工作经历', [
        newTimelineItem({
          title: 'XX 科技有限公司',
          subtitle: '高级后端工程师',
          meta: '上海',
          start: '2021/07',
          end: '至今',
          content:
            '负责支付清结算系统的架构演进与稳定性建设，带领 4 人小组完成核心链路重构。\n- 将单体结算服务拆分为对账、计费、出款三个领域服务，日处理订单量提升至 **800 万**\n- 建立全链路追踪与 SLO 告警体系，线上故障平均恢复时间缩短 **60%**',
        }),
        newTimelineItem({
          title: 'YY 网络科技有限公司',
          subtitle: '后端开发工程师',
          meta: '杭州',
          start: '2019/03',
          end: '2021/06',
          content:
            '参与会员与营销平台开发，负责优惠券、积分等高频业务模块。\n- 设计基于 Redis 的库存预扣方案，支撑大促峰值 **3 万 QPS**\n- 沉淀通用规则引擎，新活动上线周期由 5 天缩短至 1 天',
        }),
      ]),
      newTimelineSection('project', '项目经历', [
        newTimelineItem({
          title: '实时对账平台',
          subtitle: '技术负责人',
          start: '2022/09',
          end: '2023/04',
          content: '- 基于 Kafka + Flink 实现分钟级对账，替代原 T+1 批处理\n- 差错自动归因准确率达 **95%**，人工核对工作量减少 70%',
        }),
      ]),
      newSkillsSection('专业技能', [
        newSkillItem({ name: '编程语言', content: '- 熟练使用 Go、Java，了解 Rust\n- 熟悉并发模型与性能剖析工具' }),
        newSkillItem({ name: '数据与中间件', content: '- MySQL 调优、分库分表\n- Redis、Kafka、Elasticsearch' }),
        newSkillItem({ name: '架构与运维', content: '- 微服务治理、领域驱动设计\n- Kubernetes、Prometheus、OpenTelemetry' }),
        newSkillItem({ name: '协作', content: '- 主导技术方案评审与代码审查\n- 编写团队开发规范与新人手册' }),
      ]),
      newTimelineSection('education', '教育经历', [
        newTimelineItem({
          title: 'XX 大学',
          subtitle: '本科',
          meta: '计算机科学与技术',
          start: '2015/09',
          end: '2019/06',
          content: '主修课程：数据结构、操作系统、计算机网络、分布式系统。',
        }),
      ]),
      newCustomSection('证书与获奖', [
        newCustomBlock({ text: '某全国性程序设计竞赛 · 一等奖', rightText: '2017', bold: true, marginTop: 4 }),
      ]),
    ],
    style: defaultStyle('zh'),
  };
}

function ja(): ResumeData {
  return {
    version: 1,
    docTitle: 'バックエンドエンジニア - サンプル',
    basic: {
      name: '山田 太郎',
      title: 'バックエンドエンジニア',
      avatar: '',
      location: '東京都',
      phone: '000-0000-0000',
      email: 'taro.yamada@example.com',
      birth: '1995/04',
      wechat: '',
      links: [link('Web サイト', 'example.com', 'https://example.com'), link('ポートフォリオ', 'portfolio.example.com', 'https://portfolio.example.com')],
    },
    sections: [
      newTextSection(
        '自己 PR',
        'サーバーサイド開発 6 年。Go と Java を中心に、高トラフィックな決済・データ基盤の開発を担当してきました。システムの安定性と可観測性、チームの開発生産性を重視し、データに基づいた技術判断を心がけています。',
      ),
      newTimelineSection('work', '職務経歴', [
        newTimelineItem({
          title: '株式会社 A',
          subtitle: 'シニアバックエンドエンジニア',
          meta: '東京',
          start: '2021/07',
          end: '現在',
          content:
            '決済・精算システムのアーキテクチャ刷新と安定性向上を担当。4 名のチームを率いてコア機能を再構築。\n・モノリスの精算サービスを照合・課金・出金の 3 サービスに分割し、1 日の処理件数を **800 万件** に拡大\n・分散トレーシングと SLO アラートを整備し、障害の平均復旧時間を **60%** 短縮',
        }),
        newTimelineItem({
          title: '株式会社 B',
          subtitle: 'バックエンドエンジニア',
          meta: '大阪',
          start: '2019/04',
          end: '2021/06',
          content:
            '会員・販促プラットフォームの開発に従事し、クーポンやポイントなど高頻度の機能を担当。\n・Redis による在庫の事前引当方式を設計し、セール時のピーク **3 万 QPS** に対応\n・汎用ルールエンジンを構築し、新キャンペーンの開発期間を 5 日から 1 日に短縮',
        }),
      ]),
      newTimelineSection('project', 'プロジェクト', [
        newTimelineItem({
          title: 'リアルタイム照合基盤',
          subtitle: '技術リード',
          start: '2022/09',
          end: '2023/04',
          content: '・Kafka + Flink で分単位の照合を実現し、従来の翌日バッチを置き換え\n・差異の自動原因特定の精度 **95%**、手作業での確認工数を 70% 削減',
        }),
      ]),
      newSkillsSection('スキル', [
        newSkillItem({ name: 'プログラミング言語', content: '・Go、Java（実務）、Rust（学習中）\n・並行処理とパフォーマンス分析' }),
        newSkillItem({ name: 'データ・ミドルウェア', content: '・MySQL チューニング、シャーディング\n・Redis、Kafka、Elasticsearch' }),
        newSkillItem({ name: 'アーキテクチャ・運用', content: '・マイクロサービス、ドメイン駆動設計\n・Kubernetes、Prometheus、OpenTelemetry' }),
        newSkillItem({ name: 'チーム', content: '・設計レビューとコードレビューを主導\n・開発ガイドラインと新人向け資料を整備' }),
      ]),
      newTimelineSection('education', '学歴', [
        newTimelineItem({
          title: 'X 大学',
          subtitle: '学士',
          meta: '情報工学科',
          start: '2015/04',
          end: '2019/03',
          content: '主な履修科目：データ構造、オペレーティングシステム、ネットワーク、分散システム',
        }),
      ]),
      newCustomSection('資格・受賞', [
        newCustomBlock({ text: '全国プログラミングコンテスト · 優秀賞', rightText: '2017', bold: true, marginTop: 4 }),
      ]),
    ],
    style: defaultStyle('ja'),
  };
}

function en(): ResumeData {
  return {
    version: 1,
    docTitle: 'Backend Engineer - Sample',
    basic: {
      name: 'Jane Doe',
      title: 'Backend Engineer',
      avatar: '',
      location: 'City, Country',
      phone: '+1 555-0123',
      email: 'jane.doe@example.com',
      birth: '',
      wechat: '',
      links: [link('Website', 'example.com', 'https://example.com'), link('Portfolio', 'portfolio.example.com', 'https://portfolio.example.com')],
    },
    sections: [
      newTextSection(
        'Summary',
        'Backend engineer with 6 years in Go and Java, building high-traffic payment and data platforms. Focused on reliability, observability and data-driven technical decisions.',
      ),
      newTimelineSection('work', 'Experience', [
        newTimelineItem({
          title: 'Company A',
          subtitle: 'Senior Backend Engineer',
          meta: 'Remote',
          start: '2021/07',
          end: 'Present',
          content:
            'Owned the payment settlement system; led a team of 4 through a core rewrite.\n- Split the settlement monolith into three services, scaling to **8M orders/day**\n- Introduced distributed tracing and SLO alerting, cutting mean time to recovery by **60%**',
        }),
        newTimelineItem({
          title: 'Company B',
          subtitle: 'Backend Engineer',
          meta: 'Onsite',
          start: '2019/03',
          end: '2021/06',
          content:
            'Built membership and promotion features such as coupons and loyalty points.\n- Designed a Redis-based inventory reservation scheme handling **30K QPS** peaks\n- Created a reusable rules engine, reducing campaign launch time from 5 days to 1',
        }),
      ]),
      newTimelineSection('project', 'Projects', [
        newTimelineItem({
          title: 'Real-time Reconciliation Platform',
          subtitle: 'Tech Lead',
          start: '2022/09',
          end: '2023/04',
          content:
            '- Replaced next-day batch jobs with minute-level reconciliation on Kafka + Flink\n- Automated root-cause detection with **95%** accuracy, cutting manual checks by 70%',
        }),
      ]),
      newSkillsSection('Skills', [
        newSkillItem({ name: 'Languages', content: '- Go, Java; familiar with Rust\n- Concurrency and performance profiling' }),
        newSkillItem({ name: 'Data & Middleware', content: '- MySQL tuning and sharding\n- Redis, Kafka, Elasticsearch' }),
        newSkillItem({ name: 'Architecture & Ops', content: '- Microservices, domain-driven design\n- Kubernetes, Prometheus, OpenTelemetry' }),
        newSkillItem({ name: 'Collaboration', content: '- Led design and code reviews\n- Wrote team guidelines and onboarding docs' }),
      ]),
      newTimelineSection('education', 'Education', [
        newTimelineItem({
          title: 'University X',
          subtitle: 'B.Sc.',
          meta: 'Computer Science',
          start: '2015/09',
          end: '2019/06',
          content: 'Coursework: data structures, operating systems, networking, distributed systems.',
        }),
      ]),
      newCustomSection('Awards', [
        newCustomBlock({ text: 'National Programming Contest · First Prize', rightText: '2017', bold: true, marginTop: 4 }),
      ]),
    ],
    style: defaultStyle('en'),
  };
}

export const sampleData = (locale: Locale): ResumeData => ({
  ...{ zh, ja, en }[locale](),
  pristine: { kind: 'sample', locale },
});
