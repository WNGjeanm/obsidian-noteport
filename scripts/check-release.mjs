import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import JSZip from 'jszip';
const manifest=JSON.parse(await readFile('manifest.json','utf8'));
const pkg=JSON.parse(await readFile('package.json','utf8'));
const versions=JSON.parse(await readFile('versions.json','utf8'));
if(pkg.version!==manifest.version||versions[manifest.version]!==manifest.minAppVersion)throw new Error('Version mismatch');
const zip=await JSZip.loadAsync(await readFile(`dist/noteport-${manifest.version}.zip`));
const allowed=['main.js','manifest.json','styles.css','LICENSE','THIRD_PARTY_NOTICES.md'];
for(const name of Object.keys(zip.files).filter(n=>!zip.files[n].dir))if(!allowed.includes(name.replace(/^noteport\//,''))||!name.startsWith('noteport/'))throw new Error('Unexpected ZIP entry '+name);
for(const name of allowed) {
  const original=await readFile(name),installed=await zip.file('noteport/'+name).async('nodebuffer');
  if(!original.equals(installed)||(await readFile('dist/'+name)).compare(original))throw new Error('Asset mismatch '+name);
}
for(const line of (await readFile('dist/SHA256SUMS.txt','utf8')).trim().split('\n')) {
  const [expected,name]=line.split('  ');
  if(createHash('sha256').update(await readFile('dist/'+name)).digest('hex')!==expected)throw new Error('Checksum mismatch '+name);
}
async function checkDocs(folder) {
  for(const entry of await readdir(folder,{withFileTypes:true})) {
    if(['node_modules','.git','dist'].includes(entry.name))continue;
    const p=resolve(folder,entry.name);
    if(entry.isDirectory()){await checkDocs(p);continue;}
    if(!p.endsWith('.md'))continue;
    const content=(await readFile(p,'utf8')).replace(/```[\s\S]*?```/g,'').replace(/<!--[\s\S]*?-->/g,'');
    for(const match of content.matchAll(/\]\(([^)]+)\)/g)) {
      const href=match[1];if(/^(?:https?:|mailto:|#)/.test(href))continue;
      await stat(resolve(dirname(p),decodeURIComponent(href.split('#')[0])));
    }
  }
}
await checkDocs('.');
console.log('Release checks passed: versions, ZIP allowlist, asset bytes, checksums, and documentation links.');
