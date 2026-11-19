import type { App } from 'obsidian';
import type { ImageAsset, ImageResolver } from './exporter';

export function vaultImageResolver(app: Pick<App,'metadataCache'|'vault'>, sourcePath: string,
  rasterize: (data:Uint8Array,mime:string)=>Promise<ImageAsset>): ImageResolver {
  return async target => {
    if(/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(target))return null;
    let link=target.split('#')[0];
    try {link=decodeURIComponent(link);} catch {}
    const file=app.metadataCache.getFirstLinkpathDest(link,sourcePath);
    if(!file || file.extension.toLowerCase()==='md')return null;
    const data=new Uint8Array(await app.vault.readBinary(file));
    const mime:Record<string,string>={svg:'image/svg+xml',webp:'image/webp'};
    return mime[file.extension.toLowerCase()] ? rasterize(data,mime[file.extension.toLowerCase()]) : {data};
  };
}
