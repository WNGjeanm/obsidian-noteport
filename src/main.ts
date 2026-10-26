import { Plugin, PluginSettingTab, App, Setting, Modal, Notice, MarkdownView, TFile, getLanguage, type Command } from 'obsidian';
import { DEFAULT_SETTINGS, settingsFrom, type ExportSettings } from './settings';
import { strings } from './i18n';
import { exportMarkdown, safeFilename, type ExportWarning } from './exporter';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

declare const require: (id: string) => any;
function desktop() {
  const electron = require('electron');
  return { shell:electron.shell, dialog:(electron.remote ?? require('@electron/remote')).dialog };
}

export default class NotePort extends Plugin {
  settings: ExportSettings = {...DEFAULT_SETTINGS};
  command?: Command;
  ribbon?: HTMLElement;
  get t() { return strings(this.settings.language,getLanguage()); }
  async onload() {
    this.settings=settingsFrom(await this.loadData());
    this.command=this.addCommand({id:'export-word',name:this.t.export,checkCallback:checking=>{
      const file=this.app.workspace.getActiveFile();
      const valid=file?.extension==='md';
      if(!checking && valid) this.openExport();
      return !!valid;
    }});
    this.ribbon=this.addRibbonIcon('file-output',this.t.export,()=>this.openExport());
    this.registerEvent(this.app.workspace.on('file-menu',(menu,file)=>{
      if(file instanceof TFile && file.extension==='md' && file.path===this.app.workspace.getActiveFile()?.path) menu.addItem(item=>item.setTitle(this.t.export).setIcon('file-output').onClick(()=>this.openExport()));
    }));
    this.addSettingTab(new NotePortSettings(this.app,this));
  }
  async saveSettings() {
    await this.saveData(this.settings);
    if(this.command) this.command.name=`${this.manifest.name}: ${this.t.export}`;
    this.ribbon?.setAttribute('aria-label',this.t.export);
  }
  openExport() {
    const file=this.app.workspace.getActiveFile();
    if(!file || file.extension!=='md') {new Notice(this.t.noNote);return;}
    // Capture the editor now, before the modal changes focus.
    const view=this.app.workspace.getActiveViewOfType(MarkdownView);
    const editor=this.app.workspace.activeEditor;
    const content=view?.file?.path===file.path ? view.editor.getValue() : editor?.file?.path===file.path ? editor.editor?.getValue() : undefined;
    new ExportModal(this,file,content).open();
  }
}

function optionSettings(container:HTMLElement,plugin:NotePort,settings:ExportSettings,onChange:()=>void) {
  const t=plugin.t;
  new Setting(container).setName(t.numbering).setDesc(t.numberingDesc).addToggle(toggle=>toggle.setValue(settings.numbering).onChange(value=>{settings.numbering=value;onChange();}));
  new Setting(container).setName(t.indent).setDesc(t.indentDesc).addDropdown(drop=>drop.addOption('two',t.two).addOption('none',t.none).setValue(settings.indent?'two':'none').onChange(value=>{settings.indent=value==='two';onChange();}));
}
class NotePortSettings extends PluginSettingTab {
  constructor(app:App,private plugin:NotePort) {super(app,plugin);}
  display() {
    const el=this.containerEl; el.empty();el.addClass('noteport-settings');
    el.createEl('h2',{text:'笔呈 · NotePort'});el.createEl('p',{text:this.plugin.t.intro,cls:'setting-item-description'});
    new Setting(el).setName(this.plugin.t.language).setDesc(this.plugin.t.languageDesc).addDropdown(drop=>drop.addOption('auto',this.plugin.t.auto).addOption('zh','简体中文').addOption('en','English').setValue(this.plugin.settings.language).onChange(async value=>{this.plugin.settings.language=value as ExportSettings['language'];await this.plugin.saveSettings();this.display();}));
    optionSettings(el,this.plugin,this.plugin.settings,()=>{void this.plugin.saveSettings();});
    el.createEl('p',{text:this.plugin.t.limited,cls:'noteport-footnote'});
  }
}
class ExportModal extends Modal {
  private options:ExportSettings;
  private busy=false;
  constructor(private plugin:NotePort,private file:TFile,private editorContent?:string) {super(plugin.app);this.options={...plugin.settings};}
  onOpen() {this.render();}
  onClose() {this.contentEl.empty();}
  render() {
    const el=this.contentEl,t=this.plugin.t;el.empty();el.addClass('noteport-dialog');
    el.createEl('div',{text:'NOTEPORT  /  WORD EXPORT',cls:'noteport-eyebrow'});
    el.createEl('h2',{text:t.ready});el.createEl('p',{text:t.summary,cls:'noteport-subtitle'});
    const card=el.createDiv({cls:'noteport-file'});card.createSpan({text:'MD',cls:'noteport-file-icon'});
    const info=card.createDiv();info.createEl('strong',{text:this.file.basename});info.createDiv({text:'.md → .docx',cls:'noteport-file-meta'});
    optionSettings(el,this.plugin,this.options,()=>{});
    el.createEl('p',{text:t.limited,cls:'noteport-footnote'});
    const actions=el.createDiv({cls:'noteport-actions'});
    const cancel=actions.createEl('button',{text:t.cancel});cancel.onclick=()=>this.close();
    const save=actions.createEl('button',{text:t.save,cls:'mod-cta'});
    save.onclick=async()=>{
      if(this.busy)return;
      this.busy=true;save.disabled=true;cancel.disabled=true;save.textContent=t.busy;
      try {
        const text=this.editorContent ?? await this.app.vault.read(this.file);
        const result=await exportMarkdown(text,this.file.basename,this.options,async target=>{
          let link=target.split('#')[0];try{link=decodeURIComponent(link);}catch{}
          const image=this.app.metadataCache.getFirstLinkpathDest(link,this.file.path);
          if(!image || image.extension==='md')return null;
          return {data:new Uint8Array(await this.app.vault.readBinary(image))};
        });
        const {dialog}=desktop();
        const chosen=await dialog.showSaveDialog({title:t.ready,defaultPath:safeFilename(this.file.basename),filters:[{name:'Word document',extensions:['docx']}],properties:['createDirectory','showOverwriteConfirmation']});
        if(chosen.canceled || !chosen.filePath)return;
        const destination=/\.docx$/i.test(chosen.filePath)?chosen.filePath:chosen.filePath+'.docx';
        // The native dialog confirms replacement. Never write anything into the source note.
        await writeFile(destination,result.buffer);
        this.plugin.settings.numbering=this.options.numbering;this.plugin.settings.indent=this.options.indent;await this.plugin.saveSettings();
        this.close();new ResultModal(this.plugin,destination,result.warnings).open();
      } catch(error) {new Notice(`${t.failed}: ${error instanceof Error?error.message:String(error)}`,10000);}
      finally {this.busy=false;save.disabled=false;cancel.disabled=false;save.textContent=t.save;}
    };
  }
}
class ResultModal extends Modal {
  constructor(private plugin:NotePort,private destination:string,private warnings:ExportWarning[]) {super(plugin.app);}
  onOpen() {
    const el=this.contentEl,t=this.plugin.t;el.addClass('noteport-dialog');
    el.createEl('div',{text:'NOTEPORT  /  DOCX',cls:'noteport-eyebrow'});el.createEl('h2',{text:t.success});
    el.createEl('p',{text:t.saved,cls:'noteport-subtitle'});el.createEl('code',{text:this.destination,cls:'noteport-path'});
    if(this.warnings.length) {
      el.createEl('h3',{text:`${t.warnings} · ${this.warnings.length} ${t.count}`});el.createEl('p',{text:t.warningIntro,cls:'noteport-footnote'});
      const ul=el.createEl('ul',{cls:'noteport-warnings'});
      for(const w of this.warnings) ul.createEl('li',{text:w.code==='duplicate'?`${t.duplicate} ${w.detail}`:`${w.code==='image'?t.image:t.unsupported}: ${w.detail}`});
    }
    const actions=el.createDiv({cls:'noteport-actions'});
    const folder=actions.createEl('button',{text:t.folder});folder.onclick=()=>desktop().shell.showItemInFolder(this.destination);
    const open=actions.createEl('button',{text:t.open,cls:'mod-cta'});open.onclick=()=>{void desktop().shell.openPath(this.destination);};
    const done=actions.createEl('button',{text:t.close});done.onclick=()=>this.close();
  }
  onClose(){this.contentEl.empty();}
}
