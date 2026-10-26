import { marked, type Token, type Tokens } from 'marked';
import { AlignmentType, Document, ExternalHyperlink, HeadingLevel, ImageRun, LevelFormat, LevelSuffix, Packer, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType, type IRunOptions, type IParagraphOptions } from 'docx';
import sizeOf from 'image-size';
import JSZip from 'jszip';
import type { ExportSettings } from './settings';

export interface ImageAsset { data: Uint8Array; }
export type ImageResolver = (target: string) => Promise<ImageAsset | null>;
export interface ExportWarning { code: 'image' | 'unsupported' | 'duplicate'; detail: string; }
type Inline = TextRun | ExternalHyperlink | ImageRun;
type Block = Paragraph | Table;
const headingStyles = ['Heading1','Heading2','Heading3','Heading4','Heading5','Heading6'];
const headingLevels = [HeadingLevel.HEADING_1,HeadingLevel.HEADING_2,HeadingLevel.HEADING_3,HeadingLevel.HEADING_4,HeadingLevel.HEADING_5,HeadingLevel.HEADING_6];

export function safeFilename(name: string) {
  let clean = name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/[. ]+$/g, '').slice(0, 120) || 'Note';
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(clean)) clean = '_' + clean;
  return clean + '.docx';
}
function decode(text: string): string {
  return text.replace(/&(amp|lt|gt|quot|apos|#39|#\d+|#x[\da-f]+);/gi, (raw, entity: string) => {
    const entities: Record<string,string> = {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",'#39':"'"};
    const key = entity.toLowerCase();
    if (entities[key]) return entities[key];
    const n = key.startsWith('#x') ? parseInt(key.slice(2),16) : parseInt(key.slice(1),10);
    return Number.isFinite(n) && n <= 0x10ffff && n > 0 ? String.fromCodePoint(n) : raw;
  });
}
// A marked inline extension keeps Obsidian links out of code and fenced blocks.
marked.use({extensions:[{name:'wiki',level:'inline',start(src) { return src.search(/!?\[\[/); },tokenizer(src) {
  const m = /^(!?)\[\[([^\]\n]+)\]\]/.exec(src);
  return m ? {type:'wiki',raw:m[0],embed:!!m[1],target:m[2]} : undefined;
}}]});

export async function exportMarkdown(markdown: string, title: string, settings: ExportSettings, resolveImage: ImageResolver = async () => null) {
  const warnings: ExportWarning[] = [];
  const warn = (code: ExportWarning['code'], detail: string) => { if (!warnings.some(w => w.code === code && w.detail === detail)) warnings.push({code,detail}); };
  let listSequence = 0;
  const listConfigs: any[] = [];
  const source = markdown.replace(/^\uFEFF/, '').replace(/^---\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)(?:\r?\n|$)/, '');
  // Formulas are retained as literal source; they are not silently dropped.
  if (/\$[^\n$]+\$|^\s*\$\$/m.test(source)) warn('unsupported', 'LaTeX / $…$');
  if (/\^[a-zA-Z0-9-]+\s*$/m.test(source)) warn('unsupported', 'Obsidian block IDs');
  if (/^\s*\[\^[^\]]+\]:|\[\^[^\]]+\]/m.test(source)) warn('unsupported', 'Footnotes / 脚注');
  async function image(target: string, alt: string, style: IRunOptions = {}): Promise<Inline[]> {
    try {
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(target)) throw new Error('Non-vault image');
      const asset = await resolveImage(target);
      if (!asset) throw new Error('Missing image');
      const dimensions = sizeOf(Buffer.from(asset.data));
      const type = dimensions.type === 'jpg' ? 'jpg' : dimensions.type;
      if (!['png','jpg','gif','bmp'].includes(type ?? '') || !dimensions.width || !dimensions.height) throw new Error('Unsupported image');
      const scale = Math.min(1, 600 / dimensions.width, 780 / dimensions.height);
      return [new ImageRun({data:asset.data, type:type as 'png'|'jpg'|'gif'|'bmp',transformation:{width:Math.round(dimensions.width*scale),height:Math.round(dimensions.height*scale)},altText:{name:alt || target,description:alt || target,title:alt || target}})];
    } catch { warn('image', target); return [new TextRun({...style,text:`[${alt || target}]`})]; }
  }
  async function inlines(tokens: Token[] = [], style: IRunOptions = {}): Promise<Inline[]> {
    const result: Inline[] = [];
    for (const token of tokens) {
      const t = token as any;
      if (t.type === 'wiki') {
        const [target, alias] = (t.target as string).split('|');
        if (t.embed && /\.(?:png|jpe?g|gif|bmp|svg|webp)(?:#.*)?$/i.test(target)) result.push(...await image(target, alias || target, style));
        else { if (t.embed) warn('unsupported', t.raw); result.push(new TextRun({...style,text:alias || target})); }
      } else if (['strong','em','del'].includes(t.type)) {
        result.push(...await inlines(t.tokens,{...style,...(t.type==='strong'?{bold:true}:t.type==='em'?{italics:true}:{strike:true})}));
      } else if (t.type === 'codespan') result.push(new TextRun({...style,text:decode(t.text),font:'Consolas',shading:{type:ShadingType.CLEAR,fill:'F0F2F5'}}));
      else if (t.type === 'br') result.push(new TextRun({...style,break:1}));
      else if (t.type === 'image') result.push(...await image(t.href, t.text, style));
      else if (t.type === 'link') {
        const children = await inlines(t.tokens,{...style,color:'2563A6',underline:{}});
        if (/^(https?:|mailto:)/i.test(t.href)) result.push(new ExternalHyperlink({link:t.href,children}));
        else { result.push(...children); warn('unsupported', `Link kept as text / 链接保留为文字: ${t.href}`); }
      } else if (t.type === 'html') {warn('unsupported', 'HTML'); result.push(new TextRun({...style,text:t.raw}));}
      else if (t.tokens) result.push(...await inlines(t.tokens,style));
      else result.push(new TextRun({...style,text:decode(t.text ?? t.raw ?? '').replace(/\r?\n/g,' ')}));
    }
    return result;
  }
  async function blocks(tokens: Token[], context: {quote?: boolean; cell?: boolean; list?: {ref:string;level:number;first:boolean}} = {}): Promise<Block[]> {
    const result: Block[] = [];
    for (const token of tokens) {
      const t = token as any;
      const list = context.list;
      const paragraphOptions = (): IParagraphOptions => {
        const first=list?.first;
        if(list) list.first=false;
        return {style:context.cell?'TableText':context.quote?'Quote':list?'ListParagraph':'Normal',
          ...(list?{indent:{left:720*(list.level+1),hanging:first?360:0},...(first?{numbering:{reference:list.ref,level:list.level}}:{})}:{})};
      };
      switch(t.type) {
        case 'space': case 'def': break;
        case 'heading': {
          if (settings.numbering && /^\s*(?:\d+(?:\.\d+)*[.、)]?\s+|[一二三四五六七八九十]+[、.])/.test(t.text)) warn('duplicate',t.text);
          result.push(new Paragraph({heading:headingLevels[t.depth-1],...(settings.numbering?{numbering:{reference:'headings',level:t.depth-1}}:{}),children:await inlines(t.tokens)})); break;
        }
        case 'paragraph': case 'text': result.push(new Paragraph({...paragraphOptions(),children:await inlines(t.tokens ?? [{type:'text',raw:t.text,text:t.text}])})); break;
        case 'blockquote': {
          if (/^\[![^\]]+\]/.test(t.text)) warn('unsupported','Callout → quote / 提示块转为引用');
          result.push(...await blocks(t.tokens,{...context,quote:true})); break;
        }
        case 'list': {
          const depth = Math.min((list?.level ?? -1)+1,8);
          const ref = 'list-'+(++listSequence);
          listConfigs.push({reference:ref,levels:Array.from({length:9},(_,i)=>({level:i,format:t.ordered?LevelFormat.DECIMAL:LevelFormat.BULLET,text:t.ordered?`%${i+1}.`:['•','◦','▪'][i%3],start:t.ordered ? Number(t.start) || 1 : 1,style:{paragraph:{indent:{left:720*(i+1),hanging:360}}}}))});
          for (const item of t.items) {
            const itemContext = {ref,level:depth,first:true};
            const itemTokens = item.tokens.map((x:any)=>({...x}));
            if(item.task && itemTokens[0]) {
              const first=itemTokens[0];first.tokens=[{type:'text',raw:'',text:item.checked?'[x] ':'[ ] '},...(first.tokens??[{type:'text',text:first.text,raw:first.text}])];
              warn('unsupported','Task checkbox → static text / 任务框转为静态文字');
            }
            const children = await blocks(itemTokens,{...context,list:itemContext});
            result.push(...children);
          }
          break;
        }
        case 'table': {
          const rows = [t.header,...t.rows];
          const tableRows: TableRow[] = [];
          for (let i=0;i<rows.length;i++) {
            const cells: TableCell[] = [];
            for(let j=0;j<rows[i].length;j++) cells.push(new TableCell({margins:{top:60,bottom:60,left:100,right:100},shading:i===0?{fill:'EDF1F6'}:undefined,children:[new Paragraph({style:'TableText',alignment:t.align[j]=== 'center'?AlignmentType.CENTER:t.align[j]==='right'?AlignmentType.RIGHT:AlignmentType.LEFT,children:await inlines(rows[i][j].tokens,{bold:i===0})})]}));
            tableRows.push(new TableRow({tableHeader:i===0,children:cells}));
          }
          result.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:tableRows})); break;
        }
        case 'code': {
          if (/^(mermaid|dataview|dataviewjs|query|math)$/i.test(t.lang || '')) warn('unsupported',t.lang);
          for(const line of t.text.split('\n')) result.push(new Paragraph({style:'CodeBlock',children:[new TextRun({text:line || ' '})]})); break;
        }
        case 'hr': result.push(new Paragraph({children:[new TextRun('──────────')],style:'TableText'})); break;
        case 'html': warn('unsupported','HTML'); result.push(new Paragraph({style:'CodeBlock',children:[new TextRun(t.raw)]})); break;
        default: if(t.raw) {warn('unsupported',t.type); result.push(new Paragraph({children:[new TextRun(t.raw)]}));}
      }
    }
    return result;
  }
  const children = await blocks(marked.lexer(source,{...marked.defaults,gfm:true,breaks:false}));
  const headingNumbering = {reference:'headings',levels:headingStyles.map((style,i)=>({level:i,format:LevelFormat.DECIMAL,suffix:LevelSuffix.SPACE,text:Array.from({length:i+1},(_,j)=>`%${j+1}`).join('.'),start:1,style:{paragraph:{indent:{left:0,hanging:0}}}}))};
  const doc = new Document({creator:'NotePort',title,description:'Exported from an Obsidian note with NotePort',
    styles:{default:{document:{run:{font:{ascii:'Calibri',hAnsi:'Calibri',eastAsia:'宋体'},size:22,color:'202124'},paragraph:{spacing:{after:120,line:360}}},
      ...Object.fromEntries(headingStyles.map((id,i)=>[`heading${i+1}`,{basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:{ascii:'Calibri',hAnsi:'Calibri',eastAsia:'黑体'},bold:true,size:[36,30,26,24,22,22][i],color:'202124'},paragraph:{outlineLevel:i,keepNext:true,keepLines:true,indent:{firstLine:0,left:0},spacing:{before:i===0?240:200,after:120},...(settings.numbering?{numbering:{reference:'headings',level:i}}:{})}}])),
      listParagraph:{basedOn:'Normal',next:'ListParagraph',paragraph:{indent:{firstLine:0},spacing:{after:60,line:300}}}
    },paragraphStyles:[
      {id:'Normal',name:'Normal',next:'Normal',quickFormat:true,paragraph:{indent:{firstLine:settings.indent?440:0},spacing:{after:120,line:360}}},
      {id:'Quote',name:'Quote',basedOn:'Normal',run:{color:'596579'},paragraph:{indent:{left:480,firstLine:0},spacing:{before:80,after:120}}},
      {id:'CodeBlock',name:'Code Block',basedOn:'Normal',run:{font:'Consolas',size:19},paragraph:{indent:{firstLine:0},spacing:{after:0,line:260},shading:{fill:'F3F5F8',type:ShadingType.CLEAR}}},
      {id:'TableText',name:'Table Text',basedOn:'Normal',paragraph:{indent:{firstLine:0},spacing:{after:80,line:280}}}
    ]},numbering:{config:[...(settings.numbering?[headingNumbering]:[]),...listConfigs]},
    sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1440,bottom:1440,left:1440,right:1440}}},children:children.length?children:[new Paragraph('')]}]});
  // docx 9.6 has no public option for numbering-level pStyle or character indents.
  // Patch only our own generated XML, keeping both sides of the heading binding.
  const zip=await JSZip.loadAsync(await Packer.toBuffer(doc));
  let styleXml=await zip.file('word/styles.xml')!.async('string');
  // A numbering reference on a style makes docx inject a nested ListParagraph pStyle.
  // This is inappropriate inside a style definition and confuses Word inheritance.
  styleXml=styleXml.replace(/<w:style\b[^>]*w:styleId="Heading[1-6]"[\s\S]*?<\/w:style>/g,s=>s.replace('<w:pStyle w:val="ListParagraph"/>',''));
  if(settings.indent) styleXml=styleXml.replace('w:firstLine="440"','w:firstLineChars="200"');
  styleXml=styleXml.replace(/w:firstLine="0"/g,'w:firstLine="0" w:firstLineChars="0"');
  zip.file('word/styles.xml',styleXml);
  if(settings.numbering) {
    const xml=await zip.file('word/numbering.xml')!.async('string');
    zip.file('word/numbering.xml',xml.replace(/<w:abstractNum\b[\s\S]*?<\/w:abstractNum>/g,abstract=>{
      if(!abstract.includes('<w:lvlText w:val="%1"/>'))return abstract;
      return abstract.replace(/<w:lvl\b[^>]*w:ilvl="(\d+)"[\s\S]*?<\/w:lvl>/g,(level,i)=>level.replace(/(<w:numFmt[^>]*\/>)/,`$1<w:pStyle w:val="Heading${Number(i)+1}"/>`));
    }));
  }
  return {buffer:await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}),warnings};
}
