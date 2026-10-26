import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {exportMarkdown} from '../src/exporter';
import {DEFAULT_SETTINGS} from '../src/settings';
const root=resolve('examples');
const md=await readFile(resolve(root,'示例笔记.md'),'utf8');
for(const numbering of [false,true]) {
  const result=await exportMarkdown(md,'城市阅读空间改进计划',{...DEFAULT_SETTINGS,numbering},async target=>{
    const p=resolve(root,target);if(!p.startsWith(root+'/')&&!p.startsWith(root+'\\'))return null;
    try{return {data:await readFile(p)};}catch{return null;}
  });
  await writeFile(resolve(root,numbering?'sample-numbered.docx':'sample.docx'),result.buffer);
  console.log(numbering?'numbered':'plain',result.warnings);
}
