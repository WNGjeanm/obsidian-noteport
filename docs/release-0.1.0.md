# 笔呈 · NotePort 0.1.0

Export your current Obsidian note to Word with native heading styles, optional multilevel numbering, and consistent body paragraphs.

将 Obsidian 当前笔记导出为可编辑 Word，保留原生标题层级，可选多级编号及正文两字符缩进。

## Included / 首版功能

- Native Heading 1–6, Word navigation, and editable `1 / 1.1 / 1.1.1` numbering. / 原生六级标题、导航和可维护多级编号。
- Editable tables and lists, local images, links, and basic text formatting. / 可编辑表格、列表、本地图片及基础格式。
- English and Simplified Chinese interface. / 中英双语界面。
- Native save dialog and explicit unsupported-content notes. / 原生保存及明确降级提示。
- Public Markdown/DOCX examples, bilingual documentation, and screenshot slots. / 公开示例、双语文档和截图预留位置。

## Install / 安装

Download **`noteport-0.1.0.zip`**, extract its `noteport` folder to `<vault>/.obsidian/plugins/`, then reload Obsidian and enable **笔呈 · NotePort**. Keep `data.json` when upgrading.

下载 **`noteport-0.1.0.zip`**，将 `noteport` 文件夹放入笔记库的 `.obsidian/plugins/`，重载并启用插件。升级保留 `data.json`。

The source-code archives are not installable plugin builds. / Source code 压缩包是源码，不是安装包。

## Validation and scope / 验证与范围

16 automated tests plus type checks and build. Real checks on Windows, Obsidian 1.14.4, and Word 16.0 include the save/open workflow, navigation, six-level numbering, automatic numbering of a newly inserted heading, and body-style edits.

16 项自动测试及类型、构建检查通过；Windows、Obsidian 1.14.4 和 Word 16.0 实测保存打开流程、导航、六级编号、新增标题续号及正文样式修改。

Desktop only. This release does not merge notes or load custom Word templates. Mermaid, formulas, embedded notes, and plugin-generated views are not fully rendered. Other operating systems and document editors are not yet verified.

仅桌面端，首版不含多篇合并和自定义模板。Mermaid、公式、嵌入笔记及动态视图暂不完整渲染；其他系统和文档编辑器尚未实测。

[中文说明](https://github.com/WNGjeanm/obsidian-noteport/blob/main/README.zh-CN.md) · [English](https://github.com/WNGjeanm/obsidian-noteport#readme) · [Test report](https://github.com/WNGjeanm/obsidian-noteport/blob/main/docs/testing.md)
