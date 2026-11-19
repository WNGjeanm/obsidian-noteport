# Validation report / 测试记录

Release: **0.2.0** · Date / 日期: **2026-11-19**

## Automated regression / 自动回归

**24 tests passed**. The original 16 tests cover native heading styles/numbering, body indentation, lists, tables, formatting, images, language parity, and filenames. Eight media tests add Mermaid insertion order, partial failure recovery, source fallback, size hints, table-cell sizing, high-resolution dimensions, relative/encoded paths, and conversion failure placeholders.

**24 项测试通过**：原有 16 项覆盖标题编号、缩进、列表表格、基础格式、图片、双语和文件名；新增 8 项覆盖图表位置、部分失败恢复、源码降级、尺寸参数、单元格尺寸、高分辨率、相对及编码路径、转换失败占位。

TypeScript checks and the production build pass. / 类型检查和生产构建通过。

## Real renderer integration / 实际渲染引擎验证

Hidden **Electron 45.4.1**, Windows x64, bundled **Mermaid 12.3.0**:

| Check / 检查 | Result / 结果 |
| --- | --- |
| Flowchart with Chinese labels / 中文流程图 | PNG, 1800 × 564 |
| Sequence diagram / 时序图 | PNG, 1398 × 1011 |
| State diagram / 状态图 | PNG, 504 × 972 |
| HTML line breaks and mixed-language labels / 换行及中英标签 | PNG, 552 × 648 |
| Mindmap / 思维导图 | PNG, 798 × 897 |
| Invalid Mermaid followed by valid Mermaid / 错误后继续渲染 | Passed / 通过 |
| SVG and WebP conversion / SVG 和 WebP 转换 | Passed / 通过 |
| Mixed export contains four local pictures and two Mermaid pictures / 四张本地图片加两张图表 | Six editable-positioned static pictures / 六张静态图片 |
| Renderer has no Node access; outbound fetch blocked / 无 Node 权限，网络调用被阻止 | Passed / 通过 |
| Timeout destroys its hidden window / 超时销毁隐藏窗口 | Passed with deterministic stalled-window test / 阻塞窗口模拟测试通过 |
| Normal completion and failed rendering leave no windows / 正常及失败后窗口释放 | Passed / 通过 |

Raster size reflects the Windows display scale; logical DOCX dimensions remain constrained to the page. No desktop screen capture or private-note fixture is part of this release.

栅格尺寸包含 Windows 显示缩放，DOCX 中的逻辑尺寸限制在页面内。本次不拍摄桌面截图，不使用私人笔记。

## Microsoft Word / Word 验证

Microsoft Word **16.0** opened all three generated examples and exported them to PDF. Word's own object model reported:

| Document | Pictures / 图片数 | Pages / 页数 |
| --- | --- | --- |
| sample.docx | 1 | 2 |
| sample-numbered.docx | 1 | 2 |
| sample-media.docx | 6 | 2 |

All six pages were rasterized with Poppler and inspected for missing labels, clipping, overlaps, and picture order. Native Word heading numbering also remains present in the numbered examples.

三份文档共六页，使用 Word 导出 PDF、Poppler 栅格化后逐页检查中文、裁切、重叠和图片顺序；带编号示例仍使用 Word 原生标题编号。

LibreOffice was unavailable in the bundled environment; this is not a LibreOffice compatibility pass. / 环境缺少 LibreOffice，此结果不代表其兼容性验证通过。

## Verification boundaries / 验证边界

The 0.2.0 Obsidian UI and its @electron/remote bridge were not exercised live. The renderer was tested with real Electron windows using an injected constructor, and DOCX output was opened in real Word. Native save-dialog behavior, lower Obsidian/Electron versions, macOS/Linux/mobile, WPS/Pages/Google Docs, very large files, external Mermaid assets, and all SVG/Markdown extensions are not exhaustively verified.

本次未实际操作 0.2.0 的 Obsidian 界面及 @electron/remote 桥接；使用注入构造器创建真实 Electron 窗口验证渲染，并用真实 Word 打开输出。原生保存对话框、较旧 Obsidian/Electron、其他系统及编辑器、大型文件和全部扩展语法未穷尽验证。

[0.1.0 historical report](testing-0.1.0.md) records the earlier live Obsidian/save-flow checks. Those earlier results are not presented as a new 0.2.0 UI pass.

[0.1.0 历史报告](testing-0.1.0.md)保留原先的 Obsidian 和保存流程验证，不作为 0.2.0 新版界面已实测的结论。
