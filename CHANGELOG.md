# Changelog / 更新日志

## 0.2.0 — 2026-11-19

- Render fenced Mermaid blocks as embedded PNG pictures, with local rendering, Chinese/HTML labels, and source fallback on errors. / Mermaid 代码块转为 PNG 嵌入 Word，本地渲染，支持中文及换行标签，失败保留源码。
- Convert local SVG/WebP images to PNG; support image width/height hints and source-relative attachment paths. / 本地 SVG/WebP 转为 PNG，支持图片尺寸参数与相对附件路径。
- Use an unindented image paragraph style and fit pictures to page, list, and table-cell widths. / 图片段落不缩进，按页面、列表和表格可用宽度缩放。
- Add mixed Markdown/DOCX examples, 24 regression tests, and hidden Electron renderer integration checks. / 新增图文示例、24 项回归测试及 Electron 渲染集成验证。
- Keep plugin ID and existing language/numbering/indent settings compatible. / 保留插件 ID 和已有语言、编号、缩进配置。

## 0.1.0 — 2026-10-26

- Export the current note to editable DOCX using native Heading 1–6 and body styles. / 当前笔记导出为具有原生标题及正文样式的 DOCX。
- Optional linked multilevel heading numbering and two-character body indentation. / 可选标题多级编号与正文两字符缩进。
- Lists, tables, local images, basic inline formatting, quotes, code, and explicit fallback notes. / 支持列表、表格、本地图片、基础文字格式、引用、代码及明确降级提示。
- English / Simplified Chinese interface with automatic or manual language selection. / 自动跟随或手动选择中英文界面。
- Native save dialog, completion actions, public sample notes, documentation, and screenshot slots. / 原生保存、完成操作、公开示例、文档和截图预留位置。
