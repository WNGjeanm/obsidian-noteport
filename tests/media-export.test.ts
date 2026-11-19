import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import JSZip from 'jszip';
import {exportMarkdown,type ImageAsset} from '../src/exporter';
import {DEFAULT_SETTINGS} from '../src/settings';
import {vaultImageResolver} from '../src/vault-images';
import type {App} from 'obsidian';

const png=await readFile(new URL('../examples/assets/reading-plan.png',import.meta.url));
async function xml(result:Awaited<ReturnType<typeof exportMarkdown>>) {
  const zip=await JSZip.loadAsync(result.buffer);
  return {zip,document:await zip.file('word/document.xml')!.async('string')};
}
test('Mermaid becomes a picture in place, preserving the surrounding text order',async()=>{
  const sources:string[]=[];
  const r=await exportMarkdown('Before\n\n```mermaid\nflowchart LR\n A-->B\n```\n\nAfter','Diagram',DEFAULT_SETTINGS,undefined,async code=>{sources.push(code);return {data:png};});
  const x=await xml(r);assert.deepEqual(sources,['flowchart LR\n A-->B']);assert.equal(r.warnings.length,0);
  assert.match(x.document,/<w:drawing>/);assert.ok(x.document.indexOf('Before')<x.document.indexOf('<w:drawing>'));assert.ok(x.document.indexOf('<w:drawing>')<x.document.indexOf('After'));
  assert.doesNotMatch(x.document,/flowchart LR|A--/);assert.match(x.document,/w:pStyle w:val="Image"/);
});
test('one broken Mermaid keeps its source and does not prevent later charts',async()=>{
  const r=await exportMarkdown('```mermaid\nbad chart\n```\n\n```mermaid\nflowchart LR\n A-->B\n```','Partial',DEFAULT_SETTINGS,undefined,async s=>{if(s.startsWith('bad'))throw new Error('Invalid diagram');return {data:png};});
  const x=await xml(r);assert.match(x.document,/bad chart/);assert.equal((x.document.match(/<w:drawing>/g)||[]).length,1);assert.equal(r.warnings[0].code,'mermaid');
});
test('unavailable or invalid Mermaid output falls back visibly',async()=>{
  for(const renderer of [undefined,async()=>({data:new Uint8Array([1,2,3])})]) {
    const r=await exportMarkdown('```mermaid\nflowchart LR\n A-->B\n```','Fallback',DEFAULT_SETTINGS,undefined,renderer);
    assert.match((await xml(r)).document,/flowchart LR/);assert.equal(r.warnings[0].code,'mermaid');
  }
});
test('Markdown and wiki image width hints preserve proportions',async()=>{
  const r=await exportMarkdown('![Plan|300](x.png)\n\n![[x.png|300x100]]','Sizes',DEFAULT_SETTINGS,async()=>({data:png}));
  const x=await xml(r);assert.equal(r.warnings.length,0);
  const extents=[...x.document.matchAll(/<wp:extent cx="(\d+)" cy="(\d+)"/g)];
  assert.equal(extents.length,2);for(const e of extents){assert.equal(Number(e[1]),300*9525);assert.equal(Number(e[2]),66*9525);}
  assert.match(x.document,/descr="Plan"/);assert.doesNotMatch(x.document,/descr="Plan\|300"/);
});
test('image-only paragraphs have no body indent and table images fit their cells',async()=>{
  const r=await exportMarkdown('![Plan](x.png)\n\n| Picture | Text |\n|---|---|\n| ![Small](x.png) | Yes |','Layout',DEFAULT_SETTINGS,async()=>({data:png}));
  const x=await xml(r);assert.match(x.document,/w:pStyle w:val="Image"/);
  const widths=[...x.document.matchAll(/<wp:extent cx="(\d+)"/g)].map(m=>Number(m[1])/9525);
  assert.deepEqual(widths,[600,286]);
  const styles=await x.zip.file('word/styles.xml')!.async('string');assert.match(styles.match(/<w:style[^>]*w:styleId="Image"[\s\S]*?<\/w:style>/)![0],/w:firstLineChars="0"/);
});
test('high-resolution diagram PNGs use logical display dimensions',async()=>{
  const r=await exportMarkdown('```mermaid\ngraph LR\nA-->B\n```','HiDPI',DEFAULT_SETTINGS,undefined,async()=>({data:png,displayWidth:400,displayHeight:88}));
  assert.match((await xml(r)).document,new RegExp(`<wp:extent cx="${400*9525}" cy="${88*9525}"`));
});
test('source-relative and percent-encoded local images resolve without network access',async()=>{
  const resolved:string[][]=[];let conversions=0;
  const app={metadataCache:{getFirstLinkpathDest:(link:string,source:string)=>{resolved.push([link,source]);return {extension:link.endsWith('webp')?'webp':'png'};}},vault:{readBinary:async()=>png.buffer.slice(png.byteOffset,png.byteOffset+png.byteLength)}} as unknown as Pick<App,'metadataCache'|'vault'>;
  const resolver=vaultImageResolver(app,'folder/note.md',async data=>{conversions++;return {data};});
  assert.ok(await resolver('../assets/图片%20示例.png#anchor'));assert.deepEqual(resolved[0],['../assets/图片 示例.png','folder/note.md']);
  assert.ok(await resolver('photo.webp'));assert.equal(conversions,1);
  assert.equal(await resolver('https://example.com/a.png'),null);assert.equal(await resolver('file:///secret.svg'),null);assert.equal(resolved.length,2);
});
test('vector conversion failure becomes an image placeholder without losing body content',async()=>{
  const app={metadataCache:{getFirstLinkpathDest:()=>({extension:'svg'})},vault:{readBinary:async()=>png.buffer}} as unknown as Pick<App,'metadataCache'|'vault'>;
  const resolver=vaultImageResolver(app,'note.md',async()=>{throw new Error('Could not convert');});
  const r=await exportMarkdown('![Vector](x.svg)\n\nBody remains','Broken',DEFAULT_SETTINGS,resolver);
  const x=await xml(r);assert.match(x.document,/\[Vector\]/);assert.match(x.document,/Body remains/);assert.equal(r.warnings[0].code,'image');
});
