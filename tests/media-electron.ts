import {app,BrowserWindow} from 'electron';
import assert from 'node:assert/strict';
import {writeFile,readFile,mkdir} from 'node:fs/promises';
import sizeOf from 'image-size';
import JSZip from 'jszip';
import {ExportMediaRenderer,type RasterWindowFactory} from '../src/media-renderer';
import {exportMarkdown} from '../src/exporter';
import {DEFAULT_SETTINGS} from '../src/settings';

app.disableHardwareAcceleration();
app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
  const windows:BrowserWindow[]=[];
  const factory:RasterWindowFactory=options=>{const win=new BrowserWindow(options);windows.push(win);return win;};
  const renderer=new ExportMediaRenderer(factory);
  try {
    await mkdir('work/media',{recursive:true});
    const diagrams={
      flowchart:'flowchart LR\n A[接收材料] --> B{核对完整性}\n B -->|完整| C[生成文档]\n B -->|缺失| D[补充材料]',
      sequence:'sequenceDiagram\n participant N as 笔记\n participant W as Word\n N->>W: 导出图文\n W-->>N: 完成',
      state:'stateDiagram-v2\n [*] --> Draft\n Draft --> Reviewed: Review\n Reviewed --> [*]',
      html:'flowchart TD\n A["第一行<br/>第二行"] --> B["English and 中文"]',
      mindmap:'mindmap\n root((项目计划))\n   需求\n   实施\n   验收',
    };
    const results:any[]=[];
    for(const [name,source] of Object.entries(diagrams)) {
      console.log('Rendering',name);
      const asset=await renderer.renderMermaid(source),d=sizeOf(Buffer.from(asset.data));
      assert.equal(d.type,'png');assert.ok(d.width!>50&&d.height!>50);assert.ok(asset.data.length>2000);assert.ok(asset.displayWidth!<=600&&asset.displayHeight!<=780);
      await writeFile(`work/media/${name}.png`,asset.data);results.push({name,width:d.width,height:d.height,bytes:asset.data.length});
    }
    await assert.rejects(()=>renderer.renderMermaid('not a valid diagram'));
    assert.ok((await renderer.renderMermaid(diagrams.flowchart)).data.length>2000,'a later diagram recovers after failure');
    const svg=await readFile('examples/assets/media-sample.svg');
    const svgAsset=await renderer.rasterizeImage(svg,'image/svg+xml');assert.equal(sizeOf(Buffer.from(svgAsset.data)).type,'png');
    await writeFile('work/media/local-svg.png',svgAsset.data);
    const webp=await readFile('examples/assets/media-sample.webp');
    const webpAsset=await renderer.rasterizeImage(webp,'image/webp');assert.equal(sizeOf(Buffer.from(webpAsset.data)).type,'png');
    await writeFile('work/media/local-webp.png',webpAsset.data);
    const md=await readFile('examples/图文与Mermaid示例.md','utf8');
    const result=await exportMarkdown(md,'图文与 Mermaid 导出验证',{...DEFAULT_SETTINGS,numbering:true},async target=>{
      if(target.endsWith('.svg'))return svgAsset;if(target.endsWith('.webp'))return webpAsset;
      return {data:await readFile('examples/'+decodeURIComponent(target))};
    },renderer.renderMermaid);
    assert.equal(result.warnings.length,0);await writeFile('examples/sample-media.docx',result.buffer);
    const zip=await JSZip.loadAsync(result.buffer);const xml=await zip.file('word/document.xml')!.async('string');
    const pictureCount=(xml.match(/<w:drawing>/g)||[]).length;assert.equal(pictureCount,6);
    assert.doesNotMatch(xml,/flowchart LR|sequenceDiagram/);
    // Strict renderer/CSP blocks egress and has no Node.js access.
    const active=windows[windows.length-1];
    assert.equal(await active.webContents.executeJavaScript('typeof require'),'undefined');
    assert.equal(await active.webContents.executeJavaScript("fetch('https://example.com').then(()=>false,()=>true)"),true);
    let timedOutWindowDestroyed=false;
    const stuck=new ExportMediaRenderer(()=>({loadURL:()=>new Promise(()=>{}),setContentSize:()=>{},destroy:()=>{timedOutWindowDestroyed=true;},isDestroyed:()=>timedOutWindowDestroyed,webContents:{setWindowOpenHandler:()=>{},executeJavaScript:async()=>{},capturePage:async()=>({toPNG:()=>new Uint8Array()})}}),10);
    await assert.rejects(()=>stuck.renderMermaid('flowchart LR\n A-->B'),/timed out/);assert.equal(timedOutWindowDestroyed,true);stuck.dispose();
    const report={electron:process.versions.electron,diagrams:results,pictureCount,checks:['five diagram types including Chinese/HTML labels','invalid source recovery','SVG/WebP conversion','mixed DOCX contains six pictures','sandbox has no Node access','network blocked','timeout destroys window']};
    await writeFile('work/media-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  }finally{renderer.dispose();assert.equal(windows.filter(w=>!w.isDestroyed()).length,0,'no leaked windows');}
  app.exit(0);
}).catch(e=>{console.error(e);app.exit(1);});
