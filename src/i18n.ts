export type Language = 'auto' | 'zh' | 'en';
const en = {
  export: 'Export current note to Word', settings: 'Export settings',
  intro: 'Native Word styles. Editable headings. Ready to share.',
  language: 'Language', languageDesc: 'Follow Obsidian or choose a display language. Document formatting is independent.',
  auto: 'Follow Obsidian', numbering: 'Automatic heading numbering',
  numberingDesc: 'Link Heading 1–6 to a Word multilevel list: 1, 1.1, 1.1.1. Existing title text is kept.',
  indent: 'Body first-line indent', indentDesc: 'Applies only to body paragraphs, not headings, lists, quotes, code, or table cells.',
  none: 'None', two: '2 characters', ready: 'Export Word document',
  summary: 'Current note → editable .docx. A4 portrait with built-in Word styles.',
  save: 'Export and choose location', cancel: 'Cancel', busy: 'Exporting…', noNote: 'Open a Markdown note first.',
  success: 'Export complete', failed: 'Export failed', open: 'Open file', folder: 'Show in folder',
  warnings: 'Export notes', warningIntro: 'Some content needs attention. Your original note was not changed.',
  duplicate: 'Some headings already contain numbers. Automatic numbering may create duplicate prefixes.',
  body: 'Body', numbered: 'Heading numbering', on: 'On', off: 'Off', saved: 'Saved to',
  limited: 'Local PNG/JPEG/GIF/BMP images only. Mermaid, formulas, embedded notes, and plugin-generated views are not rendered.',
  close: 'Done', count: 'item(s)',
  unsupported: 'Unsupported content kept as text', image: 'Image not embedded',
};
const zh: typeof en = {
  export: '导出当前笔记为 Word', settings: '导出设置', intro: '原生 Word 样式，标题可编辑，文档可交付。',
  language: '界面语言', languageDesc: '默认跟随 Obsidian，也可手动选择。界面语言不改变文档排版。',
  auto: '跟随 Obsidian', numbering: '标题自动编号', numberingDesc: '将标题 1～6 关联到 Word 多级列表：1、1.1、1.1.1。保留原标题文字。',
  indent: '正文首行缩进', indentDesc: '仅作用于普通正文，不影响标题、列表、引用、代码和表格。',
  none: '不缩进', two: '2 字符', ready: '导出 Word 文档',
  summary: '当前笔记 → 可编辑的 .docx，使用 A4 纵向及内置 Word 样式。',
  save: '导出并选择保存位置', cancel: '取消', busy: '正在导出…', noNote: '请先打开一篇 Markdown 笔记。',
  success: '导出完成', failed: '导出失败', open: '打开文件', folder: '打开所在文件夹',
  warnings: '导出提示', warningIntro: '以下内容需要留意，原始笔记未被修改。',
  duplicate: '部分标题已包含编号，开启自动编号可能出现重复前缀。',
  body: '正文', numbered: '标题编号', on: '开启', off: '关闭', saved: '保存位置',
  limited: '支持本地 PNG/JPEG/GIF/BMP 图片。Mermaid、公式、嵌入笔记及插件动态内容暂不渲染。',
  close: '完成', count: '项', unsupported: '未支持内容已保留为文字', image: '图片未嵌入',
};
export function languageOf(language: Language, locale = 'en'): 'zh' | 'en' {
  return language === 'auto' ? (locale.toLowerCase().startsWith('zh') ? 'zh' : 'en') : language;
}
export function strings(language: Language, locale?: string) { return languageOf(language, locale) === 'zh' ? zh : en; }
export const dictionaries = { en, zh };
