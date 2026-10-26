import {test} from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {exportMarkdown,safeFilename} from '../src/exporter';
import {DEFAULT_SETTINGS,settingsFrom} from '../src/settings';
import {dictionaries,languageOf} from '../src/i18n';
async function output(md:string,options={}) {
  const result=await exportMarkdown(md,'Test',{...DEFAULT_SETTINGS,...options});
  const zip=await JSZip.loadAsync(result.buffer);
  const document=await zip.file('word/document.xml')!.async('string');
  const styles=await zip.file('word/styles.xml')!.async('string');
  const numbering=await zip.file('word/numbering.xml')!.async('string');
  return {...result,zip,document,styles,numbering};
}
test('all six heading levels are native paragraph styles',async()=>{
  const r=await output(Array.from({length:6},(_,i)=>'#'.repeat(i+1)+' Section '+i).join('\n\n'));
  for(let i=1;i<=6;i++) assert.match(r.document,new RegExp(`w:pStyle w:val="Heading${i}"`));
  for(let i=0;i<6;i++) assert.match(r.styles,new RegExp(`w:outlineLvl w:val="${i}"`));
  const ids=[...r.styles.matchAll(/w:styleId="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(ids.length,new Set(ids).size,'style IDs must be unique');
});
test('numbering binds levels to Heading styles, without inserting textual numbers',async()=>{
  const r=await output('# Alpha\n\n## Beta\n\n# Gamma',{numbering:true});
  assert.match(r.numbering,/w:pStyle w:val="Heading1"/);
  assert.match(r.numbering,/w:lvlText w:val="%1.%2"/);
  const heading1=r.styles.match(/<w:style[^>]*w:styleId="Heading1"[\s\S]*?<\/w:style>/)![0];
  assert.match(heading1,/<w:numPr>/);assert.match(r.document,/>Alpha<\/w:t>/);assert.doesNotMatch(r.document,/>1 Alpha/);
  assert.doesNotMatch(heading1,/<w:pStyle/);
  assert.match(r.document,/<w:pStyle w:val="Heading2"\/><w:numPr><w:ilvl w:val="1"\/>/);
  assert.doesNotMatch(r.numbering,/<w:lvlRestart/,'use default parent-level restart for Word compatibility');
});
test('numbering can be disabled and duplicate source prefixes are reported',async()=>{
  const off=await output('# 1 Existing');assert.equal(off.warnings.length,0);
  const on=await output('# 1 Existing',{numbering:true});assert.ok(on.warnings.some(x=>x.code==='duplicate'));
  assert.match(on.document,/>1 Existing<\/w:t>/);
});
test('body indent is style-based and optional; other styles reset it',async()=>{
  const a=await output('正文'), b=await output('正文',{indent:false});
  assert.match(a.styles,/w:firstLineChars="200"/);assert.doesNotMatch(b.styles,/w:firstLineChars="200"/);
  for(const id of ['Heading1','ListParagraph','Quote','CodeBlock','TableText']) assert.match(a.styles.match(new RegExp(`<w:style[^>]*w:styleId="${id}"[\\s\\S]*?<\\/w:style>`))![0],/w:firstLine="0" w:firstLineChars="0"/);
});
test('frontmatter is excluded and ordinary line wraps stay in one paragraph',async()=>{
  const r=await output('---\nsecret: no\n---\n第一行\n第二行\n\n新段落');
  assert.doesNotMatch(r.document,/secret/);assert.match(r.document,/第一行 第二行/);assert.equal((r.document.match(/<w:p>/g)||[]).length,2);
});
test('strong, emphasis, strike, hard breaks and external hyperlinks survive',async()=>{
  const r=await output('**Bold** *Italic* ~~Deleted~~  \n[Link](https://example.com)');
  for(const x of ['<w:b/>','<w:i/>','<w:strike/>','<w:br/>','<w:hyperlink'])assert.ok(r.document.includes(x),x);
  assert.match(await r.zip.file('word/_rels/document.xml.rels')!.async('string'),/https:\/\/example.com/);
});
test('lists use independent numbering instances, preserve starts and nested levels',async()=>{
  const r=await output('3. Third\n4. Fourth\n   - Child\n\nParagraph\n\n1. Restart');
  assert.match(r.numbering,/w:start w:val="3"/);assert.match(r.document,/w:ilvl w:val="1"/);
  const ids=[...r.document.matchAll(/w:numId w:val="(\d+)"/g)].map(x=>x[1]);assert.ok(new Set(ids).size>=3);
});
test('editable tables include a repeating header and no body first-line indent',async()=>{
  const r=await output('| Name | Value |\n|---|---:|\n| A | 12 |');
  assert.match(r.document,/<w:tbl>/);assert.match(r.document,/<w:tblHeader/);assert.match(r.document,/w:pStyle w:val="TableText"/);
});
test('wiki aliases convert to text while code is preserved literally',async()=>{
  const r=await output('[[Other|Alias]]\n\n`[[literal]]`\n\n```md\n![[keep.png]]\n```');
  assert.match(r.document,/>Alias<\/w:t>/);assert.match(r.document,/\[\[literal\]\]/);assert.match(r.document,/!\[\[keep.png\]\]/);assert.equal(r.warnings.length,0);
});
test('unsupported embeds and diagram code remain visible with warnings',async()=>{
  const r=await output('![[Other note]]\n\n```mermaid\ngraph LR\n A-->B\n```');
  assert.match(r.document,/Other note/);assert.match(r.document,/A--&gt;B/);assert.ok(r.warnings.length>=2);
});
test('remote images and unsafe links never become outbound active relationships',async()=>{
  const r=await output('![Remote](https://example.com/x.png)\n\n[Unsafe](javascript:alert)');
  assert.ok(r.warnings.some(x=>x.code==='image'));assert.ok(r.warnings.some(x=>x.code==='unsupported'));
  const rels=await r.zip.file('word/_rels/document.xml.rels')!.async('string');assert.doesNotMatch(rels,/javascript:|example.com/);
});
test('local images are embedded in the DOCX package with accessible alt text',async()=>{
  const data=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
  const r=await exportMarkdown('![Sample](x.png)\n\n![[x.png]]','Images',DEFAULT_SETTINGS,async()=>({data}));
  const zip=await JSZip.loadAsync(r.buffer);assert.ok(Object.keys(zip.files).some(x=>x.startsWith('word/media/')&&x.endsWith('.png')));assert.equal(r.warnings.length,0);
  assert.match(await zip.file('word/document.xml')!.async('string'),/descr="Sample"/);
});
test('missing image is visible, empty notes produce a valid document',async()=>{
  const r=await output('![Missing](missing.png)');assert.match(r.document,/\[Missing\]/);assert.equal(r.warnings[0].code,'image');
  const empty=await output('');assert.match(empty.document,/<w:body>/);
});
test('task state is retained in editable static text',async()=>{
  const r=await output('- [x] Done\n- [ ] Pending');assert.match(r.document,/\[x\]/);assert.match(r.document,/\[ \]/);assert.match(r.document,/Done/);
});
test('language keys match and settings reject invalid values',()=>{
  assert.deepEqual(Object.keys(dictionaries.en).sort(),Object.keys(dictionaries.zh).sort());
  assert.equal(languageOf('auto','zh-CN'),'zh');assert.equal(languageOf('auto','fr'),'en');assert.equal(languageOf('en','zh'),'en');
  assert.deepEqual(settingsFrom({language:'bad',numbering:'yes',indent:false}),{language:'auto',numbering:false,indent:false});
});
test('filenames are safe on Windows',()=>{
  assert.equal(safeFilename('CON'),'_CON.docx');assert.equal(safeFilename('a/b:*?'),'a_b___.docx');assert.equal(safeFilename(''),'Note.docx');
});
