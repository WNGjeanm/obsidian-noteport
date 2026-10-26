<div align="center">

<img src="docs/images/noteport.svg" width="76" alt="笔呈标志">

# 笔呈 · NotePort

**把笔记，呈为文档。**

将 Obsidian 当前笔记导出为可编辑的 Word 文档，保留原生标题层级、多级编号与正文排版。

**简体中文** · [English](README.md)

[![版本](https://img.shields.io/github/v/release/WNGjeanm/obsidian-noteport)](https://github.com/WNGjeanm/obsidian-noteport/releases/latest)
[![许可](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![桌面版](https://img.shields.io/badge/Obsidian-desktop-7c3aed)

[下载安装](https://github.com/WNGjeanm/obsidian-noteport/releases/latest) · [查看示例](examples) · [反馈问题](https://github.com/WNGjeanm/obsidian-noteport/issues/new/choose)

</div>

![笔呈导出界面 — screenshot pending / 截图待补充](docs/images/screenshot-placeholder.svg)

<!-- Screenshot slot: replace the image URL above with docs/images/export-zh.png after uploading it. -->

## 从笔记到可以继续编辑的 Word

在 Obsidian 中写计划、整理资料，再交给使用 Word 的同事继续编辑。笔呈专注于这一步：导出当前笔记，让标题和正文在 Word 中仍有清楚的结构。

- **原生标题样式**：Markdown 一级至六级标题，对应 Word“标题 1～标题 6”，可在导航窗格中浏览。
- **原生多级编号**：可选择 `1、1.1、1.1.1` 编号，与标题样式关联，编号不写死在标题文字里。
- **统一正文排版**：正文可选不缩进或首行缩进两字符，方便在 Word 中通过样式统一调整。
- **本地生成文档**：无需账号、云端转换、另装 Pandoc，也不要求安装 Word 才能导出文件。
- **完整中英双语**：命令、设置、导出界面和反馈提示支持简体中文及英文。

![在 Microsoft Word 中打开的实际导出结果 — screenshot pending / 截图待补充](docs/images/screenshot-placeholder.svg)

<!-- Screenshot slot: replace the image URL above with docs/images/word-result.png after uploading it. -->

## 三步导出

1. 打开一篇 Markdown 笔记。
2. 从命令面板执行 **笔呈 · NotePort：导出当前笔记为 Word**，也可使用左侧导出图标或当前笔记菜单。
3. 选择标题编号、正文缩进，点击 **导出并选择保存位置**。

保存完成后，可以直接打开文件或打开所在文件夹。默认使用笔记文件名，不额外添加一个文档大标题。属性区不导出。打开导出界面时会捕获当前编辑器的最新文字，导出器不会改写原始笔记。

## 首版支持范围

| 笔记内容 | Word 中的结果 |
| --- | --- |
| 一级至六级标题 | 原生“标题 1～标题 6”，可选十进制多级编号 |
| 普通正文 | Normal 正文样式，可选首行缩进两字符 |
| 加粗、斜体、删除线、行内代码 | 保留可编辑格式 |
| 有序、无序及嵌套列表 | Word 列表，保留有序列表起始值，最多九级 |
| Markdown 表格 | 可编辑表格，首行为重复标题行 |
| 本地 PNG/JPEG/GIF/BMP | 嵌入文档，按比例缩小到页面范围内 |
| `![[图片.png]]`、Markdown 图片 | 根据当前笔记位置解析库内图片 |
| 网页及邮件链接 | 保留可点击链接 |
| `[[笔记\|显示名]]` | 保留显示文字 |
| 引用、代码块 | 引用缩进、等宽代码，无语法高亮 |
| 任务列表 | 保留为静态 `[x]` / `[ ]`，并给出提示 |

### 暂未支持及降级规则

首版仅面向**桌面端、当前单篇笔记**。暂不支持多篇合并、自定义模板导入、读取本机 `Normal.dotm`，也不复刻 Obsidian 主题。插件在 Word 标准样式标识下提供固定、统一的排版。

Mermaid、公式、嵌入笔记、脚注、提示块、HTML 和插件动态视图暂不完整渲染。检测到这些内容时保留源码或可见文字并给出导出提示；提示块转为普通引用。网络图片、SVG、WebP、缺失图片转为文字占位并提示。相对笔记链接保留文字。图片尺寸别名、自定义 HTML 布局、超宽表格不保证还原。超过九级的列表会压到第九级。公式识别采用启发式规则。

纯图片段落沿用所在段落样式。GIF 以原格式嵌入，不承诺动画效果。原标题中手写的编号会保留；开启自动编号后可能重复，常见数字前缀会触发提示。建议自动编号时不要跳过标题层级。

## 安装与升级

目前通过 **GitHub Releases** 发布，尚未上架 Obsidian 社区插件市场。

1. 从[最新版本](https://github.com/WNGjeanm/obsidian-noteport/releases/latest)下载 `noteport-0.1.0.zip`。
2. 将其中的 `noteport` 文件夹解压到 `<你的笔记库>/.obsidian/plugins/`。
3. 确认 `.obsidian/plugins/noteport/` 下直接包含 `main.js`、`manifest.json`、`styles.css`。
4. 重载 Obsidian，在“设置 → 第三方插件”中启用“笔呈 · NotePort”。若有信任提示，请自行审阅并决定。

升级时替换上述三个插件文件，保留已有的 `data.json` 设置。GitHub 自动提供的“Source code”压缩包是开发源码，不是可直接安装的插件成品。

## 设置与排版

| 设置 | 默认值 | 说明 |
| --- | --- | --- |
| 界面语言 | 跟随 Obsidian | 中文环境显示简体中文，其他环境显示英文；可手动选择 |
| 标题自动编号 | 关闭 | 开启后将标题 1～6 绑定到多级编号 |
| 正文首行缩进 | 两字符 | 仅作用于普通正文 |

导出成功后记住本次编号、缩进选项。界面语言不改变文档语言、字体或缩进规则。

![英文导出界面 — screenshot pending / 截图待补充](docs/images/screenshot-placeholder.svg)

<!-- Screenshot slot: replace the image URL above with docs/images/export-en.png after uploading it. -->

内置排版使用 A4 纵向、一英寸页边距；正文 11 磅，西文 Calibri、中文宋体；中文标题使用黑体。正文为 1.5 倍行距、段后 6 磅，六级标题字号分别为 18、15、13、12、11、11 磅。字体不嵌入，其他电脑可能发生字体替换。标题、列表、引用、代码、表格均重置正文的首行缩进。

## 示例与验证

[示例笔记](examples/示例笔记.md)是一份虚构的社区阅读空间改进计划，包含中英文、三级标题、表格、嵌套列表、链接、引用、代码及本地图片。你可以先下载 Word 示例检查质量：

- [不带自动编号的示例](examples/sample.docx)
- [带自动编号的示例](examples/sample-numbered.docx)
- [测试记录与兼容性范围](docs/testing.md)

主页已预留截图位置，由维护者后续补充真实截图。文件名和替换方法见[截图说明](docs/screenshots.md)，示例不包含私人笔记。

## 工作原理与开发

当前笔记经 Markdown 解析，转换为标题、正文、列表等文档元素，再映射 Word 样式和编号、嵌入本地图片，最终通过原生保存对话框写出 DOCX。转换过程不启动 Word。

详细模块划分、编号处理及数据边界见[架构文档](docs/architecture.md)，本地构建与测试见[开发说明](docs/development.md)。

## 常见问题

**为什么不直接复制 Obsidian 的外观？**  
Word 原生样式可以支持导航、编号和统一修改，Obsidian 的主题 CSS 不能直接作为 Word 模板使用。

**“默认样式”会读取我电脑上的 Word 设置吗？**  
不会。插件在 Word 的标准样式标识下提供固定排版，不读取个人模板。

**导出后能继续修改编号和缩进吗？**  
可以。编号使用关联标题样式的 Word 多级列表；正文缩进存储在 Normal 样式中，可以在 Word 中继续调整。

**支持 WPS、Pages 和 Google Docs 吗？**  
这些软件可能可以打开 DOCX，但首版兼容性验证以 Windows Microsoft Word 为目标，其他编辑器及系统需要另行验证。

**笔记会上传吗？**  
导出流程不发起网络请求，读取本地笔记和图片，将生成文件保存到你选择的位置。文档中保留的普通链接由读者之后自行打开。

## 反馈与致谢

请通过 [Issues](https://github.com/WNGjeanm/obsidian-noteport/issues/new/choose) 提供插件、Obsidian、Word 的版本、预期结果及最小示例。分享示例前请自行移除保密内容。

基于 [Obsidian API](https://github.com/obsidianmd/obsidian-api)、[marked](https://github.com/markedjs/marked)、[docx](https://github.com/dolanmiu/docx)、[JSZip](https://github.com/Stuk/jszip) 和 [image-size](https://github.com/image-size/image-size) 构建，详见[第三方说明](THIRD_PARTY_NOTICES.md)。文档组织参考 [DOCX Exporter](https://github.com/kanshurichard/obsidian-docx-exporter) 与 [Obsidian Pandoc](https://github.com/OliverBalfour/obsidian-pandoc)，本项目的代码、文案及示例均为本项目制作。

采用 [MIT 许可证](LICENSE)，与 Obsidian、Microsoft 无隶属关系。
