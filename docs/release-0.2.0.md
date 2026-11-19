# 笔呈 · NotePort 0.2.0

Export Markdown notes with local pictures and Mermaid diagrams into Word. / 将笔记中的本地图片和 Mermaid 图表一起导出到 Word。

## New / 新增

- Fenced Mermaid blocks become static PNG pictures, preserving their place among editable text. Chinese labels and HTML line breaks are supported. / Mermaid 代码块在原位置转为 PNG，前后正文仍可编辑，支持中文和换行标签。
- Local SVG and WebP are converted to PNG, alongside existing PNG/JPEG/GIF/BMP support. / 新增 SVG/WebP 转 PNG，并保留原有常见图片支持。
- Image width/height hints, source-relative paths, image paragraphs without first-line indent, and table/list width fitting. / 支持尺寸参数、相对路径、图片段落无缩进及表格列表内图片缩放。
- Conversion failures retain Mermaid source or an image placeholder and show a completion note. Later content continues exporting. / 失败时保留源码或图片占位并提示，后续内容继续导出。

## Upgrade / 升级

Download **`noteport-0.2.0.zip`** and replace `main.js`, `manifest.json`, and `styles.css` in `<vault>/.obsidian/plugins/noteport/`. Keep your existing `data.json`, then reload the plugin.

下载 **`noteport-0.2.0.zip`**，替换笔记库 `.obsidian/plugins/noteport/` 下的三个插件文件，保留原来的 `data.json`，然后重载插件。无需重新设置语言、编号和缩进。

Mermaid is bundled; users do not need Pandoc, a separate Mermaid CLI, or an internet connection to convert diagrams. / Mermaid 已打包，无需额外安装 Pandoc 或 Mermaid 命令行工具，转换过程不联网。

The separate **sample-media.docx** attachment is a demo output, not an installation file. / 附件中的 **sample-media.docx** 是图文导出效果示例，不是安装文件。

## Validation / 验证

24 automated regression tests, type check, build and release checks. Hidden Electron 45.4.1 tests cover five diagram types, Chinese/HTML labels, SVG/WebP, error recovery, timeout cleanup, and network isolation. Microsoft Word 16.0 opens the mixed sample with six pictures across two pages; all six pages of the three example documents were visually inspected.

24 项自动回归测试、类型、构建及发布检查通过；Electron 45.4.1 验证五类图表、中文和换行、SVG/WebP、错误恢复、超时清理及网络隔离。Word 16.0 实测混合示例包含六张图片、共两页，三份示例的六页均已检查。

The upgraded Obsidian UI and its remote bridge were not exercised live in this release. Windows is the validated environment; macOS/Linux and other document editors are not verified. / 本次未重新进行升级版 Obsidian 界面及其远程桥接的实际操作验证；实测环境为 Windows，其他系统和文档编辑器未验证。

[中文说明](https://github.com/WNGjeanm/obsidian-noteport/blob/main/README.zh-CN.md) · [Media guide](https://github.com/WNGjeanm/obsidian-noteport/blob/main/docs/media-export.md) · [Mixed DOCX sample](https://github.com/WNGjeanm/obsidian-noteport/blob/main/examples/sample-media.docx)
