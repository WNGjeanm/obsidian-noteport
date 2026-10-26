import type { Language } from './i18n';
export interface ExportSettings { language: Language; numbering: boolean; indent: boolean; }
export const DEFAULT_SETTINGS: ExportSettings = { language: 'auto', numbering: false, indent: true };
export function settingsFrom(value: unknown): ExportSettings {
  const x = (value && typeof value === 'object' ? value : {}) as Partial<ExportSettings>;
  return { language: ['auto','zh','en'].includes(x.language as string) ? x.language! : 'auto', numbering: x.numbering === true, indent: x.indent !== false };
}
