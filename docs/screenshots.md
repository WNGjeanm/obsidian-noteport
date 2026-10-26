# Screenshot slots / 截图位置

The first release intentionally uses placeholders. / 首版按维护者要求使用占位图。

Upload real captures to `docs/images/`, then replace the corresponding placeholder URL in **both** `README.md` and `README.zh-CN.md`. Each position has an HTML comment naming its expected file.

将真实截图上传到 `docs/images/`，然后在**中英文两份 README** 中将对应的占位图地址换成实际地址。每处占位图下方的 HTML 注释注明了目标文件名。

| File / 文件名 | Content / 建议内容 |
| --- | --- |
| `export-zh.png` | Chinese export dialog / 中文导出界面 |
| `word-result.png` | Word result with the navigation pane and numbered headings / 带导航窗格和标题编号的 Word 结果 |
| `export-en.png` | English export dialog / 英文导出界面 |
| `source-note.png` | Optional Markdown source / 可选示例笔记源码 |

For example / 示例：

```md
![NotePort export dialog](docs/images/export-zh.png)
```

Use the public sample in `examples/` so readers can reproduce the result. Keep private notes and account information out of screenshots. Placeholder files can remain in the repository after replacement.

建议使用 `examples/` 中的公开示例，方便他人复现。截图避开私人笔记及账号信息。替换后可保留占位 SVG 文件。
