# EasyCV 简历生成器

React + Vite + MUI 的简历编辑器：左侧填写，右侧实时 A4 预览。编辑界面为淡蓝色调；简历输出只用黑灰，优先保证黑白打印效果。

界面支持简体中文 / 日本語 / English，首次访问按浏览器语言自动选择，可在右上角切换。

内置示例数据（每种语言一份）均为虚构占位（张三 / 山田太郎 / Jane Doe、XX 公司、example.com 等），不含真实公司或个人信息。

```bash
npm install
npm run dev      # 开发
npm run build    # 构建到 dist/
```

- 固定模块：基本信息、自我介绍、工作 / 项目 / 教育经历、专业技能、证书、语言、爱好
- 完全自定义模块：逐块调整字号、粗斜体、对齐、灰度、上间距、缩进、行高，支持右侧文字和分隔线
- 4 套模板（标准 / 经典 / 紧凑 / 极简）+ 字体、字号、行高、页边距等细节调整
- 导出：PDF（自动在段落间分页）、浏览器打印矢量 PDF、PNG / JPG
- 字体：内置 7 款开源字体，可上传本地字体（TTF / OTF / WOFF / WOFF2）
- 纯静态站点，无后台：简历数据存于 localStorage，上传的字体存于 IndexedDB，均只在当前浏览器中
- 可导出 / 导入 JSON 备份

描述类字段支持简单格式：`- ` 或 `・` 开头为列表，`1. ` 为编号，`**文字**` 加粗。

## 多语言

文案在 `src/i18n/`：`zh.ts` 为基准，`ja.ts`、`en.ts` 由类型检查保证键完整。新增语言时复制一份并在 `src/i18n/index.tsx` 的 `LOCALES` 中登记。

## 字体授权

站点只使用自托管的开源字体，不引用任何商业系统字体（如苹方、微软雅黑、宋体）：

| 字体 | 授权 | 来源 |
|---|---|---|
| Noto Sans SC / Noto Serif SC（思源黑体 / 宋体） | SIL OFL 1.1 | `@fontsource/*` |
| Noto Sans JP / Noto Serif JP | SIL OFL 1.1 | `@fontsource/*` |
| LXGW WenKai（霞鹜文楷） | SIL OFL 1.1 | `lxgw-wenkai-webfont` |
| Inter | SIL OFL 1.1 | `@fontsource/inter` |
| Source Serif 4 | SIL OFL 1.1 | `@fontsource/source-serif-4` |

以上字体均可免费商用。字体按 unicode-range 分片，访问者只下载实际用到的字符；构建时只保留 woff2。
用户上传的本地字体仅在其浏览器中使用，授权由用户自行负责。
