import mermaidSource from 'mermaid/dist/mermaid.min.js';
import type { ImageAsset } from './exporter';

declare const require: (name: string) => any;
export interface RasterWindow {
  loadURL(url: string): Promise<void>;
  setContentSize(width: number, height: number): void;
  destroy(): void;
  isDestroyed(): boolean;
  webContents: {
    executeJavaScript(code: string): Promise<any>;
    capturePage(rect: {x:number;y:number;width:number;height:number}, options?: {stayHidden:boolean}): Promise<{toPNG(): Uint8Array}>;
    setWindowOpenHandler(handler: () => {action: 'deny'}): void;
  };
}
export type RasterWindowFactory = (options: Record<string, unknown>) => RasterWindow;
const defaultFactory: RasterWindowFactory = options => {
  const electron = require('electron');
  const remote = electron.remote ?? require('@electron/remote');
  return new remote.BrowserWindow(options);
};

// These functions are serialized into a sandboxed renderer. Keep them closure-free.
async function renderInPage(kind: string, source: string, id: string) {
  const stage = document.getElementById('stage')!;
  stage.replaceChildren();
  let element: SVGSVGElement | HTMLImageElement;
  let width: number, height: number;
  if (kind === 'mermaid') {
    if (!source.trim() || source.length > 50000) throw new Error('Empty diagram or source exceeds 50,000 characters');
    let result;
    try {result = await (globalThis as any).mermaid.render(id, source, stage);}
    catch(error) {throw new Error(`Mermaid: ${error instanceof Error ? error.message : String(error)}`);}
    stage.innerHTML = result.svg;
    element = stage.querySelector('svg')!;
    if (!element) throw new Error('Mermaid did not produce an SVG');
    width = element.viewBox.baseVal.width;
    height = element.viewBox.baseVal.height;
    // No event binding: exported diagrams are static pictures.
  } else {
    const img = new Image();
    img.src = source;
    await img.decode();
    element = img;
    stage.append(img);
    width = img.naturalWidth; height = img.naturalHeight;
  }
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new Error('Invalid media dimensions');
  // Rasterize at 2x logical Word size. Large charts fit the page without cropping.
  const scale = Math.min(1, 584 / width, 764 / height);
  width = Math.max(1, Math.ceil(width * scale * 2));
  height = Math.max(1, Math.ceil(height * scale * 2));
  element.style.cssText = `display:block;width:${width}px;height:${height}px;max-width:none;max-height:none`;
  element.setAttribute('width', String(width)); element.setAttribute('height', String(height));
  stage.style.cssText = `width:${width}px;height:${height}px;padding:16px;box-sizing:content-box;background:white;overflow:hidden`;
  await document.fonts.ready;
  return {width:width + 32,height:height + 32};
}

/** One lazily-created, hidden renderer per export; independent of Obsidian's Mermaid settings. */
export class ExportMediaRenderer {
  private window?: RasterWindow;
  private sequence = 0;
  private closed = false;
  constructor(private factory: RasterWindowFactory = defaultFactory, private timeoutMs = 20000) {}

  private async ready() {
    if(this.closed) throw new Error('Media renderer is closed');
    if(this.window && !this.window.isDestroyed()) return this.window;
    const win = this.factory({width:640,height:480,show:false,frame:false,backgroundColor:'#ffffff',
      webPreferences:{sandbox:true,nodeIntegration:false,contextIsolation:true,webSecurity:true,backgroundThrottling:false,partition:`noteport-export-${crypto.randomUUID()}`}});
    this.window = win;
    win.webContents.setWindowOpenHandler(() => ({action:'deny'}));
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; frame-src 'none';"><style>html,body{margin:0;padding:0;background:white;color:black;font-family:Arial,'Microsoft YaHei',sans-serif}</style></head><body><div id="stage"></div></body></html>`;
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    // Keep the navigation URL small. Only our bundled script is injected by the host;
    // note/image content cannot execute scripts under the page's CSP.
    await win.webContents.executeJavaScript(mermaidSource + "\nmermaid.initialize({startOnLoad:false,theme:'default',securityLevel:'strict',suppressErrorRendering:true,fontFamily:'Arial, Microsoft YaHei, sans-serif',maxTextSize:50000,maxEdges:1000,secure:['secure','securityLevel','startOnLoad','maxTextSize','maxEdges','suppressErrorRendering','themeCSS','themeVariables','fontFamily','altFontFamily']});");
    return win;
  }

  private async render(kind: string, source: string): Promise<ImageAsset> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const operation = async () => {
      const win = await this.ready();
      const id = `noteport-diagram-${++this.sequence}`;
      const dimensions = await win.webContents.executeJavaScript(`(${renderInPage.toString()})(${JSON.stringify(kind)},${JSON.stringify(source)},${JSON.stringify(id)})`);
      win.setContentSize(dimensions.width, dimensions.height);
      // Allow Chromium to lay out and paint fonts/foreignObject labels at the final size.
      await win.webContents.executeJavaScript('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
      let image;
      try {image = await win.webContents.capturePage({x:0,y:0,width:dimensions.width,height:dimensions.height},{stayHidden:true});}
      catch(error) {throw new Error(`PNG capture failed: ${error instanceof Error?error.message:String(error)}`);}
      return {data:new Uint8Array(image.toPNG()),displayWidth:dimensions.width / 2,displayHeight:dimensions.height / 2};
    };
    try {
      return await Promise.race([operation(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Media rendering timed out')),this.timeoutMs);})]);
    } catch(error) {
      // A failed renderer must not poison later charts or leak hidden windows.
      this.destroyWindow();
      throw error;
    } finally {if(timer)clearTimeout(timer);}
  }
  renderMermaid = (source: string) => this.render('mermaid',source);
  rasterizeImage = (data: Uint8Array, mime: string) => {
    if(!['image/svg+xml','image/webp'].includes(mime)) throw new Error('Unsupported conversion format');
    if(data.length > 20 * 1024 * 1024) throw new Error('Image exceeds 20 MB conversion limit');
    return this.render('image',`data:${mime};base64,${Buffer.from(data).toString('base64')}`);
  };
  private destroyWindow() {if(this.window && !this.window.isDestroyed())this.window.destroy();this.window=undefined;}
  dispose() {this.closed=true;this.destroyWindow();}
}
