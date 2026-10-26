# Validation report / 测试记录

Release: **0.1.0** · Date / 日期: **2026-10-26**

## Environment / 环境

| Component | Verified environment / 实测环境 |
| --- | --- |
| OS | Windows x64 |
| Obsidian | 1.14.4, independent disposable demo vault / 独立示例库 |
| Microsoft Word | Desktop Word 16.0 on Windows / Windows 桌面版 |
| Build runtime | Node.js 24.22.1, pnpm 11.25.0 |
| Declared minimum API | Obsidian 1.8.7; this exact app version was not run / 未实际运行此最低版本 |

## Automated checks / 自动检查

`pnpm check`, `pnpm test`, `pnpm build`, `pnpm example`, and `pnpm package` pass. / 类型检查、测试、构建、示例生成及打包通过。

The **16 automated tests** cover / **16 项自动测试**覆盖：

- Native H1–H6 styles, unique style IDs, and outline levels. / 六级标题样式唯一且大纲层级正确。
- Bidirectional style/numbering association and paragraph-level numbering. / 标题样式与编号双向关联及段落编号。
- Numbering disabled, preservation of source prefixes, and duplicate-prefix warnings. / 关闭编号、保留原前缀及重复提示。
- Two-character body indent with explicit resets on headings and other styles. / 正文两字符缩进，其他样式显式重置。
- Frontmatter exclusion, ordinary paragraph wraps, explicit line breaks, and inline formatting. / 属性排除、段落换行及基础格式。
- Independent lists, ordered starts, nesting, editable tables, and repeating table headers. / 列表独立编号、起始值、嵌套及可编辑表格。
- Wiki aliases, literal code, unsupported embeds and diagrams retained as text. / 双链显示名、原样代码及未支持内容保留。
- Local image embedding, alternative text, missing/remote image placeholders, and inactive unsafe links. / 本地图片、替代文字、缺失及远程图片占位、非活动危险链接。
- Task states, empty notes, language-key parity, settings validation, and safe filenames. / 任务状态、空笔记、双语资源、配置及文件名校验。

## Real application checks / 真实软件验证

| Check / 检查 | Result / 结果 |
| --- | --- |
| Install and load plugin in the demo vault / 示例库安装加载 | Passed / 通过 |
| Ribbon entry and registered export command / 左侧入口及导出命令 | Passed / 通过 |
| Chinese and English export dialogs / 中英文导出弹窗 | Passed; public screenshots pending / 通过，公开截图待补充 |
| Native save dialog → DOCX write → completion modal / 原生保存至完成状态 | Passed / 通过 |
| Completion action opens the file in Word / 完成后打开 Word | Passed / 通过 |
| Cancel export modal / 取消导出弹窗 | Passed / 通过 |
| Language and export options survive plugin reload / 重载后配置保留 | Passed / 通过 |
| Source sample remains unchanged / 示例源文件未改写 | Checked independently / 单独核验 |
| Word navigation pane recognizes heading hierarchy / Word 导航识别层级 | Passed / 通过 |
| Six-level numbering plus parent restart / 六级编号及父级重启 | Passed: `1 → 1.1 → … → 1.1.1.1.1.1`, `1.2`, `2`, `2.1` |
| Add a new Heading 2 paragraph in Word / Word 中新增二级标题 | Automatically continued as `2.2` / 自动续为 `2.2` |
| Change Normal style font size and first-line indent / 修改正文样式字号和缩进 | Propagates to body text / 正文同步更新 |
| Plain and numbered sample rendering / 两份示例排版 | Two pages each, all four pages inspected / 各两页，四页逐页检查 |

The DOCX renderer bundled with the authoring environment could not find LibreOffice. Visual QA therefore used Microsoft Word's own PDF export followed by Poppler rasterization, plus actual Word window screenshots. This is a Word validation, not a LibreOffice compatibility claim.

文档环境中的渲染器未找到 LibreOffice，因此使用 Microsoft Word 自身导出 PDF、Poppler 转为图片逐页检查，并拍摄实际 Word 窗口。此验证不代表 LibreOffice 兼容性已通过。

## Limits of this verification / 验证边界

macOS, Linux, mobile, WPS, Pages, Google Docs, and other Obsidian versions were not run. Native save-dialog cancellation/overwrite prompts, disk-full/read-only failures, very large notes, every third-party Markdown extension, and all missing-font scenarios have not received exhaustive live testing. Automated warning tests do not replace compatibility tests in those environments.

未实测其他系统、移动端、其他文档编辑器及其他 Obsidian 版本。原生保存对话框的取消及覆盖提示、磁盘满或只读、大型笔记、所有第三方语法及全部缺字字体场景未做穷尽式实际测试。

## Screenshots / 截图

Public screenshots are intentionally left as placeholders for the maintainer to add. See [screenshot instructions](screenshots.md). Screenshots are not included as release evidence.

公开截图按维护者要求预留位置，后续自行补充，见[截图说明](screenshots.md)。本次发布不附截图作为测试证据。
