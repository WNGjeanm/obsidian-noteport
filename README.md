<div align="center">

<img src="docs/images/noteport.svg" width="76" alt="NotePort logo">

# 笔呈 · NotePort

**Your notes, ready for Word.**

Export the current Obsidian note to an editable Word document with native heading styles, multilevel numbering, and consistent paragraph formatting.

[简体中文](README.zh-CN.md) · **English**

[![Release](https://img.shields.io/github/v/release/WNGjeanm/obsidian-noteport)](https://github.com/WNGjeanm/obsidian-noteport/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Desktop only](https://img.shields.io/badge/Obsidian-desktop-7c3aed)

[Download](https://github.com/WNGjeanm/obsidian-noteport/releases/latest) · [Try the sample](examples) · [Report an issue](https://github.com/WNGjeanm/obsidian-noteport/issues/new/choose)

</div>

![NotePort export dialog — screenshot pending / 截图待补充](docs/images/screenshot-placeholder.svg)

<!-- Screenshot slot: replace the image URL above with docs/images/export-zh.png after uploading it. -->

## From a note to a document you can keep editing

Writing a plan in Obsidian is convenient. Sharing it with a colleague who works in Word should be convenient too. NotePort focuses on one workflow: export the note you are reading or editing, then continue working in Word.

- **Real heading styles.** Markdown H1–H6 map to Word Heading 1–6 and appear in the navigation pane.
- **Real multilevel numbering.** Optionally number headings as `1`, `1.1`, `1.1.1`, linked to the heading styles. Numbers are not pasted into title text.
- **Consistent body paragraphs.** Choose no first-line indent or a two-character indent. Change the body style in Word to update the document.
- **Local export.** No account, cloud conversion, Pandoc installation, or installed Word is needed to generate a file.
- **English and Simplified Chinese.** Follow Obsidian's language or choose your interface language explicitly.

![Exported document in Microsoft Word — screenshot pending / 截图待补充](docs/images/screenshot-placeholder.svg)

<!-- Screenshot slot: replace the image URL above with docs/images/word-result.png after uploading it. -->

## Quick start

1. Open a Markdown note.
2. Open the command palette and run **NotePort: Export current note to Word**, or use the file-output ribbon icon / current note's menu.
3. Choose heading numbering and body indentation, then click **Export and choose location**.
4. Choose a `.docx` destination. After export, open the file or reveal it in your file manager.

The note's filename becomes the suggested output filename. No extra document title is inserted. Frontmatter is excluded. The active editor's current text is captured when the export dialog opens; the source note is never rewritten by the exporter.

## What exports

| Content | Result |
| --- | --- |
| Headings H1–H6 | Native Word Heading 1–6; optional decimal outline numbering |
| Body paragraphs | Normal style; optional two-character first-line indent |
| Bold / italic / strikethrough / inline code | Editable text formatting |
| Ordered / unordered / nested lists | Word list numbering; ordered starts retained, up to 9 levels |
| Markdown tables | Editable Word tables with repeating header rows |
| Local PNG / JPEG / GIF / BMP | Embedded, proportionally reduced to fit the page |
| `![[image.png]]` and Markdown images | Local vault images resolved relative to the note |
| HTTP(S) / email links | Clickable links |
| `[[note\|alias]]` | Visible alias as plain text |
| Blockquotes / code blocks | Indented quote / monospaced code; no syntax highlighting |
| Task lists | Static `[x]` / `[ ]` text with an export note |

### Explicit limits

This first release exports **one current note on desktop**. It does not merge notes, import Word templates, copy your personal `Normal.dotm`, or reproduce Obsidian themes. It writes its own consistent styles under Word's standard style IDs.

Mermaid, formulas, embedded notes, footnotes, callouts, HTML, and plugin-generated views are not fully rendered. Where detected, source or visible text is retained with an export note. Callouts become ordinary quotes. Remote images, SVG, WebP, and missing images become text placeholders with an export note. Relative note links remain text. Image sizing aliases, custom HTML layouts, and very wide tables are not reproduced faithfully. Extremely deep lists are flattened to Word's nine-level limit. Formula detection is heuristic.

Image-only paragraphs use the surrounding paragraph style. GIFs are embedded as GIF data; animation is not promised. Existing heading numbers are preserved; enabling automatic numbering can create duplicate prefixes and triggers a warning for common numeric patterns. Avoid skipped heading levels when using automatic numbering.

## Installation

NotePort is distributed through **GitHub Releases**. It is not yet listed in the Obsidian community directory.

1. Download `noteport-0.1.0.zip` from the [latest release](https://github.com/WNGjeanm/obsidian-noteport/releases/latest).
2. Extract the `noteport` folder into `<your-vault>/.obsidian/plugins/`.
3. Confirm that `main.js`, `manifest.json`, and `styles.css` are directly inside `.obsidian/plugins/noteport/`.
4. Reload Obsidian and enable **笔呈 · NotePort** under **Settings → Community plugins**. Review Obsidian's trust prompt yourself if shown.

To upgrade, replace those three plugin files with the new release files. Keep your existing `data.json` settings file. GitHub's “Source code” archive is for development and is not an installable build.

## Settings

| Setting | Default | Meaning |
| --- | --- | --- |
| Language | Follow Obsidian | Simplified Chinese for `zh` locales; English otherwise; manual override available |
| Automatic heading numbering | Off | Bind Heading 1–6 to `1 / 1.1 / 1.1.1…` |
| Body first-line indent | 2 characters | Only ordinary body paragraphs are indented |

The export dialog remembers numbering and indentation after a successful save. Interface language does not change document content or typography.

![English interface — screenshot pending / 截图待补充](docs/images/screenshot-placeholder.svg)

<!-- Screenshot slot: replace the image URL above with docs/images/export-en.png after uploading it. -->

### Document defaults

A4 portrait, 1-inch margins, 11 pt body text, Calibri for Latin text and SimSun for Chinese; SimHei for Chinese headings. Body line spacing is 1.5 with 6 pt after paragraphs. Headings use 18 / 15 / 13 / 12 / 11 / 11 pt. Fonts are not embedded and may be substituted on other computers. Headings, lists, quotes, code, and table text explicitly reset the body's first-line indent.

## Sample and verification

The [sample note](examples/示例笔记.md) describes a fictional community reading-space improvement plan. It includes Chinese and English text, three heading levels, a table, nested lists, links, a quote, code, and a local image.

- [Plain headings](examples/sample.docx)
- [Automatically numbered headings](examples/sample-numbered.docx)
- [Test report and compatibility scope](docs/testing.md)

Screenshot slots are reserved for the maintainer to add real captures. See the [screenshot guide](docs/screenshots.md) for filenames and replacement locations. The sample contains no personal notes.

## How it works

NotePort captures the active note, parses Markdown into tokens, maps those tokens to editable DOCX elements, binds styles and numbering, embeds supported vault images, then opens the native save dialog. It does not launch Word for conversion.

Read the [architecture](docs/architecture.md) for the module map, numbering implementation, data boundaries, and limitations. See [development](docs/development.md) for building and testing.

## FAQ

**Why not copy the visual appearance of my Obsidian theme?**  
The output uses document styles so Word can navigate headings and edit paragraphs consistently. Theme CSS is not a Word template.

**Does “default Word styles” mean my computer's personal defaults?**  
No. NotePort supplies fixed formatting under standard Word style IDs. It does not read local Word templates.

**Can I change numbering or indentation in Word?**  
Yes. Heading numbering uses a Word multilevel list associated with Heading 1–6; body indentation lives in Normal. Changes to those styles can be made in Word.

**Does it support WPS, Pages, or Google Docs?**  
They may open DOCX, but this release's compatibility validation targets Microsoft Word on Windows. Other editors and operating systems require separate testing.

**Is anything uploaded?**  
The export path makes no network requests. Markdown and images are read locally and the resulting file is written to your selected location. Standard links in the document can be opened later by the reader.

## Feedback and credits

Please include plugin/Obsidian/Word versions, the expected result, and a minimal example when [reporting a problem](https://github.com/WNGjeanm/obsidian-noteport/issues/new/choose). Remove confidential content before sharing a note.

Built with [Obsidian API](https://github.com/obsidianmd/obsidian-api), [marked](https://github.com/markedjs/marked), [docx](https://github.com/dolanmiu/docx), [JSZip](https://github.com/Stuk/jszip), and [image-size](https://github.com/image-size/image-size). See [third-party notices](THIRD_PARTY_NOTICES.md). Documentation organization was informed by [DOCX Exporter](https://github.com/kanshurichard/obsidian-docx-exporter) and [Obsidian Pandoc](https://github.com/OliverBalfour/obsidian-pandoc); NotePort's implementation, copy, and sample were created for this project.

Released under the [MIT License](LICENSE). Not affiliated with Obsidian or Microsoft.
